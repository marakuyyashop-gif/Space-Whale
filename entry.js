(() => {
  const client = window.spaceWhaleSupabase;
  const status = document.getElementById("entryStatus");
  const fallback = document.getElementById("entryFallback");
  const params = new URLSearchParams(location.search);
  const legacySessionId = params.get("session");

  function showError(message) {
    status.textContent = message;
    fallback.hidden = false;
  }

  async function route() {
    if (legacySessionId) {
      location.replace(`classroom.html?session=${encodeURIComponent(legacySessionId)}`);
      return;
    }

    if (!client) {
      showError("Space Whale could not connect. Please try again.");
      return;
    }

    const { data, error } = await client.auth.getSession();

    if (error) {
      showError(error.message);
      return;
    }

    if (!data.session) {
      location.replace("login.html");
      return;
    }

    const { data: profile, error: profileError } = await client
      .from("profiles")
      .select("role")
      .eq("id", data.session.user.id)
      .maybeSingle();

    if (profileError) {
      showError(profileError.message);
      return;
    }

    const destination = profile?.role === "student"
      ? "student-dashboard.html"
      : "dashboard.html";

    location.replace(destination);
  }

  route().catch((error) => {
    console.error("[Space Whale] Entry routing failed", error);
    showError("Space Whale could not open your workspace. Please try again.");
  });
})();
