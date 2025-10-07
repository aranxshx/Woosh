import { SubjectFlashcards } from "@/components/subject/flashcards";

export default async function SubjectFlashcardsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 py-12">
      <SubjectFlashcards slug={slug} />
    </main>
  );
}
