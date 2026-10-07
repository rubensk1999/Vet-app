'use client'

import { useEffect, useState } from 'react'
import { useSession } from '@/lib/auth-client'

type Slot = {
  id: string
  date: string
  start_time: string
  end_time: string
}

type Pet = {
  id: string
  name: string
  species: string
}

export default function BookPage() {
  const { data: session } = useSession()
  const [slots, setSlots] = useState<Slot[]>([])
  const [pets, setPets] = useState<Pet[]>([])
  const [selected, setSelected] = useState<Slot | null>(null)
  const [status, setStatus] = useState<'idle' | 'booking' | 'booked' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    fetch('/api/slots')
      .then((r) => r.json())
      .then(setSlots)
  }, [status])

  useEffect(() => {
    if (!session) return
    fetch('/api/pets')
      .then((r) => r.json())
      .then(setPets)
  }, [session])

  async function handleBook(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!selected) return
    setStatus('booking')
    setErrorMsg('')

    const form = new FormData(e.currentTarget)
    const payload: Record<string, string> = {
      time_slot_id: selected.id,
      reason: form.get('reason') as string,
    }

    if (session) {
      const petId = form.get('pet_id') as string
      if (petId) payload.pet_id = petId
    } else {
      payload.guest_name = form.get('guest_name') as string
      payload.guest_email = form.get('guest_email') as string
      payload.guest_phone = form.get('guest_phone') as string
    }

    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const body = await res.json()
      setErrorMsg(body.error || 'Could not book that slot.')
      setStatus('error')
      setSelected(null)
      return
    }

    setStatus('booked')
  }

  if (status === 'booked') {
    return (
      <div className="mx-auto max-w-sm text-center">
        <h1 className="font-display text-3xl text-forest">You&apos;re booked</h1>
        <p className="mt-2 text-ink/70">
          We&apos;ll see you and your pet then. A confirmation was sent to
          your email.
        </p>
      </div>
    )
  }

  const grouped = groupByDate(slots)

  return (
    <div>
      <h1 className="font-display text-3xl text-forest">Book an appointment</h1>

      {!selected && (
        <>
          {errorMsg && (
            <p className="mt-4 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
              {errorMsg}
            </p>
          )}
          {slots.length === 0 && (
            <p className="mt-6 text-ink/60">
              No open slots right now — check back soon.
            </p>
          )}
          <div className="mt-6 flex flex-col gap-6">
            {Object.entries(grouped).map(([date, daySlots]) => (
              <div key={date}>
                <p className="mb-2 font-mono text-xs uppercase tracking-wide text-clay">
                  {formatDate(date)}
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {daySlots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => setSelected(slot)}
                      className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-left hover:border-amber"
                    >
                      <span className="font-mono text-sm">{slot.start_time}</span>
                      <span className="ticket-perforation h-full w-px" />
                      <span className="font-medium text-forest">Book</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {selected && (
        <form onSubmit={handleBook} className="mt-6 max-w-sm">
          <div className="mb-6 flex items-center justify-between rounded-lg border border-dashed border-clay bg-card px-4 py-3">
            <div>
              <p className="font-mono text-sm text-clay">
                {formatDate(selected.date)} · {selected.start_time}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="text-sm text-ink/50 hover:text-ink"
            >
              Change
            </button>
          </div>

          {session ? (
            <label className="mb-4 flex flex-col gap-1.5 text-sm">
              <span className="text-ink/80">Which pet?</span>
              <select
                name="pet_id"
                className="rounded-md border border-border bg-card px-3 py-2"
              >
                <option value="">Describe below instead</option>
                {pets.map((pet) => (
                  <option key={pet.id} value={pet.id}>
                    {pet.name} ({pet.species})
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <div className="mb-4 flex flex-col gap-4">
              <TextField label="Your name" name="guest_name" required />
              <TextField label="Email" name="guest_email" type="email" required />
              <TextField label="Phone" name="guest_phone" type="tel" required />
            </div>
          )}

          <label className="mb-6 flex flex-col gap-1.5 text-sm">
            <span className="text-ink/80">What&apos;s going on?</span>
            <textarea
              name="reason"
              required
              rows={3}
              className="rounded-md border border-border bg-card px-3 py-2"
            />
          </label>

          <button
            type="submit"
            disabled={status === 'booking'}
            className="rounded-full bg-amber px-6 py-3 font-medium text-white hover:bg-amber-dark disabled:opacity-50"
          >
            {status === 'booking' ? 'Booking…' : 'Confirm appointment'}
          </button>
        </form>
      )}
    </div>
  )
}

function TextField({
  label,
  name,
  type = 'text',
  required,
}: {
  label: string
  name: string
  type?: string
  required?: boolean
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-ink/80">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        className="rounded-md border border-border bg-card px-3 py-2"
      />
    </label>
  )
}

function groupByDate(slots: Slot[]) {
  return slots.reduce<Record<string, Slot[]>>((acc, slot) => {
    const key = slot.date.slice(0, 10)
    acc[key] = acc[key] ? [...acc[key], slot] : [slot]
    return acc
  }, {})
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}
