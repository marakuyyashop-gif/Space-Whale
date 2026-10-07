(function () {
  'use strict';
  const kit=window.SpaceWhaleExerciseKit;
  if(!kit)return;
  const words=['sleep','smile','laugh','stand','lie','cry'];
  const courseAudioBase='https://xpeywyonbapnvtjnwawi.supabase.co/storage/v1/object/public/course-audio';
  const lrAudioBase=courseAudioBase+'/a1-2/w5/l1/listen-repeat';
  const lrAudioVersion='20261007-sarah-deliberate-s095-final';
  const E=(id,kind,title,extra={})=>({version:1,id,kind,title,...extra});
  const stage=(menu,time,exercise,teacherNotes='')=>({menu,navigationTitle:menu,section:'tasks',guide:{time:time+' min',teacherNotes},exercise});
  const pending=assetId=>({imagePending:true,assetId});
  const sheet='Images/A.1.2/Module 4/lesson 4 - sosed/26d89984-db65-4db8-83af-532d3782ee5e.png';
  const crops=[{x:0,y:0,w:33.333,h:50},{x:33.333,y:0,w:33.333,h:50},{x:66.666,y:0,w:33.334,h:50},{x:0,y:50,w:33.333,h:50},{x:33.333,y:50,w:33.333,h:50},{x:66.666,y:50,w:33.334,h:50}];
  const wordMatch=E('L1-M02','matching','Match the pictures with the words.',{
    instruction:'Match the pictures and words.',layout:'picture-word',
    items:words.map((word,i)=>({id:String(i+1),text:String(i+1),image:sheet,imageWidth:1536,imageHeight:1024,crop:crops[i],alt:'Picture '+(i+1),correctId:word})),
    options:['laugh','cry','smile','lie','sleep','stand'].map(word=>({id:word,text:word}))
  });
  const openingImage={image:'Images/A.1.2/Module 4/lesson 4 - sosed/2e841064-fbb7-43a3-8d5c-76c4c9ecc239.png',imageWidth:1448,imageHeight:1086,alt:'Six pictures of Mike and Sara sleeping, smiling, laughing, standing, lying and crying'};
  const opening=E('L1-M01','presentation','Tell your friend what is happening.',{
    blocks:[
      {type:'image',...openingImage},
      {type:'text',text:'Ты разговариваешь с другом по видеосвязи. Посмотри на картинку и скажи, что каждый человек делает сейчас.'}
    ]});
  const examples=['I need to sleep.','Smile, please.','Please don’t laugh.','Please stand here.','You can lie on the sofa.','I don’t want to cry.'];
  const repeat=E('L1-M03','audio','Listen and repeat.',{layout:'listen-repeat',audioPending:false,
    items:words.map((text,i)=>{
      const suffix=String(i+1).padStart(2,'0');
      return {id:text,text,audioId:'A1M5L1_WORD_'+suffix,audio:lrAudioBase+'/A1M5L1_WORD_'+suffix+'.mp3?v='+lrAudioVersion,
        example:examples[i],exampleAudioId:'A1M5L1_EXAMPLE_'+suffix,exampleAudio:lrAudioBase+'/A1M5L1_EXAMPLE_'+suffix+'.mp3?v='+lrAudioVersion};
    })});
  const meaning=E('L1-M04','gaps','Choose the correct meaning.',{inputMode:'select',items:[
    ['lie','лежать',['спать','лежать','стоять']],
    ['laugh','смеяться',['смеяться','улыбаться','плакать']],
    ['sleep','спать',['лежать','стоять','спать']],
    ['smile','улыбаться',['плакать','улыбаться','смеяться']]
  ].map(([word,answer,options],i)=>({id:String(i+1),segments:[word+' — ',{id:'g'+(i+1),answers:[answer],options}]}))});
  const discovery=E('L1-M05','stage','Look at what is happening now.',{progressive:true,requireCheckBeforeNext:true,
    exercises:[
      {id:'models',exercise:E('L1-M05-models','presentation','Look at what is happening now.',{blocks:[
        {type:'text',text:'I am smiling now.',highlights:['am smiling']},
        {type:'image',...pending('A1M5L1_DISCOVERY_01')},
        {type:'text',text:'Leo is lying on the sofa.',highlights:['is lying']},
        {type:'image',...pending('A1M5L1_DISCOVERY_02')},
        {type:'text',text:'We are standing near the sofa.',highlights:['are standing']},
        {type:'image',...pending('A1M5L1_DISCOVERY_03')},
        {type:'text',text:'They are laughing.',highlights:['are laughing']},
        {type:'image',...pending('A1M5L1_DISCOVERY_04')}
      ]})},
      {id:'questions',exercise:E('L1-M05-questions','gaps','Read the examples. Choose the correct options.',{
        inputMode:'select',progressiveQuestions:true,items:[
          {id:'time',segments:['Эти предложения описывают действие ',{id:'time',answers:['сейчас'],options:['обычно','сейчас']},'.']},
          {id:'be',segments:['Перед глаголом используется ',{id:'be',answers:['am/is/are'],options:['do/does','am/is/are']},'.']},
          {id:'ending',segments:['У глагола есть окончание ',{id:'ending',answers:['-ing'],options:['-ing','-s']},'.']}
        ]})}
    ]});
  const rule=E('L1-M06','rule-page','Present Continuous: что происходит сейчас',{blocks:[{type:'rule',text:
    'Когда мы говорим о действии, которое происходит сейчас, используем Present Continuous. Нам нужны am, is или are и глагол с -ing.\n\n'+
    'I → am; he / she / it → is; you / we / they → are.\n\n'+
    'I am smiling. — Я улыбаюсь.\nShe is standing. — Она стоит.\nThey are laughing. — Они смеются.\n\n'+
    'В разговоре можно использовать сокращения: I’m smiling. She’s standing. They’re laughing.\n\n'+
    'Как добавить -ing:\nsleep → sleeping; laugh → laughing; stand → standing.\n'+
    'smile → smiling (убираем последнюю e); lie → lying (ie меняется на y); cry → crying (y сохраняется).\n\n'+
    'now — сейчас; right now — прямо сейчас; at the moment — в данный момент. Эти выражения обычно стоят в начале или конце предложения.\n'+
    'Now I’m smiling. I’m smiling now. She’s sleeping at the moment.\n\n'+
    'Lie здесь означает «лежать». Человек может лежать и не спать.',
    highlights:['Present Continuous','am','is','are','-ing','I am smiling','She is standing','They are laughing','I’m smiling','She’s standing','They’re laughing','sleeping','laughing','standing','smiling','lying','crying']}]});
  const modelLines=['I’m smiling now.','She’s crying right now.','He’s sleeping at the moment.','You’re standing near the sofa.','We’re laughing.','They’re lying on the carpet.'];
  const modelRepeat=E('L1-M07','audio','Listen and repeat.',{layout:'listen-repeat',audioPending:false,
    items:modelLines.map((text,i)=>{
      const suffix=String(i+1).padStart(2,'0');
      return {id:'line'+(i+1),text,audioId:'A1M5L1_MODEL_'+suffix,audio:lrAudioBase+'/A1M5L1_MODEL_'+suffix+'.mp3?v='+lrAudioVersion};
    })});
  const fullForm=E('L1-M08','gaps','Say what is happening now.',{inputMode:'text',
    instruction:'Complete the sentences. Use am, is or are + -ing.',items:[
      ['I ','am smiling',' now. (smile)'],
      ['Leo ','is lying',' on the sofa. (lie)'],
      ['We ','are standing',' near the sofa. (stand)'],
      ['Mia ','is crying',' right now. (cry)'],
      ['They ','are laughing',' at the moment. (laugh)']
    ].map(([before,answer,after],i)=>({id:String(i+1),segments:[before,{id:'g'+(i+1),answers:[answer]},after]}))});
  const script='Hi, Anna! We’re at home. I’m standing near the sofa. Ben is sleeping in the armchair. Nina is smiling. Jack and Lucy are laughing. Max is lying on the carpet.';
  const listening=E('L1-M09','stage','Listen and answer.',{layout:'grouped',transcript:script,transcriptAfter:['find-ben','details'],
    exercises:[
      {id:'player',exercise:E('L1-M09-audio','audio','Listen to the call.',{audioPending:true,audioId:'A1M5L1_LISTENING'})},
      {id:'find-ben',exercise:E('L1-M09-ben','choice','Find Ben.',{layout:'image-grid',instruction:'Listen and choose the correct picture.',items:[{
        id:'ben',prompt:'Which picture shows Ben?',options:[
          {id:'A',text:'A',...pending('A1M5L1_BEN_A')},
          {id:'B',text:'B',...pending('A1M5L1_BEN_B')},
          {id:'C',text:'C',...pending('A1M5L1_BEN_C')}
        ],correctId:'B'}]})},
      {id:'details',exercise:E('L1-M09-details','gaps','Listen to the other details.',{inputMode:'select',instruction:'Listen again. Choose what you hear.',items:[
        ['I’m ','standing',' near the sofa.',['laughing','standing','crying']],
        ['Nina is ','smiling','.',['smiling','crying','laughing']],
        ['Jack and Lucy are ','laughing','.',['standing','sleeping','laughing']]
      ].map(([before,answer,after,options],i)=>({id:String(i+1),segments:[before,{id:'g'+(i+1),answers:[answer],options},after]}))})}
    ]});
  const speakPictures=kit.speaking({id:'L1-M09-say',title:'Look at the new pictures',
    image:pending('A1M5L1_IMAGE_TOM_EMMA_DAN'),
    task:{text:'Скажи по одному предложению о каждом кадре: Tom спит в кресле; Emma и Dan улыбаются.'},
    use:[{words:['Tom','Emma and Dan','sleep','smile'],phrases:['Tom …','Emma and Dan …']}]});
  const final=kit.speaking({id:'L1-M10',title:'Tell your friend what is happening',
    image:pending('A1M5L1_IMAGE_FINAL_THREE_FRAMES'),
    task:{text:'Ты разговариваешь с другом, но он не видит видео. Опиши каждый из трёх кадров: по одному предложению о каждом действии. В первом кадре ты — персонаж YOU. Добавь now, right now или at the moment, где уместно.',
      bullets:['YOU стоит у дивана; Lena улыбается.','Mark спит в кресле; Anna и Max смеются.','Eva лежит на ковре с открытыми глазами; Leo плачет.']},
    use:[{words:['sleep','smile','laugh','stand','lie','cry'],phrases:['I …','He …','She …','They …']}]});
  const stages=[
    stage('Первая попытка',2,opening),stage('Новые слова',3,wordMatch),stage('Произношение слов',2,repeat),
    stage('Значения слов',1,meaning),stage('Заметить модель',3,discovery),stage('Правило',3,rule),
    stage('Произношение модели',2,modelRepeat),stage('Построить форму',4,fullForm),
    stage('Слушать и сказать',4,listening,'Одна запись на два задания. Transcript скрыт до проверки обоих ответов.'),
    stage('Сказать по картинкам',1,speakPictures),stage('Самостоятельное описание',5,final)
  ];
  const lesson={id:'a1-2-w5-l1',level:'A1.2',whale:5,
    summary:'Говорим о действиях, которые происходят прямо сейчас.',grammar:'Present Continuous: am/is/are + V-ing',
    constructions:'now · right now · at the moment',words,durationMinutes:30,
    contentVersion:'video-call-preview-2026-10-07-r2',stages,
    structure:[
      {role:'opening',sources:['L1-M01']},
      {role:'words',sources:['L1-M02','L1-M03']},
      {role:'wordPractice',sources:['L1-M04']},
      {role:'focus',sources:['L1-M05','L1-M06']},
      {role:'practice',sources:['L1-M07','L1-M08']},
      {role:'listening',sources:['L1-M09','L1-M09-say']},
      {role:'final',sources:['L1-M10']}
    ]};
  stages.forEach(s=>kit.validate(s.exercise));
  window.SpaceWhaleLessonMedia=window.SpaceWhaleLessonMedia||{};
  window.SpaceWhaleLessonMedia[lesson.id]={
    A1M5L1_IMAGE_OPENING:{type:'image',src:openingImage.image,width:1448,height:1086,brief:'Шесть кадров с Mike и Sara: sleep, smile, laugh, stand, lie, cry'},
    A1M5L1_IMAGE_TOM_EMMA_DAN:{type:'image',src:null,brief:'Tom спит в кресле; Emma и Dan улыбаются'},
    A1M5L1_IMAGE_FINAL_THREE_FRAMES:{type:'image',src:null,brief:'Три кадра с шестью действиями из финальной задачи'},
    A1M5L1_DISCOVERY_01:{type:'image',src:null,brief:'I am smiling now'},
    A1M5L1_DISCOVERY_02:{type:'image',src:null,brief:'Leo is lying on the sofa'},
    A1M5L1_DISCOVERY_03:{type:'image',src:null,brief:'We are standing near the sofa'},
    A1M5L1_DISCOVERY_04:{type:'image',src:null,brief:'They are laughing'},
    A1M5L1_BEN_A:{type:'image',src:null,brief:'Ben лежит на ковре и бодрствует'},
    A1M5L1_BEN_B:{type:'image',src:null,brief:'Ben спит в кресле'},
    A1M5L1_BEN_C:{type:'image',src:null,brief:'Ben стоит у дивана'},
    A1M5L1_LISTENING:{type:'audio',src:null,script}
  };
  for(let i=0;i<words.length;i++){
    const suffix=String(i+1).padStart(2,'0');
    window.SpaceWhaleLessonMedia[lesson.id]['A1M5L1_WORD_'+suffix]={type:'audio',src:lrAudioBase+'/A1M5L1_WORD_'+suffix+'.mp3?v='+lrAudioVersion,script:words[i]};
    window.SpaceWhaleLessonMedia[lesson.id]['A1M5L1_EXAMPLE_'+suffix]={type:'audio',src:lrAudioBase+'/A1M5L1_EXAMPLE_'+suffix+'.mp3?v='+lrAudioVersion,script:examples[i]};
    window.SpaceWhaleLessonMedia[lesson.id]['A1M5L1_MODEL_'+suffix]={type:'audio',src:lrAudioBase+'/A1M5L1_MODEL_'+suffix+'.mp3?v='+lrAudioVersion,script:modelLines[i]};
  }
  window.SpaceWhaleContent=window.SpaceWhaleContent||[];
  const at=window.SpaceWhaleContent.findIndex(item=>item.id===lesson.id);
  if(at<0)window.SpaceWhaleContent.push(lesson);else window.SpaceWhaleContent[at]=lesson;
})();
