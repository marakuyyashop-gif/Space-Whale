const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {parseHTML} = require('linkedom');

const root = path.join(__dirname, '..');
const copy = value => JSON.parse(JSON.stringify(value));
const scriptsIn = page => [...fs.readFileSync(path.join(root, page), 'utf8').matchAll(/<script src="([^"?]+)(?:\?[^\"]*)?"/g)].map(match => match[1]);
const framework = /^(exercise-template-(?:profiles|bindings)|exercise-templates|exercise-kit)\.js$/;
const content = /^(?:template-source-|template-gallery|lesson-draft-|course-content|whale1-content|homework-a21|lesson-structure(?:-content)?\.|lesson-teacher-info\.|teacher-copy\.|workspace-catalog\.)/;
function pipeline(page, includeCourse = false) {
  const window = {};
  const context = vm.createContext({window, URL, URLSearchParams, console, setTimeout, clearTimeout});
  const files = scriptsIn(page).filter(file => framework.test(file) || includeCourse && content.test(file));
  for (const file of files) vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, {filename:file});
  return {window, files, kit:window.SpaceWhaleExerciseKit, registry:window.SpaceWhaleExerciseTemplates};
}
const classroom = pipeline('classroom.html', true);
const kit = classroom.kit;
const registry = classroom.registry;
const source = classroom.window.SpaceWhaleTemplates;
const catalog = classroom.window.SpaceWhaleCatalog.createCatalog(classroom.window.SpaceWhaleContent, source);
const stages = catalog.lessons.flatMap(lesson => lesson.stages.map(stage => stage.exercise));
function definitions(def) {
  return [def, ...(def.exercises || []).flatMap(block => definitions(block.exercise)),
    ...(def.blocks || []).filter(block => block.type === 'exercise').flatMap(block => definitions(block.exercise))];
}
const all = stages.flatMap(definitions);
function mount(definition, config = {}, engine = kit) {
  const {document, window} = parseHTML('<html><body><main></main></body></html>');
  const create = document.createElement.bind(document);
  document.createElement = tag => {
    const element = create(tag);
    if (tag === 'audio') {
      element.paused = true; element.currentTime = 0; element.duration = 3;
      element.pause = () => {element.paused = true;};
      element.play = async () => {element.paused = false;};
    }
    if (tag === 'dialog') {
      element.showModal = () => {element.open = true;};
      element.close = () => {element.open = false;};
    }
    return element;
  };
  const host = document.querySelector('main');
  const handle = engine.mount(host, definition, config);
  return {host, handle, document, window};
}
// Visual profiles may change these attributes. Everything else, including nested
// stage layout/progression, must remain identical to authored lesson data.
function contentSignature(definition) {
  const def = copy(definition);
  for (const entry of definitions(def)) {
    for (const name of ['templateCode','templatePart','templateRole','answerSize','transformationArrow','numbered']) delete entry[name];
    if (entry.kind !== 'stage') delete entry.layout;
  }
  return JSON.stringify(def);
}

test('editing one template profile updates its catalog and existing lesson through the same mount path', () => {
  const sample = source.find(def => def.code === 'E03');
  const lesson = all.find(def => def.kind === 'gaps' && registry.resolve(def).templateCode === 'E03' && def.layout !== 'picture-rows');
  assert.ok(lesson, 'An existing course dropdown is bound to E03');
  const untouched = source.find(def => def.code === 'W01');
  const before = [sample, lesson, untouched].map(def => JSON.stringify(def));
  const unrelatedProfile = copy(registry.profileFor('W01','matching'));
  for (const def of [sample, lesson]) {
    const view = mount(def);
    assert.equal(view.host.classList.contains('ek-flat-controls'), true);
    assert.equal(view.host.getAttribute('data-template-code'), 'E03');
    view.handle.destroy();
  }
  const restore = registry.configure('E03', {flatControls:false, layout:'paragraph'});
  try {
    for (const def of [sample, lesson]) {
      const view = mount(def);
      assert.equal(view.host.classList.contains('ek-flat-controls'), false);
      assert.ok(view.host.querySelector('.ek-paragraph'));
      assert.equal(registry.resolve(def).layout, 'paragraph');
      view.handle.destroy();
    }
    assert.deepEqual(copy(registry.profileFor('W01','matching')), unrelatedProfile);
    const other = mount(untouched);
    assert.ok(other.host.querySelector('.ek-picture-word-grid'));
    assert.equal(other.host.classList.contains('ek-flat-controls'), false);
    other.handle.destroy();
  } finally {restore();}
  assert.deepEqual([sample, lesson, untouched].map(def => JSON.stringify(def)), before);
  const restored = mount(lesson);
  assert.equal(restored.host.classList.contains('ek-flat-controls'), true);
  restored.handle.destroy();
});

test('all 79 approved catalog entries resolve, validate and mount without replacing their data', () => {
  assert.equal(source.length,79);
  assert.equal(new Set(source.map(def => def.code)).size,79);
  for (const sample of source) {
    const before = JSON.stringify(sample);
    const resolved = registry.resolve(sample);
    assert.equal(resolved.templateCode, sample.code);
    assert.equal(contentSignature(resolved), contentSignature(sample), sample.code);
    assert.doesNotThrow(() => kit.validate(resolved), sample.code);
    const view = mount(sample);
    assert.equal(view.host.getAttribute('data-template-code'), sample.code);
    assert.ok(view.host.querySelector('.ek-body'), sample.code);
    view.handle.destroy();
    assert.equal(JSON.stringify(sample),before,sample.code+' authored data is immutable');
  }
});

test('every composed course stage mounts through the registry with stable content, media, keys and progression', t => {
  assert.ok(catalog.lessons.length >= 100);
  assert.ok(stages.length > 100);
  let resolvedExercises = 0;
  for (const stage of stages) {
    const before = JSON.stringify(stage);
    const resolved = registry.resolve(stage);
    assert.equal(contentSignature(resolved), contentSignature(stage), stage.id);
    assert.doesNotThrow(() => kit.validate(resolved),stage.id);
    for (const original of definitions(stage)) {
      if (!['stage','presentation','audio','rule-page'].includes(original.kind)) {
        const binding=registry.bindingFor(original.id);
        assert.ok(original.templateCode || binding?.templateCode,original.id+' requires an explicit template identity; inference is only a snapshot fallback');
      }
    }
    for (const def of definitions(resolved)) {
      if (!['stage','presentation','audio','rule-page'].includes(def.kind)) {
        assert.ok(registry.codes.includes(def.templateCode),def.id+' has a known template');
        assert.equal(registry.profileFor(def.templateCode,def.kind,def.templatePart).supported,true,def.id+' requires a compatible registered profile part');
        resolvedExercises++;
      }
    }
    const view = mount(stage);
    assert.equal(view.host.getAttribute('data-template-code'),resolved.templateCode || '');
    const initialState=copy(view.handle.getAnswers());
    view.handle.setAnswers(initialState);
    assert.deepEqual(copy(view.handle.getAnswers()),initialState,stage.id+' state round-trips unchanged');
    view.handle.destroy();
    assert.equal(JSON.stringify(stage),before,stage.id+' authored data is immutable');
  }
  assert.ok(resolvedExercises > 200);
  t.diagnostic(`${catalog.lessons.length} lessons, ${stages.length} composed stages, ${resolvedExercises} response components validated and mounted.`);
});

test('declared classroom and standalone homework load profiles, bindings and registry before the renderer', () => {
  const dependencies=['exercise-template-profiles.js','exercise-template-bindings.js','exercise-templates.js','exercise-kit.js'];
  for(const page of ['classroom.html','homework.html']) {
    const ordered=scriptsIn(page).filter(file=>framework.test(file));
    assert.deepEqual(ordered,dependencies,page);
  }
  const homework=pipeline('homework.html');
  assert.equal(homework.window.SpaceWhaleTemplates,undefined,'Homework does not depend on catalog fixtures');
  assert.equal(homework.registry.codes.length,79);
  const actual=all.find(def=>def.kind==='gaps' && registry.resolve(def).templateCode==='E03');
  const saved=copy(actual);
  const view=mount(saved,{},homework.kit);
  assert.equal(view.host.getAttribute('data-template-code'),'E03');
  assert.equal(view.host.classList.contains('ek-flat-controls'),true);
  assert.equal(contentSignature(homework.registry.resolve(saved)),contentSignature(actual));
  view.handle.destroy();
});

test('picture response rows and table associations retain their authored layout under shared profiles', () => {
  const rows=all.filter(def=>['picture-rows','table'].includes(def.layout));
  assert.ok(rows.some(def=>def.layout==='picture-rows'));
  const table=source.find(def=>def.code==='E05B');
  for(const original of [...rows,table]) {
    const resolved=registry.resolve(original);
    assert.equal(resolved.layout,original.layout,original.id);
    assert.deepEqual(copy(resolved.items),copy(original.items),original.id);
    if(original.tableColumns)assert.deepEqual(copy(resolved.tableColumns),copy(original.tableColumns));
  }
});

test('strict Speaking and legacy Speaking keep their content and disclosures while sharing template appearance', () => {
  const strict=source.find(def=>def.code==='S01');
  const strictView=mount(strict);
  assert.ok(strictView.host.querySelector('.ek-speaking-task'));
  assert.deepEqual(copy(registry.resolve(strict).task),copy(strict.task));
  strictView.handle.destroy();
  const legacy=all.find(def=>def.kind==='presentation' && def.layout!=='speaking' && registry.resolve(def).templateRole==='speaking' && def.blocks.some(block=>block.type==='disclosure'));
  assert.ok(legacy,'An existing Speaking uses the lossless legacy adapter');
  const before=JSON.stringify(legacy),resolved=registry.resolve(legacy);
  assert.equal(resolved.layout,legacy.layout);
  assert.deepEqual(copy(resolved.blocks),copy(legacy.blocks));
  const view=mount(legacy);
  assert.equal(view.host.querySelectorAll('.ek-speaking-legacy-block').length,legacy.blocks.length);
  assert.equal(view.host.querySelectorAll('details').length,legacy.blocks.filter(block=>block.type==='disclosure').length);
  for(const block of legacy.blocks.filter(block=>block.type==='disclosure')) {
    const detail=[...view.host.querySelectorAll('details')].find(node=>node.textContent.includes(block.text));
    assert.ok(detail,'The original disclosure content remains available');
    if(block.open===false)assert.equal(Boolean(detail.open),false);
  }
  assert.equal(JSON.stringify(legacy),before);
  view.handle.destroy();
});

test('profiles reject unknown codes and content or pedagogical replacements', () => {
  assert.throws(()=>registry.resolve({...copy(source[0]),templateCode:'W99'}),/Unknown exercise template/);
  assert.throws(()=>registry.configure('W99',{}),/Unknown exercise template/);
  for(const field of ['id','kind','title','items','options','blocks','audio','image','inputMode','multiple','responseMode','progressive','revealStops','transcriptAfter','requireCheckBeforeNext','showAuthoredSamples']) {
    assert.throws(()=>registry.configure('E03',{[field]:'replacement'}),/cannot replace/,field);
  }
  const mechanics=all.filter(def=>def.progressive || def.multiple || def.responseMode || def.transcriptAfter || def.revealStops);
  assert.ok(mechanics.length>20);
  for(const def of mechanics) {
    const resolved=registry.resolve(def);
    for(const field of ['inputMode','multiple','responseMode','progressive','progressiveQuestions','revealStops','requireCheckBeforeNext','transcriptAfter','transcriptGate','showAuthoredSamples','revealPossibleAnswers'])
      assert.equal(JSON.stringify(resolved[field]),JSON.stringify(def[field]),def.id+': '+field);
  }
});


test('old standalone homework dropdowns with unknown IDs preserve their authored interaction and checked answers', () => {
  const homework=pipeline('homework.html');
  for (const numbered of [false,true]) {
    const saved={version:1,id:'unknown-saved-dropdown-'+numbered,kind:'choice',layout:'dropdown',numbered,
      title:'Choose the answer.',items:[{id:'original-question',prompt:'An original saved question.',
        options:[{id:'saved-a',text:'First saved option'},{id:'saved-b',text:'Second saved option'}],correctId:'saved-b'}]};
    assert.equal(homework.registry.bindingFor(saved.id),null,'The saved snapshot predates the binding manifest');
    const snapshot=JSON.stringify(saved),answers={'original-question':'saved-b',__sw_checked:true};
    const resolved=homework.registry.resolve(saved);
    assert.equal(resolved.layout,'dropdown');
    assert.deepEqual(copy(resolved.items),saved.items);
    const view=mount(saved,{answers,syncChecks:true},homework.kit);
    assert.ok(view.host.querySelector('.ek-choice-trigger'));
    assert.equal(view.host.querySelectorAll('fieldset').length,0,'A saved dropdown never becomes a radio question');
    assert.deepEqual(copy(view.handle.getAnswers()),answers);
    assert.equal(view.host.querySelector('.ek-choice-trigger').getAttribute('data-feedback'),'correct');
    assert.equal(JSON.stringify(saved),snapshot);
    view.handle.destroy();
  }
});
