"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSignOut() {
    try {
      setLoading(true);
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
      router.push("/signin");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleSignOut}
      disabled={loading}
      className="text-xs text-zinc-400 hover:text-white"
    >
      Sign out
    </Button>
  );
}
