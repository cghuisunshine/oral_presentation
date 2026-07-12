# Mobile Portrait Presentation Controls Design

## Problem

In portrait mobile presentation mode, the cue content and wrapped control row can exceed the visible viewport. The navigation, fullscreen, and stop-recording controls may therefore appear below the screen.

## Approved design

At viewport widths up to 520px:

- Size the fixed presentation view with the dynamic viewport height (`100dvh`) and safe-area-aware padding.
- Keep the three-row presentation layout: status, cue content, controls.
- Allow the middle cue row to shrink and scroll instead of pushing the controls outside the viewport.
- Render the four presentation controls as a two-column, two-row grid with full labels and at least 44px touch height.
- Keep the control area at the bottom of the grid and inside the safe area.
- Preserve the existing desktop and landscape presentation layout.

## Accessibility and behavior

- DOM order and keyboard behavior remain unchanged.
- Button labels remain visible; no icon-only controls are introduced.
- Long cue text remains readable through vertical scrolling.
- Reduced-motion behavior and recording logic are unaffected.

## Verification

- Add a source-level regression test for the portrait viewport, shrinkable cue row, and two-column controls.
- Run the complete Node test suite, JavaScript syntax check, and HTML validation.
- Render presentation mode at a portrait mobile viewport and confirm every control is visible without page scrolling.
