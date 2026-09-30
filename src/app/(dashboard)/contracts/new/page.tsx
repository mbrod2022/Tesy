import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { PageHeader, Card } from "@/components/ui";
import { ContractForm } from "@/components/contract-form";
import { createContract } from "@/lib/actions/contracts";

export default async function NewContractPage() {
  const session = await auth();
  if (session?.user.role !== "ADMIN" && session?.user.role !== "MANAGER") {
    redirect("/contracts");
  }

  const managers = await prisma.user.findMany({
    where: { active: true, role: { in: ["ADMIN", "MANAGER"] } },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div>
      <PageHeader
        title="New contract"
        description="Add a contract your organisation delivers to a client."
      />
      <Card className="max-w-2xl">
        <ContractForm
          action={createContract}
          managers={managers}
          submitLabel="Create contract"
        />
      </Card>
    </div>
  );
}
