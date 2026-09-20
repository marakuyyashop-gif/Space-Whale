const courseModules = [
  {
    id: "small-talk",
    title: "Module 1 · Small Talk",
    expanded: false,
    lessons: [
      { id: "small-talk-1", title: "Знакомство с новыми людьми", expanded: false, activities: [] }
    ]
  },
  {
    id: "the-past",
    title: "Module 2 · The Past",
    expanded: true,
    active: true,
    lessons: [
      {
        id: "photos",
        title: "Фотографии из прошлого",
        expanded: true,
        current: true,
        activities: [
          { id: "photos-test", name: "Test task", done: true },
          { id: "photos-revision", name: "Revision", done: false },
          { id: "photos-extension", name: "Extension", done: false }
        ]
      },
      {
        id: "celebrities",
        title: "Знаменитости прошлого",
        expanded: false,
        activities: [
          { id: "celeb-test", name: "Test task", done: false }
        ]
      },
      {
        id: "yesterday",
        title: "Где ты был вчера?",
        expanded: false,
        activities: [
          { id: "yesterday-test", name: "Test task", done: false }
        ]
      }
    ]
  },
  {
    id: "stories",
    title: "Module 3 · Stories",
    expanded: false,
    lessons: [
      { id: "stories-1", title: "Первый день на новом месте", expanded: false, activities: [] }
    ]
  }
];

let activeTaskId = "photos-test";

const courseTree = document.getElementById("courseTree");
const lessonContent = document.getElementById("lessonContent");

const chevronRightSvg = `
  <svg class="course-chevron" viewBox="0 0 24 24" aria-hidden="true">
    <path d="m9 6 6 6-6 6"/>
  </svg>
`;

function findActivity(activityId) {
  for (const module of courseModules) {
    for (const lesson of module.lessons) {
      const activity = lesson.activities.find((item) => item.id === activityId);
      if (activity) return { module, lesson, activity };
    }
  }
  return null;
}

function selectActivity(activityId, { remote = false } = {}) {
  const classroom = window.SpaceWhaleClassroom;
  if (!remote && classroom?.state?.channel && classroom.state.role === "student") {
    return;
  }

  const target = findActivity(activityId);
  if (!target) return;

  activeTaskId = activityId;
  target.module.expanded = true;
  target.lesson.expanded = true;
  renderCourseTree();
  renderLesson();

  if (!remote && classroom?.state?.channel && classroom.state.role === "teacher") {
    classroom.navigate(activityId).catch((error) => console.error("[Space Whale] Navigation sync failed", error));
  }
}

function renderCourseTree() {
  courseTree.innerHTML = "";

  courseModules.forEach((module) => {
    const moduleEl = document.createElement("section");
    moduleEl.className = `course-module ${module.expanded ? "expanded" : ""}`;

    const moduleButton = document.createElement("button");
    moduleButton.type = "button";
    moduleButton.className = `course-module__button ${module.active ? "active" : ""}`;
    moduleButton.innerHTML = `
      <span>${module.title}</span>
      ${chevronRightSvg}
    `;

    moduleButton.addEventListener("click", () => {
      module.expanded = !module.expanded;
      renderCourseTree();
    });

    moduleEl.appendChild(moduleButton);

    const moduleContent = document.createElement("div");
    moduleContent.className = "course-module__content";

    module.lessons.forEach((lesson) => {
      const lessonEl = document.createElement("div");
      lessonEl.className = `course-lesson ${lesson.expanded ? "expanded" : ""} ${lesson.current ? "current" : ""}`;

      const lessonButton = document.createElement("button");
      lessonButton.type = "button";
      lessonButton.className = "course-lesson__button";
      lessonButton.innerHTML = `
        <span>${lesson.title}</span>
        ${lesson.activities.length ? chevronRightSvg : ""}
      `;

      lessonButton.addEventListener("click", () => {
        if (lesson.activities.length) {
          lesson.expanded = !lesson.expanded;
          renderCourseTree();
        }
      });

      lessonEl.appendChild(lessonButton);

      if (lesson.activities.length) {
        const activitiesEl = document.createElement("div");
        activitiesEl.className = "course-lesson__activities";

        lesson.activities.forEach((activity) => {
          const activityButton = document.createElement("button");
          activityButton.type = "button";
          activityButton.className = `course-activity ${activeTaskId === activity.id ? "active" : ""} ${activity.done ? "done" : ""}`;
          activityButton.textContent = activity.name;

          if (window.SpaceWhaleClassroom?.state?.channel && window.SpaceWhaleClassroom.state.role === "student") {
            activityButton.disabled = true;
          }

          activityButton.addEventListener("click", () => {
            selectActivity(activity.id);
          });

          activitiesEl.appendChild(activityButton);
        });

        lessonEl.appendChild(activitiesEl);
      }

      moduleContent.appendChild(lessonEl);
    });

    moduleEl.appendChild(moduleContent);
    courseTree.appendChild(moduleEl);
  });
}

const workspacePages = {
  "photos-test": {
    title: "Test task: Photos from the past",
    blocks: [
      {
        variant: "hero",
        image: "https://flowstatic.s3.yandex.net/static/aloha-static/upload/cms/images/shinkovka/photos_camera.svg",
        alt: "Camera and photos",
        html: `
          <p>Do you like taking photos? How many photos do you have on your phone?</p>
          <p>What do you usually take photos of? Here are some ideas:</p>
          <ul>
            <li>yourself</li>
            <li>other people</li>
            <li>animals</li>
            <li>nature</li>
            <li>buildings</li>
          </ul>
        `
      },
      {
        variant: "standard",
        image: "https://flowstatic.s3.yandex.net/static/aloha-static/upload/cms/images/shinkovka/photo_bali.svg",
        alt: "Rick's photo",
        html: `
          <p>Посмотрите на фотографию Рика.</p>
          <p>Где он был в 2009 году?</p>
          <p>В каком месяце он был там?</p>
          <p>Какая была погода?</p>
        `
      },
      {
        variant: "standard",
        image: "https://flowstatic.s3.yandex.net/static/aloha-static/upload/cms/images/shinkovka/photo_bali_comments.svg",
        alt: "Comments under Rick's photo",
        html: `
          <p>Прочитайте комментарии под фото.</p>
          <p>Где в это время были сыновья Рика?</p>
          <p>Почему?</p>
        `
      }
    ]
  }
};

function renderWorkspacePage(page) {
  const blocks = page.blocks.map((block) => `
    <section class="exercise-row exercise-row--${block.variant || "standard"}">
      <div class="exercise-media">
        <img src="${block.image}" alt="${block.alt || ""}" />
      </div>
      <div class="exercise-copy">
        ${block.html}
      </div>
    </section>
  `).join("");

  lessonContent.innerHTML = `
    <article class="exercise-page">
      <section class="exercise-title-card">
        <h1 class="lesson-title">${page.title}</h1>
      </section>
      <div class="exercise-stack">
        ${blocks}
      </div>
    </article>
  `;
}

function renderLesson() {
  const current = findActivity(activeTaskId);
  const page = workspacePages[activeTaskId];

  if (page) {
    renderWorkspacePage(page);
  } else {
    renderWorkspacePage({
      title: current ? current.activity.name : "Lesson",
      blocks: [
        {
          variant: "standard",
          image: "https://flowstatic.s3.yandex.net/static/aloha-static/upload/cms/images/shinkovka/photos_camera.svg",
          alt: "",
          html: `<div class="exercise-placeholder">Здесь будет содержимое упражнения. Геометрия рабочего пространства уже остаётся такой же для всех заданий.</div>`
        }
      ]
    });
  }

  lessonContent.scrollTop = 0;
}

renderCourseTree();
renderLesson();


document.querySelectorAll(".sidebar-nav-item").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".sidebar-nav-item").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
  });
});

async function initLiveClassroom() {
  const classroom = window.SpaceWhaleClassroom;
  if (!classroom) return;

  const params = new URLSearchParams(location.search);
  const sessionId = params.get("session");
  if (!sessionId) return;

  const user = await classroom.getCurrentUser();
  if (!user) {
    const next = encodeURIComponent("index.html" + location.search);
    location.href = `login.html?next=${next}`;
    return;
  }

  const stateLabel = document.querySelector(".session-state span:last-child");

  const renderPresence = (presenceState) => {
    const presences = Object.values(presenceState || {}).flat();
    const studentOnline = presences.some((item) => item.role === "student");
    if (stateLabel) {
      stateLabel.textContent = studentOnline ? "Student is online" : "Student has not joined yet";
    }
  };

  const result = await classroom.connect(sessionId, {
    onNavigate: (payload) => {
      if (payload?.current_exercise_id) {
        selectActivity(payload.current_exercise_id, { remote: true });
      }
    },
    onPresence: renderPresence,
    onJoin: () => renderPresence(classroom.state.channel?.presenceState?.() || {}),
    onLeave: () => renderPresence(classroom.state.channel?.presenceState?.() || {})
  });

  const shared = await classroom.loadSharedState(sessionId);
  if (shared?.current_exercise_id) {
    selectActivity(shared.current_exercise_id, { remote: true });
  } else if (result.role === "teacher") {
    await classroom.navigate(activeTaskId);
  }

  renderCourseTree();
  renderPresence(classroom.state.channel.presenceState());
}

initLiveClassroom().catch((error) => {
  console.error("[Space Whale] Classroom connection failed", error);
});
