const sections = [
  {
    id: "module-info",
    title: "Module info",
    collapsed: true,
    tasks: [
      {
        id: "module-info-task",
        name: "[info] A2.1 Module 2 overview for tutor",
        done: false,
        open: false
      }
    ]
  },
  {
    id: "overview",
    title: "A2.1 Модуль 2. Обзор",
    collapsed: true,
    tasks: []
  },
  {
    id: "photos",
    title: "Фотографии из прошлого",
    collapsed: false,
    tasks: [
      {
        id: "photos-test",
        name: "Test task",
        done: true,
        open: true,
        aim: "To set the context and talk about someone’s trip in the past",
        tl: "was/were (+)",
        say: "1. Look at the picture. What can you see? (a camera and photos) Right, today we’re going to talk about photos. Let’s discuss the questions first. 2. Now look at this photo and read the task. 3. Where was Rick in 2009? (in Bali) Which month was it? (May) What was the weather like? (sunny) 4. OK, now look at the comments. Where were Rick’s sons? Why?",
        time: "5 minutes"
      },
      {
        id: "photos-revision",
        name: "Revision",
        done: false,
        open: false,
        aim: "To describe a trip in the past",
        tl: "was/were (+)",
        say: "Look at the picture and read the task. You have one minute to think about your answers. Then tell me about this trip.",
        time: "5 minutes"
      },
      {
        id: "photos-extension",
        name: "Extension",
        done: false,
        open: false,
        aim: "To practice the target language in a freer context",
        tl: "was/were",
        say: "Read the task and discuss it with your tutor.",
        time: "5 minutes"
      }
    ]
  },
  {
    id: "celebrities",
    title: "Знаменитости прошлого",
    collapsed: true,
    tasks: [
      { id: "celeb-test", name: "Test task", done: false, open: false }
    ]
  },
  {
    id: "yesterday",
    title: "Где ты был вчера?",
    collapsed: true,
    tasks: [
      { id: "yesterday-test", name: "Test task", done: false, open: false }
    ]
  }
];

let activeTaskId = "photos-test";

const taskGuide = document.getElementById("taskGuide");
const lessonContent = document.getElementById("lessonContent");

const chevronSvg = `
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M17.6 9H6.4c-.9 0-1.3 1.1-.7 1.7l5.9 5.9a.5.5 0 0 0 .8 0l5.9-5.9c.6-.6.2-1.7-.7-1.7Z"/>
  </svg>
`;

const checkSvg = `
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M19.7 4.4a1 1 0 0 1 1.6 1.2L10.7 19.1a1.5 1.5 0 0 1-2.3 0l-5.2-6a1 1 0 1 1 1.6-1.3l4.7 5.6L19.7 4.4Z"/>
  </svg>
`;

function findTask(taskId) {
  for (const section of sections) {
    const task = section.tasks.find((item) => item.id === taskId);
    if (task) return { section, task };
  }
  return null;
}

function renderGuide() {
  taskGuide.innerHTML = "";

  sections.forEach((section) => {
    const wrapper = document.createElement("section");
    wrapper.className = `guide-section ${section.collapsed ? "collapsed" : "expanded"}`;

    const title = document.createElement("button");
    title.className = "guide-section__title";
    title.type = "button";
    title.innerHTML = `<span>${section.title}</span>`;
    title.addEventListener("click", () => {
      section.collapsed = !section.collapsed;
      renderGuide();
    });

    wrapper.appendChild(title);

    if (section.collapsed) {
      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "section-toggle-circle";
      toggle.setAttribute("aria-label", "Expand section");
      toggle.innerHTML = chevronSvg;
      toggle.addEventListener("click", () => {
        section.collapsed = false;
        renderGuide();
      });
      wrapper.appendChild(toggle);
    } else {
      const tabs = document.createElement("div");
      tabs.className = "guide-tabs";
      tabs.innerHTML = `
        <button class="guide-tab active" type="button">Tasks</button>
        <button class="guide-tab" type="button">Language input</button>
        <button class="guide-tab" type="button">Self study</button>
      `;
      wrapper.appendChild(tabs);

      section.tasks.forEach((task) => {
        const taskEl = document.createElement("div");
        taskEl.className = `guide-task ${task.open ? "open" : ""}`;

        const header = document.createElement("button");
        header.type = "button";
        header.className = "guide-task__header";
        header.innerHTML = `
          <span class="guide-task__name">${task.name}</span>
          <span class="guide-task__right">
            ${task.done ? `<span class="done-pill">Done ${checkSvg}</span>` : ""}
          </span>
        `;

        header.addEventListener("click", () => {
          task.open = !task.open;
          activeTaskId = task.id;
          renderGuide();
          renderLesson();
        });

        taskEl.appendChild(header);

        if (task.aim || task.tl || task.say || task.time) {
          const details = document.createElement("div");
          details.className = "guide-task__details";
          details.innerHTML = `
            ${task.aim ? `<div class="detail-row"><strong>Aim:</strong> ${task.aim}</div>` : ""}
            ${task.tl ? `<div class="detail-row"><strong>TL:</strong> ${task.tl}</div>` : ""}
            ${task.say ? `<div class="detail-row"><strong>Say:</strong> ${task.say}</div>` : ""}
            ${task.time ? `<div class="detail-row"><strong>Time:</strong> ${task.time}</div>` : ""}
          `;
          taskEl.appendChild(details);
        }

        wrapper.appendChild(taskEl);
      });
    }

    taskGuide.appendChild(wrapper);
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
  const current = findTask(activeTaskId);
  const page = workspacePages[activeTaskId];

  if (page) {
    renderWorkspacePage(page);
  } else {
    renderWorkspacePage({
      title: current ? current.task.name : "Lesson",
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

renderGuide();
renderLesson();
