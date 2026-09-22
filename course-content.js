(() => {
  'use strict';

  const kit = window.SpaceWhaleExerciseKit;
  if (!kit) throw new Error('SpaceWhaleExerciseKit is required.');

  const vocabImage = 'assets/a1-2-w4-l1-vocab.svg';

  const lesson = {
    id: 'a1-2-w4-l1',
    title: 'Описываем одежду',
    level: 'A1.2',
    whale: 4,
    stages: [
      {
        menu: 'Opening Speaking',
        section: 'tasks',
        guide: {
          aim: 'Войти в тему одежды и активировать знакомые названия одежды и цветов.',
          time: '3 min'
        },
        exercise: {
          version: 1,
          id: 'a12w4l1-opening',
          kind: 'presentation',
          title: 'Look at the clothes and talk about them.',
          instruction: '',
          blocks: [
            {
              type: 'image',
              image: 'assets/a1-2-w4-l1-opening.svg',
              alt: 'Four different clothes: a blue dress, a pink shirt, a green skirt and a brown jacket'
            },
            {
              type: 'text',
              text: '1. What clothes can you see?\n2. What colors can you see?\n3. Which one do you like?\n4. Which one don’t you like?'
            },
            {
              type: 'disclosure',
              title: 'Possible answers',
              text: 'I like the blue dress.\nI don’t like the green jacket.'
            }
          ]
        }
      },
      {
        menu: 'Words',
        section: 'tasks',
        guide: {
          aim: 'Сначала закрепить четыре нужных названия одежды, затем понять и начать извлекать из памяти bright, dark, colorful, simple, pretty, strange.',
          tl: 'jacket, sweater, T-shirt, hat; bright, dark, colorful, simple, pretty, strange',
          time: '7 min'
        },
        exercise: {
          version: 1,
          id: 'a12w4l1-words',
          kind: 'rule-page',
          title: 'Words',
          instruction: '',
          blocks: [
            {
              type: 'exercise',
              id: 'clothes-picture-word',
              exercise: {
                version: 1,
                id: 'a12w4l1-clothes-picture-word',
                kind: 'matching',
                layout: 'picture-word',
                title: 'Match the pictures with the words.',
                instruction: 'Сначала закрепи названия одежды.',
                items: [
                  { id: 'cpw1', text: 'Jacket', image: vocabImage, alt: 'A jacket', crop: { x: 0, y: 0, w: 33.333, h: 50 }, correctId: 'jacket' },
                  { id: 'cpw2', text: 'Sweater', image: vocabImage, alt: 'A sweater', crop: { x: 33.333, y: 0, w: 33.333, h: 50 }, correctId: 'sweater' },
                  { id: 'cpw3', text: 'T-shirt', image: vocabImage, alt: 'A plain T-shirt', crop: { x: 0, y: 50, w: 33.333, h: 50 }, correctId: 'tshirt' },
                  { id: 'cpw4', text: 'Hat', image: vocabImage, alt: 'A hat', crop: { x: 66.667, y: 50, w: 33.333, h: 50 }, correctId: 'hat' }
                ],
                options: [
                  { id: 'sweater', text: 'sweater' },
                  { id: 'hat', text: 'hat' },
                  { id: 'jacket', text: 'jacket' },
                  { id: 'tshirt', text: 'T-shirt' }
                ]
              }
            },
            {
              type: 'exercise',
              id: 'picture-word',
              exercise: {
                version: 1,
                id: 'a12w4l1-picture-word',
                kind: 'matching',
                layout: 'picture-word',
                title: 'Match the pictures with the words.',
                instruction: 'Click the box and choose the correct word.',
                items: [
                  { id: 'pw1', text: 'Bright jacket', image: vocabImage, alt: 'A very bright neon orange jacket', crop: { x: 0, y: 0, w: 33.333, h: 50 }, correctId: 'bright' },
                  { id: 'pw2', text: 'Dark sweater', image: vocabImage, alt: 'A very dark navy sweater', crop: { x: 33.333, y: 0, w: 33.333, h: 50 }, correctId: 'dark' },
                  { id: 'pw3', text: 'Colorful skirt', image: vocabImage, alt: 'A skirt with many different bright colors', crop: { x: 66.667, y: 0, w: 33.333, h: 50 }, correctId: 'colorful' },
                  { id: 'pw4', text: 'Simple T-shirt', image: vocabImage, alt: 'A simple plain T-shirt with no print or decoration', crop: { x: 0, y: 50, w: 33.333, h: 50 }, correctId: 'simple' },
                  { id: 'pw5', text: 'Pretty blouse', image: vocabImage, alt: 'A neat attractive pink blouse', crop: { x: 33.333, y: 50, w: 33.333, h: 50 }, correctId: 'pretty' },
                  { id: 'pw6', text: 'Strange hat', image: vocabImage, alt: 'A hat with a clearly unusual shape and design', crop: { x: 66.667, y: 50, w: 33.333, h: 50 }, correctId: 'strange' }
                ],
                options: [
                  { id: 'strange', text: 'strange' },
                  { id: 'bright', text: 'bright' },
                  { id: 'simple', text: 'simple' },
                  { id: 'colorful', text: 'colorful' },
                  { id: 'pretty', text: 'pretty' },
                  { id: 'dark', text: 'dark' }
                ]
              }
            },
            {
              type: 'exercise',
              id: 'word-definition',
              exercise: {
                version: 1,
                id: 'a12w4l1-word-definition',
                kind: 'matching',
                layout: 'word-definition',
                title: 'Match the descriptions with the words.',
                instruction: 'Прочитай описание и выбери английское слово.',
                items: [
                  { id: 'wd1', text: 'яркий, насыщенный по цвету', correctId: 'bright' },
                  { id: 'wd2', text: 'тёмный по цвету', correctId: 'dark' },
                  { id: 'wd3', text: 'разноцветный, с большим количеством цветов', correctId: 'colorful' },
                  { id: 'wd4', text: 'простой, без лишних деталей', correctId: 'simple' },
                  { id: 'wd5', text: 'симпатичный, красивый на вид', correctId: 'pretty' },
                  { id: 'wd6', text: 'странный, необычный', correctId: 'strange' }
                ],
                options: [
                  { id: 'simple', text: 'simple' },
                  { id: 'pretty', text: 'pretty' },
                  { id: 'dark', text: 'dark' },
                  { id: 'strange', text: 'strange' },
                  { id: 'bright', text: 'bright' },
                  { id: 'colorful', text: 'colorful' }
                ]
              }
            },
            {
              type: 'exercise',
              id: 'listen-repeat',
              exercise: {
                version: 1,
                id: 'a12w4l1-listen-repeat',
                kind: 'audio',
                layout: 'listen-repeat',
                audioPending: true,
                title: 'Listen and repeat.',
                instruction: '',
                items: [
                  { id: 'lr1', text: 'bright', audio: null, example: 'This shirt is bright.', exampleAudio: null },
                  { id: 'lr2', text: 'dark', audio: null, example: 'My coat is dark.', exampleAudio: null },
                  { id: 'lr3', text: 'colorful', audio: null, example: 'Her skirt is colorful.', exampleAudio: null },
                  { id: 'lr4', text: 'simple', audio: null, example: 'This dress is simple.', exampleAudio: null },
                  { id: 'lr5', text: 'pretty', audio: null, example: 'The blouse is pretty.', exampleAudio: null },
                  { id: 'lr6', text: 'strange', audio: null, example: 'That hat is strange.', exampleAudio: null }
                ]
              }
            }
          ]
        }
      },
      {
        menu: 'Context',
        section: 'tasks',
        guide: {
          aim: 'Показать degree modifiers в естественном разговоре на уже знакомой лексике.',
          tl: 'really, very, a little, a bit, too',
          time: '3 min'
        },
        exercise: {
          version: 1,
          id: 'a12w4l1-context',
          kind: 'rule-page',
          title: 'Read the dialogue. Which clothes does Anna like?',
          instruction: '',
          blocks: [
            {
              type: 'text',
              text: 'Tom: What do you think of this jacket?\nAnna: It’s really pretty, but it’s a little bright.\n\nTom: What about this dark sweater?\nAnna: I like it. It’s very simple.\n\nTom: And this colorful jacket?\nAnna: Hmm. It’s too colorful for me.\n\nTom: What about this hat?\nAnna: It’s a bit strange, but I like it.',
              highlights: ['really pretty', 'a little bright', 'very simple', 'too colorful', 'a bit strange']
            },
            {
              type: 'exercise',
              id: 'short-check',
              exercise: {
                version: 1,
                id: 'a12w4l1-context-check',
                kind: 'writing',
                title: 'Which clothes does Anna like?',
                instruction: 'Write one short answer.',
                items: [
                  { id: 'answer', prompt: 'Anna likes ...' }
                ]
              }
            }
          ]
        }
      },
      {
        menu: 'Discovery + Rule',
        section: 'tasks',
        guide: {
          aim: 'Понять значения степени и форму modifier + adjective.',
          tl: 'very / really; a little / a bit; too + adjective',
          time: '5 min'
        },
        exercise: {
          version: 1,
          id: 'a12w4l1-discovery',
          kind: 'rule-page',
          title: 'Discover the rule',
          instruction: '',
          blocks: [
            {
              type: 'text',
              title: 'Look at the model phrases.',
              text: 'really pretty\na little bright\nvery simple\ntoo colorful\na bit strange',
              highlights: ['really pretty', 'a little bright', 'very simple', 'too colorful', 'a bit strange']
            },
            {
              type: 'exercise',
              id: 'meaning',
              exercise: {
                version: 1,
                id: 'a12w4l1-discovery-meaning',
                kind: 'matching',
                title: 'Match the groups with their meanings.',
                instruction: 'Соедини английские группы с их значениями.',
                items: [
                  { id: 'm1', text: 'very / really', correctId: 'b' },
                  { id: 'm2', text: 'a little / a bit', correctId: 'c' },
                  { id: 'm3', text: 'too', correctId: 'a' }
                ],
                options: [
                  { id: 'a', text: 'признак сильнее, чем нужно или подходит' },
                  { id: 'b', text: 'признак выражен сильно' },
                  { id: 'c', text: 'признак выражен немного' }
                ]
              }
            },
            {
              type: 'exercise',
              id: 'complete-rule',
              exercise: {
                version: 1,
                id: 'a12w4l1-complete-rule',
                kind: 'gaps',
                inputMode: 'select',
                title: 'Complete the rule.',
                instruction: 'Выбери вариант прямо в пропуске.',
                items: [
                  { id: 'r1', segments: ['Very и really показывают ', { id: 'r1g', answers: ['сильную'], options: ['сильную', 'небольшую'] }, ' степень признака.'] },
                  { id: 'r2', segments: ['A little и a bit показывают ', { id: 'r2g', answers: ['небольшую'], options: ['сильную', 'небольшую'] }, ' степень признака.'] },
                  { id: 'r3', segments: ['Too значит, что признак ', { id: 'r3g', answers: ['сильнее, чем нужно'], options: ['сильнее, чем нужно', 'выражен совсем немного'] }, '.'] },
                  { id: 'r4', segments: ['Модификатор ставится ', { id: 'r4g', answers: ['перед'], options: ['перед', 'после'] }, ' прилагательным.'] },
                  { id: 'r5', segments: ['A little и a bit состоят из ', { id: 'r5g', answers: ['двух слов'], options: ['одного слова', 'двух слов'] }, '.'] }
                ]
              }
            },
            {
              type: 'rule',
              title: 'Rule',
              text: 'very / really + adjective — the quality is strong.\na little / a bit + adjective — the quality is present in a small amount.\ntoo + adjective — the quality is stronger than you want, need or find suitable.',
              formula: 'modifier + adjective',
              examples: ['very bright', 'really pretty', 'a little dark', 'a bit strange', 'too bright', 'too colorful']
            }
          ]
        }
      },
      {
        menu: 'Form',
        section: 'tasks',
        guide: {
          aim: 'Закрепить порядок слов и цельность a little / a bit.',
          time: '3 min'
        },
        exercise: {
          version: 1,
          id: 'a12w4l1-form',
          kind: 'sort',
          title: 'Sort the phrases into two groups.',
          instruction: 'Choose Correct or Incorrect for each phrase.',
          groups: [
            { id: 'correct', text: 'Correct' },
            { id: 'incorrect', text: 'Incorrect' }
          ],
          items: [
            { id: 's1', text: 'really pretty', correctId: 'correct' },
            { id: 's2', text: 'bright very', correctId: 'incorrect' },
            { id: 's3', text: 'a little dark', correctId: 'correct' },
            { id: 's4', text: 'strange a bit', correctId: 'incorrect' },
            { id: 's5', text: 'too colorful', correctId: 'correct' },
            { id: 's6', text: 'simple really', correctId: 'incorrect' },
            { id: 's7', text: 'a bit strange', correctId: 'correct' },
            { id: 's8', text: 'very bright', correctId: 'correct' }
          ]
        }
      },
      {
        menu: 'Meaning',
        section: 'tasks',
        guide: {
          aim: 'Выбирать modifier по смыслу контекста.',
          time: '4 min'
        },
        exercise: {
          version: 1,
          id: 'a12w4l1-meaning',
          kind: 'gaps',
          inputMode: 'select',
          title: 'Choose the correct option.',
          instruction: 'Open the choice inside each sentence.',
          items: [
            { id: 'g1', segments: ['I like this jacket, but the color is stronger than I want. It is ', {id:'g1a',answers:['too'],options:['too','very']}, ' bright for me.'] },
            { id: 'g2', segments: ['This sweater is dark, but only a little. It is ', {id:'g2a',answers:['a little'],options:['a little','really']}, ' dark.'] },
            { id: 'g3', segments: ['I love this blouse. It is ', {id:'g3a',answers:['really'],options:['really','too']}, ' pretty.'] },
            { id: 'g4', segments: ['The hat is unusual, but only a bit. It is ', {id:'g4a',answers:['a bit'],options:['a bit','too']}, ' strange.'] },
            { id: 'g5', segments: ['This skirt has many strong colors, and I love them. It is ', {id:'g5a',answers:['really'],options:['really','a little']}, ' colorful.'] },
            { id: 'g6', segments: ['I need simple clothes for work. This jacket has many bright colors and big patterns. It is ', {id:'g6a',answers:['too'],options:['too','a bit']}, ' colorful for work.'] }
          ]
        }
      },
      {
        menu: 'Writing',
        section: 'tasks',
        guide: {
          aim: 'Самостоятельно построить modifier + adjective с заданным типом значения.',
          time: '2 min'
        },
        exercise: {
          version: 1,
          id: 'a12w4l1-writing',
          kind: 'rule-page',
          title: 'Write one sentence about each picture.',
          instruction: '',
          blocks: [
            {
              type: 'image',
              image: 'assets/a1-2-w4-l1-writing.svg',
              alt: 'Three clothes: a bright green jacket, a slightly unusual purple skirt and a colorful office suit'
            },
            {
              type: 'exercise',
              id: 'sentences',
              exercise: {
                version: 1,
                id: 'a12w4l1-writing-sentences',
                kind: 'writing',
                title: 'Write one sentence about each picture.',
                instruction: '',
                items: [
                  { id: 'w1', prompt: '1. Use very or really.' },
                  { id: 'w2', prompt: '2. Use a little or a bit.' },
                  { id: 'w3', prompt: '3. Use too.' }
                ]
              }
            },
            {
              type: 'rule',
              title: 'Possible answers',
              examples: ['The jacket is really bright.', 'The skirt is a little strange.', 'The suit is too colorful.']
            }
          ]
        }
      },
      {
        menu: 'Final Speaking',
        section: 'tasks',
        guide: {
          aim: 'Соединить Words + Grammar и описывать одежду без готового предложения.',
          time: '3 min'
        },
        exercise: {
          version: 1,
          id: 'a12w4l1-final-speaking',
          kind: 'presentation',
          title: 'Look at the clothes. Describe them.',
          instruction: '',
          blocks: [
            {
              type: 'image',
              image: vocabImage,
              alt: 'Six different clothes showing bright, dark, colorful, simple, pretty and strange styles'
            },
            {
              type: 'text',
              text: 'Which item is really or very pretty / bright / dark / simple?\n\nWhich item is a little or a bit strange / bright / dark?\n\nWhich item is too bright, too colorful or too strange for you?'
            },
            {
              type: 'disclosure',
              title: 'Useful language',
              text: 'It’s very ...\nIt’s really ...\nIt’s a little ...\nIt’s a bit ...\nIt’s too ... for me.'
            }
          ]
        }
      },
      {
        menu: 'Homework 1',
        section: 'self-study',
        guide: {
          aim: 'Перевести target-конструкции на английский.',
          time: 'Self study'
        },
        exercise: {
          version: 1,
          id: 'a12w4l1-homework-1',
          kind: 'writing',
          title: 'Translate into English.',
          instruction: '',
          items: [
            { id: 'h1', prompt: 'Эта куртка очень яркая.' },
            { id: 'h2', prompt: 'Эта юбка немного тёмная.' },
            { id: 'h3', prompt: 'Эта блузка действительно красивая.' },
            { id: 'h4', prompt: 'Эта шляпа немного странная.' },
            { id: 'h5', prompt: 'Этот костюм слишком пёстрый для меня.' }
          ]
        }
      },
      {
        menu: 'Homework 2',
        section: 'self-study',
        guide: {
          aim: 'Повторить target-конструкции в новом наборе предложений.',
          time: 'Self study'
        },
        exercise: {
          version: 1,
          id: 'a12w4l1-homework-2',
          kind: 'writing',
          title: 'Translate into English.',
          instruction: '',
          items: [
            { id: 'h1', prompt: 'Это платье очень простое.' },
            { id: 'h2', prompt: 'Эта рубашка немного яркая.' },
            { id: 'h3', prompt: 'Эта юбка действительно пёстрая.' },
            { id: 'h4', prompt: 'Эта шляпа слишком странная для меня.' },
            { id: 'h5', prompt: 'Этот свитер немного тёмный.' }
          ]
        }
      }
    ]
  };

  lesson.stages.forEach(stage => kit.validate(stage.exercise));
  window.SpaceWhaleContent = window.SpaceWhaleContent || [];
  window.SpaceWhaleContent.push(lesson);
})();