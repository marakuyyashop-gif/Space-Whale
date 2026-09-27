(() => {
'use strict';
// Author source: lesson-sources/b1-1/module-1/B1_DECISIONS_WORK_v1.1.txt.
// Empty media slots are intentional; scripts and text tasks are usable now.
const kit=window.SpaceWhaleExerciseKit;
const registry=window.SpaceWhaleLessonMedia=window.SpaceWhaleLessonMedia||{};
const media={
  "b1-1-w1-misha-1": {
    "B1D1_DIALOGUE": {
      "type": "audio",
      "src": null,
      "script": "Dana: I like my job, but I’d love to choose my own hours.\nChris: Would you go freelance if you had a few regular clients?\nDana: Maybe. If I had enough work for six months, I’d take a chance. I wouldn’t leave just for one project.\nChris: Fair enough. What about working from home?\nDana: I’d need a quieter place. My apartment’s small, and my flatmate takes calls all day.\nChris: Would you rent an apartment on your own?\nDana: If I earned more, I would. For now, it’s too expensive.\nChris: What would you do if a company offered you a full-time job with better hours?\nDana: I wouldn’t turn it down straight away. I’d ask a few questions. Maybe I’d change my mind.",
      "transcriptId": "B1D1_TRANSCRIPT"
    },
    "B1D1_TRANSCRIPT": {
      "type": "text",
      "text": "Dana: I like my job, but I’d love to choose my own hours.\nChris: Would you go freelance if you had a few regular clients?\nDana: Maybe. If I had enough work for six months, I’d take a chance. I wouldn’t leave just for one project.\nChris: Fair enough. What about working from home?\nDana: I’d need a quieter place. My apartment’s small, and my flatmate takes calls all day.\nChris: Would you rent an apartment on your own?\nDana: If I earned more, I would. For now, it’s too expensive.\nChris: What would you do if a company offered you a full-time job with better hours?\nDana: I wouldn’t turn it down straight away. I’d ask a few questions. Maybe I’d change my mind."
    },
    "B1D1_SCENES": {
      "type": "image",
      "src": "assets/lesson-media/b1-1/module-1/images/B1D1_SCENES.jpg",
      "alt": "Three situations to discuss",
      "width": 1440,
      "height": 420
    },
    "B1D1_W01": {
      "type": "audio",
      "src": null,
      "script": "rent an apartment"
    },
    "B1D1_E01": {
      "type": "audio",
      "src": null,
      "script": "We want to rent an apartment near the station."
    },
    "B1D1_W02": {
      "type": "audio",
      "src": null,
      "script": "move in together"
    },
    "B1D1_E02": {
      "type": "audio",
      "src": null,
      "script": "They’re planning to move in together next month."
    },
    "B1D1_W03": {
      "type": "audio",
      "src": null,
      "script": "go freelance"
    },
    "B1D1_E03": {
      "type": "audio",
      "src": null,
      "script": "My cousin wants to go freelance, but she needs more clients."
    },
    "B1D1_W04": {
      "type": "audio",
      "src": null,
      "script": "turn down an offer"
    },
    "B1D1_E04": {
      "type": "audio",
      "src": null,
      "script": "The hours were too long, so I turned the offer down."
    },
    "B1D1_W05": {
      "type": "audio",
      "src": null,
      "script": "change your mind"
    },
    "B1D1_E05": {
      "type": "audio",
      "src": null,
      "script": "You can change your mind before Friday."
    },
    "B1D1_W06": {
      "type": "audio",
      "src": null,
      "script": "take a chance"
    },
    "B1D1_E06": {
      "type": "audio",
      "src": null,
      "script": "I don’t know anyone there, but I’m ready to take a chance."
    }
  },
  "b1-1-w1-misha-2": {
    "B1D2_DIALOGUE": {
      "type": "audio",
      "src": null,
      "script": "Leah: I have an interview for a weekend job at a café. My exam’s in three weeks, but the money would help.\nOwen: If I were you, I’d ask how many weekends they need you to work.\nLeah: I checked. Every weekend for the next month.\nOwen: In your position, I wouldn’t agree to that. You need time to revise.\nLeah: The interview’s tomorrow. I don’t want to cancel it.\nOwen: You don’t have to. I’d prepare a few questions and ask about starting after the exam.\nLeah: And if they need someone straight away?\nOwen: I’d refuse the job for now. In your situation, the exam would come first.\nLeah: That sounds fair. I’ll go to the interview and explain.",
      "transcriptId": "B1D2_TRANSCRIPT"
    },
    "B1D2_TRANSCRIPT": {
      "type": "text",
      "text": "Leah: I have an interview for a weekend job at a café. My exam’s in three weeks, but the money would help.\nOwen: If I were you, I’d ask how many weekends they need you to work.\nLeah: I checked. Every weekend for the next month.\nOwen: In your position, I wouldn’t agree to that. You need time to revise.\nLeah: The interview’s tomorrow. I don’t want to cancel it.\nOwen: You don’t have to. I’d prepare a few questions and ask about starting after the exam.\nLeah: And if they need someone straight away?\nOwen: I’d refuse the job for now. In your situation, the exam would come first.\nLeah: That sounds fair. I’ll go to the interview and explain."
    },
    "B1D2_SCENES": {
      "type": "image",
      "src": "assets/lesson-media/b1-1/module-1/images/B1D2_SCENES.jpg",
      "alt": "Three situations to discuss",
      "width": 1440,
      "height": 420
    },
    "B1D2_W01": {
      "type": "audio",
      "src": null,
      "script": "prepare"
    },
    "B1D2_E01": {
      "type": "audio",
      "src": null,
      "script": "I need to prepare for my interview tomorrow."
    },
    "B1D2_W02": {
      "type": "audio",
      "src": null,
      "script": "revise"
    },
    "B1D2_E02": {
      "type": "audio",
      "src": null,
      "script": "I’m going to revise the difficult topics before the exam."
    },
    "B1D2_W03": {
      "type": "audio",
      "src": null,
      "script": "concentrate"
    },
    "B1D2_E03": {
      "type": "audio",
      "src": null,
      "script": "It’s hard to concentrate on my work with all this noise."
    },
    "B1D2_W04": {
      "type": "audio",
      "src": null,
      "script": "avoid"
    },
    "B1D2_E04": {
      "type": "audio",
      "src": null,
      "script": "I try to avoid checking my phone during meetings."
    },
    "B1D2_W05": {
      "type": "audio",
      "src": null,
      "script": "consider"
    },
    "B1D2_E05": {
      "type": "audio",
      "src": null,
      "script": "We’re going to consider moving to a smaller apartment."
    },
    "B1D2_W06": {
      "type": "audio",
      "src": null,
      "script": "refuse"
    },
    "B1D2_E06": {
      "type": "audio",
      "src": null,
      "script": "She refused to work another weekend."
    }
  }
};
const lessons=[
  {
    "id": "b1-1-w1-misha-1",
    "authorId": "B1_DECISIONS_L1",
    "title": "Урок для Миши 1",
    "level": "B1.1",
    "whale": 1,
    "summary": "What would you choose? Обсуждаем воображаемый выбор, объясняем решение и реагируем на изменение условий.",
    "grammar": "If + Past Simple, would / wouldn’t + verb; What would you do if…?; Would you… if…?",
    "durationMinutes": 30,
    "plannedTeachingMinutes": 28.5,
    "reserveMinutes": 1.5,
    "stages": [
      {
        "menu": "Opening Speaking",
        "navigationTitle": "Opening Speaking",
        "section": "tasks",
        "guide": {
          "time": "2 min",
          "teacherNotes": "нет автоматического ключа. Диагностика, не требование уже владеть всей конструкцией. При затруднении принять знакомый язык, уточнить причину и вернуться к выбранной ситуации в финале."
        },
        "exercise": {
          "version": 1,
          "id": "B1D1-M01",
          "kind": "presentation",
          "title": "How would you decide?",
          "blocks": [
            {
              "type": "image",
              "mediaRef": "B1D1_SCENES"
            },
            {
              "type": "text",
              "text": "A. An apartment near your work costs more than your current home.\nB. You can work for yourself, but you don’t know how much work you will get.\nC. Your partner wants to share a home, but you prefer different areas of the city.\n\nWhat is attractive about this choice?\nWhat would worry you?\nWhat would you do?"
            },
            {
              "type": "disclosure",
              "title": "Useful phrases",
              "open": true,
              "text": "I’d …\nI wouldn’t …\nFor me, … is important.\nI’d need to know …"
            }
          ],
          "instruction": "Choose one situation. You can answer for an imaginary person."
        }
      },
      {
        "menu": "Words",
        "navigationTitle": "Words",
        "section": "tasks",
        "guide": {
          "time": "2.5 min",
          "teacherNotes": "freelance не означает автоматически «работать дома» или «всегда выбирать любое расписание»; это способ работы с клиентами. Не добавлять эти ложные признаки к определению."
        },
        "exercise": {
          "version": 1,
          "id": "B1D1-M02",
          "kind": "matching",
          "title": "Match the phrases with their meanings.",
          "items": [
            {
              "id": "1",
              "text": "rent an apartment",
              "correctId": "C"
            },
            {
              "id": "2",
              "text": "move in together",
              "correctId": "E"
            },
            {
              "id": "3",
              "text": "go freelance",
              "correctId": "F"
            },
            {
              "id": "4",
              "text": "turn something down",
              "correctId": "B"
            },
            {
              "id": "5",
              "text": "change your mind",
              "correctId": "A"
            },
            {
              "id": "6",
              "text": "take a chance",
              "correctId": "D"
            }
          ],
          "options": [
            {
              "id": "A",
              "text": "decide something different from what you decided before"
            },
            {
              "id": "B",
              "text": "say no to an offer or request"
            },
            {
              "id": "C",
              "text": "pay to live in a home that belongs to someone else"
            },
            {
              "id": "D",
              "text": "try something although you do not know if it will succeed"
            },
            {
              "id": "E",
              "text": "start living in the same home as your partner"
            },
            {
              "id": "F",
              "text": "start doing paid work for clients instead of being an employee of one company"
            }
          ],
          "afterCheck": {
            "text": "You can turn down an offer or turn an offer down.\nWith it, say turn it down.\nThe possessive changes: change my mind / your mind / her mind.",
            "highlights": [
              "turn down an offer",
              "turn an offer down",
              "it",
              "turn it down",
              "change my mind / your mind / her mind"
            ]
          }
        }
      },
      {
        "menu": "Listen & Repeat",
        "navigationTitle": "Listen & Repeat",
        "section": "tasks",
        "guide": {
          "time": "2 min",
          "teacherNotes": "произношение, без автоматической оценки. В четвёртой строке переменная something заменена конкретным offer, целевая единица не изменена."
        },
        "exercise": {
          "version": 1,
          "id": "B1D1-M03",
          "kind": "audio",
          "title": "Listen and repeat.",
          "layout": "listen-repeat",
          "audioPending": true,
          "items": [
            {
              "id": "B1D1_W01",
              "text": "rent an apartment",
              "mediaRef": "B1D1_W01",
              "example": "We want to rent an apartment near the station.",
              "exampleMediaRef": "B1D1_E01"
            },
            {
              "id": "B1D1_W02",
              "text": "move in together",
              "mediaRef": "B1D1_W02",
              "example": "They’re planning to move in together next month.",
              "exampleMediaRef": "B1D1_E02"
            },
            {
              "id": "B1D1_W03",
              "text": "go freelance",
              "mediaRef": "B1D1_W03",
              "example": "My cousin wants to go freelance, but she needs more clients.",
              "exampleMediaRef": "B1D1_E03"
            },
            {
              "id": "B1D1_W04",
              "text": "turn down an offer",
              "mediaRef": "B1D1_W04",
              "example": "The hours were too long, so I turned the offer down.",
              "exampleMediaRef": "B1D1_E04"
            },
            {
              "id": "B1D1_W05",
              "text": "change your mind",
              "mediaRef": "B1D1_W05",
              "example": "You can change your mind before Friday.",
              "exampleMediaRef": "B1D1_E05"
            },
            {
              "id": "B1D1_W06",
              "text": "take a chance",
              "mediaRef": "B1D1_W06",
              "example": "I don’t know anyone there, but I’m ready to take a chance.",
              "exampleMediaRef": "B1D1_E06"
            }
          ],
          "instruction": "Pay attention to the whole phrase, not just the main verb."
        }
      },
      {
        "menu": "Words in context",
        "navigationTitle": "Words in context",
        "section": "tasks",
        "guide": {
          "time": "2.5 min",
          "teacherNotes": "одна короткая персональная реплика, не обсуждение всех шести пунктов. Новая условная конструкция пока не требуется. Контексты отличаются от произносительных примеров; все шесть фраз служат ответами, а не только вариантами в банке."
        },
        "exercise": {
          "version": 1,
          "id": "B1D1-M04",
          "kind": "gaps",
          "title": "Complete the conversations.",
          "inputMode": "select",
          "items": [
            {
              "id": "1",
              "segments": [
                "A: What about that job in another city?\nB: I’m going to ",
                {
                  "id": "1",
                  "answers": [
                    "turn it down"
                  ],
                  "normalization": "english",
                  "feedbackAnswer": "turn it down"
                },
                ". I don’t want to move away from my family."
              ],
              "feedbackText": "A: What about that job in another city?\nB: I’m going to turn it down. I don’t want to move away from my family.",
              "feedbackHighlights": [
                "turn it down"
              ]
            },
            {
              "id": "2",
              "segments": [
                "A: Are you and Robin going to keep two apartments?\nB: No. We’re planning to ",
                {
                  "id": "2",
                  "answers": [
                    "move in together"
                  ],
                  "normalization": "english",
                  "feedbackAnswer": "move in together"
                },
                " and share the bills."
              ],
              "feedbackText": "A: Are you and Robin going to keep two apartments?\nB: No. We’re planning to move in together and share the bills.",
              "feedbackHighlights": [
                "move in together"
              ]
            },
            {
              "id": "3",
              "segments": [
                "A: That restaurant only opened this week. Do you want to try it?\nB: The menu looks good. Let’s ",
                {
                  "id": "3",
                  "answers": [
                    "take a chance"
                  ],
                  "normalization": "english",
                  "feedbackAnswer": "take a chance"
                },
                "."
              ],
              "feedbackText": "A: That restaurant only opened this week. Do you want to try it?\nB: The menu looks good. Let’s take a chance.",
              "feedbackHighlights": [
                "take a chance"
              ]
            },
            {
              "id": "4",
              "segments": [
                "A: Are you buying a place in the new city?\nB: Not yet. We’re going to ",
                {
                  "id": "4",
                  "answers": [
                    "rent an apartment"
                  ],
                  "normalization": "english",
                  "feedbackAnswer": "rent an apartment"
                },
                " while we decide where to live."
              ],
              "feedbackText": "A: Are you buying a place in the new city?\nB: Not yet. We’re going to rent an apartment while we decide where to live.",
              "feedbackHighlights": [
                "rent an apartment"
              ]
            },
            {
              "id": "5",
              "segments": [
                "A: I don’t want to join the course.\nB: That’s okay. You can ",
                {
                  "id": "5",
                  "answers": [
                    "change your mind"
                  ],
                  "normalization": "english",
                  "feedbackAnswer": "change your mind"
                },
                " any time before it starts."
              ],
              "feedbackText": "A: I don’t want to join the course.\nB: That’s okay. You can change your mind any time before it starts.",
              "feedbackHighlights": [
                "change your mind"
              ]
            },
            {
              "id": "6",
              "segments": [
                "A: Are you looking for another job with a company?\nB: No, I want to ",
                {
                  "id": "6",
                  "answers": [
                    "go freelance"
                  ],
                  "normalization": "english",
                  "feedbackAnswer": "go freelance"
                },
                ". I already have two clients."
              ],
              "feedbackText": "A: Are you looking for another job with a company?\nB: No, I want to go freelance. I already have two clients.",
              "feedbackHighlights": [
                "go freelance"
              ]
            }
          ],
          "bank": [
            "change your mind",
            "rent an apartment",
            "take a chance",
            "go freelance",
            "turn it down",
            "move in together"
          ],
          "preserveLines": true,
          "instruction": "Use each phrase once.",
          "afterCheck": {
            "text": "Choose one conversation and give a different reply.",
            "highlights": []
          }
        }
      },
      {
        "menu": "Listening",
        "navigationTitle": "Listening",
        "section": "tasks",
        "guide": {
          "time": "3 min",
          "teacherNotes": "недостаточно постоянной работы/дохода, а не просто «не нравится квартира». Готовый ответ не показывать заранее."
        },
        "exercise": {
          "version": 1,
          "id": "B1D1-M05",
          "kind": "stage",
          "title": "Listen and find out what Dana is considering.",
          "exercises": [
            {
              "id": "B1D1-M05-audio",
              "exercise": {
                "version": 1,
                "id": "B1D1-M05-audio",
                "kind": "audio",
                "title": "Listen and find out what Dana is considering.",
                "mediaRef": "B1D1_DIALOGUE"
              }
            },
            {
              "id": "B1D1-M05-transcript",
              "exercise": {
                "version": 1,
                "id": "B1D1-M05-transcript",
                "kind": "presentation",
                "title": "Listen and find out what Dana is considering.",
                "blocks": [
                  {
                    "type": "disclosure",
                    "title": "Transcript",
                    "text": "Dana: I like my job, but I’d love to choose my own hours.\nChris: Would you go freelance if you had a few regular clients?\nDana: Maybe. If I had enough work for six months, I’d take a chance. I wouldn’t leave just for one project.\nChris: Fair enough. What about working from home?\nDana: I’d need a quieter place. My apartment’s small, and my flatmate takes calls all day.\nChris: Would you rent an apartment on your own?\nDana: If I earned more, I would. For now, it’s too expensive.\nChris: What would you do if a company offered you a full-time job with better hours?\nDana: I wouldn’t turn it down straight away. I’d ask a few questions. Maybe I’d change my mind."
                  }
                ]
              }
            },
            {
              "id": "B1D1-M05-Q1",
              "exercise": {
                "version": 1,
                "id": "B1D1-M05-Q1",
                "kind": "choice",
                "title": "Listen and find out what Dana is considering.",
                "items": [
                  {
                    "id": "1",
                    "prompt": "Which statement best describes Dana’s situation?",
                    "options": [
                      {
                        "id": "A",
                        "text": "She is ready to leave as soon as she gets one project."
                      },
                      {
                        "id": "B",
                        "text": "She is interested in freelance work but wants regular work first."
                      },
                      {
                        "id": "C",
                        "text": "She will leave only after she moves into her own apartment."
                      }
                    ],
                    "correctId": "B"
                  }
                ]
              }
            },
            {
              "id": "B1D1-M05-Q2",
              "exercise": {
                "version": 1,
                "id": "B1D1-M05-Q2",
                "kind": "choice",
                "title": "Listen and find out what Dana is considering.",
                "items": [
                  {
                    "id": "2",
                    "prompt": "Why is working from home a problem for her?",
                    "options": [
                      {
                        "id": "A",
                        "text": "Her apartment is small and her flatmate makes calls during the day."
                      },
                      {
                        "id": "B",
                        "text": "She cannot afford to keep renting her current apartment."
                      },
                      {
                        "id": "C",
                        "text": "Her employer will not let her work from home."
                      }
                    ],
                    "correctId": "A"
                  }
                ],
                "afterCheck": {
                  "text": "What is the main risk for Dana?",
                  "highlights": []
                }
              }
            }
          ],
          "progressive": true,
          "requireCheckBeforeNext": true,
          "revealStops": [
            3,
            4
          ],
          "instruction": "Dana and Chris are talking after work."
        }
      },
      {
        "menu": "Listen again",
        "navigationTitle": "Listen again",
        "section": "tasks",
        "guide": {
          "time": "2 min",
          "teacherNotes": ""
        },
        "exercise": {
          "version": 1,
          "id": "B1D1-M06",
          "kind": "stage",
          "title": "Listen again and match the situations with Dana’s choices.",
          "layout": "grouped",
          "exercises": [
            {
              "id": "B1D1-M06-audio",
              "exercise": {
                "version": 1,
                "id": "B1D1-M06-audio",
                "kind": "audio",
                "title": "Listen again and match the situations with Dana’s choices.",
                "mediaRef": "B1D1_DIALOGUE"
              }
            },
            {
              "id": "B1D1-M06-transcript",
              "exercise": {
                "version": 1,
                "id": "B1D1-M06-transcript",
                "kind": "presentation",
                "title": "Listen again and match the situations with Dana’s choices.",
                "blocks": [
                  {
                    "type": "disclosure",
                    "title": "Transcript",
                    "text": "Dana: I like my job, but I’d love to choose my own hours.\nChris: Would you go freelance if you had a few regular clients?\nDana: Maybe. If I had enough work for six months, I’d take a chance. I wouldn’t leave just for one project.\nChris: Fair enough. What about working from home?\nDana: I’d need a quieter place. My apartment’s small, and my flatmate takes calls all day.\nChris: Would you rent an apartment on your own?\nDana: If I earned more, I would. For now, it’s too expensive.\nChris: What would you do if a company offered you a full-time job with better hours?\nDana: I wouldn’t turn it down straight away. I’d ask a few questions. Maybe I’d change my mind."
                  }
                ]
              }
            },
            {
              "id": "B1D1-M06-pairs",
              "exercise": {
                "version": 1,
                "id": "B1D1-M06-pairs",
                "kind": "matching",
                "title": "Listen again and match the situations with Dana’s choices.",
                "items": [
                  {
                    "id": "1",
                    "text": "If she had regular work for six months, …",
                    "correctId": "C"
                  },
                  {
                    "id": "2",
                    "text": "If she earned more, …",
                    "correctId": "D"
                  },
                  {
                    "id": "3",
                    "text": "If a company offered better working hours, …",
                    "correctId": "B"
                  }
                ],
                "options": [
                  {
                    "id": "A",
                    "text": "she would immediately reject the offer."
                  },
                  {
                    "id": "B",
                    "text": "she would ask questions before deciding."
                  },
                  {
                    "id": "C",
                    "text": "she would be willing to try freelance work."
                  },
                  {
                    "id": "D",
                    "text": "she would rent an apartment on her own."
                  }
                ]
              }
            }
          ],
          "instruction": "One ending is extra."
        }
      },
      {
        "menu": "Language focus",
        "navigationTitle": "Language focus",
        "section": "tasks",
        "guide": {
          "time": "3.5 min",
          "teacherNotes": "не вводить всю систему conditionals. Не объяснять Second Conditional как «только невозможное»: здесь обсуждается воображаемый вариант, а не обязательно невозможное событие."
        },
        "exercise": {
          "version": 1,
          "id": "B1D1-M07",
          "kind": "stage",
          "title": "What do these sentences mean?",
          "exercises": [
            {
              "id": "B1D1-M07-examples",
              "exercise": {
                "version": 1,
                "id": "B1D1-M07-examples",
                "kind": "rule-page",
                "title": "What do these sentences mean?",
                "blocks": [
                  {
                    "type": "text",
                    "text": "If I had enough work for six months, I’d take a chance.\nI wouldn’t leave just for one project.\nIf I earned more, I would.",
                    "highlights": [
                      "If I had enough work for six months, I’d take a chance.",
                      "I wouldn’t leave just for one project.",
                      "If I earned more, I would."
                    ]
                  }
                ]
              }
            },
            {
              "id": "B1D1-M07-discover",
              "exercise": {
                "version": 1,
                "id": "B1D1-M07-discover",
                "kind": "choice",
                "title": "What do these sentences mean?",
                "items": [
                  {
                    "id": "1",
                    "prompt": "Is Dana describing the past or imagining a different situation?",
                    "options": [
                      {
                        "id": "A",
                        "text": "Describing what she did last year."
                      },
                      {
                        "id": "B",
                        "text": "Confirming a definite plan for next week."
                      },
                      {
                        "id": "C",
                        "text": "Imagining a different situation now or in the future."
                      }
                    ],
                    "correctId": "C"
                  },
                  {
                    "id": "2",
                    "prompt": "In “I’d take a chance”, what does ’d mean?",
                    "options": [
                      {
                        "id": "A",
                        "text": "would"
                      },
                      {
                        "id": "B",
                        "text": "had"
                      }
                    ],
                    "correctId": "A"
                  },
                  {
                    "id": "3",
                    "prompt": "Which part introduces the imagined condition?",
                    "options": [
                      {
                        "id": "A",
                        "text": "I’d take a chance."
                      },
                      {
                        "id": "B",
                        "text": "If I had enough work for six months."
                      }
                    ],
                    "correctId": "B"
                  }
                ]
              }
            },
            {
              "id": "B1D1-M07-rule",
              "exercise": {
                "version": 1,
                "id": "B1D1-M07-rule",
                "kind": "rule-page",
                "title": "What do these sentences mean?",
                "blocks": [
                  {
                    "type": "rule",
                    "title": "Imagining a different situation",
                    "text": "Use the second conditional to explore a situation you are imagining now or in the future. You are not presenting it as a fact or a definite plan. For example, If I earned more, I’d rent an apartment on my own imagines having a higher income and a different home.\n\nThe pattern is if + Past Simple, would + verb. The past form shows an imagined condition; it does not put this conversation in the past. I’d means I would, and wouldn’t means would not.\n\nIf we found a suitable apartment, we’d move in together.\nI wouldn’t take the job if it included every weekend.\n\nThe two parts can change places. A comma normally separates them when the if-part comes first. In this pattern, put would in the result, not in the if-part. After would/wouldn’t, use the basic verb, without to or -s.\n\nTo ask about a choice, use Would you + verb … if + Past Simple? To ask for an idea, use What would you do if …?\nWould you go freelance if you had regular clients?\nWhat would you do if the company changed the hours?\n\nFor imagined ability, can becomes could: If I could choose my hours, I’d start early. With be, were is a standard form for an imagined situation: If the apartment were cheaper, I’d rent it. You may also hear was with I/he/she/it in conversation.",
                    "highlights": [
                      "second conditional",
                      "If I earned more, I’d rent an apartment on my own",
                      "if + Past Simple, would + verb",
                      "I’d",
                      "I would",
                      "wouldn’t",
                      "would not",
                      "If we found a suitable apartment, we’d move in together.",
                      "I wouldn’t take the job if it included every weekend.",
                      "would",
                      "would/wouldn’t",
                      "to",
                      "-s",
                      "Would you + verb … if + Past Simple?",
                      "What would you do if …?",
                      "Would you go freelance if you had regular clients?",
                      "What would you do if the company changed the hours?",
                      "can",
                      "could",
                      "If I could choose my hours, I’d start early.",
                      "be",
                      "were",
                      "If the apartment were cheaper, I’d rent it.",
                      "was"
                    ]
                  }
                ]
              }
            }
          ],
          "progressive": true,
          "requireCheckBeforeNext": true,
          "revealStops": [
            2,
            3
          ],
          "instruction": "Look at the examples from Dana’s conversation."
        }
      },
      {
        "menu": "Language practice",
        "navigationTitle": "Language practice",
        "section": "tasks",
        "guide": {
          "time": "3 min",
          "teacherNotes": "коротко проверить смысл отрицания во втором пункте; не только правильную форму had."
        },
        "exercise": {
          "version": 1,
          "id": "B1D1-M08",
          "kind": "gaps",
          "title": "Complete the sentences.",
          "inputMode": "text",
          "items": [
            {
              "id": "1",
              "segments": [
                "If we ",
                {
                  "id": "1a",
                  "answers": [
                    "found"
                  ],
                  "normalization": "english",
                  "feedbackAnswer": "found"
                },
                " (find) an apartment near our jobs, we ",
                {
                  "id": "1b",
                  "answers": [
                    "would move",
                    "’d move"
                  ],
                  "normalization": "english",
                  "feedbackAnswer": "would move"
                },
                " (move) in together."
              ],
              "feedbackText": "If we found an apartment near our jobs, we would move in together.",
              "feedbackHighlights": [
                "found",
                "would move"
              ]
            },
            {
              "id": "2",
              "segments": [
                "I ",
                {
                  "id": "2a",
                  "answers": [
                    "wouldn’t take",
                    "would not take"
                  ],
                  "normalization": "english",
                  "feedbackAnswer": "wouldn’t take"
                },
                " (not / take) the job if I ",
                {
                  "id": "2b",
                  "answers": [
                    "had"
                  ],
                  "normalization": "english",
                  "feedbackAnswer": "had"
                },
                " (have) to work every Sunday."
              ],
              "feedbackText": "I wouldn’t take the job if I had to work every Sunday.",
              "feedbackHighlights": [
                "wouldn’t take",
                "had"
              ]
            },
            {
              "id": "3",
              "segments": [
                "If she ",
                {
                  "id": "3a",
                  "answers": [
                    "went"
                  ],
                  "normalization": "english",
                  "feedbackAnswer": "went"
                },
                " (go) freelance, she ",
                {
                  "id": "3b",
                  "answers": [
                    "would need",
                    "’d need"
                  ],
                  "normalization": "english",
                  "feedbackAnswer": "would need"
                },
                " (need) a quiet place to work."
              ],
              "feedbackText": "If she went freelance, she would need a quiet place to work.",
              "feedbackHighlights": [
                "went",
                "would need"
              ]
            },
            {
              "id": "4",
              "segments": [
                "Would you ",
                {
                  "id": "4a",
                  "answers": [
                    "change"
                  ],
                  "normalization": "english",
                  "feedbackAnswer": "change"
                },
                " (change) your mind if the company ",
                {
                  "id": "4b",
                  "answers": [
                    "offered"
                  ],
                  "normalization": "english",
                  "feedbackAnswer": "offered"
                },
                " (offer) better hours?"
              ],
              "feedbackText": "Would you change your mind if the company offered better hours?",
              "feedbackHighlights": [
                "change",
                "offered"
              ]
            },
            {
              "id": "5",
              "segments": [
                "What ",
                {
                  "id": "5a",
                  "answers": [
                    "would"
                  ],
                  "normalization": "english",
                  "feedbackAnswer": "would"
                },
                " you ",
                {
                  "id": "5b",
                  "answers": [
                    "do"
                  ],
                  "normalization": "english",
                  "feedbackAnswer": "do"
                },
                " (do) if you ",
                {
                  "id": "5c",
                  "answers": [
                    "didn’t like",
                    "did not like"
                  ],
                  "normalization": "english",
                  "feedbackAnswer": "didn’t like"
                },
                " (not / like) the apartment after seeing it?"
              ],
              "feedbackText": "What would you do if you didn’t like the apartment after seeing it?",
              "feedbackHighlights": [
                "would",
                "do",
                "didn’t like"
              ]
            }
          ],
          "preserveLines": true,
          "instruction": "Use the second conditional and the verbs in brackets.",
          "afterCheck": {
            "text": "Choose one sentence. Is that what you would do?",
            "highlights": []
          }
        }
      },
      {
        "menu": "Questions",
        "navigationTitle": "Questions",
        "section": "tasks",
        "guide": {
          "time": "2 min",
          "teacherNotes": ""
        },
        "exercise": {
          "version": 1,
          "id": "B1D1-M09",
          "kind": "stage",
          "title": "Put the words in order. Then ask your partner.",
          "exercises": [
            {
              "id": "B1D1-M09-Q1",
              "exercise": {
                "version": 1,
                "id": "B1D1-M09-Q1",
                "kind": "order",
                "title": "Put the words in order. Then ask your partner.",
                "tokens": [
                  {
                    "id": "1",
                    "text": "an apartment"
                  },
                  {
                    "id": "2",
                    "text": "if you"
                  },
                  {
                    "id": "3",
                    "text": "would"
                  },
                  {
                    "id": "4",
                    "text": "rent"
                  },
                  {
                    "id": "5",
                    "text": "you"
                  },
                  {
                    "id": "6",
                    "text": "more"
                  },
                  {
                    "id": "7",
                    "text": "earned"
                  }
                ],
                "correctOrder": [
                  "3",
                  "5",
                  "4",
                  "1",
                  "2",
                  "7",
                  "6"
                ],
                "sentenceCase": true,
                "sentenceSuffix": "?",
                "afterCheck": {
                  "text": "Ask your partner this question. You can answer for an imaginary person.",
                  "highlights": []
                }
              }
            },
            {
              "id": "B1D1-M09-Q2",
              "exercise": {
                "version": 1,
                "id": "B1D1-M09-Q2",
                "kind": "order",
                "title": "Put the words in order. Then ask your partner.",
                "tokens": [
                  {
                    "id": "1",
                    "text": "if your partner"
                  },
                  {
                    "id": "2",
                    "text": "you"
                  },
                  {
                    "id": "3",
                    "text": "what"
                  },
                  {
                    "id": "4",
                    "text": "to move in together"
                  },
                  {
                    "id": "5",
                    "text": "would"
                  },
                  {
                    "id": "6",
                    "text": "wanted"
                  },
                  {
                    "id": "7",
                    "text": "do"
                  }
                ],
                "correctOrder": [
                  "3",
                  "5",
                  "2",
                  "7",
                  "1",
                  "6",
                  "4"
                ],
                "sentenceCase": true,
                "sentenceSuffix": "?",
                "afterCheck": {
                  "text": "Ask your partner this question. You can answer for an imaginary person.",
                  "highlights": []
                }
              }
            }
          ],
          "progressive": true,
          "requireCheckBeforeNext": true,
          "instruction": "Start with the question word or would."
        }
      },
      {
        "menu": "Final Speaking",
        "navigationTitle": "Final Speaking",
        "section": "tasks",
        "guide": {
          "time": "6 min",
          "teacherNotes": "ученик формулирует минимум одно собственное условие с if, использует would/wouldn’t для решения, задаёт условный вопрос и реагирует на изменившееся условие. Личное решение не оценивается как правильное или неправильное. Не требовать все шесть Words в каждой реплике."
        },
        "exercise": {
          "version": 1,
          "id": "B1D1-M10",
          "kind": "stage",
          "title": "What would you choose?",
          "exercises": [
            {
              "id": "B1D1-M10-situations",
              "exercise": {
                "version": 1,
                "id": "B1D1-M10-situations",
                "kind": "presentation",
                "title": "What would you choose?",
                "blocks": [
                  {
                    "type": "image",
                    "mediaRef": "B1D1_SCENES"
                  },
                  {
                    "type": "text",
                    "text": "A. A quiet apartment is close to your work, but it costs €150 more per month than your current home.\nWould you rent it? What would make you change your mind?\n\nB. A company offers you one three-month freelance project. You already have a full-time job.\nWould you take a chance or turn the project down? What would you need to know first?\n\nC. Your partner wants to move in together. You prefer different parts of the city.\nWhat would you do? What would make the decision easier?\n\nTake turns. Give your first answer, explain why, and ask your partner a question. Then discuss the extra information for your situations."
                  },
                  {
                    "type": "disclosure",
                    "title": "Useful phrases",
                    "open": true,
                    "text": "If …, I’d …\nI wouldn’t … if …\nWould you … if …?\nWhat would you do if …?\nI’d change my mind if …"
                  }
                ]
              }
            },
            {
              "id": "B1D1-M10-extra",
              "exercise": {
                "version": 1,
                "id": "B1D1-M10-extra",
                "kind": "presentation",
                "title": "Extra information",
                "blocks": [
                  {
                    "type": "text",
                    "text": "A. Imagine the extra rent was only €50. Would that change your answer?\nB. Imagine the company offered regular work for a year. What would you do?\nC. Imagine you found an apartment near both your jobs. Would you move in together?"
                  }
                ]
              }
            }
          ],
          "progressive": true,
          "requireCheckBeforeNext": true,
          "instruction": "Discuss two situations. Explain your choices and ask follow-up questions."
        }
      }
    ]
  },
  {
    "id": "b1-1-w1-misha-2",
    "authorId": "B1_DECISIONS_L2",
    "title": "Урок для Миши 2",
    "level": "B1.1",
    "whale": 1,
    "summary": "If I were you… Даём конкретный совет с учётом ситуации собеседника и уточняем его после новой информации.",
    "grammar": "If I were you, I’d / I wouldn’t + verb; In your place / position / situation, I’d…",
    "durationMinutes": 30,
    "plannedTeachingMinutes": 29,
    "reserveMinutes": 1,
    "stages": [
      {
        "menu": "Opening Speaking",
        "navigationTitle": "Opening Speaking",
        "section": "tasks",
        "guide": {
          "time": "1.5 min",
          "teacherNotes": "быстрая активация Lesson 1 и диагностика совета. Новые шесть Words пока не обязательны."
        },
        "exercise": {
          "version": 1,
          "id": "B1D2-M01",
          "kind": "presentation",
          "title": "What would you say to a friend?",
          "blocks": [
            {
              "type": "text",
              "text": "A friend has an important interview tomorrow. They keep changing their answers and checking their phone instead of getting ready.\nWhat is the main problem?\nWhat would you do in this situation?"
            },
            {
              "type": "disclosure",
              "title": "Useful phrases",
              "open": true,
              "text": "I’d …\nI wouldn’t …\n… because …"
            }
          ],
          "instruction": "Give one suggestion and explain why."
        }
      },
      {
        "menu": "Words",
        "navigationTitle": "Words",
        "section": "tasks",
        "guide": {
          "time": "2.5 min",
          "teacherNotes": "concentrate здесь внимание, не «сосредоточиться географически»; consider — обдумать, не принять решение; refuse — явный отказ. Prepare шире revise, поэтому в заданиях не объявлять их взаимоисключающими там, где подходят оба. Эти сочетания вводятся здесь для дальнейших советов, а не как отдельная большая тема gerund/infinitive."
        },
        "exercise": {
          "version": 1,
          "id": "B1D2-M02",
          "kind": "matching",
          "title": "Match the verbs with their meanings.",
          "items": [
            {
              "id": "1",
              "text": "prepare",
              "correctId": "C"
            },
            {
              "id": "2",
              "text": "revise",
              "correctId": "E"
            },
            {
              "id": "3",
              "text": "concentrate",
              "correctId": "A"
            },
            {
              "id": "4",
              "text": "avoid",
              "correctId": "F"
            },
            {
              "id": "5",
              "text": "consider",
              "correctId": "B"
            },
            {
              "id": "6",
              "text": "refuse",
              "correctId": "D"
            }
          ],
          "options": [
            {
              "id": "A",
              "text": "keep your attention on one activity"
            },
            {
              "id": "B",
              "text": "think carefully about an idea before deciding"
            },
            {
              "id": "C",
              "text": "get ready for something"
            },
            {
              "id": "D",
              "text": "say that you will not accept or do something"
            },
            {
              "id": "E",
              "text": "study something again, especially before a test"
            },
            {
              "id": "F",
              "text": "keep away from something or try not to do it"
            }
          ],
          "afterCheck": {
            "text": "prepare for an interview\nrevise a topic / revise for an exam\nconcentrate on one task\navoid checking your phone\nconsider joining a group\nrefuse to do something\n\nHere, revise means study again before an exam. It is common in British English; American English often uses review.",
            "highlights": [
              "prepare for",
              "revise",
              "revise for",
              "concentrate on",
              "avoid checking",
              "consider joining",
              "refuse to do",
              "revise",
              "review"
            ]
          }
        }
      },
      {
        "menu": "Listen & Repeat",
        "navigationTitle": "Listen & Repeat",
        "section": "tasks",
        "guide": {
          "time": "2 min",
          "teacherNotes": "произношение; это не замена следующей практики."
        },
        "exercise": {
          "version": 1,
          "id": "B1D2-M03",
          "kind": "audio",
          "title": "Listen and repeat.",
          "layout": "listen-repeat",
          "audioPending": true,
          "items": [
            {
              "id": "B1D2_W01",
              "text": "prepare",
              "mediaRef": "B1D2_W01",
              "example": "I need to prepare for my interview tomorrow.",
              "exampleMediaRef": "B1D2_E01"
            },
            {
              "id": "B1D2_W02",
              "text": "revise",
              "mediaRef": "B1D2_W02",
              "example": "I’m going to revise the difficult topics before the exam.",
              "exampleMediaRef": "B1D2_E02"
            },
            {
              "id": "B1D2_W03",
              "text": "concentrate",
              "mediaRef": "B1D2_W03",
              "example": "It’s hard to concentrate on my work with all this noise.",
              "exampleMediaRef": "B1D2_E03"
            },
            {
              "id": "B1D2_W04",
              "text": "avoid",
              "mediaRef": "B1D2_W04",
              "example": "I try to avoid checking my phone during meetings.",
              "exampleMediaRef": "B1D2_E04"
            },
            {
              "id": "B1D2_W05",
              "text": "consider",
              "mediaRef": "B1D2_W05",
              "example": "We’re going to consider moving to a smaller apartment.",
              "exampleMediaRef": "B1D2_E05"
            },
            {
              "id": "B1D2_W06",
              "text": "refuse",
              "mediaRef": "B1D2_W06",
              "example": "She refused to work another weekend.",
              "exampleMediaRef": "B1D2_E06"
            }
          ],
          "instruction": "Notice the words that follow each verb."
        }
      },
      {
        "menu": "Words in context",
        "navigationTitle": "Words in context",
        "section": "tasks",
        "guide": {
          "time": "2.5 min",
          "teacherNotes": "проверять смысл целого высказывания; в №5 обдумываются оба варианта, а не отвергаются оба. В №6 человек не хочет снова работать все выходные; нужен отказ, а не нейтральное обдумывание."
        },
        "exercise": {
          "version": 1,
          "id": "B1D2-M04",
          "kind": "gaps",
          "title": "Complete the sentences.",
          "inputMode": "select",
          "items": [
            {
              "id": "1",
              "segments": [
                "Before the interview, I need to ",
                {
                  "id": "1",
                  "answers": [
                    "prepare"
                  ],
                  "normalization": "english",
                  "feedbackAnswer": "prepare"
                },
                " by reading about the company and planning some questions."
              ],
              "feedbackText": "Before the interview, I need to prepare by reading about the company and planning some questions.",
              "feedbackHighlights": [
                "prepare"
              ]
            },
            {
              "id": "2",
              "segments": [
                "We learnt these topics last month. I’m going to ",
                {
                  "id": "2",
                  "answers": [
                    "revise"
                  ],
                  "normalization": "english",
                  "feedbackAnswer": "revise"
                },
                " them before Friday’s test."
              ],
              "feedbackText": "We learnt these topics last month. I’m going to revise them before Friday’s test.",
              "feedbackHighlights": [
                "revise"
              ]
            },
            {
              "id": "3",
              "segments": [
                "Could you turn the music down? I need to ",
                {
                  "id": "3",
                  "answers": [
                    "concentrate"
                  ],
                  "normalization": "english",
                  "feedbackAnswer": "concentrate"
                },
                " on these instructions."
              ],
              "feedbackText": "Could you turn the music down? I need to concentrate on these instructions.",
              "feedbackHighlights": [
                "concentrate"
              ]
            },
            {
              "id": "4",
              "segments": [
                "I leave my phone in my bag to ",
                {
                  "id": "4",
                  "answers": [
                    "avoid"
                  ],
                  "normalization": "english",
                  "feedbackAnswer": "avoid"
                },
                " checking it during meetings."
              ],
              "feedbackText": "I leave my phone in my bag to avoid checking it during meetings.",
              "feedbackHighlights": [
                "avoid"
              ]
            },
            {
              "id": "5",
              "segments": [
                "We haven’t decided yet. We need to ",
                {
                  "id": "5",
                  "answers": [
                    "consider"
                  ],
                  "normalization": "english",
                  "feedbackAnswer": "consider"
                },
                " both options carefully."
              ],
              "feedbackText": "We haven’t decided yet. We need to consider both options carefully.",
              "feedbackHighlights": [
                "consider"
              ]
            },
            {
              "id": "6",
              "segments": [
                "They want me to work all weekend again. I need a break, so this time I’m going to ",
                {
                  "id": "6",
                  "answers": [
                    "refuse"
                  ],
                  "normalization": "english",
                  "feedbackAnswer": "refuse"
                },
                "."
              ],
              "feedbackText": "They want me to work all weekend again. I need a break, so this time I’m going to refuse.",
              "feedbackHighlights": [
                "refuse"
              ]
            }
          ],
          "bank": [
            "refuse",
            "concentrate",
            "prepare",
            "avoid",
            "revise",
            "consider"
          ],
          "preserveLines": true,
          "instruction": "Use each verb once. Keep the form in the word bank."
        }
      },
      {
        "menu": "Reading",
        "navigationTitle": "Reading",
        "section": "tasks",
        "guide": {
          "time": "2.5 min",
          "teacherNotes": "свободные утра/три свободных часа у него не заявлены. Оценка совета привязана к данным сообщения, не к универсальному мнению автора о режиме учёбы."
        },
        "exercise": {
          "version": 1,
          "id": "B1D2-M05",
          "kind": "stage",
          "title": "Read the message and the replies.",
          "layout": "grouped",
          "exercises": [
            {
              "id": "B1D2-M05-source",
              "exercise": {
                "version": 1,
                "id": "B1D2-M05-source",
                "kind": "presentation",
                "title": "Read the message and the replies.",
                "blocks": [
                  {
                    "type": "text",
                    "text": "Jamie:\n“My exam is on Friday. I look after my son all morning and work from two until nine in the evening. I have one free hour after lunch, while his grandparents look after him. I try to revise after work too, but I’m tired and keep checking messages. What would you suggest?”\n\nReply A:\n“If I were you, I’d use that free hour to revise one topic. I’d avoid checking messages during that time.”\n\nReply B:\n“In your place, I’d use your free mornings to revise for three hours.”"
                  }
                ]
              }
            },
            {
              "id": "B1D2-M05-questions",
              "exercise": {
                "version": 1,
                "id": "B1D2-M05-questions",
                "kind": "choice",
                "title": "Read the message and the replies.",
                "items": [
                  {
                    "id": "1",
                    "prompt": "Why can’t Jamie study in the morning?",
                    "options": [
                      {
                        "id": "A",
                        "text": "He starts work very early."
                      },
                      {
                        "id": "B",
                        "text": "He looks after his son."
                      },
                      {
                        "id": "C",
                        "text": "He does not want to study before lunch."
                      }
                    ],
                    "correctId": "B"
                  },
                  {
                    "id": "2",
                    "prompt": "Which reply uses the time Jamie actually has?",
                    "options": [
                      {
                        "id": "A",
                        "text": "Reply A."
                      },
                      {
                        "id": "B",
                        "text": "Reply B."
                      }
                    ],
                    "correctId": "A"
                  }
                ],
                "afterCheck": {
                  "text": "What does Reply B assume that Jamie’s message does not support?",
                  "highlights": []
                }
              }
            }
          ],
          "instruction": "Choose the reply that uses Jamie’s available study time."
        }
      },
      {
        "menu": "Language focus",
        "navigationTitle": "Language focus",
        "section": "tasks",
        "guide": {
          "time": "3.5 min",
          "teacherNotes": "№3 проверяет форму would/wouldn’t, а не оценку того, хорошо ли отказываться. После выбора попросить назвать отрицательную форму."
        },
        "exercise": {
          "version": 1,
          "id": "B1D2-M06",
          "kind": "stage",
          "title": "How does the writer give advice?",
          "exercises": [
            {
              "id": "B1D2-M06-examples",
              "exercise": {
                "version": 1,
                "id": "B1D2-M06-examples",
                "kind": "rule-page",
                "title": "How does the writer give advice?",
                "blocks": [
                  {
                    "type": "text",
                    "text": "If I were you, I’d use that free hour to revise one topic.\nIn your place, I’d use your free mornings to revise for three hours.",
                    "highlights": [
                      "If I were you, I’d use that free hour to revise one topic.",
                      "In your place, I’d use your free mornings to revise for three hours."
                    ]
                  }
                ]
              }
            },
            {
              "id": "B1D2-M06-discover",
              "exercise": {
                "version": 1,
                "id": "B1D2-M06-discover",
                "kind": "choice",
                "title": "How does the writer give advice?",
                "items": [
                  {
                    "id": "1",
                    "prompt": "What does “If I were you” do here?",
                    "options": [
                      {
                        "id": "A",
                        "text": "It describes the writer’s past life."
                      },
                      {
                        "id": "B",
                        "text": "It imagines being in Jamie’s situation to give advice."
                      },
                      {
                        "id": "C",
                        "text": "It promises to do Jamie’s studying for him."
                      }
                    ],
                    "correctId": "B"
                  },
                  {
                    "id": "2",
                    "prompt": "Which beginning can introduce the same kind of advice?",
                    "options": [
                      {
                        "id": "A",
                        "text": "In your position, I’d …"
                      },
                      {
                        "id": "B",
                        "text": "Yesterday, I …"
                      }
                    ],
                    "correctId": "A"
                  },
                  {
                    "id": "3",
                    "prompt": "Which sentence uses the negative form of would?",
                    "options": [
                      {
                        "id": "A",
                        "text": "If I were you, I wouldn’t agree immediately."
                      },
                      {
                        "id": "B",
                        "text": "If I were you, I’d refuse."
                      }
                    ],
                    "correctId": "A"
                  }
                ]
              }
            },
            {
              "id": "B1D2-M06-rule",
              "exercise": {
                "version": 1,
                "id": "B1D2-M06-rule",
                "kind": "rule-page",
                "title": "How does the writer give advice?",
                "blocks": [
                  {
                    "type": "rule",
                    "title": "Giving advice from someone else’s point of view",
                    "text": "When someone explains a problem, If I were you, I’d … helps you say what you recommend. You imagine being in that person’s situation and suggest an action. It is advice about now or the future, not a story about the past.\n\nIf I were you, I’d prepare a few questions.\nTo recommend not doing something, use If I were you, I wouldn’t …:\nIf I were you, I wouldn’t accept immediately.\n\nUse were in this advice pattern. I’d = I would, followed by the basic verb: I’d prepare, not I’d to prepare.\n\nYou can also say In your place, I’d …, In your position, I’d … or In your situation, I’d …. These are alternatives; you do not need to use all three in one conversation. The full form is also possible: If I were in your situation, I’d ….\n\nRemember the combinations from the Words section: concentrate on a task; avoid studying all night; consider asking for more time; refuse to share answers. Would does not change the pattern after the next verb.\n\nMake your advice specific. I’d prepare is very general. I’d prepare three questions about the working hours tells the other person what to do. Explain why it fits their situation, and respond when they give you new information.",
                    "highlights": [
                      "If I were you, I’d …",
                      "If I were you, I’d prepare a few questions.",
                      "If I were you, I wouldn’t …",
                      "If I were you, I wouldn’t accept immediately.",
                      "were",
                      "I’d = I would",
                      "I’d prepare",
                      "I’d to prepare",
                      "In your place, I’d …",
                      "In your position, I’d …",
                      "In your situation, I’d …",
                      "If I were in your situation, I’d …",
                      "concentrate on",
                      "avoid studying",
                      "consider asking",
                      "refuse to share",
                      "I’d prepare",
                      "I’d prepare three questions about the working hours"
                    ]
                  }
                ]
              }
            }
          ],
          "progressive": true,
          "requireCheckBeforeNext": true,
          "revealStops": [
            2,
            3
          ],
          "instruction": "Read the examples and choose the answers."
        }
      },
      {
        "menu": "Language practice",
        "navigationTitle": "Language practice",
        "section": "tasks",
        "guide": {
          "time": "2.5 min",
          "teacherNotes": "осмысленное существительное или -ing после consider, например joining a study group. Другие подходящие варианты не исправлять под образец. В №1 отрабатывается стандартная модель If I were you из правила."
        },
        "exercise": {
          "version": 1,
          "id": "B1D2-M07",
          "kind": "gaps",
          "title": "Complete the advice.",
          "inputMode": "text",
          "items": [
            {
              "id": "1",
              "segments": [
                "If I ",
                {
                  "id": "1a",
                  "answers": [
                    "were"
                  ],
                  "normalization": "english",
                  "feedbackAnswer": "were"
                },
                " (be) you, I ",
                {
                  "id": "1b",
                  "answers": [
                    "would prepare",
                    "’d prepare"
                  ],
                  "normalization": "english",
                  "feedbackAnswer": "would prepare"
                },
                " (prepare) a few questions about the working hours."
              ],
              "feedbackText": "If I were you, I would prepare a few questions about the working hours.",
              "feedbackHighlights": [
                "were",
                "would prepare"
              ]
            },
            {
              "id": "2",
              "segments": [
                "In your position, I ",
                {
                  "id": "2",
                  "answers": [
                    "wouldn’t agree",
                    "would not agree"
                  ],
                  "normalization": "english",
                  "feedbackAnswer": "wouldn’t agree"
                },
                " (not / agree) without more information."
              ],
              "feedbackText": "In your position, I wouldn’t agree without more information.",
              "feedbackHighlights": [
                "wouldn’t agree"
              ]
            },
            {
              "id": "3",
              "segments": [
                "If I were you, I’d concentrate ",
                {
                  "id": "3a",
                  "answers": [
                    "on"
                  ],
                  "normalization": "english",
                  "feedbackAnswer": "on"
                },
                " one topic and avoid ",
                {
                  "id": "3b",
                  "answers": [
                    "checking"
                  ],
                  "normalization": "english",
                  "feedbackAnswer": "checking"
                },
                " (check) messages."
              ],
              "feedbackText": "If I were you, I’d concentrate on one topic and avoid checking messages.",
              "feedbackHighlights": [
                "on",
                "checking"
              ]
            },
            {
              "id": "4",
              "segments": [
                "If I were in your situation, I’d refuse ",
                {
                  "id": "4",
                  "answers": [
                    "to share"
                  ],
                  "normalization": "english",
                  "feedbackAnswer": "to share"
                },
                " (share) my exam answers."
              ],
              "feedbackText": "If I were in your situation, I’d refuse to share my exam answers.",
              "feedbackHighlights": [
                "to share"
              ]
            }
          ],
          "preserveLines": true,
          "instruction": "Use the verbs in brackets. In sentence 3, add the missing preposition too.",
          "afterCheck": {
            "text": "Finish this suggestion in your own way: “If I were you, I’d consider …”",
            "highlights": []
          }
        }
      },
      {
        "menu": "Listening",
        "navigationTitle": "Listening",
        "section": "tasks",
        "guide": {
          "time": "3 min",
          "teacherNotes": "важно понять условие отказа: совет не «всегда отказываться от работы перед экзаменом». Диалог готовит адаптацию совета к обстоятельствам в финале."
        },
        "exercise": {
          "version": 1,
          "id": "B1D2-M08",
          "kind": "stage",
          "title": "Listen to Leah and Owen.",
          "exercises": [
            {
              "id": "B1D2-M08-audio",
              "exercise": {
                "version": 1,
                "id": "B1D2-M08-audio",
                "kind": "audio",
                "title": "Listen to Leah and Owen.",
                "mediaRef": "B1D2_DIALOGUE"
              }
            },
            {
              "id": "B1D2-M08-transcript",
              "exercise": {
                "version": 1,
                "id": "B1D2-M08-transcript",
                "kind": "presentation",
                "title": "Listen to Leah and Owen.",
                "blocks": [
                  {
                    "type": "disclosure",
                    "title": "Transcript",
                    "text": "Leah: I have an interview for a weekend job at a café. My exam’s in three weeks, but the money would help.\nOwen: If I were you, I’d ask how many weekends they need you to work.\nLeah: I checked. Every weekend for the next month.\nOwen: In your position, I wouldn’t agree to that. You need time to revise.\nLeah: The interview’s tomorrow. I don’t want to cancel it.\nOwen: You don’t have to. I’d prepare a few questions and ask about starting after the exam.\nLeah: And if they need someone straight away?\nOwen: I’d refuse the job for now. In your situation, the exam would come first.\nLeah: That sounds fair. I’ll go to the interview and explain."
                  }
                ]
              }
            },
            {
              "id": "B1D2-M08-Q1",
              "exercise": {
                "version": 1,
                "id": "B1D2-M08-Q1",
                "kind": "choice",
                "title": "Listen to Leah and Owen.",
                "items": [
                  {
                    "id": "1",
                    "prompt": "What is Leah’s problem?",
                    "options": [
                      {
                        "id": "A",
                        "text": "She has decided not to take the exam."
                      },
                      {
                        "id": "B",
                        "text": "She wants a job, but the hours may leave too little time to revise."
                      },
                      {
                        "id": "C",
                        "text": "She does not want to go to the interview because she dislikes the café."
                      }
                    ],
                    "correctId": "B"
                  }
                ]
              }
            },
            {
              "id": "B1D2-M08-Q2",
              "exercise": {
                "version": 1,
                "id": "B1D2-M08-Q2",
                "kind": "choice",
                "title": "Listen to Leah and Owen.",
                "items": [
                  {
                    "id": "2",
                    "prompt": "Which TWO things does Owen suggest doing before making a final decision?",
                    "options": [
                      {
                        "id": "A",
                        "text": "Cancel the interview."
                      },
                      {
                        "id": "B",
                        "text": "Prepare questions about the job."
                      },
                      {
                        "id": "C",
                        "text": "Ask about starting after the exam."
                      },
                      {
                        "id": "D",
                        "text": "Agree to work every weekend before the exam."
                      }
                    ],
                    "correctIds": [
                      "B",
                      "C"
                    ]
                  }
                ],
                "multiple": true
              }
            },
            {
              "id": "B1D2-M08-Q3",
              "exercise": {
                "version": 1,
                "id": "B1D2-M08-Q3",
                "kind": "choice",
                "title": "Listen to Leah and Owen.",
                "items": [
                  {
                    "id": "3",
                    "prompt": "In which situation would Owen refuse the job for now?",
                    "options": [
                      {
                        "id": "A",
                        "text": "The café needs someone to start straight away."
                      },
                      {
                        "id": "B",
                        "text": "The café agrees that Leah can start after the exam."
                      },
                      {
                        "id": "C",
                        "text": "The interview is tomorrow."
                      }
                    ],
                    "correctId": "A"
                  }
                ]
              }
            }
          ],
          "progressive": true,
          "requireCheckBeforeNext": true,
          "revealStops": [
            3,
            4,
            5
          ],
          "instruction": "Find out what Owen advises and why."
        }
      },
      {
        "menu": "Writing",
        "navigationTitle": "Writing",
        "section": "tasks",
        "guide": {
          "time": "3 min",
          "teacherNotes": "совет отвечает проблеме, конкретен и учитывает экзамен/обещание; есть советуемое действие и то, чего не стоит делать, понятная причина и корректная условная формула. Другие решения допустимы. Не требовать совпадения с образцом или именно глаголов из образца; принимать другие уместные сочетания минимум с двумя единицами из банка. При слишком общем “I’d prepare” уточнить “How?”."
        },
        "exercise": {
          "version": 1,
          "id": "B1D2-M09",
          "kind": "stage",
          "title": "Write a reply to your friend.",
          "exercises": [
            {
              "id": "B1D2-M09-source",
              "exercise": {
                "version": 1,
                "id": "B1D2-M09-source",
                "kind": "rule-page",
                "title": "Write a reply to your friend.",
                "blocks": [
                  {
                    "type": "text",
                    "text": "“I said I’d help organise a party on Saturday, but I have an exam on Monday and I haven’t revised enough. I don’t want to disappoint everyone. What should I do?”\n\nUse If I were you … or In your place/position/situation ….\nChoose at least two useful verbs: prepare · revise · concentrate · avoid · consider · refuse.",
                    "highlights": [
                      "If I were you …",
                      "In your place/position/situation …",
                      "prepare · revise · concentrate · avoid · consider · refuse"
                    ]
                  }
                ]
              }
            },
            {
              "id": "B1D2-M09-reply",
              "exercise": {
                "version": 1,
                "id": "B1D2-M09-reply",
                "kind": "writing",
                "title": "Write a reply to your friend.",
                "responseMode": "open",
                "revealPossibleAnswers": true,
                "items": [
                  {
                    "id": "reply",
                    "prompt": "Your reply",
                    "multiline": true,
                    "rows": 5,
                    "possibleAnswers": [
                      "If I were you, I’d explain the problem to your friends today. I’d consider helping for an hour, but I wouldn’t stay all day. You need time to revise."
                    ]
                  }
                ]
              }
            }
          ],
          "progressive": true,
          "requireCheckBeforeNext": true,
          "revealStops": [
            2
          ],
          "instruction": "Write three or four sentences. Give advice, a reason, and one thing not to do."
        }
      },
      {
        "menu": "Final Speaking",
        "navigationTitle": "Final Speaking",
        "section": "tasks",
        "guide": {
          "time": "6 min",
          "teacherNotes": "студент даёт конкретный совет с изучаемой формулой, учитывает факты, объясняет причину, задаёт/понимает уточнение и корректирует предложение. Не определять одну «правильную» рекомендацию. Поддержку Useful phrases не прятать автоматически."
        },
        "exercise": {
          "version": 1,
          "id": "B1D2-M10",
          "kind": "stage",
          "title": "Give advice that fits the situation.",
          "exercises": [
            {
              "id": "B1D2-M10-situations",
              "exercise": {
                "version": 1,
                "id": "B1D2-M10-situations",
                "kind": "presentation",
                "title": "Give advice that fits the situation.",
                "blocks": [
                  {
                    "type": "image",
                    "mediaRef": "B1D2_SCENES"
                  },
                  {
                    "type": "text",
                    "text": "A. Maya has an exam in three days. She knows the theory, but finds the practice questions difficult. She has two free hours this evening and keeps checking her phone.\n\nB. Daniel has an interesting job offer, but the evening and weekend hours are not clear. He needs to be home by six on two evenings a week. The company wants an answer today.\n\nC. Rory’s classmate wants him to do their part of a group project as well as his own. Rory’s own work is due on Friday. He wants to help, but he does not have time to do both parts.\n\nThe person with the problem: explain it and ask for advice.\nThe adviser: suggest a specific action, say what you wouldn’t do, and explain why.\nThen open the extra information. Adapt the advice and agree on a first step."
                  },
                  {
                    "type": "disclosure",
                    "title": "Useful phrases",
                    "open": true,
                    "text": "What would you do in my situation?\nIf I were you, I’d …\nIf I were you, I wouldn’t …\nIn your place / position / situation, I’d …\nI’d consider …\nThat could help, but …"
                  }
                ]
              }
            },
            {
              "id": "B1D2-M10-extra",
              "exercise": {
                "version": 1,
                "id": "B1D2-M10-extra",
                "kind": "presentation",
                "title": "Extra information",
                "blocks": [
                  {
                    "type": "text",
                    "text": "A. “I need my phone because all my notes are on it.”\nB. “They can give me one more day to decide.”\nC. “My classmate says they don’t understand their part.”"
                  }
                ]
              }
            }
          ],
          "progressive": true,
          "requireCheckBeforeNext": true,
          "instruction": "Choose two situations. Take turns asking for and giving advice."
        }
      }
    ]
  }
];
function attach(value,slots){
 if(!value||typeof value!=='object')return;
 if(value.mediaRef){const slot=slots[value.mediaRef];if(!slot)throw Error('Unknown media slot: '+value.mediaRef);if(slot.type==='image')Object.assign(value,{assetId:value.mediaRef,alt:slot.alt||'Image'},slot.src?{image:slot.src,imageWidth:slot.width,imageHeight:slot.height}:{imagePending:true});if(slot.type==='audio')Object.assign(value,{audioId:value.mediaRef},slot.src?{audio:slot.src}:{audioPending:true});}
 if(value.exampleMediaRef){const slot=slots[value.exampleMediaRef];value.exampleAudioId=value.exampleMediaRef;if(slot.src)value.exampleAudio=slot.src;}
 Object.values(value).forEach(child=>{if(Array.isArray(child))child.forEach(item=>attach(item,slots));else if(child&&typeof child==='object')attach(child,slots);});
}
for(const lesson of lessons){
 const slots=media[lesson.id];for(const [id,value] of Object.entries(registry[lesson.id]||{}))slots[id]={...slots[id],...value};registry[lesson.id]=slots;
 attach(lesson,slots);lesson.stages.forEach(stage=>kit.validate(stage.exercise));
}
window.SpaceWhaleContent=window.SpaceWhaleContent||[];
window.SpaceWhaleContent.push(...lessons);
})();
