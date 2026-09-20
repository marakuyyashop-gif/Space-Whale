(() => {
  const client = window.spaceWhaleSupabase;
  const auth = window.SpaceWhaleAuth;
  const el = (id) => document.getElementById(id);

  let session;
  let profile;
  let workspaceId;
  let rows = [];
  let invites = [];

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function formatDate(value) {
    if (!value) return "Not scheduled";
    return new Intl.DateTimeFormat(undefined, {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(value));
  }

  function avatarHtml(student) {
    return student.avatar_url
      ? `<img src="${escapeHtml(student.avatar_url)}" alt="">`
      : `<span>${escapeHtml((student.display_name || "S").charAt(0).toUpperCase())}</span>`;
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

  async function loadData() {
    const { data: roster, error: rosterError } = await client
      .from("workspace_students")
      .select("student_id,status,created_at")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });

    if (rosterError) throw rosterError;

    const ids = (roster || []).map((item) => item.student_id);

    let profileRows = [];
    let records = [];
    let entitlements = [];
    let lessons = [];

    if (ids.length) {
      const [profilesResult, recordsResult, accessResult, lessonsResult] = await Promise.all([
        client.from("profiles")
          .select("id,display_name,avatar_url")
          .in("id", ids),
        client.from("student_records")
          .select("student_id,contact_email,level,learning_goal")
          .eq("workspace_id", workspaceId)
          .in("student_id", ids),
        client.from("access_entitlements")
          .select("user_id,status,remaining_uses,ends_at,starts_at")
          .eq("workspace_id", workspaceId)
          .eq("status", "active")
          .in("user_id", ids),
        client.from("lesson_sessions")
          .select("student_id,scheduled_at,status")
          .eq("workspace_id", workspaceId)
          .eq("teacher_id", session.user.id)
          .in("student_id", ids)
          .in("status", ["scheduled","live"])
          .gte("scheduled_at", new Date().toISOString())
          .order("scheduled_at", { ascending: true })
      ]);

      if (profilesResult.error) throw profilesResult.error;
      if (recordsResult.error) throw recordsResult.error;
      if (accessResult.error) throw accessResult.error;
      if (lessonsResult.error) throw lessonsResult.error;

      profileRows = profilesResult.data || [];
      records = recordsResult.data || [];
      entitlements = accessResult.data || [];
      lessons = lessonsResult.data || [];
    }

    const profileMap = new Map(profileRows.map((item) => [item.id, item]));
    const recordMap = new Map(records.map((item) => [item.student_id, item]));
    const now = Date.now();

    rows = (roster || []).map((item) => {
      const p = profileMap.get(item.student_id) || {};
      const record = recordMap.get(item.student_id) || {};
      const access = entitlements.find((entry) =>
        entry.user_id === item.student_id &&
        new Date(entry.starts_at).getTime() <= now &&
        (!entry.ends_at || new Date(entry.ends_at).getTime() > now) &&
        (entry.remaining_uses == null || entry.remaining_uses > 0)
      );
      const nextLesson = lessons.find((lesson) => lesson.student_id === item.student_id);

      return {
        id: item.student_id,
        status: item.status,
        display_name: p.display_name || "Student",
        avatar_url: p.avatar_url || null,
        email: record.contact_email || "",
        level: record.level || "",
        goal: record.learning_goal || "",
        access,
        nextLesson
      };
    });

    const { data: inviteRows, error: inviteError } = await client
      .from("student_invites")
      .select("id,email,display_name,status,expires_at,created_at")
      .eq("workspace_id", workspaceId)
      .eq("teacher_id", session.user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (inviteError) throw inviteError;
    invites = inviteRows || [];
  }

  function renderSummary() {
    const now = Date.now();
    el("summaryActive").textContent = String(rows.filter((row) => row.status === "active").length);
    el("summaryNoPackage").textContent = String(rows.filter((row) => !row.access).length);
    el("summaryLowBalance").textContent = String(rows.filter((row) =>
      row.access?.remaining_uses != null &&
      row.access.remaining_uses > 0 &&
      row.access.remaining_uses <= 2
    ).length);
    el("summaryNoLesson").textContent = String(rows.filter((row) =>
      !row.nextLesson || new Date(row.nextLesson.scheduled_at).getTime() < now
    ).length);
  }

  function balanceLabel(row) {
    if (!row.access) return '<span class="student-balance danger">No package</span>';
    if (row.access.remaining_uses == null) return '<span class="student-balance">Active</span>';
    const cls = row.access.remaining_uses <= 2 ? "warning" : "";
    return `<span class="student-balance ${cls}">${row.access.remaining_uses} lessons</span>`;
  }

  function renderTable() {
    const search = el("studentSearch").value.trim().toLowerCase();
    const status = el("studentStatusFilter").value;

    const filtered = rows.filter((row) => {
      const haystack = `${row.display_name} ${row.email} ${row.level}`.toLowerCase();
      return (!search || haystack.includes(search)) && (status === "all" || row.status === status);
    });

    if (!filtered.length) {
      el("studentsTable").innerHTML = `
        <div class="teacher-empty students-empty">
          <strong>${rows.length ? "No students match this filter" : "No students yet"}</strong>
          <span>${rows.length ? "Try another search or status." : "Use Add student to invite your first learner."}</span>
        </div>
      `;
      return;
    }

    el("studentsTable").innerHTML = filtered.map((row) => `
      <a class="students-table-row" href="student-detail.html?id=${encodeURIComponent(row.id)}">
        <div class="student-cell-person">
          <div class="student-card-avatar">${avatarHtml(row)}</div>
          <div>
            <strong>${escapeHtml(row.display_name)}</strong>
            <span>${escapeHtml(row.email || "Email not available")}</span>
          </div>
        </div>
        <span>${escapeHtml(row.level || "—")}</span>
        <span>${escapeHtml(row.nextLesson ? formatDate(row.nextLesson.scheduled_at) : "Not scheduled")}</span>
        <span>${balanceLabel(row)}</span>
        <span class="student-status-pill ${escapeHtml(row.status)}">${escapeHtml(row.status)}</span>
        <span class="students-row-arrow">→</span>
      </a>
    `).join("");
  }

  function renderInvites() {
    if (!invites.length) {
      el("pendingInvites").innerHTML = '<div class="sw-message">No pending invitations.</div>';
      return;
    }

    el("pendingInvites").innerHTML = invites.map((invite) => `
      <div class="pending-invite-row">
        <div>
          <strong>${escapeHtml(invite.display_name || invite.email)}</strong>
          <span>${escapeHtml(invite.email)} · expires ${escapeHtml(formatDate(invite.expires_at))}</span>
        </div>
        <button class="teacher-text-button" type="button" data-revoke-invite="${escapeHtml(invite.id)}">Revoke</button>
      </div>
    `).join("");
  }

  function renderAll() {
    renderSummary();
    renderTable();
    renderInvites();
  }

  function openDialog() {
    const dialog = el("inviteDialog");
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  }

  function closeDialog() {
    const dialog = el("inviteDialog");
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  }

  async function createInvite(event) {
    event.preventDefault();
    const button = el("inviteSubmit");
    const message = el("inviteMessage");
    button.disabled = true;
    message.textContent = "Creating invitation…";

    const { data, error } = await client.functions.invoke("create-student-invite", {
      body: {
        display_name: el("inviteName").value.trim(),
        email: el("inviteEmail").value.trim()
      }
    });

    button.disabled = false;

    if (error || data?.error) {
      message.textContent = data?.error || error?.message || "Could not create invitation.";
      return;
    }

    el("inviteLink").value = data.invite_url;
    el("inviteResult").hidden = false;
    message.textContent = "Invitation created.";
    await loadData();
    renderAll();
  }

  async function revokeInvite(id, button) {
    button.disabled = true;
    const { error } = await client
      .from("student_invites")
      .update({ status: "revoked" })
      .eq("id", id)
      .eq("teacher_id", session.user.id);

    if (error) {
      button.disabled = false;
      throw error;
    }

    await loadData();
    renderAll();
  }

  el("studentSearch").addEventListener("input", renderTable);
  el("studentStatusFilter").addEventListener("change", renderTable);
  el("openInviteDialog").addEventListener("click", openDialog);
  el("inviteForm").addEventListener("submit", createInvite);
  el("logoutButton").addEventListener("click", () => auth.signOut());

  document.querySelectorAll("[data-close-dialog]").forEach((button) => {
    button.addEventListener("click", closeDialog);
  });

  el("copyInviteLink").addEventListener("click", async () => {
    await navigator.clipboard.writeText(el("inviteLink").value);
    el("copyInviteLink").textContent = "Copied";
    setTimeout(() => { el("copyInviteLink").textContent = "Copy"; }, 1400);
  });

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-revoke-invite]");
    if (button) revokeInvite(button.dataset.revokeInvite, button).catch(console.error);
  });

  async function init() {
    session = await auth.requireSession();
    if (!session) return;

    profile = await auth.getProfile(session.user.id);
    if (profile.role !== "teacher") {
      location.href = "student-dashboard.html";
      return;
    }

    el("sidebarName").textContent = profile.display_name || "Teacher";
    const avatar = el("sidebarAvatar");
    avatar.innerHTML = profile.avatar_url
      ? `<img src="${escapeHtml(profile.avatar_url)}" alt="">`
      : `<span>${escapeHtml((profile.display_name || "T").charAt(0).toUpperCase())}</span>`;

    await loadWorkspace();
    await loadData();
    renderAll();

    el("pageLoading").hidden = true;
    el("teacherApp").hidden = false;
  }

  init().catch((error) => {
    console.error(error);
    el("pageLoading").textContent = error.message;
  });
})();