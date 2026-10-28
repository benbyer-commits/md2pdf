import puppeteer from 'puppeteer';

/**
 * Renders HTML string to a PDF buffer using Puppeteer.
 * @param {string} html - HTML string to render.
 * @param {object} [options] - PDF rendering options.
 * @returns {Promise<Buffer>} - Generated PDF Buffer.
 */
export async function renderHtmlToPdf(html, options = {}) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: options.format || 'A4',
      margin: options.margin || {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      },
      printBackground: true,
      ...options
    });

    return Buffer.from(pdfBuffer);
  } catch (error) {
    const renderError = new Error(`PDF Rendering Engine Error: ${error.message}`);
    renderError.code = 'PDF_RENDER_FAILED';
    throw renderError;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
