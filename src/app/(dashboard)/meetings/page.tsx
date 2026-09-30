import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader, Table, Th, Td, EmptyState } from "@/components/ui";
import { formatDateTime } from "@/lib/format";

export default async function MeetingsPage() {
  const meetings = await prisma.meeting.findMany({
    orderBy: { meetingDate: "desc" },
    include: {
      contract: true,
      staffAttendees: true,
      contactAttendees: true,
    },
    take: 100,
  });

  return (
    <div>
      <PageHeader
        title="Meetings"
        description="All meetings logged across your contracts. Log a new meeting from within a contract."
      />

      {meetings.length === 0 ? (
        <EmptyState message="No meetings logged yet." />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Date</Th>
              <Th>Meeting</Th>
              <Th>Contract</Th>
              <Th>Attendees</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {meetings.map((meeting) => (
              <tr key={meeting.id} className="hover:bg-slate-50">
                <Td>{formatDateTime(meeting.meetingDate)}</Td>
                <Td className="font-medium text-slate-900">{meeting.title}</Td>
                <Td>
                  <Link href={`/contracts/${meeting.contractId}`} className="hover:underline">
                    {meeting.contract.name}
                  </Link>
                </Td>
                <Td>
                  {[...meeting.staffAttendees, ...meeting.contactAttendees]
                    .map((a) => a.name)
                    .join(", ") || "—"}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
