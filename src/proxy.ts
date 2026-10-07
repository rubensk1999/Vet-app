import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { canAccess } from '@/lib/access'

// Next.js 16 renamed middleware.ts -> proxy.ts (and middleware() -> proxy()).
// Proxy now runs on the Node.js runtime, so — unlike old Edge-only
// middleware — it's fine to call auth.api.getSession() here directly
// for a real role check, rather than only checking cookie presence.
export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  const role = session?.user?.role as 'customer' | 'staff' | 'admin' | undefined

  if (!canAccess(request.nextUrl.pathname, role)) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
