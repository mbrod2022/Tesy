import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { PageHeader, Card, Table, Th, Td, StatusBadge, EmptyState } from "@/components/ui";
import { HolidayForm } from "@/components/holiday-form";
import { formatDate } from "@/lib/format";
import { setHolidayStatus, deleteHoliday } from "@/lib/actions/holidays";

const TYPE_LABELS: Record<string, string> = {
  ANNUAL_LEAVE: "Annual leave",
  SICK: "Sick",
  OTHER: "Other",
};

export default async function HolidaysPage() {
  const session = await auth();
  const canManage = session?.user.role === "ADMIN" || session?.user.role === "MANAGER";

  const [upcoming, myHolidays, pending] = await Promise.all([
    prisma.holiday.findMany({
      where: { status: "APPROVED", endDate: { gte: new Date() } },
      orderBy: { startDate: "asc" },
      include: { user: true },
      take: 25,
    }),
    prisma.holiday.findMany({
      where: { userId: session!.user.id },
      orderBy: { startDate: "desc" },
      take: 25,
    }),
    canManage
      ? prisma.holiday.findMany({
          where: { status: "REQUESTED" },
          orderBy: { startDate: "asc" },
          include: { user: true },
        })
      : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Holidays"
        description="Team availability, holiday requests, and approvals."
      />

      <div className="grid grid-cols-2 gap-8">
        <Card>
          <p className="mb-3 text-sm font-medium text-slate-900">Request time off</p>
          <HolidayForm />
        </Card>

        <div>
          <h2 className="mb-2 text-sm font-semibold text-slate-900">Who&apos;s out (approved)</h2>
          {upcoming.length === 0 ? (
            <EmptyState message="No upcoming approved holidays." />
          ) : (
            <Card>
              <ul className="divide-y divide-slate-100">
                {upcoming.map((h) => (
                  <li key={h.id} className="py-2.5 text-sm">
                    <span className="font-medium text-slate-900">{h.user.name}</span>{" "}
                    <span className="text-slate-500">
                      {formatDate(h.startDate)} – {formatDate(h.endDate)} ({TYPE_LABELS[h.type]})
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>

      {canManage && (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Pending approval</h2>
          {pending.length === 0 ? (
            <EmptyState message="No pending holiday requests." />
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Staff</Th>
                  <Th>Dates</Th>
                  <Th>Type</Th>
                  <Th>Notes</Th>
                  <Th>Action</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pending.map((h) => (
                  <tr key={h.id}>
                    <Td>{h.user.name}</Td>
                    <Td>
                      {formatDate(h.startDate)} – {formatDate(h.endDate)}
                    </Td>
                    <Td>{TYPE_LABELS[h.type]}</Td>
                    <Td>{h.notes ?? "—"}</Td>
                    <Td>
                      <div className="flex gap-3">
                        <form action={setHolidayStatus.bind(null, h.id, "APPROVED")}>
                          <button className="text-xs font-medium text-green-700 hover:underline">
                            Approve
                          </button>
                        </form>
                        <form action={setHolidayStatus.bind(null, h.id, "REJECTED")}>
                          <button className="text-xs font-medium text-red-600 hover:underline">
                            Reject
                          </button>
                        </form>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </section>
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">My requests</h2>
        {myHolidays.length === 0 ? (
          <EmptyState message="You haven't requested any holiday yet." />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Dates</Th>
                <Th>Type</Th>
                <Th>Status</Th>
                <Th>Notes</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myHolidays.map((h) => (
                <tr key={h.id}>
                  <Td>
                    {formatDate(h.startDate)} – {formatDate(h.endDate)}
                  </Td>
                  <Td>{TYPE_LABELS[h.type]}</Td>
                  <Td>
                    <StatusBadge status={h.status} />
                  </Td>
                  <Td>{h.notes ?? "—"}</Td>
                  <Td>
                    <form action={deleteHoliday.bind(null, h.id)}>
                      <button className="text-xs font-medium text-red-600 hover:underline">
                        Cancel
                      </button>
                    </form>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </section>
    </div>
  );
}
