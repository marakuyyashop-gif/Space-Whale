/* B1.1 / Module 2: approved module outline and L1 Words only.
 * Source: Pasted markdown(20261018-112707).md, L1 Exercise 1 (W03B).
 * Do not generate or publish the remaining exercises from the planning transcript.
 * Text and keys are authored data; appearance comes from the shared W03B profile.
 */
(() => {
  'use strict';
  const kit = window.SpaceWhaleExerciseKit;
  if (!kit) throw new Error('SpaceWhaleExerciseKit is required.');

  const wordsExercise = {
  "version": 1,
  "id": "B11M02L01_W03B",
  "templateCode": "W03B",
  "templatePart": "$",
  "kind": "stage",
  "title": "Read the examples. Then match the phrases with their meanings.",
  "layout": "grouped",
  "exercises": [
    {
      "id": "part-1",
      "exercise": {
        "version": 1,
        "id": "B11M02L01_W03B_EXAMPLES",
        "templateCode": "W03B",
        "templatePart": "$.exercises[\"part-1\"].exercise",
        "kind": "presentation",
        "title": "Examples",
        "blocks": [
          {
            "type": "text",
            "role": "examples",
            "text": "We submitted an application for the training program last week.\nAfter two years of study, she got the qualification she needed for the job.\nHe waited too long and missed the opportunity to join the course.\nAfter months of work, Maya finally achieved her goal.\nWe postponed the decision until we had more information.\nThe team faced difficulties because they had very little time.",
            "highlights": [
              "submitted an application",
              "got the qualification",
              "missed the opportunity",
              "achieved her goal",
              "postponed the decision",
              "faced difficulties"
            ]
          }
        ]
      }
    },
    {
      "id": "part-2",
      "exercise": {
        "version": 1,
        "id": "B11M02L01_W03B_MATCHING",
        "templateCode": "W03B",
        "templatePart": "$.exercises[\"part-2\"].exercise",
        "kind": "matching",
        "title": "Match the phrases with their meanings.",
        "items": [
          {
            "id": "phrase-a",
            "text": "face difficulties",
            "correctId": "meaning-2"
          },
          {
            "id": "phrase-b",
            "text": "achieve a goal",
            "correctId": "meaning-4"
          },
          {
            "id": "phrase-c",
            "text": "get a qualification",
            "correctId": "meaning-5"
          },
          {
            "id": "phrase-d",
            "text": "submit an application",
            "correctId": "meaning-3"
          },
          {
            "id": "phrase-e",
            "text": "miss an opportunity",
            "correctId": "meaning-6"
          },
          {
            "id": "phrase-f",
            "text": "postpone a decision",
            "correctId": "meaning-1"
          }
        ],
        "options": [
          {
            "id": "meaning-1",
            "text": "decide to make a choice later rather than now"
          },
          {
            "id": "meaning-2",
            "text": "experience problems that make something harder to do"
          },
          {
            "id": "meaning-3",
            "text": "send an official form to ask for a place on a course, program, or job"
          },
          {
            "id": "meaning-4",
            "text": "successfully do something that you planned and worked for"
          },
          {
            "id": "meaning-5",
            "text": "complete education or training and receive official proof of your knowledge or skills"
          },
          {
            "id": "meaning-6",
            "text": "lose a useful or important chance"
          }
        ]
      }
    }
  ]
};

  // Metadata does not create a Rule, Speaking, audio or practice exercise.
  const cards = [
  {
    "title": "Карьерный выбор",
    "grammar": "Third Conditional: if + Past Perfect, would / wouldn’t have + V3; утверждение и отрицание; порядок частей предложения.",
    "words": [
      "submit an application",
      "get a qualification",
      "miss an opportunity",
      "achieve a goal",
      "postpone a decision",
      "face difficulties"
    ],
    "goal": "Explain how a different past decision in education or work would have changed a past result.",
    "language": "Third Conditional: statements and negatives; Clause order",
    "wordAim": "Read examples and match six career expressions with their meanings."
  },
  {
    "title": "Трудное решение",
    "grammar": "Вопросы в Third Conditional; Would + subject + have + V3 ...?; специальные вопросы; краткие ответы; сокращённые формы.",
    "words": [
      "be under pressure",
      "take on responsibility",
      "express concerns",
      "look into the problem",
      "explore alternatives",
      "reach an agreement"
    ],
    "goal": "Ask and answer questions about how a past decision could have been different.",
    "language": "Third Conditional: questions and short answers; Contractions",
    "wordAim": "Learn expressions for pressure, responsibility, and reaching a decision."
  },
  {
    "title": "Сожаления",
    "grammar": "I wish / If only + Past Perfect для сожаления о прошлом; утверждение и отрицание; отличие от Third Conditional.",
    "words": [
      "disappointed",
      "embarrassed",
      "guilty",
      "ashamed",
      "miserable",
      "betrayed"
    ],
    "goal": "Express regrets about the past and distinguish a regret from an imagined past condition and result.",
    "language": "I wish / If only + Past Perfect; Contrast with Third Conditional",
    "wordAim": "Learn adjectives for feelings linked to past events and regrets."
  },
  {
    "title": "Характер и выбор",
    "grammar": "Second Conditional vs Third Conditional: воображаемая ситуация сейчас или в будущем vs альтернативное прошлое.",
    "words": [
      "independent",
      "reliable",
      "competitive",
      "self-confident",
      "determined",
      "stubborn"
    ],
    "goal": "Distinguish an imagined present or future situation from an alternative past.",
    "language": "Second vs Third Conditional; Hypothetical time reference",
    "wordAim": "Learn adjectives for personal qualities and choices."
  }
];
  const lessons = cards.map((card, index) => {
    const stages = index === 0 ? [{
      menu: 'Words',
      navigationTitle: 'Examples and meanings',
      navigationBlock: 'words',
      section: 'tasks',
      role: 'words',
      guide: {time: '3 min'},
      exercise: wordsExercise
    }] : [];
    return {
      id: `b1-1-w2-l${index + 1}`,
      level: 'B1.1',
      whale: 2,
      lessonNumber: index + 1,
      title: card.title,
      grammar: card.grammar,
      constructions: [],
      words: card.words,
      contentStatus: index === 0 ? 'partial' : 'outline',
      teacherInfo: {
        goal: card.goal,
        language: card.language,
        blockAims: {words: card.wordAim}
      },
      structure: index === 0 ? [{role: 'words', sources: [wordsExercise.id]}] : [],
      stages
    };
  });

  lessons.forEach(lesson => lesson.stages.forEach(stage => kit.validate(stage.exercise)));
  window.SpaceWhaleContent = window.SpaceWhaleContent || [];
  // Re-loading this content file replaces only these four new lesson identities.
  lessons.forEach(lesson => {
    const index = window.SpaceWhaleContent.findIndex(item => item.id === lesson.id);
    if (index < 0) window.SpaceWhaleContent.push(lesson);
    else window.SpaceWhaleContent[index] = lesson;
  });
})();
