import { requireEnv } from "../lib/env";
import { prisma } from "../lib/prisma";

async function main() {
  requireEnv("DATABASE_URL");

  const ping = await prisma.$runCommandRaw({ ping: 1 });
  console.log("MongoDB ping OK:", ping);
  console.log("Day 1 DB connectivity check passed.");
}

main()
  .catch((error) => {
    console.error("DB smoke test failed.");
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
