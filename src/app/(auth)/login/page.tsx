'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from '@/lib/auth-client'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const { error } = await signIn.email({
      email: form.get('email') as string,
      password: form.get('password') as string,
    })

    setLoading(false)
    if (error) {
      setError(error.message ?? 'Invalid email or password.')
      return
    }
    router.push('/')
    router.refresh()
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="font-display text-3xl text-forest">Log in</h1>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-ink/80">Email</span>
          <input
            name="email"
            type="email"
            required
            className="rounded-md border border-border bg-card px-3 py-2 outline-none focus:border-forest"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-ink/80">Password</span>
          <input
            name="password"
            type="password"
            required
            className="rounded-md border border-border bg-card px-3 py-2 outline-none focus:border-forest"
          />
        </label>

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
          {loading ? 'Logging in…' : 'Log in'}
        </button>
      </form>
    </div>
  )
}
