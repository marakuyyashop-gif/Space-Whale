const test = require('node:test');
const assert = require('node:assert/strict');
const {parseHTML} = require('linkedom');
const kit = require('../exercise-kit.js');
const input = () => ({id:'speaking-contract',title:'Describe your neighbors',image:null,
  task:{text:'Your friend asks about your neighbors.',bullets:['Their character.','Their appearance.']},
  use:[{words:['polite','helpful'],phrases:['What is she like?','She is ...']},
    {words:['tall','short'],phrases:['What does she look like?','She is ...']}]});
function mount(def, config = {}) {
  const {document} = parseHTML('<html><body><main></main></body></html>');
  const host = document.querySelector('main');
  const handle = kit.mount(host, def, config);
  return {host,handle};
}

test('Speaking preserves fixed order and open support with no controls in any viewing role', () => {
  for (const config of [{onSkip(){}},{navigationReadOnly:true,onSkip(){}},{readOnly:true,syncDisclosures:true}]) {
    const definition = kit.speaking({...input(),image:{image:'assets/factory/image-1.svg',alt:'Neighbors'}});
    const {host,handle} = mount(definition,config);
    assert.equal(host.querySelector('h2').textContent,definition.title);
    assert.deepEqual([...host.querySelector('.ek-body').children].map(el=>el.className),
      ['ek-speaking-image','ek-speaking-task','ek-speaking-use']);
    assert.ok(host.querySelector('.ek-speaking-image img'));
    assert.equal(host.querySelectorAll('.ek-speaking-bullets li').length,2);
    assert.equal(host.querySelector('strong').textContent,'Use:');
    const groups = [...host.querySelectorAll('.ek-speaking-group')];
    assert.equal(groups.length,2);
    assert.equal(groups[0].firstElementChild.textContent,'polite · helpful');
    assert.equal(groups[0].lastElementChild.textContent,'What is she like?\nShe is ...');
    assert.equal(host.querySelector('button, details, input, textarea, select, dialog'),null);
    assert.deepEqual(kit.grade(definition,{}),{});
    handle.setAnswers({});handle.setViewState({disclosures:[false]},false);
    assert.equal(host.querySelector('.ek-speaking-use').hidden,false);
    handle.destroy();
  }
});

test('missing artwork has a reusable hidden slot, without a placeholder or a broken request', () => {
  for (const image of [null,{imagePending:true,assetId:'future-art'}]) {
    const {host,handle}=mount(kit.speaking({...input(),image}));
    assert.equal(host.querySelector('.ek-speaking-image').hidden,true);
    assert.equal(host.querySelector('img, .ek-image-pending'),null);
    assert.equal(host.querySelector('.ek-speaking-image').textContent,'');
    handle.destroy();
  }
});

test('Speaking rejects extra UI fields, unsafe media and empty support instead of ignoring them', () => {
  for (const extra of [{blocks:[]},{instruction:'Extra instruction'},{teacherNotes:'Notes'},
    {buttons:['Skip']},{useTitle:'Useful language'},{html:'<button>OK</button>'},{followUp:{}}]) {
    assert.throws(()=>kit.speaking({...input(),...extra}),/unsupported field/);
  }
  assert.throws(()=>kit.speaking({...input(),use:[{words:['word'],title:'Words'}]}),/unsupported field/);
  assert.throws(()=>kit.speaking({...input(),use:[{}]}),/must contain/);
  assert.throws(()=>kit.speaking({...input(),image:{image:'javascript:alert(1)',alt:'Image'}}),/Unsupported image URL/);
  assert.throws(()=>kit.speaking({...input(),layout:'custom'}),/shared presentation/);
  const definition=kit.speaking(input());definition.blocks=[];
  assert.throws(()=>mount(definition),/unsupported field/);
});

test('group counts are flexible, input stays immutable and content is always plain text', () => {
  const source=input();source.task={text:'<img src=x onerror=alert(1)>'};
  source.use=[{words:['one']},{phrases:['Make a suggestion ...']},{words:['three'],phrases:['...']}];
  const definition=kit.speaking(source);definition.use[0].words.push('two');
  assert.deepEqual(source.use[0].words,['one']);
  const {host,handle}=mount(definition);
  assert.equal(host.querySelectorAll('.ek-speaking-group').length,3);
  assert.equal(host.querySelector('img'),null);
  assert.equal(host.querySelector('.ek-speaking-task').textContent,source.task.text);
  handle.destroy();
});

test('Speaking uses the same layout inside progressive lessons and keeps existing answer state', () => {
  const definition={version:1,id:'sequence',kind:'stage',title:'Lesson',progressive:true,exercises:[
    {id:'oral',exercise:kit.speaking(input())},
    {id:'writing',exercise:{version:1,id:'writing',kind:'writing',title:'Write',items:[{id:'reply',prompt:'Your reply'}]}}
  ]};
  const {host,handle}=mount(definition,{answers:{revealed:2,writing:{reply:'Saved'}}});
  assert.ok(host.querySelector('.ek-speaking-use'));
  assert.equal(host.querySelector('.ek-speaking-use').closest('.exercise-kit').querySelector('button'),null);
  assert.equal(host.querySelector('input').value,'Saved');
  assert.equal(handle.getAnswers().writing.reply,'Saved');
  handle.destroy();
});
