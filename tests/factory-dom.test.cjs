const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const {parseHTML} = require('linkedom');
const kit = require('../exercise-kit.js');
const data = {SpaceWhaleExerciseKit:kit};
vm.runInNewContext(fs.readFileSync(require.resolve('../template-gallery.js'),'utf8'), {window:data});
const fixture = id => [...data.SpaceWhaleTemplates,...data.SpaceWhaleTemplateExamples].find(def => def.id === id);
const sourceData = {SpaceWhaleExerciseKit:kit};
vm.runInNewContext(fs.readFileSync(require.resolve('../template-source-core.js'),'utf8'), {window:sourceData});
const sourceFixture = code => sourceData.SpaceWhaleSourceCoreTemplates.find(def=>def.code===code);
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
test('spelling cues leave the native editor on focus without becoming answer text', () => {
  const definitions = [
    {version:1,id:'gap-cue-focus',kind:'gaps',title:'Complete.',inputMode:'text',items:[{id:'sentence',segments:['Choose a ',{id:'answer',answers:['drink'],placeholder:'d'},'.']}]},
    {version:1,id:'writing-cue-focus',kind:'writing',title:'Write.',responseMode:'accepted',items:[{id:'answer',prompt:'A drink',acceptedAnswers:['drink'],placeholder:'d'}]},
    {version:1,id:'multiline-cue-focus',kind:'writing',title:'Write.',responseMode:'open',items:[{id:'answer',prompt:'A short message',multiline:true,placeholder:'Hello'}]}
  ];
  for (const def of definitions) {
    const s=setup(def),input=s.host.querySelector('input,textarea'),cue=input.getAttribute('placeholder');
    assert.ok(cue);assert.equal(input.value,'');
    s.fire(input,'focus');assert.equal(input.hasAttribute('placeholder'),false);
    assert.deepEqual(s.mount.getAnswers(),{});assert.equal(s.changes.length,0);
    s.fire(input,'blur');assert.equal(input.getAttribute('placeholder'),cue);assert.equal(input.value,'');
    s.fire(input,'focus');input.value='drink';s.fire(input,'input');
    assert.equal(input.hasAttribute('placeholder'),false);assert.equal(s.mount.getAnswers().answer,'drink');
    s.fire(input,'blur');assert.equal(input.getAttribute('placeholder'),cue);assert.equal(input.value,'drink');
    s.click('OK');assert.equal(s.mount.getAnswers().answer,'drink');
    s.mount.setAnswers({answer:'remote'});
    const hydrated=s.host.querySelector('input,textarea');assert.equal(hydrated.value,'remote');
    assert.equal(hydrated.getAttribute('placeholder'),cue);
    const readOnly=setup(def,{readOnly:true}),locked=readOnly.host.querySelector('input,textarea');
    assert.equal(locked.disabled,true);readOnly.fire(locked,'focus');assert.equal(locked.getAttribute('placeholder'),cue);
  }
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
test('Listen & Repeat retains prior rows and playing a second recording pauses the first', async () => {
  const s=setup('listen-repeat-demo');s.fire(s.host.querySelector('.ek-repeat-play'),'click');await Promise.resolve();
  const first=s.host.querySelector('audio');assert.equal(first.paused,false);assert.equal(s.host.querySelectorAll('.ek-repeat-item:not([hidden])').length,1);
  s.click('Next phrase');assert.equal(first.paused,true);assert.equal(s.host.querySelectorAll('.ek-repeat-item:not([hidden])').length,2);
  await Promise.resolve();
  const second=s.host.querySelectorAll('audio')[1];assert.notEqual(first,second);assert.equal(first.paused,true);assert.equal(second.paused,false);assert.equal(s.button('Next phrase'),undefined);
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

test('listening questions reveal only after check and a teacher arrow, preserving flat saved IDs',()=>{
 const def={version:1,id:'two-listening-questions',kind:'stage',title:'Listen and choose.',layout:'grouped',transcript:'Author transcript.',transcriptAfter:['questions'],exercises:[
  {id:'audio',exercise:{version:1,id:'source',kind:'audio',title:'Listen and choose.',audio:'dialogue.mp3'}},
  {id:'questions',exercise:{version:1,id:'questions',kind:'choice',title:'Listen and choose.',items:[
   {id:'first',prompt:'First question?',options:[{id:'a',text:'One'},{id:'b',text:'Two'}],correctId:'a'},
   {id:'second',prompt:'Second question?',options:[{id:'a',text:'Three'},{id:'b',text:'Four'}],correctId:'b'}]}}]};
 const teacher=setup(def,{syncChecks:true,onViewChange:()=>{}}),pupil=setup(def,{syncChecks:true,navigationReadOnly:true});
 const choose=(s,n)=>{const el=s.host.querySelectorAll('input[type=radio]')[n];el.checked=true;s.fire(el,'change');};
 const source=teacher.host.querySelector('audio');
 assert.equal(teacher.host.querySelectorAll('.ek-question').length,1);
 assert.equal(teacher.button('Show next exercise').disabled,true);
 choose(teacher,0);teacher.click('OK');
 assert.equal(teacher.host.querySelectorAll('.ek-question').length,1,'OK does not reveal');
 assert.equal(teacher.mount.getAnswers().questions.first,'a');
 assert.equal(teacher.mount.getAnswers().questions.__sw_checked,undefined,'whole task is not checked yet');
 teacher.click('Show next exercise');
 pupil.mount.setAnswers(teacher.mount.getAnswers());pupil.mount.setViewState(teacher.mount.getViewState(),false);
 assert.equal(pupil.host.querySelectorAll('.ek-question').length,2);
 assert.ok([...pupil.host.querySelectorAll('.ek-stage-navigation')].every(nav=>nav.hidden));
 assert.equal(teacher.host.querySelector('audio'),source);
 choose(teacher,3);
 teacher.fire(teacher.host.querySelectorAll('.ek-check')[1],'click');
 const saved=teacher.mount.getAnswers();assert.equal(saved.questions.second,'b');assert.equal(saved.questions.__sw_checked,true);
 assert.equal(teacher.host.querySelector('details').hidden,false);assert.equal(teacher.host.querySelector('details').open,false);
 const restored=setup(def,{syncChecks:true,answers:saved});
 assert.equal(restored.host.querySelectorAll('.ek-question').length,2);
 assert.equal(restored.host.querySelectorAll('.ek-question[data-feedback=correct]').length,2);
 restored.fire(restored.host.querySelectorAll('.ek-reset')[1],'click');
 assert.equal(restored.mount.getAnswers().questions.first,'a');assert.equal(restored.mount.getAnswers().questions.second,undefined);
 assert.equal(restored.mount.getAnswers().questions.__sw_checked,undefined);
 assert.equal(restored.host.querySelector('details').hidden,true);
 const legacy=setup(def,{syncChecks:true,answers:{questions:{first:'a',second:'b',__sw_checked:true}}});
 legacy.click('Show next exercise');assert.equal(legacy.host.querySelectorAll('.ek-question[data-feedback=correct]').length,2);
 const skipped=setup(def,{syncChecks:true});skipped.click('Skip exercise');
 assert.equal(skipped.host.querySelectorAll('.ek-question').length,2);assert.deepEqual(skipped.mount.getAnswers().questions.__sw_choice_skipped,['first']);
});

test('sentence feedback marks individual positions, handles accepted orders and clears on edits',()=>{
 const def={version:1,id:'positions',kind:'order',title:'Build the question.',tokens:[{id:'which',text:'Which cap'},{id:'does',text:'does'},{id:'he',text:'he'},{id:'want',text:'want'},{id:'end',text:'?'}],correctOrder:['which','does','he','want','end']};
 const s=setup(def,{syncChecks:true});s.mount.setAnswers({order:['which','want','he','does','end'],__sw_checked:true});
 assert.equal(s.host.querySelector('.ek-order-target').hasAttribute('data-feedback'),false);
 assert.deepEqual([...s.host.querySelectorAll('.ek-order-target>.ek-token')].map(token=>token.dataset.feedback),['correct','retry','correct','retry','correct']);
 assert.equal(s.host.querySelector('.ek-answer-pairs strong').textContent,'Which cap does he want?');assert.equal(s.host.querySelector('.ek-answer-pairs>li').dataset.result,'retry');
 s.click('want');assert.equal(s.host.querySelectorAll('.ek-order-target [data-feedback]').length,0);
 s.click('Reset exercise');assert.equal(s.host.querySelectorAll('[data-feedback]').length,0);
 const alternative=setup({...def,acceptedOrders:[['he','does','want','which','end']]},{syncChecks:true});
 alternative.mount.setAnswers({order:['he','does','want','which','end'],__sw_checked:true});
 assert.equal(alternative.host.querySelectorAll('.ek-order-target>.ek-token[data-feedback=correct]').length,5);
});

test('picture writing corrections omit correct pictures without exposing open-response samples',()=>{
 const def={version:1,id:'picture-recall',kind:'writing',title:'Write the words.',responseMode:'accepted',items:[
  {id:'cap',prompt:'Picture 1',image:'cap.webp',alt:'Picture 1',acceptedAnswers:['cap','a cap']},
  {id:'belt',prompt:'Picture 2',image:'belt.webp',alt:'Picture 2',acceptedAnswers:['belt','a belt']}]};
 const s=setup(def,{syncChecks:true});assert.equal(s.host.querySelector('.ek-picture-corrections'),null);
 s.mount.setAnswers({cap:'hat',belt:'a belt',__sw_checked:true});
 const cards=s.host.querySelectorAll('.ek-picture-corrections .ek-picture-correction-card');
 assert.equal(cards.length,1);assert.equal(cards[0].querySelector('img').src,'cap.webp');assert.equal(cards[0].querySelector('strong').textContent,'cap');
 assert.equal(cards[0].dataset.result,'retry');assert.equal(cards[0].querySelector('.ek-attempt-marker').textContent,'×');
 assert.ok(s.button('Next correct pictures'));s.click('Reset exercise');assert.equal(s.host.querySelector('.ek-picture-corrections'),null);
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

test('inline and typed gap feedback stays inside the field alongside its original sentence number',()=>{
  for(const id of ['inline-demo','typed-demo']){
    const s=setup(id);const field=s.host.querySelector('.ek-gap');
    const badge=s.host.querySelector('.ek-gap-number');
    assert.ok(field.contains(badge)||field.parentElement.contains(badge));
    assert.equal(s.host.querySelectorAll('.ek-sentence-number').length,1);assert.equal(s.host.querySelector('.ek-sentence-number').textContent,'1. ');
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


test('open writing shows Well done without model answers; edits, reset and remote restore agree',()=>{
  const s=setup('writing-demo',{syncChecks:true});const input=s.host.querySelector('input');
  assert.ok(s.button('OK'));assert.equal(s.host.querySelector('.ek-writing-answers'),null);
  s.click('OK');assert.equal(s.host.querySelector('.ek-writing-answers'),null);
  input.value='My own response';s.fire(input,'input');s.click('OK');
  assert.equal(s.host.querySelector('.ek-writing-answers'),null);assert.equal(s.host.querySelector('.ek-status').textContent,'Well done');
  assert.equal(input.dataset.feedback,'review');assert.equal(input.value,'My own response');assert.ok(s.button('OK'));
  const snapshot=s.mount.getAnswers();const peer=setup('writing-demo',{syncChecks:true});peer.mount.setAnswers(snapshot);
  assert.equal(peer.host.querySelector('.ek-writing-answers'),null);assert.equal(peer.host.querySelector('.ek-status').textContent,'Well done');assert.equal(peer.host.querySelector('input').value,'My own response');
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
  assert.equal(teacher.host.querySelector('.ek-writing-answers'),null);
  teacher.click('Show next exercise');student.mount.setViewState(view);
  for(const screen of [teacher,student])assert.equal(screen.host.querySelectorAll('input[type=radio]').length,2);
  const section=[...teacher.host.querySelectorAll('.ek-stage-section')].find(el=>el.querySelector('input[type=radio]'));
  for(const radio of section.querySelectorAll('input[type=radio]')){
    radio.checked=true;teacher.fire(radio,'change');teacher.fire(section.querySelector('.ek-check'),'click');
    assert.equal(section.querySelector('fieldset').dataset.feedback,'review');
    assert.equal(section.querySelector('.ek-status').textContent,'Well done');
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
  assert.equal(input.dataset.feedback,'review');assert.equal(free.host.querySelector('.ek-correction'),null);assert.equal(free.host.querySelector('.ek-status').textContent,'Well done');
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
test('Listen & Repeat reveals a cumulative plain list and synchronizes without replacing audio',async()=>{
 const def={version:1,id:'repeat-steps',kind:'audio',layout:'listen-repeat',title:'Repeat',items:[{id:'a',text:'Bright',audio:'bright.wav',example:'This shirt is bright.',exampleAudio:'shirt.wav'},{id:'b',text:'Dark',audio:'dark.wav'}]};
 let view;const teacher=setup(def,{onViewChange:v=>{view=v;}}),pupil=setup(def,{navigationReadOnly:true});
 const visible=s=>[...s.host.querySelectorAll('.ek-repeat-item')].filter(row=>!row.hidden).map(row=>row.querySelector('.ek-repeat-line').textContent);
 assert.deepEqual(visible(teacher),['Bright']);
 const first=teacher.host.querySelector('audio');teacher.fire(teacher.host.querySelector('.ek-repeat-play'),'click');await Promise.resolve();
 teacher.click('Next phrase');pupil.mount.setViewState(view);
 assert.deepEqual(visible(pupil),['Bright','This shirt is bright.']);assert.equal(pupil.button('Next phrase').hidden,true);
 pupil.click('Next phrase');assert.deepEqual(visible(pupil),['Bright','This shirt is bright.']);
 assert.equal(teacher.host.querySelector('audio'),first);assert.equal(first.paused,true);
 assert.ok([...pupil.host.querySelectorAll('audio')].every(audio=>audio.paused));
 teacher.mount.setViewState(view);assert.equal(first.paused,true);assert.equal(teacher.host.querySelectorAll('audio')[1].paused,false);
 teacher.click('Next phrase');pupil.mount.setViewState(view);
 assert.deepEqual(visible(pupil),['Bright','This shirt is bright.','Dark']);assert.equal(teacher.button('Next phrase'),undefined);
 assert.equal(teacher.host.querySelector('.ek-repeat-list strong, .ek-repeat-list b'),null);
 const last=teacher.host.querySelectorAll('audio')[2];await Promise.resolve();assert.equal(last.paused,false);
 teacher.click('Previous phrase');pupil.mount.setViewState(view);assert.equal(last.paused,true);
 assert.deepEqual(visible(pupil),['Bright','This shirt is bright.']);
 teacher.click('Next phrase');assert.equal(teacher.host.querySelectorAll('audio')[2],last);
 assert.deepEqual(visible(teacher),['Bright','This shirt is bright.','Dark']);
});

test('writing hints sit under the field and never enter submitted answer examples',()=>{
 const def={version:1,id:'writing-hint',kind:'writing',title:'Write a reply.',responseMode:'open',items:[{id:'reply',prompt:'How does it look?',hint:'Use: warm',possibleAnswers:['It looks warm.']}]};
 const s=setup(def),input=s.host.querySelector('input'),hint=s.host.querySelector('.ek-writing-hint');
 assert.equal(input.nextElementSibling,hint);assert.equal(input.getAttribute('aria-describedby'),hint.id);
 input.value='It looks very warm.';s.fire(input,'input');s.click('OK');
 assert.equal(s.host.querySelector('.ek-writing-answers'),null);assert.equal(s.host.querySelector('.ek-status').textContent,'Well done');assert.equal(input.dataset.feedback,'review');
 assert.throws(()=>kit.validate({...def,items:[{...def.items[0],hint:42}]}),/hint/);
});
test('opening a disclosure scrolls its complete content, with the beginning taking priority',()=>{
 for(const [bottom,expected] of [[850,198],[1500,484]]){
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
 s.click('Show next exercise');assert.equal(target,148);
});

test('Order corrections are a plain sentence with singular heading and no arrows',()=>{
 const s=setup({version:1,id:'order-plain',kind:'order',title:'Put the words in order.',tokens:[{id:'i',text:'I'},{id:'am',text:'am'},{id:'warm',text:'warm'},{id:'dot',text:'.'}],correctOrder:['i','am','warm','dot']},{syncChecks:true});
 s.mount.setAnswers({order:['am','i','warm','dot'],__sw_checked:true});
 assert.equal(s.host.querySelector('.ek-feedback-heading').textContent,'Correct Answer');
 assert.equal(s.host.querySelector('.ek-answer-pairs strong').textContent,'I am warm.');
});
test('reveal beginning stays clear of floating utilities on a full-height canvas',()=>{
 const s=setup({version:1,id:'canvas-clearance',kind:'presentation',title:'Rule',blocks:[{type:'disclosure',title:'Open rule',text:'Long content',open:false}]}),scroll=s.document.createElement('div'),utility=s.document.createElement('div');
 utility.id='workspaceUtilityBar';s.document.body.append(utility);utility.getBoundingClientRect=()=>({top:12,bottom:44,height:32});
 scroll.className='lesson-scroll';s.host.before(scroll);scroll.append(s.host);scroll.scrollTop=0;scroll.getBoundingClientRect=()=>({top:0,bottom:600,height:600});
 let target;scroll.scrollTo=value=>{target=value.top;};const detail=s.host.querySelector('details');detail.getBoundingClientRect=()=>({top:300,bottom:1100,height:800});
 s.fire(detail.querySelector('summary'),'click');assert.equal(target,242);
});

test('student touch dropdown survives a null-relatedTarget blur and applies choice before OK',()=>{
 const def={version:1,id:'touch-gap',kind:'gaps',title:'Choose.',inputMode:'select',items:[{id:'line',segments:['This ',{id:'word',answers:['skirt'],options:['blouse','skirt','hat']},' is new.']}]};
 const student=setup(def,{navigationReadOnly:true,syncChecks:true}),teacher=setup(def,{syncChecks:true});
 const trigger=student.host.querySelector('.ek-choice-trigger');student.fire(trigger,'click');
 const menu=student.host.querySelector('.ek-inline-menu');assert.equal(menu.hidden,false);
 student.fire(menu.querySelector('button'),'focusout',{relatedTarget:null});assert.equal(menu.hidden,false,'Safari touch blur must not hide the tapped option');
 student.fire(menu.querySelector('[data-option-value="skirt"]'),'click');
 assert.equal(student.mount.getAnswers().word,'skirt');assert.equal(menu.hidden,true);assert.equal(student.host.querySelector('.ek-check').hidden,false);
 teacher.mount.setAnswers(student.mount.getAnswers());assert.match(teacher.host.querySelector('.ek-choice-trigger').textContent,/skirt/);
 student.click('OK');teacher.mount.setAnswers(student.mount.getAnswers());assert.equal(teacher.host.querySelector('.ek-choice-trigger').getAttribute('data-feedback'),'correct');
});
test('inline dropdown flips above the trigger inside the phone visual viewport',()=>{
 const s=setup({version:1,id:'viewport-gap',kind:'gaps',title:'Choose.',inputMode:'select',items:[{id:'line',segments:[{id:'word',answers:['hat'],options:['coat','hat']}]}]});
 const trigger=s.host.querySelector('.ek-choice-trigger'),menu=s.host.querySelector('.ek-inline-menu');
 s.window.visualViewport={offsetLeft:0,offsetTop:0,width:390,height:500,addEventListener(){},removeEventListener(){}};
 trigger.getBoundingClientRect=()=>({left:300,top:410,bottom:450,width:80,height:40});
 menu.getBoundingClientRect=()=>({width:150,height:160});
 s.fire(trigger,'click');assert.equal(menu.style.top,'243px');assert.equal(menu.style.left,'228px');
 s.mount.destroy();
});
test('wrong picture matches show image-answer cards with horizontal navigation',()=>{
 const s=setup({version:1,id:'picture-feedback',kind:'matching',layout:'picture-word',title:'Match.',items:[{id:'p1',text:'Picture 1',image:'coat.webp',alt:'A coat',correctId:'coat'},{id:'p2',text:'Picture 2',image:'hat.webp',alt:'A hat',correctId:'hat'}],options:[{id:'hat',text:'hat'},{id:'coat',text:'coat'}]},{syncChecks:true});
 s.mount.setAnswers({p1:'hat',p2:'coat',__sw_checked:true});
 const cards=s.host.querySelectorAll('.ek-picture-correction-card');assert.equal(cards.length,2);assert.equal(cards[0].querySelector('img').src,'coat.webp');assert.equal(cards[0].querySelector('strong').textContent,'coat');
 assert.ok(!s.host.querySelector('.ek-results').textContent.includes('Picture 1'));
 const track=s.host.querySelector('.ek-picture-correction-track');let movement;track.scrollBy=args=>{movement=args.left;};cards[0].getBoundingClientRect=()=>({width:160});
 s.click('Next correct pictures');assert.equal(movement,172);s.click('Previous correct pictures');assert.equal(movement,-172);
});

test('learner audio controls stay locked after metadata while response controls remain usable',()=>{
 const def={version:1,id:'listening-lock',kind:'stage',layout:'grouped',title:'Listen.',exercises:[{id:'audio',exercise:{version:1,id:'clip',kind:'audio',title:'Audio',audio:'dialogue.mp3'}},{id:'question',exercise:{version:1,id:'question',kind:'gaps',title:'Answer.',inputMode:'text',items:[{id:'row',segments:[{id:'word',answers:['coat']}]}]}}]};
 const pupil=setup(def,{audioReadOnly:true,navigationReadOnly:true}),teacher=setup(def);
 const play=pupil.host.querySelector('.ek-audio-play'),range=pupil.host.querySelector('.ek-audio-range'),audio=pupil.host.querySelector('audio');
 assert.equal(play.disabled,true);audio.duration=20;pupil.fire(audio,'loadedmetadata');assert.equal(range.disabled,true);
 pupil.fire(play,'click');assert.equal(audio.paused,true);range.value='75';pupil.fire(range,'input');assert.equal(audio.currentTime,0);
 const answer=pupil.host.querySelector('.ek-typed-gap');assert.equal(Boolean(answer.disabled),false);answer.value='coat';pupil.fire(answer,'input');assert.equal(pupil.mount.getAnswers().question.word,'coat');
 assert.equal(Boolean(teacher.host.querySelector('.ek-audio-play').disabled),false);
 pupil.mount.destroy();teacher.mount.destroy();
});
test('picture-word dialogs keep a common frame and shrink its height before answer content on small viewports',()=>{
 const words=['coat','skirt','hat'],items=words.map((word,i)=>({id:word,text:'Picture '+(i+1),image:word+'.webp',imageWidth:[800,300,1000][i],imageHeight:[1000,1200,500][i],alt:word,correctId:word}));
 const s=setup({version:1,id:'compact-picture',kind:'matching',layout:'picture-word',title:'Match the pictures with the words.',items,options:words.map(word=>({id:word,text:word}))});
 const listeners=new Map(),viewport={width:390,height:500,offsetLeft:0,offsetTop:0,addEventListener(type,fn){listeners.set(type,fn);},removeEventListener(type,fn){if(listeners.get(type)===fn)listeners.delete(type);}};s.window.visualViewport=viewport;
 s.window.getComputedStyle=el=>({getPropertyValue:name=>name==='--sw-picture-word-dialog-height'?'330px':'',paddingLeft:'12px',paddingRight:'12px',paddingTop:'12px',paddingBottom:'12px'});
 const create=s.document.createElement.bind(s.document);
 s.document.createElement=tag=>{
   const el=create(tag);
   if(tag==='div')el.getBoundingClientRect=()=>({width:Math.min(360,viewport.width-32)-40,height:parseFloat(el.style.height)||0});
   if(tag==='dialog'){
     // Emulate measured title/options/padding separately from artwork; the
     // fitter must reserve this content rather than shrinking the whole dialog.
     Object.defineProperty(el,'scrollHeight',{get:()=>240+(parseFloat(el.querySelector('.ek-dialog-picture-frame')?.style.height)||0)});
     el.getBoundingClientRect=()=>({width:Math.min(360,viewport.width-32),height:el.scrollHeight});
   }
   return el;
 };
 for(const [width,height] of [[1280,900],[390,500],[320,568],[844,320]]){
   Object.assign(viewport,{width,height});
   const shapes=[];
   for(const slot of s.host.querySelectorAll('.ek-match-slot')){
     s.fire(slot,'click');const dialog=s.host.querySelector('dialog'),frame=dialog.querySelector('.ek-dialog-picture-frame'),image=frame.querySelector('img');
     assert.ok(dialog.classList.contains('ek-picture-word-dialog'));assert.equal(dialog.style.maxHeight,(height-24)+'px');assert.equal(dialog.style.maxWidth,(width-24)+'px');
     assert.ok(dialog.scrollHeight<=height-24,'all answer content remains inside the visible height');assert.ok(parseFloat(frame.style.height)<=330);assert.ok(parseFloat(frame.style.height)>0);
     assert.equal(dialog.querySelector('.ek-picture-prompt').style.width,'100%');assert.equal(parseFloat(image.style.width),frame.getBoundingClientRect().width-24);assert.equal(parseFloat(image.style.height),Math.max(0,parseFloat(frame.style.height)-24));
     assert.equal(image.style.minWidth,'0');assert.equal(image.style.minHeight,'0');
     assert.ok(!dialog.style.getPropertyValue('--ek-picture-dialog-width'),'artwork proportions do not set outer width');
     shapes.push([dialog.getBoundingClientRect().width,frame.style.height]);
     image.naturalWidth=50;image.naturalHeight=900;s.fire(image,'load');assert.equal(frame.style.height,shapes.at(-1)[1],'loading narrow art keeps the same frame');
     s.fire(dialog.querySelector('.ek-close'),'click');assert.equal(listeners.size,0);
   }
   assert.deepEqual(shapes,[shapes[0],shapes[0],shapes[0]],'coat, skirt and hat use the same dialog dimensions');
 }
 s.fire(s.host.querySelector('.ek-match-slot'),'click');const frame=s.host.querySelector('.ek-dialog-picture-frame'),shortHeight=parseFloat(frame.style.height);
 Object.assign(viewport,{height:800,offsetLeft:15,offsetTop:20});listeners.get('resize')();assert.equal(frame.style.height,'330px');assert.ok(parseFloat(frame.style.height)>shortHeight);
 assert.equal(s.host.querySelector('dialog').style.left,'257px');s.mount.destroy();
});

test('a picture-word crop fits inside the common dialog frame without changing its shape',()=>{
 const s=setup({version:1,id:'cropped-picture',kind:'matching',layout:'picture-word',title:'Match.',items:[{id:'hat',text:'Picture 1',image:'clothes.webp',imageWidth:1200,imageHeight:900,crop:{x:10,y:20,w:60,h:20},alt:'Hat',correctId:'hat'}],options:[{id:'hat',text:'hat'}]});
 s.window.getComputedStyle=()=>({getPropertyValue:name=>name==='--sw-picture-word-dialog-height'?'330px':'',paddingLeft:'12px',paddingRight:'12px',paddingTop:'12px',paddingBottom:'12px'});
 const create=s.document.createElement.bind(s.document);s.document.createElement=tag=>{const el=create(tag);if(tag==='div')el.getBoundingClientRect=()=>({width:320,height:parseFloat(el.style.height)||0});if(tag==='dialog'){Object.defineProperty(el,'scrollHeight',{get:()=>180+(parseFloat(el.querySelector('.ek-dialog-picture-frame')?.style.height)||0)});el.getBoundingClientRect=()=>({width:360,height:el.scrollHeight});}return el;};
 s.fire(s.host.querySelector('.ek-match-slot'),'click');const dialog=s.host.querySelector('dialog'),frame=dialog.querySelector('.ek-dialog-picture-frame'),crop=frame.querySelector('.ek-crop-image');
 assert.equal(frame.style.height,'330px');assert.equal(crop.style.width,'296px');assert.equal(crop.style.height,'74px');assert.ok(!dialog.style.getPropertyValue('--ek-picture-dialog-width'));
 assert.match(crop.style.backgroundImage,/clothes.webp/);s.mount.destroy();
});

test('picture matches keep plain choices while text matches use letters separately from source numbers and checked results',()=>{
 for(const layout of ['picture-word','word-translation','word-definition']){
  const pictured=layout==='picture-word';
  const def={version:1,id:'vocabulary-'+layout,kind:'matching',layout,title:'Match the words.',items:[
   {id:'coat',text:'coat',...(layout==='picture-word'?{image:'coat.webp',alt:'Coat'}:{}),correctId:'coat'},
   {id:'hat',text:'hat',...(layout==='picture-word'?{image:'hat.webp',alt:'Hat'}:{}),correctId:'hat'}],options:[{id:'hat',text:'hat'},{id:'coat',text:'coat'}]};
  const s=setup(def,{syncChecks:true}),slots=[...s.host.querySelectorAll('.ek-match-slot')];
  const sourceNumbers=()=>[...s.host.querySelectorAll('.ek-card>.ek-number')].map(el=>el.textContent);
  assert.deepEqual(sourceNumbers(),['1','2']);assert.equal(slots[0].querySelector('.ek-match-answer-number').textContent,'');
  s.fire(slots[0],'click');const dialog=s.host.querySelector('.ek-vocabulary-dialog');
  if(pictured){
   assert.equal(dialog.querySelector('.ek-vocabulary-source'),null);
   assert.equal(dialog.querySelector('.ek-vocabulary-options'),null);
   assert.equal(dialog.querySelector('.ek-vocabulary-option'),null);
   assert.equal(dialog.querySelector('.ek-option-number'),null);
   assert.deepEqual([...dialog.querySelectorAll('.ek-option')].map(el=>el.textContent),['hat','coat']);
  }else{
   assert.equal(dialog.querySelector('.ek-vocabulary-source').textContent,'coat');
   assert.deepEqual([...dialog.querySelectorAll('.ek-option-number')].map(el=>el.textContent),['A','B']);
   assert.deepEqual([...dialog.querySelectorAll('.ek-option-label')].map(el=>el.textContent),['hat','coat']);
   assert.equal(dialog.querySelector('.ek-option').getAttribute('aria-label'),'A: hat');
  }
  s.fire(dialog.querySelector('.ek-option'),'click');assert.equal(slots[0].querySelector('.ek-match-answer-label').textContent,'hat');
  assert.equal(slots[0].querySelector('.ek-match-answer-number').dataset.number,pictured?'':'A');
  assert.equal(slots[0].querySelector('.ek-match-answer-number').getAttribute('aria-label'),pictured?'Selected match; not checked':'Selected option A');
  s.mount.setAnswers({coat:'hat',hat:'coat',__sw_checked:true});
  assert.equal(slots[0].querySelector('.ek-match-answer-number').dataset.result,'retry');assert.deepEqual(sourceNumbers(),['1','2']);
  assert.equal(s.host.querySelectorAll('.ek-card>.ek-number[data-result]').length,0);
  const count=s.changes.length;s.fire(slots[1],'click');const currentDialog=s.host.querySelector('dialog');
  s.mount.setAnswers({coat:'hat',hat:'coat'});assert.equal(s.host.querySelector('dialog'),currentDialog);assert.equal(s.changes.length,count);
  s.fire(currentDialog.querySelector('.ek-option'),'click');assert.deepEqual(s.mount.getAnswers(),{hat:'hat'});
  assert.equal(slots[0].querySelector('.ek-match-answer-number').dataset.number,'');assert.equal(slots[1].querySelector('.ek-match-answer-number').dataset.number,pictured?'':'A');
  assert.equal(s.host.querySelectorAll('.ek-match-answer-number[data-result]').length,0);
  s.mount.setAnswers({coat:'coat',hat:'hat',__sw_checked:true});assert.equal(slots[0].querySelector('.ek-match-answer-number').dataset.result,'correct');
  assert.equal(s.changes.length,count+1);s.click('Reset exercise');assert.deepEqual(s.mount.getAnswers(),{});
  assert.equal(s.host.querySelectorAll('.ek-match-answer-number[data-result]').length,0);s.mount.destroy();
 }
 const generic=setup('matching-demo');assert.equal(generic.host.querySelector('.ek-match-answer-number'),null);
 generic.fire(generic.host.querySelector('.ek-match-slot'),'click');assert.equal(generic.host.querySelector('.ek-option-number'),null);
 generic.mount.destroy();
});

test('the whole picture card opens its picker without duplicating plus clicks or intercepting other controls',()=>{
 const def={version:1,id:'whole-picture',kind:'matching',layout:'picture-word',title:'Match.',items:[{id:'coat',text:'coat',image:'coat.webp',alt:'Coat',audio:'coat.mp3',correctId:'coat'}],options:[{id:'coat',text:'coat'}]};
 const s=setup(def),card=s.host.querySelector('.ek-card'),slot=card.querySelector('.ek-match-slot');
 const openAndClose=target=>{
  s.fire(target,'click');assert.equal(s.host.querySelectorAll('dialog').length,1);assert.equal(s.host.querySelector('dialog').open,true);
  s.fire(s.host.querySelector('.ek-close'),'click');assert.equal(s.host.querySelector('dialog'),null);
 };
 for(const target of [card,card.querySelector('img'),card.querySelector('.ek-picture-word-media'),card.querySelector('.ek-number'),slot])openAndClose(target);
 const play=card.querySelector('.ek-repeat-play');s.fire(play,'click');assert.equal(s.host.querySelector('dialog'),null);assert.equal(card.querySelector('audio').paused,false);
 const link=s.document.createElement('a');link.href='#';link.textContent='Details';card.append(link);s.fire(link,'click');assert.equal(s.host.querySelector('dialog'),null);
 const cancelled=s.document.createElement('span');card.append(cancelled);cancelled.addEventListener('click',event=>event.preventDefault());s.fire(cancelled,'click');assert.equal(s.host.querySelector('dialog'),null);
 assert.deepEqual(s.mount.getAnswers(),{});assert.equal(s.changes.length,0);s.mount.destroy();
 const locked=setup(def,{readOnly:true});assert.equal(locked.host.querySelector('.ek-match-slot').disabled,true);
 for(const target of [locked.host.querySelector('.ek-card'),locked.host.querySelector('img'),locked.host.querySelector('.ek-match-slot')])locked.fire(target,'click');
 assert.equal(locked.host.querySelector('dialog'),null);assert.deepEqual(locked.mount.getAnswers(),{});assert.equal(locked.changes.length,0);locked.mount.destroy();
});

test('selection dialog closes only for a complete outside click and preserves the attempt and opener focus',()=>{
 const s=setup('picture-word-demo',{syncChecks:true}),slot=s.host.querySelector('.ek-match-slot');
 s.mount.setAnswers({item1:'option2',__sw_checked:true});const saved=s.mount.getAnswers(),changeCount=s.changes.length;
 let focused=0;slot.focus=()=>{focused++;};
 s.fire(slot,'click');const dialog=s.host.querySelector('dialog');dialog.getBoundingClientRect=()=>({left:100,right:400,top:100,bottom:500,width:300,height:400});
 const gesture=(start,end)=>{s.fire(dialog,'pointerdown',{clientX:start[0],clientY:start[1]});s.fire(dialog,'click',{clientX:end[0],clientY:end[1]});};
 gesture([110,110],[110,110]);assert.equal(dialog.open,true,'inside padding is not the backdrop');
 gesture([110,110],[50,50]);assert.equal(dialog.open,true,'dragging from inside does not dismiss');
 gesture([50,50],[110,110]);assert.equal(dialog.open,true,'a gesture ending inside does not dismiss');
 s.fire(dialog,'pointerdown',{clientX:50,clientY:50});s.fire(dialog,'pointercancel');s.fire(dialog,'click',{clientX:50,clientY:50});assert.equal(dialog.open,true);
 gesture([50,50],[50,50]);assert.equal(s.host.querySelector('dialog'),null);assert.equal(focused,1);
 assert.deepEqual(s.mount.getAnswers(),saved);assert.equal(s.changes.length,changeCount);
 s.fire(slot,'click');s.fire(s.host.querySelector('dialog'),'keydown',{key:'Escape'});assert.equal(s.host.querySelector('dialog'),null);
 assert.deepEqual(s.mount.getAnswers(),saved);assert.equal(s.changes.length,changeCount);s.mount.destroy();
});

test('only cropped picture-word artwork uses a containing card frame with its original art ratio',()=>{
 const s=setup({version:1,id:'crop-card-fit',kind:'matching',layout:'picture-word',title:'Match.',items:[
  {id:'wide',text:'Picture 1',image:'clothes.webp',imageWidth:1200,imageHeight:900,crop:{x:10,y:20,w:60,h:20},alt:'Hat',correctId:'hat'},
  {id:'fallback',text:'Picture 2',image:'clothes.webp',crop:{x:10,y:20,w:20,h:40},alt:'Coat',correctId:'coat'},
  {id:'normal',text:'Picture 3',image:'skirt.webp',imageWidth:300,imageHeight:1200,alt:'Skirt',correctId:'skirt'}],options:['hat','coat','skirt'].map(word=>({id:word,text:word}))});
 const cards=[...s.host.querySelectorAll('.ek-picture-word-card')],crops=[...s.host.querySelectorAll('.ek-picture-word-crop-frame>.ek-crop-image')];
 assert.equal(crops.length,2);assert.equal(crops[0].style.getPropertyValue('--ek-crop-art-ratio'),'4');assert.equal(crops[1].style.getPropertyValue('--ek-crop-art-ratio'),String(2/3));
 assert.equal(cards[2].querySelector('.ek-picture-word-crop-frame'),null);assert.equal(cards[2].querySelector('img').getAttribute('width'),'300');
 assert.equal(crops[0].style.backgroundSize,'166.66666666666666% 500%');assert.match(crops[0].style.backgroundImage,/clothes.webp/);
 assert.deepEqual(s.mount.getAnswers(),{});assert.equal(s.changes.length,0);
 const saved={wide:'hat',fallback:'hat',normal:'skirt',__sw_checked:true};s.mount.setAnswers(saved);s.click('OK');
 const corrections=[...s.host.querySelectorAll('.ek-picture-corrections .ek-picture-correction-card')];assert.equal(corrections.length,1);assert.equal(corrections[0].getAttribute('data-answer-number'),'2');
 const correctedCrop=corrections[0].querySelector('.ek-picture-correction-crop-frame>.ek-crop-image');assert.ok(correctedCrop);assert.equal(correctedCrop.style.getPropertyValue('--ek-crop-art-ratio'),String(2/3));
 assert.equal(correctedCrop.style.backgroundSize,crops[1].style.backgroundSize);assert.deepEqual(s.mount.getAnswers(),saved);s.mount.destroy();
});

test('local and shared feedback reveal the following arrow with a comfortable bottom gap',()=>{
 const task={version:1,id:'feedback-task',title:'Choose',kind:'choice',items:[{id:'q',prompt:'Pick one.',options:[{id:'a',text:'A'},{id:'b',text:'B'},{id:'c',text:'C'}],correctId:'a'}]};
 for(const remote of [false,true]){
   const s=setup({version:1,id:'feedback-stage',kind:'stage',title:'Practice',progressive:true,exercises:[{id:'one',exercise:task},{id:'two',exercise:{...task,id:'next-task'}}]},{syncChecks:true});
   const scroll=s.document.createElement('div');scroll.className='lesson-scroll';s.host.before(scroll);scroll.append(s.host);scroll.scrollTop=100;
   scroll.getBoundingClientRect=()=>({top:0,bottom:600,height:600});const targets=[];scroll.scrollTo=value=>targets.push(value.top);
   const child=s.host.querySelector('.ek-stage-host');child.querySelector('.ek-status').getBoundingClientRect=()=>({top:400,bottom:450,height:50});child.querySelector('.ek-results').getBoundingClientRect=()=>({top:450,bottom:720,height:270});
   s.host.querySelector('.ek-stage-navigation').getBoundingClientRect=()=>({top:760,bottom:800,height:40});
   if(remote)s.mount.setAnswers({one:{q:'b',__sw_checked:true}});
   else{s.mount.setAnswers({one:{q:'b'}});s.click('OK');}
   assert.equal(targets.at(-1),348,'includes arrow bottom + 48px, not just feedback');
   const count=targets.length;s.mount.setAnswers(s.mount.getAnswers());assert.equal(targets.length,count,'same snapshot must not pull the reader back down');
 }
});
test('long feedback reaches its end, while another visible task is never included',()=>{
 const s=setup({version:1,id:'long-feedback',kind:'choice',title:'Choose',items:[{id:'q1',prompt:'Pick.',options:[{id:'a',text:'A'},{id:'b',text:'B'},{id:'c',text:'C'}],correctId:'a'}]},{syncChecks:true}),scroll=s.document.createElement('div');scroll.className='lesson-scroll';s.host.before(scroll);scroll.append(s.host);scroll.scrollTop=0;
 scroll.getBoundingClientRect=()=>({top:0,bottom:600,height:600});let target;scroll.scrollTo=value=>{target=value.top;};
 s.host.querySelector('.ek-status').getBoundingClientRect=()=>({top:200,bottom:250,height:50});s.host.querySelector('.ek-results').getBoundingClientRect=()=>({top:250,bottom:1200,height:950});
 const next=s.document.createElement('section');next.textContent='Another visible exercise';next.getBoundingClientRect=()=>({top:1200,bottom:2000,height:800});scroll.append(next);
 s.mount.setAnswers({q1:'wrong',__sw_checked:true});assert.equal(target,648);
});

test('feedback scrolling waits for the final layout and is cancelled when the exercise unmounts',()=>{
 const def={version:1,id:'frame-feedback',kind:'choice',title:'Choose',items:[{id:'q',prompt:'Pick.',options:[{id:'a',text:'A'},{id:'b',text:'B'},{id:'c',text:'C'}],correctId:'a'}]};
 const s=setup(def,{syncChecks:true}),scroll=s.document.createElement('div');scroll.className='lesson-scroll';s.host.before(scroll);scroll.append(s.host);scroll.scrollTop=0;
 scroll.getBoundingClientRect=()=>({top:0,bottom:600,height:600});let target,frame,bottom=620;scroll.scrollTo=value=>{target=value.top;};
 const view=s.document.defaultView,original=view.requestAnimationFrame,originalCancel=view.cancelAnimationFrame;
 view.requestAnimationFrame=fn=>{frame=fn;return 1;};view.cancelAnimationFrame=()=>{frame=null;};
 try{
   s.host.querySelector('.ek-status').getBoundingClientRect=()=>({top:300,bottom:350,height:50});s.host.querySelector('.ek-results').getBoundingClientRect=()=>({top:350,bottom,height:bottom-350});
   s.mount.setAnswers({q:'b',__sw_checked:true});assert.equal(target,undefined);
   bottom=800;frame();assert.equal(target,248,'uses the final height');
   target=undefined;s.mount.setAnswers({q:'c',__sw_checked:true});s.mount.destroy();assert.equal(frame,null);assert.equal(target,undefined);
 }finally{view.requestAnimationFrame=original;view.cancelAnimationFrame=originalCancel;}
});


test('one mistaken closed response shows all four original answers without changing saved responses',()=>{
 const words=['coat','hat','belt','scarf'],options=words.map((text,i)=>({id:'o'+i,text}));
 const cases=[
  {kind:'choice',items:words.map((word,i)=>({id:'i'+i,prompt:'Question '+(i+1),options,correctId:'o'+i}))},
  {kind:'choice',multiple:true,items:words.map((word,i)=>({id:'i'+i,prompt:'Question '+(i+1),options,correctIds:['o'+i]}))},
  {kind:'matching',options,items:words.map((word,i)=>({id:'i'+i,text:'Prompt '+(i+1),correctId:'o'+i}))},
  {kind:'sort',groups:options,items:words.map((word,i)=>({id:'i'+i,text:'Item '+(i+1),correctId:'o'+i}))},
  {kind:'writing',responseMode:'accepted',items:words.map((word,i)=>({id:'i'+i,prompt:'Word '+(i+1),acceptedAnswers:[word,`a ${word}`]}))},
  {kind:'gaps',inputMode:'text',items:words.map((word,i)=>({id:'i'+i,segments:['This is a ',{id:'g'+i,answers:[word]},'.']}))}
 ];
 for(const [index,content] of cases.entries()){
  const def={version:1,id:'complete-key-'+index,title:'Practice.',...content},s=setup(def,{syncChecks:true});
  const answers=Object.fromEntries(words.map((word,i)=>{
   const key=def.kind==='gaps'?'g'+i:'i'+i;
   const value=def.kind==='writing'||def.kind==='gaps'?(i===0?word:'wrong'):'o'+(i===0?0:i%3+1);
   return [key,def.multiple?[value]:value];
  }));
  const saved={...answers,__sw_checked:true};s.mount.setAnswers(saved);
  const rows=[...s.host.querySelectorAll('.ek-answer-pairs>li')];
  assert.equal(rows.length,4,def.kind+(def.multiple?' multiple':''));
  assert.deepEqual(rows.map(row=>row.getAttribute('value')),['1','2','3','4']);
  assert.deepEqual(rows.map(row=>row.dataset.result),['correct','retry','retry','retry']);
  assert.deepEqual(rows.map(row=>row.querySelector('.ek-attempt-marker').getAttribute('aria-label')),['Your last answer was correct','Your last answer was incorrect','Your last answer was incorrect','Your last answer was incorrect']);
  assert.deepEqual(rows.map(row=>row.querySelector('strong').textContent),words);
  assert.deepEqual(s.mount.getAnswers(),saved);assert.equal(s.changes.length,0);
  const correct=Object.fromEntries(words.map((word,i)=>[def.kind==='gaps'?'g'+i:'i'+i,def.kind==='writing'||def.kind==='gaps'?word:def.multiple?['o'+i]:'o'+i]));
  s.mount.setAnswers({...correct,__sw_checked:true});assert.equal(s.host.querySelector('.ek-correction'),null);
 }
});

test('picture corrections omit correct matches and retain original numbers, navigation and answer state',()=>{
 const words=['coat','hat','belt','scarf'];
 const s=setup({version:1,id:'all-picture-answers',kind:'matching',layout:'picture-word',title:'Match.',
  items:words.map((word,i)=>({id:'i'+i,text:'Picture '+(i+1),image:word+'.webp',alt:word,correctId:word})),options:words.map(word=>({id:word,text:word}))},{syncChecks:true});
 const saved={i0:'coat',i1:'belt',i2:'scarf',i3:'hat',__sw_checked:true};s.mount.setAnswers(saved);
 const cards=[...s.host.querySelectorAll('.ek-picture-correction-card')];
 assert.deepEqual(cards.map(card=>card.querySelector('strong').textContent),words.slice(1));
 assert.deepEqual(cards.map(card=>card.getAttribute('data-answer-number')),['2','3','4']);assert.deepEqual(cards.map(card=>card.dataset.result),['retry','retry','retry']);
 assert.deepEqual(cards.map(card=>card.querySelector('.ek-attempt-marker').textContent),['×','×','×']);
 assert.deepEqual(cards.map(card=>card.querySelector('img').src),words.slice(1).map(word=>word+'.webp'));
 assert.deepEqual(s.mount.getAnswers(),saved);assert.equal(s.changes.length,0);assert.ok(s.button('Next correct pictures'));
 s.mount.setAnswers({i0:'coat',i1:'belt',__sw_checked:true});
 const remaining=[...s.host.querySelectorAll('.ek-picture-correction-card')];
 assert.deepEqual(remaining.map(card=>card.getAttribute('data-answer-number')),['2','3','4']);
 assert.deepEqual(remaining.map(card=>card.dataset.result),['retry','empty','empty']);
 assert.deepEqual(remaining.map(card=>card.querySelector('.ek-attempt-marker').textContent),['×','–','–']);
 assert.equal(s.host.querySelectorAll('.ek-picture-correction-card[data-result="correct"]').length,0);
 s.mount.setAnswers({...Object.fromEntries(words.map((word,i)=>['i'+i,word])),__sw_checked:true});assert.equal(s.host.querySelector('.ek-picture-corrections'),null);
});

test('a mixed picture and text writing key keeps original order and skips unkeyed prompts without renumbering',()=>{
 const def={version:1,id:'mixed-key',kind:'writing',title:'Write.',items:[
  {id:'one',prompt:'First',acceptedAnswers:['coat'],image:'coat.webp',alt:'Coat'},
  {id:'two',prompt:'Tell me your own idea.',possibleAnswers:['My personal idea']},
  {id:'three',prompt:'Third',acceptedAnswers:['belt']},
  {id:'four',prompt:'Fourth',acceptedAnswers:['scarf'],image:'scarf.webp',alt:'Scarf'}]};
 const s=setup(def,{syncChecks:true});s.mount.setAnswers({one:'coat',two:'Something personal',three:'hat',four:'wrong',__sw_checked:true});
 const cards=[...s.host.querySelectorAll('.ek-picture-correction-card')];
 assert.deepEqual(cards.map(card=>card.querySelector('strong').textContent),['belt','scarf']);
 assert.deepEqual(cards.map(card=>card.getAttribute('data-answer-number')),['3','4']);
 assert.equal(cards[0].querySelector('img'),null);assert.match(cards[0].textContent,/Third/);
 assert.doesNotMatch(s.host.querySelector('.ek-results').textContent,/My personal idea|Something personal/);
});

test('a revealed question keeps its original correction number across the progressive adapter',()=>{
 const def={version:1,id:'question-numbers',kind:'choice',title:'Choose the correct answer.',progressiveQuestions:true,items:[
  {id:'first',prompt:'First?',options:[{id:'a',text:'One'},{id:'b',text:'Wrong'}],correctId:'a'},
  {id:'second',prompt:'Second?',options:[{id:'a',text:'Two'},{id:'b',text:'Wrong'}],correctId:'a'}]};
 const s=setup(def,{syncChecks:true});s.mount.setAnswers({first:'a',second:'b',__sw_choice_revealed:2,__sw_choice_checked:['first','second']});
 const rows=[...s.host.querySelectorAll('.ek-answer-pairs>li')];
 assert.equal(rows.length,1);assert.equal(rows[0].getAttribute('value'),'2');assert.match(rows[0].textContent,/Second.*Two/);
 assert.equal(s.mount.getAnswers().first,'a');assert.equal(s.mount.getAnswers().second,'b');assert.equal(s.changes.length,0);
});

test('generic duplicate task copy is hidden but contextual directions and examples remain',()=>{
 const task={version:1,id:'generic-task',kind:'gaps',title:'Complete the sentences with the correct words.',inputMode:'select',instruction:'Choose the correct options.',items:[{id:'row',segments:['This is a ',{id:'gap',answers:['coat'],options:['coat','hat']},'.']}]};
 const stage={version:1,id:'one-task-heading',kind:'stage',title:'Complete the sentences.',exercises:[{id:'task',exercise:task}]};
 const s=setup(stage);assert.equal(s.host.querySelectorAll('.ek-title').length,1);assert.equal(s.host.querySelector('.ek-instruction'),null);assert.ok(s.host.querySelector('.ek-choice-trigger'));
 const specific=setup({...task,instruction:'Look at the picture. Choose one word for each gap.'});
 assert.equal(specific.host.querySelector('.ek-instruction').textContent,'Look at the picture. Choose one word for each gap.');
 const separate=setup({...stage,exercises:[{id:'task',exercise:{...task,title:'Complete the questions about your weekend.',instruction:'Write one or two words in each gap.'}}]});
 assert.equal(separate.host.querySelectorAll('.ek-title').length,2);assert.match(separate.host.querySelector('.ek-instruction').textContent,/one or two words/);
});

test('actual Complete the rules example has one heading, no generic instruction repeat and unchanged examples',()=>{
 const app={SpaceWhaleExerciseKit:kit,SpaceWhaleLessonMedia:{},SpaceWhaleContent:[]};
 vm.runInNewContext(fs.readFileSync(require.resolve('../course-content-module4-45.js'),'utf8'),{window:app});
 const lesson=app.SpaceWhaleContent.find(lesson=>lesson.id==='a1-2-w4-l4'),def=lesson.stages.find(stage=>stage.exercise.id==='L4-discovery-rule').exercise;
 const before=JSON.stringify(def),s=setup(def,{syncChecks:true});
 assert.equal(s.host.querySelectorAll('.ek-title').length,1);assert.equal(s.host.querySelector('.ek-title').textContent,'Complete the rules.');
 assert.equal(s.host.querySelector('.ek-instruction'),null);
 assert.match(s.host.textContent,/What does she look like\? — She has long brown hair/);assert.match(s.host.textContent,/What is she like\? — She is polite and helpful/);
 assert.ok(s.host.querySelector('.ek-choice-trigger'));assert.equal(JSON.stringify(def),before);
});


test('last-attempt correction markers distinguish correct, wrong and unanswered rows and clear on edit',()=>{
 const def={version:1,id:'attempt-markers',kind:'gaps',title:'Complete the sentences.',inputMode:'text',items:['coat','hat','belt','scarf'].map((word,i)=>({id:'row'+i,segments:['This is a ',{id:'gap'+i,answers:[word]},'.']}))};
 const teacher=setup(def,{syncChecks:true});const saved={gap0:'coat',gap1:'wrong',gap2:'',gap3:'wrong',__sw_checked:true};teacher.mount.setAnswers(saved);
 const rows=[...teacher.host.querySelectorAll('.ek-answer-pairs>li')];
 assert.deepEqual(rows.map(row=>row.dataset.result),['correct','retry','empty','retry']);
 assert.deepEqual(rows.map(row=>row.querySelector('strong').textContent),['coat','hat','belt','scarf']);
 assert.deepEqual(rows.map(row=>row.querySelector('strong').hasAttribute('data-feedback')),[false,false,false,false],'canonical answers are not styled as failed answers');
 assert.equal(rows[2].querySelector('.ek-attempt-marker').getAttribute('aria-label'),'Your last answer was not completed');
 const learner=setup(def,{syncChecks:true});learner.mount.setAnswers(saved);assert.deepEqual([...learner.host.querySelectorAll('.ek-answer-pairs>li')].map(row=>row.dataset.result),['correct','retry','empty','retry']);assert.equal(learner.changes.length,0);
 const field=teacher.host.querySelector('input');field.value='coat again';teacher.fire(field,'input');assert.equal(teacher.host.querySelector('.ek-attempt-marker'),null);assert.equal(teacher.host.querySelectorAll('[data-feedback]').length,0);assert.equal(teacher.mount.getAnswers().__sw_checked,undefined);
});

test('multiple gaps share the original sentence number while accessible gap positions stay distinct',()=>{
 const def={version:1,id:'sentence-numbers',kind:'gaps',title:'Complete the sentences.',inputMode:'text',items:[
  {id:'first',segments:['I ',{id:'one',answers:['am']},' wearing a ',{id:'two',answers:['coat']},'.']},
  {id:'second',segments:['It ',{id:'three',answers:['is']},' cold.']}]};
 const s=setup(def,{syncChecks:true});
 assert.deepEqual([...s.host.querySelectorAll('.ek-sentence-number')].map(el=>el.textContent),['1. ','2. ']);
 assert.deepEqual([...s.host.querySelectorAll('.ek-gap-number')].map(el=>el.dataset.number),['1','1','2']);
 assert.deepEqual([...s.host.querySelectorAll('input')].map(el=>el.getAttribute('aria-label')),['Sentence 1, gap 1','Sentence 1, gap 2','Sentence 2, gap 1']);
 s.mount.setAnswers({one:'am',two:'wrong',three:'wrong',__sw_checked:true});assert.deepEqual([...s.host.querySelectorAll('.ek-answer-pairs>li')].map(el=>[el.getAttribute('value'),el.dataset.result]),[['1','retry'],['2','retry']]);
});

test('progressive second and third questions retain the same number in prompts, controls and corrections',()=>{
 const options=[{id:'a',text:'Correct'},{id:'b',text:'Other'}];
 for(const kind of ['choice','gaps']){
  const def={version:1,id:'progressive-numbers-'+kind,kind,title:'Complete.',progressiveQuestions:true,items:[1,2,3].map(n=>kind==='choice'?{id:'item'+n,prompt:'Question '+n,options,correctId:'a'}:{id:'item'+n,segments:['Sentence '+n+' ',{id:'gap'+n,answers:['correct'],options:['correct','other']},'.']})};
  const state=kind==='choice'?{item1:'a',item2:'b',item3:'b'}:{gap1:'correct',gap2:'other',gap3:'other'};
  const s=setup(def,{syncChecks:true});s.mount.setAnswers({...state,__sw_choice_revealed:3,__sw_choice_checked:['item1','item2','item3']});
  assert.deepEqual([...s.host.querySelectorAll('.ek-answer-pairs>li')].map(el=>el.getAttribute('value')),['2','3']);
  if(kind==='choice')assert.deepEqual([...s.host.querySelectorAll('legend')].map(el=>el.textContent),['1. Question 1','2. Question 2','3. Question 3']);
  else{assert.deepEqual([...s.host.querySelectorAll('.ek-sentence-number')].map(el=>el.textContent),['1. ','2. ','3. ']);assert.deepEqual([...s.host.querySelectorAll('.ek-choice-trigger>.ek-gap-number')].map(el=>el.dataset.number),['1','2','3']);}
  assert.equal(s.changes.length,0);
 }
});

test('radio and checkbox option feedback appears only after Check and clears on edit and reset',()=>{
 for(const multiple of [false,true]){
  const def={version:1,id:'option-feedback-'+multiple,kind:'choice',title:'Choose.',multiple,items:[{id:'question',prompt:'Pick.',options:[{id:'a',text:'One'},{id:'b',text:'Two'},{id:'c',text:'Three'}],...(multiple?{correctIds:['a','c']}:{correctId:'a'})}]};
  const s=setup(def,{syncChecks:true}),snapshot={question:multiple?['b']: 'b',__sw_checked:true};
  assert.equal(s.host.querySelector('.ek-radio[data-feedback]'),null);s.mount.setAnswers(snapshot);
  assert.deepEqual([...s.host.querySelectorAll('.ek-radio')].map(el=>el.dataset.feedback),multiple?['correct','retry','correct']:['correct','retry',undefined]);
  assert.deepEqual([...s.host.querySelectorAll('.ek-radio input')].map(el=>el.dataset.feedback),multiple?['correct','retry','correct']:['correct','retry',undefined]);
  assert.deepEqual(s.mount.getAnswers(),snapshot);const input=s.host.querySelector('input');input.checked=true;s.fire(input,'change');assert.equal(s.host.querySelector('.ek-radio[data-feedback]'),null);assert.equal(s.host.querySelector('.ek-attempt-marker'),null);
  s.click('Reset exercise');assert.equal(s.host.querySelector('[data-feedback]'),null);
 }
});

test('existing Matching and Guided Discovery previews keep one primary task heading',()=>{
 const matching=setup('matching-template');assert.deepEqual([...matching.host.querySelectorAll('.ek-title')].map(el=>el.textContent),['Match the Halves']);assert.equal(matching.host.querySelector('.ek-instruction').textContent,'Выберите подходящую пару.');
 const discovery=setup('rule-page-demo');assert.deepEqual([...discovery.host.querySelectorAll('.ek-title')].map(el=>el.textContent),['Guided Discovery']);assert.equal(discovery.host.querySelectorAll('.ek-example-model').length,2);assert.doesNotMatch(discovery.host.textContent,/\[Exercise instruction\]/);
 const authored=setup({version:1,id:'authored-example-title',kind:'rule-page',title:'Read.',blocks:[{type:'text',title:'Examples',text:'An authored model.'}]});assert.equal(authored.host.querySelector('.ek-rule-section-title').textContent,'Examples');
});

test('explicit model groups support one to three examples without splitting ordinary dialogues',()=>{
 for(const count of [1,2,3]){
  const lines=Array.from({length:count},(_,i)=>'This is model '+(i+1)+'.'),def={version:1,id:'models-'+count,kind:'presentation',title:'Read the examples.',blocks:[{type:'text',role:'examples',text:lines.join('\n\n'),highlights:['model']}]};
  const before=JSON.stringify(def),s=setup(def);assert.deepEqual([...s.host.querySelectorAll('.ek-example-text')].map(el=>el.textContent),lines);assert.deepEqual([...s.host.querySelectorAll('.ek-example-number')].map(el=>el.textContent),lines.map((_,i)=>`${i+1}.`));assert.equal(s.host.querySelectorAll('.ek-example-group').length,1);assert.equal(s.host.querySelectorAll('.ek-example-model strong').length,count);assert.equal(JSON.stringify(def),before);
 }
 const dialogue='A: Hello.\n\nB: Hi.\nA: How are you?',normal=setup({version:1,id:'not-models',kind:'presentation',title:'Read the conversation.',blocks:[{type:'text',text:dialogue}]});assert.equal(normal.host.querySelector('.ek-example-group'),null);assert.equal(normal.host.querySelector('.ek-copy').textContent,dialogue);
});

test('actual Complete the rules models preserve text, source state compatibility and teacher reveal boundaries',()=>{
 const app={SpaceWhaleExerciseKit:kit,SpaceWhaleLessonMedia:{},SpaceWhaleContent:[]};vm.runInNewContext(fs.readFileSync(require.resolve('../course-content-module4-45.js'),'utf8'),{window:app});
 const def=app.SpaceWhaleContent.find(l=>l.id==='a1-2-w4-l4').stages.find(s=>s.exercise.id==='L4-discovery-rule').exercise,old=JSON.parse(JSON.stringify(def));delete old.exercises[0].exercise.blocks[0].role;
 assert.equal(require('../lesson-structure.js').compatible(JSON.stringify(old),JSON.stringify(def)),true);
 const s=setup(def,{syncChecks:true});assert.deepEqual([...def.revealStops],[2,3]);assert.equal(s.host.querySelectorAll('.ek-stage-models').length,1);assert.equal(s.host.querySelectorAll('.ek-stage-model-questions').length,1);
 assert.deepEqual([...s.host.querySelectorAll('.ek-example-text')].map(el=>el.textContent),['What does she look like? — She has long brown hair.','What is she like? — She is polite and helpful.']);
 assert.equal([...s.host.querySelector('.ek-stage-stack').children].filter(section=>!section.hidden).length,2);assert.equal(s.host.querySelector('.ek-rule-block'),null);
 const saved={'L4-complete-rule':{'1':'как она выглядит','2':'какая она в общении',__sw_choice_revealed:2,__sw_choice_checked:['1','2']},revealed:2};s.mount.setAnswers(saved);assert.equal(s.changes.length,0);
 assert.equal(s.host.querySelectorAll('.ek-example-model').length,2);assert.equal(s.host.querySelectorAll('.ek-sentence-number')[1].textContent,'2. ');
});

test('actual W03B presents one instruction and compact models label while keeping variable targets and state',()=>{
 const def=sourceFixture('W03B'),before=JSON.stringify(def),s=setup(def,{syncChecks:true});
 assert.deepEqual([...s.host.querySelectorAll('.ek-title')].map(el=>el.textContent),[def.title]);
 assert.equal(s.host.querySelector('.ek-examples-label').textContent,'Examples:');
 assert.equal(s.host.querySelectorAll('.ek-examples-label').length,1);
 const models=def.exercises[0].exercise.blocks[0];
 assert.deepEqual([...s.host.querySelectorAll('.ek-example-text')].map(el=>el.textContent),Array.from(models.text.split('\n')));
 assert.deepEqual([...s.host.querySelectorAll('.ek-example-number')].map(el=>el.textContent),['1.','2.','3.','4.']);
 assert.deepEqual([...s.host.querySelectorAll('.ek-example-model strong')].map(el=>el.textContent),Array.from(models.highlights));
 const sourceWords=def.exercises[1].exercise.items.map(item=>item.text);
 [...s.host.querySelectorAll('.ek-example-model')].forEach((model,index)=>{
  assert.equal(model.querySelector('.ek-example-number').textContent,`${index+1}.`);
  assert.deepEqual([...model.querySelectorAll('strong')].map(word=>word.textContent),[sourceWords[index]],'only the matching target word is bold');
  const copy=model.querySelector('.ek-example-text');
  assert.equal(copy.firstChild.nodeType,3);assert.equal(copy.lastChild.nodeType,3);
 });
 s.mount.setAnswers({'part-2':{'item-1':'answer-1',__sw_checked:true}});
 assert.equal(s.host.querySelector('.ek-word-definition-slot').getAttribute('data-feedback'),'correct');
 assert.equal(s.changes.length,0);assert.equal(JSON.stringify(def),before);
 const renamed=JSON.parse(before);renamed.id+='-variable';
 renamed.exercises[0].exercise.blocks[0].text=models.text.replaceAll('[Word 1]','[Revised word]');
 renamed.exercises[0].exercise.blocks[0].highlights[0]='[Revised word]';
 renamed.exercises[1].exercise.items[0].text='[Revised word]';
 const variable=setup(renamed);assert.equal(variable.host.querySelector('.ek-example-model strong').textContent,'[Revised word]');
 assert.equal(variable.host.querySelector('.ek-card-label').textContent,'[Revised word]');
 assert.equal(variable.host.querySelector('.ek-example-number').textContent,'1.');
 const reader=setup(def,{readOnly:true,syncChecks:true});
 reader.mount.setAnswers({'part-2':{'item-1':'answer-1',__sw_checked:true}});
 assert.deepEqual([...reader.host.querySelectorAll('.ek-example-number')].map(el=>el.textContent),['1.','2.','3.','4.']);
 assert.equal(reader.host.querySelector('.ek-word-definition-slot').getAttribute('data-feedback'),'correct');
 assert.equal(reader.host.querySelectorAll('.ek-examples-label').length,1);assert.equal(reader.changes.length,0);
 const other=setup({...def,title:'Read the examples. Then choose the correct options.'});
 assert.deepEqual([...other.host.querySelectorAll('.ek-title')].map(el=>el.textContent),['Read the examples. Then choose the correct options.','Match the words with their meanings.']);
});

test('actual W04 keeps stable keys, pending dimensions, drag, feedback, reset and remote hydration',()=>{
 const def=sourceFixture('W04'),before=JSON.stringify(def),s=setup(def,{syncChecks:true}),targets=()=>[...s.host.querySelectorAll('.ek-image-label-target')];
 const image=s.host.querySelector('.ek-image-label-image');
 assert.ok(image.classList.contains('ek-image-pending'));assert.equal(image.getAttribute('role'),'img');assert.equal(image.getAttribute('aria-label'),'[Image]');
 assert.equal(image.style.aspectRatio,`${def.imageWidth} / ${def.imageHeight}`);assert.equal(image.style.minHeight,'0');assert.equal(s.host.querySelector('img'),null);
 assert.deepEqual(targets().map(target=>target.style.top),Array.from(def.items,item=>item.y+'%'));
 s.drag(s.button('[Word 1]'),targets()[1]);s.drag(s.button('[Word 2]'),targets()[0]);
 assert.deepEqual(s.mount.getAnswers(),{tea:'furniture',cabinet:'drink'});s.click('OK');
 assert.equal(targets()[0].getAttribute('data-feedback'),'retry');assert.equal(targets()[1].getAttribute('data-feedback'),'retry');
 assert.deepEqual([...s.host.querySelectorAll('.ek-answer-pairs>li')].map(row=>[row.getAttribute('value'),row.dataset.result,row.querySelector('.ek-muted').textContent,row.querySelector('strong').textContent]),
  [1,2,3,4,5,6].map(number=>[String(number),number<3?'retry':'empty',`[Word ${number}]`,`[Translation Word ${number}]`]));
 assert.equal(s.host.querySelector('.ek-results').hidden,false);assert.equal(s.host.querySelector('.ek-status').hidden,false);
 s.drag(targets()[1],targets()[0]);assert.equal(s.mount.getAnswers().cabinet,'furniture');
 assert.equal(s.host.querySelectorAll('[data-feedback]').length,0);assert.equal(s.host.querySelector('.ek-answer-pairs'),null);
 assert.ok(s.host.querySelector('.ek-image-label-bank').textContent.includes('[Word 2]'));
 s.drag(s.button('[Word 2]'),targets()[1]);s.click('OK');
 assert.equal(targets()[0].getAttribute('data-feedback'),'correct');assert.equal(targets()[1].getAttribute('data-feedback'),'correct');
 assert.deepEqual([...s.host.querySelectorAll('.ek-answer-pairs>li')].map(row=>row.dataset.result),['correct','correct','empty','empty','empty','empty']);
 s.fire(targets()[0],'click');assert.equal(s.mount.getAnswers().cabinet,'');
 assert.ok(s.host.querySelector('.ek-image-label-bank').textContent.includes('[Word 1]'));
 const changeCount=s.changes.length;s.mount.setAnswers({cabinet:'furniture',tea:'drink',__sw_checked:true});
 assert.equal(s.changes.length,changeCount);assert.equal(targets()[0].getAttribute('data-feedback'),'correct');
 assert.equal(s.host.querySelectorAll('.ek-image-label-bank .ek-token').length,4);
 s.click('Reset exercise');assert.deepEqual(s.mount.getAnswers(),{});assert.equal(s.host.querySelectorAll('.ek-image-label-bank .ek-token').length,6);
 assert.equal(s.host.querySelectorAll('[data-feedback]').length,0);
 s.fire(s.button('[Word 1]'),'keydown',{altKey:true,key:'ArrowRight'});assert.equal(s.mount.getAnswers().cabinet,'furniture');
 s.fire(targets()[0],'keydown',{altKey:true,key:'ArrowRight'});assert.equal(s.mount.getAnswers().tea,'furniture');assert.equal(s.mount.getAnswers().cabinet,undefined);
 s.drag(targets()[1],s.host.querySelector('.ek-image-label-bank'));assert.deepEqual(s.mount.getAnswers(),{});
 assert.equal(s.host.querySelectorAll('.ek-image-label-bank .ek-token').length,6);assert.equal(JSON.stringify(def),before);
 const saved=Object.fromEntries(def.items.map(item=>[item.id,item.correctId]));s.mount.setAnswers({...saved,__sw_checked:true});
 assert.equal(s.host.querySelector('.ek-answer-pairs'),null);assert.equal(s.host.querySelector('.ek-results').hidden,true);
 const locked=setup(def,{readOnly:true,answers:{cabinet:'furniture'}}),target=locked.host.querySelector('.ek-image-label-target');
 assert.equal(target.disabled,true);locked.fire(target,'click');assert.deepEqual(locked.mount.getAnswers(),{cabinet:'furniture'});assert.equal(locked.changes.length,0);
});

test('real image labels keep intrinsic artwork and target-only feedback without authored translations',()=>{
 const def=JSON.parse(JSON.stringify(sourceFixture('W04')));def.image=def.sourceArtwork.image;def.alt=def.sourceArtwork.alt;delete def.imagePending;def.options.forEach(option=>delete option.translation);
 const s=setup(def,{syncChecks:true}),image=s.host.querySelector('.ek-image-label-image');
 assert.equal(image.tagName,'IMG');assert.equal(image.getAttribute('width'),String(def.imageWidth));assert.equal(image.getAttribute('height'),String(def.imageHeight));
 assert.ok(!image.style.getPropertyValue('aspect-ratio'),'real artwork uses its intrinsic ratio');
 s.mount.setAnswers({cabinet:'drink',tea:'furniture',__sw_checked:true});
 assert.equal(s.host.querySelector('.ek-answer-pairs'),null);assert.equal(s.host.querySelector('.ek-results').hidden,true);
 assert.equal(s.host.querySelector('.ek-image-label-target').getAttribute('data-feedback'),'retry');assert.equal(s.changes.length,0);
});

test('image-label translation keys are optional author text and retain all keyed outcomes',()=>{
 const def={version:1,id:'translated-labels',kind:'image-label',title:'Label.',imagePending:true,alt:'[Image]',imageWidth:800,imageHeight:600,
  items:[{id:'one',x:25,y:50,correctId:'a'},{id:'two',x:75,y:50,correctId:'b'}],options:[{id:'b',text:'Another term'},{id:'a',text:'Authored term',translation:'<b>Authored translation</b>'}]};
 const s=setup(def,{syncChecks:true});s.mount.setAnswers({one:'a',two:'a',__sw_checked:true});
 const rows=[...s.host.querySelectorAll('.ek-answer-pairs>li')];
 assert.deepEqual(rows.map(row=>[row.getAttribute('value'),row.dataset.result,row.querySelector('strong').textContent]),[['1','correct','<b>Authored translation</b>'],['2','retry','Another term']]);
 assert.equal(rows[0].querySelector('b'),null);assert.equal(rows[0].querySelector('.ek-muted').textContent,'Authored term');
 assert.equal(rows[1].querySelector('.ek-muted'),null);assert.equal(s.host.querySelectorAll('.ek-image-label-target')[0].textContent,'Authored term');
 assert.equal(s.changes.length,0);assert.deepEqual(s.mount.getAnswers(),{one:'a',two:'a',__sw_checked:true});
 assert.throws(()=>kit.validate({...def,imagePending:'pending'}),/imagePending must be boolean/);
 assert.throws(()=>kit.validate({...def,imagePending:false}),/image: expected non-empty text/);
 assert.throws(()=>kit.validate({...def,options:[{id:'a',text:'Term',translation:''},{id:'b',text:'Other'}]}),/option translation/);
});


test('all existing mechanic previews have exactly one primary heading before their next teacher step',()=>{
 for(const def of data.SpaceWhaleTemplates.filter(def=>def.catalogGroup==='mechanics')){
  const s=setup(def);const headings=[...s.host.querySelectorAll('.ek-title')];assert.equal(headings.length,1,def.id+': '+headings.map(el=>el.textContent).join(' / '));
 }
 const grouped=setup({version:1,id:'grouped-heading',kind:'stage',layout:'grouped',title:'Matching',exercises:[{id:'one',exercise:{...fixture('matching-demo'),id:'grouped-matching'}}]});
 assert.deepEqual([...grouped.host.querySelectorAll('.ek-title')].map(el=>el.textContent),['Match the Halves']);
});

test('the shared correction contract also applies to the legacy preview host',()=>{
 const {document,window}=parseHTML('<html><body class="design-preview"><main></main></body></html>'),host=document.querySelector('main');
 const def={version:1,id:'legacy-key',kind:'gaps',title:'Complete.',inputMode:'text',items:[{id:'one',segments:['First ',{id:'first',answers:['coat']},'.']},{id:'two',segments:['Second ',{id:'second',answers:['hat']},'.']}]};
 const mounted=kit.mount(host,def,{syncChecks:true});mounted.setAnswers({first:'coat',second:'wrong',__sw_checked:true});
 assert.deepEqual([...host.querySelectorAll('.ek-answer-pairs>li')].map(el=>[el.getAttribute('value'),el.dataset.result]),[['1','correct'],['2','retry']]);
 const input=host.querySelector('input');input.value='changed';input.dispatchEvent(new window.Event('input',{bubbles:true}));assert.equal(host.querySelector('.ek-attempt-marker'),null);
});


test('editing a later task preserves the earlier checked option borders and last-attempt markers',()=>{
 const task=id=>({version:1,id,kind:'choice',title:'Choose.',items:[{id:'question',prompt:'Pick.',options:[{id:'a',text:'Right'},{id:'b',text:'Wrong'}],correctId:'a'}]});
 const s=setup({version:1,id:'independent-option-feedback',kind:'stage',title:'Practice.',progressive:true,exercises:[{id:'first',exercise:task('first-task')},{id:'second',exercise:task('second-task')}]},{syncChecks:true});
 s.mount.setAnswers({revealed:2,first:{question:'b',__sw_checked:true},second:{}});
 const sections=[...s.host.querySelector('.ek-stage-stack').children],previous=sections[0],input=sections[1].querySelector('input');input.checked=true;s.fire(input,'change');
 assert.deepEqual([...previous.querySelectorAll('.ek-radio')].map(el=>el.dataset.feedback),['correct','retry']);assert.equal(previous.querySelector('.ek-answer-pairs>li').dataset.result,'retry');assert.equal(s.mount.getAnswers().first.__sw_checked,true);
});
