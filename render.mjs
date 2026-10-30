// Frame-exact film recorder for the Lab pieces, run on GitHub Actions.
// Each piece exposes window.__demo; this seeks it frame by frame and pipes PNG
// screenshots into ffmpeg. Frames are identical to the local tools
// (solar: tools/export-film.mjs, gupta: scripts/render-film.mjs; telecaster has none), so chunks
// rendered on separate machines join with `ffmpeg -f concat -c copy`.
//
//   FILM=solar MODE=count node render.mjs                -> prints the frame count
//   FILM=solar START=0 COUNT=400 OUT=x.mp4 node render.mjs -> renders frames [START, START+COUNT)
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';

const FILM = process.env.FILM;
const FPS = Number(process.env.FPS ?? 30);
const URL_ = process.env.URL ?? 'http://127.0.0.1:8000/';
const FILMS = {
  // WebGL2 in software (SwiftShader), as locally.
  solar: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'], query: '?film=1&paused=1' },
  // CSS 3D, no GPU, as locally.
  gupta: { args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars'], query: '?qa=1' },
  // WebGL in software, at the high tier (shadows, depth of field) it would drop to on its own; its highlights cut.
  // Seeked like gupta: __demo.total and __demo.seekTime(t). Its own source: telecaster-story/src/film.js.
  telecaster: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'], query: '?qa=1&film=highlights&tier=high' },
  // The Instagram Reel's background (flipbook, films/telecaster-launch): the same build in its phone layout,
  // 1080x1920, at the times its frame list gives ({t} on the highlights film), or the bridge chapter with its
  // slider set ({bridge}: the highlights film has no bridge shot). The list: films/telecaster/reel-frames.json.
  'telecaster-reel': { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'], query: '?qa=1&film=highlights&tier=high',
    viewport: { width: 540, height: 960 }, scale: 2, list: 'films/telecaster/reel-frames.json',
    bridge: '?qa=1&ch=6&ct=3&act=0.5&tier=high' },
};
const cfg = FILMS[FILM];
if (!cfg) throw new Error(`FILM must be one of ${Object.keys(FILMS).join(', ')}`);

const browser = await chromium.launch({ args: cfg.args });
const page = await browser.newPage({ viewport: cfg.viewport ?? { width: 1920, height: 1080 }, deviceScaleFactor: cfg.scale ?? 1 });
page.on('pageerror', (e) => console.error('[pageerror]', e.message));
await page.goto(URL_ + cfg.query, { waitUntil: 'networkidle' });
await page.waitForFunction(() => window.__demo?.ready === true, null, { timeout: 300000 });

// The frame list, built exactly as each piece's own recorder builds it.
let frames;
if (cfg.list) {
  frames = JSON.parse(readFileSync(cfg.list, 'utf8'));
} else if (FILM === 'solar') {
  const scenes = await page.evaluate(() => window.__demo.scenes);
  frames = [];
  for (const s of scenes) {
    const n = Math.max(1, Math.round(s.duration * FPS));
    for (let i = 0; i < n; i++) frames.push([s.id, i / n]);
  }
} else {
  const total = await page.evaluate(() => window.__demo.total);
  const n = Math.round(total * FPS);
  frames = Array.from({ length: n + 1 }, (_, i) => i / FPS);
}

if (process.env.MODE === 'count') {
  console.log(frames.length);
  await browser.close();
  process.exit(0);
}

const START = Number(process.env.START ?? 0);
const COUNT = Number(process.env.COUNT ?? frames.length);
const mine = frames.slice(START, START + COUNT);
const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'slow', '-movflags', '+faststart', process.env.OUT],
  { stdio: ['pipe', 'inherit', 'inherit'] });
const done = new Promise((res, rej) => ff.on('close', (c) => (c === 0 ? res() : rej(new Error(`ffmpeg exited ${c}`)))));
const shot = () => page.screenshot({ type: 'png', timeout: 120000 });
const t0 = Date.now();
const raf2 = () => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
let onBridge = false;   // (a frame list: the page is on the highlights film, or on the bridge chapter)
for (let k = 0; k < mine.length; k++) {
  const f = mine[k];
  if (cfg.list) {
    if ((f.bridge != null) !== onBridge) {
      onBridge = f.bridge != null;
      await page.goto(URL_ + (onBridge ? cfg.bridge : cfg.query), { waitUntil: 'load', timeout: 300000 });   // (the ready checks below wait for the rest)
      if (onBridge) await page.waitForFunction(() => window.__telecaster && !window.__telecaster.busy(), null, { timeout: 300000 });
      else await page.waitForFunction(() => window.__demo?.ready === true, null, { timeout: 300000 });
    }
    if (onBridge) await page.evaluate((v) => window.__telecaster.setAct(v), f.bridge);
    else await page.evaluate((t) => window.__demo.seekTime(t), f.t);
    await raf2();
  } else if (FILM === 'solar') await page.evaluate(([id, t]) => window.__demo.seek(id, t), f);
  else {
    await page.evaluate((t) => window.__demo.seekTime(t), f);
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  }
  const buf = await shot().catch(() => shot());
  if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
  if ((k + 1) % 50 === 0) console.log(`${k + 1}/${mine.length}  ${((Date.now() - t0) / (k + 1) / 1000).toFixed(2)} s/frame`);
}
ff.stdin.end();
await done;
await browser.close();
console.log(`frames ${START}..${START + mine.length - 1} -> ${process.env.OUT} in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
