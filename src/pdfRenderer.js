import puppeteer from 'puppeteer';

/**
 * Renders HTML content string into a PDF Buffer using Puppeteer headless browser.
 * @param {string} htmlContent 
 * @returns {Promise<Buffer>}
 */
export async function renderHtmlToPdf(htmlContent) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      },
      printBackground: true
    });
    return pdfBuffer;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
