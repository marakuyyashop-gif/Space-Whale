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
