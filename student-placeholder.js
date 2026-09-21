(() => {
  const auth = window.SpaceWhaleAuth;
  const loading = document.getElementById("pageLoading");
  const app = document.getElementById("studentApp");

  async function init() {
    const session = await auth.requireSession();
    if (!session) return;

    const profile = await auth.getProfile(session.user.id);
    if (profile.role === "teacher") {
      location.href = "dashboard.html";
      return;
    }

    window.SpaceWhaleStudentShell?.setAccount(profile, session.user.email);
    document.querySelectorAll("[data-profile-name]").forEach((item) => {
      item.textContent = profile.display_name || "Student";
    });
    document.querySelectorAll("[data-profile-email]").forEach((item) => {
      item.textContent = session.user.email || "";
    });
    document.querySelectorAll("[data-profile-timezone]").forEach((item) => {
      item.textContent = profile.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    });
    document.getElementById("logoutButton")?.addEventListener("click", () => auth.signOut());
    loading.hidden = true;
    app.hidden = false;
  }

  init().catch((error) => {
    console.error(error);
    loading.textContent = error.message;
  });
})();
