-- Only the server may inspect invitation hashes and maintain Daily cleanup markers.
-- anon/authenticated still have no direct access to this table.
grant select, update on table public.guest_lesson_links to service_role;
