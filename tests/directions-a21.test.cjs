const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {parseHTML}=require('linkedom');const kit=require('../exercise-kit.js');
const app={SpaceWhaleExerciseKit:kit};
for(const name of ['course-content.js','course-content-smy-a21.js','course-content-directions-a21.js'])vm.runInNewContext(fs.readFileSync(require.resolve('../'+name),'utf8'),{window:app});
const lesson=app.SpaceWhaleContent.find(l=>l.id==='a2-1-w1-smy-3');
const homework=app.SpaceWhaleContent.find(l=>l.id===lesson.id+'-homework');
function setup(def){const {document}=parseHTML('<html><body><main></main></body></html>');const create=document.createElement.bind(document);document.createElement=tag=>{const el=create(tag);if(tag==='audio'){el.pause=()=>{};el.paused=true;}return el;};const host=document.querySelector('main');const handle=kit.mount(host,def,{syncChecks:true});return {host,handle};}
function walk(d,fn){fn(d);for(const b of d.exercises||[])walk(b.exercise,fn);}
test('new route resolves; homework is separate from the 28+2 minute lesson',()=>{
 const catalog=require('../workspace-catalog.js').createCatalog(app.SpaceWhaleContent,[]);
 const route=catalog.normalize({view:'library',level:'A2.1',whale:1,lesson:lesson.id,exercise:'A2_DIR_M01'});
 assert.equal(route.exercise,'A2_DIR_M01');assert.equal(lesson.stages.filter(s=>s.section==='tasks').reduce((n,s)=>n+parseFloat(s.guide.time),0)+lesson.feedback.minutes,30);
 assert.equal(lesson.stages.length,9);
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
 for(const s of lesson.stages)walk(s.exercise,d=>{const a={};if(['choice','matching'].includes(d.kind))d.items.forEach(i=>a[i.id]=i.correctId);if(d.kind==='gaps')d.items.forEach(i=>i.segments.forEach(g=>{if(typeof g!=='string')a[g.id]=g.answers[0];}));if(Object.keys(a).length)assert.ok(Object.values(kit.grade(d,a)).every(v=>v==='correct'),d.id);});
 const d=lesson.stages.find(s=>s.exercise.id==='A2_DIR_M05').exercise;const {host,handle}=setup(d);const a={__sw_checked:true};d.items.forEach(i=>i.segments.forEach(g=>{if(typeof g!=='string')a[g.id]='incorrect';}));handle.setAnswers(a);assert.match(host.querySelector('.ek-answer-pairs').textContent,/Pass the café and stop at the cinema/);handle.destroy();
});
test('transcript stays gated until all comprehension attempts',()=>{
 const d=lesson.stages.find(s=>s.exercise.id==='A2_DIR_M06').exercise;const {host,handle}=setup(d);const transcript=host.querySelector('details');assert.equal(transcript.hidden,true);
 handle.setAnswers({'A2_DIR_M06-main':{'1':'B',__sw_checked:true}});assert.equal(transcript.hidden,true);
 handle.setAnswers({'A2_DIR_M06-main':{'1':'B',__sw_checked:true},'A2_DIR_M06-details':{'1':'C','2':'A','3':'B',__sw_choice_checked:['1','2','3'],__sw_choice_revealed:3,__sw_checked:true}});assert.equal(transcript.hidden,false);assert.equal(transcript.open,false);handle.destroy();
});

test("all nine lesson audio sources resolve to revisioned MP3 files",()=>{const media=app.SpaceWhaleLessonMedia[lesson.id];assert.equal(Object.keys(media).length,9);for(const entry of Object.values(media)){assert.match(entry.src,/_r1\.mp3$/);assert.ok(fs.statSync(require("node:path").join(__dirname,"..",entry.src)).size>10000);}walk(lesson.stages.find(s=>s.exercise.id==="A2_DIR_M03").exercise,d=>assert.equal(d.items.length,8));});

test('new practice precedes final speaking; writing source and field open together',()=>{
 const ids=lesson.stages.map(s=>s.exercise.id);
 assert.deepEqual(Array.from(ids.slice(-3)),['A2_DIR_M08','A2_DIR_M09','A2_DIR_M07']);
 const correction=lesson.stages.find(s=>s.exercise.id==='A2_DIR_M08').exercise;
 assert.equal(correction.responseMode,'open');
 assert.ok(correction.items.every(i=>!i.acceptedAnswers&&!i.promptHighlights));
 const writing=lesson.stages.find(s=>s.exercise.id==='A2_DIR_M09').exercise;
 const {host,handle}=setup(writing);
 assert.ok(host.querySelector('img[src$="test-route.svg"]'));
 const input=host.querySelector('textarea');assert.ok(input);
 let parent=input;while(parent){assert.ok(!parent.hidden,'writing field is hidden');parent=parent.parentElement;}
 assert.ok(!host.textContent.includes('Follow the path to the stairs and go down them.'));
 handle.destroy();
});
