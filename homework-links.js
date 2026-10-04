/* Explicit editing and result URLs. Neither depends on a signed-in browser. */
(function(root){
'use strict';
const fresh=lesson=>{const token=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');return {id:crypto.randomUUID(),lesson,edit:token(),read:token(),answers:{},revision:0,dirty:false,change:0};};
function url(record,mode,base){const u=new URL('homework.html',base);u.searchParams.set(mode==='result'?'result':'work',record.id);u.hash=new URLSearchParams(mode==='result'?{key:record.read}:{edit:record.edit,view:record.read}).toString();return u.href;}
async function start(record,rpc){return rpc('homework_start',{p_id:record.id,p_lesson:record.lesson,p_edit_key:record.edit,p_read_key:record.read});}
const api={fresh,url,start};if(typeof module!=='undefined')module.exports=api;else root.SpaceWhaleHomeworkLinks=api;
})(typeof window==='undefined'?globalThis:window);
