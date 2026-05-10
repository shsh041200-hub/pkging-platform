import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "전자제품 패키징 디자인 가이드 — ESD 방지·완충재·인증 마크 | Packlinx";
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
            fontSize: 48,
            fontWeight: 700,
            textAlign: "center",
            lineHeight: 1.3,
            marginBottom: 24,
          }}
        >
          전자제품 패키징 디자인 가이드
        </div>
        <div style={{ color: "#bfdbfe", fontSize: 26, textAlign: "center" }}>
          ESD 방지·완충재·인증 마크 | Packlinx
        </div>
      </div>
    ),
    size
  );
}
