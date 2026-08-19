import type { Metadata } from "next";
import PortfolioExperience from "./PortfolioExperience";

export const metadata: Metadata = {
  title: "塩澤 正高 / Masataka Shiozawa — つくる。 | Project Manager / Director",
  description:
    "塩澤 正高のポートフォリオ。メタバースを舞台に、領域をつなぎ、まだ名前のない体験を実装するProject Manager / Director。",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Home() {
  return <PortfolioExperience />;
}
