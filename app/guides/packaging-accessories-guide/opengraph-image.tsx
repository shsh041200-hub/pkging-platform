import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt =
  "포장 부자재 종류 완전 가이드 — 완충재·테이프·충전재 비교 + 환경 규제 | Packlinx";
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
          포장 부자재 종류 완전 가이드
        </div>
        <div style={{ color: "#bfdbfe", fontSize: 26, textAlign: "center" }}>
          완충재·테이프·충전재 비교 + 환경 규제 | Packlinx
        </div>
      </div>
    ),
    size
  );
}
