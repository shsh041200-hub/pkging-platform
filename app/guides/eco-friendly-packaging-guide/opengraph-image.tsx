import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "친환경 포장재 종류 완전 가이드 — 생분해·재활용·바이오기반 비교 | Packlinx";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#1c6b3a",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px",
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: 52,
            fontWeight: 700,
            textAlign: "center",
            lineHeight: 1.3,
            marginBottom: 24,
          }}
        >
          친환경 포장재 종류 완전 가이드
        </div>
        <div style={{ color: "#bbf7d0", fontSize: 28, textAlign: "center" }}>
          생분해·재활용·바이오기반 비교 | Packlinx
        </div>
      </div>
    ),
    size
  );
}
