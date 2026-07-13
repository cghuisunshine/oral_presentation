import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const chrome = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].find((candidate) => candidate && existsSync(candidate));

test('mobile portrait presentation keeps all controls inside the viewport', (t) => {
  assert.ok(chrome, 'Google Chrome or Chromium is required for the rendered layout test');
  const fixtureUrl = new URL('./mobile-presentation-layout.html', import.meta.url).href;
  const profile = mkdtempSync(join(tmpdir(), 'oral-presenter-chrome-'));
  try {
    const run = spawnSync(chrome, [
      '--headless=new', '--disable-gpu', '--no-sandbox', '--allow-file-access-from-files',
      `--user-data-dir=${profile}`, '--window-size=390,844', '--virtual-time-budget=2000', '--dump-dom', fixtureUrl,
    ], { encoding: 'utf8', timeout: 15000 });
    if (run.status === null) {
      t.skip(`Chrome did not return a DOM snapshot in this environment${run.error ? `: ${run.error.message}` : ''}`);
      return;
    }
    assert.equal(run.status, 0, run.stderr);
    const match = run.stdout.match(/<output id="result">([^<]+)<\/output>/);
    assert.ok(match, `layout result was not emitted:\n${run.stdout.slice(-1000)}`);
    assert.notEqual(match[1], 'pending', 'layout measurement completed');
    const result = JSON.parse(match[1].replaceAll('&quot;', '"').replaceAll('&amp;', '&'));
    assert.equal(result.documentScrolls, false);
    assert.equal(result.controlColumns, 2);
    assert.equal(result.buttons.length, 4);
    assert.ok(result.buttons.every(({ left, top, right, bottom }) =>
      left >= 0 && top >= 0 && right <= result.viewport.width && bottom <= result.viewport.height
    ));
    assert.ok(result.buttons.every(({ height }) => height >= 44));
  } finally {
    rmSync(profile, { recursive: true, force: true });
  }
});
