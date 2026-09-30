import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { PageHeader, Card, Table, Th, Td } from "@/components/ui";
import { TeamForm } from "@/components/team-form";
import { setUserActive } from "@/lib/actions/users";

export default async function TeamPage() {
  const session = await auth();
  const isAdmin = session?.user.role === "ADMIN";

  const users = await prisma.user.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Team"
        description="Everyone with access to the Service Delivery CRM."
      />

      <Table>
        <thead>
          <tr>
            <Th>Name</Th>
            <Th>Email</Th>
            <Th>Role</Th>
            <Th>Status</Th>
            {isAdmin && <Th></Th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {users.map((user) => (
            <tr key={user.id}>
              <Td className="font-medium text-slate-900">{user.name}</Td>
              <Td>{user.email}</Td>
              <Td>{user.role}</Td>
              <Td>{user.active ? "Active" : "Deactivated"}</Td>
              {isAdmin && (
                <Td>
                  {user.id !== session?.user.id && (
                    <form action={setUserActive.bind(null, user.id, !user.active)}>
                      <button className="text-xs font-medium text-slate-600 hover:underline">
                        {user.active ? "Deactivate" : "Reactivate"}
                      </button>
                    </form>
                  )}
                </Td>
              )}
            </tr>
          ))}
        </tbody>
      </Table>

      {isAdmin && (
        <Card className="max-w-xl">
          <p className="mb-3 text-sm font-medium text-slate-900">Add a team member</p>
          <TeamForm />
        </Card>
      )}
    </div>
  );
}
