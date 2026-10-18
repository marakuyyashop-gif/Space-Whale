/* B1.1 / Module 2 — approved non-audio Grammar Practice after Discovery and Rule.
 * Source: the user's Grammar Practice text, 2026-10-18.
 * Content, keys and model answers live here; all appearance and interaction come
 * from the shared E01 / E03A / E11 / E11A / Q01 template registry.
 */
(() => {
  'use strict';
  const kit = window.SpaceWhaleExerciseKit;
  if (!kit) throw new Error('SpaceWhaleExerciseKit is required.');

  const writing = (id, title, instruction, items) => ({
    version: 1, id, templateCode: 'E11', kind: 'writing', title, instruction,
    responseMode: 'open', showAuthoredSamples: true, revealPossibleAnswers: true, items
  });
  const oral = (id, title, instruction, file, alt, text, possibleAnswers) => ({
    version: 1, id, templateCode: 'E11A', kind: 'presentation', title, instruction,
    blocks: [
      {type: 'image', image: 'assets/lesson-media/b1-1/module-2/grammar/' + file, alt},
      {type: 'text', text}
    ],
    // These are reference keys, not initial learner scaffolds or exact-match grades.
    authoring: {possibleAnswers}
  });
  const gap = (id, options, answer) => ({id, options, answers: [answer]});
  const option = (id, text) => ({id, text});

  const additions = [
    {
      lessonId: 'b1-1-w2-l1',
      tasks: [
        {time: '3 min', exercise: writing(
          'B11M02L01_E11_GRAMMAR_PRACTICE',
          'Change the past',
          'Read what really happened. Write one Third Conditional sentence. Follow the instruction in brackets.',
          [
            {id: 'nora', prompt: 'Nora postponed the decision. She missed the opportunity.\n(Start with If.)', possibleAnswers: ['If Nora hadn’t postponed the decision, she wouldn’t have missed the opportunity.']},
            {id: 'leo', prompt: 'Leo did not get the qualification. He did not achieve his goal.\n(Start with the result.)', possibleAnswers: ['Leo would have achieved his goal if he had gotten the qualification.']},
            {id: 'sam', prompt: 'Sam faced difficulties with the form. He did not submit an application.\n(Start with If.)', possibleAnswers: ['If Sam hadn’t faced difficulties with the form, he would have submitted an application.']}
          ]
        )},
        {time: '1 min', exercise: oral(
          'B11M02L01_E11A_GRAMMAR_PRACTICE',
          'Say it aloud',
          'Look at the timeline. Change the past and say one complete sentence.',
          'l1-timeline.svg',
          'The team faced difficulties. As a result, the team did not achieve its goal.',
          'Do not write the sentence first.',
          ['If the team hadn’t faced difficulties, it would have achieved its goal.']
        )}
      ]
    },
    {
      lessonId: 'b1-1-w2-l2',
      tasks: [
        {time: '4 min', exercise: writing(
          'B11M02L02_E11_GRAMMAR_PRACTICE',
          'Write the questions',
          'Use the notes to write complete questions. Add a short answer where it is given.',
          [
            {id: 'responsibility', prompt: 'you / know the team was under pressure / take on responsibility?\nAnswer: yes', multiline: true, possibleAnswers: ['Would you have taken on the responsibility if you had known the team was under pressure?\nYes, I would have.']},
            {id: 'agreement', prompt: 'the managers / explore more alternatives / reach an agreement?\nAnswer: no', multiline: true, possibleAnswers: ['Would the managers have reached an agreement if they had explored more alternatives?\nNo, they wouldn’t have.']},
            {id: 'problem', prompt: 'you / the manager not look into the problem / what do?', possibleAnswers: ['What would you have done if the manager hadn’t looked into the problem?']},
            {id: 'concerns', prompt: 'the team / express concerns earlier / how the decision change?', possibleAnswers: ['How would the decision have changed if the team had expressed its concerns earlier?']}
          ]
        )},
        {time: '2 min', exercise: {
          version: 1, id: 'B11M02L02_Q01_GRAMMAR_PRACTICE', templateCode: 'Q01', kind: 'presentation',
          title: 'Ask your partner',
          instruction: 'Use the notes to make two questions. Do not write them first.',
          blocks: [
            {type: 'text', text: '1. the team was under pressure → take on responsibility?\n2. the manager did not look into the problem → what do?'},
            {type: 'text', text: 'Ask your partner both questions. Then switch roles and answer the same questions.'},
            {type: 'disclosure', title: 'Help', text: 'Would you have … if …?\nWhat would you have done if …?'}
          ],
          authoring: {
            possibleQuestions: [
              'Would you have taken on the responsibility if the team had been under pressure?',
              'What would you have done if the manager hadn’t looked into the problem?'
            ],
            responseGuidance: 'Answers may vary. They should answer the question and use would / wouldn’t have + V3.'
          }
        }}
      ]
    },
    {
      lessonId: 'b1-1-w2-l3',
      tasks: [
        {time: '2 min', exercise: {
          version: 1, id: 'B11M02L03_E01_GRAMMAR_PRACTICE', templateCode: 'E01', kind: 'choice',
          title: 'Choose the sentence that matches the speaker’s purpose',
          items: [
            {id: 'nina', prompt: 'You are Nina. You only want to say that you regret not apologizing.', options: [
              option('A', 'If I had apologized, my friend would have forgiven me.'),
              option('B', 'I wish I had apologized.'),
              option('C', 'I didn’t apologize because I was angry.')
            ], correctId: 'B'},
            {id: 'leo', prompt: 'You are Leo. You want to explain how a different past action would have changed the result.', options: [
              option('A', 'If I hadn’t shared the message, my friend wouldn’t have felt betrayed.'),
              option('B', 'If only I hadn’t shared the message.'),
              option('C', 'I felt guilty after sharing the message.')
            ], correctId: 'A'},
            {id: 'ava', prompt: 'You are Ava. You directly regret speaking rudely.', options: [
              option('A', 'If I had spoken more politely, I wouldn’t have felt ashamed.'),
              option('B', 'I wish I hadn’t spoken so rudely.'),
              option('C', 'I spoke politely after that.')
            ], correctId: 'B'},
            {id: 'mark', prompt: 'You are Mark. You want to explain a different past result, not simply express regret.', options: [
              option('A', 'If only I had prepared better.'),
              option('B', 'I wish I had prepared better.'),
              option('C', 'If I had prepared better, I wouldn’t have felt so embarrassed.')
            ], correctId: 'C'}
          ]
        }},
        {time: '4 min', exercise: writing(
          'B11M02L03_E11_GRAMMAR_PRACTICE',
          'Write two sentences',
          'For each situation, write a direct regret with I wish or If only; then write a Third Conditional sentence showing a different result.',
          [
            {id: 'situation-1-regret', prompt: 'Situation 1\nYou shared a private message. Your friend felt betrayed. You now feel guilty.\nRegret:', possibleAnswers: ['I wish I hadn’t shared the private message.', 'If only I hadn’t shared the private message.']},
            {id: 'situation-1-result', prompt: 'Different past result:', possibleAnswers: ['If I hadn’t shared the message, my friend wouldn’t have felt betrayed.']},
            {id: 'situation-2-regret', prompt: 'Situation 2\nYou did not apologize. The argument continued. You felt miserable.\nRegret:', possibleAnswers: ['I wish I had apologized.', 'If only I had apologized.']},
            {id: 'situation-2-result', prompt: 'Different past result:', possibleAnswers: ['If I had apologized, the argument would have ended.']}
          ]
        )},
        {time: '1–2 min', exercise: oral(
          'B11M02L03_E11A_GRAMMAR_PRACTICE',
          'Say it aloud',
          'Imagine you are Alex.',
          'l3-regret.svg',
          'Alex told a private story in front of other people. Alex’s friend felt embarrassed. Alex now feels ashamed.',
          'Say one direct regret and one Third Conditional sentence.\nDo not write the sentences first.',
          [
            'I wish I hadn’t told the private story.',
            'If only I hadn’t told the private story.',
            'If I hadn’t told the story, my friend wouldn’t have felt embarrassed.'
          ]
        )}
      ]
    },
    {
      lessonId: 'b1-1-w2-l4',
      tasks: [
        {time: '2 min', exercise: {
          version: 1, id: 'B11M02L04_E03A_GRAMMAR_PRACTICE', templateCode: 'E03A', kind: 'gaps',
          title: 'Choose the correct options', inputMode: 'select', preserveLines: true,
          items: [
            {id: 'nora-now', segments: [
              'Nora\nNora is not very self-confident now. There is a new job available next month.\nIf she ',
              gap('nora-now-condition', ['had been', 'were'], 'were'),
              ' more self-confident, she ',
              gap('nora-now-result', ['would apply', 'would have applied'], 'would apply'),
              ' for the job.'
            ]},
            {id: 'nora-past', segments: [
              'Last year, Nora did not apply for a similar job because she was not self-confident.\nIf she ',
              gap('nora-past-condition', ['had been', 'were'], 'had been'),
              ' more self-confident then, she ',
              gap('nora-past-result', ['would apply', 'would have applied'], 'would have applied'),
              '.'
            ]},
            {id: 'leo-now', segments: [
              'Leo\nLeo often forgets to finish tasks. His manager does not trust him with important work.\nIf Leo ',
              gap('leo-now-condition', ['were', 'had been'], 'were'),
              ' more reliable, his manager ',
              gap('leo-now-result', ['would have trusted', 'would trust'], 'would trust'),
              ' him with important work.'
            ]},
            {id: 'leo-past', segments: [
              'Leo missed an important deadline last month, and the project finished late.\nIf he ',
              gap('leo-past-condition', ['were', 'had been'], 'had been'),
              ' more reliable, the project ',
              gap('leo-past-result', ['would finish', 'would have finished'], 'would have finished'),
              ' on time.'
            ]}
          ]
        }},
        {time: '4 min', exercise: writing(
          'B11M02L04_E11_GRAMMAR_PRACTICE',
          'Write complete sentences',
          'Choose Second or Third Conditional.',
          [
            {id: 'ava', prompt: 'Now: Ava is not self-confident. She does not apply for the new job.', possibleAnswers: ['If Ava were more self-confident, she would apply for the new job.']},
            {id: 'ben', prompt: 'Last month: Ben was not reliable. The project finished late.', possibleAnswers: ['If Ben had been more reliable, the project would have finished on time.']},
            {id: 'mark', prompt: 'Now: Mark is stubborn. He does not listen to the team.', possibleAnswers: ['If Mark were less stubborn, he would listen to the team.']},
            {id: 'lena', prompt: 'Last year: Lena was not determined. She did not finish the course.', possibleAnswers: ['If Lena had been more determined, she would have finished the course.']}
          ]
        )},
        {time: '2 min', exercise: oral(
          'B11M02L04_E11A_GRAMMAR_PRACTICE',
          'Say the sentences aloud',
          'Look at the two profile cards. Say one sentence about each situation.',
          'l4-time-periods.svg',
          'Card 1, Now: Eva is not independent. She does not make decisions on her own. Card 2, Last year: The team was not competitive. It did not enter the competition.',
          'Do not write the sentences first.',
          [
            'If Eva were more independent, she would make decisions on her own.',
            'If the team had been more competitive, it would have entered the competition.'
          ]
        )}
      ]
    }
  ];

  additions.forEach(({lessonId, tasks}) => {
    tasks.forEach(({exercise}) => kit.validate(exercise));
    const index = window.SpaceWhaleContent?.findIndex(lesson => lesson.id === lessonId) ?? -1;
    if (index < 0) throw new Error('Load the B1.1 Module 2 outline before its grammar practice: ' + lessonId);
    const lesson = window.SpaceWhaleContent[index];
    const ownIds = new Set(tasks.map(({exercise}) => exercise.id));
    const stages = lesson.stages.filter(stage => !ownIds.has(stage.exercise.id));
    const newStages = tasks.map(({exercise, time}) => ({
      menu: 'Grammar Practice', navigationTitle: exercise.title, navigationBlock: 'language',
      section: 'tasks', role: 'practice', guide: {time}, exercise
    }));
    let after = -1;
    stages.forEach((entry, i) => {
      if (['words', 'wordPractice', 'focus', 'practice'].includes(entry.role)) after = i;
    });
    stages.splice(after + 1, 0, ...newStages);

    const structure = (lesson.structure || []).map(section => ({
      ...section, sources: section.sources.filter(id => !ownIds.has(id))
    })).filter(section => section.sources.length);
    const practice = structure.find(section => section.role === 'practice');
    if (practice) practice.sources.push(...ownIds);
    else {
      let afterSection = -1;
      structure.forEach((section, i) => {
        if (['words', 'wordPractice', 'focus'].includes(section.role)) afterSection = i;
      });
      structure.splice(afterSection + 1, 0, {role: 'practice', sources: [...ownIds]});
    }
    window.SpaceWhaleContent[index] = {
      ...lesson,
      contentStatus: lesson.contentStatus === 'outline' ? 'partial' : lesson.contentStatus,
      stages, structure
    };
  });
})();
