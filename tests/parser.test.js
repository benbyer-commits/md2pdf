import { parseMarkdownToHtml } from '../src/parser.js';

describe('parseMarkdownToHtml', () => {
  it('should compile valid Markdown content into HTML string', async () => {
    const markdown = '# Sample Title\n\nThis is a **bold** statement.';
    const html = await parseMarkdownToHtml(markdown);
    expect(html).toContain('<h1>Sample Title</h1>');
    expect(html).toContain('<strong>bold</strong>');
  });
});
