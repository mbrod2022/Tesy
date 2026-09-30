"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function TopicActions({ topicId }: { topicId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function discuss() {
    setBusy(true);
    try {
      await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "CHAT", topicId }),
      });
      router.push("/");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-2 text-xs">
      <button
        onClick={discuss}
        disabled={busy}
        className="rounded-md border border-[var(--border)] px-3 py-1.5 text-[var(--foreground)] transition hover:border-[var(--accent)] disabled:opacity-40"
      >
        Discuss
      </button>
      <button
        onClick={() => router.push(`/quiz/${topicId}`)}
        className="rounded-md border border-[var(--border)] px-3 py-1.5 text-[var(--foreground)] transition hover:border-[var(--accent)]"
      >
        Quiz me
      </button>
      <button
        onClick={() => router.push(`/exercise?topic=${topicId}`)}
        className="rounded-md border border-[var(--border)] px-3 py-1.5 text-[var(--foreground)] transition hover:border-[var(--accent)]"
      >
        Coding exercise
      </button>
    </div>
  );
}
