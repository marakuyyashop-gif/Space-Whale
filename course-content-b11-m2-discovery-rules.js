/* B1.1 / Module 2 — approved compact Discovery and Rule, lessons 1–4.
 * Source: final revision in Pasted text(20261018-142148).txt.
 * Shared templates own all appearance. Historical IDs stay stable even when
 * the revised L3 teaching purpose changes its explicit templateCode to D02.
 */
(() => {
  'use strict';
  const kit = window.SpaceWhaleExerciseKit;
  if (!kit) throw new Error('SpaceWhaleExerciseKit is required.');
  const exercise = (id, templateCode, kind, title, content) => ({version:1,id,templateCode,kind,title,...content});
  const text = (copy, highlights) => ({type:'text',text:copy,...(highlights?.length ? {highlights} : {})});
  const models = (copy, highlights) => ({type:'text',role:'examples',text:copy,highlights});
  const formula = (copy, highlights) => ({type:'rule',formula:copy,highlights});
  const gap = (id, options, answer) => ({id,options,answers:[answer]});
  // Source models and their conclusion are one compact task with one OK.
  // Direct response children keep the existing teacher-arrow check gate.
  const discovery = (prefix, title, blocks, items) => ({
    version:1,id:prefix+'_DISCOVERY',kind:'stage',templateRole:'composition',
    title,instruction:'Choose the correct options.',layout:'grouped',
    exercises:[
      {id:'models',exercise:exercise(prefix+'_DISCOVERY_MODELS','D01','presentation',title,{
        templatePart:'oral-conclusion',templateRole:'material',blocks
      })},
      {id:'conclusion',exercise:exercise(prefix+'_CONCLUSION','D01','gaps',title,{
        templatePart:'$.blocks[1].exercise',inputMode:'select',items
      })}
    ]
  });

  const additions = [
    {
      lessonId:'b1-1-w2-l1',
      discovery:discovery('B11M02L01_D01','Read the examples and complete the rule.',[
        text('I postponed my decision and missed an opportunity.\nIf I hadn’t postponed my decision, I wouldn’t have missed the opportunity.', ['hadn’t postponed','wouldn’t have missed']),
        text('I didn’t finish the course, so I didn’t get a qualification.\nI would have gotten a qualification if I had finished the course.', ['would have gotten','had finished'])
      ],[
        {id:'meaning',segments:['These sentences imagine a different ',gap('time',['future','past'],'past'),'.']},
        {id:'condition',segments:['In the if-part, we use ',gap('if-form',['had','would'],'had'),' + V3. The negative form is hadn’t + V3.']},
        {id:'result',segments:['For the imagined result, we use would / wouldn’t + ',gap('result-form',['had','have'],'have'),' + V3.']}
      ]),
      rule:exercise('B11M02L01_R01_RULE','R01','rule-page','Third Conditional: a different past',{
        blocks:[
          text('We use the Third Conditional to imagine that a past situation was different and to describe a different past result. The real events are already over and cannot change.'),
          text('Use had / hadn’t + V3 in the if-part.', ['had / hadn’t + V3']),
          text('Use would / wouldn’t have + V3 for the imagined result.', ['would / wouldn’t have + V3']),
          formula('If + subject + had / hadn’t + V3, subject + would / wouldn’t have + V3.', ['had / hadn’t + V3','would / wouldn’t have + V3']),
          models('If I had submitted my application on time, I wouldn’t have missed the opportunity.\nIf I hadn’t faced so many difficulties, I would have achieved my goal.', ['had submitted','wouldn’t have missed','hadn’t faced','would have achieved']),
          text('Either part can come first:'),
          models('If I hadn’t faced so many difficulties, I would have achieved my goal.\nI would have achieved my goal if I hadn’t faced so many difficulties.', ['hadn’t faced','would have achieved']),
          text('Use a comma when the if-part comes first. Do not use would in the if-part.', ['would']),
          text('In American English, the third form of get is usually gotten:'),
          text('get → got → gotten', ['gotten']),
          models('If I had finished the course, I would have gotten a qualification.', ['had finished','would have gotten'])
        ]
      })
    },
    {
      lessonId:'b1-1-w2-l2',
      discovery:discovery('B11M02L02_D01','Read the examples and complete the rule.',[
        text('— Would you have taken on responsibility if you had known about the problem?\n— Yes, I would have.', ['Would you have taken on','had known','would have']),
        text('What would you have done if the team hadn’t reached an agreement?', ['What would you have done','hadn’t reached'])
      ],[
        {id:'question-order',segments:['In a yes/no question, would comes ',gap('would-position',['after','before'],'before'),' the subject.']},
        {id:'question-word',segments:['In a question with what, the question word comes ',gap('what-position',['before','after'],'before'),' would.']},
        {id:'condition',segments:['The if-part uses ',gap('if-form',['would have','had'],'had'),' or hadn’t + V3.']}
      ]),
      rule:exercise('B11M02L02_R01_RULE','R01','rule-page','Third Conditional: questions',{
        blocks:[
          text('For a yes/no question, put would before the subject:', ['would']),
          formula('Would + subject + have + V3 …?', ['Would','have + V3']),
          models('Would you have taken on responsibility if you had known about the problem?', ['Would you have taken on','had known']),
          text('Short answers:'),
          models('Yes, I would have.\nNo, I wouldn’t have.', ['would have','wouldn’t have']),
          text('For a question with what or how, put the question word before would:', ['what','how','would']),
          formula('What / How + would + subject + have + V3 …?', ['What / How','would','have + V3']),
          models('What would you have done if the team hadn’t reached an agreement?', ['What would you have done','hadn’t reached']),
          text('The if-part keeps the same form:'),
          formula('subject + had / hadn’t + V3', ['had / hadn’t + V3']),
          text('In conversation, we often use contractions:'),
          models('If I’d known … = If I had known …\nI’d have expressed my concerns. = I would have expressed my concerns.\nI would’ve expressed my concerns. = I would have expressed my concerns.', ['I’d known','had known','I’d have expressed','would have expressed','I would’ve expressed']),
          text('In would have + V3, have is usually unstressed.', ['would have + V3','have'])
        ]
      })
    },
    {
      lessonId:'b1-1-w2-l3',
      discovery:exercise('B11M02L03_D01_DISCOVERY','D02','gaps','Read the examples and choose the correct meanings.',{
        templatePart:'legacy-inline-meaning',inputMode:'select',preserveLines:true,
        items:[
          {id:'meaning',highlights:['I wish','had apologized'],segments:[
            'I feel guilty. I wish I had apologized.\nThis means: ',
            gap('regret-meaning',['I plan to apologize later.','I regret not apologizing.'],'I regret not apologizing.')
          ]},
          {id:'facts',highlights:['If only','hadn’t laughed'],segments:[
            'I feel ashamed. If only I hadn’t laughed at her mistake.\nWhat really happened? ',
            gap('real-event',['I laughed at her mistake.','I didn’t laugh at her mistake.'],'I laughed at her mistake.')
          ]},
          {id:'time',segments:['Both speakers want to change something in the ',gap('time',['future','past'],'past'),'.']}
        ]
      }),
      rule:exercise('B11M02L03_R02_RULE','R02','rule-page','A regret or a different past result?',{
        blocks:[
          text('Use I wish / If only + Past Perfect to express regret about the past.', ['I wish / If only + Past Perfect']),
          formula('I wish / If only + subject + had / hadn’t + V3', ['I wish / If only','had / hadn’t + V3']),
          models('I didn’t apologize.\nI wish I had apologized.', ['I wish','had apologized']),
          models('I laughed at her mistake.\nIf only I hadn’t laughed at her mistake.', ['If only','hadn’t laughed']),
          text('If only usually expresses a stronger feeling than I wish.', ['If only','I wish']),
          text('In these sentences, ’d means had:', ['’d','had']),
          models('I wish I’d apologized.\n= I wish I had apologized.', ['I wish','I’d apologized','had apologized']),
          text('Do not use would after I wish / If only for these past regrets.', ['would','I wish / If only']),
          text('Use the Third Conditional when you also want to describe an imagined result:'),
          models('I wish I had apologized.', ['I wish','had apologized']),
          text('— I regret not apologizing.'),
          models('If I had apologized, we would have reached an agreement.', ['had apologized','would have reached']),
          text('— I imagine a different past action and its result.')
        ]
      })
    },
    {
      lessonId:'b1-1-w2-l4',
      discovery:exercise('B11M02L04_D04_DISCOVERY','D04','stage','Match the situations with the sentences.',{
        layout:'grouped',
        exercises:[
          {id:'pairs',exercise:exercise('B11M02L04_D04_PAIRS','D04','matching','Match the situations with the sentences.',{
            templatePart:'$.exercises["part-2"].exercise',
            // Preserve each situation/option identity and its meaning while
            // ordering the shortened situations as in the approved revision.
            items:[
              {id:'situation-c',text:'The company is still accepting applications. Eva isn’t self-confident enough to apply.',correctId:'sentence-4'},
              {id:'situation-a',text:'The application deadline was last month. Eva didn’t apply.',correctId:'sentence-2'},
              {id:'situation-b',text:'The team can still change the plan. Max refuses because he is stubborn.',correctId:'sentence-1'},
              {id:'situation-d',text:'The project failed last week because Max refused to change the plan.',correctId:'sentence-3'}
            ],
            options:[
              {id:'sentence-1',text:'If Max weren’t so stubborn, he would try a different plan.'},
              {id:'sentence-2',text:'If Eva had been more self-confident, she would have applied for the job.'},
              {id:'sentence-3',text:'If Max hadn’t been so stubborn, he would have tried a different plan.'},
              {id:'sentence-4',text:'If Eva were more self-confident, she would apply for the job.'}
            ]
          })}
        ]
      }),
      rule:exercise('B11M02L04_R02_RULE','R02','rule-page','Second or Third Conditional?',{
        blocks:[
          text('Use the Second Conditional for an unreal or unlikely situation now or in the future.'),
          formula('If + Past Simple, would / wouldn’t + base verb', ['Past Simple','would / wouldn’t + base verb']),
          models('If Eva were more self-confident, she would apply for the job.', ['were','would apply']),
          text('The opportunity is still open.'),
          text('Use the Third Conditional for a different situation and result in the past.'),
          formula('If + Past Perfect, would / wouldn’t have + V3', ['Past Perfect','would / wouldn’t have + V3']),
          models('If Eva had been more self-confident, she would have applied for the job.', ['had been','would have applied']),
          text('The opportunity has already passed.'),
          text('Compare:'),
          formula('were / weren’t → would + base verb', ['were / weren’t','would + base verb']),
          text('now or future'),
          formula('had / hadn’t been → would / wouldn’t have + V3', ['had / hadn’t been','would / wouldn’t have + V3']),
          text('past'),
          text('For hypothetical situations, use were with I, he, she and it. Was is also possible in informal speech.', ['were','Was']),
          text('Do not use would in the if-part.', ['would'])
        ]
      })
    }
  ];

  additions.forEach(({lessonId,discovery,rule}) => {
    kit.validate(discovery);
    kit.validate(rule);
    const index = window.SpaceWhaleContent?.findIndex(lesson => lesson.id === lessonId) ?? -1;
    if (index < 0) throw new Error('Load the B1.1 Module 2 outline before Discovery and Rule: '+lessonId);
    const lesson = window.SpaceWhaleContent[index];
    const ids = new Set([discovery.id,rule.id]);
    // A reload replaces only these two authored sources, retaining all other work.
    const stages = lesson.stages.filter(stage => !ids.has(stage.exercise.id));
    const entries = [
      {menu:'Guided Discovery',navigationTitle:'Guided Discovery',navigationBlock:'language',section:'tasks',role:'focus',guide:{time:'2 min'},exercise:discovery},
      {menu:'Rule',navigationTitle:'Rule',navigationBlock:'language',section:'tasks',role:'focus',guide:{time:'3 min'},exercise:rule}
    ];
    let after = -1;
    stages.forEach((entry,i) => { if (entry.role === 'words' || entry.role === 'wordPractice') after = i; });
    stages.splice(after+1,0,...entries);
    const structure = (lesson.structure || []).map(section => ({...section,sources:section.sources.filter(id => !ids.has(id))})).filter(section => section.sources.length);
    const focus = structure.findIndex(section => section.role === 'focus');
    if (focus >= 0) structure[focus] = {...structure[focus],sources:[...structure[focus].sources,discovery.id,rule.id]};
    else {
      let afterSection = -1;
      structure.forEach((section,i) => {if(section.role === 'words' || section.role === 'wordPractice') afterSection = i;});
      structure.splice(afterSection+1,0,{role:'focus',sources:[discovery.id,rule.id]});
    }
    window.SpaceWhaleContent[index] = {...lesson,contentStatus:lesson.contentStatus === 'outline'?'partial':lesson.contentStatus,stages,structure};
  });
})();
