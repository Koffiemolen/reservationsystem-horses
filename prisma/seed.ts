import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create default admin user
  const adminPassword = await bcrypt.hash('Admin123!@#', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@stichtingderaam.nl' },
    update: {},
    create: {
      email: 'admin@stichtingderaam.nl',
      passwordHash: adminPassword,
      name: 'Beheerder',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  })
  console.log('Created admin user:', admin.email)

  // Create a regular test user
  const userPassword = await bcrypt.hash('Test1234!@#$', 12)
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      passwordHash: userPassword,
      name: 'Test Gebruiker',
      phone: '0612345678',
      phoneConsent: true,
      role: 'USER',
      status: 'ACTIVE',
    },
  })
  console.log('Created test user:', testUser.email)

  // Create default resource (Rijhal binnen)
  const resource = await prisma.resource.upsert({
    where: { id: 'rijhal-binnen' },
    update: {},
    create: {
      id: 'rijhal-binnen',
      name: 'Rijhal (binnen)',
      description: 'De overdekte rijhal voor trainingen en lessen.',
      isActive: true,
    },
  })
  console.log('Created resource:', resource.name)

  // Create some sample reservations
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(10, 0, 0, 0)

  const reservation1 = await prisma.reservation.create({
    data: {
      userId: testUser.id,
      resourceId: resource.id,
      startTime: tomorrow,
      endTime: new Date(tomorrow.getTime() + 60 * 60 * 1000), // 1 hour later
      purpose: 'TRAINING',
      notes: 'Wekelijkse training',
      status: 'CONFIRMED',
    },
  })
  console.log('Created reservation for:', reservation1.startTime)

  const dayAfterTomorrow = new Date(tomorrow)
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1)
  dayAfterTomorrow.setHours(14, 30, 0, 0)

  const reservation2 = await prisma.reservation.create({
    data: {
      userId: testUser.id,
      resourceId: resource.id,
      startTime: dayAfterTomorrow,
      endTime: new Date(dayAfterTomorrow.getTime() + 90 * 60 * 1000), // 1.5 hours later
      purpose: 'LESSON',
      notes: 'Privéles',
      status: 'CONFIRMED',
    },
  })
  console.log('Created reservation for:', reservation2.startTime)

  // Create a sample public event
  const nextWeek = new Date(now)
  nextWeek.setDate(nextWeek.getDate() + 7)
  nextWeek.setHours(9, 0, 0, 0)

  const event = await prisma.event.create({
    data: {
      title: 'Open Dag',
      description: 'Kom kennismaken met onze manege! Gratis rondleiding en demonstraties.',
      startTime: nextWeek,
      endTime: new Date(nextWeek.getTime() + 6 * 60 * 60 * 1000), // 6 hours
      visibility: 'PUBLIC',
      createdById: admin.id,
      resources: {
        create: {
          resourceId: resource.id,
        },
      },
    },
  })
  console.log('Created event:', event.title)

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
