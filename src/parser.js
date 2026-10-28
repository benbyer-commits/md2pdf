import { marked } from 'marked';
import fs from 'fs/promises';

export async function parseMarkdown(content) {
  if (typeof content !== 'string') {
    throw new TypeError('Markdown content must be a string');
  }
  return await marked.parse(content, { gfm: true });
}

export async function parseMarkdownFile(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  return await parseMarkdown(content);
}
