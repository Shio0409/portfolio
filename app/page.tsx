import type { Metadata } from "next";
import PortfolioExperience from "./PortfolioExperience";

export const metadata: Metadata = {
  title: "[NAME] — つくる。 | Project Manager / Director",
  description:
    "メタバースを舞台に、領域をつなぎ、まだ名前のない体験を実装するProject Manager / Directorのポートフォリオ。",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Home() {
  return <PortfolioExperience />;
}
