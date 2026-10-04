const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{execFileSync}=require('node:child_process'),{parseHTML}=require('linkedom');
const {create}=require('../homework-store.js'),kit=require('../exercise-kit.js');
const packs=JSON.parse(execFileSync(process.execPath,['scripts/build-homework-catalog.cjs'],{cwd:require('node:path').resolve(__dirname,'..'),encoding:'utf8'}));
const memory=()=>{const data=new Map();return {getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};};
const record=()=>({id:'attempt',edit:'edit-secret',read:'read-secret',answers:{},revision:0,change:0,dirty:false});
test('six homework packs retain matching, complete audio, full classroom rules and two approved translations',()=>{
 assert.equal(packs.length,8);
 const app={SpaceWhaleExerciseKit:kit};for(const f of ['course-content.js','course-content-module4-34.js','course-content-module4-45.js'])vm.runInNewContext(fs.readFileSync(require('node:path').resolve(__dirname,'..',f),'utf8'),{window:app});const lessons=app.SpaceWhaleContent;
 const all=[];function walk(d){all.push(d);d.exercises?.forEach(b=>walk(b.exercise));d.blocks?.forEach(b=>{if(b.exercise)walk(b.exercise);});}lessons.forEach(l=>l.stages.forEach(s=>walk(s.exercise)));
 for(const p of packs.filter(p=>p.level==='A1.2')){assert.equal(p.level,'A1.2');assert.equal(p.steps[0].role,'words');assert.equal(p.steps[0].exercise.kind,'matching');assert.equal(p.steps[1].role,'listenRepeat');assert.ok(p.steps[1].exercise.items.every(i=>i.audio&&i.exampleAudio));assert.deepEqual(p.steps.slice(-2).map(s=>s.role),['translation','translation']);
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
async function page({url='https://example.test/homework.html',storage=memory(),rpc,clipboardFailure=false}){
 const dom=parseHTML(fs.readFileSync(require.resolve('../homework.html'),'utf8')),document=dom.document,window={Event:dom.window.Event};
 const createEl=document.createElement.bind(document);document.createElement=tag=>{const e=createEl(tag);if(tag==='input')e.select=()=>{};if(tag==='dialog'){e.showModal=()=>{e.open=true;};e.close=()=>{e.open=false;e.dispatchEvent(new dom.window.Event('close'));};}if(tag==='audio'){e.paused=true;e.pause=()=>{e.paused=true;};e.play=async()=>{e.paused=false;};}return e;};
 window.SpaceWhaleExerciseKit=kit;window.SpaceWhaleHomeworkStore={create};window.SpaceWhaleHomeworkFlow=model;window.SpaceWhaleHomeworkLinks=links;window.spaceWhaleSupabase={rpc:async(name,args)=>{try{return {data:await rpc(name,args),error:null};}catch(error){return {data:null,error};}}};
 const location=new URL(url),events={},intervals=[],timers=new Set();window.addEventListener=(type,fn)=>events[type]=fn;
 const ctx={window,document,location,URL,URLSearchParams,localStorage:storage,crypto:require('node:crypto').webcrypto,history:{replaceState:(_,__,url)=>{ctx.historyURL=url;}},navigator:{clipboard:{writeText:async value=>{if(clipboardFailure)throw Error('Clipboard denied');ctx.copied=value;}}},setTimeout:(fn,n)=>{const t=setTimeout(fn,n);timers.add(t);return t;},clearTimeout,setInterval:fn=>intervals.push(fn)};
 vm.runInNewContext(fs.readFileSync(require.resolve('../homework-links.js'),'utf8'),ctx);
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
 const resultURL=student.ctx.copied;assert.ok(resultURL.includes('?result='));assert.ok(!resultURL.includes('edit='));assert.match(doc.querySelector('#homeworkNoticeText').textContent,/Теперь отправьте/);
 const reviewer=await page({url:resultURL,rpc:db.rpc});assert.ok(reviewer.document.querySelector('.homework-report'));assert.equal(reviewer.document.querySelector('.homework-result').open,false);reviewer.click(reviewer.document.querySelector('.homework-result summary'));assert.match(reviewer.document.body.textContent,/Не поняла первое слово/);
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
 const db=backend(),p=await page({url:'https://example.test/homework.html?result=missing#key=bad',rpc:db.rpc});assert.match(p.document.querySelector('#homeworkNoticeText').textContent,/Работа не найдена/);assert.equal(p.document.querySelector('.ek-check'),null);p.close();
});

test('every published pack can complete every task through the shared UI and reopen the exact checked report',async()=>{
 for(const pack of packs){
  const db=backend(),r=links.fresh(pack.id);await links.start(r,db.rpc);
  const p=await page({url:links.url(r,'edit','https://example.test/'),rpc:db.rpc}),doc=p.document;
  const type=(el,value)=>{el.value=value;p.fire(el,'input');};
  for(let n=0;n<pack.steps.length;n++){
   const d=pack.steps[n].exercise,section=doc.querySelectorAll('.ek-stage-section')[n];assert.ok(section,`${pack.id}: ${d.id}`);
   assert.equal(section.hidden,false);
   const next=()=>doc.querySelector('[aria-label="Show next exercise"]');
   if(['audio','rule-page'].includes(d.kind)){
    if(d.kind==='audio')assert.equal([...section.querySelectorAll('.ek-repeat-item')].filter(e=>!e.hidden).length,d.items.reduce((sum,i)=>sum+1+(i.example?1:0),0));
    if(next())assert.equal(next().disabled,false);
   }else{
    if(next())assert.equal(next().disabled,true,`${d.id} waits for OK`);
    if(d.kind==='matching')for(let i=0;i<d.items.length;i++){
     p.click(section.querySelectorAll('.ek-match-slot')[i]);const text=d.options.find(o=>o.id===d.items[i].correctId).text;
     p.click([...doc.querySelectorAll('dialog .ek-option')].find(o=>o.textContent===text));
    }
    if(d.kind==='gaps'){
     const gaps=d.items.flatMap(i=>i.segments.filter(s=>typeof s!=='string'));
     for(let i=0;i<gaps.length;i++){
      const el=section.querySelectorAll(d.inputMode==='select'?'.ek-choice-trigger':'input.ek-gap')[i];
      if(d.inputMode==='select'){p.click(el);p.click([...section.querySelectorAll('.ek-inline-choice')[i].querySelectorAll('.ek-inline-option')].find(e=>e.textContent===gaps[i].answers[0]));}
      else type(el,gaps[i].answers[0]);
     }
    }
    if(d.kind==='choice')for(const item of d.items){const el=[...section.querySelectorAll('input')].find(e=>e.name===`${d.id}-${item.id}`&&e.value===item.correctId);el.checked=true;p.fire(el,'change');}
    if(d.kind==='writing')d.items.forEach((item,i)=>type(section.querySelectorAll('.ek-writing-input')[i],item.acceptedAnswers[0]));
    const check=section.querySelector('.ek-check');assert.equal(check.hidden,false,`${d.id} exposes OK`);p.click(check);
    assert.equal(section.querySelector('.ek-skip').hidden,true,'checked work is not erased by Skip');
    assert.ok(!section.querySelector('[data-feedback="retry"]'),`${d.id} accepts canonical answers`);
    if(next())assert.equal(next().disabled,false);
   }
   if(n<pack.steps.length-1)p.click(next());
  }
  assert.equal(doc.querySelector('.homework-finish').disabled,false,pack.id);
  p.click(doc.querySelector('.homework-finish'));await p.settle();await p.settle();
  assert.ok(p.ctx.copied?.includes('?result='));
  const review=await page({url:p.ctx.copied,rpc:db.rpc});
  assert.equal(review.document.querySelectorAll('.homework-result').length,pack.steps.length);
  assert.ok(!review.document.body.textContent.includes('Не проверено'));
  assert.ok(!review.document.body.textContent.includes('Пропущено'));
  p.close();review.close();
 }
});
test('copy failure is visible, repeat copy does not create a new assignment, notification can be closed',async()=>{
 const db=backend(),p=await page({rpc:db.rpc,clipboardFailure:true});p.click(p.document.querySelector('.homework-issuer button'));await p.settle();await p.settle();
 const issuer=p.document.querySelector('.homework-issuer'),url=issuer.querySelector('input').value;
 assert.ok(url.includes('?work='));assert.match(issuer.textContent,/Автоматическое копирование недоступно/);
 assert.equal(p.document.querySelector('#homeworkNotice').hidden,false);
 p.ctx.navigator.clipboard.writeText=async value=>{p.ctx.copied=value;};
 p.click(issuer.querySelectorAll('button')[1]);await p.settle();assert.equal(p.ctx.copied,url);assert.equal(db.works.size,1);
 assert.match(p.document.querySelector('#homeworkNoticeText').textContent,/Ссылка скопирована/);
 p.click(p.document.querySelector('#homeworkNoticeClose'));assert.equal(p.document.querySelector('#homeworkNotice').hidden,true);p.close();
});
test('browser storage failure still permits remote save',async()=>{
 const s=create({storage:{setItem:()=>{throw Error('quota');}},key:'draft',record:record(),rpc:async(_,a)=>({revision:a.p_revision+1})});
 s.update('one',{a:'answer'});await s.flush();assert.equal(s.state.dirty,false);assert.equal(s.state.revision,1);
});

test('editing an earlier answer does not trap navigation and unfinished work is explained at the finish',async()=>{
 const db=backend(),r=links.fresh(packs[0].id);await links.start(r,db.rpc);const p=await page({url:links.url(r,'edit','https://example.test/'),rpc:db.rpc}),doc=p.document;
 p.click(doc.querySelector('.ek-skip'));assert.equal(doc.querySelector('[aria-label="Show next exercise"]').disabled,false);
 // Reset an earlier skipped exercise; audio still has an immediately active forward arrow.
 p.click(doc.querySelector('.ek-reset'));
 assert.equal(doc.querySelector('[aria-label="Show next exercise"]').disabled,false);
 for(let i=1;i<packs[0].steps.length;i++)p.click(doc.querySelectorAll('.ek-stage-section')[i].querySelector('.ek-skip'));
 assert.equal(doc.querySelector('.homework-finish').disabled,true);
 assert.match(doc.querySelector('.homework-remaining').textContent,/Проверьте ответы/);
 assert.equal(doc.querySelector('.homework-remaining').querySelectorAll('button').length,1);
 p.click(doc.querySelectorAll('.ek-stage-section')[0].querySelector('.ek-skip'));
 assert.equal(doc.querySelector('.homework-finish').disabled,false);p.close();
});
test('network failure preserves checked answers and resume restores them before submission',async()=>{
 const db=backend(),r=links.fresh(packs[0].id),storage=memory();await links.start(r,db.rpc);let offline=true;
 const p=await page({url:links.url(r,'edit','https://example.test/'),storage,rpc:async(name,a)=>{if(name==='homework_save'&&offline)throw Error('offline');return db.rpc(name,a);}});
 p.click(p.document.querySelector('.ek-skip'));p.intervals[0]();await p.settle();
 assert.match(p.document.querySelector('#homeworkNoticeText').textContent,/Не удалось сохранить/);
 assert.equal(db.works.get(r.id).revision,0);offline=false;p.events.online();await p.settle();
 assert.equal(db.works.get(r.id).answers[packs[0].steps[0].exercise.id].__sw_skipped,true);
 const resumed=await page({url:links.url(r,'edit','https://example.test/'),rpc:db.rpc});
 assert.equal(resumed.document.querySelectorAll('.ek-stage-section').length,2);
 assert.equal(resumed.document.querySelector('[aria-label="Show next exercise"]').disabled,false);p.close();resumed.close();
});
test('all homework audio and image sources resolve to existing repository assets',()=>{
 const path=require('node:path'),missing=[];
 function walk(value){if(!value||typeof value!=='object')return;for(const [key,v] of Object.entries(value)){if(['image','audio','exampleAudio'].includes(key)&&typeof v==='string'&&!/^https?:/.test(v)){if(!fs.existsSync(path.resolve(__dirname,'..',v)))missing.push(v);}else walk(v);}}
 packs.forEach(walk);assert.deepEqual(missing,[]);
});
