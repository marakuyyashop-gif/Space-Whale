/* One issue/copy interaction used by the catalog and the classroom. */
(function(root){
'use strict';
function fresh(lesson){const token=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),v=>v.toString(16).padStart(2,'0')).join('');return {id:crypto.randomUUID(),lesson,edit:token(),read:token(),answers:{},revision:0,dirty:false,change:0};}
function url(record,mode,base){const u=new URL('homework.html',base);u.searchParams.set(mode==='result'?'result':'work',record.id);u.hash=new URLSearchParams(mode==='result'?{key:record.read}:{edit:record.edit,view:record.read}).toString();return u.href;}
async function start(record,rpc){return rpc('homework_start',{p_id:record.id,p_lesson:record.lesson,p_edit_key:record.edit,p_read_key:record.read});}
async function copy(value){let timer;try{await Promise.race([navigator.clipboard.writeText(value),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Clipboard timeout')),1500);})]);return true;}catch(_){return false;}finally{clearTimeout(timer);}}
function mountIssuer(host,{lesson,rpc,base,notify=()=>{}}){
 const doc=host.ownerDocument,make=(tag,text)=>{const el=doc.createElement(tag);if(text)el.textContent=text;return el;};
 const box=make('div'),issue=make('button','Выдать задание'),again=make('button','Скопировать ссылку'),message=make('p'),field=make('input');
 box.className='homework-issuer';message.className='homework-issue-status';message.setAttribute('role','status');message.setAttribute('aria-live','polite');
 issue.type=again.type='button';field.readOnly=true;field.type='url';field.setAttribute('aria-label','Ссылка для ученицы');field.hidden=again.hidden=true;
 box.append(issue,again,message,field);host.append(box);let pending=null;
 const say=(text,error=false)=>{message.textContent=text;message.dataset.error=String(error);notify(text,error);};
 const copyCurrent=async()=>{again.disabled=true;say('Копируем ссылку…');const ok=await copy(field.value);again.disabled=false;say(ok?'Ссылка скопирована. Отправьте её ученице.':'Автоматическое копирование недоступно. Скопируйте ссылку из поля.');if(!ok){field.focus();field.select();}};
 again.addEventListener('click',copyCurrent);
 issue.addEventListener('click',async()=>{if(issue.disabled)return;issue.disabled=true;issue.textContent='Создаём…';say('Создаём отдельную работу…');
  try{pending=pending||fresh(lesson);await start(pending,rpc);field.value=url(pending,'edit',base);pending=null;field.hidden=again.hidden=false;await copyCurrent();}
  catch(_){say('Не удалось выдать задание. Повторите попытку.',true);}
  finally{issue.disabled=false;issue.textContent=field.value?'Выдать новое задание':'Выдать задание';}
 });return {issue,again,field,message};
}
const api={fresh,url,start,copy,mountIssuer};if(typeof module!=='undefined')module.exports=api;else root.SpaceWhaleHomeworkLinks=api;
})(typeof window==='undefined'?globalThis:window);
