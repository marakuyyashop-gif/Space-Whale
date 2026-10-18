/* One visual template registry for catalog cards, course lessons and saved homework.
   Profiles own appearance. Lesson data owns content, media, keys and progression. */
(function(root,factory){
 if(typeof module==='object'&&module.exports)module.exports=factory(require('./exercise-template-profiles.js'),require('./exercise-template-bindings.js'));
 else root.SpaceWhaleExerciseTemplates=factory(root.SpaceWhaleExerciseTemplateProfiles,root.SpaceWhaleExerciseTemplateBindings);
})(typeof window!=='undefined'?window:typeof globalThis!=='undefined'?globalThis:this,function(sourceProfiles,bindings){
 'use strict';
 if(!sourceProfiles||!bindings)throw Error('Exercise template profiles and bindings must load before the registry.');
 const copy=value=>JSON.parse(JSON.stringify(value));
 const profiles=copy(sourceProfiles);
 const fields=new Set(['layout','answerSize','transformationArrow','numbered','flatControls']);
 const responseKinds=['matching','gaps','choice','sort','order','writing','image-label'];
 const visualFields={matching:['layout','answerSize'],writing:['layout','answerSize','transformationArrow'],choice:['layout','numbered'],gaps:['layout'],order:['layout'],audio:['layout'],presentation:['layout']};
 const text=value=>String(value||'');
 const pictured=item=>Boolean(item?.image||item?.imagePending);
 const long=value=>text(value).trim().split(/\s+/).length>3;
 function infer(def){
  if(def.kind==='stage')return null;
  if(def.kind==='rule-page')return def.blocks?.some(b=>b.type==='exercise')?null:def.blocks?.some(b=>b.formula)?'R03':'R01';
  if(def.kind==='presentation')return def.layout==='speaking'?(pictured(def.image)?'S01':'S02'):'Q01';
  if(def.kind==='audio')return def.layout==='listen-repeat'?'P01':'L02';
  if(def.kind==='matching'){
   if(def.layout==='audio-picture'||def.items?.some(i=>i.audio||i.audioPending)&&def.options?.some(pictured))return 'L11';
   if(def.layout==='picture-word'||def.items?.some(pictured))return def.answerSize==='sentence'||def.options?.some(o=>long(o.text))?'E06D':'W01';
   if(def.layout==='word-translation')return 'W02';
   if(def.layout==='word-definition')return 'W03A';
   return 'E06';
  }
  if(def.kind==='gaps'){
   if(def.layout==='table')return 'E05B';
   const gaps=(def.items||[]).flatMap(item=>(item.segments||[]).filter(s=>typeof s==='object'));
   if(def.inputMode==='select'||gaps.some(gap=>gap.options))return def.layout==='paragraph'?'E03A':'E03';
   return def.bank?.length?'E04':gaps.some(gap=>gap.placeholder)?'E04A':'E05';
  }
  if(def.kind==='choice')return def.multiple?'E02':def.layout==='dropdown'?(def.numbered===true?'L01':'D02'):'E01';
  if(def.kind==='sort')return 'E07';
  if(def.kind==='order')return def.layout==='image-grid'||def.tokens?.some(pictured)?'L05':'E09';
  if(def.kind==='image-label')return 'W04';
  if(def.kind==='writing')return def.answerSize==='word'||def.layout==='picture-rows'?'E05A':def.transformationArrow?'E13':def.items?.some(i=>i.acceptedAnswers)?'E14':'E11';
  return null;
 }
 function profileFor(code,kind,part){
  if(!Object.hasOwn(profiles,code))throw Error('Unknown exercise template '+code);
  const profile=profiles[code];
  const candidates=profile.parts.filter(p=>p.kind===kind);
  const selected=candidates.find(p=>p.path===part)||candidates[0];
  return {code,kind,part:selected?.path||part||'$',supported:Boolean(selected),flatControls:profile.flatControls,...copy(selected?.settings||{})};
 }
 function descriptor(def,inherited){
  const binding=Object.hasOwn(bindings,def.id)?bindings[def.id]:{};
  const code=def.templateCode||def.code||binding.templateCode||(binding.role==='composition'?null:inherited)||infer(def);
  return {code,part:def.templatePart||binding.part,role:def.templateRole||binding.role,preserveLayout:binding.preserveLayout===true};
 }
 function resolve(definition,inherited){
  const def=copy(definition),binding=descriptor(def,inherited);
  if(binding.code){
   const profile=profileFor(binding.code,def.kind,binding.part);
   if(responseKinds.includes(def.kind)&&!profile.supported)throw Error('Template '+binding.code+' has no compatible '+def.kind+' component for '+def.id);
   def.templateCode=binding.code;def.templatePart=profile.part;
   if(binding.role)def.templateRole=binding.role;
   if(binding.role!=='material')for(const field of visualFields[def.kind]||[]){
    if(!Object.hasOwn(profile,field))continue;
    // Image/row association, table cells and paragraph grouping carry authored
    // content. A generic primitive profile must not detach those cues.
    if(field==='layout'&&(binding.preserveLayout||['picture-rows','table'].includes(def.layout)))continue;
    if(field==='layout'&&def.kind==='presentation'&&profile.layout==='speaking'&&def.layout!=='speaking'){
     def.templateRole='speaking';continue;
    }
    def[field]=profile[field];
   }
  }else def.templateRole=binding.role||'composition';
  if(def.exercises)def.exercises=def.exercises.map(block=>({...block,exercise:resolve(block.exercise,binding.code)}));
  if(def.blocks)def.blocks=def.blocks.map(block=>block.type==='exercise'?{...block,exercise:resolve(block.exercise,binding.code)}:block);
  return def;
 }
 function configure(code,changes,selector={}){
  if(!Object.hasOwn(profiles,code))throw Error('Unknown exercise template '+code);
  for(const field of Object.keys(changes))if(!fields.has(field))throw Error('Template profiles cannot replace '+field);
  if('flatControls'in changes&&typeof changes.flatControls!=='boolean')throw Error('flatControls must be boolean');
  const before=copy(profiles[code]);
  const kind=selector.kind||profiles[code].parts.find(p=>responseKinds.includes(p.kind))?.kind||profiles[code].parts[0].kind;
  for(const [field,value] of Object.entries(changes)){
   if(field==='flatControls'){profiles[code].flatControls=value;continue;}
   for(const part of profiles[code].parts)if(part.kind===kind&&(!selector.part||part.path===selector.part)&&(visualFields[part.kind]||[]).includes(field))part.settings[field]=value;
  }
  return ()=>{profiles[code]=before;};
 }
 return {version:1,codes:Object.freeze(Object.keys(profiles)),resolve,profileFor,configure,infer,
  bindingFor:id=>Object.hasOwn(bindings,id)?copy(bindings[id]):null};
});
