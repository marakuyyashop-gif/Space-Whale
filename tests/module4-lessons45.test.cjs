const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {parseHTML}=require('linkedom'),kit=require('../exercise-kit.js');
const app={SpaceWhaleExerciseKit:kit};
const run=f=>vm.runInNewContext(fs.readFileSync(require.resolve('../'+f),'utf8'),{window:app});
run('course-content.js');run('course-content-module4-34.js');
const prior=new Map(app.SpaceWhaleContent.map(l=>[l.id,JSON.stringify(l)]));run('course-content-module4-45.js');
const lessons=app.SpaceWhaleContent.filter(l=>['a1-2-w4-l4','a1-2-w4-l5'].includes(l.id));
function setup(def,config={}){
 const {document,window}=parseHTML('<html><body><main></main></body></html>');
 const create=document.createElement.bind(document);document.createElement=tag=>{const el=create(tag);if(tag==='audio')el.pause=()=>{};return el;};
 const host=document.querySelector('main'),handle=kit.mount(host,def,{syncChecks:true,syncDisclosures:true,...config});return {host,handle,window};
}
function walk(d,fn){fn(d);d.exercises?.forEach(e=>walk(e.exercise,fn));}
const find=id=>lessons.flatMap(l=>l.stages).find(s=>s.exercise.id===id).exercise;
function click(v,selector){v.host.querySelector(selector).dispatchEvent(new v.window.Event('click',{bubbles:true,cancelable:true}));}
test('revision is isolated to L4/L5, with 30-minute plan including reserve and separate homework',()=>{
 for(const l of app.SpaceWhaleContent)if(prior.has(l.id)&&l.id!=='a1-2-w4-l4')assert.equal(JSON.stringify(l),prior.get(l.id));
 for(const l of lessons){assert.equal(app.SpaceWhaleContent.filter(x=>x.id===l.id).length,1);assert.equal(l.stages.filter(s=>s.section==='tasks').reduce((a,s)=>a+parseFloat(s.guide.time),l.reserveMinutes),30);assert.equal(l.stages.filter(s=>s.section==='self-study').length,2);}
});
test('every exercise mounts, objective keys grade correctly and unrelated answers fail',()=>{
 for(const l of lessons)for(const s of l.stages)walk(s.exercise,d=>{
 kit.validate(d);const v=setup(app.SpaceWhaleLessonView(d,'student'));
 const a={},bad={};if(d.kind==='choice')d.items.forEach(i=>{a[i.id]=i.correctId;bad[i.id]='wrong';});if(d.kind==='matching')d.items.forEach(i=>{a[i.id]=i.correctId;bad[i.id]='wrong';});
 if(Object.keys(a).length){assert.ok(Object.values(kit.grade(d,a)).every(g=>g==='correct'),d.id);assert.ok(Object.values(kit.grade(d,bad)).every(g=>g==='retry'),d.id);}
 assert.equal(v.host.querySelector('audio[src]'),null);v.handle.destroy();});
});
test('role-card information is absent from the opposite rendered view and unknown roles',()=>{
 for(const id of ['L4-M01','L4-M11']){const d=find(id),teacherText=d.blocks.find(b=>b.audience==='teacher').text,studentText=d.blocks.find(b=>b.audience==='student').text;
 for(const role of ['teacher','student','connecting']){const v=setup(app.SpaceWhaleLessonView(d,role));assert.equal(v.host.textContent.includes(teacherText),role==='teacher');assert.equal(v.host.textContent.includes(studentText),role==='student');v.handle.destroy();}}
});
test('teacher disclosure open/close synchronizes, learner cannot reopen it, reconnect restores it',()=>{
 const t=setup(find('L4-M11'),{onViewChange:()=>{}}),s=setup(find('L4-M11'),{navigationReadOnly:true});
 assert.equal(Boolean(s.host.querySelector('details').open),false);
 click(t,'summary');s.handle.setViewState(t.handle.getViewState(),false);assert.equal(s.host.querySelector('details').open,true);
 click(t,'summary');s.handle.setViewState(t.handle.getViewState(),false);assert.equal(s.host.querySelector('details').open,false);
 click(s,'summary');assert.equal(s.host.querySelector('details').open,false);
 click(t,'summary');const reconnected=setup(find('L4-M11'),{navigationReadOnly:true});reconnected.handle.setViewState(t.handle.getViewState(),false);assert.equal(reconnected.host.querySelector('details').open,true);
 for(const v of [t,s,reconnected])v.handle.destroy();
});
test('listening shows all four questions before audio and gates transcript until a complete attempt',()=>{
 const d=find('L4-M06'),v=setup(d),details=v.host.querySelector('details');
 assert.equal(v.host.querySelectorAll('.ek-writing-input').length,4);assert.equal(details.hidden,true);
 v.handle.setViewState({disclosures:[true]},false);assert.equal(Boolean(details.open),false);
 const answer={'1':'polite and helpful','2':'tall, short straight hair','3':'quiet and helpful','4':'long curly hair, green eyes',__sw_checked:true};
 v.handle.setAnswers({'L4-listening-details':answer});assert.equal(details.hidden,false);assert.equal(Boolean(details.open),false);
 details.querySelector('summary').dispatchEvent(new v.window.Event('click',{bubbles:true,cancelable:true}));assert.equal(details.open,true);
 v.handle.setAnswers({'L4-listening-details':{'1':'helpful'}});assert.equal(details.hidden,true);assert.equal(details.open,false);v.handle.destroy();
});
test('chat advances only by teacher arrow after review, collapse and reopening preserve replies',()=>{
 const d=find('L5-M08'),t=setup(d,{onViewChange:()=>{}});
 assert.equal(t.host.querySelectorAll('input').length,1);assert.equal(t.host.querySelector('.ek-stage-down').disabled,true);
 t.handle.setAnswers({'L5-chat-1':{'1':'It is a kind of furniture.',__sw_checked:true}});
 assert.equal(t.host.querySelectorAll('input').length,1);assert.equal(t.host.querySelector('.ek-stage-down').disabled,false);
 click(t,'.ek-stage-down');assert.equal(t.host.querySelectorAll('input').length,2);
 const state=t.handle.getAnswers(),view=t.handle.getViewState(),s=setup(d,{navigationReadOnly:true});s.handle.setAnswers(state);s.handle.setViewState(view,false);assert.equal(s.host.querySelectorAll('input').length,2);
 click(t,'.ek-stage-up');click(t,'.ek-stage-down');assert.equal(t.host.querySelector('input').value,'It is a kind of furniture.');
 t.handle.destroy();s.handle.destroy();
});
test('open production accepts alternatives for teacher review, with no visible full model before attempt',()=>{
 for(const id of ['L4-M10','L5-M07']){const d=find(id),v=setup(d);assert.equal(v.host.querySelector('details'),null);assert.equal(v.host.textContent.includes('What is he like?'),false);assert.equal(v.host.textContent.includes('It’s a kind of food.'),false);assert.ok(Object.values(kit.grade(d,Object.fromEntries(d.items.map(i=>[i.id,'an alternative answer'])))).every(g=>g==='review'));v.handle.destroy();}
 const v=setup(find('L4-M01'));assert.equal(v.host.querySelector('details').open,true);v.handle.destroy();
});
