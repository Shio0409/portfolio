import type { CategoryId } from "./portfolio-data";

export type SolarPlanet = {
  name: string;
  jp: string;
  prefix: string;
  description: string;
  detail: string;
  focus: readonly [string, string, string];
  color: string;
  glow: string;
  texture: string;
  fallbackImage: string;
  radius: number;
  axialTilt: number;
  spin: number;
  roughness: number;
  atmosphere: number;
  ring?: { inner: number; outer: number; opacity: number };
  category: CategoryId;
};

export const solarPlanets: readonly SolarPlanet[] = [
  { name:"MERCURY", jp:"水星", prefix:"問いを", description:"曖昧な課題を、チームが動き出せる問いへ。", detail:"前提・制約・期待をほどき、いま答えるべき論点を見極める。全員が同じ判断基準を持てるところまで、課題の輪郭を明確にする。", focus:["課題定義","要件整理","意思決定"], color:"#a9a5a1", glow:"#cbc6bd", texture:"/planets/webgl/mercury.jpg", fallbackImage:"/planets/mercury.jpg", radius:.19, axialTilt:.03, spin:.11, roughness:.96, atmosphere:.36, category:"system" },
  { name:"VENUS", jp:"金星", prefix:"関係を", description:"立場の違いを、協働できる接点へ。", detail:"異なる専門性や期待をそのまま衝突させず、互いに理解できる言葉へ翻訳する。対話と合意の導線から、継続して動ける関係を設計する。", focus:["関係者調整","共通言語","合意形成"], color:"#efb56f", glow:"#ff8d47", texture:"/planets/webgl/venus.jpg", fallbackImage:"/planets/venus.jpg", radius:.28, axialTilt:3.09, spin:-.045, roughness:.9, atmosphere:.34, category:"community" },
  { name:"EARTH", jp:"地球", prefix:"体験を", description:"目的と感情を、記憶に残る導線へ。", detail:"触れる前の期待から、行動中の発見、体験後に残る感情までをひとつの流れとして捉える。事業の目的とユーザーの実感が重なる体験を組み立てる。", focus:["体験設計","ユーザー導線","感情設計"], color:"#5ee9ff", glow:"#3156ff", texture:"/planets/webgl/earth.jpg", fallbackImage:"/planets/earth.jpg", radius:.29, axialTilt:.41, spin:.13, roughness:.78, atmosphere:.5, category:"world" },
  { name:"MARS", jp:"火星", prefix:"遊びを", description:"反応とルールを、触れたくなる楽しさへ。", detail:"直感的な操作、予想を少し越える反応、もう一度試したくなる余白を重ねる。理解より先に手が動く、身体感覚のある遊びを実装する。", focus:["インタラクション","ゲームルール","フィードバック"], color:"#f17655", glow:"#d83c2e", texture:"/planets/webgl/mars.jpg", fallbackImage:"/planets/mars.jpg", radius:.23, axialTilt:.44, spin:.12, roughness:.94, atmosphere:.32, category:"play" },
  { name:"JUPITER", jp:"木星", prefix:"世界を", description:"空間と物語を、訪れる理由のある世界へ。", detail:"見た目の設定だけでなく、そこにいる人の行動や関係まで含めて世界を設計する。探索・滞在・再訪が自然につながる構造を立ち上げる。", focus:["世界観設計","空間体験","行動設計"], color:"#e4b48c", glow:"#c16e55", texture:"/planets/webgl/jupiter.jpg", fallbackImage:"/planets/jupiter.jpg", radius:.62, axialTilt:.05, spin:.2, roughness:.82, atmosphere:.26, category:"world" },
  { name:"SATURN", jp:"土星", prefix:"仕組みを", description:"複雑な条件を、継続して届く構造へ。", detail:"理想だけでなく、運用・優先順位・担当・更新方法までを同時に設計する。アイデアが一度きりで終わらず、改善を続けられる仕組みに変える。", focus:["プロジェクト設計","運用構築","改善サイクル"], color:"#e8d394", glow:"#d49b55", texture:"/planets/webgl/saturn.jpg", fallbackImage:"/planets/saturn.jpg", radius:.53, axialTilt:.47, spin:.18, roughness:.78, atmosphere:.24, ring:{ inner:1.28, outer:2.04, opacity:.52 }, category:"system" },
  { name:"URANUS", jp:"天王星", prefix:"文化を", description:"参加と制作を、育ち続ける場へ。", detail:"受け手と作り手を分けず、参加した人が次の価値を生み出せる余白をつくる。学び・共有・創作が循環し、関わるほど育つ文化を支える。", focus:["コミュニティ","参加設計","学習循環"], color:"#8ce7e8", glow:"#4eb8ca", texture:"/planets/webgl/uranus.jpg", fallbackImage:"/planets/uranus.webp", radius:.39, axialTilt:1.71, spin:-.08, roughness:.68, atmosphere:.38, ring:{ inner:1.34, outer:1.76, opacity:.2 }, category:"community" },
  { name:"NEPTUNE", jp:"海王星", prefix:"未来を", description:"未知の可能性を、次の現実への入口へ。", detail:"まだ正解のない領域では、小さく触れられる形を先につくる。試作から得た反応を次の判断へつなぎ、遠い構想を現実の一歩へ変える。", focus:["プロトタイピング","仮説検証","未来構想"], color:"#6a79ff", glow:"#3447e2", texture:"/planets/webgl/neptune.jpg", fallbackImage:"/planets/neptune.webp", radius:.38, axialTilt:.49, spin:.1, roughness:.7, atmosphere:.42, category:"play" },
] as const;
