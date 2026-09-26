# Daily in the existing Workspace

Frontend integration, 2026-09-26. No backend or classroom-realtime.js changes.

- classroom.html loads classroom-media.js; it lazily loads daily-js 0.92.2 only for an authorized account-based session.
- Workspace calls connect after its existing participant authorization returns teacher/student. The controller sends {sessionId} to daily-session via the current Supabase user session, validates the response, and joins roomUrl using the individual meetingToken. Tokens stay in memory and never enter DOM, URLs, storage or logs.
- Daily manages local and remote camera/microphone tracks. Users enable their devices with cameraToggle / micToggle. No local getUserMedia transport remains.
- Participant join/update/leave events update tiles. Remote audio has an explicit playback recovery action if autoplay is blocked. Self audio is never played.
- Video reserves space beside materials on desktop and below materials at smaller widths. Exercise synchronization is independent of video startup and failure.
- Finish/navigation away destroys the local Daily call. Legacy classroom-session.html redirects to the same Workspace and preserves its query.

## Verified backend contract and current launch blockers

Read deployed daily-session ACTIVE v2. Its auth mode is user; it requires a real lesson_sessions.id and membership through teacher_id, student_id or lesson_participants. Returns {ok,roomUrl,meetingToken,role}. Browser OPTIONS preflight returns 204 with the required CORS headers.

The current temporary invitations are a different system: anon pupils with guest/room bearer tokens, and synthetic guest session IDs. Those are not UUID lesson_sessions and cannot call this function. Frontend deliberately does not send them as sessionId or expose/share teacher meeting tokens. Guest video remains disabled until the backend supports this authorized invitation flow.

The function reads session.status but does not reject ended/cancelled sessions. Meeting tokens last four hours. Local call teardown is implemented, but server-enforced end-for-everyone, token reissue denial and invitation revocation need backend support before claiming a complete guest-video lifecycle. These are not fixable with a frontend-only permission check.

No real two-account camera/audio call was performed in this execution. Automated tests cover token invocation, role handling, guest/closed guards, duplicate starts, stale requests after leave, device toggles, remote tracks, autoplay recovery, retry and cleanup. Existing guest/Workspace tests remain passing.

References:
- https://docs.daily.co/reference/daily-js/factory-methods/create-call-object
- https://docs.daily.co/reference/daily-js/instance-methods/join
- https://docs.daily.co/reference/daily-js/types/daily-track-state
- https://docs.daily.co/reference/daily-js/instance-methods/destroy
- https://supabase.com/docs/reference/javascript/functions-invoke
