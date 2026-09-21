(() => {
  'use strict';
  const examples = [
    { label: '01 · Карточки с плюсиком', version: 1, id: 'matching-demo', kind: 'matching', title: 'Match the words with their meanings.', instruction: 'Click + to open the options. Choose a match for each card.', items: [{ id: 'm1', text: 'a seat', correctId: 'o2' }, { id: 'm2', text: 'an audience', correctId: 'o3' }, { id: 'm3', text: 'a stage', correctId: 'o1' }], options: [{ id: 'o1', text: 'the place where actors perform' }, { id: 'o2', text: 'a place to sit' }, { id: 'o3', text: 'the people watching a show' }] },
    { label: '02 · Выбор внутри текста', version: 1, id: 'inline-demo', kind: 'gaps', title: 'Choose the correct option.', instruction: 'Click each gap to open its options.', items: [{ id: 's1', segments: ['Yesterday we ', { id: 'g1', options: ['visit', 'visited', 'visiting'], answers: ['visited'] }, ' a museum.'] }, { id: 's2', segments: ['Look! The actors ', { id: 'g2', options: ['is', 'was', 'are'], answers: ['are'] }, ' coming onto the stage.'] }] },
    { label: '03 · Серенький Зайка: ввод', version: 1, id: 'typed-demo', kind: 'gaps', title: 'Complete the sentences.', instruction: 'Write the missing verb. You can type in every gap.', items: [{ id: 's1', segments: ['Yesterday I ', { id: 'g1', answers: ['was'] }, ' at home, but my friends ', { id: 'g2', answers: ['were'] }, ' at the theatre.'] }, { id: 's2', segments: ['The show ', { id: 'g3', answers: ['was'] }, ' very funny.'] }] },
    { label: '04 · Беленький Зайка: банк', version: 1, id: 'bank-demo', kind: 'gaps', title: 'Complete the sentences.', instruction: 'Choose a word from the bank for each gap. This version uses clicks, not dragging.', bank: ['stage', 'audience', 'seat'], items: [{ id: 's1', segments: ['The ', { id: 'g1', answers: ['audience'] }, ' applauded at the end of the show.'] }, { id: 's2', segments: ['Please take your ', { id: 'g2', answers: ['seat'] }, '.'] }, { id: 's3', segments: ['The actors came onto the ', { id: 'g3', answers: ['stage'] }, '.'] }] },
    { label: '05 · Лисичка: варианты', version: 1, id: 'choice-demo', kind: 'choice', title: 'Choose the correct option.', instruction: 'Choose one answer in each question.', items: [{ id: 'q1', prompt: 'She is interested ___ music.', options: [{ id: 'a', text: 'at' }, { id: 'b', text: 'in' }, { id: 'c', text: 'on' }], correctId: 'b' }, { id: 'q2', prompt: 'We ___ to the theatre last Friday.', options: [{ id: 'a', text: 'went' }, { id: 'b', text: 'go' }, { id: 'c', text: 'going' }], correctId: 'a' }, { id: 'q3', prompt: 'The actors are performing on the ___.', options: [{ id: 'a', text: 'audience' }, { id: 'b', text: 'seat' }, { id: 'c', text: 'stage' }], correctId: 'c' }, { id: 'q4', prompt: 'Can you ___ me find my seat?', options: [{ id: 'a', text: 'help' }, { id: 'b', text: 'helping' }, { id: 'c', text: 'to help' }], correctId: 'a' }] },
    { label: '06 · Собрать предложение', version: 1, id: 'order-demo', kind: 'order', title: 'Put the words in order.', instruction: 'Click words to build the sentence. Click them again to remove them.', tokens: [{ id: 't3', text: 'go' }, { id: 't5', text: '?' }, { id: 't1', text: 'Where' }, { id: 't4', text: 'yesterday' }, { id: 't2', text: 'did you' }], correctOrder: ['t1', 't2', 't3', 't4', 't5'] },
    { label: '07 · Распределить по группам', version: 1, id: 'sort-demo', kind: 'sort', title: 'Sort the sentences into groups.', instruction: 'Click each sentence and choose a group. Click it again to change or clear the group.', groups: [{ id: 'past', text: 'Past' }, { id: 'now', text: 'Now' }], items: [{ id: 's1', text: 'They are watching a play.', correctId: 'now' }, { id: 's2', text: 'We visited the museum yesterday.', correctId: 'past' }, { id: 's3', text: 'She is looking for her seat.', correctId: 'now' }] },
    { label: '08 · Свободный ответ', version: 1, id: 'writing-demo', kind: 'writing', title: 'Write your answer.', instruction: 'There can be more than one good answer.', items: [{ id: 'w1', prompt: 'What do you like doing at the weekend?' }, { id: 'w2', prompt: 'Describe a place you visited.' }] },
    { label: '09 · Текст и раскрываемый блок', version: 1, id: 'presentation-demo', kind: 'presentation', title: 'Read and discuss.', instruction: 'The extra block is closed until you open it.', blocks: [{ type: 'text', text: 'Before the show, check your ticket and find your seat.\nWhat do you usually do before a show?' }, { type: 'disclosure', title: 'Useful language', text: 'Where is my seat?\nWhen does the show start?' }] },
    { label: '10 · Картинка + подписи', version: 1, id: 'image-label-demo', kind: 'image-label', title: 'Match the objects with their names.', instruction: 'Click each small box on the picture and choose the correct word.', image: 'assets/image-label-demo.svg', alt: 'A study desk with a lamp, plant, laptop, mug and books', options: [{ id: 'lamp', text: 'lamp' }, { id: 'plant', text: 'plant' }, { id: 'laptop', text: 'laptop' }, { id: 'mug', text: 'mug' }, { id: 'book', text: 'book' }], items: [{ id: 't1', prompt: 'Object 1', x: 17, y: 45, correctId: 'lamp' }, { id: 't2', prompt: 'Object 2', x: 78, y: 43, correctId: 'plant' }, { id: 't3', prompt: 'Object 3', x: 52, y: 47, correctId: 'laptop' }, { id: 't4', prompt: 'Object 4', x: 76, y: 67, correctId: 'mug' }, { id: 't5', prompt: 'Object 5', x: 29, y: 70, correctId: 'book' }] },
    { label: '11 · Выбор по картинкам', version: 1, id: 'image-choice-demo', kind: 'choice', layout: 'image-grid', title: 'Which activity is not mentioned?', instruction: 'Choose one picture.', items: [{ id: 'q1', prompt: 'Choose the correct picture.', options: [{ id: 'hiking', text: 'hiking', image: 'assets/choice-hiking.svg', alt: 'A person hiking in the mountains' }, { id: 'reading', text: 'reading', image: 'assets/choice-reading.svg', alt: 'A person reading a book' }, { id: 'gardening', text: 'gardening', image: 'assets/choice-gardening.svg', alt: 'A growing plant in a pot' }, { id: 'internet', text: 'using the internet', image: 'assets/choice-laptop.svg', alt: 'A laptop computer' }], correctId: 'reading' }] }
  ];
  const kit = window.SpaceWhaleExerciseKit;
  const host = document.getElementById('exercisePreview');
  const menu = document.getElementById('templateMenu');
  const source = document.getElementById('source');
  const status = document.getElementById('importStatus');
  const attempts = new Map();
  let active;
  let instance;
  function show(def) {
    kit.validate(def);
    instance?.destroy(); active = def;
    const signature = JSON.stringify(def);
    instance = kit.mount(host, def, { answers: attempts.get(signature) || {}, onChange: answers => attempts.set(signature, answers) });
    source.value = JSON.stringify(def, null, 2);
    menu.querySelectorAll('button').forEach(button => button.setAttribute('aria-current', String(button.dataset.id === def.id)));
  }
  examples.forEach(example => {
    const button = document.createElement('button'); button.type = 'button'; button.textContent = example.label; button.dataset.id = example.id;
    button.addEventListener('click', () => { status.textContent = ''; show(example); }); menu.append(button);
  });
  document.getElementById('fontSize').addEventListener('change', event => host.style.setProperty('--ek-text-size', `${event.target.value}px`));
  document.getElementById('loadDefinition').addEventListener('click', () => {
    try { const def = JSON.parse(source.value); show(def); status.textContent = 'Структура корректна. Это только предпросмотр; публикации в библиотеку не было.'; }
    catch (error) { status.textContent = `Не загружено: ${error.message}`; }
  });
  show(examples[0]);
})();
