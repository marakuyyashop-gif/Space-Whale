# Shared learning layout checkpoint

User correction: the centered reading column applies to ALL exercise families, not only Fox/Rabbit. Learner UI contains the sidebar, title, instruction, learning content and appropriate Check/reset controls. No JSON editor, global font picker, developer notes or draft badges in the learner surface.

Implementation:
- `learning-space.css` owns `--learning-column-width: 560px`. Gallery, pilot lesson and legacy live classroom use the same constraint. Content is left aligned inside the centered column. Site marketing/cabinet layout is intentionally not narrowed.
- Gallery and pilot lesson use the existing site's sidebar classes/artwork and the same shared layout stylesheet. They remain different content routes served by the same exercise renderer; this does not claim backend/session integration is complete.
- Reset is ↻ with an accessible name. Feedback appears after checking; technical commentary removed.
- Matching popup options use equal-width two-column cells, including six-option banks.
- Ordering supports a source text or audio; the picture-order sample now supplies a short original reading passage before its pictures. Picture-choice also includes the missing context.
- Discovery choice children render as dropdowns while retaining the existing answer IDs/grading. Text blocks accept explicit `highlights`; matching fragments render as safe strong elements, not HTML. The gallery grammar example highlights exactly `is easy to get` and `was difficult to find`.
- Gallery Rule uses its existing image asset without the redundant rule boxes or optional-content caption.
- No browser use: syntax and Node validation/grading/fixture tests only. Visual acceptance remains with user screenshots; do not claim pixel-perfect or browser-verified behavior.

Preserve backgrounds/sidebar artwork and current pilot content. Next: user reviews all families at the shared width; then connect approved templates to the lesson publishing path. Do not start payments/account work.
