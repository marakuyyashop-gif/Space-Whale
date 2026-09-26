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
    vm.runInNewContext(fs.readFileSync(require.resolve('../classroom-realtime.js'),'utf8'),{window,console,setTimeout(fn){timers.set(++counter,fn);return counter;},clearTimeout(id){timers.delete(id);}});
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
    vm.runInNewContext(fs.readFileSync(require.resolve('../classroom-realtime.js'),'utf8'),{window,console:{error(){}},setTimeout(fn){timers.set(++counter,fn);return counter;},clearTimeout(id){timers.delete(id);}});
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
  vm.runInNewContext(fs.readFileSync(require.resolve('../classroom-realtime.js'),'utf8'),{window,console,setTimeout,clearTimeout});
  await window.SpaceWhaleClassroom.connect('s1',{onReconnect(){reconnected++;}});
  assert.equal(reconnected,0);await subscription('SUBSCRIBED');assert.equal(reconnected,1);
  await window.SpaceWhaleClassroom.disconnect();
});

test('waiting guest receives the start transition even when navigation has not changed',async()=>{
 let startedAt=null;const events=[],window={spaceWhaleSupabase:{auth:{getUser:async()=>({data:{user:null}})},rpc:async(name)=>({data:name==='resolve_guest_lesson_link'?{is_host:false,allowed_lesson_ids:[],status:'waiting'}:{status:startedAt?'live':'waiting',started_at:startedAt,server_now:new Date().toISOString(),duration_minutes:60,current_page_id:startedAt?'?lesson=one':null,current_exercise_id:startedAt?'e1':null}})}};
 vm.runInNewContext(fs.readFileSync(require.resolve('../classroom-realtime.js'),'utf8'),{window,console,setTimeout:()=>1,clearTimeout(){}});
 const api=window.SpaceWhaleClassroom;
 await api.connectGuest('waiting-test',{onLessonState:data=>events.push(['state',data.status]),onNavigate:()=>events.push(['navigate'])});
 await api.requestExerciseState('e1');assert.deepEqual(events[0],['state','waiting']);
 await assert.rejects(api.startGuestLesson(),/Only the teacher/);
 events.length=0;startedAt=new Date().toISOString();await api.requestExerciseState('e1');
 assert.deepEqual(events[0],['state','live']);assert.deepEqual(events[1],['navigate']);
 await api.disconnect();
});
