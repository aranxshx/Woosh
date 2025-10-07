import { SubjectQuiz } from "@/components/subject/quiz";

interface SubjectQuizPageProps {
  params: { slug: string };
}

export default function SubjectQuizPage({ params }: SubjectQuizPageProps) {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 py-12">
      <SubjectQuiz slug={params.slug} />
    </main>
  );
}
