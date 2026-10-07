'use client'

import { useEffect, useState } from 'react'

type Appointment = {
  id: string
  reason: string
  status: string
  guest_name: string | null
  time_slot: { date: string; start_time: string }
  pet: { name: string } | null
  user: { name: string } | null
}

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])

  useEffect(() => {
    fetch('/api/appointments')
      .then((r) => r.json())
      .then(setAppointments)
  }, [])

  return (
    <div>
      <h1 className="font-display text-3xl text-forest">All appointments</h1>

      <div className="mt-6 flex flex-col gap-3">
        {appointments.map((appt) => (
          <div
            key={appt.id}
            className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3"
          >
            <div>
              <p className="font-mono text-sm text-clay">
                {new Date(appt.time_slot.date).toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}{' '}
                · {appt.time_slot.start_time}
              </p>
              <p className="mt-1 text-sm">
                {appt.user?.name ?? appt.guest_name ?? 'Guest'}
                {appt.pet ? ` — ${appt.pet.name}` : ''} — {appt.reason}
              </p>
            </div>
            <span className="rounded-full bg-forest/10 px-3 py-1 text-xs font-medium text-forest">
              {appt.status}
            </span>
          </div>
        ))}
        {appointments.length === 0 && (
          <p className="text-ink/60">No appointments booked yet.</p>
        )}
      </div>
    </div>
  )
}
