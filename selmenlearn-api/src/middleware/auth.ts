import type { Context, Next } from "hono";
import { createClerkClient, verifyToken } from "@clerk/backend";
import { prisma } from "../lib/prisma.js";

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  const token = authHeader.slice(7);

  try {
    const payload = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY ?? "" });
    const clerkId = payload.sub;

    // Upsert user on first request
    let user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      const clerkUser = await clerk.users.getUser(clerkId);
      user = await prisma.user.create({
        data: {
          clerkId,
          email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
          name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || null,
        },
      });
    }

    c.set("userId", user.id);
    c.set("clerkId", clerkId);
    await next();
  } catch {
    return c.json({ message: "Invalid token" }, 401);
  }
}
