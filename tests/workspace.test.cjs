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

test('existing lessons and 16 templates load as data without page-specific DOM', () => {
  const { lessons, templates } = content();
  assert.equal(templates.length, 16);
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
  constructor(tag) { this.tagName = tag; this.children = []; this.attrs = {}; this.listeners = {}; this.textContent = ''; }
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children = children; }
  setAttribute(name, value) { this.attrs[name] = value; }
  addEventListener(name, callback) { this.listeners[name] = callback; }
  click() { this.listeners.click?.({button:0,preventDefault(){}}); }
  change(value) { this.value = value; this.listeners.change(); }
}
function app(search = '', storage = new Map(), live = null) {
  const data = content();
  const nodes = new Map();
  const mounts = [];
  const location = {search};
  const events = {};
  const setURL = (_state, _unused, url) => { location.search = new URL(url, 'https://example.com/Space-Whale/').search; };
  const sessionHeading = new Element('a');
  const document = {
    getElementById(id) { if(!nodes.has(id)) nodes.set(id,new Element('div')); return nodes.get(id); },
    createElement(tag) {return new Element(tag);},
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
    SpaceWhaleClassroom: live?.classroom || null,
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
function anchors(app) { return descendants(app.nodes.get('workspaceTopics')).filter(el => el.tagName === 'a'); }

function buttons(state) { return descendants(state.nodes.get('workspaceTopics')).filter(el => el.tagName === 'button'); }

test('sidebar accordions and guides do not remount an active exercise or lose answers', () => {
  const state = app('?view=unassigned&lesson=first-day-school');
  const first = state.mounts.at(-1);
  first.config.onChange({m1:'o5'});
  state.nodes.get('taskGuide').click();
  assert.equal(state.mounts.length, 1);
  assert.equal(state.nodes.get('taskGuide').attrs['aria-pressed'], 'false');
  buttons(state).find(el => el.textContent === 'Первый день в новой школе').click();
  assert.equal(anchors(state).length, 0);
  assert.equal(state.mounts.length, 1);
  buttons(state).find(el => el.textContent === 'Первый день в новой школе').click();
  anchors(state).find(el => el.textContent === 'Stage 2').click();
  assert.ok(first.destroyed);
  assert.equal(state.mounts.at(-1).host, first.host);
  anchors(state).find(el => el.textContent === 'Stage 1').click();
  assert.deepEqual(state.mounts.at(-1).config.answers, {m1:'o5'});
  const restored = app(state.location.search, state.storage);
  assert.equal(JSON.stringify(restored.mounts.at(-1).config.answers), '{"m1":"o5"}');
  restored.mounts.at(-1).config.onChange({});
  assert.equal(JSON.stringify(app(restored.location.search, restored.storage).mounts.at(-1).config.answers), '{}');
});

test('combined dropdown uses actual catalog titles; outlines expand without fake exercises', () => {
  const state = app();
  assert.equal(state.nodes.get('libraryTab').attrs['aria-pressed'], 'true');
  const groups = state.nodes.get('workspaceCourse').children;
  assert.equal(groups[0].label, 'A1.1');
  assert.equal(groups[0].children.length, 7);
  assert.match(groups[0].children[0].textContent, /Short Talk/);
  buttons(state).find(el => el.textContent === 'Как я рад встрече!').click();
  assert.equal(state.mounts.length, 0);
  assert.ok(buttons(state).find(el => el.textContent === 'Tasks'));
  state.nodes.get('workspaceCourse').change('A2.2|8');
  assert.ok(state.location.search.includes('whale=8'));
  state.nodes.get('workspaceCourse').change('templates');
  assert.equal(anchors(state).length, 16);
  assert.equal(state.mounts.at(-1).exercise.id, 'matching-demo');
  assert.equal(state.nodes.get('startLesson').disabled, true);
  state.nodes.get('self-studyTab').click();
  assert.equal(anchors(state).length, 0);
  assert.ok(state.mounts.at(-1).destroyed);
});

test('Add to class and Start lesson keep local selection; empty Self Study is explicit', () => {
  const state = app('?view=unassigned&lesson=school-fair');
  buttons(state).find(el => el.textContent === 'Add to class').click();
  assert.ok(buttons(state).find(el => el.textContent === 'Added ✓'));
  state.nodes.get('classTab').click();
  assert.equal(state.nodes.get('classTab').attrs['aria-pressed'], 'true');
  assert.ok(buttons(state).find(el => el.textContent === 'Готовим школьную ярмарку'));
  assert.equal(state.mounts.at(-1).exercise.id, 'fair-reading');
  state.nodes.get('self-studyTab').click();
  assert.equal(anchors(state).length, 0);
  assert.ok(state.mounts.at(-1).destroyed);
  state.nodes.get('libraryTab').click();
  state.nodes.get('startLesson').click();
  assert.equal(state.nodes.get('classTab').attrs['aria-pressed'], 'true');
  const restored = app(state.location.search, state.storage);
  assert.ok(buttons(restored).find(el => el.textContent === 'Added ✓'));
  buttons(restored).find(el => el.textContent === 'Added ✓').click();
  assert.equal(anchors(restored).length, 0);
  assert.ok(restored.mounts.at(-1).destroyed);
});

test('topic tabs and Back/Forward restore selection without moving learning content to another page', () => {
  const state = app('?view=unassigned&lesson=school-fair');
  const before = state.location.search;
  buttons(state).find(el => el.textContent === 'Language input').click();
  assert.ok(state.location.search.includes('section=language'));
  assert.equal(anchors(state).length, 0);
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
  assert.equal(student.nodes.get('workspaceCourse').disabled, true);
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
  assert.equal(teacher.nodes.get('workspaceCourse').disabled, true);
  const topicLabels = buttons(teacher).map(button => button.textContent);
  assert.ok(topicLabels.includes('Описываем одежду'));
  assert.ok(topicLabels.includes('Описываем внешний вид одежды'));
  assert.ok(!topicLabels.includes('Объясняем свой выбор'));
  assert.ok(teacher.location.search.includes('guest=guest-token'));

  const studentLive = makeGuest('student');
  const student = app(`?guest=${token}&view=library&level=A1.2&whale=4&lesson=a1-2-w4-l1&exercise=a12w4l1-picture-word&panel=library&section=tasks`, new Map(), studentLive);
  await flush(); await flush();
  const studentMount = student.mounts.at(-1);
  studentMount.config.onChange({pw1:'bright'});
  await flush();
  assert.deepEqual(studentLive.calls.find(call => call[0] === 'draft'), ['draft','a12w4l1-picture-word',{pw1:'bright'}]);

  studentLive.handlers.onNavigate({
    current_page_id:`?guest=${token}&view=library&level=A1.2&whale=4&lesson=a1-2-w4-l2&exercise=a12w4l2-opening&panel=library&section=tasks`,
    current_exercise_id:'a12w4l2-opening'
  });
  assert.ok(student.location.search.includes('lesson=a1-2-w4-l2'));
  assert.equal(student.mounts.at(-1).exercise.id, 'a12w4l2-opening');
});
