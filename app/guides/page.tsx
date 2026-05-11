import type { Metadata } from "next";
import { GUIDE_META } from "@/lib/guide-data";
import { GuidesHubV1Client } from "./GuidesHubV1Client";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.packlinx.com";
const canonicalUrl = `${siteUrl}/guides`;

export const metadata: Metadata = {
  title: "패키징 실무 가이드 — 포장재 업체 선정·소재·공정 완벽 정리",
  description:
    "소재 선택부터 MOQ·납기·인증까지. 1,380개 업체 데이터를 기반으로 만든 포장재 구매 담당자를 위한 현장형 가이드.",
  alternates: {
    canonical: canonicalUrl,
    languages: { "ko-KR": canonicalUrl },
  },
  openGraph: {
    title: "패키징 실무 가이드 — Packlinx",
    description:
      "소재 선택부터 MOQ·납기·인증까지. 1,380개 업체 데이터를 기반으로 만든 현장형 가이드.",
    url: canonicalUrl,
    siteName: "Packlinx",
    locale: "ko_KR",
    type: "website",
  },
};

export default function GuidesIndexPage() {
  const totalGuides = GUIDE_META.length;
  return <GuidesHubV1Client totalGuides={totalGuides} />;
}
