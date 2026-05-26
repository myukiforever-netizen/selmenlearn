import type { Metadata } from "next";
import { ReactQueryProvider } from "@/components/providers/ReactQueryProvider";
import { ApiWarmup } from "@/components/providers/ApiWarmup";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | SelmenLearn",
    default: "SelmenLearn",
  },
  description: "Ton espace d'apprentissage personnel.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        <ReactQueryProvider>
          <ApiWarmup />
          {children}
        </ReactQueryProvider>
      </body>
    </html>
  );
}
