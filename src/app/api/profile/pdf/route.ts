import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { authOptions } from "@/lib/auth";
import { getUserById } from "@/lib/users";
import { EXPORT_LIMIT, getPredictionsForExport, getPerformanceStats } from "@/lib/profile";
import { formatAsset, formatChartDate } from "@/lib/format";
import { rateLimit } from "@/lib/rate-limit";
import { SITE_URL } from "@/config/site";

export const dynamic = "force-dynamic";

const PAGE_W = 595.28; // A4 at 72dpi
const PAGE_H = 841.89;
const MARGIN = 40;
const ROW_H = 18;
const INK = rgb(0.216, 0.208, 0.184); // #37352f
const MUTED = rgb(0.471, 0.467, 0.455); // #787774
const UP = rgb(0.059, 0.482, 0.424); // #0f7b6c
const DOWN = rgb(0.878, 0.243, 0.243); // #e03e3e
const BORDER = rgb(0.914, 0.914, 0.906); // #e9e9e7

const COLUMNS: { label: string; width: number }[] = [
  { label: "When (UTC)", width: 95 },
  { label: "Asset", width: 75 },
  { label: "TF", width: 35 },
  { label: "Chart from", width: 75 },
  { label: "Call", width: 45 },
  { label: "Market", width: 55 },
  { label: "Result", width: 55 },
  { label: "Points", width: 45 },
];

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Log in first." }, { status: 401 });

  if (!(await rateLimit(`pdf:${session.user.id}`, 5, 3600))) {
    return NextResponse.json({ error: "Too many exports. Try again later." }, { status: 429 });
  }

  const [user, rows, perf] = await Promise.all([
    getUserById(session.user.id),
    getPredictionsForExport(session.user.id),
    getPerformanceStats(session.user.id),
  ]);
  if (!user) return NextResponse.json({ error: "Account not found." }, { status: 404 });

  const doc = await PDFDocument.create();
  doc.setTitle("Amxinz — Prediction history");
  doc.setProducer("Amxinz");
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  // The logo is optional: a missing/invalid public/logo.png must never break the export.
  let logo: Awaited<ReturnType<typeof doc.embedPng>> | null = null;
  try {
    const bytes = await readFile(path.join(process.cwd(), "public", "logo.png"));
    logo = await doc.embedPng(bytes);
  } catch {
    logo = null;
  }

  let page = doc.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN;
  let pageNum = 1;

  function drawFooter() {
    page.drawText(SITE_URL.replace(/^https?:\/\//, ""), { x: MARGIN, y: 24, size: 8, font, color: MUTED });
    const text = `Page ${pageNum}`;
    page.drawText(text, { x: PAGE_W - MARGIN - font.widthOfTextAtSize(text, 8), y: 24, size: 8, font, color: MUTED });
  }

  function newPage() {
    drawFooter();
    page = doc.addPage([PAGE_W, PAGE_H]);
    pageNum += 1;
    y = PAGE_H - MARGIN;
  }

  function drawTableHeader() {
    let x = MARGIN;
    page.drawRectangle({ x: MARGIN, y: y - 14, width: PAGE_W - MARGIN * 2, height: 18, color: rgb(0.969, 0.965, 0.953) });
    for (const col of COLUMNS) {
      page.drawText(col.label, { x: x + 4, y: y - 9, size: 8, font: bold, color: INK });
      x += col.width;
    }
    y -= 18;
    page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 0.5, color: BORDER });
  }

  // Title + summary
  const logoSize = 22;
  const titleX = logo ? MARGIN + logoSize + 8 : MARGIN;
  if (logo) {
    const scale = logoSize / Math.max(logo.width, logo.height);
    page.drawImage(logo, {
      x: MARGIN,
      y: y - logoSize + 4,
      width: logo.width * scale,
      height: logo.height * scale,
    });
  }
  page.drawText("Amxinz — Prediction history", { x: titleX, y, size: 18, font: bold, color: INK });
  y -= 24;
  page.drawText(`${user.name} · generated ${new Date().toISOString().slice(0, 10)}`, {
    x: MARGIN,
    y,
    size: 10,
    font,
    color: MUTED,
  });
  y -= 22;

  const summary = [
    ["Score", String(user.score)],
    ["Predictions", String(user.played)],
    ["Win rate", perf.played > 0 ? `${perf.winRate}%` : "–"],
    ["Rows in this file", `${rows.length}${rows.length === EXPORT_LIMIT ? "+ (capped)" : ""}`],
  ];
  let sx = MARGIN;
  const colW = (PAGE_W - MARGIN * 2) / summary.length;
  for (const [label, value] of summary) {
    page.drawText(label, { x: sx, y, size: 8, font, color: MUTED });
    page.drawText(value, { x: sx, y: y - 16, size: 13, font: bold, color: INK });
    sx += colW;
  }
  y -= 44;
  page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 0.5, color: BORDER });
  y -= 20;

  drawTableHeader();

  for (const r of rows) {
    if (y - ROW_H < MARGIN + 20) {
      newPage();
      drawTableHeader();
    }

    const ok = r.correct === true;
    const cells = [
      r.answeredAt ? r.answeredAt.toISOString().replace("T", " ").slice(0, 16) : "-",
      formatAsset(r.symbol),
      r.interval,
      formatChartDate(r.startTime),
      r.choice ?? "-",
      r.outcome,
      ok ? "Correct" : "Wrong",
      ok ? "+10" : "-10",
    ];

    let x = MARGIN;
    cells.forEach((text, i) => {
      const color = i === 6 ? (ok ? UP : DOWN) : INK;
      const f = i === 6 ? bold : font;
      page.drawText(text, { x: x + 4, y: y - 10, size: 8, font: f, color });
      x += COLUMNS[i].width;
    });
    y -= ROW_H;
    page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 0.4, color: BORDER });
  }

  drawFooter();

  const bytes = await doc.save();
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="amxinz-predictions.pdf"',
      "Cache-Control": "no-store",
    },
  });
}
