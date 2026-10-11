/* Translation homework for A2.2 Module 6. Each sentence is one checked step. */
(function(root){
'use strict';
const rows={
 l1:[
  [
   ['С экраном что-то не так.','There is something wrong with the screen.','Something is wrong with the screen.'],
   ['Ты видишь что-нибудь на экране?','Can you see anything on the screen?','Do you see anything on the screen?'],
   ['Я ничего не вижу на экране.','I cannot see anything on the screen.','I do not see anything on the screen.','I can see nothing on the screen.','I see nothing on the screen.'],
   ['Я нажимаю кнопку, но ничего не происходит.','I press the button, but nothing happens.','I am pressing the button, but nothing is happening.','I press the button, but nothing is happening.','I am pressing the button, but nothing happens.','I push the button, but nothing happens.'],
   ['Всё остальное работает нормально.','Everything else works fine.','Everything else works normally.','Everything else is working fine.','Everything else is working normally.','Everything else works well.']
  ],[
   ['С клавиатурой что-то не так?','Is there something wrong with the keyboard?','Is anything wrong with the keyboard?','Is something wrong with the keyboard?'],
   ['Ты заметила что-нибудь необычное?','Did you notice anything unusual?','Have you noticed anything unusual?','Do you notice anything unusual?','Did you notice anything strange?','Have you noticed anything strange?'],
   ['Я не могу найти ничего плохого в кабеле.','I cannot find anything wrong with the cable.','I can find nothing wrong with the cable.','I cannot see anything wrong with the cable.'],
   ['Ничего не работает, когда я подключаю этот кабель.','Nothing works when I connect this cable.','Nothing works when I plug in this cable.','Nothing is working when I connect this cable.','Nothing is working when I plug in this cable.'],
   ['Сейчас всё работает?','Does everything work now?','Is everything working now?']
  ],[
   ['На экране что-то появилось.','Something appeared on the screen.','Something has appeared on the screen.','Something came up on the screen.'],
   ['Что-нибудь происходит, когда ты нажимаешь эту кнопку?','Does anything happen when you press this button?','Is anything happening when you press this button?','Does anything happen when you push this button?'],
   ['Пульт ничего не меняет.','The remote control does not change anything.','The remote does not change anything.','The remote control changes nothing.','The remote changes nothing.'],
   ['Я не могу сделать ничего с мышью.','I cannot do anything with the mouse.','I can do nothing with the mouse.','I cannot do anything using the mouse.'],
   ['Всё подключено, но что-то всё ещё не работает.','Everything is connected, but something still does not work.','Everything is connected, but something still is not working.','Everything is plugged in, but something still does not work.','Everything is plugged in, but something still is not working.']
  ]
 ],
 l2:[
  [
   ['Мне нужно где-нибудь отправить посылку.','I need somewhere to send a package.','I need to find somewhere to send a package.','I need a place to send a package.'],
   ['Здесь есть где-нибудь место, где можно купить конверт?','Is there anywhere here to buy an envelope?','Is there anywhere to buy an envelope here?','Is there somewhere here to buy an envelope?','Is there somewhere to buy an envelope here?','Is there anywhere here where I can buy an envelope?','Is there a place here where I can buy an envelope?'],
   ['Я нигде не могу купить лекарство.','I cannot buy medicine anywhere.','I cannot find anywhere to buy medicine.','There is nowhere I can buy medicine.','I can buy medicine nowhere.'],
   ['Здесь негде арендовать машину.','There is nowhere to rent a car here.','There is not anywhere to rent a car here.','I cannot rent a car anywhere here.'],
   ['Я искала место для этой услуги везде.','I looked everywhere for a place that offers this service.','I looked everywhere for a place to get this service.','I searched everywhere for a place that offers this service.','I looked everywhere for this service.','I searched everywhere for this service.']
  ],[
   ['Мы нашли место, где можно сделать ксерокопию.','We found somewhere to make a photocopy.','We found a place to make a photocopy.','We found somewhere we can make a photocopy.','We found a place where we can make a photocopy.','We found somewhere to get a photocopy.'],
   ['Ты знаешь где-нибудь место, где можно записаться на приём?','Do you know anywhere to book an appointment?','Do you know somewhere to book an appointment?','Do you know a place where I can book an appointment?','Do you know anywhere I can book an appointment?'],
   ['Я не могу найти нигде место, где можно отправить посылку.','I cannot find anywhere to send a package.','I cannot find a place where I can send a package.','I can find nowhere to send a package.','I cannot find a place to send a package anywhere.'],
   ['В этом районе везде можно купить конверты.','You can buy envelopes everywhere in this area.','In this area, you can buy envelopes everywhere.','Envelopes are sold everywhere in this area.','There are places to buy envelopes everywhere in this area.'],
   ['Рядом с нашим отелем негде купить лекарство.','There is nowhere to buy medicine near our hotel.','There is not anywhere to buy medicine near our hotel.','We cannot buy medicine anywhere near our hotel.']
  ],[
   ['Мне нужно найти место, где можно арендовать машину.','I need to find somewhere to rent a car.','I need to find a place to rent a car.','I have to find somewhere to rent a car.','I need to find a place where I can rent a car.'],
   ['Мы искали везде, но нигде не нашли место, где можно сделать ксерокопию.','We looked everywhere, but we could not find anywhere to make a photocopy.','We searched everywhere, but we could not find anywhere to make a photocopy.','We looked everywhere, but found nowhere to make a photocopy.','We looked everywhere, but could not find a place to make a photocopy.'],
   ['Здесь есть где-нибудь место, где можно записаться на приём?','Is there anywhere here to book an appointment?','Is there anywhere to book an appointment here?','Is there somewhere here to book an appointment?','Is there somewhere to book an appointment here?','Is there a place here where I can book an appointment?'],
   ['Я знаю место, где можно купить лекарство.','I know somewhere to buy medicine.','I know a place to buy medicine.','I know a place where you can buy medicine.','I know somewhere you can buy medicine.'],
   ['Сегодня мне негде отправить эту посылку.','There is nowhere for me to send this package today.','I have nowhere to send this package today.','I cannot send this package anywhere today.','There is not anywhere for me to send this package today.','There is nowhere to send this package today.']
  ]
 ]
};
function variants(answers){
 const set=new Set(answers);const contractions=[[/\bthere is\b/gi,"there's"],[/\bthere is not\b/gi,"there isn't"],[/\bis not\b/gi,"isn't"],[/\bdoes not\b/gi,"doesn't"],[/\bdo not\b/gi,"don't"],[/\bcannot\b/gi,"can't"],[/\bcould not\b/gi,"couldn't"],[/\bi am\b/gi,"I'm"]];
 for(const [from,to] of contractions)for(const answer of [...set])set.add(answer.replace(from,to));
 return [...set];
}
function build(key){if(!rows[key])throw Error('Unknown A2.2 homework '+key);
 return rows[key].flatMap((block,blockIndex)=>block.map(([prompt,...answers],i)=>({
  version:1,id:`A22M6${key.toUpperCase()}-HW-${blockIndex+1}-${i+1}`,kind:'writing',
  title:`Translate into English · ${blockIndex+1}.${i+1}`,
  instruction:'Переведи предложение на английский.',responseMode:'accepted',revealPossibleAnswers:false,
  items:[{id:'1',prompt,normalization:'translation',acceptedAnswers:variants(answers)}]
 })));
}
const mapping=[
 {id:'a2-2-w6-l1',key:'l1',words:'A22M6L1-M02',repeat:'A22M6L1-M03',practice:['A22M6L1-M04'],rules:['A22M6L1-M06'],grammar:['A22M6L1-M09']},
 {id:'a2-2-w6-l2',key:'l2',words:'A22M6L2-M02',repeat:'A22M6L2-M03',practice:['A22M6L2-M04'],rules:['A22M6L2-M06'],grammar:['A22M6L2-M09']}
];
const api={build,mapping};if(typeof module!=='undefined')module.exports=api;else root.SpaceWhaleHomeworkA22M6=api;
})(typeof window==='undefined'?globalThis:window);
