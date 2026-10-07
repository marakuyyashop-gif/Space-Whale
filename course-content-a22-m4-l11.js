(() => {
  'use strict';
  const kit=window.SpaceWhaleExerciseKit;
  const id='a2-2-w4-l11', media={};
  const E=(name,kind,title,extra={})=>({version:1,id:'A22M4L11-'+name,kind,title,...extra});
  const stage=(menu,time,exercise,teacherNotes='')=>({menu,navigationTitle:menu,section:'tasks',guide:{time:time+' min',teacherNotes},exercise});
  const pending=name=>({imagePending:true,assetId:'A22M4L11_'+name});
  const audio=(name,script)=>{const key='A22M4L11_'+name;media[key]={type:'audio',src:null,script};return {audioId:key,audioPending:true};};
  const repeat=(name,words,examples)=>E(name,'audio','Listen and repeat.',{layout:'listen-repeat',audioPending:true,
    items:words.map((text,i)=>({id:String(i+1),text,example:examples?.[i],audioId:'A22M4L11_'+name+'-WORD-'+(i+1),
      ...(examples?.[i]?{exampleAudioId:'A22M4L11_'+name+'-EXAMPLE-'+(i+1)}:{})}))});
  const words=['traffic','flat tire','delay','accident','wrong turn','roadwork'];
  const wordExamples=["There’s a lot of traffic today.",'The car has a flat tire.',"There’s a delay at the station.",'The accident was near the hotel.','This was the wrong turn.',"There’s roadwork near the station."];
  const problemUse=[{words,phrases:['What happened?','I missed the bus/train/flight.','I got lost.','We got a flat tire.','We took a wrong turn.','There was an accident.',"We’re stuck in traffic.",'The train is delayed.','The flight is canceled.',"There’s roadwork near the station."]}];
  const opening=kit.speaking({id:'A22M4L11-M01',title:'Tell your friend why you’re late',image:pending('OPENING'),
    task:{text:'Your friend is waiting at the hotel. Look at all six travel problems: traffic, a flat tire, a delay, an accident, a wrong turn and roadwork. Choose two pictures. Call your friend and explain what happened and what the situation is now.'},
    use:problemUse});
  const wordMatch=E('M02','matching','What is the problem?',{layout:'picture-word',instruction:'Match the pictures and words.',
    items:[['A','flat tire'],['B','roadwork'],['C','wrong turn'],['D','traffic'],['E','delay'],['F','accident']].map(([label,answer])=>({id:label,text:label,alt:'Picture '+label,correctId:answer,...pending('WORD_'+label)})),
    options:['delay','wrong turn','accident','flat tire','traffic','roadwork'].map(text=>({id:text,text}))});
  const wordPractice=E('M04','matching','Which problem does each person describe?',{instruction:'Match the situations and words.',
    items:[
      ['Our train is thirty minutes late.','delay'],
      ['We needed to turn left, but we turned right.','wrong turn'],
      ['Our bus and another car are damaged. The drivers are OK.','accident'],
      ['People are working on the road near the hotel.','roadwork'],
      ['One tire is flat. We can’t drive the car.','flat tire'],
      ['There are a lot of cars on the road. They’re moving very slowly.','traffic']
    ].map(([text,correctId],i)=>({id:String(i+1),text,correctId})),
    options:['roadwork','traffic','wrong turn','delay','flat tire','accident'].map(text=>({id:text,text}))});
  const examples='Ten minutes ago, we missed the train.\nNow our flight is canceled.\nFive minutes ago, I got lost.\nNow we are stuck in traffic.\nTwo minutes ago, we took a wrong turn.\nNow the train is delayed.';
  const cards=[
    ['The train is delayed.','now'],['We took a wrong turn.','before'],['We missed the train.','before'],
    ['We are stuck in traffic.','now'],['I got lost.','before'],['Our flight is canceled.','now']
  ];
  const discovery=E('M05','stage','What happened before? What is the situation now?',{progressive:true,requireCheckBeforeNext:true,
    exercises:[
      {id:'examples',exercise:E('M05-examples','presentation','Read the examples.',{blocks:[{type:'text',text:examples,highlights:['missed the train','is canceled','got lost','are stuck in traffic','took a wrong turn','is delayed']}]})},
      {id:'sort',exercise:E('M05-sort','sort','Put the sentences into two groups.',{groups:[{id:'before',text:'It happened before.'},{id:'now',text:'It is the situation now.'}],
        items:cards.map(([text,correctId],i)=>({id:String(i+1),text,correctId}))})}
    ]});
  const ruleText='Когда рассказываем об уже произошедшей проблеме, используем Past Simple. What happened? означает «Что случилось?».\n\n'+
    'I missed the bus. — Я не успел на автобус.\nI got lost. — Я заблудился.\nWe got a flat tire. — У нас спустило колесо.\nWe took a wrong turn. — Мы повернули не туда.\nThere was an accident. — Произошла авария.\n\n'+
    'Miss the bus/train/flight — не успеть на транспорт. Get lost — заблудиться. В прошлом: missed, got, took.\n\n'+
    'Для ситуации сейчас используем am/is/are:\nI’m stuck in traffic. / We’re stuck in traffic.\nThe train is delayed.\nThe flight is canceled.\nThere’s roadwork near the station.\n\n'+
    'Delayed — позже первоначального времени; canceled — рейс не состоится. Можно сообщить причину и положение вместе: There was an accident. Now we’re stuck in traffic.\n\n'+
    'A delay, a flat tire, an accident, a wrong turn — отдельные проблемы. Traffic и roadwork в этих значениях неисчисляемые: без a/an.';
  const rule=E('M06','rule-page','Problem before and situation now',{blocks:[{type:'rule',text:ruleText,
    highlights:['Past Simple','What happened?','I missed the bus.','I got lost.','We got a flat tire.','We took a wrong turn.','There was an accident.','I’m stuck in traffic.','We’re stuck in traffic.','The train is delayed.','The flight is canceled.']}]});
  const lines=['What happened?','I missed the bus.','I got lost.','We got a flat tire.','We took a wrong turn.','There was an accident.','I’m stuck in traffic.','We’re stuck in traffic.','The train is delayed.','The flight is canceled.'];
  const practice=E('M08','writing','Tell your friend about the problem.',{responseMode:'open',instruction:'Write a sentence. Use the words and the time information.',
    items:[
      ['Five minutes ago: I / miss / the bus.','I missed the bus five minutes ago.'],
      ['Ten minutes ago: we / get / a flat tire.','We got a flat tire ten minutes ago.'],
      ['Now: the flight / be / canceled.','The flight is canceled.'],
      ['Now: there / be / roadwork / near the hotel.',"There’s roadwork near the hotel."]
    ].map(([prompt,answer],i)=>({id:String(i+1),prompt,possibleAnswers:[answer]}))});
  const script='Nina: Hi, Sam. Where are you?\nSam: Hi, Nina. We’re on the bus.\nNina: What happened?\nSam: There was an accident near the station. Now we’re stuck in traffic.\nNina: Are you OK?\nSam: Yes, we’re OK. But we’ll be late.\nNina: OK. I’m at the hotel.';
  const listening=E('M09','stage','Listen to Nina and Sam.',{layout:'grouped',transcript:script,transcriptAfter:['reason','lines'],
    exercises:[
      {id:'player',exercise:E('M09-player','audio','Listen.',audio('LISTENING',script))},
      {id:'reason',exercise:E('M09-reason','choice','Why will Sam be late?',{instruction:'Listen and choose the correct answer.',items:[{id:'reason',prompt:'Why will Sam be late?',options:[
        {id:'A',text:'He missed the bus.'},{id:'B',text:'His flight is canceled.'},{id:'C',text:'There was an accident.'}],correctId:'C'}]})},
      {id:'lines',exercise:E('M09-lines','gaps','What do Nina and Sam say?',{inputMode:'text',instruction:'Listen again. Complete the lines.',items:[
        {id:'1',segments:['Nina: What ',{id:'happened',answers:['happened']},'?']},
        {id:'2',segments:['Sam: There was an ',{id:'accident',answers:['accident']},' near the station.']},
        {id:'3',segments:['Sam: Now we’re ',{id:'stuck',answers:['stuck in traffic']},'.']}
      ]})}
    ]});
  const final=kit.speaking({id:'A22M4L11-M10',title:'Explain why you’re late',image:pending('FINAL'),
    task:{text:'Your friend is waiting for you. Choose two situations. Call and explain the problem. Then change roles and ask your friend what happened.',
      bullets:['A. The train left at 9:00; you arrived at 9:05.','B. You turned right instead of left and do not know where you are.','C. One tire is flat; you cannot drive.','D. There was an accident; your car is now in a long line of cars.','E. The train changes from 11:00 to 11:30.','F. Your flight will not leave today: CANCELED.']},
    use:problemUse});
  const stages=[stage('Opening Speaking',3,opening),stage('Words',3,wordMatch),stage('Listen & Repeat',2,repeat('M03',words,wordExamples)),
    stage('Words Practice',3,wordPractice),stage('Guided Discovery',4,discovery),stage('Rule',2,rule),
    stage('Listen & Repeat',2,repeat('M07',lines)),stage('Write a message',4,practice,'After writing, say two messages aloud.'),
    stage('Listening',4,listening),stage('Final Speaking',3,final)];
  const lesson={id,level:'A2.2',whale:4,lessonNumber:11,title:'Проблемы',summary:'Сообщаем, что случилось в дороге и какова ситуация сейчас.',
    grammar:'Past Simple для события; be для текущего состояния',constructions:'What happened? · I missed … · I got lost. · We’re stuck in traffic. · The train is delayed.',
    words,durationMinutes:30,contentVersion:'scenario-2026-10-07',stages,
    structure:[{role:'opening',sources:[opening.id]},{role:'words',sources:[wordMatch.id,stages[2].exercise.id]},
      {role:'wordPractice',sources:[wordPractice.id]},{role:'focus',sources:[discovery.id,rule.id]},
      {role:'practice',sources:[stages[6].exercise.id,practice.id]},{role:'listening',sources:[listening.id]},{role:'final',sources:[final.id]}]};
  const briefs={OPENING:'Шесть сцен со всеми словами урока: traffic, flat tire, delay, accident, wrong turn, roadwork.',FINAL:'Шесть сцен A–F из задания; табло 11:00 → 11:30 для E.',
    WORD_A:'Крупный вид спущенного колеса.',WORD_B:'Ремонт дороги с инструментами и ограждением.',WORD_C:'Схема неверного поворота.',WORD_D:'Пробка без аварии.',WORD_E:'Поезд и табло 10:00 → 10:30.',WORD_F:'Две столкнувшиеся машины без пострадавших.'};
  for(const [name,brief] of Object.entries(briefs))media['A22M4L11_'+name]={type:'image',src:null,brief};
  for(const [name,rows,examples] of [['M03',words,wordExamples],['M07',lines,null]])rows.forEach((text,i)=>{
    media['A22M4L11_'+name+'-WORD-'+(i+1)]={type:'audio',src:null,script:text};
    if(examples)media['A22M4L11_'+name+'-EXAMPLE-'+(i+1)]={type:'audio',src:null,script:examples[i]};
  });
  stages.forEach(s=>kit.validate(s.exercise));
  window.SpaceWhaleLessonMedia={...(window.SpaceWhaleLessonMedia||{}),[id]:media};
  window.SpaceWhaleContent=window.SpaceWhaleContent||[];
  const at=window.SpaceWhaleContent.findIndex(l=>l.id===id);if(at<0)window.SpaceWhaleContent.push(lesson);else window.SpaceWhaleContent[at]=lesson;
})();
