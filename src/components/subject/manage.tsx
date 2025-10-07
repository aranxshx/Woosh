"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Pencil, Trash2, Plus } from "lucide-react";
import { useSubjectDetail } from "@/hooks/subjects";
import { useAddItem, useDeleteItem, useUpdateItem } from "@/hooks/items";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import type { ItemWithProgress } from "@/types/models";
import { formatRelativeDate } from "@/lib/utils";

interface ItemFormState {
  term: string;
  definition: string;
  question: string;
  choices: string;
  answerIndex: string;
}

const emptyForm: ItemFormState = {
  term: "",
  definition: "",
  question: "",
  choices: "",
  answerIndex: "",
};

function buildPayload(form: ItemFormState) {
  const trimmedChoices = form.choices
    .split("\n")
    .map((choice) => choice.trim())
    .filter(Boolean);

  const numericAnswer = Number.parseInt(form.answerIndex, 10);
  const hasValidChoices = trimmedChoices.length >= 2;
  const answerIndex = Number.isNaN(numericAnswer) || !hasValidChoices
    ? null
    : Math.min(Math.max(numericAnswer, 0), trimmedChoices.length - 1);

  return {
    term: form.term.trim(),
    definition: form.definition.trim(),
    question: form.question.trim() || null,
    choices: hasValidChoices ? trimmedChoices : [],
    answerIndex: hasValidChoices ? answerIndex : null,
  };
}

export function SubjectManage({ slug }: { slug: string }) {
  const { data, isLoading, error } = useSubjectDetail(slug);
  const addItem = useAddItem(slug);
  const updateItem = useUpdateItem(slug);
  const deleteItem = useDeleteItem(slug);

  const [form, setForm] = useState<ItemFormState>(emptyForm);
  const [editItem, setEditItem] = useState<ItemWithProgress | null>(null);
  const [editForm, setEditForm] = useState<ItemFormState>(emptyForm);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (editItem) {
      setEditForm({
        term: editItem.term,
        definition: editItem.definition,
        question: editItem.question ?? "",
        choices: editItem.choices.join("\n"),
        answerIndex: editItem.answerIndex?.toString() ?? "",
      });
    }
  }, [editItem]);

  const sortedItems = useMemo(() => {
    return (data?.items ?? []).slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [data?.items]);

  const handleFormChange = (field: keyof ItemFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditChange = (field: keyof ItemFormState, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);
    try {
      await addItem.mutateAsync(buildPayload(form));
      setFeedback("Item added successfully");
      setForm(emptyForm);
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : "Unable to add item");
    }
  };

  const handleUpdate = async () => {
    if (!editItem) return;
    setFeedback(null);
    try {
      await updateItem.mutateAsync({ id: editItem.id, ...buildPayload(editForm) });
      setFeedback("Item updated");
      setEditItem(null);
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : "Unable to update item");
    }
  };

  const handleDelete = async (itemId: string) => {
    setFeedback(null);
    try {
      await deleteItem.mutateAsync(itemId);
      setFeedback("Item deleted");
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : "Unable to delete item");
    }
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

  if (!data) {
    return null;
  }

  const isSubmitting = addItem.isPending || updateItem.isPending || deleteItem.isPending;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Manage</p>
          <h1 className="text-3xl font-semibold text-white/90">{data.subject.name}</h1>
          <p className="text-sm text-zinc-400">{data.subject.itemCount} items total</p>
        </div>
      </header>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <form className="grid gap-6" onSubmit={handleCreate}>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-white/80" htmlFor="term">
              Term
            </label>
            <Input
              id="term"
              value={form.term}
              onChange={(event) => handleFormChange("term", event.target.value)}
              placeholder="Photosynthesis"
              required
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-white/80" htmlFor="definition">
              Definition
            </label>
            <Textarea
              id="definition"
              value={form.definition}
              onChange={(event) => handleFormChange("definition", event.target.value)}
              rows={3}
              placeholder="Process by which green plants convert light into energy."
              required
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-white/80" htmlFor="question">
              Question (optional)
            </label>
            <Input
              id="question"
              value={form.question}
              onChange={(event) => handleFormChange("question", event.target.value)}
              placeholder="Which process allows plants to convert sunlight into energy?"
            />
          </div>

          <div className="grid gap-2 md:grid-cols-2 md:items-start md:gap-6">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-white/80" htmlFor="choices">
                Choices (one per line)
              </label>
              <Textarea
                id="choices"
                value={form.choices}
                onChange={(event) => handleFormChange("choices", event.target.value)}
                rows={4}
                placeholder={"Photosynthesis\nRespiration\nFermentation"}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-white/80" htmlFor="answerIndex">
                Correct choice index
              </label>
              <Input
                id="answerIndex"
                type="number"
                min={0}
                value={form.answerIndex}
                onChange={(event) => handleFormChange("answerIndex", event.target.value)}
                placeholder="0"
              />
              <p className="text-xs text-zinc-500">
                Leave blank for open-ended flashcards or when providing fewer than two choices.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-zinc-400">
              New items show up immediately in Flashcards and Quiz modes.
            </p>
            <Button type="submit" disabled={addItem.isPending} className="rounded-full">
              <Plus size={16} className="mr-2" /> Add item
            </Button>
          </div>
        </form>
        {feedback ? (
          <p className="mt-4 text-sm text-emerald-300">{feedback}</p>
        ) : null}
      </section>

      <section className="grid gap-4">
        {sortedItems.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-10 text-center text-sm text-zinc-400">
            No items yet — start by adding your first term above.
          </div>
        ) : (
          sortedItems.map((item) => (
            <article
              key={item.id}
              className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:border-white/20"
            >
              <header className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Term</p>
                  <h3 className="text-xl font-semibold text-white/90">{item.term}</h3>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    className="rounded-full"
                    onClick={() => setEditItem(item)}
                  >
                    <Pencil size={16} className="mr-2" /> Edit
                  </Button>
                  <Button
                    variant="ghost"
                    className="rounded-full text-red-300"
                    disabled={deleteItem.isPending}
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 size={16} className="mr-2" /> Delete
                  </Button>
                </div>
              </header>

              <p className="text-sm text-zinc-400">{item.definition}</p>

              {item.question ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
                  <p className="font-medium text-white/80">Quiz prompt</p>
                  <p className="mt-1">{item.question}</p>
                </div>
              ) : null}

              {item.choices.length > 0 ? (
                <ul className="grid gap-2 text-sm text-zinc-300">
                  {item.choices.map((choice, index) => (
                    <li
                      key={choice}
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-2"
                    >
                      <span className="mr-2 text-xs uppercase tracking-[0.3em] text-zinc-500">
                        {index === item.answerIndex ? "Correct" : "Choice"}
                      </span>
                      {choice}
                    </li>
                  ))}
                </ul>
              ) : null}

              <footer className="flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.3em] text-zinc-500">
                <span>Seen {item.progress.timesSeen}×</span>
                <span>Last result {item.progress.lastResult ?? "—"}</span>
                <span>Next due {formatRelativeDate(item.progress.nextDue)}</span>
              </footer>
            </article>
          ))
        )}
      </section>

      <Modal open={Boolean(editItem)} onClose={() => setEditItem(null)} title="Edit item">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-white/80" htmlFor="edit-term">
              Term
            </label>
            <Input
              id="edit-term"
              value={editForm.term}
              onChange={(event) => handleEditChange("term", event.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-white/80" htmlFor="edit-definition">
              Definition
            </label>
            <Textarea
              id="edit-definition"
              rows={3}
              value={editForm.definition}
              onChange={(event) => handleEditChange("definition", event.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-white/80" htmlFor="edit-question">
              Question
            </label>
            <Input
              id="edit-question"
              value={editForm.question}
              onChange={(event) => handleEditChange("question", event.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-white/80" htmlFor="edit-choices">
              Choices (one per line)
            </label>
            <Textarea
              id="edit-choices"
              rows={4}
              value={editForm.choices}
              onChange={(event) => handleEditChange("choices", event.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-white/80" htmlFor="edit-answerIndex">
              Correct choice index
            </label>
            <Input
              id="edit-answerIndex"
              type="number"
              min={0}
              value={editForm.answerIndex}
              onChange={(event) => handleEditChange("answerIndex", event.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" className="rounded-full" onClick={() => setEditItem(null)}>
            Cancel
          </Button>
          <Button
            className="rounded-full"
            onClick={handleUpdate}
            disabled={updateItem.isPending || isSubmitting}
          >
            Save changes
          </Button>
        </div>
      </Modal>
    </div>
  );
}
