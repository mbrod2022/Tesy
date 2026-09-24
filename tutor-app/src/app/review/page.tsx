"use client";

import { useState } from "react";
import { ChatPanel } from "@/components/ChatPanel";

export default function ReviewPage() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [autoSend, setAutoSend] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [starting, setStarting] = useState(false);

  async function startReview() {
    const trimmed = code.trim();
    if (!trimmed || starting) return;
    setStarting(true);
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "REVIEW", title: "Code review" }),
      });
      const data = await res.json();
      setConversationId(data.conversation.id);
      setAutoSend(
        `Please review this code:\n\n\`\`\`\n${trimmed}\n\`\`\``,
      );
    } finally {
      setStarting(false);
    }
  }

  if (conversationId) {
    return (
      <div className="flex h-[calc(100vh-56px)] flex-col">
        <div className="border-b border-[var(--border)] px-6 py-3 text-sm text-[var(--muted)]">
          Code review
        </div>
        <div className="flex-1">
          <ChatPanel
            conversationId={conversationId}
            initialMessages={[]}
            autoSend={autoSend ?? undefined}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-8">
      <h1 className="mb-1 text-xl font-semibold">Code review</h1>
      <p className="mb-6 text-sm text-[var(--muted)]">
        Paste real code from your own project. The tutor will point out bugs
        first, then design/readability, then style — and you can keep the
        conversation going.
      </p>
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        spellCheck={false}
        rows={16}
        placeholder="Paste your code here…"
        className="w-full rounded-md border border-[var(--border)] bg-black/40 px-3 py-3 font-mono text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
      />
      <button
        onClick={startReview}
        disabled={!code.trim() || starting}
        className="mt-4 rounded-md bg-[var(--accent-strong)] px-4 py-2 text-sm font-medium text-[#04120b] transition hover:opacity-90 disabled:opacity-40"
      >
        {starting ? "Starting…" : "Start review"}
      </button>
    </div>
  );
}
