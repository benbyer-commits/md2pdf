import puppeteer from 'puppeteer';

/**
 * Renders an HTML string into an A4 PDF buffer using headless Puppeteer.
 *
 * @param {string} htmlString - The HTML content to render.
 * @param {object} [options={}] - Optional Puppeteer PDF rendering options.
 * @returns {Promise<Buffer>} - Non-empty Buffer containing valid PDF data.
 * @throws {TypeError} If htmlString is missing or not a string.
 */
export async function renderHtmlToPdf(htmlString, options = {}) {
  if (htmlString === undefined || htmlString === null) {
    throw new TypeError('htmlString is required');
  }

  if (typeof htmlString !== 'string') {
    throw new TypeError('htmlString must be a string');
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
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
      },
      ...options
    });

    return Buffer.isBuffer(pdfData) ? pdfData : Buffer.from(pdfData);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

export default renderHtmlToPdf;
