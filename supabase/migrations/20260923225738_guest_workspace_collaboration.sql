-- Guest links are bearer capabilities. Creation requires a signed-in teacher;
-- navigation keeps the existing owner-authenticated RPC. No table access is granted.
create or replace function public.create_guest_workspace()
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_token text; v_expiry timestamptz := now() + interval '24 hours';
begin
  if auth.uid() is null or not exists (select 1 from public.profiles where id=auth.uid() and role='teacher') then
    raise exception 'Sign in with a teacher account to create a lesson';
  end if;
  v_token := encode(extensions.gen_random_bytes(32),'hex');
  insert into public.guest_lesson_links(token_hash,teacher_id,room_topic,allowed_lesson_ids,expires_at)
  values(encode(extensions.digest(v_token,'sha256'),'hex'),auth.uid(),'guest-lesson:' || encode(extensions.gen_random_bytes(32),'hex'),array['*'],v_expiry);
  return jsonb_build_object('token',v_token,'expires_at',v_expiry);
end; $$;
revoke all on function public.create_guest_workspace() from public, anon;
grant execute on function public.create_guest_workspace() to authenticated;

-- Merge snapshots under a row lock, retaining newer per-field edits and deletions.
create or replace function public.merge_guest_lesson_response(p_token text,p_exercise_id text,p_response jsonb)
returns boolean language plpgsql security definer set search_path = '' as $$
declare v_hash text; v_responses jsonb; v_entries jsonb; v_key text; v_entry jsonb; v_old jsonb;
begin
  if p_exercise_id is null or length(p_exercise_id)>160 or p_response->>'__sw_collab' is distinct from '1'
    or jsonb_typeof(p_response->'entries') is distinct from 'object' or octet_length(p_response::text)>1000000 then return false; end if;
  v_hash := encode(extensions.digest(p_token,'sha256'),'hex');
  select responses into v_responses from public.guest_lesson_links
    where token_hash=v_hash and active and expires_at>now() for update;
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
