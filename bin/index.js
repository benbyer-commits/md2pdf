#!/usr/bin/env node

import { Command } from 'commander';
import fs from 'fs';
import { convertMarkdownToPdf } from '../src/index.js';

const program = new Command();

program
  .name('md2pdf')
  .description('Convert Markdown files to PDF')
  .version('1.0.0', '-v, --version', 'Display current CLI version')
  .helpOption('-h, --help', 'Display usage instructions and available options')
  .argument('[input-file]', 'Path to target Markdown file')
  .option('-o, --output <path>', 'Destination path for generated PDF')
  .exitOverride();

async function main() {
  try {
    program.parse(process.argv);
  } catch (err) {
    if (err.code === 'commander.helpDisplayed' || err.code === 'commander.version') {
      process.exit(0);
    }
    console.error(`Error: ${err.message}`);
    process.exit(2);
  }

  const args = program.args;
  const options = program.opts();

  if (args.length === 0) {
    console.error('Error: <input-file> argument is required.');
    process.exit(2);
  }

  const inputFile = args[0];

  if (!fs.existsSync(inputFile)) {
    console.error(`Error: Input file "${inputFile}" not found or unreadable.`);
    process.exit(1);
  }

  try {
    fs.accessSync(inputFile, fs.constants.R_OK);
  } catch {
    console.error(`Error: Input file "${inputFile}" is unreadable.`);
    process.exit(1);
  }

  try {
    const outputPath = await convertMarkdownToPdf(inputFile, options.output);
    console.log(`Successfully generated PDF: ${outputPath}`);
    process.exit(0);
  } catch (err) {
    if (err.code === 'ENOENT_OR_READ_ERROR') {
      console.error(err.message);
      process.exit(1);
    } else if (err.code === 'PDF_RENDER_ERROR') {
      console.error(err.message);
      process.exit(3);
    } else {
      console.error(err.message);
      process.exit(1);
    }
  }
}

main();
