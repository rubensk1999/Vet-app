'use client'

import { useEffect, useState } from 'react'

type Slot = {
  id: string
  date: string
  start_time: string
  end_time: string
  status: string
}

export default function SlotsPage() {
  const [slots, setSlots] = useState<Slot[]>([])
  const [msg, setMsg] = useState('')

  function loadSlots() {
    fetch('/api/slots')
      .then((r) => r.json())
      .then(setSlots)
  }

  useEffect(loadSlots, [])

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const res = await fetch('/api/slots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: form.get('date'),
        start_time: form.get('start_time'),
        end_time: form.get('end_time'),
      }),
    })
    if (res.ok) {
      setMsg('Slot added.')
      loadSlots()
      ;(e.target as HTMLFormElement).reset()
    } else {
      setMsg('Could not add that slot.')
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-forest">Manage slots</h1>

      <form
        onSubmit={handleCreate}
        className="mt-6 flex max-w-lg flex-wrap items-end gap-4 rounded-lg border border-border bg-card p-4"
      >
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-ink/80">Date</span>
          <input
            name="date"
            type="date"
            required
            className="rounded-md border border-border bg-canvas px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-ink/80">Start</span>
          <input
            name="start_time"
            type="time"
            required
            className="rounded-md border border-border bg-canvas px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-ink/80">End</span>
          <input
            name="end_time"
            type="time"
            required
            className="rounded-md border border-border bg-canvas px-3 py-2"
          />
        </label>
        <button
          type="submit"
          className="rounded-full bg-forest px-4 py-2 text-sm font-medium text-canvas hover:bg-forest-light"
        >
          Add slot
        </button>
      </form>
      {msg && <p className="mt-2 text-sm text-ink/60">{msg}</p>}

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {slots.map((slot) => (
          <div
            key={slot.id}
            className="rounded-lg border border-border bg-card px-3 py-2 text-center"
          >
            <p className="font-mono text-xs text-clay">
              {new Date(slot.date).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })}
            </p>
            <p className="font-mono text-sm">{slot.start_time}</p>
          </div>
        ))}
        {slots.length === 0 && <p className="text-ink/60">No open slots yet.</p>}
      </div>
    </div>
  )
}
