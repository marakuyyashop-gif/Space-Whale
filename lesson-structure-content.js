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
// Reviewed legacy stage purposes. This metadata adds no tasks and does not move,
// group or rewrite them; a later authored role always takes precedence.
const legacyRoles={
 'a1-1-w1-l1':[
  ['opening','a1-1-w1-l1-e01-text'],['language','a1-1-w1-l1-e02','a1-1-w1-l1-e03-repeat','a1-1-w1-l1-e04','a1-1-w1-l1-e05','a1-1-w1-l1-e06-repeat','a1-1-w1-l1-e07-choice'],['final','a1-1-w1-l1-e08']],
 'a1-1-w1-l2':[
  ['opening','a1-1-w1-l2-e01-text'],['language','a1-1-w1-l2-e02','a1-1-w1-l2-e03-repeat','a1-1-w1-l2-e04-choice','a1-1-w1-l2-e05','a1-1-w1-l2-e06','a1-1-w1-l2-e07-repeat','a1-1-w1-l2-e08-choice'],['final','a1-1-w1-l2-e09']],
 'a1-1-w1-l3':[
  ['opening','a1-1-w1-l3-e01-text'],['words','a1-1-w1-l3-e02','a1-1-w1-l3-e03-rule','a1-1-w1-l3-e04'],['language','a1-1-w1-l3-e05-rule','a1-1-w1-l3-e06','a1-1-w1-l3-e07-gaps'],['final','a1-1-w1-l3-e08']],
 'a1-1-w1-l4':[
  ['words','a1-1-w1-l4-e01-text','a1-1-w1-l4-e02-rule','a1-1-w1-l4-e03','a1-1-w1-l4-e04','a1-1-w1-l4-e05','a1-1-w1-l4-e07'],['language','a1-1-w1-l4-e06-rule','a1-1-w1-l4-e08-gaps'],['final','a1-1-w1-l4-e09']],
 'a1-1-w1-l5':[
  ['words','a1-1-w1-l5-e01-gaps','a1-1-w1-l5-e02','a1-1-w1-l5-e03-repeat'],['language','a1-1-w1-l5-e04-rule','a1-1-w1-l5-e05-choice','a1-1-w1-l5-e06-gaps','a1-1-w1-l5-e07-text'],['final','a1-1-w1-l5-e08']],
 'a1-1-w1-l6':[
  ['opening','a1-1-w1-l6-e01-text'],['words','a1-1-w1-l6-e02','a1-1-w1-l6-e03'],['language','a1-1-w1-l6-e04','a1-1-w1-l6-e05-repeat','a1-1-w1-l6-e06','a1-1-w1-l6-e07-choice'],['final','a1-1-w1-l6-e08']],
 'a1-1-w1-l7':[
  ['opening','a1-1-w1-l7-e01-text'],['language','a1-1-w1-l7-e02-choice','a1-1-w1-l7-e03-choice','a1-1-w1-l7-e04','a1-1-w1-l7-e05','a1-1-w1-l7-e07'],['final','a1-1-w1-l7-e06-text']],
 'a1-2-w4-l1':[
  ['opening','a12w4l1-opening'],['words','a12w4l1-words','a12w4l1-listen-repeat','a12w4l1-word-choice','a12w4l1-word-type'],['language','a12w4l1-listening','a12w4l1-language-focus','a12w4l1-language-practice','a12w4l1-short-production'],['final','a12w4l1-final-speaking']],
 'a1-2-w4-l2':[
  ['opening','a12w4l2-opening'],['words','a12w4l2-picture-word','a12w4l2-pronunciation'],['language','a12w4l2-context','a12w4l2-discovery','a12w4l2-controlled','a12w4l2-articles','a12w4l2-writing'],['final','a12w4l2-final-speaking']],
 'a1-2-w4-l3':[
  ['opening','L3-M01'],['words','L3-M02','L3-M03','L3-M04','L3-M05'],['language','L3-M06','L3-M07','L3-M08','L3-M09','L3-M10'],['final','L3-M11']],
 'a2-1-w1-smy-2':[['opening','A2_MOVE_M01']],
 'b1-1-w1-misha-1':[['words','B1D1-M03']],
 'first-day-school':[['final','first-day-speaking']],
 'school-fair':[['words','fair-picture-word','fair-typed-gaps','fair-bank-gaps','fair-listen-words'],['final','fair-speaking']]
};
const legacyRoleById=Object.fromEntries(Object.entries(legacyRoles).map(([id,groups])=>[id,new Map(groups.flatMap(([role,...ids])=>ids.map(source=>[source,role])))]));
function apply(lessons){return lessons.map(lesson=>{
 const roles=legacyRoleById[lesson.id];
 if(roles)lesson={...lesson,stages:lesson.stages.map(stage=>{
  const role=roles.get(stage.exercise.id);
  return role&&!stage.role&&!Object.prototype.hasOwnProperty.call(stage,'navigationBlock')?{...stage,role}:stage;
 })};
 return plans[lesson.id]&&plans[lesson.id].every(([, ...ids])=>ids.every(id=>lesson.stages.some(s=>s.exercise.id===id)))?{...lesson,structure:plans[lesson.id].map(([role,...sources])=>({role,sources}))}:lesson;
});}
if(typeof module!=='undefined')module.exports={apply,plans,legacyRoles};else root.SpaceWhaleLessonStructureContent={apply,plans,legacyRoles};
})(typeof window==='undefined'?globalThis:window);
