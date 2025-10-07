import { SubjectFlashcards } from "@/components/subject/flashcards";

interface SubjectFlashcardsPageProps {
  params: { slug: string };
}

export default function SubjectFlashcardsPage({ params }: SubjectFlashcardsPageProps) {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 py-12">
      <SubjectFlashcards slug={params.slug} />
    </main>
  );
}
