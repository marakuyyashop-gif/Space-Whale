(() => {
  const client = window.spaceWhaleSupabase;

  async function getSession() {
    if (!client) return null;
    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    return data.session || null;
  }

  async function requireSession() {
    const session = await getSession();
    if (!session) {
      const target = encodeURIComponent(location.pathname.split("/").pop() + location.search);
      location.href = `login.html?next=${target}`;
      return null;
    }
    return session;
  }

  async function getProfile(userId) {
    const { data, error } = await client
      .from("profiles")
      .select("id, role, display_name, avatar_url, timezone, practice_name, profile_complete")
      .eq("id", userId)
      .single();
    if (error) throw error;
    return data;
  }

  async function signOut() {
    await client.auth.signOut();
    location.href = "login.html";
  }

  window.SpaceWhaleAuth = { getSession, requireSession, getProfile, signOut };
})();
