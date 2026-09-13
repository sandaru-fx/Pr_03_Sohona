import { prisma } from "@/lib/prisma";
import { AdminPackagesClient } from "./AdminPackagesClient";

export const metadata = {
  title: "Packages — Admin",
};

export default async function AdminPackagesPage() {
  const packages = await prisma.package.findMany({
    orderBy: { retentionYears: "asc" },
    include: {
      _count: { select: { profiles: true } },
    },
  });

  return <AdminPackagesClient initialPackages={packages} />;
}
