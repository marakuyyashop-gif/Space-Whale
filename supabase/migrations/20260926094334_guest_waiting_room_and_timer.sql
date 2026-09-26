-- Invitation access and lesson admission are distinct. Only the owner can start.
alter table public.guest_lesson_links add column started_at timestamptz,
  add column duration_minutes integer not null default 60 check (duration_minutes between 1 and 240);

create or replace function public.resolve_guest_lesson_link(p_token text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v public.guest_lesson_links%rowtype; v_host boolean; v_allowed boolean;
begin
 select * into v from public.guest_lesson_links
 where token_hash=encode(extensions.digest(p_token,'sha256'),'hex') and active and expires_at>now();
 if not found then return null; end if;
 v_host:=coalesce(v.teacher_id=auth.uid() and public.is_teacher_user(),false);
 v_allowed:=v_host or v.started_at is not null;
 return jsonb_build_object('room_topic',null,'is_host',v_host,'expires_at',v.expires_at,
   'status',case when v.started_at is null then 'waiting' else 'live' end,
   'started_at',v.started_at,'duration_minutes',v.duration_minutes,'server_now',clock_timestamp(),
   'allowed_lesson_ids',case when v_allowed then to_jsonb(v.allowed_lesson_ids) else '[]'::jsonb end,
   'current_page_id',case when v_allowed then v.current_page_id end,
   'current_exercise_id',case when v_allowed then v.current_exercise_id end,
   'responses',case when v_allowed then v.responses else '{}'::jsonb end);
end; $$;
revoke all on function public.resolve_guest_lesson_link(text) from public;
grant execute on function public.resolve_guest_lesson_link(text) to anon,authenticated;

create or replace function public.read_guest_workspace(p_token text)
returns jsonb language sql security definer set search_path='' as $$
 select (meta-'responses')||jsonb_build_object('response',meta->'responses'->(meta->>'current_exercise_id'))
 from (select public.resolve_guest_lesson_link(p_token) as meta) s;
$$;
revoke all on function public.read_guest_workspace(text) from public;
grant execute on function public.read_guest_workspace(text) to anon,authenticated;

create or replace function public.start_guest_lesson(p_token text)
returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or not public.is_teacher_user() then
   raise exception 'Only the teacher can start the lesson' using errcode='42501';
 end if;
 -- Row lock + coalesce: retries and multiple tabs never restart the countdown.
 update public.guest_lesson_links set started_at=coalesce(started_at,clock_timestamp()),updated_at=now()
 where token_hash=encode(extensions.digest(p_token,'sha256'),'hex') and teacher_id=auth.uid() and active and expires_at>now();
 if not found then raise exception 'Invitation is closed' using errcode='42501'; end if;
 return public.read_guest_workspace(p_token);
end; $$;
revoke all on function public.start_guest_lesson(text) from public,anon;
grant execute on function public.start_guest_lesson(text) to authenticated;

-- Merge snapshots under a row lock, retaining newer per-field edits and deletions.
create or replace function public.merge_guest_lesson_response(p_token text,p_exercise_id text,p_response jsonb)
returns boolean language plpgsql security definer set search_path = '' as $$
declare v_hash text; v_responses jsonb; v_entries jsonb; v_key text; v_entry jsonb; v_old jsonb;
begin
  if p_exercise_id is null or length(p_exercise_id)>160 or p_response->>'__sw_collab' is distinct from '1'
    or jsonb_typeof(p_response->'entries') is distinct from 'object' or octet_length(p_response::text)>1000000 then return false; end if;
  v_hash := encode(extensions.digest(p_token,'sha256'),'hex');
  select responses into v_responses from public.guest_lesson_links
    where token_hash=v_hash and active and expires_at>now()
      and (started_at is not null or (teacher_id=auth.uid() and public.is_teacher_user())) for update;
  if not found then return false; end if;
  v_entries := coalesce(v_responses->p_exercise_id->'entries','{}'::jsonb);
  for v_key,v_entry in select * from jsonb_each(p_response->'entries') loop
    if jsonb_typeof(v_entry->'clock') is distinct from 'number' or jsonb_typeof(v_entry->'actor') is distinct from 'string'
      or (v_entry->>'clock') !~ '^[0-9]{1,15}$' then return false; end if;
    v_old := v_entries->v_key;
    if v_old is null or (v_entry->>'clock')::bigint > (v_old->>'clock')::bigint
      or ((v_entry->>'clock')::bigint = (v_old->>'clock')::bigint and (v_entry->>'actor') collate "C" > (v_old->>'actor') collate "C") then
      v_entries := jsonb_set(v_entries,array[v_key],v_entry,true);
    end if;
  end loop;
  update public.guest_lesson_links set responses=jsonb_set(responses,array[p_exercise_id],jsonb_build_object('__sw_collab',1,'entries',v_entries),true),updated_at=now()
    where token_hash=v_hash;
  return true;
end; $$;
revoke all on function public.merge_guest_lesson_response(text,text,jsonb) from public;
grant execute on function public.merge_guest_lesson_response(text,text,jsonb) to anon, authenticated;

-- Limit the legacy non-CRDT endpoint as well as the current merge endpoint.
create or replace function public.save_guest_lesson_response(p_token text,p_exercise_id text,p_response jsonb)
returns boolean language plpgsql security definer set search_path='' as $$
begin
 if p_exercise_id is null or length(p_exercise_id)>160 or p_response is null or octet_length(p_response::text)>1000000 then return false; end if;
 update public.guest_lesson_links set responses=jsonb_set(responses,array[p_exercise_id],p_response,true),updated_at=now()
 where token_hash=encode(extensions.digest(p_token,'sha256'),'hex') and active and expires_at>now()
   and (started_at is not null or (teacher_id=auth.uid() and public.is_teacher_user()));
 return found;
end; $$;
