const test=require('node:test'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const kit=require('../exercise-kit.js'),content=require('../homework-a21.js'),{parseHTML}=require('linkedom');
test('24 translated sentences accept authored variants and typography but reject wrong meaning',()=>{
 for(const key of ['move','directions'])for(const task of content.build(key)){
  kit.validate(task);assert.equal(task.items.length,6);
  for(const row of task.items)for(const answer of row.acceptedAnswers){
   const variant='  '+answer.toUpperCase().replaceAll('DO NOT','DON’T').replace(/[.,]/g,'').replaceAll(' ','  ')+'  ';
   assert.equal(kit.grade(task,{[row.id]:variant})[row.id],'correct',answer);
  }
 }
 const m=content.build('move'),d=content.build('directions');
 for(const [task,id,wrong] of [[m[0],'1','Mark climbs up the ladder.'],[m[0],'2','Anna jumped into the puddle.'],[m[1],'2','Jump over this log.'],[d[1],'4','Go along the river but cross the bridge.'],[d[1],'5','Head towards the station but turn right before it.']])assert.equal(kit.grade(task,{[id]:wrong})[id],'retry',wrong);
});
test('A2 packs reuse media/full rules and mount six independent translation fields',()=>{
 const packs=JSON.parse(execFileSync(process.execPath,['scripts/build-homework-catalog.cjs','--a21'],{encoding:'utf8'}));assert.equal(packs.length,2);
 for(const pack of packs){
  assert.deepEqual(pack.steps.map(s=>s.role),['words','listenRepeat','practice','rule','translation','translation']);
  assert.ok(pack.steps[1].exercise.items.every(i=>i.audio));assert.ok(pack.steps[3].exercise.blocks.length);
  for(const {exercise} of pack.steps.slice(-2)){
   const {document}=parseHTML('<html><body><main></main></body></html>'),host=document.querySelector('main');const h=kit.mount(host,exercise,{syncChecks:true});assert.equal(host.querySelectorAll('input').length,6);assert.ok(!host.textContent.includes(exercise.items[0].acceptedAnswers[0]));
   h.setAnswers(Object.fromEntries([...exercise.items.map(i=>[i.id,'wrong']),['__sw_checked',true]]));assert.ok(host.textContent.includes(exercise.items[0].acceptedAnswers[0]));h.destroy();
  }
 }
});
test('checked multiple select exposes explicit accessible results and clears them on edit',()=>{
 const def={version:1,id:'feedback-choice',kind:'choice',title:'Choose.',multiple:true,items:[{id:'1',prompt:'Choose both.',options:[{id:'a',text:'A'},{id:'b',text:'B'},{id:'c',text:'C'}],correctIds:['a','b']}]};
 const {document}=parseHTML('<html><body><main></main></body></html>'),host=document.querySelector('main');const h=kit.mount(host,def,{syncChecks:true});
 h.setAnswers({'1':['a','b'],__sw_checked:true});const badge=host.querySelector('.ek-result-symbol');assert.equal(badge.dataset.result,'correct');assert.equal(badge.getAttribute('aria-label'),'Correct');h.setAnswers({'1':['c'],__sw_checked:true});assert.equal(host.querySelector('.ek-result-symbol').dataset.result,'retry');h.setAnswers({'1':[]});assert.ok(!host.querySelector('.ek-result-symbol').dataset.result);h.destroy();
});
