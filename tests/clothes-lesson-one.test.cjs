const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {parseHTML}=require('linkedom');
const kit=require('../exercise-kit.js');
const source=fs.readFileSync(require.resolve('../course-content.js'),'utf8');
function load(text=source){const context={SpaceWhaleExerciseKit:kit};vm.runInNewContext(text,{window:context});return {lesson:context.SpaceWhaleContent[0],media:context.SpaceWhaleLessonMedia['a1-2-w4-l1']};}
const {lesson,media}=load();
const stage=id=>lesson.stages.find(s=>s.exercise.id==='a12w4l1-'+id).exercise;
function setup(def,config={}){
 const {document,window}=parseHTML('<html><body><main></main></body></html>');
 const create=document.createElement.bind(document);document.createElement=tag=>{const el=create(tag);if(tag==='audio'){el.pause=()=>{};el.paused=true;}if(tag==='dialog'){el.showModal=()=>{el.open=true;};el.close=()=>{el.open=false;};}return el;};
 const host=document.querySelector('main'),changes=[];
 const handle=kit.mount(host,def,{...config,onChange:value=>changes.push(value)});
 const fire=(el,type)=>{assert.ok(el);el.dispatchEvent(new window.Event(type,{bubbles:true}));};
 const click=label=>fire([...host.querySelectorAll('button')].find(b=>b.getAttribute('aria-label')===label||b.textContent===label),'click');
 return {host,handle,changes,fire,click};
}
test('replacement is lesson one with the ten requested steps and no leftover homework',()=>{
 assert.equal(lesson.id,'a1-2-w4-l1');assert.equal(lesson.title,'Как выглядит эта вещь?');assert.equal(lesson.stages.length,10);
 assert.equal(lesson.stages.reduce((sum,s)=>sum+parseInt(s.guide.time),0),29);
 lesson.stages.forEach(s=>{assert.equal(s.section,'tasks');kit.validate(s.exercise);});
 assert.equal(stage('short-production').responseMode,'open');assert.match(stage('short-production').items[1].prompt,/Is this your coat\?/);
});
test('image ordering is stable while all matching options occupy different positions',()=>{
 const def=stage('words'),words=['coat','sweater','blouse','skirt','suit','hat'];
 assert.deepEqual(Array.from(def.items,i=>i.correctId),words);
 assert.equal(new Set(def.options.map(o=>o.id)).size,6);
 assert.ok(def.items.every((item,i)=>item.correctId!==def.options[i].id));
 assert.ok(Object.values(kit.grade(def,Object.fromEntries(def.items.map(i=>[i.id,i.correctId])))).every(result=>result==='correct'));
});
test('uploaded images reuse slots while missing two-coat and audio assets stay pending',()=>{
 assert.equal(Object.values(media).filter(s=>s.type==='image').length,8);
 assert.equal(Object.values(media).filter(s=>s.type==='audio').length,13);
 assert.equal(Object.values(media).filter(s=>s.type==='image'&&s.src).length,7);
 assert.equal(media.A1M4L1_IMAGE_TWO_COATS.src,null);
 assert.ok(Object.values(media).filter(s=>s.type==='audio').every(s=>s.src===null));
 const match=stage('words'),choice=stage('word-choice'),gaps=stage('word-type');
 choice.exercises.map(b=>b.exercise.items[0]).forEach(i=>assert.equal(i.assetId,match.items.find(m=>m.correctId===i.id).assetId));
 assert.equal(gaps.exercises[2].exercise.items[0].assetId,'A1M4L1_IMAGE_TWO_COATS');
 assert.equal(stage('opening').blocks[0].assetId,stage('final-speaking').blocks[0].assetId);
 assert.equal(stage('listen-repeat').items.length,6);
 for(const item of lesson.stages){const s=setup(item.exercise);for(const img of s.host.querySelectorAll('img[src]'))assert.ok(Object.values(media).some(slot=>slot.src===img.getAttribute('src')));assert.equal(s.host.querySelector('audio[src]'),null);s.handle.destroy();}
});
test('setting a single image or audio URL later connects all uses without changing answer keys',()=>{
 const attached=load(source.replace(media.A1M4L1_IMAGE_01.src,"assets/coat.png").replace("type:'audio',src:null,script:","type:'audio',src:'assets/dialogue.mp3',script:"));
 const words=attached.lesson.stages[1].exercise,choice=attached.lesson.stages[3].exercise;
 assert.equal(words.items[0].image,'assets/coat.png');assert.equal(choice.exercises[0].exercise.items[0].image,'assets/coat.png');
 assert.equal(words.items[0].correctId,'coat');assert.equal(words.items[0].imagePending,undefined);
 assert.equal(attached.lesson.stages[5].exercise.exercises[0].exercise.audio,'assets/dialogue.mp3');
});
test('picture practice reveals one picture and inline answer at a time',()=>{
 for(const [id,count,mode] of [['word-choice',4,'select'],['word-type',3,'text']]){
   const def=stage(id),s=setup(def);assert.equal(s.host.querySelectorAll('img[src], .ek-image-pending').length,1);
   assert.equal(def.exercises.length,count);
   assert.ok(def.exercises.every(b=>b.exercise.kind==='gaps'&&b.exercise.inputMode===mode));
   for(let i=1;i<count;i++)s.click('Show next exercise');
   assert.equal(s.host.querySelectorAll('img[src], .ek-image-pending').length,count);
   assert.ok(!s.host.textContent.includes('______'));
 }
 const def=stage('word-type').exercises[2].exercise;
 assert.equal(kit.grade(def,{'coats-gap':'coat'})['coats-gap'],'retry');
 assert.equal(kit.grade(def,{'coats-gap':'coats'})['coats-gap'],'correct');
});
test('two-option gaps show complete corrected sentences with muted context',()=>{
 const s=setup(stage('language-practice'),{syncChecks:true});
 s.handle.setAnswers({look1:'looks like',look2:'look like',look3:'looks',look4:'looks like',look5:'look',__sw_checked:true});
 const rows=s.host.querySelectorAll('.ek-answer-pairs>li');assert.equal(rows.length,5);
 assert.equal(rows[0].textContent,'This coat looks expensive.');
 assert.equal(rows[0].querySelector('strong').textContent,'looks');
 assert.equal(rows[0].querySelector('.ek-muted').textContent,'This coat ');
 assert.equal(rows[4].textContent,'How does this suit look?');
});
test('language focus has one heading and interaction instruction',()=>{
 const s=setup(stage('language-focus'));
 assert.equal([...s.host.querySelectorAll('.ek-title')].filter(h=>h.textContent==='Match the sentences with their meanings.').length,1);
 assert.match(s.host.querySelector('.ek-instruction').textContent,/Click the button/);
});
test('rule reveal scrolls the full range and prioritizes its beginning when taller than viewport',()=>{
 for(const [end,expected] of [[850,166],[1400,584]]){
   const s=setup(stage('language-focus')),doc=s.host.ownerDocument,scroll=doc.createElement('div');scroll.className='lesson-scroll';s.host.before(scroll);scroll.append(s.host);
   scroll.scrollTop=100;scroll.getBoundingClientRect=()=>({top:100,height:700,bottom:800});let target;
   scroll.scrollTo=value=>{target=value.top;};
   const rules=[...s.host.querySelectorAll('.ek-rule-block')];
   rules.forEach((rule,i)=>{rule.getBoundingClientRect=()=>({top:600+i*50,bottom:i===rules.length-1?end:650+i*50,height:50});});
   s.click('Далее');assert.equal(target,expected);
 }
});
test('listening retains audio with the first question and unlocks transcript only after all checks',()=>{
 const s=setup(stage('listening'));
 const sections=()=>[...s.host.querySelectorAll('.ek-stage-section')];
 const transcript=s.host.querySelector('details');
 assert.equal(sections().filter(el=>!el.hidden).length,2);
 assert.ok(s.host.querySelector('.ek-audio-player'));assert.equal(s.host.querySelector('[aria-label="Audio pending"]').disabled,true);
 assert.equal(transcript.hidden,true);
 const submit=(index,value)=>{const section=sections()[index];const input=[...section.querySelectorAll('input[type=radio]')].find(i=>i.value===value);input.checked=true;s.fire(input,'change');s.fire(section.querySelector('.ek-check'),'click');};
 submit(1,'A sweater.');assert.equal(transcript.hidden,true);s.click('Show next exercise');
 submit(2,'Anna’s old coat.');assert.equal(transcript.hidden,true);s.click('Show next exercise');
 assert.equal(transcript.hidden,true);submit(3,'warm.');assert.equal(transcript.hidden,false);assert.equal(Boolean(transcript.open),false);
 const remote=setup(stage('listening'),{syncChecks:true});remote.handle.setAnswers(s.handle.getAnswers());
 assert.equal(remote.host.querySelector('details').hidden,false);assert.equal(remote.changes.length,0);
 const input=sections()[3].querySelector('input[type=radio]');input.checked=true;s.fire(input,'change');assert.equal(transcript.hidden,true);
 s.fire(sections()[3].querySelector('.ek-check'),'click');assert.equal(transcript.hidden,false);
 s.fire(sections()[1].querySelector('.ek-reset'),'click');assert.equal(transcript.hidden,true);
});
test('language rule and possible responses stay concealed until requested',()=>{
 const focus=setup(stage('language-focus'));assert.equal(focus.host.querySelectorAll('.ek-rule-block:not([hidden])').length,0);
 const ruleButton=focus.host.querySelector('.ek-rule-page .ek-stage-down')||focus.host.querySelector('.ek-stage-down');assert.ok(ruleButton);focus.fire(ruleButton,'click');
 assert.match(focus.host.textContent,/После does используем look/);
 const writing=setup(stage('short-production'));assert.equal(writing.host.querySelector('.ek-writing-answers'),null);
 const input=writing.host.querySelector('input');input.value='The sweater looks very warm.';writing.fire(input,'input');writing.click('OK');
 assert.equal(input.dataset.feedback,'review');assert.match(writing.host.querySelector('.ek-writing-answers').textContent,/It looks warm/);
 const opening=setup(stage('opening'));assert.equal(Boolean(opening.host.querySelector('details').open),false);
});

test('Listen & Repeat exposes the word and example as separate clips and steps',()=>{
 const def=stage('listen-repeat'),s=setup(def);
 assert.equal(s.host.querySelector('.ek-repeat-line').textContent,'coat');
 s.click('Next phrase');assert.equal(s.host.querySelector('.ek-repeat-line').textContent,'I need a coat for work.');
 assert.equal(s.host.querySelectorAll('.ek-repeat-item').length,1);
 s.click('Next phrase');assert.equal(s.host.querySelector('.ek-repeat-line').textContent,'sweater');
 assert.equal(def.items[0].audioId,'A1M4L1_WORD_01');assert.equal(def.items[0].exampleAudioId,'A1M4L1_SENTENCE_01');
});
