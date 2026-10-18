const test=require('node:test');
const assert=require('node:assert/strict');
const {parseHTML}=require('linkedom');
const kit=require('../exercise-kit.js');

const table=()=>({version:1,id:'source-table-contract',kind:'gaps',layout:'table',title:'Complete the table.',inputMode:'text',tableColumns:['Base form','Past simple','Past participle'],items:[
  {id:'row-one',segments:['go',{id:'go-past',answers:['went'],placeholder:'w'},'gone']},
  {id:'row-two',segments:[{id:'see-base',answers:['see']},'saw',{id:'see-participle',answers:['seen']}]}
]});
const matching=()=>({version:1,id:'source-card-audio',kind:'matching',title:'Listen and match.',items:[
  {id:'clip-one',text:'First conversation',audio:'Audio/first.mp3',correctId:'one'},
  {id:'clip-two',text:'Second conversation',audioPending:true,correctId:'two'},
  {id:'plain-card',text:'Read this card',correctId:'three'}
],options:[{id:'two',text:'Train'},{id:'three',text:'Taxi'},{id:'one',text:'Bus'}]});

function setup(def,config={}){
  const {document,window}=parseHTML('<html><body><main></main></body></html>'),create=document.createElement.bind(document);
  document.createElement=tag=>{
    const element=create(tag);
    if(tag==='dialog'){element.showModal=()=>{element.open=true;};element.close=()=>{element.open=false;element.dispatchEvent(new window.Event('close'));};}
    if(tag==='audio'){element.paused=true;element.play=async()=>{element.paused=false;element.dispatchEvent(new window.Event('play'));};element.pause=()=>{element.paused=true;element.dispatchEvent(new window.Event('pause'));};}
    return element;
  };
  const host=document.querySelector('main'),changes=[];
  const mount=kit.mount(host,def,{...config,onChange:value=>changes.push(value)});
  const fire=(element,type)=>{assert.ok(element);element.dispatchEvent(new window.Event(type,{bubbles:true,cancelable:true}));};
  const click=label=>fire([...host.querySelectorAll('button')].find(button=>button.textContent===label||button.getAttribute('aria-label')===label||button.querySelector('.ek-option-label')?.textContent===label),'click');
  const fill=(label,value)=>{const input=[...host.querySelectorAll('input')].find(field=>field.getAttribute('aria-label')===label);input.value=value;fire(input,'input');return input;};
  return {host,mount,changes,fire,click,fill};
}

test('response tables validate column structure and retain existing gap IDs and grading',()=>{
  const def=table();assert.equal(kit.validate(def),def);
  assert.deepEqual(kit.grade(def,{'go-past':'went','see-base':'see','see-participle':'wrong'}),{'go-past':'correct','see-base':'correct','see-participle':'retry'});
  for(const columns of [undefined,[],['One'],Array(7).fill('Column'),['One',' '],['One',2]]){
    assert.throws(()=>kit.validate({...def,tableColumns:columns}),/tableColumns|table column/);
  }
  assert.throws(()=>kit.validate({...def,items:[{id:'bad-row',segments:['go',{id:'past',answers:['went']}]}]}),/Table rows/);
  assert.throws(()=>kit.validate({...def,layout:'sentences'}),/tableColumns requires/);
  assert.throws(()=>kit.validate({...def,items:[{id:'bad-cell',segments:['go',null,'gone']}]}),/gap id/);
  assert.throws(()=>kit.validate({...def,items:[{id:'duplicate',segments:[{id:'same',answers:['a']},{id:'same',answers:['b']},'c']}]}),/Duplicate gap ID/);
});

test('response tables mount real cells, preserve prefills and check/reset/hydrate flat answers',()=>{
  const s=setup(table()),grid=s.host.querySelector('table');assert.ok(grid.closest('.ek-gap-table-wrap'));
  assert.equal(grid.getAttribute('aria-label'),'Complete the table.');
  assert.deepEqual([...grid.querySelectorAll('thead th')].map(cell=>cell.textContent),['','Base form','Past simple','Past participle']);
  assert.equal(grid.querySelectorAll('thead th[scope=col]').length,4);
  const rows=[...grid.querySelectorAll('tbody tr')];assert.equal(rows.length,2);
  assert.deepEqual(rows.map(row=>row.querySelector('th[scope=row]').textContent),['1','2']);
  assert.deepEqual(rows.map(row=>row.querySelectorAll('td').length),[3,3]);
  assert.equal(rows[0].querySelector('td').textContent,'go');assert.equal(rows[0].lastElementChild.textContent,'gone');
  const past=s.fill('Row 1, Past simple','went');s.fill('Row 2, Base form','see');s.fill('Row 2, Past participle','wrong');s.click('OK');
  assert.equal(past.dataset.feedback,'correct');assert.equal(s.host.querySelectorAll('input[data-feedback=retry]').length,1);
  const corrections=[...s.host.querySelectorAll('.ek-answer-pairs>li')];assert.equal(corrections.length,2);
  assert.match(corrections[0].textContent,/go · went · gone/);assert.match(corrections[1].textContent,/see · saw · seen/);
  assert.deepEqual(corrections.map(row=>row.getAttribute('value')),['1','2']);
  const count=s.changes.length;s.mount.setAnswers({'go-past':'remote','see-base':'see','see-participle':'seen'});
  assert.equal(s.changes.length,count);assert.equal(s.host.querySelector('input'),past);assert.equal(past.value,'remote');
  assert.equal(s.host.querySelector('.ek-correction'),null);
  s.click('Reset exercise');assert.deepEqual(s.mount.getAnswers(),{});assert.equal(s.host.querySelectorAll('input[value=""]').length,3);
  assert.equal(s.host.querySelectorAll('tbody tr').length,2);
  const locked=setup(table(),{readOnly:true});assert.equal(locked.host.querySelectorAll('input:disabled').length,3);
});

test('table dropdowns use their existing picker and keyed flat state',()=>{
  const def=table();def.inputMode='select';
  def.items.forEach(item=>item.segments.forEach(cell=>{if(typeof cell!=='string')cell.options=[cell.answers[0],'another'];}));
  const s=setup(def);assert.equal(s.host.querySelectorAll('tbody td .ek-choice-trigger').length,3);
  s.fire(s.host.querySelector('.ek-choice-trigger'),'click');s.fire([...s.host.querySelectorAll('.ek-inline-option')].find(option=>option.textContent==='went'),'click');
  assert.deepEqual(s.mount.getAnswers(),{'go-past':'went'});
  s.mount.setAnswers({'go-past':'went','see-base':'see','see-participle':'seen'});s.click('OK');
  assert.equal(s.host.querySelectorAll('.ek-choice-trigger[data-feedback=correct]').length,3);
});

test('matching accepts safe optional card audio and rejects invalid declarations',()=>{
  const def=matching();assert.equal(kit.validate(def),def);
  for(const audio of ['javascript:alert(1)','https://user:secret@example.com/clip.mp3',true])assert.throws(()=>kit.validate({...def,items:[{...def.items[0],audio}]}));
  assert.throws(()=>kit.validate({...def,items:[{...def.items[0],audioPending:'yes'}]}),/audioPending/);
  assert.deepEqual(kit.grade(def,{'clip-one':'one','clip-two':'two','plain-card':'three'}),{'clip-one':'correct','clip-two':'correct','plain-card':'correct'});
});

test('matching card replay reuses the existing player and preserves selection/reset/hydration',async()=>{
  const s=setup(matching()),cards=[...s.host.querySelectorAll('.ek-card')],audio=cards[0].querySelector('audio'),play=cards[0].querySelector('.ek-repeat-play');
  assert.equal(audio.src,'Audio/first.mp3');assert.equal(audio.dataset.ekAudioKey,'source-card-audio:clip-one');
  assert.equal(cards[1].querySelector('audio'),null);assert.equal(cards[1].querySelector('.ek-repeat-play').disabled,true);
  assert.equal(cards[2].querySelector('.ek-repeat-audio'),null);
  s.fire(play,'click');await Promise.resolve();assert.equal(audio.paused,false);s.fire(play,'click');assert.equal(audio.paused,true);
  s.fire(cards[0].querySelector('.ek-match-slot'),'click');s.click('Bus');assert.equal(s.mount.getAnswers()['clip-one'],'one');
  s.click('OK');assert.equal(cards[0].querySelector('.ek-match-slot').getAttribute('data-feedback'),'correct');
  const count=s.changes.length;s.mount.setAnswers({'clip-one':'one','clip-two':'two','plain-card':'three'});assert.equal(s.changes.length,count);assert.equal(s.host.querySelector('audio'),audio);
  s.click('OK');assert.equal(s.host.querySelectorAll('.ek-match-slot[data-feedback=correct]').length,3);
  s.click('Reset exercise');assert.deepEqual(s.mount.getAnswers(),{});assert.equal(s.host.querySelectorAll('.ek-card-audio').length,2);
  const pupil=setup(matching(),{audioReadOnly:true});assert.equal(pupil.host.querySelector('.ek-repeat-play').disabled,true);
  pupil.fire(pupil.host.querySelector('.ek-repeat-play'),'click');await Promise.resolve();assert.equal(pupil.host.querySelector('audio').paused,true);
});
