import { SubjectQuiz } from "@/components/subject/quiz";

export default async function SubjectQuizPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 py-12">
      <SubjectQuiz slug={slug} />
    </main>
  );
}
