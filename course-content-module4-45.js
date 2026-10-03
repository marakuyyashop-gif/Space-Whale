(() => {
'use strict';
// Base content: lesson-sources/a12-m4-l4-l5-v7-final.md.
// L4/L5 opening and final Speaking use docs/SPEAKING_TEMPLATE.md (approved 2026-10-03).
// L4 tasks 3–10: owner-approved replacement on 2026-10-03.
// New task identities have new IDs; retained Speaking/Word Pick/media IDs stay stable.
// L4 uses the approved Nick/Emma listening continuation and revised rule/questions.
// L5 Speaking and rule updated from owner-approved text on 2026-10-03; remaining tasks await new content.
// Media scripts are ready; recordings remain explicitly pending.
const kit=window.SpaceWhaleExerciseKit, registry=window.SpaceWhaleLessonMedia;
const E=(id,kind,title,extra={})=>({version:1,id,kind,title,...extra});
const T=text=>({type:'text',text});
const D=(title,text,open=false)=>({type:'disclosure',title,text,open});
const roleText=(audience,text)=>({...T(text),audience});
const P=(id,title,blocks,instruction='')=>E(id,'presentation',title,{blocks,instruction});
const R=(id,text)=>E(id,'rule-page','Language focus',{blocks:[{type:'rule',text}]});
const C=(id,title,rows)=>E(id,'choice',title,{items:rows.map(([prompt,options,key],i)=>({id:String(i+1),prompt,options:options.map((text,j)=>({id:String(j),text})),correctId:String(key)}))});
const W=(id,title,rows,accepted=false,instruction='')=>E(id,'writing',title,{responseMode:accepted?'accepted':'open',revealPossibleAnswers:!accepted,instruction,items:rows.map(([prompt,answers,hint,placeholder],i)=>({id:String(i+1),prompt,...(hint?{hint}:{}),...(placeholder?{placeholder}:{}),[accepted?'acceptedAnswers':'possibleAnswers']:Array.isArray(answers)?answers:[answers]}))});
const M=(id,title,rows,order)=>E(id,'matching',title,{items:rows.map(([text],i)=>({id:String(i+1),text,correctId:'o'+i})),options:order.map(i=>({id:'o'+i,text:rows[i][1]}))});
const l5WordPicSheet='Images/A.1.2/Module 4/lesson 4 - sosed/e4a4d283-e122-474e-bb12-87c03be1f988.png';
const l5WordPicOrder=['furniture','drink','clothing','building','food','shop'];
const l5WordPicCrops=[
 {x:0,y:0,w:33.333,h:50},
 {x:33.333,y:0,w:33.333,h:50},
 {x:66.666,y:0,w:33.334,h:50},
 {x:0,y:50,w:33.333,h:50},
 {x:33.333,y:50,w:33.333,h:50},
 {x:66.666,y:50,w:33.334,h:50}
];
const pictureWords=(id,lesson,words,order)=>E(id,'matching','Соедините картинки и слова.',{
 layout:'picture-word',
 items:(lesson===5?l5WordPicOrder:words).map((word,i)=>{
  const sheetCrop=lesson===5?l5WordPicCrops[i]:null;
  const wordIndex=words.indexOf(word);
  return {id:String(i+1),text:String(i+1),alt:'Картинка '+(i+1),correctId:'o'+wordIndex,
   image:sheetCrop?l5WordPicSheet:`assets/lesson-media/a1-2/module-4/lesson-${lesson}/word-pick/${word}.webp`,
   ...(sheetCrop?{crop:sheetCrop}:{imageWidth:480,imageHeight:600})
  };
 }),
 options:order.map(i=>({id:'o'+i,text:words[i]}))
});
const S=(id,title,children,extra={})=>E(id,'stage',title,{progressive:true,exercises:children.map(exercise=>({id:exercise.id,exercise})),...extra});
const stage=(menu,time,exercise,teacherNotes='',section='tasks')=>({menu,navigationTitle:menu,section,guide:{time:time?time+' min':'Self study',teacherNotes},exercise});
const media={4:{},5:{}};
const courseAudioBase='https://xpeywyonbapnvtjnwawi.supabase.co/storage/v1/object/public/course-audio';
const repeatAudioVersion='20261003-sarah-v3-slow-speed1';
const addAudio=(n,id,script)=>{
 const repeatSrc=((n===4&&/^L4-W\d{2}(?:-example)?$/.test(id))||(n===5&&/^L5-W\d{2}(?:-example)?$/.test(id)))
  ?courseAudioBase+'/a1-2/w4/l'+n+'/listen-repeat/'+id+'.mp3?v='+repeatAudioVersion
  :null;
 const dialogueSrc=n===4&&id==='L4-NICK-EMMA-D01'
  ?courseAudioBase+'/dialogues/a1-2-w4-l4-ben-lisa-sarah-will-slow1.mp3?v=20261003-slow1'
  :n===5&&id==='L5-CAFE-D01'
   ?courseAudioBase+'/probes/elevenlabs-2026-10-03/emma-daniel-sarah-george-slow-speed1.mp3?v=20261003-slow1'
   :null;
 media[n][id]={type:'audio',src:repeatSrc||dialogueSrc,script};return id;
};
function repeat(n,id,words,examples){
 const folder=courseAudioBase+'/a1-2/w4/l'+n+'/listen-repeat/';
 const prefix='L'+n+'-W';
 return E(id,'audio','Listen and repeat.',{
  layout:'listen-repeat',
  audioPending:false,
  items:words.map((text,i)=>{
   const code=prefix+String(i+1).padStart(2,'0');
   const audio=folder+code+'.mp3?v=20261003-sarah-slow1-r3';
   const exampleAudio=folder+code+'-example.mp3?v=20261003-sarah-slow1-r3';
   media[n][code]={type:'audio',src:audio,script:text};
   media[n][code+'-example']={type:'audio',src:exampleAudio,script:examples[i]};
   return {id:code,text,audio,example:examples[i],exampleAudio};
  })
 });
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
const phrases5='It’s a kind of …\nIt’s a type of …\nIt’s a sort of …\nIt’s like …';
const l4=[];
l4.push(stage('Speaking',2,kit.speaking({
 id:'L4-M01',
 title:'Describe your new neighbors',
 image:{image:'Images/A.1.2/Module 4/lesson 4 - sosed/4ebce181-0d97-4783-903a-db13ce05549d.png',alt:'Два соседа в шести бытовых ситуациях.',imageWidth:1448,imageHeight:1086},
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
const dropdown4=E('L4-dropdown-gap','gaps','Complete the sentences with the correct words.',{
 inputMode:'select',instruction:'Choose the correct options.',items:[
  gap4('1','I can’t hear you. The people next to me are very ','noisy','. Can you say it again, please?',['quiet','noisy','helpful']),
  gap4('2','I don’t have a charger. Eva is ','helpful',' and gives me one.',['lazy','rude','helpful']),
  gap4('3','Ben’s very ','polite',', he always says “please” and “thank you”.',['polite','noisy','rude']),
  gap4('4','“Give me your sandwich!” — “Don’t be ','rude','. Say ‘please’.”',['helpful','quiet','rude']),
  gap4('5','Sam is ','quiet',' at school, he doesn’t talk with his classmates.',['noisy','quiet','lazy'])
 ]
});
const typed4=[
 gap4('1','Anna is always very ','helpful','. She helps me carry these boxes.'),
 gap4('2','Max is so ','lazy',', he never wants to help at home.'),
 gap4('3','These people are too ','noisy','. I can’t hear you.'),
 gap4('4','Don’t push me, Ben. That’s ','rude','.')
];
typed4.forEach((item,i)=>{
 const ref='L4-TYPED-I'+String(i+1).padStart(2,'0');
 media[4][ref]={type:'image',src:`assets/lesson-media/a1-2/module-4/lesson-4/word-pick/${['helpful','lazy','noisy','rude'][i]}.webp`,brief:[
  'Anna helps carry boxes.', 'Max does not want to help at home.',
  'People are making too much noise to hear a conversation.', 'Ben pushes another person.'
 ][i]};
 Object.assign(item,{imagePending:true,imageMediaRef:ref,assetId:ref,alt:'Картинка '+(i+1),imageWidth:480,imageHeight:600});
});
const typedGap4=E('L4-typed-gap','gaps','Complete the sentences.',{
 inputMode:'text',layout:'picture-rows',instruction:'Посмотрите на картинки и впишите подходящие слова из урока.',items:typed4
});
l4.push(stage('Word Practice',4,S('L4-word-practice','Complete the sentences.',[dropdown4,typedGap4],{requireCheckBeforeNext:true})));
const rule4=E('L4-question-rule','rule-page','Как спросить о человеке',{blocks:[{type:'rule',text:"В английском языке вопросы What is he/she like? и What does he/she look like? используются, когда мы хотим узнать разную информацию о человеке.\n\n1. What is he/she like?\n\nИспользуйте What is he/she like?, чтобы спросить, какой человек по характеру или поведению.\n\nWhat is she like? — Какая она?\nShe is polite and helpful. — Она вежливая и готовая помочь.\n\nВ ответе используйте be + adjective:\n\nHe is quiet.\nShe is rude.\n\n2. What does he/she look like?\n\nИспользуйте What does he/she look like?, чтобы спросить, как человек выглядит.\n\nWhat does she look like? — Как она выглядит?\nShe has long brown hair. — У неё длинные каштановые волосы.\n\nДля описания внешности можно использовать have/has + noun:\n\nHe has short straight hair.\nShe has long curly hair.\n\n3. What does he/she like?\n\nНе путайте What is she like? и What does she like?\n\nWhat does she like? означает «Что ей нравится?»\n\nWhat does she like? — Что ей нравится?\nShe likes music. — Ей нравится музыка.",highlights:['What is he/she like?','What does he/she look like?','What does he/she like?','What is she like?','What does she look like?','What does she like?','be + adjective','have/has + noun']}]});
const discovery4=E('L4-complete-rule','gaps','Complete the rules.',{
 inputMode:'select',instruction:'Choose the correct options.',items:[
  gap4('1','Используем What does she look like?, когда хотим узнать ','как она выглядит','.', ['какая она в общении','как она выглядит','что она любит']),
  gap4('2','Используем What is she like?, когда хотим узнать ','какая она в общении','.', ['как она выглядит','что она любит','какая она в общении'])
 ]
});
l4.push(stage('Complete the Rule',3,S('L4-discovery-rule','Complete the rules.',[
 P('L4-question-examples','Complete the rules.',[{...T('What does she look like? — She has long brown hair.\n\nWhat is she like? — She is polite and helpful.'),highlights:['look like?','like?']}]),
 discovery4,rule4
],{revealStops:[2,3],requireCheckBeforeNext:true})));
const dialogue4='Ben: I want to invite our new neighbors for coffee. Do you know them?\n\nLisa: Yes. Their names are Nick and Emma.\n\nBen: What is Nick like?\n\nLisa: He’s really helpful. He often helps me with my bike.\n\nBen: What does he look like?\n\nLisa: He has short curly hair.\n\nBen: And Emma? What is she like?\n\nLisa: She’s polite and quiet.\n\nBen: What does she look like?\n\nLisa: She has long straight hair.\n\nBen: Do you have their phone number?\n\nLisa: Yes, I do. Here it is.\n\nBen: Great, thanks!';
const listeningTitle4='Listen to the audio and answer the questions.';
l4.push(stage('Listening',4,S('L4-neighbors-listening',listeningTitle4,[
 E('L4-neighbors-player','audio',listeningTitle4,{mediaRef:addAudio(4,'L4-NICK-EMMA-D01',dialogue4),audioPending:true}),
 E('L4-listening-multiple','choice','Choose the answers.',{
  multiple:true,items:[
   {id:'emma',prompt:'What is Emma like?',options:['polite','quiet','helpful','noisy'].map((text,i)=>({id:String(i+1),text})),correctIds:['1','2']},
   {id:'nick',prompt:'What does Nick look like?',options:['He has short hair.','He has curly hair.','He has long hair.','He has straight hair.'].map((text,i)=>({id:String(i+1),text})),correctIds:['1','2']}
  ]
 }),
 C('L4-listening-purpose','Choose the correct answer.',[
  ['What does Ben want to do?',['Visit his sister.','Invite his new neighbors for coffee.','Have dinner with his parents.'],1]
 ]),
 E('L4-listening-true-false','gaps','Are the sentences true or false?',{
  inputMode:'select',instruction:'Listen again.',items:[
   gap4('1','Nick often helps Lisa with her bike. ','True','',['True','False']),
   gap4('2','Emma is noisy. ','False','',['True','False']),
   gap4('3','Lisa has Nick and Emma’s phone number. ','True','',['True','False']),
   gap4('4','Ben wants to invite Nick and Emma for coffee. ','True','',['True','False'])
  ]
 }),
 P('L4-listening-script',listeningTitle4,[D('Script',dialogue4,false)])
],{revealStops:[2,3,5],requireCheckBeforeNext:true})));
l4.push(stage('Matching',2,M('L4-question-answer-match','Match the questions with the answers.',[
 ['What is he like?','He’s a little lazy at home.'],
 ['What does she look like?','Her hair is short and curly.'],
 ['What does he look like?','He has long straight hair.'],
 ['What is she like?','She’s helpful. She often helps me with my homework.']
],[1,0,3,2])));
const questions4=[
 ['Jake is very rude and lazy. He never helps his mom.',['What is Jake like?','What is he like?',"What's Jake like?","What's he like?",'What’s Jake like?','What’s he like?']],
 ['Nora has brown eyes and short hair.',['What does she look like?','What does Nora look like?']],
 ['She is tall and slim. She has long curly hair.',['What does she look like?']],
 ['My parents are very kind and smart.',['What are they like?','What are your parents like?']]
].map(([prompt,answers])=>[prompt,[...answers,...answers.map(answer=>answer.replace(/\?$/,''))]]);
l4.push(stage('Write the questions',3,W('L4-questions-for-answers','Write the questions for the answers.',questions4,true,'Задайте вопрос к предложению.')));
l4.push(stage('Final · Speaking',5,kit.speaking({
 id:'L4-M11',
 title:'Describe the new students',
 image:{image:'Images/A.1.2/Module 4/lesson 4 - sosed/f55b31c3-30bd-4e45-9485-3a020903c8df.png',alt:'Две новые ученицы и ситуации, показывающие их характер и поведение.',imageWidth:1448,imageHeight:1086},
 task:{
  text:'В ваш класс пришли два новых ученика. Вы уже с ними познакомились, и ваш одноклассник расспрашивает вас о них. Расскажите ему:',
  bullets:['какие они;','как они выглядят.']
 },
 use:[
  {words:['polite','rude','helpful','lazy','quiet','noisy'],phrases:['What is he/she like?','He/She is ...']},
  {words:['long hair','short hair','brown hair','blonde hair'],phrases:['What does he/she look like?','He/She has ...']}
 ]
})));

const acceptedEnglish=(...values)=>[...new Set(values.flatMap(value=>{
 const clean=String(value).trim(), noPunctuation=clean.replace(/[.!?]$/,'');
 const curly=clean.replace(/'/g,'’'), curlyNoPunctuation=curly.replace(/[.!?]$/,'');
 return [clean,noPunctuation,curly,curlyNoPunctuation];
}))];

const l4Homework1=[
 ['Какой Джейк?',acceptedEnglish('What is Jake like?',"What's Jake like?"),null,'Jake'],
 ['Джейк грубый и шумный.',acceptedEnglish('Jake is rude and noisy.','He is rude and noisy.',"He's rude and noisy."),null,'Jake'],
 ['Как выглядит Нора?',acceptedEnglish('What does Nora look like?'),null,'Nora'],
 ['У Норы длинные каштановые волосы.',acceptedEnglish('Nora has long brown hair.','She has long brown hair.'),null,'Nora'],
 ['Какая Эмма?',acceptedEnglish('What is Emma like?',"What's Emma like?"),null,'Emma'],
 ['Эмма вежливая и готовая помочь.',acceptedEnglish('Emma is polite and helpful.','She is polite and helpful.',"She's polite and helpful."),null,'Emma']
];
const l4Homework2=[
 ['Как выглядит Бен?',acceptedEnglish('What does Ben look like?'),null,'Ben'],
 ['У Бена короткие светлые волосы.',acceptedEnglish('Ben has short blonde hair.','He has short blonde hair.'),null,'Ben'],
 ['Какая Лили?',acceptedEnglish('What is Lily like?',"What's Lily like?"),null,'Lily'],
 ['Лили тихая.',acceptedEnglish('Lily is quiet.','She is quiet.',"She's quiet."),null,'Lily'],
 ['Какой Макс?',acceptedEnglish('What is Max like?',"What's Max like?"),null,'Max'],
 ['Макс ленивый.',acceptedEnglish('Max is lazy.','He is lazy.',"He's lazy."),null,'Max']
];
l4.push(stage('Homework 1',0,W('L4-homework-1','Translate into English.',l4Homework1,true,'Переведите вопросы и ответы на английский.'),'Вопросы о характере и внешности перемешаны; каждая строка проверяется отдельно.','self-study'));
l4.push(stage('Homework 2',0,W('L4-homework-2','Translate into English.',l4Homework2,true,'Переведите вопросы и ответы на английский.'),'Используйте What is ... like? для характера и What does ... look like? для внешности.','self-study'));

const l5=[];
l5.push(stage('Speaking',2,kit.speaking({
 id:'L5-M01',
 title:'Explain the unusual things',
 image:{image:'Images/A.1.2/Module 4/lesson 4 - sosed/57bfed79-3834-4204-837e-d9471e979322.png',alt:'Шесть необычных вещей для объяснения категории и сходства.',imageWidth:1448,imageHeight:1086},
 task:{text:'Ваш друг рассматривает фотографии необычных вещей и спрашивает, что это такое. Объясните ему:',bullets:['к какой категории относится каждая вещь;','на что она похожа.']},
 use:[
  {words:['food','drink','furniture','clothing','building','shop'],phrases:['It’s a kind of ...','It’s a type of ...','It’s a sort of ...']},
  {words:['cushion','tea','blanket','house','bun','supermarket'],phrases:['It’s like ...']}
 ]
})));
const meanings5=[['food','еда'],['drink','напиток'],['furniture','мебель'],['clothing','одежда'],['building','здание'],['shop','магазин']];
l5.push(stage('Word Pick',2.5,S('L5-M02','Соедините картинки и слова.',[pictureWords('L5-word-translation',5,words5,[2,5,1,4,0,3])])));
l5.push(stage('Listen & Repeat',2,repeat(5,'L5-M03',words5,["We need some food for the party.", "I’d like a drink, please.", "There is new furniture in the living room.", "This shop has clothing for men and women.", "The library is an old building.", "There is a small shop near my house."])));
const wordPractice5=[
 ['The table is full of sandwiches, fruit and cake. All the ','food',' is ready for the party.'],
 ['Tea, juice or water? Choose a ','drink','.'],
 ['The new apartment is almost empty. There is no ','furniture',' in the living room yet.'],
 ['This store has coats, sweaters and hats. It has a lot of warm ','clothing',' for winter.'],
 ['The library is in a beautiful old ','building',' next to the park.'],
 ['I usually buy bread and milk at the small ','shop',' near my house.']
];
l5.push(stage('Word Practice',3,E('L5-word-initial-gaps','gaps','Complete the sentences with the correct words.',{
 inputMode:'text',items:wordPractice5.map(([before,answer,after],i)=>({id:String(i+1),segments:[before,{id:'word'+(i+1),answers:[answer],placeholder:answer[0]},after]}))
})));
l5.push(stage('Complete the Rule',2,S('L5-M06','Complete the rules.',[
 P('L5-kind-context','Complete the rules.',[{type:'text',text:'It’s a kind of furniture.\nIt’s a type of drink.\nIt’s a sort of clothing.\nIt’s like a big cushion.',highlights:['a kind of','a type of','a sort of','It’s like']}]),
 E('L5-category-discovery','gaps','Complete the rules.',{inputMode:'select',instruction:'Choose the correct options.',items:[
 {id:'1',highlights:['a kind of','a type of','a sort of'],segments:['Используйте a kind of, a type of или a sort of, когда хотите сказать ',{id:'category',answers:['к какой категории относится предмет'],options:['на что похож предмет','что человек добрый','к какой категории относится предмет']},'.']},
 {id:'2',highlights:['like'],segments:['Используйте like, когда хотите сказать ',{id:'similarity',answers:['на что похож предмет'],options:['что вам нравится','на что похож предмет','к какой категории относится предмет']},'.']},
 {id:'3',highlights:['kind of','type of','sort of'],segments:['Перед kind of, type of и sort of используйте ',{id:'article',answers:['a'],options:['the','a','—']},'.']}
 ]})
],{revealStops:[2]})));
l5.push(stage('Language focus',2,E('L5-kind-rule','rule-page','Как объяснить незнакомую вещь',{blocks:[{type:'rule',text:"В английском языке незнакомую или необычную вещь можно объяснить двумя способами: сказать, к какой категории она относится, или сравнить её с чем-то знакомым.\n\n1. A kind of / a type of / a sort of\n\nИспользуйте a kind of, a type of или a sort of, чтобы сказать, к какой общей категории относится предмет.\n\nВ этом значении kind, type и sort означают практически одно и то же.\n\nIt’s a kind of furniture. — Это вид мебели.\nIt’s a type of drink. — Это вид напитка.\nIt’s a sort of building. — Это вид здания.\n\nПосле a kind of / a type of / a sort of называем общую категорию:\n\nfood · drink · furniture · clothing · building · shop\n\nОбратите внимание: в этой конструкции используется a:\n\na kind of · a type of · a sort of\n\n2. It’s like\n\nИспользуйте It’s like + noun, когда хотите сказать, на что похож предмет.\n\nIt’s like a big cushion. — Это похоже на большую подушку.\nIt’s like tea. — Это похоже на чай.\nIt’s like a small house. — Это похоже на маленький дом.\nIt’s like a bun. — Это похоже на булочку.\n\nСравните:\n\nIt’s a kind of furniture. — мы говорим, что это за категория.\nIt’s like a big cushion. — мы говорим, на что это похоже.\n\nТаким образом:\n\na kind of / a type of / a sort of → category\nlike → similarity",highlights:['A kind of / a type of / a sort of','a kind of','a type of','a sort of','It’s like','на что похож предмет','что это за категория','на что это похоже','like → similarity']}]})));
const categorySentences5=[
 ['It’s a kind of furniture.','category'],['It’s like a big cushion.','similarity'],
 ['It’s a type of drink.','category'],['It’s like tea.','similarity'],
 ['It’s a sort of clothing.','category'],['It’s like a blanket.','similarity'],
 ['It’s a kind of building.','category']
];
l5.push(stage('Sort into groups',2,E('L5-category-similarity-sort','sort','Put the sentences into categories.',{
 groups:[{id:'category',text:'Category'},{id:'similarity',text:'Similarity'}],
 items:[3,0,5,2,6,1,4].map(i=>({id:String(i+1),text:categorySentences5[i][0],correctId:categorySentences5[i][1]}))
})));
l5.push(stage('Matching',3,M('L5-explanation-matching','Match the phrases to make correct sentences.',[
 ['A beanbag is a kind of','furniture.'],['Bubble tea is like','tea.'],
 ['A poncho is a sort of','clothing.'],['An igloo is like','a small house.'],
 ['Bao is a type of','food.'],['A kiosk is a kind of','shop.']
],[3,5,1,4,0,2])));
const explanationGaps5=[
 ['This beanbag is in the living room. It’s a ',['kind','type','sort'],' of furniture.'],
 ['I’d like bubble tea, please. It’s a ',['type','kind','sort'],' of drink.'],
 ['This poncho is warm and colorful. It’s a ',['sort','kind','type'],' of clothing.'],
 ['This igloo is small. It’s ',['like'],' a little house.'],
 ['Bao is food, but it looks different from the food I usually eat. It’s a ',['type','kind','sort'],' of food.'],
 ['There is a kiosk near the park. It’s ',['like'],' a small supermarket.']
];
l5.push(stage('Fill in the gaps',4,E('L5-explanation-gaps','gaps','Complete the sentences.',{
 inputMode:'text',items:explanationGaps5.map(([before,answers,after],i)=>({id:String(i+1),segments:[before,{id:'gap'+(i+1),answers},after]}))
})));
const dialogue5="Emma: This café is nice. There are so many drinks here.\n\nDaniel: Yes. I usually have tea, but I want to try something different today.\n\nEmma: What about bubble tea?\n\nDaniel: I don’t know it. What is it?\n\nEmma: It’s a type of drink. It’s like tea with milk.\n\nDaniel: Sounds good. How much is it?\n\nEmma: Four dollars.\n\nDaniel: Okay. And what do you want?\n\nEmma: I think I want juice. The bubble tea looks interesting, but it’s a little too sweet for me.\n\nDaniel: Okay then, juice for you, bubble tea for me.\n\nEmma: Good choice.";
const listeningTitle5='Listen to the conversation and do the tasks.';
l5.push(stage('Listening',4,S('L5-cafe-listening',listeningTitle5,[
 E('L5-cafe-player','audio',listeningTitle5,{mediaRef:addAudio(5,'L5-CAFE-D01',dialogue5),audioPending:true}),
 C('L5-cafe-place','Choose the correct answer.',[['Where are Emma and Daniel?',['At home.','At a café.','At a clothing shop.'],1]]),
 E('L5-cafe-information','gaps','Choose the correct options.',{inputMode:'select',items:[
 {id:'1',segments:['Daniel usually has ',{id:'usual',answers:['tea'],options:['coffee','juice','tea','water']},'.']},
 {id:'2',segments:['Daniel wants ',{id:'daniel',answers:['bubble tea'],options:['juice','bubble tea','coffee','water']},'.']},
 {id:'3',segments:['Emma wants ',{id:'emma',answers:['juice'],options:['tea','water','bubble tea','juice']},'.']},
 {id:'4',segments:['Bubble tea costs ',{id:'price',answers:['four dollars'],options:['five dollars','four dollars','three dollars']},'.']}
 ]}),
 E('L5-cafe-sequence','order','Put the events in the correct order.',{
 tokens:[{id:'price',text:'Daniel asks about the price.'},{id:'choice',text:'Daniel wants bubble tea, and Emma wants juice.'},{id:'suggest',text:'Emma suggests bubble tea.'},{id:'explain',text:'Emma explains what bubble tea is.'}],correctOrder:['suggest','explain','price','choice']
 }),
 E('L5-cafe-hear','choice','Choose the sentences you hear.',{multiple:true,items:[{id:'heard',prompt:'Select all the correct answers.',options:[{id:'type',text:'It’s a type of drink.'},{id:'food',text:'It’s a kind of food.'},{id:'milk',text:'It’s like tea with milk.'},{id:'juice',text:'It’s like juice.'}],correctIds:['type','milk']}]}),
 P('L5-cafe-script',listeningTitle5,[D('Script',dialogue5,false)])
],{revealStops:[2,3,4,6],requireCheckBeforeNext:true})));
l5.push(stage('Final · Speaking',5,kit.speaking({
 id:'L5-M09',
 title:'Help your new colleague',
 image:{image:'Images/A.1.2/Module 4/lesson 4 - sosed/04470db6-bc5f-48d0-84bf-4a87f0f6d53a.png',alt:'Шесть необычных вещей для объяснения категории и сходства.',imageWidth:1448,imageHeight:1086},
 task:{text:'В вашем офисе появился новый сотрудник. В первый день его удивляют некоторые вещи вокруг, и он спрашивает, что это такое. Объясните ему:',bullets:['к какой категории относится каждая вещь;','на что она похожа.']},
 use:[
  {words:['food','drink','furniture','clothing','building','shop'],phrases:['It’s a kind of ...','It’s a type of ...','It’s a sort of ...']},
  {words:['cushion','tea','blanket','house','bun','supermarket'],phrases:['It’s like ...']}
 ]
})));

const categoryAnswer=(subject,article,category)=>acceptedEnglish(
 `${article}${subject} is a kind of ${category}.`,
 `${article}${subject} is a type of ${category}.`,
 `${article}${subject} is a sort of ${category}.`,
 `It is a kind of ${category}.`, `It's a kind of ${category}.`,
 `It is a type of ${category}.`, `It's a type of ${category}.`,
 `It is a sort of ${category}.`, `It's a sort of ${category}.`
);
const categoryQuestion=(term,article='')=>acceptedEnglish(
 `What is ${article}${term}?`,
 `What's ${article}${term}?`
);
const similarityQuestion=(term,article='')=>acceptedEnglish(
 `What is ${article}${term} like?`,
 `What's ${article}${term} like?`
);
const categoryAndSimilarity=(subject,article,category,comparison)=>acceptedEnglish(
 `${article}${subject} is a kind of ${category}. It is like ${comparison}.`,
 `${article}${subject} is a kind of ${category}. It's like ${comparison}.`,
 `${article}${subject} is a type of ${category}. It is like ${comparison}.`,
 `${article}${subject} is a type of ${category}. It's like ${comparison}.`,
 `${article}${subject} is a sort of ${category}. It is like ${comparison}.`,
 `${article}${subject} is a sort of ${category}. It's like ${comparison}.`
);

const l5Homework1=[
 ['На что похож бинбэг?',similarityQuestion('beanbag','a '),null,'beanbag'],
 ['Бинбэг — это вид мебели. Он похож на большую подушку.',categoryAndSimilarity('beanbag','A ','furniture','a big cushion'),null,'beanbag'],
 ['Что такое бабл-ти?',categoryQuestion('bubble tea'),null,'bubble tea'],
 ['Бабл-ти — это вид напитка.',categoryAnswer('bubble tea','', 'drink'),null,'bubble tea'],
 ['Что такое иглу?',categoryQuestion('igloo','an '),null,'igloo'],
 ['Иглу — это вид здания.',categoryAnswer('igloo','An ','building'),null,'igloo']
];
const l5Homework2=[
 ['На что похоже пончо?',similarityQuestion('poncho','a '),null,'poncho'],
 ['Пончо — это вид одежды. Оно похоже на одеяло.',categoryAndSimilarity('poncho','A ','clothing','a blanket'),null,'poncho'],
 ['Что такое бао?',acceptedEnglish(...categoryQuestion('bao'),...categoryQuestion('bao','a ')),null,'bao'],
 ['Бао — это вид еды. Он похож на булочку.',acceptedEnglish(...categoryAndSimilarity('bao','', 'food','a bun'),...categoryAndSimilarity('bao','A ','food','a bun')),null,'bao'],
 ['На что похож киоск?',similarityQuestion('kiosk','a '),null,'kiosk'],
 ['Киоск — это вид магазина. Он похож на маленький супермаркет.',categoryAndSimilarity('kiosk','A ','shop','a small supermarket'),null,'kiosk']
];
l5.push(stage('Homework 1',0,W('L5-homework-1','Translate into English.',l5Homework1,true,'Переведите вопросы и ответы на английский.'),'В одном задании смешаны category и similarity; каждая строка проверяется отдельно.','self-study'));
l5.push(stage('Homework 2',0,W('L5-homework-2','Translate into English.',l5Homework2,true,'Переведите вопросы и ответы на английский.'),'Kind, type и sort принимаются как правильные варианты; like используется для сходства.','self-study'));
function attach(value,slots){
 if(!value||typeof value!=='object')return;
 if(value.imageMediaRef){const slot=slots[value.imageMediaRef];if(slot?.src)Object.assign(value,{image:slot.src,imagePending:false});}
 if(value.mediaRef){const slot=slots[value.mediaRef];if(!slot)throw Error('Missing media '+value.mediaRef);Object.assign(value,{audioId:value.mediaRef},slot.src?{audio:slot.src,audioPending:false}:{audioPending:true});}
 if(value.exampleMediaRef){const slot=slots[value.exampleMediaRef];value.exampleAudioId=value.exampleMediaRef;if(slot.src)value.exampleAudio=slot.src;}
 Object.values(value).forEach(v=>{if(Array.isArray(v))v.forEach(x=>attach(x,slots));else if(v&&typeof v==='object')attach(v,slots);});
}
const lessons=[
 {id:'a1-2-w4-l4',words:words4,constructions:'What is he/she like? · What does he/she look like?',summary:'Узнаём и описываем качества человека и его внешность.',reserveMinutes:2,stages:l4},
 {id:'a1-2-w4-l5',words:words5,constructions:'It’s a kind of … · It’s a type of … · It’s a sort of … · It’s like …',summary:'Объясняем незнакомую вещь через общую категорию и сравнение с чем-то знакомым.',reserveMinutes:2.5,stages:l5}
];
for(const [i,lesson] of lessons.entries()){
 const slots=media[i+4],old=registry[lesson.id]||{};
 for(const [key,slot] of Object.entries(slots)){const existing=old[key];if(existing?.src&&existing.type===slot.type&&existing.script===slot.script&&existing.brief===slot.brief)slots[key]={...slot,...existing};}
 registry[lesson.id]={...old,...slots};
 Object.assign(lesson,{level:'A1.2',whale:4,grammar:'—',durationMinutes:30,plannedTeachingMinutes:30,contentVersion:'v7_FINAL',mediaStatus:'ready',showTeacherNotes:true,syncDisclosures:true});
 lesson.contentVersion=i===0?'approved-l4-homework-translation-2026-10-03':'approved-l5-homework-mixed-translation-2026-10-03';
 attach(lesson,slots);lesson.stages.forEach(s=>kit.validate(s.exercise));
 const at=window.SpaceWhaleContent.findIndex(l=>l.id===lesson.id);if(at<0)window.SpaceWhaleContent.push(lesson);else window.SpaceWhaleContent[at]=lesson;
}
})();
