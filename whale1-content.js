(() => {
  'use strict';
  const lessons = [
  {
    "id": "a1-1-w1-l1",
    "title": "Как я рад встрече!",
    "level": "A1.1",
    "whale": 1,
    "durationMinutes": 30,
    "goal": "Поздороваться, обменяться вопросом о самочувствии и попрощаться с учётом ситуации.",
    "stages": [
      {
        "menu": "1. Начнём разговор",
        "section": "tasks",
        "guide": {
          "aim": "Проверить знакомые реплики.",
          "tl": "Hello!; Hi!; How are you?; I’m fine.; And you?; Bye!; Good morning!; Good afternoon!; Good evening!; I’m great.; I’m good.; Have a nice day!; See you later!",
          "time": "1 мин.",
          "notes": "Диагностика без оценки. Если ответа нет, покажите образец Hello! — Hello!; How are you? — I’m fine. Не требуйте новых фраз."
        },
        "exercise": {
          "version": 1,
          "id": "a1-1-w1-l1-e01-text",
          "kind": "presentation",
          "title": "Начнём разговор",
          "feedback": {
            "showAnswers": false
          },
          "blocks": [
            {
              "type": "text",
              "text": "Поздоровайся с преподавателем. Ответь, если знаешь как.\n\nHello!\nHow are you?"
            }
          ]
        },
        "sourceId": "A1.1-W1-L1-E01"
      },
      {
        "menu": "2. Первые шесть фраз",
        "section": "tasks",
        "guide": {
          "aim": "Связать реплики со значением.",
          "tl": "Hello!; Hi!; How are you?; I’m fine.; And you?; Bye!; Good morning!; Good afternoon!; Good evening!; I’m great.; I’m good.; Have a nice day!; See you later!",
          "time": "4 мин.",
          "notes": ""
        },
        "exercise": {
          "version": 1,
          "id": "a1-1-w1-l1-e02",
          "kind": "stage",
          "title": "Первые шесть фраз",
          "feedback": {
            "showAnswers": false
          },
          "exercises": [
            {
              "id": "a1-1-w1-l1-e02-reference",
              "exercise": {
                "version": 1,
                "id": "a1-1-w1-l1-e02-reference",
                "kind": "presentation",
                "title": "Первые шесть фраз",
                "feedback": {
                  "showAnswers": false
                },
                "blocks": [
                  {
                    "type": "disclosure",
                    "title": "Опора: прочитай и закрой перед заданием",
                    "text": "Hello! — Здравствуйте! / Здравствуй!\nHi! — Привет!\nHow are you? — Как дела?\nI’m fine. — У меня всё хорошо.\nAnd you? — А у тебя?\nBye! — Пока!\nHello — нейтральное приветствие; Hi — неформальное. Оба могут подходить для дружеского общения.",
                    "open": false
                  }
                ]
              }
            },
            {
              "id": "a1-1-w1-l1-e02-matching",
              "exercise": {
                "version": 1,
                "id": "a1-1-w1-l1-e02-matching",
                "kind": "matching",
                "title": "Первые шесть фраз",
                "feedback": {
                  "showAnswers": false
                },
                "instruction": "Соедини фразы и значения.",
                "items": [
                  {
                    "id": "m1",
                    "text": "Hello!",
                    "correctId": "E"
                  },
                  {
                    "id": "m2",
                    "text": "Hi!",
                    "correctId": "F"
                  },
                  {
                    "id": "m3",
                    "text": "How are you?",
                    "correctId": "D"
                  },
                  {
                    "id": "m4",
                    "text": "I’m fine.",
                    "correctId": "B"
                  },
                  {
                    "id": "m5",
                    "text": "And you?",
                    "correctId": "A"
                  },
                  {
                    "id": "m6",
                    "text": "Bye!",
                    "correctId": "C"
                  }
                ],
                "options": [
                  {
                    "id": "A",
                    "text": "А у тебя?"
                  },
                  {
                    "id": "B",
                    "text": "У меня всё хорошо."
                  },
                  {
                    "id": "C",
                    "text": "Пока!"
                  },
                  {
                    "id": "D",
                    "text": "Как дела?"
                  },
                  {
                    "id": "E",
                    "text": "Здравствуйте! / Здравствуй!"
                  },
                  {
                    "id": "F",
                    "text": "Привет!"
                  }
                ]
              }
            }
          ],
          "layout": "grouped"
        },
        "sourceId": "A1.1-W1-L1-E02"
      },
      {
        "menu": "3. Слушай и повторяй",
        "section": "tasks",
        "guide": {
          "aim": "Воспроизвести первую группу целыми репликами.",
          "tl": "Hello!; Hi!; How are you?; I’m fine.; And you?; Bye!; Good morning!; Good afternoon!; Good evening!; I’m great.; I’m good.; Have a nice day!; See you later!",
          "time": "3 мин.",
          "notes": "",
          "audioScript": "Hello! (пауза)\nHi! (пауза)\nHow are you? (пауза)\nI’m fine. (пауза)\nAnd you? (пауза)\nBye! (пауза)\nA: How are you?\nB: I’m fine. And you?\nA: I’m fine."
        },
        "exercise": {
          "version": 1,
          "id": "a1-1-w1-l1-e03-repeat",
          "kind": "audio",
          "title": "Слушай и повторяй",
          "feedback": {
            "showAnswers": false
          },
          "layout": "listen-repeat",
          "audioPending": true,
          "instruction": "Послушай и повтори. Затем закрой текст и повтори за преподавателем ещё раз.",
          "items": [
            {
              "id": "phrase1",
              "text": "Hello!"
            },
            {
              "id": "phrase2",
              "text": "Hi!"
            },
            {
              "id": "phrase3",
              "text": "How are you?"
            },
            {
              "id": "phrase4",
              "text": "I’m fine."
            },
            {
              "id": "phrase5",
              "text": "And you?"
            },
            {
              "id": "phrase6",
              "text": "Bye!"
            },
            {
              "id": "phrase7",
              "text": "A: How are you?"
            },
            {
              "id": "phrase8",
              "text": "B: I’m fine. And you?"
            },
            {
              "id": "phrase9",
              "text": "A: I’m fine."
            }
          ]
        },
        "sourceId": "A1.1-W1-L1-E03"
      },
      {
        "menu": "4. Твой первый разговор",
        "section": "tasks",
        "guide": {
          "aim": "Использовать первую группу в разговоре.",
          "tl": "Hello!; Hi!; How are you?; I’m fine.; And you?; Bye!; Good morning!; Good afternoon!; Good evening!; I’m great.; I’m good.; Have a nice day!; See you later!",
          "time": "3 мин.",
          "notes": "Первый проход с опорой, второй — по списку действий. Разрешены оба приветствия."
        },
        "exercise": {
          "version": 1,
          "id": "a1-1-w1-l1-e04",
          "kind": "stage",
          "title": "Твой первый разговор",
          "feedback": {
            "showAnswers": false
          },
          "exercises": [
            {
              "id": "a1-1-w1-l1-e04-text",
              "exercise": {
                "version": 1,
                "id": "a1-1-w1-l1-e04-text",
                "kind": "presentation",
                "title": "Твой первый разговор",
                "feedback": {
                  "showAnswers": false
                },
                "blocks": [
                  {
                    "type": "text",
                    "text": "Поговори с преподавателем, затем поменяйтесь ролями.\n\n1. Поздоровайся.\n2. Спроси, как дела.\n3. Ответь и спроси в ответ.\n4. Попрощайся."
                  }
                ]
              }
            },
            {
              "id": "a1-1-w1-l1-e04-support",
              "exercise": {
                "version": 1,
                "id": "a1-1-w1-l1-e04-support",
                "kind": "presentation",
                "title": "Твой первый разговор",
                "feedback": {
                  "showAnswers": false
                },
                "blocks": [
                  {
                    "type": "disclosure",
                    "title": "Опора при необходимости",
                    "text": "Hello! / Hi!\nHow are you?\nI’m fine. And you?\nBye!",
                    "open": false
                  }
                ]
              }
            }
          ],
          "layout": "grouped"
        },
        "sourceId": "A1.1-W1-L1-E04"
      },
      {
        "menu": "5. Утро, день или вечер?",
        "section": "tasks",
        "guide": {
          "aim": "Различить приветствия по времени и функции новых реплик.",
          "tl": "Hello!; Hi!; How are you?; I’m fine.; And you?; Bye!; Good morning!; Good afternoon!; Good evening!; I’m great.; I’m good.; Have a nice day!; See you later!",
          "time": "4 мин.",
          "notes": "Примеры — намеренная опора для discovery, не итоговый тест. Не добавлять Good night."
        },
        "exercise": {
          "version": 1,
          "id": "a1-1-w1-l1-e05",
          "kind": "rule-page",
          "title": "Утро, день или вечер?",
          "feedback": {
            "showAnswers": false
          },
          "instruction": "Обрати внимание на выделенные части примеров. Выполни задание, нажми OK и открой правило стрелкой.",
          "blocks": [
            {
              "type": "text",
              "text": "09:00, утро — Good morning!\n15:00, день — Good afternoon!\n19:00, вечер — Good evening!",
              "highlights": [
                "morning",
                "afternoon",
                "evening"
              ]
            },
            {
              "type": "exercise",
              "id": "notice",
              "exercise": {
                "version": 1,
                "id": "a1-1-w1-l1-e05-choice",
                "kind": "choice",
                "title": "Утро, день или вечер?",
                "feedback": {
                  "showAnswers": false
                },
                "instruction": "Посмотри на примеры. Выбери, как закончить фразу.",
                "items": [
                  {
                    "id": "q1",
                    "prompt": "В 15:00 при встрече выбираем…",
                    "options": [
                      {
                        "id": "o1",
                        "text": "Good evening!"
                      },
                      {
                        "id": "o2",
                        "text": "Good morning!"
                      },
                      {
                        "id": "o3",
                        "text": "Good afternoon!"
                      }
                    ],
                    "correctId": "o3"
                  },
                  {
                    "id": "q2",
                    "prompt": "Good evening! говорят…",
                    "options": [
                      {
                        "id": "o1",
                        "text": "при встрече вечером"
                      },
                      {
                        "id": "o2",
                        "text": "при прощании вечером"
                      },
                      {
                        "id": "o3",
                        "text": "при встрече утром"
                      }
                    ],
                    "correctId": "o1"
                  }
                ]
              }
            },
            {
              "type": "rule",
              "title": "Правило",
              "text": "Good morning! — приветствие утром.\nGood afternoon! — приветствие днём.\nGood evening! — приветствие вечером.\nЭто фразы при встрече. Для прощания используй Bye! или See you later!",
              "highlights": [
                "Good morning!",
                "Good afternoon!",
                "Good evening!",
                "Bye!",
                "See you later!"
              ]
            },
            {
              "type": "rule",
              "title": "Ещё несколько фраз",
              "text": "I’m great. — У меня всё отлично.\nI’m good. — У меня всё хорошо.\nHave a nice day! — Хорошего дня!\nSee you later! — Увидимся!",
              "highlights": [
                "I’m great.",
                "I’m good.",
                "Have a nice day!",
                "See you later!"
              ]
            }
          ]
        },
        "sourceId": "A1.1-W1-L1-E05"
      },
      {
        "menu": "6. Новые варианты",
        "section": "tasks",
        "guide": {
          "aim": "Освоить произношение второй группы.",
          "tl": "Hello!; Hi!; How are you?; I’m fine.; And you?; Bye!; Good morning!; Good afternoon!; Good evening!; I’m great.; I’m good.; Have a nice day!; See you later!",
          "time": "3 мин.",
          "notes": "",
          "audioScript": "Good morning! (пауза)\nGood afternoon! (пауза)\nGood evening! (пауза)\nI’m great. (пауза)\nI’m good. (пауза)\nHave a nice day! (пауза)\nSee you later! (пауза)\nA: How are you?\nB: I’m great. And you?\nA: I’m good.\nA: Have a nice day!\nB: Bye!"
        },
        "exercise": {
          "version": 1,
          "id": "a1-1-w1-l1-e06-repeat",
          "kind": "audio",
          "title": "Новые варианты",
          "feedback": {
            "showAnswers": false
          },
          "layout": "listen-repeat",
          "audioPending": true,
          "instruction": "Слушай и повторяй целыми репликами.",
          "items": [
            {
              "id": "phrase1",
              "text": "Good morning!"
            },
            {
              "id": "phrase2",
              "text": "Good afternoon!"
            },
            {
              "id": "phrase3",
              "text": "Good evening!"
            },
            {
              "id": "phrase4",
              "text": "I’m great."
            },
            {
              "id": "phrase5",
              "text": "I’m good."
            },
            {
              "id": "phrase6",
              "text": "Have a nice day!"
            },
            {
              "id": "phrase7",
              "text": "See you later!"
            },
            {
              "id": "phrase8",
              "text": "A: How are you?"
            },
            {
              "id": "phrase9",
              "text": "B: I’m great. And you?"
            },
            {
              "id": "phrase10",
              "text": "A: I’m good."
            },
            {
              "id": "phrase11",
              "text": "A: Have a nice day!"
            },
            {
              "id": "phrase12",
              "text": "B: Bye!"
            }
          ]
        },
        "sourceId": "A1.1-W1-L1-E06"
      },
      {
        "menu": "7. Что ты слышишь?",
        "section": "tasks",
        "guide": {
          "aim": "Распознать конкретную реплику на слух.",
          "tl": "Hello!; Hi!; How are you?; I’m fine.; And you?; Bye!; Good morning!; Good afternoon!; Good evening!; I’m great.; I’m good.; Have a nice day!; See you later!",
          "time": "4 мин.",
          "notes": "",
          "audioScript": "1.\nA: Good morning!\nB: Good morning!\nA: How are you?\nB: I’m fine.\n\n2.\nA: Hi! How are you?\nB: I’m great. And you?\nA: I’m good.\n\n3.\nA: See you later!\nB: Bye!"
        },
        "exercise": {
          "version": 1,
          "id": "a1-1-w1-l1-e07-choice",
          "kind": "choice",
          "title": "Что ты слышишь?",
          "feedback": {
            "showAnswers": false
          },
          "instruction": "Послушай три разговора. Выбирай то, что действительно прозвучало.",
          "items": [
            {
              "id": "q1",
              "prompt": "Как поздоровались?",
              "options": [
                {
                  "id": "o1",
                  "text": "Good evening!"
                },
                {
                  "id": "o2",
                  "text": "Good morning!"
                }
              ],
              "correctId": "o2"
            },
            {
              "id": "q2",
              "prompt": "Как ответил второй человек?",
              "options": [
                {
                  "id": "o1",
                  "text": "I’m good."
                },
                {
                  "id": "o2",
                  "text": "I’m great."
                }
              ],
              "correctId": "o2"
            },
            {
              "id": "q3",
              "prompt": "Какую фразу произнёс первый человек перед прощанием?",
              "options": [
                {
                  "id": "o1",
                  "text": "See you later!"
                },
                {
                  "id": "o2",
                  "text": "Have a nice day!"
                }
              ],
              "correctId": "o1"
            }
          ]
        },
        "sourceId": "A1.1-W1-L1-E07"
      },
      {
        "menu": "8. Три встречи",
        "section": "tasks",
        "guide": {
          "aim": "Самостоятельно провести короткие разговоры.",
          "tl": "Hello!; Hi!; How are you?; I’m fine.; And you?; Bye!; Good morning!; Good afternoon!; Good evening!; I’m great.; I’m good.; Have a nice day!; See you later!",
          "time": "8 мин.",
          "notes": "Карточка 3 — сначала без списка английских реплик. Не требовать имени или незнакомых конструкций.\nКритерии: Выбирает приветствие по ситуации.; Спрашивает и отвечает.; Возвращает вопрос.; Завершает разговор."
        },
        "exercise": {
          "version": 1,
          "id": "a1-1-w1-l1-e08",
          "kind": "stage",
          "title": "Три встречи",
          "feedback": {
            "showAnswers": false
          },
          "exercises": [
            {
              "id": "a1-1-w1-l1-e08-text",
              "exercise": {
                "version": 1,
                "id": "a1-1-w1-l1-e08-text",
                "kind": "presentation",
                "title": "Три встречи",
                "feedback": {
                  "showAnswers": false
                },
                "blocks": [
                  {
                    "type": "text",
                    "text": "Разыграйте три встречи. В каждой поздоровайтесь, спросите, как дела, ответьте и попрощайтесь. Меняйтесь ролями.\n\nКарточка 1. Утро, 09:00. Ты встречаешь человека на занятии. Используй приветствие по времени суток.\n\nКарточка 2. День, 15:00. Ты встречаешь знакомого. Используй неформальное приветствие и пожелай хорошего дня в конце.\n\nКарточка 3. Вечер, 19:00. Ты встречаешь знакомого. Используй приветствие по времени суток. В конце скажи «Увидимся»."
                  }
                ]
              }
            },
            {
              "id": "a1-1-w1-l1-e08-support",
              "exercise": {
                "version": 1,
                "id": "a1-1-w1-l1-e08-support",
                "kind": "presentation",
                "title": "Три встречи",
                "feedback": {
                  "showAnswers": false
                },
                "blocks": [
                  {
                    "type": "disclosure",
                    "title": "Опора при необходимости",
                    "text": "How are you?\nI’m fine. / I’m good. / I’m great.\nAnd you?",
                    "open": false
                  }
                ]
              }
            }
          ],
          "layout": "grouped"
        },
        "sourceId": "A1.1-W1-L1-E08"
      }
    ]
  },
  {
    "id": "a1-1-w1-l2",
    "title": "Рад знакомству",
    "level": "A1.1",
    "whale": 1,
    "durationMinutes": 30,
    "goal": "Выбрать вежливую реплику, различить первое знакомство и повторную встречу, поддержать короткий small talk.",
    "stages": [
      {
        "menu": "1. Снова встречаемся",
        "section": "tasks",
        "guide": {
          "aim": "Вспомнить приветствия и ответы.",
          "tl": "Excuse me.; I’m sorry.; Please.; Thank you.; You’re welcome.; It’s okay.; Yes, please.; Nice to see you.; Nice to meet you.; Nice to see you too.; Nice to meet you too.; You look great.; How is your day?; Good, thank you.; What’s up?; Not much.; Pleased to meet you.",
          "time": "2 мин.",
          "notes": "Не вводить новую лексику при лёгком выполнении; предложить поменяться ролями."
        },
        "exercise": {
          "version": 1,
          "id": "a1-1-w1-l2-e01-text",
          "kind": "presentation",
          "title": "Снова встречаемся",
          "feedback": {
            "showAnswers": false
          },
          "blocks": [
            {
              "type": "text",
              "text": "Поздоровайся с преподавателем. Спроси, как дела. Ответь на встречный вопрос.\n\nСегодня вы встречаетесь днём."
            }
          ]
        },
        "sourceId": "A1.1-W1-L2-E01"
      },
      {
        "menu": "2. Вежливые фразы",
        "section": "tasks",
        "guide": {
          "aim": "Понять функции семи формул.",
          "tl": "Excuse me.; I’m sorry.; Please.; Thank you.; You’re welcome.; It’s okay.; Yes, please.; Nice to see you.; Nice to meet you.; Nice to see you too.; Nice to meet you too.; You look great.; How is your day?; Good, thank you.; What’s up?; Not much.; Pleased to meet you.",
          "time": "4 мин.",
          "notes": ""
        },
        "exercise": {
          "version": 1,
          "id": "a1-1-w1-l2-e02",
          "kind": "stage",
          "title": "Вежливые фразы",
          "feedback": {
            "showAnswers": false
          },
          "exercises": [
            {
              "id": "a1-1-w1-l2-e02-reference",
              "exercise": {
                "version": 1,
                "id": "a1-1-w1-l2-e02-reference",
                "kind": "presentation",
                "title": "Вежливые фразы",
                "feedback": {
                  "showAnswers": false
                },
                "blocks": [
                  {
                    "type": "disclosure",
                    "title": "Опора: прочитай и закрой перед заданием",
                    "text": "Excuse me. — Извините: чтобы привлечь внимание.\nI’m sorry. — Простите: когда извиняешься за свой поступок.\nPlease. — Пожалуйста: в просьбе.\nThank you. — Спасибо.\nYou’re welcome. — Не за что.\nIt’s okay. — Всё в порядке: в ответ на извинение.\nYes, please. — Да, пожалуйста: принимаешь предложение.",
                    "open": false
                  }
                ]
              }
            },
            {
              "id": "a1-1-w1-l2-e02-matching",
              "exercise": {
                "version": 1,
                "id": "a1-1-w1-l2-e02-matching",
                "kind": "matching",
                "title": "Вежливые фразы",
                "feedback": {
                  "showAnswers": false
                },
                "instruction": "Соедини фразы и значения.",
                "items": [
                  {
                    "id": "m1",
                    "text": "Excuse me.",
                    "correctId": "D"
                  },
                  {
                    "id": "m2",
                    "text": "I’m sorry.",
                    "correctId": "G"
                  },
                  {
                    "id": "m3",
                    "text": "Please.",
                    "correctId": "E"
                  },
                  {
                    "id": "m4",
                    "text": "Thank you.",
                    "correctId": "A"
                  },
                  {
                    "id": "m5",
                    "text": "You’re welcome.",
                    "correctId": "F"
                  },
                  {
                    "id": "m6",
                    "text": "It’s okay.",
                    "correctId": "B"
                  },
                  {
                    "id": "m7",
                    "text": "Yes, please.",
                    "correctId": "C"
                  }
                ],
                "options": [
                  {
                    "id": "A",
                    "text": "Спасибо."
                  },
                  {
                    "id": "B",
                    "text": "Всё в порядке. — В ответ на извинение."
                  },
                  {
                    "id": "C",
                    "text": "Да, пожалуйста. — Принимаешь предложение."
                  },
                  {
                    "id": "D",
                    "text": "Извините. — Привлекаешь внимание."
                  },
                  {
                    "id": "E",
                    "text": "Пожалуйста. — Делаешь просьбу вежливой."
                  },
                  {
                    "id": "F",
                    "text": "Не за что. — Отвечаешь на благодарность."
                  },
                  {
                    "id": "G",
                    "text": "Простите. — Извиняешься за свой поступок."
                  }
                ]
              }
            }
          ],
          "layout": "grouped"
        },
        "sourceId": "A1.1-W1-L2-E02"
      },
      {
        "menu": "3. Произносим вежливо",
        "section": "tasks",
        "guide": {
          "aim": "Произнести семь формул и ответные пары.",
          "tl": "Excuse me.; I’m sorry.; Please.; Thank you.; You’re welcome.; It’s okay.; Yes, please.; Nice to see you.; Nice to meet you.; Nice to see you too.; Nice to meet you too.; You look great.; How is your day?; Good, thank you.; What’s up?; Not much.; Pleased to meet you.",
          "time": "2 мин.",
          "notes": "",
          "audioScript": "Excuse me. (пауза)\nI’m sorry. (пауза)\nPlease. (пауза)\nThank you. (пауза)\nYou’re welcome. (пауза)\nIt’s okay. (пауза)\nYes, please. (пауза)\nA: Thank you.\nB: You’re welcome.\nA: I’m sorry.\nB: It’s okay."
        },
        "exercise": {
          "version": 1,
          "id": "a1-1-w1-l2-e03-repeat",
          "kind": "audio",
          "title": "Произносим вежливо",
          "feedback": {
            "showAnswers": false
          },
          "layout": "listen-repeat",
          "audioPending": true,
          "instruction": "Послушай и повтори.",
          "items": [
            {
              "id": "phrase1",
              "text": "Excuse me."
            },
            {
              "id": "phrase2",
              "text": "I’m sorry."
            },
            {
              "id": "phrase3",
              "text": "Please."
            },
            {
              "id": "phrase4",
              "text": "Thank you."
            },
            {
              "id": "phrase5",
              "text": "You’re welcome."
            },
            {
              "id": "phrase6",
              "text": "It’s okay."
            },
            {
              "id": "phrase7",
              "text": "Yes, please."
            },
            {
              "id": "phrase8",
              "text": "A: Thank you."
            },
            {
              "id": "phrase9",
              "text": "B: You’re welcome."
            },
            {
              "id": "phrase10",
              "text": "A: I’m sorry."
            },
            {
              "id": "phrase11",
              "text": "B: It’s okay."
            }
          ]
        },
        "sourceId": "A1.1-W1-L2-E03"
      },
      {
        "menu": "4. Что сказать?",
        "section": "tasks",
        "guide": {
          "aim": "Выбирать реплику по намерению.",
          "tl": "Excuse me.; I’m sorry.; Please.; Thank you.; You’re welcome.; It’s okay.; Yes, please.; Nice to see you.; Nice to meet you.; Nice to see you too.; Nice to meet you too.; You look great.; How is your day?; Good, thank you.; What’s up?; Not much.; Pleased to meet you.",
          "time": "3 мин.",
          "notes": ""
        },
        "exercise": {
          "version": 1,
          "id": "a1-1-w1-l2-e04-choice",
          "kind": "choice",
          "title": "Что сказать?",
          "feedback": {
            "showAnswers": false
          },
          "instruction": "Выбери подходящую реплику.",
          "items": [
            {
              "id": "q1",
              "prompt": "Тебе помогли. Ты хочешь поблагодарить.",
              "options": [
                {
                  "id": "o1",
                  "text": "Thank you."
                },
                {
                  "id": "o2",
                  "text": "You’re welcome."
                }
              ],
              "correctId": "o1"
            },
            {
              "id": "q2",
              "prompt": "Ты случайно наступил человеку на ногу и извиняешься.",
              "options": [
                {
                  "id": "o1",
                  "text": "You’re welcome."
                },
                {
                  "id": "o2",
                  "text": "I’m sorry."
                }
              ],
              "correctId": "o2"
            },
            {
              "id": "q3",
              "prompt": "Тебя поблагодарили. Ты отвечаешь «Не за что».",
              "options": [
                {
                  "id": "o1",
                  "text": "Please."
                },
                {
                  "id": "o2",
                  "text": "You’re welcome."
                }
              ],
              "correctId": "o2"
            },
            {
              "id": "q4",
              "prompt": "Тебе предлагают помощь. Ты принимаешь её.",
              "options": [
                {
                  "id": "o1",
                  "text": "Yes, please."
                },
                {
                  "id": "o2",
                  "text": "I’m sorry."
                }
              ],
              "correctId": "o1"
            },
            {
              "id": "q5",
              "prompt": "Человек извинился. Ты хочешь сказать, что всё в порядке.",
              "options": [
                {
                  "id": "o1",
                  "text": "It’s okay."
                },
                {
                  "id": "o2",
                  "text": "Excuse me."
                }
              ],
              "correctId": "o1"
            },
            {
              "id": "q6",
              "prompt": "Ты хочешь привлечь внимание незнакомого человека.",
              "options": [
                {
                  "id": "o1",
                  "text": "You’re welcome."
                },
                {
                  "id": "o2",
                  "text": "Excuse me."
                }
              ],
              "correctId": "o2"
            }
          ]
        },
        "sourceId": "A1.1-W1-L2-E04"
      },
      {
        "menu": "5. Мы уже знакомы?",
        "section": "tasks",
        "guide": {
          "aim": "Различить meet и see, понять too.",
          "tl": "Excuse me.; I’m sorry.; Please.; Thank you.; You’re welcome.; It’s okay.; Yes, please.; Nice to see you.; Nice to meet you.; Nice to see you too.; Nice to meet you too.; You look great.; How is your day?; Good, thank you.; What’s up?; Not much.; Pleased to meet you.",
          "time": "3 мин.",
          "notes": ""
        },
        "exercise": {
          "version": 1,
          "id": "a1-1-w1-l2-e05",
          "kind": "rule-page",
          "title": "Мы уже знакомы?",
          "feedback": {
            "showAnswers": false
          },
          "instruction": "Обрати внимание на выделенные части примеров. Выполни задание, нажми OK и открой правило стрелкой.",
          "blocks": [
            {
              "type": "text",
              "text": "Первая встреча:\nA: Nice to meet you.\nB: Nice to meet you too.\n\nВстреча знакомых:\nA: Nice to see you.\nB: Nice to see you too.",
              "highlights": [
                "meet",
                "see",
                "too"
              ]
            },
            {
              "type": "exercise",
              "id": "notice",
              "exercise": {
                "version": 1,
                "id": "a1-1-w1-l2-e05-choice",
                "kind": "choice",
                "title": "Мы уже знакомы?",
                "feedback": {
                  "showAnswers": false
                },
                "instruction": "Посмотри на примеры. Выбери, как закончить фразу.",
                "items": [
                  {
                    "id": "q1",
                    "prompt": "При первом знакомстве: Nice to … you.",
                    "options": [
                      {
                        "id": "o1",
                        "text": "see"
                      },
                      {
                        "id": "o2",
                        "text": "meet"
                      }
                    ],
                    "correctId": "o2"
                  },
                  {
                    "id": "q2",
                    "prompt": "При встрече со знакомым: Nice to … you.",
                    "options": [
                      {
                        "id": "o1",
                        "text": "see"
                      },
                      {
                        "id": "o2",
                        "text": "meet"
                      }
                    ],
                    "correctId": "o1"
                  },
                  {
                    "id": "q3",
                    "prompt": "Too в ответной реплике означает…",
                    "options": [
                      {
                        "id": "o1",
                        "text": "снова"
                      },
                      {
                        "id": "o2",
                        "text": "тоже"
                      },
                      {
                        "id": "o3",
                        "text": "впервые"
                      }
                    ],
                    "correctId": "o2"
                  }
                ]
              }
            },
            {
              "type": "rule",
              "title": "Правило",
              "text": "Nice to meet you. — Приятно познакомиться.\nNice to see you. — Рад тебя видеть.\nToo — «тоже»: Nice to meet you too. / Nice to see you too.\nPleased to meet you. — Более официальный вариант при первом знакомстве.",
              "highlights": [
                "Nice to meet you.",
                "Nice to see you.",
                "Too",
                "Pleased to meet you."
              ]
            }
          ]
        },
        "sourceId": "A1.1-W1-L2-E05"
      },
      {
        "menu": "6. Ещё немного small talk",
        "section": "tasks",
        "guide": {
          "aim": "Понять дополнительные реплики и реакции.",
          "tl": "Excuse me.; I’m sorry.; Please.; Thank you.; You’re welcome.; It’s okay.; Yes, please.; Nice to see you.; Nice to meet you.; Nice to see you too.; Nice to meet you too.; You look great.; How is your day?; Good, thank you.; What’s up?; Not much.; Pleased to meet you.",
          "time": "3 мин.",
          "notes": ""
        },
        "exercise": {
          "version": 1,
          "id": "a1-1-w1-l2-e06",
          "kind": "stage",
          "title": "Ещё немного small talk",
          "feedback": {
            "showAnswers": false
          },
          "exercises": [
            {
              "id": "a1-1-w1-l2-e06-reference",
              "exercise": {
                "version": 1,
                "id": "a1-1-w1-l2-e06-reference",
                "kind": "presentation",
                "title": "Ещё немного small talk",
                "feedback": {
                  "showAnswers": false
                },
                "blocks": [
                  {
                    "type": "disclosure",
                    "title": "Опора: прочитай и закрой перед заданием",
                    "text": "You look great. — Отлично выглядишь.\nHow is your day? — Как проходит твой день?\nGood, thank you. — Хорошо, спасибо.\nWhat’s up? — Что нового? Неформально.\nNot much. — Да ничего особенного.",
                    "open": false
                  }
                ]
              }
            },
            {
              "id": "a1-1-w1-l2-e06-matching",
              "exercise": {
                "version": 1,
                "id": "a1-1-w1-l2-e06-matching",
                "kind": "matching",
                "title": "Ещё немного small talk",
                "feedback": {
                  "showAnswers": false
                },
                "instruction": "Соедини фразы и значения.",
                "items": [
                  {
                    "id": "m1",
                    "text": "You look great.",
                    "correctId": "D"
                  },
                  {
                    "id": "m2",
                    "text": "How is your day?",
                    "correctId": "B"
                  },
                  {
                    "id": "m3",
                    "text": "Good, thank you.",
                    "correctId": "E"
                  },
                  {
                    "id": "m4",
                    "text": "What’s up?",
                    "correctId": "C"
                  },
                  {
                    "id": "m5",
                    "text": "Not much.",
                    "correctId": "A"
                  }
                ],
                "options": [
                  {
                    "id": "A",
                    "text": "Да ничего особенного."
                  },
                  {
                    "id": "B",
                    "text": "Как проходит твой день?"
                  },
                  {
                    "id": "C",
                    "text": "Что нового? — Неформальное приветствие."
                  },
                  {
                    "id": "D",
                    "text": "Отлично выглядишь."
                  },
                  {
                    "id": "E",
                    "text": "Хорошо, спасибо."
                  }
                ]
              }
            },
            {
              "id": "a1-1-w1-l2-e06-after",
              "exercise": {
                "version": 1,
                "id": "a1-1-w1-l2-e06-after",
                "kind": "presentation",
                "title": "Ещё немного small talk",
                "feedback": {
                  "showAnswers": false
                },
                "blocks": [
                  {
                    "type": "text",
                    "text": "Короткие разговоры:\nA: You look great.\nB: Thank you.\n\nA: How is your day?\nB: Good, thank you. And you?\n\nA: What’s up?\nB: Not much."
                  }
                ]
              }
            }
          ],
          "layout": "grouped"
        },
        "sourceId": "A1.1-W1-L2-E06"
      },
      {
        "menu": "7. Знакомимся и отвечаем",
        "section": "tasks",
        "guide": {
          "aim": "Освоить произношение второй группы.",
          "tl": "Excuse me.; I’m sorry.; Please.; Thank you.; You’re welcome.; It’s okay.; Yes, please.; Nice to see you.; Nice to meet you.; Nice to see you too.; Nice to meet you too.; You look great.; How is your day?; Good, thank you.; What’s up?; Not much.; Pleased to meet you.",
          "time": "3 мин.",
          "notes": "",
          "audioScript": "A: Nice to meet you.\nB: Nice to meet you too.\n(пауза)\nA: Nice to see you.\nB: Nice to see you too.\n(пауза)\nA: Pleased to meet you.\nB: Nice to meet you too.\n(пауза)\nA: You look great.\nB: Thank you.\n(пауза)\nA: How is your day?\nB: Good, thank you. And you?\nA: Good, thank you.\n(пауза)\nA: What’s up?\nB: Not much."
        },
        "exercise": {
          "version": 1,
          "id": "a1-1-w1-l2-e07-repeat",
          "kind": "audio",
          "title": "Знакомимся и отвечаем",
          "feedback": {
            "showAnswers": false
          },
          "layout": "listen-repeat",
          "audioPending": true,
          "instruction": "Слушай и повторяй. Затем прочитай роль B.",
          "items": [
            {
              "id": "phrase1",
              "text": "A: Nice to meet you."
            },
            {
              "id": "phrase2",
              "text": "B: Nice to meet you too."
            },
            {
              "id": "phrase3",
              "text": "A: Nice to see you."
            },
            {
              "id": "phrase4",
              "text": "B: Nice to see you too."
            },
            {
              "id": "phrase5",
              "text": "A: Pleased to meet you."
            },
            {
              "id": "phrase6",
              "text": "B: Nice to meet you too."
            },
            {
              "id": "phrase7",
              "text": "A: You look great."
            },
            {
              "id": "phrase8",
              "text": "B: Thank you."
            },
            {
              "id": "phrase9",
              "text": "A: How is your day?"
            },
            {
              "id": "phrase10",
              "text": "B: Good, thank you. And you?"
            },
            {
              "id": "phrase11",
              "text": "A: Good, thank you."
            },
            {
              "id": "phrase12",
              "text": "A: What’s up?"
            },
            {
              "id": "phrase13",
              "text": "B: Not much."
            }
          ]
        },
        "sourceId": "A1.1-W1-L2-E07"
      },
      {
        "menu": "8. Какая это ситуация?",
        "section": "tasks",
        "guide": {
          "aim": "Распознать функцию реплик на слух.",
          "tl": "Excuse me.; I’m sorry.; Please.; Thank you.; You’re welcome.; It’s okay.; Yes, please.; Nice to see you.; Nice to meet you.; Nice to see you too.; Nice to meet you too.; You look great.; How is your day?; Good, thank you.; What’s up?; Not much.; Pleased to meet you.",
          "time": "3 мин.",
          "notes": "",
          "audioScript": "1.\nA: Hello! Nice to meet you.\nB: Nice to meet you too.\n\n2.\nA: I’m sorry.\nB: It’s okay.\n\n3.\nA: Hi! Nice to see you.\nB: Nice to see you too.\n\n4.\nA: You look great.\nB: Thank you."
        },
        "exercise": {
          "version": 1,
          "id": "a1-1-w1-l2-e08-choice",
          "kind": "choice",
          "title": "Какая это ситуация?",
          "feedback": {
            "showAnswers": false
          },
          "instruction": "Послушай четыре разговора. Выбери описание каждого.",
          "items": [
            {
              "id": "q1",
              "prompt": "Разговор 1",
              "options": [
                {
                  "id": "o1",
                  "text": "Первая встреча."
                },
                {
                  "id": "o2",
                  "text": "Встреча знакомых."
                }
              ],
              "correctId": "o1"
            },
            {
              "id": "q2",
              "prompt": "Разговор 2",
              "options": [
                {
                  "id": "o1",
                  "text": "Благодарность."
                },
                {
                  "id": "o2",
                  "text": "Извинение."
                }
              ],
              "correctId": "o2"
            },
            {
              "id": "q3",
              "prompt": "Разговор 3",
              "options": [
                {
                  "id": "o1",
                  "text": "Первая встреча."
                },
                {
                  "id": "o2",
                  "text": "Встреча знакомых."
                }
              ],
              "correctId": "o2"
            },
            {
              "id": "q4",
              "prompt": "Разговор 4",
              "options": [
                {
                  "id": "o1",
                  "text": "Комплимент."
                },
                {
                  "id": "o2",
                  "text": "Вопрос о дне."
                }
              ],
              "correctId": "o1"
            }
          ]
        },
        "sourceId": "A1.1-W1-L2-E08"
      },
      {
        "menu": "9. Четыре ситуации",
        "section": "tasks",
        "guide": {
          "aim": "Использовать новые реплики уместно.",
          "tl": "Excuse me.; I’m sorry.; Please.; Thank you.; You’re welcome.; It’s okay.; Yes, please.; Nice to see you.; Nice to meet you.; Nice to see you too.; Nice to meet you too.; You look great.; How is your day?; Good, thank you.; What’s up?; Not much.; Pleased to meet you.",
          "time": "7 мин.",
          "notes": "В ситуации 4 предложение помощи остаётся по-русски или жестом: английские конструкции предложения помощи ещё не изучались. Дополнительно жестом предложите выбрать предмет; ученик указывает и говорит Please. Не вводить названия предметов.\nКритерии: Различает meet/see.; Реагирует на благодарность и извинение.; Поддерживает короткий small talk."
        },
        "exercise": {
          "version": 1,
          "id": "a1-1-w1-l2-e09",
          "kind": "stage",
          "title": "Четыре ситуации",
          "feedback": {
            "showAnswers": false
          },
          "exercises": [
            {
              "id": "a1-1-w1-l2-e09-text",
              "exercise": {
                "version": 1,
                "id": "a1-1-w1-l2-e09-text",
                "kind": "presentation",
                "title": "Четыре ситуации",
                "feedback": {
                  "showAnswers": false
                },
                "blocks": [
                  {
                    "type": "text",
                    "text": "Разыграйте ситуации. Затем поменяйтесь ролями.\n\n1. Первая встреча. Поздоровайтесь и скажите, что рады знакомству. Один из вас выбирает более официальный вариант.\n2. Встреча знакомых. Скажите, что рады видеть друг друга. Сделайте комплимент и спросите, как проходит день.\n3. Небольшая случайность. Один человек случайно задел другого и извиняется. Второй говорит, что всё в порядке.\n4. Помощь. Преподаватель по-русски предлагает помощь. Прими её по-английски; после помощи поблагодари. Собеседник отвечает.\n\nЕщё один короткий обмен: преподаватель говорит What’s up? Ответь."
                  }
                ]
              }
            },
            {
              "id": "a1-1-w1-l2-e09-support",
              "exercise": {
                "version": 1,
                "id": "a1-1-w1-l2-e09-support",
                "kind": "presentation",
                "title": "Четыре ситуации",
                "feedback": {
                  "showAnswers": false
                },
                "blocks": [
                  {
                    "type": "disclosure",
                    "title": "Опора при необходимости",
                    "text": "Nice to meet / see you.\nNice to meet / see you too.\nPleased to meet you.\nYou look great.\nHow is your day?\nGood, thank you.\nNot much.",
                    "open": false
                  }
                ]
              }
            }
          ],
          "layout": "grouped"
        },
        "sourceId": "A1.1-W1-L2-E09"
      }
    ]
  },
  {
    "id": "a1-1-w1-l3",
    "title": "Как вас зовут?",
    "level": "A1.1",
    "whale": 1,
    "durationMinutes": 30,
    "goal": "Спросить и назвать имя и фамилию, попросить spelling и передать имя по буквам.",
    "stages": [
      {
        "menu": "1. Перед знакомством",
        "section": "tasks",
        "guide": {
          "aim": "Повторить изученные реплики знакомства.",
          "tl": "first name; last name; What’s your name?; Can you spell it, please?; My first name is …; My last name is …; It’s …; Названия букв A–Z",
          "time": "2 мин.",
          "notes": "Имена пока не спрашивать: соответствующая модель вводится в упражнении 5."
        },
        "exercise": {
          "version": 1,
          "id": "a1-1-w1-l3-e01-text",
          "kind": "presentation",
          "title": "Перед знакомством",
          "feedback": {
            "showAnswers": false
          },
          "blocks": [
            {
              "type": "text",
              "text": "Ты впервые встречаешь преподавателя на мероприятии. Поздоровайтесь и скажите, что рады знакомству."
            }
          ]
        },
        "sourceId": "A1.1-W1-L3-E01"
      },
      {
        "menu": "2. Имя или фамилия?",
        "section": "tasks",
        "guide": {
          "aim": "Различить first name и last name.",
          "tl": "first name; last name; What’s your name?; Can you spell it, please?; My first name is …; My last name is …; It’s …; Названия букв A–Z",
          "time": "3 мин.",
          "notes": "Учебные имена записаны в порядке имя — фамилия. Это не универсальное правило для всех культур."
        },
        "exercise": {
          "version": 1,
          "id": "a1-1-w1-l3-e02",
          "kind": "stage",
          "title": "Имя или фамилия?",
          "feedback": {
            "showAnswers": false
          },
          "exercises": [
            {
              "id": "a1-1-w1-l3-e02-reference",
              "exercise": {
                "version": 1,
                "id": "a1-1-w1-l3-e02-reference",
                "kind": "presentation",
                "title": "Имя или фамилия?",
                "feedback": {
                  "showAnswers": false
                },
                "blocks": [
                  {
                    "type": "disclosure",
                    "title": "Опора: прочитай и закрой перед заданием",
                    "text": "Anna Brown\nFirst name — имя: Anna.\nLast name — фамилия: Brown.\nИмена и фамилии начинаются с заглавной буквы.",
                    "open": false
                  }
                ]
              }
            },
            {
              "id": "a1-1-w1-l3-e02-matching",
              "exercise": {
                "version": 1,
                "id": "a1-1-w1-l3-e02-matching",
                "kind": "matching",
                "title": "Имя или фамилия?",
                "feedback": {
                  "showAnswers": false
                },
                "instruction": "Соедини подписи и значения.",
                "items": [
                  {
                    "id": "first",
                    "text": "First name",
                    "correctId": "name"
                  },
                  {
                    "id": "last",
                    "text": "Last name",
                    "correctId": "surname"
                  }
                ],
                "options": [
                  {
                    "id": "surname",
                    "text": "Фамилия"
                  },
                  {
                    "id": "name",
                    "text": "Имя"
                  }
                ]
              }
            },
            {
              "id": "a1-1-w1-l3-e02-gaps",
              "exercise": {
                "version": 1,
                "id": "a1-1-w1-l3-e02-gaps",
                "kind": "gaps",
                "title": "Имя или фамилия?",
                "feedback": {
                  "showAnswers": false
                },
                "instruction": "Заполни пропуски.",
                "items": [
                  {
                    "id": "row1",
                    "segments": [
                      "Alex Green — First name: ",
                      {
                        "id": "g1-1",
                        "answers": [
                          "Alex"
                        ]
                      },
                      "; Last name: ",
                      {
                        "id": "g1-2",
                        "answers": [
                          "Green"
                        ]
                      },
                      ""
                    ]
                  },
                  {
                    "id": "row2",
                    "segments": [
                      "Tom White — First name: ",
                      {
                        "id": "g2-1",
                        "answers": [
                          "Tom"
                        ]
                      },
                      "; Last name: ",
                      {
                        "id": "g2-2",
                        "answers": [
                          "White"
                        ]
                      },
                      ""
                    ]
                  }
                ]
              }
            }
          ],
          "layout": "grouped"
        },
        "sourceId": "A1.1-W1-L3-E02"
      },
      {
        "menu": "3. Названия букв",
        "section": "tasks",
        "guide": {
          "aim": "Произнести и распознать названия букв.",
          "tl": "first name; last name; What’s your name?; Can you spell it, please?; My first name is …; My last name is …; It’s …; Названия букв A–Z",
          "time": "6 мин.",
          "notes": "Произносить названия букв, не звуки при чтении слов. Для основной записи использовать Z = zed; привычный ученику вариант zee также принимается. После каждой буквы пауза для повторения.",
          "audioScript": "A; B; C; D; E; F; G.\nH; I; J; K; L; M; N.\nO; P; Q; R; S; T.\nU; V; W; X; Y; Z."
        },
        "exercise": {
          "version": 1,
          "id": "a1-1-w1-l3-e03-rule",
          "kind": "rule-page",
          "title": "Названия букв",
          "feedback": {
            "showAnswers": false
          },
          "blocks": [
            {
              "type": "rule",
              "title": "Правило и примеры",
              "text": "Слушай и называй буквы вслед за преподавателем.\n\nA B C D E F G\nH I J K L M N\nO P Q R S T\nU V W X Y Z\n\nТеперь произнеси буквы в другом порядке.\n\nE A I\nG J H\nB P V\nU W Y\nM N L\nC D F\nK O Q\nR S T\nX Z\n\nНайди буквы своего имени и назови их.",
              "highlights": []
            }
          ]
        },
        "sourceId": "A1.1-W1-L3-E03"
      },
      {
        "menu": "4. Какая буква прозвучала?",
        "section": "tasks",
        "guide": {
          "aim": "Различить названия букв на слух.",
          "tl": "first name; last name; What’s your name?; Can you spell it, please?; My first name is …; My last name is …; It’s …; Названия букв A–Z",
          "time": "3 мин.",
          "notes": "",
          "audioScript": "1. B.\n2. J.\n3. E.\n4. V.\n5. I.\n6. U.\n7. M.\n8. S."
        },
        "exercise": {
          "version": 1,
          "id": "a1-1-w1-l3-e04",
          "kind": "stage",
          "title": "Какая буква прозвучала?",
          "feedback": {
            "showAnswers": false
          },
          "exercises": [
            {
              "id": "a1-1-w1-l3-e04-choice",
              "exercise": {
                "version": 1,
                "id": "a1-1-w1-l3-e04-choice",
                "kind": "choice",
                "title": "Какая буква прозвучала?",
                "feedback": {
                  "showAnswers": false
                },
                "instruction": "Слушай. Выбери одну букву в каждой строке.",
                "items": [
                  {
                    "id": "q1",
                    "prompt": "Разговор 1",
                    "options": [
                      {
                        "id": "o1",
                        "text": "P"
                      },
                      {
                        "id": "o2",
                        "text": "B"
                      },
                      {
                        "id": "o3",
                        "text": "D"
                      }
                    ],
                    "correctId": "o2"
                  },
                  {
                    "id": "q2",
                    "prompt": "Разговор 2",
                    "options": [
                      {
                        "id": "o1",
                        "text": "G"
                      },
                      {
                        "id": "o2",
                        "text": "H"
                      },
                      {
                        "id": "o3",
                        "text": "J"
                      }
                    ],
                    "correctId": "o3"
                  },
                  {
                    "id": "q3",
                    "prompt": "Разговор 3",
                    "options": [
                      {
                        "id": "o1",
                        "text": "E"
                      },
                      {
                        "id": "o2",
                        "text": "I"
                      },
                      {
                        "id": "o3",
                        "text": "A"
                      }
                    ],
                    "correctId": "o1"
                  },
                  {
                    "id": "q4",
                    "prompt": "Разговор 4",
                    "options": [
                      {
                        "id": "o1",
                        "text": "V"
                      },
                      {
                        "id": "o2",
                        "text": "W"
                      },
                      {
                        "id": "o3",
                        "text": "B"
                      }
                    ],
                    "correctId": "o1"
                  },
                  {
                    "id": "q5",
                    "prompt": "Разговор 5",
                    "options": [
                      {
                        "id": "o1",
                        "text": "E"
                      },
                      {
                        "id": "o2",
                        "text": "Y"
                      },
                      {
                        "id": "o3",
                        "text": "I"
                      }
                    ],
                    "correctId": "o3"
                  },
                  {
                    "id": "q6",
                    "prompt": "Разговор 6",
                    "options": [
                      {
                        "id": "o1",
                        "text": "W"
                      },
                      {
                        "id": "o2",
                        "text": "U"
                      },
                      {
                        "id": "o3",
                        "text": "Q"
                      }
                    ],
                    "correctId": "o2"
                  }
                ]
              }
            },
            {
              "id": "a1-1-w1-l3-e04-gaps",
              "exercise": {
                "version": 1,
                "id": "a1-1-w1-l3-e04-gaps",
                "kind": "gaps",
                "title": "Какая буква прозвучала?",
                "feedback": {
                  "showAnswers": false
                },
                "instruction": "Теперь запиши услышанное без вариантов.",
                "items": [
                  {
                    "id": "row1",
                    "segments": [
                      "7. ",
                      {
                        "id": "g1-1",
                        "answers": [
                          "M"
                        ]
                      },
                      ""
                    ]
                  },
                  {
                    "id": "row2",
                    "segments": [
                      "8. ",
                      {
                        "id": "g2-1",
                        "answers": [
                          "S"
                        ]
                      },
                      ""
                    ]
                  }
                ]
              }
            }
          ],
          "layout": "grouped"
        },
        "sourceId": "A1.1-W1-L3-E04"
      },
      {
        "menu": "5. Спрашиваем имя",
        "section": "tasks",
        "guide": {
          "aim": "Освоить готовые вопросы и ответы.",
          "tl": "first name; last name; What’s your name?; Can you spell it, please?; My first name is …; My last name is …; It’s …; Названия букв A–Z",
          "time": "3 мин.",
          "notes": "",
          "audioScript": "A: What’s your name?\nB: My first name is Anna. My last name is Brown.\nA: Brown. Can you spell it, please?\nB: It’s B; R; O; W; N.\nA: Thank you.\nB: You’re welcome."
        },
        "exercise": {
          "version": 1,
          "id": "a1-1-w1-l3-e05-rule",
          "kind": "rule-page",
          "title": "Спрашиваем имя",
          "feedback": {
            "showAnswers": false
          },
          "blocks": [
            {
              "type": "rule",
              "title": "Правило и примеры",
              "text": "Прочитай значения. Послушай разговор и повтори реплики.\n\nWhat’s your name? — Как тебя зовут?\nCan you spell it, please? — Можешь произнести это по буквам?\nMy first name is … — Моё имя …\nMy last name is … — Моя фамилия …\nIt’s … — Это …\n\nA: What’s your name?\nB: My first name is Anna. My last name is Brown.\nA: Brown. Can you spell it, please?\nB: It’s B–R–O–W–N.\nA: Thank you.\nB: You’re welcome.",
              "highlights": [
                "My first name is",
                "My last name is",
                "What’s your name?",
                "Can you spell it, please?",
                "It’s"
              ]
            }
          ]
        },
        "sourceId": "A1.1-W1-L3-E05"
      },
      {
        "menu": "6. Собери реплику",
        "section": "tasks",
        "guide": {
          "aim": "Закрепить порядок частей готовых моделей.",
          "tl": "first name; last name; What’s your name?; Can you spell it, please?; My first name is …; My last name is …; It’s …; Названия букв A–Z",
          "time": "3 мин.",
          "notes": "Принимаются обе позиции please: в начале и в конце. Имена сохраняют заглавные буквы."
        },
        "exercise": {
          "version": 1,
          "id": "a1-1-w1-l3-e06",
          "kind": "stage",
          "title": "Собери реплику",
          "feedback": {
            "showAnswers": false
          },
          "exercises": [
            {
              "id": "a1-1-w1-l3-e06-order1",
              "exercise": {
                "version": 1,
                "id": "a1-1-w1-l3-e06-order1",
                "kind": "order",
                "title": "Собери реплику · 1",
                "feedback": {
                  "showAnswers": false
                },
                "tokens": [
                  {
                    "id": "t1",
                    "text": "your name"
                  },
                  {
                    "id": "t2",
                    "text": "what’s"
                  }
                ],
                "correctOrder": [
                  "t2",
                  "t1"
                ],
                "instruction": "Собери реплику из частей. Заглавная буква начала предложения не служит подсказкой."
              }
            },
            {
              "id": "a1-1-w1-l3-e06-order2",
              "exercise": {
                "version": 1,
                "id": "a1-1-w1-l3-e06-order2",
                "kind": "order",
                "title": "Собери реплику · 2",
                "feedback": {
                  "showAnswers": false
                },
                "tokens": [
                  {
                    "id": "t1",
                    "text": "please"
                  },
                  {
                    "id": "t2",
                    "text": "it"
                  },
                  {
                    "id": "t3",
                    "text": "can you spell"
                  }
                ],
                "correctOrder": [
                  "t3",
                  "t2",
                  "t1"
                ],
                "instruction": "Собери реплику из частей. Заглавная буква начала предложения не служит подсказкой.",
                "acceptedOrders": [
                  [
                    "t1",
                    "t3",
                    "t2"
                  ]
                ]
              }
            },
            {
              "id": "a1-1-w1-l3-e06-order3",
              "exercise": {
                "version": 1,
                "id": "a1-1-w1-l3-e06-order3",
                "kind": "order",
                "title": "Собери реплику · 3",
                "feedback": {
                  "showAnswers": false
                },
                "tokens": [
                  {
                    "id": "t1",
                    "text": "Anna"
                  },
                  {
                    "id": "t2",
                    "text": "my first name"
                  },
                  {
                    "id": "t3",
                    "text": "is"
                  }
                ],
                "correctOrder": [
                  "t2",
                  "t3",
                  "t1"
                ],
                "instruction": "Собери реплику из частей. Заглавная буква начала предложения не служит подсказкой."
              }
            },
            {
              "id": "a1-1-w1-l3-e06-order4",
              "exercise": {
                "version": 1,
                "id": "a1-1-w1-l3-e06-order4",
                "kind": "order",
                "title": "Собери реплику · 4",
                "feedback": {
                  "showAnswers": false
                },
                "tokens": [
                  {
                    "id": "t1",
                    "text": "is"
                  },
                  {
                    "id": "t2",
                    "text": "Brown"
                  },
                  {
                    "id": "t3",
                    "text": "my last name"
                  }
                ],
                "correctOrder": [
                  "t3",
                  "t1",
                  "t2"
                ],
                "instruction": "Собери реплику из частей. Заглавная буква начала предложения не служит подсказкой."
              }
            },
            {
              "id": "a1-1-w1-l3-e06-oral",
              "exercise": {
                "version": 1,
                "id": "a1-1-w1-l3-e06-oral",
                "kind": "presentation",
                "title": "Собери реплику",
                "feedback": {
                  "showAnswers": false
                },
                "blocks": [
                  {
                    "type": "text",
                    "text": "Ответь на собранный вопрос 1 о себе. Затем попроси преподавателя произнести имя по буквам."
                  }
                ]
              }
            }
          ],
          "layout": "grouped"
        },
        "sourceId": "A1.1-W1-L3-E06"
      },
      {
        "menu": "7. Запиши имя",
        "section": "tasks",
        "guide": {
          "aim": "Восстановить имена по буквенной диктовке.",
          "tl": "first name; last name; What’s your name?; Can you spell it, please?; My first name is …; My last name is …; It’s …; Названия букв A–Z",
          "time": "4 мин.",
          "notes": "При проверке отдельных букв регистр не влияет на результат; написание имени с заглавной обсуждается мягко.",
          "audioScript": "1. A; N; N; A.\n2. A; L; E; X.\n3. T; O; M."
        },
        "exercise": {
          "version": 1,
          "id": "a1-1-w1-l3-e07-gaps",
          "kind": "gaps",
          "title": "Запиши имя",
          "feedback": {
            "showAnswers": false
          },
          "instruction": "Слушай имена по буквам. Заполни пропуски. Каждый пропуск — одна буква.",
          "items": [
            {
              "id": "row1",
              "segments": [
                "1. A ",
                {
                  "id": "g1-1",
                  "answers": [
                    "n"
                  ]
                },
                " n ",
                {
                  "id": "g1-2",
                  "answers": [
                    "a"
                  ]
                },
                ""
              ]
            },
            {
              "id": "row2",
              "segments": [
                "2. ",
                {
                  "id": "g2-1",
                  "answers": [
                    "A"
                  ]
                },
                " l ",
                {
                  "id": "g2-2",
                  "answers": [
                    "e"
                  ]
                },
                " x"
              ]
            },
            {
              "id": "row3",
              "segments": [
                "3. Запиши третье имя полностью: ",
                {
                  "id": "g3-1",
                  "answers": [
                    "Tom"
                  ]
                },
                ""
              ]
            }
          ]
        },
        "sourceId": "A1.1-W1-L3-E07"
      },
      {
        "menu": "8. Обмен именами",
        "section": "tasks",
        "guide": {
          "aim": "Передать имя и фамилию через разговор и spelling.",
          "tl": "first name; last name; What’s your name?; Can you spell it, please?; My first name is …; My last name is …; It’s …; Названия букв A–Z",
          "time": "6 мин.",
          "notes": "Карточка B доступна преподавателю; в паре карточки раздать раздельно. Не добавлять вопрос What’s your last name? без введения.\nСкрытая карточка B: First name Leo; Last name King.\nКритерии: Задаёт целевой вопрос.; Различает имя/фамилию.; Просит spelling.; Передаёт и записывает буквы."
        },
        "exercise": {
          "version": 1,
          "id": "a1-1-w1-l3-e08",
          "kind": "stage",
          "title": "Обмен именами",
          "feedback": {
            "showAnswers": false
          },
          "exercises": [
            {
              "id": "a1-1-w1-l3-e08-text",
              "exercise": {
                "version": 1,
                "id": "a1-1-w1-l3-e08-text",
                "kind": "presentation",
                "title": "Обмен именами",
                "feedback": {
                  "showAnswers": false
                },
                "blocks": [
                  {
                    "type": "text",
                    "text": "Раунд 1. Используй свои имя и фамилию. Спроси имя собеседника. Попроси произнести его по буквам и запиши.\n\nРаунд 2. Используй учебную карточку. Не показывай её собеседнику.\n\nКарточка A\nFirst name: Emma\nLast name: Fox\n\nВ разговоре:\nПоздоровайтесь.\nСпросите имя.\nНазовите имя и фамилию.\nПопросите произнести фамилию по буквам.\nЗапишите ответ.\nПоблагодарите и попрощайтесь."
                  }
                ]
              }
            },
            {
              "id": "a1-1-w1-l3-e08-support",
              "exercise": {
                "version": 1,
                "id": "a1-1-w1-l3-e08-support",
                "kind": "presentation",
                "title": "Обмен именами",
                "feedback": {
                  "showAnswers": false
                },
                "blocks": [
                  {
                    "type": "disclosure",
                    "title": "Опора при необходимости",
                    "text": "What’s your name?\nMy first name is …\nMy last name is …\nCan you spell it, please?\nIt’s …",
                    "open": false
                  }
                ]
              }
            }
          ],
          "layout": "grouped"
        },
        "sourceId": "A1.1-W1-L3-E08"
      }
    ]
  },
  {
    "id": "a1-1-w1-l4",
    "title": "Заполняем анкету",
    "level": "A1.1",
    "whale": 1,
    "durationMinutes": 30,
    "goal": "Назвать возраст и страну, понять вопросы, заполнить простую анкету; повторить числа 0–100.",
    "stages": [
      {
        "menu": "1. Вспоминаем числа",
        "section": "tasks",
        "guide": {
          "aim": "Актуализировать знакомые числительные.",
          "tl": "How old are you?; Where are you from?; I’m …; I’m from …; age; country; date of birth; gender; male; female; Russia; the UK; the USA; France; Germany; China; Числа 0–100",
          "time": "2 мин.",
          "notes": "Это краткое повторение. Не превращать в отдельный урок чисел; при затруднении дать модель и продолжить."
        },
        "exercise": {
          "version": 1,
          "id": "a1-1-w1-l4-e01-text",
          "kind": "presentation",
          "title": "Вспоминаем числа",
          "feedback": {
            "showAnswers": false
          },
          "blocks": [
            {
              "type": "text",
              "text": "Прочитай числа вслух.\n\n7 · 0 · 12 · 16 · 20 · 35 · 48 · 70 · 91 · 100\n\nЕсли какое-то число забылось, посмотри на подсказку в следующем задании."
            }
          ]
        },
        "sourceId": "A1.1-W1-L4-E01"
      },
      {
        "menu": "2. Числа 0–100: короткое повторение",
        "section": "tasks",
        "guide": {
          "aim": "Вспомнить группы и произношение числительных.",
          "tl": "How old are you?; Where are you from?; I’m …; I’m from …; age; country; date of birth; gender; male; female; Russia; the UK; the USA; France; Germany; China; Числа 0–100",
          "time": "5 мин.",
          "notes": "Таблица — справочник, не список для полного повторения хором. Отработать нужные пары.",
          "audioScript": "Thirteen. Thirty.\nFourteen. Forty.\nFifteen. Fifty.\nSixteen. Sixty.\nTwenty-one. Thirty-four. Fifty-eight. Seventy-six."
        },
        "exercise": {
          "version": 1,
          "id": "a1-1-w1-l4-e02-rule",
          "kind": "rule-page",
          "title": "Числа 0–100: короткое повторение",
          "feedback": {
            "showAnswers": false
          },
          "blocks": [
            {
              "type": "rule",
              "title": "Правило и примеры",
              "text": "Посмотри на таблицу. Повтори незнакомые или забытые числа.\n\n0 zero · 1 one · 2 two · 3 three · 4 four · 5 five\n6 six · 7 seven · 8 eight · 9 nine · 10 ten\n11 eleven · 12 twelve · 13 thirteen · 14 fourteen\n15 fifteen · 16 sixteen · 17 seventeen · 18 eighteen · 19 nineteen\n20 twenty · 30 thirty · 40 forty · 50 fifty\n60 sixty · 70 seventy · 80 eighty · 90 ninety · 100 one hundred\n\nСоставные числа:\n21 twenty-one\n34 thirty-four\n58 fifty-eight\n76 seventy-six\n\nСлушай и повторяй пары:\nthirteen — thirty\nfourteen — forty\nfifteen — fifty\nsixteen — sixty\n\nПрочитай без подсказки:\n23 · 47 · 62 · 89",
              "highlights": []
            }
          ]
        },
        "sourceId": "A1.1-W1-L4-E02"
      },
      {
        "menu": "3. Какое число?",
        "section": "tasks",
        "guide": {
          "aim": "Точно распознавать числительные.",
          "tl": "How old are you?; Where are you from?; I’m …; I’m from …; age; country; date of birth; gender; male; female; Russia; the UK; the USA; France; Germany; China; Числа 0–100",
          "time": "3 мин.",
          "notes": "",
          "audioScript": "1. Thirteen.\n2. Forty.\n3. Fifteen.\n4. Twenty-six.\n5. Thirty-eight.\n6. Seventy-two."
        },
        "exercise": {
          "version": 1,
          "id": "a1-1-w1-l4-e03",
          "kind": "stage",
          "title": "Какое число?",
          "feedback": {
            "showAnswers": false
          },
          "exercises": [
            {
              "id": "a1-1-w1-l4-e03-choice",
              "exercise": {
                "version": 1,
                "id": "a1-1-w1-l4-e03-choice",
                "kind": "choice",
                "title": "Какое число?",
                "feedback": {
                  "showAnswers": false
                },
                "instruction": "Послушай и выбери число.",
                "items": [
                  {
                    "id": "q1",
                    "prompt": "Разговор 1",
                    "options": [
                      {
                        "id": "o1",
                        "text": "30"
                      },
                      {
                        "id": "o2",
                        "text": "13"
                      }
                    ],
                    "correctId": "o2"
                  },
                  {
                    "id": "q2",
                    "prompt": "Разговор 2",
                    "options": [
                      {
                        "id": "o1",
                        "text": "40"
                      },
                      {
                        "id": "o2",
                        "text": "14"
                      }
                    ],
                    "correctId": "o1"
                  },
                  {
                    "id": "q3",
                    "prompt": "Разговор 3",
                    "options": [
                      {
                        "id": "o1",
                        "text": "15"
                      },
                      {
                        "id": "o2",
                        "text": "50"
                      }
                    ],
                    "correctId": "o1"
                  },
                  {
                    "id": "q4",
                    "prompt": "Разговор 4",
                    "options": [
                      {
                        "id": "o1",
                        "text": "62"
                      },
                      {
                        "id": "o2",
                        "text": "26"
                      }
                    ],
                    "correctId": "o2"
                  }
                ]
              }
            },
            {
              "id": "a1-1-w1-l4-e03-gaps",
              "exercise": {
                "version": 1,
                "id": "a1-1-w1-l4-e03-gaps",
                "kind": "gaps",
                "title": "Какое число?",
                "feedback": {
                  "showAnswers": false
                },
                "instruction": "Теперь запиши услышанное без вариантов.",
                "items": [
                  {
                    "id": "row1",
                    "segments": [
                      "5. ",
                      {
                        "id": "g1-1",
                        "answers": [
                          "38",
                          "thirty-eight",
                          "thirty eight"
                        ]
                      },
                      ""
                    ]
                  },
                  {
                    "id": "row2",
                    "segments": [
                      "6. ",
                      {
                        "id": "g2-1",
                        "answers": [
                          "72",
                          "seventy-two",
                          "seventy two"
                        ]
                      },
                      ""
                    ]
                  }
                ]
              }
            }
          ],
          "layout": "grouped"
        },
        "sourceId": "A1.1-W1-L4-E03"
      },
      {
        "menu": "4. Шесть стран",
        "section": "tasks",
        "guide": {
          "aim": "Понять названия стран.",
          "tl": "How old are you?; Where are you from?; I’m …; I’m from …; age; country; date of birth; gender; male; female; Russia; the UK; the USA; France; Germany; China; Числа 0–100",
          "time": "3 мин.",
          "notes": "Название страны ученика при необходимости заменяет одну страну в наборе; одновременно обновить справочник, задания и проверку. Не выполнять замену автоматически."
        },
        "exercise": {
          "version": 1,
          "id": "a1-1-w1-l4-e04",
          "kind": "stage",
          "title": "Шесть стран",
          "feedback": {
            "showAnswers": false
          },
          "exercises": [
            {
              "id": "a1-1-w1-l4-e04-reference",
              "exercise": {
                "version": 1,
                "id": "a1-1-w1-l4-e04-reference",
                "kind": "presentation",
                "title": "Шесть стран",
                "feedback": {
                  "showAnswers": false
                },
                "blocks": [
                  {
                    "type": "disclosure",
                    "title": "Опора: прочитай и закрой перед заданием",
                    "text": "Russia — Россия\nthe UK — Соединённое Королевство\nthe USA — США\nFrance — Франция\nGermany — Германия\nChina — Китай",
                    "open": false
                  }
                ]
              }
            },
            {
              "id": "a1-1-w1-l4-e04-matching",
              "exercise": {
                "version": 1,
                "id": "a1-1-w1-l4-e04-matching",
                "kind": "matching",
                "title": "Шесть стран",
                "feedback": {
                  "showAnswers": false
                },
                "instruction": "Соедини подходящие пары.",
                "items": [
                  {
                    "id": "m1",
                    "text": "Russia",
                    "correctId": "C"
                  },
                  {
                    "id": "m2",
                    "text": "the UK",
                    "correctId": "D"
                  },
                  {
                    "id": "m3",
                    "text": "the USA",
                    "correctId": "E"
                  },
                  {
                    "id": "m4",
                    "text": "France",
                    "correctId": "F"
                  },
                  {
                    "id": "m5",
                    "text": "Germany",
                    "correctId": "A"
                  },
                  {
                    "id": "m6",
                    "text": "China",
                    "correctId": "B"
                  }
                ],
                "options": [
                  {
                    "id": "D",
                    "text": "Соединённое Королевство"
                  },
                  {
                    "id": "A",
                    "text": "Германия"
                  },
                  {
                    "id": "F",
                    "text": "Франция"
                  },
                  {
                    "id": "C",
                    "text": "Россия"
                  },
                  {
                    "id": "B",
                    "text": "Китай"
                  },
                  {
                    "id": "E",
                    "text": "США"
                  }
                ]
              }
            }
          ],
          "layout": "grouped"
        },
        "sourceId": "A1.1-W1-L4-E04"
      },
      {
        "menu": "5. Произносим названия стран",
        "section": "tasks",
        "guide": {
          "aim": "Закрепить произношение названий стран.",
          "tl": "How old are you?; Where are you from?; I’m …; I’m from …; age; country; date of birth; gender; male; female; Russia; the UK; the USA; France; Germany; China; Числа 0–100",
          "time": "2 мин.",
          "notes": "UK и USA читаются названиями букв. The — часть изучаемого названия в речевой модели.",
          "audioScript": "Russia. (пауза)\nThe UK. (пауза)\nThe USA. (пауза)\nFrance. (пауза)\nGermany. (пауза)\nChina. (пауза)"
        },
        "exercise": {
          "version": 1,
          "id": "a1-1-w1-l4-e05",
          "kind": "stage",
          "title": "Произносим названия стран",
          "feedback": {
            "showAnswers": false
          },
          "exercises": [
            {
              "id": "a1-1-w1-l4-e05-repeat",
              "exercise": {
                "version": 1,
                "id": "a1-1-w1-l4-e05-repeat",
                "kind": "audio",
                "title": "Произносим названия стран",
                "feedback": {
                  "showAnswers": false
                },
                "layout": "listen-repeat",
                "audioPending": true,
                "instruction": "Слушай и повторяй.",
                "items": [
                  {
                    "id": "phrase1",
                    "text": "Russia"
                  },
                  {
                    "id": "phrase2",
                    "text": "the UK"
                  },
                  {
                    "id": "phrase3",
                    "text": "the USA"
                  },
                  {
                    "id": "phrase4",
                    "text": "France"
                  },
                  {
                    "id": "phrase5",
                    "text": "Germany"
                  },
                  {
                    "id": "phrase6",
                    "text": "China"
                  }
                ]
              }
            },
            {
              "id": "a1-1-w1-l4-e05-recall",
              "exercise": {
                "version": 1,
                "id": "a1-1-w1-l4-e05-recall",
                "kind": "presentation",
                "title": "Произносим названия стран",
                "feedback": {
                  "showAnswers": false
                },
                "blocks": [
                  {
                    "type": "text",
                    "text": "Затем закрой список. Назови страны по русским подсказкам:\nКитай · Россия · Франция · США · Германия · Соединённое Королевство"
                  }
                ]
              }
            }
          ],
          "layout": "grouped"
        },
        "sourceId": "A1.1-W1-L4-E05"
      },
      {
        "menu": "6. Возраст и страна",
        "section": "tasks",
        "guide": {
          "aim": "Связать вопросы с ответами о возрасте и стране.",
          "tl": "How old are you?; Where are you from?; I’m …; I’m from …; age; country; date of birth; gender; male; female; Russia; the UK; the USA; France; Germany; China; Числа 0–100",
          "time": "3 мин.",
          "notes": "",
          "audioScript": "How old are you?\nI’m twenty-eight.\nWhere are you from?\nI’m from France.\nA: How old are you?\nB: I’m twenty-eight.\nA: Where are you from?\nB: I’m from France."
        },
        "exercise": {
          "version": 1,
          "id": "a1-1-w1-l4-e06-rule",
          "kind": "rule-page",
          "title": "Возраст и страна",
          "feedback": {
            "showAnswers": false
          },
          "blocks": [
            {
              "type": "rule",
              "title": "Правило и примеры",
              "text": "Послушай и повтори.\n\nHow old are you? — Сколько тебе лет?\nI’m 28. — Мне 28 лет.\n\nWhere are you from? — Откуда ты?\nI’m from France. — Я из Франции.\n\nA: How old are you?\nB: I’m 28.\nA: Where are you from?\nB: I’m from France.\n\nТеперь ответь по карточкам:\nКарточка 1: 34 · Russia\nКарточка 2: 25 · the UK\n\nЗапоминаем готовые модели:\nI’m + возраст.\nI’m from + страна.\nI’m from the UK. / I’m from the USA.",
              "highlights": [
                "How old are you?",
                "Where are you from?",
                "I’m from",
                "I’m"
              ]
            }
          ]
        },
        "sourceId": "A1.1-W1-L4-E06"
      },
      {
        "menu": "7. Поля анкеты",
        "section": "tasks",
        "guide": {
          "aim": "Понять названия полей и типы данных.",
          "tl": "How old are you?; Where are you from?; I’m …; I’m from …; age; country; date of birth; gender; male; female; Russia; the UK; the USA; France; Germany; China; Числа 0–100",
          "time": "3 мин.",
          "notes": "Пример возраста соответствует учебной дате 23.09.2026. При переносе на другую дату использовать явно учебные данные, не вычислять возраст автоматически."
        },
        "exercise": {
          "version": 1,
          "id": "a1-1-w1-l4-e07",
          "kind": "stage",
          "title": "Поля анкеты",
          "feedback": {
            "showAnswers": false
          },
          "exercises": [
            {
              "id": "a1-1-w1-l4-e07-reference",
              "exercise": {
                "version": 1,
                "id": "a1-1-w1-l4-e07-reference",
                "kind": "presentation",
                "title": "Поля анкеты",
                "feedback": {
                  "showAnswers": false
                },
                "blocks": [
                  {
                    "type": "disclosure",
                    "title": "Опора: прочитай и закрой перед заданием",
                    "text": "age — возраст\ncountry — страна\ndate of birth — дата рождения\ngender — пол\nmale — мужской\nfemale — женский\nMale / female — варианты для поля gender в нашей учебной анкете.",
                    "open": false
                  }
                ]
              }
            },
            {
              "id": "a1-1-w1-l4-e07-matching",
              "exercise": {
                "version": 1,
                "id": "a1-1-w1-l4-e07-matching",
                "kind": "matching",
                "title": "Поля анкеты",
                "feedback": {
                  "showAnswers": false
                },
                "instruction": "Соедини подходящие пары.",
                "items": [
                  {
                    "id": "m1",
                    "text": "age",
                    "correctId": "C"
                  },
                  {
                    "id": "m2",
                    "text": "country",
                    "correctId": "D"
                  },
                  {
                    "id": "m3",
                    "text": "date of birth",
                    "correctId": "A"
                  },
                  {
                    "id": "m4",
                    "text": "gender",
                    "correctId": "E"
                  },
                  {
                    "id": "m5",
                    "text": "male",
                    "correctId": "F"
                  },
                  {
                    "id": "m6",
                    "text": "female",
                    "correctId": "B"
                  }
                ],
                "options": [
                  {
                    "id": "A",
                    "text": "дата рождения"
                  },
                  {
                    "id": "B",
                    "text": "женский"
                  },
                  {
                    "id": "C",
                    "text": "возраст"
                  },
                  {
                    "id": "D",
                    "text": "страна"
                  },
                  {
                    "id": "E",
                    "text": "пол"
                  },
                  {
                    "id": "F",
                    "text": "мужской"
                  }
                ]
              }
            },
            {
              "id": "a1-1-w1-l4-e07-after",
              "exercise": {
                "version": 1,
                "id": "a1-1-w1-l4-e07-after",
                "kind": "presentation",
                "title": "Поля анкеты",
                "feedback": {
                  "showAnswers": false
                },
                "blocks": [
                  {
                    "type": "text",
                    "text": "Посмотри, чем отличаются поля:\nAge: 28\nDate of birth: 14.06.1998\n\nДата рождения в этом задании записывается цифрами: день.месяц.год. Читать её по-английски пока не нужно."
                  }
                ]
              }
            }
          ],
          "layout": "grouped"
        },
        "sourceId": "A1.1-W1-L4-E07"
      },
      {
        "menu": "8. Данные посетителя",
        "section": "tasks",
        "guide": {
          "aim": "Заполнить поля по услышанной информации.",
          "tl": "How old are you?; Where are you from?; I’m …; I’m from …; age; country; date of birth; gender; male; female; Russia; the UK; the USA; France; Germany; China; Числа 0–100",
          "time": "4 мин.",
          "notes": "",
          "audioScript": "A: Hello! What’s your name?\nB: My first name is Anna.\nA: Can you spell it, please?\nB: A; N; N; A.\nA: How old are you?\nB: I’m twenty-seven.\nA: Where are you from?\nB: I’m from Germany.\nA: Thank you.\nB: You’re welcome."
        },
        "exercise": {
          "version": 1,
          "id": "a1-1-w1-l4-e08-gaps",
          "kind": "gaps",
          "title": "Данные посетителя",
          "feedback": {
            "showAnswers": false
          },
          "instruction": "Послушай разговор. Заполни три поля.",
          "items": [
            {
              "id": "row1",
              "segments": [
                "First name: ",
                {
                  "id": "g1-1",
                  "answers": [
                    "Anna"
                  ]
                },
                ""
              ]
            },
            {
              "id": "row2",
              "segments": [
                "Age: ",
                {
                  "id": "g2-1",
                  "answers": [
                    "27",
                    "twenty-seven",
                    "twenty seven"
                  ]
                },
                ""
              ]
            },
            {
              "id": "row3",
              "segments": [
                "Country: ",
                {
                  "id": "g3-1",
                  "answers": [
                    "Germany"
                  ]
                },
                ""
              ]
            }
          ]
        },
        "sourceId": "A1.1-W1-L4-E08"
      },
      {
        "menu": "9. Заполняем анкету",
        "section": "tasks",
        "guide": {
          "aim": "Сообщить личные данные и заполнить поля.",
          "tl": "How old are you?; Where are you from?; I’m …; I’m from …; age; country; date of birth; gender; male; female; Russia; the UK; the USA; France; Germany; China; Числа 0–100",
          "time": "5 мин.",
          "notes": "Дату рождения и gender заполняют письменно; не вводить новые вопросы для этих полей. При личных данных можно использовать вымышленную карточку.\nКритерии: Соотносит вопрос с нужными данными.; Сохраняет from перед страной.; Различает возраст и дату рождения.; Заполняет поля правильно."
        },
        "exercise": {
          "version": 1,
          "id": "a1-1-w1-l4-e09",
          "kind": "stage",
          "title": "Заполняем анкету",
          "feedback": {
            "showAnswers": false
          },
          "exercises": [
            {
              "id": "a1-1-w1-l4-e09-text",
              "exercise": {
                "version": 1,
                "id": "a1-1-w1-l4-e09-text",
                "kind": "presentation",
                "title": "Заполняем анкету",
                "feedback": {
                  "showAnswers": false
                },
                "blocks": [
                  {
                    "type": "text",
                    "text": "Заполни анкету о себе или используй учебную карточку.\n\nУчебная карточка:\nИмя: Alex\nФамилия: Green\nВозраст: 29\nСтрана: the UK\nДата рождения: 10.03.1997\nПол: мужской\n\nАнкета:\n\nТеперь поговори с преподавателем. Узнай имя, возраст и страну собеседника, затем ответь на его вопросы."
                  }
                ]
              }
            },
            {
              "id": "a1-1-w1-l4-e09-writing",
              "exercise": {
                "version": 1,
                "id": "a1-1-w1-l4-e09-writing",
                "kind": "writing",
                "title": "Заполняем анкету",
                "feedback": {
                  "showAnswers": false
                },
                "items": [
                  {
                    "id": "field1",
                    "prompt": "First name:",
                    "possibleAnswers": [
                      "Alex"
                    ]
                  },
                  {
                    "id": "field2",
                    "prompt": "Last name:",
                    "possibleAnswers": [
                      "Green"
                    ]
                  },
                  {
                    "id": "field3",
                    "prompt": "Age:",
                    "possibleAnswers": [
                      "29"
                    ]
                  },
                  {
                    "id": "field4",
                    "prompt": "Country:",
                    "possibleAnswers": [
                      "the UK"
                    ]
                  },
                  {
                    "id": "field5",
                    "prompt": "Date of birth:",
                    "possibleAnswers": [
                      "10 March 1997",
                      "10/03/1997"
                    ]
                  }
                ],
                "responseMode": "personal"
              }
            },
            {
              "id": "a1-1-w1-l4-e09-gender",
              "exercise": {
                "version": 1,
                "id": "a1-1-w1-l4-e09-gender",
                "kind": "choice",
                "title": "Заполняем анкету",
                "feedback": {
                  "showAnswers": false
                },
                "items": [
                  {
                    "id": "gender",
                    "prompt": "Gender",
                    "options": [
                      {
                        "id": "o1",
                        "text": "male"
                      },
                      {
                        "id": "o2",
                        "text": "female"
                      }
                    ]
                  }
                ],
                "responseMode": "personal"
              }
            },
            {
              "id": "a1-1-w1-l4-e09-support",
              "exercise": {
                "version": 1,
                "id": "a1-1-w1-l4-e09-support",
                "kind": "presentation",
                "title": "Заполняем анкету",
                "feedback": {
                  "showAnswers": false
                },
                "blocks": [
                  {
                    "type": "disclosure",
                    "title": "Опора при необходимости",
                    "text": "What’s your name?\nHow old are you?\nWhere are you from?",
                    "open": false
                  }
                ]
              }
            }
          ],
          "layout": "grouped"
        },
        "sourceId": "A1.1-W1-L4-E09"
      }
    ]
  },
  {
    "id": "a1-1-w1-l5",
    "title": "Давайте обменяемся контактами",
    "level": "A1.1",
    "whale": 1,
    "durationMinutes": 30,
    "goal": "Спросить, передать, записать и проверить телефон и email.",
    "stages": [
      {
        "menu": "1. Вспоминаем буквы и цифры",
        "section": "tasks",
        "guide": {
          "aim": "Восстановить распознавание последовательностей.",
          "tl": "What’s your phone number?; My number is …; Is that right?; Yes, that’s right.; What’s your email address?; My email address is …; at; dot; hyphen; underscore",
          "time": "2 мин.",
          "notes": "",
          "audioScript": "1. Six; zero; three.\n2. A; L; E.\n3. Four; seven; two; nine."
        },
        "exercise": {
          "version": 1,
          "id": "a1-1-w1-l5-e01-gaps",
          "kind": "gaps",
          "title": "Вспоминаем буквы и цифры",
          "feedback": {
            "showAnswers": false
          },
          "instruction": "Послушай и запиши.",
          "items": [
            {
              "id": "row1",
              "segments": [
                "1. Три цифры: ",
                {
                  "id": "g1-1",
                  "answers": [
                    "603"
                  ]
                },
                ""
              ]
            },
            {
              "id": "row2",
              "segments": [
                "2. Три буквы: ",
                {
                  "id": "g2-1",
                  "answers": [
                    "ALE"
                  ]
                },
                ""
              ]
            },
            {
              "id": "row3",
              "segments": [
                "3. Четыре цифры: ",
                {
                  "id": "g3-1",
                  "answers": [
                    "4729"
                  ]
                },
                ""
              ]
            }
          ]
        },
        "sourceId": "A1.1-W1-L5-E01"
      },
      {
        "menu": "2. Символы email",
        "section": "tasks",
        "guide": {
          "aim": "Связать названия с символами.",
          "tl": "What’s your phone number?; My number is …; Is that right?; Yes, that’s right.; What’s your email address?; My email address is …; at; dot; hyphen; underscore",
          "time": "3 мин.",
          "notes": ""
        },
        "exercise": {
          "version": 1,
          "id": "a1-1-w1-l5-e02",
          "kind": "stage",
          "title": "Символы email",
          "feedback": {
            "showAnswers": false
          },
          "exercises": [
            {
              "id": "a1-1-w1-l5-e02-reference",
              "exercise": {
                "version": 1,
                "id": "a1-1-w1-l5-e02-reference",
                "kind": "presentation",
                "title": "Символы email",
                "feedback": {
                  "showAnswers": false
                },
                "blocks": [
                  {
                    "type": "disclosure",
                    "title": "Опора: прочитай и закрой перед заданием",
                    "text": "@ — at — «собака» в email\n. — dot — точка\n- — hyphen — дефис\n_ — underscore — нижнее подчёркивание",
                    "open": false
                  }
                ]
              }
            },
            {
              "id": "a1-1-w1-l5-e02-matching",
              "exercise": {
                "version": 1,
                "id": "a1-1-w1-l5-e02-matching",
                "kind": "matching",
                "title": "Символы email",
                "feedback": {
                  "showAnswers": false
                },
                "instruction": "Соедини подходящие пары.",
                "items": [
                  {
                    "id": "m1",
                    "text": "at",
                    "correctId": "C"
                  },
                  {
                    "id": "m2",
                    "text": "dot",
                    "correctId": "D"
                  },
                  {
                    "id": "m3",
                    "text": "hyphen",
                    "correctId": "B"
                  },
                  {
                    "id": "m4",
                    "text": "underscore",
                    "correctId": "A"
                  }
                ],
                "options": [
                  {
                    "id": "A",
                    "text": "_"
                  },
                  {
                    "id": "B",
                    "text": "-"
                  },
                  {
                    "id": "C",
                    "text": "@"
                  },
                  {
                    "id": "D",
                    "text": "."
                  }
                ]
              }
            }
          ],
          "layout": "grouped"
        },
        "sourceId": "A1.1-W1-L5-E02"
      },
      {
        "menu": "3. Слушай символы",
        "section": "tasks",
        "guide": {
          "aim": "Произнести названия символов в последовательностях.",
          "tl": "What’s your phone number?; My number is …; Is that right?; Yes, that’s right.; What’s your email address?; My email address is …; at; dot; hyphen; underscore",
          "time": "2 мин.",
          "notes": "Это короткие последовательности символов для произношения, не действительные адреса email.",
          "audioScript": "At. Dot. Hyphen. Underscore.\nA; underscore; B.\nC; hyphen; D.\nE; dot; F.\nG; at; H."
        },
        "exercise": {
          "version": 1,
          "id": "a1-1-w1-l5-e03-repeat",
          "kind": "audio",
          "title": "Слушай символы",
          "feedback": {
            "showAnswers": false
          },
          "layout": "listen-repeat",
          "audioPending": true,
          "instruction": "Послушай и повтори.",
          "items": [
            {
              "id": "phrase1",
              "text": "at — @"
            },
            {
              "id": "phrase2",
              "text": "dot — ."
            },
            {
              "id": "phrase3",
              "text": "hyphen — -"
            },
            {
              "id": "phrase4",
              "text": "underscore — _"
            },
            {
              "id": "phrase5",
              "text": "a_b — A, underscore, B"
            },
            {
              "id": "phrase6",
              "text": "c-d — C, hyphen, D"
            },
            {
              "id": "phrase7",
              "text": "e.f — E, dot, F"
            },
            {
              "id": "phrase8",
              "text": "g@h — G, at, H"
            }
          ]
        },
        "sourceId": "A1.1-W1-L5-E03"
      },
      {
        "menu": "4. Спрашиваем контакты",
        "section": "tasks",
        "guide": {
          "aim": "Освоить модели запроса и проверки контактов.",
          "tl": "What’s your phone number?; My number is …; Is that right?; Yes, that’s right.; What’s your email address?; My email address is …; at; dot; hyphen; underscore",
          "time": "3 мин.",
          "notes": "Все номера в пакете — учебные данные. Произносить zero последовательно; oh и double не вводить.",
          "audioScript": "What’s your phone number?\nMy number is …\nWhat’s your email address?\nMy email address is …\nIs that right?\nYes, that’s right.\nA: What’s your phone number?\nB: My number is three; zero; five; seven; two; four; six; one; eight; zero.\nA: Three; zero; five; seven; two; four; six; one; eight; zero. Is that right?\nB: Yes, that’s right."
        },
        "exercise": {
          "version": 1,
          "id": "a1-1-w1-l5-e04-rule",
          "kind": "rule-page",
          "title": "Спрашиваем контакты",
          "feedback": {
            "showAnswers": false
          },
          "blocks": [
            {
              "type": "rule",
              "title": "Правило и примеры",
              "text": "Прочитай значения и повтори фразы.\n\nWhat’s your phone number? — Какой у тебя номер телефона?\nMy number is … — Мой номер …\nWhat’s your email address? — Какой у тебя email?\nMy email address is … — Мой email …\nIs that right? — Всё верно?\nYes, that’s right. — Да, всё верно.\n\nТелефон читаем по отдельным цифрам: 305 — three, zero, five.\nEmail диктуем буквами, цифрами и названиями символов.\n\nA: What’s your phone number?\nB: My number is 305 724 6180.\nA: 305 724 6180. Is that right?\nB: Yes, that’s right.",
              "highlights": [
                "What’s your phone number?",
                "What’s your email address?",
                "My number is",
                "My email address is",
                "Is that right?",
                "Yes, that’s right."
              ]
            }
          ]
        },
        "sourceId": "A1.1-W1-L5-E04"
      },
      {
        "menu": "5. Какой контакт прозвучал?",
        "section": "tasks",
        "guide": {
          "aim": "Различать похожие контактные данные.",
          "tl": "What’s your phone number?; My number is …; Is that right?; Yes, that’s right.; What’s your email address?; My email address is …; at; dot; hyphen; underscore",
          "time": "4 мин.",
          "notes": "Адреса диктуются целиком. example и com не нужно переводить: это последовательности букв.",
          "audioScript": "1. Two; zero; four; six; eight; one; three; five; zero; seven.\n2. Seven; three; zero; one; two; five; four; six; zero; eight.\n3. A; N; N; A; underscore; B; at; E; X; A; M; P; L; E; dot; C; O; M.\n4. T; O; M; dot; W; at; E; X; A; M; P; L; E; dot; C; O; M."
        },
        "exercise": {
          "version": 1,
          "id": "a1-1-w1-l5-e05-choice",
          "kind": "choice",
          "title": "Какой контакт прозвучал?",
          "feedback": {
            "showAnswers": false
          },
          "instruction": "Послушай и выбери точную запись.",
          "items": [
            {
              "id": "q1",
              "prompt": "Разговор 1",
              "options": [
                {
                  "id": "o1",
                  "text": "204 618 3507"
                },
                {
                  "id": "o2",
                  "text": "204 681 3507"
                }
              ],
              "correctId": "o2"
            },
            {
              "id": "q2",
              "prompt": "Разговор 2",
              "options": [
                {
                  "id": "o1",
                  "text": "730 125 4608"
                },
                {
                  "id": "o2",
                  "text": "730 152 4608"
                }
              ],
              "correctId": "o1"
            },
            {
              "id": "q3",
              "prompt": "Разговор 3",
              "options": [
                {
                  "id": "o1",
                  "text": "anna-b@example.com"
                },
                {
                  "id": "o2",
                  "text": "anna_b@example.com"
                }
              ],
              "correctId": "o2"
            },
            {
              "id": "q4",
              "prompt": "Разговор 4",
              "options": [
                {
                  "id": "o1",
                  "text": "tom_w@example.com"
                },
                {
                  "id": "o2",
                  "text": "tom.w@example.com"
                }
              ],
              "correctId": "o2"
            }
          ]
        },
        "sourceId": "A1.1-W1-L5-E05"
      },
      {
        "menu": "6. Запиши контакты",
        "section": "tasks",
        "guide": {
          "aim": "Самостоятельно восстановить контактные данные.",
          "tl": "What’s your phone number?; My number is …; Is that right?; Yes, that’s right.; What’s your email address?; My email address is …; at; dot; hyphen; underscore",
          "time": "5 мин.",
          "notes": "Телефон сравнивать без пробелов и скобок. Каждый аудиопункт доступен отдельно для повтора.",
          "audioScript": "1. Six; zero; eight; two; seven; four; nine; zero; one; five.\n2. A; L; E; X; hyphen; G; at; E; X; A; M; P; L; E; dot; C; O; M.\n3. Four; one; zero; eight; six; three; two; zero; seven; five.\n4. L; E; O; at; E; X; A; M; P; L; E; dot; C; O; M."
        },
        "exercise": {
          "version": 1,
          "id": "a1-1-w1-l5-e06-gaps",
          "kind": "gaps",
          "title": "Запиши контакты",
          "feedback": {
            "showAnswers": false
          },
          "instruction": "Послушай. В заданиях 1–2 каждый пропуск — один знак или цифра.",
          "items": [
            {
              "id": "row1",
              "segments": [
                "1. 608 2",
                {
                  "id": "g1-1",
                  "answers": [
                    "7"
                  ]
                },
                "4 901",
                {
                  "id": "g1-2",
                  "answers": [
                    "5"
                  ]
                },
                ""
              ]
            },
            {
              "id": "row2",
              "segments": [
                "2. alex",
                {
                  "id": "g2-1",
                  "answers": [
                    "-"
                  ]
                },
                "g",
                {
                  "id": "g2-2",
                  "answers": [
                    "@"
                  ]
                },
                "example.com"
              ]
            },
            {
              "id": "row3",
              "segments": [
                "3. Запиши номер полностью: ",
                {
                  "id": "g3-1",
                  "answers": [
                    "4108632075"
                  ],
                  "normalization": "phone"
                },
                ""
              ]
            },
            {
              "id": "row4",
              "segments": [
                "4. Запиши email полностью: ",
                {
                  "id": "g4-1",
                  "answers": [
                    "leo@example.com"
                  ]
                },
                ""
              ]
            }
          ]
        },
        "sourceId": "A1.1-W1-L5-E06"
      },
      {
        "menu": "7. Всё верно?",
        "section": "tasks",
        "guide": {
          "aim": "Подтвердить или исправить повторённый контакт.",
          "tl": "What’s your phone number?; My number is …; Is that right?; Yes, that’s right.; What’s your email address?; My email address is …; at; dot; hyphen; underscore",
          "time": "4 мин.",
          "notes": "Прочитать последовательно: 1) 582 104 7360 — Is that right? 2) 582 104 7630 — Is that right? 3) emma-f@example.com — Is that right? 4) emma_f@example.com — Is that right? Телефоны читать цифрами, email — буквами. Не показывать этот сценарий ученику.\nКритерии: Замечает перестановку цифр.; Различает hyphen/underscore.; Подтверждает верные данные.; Повторяет правильные данные при ошибке."
        },
        "exercise": {
          "version": 1,
          "id": "a1-1-w1-l5-e07-text",
          "kind": "presentation",
          "title": "Всё верно?",
          "feedback": {
            "showAnswers": false
          },
          "blocks": [
            {
              "type": "text",
              "text": "Твои данные:\nMy number: 582 104 7630\nMy email address: emma_f@example.com\n\nПреподаватель повторит их дважды. Слушай внимательно.\nЕсли всё верно: Yes, that’s right.\nЕсли есть ошибка: повтори правильные данные через My number is … / My email address is … .\n\nЗатем поменяйтесь ролями."
            }
          ]
        },
        "sourceId": "A1.1-W1-L5-E07"
      },
      {
        "menu": "8. Обмен контактами",
        "section": "tasks",
        "guide": {
          "aim": "Пройти весь цикл запроса, записи и проверки.",
          "tl": "What’s your phone number?; My number is …; Is that right?; Yes, that’s right.; What’s your email address?; My email address is …; at; dot; hyphen; underscore",
          "time": "7 мин.",
          "notes": "Карточка B — преподавателю или второму участнику; выдавать отдельно. Не добавлять лексику для просьбы повторить: уже изученное Can you spell it, please? подходит для email.\nСкрытая карточка B: First name Tom; My number 705 361 2480; My email address tom_w@example.com.\nКритерии: Сам задаёт оба вопроса.; Передаёт контакты точно.; Записывает и проверяет услышанное."
        },
        "exercise": {
          "version": 1,
          "id": "a1-1-w1-l5-e08",
          "kind": "stage",
          "title": "Обмен контактами",
          "feedback": {
            "showAnswers": false
          },
          "exercises": [
            {
              "id": "a1-1-w1-l5-e08-text",
              "exercise": {
                "version": 1,
                "id": "a1-1-w1-l5-e08-text",
                "kind": "presentation",
                "title": "Обмен контактами",
                "feedback": {
                  "showAnswers": false
                },
                "blocks": [
                  {
                    "type": "text",
                    "text": "Используйте разные карточки. Не показывайте данные друг другу.\n\nКарточка A\nFirst name: Anna\nMy number: 416 208 5730\nMy email address: anna-b@example.com\n\nПоздоровайтесь.\nСпросите имя.\nУзнайте телефон и email.\nЗапишите услышанное.\nПрочитайте запись собеседнику и спросите, всё ли верно.\nПодтвердите или повторите правильные данные.\nПоблагодарите и попрощайтесь.\n\nМоя запись:"
                  }
                ]
              }
            },
            {
              "id": "a1-1-w1-l5-e08-writing",
              "exercise": {
                "version": 1,
                "id": "a1-1-w1-l5-e08-writing",
                "kind": "writing",
                "title": "Обмен контактами",
                "feedback": {
                  "showAnswers": false
                },
                "items": [
                  {
                    "id": "field1",
                    "prompt": "First name:",
                    "possibleAnswers": [
                      "Anna"
                    ]
                  },
                  {
                    "id": "field2",
                    "prompt": "Phone number:",
                    "possibleAnswers": [
                      "416 208 5730"
                    ]
                  },
                  {
                    "id": "field3",
                    "prompt": "Email address:",
                    "possibleAnswers": [
                      "anna-b@example.com"
                    ]
                  }
                ],
                "responseMode": "personal"
              }
            }
          ],
          "layout": "grouped"
        },
        "sourceId": "A1.1-W1-L5-E08"
      }
    ]
  },
  {
    "id": "a1-1-w1-l6",
    "title": "Какая замечательная сегодня погода!",
    "level": "A1.1",
    "whale": 1,
    "durationMinutes": 30,
    "goal": "Понять вопросы о погоде, описать условия и температуру, дать общую оценку.",
    "stages": [
      {
        "menu": "1. Начинаем small talk",
        "section": "tasks",
        "guide": {
          "aim": "Повторить знакомое начало разговора.",
          "tl": "What’s the weather like?; How is the weather today?; It’s …; The weather is fine/good/bad.; sunny; cloudy; windy; rainy; warm; cold; hot",
          "time": "2 мин.",
          "notes": "Использовать How is your day? / Good, thank you. Не требовать описания погоды до введения слов."
        },
        "exercise": {
          "version": 1,
          "id": "a1-1-w1-l6-e01-text",
          "kind": "presentation",
          "title": "Начинаем small talk",
          "feedback": {
            "showAnswers": false
          },
          "blocks": [
            {
              "type": "text",
              "text": "Поздоровайся с преподавателем. Спроси, как проходит его день. Ответь на встречный вопрос."
            }
          ]
        },
        "sourceId": "A1.1-W1-L6-E01"
      },
      {
        "menu": "2. Слова о погоде",
        "section": "tasks",
        "guide": {
          "aim": "Понять семь погодных слов.",
          "tl": "What’s the weather like?; How is the weather today?; It’s …; The weather is fine/good/bad.; sunny; cloudy; windy; rainy; warm; cold; hot",
          "time": "4 мин.",
          "notes": "Сначала познакомьте ученика со словами на иллюстрациях, затем проведите сопоставление. Отдельные наборы погодных условий и температуры исключают конкурирующие ответы sunny/hot. Изображения будут добавлены после генерации."
        },
        "exercise": {
          "version": 1,
          "id": "a1-1-w1-l6-e02",
          "kind": "stage",
          "title": "Слова о погоде",
          "feedback": {
            "showAnswers": false
          },
          "exercises": [
            {
              "id": "a1-1-w1-l6-e02-conditions",
              "exercise": {
                "version": 1,
                "id": "a1-1-w1-l6-e02-conditions",
                "kind": "matching",
                "title": "Слова о погоде",
                "feedback": {
                  "showAnswers": false
                },
                "layout": "picture-word",
                "instruction": "Соедини картинки со словами.",
                "items": [
                  {
                    "id": "p1",
                    "text": "Карточка 1",
                    "correctId": "sunny",
                    "imagePending": true,
                    "assetId": "weather-sunny",
                    "alt": "Учебная иллюстрация"
                  },
                  {
                    "id": "p2",
                    "text": "Карточка 2",
                    "correctId": "cloudy",
                    "imagePending": true,
                    "assetId": "weather-cloudy",
                    "alt": "Учебная иллюстрация"
                  },
                  {
                    "id": "p3",
                    "text": "Карточка 3",
                    "correctId": "windy",
                    "imagePending": true,
                    "assetId": "weather-windy",
                    "alt": "Учебная иллюстрация"
                  },
                  {
                    "id": "p4",
                    "text": "Карточка 4",
                    "correctId": "rainy",
                    "imagePending": true,
                    "assetId": "weather-rainy",
                    "alt": "Учебная иллюстрация"
                  }
                ],
                "options": [
                  {
                    "id": "windy",
                    "text": "windy"
                  },
                  {
                    "id": "sunny",
                    "text": "sunny"
                  },
                  {
                    "id": "rainy",
                    "text": "rainy"
                  },
                  {
                    "id": "cloudy",
                    "text": "cloudy"
                  }
                ]
              }
            },
            {
              "id": "a1-1-w1-l6-e02-temperature",
              "exercise": {
                "version": 1,
                "id": "a1-1-w1-l6-e02-temperature",
                "kind": "matching",
                "title": "Слова о погоде",
                "feedback": {
                  "showAnswers": false
                },
                "layout": "picture-word",
                "instruction": "Соедини картинки со словами о температуре.",
                "items": [
                  {
                    "id": "p1",
                    "text": "Карточка 1",
                    "correctId": "cold",
                    "imagePending": true,
                    "assetId": "weather-cold",
                    "alt": "Учебная иллюстрация"
                  },
                  {
                    "id": "p2",
                    "text": "Карточка 2",
                    "correctId": "warm",
                    "imagePending": true,
                    "assetId": "weather-warm",
                    "alt": "Учебная иллюстрация"
                  },
                  {
                    "id": "p3",
                    "text": "Карточка 3",
                    "correctId": "hot",
                    "imagePending": true,
                    "assetId": "weather-hot",
                    "alt": "Учебная иллюстрация"
                  }
                ],
                "options": [
                  {
                    "id": "hot",
                    "text": "hot"
                  },
                  {
                    "id": "cold",
                    "text": "cold"
                  },
                  {
                    "id": "warm",
                    "text": "warm"
                  }
                ]
              }
            }
          ],
          "layout": "grouped"
        },
        "sourceId": "A1.1-W1-L6-E02"
      },
      {
        "menu": "3. Произносим погодные слова",
        "section": "tasks",
        "guide": {
          "aim": "Связать написание слов со звучанием.",
          "tl": "What’s the weather like?; How is the weather today?; It’s …; The weather is fine/good/bad.; sunny; cloudy; windy; rainy; warm; cold; hot",
          "time": "3 мин.",
          "notes": "",
          "audioScript": "Sunny. (пауза)\nCloudy. (пауза)\nWindy. (пауза)\nRainy. (пауза)\nWarm. (пауза)\nCold. (пауза)\nHot. (пауза)"
        },
        "exercise": {
          "version": 1,
          "id": "a1-1-w1-l6-e03",
          "kind": "stage",
          "title": "Произносим погодные слова",
          "feedback": {
            "showAnswers": false
          },
          "exercises": [
            {
              "id": "a1-1-w1-l6-e03-repeat",
              "exercise": {
                "version": 1,
                "id": "a1-1-w1-l6-e03-repeat",
                "kind": "audio",
                "title": "Произносим погодные слова",
                "feedback": {
                  "showAnswers": false
                },
                "layout": "listen-repeat",
                "audioPending": true,
                "instruction": "Слушай и повторяй.",
                "items": [
                  {
                    "id": "phrase1",
                    "text": "sunny"
                  },
                  {
                    "id": "phrase2",
                    "text": "cloudy"
                  },
                  {
                    "id": "phrase3",
                    "text": "windy"
                  },
                  {
                    "id": "phrase4",
                    "text": "rainy"
                  },
                  {
                    "id": "phrase5",
                    "text": "warm"
                  },
                  {
                    "id": "phrase6",
                    "text": "cold"
                  },
                  {
                    "id": "phrase7",
                    "text": "hot"
                  }
                ]
              }
            },
            {
              "id": "a1-1-w1-l6-e03-recall",
              "exercise": {
                "version": 1,
                "id": "a1-1-w1-l6-e03-recall",
                "kind": "presentation",
                "title": "Произносим погодные слова",
                "feedback": {
                  "showAnswers": false
                },
                "blocks": [
                  {
                    "type": "text",
                    "text": "Закрой английский список и назови:\nсолнечно · жарко · дождливо · холодно · облачно · тепло · ветрено"
                  }
                ]
              }
            }
          ],
          "layout": "grouped"
        },
        "sourceId": "A1.1-W1-L6-E03"
      },
      {
        "menu": "4. Как спросить о погоде?",
        "section": "tasks",
        "guide": {
          "aim": "Понять вопросы и две модели ответа.",
          "tl": "What’s the weather like?; How is the weather today?; It’s …; The weather is fine/good/bad.; sunny; cloudy; windy; rainy; warm; cold; hot",
          "time": "4 мин.",
          "notes": "Не вводить and как обязательный союз: два признака можно выразить двумя короткими предложениями."
        },
        "exercise": {
          "version": 1,
          "id": "a1-1-w1-l6-e04",
          "kind": "rule-page",
          "title": "Как спросить о погоде?",
          "feedback": {
            "showAnswers": false
          },
          "instruction": "Обрати внимание на выделенные части примеров. Выполни задание, нажми OK и открой правило стрелкой.",
          "blocks": [
            {
              "type": "text",
              "text": "A: What’s the weather like?\nB: It’s sunny.\n\nA: How is the weather today?\nB: It’s cold.\n\nIt’s rainy. = It is rainy.",
              "highlights": [
                "It’s",
                "It is",
                "sunny",
                "cold"
              ]
            },
            {
              "type": "exercise",
              "id": "notice",
              "exercise": {
                "version": 1,
                "id": "a1-1-w1-l6-e04-choice",
                "kind": "choice",
                "title": "Как спросить о погоде?",
                "feedback": {
                  "showAnswers": false
                },
                "instruction": "Посмотри на примеры. Выбери, как закончить фразу.",
                "items": [
                  {
                    "id": "q1",
                    "prompt": "Перед sunny в коротком ответе используем…",
                    "options": [
                      {
                        "id": "o1",
                        "text": "I’m"
                      },
                      {
                        "id": "o2",
                        "text": "It’s"
                      }
                    ],
                    "correctId": "o2"
                  },
                  {
                    "id": "q2",
                    "prompt": "Полная форма It’s в этих примерах — …",
                    "options": [
                      {
                        "id": "o1",
                        "text": "It is"
                      },
                      {
                        "id": "o2",
                        "text": "It are"
                      }
                    ],
                    "correctId": "o1"
                  },
                  {
                    "id": "q3",
                    "prompt": "Чтобы спросить именно о погоде, выбираем…",
                    "options": [
                      {
                        "id": "o1",
                        "text": "How is your day?"
                      },
                      {
                        "id": "o2",
                        "text": "How is the weather today?"
                      }
                    ],
                    "correctId": "o2"
                  }
                ]
              }
            },
            {
              "type": "rule",
              "title": "Правило",
              "text": "What’s the weather like? — Какая погода?\nHow is the weather today? — Какая сегодня погода?\nIt’s + описание: It’s sunny. / It’s cold.\nIt’s = It is.\nThe weather is fine. / The weather is good. — Погода хорошая.\nThe weather is bad. — Погода плохая.\nМожно сказать о двух признаках отдельно: It’s sunny. It’s cold.",
              "highlights": [
                "What’s the weather like?",
                "How is the weather today?",
                "It’s",
                "It is",
                "The weather is fine.",
                "The weather is good.",
                "The weather is bad."
              ]
            }
          ]
        },
        "sourceId": "A1.1-W1-L6-E04"
      },
      {
        "menu": "5. Вопросы и ответы",
        "section": "tasks",
        "guide": {
          "aim": "Произнести погодные вопросы и ответы целиком.",
          "tl": "What’s the weather like?; How is the weather today?; It’s …; The weather is fine/good/bad.; sunny; cloudy; windy; rainy; warm; cold; hot",
          "time": "4 мин.",
          "notes": "",
          "audioScript": "A: What’s the weather like?\nB: It’s sunny. It’s warm.\n(пауза)\nA: How is the weather today?\nB: It’s cloudy. It’s cold.\n(пауза)\nA: What’s the weather like?\nB: It’s rainy. It’s windy.\n(пауза)\nA: How is the weather today?\nB: It’s hot.\n(пауза)\nThe weather is fine.\nThe weather is good.\nThe weather is bad."
        },
        "exercise": {
          "version": 1,
          "id": "a1-1-w1-l6-e05-repeat",
          "kind": "audio",
          "title": "Вопросы и ответы",
          "feedback": {
            "showAnswers": false
          },
          "layout": "listen-repeat",
          "audioPending": true,
          "instruction": "Слушай и повторяй. Затем прочитай роль A, а преподаватель — роль B.",
          "items": [
            {
              "id": "phrase1",
              "text": "A: What’s the weather like?"
            },
            {
              "id": "phrase2",
              "text": "B: It’s sunny. It’s warm."
            },
            {
              "id": "phrase3",
              "text": "A: How is the weather today?"
            },
            {
              "id": "phrase4",
              "text": "B: It’s cloudy. It’s cold."
            },
            {
              "id": "phrase5",
              "text": "A: What’s the weather like?"
            },
            {
              "id": "phrase6",
              "text": "B: It’s rainy. It’s windy."
            },
            {
              "id": "phrase7",
              "text": "A: How is the weather today?"
            },
            {
              "id": "phrase8",
              "text": "B: It’s hot."
            },
            {
              "id": "phrase9",
              "text": "The weather is fine."
            },
            {
              "id": "phrase10",
              "text": "The weather is good."
            },
            {
              "id": "phrase11",
              "text": "The weather is bad."
            }
          ]
        },
        "sourceId": "A1.1-W1-L6-E05"
      },
      {
        "menu": "6. Собери описание",
        "section": "tasks",
        "guide": {
          "aim": "Закрепить порядок слов в двух моделях.",
          "tl": "What’s the weather like?; How is the weather today?; It’s …; The weather is fine/good/bad.; sunny; cloudy; windy; rainy; warm; cold; hot",
          "time": "3 мин.",
          "notes": ""
        },
        "exercise": {
          "version": 1,
          "id": "a1-1-w1-l6-e06",
          "kind": "stage",
          "title": "Собери описание",
          "feedback": {
            "showAnswers": false
          },
          "exercises": [
            {
              "id": "a1-1-w1-l6-e06-order1",
              "exercise": {
                "version": 1,
                "id": "a1-1-w1-l6-e06-order1",
                "kind": "order",
                "title": "Собери описание · 1",
                "feedback": {
                  "showAnswers": false
                },
                "tokens": [
                  {
                    "id": "t1",
                    "text": "cold"
                  },
                  {
                    "id": "t2",
                    "text": "it’s"
                  }
                ],
                "correctOrder": [
                  "t2",
                  "t1"
                ],
                "instruction": "Собери реплику из частей. Заглавная буква начала предложения не служит подсказкой."
              }
            },
            {
              "id": "a1-1-w1-l6-e06-order2",
              "exercise": {
                "version": 1,
                "id": "a1-1-w1-l6-e06-order2",
                "kind": "order",
                "title": "Собери описание · 2",
                "feedback": {
                  "showAnswers": false
                },
                "tokens": [
                  {
                    "id": "t1",
                    "text": "is"
                  },
                  {
                    "id": "t2",
                    "text": "good"
                  },
                  {
                    "id": "t3",
                    "text": "the weather"
                  }
                ],
                "correctOrder": [
                  "t3",
                  "t1",
                  "t2"
                ],
                "instruction": "Собери реплику из частей. Заглавная буква начала предложения не служит подсказкой."
              }
            },
            {
              "id": "a1-1-w1-l6-e06-order3",
              "exercise": {
                "version": 1,
                "id": "a1-1-w1-l6-e06-order3",
                "kind": "order",
                "title": "Собери описание · 3",
                "feedback": {
                  "showAnswers": false
                },
                "tokens": [
                  {
                    "id": "t1",
                    "text": "windy"
                  },
                  {
                    "id": "t2",
                    "text": "it’s"
                  }
                ],
                "correctOrder": [
                  "t2",
                  "t1"
                ],
                "instruction": "Собери реплику из частей. Заглавная буква начала предложения не служит подсказкой."
              }
            },
            {
              "id": "a1-1-w1-l6-e06-order4",
              "exercise": {
                "version": 1,
                "id": "a1-1-w1-l6-e06-order4",
                "kind": "order",
                "title": "Собери описание · 4",
                "feedback": {
                  "showAnswers": false
                },
                "tokens": [
                  {
                    "id": "t1",
                    "text": "fine"
                  },
                  {
                    "id": "t2",
                    "text": "the weather"
                  },
                  {
                    "id": "t3",
                    "text": "is"
                  }
                ],
                "correctOrder": [
                  "t2",
                  "t3",
                  "t1"
                ],
                "instruction": "Собери реплику из частей. Заглавная буква начала предложения не служит подсказкой."
              }
            },
            {
              "id": "a1-1-w1-l6-e06-order5",
              "exercise": {
                "version": 1,
                "id": "a1-1-w1-l6-e06-order5",
                "kind": "order",
                "title": "Собери описание · 5",
                "feedback": {
                  "showAnswers": false
                },
                "tokens": [
                  {
                    "id": "t1",
                    "text": "bad"
                  },
                  {
                    "id": "t2",
                    "text": "is"
                  },
                  {
                    "id": "t3",
                    "text": "the weather"
                  }
                ],
                "correctOrder": [
                  "t3",
                  "t2",
                  "t1"
                ],
                "instruction": "Собери реплику из частей. Заглавная буква начала предложения не служит подсказкой."
              }
            },
            {
              "id": "a1-1-w1-l6-e06-oral",
              "exercise": {
                "version": 1,
                "id": "a1-1-w1-l6-e06-oral",
                "kind": "presentation",
                "title": "Собери описание",
                "feedback": {
                  "showAnswers": false
                },
                "blocks": [
                  {
                    "type": "text",
                    "text": "Теперь самостоятельно скажи: «Солнечно»."
                  }
                ]
              }
            }
          ],
          "layout": "grouped"
        },
        "sourceId": "A1.1-W1-L6-E06"
      },
      {
        "menu": "7. Какая погода в разговоре?",
        "section": "tasks",
        "guide": {
          "aim": "Понять конкретные характеристики на слух.",
          "tl": "What’s the weather like?; How is the weather today?; It’s …; The weather is fine/good/bad.; sunny; cloudy; windy; rainy; warm; cold; hot",
          "time": "3 мин.",
          "notes": "",
          "audioScript": "1.\nA: What’s the weather like?\nB: It’s sunny. It’s cold.\n\n2.\nA: How is the weather today?\nB: It’s rainy. It’s windy.\n\n3.\nA: How is the weather today?\nB: The weather is good."
        },
        "exercise": {
          "version": 1,
          "id": "a1-1-w1-l6-e07-choice",
          "kind": "choice",
          "title": "Какая погода в разговоре?",
          "feedback": {
            "showAnswers": false
          },
          "instruction": "Послушай три разговора и выбери точное описание.",
          "items": [
            {
              "id": "q1",
              "prompt": "Разговор 1",
              "options": [
                {
                  "id": "o1",
                  "text": "Солнечно и тепло."
                },
                {
                  "id": "o2",
                  "text": "Солнечно и холодно."
                }
              ],
              "correctId": "o2"
            },
            {
              "id": "q2",
              "prompt": "Разговор 2",
              "options": [
                {
                  "id": "o1",
                  "text": "Дождливо и ветрено."
                },
                {
                  "id": "o2",
                  "text": "Облачно и жарко."
                }
              ],
              "correctId": "o1"
            },
            {
              "id": "q3",
              "prompt": "Разговор 3",
              "options": [
                {
                  "id": "o1",
                  "text": "Погода плохая."
                },
                {
                  "id": "o2",
                  "text": "Погода хорошая."
                }
              ],
              "correctId": "o2"
            }
          ]
        },
        "sourceId": "A1.1-W1-L6-E07"
      },
      {
        "menu": "8. Поговорим о погоде",
        "section": "tasks",
        "guide": {
          "aim": "Самостоятельно спросить и ответить о погоде.",
          "tl": "What’s the weather like?; How is the weather today?; It’s …; The weather is fine/good/bad.; sunny; cloudy; windy; rainy; warm; cold; hot",
          "time": "7 мин.",
          "notes": "При возможности обсудить реальную погоду только изученными словами. Слова snowy/foggy и конструкции с rain как глаголом не добавлять.\nКритерии: Понимает оба вопроса.; Строит It’s + adjective.; Различает cold/warm/hot.; Даёт общую оценку через The weather is …"
        },
        "exercise": {
          "version": 1,
          "id": "a1-1-w1-l6-e08",
          "kind": "presentation",
          "title": "Поговорим о погоде",
          "feedback": {
            "showAnswers": false
          },
          "blocks": [
            {
              "type": "text",
              "text": "Разыграйте разговор по каждой картинке. Спроси о погоде и ответь. Меняйтесь ролями."
            },
            {
              "type": "image",
              "imagePending": true,
              "assetId": "weather-speaking-1",
              "alt": "Учебная иллюстрация"
            },
            {
              "type": "image",
              "imagePending": true,
              "assetId": "weather-speaking-2",
              "alt": "Учебная иллюстрация"
            },
            {
              "type": "image",
              "imagePending": true,
              "assetId": "weather-speaking-3",
              "alt": "Учебная иллюстрация"
            },
            {
              "type": "image",
              "imagePending": true,
              "assetId": "weather-speaking-4",
              "alt": "Учебная иллюстрация"
            },
            {
              "type": "text",
              "text": "Выбери одну картинку и дай свою оценку погоды: хорошая или плохая. Возможны разные ответы.\nВ последнем разговоре поздоровайтесь, спросите, как дела, обсудите погоду и попрощайтесь."
            },
            {
              "type": "disclosure",
              "title": "Опора при необходимости",
              "text": "What’s the weather like?\nHow is the weather today?\nIt’s …\nThe weather is …",
              "open": false
            }
          ]
        },
        "sourceId": "A1.1-W1-L6-E08"
      }
    ]
  },
  {
    "id": "a1-1-w1-l7",
    "title": "Знакомимся и обмениваемся информацией",
    "level": "A1.1",
    "whale": 1,
    "durationMinutes": 30,
    "goal": "Объединить знакомый язык в коротких бытовых ситуациях и сообщении.",
    "stages": [
      {
        "menu": "1. Разговор без подготовки",
        "section": "tasks",
        "guide": {
          "aim": "Вспомнить знакомые разговорные модели.",
          "tl": "Повторение материала уроков 1–6; нового языка нет.",
          "time": "2 мин.",
          "notes": "Не показывать список английских фраз до первой попытки. При затруднении дать точечную подсказку."
        },
        "exercise": {
          "version": 1,
          "id": "a1-1-w1-l7-e01-text",
          "kind": "presentation",
          "title": "Разговор без подготовки",
          "feedback": {
            "showAnswers": false
          },
          "blocks": [
            {
              "type": "text",
              "text": "Ты встречаешь знакомого вечером.\nПоздоровайся.\nСкажи, что рад встрече.\nСпроси, как проходит день.\nОтветь на встречный вопрос."
            }
          ]
        },
        "sourceId": "A1.1-W1-L7-E01"
      },
      {
        "menu": "2. Понимаем собеседника",
        "section": "tasks",
        "guide": {
          "aim": "Извлечь информацию из знакомых моделей.",
          "tl": "Повторение материала уроков 1–6; нового языка нет.",
          "time": "4 мин.",
          "notes": "",
          "audioScript": "1.\nA: What’s your name?\nB: My first name is Emma.\nA: Can you spell it, please?\nB: E; M; M; A.\n\n2.\nA: How old are you?\nB: I’m thirty-one.\n\n3.\nA: Where are you from?\nB: I’m from China.\n\n4.\nA: What’s the weather like?\nB: It’s cold. It’s cloudy."
        },
        "exercise": {
          "version": 1,
          "id": "a1-1-w1-l7-e02-choice",
          "kind": "choice",
          "title": "Понимаем собеседника",
          "feedback": {
            "showAnswers": false
          },
          "instruction": "Послушай четыре коротких разговора.",
          "items": [
            {
              "id": "q1",
              "prompt": "Как зовут человека?",
              "options": [
                {
                  "id": "o1",
                  "text": "Anna"
                },
                {
                  "id": "o2",
                  "text": "Emma"
                }
              ],
              "correctId": "o2"
            },
            {
              "id": "q2",
              "prompt": "Сколько ему лет?",
              "options": [
                {
                  "id": "o1",
                  "text": "31"
                },
                {
                  "id": "o2",
                  "text": "13"
                }
              ],
              "correctId": "o1"
            },
            {
              "id": "q3",
              "prompt": "Откуда человек?",
              "options": [
                {
                  "id": "o1",
                  "text": "China"
                },
                {
                  "id": "o2",
                  "text": "the USA"
                }
              ],
              "correctId": "o1"
            },
            {
              "id": "q4",
              "prompt": "Какая погода?",
              "options": [
                {
                  "id": "o1",
                  "text": "Тепло и солнечно."
                },
                {
                  "id": "o2",
                  "text": "Холодно и облачно."
                }
              ],
              "correctId": "o2"
            }
          ]
        },
        "sourceId": "A1.1-W1-L7-E02"
      },
      {
        "menu": "3. Выбери нужную реплику",
        "section": "tasks",
        "guide": {
          "aim": "Выбрать знакомую модель по коммуникативной задаче.",
          "tl": "Повторение материала уроков 1–6; нового языка нет.",
          "time": "4 мин.",
          "notes": ""
        },
        "exercise": {
          "version": 1,
          "id": "a1-1-w1-l7-e03-choice",
          "kind": "choice",
          "title": "Выбери нужную реплику",
          "feedback": {
            "showAnswers": false
          },
          "instruction": "Выбери одну реплику для каждой ситуации.",
          "items": [
            {
              "id": "q1",
              "prompt": "Ты впервые знакомишься с человеком.",
              "options": [
                {
                  "id": "o1",
                  "text": "Nice to meet you."
                },
                {
                  "id": "o2",
                  "text": "Nice to see you."
                }
              ],
              "correctId": "o1"
            },
            {
              "id": "q2",
              "prompt": "Ты хочешь узнать возраст собеседника.",
              "options": [
                {
                  "id": "o1",
                  "text": "Where are you from?"
                },
                {
                  "id": "o2",
                  "text": "How old are you?"
                }
              ],
              "correctId": "o2"
            },
            {
              "id": "q3",
              "prompt": "Человек говорит Thank you. Ты отвечаешь:",
              "options": [
                {
                  "id": "o1",
                  "text": "I’m sorry."
                },
                {
                  "id": "o2",
                  "text": "You’re welcome."
                }
              ],
              "correctId": "o2"
            },
            {
              "id": "q4",
              "prompt": "Ты хочешь узнать страну собеседника.",
              "options": [
                {
                  "id": "o1",
                  "text": "Where are you from?"
                },
                {
                  "id": "o2",
                  "text": "How is your day?"
                }
              ],
              "correctId": "o1"
            },
            {
              "id": "q5",
              "prompt": "Ты хочешь получить email, чтобы написать человеку.",
              "options": [
                {
                  "id": "o1",
                  "text": "What’s your phone number?"
                },
                {
                  "id": "o2",
                  "text": "What’s your email address?"
                }
              ],
              "correctId": "o2"
            },
            {
              "id": "q6",
              "prompt": "Собеседник повторил твой номер без ошибки. Ты подтверждаешь:",
              "options": [
                {
                  "id": "o1",
                  "text": "Yes, that’s right."
                },
                {
                  "id": "o2",
                  "text": "Yes, please."
                }
              ],
              "correctId": "o1"
            }
          ]
        },
        "sourceId": "A1.1-W1-L7-E03"
      },
      {
        "menu": "4. Регистрация на встречу",
        "section": "tasks",
        "guide": {
          "aim": "Получить и записать имя, возраст и страну.",
          "tl": "Повторение материала уроков 1–6; нового языка нет.",
          "time": "5 мин.",
          "notes": "Скрытая карточка преподавателя: First name Emma; Last name Fox; Age 26; Country France. На What’s your name? преподаватель сообщает first name и last name. Не вводить дополнительные вопросы.\nКритерии: Задаёт вопросы самостоятельно.; Записывает данные в нужные поля.; Использует просьбу о spelling."
        },
        "exercise": {
          "version": 1,
          "id": "a1-1-w1-l7-e04",
          "kind": "stage",
          "title": "Регистрация на встречу",
          "feedback": {
            "showAnswers": false
          },
          "exercises": [
            {
              "id": "a1-1-w1-l7-e04-text",
              "exercise": {
                "version": 1,
                "id": "a1-1-w1-l7-e04-text",
                "kind": "presentation",
                "title": "Регистрация на встречу",
                "feedback": {
                  "showAnswers": false
                },
                "blocks": [
                  {
                    "type": "text",
                    "text": "Попроси преподавателя сообщить данные. Заполни анкету по его ответам. Затем поменяйтесь ролями.\n\n\nТвоя карточка для второй роли:\nFirst name: Leo\nLast name: King\nAge: 32\nCountry: the USA\n\nПопроси произнести фамилию по буквам, если нужно."
                  }
                ]
              }
            },
            {
              "id": "a1-1-w1-l7-e04-writing",
              "exercise": {
                "version": 1,
                "id": "a1-1-w1-l7-e04-writing",
                "kind": "writing",
                "title": "Регистрация на встречу",
                "feedback": {
                  "showAnswers": false
                },
                "items": [
                  {
                    "id": "field1",
                    "prompt": "First name:",
                    "possibleAnswers": [
                      "Leo"
                    ]
                  },
                  {
                    "id": "field2",
                    "prompt": "Last name:",
                    "possibleAnswers": [
                      "King"
                    ]
                  },
                  {
                    "id": "field3",
                    "prompt": "Age:",
                    "possibleAnswers": [
                      "32"
                    ]
                  },
                  {
                    "id": "field4",
                    "prompt": "Country:",
                    "possibleAnswers": [
                      "the USA"
                    ]
                  }
                ],
                "responseMode": "personal"
              }
            }
          ],
          "layout": "grouped"
        },
        "sourceId": "A1.1-W1-L7-E04"
      },
      {
        "menu": "5. Восстанови контакты",
        "section": "tasks",
        "guide": {
          "aim": "Записать контакты и проверить запись.",
          "tl": "Повторение материала уроков 1–6; нового языка нет.",
          "time": "4 мин.",
          "notes": "",
          "audioScript": "1. Nine; zero; three; four; one; six; two; eight; five; zero.\n2. L; E; O; dot; K; at; E; X; A; M; P; L; E; dot; C; O; M."
        },
        "exercise": {
          "version": 1,
          "id": "a1-1-w1-l7-e05",
          "kind": "stage",
          "title": "Восстанови контакты",
          "feedback": {
            "showAnswers": false
          },
          "exercises": [
            {
              "id": "a1-1-w1-l7-e05-gaps",
              "exercise": {
                "version": 1,
                "id": "a1-1-w1-l7-e05-gaps",
                "kind": "gaps",
                "title": "Восстанови контакты",
                "feedback": {
                  "showAnswers": false
                },
                "instruction": "Слушай. Заполни пропуски: один пропуск — один знак или цифра.",
                "items": [
                  {
                    "id": "row1",
                    "segments": [
                      "1. Phone number: 903 ",
                      {
                        "id": "g1-1",
                        "answers": [
                          "4"
                        ]
                      },
                      "16 28",
                      {
                        "id": "g1-2",
                        "answers": [
                          "5"
                        ]
                      },
                      "0"
                    ]
                  },
                  {
                    "id": "row2",
                    "segments": [
                      "2. Email address: leo",
                      {
                        "id": "g2-1",
                        "answers": [
                          "."
                        ]
                      },
                      "k",
                      {
                        "id": "g2-2",
                        "answers": [
                          "@"
                        ]
                      },
                      "example.com"
                    ]
                  }
                ]
              }
            },
            {
              "id": "a1-1-w1-l7-e05-followup",
              "exercise": {
                "version": 1,
                "id": "a1-1-w1-l7-e05-followup",
                "kind": "presentation",
                "title": "Восстанови контакты",
                "feedback": {
                  "showAnswers": false
                },
                "blocks": [
                  {
                    "type": "text",
                    "text": "Прочитай преподавателю оба контакта полностью и спроси Is that right?"
                  }
                ]
              }
            }
          ],
          "layout": "grouped"
        },
        "sourceId": "A1.1-W1-L7-E05"
      },
      {
        "menu": "6. Три разговора",
        "section": "tasks",
        "guide": {
          "aim": "Самостоятельно использовать материал Whale 1.",
          "tl": "Повторение материала уроков 1–6; нового языка нет.",
          "time": "8 мин.",
          "notes": "Для ситуации 1 преподаватель: Tom White, 28, Germany. Для ситуации 3 преподаватель: 351 720 6840; tom-w@example.com. Карточки давать раздельно; не показывать скрытые данные до обмена. В дополнительные минуты не вводить новый материал.\nКритерии: Выбирает meet/see по ситуации.; Задаёт вопросы, а не только отвечает.; Передаёт личные данные и контакты.; Использует погодные модели.; Уместно благодарит и прощается."
        },
        "exercise": {
          "version": 1,
          "id": "a1-1-w1-l7-e06-text",
          "kind": "presentation",
          "title": "Три разговора",
          "feedback": {
            "showAnswers": false
          },
          "blocks": [
            {
              "type": "text",
              "text": "Разыграйте три ситуации. Меняйтесь ролями.\n\nСитуация 1. Новый знакомый.\nПоздоровайся. Скажи, что рад знакомству. Узнай имя, возраст и страну. Назови свои данные или используй карточку:\nFirst name: Alex\nLast name: Green\nAge: 30\nCountry: Russia\n\nСитуация 2. Знакомый человек.\nСкажи, что рад встрече. Сделай комплимент. Спроси, как дела или как проходит день. Обсудите погоду: солнечно и холодно. Попрощайтесь.\n\nСитуация 3. Контакты.\nУзнай телефон и email. Запиши их, прочитай собеседнику и проверь. Затем сообщи свои учебные данные:\nMy number: 628 305 1740\nMy email address: alex_g@example.com\nПоблагодари и попрощайся.\n\nЕсли успеваете: повторите одну ситуацию с другими знакомыми данными."
            }
          ]
        },
        "sourceId": "A1.1-W1-L7-E06"
      },
      {
        "menu": "7. Короткое сообщение",
        "section": "tasks",
        "guide": {
          "aim": "Перенести знакомые модели в письменное общение.",
          "tl": "Повторение материала уроков 1–6; нового языка нет.",
          "time": "3 мин.",
          "notes": "Возможный текст не показывать до самостоятельной попытки. Не требовать новых формул письма.\nКритерии: Есть приветствие.; Использована знакомая модель имени.; Email записан точно.; Есть уместное прощание."
        },
        "exercise": {
          "version": 1,
          "id": "a1-1-w1-l7-e07",
          "kind": "stage",
          "title": "Короткое сообщение",
          "feedback": {
            "showAnswers": false
          },
          "exercises": [
            {
              "id": "a1-1-w1-l7-e07-text",
              "exercise": {
                "version": 1,
                "id": "a1-1-w1-l7-e07-text",
                "kind": "presentation",
                "title": "Короткое сообщение",
                "feedback": {
                  "showAnswers": false
                },
                "blocks": [
                  {
                    "type": "text",
                    "text": "Напиши новому знакомому короткое сообщение из четырёх строк.\n\n1. Поздоровайся.\n2. Назови имя.\n3. Напиши учебный email.\n4. Попрощайся.\n\nИспользуй свои вымышленные данные или карточку:\nFirst name: Anna\nEmail address: anna.b@example.com"
                  }
                ]
              }
            },
            {
              "id": "a1-1-w1-l7-e07-writing",
              "exercise": {
                "version": 1,
                "id": "a1-1-w1-l7-e07-writing",
                "kind": "writing",
                "title": "Короткое сообщение",
                "feedback": {
                  "showAnswers": false
                },
                "items": [
                  {
                    "id": "field1",
                    "prompt": "Строка 1",
                    "possibleAnswers": [
                      "Hello!",
                      "Hi!"
                    ]
                  },
                  {
                    "id": "field2",
                    "prompt": "Строка 2",
                    "possibleAnswers": [
                      "My first name is Anna.",
                      "My name is Anna."
                    ]
                  },
                  {
                    "id": "field3",
                    "prompt": "Строка 3",
                    "possibleAnswers": [
                      "My email address is anna.b@example.com."
                    ]
                  },
                  {
                    "id": "field4",
                    "prompt": "Строка 4",
                    "possibleAnswers": [
                      "Bye!",
                      "See you later!"
                    ]
                  }
                ],
                "responseMode": "open"
              }
            },
            {
              "id": "a1-1-w1-l7-e07-support",
              "exercise": {
                "version": 1,
                "id": "a1-1-w1-l7-e07-support",
                "kind": "presentation",
                "title": "Короткое сообщение",
                "feedback": {
                  "showAnswers": false
                },
                "blocks": [
                  {
                    "type": "disclosure",
                    "title": "Опора при необходимости",
                    "text": "My first name is …\nMy email address is …",
                    "open": false
                  }
                ]
              }
            }
          ],
          "layout": "grouped"
        },
        "sourceId": "A1.1-W1-L7-E07"
      }
    ]
  }
];
  lessons.forEach(lesson => lesson.stages.forEach(stage => window.SpaceWhaleExerciseKit.validate(stage.exercise)));
  window.SpaceWhaleContent = window.SpaceWhaleContent || [];
  window.SpaceWhaleContent.push(...lessons);
})();
