const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {parseHTML}=require('linkedom');
const copy=require('../teacher-copy.js');
const parent=()=>parseHTML('<html><body><div id="copy"></div></body></html>').document.querySelector('#copy');

test('teacher descriptions accept legacy strings and explicit topic/language fields',()=>{
 for(const marker of ['Main language','Language','Grammar']){
  assert.deepEqual(copy.parts(`Everyday stories and plans. ${marker}: Present Simple; Something New Tense.`),{summary:'Everyday stories and plans.',language:'Present Simple; Something New Tense'});
 }
 assert.deepEqual(copy.parts({topics:'Describe a plan.',language:['Something New Tense','modal (new)+?']}),{summary:'Describe a plan.',language:'Something New Tense; modal (new)+?'});
 assert.deepEqual(copy.parts('Discuss language choices.'),{summary:'Discuss language choices.',language:''});
});
test('topics stay plain while every explicitly authored language label is emphasized',()=>{
 const root=parent();copy.appendDescription(root,{summary:'Can a trip be simple? Discuss Present Simple in everyday life.',language:['Something New Tense','modal (new)+?']});
 const topic=root.querySelector('.workspace-description-topic'),language=root.querySelector('.workspace-description-language');
 assert.equal(topic.textContent,'Can a trip be simple? Discuss Present Simple in everyday life.');assert.equal(topic.querySelector('.workspace-grammar-term'),null);
 assert.deepEqual([...language.querySelectorAll('.workspace-grammar-term')].map(term=>term.textContent),['Something New Tense','modal (new)+?']);
 assert.equal(language.textContent,'Language: Something New Tense · modal (new)+?');
});
test('block aims emphasize new authored language labels without requiring a registry update',()=>{
 const root=parent();copy.appendAim(root,'Compare Something New Tense with Present Simple and modal (new)+? in a sentence.',['Something New Tense','modal (new)+?']);
 assert.match(root.textContent,/^Aim: Compare/);
 assert.deepEqual([...root.querySelectorAll('.workspace-grammar-term')].map(term=>term.textContent),['Something New Tense','Present Simple','modal (new)+?']);
 assert.equal(root.querySelectorAll('.workspace-block-aim').length,1);
});
test('teacher copy renders authored markup as text in topics, language labels and aims',()=>{
 const root=parent(),unsafe='<img src=x onerror="alert(1)">';
 Object.defineProperty(root,'innerHTML',{set(){throw new Error('HTML injection is not allowed');}});
 copy.appendDescription(root,{summary:`Describe ${unsafe}.`,language:[unsafe]});copy.appendAim(root,`Compare ${unsafe} and Present Simple.`,[unsafe]);
 assert.equal(root.querySelector('img'),null);assert.equal(root.querySelector('script'),null);
 assert.ok(root.textContent.includes(unsafe));assert.ok(root.querySelector('.workspace-grammar-term').textContent.includes(unsafe));
});
test('browser and CommonJS teacher formatters produce the same DOM',()=>{
 const context={window:{}};vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../teacher-copy.js'),'utf8'),context);
 const browser=parent(),node=parent(),description={summary:'Compare two journeys.',language:['Something New Tense','Present Simple']};
 context.window.SpaceWhaleTeacherCopy.appendDescription(browser,description);copy.appendDescription(node,description);
 context.window.SpaceWhaleTeacherCopy.appendAim(browser,'Use Something New Tense to describe a plan.',description.language);copy.appendAim(node,'Use Something New Tense to describe a plan.',description.language);
 assert.equal(browser.outerHTML,node.outerHTML);
});
