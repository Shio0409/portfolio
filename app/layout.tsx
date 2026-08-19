import type { Metadata } from "next";
import "./globals.css";

const title = "塩澤 正高 / Masataka Shiozawa — つくる。 | Project Manager / Director";
const description = "塩澤 正高のポートフォリオ。メタバースを舞台に、領域をつなぎ、まだ名前のない体験を実装するProject Manager / Director。";

export const metadata: Metadata = {
  metadataBase: new URL("https://pm-director-portfolio-2026.mn756900.chatgpt.site"),
  title,
  description,
  robots: { index: false, follow: false },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {
    title,
    description,
    type: "website",
    images: [{ url: "/og-masataka-shiozawa.png", width: 1729, height: 910, alt: "Masataka Shiozawa — つくる。" }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-masataka-shiozawa.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
