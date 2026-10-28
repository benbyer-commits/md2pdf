import { marked } from 'marked';

/**
 * Compiles a Markdown string into HTML using marked.
 *
 * @param {string} markdownString - Markdown text input.
 * @returns {Promise<string>} Compiled HTML output string.
 */
export async function compileMarkdownToHtml(markdownString) {
  if (typeof markdownString !== 'string') {
    throw new TypeError('Expected markdownString to be a string');
  }

  return marked.parse(markdownString, {
    gfm: true,
    breaks: true
  });
}
