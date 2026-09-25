import { ImageResponse } from "next/og";
import { SITE_URL as baseUrl } from "@/config/site";

export const size = { width: 48, height: 48 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <img src={`${baseUrl}/logo.png`} alt="Amxinz" width={24} height={24} className="rounded-md" />
      </div>
    ),
    { ...size },
  );
}
