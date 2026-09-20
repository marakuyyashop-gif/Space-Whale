const taskGuide = document.getElementById("taskGuide");
const lessonContent = document.getElementById("lessonContent");

const chevronSvg = `
<svg viewBox="0 0 24 24" aria-hidden="true">
  <path d="M17.586 9H6.414c-.89 0-1.337 1.077-.707 1.707l5.94 5.94a.5.5 0 0 0 .707 0l5.939-5.94c.63-.63.184-1.707-.707-1.707Z"/>
</svg>`;

const checkSvg = `
<svg viewBox="0 0 24 24" aria-hidden="true">
  <path d="M19.716 4.386a1 1 0 0 1 1.572 1.236L10.665 19.136a1.499 1.499 0 0 1-2.324.042l-5.104-6.032a1 1 0 1 1 1.526-1.292l4.708 5.564L19.716 4.386Z"/>
</svg>`;

const sections = [
  {
    id: "module-info",
    title: "Module info",
    expanded: false,
    preview: "Информация для преподавателя",
    tasks: [
      {
        id: "module-info-task",
        name: "[info] A2.1 Module 2 overview for tutor",
        done: false,
        details: {
          Tip: "Здесь лежит информация для преподавателя. Не делись экраном со студентом. По возможности, изучи её до урока."
        }
      }
    ]
  },
  {
    id: "overview",
    title: "A2.1 Модуль 2. Обзор",
    expanded: false,
    preview: "Обзор модуля"
  },
  {
    id: "photos",
    title: "Фотографии из прошлого",
    expanded: true,
    tasks: [
      {
        id: "photos-test",
        name: "Test task",
        done: true,
        details: {
          Aim: "To set the context and talk about someone’s trip in the past",
          TL: "was/were (+)",
          Say: "1. Look at the picture. What can you see? (a camera and photos) Right, today we’re going to talk about photos. Let’s discuss the questions first. 2. Now look at this photo and read the task. 3. Where was Rick in 2009? (in Bali) Which month was it? (May) What was the weather like? (sunny) 4. OK, now look at the comments. Where were Rick’s sons? Why?",
          Time: "5 minutes"
        }
      },
      {
        id: "photos-revision",
        name: "Revision",
        done: false,
        details: {
          Aim: "To describe a trip in the past",
          TL: "was/were (+)"
        }
      },
      {
        id: "photos-extension",
        name: "Extension",
        done: false,
        details: {
          Aim: "To practice talking about the past"
        }
      }
    ]
  },
  {
    id: "celebrities",
    title: "Знаменитости прошлого",
    expanded: false,
    preview: "Test task · Revision · Extension"
  },
  {
    id: "yesterday",
    title: "Где ты был вчера?",
    expanded: false,
    preview: "Test task · Revision · Extension"
  }
];

let activeTaskId = "photos-test";
let openTaskId = "photos-test";

function renderGuide() {
  taskGuide.innerHTML = "";

  sections.forEach((section) => {
    const sectionEl = document.createElement("section");
    sectionEl.className = "guide-section " + (section.expanded ? "expanded" : "collapsed");

    const titleButton = document.createElement("button");
    titleButton.type = "button";
    titleButton.className = "guide-section__title";
    titleButton.innerHTML = `
      <span>${section.title}</span>
      ${chevronSvg}
    `;

    titleButton.addEventListener("click", () => {
      section.expanded = !section.expanded;
      renderGuide();
    });

    sectionEl.appendChild(titleButton);

    if (!section.expanded) {
      const preview = document.createElement("div");
      preview.className = "collapsed-preview";
      preview.textContent = section.preview || "";
      sectionEl.appendChild(preview);
      taskGuide.appendChild(sectionEl);
      return;
    }

    if (section.tasks?.length) {
      const tabs = document.createElement("div");
      tabs.className = "guide-tabs";
      tabs.innerHTML = `
        <button class="guide-tab active" type="button">Tasks</button>
        <button class="guide-tab" type="button">Language input</button>
        <button class="guide-tab" type="button">Self study</button>
      `;
      sectionEl.appendChild(tabs);

      section.tasks.forEach((task) => {
        const taskEl = document.createElement("div");
        taskEl.className = "guide-task " + (openTaskId === task.id ? "open" : "");

        const taskButton = document.createElement("button");
        taskButton.type = "button";
        taskButton.className = "guide-task__header";
        taskButton.innerHTML = `
          <span class="guide-task__name">${task.name}</span>
          <span class="guide-task__right">
            ${task.done ? `<span class="done-pill">Done ${checkSvg}</span>` : ""}
            <span class="task-chevron">${chevronSvg}</span>
          </span>
        `;

        taskButton.addEventListener("click", () => {
          activeTaskId = task.id;
          openTaskId = openTaskId === task.id ? null : task.id;
          renderGuide();
          renderLesson();
        });

        taskEl.appendChild(taskButton);

        const details = document.createElement("div");
        details.className = "guide-task__details";
        Object.entries(task.details || {}).forEach(([label, value]) => {
          const row = document.createElement("div");
          row.className = "detail-row";
          row.innerHTML = `<strong>${label}:</strong> ${value}`;
          details.appendChild(row);
        });
        taskEl.appendChild(details);

        sectionEl.appendChild(taskEl);
      });
    }

    taskGuide.appendChild(sectionEl);
  });
}

function photosTestPage() {
  return `
    <article class="lesson">
      <h1 class="lesson-title">Test task: Photos from the past</h1>

      <section class="lesson-block">
        <div class="lesson-block__visual">
          <img
            src="https://flowstatic.s3.yandex.net/static/aloha-static/upload/cms/images/shinkovka/photos_camera.svg"
            alt="Camera and photos"
          />
        </div>
        <div class="lesson-block__content">
          <p>Do you like taking photos?</p>
          <p>How many photos do you have on your phone?</p>
          <p>What do you usually take photos of? Here are some ideas:</p>
          <ul>
            <li>yourself</li>
            <li>other people</li>
            <li>animals</li>
            <li>nature</li>
            <li>buildings</li>
          </ul>
        </div>
        ${drawingTools()}
      </section>

      <section class="lesson-block">
        <div class="lesson-block__visual">
          <img
            src="https://flowstatic.s3.yandex.net/static/aloha-static/upload/cms/images/shinkovka/photo_bali.svg"
            alt="Rick in Bali"
          />
        </div>
        <div class="lesson-block__content">
          <p>Посмотрите на фотографию Рика.</p>
          <p>Где он был в 2009 году?</p>
          <p>В каком месяце он был там?</p>
          <p>Какая была погода?</p>
        </div>
        ${drawingTools()}
      </section>

      <section class="lesson-block">
        <div class="lesson-block__visual">
          <img
            src="https://flowstatic.s3.yandex.net/static/aloha-static/upload/cms/images/shinkovka/photo_bali_comments.svg"
            alt="Comments under Rick's photo"
          />
        </div>
        <div class="lesson-block__content">
          <p>Прочитайте комментарии под фото.</p>
          <p>Где в это время были сыновья Рика?</p>
          <p>Почему?</p>
        </div>
        ${drawingTools()}
      </section>
    </article>
  `;
}

function drawingTools() {
  return `
    <div class="drawing-tools" aria-hidden="true">
      <button class="tool" type="button">✎</button>
      <button class="tool" type="button">╱</button>
      <button class="tool" type="button">T</button>
      <button class="tool" type="button">●</button>
      <button class="tool" type="button">↶</button>
      <button class="tool" type="button">↷</button>
      <button class="tool" type="button">⌫</button>
    </div>
  `;
}

function placeholderPage(title) {
  return `
    <article class="placeholder-page">
      <h2>${title}</h2>
      <p>Этот экран пока оставлен как заготовка. Сейчас мы доводим до референса основной экран Test task и общую разметку интерфейса.</p>
    </article>
  `;
}

function renderLesson() {
  if (activeTaskId === "photos-test") {
    lessonContent.innerHTML = photosTestPage();
    return;
  }

  const taskNames = {
    "module-info-task": "Module info",
    "photos-revision": "Revision",
    "photos-extension": "Extension"
  };

  lessonContent.innerHTML = placeholderPage(taskNames[activeTaskId] || "Lesson");
}

renderGuide();
renderLesson();
