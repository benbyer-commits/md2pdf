import puppeteer from 'puppeteer';

/**
 * Converts an HTML string into an A4 PDF document buffer using Puppeteer.
 *
 * @param {string} htmlString - The HTML content to render into PDF.
 * @returns {Promise<Buffer>} Non-empty Buffer containing the rendered PDF binary data.
 */
export async function renderHtmlToPdf(htmlString) {
  if (typeof htmlString !== 'string') {
    throw new TypeError('Expected htmlString to be a string');
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    await page.setContent(htmlString, {
      waitUntil: 'networkidle0'
    });

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
