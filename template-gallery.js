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
    base('writing-demo','writing','Open Writing',{instruction:'[Writing instruction] Ответ оценивает преподаватель.',items:[{id:'response',prompt:'[Writing prompt]'}]}),
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
  window.SpaceWhaleTemplates = examples;
})();
