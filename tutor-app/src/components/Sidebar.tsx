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
  open,
  onClose,
}: {
  conversations: ApiConversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-20 bg-black/60 md:hidden"
        />
      )}
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-30 flex w-72 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--panel)] transition-transform duration-200 md:static md:z-auto md:w-64 md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center gap-2 p-3">
          <button
            onClick={() => {
              onNew();
              onClose();
            }}
            className="flex-1 rounded-md bg-[var(--accent-strong)] px-3 py-2 text-sm font-medium text-[#04120b] transition hover:opacity-90"
          >
            + New chat
          </button>
          <button
            onClick={onClose}
            aria-label="Close conversation list"
            className="rounded-md border border-[var(--border)] px-3 py-2 text-sm text-[var(--muted)] md:hidden"
          >
            ×
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
                onClick={() => {
                  onSelect(c.id);
                  onClose();
                }}
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
                className="ml-2 shrink-0 text-[var(--muted)] opacity-100 transition hover:text-red-400 md:opacity-0 md:group-hover:opacity-100"
                aria-label="Delete conversation"
                title="Delete"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}
