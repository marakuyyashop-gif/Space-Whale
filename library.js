(() => {
  const client = window.spaceWhaleSupabase;
  const auth = window.SpaceWhaleAuth;
  const el = (id) => document.getElementById(id);

  let session;
  let profile;
  let workspaceId;
  let activeTab = "platform";
  let courses = [];
  let modules = [];
  let lessons = [];
  let activities = [];

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  async function loadWorkspace() {
    const { data, error } = await client
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", session.user.id)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (!data?.workspace_id) throw new Error("Teaching space not found.");
    workspaceId = data.workspace_id;
  }

  async function loadLibrary() {
    const [courseResult,moduleResult,lessonResult,activityResult] = await Promise.all([
      client.from("library_courses")
        .select("id,code,title,level,description,source_type,workspace_id,owner_id,status,sort_order")
        .neq("status","archived")
        .order("sort_order",{ascending:true}),
      client.from("library_modules")
        .select("id,course_id,code,title,description,sort_order")
        .order("sort_order",{ascending:true}),
      client.from("library_lessons")
        .select("id,module_id,code,title,summary,estimated_minutes,status,sort_order")
        .neq("status","archived")
        .order("sort_order",{ascending:true}),
      client.from("library_activities")
        .select("id,lesson_id,code,title,activity_type,content,status,sort_order")
        .neq("status","archived")
        .order("sort_order",{ascending:true})
    ]);

    if (courseResult.error) throw courseResult.error;
    if (moduleResult.error) throw moduleResult.error;
    if (lessonResult.error) throw lessonResult.error;
    if (activityResult.error) throw activityResult.error;

    courses = courseResult.data || [];
    modules = moduleResult.data || [];
    lessons = lessonResult.data || [];
    activities = activityResult.data || [];

    const levels = [...new Set(courses.map((course) => course.level).filter(Boolean))].sort();
    el("libraryLevel").innerHTML =
      '<option value="all">All levels</option>' +
      levels.map((level) => `<option value="${escapeHtml(level)}">${escapeHtml(level)}</option>`).join("");
  }

  function courseForLesson(lesson) {
    const module = modules.find((item) => item.id === lesson.module_id);
    return module ? courses.find((item) => item.id === module.course_id) : null;
  }

  function moduleForLesson(lesson) {
    return modules.find((item) => item.id === lesson.module_id) || null;
  }

  function filteredLessons() {
    const search = el("librarySearch").value.trim().toLowerCase();
    const level = el("libraryLevel").value;

    return lessons.filter((lesson) => {
      const course = courseForLesson(lesson);
      const module = moduleForLesson(lesson);
      if (!course || course.source_type !== activeTab) return false;
      if (level !== "all" && course.level !== level) return false;
      const haystack = `${lesson.title} ${lesson.summary || ""} ${course.title} ${module?.title || ""}`.toLowerCase();
      return !search || haystack.includes(search);
    });
  }

  function renderLibrary() {
    const list = filteredLessons();

    if (!list.length) {
      const copy = activeTab === "teacher"
        ? "Your personal lesson templates will appear here. Create one to reuse it in future sessions."
        : "No Space Whale lessons match this search.";
      el("libraryContent").innerHTML = `<div class="teacher-empty library-empty"><strong>No lessons here yet</strong><span>${escapeHtml(copy)}</span></div>`;
      return;
    }

    const grouped = new Map();
    list.forEach((lesson) => {
      const course = courseForLesson(lesson);
      const module = moduleForLesson(lesson);
      if (!grouped.has(course.id)) grouped.set(course.id,{course,modules:new Map()});
      const group = grouped.get(course.id);
      if (!group.modules.has(module.id)) group.modules.set(module.id,{module,lessons:[]});
      group.modules.get(module.id).lessons.push(lesson);
    });

    el("libraryContent").innerHTML = [...grouped.values()].map(({course,modules:moduleMap}) => `
      <section class="library-course-card">
        <div class="library-course-heading">
          <div>
            <span class="library-level-badge">${escapeHtml(course.level || "Custom")}</span>
            <h2>${escapeHtml(course.title)}</h2>
            ${course.description ? `<p>${escapeHtml(course.description)}</p>` : ""}
          </div>
          <span class="library-source-badge">${course.source_type === "platform" ? "Space Whale" : "My library"}</span>
        </div>
        <div class="library-modules">
          ${[...moduleMap.values()].map(({module,lessons:moduleLessons}) => `
            <div class="library-module">
              <div class="library-module-title">${escapeHtml(module.title)}</div>
              <div class="library-lessons-grid">
                ${moduleLessons.map((lesson) => {
                  const count = activities.filter((activity) => activity.lesson_id === lesson.id && activity.status !== "archived").length;
                  return `
                    <article class="library-lesson-card">
                      <div>
                        <div class="library-lesson-meta">${lesson.estimated_minutes ? `${lesson.estimated_minutes} min · ` : ""}${count} activities</div>
                        <h3>${escapeHtml(lesson.title)}</h3>
                        <p>${escapeHtml(lesson.summary || "Reusable lesson template")}</p>
                      </div>
                      <div class="library-lesson-actions">
                        <button class="sw-button secondary" type="button" data-preview="${escapeHtml(lesson.id)}">Preview</button>
                        <a class="sw-button" href="schedule.html?lesson=${encodeURIComponent(lesson.id)}">Use</a>
                        ${course.source_type === "teacher" ? `<button class="teacher-text-button library-archive" type="button" data-archive="${escapeHtml(lesson.id)}">Archive</button>` : ""}
                      </div>
                    </article>
                  `;
                }).join("")}
              </div>
            </div>
          `).join("")}
        </div>
      </section>
    `).join("");
  }

  function previewLesson(id) {
    const lesson = lessons.find((item) => item.id === id);
    if (!lesson) return;
    const module = moduleForLesson(lesson);
    const course = courseForLesson(lesson);
    const lessonActivities = activities.filter((item) => item.lesson_id === lesson.id && item.status !== "archived");

    el("previewMeta").textContent = [course?.level, module?.title].filter(Boolean).join(" · ") || "LESSON";
    el("previewTitle").textContent = lesson.title;
    el("previewSummary").textContent = lesson.summary || "";
    el("previewUseLink").href = `schedule.html?lesson=${encodeURIComponent(lesson.id)}`;

    el("previewActivities").innerHTML = lessonActivities.length
      ? lessonActivities.map((activity,index) => {
          const blocks = Array.isArray(activity.content?.blocks) ? activity.content.blocks : [];
          const excerpt = blocks.map((block) => block.text).filter(Boolean).join(" ");
          return `
            <div class="library-preview-activity">
              <span>${index + 1}</span>
              <div>
                <strong>${escapeHtml(activity.title)}</strong>
                <small>${escapeHtml(activity.activity_type)}</small>
                ${excerpt ? `<p>${escapeHtml(excerpt)}</p>` : ""}
              </div>
            </div>
          `;
        }).join("")
      : '<div class="sw-message">No activities have been added yet.</div>';

    openDialog("previewDialog");
  }

  async function ensurePersonalContainer(level) {
    const normalizedLevel = level || "Custom";
    let course = courses.find((item) =>
      item.source_type === "teacher" &&
      item.workspace_id === workspaceId &&
      (item.level || "Custom") === normalizedLevel
    );

    if (!course) {
      const { data, error } = await client
        .from("library_courses")
        .insert({
          code: `teacher-${session.user.id}-${crypto.randomUUID()}`,
          title: normalizedLevel === "Custom" ? "My lessons" : `My ${normalizedLevel} lessons`,
          level: normalizedLevel,
          description: "Personal reusable lesson templates",
          source_type: "teacher",
          workspace_id: workspaceId,
          owner_id: session.user.id,
          status: "published",
          sort_order: 1000 + courses.filter((item) => item.source_type === "teacher").length * 10
        })
        .select()
        .single();

      if (error) throw error;
      course = data;
      courses.push(course);
    }

    let module = modules.find((item) => item.course_id === course.id && item.code === "personal");
    if (!module) {
      const { data, error } = await client
        .from("library_modules")
        .insert({
          course_id: course.id,
          code: "personal",
          title: "Personal lessons",
          sort_order: 10
        })
        .select()
        .single();

      if (error) throw error;
      module = data;
      modules.push(module);
    }

    return {course,module};
  }

  async function createPersonalLesson(event) {
    event.preventDefault();
    const button = el("personalLessonSubmit");
    const message = el("personalLessonMessage");
    button.disabled = true;
    message.textContent = "Creating…";

    try {
      const title = el("personalTitle").value.trim();
      const level = el("personalLevel").value.trim();
      const summary = el("personalSummary").value.trim();
      const {module} = await ensurePersonalContainer(level);

      const { data: lesson, error } = await client
        .from("library_lessons")
        .insert({
          module_id: module.id,
          code: `lesson-${crypto.randomUUID()}`,
          title,
          summary: summary || null,
          estimated_minutes: 60,
          status: "published",
          sort_order: 1000 + lessons.filter((item) => item.module_id === module.id).length * 10
        })
        .select()
        .single();

      if (error) throw error;

      const { data: activity, error: activityError } = await client
        .from("library_activities")
        .insert({
          lesson_id: lesson.id,
          code: "notes",
          title: "Lesson notes",
          activity_type: "page",
          content: {
            blocks: [{
              title,
              text: summary || "Add lesson content in the lesson editor later."
            }]
          },
          status: "published",
          sort_order: 10
        })
        .select()
        .single();

      if (activityError) throw activityError;

      lessons.push(lesson);
      activities.push(activity);
      activeTab = "teacher";
      document.querySelectorAll(".library-tab").forEach((tab) => tab.classList.toggle("active",tab.dataset.tab === activeTab));
      el("personalLessonForm").reset();
      closeDialog("personalLessonDialog");
      renderLibrary();
    } catch (error) {
      message.textContent = error.message;
    } finally {
      button.disabled = false;
    }
  }

  async function archiveLesson(id) {
    const lesson = lessons.find((item) => item.id === id);
    if (!lesson) return;
    const { error } = await client.from("library_lessons").update({status:"archived"}).eq("id",id);
    if (error) throw error;
    lesson.status = "archived";
    renderLibrary();
  }

  function openDialog(id) {
    const dialog = el(id);
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open","");
  }

  function closeDialog(id) {
    const dialog = el(id);
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  }

  el("librarySearch").addEventListener("input",renderLibrary);
  el("libraryLevel").addEventListener("change",renderLibrary);
  el("newPersonalLesson").addEventListener("click",() => openDialog("personalLessonDialog"));
  el("personalLessonForm").addEventListener("submit",createPersonalLesson);
  el("logoutButton").addEventListener("click",() => auth.signOut());

  document.querySelectorAll(".library-tab").forEach((button) => {
    button.addEventListener("click",() => {
      activeTab = button.dataset.tab;
      document.querySelectorAll(".library-tab").forEach((tab) => tab.classList.toggle("active",tab === button));
      renderLibrary();
    });
  });

  document.querySelectorAll("[data-close]").forEach((button) => {
    button.addEventListener("click",() => closeDialog(button.dataset.close));
  });

  document.addEventListener("click",(event) => {
    const preview = event.target.closest("[data-preview]");
    const archive = event.target.closest("[data-archive]");
    if (preview) previewLesson(preview.dataset.preview);
    if (archive) archiveLesson(archive.dataset.archive).catch(console.error);
  });

  async function init() {
    session = await auth.requireSession();
    if (!session) return;
    profile = await auth.getProfile(session.user.id);
    if (profile.role !== "teacher") {
      location.href = "student-dashboard.html";
      return;
    }

    el("sidebarName").textContent = profile.display_name || "Teacher";
    el("sidebarAvatar").innerHTML = profile.avatar_url
      ? `<img src="${escapeHtml(profile.avatar_url)}" alt="">`
      : `<span>${escapeHtml((profile.display_name || "T").charAt(0).toUpperCase())}</span>`;

    await loadWorkspace();
    await loadLibrary();
    renderLibrary();

    el("pageLoading").hidden = true;
    el("teacherApp").hidden = false;
  }

  init().catch((error) => {
    console.error(error);
    el("pageLoading").textContent = error.message;
  });
})();