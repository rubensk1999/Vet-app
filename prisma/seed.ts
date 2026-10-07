import 'dotenv/config'
import { prisma } from '../src/lib/prisma'
import { auth } from '../src/lib/auth'

async function main() {
  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'admin' },
  })

  if (existingAdmin) {
    console.log('Admin already exists, skipping seed.')
    return
  }

  // Goes through Better Auth's own sign-up flow so the password is
  // hashed with its scheme (not a hand-rolled bcrypt hash it wouldn't
  // recognize at login time). We only touch Prisma directly afterward
  // to promote the new account to "admin".
  const result = await auth.api.signUpEmail({
    body: {
      name: 'Admin',
      email: process.env.ADMIN_EMAIL || 'admin@vetclinic.com',
      password: process.env.ADMIN_PASSWORD || 'changeme123',
    },
  })

  await prisma.user.update({
    where: { id: result.user.id },
    data: { role: 'admin' },
  })

  console.log('Admin user created. Log in and rotate this password.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
