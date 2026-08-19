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
  assert.match(html, /<title>\[NAME\] — つくる。 \| Project Manager \/ Director<\/title>/i);
  assert.match(html, /name="robots" content="noindex, nofollow"/i);
  assert.match(html, />つくる。</);
  assert.match(html, /DRAG \/ SWIPE THE ORBIT/);
  assert.match(html, /og\.png/);
  assert.match(html, /id="creation"/);
  assert.match(html, /id="career"/);
  assert.match(html, /id="future"/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("keeps editable content separate from the UI", async () => {
  const [data, experience, page, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/portfolio-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/PortfolioExperience.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(data, /export const categories/);
  assert.match(data, /export const projects/);
  assert.match(data, /export const careerEvents/);
  assert.match(experience, /PortfolioExperience/);
  assert.match(experience, /prefers-reduced-motion/);
  assert.match(page, /robots:/);
  assert.match(layout, /lang="ja"/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
});
