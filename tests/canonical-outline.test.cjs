const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const kit = require('../exercise-kit.js');
const {courseOutline, createCatalog} = require('../workspace-catalog.js');

function loadedContent() {
  const window = {SpaceWhaleExerciseKit: kit};
  const context = vm.createContext({window});
  const html = fs.readFileSync(path.join(root, 'classroom.html'), 'utf8');
  const scripts = [...html.matchAll(/<script src="([^"?]+)(?:\?[^\"]*)?"/g)]
    .map(m => m[1]).filter(file => /^(template-gallery|lesson-draft-|course-content|whale1-content)/.test(file));
  for (const file of scripts) vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context);
  return JSON.parse(JSON.stringify({lessons:window.SpaceWhaleContent,templates:window.SpaceWhaleTemplates}));
}

test('all loaded A1 lessons follow the single outline, not content metadata', () => {
  const {lessons,templates} = loadedContent();
  const catalog = createCatalog(lessons,templates);
  let count = 0;
  for(const level of courseOutline.filter(level=>level.id.startsWith('A1.'))) {
    for(const module of level.whales) {
      const actual = catalog.topics({view:'library',level:level.id,whale:module.id});
      assert.deepEqual(actual.map(l=>l.title),module.topics);
      assert.deepEqual(actual.map(l=>l.lessonNumber),module.topics.map((_,i)=>i+1));
      count += actual.length;
    }
  }
  assert.equal(count,98);
  assert.equal(new Set(catalog.lessons.map(l=>l.id)).size,catalog.lessons.length);
  for(const source of lessons) {
    const actual = catalog.lessons.find(l=>l.id===source.id);
    assert.ok(actual,source.id);
    assert.deepEqual(actual.stages,source.stages,'Exercise content must remain intact: '+source.id);
  }
});

test('inserted number lessons cannot steal contacts, weather or review content',()=>{
  const {lessons,templates}=loadedContent();
  const catalog=createCatalog(lessons,templates);
  const first=catalog.topics({view:'library',level:'A1.1',whale:1});
  assert.equal(first.length,9);
  assert.equal(first[4].title,'Числа'); assert.equal(first[4].stages.length,0);
  assert.equal(first[5].title,'Десятки'); assert.equal(first[5].stages.length,0);
  for(const [index,id,title] of [[6,'a1-1-w1-l5','Контакты'],[7,'a1-1-w1-l6','Погода'],[8,'a1-1-w1-l7','Разговор · Повторение']]){
    assert.equal(first[index].id,id); assert.equal(first[index].title,title);
    assert.ok(first[index].stages.length);
    const route=catalog.normalize('?view=library&level=A1.1&whale=1&lesson='+id);
    assert.equal(route.lesson,id);
  }
});

test('stale content title and placement cannot override the canonical lesson',()=>{
  const {lessons,templates}=loadedContent();
  const source=lessons.find(l=>l.id==='a1-1-w1-l5');
  source.title='OLD TITLE'; source.level='A1.2'; source.whale=6;
  const actual=createCatalog(lessons,templates).lessons.find(l=>l.id===source.id);
  assert.equal(actual.title,'Контакты'); assert.equal(actual.level,'A1.1'); assert.equal(actual.whale,1);
});
