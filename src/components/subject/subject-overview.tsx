"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Pencil, Settings, Loader2 } from "lucide-react";
import { useSubjectDetail } from "@/hooks/subjects";
import { Button } from "@/components/ui/button";
import { formatRelativeDate, percent } from "@/lib/utils";

export function SubjectOverview({ slug }: { slug: string }) {
  const router = useRouter();
  const { data, isLoading, error } = useSubjectDetail(slug);

  const statistics = useMemo(() => {
    if (!data?.items) {
      return {
        easy: 0,
        medium: 0,
        hard: 0,
        seen: 0,
      };
    }

    return data.items.reduce(
      (acc, item) => {
        acc.easy += item.progress.easyCount;
        acc.medium += item.progress.mediumCount;
        acc.hard += item.progress.hardCount;
        acc.seen += item.progress.timesSeen;
        return acc;
      },
      { easy: 0, medium: 0, hard: 0, seen: 0 }
    );
  }, [data?.items]);

  if (isLoading) {
    return (
      <div className="flex h-72 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-zinc-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-8 text-center text-red-300">
        {error.message}
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { subject, items } = data;
  const latest = items
    .map((item) => item.progress.lastSeen)
    .filter(Boolean)
    .sort()
    .pop();

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Subject</p>
            <h2 className="text-3xl font-semibold text-white/90">{subject.name}</h2>
            <p className="text-sm text-zinc-400">
              {subject.itemCount} items • Last studied {formatRelativeDate(latest ?? null)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              className="rounded-full"
              onClick={() => router.push(`/subjects/${slug}/flashcards`)}
            >
              <BookOpen size={18} className="mr-2" /> Flashcards
            </Button>
            <Button
              variant="secondary"
              className="rounded-full"
              onClick={() => router.push(`/subjects/${slug}/quiz`)}
            >
              <Pencil size={18} className="mr-2" /> Quiz
            </Button>
            <Button
              variant="ghost"
              className="rounded-full text-zinc-300"
              onClick={() => router.push(`/subjects/${slug}/manage`)}
            >
              <Settings size={18} className="mr-2" /> Manage
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Easy</p>
            <p className="mt-2 text-3xl font-semibold text-emerald-300">
              {statistics.easy}
            </p>
            <p className="text-xs text-zinc-500">{percent(statistics.easy, statistics.seen)}% of reviews</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Medium</p>
            <p className="mt-2 text-3xl font-semibold text-amber-300">
              {statistics.medium}
            </p>
            <p className="text-xs text-zinc-500">{percent(statistics.medium, statistics.seen)}% of reviews</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Hard</p>
            <p className="mt-2 text-3xl font-semibold text-red-300">
              {statistics.hard}
            </p>
            <p className="text-xs text-zinc-500">{percent(statistics.hard, statistics.seen)}% of reviews</p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6">
          <h3 className="text-lg font-medium text-white/90">Study tips</h3>
          <ul className="mt-4 grid gap-3 text-sm text-zinc-400">
            <li>• Start with flashcards to refresh your memory.</li>
            <li>• Follow up with quiz mode to challenge recall.</li>
            <li>• Mark items as hard when you hesitate—Woosh will resurface them sooner.</li>
          </ul>
        </div>
      </section>

      <aside className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        <h3 className="text-lg font-semibold text-white/90">Recent activity</h3>
        <ul className="flex flex-col gap-4 text-sm text-zinc-400">
          {items.slice(0, 6).map((item) => (
            <li key={item.id} className="flex flex-col gap-1 rounded-2xl border border-white/5 bg-white/5 p-4">
              <span className="text-zinc-200">{item.term}</span>
              <span className="text-xs uppercase tracking-[0.25em] text-zinc-500">
                Seen {item.progress.timesSeen} times • Next due {formatRelativeDate(item.progress.nextDue)}
              </span>
            </li>
          ))}
          {items.length === 0 ? (
            <li className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-center text-xs uppercase tracking-[0.3em] text-zinc-500">
              No items yet — add content to start studying.
            </li>
          ) : null}
        </ul>
      </aside>
    </div>
  );
}
