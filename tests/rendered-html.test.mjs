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
  assert.match(html, /MERCURY/);
  assert.match(html, /NEPTUNE/);
  assert.match(html, /\/planets\/earth\.jpg/);
  assert.match(html, /\/planets\/saturn\.jpg/);
  assert.match(html, /OBSERVATION IMAGERY \/ NASA・JPL・GSFC/);
  assert.match(html, /FRONT \/ ALIGN/);
  assert.match(html, /目的・導線・感情の変化/);
  assert.equal((html.match(/class="solar-planet/g) ?? []).length, 8);
  assert.equal((html.match(/is-behind-sun/g) ?? []).length, 4);
  assert.equal((html.match(/is-in-front/g) ?? []).length, 4);
  assert.equal((html.match(/is-outgoing/g) ?? []).length, 2);
  assert.match(html, /class="career-spacecraft/);
  assert.match(html, /MS-01 \/ ON COURSE/);
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

test("keeps editable content separate from the UI", async () => {
  const [data, experience, styles, page, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/portfolio-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/PortfolioExperience.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(data, /export const categories/);
  assert.match(data, /export const projects/);
  assert.match(data, /export const careerEvents/);
  assert.match(experience, /PortfolioExperience/);
  assert.match(experience, /prefers-reduced-motion/);
  assert.match(experience, /centerX: 0, centerY: 50, radiusX: 86, radiusY: 40/);
  assert.match(experience, /angle: 52\.8, scale: 4\.8/);
  assert.match(experience, /angle: -30, scale: 0\.2/);
  assert.match(experience, /angle: -288, scale: 7\.2, opacity: 0/);
  assert.match(experience, /fixed-making-statement/);
  assert.match(experience, /makerRef/);
  assert.match(experience, /useLayoutEffect/);
  assert.match(experience, /maker\.style\.setProperty\("--maker-transform"/);
  assert.doesNotMatch(experience, /dockedScroll/);
  assert.doesNotMatch(experience, /classList\.toggle\("is-hidden"/);
  assert.match(experience, /maker\.style\.position = "absolute"/);
  assert.match(experience, /maker\.dataset\.makerState = "docked"/);
  assert.match(experience, /titleSlotRect\.bottom - mainRect\.top - maker\.offsetHeight/);
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
  assert.match(experience, /career-spacecraft/);
  assert.match(styles, /career-spacecraft\.png/);
  assert.match(styles, /fixed-making-statement\{position:fixed;z-index:2300/);
  assert.match(styles, /left:calc\(var\(--page-gutter\) \+ 22px\);width:clamp\(70px,20vw,86px\)/);
  assert.match(experience, /headingHasArrived.*0\.22/);
  assert.match(experience, /futureHasArrived.*0\.92/);
  assert.match(experience, /careerCharacterVisible/);
  assert.doesNotMatch(experience, /ProjectVisual|selectedProject|careerCharacterY/);
  assert.doesNotMatch(experience, /--career-position/);
  assert.match(page, /robots:/);
  assert.match(layout, /lang="ja"/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
});
