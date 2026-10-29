# md2pdf

A tiny command‑line utility that converts a local Markdown file (`.md`) into an unstyled PDF (`.pdf`) using **marked** for markdown → HTML conversion and **puppeteer** for HTML → PDF rendering.

## Installation

```bash
npm install
```

## Usage

```bash
node ./bin/index.js <input-file.md> [options]
```

### Options

* `-o, --output <path>` – Destination path for the generated PDF.  
  Defaults to the same directory with the `.md` extension replaced by `.pdf`.

* `-v, --version` – Show the current version.

* `-h, --help` – Show help information.

## Development

Run the test suite:

```bash
npm test
```

## License

MIT
