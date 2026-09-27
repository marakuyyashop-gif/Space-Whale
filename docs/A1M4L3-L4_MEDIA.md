# A1.2 Module 4 — Lessons 3–4

Content source: author's WORK message. New definitions: `course-content-module4-34.js`.
Existing Lessons 1–2 are not modified. Both lessons have 11 stable milestone IDs (`L3-M01`…`L3-M11`, `L4-M01`…`L4-M11`).

## Selected images and pending audio

Fill `window.SpaceWhaleLessonMedia['a1-2-w4-l3']` / `['a1-2-w4-l4']` slots in the content file (or provide overrides before it loads). Add real `src`, image dimensions and meaningful alt text when assets arrive. Missing files intentionally have no URL. Dialogue scripts/transcripts must come from the author; none has been invented.

- `L1_SPEAKING_REUSE`: existing Lesson 1 shared clothes composition, reused without modification.
- `L3_IMG_01` scarf; `02` belt; `03` gloves; `04` cap; `05` tie; `06` sunglasses. Reused by Matching, word practice and recall.
- `L3_SPEAKING`: the complete selected accessory sheet with a non-generative alpha mask, `lesson-3/media/speaking-cutout.webp` (1536 × 1024). Original upload remains `assets/lesson-media/a1-2/module-4/863e7675-68cb-4d75-ab3c-854fb1b037f4.png`.
- `L4_PEOPLE`: `lesson-4/media/people-abc.webp` (1020 × 388), used in Listening. A = original person 1 / Rosa; B = original person 3 / Ella; C = original person 2 / Nora (long curly hair, green eyes). The image only labels A/B/C, without names. Key remains C.
- `L4_SPEAKING`: `lesson-4/media/speaking-ab.webp` (680 × 388), only Rosa and Ella with the existing behavioral notes. Personality is given by words/notes, never inferred from appearance. The untouched source sheet is `assets/lesson-media/a1-2/module-4/lesson-4-people.png`.
- `L3_W01`…`L3_W06` and `L3_E01`…`L3_E06`: separate word/example clips. Exact display text and pronunciation script are taken from WORK.
- `L4_W01`…`L4_W06` and `L4_E01`…`L4_E06`: same structure.
- `L3_DIALOGUE`, `L4_DIALOGUE`: original full recordings, pending. No audio generated.
- `L3_DIALOGUE_TEXT`, `L4_DIALOGUE_TEXT`: fill `text` with the exact author-approved transcript.
- `L4_Q_PERSONALITY`, `L4_Q_APPEARANCE`: clips from `L4_DIALOGUE`, not new recordings; source times await author media. Their text slots are `L4_Q_PERSONALITY_TEXT` and `L4_Q_APPEARANCE_TEXT`.

## Reveal and review

- L3-M06: source + question 1, then question 2 after checking. L3-M09 also reveals its questions one at a time: OK/Skip → teacher arrow, with the source retained. The shared kit applies this behavior to multi-question Choice tasks following an audio source, preserving existing item IDs and saved answer keys. Shared transcript unlocks only after L3-M09 has been attempted and checked; available in M09 and on returning to M06. Missing prior state fails closed.
- L3-M07 and L4-M07: examples → one rule box → practice, using the shared progressive stage.
- L3-M08: examples → arrow → rule → arrow → Order 1 → arrow → Order 2 → arrow → Order 3. OK checks but never advances; the teacher opens each next task after checking or deliberately skipping.
- L4-M06: source, shared picture and question 1 → question 2 after checking → closed Transcript disclosure after both attempts.
- L4-M09: first audio/response pair → check → teacher arrow → second audio/response pair. No prior transcript is carried into this milestone; heard questions and an invitation to repeat become available by disclosure after both checks once their exact text is supplied.
- Writing M10: open response saved for teacher review; Possible answers is closed after OK and requires a click. No literal-match grading.
- Word recall M05: objective lexical keys, case-insensitive; accepts `a cap`, `a belt`, `a pair of sunglasses`, rejects `a sunglasses`.
- Images are attached. Audio and transcripts still await the author; no recording or full dialogue has been invented. For Nora, the recording/script/transcript must use **She has long, curly hair and green eyes.** This requirement is retained in `requiredNoraLine` on the pending dialogue and transcript slots. Nora’s visible examples, options and correction text already match. Generic examples about brown eyes remain unchanged.

The only shared kit additions are opt-in reveal stops, check-gated next steps, compact compositions, picture rows for Writing, complete choice-feedback sentences and delayed Possible answers. No new exercise kind or parallel classroom is introduced. `classroom-realtime.js` is unchanged.

## September 27 clarification

- Audio/image sources and their response form one reveal group, without Skip on the materials themselves. Separators and teacher-controlled arrows distinguish independent tasks and rules.
- `picture-rows` retains its stable layout/answer IDs but now renders a numbered strip above numbered, left-aligned response rows. Cards reuse Matching correction dimensions; no word labels appear on the pictures. This shared presentation also updates Lesson 1 steps 4–5 without modifying their content. Two coats remain together for the plural prompt. Narrow viewports scroll the strip horizontally instead of shrinking images.
- Author guidance and assessment criteria are retained in `stage.guide.teacherNotes`, not rendered as student text.
- Writing hints remain the explicitly supplied WORK text; no new answers or media have been invented.

## Selected-image processing

`scripts/crop-module4-selected-media.py` reproduces the crops from the original uploads. No generation, recoloring or resampling is used; lossless WebP retains source pixels. Accessories are cropped independently with no neighbors. People use portrait crops with complete hair, assembled in A–B–C order; shoulder-boundary cropping excludes overlapping neighbors. The two remaining people are not used.

| Slot | Item | File under `lesson-3/media/` | Source crop (left, top, right, bottom) |
|---|---|---|---|
| L3_IMG_01 | scarf | scarf.webp | 16, 24, 498, 510 |
| L3_IMG_02 | belt | belt.webp | 532, 143, 1026, 418 |
| L3_IMG_03 | gloves | gloves.webp | 1078, 32, 1494, 512 |
| L3_IMG_04 | cap | cap.webp | 19, 548, 520, 919 |
| L3_IMG_05 | tie | tie.webp | 620, 490, 931, 978 |
| L3_IMG_06 | sunglasses | sunglasses.webp | 1004, 649, 1526, 898 |

`remove-module4-speaking-background.py` creates only the Final Speaking alpha mask from the original sheet. It preserves source dimensions and visible RGB exactly after lossless encoding; pale scarf fabric is protected, the neck opening and paper shadow are excluded. Edges were inspected on light and dark backgrounds. Individual word-practice crops are unchanged.
