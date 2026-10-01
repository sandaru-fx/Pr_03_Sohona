import { ShieldAlert, Fingerprint } from "lucide-react";
import { requireAdminPage } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";

export const metadata = {
  title: "Security Logs — Admin",
};

export default async function SecurityLogsPage() {
  await requireAdminPage();

  const logs = await prisma.securityEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      profile: { select: { displayName: true } }
    }
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-sans text-3xl font-medium tracking-tight text-[#F5F1E8] sm:text-4xl">
          Security Logs
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-gray-400">
          Recent security events including PIN failures and profile locks across the system.
        </p>
      </div>

      <div className="rounded-2xl border border-[#2A2E33] bg-[#181C20] overflow-hidden">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ShieldAlert className="h-10 w-10 text-foreground-muted" />
            <p className="mt-4 text-sm font-medium text-foreground">No security events yet</p>
          </div>
        ) : (
          <ul className="divide-y divide-[#2A2E33]">
            {logs.map((log) => {
              const isError = log.type.includes("FAIL") || log.type.includes("LOCKED");
              return (
                <li key={log.id} className="flex gap-4 p-5 sm:items-center">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isError ? "bg-error/10 text-error" : "bg-success/10 text-success"}`}>
                    {isError ? <ShieldAlert className="h-5 w-5" /> : <Fingerprint className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#F5F1E8]">
                      {log.type.replace(/_/g, " ")}
                    </p>
                    <p className="mt-1 text-xs text-foreground-secondary flex gap-2">
                      <span>{log.profile?.displayName ?? "Unknown Profile"}</span>
                      <span>·</span>
                      <span>{formatDistanceToNow(log.createdAt, { addSuffix: true })}</span>
                    </p>
                    {log.ipHash && (
                      <p className="mt-1 text-xs text-foreground-muted font-mono truncate">
                        IP Hash: {log.ipHash} {log.userAgent && `| ${log.userAgent}`}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
