# Product Roadmap: Markdown-to-PDF Converter

## Vision
A light, template-driven Markdown-to-PDF conversion system evolving from a local CLI utility into a full-stack browser application.

---

## Phases & Status

- [ ] **Phase 1: Core CLI Tool** *(Current)*
- [ ] **Phase 2: Multi-Template System**
- [ ] **Phase 3: Browser Front-End**

---

## Phase Details

### Phase 1: Core CLI Tool
**Goal:** Build a functional command-line script that parses local `.md` files into unstyled/basic PDFs.
* **Input:** `md2pdf input.md -o output.pdf`
* **Core Requirements:**
  * File I/O for reading source files and writing output.
  * Markdown-to-HTML parsing engine (handling headers, lists, code blocks).
  * HTML-to-PDF rendering pipeline (e.g., Puppeteer / WeasyPrint).
* **Acceptance Criteria:** Valid PDF output generated; non-zero exit code on missing input file.

### Phase 2: Multi-Template System
**Goal:** Introduce a `--template` CLI flag supporting three distinct CSS design layouts.
* **Templates:**
  1. `modern`: Sans-serif, syntax highlighting, callout boxes.
  2. `academic`: Serif, running headers/footers, strict margins.
  3. `ebook`: Wide margins, readable line height, custom title page.
* **Acceptance Criteria:** Passing `--template academic` applies the corresponding stylesheet to the PDF output.

### Phase 3: Browser-Based Front-End
**Goal:** Wrap the engine into a web UI with live preview and template selection.
* **Core Requirements:**
  * Split-pane UI (Editor on left, live PDF preview on right).
  * Real-time template selection dropdown.
  * One-click browser PDF export.
* **Acceptance Criteria:** User can edit text in browser and download formatted PDF without using the terminal.