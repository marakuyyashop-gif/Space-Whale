# Homework links

Each published lesson has one template and a public URL:
`homework.html?lesson=a1-2-w4-l4`.
The teacher opens Homework in the workspace profile panel, previews the pack or copies its link. The standalone `homework.html` page lists published homework packs. No assignment, account, name or contact entry is required.

The learner starts a separate attempt. The browser retains its random editing capability and automatically saves answers to Supabase after edits. Reopening the lesson link in the same browser resumes that attempt. Local drafts survive failed save requests and retry when online. Clearing browser storage loses editing access; a different browser starts another attempt.

“Скопировать ссылку на мою работу” first flushes pending answers, then copies a read-only URL. The learner sends it to the teacher. There is no automated teacher notification. Anyone holding that result URL can view it. Links have no automatic expiry; availability depends on retaining the site and database.

## Shared content and rendering

`homework-content.js` builds L4/L5 packs from existing shared exercise definitions, including their current two self-study translations. It adds a compact words/rule reference and reuses picture matching and one practice task. No classroom answer state is imported. `homework.js` renders every task with `SpaceWhaleExerciseKit`; changes to that renderer apply to both classroom and homework.

Run `node scripts/build-homework-catalog.cjs --sql` to generate template upserts after an approved content change. Apply those upserts through the database deployment tools. Existing attempts keep their original definition snapshot, so subsequent template edits do not silently change an already-started assignment. Updating site source alone does not republish database templates.

## Persistence and access

The migration creates RLS-enabled private tables without anonymous/authenticated schema or table grants. Four explicitly granted, fixed-search-path SECURITY DEFINER RPCs form the intentional anonymous capability API: catalog/template read, idempotent attempt creation, capability-protected read, and edit-capability-protected save.

Independent 256-bit editing and viewing keys are SHA-256 hashed on the server. Only the viewing key is placed in the result URL fragment. Editing credentials remain in local browser storage. RPC responses never expose hashes or keys. Saves use a row lock and expected revision to prevent another tab silently overwriting a newer response. Answer objects are capped at 128 KiB. A conflicting local draft is backed up locally before the latest saved version is loaded on refresh.

Do not expose the private schema, add broad policies, include editing keys in share URLs, or replace these scoped functions with unrestricted table access. The security advisor's anonymous SECURITY DEFINER warning is expected for these deliberately public endpoints; validate capability isolation whenever they change.

## Verification (2026-10-04)

- Homework and exercise-kit targeted tests: 30 passed.
- Full suite: 246 passed, 35 failed; the same 35 failures reproduced on unchanged base commit 66827a3. No new failures.
- Live anonymous RPC tests: catalog, idempotent start, independent attempts, save/read, denied wrong keys, denied saves with viewing key, stale revision conflict. Synthetic attempts removed after testing.
- DOM checks cover resume, saved answer display, recovery listeners, share URL secrecy, and read-only results. Visual browser review was unavailable in this environment.
