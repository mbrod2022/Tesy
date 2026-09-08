import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, PageHeader, StatusBadge, EmptyState } from "@/components/ui";
import { formatDate, formatDateTime } from "@/lib/format";

export default async function DashboardPage() {
  const now = new Date();
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [
    activeContracts,
    endingSoon,
    upcomingMeetings,
    openActionItems,
    outThisWeek,
    recentUpdates,
  ] = await Promise.all([
    prisma.contract.count({ where: { status: "ACTIVE" } }),
    prisma.contract.findMany({
      where: { status: "ACTIVE", endDate: { gte: now, lte: in30Days } },
      orderBy: { endDate: "asc" },
      take: 5,
    }),
    prisma.meeting.findMany({
      where: { meetingDate: { gte: now } },
      orderBy: { meetingDate: "asc" },
      take: 5,
      include: { contract: true },
    }),
    prisma.actionItem.findMany({
      where: { status: { not: "DONE" } },
      orderBy: { dueDate: "asc" },
      take: 5,
      include: { contract: true, owner: true },
    }),
    prisma.holiday.findMany({
      where: { status: "APPROVED", startDate: { lte: in7Days }, endDate: { gte: now } },
      include: { user: true },
    }),
    prisma.update.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { contract: true, author: true },
    }),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="An overview of live contracts, meetings, action items, and team availability."
      />

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <p className="text-xs font-medium uppercase text-slate-500">Active contracts</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{activeContracts}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase text-slate-500">Ending in 30 days</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{endingSoon.length}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase text-slate-500">Open action items</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{openActionItems.length}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase text-slate-500">Out this week</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{outThisWeek.length}</p>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Contracts ending soon</h2>
          {endingSoon.length === 0 ? (
            <EmptyState message="Nothing ending in the next 30 days." />
          ) : (
            <Card>
              <ul className="divide-y divide-slate-100">
                {endingSoon.map((c) => (
                  <li key={c.id} className="flex items-center justify-between py-2.5">
                    <Link href={`/contracts/${c.id}`} className="text-sm font-medium text-slate-900 hover:underline">
                      {c.name}
                    </Link>
                    <span className="text-xs text-slate-500">{formatDate(c.endDate)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Upcoming meetings</h2>
          {upcomingMeetings.length === 0 ? (
            <EmptyState message="No upcoming meetings scheduled." />
          ) : (
            <Card>
              <ul className="divide-y divide-slate-100">
                {upcomingMeetings.map((m) => (
                  <li key={m.id} className="py-2.5">
                    <Link href={`/contracts/${m.contractId}`} className="text-sm font-medium text-slate-900 hover:underline">
                      {m.title}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {m.contract.name} · {formatDateTime(m.meetingDate)}
                    </p>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Open action items</h2>
          {openActionItems.length === 0 ? (
            <EmptyState message="No open action items." />
          ) : (
            <Card>
              <ul className="divide-y divide-slate-100">
                {openActionItems.map((item) => (
                  <li key={item.id} className="py-2.5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-slate-900">{item.description}</p>
                      <StatusBadge status={item.status} />
                    </div>
                    <p className="text-xs text-slate-500">
                      {item.contract.name}
                      {item.owner ? ` · ${item.owner.name}` : ""}
                      {item.dueDate ? ` · Due ${formatDate(item.dueDate)}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Recent updates</h2>
          {recentUpdates.length === 0 ? (
            <EmptyState message="No updates posted yet." />
          ) : (
            <Card>
              <ul className="divide-y divide-slate-100">
                {recentUpdates.map((u) => (
                  <li key={u.id} className="py-2.5">
                    <Link href={`/contracts/${u.contractId}`} className="text-sm font-medium text-slate-900 hover:underline">
                      {u.title}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {u.contract.name} · {u.author?.name ?? "Unknown"} · {formatDateTime(u.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
