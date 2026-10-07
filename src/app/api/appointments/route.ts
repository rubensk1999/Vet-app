import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { Prisma } from '@/generated/prisma'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { bookAppointment, SlotUnavailableError } from '@/lib/appointments'

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  const body = await req.json()

  const {
    time_slot_id,
    pet_id,
    reason,
    guest_name,
    guest_email,
    guest_phone,
  } = body

  if (!time_slot_id || !reason) {
    return NextResponse.json(
      { error: 'time_slot_id and reason are required.' },
      { status: 400 }
    )
  }

  const isLoggedIn = !!session
  if (!isLoggedIn && (!guest_name || !guest_email || !guest_phone)) {
    return NextResponse.json(
      { error: 'Guest bookings require name, email, and phone.' },
      { status: 400 }
    )
  }

  try {
    const appointment = await bookAppointment({
      time_slot_id,
      reason,
      user_id: isLoggedIn ? session!.user.id : null,
      pet_id: isLoggedIn ? pet_id ?? null : null,
      guest_name: isLoggedIn ? null : guest_name,
      guest_email: isLoggedIn ? null : guest_email,
      guest_phone: isLoggedIn ? null : guest_phone,
    })

    return NextResponse.json(appointment)
  } catch (err) {
    if (err instanceof SlotUnavailableError) {
      return NextResponse.json(
        { error: 'That time slot was just taken. Please pick another.' },
        { status: 409 }
      )
    }
    // Unique constraint violation from a genuine race condition.
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      return NextResponse.json(
        { error: 'That time slot was just taken. Please pick another.' },
        { status: 409 }
      )
    }
    console.error(err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  const role = session?.user?.role

  // Staff/admin see all appointments; customers see only their own.
  if (role === 'staff' || role === 'admin') {
    const appointments = await prisma.appointment.findMany({
      include: { time_slot: true, pet: true, user: true },
      orderBy: { created_at: 'desc' },
    })
    return NextResponse.json(appointments)
  }

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const appointments = await prisma.appointment.findMany({
    where: { user_id: session.user.id },
    include: { time_slot: true, pet: true },
    orderBy: { created_at: 'desc' },
  })
  return NextResponse.json(appointments)
}
