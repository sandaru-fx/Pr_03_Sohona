const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const profile = await prisma.profile.findFirst({
    where: { isSetupComplete: false },
    select: { id: true }
  });
  if (!profile) return;
  
  // Test 1: setupTokenHash: { not: null }
  const t1 = await prisma.profile.findMany({
    where: { id: profile.id, setupTokenHash: { not: null } }
  });
  console.log("setupTokenHash { not: null } matches:", t1.length);
  
  // Test 2: manageTokenHash: null
  const t2 = await prisma.profile.findMany({
    where: { id: profile.id, manageTokenHash: null }
  });
  console.log("manageTokenHash null matches:", t2.length);

  // Test 3: manageTokenHash: { isSet: false } (MongoDB specific)
  const t3 = await prisma.profile.findMany({
    where: { id: profile.id, manageTokenHash: { isSet: false } }
  });
  console.log("manageTokenHash { isSet: false } matches:", t3.length);
}
main().catch(console.error).finally(() => prisma.$disconnect());
