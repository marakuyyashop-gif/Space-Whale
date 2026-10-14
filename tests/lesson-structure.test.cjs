const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{parseHTML}=require('linkedom');
const kit=require('../exercise-kit.js'),structure=require('../lesson-structure.js'),{plans}=require('../lesson-structure-content.js');
const app={SpaceWhaleExerciseKit:kit,SpaceWhaleHomeworkA21:require('../homework-a21.js')};
for(const f of ['course-content.js','course-content-module4-34.js','course-content-module4-45.js','course-content-smy-a21.js','course-content-directions-a21.js','course-content-b1-misha.js'])vm.runInNewContext(fs.readFileSync(require.resolve('../'+f),'utf8'),{window:app});
const catalog=require('../workspace-catalog.js').createCatalog(app.SpaceWhaleContent,[]),lessons=catalog.lessons.filter(l=>plans[l.id]);
const visible=e=>{for(let p=e;p;p=p.parentElement)if(p.hidden)return false;return true;};
function setup(def,options={}){const {document,window}=parseHTML('<html><body><main></main></body></html>');const create=document.createElement.bind(document);document.createElement=t=>{const e=create(t);if(t==='audio'){e.pause=()=>{};e.play=async()=>{};e.paused=true;}return e;};const host=document.querySelector('main');const handle=kit.mount(host,def,{syncChecks:true,...options});const query=q=>[...host.querySelectorAll(q)].filter(visible);const click=e=>{assert.ok(e);assert.ok(!e.disabled);e.dispatchEvent(new window.Event('click',{bubbles:true,cancelable:true}));};return {host,handle,query,click,window};}
const byRole=(id,role)=>lessons.find(l=>l.id===id).stages.find(s=>s.role===role);
function answer(d){let a={};if(d.kind==='stage'){for(const b of d.exercises)a[b.id]=answer(b.exercise);a.revealed=d.exercises.length;return a;}if(d.kind==='gaps')for(const i of d.items)for(const g of i.segments)if(typeof g!=='string')a[g.id]=g.answers?.[0]||'response';if(['choice','matching','sort'].includes(d.kind))for(const i of d.items)a[i.id]=i.correctIds||i.correctId;if(d.kind==='writing')for(const i of d.items)a[i.id]=i.acceptedAnswers?.[0]||'My answer';if(d.kind==='order')a.order=d.correctOrder;if(d.items)a.__sw_checked=true;if(d.progressiveQuestions)a.__sw_choice_revealed=d.items.length;if(d.followUp)a.__sw_followup_revealed=2;return a;}
test('four lessons use one explicit section builder, omit empty sections and keep originals unchanged',()=>{
 assert.equal(lessons.length,4);
 for(const l of lessons){const actual=l.stages.filter(s=>s.section==='tasks');assert.deepEqual(actual.map(s=>s.role),plans[l.id].map(s=>s[0]));assert.ok(actual.filter(s=>s.exercise.kind==='stage').every(s=>s.exercise.unifiedProgression));actual.forEach(s=>kit.validate(s.exercise));const words=actual.find(s=>s.role==='words');assert.equal(words.exercise.exercises.at(-1).exercise.layout,'listen-repeat');}
 assert.ok(!app.SpaceWhaleContent.find(l=>l.id==='a1-2-w4-l4').structure);
});
test('old exercise links resolve into the corresponding section, and old responses seed new groups once',()=>{
 for(const l of lessons)for(const s of l.stages)for(const old of s.legacySources||[]){const route=catalog.normalize(new URLSearchParams({view:'library',level:l.level,whale:l.whale,lesson:l.id,exercise:old.id}));assert.equal(route.exercise,s.exercise.id);const restored=structure.restore(s,{},source=>source.id===old.id?{one:'saved',__sw_checked:true}:{});assert.equal(restored[old.id].one,'saved');const current={one:'new'};assert.equal(structure.restore(s,current,()=>{throw Error('must not overwrite');}),current);}
 const original=app.SpaceWhaleContent.find(l=>l.id==='a1-2-w4-l4').stages.find(s=>s.exercise.id==='L4-discovery-rule').exercise;const changed=JSON.parse(JSON.stringify(original));changed.unifiedProgression=true;assert.ok(structure.compatible(JSON.stringify(original),JSON.stringify(changed)));
});
test('Discovery starts with one question; no outer arrow bypasses it; flat keys and peer view restore',()=>{
 for(const id of Object.keys(plans)){
  const def=byRole(id,'focus').exercise,v=setup(def),p=setup(def,{navigationReadOnly:true});
  if(id==='a2-1-w1-smy-3'){
   const pictures=def.exercises[0];assert.equal(pictures.exercise.layout,'picture-word');
   assert.equal(v.query('fieldset').length,0);assert.equal(v.query('[aria-label="Show next exercise"]')[0].disabled,true);
   v.handle.setAnswers({[pictures.id]:answer(pictures.exercise)});v.click(v.query('[aria-label="Show next exercise"]')[0]);
  }
  assert.equal(v.query('fieldset').length+v.query('.ek-gap').length,1,id);
  assert.equal(v.query('[aria-label="Show next exercise"]').length,1,id+' single active sequence');
  assert.equal(v.query('[aria-label="Show next exercise"]')[0].disabled,true);
  v.handle.setAnswers(answer(def));p.handle.setAnswers(v.handle.getAnswers());p.handle.setViewState(v.handle.getViewState());assert.deepEqual(p.handle.getAnswers(),v.handle.getAnswers());assert.equal(p.query('[aria-label="Show next exercise"]').length,0);v.handle.destroy();p.handle.destroy();
 }
});
test('A2 Words moves directly from phrase matching to Listen & Repeat',()=>{
 const def=byRole('a2-1-w1-smy-3','words').exercise,v=setup(def);
 const phrases=def.exercises[0];assert.equal(phrases.exercise.exercises.length,1);
 v.handle.setAnswers({[phrases.id]:answer(phrases.exercise)});v.click(v.query('[aria-label="Show next exercise"]')[0]);
 assert.ok(v.host.textContent.includes('Listen and repeat.'));assert.ok(v.host.textContent.includes('Match the phrases with their meanings.'));
 assert.ok(!v.host.textContent.includes('One more way to say it.'));assert.ok(!v.host.textContent.includes('Look at the directions.'));v.handle.destroy();
});
test('Reading retains its source while questions open individually; checking never advances automatically',()=>{
 const d=byRole('b1-1-w1-misha-2','reading').exercise,v=setup(d);assert.equal(v.query('fieldset').length,1);const source=v.host.querySelector('.ek-stage-section');
 const input=v.query('input')[1];input.checked=true;input.dispatchEvent(new v.window.Event('change',{bubbles:true}));v.click(v.query('.ek-check')[0]);assert.equal(v.query('fieldset').length,1);v.click(v.query('[aria-label="Show next exercise"]')[0]);assert.equal(v.query('fieldset').length,2);assert.equal(source,v.host.querySelector('.ek-stage-section'));assert.ok(v.host.textContent.includes('Jamie'));v.handle.destroy();
});
test('Practice and Words can finish their last child and all local media still exist',()=>{
 for(const l of lessons)for(const s of l.stages.filter(s=>s.role)){
  const v=setup(s.exercise);v.handle.setAnswers(answer(s.exercise));for(const image of v.host.querySelectorAll('img[src]'))assert.ok(fs.existsSync(require('path').resolve(__dirname,'..',image.getAttribute('src'))));
  for(const arrow of v.query('[aria-label="Show next exercise"]'))assert.equal(arrow.disabled,false,s.exercise.id);v.handle.destroy();
 }
});
test('B1 correction keys accept full/contraction forms and reject the actual grammatical errors',()=>{
 const d=app.SpaceWhaleContent.find(l=>l.id==='b1-1-w1-misha-2').stages.find(s=>s.exercise.id==='B1D2-M09').exercise;assert.equal(d.items.length,6);for(const i of d.items){for(const a of i.acceptedAnswers)assert.equal(kit.grade(d,{[i.id]:a})[i.id],'correct');assert.equal(kit.grade(d,{[i.id]:i.prompt})[i.id],'retry');}
});
test('saved live responses migrate read-only and never replace an existing grouped response',async()=>{
 const stage=byRole('a1-2-w4-l4','words'),calls=[],old={'L4-M02':{'L4-word-translation':{'1':'polite',__sw_checked:true}},'L4-M03':{repeat:3}};
 const restored=await structure.loadResponse(stage,async id=>{calls.push(id);return old[id]?{response:old[id]}:null;});
 assert.equal(restored.response['L4-M02']['L4-word-translation']['1'],'polite');assert.equal(restored.response['L4-M03'].repeat,3);assert.equal(calls.length,3);
 const existing={response:{revealed:2}};const record=await structure.loadResponse(stage,async id=>{assert.equal(id,stage.exercise.id);return existing;});assert.equal(record,existing);
});
test('progressive dropdowns check and reveal each row individually with flat saved gap IDs',()=>{
 const source=app.SpaceWhaleContent.find(l=>l.id==='a1-2-w4-l5').stages.find(s=>s.exercise.id==='L5-M06').exercise.exercises[1].exercise;
 const pupil=setup(source,{navigationReadOnly:true});const teacher=setup(source,{onChange:a=>pupil.handle.setAnswers(a),onViewChange:v=>pupil.handle.setViewState(v,false)});
 for(let i=0;i<source.items.length;i++){
  assert.equal(teacher.query('.ek-choice-trigger').length,i+1);const gap=source.items[i].segments.find(s=>typeof s!=='string');teacher.handle.setAnswers({...teacher.handle.getAnswers(),[gap.id]:gap.answers[0]});
  teacher.click(teacher.query('.ek-check')[i]);assert.equal(teacher.query('.ek-choice-trigger').length,i+1,'OK does not reveal next question');
  if(i<source.items.length-1)teacher.click(teacher.query('[aria-label="Show next exercise"]')[0]);
 }
 const state=teacher.handle.getAnswers();assert.equal(state.category,'к какой категории относится предмет');assert.equal(state.article,'a');assert.equal(state.__sw_checked,true);assert.equal(kit.taskFinished(source,state),true);assert.deepEqual(state,pupil.handle.getAnswers());teacher.handle.destroy();pupil.handle.destroy();
});
test('four navigation blocks apply to empty and arbitrary future lessons without creating tasks',()=>{
 for(const input of [{id:'future-empty',title:'A future lesson',stages:[]},{id:'another-future',title:'A future lesson'}]){
  const before=JSON.stringify(input),actual=structure.withBlocks(input);
  assert.deepEqual(actual.blocks.map(({id,number,title})=>({id,number,title})),[
   {id:'opening',number:1,title:'Speaking'},{id:'words',number:2,title:'Discovery Words'},
   {id:'language',number:3,title:'Lexis / Grammar'},{id:'final',number:4,title:'Speaking'}]);
  assert.ok(actual.blocks.every(b=>b.stageIds.length===0));assert.equal(actual.blocks[3].compareWith,'opening');
  assert.equal(actual.stages,input.stages);assert.equal(JSON.stringify(input),before);
 }
 for(const input of [{id:'review-future',title:'Travel · Review',stages:[]},{id:'repeat-future',title:'Разговор · Повторение',stages:[]},{id:'review-by-flag',title:'Travel',review:true,stages:[]}]){
  const words=structure.withBlocks(input).blocks[1];assert.match(words.description,/уже изученные/);assert.doesNotMatch(words.description,/нов(?:ые|ый|ого)/i);
 }
});
test('authored navigation purpose wins over roles and headings, with P01 separate from P02',()=>{
 const input={id:'future-pronunciation',stages:[
  {role:'opening',exercise:{id:'start',kind:'presentation',title:'Start'}},
  {role:'words',exercise:{id:'p01',kind:'audio',title:'Listen & Repeat',items:[{id:'one',text:'route'}]}},
  {role:'practice',exercise:{id:'p02',kind:'audio',title:'Listen & Repeat',items:[{id:'one',text:'We can take another route.'}]}},
  {navigationBlock:'words',role:'final',menu:'Final Speaking',exercise:{id:'authored-words',kind:'presentation',title:'Speaking'}},
  {role:'wordPractice',exercise:{id:'word-practice',kind:'gaps',title:'Practice'}},
  {role:'final',exercise:{id:'finish',kind:'presentation',title:'Finish'}},
  {section:'self-study',navigationBlock:'not-a-classroom-block',exercise:{id:'homework',kind:'writing',title:'Homework'}}
 ]};
 const blocks=structure.withBlocks(input).blocks;
 assert.deepEqual(blocks[0].stageIds,['start']);assert.deepEqual(blocks[1].stageIds,['p01','authored-words','word-practice']);
 assert.deepEqual(blocks[2].stageIds,['p02']);assert.deepEqual(blocks[3].stageIds,['finish']);
 for(const navigationBlock of ['practice','unknown',null,undefined])assert.throws(()=>structure.withBlocks({id:'bad',stages:[{navigationBlock,exercise:{id:'bad-task'}}]}),/Invalid navigation block/);
});
test('navigation metadata preserves stage order, exercise signatures, aliases and responses',()=>{
 const input={id:'future-existing',stages:[
  {role:'words',exercise:{id:'words-first',kind:'matching',items:[{id:'answer',correctId:'word'}]},exerciseAliases:['old-word-id']},
  {role:'focus',exercise:{id:'language-first',kind:'rule-page',blocks:[{type:'text',text:'Examples'}]}},
  {role:'words',exercise:{id:'words-later',kind:'audio',items:[{id:'repeat',text:'word'}]}},
  {role:'final',exercise:{id:'final-task',kind:'writing',items:[{id:'answer',prompt:'Answer'}]}}
 ]};
 const before=JSON.stringify(input),actual=structure.withBlocks(input);
 assert.equal(actual.stages,input.stages);assert.equal(JSON.stringify(input),before);
 actual.stages.forEach((stage,i)=>assert.equal(stage,input.stages[i]));
 assert.deepEqual(actual.blocks[1].stageIds,['words-first','words-later']);
 const assigned=actual.blocks.flatMap(b=>b.stageIds);assert.equal(assigned.length,input.stages.length);assert.equal(new Set(assigned).size,assigned.length);
 assert.deepEqual([...assigned].sort(),input.stages.map(s=>s.exercise.id).sort());
 assert.deepEqual(structure.withBlocks(actual).blocks,actual.blocks);
 const saved={answer:'saved',__sw_checked:true};assert.equal(structure.restore(actual.stages[0],saved,()=>{throw Error('unexpected response read');}),saved);
 const homework={id:'homework-only',stages:[{section:'self-study',exercise:{id:'homework-only-task'}}]};assert.equal(structure.withBlocks(homework),homework);
 assert.throws(()=>structure.withBlocks({id:'duplicate',stages:[{exercise:{id:'same'}},{exercise:{id:'same'}}]}),/duplicate navigation stage ID/);
});
test('legacy heading fallback uses explicit purpose and leaves ordinary tasks in language',()=>{
 const input={id:'future-headings',stages:[
  {menu:'Opening Speaking',exercise:{id:'opening-heading',kind:'presentation'}},
  {menu:'New Words',exercise:{id:'words-heading',kind:'choice'}},
  {menu:'Listen & Repeat',exercise:{id:'ambiguous-repeat',kind:'audio'}},
  {menu:'Extra task',exercise:{id:'unlabelled-speaking',kind:'speaking'}},
  {menu:'Final Speaking',exercise:{id:'final-heading',kind:'presentation'}}
 ]};
 const blocks=structure.withBlocks(input).blocks;
 assert.deepEqual(blocks[0].stageIds,['opening-heading']);assert.deepEqual(blocks[1].stageIds,['words-heading']);
 assert.deepEqual(blocks[2].stageIds,['ambiguous-repeat','unlabelled-speaking']);assert.deepEqual(blocks[3].stageIds,['final-heading']);
 const recall=structure.withBlocks({id:'future-recall',stages:[{menu:'1. Вспоминаем числа',exercise:{id:'number-recall',kind:'presentation'}}]});
 assert.deepEqual(recall.blocks[0].stageIds,[]);assert.deepEqual(recall.blocks[2].stageIds,['number-recall']);
});
test('reviewed A1 legacy roles keep phrase learning out of Words and preserve missing openings',()=>{
 const legacyApp={SpaceWhaleExerciseKit:kit};vm.runInNewContext(fs.readFileSync(require.resolve('../whale1-content.js'),'utf8'),{window:legacyApp});
 const original=legacyApp.SpaceWhaleContent,before=JSON.stringify(original),prepared=require('../lesson-structure-content.js').apply(original);
 const legacy=prepared.map(structure.withBlocks),get=id=>legacy.find(l=>l.id==='a1-1-w1-l'+id);
 assert.equal(JSON.stringify(original),before);
 for(let i=0;i<original.length;i++){
  assert.deepEqual(legacy[i].stages.map(s=>s.exercise.id),original[i].stages.map(s=>s.exercise.id));
  legacy[i].stages.forEach((stage,j)=>assert.equal(stage.exercise,original[i].stages[j].exercise));
  const ids=legacy[i].blocks.flatMap(b=>b.stageIds);assert.equal(ids.length,legacy[i].stages.length);assert.equal(new Set(ids).size,ids.length);
 }
 assert.deepEqual(get(1).blocks[1].stageIds,[]);assert.deepEqual(get(2).blocks[1].stageIds,[]);
 assert.ok(get(1).blocks[2].stageIds.includes('a1-1-w1-l1-e03-repeat'));
 assert.deepEqual(get(4).blocks[0].stageIds,[]);assert.deepEqual(get(5).blocks[0].stageIds,[]);
 assert.ok(get(6).blocks[1].stageIds.includes('a1-1-w1-l6-e03'));assert.ok(get(6).blocks[2].stageIds.includes('a1-1-w1-l6-e05-repeat'));
 assert.deepEqual(get(7).blocks[1].stageIds,[]);assert.deepEqual(get(7).blocks[3].stageIds,['a1-1-w1-l7-e06-text']);assert.ok(get(7).blocks[2].stageIds.includes('a1-1-w1-l7-e07'));
});
test('legacy A1.2 navigation retains word pronunciation, language practice and homework boundaries',()=>{
 const originals=app.SpaceWhaleContent.filter(l=>['a1-2-w4-l1','a1-2-w4-l2','a1-2-w4-l3'].includes(l.id));
 const prepared=require('../lesson-structure-content.js').apply(originals).map(structure.withBlocks);
 for(let i=0;i<originals.length;i++){
  const lesson=prepared[i],classroom=lesson.stages.filter(s=>s.section!=='self-study'),ids=lesson.blocks.flatMap(b=>b.stageIds);
  assert.deepEqual(lesson.stages.map(s=>s.exercise.id),originals[i].stages.map(s=>s.exercise.id));
  lesson.stages.forEach((s,j)=>assert.equal(s.exercise,originals[i].stages[j].exercise));
  assert.deepEqual([...ids].sort(),Array.from(classroom,s=>s.exercise.id).sort());
 }
 const second=prepared.find(l=>l.id==='a1-2-w4-l2');assert.ok(second.blocks[1].stageIds.includes('a12w4l2-pronunciation'));
 assert.ok(second.blocks[2].stageIds.includes('a12w4l2-discovery'));assert.ok(second.blocks[2].stageIds.includes('a12w4l2-writing'));
 assert.ok(second.stages.some(s=>s.section==='self-study'));assert.ok(!second.blocks.flatMap(b=>b.stageIds).some(id=>/homework/.test(id)));
 const authored={id:'a1-1-w1-l1',stages:[{role:'words',exercise:{id:'a1-1-w1-l1-e02'}}]};
 assert.equal(require('../lesson-structure-content.js').apply([authored])[0].stages[0].role,'words');
});
test('other legacy metadata distinguishes Test Task, word chunks and draft endings',()=>{
 const current={SpaceWhaleExerciseKit:kit};
 for(const file of ['course-content-smy-a21.js','course-content-b1-misha.js','lesson-draft-first-day-school.js','lesson-draft-school-fair.js'])vm.runInNewContext(fs.readFileSync(require.resolve('../'+file),'utf8'),{window:current});
 const before=JSON.stringify(current.SpaceWhaleContent),prepared=require('../lesson-structure-content.js').apply(current.SpaceWhaleContent).map(structure.withBlocks);
 assert.equal(JSON.stringify(current.SpaceWhaleContent),before);
 const get=id=>prepared.find(lesson=>lesson.id===id);
 assert.deepEqual(get('a2-1-w1-smy-2').blocks[0].stageIds,['A2_MOVE_M01']);
 assert.ok(get('b1-1-w1-misha-1').blocks[1].stageIds.includes('B1D1-M03'));
 for(const [id,final] of [['first-day-school','first-day-speaking'],['school-fair','fair-speaking']]){
  const lesson=get(id);assert.deepEqual(lesson.blocks[0].stageIds,[]);assert.deepEqual(lesson.blocks[3].stageIds,[final]);
  const original=current.SpaceWhaleContent.find(l=>l.id===id);assert.deepEqual(lesson.stages.map(s=>s.exercise.id),original.stages.map(s=>s.exercise.id));
 }
 assert.ok(get('school-fair').blocks[1].stageIds.includes('fair-listen-words'));
 assert.ok(get('school-fair').blocks[2].stageIds.includes('fair-final-match'));
});
