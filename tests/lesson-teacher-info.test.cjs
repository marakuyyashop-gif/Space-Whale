const test=require('node:test'),assert=require('node:assert/strict');
const {createCatalog}=require('../workspace-catalog.js');
const {get}=require('../lesson-teacher-info.js');

test('all A1 cards supply concise English teacher goals without altering their tasks',()=>{
 const catalog=createCatalog([],[]),lessons=catalog.lessons.filter(lesson=>/^A1\./.test(lesson.level));
 assert.equal(lessons.length,98);
 for(const lesson of lessons){
  const {goal,blockAims}=lesson.teacherInfo;
  assert.ok(goal.length>15&&goal.length<200,lesson.id);
  assert.doesNotMatch(goal,/[\u0400-\u04ff]/,lesson.id);
  for(const id of ['opening','words','language','final']){
   assert.ok(blockAims[id]?.length,`${lesson.id}:${id}`);
   assert.doesNotMatch(blockAims[id],/[\u0400-\u04ff]/,`${lesson.id}:${id}`);
  }
 }
 assert.match(get({id:'a1-1-w1-lnumbers'}).blockAims.words,/0 to 20/);
 assert.match(get({id:'a1-1-w1-ltens'}).blockAims.words,/tens/);
 assert.equal(get({id:'a1-2-w6-l7'}).blockAims.words,'No new vocabulary.');
 assert.match(get({id:'a1-2-w6-l6'}).blockAims.language,/be going to.*will/);
});

test('new lessons keep authored English teacher guidance and their original exercise data',()=>{
 const source={id:'new-teacher-card',level:'A1.2',whale:6,title:'New lesson',stages:[],teacherInfo:{goal:'Explain your weekend plans.',blockAims:{words:'Learn travel activities.',language:'Use be going to.'}}};
 const saved=JSON.stringify(source),catalog=createCatalog([source],[]);
 const actual=catalog.lessons.find(lesson=>lesson.id===source.id);
 assert.equal(actual.teacherInfo.goal,source.teacherInfo.goal);
 assert.equal(actual.teacherInfo.blockAims.words,source.teacherInfo.blockAims.words);
 assert.equal(actual.teacherInfo.blockAims.language,source.teacherInfo.blockAims.language);
 assert.deepEqual(actual.stages,source.stages);assert.equal(JSON.stringify(source),saved);
 assert.equal(actual.blocks.length,4);
});
