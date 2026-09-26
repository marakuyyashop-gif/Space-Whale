(() => {
  'use strict';

  const kit = window.SpaceWhaleExerciseKit;
  if (!kit) throw new Error('SpaceWhaleExerciseKit is required.');

  const clothesImage = 'Clothes.png';
  const courseAudioBase = 'https://xpeywyonbapnvtjnwawi.supabase.co/storage/v1/object/public/course-audio';
  const lesson2Audio = courseAudioBase + '/a1-2/w4/l2';

  // Stable media slots: fill src once to update every use. Pending slots never request a URL.
  const lesson1Media = {
    A1M4L1_IMAGE_01: {type:'image',src:'assets/lesson-media/a1-2/module-4/lesson-1/images/coat.webp',width:1122,height:1402,alt:'A coat',target:'coat'},
    A1M4L1_IMAGE_02: {type:'image',src:'assets/lesson-media/a1-2/module-4/lesson-1/images/sweater.webp',width:1254,height:1254,alt:'A sweater',target:'sweater'},
    A1M4L1_IMAGE_03: {type:'image',src:'assets/lesson-media/a1-2/module-4/lesson-1/images/blouse.webp',width:1254,height:1254,alt:'A blouse',target:'blouse'},
    A1M4L1_IMAGE_04: {type:'image',src:'assets/lesson-media/a1-2/module-4/lesson-1/images/skirt.webp',width:1122,height:1402,alt:'A skirt',target:'skirt'},
    A1M4L1_IMAGE_05: {type:'image',src:'assets/lesson-media/a1-2/module-4/lesson-1/images/suit.webp',width:1254,height:1254,alt:'A suit',target:'suit'},
    A1M4L1_IMAGE_06: {type:'image',src:'assets/lesson-media/a1-2/module-4/lesson-1/images/hat.webp',width:1254,height:1254,alt:'A hat',target:'hat'},
    A1M4L1_IMAGE_TWO_COATS: {type:'image',src:'assets/lesson-media/a1-2/module-4/lesson-1/images/coat.webp',width:1122,height:1402,copies:2,alt:'Two coats',target:'coats'},
    A1M4L1_IMAGE_SPEAKING_01: {type:'image',src:'assets/lesson-media/a1-2/module-4/lesson-1/images/speaking.webp',width:1448,height:1086,alt:'A composition with a coat, sweater, blouse, skirt, suit and hat'},
    A1M4L1_AUDIO_01: {type:'audio',src:null,script:"Anna: Do you like this coat?\nBen: Yes. It looks good, but it looks like your old coat.\nAnna: Yes, it does. And this sweater?\nBen: It looks warm.\nAnna: I like it. How much is it?\nBen: Thirty euros.\nAnna: Okay, I want it. Can you hold it for me, please?\nBen: Of course."},
    A1M4L1_WORD_01: {type:'audio',src:null,word:'coat',sentence:'I need a coat for work.'},
    A1M4L1_WORD_02: {type:'audio',src:null,word:'sweater',sentence:'My sweater is in the wardrobe.'},
    A1M4L1_WORD_03: {type:'audio',src:null,word:'blouse',sentence:'My sister wants this blouse.'},
    A1M4L1_WORD_04: {type:'audio',src:null,word:'skirt',sentence:'I like this skirt.'},
    A1M4L1_WORD_05: {type:'audio',src:null,word:'suit',sentence:'My father has a suit for work.'},
    A1M4L1_WORD_06: {type:'audio',src:null,word:'hat',sentence:'I like your hat.'}
  };
  // A word and its example are distinct clips and distinct reveal steps.
  for(let i=1;i<=6;i++){
    const suffix=String(i).padStart(2,'0');
    lesson1Media['A1M4L1_SENTENCE_'+suffix]={type:'audio',src:null,sentence:lesson1Media['A1M4L1_WORD_'+suffix].sentence};
  }
  window.SpaceWhaleLessonMedia = {...window.SpaceWhaleLessonMedia, 'a1-2-w4-l1':lesson1Media};
  const imageSlot = assetId => ({assetId,alt:lesson1Media[assetId].alt,...(lesson1Media[assetId].src ? {image:lesson1Media[assetId].src,imageWidth:lesson1Media[assetId].width,imageHeight:lesson1Media[assetId].height,...(lesson1Media[assetId].copies?{imageCopies:lesson1Media[assetId].copies}:{}),...(lesson1Media[assetId].crop ? {crop:lesson1Media[assetId].crop} : {})} : {imagePending:true})});
  const audioSlot = audioId => ({audioId,...(lesson1Media[audioId].src ? {audio:lesson1Media[audioId].src} : {audioPending:true})});
  const wordList = ['coat','sweater','blouse','skirt','suit','hat'];
  const wordImage = word => imageSlot('A1M4L1_IMAGE_'+String(wordList.indexOf(word)+1).padStart(2,'0'));
  const exercise = (id,kind,title,extra) => ({version:1,id:'a12w4l1-'+id,kind,title,...extra});
  const options = words => words.map(word=>({id:word,text:word}));
  const step = (menu,minutes,definition,aim) => ({menu,section:'tasks',navigationTitle:menu,guide:{time:minutes+' min',aim},exercise:definition});
  const listeningQuestion = (id,title,prompt,words,correctId) => exercise(id,'choice',title,{items:[{id:'answer',prompt,options:options(words),correctId}]});
  const lesson = {
    id:'a1-2-w4-l1',title:'Как выглядит эта вещь?',level:'A1.2',whale:4,
    summary:'Учимся называть предметы одежды, описывать их внешний вид и сравнивать со знакомыми вещами.',
    grammar:'look / looks + adjective; look / looks like + noun; How does it look?',
    words:wordList,durationMinutes:29,
    stages:[
      step('Opening Speaking',2,exercise('opening','presentation','Look at the clothes and talk about them.',{
        instruction:'Use the phrases below to help you.',
        blocks:[{type:'image',...imageSlot('A1M4L1_IMAGE_SPEAKING_01')},{type:'text',text:'What clothes can you name?\nWhich items do you like?\nChoose one item. How does it look?'},{type:'disclosure',title:'Useful phrases',open:true,text:'I like …\nIt’s …\nIt looks …'},{type:'disclosure',title:'Possible answers',text:'I can name a coat, a sweater and a hat.\nI like the sweater. It looks warm.'}]
      }),'Назвать знакомую одежду и выразить предпочтение; новые конструкции можно использовать с опорой.'),
      step('New Words',3,exercise('words','matching','Match the pictures with the words.',{
        layout:'picture-word',
        items:wordList.map((word,i)=>({id:'picture-'+word,text:'Picture '+(i+1),...wordImage(word),correctId:word})),
        options:options(['skirt','hat','coat','suit','blouse','sweater'])
      }),'Познакомиться с coat, sweater, blouse, skirt, suit, hat. Картинки идут в порядке слов; варианты перемешаны отдельно.'),
      step('Listen & Repeat',3,exercise('listen-repeat','audio','Listen and repeat.',{
        layout:'listen-repeat',audioPending:true,instruction:'Listen to the words and sentences. Repeat them out loud.',
        items:wordList.map((word,i)=>{const suffix=String(i+1).padStart(2,'0'),audioId='A1M4L1_WORD_'+suffix,exampleAudioId='A1M4L1_SENTENCE_'+suffix,slot=lesson1Media[audioId];return {id:word,text:word,...audioSlot(audioId),example:slot.sentence,exampleAudioId,...(lesson1Media[exampleAudioId].src?{exampleAudio:lesson1Media[exampleAudioId].src}:{})};})
      }),'Повторить шесть слов и шесть предложений: отдельный шаг и отдельная запись для каждого слова и примера.'),
      step('Words Practice · Choice',2,exercise('word-choice','gaps','Choose the correct word.',{
        layout:'picture-rows',inputMode:'select',items:[
          ['coat','I need a ',' for cold days.',['coat','skirt','suit']],
          ['skirt','This ',' is for my sister.',['blouse','skirt','hat']],
          ['suit','My father has a ',' for work.',['suit','sweater','coat']],
          ['hat','I like this ','.',['blouse','hat','skirt']]
        ].map(([word,before,after,choices])=>({id:word,...wordImage(word),segments:[before,{id:word+'-gap',answers:[word],options:choices},after]}))
      }),'Выбрать название предмета в предложении. Все четыре пункта видны вместе.'),
      step('Words Practice · Type',2,exercise('word-type','gaps','Complete the sentences.',{
        layout:'picture-rows',inputMode:'text',items:[
          ['sweater','My ',' is in the wardrobe.',wordImage('sweater')],
          ['blouse','My sister wants this ','.',wordImage('blouse')],
          ['coats','These ',' are new.',imageSlot('A1M4L1_IMAGE_TWO_COATS')]
        ].map(([word,before,after,image])=>({id:word,...image,segments:[before,{id:word+'-gap',answers:[word]},after]}))
      }),'Написать sweater, blouse и форму множественного числа coats. Все три пункта видны вместе.'),
      step('Listening',5,exercise('listening','stage','Listen to the conversation.',{
        layout:'grouped',instruction:'Anna is looking at clothes with Ben. Listen and answer the question.',
        exercises:[
          {id:'audio',exercise:exercise('dialogue','audio','Listening',audioSlot('A1M4L1_AUDIO_01'))},
          {id:'question1',exercise:listeningQuestion('listening-q1','What does Anna want?','What does Anna want?',['A coat.','A sweater.','A blouse.'],'A sweater.')},
          {id:'question2',exercise:listeningQuestion('listening-q2','Listen again.','The coat looks like …',["Anna’s old coat.",'Ben’s coat.','a suit.'],"Anna’s old coat.")},
          {id:'question3',exercise:listeningQuestion('listening-q3','Listen again.','The sweater looks …',['old.','warm.','expensive.'],'warm.')}
        ],
        transcript:lesson1Media.A1M4L1_AUDIO_01.script,transcriptAfter:['question1','question2','question3']
      }),'Понять выбор Анны и детали описания. Транскрипт можно раскрыть после заполнения и проверки всех трёх вопросов.'),
      step('Language Focus',4,exercise('language-focus','rule-page','Match the sentences with their meanings.',{
        instruction:'Click the button next to each sentence and choose its meaning.',blocks:[
          {type:'exercise',id:'meaning',exercise:exercise('meaning','matching','Match the sentences with their meanings.',{
            items:[{id:'meaning1',text:'The coat looks good.',correctId:'C'},{id:'meaning2',text:'It looks like your old coat.',correctId:'B'},{id:'meaning3',text:'The sweater looks warm.',correctId:'A'}],
            options:[{id:'A',text:'Свитер выглядит тёплым.'},{id:'B',text:'Пальто похоже на ваше старое пальто.'},{id:'C',text:'Пальто выглядит хорошо.'}]
          })},
          {type:'rule',title:'Как описать внешний вид вещи',text:"Когда вы хотите сказать, как выглядит вещь, используйте look / looks + прилагательное. Например, The sweater looks warm — «Свитер выглядит тёплым». Вы делитесь впечатлением по внешнему виду.\n\nЕсли вещь напоминает вам другую, используйте look / looks like + существительное или сочетание с ним: This coat looks like my old coat — «Это пальто похоже на моё старое пальто». Здесь like означает сходство, а не «нравится».\n\nСравните:\nIt looks good. — Мы описываем впечатление.\nIt looks like my coat. — Мы говорим, на что вещь похожа.\n\nФорма глагола зависит от того, о ком или о чём вы говорите:\nI / you / we / they → look\nhe / she / it → looks\n\nПоэтому об одном предмете говорим The coat looks good, а о нескольких — The coats look good.\n\nПосле like действуют знакомые правила артиклей: like a coat, like an old coat, но like my coat — перед my артикль не нужен.\n\nЧтобы спросить о внешнем впечатлении, используйте How does it look? — «Как это выглядит?» После does глагол look стоит без окончания -s.",highlights:["look / looks + прилагательное", "The sweater looks warm", "look / looks like + существительное или сочетание с ним", "This coat looks like my old coat", "like", "It looks good.", "It looks like my coat.", "I / you / we / they → look", "he / she / it → looks", "The coat looks good", "The coats look good", "like a coat", "like an old coat", "like my coat", "my", "How does it look?", "does", "look", "-s"]}
        ]
      }),'Различить описание признака и сравнение с предметом, затем раскрыть правило.'),
      step('Language Practice',3,exercise('language-practice','gaps','Choose the correct option.',{
        inputMode:'select',items:[
          {id:'sentence4',segments:['This blouse ',{id:'look4',answers:['looks like'],options:['looks like','looks']},' my old blouse.']},
          {id:'sentence2',segments:['These sweaters ',{id:'look2',answers:['look like'],options:['look','look like']},' my sweaters at home.']},
          {id:'sentence5',segments:['How does this suit ',{id:'look5',answers:['look'],options:['looks','look']},'?']},
          {id:'sentence1',segments:['This coat ',{id:'look1',answers:['looks'],options:['looks','looks like']},' expensive.']},
          {id:'sentence3',segments:['This hat ',{id:'look3',answers:['looks'],options:['looks','look']},' unusual.']}
        ]
      }),'Выбрать look / looks и отличить look + adjective от look like + noun.'),
      step('Short Production',2,exercise('short-production','writing','Write the replies.',{
        responseMode:'open',instruction:'Use the prompts to write complete replies.',items:[
          {id:'reply1',prompt:'Alex: How does the sweater look?',hint:'Use: it / look / warm',possibleAnswers:['It looks warm.']},
          {id:'reply2',prompt:'Alex: Is this your coat?',hint:'Use: no / but / it / look like / my old coat',possibleAnswers:['No, but it looks like my old coat.']},
          {id:'reply3',prompt:'Alex: Do you like these hats?',hint:'Use: yes / they / look / good',possibleAnswers:['Yes, they look good.']}
        ]
      }),'Написать свободные ответы; преподаватель оценивает формулировку. Примеры появляются после OK.'),
      step('Final Speaking',3,exercise('final-speaking','presentation','Talk to your partner.',{
        instruction:'You are in a clothes shop with a friend.',
        blocks:[{type:'image',...imageSlot('A1M4L1_IMAGE_SPEAKING_01')},{type:'text',text:'Choose an item and ask your partner about it. Then change roles.\n\nDo you like this item?\nHow does it look?\nDoes it look like something you have at home?\nWhat do you want?'},{type:'disclosure',title:'Useful phrases',open:true,text:'It looks …\nIt looks like my …\nYes, it does. / No, it doesn’t.\nI like …\nI want …'},{type:'text',text:'Words to help: good · new · warm'},{type:'disclosure',title:'Possible answers',text:'— How does the sweater look?\n— It looks warm.\n— How does the coat look?\n— It looks good. It looks like my old coat.\n— Which item do you want?\n— I want the sweater.'}]
      }),'Использовать лексику и конструкции в разговоре о выборе одежды, без автоматической оценки.')
    ]
  };

  const lesson2 = {
    id: 'a1-2-w4-l2',
    title: 'Описываем внешний вид одежды',
    level: 'A1.2',
    whale: 4,
    stages: [
      {
        menu: 'Opening Speaking',
        section: 'tasks',
        guide: {
          aim: 'Войти в ситуацию урока: одежда и внешний вид, без проверки нового материала.',
          time: '2 min'
        },
        exercise: {
          version: 1,
          id: 'a12w4l2-opening',
          kind: 'presentation',
          title: 'Talk about clothes.',
          instruction: '',
          blocks: [
            {
              type: 'text',
              text: '1. What clothes do you know in English?\n2. What clothes do you wear often?\n3. What clothes do you like?'
            }
          ]
        }
      },
      {
        menu: 'New Words',
        section: 'tasks',
        guide: {
          aim: 'Познакомиться с six clothing words текущего урока.',
          tl: 'coat, sweater, blouse, skirt, suit, hat',
          time: '4 min'
        },
        exercise: {
          version: 1,
          id: 'a12w4l2-picture-word',
          kind: 'matching',
          layout: 'picture-word',
          title: 'Match the pictures with the words.',
          instruction: 'Click the box and choose the correct word.',
          items: [
            { id: 'pw1', text: 'coat', image: clothesImage, alt: 'A brown coat', crop: { x: 34.0, y: 58.3, w: 10.8, h: 21.5 }, correctId: 'coat' },
            { id: 'pw2', text: 'sweater', image: clothesImage, alt: 'A cream sweater', crop: { x: 45.0, y: 58.4, w: 11.2, h: 17.2 }, correctId: 'sweater' },
            { id: 'pw3', text: 'blouse', image: clothesImage, alt: 'A blue blouse', crop: { x: 56.5, y: 58.3, w: 11.0, h: 18.2 }, correctId: 'blouse' },
            { id: 'pw4', text: 'skirt', image: clothesImage, alt: 'A pink skirt', crop: { x: 33.8, y: 79.0, w: 12.0, h: 15.2 }, correctId: 'skirt' },
            { id: 'pw5', text: 'suit', image: clothesImage, alt: 'A dark blue suit', crop: { x: 45.5, y: 74.7, w: 10.5, h: 23.0 }, correctId: 'suit' },
            { id: 'pw6', text: 'hat', image: clothesImage, alt: 'A straw hat with a black bow', crop: { x: 56.5, y: 78.8, w: 12.5, h: 14.0 }, correctId: 'hat' }
          ],
          options: [
            { id: 'suit', text: 'suit' },
            { id: 'coat', text: 'coat' },
            { id: 'hat', text: 'hat' },
            { id: 'blouse', text: 'blouse' },
            { id: 'sweater', text: 'sweater' },
            { id: 'skirt', text: 'skirt' }
          ]
        }
      },
      {
        menu: 'Pronunciation + fixation',
        section: 'tasks',
        guide: {
          aim: 'Закрепить звучание новых Words и их русские значения, не вводя новую Grammar раньше времени.',
          tl: 'coat, sweater, blouse, skirt, suit, hat',
          time: '4 min'
        },
        exercise: {
          version: 1,
          id: 'a12w4l2-pronunciation',
          kind: 'rule-page',
          title: 'Pronunciation + fixation',
          instruction: '',
          blocks: [
            {
              type: 'exercise',
              id: 'listen-repeat',
              exercise: {
                version: 1,
                id: 'a12w4l2-listen-repeat',
                kind: 'audio',
                layout: 'listen-repeat',
                title: 'Listen and repeat.',
                instruction: '',
                items: [
                  { id: 'lr1', text: 'coat', audio: lesson2Audio + '/coat.mp3', example: 'This is a coat.', exampleAudio: lesson2Audio + '/this-is-a-coat.mp3' },
                  { id: 'lr2', text: 'sweater', audio: lesson2Audio + '/sweater.mp3', example: 'This is a sweater.', exampleAudio: lesson2Audio + '/this-is-a-sweater.mp3' },
                  { id: 'lr3', text: 'blouse', audio: lesson2Audio + '/blouse.mp3', example: 'This is a blouse.', exampleAudio: lesson2Audio + '/this-is-a-blouse.mp3' },
                  { id: 'lr4', text: 'skirt', audio: lesson2Audio + '/skirt.mp3', example: 'This is a skirt.', exampleAudio: lesson2Audio + '/this-is-a-skirt.mp3' },
                  { id: 'lr5', text: 'suit', audio: lesson2Audio + '/suit.mp3', example: 'This is a suit.', exampleAudio: lesson2Audio + '/this-is-a-suit.mp3' },
                  { id: 'lr6', text: 'hat', audio: lesson2Audio + '/hat.mp3', example: 'This is a hat.', exampleAudio: lesson2Audio + '/this-is-a-hat.mp3' }
                ]
              }
            },
            {
              type: 'exercise',
              id: 'translation',
              exercise: {
                version: 1,
                id: 'a12w4l2-translation',
                kind: 'matching',
                layout: 'word-definition',
                title: 'Match the words with the Russian meanings.',
                instruction: 'Make six pairs.',
                items: [
                  { id: 'tr1', text: 'coat', correctId: 'coat-ru' },
                  { id: 'tr2', text: 'sweater', correctId: 'sweater-ru' },
                  { id: 'tr3', text: 'blouse', correctId: 'blouse-ru' },
                  { id: 'tr4', text: 'skirt', correctId: 'skirt-ru' },
                  { id: 'tr5', text: 'suit', correctId: 'suit-ru' },
                  { id: 'tr6', text: 'hat', correctId: 'hat-ru' }
                ],
                options: [
                  { id: 'hat-ru', text: 'шляпа' },
                  { id: 'suit-ru', text: 'костюм' },
                  { id: 'sweater-ru', text: 'свитер' },
                  { id: 'skirt-ru', text: 'юбка' },
                  { id: 'coat-ru', text: 'пальто' },
                  { id: 'blouse-ru', text: 'блузка' }
                ]
              }
            }
          ]
        }
      },
      {
        menu: 'First Context',
        section: 'tasks',
        guide: {
          aim: 'Впервые встретить look/looks + adjective и look/looks like + noun в понятной ситуации.',
          tl: 'looks + adjective; looks like + noun',
          time: '3 min'
        },
        exercise: {
          version: 1,
          id: 'a12w4l2-context',
          kind: 'rule-page',
          title: 'Read the dialogue.',
          instruction: '',
          blocks: [
            {
              type: 'text',
              text: 'Anna: Look at this blouse.\nTom: It looks nice.\nAnna: What does it look like?\nTom: It looks like a shirt.\n\nAnna: And this hat?\nTom: It looks strange.\nAnna: What does it look like?\nTom: It looks like a flower.',
              highlights: ['looks nice', 'What does it look like?', 'looks like a shirt', 'looks strange', 'looks like a flower']
            },
            {
              type: 'exercise',
              id: 'notice-models',
              exercise: {
                version: 1,
                id: 'a12w4l2-context-choice',
                kind: 'gaps',
                inputMode: 'select',
                title: 'Choose.',
                instruction: 'Choose the correct option in each sentence.',
                items: [
                  { id: 'c1', segments: ['The blouse ', { id: 'c1g', answers: ['looks'], options: ['looks', 'looks like'] }, ' nice.'] },
                  { id: 'c2', segments: ['The blouse ', { id: 'c2g', answers: ['looks like'], options: ['looks', 'looks like'] }, ' a shirt.'] },
                  { id: 'c3', segments: ['The hat ', { id: 'c3g', answers: ['looks'], options: ['looks like', 'looks'] }, ' strange.'] },
                  { id: 'c4', segments: ['The hat ', { id: 'c4g', answers: ['looks like'], options: ['looks', 'looks like'] }, ' a flower.'] }
                ]
              }
            }
          ]
        }
      },
      {
        menu: 'Discovery + Rule',
        section: 'tasks',
        guide: {
          aim: 'Понять разницу двух моделей, look/looks по subject, два вопроса, do/does и a/an после like.',
          tl: 'look/looks + adjective; look/looks like + noun; How does it look?; What does it look like?; do/does; a/an',
          time: '6 min'
        },
        exercise: {
          version: 1,
          id: 'a12w4l2-discovery',
          kind: 'rule-page',
          title: 'Discovery + Rule',
          instruction: '',
          blocks: [
            {
              type: 'text',
              title: 'Посмотри на примеры.',
              text: 'The blouse looks nice.\nThe blouse looks like a shirt.\nThe hat looks strange.\nThe hat looks like a flower.',
              highlights: ['looks nice', 'looks like a shirt', 'looks strange', 'looks like a flower']
            },
            {
              type: 'exercise',
              id: 'discover-difference',
              exercise: {
                version: 1,
                id: 'a12w4l2-discover-difference',
                kind: 'gaps',
                inputMode: 'select',
                title: 'Complete the rule.',
                instruction: 'Выбери вариант прямо в пропуске.',
                items: [
                  { id: 'd1', segments: ['Если после look / looks идёт описание предмета, используем ', { id: 'd1g', answers: ['adjective'], options: ['adjective', 'noun'] }, '.'] },
                  { id: 'd2', segments: ['Если говорим, на что предмет похож, используем look / looks ', { id: 'd2g', answers: ['like'], options: ['like', 'at'] }, ' + noun.'] },
                  { id: 'd3', segments: ['С it / one thing используем ', { id: 'd3g', answers: ['looks'], options: ['looks', 'look'] }, '.'] },
                  { id: 'd4', segments: ['С they / several things используем ', { id: 'd4g', answers: ['look'], options: ['look', 'looks'] }, '.'] }
                ]
              }
            },
            {
              type: 'exercise',
              id: 'question-meaning',
              exercise: {
                version: 1,
                id: 'a12w4l2-question-meaning',
                kind: 'matching',
                title: 'Match the question with the type of answer.',
                instruction: 'Make two pairs.',
                items: [
                  { id: 'q1', text: 'How does it look?', correctId: 'b' },
                  { id: 'q2', text: 'What does it look like?', correctId: 'a' }
                ],
                options: [
                  { id: 'a', text: 'It looks like a shirt.' },
                  { id: 'b', text: 'It looks nice.' }
                ]
              }
            },
            {
              type: 'rule',
              title: 'look / looks + adjective',
              text: 'Используем, когда говорим, каким выглядит предмет.',
              examples: ['The coat looks nice.', 'The hats look strange.']
            },
            {
              type: 'rule',
              title: 'look / looks like + noun',
              text: 'Используем, когда говорим, на что предмет похож.',
              examples: ['The blouse looks like a shirt.', 'The hat looks like a flower.']
            },
            {
              type: 'rule',
              title: 'look / looks',
              formula: 'it / the coat → looks\nthey / the coats → look'
            },
            {
              type: 'rule',
              title: 'Questions',
              text: 'How does it look? → Как это выглядит?\nWhat does it look like? → На что это похоже?\n\nОдин предмет: does\nНесколько предметов: do'
            },
            {
              type: 'rule',
              title: 'After like',
              text: 'Перед одним исчисляемым существительным нужен a/an.',
              examples: ['It looks like a coat.', 'It looks like an old coat.']
            }
          ]
        }
      },
      {
        menu: 'Controlled Practice',
        section: 'tasks',
        guide: {
          aim: 'Различать две конструкции, выбирать нужный вопрос и закрепить do/does с порядком слов.',
          time: '6 min'
        },
        exercise: {
          version: 1,
          id: 'a12w4l2-controlled',
          kind: 'rule-page',
          title: 'Controlled Practice',
          instruction: '',
          blocks: [
            {
              type: 'exercise',
              id: 'fox',
              exercise: {
                version: 1,
                id: 'a12w4l2-fox',
                kind: 'gaps',
                inputMode: 'select',
                title: 'Choose the correct option.',
                instruction: 'Choose the correct form in each sentence.',
                items: [
                  { id: 'f1', segments: ['The coat ', { id: 'f1g', answers: ['looks'], options: ['looks like', 'looks'] }, ' nice.'] },
                  { id: 'f2', segments: ['This sweater ', { id: 'f2g', answers: ['looks like'], options: ['looks like', 'looks'] }, ' a coat.'] },
                  { id: 'f3', segments: ['The blouse ', { id: 'f3g', answers: ['looks'], options: ['looks', 'looks like'] }, ' pretty.'] },
                  { id: 'f4', segments: ['This skirt ', { id: 'f4g', answers: ['looks like'], options: ['looks', 'looks like'] }, ' a dress.'] },
                  { id: 'f5', segments: ['The suit ', { id: 'f5g', answers: ['looks'], options: ['looks like', 'looks'] }, ' good.'] },
                  { id: 'f6', segments: ['This hat ', { id: 'f6g', answers: ['looks like'], options: ['looks like', 'looks'] }, ' a flower.'] }
                ]
              }
            },
            {
              type: 'exercise',
              id: 'choose-question',
              exercise: {
                version: 1,
                id: 'a12w4l2-choose-question',
                kind: 'gaps',
                inputMode: 'select',
                title: 'Choose the question.',
                instruction: 'Choose the question first, then read the answer.',
                items: [
                  { id: 'qq1', segments: [{ id: 'qq1g', answers: ['How does it look?'], options: ['What does it look like?', 'How does it look?'] }, ' — It looks nice.'] },
                  { id: 'qq2', segments: [{ id: 'qq2g', answers: ['What does it look like?'], options: ['What does it look like?', 'How does it look?'] }, ' — It looks like a dress.'] },
                  { id: 'qq3', segments: [{ id: 'qq3g', answers: ['How does it look?'], options: ['How does it look?', 'What does it look like?'] }, ' — It looks strange.'] },
                  { id: 'qq4', segments: [{ id: 'qq4g', answers: ['What does it look like?'], options: ['How does it look?', 'What does it look like?'] }, ' — It looks like a shirt.'] }
                ]
              }
            },
            {
              type: 'exercise',
              id: 'unscramble-1',
              exercise: {
                version: 1,
                id: 'a12w4l2-unscramble-1',
                kind: 'order',
                title: '1. Put the words in order.',
                instruction: 'Build the question.',
                tokens: [
                  { id: 'u1a', text: 'does' },
                  { id: 'u1b', text: 'the coat' },
                  { id: 'u1c', text: 'How' },
                  { id: 'u1d', text: 'look' },
                  { id: 'u1e', text: '?' }
                ],
                correctOrder: ['u1c','u1a','u1b','u1d','u1e']
              }
            },
            {
              type: 'exercise',
              id: 'unscramble-2',
              exercise: {
                version: 1,
                id: 'a12w4l2-unscramble-2',
                kind: 'order',
                title: '2. Put the words in order.',
                instruction: 'Build the question.',
                tokens: [
                  { id: 'u2a', text: 'look' },
                  { id: 'u2b', text: 'What' },
                  { id: 'u2c', text: 'the blouse' },
                  { id: 'u2d', text: 'does' },
                  { id: 'u2e', text: 'like' },
                  { id: 'u2f', text: '?' }
                ],
                correctOrder: ['u2b','u2d','u2c','u2a','u2e','u2f']
              }
            },
            {
              type: 'exercise',
              id: 'unscramble-3',
              exercise: {
                version: 1,
                id: 'a12w4l2-unscramble-3',
                kind: 'order',
                title: '3. Put the words in order.',
                instruction: 'Build the question.',
                tokens: [
                  { id: 'u3a', text: 'the hats' },
                  { id: 'u3b', text: 'How' },
                  { id: 'u3c', text: 'do' },
                  { id: 'u3d', text: 'look' },
                  { id: 'u3e', text: '?' }
                ],
                correctOrder: ['u3b','u3c','u3a','u3d','u3e']
              }
            },
            {
              type: 'exercise',
              id: 'unscramble-4',
              exercise: {
                version: 1,
                id: 'a12w4l2-unscramble-4',
                kind: 'order',
                title: '4. Put the words in order.',
                instruction: 'Build the question.',
                tokens: [
                  { id: 'u4a', text: 'do' },
                  { id: 'u4b', text: 'the suits' },
                  { id: 'u4c', text: 'What' },
                  { id: 'u4d', text: 'look' },
                  { id: 'u4e', text: 'like' },
                  { id: 'u4f', text: '?' }
                ],
                correctOrder: ['u4c','u4a','u4b','u4d','u4e','u4f']
              }
            }
          ]
        }
      },
      {
        menu: 'a / an',
        section: 'tasks',
        guide: {
          aim: 'Проверить наличие и выбор article после like.',
          time: '2 min'
        },
        exercise: {
          version: 1,
          id: 'a12w4l2-articles',
          kind: 'gaps',
          inputMode: 'select',
          title: 'Choose the correct option.',
          instruction: 'Choose a, an or —.',
          items: [
            { id: 'a1', segments: ['It looks like ', { id: 'a1g', answers: ['a'], options: ['a', '—'] }, ' coat.'] },
            { id: 'a2', segments: ['It looks like ', { id: 'a2g', answers: ['a'], options: ['—', 'a'] }, ' skirt.'] },
            { id: 'a3', segments: ['It looks like ', { id: 'a3g', answers: ['an'], options: ['an', 'a'] }, ' old coat.'] },
            { id: 'a4', segments: ['It looks like ', { id: 'a4g', answers: ['a'], options: ['a', '—'] }, ' suit.'] }
          ]
        }
      },
      {
        menu: 'Write two sentences',
        section: 'tasks',
        guide: {
          aim: 'Самостоятельно построить обе модели по prompts.',
          time: '3 min'
        },
        exercise: {
          version: 1,
          id: 'a12w4l2-writing',
          kind: 'rule-page',
          title: 'Write two sentences.',
          instruction: 'Use the prompts.',
          blocks: [
            {
              type: 'text',
              text: '1. blouse → nice\nblouse → shirt\n\n2. hat → strange\nhat → flower\n\n3. sweater → good\nsweater → coat'
            },
            {
              type: 'exercise',
              id: 'production',
              exercise: {
                version: 1,
                id: 'a12w4l2-writing-production',
                kind: 'writing',
                title: 'Write two sentences for each set.',
                instruction: '',
                items: [
                  { id: 'w1', prompt: '1. The blouse ... / It ...' },
                  { id: 'w2', prompt: '2. The hat ... / It ...' },
                  { id: 'w3', prompt: '3. The sweater ... / It ...' }
                ]
              }
            }
          ]
        }
      },
      {
        menu: 'Final Speaking',
        section: 'tasks',
        guide: {
          aim: 'Назвать вещь, описать её внешний вид и сказать, на что она похожа.',
          time: '4 min'
        },
        exercise: {
          version: 1,
          id: 'a12w4l2-final-speaking',
          kind: 'presentation',
          title: 'Look at the clothes and talk about them.',
          instruction: '',
          blocks: [
            {
              type: 'image',
              image: clothesImage,
              alt: 'Six clothes for speaking practice: coat, sweater, blouse, skirt, suit and hat',
              crop: { x: 70.7, y: 58.0, w: 29.0, h: 39.5 }
            },
            {
              type: 'text',
              text: 'For each picture:\n\nWhat is it?\nIt’s a ...\n\nHow does it look?\nIt looks ...\n\nWhat does it look like?\nIt looks like a/an ...\n\nThen change roles: ask the questions and listen to the answers.'
            }
          ]
        }
      },
      {
        menu: 'Homework 1',
        section: 'self-study',
        guide: {
          aim: 'Перевести предложения с look/looks + adjective.',
          time: 'Self study'
        },
        exercise: {
          version: 1,
          id: 'a12w4l2-homework-1',
          kind: 'writing',
          title: 'Translate into English.',
          instruction: '',
          items: [
            { id: 'h1', prompt: 'Это пальто выглядит хорошо.' },
            { id: 'h2', prompt: 'Эта блузка выглядит красивой.' },
            { id: 'h3', prompt: 'Эта шляпа выглядит странно.' },
            { id: 'h4', prompt: 'Эти костюмы выглядят хорошо.' },
            { id: 'h5', prompt: 'Эти юбки выглядят странно.' }
          ]
        }
      },
      {
        menu: 'Homework 2',
        section: 'self-study',
        guide: {
          aim: 'Перевести look like и два типа вопросов.',
          time: 'Self study'
        },
        exercise: {
          version: 1,
          id: 'a12w4l2-homework-2',
          kind: 'writing',
          title: 'Translate into English.',
          instruction: '',
          items: [
            { id: 'h1', prompt: 'Эта блузка похожа на рубашку.' },
            { id: 'h2', prompt: 'Эта шляпа похожа на цветок.' },
            { id: 'h3', prompt: 'Как это выглядит?' },
            { id: 'h4', prompt: 'На что это похоже?' },
            { id: 'h5', prompt: 'На что похожи эти пальто?' }
          ]
        }
      }
    ]
  };

  [lesson, lesson2].forEach(item => item.stages.forEach(stage => kit.validate(stage.exercise)));
  window.SpaceWhaleContent = window.SpaceWhaleContent || [];
  window.SpaceWhaleContent.push(lesson, lesson2);
})();
