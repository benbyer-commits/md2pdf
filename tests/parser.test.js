import { parseMarkdown, parseMarkdownFile } from '../src/parser.js';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

describe('Parser Module (src/parser.js)', () => {
  test('parseMarkdown converts markdown string to HTML', async () => {
    const md = '# Hello World\n\nThis is **bold** text.';
    const html = await parseMarkdown(md);
    expect(html).toContain('<h1>Hello World</h1>');
    expect(html).toContain('<strong>bold</strong>');
  });

  test('parseMarkdownFile reads markdown file and converts to HTML', async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'md2pdf-test-'));
    const filePath = path.join(tmpDir, 'test.md');
    await fs.writeFile(filePath, '# Test File Header');

    const html = await parseMarkdownFile(filePath);
    expect(html).toContain('<h1>Test File Header</h1>');

    await fs.rm(tmpDir, { recursive: true, force: true });
  });
});
