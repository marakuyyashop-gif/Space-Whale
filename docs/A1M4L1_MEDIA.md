# A1.2 · Part 4 · Lesson 1 — Как выглядит эта вещь?

The owner deliberately replaces lesson one with this lesson. Lesson two remains unchanged until a later revision. Runtime lesson ID stays `a1-2-w4-l1`. The ten submitted steps replace the previous lesson's tasks and homework; the target duration is 29 minutes.

## Connecting assets

The sole runtime slot registry is `lesson1Media` in `course-content.js`, exposed as `SpaceWhaleLessonMedia['a1-2-w4-l1']` for inspection. Fill the corresponding `src` with the uploaded asset path. All occurrences use the registry helper, so image replacements do not change answer keys, item IDs, or option order. No real or fabricated URLs are assigned while assets are pending.

For one sheet containing the six objects, give its URL to all six entries and add each entry's `crop: {x,y,w,h}` in percentages. Separate images require only `src`. Use `alt` for the finished asset. The existing engine handles cropping and pending placeholders; final image dimensions/layout will be reviewed after the actual assets arrive.

## Uploaded images connected on 2026-09-26

The seven original GitHub attachment URLs remain in `assets/lesson-media/a1-2/module-4/lesson-1/images/README.md` as sources. Runtime uses same-size WebP copies beside that README, with dimensions in the slot registry to reserve layout space before decoding. Total transfer size is approximately 1.3 MB instead of 14.7 MB. Artwork and its original backgrounds are preserved. Their README order is: speaking composition, hat, suit, blouse, sweater, coat, skirt. Runtime slot order remains coat, sweater, blouse, skirt, suit, hat; options remain independently shuffled. The shared composition is used in both Speaking steps. Object cards are reused in Matching and picture-led choice/writing practice.

`A1M4L1_IMAGE_TWO_COATS` reuses the existing coat image twice side by side (`imageCopies: 2`); no new artwork is needed. All audio slots remain pending. Connecting these images does not change Workspace styles, dimensions, answer keys or reveal behavior.

## Image slots and visual scenarios

Primary goal: recognize and use the six clothing nouns. In closed tasks the image must distinguish the intended item from every alternative. Object images share a consistent angle and scale, with a white background, no people, labels, letters, or incidental accessories. Reuse the same object in every task.

| Slot | Target and main cues | Exclude / distinguish | Used in |
|---|---|---|---|
| `A1M4L1_IMAGE_01` | coat: a single long outer garment, thick fabric, full front opening and long sleeves | No matching trousers; clearly longer and heavier than blouse or suit jacket | 2 picture 1; 4 question 1 |
| `A1M4L1_IMAGE_02` | sweater: one knitted pullover with long sleeves and ribbed cuffs | No full button placket or suit lapels; distinct from blouse | 2 picture 2; 5 question 1 |
| `A1M4L1_IMAGE_03` | blouse: one lightweight blouse, clear neckline and soft fabric | Not knitted, not a coat; no second garment | 2 picture 3; 5 question 2 |
| `A1M4L1_IMAGE_04` | skirt: one garment extending down from a waistband, one continuous lower opening | No bodice, straps or divided trouser legs | 2 picture 4; 4 question 2 |
| `A1M4L1_IMAGE_05` | suit: matching formal jacket and trousers presented as one coordinated outfit | Both pieces fully visible; cannot be mistaken for a single coat | 2 picture 5; 4 question 3 |
| `A1M4L1_IMAGE_06` | hat: one clearly recognizable brimmed hat | No cap or scarf, no head/person | 2 picture 6; 4 question 4 |
| `A1M4L1_IMAGE_TWO_COATS` | coats: exactly two separately readable coats of the same recognizable type as image 1 | No occlusion that makes them look like one; no other clothes | 5 question 3 |
| `A1M4L1_IMAGE_SPEAKING_01` | One coherent shop display containing all six clothing types. Invite naming, preferences, descriptions and comparison with personal clothing | No people, text, price labels or separate framed cards. Warm knit and varied familiar shapes/colors support description; personal comparisons remain open | 1 and 10 |

Speaking primary goal: `It looks …`, `It looks like my …`, `How does it look?`, and a choice using `I want …`. The image supplies recognizable objects and visible qualities; it does not prescribe the learner's personal comparison. The task instruction explicitly requires a comparison. Do not assume that an item looks expensive solely because of an arbitrary decorative symbol.

`IMAGE_SET_01` in the supplied brief corresponds to the first six slots. `IMAGE_SPEAKING_01` corresponds to the prefixed speaking slot. Matching keeps picture order coat, sweater, blouse, skirt, suit, hat; the independent option order is skirt, hat, coat, suit, blouse, sweater. No position matches. Grade by IDs, never by visual array index.

## Audio slots

Listen & Repeat uses twelve separate files and reveal steps: one word, then its sentence. Only the current step is visible. `WORD_XX` holds only the word; `SENTENCE_XX` holds only its example. No test tones or generated speech are inserted.

| Slot | Recording |
|---|---|
| `A1M4L1_WORD_01` | coat |
| `A1M4L1_SENTENCE_01` | I need a coat for work. |
| `A1M4L1_WORD_02` | sweater |
| `A1M4L1_SENTENCE_02` | My sweater is in the wardrobe. |
| `A1M4L1_WORD_03` | blouse |
| `A1M4L1_SENTENCE_03` | My sister wants this blouse. |
| `A1M4L1_WORD_04` | skirt |
| `A1M4L1_SENTENCE_04` | I like this skirt. |
| `A1M4L1_WORD_05` | suit |
| `A1M4L1_SENTENCE_05` | My father has a suit for work. |
| `A1M4L1_WORD_06` | hat |
| `A1M4L1_SENTENCE_06` | I like your hat. |
| `A1M4L1_AUDIO_01` | The complete Anna–Ben dialogue stored in the registry's `script` field |

## Interaction contract

- Ten normal lesson steps, using the existing Workspace and exercise-kit.
- Step 6: source and first response visible together; two following questions open with the existing arrows. Audio remains mounted throughout.
- The transcript's disclosure is unavailable until all three questions have a non-empty submitted response (OK), regardless of correctness. Skip/empty responses do not unlock it. Editing/resetting an answer hides it again; restored checked state restores availability. Unlocking does not automatically expand the script.
- Step 7: Matching first, the authored rule opens with the existing reveal arrow.
- Step 9 is ungraded open writing. `possibleAnswers` display only after OK; alternative formulations are not marked incorrect. The owner explicitly asked to retain “Is this your coat?” pending visual review; revisit that prompt after publishing.
- Step 1/10 Useful phrases begin closed. Speaking has no automatic correctness check.
- Source/gap/choice images reuse the existing illustration renderer. No CSS or image sizing adjustments accompany this content revision.

## Picture practice revision

Steps 4 and 5 now group each existing picture slot with one sentence and reveal subsequent pairs with the shared arrow. Step 4 uses a real inline dropdown; step 5 keeps authored text entry. No additional images are required. The word bank belongs in lesson `words` metadata, not sidebar constructions.

## Shared image layout

Picture–Word cards use a portrait image area up to the answer control. Objects fit in full; there is no inner inset frame. Wrong matches show picture/answer cards in a horizontally scrollable correction strip with previous/next controls. Single picture cues are compact and left-aligned; shared speaking compositions remain larger and left-aligned.

For future asset generation, use transparent backgrounds for isolated objects (especially across light/dark themes); use a consistent portrait 4:5 canvas for object cards and landscape 4:3 for shared speaking scenes. Runtime must contain the full artwork even when supplied ratios differ. These are canvas guidelines, not permission to crop an existing object.
