import { SubjectManage } from "@/components/subject/manage";

interface SubjectManagePageProps {
  params: { slug: string };
}

export default function SubjectManagePage({ params }: SubjectManagePageProps) {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 py-12">
      <SubjectManage slug={params.slug} />
    </main>
  );
}
