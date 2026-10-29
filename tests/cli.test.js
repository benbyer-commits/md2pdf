const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

function createTempFile(content, ext = '.md') {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'md2pdf-cli-test-'));
  const filePath = path.join(tmpDir, `doc${ext}`);
  fs.writeFileSync(filePath, content);
  return { tmpDir, filePath };
}

describe('CLI Integration Tests', () => {
  test('executes CLI and generates output PDF for valid markdown file', () => {
    const { tmpDir, filePath } = createTempFile('# Hello World');
    const cmd = `node ./bin/index.js "${filePath}"`;
    execSync(cmd, { stdio: 'ignore' });

    const pdfPath = filePath.replace(/\.md$/i, '.pdf');
    expect(fs.existsSync(pdfPath)).toBe(true);
  });

  test('executes CLI with -o / --output option', () => {
    const { tmpDir, filePath } = createTempFile('**Bold** text');
    const outPdf = path.join(tmpDir, 'custom_output.pdf');
    const cmd = `node ./bin/index.js "${filePath}" -o "${outPdf}"`;
    execSync(cmd, { stdio: 'ignore' });

    expect(fs.existsSync(outPdf)).toBe(true);
  });

  test('exits with code 1 when input file is not found', () => {
    const cmd = `node ./bin/index.js "nonexistent.md"`;
    try {
      execSync(cmd, { stdio: 'ignore' });
    } catch (e) {
      expect(e.status).toBe(1);
    }
  });

  test('displays version with --version flag', () => {
    const output = execSync(`node ./bin/index.js --version`).toString().trim();
    const pkg = require('../package.json');
    expect(output).toBe(pkg.version);
  });

  test('displays help with --help flag', () => {
    const output = execSync(`node ./bin/index.js --help`).toString();
    expect(output).toMatch(/Usage:/i);
  });
});
