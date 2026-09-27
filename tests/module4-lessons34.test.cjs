const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {parseHTML}=require('linkedom');
const kit=require('../exercise-kit.js');
function load(supplied={}){const window={SpaceWhaleExerciseKit:kit};vm.runInNewContext(fs.readFileSync(require.resolve('../course-content.js'),'utf8'),{window});const before=JSON.stringify(window.SpaceWhaleContent);Object.assign(window.SpaceWhaleLessonMedia,supplied);vm.runInNewContext(fs.readFileSync(require.resolve('../course-content-module4-34.js'),'utf8'),{window});assert.equal(JSON.stringify(window.SpaceWhaleContent.slice(0,2)),before);return window;}
const app=load(),lessons=app.SpaceWhaleContent.slice(2),find=id=>lessons.flatMap(l=>l.stages).find(s=>s.exercise.id===id).exercise;
function setup(def,config={}){const {document,window}=parseHTML('<html><body><main></main></body></html>');const create=document.createElement.bind(document);document.createElement=tag=>{const el=create(tag);if(tag==='audio'){el.pause=()=>{};el.paused=true;}return el;};const host=document.querySelector('main'),handle=kit.mount(host,def,{syncChecks:true,...config});const click=label=>{const el=[...host.querySelectorAll('button,summary')].find(b=>b.getAttribute('aria-label')===label||b.textContent===label);assert.ok(el,label);assert.ok(!el.disabled,label+' enabled');el.dispatchEvent(new window.Event('click',{bubbles:true,cancelable:true}));};return {host,handle,click};}
function walk(def,fn){fn(def);for(const b of def.exercises||[])walk(b.exercise,fn);for(const b of def.blocks||[])if(b.exercise)walk(b.exercise,fn);}
test('Lessons 3 and 4 add 22 validated milestones without modifying lessons 1 or 2',()=>{assert.deepEqual(Array.from(lessons,l=>l.id),['a1-2-w4-l3','a1-2-w4-l4']);for(const [i,l] of lessons.entries()){assert.equal(l.stages.length,11);assert.equal(l.durationMinutes,30);assert.equal(l.stages.reduce((sum,s)=>sum+parseFloat(s.guide.time),0),i===0?29:28.5);l.stages.forEach((s,j)=>{assert.equal(s.exercise.id,`L${i+3}-M${String(j+1).padStart(2,'0')}`);kit.validate(s.exercise);const v=setup(s.exercise);assert.ok(!v.host.textContent.includes('Преподавателю'));assert.ok(!v.host.textContent.includes('Key:'));v.handle.destroy();});}});
test('media IDs are stable, reused illustrations resolve, pending files never request fake URLs',()=>{assert.equal(find('L3-M01').blocks[0].image,app.SpaceWhaleLessonMedia['a1-2-w4-l1'].A1M4L1_IMAGE_SPEAKING_01.src);for(const l of lessons)for(const s of l.stages){const v=setup(s.exercise);assert.equal(v.host.querySelector('audio[src]'),null);for(const img of v.host.querySelectorAll('img'))assert.ok(fs.existsSync(require('node:path').join(__dirname,'..',img.src)),img.src);v.handle.destroy();}assert.equal(app.SpaceWhaleLessonMedia['a1-2-w4-l4'].L4_Q_PERSONALITY.derivedFrom,'L4_DIALOGUE');assert.equal(app.SpaceWhaleLessonMedia['a1-2-w4-l3'].L3_DIALOGUE.script,app.SpaceWhaleLessonMedia['a1-2-w4-l3'].L3_DIALOGUE_TEXT.text);});
test('closed keys, matching IDs and option order match WORK',()=>{assert.deepEqual(Array.from(find('L3-M02').options,o=>o.id),['sunglasses','tie','scarf','cap','gloves','belt']);assert.deepEqual(Array.from(find('L4-M02').items,o=>o.correctId),['C','E','D','A','F','B']);assert.deepEqual(Array.from(find('L4-M08').items,o=>o.correctId),['B','B','A','A']);for(const l of lessons)for(const s of l.stages)walk(s.exercise,d=>{let a={};if(d.kind==='gaps')d.items.forEach(i=>i.segments.forEach(g=>{if(typeof g!=='string')a[g.id]=g.answers[0];}));else if(d.kind==='order')a.order=d.correctOrder;else if(d.items)d.items.forEach(i=>{if(i.correctId)a[i.id]=i.correctId;else if(i.acceptedAnswers)a[i.id]=i.acceptedAnswers[0];});const grades=Object.values(kit.grade(d,a));if(grades.length&&d.responseMode!=='open')assert.ok(grades.every(g=>g==='correct'),d.id);});});
test('word recall uses separate fields, accepts articles and case, rejects a sunglasses',()=>{const d=find('L3-M05'),v=setup(d);assert.equal(v.host.querySelectorAll('input.ek-writing-input').length,3);assert.equal(v.host.querySelectorAll('.ek-picture-sentence').length,3);assert.equal(v.host.querySelector('.ek-typed-gap'),null);assert.equal(kit.grade(d,{'1':'A CAP','2':'a pair of sunglasses','3':'a belt'})['1'],'correct');assert.equal(kit.grade(d,{'2':'a sunglasses'})['2'],'retry');assert.equal(kit.grade(find('L4-M05'),{'1':'lazy','2':'quiet','3':'helpful'})['3'],'correct');});
test('source and first listening question start together; next question waits for a check',()=>{for(const [id,initial,qid,correct] of [['L3-M06',3,'L3-M06-Q1','B'],['L4-M06',3,'L4-M06-Q1','C']]){const v=setup(find(id));assert.equal(v.host.querySelectorAll('.ek-stage-stack>.ek-stage-section').length,initial);assert.ok(v.host.querySelector('.ek-audio-player'));assert.ok(v.host.querySelector('.ek-stage-down').disabled);v.handle.setAnswers({[qid]:{'1':correct,__sw_checked:true}});assert.equal(v.host.querySelector('.ek-stage-down').disabled,false);v.click('Show next exercise');assert.equal(v.host.querySelectorAll('.ek-stage-stack>.ek-stage-section:not([hidden])').length,initial+1);assert.ok(v.host.querySelector('.ek-audio-player'));v.handle.destroy();}});
test('examples, single rule and compact practice reveal in order and synchronize via view state',()=>{for(const id of ['L3-M07','L4-M07']){const v=setup(find(id));assert.equal(v.host.querySelector('.ek-rule-block'),null);if(id==='L3-M07')v.handle.setAnswers({'L3-M07-meanings':{'1':'C','2':'B','3':'A',__sw_checked:true}});v.click('Show next exercise');assert.equal(v.host.querySelectorAll('.ek-rule-block').length,1);assert.equal(v.host.querySelector('.ek-inline-choice,.ek-group-grid,.ek-writing-input'),null);v.click('Show next exercise');assert.ok(v.host.querySelector('.ek-inline-choice,.ek-group-grid,.ek-writing-input'));const remote=setup(find(id),{navigationReadOnly:true});remote.handle.setViewState(v.handle.getViewState(),false);assert.ok(remote.host.querySelector('.ek-inline-choice,.ek-group-grid,.ek-writing-input'));}});
test('question meaning, rule and each checked Order task reveal only on teacher arrows',()=>{
 const def=find('L3-M08'),pupil=setup(def,{navigationReadOnly:true});
 const teacher=setup(def,{onViewChange:view=>pupil.handle.setViewState(view,false),onChange:answers=>pupil.handle.setAnswers(answers)});
 const fire=element=>element.dispatchEvent(new teacher.host.ownerDocument.defaultView.Event('click',{bubbles:true}));
 assert.equal(teacher.host.querySelector('.ek-rule-block'),null);
 assert.equal(teacher.host.querySelector('.ek-order-target'),null);
 teacher.handle.setAnswers({'L3-M08-question-meaning':{'1':'A','2':'B','3':'B',__sw_checked:true}});
 teacher.click('Show next exercise');
 assert.equal(teacher.host.querySelectorAll('.ek-rule-block').length,1);
 assert.equal(teacher.host.querySelector('.ek-order-target'),null);
 assert.equal(pupil.host.querySelectorAll('.ek-rule-block').length,1);
 teacher.click('Show next exercise');
 for(let i=0;i<3;i++){
   assert.equal(teacher.host.querySelectorAll('.ek-order-target').length,i+1);
   assert.equal(pupil.host.querySelectorAll('.ek-order-target').length,i+1);
   const next=teacher.host.querySelector('.ek-stage-down');if(i<2)assert.equal(next.disabled,true);
   const child=teacher.host.querySelectorAll('.ek-stage-host')[i+2],task=def.exercises[i+2].exercise;
   for(const id of task.correctOrder){const text=task.tokens.find(t=>t.id===id).text;fire([...child.querySelectorAll('.ek-bank button')].find(b=>b.textContent===text));}
   fire(child.querySelector('.ek-check'));
   assert.equal(child.querySelectorAll('.ek-order-target>.ek-token[data-feedback=correct]').length,task.tokens.length,'parent answer save preserves each token mark');
   assert.equal(pupil.host.querySelectorAll('.ek-stage-host')[i+2].querySelectorAll('.ek-order-target>.ek-token[data-feedback=correct]').length,task.tokens.length,'learner receives the same token marks');
   assert.equal(teacher.host.querySelectorAll('.ek-order-target').length,i+1,'OK must not navigate');
   if(i<2){assert.equal(teacher.host.querySelector('.ek-stage-down').disabled,false);teacher.click('Show next exercise');}
 }
 assert.equal(teacher.host.querySelector('.ek-stage-down'),null);
 assert.equal(pupil.host.querySelector('.ek-stage-navigation').hidden,true);
 const saved=teacher.handle.getAnswers(),restored=setup(def,{answers:saved});
 assert.equal(restored.host.querySelectorAll('.ek-order-target').length,3);
 teacher.click('Свернуть задание');
 assert.equal(teacher.host.querySelectorAll('.ek-stage-section:not([hidden])').length,4);
 assert.equal(pupil.host.querySelectorAll('.ek-stage-section:not([hidden])').length,4);
 assert.equal(teacher.handle.getAnswers()['L3-M08-scarf-question'].__sw_checked,true);
});
test('open writing never auto-grades and possible answers require submission then a click',()=>{for(const d of [find('L3-M07').exercises[2].exercise,find('L3-M10'),find('L4-M10')]){const v=setup(d);assert.equal(v.host.querySelector('details'),null);const a=Object.fromEntries(d.items.map(i=>[i.id,'My own response.']));assert.ok(Object.values(kit.grade(d,a)).every(g=>g==='review'));v.handle.setAnswers({...a,__sw_checked:true});const detail=v.host.querySelector('details');assert.ok(detail);assert.ok(!detail.open);assert.equal(detail.querySelector('summary').textContent,'Possible answers');v.click('Possible answers');assert.equal(detail.open,true);v.click('Reset exercise');assert.equal(v.host.querySelector('details'),null);}});
test('checked choice feedback is a full sentence with the target emphasized',()=>{const d=find('L3-M06').exercises.find(b=>b.id==='L3-M06-Q1').exercise,v=setup(d);v.handle.setAnswers({'1':'A',__sw_checked:true});const p=v.host.querySelector('.ek-answer-pairs .ek-copy');assert.equal(p.textContent,'The scarf is for Nina’s sister.');assert.equal(p.querySelector('strong').textContent,'Nina’s sister');});
test('future transcripts stay absent until supplied and stay closed until all attempts',()=>{const supplied=load({'a1-2-w4-l4':{L4_DIALOGUE_TEXT:{type:'text',text:'Test transcript supplied by author.'}}});const d=supplied.SpaceWhaleContent.find(l=>l.id==='a1-2-w4-l4').stages[5].exercise;const v=setup(d),detail=v.host.querySelector('details');assert.ok(detail.hidden);v.handle.setAnswers({'L4-M06-Q1':{'1':'C',__sw_checked:true},'L4-M06-Q2':{'2':'B',__sw_checked:true},revealed:4});assert.equal(detail.hidden,false);assert.ok(!detail.open);assert.equal(find('L4-M06').transcript,undefined);assert.equal(find('L4-M09').transcript,undefined);});
test('useful phrases start open; final speaking has no fabricated conversation',()=>{for(const id of ['L3-M01','L3-M11','L4-M01','L4-M11']){const v=setup(find(id));assert.equal(v.host.querySelector('details').open,true);assert.equal(v.host.querySelectorAll('details').length,1);}});
test('lesson 3 dialogue transcripts are identical, collapsed and available before any attempt or audio',()=>{
 const script=app.SpaceWhaleLessonMedia['a1-2-w4-l3'].L3_DIALOGUE.script;
 assert.equal(script.split('\n').length,9);assert.match(script,/Twenty euros/);
 for(const id of ['L3-M06','L3-M09']){
  const v=setup(find(id),{isMilestoneAttempted:()=>false}),detail=v.host.querySelector('details');
  assert.ok(detail);assert.ok(!detail.hidden);assert.ok(!detail.open);
  assert.equal(detail.querySelector('summary').textContent,'Transcript');
  assert.equal(detail.querySelector('.ek-copy').textContent,script);
  assert.equal(v.host.querySelector('audio[src]'),null);
  v.click('Transcript');assert.equal(detail.open,true);
 }
});
test('existing Workspace catalog resolves new lessons and stable uppercase milestone IDs',()=>{const catalog=require('../workspace-catalog.js').createCatalog(app.SpaceWhaleContent,[]);for(const lesson of lessons){const route=catalog.normalize({view:'library',level:'A1.2',whale:4,lesson:lesson.id,exercise:lesson.stages[6].exercise.id,section:'tasks',panel:'class'});assert.equal(route.lesson,lesson.id);assert.equal(route.exercise,lesson.stages[6].exercise.id);assert.equal(catalog.lessons.find(l=>l.id===lesson.id).title,lesson.title);}});

test('source media have no Skip and only components in one reveal step share linked spacing',()=>{
 for(const [id,initial] of [['L3-M06',3],['L4-M06',3],['L4-M09',2]]){
   const v=setup(find(id)),sections=[...v.host.querySelector('.ek-stage-stack').children];
   assert.equal(sections.length,initial);
   for(const s of sections.slice(0,-1))assert.equal(s.querySelector('.ek-skip'),null);
   assert.equal(sections[initial-1].querySelectorAll('.ek-skip').length,1);
   assert.ok(sections.slice(1).every(s=>s.classList.contains('ek-stage-linked')));
 }
 const v=setup(find('L3-M08'));v.handle.setAnswers({'L3-M08-question-meaning':{'1':'A','2':'B','3':'B',__sw_checked:true}});v.click('Show next exercise');
 assert.equal(v.host.querySelectorAll('.ek-stage-linked').length,0,'rule is a separate step');
});
test('skipped task does not block later checked questions',()=>{
 const v=setup(find('L3-M08'));v.handle.setAnswers({'L3-M08-question-meaning':{'1':'A','2':'B','3':'B',__sw_checked:true}});v.click('Show next exercise');v.click('Show next exercise');
 v.host.querySelectorAll('.ek-stage-host')[2].querySelector('.ek-skip').dispatchEvent(new v.host.ownerDocument.defaultView.Event('click',{bubbles:true,cancelable:true}));
 assert.equal(v.host.querySelectorAll('.ek-order-target').length,2);
 const a=v.handle.getAnswers();assert.equal(a['L3-M08-Q1'].__sw_skipped,true);
 a['L3-M08-Q2']={order:Array.from(find('L3-M08').exercises[3].exercise.correctOrder),__sw_checked:true};v.handle.setAnswers(a);
 assert.equal(v.host.querySelector('.ek-stage-down').disabled,false);v.click('Show next exercise');
 assert.equal(v.host.querySelectorAll('.ek-order-target').length,3);
});
test('listening contrast reveals one audio/question pair at a time and keeps the source mounted',()=>{
 const v=setup(find('L4-M09'));assert.equal(v.host.querySelectorAll('.ek-audio-player').length,1);
 assert.equal(v.host.querySelector('.ek-stage-down').disabled,true);
 const first=v.host.querySelector('.ek-audio-player');
 v.handle.setAnswers({'L4-M09-Q1':{'1':'B',__sw_checked:true}});v.click('Show next exercise');
 assert.equal(v.host.querySelectorAll('.ek-audio-player').length,2);
 assert.equal(v.host.querySelector('.ek-audio-player'),first);
 const sections=[...v.host.querySelector('.ek-stage-stack').children];
 assert.equal(sections[2].classList.contains('ek-stage-linked'),false);
 assert.equal(sections[3].classList.contains('ek-stage-linked'),true);
});
test('selected pictures use the same numbered strip without leaking keys into captions',()=>{
 for(const id of ['L3-M04','L3-M05']){
   const def=find(id),v=setup(def),strip=v.host.querySelector('.ek-picture-cues');
   assert.equal(strip.children.length,def.items.length);
   assert.equal(strip.querySelectorAll('.ek-image-pending').length,0);
   assert.deepEqual([...strip.querySelectorAll('img')].map(img=>img.src),Array.from(def.items,item=>item.image));
   assert.deepEqual([...strip.querySelectorAll('figcaption')].map(e=>e.textContent),Array.from(def.items,(_,i)=>String(i+1)));
   assert.equal(v.host.querySelectorAll('.ek-picture-sentence').length,def.items.length);
   assert.equal(v.host.querySelector('.ek-picture-sentence .ek-image-pending'),null);
 }
});
