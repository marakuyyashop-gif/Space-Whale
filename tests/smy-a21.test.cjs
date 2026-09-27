const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {parseHTML}=require('linkedom');
const kit=require('../exercise-kit.js');
function load(media={}){
 const app={SpaceWhaleExerciseKit:kit};
 for(const file of ['course-content.js','course-content-module4-34.js'])vm.runInNewContext(fs.readFileSync(require.resolve('../'+file),'utf8'),{window:app});
 const before=JSON.stringify(app.SpaceWhaleContent);
 Object.assign(app.SpaceWhaleLessonMedia,media);
 vm.runInNewContext(fs.readFileSync(require.resolve('../course-content-smy-a21.js'),'utf8'),{window:app});
 assert.equal(JSON.stringify(app.SpaceWhaleContent.slice(0,-2)),before);
 return app;
}
const app=load(),lessons=app.SpaceWhaleContent.slice(-2),find=(id,data=app)=>data.SpaceWhaleContent.flatMap(l=>l.stages).find(s=>s.exercise.id===id).exercise;
function setup(def,config={}){
 const {document,window}=parseHTML('<html><body><main></main></body></html>');
 const create=document.createElement.bind(document);document.createElement=tag=>{const el=create(tag);if(tag==='audio'){el.pause=()=>{};el.paused=true;}return el;};
 const host=document.querySelector('main'),changes=[];
 const handle=kit.mount(host,def,{syncChecks:true,...config,onChange:value=>{changes.push(value);config.onChange?.(value);}});
 const fire=(el,type)=>{assert.ok(el);el.dispatchEvent(new window.Event(type,{bubbles:true,cancelable:true}));};
 const click=label=>{const el=[...host.querySelectorAll('button,summary')].find(b=>b.getAttribute('aria-label')===label||b.textContent===label);assert.ok(el,label);assert.ok(!el.disabled,label);fire(el,'click');};
 return {host,handle,changes,fire,click};
}
function walk(def,fn){fn(def);for(const b of def.exercises||[])walk(b.exercise,fn);for(const b of def.blocks||[])if(b.exercise)walk(b.exercise,fn);}
test('two Smy lessons append to A2.1 module 1 without replacing existing lessons',()=>{
 const catalog=require('../workspace-catalog.js').createCatalog(app.SpaceWhaleContent,[]);
 assert.deepEqual(Array.from(catalog.topics({view:'library',level:'A2.1',whale:1}),l=>l.title),['Уроки для Smy 1','Уроки для Smy 2']);
 for(const [i,l] of lessons.entries()){
  assert.equal(l.level,'A2.1');assert.equal(l.whale,1);assert.equal(l.stages.length,7+i);
  assert.equal(l.stages.reduce((sum,s)=>sum+parseFloat(s.guide.time),0),28);assert.equal(l.feedback.minutes,2);assert.equal(l.durationMinutes,30);
  assert.equal(l.stages.filter(s=>s.menu==='Listening')[0].guide.time,'5 min');
  const route=catalog.normalize({view:'library',level:'A2.1',whale:1,lesson:l.id,exercise:l.stages[0].exercise.id});
  assert.equal(route.exercise,l.stages[0].exercise.id);
 }
});
test('every stage mounts with no teacher notes, keys or fabricated media requests',()=>{
 for(const lesson of lessons)for(const stage of lesson.stages){
  kit.validate(stage.exercise);const s=setup(stage.exercise);
  assert.ok(!/TEACHER:|KEY:|KEY ORDER:|Проверять целевое|При затруднении/.test(s.host.textContent));
  const approved=new Set(Object.values(app.SpaceWhaleLessonMedia).flatMap(slots=>Object.values(slots).filter(s=>s.type==='audio'&&s.src).map(s=>s.src)));
  for(const audio of s.host.querySelectorAll('audio[src]'))assert.ok(approved.has(audio.getAttribute('src')),'Recording comes from the current media registry');
  if(stage.exercise.id==='A2_SEQ_M03')assert.equal(s.host.querySelector('audio[src]'),null);
  for(const image of s.host.querySelectorAll('img[src]'))assert.ok(fs.existsSync(require('node:path').join(__dirname,'..',image.getAttribute('src'))),'Selected lesson image exists');
  for(const d of s.host.querySelectorAll('details'))if(d.querySelector('summary').textContent==='Useful phrases')assert.equal(d.open,true);
  s.handle.destroy();
 }
 const slots=app.SpaceWhaleLessonMedia['a2-1-w1-smy-1'];
 assert.match(slots.A2_SEQ_STORY.script,/My friend was waiting for me at the cinema/);assert.equal(slots.A2_SEQ_E10.script,null);
 assert.equal(find('A2_SEQ_M03').items.length,10);assert.equal(find('A2_MOVE_M03').items.length,7);
});
test('closed tasks preserve authored keys and full-sentence feedback',()=>{
 assert.deepEqual(Array.from(find('A2_SEQ_M04').items,i=>i.correctId),['B','A','C','B','C']);
 const order=find('A2_SEQ_M05').exercises[2].exercise;
 assert.deepEqual(Array.from(order.tokens,t=>t.id),['C','D','B','A','E']);assert.deepEqual(Array.from(order.correctOrder),['B','E','C','D','A']);
 const matching=find('A2_MOVE_M02').exercises[0].exercise;
 assert.deepEqual(Array.from(matching.items,i=>i.correctId),['move-into','jump-over','run-around','climb-up','come-out-of','step-onto']);
 for(const l of lessons)for(const stage of l.stages)walk(stage.exercise,d=>{
  const a={};if(d.kind==='choice'||d.kind==='matching')d.items.forEach(i=>{a[i.id]=i.correctId;});
  if(d.kind==='gaps')d.items.forEach(i=>i.segments.forEach(g=>{if(typeof g!=='string')a[g.id]=g.answers[0];}));
  if(d.kind==='order')a.order=d.correctOrder;
  if(Object.keys(a).length)assert.ok(Object.values(kit.grade(d,a)).every(g=>g==='correct'),d.id);
 });
 const s=setup(find('A2_SEQ_M04'));s.handle.setAnswers({'1':'A','2':'A','3':'A','4':'A','5':'A',__sw_checked:true});
 assert.match(s.host.querySelector('.ek-answer-pairs').textContent,/They made the plan before the other activities/);
});
test('story and question appear together, then one teacher-revealed multiline rule',()=>{
 const def=find('A2_SEQ_M02'),student=setup(def,{navigationReadOnly:true});
 const teacher=setup(def,{onViewChange:v=>student.handle.setViewState(v,false)});
 assert.match(teacher.host.textContent,/First, we went to the park/);assert.ok(teacher.host.querySelector('.ek-question'));
 assert.equal(teacher.host.querySelector('.ek-rule-block'),null);assert.ok(teacher.host.querySelector('.ek-stage-down').disabled);
 teacher.handle.setAnswers({'A2_SEQ_M02-check':{'1':'B',__sw_checked:true}});teacher.click('Show next exercise');
 assert.equal(teacher.host.querySelectorAll('.ek-rule-block').length,1);assert.equal(student.host.querySelectorAll('.ek-rule-block').length,1);
 assert.match(teacher.host.querySelector('.ek-rule-block').textContent,/\n\n/);assert.equal(student.host.querySelector('.ek-stage-navigation').hidden,true);
 const movement=find('A2_MOVE_M04'),info=setup(movement),discovery=movement.exercises[0].exercise;
 assert.equal(info.host.querySelector('.ek-rule-block'),null);assert.equal(info.host.querySelectorAll('.ek-question').length,7);
 assert.equal(info.host.querySelector('.ek-stage-down').disabled,true);
 info.handle.setAnswers({[discovery.id]:{...Object.fromEntries(discovery.items.map(i=>[i.id,i.correctId])),__sw_checked:true}});
 assert.equal(info.host.querySelector('.ek-rule-block'),null);assert.equal(info.host.querySelector('.ek-stage-down').disabled,false);
 info.click('Show next exercise');assert.equal(info.host.querySelectorAll('.ek-rule-block').length,1);
});
test('Listening keeps the source and requires the Order attempt before revealing its transcript',()=>{
 const supplied=load({'a2-1-w1-smy-1':{A2_SEQ_STORY:{src:null},A2_SEQ_STORY_TEXT:{type:'text',text:'Author supplied transcript.'}}});
 const s=setup(find('A2_SEQ_M05',supplied)),player=s.host.querySelector('.ek-audio-player');
 assert.ok(player);assert.equal(player.dataset.state,'pending');assert.match(s.host.textContent,/Аудио пока не добавлено/);
 assert.equal(s.host.querySelector('.ek-order-target'),null);assert.equal(s.host.querySelector('details').hidden,true);
 s.handle.setAnswers({'A2_SEQ_M05-main':{'1':'A',__sw_checked:true}});s.click('Show next exercise');
 assert.equal(s.host.querySelector('.ek-audio-player'),player);assert.equal(s.host.querySelectorAll('.ek-order-target').length,1);
 assert.equal(s.host.querySelectorAll('.ek-bank .ek-token').length,5);
 s.handle.setAnswers({...s.handle.getAnswers(),'A2_SEQ_M05-order':{order:['B','E','C','D','A'],__sw_checked:true}});
 assert.equal(s.host.querySelector('details').hidden,false);assert.ok(!s.host.querySelector('details').open);
});
test('repeated listening details reveal one by one and transcript waits for all three',()=>{
 const supplied=load({'a2-1-w1-smy-2':{A2_MOVE_STORY_TEXT:{type:'text',text:'Author supplied movement transcript.'}}});
 const s=setup(find('A2_MOVE_M06',supplied)),player=s.host.querySelector('.ek-audio-player');
 s.handle.setAnswers({'A2_MOVE_M06-main':{'1':'B',__sw_checked:true}});s.click('Show next exercise');
 assert.match(s.host.textContent,/What did Max do/);assert.ok(!s.host.textContent.includes('What did Sara do'));
 const detail=()=>s.host.querySelector('details');
 s.handle.setAnswers({...s.handle.getAnswers(),'A2_MOVE_M06-details':{'1':'A',__sw_choice_checked:['1'],__sw_choice_revealed:2}});
 assert.match(s.host.textContent,/What did Sara do/);assert.ok(!s.host.textContent.includes('What did everyone do'));
 assert.equal(detail().hidden,true);
 s.handle.setAnswers({...s.handle.getAnswers(),'A2_MOVE_M06-details':{'1':'A','2':'C','3':'B',__sw_choice_checked:['1','2','3'],__sw_choice_revealed:3,__sw_checked:true}});
 assert.equal(detail().hidden,false);assert.ok(!detail().open);assert.equal(s.host.querySelector('.ek-audio-player'),player);
});
test('multiline Writing saves newlines, restores shared answers and reveals examples only after OK',()=>{
 const def=find('A2_SEQ_M06'),s=setup(def),area=s.host.querySelector('textarea');assert.ok(area);
 assert.equal(s.host.querySelectorAll('.ek-writing-input').length,1);assert.equal(s.host.querySelectorAll('details').length,1);
 area.value='First, I waited.\nLater, the bus arrived.';s.fire(area,'input');
 assert.equal(s.handle.getAnswers()['A2_SEQ_M06-writing'].message,area.value);
 s.click('Check answers');const samples=[...s.host.querySelectorAll('details')].find(d=>d.querySelector('summary').textContent==='Possible answers');
 assert.ok(samples);assert.ok(!samples.open);assert.match(s.host.textContent,/Ответ записан/);
 const student=setup(def,{navigationReadOnly:true});student.handle.setAnswers(s.handle.getAnswers());assert.equal(student.host.querySelector('textarea').value,area.value);
 s.handle.setAnswers({'A2_SEQ_M06-writing':{message:'Another\nmessage'}});assert.equal(s.host.querySelector('textarea'),area);assert.equal(area.value,'Another\nmessage');
 s.click('Reset exercise');assert.equal(s.host.querySelector('textarea').value,'');
 const short=setup(find('A2_MOVE_M07'));assert.equal(short.host.querySelectorAll('input.ek-writing-input').length,3);assert.equal(short.host.querySelector('textarea,.ek-writing-hint'),null);
});
test('oral samples need teacher reveal then an explicit disclosure click, never automatic grading',()=>{
 for(const id of ['A2_SEQ_M07','A2_MOVE_M08']){
  const s=setup(find(id));assert.equal(s.host.querySelector('.ek-check'),null);
  assert.ok(![...s.host.querySelectorAll('summary')].some(x=>x.textContent==='Possible answers'));
  assert.equal(s.host.querySelector('.ek-stage-down').disabled,false);s.click('Show next exercise');
  const detail=[...s.host.querySelectorAll('details')].find(d=>d.querySelector('summary').textContent==='Possible answers');
  assert.ok(detail);assert.ok(!detail.open);s.click('Possible answers');assert.equal(detail.open,true);
 }
});
test('future media fills existing IDs, with a separate example step and no invented script',()=>{
 const supplied=load({'a2-1-w1-smy-1':{
  A2_SEQ_P01:{type:'audio',src:'assets/test-word.wav',script:'First'},
  A2_SEQ_E01:{type:'audio',src:'assets/test-example.wav',script:'Exact supplied example.'},
  A2_SEQ_DAY:{type:'image',src:'assets/test-day.webp',width:800,height:600,alt:'Story pictures'}
 }});
 const s=setup(find('A2_SEQ_M03',supplied));assert.equal(s.host.querySelector('audio').src,'assets/test-word.wav');
 s.click('Next phrase');assert.equal(s.host.querySelector('audio').src,'assets/test-example.wav');assert.match(s.host.textContent,/Exact supplied example/);
 const final=setup(find('A2_SEQ_M07',supplied));assert.equal(final.host.querySelector('img').src,'assets/test-day.webp');
});
