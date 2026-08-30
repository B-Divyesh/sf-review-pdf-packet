import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

const releaseSha = process.env.BUILD_SHA ?? process.env.GITHUB_SHA ?? execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
if (!/^[0-9a-f]{12,40}$/i.test(releaseSha)) throw new Error('BUILD_SHA must be a Git commit SHA.');
const buildId = releaseSha.slice(0, 12);

function injectBuildId(contents: string): string {
  return contents.replaceAll('__BUILD_SHA__', buildId);
}

export default defineConfig({
  plugins: [{
    name: 'review-packet-build-id',
    transformIndexHtml: injectBuildId,
    closeBundle() {
      for (const relativePath of ['privacy/index.html', 'terms/index.html', '404.html', 'sw.js']) {
        const filePath = resolve('dist', relativePath);
        const contents = readFileSync(filePath, 'utf8');
        if (!contents.includes('__BUILD_SHA__')) throw new Error(`Missing build placeholder in ${relativePath}`);
        writeFileSync(filePath, injectBuildId(contents));
      }
    },
  }],
  build: {
    target: 'es2022',
    sourcemap: true,
  },
});
