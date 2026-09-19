import { Fragment } from "react";
import { ImageResponse } from "next/og";
import Image from "next/image";

export const alt = "Amxinz: predict real candlestick charts and climb the leaderboard";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const W = 1040;
const H = 190;
const VISIBLE = 30;
const HIDDEN = 8;
const SLOTS = VISIBLE + HIDDEN;

function makeCandles(n: number) {
  let seed = 11;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  let price = 0;
  return Array.from({ length: n }, () => {
    const open = price;
    const close = price + (rand() - 0.46) * 46;
    price = close;
    return {
      open,
      close,
      high: Math.max(open, close) + rand() * 22,
      low: Math.min(open, close) - rand() * 22,
    };
  });
}

// Generated at build time; shared by Open Graph and Twitter cards.
export default function OpengraphImage() {
  const candles = makeCandles(VISIBLE);
  const lo = Math.min(...candles.map((c) => c.low));
  const hi = Math.max(...candles.map((c) => c.high));
  const y = (v: number) => ((hi - v) / (hi - lo)) * (H - 20) + 10;
  const slot = W / SLOTS;
  const bodyW = slot * 0.55;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#ffffff",
          color: "#37352f",
          padding: "64px 80px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              borderRadius: 12,
              background: "#37352f",
              color: "#ffffff",
              fontSize: 34,
              fontWeight: 700,
            }}
          >
            <Image src="/logo.png" alt="Amxinz" width={24} height={24} className="rounded-md" />

          </div>
          <div style={{ display: "flex", marginLeft: 18, fontSize: 36, fontWeight: 700 }}>Amxinz</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2 }}>
            Read the chart.
          </div>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2 }}>
            Call the next move.
          </div>
          <div style={{ display: "flex", marginTop: 20, fontSize: 30, color: "#787774" }}>
            Predict real candlestick charts. Climb the leaderboard.
          </div>
        </div>

        <div style={{ display: "flex", position: "relative", width: W, height: H }}>
          <div
            style={{
              display: "flex",
              position: "absolute",
              left: VISIBLE * slot,
              top: 0,
              width: HIDDEN * slot,
              height: H,
              background: "#f7f6f3",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 64,
              color: "#787774",
            }}
          >
            ?
          </div>
          {candles.map((c, i) => {
            const color = c.close >= c.open ? "#0f7b6c" : "#e03e3e";
            const x = i * slot;
            const bodyTop = y(Math.max(c.open, c.close));
            const bodyH = Math.max(4, Math.abs(y(c.open) - y(c.close)));
            return (
              <Fragment key={i}>
                <div
                  style={{
                    display: "flex",
                    position: "absolute",
                    left: x + bodyW / 2 - 1.5,
                    top: y(c.high),
                    width: 3,
                    height: y(c.low) - y(c.high),
                    background: color,
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    position: "absolute",
                    left: x,
                    top: bodyTop,
                    width: bodyW,
                    height: bodyH,
                    background: color,
                    borderRadius: 2,
                  }}
                />
              </Fragment>
            );
          })}
        </div>
      </div>
    ),
    { ...size },
  );
}
