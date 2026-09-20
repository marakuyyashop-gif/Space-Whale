(() => {
  const client = window.spaceWhaleSupabase;

  const state = {
    channel: null,
    session: null,
    user: null,
    role: null
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
      .select("id, teacher_id, student_id, course_id, lesson_id, title, room_topic, status, scheduled_at, duration_minutes, join_window_minutes")
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
    if (!client || !sessionId) return null;

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
      .on("broadcast", { event: "shared_state" }, ({ payload }) => handlers.onSharedState?.(payload))
      .on("broadcast", { event: "lesson_started" }, ({ payload }) => handlers.onLessonStarted?.(payload))
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

  async function broadcast(event, payload) {
    if (!state.channel) throw new Error("Lesson realtime channel is not connected.");
    return state.channel.send({
      type: "broadcast",
      event,
      payload
    });
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

  async function saveExerciseResponse(exerciseId, response, options = {}) {
    if (state.role !== "student") {
      throw new Error("Exercise responses are saved by the student.");
    }

    const record = {
      session_id: state.session.id,
      student_id: state.user.id,
      exercise_id: exerciseId,
      response,
      is_correct: options.isCorrect ?? null,
      submitted_at: options.submitted ? new Date().toISOString() : null
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
      submitted_at: record.submitted_at
    });

    return data;
  }

  async function disconnect() {
    if (!client || !state.channel) return;
    await client.removeChannel(state.channel);
    state.channel = null;
    state.session = null;
    state.role = null;
  }

  window.SpaceWhaleClassroom = {
    connect,
    disconnect,
    getCurrentUser,
    loadSession,
    loadSharedState,
    navigate,
    startLesson,
    syncAudio,
    saveExerciseResponse,
    broadcast,
    state
  };
})();
