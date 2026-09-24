import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { chatCompletion, extractJson, LlmUnavailableError } from "@/lib/llm";
import { quizGradingPrompt } from "@/lib/systemPrompts";

type GradeResult = {
  results: { correct: boolean; feedback: string }[];
  score: number;
  total: number;
  overallFeedback: string;
};

function statusForRatio(ratio: number): "IN_PROGRESS" | "PRACTICED" | "MASTERED" {
  if (ratio >= 0.8) return "MASTERED";
  if (ratio >= 0.5) return "PRACTICED";
  return "IN_PROGRESS";
}

export async function POST(req: Request) {
  const { topicId, conversationId, qa } = await req.json();
  if (
    typeof topicId !== "string" ||
    typeof conversationId !== "string" ||
    !Array.isArray(qa)
  ) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const topic = await prisma.topic.findUnique({ where: { id: topicId } });
  if (!topic) {
    return NextResponse.json({ error: "Topic not found" }, { status: 404 });
  }

  const qaText = (qa as { question: string; answer: string }[])
    .map(
      (item, i) =>
        `Q${i + 1}: ${item.question}\nA${i + 1}: ${item.answer || "(no answer given)"}`,
    )
    .join("\n\n");

  try {
    const raw = await chatCompletion([
      { role: "system", content: quizGradingPrompt(topic) },
      { role: "user", content: qaText },
    ]);
    const grade = extractJson<GradeResult>(raw);

    await prisma.message.create({
      data: {
        conversationId,
        role: "USER",
        content: qaText,
      },
    });
    await prisma.message.create({
      data: {
        conversationId,
        role: "ASSISTANT",
        content: `Score: ${grade.score}/${grade.total}\n\n${grade.overallFeedback}`,
      },
    });

    const attempt = await prisma.quizAttempt.create({
      data: {
        topicId,
        conversationId,
        score: grade.score,
        total: grade.total,
      },
    });

    const ratio = grade.total > 0 ? grade.score / grade.total : 0;
    const existing = await prisma.progress.findUnique({ where: { topicId } });
    const bestRatio =
      existing?.bestQuizScore != null && existing?.bestQuizTotal
        ? Math.max(ratio, existing.bestQuizScore / existing.bestQuizTotal)
        : ratio;

    await prisma.progress.upsert({
      where: { topicId },
      create: {
        topicId,
        status: statusForRatio(ratio),
        bestQuizScore: grade.score,
        bestQuizTotal: grade.total,
      },
      update: {
        status: statusForRatio(bestRatio),
        bestQuizScore:
          bestRatio === ratio ? grade.score : existing?.bestQuizScore,
        bestQuizTotal:
          bestRatio === ratio ? grade.total : existing?.bestQuizTotal,
      },
    });

    return NextResponse.json({ grade, attemptId: attempt.id });
  } catch (err) {
    const message =
      err instanceof LlmUnavailableError
        ? err.message
        : "Could not grade the quiz right now.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
