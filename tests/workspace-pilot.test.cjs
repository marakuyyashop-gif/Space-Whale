const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {parseHTML}=require('linkedom');
const kit=require('../exercise-kit.js');
const settled=()=>new Promise(resolve=>setImmediate(resolve));
function fixture(guest=false,options={}){
 let handlers;
 const {document,window:dom}=parseHTML(fs.readFileSync(require.resolve('../classroom.html'),'utf8'));
 const createNS=document.createElementNS.bind(document);document.createElementNS=(ns,tag)=>{const el=createNS(ns,tag);if(tag==='path'){el.getTotalLength=()=>500;el.getPointAtLength=n=>({x:n%200,y:n/2});}return el;};
 const create=document.createElement.bind(document);
 document.createElement=tag=>{const el=create(tag);if(tag==='audio'){el.pause=()=>{};}if(tag==='dialog'){el.showModal=()=>{el.open=true;};el.close=()=>{el.open=false;};}return el;};
 document.querySelector('#workspaceScroll').scrollTo=()=>{};
 const location={href:'https://example.test/classroom.html',pathname:'/classroom.html',search:'?level=A1.1&whale=1&lesson=a1-1-w1-l2'+(guest?'&guest=old-token':'')};location.href+=location.search;location.replace=url=>{location.href=url;};location.reload=()=>{};
 const history={replaceState(a,b,url){location.search=new URL(url,location.href).search;},pushState(a,b,url){location.search=new URL(url,location.href).search;}};
 const copied=[],calls=[],storage=()=>{const m=new Map();return {getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)};};
 const channel={presenceState:()=>({})},transportSession={guest:true,allowed_lesson_ids:['*']};
 const classroom={state:{clientId:'owner',channel},getCurrentUser:async()=>({id:'owner'}),connectGuest:async(token,h)=>{handlers=h;if(options.invalid){const error=new Error('closed');error.code=options.offline?'NETWORK':'GUEST_LINK_CLOSED';throw error;}return {session:transportSession,role:options.student?'student':'teacher',meta:{started_at:options.startedAt||null,server_now:new Date().toISOString(),duration_minutes:60,allowed_lesson_ids:['*']}};},loadSharedState:async()=>null,startGuestLesson:async()=>{calls.push('start');if(options.startFails)throw new Error('offline');return {started_at:new Date().toISOString(),server_now:new Date().toISOString(),status:'live',duration_minutes:60,allowed_lesson_ids:['*']};},navigate:async()=>{},loadExerciseResponse:async()=>null,queueGuestSnapshot(){},sendExerciseSnapshot:async()=>{},requestExerciseState:async()=>{},disconnect:async()=>{calls.push('disconnect');}};
 const window={SpaceWhaleIsTeacher:!options.student,SpaceWhaleExerciseKit:kit,SpaceWhaleCatalog:require('../workspace-catalog.js'),SpaceWhaleClassroom:classroom,addEventListener(){},setTimeout:()=>1,clearTimeout(){},setInterval:()=>1,innerWidth:1200,innerHeight:800,spaceWhaleSupabase:{rpc:async(name,args)=>{calls.push({name,args});return {data:name==='create_guest_workspace'?{token:'new-token'}:true};}}};
 window.SpaceWhaleMedia={lessonStarted:id=>calls.push({name:'media-started',id}),connect:async context=>{calls.push({name:'media-connect',context});},stopMedia:async()=>{calls.push({name:'media-stop'});},createInvitation:async()=>{calls.push({name:'create_guest_workspace'});return {token:'new-token'};},endSession:async args=>{calls.push({name:'revoke_guest_lesson_link',args:{p_token:args.guestToken}});if(options.endVideo)await options.endVideo(handlers);}};
 const context={window,document,location,history,localStorage:storage(),sessionStorage:storage(),navigator:{clipboard:{writeText:async url=>copied.push(url)}},URL,URLSearchParams,console,setTimeout:()=>1,clearTimeout(){},clearInterval(){}};
 if(options.ended)context.sessionStorage.setItem('space-whale:clock:guest:old-token',JSON.stringify({startedAt:1,readyAt:1,ended:true}));
 vm.createContext(context);
 for(const f of ['template-gallery.js','lesson-draft-first-day-school.js','lesson-draft-school-fair.js','course-content.js','whale1-content.js','collaboration-state.js','workspace.js'])vm.runInContext(fs.readFileSync(require.resolve('../'+f),'utf8'),context,{filename:f});
 const click=el=>{assert.ok(el);el.dispatchEvent(new dom.Event('click',{bubbles:true}));};
 return {document,location,copied,calls,click,transportState(data){Object.assign(transportSession,data);handlers.onLessonState(data);},get handlers(){return handlers;},sessionStorage:context.sessionStorage};
}
test('actual workspace renders the current sidebar and creates an isolated invitation without a link field',async()=>{
 const s=fixture();assert.ok(s.document.querySelector('.workspace-lesson-heading'));assert.equal(s.document.querySelector('#guestInviteLink'),null);
 s.click(s.document.querySelector('#inviteStudent'));await settled();
 assert.equal(s.calls.filter(c=>c.name==='create_guest_workspace').length,1);
 assert.equal(new URL(s.copied[0]).searchParams.get('guest'),'new-token');
 assert.equal(new URL(s.location.href).searchParams.get('room'),'new-token');assert.equal(new URL(s.location.href).searchParams.has('completed_stages'),false);
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
 assert.ok(s.calls.some(c=>c.name==='revoke_guest_lesson_link'&&c.args.p_token==='old-token'));assert.ok(s.calls.includes('disconnect'));assert.equal(new URL(s.location.href).searchParams.has('guest'),false);assert.equal(new URL(s.location.href).searchParams.has('room'),false);assert.equal(new URL(s.location.href).searchParams.get('lesson'),'a1-1-w1-l2');
});

test('Start/Finish keeps the teacher cabinet available and preserves the selected lesson',async()=>{
 const s=fixture(true);await settled();
 s.click(s.document.querySelector('#startLesson'));
 s.click([...s.document.querySelectorAll('.workspace-session-dialog button')].find(b=>b.textContent==='Start Lesson'));await settled();
 assert.equal(s.document.querySelector('#startLesson').hidden,true);
 assert.equal(s.document.querySelector('#workspaceStopLesson').textContent,'FinishLesson');
 s.click(s.document.querySelector('#workspaceStopLesson'));
 s.click([...s.document.querySelectorAll('.workspace-session-dialog button')].find(b=>b.textContent==='Завершить'));await settled();
 const target=new URL(s.location.href);assert.equal(target.searchParams.has('room'),false);assert.equal(target.searchParams.has('guest'),false);assert.equal(target.searchParams.get('lesson'),'a1-1-w1-l2');
 assert.equal(JSON.parse(s.sessionStorage.getItem('space-whale:clock:guest:old-token')).ended,false);
 const reopened=fixture();assert.equal(reopened.document.querySelector('#startLesson').disabled,false);assert.ok(reopened.document.querySelector('.workspace-lesson-heading'));
});
test('old ended timer never blocks role verification; an owner opening an expired invitation recovers',async()=>{
 const s=fixture(true,{ended:true,invalid:true});await settled();
 assert.ok(s.handlers,'connection and role validation was attempted despite the old ended flag');
 const target=new URL(s.location.href);assert.equal(target.searchParams.has('guest'),false);assert.equal(target.searchParams.has('room'),false);assert.equal(target.searchParams.get('notice'),'closed');
});
test('a guest with an expired invitation stays outside the teacher cabinet',async()=>{
 const s=fixture(true,{student:true,invalid:true,ended:true});await settled();
 assert.equal(s.document.body.dataset.workspaceRole,'connection-error');assert.match(s.document.querySelector('#workspaceConnectionState').textContent,/Занятие закрыто/);
 assert.doesNotMatch(s.document.querySelector('#workspaceConnectionState').textContent,/Вернуться в кабинет/);
 assert.ok(new URL(s.location.href).searchParams.has('guest'));
});
test('server closure returns the connected teacher to preparation but blocks the connected pupil',async()=>{
 const teacher=fixture(true);await settled();teacher.handlers.onEnded();assert.equal(new URL(teacher.location.href).searchParams.has('guest'),false);
 const pupil=fixture(true,{student:true});await settled();pupil.handlers.onEnded();assert.equal(pupil.document.body.dataset.workspaceRole,'connection-error');assert.equal(pupil.document.querySelector('#workspaceExercise').children.length,0);
});
test('network error offers teacher retry and a cabinet exit without cancelling the room',async()=>{
 const s=fixture(true,{invalid:true,offline:true});await settled();assert.match(s.document.querySelector('#workspaceConnectionState').textContent,/Повторить подключение/);assert.match(s.document.querySelector('#workspaceConnectionState').textContent,/Вернуться в кабинет/);assert.equal(s.calls.filter(c=>c.name==='revoke_guest_lesson_link').length,0);
});

test('invited learner waits without mounting exercises, then opens the teacher selection and shared countdown',async()=>{
 const s=fixture(true,{student:true});await settled();
 assert.match(s.document.querySelector('#workspaceExercise').textContent,/Ждём начала занятия/);
 assert.equal(s.document.querySelector('#workspaceExercise .exercise-kit'),null);
 assert.equal(s.document.querySelector('.workspace-student-timer').hidden,true);
 s.handlers.onNavigate({current_page_id:'?level=A1.1&whale=1&lesson=a1-1-w1-l1'});
 assert.match(s.document.querySelector('#workspaceExercise').textContent,/Ждём начала занятия/);
 s.handlers.onLessonState({status:'live',started_at:'2026-09-26T10:00:00Z',server_now:'2026-09-26T10:15:00Z',duration_minutes:60,allowed_lesson_ids:['*'],current_page_id:'?level=A1.1&whale=1&lesson=a1-1-w1-l1'});
 assert.equal(s.document.querySelector('.workspace-student-timer').hidden,false);
 assert.equal(s.document.querySelector('.workspace-student-time').textContent,'45:00');
 assert.equal(s.document.querySelector('#workspaceClockTime').textContent,'45:00');
 assert.doesNotMatch(s.document.querySelector('#workspaceExercise').textContent,/Ждём начала занятия/);
 s.handlers.onEnded();assert.equal(s.document.querySelector('.workspace-student-timer').hidden,true);
});
test('reload of a live lesson restores the server timer instead of starting over',async()=>{
 const s=fixture(true,{student:true,startedAt:new Date(Date.now()-900000).toISOString()});await settled();
 assert.equal(s.document.querySelector('.workspace-student-timer').hidden,false);
 assert.match(s.document.querySelector('.workspace-student-time').textContent,/^(45:00|44:59)$/);
});
test('failed Start stays waiting and offers retry instead of starting a local-only timer',async()=>{
 const s=fixture(true,{startFails:true});await settled();s.click(s.document.querySelector('#startLesson'));
 s.click([...s.document.querySelectorAll('.workspace-session-dialog button')].find(b=>b.textContent==='Start Lesson'));await settled();
 assert.equal(s.document.querySelector('#startLesson').hidden,false);
 assert.match(s.document.querySelector('.workspace-device-status').textContent,/Не удалось начать/);
});

test('waiting student has no video; server Start connects video with its own guest invitation',async()=>{
 const s=fixture(true,{student:true});await settled();assert.equal(s.calls.filter(c=>c.name==='media-connect').length,0);
 s.handlers.onLessonState({status:'live',started_at:new Date().toISOString(),server_now:new Date().toISOString(),allowed_lesson_ids:['*']});
 const media=s.calls.find(c=>c.name==='media-connect');assert.equal(media.context.guestToken,'old-token');assert.equal(media.context.role,'student');assert.equal(s.calls.filter(c=>c.name==='media-started').length,1);
});
test('teacher prepares video before Start and does not navigate away before server cleanup finishes',async()=>{
 let finish;const s=fixture(true,{endVideo:handlers=>{handlers.onEnded();return new Promise(resolve=>{finish=resolve;});}});await settled();
 assert.equal(s.calls.find(c=>c.name==='media-connect').context.role,'teacher');
 s.click(s.document.querySelector('#newGuestLesson'));s.click([...s.document.querySelectorAll('.workspace-session-dialog button')].find(el=>el.textContent==='Закрыть текущую ссылку'));await settled();
 assert.equal(new URL(s.location.href).searchParams.get('guest'),'old-token');finish();await settled();assert.equal(new URL(s.location.href).searchParams.has('guest'),false);
});


test('template groups use the existing selectors and stay inside the same Workspace',async()=>{
 const s=fixture();await settled();
 const choose=(selector,label)=>{
   s.click(s.document.querySelector(selector));
   s.click([...s.document.querySelectorAll('.workspace-picker-option')].find(el=>el.textContent.includes(label)));
 };
 choose('.selector-level','Шаблоны упражнений');
 assert.match(s.location.search,/view=templates/);
 for(const [title,count] of [['Материалы / элементы',6],['Механики ответа',9],['Композиции / примеры',6]]){
   choose('.selector-module',title);
   assert.match(s.location.search,/view=templates/);
   assert.equal(s.document.querySelector('.workspace-lesson-title').textContent,title);
   assert.equal(s.document.querySelectorAll('#workspaceLessonPath .workspace-path-point').length,count+1);
   assert.ok(s.document.querySelector('#workspaceExercise h2'));
 }
});

test('level is beside session controls; module and lesson pickers navigate; overview is plain text',()=>{
 const s=fixture(),d=s.document;
 assert.ok(d.querySelector('#workspaceClockPanel .selector-level'));
 assert.deepEqual([...d.querySelectorAll('#workspaceCourseControls button')].map(b=>b.textContent),['M1','L2']);
 assert.equal(d.querySelector('button.workspace-lesson-selector'),null);
 assert.ok(d.querySelector('.workspace-lesson-heading [role=button]'));
 const choose=(selector,label)=>{s.click(d.querySelector(selector));s.click([...d.querySelectorAll('.workspace-picker-option')].find(el=>el.textContent.includes(label)));};
 choose('.selector-level','A1.2');choose('.selector-module','04');choose('.selector-lesson','Как выглядит эта вещь?');
 const overview=d.querySelector('.workspace-lesson-overview');assert.match(overview.textContent,/look \/ looks/);assert.doesNotMatch(overview.textContent,/coat|sweater|blouse/);
 assert.match(s.location.search,/lesson=a1-2-w4-l1/);
});
test('persistent notices can be dismissed and later messages still appear',()=>{
 const s=fixture(),d=s.document,n=d.getElementById('workspaceNotice');
 n.textContent='Аудио не загрузилось';s.click(d.getElementById('workspaceNoticeClose'));assert.equal(n.textContent,'');
 n.textContent='Новое сообщение';assert.equal(n.textContent,'Новое сообщение');
 d.getElementById('lessonAudioEnable').hidden=false;s.click(d.getElementById('lessonAudioDismiss'));assert.equal(d.getElementById('lessonAudioEnable').hidden,true);
 d.getElementById('mediaStatus').hidden=false;s.click(d.getElementById('mediaStatusClose'));assert.equal(d.getElementById('mediaStatus').hidden,true);
 assert.equal(s.calls.filter(c=>c?.name==='media-stop').length,0);
});

test('transport mutation before its Start callback cannot hide the waiting-to-live transition',async()=>{
 const s=fixture(true,{student:true});await settled();
 assert.equal(s.calls.filter(c=>c.name==='media-connect').length,0);
 const state={status:'live',started_at:new Date().toISOString(),server_now:new Date().toISOString(),allowed_lesson_ids:['*'],current_page_id:'?level=A1.1&whale=1&lesson=a1-1-w1-l1'};
 s.transportState(state);
 assert.equal(s.calls.filter(c=>c.name==='media-connect').length,1);
 assert.equal(s.calls.filter(c=>c.name==='media-started').length,1);
 assert.doesNotMatch(s.document.querySelector('#workspaceExercise').textContent,/Ждём начала занятия/);
 assert.equal(s.document.querySelector('.workspace-student-timer').hidden,false);
 s.transportState(state);assert.equal(s.calls.filter(c=>c.name==='media-connect').length,1);
});
