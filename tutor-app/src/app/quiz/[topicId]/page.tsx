import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { QuizRunner } from "@/components/QuizRunner";

export default async function QuizPage({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  const { topicId } = await params;
  const topic = await prisma.topic.findUnique({ where: { id: topicId } });
  if (!topic) notFound();

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-8">
      <h1 className="mb-1 text-xl font-semibold">Quiz: {topic.title}</h1>
      <p className="mb-6 text-sm text-[var(--muted)]">{topic.summary}</p>
      <QuizRunner topicId={topic.id} />
    </div>
  );
}
