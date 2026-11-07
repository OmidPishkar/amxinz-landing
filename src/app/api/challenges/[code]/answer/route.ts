import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { submitAnswer } from "@/lib/challenges";

export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Log in to join this challenge." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const direction = body?.direction;
  const index = body?.index;
  if ((direction !== "up" && direction !== "down") || typeof index !== "number") {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { code } = await params;
  const result = await submitAnswer(code, session.user.id, index, direction);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json(result);
}
