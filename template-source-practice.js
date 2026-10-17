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
  const matching = (id, title, items, options, data = {}) => base(id,'matching',title,{layout:'cards',items,options,...data});
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
      id:'reply',prompt:'A friend says, “I’m cold.” What can you offer?',
      options:[option('question','Where is your coat?'),option('offer','Would you like my jacket?'),option('past','I was cold yesterday.')],correctId:'offer'
    }]}));

  preview('E02','Multiple Select','Select every sentence that follows the given model.',
    base('e02-multiple','choice','Find the correct sentences.',{multiple:true,instruction:'Choose all the correct sentences.',items:[{
      id:'sentences',prompt:'Which sentences use the present simple correctly?',
      options:[option('negative','She doesn’t work on Sundays.'),option('wrong-question','Does she works here?'),option('positive','He works from home.'),option('wrong-negative','He don’t like coffee.')],correctIds:['negative','positive']
    }]}));

  preview('E03','Dropdown: отдельные предложения и реплики','Choose a form inside each separate sentence.',
    base('e03-dropdown','gaps','Describe how the clothes look.',{inputMode:'select',items:[
      row('coat',['This coat ',gap('coat-form','looks',{options:['look like','looks','look']}),' warm.']),
      row('boots',['These boots ',gap('boots-form','look',{options:['looks','look like','look']}),' comfortable.']),
      row('bag',['This bag ',gap('bag-form','looks like',{options:['look','looks like','looks']}),' my old one.'])
    ]}));

  preview('E03A','Dropdown: связный текст','Use the whole text to choose the forms in its gaps.',
    base('e03a-text','gaps','Read about Leo’s workday.',{inputMode:'select',layout:'paragraph',instruction:'Choose the correct forms.',items:[row('leo',[
      'Leo ',gap('live','lives',{options:['are living','lives','live']}),' in Boston. Every morning, he ',
      gap('travel','takes',{options:['take','is take','takes']}),' the bus to work. Today, he ',
      gap('today','is working',{options:['are working','is working','work']}),' from home.'
    ])]}));

  preview('E03B','Dropdown: перевод слова','Choose the translation of each English word.',
    base('e03b-translation','gaps','Choose the meaning of each word.',{inputMode:'select',items:[
      row('curtain',['curtain — ',gap('curtain-meaning','штора',{options:['подушка','штора','ковёр']})]),
      row('cushion',['cushion — ',gap('cushion-meaning','диванная подушка',{options:['диванная подушка','кресло','одеяло']})]),
      row('carpet',['carpet — ',gap('carpet-meaning','ковёр',{options:['часы','занавеска','ковёр']})])
    ]}));

  preview('E04','Ввести пропуск с банком слов','Choose a base form from the bank and type the form needed in context.',
    typed('e04-bank','Complete the sentences.',[
      row('ella',['Ella ',gap('watch','watches'),' a movie every Friday.']),
      row('home',['We ',gap('be','are'),' at home.']),
      row('sam',['Sam ',gap('go','goes'),' to work by bus.'])
    ],{instruction:'Use the words in the bank. Change their form if needed.',bank:['watch','go','be']}));

  preview('E04A','Ввести пропуск с подсказкой','Type the required form using the local base-form cue.',
    typed('e04a-cues','Complete the sentences.',[
      row('routine',['Nora ',gap('work','works',{placeholder:'work'}),' in a café.']),
      row('now',['She ',gap('make','is making',{placeholder:'make'}),' coffee right now.']),
      row('yesterday',['Yesterday, she ',gap('finish','finished',{placeholder:'finish'}),' work at six.'])
    ],{instruction:'Use the verb in each field in the correct form.'}));

  preview('E05','Ввести пропуск без подсказки','Recall the missing language from the meaning and structure of the sentence.',
    typed('e05-recall','Complete the time expressions.',[
      row('time',['The train leaves ',gap('at','at'),' 9 a.m.']),
      row('month',['My birthday is ',gap('in','in'),' July.']),
      row('day',['We meet ',gap('on','on'),' Monday.'])
    ],{instruction:'Write one word in each gap.'}));

  preview('E05A','Ввести слово по переводу-подсказке','Recall and type the English word from its translation.',
    writing('e05a-translation','Write the English words.',[
      {id:'blanket',prompt:'одеяло',acceptedAnswers:['blanket']},
      {id:'hanger',prompt:'вешалка для одежды',acceptedAnswers:['hanger']},
      {id:'toothbrush',prompt:'зубная щётка',acceptedAnswers:['toothbrush']}
    ],{responseMode:'accepted'}));

  preview('E05B','Заполнить схему или таблицу','Restore missing forms in a partly completed table of a familiar model.',
    typed('e05b-table','Complete the indefinite pronouns.',[
      row('people',['People',gap('everybody','everybody'),'somebody','anybody',gap('nobody','nobody')]),
      row('things',['Things','everything',gap('something','something'),gap('anything','anything'),'nothing'])
    ],{layout:'table',tableColumns:['Group','every-','some-','any-','no-']}));

  preview('E06','Matching: части предложения','Join sentence beginnings and endings to make complete statements.',
    matching('e06-halves','Match the sentence halves.',[
      {id:'late',text:'If we leave now,',correctId:'catch'},
      {id:'empty',text:'There isn’t any milk,',correctId:'buy'},
      {id:'cold',text:'It’s cold outside,',correctId:'coat'}
    ],[option('coat','so take your coat.'),option('catch','we can catch the bus.'),option('buy','so I need to buy some.')]));

  preview('E06A','Matching: вопрос и ответ','Connect each question with its natural answer.',
    matching('e06a-questions','Match the questions and answers.',[
      {id:'time',text:'What time does the shop close?',correctId:'six'},
      {id:'price',text:'How much is this bag?',correctId:'twenty'},
      {id:'place',text:'Where is the fitting room?',correctId:'right'}
    ],[option('twenty','It’s twenty dollars.'),option('right','It’s on your right.'),option('six','At six o’clock.')]));

  preview('E06B','Matching: пример и слово','Identify the function illustrated by each short example.',
    matching('e06b-functions','Match each example with its function.',[
      {id:'tea',text:'Would you like some tea?',correctId:'offer'},
      {id:'window',text:'Could you open the window, please?',correctId:'request'},
      {id:'train',text:'Let’s take the train.',correctId:'suggestion'}
    ],[option('suggestion','a suggestion'),option('offer','an offer'),option('request','a request')]));

  preview('E06C','Matching: слово и изменённая форма','Pair each base form with its changed form.',
    matching('e06c-forms','Match the verbs with their past forms.',[
      {id:'buy',text:'buy',correctId:'bought'},
      {id:'meet',text:'meet',correctId:'met'},
      {id:'go',text:'go',correctId:'went'}
    ],[option('went','went'),option('bought','bought'),option('met','met')]));

  preview('E06D','Matching Image and Phrase','Match each picture with a sentence describing its action.',
    matching('e06d-picture-phrase','Match the pictures and sentences.',[
      {id:'cooking',text:'Cooking',...art('cooking','A person cooking'),correctId:'dinner'},
      {id:'reading',text:'Reading',...art('reading','A person reading a book'),correctId:'book'},
      {id:'cycling',text:'Cycling',...art('cycling','A person riding a bicycle'),correctId:'bike'}
    ],[option('bike','The person is riding a bike.'),option('dinner','The person is making dinner.'),option('book','The person is reading a book.')],{layout:'picture-word'}));

  preview('E06E','Matching: деятельность и предмет','Connect each activity with the object used for it.',
    matching('e06e-activity-object','Match the objects with the activities.',[
      {id:'remote',text:'TV remote',...objectArt.remote,correctId:'channel'},
      {id:'keyboard',text:'Keyboard',...objectArt.keyboard,correctId:'type'},
      {id:'mouse',text:'Mouse',...objectArt.mouse,correctId:'pointer'}
    ],[option('type','type a message'),option('pointer','move the pointer'),option('channel','change the TV channel')],{layout:'picture-word'}));

  preview('E06F','Matching: части словосочетания','Join the parts of familiar expressions.',
    matching('e06f-chunks','Match the parts of the expressions.',[
      {id:'ask',text:'ask',correctId:'help'},
      {id:'make',text:'make',correctId:'decision'},
      {id:'pay',text:'pay',correctId:'card'}
    ],[option('decision','a decision'),option('card','by card'),option('help','for help')]));

  preview('E06G','Matching: фраза и значение','Connect each complete phrase with its meaning.',
    matching('e06g-meaning','Match the phrases and meanings.',[
      {id:'way',text:'I’m on my way.',correctId:'coming'},
      {id:'works',text:'That works for me.',correctId:'plan'},
      {id:'mind',text:'Never mind.',correctId:'problem'}
    ],[option('plan','That plan is good for me.'),option('problem','It’s not a problem.'),option('coming','I’m coming now.')],{layout:'word-definition'}));

  preview('E07','Сортировка по категориям','Place forms in the groups defined by the learned rule.',
    base('e07-categories','sort','Sort the comparison forms.',{
      groups:[option('comparative','Comparative'),option('superlative','Superlative')],
      items:[{id:'best',text:'the best',correctId:'superlative'},{id:'cheaper',text:'cheaper',correctId:'comparative'},{id:'expensive',text:'the most expensive',correctId:'superlative'},{id:'comfortable',text:'more comfortable',correctId:'comparative'}]
    }));

  preview('E08','Sort','Arrange the items on a clearly defined scale.',
    base('e08-frequency','order','Order the frequency words.',{
      instruction:'Put the words in order from 0% to 100%.',
      tokens:[option('often','often'),option('never','never'),option('always','always'),option('sometimes','sometimes')],
      correctOrder:['never','sometimes','often','always']
    }));

  preview('E09','Word Order: составить предложение','Arrange all the supplied words to make a question.',
    base('e09-question','order','Make a question.',{
      instruction:'Put the words in the correct order.',sentenceCase:true,
      tokens:[option('your','your'),option('work','work?'),option('does','does'),option('where','where'),option('sister','sister')],
      correctOrder:['where','does','your','sister','work']
    }));

  preview('E11','Написать предложение по подсказкам','Build and write complete sentences from meaning cues.',
    writing('e11-sentences','Write complete sentences.',[
      {id:'want',prompt:'want / a new coat / because / cold'},
      {id:'work',prompt:'sister / work / café / every day'},
      {id:'now',prompt:'right now / wait / bus'}
    ],{instruction:'Use the cues. Add the grammar and words you need.'}));

  preview('E11A','Устно восстановить фразу по изображению','Recover the missing language and say the sentence aloud using the picture.',
    kit.speaking({id:'e11a-oral',title:'Say what is happening.',image:art('cooking','A person cooking'),
      task:{text:'Look at the picture. Complete the sentence aloud.'},
      use:[{words:['cook'],phrases:['Right now, the person …']}]
    }));

  preview('E12','Преобразовать слово','Type the form specified by the task.',
    writing('e12-past','Write the past forms.',[
      {id:'go',prompt:'go',acceptedAnswers:['went']},
      {id:'take',prompt:'take',acceptedAnswers:['took']},
      {id:'buy',prompt:'buy',acceptedAnswers:['bought']}
    ],{responseMode:'accepted'}));

  preview('E13','Error Correction','Find the error in each sentence and write the corrected sentence.',
    writing('e13-correct','Correct the sentences.',[
      {id:'negative',prompt:'She don’t like coffee.',normalization:'translation',acceptedAnswers:["She doesn’t like coffee."]},
      {id:'question',prompt:'Where does he lives?',normalization:'translation',acceptedAnswers:['Where does he live?']},
      {id:'positive',prompt:'My brother work in a hotel.',normalization:'translation',acceptedAnswers:['My brother works in a hotel.']}
    ],{responseMode:'accepted',instruction:'There is one error in each sentence. Write the whole sentence correctly.'}));

  preview('E14','Краткий письменный ответ','Write one short response to a clear incoming message.',
    writing('e14-reply','Reply to your friend.',[
      {id:'reply',prompt:'Alex: Are you free this evening? Tell Alex if you are free and explain why.'}
    ],{instruction:'Write one or two sentences.'}));

  preview('E15','Завершить предложение','Supply your own suitable ending after each given beginning.',
    writing('e15-endings','Finish the sentences.',[
      {id:'work',prompt:'After work, I usually …'},
      {id:'rain',prompt:'If it rains tomorrow, …'},
      {id:'because',prompt:'I want to learn English because …'}
    ],{instruction:'Write only the missing endings. Use your own ideas.'}));

  preview('E16','Make It True for You','Keep the model and change the content to describe your own life.',
    writing('e16-personal','Make the sentences true for you.',[
      {id:'coffee',prompt:'I drink coffee every morning.'},
      {id:'travel',prompt:'I go to work by bus.'},
      {id:'weekend',prompt:'I work on Sundays.'}
    ],{responseMode:'personal',instruction:'Keep the present simple. Change each sentence if needed.'}));

  preview('E17','Chat Exchange','Continue a connected three-turn chat using a prepared partner script.',
    base('e17-chat','stage','Arrange a meeting in a chat.',{progressive:true,requireCheckBeforeNext:true,exercises:[
      {id:'time',exercise:writing('e17-time','Reply to Alex.',[{id:'reply',prompt:'Alex: Can we meet tomorrow? What time are you free?'}])},
      {id:'place',exercise:writing('e17-place','Choose a place.',[{id:'reply',prompt:'Alex: That time works for me. Where shall we meet?'}])},
      {id:'bring',exercise:writing('e17-bring','Finish the chat.',[{id:'reply',prompt:'Alex: Good idea. What should I bring?'}])}
    ]}));

  window.SpaceWhaleSourcePracticeTemplates = definitions;
})();
