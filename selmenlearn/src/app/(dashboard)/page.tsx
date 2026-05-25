import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

// Redirect /dashboard → /dashboard/decks by default
export default async function DashboardRootPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");
  redirect("/dashboard/decks");
}
