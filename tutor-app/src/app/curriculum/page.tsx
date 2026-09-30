import { prisma } from "@/lib/prisma";
import { TRACK_LABELS, TRACK_ORDER, youtubeSearchUrl } from "@/lib/curriculum";
import { StatusBadge } from "@/components/StatusBadge";
import { TopicActions } from "@/components/TopicActions";

export default async function CurriculumPage() {
  const topics = await prisma.topic.findMany({
    include: { progress: true },
    orderBy: [{ track: "asc" }, { order: "asc" }],
  });

  const byTrack = TRACK_ORDER.map((track) => ({
    track,
    topics: topics.filter((t) => t.track === track),
  }));

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-8">
      <h1 className="mb-1 text-xl font-semibold">Curriculum</h1>
      <p className="mb-8 text-sm text-[var(--muted)]">
        Pick a topic to discuss with the tutor, take a quiz, or try a coding
        exercise. Progress updates automatically from your quiz and exercise
        results.
      </p>

      <div className="flex flex-col gap-10">
        {byTrack.map(({ track, topics: trackTopics }) => (
          <section key={track}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--accent)]">
              {TRACK_LABELS[track]}
            </h2>
            <div className="flex flex-col gap-3">
              {trackTopics.map((topic) => (
                <div
                  key={topic.id}
                  className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-4"
                >
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <h3 className="text-sm font-medium">{topic.title}</h3>
                    <StatusBadge
                      status={topic.progress?.status ?? "NOT_STARTED"}
                    />
                  </div>
                  <p className="mb-3 text-xs text-[var(--muted)]">
                    {topic.summary}
                  </p>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <TopicActions topicId={topic.id} />
                    <a
                      href={youtubeSearchUrl(`${topic.title} tutorial`)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-[var(--muted)] underline decoration-dotted hover:text-[var(--foreground)]"
                    >
                      Find a video ↗
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
