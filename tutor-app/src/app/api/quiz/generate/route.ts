import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { chatCompletion, extractJson, LlmUnavailableError } from "@/lib/llm";
import { quizGenerationPrompt } from "@/lib/systemPrompts";

type QuizQuestion = { question: string; type: string };

export async function POST(req: Request) {
  const { topicId } = await req.json();
  if (typeof topicId !== "string") {
    return NextResponse.json({ error: "Missing topicId" }, { status: 400 });
  }

  const topic = await prisma.topic.findUnique({ where: { id: topicId } });
  if (!topic) {
    return NextResponse.json({ error: "Topic not found" }, { status: 404 });
  }

  const conversation = await prisma.conversation.create({
    data: {
      title: `Quiz: ${topic.title}`,
      mode: "QUIZ",
      topicId: topic.id,
    },
  });

  try {
    const raw = await chatCompletion([
      { role: "system", content: quizGenerationPrompt(topic) },
      { role: "user", content: "Generate the quiz now." },
    ]);
    const questions = extractJson<QuizQuestion[]>(raw);

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: "ASSISTANT",
        content: JSON.stringify(questions),
      },
    });

    return NextResponse.json({ conversationId: conversation.id, questions });
  } catch (err) {
    const message =
      err instanceof LlmUnavailableError
        ? err.message
        : "Could not generate a quiz right now.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
