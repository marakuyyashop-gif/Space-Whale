(() => {
  'use strict';

  const kit = window.SpaceWhaleExerciseKit;
  const expand=(element,open,done)=>{if(kit.motion)kit.motion.expand(element,open,done);else{element.hidden=!open;done?.();}};
  const catalog = window.SpaceWhaleCatalog.createCatalog(window.SpaceWhaleContent || [], window.SpaceWhaleTemplates || []);
  ['A1.1','A1.2','A2.1','A2.2','A2.3','B1.1','B1.2','B1.3','B1.4'].forEach(id=>{if(!catalog.levels.some(level=>level.id===id))catalog.levels.push({id,whales:[],whaleCount:0});});
  const classroom = window.SpaceWhaleClassroom || null;
  const sessionId = new URLSearchParams(location.search).get('session');
  const teacherRoom = new URLSearchParams(location.search).get('room');
  const guestToken = teacherRoom || new URLSearchParams(location.search).get('guest');
  const inviteCopyStatus = new URLSearchParams(location.search).get('share');
  const liveMode = Boolean(sessionId || guestToken);
  const entryNotice=new URLSearchParams(location.search).get('notice');

  const host = document.getElementById('workspaceExercise');
  const tree = document.getElementById('workspaceTopics');
  const milestoneRail = document.getElementById('workspaceMilestones');
  const notice = document.getElementById('workspaceNotice');
  let noticeTimer;
  function toast(text){notice.textContent=text;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>{notice.textContent='';},4500);}

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
  let studentPresent = false;
  let guestClockOffset=0;
  const pupilWaiting=()=>Boolean(guestToken&&liveRole==='student'&&!liveSession?.started_at);
  let guestAllowedLessons = null;

  const classScope = sessionId || (guestToken ? `guest:${guestToken.slice(0,12)}` : 'standalone');
  const journeyKey=`space-whale:lesson-journey-manual:v1:${classScope}`;
  let journeys={};try{journeys=JSON.parse(localStorage.getItem(journeyKey))||{};}catch(_){}
  const completionKey=`space-whale:completed-stages:${classScope}`;
  const milestonesKey=`space-whale:milestones:${classScope}`;
  let completedMilestones;
  try{completedMilestones=new Set(JSON.parse(sessionStorage.getItem(milestonesKey))||[]);}catch(_){completedMilestones=new Set();}
  let completedStages;
  try { completedStages=new Set(JSON.parse(sessionStorage.getItem(completionKey))||[]); } catch (_) { completedStages=new Set(); }
  const topicsKey = liveMode ? `space-whale:class-topics:${classScope}` : 'space-whale:class-topics';
  let classIds;
  try { classIds = new Set(JSON.parse(sessionStorage.getItem(topicsKey)) || []); }
  catch (_) { classIds = new Set(); }

  function readRoute(search) {
    const params = new URLSearchParams(search);
    if(params.has('completed_stages')){
      completedStages=new Set(params.get('completed_stages').split(',').filter(id=>catalog.lessons.some(lesson=>lesson.id===id)));
      try{sessionStorage.setItem(completionKey,JSON.stringify([...completedStages]));}catch(_){}
    }
    const hasCourseRoute = ['view', 'level', 'whale', 'lesson', 'exercise'].some(key => params.has(key));
    const normalizedSearch = hasCourseRoute ? search : '?view=library&level=A1.1&whale=1';
    const resume=new URLSearchParams(normalizedSearch);if(resume.get('lesson')&&!resume.get('exercise')&&journeys[resume.get('lesson')]?.last)resume.set('exercise',journeys[resume.get('lesson')].last);
    const route = catalog.normalize('?'+resume);
    route.panel = panels.includes(params.get('panel')) ? params.get('panel') : params.get('panel') === 'self-study' ? 'class' : 'library';
    route.section = sections.some(([id]) => id === params.get('section')) ? params.get('section') : 'tasks';
    if (params.get('panel') === 'self-study') route.section = 'self-study';
    const selected=catalog.topics(route).find(lesson=>lesson.id===route.lesson)?.stages.find(stage=>stage.exercise.id===route.exercise);
    if(selected)route.section=stageSection(selected);
    try{route.exerciseView=JSON.parse(params.get('exercise_view')||'null');}catch(_){route.exerciseView=null;}
    return route;
  }

  let route = readRoute(location.search);
  if (route.lesson) expanded.add(route.lesson);

  function query(next) {
    const params = new URLSearchParams(catalog.query(next));
    params.set('panel', next.panel || 'library');
    params.set('section', next.section || 'tasks');
    if(next.exerciseView)params.set('exercise_view',JSON.stringify(next.exerciseView));
    params.set('completed_stages',[...completedStages].join(','));
    if (sessionId) params.set('session', sessionId);
    if (guestToken) params.set(teacherRoom || liveRole==='teacher' || window.SpaceWhaleIsTeacher===true ? 'room':'guest', guestToken);
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

  let navigationWrites=Promise.resolve();
  async function syncTeacherNavigation() {
    if (!liveMode || !liveReady || liveRole !== 'teacher' || !classroom?.state?.channel) return;
    try {
      const exerciseId=route.exercise||null,page=query(route);
      navigationWrites=navigationWrites.catch(()=>{}).then(()=>classroom.navigate(exerciseId,page));
      await navigationWrites;
    } catch (error) {
      console.error('[Space Whale] Navigation sync failed', error);
      notice.textContent = 'Не удалось синхронизировать переход. Повторите действие.';
    }
  }

  function go(next, options = {}) {
    if (liveMode && liveReady && liveRole === 'student' && !options.remote) return;
    if(next.lesson&&!next.exercise){const saved=journeys[next.lesson];if(saved?.last)next={...next,exercise:saved.last};}
    if(next.exercise!==route.exercise&&!options.remote)next={...next,exerciseView:null};
    route = readRoute(query(next));
    if (route.lesson) expanded.add(route.lesson);
    openLevels.add(route.level);openWhales.add(whaleKey(route.level,route.whale));
    history[options.remote ? 'replaceState' : 'pushState'](null, '', `classroom.html${query(route)}`);
    render();
    mounted?.setViewState?.(route.exerciseView,true);
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
  let openLessonPopover=null, openSidebarPicker=null, scheduleLessonPopoverClose=null;

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
    const current=route.lesson===lesson.id,isTemplate=lesson.id==='templates';
    const card=node('section','',`workspace-topic${current?' is-current':''}`);card.setAttribute('data-tone',String(Math.min(index,7)));
    const heading=node('div','','workspace-topic-heading');
    const select=button(lesson.title,()=>{go({...route,...lessonLocation(lesson),lesson:lesson.id,exercise:current?route.exercise:'',section:current?route.section:'tasks'});},'workspace-topic-toggle');
    select.setAttribute('data-stage-label',isTemplate?'TEMPLATES':`LESSON ${String(index+1).padStart(2,'0')}`);
    if(current)select.setAttribute('aria-current','page');select.disabled=studentLocked;heading.append(select);
    const tools=node('div','','workspace-stage-tools');
    if(!isTemplate){
      const done=completedStages.has(lesson.id);
      const status=button('',()=>{
        if(locked())return;
        if(completedStages.has(lesson.id))completedStages.delete(lesson.id);else completedStages.add(lesson.id);
        try{sessionStorage.setItem(completionKey,JSON.stringify([...completedStages]));}catch(_){}
        history.replaceState(null,'',`classroom.html${query(route)}`);renderSidebar();renderMilestones();syncTeacherNavigation();
      },`workspace-stage-status${done?' is-complete':''}`);
      status.setAttribute('aria-label',`${done?'Снять отметку завершения':'Отметить Lesson завершённым'}: ${lesson.title}`);status.setAttribute('aria-pressed',String(done));status.setAttribute('data-tooltip',done?'Выполнено':'Завершить');status.disabled=studentLocked;
      const info=button('',()=>showLessonInfo(info,lesson),'workspace-lesson-info');
      info.setAttribute('aria-label',`Об уроке: ${lesson.title}`);info.setAttribute('aria-haspopup','dialog');info.setAttribute('aria-expanded','false');info.setAttribute('aria-controls','workspaceLessonInfo');
      info.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch')openLessonPopover?.(info,lesson,true);});
      info.addEventListener('pointerleave',()=>scheduleLessonPopoverClose?.());
      tools.append(status,info);
    }
    if(lesson.level===null&&!guestToken){
      const add=button(classIds.has(lesson.id)?'−':'+',()=>toggleClass(lesson),'workspace-add');add.setAttribute('aria-label',`${classIds.has(lesson.id)?'Убрать из класса':'Добавить в класс'}: ${lesson.title}`);add.disabled=studentLocked;tools.append(add);
    }
    heading.append(tools);card.append(heading);parent.append(card);
  }
  const collectionKey=`space-whale:collection-marks:${classScope}`;
  let collectionMarks={};try{collectionMarks=JSON.parse(localStorage.getItem(collectionKey))||{};}catch(_){}
  function collectionStatus(key,lessons){
    if(Object.prototype.hasOwnProperty.call(collectionMarks,key))return collectionMarks[key]?'Done':'';
    const total=lessons.reduce((n,l)=>n+l.stages.length,0),done=lessons.reduce((n,l)=>n+(journeys[l.id]?.done||[]).filter(id=>l.stages.some(stage=>stage.exercise.id===id)).length,0);
    return total&&done?(done===total?'Done':`${Math.round(done/total*100)}%`):'';
  }
  function toggleCollection(key,lessons){if(locked())return;collectionMarks[key]=collectionStatus(key,lessons)!=='Done';try{localStorage.setItem(collectionKey,JSON.stringify(collectionMarks));}catch(_){}renderSidebar();renderMilestones();}
  function toggleLessonCompletion(lesson){
    if(locked())return;
    const entry=journeys[lesson.id]||(journeys[lesson.id]={done:[],unmarked:[]});
    const complete=journeys[lesson.id]?.status==='skipped'||journey(lesson).count===lesson.stages.length;
    entry.done=complete?[]:lesson.stages.map(stage=>stage.exercise.id);entry.unmarked=[];entry.status=complete?'':'done';entry.closed=false;
    saveJourney();renderSidebar();renderMilestones();
  }
  function lessonBadge(lesson){
    const status=lessonStatus(lesson),badge=node('span',status==='Done'||status==='Skipped'?'✓':status||'✓','workspace-lesson-status');
    badge.classList.toggle('is-empty',!status);badge.setAttribute('role','button');badge.tabIndex=locked()?-1:0;
    badge.setAttribute('aria-label',(status==='Done'||status==='Skipped')?'Снять отметку выполнения':'Отметить Lesson выполненным');badge.setAttribute('aria-pressed',String(status==='Done'||status==='Skipped'));
    const toggle=event=>{event.preventDefault();event.stopPropagation();toggleLessonCompletion(lesson);};
    badge.addEventListener('click',toggle);badge.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' ')toggle(event);});return badge;
  }
  function saveJourney(){try{localStorage.setItem(journeyKey,JSON.stringify(journeys));}catch(_){} }
  function journey(lesson){
    const total=lesson?.stages.length||0;
    if(!lesson)return {count:0,total:0,current:-1,done:[]};
    const entry=journeys[lesson.id]||(journeys[lesson.id]={done:[],unmarked:[]});
    entry.done=(entry.done||[]).filter(id=>lesson.stages.some(stage=>stage.exercise.id===id));
    entry.unmarked=entry.unmarked||[];
    const current=lesson.stages.findIndex(item=>item.exercise.id===route.exercise);
    if(current>=0)entry.last=route.exercise;
    saveJourney();return {...entry,count:entry.done.length,total,current};
  }
  function lessonStatus(lesson){const entry=journeys[lesson.id];if(entry?.status==='skipped')return 'Skipped';const count=(entry?.done||[]).filter(id=>lesson.stages.some(stage=>stage.exercise.id===id)).length;return count&&lesson.stages.length?(count===lesson.stages.length?'Done':`${Math.round(count/lesson.stages.length*100)}%`):'';}
  function markLesson(action){
    const lesson=selectedLesson();if(!lesson||locked())return;
    journey(lesson);const entry=journeys[lesson.id];
    if(action==='reset'){entry.done=[];entry.unmarked=[];entry.status='';entry.closed=false;}
    if(action==='done'){entry.done=lesson.stages.map(stage=>stage.exercise.id);entry.unmarked=[];entry.status='done';entry.closed=false;}
    if(action==='skip'){entry.status='skipped';entry.closed=true;}
    saveJourney();if(action==='reset'&&lesson.stages.length){const first=lesson.stages[0];go({...route,exercise:first.exercise.id,section:stageSection(first)});return;}renderSidebar();renderMilestones();host.hidden=Boolean(entry.closed);
  }
  function milestonePurpose(stage){
    const def=stage.exercise,text=[stage.purpose,stage.menu,stage.title,def.title,stage.guide?.aim].filter(Boolean).join(' ').toLowerCase();
    let name='Practice',description='Потренируем изученный материал в задании.';
    if(/review|повтор|итог|закреп/.test(text)){name='Review';description='Повторим изученное и объединим его в практике.';}
    else if(/listen.*repeat|слушай.*повтор|произнош/.test(text)||def.layout==='listen-repeat'){name='Listen & Repeat';description='Послушаем образец и повторим, обращая внимание на произношение.';}
    else if(/listen|аудир|на слух|послуш|слуша/.test(text)||def.kind==='audio'){name='Listening';description='Послушаем запись и потренируем понимание на слух.';}
    else if(/grammar|граммат|правил|discovery/.test(text)||def.kind==='rule-page'){name='Grammar';description='Рассмотрим примеры и разберём, как устроена языковая конструкция.';}
    else if(/speaking|говор|обсуд|диалог|общени/.test(text)||def.kind==='speaking'){name='Speaking';description='Используем изученные фразы в разговоре.';}
    else if(/reading|чтени|прочит/.test(text)){name='Reading';description='Прочитаем текст и разберём его основную мысль.';}
    else if(/writing|письм|напиш/.test(text)||def.kind==='writing'){name='Writing';description='Сформулируем собственный письменный ответ.';}
    else if(/слов|лексик|фраз|word|vocabulary/.test(text)&&(/перв|нов|знаком|значени|discovery|present/.test(text)||def.kind==='presentation')){name='Word Discovery';description='Познакомимся с новой лексикой и разберём её значение.';}
    else if(def.kind==='presentation'){name='Introduction';description='Познакомимся с темой и подготовимся к дальнейшей работе.';}
    return {name:stage.navigationTitle||name,description:stage.navigationDescription||description};
  }
  function renderMilestones(){
    milestoneRail.replaceChildren();milestoneRail.hidden=true;
    const nav=document.getElementById('workspaceLessonPath'),lesson=selectedLesson();
    if(nav){
      nav.replaceChildren();
      const {done,current,total,unmarked}=journey(lesson);
      const columns=total+1;
      (lesson?.stages||[]).forEach((stage,index)=>{
        const purpose=milestonePurpose(stage),active=index===current;
        const control=button('',()=>{
          if(locked())return;
          const entry=journeys[lesson.id];entry.status='';entry.closed=false;
          if(active){
            if(entry.done.includes(stage.exercise.id)){entry.done=entry.done.filter(id=>id!==stage.exercise.id);entry.unmarked.push(stage.exercise.id);}
            else{entry.done.push(stage.exercise.id);entry.unmarked=entry.unmarked.filter(id=>id!==stage.exercise.id);}
            saveJourney();renderSidebar();renderMilestones();host.hidden=false;
          }else{
            const previous=lesson.stages[current]?.exercise.id;
            if(previous&&!entry.unmarked.includes(previous)&&!entry.done.includes(previous))entry.done.push(previous);
            saveJourney();go({...route,...lessonLocation(lesson),lesson:lesson.id,exercise:stage.exercise.id,section:stageSection(stage)});
          }
        },'workspace-path-point');
        control.disabled=locked();if(active)control.setAttribute('aria-current','step');
        control.setAttribute('aria-pressed',String(done.includes(stage.exercise.id)));
        if((index+1)%columns===0)control.classList.add('is-row-end');
        control.dataset.state=done.includes(stage.exercise.id)?'passed':active&&!unmarked.includes(stage.exercise.id)?'current':'upcoming';
        control.setAttribute('aria-label',`Milestone ${index+1}: ${purpose.name}`);control.setAttribute('data-tooltip',`${index+1} · ${purpose.name}`);
        control.append(node('span',String(index+1),'workspace-path-dot'));
        nav.append(control);
      });
      const finish=button('✓',()=>markLesson('done'),'workspace-path-point workspace-path-done');finish.disabled=locked();finish.setAttribute('aria-label','Done — отметить все Milestones');finish.setAttribute('data-tooltip','Done');finish.setAttribute('aria-pressed',String(total>0&&done.length===total));nav.append(finish);
      drawMilestoneSnake(nav,total+1,current,lesson);
    }
    renderLessonGauge();
  }
  function drawMilestoneSnake(nav,count,current,lesson){
    const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg'),path=document.createElementNS(ns,'path');
    const rows=Math.max(3,Math.ceil(count/4)),gap=80,height=48+(rows-1)*gap+40;
    let d='M 56 24 H 184';
    for(let row=1;row<rows;row++){const y=24+row*gap;d+=` A 40 40 0 0 ${row%2?1:0} ${row%2?184:56} ${y} H ${row%2?56:184}`;}
    svg.setAttribute('viewBox',`0 0 240 ${height}`);svg.setAttribute('preserveAspectRatio','none');svg.setAttribute('aria-hidden','true');path.setAttribute('d',d);svg.append(path);nav.prepend(svg);nav.style.height=`${height}px`;
    const points=[...nav.querySelectorAll('.workspace-path-point')],length=path.getTotalLength();
    points.forEach((control,index)=>{const point=path.getPointAtLength(length*index/Math.max(1,count-1));control.style.left=`${point.x/240*100}%`;control.style.top=`${point.y}px`;});
    if(current>=0&&lesson){
      const point=path.getPointAtLength(length*current/Math.max(1,count-1)),label=node('span',milestonePurpose(lesson.stages[current]).name,'workspace-snake-label');
      const lane=Math.min(rows-2,Math.floor((point.y-24)/gap)),middle=24+lane*gap+gap/2;
      label.style.top=`${point.y+(point.y<=middle?18:-30)}px`;
      if(point.x>120){label.style.right=`${(240-point.x+10)/240*100}%`;label.style.left='auto';label.style.textAlign='right';}
      else{label.style.left=`${(point.x+10)/240*100}%`;label.style.right='auto';label.style.textAlign='left';}
      nav.append(label);
    }
  }

  function answerProgress(def,value={}){
    const filled=value=>Array.isArray(value)?value.length>0:typeof value==='string'?value.trim().length>0:typeof value==='number';
    if(def.kind==='stage'||def.kind==='rule-page'){
      const children=def.kind==='stage'?(def.exercises||[]):(def.blocks||[]).filter(block=>block.type==='exercise');
      const ratios=children.map(block=>answerProgress(block.exercise,value?.[block.id]||{})).filter(ratio=>ratio!==null);
      return ratios.length?ratios.reduce((a,b)=>a+b,0)/ratios.length:null;
    }
    if(def.kind==='order')return def.tokens?.length?Math.min(1,new Set((value.order||[]).filter(id=>def.tokens.some(token=>token.id===id))).size/def.tokens.length):0;
    const items=def.kind==='gaps'?(def.items||[]).flatMap(item=>item.segments.filter(part=>typeof part==='object')):def.items;
    if(!['gaps','matching','choice','sort','writing','image-label'].includes(def.kind)||!items?.length)return null;
    return items.filter(item=>filled(value?.[item.id])).length/items.length;
  }
  function milestoneAnswers(lesson,exercise){
    if(liveAnswers.has(exercise.id))return liveAnswers.get(exercise.id);
    const key=sessionId?`space-whale:workspace:live:v1:${sessionId}:${lesson.id}:${exercise.id}`:guestToken?`space-whale:workspace:guest:v1:${guestToken.slice(0,12)}:${lesson.id}:${exercise.id}`:`space-whale:workspace:v1:${lesson.id}:${exercise.id}`;
    const saved=readAnswers(key,JSON.stringify(exercise));
    return saved.__sw_collab===1?replica(exercise.id).answers():saved;
  }
  function updateMilestoneProgress(exercise,answers){
    liveAnswers.set(exercise.id,answers);
    if(answerProgress(exercise,answers)===1)completedMilestones.add(exercise.id);else completedMilestones.delete(exercise.id);
    try{sessionStorage.setItem(milestonesKey,JSON.stringify([...completedMilestones]));}catch(_){}
    renderMilestones();
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
  function renderLessonGauge(){
    const gauge=document.getElementById('workspaceLessonGauge');
    if(!gauge)return;
    const lesson=selectedLesson();gauge.hidden=Boolean(lesson&&journeys[lesson.id]?.closed);
    const {total,count}=journey(lesson);
    const percent=total?Math.round(count/total*100):0;
    gauge.setAttribute('aria-valuenow',String(percent));
    gauge.setAttribute('aria-valuetext',`${percent}% пути по уроку`);
    gauge.querySelector('.workspace-gauge-percent').textContent=`${percent}%`;
    gauge.querySelector('.workspace-gauge-count').textContent=`${count} / ${total} milestones`;
    gauge.querySelectorAll('.workspace-gauge-tick').forEach((tick,index)=>tick.classList.toggle('is-filled',index<Math.round(count/(total||1)*48)));
  }
  function renderSidebar() {
    dismissSidebarOverlays();tree.replaceChildren();
    const controls=document.getElementById('workspaceCourseControls');controls.replaceChildren();
    const studentLocked=locked(),inClass=route.panel==='class';
    panels.forEach(panel=>document.getElementById(`${panel}Tab`).setAttribute('aria-pressed',String(route.panel===panel)));
    document.getElementById('workspaceClockPanel').hidden=false;start.disabled=studentLocked;paintTimer();
    const levels=catalog.levels.filter(level=>!guestAllowedLessons||availableWhales(level).length);
    const level=levels.find(item=>item.id===route.level)||levels[0];
    const whales=level?availableWhales(level):[],whale=whales.find(item=>item.id===route.whale)||whales[0];
    const loose=catalog.lessons.filter(lesson=>lesson.level===null&&permitted(lesson)&&(!inClass||hasClassLesson(lesson)));
    const view=route.view==='templates'&&!inClass&&!guestAllowedLessons?'templates':route.view==='unassigned'?'unassigned':'library';
    const topics=view==='templates'?catalog.topics({view:'templates'}):view==='unassigned'?loose:whale?catalog.topics({view:'library',level:level.id,whale:whale.id}).filter(permitted):[];
    const lesson=selectedLesson(),stageIndex=topics.findIndex(item=>item.id===lesson?.id),milestoneIndex=lesson?.stages.findIndex(item=>item.exercise.id===route.exercise)??-1;
    const levelOptions=levels.map(item=>({label:item.id,number:'LEVEL',card:true,tags:item.whales.length?item.whales.slice(0,3).map(module=>module.title.replace(/^Whale\s*\d+\s*[·:—-]?\s*/i,'')).join(' • '):({'A2.1':'Повседневные ситуации • общение','A2.2':'Рассказы • планы • впечатления','A2.3':'Обсуждение опыта • самостоятельная речь','B1.1':'Мнения • связные рассказы','B1.2':'Обсуждение тем • аргументы','B1.3':'Подробные объяснения • диалоги','B1.4':'Свободнее выражаем мысли'}[item.id]||'Программа готовится'),status:collectionStatus(`level:${item.id}`,catalog.lessons.filter(l=>l.level===item.id)),mark:()=>toggleCollection(`level:${item.id}`,catalog.lessons.filter(l=>l.level===item.id)),selected:item.id===route.level,action:()=>chooseCollection({...route,view:'library',level:item.id,whale:availableWhales(item)[0]?.id||0})}));
    if(loose.length)levelOptions.push({label:'Отдельные уроки',action:()=>chooseCollection({...route,view:'unassigned'})});
    if(!inClass&&!guestAllowedLessons)levelOptions.push({label:'Шаблоны упражнений',action:()=>chooseCollection({...route,view:'templates'})},{label:'Управление материалами',href:'library-manage.html'});
    const tagsFor=item=>{
      const explicit=[item.grammar,item.lexis].flat().filter(value=>typeof value==='string'&&value.trim());
      if(explicit.length)return explicit.join(' • ').slice(0,90);
      const subject=[item.title,item.goal,item.summary].filter(Boolean).join(' ').toLowerCase();
      const themes=[[/привет|встреч|поздор|самочувств/,'greetings'],[/знаком/,'meeting people'],[/зовут|имени|алфавит|spell/,'names • spelling'],[/анкет|личные данн/,'personal information'],[/контакт|телефон|email/,'contact details'],[/погод/,'weather'],[/одежд/,'clothes'],[/покуп|shopping/,'shopping'],[/ед[ауы]|food/,'food'],[/дом|комнат/,'home']].filter(([pattern])=>pattern.test(subject)).map(([,label])=>label);
      return themes.length?themes.slice(0,2).join(' • '):[...new Set((item.stages||[]).map(stage=>milestonePurpose(stage).name))].slice(0,3).join(' • ');
    };
    const moduleOptions=whales.map(item=>{
      const lessons=catalog.topics({view:'library',level:level.id,whale:item.id}).filter(permitted);
      const names=[...new Set(lessons.flatMap(item=>tagsFor(item).split(' • ')))].filter(Boolean).slice(0,3);
      return {label:item.title.replace(/^Whale\s*\d+\s*[·:—-]?\s*/i,''),number:String(item.id).padStart(2,'0'),tags:names.join(' • '),status:collectionStatus(`module:${level.id}:${item.id}`,lessons),mark:()=>toggleCollection(`module:${level.id}:${item.id}`,lessons),selected:item.id===whale?.id,action:()=>chooseCollection({...route,view:'library',level:level.id,whale:item.id})};
    });
    const lessonOptions=topics.map((item,index)=>({label:item.title,number:String(index+1).padStart(2,'0'),tags:tagsFor(item),status:lessonStatus(item),mark:()=>toggleLessonCompletion(item),selected:item.id===lesson?.id,action:()=>{if(journeys[item.id])journeys[item.id].closed=false;saveJourney();go({...route,...lessonLocation(item),lesson:item.id,exercise:'',section:'tasks'});}}));
    const selector=(label,title,options,size)=>{
      const control=button(label,()=>openSidebarPicker?.(control,title,options),`workspace-console-selector selector-${size}`);
      control.disabled=studentLocked;control.setAttribute('aria-label',title);control.setAttribute('data-tooltip',title);control.setAttribute('aria-haspopup','dialog');control.setAttribute('aria-expanded','false');controls.append(control);
    };
    selector(view==='library'?level?.id||'—':view==='templates'?'TPL':'Level','Level',levelOptions,'level');
    selector(view==='library'&&whale?`M${whale.id}`:'M—','Module',moduleOptions,'module');
    const overview=node('section','','workspace-lesson-overview');
    const lessonCard=button('',()=>openSidebarPicker?.(lessonCard,'Lesson',lessonOptions),'workspace-lesson-selector');
    lessonCard.disabled=studentLocked;lessonCard.setAttribute('aria-label','Выбрать Lesson');lessonCard.setAttribute('aria-haspopup','dialog');lessonCard.setAttribute('aria-expanded','false');
    lessonCard.append(node('span',stageIndex>=0?`LESSON ${String(stageIndex+1).padStart(2,'0')}`:'LESSON','workspace-info-eyebrow'),node('strong',lesson?.title||'Выберите Lesson','workspace-lesson-selector-title'),node('small',lesson?tagsFor(lesson):'','workspace-lesson-selector-tags'),node('i','','workspace-selector-chevron'));
    if(lesson){lessonCard.append(lessonBadge(lesson));if(lessonStatus(lesson)==='Skipped')lessonCard.append(node('span','Skip','workspace-skip-badge'));}
    overview.append(lessonCard);
    if(lesson&&journeys[lesson.id]?.closed){tree.append(overview);return;}
    const copy=node('p','','workspace-info-copy');
    if(lesson){
      const goal=lesson.summary||lesson.description||lesson.goal;
      if(goal)copy.append(document.createTextNode(goal));
      else copy.append(document.createTextNode('Тема урока — '),node('strong',lesson.title),document.createTextNode('. Рассмотрим материал и потренируем его использование.'));
      const highlights=[lesson.grammar,lesson.lexis].flat().filter(value=>typeof value==='string'&&value);
      if(highlights.length){copy.append(document.createTextNode(' В центре внимания: '));highlights.slice(0,2).forEach((text,index)=>{if(index)copy.append(document.createTextNode(' и '));copy.append(node('strong',text));});copy.append(document.createTextNode('.'));}
      else if(goal){const terms=['самочувствии','поздороваться','попрощаться','знакомстве','личные данные','погоду','контактами'];const raw=copy.textContent;const re=new RegExp('('+terms.join('|')+')','gi');copy.replaceChildren();raw.split(re).forEach((part,index)=>copy.append(index%2?node('strong',part):document.createTextNode(part)));}
    }else copy.textContent='Выберите урок с помощью кнопок рядом с таймером.';
    overview.append(copy);tree.append(overview);
    const current=node('section','','workspace-current-overview'),stage=lesson?.stages[milestoneIndex];
    current.append(node('span',stage?`MILESTONE ${String(milestoneIndex+1).padStart(2,'0')}`:'MILESTONE','workspace-info-eyebrow'));
    const actions=node('div','','workspace-milestone-actions');const skip=button('Skip',()=>markLesson('skip'),'workspace-progress-skip');const reset=button('',()=>markLesson('reset'),'workspace-progress-reset');reset.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10a8 8 0 1 1 1 7M4 4v6h6"/></svg>';skip.disabled=reset.disabled=studentLocked;reset.setAttribute('aria-label','Сбросить отметки Milestones');reset.setAttribute('data-tooltip','Сбросить отметки');actions.append(skip,reset);current.append(actions);
    if(stage){const purpose=milestonePurpose(stage);current.append(node('h3',purpose.name),node('p',purpose.description,'workspace-info-copy'));}
    else current.append(node('p','Задания появятся после выбора урока.','workspace-info-copy'));
    const path=node('nav','','workspace-lesson-path');path.id='workspaceLessonPath';path.setAttribute('aria-label','Milestones текущего Lesson');current.append(path);tree.append(current);
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
      if (response.__sw_collab === 1) {if(!r.merge(response))return false;}
      else if (!Object.keys(r.snapshot().entries).length) r.update(response);
      response = r.answers();
      // The originating peer saves its draft; receivers do not echo writes to the DB.
    }
    liveAnswers.set(exerciseId, response);

    if (route.exercise === exerciseId && mounted?.setAnswers) {
      mounted.setAnswers(response);
      const activeExercise=selectedLesson()?.stages.find(item=>item.exercise.id===exerciseId)?.exercise;
      if(activeExercise)updateMilestoneProgress(activeExercise,response);
      if (mountedStorage) storeAnswers(mountedStorage.key, mountedStorage.signature, collaborative() ? replica(exerciseId).snapshot() : response);
    }
    return true;
  }

  async function hydrateLiveExercise(exerciseId, localAnswers) {
    if (!liveMode || !liveReady || !exerciseId || liveHydrated.has(exerciseId)) return;
    liveHydrated.add(exerciseId);
    if(collaborative())classroom.requestExerciseState(exerciseId).catch(error=>console.error('[Space Whale] Peer state request failed',error));

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

    if (liveRole === 'student' && !collaborative()) {
      const revision=liveSeenAt.get(exerciseId);
      try {
        const saved=await classroom.loadExerciseResponse(exerciseId);
        const pending=classroom.getPendingSnapshot?.(exerciseId);
        // Never overwrite typing that happened while the server response was loading.
        const answers=pending??(liveSeenAt.get(exerciseId)!==revision?liveAnswers.get(exerciseId):saved?.response??localAnswers);
        if(answers&&typeof answers==='object'){
          liveAnswers.set(exerciseId,answers);
          if(route.exercise===exerciseId&&mounted?.setAnswers){mounted.setAnswers(answers);if(mountedStorage)storeAnswers(mountedStorage.key,mountedStorage.signature,answers);}
          await classroom.sendExerciseSnapshot(exerciseId,answers);
        }
      } catch(error){liveHydrated.delete(exerciseId);console.error('[Space Whale] Could not restore student answers',error);}
    }
  }

  function renderContent() {
    if(guestToken&&(!liveReady||pupilWaiting())){
      mounted?.destroy?.();mounted=null;mountedKey='waiting';host.hidden=false;host.replaceChildren();
      if(liveReady){const waiting=node('section','','workspace-empty workspace-waiting');waiting.append(node('h1','Ждём начала занятия'),node('p','Вы подключились. Урок откроется автоматически, когда преподаватель нажмёт Start Lesson.'));host.append(waiting);}
      return;
    }
    const selected = selectedLesson();
    host.hidden=Boolean(selected&&journeys[selected.id]?.closed);
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
      syncChecks: true,
      readOnly: false,
      navigationReadOnly:locked(),
      onViewChange:view=>{
        if(locked())return;
        route.exerciseView=view;
        history.replaceState(null,'',`classroom.html${query(route)}`);
        if(mountedStorage)storeAnswers(mountedStorage.key,mountedStorage.signature,mounted.getAnswers());
        syncTeacherNavigation();
      },
      onChange: answers => {
        const response = collaborative() ? replica(exercise.id).update(answers) : answers;
        liveAnswers.set(exercise.id, answers);
        liveSeenAt.set(exercise.id, Date.now());
        storeAnswers(storageKey, signature, response);
        updateMilestoneProgress(exercise,answers);
        if (liveMode && liveReady && (liveRole === 'student' || collaborative())) {
          classroom.sendExerciseDraft(exercise.id, response)
            .catch(error => { console.error('[Space Whale] Live answer sync failed', error); notice.textContent='Связь прервана. Ответы сохранены на этом устройстве; дождитесь подключения.'; });
        }
      }
    });

    mounted.setViewState?.(route.exerciseView,false);
    updateMilestoneProgress(exercise,initialAnswers);
    hydrateLiveExercise(exercise.id, localAnswers);
  }

  function render() { renderSidebar(); renderContent(); renderMilestones(); }

  function applyRemoteNavigation(payload) {
    if (!liveMode || liveRole !== 'student' || pupilWaiting()) return;
    let next = null;
    if (payload?.current_page_id) {restoreClassSelection(payload.current_page_id);next = readRoute(payload.current_page_id);}
    if ((!next || !next.exercise) && payload?.current_exercise_id) next = routeForExercise(payload.current_exercise_id);
    if (next) go(next, { remote: true });
  }

  function renderPresence(presenceState) {
    if (!liveMode || !sessionHeading) return;
    const presences = Object.values(presenceState || {}).flat();
    const studentOnline = presences.some(item => item.role === 'student');
    studentPresent = studentOnline;
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
      onLessonState:applyGuestLessonState,
      onEnded:()=>{
        if(liveRole==='teacher'||window.SpaceWhaleIsTeacher===true){returnToTeacherWorkspace('closed');return;}
        liveReady=false;mounted?.destroy?.();host.replaceChildren();studentTimer.hidden=true;
        document.body.dataset.workspaceRole='connection-error';
        const status=document.getElementById('workspaceConnectionState');status.textContent='Занятие закрыто или срок ссылки истёк. Попросите преподавателя прислать новую ссылку.';
      },
      onConnectionState:online=>{
        host.inert=!online;
        if(!online)notice.textContent='Восстанавливаем соединение…';
        else if(notice.textContent==='Восстанавливаем соединение…')toast('Соединение восстановлено');
      },
      onReconnect: async () => {
        await classroom.flushPendingSnapshots?.();
        liveHydrated.clear();
        const shared=await classroom.loadSharedState(sessionId);
        if (liveRole==='student' && shared) applyRemoteNavigation(shared);
        if (liveRole==='teacher') await syncTeacherNavigation();
        if (route.exercise && !pupilWaiting()) {
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

    if(!['teacher','student'].includes(result.role))throw new Error('Нет доступа к этому занятию.');
    liveReady = true;
    liveRole = result.role;
    if(guestToken&&liveRole==='teacher')history.replaceState(null,'',`classroom.html${query(route)}`);
    document.body.dataset.workspaceRole=liveRole;
    sidebar.inert=liveRole==='student';
    liveSession = result.session;
    if(guestToken)applyGuestLessonState(result.meta||{});
    tick();
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

    const shared = guestToken ? result.meta : await classroom.loadSharedState(sessionId);
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

    if (route.exercise && !pupilWaiting()) hydrateLiveExercise(route.exercise, mounted?.getAnswers?.() || {});
    if(inviteCopyStatus&&liveRole==='teacher')toast(inviteCopyStatus==='copied'?'Ссылка скопирована':'Нажмите «Ссылка для ученика», чтобы скопировать приглашение.');
  }

  panels.forEach(panel => document.getElementById(`${panel}Tab`).addEventListener('click', () => {
    // Browsing the catalog never broadcasts navigation or changes the active task.
    route={...route,panel};history.replaceState(null,'',`classroom.html${query(route)}`);render();
  }));


  // Scheduled sessions keep their fixed start/end; previews use one uninterrupted hour.
  const timerKey=`space-whale:clock:${classScope}`;
  let timer={startedAt:null,readyAt:null,ended:false},ticker=null;
  try{const saved=JSON.parse(sessionStorage.getItem(timerKey));if(Number.isFinite(saved?.startedAt))timer.startedAt=saved.startedAt;if(Number.isFinite(saved?.readyAt))timer.readyAt=saved.readyAt;else if(timer.startedAt!==null)timer.readyAt=timer.startedAt;if(saved?.ended){timer.startedAt=null;timer.readyAt=null;}}catch(_){}
  const scheduledStart=()=>{const value=Date.parse(liveSession?.scheduled_at||'');return Number.isFinite(value)?value:null;};
  function applyGuestLessonState(data){
    if(!guestToken||!liveSession)return;
    const wasWaiting=pupilWaiting();
    liveSession.started_at=data.started_at||null;
    liveSession.duration_minutes=data.duration_minutes||60;
    liveSession.status=data.status||'waiting';
    const serverNow=Date.parse(data.server_now||'');
    if(Number.isFinite(serverNow))guestClockOffset=serverNow-Date.now();
    const startedAt=Date.parse(data.started_at||'');
    timer.startedAt=Number.isFinite(startedAt)?startedAt:null;timer.readyAt=timer.startedAt;timer.ended=false;saveTimer();
    if(Array.isArray(data.allowed_lesson_ids))guestAllowedLessons=data.allowed_lesson_ids.includes('*')?null:new Set(data.allowed_lesson_ids);
    paintTimer();
    if(liveReady&&wasWaiting&&!pupilWaiting()){
      mountedKey='';applyRemoteNavigation(data);render();
    }
  }
  const saveTimer=()=>{try{sessionStorage.setItem(timerKey,JSON.stringify(timer));}catch(_){}};
  function timerState(){
    const now=Date.now()+(guestToken?guestClockOffset:0),scheduled=scheduledStart(),duration=Math.max(1,Number(liveSession?.duration_minutes)||60)*60000;
    if(!timer.ended&&timer.readyAt!==null&&timer.startedAt===null&&scheduled!==null){
      if(timer.readyAt>=scheduled)timer.startedAt=timer.readyAt;
      else if(now>=scheduled)timer.startedAt=scheduled;
      else if(studentPresent)timer.startedAt=now;
      if(timer.startedAt!==null)saveTimer();
    }
    const active=timer.startedAt!==null,pre=!active&&scheduled!==null&&now<scheduled&&now>=scheduled-300000;
    const remaining=active?Math.max(0,timer.startedAt+duration-now):pre?scheduled-now:0;
    return {duration:pre?300000:duration,remaining,active,pre,waiting:timer.readyAt!==null&&!active,canStart:(scheduled!==null&&now>=scheduled-300000||liveSession?.guest===true)&&!active&&timer.readyAt===null&&!timer.ended};
  }
  const clock=document.getElementById('workspaceClock'),stop=document.getElementById('workspaceStopLesson');
  const clockLabel=node('small','','workspace-clock-label');document.querySelector('.workspace-clock-face').append(clockLabel);
  const studentTimer=node('div','','workspace-student-timer');studentTimer.hidden=true;
  studentTimer.innerHTML='<span class="workspace-student-timer-caption">До конца урока</span><span class="workspace-student-time" role="timer" aria-label="Осталось времени">60:00</span>';
  document.querySelector('.class-area').append(studentTimer);
  function paintTimer(){
    const state=timerState(),seconds=Math.ceil(state.remaining/1000),spent=state.duration-state.remaining,expired=state.active&&seconds===0;
    document.getElementById('workspaceClockTime').textContent=`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
    studentTimer.hidden=!(liveReady&&liveRole==='student'&&state.active&&!timer.ended);
    studentTimer.querySelector('.workspace-student-time').textContent=document.getElementById('workspaceClockTime').textContent;
    clockLabel.textContent=state.pre?'До урока':'';clockLabel.hidden=!state.pre;
    document.getElementById('workspaceClockProgress').setAttribute('stroke-dashoffset',String(100-spent/state.duration*100));
    clock.setAttribute('aria-valuemax',String(state.duration/60000));clock.setAttribute('aria-valuenow',String(spent/60000));clock.setAttribute('aria-valuetext',`${state.pre?'До урока: ':''}${Math.floor(seconds/60)} мин. ${seconds%60} сек.`);
    clock.dataset.started=String(state.active||state.pre);clock.dataset.phase=timer.ended?'closed':expired?'expired':state.active?'running':state.pre?'before':'ready';clock.style.setProperty('--clock-spent',`${spent/state.duration*360}deg`);
    start.hidden=state.active&&!timer.ended;
    start.innerHTML=timer.ended?'Lesson<br>ended':state.waiting?'Ждём<br>ученика':'Start<br>Lesson';
    start.disabled=locked()||(liveMode&&!state.canStart);
    start.setAttribute('aria-label',timer.ended?'Занятие завершено':state.waiting?'Ожидаем ученика':state.canStart?'Start Lesson':!liveMode?'Создать приглашение на занятие':scheduledStart()===null?'Сначала подключитесь к занятию':'Начать можно за 5 минут до занятия');
    start.removeAttribute('data-tooltip');stop.hidden=!state.active||timer.ended;stop.disabled=locked();stop.innerHTML='Finish<br>Lesson';
    clock.setAttribute('data-time-state','normal');
    if(expired)document.getElementById('workspaceTimerStatus').textContent='Время занятия истекло.';
  }
  function tick(){paintTimer();if(!timer.ended&&ticker===null)ticker=window.setInterval(paintTimer,1000);}
  const sessionDialog=node('dialog','','workspace-session-dialog');document.body.append(sessionDialog);
  const dialogClose=()=>sessionDialog.close();
  function prepareDialog(title){sessionDialog.replaceChildren(node('h2',title));const close=button('×',dialogClose,'workspace-dialog-close');close.setAttribute('aria-label','Закрыть');sessionDialog.append(close);}
  start.addEventListener('click',()=>{
    if(!liveMode){
      prepareDialog('Пригласить ученика');
      sessionDialog.append(node('p','Создадим отдельную ссылку и скопируем её. Ученик попадёт в ожидание. Материалы откроются только после вашего Start Lesson.'));
      const actions=node('div','','workspace-dialog-actions'),error=node('p','','workspace-device-status');
      const create=button('Создать и скопировать ссылку',async()=>{create.disabled=true;try{await createInvitation();}catch(e){error.textContent=e.message;create.disabled=false;}},'workspace-dialog-button is-brand');
      actions.append(button('Отмена',dialogClose,'workspace-dialog-button'),create);sessionDialog.append(actions,error);sessionDialog.showModal();return;
    }
    if(locked()||!timerState().canStart)return;
    prepareDialog('Начать занятие?');
    sessionDialog.append(node('p','Откроем материалы ученику и запустим общий таймер на 60 минут.'));
    const actions=node('div','','workspace-dialog-actions'),error=node('p','','workspace-device-status');
    const confirm=button('Start Lesson',async()=>{
      if(!timerState().canStart||confirm.disabled)return;confirm.disabled=true;
      try{
        if(liveSession?.guest){await syncTeacherNavigation();applyGuestLessonState(await classroom.startGuestLesson());}
        else{timer.readyAt=Date.now();timer.ended=false;saveTimer();}
        dialogClose();tick();
      }catch(e){error.textContent='Не удалось начать занятие. Проверьте соединение и повторите попытку.';confirm.disabled=false;}
    },'workspace-dialog-button is-brand');
    actions.append(button('Отмена',dialogClose,'workspace-dialog-button'),confirm);
    sessionDialog.append(actions,error);sessionDialog.showModal();
  });
  stop.addEventListener('click',()=>{
    if(locked()||timer.ended)return;
    prepareDialog('Завершить занятие?');sessionDialog.append(node('p','Ссылка ученика закроется. Вы вернётесь в свой кабинет и сможете продолжить подготовку или пригласить следующего ученика.'));
    const actions=node('div','','workspace-dialog-actions'),error=node('p','','workspace-device-status');
    const finish=button('Завершить',async()=>{
      finish.disabled=true;
      try{
        if(guestToken){await closeGuestRoom();return;}
        if(classroom?.state?.channel)await classroom.disconnect();
        returnToTeacherWorkspace('closed');
      }catch(_){error.textContent='Не удалось закрыть занятие. Оно остаётся доступным; попробуйте ещё раз.';finish.disabled=false;}
    },'workspace-dialog-button is-finish');
    actions.append(button('Продолжить',dialogClose,'workspace-dialog-button is-brand'),finish);sessionDialog.append(actions,error);sessionDialog.showModal();
  });
  tick();
  const profile=document.getElementById('workspaceStudentProfile'),profileButton=document.getElementById('workspaceProfileButton');
  const personIcon=profileButton.innerHTML,returnIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="7" r="2.5"/><circle cx="7" cy="17" r="2.5"/><circle cx="17" cy="17" r="2.5"/></svg>';
  profileButton.addEventListener('click',()=>{const open=!sidebar.classList.contains('is-profile');sidebar.classList.toggle('is-profile',open);profile.hidden=!open;profileButton.innerHTML=open?returnIcon:personIcon;profileButton.setAttribute('aria-label',open?'Вернуться в класс':'Профиль ученика');profileButton.setAttribute('data-tooltip',open?'Вернуться в класс':'Профиль ученика');});

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

  function teacherWorkspaceURL(reason){
    const url=new URL('classroom.html'+query(route),location.href);
    ['guest','room','session','share','exercise_view','completed_stages'].forEach(key=>url.searchParams.delete(key));
    if(reason)url.searchParams.set('notice',reason);
    return url.href;
  }
  function returnToTeacherWorkspace(reason){
    timer={startedAt:null,readyAt:null,ended:false};saveTimer();
    if(ticker!==null){clearInterval(ticker);ticker=null;}
    location.replace(teacherWorkspaceURL(reason));
  }
  async function closeGuestRoom(){
    await classroom.flushPendingSnapshots?.();
    await revokeInvitation();
    await classroom.disconnect();
    returnToTeacherWorkspace('closed');
  }
  const invite = document.getElementById('inviteStudent');
  const invitationURL=token=>{const url=new URL('classroom.html',location.href);url.searchParams.set('guest',token);return url.href;};
  async function copyInvitation(url){
    try{await navigator.clipboard.writeText(url);toast('Ссылка скопирована');return true;}
    catch{toast('Браузер не разрешил копирование. Нажмите кнопку ссылки ещё раз.');return false;}
  }
  async function createInvitation(){
    const result=await window.spaceWhaleSupabase.rpc('create_guest_workspace');
    if(result.error)throw result.error;
    if(!result.data?.token)throw new Error('Не удалось создать приглашение.');
    const copied=await copyInvitation(invitationURL(result.data.token));
    const nextRoute={...route,exercise:selectedLesson()?.stages[0]?.exercise.id||route.exercise};
    const joined=new URL('classroom.html'+query(nextRoute),location.href);
    joined.searchParams.set('room',result.data.token);joined.searchParams.delete('guest');joined.searchParams.delete('session');joined.searchParams.delete('notice');
    joined.searchParams.delete('completed_stages');joined.searchParams.delete('exercise_view');
    joined.searchParams.set('share',copied?'copied':'1');
    location.href=joined.href;
  }
  async function revokeInvitation(){
    if(!guestToken)return;
    const result=await window.spaceWhaleSupabase.rpc('revoke_guest_lesson_link',{p_token:guestToken});
    if(result.error)throw result.error;
  }
  if(invite){
    invite.hidden=false;
    invite.addEventListener('click',async()=>{
      if(locked())return;
      invite.disabled=true;
      try{
        if(guestToken){await copyInvitation(invitationURL(guestToken));return;}
        if(sessionId){const url=new URL('classroom.html',location.href);url.searchParams.set('session',sessionId);await copyInvitation(url.href);return;}
        await createInvitation();
      }catch(error){toast(error.message||'Не удалось создать приглашение.');}
      finally{invite.disabled=false;}
    });
  }
  document.getElementById('newGuestLesson')?.addEventListener('click',()=>{
    if(locked())return;
    prepareDialog('Приглашение на занятие');
    sessionDialog.append(node('p','Новый ученик получит отдельную ссылку и пустые ответы. Прежние ссылки закроются. Ссылка действует 24 часа; её можно закрыть раньше.'));
    const actions=node('div','','workspace-dialog-actions'),error=node('p','','workspace-device-status');
    const create=button('Новый ученик',async()=>{create.disabled=true;close.disabled=true;try{await createInvitation();}catch(e){error.textContent=e.message;create.disabled=false;close.disabled=false;}},'workspace-dialog-button is-brand');
    const close=button('Закрыть текущую ссылку',async()=>{close.disabled=true;create.disabled=true;try{await closeGuestRoom();}catch(e){error.textContent=e.message;close.disabled=false;create.disabled=false;}},'workspace-dialog-button');
    close.disabled=!guestToken;
    actions.append(create,close);sessionDialog.append(actions,error);sessionDialog.showModal();
  });
  function setupSidebarOverlays(){
    if(!document.body?.append || !document.addEventListener)return;
    const tooltip=node('div','','workspace-floating workspace-control-tooltip');tooltip.id='workspaceControlTooltip';tooltip.setAttribute('role','tooltip');
    const popover=node('section','','workspace-floating workspace-lesson-popover');popover.id='workspaceLessonInfo';popover.setAttribute('role','dialog');popover.setAttribute('aria-labelledby','workspaceLessonInfoTitle');
    [tooltip,popover].forEach(el=>{el.setAttribute('popover','manual');el.hidden=true;document.body.append(el);});
    let tooltipOwner=null,infoOwner=null,hoverInfo=false,hoverCloseTimer=null;
    const cancelHoverClose=()=>{if(hoverCloseTimer!==null){window.clearTimeout(hoverCloseTimer);hoverCloseTimer=null;}};
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
    const closeInfo=(restore=false)=>{cancelHoverClose();hoverInfo=false;const owner=infoOwner;if(owner)owner.setAttribute('aria-expanded','false');infoOwner=null;hide(popover);if(restore&&owner?.isConnected)owner.focus();};
    dismissSidebarOverlays=()=>{closeTooltip();closeInfo();};
    scheduleLessonPopoverClose=()=>{cancelHoverClose();if(hoverInfo)hoverCloseTimer=window.setTimeout(()=>closeInfo(),160);};
    popover.addEventListener('pointerenter',cancelHoverClose);popover.addEventListener('pointerleave',()=>scheduleLessonPopoverClose());
    openLessonPopover=(owner,lesson,hover=false)=>{
      cancelHoverClose();
      if(infoOwner===owner){if(hover)return;if(hoverInfo){hoverInfo=false;return;}closeInfo();return;}
      closeInfo();closeTooltip();infoOwner=owner;hoverInfo=hover;
      const header=node('div','','workspace-popover-heading');const title=node('h3',lesson.title);title.id='workspaceLessonInfoTitle';
      const close=button('×',()=>closeInfo(true),'workspace-popover-close');close.setAttribute('aria-label','Закрыть информацию об уроке');header.append(title,close);popover.replaceChildren(header);
      const meta=[lesson.level,lesson.whale?`Module ${lesson.whale}`:'',lesson.stages.length?`${lesson.stages.length} milestones`:''].filter(Boolean).join(' · ');if(meta)popover.append(node('p',meta,'workspace-popover-meta'));
      lessonInfo(lesson).forEach(([label,text])=>{const row=node('p','','workspace-popover-row');row.append(node('strong',label),node('span',text));popover.append(row);});
      owner.setAttribute('aria-expanded','true');show(popover,owner);if(!hover)close.focus();
    };
    openSidebarPicker=(owner,title,options)=>{
      if(infoOwner===owner){closeInfo();return;}closeInfo();closeTooltip();infoOwner=owner;
      const header=node('div','','workspace-popover-heading');const heading=node('h3',title);heading.id='workspaceLessonInfoTitle';
      const close=button('×',()=>closeInfo(true),'workspace-popover-close');close.setAttribute('aria-label','Закрыть выбор');header.append(heading,close);popover.replaceChildren(header);
      const list=node('div','',`workspace-picker-options ${options.some(option=>option.number)?'workspace-card-picker':'workspace-number-picker'}`);
      options.forEach(option=>{
        const control=option.href?node('a',option.label,'workspace-picker-option'):button(option.label,()=>{closeInfo();option.action();},'workspace-picker-option');
        if(option.number){control.replaceChildren(node('span',option.number,'workspace-picker-number'),node('strong',option.label),node('small',option.tags||'Материалы готовятся'));if(option.status&&!option.mark)control.append(node('span',option.status==='Done'?'✓':option.status,'workspace-lesson-status'));if(option.status)control.classList.add('is-progressed');if(option.status==='Skipped')control.append(node('span','Skip','workspace-skip-badge'));}
        if(option.href)control.href=option.href;else control.setAttribute('aria-pressed',String(Boolean(option.selected)));
        if(option.mark){const row=node('div','','workspace-collection-option');const mark=button(option.status&&option.status!=='Done'&&option.status!=='Skipped'?option.status:'✓',()=>{closeInfo();option.mark();},'workspace-collection-mark');mark.setAttribute('aria-label',`${(option.status==='Done'||option.status==='Skipped')?'Снять отметку выполнения':'Отметить выполненным'}: ${option.label}`);mark.setAttribute('aria-pressed',String(option.status==='Done'||option.status==='Skipped'));mark.disabled=locked();row.append(control,mark);list.append(row);}else list.append(control);
      });
      if(!options.length)list.append(node('p','Материалы пока не добавлены.','workspace-muted'));
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

  if(!liveMode){
    document.body.dataset.workspaceRole='teacher';
    if(entryNotice==='closed')toast('Занятие закрыто. Кабинет доступен — можно пригласить следующего ученика.');
  }
  initLiveSession().catch(error => {
    if(error.code==='GUEST_LINK_CLOSED'&&window.SpaceWhaleIsTeacher===true){returnToTeacherWorkspace('closed');return;}
    console.error('[Space Whale] Live Workspace connection failed', error);
    document.body.dataset.workspaceRole='connection-error';
    const status=document.getElementById('workspaceConnectionState');
    status.textContent=error.code==='GUEST_LINK_CLOSED'?'Занятие закрыто. Попросите преподавателя прислать новую ссылку.':'Не удалось подключиться к занятию. Проверьте соединение и повторите попытку.';
    const actions=node('div','','workspace-dialog-actions');
    actions.append(button('Повторить подключение',()=>location.reload(),'workspace-dialog-button'));
    if(window.SpaceWhaleIsTeacher===true)actions.append(button('Вернуться в кабинет',()=>returnToTeacherWorkspace(),'workspace-dialog-button is-brand'));
    status.append(actions);
  });
})();
