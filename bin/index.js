#!/usr/bin/env node
import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { convertMarkdownToPdf } from '../src/index.js';

// Resolve __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to read package.json without JSON import assertions
function getPackageVersion() {
  const pkgPath = path.resolve(__dirname, '..', 'package.json');
  const raw = fs.readFileSync(pkgPath, 'utf-8');
  const pkg = JSON.parse(raw);
  return pkg.version || '0.0.0';
}

const program = new Command();

program
  .name('md2pdf')
  .description('Convert a Markdown file to a PDF document')
  .version(getPackageVersion(), '-v, --version', 'output the current version')
  .argument('<input-file>', 'Path to the Markdown file')
  .option('-o, --output <path>', 'Destination path for the generated PDF')
  .action(async (inputFile, options) => {
    try {
      const inputPath = path.resolve(process.cwd(), inputFile);

      // Validate input file existence and extension
      if (!fs.existsSync(inputPath) || !fs.statSync(inputPath).isFile()) {
        console.error('Error: Input file not found or unreadable.');
        process.exit(1);
      }
      if (path.extname(inputPath).toLowerCase() !== '.md') {
        console.error('Error: Input file must have a .md extension.');
        process.exit(2);
      }

      // Determine output path
      const outputPath = options.output
        ? path.resolve(process.cwd(), options.output)
        : inputPath.replace(/\.md$/i, '.pdf');

      // Perform conversion using the library orchestrator
      await convertMarkdownToPdf(inputPath, outputPath);
      console.log(`PDF generated at: ${outputPath}`);
      process.exit(0);
    } catch (err) {
      // Map known error codes to exit codes
      if (err.code === 1) {
        console.error('Error: Input file not found or unreadable.');
        process.exit(1);
      } else if (err.code === 2) {
        console.error('Error: Invalid CLI arguments.');
        process.exit(2);
      } else if (err.code === 3) {
        console.error('Error: PDF rendering engine failure.');
        process.exit(3);
      } else {
        console.error('Unexpected error:', err.message);
        process.exit(1);
      }
    }
  });

await program.parseAsync(process.argv);
