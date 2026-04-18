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

  // Find or Create Role
  let adminRole = await prisma.role.findFirst({
    where: { name: 'admin' }
  });

  if (!adminRole) {
    adminRole = await prisma.role.create({
      data: {
        name: 'admin',
        description: 'Administrator with full access',
      }
    });
  }

  // Ensure Branches
  // We use a hardcoded ID to match the frontend MongoDB ID
  const mainBranchId = '69e20b42fcfd262548ec4f59';
  await prisma.branch.upsert({
    where: { id: mainBranchId },
    update: {
      name: 'Main Branch',
      code: 'MAIN',
    },
    create: {
      id: mainBranchId,
      name: 'Main Branch',
      code: 'MAIN',
      address: 'Default Branch Address',
    },
  });

  // Ensure Admin User
  const hashedPassword = await bcrypt.hash('Admin@123', 10);
  const adminEmail = 'admin@elevate.com';
  
  const existingUser = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (existingUser) {
    await prisma.user.update({
      where: { email: adminEmail },
      data: {
        password: hashedPassword,
        roleId: adminRole.id,
        branchId: mainBranchId,
      }
    });
  } else {
    await prisma.user.create({
      data: {
        id: 'admin-user-id',
        name: 'Admin User',
        email: adminEmail,
        password: hashedPassword,
        roleId: adminRole.id,
        branchId: mainBranchId,
      }
    });
  }

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
