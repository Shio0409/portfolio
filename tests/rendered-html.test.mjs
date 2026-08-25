import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the portfolio experience", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>塩澤 正高 \/ Masataka Shiozawa — つくる。 \| Project Manager \/ Director<\/title>/i);
  assert.match(html, /name="robots" content="noindex, nofollow"/i);
  assert.match(html, />つくる。</);
  assert.doesNotMatch(html, /8つの軌道|8つの「つくる。」|DRAG \/ SWIPE TO ROTATE/);
  assert.match(html, /SNAP \/ PROXIMITY/);
  assert.match(html, /水星を選択/);
  assert.match(html, /海王星を選択/);
  assert.match(html, /\/planets\/earth\.jpg/);
  assert.match(html, /\/planets\/jupiter\.jpg/);
  assert.match(html, /PLANETARY TEXTURE MAPS \/ NASA・JPL・CALTECH/);
  assert.match(html, /SYSTEM \/ SYNC/);
  assert.match(html, /SOLAR CORE \/ 00/);
  assert.match(html, /TARGET \/ (?:<!-- -->)?03/);
  assert.match(html, /目的と感情を、記憶に残る導線へ/);
  assert.match(html, /VIEW DETAILS/);
  assert.match(html, /事業の目的とユーザーの実感/);
  assert.match(html, /DESIGN LENS/);
  assert.match(html, /class="solar-webgl/);
  assert.doesNotMatch(html, /class="solar-planet|is-behind-sun|is-in-front|is-outgoing/);
  assert.match(html, /class="career-spacecraft/);
  assert.doesNotMatch(html, /MS-01 \/ ON COURSE/);
  assert.match(html, /VISUAL ARCHIVE/);
  assert.match(html, /EARTH(?:<!-- -->)? \/ IMAGE SLOT/);
  assert.doesNotMatch(html, /category-tabs|project-grid|project-dialog|career-next/);
  assert.match(html, /og-masataka-shiozawa\.png/);
  assert.match(html, /MASATAKA SHIOZAWA/);
  assert.match(html, /solt\.0409@gmail\.com/);
  assert.match(html, /youtube\.com\/@sio_manyan/);
  assert.match(html, /x\.com\/taque_0409/);
  assert.match(html, /sio-shop\.booth\.pm/);
  assert.match(html, /discord\.com\/channels\/@me/);
  assert.match(html, /usr_8707d220-1408-4a8c-b25c-6a3b14a4c710/);
  assert.match(html, />Sio0409</);
  assert.match(html, /群馬県立前橋高等学校/);
  assert.match(html, /神奈川大学 人間科学部/);
  assert.match(html, /プレミアムティーチャー賞/);
  assert.match(html, /利用児童 15 → 約120名/);
  assert.match(html, /補助金 年4,000万円規模/);
  assert.match(html, /compass 設立/);
  assert.match(html, /継続黒字/);
  assert.match(html, /id="creation"/);
  assert.match(html, /id="career"/);
  assert.match(html, /id="future"/);
  assert.ok(html.indexOf('id="top"') < html.indexOf('id="creation"'));
  assert.ok(html.indexOf('id="creation"') < html.indexOf('id="career"'));
  assert.ok(html.indexOf('id="career"') < html.indexOf('id="future"'));
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("keeps content and rendering systems modular", async () => {
  const [data, experience, styles, solarStyles, solarRenderer, solarData, mediaData, mediaFrame, page, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/portfolio-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/PortfolioExperience.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/solar-system.css", import.meta.url), "utf8"),
    readFile(new URL("../app/SolarSystemWebGL.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/solar-system-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/portfolio-media.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/MediaFrame.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(data, /export const careerEvents/);
  assert.match(data, /export type PortfolioMedia/);
  assert.match(experience, /PortfolioExperience/);
  assert.match(experience, /prefers-reduced-motion/);
  assert.match(experience, /<SolarSystemWebGL activeIndex=\{activeSolar\} dragOffset=\{dragOffset\}/);
  assert.doesNotMatch(experience, /orbitGeometry|interpolateOrbitPass|className="solar-planet/);
  assert.match(solarRenderer, /await import\("three"\)/);
  assert.match(solarRenderer, /new THREE\.SphereGeometry/);
  assert.match(solarRenderer, /new THREE\.PointLight/);
  assert.match(solarRenderer, /const solarCenter = \{ x:-6\.6, y:\.05, z:-1\.1 \}/);
  assert.match(solarRenderer, /solarCenter\.x \+ Math\.cos\(theta\) \* orbitProfile\.radiusX \* scale/);
  assert.match(solarRenderer, /targetWorldPosition = orbitPoint\(targetAngle\)/);
  assert.match(solarRenderer, /targetProjection\.copy\(targetWorldPosition\)\.project\(camera\)/);
  assert.match(solarRenderer, /style\.setProperty\("--target-x"/);
  assert.doesNotMatch(solarRenderer, /point\.clone\(\)\.multiplyScalar\(scale\)/);
  assert.match(solarRenderer, /makeHologramMaterial/);
  assert.match(solarRenderer, /sunGridMaterial/);
  assert.match(solarRenderer, /colorWrite:false/);
  assert.match(solarRenderer, /atmosphereSphere/);
  assert.match(solarRenderer, /color:0xffffff/);
  assert.match(solarRenderer, /vRadius \* 91\.0/);
  assert.match(solarRenderer, /node\.globe\.rotation\.y/);
  assert.match(solarRenderer, /IntersectionObserver/);
  assert.match(solarRenderer, /webglcontextlost/);
  assert.match(solarRenderer, /prefers-reduced-motion/);
  assert.match(solarRenderer, /texture\.dispose\(\)/);
  assert.match(solarRenderer, /renderer\?\.dispose\(\)/);
  assert.equal((solarData.match(/\/planets\/webgl\//g) ?? []).length, 8);
  assert.equal((solarData.match(/roughness:/g) ?? []).length, 9);
  assert.equal((solarData.match(/atmosphere:/g) ?? []).length, 9);
  assert.match(solarData, /spin:-/);
  assert.match(solarData, /ring:/);
  assert.equal((solarData.match(/focus:/g) ?? []).length, 9);
  assert.match(solarStyles, /solar-webgl-fallback/);
  assert.match(solarStyles, /webgl-target-reticle/);
  assert.match(solarStyles, /webgl-core-label/);
  assert.match(solarStyles, /fallback-sun-scan/);
  assert.match(experience, /fixed-making-statement/);
  assert.match(experience, /makerRef/);
  assert.match(experience, /useLayoutEffect/);
  assert.match(experience, /maker\.style\.setProperty\("--maker-transform"/);
  assert.doesNotMatch(experience, /dockedScroll/);
  assert.doesNotMatch(experience, /classList\.toggle\("is-hidden"/);
  assert.doesNotMatch(experience, /maker\.style\.position = "absolute"/);
  assert.match(experience, /maker\.dataset\.makerState = "docked"/);
  assert.match(experience, /titleSlotRect\.bottom - makerBaseBottom/);
  assert.match(experience, /fitScale/);
  assert.match(experience, /requestAnimationFrame\(step\)/);
  assert.match(experience, /Math\.cos\(Math\.PI \* t\)/);
  assert.match(experience, /window\.innerHeight \* \.6/);
  assert.match(experience, /classList\.add\("creation-snapping"\)/);
  assert.match(experience, /setTimeout\(alignCreation, 220\)/);
  assert.match(experience, /transmissionTitleRef/);
  assert.match(experience, /titleSlotRect\.right - makerBaseRight/);
  assert.match(styles, /html\.creation-snapping \{ scroll-behavior: auto; \}/);
  assert.match(experience, /FRAME LOCKED/);
  assert.match(experience, /transmission-title-slot/);
  assert.match(experience, /creationDetailsOpen/);
  assert.match(experience, /transmission-summary/);
  assert.match(experience, /transmission-expanded/);
  assert.match(styles, /@media \(hover:hover\) and \(pointer:fine\)/);
  assert.match(styles, /width:clamp\(650px,55vw,780px\)/);
  assert.match(styles, /width:100vw;height:100svh/);
  assert.match(styles, /html\.creation-detail-open/);
  assert.match(experience, /career-spacecraft/);
  assert.match(styles, /career-spacecraft\.png/);
  assert.match(styles, /fixed-making-statement\{position:fixed;z-index:2300/);
  assert.match(styles, /left:calc\(var\(--page-gutter\) \+ 22px\);width:clamp\(70px,20vw,86px\)/);
  assert.match(experience, /headingHasArrived.*0\.22/);
  assert.match(experience, /futureHasArrived.*0\.92/);
  assert.match(experience, /careerCharacterVisible/);
  assert.match(experience, /spacecraftCenter - trackTop/);
  assert.doesNotMatch(experience, /ProjectVisual|selectedProject|careerCharacterY/);
  assert.doesNotMatch(experience, /--career-position/);
  assert.match(mediaData, /export const heroShots/);
  assert.match(mediaData, /creation:/);
  assert.equal((mediaData.match(/(?:MERCURY|VENUS|EARTH|MARS|JUPITER|SATURN|URANUS|NEPTUNE): null/g) ?? []).length, 8);
  assert.match(mediaData, /currentVector: null/);
  assert.match(mediaData, /longTermVision: null/);
  assert.match(mediaData, /"education-lab": null/);
  assert.match(mediaFrame, /<video/);
  assert.match(mediaFrame, /kind="captions"/);
  assert.match(mediaFrame, /<img/);
  assert.match(page, /robots:/);
  assert.match(layout, /lang="ja"/);
  assert.match(packageJson, /"three"/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
});
