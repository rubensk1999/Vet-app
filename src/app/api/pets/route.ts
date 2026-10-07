import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const pets = await prisma.pet.findMany({
    where: { user_id: session.user.id },
  })
  return NextResponse.json(pets)
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name, species, breed, birth_date, notes } = body

  if (!name || !species) {
    return NextResponse.json(
      { error: 'Name and species are required.' },
      { status: 400 }
    )
  }

  const pet = await prisma.pet.create({
    data: {
      user_id: session.user.id,
      name,
      species,
      breed,
      birth_date: birth_date ? new Date(birth_date) : undefined,
      notes,
    },
  })

  return NextResponse.json(pet)
}
