const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
test('guest transport permits both editors, persists merged envelopes and verifies navigation',async()=>{
  for(const host of [true,false]){
    const calls=[],listeners={},timers=new Map();let subscription,reconnected=0,route,ack='ok';
    const channel={
      on(type,filter,fn){listeners[type+':'+filter.event]=fn;return this;},
      subscribe(fn){subscription=fn;queueMicrotask(()=>fn('SUBSCRIBED'));return this;},
      async track(){}, async send(data){calls.push(data);return ack;}, presenceState(){return {};}
    };
    const client={auth:{async getUser(){return {data:{user:host?{id:'teacher'}:null}};}},
      channel(){return channel;},async removeChannel(){},
      async rpc(name,args){calls.push({name,args});return {data:name==='resolve_guest_lesson_link'?{is_host:host,room_topic:'test',allowed_lesson_ids:['*'],current_page_id:'verified',current_exercise_id:'e1'}:true};}
    };
    const window={spaceWhaleSupabase:client};let counter=0;
    vm.runInNewContext(fs.readFileSync(require.resolve('../classroom-realtime.js'),'utf8'),{
      window,console,setTimeout(fn){timers.set(++counter,fn);return counter;},clearTimeout(id){timers.delete(id);}
    });
    const api=window.SpaceWhaleClassroom;
    await api.connectGuest('token',{onReconnect(){reconnected++;},onNavigate(value){route=value;}});
    assert.equal(api.state.role,host?'teacher':'student');
    await api.sendExerciseDraft('e1',{__sw_collab:1,entries:{}});
    for(const [id,fn] of [...timers]) {timers.delete(id);await fn();}
    assert.ok(calls.some(c=>c.name==='merge_guest_lesson_response'));
    await listeners['broadcast:navigate']({payload:{current_page_id:'spoof'}});
    assert.equal(route.current_page_id,'verified');
    if(host) await api.navigate('e1','page');
    else await assert.rejects(api.navigate('e1','page'),/Only the teacher/);
    await subscription('SUBSCRIBED');assert.equal(reconnected,1);
    ack='timed out';await assert.rejects(api.sendExerciseDraft('e1',{}),/not delivered/);
    await api.disconnect();assert.equal(timers.size,0);
  }
});
