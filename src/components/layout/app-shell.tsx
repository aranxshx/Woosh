"use client";

import { useAuth } from "@/app/providers";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { motion } from "framer-motion";
import { User } from "@supabase/supabase-js";

function initials(user: User | null) {
  if (!user?.email) return "?";
  const [first, second] = user.email.replace(/@.+$/, "").split(/[._-]/);
  return (first?.[0] ?? "").concat(second?.[0] ?? "").toUpperCase() || user.email[0]?.toUpperCase();
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const user = useAuth();
  const avatar = initials(user);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black pb-12 text-zinc-100">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-32 right-0 h-96 w-96 rounded-full bg-purple-500/10 blur-[120px]"
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-sky-500/10 blur-[120px]"
          animate={{ rotate: -360 }}
          transition={{ duration: 52, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6">
        <header className="flex items-center justify-between py-8">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Woosh</p>
            <h1 className="text-3xl font-semibold text-white/90">Interactive Quiz Studio</h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="relative flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white/80">
                {avatar}
              </div>
              <div className="flex flex-col text-xs text-zinc-400">
                <span>{user?.email ?? "Guest"}</span>
                <SignOutButton />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 pb-16">{children}</main>
      </div>
    </div>
  );
}
