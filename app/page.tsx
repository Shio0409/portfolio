import type { Metadata } from "next";
import PortfolioExperience from "./PortfolioExperience";

export const metadata: Metadata = {
  title: "[NAME] — Project Manager / Director",
  description:
    "企画、デザイン、技術、コミュニティを横断し、アイデアを体験へ導くProject Manager / Directorのポートフォリオ。",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Home() {
  return <PortfolioExperience />;
}
