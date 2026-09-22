(() => {
  'use strict';

  const kit = window.SpaceWhaleExerciseKit;
  if (!kit) throw new Error('SpaceWhaleExerciseKit is required.');

  const stages = [
    {
      menu: 'Match the parts',
      title: 'Meet people at school',
      exercise: {
        version: 1,
        id: 'first-day-match-parts',
        kind: 'matching',
        title: 'Match the sentence parts.',
        instruction: 'Click + and make pairs.',
        items: [
          { id: 'm1', text: 'Welcome to', correctId: 'o5' },
          { id: 'm2', text: 'I’m', correctId: 'o3' },
          { id: 'm3', text: 'My name', correctId: 'o6' },
          { id: 'm4', text: 'This is', correctId: 'o4' },
          { id: 'm5', text: 'Let me introduce', correctId: 'o1' },
          { id: 'm6', text: 'Pleased', correctId: 'o2' }
        ],
        options: [
          { id: 'o1', text: 'our principal' },
          { id: 'o2', text: 'to meet you' },
          { id: 'o3', text: 'new here' },
          { id: 'o4', text: 'your teacher' },
          { id: 'o5', text: 'our class' },
          { id: 'o6', text: 'is Alex' }
        ]
      }
    },
    {
      menu: 'Words in context',
      title: 'Complete the sentences',
      exercise: {
        version: 1,
        id: 'first-day-word-bank',
        kind: 'gaps',
        title: 'Complete the sentences.',
        instruction: 'Choose a word from the bank for each gap.',
        bank: ['classmate', 'teacher', 'class', 'principal', 'receptionist', 'student'],
        items: [
          { id: 's1', segments: ['The bell rings at 9:00. Our English ', { id: 'g1', answers: ['teacher'] }, ' starts now.'] },
          { id: 's2', segments: ['I sit next to Ben in maths. He is my ', { id: 'g2', answers: ['classmate'] }, '.'] },
          { id: 's3', segments: ['Ms Green is our ', { id: 'g3', answers: ['teacher'] }, '. She gives us English homework every Friday.'] },
          { id: 's4', segments: ['A new ', { id: 'g4', answers: ['student'] }, ' is at the school today. He is 12 and has six lessons.'] },
          { id: 's5', segments: ['I don’t know where room 12 is, so I ask the ', { id: 'g5', answers: ['receptionist'] }, ' at the desk near the door.'] },
          { id: 's6', segments: ['All the teachers are in a meeting with the ', { id: 'g6', answers: ['principal'] }, ' this morning.'] }
        ]
      }
    },
    {
      menu: 'Discovery + Rule',
      title: 'Notice the pattern',
      exercise: {
        version: 1,
        id: 'first-day-discovery-rule',
        kind: 'rule-page',
        title: 'Introducing yourself and other people',
        instruction: 'Look at the examples, notice the pattern, then read the rule.',
        blocks: [
          {
            type: 'text',
            title: 'Look at the examples.',
            text: 'Welcome to our class!\nLet me introduce Ms Green, our principal.\nPleased to meet you.', highlights: ['Welcome to', 'Let me introduce', 'Pleased to meet you']
          },
          {
            type: 'exercise',
            id: 'lead-in',
            exercise: {
              version: 1,
              id: 'first-day-discovery',
              kind: 'choice',
              title: 'Choose the correct options.',
              instruction: 'Use the examples above.',
              items: [
                {
                  id: 'q1',
                  prompt: 'After Welcome to, use...',
                  options: [
                    { id: 'place', text: 'a place or group' },
                    { id: 'action', text: 'an action' }
                  ],
                  correctId: 'place'
                },
                {
                  id: 'q2',
                  prompt: 'After Let me introduce, use...',
                  options: [
                    { id: 'person', text: 'a person' },
                    { id: 'place', text: 'a place' }
                  ],
                  correctId: 'person'
                },
                {
                  id: 'q3',
                  prompt: 'Use Pleased to meet you...',
                  options: [
                    { id: 'first', text: 'when you meet someone for the first time' },
                    { id: 'bye', text: 'when you say goodbye' }
                  ],
                  correctId: 'first'
                }
              ]
            }
          },
          {
            type: 'rule',
            title: 'Useful phrases',
            text: 'Используем эти фразы, когда приходим в новое место, представляемся и знакомимся с другими людьми.',
            examples: [
              'Welcome to + place / group — Welcome to our school.',
              'I’m new here. — говорим, что мы здесь новенькие.',
              'My name is + name — My name is Anna.',
              'This is + person — This is Mr Brown, our teacher.',
              'Let me introduce + person — Let me introduce our principal.',
              'Pleased to meet you. — говорим при первом знакомстве.'
            ]
          }
        ]
      }
    },
    {
      menu: 'Speaking',
      title: 'First day at a new school',
      exercise: {
        version: 1,
        id: 'first-day-speaking',
        kind: 'presentation',
        title: 'Speak.',
        instruction: 'Use the six scenes in order and make short dialogues.',
        blocks: [
          {
            type: 'image',
            image: 'assets/draft-first-day-speaking.webp',
            alt: 'Six school scenes: reception, directions, teacher, principal, classmate and class'
          },
          {
            type: 'text',
            text: 'Imagine it is your first day at a new school. Introduce yourself, greet people and introduce other people at school. Make a short dialogue for each picture.'
          },
          {
            type: 'disclosure',
            title: 'Useful language',
            text: '1. Welcome to...\n2. My name is... I am a...\n3. This is...\n4. Let me introduce...\n5. This is... / Pleased to meet...\n6. Welcome to...'
          }
        ]
      }
    },
    {
      menu: 'Quick check',
      title: 'Choose the correct option',
      exercise: {
        version: 1,
        id: 'first-day-quick-check',
        kind: 'choice',
        title: 'Choose the correct option.',
        instruction: 'Complete each mini-dialogue.',
        items: [
          {
            id: 'c1',
            prompt: 'Receptionist: Hi, Anna. ___ our school!',
            options: [
              { id: 'a', text: 'This is' },
              { id: 'b', text: 'Welcome to' },
              { id: 'c', text: 'My name is' }
            ],
            correctId: 'b'
          },
          {
            id: 'c2',
            prompt: 'Teacher: Ben, ___ Sara, your new classmate.',
            options: [
              { id: 'a', text: 'Pleased to meet you' },
              { id: 'b', text: 'This is' },
              { id: 'c', text: 'Welcome to' }
            ],
            correctId: 'b'
          },
          {
            id: 'c3',
            prompt: 'A: Which class are you in? B: I don’t know. ___.',
            options: [
              { id: 'a', text: 'This is my class' },
              { id: 'b', text: 'Pleased to meet you' },
              { id: 'c', text: 'I’m new here' }
            ],
            correctId: 'c'
          }
        ]
      }
    }
  ];

  stages.forEach(stage => kit.validate(stage.exercise));
  window.SpaceWhaleContent = window.SpaceWhaleContent || [];
  window.SpaceWhaleContent.push({
    id: 'first-day-school', title: 'Первый день в новой школе', level: null, whale: null, stages
  });
})();
