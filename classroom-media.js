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
  const state={call:null,sessionId:null,phase:'idle',view:'expanded'};
  const move=document.getElementById('mediaMove'),size=document.getElementById('mediaSize');
  const hide=document.getElementById('mediaHide'),restore=document.getElementById('mediaRestore');
  // This is a floating layer, never a column or reserved strip in the exercise layout.
  document.body.append(dock,restore);
  const participantId=window.crypto?.randomUUID?.();
  const mobile=()=>window.matchMedia?.('(max-width: 768px)').matches||false;
  let position=null,drag=null,lessonPresented=null;
  function bounds(){const v=window.visualViewport;return {x:v?.offsetLeft||0,y:v?.offsetTop||0,width:v?.width||window.innerWidth||1024,height:v?.height||window.innerHeight||768};}
  function place(){
    if(dock.hidden)return;
    const b=bounds(),r=dock.getBoundingClientRect();
    const full=state.view==='expanded'&&mobile();
    const wanted=full?{x:b.x+8,y:b.y+8}:position||{x:b.x+b.width-r.width-16,y:b.y+84};
    const x=Math.max(b.x+8,Math.min(wanted.x,b.x+b.width-r.width-8));
    const y=Math.max(b.y+8,Math.min(wanted.y,b.y+b.height-r.height-8));
    dock.style.left=x+'px';dock.style.top=y+'px';
    restore.style.top=Math.max(b.y+8,Math.min(y,b.y+b.height-52))+'px';
    if(!full)position={x,y};
  }
  function setView(view){
    if(!['expanded','mini','hidden'].includes(view))return;
    state.view=view;dock.dataset.view=view;dock.inert=view==='hidden';
    dock.setAttribute('aria-hidden',String(view==='hidden'));restore.hidden=dock.hidden||view!=='hidden';
    const label=view==='expanded'?'Свернуть видео':'Развернуть видео';
    size.setAttribute('aria-label',label);size.title=label;
    place();
  }
  function lessonStarted(id){
    if(!id||lessonPresented===id)return;
    lessonPresented=id;setView('expanded');
  }
  size.addEventListener('click',()=>setView(state.view==='expanded'?'mini':'expanded'));
  hide.addEventListener('click',()=>{setView('hidden');restore.focus();});
  restore.addEventListener('click',()=>{setView('mini');size.focus();});
  dock.addEventListener('keydown',event=>{if(event.key==='Escape'){setView('mini');size.focus();}});
  move.addEventListener('pointerdown',event=>{
    if(event.button!==0||state.view==='expanded'&&mobile())return;
    const r=dock.getBoundingClientRect();drag={id:event.pointerId,x:event.clientX,y:event.clientY,left:r.left,top:r.top};
    move.setPointerCapture(event.pointerId);event.preventDefault();
  });
  move.addEventListener('pointermove',event=>{
    if(!drag||event.pointerId!==drag.id)return;
    position={x:drag.left+event.clientX-drag.x,y:drag.top+event.clientY-drag.y};place();
  });
  const endDrag=()=>{drag=null;};
  for(const type of ['pointerup','pointercancel','lostpointercapture'])move.addEventListener(type,endDrag);
  move.addEventListener('keydown',event=>{
    const delta={ArrowLeft:[-24,0],ArrowRight:[24,0],ArrowUp:[0,-24],ArrowDown:[0,24]}[event.key];
    if(!delta||state.view==='expanded'&&mobile())return;
    event.preventDefault();const r=dock.getBoundingClientRect();position={x:r.left+delta[0],y:r.top+delta[1]};place();
  });
  window.addEventListener('resize',place);window.visualViewport?.addEventListener('resize',place);window.visualViewport?.addEventListener('scroll',place);
  if(window.ResizeObserver)new window.ResizeObserver(place).observe(dock);
  function message(text,notice=false){status.textContent=text;status.hidden=!text||!notice;}
  const views=new Map();
  let context=null,generation=0,connecting=null,sdkLoading=null,request=null;
  const isClosed=s=>['ended','completed','closed','cancelled','canceled'].includes(s);
  function phase(value,message){
    state.phase=value;dock.dataset.state=value;status.textContent=message;status.hidden=value==='joined'||!message;
    camera.disabled=mic.disabled=value!=='joined';retry.hidden=value!=='error';
  }
  function visibility(show){dock.hidden=!show;restore.hidden=!show||state.view!=='hidden';if(show)place();}
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
    dock.dataset.group=String(participants.length>2);
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
    // Keep remote participants first even when they arrive after the local tile.
    participants.forEach(p=>{const id=p.session_id||(p.local?'local':'remote');const view=views.get(id);if(view)tiles.append(view.root);const screen=views.get(id+':screen');if(screen)tiles.append(screen.root);});
    const local=participants.find(p=>p.local);
    for(const [button,kind] of [[camera,'video'],[mic,'audio']]){
      const on=Boolean(local?.[kind]);button.classList.toggle('on',on);button.classList.toggle('off',!on);button.setAttribute('aria-pressed',String(on));
      const label=`${on?'Выключить':'Включить'} ${kind==='video'?'камеру':'микрофон'}`;
      button.setAttribute('aria-label',label);button.setAttribute('data-tooltip',label);
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
    if(code===425)return 'Видеосвязь будет доступна после начала занятия.';
    return 'Не удалось подключить видео. Упражнения доступны; попробуйте ещё раз.';
  }
  async function failedCall(call,message){
    if(state.call!==call)return;
    const stopped=stopMedia(),epoch=generation;
    await stopped;
    if(epoch===generation){visibility(true);phase('error',message);}
  }
  async function connect(next){
    if(!next?.sessionId || (next.guest&&!next.guestToken) || !['teacher','student'].includes(next.role) || isClosed(next.status)){
      context=null;await stopMedia();return false;
    }
    if(next.status==='live')lessonStarted(next.sessionId);
    if(state.sessionId===next.sessionId && (state.phase==='joined'||connecting))return connecting||true;
    const previous=context?.sessionId;
    const closing=stopMedia();if(previous!==next.sessionId){position=null;setView(mobile()&&next.role==='teacher'&&next.status!=='live'?'mini':'expanded');}
    context={...next};state.sessionId=next.sessionId;const epoch=generation;
    visibility(true);phase('connecting','Подключаем видеосвязь…');
    const work=(async()=>{
      let call=null;
      try{
        await closing;if(epoch!==generation)return false;
        if(!next.guest){
          const auth=await client.auth.getSession();
          if(epoch!==generation)return false;
          if(!auth.data?.session){const error=new Error('AUTH');error.context={status:401};throw error;}
        }
        request=new AbortController();const timeout=setTimeout(()=>request?.abort(),20000);
        let response;
        try{response=await client.functions.invoke('daily-session',{body:next.guest?{guestToken:next.guestToken,...(participantId?{participantId}:{})}:{sessionId:next.sessionId},signal:request.signal});}finally{clearTimeout(timeout);}
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
        call.on('camera-error',()=>{if(state.call===call){message('Нет доступа к камере или микрофону. Разрешите доступ в браузере и нажмите нужную кнопку ещё раз.',true);refresh();}});
        call.on('error',()=>{void failedCall(call,'Видеосвязь прервалась. Попробуйте подключиться снова.');});
        call.on('left-meeting',()=>{void failedCall(call,'Вы вышли из видеокомнаты.');});
        let joinTimeout;
        try{await Promise.race([call.join({url:data.roomUrl,token:data.meetingToken,startVideoOff:true,startAudioOff:true}),new Promise((_,reject)=>{joinTimeout=setTimeout(()=>reject(new Error('JOIN_TIMEOUT')),30000);})]);}finally{clearTimeout(joinTimeout);}
        if(epoch!==generation){await dispose(call);return false;}
        phase('joined',next.role==='teacher'?'Комната готова. Включите камеру и микрофон.':'Видеосвязь подключена. Включите камеру и микрофон.');refresh();return true;
      }catch(error){
        if(epoch!==generation)return false;
        state.call=null;await dispose(call);clearMedia();phase('error',friendlyError(error));return false;
      }finally{if(epoch===generation){connecting=null;request=null;}}
    })();connecting=work;return work;
  }
  async function roomAction(action,details={}){
    const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),60000);
    try{
      const result=await client.functions.invoke('daily-session',{body:{...details,action},signal:controller.signal});
      if(result.error||!result.data?.ok)throw new Error(action==='rotate'?'Не удалось подготовить новую комнату. Попробуйте ещё раз.':'Не удалось подтвердить закрытие видеокомнаты. Повторите завершение.');
      return result.data;
    }finally{clearTimeout(timeout);}
  }
  async function toggle(kind){
    const call=state.call;if(!call||state.phase!=='joined')return;
    const button=kind==='video'?camera:mic;button.disabled=true;
    try{await (kind==='video'?call.setLocalVideo(!call.localVideo()):call.setLocalAudio(!call.localAudio()));renderParticipants();message('');}
    catch(_){message('Не удалось включить устройство. Проверьте разрешения камеры и микрофона.',true);}
    finally{button.disabled=state.phase!=='joined';}
  }
  camera.addEventListener('click',()=>toggle('video'));mic.addEventListener('click',()=>toggle('audio'));
  retry.addEventListener('click',()=>{if(context)connect({...context});});
  playAudio.addEventListener('click',async()=>{
    let blocked=false;await Promise.all([...views.values()].map(async view=>{if(view.audio.srcObject)try{await view.audio.play();}catch(_){blocked=true;}}));playAudio.hidden=!blocked;
  });
  window.addEventListener('pagehide',()=>{void stopMedia();});
  window.SpaceWhaleMedia={state,connect,stopMedia,setView,lessonStarted,createInvitation:()=>roomAction('rotate'),endSession:details=>roomAction('end',details),toggleCamera:()=>toggle('video'),toggleMic:()=>toggle('audio')};
})();
