(() => {
  'use strict';

  // Public source-code previews. Rendering, feedback and state stay in exercise-kit.js.
  // These are catalog examples, not additional course lessons or replacement media.
  const kit = window.SpaceWhaleExerciseKit;
  const base = (id, kind, title, data = {}) => ({version: 1, id, kind, title, ...data});
  const option = (id, text) => ({id, text});
  const source = (file, pages) => ({file, pages});
  const catalog = pages => source('ENG_Exercise_Catalog_САМЫЙ.pdf', pages);
  const words = pages => source('W_WORDS_САМЫЙ.pdf', pages);
  const repeat = pages => source('P_LISTEN_REPEAT_САМЫЙ.pdf', pages);
  const discovery = pages => source('D_Discovery_R_Rule_САМЫЙ.pdf', pages);
  const speaking = pages => source('S_Speaking_САМЫЙ.pdf', pages);

  const entry = (code, catalogTitle, definition, description, sourceRefs) => ({
    ...definition,
    id: `source-${code}`,
    code,
    catalogFamily: code.charAt(0),
    catalogTitle,
    label: `${code} · ${catalogTitle}`,
    description,
    sourceRefs
  });
  const grouped = (id, title, components) => base(id, 'stage', title, {
    layout: 'grouped',
    exercises: components.map((exercise, index) => ({id: `part-${index + 1}`, exercise}))
  });
  const models = (id, text, highlights) => base(id, 'presentation', 'Examples', {
    blocks: [{type: 'text', role: 'examples', text, ...(highlights ? {highlights} : {})}]
  });
  const matching = (id, title, pairs, optionOrder, layout = 'cards') => base(id, 'matching', title, {
    layout,
    items: pairs.map(([text], index) => ({id: `item-${index + 1}`, text, correctId: `answer-${index + 1}`})),
    options: optionOrder.map(index => option(`answer-${index + 1}`, pairs[index][1]))
  });

  const clothesBase = 'Images/Текущие/assets/lesson-media/a1-2/module-4/lesson-1/images/';
  const clothing = ['hat', 'skirt', 'coat', 'suit', 'blouse', 'sweater'];
  const categoriesSheet = 'Images/Текущие/A.1.2/Module 4/lesson 4 - sosed/e4a4d283-e122-474e-bb12-87c03be1f988.png';
  const travelMeanings = [
    ['luggage', 'bags you take when you travel'],
    ['refund', 'money a shop or company gives back to you'],
    ['route', 'the roads or paths you use to get somewhere'],
    ['passenger', 'a person traveling in a car, bus, train, or plane']
  ];

  const definitions = [
    entry('W01', 'Picture–Word Matching', base('w01', 'matching', 'Match the words with the pictures.', {
      layout: 'picture-word',
      items: clothing.map((word, index) => ({
        id: `picture-${index + 1}`, text: String(index + 1),
        image: `${clothesBase}${word}-cutout.webp`, alt: `A ${word}`,
        correctId: word
      })),
      options: ['suit', 'coat', 'hat', 'blouse', 'sweater', 'skirt'].map(word => option(word, word))
    }), 'Match separate pictures with the words or short phrases they show.', [catalog('8–9'), words('1–2')]),

    entry('W02', 'Word–Translation Matching', matching('w02', 'Match the words with their translations.', [
      ['quiet', 'тихий'],
      ['helpful', 'готовый помочь'],
      ['rude', 'грубый'],
      ['polite', 'вежливый'],
      ['lazy', 'ленивый'],
      ['noisy', 'шумный']
    ], [3, 0, 5, 2, 1, 4]), 'Match English words with one precise Russian meaning for each word.', [catalog('10'), words('3')]),

    entry('W03A', 'Word–Definition Matching — без контекста', matching('w03a', 'Match the words with their meanings.',
      travelMeanings, [2, 0, 3, 1], 'word-definition'),
    'Match words with clear English explanations, without example sentences.', [catalog('11'), words('4')]),

    entry('W03B', 'Word–Definition Matching — с примерами', grouped('w03b', 'Read the examples. Then match the words with their meanings.', [
      models('w03b-examples',
        'We left our luggage at the hotel.\nThe store gave me a refund for the broken lamp.\nThis route is shorter, but there is a lot of traffic.\nThere were only three passengers on the bus.',
        ['luggage', 'refund', 'route', 'passengers']),
      matching('w03b-pairs', 'Match the words with their meanings.', travelMeanings, [1, 3, 0, 2], 'word-definition')
    ]), 'Read a natural example for each new word, then choose its English meaning.', [catalog('11'), words('5')]),

    entry('W04', 'Image Label', base('w04', 'image-label', 'Label the picture.', {
      image: categoriesSheet,
      alt: 'A cabinet, a cup of tea, a hoodie, an apartment building, a pastry, and a shop in six separate areas.',
      items: [
        {id: 'cabinet', x: 17, y: 44, correctId: 'furniture'},
        {id: 'tea', x: 50, y: 44, correctId: 'drink'},
        {id: 'hoodie', x: 83, y: 44, correctId: 'clothing'},
        {id: 'apartment', x: 17, y: 89, correctId: 'building'},
        {id: 'pastry', x: 50, y: 89, correctId: 'food'},
        {id: 'store', x: 83, y: 89, correctId: 'shop'}
      ],
      options: ['shop', 'clothing', 'food', 'furniture', 'building', 'drink'].map(word => option(word, word))
    }), 'Place words at the right objects or areas of one shared picture.', [catalog('12'), words('6')]),

    entry('W05', 'слово и короткое пояснение по общему признаку', matching('w05', 'Who are these people? Match the words and clues.', [
      ['colleague', 'work together'],
      ['neighbor', 'live next door'],
      ['relative', 'part of the same family'],
      ['friend', 'enjoy spending free time together']
    ], [2, 0, 3, 1]), 'Match words with short clues organized around one clear feature.', [words('7')]),

    entry('P01', 'Listen & Repeat — Words', base('p01', 'audio', 'Listen and repeat.', {
      layout: 'listen-repeat',
      audioPending: true,
      items: [
        {id: 'study', text: 'study', example: 'My friends study English at home.'},
        {id: 'learn', text: 'learn', example: 'Jonathan wants to learn English for work.'},
        {id: 'teach', text: 'teach', example: 'Anna and Mark teach English.'},
        {id: 'take-notes', text: 'take notes', example: 'My sister takes notes on her phone.'}
      ]
    }), 'Repeat each new word and then its example sentence; each line has a separate audio control.', [catalog('13'), repeat('1, 3')]),

    entry('P02', 'Listen & Repeat — Grammar / Lexis', base('p02', 'audio', 'Listen and repeat.', {
      layout: 'listen-repeat',
      audioPending: true,
      items: [
        {id: 'offer', text: 'Do you want me to make you a cup of coffee?'},
        {id: 'request', text: 'Could you help me with this bag?'},
        {id: 'response', text: 'Of course. Here you are.'}
      ]
    }), 'Repeat introduced expressions that need pronunciation practice, with one recording per line.', [catalog('32'), repeat('2–3')]),

    entry('D01', 'Complete the Rule', base('d01', 'rule-page', 'Look at the examples and complete the rules.', {
      blocks: [
        {type: 'text', role: 'examples', text: 'I work at home.\nYou work at home.\nHe works at home.\nShe works at home.', highlights: ['work', 'works']},
        {type: 'exercise', id: 'conclusion', exercise: base('d01-conclusion', 'gaps', 'Complete the rules.', {
          inputMode: 'select',
          items: [
            {id: 'base-form', segments: ['After I and you, use ', {id: 'base', options: ['works', 'work'], answers: ['work']}, '.']},
            {id: 's-form', segments: ['After he and she, use ', {id: 's', options: ['work', 'works'], answers: ['works']}, '.']}
          ]
        })}
      ]
    }), 'Use visible examples to complete a short conclusion about meaning or form.', [catalog('22–24'), discovery('3')]),

    entry('D02', 'Meaning Choice', base('d02', 'rule-page', 'Read the examples and choose the meaning.', {
      blocks: [
        {type: 'text', role: 'examples', text: 'Leo is reading now. His book is open.\nKate reads on the train every morning.', highlights: ['is reading now', 'reads', 'every morning']},
        {type: 'exercise', id: 'meaning', exercise: base('d02-meaning', 'choice', 'Choose the meaning.', {
          items: [
            {id: 'now', prompt: '“Leo is reading now.” When does this happen?', options: [option('habit', 'As a habit.'), option('now', 'At this moment.')], correctId: 'now'},
            {id: 'routine', prompt: '“Kate reads on the train every morning.” Is this a regular activity?', options: [option('yes', 'Yes.'), option('no', 'No.')], correctId: 'yes'}
          ]
        })}
      ]
    }), 'Choose the meaning or use of a model in an understandable context.', [catalog('24'), discovery('3')]),

    entry('D03', 'Sort the Examples', grouped('d03', 'Read the examples. Sort them into two groups.', [
      models('d03-examples',
        'I walk to work every day. Today I am taking the bus.\nSam usually cooks at home. He is eating at a café now.',
        ['walk', 'am taking', 'usually cooks', 'is eating']),
      base('d03-groups', 'sort', 'Sort the examples.', {
        groups: [option('now', 'Happening now'), option('routine', 'Regular activities')],
        items: [
          {id: 'today', text: 'Today I am taking the bus.', correctId: 'now'},
          {id: 'daily', text: 'I walk to work every day.', correctId: 'routine'},
          {id: 'usual', text: 'Sam usually cooks at home.', correctId: 'routine'},
          {id: 'cafe', text: 'He is eating at a café now.', correctId: 'now'}
        ]
      })
    ]), 'Group complete examples to notice a specific difference in meaning or form.', [catalog('25'), discovery('4')]),

    entry('D04', 'Match the Examples', grouped('d04', 'Read the examples. Then match the questions and answers.', [
      models('d04-examples',
        'A: What does your brother look like?\nB: He is tall and has dark hair.\nA: What is your brother like?\nB: He is friendly and helpful.',
        ['What does your brother look like?', 'What is your brother like?']),
      matching('d04-pairs', 'Match the questions and answers.', [
        ['What does Eva look like?', 'She is short and has curly hair.'],
        ['What is Eva like?', 'She is polite and helpful.']
      ], [1, 0])
    ]), 'Find correspondences using complete models that make the new relationship visible.', [catalog('26'), discovery('4')]),

    entry('R01', 'Rule — Short Explanation', base('r01', 'rule-page', 'Describe a person’s appearance.', {
      blocks: [
        {type: 'text', text: 'Use be with an adjective to describe a person. Use have or has with a noun to talk about their hair, eyes, or other features.'},
        {type: 'text', role: 'examples', text: 'Eva is tall.\nShe has dark hair.', highlights: ['is', 'has']}
      ]
    }), 'Explain one meaning or construction in connected text, followed by a clear example.', [catalog('21, 27'), discovery('5–7')]),

    entry('R02', 'Rule — Contrast', base('r02', 'rule-page', 'Appearance or personality?', {
      blocks: [
        {type: 'text', text: 'Ask What does someone look like? when you want to know about their appearance. The answer describes their height, hair, or other visible features.'},
        {type: 'text', role: 'examples', text: 'What does Ben look like?\nHe is tall and has short hair.', highlights: ['What does Ben look like?']},
        {type: 'text', text: 'Ask What is someone like? when you want to know about their character. The answer describes how they behave with other people.'},
        {type: 'text', role: 'examples', text: 'What is Ben like?\nHe is friendly and helpful.', highlights: ['What is Ben like?']}
      ]
    }), 'Compare models in the same order and show a clear reason for choosing each one.', [catalog('21, 28'), discovery('5–7')]),

    entry('R03', 'Rule — Visual', base('r03', 'rule-page', 'Build a present simple question.', {
      blocks: [
        {type: 'text', text: 'Put do before I, you, we, or they to ask about a regular activity. Keep the main verb in its base form.'},
        {type: 'rule', formula: 'do + I / you / we / they + base verb + … ?', examples: ['Do you work at home?', 'Do they like coffee?']}
      ]
    }), 'Show a language relationship or word order through a compact labeled schema.', [catalog('21, 29'), discovery('5–7')]),

    entry('R04', 'Rule — Useful Language', base('r04', 'rule-page', 'Ask for help in a store.', {
      blocks: [
        {type: 'text', text: 'Use these phrases to ask an assistant for an item, choose a size, and respond to help.'},
        {type: 'rule', title: 'Ask for an item', examples: ['I’m looking for …', 'Do you have … ?']},
        {type: 'rule', title: 'Ask for a different size', examples: ['Do you have this in a smaller size?', 'Could I try a larger size?']},
        {type: 'rule', title: 'Respond', examples: ['Yes, please.', 'No, thank you.']}
      ]
    }), 'Group useful expressions by what the speaker wants to do in the conversation.', [catalog('30–31'), discovery('5–7')]),

    entry('S01', 'Picture Speaking', kit.speaking({
      id: 's01', title: 'Choose clothes for a trip.',
      image: {image: `${clothesBase}speaking.webp`, alt: 'A coat, sweater, hat, blouse, skirt, and suit.', imageWidth: 1448, imageHeight: 1086},
      task: {
        text: 'You are going away for the weekend. It will be cold outside, and you are also going to a restaurant. Look at the clothes. Tell your friend what you want to take and why.',
        bullets: ['Choose clothes for walking outside.', 'Choose clothes for the restaurant.']
      },
      use: [{
        words: ['coat', 'sweater', 'hat', 'blouse', 'skirt', 'suit'],
        phrases: ['I want to take …', 'I need … because …', 'I think … is good for …']
      }]
    }), 'Use picture details, a concrete situation, and language support to speak for a clear purpose.', [catalog('1–6, 60'), speaking('5–8')]),

    entry('S02', 'Text Speaking', kit.speaking({
      id: 's02', title: 'Choose a place for lunch.', image: null,
      task: {
        text: 'You and your friend have thirty minutes for lunch. The café next door has soup and sandwiches. The pizza place is ten minutes away. Decide where to eat together.',
        bullets: ['Ask your friend what they want to eat.', 'Suggest a place and explain your choice.', 'Agree on one place.']
      },
      use: [{
        words: ['soup', 'sandwich', 'pizza', 'near', 'far'],
        phrases: ['What would you like to … ?', 'Let’s …', 'I’d rather … because …', 'That sounds …']
      }]
    }), 'Speak from a short written situation or question, with appropriate language support.', [catalog('7, 60'), speaking('3–4, 7–8')]),

    entry('Q01', 'Questions & Discussion', base('q01', 'presentation', 'Talk about shopping.', {
      blocks: [
        {type: 'text', text: 'Where do you usually buy clothes?\nWhat is more important to you: price or comfort? Why?\nDo you prefer shopping alone or with someone?\nAsk your teacher one question about shopping.'}
      ]
    }), 'Share experience or opinions, explain a choice, and ask the other person a question.', [catalog('49')]),

    entry('Q02', 'Рассказ по выполненному упражнению', base('q02', 'stage', 'Complete the sentences. Then tell Alex’s story.', {
      progressive: true,
      requireCheckBeforeNext: true,
      exercises: [
        {id: 'facts', exercise: matching('q02-facts', 'Match the sentence halves.', [
          ['On Saturday, Alex visited his', 'sister.'],
          ['He went there by', 'train.'],
          ['After lunch, they walked in the', 'park.'],
          ['Alex went home at', 'six.']
        ], [2, 0, 3, 1])},
        {id: 'story', exercise: base('q02-story', 'presentation', 'Tell Alex’s story.', {
          blocks: [{type: 'text', text: 'Use the sentences you completed to tell Alex’s story. Start with “On Saturday, Alex …”. Connect the events with first, then, and after lunch.'}]
        })}
      ]
    }), 'Use the facts or results of the completed task to make a short connected spoken account.', [catalog('50')])
  ];

  definitions.forEach(definition => kit.validate(definition));
  window.SpaceWhaleSourceCoreTemplates = definitions;
})();
