import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Public: anyone booking (guest or logged-in) needs to see open slots.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date')

  const slots = await prisma.timeSlot.findMany({
    where: {
      status: 'available',
      ...(date ? { date: new Date(date) } : {}),
    },
    orderBy: { start_time: 'asc' },
  })

  return NextResponse.json(slots)
}

// Staff/admin only: generate new slots.
export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  const role = session?.user?.role
  if (!session || (role !== 'staff' && role !== 'admin')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { date, start_time, end_time } = body

  if (!date || !start_time || !end_time) {
    return NextResponse.json(
      { error: 'date, start_time, and end_time are required.' },
      { status: 400 }
    )
  }

  const slot = await prisma.timeSlot.create({
    data: { date: new Date(date), start_time, end_time },
  })

  return NextResponse.json(slot)
}
