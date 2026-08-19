import type { Metadata } from "next";
import "./globals.css";

const title = "[NAME] — つくる。 | Project Manager / Director";
const description = "メタバースを舞台に、領域をつなぎ、まだ名前のない体験を実装するProject Manager / Directorのポートフォリオ。";

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
    images: [{ url: "/og.png", width: 1733, height: 909, alt: "[NAME] — つくる。" }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og.png"],
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
