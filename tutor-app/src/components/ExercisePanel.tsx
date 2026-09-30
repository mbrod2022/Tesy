"use client";

import { useEffect, useState } from "react";
import { runJavaScript, runPython } from "@/lib/sandbox";

type Topic = { id: string; title: string; track: string };
type Exercise = {
  language: "javascript" | "python";
  prompt: string;
  starterCode: string;
};
type Review = { passed: boolean; feedback: string };

export function ExercisePanel({
  initialTopicId,
}: {
  initialTopicId: string | null;
}) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [topicId, setTopicId] = useState<string | null>(initialTopicId);
  const [generating, setGenerating] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [review, setReview] = useState<Review | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/topics")
      .then((r) => r.json())
      .then((d) => setTopics(d.topics ?? []));
  }, []);

  useEffect(() => {
    if (initialTopicId) generate(initialTopicId);
  }, [initialTopicId]);

  async function generate(id: string) {
    setGenerating(true);
    setError(null);
    setExercise(null);
    setOutput(null);
    setReview(null);
    try {
      const res = await fetch("/api/exercise/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate exercise");
      setConversationId(data.conversationId);
      setExercise(data.exercise);
      setCode(data.exercise.starterCode);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setGenerating(false);
    }
  }

  async function run() {
    if (!exercise) return;
    setRunning(true);
    setOutput(null);
    try {
      const result =
        exercise.language === "python"
          ? await runPython(code)
          : await runJavaScript(code);
      setOutput(result);
    } catch (err) {
      setOutput(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setRunning(false);
    }
  }

  async function submitForReview() {
    if (!exercise || !topicId || !conversationId) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/exercise/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicId,
          conversationId,
          language: exercise.language,
          prompt: exercise.prompt,
          code,
          output,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to review exercise");
      setReview(data.review);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={topicId ?? ""}
          onChange={(e) => setTopicId(e.target.value || null)}
          className="rounded-md border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-sm"
        >
          <option value="">Choose a topic…</option>
          {topics.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </select>
        <button
          onClick={() => topicId && generate(topicId)}
          disabled={!topicId || generating}
          className="rounded-md bg-[var(--accent-strong)] px-4 py-2 text-sm font-medium text-[#04120b] transition hover:opacity-90 disabled:opacity-40"
        >
          {generating ? "Generating…" : exercise ? "New exercise" : "Generate exercise"}
        </button>
      </div>

      {error && (
        <p className="rounded-md border border-red-400/40 bg-red-400/5 p-3 text-sm text-red-300">
          {error}
        </p>
      )}

      {exercise && (
        <>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-4 text-sm whitespace-pre-wrap">
            <span className="mb-1 block text-xs uppercase tracking-wide text-[var(--accent)]">
              {exercise.language}
            </span>
            {exercise.prompt}
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            rows={14}
            className="w-full rounded-md border border-[var(--border)] bg-black/40 px-3 py-3 font-mono text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
          />

          <div className="flex flex-wrap gap-2">
            <button
              onClick={run}
              disabled={running}
              className="rounded-md border border-[var(--border)] px-4 py-2 text-sm transition hover:border-[var(--accent)] disabled:opacity-40"
            >
              {running ? "Running…" : "Run code"}
            </button>
            <button
              onClick={submitForReview}
              disabled={output === null || submitting}
              className="rounded-md bg-[var(--accent-strong)] px-4 py-2 text-sm font-medium text-[#04120b] transition hover:opacity-90 disabled:opacity-40"
            >
              {submitting ? "Reviewing…" : "Submit for review"}
            </button>
          </div>

          {output !== null && (
            <div className="rounded-md border border-[var(--border)] bg-black/60 p-3 font-mono text-xs whitespace-pre-wrap text-[var(--foreground)]">
              {output}
            </div>
          )}

          {review && (
            <div
              className={
                "rounded-lg border p-4 text-sm whitespace-pre-wrap " +
                (review.passed
                  ? "border-[var(--accent)]/40 bg-[var(--accent)]/5"
                  : "border-amber-300/40 bg-amber-300/5")
              }
            >
              <p className="mb-1 font-medium">
                {review.passed ? "✅ Looks right" : "⚠️ Not quite there yet"}
              </p>
              {review.feedback}
            </div>
          )}
        </>
      )}
    </div>
  );
}
