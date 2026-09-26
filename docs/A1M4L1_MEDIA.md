# A1.2 · Part 4 · Lesson 1 — Как выглядит эта вещь?

The owner deliberately replaces lesson one with this lesson. Lesson two remains unchanged until a later revision. Runtime lesson ID stays `a1-2-w4-l1`. The ten submitted steps replace the previous lesson's tasks and homework; the target duration is 29 minutes.

## Connecting assets

The sole runtime slot registry is `lesson1Media` in `course-content.js`, exposed as `SpaceWhaleLessonMedia['a1-2-w4-l1']` for inspection. Fill the corresponding `src` with the uploaded asset path. All occurrences use the registry helper, so image replacements do not change answer keys, item IDs, or option order. No real or fabricated URLs are assigned while assets are pending.

For one sheet containing the six objects, give its URL to all six entries and add each entry's `crop: {x,y,w,h}` in percentages. Separate images require only `src`. Use `alt` for the finished asset. The existing engine handles cropping and pending placeholders; final image dimensions/layout will be reviewed after the actual assets arrive.

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

Each Listen & Repeat recording contains the word followed by its sentence, in one file/Play action. The existing phrase navigation presents one complete item at a time. No test tones or generated speech are inserted.

| Slot | Recording |
|---|---|
| `A1M4L1_WORD_01` | coat. I need a coat for work. |
| `A1M4L1_WORD_02` | sweater. My sweater is in the wardrobe. |
| `A1M4L1_WORD_03` | blouse. My sister wants this blouse. |
| `A1M4L1_WORD_04` | skirt. I like this skirt. |
| `A1M4L1_WORD_05` | suit. My father has a suit for work. |
| `A1M4L1_WORD_06` | hat. I like your hat. |
| `A1M4L1_AUDIO_01` | The complete Anna–Ben dialogue stored in the registry's `script` field |

## Interaction contract

- Ten normal lesson steps, using the existing Workspace and exercise-kit.
- Step 6: source and first response visible together; two following questions open with the existing arrows. Audio remains mounted throughout.
- The transcript's disclosure is unavailable until all three questions have a non-empty submitted response (OK), regardless of correctness. Skip/empty responses do not unlock it. Editing/resetting an answer hides it again; restored checked state restores availability. Unlocking does not automatically expand the script.
- Step 7: Matching first, the authored rule opens with the existing reveal arrow.
- Step 9 is ungraded open writing. `possibleAnswers` display only after OK; alternative formulations are not marked incorrect. The owner explicitly asked to retain “Is this your coat?” pending visual review; revisit that prompt after publishing.
- Step 1/10 Useful phrases begin closed. Speaking has no automatic correctness check.
- Source/gap/choice images reuse the existing illustration renderer. No CSS or image sizing adjustments accompany this content revision.
