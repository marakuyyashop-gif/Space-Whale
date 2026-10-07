const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const kit=require('../exercise-kit.js');
const app={SpaceWhaleExerciseKit:kit,SpaceWhaleLessonMedia:{},SpaceWhaleContent:[]};
const run=file=>vm.runInNewContext(fs.readFileSync(require.resolve('../'+file),'utf8'),{window:app});
run('course-content-a22-m4-l11.js');
run('course-content-a22-m4-l12.js');

const lessons=app.SpaceWhaleContent.filter(l=>['a2-2-w4-l11','a2-2-w4-l12'].includes(l.id));
const walk=(def,fn)=>{fn(def);(def.exercises||[]).forEach(block=>walk(block.exercise,fn));};

test('every objective exercise in A2.2 M4 L11-L12 has a machine-checkable answer key',()=>{
  const issues=[];
  for(const lesson of lessons)for(const stage of lesson.stages)walk(stage.exercise,def=>{
    if(def.kind==='matching'){
      const options=new Set((def.options||[]).map(x=>x.id));
      for(const item of def.items||[])if(!item.correctId||!options.has(item.correctId))issues.push(def.id+': matching '+item.id);
    }else if(def.kind==='choice'){
      for(const item of def.items||[]){
        if(def.multiple){
          if(!Array.isArray(item.correctIds)||!item.correctIds.length)issues.push(def.id+': multiple choice '+item.id);
        }else if(item.correctId==null)issues.push(def.id+': choice '+item.id);
      }
    }else if(def.kind==='sort'){
      const groups=new Set((def.groups||[]).map(x=>x.id));
      for(const item of def.items||[])if(!item.correctId||!groups.has(item.correctId))issues.push(def.id+': sort '+item.id);
    }else if(def.kind==='gaps'){
      for(const item of def.items||[])for(const segment of item.segments||[])if(typeof segment!=='string'&&(!Array.isArray(segment.answers)||!segment.answers.length))issues.push(def.id+': gap '+segment.id);
    }else if(def.kind==='order'){
      if((!Array.isArray(def.correctOrder)||!def.correctOrder.length)&&(!Array.isArray(def.acceptedOrders)||!def.acceptedOrders.length))issues.push(def.id+': order');
    }else if(def.kind==='writing'){
      if(def.responseMode!=='accepted')issues.push(def.id+': writing is not accepted');
      for(const item of def.items||[])if(!Array.isArray(item.acceptedAnswers)||!item.acceptedAnswers.length)issues.push(def.id+': writing '+item.id);
    }
  });
  assert.deepEqual(issues,[]);
});

test('L11 objective writing accepts the authored correct answers',()=>{
  const lesson=lessons.find(l=>l.id==='a2-2-w4-l11');
  const practice=lesson.stages.find(s=>s.exercise.id==='A22M4L11-M08').exercise;
  const answers={
    '1':'Five minutes ago, I missed the bus.',
    '2':'We got a flat tire ten minutes ago.',
    '3':'The flight is canceled.',
    '4':'There is roadwork near the hotel.'
  };
  assert.ok(Object.values(kit.grade(practice,answers)).every(v=>v==='correct'));
});

test('L12 objective writing grades target replies instead of returning teacher review',()=>{
  const lesson=lessons.find(l=>l.id==='a2-2-w4-l12');
  for(const id of ['A22M4L12-M08','A22M4L12-M10-1','A22M4L12-M10-2','A22M4L12-M10-3']){
    let found;
    for(const stage of lesson.stages)walk(stage.exercise,def=>{if(def.id===id)found=def;});
    assert.ok(found,id);
    assert.equal(found.responseMode,'accepted');
    for(const item of found.items)assert.ok(item.acceptedAnswers?.length,id+' '+item.id);
  }
});

test('Speaking prompts stay compact while keeping the assigned images',()=>{
  const l11=lessons.find(l=>l.id==='a2-2-w4-l11');
  const l12=lessons.find(l=>l.id==='a2-2-w4-l12');
  const find=(lesson,id)=>lesson.stages.find(s=>s.exercise.id===id).exercise;
  for(const [lesson,id] of [[l11,'A22M4L11-M01'],[l11,'A22M4L11-M10'],[l12,'A22M4L12-M01'],[l12,'A22M4L12-M11']]){
    const speaking=find(lesson,id);
    assert.ok(speaking.image?.image,id);
    assert.ok(speaking.task?.text.length<190,id);
  }
  assert.equal(find(l12,'A22M4L12-M11').task.bullets,undefined);
});
