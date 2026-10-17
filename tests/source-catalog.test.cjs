const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const {parseHTML}=require('linkedom'),kit=require('../exercise-kit.js'),{createCatalog}=require('../workspace-catalog.js');
const root=path.join(__dirname,'..'),html=fs.readFileSync(path.join(root,'classroom.html'),'utf8');
const files=[...html.matchAll(/<script src="([^"?]+)(?:\?[^\"]*)?"/g)].map(match=>match[1]).filter(file=>/^(template-source-|template-gallery)/.test(file));
const window={SpaceWhaleExerciseKit:kit},context=vm.createContext({window});
for(const file of files)vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
const templates=JSON.parse(JSON.stringify(window.SpaceWhaleTemplates)),index=JSON.parse(JSON.stringify(window.SpaceWhaleSourceIndex));
const manifest=require('../docs/exercise-source-manifest.json');
function definitions(def){return [def,...(def.exercises||[]).flatMap(block=>definitions(block.exercise)),...(def.blocks||[]).filter(block=>block.type==='exercise').flatMap(block=>definitions(block.exercise))];}
function mount(def){
 const {document,window:dom}=parseHTML('<html><body><main></main></body></html>'),create=document.createElement.bind(document);
 document.createElement=tag=>{const el=create(tag);if(tag==='audio'){el.paused=true;el.currentTime=0;el.pause=()=>{};el.play=async()=>{};}if(tag==='dialog'){el.showModal=()=>{el.open=true;};el.close=()=>{el.open=false;};}return el;};
 const host=document.querySelector('main'),changes=[];
 const handle=kit.mount(host,def,{onChange:value=>changes.push(value)});return {host,handle,changes,dom};
}
test('actual classroom loads exactly the source leaf codes, including later Words and Listening additions',()=>{
 const expected=manifest.entries.filter(entry=>entry.role!=='parent').map(entry=>entry.code).sort();
 assert.equal(expected.length,79);assert.deepEqual(templates.map(def=>def.code).sort(),expected);assert.equal(new Set(templates.map(def=>def.id)).size,79);
 const canonical=new Map(index.entries.map(entry=>[entry.code,entry]));
 for(const def of templates){assert.equal(def.catalogFamily,def.code[0]);assert.equal(def.catalogTitle,canonical.get(def.code).name);assert.equal(def.label,`${def.code} · ${def.catalogTitle}`);assert.ok(def.description.trim());kit.validate(def);}
 assert.ok(templates.some(def=>def.code==='W05'));assert.ok(templates.some(def=>def.code==='L18'));
 assert.ok(!templates.some(def=>['W03','E10'].includes(def.code)));assert.ok(templates.every(def=>!['I','A'].includes(def.catalogFamily)));
});
test('one family catalog exposes code rows and preserves source routes and old preview links',()=>{
 const catalog=createCatalog([],templates),groups=catalog.topics({view:'templates'});
 assert.deepEqual(groups.map(group=>[group.templateFamily,group.stages.length]),[['W',6],['P',2],['D',4],['R',4],['E',29],['Q',2],['L',18],['T',12],['S',2]]);
 assert.equal(catalog.normalize('?view=templates').lesson,'');
 assert.ok(!groups.some(group=>['templates-materials','templates-compositions','templates'].includes(group.id)));
 const aliases=new Set();
 for(const group of groups)for(const stage of group.stages){
  const def=stage.exercise,route=catalog.normalize(`?view=templates&lesson=${group.id}&exercise=${def.id}`);
  assert.equal(route.lesson,group.id);assert.equal(route.exercise,def.id);assert.deepEqual(catalog.normalize(catalog.query(route)),route);
  for(const alias of def.legacyIds){assert.ok(!aliases.has(alias),alias);aliases.add(alias);const old=catalog.normalize(`?view=templates&lesson=templates&exercise=${alias}`);assert.equal(old.exercise,def.id);assert.equal(old.lesson,group.id);}
 }
 for(const def of [...window.SpaceWhaleLegacyTemplates,...window.SpaceWhaleTemplateExamples])assert.ok(aliases.has(def.id),def.id);
});
test('W02 uses the shared translation row while W03 keeps the definition row',()=>{
 const translation=templates.find(def=>def.code==='W02');
 assert.equal(translation.layout,'word-translation');
 const view=mount(translation);
 assert.equal(view.host.querySelectorAll('.ek-word-translation-card').length,translation.items.length);
 assert.equal(view.host.querySelectorAll('.ek-vocabulary-slot').length,translation.items.length);
 view.handle.destroy();
 for(const code of ['W03A','W03B'])assert.ok(definitions(templates.find(def=>def.code===code)).some(def=>def.layout==='word-definition'));
});
test('Words catalog uses structural placeholders with stable keys, option order and media references',()=>{
 const words=templates.filter(def=>def.catalogFamily==='W');
 const optionOrders={W01:['suit','coat','hat','blouse','sweater','skirt'],W02:['answer-4','answer-1','answer-6','answer-3','answer-2','answer-5'],W03A:['answer-3','answer-1','answer-4','answer-2'],W03B:['answer-2','answer-4','answer-1','answer-3'],W04:['shop','clothing','food','furniture','building','drink'],W05:['answer-3','answer-1','answer-4','answer-2']};
 for(const card of words){
  const def=definitions(card).find(def=>['matching','image-label'].includes(def.kind));
  assert.deepEqual(def.options.map(option=>option.id),optionOrders[card.code],card.code);
  def.items.forEach((item,index)=>{
   const number=index+1,answer=def.options.find(option=>option.id===item.correctId);
   if(['W01','W04'].includes(card.code)){
    assert.equal(answer.text,`[Word ${number}]`);
    if(card.code==='W04')assert.equal(answer.translation,`[Translation Word ${number}]`);
   }else{
    assert.equal(item.text,`[Word ${number}]`);
    assert.equal(answer.text,card.code==='W02'?`[Translation Word ${number}]`:card.code==='W05'?`[Clue for Word ${number}]`:`[Definition Word ${number}]`);
   }
  });
  const s=mount(card);assert.equal(s.host.querySelectorAll('img').length,0,card.code);assert.doesNotMatch(s.host.textContent,/quiet|helpful|luggage|refund|colleague|neighbor|furniture|cabinet/);s.handle.destroy();
 }
 const pictures=words.find(def=>def.code==='W01');
 assert.deepEqual(pictures.items.map(item=>item.id),['picture-1','picture-2','picture-3','picture-4','picture-5','picture-6']);
 assert.ok(pictures.items.every(item=>item.imagePending===true&&!item.image&&item.sourceArtwork.image));
 const imageLabel=words.find(def=>def.code==='W04');
 assert.equal(imageLabel.imagePending,true);assert.equal(imageLabel.image,undefined);assert.ok(imageLabel.sourceArtwork.image);
 assert.deepEqual(imageLabel.items.map(item=>[item.id,item.x,item.y,item.correctId]),[['cabinet',17,9,'furniture'],['tea',50,46,'drink'],['hoodie',67,9,'clothing'],['apartment',17,91,'building'],['pastry',50,91,'food'],['store',83,91,'shop']]);
 const examples=words.find(def=>def.code==='W03B').exercises[0].exercise.blocks[0];
 assert.deepEqual(examples.text.split('\n'),[1,2,3,4].map(number=>`[Example beginning ${number}] [Word ${number}] [Example ending ${number}]`));
 assert.deepEqual(examples.highlights,[1,2,3,4].map(number=>`[Word ${number}]`));
});
test('Rules catalog retains four explanation roles with reusable bracket content, not topic exercises',()=>{
 const rules=templates.filter(def=>def.catalogFamily==='R');
 assert.deepEqual(rules.map(def=>[def.code,def.id,def.kind]),['R01','R02','R03','R04'].map(code=>[code,`source-${code}`,'rule-page']));
 for(const def of rules){
  const visible=[def.title,...def.blocks.flatMap(block=>[block.title,block.text,block.formula,...(block.examples||[])].filter(Boolean))];
  for(const text of visible){
   assert.match(text,/\[[^\]]+\]/,`${def.code}: substitution content is explicit`);
   assert.equal(text.replace(/\[[^\]]+\]/g,'').replace(/[\s+.,:;!?→/–—-]/g,''),'',`${def.code}: no fixed lesson topic outside placeholders`);
  }
  assert.ok(def.blocks.every(block=>['text','rule'].includes(block.type)),`${def.code}: explanation stays informational`);
 }
 const byCode=Object.fromEntries(rules.map(def=>[def.code,def]));
 assert.match(byCode.R01.blocks[0].text,/Meaning or situation/);
 assert.match(byCode.R02.blocks[0].text,/Criterion for choosing/);
 assert.ok(byCode.R02.blocks.some(block=>block.text?.includes('[Target structure 1]')));
 assert.ok(byCode.R02.blocks.some(block=>block.text?.includes('[Target structure 2]')));
 assert.ok(byCode.R03.blocks.some(block=>block.formula?.includes('[First element]')&&block.formula.includes('[Following element]')));
 const functions=byCode.R04.blocks.filter(block=>block.type==='rule');
 assert.ok(functions.length>=2,'Useful Language retains separate communication functions');
 assert.ok(functions.every(block=>/^\[Communication function \d+\]$/.test(block.title)&&block.examples?.length),'Each function retains its own phrases');
});
test('Rules render one summary panel with target-only model emphasis and no answer disclosure',()=>{
 for(const def of templates.filter(card=>card.catalogFamily==='R')){
  const s=mount(def),panel=s.host.querySelector('.ek-rule-summary');
  assert.ok(panel,def.code);assert.equal(s.host.querySelectorAll('.ek-rule-summary').length,1,def.code);
  assert.equal(panel.querySelectorAll('.ek-rule-section').length,def.blocks.length,`${def.code}: all explanation blocks share the panel`);
  assert.equal(s.host.querySelectorAll('details,summary,input,select,textarea,.ek-check,.ek-feedback').length,0,`${def.code}: no answer task or Possible answers`);
  assert.doesNotMatch(s.host.textContent,/Possible answers|Past answers/i,def.code);
  const targets=new Set(def.blocks.flatMap(block=>block.highlights||[]));
  const emphasis=[...panel.querySelectorAll('strong')];
  assert.ok(emphasis.length>0,`${def.code}: target emphasis remains visible`);
  for(const strong of emphasis)assert.ok(targets.has(strong.textContent),`${def.code}: only target fragments are bold`);
  const modelLines=[...panel.querySelectorAll('.ek-example-text,.ek-rule-example')];
  assert.ok(modelLines.length>0,`${def.code}: examples or speech models remain present`);
  if(def.code!=='R04'){
   const contextual=modelLines.filter(line=>line.textContent.includes('[Example beginning'));
   assert.ok(contextual.length>0,`${def.code}: examples retain ordinary surrounding context`);
   for(const line of contextual){assert.equal(line.querySelectorAll('strong').length,1);assert.notEqual(line.textContent,line.querySelector('strong').textContent);}
  }else assert.ok(modelLines.every(line=>line.querySelector('strong')?.textContent===line.textContent),'Useful Language emphasizes each complete target chunk');
  if(def.code==='R03'){
   const formula=panel.querySelector('.ek-rule-formula');
   assert.equal(formula.querySelector('strong').textContent,'[Target structure]');
   assert.equal(formula.querySelectorAll('strong').length,1);
   assert.match(formula.textContent,/^\[First element\] \+ \[Target structure\] \+ \[Following element\]$/);
  }
  assert.equal(s.changes.length,0);s.handle.destroy();
 }
});
test('all source-coded cards use the shared renderer; existing artwork paths resolve and missing audio stays pending',()=>{
 let audioCount=0;
 const checkMedia=node=>{
  if(!node||typeof node!=='object')return;
  if(typeof node.image==='string'&&!/^https?:|^data:/.test(node.image))assert.ok(fs.existsSync(path.join(root,node.image)),node.image);
  if(typeof node.audio==='string')assert.doesNotMatch(node.audio,/test-tone|https?:/,'Do not substitute a tone or remote demo for language audio');
  if(node.audioPending)audioCount++;
  for(const value of Object.values(node))if(value&&typeof value==='object'){if(Array.isArray(value))value.forEach(checkMedia);else checkMedia(value);}
 };
 for(const def of templates){checkMedia(def);const s=mount(def);assert.ok(s.host.querySelector('.ek-title'),def.code);assert.equal(s.host.querySelectorAll('[data-feedback]').length,0,def.code);assert.equal(s.changes.length,0,def.code);s.handle.destroy();assert.equal(s.host.children.length,0,def.code);}
 assert.ok(audioCount>=20);
});
test('source objective keys grade correctly and saved states hydrate without rewriting definitions',()=>{
 let checked=0;
 for(const card of templates)for(const def of definitions(card)){
  const answers={};
  if(def.kind==='order'&&def.correctOrder)answers.order=def.correctOrder;
  else if(def.kind==='gaps')def.items.forEach(item=>item.segments.forEach(segment=>{if(typeof segment!=='string'&&segment.answers)answers[segment.id]=segment.answers[0];}));
  else if(['matching','choice','sort','image-label','writing'].includes(def.kind))def.items.forEach(item=>{if(item.correctIds)answers[item.id]=item.correctIds;else if(item.correctId)answers[item.id]=item.correctId;else if(item.acceptedAnswers)answers[item.id]=item.acceptedAnswers[0];});
  if(!Object.keys(answers).length){assert.ok(!['matching','choice','gaps','order','sort','image-label'].includes(def.kind),`${card.code}/${def.id} needs an objective key`);continue;}
  assert.ok(Object.values(kit.grade(def,answers)).every(result=>result==='correct'),`${card.code}/${def.id}`);
  const original=JSON.stringify(def),s=mount(def);s.handle.setAnswers(answers);assert.deepEqual(s.handle.getAnswers(),answers);assert.equal(s.changes.length,0);assert.equal(JSON.stringify(def),original);s.handle.destroy();checked++;
 }
 assert.ok(checked>0,'Objective source tasks were checked');
});
