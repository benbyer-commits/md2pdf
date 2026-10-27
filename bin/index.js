#!/usr/bin/env node

import { Command, CommanderError } from 'commander';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { convertMarkdownToPdf, CLIError } from '../src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let version = '1.0.0';
try {
  const pkgPath = join(__dirname, '..', 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
  version = pkg.version || '1.0.0';
} catch (e) {
  // Fallback to default version if package.json cannot be read
}

const program = new Command();

program
  .name('md2pdf')
  .description('A lightweight CLI utility to compile Markdown files to PDF documents.')
  .version(version, '-v, --version', 'Display current CLI version')
  .argument('<input-file>', 'Path to target Markdown file')
  .option('-o, --output <path>', 'Destination path for the generated PDF')
  .exitOverride();

async function run() {
  try {
    program.parse(process.argv);

    const [inputFile] = program.args;
    const options = program.opts();

    const outputPath = await convertMarkdownToPdf(inputFile, options);
    console.log(`Successfully generated PDF: ${outputPath}`);
    process.exit(0);
  } catch (err) {
    if (err instanceof CommanderError) {
      if (err.exitCode === 0) {
        // Successful help or version exit
        process.exit(0);
      }
      // Invalid CLI Arguments error (Code 2)
      process.exit(2);
    } else if (err instanceof CLIError) {
      console.error(`Error: ${err.message}`);
      process.exit(err.exitCode);
    } else {
      console.error(`Unexpected Error: ${err.message || err}`);
      process.exit(3);
    }
  }
}

run();
