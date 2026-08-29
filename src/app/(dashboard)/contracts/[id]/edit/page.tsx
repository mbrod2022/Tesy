import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { PageHeader, Card } from "@/components/ui";
import { ContractForm } from "@/components/contract-form";
import { updateContract } from "@/lib/actions/contracts";
import { toDateInputValue } from "@/lib/format";

export default async function EditContractPage(
  props: PageProps<"/contracts/[id]/edit">,
) {
  const session = await auth();
  if (session?.user.role !== "ADMIN" && session?.user.role !== "MANAGER") {
    redirect("/contracts");
  }

  const { id } = await props.params;

  const [contract, managers] = await Promise.all([
    prisma.contract.findUnique({ where: { id } }),
    prisma.user.findMany({
      where: { active: true, role: { in: ["ADMIN", "MANAGER"] } },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!contract) notFound();

  const action = updateContract.bind(null, contract.id);

  return (
    <div>
      <PageHeader title={`Edit ${contract.name}`} />
      <Card className="max-w-2xl">
        <ContractForm
          action={action}
          managers={managers}
          submitLabel="Save changes"
          defaultManagerId={contract.contractManagerId ?? ""}
          defaultValues={{
            reference: contract.reference,
            name: contract.name,
            clientName: contract.clientName,
            description: contract.description,
            startDate: toDateInputValue(contract.startDate),
            endDate: toDateInputValue(contract.endDate),
            value: contract.value?.toString(),
            status: contract.status,
          }}
        />
      </Card>
    </div>
  );
}
