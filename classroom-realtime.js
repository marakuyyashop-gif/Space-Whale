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
      const { data, error } = await client.rpc("resolve_guest_lesson_link", { p_token: state.guestToken });
      if (error) throw error;
      if (!data) return null;
      return {
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

    await new Promise((resolve, reject) => {
      channel.subscribe(async (status, error) => {
        if (error) reject(error);
        if (status === "SUBSCRIBED") {
          await channel.track({
            user_id: user.id,
            role: state.role,
            online_at: new Date().toISOString()
          });
          resolve();
        }
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          reject(error || new Error(status));
        }
      });
    });

    state.channel = channel;
    return { session, role: state.role };
  }


  async function resolveGuestLink(token) {
    if (!client || !token) return null;
    const { data, error } = await client.rpc("resolve_guest_lesson_link", { p_token: token });
    if (error) throw error;
    return data || null;
  }

  async function connectGuest(token, handlers = {}) {
    if (!client) throw new Error("Supabase client is not ready.");
    const meta = await resolveGuestLink(token);
    if (!meta) throw new Error("Guest lesson link is invalid or has expired.");

    const signedInUser = await getCurrentUser();
    state.guestToken = token;
    state.role = meta.is_host ? "teacher" : "student";
    state.user = signedInUser || { id: `guest-${state.clientId}` };
    state.session = {
      id: `guest:${token.slice(0, 8)}`,
      room_topic: meta.room_topic,
      allowed_lesson_ids: Array.isArray(meta.allowed_lesson_ids) ? meta.allowed_lesson_ids : [],
      expires_at: meta.expires_at,
      guest: true
    };

    if (state.channel) {
      await client.removeChannel(state.channel);
      state.channel = null;
    }

    const channel = client.channel(meta.room_topic, {
      config: {
        private: false,
        broadcast: { self: false, ack: true },
        presence: { key: state.role === "teacher" ? `teacher-${state.clientId}` : `guest-${state.clientId}` }
      }
    });

    channel
      .on("broadcast", { event: "navigate" }, async () => {
        try { const saved=await loadSharedState(); if(saved) handlers.onNavigate?.(saved); }
        catch(error) { console.error("Navigation restore failed",error); }
      })
      .on("broadcast", { event: "audio" }, ({ payload }) => handlers.onAudio?.(payload))
      .on("broadcast", { event: "exercise_response" }, ({ payload }) => handlers.onExerciseResponse?.(payload))
      .on("broadcast", { event: "exercise_draft" }, ({ payload }) => handlers.onExerciseDraft?.(payload))
      .on("broadcast", { event: "shared_state" }, ({ payload }) => handlers.onSharedState?.(payload))
      .on("broadcast", { event: "state_request" }, ({ payload }) => handlers.onStateRequest?.(payload))
      .on("broadcast", { event: "state_snapshot" }, ({ payload }) => handlers.onStateSnapshot?.(payload))
      .on("presence", { event: "sync" }, () => handlers.onPresence?.(channel.presenceState()))
      .on("presence", { event: "join" }, ({ newPresences }) => handlers.onJoin?.(newPresences))
      .on("presence", { event: "leave" }, ({ leftPresences }) => handlers.onLeave?.(leftPresences));

    let subscribedOnce = false;
    await new Promise((resolve, reject) => {
      channel.subscribe(async (status, error) => {
        if (error) reject(error);
        if (status === "SUBSCRIBED") {
          await channel.track({
            user_id: state.user.id,
            role: state.role,
            guest: true,
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
    return { session: state.session, role: state.role, meta };
  }

  async function broadcast(event, payload) {
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
      const { data, error } = await client.rpc("save_guest_lesson_navigation", {
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

    const { error } = await client
      .from("lesson_state")
      .update({
        audio_state: payload,
        updated_by: state.user.id
      })
      .eq("session_id", state.session.id);

    if (error) throw error;
    return broadcast("audio", payload);
  }

  async function loadExerciseResponse(exerciseId) {
    if (!state.session || !state.user) return null;

    if (state.guestToken) {
      const { data, error } = await client.rpc("resolve_guest_lesson_link", { p_token: state.guestToken });
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

  async function persistDraftSnapshot(exerciseId, response) {
    if (state.guestToken) {
      const { data, error } = await client.rpc(response?.__sw_collab === 1 ? "merge_guest_lesson_response" : "save_guest_lesson_response", {
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

  function queueGuestSnapshot(exerciseId, response) {
    clearTimeout(draftTimers.get(exerciseId));
    draftTimers.set(exerciseId, setTimeout(() => {
      draftTimers.delete(exerciseId);
      persistDraftSnapshot(exerciseId, response).catch(error => {
        console.error('[Space Whale] Snapshot failed', error);
      });
    }, 750));
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
    if (!state.channel || !exerciseId) return;
    return broadcast("state_request", {
      exercise_id: exerciseId,
      requested_by: state.user?.id || null,
      source_id: state.clientId,
      sent_at: Date.now()
    });
  }

  async function sendExerciseSnapshot(exerciseId, response) {
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
    draftTimers.forEach(timer => clearTimeout(timer));
    draftTimers.clear();
    if (!client || !state.channel) return;
    await client.removeChannel(state.channel);
    state.channel = null;
    state.session = null;
    state.role = null;
    state.guestToken = null;
  }

  window.SpaceWhaleClassroom = {
    connect,
    connectGuest,
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
    saveExerciseResponse,
    requestExerciseState,
    sendExerciseSnapshot,
    broadcast,
    state
  };
})();
