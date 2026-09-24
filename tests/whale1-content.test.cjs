const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const {parseHTML} = require('linkedom');
const kit = require('../exercise-kit.js');
const root = {SpaceWhaleExerciseKit:kit};
vm.runInNewContext(fs.readFileSync(require.resolve('../whale1-content.js'),'utf8'),{window:root});
const lessons = root.SpaceWhaleContent;
function children(def) { return [def,...(def.exercises||[]).flatMap(x=>children(x.exercise)),...(def.blocks||[]).filter(x=>x.exercise).flatMap(x=>children(x.exercise))]; }
const all = lessons.flatMap(l=>l.stages.flatMap(s=>children(s.exercise)));
function mount(def) {
 const {document,window} = parseHTML('<html><body><main></main></body></html>');
 const create=document.createElement.bind(document);
 document.createElement=tag=>{const el=create(tag);if(tag==='select')Object.defineProperty(el,'value',{writable:true,value:''});if(tag==='audio')el.pause=()=>{};return el;};
 const host=document.querySelector('main'); const handle=kit.mount(host,def);
 return {host,handle,window};
}
test('seven catalog lessons and 57 stages render, with no text-input placeholders or scripts leaked',()=>{
 assert.equal(lessons.length,7);assert.equal(lessons.reduce((n,l)=>n+l.stages.length,0),57);
 const ids=all.map(e=>e.id); assert.equal(new Set(ids).size,ids.length);
 for(const lesson of lessons)for(const stage of lesson.stages){
  const {host,handle}=mount(stage.exercise);
  assert.ok(host.querySelector('h2'));assert.ok(!host.textContent.includes('[ … ✎ ]'),stage.sourceId);
  assert.ok(!host.textContent.includes('AUDIO_SCRIPT'));assert.ok(!host.textContent.includes('Скрытая карточка'));
  assert.equal(host.querySelectorAll('img[src="undefined"]').length,0);handle.destroy();
 }
});
test('please is accepted before or after the request; broken syntax is rejected',()=>{
 const def=all.find(e=>e.id==='a1-1-w1-l3-e06-order2');
 assert.equal(kit.grade(def,{order:['t3','t2','t1']}).order,'correct');
 assert.equal(kit.grade(def,{order:['t1','t3','t2']}).order,'correct');
 assert.equal(kit.grade(def,{order:['t2','t1','t3']}).order,'retry');
 const bad=JSON.parse(JSON.stringify(def));bad.acceptedOrders=[['t1','t1','t3']];assert.throws(()=>kit.validate(bad));
});
test('sentence tokens do not reveal the opening capital; proper names keep capitals',()=>{
 for(const def of all.filter(x=>x.kind==='order'))for(const token of def.tokens){
  assert.ok(['Anna','Brown'].includes(token.text)||token.text[0]===token.text[0].toLowerCase(),token.text);
 }
});
test('discovery highlights examples and keeps the rule hidden until expanded',()=>{
 for(const id of ['a1-1-w1-l1-e05','a1-1-w1-l2-e05','a1-1-w1-l6-e04']){
  const {host,handle}=mount(all.find(e=>e.id===id));
  assert.ok(host.querySelector('.ek-rule-text-section strong'));
  const rules=[...host.querySelectorAll('.ek-rule-block')];assert.ok(rules.length);assert.ok(rules.every(el=>el.hidden));
  handle.destroy();
 }
});
test('weather pictures reserve blank areas and do not request missing files or show answers',()=>{
 for(const suffix of ['conditions','temperature']){
  const def=all.find(e=>e.id==='a1-1-w1-l6-e02-'+suffix);const {host,handle}=mount(def);
  assert.equal(host.querySelectorAll('.ek-image-pending').length,def.items.length);
  assert.equal(host.querySelectorAll('img').length,0);
  for(const blank of host.querySelectorAll('.ek-image-pending'))assert.equal(blank.textContent,'');
  handle.destroy();
 }
});
test('complete phone accepts separators but email underscore and hyphen stay distinct',()=>{
 const def=all.find(e=>e.id==='a1-1-w1-l5-e06-gaps');
 assert.equal(kit.grade(def,{'g3-1':'(410) 863-2075'} )['g3-1'],'correct');
 assert.equal(kit.grade(def,{'g2-1':'_','g2-2':'@'})['g2-1'],'retry');
});
