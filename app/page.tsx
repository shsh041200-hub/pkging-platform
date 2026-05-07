import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "홈",
  description: "국내 포장재 공급업체 B2B 디렉토리 — Packlinx",
};

export default function HomePage() {
  return (
    <main>
      <h1>Packlinx</h1>
      <p className="description">
        한국 포장재 B2B 디렉토리 — PoC 배포 완료
      </p>
      <p>
        키워드 페이지 예시:{" "}
        <a href="/keywords/test-keyword">/keywords/test-keyword</a>
      </p>
    </main>
  );
}
