import Image from "next/image";
import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
          fontSize: 112,
          fontWeight: 700,
        }}
      >
        <Image src="/logo.png" alt="Amxinz" width={24} height={24} className="rounded-md" />

      </div>
    ),
    { ...size },
  );
}
