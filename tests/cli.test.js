import path from 'path';
import { deriveOutputPath } from '../src/index.js';

describe('deriveOutputPath', () => {
  it('should default output file extension to .pdf in same directory if output flag is omitted', () => {
    const input = 'docs/sample.md';
    const result = deriveOutputPath(input);
    expect(result).toBe(path.resolve('docs/sample.pdf'));
  });

  it('should use explicit output flag if supplied', () => {
    const input = 'docs/sample.md';
    const outputOption = 'dist/custom.pdf';
    const result = deriveOutputPath(input, outputOption);
    expect(result).toBe(path.resolve('dist/custom.pdf'));
  });
});
