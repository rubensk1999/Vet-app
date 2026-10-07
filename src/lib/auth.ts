import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { nextCookies } from 'better-auth/next-js'
import { admin } from 'better-auth/plugins'
import { prisma } from './prisma'

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),

  emailAndPassword: {
    enabled: true,
  },

  // The admin plugin gives us auth.api.createUser (usable only by an
  // existing admin session) — exactly the "admin creates staff" flow
  // we need, without hand-rolling the permission check ourselves.
  // nextCookies() must be LAST in this array (Better Auth requirement)
  // — it's what forwards Set-Cookie headers to the browser in Next.js.
  plugins: [
    admin({
      defaultRole: 'customer',
      adminRoles: ['admin'],
    }),
    nextCookies(),
  ],

  user: {
    additionalFields: {
      phone: {
        type: 'string',
        required: false,
      },
    },
  },
})
