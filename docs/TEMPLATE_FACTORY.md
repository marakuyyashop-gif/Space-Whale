# Space Whale — shared template catalog

Catalog updated: 2026-09-26. This document supersedes the older interaction notes in EXERCISE_TEMPLATES.md and EXERCISE_COVERAGE_V2.md.

## One source of truth

- `exercise-theme.css`: typography, shared colors and template-specific shape tokens. Edit here to update every exercise using the shared kit.
- `exercise-kit.css`: layouts for each reusable kind/layout; no lesson-specific selectors.
- `exercise-kit.js`: validation, rendering, Check/Reset and the same answers/onChange contract used by Workspace realtime.
- `template-gallery.js`: synthetic preview definitions only. No renderer copies and no course content.
- `classroom.html?view=templates`: existing Workspace hosts the previews. Old `template-gallery.html` redirects here.

Privacy is explicitly deferred after discussion with the owner. This preview is PUBLIC, not owner-only. It contains neutral placeholders and technical test tones only. Do not add confidential drafts, private content or admin tools here. Server-authorized Factory storage is a separate future task.

## Catalog: three layers, 21 cards

The existing Workspace selectors expose three groups without new pages, CSS, button styles or image sizing changes.

| Layer | Cards |
|---|---|
| Materials / elements (6) | Audio; Text; Image; Rule; Useful phrases; Possible answers |
| Response mechanics (9) | Matching; Single Choice; Multiple Select; Typed Input / Gap; Dropdown; Order; Sort; Image Label; Text / Writing field |
| Composition examples (6) | Listen & Repeat; Audio + task; Text + task; Image + task; Speaking layout; Progressive sequence |

A title/instruction, feedback/OK and progressive reveal remain shared behavior, not new material types. The catalog is not an exhaustive list of permitted combinations. Combine existing `kind` definitions in a `stage`, or text/image/disclosure blocks in a `presentation`. No Listening+Choice or Reading+Gap renderer kinds are added. Speaking is an ungraded composition, not a separate response engine.

`SpaceWhaleTemplates` contains the 21 visible cards with `catalogGroup`, `description` and `legacyIds`. Alternate text/image/word-bank examples live inside the corresponding mechanic's progressive preview. `SpaceWhaleTemplateExamples` retains the former 31 fixtures for regression tests; it is not a second catalog. All 31 old preview links resolve to their canonical card. Existing course IDs, definitions and answer IDs are unchanged; demonstration attempts need not migrate to a different composite structure.

| Former catalog entries | Destination |
|---|---|
| Match the Halves; Picture–Word; Word–Definition | Matching variants |
| Text / Image Single Choice | Single Choice variants |
| Text / Image Multiple Select | Multiple Select variants |
| Typed Gap; Typed Gap + Word Bank; Error Correction | Typed Input / Gap variants |
| Inline Dropdown | Dropdown |
| Sentence / Chunk Order; Picture / Event Order | Order variants |
| Sort into Groups; Image Label; Open Writing | Sort; Image Label; Text / Writing field |
| Global Audio; Global Audio with transcript | Audio with optional transcript |
| Rule / Language Reference; Possible Answers | Rule; Possible answers |
| Speaking / Presentation; Speaking · Use phrases | Speaking layout |
| Listen & Repeat | Listen & Repeat composition |
| Four Listening + task presets | Audio + task composition |
| Reading + Choice; Reading + Gap | Text + task composition |
| Stage; Guided Discovery | Progressive sequence, including discovery example |

A source and its first response must be visible together. Use a non-progressive grouped stage for a source plus one task; the existing renderer automatically reveals multiple response components progressively while retaining the leading source. Ordinary explicit progressive sequences start with the first task, not a source-only step. A single material/task or a composition without further steps has no continuation arrow. Audio stays mounted while later tasks open and close.

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
| writing | `items[{id,prompt,acceptedAnswers?,possibleAnswers?}]`, optional `responseMode:"accepted"/"open"` | `{ itemId: freeText }` |
| presentation | `blocks` with text, image or disclosure | no automatic grade |
| audio | `audio`, optional `transcript`; listen-repeat uses `items[{id,text,audio,example?,exampleAudio?}]` | no automatic grade |
| rule-page | ordered text, image, rule or nested exercise blocks | child answers under block ID |
| stage | `exercises[{id,exercise}]`, `progressive:true/false`, optional `layout:"grouped"` | child answers under block ID, plus `revealed` count |

Typed gaps default to keyboard input. A bank is only a hint and may contain a base form different from the accepted answer. For a dropdown set `inputMode:'select'` and explicit options. Correct keys in the bank do not determine displayed option order.

Multiple Select uses checkboxes and exact set comparison; order of selected options does not matter. An omitted key requires teacher review.

Useful Language disclosures open initially. Standalone Possible Answers disclosures and audio transcripts start closed. Writing has OK: authored `items[].possibleAnswers` appear in the feedback panel only after submission, never before it. Editing or resetting hides the examples again; synchronized checked state restores them. Examples are not accepted-answer keys. Open tasks never receive automatic correct/incorrect grades. For keyed writing use `responseMode:"accepted"` and a non-empty `acceptedAnswers` list on every item; omissions are rejected. For free writing use `responseMode:"open"` (or omit mode and keys). Open/personal modes reject conflicting keys. Keys normalize case, Unicode NFKC and whitespace only; author punctuation and contraction alternatives explicitly. Accepted writing uses the shared feedback and Correct answers panel; arbitrary paraphrases are not semantically graded. Personal forms can set `responseMode:"personal"` for a neutral confirmation. Do not invent correct keys for personal data.

## Interaction/state guarantees

- All answer changes emit `onChange` with the same serializable answers state, including drag/drop and reorder.
- Matching is single-use: picking an occupied option moves it, preserving card order.
- Sort, order and labels share pointer-based dragging for mouse/touch, with native drop handlers and click/keyboard alternatives. Each drop updates the same answers state.
- Order: click to append/return, drag before another item or to the end, Alt+Left/Right to reorder.
- Image labels stay where placed, even when wrong. Only Check evaluates them.
- Feedback appears only after Check; editing clears stale feedback and corrections. Reset clears answers and feedback.
- Each nested exercise has its own Check/Reset. A stage has no global Reset. Progressive stages offer Show next exercise / Hide last exercise; hiding changes only the revealed count and retains all block answers for reopening and synchronization. Progressive reveal belongs to the stage, not to individual templates.
- `setAnswers` hydrates remote state without emitting another onChange. Read-only mounts block changes.
- Global and per-item players stop other playing audio when starting.

## Changes to appearance

Examples: change `--sw-exercise-font` globally; adjust the desktop/compact/mobile type scales together for a global size change; set `--sw-matching-ratio: 1 / 1` for square text cards; adjust `--sw-picture-word-ratio` for picture cards. More substantial layout changes belong in exercise-kit.css and apply wherever that layout is used.

After a shared change, run `npm ci` once, then `npm test`, then check the changed interactions in the preview and one existing lesson. Update stylesheet/script cache versions when publishing. Structural schema changes require separate compatibility work; visual changes do not.

## Audio and grouped exercises (2026-09-23)

- The shared player uses decorative waveform bars, not measured signal amplitudes. Its fill follows actual media time. Play fills progressively, Pause greys the track without rewinding, natural completion leaves it fully filled, and replay starts at zero. The overlaid native range supports mouse/touch seeking and keyboard arrows; unavailable duration disables seeking. Starting another player pauses the previous one.
- Change `--sw-audio-progress` / `--sw-audio-idle` in exercise-theme.css for all full players. Listen & Repeat remains a separate compact control.
- Use `kind:"stage", layout:"grouped"` for a source and its response component (audio/text plus one response component). Set the common title and instruction on the stage; child titles are hidden, optional child instructions remain available. Components keep their own answer state and local Check/Reset. Do not combine grouped layout with explicit progressive reveal. The renderer now automatically separates multiple independent response components into sequential steps, keeping leading source material with the first task and trailing support with the preceding task; answer IDs stay unchanged. Ordinary/progressive stages keep the large separation between independent exercises.
- Grouped spacing: `--sw-component-gap`; independent exercise spacing: `--sw-stage-gap`.
- The single `uiLabels.check` value in exercise-kit.js controls the validation button label for every shared exercise, including nested ones. Changing it to Done updates them on the next page load without changing validation behavior or lesson data. Exported as SpaceWhaleExerciseKit.uiLabels for configuration before mounting.
- Preview audio is still a three-second test tone. Listening composition previews contain neutral content placeholders and no technical answer hints. Optional transcript behavior is available in the Audio material preview.

## Approved monochrome direction

Onest throughout; 16px body, 20px primary title, 18px embedded heading, 14px instructions and controls. Shared palette and sizing live in exercise-theme.css. Workspace overrides must use those tokens rather than fixed competing sizes. Charcoal buttons have content-sized width, restrained padding and rounded corners. Cards are flat; shadows remain for floating menus/dialogs. Audio progress and non-feedback interaction states are monochrome. Only correct/incorrect feedback and content images use color. Separate exercise spacing and grouped component spacing remain distinct. Sidebar and Home styles are outside this change. Touch targets remain usable with coarse-pointer overrides. No lesson data or answer-state changes are required for this theme.

## Whale 1 content (2026-09-24)

- `whale1-content.js` registers seven existing A1.1 / Whale 1 catalog IDs (57 stages). It contains data only and uses the existing shared templates.
- `order.acceptedOrders` optionally lists additional complete permutations of token IDs. `correctOrder` remains supported. This does not change the one-answer contract of other closed kinds.
- Presentation/rule-page image blocks and picture-word items may use `imagePending:true` with a stable `assetId` while the owner supplies artwork. They reserve an empty area, make no missing-file request and show no description in that area. Attach the real `image` URL and meaningful `alt` later; remove `imagePending`.
- Whale 1 artwork mapping: `docs/whale1-image-manifest.json`; generation briefs: `docs/Whale_1_Image_Scenarios.md`. Weather conditions and temperature are separate matching sets.
- `gap.normalization:'phone'` ignores spacing, parentheses and hyphens for phone input only. Email and symbol gaps retain their significant characters.
- Audio remains script-only for this module. Teacher scripts live in stage guide data. They are not displayed in student live sessions. Listen & Repeat uses existing pending-audio support; do not attach template test tones.

## Feedback contract (2026-09-26)

- Closed tasks retain correct/retry indicators after OK. Incorrect or unanswered items in an attempted task reveal their authored solutions, including matching and picture tasks. Legacy `feedback.showAnswers:false` no longer suppresses these essential corrections in the modern workspace. Two-option choices and dropdowns also reveal corrections. When a gaps task has any mistake, its feedback shows all complete corrected sentences with muted context and highlighted answer spans.
- Free writing and unkeyed gaps require teacher review; examples must be supplied by the author as `possibleAnswers`. No AI grammar or semantic grading is connected. Personal data can vary.
- OK remains available after checking. Changing a response clears old feedback; reset clears both answers and feedback.

## Pending source media and post-task transcript (2026-09-26)

- Choice and gaps items accept optional `image`/`alt`/`crop` or `imagePending:true`/`assetId` cues, rendered beside the corresponding prompt through the shared illustration renderer.
- A full audio player may use `audioPending:true` without a URL. The player retains its layout with a disabled play control and no source request. A supplied URL takes precedence.
- A stage may supply `transcript` and `transcriptAfter:[blockId,...]`. IDs must reference distinct directly nested response components. The disclosure unlocks after each referenced component has a submitted, non-empty response; correctness is not required. The stage records/checks child submission state even in a standalone preview. Edits/reset relock the disclosure, and `setAnswers` restores it without emitting changes.

## Authoring and Workspace conventions

See root `AGENTS.md` for source-to-layout mapping, inline dropdowns, picture/task reveal steps, non-repeating headings, full-range reveal scrolling, dismissible notices, and the plain lesson overview without target-word lists. Explicit `constructions` is the metadata for lesson phrases; `words` and ambiguous imported `lexis` do not appear in the overview.
