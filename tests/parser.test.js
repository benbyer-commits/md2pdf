import { compileMarkdownToHtml } from '../src/parser.js';

describe('parser.js - compileMarkdownToHtml', () => {
  test('converts basic markdown to HTML', async () => {
    const md = '# Hello World\n\nThis is **bold** text.';
    const html = await compileMarkdownToHtml(md);
    expect(html).toContain('<h1>Hello World</h1>');
    expect(html).toContain('<strong>bold</strong>');
  });

  test('throws TypeError if input is not a string', async () => {
    await expect(compileMarkdownToHtml(123)).rejects.toThrow(TypeError);
  });
});
