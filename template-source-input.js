(() => {
  'use strict';
  // Source-coded Listening / Reading examples. Rendering and answer state stay in the shared kit.
  // Pending recordings deliberately have no URL; scripts are author data, not test-tone audio.
  const kit = window.SpaceWhaleExerciseKit;
  if (!kit) return;
  const base = (id, kind, title, data = {}) => ({ version: 1, id, kind, title, ...data });
  const opt = (id, text, data = {}) => ({ id, text, ...data });
  const clothes = name => ({
    image: `Images/Текущие/assets/lesson-media/a1-2/module-4/lesson-1/images/${name}-cutout.webp`,
    alt: `A ${name}`
  });
  const garmentOptions = () => [opt('hat', 'A hat', clothes('hat')), opt('coat', 'A coat', clothes('coat')), opt('sweater', 'A sweater', clothes('sweater'))];
  const audio = (code, title, script, suffix = 'audio') => base(`source-${code}-${suffix}`, 'audio', title, {
    audioPending: true, authorTranscript: script
  });
  const text = (code, passage) => base(`source-${code}-text`, 'presentation', 'Read the text', {
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
  const reading = (code, title, passage, task) => sourceStage(code, title, [text(code, passage)], task);
  const response = (code, kind, data) => base(`source-${code}-response`, kind, 'Task', data);
  const trueFalse = (code, statements) => response(code, 'choice', {
    items: statements.map(([prompt, correctId], i) => ({ id: `fact${i + 1}`, prompt,
      options: [opt('true', 'True'), opt('false', 'False')], correctId }))
  });
  const pictureChoice = (code, prompt, correct, multiple = false) => response(code, 'choice', {
    layout: 'image-grid', multiple,
    items: [{ id: 'picture', prompt, options: garmentOptions(), ...(multiple ? { correctIds: correct } : { correctId: correct }) }]
  });
  const garmentOrder = code => response(code, 'order', {
    layout: 'image-grid',
    tokens: [opt('sweater', 'A sweater', clothes('sweater')), opt('hat', 'A hat', clothes('hat')), opt('coat', 'A coat', clothes('coat'))],
    correctOrder: ['coat', 'hat', 'sweater']
  });
  const gap = (id, answers, data = {}) => ({ id, answers, ...data });
  const definitions = [
    listening('L01', 'Listen and choose True or False',
      'Our new apartment is on the second floor. There are two bedrooms and a small kitchen. The kitchen has a window, but the bathroom does not. We do not have a balcony.',
      trueFalse('L01', [
        ['There are two bedrooms.', 'true'],
        ['The apartment has a balcony.', 'false'],
        ['There is no window in the kitchen.', 'false']
      ])),
    listening('L02', 'Why is Daniel calling?',
      'Hi, it is Daniel. I booked a table for seven tonight, but my train is late. Could we come at eight instead? There are still four of us. Please call me back.',
      response('L02', 'choice', { instruction: 'Choose the correct answer.', items: [{
        id: 'reason', prompt: 'Daniel wants to…',
        options: [opt('people', 'change the number of people.'), opt('time', 'arrive an hour later.'), opt('cancel', 'cancel the booking.')], correctId: 'time'
      }] })),
    listening('L03', 'Which item does Nina buy?',
      'I like the coat, but it costs too much. I already have a hat. This sweater is warm and the price is good. I will take it.',
      pictureChoice('L03', 'Listen and choose one picture.', 'sweater')),
    listening('L04', 'What does the speaker recommend?',
      'It is cold and windy today. Wear your coat and a hat. Leave the sweater at home; it is not warm enough for this wind.',
      pictureChoice('L04', 'Listen and choose all the recommended items.', ['coat', 'hat'], true)),
    listening('L05', 'Put the pictures in the order you hear them',
      'First, look at this coat. Next, here is the hat I bought yesterday. Finally, this is my favorite sweater.',
      garmentOrder('L05')),
    listening('L06', 'Put the questions in the order you hear them',
      'Do you work on Saturdays? Do you live near here? Do you have a car?',
      response('L06', 'order', {
        tokens: [opt('car', 'Do you have a car?'), opt('work', 'Do you work on Saturdays?'), opt('live', 'Do you live near here?')],
        correctOrder: ['work', 'live', 'car']
      })),
    listening('L07', 'Listen and complete the message',
      'Hi, Nina. I am at the station. The train is late. I will be home at seven. Please wait for me.',
      response('L07', 'gaps', { instruction: 'Write one word in each gap.', items: [
        { id: 'place', segments: ['I am at the ', gap('station', ['station']), '.'] },
        { id: 'problem', segments: ['The train is ', gap('late', ['late']), '.'] },
        { id: 'time', segments: ['I will be home at ', gap('seven', ['seven', '7']), '.'] }
      ] })),
    listening('L08', 'Listen and complete the booking details',
      'Hello. My name is Emma Reed. I would like a table for four at six thirty. My phone number is 555 0148.',
      response('L08', 'gaps', { instruction: 'Write the missing details. Use the clues in the fields.', items: [
        { id: 'surname', segments: ['Last name: ', gap('name', ['Reed'], { placeholder: 'last name' })] },
        { id: 'people', segments: ['Number of people: ', gap('number', ['4', 'four'], { placeholder: 'number' })] },
        { id: 'booking-time', segments: ['Time: ', gap('time', ['6:30', '6.30', 'six thirty'], { placeholder: 'time' })] }
      ] })),
    listening('L09', 'Listen and choose the missing details',
      'The blue bus goes to the station. It leaves at nine and stops outside the library. The red bus goes to the airport.',
      response('L09', 'gaps', { inputMode: 'select', items: [
        { id: 'route', segments: ['The blue bus goes to the ', gap('destination', ['station'], { options: ['airport', 'station', 'museum'] }), '.'] },
        { id: 'departure', segments: ['It leaves at ', gap('time', ['nine'], { options: ['ten', 'eight', 'nine'] }), '.'] },
        { id: 'stop', segments: ['It stops outside the ', gap('building', ['library'], { options: ['hotel', 'library', 'bank'] }), '.'] }
      ] })),
    listening('L10', 'Match the people with their travel plans',
      'Three friends are traveling today. Alex is going to the airport. Nina is taking a train to the city center. Omar is going to the beach by bus.',
      response('L10', 'matching', {
        items: [{ id: 'alex', text: 'Alex', correctId: 'airport' }, { id: 'nina', text: 'Nina', correctId: 'center' }, { id: 'omar', text: 'Omar', correctId: 'beach' }],
        options: [opt('beach', 'the beach'), opt('airport', 'the airport'), opt('center', 'the city center')]
      })),
    sourceStage('L11', 'Match the recordings with the pictures', [], response('L11', 'matching', {
      items: [
        { id: 'clip1', text: 'Recording 1', audioPending: true, authorTranscript: 'It is warm and soft. I wear it under my coat.', correctId: 'sweater' },
        { id: 'clip2', text: 'Recording 2', audioPending: true, authorTranscript: 'I wear it on my head when it is cold.', correctId: 'hat' },
        { id: 'clip3', text: 'Recording 3', audioPending: true, authorTranscript: 'It is long and warm. I put it on over my sweater.', correctId: 'coat' }
      ],
      options: garmentOptions()
    }), 'Recording 1: It is warm and soft. I wear it under my coat.\nRecording 2: I wear it on my head when it is cold.\nRecording 3: It is long and warm. I put it on over my sweater.'),
    listening('L12', 'What time will the friends meet?',
      'Nina: Shall we meet at six?\nAlex: I finish work at six. Could we meet at six thirty?\nNina: Yes, six thirty is fine. See you at the station.',
      response('L12', 'writing', { responseMode: 'accepted', instruction: 'Listen and write the agreed time.', items: [{
        id: 'meeting-time', prompt: 'Meeting time:', acceptedAnswers: ['6:30', '6.30', 'six thirty', '6:30 p.m.', '6:30 pm', '18:30']
      }] })),
    listening('L13', 'Which problems does the traveler have?',
      'My train is delayed, and I cannot find my ticket. My phone is working, so I can call the hotel. I have my passport and my bag with me.',
      response('L13', 'choice', { multiple: true, instruction: 'Listen and choose all the correct answers.', items: [{
        id: 'problems', prompt: 'The traveler…',
        options: [opt('phone', 'cannot use their phone.'), opt('ticket', 'cannot find their ticket.'), opt('bag', 'has lost their bag.'), opt('train', 'has to wait for their train.')],
        correctIds: ['ticket', 'train']
      }] })),
    listening('L14', 'Who says these sentences?',
      'Nina: I work in a café. I start at seven in the morning.\nAlex: I work in a hotel. I start at three in the afternoon.\nNina: I finish at two.\nAlex: I finish at ten at night.',
      response('L14', 'sort', {
        groups: [opt('nina', 'Nina'), opt('alex', 'Alex')],
        items: [
          { id: 'hotel', text: 'I work in a hotel.', correctId: 'alex' },
          { id: 'seven', text: 'I start at seven in the morning.', correctId: 'nina' },
          { id: 'ten', text: 'I finish at ten at night.', correctId: 'alex' },
          { id: 'cafe', text: 'I work in a café.', correctId: 'nina' }
        ]
      })),
    listening('L15', 'Listen and label the people',
      'This is Ella. She has curly hair and is wearing headphones. Nina has short blonde hair and a blue bag. Ivy is wearing a pink hat and a pink sweater.',
      response('L15', 'image-label', {
        image: 'Images/Текущие/assets/lesson-media/a1-2/module-4/lesson-4/media/people-abc.webp',
        alt: 'Three women: A has short blonde hair and a blue bag; B wears a pink hat; C has curly hair and headphones.',
        items: [
          { id: 'person-a', prompt: 'Person A', x: 17, y: 82, correctId: 'nina' },
          { id: 'person-b', prompt: 'Person B', x: 50, y: 82, correctId: 'ivy' },
          { id: 'person-c', prompt: 'Person C', x: 83, y: 82, correctId: 'ella' }
        ],
        options: [opt('ivy', 'Ivy'), opt('ella', 'Ella'), opt('nina', 'Nina')]
      })),
    base('source-L16', 'stage', 'Put the dialogue in order. Then listen and check', {
      layout: 'grouped',
      exercises: [
        { id: 'task', exercise: response('L16', 'order', {
          title: 'Put the dialogue in order. Then listen and check',
          tokens: [opt('price', 'It is twenty dollars.'), opt('buy', 'Great. I will take it.'), opt('question', 'How much is this hat?')],
          correctOrder: ['question', 'price', 'buy']
        }) },
        { id: 'check-audio', exercise: audio('L16', 'Listen and check', 'How much is this hat?\nIt is twenty dollars.\nGreat. I will take it.') }
      ],
      transcript: 'How much is this hat?\nIt is twenty dollars.\nGreat. I will take it.', transcriptAfter: ['task']
    }),
    listening('L17', 'Listen and choose the correct reply',
      'Excuse me. Is this seat free?',
      response('L17', 'choice', { items: [{
        id: 'reply', prompt: 'Choose one reply.',
        options: [opt('time', 'It starts at seven.'), opt('free', 'Yes, you can sit here.'), opt('cost', 'It costs ten dollars.')], correctId: 'free'
      }] })),
    listening('L18', 'Listen and offer your help',
      'These bags are very heavy. I cannot carry them all.',
      response('L18', 'writing', { responseMode: 'open', instruction: 'Write a short reply offering to carry a bag.',
        authorExpectedMeaning: 'Offer practical help to carry one or more bags. Accept different natural replies; completion is not semantic grading.',
        items: [{ id: 'help', prompt: 'Your reply:', multiline: false }]
      })),
    reading('T01', 'Read and choose True or False',
      'Nina lives in a small apartment near the station. She walks to work because her café is only five minutes away. She works from Monday to Friday. She does not work on weekends. On Saturdays, she visits her sister.',
      trueFalse('T01', [['Nina works in a café.', 'true'], ['She goes to work by train.', 'false'], ['She works on Saturdays.', 'false']])),
    reading('T02', 'Why is Alex sending this message?',
      'Hi, Nina. I cannot meet you at the café today. My train is delayed. Could we meet there tomorrow at the same time? Alex',
      response('T02', 'choice', { instruction: 'Read and choose the correct answer.', items: [{
        id: 'purpose', prompt: 'Alex wants to…',
        options: [opt('place', 'meet in a different place.'), opt('day', 'meet on a different day.'), opt('cancel', 'stop meeting Nina.')], correctId: 'day'
      }] })),
    reading('T03', 'Which item does Nina need?',
      'I am going to a park this afternoon. I have a warm coat and a sweater, but I need something for my head. It is very sunny today.',
      pictureChoice('T03', 'Read and choose one picture.', 'hat')),
    reading('T04', 'Which items are on the shopping list?',
      'We need a coat for Alex and a sweater for Nina. We saw a nice hat yesterday, but Alex already has one. We are not buying another hat.',
      pictureChoice('T04', 'Read and choose all the items they need to buy.', ['coat', 'sweater'], true)),
    reading('T05', 'Put the pictures in the order they are mentioned',
      'The shop has three special offers this week. The first is a long coat. Next, there is a blue hat. The last offer is a soft sweater.',
      garmentOrder('T05')),
    reading('T06', 'Put the events in the correct order',
      'Nina went to the station to meet Alex. While she was waiting, she bought a coffee. Alex arrived ten minutes later. They then walked to the café together.',
      response('T06', 'order', {
        tokens: [opt('arrive', 'Alex arrived.'), opt('walk', 'They walked to the café.'), opt('station', 'Nina went to the station.'), opt('coffee', 'Nina bought a coffee.')],
        correctOrder: ['station', 'coffee', 'arrive', 'walk']
      })),
    reading('T07', 'How many people can stay in the apartment?',
      'Apartment available for the weekend. Two bedrooms, one bathroom, and a small kitchen. There is one double bed and two single beds. Up to four people can stay. The station is a ten-minute walk away.',
      response('T07', 'writing', { responseMode: 'accepted', instruction: 'Read and write a number.', items: [{
        id: 'guests', prompt: 'Number of guests:', acceptedAnswers: ['4', 'four']
      }] })),
    reading('T08', 'Read and complete the notes',
      'Hi, Alex. Our train leaves from platform six at nine thirty. Please meet me outside the station at nine. I have your ticket. Nina',
      response('T08', 'gaps', { instruction: 'Write the missing details from the message.', items: [
        { id: 'platform', segments: ['Platform: ', gap('platform-number', ['6', 'six'])] },
        { id: 'departure', segments: ['Train departure: ', gap('departure-time', ['9:30', '9.30', 'nine thirty'])] },
        { id: 'ticket', segments: ['Who has Alex’s ticket? ', gap('ticket-person', ['Nina'])] }
      ] })),
    reading('T09', 'Read and complete the delivery details',
      'Your order will arrive on Friday. The driver will bring it to 18 Green Street between two and four in the afternoon. Please call Ben if you need to change the address.',
      response('T09', 'gaps', { items: [
        { id: 'delivery-day', segments: ['Delivery day: ', gap('day', ['Friday'], { placeholder: 'day' })] },
        { id: 'contact-person', segments: ['Contact: ', gap('person', ['Ben'], { placeholder: 'name' })] },
        { id: 'house-number', segments: ['House number: ', gap('house', ['18', 'eighteen'], { placeholder: 'number' })] }
      ] })),
    reading('T10', 'Read and choose the missing details',
      'Nina is taking the bus because her bike has a flat tire. The bus stop is near the library. She will get off at the station and meet Alex there.',
      response('T10', 'gaps', { inputMode: 'select', items: [
        { id: 'transport', segments: ['Nina is going by ', gap('vehicle', ['bus'], { options: ['train', 'bus', 'car'] }), '.'] },
        { id: 'stop', segments: ['The bus stop is near the ', gap('place', ['library'], { options: ['station', 'hotel', 'library'] }), '.'] },
        { id: 'meeting', segments: ['She will meet Alex at the ', gap('meeting-place', ['station'], { options: ['café', 'station', 'library'] }), '.'] }
      ] })),
    reading('T11', 'Match the people with their jobs today',
      'We are getting the apartment ready for our guests. Alex is cleaning the kitchen. Nina is buying food at the shop. Omar is taking the guests from the station to the apartment.',
      response('T11', 'matching', {
        items: [{ id: 'alex', text: 'Alex', correctId: 'kitchen' }, { id: 'nina', text: 'Nina', correctId: 'food' }, { id: 'omar', text: 'Omar', correctId: 'guests' }],
        options: [opt('guests', 'meeting the guests'), opt('kitchen', 'cleaning the kitchen'), opt('food', 'buying food')]
      })),
    base('source-T12', 'matching', 'Match the messages with the headings', {
      instruction: 'Read each message. There is one extra heading.',
      items: [
        { id: 'message1', text: 'The café is closed today because the water is not working. We will open again tomorrow morning.', correctId: 'closed' },
        { id: 'message2', text: 'I found a blue bag on the bus. It is at the ticket office. Please ask for it there.', correctId: 'lost' },
        { id: 'message3', text: 'Your table is ready for six thirty. There are four places. Please call if your plans change.', correctId: 'booking' }
      ],
      options: [opt('booking', 'Your booking is confirmed'), opt('job', 'A new job'), opt('closed', 'A temporary closure'), opt('lost', 'A lost item has been found')]
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
