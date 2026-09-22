(() => {
  'use strict';

  const kit = window.SpaceWhaleExerciseKit;
  if (!kit) throw new Error('SpaceWhaleExerciseKit is required.');

  const vocabImage = 'assets/a1-2-w4-l1-vocab.svg';
  const clothes2Image = 'assets/a1-2-w4-l2-clothes.svg';
  const clothesImage = 'Clothes.png';
  const courseAudioBase = 'https://xpeywyonbapnvtjnwawi.supabase.co/storage/v1/object/public/course-audio';
  const lesson1Audio = courseAudioBase + '/a1-2/w4/l1';
  const lesson2Audio = courseAudioBase + '/a1-2/w4/l2';

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
              image: clothesImage,
              alt: 'A clothes rack with a coat, denim jacket, sweater, T-shirt and green dress',
              crop: { x: 57.5, y: 5.0, w: 40.5, h: 45.4 }
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
                  { id: 'cpw1', text: 'Jacket', image: clothesImage, alt: 'A bright yellow jacket', crop: { x: 3.0, y: 5.1, w: 15.0, h: 22.0 }, correctId: 'jacket' },
                  { id: 'cpw2', text: 'Sweater', image: clothesImage, alt: 'A dark sweater', crop: { x: 20.3, y: 5.1, w: 15.2, h: 21.2 }, correctId: 'sweater' },
                  { id: 'cpw3', text: 'T-shirt', image: clothesImage, alt: 'A simple white T-shirt', crop: { x: 3.0, y: 28.3, w: 15.0, h: 21.5 }, correctId: 'tshirt' },
                  { id: 'cpw4', text: 'Hat', image: clothesImage, alt: 'A strange purple hat', crop: { x: 37.8, y: 29.2, w: 16.4, h: 19.0 }, correctId: 'hat' }
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
                  { id: 'pw1', text: 'Bright jacket', image: clothesImage, alt: 'A very bright yellow jacket', crop: { x: 3.0, y: 5.1, w: 15.0, h: 22.0 }, correctId: 'bright' },
                  { id: 'pw2', text: 'Dark sweater', image: clothesImage, alt: 'A very dark sweater', crop: { x: 20.3, y: 5.1, w: 15.2, h: 21.2 }, correctId: 'dark' },
                  { id: 'pw3', text: 'Colorful skirt', image: clothesImage, alt: 'A skirt with many different bright colors', crop: { x: 37.8, y: 5.1, w: 15.5, h: 22.2 }, correctId: 'colorful' },
                  { id: 'pw4', text: 'Simple T-shirt', image: clothesImage, alt: 'A simple plain white T-shirt', crop: { x: 3.0, y: 28.3, w: 15.0, h: 21.5 }, correctId: 'simple' },
                  { id: 'pw5', text: 'Pretty blouse', image: clothesImage, alt: 'A pretty pink blouse', crop: { x: 20.1, y: 28.2, w: 16.6, h: 21.0 }, correctId: 'pretty' },
                  { id: 'pw6', text: 'Strange hat', image: clothesImage, alt: 'A strange purple hat', crop: { x: 37.8, y: 29.2, w: 16.4, h: 19.0 }, correctId: 'strange' }
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
                title: 'Listen and repeat.',
                instruction: '',
                items: [
                  { id: 'lr1', text: 'bright', audio: lesson1Audio + '/bright.mp3', example: 'This shirt is bright.', exampleAudio: lesson1Audio + '/this-shirt-is-bright.mp3' },
                  { id: 'lr2', text: 'dark', audio: lesson1Audio + '/dark.mp3', example: 'My coat is dark.', exampleAudio: lesson1Audio + '/my-coat-is-dark.mp3' },
                  { id: 'lr3', text: 'colorful', audio: lesson1Audio + '/colorful.mp3', example: 'Her skirt is colorful.', exampleAudio: lesson1Audio + '/her-skirt-is-colorful.mp3' },
                  { id: 'lr4', text: 'simple', audio: lesson1Audio + '/simple.mp3', example: 'This dress is simple.', exampleAudio: lesson1Audio + '/this-dress-is-simple.mp3' },
                  { id: 'lr5', text: 'pretty', audio: lesson1Audio + '/pretty.mp3', example: 'The blouse is pretty.', exampleAudio: lesson1Audio + '/the-blouse-is-pretty.mp3' },
                  { id: 'lr6', text: 'strange', audio: lesson1Audio + '/strange.mp3', example: 'That hat is strange.', exampleAudio: lesson1Audio + '/that-hat-is-strange.mp3' }
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
              text: 'very / really + adjective — признак выражен сильно.\na little / a bit + adjective — признак выражен немного.\ntoo + adjective — признак сильнее, чем нужно или подходит в ситуации.',
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
              image: clothesImage,
              alt: 'Clothes laid out on a wooden surface for writing practice',
              crop: { x: 1.7, y: 58.0, w: 30.3, h: 37.8 }
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
              image: clothesImage,
              alt: 'Six clothes showing bright, dark, colorful, simple, pretty and strange styles',
              crop: { x: 1.7, y: 4.8, w: 52.5, h: 45.5 }
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


  const lesson2 = {
    id: 'a1-2-w4-l2',
    title: 'Описываем внешний вид одежды',
    level: 'A1.2',
    whale: 4,
    stages: [
      {
        menu: 'Opening Speaking',
        section: 'tasks',
        guide: {
          aim: 'Войти в ситуацию урока: одежда и внешний вид, без проверки нового материала.',
          time: '2 min'
        },
        exercise: {
          version: 1,
          id: 'a12w4l2-opening',
          kind: 'presentation',
          title: 'Talk about clothes.',
          instruction: '',
          blocks: [
            {
              type: 'text',
              text: '1. What clothes do you know in English?\n2. What clothes do you wear often?\n3. What clothes do you like?'
            }
          ]
        }
      },
      {
        menu: 'New Words',
        section: 'tasks',
        guide: {
          aim: 'Познакомиться с six clothing words текущего урока.',
          tl: 'coat, sweater, blouse, skirt, suit, hat',
          time: '4 min'
        },
        exercise: {
          version: 1,
          id: 'a12w4l2-picture-word',
          kind: 'matching',
          layout: 'picture-word',
          title: 'Match the pictures with the words.',
          instruction: 'Click the box and choose the correct word.',
          items: [
            { id: 'pw1', text: 'coat', image: clothesImage, alt: 'A brown coat', crop: { x: 34.0, y: 58.3, w: 10.8, h: 21.5 }, correctId: 'coat' },
            { id: 'pw2', text: 'sweater', image: clothesImage, alt: 'A cream sweater', crop: { x: 45.0, y: 58.4, w: 11.2, h: 17.2 }, correctId: 'sweater' },
            { id: 'pw3', text: 'blouse', image: clothesImage, alt: 'A blue blouse', crop: { x: 56.5, y: 58.3, w: 11.0, h: 18.2 }, correctId: 'blouse' },
            { id: 'pw4', text: 'skirt', image: clothesImage, alt: 'A pink skirt', crop: { x: 33.8, y: 79.0, w: 12.0, h: 15.2 }, correctId: 'skirt' },
            { id: 'pw5', text: 'suit', image: clothesImage, alt: 'A dark blue suit', crop: { x: 45.5, y: 74.7, w: 10.5, h: 23.0 }, correctId: 'suit' },
            { id: 'pw6', text: 'hat', image: clothesImage, alt: 'A straw hat with a black bow', crop: { x: 56.5, y: 78.8, w: 12.5, h: 14.0 }, correctId: 'hat' }
          ],
          options: [
            { id: 'suit', text: 'suit' },
            { id: 'coat', text: 'coat' },
            { id: 'hat', text: 'hat' },
            { id: 'blouse', text: 'blouse' },
            { id: 'sweater', text: 'sweater' },
            { id: 'skirt', text: 'skirt' }
          ]
        }
      },
      {
        menu: 'Pronunciation + fixation',
        section: 'tasks',
        guide: {
          aim: 'Закрепить звучание новых Words и их русские значения, не вводя новую Grammar раньше времени.',
          tl: 'coat, sweater, blouse, skirt, suit, hat',
          time: '4 min'
        },
        exercise: {
          version: 1,
          id: 'a12w4l2-pronunciation',
          kind: 'rule-page',
          title: 'Pronunciation + fixation',
          instruction: '',
          blocks: [
            {
              type: 'exercise',
              id: 'listen-repeat',
              exercise: {
                version: 1,
                id: 'a12w4l2-listen-repeat',
                kind: 'audio',
                layout: 'listen-repeat',
                title: 'Listen and repeat.',
                instruction: '',
                items: [
                  { id: 'lr1', text: 'coat', audio: lesson2Audio + '/coat.mp3', example: 'This is a coat.', exampleAudio: lesson2Audio + '/this-is-a-coat.mp3' },
                  { id: 'lr2', text: 'sweater', audio: lesson2Audio + '/sweater.mp3', example: 'This is a sweater.', exampleAudio: lesson2Audio + '/this-is-a-sweater.mp3' },
                  { id: 'lr3', text: 'blouse', audio: lesson2Audio + '/blouse.mp3', example: 'This is a blouse.', exampleAudio: lesson2Audio + '/this-is-a-blouse.mp3' },
                  { id: 'lr4', text: 'skirt', audio: lesson2Audio + '/skirt.mp3', example: 'This is a skirt.', exampleAudio: lesson2Audio + '/this-is-a-skirt.mp3' },
                  { id: 'lr5', text: 'suit', audio: lesson2Audio + '/suit.mp3', example: 'This is a suit.', exampleAudio: lesson2Audio + '/this-is-a-suit.mp3' },
                  { id: 'lr6', text: 'hat', audio: lesson2Audio + '/hat.mp3', example: 'This is a hat.', exampleAudio: lesson2Audio + '/this-is-a-hat.mp3' }
                ]
              }
            },
            {
              type: 'exercise',
              id: 'translation',
              exercise: {
                version: 1,
                id: 'a12w4l2-translation',
                kind: 'matching',
                layout: 'word-definition',
                title: 'Match the words with the Russian meanings.',
                instruction: 'Make six pairs.',
                items: [
                  { id: 'tr1', text: 'coat', correctId: 'coat-ru' },
                  { id: 'tr2', text: 'sweater', correctId: 'sweater-ru' },
                  { id: 'tr3', text: 'blouse', correctId: 'blouse-ru' },
                  { id: 'tr4', text: 'skirt', correctId: 'skirt-ru' },
                  { id: 'tr5', text: 'suit', correctId: 'suit-ru' },
                  { id: 'tr6', text: 'hat', correctId: 'hat-ru' }
                ],
                options: [
                  { id: 'hat-ru', text: 'шляпа' },
                  { id: 'suit-ru', text: 'костюм' },
                  { id: 'sweater-ru', text: 'свитер' },
                  { id: 'skirt-ru', text: 'юбка' },
                  { id: 'coat-ru', text: 'пальто' },
                  { id: 'blouse-ru', text: 'блузка' }
                ]
              }
            }
          ]
        }
      },
      {
        menu: 'First Context',
        section: 'tasks',
        guide: {
          aim: 'Впервые встретить look/looks + adjective и look/looks like + noun в понятной ситуации.',
          tl: 'looks + adjective; looks like + noun',
          time: '3 min'
        },
        exercise: {
          version: 1,
          id: 'a12w4l2-context',
          kind: 'rule-page',
          title: 'Read the dialogue.',
          instruction: '',
          blocks: [
            {
              type: 'text',
              text: 'Anna: Look at this blouse.\nTom: It looks nice.\nAnna: What does it look like?\nTom: It looks like a shirt.\n\nAnna: And this hat?\nTom: It looks strange.\nAnna: What does it look like?\nTom: It looks like a flower.',
              highlights: ['looks nice', 'What does it look like?', 'looks like a shirt', 'looks strange', 'looks like a flower']
            },
            {
              type: 'exercise',
              id: 'notice-models',
              exercise: {
                version: 1,
                id: 'a12w4l2-context-choice',
                kind: 'gaps',
                inputMode: 'select',
                title: 'Choose.',
                instruction: 'Choose the correct option in each sentence.',
                items: [
                  { id: 'c1', segments: ['The blouse ', { id: 'c1g', answers: ['looks'], options: ['looks', 'looks like'] }, ' nice.'] },
                  { id: 'c2', segments: ['The blouse ', { id: 'c2g', answers: ['looks like'], options: ['looks', 'looks like'] }, ' a shirt.'] },
                  { id: 'c3', segments: ['The hat ', { id: 'c3g', answers: ['looks'], options: ['looks like', 'looks'] }, ' strange.'] },
                  { id: 'c4', segments: ['The hat ', { id: 'c4g', answers: ['looks like'], options: ['looks', 'looks like'] }, ' a flower.'] }
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
          aim: 'Понять разницу двух моделей, look/looks по subject, два вопроса, do/does и a/an после like.',
          tl: 'look/looks + adjective; look/looks like + noun; How does it look?; What does it look like?; do/does; a/an',
          time: '6 min'
        },
        exercise: {
          version: 1,
          id: 'a12w4l2-discovery',
          kind: 'rule-page',
          title: 'Discovery + Rule',
          instruction: '',
          blocks: [
            {
              type: 'text',
              title: 'Посмотри на примеры.',
              text: 'The blouse looks nice.\nThe blouse looks like a shirt.\nThe hat looks strange.\nThe hat looks like a flower.',
              highlights: ['looks nice', 'looks like a shirt', 'looks strange', 'looks like a flower']
            },
            {
              type: 'exercise',
              id: 'discover-difference',
              exercise: {
                version: 1,
                id: 'a12w4l2-discover-difference',
                kind: 'gaps',
                inputMode: 'select',
                title: 'Complete the rule.',
                instruction: 'Выбери вариант прямо в пропуске.',
                items: [
                  { id: 'd1', segments: ['Если после look / looks идёт описание предмета, используем ', { id: 'd1g', answers: ['adjective'], options: ['adjective', 'noun'] }, '.'] },
                  { id: 'd2', segments: ['Если говорим, на что предмет похож, используем look / looks ', { id: 'd2g', answers: ['like'], options: ['like', 'at'] }, ' + noun.'] },
                  { id: 'd3', segments: ['С it / one thing используем ', { id: 'd3g', answers: ['looks'], options: ['looks', 'look'] }, '.'] },
                  { id: 'd4', segments: ['С they / several things используем ', { id: 'd4g', answers: ['look'], options: ['look', 'looks'] }, '.'] }
                ]
              }
            },
            {
              type: 'exercise',
              id: 'question-meaning',
              exercise: {
                version: 1,
                id: 'a12w4l2-question-meaning',
                kind: 'matching',
                title: 'Match the question with the type of answer.',
                instruction: 'Make two pairs.',
                items: [
                  { id: 'q1', text: 'How does it look?', correctId: 'b' },
                  { id: 'q2', text: 'What does it look like?', correctId: 'a' }
                ],
                options: [
                  { id: 'a', text: 'It looks like a shirt.' },
                  { id: 'b', text: 'It looks nice.' }
                ]
              }
            },
            {
              type: 'rule',
              title: 'look / looks + adjective',
              text: 'Используем, когда говорим, каким выглядит предмет.',
              examples: ['The coat looks nice.', 'The hats look strange.']
            },
            {
              type: 'rule',
              title: 'look / looks like + noun',
              text: 'Используем, когда говорим, на что предмет похож.',
              examples: ['The blouse looks like a shirt.', 'The hat looks like a flower.']
            },
            {
              type: 'rule',
              title: 'look / looks',
              formula: 'it / the coat → looks\nthey / the coats → look'
            },
            {
              type: 'rule',
              title: 'Questions',
              text: 'How does it look? → Как это выглядит?\nWhat does it look like? → На что это похоже?\n\nОдин предмет: does\nНесколько предметов: do'
            },
            {
              type: 'rule',
              title: 'After like',
              text: 'Перед одним исчисляемым существительным нужен a/an.',
              examples: ['It looks like a coat.', 'It looks like an old coat.']
            }
          ]
        }
      },
      {
        menu: 'Controlled Practice',
        section: 'tasks',
        guide: {
          aim: 'Различать две конструкции, выбирать нужный вопрос и закрепить do/does с порядком слов.',
          time: '6 min'
        },
        exercise: {
          version: 1,
          id: 'a12w4l2-controlled',
          kind: 'rule-page',
          title: 'Controlled Practice',
          instruction: '',
          blocks: [
            {
              type: 'exercise',
              id: 'fox',
              exercise: {
                version: 1,
                id: 'a12w4l2-fox',
                kind: 'gaps',
                inputMode: 'select',
                title: 'Choose the correct option.',
                instruction: 'Choose the correct form in each sentence.',
                items: [
                  { id: 'f1', segments: ['The coat ', { id: 'f1g', answers: ['looks'], options: ['looks like', 'looks'] }, ' nice.'] },
                  { id: 'f2', segments: ['This sweater ', { id: 'f2g', answers: ['looks like'], options: ['looks like', 'looks'] }, ' a coat.'] },
                  { id: 'f3', segments: ['The blouse ', { id: 'f3g', answers: ['looks'], options: ['looks', 'looks like'] }, ' pretty.'] },
                  { id: 'f4', segments: ['This skirt ', { id: 'f4g', answers: ['looks like'], options: ['looks', 'looks like'] }, ' a dress.'] },
                  { id: 'f5', segments: ['The suit ', { id: 'f5g', answers: ['looks'], options: ['looks like', 'looks'] }, ' good.'] },
                  { id: 'f6', segments: ['This hat ', { id: 'f6g', answers: ['looks like'], options: ['looks like', 'looks'] }, ' a flower.'] }
                ]
              }
            },
            {
              type: 'exercise',
              id: 'choose-question',
              exercise: {
                version: 1,
                id: 'a12w4l2-choose-question',
                kind: 'gaps',
                inputMode: 'select',
                title: 'Choose the question.',
                instruction: 'Choose the question first, then read the answer.',
                items: [
                  { id: 'qq1', segments: [{ id: 'qq1g', answers: ['How does it look?'], options: ['What does it look like?', 'How does it look?'] }, ' — It looks nice.'] },
                  { id: 'qq2', segments: [{ id: 'qq2g', answers: ['What does it look like?'], options: ['What does it look like?', 'How does it look?'] }, ' — It looks like a dress.'] },
                  { id: 'qq3', segments: [{ id: 'qq3g', answers: ['How does it look?'], options: ['How does it look?', 'What does it look like?'] }, ' — It looks strange.'] },
                  { id: 'qq4', segments: [{ id: 'qq4g', answers: ['What does it look like?'], options: ['How does it look?', 'What does it look like?'] }, ' — It looks like a shirt.'] }
                ]
              }
            },
            {
              type: 'exercise',
              id: 'unscramble-1',
              exercise: {
                version: 1,
                id: 'a12w4l2-unscramble-1',
                kind: 'order',
                title: '1. Put the words in order.',
                instruction: 'Build the question.',
                tokens: [
                  { id: 'u1a', text: 'does' },
                  { id: 'u1b', text: 'the coat' },
                  { id: 'u1c', text: 'How' },
                  { id: 'u1d', text: 'look' },
                  { id: 'u1e', text: '?' }
                ],
                correctOrder: ['u1c','u1a','u1b','u1d','u1e']
              }
            },
            {
              type: 'exercise',
              id: 'unscramble-2',
              exercise: {
                version: 1,
                id: 'a12w4l2-unscramble-2',
                kind: 'order',
                title: '2. Put the words in order.',
                instruction: 'Build the question.',
                tokens: [
                  { id: 'u2a', text: 'look' },
                  { id: 'u2b', text: 'What' },
                  { id: 'u2c', text: 'the blouse' },
                  { id: 'u2d', text: 'does' },
                  { id: 'u2e', text: 'like' },
                  { id: 'u2f', text: '?' }
                ],
                correctOrder: ['u2b','u2d','u2c','u2a','u2e','u2f']
              }
            },
            {
              type: 'exercise',
              id: 'unscramble-3',
              exercise: {
                version: 1,
                id: 'a12w4l2-unscramble-3',
                kind: 'order',
                title: '3. Put the words in order.',
                instruction: 'Build the question.',
                tokens: [
                  { id: 'u3a', text: 'the hats' },
                  { id: 'u3b', text: 'How' },
                  { id: 'u3c', text: 'do' },
                  { id: 'u3d', text: 'look' },
                  { id: 'u3e', text: '?' }
                ],
                correctOrder: ['u3b','u3c','u3a','u3d','u3e']
              }
            },
            {
              type: 'exercise',
              id: 'unscramble-4',
              exercise: {
                version: 1,
                id: 'a12w4l2-unscramble-4',
                kind: 'order',
                title: '4. Put the words in order.',
                instruction: 'Build the question.',
                tokens: [
                  { id: 'u4a', text: 'do' },
                  { id: 'u4b', text: 'the suits' },
                  { id: 'u4c', text: 'What' },
                  { id: 'u4d', text: 'look' },
                  { id: 'u4e', text: 'like' },
                  { id: 'u4f', text: '?' }
                ],
                correctOrder: ['u4c','u4a','u4b','u4d','u4e','u4f']
              }
            }
          ]
        }
      },
      {
        menu: 'a / an',
        section: 'tasks',
        guide: {
          aim: 'Проверить наличие и выбор article после like.',
          time: '2 min'
        },
        exercise: {
          version: 1,
          id: 'a12w4l2-articles',
          kind: 'gaps',
          inputMode: 'select',
          title: 'Choose the correct option.',
          instruction: 'Choose a, an or —.',
          items: [
            { id: 'a1', segments: ['It looks like ', { id: 'a1g', answers: ['a'], options: ['a', '—'] }, ' coat.'] },
            { id: 'a2', segments: ['It looks like ', { id: 'a2g', answers: ['a'], options: ['—', 'a'] }, ' skirt.'] },
            { id: 'a3', segments: ['It looks like ', { id: 'a3g', answers: ['an'], options: ['an', 'a'] }, ' old coat.'] },
            { id: 'a4', segments: ['It looks like ', { id: 'a4g', answers: ['a'], options: ['a', '—'] }, ' suit.'] }
          ]
        }
      },
      {
        menu: 'Write two sentences',
        section: 'tasks',
        guide: {
          aim: 'Самостоятельно построить обе модели по prompts.',
          time: '3 min'
        },
        exercise: {
          version: 1,
          id: 'a12w4l2-writing',
          kind: 'rule-page',
          title: 'Write two sentences.',
          instruction: 'Use the prompts.',
          blocks: [
            {
              type: 'text',
              text: '1. blouse → nice\nblouse → shirt\n\n2. hat → strange\nhat → flower\n\n3. sweater → good\nsweater → coat'
            },
            {
              type: 'exercise',
              id: 'production',
              exercise: {
                version: 1,
                id: 'a12w4l2-writing-production',
                kind: 'writing',
                title: 'Write two sentences for each set.',
                instruction: '',
                items: [
                  { id: 'w1', prompt: '1. The blouse ... / It ...' },
                  { id: 'w2', prompt: '2. The hat ... / It ...' },
                  { id: 'w3', prompt: '3. The sweater ... / It ...' }
                ]
              }
            }
          ]
        }
      },
      {
        menu: 'Final Speaking',
        section: 'tasks',
        guide: {
          aim: 'Назвать вещь, описать её внешний вид и сказать, на что она похожа.',
          time: '4 min'
        },
        exercise: {
          version: 1,
          id: 'a12w4l2-final-speaking',
          kind: 'presentation',
          title: 'Look at the clothes and talk about them.',
          instruction: '',
          blocks: [
            {
              type: 'image',
              image: clothesImage,
              alt: 'Six clothes for speaking practice: coat, sweater, blouse, skirt, suit and hat',
              crop: { x: 70.7, y: 58.0, w: 29.0, h: 39.5 }
            },
            {
              type: 'text',
              text: 'For each picture:\n\nWhat is it?\nIt’s a ...\n\nHow does it look?\nIt looks ...\n\nWhat does it look like?\nIt looks like a/an ...\n\nThen change roles: ask the questions and listen to the answers.'
            }
          ]
        }
      },
      {
        menu: 'Homework 1',
        section: 'self-study',
        guide: {
          aim: 'Перевести предложения с look/looks + adjective.',
          time: 'Self study'
        },
        exercise: {
          version: 1,
          id: 'a12w4l2-homework-1',
          kind: 'writing',
          title: 'Translate into English.',
          instruction: '',
          items: [
            { id: 'h1', prompt: 'Это пальто выглядит хорошо.' },
            { id: 'h2', prompt: 'Эта блузка выглядит красивой.' },
            { id: 'h3', prompt: 'Эта шляпа выглядит странно.' },
            { id: 'h4', prompt: 'Эти костюмы выглядят хорошо.' },
            { id: 'h5', prompt: 'Эти юбки выглядят странно.' }
          ]
        }
      },
      {
        menu: 'Homework 2',
        section: 'self-study',
        guide: {
          aim: 'Перевести look like и два типа вопросов.',
          time: 'Self study'
        },
        exercise: {
          version: 1,
          id: 'a12w4l2-homework-2',
          kind: 'writing',
          title: 'Translate into English.',
          instruction: '',
          items: [
            { id: 'h1', prompt: 'Эта блузка похожа на рубашку.' },
            { id: 'h2', prompt: 'Эта шляпа похожа на цветок.' },
            { id: 'h3', prompt: 'Как это выглядит?' },
            { id: 'h4', prompt: 'На что это похоже?' },
            { id: 'h5', prompt: 'На что похожи эти пальто?' }
          ]
        }
      }
    ]
  };

  [lesson, lesson2].forEach(item => item.stages.forEach(stage => kit.validate(stage.exercise)));
  window.SpaceWhaleContent = window.SpaceWhaleContent || [];
  window.SpaceWhaleContent.push(lesson, lesson2);
})();