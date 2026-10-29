import fs from 'fs';
import { marked } from 'marked';

/**
 * Parses a Markdown string into HTML.
 *
 * @param {string} markdownString - The raw markdown content.
 * @returns {string} - HTML representation.
 * @throws {TypeError} - If the input is not a string.
 */
export function parseMarkdown(markdownString) {
  if (typeof markdownString !== 'string') {
    throw new TypeError('Input must be a string');
  }

  if (!markdownString) {
    return '';
  }

  // Normalize literal \n escapes to real newline characters
  const normalizedInput = markdownString.replace(/\\n/g, '\n');

  return marked.parse(normalizedInput);
}

/**
 * Reads a Markdown file and parses its content into HTML.
 *
 * @param {string} filePath - Path to the markdown file.
 * @returns {string} - HTML representation.
 * @throws {TypeError} - If the filePath is not a string.
 */
export function parseMarkdownFile(filePath) {
  if (typeof filePath !== 'string') {
    throw new TypeError('File path must be a string');
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  return parseMarkdown(fileContent);
}
