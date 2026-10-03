(() => {
'use strict';
// Base content: lesson-sources/a12-m4-l4-l5-v7-final.md.
// L4/L5 opening and final Speaking use docs/SPEAKING_TEMPLATE.md (approved 2026-10-03).
// L4 tasks 3–10: owner-approved replacement on 2026-10-03.
// New task identities have new IDs; retained Speaking/Word Pick/media IDs stay stable.
// L5 remains based on v7; L4 Listening awaits the continuation.
// Media scripts are ready; recordings remain explicitly pending.
const kit=window.SpaceWhaleExerciseKit, registry=window.SpaceWhaleLessonMedia;
const E=(id,kind,title,extra={})=>({version:1,id,kind,title,...extra});
const T=text=>({type:'text',text});
const D=(title,text,open=false)=>({type:'disclosure',title,text,open});
const roleText=(audience,text)=>({...T(text),audience});
const P=(id,title,blocks,instruction='')=>E(id,'presentation',title,{blocks,instruction});
const R=(id,text)=>E(id,'rule-page','Language focus',{blocks:[{type:'rule',text}]});
const C=(id,title,rows)=>E(id,'choice',title,{items:rows.map(([prompt,options,key],i)=>({id:String(i+1),prompt,options:options.map((text,j)=>({id:String(j),text})),correctId:String(key)}))});
const W=(id,title,rows,accepted=false,instruction='')=>E(id,'writing',title,{responseMode:accepted?'accepted':'open',revealPossibleAnswers:!accepted,instruction,items:rows.map(([prompt,answers,hint],i)=>({id:String(i+1),prompt,...(hint?{hint}:{}),[accepted?'acceptedAnswers':'possibleAnswers']:Array.isArray(answers)?answers:[answers]}))});
const M=(id,title,rows,order)=>E(id,'matching',title,{items:rows.map(([text],i)=>({id:String(i+1),text,correctId:'o'+i})),options:order.map(i=>({id:'o'+i,text:rows[i][1]}))});
const pictureWords=(id,lesson,words,order)=>E(id,'matching','Соедините картинки и слова.',{
 layout:'picture-word',
 items:words.map((word,i)=>({id:String(i+1),text:String(i+1),alt:'Картинка '+(i+1),correctId:'o'+i,image:`assets/lesson-media/a1-2/module-4/lesson-${lesson}/word-pick/${word}.webp`,imageWidth:480,imageHeight:600})),
 options:order.map(i=>({id:'o'+i,text:words[i]}))
});
const S=(id,title,children,extra={})=>E(id,'stage',title,{progressive:true,exercises:children.map(exercise=>({id:exercise.id,exercise})),...extra});
const stage=(menu,time,exercise,teacherNotes='',section='tasks')=>({menu,navigationTitle:menu,section,guide:{time:time?time+' min':'Self study',teacherNotes},exercise});
const media={4:{},5:{}};
const addAudio=(n,id,script)=>{media[n][id]={type:'audio',src:null,script};return id;};
function repeat(n,id,words,examples){
 return E(id,'audio','Listen and repeat.',{layout:'listen-repeat',audioPending:true,items:words.map((text,i)=>{const code='L'+n+'-W'+String(i+1).padStart(2,'0');return {id:code,text,mediaRef:addAudio(n,code,text),example:examples[i],exampleMediaRef:addAudio(n,code+'-example',examples[i])};})});
}
// Role cards contain task information, not access-controlled personal data.
// Filter them before mounting so the other participant's answers are absent from the UI.
window.SpaceWhaleLessonView=(exercise,role)=>{
 if(exercise.kind!=='presentation'||!exercise.blocks?.some(b=>b.audience))return exercise;
 const blocks=exercise.blocks.filter(b=>!b.audience||b.audience===role);
 return {...exercise,blocks};
};
const words4=['polite','rude','helpful','lazy','quiet','noisy'];
const words5=['food','drink','furniture','clothing','building','shop'];
const phrases4='What is he like? / What is she like?\nWhat does he look like? / What does she look like?\nHe is … / She is …\nHe has … / She has …';
const phrases5='It’s a kind of …\nIt’s a type of …\nWhat is …?';
const l4=[];
l4.push(stage('Speaking',2,kit.speaking({
 id:'L4-M01',
 title:'Describe your new neighbors',
 image:{image:'Images/A.1.2/Module 4/lesson 4 - sosed/8566029d-525c-4963-93f5-2e8f36741973.png',alt:'Два соседа в шести бытовых ситуациях.',imageWidth:1448,imageHeight:1086},
 task:{
  text:'В ваш район переехали новые соседи. Вы уже с ними познакомились, и ваш друг расспрашивает вас о них. Расскажите ему:',
  bullets:['какие они;','как они выглядят.']
 },
 use:[
  {words:['polite','rude','helpful','lazy','quiet','noisy'],phrases:['What is he/she like?','He/She is ...']},
  {words:['long hair','short hair','brown hair','blonde hair'],phrases:['What does he/she look like?','He/She has ...']}
 ]
})));
const meanings4=[['polite','вежливый'],['rude','грубый'],['helpful','готовый помочь'],['lazy','ленивый'],['quiet','тихий'],['noisy','шумный']];
l4.push(stage('Word Pick',3,S('L4-M02','Соедините картинки и слова.',[pictureWords('L4-word-translation',4,words4,[3,5,0,4,1,2])])));
l4.push(stage('Listen & Repeat',2,repeat(4,'L4-M03',words4,[
 'My father is very polite.',
 'This man is rude.',
 'My children are very helpful.',
 'I’m sometimes lazy on weekends.',
 'My sister is usually quiet.',
 'Our neighbors are noisy at night.'
])));
const gap4=(id,before,answer,after,options)=>({id,segments:[before,{id,answers:[answer],...(options?{options}:{})},after]});
l4.push(stage('Dropdown Gap',2.5,E('L4-dropdown-gap','gaps','Complete the sentences with the correct words.',{
 inputMode:'select',instruction:'Choose the correct options.',items:[
  gap4('1','I can’t hear you. The people next to me are very ','noisy','. Can you say it again, please?',['quiet','noisy','helpful']),
  gap4('2','I don’t have a charger. Eva is ','helpful',' and gives me one.',['lazy','rude','helpful']),
  gap4('3','Ben’s very ','polite',', he always says “please” and “thank you”.',['polite','noisy','rude']),
  gap4('4','“Give me your sandwich!” — “Don’t be ','rude','. Say ‘please’.”',['helpful','quiet','rude']),
  gap4('5','Sam is ','quiet',' at school, he doesn’t talk with his classmates.',['noisy','quiet','lazy'])
 ]
})));
const typed4=[
 gap4('1','Anna is always very ','helpful','. She helps me carry these boxes.'),
 gap4('2','Max is so ','lazy',', he never wants to help at home.'),
 gap4('3','These people are too ','noisy','. I can’t hear you.'),
 gap4('4','Don’t push me, Ben. That’s ','rude','.')
];
typed4.forEach((item,i)=>{
 const ref='L4-TYPED-I'+String(i+1).padStart(2,'0');
 media[4][ref]={type:'image',src:null,brief:[
  'Anna helps carry boxes.', 'Max does not want to help at home.',
  'People are making too much noise to hear a conversation.', 'Ben pushes another person.'
 ][i]};
 Object.assign(item,{imagePending:true,imageMediaRef:ref,assetId:ref,imageWidth:480,imageHeight:600});
});
l4.push(stage('Typed Gap',2.5,E('L4-typed-gap','gaps','Complete the sentences.',{
 inputMode:'text',layout:'picture-rows',instruction:'Посмотрите на картинки и впишите подходящие слова из урока.',items:typed4
})));
const rule4=E('L4-question-rule','rule-page','Как спросить о человеке',{
 blocks:[{type:'rule',text:'Вопросы What is he/she like? и What does he/she look like? помогают узнать разную информацию о человеке.\n\nWhat is he/she like? — «Какой он / какая она?» Так спрашивают о характере и поведении. В ответе можно использовать He/She is + прилагательное.\n\n— What is he like?\n— He is quiet and polite.\n\nWhat does he/she look like? — «Как он / она выглядит?» Так спрашивают о внешности. Чтобы описать волосы, используйте He/She has + описание волос.\n\n— What does she look like?\n— She has short curly hair.\n\nВ первом вопросе используется is, во втором — does + look. После does у look нет окончания -s. Повторять look like в ответе не нужно.\n\nНе путайте эти вопросы с What does she like? — «Что ей нравится?» Это вопрос о предпочтениях.',
 highlights:['What is he/she like?','What does he/she look like?','He/She is + прилагательное','What is he like?','He/She has + описание волос','What does she look like?','does + look','look like','What does she like?']
 }]
});
const discovery4=E('L4-complete-rule','gaps','Complete the rules.',{
 inputMode:'select',instruction:'Choose the correct options.',items:[
  gap4('1','Используем What does she look like?, когда хотим узнать ','как она выглядит','.', ['какая она в общении','как она выглядит','что она любит']),
  gap4('2','Используем What is she like?, когда хотим узнать ','какая она в общении','.', ['как она выглядит','что она любит','какая она в общении'])
 ]
});
l4.push(stage('Complete the Rule · Rule',4,S('L4-discovery-rule','Complete the rules.',[
 P('L4-question-examples','Complete the rules.',[{...T('What does she look like? — She has long brown hair.\n\nWhat is she like? — She is polite and helpful.'),highlights:['look like?','like?']}]),
 discovery4,rule4
],{revealStops:[2,3],requireCheckBeforeNext:true})));
l4.push(stage('Multiple Select',2,E('L4-multiple-select','choice','Choose the answers.',{
 multiple:true,instruction:'Отметьте все правильные ответы.',items:[
  {id:'1',prompt:'What does she look like?',options:[
   'She is helpful.','Her hair is long.','She is rude.','She has curly brown hair.','She is lazy.','Her hair is short and straight.'
  ].map((text,i)=>({id:String(i+1),text})),correctIds:['2','4','6']},
  {id:'2',prompt:'What is he like?',options:[
   'He is quiet.','His hair is short.','He is polite.','He is noisy.','He has straight hair.','His hair is long.'
  ].map((text,i)=>({id:String(i+1),text})),correctIds:['1','3','4']}
 ]
})));
l4.push(stage('Matching',2,M('L4-question-answer-match','Match the questions with the answers.',[
 ['What is he like?','He’s a little lazy at home.'],
 ['What does she look like?','Her hair is short and curly.'],
 ['What does he look like?','He has long straight hair.'],
 ['What is she like?','She’s helpful. She often helps me with my homework.']
],[1,0,3,2])));
l4.push(stage('Write the questions',3,W('L4-questions-for-answers','Write the questions for the answers.',[
 ['Jake is a very rude and lazy boy. He never helps his mom.',['What is Jake like?','What is he like?']],
 ['Nora has brown eyes and short hair.',['What does Nora look like?','What does she look like?']],
 ['Yes, she is tall and beautiful, she has long blonde hair.',['Is she tall and beautiful?','Does she have long blonde hair?']],
 ['My parents are very kind and smart.',['What are your parents like?','What are they like?']]
],false,'Задайте вопрос к предложению.')));
l4.push(stage('Final · Speaking',5,kit.speaking({
 id:'L4-M11',
 title:'Describe the new students',
 image:null,
 task:{
  text:'В ваш класс пришли два новых ученика. Вы уже с ними познакомились, и ваш одноклассник расспрашивает вас о них. Расскажите ему:',
  bullets:['какие они;','как они выглядят.']
 },
 use:[
  {words:['polite','rude','helpful','lazy','quiet','noisy'],phrases:['What is he/she like?','He/She is ...']},
  {words:['long hair','short hair','brown hair','blonde hair'],phrases:['What does he/she look like?','He/She has ...']}
 ]
})));
const l5=[];
l5.push(stage('Speaking',2,kit.speaking({
 id:'L5-M01',
 title:'Explain the unusual things',
 image:null,
 task:{text:'Ваш друг рассматривает ваши фотографии и замечает несколько необычных вещей. Он не знает, что это такое. Объясните ему, к какой категории относится каждая вещь.'},
 use:[{words:['food','drink','furniture','clothing','building','shop'],phrases:['It’s a kind of ...','It’s a type of ...']}]
})));
const meanings5=[['food','еда'],['drink','напиток'],['furniture','мебель'],['clothing','одежда'],['building','здание'],['shop','магазин']];
l5.push(stage('Word Pick',2.5,S('L5-M02','Соедините картинки и слова.',[pictureWords('L5-word-translation',5,words5,[2,5,1,4,0,3])])));
l5.push(stage('Listen & Repeat',2,repeat(5,'L5-M03',words5,["We need some food for the party.", "I’d like a drink, please.", "There is new furniture in the living room.", "This shop has clothing for men and women.", "The library is an old building.", "There is a small shop near my house."]),'Текст виден во время повторения. Аудиофайлы ожидаются; точные scripts закреплены в реестре.'));
const groups5=E('L5-M04','matching','Посмотрите на шесть групп картинок. Соедините каждую группу с подходящим словом.',{layout:'picture-word',items:words5.map((word,i)=>({id:String(i+1),text:String.fromCharCode(65+i),alt:'Группа '+String.fromCharCode(65+i),correctId:'o'+i,imagePending:true,imageMediaRef:'L5-I'+String(i+1).padStart(2,'0')})),options:[5,2,0,4,1,3].map(i=>({id:'o'+i,text:words5[i]}))});
const groupBriefs=["Изображения: muffin · rice · bread.\n\n", "Изображения: tea · juice · coffee.\n\n", "Изображения: sofa · wardrobe · armchair.\n\n", "Изображения: coat · jacket · hat.\n\n", "Изображения: house · hospital · library.\n\n", "Три отдельные сцены покупки:\n1. supermarket — полки с продуктами, корзина/тележка, касса, покупатель;\n2. магазин книг — стеллажи с книгами, ценники, касса, покупатель оплачивает книгу;\n3. магазин одежды — стойки/вешалки с одеждой, ценники, касса, покупатель выбирает или оплачивает вещь.\n\nДля сцен 2–3 не вводить новые английские названия магазинов. Эти авторские описания не показываются ученику."];
groups5.items.forEach((item,i)=>{media[5][item.imageMediaRef]={type:'image',src:null,brief:groupBriefs[i].trim()};});
l5.push(stage('Match the groups',3,groups5,"Изображения пока ожидаются. Авторские описания не показываются ученику.\n### Group A\nИзображения: muffin · rice · bread.\n\n### Group B\nИзображения: tea · juice · coffee.\n\n### Group C\nИзображения: sofa · wardrobe · armchair.\n\n### Group D\nИзображения: coat · jacket · hat.\n\n### Group E\nИзображения: house · hospital · library.\n\n### Group F\nТри отдельные сцены покупки:\n1. supermarket — полки с продуктами, корзина/тележка, касса, покупатель;\n2. магазин книг — стеллажи с книгами, ценники, касса, покупатель оплачивает книгу;\n3. магазин одежды — стойки/вешалки с одеждой, ценники, касса, покупатель выбирает или оплачивает вещь.\n\nДля сцен 2–3 не вводить новые английские названия магазинов. Эти авторские описания не показываются ученику.\n- Group E показывает именно здания как объекты.\n- Group F считывается как место покупки за счёт кассы, покупателя, товаров и ценников.\n- Не использовать одну фотографию supermarket как закрытый выбор shop vs building.\n- На самих изображениях не писать готовые английские названия target-категорий."));
l5.push(stage('Find the meaning',2,S('L5-M06','Read the examples. Choose the correct meaning.',[P('L5-kind-context','Read the examples.',[T('A muffin is a kind of food.\nTea is a type of drink.\nA sofa is a type of furniture.')]),C('L5-kind-meaning','Choose the correct meaning.',[['Что показывают a kind of / a type of в этих примерах?',['К какой общей категории относится предмет.','Что два предмета просто похожи внешне.'],0]])],{revealStops:[2]})));
l5.push(stage('Language focus',2,R('L5-kind-rule',"Если собеседник не знает, что это за предмет или слово, можно назвать более общую категорию.\n\nИспользуйте:\n\nIt’s a kind of + category.\n\nWhat is a muffin?  \n— It’s a kind of food.\n\nили:\n\nIt’s a type of + category.\n\nWhat is a sofa?  \n— It’s a type of furniture.\n\nВ этих моделях a стоит перед kind / type:\n\na kind of food  \na type of clothing  \na kind of building  \na type of shop\n\nНе говорим a furniture или a clothing.\n\nВ этом уроке kind of и type of выполняют одну функцию: помогают назвать категорию.  \nОба варианта подходят в свободном ответе.\n\nSort of и самостоятельная модель It’s like ... в этом уроке не изучаются.")));
l5.push(stage('Choose the explanation',2,C('L5-form-choice','Выберите правильный вариант.',[["What is a muffin?", ["It’s kind food.", "It’s a kind of food.", "It’s a food kind."], 1], ["What is a sofa?", ["It’s type of furniture.", "It’s a type of a furniture.", "It’s a type of furniture."], 2], ["Что показывают a kind of / a type of в этом уроке?", ["Общую категорию.", "Только внешнее сходство.", "Место предмета."], 0], ["What is a hospital?", ["It’s type of a building.", "It’s a type of building.", "It’s a type building."], 1]])));
l5.push(stage('Build explanations',3,W('L5-M07','Ответьте полным предложением.',[["What is a pancake?", ["It’s a kind of food.", "A pancake is a kind of food."], "food · kind"], ["What is tea?", ["It’s a type of drink.", "Tea is a type of drink."], "drink · type"], ["What is a sofa?", ["It’s a kind of furniture.", "A sofa is a kind of furniture."], "furniture · kind"], ["What is a jacket?", ["It’s a type of clothing.", "A jacket is a type of clothing."], "clothing · type"], ["What is a hospital?", ["It’s a kind of building.", "It’s a type of building."], "building"], ["What is a supermarket?", ["It’s a kind of shop.", "It’s a type of shop."], "shop"]]),'Принимаются полные варианты с названием предмета. Целевая модель ответа — It’s …; в последних двух пунктах подходят kind и type.'));
const chat5=[["Sam: What’s a wardrobe?", ["It’s a kind of furniture.", "It’s a type of furniture."]], ["Sam: Can I put my jacket in it?", ["Yes, you can.", "Yes."]], ["Sam: Thanks. And what’s a coat?", ["It’s a kind of clothing.", "It’s a type of clothing."]], ["Sam: Can I put it in the wardrobe?", ["Yes, you can.", "Yes."]]].map((row,i)=>W('L5-chat-'+(i+1),'Напишите ответ.',[row]));
l5.push(stage('Chat exchange',4,S('L5-M08','Ответьте другу в чате.',chat5,{requireCheckBeforeNext:true,instruction:'Каждая следующая реплика продолжает тот же разговор.'}),"Следующую реплику даёт преподаватель после понятного предыдущего ответа.\n\nЕсли категория выбрана неверно или ответ непонятен, сначала помочь ученику исправить его, затем продолжить чат. Не показывать следующую реплику так, будто любой свободный ответ автоматически принят."));
l5.push(stage('Final · Speaking',5,kit.speaking({
 id:'L5-M09',
 title:'Help your new colleague',
 image:null,
 task:{text:'В вашем офисе появился новый сотрудник. В первый день его удивляют некоторые вещи вокруг, и он спрашивает, что это такое. Объясните ему, к какой категории относится каждая вещь.'},
 use:[{words:['food','drink','furniture','clothing','building','shop'],phrases:['It’s a kind of ...','It’s a type of ...']}]
})));

// L5 homework remains unchanged; obsolete L4 drafts were removed with its rebuild.
l5.push(stage('Homework 1',0,W('L5-homework-1','Translate into English.',[['Что такое маффин?','What’s a muffin?'],['Это вид еды.',['It’s a kind of food.','It’s a type of food.']],['Что такое чай?','What’s tea?'],['Это вид напитка.',['It’s a type of drink.','It’s a kind of drink.']]],false,'Друг спрашивает о еде и напитках. Используйте оба способа объяснения.'),'Полные формы допустимы. Kind/type не противопоставляются.','self-study'));
l5.push(stage('Homework 2',0,W('L5-homework-2','Translate into English.',[['Что такое кресло?','What’s an armchair?'],['Это вид мебели.',['It’s a kind of furniture.','It’s a type of furniture.']],['Что такое пальто?','What’s a coat?'],['Это вид одежды.',['It’s a type of clothing.','It’s a kind of clothing.']]],false,'Друг спрашивает о вещах для дома.'),'Проверка по смыслу и форме. Образцы не единственные допустимые ответы.','self-study'));
function attach(value,slots){
 if(!value||typeof value!=='object')return;
 if(value.imageMediaRef){const slot=slots[value.imageMediaRef];if(slot?.src)Object.assign(value,{image:slot.src,imagePending:false});}
 if(value.mediaRef){const slot=slots[value.mediaRef];if(!slot)throw Error('Missing media '+value.mediaRef);Object.assign(value,{audioId:value.mediaRef},slot.src?{audio:slot.src,audioPending:false}:{audioPending:true});}
 if(value.exampleMediaRef){const slot=slots[value.exampleMediaRef];value.exampleAudioId=value.exampleMediaRef;if(slot.src)value.exampleAudio=slot.src;}
 Object.values(value).forEach(v=>{if(Array.isArray(v))v.forEach(x=>attach(x,slots));else if(v&&typeof v==='object')attach(v,slots);});
}
const lessons=[
 {id:'a1-2-w4-l4',words:words4,constructions:'What is he/she like? · What does he/she look like?',summary:'Узнаём и описываем качества человека и его внешность.',reserveMinutes:2,stages:l4},
 {id:'a1-2-w4-l5',words:words5,constructions:'It’s a kind of … · It’s a type of …',summary:'Объясняем предмет через общую категорию двумя способами и понимаем объяснения собеседника.',reserveMinutes:2.5,stages:l5}
];
for(const [i,lesson] of lessons.entries()){
 const slots=media[i+4],old=registry[lesson.id]||{};
 for(const [key,slot] of Object.entries(slots)){const existing=old[key];if(existing?.src&&existing.type===slot.type&&existing.script===slot.script&&existing.brief===slot.brief)slots[key]={...slot,...existing};}
 registry[lesson.id]={...old,...slots};
 Object.assign(lesson,{level:'A1.2',whale:4,grammar:'—',durationMinutes:30,plannedTeachingMinutes:30,contentVersion:'v7_FINAL',mediaStatus:'pending',showTeacherNotes:true,syncDisclosures:true});
 lesson.contentVersion=i===0?'approved-tasks-3-10-2026-10-03':'v7_FINAL+speaking-word-pick-2026-10-03';
 attach(lesson,slots);lesson.stages.forEach(s=>kit.validate(s.exercise));
 const at=window.SpaceWhaleContent.findIndex(l=>l.id===lesson.id);if(at<0)window.SpaceWhaleContent.push(lesson);else window.SpaceWhaleContent[at]=lesson;
}
})();
