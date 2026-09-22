# Sidebar reference checkpoint — 2026-09-22

Reference: user screenshot 76247ce1-2d2f-4f37-9525-ffacbf28b796.png, visible in conversation. No browser used.

Base: 8dd6e9d; reconciled with 5a5c1a7 (concurrent outline tests), includes the other chat's A1.1/A1.2 Whale titles and catalog-only topics. workspace-catalog.js and all lesson definitions/assets are NOT edited by this change.

## Implemented structure
- Header context row links to schedule. No fabricated pupil name/date: shows “Свободное занятие · ученик не выбран” until actual session integration exists.
- One native select with level optgroups and real Whale titles replaces separate controls. Unassigned lessons and template examples remain options, inside this Workspace.
- White rounded topic accordions, subsection tabs Tasks / Language input / Self study, Stage cards. Multiple topics can be expanded; collapse does not reset the current exercise.
- Active Stage can expand teacher guidance. Task Guide toggle hides/shows it without remounting the exercise. Uses optional stage.guide.aim/tl/say/time; Say falls back to the existing exercise instruction. No invented target language/timing.
- Optional stage.section = tasks | language | self-study drives subsection placement; existing stages default to tasks. Empty sections clearly report no materials, without fabricated exercises.
- Bottom Class / Library / Self Study navigation and edit/account icons, then Home / Task Guide / Start lesson. Only topic list scrolls; sidebar background/artwork retained. Shared learning-space.css (560px) untouched.
- Add to class stores topic IDs within sessionStorage. Class shows those topics across the catalog; Start lesson opens the selected ready lesson in Class. This does not start a server session, charge lessons, enable video or establish live sync. Outline-only topics cannot be added/started.
- Answers still persist per exercise within the current tab, with changed-definition invalidation. Sidebar-only toggles do not destroy/restart the mounted exercise/audio.
- Default ordinary entry now opens A1.1 Whale 1. Existing unassigned/template deep links still work.

## Verification
33 Node tests pass: catalog placement, outlines, dropdown titles, accordion/guide behavior, local Class, empty subsections, deep links/Back, answer persistence, shared host and existing exercise validation. Tests use a minimal DOM adapter; visual/native-dropdown/browser behavior is not browser-verified. JS syntax and diff checks pass.

## Parallel work boundary
This change edits classroom.html, workspace.js, workspace.css, tests/workspace.test.cjs and this checkpoint. Other chats can update course titles/outlines in workspace-catalog.js and lesson definitions. Fetch main before each change; if a concurrent change also touches the controller/shell, reconcile it explicitly before merging. No automatic awareness of another chat's uncommitted work.

Next: user screenshot review; supply real section metadata/guides when content is ready. Live session context integration remains separate work.
