# Space Whale — shared template catalog

Catalog updated: 2026-10-17. This document supersedes the older interaction notes in EXERCISE_TEMPLATES.md and EXERCISE_COVERAGE_V2.md.

## Fixed authoring formats across the workspace

Every new exercise fills an existing shared kind/layout. Do not create per-lesson controls, windows, labels, HTML or CSS. New formats and changes to the common layout require an explicit user request. Existing response mechanics keep their established behavior; a Speaking request does not change Writing, Matching, audio or navigation.

All new or revised Speaking uses `SpaceWhaleExerciseKit.speaking(...)`: **title → image slot → task → Use:**. See [SPEAKING_TEMPLATE.md](SPEAKING_TEMPLATE.md) for the exact schema and authoring process. The renderer fixes this order, prints one bold `Use:`, places words before phrase models in each group, and supplies no disclosures, teacher notes, Test label or exercise buttons. Missing artwork leaves a hidden slot. Extra content/layout fields are rejected. The same renderer is used in the catalog and every lesson, including live teacher/student views. Legacy presentation definitions remain compatible until their content is deliberately revised.

## One source of truth

- `exercise-theme.css`: typography, shared colors and template-specific shape tokens. Edit here to update every exercise using the shared kit.
- `exercise-kit.css`: layouts for each reusable kind/layout; no lesson-specific selectors.
- `exercise-kit.js`: validation, rendering, Check/Reset and the same answers/onChange contract used by Workspace realtime.
- `template-gallery.js`: source-code catalog assembly and legacy test fixtures. The three `template-source-*.js` content files contain source-aligned examples; no renderer copies or course registration.
- `classroom.html?view=templates`: existing Workspace hosts the previews. Old `template-gallery.html` redirects here.

Privacy is explicitly deferred after discussion with the owner. This preview is PUBLIC, not owner-only. It contains neutral instructional examples and existing approved artwork. Do not add confidential drafts, private content or admin tools here. Server-authorized Factory storage is a separate future task.

## Source-code catalog (2026-10-17)

The existing Workspace `Exercise Templates` menu uses the source families W, P, D, R, E, Q, L, T and S. Selecting a family opens its code list; a small round Back control returns to the family list without changing the mounted exercise. All rows use the same shared sidebar typography, full-width dividers and selected-state treatment. Clicking the exercise area does not close the menu; use its close control, rail toggle or Escape.

| Family | Purpose | Templates |
|---|---|---:|
| W | Words | 6 |
| P | Listen & Repeat | 2 |
| D | Guided Discovery | 4 |
| R | Rules | 4 |
| E | Practice | 29 |
| Q | Questions & Discussion | 2 |
| L | Listening | 18 |
| T | Reading | 12 |
| S | Speaking | 2 |

There are 79 playable source-coded templates. W03 is the parent name for W03A/W03B, not a third exercise. W05 and L13–L18 come from the later dedicated Words/Listening files. The supplied sources contain no E10 or I/A families; do not invent missing codes. `docs/exercise-source-manifest.json` records all 80 code labels, source pages and conflicts resolved using later dedicated instructions. The source files themselves remain unchanged.

`template-source-index.js` stores canonical code names. `template-source-core.js`, `template-source-practice.js` and `template-source-input.js` contain preview content only. They use the existing shared kit and existing site artwork; they neither register course lessons nor alter their saved answers. Future formats must first have a confirmed source code and then a definition in the appropriate data file. The index and coverage test must agree.

`template-gallery.js` assembles the one visible source catalog and redirects old preview IDs to corresponding code cards. The former 31 technical fixtures and 21 neutral previews remain available only for renderer regression coverage; materials/mechanics/compositions are no longer menu categories. Their test tones are not used as language recordings in the source catalog. Source listening and repetition previews with no supplied recording use disabled pending players; do not generate, substitute or mislabel audio.

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
| writing | `items[{id,prompt,placeholder?,acceptedAnswers?,possibleAnswers?}]`, optional `responseMode:"accepted"/"open"` | `{ itemId: freeText }` |
| presentation | `blocks` with text, image or disclosure for source materials/legacy content; Speaking uses `layout:'speaking'`, `image`, `task`, `use` via the shared factory | no automatic grade |
| audio | `audio`, optional `transcript`; listen-repeat uses `items[{id,text,audio,example?,exampleAudio?}]` | no automatic grade |
| rule-page | ordered text, image, rule or nested exercise blocks | child answers under block ID |
| stage | `exercises[{id,exercise}]`, `progressive:true/false`, optional `layout:"grouped"` | child answers under block ID, plus `revealed` count |

For a partially completed source table, use `gaps` with `layout:'table'` and `tableColumns` (2–6 headings). Each item is one row; its `segments` contain one text or existing gap object per column. Answer IDs and grading remain flat. Matching cards may opt into `item.audio` or `audioPending:true` for a separate replay control; this uses the existing audio transport.

Typed gaps default to keyboard input. A bank is only a hint and may contain a base form different from the accepted answer. For a dropdown set `inputMode:'select'` and explicit options. Correct keys in the bank do not determine displayed option order.

Multiple Select uses checkboxes and exact set comparison; order of selected options does not matter. An omitted key requires teacher review.

Useful Language disclosures open initially. Standalone Possible Answers disclosures and audio transcripts start closed. Writing has OK: completed open/personal responses show `Well done`, with no automatic Possible answers section. Legacy `items[].possibleAnswers` remain compatible data but are not rendered in Writing feedback. Open tasks never receive automatic correct/incorrect grades. For keyed writing use `responseMode:"accepted"` and a non-empty `acceptedAnswers` list on every item; omissions are rejected. For free writing use `responseMode:"open"` (or omit mode and keys). Open/personal modes reject conflicting keys. Keys normalize case, Unicode NFKC and whitespace only; author punctuation and contraction alternatives explicitly. Accepted writing uses the shared feedback and Correct answers panel: a muted prompt followed by the first accepted answer in bold. Other accepted variants are used for checking only; arbitrary paraphrases are not semantically graded. Personal forms can set `responseMode:"personal"` for a neutral confirmation. Do not invent correct keys for personal data.

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
- Listen & Repeat reveals a cumulative list: word, example sentence, next word, next sentence. Both use the same normal-weight text style. The teacher's next arrow adds one row; earlier rows and their audio controls stay mounted and visible. The previous arrow hides only the last row. The existing `repeat` view-state index synchronizes this reveal with learners, who cannot advance it themselves.
- The forward Listen & Repeat arrow also starts the newly revealed recording from its beginning. It dispatches a Play request inside the user's click so the live transport sends one synchronized teacher command. Remote view updates and backward arrows do not autoplay. Missing audio remains disabled. Play controls still allow manual replay.
- Related vocabulary exercises belong to one progressive stage (e.g. Dropdown → Typed Gap), with `requireCheckBeforeNext:true` and separate checks, rather than separate lesson pages. Group by the same practice goal; new discovery and listening focuses get their own entries. Preserve each child ID when grouping.

## Changes to appearance

Examples: change `--sw-exercise-font` globally; adjust the desktop/compact/mobile type scales together for a global size change; set `--sw-matching-ratio: 1 / 1` for square text cards; adjust `--sw-picture-word-ratio` for picture cards. More substantial layout changes belong in exercise-kit.css and apply wherever that layout is used.

After a shared change, run `npm ci` once, then `npm test`, then check the changed interactions in the preview and one existing lesson. Update stylesheet/script cache versions when publishing. Structural schema changes require separate compatibility work; visual changes do not.

## Audio and grouped exercises (2026-09-23)

- The shared player uses decorative waveform bars, not measured signal amplitudes. Its fill follows actual media time. Play fills progressively, Pause greys the track without rewinding, natural completion leaves it fully filled, and replay starts at zero. The overlaid native range supports mouse/touch seeking and keyboard arrows; unavailable duration disables seeking. Starting another player pauses the previous one.
- Change `--sw-audio-progress` / `--sw-audio-idle` in exercise-theme.css for all full players. Listen & Repeat remains a separate compact control.
- Use `kind:"stage", layout:"grouped"` for a source and its response component (audio/text plus one response component). Set the common title and instruction on the stage; child titles are hidden, optional child instructions remain available. Components keep their own answer state and local Check/Reset. Do not combine grouped layout with explicit progressive reveal. The renderer now automatically separates multiple independent response components into sequential steps, keeping leading source material with the first task and trailing support with the preceding task; answer IDs stay unchanged. Ordinary/progressive stages keep the large separation between independent exercises.
- Grouped spacing: `--sw-component-gap`; independent exercise spacing: `--sw-stage-gap`.
- The single `uiLabels.check` value in exercise-kit.js controls the validation button label for every shared exercise, including nested ones. Changing it to Done updates them on the next page load without changing validation behavior or lesson data. Exported as SpaceWhaleExerciseKit.uiLabels for configuration before mounting.
- Source-code listening previews use neutral content with pending recordings when no authorized clip is supplied. Transcripts remain closed until their intended review step. Technical legacy fixtures retain their test tone for transport regression only.

## Approved monochrome direction

The shared native system family comes from typography.css; 16px body, 20px primary title, 18px embedded heading, 16px task instructions and body text; secondary control labels use the shared smaller scale. Shared palette and sizing live in exercise-theme.css. Workspace overrides must use those tokens rather than fixed competing sizes. Charcoal buttons have content-sized width, restrained padding and rounded corners. Cards are flat; shadows remain for floating menus/dialogs. Audio progress and non-feedback interaction states are monochrome. Only correct/incorrect feedback and content images use color. Separate exercise spacing and grouped component spacing remain distinct. Sidebar and Home styles are outside this change. Touch targets remain usable with coarse-pointer overrides. No lesson data or answer-state changes are required for this theme.

## Whale 1 content (2026-09-24)

- `whale1-content.js` registers seven existing A1.1 / Whale 1 catalog IDs (57 stages). It contains data only and uses the existing shared templates.
- `order.acceptedOrders` optionally lists additional complete permutations of token IDs. `correctOrder` remains supported. This does not change the one-answer contract of other closed kinds.
- Presentation/rule-page image blocks and picture-word items may use `imagePending:true` with a stable `assetId` while the owner supplies artwork. They reserve an empty area, make no missing-file request and show no description in that area. Attach the real `image` URL and meaningful `alt` later; remove `imagePending`.
- Whale 1 artwork mapping: `docs/whale1-image-manifest.json`; generation briefs: `docs/Whale_1_Image_Scenarios.md`. Weather conditions and temperature are separate matching sets.
- `gap.normalization:'phone'` ignores spacing, parentheses and hyphens for phone input only. Email and symbol gaps retain their significant characters.
- Audio remains script-only for this module. Teacher scripts live in stage guide data. They are not displayed in student live sessions. Listen & Repeat uses existing pending-audio support; do not attach template test tones.

## Feedback contract (2026-09-26)

- Closed tasks retain correct/retry indicators after OK. When an attempted task has an incorrect or unanswered item, text corrections include all keyed items in their original order and numbering, including items already answered correctly. Picture correction carousels are the exception: show only incorrect or unanswered pictures with their original numbers. This applies to the common Picture–Word Matching and keyed picture-Writing correction helper. Legacy `feedback.showAnswers:false` does not suppress these essential corrections in the modern workspace. Two-option choices and dropdowns also reveal corrections. Gap corrections show complete sentences with muted context and restrained answer emphasis.
- Free writing and unkeyed gaps require teacher review; no AI grammar or semantic grading is connected. Writing confirms completed input with `Well done` without showing examples. Personal data can vary.
- OK remains available after checking. Changing a response clears old feedback; reset clears both answers and feedback.

## Pending source media and post-task transcript (2026-09-26)

- Choice and gaps items accept optional `image`/`alt`/`crop` or `imagePending:true`/`assetId` cues, rendered beside the corresponding prompt through the shared illustration renderer.
- A full audio player may use `audioPending:true` without a URL. The player retains its layout with a disabled play control and no source request. A supplied URL takes precedence.
- A stage may supply `transcript` and `transcriptAfter:[blockId,...]`. IDs must reference distinct directly nested response components. The disclosure unlocks after each referenced component has a submitted, non-empty response; correctness is not required. The stage records/checks child submission state even in a standalone preview. Edits/reset relock the disclosure, and `setAnswers` restores it without emitting changes.

## Authoring and Workspace conventions

See root `AGENTS.md` for source-to-layout mapping, inline dropdowns, picture/task reveal steps, non-repeating headings, full-range reveal scrolling, dismissible notices, and the plain lesson overview without target-word lists. Explicit `constructions` is the metadata for lesson phrases; `words` and ambiguous imported `lexis` do not appear in the overview.

## Writing cues and expansion feedback

`writing.items[].placeholder` is an optional muted spelling cue inside an empty response field. It disappears on focus and while typing, is never saved as an answer and never affects grading. `writing.items[].hint` is optional non-empty supporting text. It renders beneath its field, in smaller muted type, and is associated through `aria-describedby`. Store only the question in `prompt`; submitted examples and corrections intentionally omit `hint`. All answer examples are bold, with a thin separator between the feedback status and the answer section. All inline disclosures and newly submitted feedback use the same full-range scroll behavior as progressive tasks and rules.

## Workspace color update (2026-10-03)

The light workspace canvas is solid white without a grid, with black primary lesson text. Supporting/correction text stays muted. OK and up/down progression buttons use `--sw-action-background: #EE7C37`, `--sw-action-hover: #EE7C37`, and black action text, centrally defined in `exercise-theme.css`. Sidebar surfaces are white in light mode. Answer selectors, audio controls and feedback colors keep their existing appearance. Dark mode keeps a solid dark canvas and readable text. This supersedes the earlier all-monochrome direction for these specific action buttons.

- Latest appearance (2026-10-03 evening) supersedes orange/grey surfaces: all light-theme workspace control and content surfaces are white, including OK/arrows, sidebar selectors/session buttons, menus, answer fields, correction panels and audio-player surfaces. No orange fill or outline. Preserve shadows, readable text/icons, audio progress and correct/incorrect indicators. Dark-theme contrast remains supported.

- Typed gaps support optional `segments[].placeholder`: a muted hint inside an empty input, hidden on focus and while typing. It is never a prefilled value and does not affect grading.

## Independent homework sequences (2026-10-04)

Homework uses the existing `stage` composition and all existing response templates. Mount options (off by default) are `repeatAll:true` (whole Listen & Repeat list, manual players, no phrase arrows), `allowMaterialSkip:true` (Skip on audio/presentation/rule materials), and `independentSteps:true` (audio is an independent homework step; it does not turn later tasks into source-listening questions). These flags propagate through the shared stage. Check or Skip enables progression; audio/rule forward arrows remain available. Existing classroom defaults are preserved. `taskFinished` is exported for shared progress calculation. Homework roles are authored content metadata, never inferred from Matching/Gap names.

## Reviewed A2 homework and checked feedback (2026-10-04)

- `homework-a21.js` owns the two movement/directions translation sets, shared by the catalog and the legacy Smy 3 homework route. Load it before `course-content-directions-a21.js`. Each set has two tasks of six single-line responses. Sequencers is excluded. Full rules/audio/word practice come from explicit source IDs.
- Keyed writing can opt into `items[].normalization:'translation'`: ignore case, whitespace, normal sentence punctuation and normalize supported English contractions. Grading still compares authored alternatives; no semantic/AI checker is connected. Preserve tense, direction and negation. Show one canonical correction, keep accepted variants out of the question.
- Choice can opt into `progressiveQuestions:true` to use the existing per-question OK/Next adapter. `showAllQuestions:true` renders the complete read-only homework report. Classroom defaults and stable item IDs remain unchanged.
- Checked responses show explicit check/cross glyphs, including fieldset choices/multiple select; numbered fields retain their item number. Do not encode feedback only by color.

## Shared classroom structure (2026-10-04)

`lesson-structure.js` is the one classroom section builder, used by `workspace-catalog.js`. Declare a lesson's `structure` as ordered `{role,sources:[existingExerciseId,...]}` entries. Roles are opening, words, wordPractice, focus, practice, reading, listening, final. The default authoring order follows that list; Reading needed as Discovery context precedes Language Focus. Omit empty roles. Homework is outside this composition.

The reviewed four lessons are mapped in `lesson-structure-content.js`. New lessons use the same structure contract rather than adding a custom stage assembly. Explicit mapping is necessary: a Matching can teach words, practise grammar or check comprehension. No inference from its kind or title. Old content without a complete mapping remains compatible.

Words and Listen & Repeat share a section. Related practice tasks share a section. Each task has its own OK, then a teacher arrow; checks never auto-advance. Discovery/Reading Choice or Gap tasks opt into `progressiveQuestions:true`, which reuses the same per-question adapter and preserves original flat response IDs. Compact ordinary gap lists remain one task. Source material remains mounted. A section with an unfinished inner sequence exposes only the inner forward arrow. Internal, builder-owned stages can nest with `unifiedProgression:true`; arbitrary nested compositions remain rejected.

Original exercise, item, media and answer IDs remain stable. Grouped sections have new IDs and aliases for old source links. The workspace reads old individual local/live answers only when no grouped response exists; it does not modify/delete the original records. Layout-only signature changes keep compatible responses. Live drafts and view state use the existing collaboration/audio protocols. B1 Error Correction uses new item IDs so old free-text replies are not interpreted as answers to the new questions.

Appearance controls are in `exercise-theme.css`: `--sw-exercise-font` for the family, `--sw-exercise-text-size` for the base type scale, `--sw-control-scale` for controls. Heading/mobile/sidebar/dialog type sizes derive from the base; control shapes derive from the control scale. Default values retain the approved appearance. Change the shared values, never a lesson selector. These are site configuration values, not learner-specific preferences.

## Shared readability (2026-10-15)

Phone matching grids keep two columns for picture-word and text/translation cards. Six source cards occupy three rows. The existing card selector still opens the same dialog; desktop grids and answer mechanics remain unchanged.

Grammar highlights and correction answers use the surrounding family, type size and line height, with clear charcoal semibold emphasis. The single native family is defined in `typography.css`, with no third-party web-font requests. Rule examples keep a consistent paragraph rhythm. Shared composition rendering omits redundant generic instructions when the visible task heading already states the same action; specific instructions and context remain.

Text corrections contain all keyed source rows in their authored order and numbering whenever any keyed item needs correction. Already-correct text answers remain visible. Picture correction carousels show only noncorrect source items, preserving original numbers instead of renumbering the filtered cards. Open writing continues to show neutral completion without invented model answers or grading.

## Actual-template refinement (2026-10-15)

Refine the existing shared kit and Templates catalog directly. Do not create standalone design samples or alternate classroom scenes. Checked fields and chips keep white surfaces, thin result-colored outlines and compact circular check/cross markers. Remove obsolete dotted fills and competing result palettes. Corrections have one barely shaded rounded panel, readable body-sized text and unchanged source numbering. Text lists include correct attempts; picture carousels show only noncorrect pictures. Each row/card carries the outcome of the learner's last checked attempt; the displayed canonical answer is not itself labeled as an incorrect answer.

Use one primary task heading. Explicit `presentation.blocks[].role: "examples"` groups model paragraphs with tighter internal spacing and larger separation from the title and subsequent questions; keep source text and exercise IDs unchanged. Other text blocks and dialogues retain their paragraph structure.

## Vocabulary matching refinement (2026-10-17)

Refine shared semantic layouts, not individual lesson IDs. Use `layout: "picture-word"` for W01, `"word-translation"` for W02, and `"word-definition"` for W03. Generic `"cards"` matching retains its established appearance. All use the same `{itemId: optionId}` response schema; matching layout changes alone remain compatible with saved response definitions.

Picture cards retain three desktop columns and two phone columns. The media area is slightly portrait (10:11), with 14px insets on all sides. Artwork uses contain, bounded `minmax(0,1fr)` grid tracks and zero minimum sizes; never use cover or let intrinsic image dimensions overflow the frame. Picture dialogs use a consistent 360px preferred width and 330px media frame with 12px insets. Shrink the media first on short viewports. All pictures share these dimensions regardless of their original proportions. Correction cards stay compact and contain only noncorrect pictures with their original source numbers; text corrections still include all keyed rows.

W02 and W03 use wide horizontal rows: source number and word on the left, broad flat answer field on the right. The field is #F7F7F8 with a quiet plus, rounded corners and a thin dashed border; W03 allows extra height for definitions. Keep answer labels centered with equal left/right padding and no reserved feedback gutter. Small gray source circles have centered white digits. Modal choices are numbered by their original option order. The selected option number appears in the field's corner, then becomes a centered shared check/cross after checking. The source number remains unchanged. Editing/reset clears checked marks; moving options and remote hydration use the same state logic.

Vocabulary selection dialogs separate the title, source word in a lightly shaded rounded dashed box, and numbered choices with subtle dashed borders. Outside pointer clicks close without selecting or clearing answers, alongside Close, Escape and choosing an option. Gestures starting inside do not dismiss. Do not change course IDs, answer keys, media or live synchronization when refining these layouts.
