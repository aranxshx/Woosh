import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { itemUpdateSchema } from "@/lib/validation";

async function getSubjectIdBySlug(supabase: Awaited<ReturnType<typeof getSupabaseServerClient>>, slug: string, userId: string) {
  const { data, error } = await supabase
    .from("subjects")
    .select("id")
    .eq("slug", slug)
    .eq("owner_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data?.id ?? null;
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ slug: string; id: string }> }
) {
  const { slug, id } = await context.params;
  const body = await req.json();
  const parsed = itemUpdateSchema.safeParse({ ...body?.item, id: body?.item?.id ?? id });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid payload" },
      { status: 400 }
    );
  }

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subjectId = await getSubjectIdBySlug(supabase, slug, user.id);

  if (!subjectId) {
    return NextResponse.json({ error: "Subject not found" }, { status: 404 });
  }

  const payload = parsed.data;

  const { data: itemRow, error: updateError } = await supabase
    .from("items")
    .update({
      term: payload.term,
      definition: payload.definition,
      question: payload.question ?? null,
      choices: payload.choices,
      answer_index: payload.answerIndex ?? null,
    })
    .eq("id", payload.id)
    .eq("subject_id", subjectId)
    .select("id, term, definition, question, choices, answer_index, subject_id, created_at, updated_at")
    .single();

  if (updateError || !itemRow) {
    return NextResponse.json({ error: updateError?.message ?? "Failed to update item" }, { status: 500 });
  }

  const { data: progressRow } = await supabase
    .from("item_progress")
    .select(
      "last_seen, last_result, times_seen, easy_count, medium_count, hard_count, next_due"
    )
    .eq("item_id", itemRow.id)
    .eq("user_id", user.id)
    .maybeSingle();

  return NextResponse.json({
    item: {
      id: itemRow.id,
      subjectId: itemRow.subject_id,
      term: itemRow.term,
      definition: itemRow.definition,
      question: itemRow.question,
      choices: Array.isArray(itemRow.choices) ? (itemRow.choices as string[]) : [],
      answerIndex: itemRow.answer_index,
      createdAt: itemRow.created_at,
      updatedAt: itemRow.updated_at,
      progress: {
        lastSeen: progressRow?.last_seen ?? null,
        lastResult: progressRow?.last_result ?? null,
        timesSeen: progressRow?.times_seen ?? 0,
        easyCount: progressRow?.easy_count ?? 0,
        mediumCount: progressRow?.medium_count ?? 0,
        hardCount: progressRow?.hard_count ?? 0,
        nextDue: progressRow?.next_due ?? null,
      },
    },
  });
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ slug: string; id: string }> }
) {
  const { slug, id } = await context.params;
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subjectId = await getSubjectIdBySlug(supabase, slug, user.id);

  if (!subjectId) {
    return NextResponse.json({ error: "Subject not found" }, { status: 404 });
  }

  const { error: progressError } = await supabase
    .from("item_progress")
    .delete()
    .eq("item_id", id)
    .eq("user_id", user.id);

  if (progressError) {
    return NextResponse.json({ error: progressError.message }, { status: 500 });
  }

  const { error: itemError } = await supabase
    .from("items")
    .delete()
    .eq("id", id)
    .eq("subject_id", subjectId);

  if (itemError) {
    return NextResponse.json({ error: itemError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
