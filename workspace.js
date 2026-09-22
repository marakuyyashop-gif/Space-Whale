(() => {
  'use strict';
  if (new URLSearchParams(location.search).get('session')) return;
  const kit = window.SpaceWhaleExerciseKit;
  const catalog = window.SpaceWhaleCatalog.createCatalog(window.SpaceWhaleContent || [], window.SpaceWhaleTemplates || []);
  const host = document.getElementById('workspaceExercise');
  const tree = document.getElementById('workspaceTopics');
  const levelSelect = document.getElementById('workspaceLevel');
  const whaleSelect = document.getElementById('workspaceWhale');
  const libraryControls = document.getElementById('libraryControls');
  const libraryTab = document.getElementById('libraryTab');
  const templatesTab = document.getElementById('templatesTab');
  const unassigned = document.getElementById('unassignedTopics');
  const scroll = document.getElementById('workspaceScroll');
  const notice = document.getElementById('workspaceNotice');
  const attempts = new Map();
  let mounted;
  let route = catalog.normalize(location.search);
  let libraryRoute = route.view === 'templates' ? catalog.normalize('') : route;

  function node(tag, text, className) {
    const el = document.createElement(tag);
    if (text) el.textContent = text;
    if (className) el.className = className;
    return el;
  }
  function go(next) {
    route = catalog.normalize(catalog.query(next));
    history.pushState(null, '', `classroom.html${catalog.query(route)}`);
    render();
  }
  function link(text, next, active, className) {
    const el = node('a', text, className);
    el.href = `classroom.html${catalog.query(next)}`;
    if (active) el.setAttribute('aria-current', 'page');
    el.addEventListener('click', event => {
      if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault(); go(next);
    });
    return el;
  }
  function readAnswers(key, signature) {
    if (attempts.has(key)) return attempts.get(key);
    try {
      const saved = JSON.parse(sessionStorage.getItem(key));
      if (saved?.signature === signature && saved.answers && typeof saved.answers === 'object') return saved.answers;
    } catch (_) { /* Unavailable storage does not stop the lesson. */ }
    return {};
  }
  function remember(key, signature, answers) {
    attempts.set(key, answers);
    try { sessionStorage.setItem(key, JSON.stringify({ signature, answers })); }
    catch (_) { notice.textContent = 'Ответы сохраняются только до обновления страницы.'; }
  }
  function render() {
    mounted?.destroy(); mounted = null;
    host.replaceChildren(); tree.replaceChildren(); scroll.scrollTop = 0;
    if (route.view !== 'templates') libraryRoute = { ...route };
    libraryTab.setAttribute('aria-pressed', String(route.view !== 'templates'));
    templatesTab.setAttribute('aria-pressed', String(route.view === 'templates'));
    libraryControls.hidden = route.view === 'templates';
    unassigned.setAttribute('aria-pressed', String(route.view === 'unassigned'));
    levelSelect.value = route.level;
    whaleSelect.replaceChildren();
    catalog.levels.find(level => level.id === route.level).whales.forEach(whale => {
      const option = node('option', whale.title); option.value = whale.id; whaleSelect.append(option);
    });
    whaleSelect.value = route.whale;
    const topics = catalog.topics(route);
    let selected;
    topics.forEach(lesson => {
      const current = route.lesson === lesson.id;
      if (current) selected = lesson;
      const group = node('div', '', 'workspace-topic');
      if (route.view !== 'templates') group.append(link(lesson.title, { ...route, lesson: lesson.id, exercise: '' }, current, 'workspace-topic-link'));
      if (current) {
        const stages = node('nav', '', 'workspace-stages');
        stages.setAttribute('aria-label', `Задания: ${lesson.title}`);
        lesson.stages.forEach((stage, index) => {
          const label = route.view === 'templates' ? stage.menu : `${index + 1}. ${stage.menu}`;
          stages.append(link(label, { ...route, exercise: stage.exercise.id }, stage.exercise.id === route.exercise, 'workspace-stage-link'));
        });
        group.append(stages);
      }
      tree.append(group);
    });
    if (!topics.length) tree.append(node('p', 'Тем пока нет.', 'workspace-muted'));
    if (!selected) {
      const empty = node('section', '', 'workspace-empty');
      empty.append(node('h1', topics.length ? 'Выберите тему' : `${route.level} · Whale ${route.whale}`));
      empty.append(node('p', topics.length ? 'Откройте урок в библиотеке слева.' : 'В этом Whale пока нет уроков.'));
      host.append(empty); document.title = 'Space Whale — Learning Space'; return;
    }
    const exercise = selected.stages.find(stage => stage.exercise.id === route.exercise).exercise;
    document.title = `${selected.title} — Space Whale`;
    const key = `space-whale:workspace:v1:${selected.id}:${exercise.id}`;
    const signature = JSON.stringify(exercise);
    mounted = kit.mount(host, exercise, {
      answers: readAnswers(key, signature), onChange: answers => remember(key, signature, answers)
    });
  }
  catalog.levels.forEach(level => {
    const option = node('option', level.id); option.value = level.id; levelSelect.append(option);
  });
  levelSelect.addEventListener('change', () => go({ view: 'library', level: levelSelect.value, whale: 1 }));
  whaleSelect.addEventListener('change', () => go({ ...route, view: 'library', whale: Number(whaleSelect.value), lesson: '', exercise: '' }));
  unassigned.addEventListener('click', () => go({ ...route, view: 'unassigned', lesson: '', exercise: '' }));
  libraryTab.addEventListener('click', () => go(libraryRoute));
  templatesTab.addEventListener('click', () => go({ ...route, view: 'templates', lesson: 'templates', exercise: '' }));
  window.addEventListener('popstate', () => { route = catalog.normalize(location.search); render(); });
  history.replaceState(null, '', `classroom.html${catalog.query(route)}`);
  render();
})();
