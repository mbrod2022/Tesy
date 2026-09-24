"use client";

import clsx from "clsx";
import type { ApiConversation } from "@/lib/types";

const MODE_LABEL: Record<ApiConversation["mode"], string> = {
  CHAT: "Chat",
  QUIZ: "Quiz",
  EXERCISE: "Exercise",
  REVIEW: "Review",
};

export function Sidebar({
  conversations,
  selectedId,
  onSelect,
  onNew,
  onDelete,
}: {
  conversations: ApiConversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}) {
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--panel)]">
      <div className="p-3">
        <button
          onClick={onNew}
          className="w-full rounded-md bg-[var(--accent-strong)] px-3 py-2 text-sm font-medium text-[#04120b] transition hover:opacity-90"
        >
          + New chat
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-3">
        {conversations.length === 0 && (
          <p className="px-2 py-4 text-xs text-[var(--muted)]">
            No conversations yet.
          </p>
        )}
        {conversations.map((c) => (
          <div
            key={c.id}
            className={clsx(
              "group mb-1 flex items-center justify-between rounded-md px-2 py-2 text-sm",
              selectedId === c.id
                ? "bg-[var(--border)] text-[var(--foreground)]"
                : "text-[var(--muted)] hover:bg-[var(--border)]/50",
            )}
          >
            <button
              onClick={() => onSelect(c.id)}
              className="min-w-0 flex-1 text-left"
            >
              <div className="truncate">{c.title}</div>
              <div className="text-[10px] uppercase tracking-wide text-[var(--muted)]">
                {MODE_LABEL[c.mode]}
                {c.topic ? ` · ${c.topic.title}` : ""}
              </div>
            </button>
            <button
              onClick={() => onDelete(c.id)}
              className="ml-2 shrink-0 text-[var(--muted)] opacity-0 transition hover:text-red-400 group-hover:opacity-100"
              aria-label="Delete conversation"
              title="Delete"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </aside>
  );
}
