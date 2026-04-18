import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import bcrypt from 'bcryptjs';

neonConfig.webSocketConstructor = ws;

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Cleaning up backend operational data...');
  
  // Clear all operational data
  await prisma.proposalItem.deleteMany({});
  await prisma.proposal.deleteMany({});
  await prisma.lead.deleteMany({});
  
  console.log('Operational data cleared.');

  // Ensure Roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: 'Administrator with full access',
    },
  });

  // Ensure Branches
  // We use a hardcoded ID to match the frontend
  const mainBranchId = '69e20b42fcfd262548ec4f59';
  await prisma.branch.upsert({
    where: { id: mainBranchId },
    update: {},
    create: {
      id: mainBranchId,
      name: 'Main Branch',
      code: 'MAIN',
      address: 'Default Branch Address',
    },
  });

  // Ensure Admin User
  const hashedPassword = await bcrypt.hash('Admin@123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@elevate.com' },
    update: {
      password: hashedPassword,
    },
    create: {
      id: 'admin-user-id',
      name: 'Admin User',
      email: 'admin@elevate.com',
      password: hashedPassword,
      roleId: adminRole.id,
      branchId: mainBranchId,
    },
  });

  console.log('Backend Clean seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
