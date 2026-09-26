const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {parseHTML}=require('linkedom');
async function gate(search,user,allowed){
 const {document}=parseHTML('<html data-teacher-check="pending"><body><main>Teacher content</main></body></html>');let replaced;
 const location={pathname:'/Space-Whale/classroom.html',search,replace:url=>{replaced=url;}};
 const window={spaceWhaleSupabase:{auth:{getUser:async()=>({data:{user}})},rpc:async()=>({data:allowed})}};
 vm.runInNewContext(fs.readFileSync(require.resolve('../teacher-access.js'),'utf8'),{window,document,location,URLSearchParams});
 return {allowed:await window.SpaceWhaleTeacherAccess,document,replaced};
}
test('removing the guest token sends a signed-out visitor to sign-in, not teacher UI',async()=>{
 const g=await gate('',null,false);assert.equal(g.allowed,false);assert.match(g.replaced,/^login.html\?next=/);assert.equal(g.document.documentElement.dataset.teacherCheck,'pending');
});
test('existing pupil account does not unlock teaching; only server-approved owner does',async()=>{
 const denied=await gate('',{id:'pupil'},false);assert.equal(denied.allowed,false);assert.doesNotMatch(denied.document.body.textContent,/Teacher content/);
 const owner=await gate('',{id:'owner'},true);assert.equal(owner.allowed,true);assert.equal(owner.document.documentElement.hasAttribute('data-teacher-check'),false);
});
test('guest URL defers permission to the room resolver, without calling teacher APIs',async()=>{
 const g=await gate('?guest=opaque',null,false);assert.equal(g.allowed,true);
});
