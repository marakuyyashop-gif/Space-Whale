(() => {
  'use strict';

  const kit = window.SpaceWhaleExerciseKit;
  if (!kit) throw new Error('SpaceWhaleExerciseKit is required.');

  const vocabSheet = 'assets/draft-school-fair-vocab.jpg';
  const crop = (x, y, w, h) => ({ x, y, w, h });

  const stages = [
    {
      menu: 'Read',
      title: 'School fair',
      exercise: {
        version: 1,
        id: 'fair-reading',
        kind: 'presentation',
        title: 'Read the three short texts.',
        instruction: 'Read and think about a title for each text.',
        blocks: [
          { type: 'text', text: '1. Sara and Nina want many people to come to the school fair. They send invitations to students and teachers. Then they make bright decorations for the hall.' },
          { type: 'text', text: '2. Alex and Sam open a food stall near the entrance. Alex sells tickets, and Sam gives people snacks.' },
          { type: 'text', text: '3. Lana chooses music for the fair. At the end of the school competition, she needs to choose a winner.' }
        ]
      }
    },
    {
      menu: 'Match titles',
      title: 'Match the titles',
      exercise: {
        version: 1,
        id: 'fair-match-titles',
        kind: 'matching',
        title: 'Match each text with its title.',
        instruction: 'Click + and choose the best title.',
        items: [
          { id: 't1', text: 'Sara and Nina: invitations and decorations', correctId: 'ready' },
          { id: 't2', text: 'Alex and Sam: stall, tickets and snacks', correctId: 'food' },
          { id: 't3', text: 'Lana: music and the competition', correctId: 'music' }
        ],
        options: [
          { id: 'food', text: 'Food and Tickets' },
          { id: 'music', text: 'Music and the Winner' },
          { id: 'ready', text: 'Getting Ready' }
        ]
      }
    },
    {
      menu: 'True / False',
      title: 'True or false?',
      exercise: {
        version: 1,
        id: 'fair-true-false',
        kind: 'choice',
        title: 'Choose True or False.',
        instruction: 'Use the texts above.',
        items: [
          { id: 'tf1', prompt: 'Sara and Nina send invitations for the school fair.', options: [{id:'t',text:'True'},{id:'f',text:'False'}], correctId: 't' },
          { id: 'tf2', prompt: 'Sara and Nina make a surprise party.', options: [{id:'t',text:'True'},{id:'f',text:'False'}], correctId: 'f' },
          { id: 'tf3', prompt: 'Alex opens a food stall near the entrance.', options: [{id:'t',text:'True'},{id:'f',text:'False'}], correctId: 't' },
          { id: 'tf4', prompt: 'Sam sells cinema tickets.', options: [{id:'t',text:'True'},{id:'f',text:'False'}], correctId: 'f' },
          { id: 'tf5', prompt: 'Lana helps a winner choose the music for the fair.', options: [{id:'t',text:'True'},{id:'f',text:'False'}], correctId: 'f' },
          { id: 'tf6', prompt: 'Lana is the winner at the school competition.', options: [{id:'t',text:'True'},{id:'f',text:'False'}], correctId: 'f' }
        ]
      }
    },
    {
      menu: 'Picture–Word',
      title: 'Match pictures and words',
      exercise: {
        version: 1,
        id: 'fair-picture-word',
        kind: 'matching',
        layout: 'picture-word',
        title: 'Match the pictures with the words.',
        instruction: 'Click the dashed box in each card and choose the correct word.',
        items: [
          { id:'p1', text:'Food stall picture', image:vocabSheet, alt:'A food stall with snacks and lemonade', crop:crop(3.33,1.5,26.03,43.67), correctId:'stall' },
          { id:'p2', text:'Invitation picture', image:vocabSheet, alt:'An invitation in an envelope', crop:crop(36.54,1.5,26.28,43.67), correctId:'invitation' },
          { id:'p3', text:'Winner picture', image:vocabSheet, alt:'A winner holding a trophy and medal', crop:crop(70.26,1.5,25.64,43.67), correctId:'winner' },
          { id:'p4', text:'Music picture', image:vocabSheet, alt:'A musician playing guitar', crop:crop(3.46,51.67,26.54,43.33), correctId:'music' },
          { id:'p5', text:'Decoration picture', image:vocabSheet, alt:'Party decorations and bunting', crop:crop(36.67,51.67,26.28,43.33), correctId:'decoration' },
          { id:'p6', text:'Ticket picture', image:vocabSheet, alt:'A roll of event tickets', crop:crop(70.26,51.67,25.77,43.33), correctId:'ticket' }
        ],
        options: [
          { id:'winner', text:'winner' },
          { id:'ticket', text:'ticket' },
          { id:'stall', text:'food stall' },
          { id:'decoration', text:'decoration' },
          { id:'music', text:'music' },
          { id:'invitation', text:'invitation' }
        ]
      }
    },
    {
      menu: 'Type the word',
      title: 'Complete the sentences',
      exercise: {
        version: 1,
        id: 'fair-typed-gaps',
        kind: 'gaps',
        inputMode: 'text',
        title: 'Complete the sentences.',
        instruction: 'Type the missing word.',
        items: [
          { id:'g1', segments:['Before the fair, send ', {id:'a1',answers:['invitations']}, ' to parents.'] },
          { id:'g2', segments:['We make ', {id:'a2',answers:['decorations']}, ' for the school hall.'] },
          { id:'g3', segments:['Sell ', {id:'a3',answers:['tickets']}, ' at the entrance.'] },
          { id:'g4', segments:['At the end, choose a ', {id:'a4',answers:['winner']}, '.'] }
        ]
      }
    },
    {
      menu: 'Word bank',
      title: 'Words in context',
      exercise: {
        version: 1,
        id: 'fair-bank-gaps',
        kind: 'gaps',
        inputMode: 'text',
        title: 'Complete the sentences.',
        instruction: 'Use a word from the bank and type it into each gap.',
        bank: ['winner','ticket','decoration','music','invitation','food stall'],
        items: [
          { id:'b1', segments:['Anna sent me an ', {id:'b1g',answers:['invitation']}, ' to the school fair.'] },
          { id:'b2', segments:['The gold ', {id:'b2g',answers:['decoration']}, ' above the classroom door fell down.'] },
          { id:'b3', segments:['We bought two sandwiches at the ', {id:'b3g',answers:['food stall']}, '.'] },
          { id:'b4', segments:['The man at the door checked my ', {id:'b4g',answers:['ticket']}, '.'] },
          { id:'b5', segments:['The ', {id:'b5g',answers:['music']}, ' is too loud in the hall.'] },
          { id:'b6', segments:['The ', {id:'b6g',answers:['winner']}, ' is holding the gold cup.'] }
        ]
      }
    },
    {
      menu: 'Listen: words',
      title: 'Listen & Repeat — words',
      exercise: {
        version: 1,
        id: 'fair-listen-words',
        kind: 'audio',
        layout: 'listen-repeat',
        audioPending: true,
        title: 'Listen and repeat.',
        instruction: 'Each line has its own audio slot. The production files can be connected later.',
        items: [
          {id:'lrw1',text:'invitation',example:'This is an invitation.'},
          {id:'lrw2',text:'decoration',example:'The decoration is beautiful.'},
          {id:'lrw3',text:'food stall',example:'The food stall is open.'},
          {id:'lrw4',text:'ticket',example:'I have a ticket.'},
          {id:'lrw5',text:'music',example:'I like this music.'},
          {id:'lrw6',text:'winner',example:'She is the winner.'}
        ]
      }
    },
    {
      menu: 'Listen: phrases',
      title: 'Listen & Repeat — phrases',
      exercise: {
        version: 1,
        id: 'fair-listen-phrases',
        kind: 'audio',
        layout: 'listen-repeat',
        audioPending: true,
        title: 'Listen and repeat.',
        instruction: 'Repeat each phrase.',
        items: [
          {id:'lrp1',text:'send invitations'},
          {id:'lrp2',text:'make decorations'},
          {id:'lrp3',text:'open a food stall'},
          {id:'lrp4',text:'sell tickets'},
          {id:'lrp5',text:'play music'},
          {id:'lrp6',text:'choose a winner'}
        ]
      }
    },
    {
      menu: 'Use phrases',
      title: 'Use phrases',
      exercise: {
        version: 1,
        id: 'fair-translation',
        kind: 'rule-page',
        title: 'Useful phrases',
        instruction: '',
        blocks: [
          {
            type:'rule',
            examples:[
              'send invitations — отправлять приглашения',
              'make decorations — делать украшения',
              'open a food stall — открыть палатку / точку с едой',
              'sell tickets — продавать билеты',
              'play music — включать / играть музыку',
              'choose a winner — выбирать победителя'
            ]
          }
        ]
      }
    },
    {
      menu: 'Speaking',
      title: 'Prepare a school fair',
      exercise: {
        version: 1,
        id: 'fair-speaking',
        kind: 'presentation',
        title: 'Speak.',
        instruction: 'Look at the pictures. Imagine that you are preparing a school fair.',
        blocks: [
          { type:'image', image:'assets/draft-school-fair-speaking.webp', alt:'Six scenes showing students preparing a school fair' },
          { type:'text', text:'For each picture, make one sentence about what you need to do. Use: We need to …' }
        ]
      }
    },
    {
      menu: 'Dropdown',
      title: 'Choose the correct phrase',
      exercise: {
        version: 1,
        id: 'fair-inline-dropdown',
        kind: 'gaps',
        inputMode: 'select',
        title: 'Choose the correct option.',
        instruction: 'Open the dropdown inside each sentence.',
        items: [
          {id:'d1',segments:['They will ',{id:'d1g',answers:['send invitations'],options:['make decorations','send invitations','play music']},' to all parents by email tonight.']},
          {id:'d2',segments:['We will ',{id:'d2g',answers:['open a food stall'],options:['open a food stall','choose a winner','sell tickets']},' near the playground and sell sandwiches.']},
          {id:'d3',segments:['At 5:00, the teachers will ',{id:'d3g',answers:['choose a winner'],options:['play music','make decorations','choose a winner']},' and give the student a prize.']}
        ]
      }
    },
    {
      menu: 'Build 1',
      title: 'Build the sentence',
      exercise: {
        version:1,id:'fair-order-1',kind:'order',title:'Build the sentence.',instruction:'Click the words in the correct order.',
        tokens:[
          {id:'a',text:'classmates'},{id:'b',text:'send'},{id:'c',text:'our'},{id:'d',text:'invitations'},{id:'e',text:'to'}
        ],
        correctOrder:['b','d','e','c','a']
      }
    },
    {
      menu: 'Build 2',
      title: 'Build the sentence',
      exercise: {
        version:1,id:'fair-order-2',kind:'order',title:'Build the sentence.',instruction:'Click the words in the correct order.',
        tokens:[
          {id:'a',text:'school'},{id:'b',text:'decorations'},{id:'c',text:'the'},{id:'d',text:'for'},{id:'e',text:'fair'},{id:'f',text:'make'}
        ],
        correctOrder:['f','b','d','c','a','e']
      }
    },
    {
      menu: 'Build 3',
      title: 'Build the sentence',
      exercise: {
        version:1,id:'fair-order-3',kind:'order',title:'Build the sentence.',instruction:'Click the words in the correct order.',
        tokens:[
          {id:'a',text:'sell'},{id:'b',text:'food stall'},{id:'c',text:'open'},{id:'d',text:'tickets'},{id:'e',text:'and'},{id:'f',text:'a'}
        ],
        correctOrder:['c','f','b','e','a','d']
      }
    },
    {
      menu: 'Final match',
      title: 'Match the sentence parts',
      exercise: {
        version:1,
        id:'fair-final-match',
        kind:'matching',
        title:'Match the sentence parts.',
        instruction:'Click + and make six complete sentences.',
        items:[
          {id:'m1',text:'We need to send invitations',correctId:'c'},
          {id:'m2',text:'The students are making decorations',correctId:'f'},
          {id:'m3',text:'Our class will open a food stall',correctId:'e'},
          {id:'m4',text:'Two students will sell tickets',correctId:'b'},
          {id:'m5',text:'Ben and Leo can play music',correctId:'d'},
          {id:'m6',text:'At the end, we will choose a winner',correctId:'a'}
        ],
        options:[
          {id:'a',text:'for the best costume.'},
          {id:'b',text:'at the entrance.'},
          {id:'c',text:'to all the students in our class.'},
          {id:'d',text:'during the fair.'},
          {id:'e',text:'with sandwiches and drinks.'},
          {id:'f',text:'for the school fair today.'}
        ]
      }
    }
  ];

  stages.forEach(stage => kit.validate(stage.exercise));
  window.SpaceWhaleContent = window.SpaceWhaleContent || [];
  window.SpaceWhaleContent.push({
    id: 'school-fair', title: 'Готовим школьную ярмарку', level: null, whale: null, stages
  });
})();
