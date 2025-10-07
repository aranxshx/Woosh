"use client";

import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useThemeMode } from "@/components/theme/theme-context";

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeMode();

  return (
    <Button
      variant="ghost"
      size="pill"
      onClick={toggleTheme}
      className="relative flex items-center gap-2 rounded-full bg-white/5 px-4 text-xs uppercase tracking-wide text-zinc-300"
      aria-label="Toggle theme"
    >
      <motion.span
        key={theme}
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -10, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-2"
      >
        {theme === "dark" ? (
          <>
            <Moon size={14} /> Dark
          </>
        ) : (
          <>
            <Sun size={14} /> Light
          </>
        )}
      </motion.span>
    </Button>
  );
}
