"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, FolderOpen, Loader2, BookOpen, Pencil, Settings, Trash2, LayoutGrid, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useCreateSubject, useDeleteSubject, useSubjects } from "@/hooks/subjects";

export function Dashboard() {
  const router = useRouter();
  const { data, isLoading, error } = useSubjects();
  const createSubject = useCreateSubject();
  const deleteSubject = useDeleteSubject();

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [subjectName, setSubjectName] = useState("");
  const [placeholderText, setPlaceholderText] = useState("Search subjects…");

  // Rotate placeholder suggestions for subtle liveliness
  const placeholders = [
    "Search subjects…",
    "Try: Biology",
    "Try: Microeconomics",
    "Try: World History",
    "Try: Algorithms",
  ];

  // Change placeholder every 2.5s
  React.useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % placeholders.length;
      setPlaceholderText(placeholders[i]);
    }, 2500);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredSubjects = useMemo(() => {
    if (!data?.subjects) return [];
    return data.subjects.filter((subject) => subject.name.toLowerCase().includes(search.toLowerCase()));
  }, [data?.subjects, search]);

  const totalSubjects = data?.subjects?.length ?? 0;
  const totalItems = useMemo(
    () => (data?.subjects ?? []).reduce((sum, s) => sum + (s.itemCount ?? 0), 0),
    [data?.subjects]
  );

  async function handleCreateSubject(event: React.FormEvent) {
    event.preventDefault();
    if (!subjectName.trim()) return;
    try {
      await createSubject.mutateAsync({ name: subjectName.trim() });
      setSubjectName("");
      setModalOpen(false);
    } catch (mutationError) {
      console.error(mutationError);
    }
  }

  async function handleDeleteSubject(slug: string) {
    try {
      await deleteSubject.mutateAsync({ slug });
    } catch (mutationError) {
      console.error(mutationError);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl flex flex-col gap-10 py-6 sm:py-8">
      {/* Hero / Actions */}
      <section className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-8 backdrop-blur-xl shadow-[0_30px_120px_rgba(0,0,0,0.35)]">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Dashboard</p>
            <h2 className="mt-2 text-3xl font-semibold bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              Your Subjects
            </h2>
            <div className="mt-1 h-px w-36 bg-gradient-to-r from-white/30 via-white/10 to-transparent" />
            <p className="mt-2 text-sm text-zinc-500">Organize knowledge, drill flashcards, and launch quizzes in an instant.</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-900/60 px-2 py-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
          >
            <SignOutButton />
            <Button
              size="pill"
              onClick={() => setModalOpen(true)}
              className="bg-white text-zinc-900 hover:bg-zinc-200"
            >
              <Plus size={16} className="mr-1" /> New Subject
            </Button>
          </motion.div>
        </div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.08 }}
          className="relative flex w-full items-center overflow-hidden rounded-2xl border border-white/10 bg-white/5 pr-2 focus-within:ring-2 focus-within:ring-zinc-500/50"
        >
          <Search className="pointer-events-none absolute left-4 h-4 w-4 text-zinc-500" />
          <div className="flex-1 min-w-0">
            <Input
              aria-label="Search subjects"
              className="h-12 w-full rounded-2xl bg-transparent pl-12 border-0 focus-visible:ring-0 focus-visible:outline-0 shadow-none"
              placeholder={placeholderText}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </motion.div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <LayoutGrid className="h-4 w-4 text-zinc-400" />
            <div className="text-sm text-zinc-300">
              <span className="text-white/90 font-semibold">{totalSubjects}</span> subjects
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <ListChecks className="h-4 w-4 text-zinc-400" />
            <div className="text-sm text-zinc-300">
              <span className="text-white/90 font-semibold">{totalItems}</span> total items
            </div>
          </div>
        </div>
      </section>

      <section>
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-8 text-center text-red-300">{error.message}</div>
        ) : filteredSubjects.length === 0 ? (
          <div className="relative overflow-hidden rounded-3xl border border-dashed border-zinc-700/60 bg-zinc-900/50 py-24 text-center">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06),transparent_55%)]" />
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="relative z-10 mx-auto flex max-w-xl flex-col items-center gap-4 px-6"
            >
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <FolderOpen className="h-14 w-14 text-zinc-600" />
              </motion.div>
              <div className="space-y-1">
                <p className="text-lg font-medium text-zinc-300">No subjects yet</p>
                <p className="text-sm text-zinc-500">
                  {search
                    ? "No subjects match your search. Try a different keyword."
                    : "Ready to create your first deck and start learning smarter?"}
                </p>
              </div>
              <Button
                variant="secondary"
                onClick={() => setModalOpen(true)}
                className="hover:scale-[1.02] hover:bg-zinc-800/70 transition-transform"
              >
                Create your first subject
              </Button>
            </motion.div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
          >
            <AnimatePresence>
              {filteredSubjects.map((subject) => (
                <motion.article
                  key={subject.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.24 }}
                  className="group flex flex-col rounded-3xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.35)] transition-colors hover:bg-white/[0.08]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white/90">{subject.name}</h3>
                      <p className="text-sm text-zinc-500">{subject.itemCount} items</p>
                    </div>
                    <button
                      aria-label="Delete subject"
                      title="Delete subject"
                      onClick={() => handleDeleteSubject(subject.slug)}
                      className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 p-2 text-zinc-400 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-8 flex flex-col gap-3">
                    <Button
                      variant="secondary"
                      className="w-full justify-start gap-3 rounded-2xl"
                      onClick={() => router.push(`/subjects/${subject.slug}/flashcards`)}
                    >
                      <BookOpen size={18} /> Flashcards
                    </Button>
                    <Button
                      variant="secondary"
                      className="w-full justify-start gap-3 rounded-2xl"
                      onClick={() => router.push(`/subjects/${subject.slug}/quiz`)}
                    >
                      <Pencil size={18} /> Quiz
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 text-zinc-300"
                      onClick={() => router.push(`/subjects/${subject.slug}/manage`)}
                    >
                      <Settings size={18} /> Manage
                    </Button>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create a new subject">
        <form onSubmit={handleCreateSubject} className="flex flex-col gap-6">
          <Input
            label="Subject name"
            placeholder="e.g. Cellular Biology"
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
            required
          />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} className="rounded-full px-5">
              Cancel
            </Button>
            <Button type="submit" disabled={createSubject.isPending} className="rounded-full px-5">
              {createSubject.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
