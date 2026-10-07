'use strict';
// Renders public/img/og.png (1200x630) and public/img/logo.png (512x512).
// Requires Playwright: `npm i -D playwright` (or point NODE_PATH at an install).
const path = require('node:path');
const { chromium } = require('playwright');

const FONT = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..900&display=swap">';
const BASE = `*{margin:0;box-sizing:border-box}body{font-family:Archivo,system-ui,sans-serif;background:#0a0a0a;color:#f4efe4;-webkit-font-smoothing:antialiased}`;

const og = `<!doctype html><html><head>${FONT}<style>${BASE}
.c{width:1200px;height:630px;position:relative;overflow:hidden;padding:64px 72px;display:flex;flex-direction:column;justify-content:space-between;
background:radial-gradient(70% 90% at 100% 0%,rgba(212,168,75,.35),transparent 60%),radial-gradient(60% 80% at 0% 100%,rgba(255,75,43,.22),transparent 60%),#0a0a0a}
.logo{font-weight:900;font-stretch:125%;letter-spacing:.06em;font-size:34px}.logo b{background:#d4a84b;color:#0a0a0a;padding:0 10px;border-radius:6px;margin-right:8px}
h1{font-weight:900;font-stretch:125%;text-transform:uppercase;font-size:92px;line-height:.92;letter-spacing:-.03em;max-width:980px}h1 em{font-style:normal;color:#d4a84b}
.f{display:flex;justify-content:space-between;align-items:center;font-size:22px;color:#c9c1b3;letter-spacing:.14em;text-transform:uppercase;font-weight:700}
.dot{display:inline-block;width:14px;height:14px;border-radius:50%;background:#ff4b2b;margin-right:12px}</style></head>
<body><div class="c"><div class="logo"><b>T</b>NATION</div><h1>Taking South India's talent <em>to the world</em></h1>
<div class="f"><span><span class="dot"></span>Artists · Athletes · Creators</span><span>Bengaluru · Kerala · Karnataka</span></div></div></body></html>`;

const logo = `<!doctype html><html><head>${FONT}<style>${BASE}
.c{width:512px;height:512px;display:grid;place-items:center;background:#0a0a0a}
.t{width:360px;height:360px;border-radius:56px;background:linear-gradient(135deg,#f0cf7e,#d4a84b 55%,#9c7526);display:grid;place-items:center;position:relative}
.t span{font-weight:900;font-stretch:125%;font-size:300px;line-height:1;color:#0a0a0a;margin-top:-10px}
.t i{position:absolute;right:-18px;bottom:-18px;width:64px;height:64px;border-radius:50%;background:#ff4b2b;border:10px solid #0a0a0a}</style></head>
<body><div class="c"><div class="t"><span>T</span><i></i></div></div></body></html>`;

(async () => {
  const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined;
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH, proxy, args: ['--ignore-certificate-errors'] });
  const out = path.join(__dirname, '..', 'public', 'img');
  for (const [name, content, w, h] of [['og.png', og, 1200, 630], ['logo.png', logo, 512, 512]]) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    await page.setContent(content, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(out, name) });
    console.log('wrote', name);
  }
  await browser.close();
})();
