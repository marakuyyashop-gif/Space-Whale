const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{parseHTML}=require('linkedom');
const source=fs.readFileSync(require.resolve('../workspace-audio.js'),'utf8');
const flush=()=>new Promise(r=>setImmediate(r));
function fixture(teacher=false,readyMedia=false){
 const {window,document}=parseHTML('<html><body><button id="enable"></button><main><div class="ek-repeat-audio"><audio data-ek-audio-key="phrase:word" src="word.wav"></audio><button class="ek-repeat-play">▶</button></div></main></body></html>');
 let clock=1000,id='exercise1',blocked=false;const timers=new Map(),sent=[],notices=[];let timerId=0;
 const original=document.createElement.bind(document);document.createElement=tag=>{const el=original(tag);if(tag==='audio'){
 el.paused=true;el.currentTime=0;el.duration=10;el.ended=false;if(readyMedia){el.readyState=3;el.load=()=>{};}Object.defineProperty(el,'src',{get:()=>el.getAttribute('src'),set:v=>el.setAttribute('src',v)});
 el.play=async()=>{if(blocked)throw Object.assign(Error('blocked'),{name:'NotAllowedError'});el.paused=false;el.dispatchEvent(new window.Event('play'));};el.pause=()=>{el.paused=true;el.dispatchEvent(new window.Event('pause'));};}return el;};
 vm.runInNewContext(source,{window,console,...(readyMedia?{fetch:async src=>({ok:true,blob:async()=>src}),URL:{createObjectURL:src=>src,revokeObjectURL(){}}}:{}),setTimeout:(fn,delay)=>{timers.set(++timerId,{fn,delay});return timerId;},clearTimeout:n=>timers.delete(n)});
 const root=document.querySelector('main'),enable=document.getElementById('enable');
 const api=window.SpaceWhaleLessonAudio.create({root,enable,isLive:()=>true,canControl:()=>teacher,exerciseId:()=>id,now:()=>clock,send:async c=>{sent.push(c);return 'ok';},requestState:async()=>{},notice:t=>notices.push(t)});
 return {api,root,enable,window,sent,timers,notices,setTime:t=>{clock=t;},setId:v=>{id=v;},block:v=>{blocked=v;},click:()=>root.querySelector('button').dispatchEvent(new window.Event('click',{bubbles:true})),run:()=>{const jobs=[...timers.values()];timers.clear();jobs.forEach(j=>j.fn());}};
}
const cmd={exercise_id:'exercise1',key:'phrase:word',action:'play',position:0,at:1250,revision:1000,serial:1};
test('Repeat forward arrow uses live transport once; synchronized reveal never starts independent playback',async()=>{
 const kit=require('../exercise-kit.js');
 const def={version:1,id:'repeat-live',kind:'audio',layout:'listen-repeat',title:'Repeat',items:[
  {id:'word',text:'polite',audio:'word.wav',example:'My father is very polite.',exampleAudio:'example.wav'}
 ]};
 const t=fixture(true,true),p=fixture(false,true);
 const teacher=kit.mount(t.root,def),pupil=kit.mount(p.root,def,{navigationReadOnly:true,audioReadOnly:true});
 t.api.refresh();p.api.refresh();
 t.root.querySelector('.ek-stage-down').dispatchEvent(new t.window.Event('click',{bubbles:true}));
 await flush();await flush();
 assert.equal(t.sent.length,1);assert.equal(t.sent[0].key,'repeat-live:word:example');assert.equal(t.sent[0].action,'play');assert.equal(t.sent[0].position,0);
 pupil.setViewState(teacher.getViewState(),false);assert.equal(p.sent.length,0);
 p.api.receive(t.sent[0]);await flush();p.setTime(t.sent[0].at);p.run();await flush();
 assert.equal(p.api.player.getAttribute('src'),'example.wav');assert.equal(p.api.player.paused,false);
 t.api.player.currentTime=2;
 t.root.querySelector('.ek-stage-up').dispatchEvent(new t.window.Event('click',{bubbles:true}));
 t.root.querySelector('.ek-stage-down').dispatchEvent(new t.window.Event('click',{bubbles:true}));
 await flush();await flush();assert.equal(t.sent.length,2);assert.equal(t.sent[1].action,'play');assert.equal(t.sent[1].position,0);
 teacher.destroy();pupil.destroy();t.api.destroy();p.api.destroy();
});
test('teacher command carries one scheduled start; pupil plays the trusted mounted source',async()=>{
 const t=fixture(true),p=fixture();t.click();await flush();assert.equal(t.sent.length,1);assert.equal(t.sent[0].at,1250);
 p.api.receive(t.sent[0]);assert.equal(p.api.player.getAttribute('src'),'word.wav');assert.equal(p.api.player.paused,true);
 t.setTime(1250);p.setTime(1250);t.run();p.run();await flush();assert.equal(t.api.player.paused,false);assert.equal(p.api.player.paused,false);
 assert.equal(p.sent.length,0);t.api.destroy();p.api.destroy();
});
test('late audio seeks forward; stale commands cannot restart a paused recording',async()=>{
 const p=fixture();p.setTime(2250);p.api.receive(cmd);p.run();await flush();assert.equal(p.api.player.currentTime,1);
 p.api.receive({...cmd,action:'pause',position:2,revision:2300,serial:2,at:2300});assert.equal(p.api.player.paused,true);assert.equal(p.api.player.currentTime,2);
 p.api.receive(cmd);p.run();assert.equal(p.api.player.paused,true);p.api.destroy();
});
test('autoplay failure exposes one enable button; the same audio element survives phrase changes',async()=>{
 const p=fixture();p.block(true);p.api.receive(cmd);p.setTime(1250);p.run();await flush();assert.equal(p.enable.hidden,false);
 const player=p.api.player;p.block(false);p.enable.dispatchEvent(new p.window.Event('click'));await flush();assert.equal(player.paused,false);assert.equal(p.enable.hidden,true);
 p.root.querySelector('audio').dataset.ekAudioKey='phrase:example';p.root.querySelector('audio').setAttribute('src','example.wav');p.api.refresh();assert.equal(player.paused,true);
 p.api.receive({...cmd,key:'phrase:example',serial:2,revision:1400,at:1500});p.setTime(1500);p.run();await flush();assert.equal(p.api.player,player);assert.equal(player.getAttribute('src'),'example.wav');p.api.destroy();
});
test('pupil Play cannot broadcast and commands cannot load arbitrary URLs or another exercise',()=>{
 const p=fixture();p.click();assert.equal(p.sent.length,0);
 p.api.receive({...cmd,key:'https://untrusted.invalid/track'});p.run();assert.equal(p.api.player.paused,true);
 p.api.receive({...cmd,exercise_id:'other',serial:2});p.run();assert.equal(p.api.player.paused,true);p.api.destroy();
});
test('answer hydration replacing an unchanged audio clip keeps pupil controls disabled',async()=>{
 const p=fixture();p.api.reconnect();await flush();assert.equal(p.root.querySelector('button').disabled,true);
 const copy=p.root.firstElementChild.cloneNode(true);copy.querySelector('button').disabled=false;p.root.replaceChildren(copy);
 await flush();assert.equal(p.root.querySelector('button').disabled,true);p.api.destroy();
});
test('a normal lesson interaction unlocks audio without an initial permission banner',async()=>{
 const p=fixture();p.enable.hidden=true;p.api.reconnect();assert.equal(p.enable.hidden,true);
 p.enable.ownerDocument.body.dispatchEvent(new p.window.Event('click',{bubbles:true}));await flush();assert.equal(p.enable.hidden,true);
 p.api.receive(cmd);p.setTime(1250);p.run();await flush();assert.equal(p.api.player.paused,false);p.api.destroy();
});

test('unfilled audio slots stay disabled and never send playback commands',async()=>{
 for(const teacher of [true,false]){
   const s=fixture(teacher);s.root.querySelector('audio').removeAttribute('src');s.api.refresh();
   assert.equal(s.root.querySelector('button').disabled,true);assert.equal(s.root.querySelector('button').getAttribute('aria-label'),'Audio pending');
   s.click();if(!teacher)s.api.receive(cmd);s.run();await flush();
   assert.equal(s.sent.length,0);assert.equal(s.notices.length,0);assert.equal(s.api.player.getAttribute('src'),null);s.api.destroy();
 }
});

test('disabled pupil player still follows teacher playback, waveform progress and pause',async()=>{
 const t=fixture(true),p=fixture();
 for(const s of [t,p]){
   s.root.innerHTML='<div class="ek-audio-player"><audio data-ek-audio-key="phrase:word" src="word.wav"></audio><button class="ek-audio-play">▶</button><div class="ek-audio-track"><input class="ek-audio-range" type="range"></div><span class="ek-audio-time"></span></div>';
   s.api.refresh();
 }
 assert.equal(p.root.querySelector('button').disabled,true);assert.equal(p.root.querySelector('input').disabled,true);
 t.click();await flush();p.api.receive(t.sent[0]);t.setTime(1250);p.setTime(1250);t.run();p.run();await flush();
 assert.equal(p.api.player.paused,false);p.api.player.currentTime=4;p.api.player.dispatchEvent(new p.window.Event('timeupdate'));
 assert.equal(p.root.querySelector('input').value,'40');assert.equal(p.root.querySelector('.ek-audio-track').style.getPropertyValue('--audio-progress'),'40%');assert.equal(p.root.querySelector('button').disabled,true);
 p.click();await flush();assert.equal(p.sent.length,0);assert.equal(p.api.player.paused,false);
 t.click();await flush();p.api.receive(t.sent.at(-1));assert.equal(p.api.player.paused,true);
 t.api.destroy();p.api.destroy();
});
