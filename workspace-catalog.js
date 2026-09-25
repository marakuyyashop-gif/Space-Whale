(function (root) {
  'use strict';

  const courseOutline = [
    {
      id: 'A1.1',
      whales: [
        { id: 1, title: 'Whale 1 · Short Talk', topics: [
          'Как я рад встрече!','Рад знакомству','Как вас зовут?','Заполняем анкету','Давайте обменяемся контактами','Какая замечательная сегодня погода!','Знакомимся и обмениваемся информацией'
        ]},
        { id: 2, title: 'Whale 2 · Я являюсь человеком', topics: [
          'Знакомые лица','A, an или the?','Как он себя чувствует?','У меня одна кружка, а у тебя две','Кому что принадлежит','Мы вместе','Кто мы и какие мы — Review'
        ]},
        { id: 3, title: 'Whale 3 · Рассказываем о других', topics: [
          'Исправляем описание','Угадай, кто это','Внутри, на, рядом','Кто где находится?','Я умею! А я не умею','А ты умеешь?','Новая компания: кто где и что умеет?'
        ]},
        { id: 4, title: 'Whale 4 · Рутина', topics: [
          'Мой день','Что он обычно делает вечером?','Как часто это происходит?','Когда это происходит?','Собираем предложение правильно','Мы так не делаем','Один обычный день'
        ]},
        { id: 5, title: 'Whale 5 · Моя повседневная жизнь', topics: [
          'Чем занимаются знакомые?','Узнаём человека лучше','Be и другие глаголы в Present Simple','Узнаём человека по описанию','Что есть для занятий?','Выбираем общее занятие','Готовимся к совместному выходу','Находим общее и готовимся к встрече'
        ]},
        { id: 6, title: 'Whale 6 · Что нравится моим родным', topics: [
          'Говорим о людях без повторов','Что мне нравится?','Что тебе нравится, а что нет?','Один человек — несколько людей','Вот этот или вон тот?','Выбираем одежду','Кому принадлежит вещь?','Выбираем вещи и узнаём предпочтения'
        ]},
        { id: 7, title: 'Whale 7 · Время встречи', topics: [
          'Во сколько встречаемся?','Выбираем день недели','Порядок занятий и встреч','В каком месяце?','В какое время года?','Называем точную дату','Согласуем встречу по календарю'
        ]}
      ]
    },
    {
      id: 'A1.2',
      whales: [
        { id: 1, title: 'Whale 1 · Мой дом', topics: [
          'Что есть в новой комнате?','Чего не хватает дома?','Уточняем, что есть в доме','У каждой вещи своё место','Где это находится?','Помоги устроиться','Правила общего пространства','Объясняем короткий маршрут','Осваиваемся в новом доме'
        ]},
        { id: 2, title: 'Whale 2 · Путешествие', topics: [
          'Что здесь можно сделать?','Спрашиваем разрешение','Просим выполнить действие','Предлагаем помощь','Просим повторить и уточняем, что услышали','Решаем повседневные задачи в поездке'
        ]},
        { id: 3, title: 'Whale 3 · Еда и покупки', topics: [
          'Что можно посчитать?','Проверяем, что есть дома','Сколько нам нужно?','Узнаём цену продуктов','Делаем заказ в кафе','Предлагаем угощение','Покупаем продукты и делаем заказ'
        ]},
        { id: 4, title: 'Whale 4 · Описываем и объясняем выбор', topics: [
          'Описываем одежду','Описываем внешний вид одежды','Объясняем свой выбор','Уточняем, какой человек','Объясняем, что это такое','Описываем и объясняем выбор — закрепление'
        ]},
        { id: 5, title: 'Whale 5 · Что происходит сейчас', topics: [
          'Что происходит прямо сейчас?','Что происходит дома?','Что они делают?','Обычно и сейчас','Ищем вещь','Что происходит сейчас? — закрепление'
        ]},
        { id: 6, title: 'Whale 6 · Будущее', topics: [
          'Что будет в нашей поездке?','Когда это будет?','Что будем делать?','Что я собираюсь делать?','Какие у тебя планы?','План или решение сейчас?','Говорим о будущем — закрепление'
        ]},
        { id: 7, title: 'Whale 7 · Итоговое повторение A1', topics: [
          'Знакомимся и рассказываем о себе','Обычная неделя и встреча','Решаем бытовые задачи','Выбираем, заказываем и говорим о планах'
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

    const templateLesson = { id: 'templates', title: 'Шаблоны упражнений', stages: templates.map(exercise => ({ menu: exercise.label, exercise })) };

    function topics(route) {
      if (route.view === 'templates') return [templateLesson];
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
      const lesson = topics(route).find(lesson => lesson.id === params.get('lesson')) || (view === 'templates' ? templateLesson : null);
      if (lesson) {
        route.lesson = lesson.id;
        if (lesson.stages.length) {
          route.exercise = (lesson.stages.find(stage => stage.exercise.id === params.get('exercise')) || lesson.stages[0]).exercise.id;
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
