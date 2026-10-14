# Shared lesson navigation blocks

Every course lesson uses the same four navigation blocks, including lessons whose approved content has not been added yet. The catalog adds these blocks automatically. Authors fill the existing exercise templates and declare their teaching roles; they do not create a separate lesson renderer or assemble a new navigation layout for each lesson.

| Number | Block ID | Title | Purpose |
| --- | --- | --- | --- |
| 1 | `opening` | Speaking | First attempt at the lesson's communicative task. |
| 2 | `words` | Discovery Words | Introduce the target words, repeat them and practise their meanings. |
| 3 | `language` | Lexis / Grammar | Context, language discovery, rules and language practice, including reading, listening and controlled production. |
| 4 | `final` | Speaking | Independent use after practice; connect the planned task to the opening attempt. |

The five pedagogical parts in the source instructions become four navigation blocks: source parts 3 and 4 share Lexis / Grammar. This combines their navigation container, not their exercise definitions or checks.

## Catalog contract

The shared catalog's `withBlocks` result exposes:

```js
blocks: [
  {id: 'opening', number: 1, title: 'Speaking', description: '…', stageIds: []},
  {id: 'words', number: 2, title: 'Discovery Words', description: '…', stageIds: []},
  {id: 'language', number: 3, title: 'Lexis / Grammar', description: '…', stageIds: []},
  {id: 'final', number: 4, title: 'Speaking', description: '…', stageIds: [], compareWith: 'opening'}
]
```

`stageIds` references existing stage exercise IDs in their original order. The blocks are navigation metadata around `lesson.stages`; they do not replace, copy, split or reorder those stages. The existing exercises, nested progressions, response IDs, media, routes and saved local/live state remain intact. Homework keeps its separate established flow.

An empty block is a container awaiting approved content. Displaying four blocks does not mean that four tasks exist, and it does not authorize generating missing exercises, vocabulary, rules or recordings. A review lesson introduces no new material: keep its existing review sequence under the appropriate block and leave other containers empty when no corresponding stage exists.

`compareWith: 'opening'` records the planning connection between the final and opening Speaking blocks. It does not regenerate either task, grade free speaking, or automatically compare learner answers. When authoring approved Speaking content, use the opening task as the reference for the final task.

## Author roles

Continue declaring explicit source roles with the existing `lesson.structure` contract from `lesson-structure.js`:

| Teaching role | Navigation block |
| --- | --- |
| `opening` | `opening` |
| `words`, `wordPractice` | `words` |
| `focus`, `practice`, `reading`, `listening` | `language` |
| `final` | `final` |

The role describes the stage's teaching purpose, not its response mechanic. A stage's explicit `role`, including one supplied by its authored structure, takes precedence over a legacy title/menu fallback. An explicit `navigationBlock` can override the broad block assignment when needed. Its value must be one of `opening`, `words`, `language` or `final`, and it belongs on the stage, outside the exercise definition:

```js
{
  menu: 'Listen & Repeat',
  navigationBlock: 'language',
  exercise: searchPhraseRepeat
}
```

Use the normal structure roles for new lessons. Use a navigation override for an intentional exception, rather than renaming an exercise or creating another renderer. If a stage's purpose is ambiguous, the author must provide an explicit role or block assignment; do not guess from `matching`, `audio`, `presentation`, `writing` or another response kind alone. Teacher notes are not a classification contract and remain hidden in the workspace.

Keep existing classroom stage order. The four-block navigation layer does not change which exercise follows which, the conditions for revealing a step, or the relationship between a source and its questions. Preserve the approved inner grouping: Words with their Listen & Repeat, related practice together, individual checked Discovery/Reading questions, compact sentence lists and mounted source text/audio.

## Cases that need semantic roles

- Vocabulary Listen & Repeat belongs to Discovery Words. A later Listen & Repeat of target constructions belongs to Lexis / Grammar. A1.2 M5 L5 already distinguishes these as `P01` in `words` and `P02` in `practice`.
- A controlled oral picture task remains language practice even when it uses the shared Speaking renderer. In A1.2 M5 L1, “Слушать и сказать” and “Сказать по картинкам” have the `listening` role; “Самостоятельное описание” has the `final` role.
- Opening and final Speaking can share the same title and task. Their explicit roles distinguish them; matching the title cannot.
- A1.2 M4 L6 declares the single nested `L6-review` stage as `practice`. Its picture-speaking prompts belong to that review sequence. Keep the complete stage in Lexis / Grammar; do not extract nested tasks or invent an opening, new words or a final task.

New and revised exercises still follow `docs/TEMPLATE_FACTORY.md` and `docs/SPEAKING_TEMPLATE.md`. The navigation contract adds no new response template or lesson-specific visual style.

## Teacher navigation rail (2026-10-14)

The teacher has one flat, rounded, 64px navigation rail. System icons, Level/Module/Lesson selectors and the four block icons form three groups separated by thin rules. Hover and focus labels appear to the right. A bottom Start/Finish icon and text countdown retain the existing invitation and live timer mechanics.

One panel replaces its contents for Levels, Modules, Lesson or learner profile. Level and module choices preserve an unselected lesson state using `selection=level|module`; `selection=none` is the empty entry state. Existing direct lesson and exercise links are unchanged. Closing the panel does not navigate or remount the task.

The Lesson panel includes a lesson selector, the concrete English goal and the four English block aims. Optional +/− controls reveal the original exercise links in normal flow. Block rows and rail icons select the first exercise; rail icons do not open or expand the panel. Stage numbers, menu chevrons, Milestone and the snake are absent. Main-area previous/next and within-exercise progression remain available.

Teacher metadata comes from `lesson-teacher-info.js`: `get(lesson)` supplies goals and aims, `levelOverview(level)` and `moduleOverview(level,module,lessons)` supply concise authored course overviews. Unknown or empty course areas receive no invented subject or grammar description. The teacher panel is hidden from learners along with the navigation rail.
