/* Reviewed A1.2/A2.1 Speaking Tasks, 2026-10-24.
 * Final Speaking only. Text and language models come from the reviewed scenarios.
 * Artwork, visual briefs, vocabulary banks and hidden role data are not rendered.
 * New artwork can replace the stable pending slot of the primary Speaking.
 */
(() => {
  'use strict';
  const kit = window.SpaceWhaleExerciseKit;
  if (!kit) throw new Error('SpaceWhaleExerciseKit must load before Speaking Tasks.');
  const tasks = [
  {
    "lessonId": "a1-2-w1-l1",
    "level": "A1.2",
    "module": 1,
    "lessonNumber": 1,
    "lessonTitle": "Комната",
    "parts": [
      {
        "title": "Describe the room.",
        "text": "Расскажите, что есть в этой комнате и сколько здесь предметов.",
        "phrases": [
          "There is / There’s … / There are …"
        ]
      }
    ]
  },
  {
    "lessonId": "a1-2-w1-l2",
    "level": "A1.2",
    "module": 1,
    "lessonNumber": 2,
    "lessonTitle": "Обстановка",
    "parts": [
      {
        "title": "Say what is missing.",
        "text": "В комнату привезли не всё, что обещали. Сообщите, чего не хватает.",
        "phrases": [
          "There isn’t a … / There aren’t any …",
          "There is no … / There are no …"
        ]
      }
    ]
  },
  {
    "lessonId": "a1-2-w1-l3",
    "level": "A1.2",
    "module": 1,
    "lessonNumber": 3,
    "lessonTitle": "Квартира",
    "parts": [
      {
        "title": "Choose an apartment.",
        "text": "Вы выбираете квартиру. Узнайте, что есть в каждом варианте, и выберите подходящий. Теперь покажите оба варианта другу и ответьте на его вопросы.",
        "phrases": [
          "Is there a …? / Are there any …?",
          "Yes, there is. / Yes, there are. / No, there isn’t. / No, there aren’t."
        ]
      }
    ]
  },
  {
    "lessonId": "a1-2-w1-l4",
    "level": "A1.2",
    "module": 1,
    "lessonNumber": 4,
    "lessonTitle": "Перестановка",
    "parts": [
      {
        "title": "Choose a room layout.",
        "text": "Расскажите, какая мебель есть в комнате. Объясните, где стоят вещи в каждом варианте, и выберите удобную для вас расстановку.",
        "phrases": [
          "There is / There are … / The … is / are …",
          "in · on · near · under · next to · between"
        ]
      }
    ]
  },
  {
    "lessonId": "a1-2-w1-l5",
    "level": "A1.2",
    "module": 1,
    "lessonNumber": 5,
    "lessonTitle": "Ванная",
    "parts": [
      {
        "title": "Find your things.",
        "text": "Вы собираете вещи после поездки. Спросите, где ваши принадлежности. Помогите собеседнику найти остальные вещи: покажите, что рядом с вами, а что дальше.",
        "phrases": [
          "Where is / are …?",
          "Here it is. / Here they are. / It’s over there. / They’re over there."
        ]
      }
    ]
  },
  {
    "lessonId": "a1-2-w1-l6",
    "level": "A1.2",
    "module": 1,
    "lessonNumber": 6,
    "lessonTitle": "Переезд",
    "parts": [
      {
        "title": "Ask for help with the move.",
        "text": "Вам помогают после переезда. Попросите помощника расставить вещи и включить или выключить нужные приборы.",
        "phrases": [
          "…, please. / Please …",
          "in · on · next to"
        ]
      }
    ]
  },
  {
    "lessonId": "a1-2-w1-l7",
    "level": "A1.2",
    "module": 1,
    "lessonNumber": 7,
    "lessonTitle": "Запреты",
    "parts": [
      {
        "title": "Warn the people.",
        "text": "Предупредите людей: скажите, чего сейчас нельзя делать.",
        "phrases": [
          "Don’t …"
        ]
      },
      {
        "title": "Describe Tom’s usual behavior.",
        "text": "Расскажите, чего Tom обычно не делает.",
        "phrases": [
          "He doesn’t …"
        ]
      }
    ]
  },
  {
    "lessonId": "a1-2-w1-l8",
    "level": "A1.2",
    "module": 1,
    "lessonNumber": 8,
    "lessonTitle": "Маршрут",
    "parts": [
      {
        "title": "Give directions.",
        "text": "Помогите гостю найти места в вашем районе: объясните путь от отмеченной точки. Затем спросите дорогу сами. Каждый раз начинайте с той же точки.",
        "phrases": [
          "How do I get to …?",
          "Go straight. / Turn left. / Turn right.",
          "It’s on your left. / It’s on your right."
        ]
      }
    ]
  },
  {
    "lessonId": "a1-2-w2-l1",
    "level": "A1.2",
    "module": 2,
    "lessonNumber": 1,
    "lessonTitle": "Услуги",
    "parts": [
      {
        "title": "Ask about the services.",
        "text": "Вы приехали на базу отдыха. Узнайте у сотрудника, где можно остановиться и какими услугами воспользоваться. Затем расскажите другу, что здесь доступно, а что нет.",
        "phrases": [
          "What / Where can I …?",
          "I can / I can’t …"
        ]
      }
    ]
  },
  {
    "lessonId": "a1-2-w2-l2",
    "level": "A1.2",
    "module": 2,
    "lessonNumber": 2,
    "lessonTitle": "Разрешение",
    "parts": [
      {
        "title": "Ask for permission.",
        "text": "Вы заселяетесь в гостиницу. Спросите администратора, что здесь разрешено, а что нет. Затем поменяйтесь ролями и ответьте на вопросы собеседника.",
        "phrases": [
          "Can I …?",
          "Yes, you can. / No, you can’t. / You can’t …"
        ]
      }
    ]
  },
  {
    "lessonId": "a1-2-w2-l3",
    "level": "A1.2",
    "module": 2,
    "lessonNumber": 3,
    "lessonTitle": "Просьбы",
    "parts": [
      {
        "title": "Ask your friend for help.",
        "text": "Перед поездкой уточните у друга место встречи и дорогу. Вежливо попросите помочь с недостающей информацией и ответьте на его просьбы.",
        "phrases": [
          "Can I …? / Can you / Could you …, please?",
          "Of course. / Sorry, I can’t."
        ]
      }
    ]
  },
  {
    "lessonId": "a1-2-w2-l4",
    "level": "A1.2",
    "module": 2,
    "lessonNumber": 4,
    "lessonTitle": "Помощь",
    "parts": [
      {
        "title": "Offer help.",
        "text": "В поездке люди помогают друг другу с вещами. Предложите помощь от лица одного человека и ответьте на предложение от лица другого.",
        "phrases": [
          "Can I help you? / Do you need help?",
          "Can I …?",
          "Yes, please. / No, thanks."
        ]
      }
    ]
  },
  {
    "lessonId": "a1-2-w2-l5",
    "level": "A1.2",
    "module": 2,
    "lessonNumber": 5,
    "lessonTitle": "Звонок",
    "parts": [
      {
        "title": "Check the information.",
        "text": "Вы звоните в гостиницу. Уточните адрес и сообщение. Если что-то не расслышали или не поняли, объясните проблему и попросите нужное уточнение.",
        "phrases": [
          "Can you repeat …, please? / Can you say … again, please?",
          "Can you speak slowly / clearly, please? / Can you spell …, please?",
          "Can you hear me? / I can’t hear you. / I don’t understand …"
        ]
      }
    ]
  },
  {
    "lessonId": "a1-2-w5-l1",
    "level": "A1.2",
    "module": 5,
    "lessonNumber": 1,
    "lessonTitle": "Видеозвонок",
    "parts": [
      {
        "title": "Tell your aunt what is happening.",
        "text": "Тётя позвонила узнать, как проходит ваш выходной. Расскажите, чем сейчас заняты вы и ваши близкие.",
        "phrases": [
          "I’m not / I’m …",
          "is … / are …",
          "now · right now · at the moment"
        ]
      }
    ]
  },
  {
    "lessonId": "a1-2-w5-l2",
    "level": "A1.2",
    "module": 5,
    "lessonNumber": 2,
    "lessonTitle": "Уборка",
    "parts": [
      {
        "title": "Correct the message.",
        "text": "Пока мама с младшей сестрой в магазине, вы с другими членами семьи убираете дома. Ваша младшая сестра отправила маме сообщение, но перепутала, кто что делает. Исправьте её ошибки. Расскажите кто что делает прямо сейчас.",
        "phrases": [
          "I’m not / I’m …",
          "is / isn’t / are / aren’t …",
          "now · right now · at the moment"
        ]
      }
    ]
  },
  {
    "lessonId": "a1-2-w5-l3",
    "level": "A1.2",
    "module": 5,
    "lessonNumber": 3,
    "lessonTitle": "Парк",
    "parts": [
      {
        "title": "Find your classmates.",
        "text": "Вы с бывшим одноклассником рассматриваете школьную фотографию и не всех узнаёте. Узнайте, что делают люди из списка и где они на снимке. Проверьте свои догадки и ответьте на вопросы собеседника.",
        "phrases": [
          "Is …? / Are …? / What …? / Where …?",
          "Yes, … is / are. / No, … isn’t / aren’t."
        ]
      }
    ]
  },
  {
    "lessonId": "a1-2-w5-l4",
    "level": "A1.2",
    "module": 5,
    "lessonNumber": 4,
    "lessonTitle": "Обычно и сейчас",
    "parts": [
      {
        "title": "Compare usual activities and now.",
        "text": "Расскажите, чем эти люди обычно занимаются и что делают сейчас.",
        "phrases": [
          "… usually …, but now … / Every …, …, but today …",
          "day · week · month · now · at the moment"
        ]
      },
      {
        "title": "Compare your usual day and today.",
        "text": "Сравните ваш обычный день с тем, как вы проводите его сейчас.",
        "phrases": [
          "… usually …, but now … / Every …, …, but today …",
          "day · week · month · now · at the moment"
        ]
      },
      {
        "title": "Talk about your free time.",
        "text": "Чем вам нравится заниматься в свободное время? Чем хотите заняться?",
        "discussion": true
      }
    ]
  },
  {
    "lessonId": "a2-1-w1-l1",
    "level": "A2.1",
    "module": 1,
    "lessonNumber": 1,
    "lessonTitle": "Старые фотографии",
    "parts": [
      {
        "title": "Talk about the family photos.",
        "text": "Расскажите другу по телефону о семейных фотографиях от имени их владельца. Поправьте его предположения.",
        "bullets": [
          "First day: “You were a teacher then.”",
          "Birthday: “Your mom was alone.”",
          "Boat trip: “You and your brother were at home.”",
          "Evening: “Your parents were together.”"
        ],
        "phrases": [
          "was / wasn’t / were / weren’t …",
          "then · at that time"
        ]
      }
    ]
  },
  {
    "lessonId": "a2-1-w1-l2",
    "level": "A2.1",
    "module": 1,
    "lessonNumber": 2,
    "lessonTitle": "Городские места",
    "parts": [
      {
        "title": "Talk about yesterday.",
        "text": "В роли персонажа обсудите с другом вчерашний день. Узнайте недостающие места, проверьте догадку и ответьте на его вопросы. Поправьте его, если он ошибётся, и дополните свои заметки вслух.",
        "phrases": [
          "Where was / were …? / Was / Were …?",
          "Yes, … was / were. / No, … wasn’t / weren’t.",
          "I was / We were … / He was / She was / They were …",
          "yesterday · at nine · at noon · at six"
        ]
      }
    ]
  },
  {
    "lessonId": "a2-1-w1-l3",
    "level": "A2.1",
    "module": 1,
    "lessonNumber": 3,
    "lessonTitle": "Старый район",
    "parts": [
      {
        "title": "Describe the old neighborhood.",
        "text": "Друг вспоминает старый район, но путает некоторые детали. По плану расскажите, что там было и где находилось. Исправьте его воспоминания.",
        "bullets": [
          "“There was a parking lot next to the post office.”",
          "“There were flowers near the swimming pool.”",
          "“There weren’t any benches near the playground.”"
        ],
        "phrases": [
          "There was / wasn’t … / There were / weren’t … / There was / were no …",
          "The … was / were …",
          "Was there / Were there …?",
          "Yes, there was / were. / No, there wasn’t / weren’t.",
          "any · next to · near"
        ]
      },
      {
        "title": "Talk about your old neighborhood.",
        "text": "Вспомните район, который вы хорошо знали раньше. Расспросите друг друга, какие места там были, и ответьте на вопросы собеседника.",
        "phrases": [
          "There was / wasn’t … / There were / weren’t … / There was / were no …",
          "The … was / were …",
          "Was there / Were there …?",
          "Yes, there was / were. / No, there wasn’t / weren’t.",
          "any · next to · near"
        ]
      }
    ]
  },
  {
    "lessonId": "a2-1-w2-l1",
    "level": "A2.1",
    "module": 2,
    "lessonNumber": 1,
    "lessonTitle": "Вчерашние дела",
    "parts": [
      {
        "title": "Talk about the past few days.",
        "text": "Расскажите от имени члена этой семьи, что вы и ваши близкие делали в последние дни.",
        "phrases": [
          "I … / We … / My …",
          "yesterday · last weekend · … ago"
        ]
      }
    ]
  },
  {
    "lessonId": "a2-1-w2-l2",
    "level": "A2.1",
    "module": 2,
    "lessonNumber": 2,
    "lessonTitle": "События дня",
    "parts": [
      {
        "title": "Tell the story of the visit.",
        "text": "По заметкам расскажите от имени персонажа о его вчерашней поездке к другу.",
        "phrases": [
          "Yesterday I … / We …",
          "in the morning · at eleven · in the evening"
        ]
      }
    ]
  },
  {
    "lessonId": "a2-1-w2-l3",
    "level": "A2.1",
    "module": 2,
    "lessonNumber": 3,
    "lessonTitle": "Выходной",
    "parts": [
      {
        "title": "Correct your friend’s story.",
        "text": "Друг перепутал детали вчерашнего выходного. Исправьте его: скажите, чего не было и как всё произошло на самом деле. Вы отвечаете от имени участника встречи.",
        "phrases": [
          "… didn’t … / … wasn’t … / … weren’t …",
          "yesterday · at five · at eight"
        ]
      }
    ]
  },
  {
    "lessonId": "a2-1-w3-l1",
    "level": "A2.1",
    "module": 3,
    "lessonNumber": 1,
    "lessonTitle": "Учебные задания",
    "parts": [
      {
        "title": "Ask about the instructions.",
        "text": "Вы вместе выполняете задания на английском. Уточните значение команд и узнайте, как назвать показанные действия. Затем помогите собеседнику: ответьте на его вопросы и при необходимости покажите действие.",
        "phrases": [
          "What does … mean? / What does this word mean?",
          "How do you say … in English? / How do you say this in English?",
          "It means … / You say … / Like this."
        ]
      }
    ]
  },
  {
    "lessonId": "a2-1-w3-l2",
    "level": "A2.1",
    "module": 3,
    "lessonNumber": 2,
    "lessonTitle": "Языковая практика",
    "parts": [
      {
        "title": "Describe their language practice.",
        "text": "Расскажите, что этим людям нравится в изучении языков и как они практикуются.",
        "phrases": [
          "… enjoy / enjoys … / … practice / practices …"
        ]
      },
      {
        "title": "Talk about your English practice.",
        "text": "Что вам нравится на занятиях английским? Что вы регулярно делаете для практики?",
        "phrases": [
          "I enjoy … / I practice …"
        ]
      }
    ]
  },
  {
    "lessonId": "a2-1-w3-l3",
    "level": "A2.1",
    "module": 3,
    "lessonNumber": 3,
    "lessonTitle": "Спортивные занятия",
    "parts": [
      {
        "title": "Talk about learning a sport.",
        "text": "Выберите роль начинающего спортсмена: чему вы сейчас учитесь и как у вас получается? Расспросите собеседника о его занятиях и расскажите о своих.",
        "phrases": [
          "What are you learning to do?",
          "I’m learning to … / I’m learning how to …",
          "How’s it going? / It’s going well. / Not very well."
        ]
      },
      {
        "title": "Talk about what you want to learn.",
        "text": "Посмотрите на остальные занятия. Расскажите, чему вы хотели бы научиться, а чему — нет. Узнайте, что выбрал бы собеседник.",
        "phrases": [
          "Do you want to learn to …? / Do you want to learn how to …?",
          "I want to learn to … / I want to learn how to … / I don’t want to learn …"
        ]
      }
    ]
  },
  {
    "lessonId": "a2-1-w3-l4",
    "level": "A2.1",
    "module": 3,
    "lessonNumber": 4,
    "lessonTitle": "Увлечения",
    "parts": [
      {
        "title": "Talk about your interests.",
        "text": "Расскажите, какие темы и занятия вам интересны, а какие — нет. Узнайте об интересах собеседника и попросите подробнее рассказать о том, что вас заинтересовало. В ответ на его просьбу тоже добавьте подробность.",
        "phrases": [
          "What are you interested in? / Are you interested in …?",
          "I’m interested in … / I’m not interested in …",
          "Yes, I am. / No, I’m not. / And you?",
          "Tell me more."
        ]
      }
    ]
  }
];
  const existingFinalIds = {'a1-2-w5-l1':'L1-M10', 'a1-2-w5-l4':'A1M5L4_FINAL'};
  const newLessonInfo = {
    'a2-1-w1-l1':['Describe people in old family photos and correct a friend’s assumptions.','Past Simple: was/were statements and negatives'],
    'a2-1-w1-l2':['Ask and answer questions about where people were yesterday.','Past Simple: was/were questions and short answers'],
    'a2-1-w1-l3':['Describe an old neighborhood and correct inaccurate memories.','There was/were; past location'],
    'a2-1-w2-l1':['Describe what family members did in the past few days.','Past Simple: regular verb statements'],
    'a2-1-w2-l2':['Tell the story of yesterday’s visit to a friend using notes.','Past Simple: irregular verb statements'],
    'a2-1-w2-l3':['Correct a friend’s account of yesterday and describe what really happened.','Past Simple: didn’t; wasn’t/weren’t'],
    'a2-1-w3-l1':['Clarify classroom instructions and explain their meanings and English names.','What does … mean?; How do you say … in English?'],
    'a2-1-w3-l2':['Describe what people enjoy about learning languages and how they practice.','Enjoy/practice + noun or -ing'],
    'a2-1-w3-l3':['Discuss sports skills you are learning and would like to learn.','Learn to; learn how to; How’s it going?'],
    'a2-1-w3-l4':['Discuss interests and ask each other for more detail.','Be interested in; Tell me more']
  };
  const textSources = new Set([
    'a1-2-w2-l3', 'a1-2-w2-l5', 'a2-1-w1-l2', 'a2-1-w2-l2',
    'a2-1-w3-l1', 'a2-1-w3-l2', 'a2-1-w3-l4'
  ]);
  const content = window.SpaceWhaleContent = window.SpaceWhaleContent || [];
  for (const task of tasks) {
    const index = content.findIndex(lesson => lesson.id === task.lessonId);
    const previous = index < 0 ? null : content[index];
    const finalId = existingFinalIds[task.lessonId] || task.lessonId + '-final-speaking';
    const partId = n => n === 0 ? (task.parts.length === 1 ? finalId : finalId + '-main') : finalId + '-follow-up-' + n;
    const exercises = task.parts.map((part, n) => {
      if (part.discussion) {
        const exercise = {version:1, id:partId(n), templateCode:'Q01', kind:'presentation', title:part.title,
          blocks:[{type:'text', text:part.text}]};
        kit.validate(exercise);
        return exercise;
      }
      return kit.speaking({
        id:partId(n), templateCode:n > 0 || textSources.has(task.lessonId) ? 'S02' : 'S01',
        title:part.title,
        image:n === 0 ? {imagePending:true, assetId:task.lessonId + '-final-speaking-image'} : null,
        task:{text:part.text, ...(part.bullets ? {bullets:part.bullets} : {})},
        use:[{phrases:part.phrases}]
      });
    });
    const exercise = exercises.length === 1 ? exercises[0] : {
      version:1, id:finalId, kind:'stage', templateRole:'composition', title:exercises[0].title,
      progressive:true, exercises:exercises.map(exercise => ({id:exercise.id, exercise}))
    };
    kit.validate(exercise);
    const final = {menu:'Speaking', navigationTitle:'Speaking', navigationBlock:'final', role:'final', section:'tasks', exercise};
    const stages = (previous?.stages || []).filter(stage => stage.exercise.id !== finalId);
    const homeworkIndex = stages.findIndex(stage => stage.section === 'self-study');
    stages.splice(homeworkIndex < 0 ? stages.length : homeworkIndex, 0, final);
    const structure = (previous?.structure || []).map(section => ({...section,
      sources:section.sources.filter(id => id !== finalId)
    })).filter(section => section.sources.length);
    // Existing complete lesson plans retain all non-final source IDs and order.
    // Newly created content has only its authored final task; empty blocks come from the shared catalog.
    structure.push({role:'final', sources:[finalId]});
    const lesson = {
      ...(previous || {}), id:task.lessonId, level:task.level, whale:task.module,
      lessonNumber:task.lessonNumber, title:task.lessonTitle,
      contentVersion:'reviewed-final-speaking-2026-10-24', stages, structure
    };
    if (!previous && newLessonInfo[task.lessonId]) {
      const [goal, language] = newLessonInfo[task.lessonId];
      lesson.teacherInfo = {goal, language, blockAims:{final:'Consolidate the ability to ' + goal.charAt(0).toLowerCase() + goal.slice(1)}};
    }
    if (index < 0) content.push(lesson);
    else content[index] = lesson;
  }
})();
