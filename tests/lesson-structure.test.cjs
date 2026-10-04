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
  assert.equal(v.query('fieldset').length+v.query('.ek-gap').length,1,id);
  assert.equal(v.query('[aria-label="Show next exercise"]').length,1,id+' single active sequence');
  assert.equal(v.query('[aria-label="Show next exercise"]')[0].disabled,true);
  v.handle.setAnswers(answer(def));p.handle.setAnswers(v.handle.getAnswers());p.handle.setViewState(v.handle.getViewState());assert.deepEqual(p.handle.getAnswers(),v.handle.getAnswers());assert.equal(p.query('[aria-label="Show next exercise"]').length,0);v.handle.destroy();p.handle.destroy();
 }
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
