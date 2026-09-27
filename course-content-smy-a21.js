(() => {
'use strict';
const kit=window.SpaceWhaleExerciseKit;
const registry=window.SpaceWhaleLessonMedia=window.SpaceWhaleLessonMedia||{};
const lessonIds={A2_SEQ:'a2-1-w1-smy-1',A2_MOVE:'a2-1-w1-smy-2'};
const phrases={
 A2_SEQ:['first','to begin with','then','next','after that','afterwards','later','eventually','finally','in the end'],
 A2_MOVE:['climb up','climb over','jump over','step onto','move into','come out of','run around']
};
const examples={
 A2_SEQ:[
  'First, we bought the tickets.',
  'To begin with, we checked the address.',
  'Then, we took a bus.',
  'Next, we walked to the hotel.',
  'After that, we had lunch.',
  'Afterwards, we went for a walk.',
  'Later, we met some friends.',
  'Eventually, we found the right place.',
  'Finally, we arrived at the hotel.',
  'In the end, everything was fine.'
 ],
 A2_MOVE:[
  'We climbed up the ladder.',
  'He climbed over the low wall.',
  'She jumped over the log.',
  'She stepped onto the rock.',
  'We moved into the room.',
  'The girl came out of the tent.',
  'The dog ran around the tree.'
 ]
};
const stories={
 A2_SEQ:'I couldn’t find my phone after lunch. My friend was waiting for me at the cinema. First, I checked my bag. It wasn’t there. Then I looked in my jacket pockets. Nothing. I went back to the café and asked the waiter for help. We checked the tables and the floor. Eventually, he found it behind a chair. After that, I called my friend and walked to the cinema. In the end, I arrived before the film started.',
 A2_MOVE:'We were camping near a lake. I was sitting outside our tent when our dog Max came out. He ran around a tree and then jumped over a log. My sister Sara stepped onto a rock to take a photo of him. Later, it started to rain, so we all moved into the tent. Max went to sleep, but Sara and I stayed awake and played cards.'
};
const courseAudioBase='https://xpeywyonbapnvtjnwawi.supabase.co/storage/v1/object/public/course-audio';
const audioRoots={
 A2_SEQ:courseAudioBase+'/a2-1/m1/l1',
 A2_MOVE:courseAudioBase+'/a2-1/m1/l2'
};
// Current author-approved direction: contextual chunks, with visible recording text.
const sequenceChunks=[
 'First, we checked the address before leaving home.',
 'To begin with, we made a short plan for our day in the city.',
 'Then, we took a bus to the city centre and met Anna.',
 'Next, we bought two tickets for the afternoon tour.',
 'After that, we had lunch at a small café near the river.',
 'We finished lunch. Afterwards, we walked along the river.',
 'Later, we stopped at a bookshop and bought a present.',
 'We looked for the hotel for an hour. Eventually, we found it near the station.',
 'Finally, we went back to the hotel. That was the last part of our day.',
 'We wanted to take a bus, but there were no more buses. In the end, we took a taxi.'
];
const media={};
for(const prefix of Object.keys(lessonIds)){
 const slots={};
 phrases[prefix].forEach((phrase,i)=>{
  const n=String(i+1).padStart(2,'0'),root=audioRoots[prefix];
  if(prefix==='A2_SEQ'){
   // Revised text needs its own recording; never play the older phrase under it.
   slots[`${prefix}_P${n}`]={type:'audio',src:root+'/listen-repeat/'+prefix+'_P'+n+'.mp3?v=20260927-ready',script:sequenceChunks[i],workPhrase:phrase};
   slots[`${prefix}_E${n}`]={type:'audio',src:null,script:null};
  }else{
   slots[`${prefix}_P${n}`]={type:'audio',src:root+'/listen-repeat/'+prefix+'_P'+n+'.mp3?v=20260927-ready',script:phrase,workPhrase:phrase};
   slots[`${prefix}_E${n}`]={type:'audio',src:root+'/listen-repeat/'+prefix+'_E'+n+'.mp3?v=20260927-ready',script:examples[prefix][i]};
  }
 });
 slots[`${prefix}_STORY`]={type:'audio',src:audioRoots[prefix]+'/listening/'+prefix+'_STORY.mp3?v=20260927-ready',script:stories[prefix],transcriptId:`${prefix}_STORY_TEXT`};
 slots[`${prefix}_STORY_TEXT`]={type:'text',text:stories[prefix]};
 if(prefix==='A2_SEQ'){
  slots.A2_SEQ_OPENING={type:'image',src:'assets/lesson-media/a2-1/module-1/smy-1/images/day-story.webp',width:1448,height:1086,alt:'Six scenes of a girl waking up, having breakfast, packing her bag, going to school, writing in class and reading at home'};
  slots.A2_SEQ_DAY={type:'image',src:'assets/lesson-media/a2-1/module-1/smy-1/images/a_day_in_six_cozy_scenes.png',width:1448,height:1086,alt:'Six numbered scenes: making the bed, getting dressed, taking a bus, having lunch, working on a laptop and sleeping'};
 }
 else{
  const imageRoot='assets/lesson-media/a2-1/module-1/smy-2/images/';
  slots.A2_MOVE_SHEET={type:'image',src:imageRoot+'movement-sheet.webp',width:1120,height:888,alt:'Six numbered scenes showing movement'};
  for(let i=1;i<=6;i++)slots[`A2_MOVE_IMG0${i}`]={type:'image',src:imageRoot+`movement-0${i}.webp`,width:352,height:420,alt:`Picture ${i}`};
 }
 for(const [id,value] of Object.entries(registry[lessonIds[prefix]]||{}))slots[id]={...slots[id],...value};
 media[prefix]=slots;registry[lessonIds[prefix]]=slots;
}
const ruleTexts={
 "sequence": {
  "text": "Чтобы собеседник понял порядок событий, используйте слова-связки. First вводит первое действие: First, we checked the address. To begin with означает «для начала» и помогает обозначить исходную ситуацию или первый этап.\n\nДля перехода к следующему событию подходят then, next, after that и afterwards: We had lunch. Afterwards, we went for a walk. Здесь вместо afterwards можно сказать after that или then. Later означает «позже», без указания точного промежутка: Later, we met some friends.\n\nFinally может вводить последнее действие: Finally, we went home. Оно также может означать «наконец-то». Eventually подчёркивает результат спустя время, часто после поисков, ожидания или трудностей: We looked for an hour. Eventually, we found the hotel. В этом примере возможно и finally. Eventually не выбирают просто потому, что действие стоит последним в списке.\n\nIn the end показывает, чем закончилась ситуация: We wanted to walk, but it rained. In the end, we took a taxi. Значения in the end, finally и eventually могут пересекаться; выбирайте выражение по смыслу рассказа.\n\nСвязка может стоять в начале предложения, как в примерах, а eventually и finally также часто стоят перед основным глаголом: We eventually found the hotel.",
  "highlights": [
   "First",
   "First, we checked the address.",
   "To begin with",
   "then",
   "next",
   "after that",
   "afterwards",
   "We had lunch. Afterwards, we went for a walk.",
   "Later",
   "Later, we met some friends.",
   "Finally",
   "Finally, we went home.",
   "Eventually",
   "We looked for an hour. Eventually, we found the hotel.",
   "In the end",
   "We wanted to walk, but it rained. In the end, we took a taxi.",
   "We eventually found the hotel."
  ]
 },
 "movement": {
  "text": "Глагол показывает способ движения, а предлог — путь. Climb up the ladder — подняться по лестнице вверх. Climb over the wall — перелезть через стену на другую сторону. Если препятствие преодолевают прыжком, используйте jump over: She jumped over the log.\n\nOnto показывает переход на поверхность: She stepped onto the rock. Сравните: She is on the rock описывает положение, а не переход.\n\nInto показывает перемещение внутрь: It started to rain, so we moved into the tent. Здесь move into означает «переместиться внутрь», не «переехать жить». Out of показывает обратное направление: I was outside when she came out of the tent. Перед названием места сохраняйте обе части: out of the tent.\n\nAround описывает путь вокруг предмета: The dog ran around the tree. Предлог не меняется из-за времени; форму времени получает глагол: run → ran, come → came.",
  "highlights": [
   "Climb up the ladder",
   "Climb over the wall",
   "jump over",
   "She jumped over the log.",
   "Onto",
   "She stepped onto the rock.",
   "She is on the rock",
   "Into",
   "It started to rain, so we moved into the tent.",
   "Out of",
   "I was outside when she came out of the tent.",
   "out of the tent",
   "Around",
   "The dog ran around the tree.",
   "run → ran",
   "come → came"
  ]
 }
};
const teacherNotes={
 "A2_SEQ_M01": "попросить коротко рассказать о дне девушки по шести картинкам слева направо, сначала верхний ряд, затем нижний. Достаточно по одной короткой фразе на сцену; придумывать проблему не нужно. Проверяется уже текущий навык — понятная последовательность. Не разворачивать отдельную практику I was / I went или прошедшего времени. Не требовать новых связок без опоры до их объяснения. На первую попытку — две минуты.",
 "A2_SEQ_M04": "оценивается значение в данном контексте, не якобы единственно возможная английская связка. Обсуждение других естественных формулировок допустимо.",
 "A2_SEQ_M05": "порядок определяется записью, а не произвольной «правильной» расстановкой синонимов. После проверки спросить, какие слова помогли проследить историю.",
 "A2_SEQ_M06": "проверять порядок, связность, формы знакомых глаголов и уместность выбранных связок. Новая языковая работа — самой построить и соединить предложения; готовый текст для замены then на afterwards не давать. Несколько естественных вариантов допустимы. Не требовать именно eventually: оно уместно при двадцатиминутном ожидании, но finally тоже возможно. Дополнительную деталь ученица может придумать, если она не противоречит заметкам. Мелкая пунктуация и несовпадение с образцом не означают неверный ответ.",
 "A2_SEQ_M07": "задача — одна история, а не полный рассказ дважды. Действия на рисунке дают основу; проблему и её решение ученица придумывает, а не угадывает по изображению. При затруднении с идеей предложить «не мог найти нужный файл на ноутбуке», не диктуя предложения.\nНа подготовку около минуты. Ожидаются примерно 5–7 предложений, несколько естественных переходов, понятный результат и короткий обмен вопросами. Можно объединить события; точное число предложений не является критерием правильности. Не требовать все десять связок и не поощрять связку перед каждым предложением ради количества. Сравнить самостоятельность и понятность рассказа с первой попыткой в M01, не скорость речи.",
 "A2_SEQ_M08": "отметить один удачный переход, предложить исправить один реально возникший сбой. Попросить ещё раз сформулировать начало и окончание рассказа. Завершить занятие на 30-й минуте; объём обратной связи подстроить под фактический темп, не объявлять неосвоенный материал усвоенным.",
 "A2_MOVE_M01": "первая попытка описать все шесть картинок своими словами, без готовых Useful phrases. Отметить, как ученица самостоятельно описывает действия и направления; не требовать новых сочетаний до обучения. Не подменять задание называнием мальчика, цвета одежды или повторением Present Continuous. Ladder и log показать на картинке и кратко пояснить при необходимости. Диагностику закончить за две минуты, не требовать освоения до обучения.",
 "A2_MOVE_M02": "пояснить при необходимости по-русски: «перелез через стену на другую сторону». Не подставлять сюда картинку climb up и не называть подъём по лестнице примером climb over. Отдельная новая иллюстрация для этого короткого дополнения не нужна.",
 "A2_MOVE_M04": "Сначала семь контекстных примеров: по одному на каждое сочетание. Проверить выбор значений; затем преподаватель открывает единое правило стрелкой. Само правило — объяснение выбранных сочетаний, а не полный запрет in/on при движении. В некоторых сочетаниях in/into и on/onto возможны оба; не использовать такие допустимые варианты как ложные дистракторы. Come в примере — движение из палатки к наблюдателю снаружи; отдельную новую тему come/go не добавлять.",
 "A2_MOVE_M05": "предложения 1–4 переработаны из выбора предлогов PDF; 5–7 добавлены для явной практики оставшихся сочетаний. Не добавлять второй подходящий предлог в варианты, например on как заведомо неправильный ответ к onto.",
 "A2_MOVE_M06": "первое прослушивание — общий смысл, второе — действия и направления, а не только имя собаки. Не показывать старые картинки как точную раскадровку: в PDF через бревно прыгает девушка, а в записи — собака. Здесь достаточно аудио и текстовых вариантов. Не выводить слова с ключами в заголовке или заранее раскрытом транскрипте.",
 "A2_MOVE_M07": "ситуации задают направление, а не готовый ответ. Ученица выбирает нужный предлог и строит предложение; не нужно использовать каждое слово подсказки буквально. В №3 допустимы because и два коротких предложения вместо so. В №1 Mark climbed the ladder грамматически возможно: предложить добавить up для явного направления, не объявлять предложение неверным. Проверять целевое сочетание и смысл, а не точное совпадение с образцом.",
 "A2_MOVE_M08": "Две короткие истории по заметкам, без обязательной картинки: прогулка по холмам и прогулка с собакой. Первая переносит climb over / climb up / step onto в понятную последовательность пути; вторая — come out of / run around / jump over / move into в историю прогулки и возвращения из-за дождя. Заметки задают факты, но не готовые предложения: ученица выбирает формы глаголов, предлоги и связки, добавляет свою деталь. Допустимы разные естественные рассказы; не требовать буквального совпадения с образцом. Ориентир — 3–4 предложения на ситуацию и короткий обмен вопросами. Useful phrases открыты, образец доступен только после попытки через стрелку преподавателя и отдельное раскрытие. Дать около 30 секунд на подготовку; весь этап занимает примерно 4 минуты. Если позже будет предоставлена картинка, сначала сверить её сюжет с этой редакцией.",
 "A2_MOVE_M09": "проверить одно возникшее смешение направлений и попросить ученицу исправить своё предложение. Итог — не только название действий, но и понятный путь: вверх, через, на поверхность, внутрь, наружу, вокруг. Завершить занятие на 30-й минуте."
};
const E=(id,kind,title,extra={})=>({version:1,id,kind,title,...extra});
const T=text=>({type:'text',text});
const D=(title,text,open=false)=>({type:'disclosure',title,text,open});
const I=mediaRef=>({type:'image',mediaRef});
const P=(id,title,blocks,instruction)=>E(id,'presentation',title,{blocks,...(instruction?{instruction}:{})});
const S=(id,title,children,extra={})=>E(id,'stage',title,{exercises:children.map(exercise=>({id:exercise.id,exercise:exercise.kind==='rule-page'?{...exercise,title,blocks:exercise.blocks.map(block=>({...block,title:block.title===title?'':block.title}))}:exercise})),...extra});
const C=(id,title,items)=>E(id,'choice',title,{items});
const Q=(id,prompt,options,correctId,feedbackText,feedbackHighlights=[])=>({id,prompt,options:options.map((text,i)=>({id:String.fromCharCode(65+i),text})),correctId,feedbackText,feedbackHighlights});
const W=(id,title,items,extra={})=>E(id,'writing',title,{responseMode:'open',revealPossibleAnswers:true,items,...extra});
const A=(id,title,mediaRef)=>E(id,'audio',title,{mediaRef});
const R=(id,title,key)=>E(id,'rule-page',title,{blocks:[{type:'rule',title,text:ruleTexts[key].text,highlights:ruleTexts[key].highlights}]});
const step=(menu,minutes,exercise)=>({menu,navigationTitle:menu,section:'tasks',guide:{time:`${minutes} min`,teacherNotes:teacherNotes[exercise.id]||''},exercise});
const sample=(id,title,text)=>P(id,title,[D('Possible answers',text)]);
const sequencers='First, … / To begin with, …\nThen, … / Next, …\nAfter that, … / Afterwards, …\nLater, …\nEventually, … / Finally, …\nIn the end, …';
function repeat(prefix){
 return E(`${prefix}_M03`,'audio','Listen and repeat.',{
  instruction:'Repeat the phrases and sentences aloud.',layout:'listen-repeat',audioPending:true,
  items:phrases[prefix].map((phrase,i)=>{
   const n=String(i+1).padStart(2,'0'),mediaRef=`${prefix}_P${n}`,exampleMediaRef=`${prefix}_E${n}`;
   const example=media[prefix][exampleMediaRef].script;
   return {id:mediaRef,mediaRef,text:media[prefix][mediaRef].script||phrase,exampleMediaRef,...(example?{example}:{})};
  })
 });
}
const seq=[];
seq.push(step('Opening Speaking',2,P('A2_SEQ_M01','Tell the events in order.',[
 I('A2_SEQ_OPENING'),T('What did she do first?\nWhat did she do after that?\nHow did she end her day?'),
 D('Useful phrases','First, …\nThen, … / After that, …\nFinally, …',true)
],'Look at the pictures. Tell your partner what she did yesterday.')));
seq.push(step('Language Input',4.5,S('A2_SEQ_M02','Read the short story.',[
 P('A2_SEQ_M02-story','Read the short story.',[T('First, we went to the park. Then, we found a place near the lake. After that, we had a picnic. Later, it started to rain. Finally, we went to a café and had some tea.')]),
 C('A2_SEQ_M02-check','Read the short story.',[Q('1','What happened before the picnic?',['It started to rain.','They found a place near the lake.','They had some tea.'],'B','They found a place near the lake.',['found a place near the lake'])]),
 R('A2_SEQ_M02-rule','Как связать события в рассказ','sequence')
],{progressive:true,revealStops:[2,3],requireCheckBeforeNext:true})));
seq.push(step('Pronunciation',3,repeat('A2_SEQ')));
const meaning=(id,chunkIndex,target,question,options,key,feedbackText,feedbackHighlights)=>({
 ...Q(id,sequenceChunks[chunkIndex]+'\n'+question,options,key,feedbackText,feedbackHighlights),promptHighlights:[target]
});
seq.push(step('Meaning Practice',3,C('A2_SEQ_M04','Choose the meaning.',[
 meaning('1',1,'To begin with','When did they make the plan?',['After their day in the city.','Before the other activities.','After a long search.'],'B','They made the plan before the other activities.',['before the other activities']),
 meaning('2',5,'Afterwards','Which event happened second?',['They walked along the river.','They finished lunch.','They did both at the same time.'],'A','They finished lunch first. Afterwards, they walked along the river.',['Afterwards']),
 meaning('3',7,'Eventually','What does this tell us about finding the hotel?',['They found it immediately.','They didn’t find it.','They found it after a long search.'],'C','They found it after a long search.',['after a long search']),
 meaning('4',8,'Finally','When did they go back to the hotel?',['At the start of their day.','After all their other activities.','They stayed there all day.'],'B','Going back to the hotel was the last activity of their day.',['the last activity']),
 meaning('5',9,'In the end','What does this tell us about taking a taxi?',['It was their original plan.','It happened before they checked the buses.','It was the result after their plan changed.'],'C','They could not take a bus. In the end, they took a taxi instead.',['In the end'])
])));
seq.push(step('Listening',5,S('A2_SEQ_M05','Listen to the story.',[
 A('A2_SEQ_M05-audio','Listen to the story.','A2_SEQ_STORY'),
 C('A2_SEQ_M05-main','Listen to the story.',[Q('1','What problem did the speaker have?',['She couldn’t find her phone after lunch.','She couldn’t find the café.','She lost her bag on a bus.'],'A','She couldn’t find her phone after lunch.',['couldn’t find her phone'])]),
 E('A2_SEQ_M05-order','order','Put the events in the order you hear them.',{
  instruction:'Listen again.',tokens:[
   {id:'C',text:'She asked the waiter for help.'},{id:'D',text:'The waiter found the phone.'},
   {id:'B',text:'She checked her bag.'},{id:'A',text:'She called her friend.'},{id:'E',text:'She looked in her jacket pockets.'}
  ],correctOrder:['B','E','C','D','A']
 })
],{progressive:true,revealStops:[2,3],requireCheckBeforeNext:true,transcriptRef:'A2_SEQ_STORY_TEXT',transcriptAfterRefs:['A2_SEQ_M05-order']})));
seq.push(step('Guided Writing',4.5,S('A2_SEQ_M06','Write a message to a friend.',[
 P('A2_SEQ_M06-notes','Write a message to a friend.',[
  T('You are at a café now. Tell your friend about your journey and what happened next.\n\nNotes:\ngo to the bus stop / wait for twenty minutes\nbus arrive\nmeet your sister at the café\nhave lunch together\n\nUse three different phrases from this lesson.'),
  D('Useful phrases',sequencers,true)
 ]),
 W('A2_SEQ_M06-writing','Write a message to a friend.',[{id:'message',prompt:'Your message',multiline:true,possibleAnswers:['First, I went to the bus stop and waited for twenty minutes. Eventually, the bus arrived. After that, I met my sister at the café. In the end, we had a nice lunch together.']}])
],{layout:'grouped',instruction:'Use the notes. Write four or five sentences and link the events.'})));
seq.push(step('Final Speaking',6,S('A2_SEQ_M07','Tell the story of their day.',[
 P('A2_SEQ_M07-speaking','Tell the story of their day.',[
  I('A2_SEQ_DAY'),T('Imagine these people are friends.\n\nWhat happened first and next?\nWhat problem did one of them have?\nWhat did they do about it?\nHow did the day end?\n\nTell one connected story. Then ask your partner one question about it.'),
  D('Useful phrases','First, … / To begin with, …\nThen, … / Next, …\nAfter that, … / Afterwards, …\nLater, …\nFinally, …\nEventually, …\nIn the end, …',true),
  D('Optional help','make the bed → made the bed\nget dressed → got dressed\ntake a bus → took a bus / catch a bus → caught a bus\nhave lunch → had lunch\nwork on a laptop → worked on a laptop / study → studied\ngo to bed → went to bed / sleep → slept')
 ]),
 sample('A2_SEQ_M07-sample','Tell the story of their day.','First, Anna made her bed and got dressed. Then Ben took a bus to meet her. They met at a café, and Anna had lunch. Later, Ben worked on his laptop to plan their trip, but he couldn’t find the tickets. Eventually, he found them in his email and finished his work. Finally, Anna went to bed.')
],{progressive:true,instruction:'Use pictures 1–6 in order and add one problem you invent. Tell the story in the past.'})));

const move=[];
move.push(step('Opening Speaking',2,P('A2_MOVE_M01','Describe what the people and the dog are doing.',[
 I('A2_MOVE_SHEET'),T('Say where they are moving.')
])));
move.push(step('Phrase Input',4,S('A2_MOVE_M02','Match the pictures with the phrases.',[
 E('A2_MOVE_M02-match','matching','Match the pictures with the phrases.',{
  layout:'picture-word',items:['move into','jump over','run around','climb up','come out of','step onto'].map((phrase,i)=>({id:`A2_MOVE_IMG0${i+1}`,mediaRef:`A2_MOVE_IMG0${i+1}`,text:`Picture ${i+1}`,correctId:phrase.replaceAll(' ','-')})),
  options:['step onto','run around','jump over','climb up','move into','come out of'].map(text=>({id:text.replaceAll(' ','-'),text}))
 }),
 P('A2_MOVE_M02-extra','Read the explanation.',[{
  ...T('Climb over the wall means get to the other side of the wall by climbing.\n\nExample: He climbed over the low wall because the gate was closed.'),
  highlights:['Climb over the wall','Example:'],emphasis:['get to the other side of the wall by climbing']
 }])
],{progressive:true,requireCheckBeforeNext:true})));
move.push(step('Pronunciation',3,repeat('A2_MOVE')));
const movementMeaning=(id,sentence,target,options,key,answer)=>({
 ...Q(id,sentence+'\nWhat does the highlighted phrase mean?',options,key,answer),promptHighlights:[target]
});
move.push(step('Rule and Check',4,S('A2_MOVE_M04','Read the examples and choose the meaning.',[
 C('A2_MOVE_M04-discovery','Read the examples and choose the meaning.',[
  movementMeaning('climb-up','The cat climbed up the tree to reach a branch.','climbed up',['It came down towards the ground.','It went higher into the tree.','It went round the tree.'],'B','The cat went higher into the tree.'),
  movementMeaning('climb-over','The gate was locked, so Sam climbed over the low wall.','climbed over',['He reached the top and stayed there.','He went through an opening in it.','He crossed the top to the other side.'],'C','Sam crossed the top of the wall to reach the other side.'),
  movementMeaning('jump-over','Lena jumped over the puddle and landed on dry ground.','jumped over',['She crossed it in one jump.','She jumped into the water.','She walked round its edge.'],'A','Lena crossed the puddle in one jump.'),
  movementMeaning('step-onto','To see better, Alex stepped onto a low rock.','stepped onto',['He walked past the rock.','He stepped down from the rock.','He went from the ground onto its surface.'],'C','Alex stepped from the ground onto the surface of the rock.'),
  movementMeaning('move-into','It started to rain, so we moved into the café.','moved into',['We went from inside to outside.','We went from outside to inside.','We walked past it and stayed outside.'],'B','We went from outside to inside the café.'),
  movementMeaning('come-out-of','I was waiting outside when Nina came out of the shop.','came out of',['She left the inside and joined me outside.','She entered the shop from the street.','She stayed inside near the door.'],'A','Nina left the shop and joined me outside.'),
  movementMeaning('run-around','The dog ran around the tree in a circle.','ran around',['It ran straight towards the tree.','It ran in a circle round the tree.','It ran past the tree in a straight line.'],'B','The dog ran in a circle round the tree.')
 ]),
 R('A2_MOVE_M04-rule','Как описать направление движения','movement')
],{progressive:true,requireCheckBeforeNext:true})));
const gap=(id,before,options,answer,after)=>({id,segments:[before,{id:`A2_MOVE_M05-${id}`,options,answers:[answer]},after]});
move.push(step('Controlled Practice',3,E('A2_MOVE_M05','gaps','Choose the correct preposition.',{
 inputMode:'select',items:[
  gap('1','The boy climbed ',['into','over','out of'],'over',' the fence and got to the other side.'),
  gap('2','She was on the ground. She stepped ',['onto','around','out of'],'onto',' the low platform. Now she was standing on it.'),
  gap('3','The dog was inside the tunnel. I was waiting by the entrance. It came ',['onto','into','out of'],'out of',' the tunnel and ran towards me.'),
  gap('4','We climbed ',['into','out of','up'],'up',' the hill until we reached the top.'),
  gap('5','We were outside the house. It started to rain, so we moved ',['into','over','around'],'into',' the kitchen.'),
  gap('6','The dog ran ',['around','into','over'],'around',' the tree in a circle.'),
  gap('7','She jumped ',['around','over','out of'],'over',' the puddle and landed on the other side.')
 ]
})));
move.push(step('Listening',5,S('A2_MOVE_M06','Listen to the story.',[
 A('A2_MOVE_M06-audio','Listen to the story.','A2_MOVE_STORY'),
 C('A2_MOVE_M06-main','Listen to the story.',[Q('1','What is the story about?',['Learning to climb a tree.','A camping day when it started to rain.','Looking for a lost dog.'],'B','It is about a camping day when it started to rain.',['a camping day'])]),
 C('A2_MOVE_M06-details','Listen again and choose the correct answers.',[
  Q('1','What did Max do after he came out of the tent?',['He ran around a tree and jumped over a log.','He jumped onto a rock and ran into the tent.','He climbed over a wall and ran around the lake.'],'A','He ran around a tree and jumped over a log.',['ran around a tree','jumped over a log']),
  Q('2','What did Sara do to take a photo of Max?',['She climbed up a tree.','She stepped over a log.','She stepped onto a rock.'],'C','She stepped onto a rock.',['stepped onto a rock']),
  Q('3','What did everyone do when it started to rain?',['They ran around a tree.','They moved into the tent.','They climbed over a wall.'],'B','They moved into the tent.',['moved into the tent'])
 ])
],{progressive:true,revealStops:[2,3],requireCheckBeforeNext:true,transcriptRef:'A2_MOVE_STORY_TEXT',transcriptAfterRefs:['A2_MOVE_M06-main','A2_MOVE_M06-details']})));
move.push(step('Guided Writing',3,W('A2_MOVE_M07','Describe what happened.',[
 {id:'1',prompt:'Mark / climb / ladder / reach the top',possibleAnswers:['Mark climbed up the ladder to reach the top.']},
 {id:'2',prompt:'Anna / jump / puddle / the other side / one jump',possibleAnswers:['Anna jumped over the puddle.']},
 {id:'3',prompt:'outside the house / rain / move / inside the kitchen',possibleAnswers:['It started to rain, so we moved into the kitchen.']}
],{instruction:'Use the prompts and phrases from this lesson. Write complete sentences in the past.'})));
move.push(step('Final Speaking',4,S('A2_MOVE_M08','Tell your partner what happened.',[
 P('A2_MOVE_M08-story1','Story 1 — A walk in the hills',[
  T('You and a friend went for a walk in the hills. Tell your partner how you reached a place with a great view.\n\nNotes:\nlow wall across the path / other side\nsteep hill / top\nflat rock / a better view\n\nUse: climb / step\nAdd one detail of your own. Your partner asks one question.'),
  D('Useful phrases','On the way, …\nAt the top, …\nWe wanted to …\nHow did …?',true)
 ]),
 sample('A2_MOVE_M08-sample1','Tell your partner what happened.','A low wall crossed the path, so we climbed over it. Then we climbed up a steep hill. At the top, we stepped onto a flat rock to get a better view. We could see the sea from there.'),
 P('A2_MOVE_M08-story2','Story 2 — A walk with your dog',[
  T('You and your dog were in a café near the park. Tell your partner what happened when you went outside and why you went back.\n\nNotes:\ncafé / outside\ndog / tree / circle\npuddle / other side / one jump\nrain / café / inside\n\nUse: come / run / jump / move\nDecide who jumped over the puddle. Add one detail of your own. Then change roles.'),
  D('Useful phrases','At first, …\nMy dog …\nI decided to …\nWhen it started to rain, …\nWhat happened next?',true)
 ]),
 sample('A2_MOVE_M08-sample2','Tell your partner what happened.','We came out of the café and went to the park. My dog ran around a tree, and I jumped over a puddle to follow him. Then it started to rain, so we moved back into the café. We waited there until the rain stopped.')
],{progressive:true,instruction:'Use the notes and verbs. Tell each story in three or four sentences in the past.'})));

function attach(value,slots){
 if(!value||typeof value!=='object')return;
 if(value.mediaRef){
  const slot=slots[value.mediaRef];if(!slot)throw Error('Unknown Smy media slot: '+value.mediaRef);
  if(slot.type==='image')Object.assign(value,{assetId:value.mediaRef,alt:slot.alt},slot.src?{image:slot.src,imageWidth:slot.width,imageHeight:slot.height}:{imagePending:true});
  if(slot.type==='audio'){
   Object.assign(value,{audioId:value.mediaRef},slot.src?{audio:slot.src}:{audioPending:true});
   if(value.kind==='audio'&&!slot.src)value.instruction='Аудио пока не добавлено.';
  }
 }
 if(value.exampleMediaRef){value.exampleAudioId=value.exampleMediaRef;const slot=slots[value.exampleMediaRef];if(slot.src)value.exampleAudio=slot.src;}
 if(value.transcriptRef){
  const transcript=slots[value.transcriptRef]?.text;
  if(typeof transcript==='string'&&transcript.trim())Object.assign(value,{transcript,transcriptTitle:'Transcript',transcriptAfter:value.transcriptAfterRefs});
  else value.transcriptPending=true;
 }
 Object.values(value).forEach(child=>{if(Array.isArray(child))child.forEach(item=>attach(item,slots));else if(child&&typeof child==='object')attach(child,slots);});
}
const lessons=[
 {id:lessonIds.A2_SEQ,title:'Уроки для Smy 1',topic:'Рассказываем события по порядку',level:'A2.1',whale:1,summary:'Связываем события в понятный рассказ и объясняем, чем закончилась история.',grammar:phrases.A2_SEQ.join('; '),stages:seq,feedback:{id:'A2_SEQ_M08',minutes:2,teacherNotes:teacherNotes.A2_SEQ_M08}},
 {id:lessonIds.A2_MOVE,title:'Уроки для Smy 2',topic:'Взбираемся на высоту',level:'A2.1',whale:1,summary:'Описываем способ и направление движения в коротких рассказах.',grammar:phrases.A2_MOVE.join('; '),stages:move,feedback:{id:'A2_MOVE_M09',minutes:2,teacherNotes:teacherNotes.A2_MOVE_M09}}
];
for(const [i,lesson] of lessons.entries()){
 lesson.durationMinutes=30;lesson.plannedTeachingMinutes=28;lesson.feedbackMinutes=2;
 lesson.source='docs/lessons/smy-a21-work-v2.txt';
 const final=lesson.stages[lesson.stages.length-1];final.guide.teacherNotes+='\n\nПоследние 2 минуты — обратная связь: '+lesson.feedback.teacherNotes;
 attach(lesson,media[i===0?'A2_SEQ':'A2_MOVE']);
 lesson.stages.forEach(stage=>kit.validate(stage.exercise));
}
window.SpaceWhaleContent=window.SpaceWhaleContent||[];
window.SpaceWhaleContent.push(...lessons);
})();
