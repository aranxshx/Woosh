import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { saveProgressSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = saveProgressSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid progress payload" },
      { status: 400 }
    );
  }

  const { itemId, statsPatch } = parsed.data;
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: existing, error: selectError } = await supabase
    .from("item_progress")
    .select("id")
    .eq("item_id", itemId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (selectError) {
    return NextResponse.json({ error: selectError.message }, { status: 500 });
  }

  const patch: Record<string, unknown> = {};
  const entries = Object.entries(statsPatch);

  for (const [key, value] of entries) {
    if (value !== undefined) {
      const columnName = key
        .replace(/[A-Z]/g, (match) => `_${match.toLowerCase()}`)
        .replace(/^last_seen$/, "last_seen");
      patch[columnName] = value;
    }
  }

  if (existing) {
    const { error } = await supabase
      .from("item_progress")
      .update(patch)
      .eq("id", existing.id)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else {
    const insertPayload = {
      item_id: itemId,
      user_id: user.id,
      last_seen: statsPatch.lastSeen ?? null,
      last_result: statsPatch.lastResult ?? null,
      times_seen: statsPatch.timesSeen ?? 0,
      easy_count: statsPatch.easyCount ?? 0,
      medium_count: statsPatch.mediumCount ?? 0,
      hard_count: statsPatch.hardCount ?? 0,
      next_due: statsPatch.nextDue ?? null,
    };

    const { error } = await supabase.from("item_progress").insert(insertPayload);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
