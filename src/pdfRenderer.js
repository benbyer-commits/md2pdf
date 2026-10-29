const puppeteer = require('puppeteer');

/**
 * Renders HTML content to a PDF buffer using Puppeteer.
 *
 * @param {string} html - The HTML string to render.
 * @returns {Promise<Buffer>} - PDF data as a Buffer.
 * @throws {Error} - If Puppeteer fails to render the PDF.
 */
async function renderPdfFromHtml(html) {
  const browser = await puppeteer.launch();
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4' });
    return pdfBuffer;
  } finally {
    await browser.close();
  }
}

module.exports = { renderPdfFromHtml };
