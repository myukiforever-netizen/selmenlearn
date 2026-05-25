import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ReactQueryProvider } from "@/components/providers/ReactQueryProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | SelmenLearn",
    default: "SelmenLearn — Apprendre n'a jamais été aussi simple",
  },
  description:
    "Transforme n'importe quel contenu en expérience d'apprentissage interactive et ludique. Flashcards, quiz adaptatifs, répétition espacée.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="fr" suppressHydrationWarning>
        <body>
          <ReactQueryProvider>{children}</ReactQueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
