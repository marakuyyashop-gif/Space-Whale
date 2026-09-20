(() => {
  const client = window.spaceWhaleSupabase;
  const auth = window.SpaceWhaleAuth;
  let session;
  let profile;
  let workspaceId;

  const el = (id) => document.getElementById(id);

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function formatDate(value) {
    return new Intl.DateTimeFormat(undefined, {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(value));
  }

  function formatPrice(amountMinor, currency = "RUB") {
    return new Intl.NumberFormat("ru-RU", { style: "currency", currency }).format(amountMinor / 100);
  }

  function canJoin(lesson) {
    if (lesson.status === "live") return true;
    if (!lesson.scheduled_at || lesson.status !== "scheduled") return false;
    return Date.now() >= new Date(lesson.scheduled_at).getTime() - Number(lesson.join_window_minutes || 5) * 60000;
  }

  async function loadWorkspace() {
    const { data, error } = await client
      .from("workspace_students")
      .select("workspace_id")
      .eq("student_id", session.user.id)
      .in("status", ["active", "paused"])
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    workspaceId = data?.workspace_id || null;
  }

  async function loadLessons() {
    if (!workspaceId) {
      el("studentLessons").innerHTML = '<div class="sw-message">Your teacher has not connected your account yet.</div>';
      return;
    }

    const { data, error } = await client
      .from("lesson_sessions")
      .select("id,title,status,scheduled_at,duration_minutes,join_window_minutes")
      .eq("workspace_id", workspaceId)
      .eq("student_id", session.user.id)
      .in("status", ["scheduled", "live"])
      .order("scheduled_at", { ascending: true });

    if (error) throw error;

    if (!data?.length) {
      el("studentLessons").innerHTML = '<div class="sw-message">No lessons scheduled yet.</div>';
      return;
    }

    el("studentLessons").innerHTML = data.map((lesson) => `
      <article class="lesson-card">
        <div class="lesson-main">
          <div class="lesson-title">${escapeHtml(lesson.title || "English lesson")}</div>
          <div class="lesson-meta">${escapeHtml(formatDate(lesson.scheduled_at))} · ${Number(lesson.duration_minutes || 60)} min</div>
        </div>
        <div class="lesson-actions">
          <span class="lesson-status">${escapeHtml(lesson.status)}</span>
          ${canJoin(lesson)
            ? `<a class="sw-button" href="waiting-room.html?session=${encodeURIComponent(lesson.id)}">Join lesson</a>`
            : '<button class="sw-button secondary" type="button" disabled>Available 5 min before</button>'}
        </div>
      </article>
    `).join("");
  }

  async function loadBilling() {
    if (!workspaceId) {
      el("accessSummary").innerHTML = '<div class="access-banner"><strong>No teacher connected</strong><span>Your access will appear here after your teacher connects your account.</span></div>';
      el("studentProducts").innerHTML = "";
      return;
    }

    const { data: entitlements, error: accessError } = await client
      .from("access_entitlements")
      .select("remaining_uses,ends_at,starts_at,status")
      .eq("workspace_id", workspaceId)
      .eq("user_id", session.user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (accessError) throw accessError;

    const now = Date.now();
    const active = (entitlements || []).find((item) =>
      new Date(item.starts_at).getTime() <= now &&
      (!item.ends_at || new Date(item.ends_at).getTime() > now) &&
      (item.remaining_uses == null || item.remaining_uses > 0)
    );

    if (active) {
      const details = [];
      if (active.remaining_uses != null) details.push(`${active.remaining_uses} lessons remaining`);
      if (active.ends_at) details.push(`valid until ${formatDate(active.ends_at)}`);
      el("accessSummary").innerHTML = `<div class="access-banner"><strong>Access active</strong><span>${escapeHtml(details.join(" · ") || "You can join scheduled lessons.")}</span></div>`;
    } else {
      el("accessSummary").innerHTML = '<div class="access-banner"><strong>No active lesson package</strong><span>Choose a package below when your teacher publishes one.</span></div>';
    }

    const { data: products, error: productError } = await client
      .from("billing_products")
      .select("code,name,description,amount_minor,currency,included_uses,access_duration_days")
      .eq("workspace_id", workspaceId)
      .eq("active", true)
      .not("amount_minor", "is", null)
      .order("created_at", { ascending: true });

    if (productError) throw productError;

    if (!products?.length) {
      el("studentProducts").innerHTML = '<div class="sw-message">No packages available right now.</div>';
      return;
    }

    el("studentProducts").innerHTML = products.map((product) => `
      <article class="product-card">
        <div class="product-main">
          <div class="product-name">${escapeHtml(product.name)}</div>
          <div class="product-price">${escapeHtml(formatPrice(product.amount_minor, product.currency || "RUB"))}</div>
          ${product.description ? `<div class="product-copy">${escapeHtml(product.description)}</div>` : ""}
        </div>
        <button class="sw-button" type="button" data-buy-product="${escapeHtml(product.code)}">Pay</button>
      </article>
    `).join("");
  }

  async function startPayment(code, button) {
    button.disabled = true;
    el("paymentMessage").textContent = "Creating secure payment…";

    const { data, error } = await client.functions.invoke("robokassa-create-payment", {
      body: { product_code: code }
    });

    if (error || data?.error) {
      el("paymentMessage").textContent = data?.error || error?.message || "Could not create payment.";
      button.disabled = false;
      return;
    }

    if (data?.payment_url) location.href = data.payment_url;
  }

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-buy-product]");
    if (button) startPayment(button.dataset.buyProduct, button);
  });

  el("logoutButton").addEventListener("click", () => auth.signOut());

  async function init() {
    session = await auth.requireSession();
    if (!session) return;

    profile = await auth.getProfile(session.user.id);
    if (profile.role === "teacher") {
      location.href = "dashboard.html";
      return;
    }

    el("studentName").textContent = profile.display_name || session.user.email;
    await loadWorkspace();
    await Promise.all([loadLessons(), loadBilling()]);
  }

  init().catch((error) => {
    console.error(error);
    el("studentLessons").innerHTML = `<div class="sw-message">${escapeHtml(error.message)}</div>`;
  });
})();
