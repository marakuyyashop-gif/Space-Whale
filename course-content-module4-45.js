(() => {
'use strict';
// October 1 corrected L4/L5 plans. Missing exercise items authored for this revision.
// Media scripts are ready; recordings remain explicitly pending.
const kit=window.SpaceWhaleExerciseKit, registry=window.SpaceWhaleLessonMedia;
const E=(id,kind,title,extra={})=>({version:1,id,kind,title,...extra});
const T=text=>({type:'text',text});
const D=(title,text,open=false)=>({type:'disclosure',title,text,open});
const roleText=(audience,text)=>({...T(text),audience});
const P=(id,title,blocks,instruction='')=>E(id,'presentation',title,{blocks,instruction});
const R=(id,text)=>E(id,'rule-page','Language focus',{blocks:[{type:'rule',text}]});
const C=(id,title,rows)=>E(id,'choice',title,{items:rows.map(([prompt,options,key],i)=>({id:String(i+1),prompt,options:options.map((text,j)=>({id:String(j),text})),correctId:String(key)}))});
const W=(id,title,rows,accepted=false,instruction='')=>E(id,'writing',title,{responseMode:accepted?'accepted':'open',revealPossibleAnswers:!accepted,instruction,items:rows.map(([prompt,answers],i)=>({id:String(i+1),prompt,[accepted?'acceptedAnswers':'possibleAnswers']:Array.isArray(answers)?answers:[answers]}))});
const M=(id,title,rows,order)=>E(id,'matching',title,{items:rows.map(([text],i)=>({id:String(i+1),text,correctId:'o'+i})),options:order.map(i=>({id:'o'+i,text:rows[i][1]}))});
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
 if(exercise.kind!=='presentation'||!exercise.blocks.some(b=>b.audience))return exercise;
 const blocks=exercise.blocks.filter(b=>!b.audience||b.audience===role);
 return {...exercise,blocks};
};
const words4=['polite','rude','helpful','lazy','quiet','noisy'];
const words5=['food','drink','furniture','clothing','building','shop'];
const phrases4='What is he like? / What is she like?\nWhat does he look like? / What does she look like?\nHe is … / She is …\nHe has … / She has …';
const phrases5='It’s a kind of …\nIt’s a type of …\nWhat is …?';
const l4=[];
l4.push(stage('Test Task',2,P('L4-M01','Ask and answer.',[
 T('Вы хотите познакомиться с новым соседом. Собеседник уже его знает. Узнайте, какой он в общении и как выглядит, чтобы узнать его при встрече. Затем поменяйтесь ролями и поговорите о соседке.'),
 roleText('teacher','Ваша карточка · сосед А\nМужчина; высокий; короткие прямые волосы. Вежливый, готов помочь: благодарит и предлагает помощь.'),
 roleText('student','Ваша карточка · соседка Б\nМолодая женщина; длинные прямые волосы; дружелюбная.'),
 D('Useful phrases',phrases4,true),T('Words: tall · young · short hair · long hair · straight hair · friendly\npolite — вежливый · helpful — готовый помочь')
 ]),'Сначала ученик задаёт два вопроса о вашем соседе. Затем спросите о соседке ученика. Это проба с открытой помощью; не отмечайте чтение модели как самостоятельную речь. Карточки раздельны в teacher/learner view.'));
const meanings4=[['polite','вежливый'],['rude','грубый, невежливый'],['helpful','готовый помочь'],['lazy','ленивый'],['quiet','тихий, немногословный'],['noisy','шумный']];
const words4Match=M('L4-word-translation','Match the words and translations.',meanings4,[4,2,0,5,3,1]);
l4.push(stage('Words · Matching',3,S('L4-M02','Match the words and translations.',[
 words4Match,P('L4-word-context','Read the examples.',[
 T('Polite: “Can you help me, please? Thank you.”\nRude: “Give me that! Don’t talk!”\nHelpful: “Can I help you with your bags?”\nLazy: «Он может убрать свою комнату, но постоянно откладывает это и просит других сделать за него».\nQuiet: «Она мало говорит и не шумит».\nNoisy: «Он часто громко разговаривает; соседи слышат его из своей квартиры».')
 ])],{requireCheckBeforeNext:true}),'Перевод устанавливает значение; примеры уточняют употребление. Lazy — не усталый или больной. Quiet — не обязательно застенчивый. Не выводите качества по лицу.'));
l4.push(stage('Listen & Repeat',2,repeat(4,'L4-M03',words4,[
 'My new neighbor is polite.','He is rude.','Our classmate is helpful.','He is lazy at home.','She is usually quiet.','Our neighbors are noisy.'
 ]),'Аудиофайлы пока не готовы. Видны точные слова и предложения будущих записей. Новые вопросы здесь не используются.'));
l4.push(stage('Words · Choose',3,C('L4-M04','Choose the answer.',[
 ['Who is polite?',['“Give me that!”','“Can you give me that, please?”'],1],
 ['Who is rude?',['“Don’t talk! Go away!”','“Sorry, can you help me?”'],0],
 ['Who is helpful?',['“Can I help you with your bags?”','“Can you help me with my bags?”'],0],
 ['Кто здесь lazy?',['Он устал после работы и сейчас отдыхает.','Он может убрать свою комнату, но каждый раз просит других сделать это за него.'],1],
 ['Who is quiet?',['Anna doesn’t talk a lot.','Anna talks a lot.'],0],
 ['Кто здесь noisy?',['Он читает у себя дома; соседи его не слышат.','Он каждый вечер громко поёт; соседи слышат его через стену.'],1]
 ]),'Каждое слово проверяется как цель отдельного пункта. Русский контекст в двух пунктах помогает не добавлять скрыто новую английскую лексику.'));
const examples4='— What is he like?\n— He is helpful. He often helps me.\n— What does he look like?\n— He is tall. He has short, straight hair.\n\n— What is she like?\n— She is quiet.\n— What does she look like?\n— She has long, curly hair and green eyes.';
l4.push(stage('Two questions · Match',2,S('L4-M07','Read and match.',[
 P('L4-question-examples','Read the conversations.',[T(examples4)]),
 M('L4-two-questions-match','Match the questions and their meanings.',[['What is he/she like?','Узнать о качествах и поведении'],['What does he/she look like?','Узнать о внешности']],[1,0])
 ],{revealStops:[2]}),'Сначала ученик читает готовые разговоры, затем выводит функции вопросов. После попытки откройте следующий этап — правило.'));
l4.push(stage('Language focus',2,R('L4-question-rule',
 'Чтобы узнать, какой человек в общении, спросите:\nWhat is he like? / What is she like?\nWhat is he like? — He is polite and helpful.\n\nЧтобы узнать о внешности, спросите:\nWhat does he look like? / What does she look like?\nWhat does she look like? — She is tall. She has curly hair.\n\nВ первом вопросе используется is, во втором — does + look. После does у look нет окончания -s. Like из вопроса повторять в ответе не нужно.\n\nЗнакомые модели ответа: be + adjective; have/has + noun. She is tall тоже описывает внешность: is в ответе не означает только характер. Фотография показывает внешность; о качествах нужны отдельные сведения.')));
l4.push(stage('Choose the question',1.5,C('L4-M08','Choose the question.',[
 ['Вы ищете мужчину у входа. Нужно понять, как его узнать.',['What is he like?','What does he look like?'],1],
 ['В группе новая девушка. Вы хотите узнать, какая она в общении.',['What is she like?','What does she look like?'],0],
 ['Подруга встречает вас на вокзале. Нужно узнать, как она выглядит.',['What is she like?','What does she look like?'],1],
 ['У вашего друга новый сосед. Вы спрашиваете о его качествах.',['What is he like?','What does he look like?'],0]
 ])));
l4.push(stage('Build questions and answers',3.5,W('L4-M10','Write the questions and answers.',[
 ['Мужчина / спросите о качествах',['What is he like?','What’s he like?']],
 ['Женщина / спросите о внешности','What does she look like?'],
 ['Женщина / спросите о качествах',['What is she like?','What’s she like?']],
 ['Мужчина / спросите о внешности','What does he look like?'],
 ['Сосед-мужчина / ответьте о качествах / helpful / polite',['He is helpful and polite.','He’s polite and helpful.']],
 ['Соседка / ответьте о внешности / long, curly hair / green eyes',['She has long, curly hair and green eyes.','She has green eyes and long, curly hair.']]
 ],false,'Составьте четыре вопроса и два ответа. Пишите полные реплики.'),'Полных моделей на этом экране нет. Проверка преподавателем допускает сокращения, иной порядок качеств и естественные варианты; образцы после попытки не являются единственными правильными строками.'));
const dialogue4='Anna: I have two new neighbors, Ben and Kate.\nTom: What is Ben like?\nAnna: He is polite and helpful. He often helps me with my bags.\nTom: What does he look like?\nAnna: He is tall. He has short, straight hair.\nTom: And what is Kate like?\nAnna: She is quiet and helpful. She helps me with my English.\nTom: What does she look like?\nAnna: She has long, curly hair and green eyes.\nTom: Can I meet them?\nAnna: Of course!';
const listeningQuestions4=W('L4-listening-details','Listen and write short answers.',[
 ['What is Ben like?',['Polite and helpful.','He is polite and helpful.']],
 ['What does Ben look like?',['Tall, with short, straight hair.','He is tall. He has short, straight hair.']],
 ['What is Kate like?',['Quiet and helpful.','She is quiet and helpful.']],
 ['What does Kate look like?',['Long, curly hair and green eyes.','She has long, curly hair and green eyes.']]
 ],false,'Anna tells Tom about two new neighbors. Read all four questions before listening.');
l4.push(stage('Listening',4,S('L4-M06','Listen and write.',[
 E('L4-listening-player','audio','Listen.',{mediaRef:addAudio(4,'L4-D01',dialogue4),audioPending:true}),listeningQuestions4
 ],{revealStops:[2],transcript:dialogue4,transcriptAfter:['L4-listening-details']}),'Запись ещё не готова. Для просмотра можно прочитать точный script вслух, не показывая ученику; это не проверка качества аудио. План — два прослушивания. Принимаются краткие ответы; качества и внешность обоих соседей должны соответствовать тексту.\n\nScript для преподавателя:\n'+dialogue4));
l4.push(stage('Final · Speaking',5,P('L4-M11','Meet your new neighbors.',[
 T('Узнайте у собеседника о двух новых соседях. Сначала сами спросите о качествах и внешности его соседа. Затем ответьте на вопросы о своей соседке. Не показывайте друг другу карточки.'),
 roleText('teacher','Ваша карточка · сосед В\nМолодой мужчина; длинные прямые волосы; голубые глаза. Вежливый и готовый помочь: говорит «пожалуйста» и «спасибо», помогает соседям с сумками.'),
 roleText('student','Ваша карточка · соседка Г\nВысокая женщина; короткие кудрявые волосы; карие глаза. Тихая и готовая помочь: мало говорит, помогает соседям с английским.'),
 D('Useful phrases',phrases4),D('Words','polite · helpful · quiet · young · tall · long hair · short hair · straight hair · curly hair · blue eyes · brown eyes')
 ]),'Раунд 1: ученик задаёт оба вопроса о вашем соседе В. Раунд 2: вы задаёте оба вопроса о соседке Г, ученик отвечает. Не смотрите на экран ученика. Опоры откройте по запросу. Различайте самостоятельную реплику и ответ с помощью. Запас урока: 2 минуты на повтор и уточнение; отдельного задания нет.'));

const l5=[];
l5.push(stage('Test Task',2,P('L5-M01','Explain the words.',[
 T('Друг учит английский и не понимает слова muffin, sofa и museum. Объясните каждое через общую категорию. Затем послушайте одно объяснение друга и выберите: muffin или sofa.'),
 D('Useful phrases',phrases5,true),T('Words: food — еда · furniture — мебель · building — здание')
 ]),'Спросите What’s a muffin? / What’s a sofa? / What’s a museum? Помогите начать ответ. Затем скажите It’s a type of furniture. Ожидается sofa. Видны обе модели; это первая проба с помощью.'));
const meanings5=[['food','еда'],['drink','напиток'],['furniture','мебель'],['clothing','одежда'],['building','здание'],['shop','магазин']];
l5.push(stage('Words · Matching',2.5,S('L5-M02','Match the words and translations.',[
 M('L5-word-translation','Match the words and translations.',meanings5,[2,4,0,5,1,3]),
 P('L5-word-examples','Read the examples.',[T('food: muffin · rice · bread\ndrink: tea · juice · coffee\nfurniture: sofa · wardrobe · armchair\nclothing: coat · jacket · hat\nbuilding: house · hospital · library\nshop: supermarket · книжный магазин · магазин одежды')])
 ],{requireCheckBeforeNext:true}),'Два вида магазинов пояснены по-русски, без введения новых английских названий. Магазин может находиться в здании; это не взаимоисключающие категории.'));
l5.push(stage('Listen & Repeat',2,repeat(5,'L5-M03',words5,[
 'We have some food.','I would like a drink, please.','There is some furniture in the office.','This clothing is new.','That building is old.','This shop is near my house.'
 ]),'Записи пока не готовы. Слова и точные предложения будущих записей видны. Kind/type в этом этапе не используются.'));
l5.push(stage('Match the groups',3,M('L5-M04','Match the groups and categories.',[
 ['muffin · rice · bread','food'],['tea · juice · coffee','drink'],['sofa · wardrobe · armchair','furniture'],['coat · jacket · hat','clothing'],['house · hospital · library','building'],['Виды магазинов: супермаркет · книжный магазин · магазин одежды','shop']
 ],[3,0,5,2,4,1]),'Группа shop явно обозначает виды магазинов. Не утверждайте, что supermarket не может быть building.'));
l5.push(stage('Find the meaning',2,S('L5-M06','Read and choose.',[
 P('L5-kind-context','Read the examples.',[T('A muffin is a kind of food.\nTea is a type of drink.\nA sofa is a type of furniture.')]),
 C('L5-kind-meaning','Choose the meaning.',[['Что делают выражения a kind of и a type of в этих примерах?',['Сообщают только о внешнем сходстве двух вещей.','Объясняют, к какой общей категории относится предмет.'],1]])
 ],{revealStops:[2]})));
l5.push(stage('Language focus',2,R('L5-kind-rule',
 'Если собеседник не знает предмет или слово, назовите более общую категорию. Для этого подходят обе модели:\n\nIt’s a kind of + название категории.\nWhat’s a muffin? — It’s a kind of food.\n\nIt’s a type of + название категории.\nWhat’s a sofa? — It’s a type of furniture.\n\nA стоит перед kind/type, а название категории — после of:\na kind of food · a type of clothing · a kind of building · a type of shop.\nНе добавляйте a перед furniture или clothing.\n\nОбе модели здесь называют категорию, а не внешнее сходство. В свободном ответе подходит любой из этих способов; один не является ошибочной заменой другого.')));
l5.push(stage('Choose the explanation',2,C('L5-form-choice','Choose the answer.',[
 ['What’s a sofa?',['It’s a kind of clothing.','It’s a kind of furniture.'],1],
 ['What’s tea?',['It’s a type of drink.','It’s a type of food.'],0],
 ['Выберите правильную форму.',['It’s kind of furniture.','It’s a kind of furniture.'],1],
 ['Выберите правильную форму.',['It’s a type of clothing.','It’s a type of a clothing.'],0]
 ]),'Каждый пункт имеет один ответ. Kind/type не конкурируют как правильный и неправильный синонимы.'));
l5.push(stage('Build explanations',3,W('L5-M07','Explain each word.',[
 ['pancake / food / kind',['It’s a kind of food.','A pancake is a kind of food.']],
 ['tea / drink / type',['It’s a type of drink.','Tea is a type of drink.']],
 ['sofa / furniture / type',['It’s a type of furniture.','A sofa is a type of furniture.']],
 ['jacket / clothing / kind',['It’s a kind of clothing.','A jacket is a kind of clothing.']],
 ['hospital / building',['It’s a kind of building.','It’s a type of building.']],
 ['supermarket / shop / объясните, что это за магазин',['It’s a type of shop.','It’s a kind of shop.']]
 ],false,'Друг спрашивает, что это. Напишите полные ответы. В первых четырёх используйте указанное kind или type; в последних двух выберите сами.'),'Работайте именно с репликами It’s …; полные ответы с названным предметом тоже допустимы. Последние два пункта — без готовой конструкции. Проверка преподавателем по смыслу; оба синонима принимаются в свободных пунктах.'));
const chat5=[
 W('L5-chat-1','Write a reply.',[['Friend: What’s a wardrobe?',['It’s a kind of furniture.','It’s a type of furniture.']]]),
 W('L5-chat-2','Write a reply.',[['Friend: Can I put my jacket in it?',['Yes, you can.','Yes, you can put your jacket in it.']]]),
 W('L5-chat-3','Write a reply.',[['Friend: Thank you. And what’s a coat?',['It’s a type of clothing.','It’s a kind of clothing.']]]),
 W('L5-chat-4','Write a reply.',[['Friend: Can I put it in the wardrobe?',['Yes, you can.','Yes, you can put it in the wardrobe.']]])
];
l5.push(stage('Chat exchange',4,S('L5-M08','Help your friend in a chat.',chat5,{requireCheckBeforeNext:true,instruction:'Друг учит английский и выбирает вещи для новой комнаты. Напишите ответ на каждое сообщение. Следующее сообщение открывает преподаватель.'}),
 'Вы ведёте друга. После каждого ответа проверьте смысл и уточните непонятный ответ, затем откройте следующий ход стрелкой. OK сохраняет ответ, но не отправляет следующую реплику автоматически. Образцы скрыты до попытки. Kind/type взаимозаменяемы.'));
l5.push(stage('Final · Speaking',5,P('L5-M09','Explain and understand.',[
 T('Продолжите помогать другу с английскими словами. Объясните каждое слово через общую категорию. Используйте оба способа объяснения в разных ответах.'),
 T('waffle · coffee · armchair · hat · house · supermarket'),
 D('Useful phrases',phrases5),D('Words','drink · building · food · shop · clothing · furniture'),
 T('Теперь послушайте два объяснения друга и назовите подходящий предмет:\n1. wardrobe / jacket\n2. tea / muffin')
 ]),'Начните без полных моделей. После первого ответа попросите другой изученный способ для следующего предмета. Supermarket объясняется как вид магазина, но building не объявляется универсально неверным. Затем скажите 1. It’s a type of furniture. → wardrobe. 2. It’s a kind of drink. → tea. Не показывайте ключи заранее. Запас урока: 2,5 минуты; отдельного задания нет.'));

// Previously prepared homework stays separate from the 30-minute class flow.
l4.push(stage('Homework 1',0,W('L4-homework-1','Translate into English.',[['Какой он по характеру?','What is he like?'],['Он вежливый и отзывчивый.','He’s polite and helpful.'],['Как он выглядит?','What does he look like?'],['Он высокий, и у него короткие волосы.','He’s tall and has short hair.']],false,'Друг спрашивает о Бене.'),'Проверка по смыслу и конструкции. Полные формы и естественное разбиение последней реплики на два предложения допустимы.','self-study'));
l4.push(stage('Homework 2',0,W('L4-homework-2','Translate into English.',[['Как она выглядит?','What does she look like?'],['У неё длинные кудрявые волосы.','She has long curly hair.'],['Какая она в общении?','What is she like?'],['Она тихая и отзывчивая.','She’s quiet and helpful.']],false,'Вы спрашиваете о новой соседке.'),'Образцы — не единственно допустимые строки.','self-study'));
l5.push(stage('Homework 1',0,W('L5-homework-1','Translate into English.',[['Что такое маффин?','What’s a muffin?'],['Это вид еды.',['It’s a kind of food.','It’s a type of food.']],['Что такое чай?','What’s tea?'],['Это вид напитка.',['It’s a type of drink.','It’s a kind of drink.']]],false,'Друг спрашивает о еде и напитках. Используйте оба способа объяснения.'),'Полные формы допустимы. Kind/type не противопоставляются.','self-study'));
l5.push(stage('Homework 2',0,W('L5-homework-2','Translate into English.',[['Что такое кресло?','What’s an armchair?'],['Это вид мебели.',['It’s a kind of furniture.','It’s a type of furniture.']],['Что такое пальто?','What’s a coat?'],['Это вид одежды.',['It’s a type of clothing.','It’s a kind of clothing.']]],false,'Друг спрашивает о вещах для дома.'),'Проверка по смыслу и форме. Образцы не единственные допустимые ответы.','self-study'));
function attach(value,slots){
 if(!value||typeof value!=='object')return;
 if(value.mediaRef){const slot=slots[value.mediaRef];if(!slot)throw Error('Missing media '+value.mediaRef);Object.assign(value,{audioId:value.mediaRef},slot.src?{audio:slot.src,audioPending:false}:{audioPending:true});}
 if(value.exampleMediaRef){const slot=slots[value.exampleMediaRef];value.exampleAudioId=value.exampleMediaRef;if(slot.src)value.exampleAudio=slot.src;}
 Object.values(value).forEach(v=>{if(Array.isArray(v))v.forEach(x=>attach(x,slots));else if(v&&typeof v==='object')attach(v,slots);});
}
const lessons=[
 {id:'a1-2-w4-l4',title:'Сосед',words:words4,constructions:'What is he/she like? · What does he/she look like?',summary:'Узнаём и описываем качества человека и его внешность.',reserveMinutes:2,stages:l4},
 {id:'a1-2-w4-l5',title:'Категории',words:words5,constructions:'It’s a kind of … · It’s a type of …',summary:'Объясняем предмет через общую категорию двумя способами и понимаем объяснения собеседника.',reserveMinutes:2.5,stages:l5}
];
for(const [i,lesson] of lessons.entries()){
 const slots=media[i+4],old=registry[lesson.id]||{};
 for(const [key,slot] of Object.entries(slots)){const existing=old[key];if(existing?.src&&existing.type===slot.type&&existing.script===slot.script)slots[key]={...slot,...existing};}
 registry[lesson.id]={...old,...slots};
 Object.assign(lesson,{level:'A1.2',whale:4,grammar:'—',durationMinutes:30,plannedTeachingMinutes:30,contentVersion:'2026-10-01-v5',mediaStatus:'pending',showTeacherNotes:true,syncDisclosures:true});
 attach(lesson,slots);lesson.stages.forEach(s=>kit.validate(s.exercise));
 const at=window.SpaceWhaleContent.findIndex(l=>l.id===lesson.id);if(at<0)window.SpaceWhaleContent.push(lesson);else window.SpaceWhaleContent[at]=lesson;
}
})();
