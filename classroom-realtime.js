(() => {
  const client = window.spaceWhaleSupabase;

  const state = {
    channel: null,
    session: null,
    user: null,
    role: null,
    guestToken: null,
    clientId: (globalThis.crypto?.randomUUID?.() || `client-${Date.now()}-${Math.random().toString(36).slice(2)}`)
  };
  const exerciseSequences = new Map();
  const nextSequence = (exerciseId) => {
    const next = (exerciseSequences.get(exerciseId) || 0) + 1;
    exerciseSequences.set(exerciseId, next);
    return next;
  };

  async function getCurrentUser() {
    if (!client) return null;
    const { data, error } = await client.auth.getUser();
    if (error) return null;
    state.user = data.user || null;
    return state.user;
  }

  async function loadSession(sessionId) {
    if (!client || !sessionId) return null;

    const { data, error } = await client
      .from("lesson_sessions")
      .select("id, teacher_id, student_id, course_id, lesson_id, library_lesson_id, title, room_topic, status, scheduled_at, duration_minutes, join_window_minutes")
      .eq("id", sessionId)
      .single();

    if (error) throw error;

    state.session = data;
    if (state.user) {
      state.role = data.teacher_id === state.user.id
        ? "teacher"
        : data.student_id === state.user.id
          ? "student"
          : null;
    }
    return data;
  }

  async function loadSharedState(sessionId) {
    if (!client) return null;

    if (state.guestToken) {
      const { data, error } = await guestRPC("resolve_guest_lesson_link", { p_token: state.guestToken });
      if (error) throw error;
      if (!data) return null;
      return {
        ...data,
        current_page_id: data.current_page_id || null,
        current_exercise_id: data.current_exercise_id || null
      };
    }

    if (!sessionId) return null;
    const { data, error } = await client
      .from("lesson_state")
      .select("*")
      .eq("session_id", sessionId)
      .single();

    if (error) throw error;
    return data;
  }

  async function connect(sessionId, handlers = {}) {
    if (!client) throw new Error("Supabase client is not ready.");

    const user = await getCurrentUser();
    if (!user) throw new Error("Sign in before joining a lesson.");

    const session = await loadSession(sessionId);
    if (!session) throw new Error("Lesson session not found.");

    if (state.channel) {
      await client.removeChannel(state.channel);
      state.channel = null;
    }

    const channel = client.channel(session.room_topic, {
      config: {
        private: true,
        broadcast: { self: false, ack: true },
        presence: { key: user.id }
      }
    });

    channel
      .on("broadcast", { event: "navigate" }, ({ payload }) => handlers.onNavigate?.(payload))
      .on("broadcast", { event: "audio" }, ({ payload }) => handlers.onAudio?.(payload))
      .on("broadcast", { event: "audio_request" }, ({ payload }) => handlers.onAudioRequest?.(payload))
      .on("broadcast", { event: "word_focus" }, ({ payload }) => handlers.onWordFocus?.(payload))
      .on("broadcast", { event: "exercise_response" }, ({ payload }) => handlers.onExerciseResponse?.(payload))
      .on("broadcast", { event: "exercise_draft" }, ({ payload }) => handlers.onExerciseDraft?.(payload))
      .on("broadcast", { event: "shared_state" }, ({ payload }) => handlers.onSharedState?.(payload))
      .on("broadcast", { event: "state_request" }, ({ payload }) => handlers.onStateRequest?.(payload))
      .on("broadcast", { event: "state_snapshot" }, ({ payload }) => handlers.onStateSnapshot?.(payload))
      .on("broadcast", { event: "lesson_started" }, ({ payload }) => handlers.onLessonStarted?.(payload))
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "exercise_responses",
        filter: `session_id=eq.${session.id}`
      }, ({ new: row }) => handlers.onExerciseDatabaseChange?.(row))
      .on("presence", { event: "sync" }, () => handlers.onPresence?.(channel.presenceState()))
      .on("presence", { event: "join" }, ({ newPresences }) => handlers.onJoin?.(newPresences))
      .on("presence", { event: "leave" }, ({ leftPresences }) => handlers.onLeave?.(leftPresences));

    let subscribedOnce = false;
    await new Promise((resolve, reject) => {
      channel.subscribe(async (status, error) => {
        if (error) reject(error);
        if (status === "SUBSCRIBED") {
          await channel.track({
            user_id: user.id,
            role: state.role,
            online_at: new Date().toISOString()
          });
          const reconnect = subscribedOnce; subscribedOnce = true;
          resolve();
          if (reconnect) Promise.resolve(handlers.onReconnect?.()).catch(console.error);
        }
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          reject(error || new Error(status));
        }
      });
    });

    state.channel = channel;
    restorePendingSnapshots();
    return { session, role: state.role };
  }


  async function resolveGuestLink(token) {
    if (!client || !token) return null;
    const { data, error } = await guestRPC("resolve_guest_lesson_link", { p_token: token });
    if (error) throw error;
    return data || null;
  }

  // Live edits travel over private WebSocket channels; snapshots are only persistence.
  // The separate control channel grants send permission only to the authenticated owner.
  let guestPollTimer=null,guestPoll=null,guestClosed=false;
  let guestAnswers=null,guestControl=null,guestRealtimeReady=false,guestChannelsTopic=null;
  let guestHandlers={},guestValidatedUntil=0,guestNavigationEpoch=0;
  const guestUsable=()=>!guestClosed&&Date.now()<guestValidatedUntil;
  async function closeGuestTransport(){
    if(guestClosed)return;
    guestClosed=true;guestRealtimeReady=false;clearTimeout(guestPollTimer);
    draftTimers.forEach(clearTimeout);draftTimers.clear();state.channel=null;
    const channels=[guestAnswers,guestControl].filter(Boolean);guestAnswers=guestControl=null;guestChannelsTopic=null;
    channels.forEach(channel=>client.removeChannel(channel).catch(()=>{}));
    guestHandlers.onEnded?.();
  }
  function connectGuestChannels(meta){
    if(!meta.room_topic||guestClosed||guestChannelsTopic===meta.room_topic)return;
    guestChannelsTopic=meta.room_topic;
    const receive=handler=>({payload})=>{
      if(!guestUsable()||payload?.source_id===state.clientId)return;
      handler?.(payload);
    };
    guestAnswers=client.channel(meta.room_topic+':answers',{config:{private:true,broadcast:{self:false,ack:true},presence:{key:state.clientId}}});
    guestControl=client.channel(meta.room_topic+':control',{config:{private:true,broadcast:{self:false,ack:true}}});
    guestAnswers
      .on('broadcast',{event:'exercise_draft'},receive(guestHandlers.onExerciseDraft))
      .on('broadcast',{event:'exercise_response'},receive(guestHandlers.onExerciseResponse))
      .on('broadcast',{event:'state_snapshot'},receive(guestHandlers.onStateSnapshot))
      .on('broadcast',{event:'state_request'},receive(guestHandlers.onStateRequest))
      .on('broadcast',{event:'word_focus'},receive(guestHandlers.onWordFocus))
      .on('broadcast',{event:'audio_request'},receive(guestHandlers.onAudioRequest))
      .on('presence',{event:'sync'},()=>guestHandlers.onPresence?.(guestAnswers?.presenceState()||{}))
      .subscribe(status=>{
        guestRealtimeReady=status==='SUBSCRIBED';
        if(guestRealtimeReady){
          guestAnswers.track({role:state.role,client_id:state.clientId}).catch(()=>{});
          // Replay the newest unsaved values after a socket reconnect; never wait for DB.
          for(const [id,response] of pendingSnapshots)broadcast('exercise_draft',{exercise_id:id,response,source_id:state.clientId,seq:nextSequence(id),sent_at:Date.now()}).catch(()=>{});
          broadcast('state_request',{exercise_id:state.currentExerciseId,source_id:state.clientId}).catch(()=>{});
          guestHandlers.onWordFocusReady?.();
        }
      });
    guestControl
      .on('broadcast',{event:'navigate'},receive(payload=>{guestNavigationEpoch++;guestHandlers.onNavigate?.(payload);}))
      .on('broadcast',{event:'audio'},receive(guestHandlers.onAudio))
      .on('broadcast',{event:'lesson_closed'},()=>closeGuestTransport())
      .subscribe(status=>{if(status==='SUBSCRIBED')guestHandlers.onAudioReady?.();});
  }
  async function connectGuest(token, handlers = {}) {
    if (!client) throw new Error('Supabase client is not ready.');
    const meta=await resolveGuestLink(token);
    if(!meta){const error=new Error('Ссылка закрыта или срок её действия истёк.');error.code='GUEST_LINK_CLOSED';throw error;}
    const user=await getCurrentUser();
    state.guestToken=token;state.role=meta.is_host?'teacher':'student';
    state.user=user||{id:`guest-${state.clientId}`};
    state.session={id:`guest:${token.slice(0,8)}`,room_topic:null,allowed_lesson_ids:meta.allowed_lesson_ids||[],expires_at:meta.expires_at,guest:true};
    if(state.channel&&!state.channel.polling)await client.removeChannel(state.channel);
    guestHandlers=handlers;guestClosed=false;guestValidatedUntil=Date.now()+15000;state.currentExerciseId=meta.current_exercise_id||null;
    state.channel={polling:true,presenceState:()=>guestAnswers?.presenceState()||{}};
    connectGuestChannels(meta);
    let lastRoute='',lastResponse='',offline=false,busy=false;
    guestPoll=async()=>{
      if(guestClosed||busy)return;
      busy=true;clearTimeout(guestPollTimer);const navigationEpoch=guestNavigationEpoch;
      try{
        const {data,error}=await guestRPC('read_guest_workspace',{p_token:token});
        if(error)throw error;
        if(guestClosed)return;
        if(!data){await closeGuestTransport();return;}
        guestValidatedUntil=Date.now()+15000;
        connectGuestChannels(data);
        Object.assign(state.session,{started_at:data.started_at,status:data.status,duration_minutes:data.duration_minutes});
        state.currentExerciseId=data.current_exercise_id;
        handlers.onLessonState?.(data);
        if(offline){offline=false;Promise.resolve(handlers.onReconnect?.()).catch(console.error);}
        handlers.onConnectionState?.(true);
        const route=JSON.stringify([data.current_page_id,data.current_exercise_id]);
        if(route!==lastRoute&&navigationEpoch===guestNavigationEpoch){lastRoute=route;handlers.onNavigate?.(data);}
        const snapshot=JSON.stringify([data.current_exercise_id,data.response]);
        if(snapshot!==lastResponse){lastResponse=snapshot;if(data.response)handlers.onExerciseDatabaseChange?.({exercise_id:data.current_exercise_id,response:data.response,is_draft:true});}
      }catch(error){offline=true;handlers.onConnectionState?.(guestRealtimeReady&&guestUsable());}
      finally{busy=false;if(!guestClosed)guestPollTimer=setTimeout(guestPoll,offline?1000:guestRealtimeReady?4000:900);}
    };
    restorePendingSnapshots();guestPollTimer=setTimeout(guestPoll,0);
    return {session:state.session,role:state.role,meta};
  }

  window.addEventListener?.('online',()=>guestPoll?.());
  window.addEventListener?.('focus',()=>guestPoll?.());

  // Bound slow HTTP reads/writes so retries cannot leave a transport permanently busy.
  async function guestRPC(name,args){
    const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),7000);
    try{const query=client.rpc(name,args);return await (query.abortSignal?query.abortSignal(controller.signal):query);}
    finally{clearTimeout(timeout);}
  }

  async function startGuestLesson() {
    if(state.role!=='teacher'||!state.guestToken)throw new Error('Only the teacher can start the lesson.');
    const {data,error}=await guestRPC('start_guest_lesson',{p_token:state.guestToken});
    if(error)throw error;
    if(!data?.started_at)throw new Error('Не удалось начать занятие. Повторите попытку.');
    Object.assign(state.session,{started_at:data.started_at,status:data.status,duration_minutes:data.duration_minutes});
    connectGuestChannels(data);
    return data;
  }

  async function broadcast(event, payload) {
    if(state.guestToken){
      if(guestClosed||!state.channel)throw new Error('Занятие закрыто.');
      if(event==='audio'&&state.role!=='teacher')throw new Error('Only the teacher can control shared audio.');
      if(!guestUsable())throw new Error('Подтверждаем соединение с занятием.');
      const channel=['navigate','audio'].includes(event)?guestControl:guestAnswers;
      if(!channel||channel.state!=='joined')return 'fallback';
      const result=await channel.send({type:'broadcast',event,payload});
      if(result!=='ok')guestPoll?.();
      return result;

    }
    if (!state.channel) throw new Error("Lesson realtime channel is not connected.");
    const result = await state.channel.send({
      type: "broadcast",
      event,
      payload
    });
    if (result !== "ok") throw new Error("Realtime message was not delivered.");
    return result;
  }

  async function startLesson() {
    if (state.role !== "teacher") {
      throw new Error("Only the teacher can start the lesson.");
    }
    const startedAt = new Date().toISOString();
    const { error } = await client
      .from("lesson_sessions")
      .update({
        status: "live",
        started_at: startedAt,
        waiting_room_opened_at: startedAt
      })
      .eq("id", state.session.id);

    if (error) throw error;
    state.session.status = "live";
    await broadcast("lesson_started", {
      session_id: state.session.id,
      started_at: startedAt
    });
  }

  async function navigate(currentExerciseId, currentPageId = null) {
    if (state.role !== "teacher") {
      throw new Error("Only the teacher can control lesson navigation.");
    }

    const payload = {
      session_id: state.session.id,
      current_page_id: currentPageId,
      current_exercise_id: currentExerciseId,
      updated_by: state.user.id
    };

    if (state.guestToken) {
      const { data, error } = await guestRPC("save_guest_lesson_navigation", {
        p_token: state.guestToken,
        p_current_page_id: currentPageId,
        p_current_exercise_id: currentExerciseId
      });
      if (error) throw error;
      if (!data) throw new Error("Guest lesson navigation is no longer authorized.");
      return broadcast("navigate", payload);
    }

    const { error } = await client
      .from("lesson_state")
      .update(payload)
      .eq("session_id", state.session.id);

    if (error) throw error;
    return broadcast("navigate", payload);
  }

  async function syncAudio(audioState) {
    if (state.role !== "teacher") {
      throw new Error("Only the teacher can control shared audio.");
    }

    const payload = {
      ...audioState,
      sent_at: Date.now()
    };

    if (state.guestToken) return broadcast("audio", payload);

    // Playback control uses the socket immediately, never a database round trip.
    return broadcast("audio", payload);
  }

  async function loadExerciseResponse(exerciseId) {
    if (!state.session || !state.user) return null;

    if (state.guestToken) {
      const { data, error } = await guestRPC("resolve_guest_lesson_link", { p_token: state.guestToken });
      if (error) throw error;
      const response = data?.responses?.[exerciseId];
      return response ? { exercise_id: exerciseId, response, is_draft: true } : null;
    }

    let query = client
      .from("exercise_responses")
      .select("id,session_id,student_id,exercise_id,response,is_correct,submitted_at,updated_at,is_draft")
      .eq("session_id", state.session.id)
      .eq("exercise_id", exerciseId)
      .order("updated_at", { ascending: false })
      .limit(1);

    if (state.role === "student") {
      query = query.eq("student_id", state.user.id);
    }

    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    return data || null;
  }

  const draftTimers = new Map();
  const pendingSnapshots = new Map(), savingSnapshots = new Map();
  const pendingKey = () => `space-whale:pending-snapshots:${state.guestToken || state.session?.id}:${state.guestToken ? state.role : state.user?.id}`;
  function storePendingSnapshots(){try{window.sessionStorage?.setItem(pendingKey(),JSON.stringify([...pendingSnapshots]));}catch(_) {}}
  function restorePendingSnapshots(){
    try{const saved=JSON.parse(window.sessionStorage?.getItem(pendingKey())||'[]');for(const [id,response] of saved)pendingSnapshots.set(id,response);}catch(_){}
    for(const id of pendingSnapshots.keys()) scheduleSnapshot(id,0);
  }
  const getPendingSnapshot = id => pendingSnapshots.get(id);
  function scheduleSnapshot(id,delay=guestRealtimeReady?1500:150){
    if(state.guestToken&&guestClosed)return;
    // Fixed upper wait: continuous typing must never postpone saving indefinitely.
    if(draftTimers.has(id))return;
    draftTimers.set(id,setTimeout(()=>{draftTimers.delete(id);return flushSnapshot(id);},delay));
  }
  async function flushSnapshot(id){
    if(state.guestToken&&guestClosed)return;
    if(savingSnapshots.has(id))return savingSnapshots.get(id);
    if(!pendingSnapshots.has(id))return;
    const response=pendingSnapshots.get(id);
    const work=(async()=>{
      let failed=false;
      try{await persistDraftSnapshot(id,response);if(pendingSnapshots.get(id)===response){pendingSnapshots.delete(id);storePendingSnapshots();}}
      catch(error){failed=true;console.error('[Space Whale] Snapshot pending; will retry',error);}
      finally{savingSnapshots.delete(id);if(pendingSnapshots.has(id))scheduleSnapshot(id,failed?1000:0);}
    })();
    savingSnapshots.set(id,work);return work;
  }
  async function flushPendingSnapshots(){await Promise.all([...pendingSnapshots.keys()].map(flushSnapshot));}


  async function persistDraftSnapshot(exerciseId, response) {
    if (state.guestToken) {
      const { data, error } = await guestRPC(response?.__sw_collab === 1 ? "merge_guest_lesson_response" : "save_guest_lesson_response", {
        p_token: state.guestToken,
        p_exercise_id: exerciseId,
        p_response: response
      });
      if (error) throw error;
      if (!data) throw new Error("Guest lesson link is no longer active.");
      return;
    }

    const record = {
      session_id: state.session.id,
      student_id: state.user.id,
      exercise_id: exerciseId,
      response,
      is_correct: null,
      submitted_at: null,
      is_draft: true
    };

    const { error } = await client
      .from("exercise_responses")
      .upsert(record, { onConflict: "session_id,student_id,exercise_id" });

    if (error) throw error;
  }

  function queueGuestSnapshot(exerciseId,response){
    if(state.guestToken&&guestClosed)return;
    // Clone now so later UI edits cannot change a save already in flight.
    pendingSnapshots.set(exerciseId,JSON.parse(JSON.stringify(response)));
    storePendingSnapshots();scheduleSnapshot(exerciseId);
  }

  async function sendExerciseDraft(exerciseId, response) {
    if (state.role !== "student" && !(state.guestToken && state.role === "teacher")) {
      throw new Error("Exercise drafts are sent by the student.");
    }

    const payload = {
      exercise_id: exerciseId,
      response,
      student_id: state.user.id,
      draft: true,
      source_id: state.clientId,
      seq: nextSequence(exerciseId),
      sent_at: Date.now()
    };

    const sendPromise = broadcast("exercise_draft", payload);

    queueGuestSnapshot(exerciseId, response);

    return sendPromise;
  }

  async function saveExerciseResponse(exerciseId, response, options = {}) {
    if (state.role !== "student") {
      throw new Error("Exercise responses are saved by the student.");
    }

    if (state.guestToken) {
      await persistDraftSnapshot(exerciseId, response);
      const payload = {
        exercise_id: exerciseId,
        response,
        is_correct: options.isCorrect ?? null,
        submitted_at: options.submitted ? new Date().toISOString() : null,
        student_id: state.user.id,
        source_id: state.clientId,
        seq: nextSequence(exerciseId),
        sent_at: Date.now()
      };
      await broadcast("exercise_response", payload);
      return payload;
    }

    const record = {
      session_id: state.session.id,
      student_id: state.user.id,
      exercise_id: exerciseId,
      response,
      is_correct: options.isCorrect ?? null,
      submitted_at: options.submitted ? new Date().toISOString() : null,
      is_draft: false
    };

    const { data, error } = await client
      .from("exercise_responses")
      .upsert(record, { onConflict: "session_id,student_id,exercise_id" })
      .select()
      .single();

    if (error) throw error;

    await broadcast("exercise_response", {
      exercise_id: exerciseId,
      response,
      is_correct: record.is_correct,
      submitted_at: record.submitted_at,
      student_id: state.user.id,
      source_id: state.clientId,
      seq: nextSequence(exerciseId),
      sent_at: Date.now()
    });

    return data;
  }

  async function requestExerciseState(exerciseId) {
    if(state.guestToken){
      state.currentExerciseId=exerciseId;
      if(guestRealtimeReady)return broadcast('state_request',{exercise_id:exerciseId,source_id:state.clientId});
      return guestPoll?.();
    }
    if (!state.channel || !exerciseId) return;
    return broadcast("state_request", {
      exercise_id: exerciseId,
      requested_by: state.user?.id || null,
      source_id: state.clientId,
      sent_at: Date.now()
    });
  }

  async function sendExerciseSnapshot(exerciseId, response) {
    if(state.guestToken){queueGuestSnapshot(exerciseId,response);return broadcast('state_snapshot',{exercise_id:exerciseId,response,source_id:state.clientId,seq:nextSequence(exerciseId),sent_at:Date.now()});}
    if ((state.role !== "student" && !(state.guestToken && state.role === "teacher")) || !state.channel || !exerciseId) return;
    return broadcast("state_snapshot", {
      exercise_id: exerciseId,
      response,
      student_id: state.user.id,
      draft: true,
      source_id: state.clientId,
      seq: nextSequence(exerciseId),
      sent_at: Date.now()
    });
  }

  async function disconnect() {
    await flushPendingSnapshots();
    guestClosed=true;guestRealtimeReady=false;clearTimeout(guestPollTimer);guestPollTimer=null;guestPoll=null;
    await Promise.all([guestAnswers,guestControl].filter(Boolean).map(channel=>client.removeChannel(channel)));
    guestAnswers=guestControl=null;guestChannelsTopic=null;
    draftTimers.forEach(timer => clearTimeout(timer));
    draftTimers.clear();
    if (!client || !state.channel) return;
    if(!state.channel.polling)await client.removeChannel(state.channel);
    state.channel = null;
    state.session = null;
    state.role = null;
    state.guestToken = null;
  }

  window.SpaceWhaleClassroom = {
    connect,
    connectGuest,
    startGuestLesson,
    resolveGuestLink,
    disconnect,
    getCurrentUser,
    loadSession,
    loadSharedState,
    loadExerciseResponse,
    navigate,
    startLesson,
    syncAudio,
    sendExerciseDraft,
    queueGuestSnapshot,
    getPendingSnapshot,
    flushPendingSnapshots,
    saveExerciseResponse,
    requestExerciseState,
    sendExerciseSnapshot,
    broadcast,
    state
  };
})();
