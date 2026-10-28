import fs from 'node:fs/promises';
import path from 'node:path';
import { compileMarkdownToHtml } from './parser.js';
import { renderHtmlToPdf } from './pdfRenderer.js';

/**
 * Main orchestrator: reads a markdown file, compiles it to HTML, renders a PDF, and writes to disk.
 *
 * @param {string} inputPath - Relative or absolute path to target Markdown file.
 * @param {string} [outputPath] - Destination path for generated PDF.
 * @returns {Promise<string>} Resolved output file path.
 */
export async function convertMarkdownToPdf(inputPath, outputPath) {
  let absoluteInputPath;
  try {
    absoluteInputPath = path.resolve(process.cwd(), inputPath);
    await fs.access(absoluteInputPath);
  } catch (err) {
    const error = new Error(`Input file not found or unreadable: ${inputPath}`);
    error.code = 'ENOENT';
    throw error;
  }

  let finalOutputPath = outputPath;
  if (!finalOutputPath) {
    if (absoluteInputPath.toLowerCase().endsWith('.md')) {
      finalOutputPath = absoluteInputPath.slice(0, -3) + '.pdf';
    } else {
      finalOutputPath = absoluteInputPath + '.pdf';
    }
  } else {
    finalOutputPath = path.resolve(process.cwd(), finalOutputPath);
  }

  let markdownContent;
  try {
    markdownContent = await fs.readFile(absoluteInputPath, 'utf-8');
  } catch (err) {
    const error = new Error(`Failed to read input file: ${err.message}`);
    error.code = 'READ_ERROR';
    throw error;
  }

  let htmlContent;
  try {
    htmlContent = await compileMarkdownToHtml(markdownContent);
  } catch (err) {
    const error = new Error(`Failed to parse markdown: ${err.message}`);
    error.code = 'PARSE_ERROR';
    throw error;
  }

  let pdfBuffer;
  try {
    pdfBuffer = await renderHtmlToPdf(htmlContent);
  } catch (err) {
    const error = new Error(`Failed to render PDF: ${err.message}`);
    error.code = 'PDF_ERROR';
    throw error;
  }

  try {
    const outputDir = path.dirname(finalOutputPath);
    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(finalOutputPath, pdfBuffer);
  } catch (err) {
    const error = new Error(`Failed to write output PDF file: ${err.message}`);
    error.code = 'WRITE_ERROR';
    throw error;
  }

  return finalOutputPath;
}
