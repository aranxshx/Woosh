import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-zinc-950 via-black to-zinc-900 text-zinc-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(120,119,198,0.25),_transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(56,189,248,0.15),_transparent_55%)]" />
      <div className="relative z-10 flex w-full max-w-md flex-col gap-6 rounded-3xl border border-white/10 bg-black/60 px-10 py-12 shadow-[0_40px_120px_rgba(0,0,0,0.55)] backdrop-blur-3xl">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Woosh</p>
            <h1 className="text-2xl font-semibold text-white/90">Welcome back</h1>
          </div>
          <ThemeToggle />
        </header>
        {children}
      </div>
    </div>
  );
}
