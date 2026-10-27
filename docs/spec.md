# Architectural Specification: Markdown-to-PDF CLI (Phase 1)

## 1. Overview & Goal
The objective of Phase 1 is to build a lightweight, reliable Command-Line Interface (CLI) utility written in Node.js. The tool accepts a local Markdown file (`.md`), compiles its content into standard HTML, and renders a clean, unstyled PDF document (`.pdf`).

---

## 2. Technical Stack
* **Runtime:** Node.js (v24 LTS)
* **CLI Parser:** `commander`
* **Markdown Engine:** `marked` (with basic GitHub-Flavored Markdown support)
* **PDF Renderer:** `puppeteer` (headless Chrome)
* **Test Runner:** `jest` or standard Node test runner

---

## 3. CLI Interface Contract

### Command Syntax
```bash
md2pdf <input-file> [options]

Arguments & Flags

<input-file> (Required): Path to the target Markdown file.

-o, --output <path> (Optional): Destination path for the generated PDF. Defaults to replacing .md with .pdf in the same directory (e.g., doc.md → doc.pdf).
-v, --version: Display current CLI version.
-h, --help: Display usage instructions and available options.

------

## 4. Architectural Design & File Structure

md2pdf/
├── bin/
│   └── index.js          # CLI entry point (shebang & command handling)
├── src/
│   ├── index.js          # Main library orchestrator
│   ├── parser.js         # Reads .md, compiles HTML with marked
│   └── pdfRenderer.js    # Launches Puppeteer, renders HTML to PDF buffer
├── tests/
│   ├── cli.test.js       # Integration tests for command execution
│   └── parser.test.js    # Unit tests for markdown parsing
├── package.json
└── README.md

---

## 5. Execution Pipeline

[ CLI Command ]
       │
       ▼
1. Validate Arguments (Check file existence & extension)
       │
       ▼
2. Read Input File (utf-8 filesystem read)
       │
       ▼
3. Convert Markdown to HTML (src/parser.js)
       │
       ▼
4. Render PDF via Puppeteer (src/pdfRenderer.js)
       │
       ▼
5. Write PDF to Disk (src/index.js)
       │
       ▼
[ Exit 0 (Success) ]


---

## 6. Error Handling & Exit Codes

Code 0: Success.

Code 1: Input file not found or unreadable.

Code 2: Invalid CLI arguments.

Code 3: PDF rendering engine failure.