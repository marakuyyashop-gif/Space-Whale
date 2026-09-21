let courseModules = [
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
        activities: [{ id: "celeb-test", name: "Test task", done: false }]
      },
      {
        id: "yesterday",
        title: "Где ты был вчера?",
        expanded: false,
        activities: [{ id: "yesterday-test", name: "Test task", done: false }]
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
const liveResponses = new Map();

const courseTree = document.getElementById("courseTree");
const lessonContent = document.getElementById("lessonContent");

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

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

function firstActivityId() {
  for (const module of courseModules) {
    for (const lesson of module.lessons) {
      if (lesson.activities.length) return lesson.activities[0].id;
    }
  }
  return null;
}

function selectActivity(activityId, { remote = false } = {}) {
  const classroom = window.SpaceWhaleClassroom;
  if (!remote && classroom?.state?.channel && classroom.state.role === "student") return;

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
      <span>${escapeHtml(module.title)}</span>
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
        <span>${escapeHtml(lesson.title)}</span>
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

          activityButton.addEventListener("click", () => selectActivity(activity.id));
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

let workspacePages = {
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
      }
    ]
  }
};

function renderStructuredCopy(block) {
  const title = block.title ? `<h3>${escapeHtml(block.title)}</h3>` : "";
  const text = block.text
    ? String(block.text).split(/\n+/).filter(Boolean).map((line) => `<p>${escapeHtml(line)}</p>`).join("")
    : "";
  return title + text;
}

function renderWorkspacePage(page) {
  const blocks = (page.blocks || []).map((block) => {
    const media = block.image
      ? `<div class="exercise-media"><img src="${escapeHtml(block.image)}" alt="${escapeHtml(block.alt || "")}" /></div>`
      : "";
    const copy = block.html || renderStructuredCopy(block) || '<div class="exercise-placeholder">Lesson content will appear here.</div>';

    return `
      <section class="exercise-row exercise-row--${escapeHtml(block.variant || "standard")} ${block.image ? "" : "exercise-row--text-only"}">
        ${media}
        <div class="exercise-copy">${copy}</div>
      </section>
    `;
  }).join("");

  lessonContent.innerHTML = `
    <article class="exercise-page">
      <section class="exercise-title-card">
        <h1 class="lesson-title">${escapeHtml(page.title || "Lesson")}</h1>
      </section>
      <div class="exercise-stack">
        ${blocks || '<div class="exercise-placeholder">No activities have been added yet.</div>'}
      </div>
    </article>
  `;
}

function responseSummaryHtml(payload) {
  if (!payload) {
    return '<div class="live-response-empty">Waiting for the student’s answer…</div>';
  }

  const response = payload.response || {};
  let answer = "";
  if (response.option_text) answer = response.option_text;
  else if (response.text) answer = response.text;
  else answer = JSON.stringify(response);

  const verdict = payload.is_correct === true
    ? '<span class="response-verdict correct">Correct</span>'
    : payload.is_correct === false
      ? '<span class="response-verdict incorrect">Needs another try</span>'
      : '<span class="response-verdict neutral">Submitted</span>';

  return `
    <div class="live-response-answer">
      <div>${verdict}</div>
      <strong>${escapeHtml(answer)}</strong>
      <small>${payload.submitted_at ? escapeHtml(new Date(payload.submitted_at).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})) : "Live"}</small>
    </div>
  `;
}

async function hydrateExerciseResponse(exerciseId) {
  const classroom = window.SpaceWhaleClassroom;
  if (!classroom?.state?.session || !exerciseId) return;

  try {
    const saved = await classroom.loadExerciseResponse(exerciseId);
    if (!saved) return;
    const payload = {
      exercise_id: exerciseId,
      response: saved.response,
      is_correct: saved.is_correct,
      submitted_at: saved.submitted_at,
      student_id: saved.student_id
    };
    liveResponses.set(exerciseId, payload);

    if (activeTaskId !== exerciseId) return;

    const teacherPanel = document.querySelector("[data-live-response]");
    if (teacherPanel && classroom.state.role === "teacher") {
      teacherPanel.innerHTML = responseSummaryHtml(payload);
    }

    if (classroom.state.role === "student") {
      const response = saved.response || {};
      if (response.option_index != null) {
        document.querySelectorAll('[name="exerciseOption"]').forEach((input) => {
          input.checked = Number(input.value) === Number(response.option_index);
        });
      }
      const text = document.getElementById("shortTextAnswer");
      if (text && typeof response.text === "string") text.value = response.text;
      const feedback = document.getElementById("exerciseFeedback");
      if (feedback && saved.submitted_at) {
        feedback.textContent = saved.is_correct === true
          ? "Saved — correct."
          : saved.is_correct === false
            ? "Saved — try once more."
            : "Answer saved.";
      }
    }
  } catch (error) {
    console.error("[Space Whale] Could not restore exercise response", error);
  }
}

function renderInteractiveActivity(activity) {
  const content = activity.content || {};
  const classroom = window.SpaceWhaleClassroom;
  const role = classroom?.state?.role || null;
  const saved = liveResponses.get(activity.id);

  if (content.kind === "multiple_choice") {
    const options = Array.isArray(content.options) ? content.options : [];
    const optionHtml = options.map((option,index) => `
      <label class="exercise-option">
        <input type="radio" name="exerciseOption" value="${index}" ${role === "teacher" ? "disabled" : ""}>
        <span class="exercise-option-marker">${String.fromCharCode(65 + index)}</span>
        <span>${escapeHtml(option)}</span>
      </label>
    `).join("");

    lessonContent.innerHTML = `
      <article class="exercise-page interactive-page">
        <section class="exercise-title-card">
          <h1 class="lesson-title">${escapeHtml(activity.name)}</h1>
        </section>
        <section class="interactive-exercise-card">
          <div class="interactive-question">${escapeHtml(content.question || "Choose the correct answer.")}</div>
          <div class="exercise-options">${optionHtml}</div>
          ${role === "student" ? `
            <div class="interactive-actions">
              <button id="checkExerciseButton" class="exercise-action-button" type="button">Check answer</button>
              <span id="exerciseFeedback" class="exercise-feedback"></span>
            </div>
          ` : `
            <div class="teacher-live-response">
              <div class="teacher-live-response-heading">
                <span>LIVE STUDENT RESPONSE</span>
                <span class="live-dot"></span>
              </div>
              <div data-live-response>${responseSummaryHtml(saved)}</div>
            </div>
          `}
        </section>
      </article>
    `;

    if (role === "student") {
      document.getElementById("checkExerciseButton")?.addEventListener("click", async () => {
        const selected = document.querySelector('[name="exerciseOption"]:checked');
        const feedback = document.getElementById("exerciseFeedback");
        if (!selected) {
          feedback.textContent = "Choose an answer first.";
          return;
        }

        const index = Number(selected.value);
        const isCorrect = index === Number(content.correct_index);
        feedback.textContent = "Saving…";

        try {
          await classroom.saveExerciseResponse(activity.id, {
            option_index: index,
            option_text: options[index]
          }, { isCorrect, submitted: true });

          const payload = {
            exercise_id: activity.id,
            response: { option_index:index, option_text:options[index] },
            is_correct: isCorrect,
            submitted_at: new Date().toISOString()
          };
          liveResponses.set(activity.id,payload);
          feedback.textContent = isCorrect
            ? (content.correct_feedback || "Correct.")
            : (content.incorrect_feedback || "Try again.");
        } catch (error) {
          feedback.textContent = error.message;
        }
      });
    }

    hydrateExerciseResponse(activity.id);
    return true;
  }

  if (content.kind === "short_text") {
    lessonContent.innerHTML = `
      <article class="exercise-page interactive-page">
        <section class="exercise-title-card">
          <h1 class="lesson-title">${escapeHtml(activity.name)}</h1>
        </section>
        <section class="interactive-exercise-card">
          <div class="interactive-question">${escapeHtml(content.question || "Write your answer.")}</div>
          ${role === "student" ? `
            <textarea id="shortTextAnswer" class="exercise-text-answer" rows="5" placeholder="${escapeHtml(content.placeholder || "Type your answer…")}"></textarea>
            <div class="interactive-actions">
              <button id="submitTextAnswer" class="exercise-action-button" type="button">Send answer</button>
              <span id="exerciseFeedback" class="exercise-feedback"></span>
            </div>
          ` : `
            <div class="teacher-live-response">
              <div class="teacher-live-response-heading">
                <span>LIVE STUDENT RESPONSE</span>
                <span class="live-dot"></span>
              </div>
              <div data-live-response>${responseSummaryHtml(saved)}</div>
              ${content.teacher_note ? `<p class="teacher-note">${escapeHtml(content.teacher_note)}</p>` : ""}
            </div>
          `}
        </section>
      </article>
    `;

    if (role === "student") {
      document.getElementById("submitTextAnswer")?.addEventListener("click", async () => {
        const text = document.getElementById("shortTextAnswer").value.trim();
        const feedback = document.getElementById("exerciseFeedback");
        if (!text) {
          feedback.textContent = "Write an answer first.";
          return;
        }
        feedback.textContent = "Sending…";
        try {
          await classroom.saveExerciseResponse(activity.id,{ text },{ submitted:true });
          liveResponses.set(activity.id,{
            exercise_id:activity.id,
            response:{text},
            is_correct:null,
            submitted_at:new Date().toISOString()
          });
          feedback.textContent = "Answer sent to your teacher.";
        } catch (error) {
          feedback.textContent = error.message;
        }
      });
    }

    hydrateExerciseResponse(activity.id);
    return true;
  }

  return false;
}

function renderLesson() {
  const current = findActivity(activeTaskId);
  if (current?.activity?.content?.kind && renderInteractiveActivity(current.activity)) {
    lessonContent.scrollTop = 0;
    return;
  }

  const page = workspacePages[activeTaskId];

  if (page) {
    renderWorkspacePage(page);
  } else {
    renderWorkspacePage({
      title: current ? current.activity.name : "Lesson",
      blocks: [{
        variant: "standard",
        title: "Lesson activity",
        text: "This reusable lesson is connected to the classroom. Content can be expanded in the lesson editor."
      }]
    });
  }

  lessonContent.scrollTop = 0;
}

async function loadLibraryLesson(lessonId) {
  const client = window.spaceWhaleSupabase;
  if (!client || !lessonId) return false;

  const { data: lesson, error: lessonError } = await client
    .from("library_lessons")
    .select("id,module_id,title,summary,status")
    .eq("id", lessonId)
    .single();
  if (lessonError || !lesson) throw lessonError || new Error("Lesson material not found.");

  const { data: module, error: moduleError } = await client
    .from("library_modules")
    .select("id,course_id,title")
    .eq("id", lesson.module_id)
    .single();
  if (moduleError || !module) throw moduleError || new Error("Lesson module not found.");

  const { data: course, error: courseError } = await client
    .from("library_courses")
    .select("id,title,level,source_type")
    .eq("id", module.course_id)
    .single();
  if (courseError || !course) throw courseError || new Error("Course not found.");

  const { data: activities, error: activityError } = await client
    .from("library_activities")
    .select("id,title,activity_type,content,status,sort_order")
    .eq("lesson_id", lesson.id)
    .neq("status", "archived")
    .order("sort_order", { ascending: true });
  if (activityError) throw activityError;

  const normalizedActivities = (activities || []).map((activity) => ({
    id: activity.id,
    name: activity.title,
    done: false,
    content: activity.content || {}
  }));

  if (!normalizedActivities.length) {
    normalizedActivities.push({
      id: `overview-${lesson.id}`,
      name: "Lesson overview",
      done: false,
      content: {
        blocks: [{
          title: lesson.title,
          text: lesson.summary || "Lesson content has not been added yet."
        }]
      }
    });
  }

  courseModules = [{
    id: module.id,
    title: module.title,
    expanded: true,
    active: true,
    lessons: [{
      id: lesson.id,
      title: lesson.title,
      expanded: true,
      current: true,
      activities: normalizedActivities
    }]
  }];

  workspacePages = {};
  normalizedActivities.forEach((activity) => {
    const blocks = Array.isArray(activity.content?.blocks) && activity.content.blocks.length
      ? activity.content.blocks
      : [{
          title: activity.name,
          text: lesson.summary || "Lesson content has not been added yet."
        }];
    workspacePages[activity.id] = {
      title: activity.name,
      blocks: blocks.map((block) => ({
        variant: block.variant || "standard",
        title: block.title || "",
        text: block.text || "",
        image: block.image || null,
        alt: block.alt || ""
      }))
    };
  });

  activeTaskId = normalizedActivities[0].id;

  const levelLabel = document.querySelector(".level-selector span");
  if (levelLabel) levelLabel.textContent = course.level || course.title;

  const bannerTitle = document.querySelector(".module-banner__title");
  const bannerSubtitle = document.querySelector(".module-banner__subtitle");
  const bannerButton = document.querySelector(".module-banner .secondary-btn");
  if (bannerTitle) bannerTitle.textContent = [course.title, module.title].filter(Boolean).join(" · ");
  if (bannerSubtitle) bannerSubtitle.textContent = lesson.title;
  if (bannerButton) bannerButton.hidden = true;

  renderCourseTree();
  renderLesson();
  return true;
}

renderCourseTree();
renderLesson();


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
    onExerciseResponse: (payload) => {
      if (!payload?.exercise_id) return;
      liveResponses.set(payload.exercise_id,payload);

      if (payload.exercise_id === activeTaskId && classroom.state.role === "teacher") {
        const panel = document.querySelector("[data-live-response]");
        if (panel) panel.innerHTML = responseSummaryHtml(payload);
      }

      const toast = document.getElementById("classroomToast");
      if (toast && classroom.state.role === "teacher") {
        toast.textContent = "Student answer received";
        toast.classList.add("show");
        clearTimeout(window.__spaceWhaleToastTimer);
        window.__spaceWhaleToastTimer = setTimeout(() => toast.classList.remove("show"),1800);
      }
    },
    onPresence: renderPresence,
    onJoin: () => renderPresence(classroom.state.channel?.presenceState?.() || {}),
    onLeave: () => renderPresence(classroom.state.channel?.presenceState?.() || {})
  });

  if (result.session?.library_lesson_id) {
    await loadLibraryLesson(result.session.library_lesson_id);
  }

  const shared = await classroom.loadSharedState(sessionId);
  if (shared?.current_exercise_id && findActivity(shared.current_exercise_id)) {
    selectActivity(shared.current_exercise_id, { remote: true });
  } else {
    const first = firstActivityId();
    if (first) {
      activeTaskId = first;
      renderCourseTree();
      renderLesson();
      if (result.role === "teacher") {
        await classroom.navigate(first);
      }
    }
  }

  renderCourseTree();
  renderPresence(classroom.state.channel.presenceState());
}

initLiveClassroom().catch((error) => {
  console.error("[Space Whale] Classroom connection failed", error);
  const content = document.getElementById("lessonContent");
  if (content) {
    content.innerHTML = `
      <article class="exercise-page">
        <section class="exercise-title-card">
          <h1 class="lesson-title">Couldn’t open lesson material</h1>
        </section>
        <div class="exercise-placeholder">${escapeHtml(error.message)}</div>
      </article>
    `;
  }
});


/* === MOBILE SIDEBAR TOGGLE === */
(() => {
  const root = document.querySelector(".reference-app");
  const toggle = document.querySelector(".mobile-menu-toggle");
  const backdrop = document.querySelector(".mobile-menu-backdrop");
  if (!root || !toggle || !backdrop) return;

  const setOpen = (open) => {
    root.classList.toggle("mobile-sidebar-open", open);
    toggle.setAttribute("aria-expanded", String(open));
  };

  toggle.addEventListener("click", () => {
    setOpen(!root.classList.contains("mobile-sidebar-open"));
  });

  backdrop.addEventListener("click", () => setOpen(false));

  document.querySelectorAll(".sidebar-nav-item, .course-activity").forEach((el) => {
    el.addEventListener("click", () => {
      if (window.matchMedia("(max-width: 768px)").matches) setOpen(false);
    });
  });
})();



/* === CLASSROOM LESSON TABS === */
(() => {
  const tabs = Array.from(document.querySelectorAll("[data-classroom-tab]"));
  const panels = Array.from(document.querySelectorAll("[data-classroom-panel]"));
  if (!tabs.length || !panels.length) return;

  const activateTab = (name) => {
    tabs.forEach((tab) => {
      const active = tab.dataset.classroomTab === name;
      tab.classList.toggle("active", active);
      tab.setAttribute("aria-selected", String(active));
    });

    panels.forEach((panel) => {
      const active = panel.dataset.classroomPanel === name;
      panel.hidden = !active;
      panel.classList.toggle("active", active);
    });
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => activateTab(tab.dataset.classroomTab));
  });

  activateTab("lesson");
})();
