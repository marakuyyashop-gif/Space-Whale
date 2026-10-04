/* One shared homework structure; pedagogical roles are explicit, never guessed from kind. */
(function(root){
'use strict';
const copy=v=>JSON.parse(JSON.stringify(v));
const mapping={
 1:{words:'a12w4l1-words',repeat:'a12w4l1-listen-repeat',practice:['a12w4l1-language-practice'],rules:['a12w4l1-language-focus']},
 2:{words:'a12w4l2-picture-word',repeat:'a12w4l2-listen-repeat',practice:['a12w4l2-fox'],rules:['a12w4l2-discovery']},
 3:{words:'L3-M02',repeat:'L3-M03',practice:['L3-M07-meanings','L3-M08-question-meaning'],rules:['L3-M07-rule','L3-M08-explanation']},
 4:{words:'L4-word-translation',repeat:'L4-M03',practice:['L4-question-answer-match'],rules:['L4-question-rule']},
 5:{words:'L5-word-translation',repeat:'L5-M03',practice:['L5-explanation-gaps'],rules:['L5-kind-rule']},
 6:{words:'L3-M02',repeat:'L3-M03',practice:['L4-question-answer-match','L5-explanation-gaps'],rules:['a12w4l1-language-focus','L3-M07-rule','L3-M08-explanation','L4-question-rule','L5-kind-rule']}
};
function build(content,catalog,translations,a21){
 const all=new Map();function walk(d){all.set(d.id,d);d.exercises?.forEach(b=>walk(b.exercise));d.blocks?.forEach(b=>{if(b.exercise)walk(b.exercise);});}content.forEach(l=>l.stages.forEach(s=>walk(s.exercise)));
 const get=id=>{if(!all.has(id))throw Error('Missing homework source '+id);return copy(all.get(id));};
 const packs=Object.entries(mapping).map(([number,source])=>{
  const id=`a1-2-w4-l${number}`,steps=[];
  const add=(role,exercise)=>steps.push({role,exercise});
  add('words',get(source.words));add('listenRepeat',get(source.repeat));source.practice.forEach(id=>add('practice',get(id)));
  source.rules.forEach(id=>{const d=get(id);d.blocks=d.blocks.filter(b=>b.type==='rule');if(!d.blocks.length)throw Error('No full rule '+id);delete d.instruction;d.id+='-homework-rule';d.title=d.blocks[0].title||d.title;add('rule',d);});
  const tasks=['4','5'].includes(number)?content.find(l=>l.id===id).stages.filter(s=>s.section==='self-study').map(s=>copy(s.exercise)):translations.build(Number(number));
  tasks.forEach(d=>add('translation',d));
  return {id,version:'20261004-2',level:'A1.2',title:catalog.lessons.find(l=>l.id===id).title,steps,reference:copy(steps.find(s=>s.role==='rule').exercise),exercises:steps.filter(s=>!['rule','listenRepeat'].includes(s.role)).map(s=>copy(s.exercise))};
 });
 if(a21)for(const source of a21.mapping){
  const lesson=content.find(l=>l.id===source.id);if(!lesson)throw Error('Missing A2 homework lesson '+source.id);
  const steps=[{role:'words',exercise:get(source.words)},{role:'listenRepeat',exercise:get(source.repeat)},...source.practice.map(id=>({role:'practice',exercise:get(id)})),...source.rules.map(id=>{const d=get(id);d.blocks=d.blocks.filter(b=>b.type==='rule');delete d.instruction;d.id+='-homework-rule';return {role:'rule',exercise:d};}),...a21.build(source.key).map(exercise=>({role:'translation',exercise}))];
  packs.push({id:source.id,version:'20261004-a21',level:'A2.1',title:lesson.topic,steps,reference:copy(steps.find(s=>s.role==='rule').exercise),exercises:steps.filter(s=>!['rule','listenRepeat'].includes(s.role)).map(s=>copy(s.exercise))});
 }
 for(const pack of packs){
  pack.version='20261004-flow-3';
  for(const step of pack.steps)if(step.role==='translation')for(const item of step.exercise.items)item.normalization='translation';
  pack.exercises=pack.steps.filter(s=>!['rule','listenRepeat'].includes(s.role)).map(s=>copy(s.exercise));
 }
 return packs;
}
if(typeof module!=='undefined')module.exports={build,mapping};else root.SpaceWhaleHomeworkContent={build,mapping};
})(typeof window==='undefined'?globalThis:window);
