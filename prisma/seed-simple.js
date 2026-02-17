const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  const admin = await prisma.user.upsert({
    where: { email: 'admin@stichtingderaam.nl' },
    update: {},
    create: { email: 'admin@stichtingderaam.nl', passwordHash: '$2b$12$xib9HTcoywbhMFg2y8vwHery9w2bUJp.7WOz7VTdfNsX6Suq3uxce', name: 'Beheerder', role: 'ADMIN', status: 'ACTIVE' }
  });
  console.log('Admin created:', admin.email);

  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: { email: 'test@example.com', passwordHash: '$2b$12$prGWciuzYAGsp8Gxp1RqiO8mIwRJQ7WIeUk30/mXYB0hjbpYDocu2', name: 'Test Gebruiker', role: 'USER', status: 'ACTIVE' }
  });
  console.log('User created:', user.email);

  const resource = await prisma.resource.upsert({
    where: { id: 'rijhal-binnen' },
    update: {},
    create: { id: 'rijhal-binnen', name: 'Rijhal (binnen)', description: 'De overdekte rijhal voor trainingen en lessen.', isActive: true }
  });
  console.log('Resource created:', resource.name);

  await prisma.$disconnect();
  console.log('Seeding done!');
})();
