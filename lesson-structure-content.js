/* Explicit roles for reviewed lessons. New lessons author the same structure field. */
(function(root){
'use strict';
const plans={
 'a1-2-w4-l4':[
 ['opening','L4-M01'],['words','L4-M02','L4-M03'],['wordPractice','L4-word-practice'],['focus','L4-discovery-rule'],['practice','L4-question-answer-match','L4-questions-for-answers'],['listening','L4-neighbors-listening'],['final','L4-M11']],
 'a1-2-w4-l5':[
 ['opening','L5-M01'],['words','L5-M02','L5-M03'],['wordPractice','L5-word-initial-gaps'],['focus','L5-M06','L5-kind-rule'],['practice','L5-category-similarity-sort','L5-explanation-matching','L5-explanation-gaps'],['listening','L5-cafe-listening'],['final','L5-M09']],
 'a2-1-w1-smy-3':[
 ['opening','A2_DIR_M01'],['words','A2_DIR_M02','A2_DIR_M03'],['focus','A2_DIR_M04'],['practice','A2_DIR_PRACTICE'],['listening','A2_DIR_M06'],['final','A2_DIR_M07']],
 'b1-1-w1-misha-2':[
 ['opening','B1D2-M01'],['words','B1D2-M02','B1D2-M03'],['wordPractice','B1D2-M04'],['reading','B1D2-M05'],['focus','B1D2-M06'],['practice','B1D2-M07','B1D2-M09'],['listening','B1D2-M08'],['final','B1D2-M10']]
};
function apply(lessons){return lessons.map(lesson=>plans[lesson.id]&&plans[lesson.id].every(([, ...ids])=>ids.every(id=>lesson.stages.some(s=>s.exercise.id===id)))?{...lesson,structure:plans[lesson.id].map(([role,...sources])=>({role,sources}))}:lesson);}
if(typeof module!=='undefined')module.exports={apply,plans};else root.SpaceWhaleLessonStructureContent={apply,plans};
})(typeof window==='undefined'?globalThis:window);
