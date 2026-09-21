# Fox / Rabbit reference checkpoint

User-supplied screenshots dated 2026-09-17 supersede older Miro formatting for these web templates. Only the central exercise is the reference; do not copy navigation, banners or personal details. No browser use authorized for this step.

- Fox: `kind: gaps`, `layout: sentences`, `inputMode: select`. Numbered sentences, compact numbered inline buttons; clicking opens a small local options menu. Choice, clear, Escape, outside click and keyboard arrows supported in code. Existing four demo questions retained, rendered in the new format.
- Rabbit with bank: `kind: gaps`, `layout: paragraph`, `inputMode: text`. Plain comma-separated word bank, continuous text with inline typed fields. The bank is a reference list, not a dropdown. Synthetic demo text supplied separately from renderer.
- Both use shared `--ek-reading-width: 560px`, centered within the available content area with left-aligned text. Width is estimated from screenshots. Inspect's 1912.27px is the outer scroll container, not the exercise column. No fixed height; small viewports use available width.
- Item count and paragraph count are data-driven. Blank input width does not reveal the correct answer; grows with entered text, capped at 28ch.
- Other exercise types, existing Workspace background/sidebar, lesson content and backend unchanged. Generic choice/radio remains available for other exercise types.
- Validation: syntax and Node tests; 4/5/8 sentence fixtures and paragraph/typed-bank validation. Visual and browser interaction checks intentionally deferred at user's request. This is a code implementation, not a pixel-exact visual verification.

Next: user checks samples 04 and 05, supplies sizing corrections if needed; adjust shared tokens. Preserve latest 16-template catalog and pilot lesson work. Integrate approved templates into lesson import/Workspace in a later step.
