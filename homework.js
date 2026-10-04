(async()=>{
'use strict';
const $=id=>document.getElementById(id),content=$('homeworkContent'),actions=$('homeworkActions'),footer=$('homeworkFooter');
const kit=window.SpaceWhaleExerciseKit,model=window.SpaceWhaleHomeworkFlow,links=window.SpaceWhaleHomeworkLinks;
const params=new URLSearchParams(location.search),hash=new URLSearchParams(location.hash.slice(1));
let store=null,debounce=null,handle=null,pack=null,submitting=false;
const status=(text,error=false)=>{$('homeworkStatus').textContent=text;$('homeworkStatus').dataset.error=String(error);};
const node=(tag,text='',cls='')=>{const e=document.createElement(tag);e.textContent=text;if(cls)e.className=cls;return e;};
const button=(text,fn,target=actions)=>{const e=node('button',text);e.type='button';e.addEventListener('click',fn);target.append(e);return e;};
const rpc=async(name,args)=>{const {data,error}=await window.spaceWhaleSupabase.rpc(name,args);if(error)throw error;return data;};
const storageKey=id=>'space-whale:homework:attempt:'+id;
function heading(p){$('homeworkLevel').textContent=p.level;$('homeworkTitle').textContent=p.title;document.title=p.title+' · Homework';}
async function copyLink(url,finished=false){
 $('homeworkLink').hidden=false;$('homeworkLinkField').value=url;
 try{await Promise.race([navigator.clipboard.writeText(url),new Promise((_,reject)=>setTimeout(()=>reject(Error('timeout')),1500))]);status(finished?'Ссылка скопирована. Теперь отправьте эту ссылку преподавателю на проверку.':'Ссылка скопирована. Отправьте её ученице.');}
 catch(_){$('homeworkLinkField').focus();$('homeworkLinkField').select();status(finished?'Работа сохранена. Скопируйте ссылку из поля и отправьте преподавателю.':'Скопируйте ссылку из поля.');}
}
function progress(answers,submitted=false){
 const p=model.progress(pack,answers,kit);$('homeworkProgress').hidden=false;$('homeworkProgress').setAttribute('aria-valuenow',String(submitted?100:Math.round(100*p.done/p.total)));$('homeworkProgressFill').style.width=(submitted?100:100*p.done/p.total)+'%';$('homeworkProgressCheck').hidden=!(submitted||p.complete);
 return p;
}
function clear(){handle?.destroy();handle=null;content.replaceChildren();actions.replaceChildren();footer.replaceChildren();}
function report(result){
 clear();pack=result.definition;heading(pack);content.classList.add('homework-report');progress(result.answers,Boolean(result.submitted_at));
 status(result.submitted_at?'Домашнее задание выполнено · просмотр результатов':'Сохранённая работа · просмотр результатов');
 model.steps(pack).forEach((step,index)=>{
  const d=step.exercise,a=result.answers[d.id]||{},detail=node('details','','homework-result'),summary=node('summary');summary.append(node('span',`${index+1}. ${d.title}`),node('span',model.summary(d,a,kit),'homework-result-summary'));detail.append(summary);
  const grades=Object.values(kit.grade(d,a));detail.open=Boolean(a.__sw_checked&&grades.some(v=>v==='retry'||v==='empty'));
  const host=node('div');detail.append(host);content.append(detail);let mounted=false;
  const mount=()=>{if(mounted)return;mounted=true;kit.mount(host,d,{hideHeading:true,answers:a,syncChecks:true,readOnly:true,repeatAll:true});};
  if(detail.open)mount();detail.addEventListener('toggle',()=>{if(detail.open)mount();});summary.addEventListener('click',mount);
 });
 if(result.answers.__comment?.trim()){const section=node('section','','homework-comment');section.append(node('h2','Комментарий преподавателю'),node('p',result.answers.__comment));content.append(section);}
}
function editable(result,record){
 clear();pack=result.definition;heading(pack);content.classList.remove('homework-report');
 const key=storageKey(record.id);store=window.SpaceWhaleHomeworkStore.create({rpc,storage:localStorage,key,record,onStatus:status});
 const host=node('div');content.append(host);
 const comment=node('section','','homework-comment'),label=node('label','Комментарий преподавателю'),input=node('textarea');input.id='homeworkComment';input.maxLength=3000;input.rows=3;input.placeholder='Напишите здесь сообщение преподавателю, если вы что-то не поняли.';input.value=record.answers.__comment||'';label.htmlFor=input.id;comment.append(label,input);footer.append(comment);
 const complete=button('Домашнее задание выполнено ✓',async()=>{
  if(submitting||!model.progress(pack,store.state.answers,kit).complete)return;submitting=true;complete.disabled=true;input.disabled=true;host.inert=true;
  try{
   clearTimeout(debounce);await store.flush();const saved=await rpc('homework_submit',{p_id:record.id,p_edit_key:record.edit,p_revision:store.state.revision});
   const finished={definition:pack,answers:JSON.parse(JSON.stringify(store.state.answers)),submitted_at:saved.submitted_at};store.state.revision=saved.revision;store.state.submitted_at=saved.submitted_at;localStorage.setItem(key,JSON.stringify(store.state));
   const resultURL=links.url(record,'result',location.href);history.replaceState(null,'',resultURL);store=null;report(finished);
   button('Скопировать ссылку на результат',()=>copyLink(resultURL,true),footer);await copyLink(resultURL,true);
  }catch(error){status(error.message==='Revision conflict'?'Работа изменена в другом окне. Обновите страницу.':'Не удалось отправить работу. Ответы сохранены; попробуйте ещё раз.',true);complete.disabled=false;input.disabled=false;host.inert=false;}
  finally{submitting=false;}
 },footer);complete.className='homework-finish';
 const update=()=>{const p=progress(store.state.answers);const end=(store.state.answers.revealed||1)>=model.steps(pack).length;comment.hidden=!end;complete.hidden=!end;complete.disabled=!p.complete;};
 const changed=value=>{try{store.replace({...store.state.answers,...value,__seen:Math.max(store.state.answers.__seen||1,value.revealed||1)});clearTimeout(debounce);debounce=setTimeout(()=>store?.flush().catch(()=>{}),500);update();}catch(_){status('Не удалось сохранить черновик в браузере. Не закрывайте страницу.',true);}};
 input.addEventListener('input',()=>changed({__comment:input.value}));
 handle=kit.mount(host,model.flow(pack),{hideHeading:true,answers:record.answers,syncChecks:true,repeatAll:true,allowMaterialSkip:true,independentSteps:true,onChange:changed,onSkip:update});
 update();status(record.dirty?'Сохраняем восстановленный черновик…':'Ответы сохраняются автоматически.');if(record.dirty)store.flush().catch(()=>{});
}
function issueButton(p,target=actions){let pending=null;const b=button('Выдать задание',async()=>{
 b.disabled=true;status('Создаём отдельную работу…');
 try{pending=pending||links.fresh(p.id);await links.start(pending,rpc);const url=links.url(pending,'edit',location.href);pending=null;await copyLink(url);}
 catch(_){status('Не удалось выдать задание. Нажмите ещё раз.',true);}finally{b.disabled=false;}
},target);return b;}
async function openWork(id,edit,read){
 if(!edit||!read)throw Error('Ссылка на выполнение неполная. Откройте ссылку, которую прислал преподаватель.');
 const remote=await rpc('homework_read',{p_id:id,p_key:edit});
 if(remote.submitted_at){report(remote);const url=links.url({id,read},'result',location.href);button('Скопировать ссылку на результат',()=>copyLink(url,true),footer);return;}
 let local;try{local=JSON.parse(localStorage.getItem(storageKey(id))||'null');}catch(_){throw Error('Разрешите сохранение данных сайта в браузере, чтобы продолжить.');}
 let record={id,edit,read,lesson:remote.definition.id,answers:remote.answers,revision:remote.revision,change:0,dirty:false};let conflict=false;
 if(local?.edit===edit&&local.dirty){if(local.revision===remote.revision)record=local;else{localStorage.setItem(storageKey(id)+':conflict-backup',JSON.stringify(local));conflict=true;}}
 localStorage.setItem(storageKey(id),JSON.stringify(record));editable(remote,record);
 if(conflict)status('Загружены ответы из другого окна. Несохранённый черновик оставлен в этом браузере.',true);
}
window.addEventListener('online',()=>store?.flush().catch(()=>{}));
window.addEventListener('beforeunload',event=>{if(store?.state.dirty){event.preventDefault();event.returnValue='';}});
setInterval(()=>{if(store?.state.dirty&&!submitting)store.flush().catch(()=>{});},5000);
try{
 if(!kit||!model||!links||!window.spaceWhaleSupabase)throw Error('Не удалось загрузить страницу. Обновите её.');
 const resultId=params.get('result')||hash.get('work');
 if(resultId){const result=await rpc('homework_read',{p_id:resultId,p_key:hash.get('key')});report(result);return;}
 if(params.has('work')){await openWork(params.get('work'),hash.get('edit'),hash.get('view'));return;}
 const lesson=params.get('lesson');
 if(!lesson){
  const packs=await rpc('homework_template',{p_lesson:null});status('');content.replaceChildren();
  packs.forEach(p=>{const card=node('article','','homework-card');card.append(node('p',p.level,'homework-level'),node('h2',p.title));const nav=node('nav'),a=node('a','Посмотреть');a.href='homework.html?lesson='+encodeURIComponent(p.id)+'&preview=1';nav.append(a);issueButton(p,nav);card.append(nav);content.append(card);});return;
 }
 pack=await rpc('homework_template',{p_lesson:lesson});if(!pack)throw Error('Домашка для этого урока пока не готова.');heading(pack);
 if(params.get('preview')==='1'){
  issueButton(pack);const host=node('div');content.append(host);handle=kit.mount(host,model.flow(pack),{hideHeading:true,syncChecks:true,repeatAll:true,allowMaterialSkip:true,independentSteps:true,onChange:a=>progress(a)});progress({});status('Предпросмотр · ответы не сохраняются');return;
 }
 // Previously shared lesson links remain usable. Each start now produces a portable, individual URL.
 let pending=null;button('Начать домашку',async event=>{
  const b=event.currentTarget;b.disabled=true;
  try{let previous=null;try{previous=JSON.parse(localStorage.getItem('space-whale:homework:v1:'+lesson)||'null');}catch(_){}
   pending=pending||previous||links.fresh(lesson);await links.start(pending,rpc);const url=links.url(pending,'edit',location.href);history.replaceState(null,'',url);await openWork(pending.id,pending.edit,pending.read);
  }catch(_){status('Не удалось открыть работу. Нажмите ещё раз.',true);b.disabled=false;}
 });status('Нажмите «Начать домашку». Ответы будут сохраняться автоматически.');
}catch(error){status(/Work unavailable|Invalid keys/.test(error.message)?'Работа не найдена. Проверьте, что ссылка скопирована полностью.':error.message||'Не удалось загрузить домашку.',true);}
})();
