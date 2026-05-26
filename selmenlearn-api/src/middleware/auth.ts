import type { Context, Next } from "hono";
import { prisma } from "../lib/prisma.js";

export async function authMiddleware(c: Context, next: Next) {
  const user = await prisma.user.upsert({
    where: { clerkId: "private" },
    create: { clerkId: "private", email: "owner@selmenlearn.app", name: "Apprenant" },
    update: {},
  });
  c.set("userId", user.id);
  c.set("clerkId", "private");
  await next();
}
