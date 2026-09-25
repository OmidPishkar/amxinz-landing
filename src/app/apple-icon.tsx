import { ImageResponse } from "next/og";
import { SITE_URL as baseUrl } from "@/config/site";

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
          background: "#ffffff",
        }}
      >
        <img src={`${baseUrl}/logo.png`} alt="Amxinz" width={110} height={110} className="rounded-md" />
      </div>
    ),
    { ...size },
  );
}
