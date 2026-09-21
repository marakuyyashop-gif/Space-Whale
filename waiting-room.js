(() => {
  const client = window.spaceWhaleSupabase;
  const auth = window.SpaceWhaleAuth;
  const classroom = window.SpaceWhaleClassroom;

  const params = new URLSearchParams(location.search);
  const sessionId = params.get("session");
  const title = document.getElementById("waitingTitle");
  const copy = document.getElementById("waitingCopy");
  const presenceRow = document.getElementById("presenceRow");
  const startButton = document.getElementById("startButton");
  const backButton = document.getElementById("backButton");
  const message = document.getElementById("waitingMessage");

  let authSession;
  let lesson;
  let role;

  function goToClassroom() {
    location.href = `classroom.html?session=${encodeURIComponent(sessionId)}`;
  }

  function formatDate(value) {
    if (!value) return "Time not set";
    return new Intl.DateTimeFormat(undefined, {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(value));
  }

  function renderPresence(state) {
    const entries = Object.values(state || {}).flat();
    const labels = new Map();
    entries.forEach((item) => {
      if (item.role) labels.set(item.role, true);
    });

    presenceRow.innerHTML = [
      `<span class="presence-pill">Teacher: ${labels.get("teacher") ? "online" : "not here yet"}</span>`,
      `<span class="presence-pill">Student: ${labels.get("student") ? "online" : "not here yet"}</span>`
    ].join("");
  }

  async function init() {
    if (!sessionId) {
      title.textContent = "Lesson not found";
      copy.textContent = "This waiting-room link is missing a lesson session.";
      return;
    }

    authSession = await auth.requireSession();
    if (!authSession) return;

    lesson = await classroom.loadSession(sessionId);
    if (!lesson) throw new Error("Lesson not found.");

    role = lesson.teacher_id === authSession.user.id
      ? "teacher"
      : lesson.student_id === authSession.user.id
        ? "student"
        : null;

    if (!role) throw new Error("You are not a participant in this lesson.");

    backButton.href = role === "teacher" ? "dashboard.html" : "student-dashboard.html";
    backButton.textContent = role === "teacher" ? "Back to teacher home" : "Back to student home";

    title.textContent = lesson.title || "English lesson";

    if (lesson.status === "live") {
      goToClassroom();
      return;
    }

    const { data: canJoin, error: canJoinError } = await client.rpc("can_join_session", {
      p_session_id: sessionId
    });
    if (canJoinError) throw canJoinError;

    if (!canJoin) {
      copy.textContent = `This room opens 5 minutes before the lesson. Scheduled for ${formatDate(lesson.scheduled_at)}.`;
      presenceRow.innerHTML = '<span class="presence-pill">Room not open yet</span>';
      return;
    }

    copy.textContent = role === "teacher"
      ? "You’re in the waiting room. Start the lesson when you’re ready."
      : "You’re in the waiting room. The lesson will open as soon as your teacher starts it.";

    const result = await classroom.connect(sessionId, {
      onPresence: renderPresence,
      onJoin: () => renderPresence(classroom.state.channel?.presenceState?.() || {}),
      onLeave: () => renderPresence(classroom.state.channel?.presenceState?.() || {}),
      onLessonStarted: goToClassroom
    });

    role = result.role;
    renderPresence(classroom.state.channel.presenceState());

    if (role === "teacher") {
      startButton.hidden = false;
    }
  }

  startButton.addEventListener("click", async () => {
    startButton.disabled = true;
    message.textContent = "Starting lesson…";
    try {
      await classroom.startLesson();
      goToClassroom();
    } catch (error) {
      startButton.disabled = false;
      message.textContent = error.message;
    }
  });

  init().catch((error) => {
    console.error(error);
    title.textContent = "Couldn’t open the room";
    copy.textContent = error.message;
  });
})();
