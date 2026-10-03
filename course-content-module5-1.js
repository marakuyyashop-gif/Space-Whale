(function () {
  'use strict';

  const kit = window.SpaceWhaleExerciseKit;
  if (!kit) return;

  const words = ['sleep', 'smile', 'laugh', 'stand', 'lie', 'cry'];
  const sheet = 'assets/lesson-media/a1-2/module-5/lesson-1/actions-sheet.webp';
  const crops = [
    { x: 0, y: 0, w: 33.333, h: 50 },
    { x: 33.333, y: 0, w: 33.333, h: 50 },
    { x: 66.666, y: 0, w: 33.334, h: 50 },
    { x: 0, y: 50, w: 33.333, h: 50 },
    { x: 33.333, y: 50, w: 33.333, h: 50 },
    { x: 66.666, y: 50, w: 33.334, h: 50 }
  ];
  const optionOrder = ['laugh', 'cry', 'smile', 'lie', 'sleep', 'stand'];

  const exercise = {
    version: 1,
    id: 'L1-M02',
    kind: 'matching',
    title: 'Match the pictures with the words.',
    instruction: 'Click on the cards and make pairs.',
    layout: 'picture-word',
    items: words.map((word, index) => ({
      id: String(index + 1),
      text: String(index + 1),
      image: sheet,
      imageWidth: 420,
      imageHeight: 315,
      crop: crops[index],
      alt: `Picture ${index + 1}`,
      correctId: word
    })),
    options: optionOrder.map(word => ({ id: word, text: word }))
  };

  kit.validate(exercise);

  const lesson = {
    id: 'a1-2-w5-l1',
    level: 'A1.2',
    whale: 5,
    summary: 'Говорим о действиях, которые происходят прямо сейчас.',
    grammar: 'Present Continuous: am/is/are + V-ing',
    constructions: 'now · right now · at the moment',
    words,
    contentVersion: 'm02-picture-word-2026-10-03',
    stages: [{
      menu: 'New Words',
      navigationTitle: 'Word Discovery',
      section: 'tasks',
      guide: { time: '3 min' },
      exercise
    }]
  };

  window.SpaceWhaleContent = window.SpaceWhaleContent || [];
  const at = window.SpaceWhaleContent.findIndex(item => item.id === lesson.id);
  if (at < 0) window.SpaceWhaleContent.push(lesson);
  else window.SpaceWhaleContent[at] = lesson;
})();
