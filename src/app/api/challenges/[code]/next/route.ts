import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { nextChart } from "@/lib/challenges";

export const dynamic = "force-dynamic";

// Returns the chart the signed-in player must answer next (and starts their entry on the first call).
export async function GET(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Log in to join this challenge." }, { status: 401 });

  const { code } = await params;
  const result = await nextChart(code, session.user.id);
  if (result.status === "error") return NextResponse.json({ error: result.error }, { status: result.code });
  return NextResponse.json(result);
}
