# Live Workspace checkpoint

Status: implementation completed on `codex/workspace-live`; not merged to `main` yet. Base is `115ed6b`. No new lesson page, classroom shell, CSS system, or database schema was created.

## What changed
- `classroom.html?session=...` now stays inside the canonical unified Workspace instead of redirecting to the legacy classroom.
- Existing `classroom-realtime.js` is reused for the same authenticated lesson session, private Broadcast channel and Presence.
- Student `exercise-kit onChange` sends the full current exercise answer through Broadcast immediately. Typed gaps and writing therefore stream on every input event; dropdown, choice, matching, order and sort stream on each change.
- Teacher receives the student's draft in the same mounted exercise and `exercise-kit.setAnswers()` updates that exercise without firing `onChange` back, preventing a feedback loop. Teacher answer controls are read-only; audio controls remain usable.
- Teacher navigation is authoritative. The existing route is stored in `lesson_state.current_page_id` and broadcast through the existing navigate event; the student follows it inside the same Workspace.
- Draft database writes remain recovery snapshots, now trailing-debounced to 750 ms instead of acting as the per-keystroke transport.
- Broadcast drafts include a per-tab source id and monotonically increasing sequence per exercise; stale/duplicate messages from the same source are ignored.
- Teacher requests a peer state snapshot on exercise mount. A connected student can answer immediately from the currently mounted state, while `exercise_responses` remains the database recovery fallback.
- Live local answer storage is session-scoped so two lesson sessions do not share pending answers.
- Presence updates the existing lesson heading with teacher/student online state. No extra visual system was introduced.

## Database/security verification
No Supabase migration was needed. Existing production policies already authorize only authenticated lesson participants for private Realtime Broadcast/Presence:
- `realtime.messages` SELECT policy: `space_whale_room_read`
- `realtime.messages` INSERT policy: `space_whale_room_send`
- both call existing `can_access_room_topic(realtime.topic())`
- `exercise_responses` already lets the student write their own session response and the related teacher read it
- `lesson_state` remains teacher-write/member-read

This matches current Supabase guidance for private channel authorization through RLS on `realtime.messages`.

## Verification completed
- All modified JavaScript files parse successfully.
- A deterministic in-memory two-role simulation confirmed:
  - teacher mounts the same exercise read-only;
  - a student draft updates the teacher's mounted exercise immediately;
  - student `onChange` emits a live draft;
  - teacher navigation changes the student's route and mounted exercise;
  - the `session` id remains in the route;
  - student course navigation is locked during a live session.
- Workspace tests were extended for the same behavior.

## Still needs real browser acceptance
A real teacher account + real student account should be opened together once after merge to confirm actual network latency, login redirect behavior, Presence, and reconnect behavior in browsers. No claim is made that a two-browser live session has already been tested from this environment.
