import { getSupabaseServerClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import type { Subject, SubjectDetail } from "@/types/models";
import type { Database } from "@/types/database";
import type { User } from "@supabase/supabase-js";

type SubjectRow = Database["public"]["Tables"]["subjects"]["Row"];
type ItemRow = Database["public"]["Tables"]["items"]["Row"];
type ProgressRow = Database["public"]["Tables"]["item_progress"]["Row"];

type SubjectSummaryRow = Pick<
  SubjectRow,
  "id" | "name" | "slug" | "created_at" | "updated_at" | "owner_id"
>;

type SubjectDetailRow = Pick<SubjectRow, "id" | "name" | "slug" | "created_at" | "updated_at">;

type ItemJoinedRow = Pick<
  ItemRow,
  | "id"
  | "subject_id"
  | "term"
  | "definition"
  | "question"
  | "choices"
  | "answer_index"
  | "created_at"
  | "updated_at"
> & {
  progress: Pick<
    ProgressRow,
    "last_seen" | "last_result" | "times_seen" | "easy_count" | "medium_count" | "hard_count" | "next_due"
  > | null;
};

export async function fetchSubjectDetail(
  slug: string,
  user: User
): Promise<SubjectDetail> {
  const supabase = await getSupabaseServerClient();

  const { data: subjectData, error: subjectError } = await supabase
    .from("subjects")
    .select("id, name, slug, created_at, updated_at")
    .eq("slug", slug)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (subjectError) {
    throw subjectError;
  }

  if (!subjectData) {
    throw new Error("Subject not found");
  }

  const subjectRow = subjectData as SubjectDetailRow;

  const { data: itemsData, error: itemsError } = await supabase
    .from("items")
    .select(
      `id, subject_id, term, definition, question, choices, answer_index, created_at, updated_at,
       progress:item_progress!left(last_seen, last_result, times_seen, easy_count, medium_count, hard_count, next_due)`
    )
    .eq("subject_id", subjectRow.id)
    .eq("item_progress.user_id", user.id)
    .order("created_at", { ascending: true });

  if (itemsError) {
    throw itemsError;
  }

  const itemsRows: ItemJoinedRow[] = Array.isArray(itemsData)
    ? (itemsData as unknown as ItemJoinedRow[])
    : [];

  const items = itemsRows.map((row) => ({
    id: row.id,
    subjectId: row.subject_id,
    term: row.term,
    definition: row.definition,
    question: row.question,
    choices: Array.isArray(row.choices) ? (row.choices as unknown as string[]) : [],
    answerIndex: row.answer_index,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    progress: {
      lastSeen: row.progress?.last_seen ?? null,
      lastResult: row.progress?.last_result ?? null,
      timesSeen: row.progress?.times_seen ?? 0,
      easyCount: row.progress?.easy_count ?? 0,
      mediumCount: row.progress?.medium_count ?? 0,
      hardCount: row.progress?.hard_count ?? 0,
      nextDue: row.progress?.next_due ?? null,
    },
  }));

  const subject: Subject = {
    id: subjectRow.id,
    name: subjectRow.name,
    slug: subjectRow.slug,
    createdAt: subjectRow.created_at,
    updatedAt: subjectRow.updated_at,
    itemCount: items.length,
  };

  return {
    subject,
    items,
  };
}

export async function fetchSubjects(user: User): Promise<Subject[]> {
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("subjects")
    .select("id, name, slug, created_at, updated_at, owner_id")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  const subjectRows = (data ?? []) as SubjectSummaryRow[];

  const subjectIds = subjectRows.map((row) => row.id);

  if (subjectIds.length === 0) {
    return [];
  }

  const { data: itemData, error: itemError } = await supabase
    .from("items")
    .select("id, subject_id")
    .in("subject_id", subjectIds);

  if (itemError) {
    throw itemError;
  }

  const countMap = new Map<string, number>();
  (itemData as Pick<ItemRow, "id" | "subject_id">[] | null)?.forEach((row) => {
    countMap.set(row.subject_id, (countMap.get(row.subject_id) ?? 0) + 1);
  });

  return subjectRows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    itemCount: countMap.get(row.id) ?? 0,
  }));
}

export async function createSubject({
  name,
  user,
}: {
  name: string;
  user: User;
}) {
  const supabase = await getSupabaseServerClient();
  const slug = slugify(name);

  type SubjectInsert = Database["public"]["Tables"]["subjects"]["Insert"];

  const payload: SubjectInsert = {
    name,
    slug,
    owner_id: user.id,
  };

  const { error } = await supabase.from("subjects").insert(payload);

  if (error) {
    throw error;
  }

  return slug;
}

export async function deleteSubject({
  slug,
  user,
}: {
  slug: string;
  user: User;
}) {
  const supabase = await getSupabaseServerClient();

  const { error } = await supabase
    .from("subjects")
    .delete()
    .eq("slug", slug)
    .eq("owner_id", user.id);

  if (error) {
    throw error;
  }
}
