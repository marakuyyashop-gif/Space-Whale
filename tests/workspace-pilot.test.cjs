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
 const location={href:'https://example.test/classroom.html',pathname:'/classroom.html',search:(options.search??'?level=A1.1&whale=1&lesson=a1-1-w1-l2')+(guest?'&guest=old-token':'')};location.href+=location.search;location.replace=url=>{location.href=url;};location.reload=()=>{};
 const history={replaceState(a,b,url){location.search=new URL(url,location.href).search;},pushState(a,b,url){location.search=new URL(url,location.href).search;}};
 const copied=[],calls=[],mounts=[],storage=()=>{const m=new Map();return {getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)};};
 const recordedKit={...kit,mount(root,exercise,config){const instance=kit.mount(root,exercise,config);mounts.push({exercise,config,instance});return instance;}};
 const channel={presenceState:()=>({})},transportSession={guest:true,allowed_lesson_ids:['*']};
 const classroom={state:{clientId:'owner',channel},getCurrentUser:async()=>({id:'owner'}),connectGuest:async(token,h)=>{handlers=h;if(options.invalid){const error=new Error('closed');error.code=options.offline?'NETWORK':'GUEST_LINK_CLOSED';throw error;}return {session:transportSession,role:options.student?'student':'teacher',meta:{started_at:options.startedAt||null,server_now:new Date().toISOString(),duration_minutes:60,allowed_lesson_ids:['*']}};},loadSharedState:async()=>null,startGuestLesson:async()=>{calls.push('start');if(options.startFails)throw new Error('offline');return {started_at:new Date().toISOString(),server_now:new Date().toISOString(),status:'live',duration_minutes:60,allowed_lesson_ids:['*']};},navigate:async()=>{},loadExerciseResponse:async()=>null,queueGuestSnapshot(){},sendExerciseSnapshot:async()=>{},requestExerciseState:async()=>{},disconnect:async()=>{calls.push('disconnect');}};
 const window={SpaceWhaleIsTeacher:!options.student,SpaceWhaleExerciseKit:recordedKit,SpaceWhaleCatalog:require('../workspace-catalog.js'),SpaceWhaleClassroom:classroom,addEventListener(){},setTimeout:()=>1,clearTimeout(){},setInterval:()=>1,innerWidth:1200,innerHeight:800,spaceWhaleSupabase:{rpc:async(name,args)=>{calls.push({name,args});return {data:name==='create_guest_workspace'?{token:'new-token'}:true};}}};
 window.SpaceWhaleMedia={lessonStarted:id=>calls.push({name:'media-started',id}),connect:async context=>{calls.push({name:'media-connect',context});},stopMedia:async()=>{calls.push({name:'media-stop'});},createInvitation:async()=>{calls.push({name:'create_guest_workspace'});if(options.createInvitation)await options.createInvitation();return {token:'new-token'};},endSession:async args=>{calls.push({name:'revoke_guest_lesson_link',args:{p_token:args.guestToken}});if(options.endVideo)await options.endVideo(handlers);}};
 const context={window,document,location,history,localStorage:options.localStorage||storage(),sessionStorage:options.sessionStorage||storage(),navigator:{clipboard:{writeText:async url=>copied.push(url)}},URL,URLSearchParams,console,setTimeout:()=>1,clearTimeout(){},clearInterval(){}};
 if(options.ended)context.sessionStorage.setItem('space-whale:clock:guest:old-token',JSON.stringify({startedAt:1,readyAt:1,ended:true}));
 vm.createContext(context);
 for(const f of ['template-gallery.js','lesson-draft-first-day-school.js','lesson-draft-school-fair.js','course-content.js','whale1-content.js','lesson-structure.js','lesson-teacher-info.js','collaboration-state.js','workspace.js'])vm.runInContext(fs.readFileSync(require.resolve('../'+f),'utf8'),context,{filename:f});
 const click=el=>{assert.ok(el);el.dispatchEvent(new dom.Event('click',{bubbles:true}));};
 const event=(el,type,properties={})=>{assert.ok(el);const event=new dom.Event(type,{bubbles:true});Object.assign(event,properties);el.dispatchEvent(event);};
 return {document,location,copied,calls,mounts,click,event,transportState(data){Object.assign(transportSession,data);handlers.onLessonState(data);},get handlers(){return handlers;},sessionStorage:context.sessionStorage,localStorage:context.localStorage};
}
const openPanel=(s,selector)=>s.click(s.document.querySelector(`.selector-${selector}`));
const panelOption=(s,label)=>[...s.document.querySelectorAll('#workspaceTopics .workspace-panel-option')].find(el=>el.querySelector('strong')?.textContent===label);
function chooseLesson(s,id){
 const select=s.document.querySelector('select[aria-label="Choose lesson"]');assert.ok(select);
 const option=[...select.querySelectorAll('option')].find(option=>option.value===id);assert.ok(option);
 [...select.querySelectorAll('option')].forEach(item=>item.removeAttribute('selected'));option.setAttribute('selected','');
 s.event(select,'change');
}
test('actual workspace renders the current sidebar and creates an isolated invitation without a link field',async()=>{
 const s=fixture();assert.ok(s.document.querySelector('#workspaceSidebar.workspace-rail'));assert.equal(s.document.querySelector('#workspaceMenuPanel').hidden,true);assert.equal(s.document.querySelector('#guestInviteLink'),null);
 s.click(s.document.querySelector('#inviteStudent'));await settled();
 assert.equal(s.calls.filter(c=>c.name==='create_guest_workspace').length,1);
 assert.equal(new URL(s.copied[0]).searchParams.get('guest'),'new-token');
 assert.equal(new URL(s.location.href).searchParams.get('room'),'new-token');assert.equal(new URL(s.location.href).searchParams.has('completed_stages'),false);
});
test('course panels replace each other and show English course overviews',()=>{
 const s=fixture(),d=s.document;
 openPanel(s,'level');
 assert.equal(d.querySelector('#workspaceMenuPanel').dataset.panel,'levels');
 assert.equal(d.querySelector('.workspace-panel-title').textContent,'Levels');
 for(const id of ['A1.1','A1.2']){
  const copy=panelOption(s,id).querySelector('small').textContent;
  assert.ok(copy.length>30);assert.doesNotMatch(copy,/[А-Яа-яЁё]/);assert.match(copy,/Main language/);
 }
 openPanel(s,'module');
 assert.equal(d.querySelector('#workspaceMenuPanel').dataset.panel,'modules');
 assert.equal(d.querySelector('.workspace-panel-title').textContent,'Modules');
 assert.equal(panelOption(s,'A1.1'),undefined);
 const modules=[...d.querySelectorAll('#workspaceTopics .workspace-panel-option')];assert.equal(modules.length,7);
 assert.ok(modules.every(item=>item.querySelector('small')?.textContent&&!/[А-Яа-яЁё]/.test(item.querySelector('small').textContent)));
 openPanel(s,'lesson');
 assert.equal(d.querySelector('#workspaceMenuPanel').dataset.panel,'lesson');
 assert.equal(d.querySelector('.workspace-panel-title').textContent,'Lesson');
 assert.equal(d.querySelector('.workspace-panel-option'),null);
 const select=d.querySelector('select[aria-label="Choose lesson"]');
 assert.equal(select.querySelectorAll('option').length,10);
 chooseLesson(s,'a1-1-w1-lnumbers');
 assert.equal(new URLSearchParams(s.location.search).get('lesson'),'a1-1-w1-lnumbers');
 assert.equal(d.querySelector('.workspace-lesson-title').textContent,'Числа');
 assert.equal(d.querySelector('.workspace-lesson-overview .workspace-info-copy').textContent,'Name numbers from 0 to 20, record what you hear, and correct mistakes.');
 assert.deepEqual([...d.querySelectorAll('.workspace-block-select')].map(el=>el.textContent),['Speaking','Discovery Words','Lexis / Grammar','Speaking']);
 assert.equal(d.querySelector('.workspace-block-number'),null);
});
test('Future and Practice empty blocks remain reachable through the collapsed rail',()=>{
 for(const [module,count] of [[6,7],[7,4]])for(let number=1;number<=count;number++){
  const s=fixture(false,{search:`?view=library&level=A1.2&whale=${module}&lesson=a1-2-w${module}-l${number}`});
  assert.equal(s.document.querySelector('#workspaceMenuPanel').hidden,true);
  assert.deepEqual([...s.document.querySelectorAll('#workspaceBlockControls [data-block]')].map(el=>el.dataset.block),['opening','words','language','final']);
  for(const [id,label] of [['opening','Speaking'],['words','Discovery Words'],['language','Lexis / Grammar'],['final','Speaking']]){
   s.click(s.document.querySelector(`#workspaceBlockControls [data-block="${id}"]`));
   assert.equal(new URLSearchParams(s.location.search).get('block'),id);
   assert.equal(new URLSearchParams(s.location.search).has('exercise'),false);
   assert.equal(s.document.querySelector('#workspaceExercise h1').textContent,label);
   assert.equal(s.document.querySelector('#workspaceExercise .exercise-kit'),null);
   assert.equal(s.document.querySelectorAll('#workspaceBlockControls [aria-current]').length,1);
   assert.equal(s.document.querySelector('#workspaceMenuPanel').hidden,true);
   const reloaded=fixture(false,{search:s.location.search});assert.equal(reloaded.document.querySelector('#workspaceExercise h1').textContent,label);
  }
  openPanel(s,'lesson');
  assert.equal(s.document.querySelectorAll('.workspace-block-expand').length,0);
  assert.equal(s.document.querySelectorAll('.workspace-block-aim').length,4);
  assert.equal(s.document.querySelector('#workspaceLessonPath'),null);
  assert.equal(s.document.querySelector('.workspace-progress-skip').disabled,true);
  assert.equal(s.document.querySelector('.workspace-progress-reset').disabled,true);
 }
});
test('rail block navigation opens original exercises without expanding the menu',()=>{
 const s=fixture(false,{search:'?view=library&level=A1.2&whale=4&lesson=a1-2-w4-l1'});
 s.click(s.document.querySelector('#workspaceBlockControls [data-block="words"]'));
 assert.equal(new URLSearchParams(s.location.search).get('exercise'),'a12w4l1-words');
 assert.equal(new URLSearchParams(s.location.search).get('block'),'words');
 assert.equal(s.document.querySelector('#workspaceMenuPanel').hidden,true);
 openPanel(s,'lesson');
 s.click(s.document.querySelector('#workspaceLessonBlocks [data-block="words"] .workspace-block-expand'));
 const repeat=s.document.querySelector('#workspaceLessonBlocks [data-block="words"] a[href*="exercise=a12w4l1-listen-repeat"]');s.click(repeat);
 assert.equal(new URLSearchParams(s.location.search).get('exercise'),'a12w4l1-listen-repeat');
 assert.ok(s.document.querySelector('#workspaceExercise .ek-repeat-list'));
 assert.equal(s.document.querySelector('#workspaceBlockControls [data-block="words"]').getAttribute('aria-current'),'step');
 const reloaded=fixture(false,{search:s.location.search});
 assert.equal(new URLSearchParams(reloaded.location.search).get('exercise'),'a12w4l1-listen-repeat');
 assert.equal(reloaded.document.querySelector('#workspaceBlockControls [data-block="words"]').getAttribute('aria-current'),'step');
 assert.equal(reloaded.document.querySelector('#workspaceMenuPanel').hidden,true);
 openPanel(reloaded,'lesson');
 assert.equal(reloaded.document.querySelector('#workspaceLessonBlocks [data-block="words"] .workspace-block-expand').getAttribute('aria-expanded'),'false');
});
test('lesson aims stay visible while plus controls disclose only existing exercises without navigation',()=>{
 const s=fixture(false,{search:'?view=library&level=A1.2&whale=4&lesson=a1-2-w4-l1&exercise=a12w4l1-words'}),d=s.document;
 const root=d.querySelector('#workspaceExercise'),exercise=root.firstElementChild,search=s.location.search;
 openPanel(s,'lesson');const scroll=d.querySelector('.workspace-menu-scroll');scroll.scrollTop=117;
 const block=d.querySelector('#workspaceLessonBlocks [data-block="language"]'),aim=block.querySelector('.workspace-block-aim');
 assert.ok(aim.textContent);assert.equal(aim.hidden,false);
 const toggle=block.querySelector('.workspace-block-expand');assert.equal(toggle.textContent,'+');
 s.click(toggle);
 assert.equal(toggle.getAttribute('aria-expanded'),'true');assert.equal(toggle.textContent,'−');
 assert.equal(block.querySelector('.workspace-block-content').hidden,false);
 assert.equal(block.querySelector('.workspace-block-content .workspace-block-aim'),null);
 assert.ok(block.querySelectorAll('.workspace-block-stages a').length>0);
 assert.equal(s.location.search,search);assert.equal(root.firstElementChild,exercise);assert.equal(scroll.scrollTop,117);
 s.click(toggle);assert.equal(toggle.textContent,'+');assert.equal(toggle.getAttribute('aria-expanded'),'false');
 assert.equal(s.location.search,search);assert.equal(root.firstElementChild,exercise);
 s.click(block.querySelector('.workspace-block-select'));
 assert.equal(new URLSearchParams(s.location.search).get('block'),'language');
 assert.equal(d.querySelector('#workspaceLessonBlocks [data-block="language"] .workspace-block-content').hidden,true);
 assert.equal(d.querySelector('.workspace-block-select strong'),null);
});
test('exercise arrows keep original tasks reachable with the rail collapsed',()=>{
 const s=fixture(false,{search:'?view=library&level=A1.2&whale=4&lesson=a1-2-w4-l1&exercise=a12w4l1-words'});
 assert.ok(s.document.querySelector('.exercise-kit.ek-modern #workspaceExerciseNavigation .ek-stage-down .ek-stage-chevron'));
 s.click(s.document.querySelector('#workspaceExerciseNavigation [aria-label="Next exercise"]'));
 assert.equal(new URLSearchParams(s.location.search).get('exercise'),'a12w4l1-listen-repeat');
 assert.ok(s.document.querySelector('#workspaceExercise .ek-repeat-list'));
 assert.equal(s.document.querySelector('#workspaceMenuPanel').hidden,true);
 s.click(s.document.querySelector('#workspaceExerciseNavigation [aria-label="Previous exercise"]'));
 assert.equal(new URLSearchParams(s.location.search).get('exercise'),'a12w4l1-words');
 const search=s.location.search,exercise=s.document.querySelector('#workspaceExercise').firstElementChild;
 openPanel(s,'lesson');s.click(s.document.querySelector('.workspace-progress-skip'));s.click(s.document.querySelector('.workspace-progress-reset'));
 assert.equal(s.location.search,search);assert.equal(s.document.querySelector('#workspaceExercise').firstElementChild,exercise);
 assert.equal(s.document.querySelector('#workspaceMilestones'),null);assert.equal(s.document.querySelector('#workspaceLessonPath'),null);
});
test('Profile uses the shared panel and course selection replaces profile content',()=>{
 const s=fixture(),d=s.document,button=d.querySelector('#workspaceProfileButton');
 s.click(button);assert.equal(d.querySelector('#workspaceStudentProfile').hidden,false);assert.equal(d.querySelector('#workspaceTopics').hidden,true);
 assert.equal(button.getAttribute('aria-label'),'Profile');assert.equal(button.getAttribute('aria-expanded'),'true');
 openPanel(s,'level');assert.equal(d.querySelector('#workspaceStudentProfile').hidden,true);assert.equal(d.querySelector('#workspaceTopics').hidden,false);
 assert.equal(d.querySelector('#workspaceMenuPanel').dataset.panel,'levels');assert.equal(button.getAttribute('aria-expanded'),'false');
 s.click(button);s.click(button);assert.equal(d.querySelector('#workspaceMenuPanel').hidden,true);assert.equal(button.getAttribute('aria-label'),'Profile');
});
test('live empty-block selection follows teacher navigation and remains locked for learners',async()=>{
 const s=fixture(true,{student:true,startedAt:new Date().toISOString()});await settled();
 s.handlers.onNavigate({current_page_id:'?view=library&level=A1.2&whale=6&lesson=a1-2-w6-l1&block=language'});
 assert.equal(s.document.querySelector('#workspaceExercise h1').textContent,'Lexis / Grammar');
 assert.ok([...s.document.querySelectorAll('#workspaceCourseControls button,#workspaceBlockControls button')].every(control=>control.disabled));
 assert.equal(new URLSearchParams(s.location.search).get('block'),'language');assert.equal(s.document.querySelector('#workspaceMenuPanel').hidden,true);
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
 assert.equal(s.document.querySelector('#workspaceStopLesson').getAttribute('aria-label'),'Finish lesson');assert.equal(s.document.querySelector('#workspaceStopLesson').getAttribute('data-tooltip'),'Finish lesson');
 s.click(s.document.querySelector('#workspaceStopLesson'));
 s.click([...s.document.querySelectorAll('.workspace-session-dialog button')].find(b=>b.textContent==='Завершить'));await settled();
 const target=new URL(s.location.href);assert.equal(target.searchParams.has('room'),false);assert.equal(target.searchParams.has('guest'),false);assert.equal(target.searchParams.get('lesson'),'a1-1-w1-l2');
 assert.equal(JSON.parse(s.sessionStorage.getItem('space-whale:clock:guest:old-token')).ended,false);
 const reopened=fixture();assert.equal(reopened.document.querySelector('#startLesson').disabled,false);assert.ok(reopened.document.querySelector('#workspaceBlockControls [data-block=opening]'));
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


test('template groups remain reachable through the lesson panel in the same Workspace',async()=>{
 const s=fixture();await settled();openPanel(s,'level');s.click(panelOption(s,'Exercise templates'));
 assert.match(s.location.search,/view=templates/);assert.equal(s.document.querySelector('#workspaceMenuPanel').dataset.panel,'lesson');
 for(const [title,count] of [['Материалы / элементы',6],['Механики ответа',9],['Композиции / примеры',6]]){
   const group=[...s.document.querySelectorAll('select[aria-label="Choose lesson"] option')].find(option=>option.textContent===title);assert.ok(group);
   chooseLesson(s,group.value);assert.match(s.location.search,/view=templates/);
   assert.equal(s.document.querySelector('.workspace-lesson-title').textContent,title);
   assert.equal(s.document.querySelector('#workspaceLessonPath'),null);
   assert.equal(s.document.querySelectorAll('.workspace-block-stages a').length,count);
   assert.ok(s.document.querySelector('#workspaceExercise h2'));
 }
});
test('vertical rail keeps account, course, lesson and timer sections separate',()=>{
 const s=fixture(),d=s.document;
 assert.ok(d.querySelector('#workspaceSidebar.workspace-rail'));assert.equal(d.querySelector('#workspaceMenuPanel').hidden,true);
 assert.deepEqual([...d.querySelectorAll('.workspace-rail-system > a,.workspace-rail-system > button')].map(el=>el.id||el.getAttribute('aria-label')),['Home','workspaceProfileButton','newGuestLesson','inviteStudent']);
 assert.deepEqual([...d.querySelectorAll('#workspaceCourseControls button')].map(b=>b.textContent),['A1.1','M1','L2']);
 assert.equal(d.querySelectorAll('.workspace-rail-divider').length,2);
 assert.ok(d.querySelector('.workspace-rail-footer #startLesson svg'));assert.equal(d.querySelector('#startLesson').textContent,'');
 assert.ok(d.querySelector('.workspace-rail-footer #workspaceClockTime'));
 assert.equal(d.querySelector('.workspace-rail-brand').textContent,'SW');assert.equal(d.querySelector('.workspace-expanded-brand').textContent,'Space Whale');
 openPanel(s,'level');s.click(panelOption(s,'A1.2'));openPanel(s,'module');
 s.click([...d.querySelectorAll('.workspace-panel-option')].find(el=>el.querySelector('strong').textContent.includes('4')));
 openPanel(s,'lesson');chooseLesson(s,'a1-2-w4-l1');
 const overview=d.querySelector('.workspace-lesson-overview');assert.match(overview.textContent,/Describe how clothes look and compare similar items/);assert.doesNotMatch(overview.textContent,/coat|sweater|blouse/);
 assert.match(s.location.search,/lesson=a1-2-w4-l1/);
});
test('level and module choices persist incomplete selection without silently opening a lesson',()=>{
 const s=fixture(false,{search:''}),d=s.document;
 const labels=()=>[...d.querySelectorAll('#workspaceCourseControls button')].map(el=>el.textContent);
 assert.deepEqual(labels(),['A','M','L']);assert.equal(d.querySelector('#workspaceBlockControls').hidden,true);
 assert.equal(new URLSearchParams(s.location.search).get('selection'),'none');
 openPanel(s,'level');s.click(panelOption(s,'A1.2'));
 let params=new URLSearchParams(s.location.search);assert.equal(params.get('selection'),'level');assert.equal(params.get('level'),'A1.2');assert.equal(params.has('lesson'),false);assert.equal(params.has('exercise'),false);
 assert.deepEqual(labels(),['A1.2','M','L']);assert.equal(d.querySelector('#workspaceBlockControls').hidden,true);
 let reloaded=fixture(false,{search:s.location.search});assert.deepEqual([...reloaded.document.querySelectorAll('#workspaceCourseControls button')].map(el=>el.textContent),['A1.2','M','L']);
 openPanel(s,'module');s.click([...d.querySelectorAll('.workspace-panel-option')].find(el=>el.querySelector('strong').textContent.includes('6')));
 params=new URLSearchParams(s.location.search);assert.equal(params.get('selection'),'module');assert.equal(params.get('whale'),'6');assert.equal(params.has('lesson'),false);assert.equal(params.has('exercise'),false);
 assert.deepEqual(labels(),['A1.2','M6','L']);assert.equal(d.querySelector('#workspaceBlockControls').hidden,true);
 reloaded=fixture(false,{search:s.location.search});assert.deepEqual([...reloaded.document.querySelectorAll('#workspaceCourseControls button')].map(el=>el.textContent),['A1.2','M6','L']);
 openPanel(s,'lesson');assert.equal(d.querySelector('.workspace-lesson-overview'),null);chooseLesson(s,'a1-2-w6-l1');
 assert.deepEqual(labels(),['A1.2','M6','L1']);assert.equal(new URLSearchParams(s.location.search).has('selection'),false);assert.equal(d.querySelectorAll('#workspaceBlockControls button').length,4);
});
test('hover and keyboard focus show a label without opening a panel or changing the exercise',()=>{
 const s=fixture(),d=s.document,root=d.querySelector('#workspaceExercise'),exercise=root.firstElementChild,search=s.location.search;
 const control=d.querySelector('.selector-level');s.event(control,'pointerover');
 const tooltip=d.querySelector('#workspaceControlTooltip');assert.equal(tooltip.hidden,false);assert.equal(tooltip.textContent,'Level');assert.equal(control.getAttribute('aria-describedby'),tooltip.id);
 assert.equal(d.querySelector('#workspaceMenuPanel').hidden,true);assert.equal(s.location.search,search);assert.equal(root.firstElementChild,exercise);
 s.event(control,'pointerout');assert.equal(tooltip.hidden,true);
 const words=d.querySelector('#workspaceBlockControls [data-block="words"]');s.event(words,'focusin');assert.equal(tooltip.textContent,'Discovery Words');assert.equal(tooltip.hidden,false);
 assert.equal(d.querySelector('#workspaceMenuPanel').hidden,true);assert.equal(root.firstElementChild,exercise);
 s.event(words,'focusout');assert.equal(tooltip.hidden,true);assert.equal(words.hasAttribute('aria-describedby'),false);
});
test('close button, Escape and outside click collapse the panel without remounting the exercise',()=>{
 const s=fixture(),d=s.document,root=d.querySelector('#workspaceExercise'),exercise=root.firstElementChild,search=s.location.search;
 openPanel(s,'lesson');s.click(d.querySelector('#workspaceMenuClose'));assert.equal(d.querySelector('#workspaceMenuPanel').hidden,true);
 openPanel(s,'level');s.event(d,'keydown',{key:'Escape'});assert.equal(d.querySelector('#workspaceMenuPanel').hidden,true);
 openPanel(s,'module');s.event(root,'pointerdown');assert.equal(d.querySelector('#workspaceMenuPanel').hidden,true);
 assert.equal(s.location.search,search);assert.equal(root.firstElementChild,exercise);assert.equal(d.querySelector('.reference-app').classList.contains('workspace-menu-open'),false);
});
test('rail navigation and reload retain existing saved answers and stable exercise IDs',()=>{
 const s=fixture(false,{search:'?view=library&level=A1.2&whale=4&lesson=a1-2-w4-l1&exercise=a12w4l1-words'});
 const initial=s.mounts.at(-1),answers={'picture-coat':'coat'};initial.config.onChange(answers);
 s.click(s.document.querySelector('#workspaceBlockControls [data-block="language"]'));s.click(s.document.querySelector('#workspaceBlockControls [data-block="words"]'));
 assert.equal(s.mounts.at(-1).exercise.id,'a12w4l1-words');assert.equal(JSON.stringify(s.mounts.at(-1).config.answers),JSON.stringify(answers));
 const restored=fixture(false,{search:s.location.search,sessionStorage:s.sessionStorage,localStorage:s.localStorage});
 assert.equal(restored.mounts.at(-1).exercise.id,'a12w4l1-words');assert.equal(JSON.stringify(restored.mounts.at(-1).config.answers),JSON.stringify(answers));
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

test('new pupil action acknowledges immediately while the server prepares the room',async()=>{
 let finish;const s=fixture(true,{createInvitation:()=>new Promise(resolve=>{finish=resolve;})});await settled();
 s.click(s.document.getElementById('newGuestLesson'));const create=[...s.document.querySelectorAll('.workspace-session-dialog button')].find(b=>b.textContent==='Новый ученик');s.click(create);
 assert.equal(create.textContent,'Создаём ссылку…');assert.equal(create.getAttribute('aria-busy'),'true');assert.equal(create.disabled,true);
 assert.match(s.document.querySelector('.workspace-session-dialog [role=status]').textContent,/готовим новую/);
 finish();await settled();assert.equal(new URL(s.location.href).searchParams.get('room'),'new-token');
});
