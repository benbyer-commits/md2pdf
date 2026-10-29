/**
 * Markdown Parser Module
 *
 * This module provides functions to convert Markdown strings and Markdown
 * files into HTML strings using the `marked` library.
 */
const fs = require('fs');
const { marked } = require('marked');

function parseMarkdown(markdownString) {
  if (typeof markdownString !== 'string') {
    throw new TypeError('Input must be a string');
  }

  if (!markdownString) {
    return '';
  }

  // Normalize literal \n string escapes to real newline characters
  const normalizedInput = markdownString.replace(/\\n/g, '\n');

  return marked.parse(normalizedInput);
}

function parseMarkdownFile(filePath) {
  if (typeof filePath !== 'string') {
    throw new TypeError('File path must be a string');
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  return parseMarkdown(fileContent);
}

module.exports = {
  parseMarkdown,
  parseMarkdownFile
};
