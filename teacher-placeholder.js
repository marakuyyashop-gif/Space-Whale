(() => {
  const auth = window.SpaceWhaleAuth;
  const loading = document.getElementById("pageLoading");
  const app = document.getElementById("teacherApp");

  async function init() {
    const session = await auth.requireSession();
    if (!session) return;

    const profile = await auth.getProfile(session.user.id);
    if (profile.role !== "teacher") {
      location.href = "student-dashboard.html";
      return;
    }

    window.SpaceWhaleTeacherShell?.setAccount(profile);
    document.getElementById("logoutButton")?.addEventListener("click", () => auth.signOut());
    loading.hidden = true;
    app.hidden = false;
  }

  init().catch((error) => {
    console.error(error);
    loading.textContent = error.message;
  });
})();
