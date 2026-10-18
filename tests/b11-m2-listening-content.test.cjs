const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {parseHTML}=require('linkedom'),kit=require('../exercise-kit.js'),{createCatalog}=require('../workspace-catalog.js');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8'),plain=v=>JSON.parse(JSON.stringify(v));
const extension='course-content-b11-m2-listening.js';
function fixture(){
 const app={SpaceWhaleExerciseKit:kit},context=vm.createContext({window:app});
 // Load the actual classroom content scripts, in their shipped order.
 const files=[...read('classroom.html').matchAll(/<script src="([^?" ]+)(?:\?[^" ]*)?"><\/script>/g)].map(m=>m[1]);
 let before;
 for(const file of files.filter(f=>/^(course-content|whale1-content|lesson-draft|lesson-structure-content|lesson-teacher-info|teacher-copy|homework-a21)/.test(f))){
  if(file===extension)before=plain(app.SpaceWhaleContent);
  vm.runInContext(read(file),context,{filename:file});
 }
 return {app,before,apply:()=>vm.runInContext(read(extension),context)};
}
const walk=d=>[d,...(d.exercises||[]).flatMap(b=>walk(b.exercise))];
const selected=app=>app.SpaceWhaleContent.filter(l=>/^b1-1-w2-l[1-4]$/.test(l.id));
const stage=l=>l.stages.find(s=>s.exercise.id.startsWith('B11_M02_')&&s.role==='listening');
const answers=d=>d.kind==='gaps'?Object.fromEntries(d.items.flatMap(i=>i.segments.filter(s=>typeof s==='object').map(g=>[g.id,g.answers[0]]))):Object.fromEntries(d.items.map(i=>[i.id,i.correctIds||i.correctId||i.acceptedAnswers?.[0]||'A valid answer for teacher review.']));
const visible=e=>{for(let p=e;p;p=p.parentElement)if(p.hidden)return false;return true;};

test('Listening is the last Lexis / Grammar entry in all four final classroom lessons and reload preserves content',()=>{
 const {app,before,apply}=fixture(),lessons=selected(app);assert.equal(lessons.length,4);
 for(const lesson of lessons){
  const previous=before.find(l=>l.id===lesson.id);
  assert.deepEqual(plain(lesson.stages.filter(s=>s!==stage(lesson))),previous.stages);
 }
 const once=JSON.stringify(app.SpaceWhaleContent);apply();assert.equal(JSON.stringify(app.SpaceWhaleContent),once);
 const catalog=createCatalog(app.SpaceWhaleContent,[]);
 for(const source of lessons){
  const lesson=catalog.lessons.find(l=>l.id===source.id),id=stage(source).exercise.id;
  assert.equal(lesson.blocks.find(b=>b.id==='language').stageIds.at(-1),id);
  assert.equal(lesson.stages.at(-1).role,'final');
  for(const item of lesson.stages)kit.validate(item.exercise);
 }
});

test('five approved source templates have correct keys, four pending masters and shared L4 recording',()=>{
 const {app}=fixture(),all=selected(app).flatMap(l=>walk(stage(l).exercise));
 const groups=all.filter(d=>d.templateCode&&d.kind==='stage');assert.deepEqual(plain(groups.map(d=>d.templateCode)),['L01','L12','L13','L02','L09']);
 const audio=all.filter(d=>d.kind==='audio');assert.equal(audio.length,5);assert.equal(new Set(audio.map(d=>d.recordingId)).size,4);
 assert.deepEqual(plain(audio.map(d=>d.authorTranscript.split('\n\n').length)),[9,8,10,11,11]);
 for(const d of audio){assert.equal(d.audioPending,true);assert.equal(d.audio,undefined);assert.equal(d.transcript,undefined);}
 assert.equal(audio[3].authorTranscript,audio[4].authorTranscript);
 for(const group of groups){
  for(const d of walk(kit.templates.resolve(group)))assert.equal(kit.templates.profileFor(d.templateCode,d.kind,d.templatePart).supported,true);
  const task=group.exercises[1].exercise;
  if(task.kind==='writing'){
   assert.equal(task.responseMode,'open');assert.ok(task.items.every(i=>!i.acceptedAnswers&&i.possibleAnswers.length));
   assert.ok(Object.values(kit.grade(task,Object.fromEntries(task.items.map(i=>[i.id,'A paraphrased answer.'])))).every(r=>r==='review'));
  }else assert.ok(Object.values(kit.grade(task,answers(task))).every(r=>r==='correct'));
 }
 assert.deepEqual(plain(groups[0].exercises[1].exercise.items.map(i=>i.correctId)),['true','false','false','true']);
 assert.deepEqual(plain(groups[2].exercises[1].exercise.items[0].correctIds),['A','D','E']);
 assert.equal(groups[3].exercises[1].exercise.items[0].correctId,'B');
});

test('shared players remain disabled and scripts wait for the response, with no L4 gist transcript',()=>{
 const {app}=fixture();
 for(const lesson of selected(app)){
  const def=stage(lesson).exercise;
  for(const group of walk(def).filter(d=>d.templateCode&&d.kind==='stage')){
   const {document}=parseHTML('<html><body><main></main></body></html>'),host=document.querySelector('main');
   const handle=kit.mount(host,group,{syncChecks:true}),task=group.exercises[1].exercise;
   for(const media of host.querySelectorAll('audio'))media.pause=()=>{};
   assert.equal(host.querySelectorAll('audio[src]').length,0);
   const players=[...host.querySelectorAll('.ek-audio-play')];assert.equal(players.length,1);assert.ok(players.every(p=>p.disabled));
   const disclosure=host.querySelector('details');
   if(group.templateCode==='L02'){assert.equal(disclosure,null);handle.destroy();continue;}
   assert.ok(disclosure);assert.equal(visible(disclosure),false);
   const response=task.kind==='writing'?Object.fromEntries(task.items.map(i=>[i.id,'An acceptable paraphrase.'])):answers(task);
   handle.setAnswers({task:{...response,__sw_checked:true}});
   assert.equal(visible(disclosure),false);
   handle.setAnswers({revealed:group.exercises.length,...Object.fromEntries(group.exercises.filter(b=>b.exercise.kind!=='audio').map(b=>[b.id,{...answers(b.exercise),__sw_checked:true}]))});
   assert.equal(visible(disclosure),true);assert.equal(disclosure.open,false);
   handle.destroy();
  }
 }
});

test('L4 keeps the second task behind the teacher arrow and keeps the script hidden until its added grammar tasks are completed',()=>{
 const {app}=fixture(),def=stage(selected(app)[3]).exercise;
 const {document,window}=parseHTML('<html><body><main></main></body></html>'),host=document.querySelector('main');
 const handle=kit.mount(host,def,{syncChecks:true});
 const next=()=>[...host.querySelectorAll('[aria-label="Show next exercise"]')].find(visible);
 assert.equal([...host.querySelectorAll('details')].some(visible),false);
 assert.equal(host.querySelectorAll('.ek-choice-trigger').length,0);
 assert.equal(next().disabled,true);
 handle.setAnswers({gist:{task:{topic:'B',__sw_checked:true}}});
 assert.equal(next().disabled,false);next().dispatchEvent(new window.Event('click',{bubbles:true}));
 assert.equal(host.querySelectorAll('.ek-choice-trigger').length,3);
 assert.equal([...host.querySelectorAll('details')].some(visible),false);
 const current=handle.getAnswers(),details=def.exercises[1].exercise.exercises[1].exercise;
 handle.setAnswers({...current,details:{task:{...answers(details),__sw_checked:true}}});
 assert.equal([...host.querySelectorAll('details')].some(visible),false);
 const detailGroup=def.exercises[1].exercise;
 handle.setAnswers({...handle.getAnswers(),details:{revealed:detailGroup.exercises.length,...Object.fromEntries(detailGroup.exercises.filter(b=>b.exercise.kind!=='audio').map(b=>[b.id,{...answers(b.exercise),__sw_checked:true}]))}});
 assert.ok([...host.querySelectorAll('details')].some(d=>visible(d)&&d.querySelector('summary')?.textContent==='See the script'));
 for(const media of host.querySelectorAll('audio'))media.pause=()=>{};
 handle.destroy();
});

test('each lesson adds two grammar tasks; typed canonical answers reconstruct exact dialogue lines',()=>{
 const {app}=fixture();
 for(const [i,lesson] of selected(app).entries()){
  const def=stage(lesson).exercise,all=walk(def),responses=all.filter(d=>['choice','gaps','writing'].includes(d.kind));
  assert.equal(responses.length,i===3?4:3);
  const typed=all.find(d=>d.kind==='gaps'&&d.inputMode==='text'),script=all.find(d=>d.kind==='audio').authorTranscript;
  assert.ok(typed);assert.equal(typed.items.length,4);
  assert.equal(typed.bank,undefined);
  for(const row of typed.items){
   const line=row.segments.map(s=>typeof s==='string'?s:s.answers[0]).join('');
   assert.ok(script.includes(line),line);
   for(const g of row.segments.filter(s=>typeof s==='object')){
    assert.equal(g.options,undefined);
    for(const variant of g.answers)assert.equal(kit.grade(typed,{...answers(typed),[g.id]:variant})[g.id],'correct',variant);
    assert.equal(kit.grade(typed,{...answers(typed),[g.id]:'would did'})[g.id],'retry');
   }
  }
  const production=all.find(d=>d.kind==='writing'&&/_GRAMMAR_LISTENING$/.test(d.id));
  assert.equal(production.items.length,3);
  const resolved=kit.templates.resolve(def);
  for(const d of walk(resolved))if(d.templateCode)assert.equal(kit.templates.profileFor(d.templateCode,d.kind,d.templatePart).supported,true,d.id);
  assert.ok(Object.values(kit.grade(production,answers(production))).every(r=>r===(i===2?'correct':'review')));
  if(i===2){
   assert.ok(Object.values(kit.grade(production,Object.fromEntries(production.items.map(item=>[item.id,item.prompt])))).every(r=>r==='retry'));
  }
 }
});
