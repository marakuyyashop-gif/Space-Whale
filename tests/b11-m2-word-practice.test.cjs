const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {parseHTML}=require('linkedom'),kit=require('../exercise-kit.js'),{createCatalog}=require('../workspace-catalog.js');
const read=file=>fs.readFileSync(require.resolve('../'+file),'utf8');
function fixture(){
 const app={SpaceWhaleExerciseKit:kit},context=vm.createContext({window:app});
 vm.runInContext(read('course-content-b11-m2.js'),context);
 const before=JSON.parse(JSON.stringify(app.SpaceWhaleContent));
 const apply=()=>vm.runInContext(read('course-content-b11-m2-word-practice.js'),context);
 apply();return {app,before,apply};
}
const expected=[['E06B',['F','C','A','E','B','D']],['E06F',['F','C','E','B','D','A']],['E04A',['disappointed','embarrassed','guilty','ashamed','miserable','betrayed']],['E06B',['E','C','A','F','D','B']]];
const plain=value=>JSON.parse(JSON.stringify(value));
test('only the four approved Exercise 2 tasks are added, with existing Words and lesson metadata intact',()=>{
 const {app,before,apply}=fixture();
 for(const [i,lesson] of app.SpaceWhaleContent.entries()){
  const old=before.find(item=>item.id===lesson.id),practice=lesson.stages.filter(stage=>stage.role==='wordPractice');
  assert.equal(practice.length,1);assert.equal(practice[0].exercise.templateCode,expected[i][0]);assert.equal(practice[0].exercise.items.length,6);
  assert.deepEqual(plain(lesson.stages.filter(stage=>stage.role!=='wordPractice')),old.stages);
  assert.deepEqual(plain(lesson.teacherInfo),old.teacherInfo);assert.deepEqual(plain(lesson.words),old.words);
  assert.deepEqual(plain(lesson.structure.filter(section=>section.role!=='wordPractice')),old.structure);
  assert.equal(practice[0].navigationBlock,'words');
 }
 const first=JSON.stringify(app.SpaceWhaleContent);apply();assert.equal(JSON.stringify(app.SpaceWhaleContent),first,'Reload does not duplicate or rewrite other stages');
 const catalog=createCatalog(app.SpaceWhaleContent,[]);
 for(const lesson of app.SpaceWhaleContent){
  const actual=catalog.lessons.find(item=>item.id===lesson.id),ids=actual.stages.map(stage=>stage.exercise.id);
  assert.equal(new Set(ids).size,ids.length);assert.ok(actual.blocks.find(block=>block.id==='words').stageIds.some(id=>id.includes('_WORD_PRACTICE')));
 }
 const html=read('classroom.html');assert.ok(html.indexOf('src="course-content-b11-m2.js?')<html.indexOf('src="course-content-b11-m2-word-practice.js?'));
});
test('all 24 supplied practice keys grade correctly through the shared template profiles',()=>{
 const {app}=fixture();
 for(const [i,lesson] of app.SpaceWhaleContent.entries()){
  const def=lesson.stages.find(stage=>stage.role==='wordPractice').exercise;
  kit.validate(def);assert.equal(kit.templates.resolve(def).templateCode,expected[i][0]);
  const answers=Object.fromEntries(def.items.map((item,index)=>[def.kind==='gaps'?item.segments.find(segment=>typeof segment==='object').id:item.id,expected[i][1][index]]));
  assert.deepEqual(Object.values(kit.grade(def,answers)),Array(6).fill('correct'));
  if(def.kind==='matching'){
   assert.deepEqual(plain(def.items.map(item=>item.correctId)),expected[i][1]);
   assert.deepEqual(plain(def.options.map(option=>option.id)),['A','B','C','D','E','F']);
   assert.equal(kit.templates.resolve(def).layout,'stacked-text');
  }
  assert.equal(JSON.stringify(def).includes('audio'),false);assert.equal(JSON.stringify(def).includes('W03B'),false);
 }
});
test('L3 first-letter cues use native fields and accept complete words without a repeated fixed prefix',()=>{
 const {app}=fixture(),def=app.SpaceWhaleContent[2].stages.find(stage=>stage.role==='wordPractice').exercise;
 const {document,window}=parseHTML('<html><body><main></main></body></html>'),host=document.querySelector('main');
 const handle=kit.mount(host,def,{syncChecks:true}),fields=[...host.querySelectorAll('input')];
 assert.equal(host.getAttribute('data-template-code'),'E04A');assert.equal(host.classList.contains('ek-flat-controls'),true);
 assert.deepEqual(fields.map(field=>field.getAttribute('placeholder')),['d','e','g','a','m','b']);
 const answers={};fields.forEach((field,i)=>{field.value=expected[2][1][i];field.dispatchEvent(new window.Event('input',{bubbles:true}));answers['word-'+(i+1)]=field.value;});
 assert.deepEqual(handle.getAnswers(),answers);
 host.querySelector('.ek-check').dispatchEvent(new window.Event('click',{bubbles:true}));
 assert.equal(host.querySelectorAll('input[data-feedback=correct]').length,6);
 handle.setAnswers({...answers,'word-1':'isappointed',__sw_checked:true});assert.equal(fields[0].getAttribute('data-feedback'),'retry');
 assert.ok(host.textContent.includes('private idea'));assert.equal(host.textContent.includes('__________'),false);
 handle.destroy();
});
