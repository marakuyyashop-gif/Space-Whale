(() => {
  'use strict';
  // Daily owns capture, transport and remote media. Exercise Realtime is independent.
  const dock=document.getElementById('videoDock');
  if(!dock)return;
  const tiles=document.getElementById('videoParticipants');
  const status=document.getElementById('mediaStatus');
  const camera=document.getElementById('cameraToggle'),mic=document.getElementById('micToggle');
  const retry=document.getElementById('mediaRetry'),playAudio=document.getElementById('mediaEnableAudio');
  const client=window.spaceWhaleSupabase;
  const state={call:null,sessionId:null,phase:'idle'};
  const views=new Map();
  let context=null,generation=0,connecting=null,sdkLoading=null,request=null;
  const isClosed=s=>['ended','completed','closed','cancelled','canceled'].includes(s);
  function phase(value,message){
    state.phase=value;dock.dataset.state=value;status.textContent=message;
    camera.disabled=mic.disabled=value!=='joined';retry.hidden=value!=='error';
  }
  function visibility(show){dock.hidden=!show;document.body.classList.toggle('workspace-with-video',show);}
  function loadSdk(){
    if(window.DailyIframe)return Promise.resolve(window.DailyIframe);
    if(sdkLoading)return sdkLoading;
    sdkLoading=new Promise((resolve,reject)=>{
      const script=document.createElement('script');
      const timer=setTimeout(()=>{script.remove();sdkLoading=null;reject(new Error('SDK_TIMEOUT'));},15000);
      script.src='https://cdn.jsdelivr.net/npm/@daily-co/daily-js@0.92.2/dist/daily-iframe.js';script.async=true;script.crossOrigin='anonymous';
      script.onload=()=>{clearTimeout(timer);if(window.DailyIframe)resolve(window.DailyIframe);else{sdkLoading=null;reject(new Error('SDK_MISSING'));}};
      script.onerror=()=>{clearTimeout(timer);script.remove();sdkLoading=null;reject(new Error('SDK_LOAD'));};
      document.head.append(script);
    });
    return sdkLoading;
  }
  function makeTile(key,local,screen=false){
    const root=document.createElement('figure');root.className='workspace-video-tile';root.dataset.local=String(local);root.dataset.screen=String(screen);
    const video=document.createElement('video');video.autoplay=true;video.playsInline=true;video.muted=true;
    const audio=document.createElement('audio');audio.autoplay=true;audio.muted=local;
    const label=document.createElement('figcaption');
    const placeholder=document.createElement('span');placeholder.className='workspace-video-placeholder';placeholder.textContent=screen?'Демонстрация экрана':'Камера выключена';
    root.append(video,placeholder,label,audio);tiles.append(root);
    const view={root,video,audio,label,placeholder};views.set(key,view);return view;
  }
  function bindMedia(element,track,audible=false){
    const current=element.srcObject?.getTracks?.()[0];
    if(current===track)return;
    element.srcObject=track?new MediaStream([track]):null;
    if(track)Promise.resolve(element.play()).catch(()=>{if(audible)playAudio.hidden=false;});
  }
  const track=(participant,kind)=>{
    const entry=participant.tracks?.[kind];
    return entry?.state==='playable'?(entry.persistentTrack||entry.track):null;
  };
  function renderParticipants(){
    const call=state.call;if(!call)return;
    const participants=Object.values(call.participants()),keep=new Set();
    participants.sort((a,b)=>Number(a.local)-Number(b.local));
    participants.forEach(participant=>{
      const id=participant.session_id || (participant.local?'local':'remote');keep.add(id);
      const view=views.get(id)||makeTile(id,participant.local);
      view.label.textContent=participant.local?'Вы':participant.user_name||'Участник';
      const videoTrack=track(participant,'video');bindMedia(view.video,videoTrack);
      bindMedia(view.audio,participant.local?null:track(participant,'audio'),!participant.local);
      view.video.hidden=!videoTrack;view.placeholder.hidden=Boolean(videoTrack);
      const screenTrack=track(participant,'screenVideo');
      if(screenTrack){const key=id+':screen';keep.add(key);const screen=views.get(key)||makeTile(key,participant.local,true);screen.label.textContent='Экран · '+(participant.local?'Вы':participant.user_name||'Участник');bindMedia(screen.video,screenTrack);bindMedia(screen.audio,participant.local?null:track(participant,'screenAudio'),!participant.local);screen.placeholder.hidden=true;}
    });
    views.forEach((view,key)=>{if(!keep.has(key)){view.video.srcObject=view.audio.srcObject=null;view.root.remove();views.delete(key);}});
    const local=participants.find(p=>p.local);
    for(const [button,kind] of [[camera,'video'],[mic,'audio']]){
      const on=Boolean(local?.[kind]);button.classList.toggle('on',on);button.classList.toggle('off',!on);button.setAttribute('aria-pressed',String(on));
      button.setAttribute('aria-label',`${on?'Выключить':'Включить'} ${kind==='video'?'камеру':'микрофон'}`);
    }
  }
  function clearMedia(){
    views.forEach(view=>{view.video.srcObject=view.audio.srcObject=null;view.root.remove();});views.clear();
    playAudio.hidden=true;
    for(const button of [camera,mic]){button.setAttribute('aria-pressed','false');button.classList.remove('on');button.classList.add('off');}
  }
  async function dispose(call){
    if(!call)return;
    // destroy also leaves the room and releases capture, including a pending join.
    try{await call.destroy();}catch(_){}
  }
  async function stopMedia(){
    generation++;request?.abort();request=null;connecting=null;
    const call=state.call;state.call=null;state.sessionId=null;
    clearMedia();phase('idle','');visibility(false);
    await dispose(call);
  }
  function friendlyError(error){
    const code=error?.context?.status;
    if(code===401)return 'Для видеосвязи нужно войти в аккаунт участника занятия.';
    if(code===403||code===404)return 'Нет доступа к видеокомнате этого занятия.';
    return 'Не удалось подключить видео. Упражнения доступны; попробуйте ещё раз.';
  }
  async function connect(next){
    if(!next?.sessionId || next.guest || !['teacher','student'].includes(next.role) || isClosed(next.status)){
      context=null;await stopMedia();return false;
    }
    if(state.sessionId===next.sessionId && (state.phase==='joined'||connecting))return connecting||true;
    const closing=stopMedia();context={...next};state.sessionId=next.sessionId;const epoch=generation;
    visibility(true);phase('connecting','Подключаем видеосвязь…');
    const work=(async()=>{
      let call=null;
      try{
        await closing;if(epoch!==generation)return false;
        const auth=await client.auth.getSession();
        if(epoch!==generation)return false;
        if(!auth.data?.session){const error=new Error('AUTH');error.context={status:401};throw error;}
        request=new AbortController();const timeout=setTimeout(()=>request?.abort(),20000);
        let response;
        try{response=await client.functions.invoke('daily-session',{body:{sessionId:next.sessionId},signal:request.signal});}finally{clearTimeout(timeout);}
        if(epoch!==generation)return false;
        if(response.error)throw response.error;
        const data=response.data;
        if(!data?.roomUrl || !data?.meetingToken || data.role!==next.role)throw new Error('INVALID_RESPONSE');
        const url=new URL(data.roomUrl);
        if(url.protocol!=='https:' || !url.hostname.endsWith('.daily.co') || url.username || url.password)throw new Error('INVALID_ROOM');
        const daily=await loadSdk();if(epoch!==generation)return false;
        call=daily.createCallObject({startVideoOff:true,startAudioOff:true});state.call=call;
        const refresh=()=>{if(state.call===call)renderParticipants();};
        for(const event of ['participant-joined','participant-updated','participant-left','track-started','track-stopped'])call.on(event,refresh);
        call.on('camera-error',()=>{if(state.call===call){status.textContent='Нет доступа к камере или микрофону. Разрешите доступ в браузере и нажмите нужную кнопку ещё раз.';refresh();}});
        call.on('error',()=>{if(state.call===call){phase('error','Видеосвязь прервалась. Попробуйте подключиться снова.');}});
        call.on('left-meeting',()=>{if(state.call===call){clearMedia();phase('error','Вы вышли из видеокомнаты.');}});
        let joinTimeout;
        try{await Promise.race([call.join({url:data.roomUrl,token:data.meetingToken,startVideoOff:true,startAudioOff:true}),new Promise((_,reject)=>{joinTimeout=setTimeout(()=>reject(new Error('JOIN_TIMEOUT')),30000);})]);}finally{clearTimeout(joinTimeout);}
        if(epoch!==generation){await dispose(call);return false;}
        phase('joined','Видеосвязь подключена. Включите камеру и микрофон.');refresh();return true;
      }catch(error){
        if(epoch!==generation)return false;
        state.call=null;await dispose(call);clearMedia();phase('error',friendlyError(error));return false;
      }finally{if(epoch===generation){connecting=null;request=null;}}
    })();connecting=work;return work;
  }
  async function toggle(kind){
    const call=state.call;if(!call||state.phase!=='joined')return;
    const button=kind==='video'?camera:mic;button.disabled=true;
    try{await (kind==='video'?call.setLocalVideo(!call.localVideo()):call.setLocalAudio(!call.localAudio()));renderParticipants();status.textContent='Видеосвязь подключена';}
    catch(_){status.textContent='Не удалось включить устройство. Проверьте разрешения камеры и микрофона.';}
    finally{button.disabled=state.phase!=='joined';}
  }
  camera.addEventListener('click',()=>toggle('video'));mic.addEventListener('click',()=>toggle('audio'));
  retry.addEventListener('click',()=>{if(context)connect({...context});});
  playAudio.addEventListener('click',async()=>{
    let blocked=false;await Promise.all([...views.values()].map(async view=>{if(view.audio.srcObject)try{await view.audio.play();}catch(_){blocked=true;}}));playAudio.hidden=!blocked;
  });
  window.addEventListener('pagehide',()=>{void stopMedia();});
  window.SpaceWhaleMedia={state,connect,stopMedia,toggleCamera:()=>toggle('video'),toggleMic:()=>toggle('audio')};
})();
