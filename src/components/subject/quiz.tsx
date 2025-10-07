"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, RotateCcw } from "lucide-react";
import { useSubjectDetail } from "@/hooks/subjects";
import { useSaveProgress } from "@/hooks/progress";
import { applyEvaluation } from "@/lib/scheduler";
import type { ItemWithProgress, EvaluationLevel } from "@/types/models";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type QuizCard = {
  item: ItemWithProgress;
  prompt: string;
  choices: string[];
  answerIndex: number;
};

function shuffle<T>(values: T[]) {
  const copy = [...values];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function createQuizCard(item: ItemWithProgress, pool: ItemWithProgress[]): QuizCard {
  if (item.choices.length >= 2 && item.answerIndex !== null) {
    return {
      item,
      prompt: item.question ?? `What does “${item.term}” mean?`,
      choices: item.choices,
      answerIndex: item.answerIndex,
    };
  }

  const alternatives = pool
    .filter((other) => other.id !== item.id)
    .map((other) => other.definition)
    .filter(Boolean);

  const distractors = shuffle(alternatives).slice(0, 3);
  const choices = shuffle([item.definition, ...distractors]);
  const answerIndex = choices.indexOf(item.definition);

  return {
    item,
    prompt: `What does “${item.term}” mean?`,
    choices,
    answerIndex: answerIndex === -1 ? 0 : answerIndex,
  };
}

export function SubjectQuiz({ slug }: { slug: string }) {
  const { data, isLoading, error } = useSubjectDetail(slug);
  const { mutateAsync: saveProgress, isPending: isSaving } = useSaveProgress();
  const [items, setItems] = useState<ItemWithProgress[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (data?.items) {
      setItems(data.items);
      setCurrentIndex(0);
      setSelected(null);
      setRevealed(false);
      setResults({});
    }
  }, [data?.items]);

  const quizCards = useMemo(() => items.map((item) => createQuizCard(item, items)), [items]);
  const currentCard = quizCards[currentIndex];

  const totalCorrect = useMemo(
    () => Object.values(results).filter(Boolean).length,
    [results]
  );

  const handleEvaluation = async (level: EvaluationLevel) => {
    if (!currentCard) return;
    const { progress } = applyEvaluation(currentCard.item, level);
    setItems((prev) =>
      prev.map((it) =>
        it.id === currentCard.item.id
          ? {
              ...it,
              progress,
            }
          : it
      )
    );
    try {
      await saveProgress({
        itemId: currentCard.item.id,
        statsPatch: progress,
      });
    } catch (err) {
      console.error("Failed to save progress", err);
    }
  };

  const handleCheck = async () => {
    if (selected === null || !currentCard || revealed) return;
    const isCorrect = selected === currentCard.answerIndex;
    setResults((prev) => ({ ...prev, [currentCard.item.id]: isCorrect }));
    setRevealed(true);
    const level: EvaluationLevel = isCorrect ? "easy" : "hard";
  await handleEvaluation(level);
  };

  const handleNext = () => {
    if (!currentCard) return;
    if (currentIndex + 1 < quizCards.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelected(null);
      setRevealed(false);
    } else {
      setCurrentIndex(0);
      setSelected(null);
      setRevealed(false);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelected(null);
    setRevealed(false);
    setResults({});
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
          Add content in Manage mode to generate quiz questions.
        </p>
      </div>
    );
  }

  if (!currentCard) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Quiz mode</p>
          <h1 className="text-3xl font-semibold text-white/90">{data.subject.name}</h1>
          <p className="text-sm text-zinc-400">
            Question {currentIndex + 1} of {quizCards.length} • Score {totalCorrect}/
            {quizCards.length}
          </p>
        </div>
        <Button variant="ghost" className="rounded-full text-zinc-300" onClick={handleRestart}>
          <RotateCcw size={16} className="mr-2" /> Restart
        </Button>
      </header>

      <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-10">
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Prompt</p>
        <h2 className="mt-4 text-2xl font-semibold text-white/90">{currentCard.prompt}</h2>

        <div className="mt-6 grid gap-3">
          {currentCard.choices.map((choice, index) => {
            const isChecked = selected === index;
            const isCorrect = index === currentCard.answerIndex;
            return (
              <button
                key={`${currentCard.item.id}-${index}`}
                type="button"
                onClick={() => setSelected(index)}
                disabled={revealed}
                className={cn(
                  "group flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-white/80 transition",
                  isChecked ? "border-white/40 bg-white/10" : "hover:border-white/20",
                  revealed && isCorrect ? "border-emerald-400/60 bg-emerald-400/10" : "",
                  revealed && isChecked && !isCorrect
                    ? "border-red-500/40 bg-red-500/10 text-red-200"
                    : ""
                )}
              >
                <span>{choice}</span>
                {revealed && isCorrect ? (
                  <span className="text-xs uppercase tracking-[0.25em] text-emerald-200">
                    Correct
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button
            disabled={selected === null || revealed || isSaving}
            onClick={handleCheck}
            className="rounded-full bg-white/80 text-black hover:bg-white"
          >
            Check answer
          </Button>
          <Button
            variant="secondary"
            disabled={!revealed}
            onClick={handleNext}
            className="rounded-full"
          >
            Next question
          </Button>
        </div>
      </section>
    </div>
  );
}
