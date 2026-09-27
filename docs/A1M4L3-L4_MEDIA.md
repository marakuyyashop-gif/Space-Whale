# A1.2 Module 4 — Lessons 3–4

Content source: author's WORK message. New definitions: `course-content-module4-34.js`.
Existing Lessons 1–2 are not modified. Both lessons have 11 stable milestone IDs (`L3-M01`…`L3-M11`, `L4-M01`…`L4-M11`).

## Future media attachment

Fill `window.SpaceWhaleLessonMedia['a1-2-w4-l3']` / `['a1-2-w4-l4']` slots in the content file (or provide overrides before it loads). Add real `src`, image dimensions and meaningful alt text when assets arrive. Missing files intentionally have no URL. Dialogue scripts/transcripts must come from the author; none has been invented.

- `L1_SPEAKING_REUSE`: existing Lesson 1 shared clothes composition, reused without modification.
- `L3_IMG_01` scarf; `02` belt; `03` gloves; `04` cap; `05` tie; `06` sunglasses. Reused by Matching, word practice and recall.
- `L3_SPEAKING`: one shared final-speaking composition, pending.
- `L4_PEOPLE`: one A/B/C composition, pending. A = Rosa, B = Ella, C = Nora (long curly hair, brown eyes). Used in Listening and Final Speaking; personality is given by words/notes, never inferred from the picture.
- `L3_W01`…`L3_W06` and `L3_E01`…`L3_E06`: separate word/example clips. Exact display text and pronunciation script are taken from WORK.
- `L4_W01`…`L4_W06` and `L4_E01`…`L4_E06`: same structure.
- `L3_DIALOGUE`, `L4_DIALOGUE`: original full recordings, pending. No audio generated.
- `L3_DIALOGUE_TEXT`, `L4_DIALOGUE_TEXT`: fill `text` with the exact author-approved transcript.
- `L4_Q_PERSONALITY`, `L4_Q_APPEARANCE`: clips from `L4_DIALOGUE`, not new recordings; source times await author media. Their text slots are `L4_Q_PERSONALITY_TEXT` and `L4_Q_APPEARANCE_TEXT`.

## Reveal and review

- L3-M06: source + question 1, then question 2 after checking. Shared transcript unlocks only after L3-M09 has been attempted and checked; available in M09 and on returning to M06. Missing prior state fails closed.
- L3-M07 and L4-M07: examples → one rule box → practice, using the shared progressive stage.
- L3-M08: examples → arrow → rule → arrow → Order 1 → arrow → Order 2 → arrow → Order 3. OK checks but never advances; the teacher opens each next task after checking or deliberately skipping.
- L4-M06: source, shared picture and question 1 → question 2 after checking → closed Transcript disclosure after both attempts.
- L4-M09: first audio/response pair → check → teacher arrow → second audio/response pair. No prior transcript is carried into this milestone; heard questions and an invitation to repeat become available by disclosure after both checks once their exact text is supplied.
- Writing M10: open response saved for teacher review; Possible answers is closed after OK and requires a click. No literal-match grading.
- Word recall M05: objective lexical keys, case-insensitive; accepts `a cap`, `a belt`, `a pair of sunglasses`, rejects `a sunglasses`.
- Pending media cannot be played/used for actual listening or visual recognition yet. This release prepares content and mechanics, not finished media.

The only shared kit additions are opt-in reveal stops, check-gated next steps, compact compositions, picture rows for Writing, complete choice-feedback sentences and delayed Possible answers. No new exercise kind or parallel classroom is introduced. `classroom-realtime.js` is unchanged.

## September 27 clarification

- Audio/image sources and their response form one reveal group, without Skip on the materials themselves. Separators and teacher-controlled arrows distinguish independent tasks and rules.
- `picture-rows` retains its stable layout/answer IDs but now renders a numbered strip above numbered, left-aligned response rows. Cards reuse Matching correction dimensions; no word labels appear on the pictures. This shared presentation also updates Lesson 1 steps 4–5 without modifying their content. Two coats remain together for the plural prompt. Narrow viewports scroll the strip horizontally instead of shrinking images.
- Author guidance and assessment criteria are retained in `stage.guide.teacherNotes`, not rendered as student text.
- Writing hints remain the explicitly supplied WORK text; no new answers or media have been invented.
