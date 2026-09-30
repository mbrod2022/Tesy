import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card, EmptyState, StatusBadge } from "@/components/ui";
import { ContactForm } from "@/components/contact-form";
import { updateContact, deleteContact } from "@/lib/actions/contacts";
import { formatDateTime } from "@/lib/format";

export default async function ContactDetailPage(
  props: PageProps<"/contacts/[id]">,
) {
  const { id } = await props.params;

  const contact = await prisma.contact.findUnique({
    where: { id },
    include: {
      contracts: { include: { contract: true }, orderBy: { createdAt: "desc" } },
      meetingsAttended: {
        orderBy: { meetingDate: "desc" },
        take: 10,
        include: { contract: true },
      },
    },
  });

  if (!contact) notFound();

  const action = updateContact.bind(null, contact.id);

  return (
    <div className="space-y-8">
      <PageHeader
        title={contact.name}
        description={contact.organisation ?? undefined}
      />

      <div className="grid grid-cols-2 gap-8">
        <Card>
          <p className="mb-3 text-sm font-medium text-slate-900">Details</p>
          <ContactForm
            action={action}
            submitLabel="Save changes"
            defaultValues={{
              name: contact.name,
              email: contact.email,
              phone: contact.phone,
              jobTitle: contact.jobTitle,
              organisation: contact.organisation,
              type: contact.type,
              notes: contact.notes,
            }}
          />
          <form action={deleteContact.bind(null, contact.id)} className="mt-4 border-t border-slate-100 pt-4">
            <button className="text-sm font-medium text-red-600 hover:underline">
              Delete contact
            </button>
          </form>
        </Card>

        <div className="space-y-6">
          <div>
            <h2 className="mb-2 text-sm font-semibold text-slate-900">Linked contracts</h2>
            {contact.contracts.length === 0 ? (
              <EmptyState message="Not linked to any contracts yet." />
            ) : (
              <Card>
                <ul className="divide-y divide-slate-100">
                  {contact.contracts.map((cc) => (
                    <li key={cc.contractId} className="flex items-center justify-between py-2.5">
                      <div>
                        <Link
                          href={`/contracts/${cc.contract.id}`}
                          className="text-sm font-medium text-slate-900 hover:underline"
                        >
                          {cc.contract.name}
                        </Link>
                        {cc.role && (
                          <span className="ml-2 text-xs text-slate-500">{cc.role}</span>
                        )}
                      </div>
                      <StatusBadge status={cc.contract.status} />
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>

          <div>
            <h2 className="mb-2 text-sm font-semibold text-slate-900">Recent meetings</h2>
            {contact.meetingsAttended.length === 0 ? (
              <EmptyState message="No meetings attended yet." />
            ) : (
              <Card>
                <ul className="divide-y divide-slate-100">
                  {contact.meetingsAttended.map((meeting) => (
                    <li key={meeting.id} className="py-2.5">
                      <p className="text-sm font-medium text-slate-900">{meeting.title}</p>
                      <p className="text-xs text-slate-500">
                        {meeting.contract.name} · {formatDateTime(meeting.meetingDate)}
                      </p>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
