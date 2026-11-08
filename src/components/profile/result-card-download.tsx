"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import qrcode from "qrcode-generator";
import { Button } from "@/components/ui/button";
import type { BadgeCounts } from "@/lib/challenge-stats";
import { SITE, SITE_URL } from "@/config/site";

export interface ChallengeLine {
  title: string;
  rank: string; // e.g. "2nd of 7"
  points: number;
}

export interface ResultCardData {
  name: string;
  username: string | null; // when set, a QR code to /u/<username> is drawn on the card
  challenges: ChallengeLine[]; // newest finished challenges, up to 3
  challengeSummary: { joined: number; finished: number };
  badges: BadgeCounts;
  avatarUrl: string | null;
  score: number;
  played: number;
  correct: number;
  winRate: number; // -1 = no data
  bestAssetLabel: string | null; // e.g. "BTC/USDT · 72% over 18 rounds"
  form: boolean[]; // last N results, oldest first
}

const W = 1080;
const H = 1350;
const INK = "#37352f";
const MUTED = "#787774";
const BORDER = "#e9e9e7";
const UP = "#0f7b6c";
const DOWN = "#e03e3e";

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Resolves to null instead of rejecting, so a missing logo file or a blocked avatar
// never stops the rest of the card from being drawn.
function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // required so the canvas can still be exported afterwards
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function drawInitial(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, letter: string) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = "#f7f6f3";
  ctx.fill();
  ctx.fillStyle = MUTED;
  ctx.font = `700 ${Math.round(r)}px Inter, -apple-system, Segoe UI, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(letter, cx, cy + 2);
  ctx.restore();
}

function drawCircleImage(ctx: CanvasRenderingContext2D, img: HTMLImageElement, cx: number, cy: number, r: number) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  // Cover-fit the image into the circle instead of stretching it.
  const scale = Math.max((r * 2) / img.width, (r * 2) / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);
  ctx.restore();
}

const FONT = "Inter, -apple-system, Segoe UI, sans-serif";

function fit(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(`${t}…`).width > maxWidth) t = t.slice(0, -1);
  return `${t.trimEnd()}…`;
}

// Draws the code module by module (no image, no extra request), so it stays sharp at any size.
function drawQr(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: number) {
  const qr = qrcode(0, "M");
  qr.addData(text);
  qr.make();
  const n = qr.getModuleCount();
  const m = Math.floor(size / n);
  const offset = Math.floor((size - m * n) / 2);

  roundRect(ctx, x - 12, y - 12, size + 24, size + 24, 12);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.strokeStyle = BORDER;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = INK;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (qr.isDark(r, c)) ctx.fillRect(x + offset + c * m, y + offset + r * m, m, m);
    }
  }
}

function drawChallenges(ctx: CanvasRenderingContext2D, data: ResultCardData, qrUrl: string | null) {
  const top = 960;
  const right = qrUrl ? 740 : W - 80;

  ctx.fillStyle = MUTED;
  ctx.font = `500 26px ${FONT}`;
  ctx.fillText("Challenges", 80, top);

  // Podium badges next to the heading.
  let bx = 80 + ctx.measureText("Challenges").width + 24;
  const coins: [number, string][] = [
    [data.badges.gold, "#f59e0b"],
    [data.badges.silver, "#a1a1aa"],
    [data.badges.bronze, "#c2763e"],
  ];
  for (const [count, color] of coins) {
    if (count <= 0) continue;
    ctx.save();
    ctx.beginPath();
    ctx.arc(bx + 14, top - 9, 14, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = `700 16px ${FONT}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(count), bx + 14, top - 8);
    ctx.restore();
    bx += 38;
  }

  ctx.fillStyle = MUTED;
  ctx.font = `500 24px ${FONT}`;
  const { joined, finished } = data.challengeSummary;
  ctx.fillText(joined > 0 ? `Joined ${joined} · Finished ${finished}` : "No challenges yet", 80, top + 42);

  data.challenges.slice(0, 3).forEach((c, i) => {
    const y = top + 94 + i * 46;
    const result = `${c.rank ? `${c.rank} · ` : ""}${c.points} pts`;
    ctx.font = `500 26px ${FONT}`;
    const resultWidth = ctx.measureText(result).width;
    ctx.font = `600 30px ${FONT}`;
    ctx.fillStyle = INK;
    ctx.fillText(fit(ctx, c.title, right - 80 - resultWidth - 24), 80, y);
    ctx.font = `500 26px ${FONT}`;
    ctx.fillStyle = MUTED;
    ctx.textAlign = "right";
    ctx.fillText(result, right, y);
    ctx.textAlign = "left";
  });

  if (qrUrl && data.username) {
    const size = 190;
    const x = W - 80 - 12 - size;
    try {
      drawQr(ctx, qrUrl, x, top - 4, size);
      ctx.fillStyle = MUTED;
      ctx.textAlign = "center";
      let fontSize = 24;
      ctx.font = `500 ${fontSize}px ${FONT}`;
      while (ctx.measureText(`@${data.username}`).width > 230 && fontSize > 14) {
        fontSize -= 1;
        ctx.font = `500 ${fontSize}px ${FONT}`;
      }
      ctx.fillText(`@${data.username}`, x + size / 2, top + 236);
      ctx.textAlign = "left";
    } catch {
      /* a QR failure must never block the download */
    }
  }
}

function draw(ctx: CanvasRenderingContext2D, data: ResultCardData, logo: HTMLImageElement | null, avatar: HTMLImageElement | null) {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);
  ctx.textBaseline = "alphabetic";

  // Wordmark: the real logo if it loaded, otherwise the same placeholder mark used elsewhere on the site.
  if (logo) {
    ctx.save();
    roundRect(ctx, 80, 80, 64, 64, 14);
    ctx.clip();
    ctx.drawImage(logo, 80, 80, 64, 64);
    ctx.restore();
  } else {
    roundRect(ctx, 80, 80, 64, 64, 14);
    ctx.fillStyle = INK;
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "700 38px Inter, -apple-system, Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("A", 112, 126);
    ctx.textAlign = "left";
  }
  ctx.fillStyle = INK;
  ctx.font = "700 40px Inter, -apple-system, Segoe UI, sans-serif";
  ctx.fillText(SITE.name, 162, 130);

  // Player's photo, top-right.
  const avatarCx = W - 80 - 35;
  const avatarCy = 112;
  if (avatar) drawCircleImage(ctx, avatar, avatarCx, avatarCy, 35);
  else drawInitial(ctx, avatarCx, avatarCy, 35, data.name.slice(0, 1).toUpperCase());

  // Title
  ctx.fillStyle = MUTED;
  ctx.font = "500 30px Inter, -apple-system, Segoe UI, sans-serif";
  ctx.fillText(`${data.username ? `@${data.username}` : data.name}'s chart-reading report`, 80, 230);

  // Big win rate
  const hasData = data.played > 0;
  ctx.fillStyle = hasData ? (data.winRate >= 50 ? UP : DOWN) : MUTED;
  ctx.font = "700 200px Inter, -apple-system, Segoe UI, sans-serif";
  ctx.fillText(hasData ? `${data.winRate}%` : "–", 80, 460);
  ctx.fillStyle = MUTED;
  ctx.font = "500 30px Inter, -apple-system, Segoe UI, sans-serif";
  ctx.fillText("win rate", 84, 500);

  // Stat grid
  const stats: [string, string][] = [
    ["Score", String(data.score)],
    ["Predictions", String(data.played)],
    ["Correct", String(data.correct)],
  ];
  const gridY = 570;
  const colW = (W - 160) / 3;
  stats.forEach(([label, value], i) => {
    const x = 80 + i * colW;
    ctx.fillStyle = MUTED;
    ctx.font = "500 24px Inter, -apple-system, Segoe UI, sans-serif";
    ctx.fillText(label, x, gridY);
    ctx.fillStyle = INK;
    ctx.font = "700 48px Inter, -apple-system, Segoe UI, sans-serif";
    ctx.fillText(value, x, gridY + 52);
  });
  ctx.strokeStyle = BORDER;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(80, gridY + 90);
  ctx.lineTo(W - 80, gridY + 90);
  ctx.stroke();

  // Best asset
  ctx.fillStyle = MUTED;
  ctx.font = "500 26px Inter, -apple-system, Segoe UI, sans-serif";
  ctx.fillText("Best asset", 80, gridY + 150);
  ctx.fillStyle = INK;
  ctx.font = "600 34px Inter, -apple-system, Segoe UI, sans-serif";
  ctx.fillText(data.bestAssetLabel ?? "Play more rounds to unlock this", 80, gridY + 190);

  // Recent form
  if (data.form.length > 0) {
    const formY = gridY + 260;
    ctx.fillStyle = MUTED;
    ctx.font = "500 26px Inter, -apple-system, Segoe UI, sans-serif";
    ctx.fillText(`Last ${data.form.length} predictions`, 80, formY);
    const dot = 34;
    const gap = 10;
    data.form.forEach((ok, i) => {
      const x = 80 + i * (dot + gap);
      roundRect(ctx, x, formY + 24, dot, dot, 7);
      ctx.fillStyle = ok ? UP : DOWN;
      ctx.fill();
    });
  }

  drawChallenges(ctx, data, data.username ? `${SITE_URL}/u/${data.username}` : null);

  // Footer
  ctx.fillStyle = MUTED;
  ctx.font = "500 26px Inter, -apple-system, Segoe UI, sans-serif";
  ctx.fillText(SITE_URL.replace(/^https?:\/\//, ""), 80, H - 80);
  ctx.textAlign = "right";
  ctx.fillText("Real charts. No looking it up.", W - 80, H - 80);
  ctx.textAlign = "left";
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not export the image."))), "image/png");
    } catch (err) {
      // Chrome/Firefox throw synchronously here when the canvas was "tainted" by a
      // cross-origin image that didn't allow anonymous reads.
      reject(err instanceof Error ? err : new Error("Could not export the image."));
    }
  });
}

export function ResultCardDownload({ data }: { data: ResultCardData }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function download() {
    setError(null);
    setBusy(true);
    try {
      await new Promise((r) => requestAnimationFrame(r));

      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("This browser can't create the image.");

      await document.fonts.load("700 40px Inter").catch(() => undefined);

      const [logo, avatar] = await Promise.all([
        loadImage("/logo.png"),
        data.avatarUrl ? loadImage(data.avatarUrl) : Promise.resolve(null),
      ]);

      draw(ctx, data, logo, avatar);

      let blob: Blob;
      try {
        blob = await canvasToBlob(canvas);
      } catch {
        // The avatar's host likely doesn't allow anonymous cross-origin reads.
        // Redraw without it so the download still succeeds.
        draw(ctx, data, logo, null);
        blob = await canvasToBlob(canvas);
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "amxinz-results.png";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the image.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <Button variant="outline" onClick={download} disabled={busy}>
        {busy ? <Loader2 className="animate-spin" /> : <Download />}
        Download image
      </Button>
      {error && (
        <p role="alert" className="mt-2 text-[13px] text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
