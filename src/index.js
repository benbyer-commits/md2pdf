import path from 'path';
import fs from 'fs/promises';
import { parseMarkdownFile } from './parser.js';
import { renderHtmlToPdf } from './pdfRenderer.js';

export function getDefaultOutputPath(inputPath) {
  const dir = path.dirname(inputPath);
  const ext = path.extname(inputPath);
  const baseName = path.basename(inputPath, ext);
  return path.join(dir, `${baseName}.pdf`);
}

export async function convertMarkdownToPdf(inputPath, outputPath) {
  const targetOutputPath = outputPath || getDefaultOutputPath(inputPath);

  let html;
  try {
    html = await parseMarkdownFile(inputPath);
  } catch (err) {
    const error = new Error(`Input file not found or unreadable: ${err.message}`);
    error.code = 'ENOENT_OR_READ_ERROR';
    throw error;
  }

  let pdfBuffer;
  try {
    pdfBuffer = await renderHtmlToPdf(html);
  } catch (err) {
    const error = new Error(`PDF rendering engine failure: ${err.message}`);
    error.code = 'PDF_RENDER_ERROR';
    throw error;
  }

  try {
    await fs.writeFile(targetOutputPath, pdfBuffer);
  } catch (err) {
    const error = new Error(`Failed to write output PDF: ${err.message}`);
    error.code = 'WRITE_ERROR';
    throw error;
  }

  return targetOutputPath;
}
