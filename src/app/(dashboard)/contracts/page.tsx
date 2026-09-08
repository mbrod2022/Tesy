import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { PageHeader, PrimaryButton, Table, Th, Td, StatusBadge, EmptyState } from "@/components/ui";
import { formatDate } from "@/lib/format";

export default async function ContractsPage() {
  const session = await auth();
  const canManage = session?.user.role === "ADMIN" || session?.user.role === "MANAGER";

  const contracts = await prisma.contract.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      contractManager: true,
      _count: { select: { externalContracts: true } },
    },
  });

  return (
    <div>
      <PageHeader
        title="Contracts"
        description="Contracts your organisation delivers, and the external contracts that support them."
        action={canManage ? <PrimaryButton href="/contracts/new">New contract</PrimaryButton> : undefined}
      />

      {contracts.length === 0 ? (
        <EmptyState message="No contracts yet. Create your first contract to get started." />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Reference</Th>
              <Th>Contract</Th>
              <Th>Client</Th>
              <Th>Status</Th>
              <Th>End date</Th>
              <Th>External contracts</Th>
              <Th>Manager</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {contracts.map((contract) => (
              <tr key={contract.id} className="hover:bg-slate-50">
                <Td className="font-mono text-xs text-slate-500">
                  {contract.reference}
                </Td>
                <Td className="font-medium text-slate-900">
                  <Link href={`/contracts/${contract.id}`} className="hover:underline">
                    {contract.name}
                  </Link>
                </Td>
                <Td>{contract.clientName}</Td>
                <Td>
                  <StatusBadge status={contract.status} />
                </Td>
                <Td>{formatDate(contract.endDate)}</Td>
                <Td>{contract._count.externalContracts}</Td>
                <Td>{contract.contractManager?.name ?? "—"}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
