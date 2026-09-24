(() => {
  'use strict';
  const kit=window.SpaceWhaleExerciseKit;
  const base=(id,kind,title,data)=>({version:1,id,kind,title,...data});
  const fixtures=[
    ['matchHost',base('preview-match','matching','Match the greetings',{instruction:'Choose a reply for each greeting.',items:[{id:'m1',text:'Hello!',correctId:'hello'},{id:'m2',text:'How are you?',correctId:'fine'},{id:'m3',text:'See you later!',correctId:'bye'}],options:[{id:'fine',text:'I’m fine.'},{id:'bye',text:'Bye!'},{id:'hello',text:'Hi!'}]})],
    ['gapHost',base('preview-gaps','gaps','Complete the conversation',{instruction:'Write one word in each gap.',items:[{id:'s1',segments:['A: How ',{id:'g1',answers:['are']},' you?']},{id:'s2',segments:['B: I’m ',{id:'g2',answers:['fine','good','great']},'. And you?']},{id:'s3',segments:['A: I’m good. Have a nice ',{id:'g3',answers:['day']},'!']}]})],
    ['audioHost',base('preview-audio','audio','Listen and choose',{instruction:'Listen to the short sound.',audio:'assets/factory/test-tone.wav'})],
    ['choiceHost',base('preview-choice','choice','What can you hear?',{items:[{id:'q1',prompt:'Choose one answer.',options:[{id:'voice',text:'A voice'},{id:'tones',text:'Electronic tones'}],correctId:'tones'}]})]
  ];
  // Preview adapters share feedback presentation without changing lesson mechanics.
  const feedbackMessages=['Try again.','Take another look.','Good start.','So close.','All correct.'];
  function feedbackMessage(results,kind){
    const values=Object.values(results);
    const correct=values.filter(result=>result==='correct').length;
    if(!values.length||values.every(result=>result==='empty'))return kind==='gaps'?'Write an answer.':'Choose an answer.';
    const band=correct===0?0:correct===values.length?4:Math.max(1,Math.min(3,Math.round(correct/values.length*4)));
    return feedbackMessages[band];
  }
  const adapters=new Map();
  function lampFor(parent,id){
    let lamp=parent.querySelector('.preview-result-lamp');
    if(!lamp){
      lamp=document.createElement('span');lamp.className='preview-result-lamp';
      lamp.setAttribute('role','img');lamp.setAttribute('aria-label','Not checked');parent.append(lamp);
    }
    lamp.dataset.item=id;return lamp;
  }
  function decorate(adapter){
    const {host,definition}=adapter;
    const check=host.querySelector('.ek-actions .ek-button:not(.ek-reset)');
    if(check){check.textContent='OK';check.classList.add('preview-ok');check.setAttribute('aria-label','Check answers');}
    host.querySelectorAll('.ek-close').forEach(close=>{
      close.textContent='';close.classList.add('preview-close');close.setAttribute('aria-label','Close');close.title='Close';
    });
    if(definition.kind==='matching')host.querySelectorAll('.ek-card').forEach((card,index)=>{
      const field=card.querySelector('.ek-match-slot');
      if(field.dataset.selected!=='true')field.textContent='';
      lampFor(card,definition.items[index].id);
    });
    if(definition.kind==='gaps')host.querySelectorAll('.ek-sentence').forEach((row,index)=>{
      const gaps=definition.items[index].segments.filter(segment=>typeof segment!=='string');
      // This preview has one gap per sentence; the shared grader still owns all answers.
      if(gaps.length===1)lampFor(row,gaps[0].id);
    });
    if(definition.kind==='choice')host.querySelectorAll('.ek-question').forEach((group,index)=>lampFor(group,definition.items[index].id));
  }
  function makePanel(adapter){
    const {host,definition}=adapter;
    const panel=document.createElement('section');panel.className='preview-answer-key';panel.hidden=true;panel.setAttribute('aria-label','Feedback');
    const message=document.createElement('p');message.className='preview-feedback-message';message.setAttribute('role','status');
    const pairs=document.createElement('ol');pairs.className='preview-answer-pairs';pairs.setAttribute('aria-label','Correct answers');
    definition.items.forEach(item=>{
      const row=document.createElement('li');
      const fragment=(text,answer=false)=>{
        const node=document.createElement(answer?'strong':'span');
        if(!answer)node.className='preview-answer-prompt';node.textContent=text;row.append(node);
      };
      if(definition.kind==='gaps')item.segments.forEach(segment=>{
        if(typeof segment==='string')fragment(segment);else fragment(segment.answers[0],true);
      });
      else{
        fragment(item.text||item.prompt);row.append(document.createTextNode(' — '));
        fragment((item.options||definition.options).find(option=>option.id===item.correctId).text,true);
      }
      pairs.append(row);
    });
    panel.append(message,pairs);host.querySelector('.ek-actions').insertAdjacentElement('afterend',panel);
    Object.assign(adapter,{panel,message,pairs});
  }
  function clearFeedback(adapter){
    adapter.host.querySelectorAll('.preview-result-lamp').forEach(lamp=>{
      delete lamp.dataset.result;lamp.setAttribute('aria-label','Not checked');lamp.removeAttribute('title');
    });
    if(adapter.panel){adapter.panel.hidden=true;adapter.message.textContent='';}
  }
  fixtures.forEach(([id,definition])=>{
    const host=document.getElementById(id);
    if(definition.kind==='audio'){kit.mount(host,definition);return;}
    const adapter={host,definition,showAnswers:true};adapters.set(id,adapter);
    adapter.instance=kit.mount(host,definition,{onChange:()=>{
      clearFeedback(adapter);
      // Matching updates its text after onChange; decorate once that update is complete.
      Promise.resolve().then(()=>decorate(adapter));
    }});
    decorate(adapter);makePanel(adapter);
    // Replace the engine's duplicate count announcement with the short panel message.
    host.querySelector('.ek-status').removeAttribute('role');host.querySelector('.ek-status').setAttribute('aria-hidden','true');
    host.addEventListener('click',event=>{
      decorate(adapter);
      const action=event.target.closest('.ek-actions button');if(!action)return;
      if(action.classList.contains('ek-reset')){clearFeedback(adapter);return;}
      const results=kit.grade(definition,adapter.instance.getAnswers());
      host.querySelectorAll('.preview-result-lamp').forEach(lamp=>{
        const result=results[lamp.dataset.item];lamp.dataset.result=result;
        const label=result==='correct'?'Correct':result==='retry'?'Try again':'Choose an answer';
        lamp.setAttribute('aria-label',label);lamp.title=label;
      });
      adapter.pairs.hidden=!adapter.showAnswers||Object.values(results).every(result=>result==='empty');
      adapter.panel.hidden=false;adapter.message.textContent=feedbackMessage(results,definition.kind);
    });
  });
  const reduced=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let visible=1;
  const sections=[...document.querySelectorAll('.preview-section')];
  function sync(){
    sections.forEach((section,i)=>section.hidden=i>=visible);
    document.getElementById('showNext').hidden=visible===sections.length;
    document.getElementById('collapseLast').hidden=visible===1;
  }
  function reveal(n){
    visible=Math.max(visible,n);sync();
    const section=sections[n-1];section.classList.remove('preview-enter');void section.offsetWidth;section.classList.add('preview-enter');
    section.scrollIntoView({behavior:reduced()?'instant':'smooth',block:'start'});
    document.querySelectorAll('[data-jump]').forEach(a=>{if(Number(a.dataset.jump)===n)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});
  }
  document.getElementById('showNext').addEventListener('click',()=>{if(visible<sections.length)reveal(visible+1);});
  document.querySelectorAll('[data-jump]').forEach(a=>a.addEventListener('click',event=>{event.preventDefault();reveal(Number(a.dataset.jump));}));
  document.getElementById('collapseLast').addEventListener('click',()=>{
    if(visible===1)return;
    sections[visible-1].querySelectorAll('audio').forEach(a=>a.pause());visible--;sync();reveal(visible);
    document.getElementById('showNext').focus({preventScroll:true});
  });
  document.querySelectorAll('[data-theme-choice]').forEach(button=>button.addEventListener('click',()=>{
    document.body.dataset.theme=button.dataset.themeChoice;
    document.querySelectorAll('[data-theme-choice]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  }));
  sync();
  const sidebar=document.getElementById('previewSidebar');
  const sidebarToggle=document.getElementById('sidebarToggle');
  sidebarToggle.addEventListener('click',()=>{
    const collapsed=!sidebar.hidden;sidebar.hidden=collapsed;
    document.querySelector('.reference-app').classList.toggle('preview-sidebar-collapsed',collapsed);
    sidebarToggle.setAttribute('aria-expanded',String(!collapsed));
    const label=collapsed?'Открыть меню':'Свернуть меню';
    sidebarToggle.setAttribute('aria-label',label);sidebarToggle.title=label;
  });

  // Local visual-study timer. Navigation and exercise answers are independent.
  const minutesInput=document.getElementById('lessonMinutes');
  const durationKey='sw.preview.lessonMinutes';
  const validMinutes=value=>Number.isInteger(value)&&value>=1&&value<=1440;
  let minutes=60;
  try { const saved=Number(window.localStorage.getItem(durationKey));if(validMinutes(saved))minutes=saved; } catch (_) {}
  let duration=minutes*60*1000;
  minutesInput.value=String(minutes);
  let elapsed=0, startedAt=null, ticker=null;
  const clock=document.getElementById('lessonClock');
  const toggle=document.getElementById('timerToggle');
  const status=document.getElementById('timerStatus');
  const total=()=>Math.min(duration,elapsed+(startedAt===null?0:Date.now()-startedAt));
  function renderTimer(){
    const spent=total();
    clock.setAttribute('aria-valuemax',String(duration/60000));
    minutesInput.disabled=startedAt!==null||elapsed>0;
    const seconds=Math.ceil((duration-spent)/1000);
    document.getElementById('clockTime').textContent=`${Math.floor(seconds/60).toString().padStart(2,'0')}:${(seconds%60).toString().padStart(2,'0')}`;
    document.getElementById('clockProgress').style.strokeDashoffset=String(100-spent/duration*100);
    clock.setAttribute('aria-valuenow',String(Math.floor(spent/60000)));
    clock.setAttribute('aria-valuetext',`${Math.floor(seconds/60)} мин. ${seconds%60} сек. осталось`);
    if(spent>=duration&&startedAt!==null){
      elapsed=duration;startedAt=null;window.clearInterval(ticker);ticker=null;
      toggle.textContent='Завершено';toggle.disabled=true;toggle.setAttribute('aria-pressed','false');
      status.textContent='Время занятия истекло.';
    }
  }
  toggle.addEventListener('click',()=>{
    if(startedAt===null){
      startedAt=Date.now();ticker=window.setInterval(renderTimer,250);
      toggle.textContent='Пауза';toggle.setAttribute('aria-pressed','true');status.textContent='Таймер запущен.';
    }else{
      elapsed=total();startedAt=null;window.clearInterval(ticker);ticker=null;
      toggle.textContent='Продолжить';toggle.setAttribute('aria-pressed','false');status.textContent='Таймер на паузе.';
    }
    renderTimer();
  });
  document.getElementById('timerReset').addEventListener('click',()=>{
    window.clearInterval(ticker);ticker=null;elapsed=0;startedAt=null;
    toggle.disabled=false;toggle.textContent='Начать урок';toggle.setAttribute('aria-pressed','false');
    status.textContent='Таймер сброшен.';renderTimer();
  });
  minutesInput.addEventListener('change',()=>{
    if(startedAt!==null||elapsed>0){minutesInput.value=String(duration/60000);return;}
    const value=Number(minutesInput.value);
    if(!validMinutes(value)){
      minutesInput.value=String(duration/60000);
      status.textContent='Введите целое число минут от 1 до 1440.';
      return;
    }
    duration=value*60*1000;
    try {window.localStorage.setItem(durationKey,String(value));} catch (_) {}
    renderTimer();
  });
  renderTimer();
})();
