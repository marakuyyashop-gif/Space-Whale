(async()=>{
'use strict';
const $=id=>document.getElementById(id), content=$('homeworkContent'), actions=$('homeworkActions'), footer=$('homeworkFooter');
const kit=window.SpaceWhaleExerciseKit, model=window.SpaceWhaleHomeworkFlow, links=window.SpaceWhaleHomeworkLinks;
const params=new URLSearchParams(location.search), hash=new URLSearchParams(location.hash.slice(1));
let store=null, debounce=null, handle=null, pack=null, submitting=false;
const node=(tag,text='',cls='')=>{const e=document.createElement(tag);e.textContent=text;if(cls)e.className=cls;return e;};
const button=(text,fn,target=actions)=>{const e=node('button',text);e.type='button';e.addEventListener('click',fn);target.append(e);return e;};
const status=(text,error=false)=>{const el=$('homeworkStatus');el.textContent=text;el.dataset.error=String(error);};
const notice=(text,error=false)=>{$('homeworkNoticeText').textContent=text;$('homeworkNotice').dataset.error=String(error);$('homeworkNotice').hidden=false;};
$('homeworkNoticeClose').addEventListener('click',()=>{$('homeworkNotice').hidden=true;});
// Save status is separate: background autosave must never erase a copy/error notice.
const saveStatus=(text,error=false)=>{const el=$('homeworkSaveStatus');if(el){el.textContent=text;el.dataset.error=String(error);}if(error)notice(text,true);};
const rpc=async(name,args)=>{
 const request=window.spaceWhaleSupabase.rpc(name,args);
 const {data,error}=await (request.abortSignal&&typeof AbortSignal!=='undefined'?request.abortSignal(AbortSignal.timeout(20000)):request);
 if(error)throw error;return data;
};
const storageKey=id=>'space-whale:homework:attempt:'+id;
function heading(p){$('homeworkLevel').textContent=p.level;$('homeworkTitle').textContent=p.title;document.title=p.title+' · Homework';}
function showLink(url){$('homeworkLink').hidden=false;$('homeworkLinkField').value=url;}
async function copyLink(url,finished=false){
 const ok=await links.copy(url);$('homeworkLink').hidden=ok;
 notice(ok?(finished?'Ссылка скопирована. Теперь отправьте эту ссылку преподавателю на проверку.':'Ссылка скопирована. Отправьте её ученице.'):(finished?'Работа сохранена. Скопируйте ссылку из поля и отправьте преподавателю.':'Автоматическое копирование недоступно. Скопируйте ссылку из поля.'));
 if(!ok){showLink(url);$('homeworkLinkField').focus();$('homeworkLinkField').select();}
}
$('homeworkCopyLink').addEventListener('click',()=>copyLink($('homeworkLinkField').value,params.has('result')||!store));
function progress(answers,submitted=false){
 const p=model.progress(pack,answers,kit),percent=submitted?100:Math.round(100*p.done/p.total);
 $('homeworkProgress').hidden=false;$('homeworkProgress').setAttribute('aria-valuenow',String(percent));
 $('homeworkProgress').setAttribute('aria-valuetext',`${p.done} из ${p.total}`);
 $('homeworkProgressFill').style.width=percent+'%';$('homeworkProgressCheck').hidden=!(submitted||p.complete);return p;
}
function clear(){handle?.destroy();handle=null;content.replaceChildren();actions.replaceChildren();footer.replaceChildren();$('homeworkLink').hidden=true;}
function report(result){
 clear();pack=result.definition;heading(pack);content.classList.add('homework-report');progress(result.answers,Boolean(result.submitted_at));
 status(result.submitted_at?'Домашнее задание выполнено · просмотр результатов':'Сохранённая работа · просмотр результатов');
 model.steps(pack).forEach((step,index)=>{
  const d=step.exercise,a=result.answers[d.id]||{},detail=node('details','','homework-result'),summary=node('summary');
  summary.append(node('span',`${index+1}. ${d.title}`),node('span',model.summary(d,a,kit),'homework-result-summary'));detail.append(summary);
  const grades=Object.values(kit.grade(d,a));detail.open=false;detail.dataset.hasErrors=String(Boolean(a.__sw_checked&&grades.some(v=>v==='retry'||v==='empty')));
  const host=node('div');detail.append(host);content.append(detail);let mounted=false;
  const mount=()=>{if(mounted)return;mounted=true;kit.mount(host,d,{hideHeading:true,answers:a,syncChecks:true,readOnly:true,repeatAll:true});};
  if(detail.open)mount();detail.addEventListener('toggle',()=>{if(detail.open)mount();});summary.addEventListener('click',mount);
 });
 if(result.answers.__comment?.trim()){const section=node('section','','homework-comment');section.append(node('h2','Комментарий преподавателю'),node('p',result.answers.__comment));content.append(section);}
}
function resultActions(url){
 button('Скопировать ссылку на результат',()=>copyLink(url,true));
}
function editable(result,record){
 clear();pack=result.definition;heading(pack);content.classList.remove('homework-report');
 const key=storageKey(record.id);
 store=window.SpaceWhaleHomeworkStore.create({rpc,storage:localStorage,key,record,onStatus:saveStatus});
 const host=node('div');content.append(host);
 const saveLabel=node('p','','homework-save-status');saveLabel.id='homeworkSaveStatus';saveLabel.setAttribute('role','status');footer.append(saveLabel);
 const comment=node('section','','homework-comment'),label=node('label','Комментарий преподавателю'),input=node('textarea');
 input.id='homeworkComment';input.maxLength=3000;input.rows=3;input.placeholder='Напишите здесь сообщение преподавателю, если вы что-то не поняли.';
 input.value=record.answers.__comment||'';label.htmlFor=input.id;comment.append(label,input);footer.append(comment);
 const remaining=node('div','','homework-remaining');footer.append(remaining);
 const complete=button('Домашнее задание выполнено ✓',async()=>{
  if(submitting||!model.progress(pack,store.state.answers,kit).complete)return;
  submitting=true;complete.disabled=true;complete.textContent='Сохраняем работу…';input.disabled=true;host.inert=true;
  status('Сохраняем итоговую работу…');
  try{
   clearTimeout(debounce);await store.flush();
   const saved=await rpc('homework_submit',{p_id:record.id,p_edit_key:record.edit,p_revision:store.state.revision});
   const finished={definition:pack,answers:JSON.parse(JSON.stringify(store.state.answers)),submitted_at:saved.submitted_at};
   store.state.revision=saved.revision;store.state.submitted_at=saved.submitted_at;
   // A browser quota error cannot turn a successful server submission into a failed one.
   try{localStorage.setItem(key,JSON.stringify(store.state));}catch(_){}
   const resultURL=links.url(record,'result',location.href);history.replaceState(null,'',resultURL);store=null;report(finished);resultActions(resultURL);
   $('homeworkTitle').scrollIntoView?.({block:'start'});await copyLink(resultURL,true);
  }catch(error){
   notice(error.message==='Revision conflict'?'Работа изменена в другом окне. Обновите страницу перед продолжением.':'Не удалось отправить работу. Ответы сохранены в черновике; повторите попытку.',true);
   complete.disabled=false;complete.textContent='Домашнее задание выполнено ✓';input.disabled=false;host.inert=false;
  }finally{submitting=false;}
 },footer);complete.className='homework-finish';
 const update=()=>{
  const p=progress(store.state.answers),end=(store.state.answers.revealed||1)>=model.steps(pack).length;
  comment.hidden=complete.hidden=remaining.hidden=!end;complete.disabled=!p.complete;
  remaining.replaceChildren();
  if(end&&!p.complete){
   remaining.append(node('p','Проверьте ответы кнопкой OK или нажмите Skip:'));
   model.steps(pack).forEach((step,i)=>{const a=store.state.answers[step.exercise.id]||{};
    if(Object.keys(kit.grade(step.exercise,a)).length&&!kit.taskFinished(step.exercise,a)){
     button(`${i+1}. ${step.exercise.title}`,()=>{
      const section=host.querySelectorAll('.ek-stage-section')[i];section?.scrollIntoView?.({block:'start',behavior:'smooth'});section?.querySelector('input,textarea,button')?.focus({preventScroll:true});
     },remaining);
    }
   });
  }
 };
 const changed=value=>{
  store.replace({...store.state.answers,...value,__seen:Math.max(store.state.answers.__seen||1,value.revealed||1)});
  clearTimeout(debounce);debounce=setTimeout(()=>store?.flush().catch(()=>{}),500);update();
 };
 input.addEventListener('input',()=>changed({__comment:input.value}));
 handle=kit.mount(host,model.flow(pack),{hideHeading:true,answers:record.answers,syncChecks:true,repeatAll:true,allowMaterialSkip:true,independentSteps:true,onChange:changed,onSkip:()=>{update();if(!complete.hidden)comment.scrollIntoView?.({block:'start',behavior:'smooth'});}});
 update();status('Ответы сохраняются автоматически.');saveStatus(record.dirty?'Сохраняем восстановленный черновик…':'Все ответы сохранены.');
 if(record.dirty)store.flush().catch(()=>{});
}
function issueButton(p,target=actions){return links.mountIssuer(target,{lesson:p.id,rpc,base:location.href,notify:notice});}
async function openWork(id,edit,read){
 if(!edit||!read)throw Error('Ссылка на выполнение неполная. Откройте полную ссылку преподавателя.');
 const remote=await rpc('homework_read',{p_id:id,p_key:edit});
 if(remote.submitted_at){report(remote);resultActions(links.url({id,read},'result',location.href));return;}
 let local;try{local=JSON.parse(localStorage.getItem(storageKey(id))||'null');}catch(_){}
 let record={id,edit,read,lesson:remote.definition.id,answers:remote.answers,revision:remote.revision,change:0,dirty:false},conflict=false;
 if(local?.edit===edit&&local.dirty){if(local.revision===remote.revision)record=local;else{try{localStorage.setItem(storageKey(id)+':conflict-backup',JSON.stringify(local));}catch(_){}conflict=true;}}
 try{localStorage.setItem(storageKey(id),JSON.stringify(record));}catch(_){}
 editable(remote,record);
 if(conflict)notice('Загружены ответы из другого окна. Несохранённый черновик оставлен в этом браузере.',true);
}
window.addEventListener('online',()=>store?.flush().catch(()=>{}));
window.addEventListener('offline',()=>{if(store)notice('Нет связи. Продолжайте в этом окне: отправим ответы после восстановления связи.',true);});
window.addEventListener('beforeunload',event=>{if(store?.state.dirty){event.preventDefault();event.returnValue='';}});
setInterval(()=>{if(store?.state.dirty&&!submitting)store.flush().catch(()=>{});},5000);
try{
 if(!kit||!model||!links||!window.spaceWhaleSupabase)throw Error('Не удалось загрузить страницу. Обновите её.');
 const resultId=params.get('result')||hash.get('work');
 if(resultId){const result=await rpc('homework_read',{p_id:resultId,p_key:hash.get('key')});report(result);resultActions(location.href);return;}
 if(params.has('work')){await openWork(params.get('work'),hash.get('edit'),hash.get('view'));return;}
 const lesson=params.get('lesson');
 if(!lesson){
  const packs=await rpc('homework_template',{p_lesson:null});status('');content.replaceChildren();
  packs.forEach(p=>{const card=node('article','','homework-card');card.append(node('p',p.level,'homework-level'),node('h2',p.title));const nav=node('nav'),a=node('a','Посмотреть');a.href='homework.html?lesson='+encodeURIComponent(p.id)+'&preview=1';nav.append(a);issueButton(p,nav);card.append(nav);content.append(card);});return;
 }
 pack=await rpc('homework_template',{p_lesson:lesson});if(!pack)throw Error('Домашка для этого урока пока не готова.');heading(pack);
 if(params.get('preview')==='1'){
  issueButton(pack);const host=node('div');content.append(host);
  handle=kit.mount(host,model.flow(pack),{hideHeading:true,syncChecks:true,repeatAll:true,allowMaterialSkip:true,independentSteps:true,onChange:a=>progress(a)});
  progress({});status('Предпросмотр · ответы не сохраняются');return;
 }
 let pending=null;button('Начать домашку',async event=>{
  const b=event.currentTarget;b.disabled=true;b.textContent='Открываем…';
  try{let previous=null;try{previous=JSON.parse(localStorage.getItem('space-whale:homework:v1:'+lesson)||'null');}catch(_){}
   pending=pending||previous||links.fresh(lesson);await links.start(pending,rpc);const url=links.url(pending,'edit',location.href);history.replaceState(null,'',url);await openWork(pending.id,pending.edit,pending.read);
  }catch(_){notice('Не удалось открыть работу. Повторите попытку.',true);b.disabled=false;b.textContent='Начать домашку';}
 });status('Нажмите «Начать домашку». Ответы будут сохраняться автоматически.');
}catch(error){status('');notice(/Work unavailable|Invalid keys/.test(error.message)?'Работа не найдена. Проверьте, что ссылка скопирована полностью.':error.message||'Не удалось загрузить домашку.',true);button('Повторить загрузку',()=>location.reload());}
})();
