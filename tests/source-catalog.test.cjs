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
