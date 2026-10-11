(() => {
  'use strict';
  const kit = window.SpaceWhaleExerciseKit;
  if (!kit) return;
  const id = 'a2-2-w6-l2', prefix = 'A22M6L2', media = {};
  const E = (name, kind, title, extra = {}) => ({version: 1, id: prefix + '-' + name, kind, title, ...extra});
  const stage = (menu, time, exercise, teacherNotes = '') => ({menu, navigationTitle: menu, section: 'tasks', guide: {time: time + ' min', teacherNotes}, exercise});
  const courseAudioBase = 'https://xpeywyonbapnvtjnwawi.supabase.co/storage/v1/object/public/course-audio';
  const audioVersion = '20261011-clips-realigned-r3';
  const audioSrc = name => {
    if (/^M03-(?:WORD|EXAMPLE)-[1-6]$/.test(name)) {
      return courseAudioBase + '/a2-2/w6/l2/listen-repeat/' + name + '.mp3?v=' + audioVersion;
    }
    if (name === 'LISTENING') {
      return courseAudioBase + '/a2-2/w6/l2/listening/a-busy-day.mp3?v=' + audioVersion;
    }
    if (/^LISTENING-CLIP-[1-4]$/.test(name)) {
      return courseAudioBase + '/a2-2/w6/l2/listening/' + name + '.mp3?v=' + audioVersion;
    }
    return null;
  };
  const pendingAudio = (name, script) => {
    const audioId = prefix + '_' + name;
    const src = audioSrc(name);
    media[audioId] = {type: 'audio', src, script};
    return src ? {audioId, audio: src, audioPending: false} : {audioId, audioPending: true};
  };
  const words = ['send a package', 'buy an envelope', 'buy medicine', 'rent a car', 'book an appointment', 'make a photocopy'];
  const speaking = {
    title: 'Help each other find a place.', image: null,
    task: {text: 'Ask where you can do these things. Use the notes to answer your partner. Take turns.', bullets: [
      'Send a package: post office near the station.',
      'Buy an envelope: checked every shop in this street; no envelopes.',
      'Buy medicine: pharmacy next to the supermarket.',
      'Rent a car: all car rental offices in town are closed today.',
      'Book an appointment: clinic across the street.',
      'Make a photocopy: not at the hotel; a shop near the station can help.'
    ]},
    use: [
      {words},
      {words: ['somewhere', 'anywhere', 'everywhere', 'nowhere'], phrases: [
        'Is there … to …?', 'I know … to … .', 'There’s … to … .',
        'I can’t find … to … .', 'I looked … .'
      ]}
    ]
  };
  const opening = kit.speaking({id: prefix + '-M01', ...speaking});
  const final = kit.speaking({id: prefix + '-M11', ...speaking});
  const wordExamples = [
    'Ben needs to send a package to his sister.',
    'Can we buy an envelope here?',
    'Laura wants to buy medicine for her cold.',
    'My parents want to rent a car for the weekend.',
    'You can book an appointment by phone.',
    'I need to make a photocopy of this page.'
  ];
  const wordPictures = [
    ['A', 'rent a car', 'biba_boba_renting_a_car_an_adult_customer_signing_a_short-ter_56664542-f809-437f-a844-d8e196f0da0d_2.png'],
    ['B', 'send a package', 'biba_boba_sending_a_package_an_adult_customer_placing_a_seale_91e0ce23-ed90-4b3b-a3bd-877e6e9f6533_0.png'],
    ['C', 'book an appointment', 'biba_boba_booking_a_doctors_appointment_close-up_of_a_smartp_fefe4f54-4102-41fc-a264-e2b70def47df_11.png'],
    ['D', 'make a photocopy', 'biba_boba_making_a_photocopy_an_adult_hand_pressing_a_button_eaae9a15-99e5-49aa-aa45-7d983f63eaa3_14.png'],
    ['E', 'buy medicine', 'biba_boba_buying_medicine_at_a_pharmacy_an_adult_customer_ta_9a2cd5d8-9e77-46fe-a5d4-1a8d2a3ca574_15.png'],
    ['F', 'buy an envelope', 'buy-an-envelope.png']
  ];
  const wordMatch = E('M02', 'matching', 'Words', {
    layout: 'picture-word', instruction: 'Match the pictures with the phrases.',
    items: wordPictures.map(([label, answer, filename]) => {
      const assetId = prefix + '_WORD_' + label, image = 'Images/Текущие/A2.1/' + filename;
      media[assetId] = {type: 'image', src: image, imageWidth: 496, imageHeight: 368};
      return {id: label, text: label, correctId: answer, assetId, image, alt: answer, imageWidth: 496, imageHeight: 368};
    }),
    options: ['make a photocopy', 'buy medicine', 'send a package', 'book an appointment', 'rent a car', 'buy an envelope'].map(text => ({id: text, text}))
  });
  const repeat = E('M03', 'audio', 'Listen and repeat', {
    layout: 'listen-repeat', audioPending: false,
    items: words.map((text, i) => {
      const word = pendingAudio('M03-WORD-' + (i + 1), text);
      const example = pendingAudio('M03-EXAMPLE-' + (i + 1), wordExamples[i]);
      return {id: String(i + 1), text, audioId: word.audioId, audio: word.audio, example: wordExamples[i], exampleAudioId: example.audioId, exampleAudio: example.audio};
    })
  });
  const wordPractice = E('M04', 'gaps', 'A busy morning', {
    instruction: 'Complete the sentences.', inputMode: 'text',
    bank: ['make a photocopy', 'buy medicine', 'send a package', 'book an appointment', 'rent a car', 'buy an envelope'],
    items: [
      ['My aunt lives in another city. I want to ', 'send a package', ' with her birthday present inside.'],
      ["We're only here for two days. We want to ", 'rent a car', ' so we can drive to the beach.'],
      ['I need to ', 'buy an envelope', ' before I can send this letter.'],
      ['The dentist can see me on Tuesday. I need to call and ', 'book an appointment', '.'],
      ['This is my only copy of the form, and the hotel needs a copy too. Can I ', 'make a photocopy', ' here?'],
      ['My cold is worse today. I need to ', 'buy medicine', '.']
    ].map(([before, answer, after], i) => ({id: String(i + 1), segments: [before, {id: String(i + 1), answers: [answer]}, after]}))
  });
  const discoveryTitle = 'Read the examples and complete the rules.';
  const discovery = E('M05', 'stage', discoveryTitle, {
    progressive: true, revealStops: [2], unifiedProgression: true, exercises: [
      {id: 'examples', exercise: E('M05-examples', 'presentation', discoveryTitle, {
        blocks: [{type: 'text', text: 'I know somewhere to buy medicine.\nIs there anywhere to make a photocopy?\nThere’s nowhere to rent a car in this village.', highlights: ['somewhere', 'anywhere', 'nowhere']}]
      })},
      {id: 'rules', exercise: E('M05-rules', 'gaps', discoveryTitle, {
        inputMode: 'select', progressiveQuestions: true,
        items: [
          {id: '1', segments: ['The words in bold describe ', {id: '1', answers: ['places'], options: ['people', 'places', 'things']}, '.']},
          {id: '2', segments: ['Nowhere means ', {id: '2', answers: ['no place'], options: ['all places', 'no place', 'one place']}, '.']},
          {id: '3', segments: ['To talk about an action after somewhere, anywhere or nowhere, use ', {id: '3', answers: ['to + verb'], options: ['to + verb', 'verb + -ing', 'in + verb']}, '.']}
        ]
      })}
    ]
  });
  const rule = E('M06', 'rule-page', 'Somewhere, anywhere, everywhere, nowhere', {
    blocks: [
      {type: 'text', text: 'We use somewhere when there is a place, but we do not say which place.\n\nI know somewhere to buy an envelope.', highlights: ['somewhere']},
      {type: 'text', text: "We often use anywhere in questions when we do not know the answer. We also use it with not when we cannot find a place. Somewhere is also possible in questions, especially when we think there is a place.\n\nIs there anywhere to rent a car near here?\nI can't find anywhere to rent a car.", highlights: ['anywhere', 'not', 'Somewhere']},
      {type: 'text', text: "Everywhere means all the places we are talking about. Nowhere means no place.\n\nI looked everywhere in the hotel.\nThere's nowhere in this hotel to make a photocopy.", highlights: ['Everywhere', 'Nowhere', 'everywhere', 'nowhere']},
      {type: 'text', text: "Nowhere already means “no place”, so do not add not. We can say the same thing with not + anywhere.\n\nThere's nowhere to make a photocopy here.\nThere isn't anywhere to make a photocopy here.", highlights: ['Nowhere', 'not + anywhere', 'nowhere', "isn't anywhere"]},
      {type: 'text', text: 'When we say what we want to do in a place, we use somewhere / anywhere / nowhere + to + verb.\n\nWe need somewhere to buy medicine.\nIs there anywhere to book an appointment?', highlights: ['somewhere / anywhere / nowhere + to + verb', 'somewhere to buy', 'anywhere to book']},
      {type: 'text', text: 'These words already tell us about a place. Say go somewhere and look everywhere, without adding to or in before the place word. The to in somewhere to buy medicine goes with the action buy.\n\nWe still use look for to mean “try to find”: I’m looking for somewhere to rent a car. We can also add details: somewhere in town, anywhere near the station.', highlights: ['go somewhere', 'look everywhere', 'look for', 'for somewhere', 'somewhere', 'anywhere']}
    ]
  });
  const script = 'Alex: I need to send a package and a letter today, but I can’t find anywhere to buy an envelope.\nNina: Try the post office by the station.\nAlex: Can they help with copies? There’s nowhere to make a photocopy in this hotel.\nNina: Yes, they can. Did you rent a car for tomorrow?\nAlex: No. I looked everywhere online. The prices were too high.\nNina: Why do you need a car?\nAlex: To visit my dad and help him buy medicine. He doesn’t speak English.\nNina: There’s somewhere to rent a car near my office. Let me call them.\nAlex: Thanks! I’ll go to the post office now. I can do all that in one place!';
  const questionItems = [
    {id: '1', prompt: 'Why is the post office useful for Alex?', options: [
      {id: 'A', text: 'He can collect something from his father.'},
      {id: 'B', text: 'He can do several small jobs in one visit.'},
      {id: 'C', text: 'He can ask about a car there.'}
    ], correctId: 'B'},
    {id: '2', prompt: 'Why does Alex need a car tomorrow?', options: [
      {id: 'A', text: 'He wants to take a trip with Nina.'},
      {id: 'B', text: 'He needs to take a package to another city.'},
      {id: 'C', text: 'He wants to help a family member.'}
    ], correctId: 'C'},
    {id: '3', prompt: 'What will Nina do next?', options: [
      {id: 'A', text: 'Ask another company about a car.'},
      {id: 'B', text: "Buy medicine for Alex's father."},
      {id: 'C', text: 'Go to the post office with Alex.'}
    ], correctId: 'A'}
  ];
  const heardLines = [
    ['I need to send a package and a letter today, but I can’t find ', 'anywhere', ' to buy an envelope.'],
    ['There’s ', 'nowhere', ' to make a photocopy in this hotel.'],
    ['I looked ', 'everywhere', ' online.'],
    ['There’s ', 'somewhere', ' to rent a car near my office.']
  ];
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
  // Keep the conversation mounted while Q1, Q2, Q3 and the four clips reveal.
  const listening = E('M07', 'stage', 'A busy day', {
    instruction: 'Alex and Nina are talking in a hotel.',
    progressive: true, revealStops: [2, 3, 4, 5], requireCheckBeforeNext: true, unifiedProgression: true,
    transcript: script, transcriptAfter: ['gist', 'details', 'result'],
    exercises: [
      {id: 'player', exercise: E('M07-player', 'audio', 'A busy day', pendingAudio('LISTENING', script))},
      {id: 'gist', exercise: E('M07-gist', 'choice', 'A busy day', {instruction: 'Listen and choose the correct answer.', items: questionItems.slice(0, 1)})},
      {id: 'details', exercise: E('M07-details', 'choice', 'A busy day', {instruction: 'Listen again. Answer questions 2 and 3.', items: questionItems.slice(1, 2)})},
      {id: 'result', exercise: E('M07-result', 'choice', 'A busy day', {items: questionItems.slice(2)})},
      {id: 'M08', exercise: heard}
    ]
  });
  const dropdownPractice = E('M09', 'gaps', 'Can I do it here?', {
    instruction: 'Choose the correct words.', inputMode: 'select',
    items: [
      {id: '1', segments: ['There are three shops in this shopping center. I asked in all three. I asked ', {id: '1', answers: ['everywhere'], options: ['nowhere', 'everywhere', 'anywhere']}, ' in the shopping center.']},
      {id: '2', segments: ["I didn't find ", {id: '2', answers: ['anywhere'], options: ['anywhere', 'nowhere', 'everywhere']}, ' to rent a car for less than $80 a day.']},
      {id: '3', segments: ["There's ", {id: '3', answers: ['somewhere'], options: ['in somewhere', 'to somewhere', 'somewhere']}, ' to buy medicine near my office. I can show you.']},
      {id: '4', segments: ["There's nowhere ", {id: '4', answers: ['to buy'], options: ['buying', 'to buy', 'buy']}, " an envelope in this hotel. Let's go to the post office."]}
    ]
  });
  const writing = E('M10', 'writing', 'Write sentences and questions. Use the words.', {
    responseMode: 'open', items: [
      'anywhere / rent a car / near here / ?',
      'I / know / somewhere / buy an envelope',
      'yesterday / I / look / everywhere / in the hotel',
      'nowhere / make a photocopy / here',
      'not / anywhere / buy medicine / near here'
    ].map((prompt, i) => ({id: String(i + 1), prompt}))
  });
  const stages = [
    stage('Opening Speaking', 1, opening, 'Repeat the same Speaking task at the beginning and end of the lesson.'),
    stage('Words', 2, wordMatch),
    stage('Listen & Repeat', 1.5, repeat, 'Adult natural AmE voice; phrase, then example. Audio is pending.'),
    stage('Word Practice', 2, wordPractice),
    stage('Guided Discovery', 1.5, discovery),
    stage('Rule', 3, rule),
    stage('Listening', 6, listening, 'First listening: question 1. Second listening: questions 2–3. The script stays locked until all three answers are submitted. M08 uses four exact clips from this recording. The approved dialogue does not include book an appointment.'),
    stage('Practice', 2, dropdownPractice),
    stage('Writing', 4, writing, 'Open answers require teacher review. Approved cues are preserved. Examples: Is there anywhere to rent a car near here? / Do you know anywhere to rent a car near here?; I know somewhere to buy an envelope.; Yesterday I looked everywhere in the hotel.; There’s nowhere to make a photocopy here.; There isn’t anywhere to buy medicine near here. / I can’t find anywhere to buy medicine near here.'),
    stage('Final Speaking', 7, final, 'Repeat the same Speaking task at the beginning and end of the lesson.')
  ];
  const lesson = {
    id, level: 'A2.2', whale: 6, lessonNumber: 2, title: 'Где это найти',
    summary: 'Найти место, где можно получить нужную услугу.',
    grammar: 'somewhere / anywhere / everywhere / nowhere; nowhere и not + anywhere; somewhere / anywhere / nowhere + to + verb',
    constructions: 'Is there anywhere to …? · I know somewhere to … · I looked everywhere … · There’s nowhere to … · I can’t find anywhere to …',
    words, durationMinutes: 30, contentVersion: 'approved-scenario-picture-words-speaking-deferred-2026-10-11-clips-realigned-r3', stages,
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
