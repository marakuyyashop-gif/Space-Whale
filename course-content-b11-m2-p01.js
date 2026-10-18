/* B1.1 · M2 · L1 · P01 Listen & Repeat — the exact six CARD Words and W03B examples.
 * Separate word and sentence recordings; IDs remain unchanged across media revisions.
 * This module is loaded AFTER the B1 module and BEFORE its word practice.
 */
(() => {
  'use strict';
  const kit = window.SpaceWhaleExerciseKit;
  if (!kit) throw new Error('SpaceWhaleExerciseKit is required.');
  const pairs = [
  [
    "submit an application",
    "We submitted an application for the training program last week."
  ],
  [
    "get a qualification",
    "After two years of study, she got the qualification she needed for the job."
  ],
  [
    "miss an opportunity",
    "He waited too long and missed the opportunity to join the course."
  ],
  [
    "achieve a goal",
    "After months of work, Maya finally achieved her goal."
  ],
  [
    "postpone a decision",
    "We postponed the decision until we had more information."
  ],
  [
    "face difficulties",
    "The team faced difficulties because they had very little time."
  ]
];
  const audioRoot = 'https://xpeywyonbapnvtjnwawi.supabase.co/storage/v1/object/public/course-audio/b1-1/w2/l1/p01/';
  const clipUrl = (number, type) => audioRoot + 'B11_M02_L01_P01_' + number + '_' + type + '.mp3';
  const exercise = {
    version: 1,
    id: 'B11M02L01_P01',
    templateCode: 'P01',
    kind: 'audio',
    layout: 'listen-repeat',
    title: 'Listen and repeat.',
    items: pairs.map(([word, example], i) => {
      const number = String(i + 1).padStart(2, '0');
      return {
        id: 'B11_M02_L01_P01_' + number,
        text: word,
        audio: clipUrl(number, 'word'),
        example,
        exampleAudio: clipUrl(number, 'example')
      };
    })
  };
  kit.validate(exercise);
  const lessonIndex = (window.SpaceWhaleContent || []).findIndex(lesson => lesson.id === 'b1-1-w2-l1');
  if (lessonIndex < 0) throw new Error('B1.1 M2 L1 must load before P01.');
  const lesson = window.SpaceWhaleContent[lessonIndex];
  const wordsSection = (lesson.structure || []).find(section => section.role === 'words');
  if (!wordsSection || !wordsSection.sources.includes('B11M02L01_W03B')) {
    throw new Error('Missing B1.1 M2 L1 Words section. P01 cannot be placed safely.');
  }
  const stages = lesson.stages.filter(stage => stage.exercise.id !== exercise.id);
  const wordsIndex = stages.findIndex(stage => stage.exercise.id === 'B11M02L01_W03B');
  if (wordsIndex < 0) throw new Error('Words stage not found.');
  stages.splice(wordsIndex + 1, 0, {
    menu: 'Listen & Repeat',
    navigationTitle: 'Listen & Repeat',
    navigationBlock: 'words',
    section: 'tasks',
    role: 'words',
    guide: {time: '3 min'},
    exercise
  });
  const structure = (lesson.structure || []).map(section => ({
    ...section,
    sources: section.sources.filter(id => id !== exercise.id)
  }));
  const words = structure.find(section => section.role === 'words');
  words.sources.splice(words.sources.indexOf('B11M02L01_W03B') + 1, 0, exercise.id);
  window.SpaceWhaleContent[lessonIndex] = {...lesson, stages, structure};
})();
