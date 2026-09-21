(() => {
  const client = window.spaceWhaleSupabase;
  const auth = window.SpaceWhaleAuth;

  const form = document.getElementById("settingsForm");
  const saveButton = document.getElementById("saveButton");
  const message = document.getElementById("settingsMessage");
  const avatarMessage = document.getElementById("avatarMessage");
  const avatarInput = document.getElementById("avatarInput");
  const avatarPreview = document.getElementById("avatarPreview");
  const avatarInitial = document.getElementById("avatarInitial");
  const displayName = document.getElementById("displayName");
  const practiceName = document.getElementById("practiceName");
  const timezone = document.getElementById("timezone");
  const email = document.getElementById("email");

  let session;
  let profile;
  let workspaceId = null;

  function initials(value) {
    const clean = String(value || "").trim();
    return clean ? clean.charAt(0).toUpperCase() : "T";
  }

  function renderAvatar(url, name) {
    avatarInitial.textContent = initials(name);
    if (url) {
      avatarPreview.style.backgroundImage = `url("${url}")`;
      avatarPreview.classList.add("has-photo");
    } else {
      avatarPreview.style.backgroundImage = "";
      avatarPreview.classList.remove("has-photo");
    }
  }

  function loadTimezoneOptions(selected) {
    let zones = [];
    try {
      zones = Intl.supportedValuesOf("timeZone");
    } catch (_) {
      zones = [
        "Europe/Vilnius",
        "Europe/Moscow",
        "Europe/London",
        "Europe/Berlin",
        "Asia/Tbilisi",
        "Asia/Almaty",
        "Asia/Dubai",
        "America/New_York"
      ];
    }

    const browserZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const preferred = selected || browserZone || "Europe/Vilnius";
    if (!zones.includes(preferred)) zones.unshift(preferred);

    timezone.innerHTML = zones.map((zone) =>
      `<option value="${zone}">${zone.replaceAll("_", " ")}</option>`
    ).join("");
    timezone.value = preferred;
  }

  async function loadWorkspace() {
    const { data, error } = await client
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", session.user.id)
      .eq("role", "owner")
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    workspaceId = data?.workspace_id || null;
  }

  async function uploadAvatar(file) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      avatarMessage.textContent = "Choose a JPG, PNG or WEBP image.";
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      avatarMessage.textContent = "The image must be smaller than 2 MB.";
      return;
    }

    avatarInput.disabled = true;
    avatarMessage.textContent = "Uploading…";

    const extension = file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1];
    const folder = session.user.id;

    const { data: existing } = await client.storage.from("avatars").list(folder, { limit: 20 });
    if (existing?.length) {
      await client.storage.from("avatars").remove(existing.map((item) => `${folder}/${item.name}`));
    }

    const path = `${folder}/avatar.${extension}`;
    const { error: uploadError } = await client.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type, cacheControl: "3600" });

    if (uploadError) {
      avatarInput.disabled = false;
      avatarMessage.textContent = uploadError.message;
      return;
    }

    const { data: publicData } = client.storage.from("avatars").getPublicUrl(path);
    const publicUrl = `${publicData.publicUrl}?v=${Date.now()}`;

    const { error: profileError } = await client
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", session.user.id);

    avatarInput.disabled = false;

    if (profileError) {
      avatarMessage.textContent = profileError.message;
      return;
    }

    profile.avatar_url = publicUrl;
    renderAvatar(publicUrl, displayName.value);
    avatarMessage.textContent = "Photo updated.";
  }

  avatarInput.addEventListener("change", () => {
    const file = avatarInput.files?.[0];
    if (file) uploadAvatar(file).catch((error) => {
      console.error(error);
      avatarInput.disabled = false;
      avatarMessage.textContent = error.message;
    });
  });

  displayName.addEventListener("input", () => {
    if (!profile?.avatar_url) renderAvatar(null, displayName.value);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    saveButton.disabled = true;
    message.textContent = "Saving…";

    const payload = {
      display_name: displayName.value.trim(),
      practice_name: practiceName.value.trim() || null,
      timezone: timezone.value,
      profile_complete: true
    };

    const { error } = await client
      .from("profiles")
      .update(payload)
      .eq("id", session.user.id);

    if (error) {
      saveButton.disabled = false;
      message.textContent = error.message;
      return;
    }

    if (workspaceId) {
      const internalName = payload.practice_name || `${payload.display_name} workspace`;
      const { error: workspaceError } = await client
        .from("workspaces")
        .update({
          name: internalName,
          timezone: payload.timezone
        })
        .eq("id", workspaceId);

      if (workspaceError) {
        saveButton.disabled = false;
        message.textContent = workspaceError.message;
        return;
      }
    }

    profile = { ...profile, ...payload };
    renderAvatar(profile.avatar_url, profile.display_name);
    saveButton.disabled = false;
    message.textContent = "Settings saved.";
  });

  async function init() {
    session = await auth.requireSession();
    if (!session) return;

    profile = await auth.getProfile(session.user.id);
    if (profile.role !== "teacher") {
      location.href = "dashboard.html";
      return;
    }

    displayName.value = profile.display_name || "";
    practiceName.value = profile.practice_name || "";
    email.value = session.user.email || "";
    loadTimezoneOptions(profile.timezone);
    renderAvatar(profile.avatar_url, profile.display_name);
    await loadWorkspace();
    window.SpaceWhaleTeacherShell?.setAccount(profile);
    document.getElementById("logoutButton")?.addEventListener("click", () => auth.signOut());
    document.getElementById("pageLoading").hidden = true;
    document.getElementById("teacherApp").hidden = false;
  }

  init().catch((error) => {
    console.error(error);
    message.textContent = error.message;
    document.getElementById("pageLoading").textContent = error.message;
  });
})();
