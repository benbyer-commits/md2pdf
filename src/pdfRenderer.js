const puppeteer = require('puppeteer');

/**
 * Renders an HTML string into an A4 PDF buffer using headless Puppeteer.
 *
 * @param {string} htmlString - The HTML content to render.
 * @returns {Promise<Buffer>} Resolves to a Buffer containing valid PDF binary data.
 */
async function renderHtmlToPdf(htmlString) {
  let browser = null;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(htmlString, { waitUntil: 'networkidle0' });

    const pdfData = await page.pdf({
      format: 'A4',
      margin: {
        top: '1in',
        right: '1in',
        bottom: '1in',
        left: '1in'
      }
    });

    return Buffer.from(pdfData);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

module.exports = {
  renderHtmlToPdf
};
