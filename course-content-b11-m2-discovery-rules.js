/* B1.1 / Module 2 — approved Discovery and Rule, lessons 1–4.
 * Content source: Pasted text(20261018-123813).txt.
 * D01 / D04 / R01 / R02 own the shared presentation; this file supplies content only.
 */
(() => {
  'use strict';
  const kit = window.SpaceWhaleExerciseKit;
  if (!kit) throw new Error('SpaceWhaleExerciseKit is required.');
  const exercise = (id, templateCode, kind, title, content) => ({version:1,id,templateCode,kind,title,...content});
  const text = (copy, highlights) => ({type:'text',text:copy,...(highlights?.length ? {highlights} : {})});
  const models = (copy, highlights) => ({type:'text',role:'examples',text:copy,highlights});
  const pair = (label, fact, imagined, highlights) => ({
    type:'rule', title:label, text:fact, examples:[imagined], highlights
  });
  const conclusion = (prefix, title, items) => ({
    type:'exercise', id:'conclusion',
    exercise:exercise(prefix+'_CONCLUSION','D01','gaps',title,{
      templatePart:'$.blocks[1].exercise',inputMode:'select',items
    })
  });
  // The shared progressive-stage gate recognizes direct response children.
  // Keep the source models and conclusion together, with the response visible
  // to that gate, so Rule cannot open before the conclusion is checked/skipped.
  const groupedDiscovery = definition => {
    if (definition.kind !== 'rule-page') return definition;
    const response = definition.blocks.find(block => block.type === 'exercise');
    return {
      version:1,id:definition.id,kind:'stage',templateRole:'composition',
      title:definition.title,instruction:definition.instruction,layout:'grouped',
      exercises:[
        {id:'models',exercise:{
          version:1,id:definition.id+'_MODELS',kind:'presentation',templateCode:'D01',templatePart:'oral-conclusion',templateRole:'material',
          title:definition.title,blocks:definition.blocks.filter(block => block.type !== 'exercise').map(block => {
            const copy = [block.title ? block.title+'.' : '',block.text,...(block.examples || [])].filter(Boolean).join('\n');
            return text(copy,block.highlights);
          })
        }},
        {id:response.id,exercise:response.exercise}
      ]
    };
  };

  const additions = [
    {
      lessonId:'b1-1-w2-l1',
      discovery:exercise('B11M02L01_D01_DISCOVERY','D01','rule-page','A different past',{
        instruction:'Read the examples. Choose the correct options to complete the rule below.',
        blocks:[
          text('What really happened → What I imagine now'),
          pair('A','I postponed my decision and missed an opportunity.',
            'If I hadn’t postponed my decision, I wouldn’t have missed the opportunity.',
            ['hadn’t postponed','wouldn’t have missed']),
          pair('B','I didn’t finish the course, so I didn’t get a qualification.',
            'I would have gotten a qualification if I had finished the course.',
            ['would have gotten','had finished']),
          pair('C','I faced difficulties with the computer program and finished the project late.',
            'If I hadn’t faced these difficulties, I would have finished the project on time.',
            ['hadn’t faced','would have finished']),
          conclusion('B11M02L01_D01','A different past',[
            {id:'meaning',segments:['These sentences imagine a different ',{id:'time',options:['future','past'],answers:['past']},'.']},
            {id:'condition',segments:['In the if-part, we use ',{id:'if-form',options:['had','would'],answers:['had']},' or hadn’t + the third form of the verb.']},
            {id:'result',segments:['For the imagined result, we use would / wouldn’t + ',{id:'result-form',options:['had','have'],answers:['have']},' + the third form of the verb.']}
          ])
        ]
      }),
      rule:exercise('B11M02L01_R01_RULE','R01','rule-page','Third Conditional: imagining a different past',{
        blocks:[
          text('We use the Third Conditional to imagine a different past situation and a different past result. The real events are already over; we cannot change them.'),
          text('The if-part gives the imagined situation. Use the Past Perfect: had / hadn’t + V3. The other part gives the imagined result: would / wouldn’t have + V3. V3 is the third form of the verb, such as finished or taken.', ['had / hadn’t + V3','would / wouldn’t have + V3']),
          {type:'rule',formula:'If + subject + had / hadn’t + V3, subject + would / wouldn’t have + V3.',highlights:['had / hadn’t + V3','would / wouldn’t have + V3']},
          text('Each part can be positive or negative. Choose the form that expresses your meaning:'),
          models('If I had submitted my application on time, I wouldn’t have missed the opportunity.\nIf I hadn’t faced so many difficulties, I would have achieved my goal.', ['had submitted','wouldn’t have missed','hadn’t faced','would have achieved']),
          text('You can put either part first. Use a comma when the if-part comes first. When it comes second, you usually do not need a comma:'),
          models('I would have achieved my goal if I hadn’t faced so many difficulties.', ['would have achieved','hadn’t faced']),
          text('In this model, would belongs in the result, not in the if-part.', ['would']),
          text('For get, we use the American English forms get — got — gotten:'),
          models('If I had finished the course, I would have gotten a qualification.', ['had finished','would have gotten'])
        ]
      })
    },
    {
      lessonId:'b1-1-w2-l2',
      discovery:exercise('B11M02L02_D01_DISCOVERY','D01','rule-page','Looking back at a difficult decision',{
        instruction:'Read the conversations. Choose the correct options to complete the rule.',
        blocks:[
          text('Two colleagues are discussing different choices after a difficult project.'),
          {type:'text',title:'A',text:'— Would you have expressed your concerns if you had known about the problem?\n— Yes, I would have.',highlights:['Would you have expressed','had known','would have']},
          {type:'text',title:'B',text:'— Would you have taken on responsibility for the project if you had been under pressure?\n— No, I wouldn’t have.',highlights:['Would you have taken on','had been','wouldn’t have']},
          {type:'text',title:'C',text:'— What would you have done if the team hadn’t reached an agreement?\n— I would have explored alternatives.',highlights:['What would you have done','hadn’t reached','would have explored']},
          conclusion('B11M02L02_D01','Looking back at a difficult decision',[
            {id:'question-order',segments:['In these questions, would comes ',{id:'would-position',options:['after','before'],answers:['before']},' the person: you.']},
            {id:'question-word',segments:['The question word What comes ',{id:'what-position',options:['before','after'],answers:['before']},' would.']},
            {id:'condition',segments:['The if-part keeps ',{id:'if-form',options:['would have','had or hadn’t'],answers:['had or hadn’t']},' + the third form of the verb.']}
          ])
        ]
      }),
      rule:exercise('B11M02L02_R01_RULE','R01','rule-page','Third Conditional: questions and short answers',{
        blocks:[
          text('To ask about a different past choice or result, put would before the subject. Keep have + V3 after the subject:', ['would','have + V3']),
          {type:'rule',formula:'Would + subject + have + V3 …?',highlights:['Would','have + V3']},
          models('Would you have taken on responsibility if you had known about the difficulties?', ['Would you have taken on','had known']),
          text('The if-part keeps its usual order: subject + had / hadn’t + V3.', ['had / hadn’t + V3']),
          text('To ask for information, put What or How before would:', ['What','How','would']),
          models('What would you have done if you had been under pressure?\nHow would the decision have changed if the team had looked into the problem earlier?', ['What would you have done','had been','How would the decision have changed','had looked into']),
          text('For a yes/no question, you can give a short answer: Yes, I would have. / No, I wouldn’t have. A What or How question needs information: I would have expressed my concerns.', ['Yes, I would have.','No, I wouldn’t have.','would have expressed']),
          text('In conversation, we often use contractions. Look at what follows ’d to understand it:'),
          {type:'rule',title:'Contraction → Full form',examples:[
            'If I’d known … → If I had known …',
            'I’d have expressed my concerns. → I would have expressed my concerns.',
            'I would’ve expressed my concerns. → I would have expressed my concerns.'
          ],highlights:['I’d known','I had known','I’d have expressed','I would’ve expressed','I would have expressed']},
          text('In would have + V3, have is usually weak in connected speech: /əv/. This gives the sound of would’ve. The have is still part of the construction.', ['would have + V3','/əv/','would’ve'])
        ]
      })
    },
    {
      lessonId:'b1-1-w2-l3',
      discovery:exercise('B11M02L03_D01_DISCOVERY','D01','rule-page','Regrets about the past',{
        instruction:'Read the facts and regrets. Choose the correct options to complete the rule.',
        blocks:[
          text('What really happened → My regret'),
          pair('A','I didn’t apologize to Nina. I feel guilty.',
            'I wish I had apologized to Nina.', ['I wish','had apologized']),
          pair('B','I laughed at a colleague’s mistake. I feel ashamed.',
            'If only I hadn’t laughed at her mistake.', ['If only','hadn’t laughed']),
          pair('C','My friend shared my private messages. I feel betrayed.',
            'I wish she hadn’t shared my private messages.', ['I wish','hadn’t shared']),
          conclusion('B11M02L03_D01','Regrets about the past',[
            {id:'meaning',segments:['These regrets are about the ',{id:'time',options:['past','future'],answers:['past']},'.']},
            {id:'form',segments:['After I wish / If only, we use a person + ',{id:'regret-form',options:['would','had or hadn’t'],answers:['had or hadn’t']},' + the third form of the verb.']},
            {id:'facts',segments:['In A, I ',{id:'fact-a',options:['did','didn’t'],answers:['didn’t']},' apologize. In B and C, the actions ',{id:'facts-b-c',options:['happened','didn’t happen'],answers:['happened']},', and I regret them now.']}
          ])
        ]
      }),
      rule:exercise('B11M02L03_R02_RULE','R02','rule-page','A regret or a different past result?',{
        blocks:[
          text('Use I wish / If only to say what you would like to change about the past. Use the Third Conditional to connect a different past situation with an imagined result.'),
          {type:'text',title:'Expressing a regret',text:'After I wish / If only, use the Past Perfect: subject + had / hadn’t + V3. The past cannot change, but you want it to be different.',highlights:['I wish / If only','had / hadn’t + V3']},
          models('I didn’t apologize. → I wish I had apologized.\nI laughed at her mistake. → If only I hadn’t laughed at her mistake.', ['I wish','had apologized','If only','hadn’t laughed']),
          text('The positive and negative forms show how you now want the past to be different. You can also regret another person’s action: I wish she hadn’t shared my messages.', ['I wish','hadn’t shared']),
          text('If only usually expresses a stronger feeling than I wish. Here, ’d means had: I wish I’d apologized = I wish I had apologized. For these past regrets, use had / hadn’t, not would.', ['I’d apologized','had apologized','had / hadn’t']),
          {type:'text',title:'Imagining a different result',text:'I didn’t apologize after our argument, and we didn’t reach an agreement. Compare two ways to look back at this:'},
          models('I wish I had apologized. — I regret not apologizing.\nIf I had apologized, we would have reached an agreement. — I imagine both a different past action and its result.', ['I wish','had apologized','would have reached'])
        ]
      })
    },
    {
      lessonId:'b1-1-w2-l4',
      discovery:exercise('B11M02L04_D04_DISCOVERY','D04','stage','A different choice: now or in the past?',{
        instruction:'Match each situation 1–4 with a sentence A–D. Notice whether the choice is still possible or is already in the past.',
        layout:'grouped',
        exercises:[
          {id:'pairs',exercise:exercise('B11M02L04_D04_PAIRS','D04','matching','A different choice: now or in the past?',{
            templatePart:'$.exercises["part-2"].exercise',
            items:[
              {id:'situation-a',text:'Eva wanted the job but wasn’t self-confident enough to apply. She didn’t apply, and the company stopped accepting applications last month.',correctId:'sentence-2'},
              {id:'situation-b',text:'Max is stubborn and refuses to try a different plan. His team still has time to solve the problem.',correctId:'sentence-1'},
              {id:'situation-c',text:'Eva wants the job but isn’t self-confident enough to apply. The company is still accepting applications.',correctId:'sentence-4'},
              {id:'situation-d',text:'Max was stubborn and refused to try a different plan. The project failed last week.',correctId:'sentence-3'}
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
          text('Choose the model by the time of the situation and its imagined result.'),
          text('Use the Second Conditional for an unreal or unlikely situation now or in the future. The if-part uses the Past Simple, but its meaning is not past:'),
          {type:'rule',formula:'If + subject + Past Simple, subject + would / wouldn’t + base verb.',highlights:['Past Simple','would / wouldn’t + base verb']},
          models('If Eva were more self-confident, she would apply for the job.', ['were','would apply']),
          text('She lacks confidence now. The opportunity is still open. The base verb has no to: apply, not to apply.'),
          text('Use the Third Conditional for a different situation and result in the past. That opportunity has already passed:'),
          {type:'rule',formula:'If + subject + had / hadn’t + V3, subject + would / wouldn’t have + V3.',highlights:['had / hadn’t + V3','would / wouldn’t have + V3']},
          models('If Eva had been more self-confident, she would have applied for the job.', ['had been','would have applied']),
          text('The same quality can appear in both models. The time changes the form: were / weren’t → would do; had / hadn’t been → would have done.', ['were / weren’t','would do','had / hadn’t been','would have done']),
          text('For be in the Second Conditional, use were / weren’t, including with I, he, she, it. Was / wasn’t is also possible in informal speech. In both models here, would belongs in the result, not in the if-part.', ['were / weren’t'])
        ]
      })
    }
  ];

  additions.forEach(({lessonId,discovery:authoredDiscovery,rule}) => {
    const discovery = groupedDiscovery(authoredDiscovery);
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
