import { renderHtmlToPdf } from '../src/pdfRenderer.js';

describe('pdfRenderer.js', () => {
  test('throws TypeError if htmlString is not a string', async () => {
    await expect(renderHtmlToPdf(12345)).rejects.toThrow(TypeError);
  });
});
