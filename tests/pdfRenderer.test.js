const { renderPdfFromHtml } = require('../src/pdfRenderer');

describe('PDF Renderer Module (src/pdfRenderer.js)', () => {
  test('renders simple HTML to PDF buffer', async () => {
    const html = '<h1>Hello</h1>';
    const buffer = await renderPdfFromHtml(html);
    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.length).toBeGreaterThan(0);
  });

  test('renders HTML with multiple elements', async () => {
    const html = '<h1>Title</h1><p>Paragraph</p><ul><li>Item</li></ul>';
    const buffer = await renderPdfFromHtml(html);
    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.length).toBeGreaterThan(0);
  });
});
