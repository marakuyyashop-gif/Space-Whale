import { createClient } from 'npm:@supabase/supabase-js@2.117.2';
import { createHandler } from './handler.mjs';

const url=Deno.env.get('SUPABASE_URL')!;
const service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const publicKey=Deno.env.get('SUPABASE_ANON_KEY')!;
const apiKey=Deno.env.get('DAILY_API_KEY')!;
const options={auth:{persistSession:false,autoRefreshToken:false}};
const admin=createClient(url,service,options);
const checked=async(query:any)=>{const r=await query;if(r.error)throw new Error('DATABASE');return r.data;};
const fields='token_hash,teacher_id,active,expires_at,started_at,daily_room_name';
const repo={
  guest:(hash:string)=>checked(admin.from('guest_lesson_links').select(fields).eq('token_hash',hash).maybeSingle()),
  markRoom:async(hash:string,name:string)=>Boolean((await checked(admin.from('guest_lesson_links').update({daily_room_name:name}).eq('token_hash',hash).eq('active',true).gt('expires_at',new Date().toISOString()).select('token_hash')))?.length),
  clearRoom:(hash:string,name:string)=>checked(admin.from('guest_lesson_links').update({daily_room_name:null}).eq('token_hash',hash).eq('daily_room_name',name)),
  revokeGuest:(hash:string,id:string)=>checked(admin.from('guest_lesson_links').update({active:false,updated_at:new Date().toISOString()}).eq('token_hash',hash).eq('teacher_id',id)),
  revokeAll:(id:string)=>checked(admin.from('guest_lesson_links').update({active:false,updated_at:new Date().toISOString()}).eq('teacher_id',id).eq('active',true)),
  pendingRooms:(id:string)=>checked(admin.from('guest_lesson_links').select(fields).eq('teacher_id',id).not('daily_room_name','is',null)),
  createInvitation:(user:any)=>checked(user.client.rpc('create_guest_workspace')),
  session:(id:string)=>checked(admin.from('lesson_sessions').select('id,teacher_id,student_id,status').eq('id',id).maybeSingle()),
  participantRole:async(id:string,userId:string)=>(await checked(admin.from('lesson_participants').select('participant_role').eq('session_id',id).eq('user_id',userId).maybeSingle()))?.participant_role,
  endSession:(id:string)=>checked(admin.from('lesson_sessions').update({status:'completed'}).eq('id',id)),
};
async function verifyUser(header:string|null){
  const token=header?.replace(/^Bearer\s+/i,'');
  if(!token||token.split('.').length!==3)return null;
  const {data,error}=await admin.auth.getUser(token);
  if(error||!data.user)return null;
  const client=createClient(url,publicKey,{...options,global:{headers:{Authorization:`Bearer ${token}`}}});
  const teacher=await checked(client.rpc('is_teacher_user'));
  return {id:data.user.id,teacher:teacher===true,client};
}
async function daily(path:string,method='GET',body?:unknown,allowed:number[]=[]){
  const response=await fetch('https://api.daily.co/v1'+path,{method,headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(12000)});
  const data=await response.json().catch(()=>null);
  if(!response.ok&&!allowed.includes(response.status)){const error:any=new Error('DAILY');error.safeCode=`DAILY_${response.status}`;throw error;}
  return {status:response.status,data};
}
const hash=async(value:string)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))).map(b=>b.toString(16).padStart(2,'0')).join('');
// Gateway JWT validation is disabled ONLY because guest bearer capabilities are
// authenticated by the handler. Teacher actions still require a verified user JWT.
Deno.serve(createHandler({repo,verifyUser,daily,hash}));
