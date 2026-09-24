import { ExercisePanel } from "@/components/ExercisePanel";

export default async function ExercisePage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>;
}) {
  const { topic } = await searchParams;

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-8">
      <h1 className="mb-1 text-xl font-semibold">Coding exercise</h1>
      <p className="mb-6 text-sm text-[var(--muted)]">
        The tutor proposes a small exercise, you write the code, run it right
        here in the browser, and get reviewed.
      </p>
      <ExercisePanel initialTopicId={topic ?? null} />
    </div>
  );
}
