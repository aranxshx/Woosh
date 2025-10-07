"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = getSupabaseBrowserClient();

    try {
      if (mode === "signin") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      } else {
        // Ensure Supabase confirmation links redirect back to the correct origin
        // Works on localhost for dev and on Vercel in production
        const origin = typeof window !== "undefined" && window.location?.origin
          ? window.location.origin
          : (process.env.NEXT_PUBLIC_URL ?? "");

        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${origin}/`,
          },
        });
        if (signUpError) throw signUpError;
      }

      router.push("/");
      router.refresh();
    } catch (authError) {
      const message = authError instanceof Error ? authError.message : "An unexpected error occurred";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex gap-2 rounded-full border border-white/10 bg-white/5 p-1 text-xs uppercase tracking-[0.25em] text-zinc-500">
        {(["signin", "signup"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setMode(option)}
            className="relative flex-1 rounded-full px-4 py-2"
          >
            {mode === option ? (
              <motion.span
                layoutId="authMode"
                className="absolute inset-0 rounded-full bg-white text-zinc-900"
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              />
            ) : null}
            <span className="relative z-10 font-semibold">
              {option === "signin" ? "Sign in" : "Sign up"}
            </span>
          </button>
        ))}
      </div>

      <Input
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@domain.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />

      <Input
        label="Password"
        type="password"
        autoComplete={mode === "signin" ? "current-password" : "new-password"}
        placeholder="••••••••"
        value={password}
        minLength={6}
        onChange={(event) => setPassword(event.target.value)}
        required
      />

      {error ? (
        <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={loading}
        className="mt-2 w-full rounded-full"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "signin" ? "Sign in" : "Create account"}
      </Button>

      <p className="text-center text-xs text-zinc-500">
        {mode === "signin" ? "Need an account?" : "Already registered?"}{" "}
        <button
          type="button"
          className="text-zinc-300 underline decoration-dotted underline-offset-4"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        >
          {mode === "signin" ? "Sign up" : "Sign in"}
        </button>
      </p>
    </form>
  );
}
