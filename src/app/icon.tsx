import { ImageResponse } from "next/og";

export const size = { width: 48, height: 48 };
export const contentType = "image/png";

// Placeholder mark. Replace with your real logo when you have it.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#37352f",
          color: "#ffffff",
          fontSize: 32,
          fontWeight: 700,
          borderRadius: 10,
        }}
      >
        <img src="/logo.png" alt="Amxinz" width={24} height={24} className="rounded-md" />

      </div>
    ),
    { ...size },
  );
}
