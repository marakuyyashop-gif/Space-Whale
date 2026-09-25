const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const kit = require('../exercise-kit.js');
const { createCatalog, levels } = require('../workspace-catalog.js');
const root = path.join(__dirname, '..');
const dataFiles = ['template-gallery.js', 'lesson-draft-first-day-school.js', 'lesson-draft-school-fair.js', 'course-content.js'];
function content() {
  const window = { SpaceWhaleExerciseKit: kit };
  const context = vm.createContext({ window });
  dataFiles.forEach(file => vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context));
  return JSON.parse(JSON.stringify({ lessons: window.SpaceWhaleContent, templates: window.SpaceWhaleTemplates }));
}

test('existing lessons and 31 templates load as data without page-specific DOM', () => {
  const { lessons, templates } = content();
  assert.equal(templates.length, 31);
  assert.deepEqual(lessons.map(lesson => lesson.id), ['first-day-school', 'school-fair', 'a1-2-w4-l1', 'a1-2-w4-l2']);
  lessons.forEach(lesson => lesson.stages.forEach(stage => kit.validate(stage.exercise)));
  assert.equal(lessons.find(lesson => lesson.id === 'school-fair').stages[0].exercise.id, 'fair-reading');
});

test('Whales are isolated by level; publishing a topic only needs content metadata', () => {
  assert.deepEqual(levels.map(level => [level.id, level.whales.length]), [['A1.1',7],['A1.2',7],['A2.1',8],['A2.2',8]]);
  const { lessons, templates } = content();
  lessons[0].level = 'A2.1'; lessons[0].whale = 5;
  const catalog = createCatalog(lessons, templates);
  const route = catalog.normalize('?view=library&level=A2.1&whale=5&lesson=first-day-school');
  assert.equal(catalog.topics(route)[0].id, 'first-day-school');
  assert.equal(route.exercise, lessons[0].stages[0].exercise.id);
  assert.ok(!catalog.topics({ ...route, level: 'A1.1' }).some(lesson => lesson.id === 'first-day-school'));
  const a11Whale5 = catalog.topics({ ...route, level: 'A1.1' });
  assert.equal(a11Whale5.length, 8);
  assert.ok(a11Whale5.every(lesson => lesson.outline));
  assert.deepEqual(catalog.topics({ ...route, whale: 4 }), []);
  assert.deepEqual(catalog.topics({view:'unassigned'}).map(lesson => lesson.id), ['school-fair']);
  assert.deepEqual(catalog.normalize(catalog.query(route)), route);
});

test('A1 course outline exposes real Whale names and catalog-only lesson titles', () => {
  const { lessons, templates } = content();
  const catalog = createCatalog(lessons, templates);
  assert.equal(levels.find(level => level.id === 'A1.1').whales[0].title, 'Whale 1 · Short Talk');
  assert.equal(levels.find(level => level.id === 'A1.2').whales[6].title, 'Whale 7 · Итоговое повторение A1');
  const a11w1 = catalog.topics({view:'library',level:'A1.1',whale:1});
  assert.deepEqual(a11w1.map(lesson => lesson.title), [
    'Как я рад встрече!','Рад знакомству','Как вас зовут?','Заполняем анкету','Давайте обменяемся контактами','Какая замечательная сегодня погода!','Знакомимся и обмениваемся информацией'
  ]);
  assert.ok(a11w1.every(lesson => lesson.outline && lesson.stages.length === 0));
  const a12w1 = catalog.topics({view:'library',level:'A1.2',whale:1});
  assert.equal(a12w1.length, 9);
  const route = catalog.normalize('?view=library&level=A1.1&whale=1&lesson=a1-1-w1-l1');
  assert.equal(route.lesson, 'a1-1-w1-l1');
  assert.equal(route.exercise, '');
});

test('A1.2 clothing lesson replaces its catalog outline with eight class stages and two self-study blocks', () => {
  const { lessons, templates } = content();
  const catalog = createCatalog(lessons, templates);
  const lesson = catalog.topics({view:'library',level:'A1.2',whale:4}).find(item => item.id === 'a1-2-w4-l1');
  assert.equal(lesson.title, 'Описываем одежду');
  assert.equal(lesson.outline, undefined);
  assert.equal(lesson.stages.filter(stage => (stage.section || 'tasks') === 'tasks').length, 8);
  assert.equal(lesson.stages.filter(stage => stage.section === 'self-study').length, 2);
  lesson.stages.forEach(stage => kit.validate(stage.exercise));
  assert.equal(lesson.stages[0].exercise.id, 'a12w4l1-opening');
  assert.equal(lesson.stages[7].exercise.id, 'a12w4l1-final-speaking');
});

test('A1.2 clothing appearance lesson replaces its second outline with nine class stages and two self-study blocks', () => {
  const { lessons, templates } = content();
  const catalog = createCatalog(lessons, templates);
  const lesson = catalog.topics({view:'library',level:'A1.2',whale:4}).find(item => item.id === 'a1-2-w4-l2');
  assert.equal(lesson.title, 'Описываем внешний вид одежды');
  assert.equal(lesson.outline, undefined);
  assert.equal(lesson.stages.filter(stage => (stage.section || 'tasks') === 'tasks').length, 9);
  assert.equal(lesson.stages.filter(stage => stage.section === 'self-study').length, 2);
  lesson.stages.forEach(stage => kit.validate(stage.exercise));
  assert.equal(lesson.stages[0].exercise.id, 'a12w4l2-opening');
  assert.equal(lesson.stages[8].exercise.id, 'a12w4l2-final-speaking');
});

test('stale or malformed deep links recover without selecting another course lesson', () => {
  const { lessons, templates } = content();
  const catalog = createCatalog(lessons, templates);
  const bad = catalog.normalize('?view=unknown&level=no&whale=999&lesson=missing&exercise=__proto__');
  assert.deepEqual(bad, {view:'library',level:'A1.1',whale:1,lesson:'',exercise:''});
  const valid = catalog.normalize('?view=unassigned&lesson=school-fair&exercise=gone');
  assert.equal(valid.exercise, 'fair-reading');
  const gallery = catalog.normalize('?view=templates&exercise=bank-demo');
  assert.equal(gallery.exercise, 'bank-demo');
  assert.throws(() => createCatalog([...lessons, lessons[0]], templates), /Duplicate/);
  assert.throws(() => createCatalog([{...lessons[0],level:'A1.1',whale:8}], templates), /placement/);
});

// A minimal DOM adapter exercises controller navigation/state, not browser layout or engine rendering.
class Element {
  constructor(tag) { this.tagName = tag; this.children = []; this.attrs = {}; this.listeners = {}; this.textContent = ''; this.hidden=false; this.style={}; }
  append(...children) { this.children.push(...children); }
  focus() {}
  removeAttribute(name) { delete this.attrs[name]; }
  getBoundingClientRect() { return {left:20,right:100,top:50,bottom:90,width:280,height:240}; }
  getAttribute(name) { return this.attrs[name] ?? null; }
  querySelectorAll(selector) {
    const name=selector.split(':')[0].slice(1),found=[];
    const visit=node=>{ for(const child of node.children||[]){if((child.className||'').split(' ').includes(name)&&(!selector.includes(':not([hidden])')||!child.hidden))found.push(child);visit(child);} };visit(this);return found;
  }
  replaceChildren(...children) { this.children = children; }
  setAttribute(name, value) { this.attrs[name] = value; }
  addEventListener(name, callback) { this.listeners[name] = callback; }
  click() { if(this.disabled)return; this.listeners.click?.({button:0,preventDefault(){}}); }
  change(value) { this.value = value; this.listeners.change(); }
}
function app(search = '', storage = new Map(), live = null, configure = () => {}) {
  const data = content();configure(data);
  const nodes = new Map();
  const mounts = [];
  const location = {search};
  const events = {};
  const setURL = (_state, _unused, url) => { location.search = new URL(url, 'https://example.com/Space-Whale/').search; };
  const sessionHeading = new Element('a');
  const body=new Element('body');nodes.set('body',body);
  const document = {
    body, addEventListener(){},
    getElementById(id) { if(!nodes.has(id)) nodes.set(id,new Element('div')); return nodes.get(id); },
    createElement(tag) {return new Element(tag);},
    querySelectorAll() { return []; },
    querySelector(selector) { return selector === '.workspace-session-heading a' ? sessionHeading : null; }
  };
  const window = {
    SpaceWhaleContent:data.lessons, SpaceWhaleTemplates:data.templates,
    SpaceWhaleCatalog:{createCatalog},
    SpaceWhaleExerciseKit:{mount(host, exercise, config) {
      kit.validate(exercise);
      const record={
        host,exercise,config,answers:config.answers || {},
        getAnswers(){return this.answers;},
        setAnswers(value){this.answers=value;this.remoteAnswers=value;},
        destroy(){this.destroyed=true;}
      };
      mounts.push(record); return record;
    }},
    SpaceWhaleCollaboration: live?.collaboration || null,
    SpaceWhaleClassroom: live?.classroom || null,
    innerWidth:1280,innerHeight:900,
    setInterval(){return 1;},clearInterval(){},
    addEventListener(name, cb) {events[name]=cb;}
  };
  vm.runInNewContext(fs.readFileSync(path.join(root,'workspace.js'),'utf8'), {
    window, document, location, URLSearchParams,
    history:{pushState:setURL,replaceState:setURL},
    sessionStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)}
  });
  return {nodes,mounts,location,events,storage,sessionHeading};
}
function descendants(el) { return el.children.flatMap(child => [child, ...descendants(child)]); }
function anchors(app) { const visit=el=>el.hidden?[]:el.children.flatMap(child=>[...(child.tagName==='a'&&(child.className||'').includes('workspace-stage-link')?[child]:[]),...visit(child)]); return visit(app.nodes.get('workspaceTopics')); }

function buttons(state) { return [...['workspaceTopics','workspaceCourseControls'].flatMap(id=>descendants(state.nodes.get(id))),...state.nodes.get('body').children.filter(el=>!el.hidden).flatMap(el=>descendants(el))].filter(el => el.tagName === 'button'); }

test('sidebar accordions preserve active exercise and answers without inline guides', () => {
  const state = app('?view=unassigned&lesson=first-day-school');
  const first = state.mounts.at(-1);
  first.config.onChange({m1:'o5'});
  assert.equal(state.nodes.has('taskGuide'),false);
  assert.equal(state.nodes.get('workspaceTopics').querySelectorAll('.workspace-guide').length,0);
  buttons(state).find(el => el.textContent === 'Первый день в новой школе').click();
  assert.equal(anchors(state).length, 0);
  assert.equal(state.mounts.length, 1);
  buttons(state).find(el => el.textContent === 'Первый день в новой школе').click();
  anchors(state).find(el => el.textContent === 'Words in context').click();
  assert.ok(first.destroyed);
  assert.equal(state.mounts.at(-1).host, first.host);
  anchors(state).find(el => el.textContent === 'Match the parts').click();
  assert.deepEqual(state.mounts.at(-1).config.answers, {m1:'o5'});
  const restored = app(state.location.search, state.storage);
  assert.equal(JSON.stringify(restored.mounts.at(-1).config.answers), '{"m1":"o5"}');
  restored.mounts.at(-1).config.onChange({});
  assert.equal(JSON.stringify(app(restored.location.search, restored.storage).mounts.at(-1).config.answers), '{}');
});

test('compact course controls keep whole-Whale selection and restore it after reload', () => {
  const state=app();
  assert.equal(state.nodes.get('libraryTab').attrs['aria-pressed'],'true');
  assert.ok(buttons(state).some(b=>b.textContent==='A1.1'));
  assert.ok(buttons(state).some(b=>b.textContent==='W 1'));
  assert.equal(state.nodes.get('workspaceClockPanel').hidden,false);
  assert.equal(state.nodes.get('workspaceTopics').querySelectorAll('.workspace-level-toggle').length,0);
  buttons(state).find(b=>b.textContent==='Как я рад встрече!').click();
  assert.equal(state.mounts.length,0);
  assert.ok(!buttons(state).some(b=>b.textContent==='Tasks'));
  buttons(state).find(b=>b.attrs['aria-label']==='Добавить в класс: A1.1 · Whale 1 · Short Talk').click();
  state.nodes.get('classTab').click();
  const titles=buttons(state).map(b=>b.textContent);
  assert.ok(titles.includes('Какая замечательная сегодня погода!'));
  assert.ok(!titles.includes('Описываем одежду'));
  assert.equal(state.nodes.get('workspaceClockPanel').hidden,false);
  const restored=app(state.location.search,state.storage);
  assert.ok(buttons(restored).some(b=>b.textContent==='Рад знакомству'));
  buttons(restored).find(b=>b.attrs['aria-label']==='Убрать из класса: A1.1 · Whale 1 · Short Talk').click();
  assert.ok(!buttons(restored).some(b=>b.textContent==='Рад знакомству'));
  restored.nodes.get('libraryTab').click();
  assert.ok(buttons(restored).some(b=>b.textContent==='Рад знакомству'));
});

test('Class retains a standalone lesson and timer is independent of exercise and navigation', () => {
  const state=app('?view=unassigned&lesson=school-fair');
  buttons(state).find(b=>b.attrs['aria-label']==='Добавить в класс: Готовим школьную ярмарку').click();
  state.nodes.get('classTab').click();
  assert.equal(state.mounts.at(-1).exercise.id,'fair-reading');
  const mount=state.mounts.at(-1);
  state.nodes.get('startLesson').click();
  assert.equal(state.nodes.get('startLesson').attrs['aria-pressed'],'true');
  state.nodes.get('libraryTab').click();
  assert.equal(state.mounts.at(-1),mount);
  const restored=app(state.location.search,state.storage);
  assert.equal(restored.nodes.get('startLesson').attrs['aria-pressed'],'true');
  restored.nodes.get('workspaceTimerReset').click();
  assert.equal(restored.nodes.get('workspaceClockTime').textContent,'60:00');
  assert.equal(restored.nodes.get('startLesson').attrs['aria-pressed'],'false');
  restored.nodes.get('classTab').click();
  buttons(restored).find(b=>b.attrs['aria-label']==='Убрать из класса: Готовим школьную ярмарку').click();
  assert.equal(anchors(restored).length,0);
  assert.ok(restored.mounts.at(-1).destroyed);
});

test('new sidebar tabs normalize one or several exercises without mutating lesson source',()=>{
  const {lessons,templates}=content();
  const original=lessons[0];
  const multi={...original,id:'sequence-lesson',stages:[{id:'sequence-tab',menu:'Practice',exercises:original.stages.slice(0,2).map(s=>s.exercise)}]};
  const catalog=createCatalog([multi],templates);
  const sequence=catalog.lessons.find(l=>l.id==='sequence-lesson').stages[0].exercise;
  kit.validate(sequence);
  assert.equal(sequence.progressive,true);
  assert.equal(sequence.exercises.length,2);
  assert.equal(multi.stages[0].exercise,undefined);
  assert.equal(catalog.normalize('?view=unassigned&lesson=sequence-lesson').exercise,'sequence-tab');
});

test('compact stage links and Back/Forward restore selection in the same workspace', () => {
  const state = app('?view=unassigned&lesson=school-fair');
  const before = state.location.search;
  anchors(state)[1].click();
  assert.notEqual(state.location.search,before);
  assert.notEqual(state.mounts.at(-1).exercise.id,'fair-reading');
  state.location.search = before; state.events.popstate();
  assert.equal(state.mounts.at(-1).exercise.id, 'fair-reading');
  assert.ok(anchors(state).every(el => el.href.startsWith('classroom.html?')));
  const key = 'space-whale:workspace:v1:templates:matching-demo';
  state.storage.set(key, JSON.stringify({signature:'old exercise', answers:{m1:'o1'}}));
  assert.equal(JSON.stringify(app('?view=templates', state.storage).mounts.at(-1).config.answers), '{}');
});

test('all former standalone lesson routes point into the canonical Workspace', () => {
  for (const file of ['template-gallery.html','lesson-draft-first-day-school.html','lesson-draft-school-fair.html','library.html']) {
    const html = fs.readFileSync(path.join(root,file),'utf8');
    assert.match(html, /location.replace\('classroom.html/);
    assert.doesNotMatch(html, /<script src=/);
  }
  const html = fs.readFileSync(path.join(root,'classroom.html'),'utf8');
  for(const match of html.matchAll(/(?:src|href)="([^"?#]+)(?:[^\"]*)"/g)) {
    if(!match[1].startsWith('http')) assert.ok(fs.existsSync(path.join(root,match[1])), match[1]);
  }
  assert.doesNotMatch(html, /classroom-session.html.*location.search/);
  assert.match(html, /classroom-realtime\.js/);
  assert.match(html, /supabase-client\.js/);
  assert.match(fs.readFileSync(path.join(root,'index.html'),'utf8'), /href="classroom.html"/);
});


test('unified live Workspace streams drafts, applies remote answers and keeps teacher navigation authoritative', async () => {
  const makeLive = role => {
    const handlers = {};
    const calls = [];
    const channel = {presenceState: () => ({teacher:[{role:'teacher'}],student:[{role:'student'}]})};
    const classroom = {
      state: {channel},
      async getCurrentUser() { return {id: role === 'teacher' ? 'teacher-1' : 'student-1'}; },
      async connect(_sessionId, nextHandlers) { Object.assign(handlers, nextHandlers); this.state.channel = channel; return {role,session:{id:'session-1'}}; },
      async loadSharedState() { return {current_page_id:null,current_exercise_id:null}; },
      async loadExerciseResponse() { return null; },
      async requestExerciseState(exerciseId) { calls.push(['request',exerciseId]); },
      async sendExerciseSnapshot(exerciseId, answers) { calls.push(['snapshot',exerciseId,answers]); },
      async sendExerciseDraft(exerciseId, answers) { calls.push(['draft',exerciseId,answers]); },
      async navigate(exerciseId, page) { calls.push(['navigate',exerciseId,page]); }
    };
    return {classroom,handlers,calls};
  };
  const flush = () => new Promise(resolve => setImmediate(resolve));

  const teacherLive = makeLive('teacher');
  const teacher = app('?session=session-1&view=unassigned&lesson=school-fair&exercise=fair-typed-gaps&panel=library&section=tasks', new Map(), teacherLive);
  await flush(); await flush();
  const teacherMount = teacher.mounts.at(-1);
  assert.equal(teacherMount.config.readOnly, false);
  teacherLive.handlers.onExerciseDraft({exercise_id:'fair-typed-gaps',response:{a1:'invitations'},source_id:'student-tab',seq:1});
  assert.deepEqual(teacherMount.remoteAnswers, {a1:'invitations'});
  assert.ok(teacher.location.search.includes('session=session-1'));
  assert.ok(teacherLive.calls.some(call => call[0] === 'navigate'));

  const studentLive = makeLive('student');
  const student = app('?session=session-1&view=unassigned&lesson=school-fair&exercise=fair-typed-gaps&panel=library&section=tasks', new Map(), studentLive);
  await flush(); await flush();
  const studentMount = student.mounts.at(-1);
  assert.equal(student.nodes.get('startLesson').disabled, true);
  studentMount.config.onChange({a1:'i'});
  await flush();
  assert.deepEqual(studentLive.calls.find(call => call[0] === 'draft'), ['draft','fair-typed-gaps',{a1:'i'}]);

  studentLive.handlers.onNavigate({
    current_page_id:'?view=unassigned&lesson=school-fair&exercise=fair-bank-gaps&panel=class&section=tasks',
    current_exercise_id:'fair-bank-gaps'
  });
  assert.ok(student.location.search.includes('exercise=fair-bank-gaps'));
  assert.ok(student.location.search.includes('session=session-1'));
  assert.equal(student.mounts.at(-1).exercise.id, 'fair-bank-gaps');
});


test('temporary guest Workspace limits the room to the two allowed lessons and keeps live sync', async () => {
  const flush = () => new Promise(resolve => setImmediate(resolve));
  const makeGuest = role => {
    const handlers = {};
    const calls = [];
    const channel = {presenceState: () => ({teacher:[{role:'teacher'}],student:[{role:'student'}]})};
    const classroom = {
      state: {channel},
      async connectGuest(_token, nextHandlers) {
        Object.assign(handlers, nextHandlers);
        return {
          role,
          session:{
            id:'guest:test',
            allowed_lesson_ids:['a1-2-w4-l1','a1-2-w4-l2'],
            guest:true
          }
        };
      },
      async loadSharedState() { return {current_page_id:null,current_exercise_id:null}; },
      async loadExerciseResponse() { return null; },
      async requestExerciseState(exerciseId) { calls.push(['request',exerciseId]); },
      async sendExerciseSnapshot(exerciseId, answers) { calls.push(['snapshot',exerciseId,answers]); },
      async sendExerciseDraft(exerciseId, answers) { calls.push(['draft',exerciseId,answers]); },
      async navigate(exerciseId, page) { calls.push(['navigate',exerciseId,page]); }
    };
    return {classroom,handlers,calls};
  };

  const token = 'guest-token';
  const teacherLive = makeGuest('teacher');
  const teacher = app(`?guest=${token}&view=library&level=A1.2&whale=4&lesson=a1-2-w4-l1&exercise=a12w4l1-opening&panel=library&section=tasks`, new Map(), teacherLive);
  await flush(); await flush();
  assert.ok(!buttons(teacher).some(b=>b.className==='workspace-add'));
  const topicLabels = buttons(teacher).map(button => button.textContent);
  assert.ok(topicLabels.includes('Описываем одежду'));
  assert.ok(topicLabels.includes('Описываем внешний вид одежды'));
  assert.ok(!topicLabels.includes('Объясняем свой выбор'));
  assert.ok(teacher.location.search.includes('guest=guest-token'));

  const studentLive = makeGuest('student');
  const student = app(`?guest=${token}&view=library&level=A1.2&whale=4&lesson=a1-2-w4-l1&exercise=a12w4l1-words&panel=library&section=tasks`, new Map(), studentLive);
  await flush(); await flush();
  const studentMount = student.mounts.at(-1);
  studentMount.config.onChange({pw1:'bright'});
  await flush();
  assert.deepEqual(studentLive.calls.find(call => call[0] === 'draft'), ['draft','a12w4l1-words',{pw1:'bright'}]);

  studentLive.handlers.onNavigate({
    current_page_id:`?guest=${token}&view=library&level=A1.2&whale=4&lesson=a1-2-w4-l2&exercise=a12w4l2-opening&panel=library&section=tasks`,
    current_exercise_id:'a12w4l2-opening'
  });
  assert.ok(student.location.search.includes('lesson=a1-2-w4-l2'));
  assert.equal(student.mounts.at(-1).exercise.id, 'a12w4l2-opening');
});


test('empty guest room supports both editors, teacher navigation and restored shared state', async () => {
  const flush = () => new Promise(resolve => setImmediate(resolve));
  const collaboration = require('../collaboration-state.js');
  const peers = [];
  const saved = new Map();
  let shared = {current_page_id:null,current_exercise_id:null};
  function participant(role) {
    const handlers = {};
    const peer = {role, handlers}; peers.push(peer);
    const send = (exercise_id, response) => {
      peers.filter(p => p !== peer).forEach(p => p.handlers.onExerciseDraft?.({exercise_id,response}));
    };
    return {collaboration, handlers, classroom:{
      state:{clientId:role,channel:{presenceState:()=>({})}},
      async connectGuest(token, incoming) { Object.assign(handlers,incoming);return {role,session:{id:'guest:test',guest:true,allowed_lesson_ids:['*']}}; },
      async loadSharedState(){return shared;},
      async loadExerciseResponse(id){return saved.has(id) ? {response:saved.get(id)} : null;},
      queueGuestSnapshot(id,response){saved.set(id,response);},
      async requestExerciseState(exercise_id){peers.filter(p=>p!==peer).forEach(p=>p.handlers.onStateRequest?.({exercise_id}));},
      async sendExerciseDraft(id,response){send(id,response);},
      async sendExerciseSnapshot(id,response){send(id,response);},
      async navigate(id,page){assert.equal(role,'teacher');shared={current_page_id:page,current_exercise_id:id};peers.filter(p=>p!==peer).forEach(p=>p.handlers.onNavigate?.(shared));}
    }};
  }
  const teacherLive=participant('teacher');
  const teacher=app('?guest=test',new Map(),teacherLive);
  await flush();await flush();
  const studentLive=participant('student');
  const student=app('?guest=test',new Map(),studentLive);
  await flush();await flush();
  assert.equal(teacher.mounts.length,0);
  assert.equal(student.mounts.length,0);
  assert.equal(teacher.nodes.get('startLesson').disabled,false);
  assert.equal(student.nodes.get('startLesson').disabled,true);
  buttons(teacher).find(b=>b.attrs['aria-label']==='Выбрать уровень').click();
  buttons(teacher).find(b=>b.textContent==='A1.2').click();
  buttons(teacher).find(b=>b.attrs['aria-label']==='Выбрать Whale').click();
  buttons(teacher).find(b=>b.textContent==='Whale 4 · Описываем и объясняем выбор').click();
  buttons(teacher).find(b=>b.attrs['aria-label']==='Добавить в класс: A1.2 · Whale 4 · Описываем и объясняем выбор').click();
  await flush();
  student.nodes.get('classTab').click();
  assert.ok(buttons(student).some(b=>b.textContent==='Описываем одежду'));
  assert.ok(!buttons(student).some(b=>b.textContent==='Как я рад встрече!'));
  student.nodes.get('libraryTab').click();
  buttons(teacher).find(b=>b.textContent==='Описываем одежду').click();
  buttons(teacher).find(b=>b.textContent==='Описываем одежду').click();
  anchors(teacher).find(a=>a.textContent==='Words').click();
  await flush();await flush();
  assert.equal(student.mounts.at(-1).exercise.id,teacher.mounts.at(-1).exercise.id);
  assert.equal(student.mounts.at(-1).config.readOnly,false);
  assert.equal(teacher.mounts.at(-1).config.syncChecks,true);
  teacher.mounts.at(-1).config.onChange({pw1:'bright'});
  assert.equal(student.mounts.at(-1).answers.pw1,'bright');
  student.mounts.at(-1).config.onChange({pw1:'bright',pw2:'dark',__sw_checked:true});
  assert.equal(teacher.mounts.at(-1).answers.pw2,'dark');
  assert.equal(teacher.mounts.at(-1).answers.__sw_checked,true);
  const before=student.location.search;
  buttons(student).find(b=>b.textContent==='Описываем внешний вид одежды').click();
  assert.equal(student.location.search,before);
  const server=collaboration.create('server');
  server.merge(saved.get(teacher.mounts.at(-1).exercise.id));
  server.update({...server.answers(),pw3:'warm'});
  saved.set(teacher.mounts.at(-1).exercise.id,server.snapshot());
  await teacherLive.handlers.onReconnect();
  assert.equal(teacher.mounts.at(-1).answers.pw3,'warm');
  assert.equal(student.mounts.at(-1).answers.pw3,'warm');
  teacher.mounts.at(-1).config.onChange({});
  assert.equal(JSON.stringify(student.mounts.at(-1).answers),'{}');
});


test('one compact lesson list retains materials from every former section',()=>{
  const state=app('?view=unassigned&lesson=first-day-school',new Map(),null,data=>{
    const lesson=data.lessons.find(item=>item.id==='first-day-school');lesson.stages[0].section='language';lesson.stages[1].section='self-study';
  });
  assert.ok(state.location.search.includes('section=language'));
  const links=anchors(state);assert.ok(links.some(link=>link.href.includes('section=self-study')));
  links.find(link=>link.href.includes('section=self-study')).click();
  assert.ok(state.location.search.includes('section=self-study'));assert.ok(state.mounts.at(-1).exercise);
  assert.equal(state.nodes.get('workspaceTopics').querySelectorAll('.workspace-topic-tabs').length,0);
  assert.equal(state.nodes.get('workspaceTopics').querySelectorAll('.workspace-guide').length,0);
  assert.equal(anchors(state).filter(link=>link.getAttribute('aria-current')==='page').length,1);
  assert.ok(buttons(state).some(button=>button.getAttribute('aria-label')==='Об уроке: Первый день в новой школе'));
});


test('selectors isolate a single Whale, expose templates and keep the clock visible',()=>{
  const state=app();
  assert.equal(state.nodes.get('workspaceClockPanel').hidden,false);
  assert.equal(buttons(state).filter(b=>b.className==='workspace-topic-toggle').length,7);
  buttons(state).find(b=>b.attrs['aria-label']==='Выбрать уровень').click();
  buttons(state).find(b=>b.textContent==='A1.2').click();
  assert.equal(new URLSearchParams(state.location.search).get('level'),'A1.2');
  buttons(state).find(b=>b.attrs['aria-label']==='Выбрать Whale').click();
  buttons(state).find(b=>b.textContent==='Whale 4 · Описываем и объясняем выбор').click();
  assert.ok(buttons(state).some(b=>b.textContent==='Описываем одежду'));
  assert.ok(!buttons(state).some(b=>b.textContent==='Как я рад встрече!'));
  buttons(state).find(b=>b.textContent==='Описываем внешний вид одежды').click();
  assert.equal(state.nodes.get('workspaceTopics').querySelectorAll('.workspace-topic-body:not([hidden])').length,1);
  buttons(state).find(b=>b.attrs['aria-label']==='Выбрать уровень').click();
  buttons(state).find(b=>b.textContent==='Шаблоны упражнений').click();
  assert.equal(anchors(state).length,31);
  assert.equal(state.nodes.get('workspaceClockPanel').hidden,false);
});
