# Daily in the existing Workspace

## Teacher workflow

1. Open the permanent teacher Workspace and use the existing invitation button (or Start Lesson → create invitation).
2. The server closes previous invitation/video rooms, creates a clean invitation and the website copies the pupil link. The teacher enters the matching room automatically.
3. The video panel connects with camera/microphone initially off. Use its existing-style camera and microphone buttons to prepare. A pupil opening the link remains in the existing waiting screen, without video or materials.
4. Start Lesson admits the pupil to the materials and video room and starts the existing shared timer.
5. Finish Lesson revokes the invitation, expires the Daily room, ejects its participants and deletes the room. The teacher returns to the permanent preparation Workspace. New pupil creates an isolated invitation/room with empty answers.

Mic/camera errors offer a retry. Remote audio autoplay restrictions have an explicit Enable audio action. A fatal call error releases devices before offering reconnect. Reloading does not end the lesson. Exercise synchronization remains independent; classroom-realtime.js is unchanged.

## Server authorization

`daily-session` supports POST `{guestToken}`, `{sessionId}`, `{action:'end',guestToken|sessionId}` and owner-only `{action:'rotate'}`.

Gateway JWT verification is disabled deliberately for account-free pupil invitations. The function itself authenticates every request: invitation tokens must be 64-character random hexadecimal capabilities whose SHA-256 hashes match an active, unexpired database invitation. Pupils cannot enter before started_at. Owner actions require a Supabase JWT validated through auth.getUser, the is_teacher_user role check and invitation/session ownership. Client-provided role fields are ignored. Account sessions require explicit membership and reject closed sessions; pupils require live status.

Private Daily room names derive from the invitation hash, never the raw bearer token. Meeting tokens are per role, expire no later than the invitation/room (maximum four hours), and are held only in memory. Rooms admit two participants and enforce unique user IDs; the pupil has no owner/screenshare rights. This release is for individual lessons, not group clubs.

The server-only daily_room_name column tracks rooms until cleanup succeeds. Rotation first revokes old invitations, retries outstanding room cleanup and only then creates the next invitation. Join rechecks authorization after token issuance to catch concurrent Finish/rotation. Cleanup expires the room before ejecting occupants and deleting it, so old meeting tokens cannot reenter. Failed cleanup keeps its marker for retry. No service-role or Daily secret is present in public code. No new public table access was granted.

## Frontend

- classroom-media.js lazily loads daily-js 0.92.2, owns local/remote tracks and device controls, and calls the Edge Function through the current Supabase client.
- workspace.js invokes media only after role validation, keeps a waiting pupil disconnected, joins on admission and awaits server cleanup before leaving as teacher.
- classroom-media.css reserves space alongside/below the materials, using existing light/dark surface and shadow tokens.
- Legacy classroom-session.html redirects to the unified classroom and preserves its query.

## Verification

38 focused automated checks cover guest/account authorization, role forgery, pre-start admission, expiry, end/rotation, cleanup failure/retry, token-issuance races, device toggles, media teardown, autoplay recovery, reconnect and existing exercise/session synchronization. Live backend probes also verify a disposable invitation and real Daily room/token creation. Physical camera/microphone quality and a real two-device teacher/pupil call require a device smoke test; automated checks are not a claim of that result.

Security advisor output retains existing warnings about intentional capability-authenticated SECURITY DEFINER RPCs and disabled leaked-password checks; the invitation table remains closed by RLS with no public table policies. No such policies/functions were added by this change.

References:
- https://docs.daily.co/reference/daily-js/factory-methods/create-call-object
- https://docs.daily.co/reference/daily-js/instance-methods/join
- https://docs.daily.co/reference/daily-js/instance-methods/destroy
- https://docs.daily.co/reference/rest-api/rooms/session/eject
- https://docs.daily.co/reference/rest-api/rooms/delete-room
- https://supabase.com/docs/reference/javascript/functions-invoke
