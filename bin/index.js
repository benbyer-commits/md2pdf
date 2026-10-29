#!/usr/bin/env node

const { Command } = require('commander');
const pkg = require('../package.json');
const { convertMarkdownToPdf } = require('../src/index');

const program = new Command();

program
  .name('md2pdf')
  .description('Convert a Markdown file to an unstyled PDF')
  .version(pkg.version, '-v, --version', 'output the current version')
  .argument('<input-file>', 'Path to the Markdown file')
  .option('-o, --output <path>', 'Destination path for the generated PDF')
  .action(async (inputFile, options) => {
    const outputPath = options.output;
    try {
      await convertMarkdownToPdf(inputFile, outputPath);
      process.exit(0);
    } catch (err) {
      // Use custom error codes if set, otherwise default to 1
      const exitCode = typeof err.code === 'number' ? err.code : 1;
      process.exit(exitCode);
    }
  });

program.parse(process.argv);
