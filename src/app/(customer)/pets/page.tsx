'use client'

import { useEffect, useState } from 'react'

type Pet = {
  id: string
  name: string
  species: string
  breed: string | null
}

export default function PetsPage() {
  const [pets, setPets] = useState<Pet[]>([])
  const [adding, setAdding] = useState(false)

  function loadPets() {
    fetch('/api/pets')
      .then((r) => r.json())
      .then(setPets)
  }

  useEffect(loadPets, [])

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    await fetch('/api/pets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.get('name'),
        species: form.get('species'),
        breed: form.get('breed') || undefined,
      }),
    })
    setAdding(false)
    loadPets()
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-forest">My pets</h1>
        <button
          onClick={() => setAdding((v) => !v)}
          className="rounded-full border border-border px-4 py-1.5 text-sm hover:border-forest"
        >
          {adding ? 'Cancel' : 'Add a pet'}
        </button>
      </div>

      {adding && (
        <form
          onSubmit={handleAdd}
          className="mt-6 flex max-w-sm flex-col gap-4 rounded-lg border border-border bg-card p-4"
        >
          <Field label="Name" name="name" required />
          <Field label="Species" name="species" placeholder="Dog, cat, rabbit…" required />
          <Field label="Breed (optional)" name="breed" />
          <button
            type="submit"
            className="rounded-full bg-forest px-4 py-2 text-sm font-medium text-canvas hover:bg-forest-light"
          >
            Save pet
          </button>
        </form>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {pets.map((pet) => (
          <div key={pet.id} className="rounded-lg border border-border bg-card p-4">
            <p className="font-display text-lg text-forest">{pet.name}</p>
            <p className="text-sm text-ink/60">
              {pet.species}
              {pet.breed ? ` · ${pet.breed}` : ''}
            </p>
          </div>
        ))}
        {pets.length === 0 && !adding && (
          <p className="text-ink/60">No pets yet — add one to speed up booking.</p>
        )}
      </div>
    </div>
  )
}

function Field({
  label,
  name,
  placeholder,
  required,
}: {
  label: string
  name: string
  placeholder?: string
  required?: boolean
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-ink/80">{label}</span>
      <input
        name={name}
        placeholder={placeholder}
        required={required}
        className="rounded-md border border-border bg-canvas px-3 py-2"
      />
    </label>
  )
}
