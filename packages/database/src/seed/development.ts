import { prisma } from '../index.js';

export default async function seedDev() {
  console.log('🌱 Seeding development database...');

  // 1. Create a Merchant User
  const merchant = await prisma.user.upsert({
    where: { email: 'merchant@fidely.test' },
    update: {},
    create: {
      email: 'merchant@fidely.test',
      fullName: 'Test Merchant',
      role: 'MERCHANT',
    },
  });

  // 2. Create a Store
  const store = await prisma.store.upsert({
    where: { slug: 'test-cafe' },
    update: {},
    create: {
      ownerId: merchant.id,
      name: 'Test Cafe',
      slug: 'test-cafe',
      primaryColor: '#ff5722',
      pointsPerTnd: 10,
    },
  });

  // 3. Create a Reward for the store
  const reward = await prisma.reward.create({
    data: {
      storeId: store.id,
      name: 'Free Coffee',
      description: 'Get a free coffee of your choice!',
      pointsCost: 100,
    },
  });

  // 4. Create a Customer User
  const customer = await prisma.user.upsert({
    where: { email: 'customer@fidely.test' },
    update: {},
    create: {
      email: 'customer@fidely.test',
      fullName: 'Test Customer',
      role: 'CUSTOMER',
    },
  });

  // 5. Create a Cashier User
  const cashier = await prisma.user.upsert({
    where: { email: 'cashier@fidely.test' },
    update: {},
    create: {
      email: 'cashier@fidely.test',
      fullName: 'Test Cashier',
      role: 'CASHIER',
    },
  });

  console.log('✅ Seeding complete!');
  console.log('--- Test Data ---');
  console.log(`Store Link: http://localhost:3000/store/${store.slug}`);
  console.log(`Customer QR Token for testing: ${customer.id}:${store.id}`);
  console.log(`Reward ID for testing: ${reward.id}`);
}
