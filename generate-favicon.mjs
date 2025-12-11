import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

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
      width: 512px;
      height: 512px;
      background: #0a0a09;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .logo {
      width: 420px;
      height: 420px;
    }
  </style>
</head>
<body>
  <img src="data:image/svg+xml;base64,${readFileSync(join(__dirname, 'public/softwareseus.svg')).toString('base64')}" class="logo" alt="Software Seuss" />
</body>
</html>
`;

async function generateFavicon() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Generate 32x32 favicon - this is what shows in the tab
  const html32 = html.replace(/512px/g, '32px').replace(/420px/g, '26px');
  await page.setViewport({ width: 32, height: 32 });
  await page.setContent(html32, { waitUntil: 'load' });
  await page.screenshot({
    type: 'png',
    path: join(__dirname, 'src/app/icon.png')
  });
  console.log('Generated src/app/icon.png (32x32)');

  await browser.close();
}

generateFavicon();
