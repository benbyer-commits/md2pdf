import fs from 'fs';
import path from 'path';
import { parseMarkdownFile } from './parser.js';
import { renderPdfFromHtml } from './pdfRenderer.js';

/**
 * Converts a Markdown file to a PDF file.
 *
 * @param {string} inputPath - Path to the source .md file.
 * @param {string} [outputPath] - Desired output .pdf path. If omitted, replaces .md with .pdf.
 * @returns {Promise<string>} - Resolves with the path to the generated PDF.
 *
 * Exit codes (used by the CLI):
 *   1 – Input file not found or unreadable.
 *   3 – PDF rendering failure.
 */
export async function convertMarkdownToPdf(inputPath, outputPath) {
  // Validate input file existence
  if (!fs.existsSync(inputPath) || !fs.statSync(inputPath).isFile()) {
    const err = new Error('Input file not found');
    err.code = 1;
    throw err;
  }

  // Convert markdown to HTML
  const html = parseMarkdownFile(inputPath);

  // Render HTML to PDF
  let pdfBuffer;
  try {
    pdfBuffer = await renderPdfFromHtml(html);
  } catch (e) {
    const err = new Error('PDF rendering failed');
    err.code = 3;
    throw err;
  }

  // Determine final output path
  const finalOutputPath = outputPath
    ? outputPath
    : inputPath.replace(/\.md$/i, '.pdf');

  // Ensure directory exists
  const dir = path.dirname(finalOutputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Write PDF buffer to disk
  fs.writeFileSync(finalOutputPath, pdfBuffer);

  return finalOutputPath;
}
