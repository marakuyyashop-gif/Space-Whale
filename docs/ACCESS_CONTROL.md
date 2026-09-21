# Space Whale access control

This document records the authorization boundary implemented in Supabase. UI routing is not treated as security; database grants and Row Level Security remain authoritative.

## Platform roles

| Actor | Source of authority | Access boundary |
| --- | --- | --- |
| Platform owner | `platform_admins` plus an `owner` workspace membership | Platform administration and full access to the owner's teaching workspace |
| Workspace owner | `workspace_members.role = owner` | Own workspace, its teachers, students, lessons and billing records |
| Workspace admin | `workspace_members.role = admin` | Own workspace; may manage teacher memberships but cannot create, modify or remove an owner |
| Teacher | `workspace_members.role = teacher` | Assigned workspace teaching data only |
| Student | `workspace_students` and lesson assignment | Own schedule, answers, progress, homework and student-visible materials only |

`profiles.role` is only the top-level application route (`teacher` or `student`). It is system-managed and cannot be changed from the browser. Workspace authority comes from `workspace_members`, not from editable profile metadata.

## Protected fields

- Authenticated users may update only profile presentation fields: display name, avatar, timezone, practice name and completion status.
- Workspace `owner_id`, slug, kind and status are system-managed. Browser clients may update only workspace name and timezone.
- Workspace membership identity is immutable from the browser. Owners may manage admin and teacher roles; admins may manage teachers only. No client policy can create, demote or delete an owner.
- A teacher loses classroom teacher privileges when their active workspace teaching membership is removed.

## Verification

The production migration was tested by impersonating the existing owner and student database roles inside rolled-back transactions:

- student role escalation through `profiles.role` was denied;
- workspace owner replacement was denied;
- normal profile and workspace settings updates succeeded;
- an attempt to suspend the owner membership changed zero rows.
