'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signUp } from '@/lib/auth-client'

export default function SignupPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const { error } = await signUp.email({
      name: form.get('name') as string,
      email: form.get('email') as string,
      password: form.get('password') as string,
    })

    setLoading(false)
    if (error) {
      setError(error.message ?? 'Something went wrong. Please try again.')
      return
    }
    router.push('/pets')
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="font-display text-3xl text-forest">Create an account</h1>
      <p className="mt-2 text-sm text-ink/70">
        Save your details so booking next time takes ten seconds.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <Field label="Your name" name="name" type="text" required />
        <Field label="Email" name="email" type="email" required />
        <Field label="Password" name="password" type="password" required minLength={8} />

        {error && (
          <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-full bg-forest px-6 py-3 font-medium text-canvas hover:bg-forest-light disabled:opacity-50"
        >
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </div>
  )
}

function Field({
  label,
  name,
  type,
  required,
  minLength,
}: {
  label: string
  name: string
  type: string
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
        className="rounded-md border border-border bg-card px-3 py-2 outline-none focus:border-forest"
      />
    </label>
  )
}
