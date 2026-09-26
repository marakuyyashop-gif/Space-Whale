-- Temporary owner-only teaching pilot. Guest links are revocable bearer capabilities.
create schema if not exists sw_private;
revoke all on schema sw_private from public, anon, authenticated;
create or replace function sw_private.block_pilot_signup()
returns trigger language plpgsql set search_path='' as $$
begin raise exception 'Registration is temporarily closed' using errcode='42501'; end; $$;
revoke all on function sw_private.block_pilot_signup() from public,anon,authenticated;
create trigger sw_pilot_registration_closed before insert on auth.users
for each row execute function sw_private.block_pilot_signup();

create or replace function sw_private.guard_profile_role()
returns trigger language plpgsql set search_path='' as $$
begin
  if new.role is distinct from old.role and auth.uid() is not null then
    raise exception 'Account roles cannot be changed from the client' using errcode='42501';
  end if;
  return new;
end; $$;
revoke all on function sw_private.guard_profile_role() from public,anon,authenticated;
create trigger sw_profile_role_locked before update of role on public.profiles
for each row execute function sw_private.guard_profile_role();

create or replace function public.is_teacher_user()
returns boolean language sql stable security definer set search_path='' as $$
 select public.is_platform_admin() and exists(select 1 from public.profiles where id=auth.uid() and role='teacher');
$$;
create or replace function public.can_teach_in_workspace(p_workspace_id uuid)
returns boolean language sql stable security definer set search_path='' as $$
 select public.is_teacher_user() and public.has_workspace_role(p_workspace_id,array['owner','admin','teacher']::text[]);
$$;

create or replace function public.create_guest_workspace()
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_token text; v_expiry timestamptz:=now()+interval '24 hours';
begin
 if auth.uid() is null or not public.is_teacher_user() then raise exception 'Teacher access required' using errcode='42501'; end if;
 -- Serialize double clicks/tabs: only the latest invitation can remain active.
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,0));
 update public.guest_lesson_links set active=false,updated_at=now() where teacher_id=auth.uid() and active;
 v_token:=encode(extensions.gen_random_bytes(32),'hex');
 insert into public.guest_lesson_links(token_hash,teacher_id,room_topic,allowed_lesson_ids,expires_at)
 values(encode(extensions.digest(v_token,'sha256'),'hex'),auth.uid(),'guest-lesson:'||encode(extensions.gen_random_bytes(32),'hex'),array['*'],v_expiry);
 return jsonb_build_object('token',v_token,'expires_at',v_expiry);
end; $$;
revoke all on function public.create_guest_workspace() from public,anon;
grant execute on function public.create_guest_workspace() to authenticated;

-- An inexpensive, server-validated sync read: only the open exercise, never another room.
create or replace function public.read_guest_workspace(p_token text)
returns jsonb language sql security definer set search_path='' as $$
 select jsonb_build_object('current_page_id',current_page_id,'current_exercise_id',current_exercise_id,
   'response',responses->current_exercise_id,'expires_at',expires_at)
 from public.guest_lesson_links
 where token_hash=encode(extensions.digest(p_token,'sha256'),'hex') and active and expires_at>now();
$$;
revoke all on function public.read_guest_workspace(text) from public;
grant execute on function public.read_guest_workspace(text) to anon,authenticated;

-- Limit the legacy non-CRDT endpoint as well as the current merge endpoint.
create or replace function public.save_guest_lesson_response(p_token text,p_exercise_id text,p_response jsonb)
returns boolean language plpgsql security definer set search_path='' as $$
begin
 if p_exercise_id is null or length(p_exercise_id)>160 or p_response is null or octet_length(p_response::text)>1000000 then return false; end if;
 update public.guest_lesson_links set responses=jsonb_set(responses,array[p_exercise_id],p_response,true),updated_at=now()
 where token_hash=encode(extensions.digest(p_token,'sha256'),'hex') and active and expires_at>now()
;
 return found;
end; $$;
