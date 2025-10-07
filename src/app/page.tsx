import { redirect } from "next/navigation";
import { Dashboard } from "@/components/dashboard/dashboard";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export default async function Home() {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/signin");
    }
  } catch {
    // If anything goes wrong (missing env, etc.) redirect to signin.
    redirect("/signin");
  }

  return <Dashboard />;
}
