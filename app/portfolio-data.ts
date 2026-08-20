export type CategoryId = "world" | "play" | "system" | "community";

type PortfolioMediaBase = {
  src: string;
  alt: string;
  poster?: string;
  label?: string;
  focalPoint?: string;
};

export type PortfolioMedia = PortfolioMediaBase & ({
  kind: "image";
} | {
  kind: "video";
  captions: string;
  autoPlay?: boolean;
  controls?: boolean;
  loop?: boolean;
  muted?: boolean;
});

export type CareerEvent = {
  id: string;
  year: string;
  type: string;
  title: string;
  role?: string;
  description: string;
  highlights?: string[];
  unlocked: string;
  media?: PortfolioMedia;
};

export const careerEvents: CareerEvent[] = [
  {
    id: "maebashi-high",
    year: "EDUCATION 01",
    type: "HIGH SCHOOL",
    title: "群馬県立前橋高等学校",
    description: "群馬県立前橋高等学校で学ぶ。",
    unlocked: "FOUNDATION",
  },
  {
    id: "kanagawa-university",
    year: "EDUCATION 02",
    type: "UNIVERSITY",
    title: "神奈川大学 人間科学部",
    role: "人間科学科 / 心理学専攻",
    description: "心理学を専攻し、実験プログラミングを通じて、人の行動を観察・検証する方法に触れる。",
    unlocked: "RESEARCH",
  },
  {
    id: "meiko-gijuku",
    year: "TEACHING",
    type: "PART-TIME",
    title: "明光義塾",
    role: "アルバイト講師",
    description: "小学生から高校生までの受験生を個別指導。長期休暇には集団授業も担当し、一人ひとりに合わせた学びを設計した。",
    highlights: ["小学生〜高校生", "個別・集団授業", "プレミアムティーチャー賞"],
    unlocked: "COMMUNICATION",
  },
  {
    id: "education-lab",
    year: "OPERATIONS",
    type: "FULL-TIME",
    title: "教育人間科学研究所",
    role: "正社員第一号 / 教室長代理 / プログラミング主任講師",
    description: "FAMよこはまアフタースクールの運営を担い、教室・事業・プログラミング教育の成長を推進。民間学童から、横浜市の補助を受けて運営する体制へ発展させた。",
    highlights: ["利用児童 15 → 約120名", "補助金 年4,000万円規模", "講座 1クラス約6名 → 3クラス・計30名"],
    unlocked: "SCALE & OPERATIONS",
  },
  {
    id: "compass",
    year: "VENTURE",
    type: "FOUNDER",
    title: "compass 設立",
    role: "小学生向けプログラミング教室 / 創設・運営",
    description: "土日に学べる小学生向けプログラミング教室を設立。継続的に黒字を維持しながら、現在も事業を拡大している。",
    highlights: ["継続黒字", "現在も拡大中"],
    unlocked: "ENTREPRENEURSHIP",
  },
];
