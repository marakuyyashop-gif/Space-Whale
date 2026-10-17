(() => {
  'use strict';
  // Source-coded catalog previews. Rendering and answer state belong to the shared kit.
  const kit = window.SpaceWhaleExerciseKit;
  if (!kit) throw new Error('SpaceWhaleExerciseKit is required.');
  const definitions = [];
  const base = (id, kind, title, data = {}) => ({version:1,id,kind,title,...data});
  const option = (id, text) => ({id,text});
  const gap = (id, answer, data = {}) => ({id,answers:[answer],...data});
  const row = (id, segments) => ({id,segments});
  const preview = (code, catalogTitle, description, definition) => {
    const result = {...definition,id:`source-${code}`,code,catalogFamily:'E',catalogTitle,label:`${code} · ${catalogTitle}`,description};
    kit.validate(result);
    definitions.push(result);
    return result;
  };
  const matching = (id, title, items, options, data = {}) => base(id,'matching',title,{layout:'word-definition',items,options,...data});
  const typed = (id, title, items, data = {}) => base(id,'gaps',title,{inputMode:'text',items,...data});
  const writing = (id, title, items, data = {}) => base(id,'writing',title,{responseMode:'open',items,...data});
  const art = (name, alt) => ({image:`Images/Текущие/assets/choice-${name}.svg`,alt});
  const objectArt = {
    keyboard:{image:'Images/Текущие/A2.1/biba_boba_computer_keyboard_a_single_slim_desktop_keyboard_w_5cd54683-33cb-4329-a7a5-0fd8e603729c_13.png',alt:'A computer keyboard'},
    mouse:{image:'Images/Текущие/A2.1/biba_boba_computer_mouse_a_simple_oval_computer_mouse_with_t_4e11da6e-50b9-4886-92a7-7e7b925234d8_17.png',alt:'A computer mouse'},
    remote:{image:'Images/Текущие/A2.1/biba_boba_TV_remote_control_an_adult_hand_holding_a_slim_rec_8e676fe3-7857-4250-a653-6b04f87a06e0_21.png',alt:'A TV remote control'}
  };

  preview('E01','Single Choice','Choose one answer that fits the question and situation.',
    base('e01-choice','choice','Choose a reply.',{instruction:'Choose one answer.',items:[{
      id:'reply',prompt:'[Question or situation 1]',
      options:[option('question','[Answer option 1]'),option('offer','[Answer option 2]'),option('past','[Answer option 3]')],correctId:'offer'
    }]}));

  preview('E02','Multiple Select','Select every sentence that follows the given model.',
    base('e02-multiple','choice','Find the correct sentences.',{multiple:true,instruction:'Choose all the correct sentences.',items:[{
      id:'sentences',prompt:'[Question about the target structure]',
      options:[option('negative','[Sentence 1]'),option('wrong-question','[Sentence 2]'),option('positive','[Sentence 3]'),option('wrong-negative','[Sentence 4]')],correctIds:['negative','positive']
    }]}));

  preview('E03','Dropdown: отдельные предложения и реплики','Choose a form inside each separate sentence.',
    base('e03-dropdown','gaps','Complete the sentences.',{inputMode:'select',items:[
      row('coat',['[Sentence beginning 1] ',gap('coat-form','[Option 1B]',{options:['[Option 1A]','[Option 1B]','[Option 1C]']}),' [Sentence ending 1]']),
      row('boots',['[Sentence beginning 2] ',gap('boots-form','[Option 2C]',{options:['[Option 2A]','[Option 2B]','[Option 2C]']}),' [Sentence ending 2]']),
      row('bag',['[Sentence beginning 3] ',gap('bag-form','[Option 3B]',{options:['[Option 3A]','[Option 3B]','[Option 3C]']}),' [Sentence ending 3]'])
    ]}));

  preview('E03A','Dropdown: связный текст','Use the whole text to choose the forms in its gaps.',
    base('e03a-text','gaps','Complete the text.',{inputMode:'select',layout:'paragraph',instruction:'Choose the correct forms.',items:[row('leo',[
      '[Text beginning] ',gap('live','[Option 1B]',{options:['[Option 1A]','[Option 1B]','[Option 1C]']}),' [Text part 2] ',
      gap('travel','[Option 2C]',{options:['[Option 2A]','[Option 2B]','[Option 2C]']}),' [Text part 3] ',
      gap('today','[Option 3B]',{options:['[Option 3A]','[Option 3B]','[Option 3C]']}),' [Text ending]'
    ])]}));

  preview('E03B','Dropdown: перевод слова','Choose the translation of each English word.',
    base('e03b-translation','gaps','Choose the meaning of each word.',{inputMode:'select',items:[
      row('curtain',['[Word 1] — ',gap('curtain-meaning','[Translation option 1B]',{options:['[Translation option 1A]','[Translation option 1B]','[Translation option 1C]']})]),
      row('cushion',['[Word 2] — ',gap('cushion-meaning','[Translation option 2A]',{options:['[Translation option 2A]','[Translation option 2B]','[Translation option 2C]']})]),
      row('carpet',['[Word 3] — ',gap('carpet-meaning','[Translation option 3C]',{options:['[Translation option 3A]','[Translation option 3B]','[Translation option 3C]']})])
    ]}));

  preview('E04','Ввести пропуск с банком слов','Choose a base form from the bank and type the form needed in context.',
    typed('e04-bank','Complete the sentences.',[
      row('ella',['[Sentence beginning 1] ',gap('watch','[Form of Word 1]'),' [Sentence ending 1]']),
      row('home',['[Sentence beginning 2] ',gap('be','[Form of Word 2]'),' [Sentence ending 2]']),
      row('sam',['[Sentence beginning 3] ',gap('go','[Form of Word 3]'),' [Sentence ending 3]'])
    ],{instruction:'Use the words in the bank. Change their form if needed.',bank:['[Word 1]','[Word 3]','[Word 2]']}));

  preview('E04A','Ввести пропуск с подсказкой','Type the required form using the local base-form cue.',
    typed('e04a-cues','Complete the sentences.',[
      row('routine',['[Sentence beginning 1] ',gap('work','[Form of Word 1]',{placeholder:'[Word 1]'}),' [Sentence ending 1]']),
      row('now',['[Sentence beginning 2] ',gap('make','[Form of Word 2]',{placeholder:'[Word 2]'}),' [Sentence ending 2]']),
      row('yesterday',['[Sentence beginning 3] ',gap('finish','[Form of Word 3]',{placeholder:'[Word 3]'}),' [Sentence ending 3]'])
    ],{instruction:'Use the verb in each field in the correct form.'}));

  preview('E05','Ввести пропуск без подсказки','Recall the missing language from the meaning and structure of the sentence.',
    typed('e05-recall','Complete the sentences.',[
      row('time',['[Sentence beginning 1] ',gap('at','[Word 1]'),' [Sentence ending 1]']),
      row('month',['[Sentence beginning 2] ',gap('in','[Word 2]'),' [Sentence ending 2]']),
      row('day',['[Sentence beginning 3] ',gap('on','[Word 3]'),' [Sentence ending 3]'])
    ],{instruction:'Write one word in each gap.'}));

  preview('E05A','Ввести слово по переводу-подсказке','Recall and type the English word from its translation.',
    writing('e05a-translation','Write the English words.',[
      {id:'blanket',prompt:'[Translation Word 1]',acceptedAnswers:['[Word 1]']},
      {id:'hanger',prompt:'[Translation Word 2]',acceptedAnswers:['[Word 2]']},
      {id:'toothbrush',prompt:'[Translation Word 3]',acceptedAnswers:['[Word 3]']}
    ],{responseMode:'accepted'}));

  preview('E05B','Заполнить схему или таблицу','Restore missing forms in a partly completed table of a familiar model.',
    typed('e05b-table','Complete the table.',[
      row('people',['[Group 1]',gap('everybody','[Form 1.1]'),'[Form 1.2]','[Form 1.3]',gap('nobody','[Form 1.4]')]),
      row('things',['[Group 2]','[Form 2.1]',gap('something','[Form 2.2]'),gap('anything','[Form 2.3]'),'[Form 2.4]'])
    ],{layout:'table',tableColumns:['Group','[Column 1]','[Column 2]','[Column 3]','[Column 4]']}));

  preview('E06','Matching: части предложения','Join sentence beginnings and endings to make complete statements.',
    matching('e06-halves','Match the sentence halves.',[
      {id:'late',text:'[Sentence beginning 1]',correctId:'catch'},
      {id:'empty',text:'[Sentence beginning 2]',correctId:'buy'},
      {id:'cold',text:'[Sentence beginning 3]',correctId:'coat'}
    ],[option('coat','[Sentence ending 3]'),option('catch','[Sentence ending 1]'),option('buy','[Sentence ending 2]')]));

  preview('E06A','Matching: вопрос и ответ','Connect each question with its natural answer.',
    matching('e06a-questions','Match the questions and answers.',[
      {id:'time',text:'[Question 1]',correctId:'six'},
      {id:'price',text:'[Question 2]',correctId:'twenty'},
      {id:'place',text:'[Question 3]',correctId:'right'}
    ],[option('twenty','[Answer 2]'),option('right','[Answer 3]'),option('six','[Answer 1]')]));

  preview('E06B','Matching: пример и слово','Identify the function illustrated by each short example.',
    matching('e06b-functions','Match each example with its function.',[
      {id:'tea',text:'[Example 1]',correctId:'offer'},
      {id:'window',text:'[Example 2]',correctId:'request'},
      {id:'train',text:'[Example 3]',correctId:'suggestion'}
    ],[option('suggestion','[Function 3]'),option('offer','[Function 1]'),option('request','[Function 2]')]));

  preview('E06C','Matching: слово и изменённая форма','Pair each base form with its changed form.',
    matching('e06c-forms','Match the words with their changed forms.',[
      {id:'buy',text:'[Word 1]',correctId:'bought'},
      {id:'meet',text:'[Word 2]',correctId:'met'},
      {id:'go',text:'[Word 3]',correctId:'went'}
    ],[option('went','[Form of Word 3]'),option('bought','[Form of Word 1]'),option('met','[Form of Word 2]')]));

  preview('E06D','Matching Image and Phrase','Match each picture with a sentence describing its action.',
    matching('e06d-picture-phrase','Match the pictures and sentences.',[
      {id:'cooking',text:'[Picture 1]',...art('cooking','A person cooking'),correctId:'dinner'},
      {id:'reading',text:'[Picture 2]',...art('reading','A person reading a book'),correctId:'book'},
      {id:'cycling',text:'[Picture 3]',...art('cycling','A person riding a bicycle'),correctId:'bike'}
    ],[option('bike','[Sentence for Picture 3]'),option('dinner','[Sentence for Picture 1]'),option('book','[Sentence for Picture 2]')],{layout:'picture-word'}));

  preview('E06E','Matching: деятельность и предмет','Connect each activity with the object used for it.',
    matching('e06e-activity-object','Match the objects with the activities.',[
      {id:'remote',text:'[Object 1]',...objectArt.remote,correctId:'channel'},
      {id:'keyboard',text:'[Object 2]',...objectArt.keyboard,correctId:'type'},
      {id:'mouse',text:'[Object 3]',...objectArt.mouse,correctId:'pointer'}
    ],[option('type','[Activity for Object 2]'),option('pointer','[Activity for Object 3]'),option('channel','[Activity for Object 1]')],{layout:'picture-word'}));

  preview('E06F','Matching: части словосочетания','Join the parts of familiar expressions.',
    matching('e06f-chunks','Match the parts of the expressions.',[
      {id:'ask',text:'[Lexical chunk beginning 1]',correctId:'help'},
      {id:'make',text:'[Lexical chunk beginning 2]',correctId:'decision'},
      {id:'pay',text:'[Lexical chunk beginning 3]',correctId:'card'}
    ],[option('decision','[Lexical chunk ending 2]'),option('card','[Lexical chunk ending 3]'),option('help','[Lexical chunk ending 1]')]));

  preview('E06G','Matching: фраза и значение','Connect each complete phrase with its meaning.',
    matching('e06g-meaning','Match the phrases and meanings.',[
      {id:'way',text:'[Phrase 1]',correctId:'coming'},
      {id:'works',text:'[Phrase 2]',correctId:'plan'},
      {id:'mind',text:'[Phrase 3]',correctId:'problem'}
    ],[option('plan','[Meaning of Phrase 2]'),option('problem','[Meaning of Phrase 3]'),option('coming','[Meaning of Phrase 1]')],{layout:'word-definition'}));

  preview('E07','Сортировка по категориям','Place forms in the groups defined by the learned rule.',
    base('e07-categories','sort','Sort the forms.',{
      groups:[option('comparative','[Group 1]'),option('superlative','[Group 2]')],
      items:[{id:'best',text:'[Form 1]',correctId:'superlative'},{id:'cheaper',text:'[Form 2]',correctId:'comparative'},{id:'expensive',text:'[Form 3]',correctId:'superlative'},{id:'comfortable',text:'[Form 4]',correctId:'comparative'}]
    }));

  preview('E08','Sort','Arrange the items on a clearly defined scale.',
    base('e08-frequency','order','Order the words.',{
      instruction:'Put the words in the correct order on the scale.',
      tokens:[option('often','[Word 3]'),option('never','[Word 1]'),option('always','[Word 4]'),option('sometimes','[Word 2]')],
      correctOrder:['never','sometimes','often','always']
    }));

  preview('E09','Word Order: составить предложение','Arrange all the supplied words to make a question.',
    base('e09-question','order','Make a question.',{
      instruction:'Put the words in the correct order.',sentenceCase:true,
      tokens:[option('your','[Word 3]'),option('work','[Word 5]'),option('does','[Word 2]'),option('where','[Word 1]'),option('sister','[Word 4]')],
      correctOrder:['where','does','your','sister','work']
    }));

  preview('E11','Написать предложение по подсказкам','Build and write complete sentences from meaning cues.',
    writing('e11-sentences','Write complete sentences.',[
      {id:'want',prompt:'[Cue 1A] / [Cue 1B] / [Cue 1C] / [Cue 1D]',possibleAnswers:['[Possible sentence 1]']},
      {id:'work',prompt:'[Cue 2A] / [Cue 2B] / [Cue 2C] / [Cue 2D]',possibleAnswers:['[Possible sentence 2]']},
      {id:'now',prompt:'[Cue 3A] / [Cue 3B] / [Cue 3C]',possibleAnswers:['[Possible sentence 3]']}
    ],{showAuthoredSamples:true,revealPossibleAnswers:true,instruction:'Use the cues. Add the grammar and words you need.'}));

  preview('E11A','Устно восстановить фразу по изображению','Recover the missing language and say the sentence aloud using the picture.',
    kit.speaking({id:'e11a-oral',title:'Complete the sentence aloud.',image:art('cooking','A person cooking'),
      task:{text:'Look at the picture. Complete the sentence aloud.'},
      use:[{words:['[Word 1]'],phrases:['[Sentence beginning 1] …']}]
    }));

  preview('E12','Преобразовать слово','Type the form specified by the task.',
    writing('e12-past','[Task]',[
      {id:'go',prompt:'[Word 1]',acceptedAnswers:['[Form of Word 1]']},
      {id:'take',prompt:'[Word 2]',acceptedAnswers:['[Form of Word 2]']},
      {id:'buy',prompt:'[Word 3]',acceptedAnswers:['[Form of Word 3]']}
    ],{responseMode:'accepted',layout:'inline'}));

  preview('E13','Error Correction','Find the error in each sentence and write the corrected sentence.',
    writing('e13-correct','Correct the sentences.',[
      {id:'negative',prompt:'[Sentence with an error 1]',normalization:'translation',acceptedAnswers:['[Corrected sentence 1]']},
      {id:'question',prompt:'[Sentence with an error 2]',normalization:'translation',acceptedAnswers:['[Corrected sentence 2]']},
      {id:'positive',prompt:'[Sentence with an error 3]',normalization:'translation',acceptedAnswers:['[Corrected sentence 3]']}
    ],{responseMode:'accepted',layout:'inline',instruction:'There is one error in each sentence. Write the whole sentence correctly.'}));

  preview('E14','Краткий письменный ответ','Write one short response to a clear incoming message.',
    writing('e14-reply','Reply to your friend.',[
      {id:'reply',prompt:'[Incoming message 1] [Reply task 1]'}
    ],{instruction:'Write one or two sentences.'}));

  preview('E15','Завершить предложение','Supply your own suitable ending after each given beginning.',
    writing('e15-endings','Finish the sentences.',[
      {id:'work',prompt:'[Sentence beginning 1] …'},
      {id:'rain',prompt:'[Sentence beginning 2] …'},
      {id:'because',prompt:'[Sentence beginning 3] …'}
    ],{instruction:'Write only the missing endings. Use your own ideas.'}));

  preview('E16','Make It True for You','Keep the model and change the content to describe your own life.',
    writing('e16-personal','Make the sentences true for you.',[
      {id:'coffee',prompt:'[Model sentence 1]'},
      {id:'travel',prompt:'[Model sentence 2]'},
      {id:'weekend',prompt:'[Model sentence 3]'}
    ],{responseMode:'personal',instruction:'Keep the target structure. Change each sentence if needed.'}));

  preview('E17','Chat Exchange','Continue a connected three-turn chat using a prepared partner script.',
    base('e17-chat','stage','Continue the chat.',{progressive:true,requireCheckBeforeNext:true,exercises:[
      {id:'time',exercise:writing('e17-time','Reply to your partner.',[{id:'reply',prompt:'[Partner message 1]'}])},
      {id:'place',exercise:writing('e17-place','Continue the exchange.',[{id:'reply',prompt:'[Partner message 2]'}])},
      {id:'bring',exercise:writing('e17-bring','Finish the chat.',[{id:'reply',prompt:'[Partner message 3]'}])}
    ]}));

  window.SpaceWhaleSourcePracticeTemplates = definitions;
})();
