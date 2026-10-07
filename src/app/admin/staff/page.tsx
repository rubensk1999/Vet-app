'use client'

import { useState } from 'react'

export default function StaffPage() {
  const [msg, setMsg] = useState<{ text: string; error: boolean } | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMsg(null)

    const form = new FormData(e.currentTarget)
    const res = await fetch('/api/admin/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.get('name'),
        email: form.get('email'),
        tempPassword: form.get('tempPassword'),
      }),
    })

    setLoading(false)
    if (res.ok) {
      setMsg({ text: 'Staff account created. Share the temporary password with them directly.', error: false })
      ;(e.target as HTMLFormElement).reset()
    } else {
      const body = await res.json()
      setMsg({ text: body.error ?? 'Could not create that account.', error: true })
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-forest">Staff accounts</h1>
      <p className="mt-2 text-sm text-ink/70">
        Only admins can create staff logins — there&apos;s no public sign-up
        for this role.
      </p>

      <form
        onSubmit={handleCreate}
        className="mt-6 flex max-w-sm flex-col gap-4 rounded-lg border border-border bg-card p-4"
      >
        <Field label="Name" name="name" required />
        <Field label="Email" name="email" type="email" required />
        <Field label="Temporary password" name="tempPassword" type="text" required minLength={8} />

        {msg && (
          <p
            className={`rounded-md px-3 py-2 text-sm ${
              msg.error ? 'bg-danger/10 text-danger' : 'bg-forest/10 text-forest'
            }`}
          >
            {msg.text}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-forest px-4 py-2 text-sm font-medium text-canvas hover:bg-forest-light disabled:opacity-50"
        >
          {loading ? 'Creating…' : 'Create staff account'}
        </button>
      </form>
    </div>
  )
}

function Field({
  label,
  name,
  type = 'text',
  required,
  minLength,
}: {
  label: string
  name: string
  type?: string
  required?: boolean
  minLength?: number
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-ink/80">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        minLength={minLength}
        className="rounded-md border border-border bg-canvas px-3 py-2"
      />
    </label>
  )
}
