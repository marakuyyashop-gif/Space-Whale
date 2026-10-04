/* A serialized, revision-checked autosave queue; drafts survive failed requests. */
(function(root){
 'use strict';
 function create({rpc,storage,key,record,onStatus=()=>{}}){
  let state=record,queue=null;
  const persist=()=>storage.setItem(key,JSON.stringify(state));
  function replace(answers){state.answers=answers;state.dirty=true;state.change=(state.change||0)+1;persist();onStatus('Есть несохранённые изменения.');}
  function update(id,answers){replace({...state.answers,[id]:answers});}
  async function flush(){
   if(queue)return queue;
   queue=(async()=>{
    while(state.dirty){
     const change=state.change,answers=JSON.parse(JSON.stringify(state.answers));onStatus('Сохранение…');
     const saved=await rpc('homework_save',{p_id:state.id,p_edit_key:state.edit,p_revision:state.revision,p_answers:answers});
     state.revision=saved.revision;state.dirty=state.change!==change;persist();
    }
    onStatus('Все ответы сохранены.');
   })().catch(error=>{onStatus(error.message==='Revision conflict'?'Работа открыта в другом окне. Обновите страницу перед продолжением.':'Не удалось сохранить в интернете. Ответы сохранены в этом браузере; повторим попытку.',true);throw error;}).finally(()=>{queue=null;});
   return queue;
  }
  return {update,replace,flush,get state(){return state;}};
 }
 if(typeof module!=='undefined')module.exports={create};else root.SpaceWhaleHomeworkStore={create};
})(typeof window==='undefined'?globalThis:window);
