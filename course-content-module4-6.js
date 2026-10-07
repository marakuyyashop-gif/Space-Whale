(() => {
  'use strict';
  const kit = window.SpaceWhaleExerciseKit;
  const imageBase='Images/A.1.2/Module 4/lesson 4 - sosed/';
  const pictures={
    A1M4L6_IMAGE_LOOK_ITEMS:{image:imageBase+'72d126d7-79c8-4a06-9808-1d1dfa46c50c.png',imageWidth:1448,imageHeight:1086,alt:'A coat and dress, a blouse and price tag, a hat and cap, and new suits'},
    A1M4L6_IMAGE_INTENSIFIERS:{image:imageBase+'6ef96aae-171b-4fdb-9bcd-7fc09b50e839.png',imageWidth:1536,imageHeight:1024,alt:'A hat, blouse, sweater, colorful bag, coat and suit'},
    A1M4L6_IMAGE_BAGS:{image:imageBase+'423dbafa-41e8-436c-b872-7e2033ed4ccf.png',imageWidth:1448,imageHeight:1086,alt:'Nina, Marta and Eva looking at four bags'}
  };
  const picture=assetId=>pictures[assetId]?{assetId,...pictures[assetId]}:{imagePending:true,assetId};
  const E = (id, kind, title, extra = {}) => ({version:1, id, kind, title, ...extra});
  const seq = (id, title, exercises) => E(id, 'stage', title, {
    progressive:true, requireCheckBeforeNext:true, unifiedProgression:true,
    exercises:exercises.map(exercise => ({id:exercise.id, exercise}))
  });
  const select = (id, title, instruction, rows) => E(id, 'gaps', title, {inputMode:'select', instruction,
    items:rows.map(([before, answer, after, options], i) => ({id:String(i+1), segments:[before,{id:'g'+(i+1),answers:[answer],options},after]}))});
  const multiple = (id, title, options, correctIds) => E(id, 'choice', title, {
    multiple:true,
    items:[{id:'1', prompt:'Отметь все подходящие фразы.', options:options.map((text,i)=>({id:String(i+1),text})), correctIds}]
  });
  const talk = (id, title, text, use, assetId) => kit.speaking({id,title,
    image:picture(assetId),task:{text},use});
  const imageTask = (id, title, instruction, assetId, exercise) => E(id,'stage',title,{
    layout:'grouped',instruction,exercises:[
      {id:id+'-image',exercise:E(id+'-image','presentation',title,{blocks:[{type:'image',...picture(assetId)}]})},
      {id:exercise.id,exercise}
    ]
  });
  const order = (id, bank, answer, punctuation='?') => E(id,'order','Make the sentences and questions.',{
    sentenceCase:true,sentenceSuffix:punctuation,
    tokens:bank.map((text,i)=>({id:String(i),text})),
    correctOrder:answer.map(text=>String(bank.indexOf(text)))
  });
  const lookOptions=['look','looks','look like','looks like'];
  const parts = [
    seq('L6-review-appearance','Part 1 · Look / look like',[
      select('L6-look-dropdown','Choose the correct option.','',[
        ['This dress ','looks like',' my old dress.',lookOptions],
        ['Your new blouse ','looks',' really expensive.',lookOptions],
        ['These hats ','look like',' my father’s old hats.',lookOptions],
        ['The black suit ','looks',' very new.',lookOptions],
        ['My coat ','looks like',' a long dress.',lookOptions],
        ['These sweaters ','look',' too big for me.',lookOptions],
        ['The colorful bags ','look',' really pretty.',lookOptions],
        ['This cap ','looks like',' my brother’s old hat.',lookOptions]
      ]),
      E('L6-picture-prompt','stage','Say what they look like.',{layout:'grouped',exercises:[
        {id:'L6-look-picture',exercise:talk('L6-look-picture','Say what they look like.',
          'Look at the picture. Say one sentence for each item.',
          [{words:lookOptions}], 'A1M4L6_IMAGE_LOOK_ITEMS')},
        {id:'L6-look-picture-answers',exercise:E('L6-look-picture-answers','presentation','Say what they look like.',{
          blocks:[{type:'disclosure',title:'Possible answers',role:'possible-answers',text:[
            '1. The coat looks like a dress.',
            '2. The blouse looks expensive.',
            '3. The hat looks like a cap.',
            '4. The suits look new.'
          ].join('\n')}]})}
      ]})
    ]),
    seq('L6-intensifiers','Part 2 · Very / really / so / too / a little / a bit',[
      multiple('L6-intensifiers-positive','Где качество предмета выражено сильно и положительно?',[
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
      ],['1','2','5']),
      imageTask('L6-intensifiers-picture','Choose the correct option.',
        'Look at the picture and complete the sentences.','A1M4L6_IMAGE_INTENSIFIERS',
        select('L6-intensifiers-dropdown','Choose the correct option.','',[
          ['This hat is ','too',' strange for me.',['a little','too','so']],
          ['This blouse is ','so',' pretty!',['too','a bit','so']],
          ['This sweater is ','a little',' dark.',['so','a little','too']],
          ['This bag is ','really',' colorful.',['too','really','a bit']],
          ['This coat is ','a bit',' big.',['a bit','so','too']],
          ['This suit is ','very',' simple.',['too','a little','very']]
        ]))
    ]),
    seq('L6-review-choice','Part 3 · Which / why · one / ones · it / them',[
      select('L6-question-answer-dropdown','Choose the best answer.','',[
        ['Which one do you like?\n','I like the black one.','',['Because it’s pretty.','I like the black one.','I like the black ones.']],
        ['Which ones do you like?\n','I like the blue and red ones.','',['I like the blue and red ones.','Because they’re simple.','I like the blue one.']],
        ['Why do you like it?\n','Because it’s simple.','',['I like this one.','Because they’re colorful.','Because it’s simple.']],
        ['Why do you like them?\n','Because they’re colorful.','',['Because they’re colorful.','I like the colorful ones.','Because it’s colorful.']],
        ['What do you think?\n','I think the bag looks pretty.','',['Because it’s pretty.','I think the bag looks pretty.','I like these ones.']],
        ['Which one does Nina like?\n','She likes the black one.','',['Because she likes black.','She likes the black ones.','She likes the black one.']]
      ]),
      seq('L6-word-order','Make the sentences and questions.',[
        order('L6-order-questions-1',['one','which','do','you','like'],['which','one','do','you','like']),
        order('L6-order-why-it',['it','why','do','you','like'],['why','do','you','like','it']),
        order('L6-order-which-mia',['ones','which','does','Mia','like'],['which','ones','does','Mia','like']),
        order('L6-order-why-them',['them','why','does','she','like'],['why','does','she','like','them']),
        order('L6-order-what-think',['do','what','you','think'],['what','do','you','think']),
        order('L6-order-think-bag',['I','think','this','bag','looks','pretty'],['I','think','this','bag','looks','pretty'],'.')
      ]),
      talk('L6-bags-picture','Which bags do they like?',
        'Look at the picture. Answer the questions.\n\nNina — Pretty\nMarta — Colorful\nNina — Simple',[{phrases:[
          '1. Which one does Nina like? Why?',
          '2. Which one does Marta like? Why?',
          '3. Which one does Eva like? Why?'
        ]}],'A1M4L6_IMAGE_BAGS')
    ]),
    seq('L6-review-people','Part 4 · Character and appearance',[
      select('L6-character-question-dropdown','Choose the correct question.','',[
        ['Ты хочешь узнать, какая Nina по характеру.\n','What is Nina like?','',['What does Nina look like?','What is Nina like?','What does Nina like?']],
        ['Ты хочешь узнать, как Leo выглядит.\n','What does Leo look like?','',['What is Leo like?','What does Leo like?','What does Leo look like?']],
        ['Ты хочешь узнать, какая Eva по характеру.\n','What is Eva like?','',['What is Eva like?','What does Eva look like?','What does Eva like?']],
        ['Ты хочешь узнать, как Max выглядит.\n','What does Max look like?','',['What does Max like?','What does Max look like?','What is Max like?']],
        ['Ты хочешь узнать у человека, какой он по характеру.\n','What are you like?','',['What do you look like?','What do you like?','What are you like?']],
        ['Ты хочешь узнать у человека, как он выглядит.\n','What do you look like?','',['What do you look like?','What are you like?','What do you like?']]
      ]),
      talk('L6-people-picture','Describe the people.',
        'Look at the picture. Answer both questions about each person.',
        ['Nina','Leo','Eva','Max'].map(name=>({words:[name],phrases:[`What is ${name} like?`,`What does ${name} look like?`]})),
        'A1M4L6_IMAGE_PEOPLE')
    ]),
    seq('L6-review-category','Part 5 · Category or similarity',[
      E('L6-category-typed','gaps','Complete the sentences.',{
        inputMode:'text',instruction:'Впиши подходящую конструкцию: объясни, к какой категории относится предмет или на что он похож.',
        items:[
          ['A muffin is ',' food.'],['A sofa is ',' furniture.'],['A coat is ',' clothing.'],
          ['A supermarket is ',' shop.'],['A house is ',' building.'],
          ['A muffin is ',' a small cake.'],['A cap is ',' a hat.'],['A sofa is ',' a big armchair.']
        ].map(([before,after],i)=>({id:String(i+1),segments:[before,{id:'g'+(i+1),answers:i<5?['a kind of','a type of','a sort of']:['like']},after]}))
      }),
      E('L6-category-correction','writing','Correct the mistakes.',{
        instruction:'В каждом предложении одна ошибка.',responseMode:'accepted',
        items:[
          ['A sofa is kind of furniture.','A sofa is a kind of furniture.'],
          ['Tea is a type drink.','Tea is a type of drink.'],
          ['A coat is a sort of a clothing.','A coat is a sort of clothing.'],
          ['A muffin is like small cake.','A muffin is like a small cake.'],
          ['A house is a type of a building.','A house is a type of building.'],
          ['A cap is like hat.','A cap is like a hat.']
        ].map(([prompt,answer],i)=>({id:String(i+1),prompt,acceptedAnswers:[answer,answer.slice(0,-1)]}))
      }),
      E('L6-explain-short-answer','writing','Explain the words.',{
        instruction:'Write a short answer.',responseMode:'open',
        items:['What is a muffin?','What is tea?','What is a sofa?','What is a coat?','What is a house?','What is a supermarket?']
          .map((prompt,i)=>({id:String(i+1),prompt}))
      })
    ])
  ];
  const review={menu:'Повторение',navigationTitle:'Повторение',section:'tasks',
    guide:{time:'30 min',teacherNotes:'Exercise 12: Accept a kind of / a type of / a sort of where the student explains a category. For muffin, It’s like a small cake. is also acceptable.'},
    exercise:seq('L6-review','Review the module',parts)};
  const lesson={id:'a1-2-w4-l6',level:'A1.2',whale:4,
    summary:'Повторяем описание вещей и людей, выбор, причины и объяснение незнакомых предметов.',
    grammar:'look / look like; very / really / so / too / a little / a bit; one / ones; it / them',
    constructions:'Which / why · What is … like? · What does … look like? · a kind/type/sort of · like',
    durationMinutes:30,contentVersion:'review-pictures-2026-10-07',stages:[review],
    structure:[{role:'practice',sources:['L6-review']}]};
  kit.validate(review.exercise);
  window.SpaceWhaleLessonMedia=window.SpaceWhaleLessonMedia||{};
  window.SpaceWhaleLessonMedia[lesson.id]={
    A1M4L6_IMAGE_LOOK_ITEMS:{type:'image',src:pictures.A1M4L6_IMAGE_LOOK_ITEMS.image,width:pictures.A1M4L6_IMAGE_LOOK_ITEMS.imageWidth,height:pictures.A1M4L6_IMAGE_LOOK_ITEMS.imageHeight,brief:'Image 1 · Exercise 2: coat like a dress; expensive blouse; hat like a cap; new suits'},
    A1M4L6_IMAGE_INTENSIFIERS:{type:'image',src:pictures.A1M4L6_IMAGE_INTENSIFIERS.image,width:pictures.A1M4L6_IMAGE_INTENSIFIERS.imageWidth,height:pictures.A1M4L6_IMAGE_INTENSIFIERS.imageHeight,brief:'Image 2 · Exercise 4: hat too strange; blouse so pretty; sweater a little dark; bag really colorful; coat a bit big; suit very simple'},
    A1M4L6_IMAGE_BAGS:{type:'image',src:pictures.A1M4L6_IMAGE_BAGS.image,width:pictures.A1M4L6_IMAGE_BAGS.imageWidth,height:pictures.A1M4L6_IMAGE_BAGS.imageHeight,brief:'Image 3 · Exercise 7: Nina, Marta, Eva and their bag preferences'},
    A1M4L6_IMAGE_PEOPLE:{type:'image',src:null,brief:'Image 4 · Exercise 9: Nina, Leo, Eva, Max; character and appearance'}
  };
  window.SpaceWhaleContent=window.SpaceWhaleContent||[];
  const at=window.SpaceWhaleContent.findIndex(item=>item.id===lesson.id);
  if(at<0)window.SpaceWhaleContent.push(lesson);else window.SpaceWhaleContent[at]=lesson;
})();
