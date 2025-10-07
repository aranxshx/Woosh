import { SubjectOverview } from "@/components/subject/subject-overview";

interface SubjectPageProps {
  params: { slug: string };
}

export default function SubjectPage({ params }: SubjectPageProps) {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 py-12">
      <SubjectOverview slug={params.slug} />
    </main>
  );
}
