(() => {
'use strict';
const kit=window.SpaceWhaleExerciseKit;
const registry=window.SpaceWhaleLessonMedia=window.SpaceWhaleLessonMedia||{};
const courseAudioBase='https://xpeywyonbapnvtjnwawi.supabase.co/storage/v1/object/public/course-audio';
const lesson3Audio=courseAudioBase+'/a1-2/w4/l3/listen-repeat';
const words3=['scarf','belt','gloves','cap','tie','sunglasses'];
const words4=['polite','rude','helpful','lazy','quiet','noisy'];
const examples3=['My scarf is on the chair.','Do you have a belt for these pants?','I need my gloves. It’s cold.','Can you put my cap in the backpack, please?','My brother needs a tie for work.','Where are my sunglasses? I need them today.'];
const examples4=['Our new neighbor is polite.','That’s rude. Please don’t say that.','My colleague is helpful. She often helps me.','I’m sometimes lazy on Sundays.','My sister is quiet. She doesn’t talk much.','Our neighbors are noisy at night.'];
// Stable author media IDs. Lesson 3 audio is stored in Supabase; Lesson 4 remains pending.
const media={3:{},4:{}};
for(const [n,words,examples] of [[3,words3,examples3],[4,words4,examples4]]){
 for(let i=0;i<6;i++){
  const k=String(i+1).padStart(2,'0');
  media[n]['L'+n+'_W'+k]={type:'audio',src:n===3?(k==='04'?lesson3Audio+'/L3_W04_r2.mp3?v=20260927-ready':k==='05'?lesson3Audio+'/L3_W05_tie-from-sentence-v2.wav?v=20260927-ready':lesson3Audio+'/L3_W'+k+'.mp3'):null,script:words[i]};
  media[n]['L'+n+'_E'+k]={type:'audio',src:n===3?lesson3Audio+'/L3_E'+k+'.mp3':null,script:examples[i]};
 }
 media[n]['L'+n+'_DIALOGUE']={type:'audio',src:n===3?courseAudioBase+'/dialogues/a1-2-w4-l3-listening-s090.mp3?v=20260927-100310':null,script:null,transcriptId:'L'+n+'_DIALOGUE_TEXT'};
 media[n]['L'+n+'_DIALOGUE_TEXT']={type:'text',text:null};
}
media[3].L3_DIALOGUE.script="Nina: I need a scarf for my sister.\nLeo: Which one do you like?\nNina: This one. What do you think?\nLeo: I think it looks good. How much is it?\nNina: Twenty euros.\nLeo: Why do you like it?\nNina: Because it looks warm. My sister walks to work, and it’s cold in the morning.\nLeo: Does she need gloves too?\nNina: No, she has some.";
media[3].L3_DIALOGUE_TEXT.text=media[3].L3_DIALOGUE.script;
const mediaRoot='assets/lesson-media/a1-2/module-4/';
const accessorySizes=[[482,486],[494,275],[416,480],[501,371],[311,488],[522,249]];
words3.forEach((word,i)=>{media[3]['L3_IMG_'+String(i+1).padStart(2,'0')]={type:'image',src:mediaRoot+'lesson-3/media/'+word+'-cutout.webp',width:accessorySizes[i][0],height:accessorySizes[i][1],alt:'Picture '+(i+1),target:word};});
media[3].L3_SPEAKING={type:'image',src:mediaRoot+'lesson-3/media/speaking-accessories.webp',width:1448,height:1086,alt:'A scarf, belt, gloves, cap, tie and sunglasses'};
media[4].L4_PEOPLE={type:'image',src:mediaRoot+'lesson-4/media/people-abc.webp',width:1020,height:388,alt:'Person A, Person B and Person C',sourceSheet:mediaRoot+'lesson-4-people.png',notes:'A: Rosa, original person 1; B: Ella, original person 3; C: Nora, original person 2, long curly hair and green eyes. No personality inferred from appearance.'};
media[4].L4_SPEAKING={type:'image',src:mediaRoot+'lesson-4/media/speaking-ab.webp',width:680,height:388,alt:'Person A and Person B',sourceSheet:mediaRoot+'lesson-4-people.png'};
// Authoring constraint for the pending recording/transcript, never student text.
for(const ref of ['L4_DIALOGUE','L4_DIALOGUE_TEXT'])media[4][ref].requiredNoraLine='She has long, curly hair and green eyes.';
for(const key of ['PERSONALITY','APPEARANCE']){media[4]['L4_Q_'+key]={type:'audio',src:null,script:null,derivedFrom:'L4_DIALOGUE'};media[4]['L4_Q_'+key+'_TEXT']={type:'text',text:null};}
for(const n of [3,4]){const id='a1-2-w4-l'+n;for(const [key,value] of Object.entries(registry[id]||{}))media[n][key]={...media[n][key],...value};registry[id]=media[n];}
const E=(id,kind,title,extra={})=>({version:1,id,kind,title,...extra});
const text=value=>({type:'text',text:value});
const picture=id=>({type:'image',mediaRef:id});
const P=(id,title,body,image,phrases,instruction)=>E(id,'presentation',title,{...(instruction?{instruction}:{}),blocks:[...(image?[picture(image)]:[]),...(body?[text(body)]:[]),...(phrases?[{type:'disclosure',title:'Useful phrases',open:true,text:phrases}]:[])]});
const A=(id,ref,title)=>E(id,'audio',title,{mediaRef:ref});
const S=(id,title,children,extra={})=>E(id,'stage',title,{exercises:children.map(exercise=>({id:exercise.id,exercise:exercise.kind==='rule-page'&&exercise.blocks.every(b=>b.type==='rule')?{...exercise,title}:exercise})),...extra});
const C=(id,title,items)=>E(id,'choice',title,{items});
const item=(id,prompt,options,correctId,feedbackText,feedbackHighlights=[])=>({id,prompt,options:options.map((text,i)=>({id:String.fromCharCode(65+i),text})),correctId,...(feedbackText?{feedbackText,feedbackHighlights}:{})});
const gap=(id,before,options,answer,after='',mediaRef)=>({id,...(mediaRef?{mediaRef}:{}),segments:[before,{id:id+'-gap',options,answers:[answer]},after]});
const G=(id,title,items,extra={})=>E(id,'gaps',title,{inputMode:'select',items,...extra});
const W=(id,title,items,extra={})=>E(id,'writing',title,{responseMode:'open',revealPossibleAnswers:true,items,...extra});
const R=(id,title,body,highlights)=>E(id,'rule-page',title,{blocks:[{type:'rule',title,text:body,highlights}]});
const O=(id,title,tokens,correct)=>E(id,'order',title,{sentenceCase:true,tokens:tokens.map((text,i)=>({id:String(i+1),text})),correctOrder:correct.map(t=>String(tokens.indexOf(t)+1))});
const step=(menu,minutes,exercise)=>({menu,navigationTitle:menu,section:'tasks',guide:{time:minutes+' min'},exercise});
const repeat=(n,words,examples)=>E('L'+n+'-M03','audio','Listen and repeat.',{layout:'listen-repeat',audioPending:true,items:words.map((word,i)=>{const k=String(i+1).padStart(2,'0');return {id:'L'+n+'_W'+k,text:word,mediaRef:'L'+n+'_W'+k,example:examples[i],exampleMediaRef:'L'+n+'_E'+k};})});
const transcript3=id=>E(id,'presentation','Transcript',{blocks:[{type:'disclosure',title:'Transcript',text:media[3].L3_DIALOGUE_TEXT.text}]});
const s3=[];
const opening3=P('L3-M01','Choose an item and talk about it.','Which item do you like?\nWhy do you like it?\nWhat do you think?','L3_SPEAKING','I like …\nIt looks … / They look …\nI think …\n… because …','Use the phrases below to help you.');
opening3.blocks.push(text('Теперь спросите преподавателя, какие предметы ему нравятся и почему.'),{type:'disclosure',title:'Useful phrases',open:true,text:'Which items do you like?\nWhy do you like them?'});
s3.push(step('Opening Speaking',1,opening3));
s3.push(step('Words',2.5,E('L3-M02','matching','Match the pictures with the words.',{layout:'picture-word',items:words3.map((word,i)=>({id:'L3_IMG_'+String(i+1).padStart(2,'0'),mediaRef:'L3_IMG_'+String(i+1).padStart(2,'0'),text:'Picture '+(i+1),correctId:word})),options:['sunglasses','tie','scarf','cap','gloves','belt'].map(text=>({id:text,text}))})));
s3.push(step('Pronunciation',2,repeat(3,words3,examples3)));
s3.push(step('Word practice',2,G('L3-M04','Choose the correct word.',[
 gap('1','I need my ',['gloves','tie','belt'],'gloves','. It’s cold today.','L3_IMG_03'),gap('2','Can you put this ',['cap','belt','scarf'],'scarf',' in my backpack?','L3_IMG_01'),gap('3','My brother needs a ',['tie','belt','scarf'],'tie',' for work.','L3_IMG_05'),gap('4','Do you have a ',['tie','belt','cap'],'belt',' for these pants?','L3_IMG_02')],{layout:'picture-rows',instruction:'Use the pictures.'})));
s3.push(step('Word recall',1.5,W('L3-M05','Write the words.',[
 {id:'1',prompt:'Picture 1',mediaRef:'L3_IMG_04',acceptedAnswers:['cap','a cap']},{id:'2',prompt:'Picture 2',mediaRef:'L3_IMG_06',acceptedAnswers:['sunglasses','a pair of sunglasses']},{id:'3',prompt:'Picture 3',mediaRef:'L3_IMG_02',acceptedAnswers:['belt','a belt']}],{responseMode:'accepted',layout:'picture-rows',instruction:'Name each item in the picture.'})));
let title='Listen and choose the correct answers.';
s3.push(step('Listening',3,S('L3-M06',title,[A('L3-M06-audio','L3_DIALOGUE',title),{...transcript3('L3-M06-transcript'),title},C('L3-M06-Q1',title,[item('1','The scarf is for …',['Leo.','Nina’s sister.','Nina.'],'B','The scarf is for Nina’s sister.',['Nina’s sister'])]),C('L3-M06-Q2',title,[item('2','How much is the scarf?',['Thirty euros.','Fifty euros.','Twenty euros.'],'C','The scarf is twenty euros.',['twenty euros'])])],{instruction:'Nina and Leo are in a clothes shop.',progressive:true,revealStops:[3,4],requireCheckBeforeNext:true})));
title='Match the sentences with their meanings.';
s3.push(step('Opinion and reason',4,S('L3-M07',title,[E('L3-M07-meanings','matching',title,{
 items:[{id:'1',text:'I think it looks good.',correctId:'C'},{id:'2',text:'What do you think?',correctId:'B'},{id:'3',text:'I like this scarf because it looks warm.',correctId:'A'}],
 options:[{id:'A',text:'Мне нравится этот шарф, потому что он выглядит тёплым.'},{id:'B',text:'Что вы думаете?'},{id:'C',text:'Мне кажется, это хорошо выглядит.'}]
}),R('L3-M07-rule','Как высказать мнение и объяснить причину',"Чтобы высказать своё мнение, используйте I think + предложение: I think these gloves look good — «Мне кажется, эти перчатки хорошо выглядят». После I think вы сообщаете свою мысль обычным предложением.\n\nСпросить мнение собеседника можно так: What do you think? — «Что вы думаете?» Например, в ответ можно сказать: I think it looks good.\n\nЕсли нужно объяснить выбор, добавьте because + предложение с причиной: I want this scarf because it’s warm — «Я хочу этот шарф, потому что он тёплый». В разговоре ответ на вопрос о причине может начинаться с because: Because it’s warm.",
['I think + предложение','I think these gloves look good','I think','What do you think?','I think it looks good.','because + предложение с причиной','I want this scarf because it’s warm','because','Because it’s warm.']),W('L3-M07-writing','Write complete sentences.',[
 {id:'1',prompt:'want / gloves / because / cold',possibleAnswers:['I want these gloves because it’s cold today.']},
 {id:'2',prompt:'not / need / belt / have / at home',possibleAnswers:['I don’t need this belt because I have a belt at home.']},
 {id:'3',prompt:'I think / sunglasses / look good',possibleAnswers:['I think these sunglasses look good.']}
],{instruction:'Use the prompts.'})],{progressive:true,requireCheckBeforeNext:true})));
title='Choose the question for each answer.';
s3.push(step('Questions',4,S('L3-M08',title,[C('L3-M08-question-meaning',title,[
 item('1','“This cap.”',['Which cap do you want?','Why do you want this cap?'],'A'),
 item('2','“Because it’s cold.”',['Which scarf do you need?','Why do you need a scarf?'],'B'),
 item('3','“I think it looks good.”',['How much is it?','What do you think?'],'B')
]),R('L3-M08-explanation','Как спросить о выборе и причине',"Когда перед вами несколько вариантов, which помогает спросить, какой из них выбирает человек: Which cap do you like? Если уже понятно, о какой вещи речь, можно сказать Which one do you like? Здесь one заменяет название одного предмета; после one повторять cap не нужно.\n\nО причине спрашиваем с why: Why do you like it? — «Почему вам это нравится?» Ответ объясняет причину: Because it looks good.\n\nПорядок вопроса знаком по Present Simple: Which/Why + do/does + подлежащее + глагол. Название предмета после which относится к вопросительной части: Which cap do you want? С he/she/it используем does, а основной глагол остаётся без -s: Why does she like it?\n\nЕсли говорим о нескольких предметах, называем их прямо: Which gloves do you like? В дальнейшем заменяем их на they/them: They look warm. Why do you like them?",
['which','Which cap do you like?','Which one do you like?','one','cap','why','Why do you like it?','Because it looks good.','Which/Why + do/does + подлежащее + глагол','Which cap do you want?','he/she/it','does','-s','Why does she like it?','Which gloves do you like?','they/them','They look warm. Why do you like them?']),
 O('L3-M08-Q1','Put the words in order.',['want','he','which cap','does','?'],['which cap','does','he','want','?']),
 O('L3-M08-Q2','Put the words in order.',['these gloves','you','why','like','do','?'],['why','do','you','like','these gloves','?']),
 O('L3-M08-scarf-question','Put the words in order.',['need','she','a scarf','why','does','?'],['why','does','she','need','a scarf','?'])
],{progressive:true,requireCheckBeforeNext:true})));
title='Listen again and choose the correct answers.';
s3.push(step('Listen again',2,S('L3-M09',title,[A('L3-M09-audio','L3_DIALOGUE',title),{...transcript3('L3-M09-transcript'),title},C('L3-M09-questions',title,[item('1','Why does Nina like the scarf?',['Because her sister likes it.','Because Leo wants it.','Because it looks warm.'],'C','Nina likes the scarf because it looks warm.',['because it looks warm']),item('2','Does Nina’s sister need gloves too?',['No. She has some.','Yes. She doesn’t have any.','Yes. Her gloves are old.'],'A','No. She has some.',['She has some.'])])],{layout:'grouped'})));
s3.push(step('Writing',2.5,W('L3-M10','Write complete sentences and a question.',[
 {id:'1',prompt:'like / scarf / because / warm',possibleAnswers:['I like this scarf because it’s warm.']},{id:'2',prompt:'which / cap / want',possibleAnswers:['Which cap do you want?','Which one do you want?']},{id:'3',prompt:'I think / gloves / look good',possibleAnswers:['I think these gloves look good.']}],{instruction:'Use the prompts.'})));
s3.push(step('Final Speaking',4.5,P('L3-M11','Choose two things together.','Your friend walks to work. It is cold in the morning.\nChoose two things for your friend.\n\nWhich two things do you want for your friend?\nWhy do you want them?\nWhat do you think?','L3_SPEAKING','I think …\nI like … because …\nIt looks … / They look …\nOur friend needs …','Ask and answer the questions. Then change roles.')));
const s4=[];
s4.push(step('Opening Speaking',2,P('L4-M01','Tell your partner about someone you know.','Who is this person?\nWhat does he or she look like?\nWhat is he or she like?',null,'He/She is …\nHe/She has …\nHe/She often …','Choose a friend, a colleague or a family member.')));
s4.push(step('Words',2.5,E('L4-M02','matching','Match the words with their meanings.',{items:words4.map((text,i)=>({id:String(i+1),text,correctId:['C','E','D','A','F','B'][i]})),options:['ленивый','шумный','вежливый','готовый помочь','грубый, невежливый','тихий, немногословный'].map((text,i)=>({id:String.fromCharCode(65+i),text}))})));
s4.push(step('Pronunciation',2,repeat(4,words4,examples4)));
s4.push(step('Word practice',2.5,G('L4-M04','Choose the word that fits each situation.',[
 gap('1','The neighbors play music loudly at night. I can hear it in my bedroom. They are ',['quiet','noisy'],'noisy','.'),gap('2','It’s my first day at work. Eva shows me the office and answers my questions. She is ',['lazy','helpful'],'helpful','.'),gap('3','“Give me that! Now!” Ben never says “please”. That’s ',['rude','polite'],'rude','.'),gap('4','“Can you help me, please?” “Thank you!” This person is ',['polite','rude'],'polite','.')])));
s4.push(step('Word recall',1.5,W('L4-M05','Write one word from today’s lesson.',[
 {id:'1',prompt:'Dan isn’t tired, but he never wants to do any work.\nDan is …',acceptedAnswers:['lazy']},{id:'2',prompt:'Ella listens to us. She doesn’t talk much.\nElla is …',acceptedAnswers:['quiet']},{id:'3',prompt:'Our new colleague often helps us. We can ask her for help.\nShe is …',acceptedAnswers:['helpful']}],{responseMode:'accepted'})));
title='Listen and find Nora.';
s4.push(step('Listening',3,S('L4-M06',title,[A('L4-M06-audio','L4_DIALOGUE',title),P('L4-M06-picture',title,null,'L4_PEOPLE'),C('L4-M06-Q1',title,[item('1','Which person is Nora?',['Person A.','Person B.','Person C.'],'C','Person C. Nora has long, curly hair and green eyes.',['Person C','long, curly hair and green eyes'])]),C('L4-M06-Q2',title,[item('2','What do Sam and Nora do on Saturdays?',['They go shopping.','They do yoga.','They play chess.'],'B','They do yoga on Saturdays.',['do yoga'])])],{instruction:'Eva and Sam are talking about a new classmate.',progressive:true,revealStops:[3,4],requireCheckBeforeNext:true,transcriptRef:'L4_DIALOGUE_TEXT',transcriptAfterRefs:['L4-M06-Q1','L4-M06-Q2']})));
title='Read the examples and sort the descriptions.';
s4.push(step('Language focus',3.5,S('L4-M07',title,[P('L4-M07-examples',title,'What’s Nora like? — She’s quiet, but she’s helpful.\nWhat does she look like? — She has long, curly hair and green eyes.'),R('L4-M07-rule','Спрашиваем о человеке',
'Когда вы хотите узнать, какой человек в общении, спросите: What is she like? или What is he like? Например: What’s your new colleague like? — She’s polite and helpful. В таком разговоре ответ описывает качества или поведение, а не цвет волос.\n\nЧтобы спросить именно о внешности, используйте What does she look like? или What does he look like? Ответ можно построить знакомыми способами: She’s tall или She has long, curly hair. Хотя вопрос заканчивается на like, повторять like в ответе не нужно.\n\nОбратите внимание на разные вопросы:\nWhat is she like? — здесь вопрос строится с is.\nWhat does she look like? — здесь используются does и look без окончания -s.\n\nВ ответе выбирайте be + признак: He is tall, или have/has + особенность: He has brown eyes. Качества человека описывайте по тому, что вы о нём знаете; одна фотография их не доказывает.',
['What is she like?','What is he like?','What’s your new colleague like? — She’s polite and helpful.','What does she look like?','What does he look like?','She’s tall','She has long, curly hair','be + признак','He is tall','have/has + особенность','He has brown eyes']),E('L4-M07-sort','sort',title,{groups:[{id:'Personality',text:'Personality · качества'},{id:'Appearance',text:'Appearance · внешность'}],items:['long, curly hair','helpful','brown eyes','quiet','polite','short, straight hair'].map((text,i)=>({id:String(i+1),text,correctId:[0,2,5].includes(i)?'Appearance':'Personality'}))})],{progressive:true})));
s4.push(step('Language practice',2,C('L4-M08','Choose the question for each topic.',[
 item('1','Personality: “She often helps her classmates.”',['What does she look like?','What is she like?'],'B','What is she like?',['What is she like?']),item('2','Appearance: “He has short, straight hair and blue eyes.”',['What is he like?','What does he look like?'],'B','What does he look like?',['What does he look like?']),item('3','Appearance: “She has long, straight hair.”',['What does she look like?','What is she like?'],'A','What does she look like?',['What does she look like?']),item('4','Personality: “He’s polite. He always says ‘please’ and ‘thank you’.”',['What is he like?','What does he look like?'],'A','What is he like?',['What is he like?'])])));
title='Listen and choose Sam’s reply.';
s4.push(step('Listening contrast',2,S('L4-M09',title,[A('L4-M09-audio1','L4_Q_PERSONALITY',title),C('L4-M09-Q1',title,[item('1','1.',['She has long, curly hair.','She’s quiet, but she’s helpful.'],'B','She’s quiet, but she’s helpful.',['quiet, but she’s helpful'])]),A('L4-M09-audio2','L4_Q_APPEARANCE',title),C('L4-M09-Q2',title,[item('2','2.',['She has long, curly hair and green eyes.','She often helps her classmates.'],'A','She has long, curly hair and green eyes.',['long, curly hair and green eyes'])])],{instruction:'Use the conversation about Nora.',progressive:true,revealStops:[2,4],requireCheckBeforeNext:true,transcriptFollowup:'Listen again and repeat the questions.',transcriptRefs:['L4_Q_PERSONALITY_TEXT','L4_Q_APPEARANCE_TEXT'],transcriptAfterRefs:['L4-M09-Q1','L4-M09-Q2']})));
s4.push(step('Writing',3,W('L4-M10','Write the questions and replies.',[
 {id:'1',prompt:'what / new neighbor / like',possibleAnswers:['What is your new neighbor like?','What’s your new neighbor like?']},{id:'2',prompt:'Your partner asks: “What does your sister look like?”',hint:'Use: she / have / short hair / brown eyes',possibleAnswers:['She has short hair and brown eyes.']},{id:'3',prompt:'Your partner asks: “What’s your classmate like?”',hint:'Use: she / quiet / helpful',possibleAnswers:['She’s quiet and helpful.','She is quiet, but she is helpful.']}],{instruction:'Use the prompts. Write complete sentences.'})));
s4.push(step('Final Speaking',4.5,P('L4-M11','Ask about a new classmate.','Person A — Rosa\nShe says “please” and “thank you”. She often helps new students.\n\nPerson B — Ella\nShe doesn’t talk much. She listens to other people.\n\nChoose Rosa or Ella. Ask your partner:\nWhat is she like?\nWhat does she look like?\nThen change roles.\n\nNow tell your partner about a friend, a colleague or an imaginary person.','L4_SPEAKING','What is he/she like?\nWhat does he/she look like?\nHe/She is …\nHe/She has …\nHe/She often …','Use the notes, then talk about someone you know.')));
const lessons=[{id:'a1-2-w4-l3',title:'Что выбираем и почему?',level:'A1.2',whale:4,summary:'Выбираем вещи, выражаем мнение и объясняем причину: I think…, because…, Which…?, Why…?',grammar:'I think…; because…; Which…?; Why…?',words:words3,stages:s3},{id:'a1-2-w4-l4',title:'Какой он?',level:'A1.2',whale:4,summary:'Различаем вопросы о качествах человека и его внешности: What is he/she like? What does he/she look like?',grammar:'What is he/she like?; What does he/she look like?; be + adjective; have/has',words:words4,stages:s4}];
// Author guidance is retained as teacher metadata, never rendered in student Body.
const teacherNotes={
 'L3-M01':'Короткая диагностическая попытка. Новые формулы можно попробовать с опорой; затруднение не считается ошибкой в ещё не объяснённом материале. Не требовать развернутого ответа до обучения.',
 'L3-M02':'Вводится весь набор; при затруднении помочь установить значение. Gloves и sunglasses в этом наборе обозначают пару, поэтому далее используются they/are.',
 'L3-M03':'Повторение вслух, без тестового ключа.',
 'L3-M05':'Допустимы a cap / a belt и a pair of sunglasses. Не принимать a sunglasses. Не оценивать регистр как знание слова.',
 'L3-M06':'Первое слушание — для общего смысла и этих двух фактов; новые конструкции подробно разбираются дальше. Transcript доступен возле плеера и изначально свёрнут, в том числе до подключения аудио. Обычно открываем после попытки; преподаватель может раскрыть раньше.',
 'L3-M07':'Коротко уточнить, где мнение, а где причина. Не требовать угадывать ещё не объяснённые термины. После Matching — отдельное правило, затем три свободных предложения. Possible answers доступны после попытки по нажатию; OK не означает автоматическую правильность.',
 'L3-M08':'После сборки ученик задаёт один из вопросов партнёру и получает короткий ответ. Это входит во время блока.',
 'L3-M10':'1 — названы предпочтение и причина с because; 2 — вопрос о выборе с which и верным порядком; 3 — мнение с I think. Допустимы полные и сокращённые формы и другие естественные формулировки, сохраняющие эти функции.',
 'L3-M11':'Ученица должна сама задать вопросы о выборе и причине, ответить на вопросы партнёра, выразить мнение и объяснить выбор. Итог разговора — две выбранные позиции с понятным обоснованием. Опоры помогают, но не задают единственный ответ. Устная проверка преподавателем; автоматической проверки нет. Не требовать использования всех шести аксессуаров или всех подсказок. Единственной правильной пары вещей нет. Выбор для себя — дополнительное устное продолжение при наличии времени, не обязательный этап. Не добавлять готовый разговор в Possible answers.',
 'L4-M01':'Диагностика; можно описать вымышленного человека, если не хочется говорить о знакомых. Новые прилагательные не требуются до введения.',
 'L4-M02':'Quiet — о человеке, который мало говорит или не шумит, а не обязательно о застенчивости. Helpful — о готовности помочь. Lazy не означает просто «устал».',
 'L4-M03':'Повторение вслух, не закрытый тест.',
 'L4-M04':'Речь о поведении, заданном словами. Не делать выводы о качествах по одежде, возрасту, полу или выражению лица.',
 'L4-M05':'Самостоятельное слово после отдельной смысловой подсказки; поле не внутри предложения. Не считать другие слова вне сегодняшнего набора неверными описаниями вообще: здесь явно задан конкретный набор.',
 'L4-M06':'Личностные качества не выводятся из картинки; внешность служит только поиску нужного человека. Transcript открывается по кнопке после обеих попыток; перед M09 текст закрыт.',
 'L4-M09':'После проверки по запросу показать услышанные вопросы и предложить повторить. Фрагменты вырезать из L4_DIALOGUE; заново записывать не нужно.',
 'L4-M10':'1 — вопрос с be о качествах; 2 — ответ о внешности с has; 3 — ответ о качествах с be. Сокращения и иные корректные связки допустимы. Не требовать буквального совпадения с образцом.',
 'L4-M11':'По заметкам Rosa — polite/helpful, Ella — quiet; внешность описывается по изображению. Открытые описания не ограничивать единственной фразой. В последнем раунде ученик использует собственные факты. Не присваивать характер третьему персонажу только по лицу. Nora — персонаж аудио; финальная практика переносит вопросы на других людей.'
};
for(const lesson of lessons)for(const stage of lesson.stages)if(teacherNotes[stage.exercise.id])stage.guide.teacherNotes=teacherNotes[stage.exercise.id];
function attach(value,slots){
 if(!value||typeof value!=='object')return;
 if(value.mediaRef){const slot=slots[value.mediaRef];if(!slot)throw Error('Unknown media slot: '+value.mediaRef);if(slot.type==='image')Object.assign(value,{assetId:value.mediaRef,alt:slot.alt||'Image'},slot.src?{image:slot.src,imageWidth:slot.width,imageHeight:slot.height}:{imagePending:true});if(slot.type==='audio')Object.assign(value,{audioId:value.mediaRef},slot.src?{audio:slot.src}:{audioPending:true});}
 if(value.exampleMediaRef){value.exampleAudioId=value.exampleMediaRef;const slot=slots[value.exampleMediaRef];if(slot.src)value.exampleAudio=slot.src;}
 if(value.transcriptAfterRefs||value.transcriptUnlockMilestone){const refs=value.transcriptRefs||[value.transcriptRef],texts=refs.map(id=>slots[id]?.text);if(texts.every(t=>typeof t==='string'&&t.trim())){value.transcript=texts.join('\n\n')+(value.transcriptFollowup?'\n\n'+value.transcriptFollowup:'');value.transcriptTitle='Transcript';if(value.transcriptUnlockMilestone)value.transcriptGate=value.transcriptUnlockMilestone;else value.transcriptAfter=value.transcriptAfterRefs;}else value.transcriptPending=true;}
 Object.values(value).forEach(child=>{if(Array.isArray(child))child.forEach(item=>attach(item,slots));else if(child&&typeof child==='object')attach(child,slots);});
}
for(const [i,lesson] of lessons.entries()){lesson.durationMinutes=30;lesson.plannedTeachingMinutes=i===0?29:28.5;lesson.reserveMinutes=i===0?1:1.5;attach(lesson,media[i+3]);lesson.stages.forEach(stage=>kit.validate(stage.exercise));}
window.SpaceWhaleContent=window.SpaceWhaleContent||[];window.SpaceWhaleContent.push(...lessons);
})();
