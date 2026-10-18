/* B1.1 / Module 2 — approved non-audio Grammar Practice after Discovery and Rule.
 * Source: the user's Grammar Practice text, 2026-10-18.
 * Content, keys and model answers live here; all appearance and interaction come
 * from the shared E01 / E03 / E03A / E04 / E11 / E11A / Q01 registry.
 */
(() => {
  'use strict';
  const kit = window.SpaceWhaleExerciseKit;
  if (!kit) throw new Error('SpaceWhaleExerciseKit is required.');

  const writing = (id, title, instruction, items) => ({
    version: 1, id, templateCode: 'E11', kind: 'writing', title, ...(instruction ? {instruction} : {}),
    responseMode: 'open', showAuthoredSamples: true, revealPossibleAnswers: true, items
  });
  const gap = (id, options, answer) => ({id, options, answers: [answer]});

  const additions = [
    {
      lessonId: 'b1-1-w2-l1',
      tasks: [
        {time: '2 min', exercise: {
          version: 1, id: 'B11M02L01_E03_GRAMMAR_PRACTICE', templateCode: 'E03', kind: 'gaps',
          title: 'Complete the sentences.', instruction: 'Choose the correct options.', inputMode: 'select',
          items: [
            {id: 'application', segments: [
              'I submitted my application on time and got an interview. If I ',
              gap('application-condition', ['hadn’t submitted', 'wouldn’t have submitted', 'didn’t submit'], 'hadn’t submitted'),
              ' it on time, I wouldn’t have had the interview.'
            ]},
            {id: 'qualification', segments: [
              'Alex didn’t take the final exam. He ',
              gap('qualification-result', ['had gotten', 'would get', 'would have gotten'], 'would have gotten'),
              ' the qualification if he had passed it.'
            ]},
            {id: 'opportunity', segments: [
              'We postponed the decision and lost the last place on the course. We ',
              gap('opportunity-result', ['would have missed', 'wouldn’t have missed', 'hadn’t missed'], 'wouldn’t have missed'),
              ' the opportunity if we had decided sooner.'
            ]}
          ]
        }},
        {time: '3 min', exercise: {
          version: 1, id: 'B11M02L01_E04_GRAMMAR_PRACTICE', templateCode: 'E04', kind: 'gaps',
          title: 'Complete the sentences.', instruction: 'Use each verb in the bank once. Change its form.', inputMode: 'text',
          bank: ['postpone', 'face', 'get', 'miss', 'submit', 'achieve'],
          items: [
            {id: 'application', segments: [
              'Clara sent her application after the deadline. If she ',
              {id: 'application-condition', answers: ['had submitted'], normalization: 'english'},
              ' an application earlier, she would have had an interview.'
            ]},
            {id: 'qualification', segments: [
              'Daniel passed the final exam and got his certificate. He ',
              {id: 'qualification-result', answers: ['wouldn’t have gotten', 'would not have gotten', 'wouldn’t have got', 'would not have got'], normalization: 'english'},
              ' the qualification if he hadn’t passed.'
            ]},
            {id: 'decision', segments: [
              'The deadline was Friday, but I waited until Monday to decide. If I ',
              {id: 'decision-condition', answers: ['hadn’t postponed', 'had not postponed'], normalization: 'english'},
              ' the decision, I wouldn’t have missed the opportunity.'
            ]},
            {id: 'goal', segments: [
              'We planned to open our café in May, but the building work finished late. We ',
              {id: 'goal-result', answers: ['would have achieved'], normalization: 'english'},
              ' our goal if the work had finished on time.'
            ]},
            {id: 'opportunity', segments: [
              'Lena applied just before the deadline. She ',
              {id: 'opportunity-result', answers: ['would have missed'], normalization: 'english'},
              ' the opportunity if she hadn’t applied in time.'
            ]},
            {id: 'difficulties', segments: [
              'The software was hard to use, and nobody helped us. We ',
              {id: 'difficulties-result', answers: ['wouldn’t have faced', 'would not have faced'], normalization: 'english'},
              ' so many difficulties if a colleague had shown us how it worked.'
            ]}
          ]
        }},
        {time: '3 min', exercise: writing(
          'B11M02L01_E11_GRAMMAR_PRACTICE',
          'Rewrite the sentences using the Third Conditional.',
          undefined,
          [
            {id: 'nora', prompt: 'Nora postponed the decision. She missed the opportunity.', placeholder: 'If…', possibleAnswers: ['If Nora hadn’t postponed the decision, she wouldn’t have missed the opportunity.']},
            {id: 'leo', prompt: 'Leo did not get the qualification. He did not achieve his goal.', placeholder: 'If…', possibleAnswers: ['If Leo had gotten the qualification, he would have achieved his goal.']},
            {id: 'sam', prompt: 'Sam faced difficulties with the form. He did not submit an application.', placeholder: 'If…', possibleAnswers: ['If Sam hadn’t faced difficulties with the form, he would have submitted an application.']}
          ]
        )}
      ]
    },
    {
      "lessonId": "b1-1-w2-l2",
      "tasks": [
        {
          "time": "2 min",
          "exercise": {
            "version": 1,
            "id": "B11M02L02_E03_GRAMMAR_PRACTICE",
            "templateCode": "E03",
            "title": "Complete the sentences.",
            "kind": "gaps",
            "instruction": "Choose the correct options.",
            "inputMode": "select",
            "items": [
              {
                "id": "approved-1",
                "segments": [
                  {
                    "id": "approved-1-0",
                    "options": [
                      "Would have you",
                      "Would you have",
                      "Did you have"
                    ],
                    "answers": [
                      "Would you have"
                    ]
                  },
                  " taken on responsibility if the manager had asked you?"
                ]
              },
              {
                "id": "approved-2",
                "segments": [
                  "What ",
                  {
                    "id": "approved-2-1",
                    "options": [
                      "you would have done",
                      "had you done",
                      "would you have done"
                    ],
                    "answers": [
                      "would you have done"
                    ]
                  },
                  " if you had been under pressure?"
                ]
              },
              {
                "id": "approved-3",
                "segments": [
                  "“Would they have reached an agreement if they had explored more alternatives?” “Yes, they ",
                  {
                    "id": "approved-3-1",
                    "options": [
                      "did",
                      "would have",
                      "had"
                    ],
                    "answers": [
                      "would have"
                    ]
                  },
                  ".”"
                ]
              },
              {
                "id": "approved-4",
                "segments": [
                  "“Would you have accepted the extra work if you had been under pressure?” “No, I ",
                  {
                    "id": "approved-4-1",
                    "options": [
                      "wouldn’t have",
                      "hadn’t",
                      "didn’t"
                    ],
                    "answers": [
                      "wouldn’t have"
                    ]
                  },
                  ".”"
                ]
              },
              {
                "id": "approved-5",
                "segments": [
                  "“If I’d known about the mistake, I’d have expressed my concerns.” The first ’d means ",
                  {
                    "id": "approved-5-1",
                    "options": [
                      "had",
                      "would",
                      "did"
                    ],
                    "answers": [
                      "had"
                    ]
                  },
                  "; the second means ",
                  {
                    "id": "approved-5-3",
                    "options": [
                      "did",
                      "had",
                      "would"
                    ],
                    "answers": [
                      "would"
                    ]
                  },
                  "."
                ]
              },
              {
                "id": "approved-6",
                "segments": [
                  "If I’d looked into the problem earlier, I ",
                  {
                    "id": "approved-6-1",
                    "options": [
                      "would of",
                      "would’ve",
                      "would"
                    ],
                    "answers": [
                      "would’ve"
                    ]
                  },
                  " found a solution."
                ]
              }
            ]
          }
        },
        {
          "time": "3 min",
          "exercise": {
            "version": 1,
            "id": "B11M02L02_E11_GRAMMAR_PRACTICE",
            "templateCode": "E11",
            "title": "Use the prompts to write Third Conditional questions.",
            "kind": "writing",
            "responseMode": "open",
            "showAuthoredSamples": true,
            "revealPossibleAnswers": true,
            "items": [
              {
                "id": "approved-1",
                "prompt": "Leo / take on responsibility / manager / ask for help?",
                "possibleAnswers": [
                  "Would Leo have taken on responsibility if the manager had asked for help?"
                ]
              },
              {
                "id": "approved-2",
                "prompt": "managers / reach an agreement / not explore alternatives?",
                "possibleAnswers": [
                  "Would the managers have reached an agreement if they hadn’t explored alternatives?"
                ]
              },
              {
                "id": "approved-3",
                "prompt": "what / Anna / do / colleagues / not express concerns?",
                "possibleAnswers": [
                  "What would Anna have done if her colleagues hadn’t expressed their concerns?"
                ]
              }
            ]
          }
        },
        {
          "time": "2 min",
          "exercise": {
            "version": 1,
            "id": "B11M02L02_Q01_GRAMMAR_PRACTICE",
            "templateCode": "Q01",
            "title": "Discuss the questions.",
            "kind": "presentation",
            "blocks": [
              {
                "type": "text",
                "text": "Your team had one afternoon to choose a new office. Two people disagreed with the manager but said nothing."
              },
              {
                "type": "text",
                "text": "1. Would you have expressed your concerns if you had been in that meeting? Why?\n2. What would you have done if the team hadn’t reached an agreement?"
              }
            ]
          }
        }
      ]
    },
    {
      "lessonId": "b1-1-w2-l3",
      "tasks": [
        {
          "time": "2 min",
          "exercise": {
            "version": 1,
            "id": "B11M02L03_E01_GRAMMAR_PRACTICE",
            "templateCode": "E01",
            "title": "Choose the sentence that matches the meaning.",
            "kind": "choice",
            "instruction": "Choose the correct option.",
            "items": [
              {
                "id": "approved-1",
                "prompt": "Nina didn’t apologize, and her friend felt disappointed. What can Nina say about a different past action and its result?",
                "options": [
                  {
                    "id": "A",
                    "text": "If only I had apologized."
                  },
                  {
                    "id": "B",
                    "text": "If I had apologized, my friend wouldn’t have felt so disappointed."
                  },
                  {
                    "id": "C",
                    "text": "I wish I had apologized."
                  }
                ],
                "correctId": "B"
              },
              {
                "id": "approved-2",
                "prompt": "Which sentence usually expresses a stronger regret about the past?",
                "options": [
                  {
                    "id": "A",
                    "text": "I wish I hadn’t broken my promise."
                  },
                  {
                    "id": "B",
                    "text": "If I hadn’t broken my promise, my friend wouldn’t have felt betrayed."
                  },
                  {
                    "id": "C",
                    "text": "If only I hadn’t broken my promise."
                  }
                ],
                "correctId": "C"
              }
            ]
          }
        },
        {
          "time": "2 min",
          "exercise": {
            "version": 1,
            "id": "B11M02L03_E03_GRAMMAR_PRACTICE",
            "templateCode": "E03",
            "title": "Complete the sentences.",
            "kind": "gaps",
            "instruction": "Choose the correct options.",
            "inputMode": "select",
            "items": [
              {
                "id": "approved-1",
                "segments": [
                  "I arrived after the movie ended and felt disappointed. I wish I ",
                  {
                    "id": "approved-1-1",
                    "options": [
                      "would have arrived",
                      "had arrived",
                      "hadn’t arrived"
                    ],
                    "answers": [
                      "had arrived"
                    ]
                  },
                  " earlier."
                ]
              },
              {
                "id": "approved-2",
                "segments": [
                  "I laughed at Ben’s mistake, and he felt embarrassed. I’m ashamed of that. If only I ",
                  {
                    "id": "approved-2-1",
                    "options": [
                      "hadn’t laughed",
                      "had laughed",
                      "wouldn’t have laughed"
                    ],
                    "answers": [
                      "hadn’t laughed"
                    ]
                  },
                  " at him."
                ]
              },
              {
                "id": "approved-3",
                "segments": [
                  "My friend shared my private messages. I felt betrayed. I wish she ",
                  {
                    "id": "approved-3-1",
                    "options": [
                      "hasn’t shared",
                      "wouldn’t have shared",
                      "hadn’t shared"
                    ],
                    "answers": [
                      "hadn’t shared"
                    ]
                  },
                  " them."
                ]
              },
              {
                "id": "approved-4",
                "segments": [
                  "I didn’t tell Ella the truth, and I still feel guilty. I wish ",
                  {
                    "id": "approved-4-1",
                    "options": [
                      "I’d have told",
                      "I told",
                      "I’d told"
                    ],
                    "answers": [
                      "I’d told"
                    ]
                  },
                  " her."
                ]
              }
            ]
          }
        },
        {
          "time": "3 min",
          "exercise": {
            "version": 1,
            "id": "B11M02L03_E11_GRAMMAR_PRACTICE",
            "templateCode": "E11",
            "title": "Use the prompts to write sentences.",
            "kind": "writing",
            "instruction": "Use I wish, If only and the Third Conditional, in that order.",
            "responseMode": "open",
            "showAuthoredSamples": true,
            "revealPossibleAnswers": true,
            "items": [
              {
                "id": "approved-1",
                "prompt": "refuse invitation / spend evening alone / feel miserable",
                "possibleAnswers": [
                  "I wish I had accepted the invitation.",
                  "I wish I hadn’t refused the invitation."
                ]
              },
              {
                "id": "approved-2",
                "prompt": "make rude comment about colleague / feel ashamed",
                "possibleAnswers": [
                  "If only I hadn’t made that rude comment about my colleague."
                ]
              },
              {
                "id": "approved-3",
                "prompt": "not practice presentation / forget what to say / feel embarrassed",
                "possibleAnswers": [
                  "If I had practiced my presentation, I wouldn’t have felt so embarrassed.",
                  "If I had practiced my presentation, I wouldn’t have forgotten what to say."
                ]
              }
            ]
          }
        },
        {
          "time": "2 min",
          "exercise": {
            "version": 1,
            "id": "B11M02L03_E11A_GRAMMAR_PRACTICE",
            "templateCode": "Q01",
            "title": "Discuss the question.",
            "kind": "presentation",
            "blocks": [
              {
                "type": "text",
                "text": "You promised to help a friend move. You forgot, and your friend had to do everything alone."
              },
              {
                "type": "text",
                "text": "How do you feel now, and what do you wish you had done differently?"
              }
            ]
          }
        }
      ]
    },
    {
      "lessonId": "b1-1-w2-l4",
      "tasks": [
        {
          "time": "2 min",
          "exercise": {
            "version": 1,
            "id": "B11M02L04_E03A_GRAMMAR_PRACTICE",
            "templateCode": "E03",
            "title": "Complete the sentences.",
            "kind": "gaps",
            "instruction": "Choose the correct options.",
            "inputMode": "select",
            "items": [
              {
                "id": "approved-1",
                "segments": [
                  "Nora is nervous about speaking in front of a group. If she ",
                  {
                    "id": "approved-1-1",
                    "options": [
                      "were",
                      "had been"
                    ],
                    "answers": [
                      "were"
                    ]
                  },
                  " more self-confident now, she ",
                  {
                    "id": "approved-1-3",
                    "options": [
                      "would give",
                      "would have given"
                    ],
                    "answers": [
                      "would give"
                    ]
                  },
                  " the presentation next week."
                ]
              },
              {
                "id": "approved-2",
                "segments": [
                  "Last week, Owen forgot to book our tickets, so we missed the concert. If he ",
                  {
                    "id": "approved-2-1",
                    "options": [
                      "had been",
                      "were"
                    ],
                    "answers": [
                      "had been"
                    ]
                  },
                  " more reliable then, we ",
                  {
                    "id": "approved-2-3",
                    "options": [
                      "would go",
                      "would have gone"
                    ],
                    "answers": [
                      "would have gone"
                    ]
                  },
                  " to the concert."
                ]
              },
              {
                "id": "approved-3",
                "segments": [
                  "I don’t care about winning, so I don’t enter competitions. I ",
                  {
                    "id": "approved-3-1",
                    "options": [
                      "would have entered",
                      "would enter"
                    ],
                    "answers": [
                      "would enter"
                    ]
                  },
                  " the competition next month if I ",
                  {
                    "id": "approved-3-3",
                    "options": [
                      "had been",
                      "were"
                    ],
                    "answers": [
                      "were"
                    ]
                  },
                  " more competitive now."
                ]
              },
              {
                "id": "approved-4",
                "segments": [
                  "Last year, Eva let her parents choose her college. She wanted to make the decision herself. Eva ",
                  {
                    "id": "approved-4-1",
                    "options": [
                      "would have chosen",
                      "would choose"
                    ],
                    "answers": [
                      "would have chosen"
                    ]
                  },
                  " a college herself if she ",
                  {
                    "id": "approved-4-3",
                    "options": [
                      "were",
                      "had been"
                    ],
                    "answers": [
                      "had been"
                    ]
                  },
                  " more independent then."
                ]
              }
            ]
          }
        },
        {
          "time": "3 min",
          "exercise": {
            "version": 1,
            "id": "B11M02L04_E11_GRAMMAR_PRACTICE",
            "templateCode": "E11",
            "title": "Use the prompts to write Second or Third Conditional sentences.",
            "kind": "writing",
            "responseMode": "open",
            "showAuthoredSamples": true,
            "revealPossibleAnswers": true,
            "items": [
              {
                "id": "approved-1",
                "prompt": "now / Ava / not self-confident / not apply for new job",
                "possibleAnswers": [
                  "If Ava were more self-confident, she would apply for the new job."
                ]
              },
              {
                "id": "approved-2",
                "prompt": "last month / Ben / not reliable / team miss deadline",
                "possibleAnswers": [
                  "If Ben had been more reliable, the team wouldn’t have missed the deadline."
                ]
              },
              {
                "id": "approved-3",
                "prompt": "now / Mark / stubborn / refuse to try team’s better idea",
                "possibleAnswers": [
                  "If Mark were less stubborn, he would try the team’s better idea."
                ]
              },
              {
                "id": "approved-4",
                "prompt": "last year / Lena / determined / finish difficult course",
                "possibleAnswers": [
                  "If Lena hadn’t been so determined, she wouldn’t have finished the difficult course."
                ]
              }
            ]
          }
        },
        {
          "time": "2 min",
          "exercise": {
            "version": 1,
            "id": "B11M02L04_E11A_GRAMMAR_PRACTICE",
            "templateCode": "Q01",
            "title": "Discuss the questions.",
            "kind": "presentation",
            "blocks": [
              {
                "type": "text",
                "text": "1. If you were more independent, what would you do differently next month?\n2. Think of a chance you missed last year. What would you have done if you had been more self-confident?"
              }
            ],
            "instruction": "Use real or imagined examples."
          }
        }
      ]
    }
  ];

  additions.forEach(({lessonId, tasks}) => {
    tasks.forEach(({exercise}) => kit.validate(exercise));
    const index = window.SpaceWhaleContent?.findIndex(lesson => lesson.id === lessonId) ?? -1;
    if (index < 0) throw new Error('Load the B1.1 Module 2 outline before its grammar practice: ' + lessonId);
    const lesson = window.SpaceWhaleContent[index];
    const ownIds = new Set(tasks.map(({exercise}) => exercise.id));
    const replacedIds = new Set(ownIds);
    // Only the owner's retired L1 timeline is removed when an old pack is reapplied.
    if (lessonId === 'b1-1-w2-l1') replacedIds.add('B11M02L01_E11A_GRAMMAR_PRACTICE');
    const stages = lesson.stages.filter(stage => !replacedIds.has(stage.exercise.id));
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
      ...section, sources: section.sources.filter(id => !replacedIds.has(id))
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
