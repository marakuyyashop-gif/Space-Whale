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
const api={compose,restore,titles,compatible,loadResponse};if(typeof module!=='undefined')module.exports=api;else root.SpaceWhaleLessonStructure=api;
})(typeof window==='undefined'?globalThis:window);
