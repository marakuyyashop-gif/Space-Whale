-- Prevent clients from changing authorization and ownership fields while
-- preserving the self-service settings used by the current application.

revoke update on table public.profiles from authenticated;
grant update (display_name, avatar_url, timezone, practice_name, profile_complete)
on table public.profiles to authenticated;

revoke update on table public.workspaces from authenticated;
grant update (name, timezone)
on table public.workspaces to authenticated;

revoke update on table public.workspace_members from authenticated;
grant update (role, status)
on table public.workspace_members to authenticated;

drop policy if exists workspace_members_insert_admin on public.workspace_members;
create policy workspace_members_insert_admin
on public.workspace_members
for insert
to authenticated
with check (
  (
    public.has_workspace_role(workspace_id, array['owner']::text[])
    and role in ('admin', 'teacher')
  )
  or
  (
    public.has_workspace_role(workspace_id, array['admin']::text[])
    and role = 'teacher'
  )
);

drop policy if exists workspace_members_update_admin on public.workspace_members;
create policy workspace_members_update_admin
on public.workspace_members
for update
to authenticated
using (
  (
    public.has_workspace_role(workspace_id, array['owner']::text[])
    and role in ('admin', 'teacher')
  )
  or
  (
    public.has_workspace_role(workspace_id, array['admin']::text[])
    and role = 'teacher'
  )
)
with check (
  (
    public.has_workspace_role(workspace_id, array['owner']::text[])
    and role in ('admin', 'teacher')
  )
  or
  (
    public.has_workspace_role(workspace_id, array['admin']::text[])
    and role = 'teacher'
  )
);

drop policy if exists workspace_members_delete_admin on public.workspace_members;
create policy workspace_members_delete_admin
on public.workspace_members
for delete
to authenticated
using (
  (
    public.has_workspace_role(workspace_id, array['owner']::text[])
    and role in ('admin', 'teacher')
  )
  or
  (
    public.has_workspace_role(workspace_id, array['admin']::text[])
    and role = 'teacher'
  )
);

create or replace function public.is_session_teacher(p_session_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select exists (
    select 1
    from public.lesson_sessions ls
    where ls.id = p_session_id
      and ls.teacher_id = auth.uid()
      and public.can_teach_in_workspace(ls.workspace_id)
  );
$function$;

revoke all on function public.is_session_teacher(uuid) from public, anon;
grant execute on function public.is_session_teacher(uuid) to authenticated, service_role;
