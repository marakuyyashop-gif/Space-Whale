(() => {
  'use strict';
  // Synthetic fixtures only. All rendering/state belongs to exercise-kit.js.
  const base = (id, kind, title, data = {}) => ({version:1,id,kind,title,...data});
  const image = number => ({image:`assets/factory/image-${number}.svg`,alt:`[Image ${number}]`});
  const option = (id, text) => ({id,text});
  const sound = 'assets/factory/test-tone.wav';
  const matching = (id, layout = 'cards') => base(id,'matching',layout === 'word-definition' ? 'Word–Definition' : layout === 'picture-word' ? 'Picture–Word' : 'Match the Halves', {
    layout, instruction:'Выберите подходящую пару.',
    items:[1,2,3].map(n => ({id:`item${n}`,text:layout === 'word-definition' ? `[Word ${n}]` : `[Sentence beginning ${n}]`,correctId:`option${n}`,...(layout === 'picture-word' ? image(n) : {})})),
    options:[2,3,1].map(n => option(`option${n}`,layout === 'word-definition' ? `[Definition ${n}]` : layout === 'picture-word' ? `[Word ${n}]` : `[Sentence ending ${n}]`))
  });
  const gaps = (id, bank = false, select = false) => base(id,'gaps',select ? 'Inline Dropdown' : bank ? 'Typed Gap + Word Bank' : 'Typed Gap', {
    instruction:select ? 'Выберите вариант внутри пропуска.' : 'Введите ответ с клавиатуры. Технический ответ: [Form 1].',
    inputMode:select ? 'select' : 'text', ...(bank ? {bank:['[Word 2]','[Word 1]']} : {}),
    items:[{id:'sentence1',segments:['[Sentence beginning] ',{id:'gap1',answers:['[Form 1]'],...(select ? {options:['[Form 2]','[Form 1]']} : {})},' [Sentence ending].']}]
  });
  const choice = (id, multiple = false, pictures = false) => base(id,'choice',`${pictures ? 'Image' : 'Text'} ${multiple ? 'Multiple Select' : 'Single Choice'}`, {
    multiple,layout:pictures ? 'image-grid' : 'list',instruction:multiple ? 'Выберите A и C. Проверка появится только после OK.' : 'Выберите B. До OK можно изменить ответ.',
    items:[{id:'question1',prompt:'[Question]',options:['A','B','C'].map((text,i) => ({id:text,text:`[Option ${text}]`,...(pictures ? image(i+1) : {})})),...(multiple ? {correctIds:['A','C']} : {correctId:'B'})}]
  });
  const order = (id, pictures = false) => base(id,'order',pictures ? 'Picture / Event Order' : 'Sentence / Chunk Order', {
    layout:pictures ? 'image-grid' : 'tokens',instruction:'Соберите 1 → 2 → 3. Нажмите или перетащите. Для перестановки перетащите перед другим элементом; с клавиатуры — Alt + ← / →. Нажатие возвращает элемент в набор.',
    tokens:[3,1,2].map(n => ({id:`token${n}`,text:`[${pictures ? 'Event' : 'Chunk'} ${n}]`,...(pictures ? image(n) : {})})),correctOrder:['token1','token2','token3']
  });
  const sort = id => base(id,'sort','Sort into Groups', {
    instruction:'Перетащите 1 в A, 2 в B. Можно менять группу или возвращать элемент в набор. Нажмите на размещённый элемент, чтобы вернуть его. С клавиатуры: Alt + ← / →.',
    groups:[option('A','[Category A]'),option('B','[Category B]')],items:[{id:'item1',text:'[Item 1]',correctId:'A'},{id:'item2',text:'[Item 2]',correctId:'B'}]
  });
  const audio = (id, script = false) => base(id,'audio','Global Audio', {audio:sound,instruction:'[Listening instruction]',...(script ? {transcript:'[Audio script: three test tones]'} : {})});
  const reading = id => base(id,'presentation','Reading', {blocks:[{type:'text',text:'[Reading text / dialogue]'}]});
  const stage = (id, title, definitions, progressive = false) => base(id,'stage',title,{progressive,...(!progressive ? {layout:'grouped',instruction:'[Exercise instruction]'} : {}),exercises:definitions.map((exercise,i) => ({id:`block${i+1}`,exercise:progressive ? exercise : {...exercise,instruction:''}}))});
  const examples = [
    matching('matching-demo'),
    gaps('inline-demo',false,true),
    gaps('typed-demo'),
    gaps('bank-demo',true),
    choice('choice-demo'),
    order('order-demo'),
    sort('sort-demo'),
    base('writing-demo','writing','Open Writing',{instruction:'[Writing instruction] Ответ оценивает преподаватель.',items:[{id:'response',prompt:'[Writing prompt]',possibleAnswers:['[Possible answer]']}]}),
    base('presentation-demo','presentation','Speaking / Presentation',{blocks:[{type:'text',text:'[Speaking situation]\n[Speaking prompt]'}]}),
    base('image-label-demo','image-label','Image Label',{instruction:'Перетащите подписи в зоны. Подпись остаётся там до вашего следующего действия. Нажатие возвращает подпись в набор. С клавиатуры: Alt + ← / →.',...image(1),items:[{id:'target1',prompt:'[Target 1]',x:30,y:45,correctId:'label1'},{id:'target2',prompt:'[Target 2]',x:70,y:70,correctId:'label2'}],options:[option('label2','[Label 2]'),option('label1','[Label 1]')]}),
    order('picture-order-demo',true),
    audio('audio-demo'),
    base('listen-repeat-demo','audio','Listen & Repeat',{layout:'listen-repeat',instruction:'Технические звуковые сигналы. Запуск следующего останавливает предыдущий.',items:[1,2].map(n=>({id:`item${n}`,text:`[Phrase ${n}]`,audio:sound}))}),
    matching('picture-word-demo','picture-word'),
    matching('word-definition-demo','word-definition'),
    base('rule-page-demo','rule-page','Guided Discovery',{blocks:[{type:'text',title:'[Exercise instruction]',text:'[Example 1 with target form]\n[Example 2 with target form]',highlights:['target form']},{type:'exercise',id:'notice',exercise:choice('discovery-choice')},{type:'rule',title:'Rule',text:'[Rule explanation]',formula:'[Form] + [Form]',examples:['[Example]']}]}),
    {...gaps('error-correction-demo'),title:'Error Correction',instruction:'Исправьте только выделенный фрагмент. Технический ответ: [Correct form].',items:[{id:'correction1',segments:['[Unchanged context] ([Incorrect form]) → ',{id:'corrected',answers:['[Correct form]']},' [Unchanged ending].']}]},
    choice('image-choice-demo',false,true),
    choice('multiple-choice-demo',true),
    choice('image-multiple-demo',true,true),
    base('speaking-language-demo','presentation','Speaking · Use phrases',{blocks:[{type:'text',text:'[Speaking situation]\n[Speaking prompt]'},{type:'disclosure',title:'Use phrases',text:'[Phrase 1]\n[Phrase 2]',open:true}]}),
    base('possible-answers-demo','presentation','Possible Answers',{blocks:[{type:'text',text:'[Open task prompt]'},{type:'disclosure',title:'Possible Answers',role:'possible-answers',text:'[Model response]'}]}),
    audio('audio-script-demo',true),
    base('reference-demo','rule-page','Rule / Language Reference',{blocks:[{type:'rule',title:'[Rule title]',text:'[Language reference]',formula:'[Form] + [Form]',examples:['[Example 1]','[Example 2]']}]}),
    stage('reading-choice-demo','Reading + Choice',[reading('rc-source'),choice('rc-task')]),
    stage('reading-gap-demo','Reading + Gap',[reading('rg-source'),gaps('rg-task')]),
    stage('listening-choice-demo','Listening + Choice',[audio('lc-source'),choice('lc-task')]),
    stage('listening-gap-demo','Listening + Gap',[audio('lg-source'),gaps('lg-task')]),
    stage('listening-sort-demo','Listening + Sort / Speaker Attribution',[audio('ls-source'),sort('ls-task')]),
    stage('listening-order-demo','Listening + Order',[audio('lo-source'),order('lo-task')]),
    stage('progressive-stage-demo','Stage · последовательное раскрытие',[reading('ps-source'),choice('ps-choice'),gaps('ps-gaps')],true)
  ];
  const kit = window.SpaceWhaleExerciseKit;
  examples.forEach((definition,index) => { definition.label = `${index+1} · ${definition.title}`; kit.validate(definition); });
  // Keep legacy fixtures available for regression coverage, not as catalog entries.
  window.SpaceWhaleTemplateExamples = examples;
  const byId = id => examples.find(example => example.id === id);
  const preview = (id, title, group, definition, legacyIds = [], description = '') => ({
    ...definition, id, title, label:title, catalogGroup:group, legacyIds, description
  });
  const variants = (id, title, ids) => stage(id, title, ids.map(byId), true);
  const templates = [
    preview('audio-template','Audio','materials',byId('audio-script-demo'),['audio-demo','audio-script-demo'],'Аудиоплеер с необязательным транскриптом.'),
    preview('text-template','Text','materials',reading('text-source'),[],'Текст, диалог или примеры для любого задания.'),
    preview('image-template','Image','materials',base('image-source','presentation','Image',{blocks:[{type:'image',...image(1)}]}),[],'Изображение как материал или опора.'),
    preview('rule-template','Rule','materials',byId('reference-demo'),['reference-demo'],'Правило, формула и примеры.'),
    preview('phrases-template','Useful phrases','materials',base('phrases-source','presentation','Useful phrases',{blocks:[{type:'disclosure',title:'Useful phrases',text:'[Phrase 1]\n[Phrase 2]',open:true}]}),[],'Фразы для выполнения задания.'),
    preview('answers-template','Possible answers','materials',base('answers-source','presentation','Possible answers',{blocks:[{type:'disclosure',title:'Possible answers',role:'possible-answers',text:'[Model response]'}]}),['possible-answers-demo'],'Примеры допустимых формулировок, без автоматической оценки.'),
    preview('matching-template','Matching','mechanics',variants('matching-variants','Matching',['matching-demo','picture-word-demo','word-definition-demo']),['matching-demo','picture-word-demo','word-definition-demo'],'Соединение пар: фрагменты, картинки или определения.'),
    preview('choice-template','Single Choice','mechanics',variants('choice-variants','Single Choice',['choice-demo','image-choice-demo']),['choice-demo','image-choice-demo'],'Один ответ: текстовые или графические варианты.'),
    preview('multiple-template','Multiple Select','mechanics',variants('multiple-variants','Multiple Select',['multiple-choice-demo','image-multiple-demo']),['multiple-choice-demo','image-multiple-demo'],'Несколько ответов: текстовые или графические варианты.'),
    preview('typed-template','Typed Input / Gap','mechanics',variants('typed-variants','Typed Input / Gap',['typed-demo','bank-demo','error-correction-demo']),['typed-demo','bank-demo','error-correction-demo'],'Ввод в пропуск, банк слов как опора и исправление фрагмента.'),
    preview('dropdown-template','Dropdown','mechanics',byId('inline-demo'),['inline-demo'],'Выбор ответа из списка внутри поля.'),
    preview('order-template','Order','mechanics',variants('order-variants','Order',['order-demo','picture-order-demo']),['order-demo','picture-order-demo'],'Порядок слов, фрагментов, картинок или событий.'),
    preview('sort-template','Sort','mechanics',byId('sort-demo'),['sort-demo'],'Распределение элементов по группам.'),
    preview('image-label-template','Image Label','mechanics',byId('image-label-demo'),['image-label-demo'],'Размещение подписей на изображении.'),
    preview('writing-template','Text / Writing field','mechanics',stage('writing-modes','Text / Writing field',[
      base('accepted-writing-demo','writing','Accepted answers',{responseMode:'accepted',instruction:'Переведите: «Я опоздал(а)». Допускаются полная и краткая формы.',items:[{id:'response',prompt:'[Your answer]',acceptedAnswers:['I am late.',"I’m late.",'I am late',"I’m late","I'm late.","I'm late"]}]}),
      {...byId('writing-demo'),responseMode:'open'}
    ],true),['writing-demo'],'Проверка по accepted answers или свободный ответ без автоматической оценки.'),
    preview('repeat-template','Listen & Repeat','compositions',byId('listen-repeat-demo'),['listen-repeat-demo'],'Аудио и отдельные слова или фразы для повторения.'),
    preview('audio-task-template','Audio + task','compositions',stage('audio-tasks','Audio + task',[audio('at-source',true),choice('at-choice'),gaps('at-gap'),sort('at-sort'),order('at-order')]),['listening-choice-demo','listening-gap-demo','listening-sort-demo','listening-order-demo'],'Аудио и первое задание доступны вместе; следующие задания раскрываются стрелкой.'),
    preview('text-task-template','Text + task','compositions',stage('text-tasks','Text + task',[reading('tt-source'),choice('tt-choice'),gaps('tt-gap')]),['reading-choice-demo','reading-gap-demo'],'Текст и первое задание доступны вместе; следующие задания раскрываются стрелкой.'),
    preview('image-task-template','Image + task','compositions',stage('image-task','Image + task',[
      base('it-source','presentation','Image',{blocks:[{type:'image',...image(1)}]}),
      base('it-speaking','presentation','Speaking',{blocks:[{type:'text',text:'[Describe the picture. What can you see?]'}]})
    ]),[],'Пример Image + Speaking. Изображение также сочетается с механиками ответа.'),
    preview('speaking-template','Speaking layout','compositions',byId('speaking-language-demo'),['presentation-demo','speaking-language-demo'],'Ситуация и вопрос с необязательными Useful phrases.'),
    preview('sequence-template','Progressive sequence','compositions',stage('sequence','Progressive sequence',[choice('sequence-choice'),gaps('sequence-gap'),byId('rule-page-demo')],true),['progressive-stage-demo','rule-page-demo'],'Первое задание видно сразу. Следующие шаги открываются стрелкой; Guided Discovery — один из примеров.')
  ];
  templates.forEach(definition => kit.validate(definition));
  window.SpaceWhaleTemplates = templates;
})();
