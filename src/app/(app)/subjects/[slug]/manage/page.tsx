import { SubjectManage } from "@/components/subject/manage";

export default async function SubjectManagePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 py-12">
      <SubjectManage slug={slug} />
    </main>
  );
}
