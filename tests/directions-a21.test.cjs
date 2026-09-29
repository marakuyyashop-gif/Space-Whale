const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {parseHTML}=require('linkedom');const kit=require('../exercise-kit.js');
const app={SpaceWhaleExerciseKit:kit};
for(const name of ['course-content.js','course-content-smy-a21.js','course-content-directions-a21.js'])vm.runInNewContext(fs.readFileSync(require.resolve('../'+name),'utf8'),{window:app});
const lesson=app.SpaceWhaleContent.find(l=>l.id==='a2-1-w1-smy-3');
function setup(def){const {document}=parseHTML('<html><body><main></main></body></html>');const create=document.createElement.bind(document);document.createElement=tag=>{const el=create(tag);if(tag==='audio'){el.pause=()=>{};el.paused=true;}return el;};const host=document.querySelector('main');const handle=kit.mount(host,def,{syncChecks:true});return {host,handle};}
function walk(d,fn){fn(d);for(const b of d.exercises||[])walk(b.exercise,fn);}
test('new route resolves; homework is separate from the 28+2 minute lesson',()=>{
 const catalog=require('../workspace-catalog.js').createCatalog(app.SpaceWhaleContent,[]);
 const route=catalog.normalize({view:'library',level:'A2.1',whale:1,lesson:lesson.id,exercise:'A2_DIR_M01'});
 assert.equal(route.exercise,'A2_DIR_M01');assert.equal(lesson.stages.filter(s=>s.section==='tasks').reduce((n,s)=>n+parseFloat(s.guide.time),0)+lesson.feedback.minutes,30);
 assert.equal(lesson.stages.filter(s=>s.section==='self-study').length,2);
 assert.match(fs.readFileSync(require.resolve('../classroom.html'),'utf8'),/course-content-directions-a21\.js/);
});
test('every stage mounts without exposing notes or requesting missing media',()=>{
 for(const stage of lesson.stages){const {host,handle}=setup(stage.exercise);assert.ok(!host.textContent.includes('ТОЧНЫЙ АУДИОСКРИПТ'));
 for(const img of host.querySelectorAll('img[src]'))assert.ok(fs.existsSync(require('node:path').join(__dirname,'..',img.getAttribute('src'))));
 for(const d of host.querySelectorAll('details'))if(d.querySelector('summary').textContent==='Useful phrases')assert.equal(d.open,true);
 assert.equal(host.querySelectorAll('audio[src]').length,0);handle.destroy();}
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
