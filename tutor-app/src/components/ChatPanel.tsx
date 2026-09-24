"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import type { ApiMessage } from "@/lib/types";

type LocalMessage = {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
};

function toLocalMessages(messages: ApiMessage[]): LocalMessage[] {
  return messages
    .filter((m): m is ApiMessage & { role: "USER" | "ASSISTANT" } =>
      m.role === "USER" || m.role === "ASSISTANT",
    )
    .map((m) => ({ id: m.id, role: m.role, content: m.content }));
}

export function ChatPanel({
  conversationId,
  initialMessages,
  placeholder,
  autoSend,
  onExchangeComplete,
}: {
  conversationId: string;
  initialMessages: ApiMessage[];
  placeholder?: string;
  autoSend?: string;
  onExchangeComplete?: () => void;
}) {
  const [messages, setMessages] = useState<LocalMessage[]>(
    toLocalMessages(initialMessages),
  );
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const autoSent = useRef(false);

  useEffect(() => {
    setMessages(toLocalMessages(initialMessages));
  }, [conversationId, initialMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (autoSend && messages.length === 0 && !autoSent.current) {
      autoSent.current = true;
      send(autoSend);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSend, conversationId]);

  async function send(override?: string) {
    const content = (override ?? input).trim();
    if (!content || sending) return;
    setInput("");
    setSending(true);

    const userMsg: LocalMessage = {
      id: `local-${Date.now()}`,
      role: "USER",
      content,
    };
    const assistantId = `local-assistant-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      userMsg,
      { id: assistantId, role: "ASSISTANT", content: "" },
    ]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, content }),
      });

      if (!res.body) throw new Error("No response body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: m.content + chunk } : m,
          ),
        );
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content:
                  m.content ||
                  "[error] Could not reach the local model. Is LM Studio running?",
              }
            : m,
        ),
      );
    } finally {
      setSending(false);
      onExchangeComplete?.();
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <p className="mx-auto max-w-md pt-10 text-center text-sm text-[var(--muted)]">
            {placeholder ?? "Ask anything, or say what you want to learn."}
          </p>
        )}
        <div className="mx-auto flex max-w-2xl flex-col gap-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={clsx(
                "whitespace-pre-wrap rounded-lg px-4 py-3 text-sm leading-relaxed",
                m.role === "USER"
                  ? "self-end bg-[var(--accent-strong)] text-[#04120b]"
                  : "self-start bg-[var(--panel)] text-[var(--foreground)]",
              )}
            >
              {m.content || (m.role === "ASSISTANT" && sending ? "…" : "")}
            </div>
          ))}
        </div>
        <div ref={bottomRef} />
      </div>
      <div className="border-t border-[var(--border)] p-3">
        <div className="mx-auto flex max-w-2xl gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={2}
            placeholder="Type a message… (Enter to send, Shift+Enter for newline)"
            className="flex-1 resize-none rounded-md border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
          />
          <button
            onClick={() => send()}
            disabled={sending || !input.trim()}
            className="rounded-md bg-[var(--accent-strong)] px-4 py-2 text-sm font-medium text-[#04120b] transition hover:opacity-90 disabled:opacity-40"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
