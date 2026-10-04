const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{execFileSync}=require('node:child_process'),{parseHTML}=require('linkedom');
const {create}=require('../homework-store.js'),kit=require('../exercise-kit.js');
const packs=JSON.parse(execFileSync(process.execPath,['scripts/build-homework-catalog.cjs'],{cwd:require('node:path').resolve(__dirname,'..'),encoding:'utf8'}));
const memory=()=>{const data=new Map();return {getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};};
const record=()=>({id:'attempt',edit:'edit-secret',read:'read-secret',answers:{},revision:0,change:0,dirty:false});
test('homework reuses validated picture/practice exercises and both current translation tasks',()=>{
 for(const p of packs){assert.equal(p.level,'A1.2');assert.equal(p.exercises.length,4);assert.equal(p.exercises[0].layout,'picture-word');assert.equal(p.exercises[1].kind,'gaps');assert.deepEqual(p.exercises.slice(2).map(d=>d.kind),['writing','writing']);
 for(const d of [p.reference,...p.exercises])kit.validate(d);
 for(const item of p.exercises[0].items)assert.ok(fs.existsSync(require('node:path').resolve(__dirname,'..',item.image)));
 }
});
test('autosave serializes in-flight changes and persists revision without dropping a newer answer',async()=>{
 const storage=memory(),calls=[],pending=[];const s=create({storage,key:'draft',record:record(),rpc:(_,args)=>{calls.push(args);return new Promise(resolve=>pending.push(resolve));}});
 s.update('one',{a:'first'});const saving=s.flush();s.update('one',{a:'second'});s.flush();assert.equal(calls.length,1);
 pending.shift()({revision:1});await new Promise(setImmediate);assert.equal(calls.length,2);assert.equal(calls[1].p_revision,1);assert.equal(calls[1].p_answers.one.a,'second');pending.shift()({revision:2});await saving;
 assert.equal(s.state.dirty,false);assert.equal(JSON.parse(storage.getItem('draft')).revision,2);
});
test('failed save retains draft and retries with the same revision',async()=>{
 const storage=memory();let fail=true;const s=create({storage,key:'draft',record:record(),rpc:async()=>{if(fail)throw Error('offline');return {revision:1};}});
 s.update('one',{a:'saved locally'});await assert.rejects(s.flush());assert.equal(s.state.dirty,true);assert.equal(JSON.parse(storage.getItem('draft')).answers.one.a,'saved locally');fail=false;await s.flush();assert.equal(s.state.dirty,false);
});
async function page({url='https://example.test/homework.html?lesson=a1-2-w4-l4',storage=memory(),rpc}){
 const dom=parseHTML(fs.readFileSync(require.resolve('../homework.html'),'utf8')),document=dom.document,window={Event:dom.window.Event};
 window.SpaceWhaleExerciseKit=kit;window.SpaceWhaleHomeworkStore={create};window.spaceWhaleSupabase={rpc:async(name,args)=>({data:await rpc(name,args),error:null})};
 const location=new URL(url),events={},intervals=[];window.addEventListener=(type,fn)=>events[type]=fn;
 const ctx={window,document,location,URL,URLSearchParams,localStorage:storage,crypto:require('node:crypto').webcrypto,navigator:{clipboard:{writeText:async value=>{ctx.copied=value;}}},setTimeout,clearTimeout,setInterval:fn=>intervals.push(fn)};
 await vm.runInNewContext(fs.readFileSync(require.resolve('../homework.js'),'utf8'),ctx);
 return {document,window,events,intervals,ctx};
}
test('resuming a homework shows saved answers, installs recovery listeners, and shares only the read key',async()=>{
 const storage=memory(),r={...record(),lesson:packs[0].id,answers:{'L4-homework-1':{'1':'My answer'}}};storage.setItem('space-whale:homework:v1:'+packs[0].id,JSON.stringify(r));
 const p=await page({storage,rpc:async name=>name==='homework_template'?packs[0]:{definition:packs[0],answers:r.answers,revision:0}});
 assert.equal(p.document.querySelectorAll('.homework-exercise').length,4);assert.ok([...p.document.querySelectorAll('input,textarea')].some(el=>el.value==='My answer'));assert.ok(p.events.online);assert.ok(p.events.beforeunload);assert.equal(p.intervals.length,1);
 const btn=p.document.querySelector('#homeworkFooter button');btn.dispatchEvent(new p.window.Event('click'));await new Promise(setImmediate);
 assert.ok(p.ctx.copied.includes('key=read-secret'));assert.ok(!p.ctx.copied.includes('edit-secret'));
});
test('result URL renders saved attempt snapshot read-only without starting a new attempt',async()=>{
 const calls=[];const p=await page({url:'https://example.test/homework.html#work=attempt&key=read-secret',rpc:async(name,args)=>{calls.push(name);assert.equal(args.p_key,'read-secret');return {definition:packs[1],answers:{}};}});
 assert.deepEqual(calls,['homework_read']);assert.equal(p.document.querySelectorAll('.homework-exercise').length,4);
 assert.ok([...p.document.querySelectorAll('.homework-exercise input,.homework-exercise textarea,.homework-exercise button')].every(el=>el.disabled));assert.equal(p.document.querySelector('#homeworkFooter').children.length,0);
});
