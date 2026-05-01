import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "연포장재 완전 가이드 — 종류·소재·선택 기준 | Packlinx";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#1a56db",
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
            fontSize: 56,
            fontWeight: 700,
            textAlign: "center",
            lineHeight: 1.3,
            marginBottom: 24,
          }}
        >
          연포장재 완전 가이드
        </div>
        <div style={{ color: "#bfdbfe", fontSize: 28, textAlign: "center" }}>
          종류·소재·식품별 선택 기준 | Packlinx
        </div>
      </div>
    ),
    size
  );
}
