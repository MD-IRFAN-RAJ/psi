import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed function disabled: Users should create and register themselves through the application.
 * No default seeded data is required.
 */
async function main() {
  console.log('Prisma seed function - no seeding required. Users can self-register.');
  // Seed logic removed to allow users to create and register themselves
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
