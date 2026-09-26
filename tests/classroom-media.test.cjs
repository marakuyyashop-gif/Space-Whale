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
 const window={spaceWhaleSupabase:client,addEventListener:(name,fn)=>{events[name]=fn;},DailyIframe:{createCallObject:()=>{
  const handlers={};const call={handlers,on(name,fn){handlers[name]=fn;return call;},participants:()=>media,
   async join(data){calls.push(['join',data]);if(options.join)await options.join();},async leave(){calls.push(['leave']);handlers['left-meeting']?.();},async destroy(){calls.push(['destroy']);},
   localVideo:()=>media.local.video,localAudio:()=>media.local.audio,
   setLocalVideo(value){media.local.video=value;calls.push(['camera',value]);handlers['participant-updated']?.();},
   setLocalAudio(value){media.local.audio=value;calls.push(['mic',value]);handlers['participant-updated']?.();}};instances.push(call);return call;
 }}};
 class MediaStream{constructor(tracks){this.tracks=tracks;}getTracks(){return this.tracks;}}
 vm.runInNewContext(script,{window,document,MediaStream,URL,AbortController,setTimeout,clearTimeout,console});
 const click=id=>document.getElementById(id).dispatchEvent(new dom.Event('click'));
 return {document,api:window.SpaceWhaleMedia,events,calls,requests,instances,media,click,options};
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
