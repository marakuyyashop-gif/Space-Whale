/* Reviewed translation tasks for the two requested movement lessons. */
(function(root){
'use strict';
const product=(...parts)=>parts.reduce((rows,part)=>rows.flatMap(a=>(Array.isArray(part)?part:[part]).map(b=>a+b)),['']);
const determiner=n=>['the '+n,'a '+n];
const rows={
 move:[
 [
 ['Марк взобрался по лестнице.',product('Mark climbed up ',['the ladder','a ladder','the stairs']), 'Mark'],
 ['Анна перепрыгнула через лужу.',product('Anna jumped over ',determiner('puddle')),'Anna'],
 ['Бен шагнул на платформу.',product('Ben stepped ',['onto ','on to '],determiner('platform')),'Ben'],
 ['Мы переместились в гараж.',product('We moved into ',determiner('garage'))],
 ['Собака вышла из туннеля.',product(['The dog ','A dog '],['came out of ','went out of ','walked out of '],determiner('tunnel'))],
 ['Дети бегали вокруг дерева.',product(['The children ','Children ','The kids ','Kids '],['ran around ','ran round '],determiner('tree'))]
 ],[
 ['Поднимись по стене до самого верха.',product('Climb up ',determiner('wall'),[' to the top',' all the way to the top',' until you reach the top'])],
 ['Не прыгай через это бревно.',['Do not jump over this log']],
 ['Она шагнула на низкий ящик.',product('She stepped ',['onto ','on to '],determiner('low box'))],
 ['Они переместились внутрь здания.',product('They moved into ',determiner('building'))],
 ['Том вышел из палатки.',product('Tom ',['came out of ','went out of ','walked out of '],determiner('tent')),'Tom'],
 ['Собака быстро побежала вокруг машины.',product(['The dog ','A dog '],['quickly ran around ','ran quickly around ','quickly ran round '],determiner('car')).concat(product(['The dog ','A dog '],['ran around ','ran round '],determiner('car'),' quickly'))]
 ]],
 directions:[
 [
 ['Идите вдоль Кинг-стрит до моста.',product(['Go along ','Walk along '],'King Street',[' to the bridge',' until you reach the bridge',' as far as the bridge']),'King Street'],
 ['Перейдите мост на другую сторону.',product(['Walk across ','Go across ','Cross '],'the bridge',[' to the other side',''])],
 ['На перекрёстке продолжайте идти прямо.',product(['Keep going straight','Continue straight','Continue going straight'],[' at the intersection',' at the crossroads',' at the crossing']).concat(product(['At the intersection ','At the crossroads ','At the crossing '],['keep going straight','continue straight','continue going straight']))],
 ['Пройдите через парк.',product(['Continue through ','Walk through ','Go through '],'the park')],
 ['Направляйтесь к фонтану.',product(['Head towards ','Head toward ','Go towards ','Go toward ','Walk towards ','Walk toward '],'the fountain')],
 ['Пройдите мимо банка.',product(['Walk past ','Go past ','Pass '],'the bank')]
 ],[
 ['Спуститесь по лестнице и поверните направо.',product(['Go down the stairs','Walk down the stairs','Go downstairs','Walk downstairs'],' and turn right')],
 ['Пройдите мимо магазина и остановитесь у кинотеатра.',product(['Walk past ','Go past ','Pass '],['the shop','the store'],' and stop ',['at ','by ','outside '],['the cinema','the movie theater','the movie theatre'])],
 ['Продолжайте идти через сад до ворот.',product(['Continue through ','Continue walking through ','Keep walking through ','Walk through '],'the garden',[' to the gate',' to the gates',' until you reach the gate',' until you reach the gates'])],
 ['Идите вдоль реки, но не переходите мост.',product(['Go along ','Walk along '],'the river but do not ',['cross the bridge','walk across the bridge','go across the bridge'])],
 ['Направляйтесь к станции, но поверните налево, не доходя до неё.',product(['Head towards ','Head toward ','Go towards ','Go toward ','Walk towards ','Walk toward '],'the station but turn left ',['before you reach it','before reaching it','before it'])],
 ['Не сворачивайте на перекрёстке. Продолжайте идти прямо.',product('Do not turn at ',['the intersection','the crossroads','the crossing'],'. ',['Keep going straight','Continue straight','Continue going straight'])]
 ]]
};
function build(key){const prefix=key==='move'?'A2_MOVE':'A2_DIR';return rows[key].map((list,n)=>({version:1,id:prefix+'_HW'+(n+1),kind:'writing',title:'Translate into English.',instruction:'Переведите предложения на английский.',responseMode:'accepted',revealPossibleAnswers:false,items:list.map(([prompt,answers,placeholder],i)=>({id:String(i+1),prompt,normalization:'translation',acceptedAnswers:answers.map(a=>a+'.'),...(placeholder?{placeholder}:{})}))}));}
const mapping=[
 {id:'a2-1-w1-smy-2',key:'move',words:'A2_MOVE_M02-match',repeat:'A2_MOVE_M03',practice:['A2_MOVE_M05'],rules:['A2_MOVE_M04-rule']},
 {id:'a2-1-w1-smy-3',key:'directions',words:'A2_DIR_M02-match',repeat:'A2_DIR_M03',practice:['A2_DIR_M05'],rules:['A2_DIR_M04-rule']}
];
const api={build,mapping};if(typeof module!=='undefined')module.exports=api;else root.SpaceWhaleHomeworkA21=api;
})(typeof window==='undefined'?globalThis:window);
