export type CategoryId = "world" | "play" | "system" | "community";

export type Category = {
  id: CategoryId;
  number: string;
  label: string;
  japanese: string;
  statement: string;
  description: string;
  accent: string;
  surface: string;
  foreground: string;
};

export type Project = {
  id: string;
  number: string;
  category: CategoryId;
  title: string;
  subtitle: string;
  description: string;
  role: string;
  period: string;
  team: string;
  result: string;
  skills: string[];
  visual: "portal" | "terrain" | "pulse" | "blocks" | "grid" | "signal" | "orbit" | "gather";
};

export type CareerEvent = {
  year: string;
  type: string;
  title: string;
  role?: string;
  description: string;
  highlights?: string[];
  unlocked: string;
};

export const categories: Category[] = [
  {
    id: "world",
    number: "01",
    label: "WORLD",
    japanese: "世界をつくる。",
    statement: "空間に、訪れる理由を。",
    description:
      "場所そのものではなく、そこで何を感じ、どう動き、誰と出会うかまで設計する。",
    accent: "#b8ff4a",
    surface: "#2157f3",
    foreground: "#f5f3ec",
  },
  {
    id: "play",
    number: "02",
    label: "PLAY",
    japanese: "遊びをつくる。",
    statement: "触れたくなる、きっかけを。",
    description:
      "説明より先に手が動く。ルール、音、反応を組み合わせ、直感的な楽しさをつくる。",
    accent: "#fff36a",
    surface: "#ff5c35",
    foreground: "#151512",
  },
  {
    id: "system",
    number: "03",
    label: "SYSTEM",
    japanese: "仕組みをつくる。",
    statement: "アイデアが届く、構造を。",
    description:
      "複雑な条件を整理し、チームが動けて、ユーザーが迷わない実装可能な形へ変換する。",
    accent: "#161713",
    surface: "#d7ff3f",
    foreground: "#10110f",
  },
  {
    id: "community",
    number: "04",
    label: "COMMUNITY",
    japanese: "人が集まる場所をつくる。",
    statement: "参加が、次の参加を生む。",
    description:
      "イベント、学び、制作を一度きりで終わらせず、人と経験が循環する場を育てる。",
    accent: "#ff8fbd",
    surface: "#6d3df5",
    foreground: "#f7f2ff",
  },
];

export const projects: Project[] = [
  {
    id: "project-01",
    number: "001",
    category: "world",
    title: "[PROJECT 01]",
    subtitle: "SPATIAL EXPERIENCE",
    description: "[作品の目的、体験、成果をここに追加します。]",
    role: "[ROLE]",
    period: "[PERIOD]",
    team: "[TEAM]",
    result: "[RESULT]",
    skills: ["[SKILL 01]", "[SKILL 02]", "[TOOL]"],
    visual: "portal",
  },
  {
    id: "project-02",
    number: "002",
    category: "world",
    title: "[PROJECT 02]",
    subtitle: "WORLD / ENVIRONMENT",
    description: "[作品の目的、体験、成果をここに追加します。]",
    role: "[ROLE]",
    period: "[PERIOD]",
    team: "[TEAM]",
    result: "[RESULT]",
    skills: ["[SKILL 01]", "[SKILL 02]", "[TOOL]"],
    visual: "terrain",
  },
  {
    id: "project-03",
    number: "003",
    category: "play",
    title: "[PROJECT 03]",
    subtitle: "INTERACTIVE PLAY",
    description: "[作品の目的、体験、成果をここに追加します。]",
    role: "[ROLE]",
    period: "[PERIOD]",
    team: "[TEAM]",
    result: "[RESULT]",
    skills: ["[SKILL 01]", "[SKILL 02]", "[TOOL]"],
    visual: "pulse",
  },
  {
    id: "project-04",
    number: "004",
    category: "play",
    title: "[PROJECT 04]",
    subtitle: "GAME / GIMMICK",
    description: "[作品の目的、体験、成果をここに追加します。]",
    role: "[ROLE]",
    period: "[PERIOD]",
    team: "[TEAM]",
    result: "[RESULT]",
    skills: ["[SKILL 01]", "[SKILL 02]", "[TOOL]"],
    visual: "blocks",
  },
  {
    id: "project-05",
    number: "005",
    category: "system",
    title: "[PROJECT 05]",
    subtitle: "SYSTEM / PROTOTYPE",
    description: "[作品の目的、体験、成果をここに追加します。]",
    role: "[ROLE]",
    period: "[PERIOD]",
    team: "[TEAM]",
    result: "[RESULT]",
    skills: ["[SKILL 01]", "[SKILL 02]", "[TOOL]"],
    visual: "grid",
  },
  {
    id: "project-06",
    number: "006",
    category: "system",
    title: "[PROJECT 06]",
    subtitle: "DESIGN / DIRECTION",
    description: "[作品の目的、体験、成果をここに追加します。]",
    role: "[ROLE]",
    period: "[PERIOD]",
    team: "[TEAM]",
    result: "[RESULT]",
    skills: ["[SKILL 01]", "[SKILL 02]", "[TOOL]"],
    visual: "signal",
  },
  {
    id: "project-07",
    number: "007",
    category: "community",
    title: "[PROJECT 07]",
    subtitle: "EVENT / COMMUNITY",
    description: "[作品の目的、体験、成果をここに追加します。]",
    role: "[ROLE]",
    period: "[PERIOD]",
    team: "[TEAM]",
    result: "[RESULT]",
    skills: ["[SKILL 01]", "[SKILL 02]", "[TOOL]"],
    visual: "orbit",
  },
  {
    id: "project-08",
    number: "008",
    category: "community",
    title: "[PROJECT 08]",
    subtitle: "LEARNING / CREATION",
    description: "[作品の目的、体験、成果をここに追加します。]",
    role: "[ROLE]",
    period: "[PERIOD]",
    team: "[TEAM]",
    result: "[RESULT]",
    skills: ["[SKILL 01]", "[SKILL 02]", "[TOOL]"],
    visual: "gather",
  },
];

export const careerEvents: CareerEvent[] = [
  {
    year: "EDUCATION 01",
    type: "HIGH SCHOOL",
    title: "群馬県立前橋高等学校",
    description: "群馬県立前橋高等学校で学ぶ。",
    unlocked: "FOUNDATION",
  },
  {
    year: "EDUCATION 02",
    type: "UNIVERSITY",
    title: "神奈川大学 人間科学部",
    role: "人間科学科 / 心理学専攻",
    description: "心理学を専攻し、実験プログラミングを通じて、人の行動を観察・検証する方法に触れる。",
    unlocked: "RESEARCH",
  },
  {
    year: "TEACHING",
    type: "PART-TIME",
    title: "明光義塾",
    role: "アルバイト講師",
    description: "小学生から高校生までの受験生を個別指導。長期休暇には集団授業も担当し、一人ひとりに合わせた学びを設計した。",
    highlights: ["小学生〜高校生", "個別・集団授業", "プレミアムティーチャー賞"],
    unlocked: "COMMUNICATION",
  },
  {
    year: "OPERATIONS",
    type: "FULL-TIME",
    title: "教育人間科学研究所",
    role: "正社員第一号 / 教室長代理 / プログラミング主任講師",
    description: "FAMよこはまアフタースクールの運営を担い、教室・事業・プログラミング教育の成長を推進。民間学童から、横浜市の補助を受けて運営する体制へ発展させた。",
    highlights: ["利用児童 15 → 約120名", "補助金 年4,000万円規模", "講座 1クラス約6名 → 3クラス・計30名"],
    unlocked: "SCALE & OPERATIONS",
  },
  {
    year: "VENTURE",
    type: "FOUNDER",
    title: "compass 設立",
    role: "小学生向けプログラミング教室 / 創設・運営",
    description: "土日に学べる小学生向けプログラミング教室を設立。継続的に黒字を維持しながら、現在も事業を拡大している。",
    highlights: ["継続黒字", "現在も拡大中"],
    unlocked: "ENTREPRENEURSHIP",
  },
];

export const processSteps = [
  ["01", "WHY", "[なぜこのプロジェクトに取り組んだかを追加します。]"],
  ["02", "IDEA", "[課題に対する着眼点と企画意図を追加します。]"],
  ["03", "PROTOTYPE", "[最初に検証した仮説と試作を追加します。]"],
  ["04", "PROBLEM", "[制作中に見つかった問題を追加します。]"],
  ["05", "ITERATION", "[判断、調整、改善の過程を追加します。]"],
  ["06", "RESULT", "[公開後の成果や反応を追加します。]"],
  ["07", "LEARNING", "[次のプロジェクトにつながった学びを追加します。]"],
] as const;
