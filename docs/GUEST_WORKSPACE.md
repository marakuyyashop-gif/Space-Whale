# Guest Workspace

Teacher signs in with a teacher account, opens classroom.html and clicks «Пригласить ученицу».
This creates an empty room and opens its bearer URL. No lesson is selected beforehand.
Click «Ссылка для ученицы» to copy the URL; send it yourself. The student needs no account.
The owner chooses material inside Workspace; the student follows that navigation.
Both participants edit answers, Check and Reset. A link expires after 24 hours.

Implementation: collaboration-state.js stores per-field Lamport registers, including deletion
markers. Independent fields merge; simultaneous edits to the SAME field resolve to one whole
value (not character-level text collaboration). Supabase broadcast carries immediate updates;
a debounced RPC merges snapshots in the database. Reconnection loads that snapshot and requests
peer state. Session storage provides an additional local copy. Browser closure before the
750 ms persistence debounce may leave the latest change only in that browser or the connected peer.
Audio playback, scroll positions and cursors are not shared by this change.
Registered student sessions retain their previous behavior; this feature targets guest rooms.

Database migration: 20260923225738_guest_workspace_collaboration.sql.
Direct table access is denied by RLS. create_guest_workspace requires an authenticated teacher.
Guest resolve/merge RPCs intentionally accept a valid unexpired random bearer token via narrowly
scoped SECURITY DEFINER functions; navigation writes also require the owner UID. Keep the link
private: anyone receiving it can join and edit as a guest. Existing limited links remain limited.
No service role key is shipped to the browser.

Verification: unit and DOM/controller tests cover field conflicts, stale updates, deletion,
shared checks, empty-room startup, both editors, teacher navigation and reconnection hydration.
The migration was exercised in a rolled-back database transaction, including owner/guest
navigation, out-of-order merges and expiry. Browser layout and a real two-device lesson still
need a short user acceptance check before teaching.
