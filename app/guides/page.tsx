import type { Metadata } from "next";
import Link from "next/link";
import { GUIDE_META } from "@/lib/guide-data";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://packlinx.com";
const canonicalUrl = `${siteUrl}/guides`;

export const metadata: Metadata = {
  title: "포장재 가이드 — 업체 선정·소재·공정 완벽 정리",
  description:
    "포장재 구매 담당자를 위한 실무 가이드. 소재 비교, 업체 선정 기준, 발주 절차를 한곳에서 확인하세요.",
  alternates: {
    canonical: canonicalUrl,
    languages: { "ko-KR": canonicalUrl },
  },
  openGraph: {
    title: "포장재 가이드 — Packlinx",
    description:
      "포장재 구매 담당자를 위한 실무 가이드. 소재 비교, 업체 선정 기준, 발주 절차를 한곳에서 확인하세요.",
    url: canonicalUrl,
    siteName: "Packlinx",
    locale: "ko_KR",
    type: "website",
  },
};

export default function GuidesIndexPage() {
  return (
    <main>
      <h1>포장재 가이드</h1>
      <p>
        Packlinx 콘텐츠팀이 포장재 구매 담당자를 위해 작성한 실무 가이드입니다.
        소재 선택, 업체 선정, 발주 절차 등 핵심 기준을 항목별로 확인하세요.
      </p>
      <ul>
        {GUIDE_META.map((guide) => (
          <li key={guide.slug}>
            <Link href={`/guides/${guide.slug}`}>
              <strong>{guide.title}</strong>
            </Link>
            <p>{guide.description}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
