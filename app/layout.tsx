import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import PlausibleAnalytics from "./components/PlausibleAnalytics";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://packlinx.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Packlinx — 한국 포장재 B2B 디렉토리",
    template: "%s | Packlinx",
  },
  description: "국내 포장재 공급업체를 한눈에 비교하세요.",
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <head>
        <Script
          defer
          data-domain="packlinx.com"
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
        />
      </head>
      <body>
        {children}
        <PlausibleAnalytics />
      </body>
    </html>
  );
}
