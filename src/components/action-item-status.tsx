"use client";

import { useTransition } from "react";
import { updateActionItemStatus } from "@/lib/actions/action-items";

export function ActionItemStatusSelect({
  contractId,
  itemId,
  status,
}: {
  contractId: string;
  itemId: string;
  status: "OPEN" | "IN_PROGRESS" | "DONE";
}) {
  const [, startTransition] = useTransition();

  return (
    <select
      defaultValue={status}
      onChange={(e) => {
        const value = e.target.value as "OPEN" | "IN_PROGRESS" | "DONE";
        startTransition(() => {
          updateActionItemStatus(contractId, itemId, value);
        });
      }}
      className="rounded-md border border-slate-300 px-2 py-1 text-xs"
    >
      <option value="OPEN">Open</option>
      <option value="IN_PROGRESS">In progress</option>
      <option value="DONE">Done</option>
    </select>
  );
}
