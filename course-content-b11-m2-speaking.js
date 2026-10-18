/* Approved B1.1 / Module 2 opening and final Speaking.
 * Each lesson reuses one authored source at both ends with independent state IDs.
 * Original uploaded artwork and the owner's approved task wording, 2026-10-18.
 */
(() => {
  'use strict';
  const kit=window.SpaceWhaleExerciseKit;
  if(!kit)throw new Error('SpaceWhaleExerciseKit is required.');
  const title='Explain how different choices would have changed the results.';
  const pictures=[
    ['NINA','20a43a8d-28ba-43ee-b460-2d2665fcd781.png','Nina earns a fitness qualification and gets a job.'],
    ['ALEX','08c25ebd-ecde-484d-a268-13991d22dbd7.png','Alex signs up for a design course and is accepted.'],
    ['ANNA','f3956f8b-a101-4c0c-aef8-4593c4c0dd8c.png','Anna practices baking and wins first place.'],
    ['SAM','c41d0a27-fbfb-41f1-af19-7eaeb5c84ecf.png','Sam accepts a job offer and confirms the agreement.'],
    ['EVA','3ee93026-6da1-4423-bc18-f7b56af45231.png','Eva learns English and understands instructions at work.']
  ];
  const use=[{
    words:['submit an application','get a qualification','miss an opportunity','achieve a goal','postpone a decision','face difficulties'],
    phrases:[
      '1. If … had / hadn’t …, … would / wouldn’t have …',
      '2. … would / wouldn’t have … if … had / hadn’t …'
    ]
  },{phrases:['get — got — gotten']}];
  const careerSpeaking=role=>({
    version:1,id:'B11M02L01_S01_'+role.toUpperCase(),kind:'stage',templateRole:'composition',
    title,progressive:true,
    exercises:pictures.map(([person,file,alt])=>({
      id:person.toLowerCase(),
      exercise:kit.speaking({
        id:'B11M02L01_S01_'+(role==='opening'?'OPENING_':'')+person,templateCode:'S01',title,
        arrangement:'image-support-below',
        image:{image:'Images/B1/module 1/'+file,alt,imageWidth:1484,imageHeight:1060},
        use
      })
    }))
  });
  const lessonPictures=[
    [2,'f319e67a-032f-4fdf-b25a-b9bebd3faad9.png','Six workplace situations involving difficult decisions.'],
    [3,'28476544-a11a-4b4e-9769-93ba0bc65f34.png','Six situations involving missed opportunities, disagreements and regrets.'],
    [4,'73f1a4c8-a1bb-4936-82e4-8e3c638754c7.png','Six workplace situations involving responsibility, problems and teamwork.']
  ];
  const tasks={
    2:{
      title:'Difficult decisions',
      task:{text:'These situations happened at work last month. Ask your tutor what they would have done. Then answer the same questions as a member of the team and compare the decisions.'},
      use:[{
        words:['be under pressure','take on responsibility','express concerns','look into the problem','explore alternatives','reach an agreement'],
        phrases:[
          'Would you have ... if ... had / hadn’t ...?',
          'What / How would you have ...?',
          'Yes, I would have. · No, I wouldn’t have.',
          'If I’d ..., I’d have ...',
          'I would’ve ... · I wouldn’t have ...'
        ]
      }]
    },
    3:{
      title:'Regrets',
      task:{text:'The people in the pictures regret something that happened. Speak for each person:',bullets:[
        'say how they feel;',
        'say what they wish had been different.'
      ]},
      use:[{
        words:['disappointed','embarrassed','guilty','ashamed','miserable','betrayed'],
        phrases:['I feel ...','I wish I had / hadn’t ...','If only I had / hadn’t ...','I wish I’d ...','If only ... hadn’t ...']
      }]
    },
    4:{
      title:'Character and choices',
      task:{text:'Look at the time labels. For each person:',bullets:[
        'describe the personality trait;',
        'explain how a different personality would change the situation or result.'
      ]},
      use:[{
        words:['independent','reliable','competitive','self-confident','determined','stubborn'],
        phrases:[
          'If ... were / weren’t ..., ... would / wouldn’t ...',
          'If ... had / hadn’t been ..., ... would / wouldn’t have ...'
        ]
      }]
    }
  };
  const photoSpeaking=(number,file,alt,role)=>kit.speaking({
    id:'B11M02L0'+number+'_S01_'+role.toUpperCase(),templateCode:'S01',...tasks[number],
    image:{image:'Images/'+file,alt,imageWidth:1448,imageHeight:1086}
  });
  const lessons=[
    [1,careerSpeaking],
    ...lessonPictures.map(([number,file,alt])=>[number,role=>photoSpeaking(number,file,alt,role)])
  ];
  for(const [number,createSpeaking] of lessons){
    const index=window.SpaceWhaleContent?.findIndex(lesson=>lesson.id==='b1-1-w2-l'+number)??-1;
    if(index<0)throw new Error('Load B1.1 Module 2 before its Speaking.');
    const lesson=window.SpaceWhaleContent[index];
    const pair=['opening','final'].map(role=>{
      const exercise=createSpeaking(role);kit.validate(exercise);
      return {menu:'Speaking',navigationTitle:'Speaking',navigationBlock:role,section:'tasks',role,exercise};
    });
    const ownIds=new Set(pair.map(stage=>stage.exercise.id));
    const stages=lesson.stages.filter(entry=>!ownIds.has(entry.exercise.id));
    stages.unshift(pair[0]);
    const beforeHomework=stages.findIndex(entry=>entry.section==='self-study');
    stages.splice(beforeHomework<0?stages.length:beforeHomework,0,pair[1]);
    const structure=(lesson.structure||[]).map(section=>({...section,sources:section.sources.filter(id=>!ownIds.has(id))})).filter(section=>section.sources.length);
    for(const stage of pair){
      const section=structure.find(section=>section.role===stage.role);
      if(section)section.sources.push(stage.exercise.id);
      else if(stage.role==='opening')structure.unshift({role:stage.role,sources:[stage.exercise.id]});
      else structure.push({role:stage.role,sources:[stage.exercise.id]});
    }
    window.SpaceWhaleContent[index]={...lesson,stages,structure};
  }
})();
