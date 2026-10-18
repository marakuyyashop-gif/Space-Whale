const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {parseHTML}=require('linkedom'),kit=require('../exercise-kit.js');
const read=file=>fs.readFileSync(require.resolve('../'+file),'utf8');
function mount(def){const {document}=parseHTML('<html><body><main></main></body></html>'),host=document.querySelector('main');return {host,handle:kit.mount(host,def,{syncChecks:true})};}
function content(){const window={SpaceWhaleExerciseKit:kit},context=vm.createContext({window});for(const file of ['template-source-core.js','course-content-b11-m2.js','course-content-b11-m2-word-practice.js','course-content-b11-m2-discovery-rules.js'])vm.runInContext(read(file),context);return window;}
const app=content(),rules=app.SpaceWhaleContent.flatMap(l=>l.stages.map(s=>s.exercise)).filter(d=>/^R0/.test(d.templateCode));

test('existing course Rules get shared term/formula highlights without changing source text or state',()=>{
 for(const def of rules){const before=JSON.stringify(def),view=mount(def);assert.equal(view.host.querySelectorAll('.ek-rule-summary').length,1);assert.equal(view.host.querySelectorAll('input,textarea,select,.ek-check').length,0);assert.ok(view.host.querySelectorAll('.ek-rule-highlight').length>0);assert.equal(view.host.querySelectorAll('.ek-example-model .ek-rule-highlight,.ek-rule-example .ek-rule-highlight').length,0,'Model sentences retain their approved italic/target-only presentation');view.handle.setAnswers({});assert.deepEqual(view.handle.getAnswers(),{});view.handle.destroy();assert.equal(JSON.stringify(def),before);}
 const def=rules[0],view=mount(def),copy=[...view.host.querySelectorAll('.ek-rule-text-section .ek-copy')].find(p=>p.textContent.startsWith('The if-part'));
 assert.equal(copy.textContent,def.blocks[1].text);assert.equal(copy.querySelector('.ek-rule-highlight').textContent,'if-part');
 const formula=view.host.querySelector('.ek-rule-formula');assert.equal(formula.textContent,def.blocks.find(b=>b.formula).formula);assert.equal(formula.querySelectorAll('.ek-rule-highlight--condition').length,1);assert.equal(formula.querySelectorAll('.ek-rule-highlight--result').length,1);assert.equal(formula.querySelectorAll('strong').length,2);view.handle.destroy();
});

test('all four source Rule templates inherit the shared highlighting and preserve bracket slots',()=>{
 for(const def of app.SpaceWhaleSourceCoreTemplates.filter(d=>d.code.startsWith('R'))){const view=mount(def);const prose=def.blocks.flatMap(b=>b.text&&b.role!=='examples'?[b.text]:[]);for(const text of prose)assert.ok(view.host.textContent.includes(text));const proseTargets=[...view.host.querySelectorAll('.ek-rule-text-section .ek-copy>strong')];assert.ok(proseTargets.every(s=>s.classList.contains('ek-rule-highlight')));assert.equal(view.host.querySelectorAll('.ek-example-model strong.ek-rule-highlight').length,0);view.handle.destroy();}
});

test('formula matching prefers the complete fragment, handles apostrophes and leaves ordinary had/would unchanged',()=>{
 const def={version:1,id:'shared-rule-fragments',templateCode:'R03',kind:'rule-page',title:'Form',blocks:[
  {type:'text',text:'We had a choice and would discuss it. The if-part and result-part explain the relationship.'},
  {type:'rule',formula:"had / hadn't + V3 → would / wouldn't have + V3",highlights:['had',"would / wouldn't have + V3",'have + V3']},
  {type:'rule',formula:'would / wouldn’t + base verb',highlights:['base verb']}
 ]};
 const view=mount(def),first=view.host.querySelector('.ek-rule-text-section .ek-copy');assert.equal(first.querySelectorAll('strong').length,0);assert.deepEqual([...first.querySelectorAll('.ek-rule-highlight')].map(s=>s.textContent),['if-part','result-part']);
 const formulas=[...view.host.querySelectorAll('.ek-rule-formula')];assert.equal(formulas[0].querySelector('.ek-rule-highlight--condition').textContent,"had / hadn't + V3");assert.equal(formulas[0].querySelector('.ek-rule-highlight--result').textContent,"would / wouldn't have + V3");assert.equal(formulas[0].querySelectorAll('.ek-rule-highlight').length,2);assert.equal(formulas[1].querySelector('.ek-rule-highlight--result').textContent,'would / wouldn’t + base verb');view.handle.destroy();
});

test('rule highlight fills never decorate ordinary exercises or their correction feedback',()=>{
 const def={version:1,id:'response-with-rule-words',templateCode:'E11',kind:'writing',title:'Write',responseMode:'accepted',items:[{id:'one',prompt:'if-part',acceptedAnswers:['had / hadn’t + V3']}]};
 const view=mount(def);view.handle.setAnswers({one:'incorrect',__sw_checked:true});assert.ok(view.host.textContent.includes('had / hadn’t + V3'));assert.equal(view.host.querySelectorAll('.ek-rule-highlight').length,0);view.handle.destroy();
});

test('automatic labels and formulas respect each original word boundary',()=>{
 const text='unif-part and if-part; xhad + V3; had + V3; xwould have + V3; would have + V3.';
 const view=mount({version:1,id:'rule-boundaries',templateCode:'R01',kind:'rule-page',title:'Rule',blocks:[{type:'text',text}]});
 assert.equal(view.host.querySelector('.ek-copy').textContent,text);assert.deepEqual([...view.host.querySelectorAll('.ek-rule-highlight')].map(s=>s.textContent),['if-part','had + V3','would have + V3']);view.handle.destroy();
});

test('shared tokens keep native fonts, readable emphasis, soft dual-theme fills and wrapping formulas',()=>{
 const theme=read('exercise-theme.css'),css=read('exercise-kit.css');assert.match(css,/--sw-exercise-emphasis-ink:\s*var\(--ek-ink\)/);assert.match(theme,/--sw-exercise-emphasis-weight:\s*650/);
 for(const name of ['term','formula','condition','result'])assert.equal((theme.match(new RegExp('--sw-rule-'+name+'-surface:','g'))||[]).length,2);
 const highlight=css.match(/\.exercise-kit \.ek-rule-highlight \{([^}]+)\}/)[1];assert.match(highlight,/font-family:\s*inherit/);assert.match(highlight,/box-decoration-break:\s*clone/);assert.doesNotMatch(highlight,/inline-block|nowrap|monospace/);
 assert.equal((css.match(/\.ek-rule-formula\s*\{/g)||[]).length,1,'One formula style, without the obsolete transparent override');assert.match(css,/\.ek-example-model\{[^}]*font-style:italic/);
});
