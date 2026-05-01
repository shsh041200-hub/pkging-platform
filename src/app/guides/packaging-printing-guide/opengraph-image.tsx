import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "포장 인쇄 종류·후가공 완전 가이드 — Packlinx";
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
            fontSize: 52,
            fontWeight: 700,
            textAlign: "center",
            lineHeight: 1.3,
            marginBottom: 24,
          }}
        >
          포장 인쇄 종류·후가공 완전 가이드
        </div>
        <div style={{ color: "#bfdbfe", fontSize: 26, textAlign: "center" }}>
          옵셋·플렉소·그라비어·디지털 비교 | Packlinx
        </div>
      </div>
    ),
    size
  );
}
