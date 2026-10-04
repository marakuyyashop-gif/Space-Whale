/* Homework packs reuse published exercise definitions; attempts snapshot the pack. */
(function(root){
 'use strict';
 const copy=value=>JSON.parse(JSON.stringify(value));
 const definitions=[
  {id:'a1-2-w4-l4',words:'polite — вежливый\nrude — грубый\nhelpful — готовый помочь\nlazy — ленивый\nquiet — тихий\nnoisy — шумный',rule:'What is he/she like? — Какой он / какая она по характеру?\nHe/She is + прилагательное.\nShe is polite and helpful.\n\nWhat does he/she look like? — Как он / она выглядит?\nHe/She has + описание волос.\nHe has short curly hair.\n\nWhat does she like? — Что ей нравится?\nShe likes music.',highlights:['What is he/she like?','He/She is','What does he/she look like?','He/She has','What does she like?'],practice:['L4-word-translation','L4-dropdown-gap']},
  {id:'a1-2-w4-l5',words:'food — еда\ndrink — напиток\nfurniture — мебель\nclothing — одежда\nbuilding — здание\nshop — магазин',rule:'A kind of / a type of / a sort of — называем категорию.\nIt’s a kind of furniture.\nIt’s a type of drink.\nIt’s a sort of clothing.\n\nIt’s like — сравниваем с чем-то знакомым.\nIt’s like a big cushion.\n\nПеред kind of, type of и sort of нужен a.',highlights:['A kind of','a kind of','a type of','a sort of','It’s like'],practice:['L5-word-translation','L5-explanation-gaps']}
 ];
 function build(content,catalog){
  return definitions.map(source=>{
   const lesson=content.find(l=>l.id===source.id);if(!lesson)throw Error('Missing homework lesson');
   const all=[];function walk(d){all.push(d);d.exercises?.forEach(x=>walk(x.exercise));d.blocks?.filter(x=>x.type==='exercise').forEach(x=>walk(x.exercise));}lesson.stages.forEach(s=>walk(s.exercise));
   const exercises=source.practice.map(id=>{const d=all.find(x=>x.id===id);if(!d)throw Error('Missing exercise '+id);return copy(d);});
   exercises.push(...lesson.stages.filter(s=>s.section==='self-study').map(s=>copy(s.exercise)));
   return {id:source.id,version:'20261004-1',level:lesson.level,title:catalog.lessons.find(l=>l.id===source.id)?.title||source.id,
    reference:{version:1,id:source.id+'-homework-reference',kind:'presentation',title:'Памятка',blocks:[{type:'text',text:source.words},{type:'text',text:source.rule,highlights:source.highlights}]},exercises};
  });
 }
 if(typeof module!=='undefined')module.exports={build};else root.SpaceWhaleHomeworkContent={build};
})(typeof window==='undefined'?globalThis:window);
