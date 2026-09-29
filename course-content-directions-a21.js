(() => {
'use strict';
const kit=window.SpaceWhaleExerciseKit;
const id='a2-1-w1-smy-3';
const root='assets/lesson-media/a2-1/module-1/smy-3/';
const chunks=['go along','walk across','keep going straight','continue through','head towards','walk past','go down'];
const E=(id,kind,title,extra={})=>({version:1,id,kind,title,...extra});
const T=text=>({type:'text',text});
const D=(title,text,open=false)=>({type:'disclosure',title,text,open});
const I=file=>({type:'image',image:root+file,imageWidth:1000,imageHeight:620,alt:file==='test-route.svg'?'A dotted route from a bus stop along River Street, across a bridge, through a park, past a bank, towards a fountain, then down stairs to a café.':'A different dotted route from a station past a shop, through a garden, across a bridge, along Garden Street, then down stairs to a cinema.'});
const P=(id,title,blocks)=>E(id,'presentation',title,{blocks});
const S=(id,title,children,extra={})=>E(id,'stage',title,{exercises:children.map(exercise=>({id:exercise.id,exercise})),...extra});
const Q=(id,prompt,options,correctId,feedbackText)=>({id,prompt,options:options.map((text,i)=>({id:String.fromCharCode(65+i),text})),correctId,feedbackText});
const C=(id,title,items)=>E(id,'choice',title,{items});
const W=(id,title,items,instruction)=>E(id,'writing',title,{responseMode:'open',revealPossibleAnswers:true,items,instruction});
const phrases='Go along…\nWalk across…\nKeep going straight.\nContinue through…\nHead towards…\nWalk past…\nGo down…\n\nTurn left / right.\nDo I turn here?\nNo, keep going…';
const repeatTexts=['Go along River Street.','Walk across the bridge.','Keep going straight.','Continue through the park.','Head towards the fountain.','Walk past the bank.','Go down the stairs.','Pass the café.'];
const script="Hi, Alex. I’m at the café by the river. From the station, go along King Street. Walk past the cinema — don’t turn there. Continue through the small park. When you come out, head towards the bridge, but don’t cross it. Turn left before the bridge and go down the stairs. The café is at the bottom, on your right. See you there!";
const rule='Чтобы объяснить дорогу, используйте глагол в начальной форме без подлежащего: Go along River Street. Знакомые turn left / turn right помогают соединять участки маршрута.\n\nGo along — двигаться вдоль улицы, дорожки или реки. Walk across — пересечь открытое пространство или мост с одной стороны на другую. Continue through — продолжить путь через внутреннюю часть пространства: Continue through the park.\n\nWalk past — пройти мимо объекта и дальше: Walk past the bank. Глагол pass в этом значении уже содержит идею «пройти мимо»: Pass the bank. После pass не нужен past. Head towards — направляться к ориентиру: Head towards the fountain. Эта фраза не сообщает, что вы уже дошли до него; можно повернуть раньше.\n\nKeep going straight — продолжать прямо, не сворачивая. После keep здесь используется going: Keep going straight. После continue можно сказать through the park; также возможно continue walking. Head здесь — глагол «направляться», а не существительное «голова».\n\nGo down the stairs — спуститься по лестнице. В сочетании go down the street слово down может означать движение по улице и не обязательно указывает на склон. В упражнениях этого урока спуск показан лестницей.\n\nЭти описания могут сочетаться: Go along the street описывает путь относительно улицы, а Keep going straight — отсутствие поворота. Один и тот же участок может подходить к обеим фразам. Это не взаимоисключающие значения. Straight употребляется без объекта; после along / across / through / past / towards в изучаемых сочетаниях называем ориентир.';
const stages=[];
const step=(menu,time,exercise,notes)=>stages.push({menu,navigationTitle:menu,section:'tasks',guide:{time:time+' min',teacherNotes:notes},exercise});
step('Test Task',2,P('A2_DIR_M01','Help your friend find the café.',[
 T('Your friend is at the bus stop. You are at the café. Your friend calls you for directions.'),I('test-route.svg'),
 T('Explain the dotted route from START to FINISH. Your partner follows it and asks a question if anything is unclear.'),D('Useful phrases',phrases,true)
]),'Цель: диагностировать объяснение маршрута до обучения. 20–30 секунд на карту, затем короткий маршрут и одно уточнение в оставшееся время. Пунктир задаёт путь, но не английские предложения. Лестница дана сбоку: upper path → lower path. Допустимы cross / go past и другие естественные замены. Отметить: самостоятельно / с Useful phrases / с помощью преподавателя; не исправлять каждую реплику. Открытые опоры не дают готового ответа. Это совместная ролевая практика по общей карте, не information gap.');
const definitions=[
 ['along','go along','follow the length of a road or path'],
 ['across','walk across','walk from one side to the other side of an open space or a bridge'],
 ['straight','keep going straight','continue without turning left or right'],
 ['through','continue through','carry on inside a place and leave it on the other side'],
 ['towards','head towards','move in the direction of a place'],
 ['past','walk past','walk by a place and continue beyond it'],
 ['down','go down','move from a higher place to a lower place']
];
step('Phrase Input',4,S('A2_DIR_M02','Match the phrases with their meanings.',[
 E('A2_DIR_M02-match','matching','Match the phrases with their meanings.',{
 items:definitions.map(([id,text])=>({id,text,correctId:id})),
 options:[4,1,6,0,5,2,3].map(i=>({id:definitions[i][0],text:definitions[i][2]}))}),
 P('A2_DIR_M02-pass','One more way to say it.',[T('Pass the bank = walk past the bank.\n\nThe bank is next to your route. You do not go inside; you keep walking.'),I('test-route.svg'),T('Look at the map again. Show a place you pass on your way to the café.')])
],{progressive:true,requireCheckBeforeNext:true}),'Цель: ввести все семь сочетаний и pass. Сначала дать ученику попытаться сопоставить значения, затем вместе проверить; это ввод с поддержкой, а не тест после объяснения. При необходимости показать участок карты. Не объявлять одну линию на карте однозначным изображением along / straight / towards. Down здесь — значение со stairs. Pass вводится и применяется в последней короткой реплике. Базовые go / walk знакомы; keep going, continue, head и pass изучаются в контексте, без второго искусственного словарного списка.');
step('Pronunciation',2,E('A2_DIR_M03','audio','Listen and repeat.',{
 layout:'listen-repeat',instruction:'Listen and repeat each phrase.',
 items:repeatTexts.map((text,i)=>({id:'A2_DIR_P'+String(i+1).padStart(2,'0'),text,audio:root+'audio/A2_DIR_P'+String(i+1).padStart(2,'0')+'_r1.mp3'}))
}),'Цель: произнести восемь осмысленных фраз. Преподаватель включает каждую запись; ученик слушает и повторяет. Работать целыми сочетаниями; не читать названия предлогов отдельно. Не засчитывать этот этап как Listening comprehension. Восемь отдельных записей Jessica, строго по видимым строкам.');
step('Language Focus',3,S('A2_DIR_M04','Notice how the directions work.',[
 C('A2_DIR_M04-discovery','Notice how the directions work.',[
 Q('1','“Walk past the café.” / “Pass the café.”\nDo these directions describe the same movement?',['Yes, both take you beyond the café.','No, the second tells you to go inside.'],'A','Both directions tell you to go past the café.'),
 Q('2','“Head towards the bridge, but turn left before you reach it.”\nDo you need to reach the bridge?',['Yes.','No.'],'B','No. Turn left before you reach the bridge.'),
 Q('3','“Go along River Street. At the next crossing, keep going straight.”\nWhat does the second instruction add?',['Leave River Street.','Cross the river.','Do not turn at the crossing.'],'C','Do not turn at the crossing.')]),
 E('A2_DIR_M04-rule','rule-page','How to give directions.',{blocks:[{type:'rule',title:'',text:rule,highlights:['Go along','Walk across','Continue through','Walk past','Pass the bank.','Head towards','Keep going straight','Go down the stairs','go down the street']}]})
],{progressive:true,requireCheckBeforeNext:true}),'Цель: после ввода значений вывести важные различия и форму; не повторять семипунктовое matching. Сначала три решения, затем правило через стрелку. Обязательно проговорить pass + объект без past; keep going, не keep go; towards не означает обязательного достижения. Не учить, что down всегда только вниз. Полный текст правила остаётся доступным, но преподаватель выделяет проблемные места вместо чтения всей страницы вслух.');
const g=(id,before,options,answer,after)=>({id,segments:[before,{id:'A2_DIR_G'+id,options,answers:[answer]},after]});
step('Controlled Practice',3,E('A2_DIR_M05','gaps','Choose the correct words.',{inputMode:'select',items:[
 g('1','The café is on the opposite side of the square. Walk ',['past','across','towards'],'across',' the square to get to that side.'),
 g('2','Stay outside the shop. Walk ',['through','across','past'],'past',' it and stop at the next building.'),
 g('3','Enter the park at this gate and leave by the gate on the other side. Continue ',['through','past','towards'],'through',' the park.'),
 g('4','You are on the upper path; the café is on the lower path. Go ',['across','down','past'],'down',' the stairs to the café.'),
 g('5','Stay on this road as it follows the river. Go ',['across','through','along'],'along',' River Street until you reach the bridge.'),
 g('6','Do not turn at the crossing. Keep ',['go straight','going straight','to go straight'],'going straight',' until you reach the bank.'),
 g('7','The cinema is the building after the café. ',['Pass','Pass past','Pass towards'],'Pass',' the café and stop at the cinema.')
]}),'Цель: выбрать направление и форму в однозначном контексте. Towards проверен в discovery и далее в Listening; не добавлять искусственный восьмой пункт ради количества. Контекст второго пункта исключает through; четвёртого — past. В первом towards не означает завершённого пересечения, тогда как инструкция требует попасть на другую сторону. После OK — полное правильное предложение; правило в feedback не добавлять.');
step('Listening',4,S('A2_DIR_M06','Find the meeting place.',[
 E('A2_DIR_M06-audio','audio','Listen to the message.',{audio:root+'audio/A2_DIR_LISTENING_r1.mp3',instruction:'Alex is at the station. Listen to the message.'}),
 C('A2_DIR_M06-main','Find the meeting place.',[Q('1','Where is Alex meeting his friend?',['At the cinema.','At a café by the river.','At the station.'],'B','Alex is meeting his friend at a café by the river.')]),
 C('A2_DIR_M06-details','Listen again and follow the directions.',[
 Q('1','What should Alex do at the cinema?',['Turn towards its entrance.','Go inside.','Walk past it.'],'C','Alex should walk past the cinema.'),
 Q('2','What should Alex do when he sees the bridge?',['Turn left before it.','Walk across it.','Go back to the station.'],'A','Alex should turn left before the bridge.'),
 Q('3','Where exactly is the café?',['At the top of the stairs, on the left.','At the bottom of the stairs, on the right.','Inside the park, by the entrance.'],'B','The café is at the bottom of the stairs, on the right.')])
],{progressive:true,revealStops:[2,3],requireCheckBeforeNext:true,transcript:script,transcriptTitle:'Transcript',transcriptAfter:['A2_DIR_M06-main','A2_DIR_M06-details']}),'Цель: понять голосовое сообщение и критические повороты. Это другой маршрут: не показывать карту Test Task как иллюстрацию записи. Первое прослушивание целиком — общий результат; второе — детали. Три вопроса открываются по одному штатными стрелками, источник доступен. Transcript закрыт до попыток всех вопросов. Запись доступна в плеере; текст только в teacher notes и закрытом Transcript.\n\nТОЧНЫЙ АУДИОСКРИПТ:\n'+script);
step('Correction',2,W('A2_DIR_M08','Check the directions.',[
 {id:'1',prompt:'Keep go straight at the crossing.',possibleAnswers:['Keep going straight at the crossing.']},
 {id:'2',prompt:'Pass past the bank and stop at the next building.',possibleAnswers:['Pass the bank and stop at the next building.','Walk past the bank and stop at the next building.']},
 {id:'3',prompt:'Head towards to the station.',possibleAnswers:['Head towards the station.','Head to the station.']}
],'Your friend wrote these directions. Correct one mistake in each sentence. Keep the same meaning.'),'Цель: самостоятельно исправить форму без вариантов ответа. Ученик вводит исправленные предложения. Проверка преподавателем; Possible answers после попытки, без автоматической оценки свободного текста. Принимать естественные исправления: Pass the bank / Walk past the bank; Head towards the station / Head to the station. Ошибка заранее не выделяется.');
step('Guided Writing',3,S('A2_DIR_M09','Send your friend directions.',[
 P('A2_DIR_M09-map','Send your friend directions.',[
 T('Your friend is on the road just past the bank. You are waiting at the café.'),I('test-route.svg'),
 T('Look at the map. Write a short message to your friend. Explain how to get from the bank to the café.'),
 D('Useful phrases','Head towards…\nTurn… before…\nGo down…\nKeep going…\nThe café is…',true)]),
 W('A2_DIR_M09-message','Your message.',[{id:'1',prompt:'Write 3–4 sentences.',multiline:true,possibleAnswers:['Head towards the fountain, but turn left before you reach it. Turn left at the corner and go down the stairs. Keep going straight at the crossing. The café is in front of you.']}])
],{progressive:true,revealStops:[2]}),'Цель: объединить изученные направления в коротком сообщении адресату перед Final Speaking. Карта, Useful phrases и поле сообщения доступны вместе. Старт после банка: не описывать заново путь от bus stop. Критерии: верное направление к фонтану и поворот до него, спуск по лестнице, прямо через пересечение к кафе; понятный порядок. Естественные варианты принимаются. Учитель проверяет содержание, образец после попытки; не оценивать буквальное совпадение.');
step('Final Speaking',5,S('A2_DIR_M07','Help your friend get to the cinema.',[
 P('A2_DIR_M07-speaking','Help your friend get to the cinema.',[
 T('Your friend is at the station. You are waiting at the cinema. Explain how to get there.'),I('final-route.svg'),
 T('Look at the map. Follow the black line from START to FINISH. Tell your friend how to get there. Your friend asks one question about the way.'),D('Useful phrases',phrases,true)]),
 P('A2_DIR_M07-sample','Compare your directions.',[D('Possible answers','Walk past the shop and continue through the garden. Walk across the bridge. Then go along Garden Street and turn right at the end. Then turn right again. Keep going straight at the crossing. Go down the stairs and head towards the cinema.\n\nPartner: Do I turn at the crossing?\nYou: No, keep going straight.')])
],{progressive:true}),'Цель: то же умение, что в Test Task, на другом маршруте, без нового времени и придумывания истории. Карта общая; не называть это information gap. 1 минута на подготовку, 3 на объяснение и уточнение, 1 на исправление. Оценка: понятен порядок; направления соответствуют пути; сочетания выбраны по смыслу; собеседник может следовать указаниям. Не требовать все chunks и точного совпадения с sample. Along и straight могут совместно описывать участок. Useful phrases остаются открытыми. Образец только после попытки через стрелку и закрытое раскрытие.\n\nЕщё 2 минуты Feedback: сравнить начальную и итоговую попытки при одинаковых опорах; назвать один удачный участок и предложить исправить одну реально возникшую ошибку. Если времени мало, сократить повторные произнесения уже освоенных строк; не убирать Final.');
const homework=[
 ['Выйдите из отеля и идите вдоль Ривер-стрит до входа в парк.','Leave the hotel and go along River Street until you reach the park entrance.'],
 ['Пройдите через парк к воротам на другой стороне.','Walk through the park to the gate on the other side.'],
 ['За воротами поверните направо и пройдите мимо банка.','After the gate, turn right and walk past the bank.'],
 ['Продолжайте идти прямо до лестницы. Спуститесь по ней; кафе справа внизу.','Keep going straight until you reach the stairs. Go down them; the café is at the bottom on your right.'],
 ['Мы у вокзала. Как нам пройти в кинотеатр?','We are at the station. How do we get to the cinema?'],
 ['Перейдите через площадь на другую сторону.','Walk across the square to the other side.'],
 ['Направляйтесь к фонтану, но поверните направо перед ним.','Head towards the fountain, but turn right before you reach it.'],
 ['Пройдите мимо магазина; кинотеатр — следующее здание.','Pass the shop; the cinema is the next building.']
];
const homeworkStages=[];
for(let n=0;n<2;n++)homeworkStages.push({menu:'Homework '+(n+1),navigationTitle:'Homework '+(n+1),section:'self-study',guide:{teacherNotes:'Отдельно от 30 минут урока. Перевод по смыслу; образцы — возможные ответы, не exact-match ключ. Принимать естественные синонимы, отмечая освоение целевых сочетаний.'},exercise:W('A2_DIR_HW'+(n+1),n===0?'From the hotel to the café.':'From the station to the cinema.',homework.slice(n*4,n*4+4).map(([prompt,answer],i)=>({id:String(i+1),prompt,possibleAnswers:[answer]})),'Translate the directions into English.')});
const lesson={id,title:'Уроки для Smy 3',topic:'Подскажите, как пройти…',level:'A2.1',whale:1,summary:'Объясняем маршрут и уточняем направление. Карты, записи фраз и голосовое сообщение.',grammar:'Verbs of movement + prepositions of movement',constructions:chunks.join('; ')+'; pass + place',words:['go','walk','keep going','continue','head','pass'],durationMinutes:30,plannedTeachingMinutes:28,feedbackMinutes:2,source:'docs/lessons/smy-a21-directions-scenario.md',stages,feedback:{id:'A2_DIR_FEEDBACK',minutes:2,teacherNotes:'Один успех и одна самостоятельная коррекция по результатам Final.'},productionStatus:{content:'reviewed',maps:'schematic',audio:'recordings-published-auditory-review-pending'}};
window.SpaceWhaleLessonMedia=window.SpaceWhaleLessonMedia||{};
window.SpaceWhaleLessonMedia[id]=Object.fromEntries(repeatTexts.map((script,i)=>['A2_DIR_P'+String(i+1).padStart(2,'0'),{type:'audio',src:root+'audio/A2_DIR_P'+String(i+1).padStart(2,'0')+'_r1.mp3',script}]));
window.SpaceWhaleLessonMedia[id].A2_DIR_LISTENING={type:'audio',src:root+'audio/A2_DIR_LISTENING_r1.mp3',script};
const homeworkLesson={id:id+'-homework',title:'Homework — Smy 3',topic:'Подскажите, как пройти… — домашняя работа',level:null,whale:null,parentLessonId:id,summary:'Два перевода после Lesson 3. Домашняя работа отдельно от занятия.',grammar:'Verbs of movement + prepositions of movement',constructions:chunks.join('; ')+'; pass + place',stages:homeworkStages,source:lesson.source};
for(const s of [...stages,...homeworkStages])kit.validate(s.exercise);
window.SpaceWhaleContent=window.SpaceWhaleContent||[];
window.SpaceWhaleContent.push(lesson,homeworkLesson);
})();
