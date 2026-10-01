import Image from "next/image";
import Link from "next/link";
import { SHARED_PACKAGE_LIMITS } from "@/lib/packages";
import { prisma } from "@/lib/prisma";
import { HomeClient } from "./HomeClient";

export default async function HomePage() {
  const limits = SHARED_PACKAGE_LIMITS;
  const packages = await prisma.package.findMany({
    where: { isActive: true },
    orderBy: { retentionYears: 'asc' }
  });

  return <HomeClient packages={packages} limits={limits} />;
}
