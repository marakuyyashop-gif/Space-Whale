(() => {
  'use strict';
  // Source-coded Listening / Reading examples. Rendering and answer state stay in the shared kit.
  // Pending recordings deliberately have no URL; scripts are author data, not test-tone audio.
  const kit = window.SpaceWhaleExerciseKit;
  if (!kit) return;
  const base = (id, kind, title, data = {}) => ({ version: 1, id, kind, title, ...data });
  const opt = (id, text, data = {}) => ({ id, text, ...data });
  const picture = (name, index) => ({
    imagePending: true, imageWidth: 1, imageHeight: 1,
    alt: `[Picture ${index}]`,
    sourceArtwork: {
      image: `Images/Текущие/assets/lesson-media/a1-2/module-4/lesson-1/images/${name}-cutout.webp`,
      alt: `A ${name}`
    }
  });
  const pictureOptions = () => [
    opt('hat', '[Picture 2]', picture('hat', 2)),
    opt('coat', '[Picture 1]', picture('coat', 1)),
    opt('sweater', '[Picture 3]', picture('sweater', 3))
  ];
  const audio = (code, title, script, suffix = 'audio') => base(`source-${code}-${suffix}`, 'audio', title, {
    audioPending: true, authorTranscript: script
  });
  const text = (code, passage, title) => base(`source-${code}-text`, 'presentation', title, {
    blocks: [{ type: 'text', text: passage }]
  });
  const sourceStage = (code, title, material, task, script = '') => base(`source-${code}`, 'stage', title, {
    layout: 'grouped',
    exercises: [
      ...material.map((exercise, i) => ({ id: `source${i + 1}`, exercise })),
      { id: 'task', exercise: { ...task, title } }
    ],
    ...(script ? { transcript: script, transcriptAfter: ['task'] } : {})
  });
  const listening = (code, title, script, task) => {
    // A source and its task share one heading. Put the interaction instruction
    // directly below it, before the player, rather than after the recording.
    const stage = sourceStage(code, title, [audio(code, title, script)], task, script);
    const prompt=task.kind==='choice'&&task.items.length===1?task.items[0].prompt:'';
    const instruction=task.instruction||(/^(?:listen|choose)\b/i.test(prompt)?prompt:'');
    if (instruction) {
      stage.instruction = instruction;
      delete stage.exercises.find(block => block.id === 'task').exercise.instruction;
    }
    return stage;
  };
  const reading = (code, title, passage, task) => {
    const stage = sourceStage(code, title, [text(code, passage, title)], task);
    const prompt = task.kind === 'choice' && task.items.length === 1 ? task.items[0].prompt : '';
    const instruction = task.instruction || (/^(?:read|choose)\b/i.test(prompt) ? prompt : '');
    if (instruction) {
      stage.instruction = instruction;
      delete stage.exercises.find(block => block.id === 'task').exercise.instruction;
    }
    return stage;
  };
  const response = (code, kind, data) => base(`source-${code}-response`, kind, 'Task', data);
  const trueFalse = (code, statements) => response(code, 'choice', {
    layout: 'dropdown', numbered: true,
    items: statements.map(([prompt, correctId], i) => ({ id: `fact${i + 1}`, prompt,
      options: [opt('true', 'True'), opt('false', 'False')], correctId }))
  });
  const pictureChoice = (code, prompt, correct, multiple = false) => response(code, 'choice', {
    layout: 'image-grid', multiple,
    items: [{ id: 'picture', prompt, options: pictureOptions(), ...(multiple ? { correctIds: correct } : { correctId: correct }) }]
  });
  const garmentOrder = code => response(code, 'order', {
    layout: 'image-grid',
    tokens: [opt('sweater', '[Word 3]', picture('sweater', 3)), opt('hat', '[Word 2]', picture('hat', 2)), opt('coat', '[Word 1]', picture('coat', 1))],
    correctOrder: ['coat', 'hat', 'sweater']
  });
  const gap = (id, answers, data = {}) => ({ id, answers, ...data });
  const definitions = [
    listening('L01', 'Listen and choose True or False', '[Transcript]',
      trueFalse('L01', [
        ['[Statement 1]', 'true'], ['[Statement 2]', 'false'], ['[Statement 3]', 'false']
      ])),
    listening('L02', '[Question]', '[Transcript]',
      response('L02', 'choice', { instruction: 'Listen and choose one answer.', items: [{
        id: 'reason', prompt: '[Question]',
        options: [opt('people', '[Answer 1]'), opt('time', '[Answer 2]'), opt('cancel', '[Answer 3]')], correctId: 'time'
      }] })),
    listening('L03', 'Listen and choose a picture', '[Transcript]',
      pictureChoice('L03', 'Choose one picture.', 'sweater')),
    listening('L04', 'Listen and select the correct pictures', '[Transcript]',
      pictureChoice('L04', 'Choose ALL the correct pictures.', ['coat', 'hat'], true)),
    listening('L05', 'Put the pictures in the order you hear them', '[Transcript]',
      garmentOrder('L05')),
    listening('L06', 'Put the text in the order you hear it', '[Transcript]',
      response('L06', 'order', {
        tokens: [opt('car', '[Text 3]'), opt('work', '[Text 1]'), opt('live', '[Text 2]')],
        correctOrder: ['work', 'live', 'car']
      })),
    listening('L07', 'Listen and complete the sentences', '[Transcript]',
      response('L07', 'gaps', { instruction: 'Write one word in each gap.', items: [
        { id: 'place', segments: ['[Sentence beginning 1] ', gap('station', ['[Word 1]']), ' [Sentence ending 1]'] },
        { id: 'problem', segments: ['[Sentence beginning 2] ', gap('late', ['[Word 2]']), ' [Sentence ending 2]'] },
        { id: 'time', segments: ['[Sentence beginning 3] ', gap('seven', ['[Word 3]', '[Alternative for Word 3]']), ' [Sentence ending 3]'] }
      ] })),
    listening('L08', 'Listen and complete the details', '[Transcript]',
      response('L08', 'gaps', { instruction: 'Use the clue in each field.', items: [
        { id: 'surname', segments: ['[Detail 1]: ', gap('name', ['[Answer 1]'], { placeholder: '[Clue 1]' })] },
        { id: 'people', segments: ['[Detail 2]: ', gap('number', ['[Answer 2]', '[Alternative for Answer 2]'], { placeholder: '[Clue 2]' })] },
        { id: 'booking-time', segments: ['[Detail 3]: ', gap('time', ['[Answer 3]', '[Alternative 1 for Answer 3]', '[Alternative 2 for Answer 3]'], { placeholder: '[Clue 3]' })] }
      ] })),
    listening('L09', 'Listen and choose the missing details', '[Transcript]',
      response('L09', 'gaps', { inputMode: 'select', items: [
        { id: 'route', segments: ['[Sentence beginning 1] ', gap('destination', ['[Answer 1]'], { options: ['[Option 1.1]', '[Answer 1]', '[Option 1.2]'] }), ' [Sentence ending 1]'] },
        { id: 'departure', segments: ['[Sentence beginning 2] ', gap('time', ['[Answer 2]'], { options: ['[Option 2.1]', '[Option 2.2]', '[Answer 2]'] }), ' [Sentence ending 2]'] },
        { id: 'stop', segments: ['[Sentence beginning 3] ', gap('building', ['[Answer 3]'], { options: ['[Option 3.1]', '[Answer 3]', '[Option 3.2]'] }), ' [Sentence ending 3]'] }
      ] })),
    listening('L10', 'Listen and match the information', '[Transcript]',
      response('L10', 'matching', {
        layout: 'word-definition',
        items: [{ id: 'alex', text: '[Person 1]', correctId: 'airport' }, { id: 'nina', text: '[Person 2]', correctId: 'center' }, { id: 'omar', text: '[Person 3]', correctId: 'beach' }],
        options: [opt('beach', '[Information 3]'), opt('airport', '[Information 1]'), opt('center', '[Information 2]')]
      })),
    sourceStage('L11', 'Match the recordings with the pictures', [], response('L11', 'matching', {
      layout: 'audio-picture',
      items: [
        { id: 'clip1', text: '[Recording 1]', audioPending: true, authorTranscript: '[Transcript 1]', correctId: 'sweater' },
        { id: 'clip2', text: '[Recording 2]', audioPending: true, authorTranscript: '[Transcript 2]', correctId: 'hat' },
        { id: 'clip3', text: '[Recording 3]', audioPending: true, authorTranscript: '[Transcript 3]', correctId: 'coat' }
      ],
      options: pictureOptions()
    }), '[Recording 1]: [Transcript 1]\n[Recording 2]: [Transcript 2]\n[Recording 3]: [Transcript 3]'),
    listening('L12', 'Listen and write a short answer', '[Transcript]',
      response('L12', 'writing', { responseMode: 'accepted', instruction: 'Write the answer from the recording.', items: [{
        id: 'meeting-time', prompt: '[Question]', acceptedAnswers: ['[Answer]', '[Alternative answer 1]', '[Alternative answer 2]', '[Alternative answer 3]', '[Alternative answer 4]', '[Alternative answer 5]']
      }] })),
    listening('L13', 'Listen and select the correct answers', '[Transcript]',
      response('L13', 'choice', { multiple: true, instruction: 'Choose ALL the correct options.', items: [{
        id: 'problems', prompt: '[Question]',
        options: [opt('phone', '[Answer 1]'), opt('ticket', '[Answer 2]'), opt('bag', '[Answer 3]'), opt('train', '[Answer 4]')],
        correctIds: ['ticket', 'train']
      }] })),
    listening('L14', 'Listen and group the sentences', '[Transcript]',
      response('L14', 'sort', {
        groups: [opt('nina', '[Group 1]'), opt('alex', '[Group 2]')],
        items: [
          { id: 'hotel', text: '[Sentence 1]', correctId: 'alex' },
          { id: 'seven', text: '[Sentence 2]', correctId: 'nina' },
          { id: 'ten', text: '[Sentence 3]', correctId: 'alex' },
          { id: 'cafe', text: '[Sentence 4]', correctId: 'nina' }
        ]
      })),
    listening('L15', 'Listen and label the picture', '[Transcript]',
      response('L15', 'image-label', {
        imagePending: true, imageWidth: 1020, imageHeight: 388, alt: '[Image]',
        sourceArtwork: {
          image: 'Images/Текущие/assets/lesson-media/a1-2/module-4/lesson-4/media/people-abc.webp',
          alt: 'Three women: A has short blonde hair and a blue bag; B wears a pink hat; C has curly hair and headphones.'
        },
        items: [
          { id: 'person-a', prompt: 'A', label: 'A', labelX: 3, labelY: 8, x: 17, y: 82, correctId: 'nina' },
          { id: 'person-b', prompt: 'B', label: 'B', labelX: 36, labelY: 8, x: 50, y: 82, correctId: 'ivy' },
          { id: 'person-c', prompt: 'C', label: 'C', labelX: 69, labelY: 8, x: 83, y: 82, correctId: 'ella' }
        ],
        options: [opt('ivy', '[Label 2]'), opt('ella', '[Label 3]'), opt('nina', '[Label 1]')]
      })),
    base('source-L16', 'stage', 'Put the dialogue in order. Then listen and check', {
      layout: 'grouped',
      exercises: [
        { id: 'task', exercise: response('L16', 'order', {
          title: 'Put the dialogue in order. Then listen and check',
          tokens: [opt('price', '[Dialogue line 2]'), opt('buy', '[Dialogue line 3]'), opt('question', '[Dialogue line 1]')],
          correctOrder: ['question', 'price', 'buy']
        }) },
        { id: 'check-audio', exercise: audio('L16', 'Listen and check', '[Transcript]') }
      ],
      transcript: '[Transcript]', transcriptAfter: ['task']
    }),
    listening('L17', 'Listen and choose a reply', '[Transcript]',
      response('L17', 'choice', { items: [{
        id: 'reply', prompt: 'Choose one reply.',
        options: [opt('time', '[Reply 1]'), opt('free', '[Reply 2]'), opt('cost', '[Reply 3]')], correctId: 'free'
      }] })),
    listening('L18', 'Listen and write a reply', '[Transcript]',
      response('L18', 'writing', { responseMode: 'open', instruction: 'Write your own reply.',
        authorExpectedMeaning: '[Expected meaning]. Accept different natural replies; completion is not semantic grading.',
        items: [{ id: 'help', prompt: '[Situation or question]', multiline: false }]
      })),
    reading('T01', 'Read and choose True or False', '[Text]',
      trueFalse('T01', [['[Statement 1]', 'true'], ['[Statement 2]', 'false'], ['[Statement 3]', 'false']])),
    reading('T02', '[Question]', '[Text]',
      response('T02', 'choice', { instruction: 'Read and choose one answer.', items: [{
        id: 'purpose', prompt: '[Question]',
        options: [opt('place', '[Answer 1]'), opt('day', '[Answer 2]'), opt('cancel', '[Answer 3]')], correctId: 'day'
      }] })),
    reading('T03', 'Read and choose a picture', '[Text]',
      pictureChoice('T03', 'Choose one picture.', 'hat')),
    reading('T04', 'Read and select the correct pictures', '[Text]',
      pictureChoice('T04', 'Choose ALL the correct pictures.', ['coat', 'sweater'], true)),
    reading('T05', 'Put the pictures in the order they are mentioned', '[Text]',
      garmentOrder('T05')),
    reading('T06', 'Put the events in the correct order', '[Text]',
      response('T06', 'order', {
        tokens: [opt('arrive', '[Event 3]'), opt('walk', '[Event 4]'), opt('station', '[Event 1]'), opt('coffee', '[Event 2]')],
        correctOrder: ['station', 'coffee', 'arrive', 'walk']
      })),
    reading('T07', 'Read and write a short answer', '[Text]',
      response('T07', 'writing', { responseMode: 'accepted', instruction: 'Write the answer from the text.', items: [{
        id: 'guests', prompt: '[Question]', acceptedAnswers: ['[Answer]', '[Alternative answer]']
      }] })),
    reading('T08', 'Read and complete the details', '[Text]',
      response('T08', 'gaps', { instruction: 'Write the missing details.', items: [
        { id: 'platform', segments: ['[Detail 1]: ', gap('platform-number', ['[Answer 1]', '[Alternative for Answer 1]'])] },
        { id: 'departure', segments: ['[Detail 2]: ', gap('departure-time', ['[Answer 2]', '[Alternative 1 for Answer 2]', '[Alternative 2 for Answer 2]'])] },
        { id: 'ticket', segments: ['[Detail 3]: ', gap('ticket-person', ['[Answer 3]'])] }
      ] })),
    reading('T09', 'Read and complete the details', '[Text]',
      response('T09', 'gaps', { instruction: 'Use the clue in each field.', items: [
        { id: 'delivery-day', segments: ['[Detail 1]: ', gap('day', ['[Answer 1]'], { placeholder: '[Clue 1]' })] },
        { id: 'contact-person', segments: ['[Detail 2]: ', gap('person', ['[Answer 2]'], { placeholder: '[Clue 2]' })] },
        { id: 'house-number', segments: ['[Detail 3]: ', gap('house', ['[Answer 3]', '[Alternative for Answer 3]'], { placeholder: '[Clue 3]' })] }
      ] })),
    reading('T10', 'Read and choose the missing details', '[Text]',
      response('T10', 'gaps', { inputMode: 'select', items: [
        { id: 'transport', segments: ['[Sentence beginning 1] ', gap('vehicle', ['[Answer 1]'], { options: ['[Option 1.1]', '[Answer 1]', '[Option 1.2]'] }), ' [Sentence ending 1]'] },
        { id: 'stop', segments: ['[Sentence beginning 2] ', gap('place', ['[Answer 2]'], { options: ['[Option 2.1]', '[Option 2.2]', '[Answer 2]'] }), ' [Sentence ending 2]'] },
        { id: 'meeting', segments: ['[Sentence beginning 3] ', gap('meeting-place', ['[Answer 3]'], { options: ['[Option 3.1]', '[Answer 3]', '[Option 3.2]'] }), ' [Sentence ending 3]'] }
      ] })),
    reading('T11', 'Read and match the information', '[Text]',
      response('T11', 'matching', {
        layout: 'word-definition',
        items: [{ id: 'alex', text: '[Person 1]', correctId: 'kitchen' }, { id: 'nina', text: '[Person 2]', correctId: 'food' }, { id: 'omar', text: '[Person 3]', correctId: 'guests' }],
        options: [opt('guests', '[Information 3]'), opt('kitchen', '[Information 1]'), opt('food', '[Information 2]')]
      })),
    base('source-T12', 'matching', 'Match the texts with the headings', {
      layout: 'stacked-text',
      instruction: 'Choose a heading for each text. There is one extra heading.',
      items: [
        { id: 'message1', text: '[Text 1]', correctId: 'closed' },
        { id: 'message2', text: '[Text 2]', correctId: 'lost' },
        { id: 'message3', text: '[Text 3]', correctId: 'booking' }
      ],
      options: [opt('booking', '[Heading 3]'), opt('job', '[Extra heading]'), opt('closed', '[Heading 1]'), opt('lost', '[Heading 2]')]
    })
  ];
  const titles = {
    L01: 'True / False по аудио', L02: 'Single Choice по аудио', L03: 'Image Single Choice по аудио',
    L04: 'Image Multiple Select по аудио', L05: 'Картинки по порядку звучания', L06: 'Текстовые элементы по порядку звучания',
    L07: 'Вписать услышанное без подсказки', L08: 'Вписать услышанное с подсказкой', L09: 'Dropdown по аудио',
    L10: 'Matching — сведения из одной записи', L11: 'Matching — несколько записей и картинки', L12: 'Краткий ответ по аудио',
    L13: 'Несколько текстовых ответов', L14: 'Распределение по группам', L15: 'Подписи по аудио',
    L16: 'Собрать и проверить', L17: 'Выбрать ответную реплику', L18: 'Самостоятельная реплика',
    T01: 'True / False по тексту', T02: 'Single Choice по тексту', T03: 'Image Single Choice по тексту',
    T04: 'Image Multiple Select по тексту', T05: 'Картинки по порядку в тексте', T06: 'Текстовые элементы по порядку',
    T07: 'Краткий ответ по тексту', T08: 'Восстановить сведения без подсказки', T09: 'Восстановить сведения с подсказкой',
    T10: 'Dropdown по тексту', T11: 'Matching — сведения из текста', T12: 'Matching — текст и заголовок'
  };
  const descriptions = {
    L01: 'Check factual statements against one recording.', L02: 'Choose one text answer about the recording.',
    L03: 'Choose one picture using the recording.', L04: 'Select every picture that matches the recording.',
    L05: 'Arrange pictures in their spoken order.', L06: 'Arrange complete phrases in their spoken order.',
    L07: 'Type the words you hear without field clues.', L08: 'Complete heard details with a clue inside each field.',
    L09: 'Choose heard details from inline lists.', L10: 'Match people and facts from one recording.',
    L11: 'Match separately numbered recordings with pictures.', L12: 'Write a short factual answer without answer options.',
    L13: 'Select all text answers supported by the recording.', L14: 'Group several heard details by speaker.',
    L15: 'Use the recording to place names on a shared picture.', L16: 'Assemble a dialogue, then listen to check it.',
    L17: 'Choose a suitable reply to the speaker.', L18: 'Write your own reply to the speaker; teacher review.',
    T01: 'Check factual statements against a visible text.', T02: 'Choose one answer about the meaning of a message.',
    T03: 'Choose one picture using the text.', T04: 'Select every picture supported by the text.',
    T05: 'Arrange pictures in the order they are mentioned.', T06: 'Arrange events using information in the text.',
    T07: 'Write a short factual answer to a question.', T08: 'Recover details in notes without field clues.',
    T09: 'Recover details using a clue inside each field.', T10: 'Choose summary details from inline lists.',
    T11: 'Match people and related information from a text.', T12: 'Match short texts with their main-idea headings.'
  };
  definitions.forEach(definition => {
    const code = definition.id.slice('source-'.length);
    Object.assign(definition, {
      code, catalogFamily: code[0], catalogTitle: titles[code], label: `${code} · ${titles[code]}`,
      description: descriptions[code],
      sourceFiles: code[0] === 'L'
        ? ['ENG_Exercise_Catalog_САМЫЙ.pdf', 'L_LISTENING_САМЫЙ.pdf', 'ENG_Справочник_упражнений.txt']
        : ['ENG_Exercise_Catalog_САМЫЙ.pdf', 'ENG_Справочник_упражнений.txt'],
      ...(code[0] === 'L' ? { mediaStatus: 'audio-pending' } : {})
    });
    kit.validate(definition);
  });
  window.SpaceWhaleSourceInputTemplates = definitions;
})();
