# Neumorphic design checkpoint — 2026-09-24

Approved direction: light neutral soft UI, pronounced rounded raised panels, upper-left light, inset text fields, soft hover glow. Floating bounded sidebar is essential. Preserve the large raised next control and smaller inset collapse control. Colour is reserved for lesson imagery and answer feedback. No internal/demo commentary in student content.

Current implementation remains isolated to design-preview.html/css/js. Do not mark this as a completed global rollout.

Preview refinements: animated light/dark sliding thumb; raised empty matching selectors with inset selected answers; soft raised feedback badges and solution panel. Validation semantics remain in the shared exercise kit.

Timer: default 60 minutes, integer custom durations 1–1440. The preview remembers only the chosen duration locally, not elapsed progress. Duration locks once started until reset. Timer is not connected to an account or a live session.

Future timer integration: teacher account default; optional per-student override; optional per-session override. Resolve in order session > student > teacher > 60. Teacher controls start/pause/reset. Share authoritative start timestamp and accumulated elapsed time through existing session synchronization; reconnect must recover timer. Separate scheduled duration from topic-block lengths. Completion should notify without closing lessons or clearing answers. Account controls are not implemented yet.

Next stages: approve feedback states, move material tokens and controls to a shared theme, verify existing exercise mechanics in batches, then apply to the remaining site screens. Preserve role permissions, existing navigation, and realtime answer state during rollout.
