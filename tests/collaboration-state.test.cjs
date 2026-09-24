const test=require('node:test');const assert=require('node:assert/strict');
const {create}=require('../collaboration-state.js');
test('simultaneous edits to different nested fields merge in either order',()=>{
 const a=create('teacher'),b=create('student');const seed=a.update({block:{one:'',two:''}});b.merge(seed);
 const x=a.update({block:{one:'hello',two:''}}),y=b.update({block:{one:'',two:'hi'}});
 a.merge(y);b.merge(x);assert.deepEqual(a.answers(),{block:{one:'hello',two:'hi'}});assert.deepEqual(a.answers(),b.answers());
});
test('same-field concurrent writes converge, stale packets cannot resurrect reset answers',()=>{
 const a=create('teacher'),b=create('student');const x=a.update({word:'a'}),y=b.update({word:'b'});
 a.merge(y);b.merge(x);assert.deepEqual(a.answers(),b.answers());
 const deleted=a.update({});b.merge(deleted);b.merge(x);b.merge(y);assert.deepEqual(b.answers(),{});
 const reopened=create('new-tab');reopened.merge(b.snapshot());assert.deepEqual(reopened.answers(),{});
});
test('Check and choice arrays survive snapshot restoration; dangerous paths are ignored',()=>{
 const a=create('teacher');a.update({block:{selected:['A','C'],__sw_checked:true}});
 const b=create('student');b.merge(JSON.parse(JSON.stringify(a.snapshot())));assert.deepEqual(a.answers(),b.answers());
 b.merge({__sw_collab:1,entries:{'["__proto__","polluted"]':{clock:9,actor:'bad',value:true}}});assert.equal({}.polluted,undefined);
});
