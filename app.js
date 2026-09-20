const sections = [
  {
    id: "module-info",
    title: "Module info",
    open: false,
    tabs: ["Tasks", "Language input", "Self study"],
    tasks: [
      {
        id: "tutor-overview",
        title: "[info] A2.1 Module 2 overview for tutor",
        subtitle: "Tutor-only block",
        screen: "tutor-overview"
      }
    ]
  },
  {
    id: "module-overview",
    title: "A2.1 Модуль 2. Обзор",
    open: false,
    tabs: ["Tasks", "Language input", "Self study"],
    tasks: [
      { id: "overview-lead", title: "Lead-in", subtitle: "Warm-up", screen: "overview-lead" },
      { id: "overview-test", title: "Test task", subtitle: "Interactive block", screen: "photos-test" },
      { id: "overview-revision", title: "Revision", subtitle: "Practice", screen: "overview-revision" },
      { id: "overview-extension", title: "Extension", subtitle: "Extra practice", screen: "overview-extension" }
    ]
  },
  {
    id: "photos-past",
    title: "Фотографии из прошлого",
    open: true,
    tabs: ["Tasks", "Language input", "Self study"],
    tasks: [
      { id: "photos-lead", title: "Lead-in", subtitle: "Discussion", screen: "photos-lead" },
      { id: "photos-test", title: "Test task", subtitle: "Current screen", screen: "photos-test" },
      { id: "photos-revision", title: "Revision", subtitle: "Practice", screen: "photos-revision" },
      { id: "photos-extension", title: "Extension", subtitle: "Extra practice", screen: "photos-extension" }
    ]
  },
  {
    id: "celebrities-past",
    title: "Знаменитости прошлого",
    open: false,
    tabs: ["Tasks", "Language input", "Self study"],
    tasks: [
      { id: "celeb-test", title: "Test task", subtitle: "Main block", screen: "celeb-test" },
      { id: "celeb-revision", title: "Revision", subtitle: "Practice", screen: "celeb-revision" },
      { id: "celeb-extension", title: "Extension", subtitle: "Extra practice", screen: "celeb-extension" }
    ]
  },
  {
    id: "yesterday",
    title: "Где ты был вчера?",
    open: false,
    tabs: ["Tasks", "Language input", "Self study"],
    tasks: [
      { id: "yesterday-test", title: "Test task", subtitle: "Main block", screen: "yesterday-test" },
      { id: "yesterday-revision", title: "Revision", subtitle: "Practice", screen: "yesterday-revision" },
      { id: "yesterday-extension", title: "Extension", subtitle: "Extra practice", screen: "yesterday-extension" }
    ]
  }
];

let activeTaskId = "photos-test";

const taskGuideEl = document.getElementById("taskGuide");
const workspaceContentEl = document.getElementById("workspaceContent");

function findTaskById(taskId) {
  for (const section of sections) {
    for (const task of section.tasks) {
      if (task.id === taskId) return { section, task };
    }
  }
  return null;
}

function renderTaskGuide() {
  taskGuideEl.innerHTML = "";

  sections.forEach((section) => {
    const sectionCard = document.createElement("div");
    sectionCard.className = `section-card ${section.open ? "open" : ""}`;

    const header = document.createElement("button");
    header.className = "section-header";
    header.type = "button";
    header.innerHTML = `
      <span class="section-title">${section.title}</span>
      <span class="section-chevron">▾</span>
    `;
    header.addEventListener("click", () => {
      section.open = !section.open;
      renderTaskGuide();
    });

    const body = document.createElement("div");
    body.className = "section-body";

    if (section.tabs && section.tabs.length) {
      const tabs = document.createElement("div");
      tabs.className = "section-tabs";
      tabs.innerHTML = section.tabs
        .map((tab, index) => `<span class="section-tab ${index === 0 ? "active" : ""}">${tab}</span>`)
        .join("");
      body.appendChild(tabs);
    }

    const taskList = document.createElement("div");
    taskList.className = "task-list";

    section.tasks.forEach((task) => {
      const taskButton = document.createElement("button");
      taskButton.className = `task-button ${activeTaskId === task.id ? "active" : ""}`;
      taskButton.type = "button";
      taskButton.innerHTML = `
        <span class="task-button-title">${task.title}</span>
        <span class="task-button-subtitle">${task.subtitle}</span>
      `;
      taskButton.addEventListener("click", () => {
        activeTaskId = task.id;
        section.open = true;
        renderTaskGuide();
        renderWorkspace();
      });
      taskList.appendChild(taskButton);
    });

    body.appendChild(taskList);
    sectionCard.appendChild(header);
    sectionCard.appendChild(body);
    taskGuideEl.appendChild(sectionCard);
  });
}

function renderWorkspace() {
  const selected = findTaskById(activeTaskId);

  if (!selected) {
    workspaceContentEl.innerHTML = "";
    return;
  }

  const screen = selected.task.screen;

  if (screen === "photos-test") {
    workspaceContentEl.innerHTML = `
      <section class="content-card hero-card">
        <span class="badge">Test task</span>

        <div class="hero-head">
          <div class="hero-title-block">
            <h1 class="hero-title">Photos from the past</h1>
            <p class="hero-subtitle">
              Do you like taking photos? How many photos do you have on your phone?
              What do you usually take photos of?
            </p>

            <div class="idea-chips">
              <span class="idea-chip">yourself</span>
              <span class="idea-chip">other people</span>
              <span class="idea-chip">animals</span>
              <span class="idea-chip">nature</span>
              <span class="idea-chip">buildings</span>
            </div>
          </div>

          <img
            class="hero-illustration"
            src="https://flowstatic.s3.yandex.net/static/aloha-static/upload/cms/images/shinkovka/photos_camera.svg"
            alt="Camera illustration"
          />
        </div>
      </section>

      <section class="content-card image-task-card">
        <div class="image-task-grid">
          <p class="task-text">
            Посмотрите на фотографию Рика. Где он был в 2009 году?
            В каком месяце он был там? Какая была погода?
          </p>

          <img
            class="task-image"
            src="https://flowstatic.s3.yandex.net/static/aloha-static/upload/cms/images/shinkovka/photo_bali.svg"
            alt="Photo from the past"
          />
        </div>
      </section>

      <section class="content-card image-task-card">
        <div class="image-task-grid">
          <p class="task-text">
            Прочитайте комментарии под фото. Где в это время были сыновья Рика? Почему?
          </p>

          <img
            class="task-image"
            src="https://flowstatic.s3.yandex.net/static/aloha-static/upload/cms/images/shinkovka/photo_bali_comments.svg"
            alt="Comments under the photo"
          />
        </div>
      </section>

      <section class="dual-card content-card">
        <div class="dual-grid">
          <div class="sub-card">
            <h3 class="sub-card-title">Layout notes</h3>
            <p class="sub-card-text">
              Left task guide is fixed at 469 px. Workspace starts at x = 468.984 px
              and fills the remaining width of the 1260 px root container.
            </p>
          </div>

          <div class="sub-card">
            <h3 class="sub-card-title">Current goal</h3>
            <p class="sub-card-text">
              This is the neutral reference clone stage — no Space Whale redesign yet.
              First we match geometry, spacing, cards, and content behavior.
            </p>
          </div>
        </div>
      </section>

      <div class="exercise-nav">
        <button class="nav-button" type="button">Previous</button>

        <div class="nav-dots" aria-label="Exercise steps">
          <span class="nav-dot"></span>
          <span class="nav-dot active"></span>
          <span class="nav-dot"></span>
          <span class="nav-dot"></span>
        </div>

        <button class="nav-button primary" type="button">Next</button>
      </div>
    `;
    return;
  }

  const screenTitles = {
    "tutor-overview": "Tutor overview",
    "overview-lead": "Lead-in",
    "overview-revision": "Revision",
    "overview-extension": "Extension",
    "photos-lead": "Lead-in",
    "photos-revision": "Revision",
    "photos-extension": "Extension",
    "celeb-test": "Celebrities from the past",
    "celeb-revision": "Revision",
    "celeb-extension": "Extension",
    "yesterday-test": "Where were you yesterday?",
    "yesterday-revision": "Revision",
    "yesterday-extension": "Extension"
  };

  const title = screenTitles[screen] || "Screen";
  const sectionTitle = selected.section.title;
  const taskTitle = selected.task.title;

  workspaceContentEl.innerHTML = `
    <section class="content-card placeholder-screen">
      <span class="badge">${taskTitle}</span>
      <h1 class="placeholder-title">${title}</h1>
      <p class="placeholder-text">
        Section: <strong>${sectionTitle}</strong><br />
        This screen is a placeholder in V1 of the reference clone.
        The main purpose right now is to lock the overall geometry,
        sidebar behavior, content card system, and page rhythm.
      </p>
    </section>

    <section class="content-card placeholder-screen">
      <h2 class="placeholder-title">Next refinement step</h2>
      <p class="placeholder-text">
        After you open this in the browser, compare it with the original page and note:
        card heights, vertical gaps, button size, font size, and the exact look of the task guide.
      </p>
    </section>

    <div class="exercise-nav">
      <button class="nav-button" type="button">Previous</button>

      <div class="nav-dots" aria-label="Exercise steps">
        <span class="nav-dot active"></span>
        <span class="nav-dot"></span>
        <span class="nav-dot"></span>
        <span class="nav-dot"></span>
      </div>

      <button class="nav-button primary" type="button">Next</button>
    </div>
  `;
}

renderTaskGuide();
renderWorkspace();
