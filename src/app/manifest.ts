import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BOXTER",
    short_name: "BOXTER",
    description: "전국 패키징 업체를 한눈에. B2B 포장재 파트너 찾기.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#0A0F1E",
    icons: [
      {
        src: "/boxter-favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
