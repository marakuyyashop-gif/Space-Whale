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
  const wordMeanings = Array.from({length: 4}, (_, index) => [
    `[Word ${index + 1}]`, `[Definition Word ${index + 1}]`
  ]);

  const definitions = [
    entry('W01', 'Picture–Word Matching', base('w01', 'matching', 'Match the words with the pictures.', {
      layout: 'picture-word',
      items: clothing.map((word, index) => ({
        id: `picture-${index + 1}`, text: String(index + 1),
        imagePending: true, alt: `[Image for Word ${index + 1}]`,
        sourceArtwork: {image: `${clothesBase}${word}-cutout.webp`, alt: `A ${word}`},
        correctId: word
      })),
      options: ['suit', 'coat', 'hat', 'blouse', 'sweater', 'skirt'].map(word => option(word, `[Word ${clothing.indexOf(word) + 1}]`))
    }), 'Match separate pictures with the words or short phrases they show.', [catalog('8–9'), words('1–2')]),

    entry('W02', 'Word–Translation Matching', matching('w02', 'Match the words with their translations.',
      Array.from({length: 6}, (_, index) => [`[Word ${index + 1}]`, `[Translation Word ${index + 1}]`]),
      [3, 0, 5, 2, 1, 4], 'word-translation'), 'Match English words with one precise Russian meaning for each word.', [catalog('10'), words('3')]),

    entry('W03A', 'Word–Definition Matching — без контекста', matching('w03a', 'Match the words with their meanings.',
      wordMeanings, [2, 0, 3, 1], 'word-definition'),
    'Match words with clear English explanations, without example sentences.', [catalog('11'), words('4')]),

    entry('W03B', 'Word–Definition Matching — с примерами', grouped('w03b', 'Read the examples. Then match the words with their meanings.', [
      models('w03b-examples',
        '[Example beginning 1] [Word 1] [Example ending 1]\n[Example beginning 2] [Word 2] [Example ending 2]\n[Example beginning 3] [Word 3] [Example ending 3]\n[Example beginning 4] [Word 4] [Example ending 4]',
        ['[Word 1]', '[Word 2]', '[Word 3]', '[Word 4]']),
      matching('w03b-pairs', 'Match the words with their meanings.', wordMeanings, [1, 3, 0, 2], 'word-definition')
    ]), 'Read a natural example for each new word, then choose its English meaning.', [catalog('11'), words('5')]),

    entry('W04', 'Image Label', base('w04', 'image-label', 'Label the picture.', {
      imagePending: true, imageWidth: 1448, imageHeight: 1086,
      alt: '[Image]',
      sourceArtwork: {image: categoriesSheet, alt: 'A cabinet, a cup of tea, a hoodie, an apartment building, a pastry, and a shop in six separate areas.'},
      items: [
        {id: 'cabinet', x: 17, y: 9, prompt: '[Image target for Word 1]', correctId: 'furniture'},
        {id: 'tea', x: 50, y: 46, prompt: '[Image target for Word 2]', correctId: 'drink'},
        {id: 'hoodie', x: 67, y: 9, prompt: '[Image target for Word 3]', correctId: 'clothing'},
        {id: 'apartment', x: 17, y: 91, prompt: '[Image target for Word 4]', correctId: 'building'},
        {id: 'pastry', x: 50, y: 91, prompt: '[Image target for Word 5]', correctId: 'food'},
        {id: 'store', x: 83, y: 91, prompt: '[Image target for Word 6]', correctId: 'shop'}
      ],
      options: ['shop', 'clothing', 'food', 'furniture', 'building', 'drink'].map(word => {
        const number = ['furniture', 'drink', 'clothing', 'building', 'food', 'shop'].indexOf(word) + 1;
        return {...option(word, `[Word ${number}]`), translation: `[Translation Word ${number}]`};
      })
    }), 'Place words at the right objects or areas of one shared picture.', [catalog('12'), words('6')]),

    entry('W05', 'слово и короткое пояснение по общему признаку', matching('w05', 'Match the words and clues.',
      Array.from({length: 4}, (_, index) => [`[Word ${index + 1}]`, `[Clue for Word ${index + 1}]`]),
      [2, 0, 3, 1], 'word-definition'), 'Match words with short clues organized around one clear feature.', [words('7')]),

    entry('P01', 'Listen & Repeat — Words', base('p01', 'audio', 'Listen and repeat.', {
      layout: 'listen-repeat',
      audioPending: true,
      items: [
        {id: 'study', text: '[Word 1]', example: '[Sentence with Word 1]'},
        {id: 'learn', text: '[Word 2]', example: '[Sentence with Word 2]'},
        {id: 'teach', text: '[Word 3]', example: '[Sentence with Word 3]'},
        {id: 'take-notes', text: '[Word 4]', example: '[Sentence with Word 4]'}
      ]
    }), 'Repeat each word and its example sentence; the number of word–example pairs follows the word list.', [catalog('13'), repeat('1, 3')]),

    entry('P02', 'Listen & Repeat — Grammar / Lexis', base('p02', 'audio', 'Listen and repeat.', {
      layout: 'listen-repeat',
      audioPending: true,
      items: [
        {id: 'offer', text: '[Lexical chunk 1]'},
        {id: 'request', text: '[Lexical chunk 2]'},
        {id: 'response', text: '[Lexical chunk 3]'}
      ]
    }), 'Repeat introduced expressions that need pronunciation practice, with one recording per line.', [catalog('32'), repeat('2–3')]),

    entry('D01', 'Complete the Rule', base('d01', 'rule-page', 'Look at the examples and complete the rules.', {
      blocks: [
        {type: 'text', role: 'examples',
          text: '[Example beginning 1] [Target structure 1] [Example ending 1]\n[Example beginning 2] [Target structure 2] [Example ending 2]\n[Example beginning 3] [Target structure 3] [Example ending 3]\n[Example beginning 4] [Target structure 4] [Example ending 4]',
          highlights: ['[Target structure 1]', '[Target structure 2]', '[Target structure 3]', '[Target structure 4]']},
        {type: 'exercise', id: 'conclusion', exercise: base('d01-conclusion', 'gaps', 'Complete the rules.', {
          inputMode: 'select',
          items: [
            {id: 'base-form', segments: ['[Rule beginning 1] ', {id: 'base', options: ['[Rule ending 2]', '[Rule ending 1]', '[Rule ending 3]'], answers: ['[Rule ending 1]']}, '.']},
            {id: 's-form', segments: ['[Rule beginning 2] ', {id: 's', options: ['[Rule ending 1]', '[Rule ending 2]', '[Rule ending 3]'], answers: ['[Rule ending 2]']}, '.']}
          ]
        })}
      ]
    }), 'Use visible examples to complete a short conclusion about meaning or form.', [catalog('22–24'), discovery('3')]),

    entry('D02', 'Meaning Choice', base('d02', 'rule-page', 'Read the examples and choose the meaning.', {
      blocks: [
        {type: 'text', role: 'examples',
          text: '[Example beginning 1] [Target structure 1] [Example ending 1]\n[Example beginning 2] [Target structure 2] [Example ending 2]',
          highlights: ['[Target structure 1]', '[Target structure 2]']},
        {type: 'exercise', id: 'meaning', exercise: base('d02-meaning', 'choice', 'Choose the meaning.', {
          items: [
            {id: 'now', prompt: '[Question about Example 1]', options: [option('habit', '[Meaning 1A]'), option('now', '[Meaning 1B]')], correctId: 'now'},
            {id: 'routine', prompt: '[Question about Example 2]', options: [option('yes', '[Meaning 2A]'), option('no', '[Meaning 2B]')], correctId: 'yes'}
          ]
        })}
      ]
    }), 'Choose the meaning or use of a model in an understandable context.', [catalog('24'), discovery('3')]),

    entry('D03', 'Sort the Examples', grouped('d03', 'Read the examples. Sort them into two groups.', [
      models('d03-examples',
        '[Sentence 1] [Sentence 2]\n[Sentence 3] [Sentence 4]'),
      base('d03-groups', 'sort', 'Sort the examples.', {
        groups: [option('now', '[Group 1]'), option('routine', '[Group 2]')],
        items: [
          {id: 'today', text: '[Sentence 2]', correctId: 'now'},
          {id: 'daily', text: '[Sentence 1]', correctId: 'routine'},
          {id: 'usual', text: '[Sentence 3]', correctId: 'routine'},
          {id: 'cafe', text: '[Sentence 4]', correctId: 'now'}
        ]
      })
    ]), 'Group complete examples to notice a specific difference in meaning or form.', [catalog('25'), discovery('4')]),

    entry('D04', 'Match the Examples', grouped('d04', 'Read the examples. Then match the questions and answers.', [
      models('d04-examples',
        '[Question beginning 1] [Target structure 1] [Question ending 1]\n[Answer 1]\n[Question beginning 2] [Target structure 2] [Question ending 2]\n[Answer 2]',
        ['[Target structure 1]', '[Target structure 2]']),
      matching('d04-pairs', 'Match the questions and answers.', [
        ['[Question 1]', '[Answer 1]'],
        ['[Question 2]', '[Answer 2]']
      ], [1, 0], 'stacked-text')
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
      id: 's01', title: '[Task]',
      image: {imagePending: true, alt: '[Image]', imageWidth: 1448, imageHeight: 1086},
      task: {
        text: '[Situation]',
        bullets: ['[Task 1]', '[Task 2]']
      },
      use: [{
        words: ['[Word 1]', '[Word 2]', '[Word 3]', '[Word 4]', '[Word 5]', '[Word 6]'],
        phrases: ['[Lexical chunk 1]', '[Lexical chunk 2]', '[Lexical chunk 3]']
      }]
    }), 'Use picture details, a concrete situation, and language support to speak for a clear purpose.', [catalog('1–6, 60'), speaking('5–8')]),

    entry('S02', 'Text Speaking', kit.speaking({
      id: 's02', title: '[Task]', image: null,
      task: {
        text: '[Situation]',
        bullets: ['[Task 1]', '[Task 2]', '[Task 3]']
      },
      use: [{
        words: ['[Word 1]', '[Word 2]', '[Word 3]', '[Word 4]', '[Word 5]'],
        phrases: ['[Lexical chunk 1]', '[Lexical chunk 2]', '[Lexical chunk 3]', '[Lexical chunk 4]']
      }]
    }), 'Speak from a short written situation or question, with appropriate language support.', [catalog('7, 60'), speaking('3–4, 7–8')]),

    entry('Q01', 'Questions & Discussion', base('q01', 'presentation', 'Discuss the questions.', {
      blocks: [
        {type: 'text', text: '[Question 1]\n[Question 2]\n[Question 3]\n[Follow-up question]'}
      ]
    }), 'Share experience or opinions, explain a choice, and ask the other person a question.', [catalog('49')]),

    entry('Q02', 'Рассказ по выполненному упражнению', base('q02', 'stage', 'Choose the correct options.', {
      optionalFollowUp: {title: '[Follow-up task]', prompt: '[Optional speaking task based on the completed sentences]'},
      exercises: [
        {id: 'facts', exercise: base('q02-facts', 'gaps', 'Choose the correct options.', {
          inputMode: 'select',
          items: Array.from({length: 4}, (_, index) => ({
            id: `item-${index + 1}`,
            segments: [`[Sentence beginning ${index + 1}] `, {
              id: `item-${index + 1}`,
              answers: [`[Sentence ending ${index + 1}]`],
              options: [3, 1, 4, 2].map(number => `[Sentence ending ${number}]`)
            }]
          }))
        })}
      ]
    }), 'Choose sentence endings; the completed results may support a separately authored optional speaking task.', [catalog('50')])
  ];

  definitions.forEach(definition => kit.validate(definition));
  window.SpaceWhaleSourceCoreTemplates = definitions;
})();
