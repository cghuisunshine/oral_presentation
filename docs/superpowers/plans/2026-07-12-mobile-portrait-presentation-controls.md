# Mobile Portrait Presentation Controls Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep all presentation controls visible and usable in a portrait mobile viewport, even when cue text is long.

**Architecture:** Keep the existing single-file application and add portrait-only CSS for dynamic viewport sizing, a shrinkable scroll region, and a two-column control grid. Repair the renamed test target, then verify both source structure and real browser element bounds with a standalone fixture.

**Tech Stack:** HTML5, CSS Grid, vanilla JavaScript, Node.js test runner, headless Google Chrome

---

### Task 1: Repair the test entry point

**Files:**
- Modify: `tests/oral-presenter-core.test.mjs:6`

- [ ] **Step 1: Point the harness at the current app**

Change `../oral-presenter.html` to `../index.html` in `loadCore()` and in any source-reading tests.

- [ ] **Step 2: Run the baseline suite**

Run: `node --test tests/oral-presenter-core.test.mjs`

Expected: 36 tests pass, proving the rename is the only baseline failure.

- [ ] **Step 3: Commit**

```bash
git add tests/oral-presenter-core.test.mjs
git commit -m "test: follow renamed presenter entry point"
```

### Task 2: Add portrait layout regression coverage

**Files:**
- Modify: `tests/oral-presenter-core.test.mjs`
- Create: `tests/mobile-presentation-layout.html`
- Create: `tests/mobile-presentation-layout.test.mjs`

- [ ] **Step 1: Add a failing source-level test**

Read `index.html` and assert that it contains:

- a `max-width: 520px` plus `orientation: portrait` media query;
- `height: 100dvh` on `.present-view`;
- a shrinkable/scrollable `.cue-display` row;
- a two-column `.present-controls` grid;
- `env(safe-area-inset-top)`, `env(safe-area-inset-right)`, `env(safe-area-inset-bottom)`, and `env(safe-area-inset-left)` in portrait presentation padding;
- a named, focusable cue region in markup;
- a keyboard guard that preserves native scrolling keys when that region has focus.

- [ ] **Step 2: Add a rendered-layout fixture and runner**

The fixture loads `../index.html` in an iframe styled with `position: fixed; inset: 0; width: 100vw; height: 100vh; border: 0`. Run Chrome with `--allow-file-access-from-files` so the fixture can access the same local-file iframe DOM consistently. After load it reveals presentation mode, inserts a deliberately overflowing cue, applies `padding-bottom: 40px` to simulate a safe area, and writes JSON containing viewport, document scroll, computed presentation padding, grid-column count, and all four button bounds and heights into `#result`.

The Node runner launches an available Chrome binary at `390x844` with `--headless=new`, `--dump-dom`, and a virtual-time budget. Parse `#result` and assert:

```js
assert.equal(result.documentScrolls, false);
assert.equal(result.controlColumns, 2);
assert.equal(result.buttons.length, 4);
assert.ok(result.buttons.every(({ left, top, right, bottom }) =>
  left >= 0 && top >= 0 && right <= result.viewport.width && bottom <= result.viewport.height
));
assert.ok(result.buttons.every(({ height }) => height >= 44));
```

- [ ] **Step 3: Run both new tests and verify RED**

Name both new tests with the phrase `mobile portrait presentation`. Run: `node --test --test-name-pattern="mobile portrait presentation" tests/oral-presenter-core.test.mjs tests/mobile-presentation-layout.test.mjs`

Expected: FAIL because the current mobile presentation CSS wraps flex controls and lacks the focusable cue region.

- [ ] **Step 4: Commit the failing tests**

```bash
git add tests/oral-presenter-core.test.mjs tests/mobile-presentation-layout.html tests/mobile-presentation-layout.test.mjs
git commit -m "test: reproduce hidden portrait presentation controls"
```

### Task 3: Implement the portrait presentation layout

**Files:**
- Modify: `index.html:160-193`
- Modify: `index.html:282`
- Modify: `index.html:1510-1518`

- [ ] **Step 1: Add semantic cue-region attributes**

Change the cue element to a named focusable region:

```html
<p class="cue-display" id="cue-display" tabindex="0" role="region" aria-label="Current cue words"></p>
```

- [ ] **Step 2: Preserve native scrolling keys**

At the start of `handlePresentationKeys`, return without preventing the event when `event.target === elements.cueDisplay` and the key is Space, Page Up, Page Down, Arrow Up, or Arrow Down. Keep Arrow Left and Arrow Right cue navigation unchanged.

- [ ] **Step 3: Add minimal portrait-only CSS**

Inside `@media (max-width: 520px) and (orientation: portrait)`:

```css
.present-view {
  height: 100dvh;
  min-height: 0;
  padding: max(12px, env(safe-area-inset-top)) max(12px, env(safe-area-inset-right)) max(12px, env(safe-area-inset-bottom)) max(12px, env(safe-area-inset-left));
  overflow: hidden;
}
.cue-display {
  min-height: 0;
  max-height: 100%;
  align-self: stretch;
  overflow-y: auto;
  padding: 16px 8px;
  font-size: clamp(1.75rem, 10vw, 3.5rem);
}
.present-controls {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}
.present-controls button { min-height: 44px; }
```

- [ ] **Step 4: Run focused tests and verify GREEN**

Run: `node --test --test-name-pattern="mobile portrait presentation" tests/oral-presenter-core.test.mjs tests/mobile-presentation-layout.test.mjs`

Expected: focused source and rendered-layout tests pass.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "fix: keep portrait presentation controls visible"
```

### Task 4: Complete verification

**Files:**
- Verify: `index.html`
- Verify: `tests/oral-presenter-core.test.mjs`
- Verify: `tests/mobile-presentation-layout.test.mjs`

- [ ] **Step 1: Run the complete test suite**

Run: `node --test tests/*.test.mjs`

Expected: all tests pass with zero failures.

- [ ] **Step 2: Check embedded JavaScript syntax**

Run: `sed -n '/<script id="app-script">/,/<\/script>/p' index.html | sed '1d;$d' | node --check`

Expected: exit code 0 and no output.

- [ ] **Step 3: Validate HTML**

Run: `tidy -errors -quiet index.html`

Expected: exit code 0 and no output.

- [ ] **Step 4: Render a portrait screenshot**

Run:

```bash
'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' \
  --headless=new --disable-gpu --no-sandbox --allow-file-access-from-files \
  --window-size=390,844 \
  --screenshot=/tmp/oral-presenter-mobile-portrait.png \
  file://$PWD/tests/mobile-presentation-layout.html
```

Inspect `/tmp/oral-presenter-mobile-portrait.png` and confirm the status row, long cue, and all four controls are visible without document-level scrolling. The screenshot remains in `/tmp`, outside the worktree, and requires no repository cleanup. If verification reveals a needed adjustment, return to Task 2 or 3 as appropriate and rerun every Task 4 check afterward.
