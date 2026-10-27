import fs from 'fs/promises';
import path from 'path';
import { parseMarkdownToHtml } from './parser.js';
import { renderHtmlToPdf } from './pdfRenderer.js';

export class CLIError extends Error {
  /**
   * Custom CLI Error with specified exit code.
   * @param {string} message 
   * @param {number} exitCode 
   */
  constructor(message, exitCode = 1) {
    super(message);
    this.name = 'CLIError';
    this.exitCode = exitCode;
  }
}

/**
 * Derives the output PDF file path based on input path and output flag options.
 * @param {string} inputFile 
 * @param {string} [outputOption] 
 * @returns {string} Resolved output path
 */
export function deriveOutputPath(inputFile, outputOption) {
  if (outputOption) {
    return path.resolve(outputOption);
  }
  const parsedPath = path.parse(inputFile);
  const newName = parsedPath.name + '.pdf';
  return path.resolve(parsedPath.dir, newName);
}

/**
 * Main orchestrator: reads target Markdown file, parses to HTML, renders to PDF, and writes to output path.
 * @param {string} inputFile 
 * @param {Object} options 
 * @param {string} [options.output] 
 * @returns {Promise<string>} Final output file path
 */
export async function convertMarkdownToPdf(inputFile, options = {}) {
  const resolvedInputPath = path.resolve(inputFile);

  // 1. Validate target file existence & readability (Exit Code 1)
  try {
    await fs.access(resolvedInputPath, fs.constants.R_OK);
  } catch (err) {
    throw new CLIError(`Input file not found or unreadable: "${inputFile}"`, 1);
  }

  // 2. Read target Markdown file (utf-8)
  let markdownContent;
  try {
    markdownContent = await fs.readFile(resolvedInputPath, 'utf-8');
  } catch (err) {
    throw new CLIError(`Failed to read input file "${inputFile}": ${err.message}`, 1);
  }

  // 3. Compile Markdown to HTML
  let htmlContent;
  try {
    htmlContent = await parseMarkdownToHtml(markdownContent);
  } catch (err) {
    throw new CLIError(`Failed to parse Markdown content: ${err.message}`, 3);
  }

  // 4. Render HTML to PDF via Puppeteer
  let pdfBuffer;
  try {
    pdfBuffer = await renderHtmlToPdf(htmlContent);
  } catch (err) {
    throw new CLIError(`PDF rendering engine failure: ${err.message}`, 3);
  }

  // 5. Write PDF Buffer to output file path
  const outputPath = deriveOutputPath(inputFile, options.output);
  try {
    await fs.writeFile(outputPath, pdfBuffer);
  } catch (err) {
    throw new CLIError(`Failed to write PDF file to "${outputPath}": ${err.message}`, 1);
  }

  return outputPath;
}
