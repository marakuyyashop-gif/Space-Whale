const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const kit = require('../exercise-kit.js');
function definitions(file, name, end) {
  const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  const start = source.indexOf(`  const ${name} = [`);
  return vm.runInNewContext(`(() => { ${source.slice(start, source.indexOf(end, start))} return ${name}; })()`);
}
test('factory fixtures and pilot stages remain valid', () => {
  const window = {SpaceWhaleExerciseKit:kit};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../template-gallery.js'),'utf8'), {window});
  const gallery = window.SpaceWhaleTemplateExamples;
  assert.equal(window.SpaceWhaleTemplates.length,21);
  window.SpaceWhaleTemplates.forEach(def => kit.validate(def));
  assert.equal(gallery.length, 31);
  gallery.forEach(def => kit.validate(def));
  definitions('lesson-draft-first-day-school.js', 'stages', '  stages.forEach').forEach(stage => kit.validate(stage.exercise));
  assert.ok(gallery.some(def => def.kind === 'choice' && def.multiple));
  assert.ok(gallery.some(def => def.kind === 'stage' && def.progressive));
  assert.ok(gallery.some(def => def.kind === 'audio' && def.transcript));
  assert.equal(gallery.find(def => def.id === 'bank-demo').inputMode, 'text');
});
test('discovery dropdown grades option IDs and preserves prompt data', () => {
  const def = { version: 1, id: 'd', kind: 'choice', layout: 'dropdown', title: 'Complete', items: [{ id: 'q', prompt: 'We use this form...', options: [{ id: 'a', text: 'now' }, { id: 'b', text: 'in the past' }], correctId: 'b' }] };
  assert.equal(kit.grade(def, {q:'b'}).q, 'correct');
  assert.equal(kit.grade(def, {q:'a'}).q, 'retry');
});
test('invalid highlight or unsafe ordering audio is rejected before render', () => {
  assert.throws(() => kit.validate({version:1,id:'r',kind:'rule-page',title:'Rule',blocks:[{type:'text',text:'It is easy to get there.',highlights:['not present']}]}));
  assert.throws(() => kit.validate({version:1,id:'o',kind:'order',title:'Order',tokens:[{id:'a',text:'A'}],source:{audio:'javascript:alert(1)'}}));
});

test('replacement clothing lesson contains ten class steps and pending media', () => {
  const window = {SpaceWhaleExerciseKit:kit};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../course-content.js'),'utf8'),{window});
  const lesson=window.SpaceWhaleContent[0];
  assert.equal(lesson.id,'a1-2-w4-l1');assert.equal(lesson.stages.length,10);
  assert.ok(lesson.stages.every(stage=>stage.section==='tasks'));
  lesson.stages.forEach(stage=>kit.validate(stage.exercise));
  const words=lesson.stages[1].exercise;
  assert.equal(words.kind,'matching');assert.equal(words.layout,'picture-word');
  assert.deepEqual(Array.from(words.items,item=>item.correctId),['coat','sweater','blouse','skirt','suit','hat']);
  assert.ok(words.items.every(item=>item.imagePending&&!item.image));
  assert.equal(lesson.stages[6].exercise.kind,'rule-page');
  assert.equal(lesson.stages[7].exercise.inputMode,'select');
});

test('Listen Repeat accepts separate word and example audio tracks', () => {
  const def = {
    version: 1,
    id: 'lr-split',
    kind: 'audio',
    layout: 'listen-repeat',
    title: 'Listen and repeat',
    items: [{
      id: 'one',
      text: 'bright',
      audio: 'audio/bright.mp3',
      example: 'This shirt is bright.',
      exampleAudio: 'audio/this-shirt-is-bright.mp3'
    }]
  };
  assert.equal(kit.validate(def), def);

  const pending = JSON.parse(JSON.stringify(def));
  delete pending.items[0].audio;
  delete pending.items[0].exampleAudio;
  pending.audioPending = true;
  assert.equal(kit.validate(pending), pending);

  const missingExample = JSON.parse(JSON.stringify(def));
  delete missingExample.items[0].exampleAudio;
  assert.throws(() => kit.validate(missingExample), /example needs its own audio/);
});

test('A1.2 clothing appearance lesson keeps look and look like targets and split audio slots', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'course-content.js'), 'utf8');
  const window = { SpaceWhaleExerciseKit: kit, SpaceWhaleContent: [] };
  vm.runInNewContext(source, { window });
  const lesson = window.SpaceWhaleContent.find(item => item.id === 'a1-2-w4-l2');
  assert.equal(lesson.title, 'Описываем внешний вид одежды');
  assert.equal(lesson.stages.filter(stage => (stage.section || 'tasks') === 'tasks').length, 9);
  assert.equal(lesson.stages.filter(stage => stage.section === 'self-study').length, 2);
  lesson.stages.forEach(stage => kit.validate(stage.exercise));

  const vocab = lesson.stages.find(stage => stage.exercise.id === 'a12w4l2-picture-word').exercise;
  assert.equal(vocab.layout, 'picture-word');
  assert.ok(vocab.items.every(item => item.image === 'Clothes.png' && item.crop));
  assert.deepEqual(Array.from(vocab.options, option => option.text), ['suit','coat','hat','blouse','sweater','skirt']);

  const pronunciation = lesson.stages.find(stage => stage.exercise.id === 'a12w4l2-pronunciation').exercise;
  const listen = pronunciation.blocks.find(block => block.id === 'listen-repeat').exercise;
  assert.equal(listen.layout, 'listen-repeat');
  assert.ok(listen.items.every(item => 'audio' in item && 'exampleAudio' in item));

  const discovery = lesson.stages.find(stage => stage.exercise.id === 'a12w4l2-discovery').exercise;
  assert.ok(discovery.blocks.some(block => block.id === 'discover-difference' && block.exercise.kind === 'gaps'));
  assert.ok(discovery.blocks.some(block => block.id === 'question-meaning' && block.exercise.kind === 'matching'));
  assert.ok(discovery.blocks.some(block => block.type === 'rule' && block.title === 'After like'));

  const controlled = lesson.stages.find(stage => stage.exercise.id === 'a12w4l2-controlled').exercise;
  assert.ok(controlled.blocks.some(block => block.id === 'fox'));
  const questionChoice = controlled.blocks.find(block => block.id === 'choose-question').exercise;
  assert.equal(questionChoice.kind, 'gaps');
  assert.equal(questionChoice.inputMode, 'select');
  assert.equal(typeof questionChoice.items[0].segments[0], 'object');
  assert.equal(questionChoice.items[0].segments[1], ' — It looks nice.');
  assert.equal(controlled.blocks.filter(block => block.id?.startsWith('unscramble-')).length, 4);
});

test('A1.2 lesson 2 production answers are not exposed beside the writing task', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'course-content.js'), 'utf8');
  const window = { SpaceWhaleExerciseKit: kit, SpaceWhaleContent: [] };
  vm.runInNewContext(source, { window });
  const lesson = window.SpaceWhaleContent.find(item => item.id === 'a1-2-w4-l2');
  const writing = lesson.stages.find(stage => stage.exercise.id === 'a12w4l2-writing').exercise;
  assert.equal(writing.blocks.some(block => block.title === 'Possible answers'), false);
});


test('lesson one reserves new visuals while lesson two retains its existing image', () => {
  const window={SpaceWhaleExerciseKit:kit};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../course-content.js'),'utf8'),{window});
  const [lesson1,lesson2]=window.SpaceWhaleContent;
  for(const id of ['a12w4l1-opening','a12w4l1-final-speaking']){
    const block=lesson1.stages.find(stage=>stage.exercise.id===id).exercise.blocks[0];
    assert.equal(block.imagePending,true);assert.equal(block.image,undefined);
  }
  const block=lesson2.stages.find(stage=>stage.exercise.id==='a12w4l2-final-speaking').exercise.blocks[0];
  assert.equal(block.image,'Clothes.png');assert.ok(block.crop);
});
