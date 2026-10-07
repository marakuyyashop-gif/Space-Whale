(() => {
  'use strict';
  const kit = window.SpaceWhaleExerciseKit;
  const E = (id, kind, title, extra = {}) => ({version:1, id, kind, title, ...extra});
  const stage = (menu, time, exercise, teacherNotes = '') => ({menu, navigationTitle:menu, section:'tasks', guide:{time:time+' min', teacherNotes}, exercise});
  const seq = (id, title, exercises) => E(id, 'stage', title, {progressive:true, requireCheckBeforeNext:true, exercises:exercises.map(exercise => ({id:exercise.id, exercise}))});
  const match = (id, title, pairs, order) => E(id, 'matching', title, {
    items:pairs.map((pair, i) => ({id:String(i+1), text:pair[0], correctId:'a'+i})),
    options:order.map(i => ({id:'a'+i, text:pairs[i][1]}))
  });
  const write = (id, title, instruction, items) => E(id, 'writing', title, {instruction, responseMode:'open',
    items:items.map(([prompt, answer], i) => ({id:String(i+1), prompt, possibleAnswers:[answer]}))});
  const select = (id, title, instruction, rows) => E(id, 'gaps', title, {inputMode:'select', instruction,
    items:rows.map(([before, answer, after, options], i) => ({id:String(i+1), segments:[before,{id:'g'+(i+1),answers:[answer],options},after]}))});
  const order = (id, title, rows) => rows.map((row,i) => E(id+'-'+(i+1),'order',title,{
    sentenceCase:true,
    tokens:(row.length===5?[2,0,4,1,3]:[2,0,3,1]).map(j=>({id:String(j),text:row[j]})),
    correctOrder:row.map((_,j)=>String(j))
  }));
  const talk = (id, title, task, use, assetId) => kit.speaking({id,title,
    image:assetId?{imagePending:true,assetId}:null,task:{text:task},use});
  const multiple = (id, title, options, correctIds) => E(id, 'choice', title, {
    multiple:true,
    items:[{id:'1', prompt:'Отметь все подходящие фразы.', options:options.map((text,i)=>({id:String(i+1),text})), correctIds}]
  });
  const blocks = [];
  blocks.push(stage('Вид и степень признака',8,seq('L6-review-appearance','Look and describe',[
    select('L6-look-dropdown','Choose the correct option.','',[
      ['This dress ','looks like',' my old dress.',['looks','look like','look','looks like']],
      ['Your new blouse ','looks',' really expensive.',['look like','look','looks like','looks']],
      ['These hats ','look like',' my father’s old hats.',['looks like','looks','look like','look']],
      ['The black suit ','looks',' very new.',['look','looks like','looks','look like']],
      ['My coat ','looks like',' a long dress.',['look like','looks','looks like','look']],
      ['These sweaters ','look',' too big for me.',['looks like','look','look like','looks']],
      ['The colorful bags ','look',' really pretty.',['looks','look like','look','looks like']],
      ['This cap ','looks like',' my brother’s old hat.',['look','looks like','look like','looks']]
    ]),
    E('L6-picture-prompt','stage','Say what they look like.',{layout:'grouped',exercises:[
      {id:'L6-look-picture',exercise:talk('L6-look-picture','Say what they look like.',
        'Look at the picture. Say one sentence for each item.',
        [{words:['look','looks','look like','looks like']}], 'A1M4L6_IMAGE_LOOK_ITEMS')},
      {id:'L6-look-picture-answers',exercise:E('L6-look-picture-answers','presentation','Say what they look like.',{
        blocks:[{type:'disclosure',title:'Possible answers',role:'possible-answers',text:[
          '1. The coat looks like a dress.',
          '2. The blouse looks expensive.',
          '3. The hat looks like a cap.',
          '4. The suits look new.'
        ].join('\n')}]})}
    ]}),
    seq('L6-intensifiers','Very / really / so / too / a little / a bit',[
      multiple('L6-intensifiers-positive','Где вещь описывают очень положительно?',[
        'This skirt is very pretty.',
        'Your blouse is really pretty.',
        'That bag is so pretty!',
        'This hat is too bright for me.',
        'The sweater is a little dark.',
        'His tie is a bit strange.'
      ],['1','2','3']),
      multiple('L6-intensifiers-too','Где какого-то качества слишком много и из-за этого вещь не подходит?',[
        'This hat is too bright for me.',
        'The bag is too colorful for me.',
        'This sweater is really dark.',
        'Her blouse is very pretty.',
        'The coat is a bit strange.',
        'These pants are too big for me.'
      ],['1','2','6']),
      multiple('L6-intensifiers-little','Где качество выражено немного?',[
        'The sweater is a little dark.',
        'This tie is a bit strange.',
        'The blouse is very bright.',
        'Her bag is really colorful.',
        'The coat is a little big.',
        'This skirt is so pretty!'
      ],['1','2','5'])
    ])
  ]),'Для устной части нужна Image 1: пальто, похожее на платье, дорогая блузка, шляпа, похожая на кепку, и новые костюмы.'));
  blocks.push(stage('Выбор и причина',7,seq('L6-review-choice','Choose and explain',[
    match('L6-match-reasons','2 · Выбор и причина — Match the questions with the answers.',[
      ['Which one do you like?','The colorful cap.'],
      ['Which ones do you like?','These two bags.'],
      ['Why do you like it?','Because it’s pretty.'],
      ['Why do you like them?','Because they’re simple.']],[3,0,2,1]),
    ...order('L6-order-questions','Put the words in order.',[
      ['which','one','do','you','like'],
      ['why','does','she','like','them'],
      ['what','do','you','think'],
      ['I think','the bag','looks','pretty']
    ]),
    talk('L6-talk-choice','Choose and explain',
      'Выбери одну из двух кепок. Скажи, что ты о ней думаешь и почему она тебе нравится. Затем спроси преподавателя, какие две из трёх сумок ему нравятся и почему.',
      [{words:['cap','bag','colorful','simple'],phrases:['Which one do you like?','Which ones do you like?','Why do you like them?','I think …','I like … because …']}],
      'A1M4L6_IMAGE_CAPS_BAGS')
  ]),'Две кепки и три сумки; ответ о выборе свободный.'));
  blocks.push(stage('Описание человека',7,seq('L6-review-people','Describe people',[
    select('L6-be-have','3 · Описание человека — Describe the people.','Choose the correct words.',[
      ['My neighbors ','are',' quiet.',['have','are']],
      ['Leo ','has',' black hair.',['has','is']],
      ['I ','am',' helpful.',['have','am']],
      ['Mia ','has',' brown hair.',['is','has']]
    ]),
    write('L6-write-people','Describe Eva and Max.','Write two sentences about each person.',[
      ['Eva: polite / blonde hair','Eva is polite. She has blonde hair.'],
      ['Max: noisy / black hair','Max is noisy. He has black hair.']]),
    talk('L6-ask-people','Ask about Nina and Sam',
      'Узнай у преподавателя, какая Nina по характеру и как она выглядит. Затем спроси то же самое о Sam. Ответь о себе на оба вопроса.',
      [{phrases:['What is Nina like?','What does Nina look like?','What is Sam like?','What does Sam look like?','What are you like?','What do you look like?']}])
  ]),'Только преподавателю: Nina — helpful, brown hair; Sam — quiet, red hair. Не показывать ответы ученице до вопросов.'));
  blocks.push(stage('Категория и сходство',8,seq('L6-review-category','Explain the things',[
    select('L6-category-choice','4 · Категория и сходство — Explain the things.','Choose the correct words.',[
      ['A sofa is ','a sort of',' furniture.',['a sort','a sort of']],
      ['A coat is a kind of ','clothing','.',['clothing','a clothing']],
      ['Tea is a type ','of',' drink.',['of','to']],
      ['A muffin is like ','a small cake','.',['small cake','a small cake']],
      ['A supermarket is a sort ','of',' shop.',['of','like']]
    ]),
    write('L6-category-write','Explain the words.','Write a sentence. Use the word in brackets.',[
      ['a pancake → food (kind)','A pancake is a kind of food.'],
      ['juice → drink (type)','Juice is a type of drink.'],
      ['an armchair → furniture (sort)','An armchair is a sort of furniture.'],
      ['a muffin → a small cake (like)','A muffin is like a small cake.']]),
    talk('L6-talk-category','Help me understand',
      'Собеседник не знает эти слова. Объясни, что такое hotel, supermarket, coat и muffin через знакомую категорию. Для muffin добавь сходство.',
      [{words:['hotel','supermarket','coat','muffin','building','shop','clothing','food'],phrases:['It’s a kind of …','It’s a type of …','It’s a sort of …','It’s like …']}])
  ])));
  const review=stage('Повторение',30,seq('L6-review','Review the module',blocks.flatMap(block=>block.exercise.exercises.map(item=>item.exercise))),
    'Четыре части: вид и степень признака; выбор и причина; описание человека; категория и сходство.');
  review.exercise.unifiedProgression=true;
  const lesson = {id:'a1-2-w4-l6',level:'A1.2',whale:4,summary:'Повторяем описание вещей и людей, выбор, причины и объяснение незнакомых предметов.',
    grammar:'look/looks; be/have; question forms',constructions:'Which one(s)? · Why? · a kind/type/sort of · like',
    durationMinutes:30,contentVersion:'review-look-intensifiers-2026-10-07',stages:[review],
    structure:[{role:'practice',sources:['L6-review']}]};
  kit.validate(review.exercise);
  window.SpaceWhaleLessonMedia=window.SpaceWhaleLessonMedia||{};
  window.SpaceWhaleLessonMedia[lesson.id]={
    A1M4L6_IMAGE_LOOK_ITEMS:{type:'image',src:null,brief:'Image 1: пальто, похожее на платье; дорогая блузка; шляпа, похожая на кепку; новые костюмы'},
    A1M4L6_IMAGE_CAPS_BAGS:{type:'image',src:null,brief:'Две кепки и три сумки для свободного выбора'}
  };
  window.SpaceWhaleContent=window.SpaceWhaleContent||[];
  const at=window.SpaceWhaleContent.findIndex(item=>item.id===lesson.id);
  if(at<0)window.SpaceWhaleContent.push(lesson);else window.SpaceWhaleContent[at]=lesson;
})();
