(() => {
  const client = window.spaceWhaleSupabase;
  const auth = window.SpaceWhaleAuth;
  const el = (id) => document.getElementById(id);
  const token = new URLSearchParams(location.search).get("token");
  let invite;

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  async function acceptInvite() {
    el("joinMessage").textContent = "Connecting your account…";
    const { data, error } = await client.functions.invoke("accept-student-invite", {
      body: { token }
    });

    if (error || data?.error) {
      el("joinMessage").textContent = data?.error || error?.message || "Could not accept invitation.";
      return false;
    }

    location.href = "student-dashboard.html";
    return true;
  }

  async function loadInvite() {
    if (!token) throw new Error("Invitation link is incomplete.");

    const { data, error } = await client.functions.invoke("student-invite-info", {
      body: { token }
    });

    if (error || data?.error) throw new Error(data?.error || error?.message || "Invitation not found.");
    invite = data;

    el("teacherName").textContent = invite.teacher.practice_name || invite.teacher.display_name || "Your teacher";
    el("name").value = invite.display_name || "";
    el("email").value = invite.email || "";

    const avatar = el("teacherAvatar");
    avatar.innerHTML = invite.teacher.avatar_url
      ? `<img src="${escapeHtml(invite.teacher.avatar_url)}" alt="">`
      : `<span>${escapeHtml((invite.teacher.display_name || "T").charAt(0).toUpperCase())}</span>`;

    const next = encodeURIComponent(`student-join.html?token=${token}`);
    el("existingAccountLink").href = `login.html?next=${next}`;

    el("inviteLoading").hidden = true;
    el("inviteContent").hidden = false;

    const session = await auth.getSession();
    if (session) {
      const profile = await auth.getProfile(session.user.id);
      if (profile.role !== "student") {
        el("joinMessage").textContent = "This invitation needs a student account. Sign out first if you are currently logged in as a teacher.";
        return;
      }
      await acceptInvite();
    }
  }

  el("signupForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = el("signupButton");
    button.disabled = true;
    el("joinMessage").textContent = "Creating your account…";

    const redirect = new URL("student-join.html", location.href);
    redirect.searchParams.set("token", token);

    const { data, error } = await client.auth.signUp({
      email: invite.email,
      password: el("password").value,
      options: {
        data: {
          display_name: el("name").value.trim(),
          account_type: "student"
        },
        emailRedirectTo: redirect.href
      }
    });

    button.disabled = false;

    if (error) {
      el("joinMessage").textContent = error.message;
      return;
    }

    if (data.session) {
      await acceptInvite();
      return;
    }

    el("joinMessage").textContent = "Account created. Check your email, confirm your address, and this invitation will continue automatically.";
  });

  loadInvite().catch((error) => {
    console.error(error);
    el("inviteLoading").innerHTML = `<h1>Invitation unavailable</h1><p>${escapeHtml(error.message)}</p>`;
  });
})();