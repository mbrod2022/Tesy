"use client";

import { useState } from "react";

type Question = { question: string; type: string };
type GradeResult = {
  results: { correct: boolean; feedback: string }[];
  score: number;
  total: number;
  overallFeedback: string;
};

export function QuizRunner({ topicId }: { topicId: string }) {
  const [phase, setPhase] = useState<"idle" | "loading" | "answering" | "grading" | "done" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [grade, setGrade] = useState<GradeResult | null>(null);

  async function start() {
    setPhase("loading");
    setError(null);
    try {
      const res = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate quiz");
      setConversationId(data.conversationId);
      setQuestions(data.questions);
      setAnswers(new Array(data.questions.length).fill(""));
      setPhase("answering");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setPhase("error");
    }
  }

  async function submit() {
    if (!conversationId) return;
    setPhase("grading");
    setError(null);
    try {
      const qa = questions.map((q, i) => ({
        question: q.question,
        answer: answers[i],
      }));
      const res = await fetch("/api/quiz/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId, conversationId, qa }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to grade quiz");
      setGrade(data.grade);
      setPhase("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setPhase("error");
    }
  }

  if (phase === "idle") {
    return (
      <button
        onClick={start}
        className="rounded-md bg-[var(--accent-strong)] px-4 py-2 text-sm font-medium text-[#04120b] transition hover:opacity-90"
      >
        Start quiz
      </button>
    );
  }

  if (phase === "loading") {
    return <p className="text-sm text-[var(--muted)]">Generating questions…</p>;
  }

  if (phase === "error") {
    return (
      <div className="rounded-md border border-red-400/40 bg-red-400/5 p-4 text-sm text-red-300">
        {error}
        <button
          onClick={start}
          className="ml-3 underline decoration-dotted hover:text-red-200"
        >
          Try again
        </button>
      </div>
    );
  }

  if (phase === "done" && grade) {
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-lg border border-[var(--accent)]/40 bg-[var(--panel)] p-4">
          <p className="text-lg font-semibold text-[var(--accent)]">
            Score: {grade.score}/{grade.total}
          </p>
          <p className="mt-2 text-sm text-[var(--foreground)]">
            {grade.overallFeedback}
          </p>
        </div>
        {questions.map((q, i) => (
          <div
            key={i}
            className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-4 text-sm"
          >
            <p className="mb-1 font-medium">{q.question}</p>
            <p className="mb-2 text-[var(--muted)]">
              Your answer: {answers[i] || "(no answer)"}
            </p>
            <p
              className={
                grade.results[i]?.correct
                  ? "text-[var(--accent)]"
                  : "text-amber-300"
              }
            >
              {grade.results[i]?.correct ? "Correct — " : "Needs work — "}
              {grade.results[i]?.feedback}
            </p>
          </div>
        ))}
        <button
          onClick={start}
          className="self-start rounded-md border border-[var(--border)] px-4 py-2 text-sm transition hover:border-[var(--accent)]"
        >
          Take another quiz
        </button>
      </div>
    );
  }

  // answering or grading
  return (
    <div className="flex flex-col gap-4">
      {questions.map((q, i) => (
        <div key={i}>
          <label className="mb-1 block text-sm font-medium">
            {i + 1}. {q.question}
          </label>
          <textarea
            value={answers[i]}
            onChange={(e) => {
              const next = [...answers];
              next[i] = e.target.value;
              setAnswers(next);
            }}
            rows={2}
            className="w-full resize-none rounded-md border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
          />
        </div>
      ))}
      <button
        onClick={submit}
        disabled={phase === "grading"}
        className="self-start rounded-md bg-[var(--accent-strong)] px-4 py-2 text-sm font-medium text-[#04120b] transition hover:opacity-90 disabled:opacity-40"
      >
        {phase === "grading" ? "Grading…" : "Submit answers"}
      </button>
    </div>
  );
}
