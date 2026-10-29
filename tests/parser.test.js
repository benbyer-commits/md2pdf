const { parseMarkdownFile } = require('../src/parser');
const fs = require('fs');
const path = require('path');
const os = require('os');

function writeTempMarkdown(content) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'md2pdf-parser-test-'));
  const filePath = path.join(tmpDir, 'test.md');
  fs.writeFileSync(filePath, content);
  return filePath;
}

describe('Markdown Parser', () => {
  test('converts a heading to an h1 tag', () => {
    const file = writeTempMarkdown('# Heading');
    const html = parseMarkdownFile(file);
    expect(html).toContain('<h1>Heading</h1>');
  });

  test('converts bold text to strong tags', () => {
    const file = writeTempMarkdown('**bold**');
    const html = parseMarkdownFile(file);
    expect(html).toContain('<strong>bold</strong>');
  });

  test('converts the full sample markdown', () => {
    const md = `
# Title

- Item 1
- Item 2

> Quote

\`\`\`
code block
\`\`\`
`;
    const file = writeTempMarkdown(md);
    const html = parseMarkdownFile(file);
    expect(html).toContain('<h1>Title</h1>');
    expect(html).toContain('<ul>');
    expect(html).toContain('<blockquote>');
    expect(html).toContain('<pre><code>');
  });

  test('converts inline code to code tags', () => {
    const file = writeTempMarkdown('`inline`');
    const html = parseMarkdownFile(file);
    expect(html).toContain('<code>inline</code>');
  });

  test('converts a code block to pre/code tags', () => {
    const file = writeTempMarkdown('```\nblock\n```');
    const html = parseMarkdownFile(file);
    expect(html).toContain('<pre><code>');
  });

  test('converts a link to an anchor tag', () => {
    const file = writeTempMarkdown('[link](https://example.com)');
    const html = parseMarkdownFile(file);
    expect(html).toContain('<a href="https://example.com">link</a>');
  });

  test('converts a list to ul/li tags', () => {
    const file = writeTempMarkdown('- a\\n- b');
    const html = parseMarkdownFile(file);
    expect(html).toContain('<ul>');
    expect(html).toContain('<li>a</li>');
  });

  test('converts a blockquote to blockquote tag', () => {
    const file = writeTempMarkdown('> quote');
    const html = parseMarkdownFile(file);
    expect(html).toContain('<blockquote>');
  });

  test('throws TypeError for non-string input', () => {
    expect(() => parseMarkdownFile(123)).toThrow(TypeError);
  });

  test('handles empty string input', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'md2pdf-empty-'));
    const filePath = path.join(tmpDir, 'empty.md');
    fs.writeFileSync(filePath, '');
    const html = parseMarkdownFile(filePath);
    expect(html).toBe('');
  });
});
