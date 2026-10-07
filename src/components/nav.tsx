'use client'

import Link from 'next/link'
import { useSession, signOut } from '@/lib/auth-client'

export function Nav() {
  const { data: session } = useSession()
  const role = session?.user?.role

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-xl text-forest">
          Willowbrook <span className="text-amber">Veterinary</span>
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          <Link href="/book" className="hover:text-amber">
            Book a visit
          </Link>

          {session && role !== 'staff' && role !== 'admin' && (
            <>
              <Link href="/pets" className="hover:text-amber">
                My pets
              </Link>
              <Link href="/appointments" className="hover:text-amber">
                My appointments
              </Link>
            </>
          )}

          {(role === 'staff' || role === 'admin') && (
            <>
              <Link href="/admin/slots" className="hover:text-amber">
                Manage slots
              </Link>
              <Link href="/admin/appointments" className="hover:text-amber">
                All appointments
              </Link>
            </>
          )}

          {role === 'admin' && (
            <Link href="/admin/staff" className="hover:text-amber">
              Staff accounts
            </Link>
          )}

          {session ? (
            <button
              onClick={() => signOut()}
              className="rounded-full border border-border px-4 py-1.5 hover:border-forest"
            >
              Sign out
            </button>
          ) : (
            <>
              <Link href="/login" className="hover:text-amber">
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-forest px-4 py-1.5 text-canvas hover:bg-forest-light"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
