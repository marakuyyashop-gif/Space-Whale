(() => {
  const navigation = [
    { key: "home", label: "Home", href: "dashboard.html", icon: '<path d="M4 10.5 12 4l8 6.5V20H4z"/><path d="M9 20v-6h6v6"/>' },
    { key: "schedule", label: "Schedule", href: "schedule.html", icon: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 9h16"/>' },
    { key: "students", label: "Students", href: "students.html", icon: '<circle cx="9" cy="8" r="3"/><path d="M3.5 20c.7-4.1 2.6-6.2 5.5-6.2s4.8 2.1 5.5 6.2"/><circle cx="17" cy="9" r="2.4"/><path d="M14.5 19c.4-2.5 1.6-3.8 3.7-3.8 1.1 0 2.1.4 2.8 1.1"/>' },
    { key: "library", label: "Library", href: "library.html", icon: '<path d="M5 4.5h5.5v15H5zM13.5 4.5H19v15h-5.5z"/>' },
    { key: "homework", label: "Homework", href: "homework.html", icon: '<path d="M5 4h14v16H5z"/><path d="M8 8h8M8 12h5M8 16h4"/>' },
    { key: "subscription", label: "Subscription", href: "subscription.html", icon: '<rect x="3.5" y="6" width="17" height="12" rx="2"/><path d="M3.5 10h17M7 15h4"/>' },
    { key: "settings", label: "Settings", href: "teacher-settings.html", icon: '<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.5 1a7 7 0 0 0-1.7-1L14.4 3h-4.8l-.4 3.1a7 7 0 0 0-1.7 1L5 6.1 3 9.5 5 11a7 7 0 0 0 0 2l-2 1.5L5 18l2.5-1a7 7 0 0 0 1.7 1l.4 3h4.8l.4-3a7 7 0 0 0 0-2Z"/>' }
  ];

  function initials(value) {
    const clean = String(value || "").trim();
    return clean ? clean.charAt(0).toUpperCase() : "T";
  }

  function render() {
    const sidebar = document.querySelector("[data-teacher-sidebar]");
    if (!sidebar) return;

    const active = sidebar.dataset.active || "";
    sidebar.innerHTML = `
      <a class="teacher-brand" href="dashboard.html">
        <span class="teacher-brand-mark">SW</span>
        <span>Space Whale</span>
      </a>
      <nav class="teacher-nav" aria-label="Teacher navigation">
        ${navigation.map((item) => `
          <a class="teacher-nav-item${item.key === active ? " active" : ""}" href="${item.href}"${item.key === active ? ' aria-current="page"' : ""}>
            <svg viewBox="0 0 24 24" aria-hidden="true">${item.icon}</svg>
            <span>${item.label}</span>
          </a>`).join("")}
      </nav>
      <div class="teacher-sidebar-bottom">
        <div class="teacher-account">
          <div class="teacher-avatar" id="sidebarAvatar"><span>T</span></div>
          <div class="teacher-account-copy">
            <strong id="sidebarName">Teacher</strong>
            <span id="adminBadge" hidden>Platform admin</span>
            <span id="calendarTimezone"></span>
          </div>
        </div>
        <button id="logoutButton" class="teacher-logout" type="button">Log out</button>
      </div>`;
  }

  function setAccount(profile = {}) {
    const name = profile.display_name || "Teacher";
    const nameElement = document.getElementById("sidebarName");
    const avatar = document.getElementById("sidebarAvatar");
    if (nameElement) nameElement.textContent = name;
    if (avatar) {
      avatar.replaceChildren();
      if (profile.avatar_url) {
        const image = document.createElement("img");
        image.src = profile.avatar_url;
        image.alt = "";
        avatar.append(image);
      } else {
        const fallback = document.createElement("span");
        fallback.textContent = initials(name);
        avatar.append(fallback);
      }
    }
  }

  render();
  window.SpaceWhaleTeacherShell = { setAccount };
})();
