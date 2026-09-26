# Space Whale project conventions

## Lesson authoring

- Source lesson drafts describe content, not literal screen layout. Underscores denote a missing word; never render them as a fake blank next to separate answer buttons.
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
- Writing cues belong in `items[].hint`, below the response field in smaller muted text, linked with `aria-describedby`. Keep `prompt` as the question alone. Feedback repeats only question and answer, never the hint. Both correct answers and possible answer examples use bold emphasis. A thin divider separates the feedback message from its answer section.
- The video dock retains preferred offsets from the nearest viewport/workspace edges. Only explicit user drag/resize or keyboard movement updates that preference. Temporary viewport, orientation, sidebar, or expanded/mini/hidden changes clamp the display without overwriting the saved preference or preferred width.
- Keep the theme utility bar completely transparent, including pseudo-elements, border, shadow and backdrop. Retain its content clearance so controls cannot cover exercises. Do not change the approved Listen & Repeat sequence unless separately requested.

## Canvas and selected text

- The top utility area and lesson share one continuous dotted canvas. Paint the texture on `.class-area`; keep `.class-content` and `.lesson-scroll` transparent in both themes. Account for the dark-theme selector specificity. Keep the scroll viewport below the actual utility controls for every role and viewport; retain a transparent, continuous canvas with no painted header strip. Automatic reveal positioning must leave the floating controls clear.
- Selected answer text uses an unpatterned surface. Do not apply the empty selector's tiled facet texture behind selected words.
- Order feedback is headed `Correct Answer` and renders the completed sentence with spaces, without directional arrows between words.

## Touch, pictures and shared classroom controls

- Inline dropdowns must remain open through touch focus changes with a null relatedTarget, commit the selected value, and expose OK for complete answers. Fit menus to visualViewport, flip upward near the bottom and scroll long menus; use the top layer where supported.
- Keep the forward reveal arrow at the same center position when the previous arrow appears to its right.
- Picture–Word objects must be fully visible in portrait cards, without a padded inner picture window. Place single task pictures at the left, at a compact size. Reserve image dimensions before load and serve optimized local assets. Do not silently remove or recolor supplied artwork backgrounds.
- Picture matching corrections show each incorrect picture with its correct word; allow horizontal touch scroll and explicit previous/next buttons.
- Explicit teacher video minimization sends a one-time minimize event. Learners can independently resize or expand afterwards; viewport changes must not resend it.
- Invitation creation acknowledges the click immediately. Clipboard permission cannot indefinitely delay navigation into an already-created room; keep server room revocation before issuing a replacement invitation.

- Image selection dialogs fit their picture’s intrinsic proportions. Do not force a square or landscape picture panel around portrait art, or leave a blank side strip. Keep answer button sizing unchanged when the dialog adapts.
