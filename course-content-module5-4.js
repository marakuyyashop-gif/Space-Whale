(function () {
  'use strict';
  // Approved A1.2 M5 L4 text. Opening/final Speaking are intentionally deferred.
  // Only the existing shared templates are filled; recordings remain pending.
  const kit = window.SpaceWhaleExerciseKit;
  if (!kit) return;
  const lesson = {
  "id": "a1-2-w5-l4",
  "level": "A1.2",
  "whale": 5,
  "summary": "Сравниваем обычные занятия с тем, что делаем сейчас, и объясняем различие короткими фразами.",
  "grammar": "Present Simple vs Present Continuous: обычное действие и текущая ситуация",
  "constructions": "usually …, but now … · every …, but today … · at the moment",
  "words": [
    "study",
    "learn",
    "teach",
    "practice",
    "review",
    "take notes"
  ],
  "durationMinutes": 30,
  "contentVersion": "approved-content-speaking-deferred-2026-10-11",
  "stages": [
    {
      "menu": "Speaking",
      "navigationTitle": "Speaking",
      "section": "tasks",
      "guide": {
        "time": "2.5 min",
        "teacherNotes": ""
      },
      "exercise": {
        "version": 1,
        "id": "A1M5L4_OPENING",
        "kind": "presentation",
        "title": "Speaking",
        "blocks": [
          {
            "type": "image",
            "imagePending": true,
            "assetId": "A1M5L4_SPEAKING_OPENING_DEFERRED"
          }
        ]
      }
    },
    {
      "menu": "Words",
      "navigationTitle": "Words",
      "section": "tasks",
      "guide": {
        "time": "1.5 min",
        "teacherNotes": ""
      },
      "exercise": {
        "version": 1,
        "id": "A1M5L4_WORDS",
        "kind": "matching",
        "title": "Match the words with their meanings.",
        "items": [
          {
            "id": "1",
            "text": "review",
            "correctId": "E"
          },
          {
            "id": "2",
            "text": "teach",
            "correctId": "F"
          },
          {
            "id": "3",
            "text": "study",
            "correctId": "D"
          },
          {
            "id": "4",
            "text": "take notes",
            "correctId": "C"
          },
          {
            "id": "5",
            "text": "learn",
            "correctId": "B"
          },
          {
            "id": "6",
            "text": "practice",
            "correctId": "A"
          }
        ],
        "options": [
          {
            "id": "A",
            "text": "практиковаться"
          },
          {
            "id": "B",
            "text": "учиться"
          },
          {
            "id": "C",
            "text": "делать записи"
          },
          {
            "id": "D",
            "text": "изучать"
          },
          {
            "id": "E",
            "text": "повторять пройденное"
          },
          {
            "id": "F",
            "text": "обучать"
          }
        ]
      }
    },
    {
      "menu": "Listen and repeat",
      "navigationTitle": "Listen and repeat",
      "section": "tasks",
      "guide": {
        "time": "1.5 min",
        "teacherNotes": ""
      },
      "exercise": {
        "version": 1,
        "id": "A1M5L4_REPEAT",
        "kind": "audio",
        "title": "Listen and repeat.",
        "layout": "listen-repeat",
        "audioPending": true,
        "items": [
          {
            "id": "word1",
            "text": "study",
            "audioId": "A1M5L4_WORD_01",
            "example": "My friends study English at home.",
            "exampleAudioId": "A1M5L4_EXAMPLE_01"
          },
          {
            "id": "word2",
            "text": "learn",
            "audioId": "A1M5L4_WORD_02",
            "example": "Jonathan wants to learn English for work.",
            "exampleAudioId": "A1M5L4_EXAMPLE_02"
          },
          {
            "id": "word3",
            "text": "teach",
            "audioId": "A1M5L4_WORD_03",
            "example": "Anna and Mark teach English.",
            "exampleAudioId": "A1M5L4_EXAMPLE_03"
          },
          {
            "id": "word4",
            "text": "practice",
            "audioId": "A1M5L4_WORD_04",
            "example": "We practice English in our lessons.",
            "exampleAudioId": "A1M5L4_EXAMPLE_04"
          },
          {
            "id": "word5",
            "text": "review",
            "audioId": "A1M5L4_WORD_05",
            "example": "Do you review the lesson at home?",
            "exampleAudioId": "A1M5L4_EXAMPLE_05"
          },
          {
            "id": "word6",
            "text": "take notes",
            "audioId": "A1M5L4_WORD_06",
            "example": "My sister takes notes on her phone.",
            "exampleAudioId": "A1M5L4_EXAMPLE_06"
          }
        ]
      }
    },
    {
      "menu": "Word Practice",
      "navigationTitle": "Word Practice",
      "section": "tasks",
      "guide": {
        "time": "1.5 min",
        "teacherNotes": ""
      },
      "exercise": {
        "version": 1,
        "id": "A1M5L4_WORD_PRACTICE",
        "kind": "gaps",
        "title": "In an English lesson",
        "instruction": "Choose the correct words.",
        "inputMode": "select",
        "items": [
          {
            "id": "1",
            "segments": [
              "— Can you ",
              {
                "id": "g1",
                "answers": [
                  "teach"
                ],
                "options": [
                  "learn",
                  "teach",
                  "review"
                ]
              },
              " me English?\n— Yes. We can have a lesson on Friday."
            ]
          },
          {
            "id": "2",
            "segments": [
              "— How do you ",
              {
                "id": "g2",
                "answers": [
                  "take notes"
                ],
                "options": [
                  "take notes",
                  "read",
                  "take photos"
                ]
              },
              " in your English lessons?\n— I write on paper."
            ]
          },
          {
            "id": "3",
            "segments": [
              "— Can we ",
              {
                "id": "g3",
                "answers": [
                  "practice"
                ],
                "options": [
                  "take photos",
                  "take notes",
                  "practice"
                ]
              },
              " English?\n— Yes. Ask me a question!"
            ]
          },
          {
            "id": "4",
            "segments": [
              "Teacher: What's your homework?\nStudent: I need to ",
              {
                "id": "g4",
                "answers": [
                  "review"
                ],
                "options": [
                  "take notes",
                  "review",
                  "teach"
                ]
              },
              " lesson two again."
            ]
          }
        ]
      }
    },
    {
      "menu": "Discovery",
      "navigationTitle": "Discovery",
      "section": "tasks",
      "guide": {
        "time": "1.5 min",
        "teacherNotes": ""
      },
      "exercise": {
        "version": 1,
        "id": "A1M5L4_DISCOVERY",
        "kind": "stage",
        "title": "Обычное занятие или действие сейчас?",
        "instruction": "Прочитайте два предложения об Анне и выберите ответы.",
        "layout": "grouped",
        "exercises": [
          {
            "id": "models",
            "exercise": {
              "version": 1,
              "id": "A1M5L4_DISCOVERY_MODELS",
              "kind": "presentation",
              "title": "Обычное занятие или действие сейчас?",
              "blocks": [
                {
                  "type": "text",
                  "text": "A. Anna studies English at home.",
                  "highlights": [
                    "studies"
                  ]
                },
                {
                  "type": "text",
                  "text": "B. Anna is studying English at home at the moment.",
                  "highlights": [
                    "is studying",
                    "at the moment"
                  ]
                }
              ]
            }
          },
          {
            "id": "questions",
            "exercise": {
              "version": 1,
              "id": "A1M5L4_DISCOVERY_QUESTIONS",
              "kind": "choice",
              "title": "Выберите ответы.",
              "progressiveQuestions": true,
              "items": [
                {
                  "id": "1",
                  "prompt": "Анна закончила сегодняшнее занятие, но продолжает заниматься английским дома каждый вечер. Какое предложение по-прежнему описывает её обычный порядок занятий?",
                  "options": [
                    {
                      "id": "A",
                      "text": "A"
                    },
                    {
                      "id": "B",
                      "text": "B"
                    },
                    {
                      "id": "both",
                      "text": "Оба"
                    }
                  ],
                  "correctId": "A"
                },
                {
                  "id": "2",
                  "prompt": "По какому предложению понятно, что Анна занята учёбой в момент разговора?",
                  "options": [
                    {
                      "id": "A",
                      "text": "Только A"
                    },
                    {
                      "id": "both",
                      "text": "Оба"
                    },
                    {
                      "id": "B",
                      "text": "B"
                    }
                  ],
                  "correctId": "B"
                }
              ]
            }
          }
        ]
      }
    },
    {
      "menu": "Discovery",
      "navigationTitle": "Discovery",
      "section": "tasks",
      "guide": {
        "time": "0.5 min",
        "teacherNotes": "Устный вывод: Present Simple; Present Continuous."
      },
      "exercise": {
        "version": 1,
        "id": "A1M5L4_DISCOVERY_CONCLUSION",
        "kind": "presentation",
        "title": "Дополните вывод устно.",
        "blocks": [
          {
            "type": "text",
            "text": "Когда рассказываем об обычном порядке занятий, используем … .\nКогда описываем занятие, которое идёт прямо сейчас, используем … ."
          }
        ]
      }
    },
    {
      "menu": "Language Focus",
      "navigationTitle": "Language Focus",
      "section": "tasks",
      "guide": {
        "time": "3 min",
        "teacherNotes": ""
      },
      "exercise": {
        "version": 1,
        "id": "A1M5L4_RULE",
        "kind": "rule-page",
        "title": "Present Simple или Present Continuous?",
        "blocks": [
          {
            "type": "rule",
            "text": "В английском языке о настоящем можно говорить с помощью разных времён. Present Simple и Present Continuous помогают передать, идёт ли речь об обычном порядке вещей, действии в момент разговора или временной ситуации в текущий период.\n\nКогда рассказываем, что человек делает обычно, используем Present Simple. Это может быть привычка, регулярное занятие или постоянный факт.\n\nAnna works in an office. — Анна работает в офисе.\nShe reads every evening. — Она читает каждый вечер.\n\nВ первом предложении мы сообщаем, где Анна работает, а во втором — как она обычно проводит вечера.\n\nPresent Continuous используем, когда рассказываем, чем человек занят в момент разговора.\n\nAnna is reading at the moment. — Анна сейчас читает.\n\nЭто время также помогает показать, что ситуация временная и относится к текущему периоду: например, к этой неделе или этому месяцу.\n\nThis week, Anna is working at home. — На этой неделе Анна работает дома.\n\nРабота из дома — временный порядок на эту неделю. Речь идёт о её работе в течение недели, поэтому так можно сказать и вечером, когда Анна уже отдыхает.\n\nКак показать разницу\n\nЧтобы сравнить обычный порядок с текущей ситуацией, соединяем две части с помощью but — «но»:\n\nAnna usually works in an office, but today she’s working at home. — Анна обычно работает в офисе, но сегодня работает дома.\n\nВремя показывает, как понимать сообщение: как привычное положение дел или как действие сейчас либо временную ситуацию. Слова usually, every day, now, today и this week помогают уточнить этот смысл. Время выбираем по смыслу всей фразы.\n\nAt the moment означает «в данный момент». Обычно его ставят в начале или в конце предложения:\n\nAt the moment, Anna is reading.\nAnna is reading at the moment.",
            "highlights": [
              "Present Simple",
              "Present Continuous",
              "works",
              "reads",
              "is reading",
              "is working",
              "Как показать разницу",
              "but",
              "usually works",
              "but today she’s working",
              "usually",
              "every day",
              "now",
              "today",
              "this week",
              "At the moment",
              "at the moment"
            ]
          }
        ]
      }
    },
    {
      "menu": "Practice",
      "navigationTitle": "Practice",
      "section": "tasks",
      "guide": {
        "time": "2.5 min",
        "teacherNotes": ""
      },
      "exercise": {
        "version": 1,
        "id": "A1M5L4_FORMS",
        "kind": "gaps",
        "title": "Choose the correct words.",
        "inputMode": "select",
        "items": [
          {
            "id": "1",
            "segments": [
              "Ben usually ",
              {
                "id": "g1",
                "answers": [
                  "studies"
                ],
                "options": [
                  "studies",
                  "is studying",
                  "study"
                ]
              },
              " English at home, but this week he’s studying at a café."
            ]
          },
          {
            "id": "2",
            "segments": [
              "My friends and I usually study at home. Today we’re at a café. At the moment, we ",
              {
                "id": "g2",
                "answers": [
                  "are practicing"
                ],
                "options": [
                  "practice",
                  "are practicing",
                  "practices"
                ]
              },
              " English together."
            ]
          },
          {
            "id": "3",
            "segments": [
              "Anna ",
              {
                "id": "g3",
                "answers": [
                  "takes"
                ],
                "options": [
                  "are taking",
                  "is taking",
                  "takes"
                ]
              },
              " notes on paper every lesson, but today she’s using her phone."
            ]
          },
          {
            "id": "4",
            "segments": [
              "Ben usually learns new words in his lesson, but at the moment he ",
              {
                "id": "g4",
                "answers": [
                  "is reviewing"
                ],
                "options": [
                  "review",
                  "reviews",
                  "is reviewing"
                ]
              },
              " lesson two with Anna."
            ]
          }
        ]
      }
    },
    {
      "menu": "Listening",
      "navigationTitle": "Listening",
      "section": "tasks",
      "guide": {
        "time": "4 min",
        "teacherNotes": "Первое прослушивание — два вопроса на смысл; второе — три пропуска. Запись ожидается. Полный текст сохранён без изменений."
      },
      "exercise": {
        "version": 1,
        "id": "A1M5L4_LISTENING",
        "kind": "stage",
        "title": "A place to study",
        "instruction": "Ben calls his friend Kate. Listen and choose the correct answer.",
        "layout": "grouped",
        "transcript": "Ben: Kate, can I study at your house today?\nKate: Of course. What’s wrong?\nBen: I usually study at home, but today my brother is teaching guitar in our living room.\nKate: Is it noisy?\nBen: Very! His friends are learning a song. They’re playing it again and again.\nKate: I’m reviewing our English lesson at the moment. We can practice together.\nBen: Great. I am going to leave home now. See you soon.\nKate: Sure. See you soon.",
        "transcriptAfter": [
          "questions",
          "gaps"
        ],
        "exercises": [
          {
            "id": "player",
            "exercise": {
              "version": 1,
              "id": "A1M5L4_LISTENING_AUDIO",
              "kind": "audio",
              "title": "Listen to Ben and Kate.",
              "audioPending": true,
              "audioId": "A1M5L4_LISTENING"
            }
          },
          {
            "id": "questions",
            "exercise": {
              "version": 1,
              "id": "A1M5L4_LISTENING_QUESTIONS",
              "kind": "choice",
              "title": "Listen and choose the correct answer.",
              "progressiveQuestions": true,
              "items": [
                {
                  "id": "1",
                  "prompt": "Why does Ben want to study at Kate’s house?",
                  "options": [
                    {
                      "id": "A",
                      "text": "His English book is there."
                    },
                    {
                      "id": "B",
                      "text": "Kate is his English teacher."
                    },
                    {
                      "id": "C",
                      "text": "His home is too noisy."
                    }
                  ],
                  "correctId": "C"
                },
                {
                  "id": "2",
                  "prompt": "How can Kate help Ben?",
                  "options": [
                    {
                      "id": "A",
                      "text": "They can practice English together."
                    },
                    {
                      "id": "B",
                      "text": "She can teach him a song."
                    },
                    {
                      "id": "C",
                      "text": "She can write his notes."
                    }
                  ],
                  "correctId": "A"
                }
              ]
            }
          },
          {
            "id": "gaps",
            "exercise": {
              "version": 1,
              "id": "A1M5L4_LISTENING_GAPS",
              "kind": "gaps",
              "title": "Listen and complete.",
              "instruction": "Listen again. Complete the sentences with the words you hear. Write one or two words in each gap.",
              "inputMode": "text",
              "items": [
                {
                  "id": "1",
                  "segments": [
                    "I usually ",
                    {
                      "id": "l4_l07_1",
                      "answers": [
                        "study"
                      ]
                    },
                    " at home, but today my brother ",
                    {
                      "id": "l4_l07_2",
                      "answers": [
                        "is teaching"
                      ]
                    },
                    " guitar in our living room."
                  ]
                },
                {
                  "id": "2",
                  "segments": [
                    "I’m ",
                    {
                      "id": "l4_l07_3",
                      "answers": [
                        "reviewing"
                      ]
                    },
                    " our English lesson at the moment. We can practice together."
                  ]
                }
              ]
            }
          }
        ]
      }
    },
    {
      "menu": "Practice",
      "navigationTitle": "Practice",
      "section": "tasks",
      "guide": {
        "time": "3.5 min",
        "teacherNotes": ""
      },
      "exercise": {
        "version": 1,
        "id": "A1M5L4_TEXT_GAPS",
        "kind": "gaps",
        "title": "Nora’s English lesson",
        "instruction": "Complete the text. Use the correct forms of the verbs.",
        "layout": "paragraph",
        "inputMode": "text",
        "items": [
          {
            "id": "1",
            "segments": [
              "Nora ",
              {
                "id": "gap_1",
                "answers": [
                  "studies"
                ],
                "placeholder": "study"
              },
              " English at home every evening. Ben usually teaches her new words. Now Nora ",
              {
                "id": "gap_2",
                "answers": [
                  "is studying"
                ],
                "placeholder": "study"
              },
              " at a café with Ben. They ",
              {
                "id": "gap_3",
                "answers": [
                  "are reviewing"
                ],
                "placeholder": "review"
              },
              " lesson two together."
            ]
          },
          {
            "id": "2",
            "segments": [
              "Nora ",
              {
                "id": "gap_4",
                "answers": [
                  "takes"
                ],
                "placeholder": "take"
              },
              " notes on paper every lesson, but her bag is at home. At the moment, she ",
              {
                "id": "gap_5",
                "answers": [
                  "is taking"
                ],
                "placeholder": "take"
              },
              " notes on her phone. She and Ben ",
              {
                "id": "gap_6",
                "answers": [
                  "are practicing"
                ],
                "placeholder": "practice"
              },
              " English together."
            ]
          }
        ]
      }
    },
    {
      "menu": "Writing",
      "navigationTitle": "Writing",
      "section": "tasks",
      "guide": {
        "time": "2.5 min",
        "teacherNotes": "Принимать естественные альтернативы study/learn и in/at a café. Ключи покрывают стандартные варианты; другие правильные формулировки требуют проверки преподавателем."
      },
      "exercise": {
        "version": 1,
        "id": "A1M5L4_WRITING",
        "kind": "writing",
        "title": "Write about Ben and Anna.",
        "instruction": "Напишите по одному предложению о каждом человеке. Сравните обычное действие с текущим и соедините две части словом but.",
        "responseMode": "accepted",
        "items": [
          {
            "id": "sentence_1",
            "prompt": "Бен обычно занимается английским в кафе. Сейчас он занимается дома.\nBen · usually · now",
            "normalization": "translation",
            "acceptedAnswers": [
              "Ben usually studies English at a café, but now he is studying at home.",
              "Ben usually studies English at a café, but he is studying at home now.",
              "Ben usually studies English at a café, but now he is studying English at home.",
              "Ben usually studies English at a café, but he is studying English at home now.",
              "Ben usually studies English at a café, but now he’s studying at home.",
              "Ben usually studies English at a café, but he’s studying at home now.",
              "Ben usually studies English at a café, but now he’s studying English at home.",
              "Ben usually studies English at a café, but he’s studying English at home now.",
              "Usually, Ben studies English at a café, but now he is studying at home.",
              "Usually, Ben studies English at a café, but he is studying at home now.",
              "Usually, Ben studies English at a café, but now he is studying English at home.",
              "Usually, Ben studies English at a café, but he is studying English at home now.",
              "Usually, Ben studies English at a café, but now he’s studying at home.",
              "Usually, Ben studies English at a café, but he’s studying at home now.",
              "Usually, Ben studies English at a café, but now he’s studying English at home.",
              "Usually, Ben studies English at a café, but he’s studying English at home now.",
              "Ben usually studies English in a café, but now he is studying at home.",
              "Ben usually studies English in a café, but he is studying at home now.",
              "Ben usually studies English in a café, but now he is studying English at home.",
              "Ben usually studies English in a café, but he is studying English at home now.",
              "Ben usually studies English in a café, but now he’s studying at home.",
              "Ben usually studies English in a café, but he’s studying at home now.",
              "Ben usually studies English in a café, but now he’s studying English at home.",
              "Ben usually studies English in a café, but he’s studying English at home now.",
              "Ben usually learns English at a café, but now he’s learning at home.",
              "Ben usually learns English at a café, but now he is learning at home.",
              "Ben usually learns English at a café, but he is learning at home now.",
              "Ben usually learns English at a café, but now he is learning English at home.",
              "Ben usually learns English at a café, but he is learning English at home now.",
              "Ben usually learns English at a café, but he’s learning at home now.",
              "Ben usually learns English at a café, but now he’s learning English at home.",
              "Ben usually learns English at a café, but he’s learning English at home now.",
              "Usually, Ben learns English at a café, but now he is learning at home.",
              "Usually, Ben learns English at a café, but he is learning at home now.",
              "Usually, Ben learns English at a café, but now he is learning English at home.",
              "Usually, Ben learns English at a café, but he is learning English at home now.",
              "Usually, Ben learns English at a café, but now he’s learning at home.",
              "Usually, Ben learns English at a café, but he’s learning at home now.",
              "Usually, Ben learns English at a café, but now he’s learning English at home.",
              "Usually, Ben learns English at a café, but he’s learning English at home now.",
              "Ben usually learns English in a café, but now he is learning at home.",
              "Ben usually learns English in a café, but he is learning at home now.",
              "Ben usually learns English in a café, but now he is learning English at home.",
              "Ben usually learns English in a café, but he is learning English at home now.",
              "Ben usually learns English in a café, but now he’s learning at home.",
              "Ben usually learns English in a café, but he’s learning at home now.",
              "Ben usually learns English in a café, but now he’s learning English at home.",
              "Ben usually learns English in a café, but he’s learning English at home now.",
              "Ben usually studies English at a cafe, but now he is studying at home.",
              "Ben usually studies English at a cafe, but he is studying at home now.",
              "Ben usually studies English at a cafe, but now he is studying English at home.",
              "Ben usually studies English at a cafe, but he is studying English at home now.",
              "Ben usually studies English at a cafe, but now he’s studying at home.",
              "Ben usually studies English at a cafe, but he’s studying at home now.",
              "Ben usually studies English at a cafe, but now he’s studying English at home.",
              "Ben usually studies English at a cafe, but he’s studying English at home now.",
              "Usually, Ben studies English at a cafe, but now he is studying at home.",
              "Usually, Ben studies English at a cafe, but he is studying at home now.",
              "Usually, Ben studies English at a cafe, but now he is studying English at home.",
              "Usually, Ben studies English at a cafe, but he is studying English at home now.",
              "Usually, Ben studies English at a cafe, but now he’s studying at home.",
              "Usually, Ben studies English at a cafe, but he’s studying at home now.",
              "Usually, Ben studies English at a cafe, but now he’s studying English at home.",
              "Usually, Ben studies English at a cafe, but he’s studying English at home now.",
              "Ben usually studies English in a cafe, but now he is studying at home.",
              "Ben usually studies English in a cafe, but he is studying at home now.",
              "Ben usually studies English in a cafe, but now he is studying English at home.",
              "Ben usually studies English in a cafe, but he is studying English at home now.",
              "Ben usually studies English in a cafe, but now he’s studying at home.",
              "Ben usually studies English in a cafe, but he’s studying at home now.",
              "Ben usually studies English in a cafe, but now he’s studying English at home.",
              "Ben usually studies English in a cafe, but he’s studying English at home now.",
              "Ben usually learns English at a cafe, but now he’s learning at home.",
              "Ben usually learns English at a cafe, but now he is learning at home.",
              "Ben usually learns English at a cafe, but he is learning at home now.",
              "Ben usually learns English at a cafe, but now he is learning English at home.",
              "Ben usually learns English at a cafe, but he is learning English at home now.",
              "Ben usually learns English at a cafe, but he’s learning at home now.",
              "Ben usually learns English at a cafe, but now he’s learning English at home.",
              "Ben usually learns English at a cafe, but he’s learning English at home now.",
              "Usually, Ben learns English at a cafe, but now he is learning at home.",
              "Usually, Ben learns English at a cafe, but he is learning at home now.",
              "Usually, Ben learns English at a cafe, but now he is learning English at home.",
              "Usually, Ben learns English at a cafe, but he is learning English at home now.",
              "Usually, Ben learns English at a cafe, but now he’s learning at home.",
              "Usually, Ben learns English at a cafe, but he’s learning at home now.",
              "Usually, Ben learns English at a cafe, but now he’s learning English at home.",
              "Usually, Ben learns English at a cafe, but he’s learning English at home now.",
              "Ben usually learns English in a cafe, but now he is learning at home.",
              "Ben usually learns English in a cafe, but he is learning at home now.",
              "Ben usually learns English in a cafe, but now he is learning English at home.",
              "Ben usually learns English in a cafe, but he is learning English at home now.",
              "Ben usually learns English in a cafe, but now he’s learning at home.",
              "Ben usually learns English in a cafe, but he’s learning at home now.",
              "Ben usually learns English in a cafe, but now he’s learning English at home.",
              "Ben usually learns English in a cafe, but he’s learning English at home now."
            ]
          },
          {
            "id": "sentence_2",
            "prompt": "Анна делает записи на бумаге на каждом занятии. Сегодня она делает записи на телефоне.\nAnna · every lesson · today",
            "normalization": "translation",
            "acceptedAnswers": [
              "Anna takes notes on paper every lesson, but today she is taking notes on her phone.",
              "Anna takes notes on paper every lesson, but she is taking notes on her phone today.",
              "Anna takes notes on paper every lesson, but today she’s taking notes on her phone.",
              "Anna takes notes on paper every lesson, but she’s taking notes on her phone today.",
              "Every lesson, Anna takes notes on paper, but today she is taking notes on her phone.",
              "Every lesson, Anna takes notes on paper, but she is taking notes on her phone today.",
              "Every lesson, Anna takes notes on paper, but today she’s taking notes on her phone.",
              "Every lesson, Anna takes notes on paper, but she’s taking notes on her phone today.",
              "Anna takes notes on paper in every lesson, but today she is taking notes on her phone.",
              "Anna takes notes on paper in every lesson, but she is taking notes on her phone today.",
              "Anna takes notes on paper in every lesson, but today she’s taking notes on her phone.",
              "Anna takes notes on paper in every lesson, but she’s taking notes on her phone today."
            ]
          }
        ]
      }
    },
    {
      "menu": "Final Speaking",
      "navigationTitle": "Final Speaking",
      "section": "tasks",
      "guide": {
        "time": "5.5 min",
        "teacherNotes": ""
      },
      "exercise": {
        "version": 1,
        "id": "A1M5L4_FINAL",
        "kind": "presentation",
        "title": "Final Speaking",
        "blocks": [
          {
            "type": "image",
            "imagePending": true,
            "assetId": "A1M5L4_SPEAKING_FINAL_DEFERRED"
          }
        ]
      }
    }
  ],
  "structure": [
    {
      "role": "opening",
      "sources": [
        "A1M5L4_OPENING"
      ]
    },
    {
      "role": "words",
      "sources": [
        "A1M5L4_WORDS",
        "A1M5L4_REPEAT"
      ]
    },
    {
      "role": "wordPractice",
      "sources": [
        "A1M5L4_WORD_PRACTICE"
      ]
    },
    {
      "role": "focus",
      "sources": [
        "A1M5L4_DISCOVERY",
        "A1M5L4_DISCOVERY_CONCLUSION",
        "A1M5L4_RULE"
      ]
    },
    {
      "role": "practice",
      "sources": [
        "A1M5L4_FORMS"
      ]
    },
    {
      "role": "listening",
      "sources": [
        "A1M5L4_LISTENING"
      ]
    },
    {
      "role": "practice",
      "sources": [
        "A1M5L4_TEXT_GAPS",
        "A1M5L4_WRITING"
      ]
    },
    {
      "role": "final",
      "sources": [
        "A1M5L4_FINAL"
      ]
    }
  ]
};
  const courseAudioBase = 'https://xpeywyonbapnvtjnwawi.supabase.co/storage/v1/object/public/course-audio';
  const audioVersion = '20261011-approved-final';
  const repeatStage = lesson.stages.find(stage => stage.exercise.id === 'A1M5L4_REPEAT')?.exercise;
  if (repeatStage) {
    repeatStage.audioPending = false;
    repeatStage.items.forEach((item, i) => {
      const suffix = String(i + 1).padStart(2, '0');
      item.audio = courseAudioBase + '/a1-2/w5/l4/listen-repeat/WORD_' + suffix + '.mp3?v=' + audioVersion;
      item.exampleAudio = courseAudioBase + '/a1-2/w5/l4/listen-repeat/EXAMPLE_' + suffix + '.mp3?v=' + audioVersion;
    });
  }
  const listeningStage = lesson.stages.find(stage => stage.exercise.id === 'A1M5L4_LISTENING')?.exercise;
  const listeningPlayer = listeningStage?.exercises?.find(part => part.id === 'player')?.exercise;
  if (listeningPlayer) {
    listeningPlayer.audioPending = false;
    listeningPlayer.audio = courseAudioBase + '/a1-2/w5/l4/listening/a-place-to-study.mp3?v=' + audioVersion;
  }
  lesson.contentVersion = 'approved-content-speaking-deferred-2026-10-11-audio';
  lesson.stages.forEach(stage => kit.validate(stage.exercise));
  window.SpaceWhaleLessonMedia = window.SpaceWhaleLessonMedia || {};
  window.SpaceWhaleLessonMedia[lesson.id] = {
  "A1M5L4_LISTENING": {
    "type": "audio",
    "src": null,
    "script": "Ben: Kate, can I study at your house today?\nKate: Of course. What’s wrong?\nBen: I usually study at home, but today my brother is teaching guitar in our living room.\nKate: Is it noisy?\nBen: Very! His friends are learning a song. They’re playing it again and again.\nKate: I’m reviewing our English lesson at the moment. We can practice together.\nBen: Great. I am going to leave home now. See you soon.\nKate: Sure. See you soon."
  },
  "A1M5L4_WORD_01": {
    "type": "audio",
    "src": null,
    "script": "study"
  },
  "A1M5L4_EXAMPLE_01": {
    "type": "audio",
    "src": null,
    "script": "My friends study English at home."
  },
  "A1M5L4_WORD_02": {
    "type": "audio",
    "src": null,
    "script": "learn"
  },
  "A1M5L4_EXAMPLE_02": {
    "type": "audio",
    "src": null,
    "script": "Jonathan wants to learn English for work."
  },
  "A1M5L4_WORD_03": {
    "type": "audio",
    "src": null,
    "script": "teach"
  },
  "A1M5L4_EXAMPLE_03": {
    "type": "audio",
    "src": null,
    "script": "Anna and Mark teach English."
  },
  "A1M5L4_WORD_04": {
    "type": "audio",
    "src": null,
    "script": "practice"
  },
  "A1M5L4_EXAMPLE_04": {
    "type": "audio",
    "src": null,
    "script": "We practice English in our lessons."
  },
  "A1M5L4_WORD_05": {
    "type": "audio",
    "src": null,
    "script": "review"
  },
  "A1M5L4_EXAMPLE_05": {
    "type": "audio",
    "src": null,
    "script": "Do you review the lesson at home?"
  },
  "A1M5L4_WORD_06": {
    "type": "audio",
    "src": null,
    "script": "take notes"
  },
  "A1M5L4_EXAMPLE_06": {
    "type": "audio",
    "src": null,
    "script": "My sister takes notes on her phone."
  }
};
  const lessonMedia = window.SpaceWhaleLessonMedia[lesson.id];
  for (let i = 0; i < 6; i++) {
    const suffix = String(i + 1).padStart(2, '0');
    lessonMedia['A1M5L4_WORD_' + suffix].src = courseAudioBase + '/a1-2/w5/l4/listen-repeat/WORD_' + suffix + '.mp3?v=' + audioVersion;
    lessonMedia['A1M5L4_EXAMPLE_' + suffix].src = courseAudioBase + '/a1-2/w5/l4/listen-repeat/EXAMPLE_' + suffix + '.mp3?v=' + audioVersion;
  }
  lessonMedia.A1M5L4_LISTENING.src = courseAudioBase + '/a1-2/w5/l4/listening/a-place-to-study.mp3?v=' + audioVersion;
  window.SpaceWhaleContent = window.SpaceWhaleContent || [];
  const at = window.SpaceWhaleContent.findIndex(item => item.id === lesson.id);
  if (at < 0) window.SpaceWhaleContent.push(lesson);
  else window.SpaceWhaleContent[at] = lesson;
})();
