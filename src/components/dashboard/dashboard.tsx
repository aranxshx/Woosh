"use client";

import { useMemo, useState } from "react";
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
    <div className="flex flex-col gap-10">
      {/* Hero / Actions */}
      <section className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-8 backdrop-blur-xl shadow-[0_30px_120px_rgba(0,0,0,0.35)]">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Dashboard</p>
            <h2 className="mt-2 text-3xl font-semibold text-white/90">Your Subjects</h2>
            <p className="text-sm text-zinc-400">Organize knowledge, drill flashcards, and launch quizzes in an instant.</p>
          </div>
          <div className="flex items-center gap-3">
            <SignOutButton />
            <Button size="lg" onClick={() => setModalOpen(true)} className="flex items-center gap-2 rounded-full px-6">
              <Plus size={18} /> New Subject
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative flex items-center">
          <Search className="pointer-events-none absolute left-4 h-4 w-4 text-zinc-500" />
          <Input
            className="h-12 w-full rounded-2xl bg-white/10 pl-12"
            placeholder="Search subjects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

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
          <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-zinc-700/60 bg-zinc-900/40 py-24 text-center">
            <FolderOpen className="h-12 w-12 text-zinc-600" />
            <p className="text-lg text-zinc-400">{search ? "No subjects match your search." : "You don't have any subjects yet."}</p>
            <Button variant="secondary" onClick={() => setModalOpen(true)}>
              Create your first subject
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
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
          </div>
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
