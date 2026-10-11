(() => {
  'use strict';
  const kit = window.SpaceWhaleExerciseKit;
  const id = 'a2-2-w6-l1', prefix = 'A22M6L1', media = {};
  const E = (name, kind, title, extra = {}) => ({version: 1, id: prefix + '-' + name, kind, title, ...extra});
  const stage = (menu, time, exercise, teacherNotes = '') => ({menu, navigationTitle: menu, section: 'tasks', guide: {time: time + ' min', teacherNotes}, exercise});
  const pendingImage = (name, brief) => {
    const assetId = prefix + '_' + name;
    media[assetId] = {type: 'image', src: null, brief};
    return {imagePending: true, assetId};
  };
  const pendingAudio = (name, script) => {
    const audioId = prefix + '_' + name;
    media[audioId] = {type: 'audio', src: null, script};
    return {audioId, audioPending: true};
  };
  const words = ['screen', 'button', 'cable', 'remote control', 'keyboard', 'mouse'];
  const wordExamples = [
    'The photo is on the screen.',
    'Press this button to start.',
    'Ben needs a longer cable.',
    'Where’s the remote control?',
    'Her keyboard is next to the laptop.',
    'This mouse doesn’t work.'
  ];
  const speakingBrief = 'Один коллаж 3×2, взрослые персонажи, современная бытовая среда. A: неопределённый объект/пятно поверх изображения на включённом экране. B: палец нажимает кнопку пульта, телевизор остаётся чёрным; два состояния показывают отсутствие реакции. C: ноутбук и экран нужно соединить, рядом явно повреждённый кабель. D: пустой экран, взрослый с пультом и знакомый спрашивает о результате. E: экран, клавиатура и мышь проверены и исправны; краткие отметки проверки всех трёх. F: человек двигает одну мышь, но указатель остаётся на месте; два состояния показывают результат. Без готовых ответов, перевода и правил; короткие фактические отметки только там, где результат иначе неясен.';
  const speakingImage = pendingImage('SPEAKING', speakingBrief);
  const opening = kit.speaking({
    id: prefix + '-M01', title: 'Speaking',
    image: {...speakingImage, crop: {x: 33.333, y: 0, w: 33.333, h: 50}},
    task: {text: 'Explain the problem and ask for help.'},
    use: [{phrases: ['When I press …, nothing …', 'There isn’t anything …', 'Can you help me, please?']}]
  });
  const wordPictures = [
    ['A', 'screen', 'biba_boba_computer_screen_an_adult_fingertip_pointing_to_the_a1945b42-9ee0-470e-b24b-3debf06846df_14.png'],
    ['B', 'cable', 'biba_boba_USB_cable_a_flexible_cord_arranged_in_a_loose_curve_3e68d658-7430-4cfc-93f2-fc1d50f62020_9.png'],
    ['C', 'keyboard', 'biba_boba_computer_keyboard_a_single_slim_desktop_keyboard_w_5cd54683-33cb-4329-a7a5-0fd8e603729c_13.png'],
    ['D', 'button', 'biba_boba_button_an_adult_fingertip_pressing_the_edge_of_a_r_50bc609d-64fd-4f8f-895c-2ca8cfc7f6bd_23.png'],
    ['E', 'mouse', 'biba_boba_computer_mouse_a_simple_oval_computer_mouse_with_t_4e11da6e-50b9-4886-92a7-7e7b925234d8_17.png'],
    ['F', 'remote control', 'biba_boba_TV_remote_control_an_adult_hand_holding_a_slim_rec_8e676fe3-7857-4250-a653-6b04f87a06e0_21.png']
  ];
  const wordMatch = E('M02', 'matching', 'Words', {
    layout: 'picture-word', instruction: 'Match the pictures with the words.',
    items: wordPictures.map(([label, answer, filename]) => {
      const assetId = prefix + '_WORD_' + label, image = 'Images/A2.1/' + filename;
      media[assetId] = {type: 'image', src: image, brief: answer, imageWidth: 496, imageHeight: 368};
      return {id: label, text: label, correctId: answer, assetId, image, alt: answer, imageWidth: 496, imageHeight: 368};
    }),
    options: ['keyboard', 'cable', 'mouse', 'screen', 'remote control', 'button'].map(text => ({id: text, text}))
  });
  const repeat = E('M03', 'audio', 'Listen and repeat', {
    layout: 'listen-repeat', audioPending: true,
    items: words.map((text, i) => {
      const word = pendingAudio('M03-WORD-' + (i + 1), text);
      const example = pendingAudio('M03-EXAMPLE-' + (i + 1), wordExamples[i]);
      return {id: String(i + 1), text, audioId: word.audioId, example: wordExamples[i], exampleAudioId: example.audioId};
    })
  });
  const wordPractice = E('M04', 'gaps', 'Complete the sentences.', {
    inputMode: 'text',
    items: [
      ['Can you pass me the ', 'remote control', '? I want to turn the TV off.'],
      ['This ', 'cable', ' is too short. I can’t connect my laptop to the TV.'],
      ['The picture on this ', 'screen', ' is very small. Can we use a bigger one?'],
      ['Press the green ', 'button', ' to start the computer.'],
      ['There’s coffee on my ', 'keyboard', '. I can’t type!'],
      ['I move the ', 'mouse', ', but the arrow on the screen doesn’t move.']
    ].map(([before, answer, after], i) => ({id: String(i + 1), segments: [before, {id: String(i + 1), answers: [answer]}, after]}))
  });
  const discovery = E('M05', 'matching', 'Match the sentences with their meanings.', {
    items: [
      ['There’s something on the screen.', 'C'],
      ['Can you see anything on the screen?', 'D'],
      ['Everything works.', 'B'],
      ['Nothing happened.', 'A']
    ].map(([text, correctId], i) => ({id: String(i + 1), text, correctId})),
    options: [
      {id: 'A', text: 'There was no change.'},
      {id: 'B', text: 'All the things we checked are OK.'},
      {id: 'C', text: 'There is a thing, but we don’t say what it is.'},
      {id: 'D', text: 'We want to know if a person can see a thing or not.'}
    ]
  });
  const rule = E('M06', 'rule-page', 'Something, anything, everything, nothing', {
    blocks: [
      {type: 'text', text: 'We use these words to talk about things without naming each one.'},
      {type: 'text', title: 'Something and anything', text: 'Use something when there is a thing, but you don’t say exactly what it is:\nThere’s something on the screen. I can’t see what it is.\n\nIn questions, anything is useful when you don’t know the answer. We also use it after a negative verb:\nCan you see anything on the screen?\nI can’t see anything.\n\nSomething is possible in questions too. For example, “Would you like something to drink?” is an offer. A question does not always need anything.', highlights: ['something', 'anything']},
      {type: 'text', title: 'Everything and nothing', text: 'Everything means all the things we are talking about. If the screen, keyboard and mouse are all OK, we can say:\nEverything works.\n\nNothing means no thing. These two sentences have the same meaning:\nThere’s nothing on the screen.\nThere isn’t anything on the screen.\n\nNothing already makes the sentence negative. Don’t add not:\nNothing happens when I press the button.', highlights: ['Everything', 'Nothing', 'nothing', 'isn’t anything', 'works', 'happens']},
      {type: 'text', title: 'The verb', text: 'When one of these words is the subject, use the verb form for one thing:\nSomething is on the screen.\nEverything works.\nNothing happens.\nDoes anything happen when you press the button?', highlights: ['is', 'works', 'happens', 'happen']}
    ]
  });
  const script = 'Alex: Dana, can you help? The meeting starts in ten minutes, and the big screen isn’t working.\nDana: Do the keyboard and mouse work?\nAlex: Yes. I can use the laptop, but there’s nothing on the big screen.\nDana: Check the cable between the laptop and the screen.\nAlex: It looks fine.\nDana: Can you see anything when you press this button on the remote control?\nAlex: No. Nothing happens. Oh, wait! This is the remote control for the other screen!\nDana: Try this one.\nAlex: Yes! There’s something on the screen now. It’s the picture from my laptop.\nDana: Great. Does everything work now?\nAlex: Yes. Thanks! Now I just need my notes.';
  const questions = E('M07-questions', 'choice', 'Why does Alex ask Dana for help?', {
    instruction: 'Listen and choose the correct answer.', progressiveQuestions: true,
    items: [
      {id: '1', prompt: 'Why does Alex ask Dana for help?', options: [
        {id: 'A', text: 'He needs a computer for a meeting.'},
        {id: 'B', text: 'He can’t show the picture from his laptop on a bigger screen.'},
        {id: 'C', text: 'He wants to buy a new keyboard.'}
      ], correctId: 'B'},
      {id: '2', prompt: 'What solves the problem?', options: [
        {id: 'A', text: 'Using a different remote control.'},
        {id: 'B', text: 'Getting a longer cable.'},
        {id: 'C', text: 'Turning on another laptop.'}
      ], correctId: 'A'},
      {id: '3', prompt: 'What can Alex do at the end?', options: [
        {id: 'A', text: 'Use the mouse, but not the keyboard.'},
        {id: 'B', text: 'Work only on his small laptop screen.'},
        {id: 'C', text: 'Use the big screen for his meeting.'}
      ], correctId: 'C'}
    ]
  });
  const heardLines = [
    ['There’s ', 'nothing', ' on the big screen.'],
    ['Can you see ', 'anything', ' when you press this button on the remote control?'],
    ['There’s ', 'something', ' on the screen now.'],
    ['Does ', 'everything', ' work now?']
  ];
  // Gaps have no per-item player. Existing grouped audio + gap components retain
  // each approved clip immediately before its field, using shared progression.
  const heard = E('M08', 'stage', 'Listen again and complete the sentences.', {
    progressive: true, requireCheckBeforeNext: true, unifiedProgression: true,
    exercises: heardLines.map(([before, answer, after], i) => {
      const n = String(i + 1);
      return {id: n, exercise: E('M08-part-' + n, 'stage', 'Listen again and complete the sentences.', {
        layout: 'grouped', exercises: [
          {id: 'player', exercise: E('M08-player-' + n, 'audio', 'Listen again and complete the sentences.', pendingAudio('LISTENING-CLIP-' + n, before + answer + after))},
          {id: 'line', exercise: E('M08-gap-' + n, 'gaps', 'Listen again and complete the sentences.', {
            inputMode: 'text', items: [{id: n, segments: [before, {id: n, answers: [answer]}, after]}]
          })}
        ]
      })};
    })
  });
  // The first reveal includes source + question. Later reveals retain that source.
  const listening = E('M07', 'stage', 'The meeting starts soon', {
    progressive: true, revealStops: [2, 3, 4, 5], requireCheckBeforeNext: true, unifiedProgression: true,
    transcript: script, transcriptAfter: ['gist', 'details', 'result'],
    exercises: [
      {id: 'player', exercise: E('M07-player', 'audio', 'The meeting starts soon', pendingAudio('LISTENING', script))},
      {id: 'gist', exercise: {...questions, id: prefix + '-M07-gist', title: 'The meeting starts soon', items: questions.items.slice(0, 1)}},
      {id: 'details', exercise: {...questions, id: prefix + '-M07-details', title: 'The meeting starts soon', instruction: 'Listen again. Choose the correct answers.', items: questions.items.slice(1, 2)}},
      {id: 'result', exercise: {...questions, id: prefix + '-M07-result', title: 'The meeting starts soon', instruction: '', items: questions.items.slice(2)}},
      {id: 'M08', exercise: heard}
    ]
  });
  const dropdownPractice = E('M09', 'gaps', 'Ready for a call', {
    instruction: 'Choose the correct words.', inputMode: 'select', layout: 'paragraph',
    items: [
      {id: '1', segments: ['I’m ready for my video call. I checked the screen, keyboard and mouse. They all work: ', {id: '1', answers: ['Everything'], options: ['Nothing', 'Everything', 'Anything']}, ' works.']},
      {id: '2', segments: ['But now I can’t see my friend clearly. Something ', {id: '2', answers: ['is'], options: ['are', 'am', 'is']}, ' on the screen. It’s a message in a red box.']},
      {id: '3', segments: ['I press the button to close it, but ', {id: '3', answers: ['nothing happens'], options: ['nothing happens', 'nothing happen', 'nothing doesn’t happen']}, '. The message is still there.']},
      {id: '4', segments: ['My friend helps me close it. Now there ', {id: '4', answers: ['isn’t anything'], options: ['isn’t anything', 'isn’t nothing', 'aren’t anything']}, ' covering the picture.']}
    ]
  });
  const writing = E('M10', 'writing', 'Write sentences and questions. Use the words.', {
    responseMode: 'open',
    items: [
      'anything / on the screen / ?',
      'something / under the keyboard',
      'everything / work / now',
      'nothing / happen / when / I / press / button',
      'I / not / see / anything / on the screen'
    ].map((prompt, i) => ({id: String(i + 1), prompt}))
  });
  const final = kit.speaking({
    id: prefix + '-M11', title: 'Speaking', image: speakingImage,
    task: {text: 'Ask and answer questions about the pictures. Explain what works, what doesn’t work and what you need.'},
    use: [{phrases: ['There’s something …', 'Is there anything …?', 'There isn’t anything …', 'Nothing happens when …', 'Does everything …?', 'Everything …', 'I need …', 'Can you help me …?']}]
  });
  const stages = [
    stage('Opening Speaking', 1, opening),
    stage('Words', 2, wordMatch),
    stage('Listen & Repeat', 1.5, repeat, 'Adult natural AmE voice; word, then example. Audio is pending.'),
    stage('Word Practice', 2, wordPractice),
    stage('Guided Discovery', 1.5, discovery),
    stage('Rule', 3, rule),
    stage('Listening', 6, listening, 'First listening: question 1. Second listening: questions 2–3. The script stays locked until all three answers are submitted. M08 uses four exact clips from that same recording; no new dialogue.'),
    stage('Practice', 2, dropdownPractice),
    stage('Writing', 4, writing, 'Open answers require teacher review. Approved cues are preserved. Examples: Is there anything on the screen? / Can you see anything on the screen?; There’s something under the keyboard.; Everything works now.; Nothing happens when I press the button.; I can’t see anything on the screen. / I don’t see anything on the screen.'),
    stage('Final Speaking', 7, final)
  ];
  const lesson = {
    id, level: 'A2.2', whale: 6, lessonNumber: 1, title: 'Что-то не работает',
    summary: 'Уточнить, что нужно, имеется или не работает.',
    grammar: 'something / anything / everything / nothing; единственное число; nothing и not + anything',
    constructions: 'There’s something … · Is there anything …? · There isn’t anything … · Nothing happens when … · Does everything work?',
    words, durationMinutes: 30, contentVersion: 'approved-scenario-2026-10-11', stages,
    structure: [
      {role: 'opening', sources: [opening.id]},
      {role: 'words', sources: [wordMatch.id, repeat.id]},
      {role: 'wordPractice', sources: [wordPractice.id]},
      {role: 'focus', sources: [discovery.id, rule.id]},
      {role: 'listening', sources: [listening.id]},
      {role: 'practice', sources: [dropdownPractice.id, writing.id]},
      {role: 'final', sources: [final.id]}
    ]
  };
  stages.forEach(entry => kit.validate(entry.exercise));
  window.SpaceWhaleLessonMedia = {...(window.SpaceWhaleLessonMedia || {}), [id]: media};
  window.SpaceWhaleContent = window.SpaceWhaleContent || [];
  const at = window.SpaceWhaleContent.findIndex(entry => entry.id === id);
  if (at < 0) window.SpaceWhaleContent.push(lesson); else window.SpaceWhaleContent[at] = lesson;
})();
