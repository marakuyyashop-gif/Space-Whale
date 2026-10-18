/* Approved B1.1 / Module 2 / Lesson 1 final Speaking.
 * Five original uploaded images; content/layout uses the shared Speaking factory.
 * Source: Pasted markdown(20261018-155943).md, latest owner instructions.
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
      'If … had / hadn’t …, … would / wouldn’t have …',
      '… would / wouldn’t have … if … had / hadn’t …',
      'get — got — gotten'
    ]
  }];
  const exercise={
    version:1,id:'B11M02L01_S01_FINAL',kind:'stage',templateRole:'composition',
    title,progressive:true,
    exercises:pictures.map(([person,file,alt])=>({
      id:person.toLowerCase(),
      exercise:kit.speaking({
        id:'B11M02L01_S01_'+person,templateCode:'S01',title,
        arrangement:'image-support',
        image:{image:'Images/B1/module 1/'+file,alt,imageWidth:1484,imageHeight:1060},
        use
      })
    }))
  };
  kit.validate(exercise);
  const index=window.SpaceWhaleContent?.findIndex(lesson=>lesson.id==='b1-1-w2-l1')??-1;
  if(index<0)throw new Error('Load B1.1 Module 2 before its final Speaking.');
  const lesson=window.SpaceWhaleContent[index];
  const stage={menu:'Speaking',navigationTitle:'Speaking',navigationBlock:'final',section:'tasks',role:'final',exercise};
  const stages=lesson.stages.filter(entry=>entry.exercise.id!==exercise.id);
  const beforeHomework=stages.findIndex(entry=>entry.section==='self-study');
  stages.splice(beforeHomework<0?stages.length:beforeHomework,0,stage);
  const structure=(lesson.structure||[]).map(section=>({...section,sources:section.sources.filter(id=>id!==exercise.id)})).filter(section=>section.sources.length);
  const final=structure.find(section=>section.role==='final');
  if(final)final.sources.push(exercise.id);
  else structure.push({role:'final',sources:[exercise.id]});
  window.SpaceWhaleContent[index]={...lesson,stages,structure};
})();
