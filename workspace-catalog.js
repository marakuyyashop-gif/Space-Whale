(function (root) {
  'use strict';
  const levels = [
    { id: 'A1.1', whaleCount: 7 }, { id: 'A1.2', whaleCount: 7 },
    { id: 'A2.1', whaleCount: 8 }, { id: 'A2.2', whaleCount: 8 }
  ].map(level => ({ ...level, whales: Array.from({ length: level.whaleCount }, (_, i) => ({ id: i + 1, title: `Whale ${i + 1}` })) }));

  function createCatalog(lessons, templates) {
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
    const templateLesson = { id: 'templates', title: 'Шаблоны упражнений', stages: templates.map(exercise => ({ menu: exercise.label, exercise })) };
    function topics(route) {
      if (route.view === 'templates') return [templateLesson];
      return lessons.filter(lesson => route.view === 'unassigned' ? lesson.level === null : lesson.level === route.level && lesson.whale === route.whale);
    }
    function normalize(search) {
      const params = new URLSearchParams(search);
      const level = levels.find(level => level.id === params.get('level')) || levels[0];
      const whale = level.whales.find(whale => whale.id === Number(params.get('whale'))) || level.whales[0];
      let view = params.get('view');
      if (!['library', 'unassigned', 'templates'].includes(view)) view = params.has('level') || params.has('whale') ? 'library' : 'unassigned';
      const route = { view, level: level.id, whale: whale.id, lesson: '', exercise: '' };
      const lesson = topics(route).find(lesson => lesson.id === params.get('lesson')) || (view === 'templates' ? templateLesson : null);
      if (lesson) {
        route.lesson = lesson.id;
        route.exercise = (lesson.stages.find(stage => stage.exercise.id === params.get('exercise')) || lesson.stages[0]).exercise.id;
      }
      return route;
    }
    function query(route) {
      const params = new URLSearchParams({ view: route.view, level: route.level, whale: String(route.whale) });
      if (route.lesson) params.set('lesson', route.lesson);
      if (route.exercise) params.set('exercise', route.exercise);
      return `?${params}`;
    }
    return { levels, lessons, topics, normalize, query };
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { levels, createCatalog };
  else root.SpaceWhaleCatalog = { levels, createCatalog };
})(typeof window === 'undefined' ? globalThis : window);
