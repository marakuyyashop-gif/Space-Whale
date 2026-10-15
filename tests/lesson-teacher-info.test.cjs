const test=require('node:test'),assert=require('node:assert/strict');
const {createCatalog}=require('../workspace-catalog.js');
const {get,levelOverview,moduleOverview,lessonOverview}=require('../lesson-teacher-info.js');
const {courseOutline}=require('../workspace-catalog.js');

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
  assert.match(blockAims.opening,/^Assess /,lesson.id);
  assert.match(blockAims.final,/^Consolidate /,lesson.id);
  const overview=lessonOverview(lesson);
  assert.equal(overview.summary,goal);
  assert.ok(overview.language.length>3&&overview.language.length<110,lesson.id);
  assert.ok(overview.language.split('; ').length<=4,lesson.id);
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

test('A1 level and module overviews describe the approved subjects and language concisely',()=>{
 const saved=JSON.stringify(courseOutline);
 for(const level of courseOutline.filter(level=>/^A1\./.test(level.id))){
  const summary=levelOverview(level);
  assert.equal(summary,levelOverview(level.id));
  assert.ok(summary.length>60&&summary.length<200,level.id);
  assert.match(summary,/\. Language: /,level.id);
  assert.doesNotMatch(summary,/[\u0400-\u04ff]/,level.id);
  for(const module of level.whales){
   const overview=moduleOverview(level,module);
   assert.equal(overview,moduleOverview(level.id,String(module.id)));
   assert.ok(overview.length>60&&overview.length<200,`${level.id}:M${module.id}`);
   assert.match(overview,/\. Language: /,`${level.id}:M${module.id}`);
   assert.doesNotMatch(overview,/[\u0400-\u04ff]/,`${level.id}:M${module.id}`);
  }
 }
 assert.match(moduleOverview('A1.1',4),/Present Simple.*frequency adverbs/);
 assert.match(moduleOverview('A1.1',5),/Present Simple questions.*have.*want\/need/);
 assert.match(moduleOverview('A1.2',4),/look\/look like.*opinions and reasons.*category phrases/);
 assert.match(moduleOverview('A1.2',6),/will\/won’t.*be going to.*plans vs immediate decisions/);
 assert.match(moduleOverview('A1.2',7),/review.*no new vocabulary or grammar/);
 assert.doesNotMatch(levelOverview('A1.2'),/Past Simple/);
 assert.equal(JSON.stringify(courseOutline),saved);
});

test('unfinished course outlines do not acquire invented module descriptions',()=>{
 assert.equal(levelOverview('A2.3'),'');
 assert.equal(moduleOverview('A2.1',2),'');
 assert.equal(moduleOverview('B1.1',2),'');
 assert.equal(moduleOverview('A2.2',1),'');
 assert.match(levelOverview('A2.2'),/Travel problems.*everyday services/);
 assert.match(moduleOverview('A2.2',6),/Device problems.*indefinite pronouns/);
 assert.doesNotMatch(moduleOverview('A2.2',6),/something|anything|everything|nothing/);
 assert.equal(moduleOverview('B1.1',2,[{level:'B1.1',whale:2,teacherInfo:{goal:'Discuss a recent news story.'}}]),'');
});

test('future course objects may supply English overviews without mutating lesson metadata',()=>{
 const level={id:'B1.1',teacherInfo:{overview:'Discuss everyday choices and explain opinions.'}};
 const module={id:1,overview:'Compare shared living arrangements and discuss household rules.'};
 const lessons=[{id:'future-lesson',level:'B1.1',whale:2,teacherInfo:{goal:'Agree on household rules.',moduleOverview:'Discuss shared spaces, privacy, and household responsibilities.'}}];
 const saved=JSON.stringify({level,module,lessons});
 assert.equal(levelOverview(level),level.teacherInfo.overview);
 assert.equal(moduleOverview(level,module,lessons),module.overview);
 assert.equal(moduleOverview(level,2,lessons),lessons[0].teacherInfo.moduleOverview);
 assert.equal(moduleOverview(level,3,lessons),'');
 assert.equal(moduleOverview('B1.1',{id:2,description:'Описание модуля'}),'');
 assert.equal(JSON.stringify({level,module,lessons}),saved);
});

test('browser and Node expose the same teacher metadata API',()=>{
 const fs=require('node:fs'),vm=require('node:vm'),window={};
 vm.runInNewContext(fs.readFileSync(require.resolve('../lesson-teacher-info.js'),'utf8'),{window});
 const browser=window.SpaceWhaleLessonTeacherInfo;
 assert.deepEqual(Object.keys(browser).sort(),['get','lessonOverview','levelOverview','moduleOverview']);
 assert.equal(browser.levelOverview('A1.1'),levelOverview('A1.1'));
 assert.equal(browser.moduleOverview('A1.2',6),moduleOverview('A1.2',6));
 assert.equal(JSON.stringify(browser.lessonOverview({id:'a1-2-w4-l1'})),JSON.stringify(lessonOverview({id:'a1-2-w4-l1'})));
 assert.equal(JSON.stringify(browser.get({id:'a1-2-w6-l6'})),JSON.stringify(get({id:'a1-2-w6-l6'})));
});

test('all nine published A2 and B1 lessons have concrete English guidance from their current materials',()=>{
 const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
 const root=path.join(__dirname,'..'),window={SpaceWhaleExerciseKit:require('../exercise-kit.js')},context=vm.createContext({window});
 const html=fs.readFileSync(path.join(root,'classroom.html'),'utf8');
 const scripts=[...html.matchAll(/<script src="([^"?]+)(?:\?[^\"]*)?"/g)].map(match=>match[1])
  .filter(file=>/^(template-gallery|lesson-draft-|course-content|whale1-content|homework-a21)/.test(file));
 for(const file of scripts)vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context);
 const catalog=createCatalog(window.SpaceWhaleContent,window.SpaceWhaleTemplates);
 const lessons=catalog.lessons.filter(lesson=>/^(A2|B1)\./.test(lesson.level)&&lesson.stages.length);
 assert.equal(lessons.length,9);
 for(const lesson of lessons){
  assert.ok(lesson.teacherInfo.goal.length>20&&lesson.teacherInfo.goal.length<200,lesson.id);
  assert.doesNotMatch(lesson.teacherInfo.goal,/Complete the lesson task|[\u0400-\u04ff]/,lesson.id);
  assert.ok(lesson.teacherInfo.blockAims.language,lesson.id);
  for(const aim of Object.values(lesson.teacherInfo.blockAims))assert.doesNotMatch(aim,/[\u0400-\u04ff]/,lesson.id);
  assert.ok(moduleOverview(lesson.level,lesson.whale),lesson.id);
  const overview=lessonOverview(lesson);
  assert.equal(overview.summary,lesson.teacherInfo.goal,lesson.id);
  assert.ok(overview.language.length<110,lesson.id);
  assert.match(lesson.teacherInfo.blockAims.opening,/^Assess /,lesson.id);
  assert.match(lesson.teacherInfo.blockAims.final,/^Consolidate /,lesson.id);
 }
 const plan=get({id:'a2-2-w4-l12'});
 assert.match(plan.blockAims.language,/could.*Why don’t we/);
 assert.doesNotMatch(plan.blockAims.language,/shall|would|if/i);
 assert.match(get({id:'a2-2-w6-l1'}).blockAims.language,/something\/anything\/everything\/nothing/);
 assert.match(get({id:'b1-1-w1-misha-1'}).blockAims.language,/If \+ Past Simple, would\/wouldn’t/);
 assert.equal(get({id:'a2-1-w1-smy-1'}).blockAims.words,'');
 assert.doesNotMatch(moduleOverview('A2.1',1),/Past Simple/);
});

test('lesson overviews preserve explicit language labels through the shared catalog',()=>{
 const source={id:'future-overview',level:'A1.2',whale:6,title:'Future lesson',stages:[],teacherInfo:{goal:'Explain a change to your weekend plans.',language:['Be going to','Will'],blockAims:{language:'Distinguish an intention from an immediate decision.'}}};
 const saved=JSON.stringify(source),actual=createCatalog([source],[]).lessons.find(lesson=>lesson.id===source.id);
 assert.deepEqual(lessonOverview(actual),{summary:source.teacherInfo.goal,language:'Be going to; Will'});
 assert.equal(JSON.stringify(source),saved);
 assert.equal(lessonOverview({id:'future-grammar',teacherInfo:{grammar:'Articles'}}).language,'Articles');
 assert.equal(lessonOverview({id:'future-grammar',grammar:'Present Perfect'}).language,'Present Perfect');
 assert.deepEqual(lessonOverview({id:'unknown-empty',grammar:'Новая грамматика'}),{summary:'',language:''});
});

test('the fitting-room block aims describe assessment, language distinction, and consolidation',()=>{
 const {blockAims}=get({id:'a1-2-w4-l1'});
 assert.equal(blockAims.opening,'Assess how the learner describes clothing and visual similarity.');
 assert.equal(blockAims.words,'Learn names for clothing items.');
 assert.equal(blockAims.language,'Distinguish look + adjective from look like + noun.');
 assert.match(blockAims.final,/^Consolidate descriptions of clothing/);
 assert.deepEqual(lessonOverview({id:'a1-2-w4-l1'}),{summary:'Describe how clothes look and compare similar items.',language:'Look + adjective; Look like + noun'});
 assert.equal(get({id:'a2-2-w6-l1'}).blockAims.words,'Learn names for computer and TV equipment.');
});
