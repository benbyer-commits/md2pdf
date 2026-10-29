const { renderHtmlToPdf } = require('../src/pdfRenderer');

describe('PDF Renderer Module (src/pdfRenderer.js)', () => {
  jest.setTimeout(30000);

  test('renderHtmlToPdf returns a non-empty Buffer containing valid PDF binary data', async () => {
    const htmlContent = '<html><body><h1>PDF Test</h1><p>Rendering test page</p></body></html>';
    const buffer = await renderHtmlToPdf(htmlContent);

    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.length).toBeGreaterThan(0);

    // Verify PDF header magic bytes (%PDF-)
    const pdfHeader = buffer.slice(0, 5).toString('ascii');
    expect(pdfHeader).toBe('%PDF-');
  });
});
