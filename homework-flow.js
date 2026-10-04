/* Shared sequence model. All response rendering and checking stay in ExerciseKit. */
(function(root){
'use strict';
function steps(pack){if(pack.steps)return pack.steps;
 const tasks=pack.exercises||[],at=tasks.findIndex(d=>d.kind==='writing');const result=tasks.map(exercise=>({role:exercise.kind==='writing'?'translation':'practice',exercise}));
 if(pack.reference)result.splice(at<0?result.length:at,0,{role:'rule',exercise:pack.reference});return result;
}
const flow=pack=>({version:1,id:pack.id+'-homework-flow',kind:'stage',title:pack.title,progressive:true,requireCheckBeforeNext:true,exercises:steps(pack).map(s=>({id:s.exercise.id,exercise:s.exercise}))});
function progress(pack,answers,kit){const items=steps(pack),revealed=Math.max(1,Number(answers.__seen)||0,Number(answers.revealed)||1);let done=0;for(let i=0;i<items.length;i++){const d=items[i].exercise,a=answers[d.id]||{},graded=Object.keys(kit.grade(d,a)).length>0;if(graded?kit.taskFinished(d,a):(revealed>i+1||a.__sw_skipped))done++;}return {done,total:items.length,complete:done===items.length};}
function summary(def,answers,kit){if(answers.__sw_skipped)return 'Пропущено';const values=Object.values(kit.grade(def,answers));if(!values.length)return 'Материал урока';if(!answers.__sw_checked)return 'Не проверено';const correct=values.filter(x=>x==='correct').length,review=values.filter(x=>x==='review').length;return review?`Ответов: ${values.length} · требуется проверка`:`Верно: ${correct} из ${values.length}${correct<values.length?' · есть ошибки':''}`;}
const api={steps,flow,progress,summary};if(typeof module!=='undefined')module.exports=api;else root.SpaceWhaleHomeworkFlow=api;
})(typeof window==='undefined'?globalThis:window);
