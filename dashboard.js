(() => {
  const client = window.spaceWhaleSupabase;
  const auth = window.SpaceWhaleAuth;

  let session;
  let profile;
  let workspaceId;
  let students = [];
  let lessons = [];
  let entitlements = [];
  let products = [];
  let studentMap = new Map();

  const el = (id) => document.getElementById(id);

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function startOfDay(date = new Date()) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function endOfDay(date = new Date()) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
  }

  function startOfWeek(date = new Date()) {
    const d = startOfDay(date);
    const day = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - day);
    return d;
  }

  function endOfWeek(date = new Date()) {
    const d = startOfWeek(date);
    d.setDate(d.getDate() + 7);
    return d;
  }

  function sameDay(value, date = new Date()) {
    if (!value) return false;
    const d = new Date(value);
    return d.getFullYear() === date.getFullYear() &&
      d.getMonth() === date.getMonth() &&
      d.getDate() === date.getDate();
  }

  function formatTime(value) {
    if (!value) return "Time not set";
    return new Intl.DateTimeFormat(undefined, {
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(value));
  }

  function formatDateTime(value) {
    if (!value) return "Time not set";
    return new Intl.DateTimeFormat(undefined, {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(value));
  }

  function formatDay(value) {
    if (!value) return "";
    return new Intl.DateTimeFormat(undefined, {
      weekday: "short",
      day: "numeric",
      month: "short"
    }).format(new Date(value));
  }

  function formatPrice(amountMinor, currency = "RUB") {
    if (amountMinor == null) return "Price not set";
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency
    }).format(amountMinor / 100);
  }

  function canJoin(lesson) {
    if (lesson.status === "live") return true;
    if (lesson.status !== "scheduled" || !lesson.scheduled_at) return false;
    const openAt = new Date(lesson.scheduled_at).getTime() - Number(lesson.join_window_minutes || 5) * 60000;
    return Date.now() >= openAt;
  }

  function studentName(studentId) {
    return studentMap.get(studentId)?.display_name || "Student";
  }

  function renderAvatar(target, url, name) {
    if (!target) return;
    const initial = escapeHtml((name || "T").trim().charAt(0).toUpperCase());
    target.innerHTML = url
      ? `<img src="${escapeHtml(url)}" alt="">`
      : `<span>${initial}</span>`;
  }

  function setGreeting() {
    const hour = new Date().getHours();
    const word = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
    const firstName = (profile.display_name || "Teacher").trim().split(/\s+/)[0];
    el("greeting").textContent = `${word}, ${firstName}`;
    el("todayLabel").textContent = new Intl.DateTimeFormat(undefined, {
      weekday: "long",
      day: "numeric",
      month: "long"
    }).format(new Date());
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
    if (!data?.workspace_id) throw new Error("Your teaching space is not ready yet.");
    workspaceId = data.workspace_id;
  }

  async function loadStudents() {
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
      studentMap = new Map();
      return;
    }

    const { data: profiles, error: profileError } = await client
      .from("profiles")
      .select("id,display_name,avatar_url")
      .in("id", ids)
      .order("display_name", { ascending: true });

    if (profileError) throw profileError;

    students = profiles || [];
    studentMap = new Map(students.map((student) => [student.id, student]));
  }

  async function loadLessons() {
    const from = new Date();
    from.setDate(from.getDate() - 1);
    const to = new Date();
    to.setDate(to.getDate() + 31);

    const { data, error } = await client
      .from("lesson_sessions")
      .select("id,title,status,scheduled_at,duration_minutes,join_window_minutes,student_id")
      .eq("workspace_id", workspaceId)
      .eq("teacher_id", session.user.id)
      .in("status", ["scheduled", "live"])
      .gte("scheduled_at", from.toISOString())
      .lt("scheduled_at", to.toISOString())
      .order("scheduled_at", { ascending: true });

    if (error) throw error;
    lessons = data || [];
  }

  async function loadEntitlements() {
    const { data, error } = await client
      .from("access_entitlements")
      .select("id,user_id,status,remaining_uses,ends_at,starts_at")
      .eq("workspace_id", workspaceId)
      .eq("status", "active");

    if (error) throw error;
    entitlements = data || [];
  }

  async function loadProducts() {
    const { data, error } = await client
      .from("billing_products")
      .select("id,code,name,description,amount_minor,currency,active,included_uses,access_duration_days,created_at")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    products = data || [];
  }

  async function loadAdminStatus() {
    const { data } = await client
      .from("platform_admins")
      .select("user_id")
      .eq("user_id", session.user.id)
      .maybeSingle();

    el("adminBadge").hidden = !data;
  }

  function renderMetrics() {
    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);

    const today = lessons.filter((lesson) => sameDay(lesson.scheduled_at, now));
    const week = lessons.filter((lesson) => {
      const time = new Date(lesson.scheduled_at);
      return time >= weekStart && time < weekEnd;
    });

    const lowStudentIds = new Set(
      entitlements
        .filter((item) => item.remaining_uses != null && item.remaining_uses <= 2 && item.remaining_uses > 0)
        .map((item) => item.user_id)
    );

    el("metricStudents").textContent = String(students.length);
    el("metricToday").textContent = String(today.length);
    el("metricWeek").textContent = String(week.length);
    el("metricLowBalance").textContent = String(lowStudentIds.size);
    el("studentsCountLabel").textContent = `${students.length} active`;
  }

  function renderNextLesson() {
    const now = Date.now();
    const next = lessons.find((lesson) =>
      lesson.status === "live" ||
      (lesson.scheduled_at && new Date(lesson.scheduled_at).getTime() >= now)
    );

    if (!next) {
      el("nextLessonCard").innerHTML = `
        <div class="teacher-empty">
          <strong>No upcoming lesson</strong>
          <span>Schedule your next lesson when you're ready.</span>
          <button class="teacher-text-button" type="button" data-open-schedule>+ Schedule lesson</button>
        </div>
      `;
      return;
    }

    const action = canJoin(next)
      ? `<a class="sw-button" href="waiting-room.html?session=${encodeURIComponent(next.id)}">Open lesson</a>`
      : `<span class="next-lesson-note">Opens 5 min before</span>`;

    el("nextLessonCard").innerHTML = `
      <div class="next-lesson-time">${escapeHtml(formatTime(next.scheduled_at))}</div>
      <div class="next-lesson-details">
        <div class="next-lesson-day">${escapeHtml(formatDay(next.scheduled_at))}</div>
        <h3>${escapeHtml(next.title || "English lesson")}</h3>
        <p>${escapeHtml(studentName(next.student_id))} · ${Number(next.duration_minutes || 60)} min</p>
      </div>
      <div class="next-lesson-action">${action}</div>
    `;
  }

  function renderAttention() {
    const now = Date.now();
    const inSevenDays = now + 7 * 86400000;

    const low = entitlements.filter((item) =>
      item.remaining_uses != null && item.remaining_uses > 0 && item.remaining_uses <= 2
    );

    const expiring = entitlements.filter((item) =>
      item.ends_at &&
      new Date(item.ends_at).getTime() > now &&
      new Date(item.ends_at).getTime() <= inSevenDays
    );

    const studentWithUpcoming = new Set(
      lessons
        .filter((lesson) => lesson.scheduled_at && new Date(lesson.scheduled_at).getTime() >= now)
        .map((lesson) => lesson.student_id)
    );
    const noUpcoming = students.filter((student) => !studentWithUpcoming.has(student.id));

    const items = [];
    if (low.length) {
      items.push({
        value: new Set(low.map((item) => item.user_id)).size,
        title: "Low lesson balance",
        copy: "Students with 1–2 lessons remaining"
      });
    }
    if (expiring.length) {
      items.push({
        value: new Set(expiring.map((item) => item.user_id)).size,
        title: "Package expiring soon",
        copy: "Access ends within 7 days"
      });
    }
    if (noUpcoming.length) {
      items.push({
        value: noUpcoming.length,
        title: "No next lesson",
        copy: "Active students without an upcoming booking"
      });
    }

    if (!items.length) {
      el("attentionList").innerHTML = `
        <div class="attention-clear">
          <span>✓</span>
          <div><strong>Nothing urgent</strong><p>Your schedule and balances look good.</p></div>
        </div>
      `;
      return;
    }

    el("attentionList").innerHTML = items.map((item) => `
      <div class="attention-row">
        <span class="attention-value">${item.value}</span>
        <div><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.copy)}</p></div>
      </div>
    `).join("");
  }

  function lessonRow(lesson, showDay = false) {
    const action = canJoin(lesson)
      ? `<a class="teacher-row-action" href="waiting-room.html?session=${encodeURIComponent(lesson.id)}">Open</a>`
      : '<span class="teacher-row-muted">Scheduled</span>';

    return `
      <article class="teacher-list-row">
        <div class="lesson-time-block">
          <strong>${escapeHtml(formatTime(lesson.scheduled_at))}</strong>
          ${showDay ? `<span>${escapeHtml(formatDay(lesson.scheduled_at))}</span>` : ""}
        </div>
        <div class="teacher-row-main">
          <strong>${escapeHtml(lesson.title || "English lesson")}</strong>
          <span>${escapeHtml(studentName(lesson.student_id))} · ${Number(lesson.duration_minutes || 60)} min</span>
        </div>
        <span class="lesson-status">${escapeHtml(lesson.status)}</span>
        ${action}
      </article>
    `;
  }

  function renderSchedule() {
    const now = new Date();
    const today = lessons.filter((lesson) => sameDay(lesson.scheduled_at, now));
    const sevenDays = Date.now() + 7 * 86400000;
    const upcoming = lessons.filter((lesson) => {
      const time = new Date(lesson.scheduled_at).getTime();
      return !sameDay(lesson.scheduled_at, now) && time > Date.now() && time <= sevenDays;
    });

    el("todayLessons").innerHTML = today.length
      ? today.map((lesson) => lessonRow(lesson)).join("")
      : '<div class="teacher-empty compact"><strong>No lessons today</strong><span>Your day is clear.</span></div>';

    el("upcomingLessons").innerHTML = upcoming.length
      ? upcoming.map((lesson) => lessonRow(lesson, true)).join("")
      : '<div class="teacher-empty compact"><strong>No lessons in the next 7 days</strong><span>New bookings will appear here.</span></div>';
  }

  function renderStudents() {
    const grid = el("studentsGrid");

    if (!students.length) {
      grid.innerHTML = `
        <div class="teacher-empty student-empty">
          <strong>No students yet</strong>
          <span>Once a student is connected to your account, they will appear here with their lesson balance and next class.</span>
        </div>
      `;
      return;
    }

    const now = Date.now();

    grid.innerHTML = students.map((student) => {
      const activeEntitlement = entitlements.find((item) =>
        item.user_id === student.id &&
        (!item.ends_at || new Date(item.ends_at).getTime() > now) &&
        (item.remaining_uses == null || item.remaining_uses > 0)
      );

      const nextLesson = lessons.find((lesson) =>
        lesson.student_id === student.id &&
        lesson.scheduled_at &&
        new Date(lesson.scheduled_at).getTime() >= now
      );

      let balance = "Access active";
      if (!activeEntitlement) balance = "No active package";
      else if (activeEntitlement.remaining_uses != null) balance = `${activeEntitlement.remaining_uses} lessons left`;

      return `
        <article class="student-card">
          <div class="student-card-top">
            <div class="student-card-avatar">
              ${student.avatar_url ? `<img src="${escapeHtml(student.avatar_url)}" alt="">` : `<span>${escapeHtml((student.display_name || "S").charAt(0).toUpperCase())}</span>`}
            </div>
            <div>
              <strong>${escapeHtml(student.display_name || "Student")}</strong>
              <span>${escapeHtml(balance)}</span>
            </div>
          </div>
          <div class="student-next">
            <span>Next lesson</span>
            <strong>${nextLesson ? escapeHtml(formatDateTime(nextLesson.scheduled_at)) : "Not scheduled"}</strong>
          </div>
        </article>
      `;
    }).join("");
  }

  function renderProducts() {
    const grid = el("productsGrid");

    if (!products.length) {
      grid.innerHTML = `
        <div class="teacher-empty">
          <strong>No lesson packages yet</strong>
          <span>Create a package students can purchase, for example 8 lessons for 20,000 ₽.</span>
          <button class="teacher-text-button" type="button" data-open-product>+ Create package</button>
        </div>
      `;
      return;
    }

    grid.innerHTML = products.map((product) => {
      const details = [];
      if (product.included_uses) details.push(`${product.included_uses} lessons`);
      if (product.access_duration_days) details.push(`${product.access_duration_days} days`);

      return `
        <article class="package-card">
          <div>
            <div class="package-status">${product.active ? "Available" : "Hidden"}</div>
            <h3>${escapeHtml(product.name)}</h3>
            <p>${escapeHtml(product.description || details.join(" · ") || "Lesson package")}</p>
          </div>
          <div class="package-bottom">
            <strong>${escapeHtml(formatPrice(product.amount_minor, product.currency || "RUB"))}</strong>
            <button class="teacher-text-button" type="button" data-toggle-product="${escapeHtml(product.id)}">${product.active ? "Hide" : "Publish"}</button>
          </div>
        </article>
      `;
    }).join("");
  }

  function populateStudentSelect() {
    const select = el("studentSelect");
    if (!students.length) {
      select.innerHTML = '<option value="">No students connected yet</option>';
      el("scheduleSubmit").disabled = true;
      return;
    }

    select.innerHTML = students.map((student) =>
      `<option value="${escapeHtml(student.id)}">${escapeHtml(student.display_name || "Student")}</option>`
    ).join("");
    el("scheduleSubmit").disabled = false;
  }

  function openDialog(id) {
    const dialog = el(id);
    if (!dialog) return;
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  }

  function closeDialog(id) {
    const dialog = el(id);
    if (!dialog) return;
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  }

  async function createLesson(event) {
    event.preventDefault();
    const button = el("scheduleSubmit");
    const message = el("scheduleMessage");
    const studentId = el("studentSelect").value;
    const localTime = el("lessonTime").value;

    if (!studentId || !localTime) return;

    button.disabled = true;
    message.textContent = "Scheduling…";

    const { error } = await client.from("lesson_sessions").insert({
      workspace_id: workspaceId,
      teacher_id: session.user.id,
      student_id: studentId,
      title: el("lessonTitle").value.trim() || "English lesson",
      scheduled_at: new Date(localTime).toISOString(),
      duration_minutes: Number(el("duration").value),
      join_window_minutes: 5,
      status: "scheduled"
    });

    if (error) {
      button.disabled = false;
      message.textContent = error.message;
      return;
    }

    event.target.reset();
    el("duration").value = "60";
    message.textContent = "";
    closeDialog("scheduleDialog");
    await loadLessons();
    renderAll();
    populateStudentSelect();
    button.disabled = !students.length;
  }

  async function createProduct(event) {
    event.preventDefault();
    const button = el("productSubmit");
    const message = el("productMessage");
    const uses = el("productUses").value ? Number(el("productUses").value) : null;
    const days = el("productDays").value ? Number(el("productDays").value) : null;

    button.disabled = true;
    message.textContent = "Creating…";

    const { error } = await client.from("billing_products").insert({
      workspace_id: workspaceId,
      teacher_id: session.user.id,
      code: `lesson-${crypto.randomUUID()}`,
      name: el("productName").value.trim(),
      description: el("productDescription").value.trim() || null,
      access_key: "lessons",
      billing_type: uses ? "lesson_pack" : "one_time",
      amount_minor: Math.round(Number(el("productPrice").value) * 100),
      currency: "RUB",
      active: el("productActive").checked,
      included_uses: uses,
      access_duration_days: days
    });

    if (error) {
      button.disabled = false;
      message.textContent = error.message;
      return;
    }

    event.target.reset();
    el("productActive").checked = true;
    message.textContent = "";
    closeDialog("productDialog");
    await loadProducts();
    renderProducts();
    button.disabled = false;
  }

  async function toggleProduct(productId) {
    const product = products.find((item) => item.id === productId);
    if (!product) return;

    const { error } = await client
      .from("billing_products")
      .update({ active: !product.active })
      .eq("id", product.id)
      .eq("workspace_id", workspaceId);

    if (error) throw error;
    await loadProducts();
    renderProducts();
  }

  function renderAll() {
    renderMetrics();
    renderNextLesson();
    renderAttention();
    renderSchedule();
    renderStudents();
    renderProducts();
  }

  function bindEvents() {
    el("logoutButton").addEventListener("click", () => auth.signOut());
    el("openScheduleDialog").addEventListener("click", () => openDialog("scheduleDialog"));
    el("scheduleFromSection").addEventListener("click", () => openDialog("scheduleDialog"));
    el("openProductDialog").addEventListener("click", () => openDialog("productDialog"));
    el("productFromSection").addEventListener("click", () => openDialog("productDialog"));

    document.querySelectorAll("[data-close-dialog]").forEach((button) => {
      button.addEventListener("click", () => closeDialog(button.dataset.closeDialog));
    });

    document.addEventListener("click", async (event) => {
      const scheduleButton = event.target.closest("[data-open-schedule]");
      const productButton = event.target.closest("[data-open-product]");
      const toggleButton = event.target.closest("[data-toggle-product]");

      if (scheduleButton) openDialog("scheduleDialog");
      if (productButton) openDialog("productDialog");

      if (toggleButton) {
        toggleButton.disabled = true;
        try {
          await toggleProduct(toggleButton.dataset.toggleProduct);
        } catch (error) {
          console.error(error);
        } finally {
          toggleButton.disabled = false;
        }
      }
    });

    el("scheduleForm").addEventListener("submit", createLesson);
    el("productForm").addEventListener("submit", createProduct);
  }

  async function init() {
    session = await auth.requireSession();
    if (!session) return;

    profile = await auth.getProfile(session.user.id);
    if (profile.role !== "teacher") {
      location.href = "student-dashboard.html";
      return;
    }

    setGreeting();
    el("sidebarName").textContent = profile.display_name || "Teacher";
    renderAvatar(el("sidebarAvatar"), profile.avatar_url, profile.display_name);

    await loadWorkspace();
    await Promise.all([
      loadStudents(),
      loadLessons(),
      loadEntitlements(),
      loadProducts(),
      loadAdminStatus()
    ]);

    populateStudentSelect();
    renderAll();
    bindEvents();

    el("pageLoading").hidden = true;
    el("teacherApp").hidden = false;
  }

  init().catch((error) => {
    console.error(error);
    el("pageLoading").textContent = error.message;
  });
})();
