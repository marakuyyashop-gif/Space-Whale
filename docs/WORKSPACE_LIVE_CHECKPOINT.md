# Live Workspace checkpoint

Implementation in progress, base 115ed6b. User authorized realtime within classroom.html/workspace.js/exercise-kit, reuse classroom-realtime.js, no parallel classroom. No browser.

Existing code has private Broadcast/Presence but redirects session links to legacy page, debounces database drafts at 120ms, and has no ordered Workspace-state recovery. Plan: eliminate redirect, use authenticated role-specific Broadcast channels with participant RLS, immediate field changes, teacher-owned navigation, periodic versioned snapshots plus peer recovery, session-scoped local pending data. Never use database as per-keystroke transport. Preserve standalone content mode and sidebar/catalog.

Verify: deterministic two-client transport simulation, out-of-order/duplicate messages, peer and database recovery, offline pending changes, no feedback loop, session isolation and server policies. Report actual live verification limits honestly. Do not change content or curriculum.
