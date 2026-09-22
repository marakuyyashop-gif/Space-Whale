create or replace function public.resolve_guest_lesson_link(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_row public.guest_lesson_links%rowtype;
begin
  select *
  into v_row
  from public.guest_lesson_links
  where token_hash = encode(digest(p_token, 'sha256'), 'hex')
    and active = true
    and expires_at > now();

  if not found then return null; end if;

  return jsonb_build_object(
    'room_topic', v_row.room_topic,
    'allowed_lesson_ids', to_jsonb(v_row.allowed_lesson_ids),
    'expires_at', v_row.expires_at,
    'is_host', coalesce(v_row.teacher_id = auth.uid(), false),
    'current_page_id', v_row.current_page_id,
    'current_exercise_id', v_row.current_exercise_id,
    'responses', v_row.responses
  );
end;
$$;

create or replace function public.save_guest_lesson_navigation(
  p_token text,
  p_current_page_id text,
  p_current_exercise_id text
)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  update public.guest_lesson_links
  set current_page_id = p_current_page_id,
      current_exercise_id = p_current_exercise_id,
      updated_at = now()
  where token_hash = encode(digest(p_token, 'sha256'), 'hex')
    and teacher_id = auth.uid()
    and active = true
    and expires_at > now();

  return found;
end;
$$;

create or replace function public.save_guest_lesson_response(
  p_token text,
  p_exercise_id text,
  p_response jsonb
)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if p_exercise_id is null or length(p_exercise_id) > 160 or p_response is null then
    return false;
  end if;

  update public.guest_lesson_links
  set responses = jsonb_set(responses, array[p_exercise_id], p_response, true),
      updated_at = now()
  where token_hash = encode(digest(p_token, 'sha256'), 'hex')
    and active = true
    and expires_at > now();

  return found;
end;
$$;

create or replace function public.revoke_guest_lesson_link(p_token text)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  update public.guest_lesson_links
  set active = false,
      updated_at = now()
  where token_hash = encode(digest(p_token, 'sha256'), 'hex')
    and teacher_id = auth.uid()
    and active = true;

  return found;
end;
$$;
