import type { Metadata } from "next";
import { GUIDE_META } from "@/lib/guide-data";
import { GuidesHubV1Client } from "./GuidesHubV1Client";

export const metadata: Metadata = {
  title: "[Preview] 가이드 허브 V1 — PACAA-549",
  robots: { index: false, follow: false },
};

export default function GuidesHubV1Page() {
  const totalGuides = GUIDE_META.length;
  return (
    <>
      {/* Preview banner */}
      <div
        className="fixed top-0 left-0 right-0 z-50 text-center py-2 text-xs font-semibold text-white"
        style={{ background: "#7c3aed" }}
      >
        [PREVIEW] guides-hub-v1 · PACAA-549 · noindex ·{" "}
        <a href="/guides" className="underline text-white/80 hover:text-white ml-1">
          production 비교 →
        </a>
      </div>
      <div className="pt-8">
        <GuidesHubV1Client totalGuides={totalGuides} />
      </div>
    </>
  );
}
