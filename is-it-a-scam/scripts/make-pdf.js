#!/usr/bin/env node
/**
 * Regenerate assets/sa-top-20-scams.pdf from the built deck.
 *
 * Playwright is deliberately NOT a project dependency: the site itself needs
 * nothing but Node, and this is a once-in-a-while authoring task. Install it
 * when you need it:
 *
 *   npm run build
 *   npx --yes http-server public -p 8099 -s &
 *   npx --yes playwright@1.56.1 install chromium
 *   node scripts/make-pdf.js
 *
 * Or just open /deck/ in a browser and use Print → Save as PDF, which produces
 * the same thing: the deck's print stylesheet lays every slide out one per
 * A4 landscape page.
 */
'use strict';

const path = require('path');

const URL = process.env.DECK_URL || 'http://127.0.0.1:8099/deck/';
const OUT = path.join(__dirname, '..', 'assets', 'sa-top-20-scams.pdf');

(async () => {
  let chromium;
  try {
    ({ chromium } = require('playwright'));
  } catch (err) {
    console.error('Playwright is not installed. See the comment at the top of this file.');
    process.exit(1);
  }

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.emulateMedia({ media: 'print' });
  await page.pdf({
    path: OUT,
    format: 'A4',
    landscape: true,
    printBackground: true,
    margin: { top: '12mm', bottom: '12mm', left: '12mm', right: '12mm' },
  });
  await browser.close();
  console.log('Wrote', OUT);
})();
