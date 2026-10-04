const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {parseHTML}=require('linkedom');
const kit=require('../exercise-kit.js'),{createCatalog}=require('../workspace-catalog.js');
function load(){const window={SpaceWhaleExerciseKit:kit};for(const file of ['course-content.js','course-content-module4-34.js','course-content-smy-a21.js'])vm.runInNewContext(fs.readFileSync(require.resolve('../'+file),'utf8'),{window});const original=JSON.stringify(window.SpaceWhaleContent),count=window.SpaceWhaleContent.length;vm.runInNewContext(fs.readFileSync(require.resolve('../course-content-b1-misha.js'),'utf8'),{window});assert.equal(JSON.stringify(window.SpaceWhaleContent.slice(0,count)),original);return window;}
const app=load(),lessons=app.SpaceWhaleContent.filter(l=>l.level==='B1.1'),find=id=>lessons.flatMap(l=>l.stages).find(s=>s.exercise.id===id).exercise;
function walk(d,fn){fn(d);for(const b of d.exercises||[])walk(b.exercise,fn);for(const b of d.blocks||[])if(b.exercise)walk(b.exercise,fn);}
function setup(def,config={}){const {document,window}=parseHTML('<html><body><main></main></body></html>');const create=document.createElement.bind(document);document.createElement=tag=>{const el=create(tag);if(tag==='audio'){el.pause=()=>{};el.paused=true;}return el;};const host=document.querySelector('main'),handle=kit.mount(host,def,{syncChecks:true,...config});const click=label=>{const el=[...host.querySelectorAll('button,summary')].find(b=>b.getAttribute('aria-label')===label||b.textContent===label);assert.ok(el,label);assert.ok(!el.disabled,label+' enabled');el.dispatchEvent(new window.Event('click',{bubbles:true,cancelable:true}));};return {host,handle,click,window};}
function correct(d){if(d.kind==='matching')return Object.fromEntries(d.items.map(i=>[i.id,i.correctId]));if(d.kind==='choice')return Object.fromEntries(d.items.map(i=>[i.id,d.multiple?i.correctIds:i.correctId]));if(d.kind==='order')return {order:d.correctOrder};if(d.kind==='gaps')return Object.fromEntries(d.items.flatMap(i=>i.segments.filter(s=>typeof s!=='string').map(s=>[s.id,s.answers[0]])));return {};}

test('two B1.1 module 1 lessons append without modifying existing lessons and all 20 milestones render',()=>{
 const catalog=createCatalog(app.SpaceWhaleContent,[]);
 assert.deepEqual(Array.from(lessons,l=>l.title),['Урок для Миши 1','Урок для Миши 2']);
 for(const [i,l] of lessons.entries()){
  assert.equal(l.level,'B1.1');assert.equal(l.whale,1);assert.equal(l.stages.length,10);
  assert.equal(l.stages.reduce((v,s)=>v+parseFloat(s.guide.time),0),l.plannedTeachingMinutes);
  assert.equal(l.plannedTeachingMinutes+l.reserveMinutes,30);
  assert.equal(catalog.normalize(`?view=library&level=B1.1&whale=1&lesson=${l.id}`).exercise,l.stages[0].exercise.id);
  for(const [j,s] of l.stages.entries()){
   assert.match(s.exercise.id,new RegExp(`^B1D${i+1}-M\\d{2}$`));kit.validate(s.exercise);
   const v=setup(s.exercise);assert.doesNotMatch(v.host.textContent,/Key:|Служебно|Преподавателю|B1D[12]_|\*\*/);
   assert.equal(v.host.querySelector('audio[src]'),null);
   for(const details of v.host.querySelectorAll('details'))assert.equal(details.open,details.querySelector('summary').textContent==='Useful phrases');
   v.handle.destroy();
  }
 }
 assert.deepEqual(Array.from(catalog.topics({view:'library',level:'B1.1',whale:1}),l=>l.id),Array.from(lessons,l=>l.id));
});
test('all closed tasks accept their keys; bank blanks are select and verb restoration remains typed',()=>{
 for(const l of lessons)for(const s of l.stages)walk(s.exercise,d=>{const a=correct(d);if(Object.keys(a).length)assert.ok(Object.values(kit.grade(d,a)).every(g=>g==='correct'),d.id);});
 for(const id of ['B1D1-M04','B1D2-M04'])assert.equal(find(id).inputMode,'select');
 for(const id of ['B1D1-M08','B1D2-M07']){
  const d=find(id);assert.equal(d.inputMode,'text');
  const a=correct(d);
  for(const i of d.items)for(const s of i.segments)if(typeof s!=='string')for(const variant of s.answers){
   for(const apostrophe of ["'",'’','‘','ʼ'])assert.equal(kit.grade(d,{...a,[s.id]:'  '+variant.toUpperCase().replace(/[‘’ʼ']/g,apostrophe)+'.  '})[s.id],'correct');
  }
 }
 const d=find('B1D2-M07');assert.equal(kit.grade(d,{...correct(d),'1b':'prepare'})['1b'],'retry');assert.equal(kit.grade(d,{...correct(d),'1a':'was'})['1a'],'retry');
});
test('typed feedback shows complete sentences with canonical forms, no bracket cues or dangling contractions',()=>{
 const d=find('B1D1-M08'),v=setup(d);v.handle.setAnswers({...correct(d),'1a':'find',__sw_checked:true});
 const p=v.host.querySelector('.ek-answer-pairs .ek-copy');assert.equal(p.textContent,'If we found an apartment near our jobs, we would move in together.');
 assert.ok(p.classList.contains('ek-muted'));
 assert.deepEqual([...p.querySelectorAll('strong')].map(x=>x.textContent),['found','would move']);
 assert.doesNotMatch(v.host.querySelector('.ek-answer-pairs').textContent,/\(find\)|we ’d|she ’d/);
});
test('dialogue scripts exactly match source, transcripts are collapsed beside every player, source and first question are together',()=>{
 const source=fs.readFileSync(require.resolve('../lesson-sources/b1-1/module-1/B1_DECISIONS_WORK_v1.1.txt'),'utf8');
 for(const [lessonId,slots] of Object.entries(app.SpaceWhaleLessonMedia).filter(([id])=>id.startsWith('b1-'))){
  const p=lessonId.endsWith('1')?'B1D1':'B1D2';assert.ok(source.includes(slots[p+'_DIALOGUE'].script));assert.equal(slots[p+'_DIALOGUE'].script,slots[p+'_TRANSCRIPT'].text);
  assert.equal(Object.values(slots).filter(s=>s.type==='audio').length,13);assert.ok(Object.values(slots).filter(s=>s.type==='audio').every(s=>/^https:\/\//.test(s.src)));assert.match(slots[p+'_SCENES'].src,/assets\/lesson-media\/b1-1\/module-1\/images\/B1D[12]_SCENES\.jpg(?:\?v=[\w-]+)?$/);
 }
 for(const id of ['B1D1-M05','B1D1-M06','B1D2-M08']){
  const d=find(id),v=setup(d);const detail=v.host.querySelector('details');assert.equal(detail.querySelector('summary').textContent,'Transcript');assert.ok(!detail.open&&!detail.hidden);assert.match(detail.textContent,/Dana:|Leah:/);
  assert.equal(v.host.querySelectorAll('.ek-skip').length,d.kind==='stage'?1:0,'source must not acquire separate skip controls');
  if(id!=='B1D1-M06'){
   assert.deepEqual(Array.from(d.revealStops).slice(0,2),[3,4]);assert.equal(v.host.querySelectorAll('.ek-stage-host').length,3);
   const q=d.exercises[2].exercise;v.handle.setAnswers({[q.id]:{...correct(q),__sw_checked:true}});assert.equal(v.host.querySelectorAll('.ek-stage-host').length,3,'OK does not advance');v.click('Show next exercise');assert.equal(v.host.querySelectorAll('.ek-stage-host').length,4);
  }
 }
});
test('discovery questions precede one full rule, revealed only by teacher arrow',()=>{
 for(const id of ['B1D1-M07','B1D2-M06']){
  const d=find(id),v=setup(d),q=d.exercises[1].exercise;
  assert.equal(v.host.querySelector('.ek-rule-block'),null);assert.equal(q.items.length,id==='B1D2-M06'?4:3);
  assert.equal(v.host.querySelector('.ek-stage-down').disabled,true);
  v.handle.setAnswers({[q.id]:{...correct(q),__sw_checked:true,...(q.progressiveQuestions?{__sw_choice_revealed:q.items.length}:{})}});assert.equal(v.host.querySelector('.ek-rule-block'),null);
  v.click('Show next exercise');assert.equal(v.host.querySelectorAll('.ek-rule-block').length,1);
  assert.ok(v.host.querySelector('.ek-rule-block').textContent.length>900);
 }
});
test('Order fixes punctuation outside tokens and casing only in answer; independent questions reveal and synchronize',()=>{
 const d=find('B1D1-M09'),student=setup(d,{navigationReadOnly:true});
 const teacher=setup(d,{onViewChange:v=>student.handle.setViewState(v,false),onChange:a=>student.handle.setAnswers(a)});
 assert.equal(teacher.host.querySelectorAll('.ek-order-target').length,1);
 const first=d.exercises[0].exercise;
 teacher.handle.setAnswers({[first.id]:{...correct(first),__sw_checked:true}});
 assert.equal(teacher.host.querySelector('.ek-order-target .ek-token').textContent,'Would');
 assert.equal(teacher.host.querySelector('.ek-order-suffix').textContent,'?');
 teacher.click('Show next exercise');assert.equal(student.host.querySelectorAll('.ek-order-target').length,1);
 assert.ok(student.host.textContent.includes('Ask your partner the question you have built.'));
 teacher.click('Show next exercise');assert.equal(student.host.querySelectorAll('.ek-order-target').length,2);
 for(const [i,c] of d.exercises.filter(c=>c.exercise.kind==='order').entries()){
  const v=setup(c.exercise);assert.ok([...v.host.querySelectorAll('.ek-bank .ek-token')].every(t=>t.textContent===t.textContent.toLowerCase()));
  v.handle.setAnswers({order:[...c.exercise.correctOrder].reverse(),__sw_checked:true});
  assert.equal(v.host.querySelector('.ek-answer-pairs strong').textContent,i===0?'Would you rent an apartment if you earned more?':'What would you do if your partner wanted to move in together?');
 }
});
test('Multiple Select accepts either selection order and rejects extra answers',()=>{
 const d=find('B1D2-M08').exercises[3].exercise;assert.equal(d.multiple,true);
 for(const values of [['B','C'],['C','B']])assert.equal(kit.grade(d,{'2':values})['2'],'correct');
 assert.equal(kit.grade(d,{'2':['A','B','C']})['2'],'retry');
 assert.equal(setup(d).host.querySelectorAll('input[type=checkbox]').length,4);
});
test('revised B1 advice correction uses six keyed sentence fields and retains canonical feedback',()=>{
 const d=find('B1D2-M09'),v=setup(d);assert.equal(v.host.querySelectorAll('input.ek-writing-input').length,6);
 const answers=Object.fromEntries(d.items.map(i=>[i.id,i.acceptedAnswers[0]]));v.handle.setAnswers({...answers,__sw_checked:true});
 assert.ok(Object.values(kit.grade(d,answers)).every(x=>x==='correct'));
 const first=d.items[0];v.handle.setAnswers({...answers,[first.id]:first.prompt,__sw_checked:true});assert.match(v.host.querySelector('.ek-answer-pairs').textContent,/If I were you/);v.handle.destroy();
});
test('lexical rules reveal outside feedback by teacher arrow and synchronize without losing flat answers',()=>{
 for(const id of ['B1D1-M02','B1D2-M02']){
  const d=find(id),rule=d.followUp.blocks[0],student=setup(d,{navigationReadOnly:true});
  const teacher=setup(d,{onViewChange:view=>student.handle.setViewState(view,false),onChange:a=>student.handle.setAnswers(a)});
  assert.equal(d.afterCheck,undefined);assert.equal(d.followUp.kind,'rule-page');
  assert.equal(teacher.host.querySelector('.ek-rule-block'),null);
  assert.equal(teacher.host.querySelector('.ek-stage-down').disabled,true);
  const a={...correct(d),'1':'wrong',__sw_checked:true};teacher.handle.setAnswers(a);
  assert.ok(teacher.host.querySelector('.ek-results').textContent.includes('Correct answers'));
  assert.ok(!teacher.host.textContent.includes(rule.text),'checking does not reveal a rule');
  teacher.click('Show next exercise');
  for(const v of [teacher,student]){
   assert.equal(v.host.querySelectorAll('.ek-rule-block').length,1);
   assert.ok(v.host.querySelector('.ek-rule-block').textContent.includes(rule.text));
   assert.ok(!v.host.querySelector('.ek-results').textContent.includes(rule.text));
   assert.equal([...v.host.querySelectorAll('h2,h3')].filter(h=>h.textContent===rule.title).length,1,'one rule heading');
  }
  const saved=teacher.handle.getAnswers();for(const [key,value] of Object.entries(a))assert.deepEqual(saved[key],value);
  assert.equal(saved.__sw_followup_revealed,2);assert.ok(setup(d,{answers:saved}).host.querySelector('.ek-rule-block'));
  const skipped=setup(d);skipped.click('Skip exercise');assert.ok(skipped.host.querySelector('.ek-rule-block'));
 }
 for(const id of ['B1D1-M10']){
  const d=find(id),v=setup(d);assert.equal(v.host.querySelector('details').open,true);assert.ok(!v.host.textContent.includes('Extra information'));
  v.click('Show next exercise');assert.ok(v.host.textContent.includes('Extra information'));
 }
});

test('new oral tasks require a separate teacher arrow, retain flat saved answers and synchronize',()=>{
 for(const id of ['B1D2-M07']){
  const d=find(id),text=d.followUp.blocks[0].text,student=setup(d,{navigationReadOnly:true});
  const teacher=setup(d,{onViewChange:view=>student.handle.setViewState(view,false),onChange:a=>student.handle.setAnswers(a)});
  assert.equal(d.afterCheck,undefined);assert.ok(!teacher.host.textContent.includes(text));
  const a={...correct(d),__sw_checked:true};teacher.handle.setAnswers(a);
  assert.ok(!teacher.host.textContent.includes(text),'OK does not expose the next task');
  assert.ok(!teacher.host.querySelector('.ek-results').textContent.includes(text));
  teacher.click('Show next exercise');assert.ok(teacher.host.textContent.includes(text));assert.ok(student.host.textContent.includes(text));
  assert.equal(teacher.host.querySelectorAll('.ek-check').length,1,'no OK on oral instructions');
  const saved=teacher.handle.getAnswers();for(const [key,value] of Object.entries(a))assert.deepEqual(saved[key],value);
  assert.equal(saved.__sw_followup_revealed,2);const restored=setup(d,{answers:saved});assert.ok(restored.host.textContent.includes(text));
  teacher.click('Свернуть задание');assert.ok(teacher.host.querySelector('.ek-stage-section[hidden]'));
 }
 assert.equal(find('B1D1-M04').followUp,undefined);assert.equal(find('B1D1-M08').followUp,undefined);
 for(const id of ['B1D1-M05','B1D2-M05','B1D1-M09'])walk(find(id),d=>assert.equal(d.afterCheck,undefined));
});

test('dropdown banks are not duplicated; typed banks remain visible and options stay shuffled',()=>{
 for(const id of ['B1D1-M04','B1D2-M04']){
  const d=find(id),v=setup(d);assert.equal(v.host.querySelector('.ek-word-list'),null);
  assert.notDeepEqual(Array.from(d.bank),d.items.map(i=>i.segments.find(s=>typeof s!=='string').answers[0]));
  const typed=setup({...d,followUp:undefined,inputMode:'text'});assert.equal(typed.host.querySelector('.ek-word-list').textContent,d.bank.join(', '));
 }
});

test('opening supplies concrete choices and compatible speaking support; old unscramble banks do not signal the first word',()=>{
 const opening=find('B1D1-M01'),body=opening.blocks[1].text,phrases=opening.blocks[2].text;
 assert.match(body,/rent an apartment/);assert.match(body,/need to decide whether to move/);assert.match(body,/don’t have regular clients yet/);assert.match(body,/need to decide where to live/);
 assert.match(phrases,/I prefer/);assert.match(phrases,/because/);assert.doesNotMatch(body+' '+phrases,/would|I’d|could/i);
 let count=0;
 for(const l of app.SpaceWhaleContent.filter(l=>['a1-2-w4-l2','a1-2-w4-l3'].includes(l.id)))for(const s of l.stages)walk(s.exercise,d=>{
  if(d.kind!=='order')return;count++;assert.ok(d.sentenceCase);
  assert.ok(d.tokens.every(t=>t.text===t.text.toLowerCase()),d.id);
 });assert.equal(count,7);
});


test('Lesson 1 teaches Second Conditional before production and listening, with a 30-minute budget',()=>{
 const l=lessons[0];
 assert.deepEqual(Array.from(l.stages,s=>s.exercise.id),['B1D1-M01','B1D1-M02','B1D1-M03','B1D1-M04','B1D1-M07','B1D1-M08','B1D1-M05','B1D1-M06','B1D1-M09','B1D1-M10']);
 for(const stage of l.stages.slice(0,4))assert.doesNotMatch(JSON.stringify(stage.exercise),/What would|Would you|I’d|If I had|If I earned/);
 const focus=find('B1D1-M07');assert.doesNotMatch(focus.instruction,/from Dana’s conversation/);
 assert.match(focus.exercises[0].exercise.blocks[0].text,/Dana has a full-time job/);
 assert.match(focus.exercises[0].exercise.blocks[1].text,/If I earned more, I’d rent an apartment on my own/);
 assert.match(find('B1D1-M05').exercises.at(-1).exercise.instruction,/Choose one question/);
 assert.equal(l.plannedTeachingMinutes,28.5);assert.equal(l.reserveMinutes,1.5);
});

test('legacy afterCheck commentary cannot leak into shared answer feedback',()=>{
 const base=find('B1D1-M02'),d={...base,afterCheck:{text:'Private author explanation',highlights:[]}};delete d.followUp;
 const v=setup(d);v.handle.setAnswers({...correct(d),'1':'wrong',__sw_checked:true});
 assert.ok(v.host.querySelector('.ek-results').textContent.includes('Correct answers'));
 assert.ok(!v.host.textContent.includes('Private author explanation'));
});
