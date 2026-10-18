const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{createHash}=require('node:crypto');
const {parseHTML}=require('linkedom'),kit=require('../exercise-kit.js'),{createCatalog}=require('../workspace-catalog.js');
const root=path.resolve(__dirname,'..'),read=file=>fs.readFileSync(path.join(root,file),'utf8'),plain=value=>JSON.parse(JSON.stringify(value));
const additions=['course-content-b11-m2-discovery-rules.js','course-content-b11-m2-grammar-practice.js'];
function fixture(){
 const app={SpaceWhaleExerciseKit:kit},context=vm.createContext({window:app});
 for(const file of ['course-content-b11-m2.js','course-content-b11-m2-word-practice.js'])vm.runInContext(read(file),context);
 // A second author's existing later block must survive both extension reloads.
 for(const lesson of app.SpaceWhaleContent){const exercise={version:1,id:lesson.id+'-existing-listening',kind:'presentation',title:'Existing listening',blocks:[{type:'text',text:'Existing authored source'}]};lesson.stages.push({section:'tasks',role:'listening',exercise});lesson.structure.push({role:'listening',sources:[exercise.id]});}
 const before=plain(app.SpaceWhaleContent),apply=()=>additions.forEach(file=>vm.runInContext(read(file),context));
 apply();return {app,before,apply};
}
function definitions(def){return [def,...(def.exercises||[]).flatMap(b=>definitions(b.exercise)),...(def.blocks||[]).filter(b=>b.type==='exercise').flatMap(b=>definitions(b.exercise))];}
const newStages=lesson=>lesson.stages.filter(s=>['focus','practice'].includes(s.role));
function mount(def){const {document,window}=parseHTML('<html><body><main></main></body></html>'),host=document.querySelector('main');return {host,window,handle:kit.mount(host,def,{syncChecks:true})};}
const visible=e=>{for(let p=e;p;p=p.parentElement)if(p.hidden)return false;return true;};
function keyedAnswers(def){
 if(def.kind==='stage')return Object.fromEntries(def.exercises.map(b=>[b.id,keyedAnswers(b.exercise)]));
 if(def.kind==='rule-page')return Object.fromEntries(def.blocks.filter(b=>b.type==='exercise').map(b=>[b.id,keyedAnswers(b.exercise)]));
 if(def.kind==='gaps')return Object.fromEntries(def.items.flatMap(i=>i.segments.filter(s=>typeof s==='object').map(g=>[g.id,g.answers[0]])));
 if(['matching','choice'].includes(def.kind))return Object.fromEntries(def.items.map(i=>[i.id,i.correctId]));
 return {};
}

test('four lessons add only approved focus/practice blocks and retain other authors’ content on reload',()=>{
 const {app,before,apply}=fixture(),expectedCodes=[['E03','E04','E11'],['E03','E11','Q01'],['E01','E03','E11','Q01'],['E03','E11','Q01']];
 for(const [i,lesson] of app.SpaceWhaleContent.entries()){
  assert.deepEqual(plain(lesson.stages.filter(s=>!['focus','practice'].includes(s.role))),before[i].stages);
  for(const key of ['words','teacherInfo','title','id','level','whale'])assert.deepEqual(plain(lesson[key]),before[i][key]);
  assert.equal(lesson.stages.filter(s=>s.role==='focus').length,2);
  assert.deepEqual(Array.from(lesson.stages.filter(s=>s.role==='practice'),s=>s.exercise.templateCode),expectedCodes[i]);
  const roles=lesson.structure.map(s=>s.role);assert.ok(roles.indexOf('wordPractice')<roles.indexOf('focus'));assert.ok(roles.indexOf('focus')<roles.indexOf('practice'));assert.ok(roles.indexOf('practice')<roles.indexOf('listening'));
 }
 const once=JSON.stringify(app.SpaceWhaleContent);apply();assert.equal(JSON.stringify(app.SpaceWhaleContent),once);
 const catalog=createCatalog(app.SpaceWhaleContent,[]);
 for(const source of app.SpaceWhaleContent){const lesson=catalog.lessons.find(l=>l.id===source.id);assert.deepEqual(plain(lesson.stages.map(s=>s.role)),plain(source.structure.map(s=>s.role)));for(const stage of lesson.stages)kit.validate(stage.exercise);}
 const html=read('classroom.html');for(const file of additions)assert.ok(html.indexOf('src="'+file+'?')>html.indexOf('src="course-content-b11-m2-word-practice.js?'));
});

test('all supplied closed answers grade through the same registered templates',()=>{
 const {app}=fixture(),closed=app.SpaceWhaleContent.flatMap(l=>newStages(l).flatMap(s=>definitions(s.exercise))).filter(d=>['gaps','matching','choice'].includes(d.kind));
 let count=0;for(const def of closed){kit.validate(def);const view=kit.templates.resolve(def);assert.equal(kit.templates.profileFor(view.templateCode,view.kind,view.templatePart).supported,true,def.id);const results=Object.values(kit.grade(def,keyedAnswers(def)));assert.ok(results.every(r=>r==='correct'),def.id);count+=results.length;}
 assert.equal(count,43);
 const choices=closed.find(d=>d.templateCode==='E01');assert.deepEqual(Array.from(choices.items,i=>i.correctId),['B','C']);
 const contrast=closed.find(d=>d.id==='B11M02L04_E03A_GRAMMAR_PRACTICE');assert.deepEqual(Object.values(keyedAnswers(contrast)),['were','would give','had been','would have gone','would enter','were','would have chosen','had been']);
 const discovery=closed.find(d=>d.kind==='matching'&&d.templateCode==='D04');assert.deepEqual(Array.from(discovery.items,i=>i.correctId),['sentence-4','sentence-2','sentence-1','sentence-3']);
});

test('open written production has 13 fields, no false exact-match grading, and samples appear only after a response',()=>{
 const {app}=fixture(),written=app.SpaceWhaleContent.flatMap(l=>newStages(l).flatMap(s=>definitions(s.exercise))).filter(d=>d.kind==='writing');
 assert.equal(written.reduce((n,d)=>n+d.items.length,0),13);
 for(const def of written){
  assert.equal(def.responseMode,'open');assert.ok(def.items.every(i=>!i.acceptedAnswers&&i.possibleAnswers?.length));
  const v=mount(def),sample=def.items[0].possibleAnswers[0];assert.equal(v.host.textContent.includes(sample),false);
  const answers=Object.fromEntries(def.items.map(i=>[i.id,'A valid alternative response for teacher review.']));assert.ok(Object.values(kit.grade(def,answers)).every(r=>r==='review'));
  v.handle.setAnswers({...answers,__sw_checked:true});assert.ok(v.host.textContent.includes('Well done'));assert.ok(v.host.textContent.includes(sample));assert.equal(v.host.querySelectorAll('[data-feedback="retry"]').length,0);v.handle.destroy();
 }
 const regrets=written.find(d=>d.id.includes('L03'));assert.equal(regrets.items.length,3);assert.ok(regrets.items[0].possibleAnswers.length>=2);assert.ok(regrets.items[2].possibleAnswers.length>=2);
});

test('oral discussion tasks use the supplied situations, without written inputs or exposed model answers',()=>{
 const {app}=fixture(),oral=app.SpaceWhaleContent.flatMap(l=>newStages(l).map(s=>s.exercise)).filter(d=>['E11A','Q01'].includes(d.templateCode));
 assert.equal(oral.length,3);
 for(const def of oral){kit.validate(def);const v=mount(def);assert.equal(v.host.querySelectorAll('input,textarea,.ek-check').length,0);for(const image of v.host.querySelectorAll('img'))assert.ok(fs.existsSync(path.join(root,image.getAttribute('src'))));assert.equal(v.host.textContent.includes('Image contents'),false);assert.equal(v.host.textContent.includes('[Image]'),false);assert.equal(v.host.textContent.includes('If the team hadn’t faced difficulties'),false);assert.equal(v.host.textContent.includes('I wish I hadn’t told the private story'),false);v.handle.destroy();}
});

test('L1 uses the approved three dropdowns and six bank-based typed gaps before unchanged E11',()=>{
 const {app}=fixture(),lesson=app.SpaceWhaleContent.find(l=>l.id==='b1-1-w2-l1');
 const practice=lesson.stages.filter(s=>s.role==='practice').map(s=>s.exercise),[select,typed,writing]=practice;
 assert.deepEqual(Array.from(practice,d=>d.id),['B11M02L01_E03_GRAMMAR_PRACTICE','B11M02L01_E04_GRAMMAR_PRACTICE','B11M02L01_E11_GRAMMAR_PRACTICE']);
 assert.deepEqual(plain(lesson.structure.find(s=>s.role==='practice').sources),Array.from(practice,d=>d.id));
 assert.equal(select.inputMode,'select');assert.equal(select.items.length,3);assert.equal(select.title,'Complete the sentences.');assert.equal(select.instruction,'Choose the correct options.');assert.equal(select.bank,undefined);
 const selectedGaps=select.items.map(i=>i.segments.find(s=>typeof s==='object'));
 assert.deepEqual(plain(selectedGaps.map(g=>g.options)),[
  ['hadn’t submitted','wouldn’t have submitted','didn’t submit'],
  ['had gotten','would get','would have gotten'],
  ['would have missed','wouldn’t have missed','hadn’t missed']
 ]);
 assert.deepEqual(Object.values(keyedAnswers(select)),['hadn’t submitted','would have gotten','wouldn’t have missed']);
 assert.deepEqual(plain(select.items.map(i=>i.segments.filter(s=>typeof s==='string'))),[
  ['I submitted my application on time and got an interview. If I ',' it on time, I wouldn’t have had the interview.'],
  ['Alex didn’t take the final exam. He ',' the qualification if he had passed it.'],
  ['We postponed the decision and lost the last place on the course. We ',' the opportunity if we had decided sooner.']
 ]);
 assert.equal(typed.inputMode,'text');assert.equal(typed.items.length,6);assert.equal(typed.title,'Complete the sentences.');assert.equal(typed.instruction,'Use each verb in the bank once. Change its form.');
 assert.deepEqual(plain(typed.bank),['postpone','face','get','miss','submit','achieve']);
 assert.deepEqual(Object.values(keyedAnswers(typed)),['had submitted','wouldn’t have gotten','hadn’t postponed','would have achieved','would have missed','wouldn’t have faced']);
 assert.deepEqual(plain(typed.items.map(i=>i.segments.filter(s=>typeof s==='string'))),[
  ['Clara sent her application after the deadline. If she ',' an application earlier, she would have had an interview.'],
  ['Daniel passed the final exam and got his certificate. He ',' the qualification if he hadn’t passed.'],
  ['The deadline was Friday, but I waited until Monday to decide. If I ',' the decision, I wouldn’t have missed the opportunity.'],
  ['We planned to open our café in May, but the building work finished late. We ',' our goal if the work had finished on time.'],
  ['Lena applied just before the deadline. She ',' the opportunity if she hadn’t applied in time.'],
  ['The software was hard to use, and nobody helped us. We ',' so many difficulties if a colleague had shown us how it worked.']
 ]);
 for(const def of [select,typed]){const v=mount(def);assert.equal(v.host.getAttribute('data-template-code'),def.templateCode);assert.equal(v.host.textContent.includes('___'),false);assert.equal(v.host.querySelectorAll('.ek-correction').length,0);if(def===select){assert.equal(v.host.querySelectorAll('.ek-choice-trigger').length,3);assert.equal(v.host.querySelectorAll('input').length,0);}else{assert.equal(v.host.querySelectorAll('.ek-typed-gap').length,6);assert.equal(v.host.querySelectorAll('.ek-word-list').length,1);}v.handle.destroy();}
 assert.equal(writing.kind,'writing');assert.deepEqual(Array.from(writing.items,i=>i.id),['nora','leo','sam']);
});

test('typed L1 negatives accept full forms and got/gotten without accepting the wrong tense or polarity',()=>{
 const {app}=fixture(),typed=app.SpaceWhaleContent[0].stages.find(s=>s.exercise.templateCode==='E04').exercise;
 const correct=keyedAnswers(typed);
 for(const [id,variants] of [
  ['qualification-result',['wouldn’t have gotten',"wouldn't have gotten",'would not have gotten','wouldn’t have got',"wouldn't have got",'would not have got']],
  ['decision-condition',['hadn’t postponed',"hadn't postponed",'had not postponed']],
  ['difficulties-result',['wouldn’t have faced',"wouldn't have faced",'would not have faced']]
 ])for(const value of variants)assert.equal(kit.grade(typed,{...correct,[id]:value})[id],'correct',value);
 for(const [id,value] of [['qualification-result','would have gotten'],['decision-condition','had postponed'],['difficulties-result','would not face']])assert.equal(kit.grade(typed,{...correct,[id]:value})[id],'retry',value);
});

test('retiring only L1 timeline preserves existing E11 and all L2–L4 grammar definitions on reload',()=>{
 const {app,apply}=fixture(),hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
 const approved=app.SpaceWhaleContent.slice(1).map(lesson=>hash(lesson.stages.filter(s=>s.role==='practice').map(s=>s.exercise)));
 apply();
 assert.deepEqual(app.SpaceWhaleContent.slice(1).map(lesson=>hash(lesson.stages.filter(s=>s.role==='practice').map(s=>s.exercise))),approved);
 const lesson=app.SpaceWhaleContent[0],retired='B11M02L01_E11A_GRAMMAR_PRACTICE';
 assert.equal(hash(lesson.stages.find(s=>s.exercise.templateCode==='E11').exercise),'066cfbc4e035b2370ce90df259e24807688d6dcdc9756ff8daf1505cfeba2ff5');
 const before=JSON.stringify(app.SpaceWhaleContent);
 lesson.stages.push({menu:'Grammar Practice',role:'practice',section:'tasks',exercise:{version:1,id:retired,templateCode:'E11A',kind:'presentation',title:'Say it aloud',blocks:[{type:'text',text:'Retired timeline'}]}});
 lesson.structure.find(s=>s.role==='practice').sources.push(retired);
 apply();assert.equal(JSON.stringify(app.SpaceWhaleContent),before);
 const catalog=createCatalog(app.SpaceWhaleContent,[]),composed=catalog.lessons.find(l=>l.id==='b1-1-w2-l1').stages.find(s=>s.role==='practice').exercise;
 assert.equal(JSON.stringify(composed).includes(retired),false);assert.equal(JSON.stringify(composed).includes('l1-timeline.svg'),false);
 assert.deepEqual(Array.from(composed.exercises,b=>b.id),['B11M02L01_E03_GRAMMAR_PRACTICE','B11M02L01_E04_GRAMMAR_PRACTICE','B11M02L01_E11_GRAMMAR_PRACTICE']);
});

test('each Rule stays behind its compact Discovery check and teacher arrow',()=>{
 const {app}=fixture(),catalog=createCatalog(app.SpaceWhaleContent,[]);
 function checked(def){if(def.kind==='stage')return Object.fromEntries(def.exercises.map(b=>[b.id,checked(b.exercise)]));if(def.kind==='rule-page')return Object.fromEntries(def.blocks.filter(b=>b.type==='exercise').map(b=>[b.id,checked(b.exercise)]));return {...keyedAnswers(def),__sw_checked:true};}
 for(const source of app.SpaceWhaleContent){
  const lesson=catalog.lessons.find(l=>l.id===source.id),focus=lesson.stages.find(s=>s.role==='focus').exercise,rule=source.stages.filter(s=>s.role==='focus')[1].exercise;
  const v=mount(focus);assert.equal(v.host.textContent.includes(rule.title),false);const forward=[...v.host.querySelectorAll('[aria-label="Show next exercise"]')].filter(visible);assert.equal(forward.length,1);assert.equal(forward[0].disabled,true);
  v.handle.setAnswers({...v.handle.getAnswers(),[focus.exercises[0].id]:checked(focus.exercises[0].exercise)});
  const next=[...v.host.querySelectorAll('[aria-label="Show next exercise"]')].filter(visible)[0];assert.equal(next.disabled,false);assert.equal(v.host.textContent.includes(rule.title),false);next.dispatchEvent(new v.window.Event('click',{bubbles:true}));assert.ok(v.host.textContent.includes(rule.title));assert.equal(v.host.querySelectorAll('.ek-rule-summary').length,1);v.handle.destroy();
 }
});

test('compact Discovery shows examples next to their own conclusions without ABC or redundant labels',()=>{
 const {app}=fixture(),discovery=app.SpaceWhaleContent.map(l=>l.stages.find(s=>s.role==='focus').exercise);
 for(const def of discovery.slice(0,3)){const v=mount(def);assert.equal(v.host.querySelectorAll('.ek-title').length,1);assert.equal([...v.host.querySelectorAll('.ek-title')].filter(visible).length,1);assert.doesNotMatch(v.host.textContent,/What happened:|What really happened →|What I imagine now|Imagined past:|My regret:|A\.\n|B\.\n|C\.\n/);assert.equal(v.host.querySelectorAll('.ek-check').length,1);v.handle.destroy();}
 assert.equal(discovery[0].exercises[0].exercise.blocks.length,2);assert.equal(discovery[1].exercises[0].exercise.blocks.length,2);
 const meaning=discovery[2];assert.equal(meaning.templateCode,'D02');assert.equal(meaning.templatePart,'legacy-inline-meaning');assert.equal(meaning.items.length,3);
 const v=mount(meaning),rows=[...v.host.querySelectorAll('.ek-sentence')];assert.equal(rows.length,3);assert.ok(rows[0].textContent.includes('I wish I had apologized.'));assert.ok(rows[0].textContent.includes('This means:'));assert.ok(rows[1].textContent.includes('If only I hadn’t laughed'));assert.ok(rows[1].textContent.includes('What really happened?'));assert.ok(rows[0].querySelectorAll('strong').length>0);assert.equal(rows[0].querySelectorAll('.ek-choice-trigger').length,1);v.handle.destroy();
 assert.deepEqual(Array.from(discovery[3].exercises[0].exercise.items,i=>i.id),['situation-c','situation-a','situation-b','situation-d']);
});
