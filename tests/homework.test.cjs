const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{execFileSync}=require('node:child_process'),{parseHTML}=require('linkedom');
const {create}=require('../homework-store.js'),kit=require('../exercise-kit.js');
const packs=JSON.parse(execFileSync(process.execPath,['scripts/build-homework-catalog.cjs'],{cwd:require('node:path').resolve(__dirname,'..'),encoding:'utf8'}));
const memory=()=>{const data=new Map();return {getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};};
const record=()=>({id:'attempt',edit:'edit-secret',read:'read-secret',answers:{},revision:0,change:0,dirty:false});
test('six homework packs retain matching, complete audio, full classroom rules and two approved translations',()=>{
 assert.equal(packs.length,6);
 const app={SpaceWhaleExerciseKit:kit};for(const f of ['course-content.js','course-content-module4-34.js','course-content-module4-45.js'])vm.runInNewContext(fs.readFileSync(require('node:path').resolve(__dirname,'..',f),'utf8'),{window:app});const lessons=app.SpaceWhaleContent;
 const all=[];function walk(d){all.push(d);d.exercises?.forEach(b=>walk(b.exercise));d.blocks?.forEach(b=>{if(b.exercise)walk(b.exercise);});}lessons.forEach(l=>l.stages.forEach(s=>walk(s.exercise)));
 for(const p of packs){assert.equal(p.level,'A1.2');assert.equal(p.steps[0].role,'words');assert.equal(p.steps[0].exercise.kind,'matching');assert.equal(p.steps[1].role,'listenRepeat');assert.ok(p.steps[1].exercise.items.every(i=>i.audio&&i.exampleAudio));assert.deepEqual(p.steps.slice(-2).map(s=>s.role),['translation','translation']);
 for(const step of p.steps){kit.validate(step.exercise);if(step.role==='rule'){const original=all.find(d=>d.id===step.exercise.id.replace(/-homework-rule$/,''));assert.deepEqual(step.exercise.blocks,clone(original.blocks.filter(b=>b.type==='rule')));}}
 }
});
test('autosave serializes in-flight changes and persists revision without dropping a newer answer',async()=>{
 const storage=memory(),calls=[],pending=[];const s=create({storage,key:'draft',record:record(),rpc:(_,args)=>{calls.push(args);return new Promise(resolve=>pending.push(resolve));}});
 s.update('one',{a:'first'});const saving=s.flush();s.update('one',{a:'second'});s.flush();assert.equal(calls.length,1);
 pending.shift()({revision:1});await new Promise(setImmediate);assert.equal(calls.length,2);assert.equal(calls[1].p_revision,1);assert.equal(calls[1].p_answers.one.a,'second');pending.shift()({revision:2});await saving;
 assert.equal(s.state.dirty,false);assert.equal(JSON.parse(storage.getItem('draft')).revision,2);
});
test('failed save retains draft and retries with the same revision',async()=>{
 const storage=memory();let fail=true;const s=create({storage,key:'draft',record:record(),rpc:async()=>{if(fail)throw Error('offline');return {revision:1};}});
 s.update('one',{a:'saved locally'});await assert.rejects(s.flush());assert.equal(s.state.dirty,true);assert.equal(JSON.parse(storage.getItem('draft')).answers.one.a,'saved locally');fail=false;await s.flush();assert.equal(s.state.dirty,false);
});
const model=require('../homework-flow.js'),links=require('../homework-links.js');
const clone=v=>JSON.parse(JSON.stringify(v));
function backend(){const works=new Map();return {works,rpc:async(name,a)=>{
 if(name==='homework_template')return a.p_lesson?packs.find(p=>p.id===a.p_lesson):packs.map(({id,level,title})=>({id,level,title}));
 if(name==='homework_start'){if(!works.has(a.p_id))works.set(a.p_id,{id:a.p_id,edit:a.p_edit_key,read:a.p_read_key,definition:clone(packs.find(p=>p.id===a.p_lesson)),answers:{},revision:0,submitted_at:null});const w=works.get(a.p_id);if(w.edit!==a.p_edit_key)throw Error('Work unavailable');return clone(w);}
 const w=works.get(a.p_id);if(!w)throw Error('Work unavailable');
 if(name==='homework_read'){if(![w.edit,w.read].includes(a.p_key))throw Error('Work unavailable');return clone(w);}
 if(a.p_edit_key!==w.edit)throw Error('Work unavailable');
 if(name==='homework_submit'&&w.submitted_at)return clone(w);
 if(w.submitted_at)throw Error('Work submitted');if(a.p_revision!==w.revision)throw Error('Revision conflict');
 if(name==='homework_save')w.answers=clone(a.p_answers);else if(name==='homework_submit')w.submitted_at='2026-10-04T10:00:00Z';w.revision++;return clone(w);
}};}
async function page({url='https://example.test/homework.html',storage=memory(),rpc}){
 const dom=parseHTML(fs.readFileSync(require.resolve('../homework.html'),'utf8')),document=dom.document,window={Event:dom.window.Event};
 const createEl=document.createElement.bind(document);document.createElement=tag=>{const e=createEl(tag);if(tag==='dialog'){e.showModal=()=>{e.open=true;};e.close=()=>{e.open=false;e.dispatchEvent(new dom.window.Event('close'));};}if(tag==='audio'){e.paused=true;e.pause=()=>{e.paused=true;};e.play=async()=>{e.paused=false;};}return e;};
 window.SpaceWhaleExerciseKit=kit;window.SpaceWhaleHomeworkStore={create};window.SpaceWhaleHomeworkFlow=model;window.SpaceWhaleHomeworkLinks=links;window.spaceWhaleSupabase={rpc:async(name,args)=>{try{return {data:await rpc(name,args),error:null};}catch(error){return {data:null,error};}}};
 const location=new URL(url),events={},intervals=[],timers=new Set();window.addEventListener=(type,fn)=>events[type]=fn;
 const ctx={window,document,location,URL,URLSearchParams,localStorage:storage,crypto:require('node:crypto').webcrypto,history:{replaceState:(_,__,url)=>{ctx.historyURL=url;}},navigator:{clipboard:{writeText:async value=>{ctx.copied=value;}}},setTimeout:(fn,n)=>{const t=setTimeout(fn,n);timers.add(t);return t;},clearTimeout,setInterval:fn=>intervals.push(fn)};
 await vm.runInNewContext(fs.readFileSync(require.resolve('../homework.js'),'utf8'),ctx);
 const fire=(el,type)=>{assert.ok(el,'event target exists');el.dispatchEvent(new dom.window.Event(type,{bubbles:true,cancelable:true}));};
 const click=el=>fire(el,'click');const settle=()=>new Promise(setImmediate);
 const close=()=>timers.forEach(clearTimeout);
 return {document,window,events,intervals,ctx,click,fire,settle,close};
}
test('issue → perform → submit → open in a separate browser context preserves answers, errors and comment',async()=>{
 const db=backend(),teacher=await page({rpc:db.rpc});const issue=[...teacher.document.querySelectorAll('button')].find(b=>b.textContent==='Выдать задание');teacher.click(issue);await teacher.settle();
 const editURL=teacher.ctx.copied;assert.ok(editURL.includes('?work='));assert.ok(editURL.includes('#edit='));
 const student=await page({url:editURL,rpc:db.rpc});const doc=student.document;
 assert.equal(doc.querySelectorAll('.ek-stage-section').length,1);assert.ok(student.events.online);assert.ok(student.events.beforeunload);
 const first=packs[0].steps[0].exercise;
 for(let i=0;i<first.items.length;i++){
  student.click(doc.querySelectorAll('.ek-match-slot')[i]);const key=first.items[i<2?1-i:i].correctId;const label=first.options.find(o=>o.id===key).text;
  student.click([...doc.querySelectorAll('dialog .ek-option')].find(b=>b.textContent===label));
 }
 student.click(doc.querySelector('.ek-check'));assert.ok(doc.querySelector('[data-feedback="retry"]'));
 student.click(doc.querySelector('[aria-label="Show next exercise"]'));
 assert.equal([...doc.querySelectorAll('.ek-repeat-item')].filter(e=>!e.hidden).length,12);
 const next=()=>doc.querySelector('[aria-label="Show next exercise"]');assert.equal(next().disabled,false);
 // Audio can be skipped immediately; every subsequent response and rule supports Skip.
 for(let i=1;i<packs[0].steps.length;i++){
  const section=doc.querySelectorAll('.ek-stage-section')[i];assert.ok(section,`step ${i} revealed`);student.click(section.querySelector('.ek-skip'));
 }
 const input=doc.querySelector('#homeworkComment');input.value='Не поняла первое слово.';student.fire(input,'input');
 const finish=doc.querySelector('.homework-finish');assert.equal(finish.disabled,false);student.click(finish);await student.settle();await student.settle();
 const resultURL=student.ctx.copied;assert.ok(resultURL.includes('?result='));assert.ok(!resultURL.includes('edit='));assert.match(doc.querySelector('#homeworkStatus').textContent,/Теперь отправьте/);
 const reviewer=await page({url:resultURL,rpc:db.rpc});assert.ok(reviewer.document.querySelector('.homework-report'));assert.ok(reviewer.document.querySelector('.homework-result').open);assert.match(reviewer.document.body.textContent,/Не поняла первое слово/);
 assert.match(reviewer.document.querySelector('.homework-result-summary').textContent,/Верно: 4 из 6/);assert.ok(reviewer.document.querySelector('[data-feedback="retry"]'));assert.ok(reviewer.document.querySelector('.ek-correction'));
 assert.equal(reviewer.document.querySelector('.homework-finish'),null);assert.ok([...reviewer.document.querySelectorAll('.homework-report input,.homework-report textarea,.homework-report .ek-match-slot')].every(e=>e.disabled));
 const repeat=await page({url:editURL,rpc:db.rpc});assert.ok(repeat.document.querySelector('.homework-report'),'submitted editing link also opens result');
 teacher.click(issue);await teacher.settle();assert.notEqual(teacher.ctx.copied,editURL);assert.equal(db.works.size,2);assert.ok([...db.works.values()][0].submitted_at);
 for(const p of [teacher,student,reviewer,repeat])p.close();
});
test('progress requires checked responses or explicit Skip; mistakes still count as completed',()=>{
 const p=packs[0],a={revealed:p.steps.length};for(const s of p.steps)if(Object.keys(kit.grade(s.exercise,{})).length)a[s.exercise.id]={__sw_skipped:true};assert.equal(model.progress(p,a,kit).complete,true);a.__seen=a.revealed;a.revealed=1;assert.equal(model.progress(p,a,kit).complete,true);delete a[p.steps[0].exercise.id];assert.equal(model.progress(p,a,kit).complete,false);
});
test('invalid result URLs never fall through to a blank learner assignment',async()=>{
 const db=backend(),p=await page({url:'https://example.test/homework.html?result=missing#key=bad',rpc:db.rpc});assert.match(p.document.querySelector('#homeworkStatus').textContent,/Работа не найдена/);assert.equal(p.document.querySelector('.ek-check'),null);p.close();
});
