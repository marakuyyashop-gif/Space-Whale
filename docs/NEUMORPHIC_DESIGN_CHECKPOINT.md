# Neumorphic design checkpoint — 2026-09-24

Approved direction: light neutral soft UI, pronounced rounded raised panels, upper-left light, inset text fields, soft hover glow. Floating bounded sidebar is essential. Preserve the large raised next control and smaller inset collapse control. Colour is reserved for lesson imagery and answer feedback. No internal/demo commentary in student content.

Current implementation remains isolated to design-preview.html/css/js. Do not mark this as a completed global rollout.

Preview refinements: animated light/dark sliding thumb; raised empty matching selectors with inset selected answers; soft raised feedback badges and solution panel. Validation semantics remain in the shared exercise kit.

Timer: default 60 minutes, integer custom durations 1–1440. The preview remembers only the chosen duration locally, not elapsed progress. Duration locks once started until reset. Timer is not connected to an account or a live session.

Future timer integration: teacher account default; optional per-student override; optional per-session override. Resolve in order session > student > teacher > 60. Teacher controls start/pause/reset. Share authoritative start timestamp and accumulated elapsed time through existing session synchronization; reconnect must recover timer. Separate scheduled duration from topic-block lengths. Completion should notify without closing lessons or clearing answers. Account controls are not implemented yet.

Next stages: approve feedback states, move material tokens and controls to a shared theme, verify existing exercise mechanics in batches, then apply to the remaining site screens. Preserve role permissions, existing navigation, and realtime answer state during rollout.


## Shared core — 2026-09-24

Approved preview appearance now lives in `exercise-theme.css` (material/colour/motion tokens), `exercise-kit.css` (shared `.ek-modern` components), and `exercise-kit.js` (feedback and reversible disclosure motion). `classroom.html` uses it for templates and real lessons. The old design preview remains an isolated reference, not the source for future changes.

- Neutral light/dark themes, rounded fields, circular OK, matching status indicator at the top right, right chevron in the answer field, icon-only Close, compact reset.
- Choice options fit their content up to `--sw-neu-option-limit`, then wrap. Checked text is muted; inset shadows and surface differences are deliberately subtle.
- Five feedback bands, identical on local checks and remote check restoration. `feedback.showAnswers` can override defaults; picture selection/picture-word/image-label default to message-only feedback.
- Stage collapse keeps mounted responses and pauses hidden audio. Shared `kit.motion.expand` animates height for disclosures, popovers, sections and workspace topic/guide panels, cancels stale motion, and respects reduced motion. Sidebar and theme switch use CSS movement.
- Existing grading, answer formats, transport and account permissions are unchanged. The timer remains a preview feature; account duration settings are still a separate task.


## Shared sidebar — 2026-09-24

The only lesson workspace shell is `classroom.html`, styled by `workspace.css` and controlled by `workspace.js`. Home and Students retain their own pages. The dock has Home, Students, Library, Class; Class and Library switch the same sidebar without rebuilding the page.

Library hierarchy: level → Whale → topic → named stage tabs. Add/remove operates on a whole Whale, including outline-only topics. Removal never deletes catalog data or saved answers. Unassigned lessons remain addable individually. Class selection is stored per local/session scope and included in teacher navigation URLs for the learner; guest allowlists remain enforced. Empty topics show only the material placeholder, with no invented exercise sets.

A topic stage may retain `exercise` for a single unit or use `{ id, menu, title, exercises: [definition, ...] }` for a sequence. The catalog compiles sequences into the existing progressive stage component: one click selects the tab, arrows reveal/collapse units in the main area, answers use stable IDs. Existing authored lesson content is unchanged.

The compact Class clock uses the approved dial, a charcoal power button (Start/Pause/Resume), and separate reset. Duration control is hidden; default remains 60 minutes. Timer state is local to the browser/session, restored on reload, and independent of task navigation; teacher-account defaults and shared timer transport are not implemented by this UI change.
