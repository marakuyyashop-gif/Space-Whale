import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createHandler} from '../supabase/functions/daily-session/handler.mjs';
const raw='a'.repeat(64),hash=s=>createHash('sha256').update(s).digest('hex'),time=1780000000000;
const sid='12345678-1234-1234-1234-123456789abc';
function fixture(options={}){
 const events=[],rooms=new Map(),tokens=[];
 const row={token_hash:hash(raw),teacher_id:'owner',active:true,expires_at:new Date(time+86400000).toISOString(),started_at:new Date(time).toISOString(),daily_room_name:null,...options.row};
 const session={id:sid,teacher_id:'owner',student_id:'pupil',status:'live',...options.session};
 const repo={guest:async h=>h===row.token_hash?{...row}:null,markRoom:async(h,n)=>{events.push('mark');if(!row.active)return false;row.daily_room_name=n;return true;},clearRoom:async()=>{events.push('clear');row.daily_room_name=null;},revokeGuest:async()=>{events.push('revoke');row.active=false;},revokeAll:async()=>{events.push('revoke-all');row.active=false;},pendingRooms:async()=>row.daily_room_name?[{...row}]:[],createInvitation:async()=>{events.push('create');return {token:'b'.repeat(64)};},session:async id=>id===sid?{...session}:null,participantRole:async()=>null,endSession:async()=>{session.status='completed';}};
 const daily=async(path,method='GET',body)=>{
  events.push(method+' '+path);
  if(options.failDaily)throw Object.assign(new Error('private upstream detail'),{safeCode:'TEST_FAILURE'});
  if(path==='/rooms'){const data={url:'https://test.daily.co/'+body.name,config:body.properties};rooms.set(body.name,data);return {status:200,data};}
  if(path==='/meeting-tokens'){tokens.push(body.properties);if(options.endDuringToken)row.active=false;return {status:200,data:{token:'secret-token'}};}
  const name=path.split('/')[2];
  if(path.endsWith('/presence'))return {status:200,data:{data:[{id:'peer-1'}]}};
  if(path.endsWith('/eject'))return {status:200,data:{ejectedIds:body.ids}};
  if(method==='DELETE'){rooms.delete(name);return {status:200,data:{deleted:true}};}
  if(!rooms.has(name))return {status:404,data:{}};
  if(method==='POST'){if(body.properties.exp)assert.ok(body.properties.exp>time/1000,'Daily only accepts future room expiration');Object.assign(rooms.get(name).config,body.properties);}
  return {status:200,data:rooms.get(name)};
 };
 const handler=createHandler({repo,daily,hash,now:()=>time,verifyUser:async header=>header==='Bearer owner'?{id:'owner',teacher:true}:header==='Bearer stranger'?{id:'stranger',teacher:true}:header==='Bearer pupil'?{id:'pupil',teacher:false}:null});
 const request=async(body,auth)=>{const r=await handler(new Request('https://local',{method:'POST',headers:auth?{Authorization:'Bearer '+auth}:{},body:JSON.stringify(body)}));return {status:r.status,data:await r.json()};};
 return {request,row,session,rooms,tokens,events,options};
}
test('guest capabilities are hashed; waiting pupil receives no room or token',async()=>{
 const s=fixture({row:{started_at:null}});const r=await s.request({guestToken:raw,role:'teacher'});assert.equal(r.status,425);assert.equal(s.tokens.length,0);assert.equal(s.rooms.size,0);
});
test('verified invitation owner can prepare video before Start; pupil joins the same private room after Start',async()=>{
 const s=fixture({row:{started_at:null}});const teacher=await s.request({guestToken:raw},'owner');assert.equal(teacher.status,200);assert.equal(teacher.data.role,'teacher');assert.equal(s.tokens[0].is_owner,true);
 s.row.started_at=new Date(time).toISOString();const pupil=await s.request({guestToken:raw});assert.equal(pupil.status,200);assert.equal(pupil.data.roomUrl,teacher.data.roomUrl);assert.equal(pupil.data.role,'student');assert.equal(s.tokens[1].is_owner,false);assert.notEqual(s.tokens[1].user_id,s.tokens[0].user_id);assert.equal(s.tokens[1].enable_screenshare,false);
 assert.equal([...s.rooms.values()][0].config.max_participants,12);assert.equal(s.row.daily_room_name.includes(raw),false);assert.equal(s.events[0],'mark');
});
test('wrong/expired/revoked invitations and forged teacher roles never get tokens',async()=>{
 for(const change of [{active:false},{expires_at:new Date(time-1000).toISOString()}]){const s=fixture({row:change});assert.equal((await s.request({guestToken:raw,role:'teacher'})).status,403);assert.equal(s.tokens.length,0);}
 const s=fixture();assert.equal((await s.request({guestToken:'c'.repeat(64)})).status,403);assert.equal((await s.request({guestToken:'bad'})).status,403);
 assert.equal((await s.request({guestToken:raw,role:'teacher'},'stranger')).data.role,'student');
});
test('only the invitation owner can finish; Finish expires/ejects/deletes and denies reuse',async()=>{
 const s=fixture();await s.request({guestToken:raw},'owner');
 for(const who of [undefined,'pupil','stranger'])assert.equal((await s.request({action:'end',guestToken:raw},who)).status,403);
 assert.equal(s.row.active,true);
 assert.equal((await s.request({action:'end',guestToken:raw},'owner')).status,200);
 assert.equal(s.rooms.size,0);assert.equal(s.row.daily_room_name,null);assert.ok(s.events.some(e=>e.endsWith('/eject')));assert.equal((await s.request({guestToken:raw})).status,403);
 assert.equal((await s.request({action:'end',guestToken:raw},'owner')).status,200);
});
test('rotation closes old room before creating a clean invitation',async()=>{
 const s=fixture();await s.request({guestToken:raw});assert.equal((await s.request({action:'rotate'},'pupil')).status,403);
 const result=await s.request({action:'rotate'},'owner');assert.equal(result.status,200);assert.equal(s.rooms.size,0);assert.equal(s.events.at(-1),'create');assert.ok(s.events.indexOf('revoke-all')<s.events.indexOf('clear'));
});
test('cleanup failures retain the room marker and permit safe retry, without creating a new link',async()=>{
 const s=fixture();await s.request({guestToken:raw});s.options.failDaily=true;
 assert.equal((await s.request({action:'rotate'},'owner')).status,503);assert.equal(s.row.active,false);assert.ok(s.row.daily_room_name);assert.ok(!s.events.includes('create'));
 s.options.failDaily=false;assert.equal((await s.request({action:'rotate'},'owner')).status,200);assert.equal(s.row.daily_room_name,null);
});
test('Finish during token issuance cannot leak a valid join response or leave a room behind',async()=>{
 const s=fixture({endDuringToken:true});const r=await s.request({guestToken:raw});assert.equal(r.status,403);assert.equal(r.data.meetingToken,undefined);assert.equal(s.rooms.size,0);assert.equal(s.row.daily_room_name,null);
});
test('account sessions require verified membership and reject ended or not-yet-started lessons',async()=>{
 const s=fixture();assert.equal((await s.request({sessionId:sid})).status,401);assert.equal((await s.request({sessionId:sid},'stranger')).status,403);
 assert.equal((await s.request({sessionId:sid},'owner')).data.role,'teacher');assert.equal((await s.request({sessionId:sid},'pupil')).data.role,'student');
 s.session.status='scheduled';assert.equal((await s.request({sessionId:sid},'pupil')).status,425);
 s.session.status='completed';assert.equal((await s.request({sessionId:sid},'owner')).status,403);
});
test('account session finish is owner-only and stops token reissue',async()=>{
 const s=fixture();await s.request({sessionId:sid},'owner');assert.equal((await s.request({sessionId:sid,action:'end'},'pupil')).status,403);
 assert.equal((await s.request({sessionId:sid,action:'end'},'owner')).status,200);assert.equal(s.session.status,'completed');assert.equal(s.rooms.size,0);
});

test('one invitation supports distinct guests, stable retries, and cannot impersonate its owner',async()=>{
 const s=fixture();const first='11111111-1111-4111-8111-111111111111',second='22222222-2222-4222-8222-222222222222';
 await s.request({guestToken:raw},'owner');
 for(const id of [first,second,first])assert.equal((await s.request({guestToken:raw,participantId:id,role:'teacher'})).status,200);
 assert.equal(s.rooms.size,1);assert.equal(s.tokens[1].user_id,s.tokens[3].user_id);assert.notEqual(s.tokens[1].user_id,s.tokens[2].user_id);
 assert.notEqual(s.tokens[0].user_id,s.tokens[1].user_id);assert.ok(s.tokens.slice(1).every(t=>t.is_owner===false));
 assert.equal((await s.request({guestToken:raw,participantId:'owner'})).status,400);
});
test('old active rooms upgrade capacity without extending their lifetime',async()=>{
 const s=fixture();await s.request({guestToken:raw});const room=[...s.rooms.values()][0],expiry=room.config.exp;room.config.max_participants=2;
 assert.equal((await s.request({guestToken:raw})).status,200);assert.equal(room.config.max_participants,12);assert.equal(room.config.exp,expiry);
});
