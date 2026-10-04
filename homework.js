(async()=>{
 'use strict';
 const $=id=>document.getElementById(id),content=$('homeworkContent'),actions=$('homeworkActions'),footer=$('homeworkFooter'),kit=window.SpaceWhaleExerciseKit;
 const params=new URLSearchParams(location.search),fragment=new URLSearchParams(location.hash.slice(1));
 const lesson=params.get('lesson'),attempt=fragment.get('work'),readKey=fragment.get('key'),preview=params.get('preview')==='1';
 let store=null,debounce=null,pack=null,storageKey=null;
 const status=(text,error=false)=>{$('homeworkStatus').textContent=text;$('homeworkStatus').dataset.error=String(error);};
 const node=(tag,text='',cls='')=>{const el=document.createElement(tag);el.textContent=text;if(cls)el.className=cls;return el;};
 const button=(label,fn,target=actions)=>{const el=node('button',label);el.type='button';el.addEventListener('click',fn);target.append(el);return el;};
 const rpc=async(name,args)=>{const {data,error}=await window.spaceWhaleSupabase.rpc(name,args);if(error)throw error;return data;};
 const linkFor=id=>{const url=new URL('homework.html',location.href);url.searchParams.set('lesson',id);return url.href;};
 async function copyLink(url){
  $('homeworkLink').hidden=false;$('homeworkLinkField').value=url;
  try{await Promise.race([navigator.clipboard.writeText(url),new Promise((_,reject)=>setTimeout(()=>reject(Error('timeout')),1200))]);status('Ссылка скопирована.');}
  catch(_){$('homeworkLinkField').focus();$('homeworkLinkField').select();status('Скопируйте ссылку из поля.');}
 }
 function heading(p){$('homeworkLevel').textContent=p.level;$('homeworkTitle').textContent=p.title;document.title=p.title+' · Homework';}
 function render(p,answers={},readOnly=false){
  heading(p);content.replaceChildren();
  const memo=node('details','','homework-reference');memo.append(node('summary','Слова и правило'));const mh=node('div');memo.append(mh);content.append(memo);kit.mount(mh,p.reference,{hideHeading:true});
  p.exercises.forEach((def,index)=>{
   const section=node('section','','homework-exercise');section.append(node('div',String(index+1),'homework-exercise-number'));
   const host=node('div');section.append(host);content.append(section);
   kit.mount(host,def,{answers:answers[def.id]||{},syncChecks:true,readOnly,onChange:value=>{
    if(!store)return;
    try{store.update(def.id,value);clearTimeout(debounce);debounce=setTimeout(()=>store.flush().catch(()=>{}),600);}
    catch(_){status('Не удалось сохранить ответы в браузере. Не закрывайте страницу.',true);}
   }});
  });
 }
 function editable(p,record,key){
  storageKey=key;store=window.SpaceWhaleHomeworkStore.create({rpc,storage:localStorage,key,record,onStatus:status});
  actions.replaceChildren();footer.replaceChildren();render(p,record.answers);
  button('Скопировать ссылку на мою работу',async event=>{
   const control=event.currentTarget;control.disabled=true;
   try{clearTimeout(debounce);await store.flush();const url=new URL('homework.html',location.href);url.hash=new URLSearchParams({work:record.id,key:record.read}).toString();await copyLink(url.href);}
   catch(_){/* Save error is shown; never share an unsaved result. */}finally{control.disabled=false;}
  },footer);
  status(record.dirty?'Восстанавливаем несохранённые ответы…':'Все ответы сохранены.');
  if(record.dirty)store.flush().catch(()=>{});
 }
 function freshRecord(id){const token=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');return {id:crypto.randomUUID(),lesson:id,edit:token(),read:token(),answers:{},revision:0,dirty:false,change:0};}
 window.addEventListener('online',()=>store?.flush().catch(()=>{}));
 window.addEventListener('beforeunload',event=>{if(store?.state.dirty){event.preventDefault();event.returnValue='';}});
 setInterval(()=>{if(store?.state.dirty)store.flush().catch(()=>{});},5000);
 try{
  if(!window.spaceWhaleSupabase||!kit)throw Error('Не удалось загрузить страницу. Обновите её.');
  if(attempt){
   const result=await rpc('homework_read',{p_id:attempt,p_key:readKey});render(result.definition,result.answers,true);status('Работа ученика · просмотр');return;
  }
  if(!lesson){
   const packs=await rpc('homework_template',{p_lesson:null});content.replaceChildren();status('');
   packs.forEach(p=>{const card=node('article','','homework-card');card.append(node('p',p.level,'homework-level'),node('h2',p.title));const nav=node('nav');const a=node('a','Посмотреть');a.href=linkFor(p.id)+'&preview=1';nav.append(a);button('Скопировать ссылку',()=>copyLink(linkFor(p.id)),nav);card.append(nav);content.append(card);});return;
  }
  pack=await rpc('homework_template',{p_lesson:lesson});if(!pack)throw Error('Домашка для этого урока пока не готова.');heading(pack);
  if(preview){render(pack);button('Скопировать ссылку',()=>copyLink(linkFor(lesson)));status('Предпросмотр · ответы не сохраняются');return;}
  storageKey='space-whale:homework:v1:'+lesson;
  let saved;try{saved=JSON.parse(localStorage.getItem(storageKey)||'null');}catch(_){throw Error('Разрешите сохранение данных сайта в браузере, чтобы продолжить работу.');}
  if(saved){
   const remote=await rpc('homework_start',{p_id:saved.id,p_lesson:lesson,p_edit_key:saved.edit,p_read_key:saved.read});
   if(saved.dirty&&saved.revision!==remote.revision){localStorage.setItem(storageKey+':conflict-backup',JSON.stringify(saved));saved={...saved,answers:remote.answers,revision:remote.revision,dirty:false};localStorage.setItem(storageKey,JSON.stringify(saved));editable(remote.definition,saved,storageKey);status('Загружена последняя сохранённая версия. Черновик другого окна сохранён отдельно в этом браузере.',true);}
   else{saved={...saved,answers:saved.dirty?saved.answers:remote.answers,revision:remote.revision};localStorage.setItem(storageKey,JSON.stringify(saved));editable(remote.definition,saved,storageKey);}return;
  }
  status('Ответы сохраняются автоматически. Продолжить работу можно в этом браузере.');
  button('Начать домашку',async event=>{
   const control=event.currentTarget;control.disabled=true;
   try{const record=JSON.parse(localStorage.getItem(storageKey)||'null')||freshRecord(lesson);localStorage.setItem(storageKey,JSON.stringify(record));const result=await rpc('homework_start',{p_id:record.id,p_lesson:lesson,p_edit_key:record.edit,p_read_key:record.read});editable(result.definition,record,storageKey);}
   catch(error){status('Не удалось начать работу. Обновите страницу и попробуйте ещё раз.',true);control.disabled=false;}
  });
 }catch(error){status(error.message==='Work unavailable'?'Работа не найдена. Проверьте ссылку.':error.message||'Не удалось загрузить домашку.',true);}

})();
