import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import {
  PageHeader,
  PrimaryButton,
  Table,
  Th,
  Td,
  StatusBadge,
  ContractTypeBadge,
  CONTRACT_TYPE_LABELS,
  EmptyState,
} from "@/components/ui";
import { formatDate } from "@/lib/format";

const CONTRACT_TYPES = ["COLLECTIONS", "HWRC", "DEPOT_OFFICE", "OTHER"] as const;

export default async function ContractsPage(props: PageProps<"/contracts">) {
  const searchParams = await props.searchParams;
  const typeFilter =
    typeof searchParams.type === "string" &&
    CONTRACT_TYPES.includes(searchParams.type as (typeof CONTRACT_TYPES)[number])
      ? searchParams.type
      : undefined;

  const session = await auth();
  const canManage = session?.user.role === "ADMIN" || session?.user.role === "MANAGER";

  const contracts = await prisma.contract.findMany({
    where: typeFilter ? { type: typeFilter as (typeof CONTRACT_TYPES)[number] } : undefined,
    orderBy: { createdAt: "desc" },
    include: { contractManager: true },
  });

  return (
    <div>
      <PageHeader
        title="Contracts"
        description="The council areas and business functions your organisation delivers IT services to."
        action={canManage ? <PrimaryButton href="/contracts/new">New contract</PrimaryButton> : undefined}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <Link
          href="/contracts"
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            !typeFilter ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          All
        </Link>
        {CONTRACT_TYPES.map((type) => (
          <Link
            key={type}
            href={`/contracts?type=${type}`}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              typeFilter === type ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {CONTRACT_TYPE_LABELS[type]}
          </Link>
        ))}
      </div>

      {contracts.length === 0 ? (
        <EmptyState message="No contracts match this filter." />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Reference</Th>
              <Th>Contract</Th>
              <Th>Type</Th>
              <Th>Client</Th>
              <Th>Status</Th>
              <Th>End date</Th>
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
                <Td>
                  <ContractTypeBadge type={contract.type} />
                </Td>
                <Td>{contract.clientName}</Td>
                <Td>
                  <StatusBadge status={contract.status} />
                </Td>
                <Td>{formatDate(contract.endDate)}</Td>
                <Td>{contract.contractManager?.name ?? "—"}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
