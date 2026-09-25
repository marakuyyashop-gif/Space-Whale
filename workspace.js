(() => {
  'use strict';

  const kit = window.SpaceWhaleExerciseKit;
  const expand=(element,open,done)=>{if(kit.motion)kit.motion.expand(element,open,done);else{element.hidden=!open;done?.();}};
  const catalog = window.SpaceWhaleCatalog.createCatalog(window.SpaceWhaleContent || [], window.SpaceWhaleTemplates || []);
  const classroom = window.SpaceWhaleClassroom || null;
  const sessionId = new URLSearchParams(location.search).get('session');
  const guestToken = new URLSearchParams(location.search).get('guest');
  const liveMode = Boolean(sessionId || guestToken);

  const host = document.getElementById('workspaceExercise');
  const tree = document.getElementById('workspaceTopics');
  const notice = document.getElementById('workspaceNotice');
  const scroll = document.getElementById('workspaceScroll');
  const start = document.getElementById('startLesson');
  const sessionHeading = document.querySelector('.workspace-session-heading a');

  const sidebar=document.getElementById('workspaceSidebar');
  const sidebarToggle=document.getElementById('workspaceSidebarToggle');
  sidebarToggle?.addEventListener('click',()=>{
    const closed=sidebarToggle.getAttribute('aria-expanded')==='true';
    document.querySelector('.reference-app').classList.toggle('workspace-sidebar-closed',closed);
    sidebar.inert=closed;sidebarToggle.setAttribute('aria-expanded',String(!closed));
    sidebarToggle.setAttribute('aria-label',closed?'Открыть меню':'Свернуть меню');
  });
  document.querySelectorAll('[data-workspace-theme]').forEach(button=>button.addEventListener('click',()=>{
    document.body.dataset.theme=button.dataset.workspaceTheme;
    document.querySelectorAll('[data-workspace-theme]').forEach(control=>control.setAttribute('aria-pressed',String(control===button)));
  }));

  const panels = ['class', 'library'];
  const sections = [['tasks', 'Tasks'], ['language', 'Language input'], ['self-study', 'Self study']];
  const attempts = new Map();
  const expanded = new Set();
  const liveAnswers = new Map();
  const liveVersions = new Map();
  const liveSeenAt = new Map();
  const liveHydrated = new Set();
  const replicas = new Map();
  const replica = id => {
    if (!replicas.has(id)) replicas.set(id, window.SpaceWhaleCollaboration.create(classroom.state.clientId));
    return replicas.get(id);
  };
  const collaborative = () => Boolean(guestToken && window.SpaceWhaleCollaboration);
  let mountedStorage = null;

  let mounted, mountedKey = '';
  let liveReady = false;
  let liveRole = null;
  let liveSession = null;
  let guestAllowedLessons = null;

  const classScope = sessionId || (guestToken ? `guest:${guestToken.slice(0,12)}` : 'standalone');
  const topicsKey = liveMode ? `space-whale:class-topics:${classScope}` : 'space-whale:class-topics';
  let classIds;
  try { classIds = new Set(JSON.parse(sessionStorage.getItem(topicsKey)) || []); }
  catch (_) { classIds = new Set(); }

  function readRoute(search) {
    const params = new URLSearchParams(search);
    const hasCourseRoute = ['view', 'level', 'whale', 'lesson', 'exercise'].some(key => params.has(key));
    const normalizedSearch = hasCourseRoute ? search : '?view=library&level=A1.1&whale=1';
    const route = catalog.normalize(normalizedSearch);
    route.panel = panels.includes(params.get('panel')) ? params.get('panel') : params.get('panel') === 'self-study' ? 'class' : 'library';
    route.section = sections.some(([id]) => id === params.get('section')) ? params.get('section') : 'tasks';
    if (params.get('panel') === 'self-study') route.section = 'self-study';
    const selected=catalog.topics(route).find(lesson=>lesson.id===route.lesson)?.stages.find(stage=>stage.exercise.id===route.exercise);
    if(selected)route.section=stageSection(selected);
    return route;
  }

  let route = readRoute(location.search);
  if (route.lesson) expanded.add(route.lesson);

  function query(next) {
    const params = new URLSearchParams(catalog.query(next));
    params.set('panel', next.panel || 'library');
    params.set('section', next.section || 'tasks');
    if (sessionId) params.set('session', sessionId);
    if (guestToken) params.set('guest', guestToken);
    params.set('class_whales',[...classWhales].join(','));
    params.set('class_loose',[...classIds].filter(id=>catalog.lessons.some(l=>l.id===id&&l.level===null)).join(','));
    return `?${params}`;
  }

  function routeForExercise(exerciseId) {
    if (!exerciseId) return null;
    for (const lesson of catalog.lessons) {
      if (guestAllowedLessons && !guestAllowedLessons.has(lesson.id)) continue;
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
    if (!liveMode || !liveReady || liveRole !== 'teacher' || !classroom?.state?.channel) return;
    try {
      await classroom.navigate(route.exercise || null, query(route));
    } catch (error) {
      console.error('[Space Whale] Navigation sync failed', error);
      notice.textContent = 'Не удалось синхронизировать переход. Повторите действие.';
    }
  }

  function go(next, options = {}) {
    if (liveMode && liveReady && liveRole === 'student' && !options.remote) return;
    route = readRoute(query(next));
    if (route.lesson) expanded.add(route.lesson);
    openLevels.add(route.level);openWhales.add(whaleKey(route.level,route.whale));
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
    if (liveMode && liveReady && liveRole === 'student') el.setAttribute('aria-disabled', 'true');
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
  function selectedLesson() {
    const lesson = catalog.topics(route).find(item => item.id === route.lesson);
    if (guestAllowedLessons && lesson && !guestAllowedLessons.has(lesson.id)) return null;
    return lesson;
  }

  function saveClass() {
    try { sessionStorage.setItem(topicsKey, JSON.stringify([...classIds])); }
    catch (_) { notice.textContent = 'Список Class сохранён только до обновления страницы.'; }
  }

  const whaleKey = (level, whale) => `${level}|${whale}`;
  let classWhales;
  const classKey = `space-whale:class-whales:${classScope}`;
  try { classWhales = new Set(JSON.parse(sessionStorage.getItem(classKey)) || []); } catch (_) { classWhales = new Set(); }
  if (!liveMode) catalog.lessons.forEach(lesson => { if(classIds.has(lesson.id) && lesson.level) classWhales.add(whaleKey(lesson.level,lesson.whale)); });
  function restoreClassSelection(search) {
    const params=new URLSearchParams(search);
    if(params.has('class_whales')) {
      const valid=new Set(catalog.levels.flatMap(level=>level.whales.map(whale=>whaleKey(level.id,whale.id))));
      classWhales=new Set(params.get('class_whales').split(',').filter(key=>valid.has(key)));
      classIds=new Set(catalog.lessons.filter(lesson=>classWhales.has(whaleKey(lesson.level,lesson.whale))).map(lesson=>lesson.id));
      (params.get('class_loose')||'').split(',').forEach(id=>{if(catalog.lessons.some(l=>l.id===id&&l.level===null))classIds.add(id);});
      saveWhales();
    }
  }
  restoreClassSelection(location.search);
  const openLevels = new Set([route.level]);
  const openWhales = new Set([whaleKey(route.level,route.whale)]);
  const locked = () => Boolean(liveMode && liveReady && liveRole === 'student');
  const permitted = lesson => !guestAllowedLessons || guestAllowedLessons.has(lesson.id);
  function hasClassLesson(lesson) { return Boolean(lesson && (classIds.has(lesson.id) || classWhales.has(whaleKey(lesson.level,lesson.whale)))); }
  function saveWhales() { try { sessionStorage.setItem(classKey,JSON.stringify([...classWhales])); } catch (_) {} saveClass(); }
  function toggleWhale(level, whale) {
    if (locked()) return;
    const key=whaleKey(level,whale), remove=classWhales.has(key);
    const topics=catalog.topics({view:'library',level,whale}).filter(permitted);
    if(remove) {classWhales.delete(key);topics.forEach(lesson=>classIds.delete(lesson.id));}
    else {classWhales.add(key);topics.forEach(lesson=>classIds.add(lesson.id));openWhales.add(key);}
    saveWhales();history.replaceState(null,'',`classroom.html${query(route)}`);
    if(remove&&route.panel==='class'&&route.level===level&&route.whale===whale){go({...route,lesson:'',exercise:''});}else {render();syncTeacherNavigation();}
  }
  function toggleClass(lesson) {
    if (locked()) return;
    if (classIds.has(lesson.id)) classIds.delete(lesson.id); else classIds.add(lesson.id);
    saveClass();history.replaceState(null,'',`classroom.html${query(route)}`);render();syncTeacherNavigation();
  }

  function lessonInfo(lesson) {
    const rows=[];
    const value=text=>Array.isArray(text)?text.join(' · '):typeof text==='string'?text:'';
    const add=(label,text)=>{const copy=value(text);if(copy)rows.push([label,copy]);};
    add('Цель',lesson.goal || lesson.summary || lesson.description);
    add('Grammar',lesson.grammar);add('Lexis',lesson.lexis);add('Words',lesson.words);
    if(!lesson.lexis){
      const phrases=[...new Set(lesson.stages.flatMap(stage=>String(stage.guide?.tl||'').split(/;|\n/)).map(text=>text.trim()).filter(Boolean))];
      if(phrases.length)add('Фразы',phrases.slice(0,8).join(' · ')+(phrases.length>8?' …':''));
    }
    if(!rows.length && lesson.stages.length)add('Содержание',lesson.stages.slice(0,4).map(stage=>(stage.menu||stage.title||stage.exercise.title).replace(/^\s*\d+\s*[.·]\s*/, '')).join(' · ')+(lesson.stages.length>4?' …':''));
    return rows;
  }
  let dismissSidebarOverlays=()=>{};
  function showLessonInfo(control,lesson){
    openLessonPopover?.(control,lesson);
  }
  let openLessonPopover=null, openSidebarPicker=null;

  function foldControl(label, content, open, change, className) {
    const control=button(label,()=>{
      const next=control.getAttribute('aria-expanded')!=='true';
      control.setAttribute('aria-expanded',String(next));
      change(next);expand(content,next);
    },className);
    control.setAttribute('aria-expanded',String(open));
    control.setAttribute('aria-controls',content.id);content.hidden=!open;
    return control;
  }
  function renderTopic(lesson,parent,studentLocked,previouslyOpen,index=0) {
    const current=route.lesson===lesson.id, open=current&&expanded.has(lesson.id), isTemplate=lesson.id==='templates';
    const card=node('section','',`workspace-topic${current?' is-current':''}`);
    card.setAttribute('data-tone',String(Math.min(index,7)));
    const heading=node('div','','workspace-topic-heading');
    const body=node('div','','workspace-topic-body');body.id=`topic-${lesson.id}`;body.hidden=!open;
    const toggle=button(lesson.title,()=>{
      if(toggle.getAttribute('aria-expanded')==='true') {
        expanded.delete(lesson.id);toggle.setAttribute('aria-expanded','false');expand(body,false);
      } else {expanded.clear();expanded.add(lesson.id);go({...route,...lessonLocation(lesson),lesson:lesson.id,exercise:current?route.exercise:'',section:'tasks'});}
    },'workspace-topic-toggle');
    toggle.setAttribute('data-stage-label',isTemplate?'TEMPLATES':`STAGE ${String(index+1).padStart(2,'0')}`);
    toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-controls',body.id);toggle.disabled=studentLocked;
    heading.append(toggle);card.append(heading);
    if(!isTemplate){
      const info=button('?',()=>showLessonInfo(info,lesson),'workspace-lesson-info');
      info.setAttribute('aria-label',`Об уроке: ${lesson.title}`);info.setAttribute('aria-haspopup','dialog');info.setAttribute('aria-expanded','false');info.setAttribute('aria-controls','workspaceLessonInfo');heading.append(info);
    }
    if(lesson.level===null && !guestToken) {
      const add=button(classIds.has(lesson.id)?'−':'+',()=>toggleClass(lesson),'workspace-add');add.setAttribute('aria-label',`${classIds.has(lesson.id)?'Убрать из класса':'Добавить в класс'}: ${lesson.title}`);add.disabled=studentLocked;heading.append(add);
    }
    if(open) {
      const description=lesson.goal||lesson.summary||lesson.description;
      if(typeof description==='string'&&description)body.append(node('p',description,'workspace-topic-summary'));
      const stages=node('nav','','workspace-stages');stages.setAttribute('aria-label',`Задания: ${lesson.title}`);
      const available=lesson.stages;
      if(available.length)body.append(node('p','MILESTONES','workspace-milestone-caption'));
      const activeIndex=current?available.findIndex(stage=>stage.exercise.id===route.exercise):-1;
      available.forEach((stage,index)=>{
        const section=stageSection(stage), active=current&&route.exercise===stage.exercise.id;
        const item=node('div','',`workspace-stage${active?' is-active':activeIndex>index?' is-before':''}`);
        const title=(stage.menu||stage.title||stage.exercise.title||`Milestone ${index+1}`).replace(/^\s*\d+\s*[.·]\s*/,'');
        const stageLink=link(title,{...route,...lessonLocation(lesson),lesson:lesson.id,exercise:stage.exercise.id,section},active,'workspace-stage-link');stageLink.setAttribute('data-step',String(index+1).padStart(2,'0'));item.append(stageLink);stages.append(item);
      });
      if(!available.length)stages.append(node('p','Материалы пока не добавлены.','workspace-muted'));
      body.append(stages);
    }
    card.append(body);parent.append(card);
    if(open&&!previouslyOpen.has(body.id)){body.hidden=true;expand(body,true);}
  }
  function availableWhales(level) {
    return level.whales.filter(whale=>{
      const topics=catalog.topics({view:'library',level:level.id,whale:whale.id});
      if(guestAllowedLessons&&!topics.some(permitted))return false;
      return route.panel!=='class'||classWhales.has(whaleKey(level.id,whale.id))||topics.some(lesson=>hasClassLesson(lesson)||(liveMode&&liveReady&&(lesson.id===route.lesson||Boolean(guestAllowedLessons))));
    });
  }
  function chooseCollection(next) {
    const lessons=catalog.topics(next).filter(permitted).filter(lesson=>next.panel!=='class'||hasClassLesson(lesson)||guestAllowedLessons);
    expanded.clear();tree.scrollTop=0;
    go({...next,lesson:lessons[0]?.id||'',exercise:'',section:'tasks'});
  }
  function renderSidebar() {
    dismissSidebarOverlays();
    const sidebarScroll=tree.scrollTop;
    const previouslyOpen=new Set([...tree.querySelectorAll('.workspace-topic-body:not([hidden])')].map(body=>body.id));
    tree.replaceChildren();
    const controls=document.getElementById('workspaceCourseControls');controls.replaceChildren();
    const studentLocked=locked(),inClass=route.panel==='class';
    panels.forEach(panel=>document.getElementById(`${panel}Tab`).setAttribute('aria-pressed',String(route.panel===panel)));
    document.getElementById('workspaceClockPanel').hidden=false;
    start.disabled=studentLocked;document.getElementById('workspaceTimerReset').disabled=studentLocked;
    const levels=catalog.levels.filter(level=>availableWhales(level).length);
    const level=levels.find(level=>level.id===route.level)||levels[0];
    const whales=level?availableWhales(level):[];
    const whale=whales.find(whale=>whale.id===route.whale)||whales[0];
    const loose=catalog.lessons.filter(lesson=>lesson.level===null&&permitted(lesson)&&(!inClass||hasClassLesson(lesson)||(liveMode&&liveReady&&(lesson.id===route.lesson||Boolean(guestAllowedLessons)))));
    const view=route.view==='templates'&&!inClass&&!guestAllowedLessons?'templates':(route.view==='unassigned'&&loose.length)||(!level&&loose.length)?'unassigned':'library';
    const pickerButton=(label,name,options,className)=>{
      const control=button(label,()=>openSidebarPicker?.(control,name,options),className);
      control.disabled=studentLocked||!options.length;control.setAttribute('aria-label',name);control.setAttribute('aria-haspopup','dialog');control.setAttribute('aria-expanded','false');control.setAttribute('aria-controls','workspaceLessonInfo');return control;
    };
    const levelOptions=levels.map(level=>({label:level.id,selected:view==='library'&&level.id===(levels.find(item=>item.id===route.level)||levels[0])?.id,action:()=>chooseCollection({...route,view:'library',level:level.id,whale:availableWhales(level)[0].id})}));
    if(loose.length)levelOptions.push({label:'Отдельные уроки',selected:view==='unassigned',action:()=>chooseCollection({...route,view:'unassigned'})});
    if(!inClass&&!guestAllowedLessons)levelOptions.push({label:'Шаблоны упражнений',selected:view==='templates',action:()=>chooseCollection({...route,view:'templates'})},{label:'Управление материалами',href:'library-manage.html'});
    controls.append(pickerButton(view==='templates'?'TPL':view==='unassigned'?'STAGES':level?.id||route.level,'Выбрать уровень',levelOptions,'workspace-course-key workspace-level-key'));
    if(view==='library'){
      controls.append(pickerButton(whale?`W ${whale.id}`:'W','Выбрать Whale',whales.map(item=>({label:item.title,selected:item.id===whale?.id,action:()=>chooseCollection({...route,view:'library',level:level.id,whale:item.id})})),'workspace-course-key workspace-whale-key'));
      if(whale&&!guestAllowedLessons){
        const chosen=classWhales.has(whaleKey(level.id,whale.id));
        const add=button(chosen?'−':'+',()=>toggleWhale(level.id,whale.id),'workspace-icon workspace-collection-add');
        add.setAttribute('aria-label',`${chosen?'Убрать из класса':'Добавить в класс'}: ${level.id} · ${whale.title}`);add.setAttribute('data-tooltip',chosen?'Убрать Whale из класса':'Добавить весь Whale в класс');add.disabled=studentLocked;controls.append(add);
      }
    }
    const topics=view==='templates'?catalog.topics({view:'templates'}):view==='unassigned'?loose:whale?catalog.topics({view:'library',level:level.id,whale:whale.id}).filter(permitted):[];
    topics.forEach((lesson,index)=>renderTopic(lesson,tree,studentLocked,previouslyOpen,index));
    if(!topics.length)tree.append(node('p',inClass?'Добавьте Whale из библиотеки.':'Материалы пока не добавлены.','workspace-muted'));
    tree.scrollTop=sidebarScroll;
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
    if (!payload?.exercise_id || !payload.response || (liveRole !== 'teacher' && !collaborative())) return false;
    const exerciseId = payload.exercise_id;

    if (!collaborative() && options.database && (Date.now() - (liveSeenAt.get(exerciseId) || 0)) < 2000) return false;

    if (payload.source_id && Number.isFinite(payload.seq)) {
      const versionKey = `${payload.source_id}:${exerciseId}`;
      const previous = liveVersions.get(versionKey) || 0;
      if (payload.seq <= previous) return false;
      liveVersions.set(versionKey, payload.seq);
    }

    if (!options.database) liveSeenAt.set(exerciseId, Date.now());
    let response = payload.response;
    if (collaborative()) {
      const r = replica(exerciseId);
      if (response.__sw_collab === 1) r.merge(response);
      else if (!Object.keys(r.snapshot().entries).length) r.update(response);
      response = r.answers();
      if (!options.database) classroom.queueGuestSnapshot?.(exerciseId, r.snapshot());
    }
    liveAnswers.set(exerciseId, response);

    if (route.exercise === exerciseId && mounted?.setAnswers) {
      mounted.setAnswers(response);
      if (mountedStorage) storeAnswers(mountedStorage.key, mountedStorage.signature, collaborative() ? replica(exerciseId).snapshot() : response);
    }
    return true;
  }

  async function hydrateLiveExercise(exerciseId, localAnswers) {
    if (!liveMode || !liveReady || !exerciseId || liveHydrated.has(exerciseId)) return;
    liveHydrated.add(exerciseId);

    if (liveRole === 'teacher' || collaborative()) {
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
      if (collaborative()) {
        classroom.queueGuestSnapshot?.(exerciseId,replica(exerciseId).snapshot());
        await classroom.sendExerciseSnapshot(exerciseId,replica(exerciseId).snapshot());
      }
      try { await classroom.requestExerciseState(exerciseId); }
      catch (error) { console.error('[Space Whale] Could not request peer state', error); }
    }

    if (liveRole === 'student' && !collaborative() && hasAnswers(localAnswers)) {
      try { await classroom.sendExerciseSnapshot(exerciseId, localAnswers); }
      catch (error) { console.error('[Space Whale] Could not restore pending student state', error); }
    }
  }

  function renderContent() {
    const selected = selectedLesson();
    const stage = selected?.stages.find(stage => stage.exercise.id === route.exercise && stageSection(stage) === route.section);
    const allowedSelected = !selected || !guestAllowedLessons || guestAllowedLessons.has(selected.id);
    const visible = allowedSelected && (route.panel !== 'class' || Boolean(liveMode && liveReady) || hasClassLesson(selected));
    const liveIdentity = sessionId
      ? `${sessionId}:${liveRole || 'connecting'}`
      : guestToken
        ? `guest:${guestToken.slice(0, 8)}:${liveRole || 'connecting'}`
        : 'standalone';
    const key = stage && visible ? `${liveIdentity}:${selected.id}:${stage.exercise.id}` : `${liveIdentity}:${route.view}:${route.panel}:${route.lesson}:${route.section}:empty`;

    if (key === mountedKey) return;
    mounted?.destroy(); mounted = null; mountedKey = key;
    host.replaceChildren(); scroll.scrollTop = 0;

    if (!stage || !visible) {
      const empty = node('section', '', 'workspace-empty');
      empty.append(node('h1', selected?.title || (liveRole === 'student' ? 'Ждём преподавателя' : 'Выберите тему')));
      empty.append(node('p', selected ? 'В этом разделе пока нет заданий.' : (liveRole === 'student' ? 'Задание появится, когда преподаватель откроет его.' : 'Откройте тему в библиотеке слева.')));
      host.append(empty); document.title = 'Space Whale — Learning Space'; return;
    }

    const exercise = stage.exercise;
    document.title = `${selected.title} — Space Whale`;
    const storageKey = sessionId
      ? `space-whale:workspace:live:v1:${sessionId}:${selected.id}:${exercise.id}`
      : guestToken
        ? `space-whale:workspace:guest:v1:${guestToken.slice(0, 12)}:${selected.id}:${exercise.id}`
        : `space-whale:workspace:v1:${selected.id}:${exercise.id}`;
    const signature = JSON.stringify(exercise);
    const localAnswers = readAnswers(storageKey, signature);
    mountedStorage = {key:storageKey, signature};
    if (collaborative()) {
      const r=replica(exercise.id);
      if (localAnswers.__sw_collab === 1) r.merge(localAnswers);
      liveAnswers.set(exercise.id,r.answers());
    }
    const initialAnswers = liveMode && (liveRole === 'teacher' || collaborative())
      ? (liveAnswers.get(exercise.id) || {})
      : localAnswers;

    mounted = kit.mount(host, exercise, {
      answers: initialAnswers,
      syncChecks: collaborative(),
      readOnly: false,
      onChange: answers => {
        const response = collaborative() ? replica(exercise.id).update(answers) : answers;
        liveAnswers.set(exercise.id, answers);
        liveSeenAt.set(exercise.id, Date.now());
        storeAnswers(storageKey, signature, response);
        if (liveMode && liveReady && (liveRole === 'student' || collaborative())) {
          classroom.sendExerciseDraft(exercise.id, response)
            .catch(error => { console.error('[Space Whale] Live answer sync failed', error); notice.textContent='Связь прервана. Ответы сохранены на этом устройстве; дождитесь подключения.'; });
        }
      }
    });

    hydrateLiveExercise(exercise.id, localAnswers);
  }

  function render() { renderSidebar(); renderContent(); }

  function applyRemoteNavigation(payload) {
    if (!liveMode || liveRole !== 'student') return;
    let next = null;
    if (payload?.current_page_id) {restoreClassSelection(payload.current_page_id);next = readRoute(payload.current_page_id);}
    if ((!next || !next.exercise) && payload?.current_exercise_id) next = routeForExercise(payload.current_exercise_id);
    if (next) go(next, { remote: true });
  }

  function renderPresence(presenceState) {
    if (!liveMode || !sessionHeading) return;
    const presences = Object.values(presenceState || {}).flat();
    const studentOnline = presences.some(item => item.role === 'student');
    const teacherOnline = presences.some(item => item.role === 'teacher');
    if (liveRole === 'teacher') sessionHeading.textContent = studentOnline ? 'Live lesson · ученик онлайн' : 'Live lesson · ждём ученика';
    else if (liveRole === 'student') sessionHeading.textContent = teacherOnline ? 'Live lesson · преподаватель онлайн' : 'Live lesson · ждём преподавателя';
    else sessionHeading.textContent = 'Live lesson · подключение…';
  }

  async function initLiveSession() {
    if (!liveMode) return;
    if (!classroom) throw new Error('Realtime classroom module is unavailable.');

    if (sessionHeading) sessionHeading.textContent = guestToken ? 'Guest lesson · подключение…' : 'Live lesson · подключение…';

    if (!guestToken) {
      const user = await classroom.getCurrentUser();
      if (!user) {
        const next = encodeURIComponent(`classroom.html${location.search}`);
        location.href = `login.html?next=${next}`;
        return;
      }
    }

    const handlers = {
      onReconnect: async () => {
        liveHydrated.clear();
        const shared=await classroom.loadSharedState(sessionId);
        if (liveRole==='student' && shared) applyRemoteNavigation(shared);
        if (route.exercise) {
          await hydrateLiveExercise(route.exercise, {});
          if (collaborative()) await classroom.sendExerciseDraft(route.exercise, replica(route.exercise).snapshot());
        }
      },
      onNavigate: applyRemoteNavigation,
      onExerciseDraft: payload => acceptLivePayload(payload),
      onExerciseResponse: payload => acceptLivePayload(payload),
      onStateSnapshot: payload => acceptLivePayload(payload),
      onStateRequest: payload => {
        if ((!collaborative() && liveRole !== 'student') || payload?.exercise_id !== route.exercise || !mounted?.getAnswers) return;
        classroom.sendExerciseSnapshot(payload.exercise_id, collaborative() ? replica(payload.exercise_id).snapshot() : mounted.getAnswers())
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
    };

    const result = guestToken
      ? await classroom.connectGuest(guestToken, handlers)
      : await classroom.connect(sessionId, handlers);

    liveReady = true;
    liveRole = result.role;
    liveSession = result.session;
    const inviteButton=document.getElementById('inviteStudent');
    if (inviteButton) { inviteButton.hidden=liveRole!=='teacher';inviteButton.setAttribute('aria-label','Ссылка для ученика');inviteButton.setAttribute('data-tooltip','Ссылка для ученика'); }
    guestAllowedLessons = guestToken && !result.session.allowed_lesson_ids?.includes('*') ? new Set(result.session.allowed_lesson_ids || []) : null;

    if (!liveRole) throw new Error('This account is not a participant in the lesson session.');

    if (guestAllowedLessons && (!route.lesson || !guestAllowedLessons.has(route.lesson))) {
      const firstLessonId = [...guestAllowedLessons][0];
      const firstLesson = catalog.lessons.find(item => item.id === firstLessonId);
      if (firstLesson) {
        const firstStage = visibleStages(firstLesson, 'tasks')[0];
        route = readRoute(query({
          ...route,
          ...lessonLocation(firstLesson),
          panel: 'library',
          lesson: firstLesson.id,
          section: 'tasks',
          exercise: firstStage?.exercise.id || ''
        }));
        expanded.clear();
        expanded.add(firstLesson.id);
      }
    }

    renderPresence(classroom.state.channel.presenceState());
    mountedKey = '';
    render();

    const shared = await classroom.loadSharedState(sessionId);
    if (shared?.current_page_id || shared?.current_exercise_id) {
      if (liveRole === 'student') applyRemoteNavigation(shared);
      else {
        if(shared.current_page_id)restoreClassSelection(shared.current_page_id);
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

  panels.forEach(panel => document.getElementById(`${panel}Tab`).addEventListener('click', () => {
    // Browsing the catalog never broadcasts navigation or changes the active task.
    route={...route,panel};history.replaceState(null,'',`classroom.html${query(route)}`);render();
  }));


  // One local lesson clock survives exercise changes and page reloads. Account duration can be connected here later.
  const timerKey=`space-whale:clock:${classScope}`, duration=60*60*1000;
  let timer={elapsed:0,startedAt:null},ticker=null;
  try {const saved=JSON.parse(sessionStorage.getItem(timerKey));if(saved&&Number.isFinite(saved.elapsed)&&saved.elapsed>=0&&(saved.startedAt===null||Number.isFinite(saved.startedAt)))timer=saved;}catch(_){}
  function saveTimer(){try{sessionStorage.setItem(timerKey,JSON.stringify(timer));}catch(_){}}
  function elapsed(){return Math.min(duration,Math.max(0,timer.elapsed+(timer.startedAt===null?0:Date.now()-timer.startedAt)));}
  function paintTimer(){
    const spent=elapsed(),remaining=Math.ceil((duration-spent)/1000);
    if(spent>=duration&&timer.startedAt!==null){timer={elapsed:duration,startedAt:null};saveTimer();document.getElementById('workspaceTimerStatus').textContent='Время занятия истекло.';}
    const running=timer.startedAt!==null;
    document.getElementById('workspaceClockTime').textContent=`${String(Math.floor(remaining/60)).padStart(2,'0')}:${String(remaining%60).padStart(2,'0')}`;
    document.getElementById('workspaceClockProgress').setAttribute('stroke-dashoffset',String(100-spent/duration*100));
    const clock=document.getElementById('workspaceClock');clock.setAttribute('aria-valuenow',String(spent/60000));clock.setAttribute('aria-valuetext',`${Math.floor(remaining/60)} мин. ${remaining%60} сек. осталось`);
    const label=running?'Pause Lesson':spent>0&&spent<duration?'Resume Lesson':'Start Lesson';
    start.setAttribute('aria-pressed',String(running));start.setAttribute('aria-label',label);start.setAttribute('data-tooltip',label);
    if(!running&&ticker!==null){window.clearInterval(ticker);ticker=null;}
  }
  function tick(){paintTimer();if(timer.startedAt!==null&&ticker===null)ticker=window.setInterval(paintTimer,1000);}
  start.addEventListener('click',()=>{
    if(locked())return;
    if(timer.startedAt!==null)timer={elapsed:elapsed(),startedAt:null};
    else timer={elapsed:elapsed()>=duration?0:elapsed(),startedAt:Date.now()};
    saveTimer();tick();
    route={...route,panel:'class'};history.replaceState(null,'',`classroom.html${query(route)}`);render();
  });
  document.getElementById('workspaceTimerReset').addEventListener('click',()=>{if(locked())return;timer={elapsed:0,startedAt:null};saveTimer();paintTimer();document.getElementById('workspaceTimerStatus').textContent='Таймер сброшен.';});
  tick();

  window.addEventListener('popstate', () => {
    if (liveMode && liveReady && liveRole === 'student') {
      history.replaceState(null, '', `classroom.html${query(route)}`);
      return;
    }
    restoreClassSelection(location.search);route = readRoute(location.search);
    openLevels.add(route.level);openWhales.add(whaleKey(route.level,route.whale));
    if (route.lesson) expanded.add(route.lesson);
    render();
    syncTeacherNavigation();
  });

  const invite = document.getElementById('inviteStudent');
  if (invite) {
    invite.hidden = Boolean(sessionId);
    invite.addEventListener('click', async () => {
      invite.disabled=true;
      try {
        if (!guestToken) {
          if (!await classroom.getCurrentUser()) { location.href='login.html?next='+encodeURIComponent('classroom.html'); return; }
          const result=await window.spaceWhaleSupabase.rpc('create_guest_workspace');
          if (result.error) throw result.error;
          location.href='classroom.html?guest='+encodeURIComponent(result.data.token);
          return;
        }
        const url=new URL('classroom.html',location.href);url.searchParams.set('guest',guestToken);
        const field=document.getElementById('guestInviteLink');field.value=url.href;field.hidden=false;
        try { await navigator.clipboard.writeText(url.href); notice.textContent='Ссылка скопирована. Отправь её ученице — регистрация ей не нужна.'; }
        catch { field.focus();field.select();notice.textContent='Скопируй ссылку из поля и отправь ученице.'; }
      } catch(error) {notice.textContent=error.message || 'Не удалось создать занятие.';}
      finally {invite.disabled=false;}
    });
  }
  function setupSidebarOverlays(){
    if(!document.body?.append || !document.addEventListener)return;
    const tooltip=node('div','','workspace-floating workspace-control-tooltip');tooltip.id='workspaceControlTooltip';tooltip.setAttribute('role','tooltip');
    const popover=node('section','','workspace-floating workspace-lesson-popover');popover.id='workspaceLessonInfo';popover.setAttribute('role','dialog');popover.setAttribute('aria-labelledby','workspaceLessonInfoTitle');
    [tooltip,popover].forEach(el=>{el.setAttribute('popover','manual');el.hidden=true;document.body.append(el);});
    let tooltipOwner=null,infoOwner=null;
    const hide=el=>{if(el.hidePopover&&el.matches(':popover-open'))el.hidePopover();el.hidden=true;};
    const place=(el,owner)=>{
      const rect=owner.getBoundingClientRect(),box=el.getBoundingClientRect(),margin=12;
      const width=window.innerWidth,height=window.innerHeight;
      const beside=el===popover&&rect.right+box.width+margin*2<width;
      const left=beside?rect.right+10:Math.min(width-box.width-margin,Math.max(margin,rect.left));
      let top=beside?rect.top:rect.bottom+10;
      if(top+box.height>height-margin)top=rect.top-box.height-10;
      el.style.left=`${Math.max(margin,left)}px`;el.style.top=`${Math.max(margin,Math.min(top,height-box.height-margin))}px`;
    };
    const show=(el,owner)=>{el.hidden=false;if(el.showPopover&&!el.matches(':popover-open'))el.showPopover();place(el,owner);};
    const closeTooltip=()=>{if(tooltipOwner)tooltipOwner.removeAttribute('aria-describedby');tooltipOwner=null;hide(tooltip);};
    const closeInfo=(restore=false)=>{const owner=infoOwner;if(owner)owner.setAttribute('aria-expanded','false');infoOwner=null;hide(popover);if(restore&&owner?.isConnected)owner.focus();};
    dismissSidebarOverlays=()=>{closeTooltip();closeInfo();};
    openLessonPopover=(owner,lesson)=>{
      if(infoOwner===owner){closeInfo();return;}closeInfo();closeTooltip();infoOwner=owner;
      const header=node('div','','workspace-popover-heading');const title=node('h3',lesson.title);title.id='workspaceLessonInfoTitle';
      const close=button('×',()=>closeInfo(true),'workspace-popover-close');close.setAttribute('aria-label','Закрыть информацию об уроке');header.append(title,close);popover.replaceChildren(header);
      const meta=[lesson.level,lesson.whale?`Whale ${lesson.whale}`:'',lesson.stages.length?`${lesson.stages.length} milestones`:''].filter(Boolean).join(' · ');if(meta)popover.append(node('p',meta,'workspace-popover-meta'));
      lessonInfo(lesson).forEach(([label,text])=>{const row=node('p','','workspace-popover-row');row.append(node('strong',label),node('span',text));popover.append(row);});
      owner.setAttribute('aria-expanded','true');show(popover,owner);close.focus();
    };
    openSidebarPicker=(owner,title,options)=>{
      if(infoOwner===owner){closeInfo();return;}closeInfo();closeTooltip();infoOwner=owner;
      const header=node('div','','workspace-popover-heading');const heading=node('h3',title);heading.id='workspaceLessonInfoTitle';
      const close=button('×',()=>closeInfo(true),'workspace-popover-close');close.setAttribute('aria-label','Закрыть выбор');header.append(heading,close);popover.replaceChildren(header);
      const list=node('div','','workspace-picker-options');
      options.forEach(option=>{
        const control=option.href?node('a',option.label,'workspace-picker-option'):button(option.label,()=>{closeInfo();option.action();},'workspace-picker-option');
        if(option.href)control.href=option.href;else control.setAttribute('aria-pressed',String(Boolean(option.selected)));
        list.append(control);
      });
      popover.append(list);owner.setAttribute('aria-expanded','true');show(popover,owner);close.focus();
    };
    const tooltipFor=target=>target?.closest?.('[data-tooltip]');
    const enter=event=>{const owner=tooltipFor(event.target);if(!owner||owner.disabled||infoOwner)return;if(tooltipOwner===owner)return;closeTooltip();tooltipOwner=owner;tooltip.textContent=owner.getAttribute('data-tooltip');owner.setAttribute('aria-describedby',tooltip.id);show(tooltip,owner);};
    const leave=event=>{if(tooltipOwner&&!tooltipOwner.contains(event.relatedTarget))closeTooltip();};
    document.addEventListener('pointerover',enter);document.addEventListener('focusin',enter);
    document.addEventListener('pointerout',leave);document.addEventListener('focusout',leave);
    document.addEventListener('pointerdown',event=>{closeTooltip();if(infoOwner&&!popover.contains(event.target)&&!infoOwner.contains(event.target))closeInfo();});
    document.addEventListener('keydown',event=>{if(event.key==='Escape'){closeTooltip();closeInfo(true);}});
    document.addEventListener('scroll',event=>{if(!popover.contains(event.target))dismissSidebarOverlays();},true);
    window.addEventListener('resize',dismissSidebarOverlays);
  }
  setupSidebarOverlays();
  history.replaceState(null, '', `classroom.html${query(route)}`);
  render();

  initLiveSession().catch(error => {
    console.error('[Space Whale] Live Workspace connection failed', error);
    notice.textContent = error.message;
    if (sessionHeading) sessionHeading.textContent = guestToken ? 'Guest lesson · ссылка недействительна' : 'Live lesson · ошибка подключения';
  });
})();