# Unified Workspace checkpoint

Status: implementation in progress, based on e6c9d77 (includes School Fair lesson and latest typed-gap fixes).

Goal: one ordinary Learning Space at classroom.html; existing lesson/gallery/library links redirect there. Reuse exercise-kit and learning-space.css (560px, left aligned). Library hierarchy: A1.1 7 Whales, A1.2 7, A2.1 8, A2.2 8. Counts are data, not UI constants.

Preserve: all 16 examples, both existing lessons, all assets, existing lesson definitions and latest changes from other chats. Course placement is not known: keep real lessons in Unassigned rather than inventing a module. Empty Whales have no fabricated topics.

Legacy authenticated scheduled sessions and personal-library management must remain accessible, with their current scripts intact. No database/auth/payment changes. No browser use. Verify with Node and routing/content preservation checks; visual QA deferred to user screenshots.

Next: extract content-only definitions, implement one shell and controller, redirect old ordinary routes, run tests, save final checkpoint and merge.
