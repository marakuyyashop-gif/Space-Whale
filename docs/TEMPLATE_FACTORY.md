# Space Whale — shared template catalog

Current implementation: 2026-09-23. This document supersedes the older interaction notes in EXERCISE_TEMPLATES.md and EXERCISE_COVERAGE_V2.md.

## One source of truth

- `exercise-theme.css`: typography, shared colors and template-specific shape tokens. Edit here to update every exercise using the shared kit.
- `exercise-kit.css`: layouts for each reusable kind/layout; no lesson-specific selectors.
- `exercise-kit.js`: validation, rendering, Check/Reset and the same answers/onChange contract used by Workspace realtime.
- `template-gallery.js`: synthetic preview definitions only. No renderer copies and no course content.
- `classroom.html?view=templates`: existing Workspace hosts the previews. Old `template-gallery.html` redirects here.

Privacy is explicitly deferred after discussion with the owner. This preview is PUBLIC, not owner-only. It contains neutral placeholders and technical test tones only. Do not add confidential drafts, private content or admin tools here. Server-authorized Factory storage is a separate future task.

## Catalog: 31 presets

| Family | Presets |
|---|---|
| Matching | Text halves; Word–Definition; Picture–Word |
| Gaps | Typed; Typed + Word Bank; Inline Dropdown; Error Correction |
| Choice | Text single; Image single; Text multiple; Image multiple |
| Sort | Groups / speaker attribution |
| Order | Sentence/chunks; Pictures/events |
| Image | Labels dragged onto one image |
| Open | Writing; Speaking; Speaking + Useful Language; Possible Answers |
| Audio | Player; Player + transcript; Listen & Repeat |
| Reference | Rule; Guided Discovery |
| Composite | Reading + Choice; Reading + Gap; Listening + Choice; Listening + Gap; Listening + Sort; Listening + Order |
| Stage | Progressive sequence of three exercises |

Audio fixtures use a locally generated, three-second test tone. They test real playback, not pronunciation. Replace audio URLs with actual recordings when authoring a lesson.

## Authoring contract

1. Select an existing kind/layout. Store only text, IDs, answer keys and asset URLs in lesson data.
2. Do not insert HTML, inline styles or copies of renderer logic into lesson data.
3. Keep IDs stable after publication; saved attempts and realtime use them. A visual change does not require changing IDs or rewriting lessons.
4. Call `SpaceWhaleExerciseKit.validate(definition)` before publishing.
5. Register a real lesson through `window.SpaceWhaleContent` with its existing catalog lesson ID, level and whale. A stage's `exercise` can be a single definition or a shared `kind: 'stage'` definition.
6. Sources may hold a copy of this authoring guide. The working template implementation remains in the website repository.

Common definition: `{ version: 1, id, kind, title, instruction? }`.

| Kind | Content fields | Answers state |
|---|---|---|
| matching | `items[{id,text,image?,alt?,correctId}]`, `options[{id,text}]`, optional layout | `{ itemId: optionId }` |
| gaps | `items[{id,segments:[text,{id,answers,options?},text]}]`, optional `bank`, `inputMode` | `{ gapId: typedText }` |
| choice | `items[{id,prompt,options,correctId}]`; multiple uses `multiple:true` and `correctIds` | single string or array of option IDs per item |
| sort | `items[{id,text,correctId}]`, `groups[{id,text}]` | `{ itemId: groupId }` |
| order | `tokens[{id,text,image?,alt?}]`, `correctOrder` | `{ order: [tokenIds] }` |
| image-label | `image`, `alt`, `items[{id,x,y,prompt,correctId}]`, `options` | `{ targetId: optionId }` |
| writing | `items[{id,prompt}]` | `{ itemId: freeText }` |
| presentation | `blocks` with text, image or disclosure | no automatic grade |
| audio | `audio`, optional `transcript`; listen-repeat uses `items[{id,text,audio,example?,exampleAudio?}]` | no automatic grade |
| rule-page | ordered text, image, rule or nested exercise blocks | child answers under block ID |
| stage | `exercises[{id,exercise}]`, `progressive:true/false` | child answers under block ID, plus `revealed` count |

Typed gaps default to keyboard input. A bank is only a hint and may contain a base form different from the accepted answer. For a dropdown set `inputMode:'select'` and explicit options. Correct keys in the bank do not determine displayed option order.

Multiple Select uses checkboxes and exact set comparison; order of selected options does not matter. An omitted key requires teacher review.

Useful Language disclosures open initially. Possible Answers and audio transcripts start closed. Open tasks never receive automatic correct/incorrect grades.

## Interaction/state guarantees

- All answer changes emit `onChange` with the same serializable answers state, including drag/drop and reorder.
- Matching is single-use: picking an occupied option moves it, preserving card order.
- Sort, order and labels use native drag/drop with click/keyboard alternatives. Native touch dragging is browser-dependent; click assignment works on touch devices.
- Order: click to append/return, drag before another item or to the end, Alt+Left/Right to reorder.
- Image labels stay where placed, even when wrong. Only Check evaluates them.
- Feedback appears only after Check; editing clears stale feedback and corrections. Reset clears answers and feedback.
- Each nested exercise has its own Check/Reset. A stage additionally has Reset for the whole stack. Progressive reveal belongs to the stage, not to individual templates.
- `setAnswers` hydrates remote state without emitting another onChange. Read-only mounts block changes.
- Global and per-item players stop other playing audio when starting.

## Changes to appearance

Examples: change `--sw-exercise-font` globally; adjust the desktop/compact/mobile type scales together for a global size change; set `--sw-matching-ratio: 1 / 1` for square text cards; adjust `--sw-picture-word-ratio` for picture cards. More substantial layout changes belong in exercise-kit.css and apply wherever that layout is used.

After a shared change, run `npm ci` once, then `npm test`, then check the changed interactions in the preview and one existing lesson. Update stylesheet/script cache versions when publishing. Structural schema changes require separate compatibility work; visual changes do not.
