"use client";

import { useCallback, useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ChatPanel } from "@/components/ChatPanel";
import type { ApiConversation, ApiConversationDetail } from "@/lib/types";

export default function HomePage() {
  const [conversations, setConversations] = useState<ApiConversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ApiConversationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const refreshList = useCallback(async () => {
    const res = await fetch("/api/conversations");
    const data = await res.json();
    setConversations(data.conversations ?? []);
    return data.conversations as ApiConversation[];
  }, []);

  useEffect(() => {
    refreshList()
      .then((list) => {
        const chatConvos = list.filter((c) => c.mode === "CHAT");
        if (chatConvos.length > 0) setSelectedId(chatConvos[0].id);
      })
      .finally(() => setLoading(false));
  }, [refreshList]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    fetch(`/api/conversations/${selectedId}`)
      .then((r) => r.json())
      .then((d) => setDetail(d.conversation ?? null));
  }, [selectedId]);

  async function handleNew() {
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "CHAT" }),
    });
    const data = await res.json();
    await refreshList();
    setSelectedId(data.conversation.id);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/conversations/${id}`, { method: "DELETE" });
    const list = await refreshList();
    if (selectedId === id) {
      const chatConvos = list.filter((c) => c.mode === "CHAT");
      setSelectedId(chatConvos[0]?.id ?? null);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-[var(--muted)]">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--panel)] px-4 py-2 md:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--foreground)]"
        >
          ☰ Conversations
        </button>
        <span className="truncate pl-3 text-sm text-[var(--muted)]">
          {detail?.title ?? ""}
        </span>
      </div>
      <Sidebar
        conversations={conversations.filter((c) => c.mode === "CHAT")}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onNew={handleNew}
        onDelete={handleDelete}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="min-h-0 flex-1">
        {selectedId && detail ? (
          <ChatPanel
            key={selectedId}
            conversationId={selectedId}
            initialMessages={detail.messages}
            onExchangeComplete={refreshList}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <p className="text-sm text-[var(--muted)]">
              No conversation selected.
            </p>
            <button
              onClick={handleNew}
              className="rounded-md bg-[var(--accent-strong)] px-4 py-2 text-sm font-medium text-[#04120b] transition hover:opacity-90"
            >
              Start a new chat
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
