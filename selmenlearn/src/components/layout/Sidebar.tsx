"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain, BookOpen, BarChart2, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/decks",        label: "Mes Decks",    icon: BookOpen  },
  { href: "/stats",        label: "Statistiques", icon: BarChart2 },
  { href: "/achievements", label: "Badges",       icon: Trophy    },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-60 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-100 dark:border-slate-800">
        <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center shrink-0">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-slate-900 dark:text-slate-50">SelmenLearn</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                active
                  ? "bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer — version */}
      <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800">
        <p className="text-xs text-slate-400">v0.1.0 — MVP</p>
      </div>
    </aside>
  );
}
