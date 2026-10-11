(function () {
  'use strict';
  const kit = window.SpaceWhaleExerciseKit;
  if (!kit) return;
  const id = 'a1-2-w5-l5', prefix = 'A1M5L5', media = {};
  const E = (name, kind, title, extra = {}) => ({version: 1, id: prefix + '-' + name, kind, title, ...extra});
  const stage = (menu, time, exercise, teacherNotes = '') => ({menu, navigationTitle: menu, section: 'tasks', guide: {time: time + ' min', teacherNotes}, exercise});
  const uploadedImages = {
  "W01_A": "Images/A.1.2/Module 4/lesson 4 - sosed/biba_boba_a_claw_hair_clip_holding_twisted_hair_at_the_back__2b76a7ce-8697-4fa0-89f0-69429806fd69_10.png",
  "W01_B": "Images/A.1.2/Module 4/lesson 4 - sosed/biba_boba_one_simple_necklace_isolated_object_loosely_curved__957d6f40-bfaa-4abc-afbf-e2f27c1282ec_3.png",
  "W01_C": "Images/A.1.2/Module 4/lesson 4 - sosed/biba_boba_one_simple_ring_isolated_object_three-quarter_view__84e6a664-01bd-4020-9779-dd7cde51ab40_9.png",
  "W01_D": "Images/A.1.2/Module 4/lesson 4 - sosed/biba_boba_one_fabric_hair_tie_isolated_object_soft_irregular__907f6b9b-1c1d-4a44-ad13-483a2c80674e_3.png",
  "W01_E": "Images/A.1.2/Module 4/lesson 4 - sosed/biba_boba_one_hanging_earring_isolated_object_clear_hook_and_91388a1e-2d06-487a-a7c7-58e3ac052a85_21.png",
  "W01_F": "Images/A.1.2/Module 4/lesson 4 - sosed/biba_boba_one_simple_bracelet_isolated_object_slightly_irreg_eb029336-ab4e-48ce-a3d7-53dd0c5fe574_14.png",
  "E04A_1": "Images/A.1.2/Module 4/lesson 4 - sosed/biba_boba_one_simple_necklace_isolated_object_loosely_curved__957d6f40-bfaa-4abc-afbf-e2f27c1282ec_3.png",
  "E04A_2": "Images/A.1.2/Module 4/lesson 4 - sosed/biba_boba_one_fabric_hair_tie_isolated_object_soft_irregular__907f6b9b-1c1d-4a44-ad13-483a2c80674e_3.png",
  "E04A_3": "Images/A.1.2/Module 4/lesson 4 - sosed/biba_boba_one_simple_ring_isolated_object_three-quarter_view__84e6a664-01bd-4020-9779-dd7cde51ab40_9.png",
  "E04A_4": "Images/A.1.2/Module 4/lesson 4 - sosed/biba_boba_one_simple_bracelet_isolated_object_slightly_irreg_eb029336-ab4e-48ce-a3d7-53dd0c5fe574_14.png",
  "E04A_5": "Images/A.1.2/Module 4/lesson 4 - sosed/biba_boba_a_claw_hair_clip_holding_twisted_hair_at_the_back__2b76a7ce-8697-4fa0-89f0-69429806fd69_10.png",
  "E04A_6": "Images/A.1.2/Module 4/lesson 4 - sosed/biba_boba_one_hanging_earring_isolated_object_clear_hook_and_91388a1e-2d06-487a-a7c7-58e3ac052a85_21.png",
  "L03_Q1_B": "Images/A.1.2/Module 4/lesson 4 - sosed/biba_boba_one_hanging_earring_isolated_object_clear_hook_and_91388a1e-2d06-487a-a7c7-58e3ac052a85_21.png",
  "L03_Q1_C": "Images/A.1.2/Module 4/lesson 4 - sosed/biba_boba_one_simple_necklace_isolated_object_loosely_curved__957d6f40-bfaa-4abc-afbf-e2f27c1282ec_3.png"
};
  const pendingImage = (name, brief) => {
    const assetId = prefix + '_' + name;
    const image = uploadedImages[name];
    media[assetId] = {type: 'image', src: image || null, brief};
    return image ? {image, assetId, imageWidth: 512, imageHeight: 512, alt: 'Picture'} : {imagePending: true, assetId};
  };
  const pendingAudio = (name, script) => {
    const audioId = prefix + '_' + name;
    media[audioId] = {type: 'audio', src: null, script};
    return {audioPending: true, audioId};
  };
  // Speaking content is deferred by the owner. Only the existing hidden image
  // slot is reserved; no scenario, language scaffold or artwork brief is carried over.
  const emptySlot = (name, title) => E(name, 'presentation', title, {
    blocks: [{type: 'image', imagePending: true, assetId: prefix + '_' + name + '_DEFERRED'}]
  });
  const ruleBlocks = [
    {
      "type": "text",
      "text": "Когда ищем вещь, полезно назвать её, уточнить, что видит собеседник, и сообщить, когда вещь нашлась. Для этого в английском есть несколько коротких фраз."
    },
    {
      "type": "text",
      "title": "Сообщаем, что ищем",
      "text": "Look for означает «искать». Если поиск происходит сейчас, используем знакомое Present Continuous. После for называем предмет поиска:",
      "highlights": [
        "Look for",
        "for"
      ]
    },
    {
      "type": "text",
      "text": "I’m looking for my ring. — Я ищу своё кольцо.",
      "highlights": [
        "looking for my ring"
      ]
    },
    {
      "type": "text",
      "text": "Find означает «найти». Фразой I can’t find… сообщаем, что пока не можем найти вещь:",
      "highlights": [
        "Find",
        "I can’t find…"
      ]
    },
    {
      "type": "text",
      "text": "I can’t find my ring. — Я не могу найти своё кольцо.",
      "highlights": [
        "can’t find my ring"
      ]
    },
    {
      "type": "text",
      "text": "Эти фразы можно использовать вместе: первая называет действие, а вторая объясняет, почему нужна помощь."
    },
    {
      "type": "text",
      "title": "Уточняем, что ищет собеседник",
      "text": "Если предмет ещё неизвестен, спрашиваем:"
    },
    {
      "type": "text",
      "text": "What are you looking for? — Что ты ищешь?",
      "highlights": [
        "What are you looking for?"
      ]
    },
    {
      "type": "text",
      "text": "Если хотим проверить своё предположение, называем предмет в вопросе:"
    },
    {
      "type": "text",
      "text": "Are you looking for your bracelet? — Ты ищешь свой браслет?",
      "highlights": [
        "Are you looking for your bracelet?"
      ]
    },
    {
      "type": "text",
      "text": "На такой вопрос можно ответить Yes, I am или уточнить: No, I’m looking for my ring. В обоих вопросах сохраняем for.",
      "highlights": [
        "Yes, I am",
        "No, I’m looking for my ring",
        "for"
      ]
    },
    {
      "type": "text",
      "title": "Спрашиваем, видна ли вещь",
      "text": "Can you see my ring? — Ты видишь моё кольцо?",
      "highlights": [
        "Can you see my ring?"
      ]
    },
    {
      "type": "text",
      "text": "I can see it. — Я его вижу.\nI can’t see it. — Я его не вижу.",
      "highlights": [
        "I can see it.",
        "I can’t see it."
      ]
    },
    {
      "type": "text",
      "text": "Когда вещь найдена, указываем на неё знакомой фразой Here it is! — «Вот она!»",
      "highlights": [
        "Here it is!"
      ]
    }
  ];
  const script = "Anna: Kate, are you ready?\nKate: No. I can’t find my earring.\nAnna: Are you looking for this small earring?\nKate: No, that’s my sister’s. My earring is big.\nAnna: Is it on the bed?\nKate: No, my necklace is there.\nAnna: Can you see your earring under your hairbrush?\nKate: Oh, yes! Here it is. Thank you!";
  const vocabularyItems = [
    {
      "number": 1,
      "text": "Can I borrow your [n…]? It looks great with my dress.",
      "answer": "necklace",
      "picture": "A necklace shown with a dress; the necklace is the clearly highlighted target."
    },
    {
      "number": 2,
      "text": "I’m cooking, and my hair is very long. Do you have a [h…]?",
      "answer": "hair tie",
      "picture": "Clearly recognizable elastic hair tie; a small cooking/long-hair context may accompany it, with the accessory visually prominent."
    },
    {
      "number": 3,
      "text": "I like this [r…], but it’s too small for me.",
      "answer": "ring",
      "picture": "A ring; optionally a hand trying the ring without text labels."
    },
    {
      "number": 4,
      "text": "I like the [b…] next to your watch. Is it new?",
      "answer": "bracelet",
      "picture": "A close view of a bracelet worn beside a watch on the same wrist; bracelet visually prominent, with no written body-part labels."
    },
    {
      "number": 5,
      "text": "It’s windy today. Anna is putting a [h…] in her hair.",
      "answer": "hair clip",
      "picture": "Anna holding or placing a clearly recognizable rigid clip in her hair; enough detail to distinguish it from an elastic hair tie."
    },
    {
      "number": 6,
      "text": "This [e…] is really pretty. How much is a pair?",
      "answer": "earring",
      "picture": "One earring shown clearly, with shop context optional; retain the singular target image."
    }
  ];
  const writingKeys = [
    [
      "What are you looking for?"
    ],
    [
      "Are you looking for your bracelet?"
    ],
    [
      "Can you see my earring?"
    ]
  ];
  const oralExamples = [
    [
      "I’m looking for my ring. I can’t find it.",
      "I am looking for my ring. I cannot find it.",
      "I’m looking for my ring. I can’t find my ring."
    ],
    [
      "My ring is small."
    ],
    [
      "Can you see my ring?",
      "Can you see it?"
    ],
    [
      "Here it is!"
    ]
  ];

  const opening = emptySlot('SPEAKING_OPENING', 'Speaking');
  const final = emptySlot('SPEAKING_FINAL', 'Final Speaking');
  const words = ['ring', 'bracelet', 'earring', 'hair tie', 'hair clip', 'necklace'];
  const wordCards = [
    ['A', 'hair clip', 'A clearly hinged hair clip.'],
    ['B', 'necklace', 'A necklace with a chain and pendant.'],
    ['C', 'ring', 'A finger ring at a clear realistic scale, with a small hand inset if necessary.'],
    ['D', 'hair tie', 'A soft elastic hair tie, clearly distinct from a metal bracelet.'],
    ['E', 'earring', 'One earring with a recognizable hook or post; not a pair.'],
    ['F', 'bracelet', 'A bracelet with a clasp, clearly distinct from a ring and hair tie.']
  ];
  const wordMatch = E('W01', 'matching', 'Match the words to the pictures.', {
    layout: 'picture-word',
    items: wordCards.map(([label, word, brief]) => ({id: label, text: label, correctId: word,
      ...pendingImage('W01_' + label, brief + ' One independent card on a plain cream background, modern adult accessory, no written label.')})),
    options: ['hair tie', 'necklace', 'bracelet', 'ring', 'hair clip', 'earring'].map(text => ({id: text, text}))
  });
  const examples = [
    'This ring is my mother’s.',
    'Anna’s bracelet is on the table.',
    'I like this earring.',
    'Do you have a hair tie?',
    'My sister has a new hair clip.',
    'Your necklace is really pretty.'
  ];
  const wordRepeat = E('P01', 'audio', 'Listen and repeat.', {
    layout: 'listen-repeat', audioPending: true,
    items: words.map((text, i) => {
      const word = pendingAudio('P01_WORD_' + (i + 1), text);
      const example = pendingAudio('P01_EXAMPLE_' + (i + 1), examples[i]);
      return {id: String(i + 1), text, audioId: word.audioId, example: examples[i], exampleAudioId: example.audioId};
    })
  });
  const wordPractice = E('E04A', 'gaps', 'Complete the sentences.', {
    instruction: 'Look at the pictures. Write the words.', inputMode: 'text', layout: 'picture-rows',
    items: vocabularyItems.map(item => {
      const parts = item.text.split(/\[([^\]]+)\]/);
      return {id: String(item.number),
        ...pendingImage('E04A_' + item.number, item.picture + ' No printed word labels; use the image to identify the target accessory.'),
        segments: [parts[0], {id: String(item.number), answers: [item.answer], placeholder: parts[1]}, parts[2]]};
    })
  });
  const discovery = E('D04', 'matching', 'Help a friend', {
    instruction: 'Match the questions with the answers.',
    items: [
      {id: '1', text: 'What are you looking for?', correctId: 'B'},
      {id: '2', text: 'Are you looking for your necklace?', correctId: 'C'},
      {id: '3', text: 'Can you see my hair clip?', correctId: 'A'}
    ],
    options: [
      {id: 'A', text: 'Yes, I can. It’s on the chair.'},
      {id: 'B', text: 'My bracelet. I can’t find it.'},
      {id: 'C', text: 'No, I’m looking for my ring.'}
    ]
  });
  const rule = E('R04', 'rule-page', 'Как попросить помочь с поиском', {blocks: ruleBlocks});
  const searchLines = [
    'I’m looking for my bracelet.',
    'I can’t find my earring.',
    'What are you looking for?',
    'Are you looking for your hair tie?',
    'Can you see my hair clip?',
    'I can see it.',
    'I can’t see it.',
    'Here it is!'
  ];
  const searchRepeat = E('P02', 'audio', 'Listen and repeat.', {
    layout: 'listen-repeat', audioPending: true,
    items: searchLines.map((text, i) => ({id: String(i + 1), text,
      audioId: pendingAudio('P02_LINE_' + (i + 1), text).audioId}))
  });
  const listeningOptions = [
    [
      ['A', 'One small earring. Use consistent scale with alternative B, for example identical ear silhouettes.'],
      ['B', 'One large earring, plainly larger than alternative A at the same scale. This is the same design as the earring in all question 2 images.'],
      ['C', 'A necklace.']
    ],
    [
      ['A', 'The same large earring clearly on a bed.'],
      ['B', 'The same large earring clearly in an open bag.'],
      ['C', 'The same large earring partly under a hairbrush on a table; enough is visible for an unambiguous relation.']
    ]
  ];
  const listeningQuestion = (number, prompt, correctId, instruction = '') => E('L03_Q' + number, 'choice', 'Kate needs help', {
    layout: 'image-grid', instruction,
    items: [{id: String(number), prompt, correctId,
      options: listeningOptions[number - 1].map(([label, brief]) => ({id: label, text: label,
        ...pendingImage('L03_Q' + number + '_' + label, brief + ' Equal-sized alternatives with the same background. No text naming the object.')}))}]
  });
  const listening = E('L03', 'stage', 'Kate needs help', {
    instruction: 'Kate and Anna are at home. Listen and choose the correct picture.',
    layout: 'grouped', transcript: script, transcriptAfter: ['object', 'location'],
    exercises: [
      {id: 'player', exercise: E('L03_AUDIO', 'audio', 'Kate needs help', pendingAudio('L03_AUDIO', script))},
      {id: 'object', exercise: listeningQuestion(1, 'What is Kate looking for?', 'B')},
      {id: 'location', exercise: listeningQuestion(2, 'Where is it?', 'C', 'Listen again.')}
    ]
  });
  const writing = E('E11', 'writing', 'Ask Kate', {
    instruction: 'Write the questions.', responseMode: 'accepted',
    items: [
      'Узнайте, что Катя ищет.\nwhat / look for',
      'Уточните, ищет ли Катя свой браслет.\nbracelet / look for',
      'Спросите, видит ли Катя вашу серьгу.\nearring / see'
    ].map((prompt, i) => ({id: String(i + 1), prompt, normalization: 'translation', acceptedAnswers: writingKeys[i]}))
  });
  const oralFrames = [
    ['A', 'I’m … . I can’t … .', 'The owner checks a bag. A memory inset shows a small ring; the ring is absent from the bag.'],
    ['B', 'My ring is … .', 'A close-up reference of the owner’s small ring beside a larger decorative ring, with an arrow identifying the owner’s small ring.'],
    ['C', 'Can you …?', 'The owner asks a helper at the table, with a speech arrow from the owner. The ring under the book is hidden from the owner’s angle.'],
    ['D', 'Here …!', 'The helper shows the small ring in one hand.']
  ];
  const controlledPractice = E('E11A', 'stage', 'Can you help me?', {
    instruction: 'Look at the pictures. Complete the phrases.', progressive: true,
    exercises: oralFrames.map(([label, text, brief]) => ({id: label,
      exercise: E('E11A_' + label, 'presentation', 'Can you help me?', {blocks: [
        {type: 'image', ...pendingImage('E11A_' + label, brief + ' The same two adult characters and ring throughout. No text inside the artwork.')},
        {type: 'text', text}
      ]})}))
  });
  const stages = [
    stage('Speaking', 3, opening, 'Speaking content is deferred. Reserve this opening slot without task text or a scenario.'),
    stage('Words', 2, wordMatch),
    stage('Listen & Repeat', 2, wordRepeat, 'Two passes: word and example, with time to repeat. Adult natural AmE recordings remain pending.'),
    stage('Word Practice', 2, wordPractice, 'Type each complete accessory word or phrase. The picture identifies the intended accessory; the first letter is only a placeholder. Familiar background language does not introduce the new search expressions.'),
    stage('Language Focus', 1.5, discovery),
    stage('Rule', 2.5, rule),
    stage('Listen & Repeat', 2, searchRepeat, 'Two passes through the eight lexical search phrases; recordings remain pending.'),
    stage('Listening', 3, listening, 'Two adult female AmE voices. First listen: question 1 only. After checking or skipping, show question 2 and listen again. Keep its pictures hidden at first because they reveal the sought object. Script remains locked until both questions have submitted non-empty answers.'),
    stage('Writing', 3, writing),
    stage('Practice', 1.5, controlledPractice, 'Controlled oral completion, not a free Speaking task. Accept natural equivalents. Possible completions: ' + oralExamples.map(parts => parts.join(' / ')).join(' | ')),
    stage('Final Speaking', 7.5, final, 'Reserve 6 minutes for deferred final Speaking and 1.5 minutes for teacher feedback. Both remain empty until the Speaking tasks are agreed.')
  ];
  const lesson = {
    id, level: 'A1.2', whale: 5,
    summary: 'Описываем потерянный аксессуар, сообщаем о поиске и находим вещь по уточнениям собеседника.',
    grammar: 'Present Continuous в ситуации поиска',
    constructions: 'I’m looking for … · What are you looking for? · Are you looking for …? · I can’t find … · Can you see …?',
    words, durationMinutes: 30, contentVersion: 'approved-content-speaking-deferred-2026-10-11', stages,
    structure: [
      {role: 'opening', sources: [opening.id]},
      {role: 'words', sources: [wordMatch.id, wordRepeat.id]},
      {role: 'wordPractice', sources: [wordPractice.id]},
      {role: 'focus', sources: [discovery.id, rule.id]},
      {role: 'practice', sources: [searchRepeat.id]},
      {role: 'listening', sources: [listening.id]},
      {role: 'practice', sources: [writing.id, controlledPractice.id]},
      {role: 'final', sources: [final.id]}
    ]
  };
  stages.forEach(item => kit.validate(item.exercise));
  window.SpaceWhaleLessonMedia = window.SpaceWhaleLessonMedia || {};
  window.SpaceWhaleLessonMedia[id] = media;
  window.SpaceWhaleContent = window.SpaceWhaleContent || [];
  const at = window.SpaceWhaleContent.findIndex(item => item.id === id);
  if (at < 0) window.SpaceWhaleContent.push(lesson);
  else window.SpaceWhaleContent[at] = lesson;
})();
