// Transport-independent authorization/lifecycle logic. No secrets in responses or logs.
const closed = status => ['completed','cancelled','ended','closed'].includes(status);
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const cors = {'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info','Access-Control-Allow-Methods':'POST, OPTIONS','Cache-Control':'no-store'};
class HttpError extends Error { constructor(status,code){super(code);this.status=status;} }
const deny = (status,code) => {throw new HttpError(status,code);};
export function createHandler({repo,verifyUser,daily,hash,now=()=>Date.now()}) {
  const reply=(status,data)=>new Response(JSON.stringify(data),{status,headers:{...cors,'Content-Type':'application/json'}});
  const alive=row=>row?.active && Date.parse(row.expires_at)>now();
  async function removeRoom(name){
    // Expire first: previously issued tokens cannot enter while we eject occupants.
    const room=await daily(`/rooms/${name}`,'POST',{properties:{exp:Math.floor(now()/1000)-1,eject_at_room_exp:true}},[404]);
    if(room.status===404)return;
    const presence=await daily(`/rooms/${name}/presence`,'GET',undefined,[404]);
    const ids=(presence.data?.data||[]).map(p=>p.id).filter(Boolean);
    if(ids.length)await daily(`/rooms/${name}/eject`,'POST',{ids},[404]);
    await daily(`/rooms/${name}`,'DELETE',undefined,[404]);
  }
  async function cleanGuest(row){
    if(!row.daily_room_name)return;
    await removeRoom(row.daily_room_name);
    await repo.clearRoom(row.token_hash,row.daily_room_name);
  }
  return async req=>{
    if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
    if(req.method!=='POST')return reply(405,{error:'METHOD_NOT_ALLOWED'});
    try {
      const text=await req.text();if(text.length>4096)deny(413,'REQUEST_TOO_LARGE');
      let body;try{body=JSON.parse(text);}catch{deny(400,'INVALID_JSON');}
      if(!body || typeof body!=='object' || Array.isArray(body))deny(400,'INVALID_REQUEST');
      const action=body.action||'join';if(!['join','end','rotate'].includes(action))deny(400,'INVALID_ACTION');
      const user=await verifyUser(req.headers.get('authorization'));
      if(action==='rotate'){
        if(!user?.teacher)deny(403,'TEACHER_REQUIRED');
        // Revoke all old capabilities first. Keep room markers if Daily is unavailable,
        // so a retry can finish cleanup without losing the old room's identity.
        await repo.revokeAll(user.id);
        const rooms=await repo.pendingRooms(user.id);
        for(const row of rooms)await cleanGuest(row);
        const invitation=await repo.createInvitation(user);
        return reply(200,{ok:true,...invitation});
      }
      let guest=null,session=null,role,roomName,userId,expiresAt;
      if(body.guestToken!==undefined){
        if(typeof body.guestToken!=='string'||!/^[a-f0-9]{64}$/.test(body.guestToken))deny(403,'INVALID_INVITATION');
        guest=await repo.guest(await hash(body.guestToken));
        if(!guest)deny(403,'INVALID_INVITATION');
        role=user?.teacher&&user.id===guest.teacher_id?'teacher':'student';
        roomName='sw-g-'+guest.token_hash.slice(0,48);
        userId=role==='teacher'?user.id:'guest-'+guest.token_hash.slice(0,40);
        expiresAt=Math.floor(Date.parse(guest.expires_at)/1000);
        if(action==='end'){
          if(role!=='teacher')deny(403,'TEACHER_REQUIRED');
          await repo.revokeGuest(guest.token_hash,user.id);
          await cleanGuest(guest);
          return reply(200,{ok:true,ended:true});
        }
        if(!alive(guest)){
          // Also recover cleanup after a tab was closed during Finish Lesson.
          try{await cleanGuest(guest);}catch{/* Marker retained for the owner's retry. */}
          deny(403,'INVITATION_CLOSED');
        }
        if(role==='student'&&!guest.started_at)deny(425,'LESSON_NOT_STARTED');
        // Mark BEFORE creating a room, so concurrent end/rotate can find it.
        if(!await repo.markRoom(guest.token_hash,roomName))deny(403,'INVITATION_CLOSED');
      }else{
        if(!user)deny(401,'LOGIN_REQUIRED');
        if(typeof body.sessionId!=='string'||!uuid.test(body.sessionId))deny(400,'INVALID_SESSION');
        session=await repo.session(body.sessionId);
        if(!session)deny(403,'SESSION_ACCESS_DENIED');
        role=session.teacher_id===user.id&&user.teacher?'teacher':session.student_id===user.id?'student':await repo.participantRole(session.id,user.id);
        // A participant row never grants owner privileges to an unapproved teacher.
        if(!['teacher','student'].includes(role)||role==='teacher'&&!user.teacher)deny(403,'SESSION_ACCESS_DENIED');
        roomName='space-whale-'+session.id;userId=user.id;
        expiresAt=Math.floor(now()/1000)+4*3600;
        if(action==='end'){
          if(role!=='teacher')deny(403,'TEACHER_REQUIRED');
          await repo.endSession(session.id);await removeRoom(roomName);
          return reply(200,{ok:true,ended:true});
        }
        if(closed(session.status))deny(403,'SESSION_CLOSED');
        if(role==='student'&&session.status!=='live')deny(425,'LESSON_NOT_STARTED');
      }
      const expiry=Math.min(expiresAt,Math.floor(now()/1000)+4*3600);
      let room=await daily(`/rooms/${roomName}`,'GET',undefined,[404]);
      if(room.status===404){
        room=await daily('/rooms','POST',{name:roomName,privacy:'private',properties:{exp:expiry,eject_at_room_exp:true,max_participants:2,enforce_unique_user_ids:true,enable_chat:false,enable_screenshare:true,start_video_off:true,start_audio_off:true}},[400,409]);
        if([400,409].includes(room.status))room=await daily(`/rooms/${roomName}`,'GET');
      }
      const tokenExpiry=Math.min(expiry,room.data?.config?.exp||expiry);
      if(tokenExpiry<=Math.floor(now()/1000))deny(403,'VIDEO_ROOM_EXPIRED');
      const token=await daily('/meeting-tokens','POST',{properties:{room_name:roomName,is_owner:role==='teacher',user_id:userId,user_name:role==='teacher'?'Преподаватель':'Ученик',exp:tokenExpiry,eject_at_token_exp:true,enable_screenshare:role==='teacher',start_video_off:true,start_audio_off:true}});
      // A concurrent Finish/rotation must never result in a newly returned token.
      const latest=guest?await repo.guest(guest.token_hash):await repo.session(session.id);
      if(guest?!alive(latest):!latest||closed(latest.status)){
        await removeRoom(roomName);
        if(guest)await repo.clearRoom(guest.token_hash,roomName);
        deny(403,'SESSION_CLOSED');
      }
      if(!room.data?.url||!token.data?.token)throw new Error('INVALID_DAILY_RESPONSE');
      return reply(200,{ok:true,roomUrl:room.data.url,meetingToken:token.data.token,role});
    }catch(error){
      if(error instanceof HttpError)return reply(error.status,{error:error.message});
      // Upstream responses may contain meeting tokens, request headers or PII.
      console.error('daily-session request failed',error?.safeCode||'INTERNAL');
      return reply(503,{error:'VIDEO_TEMPORARILY_UNAVAILABLE'});
    }
  };
}
