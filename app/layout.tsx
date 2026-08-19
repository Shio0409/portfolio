import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "[NAME] — Project Manager / Director",
  description:
    "アイデアを人が体験できる状態まで導くProject Manager / Directorのポートフォリオ。",
  robots: {
    index: false,
    follow: false,
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
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
