# Exercise template system — checkpoint 1

## Scope / current priority

Reusable exercise components, not a new course or a tomorrow-only lesson. Content is data; layout and interaction are shared code. Preserve existing classroom background/sidebar work. Do not add payments, scheduling or live-session dependencies to template preview.

Reference: user-supplied `А2 ЦЕЛИКОМ(3).pdf`, 88 screenshot pages. All pages overviewed visually; representative interaction pages examined individually. PDF has no text layer or runnable interactions. Page numbers below refer to PDF pages, not exercise numbers. Some pages show a continuation or an open state of the same exercise.

## Observed template families

| Family | PDF evidence | Content fields | Interaction |
| --- | --- | --- | --- |
| Inline text gaps | 1, 11, 16, 29, 70, 72, 84 | Text segments interleaved with stable gap IDs; accepted answers; optional bank | Input inside sentence; multiple gaps supported |
| Inline choice gaps | 10, 17–21, 32, 37, 45, 50, 55, 56, 63, 66, 74, 79 | Sentence segments; options per gap | Clicking a gap opens a local menu, not a permanent options block |
| Single choice | 5, 23–24, 30–31, 48, 80, 84–86 | Prompt, options (text or image), correct ID | One selected answer per question |
| Card matching | 6, 35–36, 39, 43, 53, 69, 77 | Prompt cards (text/image), answer cards, correct pair IDs | Click plus on a card → modal with that prompt and available answers → selection appears in card |
| Image labels | 22, 28, 35, 68, 87 | Image, percentage-positioned targets, word bank | Label placement onto targets; actual drag mechanics cannot be proved from stills alone |
| Sorting into groups | 9, 48–49, 57, 61 | Groups, item bank, expected group per item | Assign words/sentences to groups; return/reassign items |
| Ordering | 15, 58 | Stable token IDs, shuffled bank, expected sequence | Build order from words/chunks or pictures; remove/reorder/reset |
| Open writing | 25, 67 | Prompts and free-text fields | Teacher-reviewed answer; no invented automatic correctness |
| Audio | 7, 17, 33, 40, 44, 54, 62, 65, 71, 73, 78, 80 | Audio asset, optional text/transcript | Play actual supplied audio. Screenshots contain no usable audio files |
| Presentation / speaking / reading | 3–4, 8, 12–14, 26–27, 34, 38, 41–42, 46–47, 51–52, 59–60, 64, 75–76, 81–83, 85, 88 | Text, image, questions, examples, optional disclosure | Compose content without forcing every block into an automatically marked question |

## Important distinctions

- Matching modal visible on pp. 6, 39, 53 is a transient state; underlying cards remain the exercise. Default state is closed. Close on selection, close button or Escape; return focus to trigger. Exact animation, outside-click behavior and answer-reuse rules are not established by still images.
- Inline choice menu on p. 10 is different from the matching modal. Keep menu near the active gap. Selecting an option updates only that gap.
- PDF contains platform chrome (browser tabs, taskbar, course-switch banner, classroom presence/call controls). Do not reproduce it as lesson content.
- PDF's left-hand Aim / TL / Say / Tip / Time material is teacher guidance, separate from learner-facing exercise text. Hidden by default in presentation mode.
- A numbered stage may contain several blocks (image + listening + choice); preserve ordered blocks within a stage. Do not turn every screenshot into a separate lesson.
- A static screenshot does not establish grading timing, persistence, realtime or audio synchronization. Implementations must state their chosen behavior explicitly.

## User format aliases

- Лисичка → single-choice questions, normally four questions/three options; inline selection and options below are presentation variants, not interchangeable without instruction.
- Беленький Зайка → gaps with a separately shuffled word bank.
- Серенький Зайка → typed gaps without a word bank.
- Медведь → reading/dialogue/audio with ordered comprehension sub-blocks.
- Speaking / Сова variants → presentation and/or writing layouts; further source-specific mapping required before exact visual implementation.
- Current user request authorizes using PDF mechanics as the web reference. Miro-specific pixel coordinates and fonts are not silently treated as web requirements.

## Architecture contract

- A versioned lesson has stable IDs, metadata and ordered stages/blocks. A block declares its template kind and content; never embeds arbitrary executable HTML.
- Shared renderer dispatches by kind; shared scoped CSS tokens define typography, gaps, control sizes and card styles.
- Attempt state is separate from immutable exercise definition. Preview attempts never modify course content or real student records.
- JSON/structured input is validated before render/import. Ambiguous plain-text blanks or missing answer keys are reported, not silently guessed.
- Check/reset are chosen MVP controls, not verified replicas of the source platform. Correct/try-again/unfinished feedback uses text and neutral styling.
- No authored content, answer keys, personal data or PDF screenshots are published as demo assets without a deliberate publication decision. Public gallery contains only clearly labelled original synthetic fixtures.

## Implementation stages

1. Save reference catalog (this document).
2. Build reusable gallery and first primitives: matching modal, inline choices, typed gaps, single choice.
3. Add ordering/group sorting and content blocks; test attempts survive switching and reset is local to one exercise.
4. Add image targets and real audio when appropriate assets are supplied. Do not fake a player from a screenshot.
5. Connect validated lesson import and classroom rendering using the same components. Student/live integration is a separate stage.

## Acceptance checklist

- Matching popup absent at initial load; opens only after relevant plus button; selection affects the correct card.
- Choices work with mouse and keyboard; changing an answer clears stale feedback.
- Gaps are inside text, can occur multiple times in one sentence, and do not reveal answer length.
- Reset restores initial attempt, without modifying source data or another exercise.
- Changing a shared font/spacing setting affects all compatible templates.
- Missing keys are reported as ungraded, not incorrect; free writing is teacher-reviewed.
- Layout works at desktop and phone widths; no clipping of long options.
- Imported text is rendered as text, never executed as HTML.

Status: reference catalog saved; no claim that every family or import/live integration is implemented.
