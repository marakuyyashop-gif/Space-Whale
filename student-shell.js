(() => {
  const navigation = [
    { key: "home", label: "Home", href: "student-dashboard.html", icon: '<path d="M4 10.5 12 4l8 6.5V20H4z"/><path d="M9 20v-6h6v6"/>' },
    { key: "lessons", label: "Lessons", href: "student-lessons.html", icon: '<path d="M5 4.5h5.5v15H5zM13.5 4.5H19v15h-5.5z"/>' },
    { key: "homework", label: "Homework", href: "student-homework.html", icon: '<path d="M5 4h14v16H5z"/><path d="M8 8h8M8 12h5M8 16h4"/>' },
    { key: "notebook", label: "Notebook", href: "student-notebook.html", icon: '<path d="M6 4h12v16H6z"/><path d="M9 4v16M12 8h3M12 12h3"/>' },
    { key: "progress", label: "Progress", href: "student-progress.html", icon: '<path d="M5 19V9M12 19V5M19 19v-7"/><path d="M3 19h18"/>' },
    { key: "profile", label: "Profile", href: "student-profile.html", icon: '<circle cx="12" cy="8" r="3"/><path d="M5 20c.8-4.4 3.1-6.5 7-6.5s6.2 2.1 7 6.5"/>' }
  ];

  function initials(value) {
    const clean = String(value || "").trim();
    return clean ? clean.charAt(0).toUpperCase() : "S";
  }

  function render() {
    const sidebar = document.querySelector("[data-student-sidebar]");
    if (!sidebar) return;
    const active = sidebar.dataset.active || "";

    sidebar.innerHTML = `
      <a class="student-brand" href="student-dashboard.html">
        <span class="student-brand-mark">SW</span>
        <span>Space Whale</span>
      </a>
      <nav class="student-nav" aria-label="Student navigation">
        ${navigation.map((item) => `
          <a class="student-nav-item${item.key === active ? " active" : ""}" href="${item.href}"${item.key === active ? ' aria-current="page"' : ""}>
            <svg viewBox="0 0 24 24" aria-hidden="true">${item.icon}</svg>
            <span>${item.label}</span>
          </a>`).join("")}
      </nav>
      <div class="student-sidebar-bottom">
        <div class="student-account">
          <div class="student-shell-avatar" id="studentSidebarAvatar"><span>S</span></div>
          <div class="student-account-copy">
            <strong id="studentSidebarName">Student</strong>
            <span>Learning space</span>
          </div>
        </div>
        <button id="logoutButton" class="student-logout" type="button">Log out</button>
      </div>`;
  }

  function setAccount(profile = {}, email = "") {
    const name = profile.display_name || email || "Student";
    const nameElement = document.getElementById("studentSidebarName");
    const avatar = document.getElementById("studentSidebarAvatar");
    if (nameElement) nameElement.textContent = name;
    if (!avatar) return;

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

  render();
  window.SpaceWhaleStudentShell = { setAccount };
})();
