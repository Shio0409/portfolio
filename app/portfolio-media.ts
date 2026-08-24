import type { PortfolioMedia } from "./portfolio-data";

export const heroShots = [
  { id:"01", title:"VIRTUAL WORLD", accent:"#5ee9ff", media:{ kind:"image", src:"/planets/earth.jpg", alt:"宇宙に浮かぶ地球" } },
  { id:"02", title:"SHARED EXPERIENCE", accent:"#e4b48c", media:{ kind:"image", src:"/planets/jupiter.jpg", alt:"暗い宇宙に浮かぶ木星" } },
  { id:"03", title:"NEW REALITY", accent:"#6a79ff", media:{ kind:"image", src:"/planets/neptune.webp", alt:"青く輝く海王星" } },
] satisfies ReadonlyArray<{ id:string; title:string; accent:string; media:PortfolioMedia }>;

// Add an image or video here later. Creation keeps a designed placeholder visible
// so every planet already has a clear, replacement-safe visual slot.
export const portfolioMedia: {
  creation: Record<string, PortfolioMedia | null>;
  career: Record<string, PortfolioMedia | null>;
  future: Record<string, PortfolioMedia | null>;
} = {
  creation: {
    MERCURY: null,
    VENUS: null,
    EARTH: null,
    MARS: null,
    JUPITER: null,
    SATURN: null,
    URANUS: null,
    NEPTUNE: null,
  },
  career: {
    "maebashi-high": null,
    "kanagawa-university": null,
    "meiko-gijuku": null,
    "education-lab": null,
    compass: null,
  },
  future: {
    currentVector: null,
    longTermVision: null,
  },
};
