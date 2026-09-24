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
  const fire = (el,type,extras = {}) => {assert.ok(el,`${type} target exists`);const event = new window.Event(type,{bubbles:true,cancelable:true});Object.assign(event,extras);el.dispatchEvent(event);return event;};
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
  s.click('OK'); assert.equal(s.host.querySelector('.ek-match-slot').getAttribute('data-feedback'),'retry');
  s.fire(s.host.querySelectorAll('.ek-match-slot')[1],'click');
  const used = [...s.host.querySelectorAll('dialog .ek-option')].find(el => el.textContent === '[Sentence ending 2]');
  assert.ok(used.classList.contains('ek-option-used'));
  s.fire(used,'click');
  assert.deepEqual(s.mount.getAnswers(),{item2:'option2'});
  assert.equal(s.host.querySelector('.ek-match-slot').textContent,'');
  assert.equal(s.host.querySelectorAll('[data-feedback]').length,0);
  s.click('Reset exercise'); assert.deepEqual(s.mount.getAnswers(),{});
});
test('typed bank stays typed, reports transformed answer, remote hydration does not echo', () => {
  const s = setup('bank-demo'); const input = s.host.querySelector('input');
  input.value = 'wrong'; s.fire(input,'input'); s.click('OK');
  assert.equal(input.getAttribute('data-feedback'),'retry');
  assert.ok(s.host.querySelector('.ek-correction').textContent.includes('[Form 1]'));
  input.value = '[Form 1]'; s.fire(input,'input');
  assert.equal(s.host.querySelector('.ek-correction'),null); s.click('OK');
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
  s.click('OK'); assert.equal(s.host.querySelector('.ek-choice-trigger').getAttribute('data-feedback'),'correct');
});
test('single and multiple choices use real radios / checkboxes and exact set grading', () => {
  for (const id of ['choice-demo','image-choice-demo','multiple-choice-demo','image-multiple-demo']) {
    const s = setup(id); const multiple = id.includes('multiple'); const inputs = [...s.host.querySelectorAll('input')];
    assert.equal(inputs[0].type,multiple ? 'checkbox':'radio');
    for (const index of multiple ? [0,2] : [1]) {inputs[index].checked=true;s.fire(inputs[index],'change');}
    assert.equal(s.host.querySelectorAll('[data-feedback]').length,0);
    s.click('OK');assert.equal(s.host.querySelector('fieldset').getAttribute('data-feedback'),'correct');
    s.click('Reset exercise');assert.deepEqual(s.mount.getAnswers(),{});
  }
});
test('sort drag moves, reassigns and returns items without copies', () => {
  const s = setup('sort-demo');
  s.drag(s.button('[Item 1]'),s.host.querySelectorAll('.ek-sort-group')[0]);
  assert.deepEqual(s.mount.getAnswers(),{item1:'A'});assert.equal(s.host.querySelectorAll('.ek-bank .ek-token').length,1);
  s.drag(s.button('[Item 1]'),s.host.querySelectorAll('.ek-sort-group')[1]); assert.deepEqual(s.mount.getAnswers(),{item1:'B'});
  s.click('OK');assert.equal(s.button('[Item 1]').getAttribute('data-feedback'),'retry');
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
  assert.equal(s.host.querySelectorAll('[data-feedback]').length,0);s.click('OK');
  assert.equal(s.host.querySelectorAll('.ek-image-label-target')[1].getAttribute('data-feedback'),'retry');
  s.drag(s.host.querySelectorAll('.ek-image-label-target')[1],s.host.querySelectorAll('.ek-image-label-target')[0]);
  assert.deepEqual(s.mount.getAnswers(),{target1:'label1'});
  s.click('Reset exercise');assert.equal(s.host.querySelectorAll('.ek-image-label-bank .ek-token').length,2);
});
test('open tasks have no Check; useful language open, possible answers and script closed', () => {
  for (const id of ['writing-demo','presentation-demo','speaking-language-demo','possible-answers-demo','audio-script-demo']) {
    const s = setup(id);assert.equal(s.button('OK'),undefined);
    const details = s.host.querySelector('details');
    if (details) assert.equal(Boolean(details.open),id === 'speaking-language-demo');
  }
});
test('progressive stage collapses and reopens without losing hidden or earlier answers', () => {
  const s = setup('progressive-stage-demo');
  assert.equal(s.host.querySelectorAll('.ek-stage-section:not([hidden])').length,1);
  assert.equal(s.button('Свернуть задание'),undefined);
  assert.equal(s.host.querySelector(':scope > .ek-actions .ek-reset'),null);
  s.click('Show next exercise');
  const choiceSection = s.host.querySelectorAll('.ek-stage-section')[1];
  const input = s.host.querySelectorAll('input')[1]; input.checked=true;s.fire(input,'change');
  s.click('Show next exercise');
  const gap = s.host.querySelector('.ek-typed-gap');gap.value='My saved answer';s.fire(gap,'input');
  const saved = s.mount.getAnswers();
  assert.equal(saved.block2.question1,'B');assert.equal(saved.revealed,3);
  assert.equal(s.button('Show next exercise'),undefined);
  s.click('Свернуть задание');
  assert.deepEqual(s.mount.getAnswers(),{...saved,revealed:2});
  assert.equal(s.host.querySelectorAll('.ek-stage-section')[1],choiceSection);
  assert.equal(input.checked,true);
  s.click('Свернуть задание');
  assert.equal(s.host.querySelectorAll('.ek-stage-section:not([hidden])').length,1);
  assert.equal(s.button('Свернуть задание'),undefined);
  assert.deepEqual(s.mount.getAnswers(),{...saved,revealed:1});
  s.click('Show next exercise');s.click('Show next exercise');
  assert.equal(s.host.querySelector('.ek-typed-gap').value,'My saved answer');
  assert.equal(s.host.querySelectorAll('input')[1].checked,true);
  assert.deepEqual(s.mount.getAnswers(),saved);
  const choiceReset = s.host.querySelectorAll('.ek-stage-section')[1].querySelector('.ek-reset');
  s.fire(choiceReset,'click');
  assert.deepEqual(s.mount.getAnswers(),{...saved,block2:{}});
  assert.equal(s.host.querySelector('.ek-typed-gap').value,'My saved answer');
});
test('progressive stage restores remote visibility and hidden answers without echoing', () => {
  const s = setup('progressive-stage-demo');
  const remote = {revealed:3,block2:{question1:'C'},block3:{gap1:'Remote answer'}};
  s.mount.setAnswers(remote);
  assert.equal(s.host.querySelectorAll('.ek-stage-section:not([hidden])').length,3);
  s.mount.setAnswers({...remote,revealed:1});
  assert.equal(s.host.querySelectorAll('.ek-stage-section:not([hidden])').length,1);
  assert.equal(s.changes.length,0);
  s.click('Show next exercise');s.click('Show next exercise');
  assert.equal(s.host.querySelector('.ek-typed-gap').value,'Remote answer');
  assert.equal(s.mount.getAnswers().block2.question1,'C');
});
test('read-only progressive navigation cannot change visibility or answers', () => {
  const initial = {revealed:2,block2:{question1:'B'}};
  const s = setup('progressive-stage-demo',{readOnly:true,answers:initial});
  for (const label of ['Show next exercise','Свернуть задание']) {
    assert.equal(s.button(label).disabled,true);s.click(label);
  }
  assert.equal(s.host.querySelectorAll('.ek-stage-section:not([hidden])').length,2);
  assert.deepEqual(s.mount.getAnswers(),initial);assert.equal(s.changes.length,0);
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

function pointerDrop(s) {
  const target = s.host.querySelector('.ek-sort-group');
  s.document.elementFromPoint = () => target;
  s.fire(s.button('[Item 1]'),'pointerdown',{pointerId:1,button:0,clientX:10,clientY:100});
  s.fire(s.document,'pointermove',{pointerId:1,clientX:10,clientY:20});
  s.fire(s.document,'pointerup',{pointerId:1,clientX:10,clientY:20});
}
test('first Check and Reset after dragging work when browser emits no trailing click', () => {
  const s = setup('sort-demo'); pointerDrop(s);
  s.fire(s.button('OK'),'pointerdown',{pointerId:2,button:0});
  assert.equal(s.fire(s.button('OK'),'click',{detail:1}).defaultPrevented,false);
  assert.equal(s.button('[Item 1]').getAttribute('data-feedback'),'correct');
  pointerDrop(s);
  s.fire(s.button('Reset exercise'),'pointerdown',{pointerId:3,button:0});
  s.fire(s.button('Reset exercise'),'click',{detail:1});
  assert.deepEqual(s.mount.getAnswers(),{});
});
test('drag trailing click is suppressed, but keyboard Check is never swallowed', () => {
  const s = setup('sort-demo'); pointerDrop(s);
  const trailing = s.fire(s.host,'click',{detail:1});
  assert.equal(trailing.defaultPrevented,true);
  assert.deepEqual(s.mount.getAnswers(),{item1:'A'});
  pointerDrop(s);
  assert.equal(s.fire(s.button('OK'),'click',{detail:0}).defaultPrevented,false);
  assert.equal(s.button('[Item 1]').getAttribute('data-feedback'),'correct');
});

test('audio waveform tracks time, greys on pause, retains seek and fills at the end', async () => {
  const s = setup('audio-demo');
  const audio = s.host.querySelector('audio');
  const player = s.host.querySelector('.ek-audio-player');
  const track = s.host.querySelector('.ek-audio-track');
  const range = s.host.querySelector('.ek-audio-range');
  assert.equal(player.dataset.state,'paused');assert.equal(range.disabled,true);
  assert.equal(track.querySelectorAll('svg path').length,2);
  assert.equal(track.querySelector('.ek-audio-wave-base path').getAttribute('d'),track.querySelector('.ek-audio-wave-fill path').getAttribute('d'));
  audio.duration = 10;s.fire(audio,'loadedmetadata');assert.equal(range.disabled,false);
  s.click('Play audio');await Promise.resolve();
  assert.equal(player.dataset.state,'playing');assert.ok(s.button('Pause audio'));
  audio.currentTime=4;s.fire(audio,'timeupdate');
  assert.equal(track.style.getPropertyValue('--audio-progress'),'40%');
  s.click('Pause audio');assert.equal(player.dataset.state,'paused');assert.equal(audio.currentTime,4);
  s.click('Play audio');await Promise.resolve();
  assert.equal(track.style.getPropertyValue('--audio-progress'),'40%');
  range.value='70';s.fire(range,'input');assert.equal(audio.currentTime,7);
  assert.equal(track.style.getPropertyValue('--audio-progress'),'70%');
  audio.currentTime=10;audio.paused=true;s.fire(audio,'ended');
  assert.equal(player.dataset.state,'ended');assert.equal(track.style.getPropertyValue('--audio-progress'),'100%');
  s.click('Play audio');await Promise.resolve();
  assert.equal(audio.currentTime,0);assert.equal(player.dataset.state,'playing');
  assert.equal(track.style.getPropertyValue('--audio-progress'),'0%');
  s.mount.destroy();assert.equal(audio.paused,true);
});
test('audio with unknown duration cannot seek, and starting another player pauses the first', async () => {
  const s = setup('audio-demo');const first = s.host.querySelector('audio');
  first.duration=NaN;s.fire(first,'loadedmetadata');
  const range=s.host.querySelector('.ek-audio-range');assert.equal(range.disabled,true);
  range.value='50';s.fire(range,'input');assert.equal(first.currentTime,0);
  s.click('Play audio');await Promise.resolve();
  const host=s.document.createElement('div');s.document.body.append(host);
  const secondMount=kit.mount(host,fixture('audio-demo'));
  s.fire(host.querySelector('.ek-audio-play'),'click');await Promise.resolve();
  assert.equal(first.paused,true);assert.equal(s.host.querySelector('.ek-audio-player').dataset.state,'paused');
  secondMount.destroy();s.mount.destroy();
});
test('grouped listening keeps independent components and answers; Check label is global', () => {
  const old=kit.uiLabels.check;
  try {
    kit.uiLabels.check='Done';
    const s=setup('listening-choice-demo');
    assert.equal(s.host.classList.contains('ek-stage-grouped'),true);
    assert.equal(s.host.querySelectorAll('.ek-audio-player').length,1);
    assert.ok(s.button('Done'));assert.equal(s.button('OK'),undefined);
    const input=s.host.querySelectorAll('input[type=radio]')[1];input.checked=true;s.fire(input,'change');
    s.click('Done');assert.equal(s.mount.getAnswers().block2.question1,'B');
    assert.ok(s.host.querySelector('[data-feedback=correct]'));
    s.click('Reset exercise');assert.deepEqual(s.mount.getAnswers().block2,{});
    assert.ok(s.host.querySelector('audio'));
  } finally { kit.uiLabels.check=old; }
  assert.equal(setup('progressive-stage-demo').host.classList.contains('ek-stage-grouped'),false);
});

test('shared Check result restores remotely without echo; editing clears shared Check',()=>{
 const a=setup('choice-demo',{syncChecks:true});
 const input=a.host.querySelectorAll('input')[1];input.checked=true;a.fire(input,'change');a.click('OK');
 assert.equal(a.mount.getAnswers().__sw_checked,true);
 const b=setup('choice-demo',{syncChecks:true});b.mount.setAnswers(a.mount.getAnswers());
 assert.ok(b.host.querySelector('[data-feedback=correct]'));assert.equal(b.changes.length,0);
 const other=b.host.querySelectorAll('input')[0];other.checked=true;b.fire(other,'change');
 assert.equal(b.mount.getAnswers().__sw_checked,undefined);assert.equal(b.host.querySelectorAll('[data-feedback]').length,0);
});


test('matching selection treatment survives remote updates and Reset remains an accessible icon', () => {
  const s=setup('matching-demo');
  assert.equal(s.host.querySelector('.ek-match-slot').dataset.selected,'false');
  s.mount.setAnswers({item1:'option2'});
  assert.equal(s.host.querySelector('.ek-match-slot').dataset.selected,'true');
  assert.ok(s.button('Reset exercise').querySelector('svg[aria-hidden="true"]'));
  s.click('Reset exercise');
  assert.equal(s.host.querySelector('.ek-match-slot').dataset.selected,'false');
  assert.deepEqual(s.mount.getAnswers(),{});
});

test('shared feedback uses five bands, neutral empty state and no duplicate counters',()=>{
  assert.equal(kit.uiLabels.check,'OK');
  for(const [n,message] of [[0,'Try again.'],[1,'Take another look.'],[2,'Good start.'],[3,'So close.'],[4,'All correct.']]){
    assert.equal(kit.feedbackMessage(Object.fromEntries(Array.from({length:4},(_,i)=>[i,i<n?'correct':'retry']))),message);
  }
  const s=setup('matching-demo');s.click('OK');assert.equal(s.host.querySelector('.ek-status').textContent,'Choose an answer.');
  assert.equal(s.host.querySelectorAll('.ek-results>[data-feedback]').length,0);
  assert.ok(s.host.querySelector('.ek-results').hidden);
  assert.equal(s.host.querySelectorAll('.ek-card>.ek-result-lamp').length,3);
});
test('height motion keeps content until closing finishes and cancels stale closing on reversal',()=>{
  const {document}=parseHTML('<html><body><div>Content</div></body></html>');const el=document.querySelector('div');
  el.getBoundingClientRect=()=>({height:80});Object.defineProperty(el,'scrollHeight',{value:80});
  const animations=[];el.animate=(frames)=>{const animation={frames,cancel(){this.cancelled=true;}};animations.push(animation);return animation;};
  kit.motion.expand(el,false);assert.equal(el.hidden,false);assert.equal(el.inert,true);assert.equal(animations[0].frames[1].height,'0px');
  kit.motion.expand(el,true);assert.equal(animations[0].cancelled,true);assert.equal(el.inert,false);animations[1].onfinish();assert.equal(el.hidden,false);
  kit.motion.expand(el,false);animations[2].onfinish();assert.equal(el.hidden,true);
});
test('nested feedback remains visible when another stage opens and closes',()=>{
  const s=setup('progressive-stage-demo',{syncChecks:true});s.click('Show next exercise');
  const section=s.host.querySelectorAll('.ek-stage-section')[1];const input=section.querySelectorAll('input')[1];input.checked=true;s.fire(input,'change');s.fire(section.querySelector('.ek-check'),'click');
  assert.equal(section.querySelector('.ek-result-lamp').dataset.result,'correct');s.click('Show next exercise');s.click('Свернуть задание');
  assert.equal(section.querySelector('.ek-result-lamp').dataset.result,'correct');
});
