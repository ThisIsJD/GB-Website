import { createServer } from 'vite';
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const server = await createServer({ server: { port: 5174, strictPort: true } });
let browser;
try {
  await server.listen();
  browser = await chromium.launch();
  const page = await browser.newPage();
  await page.addInitScript(() => {
    let ticks = 0;
    const original = globalThis.requestAnimationFrame.bind(globalThis);
    globalThis.requestAnimationFrame = (callback) =>
      original((time) => {
        ticks++;
        callback(time);
      });
    Object.defineProperty(globalThis, 'wrapperTicks', { get: () => ticks });
  });
  await page.goto('http://127.0.0.1:5174/tests/fixtures/wrapper-probe.html');
  await page.locator('.stf__item').first().waitFor();
  await page.waitForTimeout(250);
  await page.getByRole('button', { name: 'Remove notebook' }).click();
  await page.waitForTimeout(250);
  const before = await page.evaluate(() => globalThis.wrapperTicks);
  await page.waitForTimeout(250);
  const after = await page.evaluate(() => globalThis.wrapperTicks);
  const evidence = {
    package: 'react-pageflip@2.0.3 + page-flip@2.0.7',
    remainingEngineElements: await page.locator('.stf__parent').count(),
    animationCallbacksAfterRemoval: after - before,
    requiresLifetimeContainment: after > before,
  };
  await mkdir('.cache/evidence', { recursive: true });
  await writeFile(
    '.cache/evidence/p2.2-upstream-lifetime.json',
    JSON.stringify(evidence, null, 2) + '\n',
  );
  console.log(JSON.stringify(evidence));
} finally {
  await browser?.close();
  await server.close();
}
