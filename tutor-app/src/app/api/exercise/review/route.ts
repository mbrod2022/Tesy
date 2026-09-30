import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { chatCompletion, extractJson, LlmUnavailableError } from "@/lib/llm";
import { exerciseReviewPrompt } from "@/lib/systemPrompts";

type ReviewResult = { passed: boolean; feedback: string };

function nextStatus(
  current: string | undefined,
  passed: boolean,
): "NOT_STARTED" | "IN_PROGRESS" | "PRACTICED" | "MASTERED" {
  if (passed) {
    return current === "MASTERED" ? "MASTERED" : "PRACTICED";
  }
  if (!current || current === "NOT_STARTED") return "IN_PROGRESS";
  return current as "IN_PROGRESS" | "PRACTICED" | "MASTERED";
}

export async function POST(req: Request) {
  const { topicId, conversationId, language, prompt, code, output } =
    await req.json();

  if (
    typeof topicId !== "string" ||
    typeof conversationId !== "string" ||
    typeof code !== "string"
  ) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const topic = await prisma.topic.findUnique({ where: { id: topicId } });
  if (!topic) {
    return NextResponse.json({ error: "Topic not found" }, { status: 404 });
  }

  const submission = `Exercise prompt:\n${prompt}\n\nStudent's code:\n\`\`\`${language}\n${code}\n\`\`\`\n\nCaptured console output:\n${output || "(no output)"}`;

  try {
    const raw = await chatCompletion([
      { role: "system", content: exerciseReviewPrompt(topic) },
      { role: "user", content: submission },
    ]);
    const review = extractJson<ReviewResult>(raw);

    await prisma.message.create({
      data: { conversationId, role: "USER", content: submission },
    });
    await prisma.message.create({
      data: {
        conversationId,
        role: "ASSISTANT",
        content: `${review.passed ? "✅ Looks right." : "⚠️ Not quite there yet."}\n\n${review.feedback}`,
      },
    });

    await prisma.exerciseAttempt.create({
      data: {
        topicId,
        conversationId,
        language: language ?? "javascript",
        prompt: prompt ?? "",
        code,
        passed: !!review.passed,
        feedback: review.feedback,
      },
    });

    const existing = await prisma.progress.findUnique({ where: { topicId } });
    await prisma.progress.upsert({
      where: { topicId },
      create: {
        topicId,
        status: nextStatus(existing?.status, !!review.passed),
      },
      update: {
        status: nextStatus(existing?.status, !!review.passed),
      },
    });

    return NextResponse.json({ review });
  } catch (err) {
    const message =
      err instanceof LlmUnavailableError
        ? err.message
        : "Could not review the exercise right now.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
