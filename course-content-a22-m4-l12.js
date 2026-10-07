(() => {
  'use strict';
  const kit=window.SpaceWhaleExerciseKit;
  const id='a2-2-w4-l12',media={};
  const E=(name,kind,title,extra={})=>({version:1,id:'A22M4L12-'+name,kind,title,...extra});
  const stage=(menu,time,exercise,teacherNotes='')=>({menu,navigationTitle:menu,section:'tasks',guide:{time:time+' min',teacherNotes},exercise});
  const pending=name=>({imagePending:true,assetId:'A22M4L12_'+name});
  const planImage='assets/a22-m4-l12-plan-b.png';
  const courseAudioBase='https://xpeywyonbapnvtjnwawi.supabase.co/storage/v1/object/public/course-audio';
  const audioVersion='20261007-sarah-v3-slow1-final';
  const audio=(name,script)=>{
    const key='A22M4L12_'+name;
    const src=name==='LISTENING'
      ?courseAudioBase+'/dialogues/a2-2-m4-l12-anna-leo-sarah-will-slow1.mp3?v='+audioVersion
      :null;
    media[key]={type:'audio',src,script};
    return src?{audioId:key,audio:src,audioPending:false}:{audioId:key,audioPending:true};
  };
  const repeat=(name,phrases,examples)=>{
    const folder=courseAudioBase+'/a2-2/w4/l12/listen-repeat/';
    return E(name,'audio','Listen and repeat.',{
      layout:'listen-repeat',
      audioPending:false,
      items:phrases.map((text,i)=>{
        const n=i+1;
        const wordKey='A22M4L12_'+name+'-WORD-'+n;
        const wordSrc=folder+name+'-WORD-'+n+'.mp3?v='+audioVersion;
        media[wordKey]={type:'audio',src:wordSrc,script:text};
        const item={id:String(n),text,audioId:wordKey,audio:wordSrc};
        if(examples?.[i]){
          const exampleKey='A22M4L12_'+name+'-EXAMPLE-'+n;
          const exampleSrc=folder+name+'-EXAMPLE-'+n+'.mp3?v='+audioVersion;
          media[exampleKey]={type:'audio',src:exampleSrc,script:examples[i]};
          Object.assign(item,{example:examples[i],exampleAudioId:exampleKey,exampleAudio:exampleSrc});
        }
        return item;
      })
    });
  };
  const words=['catch the next train','change trains','get a taxi','return to the hotel','go a different way','wait for the next bus'];
  const examples=['We can catch the next train at 3:30.','We need to change trains in Rome.','We can get a taxi at the station.','We need to return to the hotel now.','We can go a different way to the station.','We can wait for the next bus here.'];
  const planUse=[{words,phrases:['We could … instead.','Why don’t we …?','That works for me.',"Let’s do that."]}];
  const opening=kit.speaking({id:'A22M4L12-M01',title:'Choose a new plan',image:{image:planImage,alt:'Six travel situations with possible Plan B choices'},
    task:{text:'Look at all six travel situations. Choose two pictures. For each one, suggest a new plan, answer your friend and agree on what to do. Use both ways of suggesting across your conversations.'},
    use:planUse});
  const meanings=[
    ['go a different way','use another road to get to the same place'],
    ['catch the next train','be on time for the next train and take it'],
    ['get a taxi','take a taxi to get to a place'],
    ['wait for the next bus','stay at the bus stop before the next bus comes'],
    ['change trains','travel on one train, then on another'],
    ['return to the hotel','go back to your hotel']
  ];
  const wordInput=E('M02','stage','What do these travel phrases mean?',{progressive:true,requireCheckBeforeNext:true,
    exercises:[
      {id:'examples',exercise:E('M02-examples','presentation','Read the examples.',{blocks:[{type:'text',text:examples.join('\n'),highlights:words}]})},
      {id:'meanings',exercise:E('M02-match','matching','Match the phrases and meanings.',{
        items:meanings.map(([text,correctId],i)=>({id:String(i+1),text,correctId:'m'+i})),
        options:[5,4,3,1,2,0].map(i=>({id:'m'+i,text:meanings[i][1]}))})}
    ]});
  const planGaps=E('M04','gaps','What is their plan?',{inputMode:'text',instruction:'Read each situation. Complete the plan with a phrase from the box. Use each phrase once.',
    bank:['go a different way','return to the hotel','change trains','catch the next train','wait for the next bus','get a taxi'],
    items:[
      ['We missed the 12:00 train. We want to take the 12:20 train.\nWe want to ','catch the next train','.'],
      ['We’ll take one train to Rome, then another train to Milan.\nWe want to ','change trains','.'],
      ['We need a car with a driver to take us from the station to the hotel.\nWe want to ','get a taxi','.'],
      ['We want to go back to our room at the hotel.\nWe want to ','return to the hotel','.'],
      ['We still want to go to the station, but we’ll use another road.\nWe want to ','go a different way','.'],
      ['The next bus comes at 2:15. We want to stay at the stop for it.\nWe want to ','wait for the next bus','.']
    ].map(([before,answer,after],i)=>({id:String(i+1),segments:[before,{id:'g'+(i+1),answers:[answer]},after]}))});
  const dialogue='A: The train is canceled. We could get a taxi instead.\nB: Or why don’t we catch the next train?\nA: That works for me.\nB: Let’s do that.';
  const discovery=E('M05','stage','How do they suggest a new plan?',{progressive:true,requireCheckBeforeNext:true,
    exercises:[
      {id:'dialogue',exercise:E('M05-dialogue','presentation','Read the conversation.',{blocks:[{type:'text',text:dialogue,highlights:['We could get a taxi instead.','why don’t we catch the next train?','That works for me.','Let’s do that.']}]})},
      {id:'meaning',exercise:E('M05-questions','choice','Choose the correct options.',{progressiveQuestions:true,items:[
        ['“We could get a taxi” is about …',['something they did before.','a possible new plan.'],'B'],
        ['“Why don’t we catch the next train?” …',['suggests an idea.','asks why they didn’t take a train before.'],'A'],
        ['“Instead” shows that the taxi …',['replaces the canceled train in their plan.','leaves at the same time as the train.'],'A'],
        ['After could, use …',['to get.','get, without to.'],'B'],
        ['After Why don’t we, use …',['catch.','catching.'],'A']
      ].map(([prompt,options,key],i)=>({id:String(i+1),prompt,options:options.map((text,j)=>({id:j===0?'A':'B',text})),correctId:key}))})}
    ]});
  const ruleText='We could + base verb предлагает один возможный новый план, а не сообщает о прошлом.\nWe could get a taxi instead.\n'+
    'После could — начальная форма без to: could get. Instead означает «вместо этого» и в этой модели стоит в конце.\n\n'+
    'Why don’t we + base verb? предлагает совместное действие: Why don’t we catch the next train?\n\n'+
    'Чтобы принять предложение: That works for me. — Мне подходит. Чтобы договориться: Let’s do that. — Давай так и сделаем.\n\n'+
    'Сохраняем целые фразы: catch the next train; change trains; get a taxi; return to the hotel; go a different way; wait for the next bus. В return to и wait for предлоги входят в сочетания.';
  const rule=E('M06','rule-page','Suggest and agree on a new plan',{blocks:[{type:'rule',text:ruleText,
    highlights:['We could + base verb','We could get a taxi instead.','could get','Why don’t we + base verb?','Why don’t we catch the next train?','That works for me.','Let’s do that.','return to','wait for']}]});
  const modelLines=['We could get a taxi instead.','We could go a different way instead.','We could return to the hotel instead.','Why don’t we catch the next train?','Why don’t we change trains in Rome?','Why don’t we wait for the next bus?','That works for me.','Let’s do that.'];
  const production=E('M08','writing','Suggest a plan and answer your friend.',{responseMode:'open',instruction:'Write a sentence or a short reply.',items:[
    {id:'1',prompt:'You and your friend missed the train. Suggest a taxi. Use could and instead. / get a taxi',possibleAnswers:['We could get a taxi instead.']},
    {id:'2',prompt:'You and your friend missed the bus. Suggest waiting. Use Why don’t we. / wait for the next bus',possibleAnswers:['Why don’t we wait for the next bus?']},
    {id:'3',prompt:'Your friend says, “We could return to the hotel instead.” Accept the idea and agree on the plan. Use both new replies.',possibleAnswers:['That works for me. Let’s do that.']}
  ]});
  const script='Anna: We missed the train. How can we get to the hotel?\nLeo: We could catch the next train instead.\nAnna: It leaves at six. I don’t want to wait three hours.\nLeo: Why don’t we get a taxi?\nAnna: That works for me. But there’s roadwork on King Street.\nLeo: We could go a different way.\nAnna: OK. Let’s do that.';
  const listening=E('M09','stage','Listen to Anna and Leo.',{layout:'grouped',transcript:script,transcriptAfter:['final-plan','suggestions'],
    exercises:[
      {id:'player',exercise:E('M09-player','audio','Listen.',audio('LISTENING',script))},
      {id:'final-plan',exercise:E('M09-plan','choice','How will Anna and Leo travel to the hotel?',{instruction:'Listen and choose the correct answer.',items:[{id:'plan',prompt:'How will Anna and Leo travel to the hotel?',options:[
        {id:'A',text:'They’ll catch the next train.'},{id:'B',text:'They’ll get a taxi.'},{id:'C',text:'They’ll wait for the next bus.'}],correctId:'B'}]})},
      {id:'suggestions',exercise:E('M09-match','matching','What does Leo suggest for each problem?',{instruction:'Listen again. Match the problems and suggestions.',
        items:[
          {id:'1',text:'There’s roadwork on King Street.',correctId:'B'},
          {id:'2',text:'They missed the train.',correctId:'C'},
          {id:'3',text:'The next train leaves in three hours.',correctId:'A'}],
        options:[{id:'A',text:'get a taxi'},{id:'B',text:'go a different way'},{id:'C',text:'catch the next train'}]})}
    ]});
  const chat=E('M10','stage','Agree on a new plan.',{progressive:true,requireCheckBeforeNext:true,
    exercises:[
      ['Friend: We missed the bus. We could get a taxi instead.','That works for me.'],
      ['Friend: There’s roadwork on King Street. What can we do?','We could go a different way instead.'],
      ['Friend: That works for me.',"Let’s do that."]
    ].map(([prompt,reply],i)=>({id:'message'+(i+1),exercise:E('M10-'+(i+1),'writing','Write your reply.',{responseMode:'open',items:[{id:'reply',prompt,possibleAnswers:[reply]}]})}))});
  const final=kit.speaking({id:'A22M4L12-M11',title:'Choose a Plan B with your friend',image:{image:planImage,alt:'Six travel situations with possible Plan B choices'},
    task:{text:'Choose two scenes. Suggest a new plan, respond to your friend, and agree on what to do. Then change roles. Use both ways of suggesting across your two conversations.',
      bullets:['A. The next train leaves in 15 minutes.','B. One train goes from A to B; another goes from B to C. You need to reach C.','C. The bus is canceled; a taxi is available.','D. The train is canceled; the next one is tomorrow. Your hotel is two minutes away.','E. Roadwork closes the route to the hotel; another road is open.','F. The bus left; the next one arrives in eight minutes.']},
    use:planUse});
  const stages=[stage('Opening Speaking',2,opening),stage('Words',3,wordInput),stage('Listen & Repeat',2,repeat('M03',words,examples)),
    stage('Words Practice',3,planGaps),stage('Guided Discovery',4,discovery),stage('Rule',2,rule),
    stage('Listen & Repeat',2,repeat('M07',modelLines)),stage('Suggest and reply',3,production),
    stage('Listening',4,listening),stage('Messages',2,chat),stage('Final Speaking',3,final)];
  const lesson={id,level:'A2.2',whale:4,lessonNumber:12,title:'План Б',summary:'Предлагаем решение дорожной проблемы и договариваемся о новом плане.',
    grammar:'could + base verb; Why don’t we + base verb?',constructions:'We could … instead. · Why don’t we …? · That works for me. · Let’s do that.',
    words,durationMinutes:30,contentVersion:'scenario-2026-10-07',stages,
    structure:[{role:'opening',sources:[opening.id]},{role:'words',sources:[wordInput.id,stages[2].exercise.id]},
      {role:'wordPractice',sources:[planGaps.id]},{role:'focus',sources:[discovery.id,rule.id]},
      {role:'practice',sources:[stages[6].exercise.id,production.id]},{role:'listening',sources:[listening.id]},
      {role:'practice',sources:[chat.id]},{role:'final',sources:[final.id]}]};
  media.A22M4L12_OPENING={type:'image',src:planImage,brief:'Шесть сцен с вариантами нового плана, как в финальном Speaking.'};
  media.A22M4L12_FINAL={type:'image',src:planImage,brief:'Шесть различимых сцен A–F с маршрутами и временами из финального задания.'};
  stages.forEach(s=>kit.validate(s.exercise));
  window.SpaceWhaleLessonMedia={...(window.SpaceWhaleLessonMedia||{}),[id]:media};
  window.SpaceWhaleContent=window.SpaceWhaleContent||[];
  const at=window.SpaceWhaleContent.findIndex(l=>l.id===id);if(at<0)window.SpaceWhaleContent.push(lesson);else window.SpaceWhaleContent[at]=lesson;
})();
