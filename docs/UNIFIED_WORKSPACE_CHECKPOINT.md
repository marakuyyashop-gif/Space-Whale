# Unified Workspace checkpoint — 2026-09-22

Status: implementation complete; 30 Node checks passed; ready to merge. Base e6c9d77 includes the School Fair lesson and latest typed-gap fixes from another chat.

## Canonical entry
- classroom.html is the ordinary Learning Space. Level → Whale → topic → exercise selection renders with exercise-kit inside the same host; no iframe, popup or per-lesson HTML creation.
- template-gallery.html, both lesson-draft-*.html and library.html redirect to that entry with the appropriate selection.
- Home page now links to Learning Space; teacher navigation uses it. Workspace has home/account return links.
- Existing 560px centered, left-aligned learning-space.css and sidebar artwork/background remain shared and unchanged.

## Content and navigation
- workspace-catalog.js owns levels and Whale counts: A1.1=7, A1.2=7, A2.1=8, A2.2=8.
- Both existing lessons and all 16 templates are registered as data by their existing JS files; page-specific renderers are removed.
- Exact course placement was not provided, so both lessons stay in “Уроки без Whale”. No invented lesson names or placements. To place a lesson, set its level and whale metadata; the menu derives automatically.
- New lessons use the same data structure and register via SpaceWhaleContent. Add their data script to classroom.html, not another HTML page. A file-upload UI/plain-text importer is not implemented.
- Templates are another sidebar view in the same Workspace.
- Route query records level/Whale/lesson/exercise. Back/Forward restore selections.
- Answers are isolated per lesson/exercise, survive switching and reload within this tab via sessionStorage. Changed exercise definitions invalidate saved answers. This is NOT student-account progress or live sync.

## Preserved legacy features
- classroom-session.html retains the old authenticated scheduled-session classroom and scripts; classroom.html?session=... routes there with the query intact. No session parameter redirects back to the canonical Workspace.
- library-manage.html retains authenticated personal-material management with a return link. Reachable via “Мои материалы”. Its database/script is untouched.
- All assets/content preserved. Old lesson-draft.css is unused but retained. No database/auth/payment/video changes.

## Remaining work
- Completed: 30 tests, syntax checks and git diff checks passed. Controller navigation/state is tested with a minimal DOM adapter, not a browser.
- Completed: exact data comparison with base e6c9d77 confirms all 16 templates, 5 First Day stages and 15 School Fair stages are unchanged.
- User screenshot review (browser use prohibited); no visual QA claimed.
- Get the real mapping of lesson → level → Whale; populate topics through data.
- Later migrate authenticated sessions onto the same engine, with separate access/live-sync testing. Do not remove the session compatibility path before that migration.

## Adding content without another page
1. Reuse a current lesson data file structure (id, title, level, whale, stages).
2. Each stage has menu and exercise; exercise follows exercise-kit version 1. IDs stay stable and unique within a lesson; templates support variable item counts.
3. Register the lesson in window.SpaceWhaleContent. Load its data script from classroom.html before workspace.js; do not add an HTML page or another renderer.
4. Set level to an existing ID (for example A2.1) and whale to a valid number when the owner supplies the mapping. Keep BOTH null until then.
5. Validate with node --test tests/*.test.cjs. A content change resets only that changed exercise's tab-local saved answers on reload.
6. Change common exercise dimensions in learning-space.css; do not put individual width overrides into content.

## Not claimed
No automatic text/PDF import UI; no cross-device/student-account answer storage; no live synchronization for these templates; no visual/browser acceptance. Existing scheduled-session implementation remains on its compatibility route until a dedicated migration.
