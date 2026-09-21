const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const kit = require('../exercise-kit.js');
function definitions(file, name, end) {
  const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  const start = source.indexOf(`  const ${name} = [`);
  return vm.runInNewContext(`(() => { ${source.slice(start, source.indexOf(end, start))} return ${name}; })()`);
}
test('all 16 gallery definitions and pilot stages remain valid', () => {
  const gallery = definitions('template-gallery.js', 'examples', '  const kit');
  assert.equal(gallery.length, 16);
  gallery.forEach(def => kit.validate(def));
  definitions('lesson-draft-first-day-school.js', 'stages', '  stages.forEach').forEach(stage => kit.validate(stage.exercise));
  const order = gallery.find(def => def.id === 'picture-order-demo');
  assert.ok(order.source.text.includes('went hiking first'));
  const discovery = gallery.find(def => def.kind === 'rule-page');
  assert.deepEqual(Array.from(discovery.blocks[0].highlights), ['is easy to get', 'was difficult to find']);
  assert.ok(discovery.blocks.some(block => block.type === 'image'));
  assert.ok(!discovery.blocks.some(block => block.type === 'rule'));
});
test('discovery dropdown grades option IDs and preserves prompt data', () => {
  const def = { version: 1, id: 'd', kind: 'choice', layout: 'dropdown', title: 'Complete', items: [{ id: 'q', prompt: 'We use this form...', options: [{ id: 'a', text: 'now' }, { id: 'b', text: 'in the past' }], correctId: 'b' }] };
  assert.equal(kit.grade(def, {q:'b'}).q, 'correct');
  assert.equal(kit.grade(def, {q:'a'}).q, 'retry');
});
test('invalid highlight or unsafe ordering audio is rejected before render', () => {
  assert.throws(() => kit.validate({version:1,id:'r',kind:'rule-page',title:'Rule',blocks:[{type:'text',text:'It is easy to get there.',highlights:['not present']}]}));
  assert.throws(() => kit.validate({version:1,id:'o',kind:'order',title:'Order',tokens:[{id:'a',text:'A'}],source:{audio:'javascript:alert(1)'}}));
});
