import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { chatCompletion, extractJson, LlmUnavailableError } from "@/lib/llm";
import { exerciseGenerationPrompt } from "@/lib/systemPrompts";

type Exercise = {
  language: "javascript" | "python";
  prompt: string;
  starterCode: string;
};

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
      title: `Exercise: ${topic.title}`,
      mode: "EXERCISE",
      topicId: topic.id,
    },
  });

  try {
    const raw = await chatCompletion([
      { role: "system", content: exerciseGenerationPrompt(topic) },
      { role: "user", content: "Give me an exercise now." },
    ]);
    const exercise = extractJson<Exercise>(raw);

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: "ASSISTANT",
        content: JSON.stringify(exercise),
      },
    });

    return NextResponse.json({ conversationId: conversation.id, exercise });
  } catch (err) {
    const message =
      err instanceof LlmUnavailableError
        ? err.message
        : "Could not generate an exercise right now.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
