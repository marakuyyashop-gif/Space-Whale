# Space Whale navigation audit

Checkpoint created before navigation changes.

## Intended route map

| Area | Entry | Primary return |
| --- | --- | --- |
| Public website | `index.html` | — |
| Account router | `app.html` | `index.html` |
| Teacher account | `dashboard.html` | `index.html` |
| Student account | `student-dashboard.html` | `index.html` |
| Waiting room | `waiting-room.html?session=…` | Role-specific account home |
| Live lesson | `classroom.html?session=…` | Role-specific account home |

## Confirmed gaps

- Teacher and student sidebars have no explicit link back to the public website.
- The waiting-room back link is hard-coded to `dashboard.html`, so it is wrong for students.
- The classroom Space Whale brand is a button without a navigation action.
- Password reset and payment result pages return directly to the teacher dashboard instead of the role-aware account router.
- Authentication pages do not provide an explicit route back to the public website.

## Required behavior

- Public website links to sign-in and both account-registration routes.
- `app.html` chooses the correct account home from the signed-in profile role.
- Every teacher/student account page exposes both account Home and Website routes.
- Waiting room and classroom return to the correct account home for the active role.
- Legacy `index.html?session=…` links continue to forward to the classroom.
