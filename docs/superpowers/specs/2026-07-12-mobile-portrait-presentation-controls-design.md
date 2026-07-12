# Mobile Portrait Presentation Controls Design

## Problem

In portrait mobile presentation mode, the cue content and wrapped control row can exceed the visible viewport. The navigation, fullscreen, and stop-recording controls may therefore appear below the screen.

## Approved design

At viewport widths up to 520px in portrait orientation:

- Size the fixed presentation view with the dynamic viewport height (`100dvh`) and safe-area-aware padding.
- Keep the three-row presentation layout: status, cue content, controls.
- Allow the middle cue row to shrink and scroll instead of pushing the controls outside the viewport.
- Render the four presentation controls as a two-column, two-row grid with full labels and at least 44px touch height.
- Keep the control area at the bottom of the grid and inside the safe area.
- Preserve the existing desktop and landscape presentation layout by scoping these rules with both `max-width: 520px` and `orientation: portrait`.

## Accessibility and behavior

- Keep DOM order unchanged.
- Button labels remain visible; no icon-only controls are introduced.
- Make the cue text a named, focusable scroll region. When that region has focus, Space, Page Up, Page Down, Arrow Up, and Arrow Down retain native scrolling behavior. Arrow Left and Arrow Right continue changing cue pages.
- Reduced-motion behavior and recording logic are unaffected.

## Verification

- First update the Node test harness to read the current application entry point, `index.html`, rather than the removed `oral-presenter.html` filename.
- Add a source-level regression test for the portrait-only media query, dynamic viewport sizing, shrinkable cue row, two-column controls, and focusable named cue region.
- Run the complete Node test suite, JavaScript syntax check, and HTML validation.
- Add a browser fixture that loads `index.html`, reveals presentation mode, inserts an overflowing cue, and reports element bounds. Run it in headless Chrome at a portrait viewport with simulated safe-area padding. Assert that all four control bounds remain inside the visual viewport, the control grid has two columns, and document-level scrolling does not occur.
