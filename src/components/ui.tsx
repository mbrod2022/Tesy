import Link from "next/link";
import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
      {message}
    </div>
  );
}

export function PrimaryButton({
  href,
  children,
  type,
}: {
  href?: string;
  children: ReactNode;
  type?: "submit" | "button";
}) {
  const className =
    "inline-flex items-center rounded-md bg-slate-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-slate-700";
  if (href) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type ?? "button"} className={className}>
      {children}
    </button>
  );
}

export function SecondaryLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
    >
      {children}
    </Link>
  );
}

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  PENDING: "bg-amber-100 text-amber-800",
  ON_HOLD: "bg-slate-200 text-slate-700",
  EXPIRED: "bg-red-100 text-red-700",
  TERMINATED: "bg-red-100 text-red-700",
  OPEN: "bg-amber-100 text-amber-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  DONE: "bg-green-100 text-green-800",
  REQUESTED: "bg-amber-100 text-amber-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-700",
};

export function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? "bg-slate-100 text-slate-700";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}

export const CONTRACT_TYPE_LABELS: Record<string, string> = {
  COLLECTIONS: "Collections",
  HWRC: "HWRC",
  DEPOT_OFFICE: "Depot / Office",
  OTHER: "Other",
};

const CONTRACT_TYPE_STYLES: Record<string, string> = {
  COLLECTIONS: "bg-sky-100 text-sky-800",
  HWRC: "bg-violet-100 text-violet-800",
  DEPOT_OFFICE: "bg-teal-100 text-teal-800",
  OTHER: "bg-slate-100 text-slate-700",
};

export function ContractTypeBadge({ type }: { type: string }) {
  const style = CONTRACT_TYPE_STYLES[type] ?? "bg-slate-100 text-slate-700";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}
    >
      {CONTRACT_TYPE_LABELS[type] ?? type}
    </span>
  );
}

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        {children}
      </table>
    </div>
  );
}

export function Th({ children }: { children?: ReactNode }) {
  return (
    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
      {children}
    </th>
  );
}

export function Td({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <td className={`px-4 py-3 align-top text-slate-700 ${className}`}>
      {children}
    </td>
  );
}
