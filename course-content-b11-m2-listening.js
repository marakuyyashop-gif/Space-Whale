/* Approved B1.1 Module 2 Listening. Shared source templates only.
 * Attach each completed recording once in recordings[].audio; both L4 players reuse it.
 * Scripts are the owner's supplied dialogue text, unchanged. */
(() => {
  'use strict';
  const kit = window.SpaceWhaleExerciseKit;
  if (!kit) throw new Error('SpaceWhaleExerciseKit is required.');
  const recordings = [
  {
    "id": "B11_M02_L01_LISTENING_MASTER",
    "title": "Too late to apply",
    "audio": null,
    "script": "Alex: I got an email from the training program today. They said my application was too late.\n\nNina: Oh no. What happened?\n\nAlex: I postponed the decision because I wasn’t sure about the course. By the time I tried to submit the application, the deadline had passed. I missed the opportunity.\n\nNina: That’s frustrating.\n\nAlex: If I hadn’t postponed the decision, I would have submitted the application on time. I wouldn’t have missed the opportunity if I had submitted it on time.\n\nNina: Were you still taking the qualification course then?\n\nAlex: Yes, but I was facing difficulties at work, so I didn’t finish it.\n\nNina: I see.\n\nAlex: I would have gotten the qualification if I hadn’t faced so many difficulties. I would have achieved my goal much earlier if I had finished the course."
  },
  {
    "id": "B11_M02_L02_LISTENING_MASTER",
    "title": "A difficult project",
    "audio": null,
    "script": "Dana: That meeting was difficult. You looked under pressure.\n\nBen: I was. The manager asked me to take on responsibility for the whole project.\n\nDana: Would you have taken on the responsibility if you’d known how many problems there were?\n\nBen: No, I wouldn’t have. I’d have expressed my concerns first.\n\nDana: What would you have done if the manager had listened?\n\nBen: I’d have asked the team to look into the problem and explore alternatives.\n\nDana: Would you have tried to reach an agreement before changing the plan?\n\nBen: Yes, I would have. I think the team would have agreed if we’d had more time."
  },
  {
    "id": "B11_M02_L03_LISTENING_MASTER",
    "title": "A bad evening",
    "audio": null,
    "script": "Kate: You seem really upset. What happened?\n\nLeo: The team dinner went badly. I called my manager by the wrong name in front of everyone. I was so embarrassed.\n\nKate: Oh no. Did anything else happen?\n\nLeo: I told Sam I had finished my part of the project, but I hadn’t. I felt guilty, and I was ashamed of how I behaved.\n\nKate: Did you talk to him afterward?\n\nLeo: No. I wish I’d apologized right away. If I’d apologized then, he would have understood.\n\nKate: And why do you look so miserable now?\n\nLeo: I told a friend something private, and he shared it with other people. I felt betrayed. If only I hadn’t trusted him with it.\n\nKate: That’s a difficult evening.\n\nLeo: Yeah. I wish I had handled everything differently."
  },
  {
    "id": "B11_M02_L04_LISTENING_MASTER",
    "title": "The team leader",
    "audio": null,
    "script": "Nina: Are you still thinking about applying for team leader?\n\nBen: Yes, but I don’t think I’m self-confident enough in big meetings.\n\nNina: If you were more self-confident, you would apply for the role. You’re determined, and everyone says you’re reliable.\n\nBen: Maybe. Last year I had the chance to lead a project, but I said no.\n\nNina: If you’d been more self-confident then, you would have taken the project.\n\nBen: That’s true. I also depended on my manager for every small decision.\n\nNina: If you’d been more independent, you would have made more decisions yourself.\n\nBen: Probably. Mark wants the role too. He’s very competitive.\n\nNina: And a little stubborn.\n\nBen: Definitely. If he were less stubborn, he would listen to the team more.\n\nNina: Last year he refused to change his plan several times. If he hadn’t been so stubborn, the team would have finished earlier."
  }
];
  const base = (id, kind, title, data = {}) => ({version: 1, id, kind, title, ...data});
  const options = texts => texts.map((text, i) => ({id: String.fromCharCode(65 + i), text}));
  const listening = (number, code, title, task, instruction = '', revealScript = true) => {
    const recording = recordings[number - 1];
    const id = `B11_M02_L0${number}_${code}_LISTENING`;
    return base(id, 'stage', title, {
      templateCode: code, layout: 'grouped',
      ...(instruction ? {instruction} : {}),
      exercises: [
        {id: 'source1', exercise: base(id + '_AUDIO', 'audio', title, {
          recordingId: recording.id, audioPending: !recording.audio,
          ...(recording.audio ? {audio: recording.audio} : {}),
          authorTranscript: recording.script
        })},
        {id: 'task', exercise: base(id + '_TASK', task.kind, title, task)}
      ],
      ...(revealScript ? {transcript: recording.script, transcriptAfter: ['task']} : {})
    });
  };
  const l1 = listening(1, 'L01', 'Listen and choose True or False.', {
    kind: 'choice',
    items: [
      ['Alex waited to make a decision because he was unsure about the course.', 'true'],
      ['Alex sent his application before the deadline.', 'false'],
      ['Alex finished the qualification course despite his problems at work.', 'false'],
      ['Alex thinks finishing the course would have helped him reach his goal sooner.', 'true']
    ].map(([prompt, correctId], i) => ({id: 'fact' + (i + 1), prompt, correctId,
      options: [{id: 'true', text: 'True'}, {id: 'false', text: 'False'}]}))
  });
  const l2 = listening(2, 'L12', 'Listen and answer the questions.', {
    kind: 'writing', responseMode: 'open', showAuthoredSamples: true, revealPossibleAnswers: true,
    items: [
      {id: 'pressure', prompt: 'Why was Ben under pressure?',
        possibleAnswers: ['The manager wanted him to be responsible for the whole project.']},
      {id: 'concerns', prompt: 'What would he have done first if he had known about all the problems?',
        possibleAnswers: ['He would have expressed his concerns.', 'He would have explained what worried him.']},
      {id: 'alternatives', prompt: 'What would he have asked the team to do if the manager had listened?',
        possibleAnswers: ['Look into the problem and explore alternatives.', 'Investigate the problem and consider other options.']}
    ]
  }, 'Write short answers.');
  const l3 = listening(3, 'L13', 'Which statements about Leo are true?', {
    kind: 'choice', multiple: true,
    items: [{id: 'statements', prompt: 'Which statements about Leo are true?', correctIds: ['A', 'D', 'E'], options: options([
      'He wishes he had apologized to Sam sooner.',
      'He had finished his work before he spoke to Sam.',
      'He thinks apologizing would have made no difference.',
      'He regrets trusting his friend with private information.',
      'His friend passed his private information to other people.'
    ])}]
  }, 'Listen and choose ALL the correct answers.');
  const l4Gist = listening(4, 'L02', 'What are Nina and Ben discussing?', {
    kind: 'choice', items: [{id: 'topic', prompt: 'What are Nina and Ben discussing?', correctId: 'B', options: options([
      'Why Ben stopped leading the team last year.',
      'Whether Ben should apply for a role and how past choices could have been different.',
      'How Mark helped Ben become more independent.'
    ])}]
  }, 'Listen and choose the correct answer.', false);
  const l4Details = listening(4, 'L09', 'Listen again and choose what the people say.', {
    kind: 'gaps', inputMode: 'select',
    items: [
      [['you’d been more self-confident, you would have applied', 'you were more self-confident, you would apply'], 1, ' for the role.'],
      [['you’d been more independent, you would have made', 'you were more independent, you would make'], 0, ' more decisions yourself.'],
      [['he had been less stubborn, he would have listened', 'he were less stubborn, he would listen'], 1, ' to the team more.']
    ].map(([options, answer, ending], i) => ({id: 'sentence' + (i + 1),
      segments: ['If ', {id: 'heard' + (i + 1), options, answers: [options[answer]]}, ending]}))
  });
  const l4 = base('B11_M02_L04_LISTENING', 'stage', 'Listening', {
    templateRole: 'composition', progressive: true, requireCheckBeforeNext: true, unifiedProgression: true,
    exercises: [{id: 'gist', exercise: l4Gist}, {id: 'details', exercise: l4Details}]
  });

  // Replay the same dialogue, then build the grammar independently. The original
  // response IDs and paths stay intact so existing learner answers remain usable.
  const forms = (number, code, items, clues = false) => base(
    `B11_M02_L0${number}_${code}_GRAMMAR_LISTENING`, 'gaps', 'Listen again and complete the sentences.', {
      templateCode: code, inputMode: 'text',
      instruction: clues ? 'Write the verb forms you hear. Use the verbs in the gaps to help you.' : 'Write the missing words you hear.',
      items: items.map((segments, i) => ({id: 'line' + (i + 1), segments}))
    });
  // Full and contracted forms are both valid; apostrophe styles are equivalent.
  const gap = (id, answer, alternatives = [], placeholder) => ({
    id, answers: [...new Set([answer, ...alternatives].flatMap(text => [text, text.replace(/’/g, "'")]))],
    ...(placeholder ? {placeholder} : {})
  });
  const writing = (number, code, title, instruction, items, accepted = false) => base(
    `B11_M02_L0${number}_${code}_GRAMMAR_LISTENING`, 'writing', title, {
      templateCode: code, instruction, responseMode: accepted ? 'accepted' : 'open',
      ...(!accepted ? {showAuthoredSamples: true, revealPossibleAnswers: true} : {}),
      items: items.map(([prompt, answers], i) => ({id: 'sentence' + (i + 1), prompt,
        ...(accepted ? {normalization: 'translation', acceptedAnswers: answers} : {possibleAnswers: answers})}))
    });
  const l1Forms = forms(1, 'L08', [
    ['If I ', gap('postpone', 'hadn’t postponed', ['had not postponed'], 'postpone'), ' the decision, I ', gap('submit', 'would have submitted', ["would’ve submitted"], 'submit'), ' the application on time.'],
    ['I ', gap('miss', 'wouldn’t have missed', ['would not have missed'], 'miss'), ' the opportunity if I ', gap('submitted', 'had submitted', [], 'submit'), ' it on time.'],
    ['I ', gap('qualification', 'would have gotten', ['would’ve gotten', 'would have got', 'would’ve got'], 'get'), ' the qualification if I ', gap('difficulties', 'hadn’t faced', ['had not faced'], 'face'), ' so many difficulties.'],
    ['I ', gap('goal', 'would have achieved', ['would’ve achieved'], 'achieve'), ' my goal much earlier if I ', gap('course', 'had finished', [], 'finish'), ' the course.']
  ], true);
  const l1Production = writing(1, 'E11', 'Write Third Conditional sentences.',
    'Imagine a different past for Alex. Use the notes to write complete sentences.', [
      ['Alex / submit application on time / not miss opportunity', ['If Alex had submitted his application on time, he wouldn’t have missed the opportunity.']],
      ['Alex / not face difficulties at work / finish course', ['If Alex hadn’t faced difficulties at work, he would have finished the course.']],
      ['Alex / finish course / achieve goal earlier', ['If Alex had finished the course, he would have achieved his goal earlier.']]
    ]);
  const l2Forms = forms(2, 'L07', [
    [gap('question', 'Would you have taken'), ' on the responsibility if ', gap('known', 'you’d known', ['you had known']), ' how many problems there were?'],
    ['No, ', gap('short-no', 'I wouldn’t have', ['I would not have']), '. ', gap('concerns', 'I’d have expressed', ['I would have expressed', 'I would’ve expressed']), ' my concerns first.'],
    ['What ', gap('wh-question', 'would you have done'), ' if the manager ', gap('listened', 'had listened'), '?'],
    ['Yes, ', gap('short-yes', 'I would have'), '. I think the team ', gap('agreed', 'would have agreed', ['would’ve agreed']), ' if ', gap('time', 'we’d had', ['we had had']), ' more time.']
  ]);
  const l2Production = writing(2, 'L18', 'Write your own replies to Dana.',
    'Imagine you are Ben. Answer Dana’s questions using your own ideas and the Third Conditional. For 1 and 3, give a short answer and explain your choice.', [
      ['Would you have taken on the responsibility if you’d known how many problems there were?', ['No, I wouldn’t have. I would have asked for more help.', 'Yes, I would have. I would have asked for more time.']],
      ['What would you have done if the manager had listened?', ['If the manager had listened, I would have suggested a different plan.']],
      ['Would you have tried to reach an agreement before changing the plan?', ['Yes, I would have. I would have discussed the alternatives with the team.']]
    ]);
  const l3Forms = forms(3, 'L08', [
    ['I wish ', gap('apology', 'I’d apologized', ['I had apologized'], 'apologize'), ' right away.'],
    ['If ', gap('condition', 'I’d apologized', ['I had apologized'], 'apologize'), ' then, he ', gap('result', 'would have understood', ['would’ve understood'], 'understand'), '.'],
    ['If only ', gap('trust', 'I hadn’t trusted', ['I had not trusted'], 'trust'), ' him with it.'],
    ['I wish ', gap('handle', 'I had handled', ['I’d handled'], 'handle'), ' everything differently.']
  ], true);
  const l3Production = writing(3, 'E13', 'Correct the sentences.',
    'Leo is talking about the past. There is one grammar error in each sentence. Write the whole sentence correctly.', [
      ['I wish I apologized right away.', ['I wish I had apologized right away.', 'I wish I’d apologized right away.']],
      ['If I’d apologized then, he would understand.', ['If I’d apologized then, he would have understood.', 'If I had apologized then, he would have understood.', 'If I’d apologized then, he would’ve understood.', 'If I had apologized then, he would’ve understood.']],
      ['If only I didn’t trust him with it.', ['If only I hadn’t trusted him with it.', 'If only I had not trusted him with it.']]
    ], true);
  const l4Forms = forms(4, 'L07', [
    ['If you ', gap('confident', 'were'), ' more self-confident, you ', gap('apply', 'would apply'), ' for the role.'],
    ['If ', gap('past-confident', 'you’d been', ['you had been']), ' more self-confident then, you ', gap('project', 'would have taken', ['would’ve taken']), ' the project.'],
    ['If he ', gap('stubborn', 'were'), ' less stubborn, he ', gap('listen', 'would listen'), ' to the team more.'],
    ['If he ', gap('past-stubborn', 'hadn’t been', ['had not been']), ' so stubborn, the team ', gap('finish', 'would have finished', ['would’ve finished']), ' earlier.']
  ]);
  const l4Production = writing(4, 'E11', 'Write Second or Third Conditional sentences.',
    'The notes describe real situations. Imagine the opposite. Use the Second Conditional for now and the Third Conditional for last year.', [
      ['now / Ben / not self-confident / not apply for role', ['If Ben were more self-confident, he would apply for the role.']],
      ['last year / Ben / not independent / not make decisions himself', ['If Ben had been more independent last year, he would have made more decisions himself.']],
      ['last year / Mark / stubborn / team not finish earlier', ['If Mark hadn’t been so stubborn last year, the team would have finished earlier.']]
    ]);
  // Grouped shared stages reveal each additional response through the teacher arrow.
  // Keep the master script locked until every task in this final group is attempted.
  [[l1, l1Forms, l1Production], [l2, l2Forms, l2Production],
    [l3, l3Forms, l3Production], [l4Details, l4Forms, l4Production]].forEach(([group, typed, production]) => {
    group.requireCheckBeforeNext = true;
    group.exercises.push({id: 'forms', exercise: typed}, {id: 'production', exercise: production});
    group.transcriptAfter = ['task', 'forms', 'production'];
  });

  [l1, l2, l3, l4].forEach((exercise, i) => {
    kit.validate(exercise);
    const lessonId = 'b1-1-w2-l' + (i + 1);
    const index = window.SpaceWhaleContent?.findIndex(lesson => lesson.id === lessonId) ?? -1;
    if (index < 0) throw new Error('Load the B1.1 Module 2 outline before Listening: ' + lessonId);
    const lesson = window.SpaceWhaleContent[index];
    const stages = lesson.stages.filter(stage => stage.exercise.id !== exercise.id);
    const entry = {menu: 'Listening', navigationTitle: 'Listening', navigationBlock: 'language',
      section: 'tasks', role: 'listening', guide: {time: i === 3 ? '12 min' : '10 min'}, exercise};
    const finalIndex = stages.findIndex(stage => stage.role === 'final');
    stages.splice(finalIndex < 0 ? stages.length : finalIndex, 0, entry);
    const structure = (lesson.structure || []).map(section => ({
      ...section, sources: section.sources.filter(id => id !== exercise.id)
    })).filter(section => section.sources.length);
    const finalSection = structure.findIndex(section => section.role === 'final');
    structure.splice(finalSection < 0 ? structure.length : finalSection, 0, {role: 'listening', sources: [exercise.id]});
    window.SpaceWhaleContent[index] = {...lesson, stages, structure};
  });
})();
