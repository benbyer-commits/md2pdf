const fs = require('fs');
const path = require('path');
const { parseMarkdownFile } = require('./parser');
const { renderPdfFromHtml } = require('./pdfRenderer');

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
async function convertMarkdownToPdf(inputPath, outputPath) {
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

  // Determine output path
  const finalOutputPath = outputPath
    ? outputPath
    : inputPath.replace(/\.md$/i, '.pdf');

  // Write PDF buffer to disk
  fs.writeFileSync(finalOutputPath, pdfBuffer);

  return finalOutputPath;
}

module.exports = { convertMarkdownToPdf };
