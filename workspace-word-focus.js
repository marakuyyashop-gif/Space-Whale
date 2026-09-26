(() => {
  'use strict';
  // Presentation only: never place focus metadata inside exercise answers.
  const WORD=/[A-Za-z]+(?:['’][A-Za-z]+)*(?:-[A-Za-z]+(?:['’][A-Za-z]+)*)*/g;
  const EXCLUDE='button,a,input,textarea,select,option,label,summary,svg,script,style,code,pre,[contenteditable],[draggable],[data-ek-drag-id],[role="button"],[role="checkbox"],[role="radio"],[role="option"],[role="listbox"],[aria-hidden="true"],.ek-actions,.ek-status,.workspace-empty,.sw-word-focus';
  const hash=text=>{let value=2166136261;for(const char of text)value=Math.imul(value^char.charCodeAt(0),16777619);return (value>>>0).toString(36);};
  const newer=(a,b)=>!b||a.clock>b.clock||(a.clock===b.clock&&a.actor>b.actor);
  const validWord=value=>value===null||(value&&typeof value.key==='string'&&value.key.length<600&&typeof value.text==='string'&&value.text.length<=80);
  function create({root,actor,storageKey,send=()=>{},canShare=()=>false,client=window.spaceWhaleSupabase}){
    const doc=root.ownerDocument,win=doc.defaultView||window;
    const selections=new Map(),peers=new Map(),translations=new Map();
    let popup=null,popupWord=null,requestId=0;
    let exerciseId=null,clock=0,hover=null,hoverTimer=null,observer=null,disposed=false;
    try{for(const [id,entry] of JSON.parse(window.sessionStorage?.getItem(storageKey)||'[]'))if(validEntry(entry)&&typeof id==='string')selections.set(id,entry);}catch{}
    function validEntry(entry){return entry&&Number.isSafeInteger(entry.clock)&&entry.clock>=0&&entry.clock<1e12&&typeof entry.actor==='string'&&entry.actor.length<100&&validWord(entry.word);}
    function save(){try{window.sessionStorage?.setItem(storageKey,JSON.stringify([...selections].slice(-100)));}catch{}}
    function emit(payload){if(canShare()&&exerciseId)Promise.resolve(send({...payload,exercise_id:exerciseId,source_id:actor})).catch(()=>{});}
    const words=()=>Array.from(root.querySelectorAll('.sw-word-focus'));
    const reference=el=>el?{key:el.dataset.wordKey,text:el.textContent}:null;
    const same=(a,b)=>a?.key===b?.key&&a?.text===b?.text;
    function paint(){
      const selected=selections.get(exerciseId)?.word;
      for(const el of words()){
        const ref=reference(el),active=Boolean(selected&&same(ref,selected));
        el.classList.toggle('is-word-selected',active);el.setAttribute('aria-pressed',String(active));
        el.classList.toggle('is-peer-hovered',[...peers.values()].some(peer=>same(ref,peer.word)));
      }
    }
    function path(el){
      const parts=[];
      for(let p=el;p&&p!==root;p=p.parentElement){const siblings=Array.from(p.parentElement?.children||[]).filter(x=>!x.classList.contains('sw-word-focus'));parts.push(p.tagName+':'+siblings.indexOf(p));}
      return parts.reverse().join('/');
    }
    function decorate(){
      if(disposed)return;
      observer?.disconnect();
      if(popupWord&&!root.contains(popupWord))closePopup();
      if(exerciseId&&root.classList.contains('exercise-kit')){
        const walker=doc.createTreeWalker(root,4),nodes=[];let text;
        while((text=walker.nextNode()))if(!text.parentElement?.closest(EXCLUDE))nodes.push(text);
        for(const node of nodes){
          if(!root.contains(node))continue;
          const value=node.nodeValue,matches=Array.from(value.matchAll(WORD)).filter(m=>m[0].length<=80&&!/[\p{L}\p{N}]/u.test(value[m.index-1]||'')&&!/[\p{L}\p{N}]/u.test(value[m.index+m[0].length]||''));
          if(!matches.length)continue;
          const parent=node.parentElement;
          let slot=0;for(const sibling of parent.childNodes){if(sibling===node)break;if(sibling.nodeType===1&&!sibling.classList.contains('sw-word-focus'))slot++;}
          const prefix=path(parent)+':'+slot+':'+hash(value),fragment=doc.createDocumentFragment();let offset=0;
          for(const match of matches){
            fragment.append(doc.createTextNode(value.slice(offset,match.index)));
            const word=doc.createElement('span');word.className='sw-word-focus';word.dataset.wordKey=prefix+':'+match.index;word.textContent=match[0];word.tabIndex=-1;word.setAttribute('role','button');word.setAttribute('aria-pressed','false');fragment.append(word);offset=match.index+match[0].length;
          }
          fragment.append(doc.createTextNode(value.slice(offset)));node.replaceWith(fragment);
        }
        const tokens=words();if(!tokens.some(el=>el.tabIndex===0)&&tokens[0])tokens[0].tabIndex=0;
        paint();
      }
      observer?.observe(root,{childList:true,subtree:true,characterData:true});
    }
    // Translation stays local; only the existing focus selection is shared.
    function sentenceFor(el){
      const block=el.closest('p,li,td,th,h1,h2,h3,h4,h5,h6,blockquote,figcaption,.ek-repeat-line,.ek-prompt')||el.parentElement;
      let text='',offset=0;
      function visit(node){
        if(node===el)offset=text.length;
        if(node.nodeType===3){text+=node.nodeValue;return;}
        if(node.nodeType!==1)return;
        if(node.matches('[hidden],[aria-hidden="true"],script,style,svg,.ek-gap-number,.ek-sentence-number,.ek-inline-menu,.ek-actions'))return;
        if(node.matches('input,textarea,select')){text+=node.value||'…';return;}
        if(node.tagName==='BR'){text+='\n';return;}
        for(const child of node.childNodes)visit(child);
      }
      visit(block);
      const Segmenter=win.Intl?.Segmenter||globalThis.Intl?.Segmenter;
      if(Segmenter){
        for(const part of new Segmenter('en',{granularity:'sentence'}).segment(text)){
          if(offset>=part.index&&offset<part.index+part.segment.length)return part.segment.replace(/\s+/g,' ').trim();
        }
      }
      const parts=text.matchAll(/[^.!?\n]+(?:[.!?]+["'”’]?|$)/g);
      for(const part of parts)if(offset>=part.index&&offset<part.index+part[0].length)return part[0].replace(/\s+/g,' ').trim();
      return text.replace(/\s+/g,' ').trim();
    }
    function closePopup(){
      requestId++;popup?.remove();popup=null;popupWord=null;
    }
    function positionPopup(){
      if(!popup||!popupWord)return;
      if(!root.contains(popupWord)||popupWord.closest('[hidden],[inert]')){closePopup();return;}
      const rect=popupWord.getBoundingClientRect(),box=popup.getBoundingClientRect();
      const viewport=win.visualViewport,left=viewport?.offsetLeft||0,top=viewport?.offsetTop||0;
      const width=viewport?.width||win.innerWidth||doc.documentElement.clientWidth,height=viewport?.height||win.innerHeight||doc.documentElement.clientHeight;
      popup.style.left=Math.max(left+8,Math.min(rect.left,left+width-box.width-8))+'px';
      popup.style.top=Math.max(top+8,Math.min(rect.bottom+8+box.height<=top+height-8?rect.bottom+8:rect.top-box.height-8,top+height-box.height-8))+'px';
    }
    function translation(text,context){
      const key=JSON.stringify([text,context]);
      if(!translations.has(key)){
        const promise=(async()=>{
          if(!client?.functions?.invoke)throw new Error('Translation unavailable');
          const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),15000);
          try{
            const {data,error}=await client.functions.invoke('translate-word',{body:{text,context},signal:controller.signal});
            if(error||data?.ok!==true||typeof data.translation!=='string'||!data.translation.trim())throw new Error('Translation unavailable');
            return data.translation.trim();
          }finally{clearTimeout(timeout);}
        })();
        translations.set(key,promise);
        promise.catch(()=>{if(translations.get(key)===promise)translations.delete(key);});
      }
      return translations.get(key);
    }
    async function openPopup(el){
      closePopup();popupWord=el;const id=requestId;
      popup=doc.createElement('aside');popup.className='sw-word-popup';popup.setAttribute('role','dialog');popup.setAttribute('aria-label','Перевод слова');
      const title=doc.createElement('strong'),result=doc.createElement('div'),close=doc.createElement('button');
      title.textContent=el.textContent;result.className='sw-word-translation';result.setAttribute('role','status');result.textContent='Переводим…';
      close.type='button';close.className='sw-word-popup-close';close.textContent='×';close.setAttribute('aria-label','Закрыть перевод');close.addEventListener('click',closePopup);
      popup.append(title,result,close);doc.body.append(popup);positionPopup();
      try{
        const value=await translation(el.textContent,sentenceFor(el));
        if(id!==requestId||disposed)return;
        result.textContent=value;
      }catch{
        if(id!==requestId||disposed)return;
        popup.dataset.failed='true';result.textContent='Не удалось перевести. Нажмите на слово ещё раз.';
      }
      positionPopup();
    }
    function outsideClick(event){if(popup&&!popup.contains(event.target)&&!target(event))closePopup();}
    function escape(event){if(event.key==='Escape'&&popup){const word=popupWord;closePopup();word?.focus();}}
    function choose(el){
      if(!exerciseId||!el||root.inert)return;
      const current=selections.get(exerciseId),ref=reference(el);
      clock=Math.max(clock,current?.clock||0)+1;
      const entry={clock,actor,word:popupWord===el&&popup?.dataset.failed!=='true'&&same(ref,current?.word)?null:ref};
      selections.set(exerciseId,entry);save();paint();emit({kind:'selection',entry});
      if(entry.word)openPopup(el);else closePopup();
    }
    function target(event){const el=event.target.closest?.('.sw-word-focus');return el&&root.contains(el)?el:null;}
    function click(event){if(event.button>0||event.detail>1||doc.getSelection?.()?.isCollapsed===false)return;choose(target(event));}
    function keydown(event){
      const el=target(event);if(!el)return;
      if(event.key==='Enter'||event.key===' '){event.preventDefault();choose(el);}
      else if(event.key==='ArrowLeft'||event.key==='ArrowRight'){
        const tokens=words().filter(w=>!w.closest('[hidden],[inert]')),index=tokens.indexOf(el),next=tokens[index+(event.key==='ArrowRight'?1:-1)];
        if(next){event.preventDefault();for(const w of tokens)w.tabIndex=w===next?0:-1;next.focus();}
      }
    }
    function setHover(word){
      if(same(hover,word))return;hover=word;clearTimeout(hoverTimer);
      // Coalesce crossings between adjacent words; never send raw mouse positions.
      hoverTimer=setTimeout(()=>emit({kind:'hover',word:hover}),70);
    }
    function pointerover(event){if(event.pointerType!=='touch')setHover(reference(target(event)));}
    function pointerout(event){if(event.pointerType!=='touch'&&!root.contains(event.relatedTarget))setHover(null);}
    function blur(){setHover(null);}
    function receive(payload){
      if(!canShare()||payload?.exercise_id!==exerciseId||payload.source_id===actor)return;
      if(typeof payload.source_id!=='string'||payload.source_id.length>100)return;
      if(payload.kind==='request'){const entry=selections.get(exerciseId);if(entry)emit({kind:'selection',entry});return;}
      if(payload.kind==='selection'&&validEntry(payload.entry)){
        const entry=payload.entry;clock=Math.max(clock,entry.clock);
        if(newer(entry,selections.get(exerciseId))){selections.set(exerciseId,entry);save();paint();}
      }else if(payload.kind==='hover'&&validWord(payload.word)){
        const old=peers.get(payload.source_id);clearTimeout(old?.timer);
        if(payload.word&&peers.size<8){const id=payload.source_id;peers.set(id,{word:payload.word,timer:setTimeout(()=>{peers.delete(id);paint();},5000)});}else peers.delete(payload.source_id);
        paint();
      }
    }
    function clearPeers(){for(const peer of peers.values())clearTimeout(peer.timer);peers.clear();paint();}
    function reconnect(){clearPeers();emit({kind:'request'});const entry=selections.get(exerciseId);if(entry)emit({kind:'selection',entry});}
    function setExercise(id){
      const next=typeof id==='string'&&id.length<=160?id:null;if(next===exerciseId)return;
      closePopup();clearTimeout(hoverTimer);hover=null;clearPeers();exerciseId=next;reconnect();
    }
    function destroy(){disposed=true;observer?.disconnect();clearTimeout(hoverTimer);clearPeers();for(const [name,fn] of Object.entries(events))root.removeEventListener(name,fn);win.removeEventListener?.('blur',blur);closePopup();doc.removeEventListener('click',outsideClick);doc.removeEventListener('keydown',escape);doc.removeEventListener('scroll',closePopup,true);win.removeEventListener?.('resize',positionPopup);win.visualViewport?.removeEventListener('resize',positionPopup);win.visualViewport?.removeEventListener('scroll',positionPopup);}
    const events={click,keydown,pointerover,pointerout};for(const [name,fn] of Object.entries(events))root.addEventListener(name,fn);
    win.addEventListener?.('blur',blur);
    doc.addEventListener('click',outsideClick);doc.addEventListener('keydown',escape);doc.addEventListener('scroll',closePopup,true);win.addEventListener?.('resize',positionPopup);win.visualViewport?.addEventListener('resize',positionPopup);win.visualViewport?.addEventListener('scroll',positionPopup);
    if(typeof MutationObserver!=='undefined'){observer=new MutationObserver(decorate);observer.observe(root,{childList:true,subtree:true,characterData:true});}
    return {setExercise,decorate,receive,reconnect,destroy};
  }
  window.SpaceWhaleWordFocus={create};
})();
