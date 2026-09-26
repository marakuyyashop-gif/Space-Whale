-- Server-only cleanup marker: guest bearer tokens and Daily credentials remain separate.
-- Existing table grants and RLS are unchanged.
alter table public.guest_lesson_links add column if not exists daily_room_name text;
comment on column public.guest_lesson_links.daily_room_name is 'Private Daily room pending cleanup; cleared only after server-side expiry/ejection/deletion.';
