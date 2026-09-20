(() => {
  const client = window.spaceWhaleSupabase;
  const auth = window.SpaceWhaleAuth;

  const lessonList = document.getElementById("lessonList");
  const teacherPanel = document.getElementById("teacherPanel");
  const studentPanel = document.getElementById("studentPanel");
  const profileLabel = document.getElementById("profileLabel");
  const displayNameInput = document.getElementById("displayName");
  const profileMessage = document.getElementById("profileMessage");
  const scheduleMessage = document.getElementById("scheduleMessage");
  const studentSelect = document.getElementById("studentSelect");
  const studentsList = document.getElementById("studentsList");

  const productForm = document.getElementById("productForm");
  const productId = document.getElementById("productId");
  const productName = document.getElementById("productName");
  const productDescription = document.getElementById("productDescription");
  const productPrice = document.getElementById("productPrice");
  const productUses = document.getElementById("productUses");
  const productDays = document.getElementById("productDays");
  const productActive = document.getElementById("productActive");
  const productMessage = document.getElementById("productMessage");
  const teacherProducts = document.getElementById("teacherProducts");
  const cancelProductEdit = document.getElementById("cancelProductEdit");

  const accessSummary = document.getElementById("accessSummary");
  const studentProducts = document.getElementById("studentProducts");
  const paymentMessage = document.getElementById("paymentMessage");

  let session;
  let profile;
  let activeWorkspaceId = null;
  let workspaces = [];
  let cachedTeacherProducts = [];

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

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

  function formatPrice(amountMinor, currency = "RUB") {
    if (amountMinor == null) return "Price not set";
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency
    }).format(amountMinor / 100);
  }

  function relationObject(value) {
    if (Array.isArray(value)) return value[0] || null;
    return value || null;
  }

  async function loadWorkspaces() {
    let rows = [];

    if (profile.role === "teacher") {
      const { data, error } = await client
        .from("workspace_members")
        .select("workspace_id,role,status,workspaces(id,name,slug,kind,status)")
        .eq("user_id", session.user.id)
        .eq("status", "active");

      if (error) throw error;
      rows = (data || []).map((row) => ({
        ...relationObject(row.workspaces),
        membershipRole: row.role
      })).filter((row) => row.id);
    } else {
      const { data, error } = await client
        .from("workspace_students")
        .select("workspace_id,status,workspaces(id,name,slug,kind,status)")
        .eq("student_id", session.user.id)
        .in("status", ["active", "paused"]);

      if (error) throw error;
      rows = (data || []).map((row) => ({
        ...relationObject(row.workspaces),
        studentStatus: row.status
      })).filter((row) => row.id);
    }

    workspaces = rows;

    const storageKey = `spaceWhaleWorkspace:${session.user.id}`;
    const savedId = localStorage.getItem(storageKey);
    const preferred = workspaces.find((workspace) => workspace.id === savedId) || workspaces[0] || null;

    activeWorkspaceId = preferred?.id || null;

    if (!workspaces.length) {
      return;
    }

    localStorage.setItem(storageKey, activeWorkspaceId);
  }

  function canEnterLesson(lesson) {
    if (lesson.status === "live") return true;
    if (!lesson.scheduled_at || lesson.status !== "scheduled") return false;
    const opensAt = new Date(lesson.scheduled_at).getTime() - (lesson.join_window_minutes ?? 5) * 60000;
    return Date.now() >= opensAt;
  }

  function renderLessons(lessons) {
    if (!activeWorkspaceId) {
      lessonList.innerHTML = '<div class="sw-message">No workspace selected.</div>';
      return;
    }

    if (!lessons.length) {
      lessonList.innerHTML = '<div class="sw-message">No lessons scheduled yet.</div>';
      return;
    }

    lessonList.innerHTML = lessons.map((lesson) => {
      const enabled = canEnterLesson(lesson);
      const action = enabled
        ? `<a class="sw-button" href="waiting-room.html?session=${encodeURIComponent(lesson.id)}">Join lesson</a>`
        : '<button class="sw-button secondary" type="button" disabled>Available 5 min before</button>';

      return `
        <article class="lesson-card">
          <div class="lesson-main">
            <div class="lesson-title">${escapeHtml(lesson.title || lesson.lesson_id || "English lesson")}</div>
            <div class="lesson-meta">${escapeHtml(formatDate(lesson.scheduled_at))} · ${Number(lesson.duration_minutes || 60)} min</div>
          </div>
          <div class="lesson-actions">
            <span class="lesson-status">${escapeHtml(lesson.status)}</span>
            ${action}
          </div>
        </article>
      `;
    }).join("");
  }

  async function loadLessons() {
    if (!activeWorkspaceId) {
      renderLessons([]);
      return;
    }

    let query = client
      .from("lesson_sessions")
      .select("id,workspace_id,title,course_id,lesson_id,status,scheduled_at,duration_minutes,join_window_minutes,teacher_id,student_id")
      .eq("workspace_id", activeWorkspaceId)
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
    const scheduleButton = document.querySelector("#scheduleForm button[type=submit]");

    if (!activeWorkspaceId) {
      studentSelect.innerHTML = '<option value="">No workspace selected</option>';
      studentsList.innerHTML = '<div class="sw-message">Choose a workspace first.</div>';
      scheduleButton.disabled = true;
      return [];
    }

    const { data: links, error } = await client
      .from("teacher_students")
      .select("student_id,status")
      .eq("workspace_id", activeWorkspaceId)
      .eq("teacher_id", session.user.id)
      .eq("status", "active");

    if (error) throw error;

    const ids = (links || []).map((item) => item.student_id);

    if (!ids.length) {
      studentSelect.innerHTML = '<option value="">No paid students yet</option>';
      studentsList.innerHTML = '<div class="sw-message">Students will appear here after onboarding and payment.</div>';
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
      `<option value="${escapeHtml(student.id)}">${escapeHtml(student.display_name || "Student")}</option>`
    ).join("");

    studentsList.innerHTML = (students || []).map((student) => `
      <div class="student-row">
        <span class="student-avatar">${escapeHtml((student.display_name || "S").trim().charAt(0).toUpperCase())}</span>
        <span class="student-name">${escapeHtml(student.display_name || "Student")}</span>
        <span class="lesson-status">active</span>
      </div>
    `).join("");

    scheduleButton.disabled = false;
    return students || [];
  }

  function resetProductForm() {
    productForm.reset();
    productId.value = "";
    productActive.checked = false;
    cancelProductEdit.hidden = true;
    productMessage.textContent = "";
  }

  function productDetails(product) {
    const bits = [];
    if (product.included_uses) bits.push(`${product.included_uses} lessons`);
    if (product.access_duration_days) bits.push(`${product.access_duration_days} days access`);
    return bits.join(" · ");
  }

  async function loadTeacherProducts() {
    cachedTeacherProducts = [];

    if (!activeWorkspaceId) {
      teacherProducts.innerHTML = '<div class="sw-message">Choose a workspace first.</div>';
      return;
    }

    const { data, error } = await client
      .from("billing_products")
      .select("id,workspace_id,code,name,description,amount_minor,currency,active,included_uses,access_duration_days,created_at")
      .eq("workspace_id", activeWorkspaceId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    cachedTeacherProducts = data || [];

    if (!cachedTeacherProducts.length) {
      teacherProducts.innerHTML = '<div class="sw-message">No products yet. Create your first lesson package above.</div>';
      return;
    }

    teacherProducts.innerHTML = cachedTeacherProducts.map((product) => `
      <article class="product-card">
        <div class="product-main">
          <div class="product-name">${escapeHtml(product.name)}</div>
          <div class="product-price">${escapeHtml(formatPrice(product.amount_minor, product.currency || "RUB"))}</div>
          ${product.description ? `<div class="product-copy">${escapeHtml(product.description)}</div>` : ""}
          ${productDetails(product) ? `<div class="product-copy">${escapeHtml(productDetails(product))}</div>` : ""}
        </div>
        <div class="product-actions">
          <span class="lesson-status">${product.active ? "available" : "hidden"}</span>
          <button class="sw-button secondary" type="button" data-product-edit="${escapeHtml(product.id)}">Edit</button>
          <button class="sw-button secondary" type="button" data-product-toggle="${escapeHtml(product.id)}">${product.active ? "Hide" : "Publish"}</button>
        </div>
      </article>
    `).join("");
  }

  async function loadStudentBilling() {
    if (!activeWorkspaceId) {
      accessSummary.innerHTML = '<div class="access-banner"><strong>No teacher workspace yet</strong><span>Your teacher will connect your account to a workspace.</span></div>';
      studentProducts.innerHTML = "";
      return;
    }

    const now = Date.now();

    const { data: entitlements, error: accessError } = await client
      .from("access_entitlements")
      .select("id,workspace_id,access_key,status,starts_at,ends_at,remaining_uses,created_at")
      .eq("workspace_id", activeWorkspaceId)
      .eq("user_id", session.user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (accessError) throw accessError;

    const active = (entitlements || []).find((item) =>
      new Date(item.starts_at).getTime() <= now &&
      (!item.ends_at || new Date(item.ends_at).getTime() > now) &&
      (item.remaining_uses == null || item.remaining_uses > 0)
    );

    if (active) {
      const parts = ["Lesson access is active."];
      if (active.remaining_uses != null) parts.push(`${active.remaining_uses} lessons remaining.`);
      if (active.ends_at) parts.push(`Valid until ${formatDate(active.ends_at)}.`);
      accessSummary.innerHTML = `<div class="access-banner"><strong>Access active</strong><span>${escapeHtml(parts.join(" "))}</span></div>`;
    } else {
      accessSummary.innerHTML = '<div class="access-banner"><strong>No active lesson access</strong><span>Choose a lesson package below. Access opens automatically after a confirmed payment.</span></div>';
    }

    const { data: products, error: productError } = await client
      .from("billing_products")
      .select("id,workspace_id,code,name,description,amount_minor,currency,included_uses,access_duration_days")
      .eq("workspace_id", activeWorkspaceId)
      .eq("active", true)
      .not("amount_minor", "is", null)
      .order("created_at", { ascending: true });

    if (productError) throw productError;

    if (!products?.length) {
      studentProducts.innerHTML = '<div class="sw-message">Lesson packages are not published yet.</div>';
      return;
    }

    studentProducts.innerHTML = products.map((product) => `
      <article class="product-card">
        <div class="product-main">
          <div class="product-name">${escapeHtml(product.name)}</div>
          <div class="product-price">${escapeHtml(formatPrice(product.amount_minor, product.currency || "RUB"))}</div>
          ${product.description ? `<div class="product-copy">${escapeHtml(product.description)}</div>` : ""}
          ${productDetails(product) ? `<div class="product-copy">${escapeHtml(productDetails(product))}</div>` : ""}
        </div>
        <button class="sw-button" type="button" data-buy-product="${escapeHtml(product.code)}">Pay</button>
      </article>
    `).join("");
  }

  async function startPayment(productCode, button) {
    button.disabled = true;
    paymentMessage.textContent = "Creating secure payment…";

    const { data, error } = await client.functions.invoke("robokassa-create-payment", {
      body: { product_code: productCode }
    });

    if (error) {
      let details = error.message || "Could not create payment.";
      try {
        if (error.context) {
          const body = await error.context.clone().json();
          if (body?.error) details = body.error;
        }
      } catch (_) {}
      paymentMessage.textContent = details;
      button.disabled = false;
      return;
    }

    if (data?.error) {
      paymentMessage.textContent = data.error;
      button.disabled = false;
      return;
    }

    if (!data?.payment_url) {
      paymentMessage.textContent = "Payment link was not created.";
      button.disabled = false;
      return;
    }

    location.href = data.payment_url;
  }

  async function refreshWorkspaceView() {
    lessonList.innerHTML = '<div class="sw-message">Loading…</div>';

    if (profile.role === "teacher") {
      await Promise.all([loadStudents(), loadTeacherProducts(), loadLessons()]);
    } else {
      await Promise.all([loadStudentBilling(), loadLessons()]);
    }
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

  if (productForm) {
    productForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!activeWorkspaceId) {
        productMessage.textContent = "Choose a workspace first.";
        return;
      }

      const submitButton = event.target.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      productMessage.textContent = "Saving…";

      const price = Number(productPrice.value);
      const uses = productUses.value ? Number(productUses.value) : null;
      const days = productDays.value ? Number(productDays.value) : null;

      const payload = {
        workspace_id: activeWorkspaceId,
        teacher_id: session.user.id,
        name: productName.value.trim(),
        description: productDescription.value.trim() || null,
        access_key: "lessons",
        billing_type: uses ? "lesson_pack" : "one_time",
        amount_minor: Math.round(price * 100),
        currency: "RUB",
        active: productActive.checked,
        included_uses: uses,
        access_duration_days: days
      };

      let error;

      if (productId.value) {
        ({ error } = await client
          .from("billing_products")
          .update(payload)
          .eq("id", productId.value)
          .eq("workspace_id", activeWorkspaceId));
      } else {
        payload.code = `lesson-${crypto.randomUUID()}`;
        ({ error } = await client.from("billing_products").insert(payload));
      }

      submitButton.disabled = false;

      if (error) {
        productMessage.textContent = error.message;
        return;
      }

      resetProductForm();
      productMessage.textContent = "Saved.";
      await loadTeacherProducts();
    });

    cancelProductEdit.addEventListener("click", resetProductForm);

    teacherProducts.addEventListener("click", async (event) => {
      const editButton = event.target.closest("[data-product-edit]");
      const toggleButton = event.target.closest("[data-product-toggle]");

      if (editButton) {
        const product = cachedTeacherProducts.find((item) => item.id === editButton.dataset.productEdit);
        if (!product) return;

        productId.value = product.id;
        productName.value = product.name || "";
        productDescription.value = product.description || "";
        productPrice.value = product.amount_minor != null ? (product.amount_minor / 100).toFixed(2) : "";
        productUses.value = product.included_uses || "";
        productDays.value = product.access_duration_days || "";
        productActive.checked = Boolean(product.active);
        cancelProductEdit.hidden = false;
        productMessage.textContent = "Editing product.";
        productName.focus();
        return;
      }

      if (toggleButton) {
        const product = cachedTeacherProducts.find((item) => item.id === toggleButton.dataset.productToggle);
        if (!product) return;

        toggleButton.disabled = true;
        const { error } = await client
          .from("billing_products")
          .update({ active: !product.active })
          .eq("id", product.id)
          .eq("workspace_id", activeWorkspaceId);

        if (error) productMessage.textContent = error.message;
        else await loadTeacherProducts();
      }
    });
  }

  if (studentProducts) {
    studentProducts.addEventListener("click", (event) => {
      const button = event.target.closest("[data-buy-product]");
      if (!button) return;
      startPayment(button.dataset.buyProduct, button);
    });
  }

  document.getElementById("scheduleForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!activeWorkspaceId) {
      scheduleMessage.textContent = "Choose a workspace first.";
      return;
    }

    scheduleMessage.textContent = "Scheduling…";

    const localTime = document.getElementById("lessonTime").value;
    const studentId = studentSelect.value;

    const { error } = await client.from("lesson_sessions").insert({
      workspace_id: activeWorkspaceId,
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
        ? "Manage your workspace, students and upcoming classes."
        : "Your lessons and access live here.";

    await loadWorkspaces();

    if (profile.role === "teacher") {
      teacherPanel.hidden = false;
    } else {
      studentPanel.hidden = false;
    }

    await refreshWorkspaceView();
    setInterval(loadLessons, 30000);
  }

  init().catch((error) => {
    console.error(error);
    lessonList.innerHTML = `<div class="sw-message">${escapeHtml(error.message)}</div>`;
  });
})();
