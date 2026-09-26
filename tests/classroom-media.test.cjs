const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {parseHTML}=require('linkedom');
const script=fs.readFileSync(require.resolve('../classroom-media.js'),'utf8');
const settle=()=>new Promise(resolve=>setImmediate(resolve));
function fixture(options={}){
 const {document,window:dom}=parseHTML(fs.readFileSync(require.resolve('../classroom.html'),'utf8'));
 const create=document.createElement.bind(document);document.createElement=tag=>{const el=create(tag);if(['video','audio'].includes(tag))el.play=async()=>{if(tag==='audio'&&options.blockAudio)throw Error('autoplay');};return el;};
 const events={},calls=[],requests=[];const media={local:{local:true,session_id:'local',user_name:'Teacher',audio:false,video:false,tracks:{}}};
 let invokeCount=0;
 const client={auth:{getSession:async()=>({data:{session:options.noAuth?null:{access_token:'private-auth'}}})},functions:{invoke:async(name,args)=>{
  requests.push({name,args});invokeCount++;
  if(options.invoke)return options.invoke(name,args);
  if(options.failOnce&&invokeCount===1)return {error:{context:{status:403}}};
  return {data:{roomUrl:'https://example.daily.co/session-1',meetingToken:'private-meeting-token',role:options.role||'teacher'}};
 }}};
 const instances=[];
 const window={crypto:{randomUUID:()=>options.participantId||'11111111-1111-4111-8111-111111111111'},innerWidth:options.mobile?390:1280,innerHeight:options.mobile?844:800,matchMedia:()=>({matches:Boolean(options.mobile)}),spaceWhaleSupabase:client,addEventListener:(name,fn)=>{events[name]=fn;},DailyIframe:{createCallObject:()=>{
  const handlers={};const call={handlers,on(name,fn){handlers[name]=fn;return call;},participants:()=>media,
   async join(data){calls.push(['join',data]);if(options.join)await options.join();},async leave(){calls.push(['leave']);handlers['left-meeting']?.();},async destroy(){calls.push(['destroy']);},
   localVideo:()=>media.local.video,localAudio:()=>media.local.audio,
   setLocalVideo(value){media.local.video=value;calls.push(['camera',value]);handlers['participant-updated']?.();},
   setLocalAudio(value){media.local.audio=value;calls.push(['mic',value]);handlers['participant-updated']?.();}};instances.push(call);return call;
 }}};
 class MediaStream{constructor(tracks){this.tracks=tracks;}getTracks(){return this.tracks;}}
 vm.runInNewContext(script,{window,document,MediaStream,URL,AbortController,setTimeout,clearTimeout,console});
 const click=id=>document.getElementById(id).dispatchEvent(new dom.Event('click'));
 return {window,dom,document,api:window.SpaceWhaleMedia,events,calls,requests,instances,media,click,options};
}
const session={sessionId:'session-1',role:'teacher',status:'live'};
test('authorized session requests its own token; camera and microphone use Daily only',async()=>{
 const s=fixture();assert.equal(await s.api.connect(session),true);assert.equal(s.requests[0].name,'daily-session');assert.equal(s.requests[0].args.body.sessionId,'session-1');
 assert.equal(s.calls[0][1].token,'private-meeting-token');assert.equal(s.calls[0][1].startVideoOff,true);
 s.click('cameraToggle');s.click('micToggle');await settle();assert.equal(s.document.getElementById('cameraToggle').getAttribute('aria-pressed'),'true');assert.ok(s.calls.some(c=>c[0]==='mic'&&c[1]));
 assert.equal(s.document.body.textContent.includes('private-meeting-token'),false);assert.equal(script.includes('getUserMedia'),false);
 await s.api.stopMedia();assert.equal(s.document.getElementById('videoDock').hidden,true);assert.equal(s.calls.at(-1)[0],'destroy');
});
test('guest tokens and closed sessions are not misused as authenticated session IDs',async()=>{
 const s=fixture();for(const next of [{...session,guest:true},{...session,status:'ended'},{...session,status:'cancelled'},{...session,role:'unknown'},{role:'student'}])assert.equal(await s.api.connect(next),false);
 assert.equal(s.requests.length,0);assert.equal(s.instances.length,0);
});
test('no login produces a clear error without invoking the token function',async()=>{
 const s=fixture({noAuth:true});assert.equal(await s.api.connect(session),false);assert.equal(s.requests.length,0);assert.match(s.document.getElementById('mediaStatus').textContent,/аккаунт/);
});
test('guest uses its invitation capability, without requiring or borrowing a teacher login',async()=>{
 const s=fixture({noAuth:true,role:'student'});
 assert.equal(await s.api.connect({...session,role:'student',guest:true,guestToken:'private-guest-capability'}),true);
 assert.equal(s.requests[0].args.body.guestToken,'private-guest-capability');assert.equal(s.requests[0].args.body.sessionId,undefined);
 assert.equal(s.document.body.textContent.includes('private-guest-capability'),false);await s.api.stopMedia();
});
test('room lifecycle commands use the authorized function, not local-only teardown',async()=>{
 const s=fixture({invoke:async()=>({data:{ok:true,token:'new-token'}})});
 await s.api.createInvitation();await s.api.endSession({guestToken:'old-token'});
 assert.equal(s.requests[0].args.body.action,'rotate');assert.equal(s.requests[1].args.body.action,'end');assert.equal(s.requests[1].args.body.guestToken,'old-token');
});
test('fatal call failure releases devices and allows an explicit reconnect',async()=>{
 const s=fixture();await s.api.connect(session);s.instances[0].handlers.error();await settle();assert.equal(s.api.state.call,null);assert.equal(s.api.state.phase,'error');assert.equal(s.calls.at(-1)[0],'destroy');
 s.click('mediaRetry');await settle();assert.equal(s.api.state.phase,'joined');await s.api.stopMedia();
});
test('server error leaves workspace available; retry obtains a fresh token',async()=>{
 const s=fixture({failOnce:true});await s.api.connect(session);assert.equal(s.api.state.phase,'error');assert.equal(s.document.getElementById('workspaceExercise').inert,undefined);
 s.click('mediaRetry');await settle();assert.equal(s.api.state.phase,'joined');assert.equal(s.requests.length,2);await s.api.stopMedia();
});
test('repeated connect calls share one in-flight request and one Daily instance',async()=>{
 const s=fixture();await Promise.all([s.api.connect(session),s.api.connect(session)]);assert.equal(s.requests.length,1);assert.equal(s.instances.length,1);await s.api.stopMedia();
});
test('leaving during a token request prevents late room entry',async()=>{
 let resolve;const s=fixture({invoke:()=>new Promise(r=>{resolve=r;})});const joining=s.api.connect(session);await settle();await s.api.stopMedia();resolve({data:{roomUrl:'https://example.daily.co/x',meetingToken:'secret',role:'teacher'}});assert.equal(await joining,false);assert.equal(s.instances.length,0);assert.equal(s.document.getElementById('videoDock').hidden,true);
});
test('student joins same returned room using its own token and role',async()=>{
 const s=fixture({role:'student'});assert.equal(await s.api.connect({...session,role:'student'}),true);assert.equal(s.calls[0][1].url,'https://example.daily.co/session-1');await s.api.stopMedia();
});
test('remote track changes update tiles; autoplay recovery and departure release media',async()=>{
 const s=fixture({blockAudio:true});await s.api.connect(session);
 s.media.remote={session_id:'remote',local:false,user_name:'Student',audio:true,video:true,tracks:{audio:{state:'playable',persistentTrack:{kind:'audio'}},video:{state:'playable',persistentTrack:{kind:'video'}}}};
 s.instances[0].handlers['participant-joined']();await settle();assert.equal(s.document.querySelectorAll('.workspace-video-tile').length,2);assert.equal(s.document.getElementById('mediaEnableAudio').hidden,false);
 s.options.blockAudio=false;s.click('mediaEnableAudio');await settle();assert.equal(s.document.getElementById('mediaEnableAudio').hidden,true);
 delete s.media.remote;s.instances[0].handlers['participant-left']();assert.equal(s.document.querySelectorAll('.workspace-video-tile').length,1);
 s.events.pagehide();await settle();assert.equal(s.document.querySelectorAll('.workspace-video-tile').length,0);
});

test('minimize/hide/restore never disconnects or changes device state',async()=>{
 const s=fixture({mobile:true});await s.api.connect(session);s.click('micToggle');await settle();
 s.click('mediaSize');assert.equal(s.api.state.view,'mini');
 s.click('mediaHide');assert.equal(s.api.state.view,'hidden');assert.equal(s.document.getElementById('mediaRestore').hidden,false);assert.equal(s.document.getElementById('videoDock').inert,true);
 assert.equal(s.media.local.audio,true);assert.equal(s.calls.filter(c=>c[0]==='destroy').length,0);
 s.click('mediaRestore');assert.equal(s.api.state.view,'mini');assert.equal(s.document.getElementById('videoDock').inert,false);
 s.click('mediaSize');assert.equal(s.api.state.view,'expanded');
 await s.api.stopMedia();assert.equal(s.document.getElementById('mediaRestore').hidden,true);
});
test('Start presents video once; repeated state sync does not reopen a minimized panel',async()=>{
 const s=fixture({mobile:true});await s.api.connect({...session,status:'waiting'});assert.equal(s.api.state.view,'mini');
 s.api.lessonStarted(session.sessionId);assert.equal(s.api.state.view,'expanded');s.api.setView('mini');
 await s.api.connect(session);assert.equal(s.api.state.view,'mini');assert.equal(s.instances.length,1);await s.api.stopMedia();
});
test('drag and keyboard movement clamp to viewport and recover on resize',async()=>{
 const s=fixture();await s.api.connect(session);s.api.setView('mini');
 const dock=s.document.getElementById('videoDock'),move=dock;
 dock.getBoundingClientRect=()=>({left:parseFloat(dock.style.left)||0,top:parseFloat(dock.style.top)||0,width:164,height:240});move.setPointerCapture=()=>{};
 const event=(type,props)=>{const e=new s.dom.Event(type,{cancelable:true});Object.assign(e,props);move.dispatchEvent(e);};
 event('pointerdown',{button:0,pointerId:1,clientX:10,clientY:10});event('pointermove',{pointerId:1,clientX:-3000,clientY:3000});
 assert.equal(dock.style.left,'8px');assert.equal(dock.style.top,'552px');event('pointerup',{pointerId:1});
 event('keydown',{key:'ArrowRight'});assert.equal(dock.style.left,'32px');
 s.window.innerHeight=400;s.events.resize();assert.equal(dock.style.top,'152px');await s.api.stopMedia();
});
test('group render includes every participant and guest token requests have a device identity',async()=>{
 const s=fixture({role:'student',noAuth:true});await s.api.connect({...session,role:'student',guest:true,guestToken:'capability'});
 assert.equal(s.requests[0].args.body.participantId,'11111111-1111-4111-8111-111111111111');
 for(let i=0;i<4;i++)s.media['peer'+i]={session_id:'peer'+i,local:false,user_name:'Ученик',tracks:{}};
 s.instances[0].handlers['participant-joined']();assert.equal(s.document.querySelectorAll('.workspace-video-tile').length,5);assert.equal(s.document.getElementById('videoDock').dataset.group,'true');
 assert.equal(s.document.querySelector('.workspace-video-tile').dataset.local,'false');await s.api.stopMedia();
});

test('compact mobile hides self, defaults to teacher and follows the remote active speaker',async()=>{
 const s=fixture({mobile:true,role:'student'});await s.api.connect({...session,role:'student'});
 s.media.teacher={session_id:'teacher',local:false,owner:true,tracks:{}};s.media.peer={session_id:'peer',local:false,owner:false,tracks:{}};
 s.instances[0].handlers['participant-joined']();s.api.setView('mini');
 const visible=()=>[...s.document.querySelectorAll('.workspace-video-tile')].filter(e=>!e.hidden);
 assert.equal(visible().length,1);assert.match(visible()[0].textContent,/Участник/);
 const first=visible()[0];s.instances[0].handlers['active-speaker-change']({activeSpeaker:{peerId:'peer'}});assert.notEqual(visible()[0],first);
 s.api.setView('expanded');assert.equal(visible().length,3);await s.api.stopMedia();
});
