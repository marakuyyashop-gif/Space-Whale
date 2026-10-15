(() => {
  'use strict';

  const kit = window.SpaceWhaleExerciseKit;
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
  const notice = document.getElementById('workspaceNotice');
  document.getElementById('workspaceNoticeClose')?.addEventListener('click',()=>{notice.textContent='';clearTimeout(noticeTimer);});
  document.getElementById('lessonAudioDismiss')?.addEventListener('click',()=>{document.getElementById('lessonAudioEnable').hidden=true;});
  document.getElementById('mediaStatusClose')?.addEventListener('click',()=>{document.getElementById('mediaStatus').hidden=true;});
  let noticeTimer;
  function toast(text){notice.textContent=text;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>{notice.textContent='';},4500);}

  const scroll = document.getElementById('workspaceScroll');
  const start = document.getElementById('startLesson');
  const sessionHeading = document.querySelector('.workspace-session-heading a');

  const sidebar=document.getElementById('workspaceSidebar');
  let menuPanel=null;
  const menu=document.getElementById('workspaceMenuPanel');
  document.getElementById('workspaceMenuClose')?.addEventListener('click',()=>setMenuPanel(null,true));
  const themeToggle=document.getElementById('workspaceThemeToggle');
  themeToggle?.addEventListener('click',()=>{
    const dark=document.body.dataset.theme!=='dark';
    document.body.dataset.theme=dark?'dark':'light';
    themeToggle.setAttribute('aria-checked',String(dark));
  });

  const panels = ['class', 'library'];
  const sections = [['tasks', 'Tasks'], ['language', 'Language input'], ['self-study', 'Self study']];
  const attempts = new Map();
  const openBlockDetails = new Set();
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
    const resume=new URLSearchParams(normalizedSearch);if(resume.get('lesson')&&!resume.get('exercise')&&!resume.get('block')&&journeys[resume.get('lesson')]?.last)resume.set('exercise',journeys[resume.get('lesson')].last);
    const route = catalog.normalize('?'+resume);
    route.panel = panels.includes(params.get('panel')) ? params.get('panel') : params.get('panel') === 'self-study' ? 'class' : 'library';
    route.section = sections.some(([id]) => id === params.get('section')) ? params.get('section') : 'tasks';
    if (params.get('panel') === 'self-study') route.section = 'self-study';
    const lesson=catalog.topics(route).find(lesson=>lesson.id===route.lesson);
    const selected=lesson?.stages.find(stage=>stage.exercise.id===route.exercise);
    if(selected)route.section=stageSection(selected);
    if(lesson?.blocks)route.block=lesson.blocks.find(block=>block.stageIds.includes(route.exercise))?.id || route.block || 'opening';
    route.selection=params.get('selection')||(!hasCourseRoute?'none':'');
    if(['none','level','module'].includes(route.selection)){
      route.lesson='';route.exercise='';route.block='';
      if(route.selection!=='module')route.whale=0;
      if(route.selection==='none')route.level='';
    }
    try{route.exerciseView=JSON.parse(params.get('exercise_view')||'null');}catch(_){route.exerciseView=null;}
    const legacyIndex=selected?.exerciseAliases?.indexOf(params.get('exercise'))??-1;
    if(legacyIndex>=0)route.exerciseView={revealed:legacyIndex+1,children:{[selected.exerciseAliases[legacyIndex]]:route.exerciseView||{}}};
    return route;
  }

  let route = readRoute(location.search);
  const wordFocus=window.SpaceWhaleWordFocus?.create({root:host,actor:classroom?.state?.clientId||'local',storageKey:`space-whale:word-focus:${classScope}`,canShare:()=>liveMode&&liveReady&&!pupilWaiting(),send:payload=>classroom.broadcast('word_focus',payload)});
  const lessonAudio=window.SpaceWhaleLessonAudio?.create({root:host,enable:document.getElementById('lessonAudioEnable'),isLive:()=>liveMode&&liveReady&&!pupilWaiting(),canControl:()=>liveRole==='teacher',exerciseId:()=>route.exercise,now:()=>Date.now()+guestClockOffset,send:payload=>classroom.syncAudio(payload),requestState:()=>classroom.broadcast('audio_request',{source_id:classroom.state.clientId}).catch(()=>{}),notice:text=>{notice.textContent=text;}});

  function query(next) {
    const params = new URLSearchParams(catalog.query(next));
    params.set('panel', next.panel || 'library');
    params.set('section', next.section || 'tasks');
    if(next.exerciseView)params.set('exercise_view',JSON.stringify(next.exerciseView));
    if(next.selection)params.set('selection',next.selection);
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
        exercise: exerciseId,
        selection:''
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
    if(next.lesson!==route.lesson&&!next.exercise&&!options.remote)next={...next,block:'opening'};
    if(next.lesson&&!next.exercise&&!next.block){const saved=journeys[next.lesson];if(saved?.last)next={...next,exercise:saved.last};}
    if(next.exercise!==route.exercise&&!options.remote)next={...next,exerciseView:null};
    route = readRoute(query(next));
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
    return lesson.templateGroup || lesson.id === 'templates'
      ? {view:'templates'}
      : {view:lesson.level === null ? 'unassigned' : 'library',level:lesson.level || route.level,whale:lesson.whale || route.whale};
  }

  function stageSection(stage) { return stage.section || 'tasks'; }
  const classStages = lesson => (lesson?.stages || []).filter(stage => stageSection(stage) !== 'self-study');
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
  const locked = () => Boolean(liveMode && liveReady && liveRole === 'student');
  const permitted = lesson => !guestAllowedLessons || guestAllowedLessons.has(lesson.id);
  function hasClassLesson(lesson) { return Boolean(lesson && (classIds.has(lesson.id) || classWhales.has(whaleKey(lesson.level,lesson.whale)))); }
  function saveWhales() { try { sessionStorage.setItem(classKey,JSON.stringify([...classWhales])); } catch (_) {} saveClass(); }
  let dismissSidebarOverlays=()=>{};
  function saveJourney(){try{localStorage.setItem(journeyKey,JSON.stringify(journeys));}catch(_){} }
  function journey(lesson){
    const total=classStages(lesson).length;
    if(!lesson)return {count:0,total:0,current:-1,done:[]};
    const entry=journeys[lesson.id]||(journeys[lesson.id]={done:[],unmarked:[]});
    entry.done=(entry.done||[]).filter(id=>classStages(lesson).some(stage=>stage.exercise.id===id));
    entry.unmarked=entry.unmarked||[];
    const current=classStages(lesson).findIndex(item=>item.exercise.id===route.exercise);
    if(current>=0)entry.last=route.exercise;
    saveJourney();return {...entry,count:entry.done.length,total,current};
  }
  function stageLabel(stage){return [stage.navigationTitle,stage.menu,stage.title,stage.exercise?.title].find(value=>typeof value==='string'&&value.trim()&&!/[А-Яа-яЁё]/.test(value))||'Exercise';}

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
  function updateExerciseProgress(exercise,answers){
    liveAnswers.set(exercise.id,answers);
    if(answerProgress(exercise,answers)===1)completedMilestones.add(exercise.id);else completedMilestones.delete(exercise.id);
    try{sessionStorage.setItem(milestonesKey,JSON.stringify([...completedMilestones]));}catch(_){}

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
    tree.scrollTop=0;
    go({...next,lesson:lessons[0]?.id||'',exercise:'',section:'tasks'});
  }
  function setMenuPanel(name,restoreFocus=false){
    const previous=menuPanel;menuPanel=name;
    dismissSidebarOverlays();renderSidebar();
    if(restoreFocus){
      const owner=previous==='profile'?document.getElementById('workspaceProfileButton'):document.querySelector(`.selector-${previous==='levels'?'level':previous==='modules'?'module':'lesson'}`);
      owner?.focus?.();
    }
  }
  function chooseLesson(lesson){
    if(journeys[lesson.id])journeys[lesson.id].closed=false;saveJourney();
    go({...route,...lessonLocation(lesson),selection:'',lesson:lesson.id,exercise:'',exerciseView:null,block:'opening',section:'tasks'});
  }
  const moduleLabel = module => module.title.replace(/^Whale\s+(\d+)/i,'Module $1').replace(/^(Module\s+\d+)\s*·\s*/i,'$1. ');
  function renderSidebar(){
    dismissSidebarOverlays();tree.replaceChildren();
    const controls=document.getElementById('workspaceCourseControls'),blocks=document.getElementById('workspaceBlockControls');
    controls.replaceChildren();blocks.replaceChildren();
    const studentLocked=locked(),inClass=route.panel==='class';
    panels.forEach(panel=>document.getElementById(`${panel}Tab`).setAttribute('aria-pressed',String(route.panel===panel)));
    start.disabled=studentLocked;paintTimer();
    const levels=catalog.levels.filter(level=>!guestAllowedLessons||availableWhales(level).length);
    const level=levels.find(item=>item.id===route.level);
    const whales=level?availableWhales(level):[],whale=whales.find(item=>item.id===route.whale);
    const loose=catalog.lessons.filter(lesson=>lesson.level===null&&permitted(lesson)&&(!inClass||hasClassLesson(lesson)));
    const view=route.view==='templates'&&!inClass&&!guestAllowedLessons?'templates':route.view==='unassigned'?'unassigned':'library';
    const topics=view==='templates'?catalog.topics({view:'templates'}):view==='unassigned'?loose:whale?catalog.topics({view:'library',level:level.id,whale:whale.id}).filter(permitted):[];
    const lesson=selectedLesson(),lessonIndex=topics.findIndex(item=>item.id===lesson?.id);
    const selector=(label,title,name,size)=>{
      const control=button(label,()=>setMenuPanel(menuPanel===name?null:name),`workspace-rail-control workspace-console-selector selector-${size}`);
      control.disabled=studentLocked;control.setAttribute('aria-label',title);control.setAttribute('data-tooltip',title);
      control.setAttribute('aria-controls',menu.id);control.setAttribute('aria-expanded',String(menuPanel===name||(name==='lesson'&&menuPanel==='lesson-details')));controls.append(control);
    };
    selector(view==='templates'?'TPL':level?.id||'A','Level','levels','level');
    selector(view==='library'&&whale?`M${whale.id}`:'M','Module','modules','module');
    selector(lessonIndex>=0?`L${lessonIndex+1}`:'L','Lesson','lesson','lesson');
    if(lesson?.blocks&&route.section!=='self-study')lesson.blocks.forEach(block=>{
      const control=button('',()=>{
        if(journeys[lesson.id])journeys[lesson.id].closed=false;
        const stage=lesson.stages.find(stage=>block.stageIds.includes(stage.exercise.id));
        go({...route,block:block.id,exercise:stage?.exercise.id||'',exerciseView:null,section:stage?stageSection(stage):'tasks'});
      },'workspace-rail-control workspace-block-icon');
      control.dataset.block=block.id;control.disabled=studentLocked;
      control.setAttribute('aria-label',block.id==='opening'?'Opening Speaking':block.id==='final'?'Final Speaking':block.title);
      control.setAttribute('data-tooltip',block.title);
      if(route.block===block.id)control.setAttribute('aria-current','step');
      if(block.id==='words'||block.id==='language')control.append(node('span',block.id==='words'?'W':'G','workspace-rail-letter'));
      else control.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h12a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H9l-6 3V7a3 3 0 0 1 3-3Z"/><circle cx="8" cy="11" r=".65"/><circle cx="12" cy="11" r=".65"/><circle cx="16" cy="11" r=".65"/></svg>';
      blocks.append(control);
    });
    blocks.hidden=!blocks.childElementCount;
    blocks.previousElementSibling.hidden=blocks.hidden;
    menu.hidden=!menuPanel;menu.dataset.panel=menuPanel||'';
    document.querySelector('.workspace-sidebar-shell').dataset.panelOpen=String(Boolean(menuPanel));
    document.querySelector('.reference-app').classList.toggle('workspace-menu-open',Boolean(menuPanel));
    const profile=document.getElementById('workspaceStudentProfile'),profileButton=document.getElementById('workspaceProfileButton');
    profile.hidden=menuPanel!=='profile';tree.hidden=menuPanel==='profile';
    profileButton.setAttribute('aria-controls',menu.id);profileButton.setAttribute('aria-expanded',String(menuPanel==='profile'));
    const heading=document.getElementById('workspacePanelHeading');heading.replaceChildren();
    if(!menuPanel)return;
    if(menuPanel==='profile'){heading.append(node('h2','Learner profile','workspace-panel-title'));return;}
    if(menuPanel==='levels')heading.append(node('h2','Levels','workspace-panel-title'));
    else if(view!=='library'&&menuPanel!=='modules')heading.append(node('h2',view==='templates'?'Exercise templates':'Lessons','workspace-panel-title'));
    else{
      const path=node('nav','','workspace-course-path');path.setAttribute('aria-label','Course path');
      const separator=()=>path.append(node('span','/','workspace-path-separator'));
      if(level){
        const control=button(level.id,()=>setMenuPanel('levels'),'workspace-path-level');control.setAttribute('aria-label','Choose level');path.append(control);
      }
      if(menuPanel==='modules'){
        if(level)separator();const current=node('span','Modules','workspace-path-current');current.setAttribute('aria-current','page');path.append(current);
      }else if(whale){
        separator();const control=button(moduleLabel(whale),()=>setMenuPanel('modules'),'workspace-path-module');control.setAttribute('aria-label','Choose module');path.append(control);
      }else if(!level)path.append(node('span','Course','workspace-path-current'));
      if(menuPanel==='lesson-details'&&lesson){
        separator();const label=`Lesson ${lesson.lessonNumber||lessonIndex+1} · ${lesson.title}`;
        const control=button(label,()=>setMenuPanel('lesson'),'workspace-path-lesson');control.setAttribute('aria-label','Choose lesson');control.setAttribute('aria-current','page');path.append(control);
      }
      heading.append(path);
    }
    const teacher=window.SpaceWhaleLessonTeacherInfo;
    const copy=window.SpaceWhaleTeacherCopy;
    const option=(label,description,selected,action,href)=>{
      const control=href?node('a','','workspace-panel-option'):button('',action,'workspace-panel-option');
      if(href)control.href=href;else{control.disabled=studentLocked;control.setAttribute('aria-pressed',String(selected));}
      if(selected)control.classList.add('is-selected');
      control.append(node('strong',label));
      if(description){const details=node('span','','workspace-option-description');control.append(details);copy.appendDescription(details,description);}
      return control;
    };
    if(menuPanel==='levels'){
      const list=node('div','','workspace-panel-list');
      levels.forEach(item=>list.append(option(item.id,teacher?.levelOverview?.(item)||'',item.id===route.level,()=>{menuPanel='modules';go({...route,view:'library',selection:'level',level:item.id,whale:0,lesson:'',exercise:'',block:'',section:'tasks'});})));
      tree.append(list);
      if(loose.length)tree.append(option('Other lessons','',view==='unassigned',()=>chooseCollection({...route,view:'unassigned',selection:''})));
      if(!inClass&&!guestAllowedLessons){
        tree.append(option('Exercise templates','',view==='templates',()=>{menuPanel='lesson';chooseCollection({...route,view:'templates',selection:''});}));
        tree.append(option('Manage materials','',false,null,'library-manage.html'));
      }
      return;
    }
    if(menuPanel==='modules'){
      const list=node('div','','workspace-panel-list');
      whales.forEach(item=>{
        const lessons=catalog.topics({view:'library',level:level.id,whale:item.id}).filter(permitted);
        list.append(option(moduleLabel(item),teacher?.moduleOverview?.(level,item,lessons)||'',item.id===route.whale,()=>{menuPanel='lesson';go({...route,view:'library',selection:'module',level:level.id,whale:item.id,lesson:'',exercise:'',block:'',section:'tasks'});}));
      });
      if(!whales.length)list.append(node('p',level?'No modules available.':'Choose a level.','workspace-info-copy'));
      tree.append(list);return;
    }
    if(menuPanel==='lesson'){
      const list=node('div','','workspace-panel-list');
      topics.forEach((item,index)=>{
        const label=view==='templates'?item.title:`Lesson ${item.lessonNumber||index+1} · ${item.title}`;
        const card=option(label,teacher.lessonOverview(item),item.id===lesson?.id,()=>{menuPanel='lesson-details';chooseLesson(item);});
        card.dataset.lesson=item.id;list.append(card);
      });
      if(!topics.length)list.append(node('p',whale?'No lessons available.':'Choose a module.','workspace-info-copy'));
      tree.append(list);return;
    }
    if(!lesson)return;
    const overview=node('section','','workspace-lesson-overview');
    const label=view==='templates'?lesson.title:`Lesson ${lesson.lessonNumber||lessonIndex+1} · ${lesson.title}`;
    overview.append(node('h2',label,'workspace-lesson-title'));
    copy.appendDescription(overview,teacher.lessonOverview(lesson));
    tree.append(overview);
    if(lesson.blocks&&route.section!=='self-study')renderLessonBlocks(lesson,tree,studentLocked);
    else{
      const tasks=node('nav','','workspace-block-stages');tasks.setAttribute('aria-label','Exercises');
      lesson.stages.forEach(stage=>tasks.append(link(stageLabel(stage),{...route,exercise:stage.exercise.id,section:stageSection(stage)},route.exercise===stage.exercise.id,'workspace-stage-link')));tree.append(tasks);
    }
    const actions=node('div','','workspace-lesson-actions');
    const skip=button('Skip lesson',()=>{},'workspace-progress-skip'),reset=button('',()=>{},'workspace-progress-reset');
    skip.disabled=reset.disabled=true;reset.setAttribute('aria-label','Reset lesson');
    reset.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10a8 8 0 1 1 1 7M4 4v6h6"/></svg>';
    actions.append(skip,reset);tree.append(actions);
  }

  function renderLessonBlocks(lesson,parent,studentLocked){
    const structure=node('section','','workspace-lesson-blocks');structure.id='workspaceLessonBlocks';structure.setAttribute('aria-label','Lesson blocks');
    lesson.blocks.forEach(block=>{
      const active=route.block===block.id,key=`${lesson.id}:${block.id}`;
      const section=node('section','','workspace-lesson-block');section.dataset.block=block.id;
      const contents=node('div','','workspace-block-content');
      contents.id=`workspace-block-${block.id}`;contents.hidden=!openBlockDetails.has(key);
      const stages=lesson.stages.filter(stage=>block.stageIds.includes(stage.exercise.id));
      const select=button('',()=>{
        const stage=stages[0];go({...route,block:block.id,exercise:stage?.exercise.id||'',exerciseView:null,section:stage?stageSection(stage):'tasks'});
      },'workspace-block-select');
      select.disabled=studentLocked;select.setAttribute('aria-label',block.id==='opening'?'Opening Speaking':block.id==='final'?'Final Speaking':block.title);
      if(active)select.setAttribute('aria-current','step');select.append(node('strong',block.title));section.append(select);
      const aim=lesson.teacherInfo?.blockAims?.[block.id];
      if(aim){
        const detail=window.SpaceWhaleTeacherCopy.appendAim(select,aim,window.SpaceWhaleLessonTeacherInfo.lessonOverview(lesson).language);
        detail.id=`workspace-aim-${block.id}`;select.setAttribute('aria-describedby',detail.id);
      }
      if(stages.length){
        const toggle=button(contents.hidden?'+':'−',()=>{
          const open=contents.hidden;contents.hidden=!open;toggle.textContent=open?'−':'+';toggle.setAttribute('aria-expanded',String(open));
          if(open)openBlockDetails.add(key);else openBlockDetails.delete(key);
        },'workspace-block-expand');
        toggle.disabled=studentLocked;toggle.setAttribute('aria-controls',contents.id);toggle.setAttribute('aria-expanded',String(!contents.hidden));
        toggle.setAttribute('aria-label',`${block.title}: exercises`);section.append(toggle);
        const tasks=node('nav','','workspace-block-stages');tasks.setAttribute('aria-label',`${block.title}: exercises`);
        stages.forEach(stage=>tasks.append(link(stageLabel(stage),{...route,block:block.id,exercise:stage.exercise.id,section:stageSection(stage),exerciseView:null},route.exercise===stage.exercise.id,'workspace-stage-link')));
        contents.append(tasks);
      }
      section.append(contents);structure.append(section);
    });
    parent.append(structure);
  }

  function readAnswers(key, signature) {
    if (attempts.has(key)) return attempts.get(key);
    try {
      const saved = JSON.parse(sessionStorage.getItem(key));
      if ((saved?.signature === signature || window.SpaceWhaleLessonStructure?.compatible(saved?.signature,signature)) && saved.answers && typeof saved.answers === 'object') return saved.answers;
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
      if(activeExercise)updateExerciseProgress(activeExercise,response);
      if (mountedStorage) storeAnswers(mountedStorage.key, mountedStorage.signature, collaborative() ? replica(exerciseId).snapshot() : response);
    }
    return true;
  }

  function decodeStoredResponse(value){
    if(value?.__sw_collab===1&&window.SpaceWhaleCollaboration){const reader=window.SpaceWhaleCollaboration.create('lesson-restore');reader.merge(value);return reader.answers();}
    return value;
  }
  function loadSavedExercise(exerciseId){
    const stage=catalog.lessons.flatMap(l=>l.stages).find(s=>s.exercise.id===exerciseId);
    return stage?.legacySources&&window.SpaceWhaleLessonStructure
      ?window.SpaceWhaleLessonStructure.loadResponse(stage,id=>classroom.loadExerciseResponse(id),decodeStoredResponse)
      :classroom.loadExerciseResponse(exerciseId);
  }

  async function hydrateLiveExercise(exerciseId, localAnswers) {
    if (!liveMode || !liveReady || !exerciseId || liveHydrated.has(exerciseId)) return;
    liveHydrated.add(exerciseId);
    if(collaborative())classroom.requestExerciseState(exerciseId).catch(error=>console.error('[Space Whale] Peer state request failed',error));

    if (liveRole === 'teacher' || collaborative()) {
      try {
        const saved = await loadSavedExercise(exerciseId);
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
        const saved=await loadSavedExercise(exerciseId);
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
      wordFocus?.setExercise(null);
      mounted?.destroy?.();mounted=null;mountedKey='waiting';host.hidden=false;host.replaceChildren();
      if(liveReady){const waiting=node('section','','workspace-empty workspace-waiting');waiting.append(node('h1','Ждём начала занятия'),node('p','Вы подключились. Урок откроется автоматически, когда преподаватель нажмёт Start Lesson.'));host.append(waiting);}
      return;
    }
    const selected = selectedLesson();
    host.hidden=Boolean(selected&&journeys[selected.id]?.closed);
    const stage = selected?.stages.find(stage => stage.exercise.id === route.exercise && stageSection(stage) === route.section);
    const allowedSelected = !selected || !guestAllowedLessons || guestAllowedLessons.has(selected.id);
    const visible = allowedSelected && (route.panel !== 'class' || Boolean(liveMode && liveReady) || hasClassLesson(selected));
    wordFocus?.setExercise(stage&&visible&&!host.hidden?stage.exercise.id:null);
    const liveIdentity = sessionId
      ? `${sessionId}:${liveRole || 'connecting'}`
      : guestToken
        ? `guest:${guestToken.slice(0, 8)}:${liveRole || 'connecting'}`
        : 'standalone';
    const key = stage && visible ? `${liveIdentity}:${selected.id}:${stage.exercise.id}` : `${liveIdentity}:${route.view}:${route.panel}:${route.lesson}:${route.section}:${route.block||''}:empty`;

    if (key === mountedKey) return;
    mounted?.destroy(); mounted = null; mountedKey = key;
    host.replaceChildren(); scroll.scrollTop = 0;

    if (!stage || !visible) {
      const empty = node('section', '', 'workspace-empty');
      const block=visible&&route.section!=='self-study'?selected?.blocks?.find(block=>block.id===route.block):null;
      empty.append(node('h1', block?block.title:selected?.title || (liveRole === 'student' ? 'Ждём преподавателя' : 'Choose a lesson')));
      if(block||selected||liveRole==='student')empty.append(node('p', block?'No exercises yet.':selected ? 'No exercises in this section yet.' : 'Задание появится, когда преподаватель откроет его.'));
      host.append(empty); document.title = 'Space Whale — Learning Space'; return;
    }

    const exercise = stage.exercise;
    document.title = `${selected.title} — Space Whale`;
    const exerciseStorageKey = id => sessionId
      ? `space-whale:workspace:live:v1:${sessionId}:${selected.id}:${id}`
      : guestToken
        ? `space-whale:workspace:guest:v1:${guestToken.slice(0, 12)}:${selected.id}:${id}`
        : `space-whale:workspace:v1:${selected.id}:${id}`;
    const storageKey = exerciseStorageKey(exercise.id);
    const signature = JSON.stringify(exercise);
    const existingAnswers=readAnswers(storageKey, signature);
    const localAnswers=window.SpaceWhaleLessonStructure?.restore(stage,existingAnswers,source=>decodeStoredResponse(readAnswers(exerciseStorageKey(source.id),source.signature)))||existingAnswers;
    mountedStorage = {key:storageKey, signature};
    if (collaborative()) {
      const r=replica(exercise.id);
      if (localAnswers.__sw_collab === 1) r.merge(localAnswers);
      else if(stage.legacySources&&hasAnswers(localAnswers))r.update(localAnswers);
      liveAnswers.set(exercise.id,r.answers());
    }
    const initialAnswers = liveMode && (liveRole === 'teacher' || collaborative())
      ? (liveAnswers.get(exercise.id) || {})
      : localAnswers;

    const viewerRole = liveMode ? (liveReady ? liveRole : 'connecting') :
      (window.SpaceWhaleIsTeacher === true ? 'teacher' : 'student');
    const renderedExercise = window.SpaceWhaleLessonView?.(exercise, viewerRole) || exercise;
    mounted = kit.mount(host, renderedExercise, {
      syncDisclosures: selected.syncDisclosures === true,
      answers: initialAnswers,
      isMilestoneAttempted: id => {
        const target=selected.stages.find(stage=>stage.exercise.id===id)?.exercise;
        if(!target)return false;
        const state=liveAnswers.get(id)||readAnswers(exerciseStorageKey(id),JSON.stringify(target));
        const blocks=target.kind==='stage'?target.exercises.filter(block=>['matching','gaps','choice','order','sort','writing'].includes(block.exercise.kind)):[{id:null,exercise:target}];
        return blocks.length>0&&blocks.every(block=>{const answer=block.id?state[block.id]||{}:state,values=Object.values(kit.grade(block.exercise,answer));return answer.__sw_checked===true&&values.length>0&&!values.includes('empty');});
      },
      syncChecks: true,
      readOnly: false,
      audioReadOnly:false,
      navigationReadOnly:locked(),
      onSkip:()=>{if(locked())return;const stages=selectedLesson()?.stages||[],index=stages.findIndex(s=>s.exercise.id===exercise.id),next=stages[index+1];if(next)go({...route,exercise:next.exercise.id,exerciseView:null,section:stageSection(next)});},
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
        updateExerciseProgress(exercise,answers);
        if (liveMode && liveReady && (liveRole === 'student' || collaborative())) {
          classroom.sendExerciseDraft(exercise.id, response)
            .catch(error => { console.error('[Space Whale] Live answer sync failed', error); notice.textContent='Связь прервана. Ответы сохранены на этом устройстве; дождитесь подключения.'; });
        }
      }
    });

    // Author guidance remains in source data; never display teacher notes in lessons.

    mounted.setViewState?.(route.exerciseView,false);lessonAudio?.refresh();
    updateExerciseProgress(exercise,initialAnswers);
    hydrateLiveExercise(exercise.id, localAnswers);
  }

  function render() { renderSidebar(); renderContent(); renderExerciseNavigation(); }

  function renderExerciseNavigation(){
    const nav=document.getElementById('workspaceExerciseNavigation');if(!nav)return;
    nav.replaceChildren();nav.hidden=true;
    if(locked()||(guestToken&&(!liveReady||pupilWaiting())))return;
    const lesson=selectedLesson(),stages=lesson?visibleStages(lesson,route.section):[];
    const index=stages.findIndex(stage=>stage.exercise.id===route.exercise);
    if(index<0||stages.length<2)return;
    const add=(stage,label,direction)=>{
      if(!stage)return;
      const control=button('',()=>go({...route,exercise:stage.exercise.id,exerciseView:null,section:stageSection(stage)}),`ek-button ek-stage-toggle ek-stage-${direction}`);
      const arrow=node('span','','ek-stage-chevron');arrow.setAttribute('aria-hidden','true');control.append(arrow);
      control.setAttribute('aria-label',label);nav.append(control);
    };
    add(stages[index-1],'Previous exercise','up');add(stages[index+1],'Next exercise','down');
    nav.hidden=false;
  }

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
      onVideoView:payload=>{if(liveRole==='student'&&payload?.view==='mini')window.SpaceWhaleMedia?.setView('mini');},
      onAudio:payload=>lessonAudio?.receive(payload),
      onAudioRequest:()=>lessonAudio?.share(),
      onAudioReady:()=>lessonAudio?.reconnect(),
      onLessonState:applyGuestLessonState,
      onEnded:()=>{
        lessonAudio?.stop();void window.SpaceWhaleMedia?.stopMedia();
        if(managingInvitation&&liveRole==='teacher')return;
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
        wordFocus?.reconnect();lessonAudio?.reconnect();
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
      onWordFocus:payload=>wordFocus?.receive(payload),
      onWordFocusReady:()=>wordFocus?.reconnect(),
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
    wordFocus?.reconnect();lessonAudio?.reconnect();
    if(guestToken&&liveRole==='teacher')history.replaceState(null,'',`classroom.html${query(route)}`);
    document.body.dataset.workspaceRole=liveRole;
    sidebar.inert=liveRole==='student';
    // Preserve the UI snapshot: transport mutates its session before the callback.
    liveSession = {...result.session};
    if(guestToken)applyGuestLessonState(result.meta||{});
    connectLiveMedia();
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
    const wasWaiting=pupilWaiting(),wasStarted=Boolean(liveSession.started_at);
    liveSession.started_at=data.started_at||null;
    liveSession.duration_minutes=data.duration_minutes||60;
    liveSession.status=data.status||'waiting';
    const serverNow=Date.parse(data.server_now||'');
    if(Number.isFinite(serverNow))guestClockOffset=serverNow-Date.now();
    const startedAt=Date.parse(data.started_at||'');
    timer.startedAt=Number.isFinite(startedAt)?startedAt:null;timer.readyAt=timer.startedAt;timer.ended=false;saveTimer();
    if(Array.isArray(data.allowed_lesson_ids))guestAllowedLessons=data.allowed_lesson_ids.includes('*')?null:new Set(data.allowed_lesson_ids);
    paintTimer();
    if(liveReady&&!wasStarted&&liveSession.started_at)window.SpaceWhaleMedia?.lessonStarted?.('guest:'+guestToken.slice(0,8));
    if(liveReady&&wasWaiting&&!pupilWaiting()){
      mountedKey='';applyRemoteNavigation(data);render();
      connectLiveMedia();lessonAudio?.reconnect();
    }
  }
  function connectLiveMedia(){
    if(pupilWaiting())return;
    void window.SpaceWhaleMedia?.connect({sessionId:guestToken?'guest:'+guestToken.slice(0,8):sessionId,guestToken:guestToken||undefined,role:liveRole,guest:Boolean(guestToken),status:liveSession?.started_at?'live':liveSession?.status,onMinimize:()=>{if(liveReady&&liveRole==='teacher')classroom.broadcast('video_view',{view:'mini',source_id:classroom.state.clientId}).catch(()=>toast('Не удалось свернуть видео у ученика. Повторите после восстановления связи.'));}});
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
  document.getElementById('workspaceUtilityBar').prepend(studentTimer);
  const utilityBar=document.getElementById('workspaceUtilityBar');
  if(window.ResizeObserver)new ResizeObserver(()=>document.querySelector('.class-area').style.setProperty('--workspace-controls-clearance',(utilityBar.getBoundingClientRect().bottom-document.querySelector('.class-area').getBoundingClientRect().top+14)+'px')).observe(utilityBar);
  function paintTimer(){
    const state=timerState(),seconds=Math.ceil(state.remaining/1000),spent=state.duration-state.remaining,expired=state.active&&seconds===0;
    document.getElementById('workspaceClockTime').textContent=`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
    studentTimer.hidden=!(liveReady&&liveRole==='student'&&state.active&&!timer.ended);
    studentTimer.querySelector('.workspace-student-time').textContent=document.getElementById('workspaceClockTime').textContent;
    clockLabel.textContent=state.pre?'Until lesson':'';clockLabel.hidden=!state.pre;
    clock.hidden=!(state.active||state.pre)||timer.ended;
    clock.setAttribute('aria-valuemax',String(state.duration/60000));clock.setAttribute('aria-valuenow',String(spent/60000));clock.setAttribute('aria-valuetext',`${state.pre?'До урока: ':''}${Math.floor(seconds/60)} мин. ${seconds%60} сек.`);
    clock.dataset.started=String(state.active||state.pre);clock.dataset.phase=timer.ended?'closed':expired?'expired':state.active?'running':state.pre?'before':'ready';
    start.hidden=state.active&&!timer.ended;
    start.setAttribute('data-tooltip',timer.ended?'Lesson ended':state.waiting?'Waiting for learner':'Start lesson');
    start.disabled=locked()||(liveMode&&!state.canStart);
    start.setAttribute('aria-label',timer.ended?'Занятие завершено':state.waiting?'Ожидаем ученика':state.canStart?'Start Lesson':!liveMode?'Создать приглашение на занятие':scheduledStart()===null?'Сначала подключитесь к занятию':'Начать можно за 5 минут до занятия');
    stop.hidden=!state.active||timer.ended;stop.disabled=locked();
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
      const actions=node('div','','workspace-dialog-actions'),error=node('p','','workspace-device-status');error.setAttribute('role','status');
      const create=button('Создать и скопировать ссылку',async()=>{create.disabled=true;try{await createInvitation();}catch(e){error.textContent=e.message;create.disabled=false;}},'workspace-dialog-button is-brand');
      actions.append(button('Отмена',dialogClose,'workspace-dialog-button'),create);sessionDialog.append(actions,error);sessionDialog.showModal();return;
    }
    if(locked()||!timerState().canStart)return;
    prepareDialog('Начать занятие?');
    sessionDialog.append(node('p','Откроем материалы ученику и запустим общий таймер на 60 минут.'));
    const actions=node('div','','workspace-dialog-actions'),error=node('p','','workspace-device-status');error.setAttribute('role','status');
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
    const actions=node('div','','workspace-dialog-actions'),error=node('p','','workspace-device-status');error.setAttribute('role','status');
    const finish=button('Завершить',async()=>{
      finish.disabled=true;
      try{
        if(guestToken){await closeGuestRoom();return;}
        if(sessionId)await window.SpaceWhaleMedia.endSession({sessionId});
        if(classroom?.state?.channel)await classroom.disconnect();
        returnToTeacherWorkspace('closed');
      }catch(_){error.textContent='Не удалось подтвердить завершение связи. Повторите завершение.';finish.disabled=false;}
    },'workspace-dialog-button is-finish');
    actions.append(button('Продолжить',dialogClose,'workspace-dialog-button is-brand'),finish);sessionDialog.append(actions,error);sessionDialog.showModal();
  });
  tick();
  const profile=document.getElementById('workspaceStudentProfile'),profileButton=document.getElementById('workspaceProfileButton');
  async function renderHomeworkProfile(){
    profile.replaceChildren();
    const lesson=selectedLesson(),panel=node('div'),message=node('p','Загрузка…');
    panel.append(node('h2','Homework'),message);profile.append(panel);
    if(!lesson){message.textContent='Выберите урок.';return;}
    try{
      const {data:pack,error}=await window.spaceWhaleSupabase.rpc('homework_template',{p_lesson:lesson.id});
      if(error)throw error;
      if(!panel.isConnected)return;
      if(!pack){message.textContent='Домашка для этого урока пока не готова.';return;}
      message.textContent=pack.level;panel.append(node('h3',pack.title));
      const url=new URL('homework.html',location.href);url.searchParams.set('lesson',lesson.id);
      const preview=node('a','Посмотреть','workspace-dialog-button');preview.href=url.href+'&preview=1';preview.target='_blank';preview.rel='noopener';panel.append(preview);
      window.SpaceWhaleHomeworkLinks.mountIssuer(panel,{lesson:lesson.id,base:location.href,
        rpc:async(name,args)=>{const {data,error}=await window.spaceWhaleSupabase.rpc(name,args);if(error)throw error;return data;}});
    }catch(_){message.textContent='Не удалось загрузить домашку. Откройте Homework ещё раз.';}
  }
  profileButton.addEventListener('click',()=>{const open=menuPanel!=='profile';setMenuPanel(open?'profile':null);if(open)renderHomeworkProfile();});

  window.addEventListener('popstate', () => {
    if (liveMode && liveReady && liveRole === 'student') {
      history.replaceState(null, '', `classroom.html${query(route)}`);
      return;
    }
    restoreClassSelection(location.search);route = readRoute(location.search);
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
    lessonAudio?.stop();void window.SpaceWhaleMedia?.stopMedia();
    timer={startedAt:null,readyAt:null,ended:false};saveTimer();
    if(ticker!==null){clearInterval(ticker);ticker=null;}
    location.replace(teacherWorkspaceURL(reason));
  }
  let managingInvitation=false;
  async function closeGuestRoom(){
    managingInvitation=true;
    try{
      await classroom.flushPendingSnapshots?.();
      await revokeInvitation();
      await classroom.disconnect();
      returnToTeacherWorkspace('closed');
    }finally{managingInvitation=false;}
  }
  const invite = document.getElementById('inviteStudent');
  const invitationURL=token=>{const url=new URL('classroom.html',location.href);url.searchParams.set('guest',token);return url.href;};
  async function copyInvitation(url){
    try{await navigator.clipboard.writeText(url);toast('Ссылка скопирована');return true;}
    catch{toast('Браузер не разрешил копирование. Нажмите кнопку ссылки ещё раз.');return false;}
  }
  async function createInvitation(){
    managingInvitation=true;
    let data;
    try{data=await window.SpaceWhaleMedia.createInvitation();}
    catch(error){managingInvitation=false;throw error;}
    if(!data?.token){managingInvitation=false;throw new Error('Не удалось создать приглашение.');}
    // Clipboard permission can stall on mobile. It must not hold the new room open.
    let copyTimeout;
    const copied=await Promise.race([copyInvitation(invitationURL(data.token)),new Promise(resolve=>{copyTimeout=setTimeout(()=>resolve(false),800);})]);
    clearTimeout(copyTimeout);
    const nextRoute={...route,exercise:selectedLesson()?.stages[0]?.exercise.id||route.exercise};
    const joined=new URL('classroom.html'+query(nextRoute),location.href);
    joined.searchParams.set('room',data.token);joined.searchParams.delete('guest');joined.searchParams.delete('session');joined.searchParams.delete('notice');
    joined.searchParams.delete('completed_stages');joined.searchParams.delete('exercise_view');
    joined.searchParams.set('share',copied?'copied':'1');
    location.href=joined.href;
  }
  async function revokeInvitation(){
    if(!guestToken)return;
    await window.SpaceWhaleMedia.endSession({guestToken});
  }
  if(invite){
    invite.hidden=false;
    invite.addEventListener('click',async()=>{
      if(locked())return;
      invite.disabled=true;invite.setAttribute('aria-busy','true');
      if(!guestToken&&!sessionId)toast('Создаём ссылку для нового ученика…');
      try{
        if(guestToken){await copyInvitation(invitationURL(guestToken));return;}
        if(sessionId){const url=new URL('classroom.html',location.href);url.searchParams.set('session',sessionId);await copyInvitation(url.href);return;}
        await createInvitation();
      }catch(error){toast(error.message||'Не удалось создать приглашение.');}
      finally{invite.disabled=false;invite.removeAttribute('aria-busy');}
    });
  }
  document.getElementById('newGuestLesson')?.addEventListener('click',()=>{
    if(locked())return;
    prepareDialog('Приглашение на занятие');
    sessionDialog.append(node('p','Новый ученик получит отдельную ссылку и пустые ответы. Прежние ссылки закроются. Ссылка действует 24 часа; её можно закрыть раньше.'));
    const actions=node('div','','workspace-dialog-actions'),error=node('p','','workspace-device-status');error.setAttribute('role','status');
    const create=button('Новый ученик',async()=>{create.disabled=true;close.disabled=true;create.textContent='Создаём ссылку…';create.setAttribute('aria-busy','true');error.textContent='Закрываем прежнюю ссылку и готовим новую.';try{await createInvitation();}catch(e){error.textContent=e.message;create.textContent='Новый ученик';create.removeAttribute('aria-busy');create.disabled=false;close.disabled=!guestToken;}},'workspace-dialog-button is-brand');
    const close=button('Закрыть текущую ссылку',async()=>{close.disabled=true;create.disabled=true;try{await closeGuestRoom();}catch(e){error.textContent=e.message;close.disabled=false;create.disabled=false;}},'workspace-dialog-button');
    close.disabled=!guestToken;
    actions.append(create,close);sessionDialog.append(actions,error);sessionDialog.showModal();
  });
  function setupSidebarOverlays(){
    if(!document.body?.append||!document.addEventListener)return;
    const tooltip=node('div','','workspace-floating workspace-control-tooltip');tooltip.id='workspaceControlTooltip';tooltip.setAttribute('role','tooltip');
    tooltip.setAttribute('popover','manual');tooltip.hidden=true;document.body.append(tooltip);
    let owner=null;
    const close=()=>{if(owner)owner.removeAttribute('aria-describedby');owner=null;if(tooltip.hidePopover&&tooltip.matches(':popover-open'))tooltip.hidePopover();tooltip.hidden=true;};
    const place=()=>{
      if(!owner?.getBoundingClientRect)return;
      const rect=owner.getBoundingClientRect(),box=tooltip.getBoundingClientRect(),margin=8;
      tooltip.style.left=`${Math.max(margin,Math.min(rect.right+10,window.innerWidth-box.width-margin))}px`;
      tooltip.style.top=`${Math.max(margin,Math.min(rect.top+(rect.height-box.height)/2,window.innerHeight-box.height-margin))}px`;
    };
    const enter=event=>{
      const next=event.target?.closest?.('.workspace-rail [data-tooltip]');if(!next||next.disabled)return;
      if(owner===next)return;close();owner=next;tooltip.textContent=owner.getAttribute('data-tooltip');tooltip.hidden=false;owner.setAttribute('aria-describedby',tooltip.id);
      if(tooltip.showPopover&&!tooltip.matches(':popover-open'))tooltip.showPopover();place();
    };
    const leave=event=>{if(owner&&!owner.contains(event.relatedTarget))close();};
    dismissSidebarOverlays=close;
    document.addEventListener('pointerover',enter);document.addEventListener('focusin',enter);
    document.addEventListener('pointerout',leave);document.addEventListener('focusout',leave);
    document.addEventListener('pointerdown',event=>{
      close();if(menuPanel&&!menu.contains(event.target)&&!sidebar.contains(event.target))setMenuPanel(null);
    });
    document.addEventListener('keydown',event=>{if(event.key==='Escape'){close();if(menuPanel)setMenuPanel(null,true);}});
    document.addEventListener('scroll',close,true);window.addEventListener('resize',close);
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
