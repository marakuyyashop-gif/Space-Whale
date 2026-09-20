(() => {
  const client = window.spaceWhaleSupabase;
  const auth = window.SpaceWhaleAuth;
  const el = (id) => document.getElementById(id);
  const studentId = new URLSearchParams(location.search).get("id");

  let session;
  let workspaceId;
  let student;
  let record;
  let roster;
  let entitlement;
  let lessons = [];
  let orders = [];

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function formatDate(value) {
    if (!value) return "—";
    return new Intl.DateTimeFormat(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(value));
  }

  function formatPrice(minor, currency="RUB") {
    return new Intl.NumberFormat("ru-RU",{style:"currency",currency}).format(Number(minor || 0)/100);
  }

  async function loadWorkspace() {
    const { data, error } = await client
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", session.user.id)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (!data?.workspace_id) throw new Error("Teaching space not found.");
    workspaceId = data.workspace_id;
  }

  async function loadStudent() {
    if (!studentId) throw new Error("Student is missing.");

    const { data: rosterRow, error: rosterError } = await client
      .from("workspace_students")
      .select("student_id,status")
      .eq("workspace_id", workspaceId)
      .eq("student_id", studentId)
      .single();

    if (rosterError) throw new Error("Student not found.");
    roster = rosterRow;

    const [profileResult, recordResult, accessResult, lessonsResult, ordersResult] = await Promise.all([
      client.from("profiles")
        .select("id,display_name,avatar_url")
        .eq("id", studentId)
        .single(),
      client.from("student_records")
        .select("contact_email,level,learning_goal,private_notes")
        .eq("workspace_id", workspaceId)
        .eq("student_id", studentId)
        .maybeSingle(),
      client.from("access_entitlements")
        .select("id,status,remaining_uses,starts_at,ends_at,source_order_id")
        .eq("workspace_id", workspaceId)
        .eq("user_id", studentId)
        .eq("status", "active")
        .order("created_at", {ascending:false}),
      client.from("lesson_sessions")
        .select("id,title,status,scheduled_at,duration_minutes")
        .eq("workspace_id", workspaceId)
        .eq("teacher_id", session.user.id)
        .eq("student_id", studentId)
        .order("scheduled_at", {ascending:false}),
      client.from("orders")
        .select("id,status,amount_minor,currency,created_at,paid_at")
        .eq("workspace_id", workspaceId)
        .eq("user_id", studentId)
        .order("created_at", {ascending:false})
    ]);

    if (profileResult.error) throw profileResult.error;
    if (recordResult.error) throw recordResult.error;
    if (accessResult.error) throw accessResult.error;
    if (lessonsResult.error) throw lessonsResult.error;
    if (ordersResult.error) throw ordersResult.error;

    student = profileResult.data;
    record = recordResult.data || {};
    lessons = lessonsResult.data || [];
    orders = ordersResult.data || [];

    const now = Date.now();
    entitlement = (accessResult.data || []).find((item) =>
      new Date(item.starts_at).getTime() <= now &&
      (!item.ends_at || new Date(item.ends_at).getTime() > now) &&
      (item.remaining_uses == null || item.remaining_uses > 0)
    ) || null;
  }

  function renderHeader() {
    el("studentName").textContent = student.display_name || "Student";
    el("studentEmail").textContent = record.contact_email || "Email not available";
    el("studentStatusBadge").textContent = roster.status;
    el("studentStatusBadge").className = `student-status-pill ${roster.status}`;
    el("studentStatus").value = roster.status;

    el("studentAvatar").innerHTML = student.avatar_url
      ? `<img src="${escapeHtml(student.avatar_url)}" alt="">`
      : `<span>${escapeHtml((student.display_name || "S").charAt(0).toUpperCase())}</span>`;
  }

  function renderMetrics() {
    const upcoming = lessons
      .filter((lesson) => ["scheduled","live"].includes(lesson.status) && lesson.scheduled_at && new Date(lesson.scheduled_at).getTime() >= Date.now())
      .sort((a,b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))[0];

    el("detailBalance").textContent =
      !entitlement ? "No package" :
      entitlement.remaining_uses == null ? "Active" :
      `${entitlement.remaining_uses} lessons`;

    el("detailNextLesson").textContent = upcoming ? formatDate(upcoming.scheduled_at) : "Not scheduled";
    el("detailCompleted").textContent = String(lessons.filter((lesson) => lesson.status === "completed").length);
    el("detailExpiry").textContent = entitlement?.ends_at ? formatDate(entitlement.ends_at) : "—";

    if (!entitlement) {
      el("packageSummary").innerHTML = `
        <div class="teacher-empty">
          <strong>No active package</strong>
          <span>The student can purchase a package from their account once you publish one.</span>
        </div>
      `;
    } else {
      const bits = [];
      if (entitlement.remaining_uses != null) bits.push(`${entitlement.remaining_uses} lessons remaining`);
      if (entitlement.ends_at) bits.push(`valid until ${formatDate(entitlement.ends_at)}`);
      el("packageSummary").innerHTML = `
        <div class="access-banner">
          <strong>Access active</strong>
          <span>${escapeHtml(bits.join(" · ") || "Unlimited lesson access")}</span>
        </div>
      `;
    }
  }

  function renderRecord() {
    el("studentLevel").value = record.level || "";
    el("learningGoal").value = record.learning_goal || "";
    el("privateNotes").value = record.private_notes || "";
  }

  function renderLessons() {
    if (!lessons.length) {
      el("lessonHistory").innerHTML = '<div class="sw-message">No lessons yet.</div>';
      return;
    }

    el("lessonHistory").innerHTML = lessons.map((lesson) => `
      <article class="teacher-list-row">
        <div class="lesson-time-block"><strong>${escapeHtml(formatDate(lesson.scheduled_at))}</strong></div>
        <div class="teacher-row-main">
          <strong>${escapeHtml(lesson.title || "English lesson")}</strong>
          <span>${Number(lesson.duration_minutes || 60)} min</span>
        </div>
        <span class="lesson-status">${escapeHtml(lesson.status)}</span>
      </article>
    `).join("");
  }

  function renderOrders() {
    if (!orders.length) {
      el("studentOrders").innerHTML = '<div class="sw-message">No orders yet.</div>';
      return;
    }

    el("studentOrders").innerHTML = orders.map((order) => `
      <article class="teacher-list-row">
        <div class="lesson-time-block"><strong>${escapeHtml(formatDate(order.created_at))}</strong></div>
        <div class="teacher-row-main">
          <strong>${escapeHtml(formatPrice(order.amount_minor, order.currency || "RUB"))}</strong>
          <span>${order.paid_at ? `Paid ${escapeHtml(formatDate(order.paid_at))}` : "Payment not completed"}</span>
        </div>
        <span class="lesson-status">${escapeHtml(order.status)}</span>
      </article>
    `).join("");
  }

  async function saveRecord(event) {
    event.preventDefault();
    const message = el("recordMessage");
    message.textContent = "Saving…";

    const { error: recordError } = await client
      .from("student_records")
      .upsert({
        workspace_id: workspaceId,
        student_id: studentId,
        contact_email: record.contact_email || null,
        level: el("studentLevel").value || null,
        learning_goal: el("learningGoal").value.trim() || null,
        private_notes: el("privateNotes").value.trim() || null
      }, { onConflict: "workspace_id,student_id" });

    if (recordError) {
      message.textContent = recordError.message;
      return;
    }

    const status = el("studentStatus").value;
    const { error: statusError } = await client
      .from("workspace_students")
      .update({ status })
      .eq("workspace_id", workspaceId)
      .eq("student_id", studentId);

    if (statusError) {
      message.textContent = statusError.message;
      return;
    }

    const teacherStudentStatus = status === "archived" ? "archived" : "active";
    await client
      .from("teacher_students")
      .update({ status: teacherStudentStatus })
      .eq("workspace_id", workspaceId)
      .eq("teacher_id", session.user.id)
      .eq("student_id", studentId);

    roster.status = status;
    record.level = el("studentLevel").value || null;
    record.learning_goal = el("learningGoal").value.trim() || null;
    record.private_notes = el("privateNotes").value.trim() || null;
    renderHeader();
    message.textContent = "Student saved.";
  }

  async function scheduleLesson(event) {
    event.preventDefault();
    const button = el("scheduleSubmit");
    const message = el("scheduleMessage");
    button.disabled = true;
    message.textContent = "Scheduling…";

    const { error } = await client.from("lesson_sessions").insert({
      workspace_id: workspaceId,
      teacher_id: session.user.id,
      student_id: studentId,
      title: el("lessonTitle").value.trim() || "English lesson",
      scheduled_at: new Date(el("lessonTime").value).toISOString(),
      duration_minutes: Number(el("duration").value),
      join_window_minutes: 5,
      status: "scheduled"
    });

    button.disabled = false;
    if (error) {
      message.textContent = error.message;
      return;
    }

    closeDialog();
    await loadStudent();
    renderMetrics();
    renderLessons();
  }

  function openDialog() {
    const dialog = el("scheduleDialog");
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open","");
  }

  function closeDialog() {
    const dialog = el("scheduleDialog");
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  }

  el("studentRecordForm").addEventListener("submit", saveRecord);
  el("scheduleForm").addEventListener("submit", scheduleLesson);
  el("scheduleStudentLesson").addEventListener("click", openDialog);
  document.querySelectorAll("[data-close-dialog]").forEach((button) => button.addEventListener("click", closeDialog));

  async function init() {
    session = await auth.requireSession();
    if (!session) return;
    const teacher = await auth.getProfile(session.user.id);
    if (teacher.role !== "teacher") {
      location.href = "student-dashboard.html";
      return;
    }

    await loadWorkspace();
    await loadStudent();
    renderHeader();
    renderMetrics();
    renderRecord();
    renderLessons();
    renderOrders();

    el("detailLoading").hidden = true;
    el("studentDetail").hidden = false;
  }

  init().catch((error) => {
    console.error(error);
    el("detailLoading").textContent = error.message;
  });
})();