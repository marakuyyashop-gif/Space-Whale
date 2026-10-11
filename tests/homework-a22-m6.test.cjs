const test=require('node:test'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const kit=require('../exercise-kit.js'),source=require('../homework-a22-m6.js');
const packs=JSON.parse(execFileSync(process.execPath,['scripts/build-homework-catalog.cjs','--a22'],{encoding:'utf8'}));

test('A2.2 M6 homework reuses the lesson pictures, recordings, word work, complete rule and grammar task',()=>{
 assert.equal(packs.length,2);
 for(const pack of packs){
  const prefix=pack.id.endsWith('l1')?'A22M6L1':'A22M6L2';
  assert.equal(pack.level,'A2.2');assert.equal(pack.steps.length,20);
  assert.deepEqual(pack.steps.map(s=>s.role).slice(0,5),['words','listenRepeat','practice','rule','practice']);
  assert.ok(pack.steps.slice(5).every(s=>s.role==='translation'&&s.exercise.items.length===1));
  assert.equal(pack.steps[0].exercise.id,prefix+'-M02');
  assert.ok(pack.steps[0].exercise.items.every(i=>i.image.startsWith('Images/Текущие/A2.1/')));
  assert.equal(pack.steps[1].exercise.id,prefix+'-M03');
  assert.ok(pack.steps[1].exercise.items.every(i=>i.audio&&i.exampleAudio));
  assert.equal(pack.steps[2].exercise.id,prefix+'-M04');
  assert.equal(pack.steps[3].exercise.id,prefix+'-M06');
  assert.ok(pack.steps[3].exercise.blocks.length>=3);
  assert.equal(pack.steps[4].exercise.id,prefix+'-M09');
  for(const step of pack.steps)kit.validate(step.exercise);
 }
});

test('every Russian sentence accepts its authored natural variants and rejects reversed meaning',()=>{
 for(const [key,pack] of [['l1',packs[0]],['l2',packs[1]]]){
  const tasks=source.build(key);assert.equal(tasks.length,15);
  for(let i=0;i<tasks.length;i++){
   const item=tasks[i].items[0];assert.equal(item.prompt,pack.steps[i+5].exercise.items[0].prompt);
   assert.ok(item.acceptedAnswers.length>=2);
   for(const answer of item.acceptedAnswers){
    assert.equal(kit.grade(tasks[i],{'1':answer})['1'],'correct',answer);
    assert.equal(kit.grade(tasks[i],{'1':' '+answer.toUpperCase().replaceAll(' ','  ').replace(/[.!?]/g,'')+' '})['1'],'correct',answer);
   }
  }
 }
 assert.equal(kit.grade(source.build('l1')[2],{'1':'I can see anything on the screen.'})['1'],'retry');
 assert.equal(kit.grade(source.build('l2')[3],{'1':'There is somewhere to rent a car here.'})['1'],'retry');
});
