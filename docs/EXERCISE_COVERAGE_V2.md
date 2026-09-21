# Exercise coverage registry v2 — current scope

Status: analysis checkpoint only. No exercise renderer code changed in this checkpoint.

## Purpose

This document separates:
1. mechanics already implemented by Astra in the shared exercise kit,
2. mechanics present in the 88-page PDF audit but not yet represented as approved gallery templates,
3. future ideas that are useful but deliberately outside the current lesson-template scope.

The current priority is reusable lesson mechanics and visual consistency. Do not divert into payments, subscriptions, account flows, video, realtime collaboration, or full classroom integration while this registry is being completed.

## Existing shared primitives in main

Current renderer kinds in `exercise-kit.js`:
- `matching`
- `gaps`
- `choice`
- `order`
- `sort`
- `writing`
- `presentation`

Current gallery fixtures:
1. matching cards with + modal
2. inline choice inside text
3. typed gaps (Серенький Зайка)
4. word-bank gaps (Беленький Зайка)
5. single-choice questions (Лисичка)
6. sentence ordering
7. sorting into groups
8. free writing
9. presentation + disclosure

Architecture to preserve:
- lesson content is structured data;
- exercise markup is rendered by shared code;
- exercise CSS is shared and tokenized;
- attempt state is separate from immutable exercise definition;
- no arbitrary executable HTML inside lesson content;
- gallery is an isolated host/preview, not a separate implementation of each template.

## Coverage matrix from Astra's 88-page PDF audit

| PDF family / behavior | Evidence recorded in Astra audit | Existing primitive | Gallery coverage | Status | Next action |
| --- | --- | --- | --- | --- | --- |
| Typed inline gaps | pp. 1, 11, 16, 29, 70, 72, 84 | gaps | Yes | IMPLEMENTED | Keep |
| Word-bank gaps | same gap family + user alias | gaps | Yes | IMPLEMENTED | Improve bank interaction later if required |
| Inline choice gaps | pp. 10, 17–21, 32, 37, 45, 50, 55, 56, 63, 66, 74, 79 | gaps + options | Yes | IMPLEMENTED | Compare popup/menu visual against reference |
| Single choice | pp. 5, 23–24, 30–31, 48, 80, 84–86 | choice | Yes | IMPLEMENTED | Add image-option and compact visual variants |
| Matching cards with transient popup | pp. 6, 35–36, 39, 43, 53, 69, 77 | matching | Yes | IMPLEMENTED | Keep transient; never render modal permanently |
| Sorting into groups | pp. 9, 48–49, 57, 61 | sort | Yes | IMPLEMENTED | Decide later whether drag is worth adding |
| Ordering words/chunks | pp. 15, 58 | order | Yes | IMPLEMENTED | Add picture-order variant |
| Open writing | pp. 25, 67 | writing | Yes | IMPLEMENTED | Keep teacher-reviewed |
| Presentation / reading / speaking | pp. 3–4, 8, 12–14, 26–27, 34, 38, 41–42, 46–47, 51–52, 59–60, 64, 75–76, 81–83, 85, 88 | presentation | Partial | PARTIAL | Split into approved pedagogical templates rather than one generic block |
| Image labels / targets | pp. 22, 28, 35, 68, 87 | image-label | Yes | IMPLEMENTED | Review interaction and sizing with user |
| Picture ordering | PDF p. 15 shows visual activity cards ordered after reading | order + image-grid layout | Yes | IMPLEMENTED | Review compact card sizing with user |
| Image-based selection | present in single-choice/image tasks | choice + image-grid layout | Yes | IMPLEMENTED | Review compact card sizing with user |
| Multi-select / choose several | visible in image/selection tasks; not represented by radio-only choice | none | No | MISSING | Add multi-choice primitive or explicit mode |
| Audio player | pp. 7, 17, 33, 40, 44, 54, 62, 65, 71, 73, 78, 80 | audio | Yes | IMPLEMENTED | Reuse player in later composite listening stages |
| Audio + choice | multiple PDF stages combine audio and response | composite stage | No | MISSING | Compose audio block + choice block in one stage |
| Audio + gaps | multiple PDF stages combine listening and gaps | composite stage | No | MISSING | Compose audio block + gaps block |
| Listen & Repeat | source-specific format + PDF example around p. 36 | audio + listen-repeat layout | Yes | IMPLEMENTED | Review typography and final production audio hosting |
| Picture–word / picture–definition vocabulary | existing Sources format | matching / presentation can support data | No exact approved web template | PARTIAL | Build approved vocabulary template |
| Rule / discovery block | Sources / Сова formats | presentation currently too generic | No exact approved template | PARTIAL | Build dedicated rule/discovery template variants |
| Dialogue / Медведь | Sources format | presentation/writing primitives usable | No exact approved template | PARTIAL | Build pedagogical template using shared primitives |
| Speaking scenes | Sources format | presentation + optional writing | No exact approved template | PARTIAL | Build speaking template; retain image layout rules |
| Composite stage: media + prompt + interaction | recurring PDF structure | primitives exist separately | No stage container yet | MISSING | Define stage schema that can hold ordered blocks |

## Important rule: primitive != pedagogical template

Examples:
- `choice` is a primitive.
- `Лисичка` is a pedagogical template with fixed defaults and presentation rules.
- `gaps` is a primitive.
- `Беленький Зайка` and `Серенький Зайка` are two pedagogical templates built on it.
- `presentation` is a primitive.
- `Speaking`, `Rule`, `Listen & Repeat`, `Медведь` are higher-level templates with their own layout contracts.

Do not duplicate renderer logic merely to create aliases. Prefer template presets/configuration over new primitive kinds when mechanics are identical.

## Things from the PDF that are NOT lesson templates

Never reproduce as authored lesson content:
- browser chrome;
- taskbar;
- module-current banners;
- “student has not joined” / presence chrome;
- call controls;
- teacher-only Aim / TL / Say / Tip / Time unless explicitly rendered in a teacher-only panel.

Transient UI in screenshots must stay transient:
- matching modal appears only after + is clicked;
- inline choice menu appears only when its gap is activated.

## Work order from this checkpoint

### Phase A — finish gallery coverage before Workspace integration
1. multi-select / choose several (only if a clear source case requires it)
2. vocabulary picture-word / picture-definition template
6. rule/discovery template
7. speaking template
8. dialogue / Медведь template
9. composite stage schema

Each change should be small, testable, and preserve the existing `exercise-kit` API unless a versioned extension is required.

### Phase B — only after user approves gallery
- define versioned lesson container: level → module → topic → way → ordered stages/blocks;
- validated authored-content import;
- render the SAME components inside Library/Workspace;
- do not copy gallery markup into Classroom.

## Deferred ideas — preserve for later, do not implement now

### Whiteboard
Two viable routes:
1. Miro Live Embed in an iframe for a board-based workspace.
2. Native lightweight whiteboard for pen/text/basic shapes.

Miro is an external product dependency and has access/authentication implications. Native whiteboard gives more control but requires collaborative drawing/state work if realtime sharing is desired. Decide only after lesson-template engine is stable.

### Click-to-dictionary
Future flow:
word click → dictionary popover → definition / translation / pronunciation / audio → optional Add to vocabulary.

Possible implementation can use an external dictionary/translation API, so definitions do not need to be authored manually for every word. Exact provider, licensing, caching and language pair should be selected later. Do not hard-code dictionary data into exercise templates now.
