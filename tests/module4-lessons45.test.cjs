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
test('approved opening and final Speaking use the shared layout in teacher and learner views',()=>{
 const titles={'L4-M01':'Describe your new neighbors','L4-M11':'Describe the new students','L5-M01':'Explain the unusual things','L5-M09':'Help your new colleague'};
 for(const [id,title] of Object.entries(titles)){
  const d=find(id);assert.equal(d.title,title);assert.equal(kit.isSpeaking(d),true);
  for(const role of ['teacher','student','connecting']){
   const v=setup(app.SpaceWhaleLessonView(d,role),{onSkip(){}});
   assert.equal(v.host.querySelector('button,details,input'),null);
   assert.equal(v.host.querySelector('.ek-speaking-use-title').textContent,'Use:');
   assert.equal(v.host.querySelectorAll('.ek-speaking-group').length,id.startsWith('L4')?2:1);
   if(id!=='L4-M01')assert.equal(v.host.querySelector('img'),null);
   v.handle.destroy();
  }
 }
 const opening=find('L4-M01');assert.match(opening.image.image,/1973\.png$/);
 assert.ok(fs.existsSync(require('node:path').join(__dirname,'..',opening.image.image)));
 assert.equal(opening.image.imageWidth,1448);assert.equal(opening.image.imageHeight,1086);
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
 const opening=find('L4-M01'),v=setup(opening);
 assert.equal(v.host.querySelector('details'),null);
 assert.ok(v.host.querySelector('.ek-speaking-image img'));
 assert.equal(v.host.querySelector('.ek-image-pending'),null);
 for(const text of ['Use:','What is he/she like?','What does he/she look like?','helpful','noisy','polite','lazy','quiet','rude'])assert.ok(v.host.textContent.includes(text));
 assert.equal(kit.isSpeaking(opening),true);
 assert.equal(v.host.querySelectorAll('button').length,0);
 v.handle.destroy();
});

test('v7 final scripts and objective choice items match the approved source',()=>{
 const source=fs.readFileSync(require.resolve('../lesson-sources/a12-m4-l4-l5-v7-final.md'),'utf8');
 const parts=source.split('# A1.2 M4 L5 · Категории');
 const norm=s=>s.replace(/\*\*/g,'').replace(/\s+/g,' ').trim();
 for(const [index,n] of [4,5].entries()){
  const pairs=parts[index].split('## Exact script')[1].split('## Teacher note')[0].trim().split(/\n\s*\n/);
  const items=find(`L${n}-M03`).items;
  assert.equal(items.length,pairs.length);
  items.forEach((item,i)=>assert.equal(norm(item.text+' '+item.example),norm(pairs[i])));
 }
 const exactDialogue=parts[0].split('## Exact listening script')[1].split('## Answer key / possible answers')[0];
 assert.equal(norm(find('L4-M06').transcript),norm(exactDialogue));
 const choiceSections=[
  ['L4-M04',parts[0].split('## 2.3. E01')[1].split('## Answer key')[0]],
  ['L4-M08',parts[0].split('## 3.3A. E01')[1].split('## Answer key')[0]],
  ['L5-form-choice',parts[1].split('## 3.3A. E01')[1].split('## Answer key')[0]]
 ];
 for(const [id,section] of choiceSections){
  const expected=[...section.matchAll(/^[ABC]\. (.+)$/gm)].map(m=>norm(m[1]));
  assert.deepEqual(Array.from(find(id).items).flatMap(i=>Array.from(i.options,o=>norm(o.text))),expected,id);
 }
 assert.equal(Array.from(find('L4-M04').items,i=>i.correctId).join(','),'1,0,0,1,1,0');
 assert.equal(Array.from(find('L5-form-choice').items,i=>i.correctId).join(','),'1,2,0,1');
});
test('v7 image category exercise hides author briefs and Writing cues remain unchanged',()=>{
 const d=find('L5-M04'),v=setup(d);
 assert.equal(v.host.querySelectorAll('.ek-image-pending').length,6);
 assert.equal(d.layout,'picture-word');
 assert.deepEqual(Array.from(d.items,i=>i.text),['A','B','C','D','E','F']);
 for(const text of ['muffin','supermarket','касса','предметы мебели','магазин одежды'])assert.equal(v.host.textContent.includes(text),false);
 assert.match(app.SpaceWhaleLessonMedia['a1-2-w4-l5']['L5-I06'].brief,/касса/);
 v.handle.destroy();
 const prompts=find('L5-M07').items;
 assert.equal(prompts[2].prompt,'What is a sofa?');assert.equal(prompts[2].hint,'furniture · kind');
 assert.equal(prompts[3].hint,'clothing · type');
});
