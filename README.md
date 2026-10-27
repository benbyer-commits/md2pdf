# md2pdf

A lightweight Command-Line Interface (CLI) tool written in Node.js to compile Markdown files (`.md`) into PDF documents (`.pdf`).

## Usage

```bash
# Convert sample.md to sample.pdf in the same directory
node bin/index.js sample.md

# Specify custom output path
node bin/index.js sample.md -o /path/to/output.pdf

# Show version
node bin/index.js -v

# Show help options
node bin/index.js -h
```

## Exit Codes
* **0**: Success
* **1**: Input file not found or unreadable / output write failure
* **2**: Invalid CLI arguments
* **3**: PDF rendering engine failure
