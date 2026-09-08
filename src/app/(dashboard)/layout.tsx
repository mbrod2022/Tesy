import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { signOutAction } from "@/lib/actions/auth";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard" },
  { href: "/contracts", label: "Contracts" },
  { href: "/contacts", label: "People" },
  { href: "/meetings", label: "Meetings" },
  { href: "/holidays", label: "Holidays" },
  { href: "/team", label: "Team" },
];

export default async function DashboardLayout({
  children,
}: LayoutProps<"/">) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-1">
      <aside className="flex w-60 flex-col border-r border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-5">
          <p className="text-sm font-semibold text-slate-900">
            Service Delivery CRM
          </p>
          <p className="mt-0.5 text-xs text-slate-500">Contract management</p>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-slate-200 px-3 py-4">
          <p className="truncate px-3 text-sm font-medium text-slate-900">
            {session.user.name}
          </p>
          <p className="truncate px-3 text-xs text-slate-500">
            {session.user.role}
          </p>
          <Link
            href="/change-password"
            className="mt-2 block rounded-md px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            Change password
          </Link>
          <form action={signOutAction}>
            <button
              type="submit"
              className="mt-2 w-full rounded-md px-3 py-2 text-left text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto px-8 py-8">{children}</main>
    </div>
  );
}
