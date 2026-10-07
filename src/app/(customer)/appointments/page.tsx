'use client'

import { useEffect, useState } from 'react'

type Appointment = {
  id: string
  reason: string
  status: string
  time_slot: { date: string; start_time: string }
  pet: { name: string } | null
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])

  useEffect(() => {
    fetch('/api/appointments')
      .then((r) => r.json())
      .then(setAppointments)
  }, [])

  return (
    <div>
      <h1 className="font-display text-3xl text-forest">My appointments</h1>

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
                {appt.pet ? `${appt.pet.name} — ` : ''}
                {appt.reason}
              </p>
            </div>
            <StatusBadge status={appt.status} />
          </div>
        ))}
        {appointments.length === 0 && (
          <p className="text-ink/60">No appointments booked yet.</p>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    requested: 'bg-amber/15 text-amber-dark',
    confirmed: 'bg-forest/10 text-forest',
    completed: 'bg-ink/10 text-ink/60',
    cancelled: 'bg-danger/10 text-danger',
  }
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${styles[status] ?? ''}`}>
      {status}
    </span>
  )
}
