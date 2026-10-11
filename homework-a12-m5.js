/* Approved translation prompts for A1.2 Module 5 Lessons 4 and 5. */
(function(root){
'use strict';
const combine=(left,right,link=' but ')=>left.flatMap(a=>right.map(b=>a+link+b+'.'));
const rows={
 l4:[
  [
   ['Я обычно занимаюсь английским вечером, но сейчас я повторяю урок.',...combine(
    ['I usually study English in the evening','In the evening, I usually study English','Usually, I study English in the evening'],
    ['now I am reviewing the lesson','I am reviewing the lesson now','at the moment I am reviewing the lesson','I am going over the lesson now'])],
   ['Моя сестра каждый день учит новые слова, а сегодня она практикует английский со мной.',...combine(
    ['My sister learns new words every day','Every day, my sister learns new words','My sister studies new words every day'],
    ['today she is practicing English with me','she is practicing English with me today'],' but '),...combine(
    ['My sister learns new words every day','My sister studies new words every day'],
    ['today she is practicing English with me','she is practicing English with me today'],' and ')],
   ['Наш учитель обычно учит нас английскому, но сейчас он разговаривает с другим учеником.',...combine(
    ['Our teacher usually teaches us English','Usually, our teacher teaches us English'],
    ['now he is talking to another student','he is talking to another student now','he is talking with another student now','at the moment he is talking to another student','he is speaking to another student now'])],
   ['Я всегда делаю записи на уроке, но сейчас я ничего не записываю.',...combine(
    ['I always take notes in class','I always take notes in lessons','I always take notes during the lesson','I always take notes in the lesson','I always take notes during lessons'],
    ['now I am not writing anything','I am not writing anything now','I am not writing anything down now','now I am not taking any notes','I am not taking any notes now'])],
   ['Мне нравится английский, и я знаю много простых слов.',
    'I like English, and I know a lot of simple words.','I like English, and I know many simple words.',
    'I like English, and I know a lot of easy words.','I like English, and I know many easy words.',
    'I like English, and I know a lot of basic words.','I like English, and I know many basic words.']
  ],[
   ['Марк обычно занимается дома, но сегодня он занимается в библиотеке.',...combine(
    ['Mark usually studies at home','Usually, Mark studies at home'],
    ['today he is studying at the library','he is studying at the library today','today he is studying in the library','he is studying in the library today'])],
   ['Что ты сейчас учишь?','What are you learning now?','What are you studying now?','What are you learning at the moment?','What are you studying at the moment?','What are you learning right now?','What are you studying right now?'],
   ['Мы сейчас практикуем английский и делаем записи.',
    'We are practicing English and taking notes now.','Now we are practicing English and taking notes.',
    'We are practicing English and taking notes at the moment.','At the moment, we are practicing English and taking notes.',
    'We are practicing English now and taking notes.','We are practicing English and we are taking notes now.'],
   ['Она обычно повторяет урок вечером, но сейчас ей нужно закончить домашнее задание.',...combine(
    ['She usually reviews the lesson in the evening','In the evening, she usually reviews the lesson','Usually, she reviews the lesson in the evening'],
    ['now she needs to finish her homework','she needs to finish her homework now','now she needs to finish the homework','she needs to finish the homework now'])],
   ['Я хочу выучить английский лучше, поэтому каждый день немного занимаюсь и практикуюсь.',...combine(
    ['I want to learn English better','I want to improve my English','I want to learn better English'],
    ['I study and practice a little every day','every day I study and practice a little','I study and practice a little bit every day','I study a little and practice every day'],' so ')]
  ]
 ],
 l5:[
  [
   ['Я ищу своё кольцо. Я не могу его найти.',
    'I am looking for my ring. I cannot find it.','I am searching for my ring. I cannot find it.',
    'I am looking for my ring, but I cannot find it.'],
   ['Что ты ищешь? — Я ищу свой браслет.',
    'What are you looking for? I am looking for my bracelet.',
    'What are you searching for? I am searching for my bracelet.'],
   ['Ты ищешь эту серьгу?','Are you looking for this earring?','Are you searching for this earring?'],
   ['Я вижу заколку для волос возле сумки. Это твоя?',
    ...['I can see','I see'].flatMap(start=>['near','next to','by','beside'].map(place=>`${start} a hair clip ${place} the bag. Is it yours?`))],
   ['Я не могу найти свою резинку для волос. Ты её видишь?',
    'I cannot find my hair tie. Can you see it?','I cannot find my hair tie. Do you see it?',
    'I cannot find my hair elastic. Can you see it?','I cannot find my hair elastic. Do you see it?']
  ],[
   ['Моя сестра сейчас ищет своё ожерелье.',
    'My sister is looking for her necklace now.','Now my sister is looking for her necklace.',
    'My sister is looking for her necklace at the moment.','My sister is searching for her necklace now.',
    'My sister is looking for her necklace right now.'],
   ['Она не может его найти в своей комнате.','She cannot find it in her room.','She cannot find it in her bedroom.'],
   ['Ты видишь кольцо на столе? — Да, вот оно.',
    ...['Can you see','Do you see'].flatMap(start=>['the','a'].flatMap(article=>['here','there'].map(place=>`${start} ${article} ring on the table? Yes, ${place} it is.`)))],
   ['Мы ищем две серьги, но я вижу только одну.',...combine(
    ['We are looking for two earrings','We are searching for two earrings'],
    ['I can only see one','I can see only one','I only see one','I see only one'])],
   ['Ты ищешь браслет или заколку для волос?',
    'Are you looking for a bracelet or a hair clip?','Are you looking for the bracelet or the hair clip?',
    'Are you looking for a bracelet or hair clip?','Are you looking for the bracelet or hair clip?',
    'Are you searching for a bracelet or a hair clip?','Are you searching for the bracelet or the hair clip?']
  ]
 ]
};
function variants(answers){
 const set=new Set(answers);
 for(const answer of answers)set.add(answer.replace(/\bpracticing\b/g,'practising').replace(/\bpractice\b/g,'practise'));
 return [...set];
}
function build(key){
 if(!rows[key])throw Error('Unknown A1.2 Module 5 homework '+key);
 return rows[key].flatMap((block,b)=>block.map(([prompt,...answers],i)=>({
  version:1,id:`A1M5${key.toUpperCase()}-HW-${b+1}-${i+1}`,kind:'writing',
  title:`Translate into English · ${b+1}.${i+1}`,instruction:'Переведи предложение на английский.',
  responseMode:'accepted',revealPossibleAnswers:false,
  items:[{id:'1',prompt,normalization:'translation',acceptedAnswers:variants(answers)}]
 })));
}
const mapping=[
 {id:'a1-2-w5-l4',key:'l4',words:'A1M5L4_WORDS',repeat:'A1M5L4_REPEAT',practice:['A1M5L4_WORD_PRACTICE'],rules:['A1M5L4_RULE'],grammar:['A1M5L4_FORMS']},
 {id:'a1-2-w5-l5',key:'l5',words:'A1M5L5-W01',repeat:'A1M5L5-P01',practice:['A1M5L5-E04A'],rules:['A1M5L5-R04'],grammar:['A1M5L5-E11']}
];
const api={build,mapping};if(typeof module!=='undefined')module.exports=api;else root.SpaceWhaleHomeworkA12M5=api;
})(typeof window==='undefined'?globalThis:window);
