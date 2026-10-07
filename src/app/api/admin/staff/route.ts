import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'

export async function POST(req: Request) {
  const body = await req.json()
  const { name, email, tempPassword } = body

  if (!name || !email || !tempPassword) {
    return NextResponse.json(
      { error: 'Name, email, and a temporary password are required.' },
      { status: 400 }
    )
  }

  try {
    // auth.api.createUser is restricted to sessions whose role is in
    // adminRoles (see lib/auth.ts) — Better Auth enforces that check
    // itself using the request headers, so we don't reimplement it.
    const result = await auth.api.createUser({
      body: {
        name,
        email,
        password: tempPassword,
        role: 'staff',
      },
      headers: await headers(),
    })

    // TODO: email the temp password / invite link to the new staff
    // member instead of returning it, once you wire up an email provider.
    return NextResponse.json(result.user)
  } catch {
    return NextResponse.json(
      { error: 'Forbidden, or a user with that email already exists.' },
      { status: 403 }
    )
  }
}
