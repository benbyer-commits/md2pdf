const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

describe('CLI Integration Tests', () => {
  let tmpDir;

  beforeEach(async () => {
    tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'md2pdf-cli-test-'));
  });

  afterEach(async () => {
    await fs.promises.rm(tmpDir, { recursive: true, force: true });
  });

  test('executes CLI and generates output PDF for valid markdown file', () => {
    const mdFile = path.join(tmpDir, 'doc.md');
    const expectedPdfFile = path.join(tmpDir, 'doc.pdf');
    fs.writeFileSync(mdFile, '# Title\n\nCLI Test Body.');

    const command = `node ./bin/index.js "${mdFile}"`;
    const stdout = execSync(command).toString();

    expect(fs.existsSync(expectedPdfFile)).toBe(true);
    const pdfBuffer = fs.readFileSync(expectedPdfFile);
    expect(pdfBuffer.slice(0, 5).toString('ascii')).toBe('%PDF-');
  });

  test('executes CLI with -o / --output option', () => {
    const mdFile = path.join(tmpDir, 'doc.md');
    const customPdfFile = path.join(tmpDir, 'custom_output.pdf');
    fs.writeFileSync(mdFile, '# Custom Output Title');

    const command = `node ./bin/index.js "${mdFile}" -o "${customPdfFile}"`;
    execSync(command);

    expect(fs.existsSync(customPdfFile)).toBe(true);
  });

  test('exits with code 1 when input file is not found', () => {
    const nonExistentFile = path.join(tmpDir, 'non-existent.md');
    try {
      execSync(`node ./bin/index.js "${nonExistentFile}"`, { stdio: 'pipe' });
      fail('Expected CLI to exit with code 1');
    } catch (err) {
      expect(err.status).toBe(1);
    }
  });
});
