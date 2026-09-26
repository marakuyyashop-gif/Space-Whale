-- Capability-scoped PRIVATE channels. Knowing a topic never grants teacher controls.
create or replace function public.can_use_guest_realtime(p_topic text,p_send boolean default false)
returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.guest_lesson_links g
 where p_topic in (g.room_topic||':answers',g.room_topic||':control')
 and g.active and g.expires_at>now()
 and (g.started_at is not null or (g.teacher_id=auth.uid() and public.is_teacher_user()))
 and (not p_send or p_topic=g.room_topic||':answers' or (g.teacher_id=auth.uid() and public.is_teacher_user())));
$$;
revoke all on function public.can_use_guest_realtime(text,boolean) from public;
grant execute on function public.can_use_guest_realtime(text,boolean) to anon,authenticated;
create policy sw_guest_private_read on realtime.messages for select to anon,authenticated
 using(extension in ('broadcast','presence') and public.can_use_guest_realtime((select realtime.topic()),false));
create policy sw_guest_private_send on realtime.messages for insert to anon,authenticated
 with check(extension in ('broadcast','presence') and public.can_use_guest_realtime((select realtime.topic()),true));

-- Push closure immediately; database authorization remains the fallback for expiry/reconnect.
create or replace function sw_private.broadcast_guest_closure()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 if old.active and not new.active then
   perform realtime.send(jsonb_build_object('closed',true),'lesson_closed',new.room_topic||':control',true);
 end if;
 return new;
end; $$;
revoke all on function sw_private.broadcast_guest_closure() from public,anon,authenticated;
create trigger sw_guest_close_broadcast after update of active on public.guest_lesson_links
 for each row execute function sw_private.broadcast_guest_closure();

create or replace function public.resolve_guest_lesson_link(p_token text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v public.guest_lesson_links%rowtype; v_host boolean; v_allowed boolean;
begin
 select * into v from public.guest_lesson_links
 where token_hash=encode(extensions.digest(p_token,'sha256'),'hex') and active and expires_at>now();
 if not found then return null; end if;
 v_host:=coalesce(v.teacher_id=auth.uid() and public.is_teacher_user(),false);
 v_allowed:=v_host or v.started_at is not null;
 return jsonb_build_object('room_topic',case when v_allowed then v.room_topic end,'is_host',v_host,'expires_at',v.expires_at,
   'status',case when v.started_at is null then 'waiting' else 'live' end,
   'started_at',v.started_at,'duration_minutes',v.duration_minutes,'server_now',clock_timestamp(),
   'allowed_lesson_ids',case when v_allowed then to_jsonb(v.allowed_lesson_ids) else '[]'::jsonb end,
   'current_page_id',case when v_allowed then v.current_page_id end,
   'current_exercise_id',case when v_allowed then v.current_exercise_id end,
   'responses',case when v_allowed then v.responses else '{}'::jsonb end);
end; $$;
revoke all on function public.resolve_guest_lesson_link(text) from public;
grant execute on function public.resolve_guest_lesson_link(text) to anon,authenticated;

