(() => {
  const client = window.spaceWhaleSupabase;
  const auth = window.SpaceWhaleAuth;

  const lessonList = document.getElementById("lessonList");
  const teacherPanel = document.getElementById("teacherPanel");
  const profileLabel = document.getElementById("profileLabel");
  const displayNameInput = document.getElementById("displayName");
  const profileMessage = document.getElementById("profileMessage");
  const scheduleMessage = document.getElementById("scheduleMessage");
  const studentSelect = document.getElementById("studentSelect");
  const inviteMessage = document.getElementById("inviteMessage");
  const studentsList = document.getElementById("studentsList");

  let session;
  let profile;

  function formatDate(value) {
    if (!value) return "Time not set";
    return new Intl.DateTimeFormat(undefined, {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(value));
  }

  function canEnterLesson(lesson) {
    if (lesson.status === "live") return true;
    if (!lesson.scheduled_at || lesson.status !== "scheduled") return false;
    const opensAt = new Date(lesson.scheduled_at).getTime() - (lesson.join_window_minutes ?? 5) * 60000;
    return Date.now() >= opensAt;
  }

  function renderLessons(lessons) {
    if (!lessons.length) {
      lessonList.innerHTML = '<div class="sw-message">No lessons scheduled yet.</div>';
      return;
    }

    lessonList.innerHTML = lessons.map((lesson) => {
      const enabled = canEnterLesson(lesson);
      const action = enabled
        ? `<a class="sw-button" href="waiting-room.html?session=${lesson.id}">Join lesson</a>`
        : `<button class="sw-button secondary" type="button" disabled>Available 5 min before</button>`;

      return `
        <article class="lesson-card">
          <div class="lesson-main">
            <div class="lesson-title">${lesson.title || lesson.lesson_id || "English lesson"}</div>
            <div class="lesson-meta">${formatDate(lesson.scheduled_at)} · ${lesson.duration_minutes || 60} min</div>
          </div>
          <div style="display:flex;align-items:center;gap:10px">
            <span class="lesson-status">${lesson.status}</span>
            ${action}
          </div>
        </article>
      `;
    }).join("");
  }

  async function loadLessons() {
    let query = client
      .from("lesson_sessions")
      .select("id,title,course_id,lesson_id,status,scheduled_at,duration_minutes,join_window_minutes,teacher_id,student_id")
      .in("status", ["scheduled", "live"])
      .order("scheduled_at", { ascending: true, nullsFirst: false });

    query = profile.role === "teacher"
      ? query.eq("teacher_id", session.user.id)
      : query.eq("student_id", session.user.id);

    const { data, error } = await query;
    if (error) throw error;
    renderLessons(data || []);
  }

  async function loadStudents() {
    const { data: links, error } = await client
      .from("teacher_students")
      .select("student_id,status")
      .eq("teacher_id", session.user.id)
      .eq("status", "active");

    if (error) throw error;

    const ids = (links || []).map((item) => item.student_id);
    const scheduleButton = document.querySelector("#scheduleForm button[type=submit]");

    if (!ids.length) {
      studentSelect.innerHTML = '<option value="">No students connected yet</option>';
      studentsList.innerHTML = '<div class="sw-message">No students yet. Invite your first student above.</div>';
      scheduleButton.disabled = true;
      return [];
    }

    const { data: students, error: studentError } = await client
      .from("profiles")
      .select("id,display_name")
      .in("id", ids)
      .order("display_name", { ascending: true });

    if (studentError) throw studentError;

    studentSelect.innerHTML = (students || []).map((student) =>
      `<option value="${student.id}">${student.display_name || "Student"}</option>`
    ).join("");

    studentsList.innerHTML = (students || []).map((student) => `
      <div class="student-row">
        <span class="student-avatar">${(student.display_name || "S").trim().charAt(0).toUpperCase()}</span>
        <span class="student-name">${student.display_name || "Student"}</span>
        <span class="lesson-status">active</span>
      </div>
    `).join("");

    scheduleButton.disabled = false;
    return students || [];
  }

  document.getElementById("logoutButton").addEventListener("click", () => auth.signOut());

  document.getElementById("profileForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    profileMessage.textContent = "Saving…";
    const { error } = await client
      .from("profiles")
      .update({
        display_name: displayNameInput.value.trim() || null,
        profile_complete: true
      })
      .eq("id", session.user.id);

    profileMessage.textContent = error ? error.message : "Saved.";
    if (!error) profileLabel.textContent = displayNameInput.value.trim() || session.user.email;
  });

  document.getElementById("inviteStudentForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = event.target.querySelector("button[type=submit]");
    button.disabled = true;
    inviteMessage.textContent = "Sending invitation…";

    const email = document.getElementById("studentEmail").value.trim();
    const displayName = document.getElementById("studentName").value.trim();

    const { data: authData, error: sessionError } = await client.auth.getSession();
    if (sessionError || !authData.session?.access_token) {
      button.disabled = false;
      inviteMessage.textContent = "Your teacher session expired. Please sign in again.";
      return;
    }

    let data;
    try {
      const response = await fetch("https://xpeywyonbapnvtjnwawi.supabase.co/functions/v1/invite-student", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": "sb_publishable_GAp0g1oQSikZ1GA6Z3NxfQ_WpZtdeVy"
        },
        body: JSON.stringify({
          access_token: authData.session.access_token,
          email,
          display_name: displayName
        })
      });
      data = await response.json();
    } catch (error) {
      button.disabled = false;
      inviteMessage.textContent = error.message || "Could not reach the invitation service.";
      return;
    }

    button.disabled = false;

    if (data?.error) {
      inviteMessage.textContent = data.error;
      return;
    }

    if (data?.invite_link) {
      inviteMessage.innerHTML = `
        Email delivery is not configured yet, so I created a temporary sign-in link for testing.
        <div style="margin-top:10px">
          <button id="copyInviteLink" class="sw-button secondary" type="button">Copy student sign-in link</button>
        </div>
      `;
      const copyButton = document.getElementById("copyInviteLink");
      copyButton.addEventListener("click", async () => {
        await navigator.clipboard.writeText(data.invite_link);
        copyButton.textContent = "Copied";
      });
    } else {
      inviteMessage.textContent = data?.invited
        ? "Invitation sent. The student is now linked to your account."
        : "Student linked to your account.";
    }

    event.target.reset();
    await loadStudents();
  });

  document.getElementById("scheduleForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    scheduleMessage.textContent = "Scheduling…";

    const localTime = document.getElementById("lessonTime").value;
    const studentId = studentSelect.value;

    const { error } = await client.from("lesson_sessions").insert({
      teacher_id: session.user.id,
      student_id: studentId,
      title: document.getElementById("lessonTitle").value.trim() || "English lesson",
      scheduled_at: new Date(localTime).toISOString(),
      duration_minutes: Number(document.getElementById("duration").value),
      join_window_minutes: 5,
      status: "scheduled"
    });

    if (error) {
      scheduleMessage.textContent = error.message;
      return;
    }

    scheduleMessage.textContent = "Lesson scheduled.";
    event.target.reset();
    document.getElementById("duration").value = "60";
    await loadLessons();
  });

  async function init() {
    session = await auth.requireSession();
    if (!session) return;

    profile = await auth.getProfile(session.user.id);
    profileLabel.textContent = profile.display_name || session.user.email;
    displayNameInput.value = profile.display_name || "";

    document.getElementById("dashboardTitle").textContent =
      profile.role === "teacher" ? "Teaching dashboard" : "My lessons";
    document.getElementById("dashboardSubtitle").textContent =
      profile.role === "teacher"
        ? "Your upcoming lessons and classroom access."
        : "Your upcoming lessons will appear here.";

    if (profile.role === "teacher") {
      teacherPanel.hidden = false;
      await loadStudents();
    }

    await loadLessons();

    setInterval(loadLessons, 30000);
  }

  init().catch((error) => {
    console.error(error);
    lessonList.innerHTML = `<div class="sw-message">${error.message}</div>`;
  });
})();
