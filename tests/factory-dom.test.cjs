const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const {parseHTML} = require('linkedom');
const kit = require('../exercise-kit.js');
const data = {SpaceWhaleExerciseKit:kit};
vm.runInNewContext(fs.readFileSync(require.resolve('../template-gallery.js'),'utf8'), {window:data});
const fixture = id => [...data.SpaceWhaleTemplates,...data.SpaceWhaleTemplateExamples].find(def => def.id === id);
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
  const mount = kit.mount(host, typeof id === 'string' ? fixture(id) : id, {...config,onChange:value => changes.push(value)});
  const fire = (el,type,extras = {}) => {assert.ok(el,`${type} target exists`);const event = new window.Event(type,{bubbles:true,cancelable:true});Object.assign(event,extras);el.dispatchEvent(event);return event;};
  const button = label => [...host.querySelectorAll('button')].find(el => el.textContent === label || el.getAttribute('aria-label') === label);
  const click = label => fire(button(label),'click');
  const drag = (source,target) => {
    const transfer = {setData(){},effectAllowed:'',dropEffect:''};
    fire(source,'dragstart',{dataTransfer:transfer}); fire(target,'drop',{dataTransfer:transfer}); fire(source,'dragend');
  };
  return {document,window,host,mount,changes,fire,button,click,drag};
}
test('catalog entries and legacy fixtures render with shared kit and no initial correctness feedback', () => {
  for (const def of [...data.SpaceWhaleTemplates,...data.SpaceWhaleTemplateExamples]) {
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
test('presentation and audio have no Check; disclosures retain their initial state', () => {
  for (const id of ['presentation-demo','speaking-language-demo','possible-answers-demo','audio-script-demo']) {
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
test('Listen & Repeat reveals one phrase at a time and pauses the previous recording', async () => {
  const s=setup('listen-repeat-demo');s.fire(s.host.querySelector('.ek-repeat-play'),'click');await Promise.resolve();
  const first=s.host.querySelector('audio');assert.equal(first.paused,false);assert.equal(s.host.querySelectorAll('.ek-repeat-item').length,1);
  s.click('Next phrase');assert.equal(first.paused,true);s.fire(s.host.querySelector('.ek-repeat-play'),'click');await Promise.resolve();
  const second=s.host.querySelector('audio');assert.notEqual(first,second);assert.equal(second.paused,false);assert.equal(s.button('Next phrase'),undefined);
  s.mount.destroy();assert.equal(second.paused,true);
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
  assert.equal(section.querySelector('.ek-question').dataset.feedback,'correct');s.click('Show next exercise');s.click('Свернуть задание');
  assert.equal(section.querySelector('.ek-question').dataset.feedback,'correct');
});

test('inline and typed gap feedback belongs to the number inside the field',()=>{
  for(const id of ['inline-demo','typed-demo']){
    const s=setup(id);const field=s.host.querySelector('.ek-gap');
    const badge=s.host.querySelector('.ek-gap-number');
    assert.ok(field.contains(badge)||field.parentElement.contains(badge));
    assert.equal(s.host.querySelectorAll('.ek-sentence-number').length,0);
    s.click('OK');assert.equal(badge.dataset.result,'empty');
    if(id==='inline-demo'){
      s.fire(field,'click');s.fire(s.host.querySelector('.ek-inline-option'),'click');
      assert.equal(s.host.querySelector('.ek-gap-number'),badge);
      assert.equal(s.host.querySelector('.ek-inline-menu').hidden,true);
      assert.equal(s.host.querySelectorAll('.ek-inline-option .ek-gap-number').length,0);
    }else{field.value='wrong';s.fire(field,'input');}
    s.click('OK');assert.ok(['correct','retry'].includes(badge.dataset.result));
    s.click('Reset exercise');assert.equal(s.host.querySelector('.ek-gap-number').dataset.result,undefined);
  }
});
test('pointer pickup follows cursor; cancel restores source without changing answers',()=>{
  const s=setup('order-demo'),source=s.host.querySelector('.ek-token');
  s.fire(source,'pointerdown',{pointerId:9,button:0,clientX:10,clientY:100});
  s.fire(s.document,'pointermove',{pointerId:9,clientX:70,clientY:20});
  const ghost=s.host.querySelector('.ek-drag-ghost');assert.ok(ghost);
  assert.equal(ghost.style.transform,'translate(60px,-80px)');
  assert.equal(source.classList.contains('ek-dragging'),true);
  s.fire(s.document,'pointercancel',{pointerId:9,clientX:70,clientY:20});
  assert.equal(s.host.querySelector('.ek-drag-ghost'),null);
  assert.equal(source.classList.contains('ek-dragging'),false);
  assert.deepEqual(s.mount.getAnswers(),{});assert.equal(s.changes.length,0);
});

test('sort and label click returns assigned pieces without opening a dialog; bank click is inert',()=>{
  for(const [id,bank,target] of [['sort-demo','.ek-bank','.ek-sort-group'],['image-label-demo','.ek-image-label-bank','.ek-image-label-target']]){
    const s=setup(id);const piece=s.host.querySelector(`${bank} .ek-token`);s.fire(piece,'click');assert.deepEqual(s.mount.getAnswers(),{});assert.equal(s.host.querySelector('dialog'),null);
    s.drag(piece,s.host.querySelector(target));const placed=id==='sort-demo'?s.host.querySelector(`${target} .ek-token`):s.host.querySelector(target);
    s.fire(placed,'click');assert.equal(Object.values(s.mount.getAnswers()).filter(Boolean).length,0);assert.equal(s.host.querySelector('dialog'),null);assert.equal(s.host.querySelectorAll(`${bank} .ek-token`).length,2);
  }
});
test('pointer order previews insertion, closes source space, commits exact slot and cancels cleanly',()=>{
  const s=setup('order-demo');s.mount.setAnswers({order:['token3','token1','token2']});
  const zone=s.host.querySelector('.ek-order-target');const tokens=[...zone.querySelectorAll('.ek-token')];
  tokens.forEach((el,i)=>el.getBoundingClientRect=()=>({left:20+i*100,right:110+i*100,top:20,bottom:60,width:90,height:40}));
  const source=tokens[2];s.document.elementFromPoint=()=>tokens[0];
  s.fire(source,'pointerdown',{pointerId:5,button:0,clientX:240,clientY:40});
  s.fire(s.document,'pointermove',{pointerId:5,clientX:25,clientY:40});
  assert.ok(source.classList.contains('ek-drag-source-hidden'));assert.equal(zone.firstElementChild.className,'ek-drag-placeholder');assert.deepEqual(s.mount.getAnswers().order,['token3','token1','token2']);
  s.fire(s.document,'pointerup',{pointerId:5,clientX:25,clientY:40});assert.deepEqual(s.mount.getAnswers().order,['token2','token3','token1']);assert.equal(s.host.querySelector('.ek-drag-placeholder'),null);
  const next=s.host.querySelector('.ek-order-target .ek-token');s.document.elementFromPoint=()=>s.host.querySelector('.ek-order-target');
  s.fire(next,'pointerdown',{pointerId:6,button:0,clientX:25,clientY:40});s.fire(s.document,'pointermove',{pointerId:6,clientX:500,clientY:40});s.fire(s.document,'pointercancel',{pointerId:6,clientX:500,clientY:40});
  assert.deepEqual(s.mount.getAnswers().order,['token2','token3','token1']);assert.equal(s.host.querySelector('.ek-drag-source-hidden'),null);assert.equal(s.host.querySelector('.ek-drag-placeholder'),null);
});
test('picture order grades each position and clears its badge on edit',()=>{
  const s=setup('picture-order-demo');s.mount.setAnswers({order:['token1','token3','token2']});s.click('OK');
  assert.deepEqual([...s.host.querySelectorAll('.ek-order-target .ek-order-number')].map(el=>el.dataset.result),['correct','retry','retry']);
  s.fire(s.host.querySelector('.ek-order-target .ek-order-image-card'),'click');assert.equal(s.host.querySelectorAll('.ek-order-number[data-result]').length,0);
});
test('guided discovery reveals rule explicitly and preserves checked exercise on collapse',()=>{
  const s=setup('rule-page-demo',{syncChecks:true});const rule=s.host.querySelector('.ek-rule-block');assert.equal(rule.hidden,true);
  const input=s.host.querySelector('.ek-choice-trigger');s.fire(input,'click');s.click('[Option B]');s.click('OK');s.click('Далее');assert.equal(rule.hidden,false);assert.equal(input.getAttribute('data-feedback'),'correct');
  s.click('Свернуть следующий блок');assert.equal(rule.hidden,true);assert.ok(input.textContent.includes('[Option B]'));
  const count=s.changes.length;s.mount.setAnswers({notice:{question1:'A'},__sw_rule_visible:true});assert.equal(s.changes.length,count);assert.equal(rule.hidden,false);assert.ok(s.host.querySelector('.ek-choice-trigger').textContent.includes('[Option A]'));
});
test('writing uses one line; picture choices retain accessible names without visible option labels',()=>{
  const s=setup('writing-demo');const input=s.host.querySelector('input[type=text]');assert.ok(input);assert.equal(s.host.querySelector('textarea'),null);input.value='A short answer';s.fire(input,'input');assert.equal(s.mount.getAnswers().response,'A short answer');
  const pictures=setup('image-choice-demo');assert.equal(pictures.host.querySelectorAll('.ek-image-choice-option>span').length,0);assert.equal(pictures.host.querySelector('input').getAttribute('aria-label'),'[Option A]');
});


test('writing checks reveal possible answers only after OK; edits, reset and remote restore agree',()=>{
  const s=setup('writing-demo',{syncChecks:true});const input=s.host.querySelector('input');
  assert.ok(s.button('OK'));assert.equal(s.host.querySelector('.ek-writing-answers'),null);
  s.click('OK');assert.equal(s.host.querySelector('.ek-writing-answers'),null);
  input.value='My own response';s.fire(input,'input');s.click('OK');
  assert.ok(s.host.querySelector('.ek-writing-answers').textContent.includes('[Possible answer]'));
  assert.equal(input.dataset.feedback,'review');assert.equal(input.value,'My own response');assert.ok(s.button('OK'));
  const snapshot=s.mount.getAnswers();const peer=setup('writing-demo',{syncChecks:true});peer.mount.setAnswers(snapshot);
  assert.ok(peer.host.querySelector('.ek-writing-answers'));assert.equal(peer.host.querySelector('input').value,'My own response');
  input.value='Another response';s.fire(input,'input');assert.equal(s.host.querySelector('.ek-writing-answers'),null);
  s.click('Reset exercise');assert.equal(s.host.querySelector('.ek-writing-answers'),null);assert.equal(s.host.querySelector('input').value,'');
});
test('discovery uses the shared picker, grades IDs, closes on Escape and clears feedback on edit',()=>{
  const s=setup('rule-page-demo');assert.equal(s.host.querySelector('select'),null);const opener=s.host.querySelector('.ek-choice-trigger');
  s.fire(opener,'click');assert.equal(opener.getAttribute('aria-expanded'),'true');s.fire(opener,'keydown',{key:'Escape'});assert.equal(opener.getAttribute('aria-expanded'),'false');
  s.fire(opener,'click');s.click('[Option B]');assert.equal(s.mount.getAnswers().notice.question1,'B');s.click('OK');assert.equal(opener.getAttribute('data-feedback'),'correct');
  s.fire(opener,'click');s.click('[Option A]');assert.equal(opener.getAttribute('data-feedback'),null);assert.equal(s.mount.getAnswers().notice.question1,'A');
});
test('picture matching dialog shows just its image in the prompt',()=>{
  const s=setup('picture-word-demo');s.fire(s.host.querySelector('.ek-match-slot'),'click');const prompt=s.host.querySelector('.ek-picture-prompt');assert.ok(prompt.querySelector('img'));assert.equal(prompt.textContent,'');
});


test('teacher disclosure state reaches learner without allowing learner navigation or erasing answers',()=>{
  let next;
  const teacher=setup('progressive-stage-demo',{onViewChange:view=>{next=view;}});
  const student=setup('progressive-stage-demo',{navigationReadOnly:true});
  teacher.click('Show next exercise');
  assert.equal(next.revealed,2);student.mount.setViewState(next);
  assert.equal(student.host.querySelectorAll('.ek-stage-section:not([hidden])').length,2);
  assert.equal(student.host.querySelector('.ek-stage-navigation').hidden,true);
  student.mount.setAnswers({revealed:1,block2:{question1:'B'}});
  assert.equal(student.host.querySelectorAll('.ek-stage-section:not([hidden])').length,2);
  assert.equal(student.mount.getAnswers().block2.question1,'B');
  student.click('Show next exercise');assert.equal(student.mount.getViewState().revealed,2);
  teacher.click('Свернуть задание');student.mount.setViewState(next);
  assert.equal(student.host.querySelectorAll('.ek-stage-section:not([hidden])').length,1);
  assert.equal(student.mount.getAnswers().block2.question1,'B');
  assert.equal(teacher.changes.length,0);assert.equal(student.changes.length,0);
});

test('rule disclosure belongs to teacher and scrolls the newly visible content on both screens',()=>{
  let next;const teacher=setup('rule-page-demo',{onViewChange:view=>{next=view;}}),student=setup('rule-page-demo',{navigationReadOnly:true});
  let teacherScroll=0,studentScroll=0;
  teacher.host.querySelector('.ek-rule-block').scrollIntoView=()=>teacherScroll++;
  student.host.querySelector('.ek-rule-block').scrollIntoView=()=>studentScroll++;
  teacher.click('Далее');student.mount.setViewState(next);
  assert.equal(teacherScroll,1);assert.equal(studentScroll,1);
  student.mount.setAnswers({__sw_rule_visible:false});
  assert.equal(student.host.querySelector('.ek-rule-block').hidden,false);
  assert.equal(studentScroll,1);
  student.click('Свернуть следующий блок');assert.equal(student.host.querySelector('.ek-rule-block').hidden,false);
});

test('matching keeps the open picker attached while remote answers arrive; local pick paints immediately',()=>{
 const s=setup('matching-demo');
 const slot=s.host.querySelector('.ek-match-slot');s.fire(slot,'click');
 s.mount.setAnswers({item2:'option2'});
 assert.equal(s.host.querySelector('.ek-match-slot'),slot);
 s.click('[Sentence ending 1]');
 assert.equal(slot.textContent,'[Sentence ending 1]');
 assert.equal(s.host.querySelectorAll('dialog').length,0);
 assert.deepEqual(s.mount.getAnswers(),{item2:'option2',item1:'option1'});
});
test('inline picker stays open during remote hydration, without discarding the next local selection',()=>{
 const s=setup('inline-demo');const opener=s.host.querySelector('.ek-choice-trigger');
 s.fire(opener,'click');s.mount.setAnswers({gap2:'remote'});
 assert.equal(s.host.querySelector('.ek-choice-trigger'),opener);
 assert.equal(s.host.querySelector('.ek-inline-menu').hidden,false);
 s.fire(s.host.querySelectorAll('.ek-inline-option')[1],'click');
 assert.match(opener.textContent,/\[Form 1\]/);
 assert.equal(s.mount.getAnswers().gap2,'remote');
});

const courseScope={SpaceWhaleExerciseKit:kit};
vm.runInNewContext(fs.readFileSync(require.resolve('../whale1-content.js'),'utf8'),{window:courseScope});
const courseExercise=id=>courseScope.SpaceWhaleContent.flatMap(lesson=>lesson.stages).find(stage=>stage.exercise.id===id).exercise;
test('actual personal form keeps source with first task; gender is neutral and OK stays available',()=>{
  let view;const definition=courseExercise('a1-1-w1-l4-e09');
  const teacher=setup(definition,{syncChecks:true,onViewChange:next=>{view=next;}});
  const student=setup(definition,{syncChecks:true,navigationReadOnly:true});
  assert.equal(teacher.host.querySelectorAll('input[type=text]').length,5);
  assert.equal(teacher.host.querySelector('input[type=radio]'),null);
  const input=teacher.host.querySelector('input');input.value='Alex';teacher.fire(input,'input');teacher.click('OK');
  assert.ok(teacher.host.querySelector('.ek-writing-answers').textContent.includes('Alex'));
  teacher.click('Show next exercise');student.mount.setViewState(view);
  for(const screen of [teacher,student])assert.equal(screen.host.querySelectorAll('input[type=radio]').length,2);
  const section=[...teacher.host.querySelectorAll('.ek-stage-section')].find(el=>el.querySelector('input[type=radio]'));
  for(const radio of section.querySelectorAll('input[type=radio]')){
    radio.checked=true;teacher.fire(radio,'change');teacher.fire(section.querySelector('.ek-check'),'click');
    assert.equal(section.querySelector('fieldset').dataset.feedback,'review');
    assert.match(section.querySelector('.ek-status').textContent,/нет единственного/);
    assert.ok(section.querySelector('.ek-check'));assert.equal(section.querySelector('[data-feedback=retry]'),null);
  }
  const before=student.mount.getViewState();student.mount.setAnswers(teacher.mount.getAnswers());
  assert.deepEqual(student.mount.getViewState(),before);
});
test('successive course tasks reveal individually and collapse by task',()=>{
  const s=setup(courseExercise('a1-1-w1-l3-e06'),{syncChecks:true});
  assert.equal(s.host.querySelectorAll('.ek-stage-section:not([hidden])').length,1);
  s.click('Show next exercise');assert.equal(s.host.querySelectorAll('.ek-stage-section:not([hidden])').length,2);
  s.click('Show next exercise');assert.equal(s.host.querySelectorAll('.ek-stage-section:not([hidden])').length,3);
  s.click('Show next exercise');assert.equal(s.host.querySelectorAll('.ek-stage-section:not([hidden])').length,5); // final task and its support
  s.click('Свернуть задание');assert.equal(s.host.querySelectorAll('.ek-stage-section:not([hidden])').length,3);
});
test('email matching reveals authored corrections despite imported showAnswers false',()=>{
  const def=courseExercise('a1-1-w1-l5-e02').exercises.find(block=>block.exercise.kind==='matching').exercise;
  const s=setup(def,{syncChecks:true});const wrong=def.options.find(option=>option.id!==def.items[0].correctId);
  s.mount.setAnswers({[def.items[0].id]:wrong.id,__sw_checked:true});
  const solution=s.host.querySelector('.ek-correction').textContent;
  for(const item of def.items){assert.ok(solution.includes(item.text));assert.ok(solution.includes(def.options.find(option=>option.id===item.correctId).text));}
  assert.match(solution,/Correct answers/);
});
test('two-option closed choice reveals the correct answer after a mistake',()=>{
  const def={version:1,id:'binary',title:'Choose',kind:'choice',items:[{id:'q',prompt:'Choose',options:[{id:'a',text:'A'},{id:'b',text:'B'}],correctId:'b'}]};
  const s=setup(def,{syncChecks:true});s.mount.setAnswers({q:'a',__sw_checked:true});
  assert.equal(s.host.querySelector('fieldset').dataset.feedback,'retry');assert.match(s.host.querySelector('.ek-correction').textContent,/B/);
  s.mount.setAnswers({q:'b',__sw_checked:true});assert.equal(s.host.querySelector('fieldset').dataset.feedback,'correct');
});


test('accepted writing grades alternatives, reveals corrections and synchronizes checks', () => {
  const def = fixture('writing-template').exercises[0].exercise;
  const s = setup(def,{syncChecks:true});
  const field=s.host.querySelector('.ek-writing-input');
  assert.equal(s.host.querySelector('.ek-correction'),null);
  field.value='I late';s.fire(field,'input');s.click('OK');
  assert.equal(field.dataset.feedback,'retry');
  assert.match(s.host.querySelector('.ek-correction').textContent,/Correct answers.*I am late/);
  field.value='  I AM   LATE.  ';s.fire(field,'input');
  assert.equal(s.host.querySelector('.ek-correction'),null);s.click('OK');
  assert.equal(field.dataset.feedback,'correct');
  const other=setup(def,{syncChecks:true});other.mount.setAnswers(s.mount.getAnswers());
  assert.equal(other.host.querySelector('.ek-writing-input').dataset.feedback,'correct');
  assert.equal(other.changes.length,0);
  s.click('Reset exercise');assert.equal(s.host.querySelector('.ek-correction'),null);
  const free=setup(fixture('writing-template').exercises[1].exercise);
  const input=free.host.querySelector('.ek-writing-input');input.value='Any personal response';free.fire(input,'input');free.click('OK');
  assert.equal(input.dataset.feedback,'review');assert.match(free.host.querySelector('.ek-correction').textContent,/Possible answers/);
});
test('audio composition starts with first response, retains source and hidden answers', () => {
  const s=setup('audio-task-template',{syncChecks:true});
  assert.equal(s.host.querySelectorAll('.ek-stage-section:not([hidden])').length,2);
  const audio=s.host.querySelector('audio'),radio=s.host.querySelectorAll('input[type=radio]')[1];
  assert.ok(audio);assert.ok(radio);assert.equal(s.host.querySelector('.ek-typed-gap'),null);
  radio.checked=true;s.fire(radio,'change');s.click('Show next exercise');
  const gap=s.host.querySelector('.ek-typed-gap');gap.value='Saved';s.fire(gap,'input');s.click('Свернуть задание');
  assert.equal(s.host.querySelectorAll('.ek-stage-section:not([hidden])').length,2);
  assert.equal(s.host.querySelector('audio'),audio);assert.equal(s.mount.getAnswers().block2.question1,'B');
  assert.equal(s.mount.getAnswers().block3.gap1,'Saved');s.click('Show next exercise');assert.equal(gap.value,'Saved');
});
test('single compositions have no continuation; ordinary sequence starts with a task', () => {
  for(const id of ['image-task-template','speaking-template','dropdown-template','audio-template']){
    assert.equal(setup(id).button('Show next exercise'),undefined,id);
  }
  const sequence=setup('sequence-template');
  assert.ok(sequence.host.querySelector('input[type=radio]'));assert.equal(sequence.host.querySelector('.ek-typed-gap'),null);
});

test('OK becomes available only after every field is filled and hides when an answer is removed',()=>{
 const s=setup({version:1,id:'ready-test',kind:'writing',title:'Write',items:[{id:'a',prompt:'First'},{id:'b',prompt:'Second'}]});
 const check=s.host.querySelector('.ek-check');assert.equal(check.hidden,true);
 const inputs=s.host.querySelectorAll('input');inputs[0].value='Hello';s.fire(inputs[0],'input');assert.equal(check.hidden,true);
 inputs[1].value='World';s.fire(inputs[1],'input');assert.equal(check.hidden,false);
 inputs[0].value=' ';s.fire(inputs[0],'input');assert.equal(check.hidden,true);
 s.mount.setAnswers({a:'One',b:'Two'});assert.equal(check.hidden,false);
});
test('filled order bank collapses; returning a token brings it back',()=>{
 const s=setup('order-demo');while(s.host.querySelector('.ek-bank .ek-token'))s.fire(s.host.querySelector('.ek-bank .ek-token'),'click');
 assert.equal(s.host.querySelector('.ek-bank').hidden,true);assert.equal(s.host.querySelector('.ek-check').hidden,false);
 s.fire(s.host.querySelector('.ek-order-target .ek-token'),'click');assert.equal(s.host.querySelector('.ek-bank').hidden,false);assert.equal(s.host.querySelector('.ek-check').hidden,true);
});
test('Skip records a separate status and invokes teacher navigation without marking answers correct',()=>{
 let skipped=0;const s=setup('choice-demo',{syncChecks:true,onSkip:()=>skipped++});s.click('Skip exercise');
 assert.equal(skipped,1);assert.equal(s.mount.getAnswers().__sw_skipped,true);assert.equal(s.mount.getAnswers().__sw_checked,undefined);
 const pupil=setup('choice-demo',{navigationReadOnly:true,onSkip:()=>skipped++});assert.equal(pupil.button('Skip exercise').hidden,true);pupil.click('Skip exercise');assert.equal(skipped,1);
});
test('Listen & Repeat view synchronizes word/example steps; pupils cannot advance',()=>{
 const def={version:1,id:'repeat-steps',kind:'audio',layout:'listen-repeat',title:'Repeat',items:[{id:'a',text:'Bright',audio:'bright.wav',example:'This shirt is bright.',exampleAudio:'shirt.wav'},{id:'b',text:'Dark',audio:'dark.wav'}]};
 let view;const teacher=setup(def,{onViewChange:v=>{view=v;}}),pupil=setup(def,{navigationReadOnly:true});
 teacher.click('Next phrase');pupil.mount.setViewState(view);assert.equal(pupil.host.querySelector('.ek-repeat-line').textContent,'This shirt is bright.');assert.equal(pupil.button('Next phrase').hidden,true);
 teacher.click('Next phrase');pupil.mount.setViewState(view);assert.equal(pupil.host.querySelector('.ek-repeat-line').textContent,'Dark');assert.equal(teacher.button('Next phrase'),undefined);
});

test('writing hints sit under the field and never enter submitted answer examples',()=>{
 const def={version:1,id:'writing-hint',kind:'writing',title:'Write a reply.',responseMode:'open',items:[{id:'reply',prompt:'How does it look?',hint:'Use: warm',possibleAnswers:['It looks warm.']}]};
 const s=setup(def),input=s.host.querySelector('input'),hint=s.host.querySelector('.ek-writing-hint');
 assert.equal(input.nextElementSibling,hint);assert.equal(input.getAttribute('aria-describedby'),hint.id);
 input.value='It looks very warm.';s.fire(input,'input');s.click('OK');
 const feedback=s.host.querySelector('.ek-writing-answers');assert.match(feedback.textContent,/How does it look\?/);assert.doesNotMatch(feedback.textContent,/Use:/);
 assert.equal(feedback.querySelector('.ek-answer-pairs strong').textContent,'It looks warm.');assert.equal(input.dataset.feedback,'review');
 assert.throws(()=>kit.validate({...def,items:[{...def.items[0],hint:42}]}),/hint/);
});
test('opening a disclosure scrolls its complete content, with the beginning taking priority',()=>{
 for(const [bottom,expected] of [[850,166],[1500,484]]){
   const s=setup({version:1,id:'script-scroll',kind:'presentation',title:'Listen',blocks:[{type:'disclosure',title:'See the script',text:'A long script',open:false}]}),scroll=s.document.createElement('div');
   scroll.className='lesson-scroll';s.host.before(scroll);scroll.append(s.host);scroll.scrollTop=100;
   scroll.getBoundingClientRect=()=>({top:100,bottom:800,height:700});let target;
   scroll.scrollTo=value=>{target=value.top;};
   const detail=s.host.querySelector('details');detail.getBoundingClientRect=()=>({top:500,bottom,height:bottom-500});
   s.fire(detail.querySelector('summary'),'click');assert.equal(detail.open,true);assert.equal(target,expected);
   target=null;s.fire(detail.querySelector('summary'),'click');assert.equal(target,null);
 }
});
test('next task scrolling includes the next-step controls beneath the revealed content',()=>{
 const make=id=>({version:1,id,title:'Choose',kind:'choice',items:[{id:'q',prompt:'Question?',options:[{id:'a',text:'A'},{id:'b',text:'B'}],correctId:'a'}]});
 const s=setup({version:1,id:'scroll-stage',kind:'stage',title:'Practice',progressive:true,exercises:[{id:'one',exercise:make('one-task')},{id:'two',exercise:make('two-task')}]});
 const scroll=s.document.createElement('div');scroll.className='lesson-scroll';s.host.before(scroll);scroll.append(s.host);scroll.scrollTop=0;
 scroll.getBoundingClientRect=()=>({top:0,bottom:600,height:600});let target;scroll.scrollTo=value=>{target=value.top;};
 // Use the DOM creation hook to supply layout for the just-mounted task.
 const create=s.document.createElement.bind(s.document);s.document.createElement=tag=>{const el=create(tag);el.getBoundingClientRect=()=>({top:300,bottom:620,height:320});return el;};
 s.host.querySelector('.ek-stage-navigation').getBoundingClientRect=()=>({top:650,bottom:700,height:50});
 s.click('Show next exercise');assert.equal(target,116);
});
