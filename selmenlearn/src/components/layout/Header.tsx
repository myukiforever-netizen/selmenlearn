"use client";

import { UserButton } from "@clerk/nextjs";
import { Flame, Zap } from "lucide-react";
import { useUserStore } from "@/stores/useUserStore";
import { MobileNavDrawer } from "@/components/layout/MobileNavDrawer";

interface HeaderProps {
  user: { name: string; imageUrl: string };
}

export function Header({ user }: HeaderProps) {
  const { xp, streak } = useUserStore();

  return (
    <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 gap-3 shrink-0">
      {/* Hamburger (mobile only) */}
      <MobileNavDrawer />

      {/* Greeting */}
      <p className="text-sm text-slate-500 dark:text-slate-400 hidden sm:block">
        Bonjour, <span className="font-medium text-slate-700 dark:text-slate-300">{user.name}</span>
      </p>

      <div className="flex-1" />

      {/* XP */}
      <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-full">
        <Zap className="w-3.5 h-3.5 text-amber-500" />
        <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{xp} XP</span>
      </div>

      {/* Streak */}
      <div className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-950/40 px-3 py-1.5 rounded-full">
        <Flame
          className={`w-3.5 h-3.5 text-orange-500 ${streak > 0 ? "animate-streak-pulse" : ""}`}
        />
        <span className="text-xs font-bold text-orange-600 dark:text-orange-400">{streak}</span>
      </div>

      {/* User avatar */}
      <UserButton
        appearance={{
          variables: { colorPrimary: "#6366f1" },
        }}
      />
    </header>
  );
}
