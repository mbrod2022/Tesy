// Thin client for a local, OpenAI-compatible chat completions API
// (LM Studio's "Local Server" by default). Nothing here ever leaves
// the machine LM_BASE_URL points at.

export type ChatRole = "system" | "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

function baseUrl(): string {
  return process.env.LLM_BASE_URL ?? "http://localhost:1234/v1";
}

function model(): string {
  return process.env.LLM_MODEL ?? "qwen2.5-coder-7b-instruct";
}

export class LlmUnavailableError extends Error {
  constructor(cause?: unknown) {
    super(
      `Could not reach the local model at ${baseUrl()}. Make sure LM Studio (or another OpenAI-compatible server) is running and LLM_BASE_URL/LLM_MODEL are set correctly.`,
    );
    this.name = "LlmUnavailableError";
    this.cause = cause;
  }
}

/**
 * Non-streaming completion. Used where we need the full text at once
 * (quiz generation/grading, exercise review) rather than a live stream.
 */
export async function chatCompletion(
  messages: ChatMessage[],
  opts?: { temperature?: number },
): Promise<string> {
  let res: Response;
  try {
    res = await fetch(`${baseUrl()}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: model(),
        messages,
        temperature: opts?.temperature ?? 0.7,
        stream: false,
      }),
    });
  } catch (err) {
    throw new LlmUnavailableError(err);
  }

  if (!res.ok) {
    throw new LlmUnavailableError(
      new Error(`Local model server responded ${res.status}`),
    );
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new LlmUnavailableError(new Error("Unexpected response shape"));
  }
  return content;
}

/**
 * Streaming completion. Returns an async generator of text deltas so
 * callers (route handlers) can forward chunks straight to the browser.
 */
export async function* streamChatCompletion(
  messages: ChatMessage[],
  opts?: { temperature?: number },
): AsyncGenerator<string> {
  let res: Response;
  try {
    res = await fetch(`${baseUrl()}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: model(),
        messages,
        temperature: opts?.temperature ?? 0.7,
        stream: true,
      }),
    });
  } catch (err) {
    throw new LlmUnavailableError(err);
  }

  if (!res.ok || !res.body) {
    throw new LlmUnavailableError(
      new Error(`Local model server responded ${res.status}`),
    );
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice("data:".length).trim();
      if (payload === "[DONE]") return;
      try {
        const parsed = JSON.parse(payload);
        const delta = parsed?.choices?.[0]?.delta?.content;
        if (typeof delta === "string" && delta.length > 0) {
          yield delta;
        }
      } catch {
        // Ignore malformed/partial SSE chunks.
      }
    }
  }
}

/**
 * Extract the first JSON object/array from a model response, tolerating
 * markdown code fences and leading/trailing commentary.
 */
export function extractJson<T>(text: string): T {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.search(/[[{]/);
  if (start === -1) {
    throw new Error("No JSON found in model response");
  }
  const slice = candidate.slice(start);
  // Trim trailing content after the last closing brace/bracket.
  const lastBrace = Math.max(slice.lastIndexOf("}"), slice.lastIndexOf("]"));
  const jsonText = lastBrace === -1 ? slice : slice.slice(0, lastBrace + 1);
  return JSON.parse(jsonText) as T;
}
