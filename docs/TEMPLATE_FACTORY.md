# Space Whale — shared template catalog

Catalog and shared registry updated: 2026-10-18. This document supersedes the older interaction notes in EXERCISE_TEMPLATES.md and EXERCISE_COVERAGE_V2.md.

## Fixed authoring formats across the workspace

Every new exercise declares an existing `templateCode` and fills its compatible shared kind. Do not create per-lesson controls, windows, labels, HTML or CSS. New formats and changes to the common layout require an explicit user request. Existing response mechanics keep their established behavior; a Speaking request does not change Writing, Matching, audio or navigation.

All new or revised Speaking uses `SpaceWhaleExerciseKit.speaking(...)`: **title → image slot → task → Use:**. See [SPEAKING_TEMPLATE.md](SPEAKING_TEMPLATE.md) for the exact schema and authoring process. The renderer fixes this order, prints one bold `Use:`, places words before phrase models in each group, and supplies no disclosures, teacher notes, Test label or exercise buttons. Missing artwork leaves a hidden slot. Extra content/layout fields are rejected. The same renderer is used in the catalog and every lesson, including live teacher/student views. Legacy presentation Speaking receives the same template identity and shared visual classes while retaining its original blocks, disclosures and role cards; only an explicitly requested content revision may replace those structures.

The owner-approved `arrangement:'image-support'` is an opt-in within the same Speaking factory: one brief title, image left and Use right, wrapping at the actual content width. This arrangement permits omitting `task` when the title is the full instruction. Original media proportions and all default Speaking behavior remain intact. Native progressive stages reveal multiple pictures through teacher arrows; do not create lesson-specific windows or markup.

An explicit request to place supplied Speaking artwork before task wording is ready uses `arrangement:'image-only'` in that same factory: real `image`, generic `title:'Speaking'`, and no `task` or `use`. The validator rejects missing artwork and added task/support in this variant. It never generates placeholder copy. Mirrored opening/final exercises share authored content and retain distinct stable IDs for independent state; completed default/image-support tasks remain unchanged.

## One source of truth

- `exercise-template-profiles.js`: canonical visual settings for all 79 approved source templates, including compatible parts of compound templates. Edit a profile once to update its catalog preview, course exercises and homework on their next mount.
- `exercise-template-bindings.js`: reviewed existing exercise IDs mapped to template codes/parts. Explicit material and composition roles prevent source text, recordings and mixed sequences from becoming unrelated response templates.
- `exercise-templates.js`: resolves every `SpaceWhaleExerciseKit.mount` through those profiles, including nested catalog, course and homework definitions. Resolution creates a view copy; lesson text, IDs, answer keys, media, saved responses and reveal/progression data remain authored and unchanged.
- `typography.css` and `exercise-theme.css`: the native font family, shared colors, type/size and shape tokens used by the registered templates.
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

`template-source-index.js` stores canonical code names. `template-source-core.js`, `template-source-practice.js` and `template-source-input.js` contain preview content only. They use the existing shared kit and existing site artwork; they neither register course lessons nor alter their saved answers. A supported template has a confirmed source code, a canonical profile and preview content in the appropriate data file. Preview content is not a second place to set its visual layout. The index, profiles and coverage test must agree.

`template-gallery.js` assembles the one visible source catalog and redirects old preview IDs to corresponding code cards. The former 31 technical fixtures and 21 neutral previews remain available only for renderer regression coverage; materials/mechanics/compositions are no longer menu categories. Their test tones are not used as language recordings in the source catalog. Source listening and repetition previews with no supplied recording use disabled pending players; do not generate, substitute or mislabel audio.

## Authoring contract

1. Select the existing source `templateCode` and compatible shared `kind`; declare the code in new lesson definitions or add an explicit ID binding. Store authored text, IDs, answer keys, media and progression in lesson data, while visual settings come from its profile.
2. Do not insert HTML, inline styles or copies of renderer logic into lesson data.
3. Keep IDs stable after publication; saved attempts and realtime use them. A visual change does not require changing IDs or rewriting lessons.
4. Call `SpaceWhaleExerciseKit.validate(definition)` before publishing.
5. Register a real lesson through `window.SpaceWhaleContent` with its existing catalog lesson ID, level and whale. A stage's `exercise` can be a single definition or a shared `kind: 'stage'` definition.
6. Sources may hold a copy of this authoring guide. The working template implementation remains in the website repository.

Common definition: `{ version: 1, id, templateCode, kind, title, instruction? }`. Compound templates can declare `templatePart`; their compatible kinds and part paths are listed in the profile. Codes are semantic identities, not new exercise/item IDs or visible renumbering. Mounted hosts expose `data-template-code` and `data-template-part` for inspection.

An explicit `templateCode` takes priority over the catalog `code` and reviewed ID binding. Shared-mechanic inference supports older or generated homework definitions, but it does not establish a new lesson's teaching purpose: authors must choose the source code. A mixed `stage` stays a composition whose children retain their own codes; material roles keep source-only text/audio intact. Profile layout changes must preserve `picture-rows` image associations and table cells, never detach a cue from its response.

`SpaceWhaleExerciseTemplates.profileFor(code, kind, part)` returns the applicable visual settings and `supported`, which must be checked when diagnosing a legacy kind/part. `configure(code, changes, {kind, part})` changes only allowed visual fields in memory and returns a restore callback. Without a selector it targets the first response kind of a compound template; specify `kind` and, when needed, the profile's exact part path to target another part. The change applies on the next mount, and the callback restores the previous profile. Persistent changes belong in `exercise-template-profiles.js`; neither this API nor a visual profile replaces lesson content, grading keys or saved work.

| Kind | Content fields | Answers state |
|---|---|---|
| matching | `items[{id,text,image?,alt?,correctId}]`, `options[{id,text}]`, optional layout | `{ itemId: optionId }` |
| gaps | `items[{id,segments:[text,{id,answers,options?},text]}]`, optional `bank`, `inputMode` | `{ gapId: typedText }` |
| choice | `items[{id,prompt,options,correctId}]`; multiple uses `multiple:true` and `correctIds` | single string or array of option IDs per item |
| sort | `items[{id,text,correctId}]`, `groups[{id,text}]` | `{ itemId: groupId }` |
| order | `tokens[{id,text,image?,alt?}]`, `correctOrder` | `{ order: [tokenIds] }` |
| image-label | `image` or `imagePending:true`, `alt`, optional `imageWidth`/`imageHeight`, `items[{id,x,y,prompt,correctId}]`, `options[{id,text,translation?}]` | `{ targetId: optionId }` |
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

Examples: change `--sw-exercise-font` globally; adjust the desktop/compact/mobile type scales together for a global size change; set `--sw-matching-ratio: 1 / 1` for square text cards; adjust `--sw-picture-word-ratio` for picture cards. Per-template visual settings belong in `exercise-template-profiles.js`; shared layout implementation belongs in `exercise-kit.css`. Both apply to compatible catalog, course and homework exercises through the same registry.

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

The sidebar and full work canvas are separate regions. The exercise root inside the canvas is a fluid column capped at the existing 704px learning width, centered with equal automatic left/right margins. Keep top/bottom padding and utility clearance. This applies to every classroom template, lesson and teacher/student view; never replace the root cap with `max-width:100%`. Inside that column all titles, instructions, examples/dividers, picture/card grids, image-label materials, feedback and OK/Skip start at the shared left edge. Smaller blocks leave unused width on the right. As the screen narrows, outside margins reduce first, then whole cards wrap down and text wraps at word boundaries. Do not shrink font size or split normal words into narrow letter stacks. Artwork and labels may retain their own internal alignment. Content substitution must not alter this geometry.

W01 retains a 600px maximum width and up to three desktop/preferably two phone columns. Intrinsic tracks follow the actual content width and reduce to one when needed, including while the sidebar is expanded or resized. Use a shorter 1.16 media ratio, 14px safe artwork insets, bounded tracks and contain. Its #F7F7F8 answer area has a 44px minimum and uses the largest answer height across the picture grid with 10px side/bottom gaps and 20px corners. A faint native dashed border stays crisp at rest and on hover without scaling an SVG background; checked states replace it with the existing result contour. Source numbers throughout the kit are small muted plain digits with no filled circle. Keep feedback marks distinct. Matching cards use the shared soft all-edge shadow token.

Picture corrections retain 128px width and original source numbers, with a 100px media area and 8px insets. Real and pending media both clear the generic image minimum height, so structural placeholders cannot make corrections taller. Captions have normal body weight, size, family and answer color. Only noncorrect picture rows appear; text corrections continue to include all keyed rows.

W02 places the small source number beside its word in a top header; its full-width translation/+ field sits below. It has up to three columns on desktop and prefers two on phones, reducing to one when space is insufficient. Text-card rows wrap using content minimums while retaining the existing desktop column bases; a partial final row does not stretch. Preserve words at normal break opportunities rather than splitting them into letters. Move a whole card to the next row when its text needs more room; only a token wider than the whole available row may use emergency wrapping. W03A/B and W05 retain up to two Word–Definition columns, reserving more width for the left-aligned meaning. Source indices are safely inset from rounded edges (12px top/16px left for picture and desktop definition cards). On phones each source number/word shares a header above its answer. Marker placement is semantic, not universal: W01 keeps its result circle inside the answer field at left/vertical center, with no letters; W02 places its letter or replacement result circle inline to the left of the answer; W03A/B and W05 place that marker in a top row inside the field and the full-width answer on the next row. Definition fields have a modest 104px minimum height and grow with longer content. Markers keep their position on OK; there is no result-specific relocation or outside badge. Preserve content-sized wrapped choice pills, their quiet A/B/C labels, compact centered source-word prompts and all matching state semantics. W01 choices remain unnumbered.

Semantic examples have one parent instruction, body-sized semibold `Examples:`, numbered italic model paragraphs and clearly visible semibold target highlights. Numbers follow authored model order and corresponding source words. Shared spacing tokens set 20px from a task heading/instruction to its content, 8px between a heading and additional instruction, 8px from `Examples:` to its first model, and 6px between model rows. Model groups remove default paragraph margins and end with 12px padding and a subdued divider before the normal task-content gap. Suppress a duplicate response heading only when the parent already contains the identical task after its example-reading instruction. Keep unrelated task titles and original source text/IDs. The reviewed W catalog now uses `[Word N]`, `[Translation Word N]`, `[Definition Word N]`, `[Example beginning N] [Word N] [Example ending N]` and `[Clue for Word N]` placeholders. In example sentences only `[Word N]` belongs to `highlights`; the beginning/end stay normal-weight italic. Preserve stable IDs, option order, response keys, layouts and saved-response compatibility. Original reference image paths/alt text remain in non-rendered `sourceArtwork`; no course media or lesson content is replaced.

Image Label uses the actual image's intrinsic height at the chosen width. The picture owns the stage height; target buttons are absolute overlays, never normal-flow elements. Keep empty drop targets visible near the corresponding objects with a solid medium-gray contour, with stable IDs/keys, in-place result markers, drag/return/reset/keyboard and synchronized read-only behavior. Optional `options[].translation` enables a shared word—translation Correct answers list after a mistake, including every source target with its original number/outcome. Tasks without translation metadata keep the short status and target-only results. The W04 structural catalog uses pending artwork with authored dimension ratio; real images keep intrinsic sizing.

Picture dialogs retain the same 360px preferred width and 330px media frame with 12px insets, shrinking the frame first on short viewports. Outside clicks close without changing answers, alongside Close, Escape and choosing an option. Gestures starting inside do not dismiss. Preserve course IDs, answer keys, media and live synchronization.

The expanded Workspace panel adapts from 240–344px by default. Drag its right boundary or use the focused separator’s arrow/Home/End keys to set a preferred 240–480px width. Temporary viewport limits preserve working space without overwriting that preference. Keep the 64px rail and mounted exercise state. Below 960px viewport shrink closes the expanded panel. Explicit narrow menu opening occupies the remaining navigation column and hides/inerts the mounted work view; close or task selection restores it. Never overlay visible exercise content. Desktop navigation and work use separate columns; content grid ancestors use zero minimum widths so cards can wrap instead of causing horizontal clipping.

## Reviewed P, D and E catalog (2026-10-17)

P01 fills each item with `[Word N]` and `[Sentence with Word N]`; the number of word/example pairs follows the authored items list. P02 fills each line with `[Lexical chunk N]`. Keep IDs, pending recordings, sequence and transport unchanged. Discovery model lines contain bracketed beginning/target/ending fragments; only the target structure belongs to highlights. D01 uses three rule-ending options per existing gap. D03 uses structural group/sentence names; D04 and long text E matching use the approved `stacked-text` layout; short E06C word/form pairs retain `word-definition`. Practice sample text, banks, options, accepted forms and table cells are structural placeholders with the original keys and option orders. E05B retains its existing prefills and gaps. Structural placeholders replace preview content only; actual course content is unchanged and receives its registered template visuals.

The registry selects the canonical `flatControls` setting for each template in the catalog, course and homework, including compatible nested tasks. A legacy mount flag is only a fallback for unbound composition containers; a bound template profile always takes precedence. It uses the existing Words pale-gray surface, gray dashed borders and round corners without inset/hover shadows. Field width follows text; normal padding is symmetric. Compact dropdowns omit the internal index and reveal only their feedback circle after checking. Numbered sentence/table/typed fields show no hidden result gutter before checking; feedback adds its space after checking. Sorting group labels are regular-weight muted text. W/P/R retain their approved profile settings; course content uses the same profiles rather than a gallery-only appearance branch.

All headings/body/controls retain typography.css native system family. An empty editor focus removes an authored spelling cue, then refreshes layout and its native empty selection on the next animation frame; this also applies without a cue. Skip the refresh after blur, typing, disposal or for read-only views. Do not change response values or move selections in nonempty text.

## Screenshot refinements: matching, Writing and Listening

Picture matching uses the existing equal-height grid cards with nonshrinking media frames and flex-growing answer slots. Thus every dashed answer field uses the largest label height, keeping media and input geometry stable. The 44px minimum and artwork containment stay intact.

Writing may opt into `layout:'inline'`. Put its prompt and native field on one wrapping row; use the shared compact native editor, growing with its authored cue and entered text. E12/E13 use this layout; E12's mechanic instruction is `Write the correct form.`. On narrow screens move a whole field down rather than squeezing text.

The reviewed E11 explicitly supplies `items[].possibleAnswers`, `showAuthoredSamples:true` and `revealPossibleAnswers:true`. Only this author opt-in enables Writing samples after checking a nonempty response; the existing Possible answers disclosure starts open. Samples do not become accepted keys or semantic grades. Editing clears the feedback, and read-only checked hydration restores it. Other open/personal Writing retains Well done only.

Listening uses one primary task heading, a normal-size instruction in the same text color, its player, then response controls. Move an existing interaction instruction above the audio and hide duplicate generic prompts; retain meaningful question stems. The audio child shares the parent title so the shared duplicate-heading rule suppresses Recording. Keep source recordings, transcripts, IDs and question sequence. Registered L/T/Q/S controls in previews and real lessons reuse the same flat skin as D/E; their player frames and progression controls have no raised/inset shadows. The approved shared contour player and its transport remain unchanged by template binding.


## Reviewed catalog continuation (2026-10-17 evening)

Use Matching `stacked-text` for long premises or sentence/chunk halves: source number, full-width prompt, then full-width answer. Short word/definition pairs retain their established side-by-side layout. `audio-picture` keeps each distinct clip beside its own label and places the answer below; only this layout has a two-column image-selection dialog that fits square media to the viewport. Both reuse the unchanged Matching keys, move/reset rules and remote/read-only controls. A shared ResizeObserver computes the largest natural answer-label height without compressing artwork; badges stay in normal flow at 16px with an 8px text gap.

Reviewed controls retain their pale surface, line height and vertical padding after checking. The result adds only horizontal marker room. Native Writing `transformationArrow:true` adds a noninteractive right arrow between the prompt and response. E05A/E12 use `answerSize:'word'`; E13 keeps sentence-sized fields that grow and wrap. E12's instruction is `Write the correct form.`. Native input focus uses one quiet contour at the existing edge. Typed gap widths include the original cue even while focus hides its text; remote restoration uses the same sizing function. Use explicit native font longhands and `line-height:normal` for typed input metrics.

The reviewed L/T catalog keeps its code/mechanic relationships from the source catalog while substituting structural content and pending images/recordings; original artwork paths are author metadata. L01/T01 retain Choice keys but use numbered inline dropdowns for True/False, without automatic per-question sequencing. Q02 contains generic dropdown sentence completion; its source-catalog retelling purpose is an optional separately authored follow-up in `optionalFollowUp`, not a fixed story or tense. Ordered images remain square, fully contained, with labels below; their correction list has separate numbered captions. Image-label optional `label`, `labelX`, `labelY` place noninteractive region letters independently of answer target coordinates.

Main headings use the existing title scale. Optional mechanic instructions use 15px normal text at the 16px base, slightly softer charcoal; do not add a redundant instruction. Sidebar descriptions use the same 16px native body scale. S catalog content is structural `[Task]`, `[Situation]`, `[Word N]`, `[Lexical chunk N]`, with `[Image]` in the catalog's pending image slot. Actual course pending Speaking artwork remains hidden. W/P/R data and actual course definitions are preserved.

The shared audio player retains its native audio element, stable playback keys, seek, replay and live teacher transport. Its layered contour graphic is decorative; only the lavender clip follows actual playback time. Keep it lower in height, gray before playback, lavender through the heard portion even when paused. Do not generate replacement recordings or label this motif as measured waveform data.

## Functional size contract and reviewed Rules (2026-10-18)

This supersedes earlier compact field sizes and the earlier unreviewed R catalog content, while preserving the centered 704px working column and W01 geometry.

| Function | Shared presentation |
| --- | --- |
| Short dropdown, typed gap, inline word Writing | 32px high; compact symmetric padding; width follows cue/entered text from 6ch; no internal dropdown ordinal |
| Inline sentence Writing | Same initial compact native editor; grows in width, then wraps and grows in height instead of hiding text horizontally |
| Text Multiple Select | 14px square controls matching round text options; check only answer options, keep the question number; instruction uses ALL |
| Image Multiple Select | 20px square controls; same compact feedback contour |
| Long Matching | Prompt above answer; up to 3 desktop / 2 phone columns; reserve all authored options before selection, at least 84px |
| Word–Definition Matching | Existing orientation and 104px answer minimum; reserve the largest authored definition |
| Order/Sort tokens | 32px compact chip family; stable surface/height after OK; contents-sized wrapping tray with 28px corners |
| True/False and short response rows | 12px row gap, retaining external source numbering |

Typed gaps and Writing use the same native response editor builder and font metrics. A cue stays part of width sizing while hidden on focus; local edits and remote hydration resize the existing element without rewriting its saved response. Inline sentence fields use a one-row native textarea with measured height; explicit multiline writing retains its separate function. E06D/E06E picture-to-sentence Matching reserves its answer space through answerSize:'sentence'; unflagged W01 remains unchanged. E06C short-word orientation is preserved. Pending Order media clears its former 180px minimum, so both pending and real art are square and fully contained, with number/art/caption in three rows.

R01–R04 are structural templates matching the Rules PDF and Exercise Catalog: connected explanation and models; parallel meaning contrasts; a construction formula; functional phrase groups. Bracketed context, target and ending slots are separate, and only the target construction is bold. An informational rule page wraps its complete content in one pale #F7F7F8 panel with a faint 1px dashed gray border and strong 32px rounding (28px on narrow screens); a nested rule block does not repeat the frame. Standalone rule blocks inside an interactive Discovery task use the same panel style. Keep original kinds, IDs and block structures. No Possible answers section belongs to these rules. The approved contour audio player, recording keys and playback/synchronization behavior are unchanged.

## Shared Rule emphasis (2026-10-18)

Rule text and formulas use the same native font as the rest of the exercise. Existing `highlights` become dark semibold targets with small, rounded neutral backgrounds in explanation/formula text. The common renderer also marks exact `if-part` / `result-part` labels, and distinguishes canonical condition fragments (`had / hadn’t + V3`, pale green) from result fragments (`would / wouldn’t have + V3`, pale yellow). Other targets use the neutral surface; ordinary occurrences of had/would are not automatically highlighted. Formula backgrounds are subtle and rounded, with natural word wrapping rather than a fixed-width or monospaced display. Palettes live in `exercise-theme.css` with dark-theme counterparts.

Model sentences keep their existing italic layout and target-only bold emphasis, without the new background fills. All bold uses the primary text color and the same 650 emphasis weight; body size/family, content, IDs, answers and progression are unchanged. This shared rendering applies to catalog Rules, course Rules and homework; do not add per-lesson visual copies or use the teaching highlight colors for answer feedback.
