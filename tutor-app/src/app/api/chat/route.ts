import { prisma } from "@/lib/prisma";
import {
  streamChatCompletion,
  type ChatMessage,
  LlmUnavailableError,
} from "@/lib/llm";
import { chatSystemPrompt, reviewSystemPrompt } from "@/lib/systemPrompts";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { conversationId, content } = await req.json();

  if (typeof conversationId !== "string" || typeof content !== "string") {
    return new Response("Missing conversationId or content", {
      status: 400,
    });
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { topic: true, messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!conversation) {
    return new Response("Conversation not found", { status: 404 });
  }

  await prisma.message.create({
    data: { conversationId, role: "USER", content },
  });

  const shouldAutoTitle =
    conversation.title === "New conversation" &&
    conversation.messages.length === 0;

  if (shouldAutoTitle) {
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { title: content.slice(0, 60) },
    });
  }

  const systemPrompt =
    conversation.mode === "REVIEW"
      ? reviewSystemPrompt()
      : chatSystemPrompt(
          conversation.topic
            ? {
                title: conversation.topic.title,
                summary: conversation.topic.summary,
              }
            : undefined,
        );

  const history: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...conversation.messages.map((m) => ({
      role: m.role.toLowerCase() as "user" | "assistant",
      content: m.content,
    })),
    { role: "user", content },
  ];

  const encoder = new TextEncoder();
  let full = "";

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const delta of streamChatCompletion(history)) {
          full += delta;
          controller.enqueue(encoder.encode(delta));
        }
      } catch (err) {
        const message =
          err instanceof LlmUnavailableError
            ? err.message
            : "The local model failed to respond.";
        controller.enqueue(encoder.encode(`\n\n[error] ${message}`));
      } finally {
        if (full.trim().length > 0) {
          await prisma.message.create({
            data: { conversationId, role: "ASSISTANT", content: full },
          });
        }
        await prisma.conversation.update({
          where: { id: conversationId },
          data: { updatedAt: new Date() },
        });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
