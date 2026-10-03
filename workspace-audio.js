(() => {
  'use strict';
  // One persistent media element keeps the browser's user-gesture permission across
  // phrase/exercise changes. Realtime sends controls, never captured microphone audio.
  function create({root,enable,isLive,canControl,exerciseId,now=Date.now,send,requestState,notice=()=>{}}){
    const doc=root.ownerDocument,player=doc.createElement('audio');player.preload='auto';player.hidden=true;doc.body.append(player);
    let current=null,pending=null,timer=null,revision=0,serial=0,lastSeen={revision:-1,serial:-1},destroyed=false,unlocked=false,applyToken=0;
    const sourceCache=new Map();
    const silence='data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQIAAACAgA==';
    const clips=()=>[...root.querySelectorAll('audio[data-ek-audio-key]')];
    const find=key=>clips().find(el=>el.dataset.ekAudioKey===key);
    // Never skip ahead merely because a remote client loaded the file late.
    // Missing the beginning of an educational clip is worse than a small sync offset.
    const position=command=>Math.max(0,command.position);
    const valid=c=>c&&typeof c.exercise_id==='string'&&typeof c.key==='string'&&c.key.length<500&&['play','pause','stop'].includes(c.action)&&Number.isFinite(c.position)&&c.position>=0&&c.position<86400&&Number.isFinite(c.at)&&Number.isFinite(c.revision)&&Number.isFinite(c.serial);
    function prepareSource(src){
      if(!src)return Promise.resolve(null);
      const cached=sourceCache.get(src);if(cached)return cached.promise;
      const entry={url:null,error:null,promise:null};
      entry.promise=fetch(src,{cache:'force-cache',credentials:'omit'})
        .then(response=>{if(!response.ok)throw new Error('AUDIO_HTTP_'+response.status);return response.blob();})
        .then(blob=>{
          if(destroyed)return src;
          entry.url=URL.createObjectURL(blob);
          return entry.url;
        })
        .catch(error=>{
          entry.error=error;
          console.warn('[Space Whale] Audio prefetch failed; falling back to direct media URL.',error);
          return src;
        });
      sourceCache.set(src,entry);
      return entry.promise;
    }
    function warmClips(){
      for(const el of clips()){const src=el.getAttribute('src');if(src)void prepareSource(src);}
    }
    function waitForMedia(command,timeoutMs=8000){
      if(player.readyState>=3)return Promise.resolve(true);
      return new Promise(resolve=>{
        let done=false;
        const finish=value=>{
          if(done)return;done=true;clearTimeout(timeout);
          player.removeEventListener('canplay',onReady);
          player.removeEventListener('error',onError);
          player.removeEventListener('abort',onError);
          resolve(value);
        };
        const onReady=()=>finish(true),onError=()=>finish(false);
        const timeout=setTimeout(()=>finish(player.readyState>=2),timeoutMs);
        player.addEventListener('canplay',onReady,{once:true});
        player.addEventListener('error',onError,{once:true});
        player.addEventListener('abort',onError,{once:true});
        if(current!==command)finish(false);
      });
    }
    const paint=()=>{
      for(const el of clips()){
        const wrap=el.closest('.ek-audio-player,.ek-repeat-audio'),button=wrap?.querySelector('button');if(!button)continue;
        if(!el.getAttribute('src')){button.disabled=true;button.setAttribute('aria-label','Audio pending');wrap.dataset.state='pending';continue;}
        const active=current?.exercise_id===exerciseId()&&current?.key===el.dataset.ekAudioKey;
        const playing=active&&!player.paused&&!player.ended;
        button.textContent=playing?'❚❚':'▶';button.setAttribute('aria-label',(playing?'Pause ':'Play ')+(el.getAttribute('aria-label')||'audio'));
        button.disabled=false;
        const range=wrap.querySelector('input[type=range]'),duration=active&&Number.isFinite(player.duration)?player.duration:0;
        if(range){range.disabled=isLive()&&!canControl()||!duration;range.value=String(duration?player.currentTime/duration*100:0);}
        wrap.dataset.state=playing?'playing':'paused';
        wrap.querySelector('.ek-audio-track')?.style.setProperty('--audio-progress',(duration?player.currentTime/duration*100:0)+'%');
        const time=wrap.querySelector('.ek-audio-time');if(time&&active){const format=n=>Math.floor(n/60)+':'+String(Math.floor(n%60)).padStart(2,'0');time.textContent=format(player.currentTime||0)+' / '+format(duration);}
      }
    };
    async function prime(){
      if(unlocked)return;
      if(current){await playCurrent();return;}
      player.src=silence;
      try{await player.play();player.pause();unlocked=true;enable.hidden=true;}
      catch(error){
        if(error?.name==='NotAllowedError'&&isLive()&&!canControl())enable.hidden=false;
      }
    }
    function seekCurrent(){
      if(!current)return;
      const target=position(current),duration=player.duration;
      try{player.currentTime=Number.isFinite(duration)?Math.min(duration,target):target;}catch(_){}
    }
    async function playCurrent(){
      const command=current;if(!command||command.action!=='play')return;
      const ready=await waitForMedia(command);
      if(!ready||destroyed||current!==command||command.action!=='play')return;
      seekCurrent();
      if(Number.isFinite(player.duration)&&position(command)>=player.duration){player.pause();paint();return;}
      try{await player.play();if(destroyed||current!==command||command.action!=='play'){player.pause();return;}unlocked=true;enable.hidden=true;paint();}
      catch(error){if(current!==command)return;if(error?.name==='NotAllowedError'){enable.hidden=false;}else if(error?.name!=='AbortError'){notice('Аудио не загрузилось. Повторите Play после восстановления связи.');}}
    }
    async function apply(command){
      if(!isLive()||destroyed)return;
      if(command.exercise_id!==exerciseId()){pending=command;return;}
      const el=find(command.key);
      if(!el&&command.action!=='stop'){pending=command;return;}
      if(el&&!el.getAttribute('src')&&command.action!=='stop'){pending=null;return;}
      pending=null;clearTimeout(timer);player.pause();
      current=command;const token=++applyToken;
      if(command.action==='stop'){current=null;paint();return;}

      // Fully fetch the mounted course asset before assigning it to the shared player.
      // This removes play-time network stalls and makes short clips deterministic.
      const originalSrc=el.getAttribute('src');
      const preparedSrc=await prepareSource(originalSrc);
      if(destroyed||token!==applyToken||current!==command)return;
      if(player.getAttribute('src')!==preparedSrc){
        player.src=preparedSrc;
        player.preload='auto';
        player.load();
      }
      if(command.action==='pause'){
        await waitForMedia(command,3000);
        if(current===command)seekCurrent();
        paint();return;
      }
      timer=setTimeout(()=>{timer=null;void playCurrent();},Math.max(0,command.at-now()));paint();
    }
    function receive(command){
      if(!valid(command)||!isLive()||canControl())return;
      if(command.revision<lastSeen.revision||command.revision===lastSeen.revision&&command.serial<=lastSeen.serial)return;
      lastSeen={revision:command.revision,serial:command.serial};
      if(pending&&(command.revision<pending.revision||command.revision===pending.revision&&command.serial<=pending.serial))return;
      void apply(command);
    }
    async function issue(key,action,time=0){
      const el=find(key);
      if(!canControl()||!isLive()||(action!=='stop'&&!el?.getAttribute('src')))return;
      // Teacher waits for the local asset to be fully cached before the command is sent.
      // Students warm the same asset on render, so the 500 ms lead is normally enough
      // for the Realtime message without sacrificing the beginning of the clip.
      if(action!=='stop')await prepareSource(el.getAttribute('src'));
      const command={exercise_id:exerciseId(),key,action,position:time,at:now()+(action==='play'?500:0),revision:now(),serial:++serial};
      revision=command.revision;
      void apply(command);
      try{const result=await send(command);if(result!=='ok')throw Error('AUDIO_NOT_SENT');}
      catch(_){if(current===command){clearTimeout(timer);player.pause();paint();}notice('Команда аудио не доставлена ученикам. Проверьте связь и повторите Play.');}
    }
    const click=event=>{
      const button=event.target.closest?.('.ek-audio-play,.ek-repeat-play');if(!button||!isLive())return;
      const el=button.parentElement.querySelector('audio');if(!el)return;
      if(!canControl()){
        clearTimeout(timer);pending=null;current=null;++applyToken;player.pause();paint();
        return;
      }
      event.preventDefault();event.stopImmediatePropagation();if(!el.getAttribute('src'))return;
      const key=el.dataset.ekAudioKey;if(!key)return;
      const active=current?.key===key&&current.exercise_id===exerciseId();
      const autoplay=event.detail?.repeatAutoplay===true;
      const action=!autoplay&&active&&current.action==='play'&&!player.ended?'pause':'play';
      // Prime while still inside the teacher's actual click (important on Safari).
      const time=!autoplay&&active&&!player.ended?(player.currentTime||0):0,id=exerciseId();
      const run=()=>{if(id===exerciseId())void issue(key,action,time);};
      if(!unlocked&&!current)void prime().then(run);else run();
    };
    const seek=event=>{
      const range=event.target.closest?.('.ek-audio-range');if(!range||!isLive())return;
      event.stopImmediatePropagation();if(!canControl()||!current||!Number.isFinite(player.duration))return;
      void issue(current.key,player.paused?'pause':'play',Number(range.value)/100*player.duration);
    };
    function stop(){clearTimeout(timer);pending=null;current=null;player.pause();paint();}
    function refresh(){
      if(!isLive()){if(current)stop();return;}
      warmClips();
      if(current&&(current.exercise_id!==exerciseId()||!find(current.key))){clearTimeout(timer);player.pause();current=null;++applyToken;}
      if(pending&&pending.exercise_id===exerciseId()&&find(pending.key))void apply(pending);
      paint();
    }
    function share(){if(canControl()&&current&&isLive())void send({...current,position:player.currentTime||0,action:player.paused?'pause':'play',at:now()+(player.paused?0:500),revision:Math.max(now(),revision),serial:++serial}).catch(()=>{});}
    const reconnect=()=>{if(!isLive())return;if(canControl())share();else{void prime();void requestState?.();}refresh();};
    // A normal tap on camera/minimize/Continue can grant playback permission.
    // No permission button is shown unless an actual recording is blocked.
    const unlockOnInteraction=()=>{if(isLive()&&!canControl()&&!unlocked){if(current?.action==='play')void playCurrent();else void prime();}};
    doc.addEventListener('click',unlockOnInteraction,true);
    root.addEventListener('click',click,true);root.addEventListener('input',seek,true);
    enable.addEventListener('click',()=>{if(current?.action==='play')void playCurrent();else void prime();});
    for(const type of ['play','pause','timeupdate','ended'])player.addEventListener(type,paint);
    player.addEventListener('loadedmetadata',()=>{seekCurrent();paint();});

    const Observer=doc.defaultView?.MutationObserver;
    let observedClips=[];
    const observer=Observer?new Observer(()=>{
      // UI writes do not mutate the list of audio elements. Compare their identity
      // before refreshing to avoid observing our own button/time text changes.
      const elements=clips(),signature=elements.map(el=>el.dataset.ekAudioKey+'='+el.getAttribute('src')).join('|');
      const replaced=elements.length!==observedClips.length||elements.some((el,index)=>el!==observedClips[index]);
      if(replaced||signature!==observer.signature){observedClips=elements;observer.signature=signature;refresh();}
    }):null;
    observer?.observe(root,{childList:true,subtree:true});
    return {receive,share,reconnect,refresh,stop,player,destroy(){destroyed=true;stop();observer?.disconnect();doc.removeEventListener('click',unlockOnInteraction,true);root.removeEventListener('click',click,true);root.removeEventListener('input',seek,true);for(const entry of sourceCache.values())if(entry.url)URL.revokeObjectURL(entry.url);sourceCache.clear();player.remove();}};
  }
  window.SpaceWhaleLessonAudio={create};
})();
