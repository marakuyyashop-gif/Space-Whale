const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
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
 const {app,before,apply}=fixture(),expectedCodes=[['E11','E11A'],['E11','Q01'],['E01','E11','E11A'],['E03A','E11','E11A']];
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
 assert.equal(count,26);
 const choices=closed.find(d=>d.templateCode==='E01');assert.deepEqual(Array.from(choices.items,i=>i.correctId),['B','A','B','C']);
 const contrast=closed.find(d=>d.templateCode==='E03A');assert.deepEqual(Object.values(keyedAnswers(contrast)),['were','would apply','had been','would have applied','were','would trust','had been','would have finished']);
 const discovery=closed.find(d=>d.kind==='matching'&&d.templateCode==='D04');assert.deepEqual(Array.from(discovery.items,i=>i.correctId),['sentence-2','sentence-1','sentence-4','sentence-3']);
});

test('open written production has 15 fields, no false exact-match grading, and samples appear only after a response',()=>{
 const {app}=fixture(),written=app.SpaceWhaleContent.flatMap(l=>newStages(l).flatMap(s=>definitions(s.exercise))).filter(d=>d.kind==='writing');
 assert.equal(written.reduce((n,d)=>n+d.items.length,0),15);
 for(const def of written){
  assert.equal(def.responseMode,'open');assert.ok(def.items.every(i=>!i.acceptedAnswers&&i.possibleAnswers?.length));
  const v=mount(def),sample=def.items[0].possibleAnswers[0];assert.equal(v.host.textContent.includes(sample),false);
  const answers=Object.fromEntries(def.items.map(i=>[i.id,'A valid alternative response for teacher review.']));assert.ok(Object.values(kit.grade(def,answers)).every(r=>r==='review'));
  v.handle.setAnswers({...answers,__sw_checked:true});assert.ok(v.host.textContent.includes('Well done'));assert.ok(v.host.textContent.includes(sample));assert.equal(v.host.querySelectorAll('[data-feedback="retry"]').length,0);v.handle.destroy();
 }
 const regrets=written.find(d=>d.id.includes('L03'));assert.equal(regrets.items.length,4);assert.ok(regrets.items[0].possibleAnswers.length>=2);assert.ok(regrets.items[2].possibleAnswers.length>=2);
});

test('oral tasks keep factual media and supplied help, without written inputs or exposed model answers',()=>{
 const {app}=fixture(),oral=app.SpaceWhaleContent.flatMap(l=>newStages(l).map(s=>s.exercise)).filter(d=>['E11A','Q01'].includes(d.templateCode));
 assert.equal(oral.length,4);
 for(const def of oral){kit.validate(def);const v=mount(def);assert.equal(v.host.querySelectorAll('input,textarea,.ek-check').length,0);for(const image of v.host.querySelectorAll('img'))assert.ok(fs.existsSync(path.join(root,image.getAttribute('src'))));assert.equal(v.host.textContent.includes('Image contents'),false);assert.equal(v.host.textContent.includes('[Image]'),false);assert.equal(v.host.textContent.includes('If the team hadn’t faced difficulties'),false);assert.equal(v.host.textContent.includes('I wish I hadn’t told the private story'),false);v.handle.destroy();}
});

test('Rule stays behind the Discovery check and teacher arrow in the composed lesson',()=>{
 const {app}=fixture(),catalog=createCatalog(app.SpaceWhaleContent,[]),lesson=catalog.lessons.find(l=>l.id==='b1-1-w2-l1'),focus=lesson.stages.find(s=>s.role==='focus').exercise,source=app.SpaceWhaleContent[0],rule=source.stages.filter(s=>s.role==='focus')[1].exercise;
 const v=mount(focus);assert.equal(v.host.textContent.includes(rule.title),false);const forward=[...v.host.querySelectorAll('[aria-label="Show next exercise"]')].filter(visible);assert.equal(forward.length,1);assert.equal(forward[0].disabled,true);
 function checked(def){if(def.kind==='stage')return Object.fromEntries(def.exercises.map(b=>[b.id,checked(b.exercise)]));if(def.kind==='rule-page')return Object.fromEntries(def.blocks.filter(b=>b.type==='exercise').map(b=>[b.id,checked(b.exercise)]));return {...keyedAnswers(def),__sw_checked:true};}
 v.handle.setAnswers({...v.handle.getAnswers(),[focus.exercises[0].id]:checked(focus.exercises[0].exercise)});
 const next=[...v.host.querySelectorAll('[aria-label="Show next exercise"]')].filter(visible)[0];assert.equal(next.disabled,false);assert.equal(v.host.textContent.includes(rule.title),false);next.dispatchEvent(new v.window.Event('click',{bubbles:true}));assert.ok(v.host.textContent.includes(rule.title));v.handle.destroy();
});
