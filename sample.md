# Sample Markdown file - title

## 1. First heading
Normal text here - and some code: (`.md`)

---

## 2. Second heading
* **Bullets in bold:** with normal text
* **Bullets in bold:** with some code: `commander`
* **Bullets in bold:** with normal text


---

## 3. Third heading

### sub-heading
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