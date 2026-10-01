(function (root) {
  'use strict';

  const courseOutline = [
    {
      id: 'A1.1',
      whales: [
        { id: 1, title: 'Module 1 · Общение', topics: [
          'Встреча','Вежливость','Алфавит','Анкета','Числа','Десятки','Контакты','Погода','Разговор · Повторение'
        ]},
        { id: 2, title: 'Module 2 · Знакомство', topics: [
          'Знакомые','Предметы','Самочувствие','Количество','Вещи','Компания','Люди · Повторение'
        ]},
        { id: 3, title: 'Module 3 · Команда', topics: [
          'Путаница','Портрет','Места','Карта','Умения','Помощник','Команда · Повторение'
        ]},
        { id: 4, title: 'Module 4 · Рутина', topics: [
          'Утро','Вечер','Привычки','Распорядок','Предложение','Факты','День · Повторение'
        ]},
        { id: 5, title: 'Module 5 · Собеседники', topics: [
          'Интересы','Знакомство','Связь','Внешность','Занятие','Досуг','Прогулка','Встреча · Повторение'
        ]},
        { id: 6, title: 'Module 6 · Окружение', topics: [
          'Помощь','Спорт','Вкусы','Множественное число','Эти и те','Гардероб','Семья','Близкие · Повторение'
        ]},
        { id: 7, title: 'Module 7 · Время', topics: [
          'Расписание','Неделя','Порядок','Календарь','Праздники','Дата','Договорились · Повторение'
        ]}
      ]
    },
    {
      id: 'A1.2',
      whales: [
        { id: 1, title: 'Module 1 · Дом', topics: [
          'Комната','Обстановка','Квартира','Перестановка','Ванная','Переезд','Запреты','Маршрут','Новоселье · Повторение'
        ]},
        { id: 2, title: 'Module 2 · Поездка', topics: [
          'Услуги','Разрешение','Просьбы','Помощь','Звонок','Поездка · Повторение'
        ]},
        { id: 3, title: 'Module 3 · Еда', topics: [
          'Завтрак','Готовка','Покупки','Ценник','Кафе','Угощение','Обед · Повторение'
        ]},
        { id: 4, title: 'Module 4 · Выбор', topics: [
          'Примерочная','Оценка','Выбор','Сосед','Категории','Решение · Повторение'
        ]},
        { id: 5, title: 'Module 5 · Сейчас', topics: [
          'Видеозвонок','Уборка','Парк','Учёба','Пропажа','Сейчас · Повторение'
        ]},
        { id: 6, title: 'Module 6 · Будущее', topics: [
          'Отпуск','Прогнозы','Досуг','Гости','Выходные','Перемены','Завтра · Повторение'
        ]},
        { id: 7, title: 'Module 7 · Практика', topics: [
          'Знакомство · Повторение','Неделя · Повторение','Быт · Повторение','Итог · Повторение'
        ]}
      ]
    },
    {
      id: 'A2.1',
      whales: Array.from({ length: 8 }, (_, i) => ({ id: i + 1, title: `Whale ${i + 1}`, topics: [] }))
    },
    {
      id: 'A2.2',
      whales: Array.from({ length: 8 }, (_, i) => ({ id: i + 1, title: `Whale ${i + 1}`, topics: [] }))
    },
    {
      id: 'B1.1',
      whales: [{ id: 1, title: 'Whale 1', topics: [] }]
    }
  ];

  const levels = courseOutline.map(level => ({
    id: level.id,
    whaleCount: level.whales.length,
    whales: level.whales.map(whale => ({ id: whale.id, title: whale.title }))
  }));

  const outlineLessons = courseOutline.flatMap(level => level.whales.flatMap(whale =>
    whale.topics.map((title, index) => ({
      id: `${level.id.toLowerCase().replace('.', '-')}-w${whale.id}-l${index + 1}`,
      title,
      level: level.id,
      whale: whale.id,
      stages: [],
      outline: true
    }))
  ));

  function createCatalog(lessons, templates) {
    // A sidebar tab accepts one exercise or a sequence; the shared engine owns the arrows.
    // Existing exercise definitions and their answer IDs are left untouched.
    lessons = lessons.map(lesson => ({...lesson, stages: lesson.stages.map(stage => {
      if (!stage.exercises) return stage;
      if (stage.exercise || !stage.id || !stage.exercises.length) throw new Error('A sequence needs a unique tab ID and exercises');
      return {...stage, exercise: {
        version:1, id:stage.id, kind:'stage', title:stage.title || stage.menu || 'Exercises',
        instruction:stage.instruction || '', progressive:true,
        exercises:stage.exercises.map(exercise => ({id:exercise.id, exercise}))
      }};
    })}));
    const ids = new Set();
    lessons.forEach(lesson => {
      if (!lesson.id || ids.has(lesson.id)) throw new Error('Duplicate or missing lesson ID');
      ids.add(lesson.id);
      if (!lesson.stages?.length) throw new Error(`Empty lesson: ${lesson.id}`);
      const stageIds = lesson.stages.map(stage => stage.exercise.id);
      if (new Set(stageIds).size !== stageIds.length) throw new Error(`Duplicate exercise ID: ${lesson.id}`);
      if (lesson.level !== null || lesson.whale !== null) {
        if (!levels.some(level => level.id === lesson.level && level.whales.some(whale => whale.id === lesson.whale))) {
          throw new Error(`Invalid course placement: ${lesson.id}`);
        }
      }
    });

    const actualById = new Map(lessons.map(lesson => [lesson.id, lesson]));
    const mergedLessons = outlineLessons
      .map(outline => actualById.get(outline.id) || outline)
      .concat(lessons.filter(lesson => !outlineLessons.some(outline => outline.id === lesson.id)));

    const templateGroups = [
      ['materials','templates-materials','Материалы / элементы','Audio, Text, Image, Rule, Useful phrases и Possible answers.'],
      ['mechanics','templates','Механики ответа','Переиспользуемые действия ученика. Варианты одной механики находятся внутри её карточки.'],
      ['compositions','templates-compositions','Композиции / примеры','Примеры сборки материалов и механик. Комбинации не ограничены этим списком.']
    ].map(([group,id,title,summary]) => ({id,title,summary,templateGroup:true,stages:templates
      .filter(exercise => (exercise.catalogGroup || 'mechanics') === group)
      .map(exercise => ({menu:exercise.label,navigationTitle:exercise.title,navigationDescription:exercise.description,exercise}))})).filter(group => group.stages.length);
    const templateLesson = templateGroups.find(group => group.id === 'templates') || templateGroups[0];

    function topics(route) {
      if (route.view === 'templates') return templateGroups;
      return mergedLessons.filter(lesson =>
        route.view === 'unassigned'
          ? lesson.level === null
          : lesson.level === route.level && lesson.whale === route.whale
      );
    }

    function normalize(search) {
      const params = new URLSearchParams(search);
      const level = levels.find(level => level.id === params.get('level')) || levels[0];
      const whale = level.whales.find(whale => whale.id === Number(params.get('whale'))) || level.whales[0];
      let view = params.get('view');
      if (!['library', 'unassigned', 'templates'].includes(view)) view = params.has('level') || params.has('whale') ? 'library' : 'unassigned';
      const route = { view, level: level.id, whale: whale?.id || 0, lesson: '', exercise: '' };
      const requestedExercise = params.get('exercise');
      const templateMatch = view === 'templates' && templateGroups.flatMap(group => group.stages.map(stage => ({group,stage})))
        .find(({stage}) => stage.exercise.id === requestedExercise || stage.exercise.legacyIds?.includes(requestedExercise));
      const lesson = templateMatch?.group || topics(route).find(lesson => lesson.id === params.get('lesson')) || (view === 'templates' ? templateLesson : null);
      if (lesson) {
        route.lesson = lesson.id;
        if (lesson.stages.length) {
          route.exercise = (templateMatch?.stage || lesson.stages.find(stage => stage.exercise.id === requestedExercise) || lesson.stages[0]).exercise.id;
        }
      }
      return route;
    }

    function query(route) {
      const params = new URLSearchParams({ view: route.view, level: route.level, whale: String(route.whale) });
      if (route.lesson) params.set('lesson', route.lesson);
      if (route.exercise) params.set('exercise', route.exercise);
      return `?${params}`;
    }

    return { levels, lessons: mergedLessons, topics, normalize, query };
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = { levels, createCatalog, courseOutline };
  else root.SpaceWhaleCatalog = { levels, createCatalog, courseOutline };
})(typeof window === 'undefined' ? globalThis : window);
