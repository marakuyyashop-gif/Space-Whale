const test = require('node:test');
const assert = require('node:assert/strict');
const { validate, grade } = require('../exercise-kit.js');
const gaps = { version: 1, id: 'gaps', title: 'Test', kind: 'gaps', items: [{ id: 's1', segments: ['I ', { id: 'g1', answers: ['was'] }, ' and they ', { id: 'g2', answers: ['were'] }] }] };
const choice = { version: 1, id: 'choice', title: 'Test', kind: 'choice', items: [{ id: 'q1', prompt: 'Choose', options: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }], correctId: 'b' }] };
const copy = value => JSON.parse(JSON.stringify(value));
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
test('gap bank must include all accepted answers', () => {
  const def = copy(gaps); def.bank = ['was']; assert.throws(() => validate(def));
  def.bank.push('were'); assert.equal(validate(def), def);
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

test('audio Listen & Repeat accepts safe sources and is not graded', () => {
  const def = {
    version: 1,
    id: 'lnr',
    title: 'Listen and repeat',
    kind: 'audio',
    layout: 'listen-repeat',
    audio: 'data:audio/mpeg;base64,SUQz',
    items: [
      { id: 'a', text: 'space', example: 'Space is quiet.' },
      { id: 'b', text: 'a planet', example: 'Earth is a planet.' }
    ]
  };
  assert.equal(validate(def), def);
  assert.deepEqual(grade(def, {}), {});
  const bad = copy(def); bad.audio = 'javascript:alert(1)'; assert.throws(() => validate(bad));
  const badLayout = copy(def); badLayout.layout = 'waveform-editor'; assert.throws(() => validate(badLayout));
});
