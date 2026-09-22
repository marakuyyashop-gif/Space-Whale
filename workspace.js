(() => {
  'use strict';

  const kit = window.SpaceWhaleExerciseKit;
  const catalog = window.SpaceWhaleCatalog.createCatalog(window.SpaceWhaleContent || [], window.SpaceWhaleTemplates || []);
  const classroom = window.SpaceWhaleClassroom || null;
  const sessionId = new URLSearchParams(location.search).get('session');

  const host = document.getElementById('workspaceExercise');
  const tree = document.getElementById('workspaceTopics');
  const course = document.getElementById('workspaceCourse');
  const notice = document.getElementById('workspaceNotice');
  const scroll = document.getElementById('workspaceScroll');
  const guideToggle = document.getElementById('taskGuide');
  const start = document.getElementById('startLesson');
  const sessionHeading = document.querySelector('.workspace-session-heading a');

  const panels = ['class', 'library', 'self-study'];
  const sections = [['tasks', 'Tasks'], ['language', 'Language input'], ['self-study', 'Self study']];
  const attempts = new Map();
  const expanded = new Set();
  const liveAnswers = new Map();
  const liveVersions = new Map();
  const liveSeenAt = new Map();
  const liveHydrated = new Set();

  let mounted, mountedKey = '';
  let guideVisible = true;
  let liveReady = false;
  let liveRole = null;
  let liveSession = null;

  let classIds;
  try { classIds = new Set(JSON.parse(sessionStorage.getItem('space-whale:class-topics')) || []); }
  catch (_) { classIds = new Set(); }

  function readRoute(search) {
    const params = new URLSearchParams(search);
    const hasCourseRoute = ['view', 'level', 'whale', 'lesson', 'exercise'].some(key => params.has(key));
    const normalizedSearch = hasCourseRoute ? search : '?view=library&level=A1.1&whale=1';
    const route = catalog.normalize(normalizedSearch);
    route.panel = panels.includes(params.get('panel')) ? params.get('panel') : 'library';
    route.section = sections.some(([id]) => id === params.get('section')) ? params.get('section') : 'tasks';
    if (route.panel === 'self-study') route.section = 'self-study';
    return route;
  }

  let route = readRoute(location.search);
  if (route.lesson) expanded.add(route.lesson);

  function query(next) {
    const params = new URLSearchParams(catalog.query(next));
    params.set('panel', next.panel || 'library');
    params.set('section', next.section || 'tasks');
    if (sessionId) params.set('session', sessionId);
    return `?${params}`;
  }

  function routeForExercise(exerciseId) {
    if (!exerciseId) return null;
    for (const lesson of catalog.lessons) {
      const stage = lesson.stages.find(item => item.exercise.id === exerciseId);
      if (!stage) continue;
      const location = lessonLocation(lesson);
      return readRoute(query({
        ...route,
        ...location,
        panel: 'class',
        lesson: lesson.id,
        section: stageSection(stage),
        exercise: exerciseId
      }));
    }
    return null;
  }

  async function syncTeacherNavigation() {
    if (!sessionId || !liveReady || liveRole !== 'teacher' || !classroom?.state?.channel) return;
    try {
      await classroom.navigate(route.exercise || null, query(route));
    } catch (error) {
      console.error('[Space Whale] Navigation sync failed', error);
      notice.textContent = 'Не удалось синхронизировать переход. Повторите действие.';
    }
  }

  function go(next, options = {}) {
    if (sessionId && liveReady && liveRole === 'student' && !options.remote) return;
    route = readRoute(query(next));
    if (route.lesson) expanded.add(route.lesson);
    history[options.remote ? 'replaceState' : 'pushState'](null, '', `classroom.html${query(route)}`);
    render();
    if (!options.remote) syncTeacherNavigation();
  }

  function node(tag, text, className) {
    const el = document.createElement(tag);
    if (text) el.textContent = text;
    if (className) el.className = className;
    return el;
  }

  function button(text, action, className) {
    const el = node('button', text, className); el.type = 'button';
    el.addEventListener('click', action); return el;
  }

  function link(text, next, active, className) {
    const el = node('a', text, className); el.href = `classroom.html${query(next)}`;
    if (active) el.setAttribute('aria-current', 'page');
    if (sessionId && liveReady && liveRole === 'student') el.setAttribute('aria-disabled', 'true');
    el.addEventListener('click', event => {
      if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault(); go(next);
    });
    return el;
  }

  function lessonLocation(lesson) {
    return lesson.id === 'templates'
      ? {view:'templates'}
      : {view:lesson.level === null ? 'unassigned' : 'library',level:lesson.level || route.level,whale:lesson.whale || route.whale};
  }

  function stageSection(stage) { return stage.section || 'tasks'; }
  function visibleStages(lesson, section) { return lesson.stages.filter(stage => stageSection(stage) === section); }
  function selectedLesson() { return catalog.topics(route).find(lesson => lesson.id === route.lesson); }

  function saveClass() {
    try { sessionStorage.setItem('space-whale:class-topics', JSON.stringify([...classIds])); }
    catch (_) { notice.textContent = 'Список Class сохранён только до обновления страницы.'; }
  }

  function toggleClass(lesson) {
    if (sessionId && liveReady && liveRole === 'student') return;
    if (classIds.has(lesson.id)) classIds.delete(lesson.id); else classIds.add(lesson.id);
    saveClass(); render();
  }

  function guide(stage) {
    const data = stage.guide || {};
    const entries = [['Aim', data.aim], ['TL', data.tl], ['Say', data.say || stage.exercise.instruction], ['Time', data.time]];
    const box = node('div', '', 'workspace-guide');
    entries.forEach(([label, value]) => {
      if (!value) return;
      const line = node('p'); line.append(node('strong', `${label}: `), node('span', String(value))); box.append(line);
    });
    return box;
  }

  function renderSidebar() {
    const sidebarScroll = tree.scrollTop;
    tree.replaceChildren();
    course.value = route.view === 'library' ? `${route.level}|${route.whale}` : route.view;

    const studentLocked = Boolean(sessionId && liveReady && liveRole === 'student');
    course.disabled = studentLocked;
    panels.forEach(panel => {
      const tab = document.getElementById(`${panel}Tab`);
      tab.setAttribute('aria-pressed', String(route.panel === panel));
      tab.disabled = studentLocked;
    });
    guideToggle.setAttribute('aria-pressed', String(guideVisible));

    const source = route.panel === 'class' ? catalog.lessons : catalog.topics(route);
    const topics = source.filter(lesson => {
      if (route.panel === 'class') {
        if (sessionId && liveReady) return classIds.has(lesson.id) || lesson.id === route.lesson;
        return classIds.has(lesson.id);
      }
      if (route.panel === 'self-study') return visibleStages(lesson, 'self-study').length;
      return true;
    });

    topics.forEach(lesson => {
      const current = route.lesson === lesson.id;
      const isTemplate = lesson.id === 'templates';
      const open = expanded.has(lesson.id);
      const section = route.panel === 'self-study' ? 'self-study' : current ? route.section : 'tasks';
      const card = node('section', '', 'workspace-topic');
      const heading = node('div', '', 'workspace-topic-heading');

      const toggle = button(lesson.title, () => {
        if (open) { expanded.delete(lesson.id); renderSidebar(); }
        else { expanded.add(lesson.id); go({ ...route, ...lessonLocation(lesson), lesson: lesson.id, exercise: '', section: 'tasks' }); }
      }, 'workspace-topic-toggle');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-controls', `topic-${lesson.id}`);
      heading.append(toggle);

      if (open && !isTemplate) {
        const add = button(classIds.has(lesson.id) ? 'Added ✓' : 'Add to class', () => toggleClass(lesson), 'workspace-add');
        add.disabled = studentLocked || !lesson.stages.length;
        add.setAttribute('aria-pressed', String(classIds.has(lesson.id)));
        add.title = lesson.stages.length ? 'Добавить или убрать тему из Class' : 'В теме ещё нет упражнений';
        heading.append(add);
      }

      card.append(heading);
      const body = node('div', '', 'workspace-topic-body'); body.id = `topic-${lesson.id}`; body.hidden = !open;

      if (open) {
        if (!isTemplate) {
          const tabs = node('div', '', 'workspace-topic-tabs'); tabs.setAttribute('role', 'group'); tabs.setAttribute('aria-label', 'Разделы темы');
          sections.forEach(([id, label]) => {
            const tab = button(label, () => {
              const first = visibleStages(lesson, id)[0];
              go({ ...route, ...lessonLocation(lesson), panel: route.panel === 'self-study' && id !== 'self-study' ? 'library' : route.panel, lesson: lesson.id, section: id, exercise: first?.exercise.id || '' });
            }, 'workspace-section-tab');
            tab.disabled = studentLocked;
            tab.setAttribute('aria-pressed', String(section === id)); tabs.append(tab);
          });
          body.append(tabs);
        }

        const stages = node('nav', '', 'workspace-stages'); stages.setAttribute('aria-label', `Задания: ${lesson.title}`);
        const available = isTemplate ? lesson.stages : visibleStages(lesson, section);
        available.forEach(stage => {
          const active = current && route.exercise === stage.exercise.id && route.section === section;
          const item = node('div', '', `workspace-stage${active ? ' is-active' : ''}`);
          const index = lesson.stages.indexOf(stage) + 1;
          item.append(link(isTemplate ? stage.menu : `Stage ${index}`, { ...route, ...lessonLocation(lesson), lesson: lesson.id, exercise: stage.exercise.id, section }, active, 'workspace-stage-link'));
          if (active && guideVisible) item.append(guide(stage));
          stages.append(item);
        });
        if (!available.length) stages.append(node('p', 'Материалы пока не добавлены.', 'workspace-muted'));
        body.append(stages);
      }

      card.append(body);
      if (!open) {
        const arrow = button('⌄', () => { expanded.add(lesson.id); go({ ...route, ...lessonLocation(lesson), lesson: lesson.id, exercise: '', section: 'tasks' }); }, 'workspace-topic-arrow');
        arrow.disabled = studentLocked;
        arrow.setAttribute('aria-label', `Раскрыть тему: ${lesson.title}`);
        arrow.setAttribute('aria-expanded', 'false');
        arrow.setAttribute('aria-controls', body.id);
        card.append(arrow);
      }
      tree.append(card);
    });

    if (!topics.length) {
      tree.append(node('p', route.panel === 'class' ? 'Добавьте тему через Add to class.' : route.panel === 'self-study' ? 'Самостоятельные задания пока не добавлены.' : 'Тем пока нет.', 'workspace-muted'));
    }

    const selected = selectedLesson();
    start.disabled = studentLocked || !selected?.stages.length || route.view === 'templates';
    tree.scrollTop = sidebarScroll;
  }

  function readAnswers(key, signature) {
    if (attempts.has(key)) return attempts.get(key);
    try {
      const saved = JSON.parse(sessionStorage.getItem(key));
      if (saved?.signature === signature && saved.answers && typeof saved.answers === 'object') return saved.answers;
    } catch (_) {}
    return {};
  }

  function storeAnswers(key, signature, answers) {
    attempts.set(key, answers);
    try { sessionStorage.setItem(key, JSON.stringify({ signature, answers })); }
    catch (_) { notice.textContent = 'Ответы сохраняются только до обновления страницы.'; }
  }

  function hasAnswers(value) {
    return value && typeof value === 'object' && Object.keys(value).length > 0;
  }

  function acceptLivePayload(payload, options = {}) {
    if (!payload?.exercise_id || !payload.response || liveRole !== 'teacher') return false;
    const exerciseId = payload.exercise_id;

    if (options.database && (Date.now() - (liveSeenAt.get(exerciseId) || 0)) < 2000) return false;

    if (payload.source_id && Number.isFinite(payload.seq)) {
      const versionKey = `${payload.source_id}:${exerciseId}`;
      const previous = liveVersions.get(versionKey) || 0;
      if (payload.seq <= previous) return false;
      liveVersions.set(versionKey, payload.seq);
    }

    if (!options.database) liveSeenAt.set(exerciseId, Date.now());
    liveAnswers.set(exerciseId, payload.response);

    if (route.exercise === exerciseId && mounted?.setAnswers) {
      mounted.setAnswers(payload.response);
    }
    return true;
  }

  async function hydrateLiveExercise(exerciseId, localAnswers) {
    if (!sessionId || !liveReady || !exerciseId || liveHydrated.has(exerciseId)) return;
    liveHydrated.add(exerciseId);

    if (liveRole === 'teacher') {
      try {
        const saved = await classroom.loadExerciseResponse(exerciseId);
        if (saved?.response) {
          acceptLivePayload({
            exercise_id: exerciseId,
            response: saved.response,
            student_id: saved.student_id,
            draft: Boolean(saved.is_draft)
          }, { database: true });
        }
      } catch (error) {
        console.error('[Space Whale] Could not restore live exercise response', error);
      }
      try { await classroom.requestExerciseState(exerciseId); }
      catch (error) { console.error('[Space Whale] Could not request peer state', error); }
    }

    if (liveRole === 'student' && hasAnswers(localAnswers)) {
      try { await classroom.sendExerciseSnapshot(exerciseId, localAnswers); }
      catch (error) { console.error('[Space Whale] Could not restore pending student state', error); }
    }
  }

  function renderContent() {
    const selected = selectedLesson();
    const stage = selected?.stages.find(stage => stage.exercise.id === route.exercise && stageSection(stage) === route.section);
    const visible = route.panel !== 'class' || Boolean(sessionId && liveReady) || classIds.has(selected?.id);
    const liveIdentity = sessionId ? `${sessionId}:${liveRole || 'connecting'}` : 'standalone';
    const key = stage && visible ? `${liveIdentity}:${selected.id}:${stage.exercise.id}` : `${liveIdentity}:${route.view}:${route.panel}:${route.lesson}:${route.section}:empty`;

    if (key === mountedKey) return;
    mounted?.destroy(); mounted = null; mountedKey = key;
    host.replaceChildren(); scroll.scrollTop = 0;

    if (!stage || !visible) {
      const empty = node('section', '', 'workspace-empty');
      empty.append(node('h1', selected?.title || 'Выберите тему'));
      empty.append(node('p', selected ? 'В этом разделе пока нет заданий.' : 'Откройте тему в библиотеке слева.'));
      host.append(empty); document.title = 'Space Whale — Learning Space'; return;
    }

    const exercise = stage.exercise;
    document.title = `${selected.title} — Space Whale`;
    const storageKey = sessionId
      ? `space-whale:workspace:live:v1:${sessionId}:${selected.id}:${exercise.id}`
      : `space-whale:workspace:v1:${selected.id}:${exercise.id}`;
    const signature = JSON.stringify(exercise);
    const localAnswers = readAnswers(storageKey, signature);
    const initialAnswers = sessionId && liveRole === 'teacher'
      ? (liveAnswers.get(exercise.id) || {})
      : localAnswers;

    mounted = kit.mount(host, exercise, {
      answers: initialAnswers,
      readOnly: false,
      onChange: answers => {
        storeAnswers(storageKey, signature, answers);
        if (sessionId && liveReady && liveRole === 'student') {
          classroom.sendExerciseDraft(exercise.id, answers)
            .catch(error => console.error('[Space Whale] Live answer sync failed', error));
        }
      }
    });

    hydrateLiveExercise(exercise.id, localAnswers);
  }

  function render() { renderSidebar(); renderContent(); }

  function applyRemoteNavigation(payload) {
    if (!sessionId || liveRole !== 'student') return;
    let next = null;
    if (payload?.current_page_id) next = readRoute(payload.current_page_id);
    if ((!next || !next.exercise) && payload?.current_exercise_id) next = routeForExercise(payload.current_exercise_id);
    if (next) go(next, { remote: true });
  }

  function renderPresence(presenceState) {
    if (!sessionId || !sessionHeading) return;
    const presences = Object.values(presenceState || {}).flat();
    const studentOnline = presences.some(item => item.role === 'student');
    const teacherOnline = presences.some(item => item.role === 'teacher');
    if (liveRole === 'teacher') sessionHeading.textContent = studentOnline ? 'Live lesson · ученик онлайн' : 'Live lesson · ждём ученика';
    else if (liveRole === 'student') sessionHeading.textContent = teacherOnline ? 'Live lesson · преподаватель онлайн' : 'Live lesson · ждём преподавателя';
    else sessionHeading.textContent = 'Live lesson · подключение…';
  }

  async function initLiveSession() {
    if (!sessionId) return;
    if (!classroom) throw new Error('Realtime classroom module is unavailable.');

    if (sessionHeading) sessionHeading.textContent = 'Live lesson · подключение…';

    const user = await classroom.getCurrentUser();
    if (!user) {
      const next = encodeURIComponent(`classroom.html${location.search}`);
      location.href = `login.html?next=${next}`;
      return;
    }

    const result = await classroom.connect(sessionId, {
      onNavigate: applyRemoteNavigation,
      onExerciseDraft: payload => acceptLivePayload(payload),
      onExerciseResponse: payload => acceptLivePayload(payload),
      onStateSnapshot: payload => acceptLivePayload(payload),
      onStateRequest: payload => {
        if (liveRole !== 'student' || payload?.exercise_id !== route.exercise || !mounted?.getAnswers) return;
        classroom.sendExerciseSnapshot(payload.exercise_id, mounted.getAnswers())
          .catch(error => console.error('[Space Whale] State snapshot failed', error));
      },
      onExerciseDatabaseChange: row => {
        if (!row?.exercise_id || !row?.response) return;
        acceptLivePayload({
          exercise_id: row.exercise_id,
          response: row.response,
          student_id: row.student_id,
          draft: Boolean(row.is_draft)
        }, { database: true });
      },
      onPresence: renderPresence,
      onJoin: () => renderPresence(classroom.state.channel?.presenceState?.() || {}),
      onLeave: () => renderPresence(classroom.state.channel?.presenceState?.() || {})
    });

    liveReady = true;
    liveRole = result.role;
    liveSession = result.session;

    if (!liveRole) throw new Error('This account is not a participant in the lesson session.');

    renderPresence(classroom.state.channel.presenceState());
    mountedKey = '';
    render();

    const shared = await classroom.loadSharedState(sessionId);
    if (shared?.current_page_id || shared?.current_exercise_id) {
      if (liveRole === 'student') applyRemoteNavigation(shared);
      else {
        const restored = shared.current_page_id
          ? readRoute(shared.current_page_id)
          : routeForExercise(shared.current_exercise_id);
        if (restored) {
          route = restored;
          if (route.lesson) expanded.add(route.lesson);
          history.replaceState(null, '', `classroom.html${query(route)}`);
          mountedKey = '';
          render();
        }
      }
    } else if (liveRole === 'teacher') {
      await syncTeacherNavigation();
    }

    if (route.exercise) hydrateLiveExercise(route.exercise, mounted?.getAnswers?.() || {});
  }

  catalog.levels.forEach(level => {
    const group = node('optgroup'); group.label = level.id;
    level.whales.forEach(whale => {
      const option = node('option', `${level.id} · ${whale.title}`); option.value = `${level.id}|${whale.id}`; group.append(option);
    });
    course.append(group);
  });

  const other = node('optgroup'); other.label = 'Другие материалы';
  [['unassigned', 'Уроки без Whale'], ['templates', 'Шаблоны упражнений']].forEach(([value, label]) => {
    const option = node('option', label); option.value = value; other.append(option);
  });
  course.append(other);

  course.addEventListener('change', () => {
    const [level, whale] = course.value.split('|');
    expanded.clear();
    go(whale
      ? { view: 'library', level, whale: Number(whale), panel: 'library', section: 'tasks' }
      : { ...route, view: level, panel: 'library', section: 'tasks', lesson: '', exercise: '' });
  });

  panels.forEach(panel => document.getElementById(`${panel}Tab`).addEventListener('click', () => {
    const selected = selectedLesson();
    const section = panel === 'self-study' ? 'self-study' : 'tasks';
    go({ ...route, panel, section, exercise: selected ? visibleStages(selected, section)[0]?.exercise.id || '' : '' });
  }));

  guideToggle.addEventListener('click', () => { guideVisible = !guideVisible; renderSidebar(); });

  start.addEventListener('click', () => {
    const selected = selectedLesson();
    if (!selected?.stages.length || (sessionId && liveReady && liveRole === 'student')) return;
    classIds.add(selected.id); saveClass();
    go({ ...route, panel: 'class', section: stageSection(selected.stages[0]), exercise: selected.stages[0].exercise.id });
  });

  window.addEventListener('popstate', () => {
    if (sessionId && liveReady && liveRole === 'student') {
      history.replaceState(null, '', `classroom.html${query(route)}`);
      return;
    }
    route = readRoute(location.search);
    if (route.lesson) expanded.add(route.lesson);
    render();
    syncTeacherNavigation();
  });

  history.replaceState(null, '', `classroom.html${query(route)}`);
  render();

  initLiveSession().catch(error => {
    console.error('[Space Whale] Live Workspace connection failed', error);
    notice.textContent = error.message;
    if (sessionHeading) sessionHeading.textContent = 'Live lesson · ошибка подключения';
  });
})();