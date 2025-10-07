import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { subjectNameSchema } from "@/lib/validation";
import { slugify } from "@/lib/utils";
import type { Database } from "@/types/database";

export async function GET() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: subjectData, error } = await supabase
    .from("subjects")
    .select("id, name, slug, created_at, updated_at")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const subjectIds = subjectData?.map((row) => row.id) ?? [];

  let itemsData: { subject_id: string }[] | null = [];
  if (subjectIds.length > 0) {
    const { data: itemsResult, error: itemsError } = await supabase
      .from("items")
      .select("subject_id")
      .in("subject_id", subjectIds);

    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    itemsData = itemsResult ?? [];
  } else {
    itemsData = [];
  }

  const countMap = new Map<string, number>();
  itemsData.forEach((row) => {
    countMap.set(row.subject_id, (countMap.get(row.subject_id) ?? 0) + 1);
  });

  const subjects = (subjectData ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    itemCount: countMap.get(row.id) ?? 0,
  }));

  return NextResponse.json({ subjects });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parseResult = subjectNameSchema.safeParse(body?.name ?? body?.subject ?? body);

  if (!parseResult.success) {
    return NextResponse.json({ error: parseResult.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const name = parseResult.data;
  const slug = slugify(name);

  const payload: Database["public"]["Tables"]["subjects"]["Insert"] = {
    name,
    slug,
    owner_id: user.id,
  };

  const { error } = await supabase.from("subjects").insert(payload);

  if (error) {
    const status = error.message.includes("duplicate") ? 409 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }

  return NextResponse.json({ slug }, { status: 201 });
}
