/* Shared lesson composition. Content declares roles; rendering stays in ExerciseKit. */
(function(root){
'use strict';
const titles={opening:'Speaking',words:'Words',wordPractice:'Word Practice',focus:'Language Focus',practice:'Practice',reading:'Reading',listening:'Listening',final:'Final Speaking'};
const copy=v=>JSON.parse(JSON.stringify(v));
function compose(lesson){
 if(!lesson.structure)return lesson;
 const sources=new Map(lesson.stages.map(s=>[s.exercise.id,s])),used=new Set();
 const stages=lesson.structure.map(section=>{
  if(!titles[section.role]||!section.sources?.length)throw Error('Invalid lesson section '+lesson.id);
  const parts=section.sources.map(id=>{if(used.has(id)||!sources.has(id))throw Error('Missing or duplicate source '+id);used.add(id);return sources.get(id);});
  const title=titles[section.role],single=parts.length===1;
  const exercise=single?copy(parts[0].exercise):{version:1,id:lesson.id+'-'+section.role,kind:'stage',title,progressive:true,requireCheckBeforeNext:true,exercises:parts.map(s=>({id:s.exercise.id,exercise:copy(s.exercise)}))};
  if(exercise.kind==='stage')exercise.unifiedProgression=true;
  return {...parts[0],menu:title,navigationTitle:title,section:'tasks',role:section.role,exercise,
   ...(single?{}:{legacySources:parts.map(s=>({id:s.exercise.id,signature:JSON.stringify(s.exercise)})),exerciseAliases:parts.map(s=>s.exercise.id)}),
   guide:{...parts[0].guide,time:parts.reduce((n,s)=>n+(parseFloat(s.guide?.time)||0),0)+' min'}};
 });
 const untouched=lesson.stages.filter(s=>!used.has(s.exercise.id));
 if(untouched.some(s=>s.section!=='self-study'))throw Error('Unassigned classroom exercise in '+lesson.id);
 return {...lesson,stages:[...stages,...untouched]};
}
// Navigation blocks describe the existing stages; they do not compose exercises.
const navigationRoles={opening:'opening',words:'words',wordPractice:'words',focus:'language',practice:'language',reading:'language',listening:'language',language:'language',final:'final'};
const navigationTitles={opening:'Speaking',words:'Discovery Words',language:'Lexis / Grammar',final:'Speaking'};
function navigationRole(stage,index,count){
 if(Object.prototype.hasOwnProperty.call(stage,'navigationBlock')){
  if(!Object.prototype.hasOwnProperty.call(navigationTitles,stage.navigationBlock))throw Error('Invalid navigation block '+String(stage.navigationBlock));
  return stage.navigationBlock;
 }
 if(Object.prototype.hasOwnProperty.call(navigationRoles,stage.role))return navigationRoles[stage.role];
 // Legacy headings are a fallback. A renderer kind, code or ordinal never
 // establishes the teaching purpose of an exercise on its own.
 const headings=[stage.navigationTitle,stage.menu,stage.exercise?.title].filter(v=>typeof v==='string').map(v=>v.trim().toLowerCase().replace(/^\d+[.)]\s*/,''));
 if(headings.some(v=>/^(?:opening|initial|first)\s+speaking\b|^speaking\s*(?:[·:—-]\s*)?(?:opening|начало)(?:$|\s)|^(?:начальный|начальное)\s+speaking\b|^первая попытка(?: говорить)?$/.test(v)))return 'opening';
 if(headings.some(v=>/^(?:final|result)\s+speaking\b|^speaking\s*(?:[·:—-]\s*)?(?:final|result|результат|итог)(?:$|\s)|^(?:финальный|итоговый)\s+speaking\b|^самостоятельный финал$/.test(v)))return 'final';
 if(headings.some(v=>/^(?:new\s+|discovery\s+)?words\b|^word\s+(?:peek|practice)\b|^(?:работа со словами|новые слова|практика слов|слова)(?:\s|$)|^listen\s*&\s*repeat\s*[·:—-]\s*words\b/.test(v)))return 'words';
 if(headings.some(v=>/^(?:opening\s+)?speaking(?:\s+task)?$/.test(v))){
  if(index===0)return 'opening';
  if(index===count-1)return 'final';
 }
 return 'language';
}
function withBlocks(lesson){
 const stages=lesson.stages||[],classroom=stages.filter(stage=>stage.section!=='self-study');
 // A pack containing only self-study materials keeps its separate navigation.
 if(stages.length&&!classroom.length)return lesson;
 const review=lesson.review===true||/(?:^|[\s·:—-])(?:review|повторение)(?:$|[\s·:—-])/i.test(lesson.title||'');
 const descriptions=review?{
  opening:'Первая попытка выполнить знакомую речевую задачу.',
  words:'Вспоминаем и тренируем уже изученные слова.',
  language:'Повторяем знакомые выражения и правила и практикуем их применение.',
  final:'Повторяем речевую задачу и сравниваем результат с первой попыткой.'
 }:{
  opening:'Первая попытка выполнить речевую задачу урока.',
  words:'Разбираем значения слов, произносим их и выполняем практические задания.',
  language:'Замечаем конструкции в примерах, разбираем правила и тренируем их применение.',
  final:'Повторяем речевую задачу и сравниваем результат с первой попыткой.'
 };
 const blocks=['opening','words','language','final'].map((id,index)=>({id,number:index+1,title:navigationTitles[id],description:descriptions[id],stageIds:[],...(id==='final'?{compareWith:'opening'}:{})}));
 const byId=new Map(blocks.map(block=>[block.id,block])),used=new Set();
 classroom.forEach((stage,index)=>{
  const id=stage.exercise?.id||stage.id;
  if(!id||used.has(id))throw Error('Missing or duplicate navigation stage ID in '+lesson.id);
  used.add(id);byId.get(navigationRole(stage,index,classroom.length)).stageIds.push(id);
 });
 return {...lesson,blocks};
}
// Import old independent responses once; new groups never overwrite the old keys.
function restore(stage,current,read){
 if(Object.keys(current||{}).length||!stage.legacySources)return current||{};
 const state={};for(const source of stage.legacySources){const value=read(source);if(value&&Object.keys(value).length)state[source.id]=copy(value);}
 return state;
}
// Layout-only edits must not discard existing answers/checks.
function responseSchema(def){
 const value=copy(def);
 function clean(d){
  for(const k of ['unifiedProgression','progressiveQuestions','highlights','feedbackHighlights','guide'])delete d[k];
  if(['presentation','rule-page','audio'].includes(d.kind))return {id:d.id,kind:d.kind};
  if(d.kind==='stage')return {id:d.id,kind:d.kind,exercises:d.exercises.map(b=>({id:b.id,exercise:clean(b.exercise)}))};
  if(d.items)d.items=d.items.map(i=>{delete i.highlights;delete i.feedbackHighlights;return i;});
  return d;
 }
 return clean(value);
}
function compatible(previous,current){try{return JSON.stringify(responseSchema(JSON.parse(previous)))===JSON.stringify(responseSchema(JSON.parse(current)));}catch(_){return false;}}
async function loadResponse(stage,load,decode=v=>v){
 const saved=await load(stage.exercise.id);if(saved?.response||!stage.legacySources)return saved;
 const rows=await Promise.allSettled(stage.legacySources.map(source=>load(source.id)));
 const old=new Map(stage.legacySources.map((source,i)=>[source.id,rows[i].status==='fulfilled'?decode(rows[i].value?.response||{}):{}]));
 const response=restore(stage,{},source=>old.get(source.id));
 return Object.keys(response).length?{response,is_draft:true}:saved;
}
const api={compose,withBlocks,restore,titles,compatible,loadResponse};if(typeof module!=='undefined')module.exports=api;else root.SpaceWhaleLessonStructure=api;
})(typeof window==='undefined'?globalThis:window);
