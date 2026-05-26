"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain, BookOpen, BarChart2, Trophy, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/decks",        label: "Mes Decks",    icon: BookOpen  },
  { href: "/stats",        label: "Statistiques", icon: BarChart2 },
  { href: "/achievements", label: "Badges",       icon: Trophy    },
];

export function MobileNavDrawer() {
  const [open, setOpen]   = useState(false);
  const pathname          = usePathname();

  return (
    <>
      {/* ── Hamburger button (mobile only) ── */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg
                   text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800
                   transition-colors shrink-0"
        aria-label="Ouvrir le menu de navigation"
      >
        <Menu className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* ── Backdrop ── */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
            />

            {/* ── Drawer ── */}
            <motion.div
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed inset-y-0 left-0 z-50 w-64 flex flex-col
                         bg-white dark:bg-slate-900
                         border-r border-slate-200 dark:border-slate-800
                         md:hidden shadow-2xl"
            >
              {/* Logo + close */}
              <div className="flex items-center justify-between px-5 py-5
                              border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center shrink-0">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-bold text-slate-900 dark:text-slate-50">SelmenLearn</span>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center w-8 h-8 rounded-lg
                             text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800
                             transition-colors"
                  aria-label="Fermer le menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Nav items */}
              <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {navItems.map(({ href, label, icon: Icon }) => {
                  const active = pathname.startsWith(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all",
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

              {/* Version footer */}
              <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-400">v0.1.0 — MVP</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
