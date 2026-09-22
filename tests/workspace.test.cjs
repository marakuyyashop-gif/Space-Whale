const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const kit = require('../exercise-kit.js');
const { createCatalog, levels } = require('../workspace-catalog.js');
const root = path.join(__dirname, '..');
const dataFiles = ['template-gallery.js', 'lesson-draft-first-day-school.js', 'lesson-draft-school-fair.js'];
function content() {
  const window = { SpaceWhaleExerciseKit: kit };
  const context = vm.createContext({ window });
  dataFiles.forEach(file => vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context));
  return JSON.parse(JSON.stringify({ lessons: window.SpaceWhaleContent, templates: window.SpaceWhaleTemplates }));
}

test('existing lessons and 16 templates load as data without page-specific DOM', () => {
  const { lessons, templates } = content();
  assert.equal(templates.length, 16);
  assert.deepEqual(lessons.map(lesson => lesson.id), ['first-day-school', 'school-fair']);
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
function app(search = '', storage = new Map()) {
  const data = content();
  const nodes = new Map();
  const mounts = [];
  const location = {search};
  const events = {};
  const setURL = (_state, _unused, url) => { location.search = new URL(url, 'https://example.com/Space-Whale/').search; };
  const document = {getElementById(id) { if(!nodes.has(id)) nodes.set(id,new Element('div')); return nodes.get(id); }, createElement(tag) {return new Element(tag);} };
  const window = {
    SpaceWhaleContent:data.lessons, SpaceWhaleTemplates:data.templates,
    SpaceWhaleCatalog:{createCatalog},
    SpaceWhaleExerciseKit:{mount(host, exercise, config) {kit.validate(exercise); const record={host,exercise,config,destroy(){this.destroyed=true;}}; mounts.push(record); return record;}},
    addEventListener(name, cb) {events[name]=cb;}
  };
  vm.runInNewContext(fs.readFileSync(path.join(root,'workspace.js'),'utf8'), {
    window, document, location, URLSearchParams,
    history:{pushState:setURL,replaceState:setURL},
    sessionStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)}
  });
  return {nodes,mounts,location,events,storage};
}
function descendants(el) { return el.children.flatMap(child => [child, ...descendants(child)]); }
function anchors(app) { return descendants(app.nodes.get('workspaceTopics')).filter(el => el.tagName === 'a'); }

test('lesson/template switches reuse one host, destroy previous mount, and preserve answers', () => {
  const state = app('?view=unassigned&lesson=first-day-school');
  const first = state.mounts.at(-1);
  first.config.onChange({m1:'o5'});
  anchors(state).find(el => el.textContent.startsWith('2.')).click();
  assert.ok(first.destroyed);
  assert.equal(state.mounts.at(-1).host, first.host);
  anchors(state).find(el => el.textContent.startsWith('1.')).click();
  assert.deepEqual(state.mounts.at(-1).config.answers, {m1:'o5'});
  state.nodes.get('templatesTab').click();
  assert.equal(anchors(state).length, 16);
  assert.equal(state.mounts.at(-1).exercise.id, 'matching-demo');
  state.nodes.get('libraryTab').click();
  assert.equal(state.mounts.at(-1).exercise.id, first.exercise.id);
  const restored = app(state.location.search, state.storage);
  assert.equal(JSON.stringify(restored.mounts.at(-1).config.answers), '{"m1":"o5"}');
  restored.mounts.at(-1).config.onChange({});
  assert.equal(JSON.stringify(app(restored.location.search, restored.storage).mounts.at(-1).config.answers), '{}');
});

test('level/Whale selection, history and content changes do not leak answers', () => {
  const state = app('?view=unassigned&lesson=school-fair');
  state.nodes.get('workspaceLevel').change('A2.2');
  assert.equal(state.nodes.get('workspaceWhale').children.length, 8);
  state.nodes.get('workspaceWhale').change('8');
  assert.ok(state.location.search.includes('whale=8'));
  assert.ok(state.mounts.at(-1).destroyed);
  state.location.search = '?view=unassigned&lesson=school-fair'; state.events.popstate();
  assert.equal(state.mounts.at(-1).exercise.id, 'fair-reading');
  state.nodes.get('templatesTab').click();
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
  assert.match(html, /classroom-session.html.*location.search/);
  assert.match(fs.readFileSync(path.join(root,'index.html'),'utf8'), /href="classroom.html"/);
});
