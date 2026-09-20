(() => {
  const client = window.spaceWhaleSupabase;
  const auth = window.SpaceWhaleAuth;
  const el = (id) => document.getElementById(id);

  const HOUR_HEIGHT = 64;
  const DEFAULT_START_HOUR = 7;
  const DEFAULT_END_HOUR = 22;

  let session;
  let profile;
  let workspaceId;
  let timezone;
  let weekStartKey;
  let lessons = [];
  let students = [];
  let entitlements = [];
  let studentMap = new Map();
  let calendarStartHour = DEFAULT_START_HOUR;
  let calendarEndHour = DEFAULT_END_HOUR;

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function dateKeyFromParts(parts) {
    return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`;
  }

  function parseDateKey(key) {
    const [year, month, day] = key.split("-").map(Number);
    return { year, month, day };
  }

  function addDays(key, amount) {
    const { year, month, day } = parseDateKey(key);
    const d = new Date(Date.UTC(year, month - 1, day + amount));
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
  }

  function mondayOf(key) {
    const { year, month, day } = parseDateKey(key);
    const d = new Date(Date.UTC(year, month - 1, day));
    const weekday = (d.getUTCDay() + 6) % 7;
    return addDays(key, -weekday);
  }

  function zonedParts(date) {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    });
    const parts = Object.fromEntries(
      formatter.formatToParts(date)
        .filter((part) => part.type !== "literal")
        .map((part) => [part.type, part.value])
    );
    return {
      year: Number(parts.year),
      month: Number(parts.month),
      day: Number(parts.day),
      hour: Number(parts.hour),
      minute: Number(parts.minute)
    };
  }

  function todayKey() {
    return dateKeyFromParts(zonedParts(new Date()));
  }

  function zonedLocalToUtc(localValue) {
    if (!localValue) return null;
    const [datePart, timePart] = localValue.split("T");
    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute] = timePart.split(":").map(Number);
    const desired = Date.UTC(year, month - 1, day, hour, minute);

    let guess = desired;
    for (let i = 0; i < 2; i += 1) {
      const actual = zonedParts(new Date(guess));
      const actualAsUtc = Date.UTC(actual.year, actual.month - 1, actual.day, actual.hour, actual.minute);
      guess += desired - actualAsUtc;
    }
    return new Date(guess);
  }

  function toDatetimeLocal(date) {
    const parts = zonedParts(date);
    return `${dateKeyFromParts(parts)}T${pad(parts.hour)}:${pad(parts.minute)}`;
  }

  function formatWeekRange(startKey) {
    const start = parseDateKey(startKey);
    const end = parseDateKey(addDays(startKey, 6));
    const startDate = new Date(Date.UTC(start.year, start.month - 1, start.day));
    const endDate = new Date(Date.UTC(end.year, end.month - 1, end.day));

    const sameMonth = start.month === end.month;
    const sameYear = start.year === end.year;
    if (sameMonth && sameYear) {
      const month = new Intl.DateTimeFormat(undefined, { month: "long", timeZone: "UTC" }).format(startDate);
      return `${start.day}–${end.day} ${month} ${start.year}`;
    }
    return `${new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", timeZone: "UTC" }).format(startDate)} – ${new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(endDate)}`;
  }

  function dayLabel(key) {
    const { year, month, day } = parseDateKey(key);
    const d = new Date(Date.UTC(year, month - 1, day));
    return {
      weekday: new Intl.DateTimeFormat(undefined, { weekday: "short", timeZone: "UTC" }).format(d),
      day: String(day),
      month: new Intl.DateTimeFormat(undefined, { month: "short", timeZone: "UTC" }).format(d)
    };
  }

  function formatTime(date) {
    const parts = zonedParts(date);
    return `${pad(parts.hour)}:${pad(parts.minute)}`;
  }

  function studentName(id) {
    return studentMap.get(id)?.display_name || "Student";
  }

  function hasActiveAccess(studentId) {
    const now = Date.now();
    return entitlements.some((item) =>
      item.user_id === studentId &&
      item.status === "active" &&
      new Date(item.starts_at).getTime() <= now &&
      (!item.ends_at || new Date(item.ends_at).getTime() > now) &&
      (item.remaining_uses == null || item.remaining_uses > 0)
    );
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

  async function loadStudentsAndAccess() {
    const { data: links, error } = await client
      .from("teacher_students")
      .select("student_id,status")
      .eq("workspace_id", workspaceId)
      .eq("teacher_id", session.user.id)
      .eq("status", "active");

    if (error) throw error;
    const ids = (links || []).map((row) => row.student_id);

    if (!ids.length) {
      students = [];
      entitlements = [];
      studentMap = new Map();
      return;
    }

    const [profilesResult, accessResult] = await Promise.all([
      client.from("profiles")
        .select("id,display_name,avatar_url")
        .in("id", ids)
        .order("display_name", { ascending: true }),
      client.from("access_entitlements")
        .select("user_id,status,remaining_uses,starts_at,ends_at")
        .eq("workspace_id", workspaceId)
        .eq("status", "active")
        .in("user_id", ids)
    ]);

    if (profilesResult.error) throw profilesResult.error;
    if (accessResult.error) throw accessResult.error;

    students = profilesResult.data || [];
    entitlements = accessResult.data || [];
    studentMap = new Map(students.map((student) => [student.id, student]));
  }

  async function loadLessons() {
    const from = zonedLocalToUtc(`${weekStartKey}T00:00`);
    const afterWeek = addDays(weekStartKey, 7);
    const to = zonedLocalToUtc(`${afterWeek}T00:00`);

    const { data, error } = await client
      .from("lesson_sessions")
      .select("id,student_id,title,status,scheduled_at,duration_minutes,join_window_minutes,series_id,series_index,cancelled_at,cancellation_reason")
      .eq("workspace_id", workspaceId)
      .eq("teacher_id", session.user.id)
      .gte("scheduled_at", from.toISOString())
      .lt("scheduled_at", to.toISOString())
      .order("scheduled_at", { ascending: true });

    if (error) throw error;
    lessons = data || [];
    setCalendarRange();
  }

  function setCalendarRange() {
    const active = lessons.filter((lesson) => lesson.status !== "cancelled");
    if (!active.length) {
      calendarStartHour = DEFAULT_START_HOUR;
      calendarEndHour = DEFAULT_END_HOUR;
      return;
    }

    const starts = active.map((lesson) => zonedParts(new Date(lesson.scheduled_at)).hour);
    const ends = active.map((lesson) => {
      const start = zonedParts(new Date(lesson.scheduled_at));
      const endMinutes = start.hour * 60 + start.minute + Number(lesson.duration_minutes || 60);
      return Math.ceil(endMinutes / 60);
    });

    calendarStartHour = Math.max(0, Math.min(DEFAULT_START_HOUR, Math.min(...starts) - 1));
    calendarEndHour = Math.min(24, Math.max(DEFAULT_END_HOUR, Math.max(...ends) + 1));
  }

  function renderHeader() {
    el("weekLabel").textContent = formatWeekRange(weekStartKey);
    el("calendarTimezone").textContent = timezone.replaceAll("_", " ");

    const current = todayKey();
    el("calendarHeader").innerHTML = `
      <div class="calendar-time-header"></div>
      ${Array.from({ length: 7 }, (_, index) => {
        const key = addDays(weekStartKey, index);
        const label = dayLabel(key);
        const todayClass = key === current ? " today" : "";
        return `
          <div class="calendar-day-header${todayClass}">
            <span>${escapeHtml(label.weekday)}</span>
            <strong>${escapeHtml(label.day)}</strong>
            <small>${escapeHtml(label.month)}</small>
          </div>
        `;
      }).join("")}
    `;
  }

  function renderCalendar() {
    const totalHours = calendarEndHour - calendarStartHour;
    const height = totalHours * HOUR_HEIGHT;
    const current = todayKey();

    const hourLabels = Array.from({ length: totalHours + 1 }, (_, index) => {
      const hour = calendarStartHour + index;
      return `<div class="calendar-hour-label" style="top:${index * HOUR_HEIGHT}px">${pad(hour)}:00</div>`;
    }).join("");

    const dayColumns = Array.from({ length: 7 }, (_, index) => {
      const key = addDays(weekStartKey, index);
      const dayLessons = lessons.filter((lesson) => dateKeyFromParts(zonedParts(new Date(lesson.scheduled_at))) === key);

      const eventHtml = dayLessons.map((lesson) => {
        const parts = zonedParts(new Date(lesson.scheduled_at));
        const minutes = parts.hour * 60 + parts.minute - calendarStartHour * 60;
        const top = Math.max(0, (minutes / 60) * HOUR_HEIGHT);
        const rawHeight = (Number(lesson.duration_minutes || 60) / 60) * HOUR_HEIGHT;
        const eventHeight = Math.max(34, rawHeight - 4);
        const cancelledClass = lesson.status === "cancelled" ? " cancelled" : "";
        const liveClass = lesson.status === "live" ? " live" : "";
        return `
          <button class="calendar-event${cancelledClass}${liveClass}"
            type="button"
            data-lesson-id="${escapeHtml(lesson.id)}"
            style="top:${top}px;height:${eventHeight}px">
            <span class="calendar-event-time">${escapeHtml(formatTime(new Date(lesson.scheduled_at)))}</span>
            <strong>${escapeHtml(studentName(lesson.student_id))}</strong>
            <span class="calendar-event-title">${escapeHtml(lesson.title || "English lesson")}</span>
          </button>
        `;
      }).join("");

      return `
        <div class="calendar-day-column${key === current ? " today" : ""}" data-day-key="${key}" style="height:${height}px">
          ${eventHtml}
        </div>
      `;
    }).join("");

    el("calendarBody").innerHTML = `
      <div class="calendar-time-column" style="height:${height}px">${hourLabels}</div>
      ${dayColumns}
    `;

    el("calendarScroll").style.setProperty("--calendar-height", `${height}px`);
  }

  function renderSummary() {
    const active = lessons.filter((lesson) => lesson.status !== "cancelled");
    const studentIds = new Set(active.map((lesson) => lesson.student_id).filter(Boolean));
    const hours = active.reduce((sum, lesson) => sum + Number(lesson.duration_minutes || 60), 0) / 60;

    el("weekLessonCount").textContent = String(active.length);
    el("weekHours").textContent = hours % 1 === 0 ? String(hours) : hours.toFixed(1);
    el("weekStudents").textContent = String(studentIds.size);
  }

  function renderAll() {
    renderHeader();
    renderCalendar();
    renderSummary();
  }

  function populateStudentSelect(selectedId = "") {
    const select = el("studentSelect");
    if (!students.length) {
      select.innerHTML = '<option value="">No students connected yet</option>';
      select.disabled = true;
      return;
    }

    select.disabled = false;
    select.innerHTML = students.map((student) => {
      const access = hasActiveAccess(student.id);
      const selected = selectedId === student.id ? "selected" : "";
      const disabled = !access && selectedId !== student.id ? "disabled" : "";
      return `<option value="${escapeHtml(student.id)}" ${selected} ${disabled}>${escapeHtml(student.display_name || "Student")}${access ? "" : " — payment required"}</option>`;
    }).join("");
  }

  function resetLessonForm() {
    el("lessonForm").reset();
    el("lessonId").value = "";
    el("duration").value = "60";
    el("repeatMode").value = "none";
    el("repeatCount").value = "4";
    el("repeatCountField").hidden = true;
    el("repeatFields").hidden = false;
    el("lessonStatusRow").hidden = true;
    el("cancelLessonButton").hidden = true;
    el("lessonDialogEyebrow").textContent = "NEW LESSON";
    el("lessonDialogTitle").textContent = "Schedule a lesson";
    el("lessonSubmit").textContent = "Schedule";
    el("lessonMessage").textContent = "";
    populateStudentSelect();
  }

  function openNewLesson(localDateTime = "") {
    resetLessonForm();
    if (localDateTime) el("lessonTime").value = localDateTime;
    else {
      const now = zonedParts(new Date(Date.now() + 60 * 60000));
      const roundedMinute = now.minute < 30 ? 30 : 0;
      const hour = now.minute < 30 ? now.hour : (now.hour + 1) % 24;
      const key = dateKeyFromParts(now);
      el("lessonTime").value = `${key}T${pad(hour)}:${pad(roundedMinute)}`;
    }
    openDialog();
  }

  function openEditLesson(lessonId) {
    const lesson = lessons.find((item) => item.id === lessonId);
    if (!lesson) return;

    resetLessonForm();
    el("lessonId").value = lesson.id;
    populateStudentSelect(lesson.student_id);
    el("lessonTitle").value = lesson.title || "";
    el("lessonTime").value = toDatetimeLocal(new Date(lesson.scheduled_at));
    el("duration").value = String(lesson.duration_minutes || 60);
    el("repeatFields").hidden = true;
    el("lessonStatusRow").hidden = false;
    el("lessonStatusValue").textContent = lesson.status;
    el("lessonDialogEyebrow").textContent = lesson.series_id ? "SERIES LESSON" : "LESSON";
    el("lessonDialogTitle").textContent = "Edit lesson";
    el("lessonSubmit").textContent = "Save changes";
    el("cancelLessonButton").hidden = lesson.status === "cancelled" || lesson.status === "completed";
    openDialog();
  }

  function openDialog() {
    const dialog = el("lessonDialog");
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  }

  function closeDialog() {
    const dialog = el("lessonDialog");
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  }

  async function saveLesson(event) {
    event.preventDefault();

    const button = el("lessonSubmit");
    const message = el("lessonMessage");
    const lessonId = el("lessonId").value;
    const studentId = el("studentSelect").value;
    const localTime = el("lessonTime").value;
    const scheduledAt = zonedLocalToUtc(localTime);

    if (!studentId || !scheduledAt) return;

    button.disabled = true;
    message.textContent = lessonId ? "Saving changes…" : "Scheduling…";

    if (lessonId) {
      const { error } = await client
        .from("lesson_sessions")
        .update({
          student_id: studentId,
          title: el("lessonTitle").value.trim() || "English lesson",
          scheduled_at: scheduledAt.toISOString(),
          duration_minutes: Number(el("duration").value)
        })
        .eq("id", lessonId)
        .eq("workspace_id", workspaceId)
        .eq("teacher_id", session.user.id);

      button.disabled = false;
      if (error) {
        message.textContent = error.message;
        return;
      }
    } else {
      const repeatMode = el("repeatMode").value;
      const count = repeatMode === "weekly"
        ? Math.max(2, Math.min(24, Number(el("repeatCount").value || 4)))
        : 1;
      const seriesId = count > 1 ? crypto.randomUUID() : null;
      const baseMs = scheduledAt.getTime();

      const payload = Array.from({ length: count }, (_, index) => ({
        workspace_id: workspaceId,
        teacher_id: session.user.id,
        student_id: studentId,
        title: el("lessonTitle").value.trim() || "English lesson",
        scheduled_at: new Date(baseMs + index * 7 * 86400000).toISOString(),
        duration_minutes: Number(el("duration").value),
        join_window_minutes: 5,
        status: "scheduled",
        series_id: seriesId,
        series_index: seriesId ? index : null
      }));

      const { error } = await client.from("lesson_sessions").insert(payload);

      button.disabled = false;
      if (error) {
        message.textContent = error.message;
        return;
      }
    }

    closeDialog();
    await loadLessons();
    renderAll();
  }

  async function cancelLesson() {
    const lessonId = el("lessonId").value;
    if (!lessonId) return;
    if (!confirm("Cancel this lesson? It will stay in the calendar history as cancelled.")) return;

    const button = el("cancelLessonButton");
    const message = el("lessonMessage");
    button.disabled = true;
    message.textContent = "Cancelling…";

    const { error } = await client
      .from("lesson_sessions")
      .update({ status: "cancelled" })
      .eq("id", lessonId)
      .eq("workspace_id", workspaceId)
      .eq("teacher_id", session.user.id);

    button.disabled = false;
    if (error) {
      message.textContent = error.message;
      return;
    }

    closeDialog();
    await loadLessons();
    renderAll();
  }

  async function changeWeek(offsetDays) {
    weekStartKey = addDays(weekStartKey, offsetDays);
    el("calendarBody").innerHTML = '<div class="calendar-loading">Loading…</div>';
    await loadLessons();
    renderAll();
  }

  function clickEmptySlot(event) {
    if (event.target.closest(".calendar-event")) return;
    const column = event.target.closest(".calendar-day-column");
    if (!column) return;

    const rect = column.getBoundingClientRect();
    const y = event.clientY - rect.top;
    const rawMinutes = calendarStartHour * 60 + (y / HOUR_HEIGHT) * 60;
    const rounded = Math.max(
      calendarStartHour * 60,
      Math.min(calendarEndHour * 60 - 30, Math.round(rawMinutes / 30) * 30)
    );
    const hour = Math.floor(rounded / 60);
    const minute = rounded % 60;
    openNewLesson(`${column.dataset.dayKey}T${pad(hour)}:${pad(minute)}`);
  }

  el("repeatMode").addEventListener("change", () => {
    el("repeatCountField").hidden = el("repeatMode").value !== "weekly";
  });

  el("newLessonButton").addEventListener("click", () => openNewLesson());
  el("prevWeek").addEventListener("click", () => changeWeek(-7).catch(console.error));
  el("nextWeek").addEventListener("click", () => changeWeek(7).catch(console.error));
  el("todayButton").addEventListener("click", async () => {
    weekStartKey = mondayOf(todayKey());
    await loadLessons();
    renderAll();
  });
  el("lessonForm").addEventListener("submit", saveLesson);
  el("cancelLessonButton").addEventListener("click", cancelLesson);
  el("logoutButton").addEventListener("click", () => auth.signOut());
  document.querySelectorAll("[data-close-dialog]").forEach((button) => button.addEventListener("click", closeDialog));

  el("calendarBody").addEventListener("click", (event) => {
    const lessonButton = event.target.closest("[data-lesson-id]");
    if (lessonButton) {
      openEditLesson(lessonButton.dataset.lessonId);
      return;
    }
    clickEmptySlot(event);
  });

  async function init() {
    session = await auth.requireSession();
    if (!session) return;

    profile = await auth.getProfile(session.user.id);
    if (profile.role !== "teacher") {
      location.href = "student-dashboard.html";
      return;
    }

    timezone = profile.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Vilnius";
    weekStartKey = mondayOf(todayKey());

    el("sidebarName").textContent = profile.display_name || "Teacher";
    el("sidebarAvatar").innerHTML = profile.avatar_url
      ? `<img src="${escapeHtml(profile.avatar_url)}" alt="">`
      : `<span>${escapeHtml((profile.display_name || "T").charAt(0).toUpperCase())}</span>`;

    await loadWorkspace();
    await Promise.all([loadStudentsAndAccess(), loadLessons()]);
    populateStudentSelect();
    renderAll();

    el("pageLoading").hidden = true;
    el("teacherApp").hidden = false;
  }

  init().catch((error) => {
    console.error(error);
    el("pageLoading").textContent = error.message;
  });
})();