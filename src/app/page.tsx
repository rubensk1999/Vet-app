import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="flex flex-col items-start gap-6">
      <p className="font-mono text-sm tracking-wide text-clay uppercase">
        Same-week appointments
      </p>
      <h1 className="font-display text-4xl leading-tight text-forest sm:text-5xl">
        Care for your pet,
        <br />
        booked in a minute.
      </h1>
      <p className="max-w-md text-ink/80">
        Pick an open slot below, tell us what&apos;s going on, and we&apos;ll
        see you and your pet soon. No account needed — though signing up
        saves your details for next time.
      </p>
      <Link
        href="/book"
        className="rounded-full bg-amber px-6 py-3 font-medium text-white hover:bg-amber-dark"
      >
        Book an appointment
      </Link>
    </div>
  )
}
