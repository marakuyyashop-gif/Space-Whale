(() => {
  'use strict';
  // Presentation only: never place focus metadata inside exercise answers.
  const WORD=/[A-Za-z]+(?:['’][A-Za-z]+)*(?:-[A-Za-z]+(?:['’][A-Za-z]+)*)*/g;
  const EXCLUDE='button,a,input,textarea,select,option,label,summary,svg,script,style,code,pre,[contenteditable],[draggable],[data-ek-drag-id],[role="button"],[role="checkbox"],[role="radio"],[role="option"],[role="listbox"],[aria-hidden="true"],.ek-actions,.ek-status,.workspace-empty,.sw-word-focus';
  const hash=text=>{let value=2166136261;for(const char of text)value=Math.imul(value^char.charCodeAt(0),16777619);return (value>>>0).toString(36);};
  const newer=(a,b)=>!b||a.clock>b.clock||(a.clock===b.clock&&a.actor>b.actor);
  const validWord=value=>value===null||(value&&typeof value.key==='string'&&value.key.length<600&&typeof value.text==='string'&&value.text.length<=80);
  function create({root,actor,storageKey,send=()=>{},canShare=()=>false}){
    const doc=root.ownerDocument,win=doc.defaultView||window;
    const selections=new Map(),peers=new Map();
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
    function choose(el){
      if(!exerciseId||!el||root.inert)return;
      const current=selections.get(exerciseId),ref=reference(el);
      clock=Math.max(clock,current?.clock||0)+1;
      const entry={clock,actor,word:same(ref,current?.word)?null:ref};
      selections.set(exerciseId,entry);save();paint();emit({kind:'selection',entry});
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
      clearTimeout(hoverTimer);hover=null;clearPeers();exerciseId=next;reconnect();
    }
    function destroy(){disposed=true;observer?.disconnect();clearTimeout(hoverTimer);clearPeers();for(const [name,fn] of Object.entries(events))root.removeEventListener(name,fn);win.removeEventListener?.('blur',blur);}
    const events={click,keydown,pointerover,pointerout};for(const [name,fn] of Object.entries(events))root.addEventListener(name,fn);
    win.addEventListener?.('blur',blur);
    if(typeof MutationObserver!=='undefined'){observer=new MutationObserver(decorate);observer.observe(root,{childList:true,subtree:true,characterData:true});}
    return {setExercise,decorate,receive,reconnect,destroy};
  }
  window.SpaceWhaleWordFocus={create};
})();
