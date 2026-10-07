import { prisma } from './prisma'

export type BookingInput = {
  time_slot_id: string
  reason: string
  user_id: string | null
  pet_id: string | null
  guest_name: string | null
  guest_email: string | null
  guest_phone: string | null
}

export class SlotUnavailableError extends Error {
  constructor() {
    super('That time slot is no longer available.')
    this.name = 'SlotUnavailableError'
  }
}

/**
 * Books an appointment against a time slot atomically: checks the slot
 * is available, marks it booked, and creates the appointment, all in
 * one transaction. The @unique constraint on Appointment.time_slot_id
 * is the real safety net under true concurrency — this function is
 * what turns that DB-level rejection into a clean, expected error
 * instead of a raw constraint-violation reaching the caller.
 */
export async function bookAppointment(input: BookingInput) {
  return prisma.$transaction(async (tx) => {
    const slot = await tx.timeSlot.findUnique({
      where: { id: input.time_slot_id },
    })

    if (!slot || slot.status !== 'available') {
      throw new SlotUnavailableError()
    }

    await tx.timeSlot.update({
      where: { id: input.time_slot_id },
      data: { status: 'booked' },
    })

    return tx.appointment.create({ data: input })
  })
}
