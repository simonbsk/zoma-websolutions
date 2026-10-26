/*
 * Pre-renders the cloud textures into public/sky/*.webp so visitors' devices don't have to
 * generate them. The generator is seeded, so the plates are identical to runtime output.
 *
 * Re-run after changing CLOUD_LAYERS in src/components/sky/skyTextures.ts:
 *   npm run render:sky
 *
 * Uses your installed Chrome (set PLAYWRIGHT_CHANNEL=msedge to use Edge instead).
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright-core';
import { createServer } from 'vite';

const outDir = new URL('../public/sky/', import.meta.url);

const server = await createServer({ logLevel: 'error', server: { port: 5199, strictPort: false } });
await server.listen();
const base = server.resolvedUrls.local[0];

const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL ?? 'chrome', headless: true });
try {
  const page = await browser.newPage();
  await page.goto(base);
  const plates = await page.evaluate(async () => {
    const textures = await import('/src/components/sky/skyTextures.ts');
    const files = {};
    for (const spec of textures.CLOUD_LAYERS) {
      const [body, shade] = await textures.runTextureJob({ kind: 'cloud', spec }, 'image/webp');
      for (const [part, blob] of [
        ['body', body],
        ['shade', shade],
      ]) {
        const bytes = new Uint8Array(await blob.arrayBuffer());
        let binary = '';
        for (const b of bytes) binary += String.fromCharCode(b);
        files[`cloud-${spec.key}-${part}.webp`] = btoa(binary);
      }
    }
    return files;
  });

  await mkdir(outDir, { recursive: true });
  for (const [name, base64] of Object.entries(plates)) {
    const data = Buffer.from(base64, 'base64');
    await writeFile(new URL(name, outDir), data);
    console.log(`public/sky/${name}  ${(data.length / 1024).toFixed(0)} KB`);
  }
} finally {
  await browser.close();
  await server.close();
}
