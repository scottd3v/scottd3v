import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      width: 1200px;
      height: 630px;
      background: #0a0a09;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      position: relative;
      overflow: hidden;
    }

    /* Gradient orbs for atmosphere */
    .orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.3;
    }
    .orb-1 {
      width: 400px;
      height: 400px;
      background: #e07a5f;
      top: -100px;
      right: -100px;
    }
    .orb-2 {
      width: 350px;
      height: 350px;
      background: #1b7b6f;
      bottom: -100px;
      left: -100px;
    }

    .container {
      text-align: center;
      z-index: 10;
    }

    .logo {
      width: 280px;
      height: 215px;
      margin-bottom: 30px;
    }

    .title {
      font-size: 48px;
      font-weight: 700;
      color: #f5f3e7;
      margin-bottom: 12px;
      letter-spacing: -1px;
    }

    .subtitle {
      font-size: 24px;
      color: rgba(245, 243, 231, 0.6);
    }
  </style>
</head>
<body>
  <div class="orb orb-1"></div>
  <div class="orb orb-2"></div>

  <div class="container">
    <img src="data:image/svg+xml;base64,${readFileSync(join(__dirname, 'public/softwareseus.svg')).toString('base64')}" class="logo" alt="Software Seuss" />
    <div class="title">Software Seuss</div>
    <div class="subtitle">scottd3v.com</div>
  </div>
</body>
</html>
`;

async function generateOG() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.setViewport({ width: 1200, height: 630 });
  await page.setContent(html, { waitUntil: 'networkidle0' });

  const screenshot = await page.screenshot({
    type: 'png',
    path: join(__dirname, 'public/og-scottd3v.png')
  });

  await browser.close();
  console.log('OG image generated at public/og-scottd3v.png');
}

generateOG();
