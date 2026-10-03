(() => {
'use strict';
// Base content: lesson-sources/a12-m4-l4-l5-v7-final.md.
// L4/L5 opening and final Speaking use docs/SPEAKING_TEMPLATE.md (approved 2026-10-03).
// Existing IDs retained; remaining v7 scripts and exercises are unchanged.
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
  {words:['tall','short','slim','fat'],phrases:['What does he/she look like?','He/She is ...']}
 ]
})));
const meanings4=[['polite','вежливый'],['rude','грубый'],['helpful','готовый помочь'],['lazy','ленивый'],['quiet','тихий'],['noisy','шумный']];
l4.push(stage('Word Pick',3,S('L4-M02','Соедините картинки и слова.',[pictureWords('L4-word-translation',4,words4,[3,5,0,4,1,2])])));
l4.push(stage('Listen & Repeat',2,repeat(4,'L4-M03',words4,["Our new neighbor is polite and friendly.", "He is rude to people at work.", "My friend is helpful at home.", "He is lazy and doesn’t help at home.", "Our neighbor is quiet in the evening.", "Our neighbors are noisy in the evening."]),'Текст виден во время повторения. Аудиофайлы ожидаются; точные scripts закреплены в реестре.'));
l4.push(stage('Words · Choose',3,C('L4-M04','Выберите вариант, который подходит слову.',[["polite", ["Give me that.", "Excuse me. Can you help me, please? Thank you."], 1], ["rude", ["Move. I want this chair.", "Can I sit here, please?"], 0], ["helpful", ["I can help you.", "I don’t want to help."], 0], ["lazy", ["I help at home every day.", "I never help at home. I can help, but I don’t want to."], 1], ["quiet", ["He talks a lot.", "He doesn’t talk much."], 1], ["noisy", ["They speak very loudly.", "They don’t talk much."], 0]])));
const examples4="— What is he like?  \n— He is helpful. He helps me at home.\n\n— What does he look like?  \n— He is tall. He has short straight hair.\n\n— What is she like?  \n— She is quiet.\n\n— What does she look like?  \n— She has long curly hair and green eyes.";
l4.push(stage('Two questions · Match',2,S('L4-M07','Прочитайте примеры. Затем соедините вопросы с их значениями.',[P('L4-question-examples','Примеры.',[T(examples4)]),M('L4-two-questions-match','Соедините вопросы и значения.',[['What is he/she like?','узнать о качествах / поведении человека'],['What does he/she look like?','узнать о внешности']],[1,0])],{revealStops:[2]})));
l4.push(stage('Language focus',2,R('L4-question-rule',"Чтобы узнать, какой человек в общении или по своим качествам, используйте:\n\nWhat is he like?  \nWhat is she like?\n\nWhat is he like?  \n— He is polite and helpful.\n\nЧтобы узнать именно о внешности человека, используйте:\n\nWhat does he look like?  \nWhat does she look like?\n\nWhat does she look like?  \n— She is tall. She has curly hair.\n\nВ первом вопросе используется is.  \nВо втором вопросе используется does + look. После does у look нет окончания -s.\n\nВ ответе используйте знакомые модели:\n\nbe + adjective  \nShe is tall. / He is helpful.\n\nhave/has + noun  \nShe has curly hair. / He has blue eyes.\n\nВажно: is в ответе не означает автоматически «характер».  \nShe is tall. — это описание внешности.")));
l4.push(stage('Choose the question',1.5,C('L4-M08','Выберите подходящий вопрос.',[["Вы хотите узнать, какой новый сосед в общении.", ["What does he look like?", "What is he like?"], 1], ["Вы ждёте новую коллегу у входа и хотите узнать её внешность.", ["What does she look like?", "What is she like?"], 0], ["She is quiet and helpful.", ["What is she like?", "What does she look like?"], 0], ["He has short curly hair.", ["What is he like?", "What does he look like?"], 1]])));
l4.push(stage('Build questions and answers',3.5,W('L4-M10','Напишите вопрос или ответ.',[["Спросите, какой мужчина в общении.", ["What is he like?", "What’s he like?"]], ["Спросите о внешности женщины.", "What does she look like?"], ["Спросите, какая женщина в общении.", ["What is she like?", "What’s she like?"]], ["Спросите о внешности мужчины.", "What does he look like?"], ["Ответьте о мужчине.\nhelpful · polite", ["He is helpful and polite.", "He is polite and helpful."]], ["Ответьте о женщине.\nlong curly hair · green eyes", ["She has long curly hair and green eyes.", "She has green eyes and long curly hair."]]]), 'Полные вопросительные образцы из Rule не остаются открытой подсказкой. Помощь — после затруднения. Принимаются естественные варианты ответа.'));
const dialogue4="Nora: Do you know our new neighbors?  \nBen: Yes. The man is Daniel.  \nNora: What is he like?  \nBen: He’s polite, quiet, and very helpful.  \nNora: What does he look like?  \nBen: He’s tall. He has short straight hair and blue eyes.  \nNora: And the woman?  \nBen: Her name is Anna.  \nNora: What is she like?  \nBen: She’s friendly, but a little noisy.  \nNora: What does she look like?  \nBen: She’s young. She has long curly hair and brown eyes.";
const listeningQuestions4=W('L4-listening-details','Listen and answer the questions.',[["What is Daniel like?", ["Polite, quiet and helpful.", "He is polite, quiet and helpful."]], ["What does Daniel look like?", ["Tall; short straight hair; blue eyes.", "He is tall and has short straight hair and blue eyes."]], ["What is Anna like?", ["Friendly and a little noisy.", "She is friendly and a little noisy."]], ["What does Anna look like?", ["Young; long curly hair; brown eyes.", "She is young and has long curly hair and brown eyes."]]],false,'1. Послушайте разговор о Daniel и Anna. Можно начать отвечать.\n2. Послушайте ещё раз, дополните и проверьте четыре ответа.');
l4.push(stage('Listening',4,S('L4-M06','Listen and answer the questions.',[E('L4-listening-player','audio','Listen.',{mediaRef:addAudio(4,'L4-D01',dialogue4),audioPending:true}),listeningQuestions4],{revealStops:[2],transcript:dialogue4,transcriptAfter:['L4-listening-details']}),'Два прослушивания; проверка после второго. Transcript скрыт до самостоятельной работы. Ориентир записи: 35–40 секунд. Запись ожидается.\n\nScript:\n'+dialogue4));
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
  {words:['tall','short','slim','fat'],phrases:['What does he/she look like?','He/She is ...']}
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

// Previously prepared homework stays separate from the 30-minute class flow.
l4.push(stage('Homework 1',0,W('L4-homework-1','Translate into English.',[['Какой он по характеру?','What is he like?'],['Он вежливый и отзывчивый.','He’s polite and helpful.'],['Как он выглядит?','What does he look like?'],['Он высокий, и у него короткие волосы.','He’s tall and has short hair.']],false,'Друг спрашивает о Бене.'),'Проверка по смыслу и конструкции. Полные формы и естественное разбиение последней реплики на два предложения допустимы.','self-study'));
l4.push(stage('Homework 2',0,W('L4-homework-2','Translate into English.',[['Как она выглядит?','What does she look like?'],['У неё длинные кудрявые волосы.','She has long curly hair.'],['Какая она в общении?','What is she like?'],['Она тихая и отзывчивая.','She’s quiet and helpful.']],false,'Вы спрашиваете о новой соседке.'),'Образцы — не единственно допустимые строки.','self-study'));
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
 lesson.contentVersion='v7_FINAL+speaking-word-pick-2026-10-03';
 attach(lesson,slots);lesson.stages.forEach(s=>kit.validate(s.exercise));
 const at=window.SpaceWhaleContent.findIndex(l=>l.id===lesson.id);if(at<0)window.SpaceWhaleContent.push(lesson);else window.SpaceWhaleContent[at]=lesson;
}
})();
