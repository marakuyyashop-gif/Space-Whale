const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {parseHTML}=require('linkedom');const kit=require('../exercise-kit.js');
const app={SpaceWhaleExerciseKit:kit,SpaceWhaleHomeworkA21:require('../homework-a21.js')};
for(const name of ['course-content.js','course-content-smy-a21.js','course-content-directions-a21.js'])vm.runInNewContext(fs.readFileSync(require.resolve('../'+name),'utf8'),{window:app});
const lesson=app.SpaceWhaleContent.find(l=>l.id==='a2-1-w1-smy-3');
const homework=app.SpaceWhaleContent.find(l=>l.id===lesson.id+'-homework');
function setup(def){const {document}=parseHTML('<html><body><main></main></body></html>');const create=document.createElement.bind(document);document.createElement=tag=>{const el=create(tag);if(tag==='audio'){el.pause=()=>{};el.paused=true;}return el;};const host=document.querySelector('main');const handle=kit.mount(host,def,{syncChecks:true});return {host,handle};}
function walk(d,fn){fn(d);for(const b of d.exercises||[])walk(b.exercise,fn);}
test('new route resolves; homework is separate from the 28+2 minute lesson',()=>{
 const catalog=require('../workspace-catalog.js').createCatalog(app.SpaceWhaleContent,[]);
 const route=catalog.normalize({view:'library',level:'A2.1',whale:1,lesson:lesson.id,exercise:'A2_DIR_M01'});
 assert.equal(route.exercise,'A2_DIR_M01');assert.equal(lesson.stages.filter(s=>s.section==='tasks').reduce((n,s)=>n+parseFloat(s.guide.time),0)+lesson.feedback.minutes,30);
 assert.equal(lesson.stages.length,7);
 assert.ok(lesson.stages.every(s=>s.section==='tasks'));
 assert.equal(lesson.stages.at(-1).exercise.id,'A2_DIR_M07');
 assert.equal(homework.stages.length,2);
 assert.ok(homework.stages.every(s=>s.section==='self-study'));
 const homeworkRoute=catalog.normalize({view:'unassigned',lesson:homework.id,exercise:'A2_DIR_HW1'});
 assert.equal(homeworkRoute.exercise,'A2_DIR_HW1');
 assert.equal(homeworkRoute.lesson,homework.id);
 assert.match(fs.readFileSync(require.resolve('../classroom.html'),'utf8'),/course-content-directions-a21\.js/);
});
test('every stage mounts without exposing notes or requesting missing media',()=>{
 for(const stage of [...lesson.stages,...homework.stages]){const {host,handle}=setup(stage.exercise);assert.ok(!host.textContent.includes('ТОЧНЫЙ АУДИОСКРИПТ'));
 for(const img of host.querySelectorAll('img[src]'))assert.ok(fs.existsSync(require('node:path').join(__dirname,'..',img.getAttribute('src'))));
 for(const d of host.querySelectorAll('details'))if(d.querySelector('summary').textContent==='Useful phrases')assert.equal(d.open,true);
 for(const audio of host.querySelectorAll('audio[src]'))assert.ok(fs.existsSync(require('node:path').join(__dirname,'..',audio.getAttribute('src'))));handle.destroy();}
});
test('closed tasks grade and provide complete corrections',()=>{
 for(const s of lesson.stages)walk(s.exercise,d=>{const a={};if(['choice','matching'].includes(d.kind))d.items.forEach(i=>a[i.id]=i.correctIds||i.correctId);if(d.kind==='gaps')d.items.forEach(i=>i.segments.forEach(g=>{if(typeof g!=='string')a[g.id]=g.answers[0];}));if(Object.keys(a).length)assert.ok(Object.values(kit.grade(d,a)).every(v=>v==='correct'),d.id);});
 const d=lesson.stages.find(s=>s.exercise.id==='A2_DIR_PRACTICE').exercise.exercises[0].exercise;const {host,handle}=setup(d);const a={__sw_checked:true};d.items.forEach(i=>i.segments.forEach(g=>{if(typeof g!=='string')a[g.id]='incorrect';}));handle.setAnswers(a);assert.match(host.querySelector('.ek-answer-pairs').textContent,/Pass the café and stop at the cinema/);handle.destroy();
});
test('transcript stays gated until all comprehension attempts',()=>{
 const d=lesson.stages.find(s=>s.exercise.id==='A2_DIR_M06').exercise;const {host,handle}=setup(d);const transcript=host.querySelector('details');assert.equal(transcript.hidden,true);
 handle.setAnswers({'A2_DIR_M06-main':{'1':'B',__sw_checked:true}});assert.equal(transcript.hidden,true);
 handle.setAnswers({'A2_DIR_M06-main':{'1':'B',__sw_checked:true},'A2_DIR_M06-details':{'1':'C','2':'A','3':'B',__sw_choice_checked:['1','2','3'],__sw_choice_revealed:3,__sw_checked:true}});assert.equal(transcript.hidden,false);assert.equal(transcript.open,false);handle.destroy();
});

test("all nine lesson audio sources resolve to revisioned MP3 files",()=>{const media=app.SpaceWhaleLessonMedia[lesson.id];assert.equal(Object.keys(media).length,9);for(const entry of Object.values(media)){assert.match(entry.src,/_r1\.mp3$/);assert.ok(fs.statSync(require("node:path").join(__dirname,"..",entry.src)).size>10000);}walk(lesson.stages.find(s=>s.exercise.id==="A2_DIR_M03").exercise,d=>assert.equal(d.items.length,8));});

test('practice reveals dropdown, multiple select, correction and mapped sequence in that order',()=>{
 const practice=lesson.stages.find(s=>s.exercise.id==='A2_DIR_PRACTICE').exercise;
 assert.deepEqual(Array.from(practice.revealStops),[1,2,3,5]);
 assert.deepEqual(Array.from(practice.exercises,b=>b.exercise.kind),['gaps','choice','writing','presentation','order']);
 assert.ok(!lesson.stages.some(s=>s.exercise.id==='A2_DIR_M09'));
 const order=practice.exercises.at(-1).exercise;
 assert.deepEqual(Array.from(order.correctOrder),['along','across','through','past','towards','left-again','down','straight']);
 assert.ok(order.tokens.map(t=>t.id).join()!==order.correctOrder.join());
 for(const block of practice.exercises)kit.validate(block.exercise);
 assert.ok(homework.stages.every(s=>s.exercise.items.length===6&&s.exercise.responseMode==='accepted'));
});
test('error correction rejects nonsense and original mistakes, accepts valid variants and shows canonical corrections',()=>{
 const d=lesson.stages.find(s=>s.exercise.id==='A2_DIR_PRACTICE').exercise.exercises.find(b=>b.id==='A2_DIR_M08').exercise;
 for(const item of d.items){
  assert.equal(kit.grade(d,{[item.id]:'random nonsense'})[item.id],'retry');
  assert.equal(kit.grade(d,{[item.id]:item.prompt})[item.id],'retry');
  for(const value of item.acceptedAnswers)assert.equal(kit.grade(d,{[item.id]:value.toUpperCase().replace(/\.$/,'')})[item.id],'correct');
 }
 const {host,handle}=setup(d);handle.setAnswers({'1':'random nonsense','2':'random nonsense','3':'random nonsense',__sw_checked:true});
 const correction=host.querySelector('.ek-answer-pairs');assert.ok(correction);for(const item of d.items)assert.ok(correction.textContent.includes(item.acceptedAnswers[0]));assert.ok(!host.textContent.includes('Well done'));handle.destroy();
});
test('discovery reveals one question at a time while report mode shows all',()=>{
 let discovery;walk(lesson.stages.find(s=>s.exercise.id==='A2_DIR_M04').exercise,d=>{if(d.kind==='choice')discovery=d;});
 assert.equal(discovery.progressiveQuestions,true);
 const {host,handle}=setup(discovery);assert.equal(host.querySelectorAll('fieldset').length,1);handle.destroy();
 const {document}=parseHTML('<html><body><main></main></body></html>');const report=document.querySelector('main');const h=kit.mount(report,discovery,{readOnly:true,showAllQuestions:true});assert.equal(report.querySelectorAll('fieldset').length,3);h.destroy();
});
