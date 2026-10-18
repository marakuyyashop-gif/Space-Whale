/* B1.1 / Module 2: approved module outline and W03B Words for L1–L4.
 * Source: Pasted markdown(20261018-112707).md, L1 Exercise 1 (W03B).
 * L1 unchanged; L2–L4 use later approved W03B. No unrelated exercises generated.
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


  // W03B Words for L2–L4, using supplied examples, phrases, meanings and keys.
  const approvedWordsData = [
  {
    "lesson": 2,
    "unit": "phrases",
    "examples": [
      "Daniel is under pressure because his manager needs the report today.",
      "Jordan took on responsibility for the project when the manager left.",
      "Several employees expressed concerns about working alone at night.",
      "The payment failed twice, so the manager promised to look into the problem.",
      "Renting a larger office was too expensive, so we explored alternatives.",
      "After a long discussion, we reached an agreement on how to share the work."
    ],
    "highlights": [
      "is under pressure",
      "took on responsibility",
      "expressed concerns",
      "look into the problem",
      "explored alternatives",
      "reached an agreement"
    ],
    "terms": [
      "explore alternatives",
      "reach an agreement",
      "be under pressure",
      "express concerns",
      "take on responsibility",
      "look into the problem"
    ],
    "meanings": [
      "try to find out more about a problem and what caused it",
      "say that you are worried about something",
      "feel stressed because you have a lot to do or people expect a lot from you",
      "consider different possible choices before deciding what to do",
      "agree to manage a task or make sure it is done",
      "come to a decision together that everyone accepts"
    ],
    "keys": [
      4,
      6,
      3,
      2,
      5,
      1
    ]
  },
  {
    "lesson": 3,
    "unit": "words",
    "examples": [
      "I was disappointed when I didn’t get the job after such a good interview.",
      "She felt embarrassed after calling her manager by the wrong name.",
      "Ben felt guilty about breaking his friend’s phone and offered to pay for it.",
      "I felt ashamed of myself after shouting at a colleague over a small mistake.",
      "I felt miserable all weekend after losing my job.",
      "She felt betrayed when a close friend shared her private messages without asking her."
    ],
    "highlights": [
      "disappointed",
      "embarrassed",
      "guilty",
      "ashamed",
      "miserable",
      "betrayed"
    ],
    "terms": [
      "ashamed",
      "miserable",
      "disappointed",
      "betrayed",
      "embarrassed",
      "guilty"
    ],
    "meanings": [
      "extremely unhappy",
      "unhappy because something was not as good as you hoped or expected",
      "uncomfortable or shy in a social situation, often after a small mistake",
      "feeling responsible for something wrong you did or a problem you caused",
      "feeling bad about yourself because you think your behavior was wrong",
      "hurt because someone you trusted treated you badly or broke your trust"
    ],
    "keys": [
      5,
      1,
      2,
      6,
      3,
      4
    ]
  },
  {
    "lesson": 4,
    "unit": "words",
    "examples": [
      "Nina is independent and usually makes important decisions on her own.",
      "Leo is reliable and always finishes the work he promises to do.",
      "Nora is very competitive and hates losing, even at board games.",
      "Eva felt self-confident during the interview and answered every question calmly.",
      "Max is determined to finish the course, even though it is difficult.",
      "Anna was too stubborn to try a different plan, even after the first one failed."
    ],
    "highlights": [
      "independent",
      "reliable",
      "competitive",
      "self-confident",
      "determined",
      "stubborn"
    ],
    "terms": [
      "stubborn",
      "determined",
      "reliable",
      "self-confident",
      "competitive",
      "independent"
    ],
    "meanings": [
      "able to do things and make decisions without needing much help from others",
      "doing what you promise, so other people can trust you",
      "wanting to win or do better than other people",
      "sure of your own abilities",
      "wanting to achieve something and refusing to give up",
      "refusing to change your opinion or plan, even when a change may help"
    ],
    "keys": [
      6,
      5,
      2,
      4,
      3,
      1
    ]
  }
];
  const createWordsW03B = data => {
    const id = 'B11M02L' + String(data.lesson).padStart(2, '0') + '_W03B';
    return {
      version: 1, id,
      templateCode: 'W03B', templatePart: '$',
      kind: 'stage',
      title: 'Read the examples. Then match the ' + data.unit + ' with their meanings.',
      layout: 'grouped',
      exercises: [
        {id:'part-1',exercise:{
          version:1,id:id+'_EXAMPLES',templateCode:'W03B',
          templatePart:'$.exercises["part-1"].exercise',
          kind:'presentation',title:'Examples',
          blocks:[{type:'text',role:'examples',
            text:data.examples.join('\n'),highlights:data.highlights}]
        }},
        {id:'part-2',exercise:{
          version:1,id:id+'_MATCHING',templateCode:'W03B',
          templatePart:'$.exercises["part-2"].exercise',
          kind:'matching',title:'Match the ' + data.unit + ' with their meanings.',
          items:data.terms.map((text,i)=>({
            id:'phrase-'+String.fromCharCode(97+i),text,correctId:'meaning-'+data.keys[i]
          })),
          options:data.meanings.map((text,i)=>({id:'meaning-'+(i+1),text}))
        }}
      ]
    };
  };
  const allWordsW03B = [wordsExercise, ...approvedWordsData.map(createWordsW03B)];

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
    const currentWords = allWordsW03B[index];
    const stages = [{
      menu: 'Words',
      navigationTitle: 'Examples and meanings',
      navigationBlock: 'words',
      section: 'tasks',
      role: 'words',
      guide: {time: '3 min'},
      exercise: currentWords
    }];
    return {
      id: `b1-1-w2-l${index + 1}`,
      level: 'B1.1',
      whale: 2,
      lessonNumber: index + 1,
      title: card.title,
      grammar: card.grammar,
      constructions: [],
      words: card.words,
      contentStatus: 'partial',
      teacherInfo: {
        goal: card.goal,
        language: card.language,
        blockAims: {words: card.wordAim}
      },
      structure: [{role: 'words', sources: [currentWords.id]}],
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
