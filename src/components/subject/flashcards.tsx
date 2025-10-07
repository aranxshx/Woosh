"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Shuffle, Eye, EyeOff } from "lucide-react";
import { useSubjectDetail } from "@/hooks/subjects";
import { useSaveProgress } from "@/hooks/progress";
import { applyEvaluation, pickNextItem } from "@/lib/scheduler";
import type { ItemWithProgress, EvaluationLevel } from "@/types/models";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

function buildChoiceLabel(index: number) {
  return String.fromCharCode(65 + index);
}

export function SubjectFlashcards({ slug }: { slug: string }) {
  const { data, isLoading, error } = useSubjectDetail(slug);
  const { mutateAsync: saveProgress, isPending: isSaving } = useSaveProgress();
  const [items, setItems] = useState<ItemWithProgress[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    if (data?.items) {
      setItems(data.items);
    }
  }, [data?.items]);

  const currentItem = useMemo(() => pickNextItem(items), [items]);

  const handleEvaluation = async (level: EvaluationLevel) => {
    if (!currentItem) return;
    const { progress } = applyEvaluation(currentItem, level);
    setShowAnswer(false);
    setItems((prev) =>
      prev.map((item) =>
        item.id === currentItem.id
          ? {
              ...item,
              progress,
            }
          : item
      )
    );
    try {
      await saveProgress({
        itemId: currentItem.id,
        statsPatch: progress,
      });
    } catch (err) {
      console.error("Failed to save progress", err);
    }
  };

  const handleReveal = () => setShowAnswer((prev) => !prev);

  const handleShuffle = () => {
    if (!data?.items) return;
    const shuffled = [...data.items].sort(() => Math.random() - 0.5);
    setItems(shuffled);
    setShowAnswer(false);
  };

  if (isLoading) {
    return (
      <div className="flex h-80 items-center justify-center">
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

  if (!data || data.items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-12 text-center">
        <p className="text-lg font-medium text-white/80">No items yet.</p>
        <p className="mt-2 text-sm text-zinc-400">
          Add content in Manage mode to start your flashcard session.
        </p>
      </div>
    );
  }

  if (!currentItem) {
    return (
      <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-12 text-center text-emerald-200">
        All caught up for now! Come back later when more items are due.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Flashcards</p>
          <h1 className="text-3xl font-semibold text-white/90">{data.subject.name}</h1>
          <p className="text-sm text-zinc-400">
            {data.items.length} cards • Next due from spaced repetition queue.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" className="rounded-full" onClick={handleShuffle}>
            <Shuffle size={16} className="mr-2" /> Shuffle
          </Button>
          <Button variant="ghost" className="rounded-full text-zinc-300" onClick={handleReveal}>
            {showAnswer ? (
              <>
                <EyeOff size={16} className="mr-2" /> Hide
              </>
            ) : (
              <>
                <Eye size={16} className="mr-2" /> Reveal
              </>
            )}
          </Button>
        </div>
      </header>

      <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-10">
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Term</p>
        <h2 className="mt-4 text-3xl font-semibold text-white/90">{currentItem.term}</h2>
        <p className="mt-8 text-sm text-zinc-500">
          {showAnswer ? "Definition" : "Think it through before revealing"}
        </p>
        <div
          className={cn(
            "mt-4 rounded-2xl border border-white/10 bg-white/5 p-6 text-lg text-white/80 transition-all",
            showAnswer ? "opacity-100" : "blur-md opacity-40"
          )}
        >
          {currentItem.definition}
        </div>
        {showAnswer && currentItem.question ? (
          <div className="mt-8">
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Self test</p>
            <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm text-white/80">{currentItem.question}</p>
              {currentItem.choices.length > 0 ? (
                <ul className="mt-4 grid gap-2 text-sm text-zinc-300">
                  {currentItem.choices.map((choice, index) => (
                    <li
                      key={choice}
                      className={cn(
                        "rounded-xl border border-white/10 bg-white/5 px-4 py-2",
                        index === currentItem.answerIndex
                          ? "border-emerald-400/60 bg-emerald-400/10 text-emerald-200"
                          : ""
                      )}
                    >
                      <span className="mr-2 text-xs text-zinc-500">
                        {buildChoiceLabel(index)}.
                      </span>
                      {choice}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        ) : null}
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2 text-xs uppercase tracking-[0.3em] text-zinc-500">
          <span>Seen {currentItem.progress.timesSeen}×</span>
          <span>Next {currentItem.progress.nextDue ? "scheduled" : "new"}</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            disabled={isSaving}
            onClick={() => handleEvaluation("hard")}
            className="rounded-full bg-red-500/80 text-white/90 hover:bg-red-500"
          >
            Hard
          </Button>
          <Button
            disabled={isSaving}
            onClick={() => handleEvaluation("medium")}
            className="rounded-full bg-amber-500/80 text-white/90 hover:bg-amber-500"
          >
            Medium
          </Button>
          <Button
            disabled={isSaving}
            onClick={() => handleEvaluation("easy")}
            className="rounded-full bg-emerald-500/80 text-white/90 hover:bg-emerald-500"
          >
            Easy
          </Button>
        </div>
      </footer>
    </div>
  );
}
