import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all " +
      "disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 focus-visible:outline-none " +
      "focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2";

    const variants = {
      primary:
        "bg-brand-500 text-white hover:bg-brand-600 shadow-sm hover:shadow-brand-500/25 hover:-translate-y-0.5",
      secondary:
        "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 " +
        "dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700",
      ghost:
        "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 " +
        "hover:bg-slate-100 dark:hover:bg-slate-800",
      danger:
        "bg-rose-500 text-white hover:bg-rose-600 shadow-sm hover:-translate-y-0.5",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2.5 text-sm",
      lg: "px-6 py-3 text-base",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading && (
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
