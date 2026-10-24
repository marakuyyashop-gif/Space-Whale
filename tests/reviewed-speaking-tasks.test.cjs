const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {parseHTML} = require('linkedom');
const kit = require('../exercise-kit.js');
const {createCatalog} = require('../workspace-catalog.js');
const root = path.join(__dirname, '..');
const importFile = 'course-content-speaking-tasks.js';
const copy = value => JSON.parse(JSON.stringify(value));
const targetIds = [
  ...[1,2,3,4,5,6,7,8].map(n => 'a1-2-w1-l' + n),
  ...[1,2,3,4,5].map(n => 'a1-2-w2-l' + n),
  ...[1,2,3,4].map(n => 'a1-2-w5-l' + n),
  ...[1,2,3].map(n => 'a2-1-w1-l' + n),
  ...[1,2,3].map(n => 'a2-1-w2-l' + n),
  ...[1,2,3,4].map(n => 'a2-1-w3-l' + n)
];
function load() {
  const app = {SpaceWhaleExerciseKit:kit}, context = vm.createContext({window:app});
  let before;
  const scripts = [...fs.readFileSync(path.join(root, 'classroom.html'), 'utf8')
    .matchAll(/<script src="([^"?]+)(?:\?[^\"]*)?"/g)].map(m => m[1])
    .filter(file => /^(template-source-|template-gallery|lesson-draft-|course-content|whale1-content|homework-a21)/.test(file));
  for (const file of scripts) {
    if (file === importFile) before = copy(app.SpaceWhaleContent);
    vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, {filename:file});
  }
  return {app, context, before};
}
const loaded = load();
const catalog = createCatalog(copy(loaded.app.SpaceWhaleContent), []);
const lessons = targetIds.map(id => catalog.lessons.find(lesson => lesson.id === id));

test('all 27 reviewed tasks resolve to the final Speaking block at their original course positions', () => {
  assert.equal(lessons.length, 27);
  for (const lesson of lessons) {
    assert.ok(lesson, 'Every supplied lesson exists');
    assert.equal(lesson.contentVersion, 'reviewed-final-speaking-2026-10-24');
    assert.equal(lesson.lessonNumber, Number(lesson.id.match(/-l(\d+)$/)[1]));
    const final = lesson.stages.filter(stage => stage.role === 'final');
    assert.equal(final.length, 1, lesson.id);
    assert.deepEqual(lesson.blocks.find(block => block.id === 'final').stageIds, [final[0].exercise.id]);
    const route = catalog.normalize(new URLSearchParams({view:'library', level:lesson.level,
      whale:String(lesson.whale), lesson:lesson.id, block:'final'}));
    assert.equal(route.lesson, lesson.id);
    assert.equal(route.exercise, final[0].exercise.id);
    assert.deepEqual(catalog.normalize(catalog.query(route)), route);
    if (!['a1-2-w5-l1','a1-2-w5-l4'].includes(lesson.id)) {
      assert.equal(lesson.stages.length, 1);
      assert.equal(lesson.blocks.find(block => block.id === 'opening').stageIds.length, 0);
    }
  }
  assert.equal(lessons.find(l => l.id === 'a1-2-w1-l5').title, 'Ванная');
  assert.equal(lessons.find(l => l.id === 'a1-2-w5-l4').title, 'Обычно и сейчас');
  assert.equal(catalog.levels.find(l => l.id === 'A2.1').whales[2].title, 'Module 3. Учёба');
});

test('import preserves opening tasks, all other lesson stages and existing exercise identities', () => {
  for (const before of loaded.before) {
    const after = loaded.app.SpaceWhaleContent.find(lesson => lesson.id === before.id);
    if (!targetIds.includes(before.id)) {
      assert.deepEqual(copy(after), before, before.id);
      continue;
    }
    const finalId = before.id === 'a1-2-w5-l1' ? 'L1-M10' : 'A1M5L4_FINAL';
    assert.deepEqual(copy(after.stages.filter(stage => stage.exercise.id !== finalId)),
      before.stages.filter(stage => stage.exercise.id !== finalId), before.id);
    assert.equal(after.stages.filter(stage => stage.exercise.id === finalId).length, 1);
  }
  const current = JSON.stringify(loaded.app.SpaceWhaleContent);
  vm.runInContext(fs.readFileSync(path.join(root, importFile), 'utf8'), loaded.context);
  assert.equal(JSON.stringify(loaded.app.SpaceWhaleContent), current, 'Reloading the import cannot duplicate tasks');
  assert.deepEqual(copy(loaded.app.SpaceWhaleContent.find(l => l.id === 'a1-2-w5-l5')),
    loaded.before.find(l => l.id === 'a1-2-w5-l5'), 'Excluded L5 stays untouched');
});

test('every authored step uses shared templates without word banks, visual briefs or fabricated media', () => {
  for (const lesson of lessons) {
    const definition = lesson.stages.find(stage => stage.role === 'final').exercise;
    kit.validate(definition);
    const steps = definition.kind === 'stage' ? definition.exercises.map(block => block.exercise) : [definition];
    for (const step of steps) {
      const {document} = parseHTML('<html><body><main></main></body></html>');
      const host = document.querySelector('main');
      const handle = kit.mount(host, step);
      assert.equal(host.querySelector('img, audio, input, textarea, button, details'), null, step.id);
      assert.doesNotMatch(host.textContent, /🟠|Изображение:|Слова:|не показывать ученику|Target language|\[Image\]|\+ V-ing/);
      if (step.layout === 'speaking') {
        assert.equal(host.getAttribute('data-template-code'), step.templateCode);
        assert.ok(step.use.every(group => !group.words?.length));
        assert.equal(host.querySelector('.ek-speaking-image').hidden, true);
        assert.equal(host.querySelector('.ek-speaking-task').textContent,
          step.task.text + (step.task.bullets || []).join(''));
        assert.deepEqual([...host.querySelectorAll('.ek-speaking-phrases')].map(p => p.textContent), step.use.flatMap(group => group.phrases));
      } else {
        assert.equal(step.templateCode, 'Q01');
        assert.equal(lesson.id, 'a1-2-w5-l4', 'Only the supplied free-time question has no language scaffold');
      }
      handle.destroy();
    }
  }
});

test('follow-up tasks reveal through the shared teacher arrow and synchronize with the learner', () => {
  for (const lesson of lessons) {
    const definition = lesson.stages.find(stage => stage.role === 'final').exercise;
    if (definition.kind !== 'stage') continue;
    const {document, window} = parseHTML('<html><body><main></main><aside></aside></body></html>');
    const host = document.querySelector('main'), peer = document.querySelector('aside');
    const learner = kit.mount(peer, definition, {navigationReadOnly:true});
    const teacher = kit.mount(host, definition, {onViewChange:state => learner.setViewState(state)});
    assert.equal(teacher.getViewState().revealed, 1, lesson.id);
    for (let n = 1; n < definition.exercises.length; n++) {
      const arrow = [...host.querySelectorAll('[aria-label="Show next exercise"]')].find(el => !el.disabled);
      assert.ok(arrow, lesson.id);
      arrow.dispatchEvent(new window.Event('click', {bubbles:true}));
      assert.equal(teacher.getViewState().revealed, n + 1);
      assert.equal(learner.getViewState().revealed, n + 1);
    }
    teacher.destroy(); learner.destroy();
  }
});
