#!/usr/bin/env node

import { Command } from 'commander';
import fs from 'node:fs';
import path from 'node:path';
import { convertMarkdownToPdf } from '../src/index.js';

const program = new Command();

program
  .name('md2pdf')
  .description('Convert Markdown files to PDF')
  .version('1.0.0', '-v, --version', 'Display current CLI version')
  .helpOption('-h, --help', 'Display usage instructions and available options')
  .argument('<input-file>', 'Path to target Markdown file')
  .option('-o, --output <path>', 'Destination path for the generated PDF')
  .action(async (inputFile, options) => {
    try {
      const resolvedInput = path.resolve(process.cwd(), inputFile);
      if (!fs.existsSync(resolvedInput)) {
        console.error(`Error: File not found: ${inputFile}`);
        process.exit(1);
      }

      await convertMarkdownToPdf(inputFile, options.output);
      process.exit(0);
    } catch (err) {
      if (err.code === 'ENOENT' || err.code === 'READ_ERROR') {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      } else if (err.code === 'PDF_ERROR') {
        console.error(`Error: ${err.message}`);
        process.exit(3);
      } else {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    }
  });

program.exitOverride((err) => {
  if (
    err.code === 'commander.missingArgument' ||
    err.code === 'commander.unknownOption' ||
    err.code === 'commander.optionMissingArgument'
  ) {
    process.exit(2);
  }
  throw err;
});

try {
  program.parse(process.argv);
} catch (err) {
  if (err.exitCode !== undefined) {
    process.exit(err.exitCode);
  } else {
    process.exit(2);
  }
}
