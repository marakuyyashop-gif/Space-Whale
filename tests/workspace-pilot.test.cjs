const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {parseHTML}=require('linkedom');
const kit=require('../exercise-kit.js');
const settled=()=>new Promise(resolve=>setImmediate(resolve));
function fixture(guest=false){
 const {document,window:dom}=parseHTML(fs.readFileSync(require.resolve('../classroom.html'),'utf8'));
 const createNS=document.createElementNS.bind(document);document.createElementNS=(ns,tag)=>{const el=createNS(ns,tag);if(tag==='path'){el.getTotalLength=()=>500;el.getPointAtLength=n=>({x:n%200,y:n/2});}return el;};
 const create=document.createElement.bind(document);
 document.createElement=tag=>{const el=create(tag);if(tag==='dialog'){el.showModal=()=>{el.open=true;};el.close=()=>{el.open=false;};}return el;};
 document.querySelector('#workspaceScroll').scrollTo=()=>{};
 const location={href:'https://example.test/classroom.html',pathname:'/classroom.html',search:'?level=A1.1&whale=1&lesson=a1-1-w1-l2'+(guest?'&guest=old-token':'')};location.href+=location.search;
 const history={replaceState(a,b,url){location.search=new URL(url,location.href).search;},pushState(a,b,url){location.search=new URL(url,location.href).search;}};
 const copied=[],calls=[],storage=()=>{const m=new Map();return {getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)};};
 const channel={presenceState:()=>({})};
 const classroom={state:{clientId:'owner',channel},getCurrentUser:async()=>({id:'owner'}),connectGuest:async()=>({session:{guest:true,allowed_lesson_ids:['*']},role:'teacher'}),loadSharedState:async()=>null,navigate:async()=>{},loadExerciseResponse:async()=>null,queueGuestSnapshot(){},sendExerciseSnapshot:async()=>{},requestExerciseState:async()=>{},disconnect:async()=>{calls.push('disconnect');}};
 const window={SpaceWhaleExerciseKit:kit,SpaceWhaleCatalog:require('../workspace-catalog.js'),SpaceWhaleClassroom:classroom,addEventListener(){},setTimeout:()=>1,clearTimeout(){},setInterval:()=>1,innerWidth:1200,innerHeight:800,spaceWhaleSupabase:{rpc:async(name,args)=>{calls.push({name,args});return {data:name==='create_guest_workspace'?{token:'new-token'}:true};}}};
 const context={window,document,location,history,localStorage:storage(),sessionStorage:storage(),navigator:{clipboard:{writeText:async url=>copied.push(url)}},URL,URLSearchParams,console,setTimeout:()=>1,clearTimeout(){},clearInterval(){}};
 vm.createContext(context);
 for(const f of ['template-gallery.js','lesson-draft-first-day-school.js','lesson-draft-school-fair.js','course-content.js','whale1-content.js','collaboration-state.js','workspace.js'])vm.runInContext(fs.readFileSync(require.resolve('../'+f),'utf8'),context,{filename:f});
 const click=el=>{assert.ok(el);el.dispatchEvent(new dom.Event('click',{bubbles:true}));};
 return {document,location,copied,calls,click};
}
test('actual workspace renders the current sidebar and creates an isolated invitation without a link field',async()=>{
 const s=fixture();assert.ok(s.document.querySelector('.workspace-lesson-selector'));assert.equal(s.document.querySelector('#guestInviteLink'),null);
 s.click(s.document.querySelector('#inviteStudent'));await settled();
 assert.equal(s.calls.filter(c=>c.name==='create_guest_workspace').length,1);
 assert.equal(new URL(s.copied[0]).searchParams.get('guest'),'new-token');
 assert.equal(new URL(s.location.href).searchParams.get('guest'),'new-token');assert.equal(new URL(s.location.href).searchParams.has('completed_stages'),false);
});
test('existing invitation is copied unchanged; replacement requires a separate explicit action',async()=>{
 const s=fixture(true);await settled();s.click(s.document.querySelector('#inviteStudent'));await settled();assert.equal(s.copied[0],'https://example.test/classroom.html?guest=old-token');
 assert.equal(s.calls.filter(c=>c.name==='create_guest_workspace').length,0);
 s.click(s.document.querySelector('#newGuestLesson'));const dialog=s.document.querySelector('.workspace-session-dialog');assert.equal(dialog.open,true);
 s.click([...dialog.querySelectorAll('button')].find(el=>el.textContent==='Новый ученик'));await settled();assert.equal(s.calls.filter(c=>c.name==='create_guest_workspace').length,1);
});
test('closing a guest invitation calls the owner-only revoke operation before leaving',async()=>{
 const s=fixture(true);await settled();s.click(s.document.querySelector('#newGuestLesson'));
 s.click([...s.document.querySelectorAll('.workspace-session-dialog button')].find(el=>el.textContent==='Закрыть текущую ссылку'));await settled();
 assert.ok(s.calls.some(c=>c.name==='revoke_guest_lesson_link'&&c.args.p_token==='old-token'));assert.ok(s.calls.includes('disconnect'));assert.equal(s.location.href,'classroom.html');
});
