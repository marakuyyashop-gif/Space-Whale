const test = require('node:test');
const assert = require('node:assert/strict');
const {parseHTML} = require('linkedom');
const kit = require('../exercise-kit.js');
const templates = require('../exercise-templates.js');
const structure = require('../lesson-structure.js');
const collaboration = require('../collaboration-state.js');
const homework = require('../homework-flow.js');
const {create: createStore} = require('../homework-store.js');

const copy = value => JSON.parse(JSON.stringify(value));
const signature = value => JSON.stringify(value);
const matching = () => ({version: 1, id: 'saved-matching', kind: 'matching', title: 'Match the words with their meanings.', layout: 'cards',
  items: [{id: 'word-one', text: 'quiet', correctId: 'meaning-one'}, {id: 'word-two', text: 'helpful', correctId: 'meaning-two'}],
  options: [{id: 'meaning-two', text: 'Ready to help.'}, {id: 'meaning-one', text: 'Making little noise.'}]});
const gaps = () => ({version: 1, id: 'saved-gap', kind: 'gaps', title: 'Complete the sentence.', inputMode: 'select',
  items: [{id: 'sentence-one', segments: ['She ', {id: 'verb', options: ['look', 'looks'], answers: ['looks']}, ' tired.']}]});
const writing = () => ({version: 1, id: 'saved-writing', kind: 'writing', title: 'Write the correct form.', responseMode: 'accepted',
  items: [{id: 'form-one', prompt: 'work', acceptedAnswers: ['works']}]});
const checked = {
  'saved-matching': {'word-one': 'meaning-one', 'word-two': 'meaning-one', __sw_checked: true},
  'saved-gap': {verb: 'looks', __sw_checked: true},
  'saved-writing': {'form-one': 'work', __sw_checked: true}
};
function setup(definition, answers, options = {}) {
  const {document} = parseHTML('<html><body><main></main></body></html>');
  const host = document.querySelector('main');
  const handle = kit.mount(host, definition, {answers, syncChecks: true, ...options});
  return {host, handle};
}

test('one template profile revision updates remounted checked exercises without changing their authored signatures or live answers', () => {
  const authored = {...matching(), templateCode: 'W03A'}, before = signature(authored), saved = copy(checked[authored.id]);
  const profileBefore = copy(templates.profileFor('W03A', 'matching'));
  assert.equal(profileBefore.layout, 'word-definition');
  const initial = setup(authored, saved);
  assert.ok(initial.host.querySelector('.ek-word-definition-grid'));
  initial.handle.destroy();
  const live = collaboration.create('previous-tab'); live.update(saved);
  const snapshotBefore = copy(live.snapshot());
  const restore = templates.configure('W03A', {layout: 'cards'});
  try {
    const display = templates.resolve(authored);
    assert.equal(display.layout, 'cards');
    assert.notEqual(display, authored);
    assert.deepEqual(display.items, authored.items);
    assert.deepEqual(display.options, authored.options);
    const reopened = collaboration.create('new-tab'); reopened.merge(snapshotBefore);
    const view = setup(authored, reopened.answers(), {readOnly: true});
    assert.equal(view.host.querySelector('.ek-word-definition-grid'), null);
    assert.deepEqual(view.handle.getAnswers(), saved);
    assert.deepEqual(kit.grade(display, saved), kit.grade(authored, saved));
    assert.equal(signature(authored), before);
    assert.deepEqual(live.snapshot(), snapshotBefore);
    assert.deepEqual(reopened.snapshot(), snapshotBefore);
    view.handle.destroy();
  } finally {restore();}
  assert.deepEqual(templates.profileFor('W03A', 'matching'), profileBefore);
});

test('profile editing cannot replace authored content, identities, media or response mechanics', () => {
  for (const [field, value] of Object.entries({
    id: 'replacement-exercise', kind: 'writing', items: [], options: [], title: 'Replacement task',
    audio: 'replacement.mp3', progressiveQuestions: true, followUp: {kind: 'rule-page'}
  })) assert.throws(() => templates.configure('W03A', {[field]: value}), field);
});

test('checked responses preserve their exact keys and grades through a shared visual layout change', () => {
  const authored = matching(), before = signature(authored), refined = {...copy(authored), layout: 'word-definition'};
  assert.equal(structure.compatible(before, signature(refined)), true);
  const saved = copy(checked[authored.id]);
  const replica = collaboration.create('existing-student');
  replica.update(saved);
  const restored = collaboration.create('reopened-student');
  restored.merge(copy(replica.snapshot()));
  const teacher = setup(refined, saved), student = setup(refined, restored.answers(), {readOnly: true});
  assert.deepEqual(teacher.handle.getAnswers(), saved);
  assert.deepEqual(student.handle.getAnswers(), saved);
  assert.deepEqual(kit.grade(refined, saved), kit.grade(authored, saved));
  assert.deepEqual(kit.grade(refined, saved), {'word-one': 'correct', 'word-two': 'retry'});
  assert.ok([...student.host.querySelectorAll('.ek-match-slot')].every(control => control.disabled));
  assert.equal(signature(authored), before);
  assert.deepEqual(replica.snapshot(), restored.snapshot());
  teacher.handle.destroy(); student.handle.destroy();
});

test('visual compatibility never accepts changed response keys, answer content, prompt text or media', () => {
  for (const definition of [matching(), gaps(), writing()]) {
    const previous = signature(definition);
    const cases = [
      d => {d.items[0].id = 'replacement-item';},
      d => {d.title = 'A different authored task.';},
      d => {d.items[0].image = 'Images/replacement-picture.png';}
    ];
    if (definition.kind === 'matching') cases.push(
      d => {d.items[0].correctId = 'meaning-two';},
      d => {d.items[0].text = 'noisy';},
      d => {d.options[0].text = 'A different definition.';},
      d => {d.options[0].audio = 'Audio/replacement-recording.mp3';}
    );
    if (definition.kind === 'gaps') cases.push(
      d => {d.items[0].segments[1].id = 'replacement-answer';},
      d => {d.items[0].segments[1].answers = ['look'];},
      d => {d.items[0].segments[0] = 'They ';}
    );
    if (definition.kind === 'writing') cases.push(
      d => {d.items[0].acceptedAnswers = ['worked'];},
      d => {d.items[0].prompt = 'study';}
    );
    for (const mutate of cases) {
      const changed = copy(definition); mutate(changed);
      assert.equal(structure.compatible(previous, signature(changed)), false, definition.kind);
    }
    assert.equal(signature(definition), previous);
  }
});

test('old homework snapshots keep checked answers, reveal state and completion across a template revision and autosave', async () => {
  const pack = {id: 'existing-homework', title: 'Existing homework', steps: [
    {role: 'words', exercise: matching()}, {role: 'practice', exercise: gaps()}, {role: 'translation', exercise: writing()}
  ]};
  const before = signature(pack), answers = {...copy(checked), revealed: 3, __seen: 3, __comment: 'Keep my comment.'};
  const stateBefore = copy(answers), progressBefore = homework.progress(pack, answers, kit);
  assert.deepEqual(progressBefore, {done: 3, total: 3, complete: true});
  const initial = setup(homework.flow(pack), answers, {repeatAll: true, independentSteps: true, readOnly: true});
  const viewBefore = initial.handle.getViewState(); initial.handle.destroy();
  const code = templates.resolve(pack.steps[0].exercise).templateCode;
  assert.ok(code, 'an old snapshot without template metadata resolves to the shared registry');
  assert.equal(pack.steps[0].exercise.templateCode, undefined);
  const restore = templates.configure(code, {layout: 'word-definition'});
  let view;
  try {
    view = setup(homework.flow(pack), answers, {repeatAll: true, independentSteps: true, readOnly: true});
    assert.ok(view.host.querySelector('.ek-word-definition-grid'));
    assert.deepEqual(view.handle.getAnswers(), stateBefore);
    assert.deepEqual(view.handle.getViewState(), viewBefore);
    assert.deepEqual(homework.progress(pack, view.handle.getAnswers(), kit), progressBefore);
    assert.equal(signature(pack), before);
    const writes = [], local = new Map();
    const store = createStore({key: 'attempt-key', storage: {setItem: (key, value) => local.set(key, value)},
      record: {id: 'existing-attempt', edit: 'private-edit-key', definition: pack, answers: copy(answers), revision: 7},
      rpc: async (name, args) => {writes.push({name, args}); return {revision: 8};}
    });
    store.replace(view.handle.getAnswers()); await store.flush();
    assert.equal(writes.length, 1);
    assert.equal(writes[0].name, 'homework_save');
    assert.equal(writes[0].args.p_revision, 7);
    assert.deepEqual(writes[0].args.p_answers, stateBefore);
    assert.equal(signature(store.state.definition), before);
    const reopened = JSON.parse(local.get('attempt-key'));
    assert.deepEqual(reopened.answers, stateBefore);
    assert.equal(signature(reopened.definition), before);
    assert.equal(reopened.revision, 8);
  } finally {view?.handle.destroy(); restore();}
});
