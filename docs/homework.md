# Homework: issue, work, result

Each lesson template has one catalog entry with level and title. `homework.html` lists the six published A1.2 M4 packs. The Workspace Homework panel provides preview and **Выдать задание**. Every issue creates an independent attempt; no name, contacts or account form is needed.

The issued learner URL is `homework.html?work=UUID#edit=CAPABILITY&view=READ_CAPABILITY`. It opens that same attempt in another browser, not a new lesson. Answers autosave remotely and drafts also persist locally by attempt ID. Use the full issued URL to resume. Separate attempts never share answers. Old `?lesson=...` links can still start a portable attempt; old result fragments remain readable.

After all response tasks have been checked or explicitly skipped, the learner may add an optional comment and press **Домашнее задание выполнено ✓**. The controller flushes pending saves, atomically finalizes the attempt, and copies `homework.html?result=UUID#key=READ_CAPABILITY`. Clipboard failure displays the saved URL for manual copying; it never falsely announces success. There is no automated teacher notification.

The result route is a separate read-only report: compact summaries, expandable original exercises with saved answers and shared feedback, and the learner's comment. All exercises start collapsed; error counts identify what to open. No start/check/reset workflow is exposed to the reviewer. Opening the editing URL after submission also shows the result. Completed submissions are immutable, including through direct RPC requests. A new issue creates another attempt; it never replaces an old one. Links have no automatic expiry.

## Shared template and content

`homework-content.js` explicitly maps source exercises to `words`, `listenRepeat`, `practice`, `rule`, and `translation`. Matching keeps the source layout (picture, word/meaning, or translation). Complete rule blocks, including examples and highlights, are copied exactly, without summary text or a glossary. Current approved L4/L5 translations are reused; L1/L2/L3/L6 prompts come from Pasted text(20261004-084323).txt. L6 uses existing L1–L5 material for review because a separate L6 classroom body has not been published.

Known content discrepancy preserved for teacher review: the current L2 classroom content still teaches look/look like, whereas the newly approved L2 translations use intensifiers. This task does not silently rewrite the classroom rule. A future approved L2 content update should rebuild its homework template.

`homework-flow.js` composes the existing shared `stage` renderer. It does not implement another set of exercise controls. The shared mount options `repeatAll`, `allowMaterialSkip`, and `independentSteps` expose the whole Listen & Repeat list, permit material skips, and keep homework tasks independent of the audio source. Classroom defaults and live synchronization remain unchanged. Previous tasks remain visible. Informational steps permit immediate forward navigation; response tasks require OK or Skip. Progress counts completion/explicit skips rather than correctness. Collapsing a viewed step does not erase its progress.

All six packs use the same controller, stage and grading templates. Run `node scripts/build-homework-catalog.cjs --sql` to regenerate template upserts after an approved content change. Apply through the database deployment tools. Attempts snapshot the full pack, so updating a template cannot alter existing submitted work. Legacy `exercises`/`reference` fields are retained for old cached clients during rollout.

## Persistence and permissions

Private tables have RLS enabled and no anonymous/authenticated schema or table grants. Explicit, fixed-search-path SECURITY DEFINER RPCs provide the intentionally anonymous, capability-scoped API. Independent random 256-bit editing and viewing keys are hashed on the server. Keys are supplied in URL fragments and RPC bodies, never returned by reads. Anyone holding a result link may view it; only the editing capability can save or submit, and neither can change a submitted result.

Autosave serializes writes, retains local drafts on request failure, retries online, and uses row locks plus expected revision to avoid silently overwriting a different tab. Conflicting drafts are backed up locally. Submission is idempotent to support retry after a lost response. The answer object includes comment and reveal/check/skip state and is limited to 128 KiB.

The database advisor flags intentional SECURITY DEFINER endpoints and private RLS tables without policies. These are not public table access: authorization is inside the narrow functions. Never add broad policies to silence those diagnostics.

## Verification

DOM end-to-end regression: issue in a teacher context, perform matching with two intentional mistakes in a separate learner context, reveal the entire repeat list, Skip remaining tasks, add a comment, submit, copy the actual result URL, reopen in a third empty-storage context, inspect mistakes/corrections/comment, and issue another independent attempt. Also checks submitted editing URLs render reports and invalid result URLs never show blank assignments.

Shared kit regression tests preserve classroom behavior. Full suite after this change: 247 passed, 35 failed; all 35 also failed on the unchanged base. No new failures. Live anonymous RPC checks verify exact saved answers/comment, immutable submission, idempotent retry and denial of submission with a viewing key. Native visual browser verification is unavailable in this environment.

## Shared interaction repair — 2026-10-04

- `SpaceWhaleHomeworkLinks.mountIssuer` is the sole issuing/copying component for the catalog, lesson preview and Workspace. Creation is acknowledged immediately; after creation the same URL can be copied again without making another attempt. `Выдать новое задание` explicitly creates another work. Clipboard rejection keeps the URL selectable and never reports success.
- Action notices are visible at the current scroll position and have a close button. Autosave has its own status, so it cannot overwrite a copy confirmation. A failed server submission preserves the draft and permits retry; local storage quota errors do not misreport a successful server submission as failed.
- Homework progression checks the current task; changing a previous response cannot trap the learner on an audio/rule step. Completion checks every response and links to any unchecked tasks. Checking a previously skipped response clears its skip state. Already checked tasks hide Skip to prevent accidental loss of feedback.
- Reports start as a compact list with exact error counts and the comment; opening a row shows the original task, saved answers and corrections. One copy-again button remains on a reopened result. Manual link fields appear only when clipboard access fails. Submitted editing links still show the report. No result route silently creates a new assignment.
- Full rule blocks are unchanged; discovery-only instructions are removed from the rule wrapper. All translation items opt into the existing translation normalizer, accepting punctuation/typographic and contraction equivalents without loosening word, tense or meaning checks. This applies only to newly issued packs; saved work snapshots remain unchanged.
- Regression coverage completes every response in all eight published packs through actual DOM controls, including picture and text matching, dropdowns, typed gaps, choices and translations. It covers separate-context result reopening, mistakes/corrections/comment, clipboard refusal/retry, skipped work, changed earlier answers, offline retry/resume, local quota failure and asset existence. The full suite retains the same 35 pre-existing failures; no new failing test names.

The original `Clothes.png` is restored from repository history: L2 classroom crops and already-issued homework snapshots still reference it. Build validation checks every relative media URL, including root-level files. All 74 distinct remote homework recordings returned HTTP 200 during the release check.
