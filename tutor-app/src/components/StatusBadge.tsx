import clsx from "clsx";

const LABEL: Record<string, string> = {
  NOT_STARTED: "Not started",
  IN_PROGRESS: "In progress",
  PRACTICED: "Practiced",
  MASTERED: "Mastered",
};

const COLOR: Record<string, string> = {
  NOT_STARTED: "text-[var(--muted)] border-[var(--border)]",
  IN_PROGRESS: "text-amber-300 border-amber-300/40",
  PRACTICED: "text-sky-300 border-sky-300/40",
  MASTERED: "text-[var(--accent)] border-[var(--accent)]/50",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={clsx(
        "rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide",
        COLOR[status] ?? COLOR.NOT_STARTED,
      )}
    >
      {LABEL[status] ?? "Not started"}
    </span>
  );
}
