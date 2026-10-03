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
const find=id=>{let found;lessons.forEach(l=>l.stages.forEach(s=>walk(s.exercise,d=>{if(d.id===id)found=d;})));return found;};
function click(v,selector){v.host.querySelector(selector).dispatchEvent(new v.window.Event('click',{bubbles:true,cancelable:true}));}
test('revision is isolated to L4/L5, with 30-minute plan including reserve and separate homework',()=>{
 for(const l of app.SpaceWhaleContent)if(prior.has(l.id)&&l.id!=='a1-2-w4-l4')assert.equal(JSON.stringify(l),prior.get(l.id));
 for(const l of lessons){assert.equal(app.SpaceWhaleContent.filter(x=>x.id===l.id).length,1);assert.equal(l.stages.filter(s=>s.section==='tasks').reduce((a,s)=>a+parseFloat(s.guide.time),l.reserveMinutes),30);assert.equal(l.stages.filter(s=>s.section==='self-study').length,l.id==='a1-2-w4-l4'?0:2);}
});
test('every exercise mounts, objective keys grade correctly and unrelated answers fail',()=>{
 for(const l of lessons)for(const s of l.stages)walk(s.exercise,d=>{
 kit.validate(d);const v=setup(app.SpaceWhaleLessonView(d,'student'));
 const a={},bad={};if(d.kind==='choice')d.items.forEach(i=>{a[i.id]=d.multiple?i.correctIds:i.correctId;bad[i.id]=d.multiple?['wrong']:'wrong';});if(d.kind==='gaps')d.items.forEach(i=>i.segments.filter(s=>typeof s!=='string').forEach(s=>{a[s.id]=s.answers[0];bad[s.id]='wrong';}));if(d.kind==='matching')d.items.forEach(i=>{a[i.id]=i.correctId;bad[i.id]='wrong';});
 if(Object.keys(a).length){assert.ok(Object.values(kit.grade(d,a)).every(g=>g==='correct'),d.id);assert.ok(Object.values(kit.grade(d,bad)).every(g=>g==='retry'),d.id);}
 if(d.id==='L4-M03')assert.equal(v.host.querySelectorAll('audio[src]').length,12);else assert.equal(v.host.querySelector('audio[src]'),null);v.handle.destroy();});
});
test('approved opening and final Speaking use the shared layout in teacher and learner views',()=>{
 const titles={'L4-M01':'Describe your new neighbors','L4-M11':'Describe the new students','L5-M01':'Explain the unusual things','L5-M09':'Help your new colleague'};
 for(const [id,title] of Object.entries(titles)){
  const d=find(id);assert.equal(d.title,title);assert.equal(kit.isSpeaking(d),true);
  for(const role of ['teacher','student','connecting']){
   const v=setup(app.SpaceWhaleLessonView(d,role),{onSkip(){}});
   assert.equal(v.host.querySelector('button,details,input'),null);
   assert.equal(v.host.querySelector('.ek-speaking-use-title').textContent,'Use:');
   assert.equal(v.host.querySelectorAll('.ek-speaking-group').length,2);
   assert.ok(v.host.querySelector('img'));
   v.handle.destroy();
  }
 }
 const opening=find('L4-M01');assert.match(opening.image.image,/549d\.png$/);
 for(const id of ['L4-M01','L4-M11']){
  assert.deepEqual(Array.from(find(id).use[1].words),['long hair','short hair','brown hair','blonde hair']);
  assert.deepEqual(Array.from(find(id).use[1].phrases),['What does he/she look like?','He/She has ...']);
  assert.ok(fs.existsSync(require('node:path').join(__dirname,'..',find(id).image.image)));
 }
 assert.ok(fs.existsSync(require('node:path').join(__dirname,'..',opening.image.image)));
 assert.equal(opening.image.imageWidth,1448);assert.equal(opening.image.imageHeight,1086);
});
test('discovery reveals its rule only after checking and a teacher arrow, synchronized to learner',()=>{
 const d=find('L4-discovery-rule'),t=setup(d),s=setup(d,{navigationReadOnly:true});
 assert.equal(t.host.querySelectorAll('.ek-choice-trigger').length,2);
 assert.equal(t.host.textContent.includes('Как спросить о человеке'),false);
 assert.equal(t.host.querySelector('.ek-stage-down').disabled,true);
 t.handle.setAnswers({'L4-complete-rule':{'1':'как она выглядит','2':'какая она в общении',__sw_checked:true}});
 assert.equal(t.host.querySelector('.ek-stage-down').disabled,false);
 assert.equal(t.host.textContent.includes('Как спросить о человеке'),false);
 click(t,'.ek-stage-down');assert.ok(t.host.textContent.includes('Как спросить о человеке'));
 s.handle.setAnswers(t.handle.getAnswers());s.handle.setViewState(t.handle.getViewState(),false);
 assert.ok(s.host.textContent.includes('Как спросить о человеке'));
 t.handle.destroy();s.handle.destroy();
});
test('approved L4 order, exact repeat lines and typed picture strip replace obsolete drafts',()=>{
 const l4=lessons.find(l=>l.id==='a1-2-w4-l4');
 assert.deepEqual(Array.from(l4.stages,s=>s.exercise.id),['L4-M01','L4-M02','L4-M03','L4-word-practice','L4-discovery-rule','L4-neighbors-listening','L4-question-answer-match','L4-questions-for-answers','L4-M11']);
 assert.deepEqual(Array.from(find('L4-M03').items,i=>i.example),['My father is very polite.','This man is rude.','My children are very helpful.','I’m sometimes lazy on weekends.','My sister is usually quiet.','Our neighbors are noisy at night.']);
 const d=find('L4-typed-gap'),v=setup(d);
 assert.equal(d.inputMode,'text');assert.equal(v.host.querySelectorAll('.ek-picture-cue-card').length,4);
 assert.equal(v.host.querySelectorAll('.ek-typed-gap').length,4);assert.equal(v.host.querySelectorAll('img').length,4);
 assert.equal(v.host.querySelector('.ek-body').firstElementChild.classList.contains('ek-picture-cues'),true);
 assert.equal(v.host.textContent.includes('_____'),false);assert.equal(v.host.querySelectorAll('.ek-check').length,1);
 ['helpful','lazy','noisy','rude'].forEach((answer,i)=>{
  const input=v.host.querySelectorAll('.ek-typed-gap')[i];input.value=answer;input.dispatchEvent(new v.window.Event('input',{bubbles:true}));
 });
 click(v,'.ek-check');assert.ok(Object.values(kit.grade(d,v.handle.getAnswers())).every(g=>g==='correct'));
 v.handle.destroy();
});
test('L4 dropdowns and multiple selections check actual learner interactions',()=>{
 const d=find('L4-dropdown-gap'),v=setup(d);
 ['noisy','helpful','polite','rude','quiet'].forEach((answer,i)=>{
  const picker=v.host.querySelectorAll('.ek-inline-choice')[i];
  picker.querySelector('.ek-choice-trigger').dispatchEvent(new v.window.Event('click',{bubbles:true}));
  const option=[...picker.querySelectorAll('[data-option-value]')].find(el=>el.dataset.optionValue===answer);
  option.dispatchEvent(new v.window.Event('click',{bubbles:true}));
  assert.equal(picker.querySelector('.ek-inline-menu').hidden,true);
 });
 click(v,'.ek-check');assert.ok(Object.values(kit.grade(d,v.handle.getAnswers())).every(g=>g==='correct'));v.handle.destroy();
 const m=find('L4-listening-multiple'),c=setup(m);assert.equal(c.host.querySelectorAll('input[type="checkbox"]').length,8);
 [['1','2'],['1','2']].forEach((answers,i)=>{
  const group=c.host.querySelectorAll('fieldset')[i];answers.forEach(id=>{
   const input=[...group.querySelectorAll('input')].find(el=>el.value===id);input.checked=true;input.dispatchEvent(new c.window.Event('change',{bubbles:true}));
  });
 });
 click(c,'.ek-check');assert.deepEqual(kit.grade(m,c.handle.getAnswers()),{'emma':'correct','nick':'correct'});
 assert.equal(kit.grade(m,{'emma':['1'],'nick':['1','2','3']})['emma'],'retry');
 assert.equal(kit.grade(m,{'emma':['1'],'nick':['1','2','3']})['nick'],'retry');c.handle.destroy();
 const matching=find('L4-question-answer-match');
 assert.deepEqual(Array.from(matching.items,i=>matching.options.find(o=>o.id===i.correctId).text),['He’s a little lazy at home.','Her hair is short and curly.','He has long straight hair.','She’s helpful. She often helps me with my homework.']);
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
 for(const id of ['L5-M07']){const d=find(id),v=setup(d);assert.equal(v.host.querySelector('details'),null);assert.equal(v.host.textContent.includes('What is he like?'),false);assert.equal(v.host.textContent.includes('It’s a kind of food.'),false);assert.ok(Object.values(kit.grade(d,Object.fromEntries(d.items.map(i=>[i.id,'an alternative answer'])))).every(g=>g==='review'));v.handle.destroy();}
 const opening=find('L4-M01'),v=setup(opening);
 assert.equal(v.host.querySelector('details'),null);
 assert.ok(v.host.querySelector('.ek-speaking-image img'));
 assert.equal(v.host.querySelector('.ek-image-pending'),null);
 for(const text of ['Use:','What is he/she like?','What does he/she look like?','helpful','noisy','polite','lazy','quiet','rude'])assert.ok(v.host.textContent.includes(text));
 assert.equal(kit.isSpeaking(opening),true);
 assert.equal(v.host.querySelectorAll('button').length,0);
 v.handle.destroy();
});

test('L5 scripts and choices remain based on the approved v7 source',()=>{
 const source=fs.readFileSync(require.resolve('../lesson-sources/a12-m4-l4-l5-v7-final.md'),'utf8').split('# A1.2 M4 L5 · Категории')[1];
 const norm=s=>s.replace(/\*\*/g,'').replace(/\s+/g,' ').trim();
 const pairs=source.split('## Exact script')[1].split('## Teacher note')[0].trim().split(/\n\s*\n/);
 const items=find('L5-M03').items;assert.equal(items.length,pairs.length);
 items.forEach((item,i)=>assert.equal(norm(item.text+' '+item.example),norm(pairs[i])));
 const section=source.split('## 3.3A. E01')[1].split('## Answer key')[0];
 const expected=[...section.matchAll(/^[ABC]\. (.+)$/gm)].map(m=>norm(m[1]));
 assert.deepEqual(Array.from(find('L5-form-choice').items).flatMap(i=>Array.from(i.options,o=>norm(o.text))),expected);
 assert.equal(Array.from(find('L5-form-choice').items,i=>i.correctId).join(','),'1,2,0,1');
});
test('word practice reveals typed fields only after dropdown OK and a teacher arrow',()=>{
 const t=setup(find('L4-word-practice'));
 assert.equal(t.host.querySelectorAll('.ek-typed-gap').length,0);
 assert.equal(t.host.querySelector('.ek-stage-down').disabled,true);
 t.handle.setAnswers({'L4-dropdown-gap':{'1':'noisy','2':'helpful','3':'polite','4':'rude','5':'quiet',__sw_checked:true}});
 assert.equal(t.host.querySelectorAll('.ek-typed-gap').length,0);
 click(t,'.ek-stage-down');assert.equal(t.host.querySelectorAll('.ek-typed-gap').length,4);
 assert.equal(t.host.querySelectorAll('.ek-choice-trigger').length,5);t.handle.destroy();
});
test('one Listening keeps its player through Emma, Nick, purpose and true/false; Script syncs closed/open',()=>{
 const d=find('L4-neighbors-listening'),t=setup(d),p=setup(d,{navigationReadOnly:true});
 const audio=t.host.querySelector('audio');
 const visibleText=()=>[...t.host.querySelectorAll('legend')].map(x=>x.textContent).join(' ');
 const choose=(host,values)=>{for(const input of host.querySelectorAll('input[type="checkbox"]'))if(values.includes(input.value)){input.checked=true;input.dispatchEvent(new t.window.Event('change',{bubbles:true}));}};
 assert.match(visibleText(),/Emma/);assert.doesNotMatch(visibleText(),/Nick|Ben/);
 assert.equal(t.host.querySelectorAll('audio').length,1);assert.equal(t.host.querySelector('details'),null);
 choose(t.host,['1','2']);click(t,'.ek-check');
 assert.doesNotMatch(visibleText(),/Nick/);
 const innerDown=t.host.querySelector('.ek-stage-section .ek-stage-down');assert.equal(innerDown.disabled,false);
 innerDown.dispatchEvent(new t.window.Event('click',{bubbles:true}));assert.match(visibleText(),/Nick/);
 const nick=t.host.querySelectorAll('fieldset')[1];choose(nick,['1','2']);
 nick.closest('.exercise-kit').querySelector('.ek-check').dispatchEvent(new t.window.Event('click',{bubbles:true}));
 const outerNav=()=>t.host.querySelector('.ek-body').lastElementChild;
 assert.equal(outerNav().querySelector('.ek-stage-down').disabled,false);
 outerNav().querySelector('.ek-stage-down').dispatchEvent(new t.window.Event('click',{bubbles:true}));
 assert.match(visibleText(),/What does Ben want to do/);assert.equal(t.host.querySelector('audio'),audio);
 const purpose=[...t.host.querySelectorAll('input[type="radio"]')].find(input=>input.value==='1');
 purpose.checked=true;purpose.dispatchEvent(new t.window.Event('change',{bubbles:true}));
 purpose.closest('.exercise-kit').querySelector('.ek-check').dispatchEvent(new t.window.Event('click',{bubbles:true}));
 outerNav().querySelector('.ek-stage-down').dispatchEvent(new t.window.Event('click',{bubbles:true}));
 assert.equal(t.host.querySelectorAll('.ek-choice-trigger').length,4);assert.equal(t.host.querySelector('audio'),audio);
 const script=t.host.querySelector('details');assert.equal(script.querySelector('summary').textContent,'Script');assert.equal(Boolean(script.open),false);
 script.querySelector('summary').dispatchEvent(new t.window.Event('click',{bubbles:true}));
 p.handle.setAnswers(t.handle.getAnswers());p.handle.setViewState(t.handle.getViewState(),false);
 assert.equal(p.host.querySelector('details').open,true);assert.match(script.textContent,/Nick and Emma/);
 assert.equal(t.host.querySelectorAll('audio').length,1);
 assert.deepEqual(kit.grade(find('L4-listening-true-false'),{'1':'True','2':'False','3':'True','4':'True'}),{'1':'correct','2':'correct','3':'correct','4':'correct'});
 t.handle.destroy();p.handle.destroy();
});
test('revised question writing grades keys and shows muted prompt with one bold correction only after OK',()=>{
 const d=find('L4-questions-for-answers'),v=setup(d);
 assert.equal(d.responseMode,'accepted');
 assert.deepEqual(Array.from(d.items,i=>i.prompt),['Jake is very rude and lazy. He never helps his mom.','Nora has brown eyes and short hair.','She is tall and slim. She has long curly hair.','My parents are very kind and smart.']);
 assert.equal(v.host.querySelectorAll('.ek-writing-input').length,4);assert.equal(v.host.textContent.includes('What is Jake like?'),false);
 assert.deepEqual(kit.grade(d,{'1':'What is Jake like?','2':'What does she look like?','3':'What does she look like?','4':'What are they like?'}),{'1':'correct','2':'correct','3':'correct','4':'correct'});
 v.handle.setAnswers({'1':'What does Jake look like?','2':'wrong','3':'wrong','4':'wrong',__sw_checked:true});
 assert.equal(v.host.querySelector('.ek-answer-pairs .ek-muted').textContent,d.items[0].prompt);
 assert.deepEqual([...v.host.querySelectorAll('.ek-answer-pairs strong')].map(x=>x.textContent),['What is Jake like?','What does she look like?','What does she look like?','What are they like?']);
 assert.equal(v.host.textContent.includes('Possible answers'),false);v.handle.destroy();
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
