import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: subjectData, error: subjectError } = await supabase
    .from("subjects")
    .select("id, name, slug, created_at, updated_at")
    .eq("slug", slug)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (subjectError) {
    return NextResponse.json({ error: subjectError.message }, { status: 500 });
  }

  if (!subjectData) {
    return NextResponse.json({ error: "Subject not found" }, { status: 404 });
  }

  const { data: itemsData, error: itemsError } = await supabase
    .from("items")
    .select(
      "id, subject_id, term, definition, question, choices, answer_index, created_at, updated_at"
    )
    .eq("subject_id", subjectData.id)
    .order("created_at", { ascending: true });

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  const itemIds = (itemsData ?? []).map((row) => row.id);

  type ProgressRow = {
    item_id: string;
    last_seen: string | null;
    last_result: string | null;
    times_seen: number | null;
    easy_count: number | null;
    medium_count: number | null;
    hard_count: number | null;
    next_due: string | null;
  };

  let progressData: ProgressRow[] = [];
  if (itemIds.length > 0) {
    const { data: progressResult, error: progressError } = await supabase
      .from("item_progress")
      .select(
        "item_id, last_seen, last_result, times_seen, easy_count, medium_count, hard_count, next_due"
      )
      .eq("user_id", user.id)
      .in("item_id", itemIds);

    if (progressError) {
      return NextResponse.json({ error: progressError.message }, { status: 500 });
    }

    progressData = progressResult ?? [];
  } else {
    progressData = [];
  }

  const progressMap = new Map((progressData ?? []).map((row) => [row.item_id, row]));

  const items = (itemsData ?? []).map((row) => {
    const progress = progressMap.get(row.id);

    return {
      id: row.id,
      subjectId: row.subject_id,
      term: row.term,
      definition: row.definition,
      question: row.question,
      choices: Array.isArray(row.choices) ? (row.choices as string[]) : [],
      answerIndex: row.answer_index,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      progress: {
        lastSeen: progress?.last_seen ?? null,
        lastResult: progress?.last_result ?? null,
        timesSeen: progress?.times_seen ?? 0,
        easyCount: progress?.easy_count ?? 0,
        mediumCount: progress?.medium_count ?? 0,
        hardCount: progress?.hard_count ?? 0,
        nextDue: progress?.next_due ?? null,
      },
    };
  });

  return NextResponse.json({
    subject: {
      id: subjectData.id,
      name: subjectData.name,
      slug: subjectData.slug,
      createdAt: subjectData.created_at,
      updatedAt: subjectData.updated_at,
      itemCount: items.length,
    },
    items,
  });
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("subjects")
    .delete()
    .eq("slug", slug)
    .eq("owner_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
