const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {parseHTML}=require('linkedom'),kit=require('../exercise-kit.js'),{createCatalog}=require('../workspace-catalog.js');
const root=path.resolve(__dirname,'..'),read=file=>fs.readFileSync(path.join(root,file),'utf8'),plain=value=>JSON.parse(JSON.stringify(value));
const extension='course-content-b11-m2-speaking.js',stageId='B11M02L01_S01_FINAL';
const title='Explain how different choices would have changed the results.';
const words=['submit an application','get a qualification','miss an opportunity','achieve a goal','postpone a decision','face difficulties'];
const phrases=['1. If … had / hadn’t …, … would / wouldn’t have …','2. … would / wouldn’t have … if … had / hadn’t …','get — got — gotten'];
const images=[
 ['NINA','20a43a8d-28ba-43ee-b460-2d2665fcd781.png'],
 ['ALEX','08c25ebd-ecde-484d-a268-13991d22dbd7.png'],
 ['ANNA','f3956f8b-a101-4c0c-aef8-4593c4c0dd8c.png'],
 ['SAM','c41d0a27-fbfb-41f1-af19-7eaeb5c84ecf.png'],
 ['EVA','3ee93026-6da1-4423-bc18-f7b56af45231.png']
];
const sheetImages=[
 'f319e67a-032f-4fdf-b25a-b9bebd3faad9.png',
 '28476544-a11a-4b4e-9769-93ba0bc65f34.png',
 '73f1a4c8-a1bb-4936-82e4-8e3c638754c7.png'
];
const sheetContent=[
 {
  title:'Difficult decisions',
  task:{text:'These situations happened at work last month. Ask your tutor what they would have done. Then answer the same questions as a member of the team and compare the decisions.'},
  words:['be under pressure','take on responsibility','express concerns','look into the problem','explore alternatives','reach an agreement'],
  phrases:['Would you have ... if ... had / hadn’t ...?','What / How would you have ...?','Yes, I would have. · No, I wouldn’t have.','If I’d ..., I’d have ...','I would’ve ... · I wouldn’t have ...']
 },
 {
  title:'Regrets',
  task:{text:'The people in the pictures regret something that happened. Speak for each person:',bullets:['say how they feel;','say what they wish had been different.']},
  words:['disappointed','embarrassed','guilty','ashamed','miserable','betrayed'],
  phrases:['I feel ...','I wish I had / hadn’t ...','If only I had / hadn’t ...','I wish I’d ...','If only ... hadn’t ...']
 },
 {
  title:'Character and choices',
  task:{text:'Look at the time labels. For each person:',bullets:['describe the personality trait;','explain how a different personality would change the situation or result.']},
  words:['independent','reliable','competitive','self-confident','determined','stubborn'],
  phrases:['If ... were / weren’t ..., ... would / wouldn’t ...','If ... had / hadn’t been ..., ... would / wouldn’t have ...']
 }
];
const speakingId=(lesson,role)=>'B11M02L0'+lesson+'_S01_'+role.toUpperCase();
const ownedIds=new Set([1,2,3,4].flatMap(lesson=>['opening','final'].map(role=>speakingId(lesson,role))));
function fixture(){
 const app={SpaceWhaleExerciseKit:kit},context=vm.createContext({window:app});
 for(const file of ['course-content-b11-m2.js','course-content-b11-m2-p01.js','course-content-b11-m2-word-practice.js','course-content-b11-m2-discovery-rules.js','course-content-b11-m2-grammar-practice.js'])vm.runInContext(read(file),context);
 // Concurrent authors may add another source before this extension loads.
 const exercise={version:1,id:'b11-existing-listening-for-speaking-audit',templateCode:'Q01',kind:'presentation',title:'Existing source',blocks:[{type:'text',text:'Keep this authored material.'}]};
 app.SpaceWhaleContent[0].stages.push({section:'tasks',role:'listening',exercise});
 app.SpaceWhaleContent[0].structure.push({role:'listening',sources:[exercise.id]});
 const before=plain(app.SpaceWhaleContent),apply=()=>vm.runInContext(read(extension),context);
 apply();return {app,before,apply};
}
function mount(def,config={}){
 const {document,window}=parseHTML('<html><body><main></main></body></html>'),host=document.querySelector('main');
 return {host,window,handle:kit.mount(host,def,config)};
}
const visible=element=>{for(let current=element;current;current=current.parentElement)if(current.hidden||current.inert)return false;return true;};
const sceneInput=()=>({id:'shared-image-support-contract',title,image:null,arrangement:'image-support',use:[{words,phrases}]});

test('image/support Speaking is opt-in; ordinary Speaking keeps its original task contract and order',()=>{
 const variant=kit.speaking(sceneInput());assert.equal(variant.task,undefined);
 const v=mount(variant);assert.equal(v.host.querySelectorAll('.ek-speaking-aside').length,1);assert.equal(v.host.querySelectorAll('.ek-speaking-task').length,0);assert.equal(v.host.querySelectorAll('.ek-speaking-support').length,1);v.handle.destroy();
 assert.throws(()=>kit.speaking({...sceneInput(),arrangement:'unsupported'}));
 const ordinary=sceneInput();delete ordinary.arrangement;assert.throws(()=>kit.speaking(ordinary));
 ordinary.task={text:'Describe a different result.'};
 const normal=mount(kit.speaking(ordinary));
 assert.equal(normal.host.querySelectorAll('.ek-speaking-aside').length,0);
 assert.deepEqual([...normal.host.querySelector('.ek-body').children].map(element=>element.className),['ek-speaking-image','ek-speaking-task','ek-speaking-use']);
 assert.equal(normal.host.querySelector('.ek-speaking-task').textContent,ordinary.task.text);normal.handle.destroy();
 const below=mount(kit.speaking({...sceneInput(),arrangement:'image-support-below'}));
 assert.equal(below.host.querySelectorAll('.ek-speaking-image-wide').length,1);assert.equal(below.host.querySelectorAll('.ek-speaking-aside,.ek-speaking-task').length,0);
 assert.deepEqual([...below.host.querySelector('.ek-body').children].map(element=>element.className),['ek-speaking-image ek-speaking-image-wide','ek-speaking-use']);
 assert.deepEqual([...below.host.querySelectorAll('.ek-speaking-phrases')].map(element=>element.textContent),phrases);below.handle.destroy();
});

test('four lessons add only paired Speaking, preserving all existing content and repeat-load identity',()=>{
 const {app,before,apply}=fixture();
 for(const [index,lesson] of app.SpaceWhaleContent.entries()){
  const added=lesson.stages.filter(stage=>ownedIds.has(stage.exercise.id));assert.equal(added.length,2);
  assert.deepEqual(plain(added.map(stage=>stage.role)),['opening','final']);
  assert.deepEqual(plain(lesson.stages.filter(stage=>!ownedIds.has(stage.exercise.id))),before[index].stages);
  assert.deepEqual(plain(lesson.structure.filter(section=>!section.sources.some(id=>ownedIds.has(id)))),before[index].structure);
  for(const key of ['words','teacherInfo','title','id','level','whale'])assert.deepEqual(plain(lesson[key]),before[index][key]);
  const classroom=lesson.stages.filter(stage=>stage.section!=='self-study');
  assert.equal(classroom[0].exercise.id,speakingId(index+1,'opening'));assert.equal(classroom.at(-1).exercise.id,speakingId(index+1,'final'));
 }
 const once=JSON.stringify(app.SpaceWhaleContent);apply();assert.equal(JSON.stringify(app.SpaceWhaleContent),once);
 const catalog=createCatalog(app.SpaceWhaleContent,[]);
 for(const [index,lesson] of app.SpaceWhaleContent.entries()){
  const view=catalog.lessons.find(item=>item.id===lesson.id);
  for(const role of ['opening','final']){
   const id=speakingId(index+1,role);assert.ok(view.blocks.find(block=>block.id===role).stageIds.includes(id));
   assert.equal(view.stages.filter(stage=>stage.exercise.id===id).length,1);
  }
 }
 const html=read('classroom.html');assert.ok(html.includes('src="'+extension+'?'));assert.ok(html.indexOf('src="'+extension+'?')>html.indexOf('src="course-content-b11-m2.js?'));
});

test('five approved PNGs and target supports use the shared S01 variant without extra student copy',()=>{
 const {app}=fixture(),def=app.SpaceWhaleContent[0].stages.find(stage=>stage.exercise.id===stageId).exercise;
 kit.validate(def);assert.equal(def.kind,'stage');assert.equal(def.progressive,true);assert.equal(def.title,title);assert.notEqual(def.requireCheckBeforeNext,true);assert.equal(def.exercises.length,5);
 for(const [index,block] of def.exercises.entries()){
  const scene=block.exercise,[name,file]=images[index],source='Images/B1/module 1/'+file;
  assert.equal(scene.id,'B11M02L01_S01_'+name);assert.equal(scene.templateCode,'S01');assert.equal(scene.layout,'speaking');assert.equal(scene.arrangement,'image-support-below');assert.equal(scene.title,title);
  assert.equal(scene.image.image,source);assert.equal(scene.image.imageWidth,1484);assert.equal(scene.image.imageHeight,1060);assert.ok(scene.image.alt.trim());
  const png=fs.readFileSync(path.join(root,source));assert.equal(png.subarray(1,4).toString(),'PNG');assert.equal(png.readUInt32BE(16),1484);assert.equal(png.readUInt32BE(20),1060);
  assert.deepEqual(plain(scene.use.flatMap(group=>group.words||[])),words);assert.deepEqual(plain(scene.use.flatMap(group=>group.phrases||[])),phrases);
  assert.deepEqual(plain(scene.use),[{words,phrases:phrases.slice(0,2)},{phrases:phrases.slice(2)}]);
  for(const field of ['task','instruction','blocks','answers','teacherNotes','possibleAnswers'])assert.equal(scene[field],undefined,scene.id+': '+field);
  const v=mount(scene);assert.equal(v.host.querySelectorAll('input,textarea,select,button,details,.ek-speaking-task,.ek-speaking-aside').length,0);assert.equal(v.host.querySelectorAll('.ek-speaking-image-wide img').length,1);
  assert.deepEqual([...v.host.querySelector('.ek-body').children].map(element=>element.className),['ek-speaking-image ek-speaking-image-wide','ek-speaking-use']);
  assert.equal(v.host.querySelectorAll('.ek-speaking-group').length,2);assert.deepEqual([...v.host.querySelectorAll('.ek-speaking-phrases')].map(element=>element.textContent),phrases);assert.deepEqual(kit.grade(scene,{}),{});v.handle.destroy();
 }
});

test('teacher arrows reveal all five images with one heading and no answer/check UI',()=>{
 const {app}=fixture(),def=app.SpaceWhaleContent[0].stages.find(stage=>stage.exercise.id===stageId).exercise,v=mount(def);
 for(let count=1;count<=5;count++){
  assert.equal([...v.host.querySelectorAll('img')].filter(visible).length,count);
  assert.equal(v.host.querySelectorAll('h2').length,1);assert.equal(v.host.querySelector('h2').textContent,title);
  assert.equal(v.host.querySelectorAll('input,textarea,select,details,.ek-check,.ek-skip,.ek-speaking-task').length,0);
  assert.equal([...v.host.querySelectorAll('button')].every(button=>button.classList.contains('ek-stage-toggle')),true);
  assert.equal(v.handle.getViewState().revealed,count);
  const next=[...v.host.querySelectorAll('[aria-label="Show next exercise"]')].find(visible);
  if(count<5){assert.ok(next);assert.equal(next.disabled,false);next.dispatchEvent(new v.window.Event('click',{bubbles:true}));}
  else assert.equal(Boolean(next),false);
 }
 assert.deepEqual([...v.host.querySelectorAll('img')].map(image=>image.getAttribute('src')),images.map(([,file])=>'Images/B1/module 1/'+file));
 const saved=v.handle.getAnswers();v.handle.destroy();
 const restored=mount(def,{answers:saved});assert.equal(restored.handle.getViewState().revealed,5);assert.equal([...restored.host.querySelectorAll('img')].filter(visible).length,5);restored.handle.destroy();
});

test('student read-only views follow synchronized reveal state without opening scenes themselves',()=>{
 const {app}=fixture(),def=app.SpaceWhaleContent[0].stages.find(stage=>stage.exercise.id===stageId).exercise;
 const v=mount(def,{navigationReadOnly:true});
 assert.equal(v.handle.getViewState().revealed,1);assert.equal([...v.host.querySelectorAll('button')].filter(visible).length,0);
 const blocked=v.host.querySelector('[aria-label="Show next exercise"]');assert.ok(blocked);assert.equal(blocked.disabled,true);blocked.dispatchEvent(new v.window.Event('click',{bubbles:true}));assert.equal(v.handle.getViewState().revealed,1);
 v.handle.setViewState({revealed:4},false);assert.equal(v.handle.getViewState().revealed,4);assert.equal([...v.host.querySelectorAll('img')].filter(visible).length,4);
 v.handle.setViewState({revealed:2},false);assert.equal(v.handle.getViewState().revealed,2);assert.equal([...v.host.querySelectorAll('img')].filter(visible).length,2);assert.equal([...v.host.querySelectorAll('button')].filter(visible).length,0);v.handle.destroy();
});

test('L2–L4 mirror their approved sheets, exact tasks and Use in the completed shared Speaking order',()=>{
 const {app}=fixture();
 for(const [offset,file] of sheetImages.entries()){
  const index=offset+1,source='Images/'+file,lesson=app.SpaceWhaleContent[index],content=sheetContent[offset];
  const png=fs.readFileSync(path.join(root,source));assert.equal(png.subarray(1,4).toString(),'PNG');assert.equal(png.readUInt32BE(16),1448);assert.equal(png.readUInt32BE(20),1086);
  const pair=['opening','final'].map(role=>lesson.stages.find(stage=>stage.exercise.id===speakingId(index+1,role)).exercise);
  for(const def of pair){
   kit.validate(def);assert.equal(def.kind,'presentation');assert.equal(def.templateCode,'S01');assert.equal(def.layout,'speaking');assert.equal(def.arrangement,undefined);assert.equal(def.title,content.title);assert.deepEqual(plain(def.task),content.task);
   assert.equal(def.image.image,source);assert.equal(def.image.imageWidth,1448);assert.equal(def.image.imageHeight,1086);assert.ok(def.image.alt.trim());
   assert.deepEqual(plain(def.use),[{words:content.words,phrases:content.phrases}]);
   for(const field of ['instruction','blocks','answers','teacherNotes','possibleAnswers'])assert.equal(def[field],undefined,def.id+': '+field);
   const v=mount(def);assert.equal(v.host.querySelectorAll('img').length,1);assert.equal(v.host.querySelector('img').getAttribute('src'),source);assert.equal(v.host.querySelectorAll('input,textarea,select,button,details').length,0);
   assert.deepEqual([...v.host.querySelector('.ek-body').children].map(element=>element.className),['ek-speaking-image','ek-speaking-task','ek-speaking-use']);
   assert.equal(v.host.querySelectorAll('h2').length,1);assert.equal(v.host.querySelector('h2').textContent,content.title);assert.equal(v.host.querySelector('.ek-speaking-task > p').textContent,content.task.text);
   assert.deepEqual([...v.host.querySelectorAll('.ek-speaking-bullets li')].map(element=>element.textContent),content.task.bullets||[]);
   assert.equal(v.host.querySelector('.ek-speaking-words').textContent,content.words.join(' · '));assert.deepEqual([...v.host.querySelectorAll('.ek-speaking-phrases')].map(element=>element.textContent),content.phrases);
   assert.deepEqual([...v.host.querySelectorAll('.ek-speaking-use strong')].map(element=>element.textContent),['Use:']);assert.doesNotMatch(v.host.textContent,/Words:|Phrases:|Useful language:|Possible answers/);assert.deepEqual(kit.grade(def,{}),{});v.handle.destroy();
  }
  const normalized=pair.map(def=>{const value=plain(def);delete value.id;return value;});assert.deepEqual(normalized[0],normalized[1]);
 }
});

test('explicit image-only Speaking still rejects missing artwork and added task or Use',()=>{
 const source={id:'strict-image-only-speaking',title:'Speaking',arrangement:'image-only',image:{image:'Images/'+sheetImages[0],alt:'Approved speaking sheet'}};
 assert.doesNotThrow(()=>kit.speaking(source));
 const v=mount(kit.speaking(source));assert.equal(v.host.querySelectorAll('img').length,1);assert.equal(v.host.querySelectorAll('.ek-speaking-task,.ek-speaking-use,button,input,textarea,details').length,0);v.handle.destroy();
 for(const extra of [{task:{text:'Extra task'}},{use:[{words:['Extra support']}]}])assert.throws(()=>kit.speaking({...source,...extra}));
 assert.throws(()=>kit.speaking({...source,image:null}));assert.throws(()=>kit.speaking({...source,image:{imagePending:true,assetId:'missing-sheet'}}));
});

test('L1 opening and final share the approved scenes while keeping independent progressive state',()=>{
 const {app}=fixture(),lesson=app.SpaceWhaleContent[0];
 const opening=lesson.stages.find(stage=>stage.exercise.id===speakingId(1,'opening')).exercise,final=lesson.stages.find(stage=>stage.exercise.id===stageId).exercise;
 assert.equal(opening.title,title);assert.equal(opening.progressive,true);assert.equal(opening.exercises.length,5);
 assert.deepEqual(plain(opening.exercises.map(block=>block.id)),plain(final.exercises.map(block=>block.id)));
 const openingIds=opening.exercises.map(block=>block.exercise.id),finalIds=final.exercises.map(block=>block.exercise.id);
 assert.deepEqual(plain(openingIds),images.map(([name])=>'B11M02L01_S01_OPENING_'+name));assert.equal(openingIds.some(id=>finalIds.includes(id)),false);
 const content=def=>{const value=plain(def);delete value.id;value.exercises.forEach(block=>delete block.exercise.id);return value;};
 assert.deepEqual(content(opening),content(final));
 const first=mount(opening),last=mount(final);
 first.handle.setViewState({revealed:4},false);assert.equal(first.handle.getViewState().revealed,4);assert.equal(last.handle.getViewState().revealed,1);
 last.handle.setViewState({revealed:2},false);assert.equal(last.handle.getViewState().revealed,2);assert.equal(first.handle.getViewState().revealed,4);
 first.handle.destroy();last.handle.destroy();
});
