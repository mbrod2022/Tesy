import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader, PrimaryButton, Table, Th, Td, EmptyState } from "@/components/ui";

const TYPE_LABELS: Record<string, string> = {
  CLIENT: "Client",
  SUBCONTRACTOR: "Subcontractor",
  INTERNAL: "Internal",
  OTHER: "Other",
};

export default async function ContactsPage() {
  const contacts = await prisma.contact.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { contracts: true } } },
  });

  return (
    <div>
      <PageHeader
        title="People"
        description="Client, subcontractor, and internal contacts linked to your contracts."
        action={<PrimaryButton href="/contacts/new">New contact</PrimaryButton>}
      />

      {contacts.length === 0 ? (
        <EmptyState message="No contacts yet. Add your first contact to get started." />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Name</Th>
              <Th>Type</Th>
              <Th>Organisation</Th>
              <Th>Email</Th>
              <Th>Phone</Th>
              <Th>Contracts</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {contacts.map((contact) => (
              <tr key={contact.id} className="hover:bg-slate-50">
                <Td className="font-medium text-slate-900">
                  <Link href={`/contacts/${contact.id}`} className="hover:underline">
                    {contact.name}
                  </Link>
                </Td>
                <Td>{TYPE_LABELS[contact.type]}</Td>
                <Td>{contact.organisation ?? "—"}</Td>
                <Td>{contact.email ?? "—"}</Td>
                <Td>{contact.phone ?? "—"}</Td>
                <Td>{contact._count.contracts}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
