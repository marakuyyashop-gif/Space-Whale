const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
test('guest peers synchronize through authorized state, recover and stop on revocation',async()=>{
  const room={active:true,current_page_id:'?lesson=one',current_exercise_id:'e1',responses:{}};
  const make=host=>{
    const timers=new Map(),received=[];let counter=0,offline=false,ended=false,route,reconnects=0;
    const client={auth:{async getUser(){return {data:{user:host?{id:'owner'}:null}};}},channel(){throw new Error('Guests must not join public channels');},
      async rpc(name,args){
        if(offline)return {error:new Error('offline')};
        if(name==='resolve_guest_lesson_link')return {data:room.active?{is_host:host,allowed_lesson_ids:['*'],responses:room.responses}:null};
        if(name==='read_guest_workspace')return {data:room.active?{...room,response:room.responses[room.current_exercise_id]}:null};
        if(!room.active)return {data:false};
        if(name==='save_guest_lesson_navigation'){if(!host)return {data:false};room.current_page_id=args.p_current_page_id;room.current_exercise_id=args.p_current_exercise_id;return {data:true};}
        room.responses[args.p_exercise_id]=args.p_response;return {data:true};
      }};
    const window={spaceWhaleSupabase:client};
    vm.runInNewContext(fs.readFileSync(require.resolve('../classroom-realtime.js'),'utf8'),{window,console,AbortController,setTimeout(fn){timers.set(++counter,fn);return counter;},clearTimeout(id){timers.delete(id);}});
    return {api:window.SpaceWhaleClassroom,timers,received,setOffline(v){offline=v;},get ended(){return ended;},get route(){return route;},get reconnects(){return reconnects;},handlers:{onNavigate(v){route=v;},onExerciseDatabaseChange(v){received.push(v);},onEnded(){ended=true;},onReconnect(){reconnects++;}}};
  };
  const teacher=make(true),student=make(false);
  await teacher.api.connectGuest('same-room',teacher.handlers);await student.api.connectGuest('same-room',student.handlers);
  await student.api.sendExerciseDraft('e1',{answer:'hello'});await student.api.flushPendingSnapshots();await teacher.api.requestExerciseState('e1');
  assert.equal(teacher.received.at(-1).response.answer,'hello');
  await teacher.api.navigate('e2','?lesson=two');await student.api.requestExerciseState('e2');assert.equal(student.route.current_exercise_id,'e2');
  await assert.rejects(student.api.navigate('e3','spoof'),/Only the teacher/);
  student.setOffline(true);await student.api.requestExerciseState('e2');student.setOffline(false);await student.api.requestExerciseState('e2');assert.equal(student.reconnects,1);
  room.active=false;await student.api.requestExerciseState('e2');assert.equal(student.ended,true);
  await assert.rejects(student.api.sendExerciseDraft('e2',{}),/закрыто/);
  await teacher.api.disconnect();await student.api.disconnect();assert.equal(teacher.timers.size,0);assert.equal(student.timers.size,0);
});

test('failed snapshots survive reload, retry, and retain the newest answer',async()=>{
  const storage=new Map(),saved=[],timers=new Map();let fail=true,subscription,counter=0;
  const make=()=>{
    const channel={on(){return this;},subscribe(fn){subscription=fn;queueMicrotask(()=>fn('SUBSCRIBED'));return this;},async track(){},async send(){return 'ok';}};
    const client={auth:{async getUser(){return {data:{user:null}};}},channel(){return channel;},async removeChannel(){},
      async rpc(name,args){if(name==='resolve_guest_lesson_link')return {data:{is_host:false,room_topic:'r',allowed_lesson_ids:['*']}};
        if(fail)return {error:new Error('offline')};saved.push(args.p_response);return {data:true};}};
    const window={spaceWhaleSupabase:client,sessionStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)}};
    vm.runInNewContext(fs.readFileSync(require.resolve('../classroom-realtime.js'),'utf8'),{window,AbortController,console:{error(){}},setTimeout(fn){timers.set(++counter,fn);return counter;},clearTimeout(id){timers.delete(id);}});
    return window.SpaceWhaleClassroom;
  };
  let api=make();await api.connectGuest('recovery-token');
  await api.sendExerciseDraft('e1',{answer:'old'});
  await api.flushPendingSnapshots();assert.equal(api.getPendingSnapshot('e1').answer,'old');
  timers.clear();api=make();await api.connectGuest('recovery-token');
  assert.equal(api.getPendingSnapshot('e1').answer,'old');
  await api.sendExerciseDraft('e1',{answer:'new'});fail=false;
  await api.flushPendingSnapshots();assert.equal(saved.at(-1).answer,'new');assert.equal(api.getPendingSnapshot('e1'),undefined);
  await api.disconnect();assert.equal(timers.size,0);
});

test('authenticated session invokes recovery after resubscription',async()=>{
  let subscription,reconnected=0;
  const channel={on(){return this;},subscribe(fn){subscription=fn;queueMicrotask(()=>fn('SUBSCRIBED'));return this;},async track(){}};
  const query={select(){return this;},eq(){return this;},async single(){return {data:{id:'s1',teacher_id:'t1',student_id:'u1',room_topic:'room'}};}};
  const client={auth:{async getUser(){return {data:{user:{id:'u1'}}};}},from(){return query;},channel(){return channel;},async removeChannel(){}};
  const window={spaceWhaleSupabase:client};
  vm.runInNewContext(fs.readFileSync(require.resolve('../classroom-realtime.js'),'utf8'),{window,console,AbortController,setTimeout,clearTimeout});
  await window.SpaceWhaleClassroom.connect('s1',{onReconnect(){reconnected++;}});
  assert.equal(reconnected,0);await subscription('SUBSCRIBED');assert.equal(reconnected,1);
  await window.SpaceWhaleClassroom.disconnect();
});

test('waiting guest receives the start transition even when navigation has not changed',async()=>{
 let startedAt=null;const events=[],window={spaceWhaleSupabase:{auth:{getUser:async()=>({data:{user:null}})},rpc:async(name)=>({data:name==='resolve_guest_lesson_link'?{is_host:false,allowed_lesson_ids:[],status:'waiting'}:{status:startedAt?'live':'waiting',started_at:startedAt,server_now:new Date().toISOString(),duration_minutes:60,current_page_id:startedAt?'?lesson=one':null,current_exercise_id:startedAt?'e1':null}})}};
 vm.runInNewContext(fs.readFileSync(require.resolve('../classroom-realtime.js'),'utf8'),{window,console,AbortController,setTimeout:()=>1,clearTimeout(){}});
 const api=window.SpaceWhaleClassroom;
 await api.connectGuest('waiting-test',{onLessonState:data=>events.push(['state',data.status]),onNavigate:()=>events.push(['navigate'])});
 await api.requestExerciseState('e1');assert.deepEqual(events[0],['state','waiting']);
 await assert.rejects(api.startGuestLesson(),/Only the teacher/);
 events.length=0;startedAt=new Date().toISOString();await api.requestExerciseState('e1');
 assert.deepEqual(events[0],['state','live']);assert.deepEqual(events[1],['navigate']);
 await api.disconnect();
});

test('private websocket drafts arrive before a stalled database save; snapshots have a bounded debounce',async()=>{
 const peers=[],scheduled=[],received=[],focus=[],audio=[],video=[];let writes=0;
 const make=(owner=false)=>{
  const channels=[];
  const client={auth:{getUser:async()=>({data:{user:null}})},rpc:async(name)=>{
   if(name==='resolve_guest_lesson_link')return {data:{is_host:owner,room_topic:'private-test',started_at:new Date().toISOString(),allowed_lesson_ids:['*']}};
   if(name.includes('response')){writes++;return new Promise(()=>{});}
   return {data:{started_at:new Date().toISOString()}};
  },channel(topic,options){
   assert.equal(options.config.private,true);const handlers={};
   const ch={topic,state:'joined',on(type,filter,fn){handlers[type+':'+filter.event]=fn;return this;},subscribe(fn){queueMicrotask(()=>fn('SUBSCRIBED'));return this;},track:async()=>{},presenceState:()=>({}),send:async msg=>{for(const p of peers)if(p!==ch&&p.topic===topic)p.deliver(msg);return 'ok';},deliver(msg){handlers['broadcast:'+msg.event]?.({payload:msg.payload});}};
   channels.push(ch);peers.push(ch);return ch;
  },removeChannel:async()=>{}};
  const window={spaceWhaleSupabase:client};let next=0;
  vm.runInNewContext(fs.readFileSync(require.resolve('../classroom-realtime.js'),'utf8'),{window,console,AbortController,queueMicrotask,setTimeout(fn,delay){scheduled.push({id:++next,fn,delay});return next;},clearTimeout(){}});
  return window.SpaceWhaleClassroom;
 };
 const first=make(),second=make();await first.connectGuest('one');await second.connectGuest('one',{onExerciseDraft:p=>received.push(p.response),onWordFocus:p=>focus.push(p),onAudio:p=>audio.push(p),onVideoView:p=>video.push(p)});await Promise.resolve();
 const teacher=make(true);await teacher.connectGuest('one');await Promise.resolve();
 await teacher.syncAudio({exercise_id:'e1',key:'phrase',action:'play',position:0,at:Date.now()+250});
 await teacher.broadcast('video_view',{view:'mini',source_id:teacher.state.clientId});assert.equal(video.at(-1).view,'mini');
 await assert.rejects(first.broadcast('video_view',{view:'mini'}),/Only the teacher/);
 assert.equal(audio.at(-1).action,'play');assert.equal(writes,0,'audio bypasses database writes');
 await assert.rejects(first.syncAudio({action:'play'}),/Only the teacher/);
 await assert.rejects(first.broadcast('audio',{action:'play'}),/Only the teacher/);
 await first.broadcast('word_focus',{exercise_id:'e1',kind:'hover',word:{key:'paragraph:0',text:'Hello'},source_id:first.state.clientId});
 assert.equal(focus.at(-1).word.text,'Hello');assert.equal(writes,0,'word focus uses the existing socket without answer snapshots');
 await first.sendExerciseDraft('e1',{text:'a'});await first.sendExerciseDraft('e1',{text:'ab'});
 assert.equal(received.at(-1).text,'ab');assert.equal(writes,0);
 const saveJobs=scheduled.filter(t=>t.delay===1500);assert.equal(saveJobs.length,1,'continuous edits do not reset the persistence timer');
 void saveJobs[0].fn();await Promise.resolve();assert.equal(writes,1);
 await first.sendExerciseDraft('e1',{text:'abc'});assert.equal(received.at(-1).text,'abc','slow DB cannot block the socket');
});
