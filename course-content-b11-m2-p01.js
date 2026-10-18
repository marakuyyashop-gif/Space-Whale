/* B1.1 · M2 · L1–L4 · P01 Listen & Repeat — exact CARD Words and W03B examples.
 * Each word and full sentence has a separate stable recording slot.
 * L1 retains its existing audio. Supplied recordings cover L2/L3 and the first five L4 rows.
 * Load after the B1 module and before its word practice.
 */
(() => {
  'use strict';
  const kit = window.SpaceWhaleExerciseKit;
  if (!kit) throw new Error('SpaceWhaleExerciseKit is required.');
  const lessonData = [
  {
    "lesson": 1,
    "pairs": [
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
    ]
  },
  {
    "lesson": 2,
    "pairs": [
      [
        "be under pressure",
        "Daniel is under pressure because his manager needs the report today."
      ],
      [
        "take on responsibility",
        "Jordan took on responsibility for the project when the manager left."
      ],
      [
        "express concerns",
        "Several employees expressed concerns about working alone at night."
      ],
      [
        "look into the problem",
        "The payment failed twice, so the manager promised to look into the problem."
      ],
      [
        "explore alternatives",
        "Renting a larger office was too expensive, so we explored alternatives."
      ],
      [
        "reach an agreement",
        "After a long discussion, we reached an agreement on how to share the work."
      ]
    ]
  },
  {
    "lesson": 3,
    "pairs": [
      [
        "disappointed",
        "I was disappointed when I didn’t get the job after such a good interview."
      ],
      [
        "embarrassed",
        "She felt embarrassed after calling her manager by the wrong name."
      ],
      [
        "guilty",
        "Ben felt guilty about breaking his friend’s phone and offered to pay for it."
      ],
      [
        "ashamed",
        "I felt ashamed of myself after shouting at a colleague over a small mistake."
      ],
      [
        "miserable",
        "I felt miserable all weekend after losing my job."
      ],
      [
        "betrayed",
        "She felt betrayed when a close friend shared her private messages without asking her."
      ]
    ]
  },
  {
    "lesson": 4,
    "pairs": [
      [
        "independent",
        "Nina is independent and usually makes important decisions on her own."
      ],
      [
        "reliable",
        "Leo is reliable and always finishes the work he promises to do."
      ],
      [
        "competitive",
        "Nora is very competitive and hates losing, even at board games."
      ],
      [
        "self-confident",
        "Eva felt self-confident during the interview and answered every question calmly."
      ],
      [
        "determined",
        "Max is determined to finish the course, even though it is difficult."
      ],
      [
        "stubborn",
        "Anna was too stubborn to try a different plan, even after the first one failed."
      ]
    ]
  }
];
  const audioRoots = {
    1: 'https://xpeywyonbapnvtjnwawi.supabase.co/storage/v1/object/public/course-audio/b1-1/w2/l1/p01/',
    2: 'assets/lesson-media/b1-1/module-2/l2/p01/',
    3: 'assets/lesson-media/b1-1/module-2/l3/p01/',
    4: 'assets/lesson-media/b1-1/module-2/l4/p01/'
  };
  const availableRecordings = {1: 12, 2: 12, 3: 12, 4: 5};
  lessonData.forEach(({lesson: lessonNumber, pairs}) => {
    const lessonCode = String(lessonNumber).padStart(2, '0');
    const prefix = 'B11M02L' + lessonCode;
    const recordingPrefix = 'B11_M02_L' + lessonCode + '_P01_';
    const audioRoot = audioRoots[lessonNumber];
    const recordingCount = availableRecordings[lessonNumber];
    const exercise = {
      version: 1,
      id: prefix + '_P01',
      templateCode: 'P01',
      kind: 'audio',
      layout: 'listen-repeat',
      title: 'Listen and repeat.',
      ...(recordingCount < pairs.length * 2 ? {audioPending: true} : {}),
      items: pairs.map(([word, example], i) => {
        const id = recordingPrefix + String(i + 1).padStart(2, '0');
        return {
          id,
          text: word,
          ...(i * 2 < recordingCount ? {audio: audioRoot + id + '_word.mp3'} : {}),
          example,
          ...(i * 2 + 1 < recordingCount ? {exampleAudio: audioRoot + id + '_example.mp3'} : {})
        };
      })
    };
    kit.validate(exercise);
    const lessonIndex = (window.SpaceWhaleContent || []).findIndex(lesson => lesson.id === 'b1-1-w2-l' + lessonNumber);
    if (lessonIndex < 0) throw new Error('B1.1 M2 L' + lessonNumber + ' must load before P01.');
    const lesson = window.SpaceWhaleContent[lessonIndex];
    const wordsId = prefix + '_W03B';
    const wordsSection = (lesson.structure || []).find(section => section.role === 'words');
    if (!wordsSection || !wordsSection.sources.includes(wordsId)) {
      throw new Error('Missing B1.1 M2 L' + lessonNumber + ' Words section. P01 cannot be placed safely.');
    }
    const stages = lesson.stages.filter(stage => stage.exercise.id !== exercise.id);
    const wordsIndex = stages.findIndex(stage => stage.exercise.id === wordsId);
    if (wordsIndex < 0) throw new Error('Words stage not found.');
    stages.splice(wordsIndex + 1, 0, {
      menu: 'Listen & Repeat',
      navigationTitle: 'Listen & Repeat',
      navigationShortcut: true,
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
    words.sources.splice(words.sources.indexOf(wordsId) + 1, 0, exercise.id);
    window.SpaceWhaleContent[lessonIndex] = {...lesson, stages, structure};
  });
})();
