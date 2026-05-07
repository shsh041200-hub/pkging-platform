import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PACKLINX",
    short_name: "PACKLINX",
    description: "전국 패키징 업체를 한눈에. B2B 포장재 파트너 찾기.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#0F172A",
    icons: [
      {
        src: "/packlinx-favicon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/favicon.svg",
        sizes: "32x32",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
