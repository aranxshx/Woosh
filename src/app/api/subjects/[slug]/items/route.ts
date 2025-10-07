import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { itemSchema } from "@/lib/validation";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const body = await req.json();
  const parsed = itemSchema.safeParse(body?.item ?? body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid item payload" },
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

  const { data: subjectData, error: subjectError } = await supabase
    .from("subjects")
    .select("id")
    .eq("slug", slug)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (subjectError) {
    return NextResponse.json({ error: subjectError.message }, { status: 500 });
  }

  if (!subjectData) {
    return NextResponse.json({ error: "Subject not found" }, { status: 404 });
  }

  const payload = parsed.data;

  const { data: insertData, error: insertError } = await supabase
    .from("items")
    .insert({
      subject_id: subjectData.id,
      term: payload.term,
      definition: payload.definition,
      question: payload.question ?? null,
      choices: payload.choices,
      answer_index: payload.answerIndex ?? null,
    })
    .select("id, term, definition, question, choices, answer_index, subject_id, created_at, updated_at")
    .single();

  if (insertError || !insertData) {
    return NextResponse.json({ error: insertError?.message ?? "Failed to create item" }, { status: 500 });
  }

  const { error: progressError } = await supabase.from("item_progress").insert({
    item_id: insertData.id,
    user_id: user.id,
    times_seen: 0,
    easy_count: 0,
    medium_count: 0,
    hard_count: 0,
    next_due: null,
  });

  if (progressError) {
    return NextResponse.json({ error: progressError.message }, { status: 500 });
  }

  return NextResponse.json(
    {
      item: {
        id: insertData.id,
        subjectId: insertData.subject_id,
        term: insertData.term,
        definition: insertData.definition,
        question: insertData.question,
        choices: Array.isArray(insertData.choices) ? (insertData.choices as string[]) : [],
        answerIndex: insertData.answer_index,
        createdAt: insertData.created_at,
        updatedAt: insertData.updated_at,
        progress: {
          lastSeen: null,
          lastResult: null,
          timesSeen: 0,
          easyCount: 0,
          mediumCount: 0,
          hardCount: 0,
          nextDue: null,
        },
      },
    },
    { status: 201 }
  );
}
