const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {parseHTML}=require('linkedom');
const source=fs.readFileSync(require.resolve('../workspace-word-focus.js'),'utf8');
function fixture(t,html,options={}){
 const {document,window:dom}=parseHTML('<section class="exercise-kit" id="root">'+html+'</section>');
 const storage=options.storage||new Map(),messages=[],timers=new Map();let timerId=0;
 const window={sessionStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)}};
 vm.runInNewContext(source,{window,MutationObserver:options.observe?dom.MutationObserver:undefined,setTimeout:(fn,ms)=>{timers.set(++timerId,{fn,ms});return timerId;},clearTimeout:id=>timers.delete(id)});
 const root=document.getElementById('root');
 const api=window.SpaceWhaleWordFocus.create({root,actor:options.actor||'a',storageKey:'focus',canShare:()=>true,send:p=>{messages.push(p);options.send?.(p);}});
 api.setExercise('e1');api.decorate();messages.length=0;t.after(()=>api.destroy());
 const click=el=>el.dispatchEvent(new dom.Event('click',{bubbles:true}));
 return {root,api,messages,storage,document,dom,click,timers};
}
test('only English reading text is decorated, without changing content, input values or controls',t=>{
 const html='<p>Hello, привет! I’m late — well-known. abcРусский</p><button>Next exercise</button><label>Full name<input value="Jane" /></label><div contenteditable="true">My answer</div><a href="#">Open</a><svg><text>Icon</text></svg>';
 const s=fixture(t,html);assert.equal(s.root.textContent,'Hello, привет! I’m late — well-known. abcРусскийNext exerciseFull nameMy answerOpenIcon');
 assert.deepEqual([...s.root.querySelectorAll('.sw-word-focus')].map(w=>w.textContent),['Hello','I’m','late','well-known']);
 assert.equal(s.root.querySelector('input').value,'Jane');assert.equal(s.root.querySelector('button .sw-word-focus'),null);assert.equal(s.root.querySelector('[contenteditable] .sw-word-focus'),null);
});
test('one click selects a word; the next clears it; exercise answer handlers are untouched',t=>{
 const s=fixture(t,'<p>Hello world</p><button>Check</button>');let checks=0;s.root.querySelector('button').addEventListener('click',()=>checks++);
 const word=s.root.querySelector('.sw-word-focus');s.click(word);assert.equal(word.getAttribute('aria-pressed'),'true');assert.equal(s.messages.at(-1).kind,'selection');
 s.click(word);assert.equal(word.getAttribute('aria-pressed'),'false');assert.equal(s.messages.at(-1).entry.word,null);
 s.click(s.root.querySelector('button'));assert.equal(checks,1);assert.equal(s.messages.length,2);
});
test('two participants select the same occurrence and clear it through existing broadcast payloads',t=>{
 const a=fixture(t,'<p>Hello Hello</p>',{actor:'a'}),b=fixture(t,'<p>Hello Hello</p>',{actor:'b'});
 a.click(a.root.querySelectorAll('.sw-word-focus')[1]);b.api.receive(a.messages.at(-1));
 assert.equal(b.root.querySelectorAll('.sw-word-focus')[0].getAttribute('aria-pressed'),'false');assert.equal(b.root.querySelectorAll('.sw-word-focus')[1].getAttribute('aria-pressed'),'true');
 b.click(b.root.querySelectorAll('.sw-word-focus')[1]);a.api.receive(b.messages.at(-1));assert.equal(a.root.querySelector('.is-word-selected'),null);
});
test('stable word keys survive re-render and progressive reveal; a different exercise never receives focus',t=>{
 const a=fixture(t,'<p>Hello <strong>world</strong>, Hello.</p>'),b=fixture(t,'<p>Hello <strong>world</strong>, Hello.</p>',{actor:'b'});
 a.click(a.root.querySelectorAll('.sw-word-focus')[2]);const selected=a.messages.at(-1);b.api.receive(selected);
 b.root.innerHTML='<p>Hello <strong>world</strong>, Hello.</p><p>More content</p>';b.api.decorate();assert.equal(b.root.querySelector('.is-word-selected').dataset.wordKey,selected.entry.word.key);
 b.api.setExercise('e2');b.api.decorate();b.api.receive(selected);assert.equal(b.root.querySelector('.is-word-selected'),null);
});
test('focus restores on reconnect and simultaneous clicks converge without stale overwrites',t=>{
 const a=fixture(t,'<p>Hello world</p>',{actor:'a'}),b=fixture(t,'<p>Hello world</p>',{actor:'b'});
 a.click(a.root.querySelectorAll('.sw-word-focus')[0]);b.click(b.root.querySelectorAll('.sw-word-focus')[1]);const one=a.messages.at(-1),two=b.messages.at(-1);
 a.api.receive(two);b.api.receive(one);assert.equal(a.root.querySelector('.is-word-selected').textContent,'world');assert.equal(b.root.querySelector('.is-word-selected').textContent,'world');
 const fresh=fixture(t,'<p>Hello world</p>',{actor:'c'});fresh.api.reconnect();a.api.receive(fresh.messages.findLast(p=>p.kind==='request'));fresh.api.receive(a.messages.at(-1));assert.equal(fresh.root.querySelector('.is-word-selected').textContent,'world');
 const reloaded=fixture(t,'<p>Hello world</p>',{storage:a.storage});assert.equal(reloaded.root.querySelector('.is-word-selected').textContent,'world');
});
test('hover messages are coalesced and peer hover expires without changing the selected word',t=>{
 const a=fixture(t,'<p>Hello world</p>',{actor:'a'}),b=fixture(t,'<p>Hello world</p>',{actor:'b'});
 const over=new a.dom.Event('pointerover',{bubbles:true});a.root.querySelector('.sw-word-focus').dispatchEvent(over);
 assert.equal(a.messages.length,0);const timer=[...a.timers.values()].find(v=>v.ms===70);timer.fn();b.api.receive(a.messages.at(-1));assert.equal(b.root.querySelector('.is-peer-hovered').textContent,'Hello');
 [...b.timers.values()].find(v=>v.ms===5000).fn();assert.equal(b.root.querySelector('.is-peer-hovered'),null);assert.equal(b.root.querySelector('.is-word-selected'),null);
});
test('typing and dynamic rendering do not nest word spans or consume keyboard input',async t=>{
 const s=fixture(t,'<p>Hello</p><input value="old">',{observe:true});const input=s.root.querySelector('input');input.value='new';
 s.root.querySelector('p').textContent='Hello again';await new Promise(r=>setImmediate(r));
 assert.equal(s.root.querySelectorAll('.sw-word-focus').length,2);s.api.decorate();assert.equal(s.root.querySelector('.sw-word-focus .sw-word-focus'),null);assert.equal(input.value,'new');
 const el=s.root.querySelector('.sw-word-focus'),event=new s.dom.Event('keydown',{bubbles:true,cancelable:true});event.key='Enter';el.dispatchEvent(event);assert.equal(el.getAttribute('aria-pressed'),'true');
});
