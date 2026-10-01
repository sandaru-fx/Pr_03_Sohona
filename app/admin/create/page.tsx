import { prisma } from "@/lib/prisma";
import { CreateProfileWizard } from "./CreateProfileWizard";

export default async function CreateProfilePage() {
  const packages = await prisma.package.findMany({
    where: { isActive: true },
    orderBy: { retentionYears: "asc" },
  });

  return <CreateProfileWizard packages={packages} />;
}
