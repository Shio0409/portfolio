import type { CategoryId } from "./portfolio-data";

export type SolarPlanet = {
  name: string;
  jp: string;
  prefix: string;
  description: string;
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
  { name:"MERCURY", jp:"水星", prefix:"問いを", description:"曖昧な課題を分解し、チームが動き出せる問いへ変換する。", color:"#a9a5a1", glow:"#cbc6bd", texture:"/planets/webgl/mercury.jpg", fallbackImage:"/planets/mercury.jpg", radius:.19, axialTilt:.03, spin:.11, roughness:.96, atmosphere:.36, category:"system" },
  { name:"VENUS", jp:"金星", prefix:"関係を", description:"立場の違いを翻訳し、人と人が協働できる接点を設計する。", color:"#efb56f", glow:"#ff8d47", texture:"/planets/webgl/venus.jpg", fallbackImage:"/planets/venus.jpg", radius:.28, axialTilt:3.09, spin:-.045, roughness:.9, atmosphere:.34, category:"community" },
  { name:"EARTH", jp:"地球", prefix:"体験を", description:"目的・導線・感情の変化をつなぎ、記憶に残る体験を組み立てる。", color:"#5ee9ff", glow:"#3156ff", texture:"/planets/webgl/earth.jpg", fallbackImage:"/planets/earth.jpg", radius:.29, axialTilt:.41, spin:.13, roughness:.78, atmosphere:.5, category:"world" },
  { name:"MARS", jp:"火星", prefix:"遊びを", description:"触れたくなる反応とルールを重ね、直感的な楽しさを実装する。", color:"#f17655", glow:"#d83c2e", texture:"/planets/webgl/mars.jpg", fallbackImage:"/planets/mars.jpg", radius:.23, axialTilt:.44, spin:.12, roughness:.94, atmosphere:.32, category:"play" },
  { name:"JUPITER", jp:"木星", prefix:"世界を", description:"空間・物語・行動を束ね、訪れる理由のある世界を立ち上げる。", color:"#e4b48c", glow:"#c16e55", texture:"/planets/webgl/jupiter.jpg", fallbackImage:"/planets/jupiter.jpg", radius:.62, axialTilt:.05, spin:.2, roughness:.82, atmosphere:.26, category:"world" },
  { name:"SATURN", jp:"土星", prefix:"仕組みを", description:"複雑な条件を整理し、アイデアが継続して届く構造へ変える。", color:"#e8d394", glow:"#d49b55", texture:"/planets/webgl/saturn.jpg", fallbackImage:"/planets/saturn.jpg", radius:.53, axialTilt:.47, spin:.18, roughness:.78, atmosphere:.24, ring:{ inner:1.28, outer:2.04, opacity:.52 }, category:"system" },
  { name:"URANUS", jp:"天王星", prefix:"文化を", description:"参加と制作が循環し、関わる人が育てていける場をつくる。", color:"#8ce7e8", glow:"#4eb8ca", texture:"/planets/webgl/uranus.jpg", fallbackImage:"/planets/uranus.webp", radius:.39, axialTilt:1.71, spin:-.08, roughness:.68, atmosphere:.38, ring:{ inner:1.34, outer:1.76, opacity:.2 }, category:"community" },
  { name:"NEPTUNE", jp:"海王星", prefix:"未来を", description:"まだ名前のない可能性を試作し、次の現実へつながる入口をつくる。", color:"#6a79ff", glow:"#3447e2", texture:"/planets/webgl/neptune.jpg", fallbackImage:"/planets/neptune.webp", radius:.38, axialTilt:.49, spin:.1, roughness:.7, atmosphere:.42, category:"play" },
] as const;
