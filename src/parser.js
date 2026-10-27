import { marked } from 'marked';

/**
 * Converts Markdown string into standard HTML string with GFM enabled.
 * @param {string} markdownContent 
 * @returns {Promise<string>} Compiled HTML content
 */
export async function parseMarkdownToHtml(markdownContent) {
  marked.setOptions({
    gfm: true,
    breaks: true
  });
  return await marked.parse(markdownContent);
}
