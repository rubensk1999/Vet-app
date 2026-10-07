import { describe, it, expect, vi, beforeEach } from 'vitest'
import { bookAppointment, SlotUnavailableError } from './appointments'
import { prisma } from './prisma'

// We mock Prisma entirely — this test is about the BOOKING LOGIC
// (check slot -> mark booked -> create appointment, all-or-nothing),
// not about whether Postgres itself works. The transaction-safety
// guarantee this logic depends on (the @unique constraint) is a
// schema-level fact, verified separately by the integration checklist
// in sanity-check.sh against a real database.
vi.mock('./prisma', () => ({
  prisma: {
    $transaction: vi.fn(),
  },
}))

const baseInput = {
  time_slot_id: 'slot_1',
  reason: 'Annual checkup',
  user_id: 'user_1',
  pet_id: 'pet_1',
  guest_name: null,
  guest_email: null,
  guest_phone: null,
}

function mockTx(overrides: {
  slot: { status: string } | null
  createReturn?: unknown
}) {
  const tx = {
    timeSlot: {
      findUnique: vi.fn().mockResolvedValue(overrides.slot),
      update: vi.fn().mockResolvedValue({}),
    },
    appointment: {
      create: vi.fn().mockResolvedValue(overrides.createReturn ?? { id: 'appt_1' }),
    },
  }
  vi.mocked(prisma.$transaction).mockImplementation(
    // @ts-expect-error - simplified mock, we only need the callback form
    async (callback) => callback(tx)
  )
  return tx
}

describe('bookAppointment', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('books an available slot and marks it booked', async () => {
    const tx = mockTx({ slot: { status: 'available' } })

    const result = await bookAppointment(baseInput)

    expect(tx.timeSlot.update).toHaveBeenCalledWith({
      where: { id: 'slot_1' },
      data: { status: 'booked' },
    })
    expect(tx.appointment.create).toHaveBeenCalledWith({ data: baseInput })
    expect(result).toEqual({ id: 'appt_1' })
  })

  it('rejects booking when the slot is already booked', async () => {
    const tx = mockTx({ slot: { status: 'booked' } })

    await expect(bookAppointment(baseInput)).rejects.toThrow(SlotUnavailableError)
    expect(tx.timeSlot.update).not.toHaveBeenCalled()
    expect(tx.appointment.create).not.toHaveBeenCalled()
  })

  it('rejects booking when the slot does not exist', async () => {
    mockTx({ slot: null })

    await expect(bookAppointment(baseInput)).rejects.toThrow(SlotUnavailableError)
  })

  it('never creates an appointment without first booking the slot', async () => {
    // Regression guard: the update and create must happen inside the
    // same transaction callback, in that order — this is what makes
    // "check then book" atomic instead of a TOCTOU race.
    const tx = mockTx({ slot: { status: 'available' } })
    const callOrder: string[] = []
    tx.timeSlot.update.mockImplementation(async () => {
      callOrder.push('update')
      return {}
    })
    tx.appointment.create.mockImplementation(async () => {
      callOrder.push('create')
      return { id: 'appt_1' }
    })

    await bookAppointment(baseInput)

    expect(callOrder).toEqual(['update', 'create'])
  })
})
