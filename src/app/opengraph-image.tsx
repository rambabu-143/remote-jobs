import { ImageResponse } from "next/og";

export const alt = "365DaysJobsTeam: remote jobs from verified employers";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Default share card for links to the site (job pages inherit it).
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "#000", color: "#fff" }}>
        <div style={{ fontSize: 40, color: "#a1a1aa" }}>365daysjobs.com</div>
        <div style={{ marginTop: 24, fontSize: 84, fontWeight: 700, lineHeight: 1.05 }}>Remote jobs from verified employers</div>
        <div style={{ marginTop: 32, fontSize: 36, color: "#d4d4d8" }}>Browse and apply to your next remote role.</div>
      </div>
    ),
    size,
  );
}
