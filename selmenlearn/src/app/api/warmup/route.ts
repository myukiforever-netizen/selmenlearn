import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

// Called by the Vercel cron every 10 min to keep the Render backend warm.
export async function GET() {
  try {
    const res = await fetch(`${API_URL}/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    const body = await res.json().catch(() => ({}));
    return NextResponse.json({ ok: res.ok, ...body });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 503 });
  }
}
