const test = require('node:test');
const assert = require('node:assert/strict');
const { validate, grade } = require('../exercise-kit.js');
const gaps = { version: 1, id: 'gaps', title: 'Test', kind: 'gaps', items: [{ id: 's1', segments: ['I ', { id: 'g1', answers: ['was'] }, ' and they ', { id: 'g2', answers: ['were'] }] }] };
const choice = { version: 1, id: 'choice', title: 'Test', kind: 'choice', items: [{ id: 'q1', prompt: 'Choose', options: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }], correctId: 'b' }] };
const copy = value => JSON.parse(JSON.stringify(value));
test('Fox reference accepts 4, 5 and 8 sentences without a fixed count', () => {
  for (const count of [4, 5, 8]) {
    const def = { version: 1, id: 'fox', kind: 'gaps', title: 'Complete', layout: 'sentences', inputMode: 'select', items: Array.from({ length: count }, (_, i) => ({ id: `s${i}`, segments: ['A longer sentence before ', { id: `g${i}`, options: ['is', 'was'], answers: ['was'] }, ' the ending.'] })) };
    const answers = Object.fromEntries(def.items.map((_, i) => [`g${i}`, 'was']));
    assert.equal(Object.keys(grade(def, answers)).length, count);
    assert.ok(Object.values(grade(def, answers)).every(result => result === 'correct'));
  }
});
test('Rabbit supports a continuous paragraph with typed bank answers', () => {
  const def = { ...copy(gaps), layout: 'paragraph', inputMode: 'text', bank: ['were', 'was'] };
  assert.equal(validate(def), def);
  assert.deepEqual(grade(def, { g1: 'was', g2: 'were' }), { g1: 'correct', g2: 'correct' });
  def.layout = 'unknown'; assert.throws(() => validate(def));
  def.layout = 'paragraph'; def.inputMode = 'unknown'; assert.throws(() => validate(def));
});
test('multiple gaps grade independently and normalize case/space', () => {
  assert.deepEqual(grade(gaps, { g1: ' WAS ', g2: 'were' }), { g1: 'correct', g2: 'correct' });
  assert.deepEqual(grade(gaps, { g1: 'were' }), { g1: 'retry', g2: 'empty' });
});
test('missing key requires review, not invented correctness', () => {
  const def = copy(gaps); delete def.items[0].segments[1].answers;
  assert.equal(grade(def, { g1: 'anything' }).g1, 'review');
});
test('choice grading and immutable source', () => {
  const before = JSON.stringify(choice);
  assert.deepEqual(grade(choice, { q1: 'b' }), { q1: 'correct' });
  assert.deepEqual(grade(choice, { q1: 'a' }), { q1: 'retry' });
  assert.equal(JSON.stringify(choice), before);
});
test('unknown and duplicate option IDs rejected', () => {
  const def = copy(choice); def.items[0].correctId = 'missing'; assert.throws(() => validate(def));
  def.items[0].correctId = 'a'; def.items[0].options[1].id = 'a'; assert.throws(() => validate(def));
});
test('duplicate and reserved gap IDs rejected', () => {
  const def = copy(gaps); def.items[0].segments[3].id = 'g1'; assert.throws(() => validate(def));
  for (const id of ['__proto__', 'constructor', 'prototype']) { def.items[0].segments[3].id = id; assert.throws(() => validate(def)); }
});
test('unsafe image URLs and missing alt rejected', () => {
  const def = copy(choice); const opt = def.items[0].options[0];
  opt.image = 'javascript:alert(1)'; opt.alt = 'Picture'; assert.throws(() => validate(def));
  opt.image = 'https://user:secret@example.test/img.png'; assert.throws(() => validate(def));
  opt.image = '/assets/img.png'; delete opt.alt; assert.throws(() => validate(def));
  opt.alt = 'Picture'; assert.equal(validate(def), def);
});
test('matching enforces one-to-one keys', () => {
  const def = { version: 1, id: 'match', title: 'Match', kind: 'matching', items: [{ id: 'a', text: 'A', correctId: 'x' }, { id: 'b', text: 'B', correctId: 'x' }], options: [{ id: 'x', text: 'X' }, { id: 'y', text: 'Y' }] };
  assert.throws(() => validate(def)); def.items[1].correctId = 'y';
  assert.deepEqual(grade(def, { a: 'x', b: 'y' }), { a: 'correct', b: 'correct' });
});
test('ordered tokens use IDs, even when labels repeat', () => {
  const def = { version: 1, id: 'order', title: 'Order', kind: 'order', tokens: [{ id: 'a', text: 'had' }, { id: 'b', text: 'had' }], correctOrder: ['a', 'b'] };
  assert.equal(grade(def, { order: ['a', 'b'] }).order, 'correct');
  assert.equal(grade(def, { order: ['b', 'a'] }).order, 'retry');
  assert.equal(grade(def, { order: ['a'] }).order, 'empty');
  def.correctOrder = ['a', 'a']; assert.throws(() => validate(def));
});
test('sort and open writing have distinct grading', () => {
  const def = { version: 1, id: 'sort', title: 'Sort', kind: 'sort', groups: [{ id: 'past', text: 'Past' }], items: [{ id: 's1', text: 'Yesterday', correctId: 'past' }] };
  assert.equal(grade(def, { s1: 'past' }).s1, 'correct');
  assert.equal(grade({ version: 1, id: 'w', title: 'Write', kind: 'writing', items: [{ id: 'w1', prompt: 'Why?' }] }, { w1: 'My answer' }).w1, 'review');
});
test('typed word bank is a hint; only dropdown options constrain accepted answers', () => {
  const def = copy(gaps); def.bank = ['be']; def.inputMode = 'text';
  assert.equal(validate(def), def);
  assert.equal(grade(def, {g1:'was',g2:'were'}).g1,'correct');
  def.inputMode = 'select'; assert.throws(() => validate(def));
  def.bank = ['was','were']; assert.equal(validate(def), def);
});

test('image-label validates coordinates and grades each target', () => {
  const def = {
    version: 1,
    id: 'image-label',
    title: 'Label the picture',
    kind: 'image-label',
    image: '/assets/image-label-demo.svg',
    alt: 'Study desk',
    options: [
      { id: 'lamp', text: 'lamp' },
      { id: 'plant', text: 'plant' }
    ],
    items: [
      { id: 't1', prompt: 'Object 1', x: 20, y: 40, correctId: 'lamp' },
      { id: 't2', prompt: 'Object 2', x: 80, y: 35, correctId: 'plant' }
    ]
  };
  assert.equal(validate(def), def);
  assert.deepEqual(grade(def, { t1: 'lamp', t2: 'plant' }), { t1: 'correct', t2: 'correct' });
  assert.deepEqual(grade(def, { t1: 'plant' }), { t1: 'retry', t2: 'empty' });

  const badX = copy(def); badX.items[0].x = 120; assert.throws(() => validate(badX));
  const duplicateAnswer = copy(def); duplicateAnswer.items[1].correctId = 'lamp'; assert.throws(() => validate(duplicateAnswer));
});

test('choice image-grid layout is validated', () => {
  const def = copy(choice);
  def.layout = 'image-grid';
  def.items[0].options[0].image = '/assets/choice-hiking.svg';
  def.items[0].options[0].alt = 'Hiking';
  assert.equal(validate(def), def);
  def.layout = 'giant-cards';
  assert.throws(() => validate(def));
});

test('picture ordering accepts image tokens and rejects unsupported layout', () => {
  const def = {
    version: 1,
    id: 'picture-order',
    title: 'Order the pictures',
    kind: 'order',
    layout: 'image-grid',
    tokens: [
      { id: 'a', text: 'A', image: '/assets/choice-hiking.svg', alt: 'Hiking' },
      { id: 'b', text: 'B', image: '/assets/choice-reading.svg', alt: 'Reading' }
    ],
    correctOrder: ['a', 'b']
  };
  assert.equal(validate(def), def);
  assert.equal(grade(def, { order: ['a', 'b'] }).order, 'correct');
  const bad = copy(def); bad.layout = 'carousel'; assert.throws(() => validate(bad));
});

test('audio Listen & Repeat requires one safe audio source per item and is not graded', () => {
  const def = {
    version: 1,
    id: 'lnr',
    title: 'Listen and repeat',
    kind: 'audio',
    layout: 'listen-repeat',
    items: [
      { id: 'a', text: 'space', audio: 'data:audio/mpeg;base64,SUQz', exampleAudio: 'data:audio/mpeg;base64,SUQz', example: 'Space is quiet.' },
      { id: 'b', text: 'a planet', audio: 'data:audio/mpeg;base64,SUQz', exampleAudio: 'data:audio/mpeg;base64,SUQz', example: 'Earth is a planet.' }
    ]
  };
  assert.equal(validate(def), def);
  assert.deepEqual(grade(def, {}), {});
  const missing = copy(def); delete missing.items[0].audio; assert.throws(() => validate(missing));
  const bad = copy(def); bad.items[0].audio = 'javascript:alert(1)'; assert.throws(() => validate(bad));
  const badLayout = copy(def); badLayout.layout = 'waveform-editor'; assert.throws(() => validate(badLayout));
});

test('picture-word matching requires images and grades through shared matching logic', () => {
  const def = {
    version: 1,
    id: 'picture-word',
    title: 'Match',
    kind: 'matching',
    layout: 'picture-word',
    items: [
      { id: 'i1', text: 'Reading picture', image: '/assets/choice-reading.svg', alt: 'Reading', correctId: 'reading' },
      { id: 'i2', text: 'Hiking picture', image: '/assets/choice-hiking.svg', alt: 'Hiking', correctId: 'hiking' }
    ],
    options: [
      { id: 'hiking', text: 'hiking' },
      { id: 'reading', text: 'reading' }
    ]
  };
  assert.equal(validate(def), def);
  assert.deepEqual(grade(def, { i1: 'reading', i2: 'hiking' }), { i1: 'correct', i2: 'correct' });
  const missingImage = copy(def); delete missingImage.items[0].image; delete missingImage.items[0].alt; assert.throws(() => validate(missingImage));
});

test('word-definition is a matching layout, not a second renderer', () => {
  const def = {
    version: 1,
    id: 'word-definition',
    title: 'Definitions',
    kind: 'matching',
    layout: 'word-definition',
    items: [{ id: 'w1', text: 'stage', correctId: 'd1' }],
    options: [{ id: 'd1', text: 'the place where actors perform' }]
  };
  assert.equal(validate(def), def);
  assert.equal(grade(def, { w1: 'd1' }).w1, 'correct');
});

test('rule-page accepts optional ordered content and nested discovery exercises', () => {
  const def = {
    version: 1,
    id: 'rule-page',
    title: 'Grammar',
    kind: 'rule-page',
    blocks: [
      { type: 'text', title: 'Look', text: 'It is easy to get there.' },
      {
        type: 'exercise',
        id: 'lead-in',
        exercise: {
          version: 1,
          id: 'lead-in-choice',
          title: 'Complete the rule',
          kind: 'choice',
          items: [{
            id: 'q1',
            prompt: 'Use It is for...',
            options: [{ id: 'now', text: 'now or in general' }, { id: 'past', text: 'the past' }],
            correctId: 'now'
          }]
        }
      },
      { type: 'rule', title: 'Rule', formula: 'It is + adjective + to + base form', examples: ['It is easy to get there.'] },
      { type: 'image', image: '/assets/rule-visual-it-is-was.svg', alt: 'Grammar map' }
    ]
  };
  assert.equal(validate(def), def);
  assert.deepEqual(grade(def, {}), {});
  const imageOnly = {
    version: 1,
    id: 'rule-image-only',
    title: 'Visual',
    kind: 'rule-page',
    blocks: [{ type: 'image', image: '/assets/rule-visual-it-is-was.svg', alt: 'Grammar map' }]
  };
  assert.equal(validate(imageOnly), imageOnly);
  const nested = copy(def);
  nested.blocks[1].exercise = { version: 1, id: 'nested', title: 'No', kind: 'rule-page', blocks: [{ type: 'text', text: 'x' }] };
  assert.throws(() => validate(nested));
});

test('cropped picture-word items validate and reject crops outside the image', () => {
  const def = {
    version: 1,
    id: 'crop-picture-word',
    title: 'Match',
    kind: 'matching',
    layout: 'picture-word',
    items: [
      { id: 'i1', text: 'Food stall', image: '/assets/sheet.jpg', alt: 'Food stall', crop: { x: 3, y: 2, w: 26, h: 44 }, correctId: 'stall' }
    ],
    options: [{ id: 'stall', text: 'food stall' }]
  };
  assert.equal(validate(def), def);
  const bad = copy(def); bad.items[0].crop = { x: 90, y: 2, w: 20, h: 44 }; assert.throws(() => validate(bad));
});

test('Listen & Repeat can reserve per-item audio slots without fake audio', () => {
  const def = {
    version: 1,
    id: 'pending-audio',
    title: 'Listen and repeat',
    kind: 'audio',
    layout: 'listen-repeat',
    audioPending: true,
    items: [{ id: 'a', text: 'invitation', example: 'This is an invitation.' }]
  };
  assert.equal(validate(def), def);
  assert.deepEqual(grade(def, {}), {});
  const strict = copy(def); delete strict.audioPending; assert.throws(() => validate(strict));
});

test('multiple choice compares exact sets and rejects malformed keys', () => {
  const def = copy(choice); def.multiple = true;
  delete def.items[0].correctId; def.items[0].correctIds = ['a','b'];
  assert.equal(grade(def,{q1:['b','a']}).q1,'correct');
  assert.equal(grade(def,{q1:['a']}).q1,'retry');
  assert.equal(grade(def,{q1:['a','a']}).q1,'retry');
  assert.equal(grade(def,{q1:[]}).q1,'empty');
  assert.equal(grade(def,{q1:'a'}).q1,'empty');
  def.items[0].correctIds = ['a','missing']; assert.throws(() => validate(def));
});
test('stage validates children, preserves content and has no fake aggregate grading', () => {
  const def = {version:1,id:'stage',kind:'stage',title:'Stage',progressive:true,exercises:[{id:'one',exercise:copy(gaps)},{id:'two',exercise:copy(choice)}]};
  const before = JSON.stringify(def); validate(def); assert.deepEqual(grade(def),{});
  assert.equal(JSON.stringify(def),before);
  def.exercises[1].id = 'one'; assert.throws(() => validate(def));
  def.exercises[1].id = 'revealed'; assert.throws(() => validate(def));
});


test('writing accepted-answer contract rejects conflicting modes and missing keys',()=>{
  const def={version:1,id:'accepted',kind:'writing',title:'Write',responseMode:'accepted',items:[{id:'answer',prompt:'Translate',acceptedAnswers:['I am late',"I’m late"]}]};
  assert.equal(grade(def,{answer:'  I AM   LATE  '}).answer,'correct');
  assert.equal(grade(def,{answer:'I late'}).answer,'retry');
  assert.equal(grade(def,{answer:''}).answer,'empty');
  assert.throws(()=>validate({...def,items:[{id:'answer',prompt:'Translate'}]}),/acceptedAnswers/);
  assert.throws(()=>validate({...def,responseMode:'open'}),/Open writing/);
  assert.throws(()=>validate({...def,items:[{...def.items[0],acceptedAnswers:[]}]}),/non-empty/);
});
