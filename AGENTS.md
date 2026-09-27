# Space Whale project conventions

## Lesson authoring

- Source lesson drafts describe content, not literal screen layout. Underscores denote a missing word; never render them as a fake blank next to separate answer buttons.
- Do not repeat a visible word bank when all its options are already supplied by inline dropdowns. Retain banks for genuine typed recall; keep dropdown options shuffled independently from the key order.
- New oral questions, personalisation and other follow-up tasks belong to a separate presentation revealed by the teacher arrow after checking/skipping. Never put a new task inside Correct answers or feedback. Use `followUp` for a standalone response exercise (preserves flat saved answers), or an explicit next presentation in an existing sequence. Feedback may still explain an answer or a word pattern.
- Personal decision prompts must state a short, concrete situation and ask explicit questions. Avoid vague instructions such as “How else could B reply?” that make the learner reconstruct an earlier conversation. State how many situations to discuss; any Useful phrases must support those actual questions.
- In word/chunk Order, bank tokens must not reveal the first word through sentence-initial capitalization. Use lowercase chunks, preserving grammatical capitals such as I, proper names and abbreviations. `sentenceCase: true` capitalizes the learner's assembled sentence and correction, not the bank. This rule does not lowercase complete event sentences in an event-ordering task.
- A missing word inside a sentence with supplied answer choices uses `gaps` with `inputMode: 'select'`: an inline dropdown in the exact missing-word position. Single Choice is for a complete question with standalone answers. Explicit writing/Typed Input tasks keep real editable fields; do not silently turn writing practice into recognition.
- With separate picture cues, show one picture and its task together, then reveal subsequent picture/task pairs with the existing arrow. A single shared numbered illustration may instead support several visible sentences. Do not stack large unrelated picture placeholders without step separators.
- Use one task heading. Omit a redundant subtitle. Nested exercises that repeat their container heading must not display it again. Instructions may explain the actual interaction.
- After an incorrect dropdown submission, use the existing grey feedback component: complete corrected sentences, muted surrounding text, and highlighted correct answers. Two-option dropdowns still require an explanation. Keep solutions hidden until checking.
- Reveal scrolling considers the entire newly opened group. Fit it if possible; otherwise align its beginning near the viewport top, with a small margin. Preserve teacher/student view synchronization.

## Workspace

- Course keys: Module then Lesson. The compact current-level selector is beside Start/Finish. Each opens its existing selection menu.
- The lesson overview is plain information: title with completion mark, short goal/description, grammar and constructions. No lesson-number banner, selectable lesson card, repeated tags, or standalone target-word list. Never display `words` or an imported word bank there, even when included in the author draft. Use `grammar` / `constructions` explicitly; do not assume `lexis` contains constructions.
- Persistent floating notices and dialogs require a visible, keyboard-accessible close control. Dismiss the notice, not the lesson, call, or saved state. New messages may be shown again.
- Preserve approved visual tokens and current shared Workspace. Do not create a second classroom page.
- Other work may land on main concurrently. Fetch latest main, use an isolated branch/worktree, and preserve independent video/audio/live-session changes when merging.

## Shared interaction refinements

- All inline disclosures (including See the script and Useful phrases), progressive steps, rules and submitted feedback scroll their full newly visible range into view after expansion. Include next-step controls when possible. Fit the whole range when it fits; otherwise keep its beginning visible near the top. Never sacrifice the beginning to reach the end of a tall block.
- In question-and-answer Writing, keep the existing question in `items[].prompt` and its `Use:` cue in `items[].hint`, below the response field in smaller muted text, linked with `aria-describedby`. Feedback repeats only question and answer, never the hint. Both correct answers and possible answer examples use bold emphasis. A thin divider separates the feedback message from its answer section.
- In sentence/question construction Writing without a supplied question, place minimal meaning prompts separated by ` / ` in `items[].prompt`, above the response field; omit the lower `Use:` hint. Do not give complete sentences to copy or join, subject pronouns, auxiliaries, or already-inflected target verbs. Use base verbs and `not` instead of `don't/doesn't`; the learner supplies grammar, articles and subjects. Keep an explicitly targeted fixed phrase such as `I think` when needed. Example: `want / gloves / because / cold`. Keep full examples in post-attempt Possible answers, without exact-match grading. This does not convert supplied questions with hints, translation tasks, personal forms, or single-word recall into this format.
- `Use:` cues supply only the minimum missing meaning needed to answer. Do not supply a full answer or its grammatical scaffold (subject pronouns, auxiliaries, inflected target verbs, or words already recoverable from the question). Give verbs in their base form; retain essential lexical chunks, such as `chat with friends` or `look like / my old coat`. For “How does the sweater look?” use only `warm`; the learner supplies the subject and grammar. Complete examples belong only in post-submission Possible answers.
- The video dock retains preferred offsets from the nearest viewport/workspace edges. Only explicit user drag/resize or keyboard movement updates that preference. Temporary viewport, orientation, sidebar, or expanded/mini/hidden changes clamp the display without overwriting the saved preference or preferred width.
- Keep the theme utility bar completely transparent, including pseudo-elements, border, shadow and backdrop. Retain its content clearance so controls cannot cover exercises. Do not change the approved Listen & Repeat sequence unless separately requested.

## Canvas and selected text

- The top utility area and lesson share one continuous dotted canvas. Paint the texture on `.class-area`; keep `.class-content` and `.lesson-scroll` transparent in both themes. Account for the dark-theme selector specificity. Keep the scroll viewport below the actual utility controls for every role and viewport; retain a transparent, continuous canvas with no painted header strip. Automatic reveal positioning must leave the floating controls clear.
- Selected answer text uses an unpatterned surface. Do not apply the empty selector's tiled facet texture behind selected words.
- After OK, checked word/sentence answer surfaces keep their colored dot fill with a soft gradient, alongside the rounded dotted outline. The fill belongs inside the answer, not across the whole exercise; it disappears with feedback on edit/reset. Do not confuse it with the empty selector's facet texture.
- Order feedback is headed `Correct Answer` and renders the completed sentence with spaces, without directional arrows between words.

## Touch, pictures and shared classroom controls

- Inline dropdowns must remain open through touch focus changes with a null relatedTarget, commit the selected value, and expose OK for complete answers. Fit menus to visualViewport, flip upward near the bottom and scroll long menus; use the top layer where supported.
- Keep the forward reveal arrow at the same center position when the previous arrow appears to its right.
- Picture–Word objects must be fully visible in portrait cards, without a padded inner picture window. Place single task pictures at the left, at a compact size. Reserve image dimensions before load and serve optimized local assets. Do not silently remove or recolor supplied artwork backgrounds.
- Picture matching corrections show each incorrect picture with its correct word; allow horizontal touch scroll and explicit previous/next buttons.
- Explicit teacher video minimization sends a one-time minimize event. Learners can independently resize or expand afterwards; viewport changes must not resend it.
- Invitation creation acknowledges the click immediately. Clipboard permission cannot indefinitely delay navigation into an already-created room; keep server room revocation before issuing a replacement invitation.

- Image selection dialogs fit their picture’s intrinsic proportions. Do not force a square or landscape picture panel around portrait art, or leave a blank side strip. Keep answer button sizing unchanged when the dialog adapts.

- Selection dialogs use a small close control at the top edge, outside content flow. Fit the full prompt and answer choices to visualViewport: shrink the image first, then tighten content only when needed. Refit after image load and orientation/viewport changes.
- In live lessons learners see the audio player, waveform and synchronized progress but cannot play, pause or seek. Enforce this in nested exercise controls as well as shared audio transport. Keep remote teacher playback and the browser audio-permission recovery button operational.
- Submitted feedback must reveal its full ending and the adjacent next-step arrow with 48px of bottom clearance, including feedback arriving through shared answers. For feedback taller than the viewport, prioritize its end; newly opened exercise/rule content still prioritizes its beginning. Measure after parent layout updates, and do not scroll again for identical synchronized snapshots or across another visible task.

- A1.2 Module 4 picture-based word practice uses one compact exercise: a numbered picture strip at Matching correction-card size, then numbered left-aligned response rows. Keep every item of that task together with one shared check button. Retain `picture-rows` layout/answer IDs for compatibility; no tiny thumbnail beside each sentence. Lesson 1 keeps two copies of the existing coat picture for “These … are new.” Speaking questions go below the image; Useful phrases start open, Possible answers start closed. Language Focus reveals one multiline rule block.

- Independent tasks and grammar rules reveal only through teacher arrows. In L3-M08, examples, the rule and each Order question are separate reveal steps; never reveal all Order questions at once. OK checks the current task, without advancing automatically. A source plus its current question belongs to one group and must not acquire separate Skip controls. Compact related sentences inside one task remain together.

- Existing lesson artwork must not be regenerated to remove backgrounds. Use the original uploaded pixels with an alpha mask, preserving colors and texture; inspect edges on light and dark backgrounds. Generative variants from the rejected Lesson 1 background-removal attempt must not be reused.

- Picture-based Writing with objective accepted answers uses the same incorrect-picture correction cards as Picture–Word Matching. Keep open-response samples separate and hidden until requested.
- Sentence/Chunk Order checks each placed token’s position and applies the shared correct/incorrect dotted outline around that token’s rounded rectangle, never around the full answer tray. Clear marks on edit/reset; respect accepted alternative orders.
- Multiple Choice questions tied to one audio source reveal individually using teacher arrows after checking or skipping. Keep the player available, preserve flat item answer IDs, and synchronize reveal separately from answers. Ordinary compact grammar Choice tasks without audio stay together.
- Writing uses `items[].multiline: true` for a short message/story; it is an opt-in textarea within the same Writing renderer and answer synchronization. Keep single-word and short sentence fields unchanged. Oral samples can be a separate teacher-revealed presentation containing a closed Possible answers disclosure; do not require an OK for an informational or oral block.
