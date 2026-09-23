const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const {parseHTML} = require('linkedom');
const kit = require('../exercise-kit.js');
const data = {SpaceWhaleExerciseKit:kit};
vm.runInNewContext(fs.readFileSync(require.resolve('../template-gallery.js'),'utf8'), {window:data});
const fixture = id => data.SpaceWhaleTemplates.find(def => def.id === id);
function setup(id, config = {}) {
  const {document, window} = parseHTML('<html><body><main></main></body></html>');
  const create = document.createElement.bind(document);
  document.createElement = tag => {
    const el = create(tag);
    if (tag === 'dialog') {
      el.showModal = () => {el.open = true;};
      el.close = () => {el.open = false; el.dispatchEvent(new window.Event('close'));};
    }
    if (tag === 'audio') {
      el.paused = true; el.currentTime = 0; el.duration = 3;
      el.play = async () => {el.paused=false; el.dispatchEvent(new window.Event('play'));};
      el.pause = () => {el.paused=true; el.dispatchEvent(new window.Event('pause'));};
    }
    if (tag === 'select') Object.defineProperty(el, 'value', {writable:true,value:''});
    return el;
  };
  const host = document.querySelector('main');
  const changes = [];
  const mount = kit.mount(host, fixture(id), {...config,onChange:value => changes.push(value)});
  const fire = (el,type,extras = {}) => {assert.ok(el,`${type} target exists`);const event = new window.Event(type,{bubbles:true,cancelable:true});Object.assign(event,extras);el.dispatchEvent(event);};
  const button = label => [...host.querySelectorAll('button')].find(el => el.textContent === label || el.getAttribute('aria-label') === label);
  const click = label => fire(button(label),'click');
  const drag = (source,target) => {
    const transfer = {setData(){},effectAllowed:'',dropEffect:''};
    fire(source,'dragstart',{dataTransfer:transfer}); fire(target,'drop',{dataTransfer:transfer}); fire(source,'dragend');
  };
  return {document,window,host,mount,changes,fire,button,click,drag};
}
test('all 31 templates render with shared kit and no initial correctness feedback', () => {
  for (const def of data.SpaceWhaleTemplates) {
    const s = setup(def.id);
    assert.ok(s.host.querySelector('h2'),def.id);
    assert.equal(s.host.querySelectorAll('[data-feedback]').length,0,def.id);
    s.mount.destroy(); assert.equal(s.host.children.length,0);
  }
});
test('matching reassigns used option, closes dialog, clears stale feedback, resets', () => {
  const s = setup('matching-demo');
  s.fire(s.host.querySelectorAll('.ek-match-slot')[0],'click'); s.click('[Sentence ending 2]');
  assert.equal(s.host.querySelectorAll('dialog').length,0);
  s.click('Check'); assert.equal(s.host.querySelector('.ek-match-slot').getAttribute('data-feedback'),'retry');
  s.fire(s.host.querySelectorAll('.ek-match-slot')[1],'click');
  const used = [...s.host.querySelectorAll('dialog .ek-option')].find(el => el.textContent === '[Sentence ending 2]');
  assert.ok(used.classList.contains('ek-option-used'));
  s.fire(used,'click');
  assert.deepEqual(s.mount.getAnswers(),{item2:'option2'});
  assert.equal(s.host.querySelector('.ek-match-slot').textContent,'+');
  assert.equal(s.host.querySelectorAll('[data-feedback]').length,0);
  s.click('Reset exercise'); assert.deepEqual(s.mount.getAnswers(),{});
});
test('typed bank stays typed, reports transformed answer, remote hydration does not echo', () => {
  const s = setup('bank-demo'); const input = s.host.querySelector('input');
  input.value = 'wrong'; s.fire(input,'input'); s.click('Check');
  assert.equal(input.getAttribute('data-feedback'),'retry');
  assert.ok(s.host.querySelector('.ek-correction').textContent.includes('[Form 1]'));
  input.value = '[Form 1]'; s.fire(input,'input');
  assert.equal(s.host.querySelector('.ek-correction'),null); s.click('Check');
  assert.equal(input.getAttribute('data-feedback'),'correct');
  const count = s.changes.length; s.mount.setAnswers({gap1:'remote'});
  assert.equal(s.changes.length,count); assert.equal(input.value,'remote');
  assert.equal(s.host.querySelector('input'),input); assert.equal(input.hasAttribute('data-feedback'),false);
  s.click('Reset exercise'); assert.equal(s.host.querySelector('input').value,'');
});
test('inline dropdown closes after selection and updates only its gap', () => {
  const s = setup('inline-demo'); s.fire(s.host.querySelector('.ek-choice-trigger'),'click');
  s.fire(s.host.querySelectorAll('.ek-inline-option')[1],'click');
  assert.deepEqual(s.mount.getAnswers(),{gap1:'[Form 1]'});
  assert.equal(s.host.querySelector('.ek-inline-menu').hidden,true);
  s.click('Check'); assert.equal(s.host.querySelector('.ek-choice-trigger').getAttribute('data-feedback'),'correct');
});
test('single and multiple choices use real radios / checkboxes and exact set grading', () => {
  for (const id of ['choice-demo','image-choice-demo','multiple-choice-demo','image-multiple-demo']) {
    const s = setup(id); const multiple = id.includes('multiple'); const inputs = [...s.host.querySelectorAll('input')];
    assert.equal(inputs[0].type,multiple ? 'checkbox':'radio');
    for (const index of multiple ? [0,2] : [1]) {inputs[index].checked=true;s.fire(inputs[index],'change');}
    assert.equal(s.host.querySelectorAll('[data-feedback]').length,0);
    s.click('Check');assert.equal(s.host.querySelector('fieldset').getAttribute('data-feedback'),'correct');
    s.click('Reset exercise');assert.deepEqual(s.mount.getAnswers(),{});
  }
});
test('sort drag moves, reassigns and returns items without copies', () => {
  const s = setup('sort-demo');
  s.drag(s.button('[Item 1]'),s.host.querySelectorAll('.ek-sort-group')[0]);
  assert.deepEqual(s.mount.getAnswers(),{item1:'A'});assert.equal(s.host.querySelectorAll('.ek-bank .ek-token').length,1);
  s.drag(s.button('[Item 1]'),s.host.querySelectorAll('.ek-sort-group')[1]); assert.deepEqual(s.mount.getAnswers(),{item1:'B'});
  s.click('Check');assert.equal(s.button('[Item 1]').getAttribute('data-feedback'),'retry');
  s.drag(s.button('[Item 1]'),s.host.querySelector('.ek-bank'));assert.deepEqual(s.mount.getAnswers(),{});
  assert.equal(s.host.querySelectorAll('.ek-token').length,2);
});
test('text and picture order support click, drag insertion, keyboard reorder and return', () => {
  for (const id of ['order-demo','picture-order-demo']) {
    const s = setup(id); const selector = id === 'order-demo' ? '.ek-token' : '.ek-order-image-card';
    s.fire(s.host.querySelectorAll(`.ek-bank ${selector}`)[1],'click');
    const source = s.host.querySelectorAll(`.ek-bank ${selector}`)[1];
    s.drag(source,s.host.querySelector('.ek-order-target')); assert.deepEqual(s.mount.getAnswers().order,['token1','token2']);
    s.drag(s.host.querySelector(`.ek-bank ${selector}`),s.host.querySelector(`.ek-order-target ${selector}`));
    assert.deepEqual(s.mount.getAnswers().order,['token3','token1','token2']);
    s.fire(s.host.querySelector(`.ek-order-target ${selector}`),'keydown',{altKey:true,key:'ArrowRight'});
    assert.deepEqual(s.mount.getAnswers().order,['token1','token3','token2']);
    assert.equal(s.host.querySelectorAll(selector).length,3);
    s.drag(s.host.querySelector(`.ek-order-target ${selector}`),s.host.querySelector('.ek-bank'));
    assert.deepEqual(s.mount.getAnswers().order,['token3','token2']);
    s.click('Reset exercise');assert.equal(s.host.querySelectorAll(`.ek-bank ${selector}`).length,3);
  }
});
test('image label stays in wrong target until Check and supports moving occupied label', () => {
  const s = setup('image-label-demo');
  s.drag(s.button('[Label 1]'),s.host.querySelectorAll('.ek-image-label-target')[1]);
  assert.deepEqual(s.mount.getAnswers(),{target2:'label1'});assert.equal(s.host.querySelectorAll('.ek-image-label-bank .ek-token').length,1);
  assert.equal(s.host.querySelectorAll('[data-feedback]').length,0);s.click('Check');
  assert.equal(s.host.querySelectorAll('.ek-image-label-target')[1].getAttribute('data-feedback'),'retry');
  s.drag(s.host.querySelectorAll('.ek-image-label-target')[1],s.host.querySelectorAll('.ek-image-label-target')[0]);
  assert.deepEqual(s.mount.getAnswers(),{target1:'label1'});
  s.click('Reset exercise');assert.equal(s.host.querySelectorAll('.ek-image-label-bank .ek-token').length,2);
});
test('open tasks have no Check; useful language open, possible answers and script closed', () => {
  for (const id of ['writing-demo','presentation-demo','speaking-language-demo','possible-answers-demo','audio-script-demo']) {
    const s = setup(id);assert.equal(s.button('Check'),undefined);
    const details = s.host.querySelector('details');
    if (details) assert.equal(Boolean(details.open),id === 'speaking-language-demo');
  }
});
test('progressive stage preserves earlier answers, restores remote reveal and resets all', () => {
  const s = setup('progressive-stage-demo');
  assert.equal(s.host.querySelectorAll('.ek-stage-section').length,1);
  s.click('Show next exercise'); assert.equal(s.host.querySelectorAll('.ek-stage-section').length,2);
  const input = s.host.querySelectorAll('input')[1]; input.checked=true;s.fire(input,'change');
  s.click('Show next exercise');assert.equal(s.host.querySelectorAll('.ek-stage-section').length,3);
  assert.equal(s.mount.getAnswers().block2.question1,'B'); assert.equal(s.mount.getAnswers().revealed,3);
  const count = s.changes.length;s.mount.setAnswers({revealed:2,block2:{question1:'C'}});
  assert.equal(s.changes.length,count);assert.equal(s.host.querySelectorAll('.ek-stage-section').length,2);
  s.fire(s.host.querySelector(':scope > .ek-actions .ek-reset'),'click');
  assert.deepEqual(s.mount.getAnswers(),{});assert.equal(s.host.querySelectorAll('.ek-stage-section').length,1);
});
test('read-only drag cannot mutate answers', () => {
  const s = setup('sort-demo',{readOnly:true});
  s.drag(s.button('[Item 1]'),s.host.querySelector('.ek-sort-group'));
  assert.deepEqual(s.mount.getAnswers(),{});assert.equal(s.changes.length,0);
});
test('starting another repeat item stops the first audio', async () => {
  const s = setup('listen-repeat-demo');
  s.fire(s.host.querySelectorAll('.ek-repeat-play')[0],'click');
  await Promise.resolve(); const audio = s.host.querySelectorAll('audio');assert.equal(audio[0].paused,false);
  s.fire(s.host.querySelectorAll('.ek-repeat-play')[1],'click');await Promise.resolve();
  assert.equal(audio[0].paused,true);assert.equal(audio[1].paused,false);
  s.mount.destroy();assert.equal(audio[1].paused,true);
});

test('pointer drag moves item through the actual gesture path and blocks accidental click', () => {
  const s = setup('sort-demo'); const source = s.button('[Item 1]'); const target = s.host.querySelector('.ek-sort-group');
  s.document.elementFromPoint = () => target;
  s.fire(source,'pointerdown',{pointerId:1,button:0,clientX:10,clientY:100});
  s.fire(s.document,'pointermove',{pointerId:1,clientX:10,clientY:20});
  assert.equal(source.classList.contains('ek-dragging'),true);
  s.fire(s.document,'pointerup',{pointerId:1,clientX:10,clientY:20});
  assert.deepEqual(s.mount.getAnswers(),{item1:'A'});
  assert.equal(s.host.querySelectorAll('.ek-token').length,2);
  assert.equal(s.changes.length,1);
});
