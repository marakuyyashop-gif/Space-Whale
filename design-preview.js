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
  fixtures.forEach(([id,data])=>kit.mount(document.getElementById(id),data,{}));
  // Icon-only Reset retains the engine's accessible name and behavior.
  document.querySelectorAll('.ek-reset').forEach(button=>{
    button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10a8 8 0 1 1 1 7M4 4v6h6"/></svg>';
    button.title='Сбросить ответы в этом задании';
    button.setAttribute('aria-label','Сбросить ответы в этом задании');
  });
  const reduced=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let visible=1;
  const sections=[...document.querySelectorAll('.preview-section')];
  function sync(){
    sections.forEach((section,i)=>section.hidden=i>=visible);
    document.querySelectorAll('[data-reveal]').forEach(button=>{button.hidden=Number(button.dataset.reveal)<=visible;button.parentElement.hidden=button.hidden;});
    document.querySelector('.preview-collapse').hidden=visible===1;
  }
  function reveal(n){
    visible=Math.max(visible,n);sync();
    const section=sections[n-1];section.classList.remove('preview-enter');void section.offsetWidth;section.classList.add('preview-enter');
    section.scrollIntoView({behavior:reduced()?'instant':'smooth',block:'start'});
    document.querySelectorAll('[data-jump]').forEach(a=>{if(Number(a.dataset.jump)===n)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});
  }
  document.querySelectorAll('[data-reveal]').forEach(button=>{button.setAttribute('aria-controls','sample-'+button.dataset.reveal);button.addEventListener('click',()=>reveal(Number(button.dataset.reveal)));});
  document.querySelectorAll('[data-jump]').forEach(a=>a.addEventListener('click',event=>{event.preventDefault();reveal(Number(a.dataset.jump));}));
  document.getElementById('collapseLast').addEventListener('click',()=>{
    if(visible===1)return;
    sections[visible-1].querySelectorAll('audio').forEach(a=>a.pause());visible--;sync();reveal(visible);
    sections[visible-1].querySelector('[data-reveal]')?.focus({preventScroll:true});
    document.getElementById('previewStatus').textContent='Задание свёрнуто. Ответы сохранены до закрытия этой страницы.';
  });
  document.querySelectorAll('[data-theme-choice]').forEach(button=>button.addEventListener('click',()=>{
    document.body.dataset.theme=button.dataset.themeChoice;
    document.querySelectorAll('[data-theme-choice]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  }));
  sync();
})();
