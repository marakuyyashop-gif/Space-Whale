(function (scope) {
  'use strict';
  const templates=typeof module==='object'&&module.exports?require('./exercise-templates.js'):scope.SpaceWhaleExerciseTemplates;
  if(!templates)throw Error('Exercise template registry must load before ExerciseKit.');
  const uiLabels = { check: 'OK' }; // Shared button copy for every exercise.
  const kinds = ['matching', 'gaps', 'choice', 'image-label', 'order', 'sort', 'writing', 'presentation', 'audio', 'rule-page', 'stage'];
  const normalize = value => String(value ?? '').normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('en');
  const normalizeEnglish = value => normalize(value).replace(/[‘’ʼ]/g, "'").replace(/\.$/, '').trim();
  // Only interchangeable generic task copy is folded. Context, word limits and
  // other authored instructions keep their wording and place in the exercise.
  const taskCopy = value => normalize(value).replace(/[.!?]+$/, '').trim();
  const taskCopyKey = value => {
    const text=taskCopy(value);
    if(/^complete (?:the )?sentences?(?: with (?:the )?(?:correct|right) words?)?$/.test(text))return 'complete-sentences';
    if(/^complete (?:the )?rules?$/.test(text))return 'complete-rules';
    if(/^choose (?:the )?(?:correct|right) (?:options?|answers?)$/.test(text))return 'choose-options';
    return text;
  };
  const sameTaskCopy = (first,second) => Boolean(first&&second)&&taskCopyKey(first)===taskCopyKey(second);
  const mechanismTitles = new Set(['matching','gaps','dropdown','inline dropdown','single choice','multiple choice','multiple select','text single choice','image single choice','text multiple select','image multiple select','typed input','typed input / gap','text / writing field','typed gap','typed gap + word bank','writing','open writing','global audio','reading','order','sort','image label']);
  const hasExampleModels = def => ['presentation','rule-page'].includes(def.kind)&&def.blocks?.some(block=>block.type==='text'&&block.role==='examples');
  const isExamplesPresentation = def => def.kind==='presentation'&&hasExampleModels(def)&&taskCopy(def.title)==='examples';
  const hiddenChildHeading = (parent,child,index) => {
    if(sameTaskCopy(parent.title,child.title)||mechanismTitles.has(taskCopy(child.title)))return true;
    // A read-then-match instruction already names the task following its models.
    // Keep other authored child tasks and headings independent.
    if(child.kind!=='matching'||parent.kind!=='stage'||!parent.exercises.slice(0,index).some(block=>hasExampleModels(block.exercise)))return false;
    return [parent.title,parent.instruction].some(copy=>{
      const task=taskCopy(copy).match(/^(?:read|look at|study) (?:the )?examples[.!?;,:\s]+(?:then\s+)?(.+)$/);
      return task&&sameTaskCopy(task[1],child.title);
    });
  };
  const hasSpecificChildHeading = def => {
    if(def.kind!=='stage'||!mechanismTitles.has(taskCopy(def.title)))return false;
    const child=def.exercises.find(block=>!['presentation','audio'].includes(block.exercise.kind))?.exercise||def.exercises[0]?.exercise;
    return child&&!mechanismTitles.has(taskCopy(child.title))&&!sameTaskCopy(child.title,def.title);
  };
  const redundantInstruction = def => sameTaskCopy(def.instruction,def.title)||(
    taskCopyKey(def.instruction)==='choose-options'&&
    (def.kind==='choice'||def.kind==='gaps'&&def.inputMode==='select')&&
    ['complete-sentences','complete-rules'].includes(taskCopyKey(def.title))
  );
  // Opt-in for keyed translations: typography and contractions do not change meaning.
  // Vocabulary/word order/tense are still checked against authored alternatives.
  const normalizeTranslation = value => normalize(value).replace(/[‘’ʼ]/g, "'")
    .replace(/\b(can't|cannot)\b/g,'can not').replace(/\bwon't\b/g,'will not')
    .replace(/\b(don't|doesn't|didn't|isn't|aren't|wasn't|weren't|couldn't|shouldn't|wouldn't|haven't|hasn't|hadn't)\b/g,word=>({"don't":"do not","doesn't":"does not","didn't":"did not","isn't":"is not","aren't":"are not","wasn't":"was not","weren't":"were not","couldn't":"could not","shouldn't":"should not","wouldn't":"would not","haven't":"have not","hasn't":"has not","hadn't":"had not"}[word]))
    .replace(/\bi'm\b/g,'i am').replace(/\b(you|we|they)'re\b/g,'$1 are')
    .replace(/\b(he|she|it|that|there)'s\b/g,'$1 is')
    .replace(/[.,!?;:«»“”"–—]/g,' ').replace(/\s+/g,' ').trim();
  const orderSentence = (def, order) => {
    let text = (order || []).map(id => def.tokens.find(token => token.id === id).text).join(' ').replace(/\s+([,.!?;:])/g, '$1');
    if (def.sentenceCase) text = text.charAt(0).toUpperCase() + text.slice(1);
    return text + (def.sentenceSuffix || '');
  };
  const clone = value => JSON.parse(JSON.stringify(value));
  const POSSIBLE_ANSWERS_TITLE = 'Possible answers';
  const possibleAnswerAliases = new Set([
    'possible answer', 'possible answers',
    'answer', 'answers',
    'sample answer', 'sample answers',
    'suggested answer', 'suggested answers',
    'model answer', 'model answers',
    'possible response', 'possible responses',
    'sample response', 'sample responses',
    'suggested response', 'suggested responses',
    'response', 'responses',
    'possible', 'respond'
  ]);
  const isPossibleAnswersBlock = block =>
    block?.role === 'possible-answers' || possibleAnswerAliases.has(normalize(block?.title));
  const isSpeaking = def => def?.kind === 'presentation' && def.layout === 'speaking';

  // All Speaking content uses this one layout, in lessons and in the catalog.
  function speaking(content) {
    const definition = { version: 1, kind: 'presentation', layout: 'speaking', image: null, ...content };
    if (!isSpeaking(definition) || definition.version !== 1) throw new Error('Speaking uses the shared presentation layout');
    return clone(validate(definition));
  }

  function validate(def) {
    const fail = message => { throw new Error(message); };
    const text = (value, name) => { if (typeof value !== 'string' || !value.trim()) fail(`${name}: expected non-empty text`); };
    if(def?.templateCode!=null&&!templates.codes.includes(def.templateCode))fail('Unknown exercise template '+def.templateCode);
    const safeId = (value, name) => { text(value, name); if (['__proto__', 'constructor', 'prototype'].includes(value)) fail(`${name}: reserved ID`); };
    const array = (value, name) => { if (!Array.isArray(value) || !value.length) fail(`${name}: expected a non-empty list`); };
    const ids = (items, name) => {
      array(items, name);
      const used = new Set();
      items.forEach(item => { safeId(item?.id, `${name}.id`); if (used.has(item.id)) fail(`${name}: duplicate id ${item.id}`); used.add(item.id); });
      return used;
    };
    const media = item => {
      if (item.imageCopies != null && (!Number.isInteger(item.imageCopies) || item.imageCopies < 1 || item.imageCopies > 4)) fail('imageCopies must be between 1 and 4');
      if (item.imagePending != null && typeof item.imagePending !== 'boolean') fail('imagePending must be boolean');
      if (item.image != null) {
        text(item.image, 'image'); text(item.alt, 'image alt');
        const url = new URL(item.image, 'https://preview.invalid/');
        if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) fail('Unsupported image URL');
        if (item.crop != null) {
          const crop = item.crop;
          if (!crop || !['x','y','w','h'].every(key => Number.isFinite(crop[key]))) fail('Image crop needs x, y, w and h');
          if (crop.x < 0 || crop.y < 0 || crop.w <= 0 || crop.h <= 0 || crop.x + crop.w > 100 || crop.y + crop.h > 100) fail('Image crop must stay within 0–100 percent');
        }
      }
    };
    const audioSource = value => {
      text(value, 'audio');
      if (/^data:audio\/(mpeg|mp3|wav|x-wav|ogg);base64,/i.test(value)) return;
      const url = new URL(value, 'https://preview.invalid/');
      if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) fail('Unsupported audio URL');
    };
    const options = items => { const valid = ids(items, 'options'); items.forEach(item => { text(item.text, 'option text'); media(item); }); return valid; };
    const key = (item, valid) => { if (item.correctId != null && !valid.has(item.correctId)) fail(`Unknown answer ID: ${item.correctId}`); };
    if (!def || def.version !== 1 || !kinds.includes(def.kind)) fail('Expected version 1 and a supported kind');
    safeId(def.id, 'id'); text(def.title, 'title');
    if (def.responseMode != null && !['open','personal','accepted'].includes(def.responseMode)) fail('Unsupported response mode');
    if (def.responseMode === 'accepted' && def.kind !== 'writing') fail('Accepted response mode requires writing');
    if (def.instruction != null && typeof def.instruction !== 'string') fail('instruction must be text');
    if (def.kind === 'stage') {
      ids(def.exercises, 'exercises');
      if (def.layout != null && !['separate', 'grouped'].includes(def.layout)) fail('Unsupported stage layout');
      if (def.layout === 'grouped' && def.progressive) fail('Grouped components cannot reveal as separate exercises');
      if (def.progressive != null && typeof def.progressive !== 'boolean') fail('progressive must be boolean');
      if(def.unifiedProgression!=null&&typeof def.unifiedProgression!=='boolean')fail('unifiedProgression must be boolean');
      if(def.revealStops!=null){
        array(def.revealStops,'revealStops');
        if(!def.progressive || def.revealStops.some((n,i)=>!Number.isInteger(n)||n<1||n>def.exercises.length||(i>0&&n<=def.revealStops[i-1])) || def.revealStops[def.revealStops.length-1]!==def.exercises.length)fail('Invalid progressive reveal stops');
      }
      def.exercises.forEach(block => {
        if (block.id === 'revealed') fail('Reserved stage state key');
        if (block.exercise?.kind === 'stage'&&!def.unifiedProgression) fail('Stage containers cannot be nested');
        validate(block.exercise);
      });
      if (def.transcript != null) {
        text(def.transcript, 'transcript'); if(def.transcriptGate){safeId(def.transcriptGate,'transcriptGate');}else array(def.transcriptAfter, 'transcriptAfter');
        const checkable = new Set(['matching','gaps','choice','image-label','order','sort','writing']);
        if (!def.transcriptGate && (new Set(def.transcriptAfter).size !== def.transcriptAfter.length || def.transcriptAfter.some(id => !def.exercises.some(block => block.id === id && checkable.has(block.exercise.kind))))) fail('transcriptAfter must reference distinct response blocks');
      } else if (def.transcriptAfter != null) fail('transcriptAfter requires a transcript');
      return def;
    }
    if (def.kind === 'presentation') {
      if (def.layout != null && def.layout !== 'speaking') fail('Unsupported presentation layout');
      if (isSpeaking(def)) {
        const only = (object, allowed, name) => {
          if (!object || typeof object !== 'object' || Array.isArray(object)) fail(`${name}: expected an object`);
          for (const field of Object.keys(object)) if (!allowed.includes(field)) fail(`${name}: unsupported field ${field}`);
        };
        // Catalog metadata is never rendered as exercise content.
        only(def, ['version','id','kind','layout','title','image','task','use','arrangement','label','catalogGroup','legacyIds','description','code','catalogFamily','catalogTitle','sourceRefs','templateCode','templatePart','templateRole'], 'Speaking');
        if(def.arrangement!=null&&def.arrangement!=='image-support')fail('Unsupported Speaking arrangement');
        if (def.image !== null) {
          only(def.image, ['image','alt','imageWidth','imageHeight','crop','assetId','imagePending'], 'Speaking image');
          if (!def.image.imagePending) text(def.image.image, 'image');
          media(def.image);
        }
        if(def.task!=null||def.arrangement!=='image-support'){
          only(def.task, ['text','bullets'], 'Speaking task');
          text(def.task.text, 'Speaking task text');
          if (def.task.bullets != null) {
            if (!Array.isArray(def.task.bullets)) fail('Speaking bullets: expected a list');
            def.task.bullets.forEach(value => text(value, 'Speaking bullet'));
          }
        }
        array(def.use, 'Speaking Use');
        def.use.forEach(group => {
          only(group, ['words','phrases'], 'Speaking Use group');
          for (const field of ['words','phrases']) {
            if (group[field] != null && !Array.isArray(group[field])) fail(`Speaking ${field}: expected a list`);
            (group[field] || []).forEach(value => text(value, `Speaking ${field}`));
          }
          if (!group.words?.length && !group.phrases?.length) fail('Speaking Use group must contain words or phrases');
        });
        return def;
      }
      array(def.blocks, 'blocks');
      def.blocks.forEach(block => {
        if (!['text', 'image', 'disclosure'].includes(block.type)) fail('Unsupported presentation block');
        if(block.role==='examples'&&block.type!=='text')fail('Example models require a text block');
        if (block.type === 'image') { if (!block.imagePending) text(block.image, 'image'); media(block); }
        else {
          text(block.text, 'block text'); if (block.type === 'disclosure') text(block.title, 'disclosure title');
          if (block.type === 'text') for (const field of ['highlights','emphasis']) {
            if (block[field] != null) { array(block[field], field); block[field].forEach(part => { text(part, field); if (!block.text.includes(part)) fail('Formatted phrase missing from text'); }); }
          }
        }
      });
      return def;
    }
    if (def.kind === 'audio') {
      if (def.audioPending != null && typeof def.audioPending !== 'boolean') fail('audioPending must be boolean');
      if (def.transcript != null) text(def.transcript, 'transcript');
      if (def.layout != null && !['player', 'listen-repeat'].includes(def.layout)) fail('Unsupported audio layout');
      if (def.layout === 'listen-repeat') {
        ids(def.items, 'items');
        def.items.forEach(item => {
          text(item.text, 'listen-repeat text');
          if (item.audio != null) audioSource(item.audio);
          else if (!def.audioPending) fail('Listen & Repeat item needs word audio unless audioPending is true');
          if (item.example != null && typeof item.example !== 'string') fail('listen-repeat example must be text');
          if (item.exampleAudio != null) audioSource(item.exampleAudio);
          else if (item.example && !def.audioPending) fail('Listen & Repeat example needs its own audio unless audioPending is true');
        });
      } else {
        if (def.audio != null) audioSource(def.audio);
        else if (!def.audioPending) fail('Audio player needs audio unless audioPending is true');
      }
      return def;
    }
    if (def.kind === 'rule-page') {
      array(def.blocks, 'blocks');
      const blockIds = new Set();
      def.blocks.forEach((block, index) => {
        if (!block || !['text', 'rule', 'image', 'exercise'].includes(block.type)) fail('Unsupported rule-page block');
        if(block.role==='examples'&&block.type!=='text')fail('Example models require a text block');
        if (block.type === 'text') {
          text(block.text, 'text block');
          if (block.highlights != null) { array(block.highlights, 'highlights'); block.highlights.forEach(part => { text(part, 'highlight'); if (!block.text.includes(part)) fail('Highlight missing from text'); }); }
          if (block.title != null && typeof block.title !== 'string') fail('text block title must be text');
        }
        if (block.type === 'rule') {
          const hasContent = [block.title, block.text, block.formula].some(value => typeof value === 'string' && value.trim())
            || (Array.isArray(block.examples) && block.examples.length);
          if (!hasContent) fail('rule block needs content');
          if (block.title != null && typeof block.title !== 'string') fail('rule title must be text');
          if (block.text != null && typeof block.text !== 'string') fail('rule text must be text');
          if (block.formula != null && typeof block.formula !== 'string') fail('rule formula must be text');
          if (block.examples != null) { array(block.examples, 'rule examples'); block.examples.forEach(example => text(example, 'rule example')); }
        }
        if (block.type === 'image') {
          if (!block.imagePending) text(block.image, 'image');
          text(block.alt, 'image alt');
          media(block);
          if (block.caption != null && typeof block.caption !== 'string') fail('image caption must be text');
        }
        if (block.type === 'exercise') {
          safeId(block.id, `blocks[${index}].id`);
          if (blockIds.has(block.id)) fail(`rule-page: duplicate block id ${block.id}`);
          blockIds.add(block.id);
          if (!block.exercise || block.exercise.kind === 'rule-page') fail('rule-page exercises cannot contain another rule-page');
          validate(block.exercise);
        }
      });
      return def;
    }
    if (def.kind === 'order') {
      if (def.source != null) { if (!def.source.text && !def.source.audio) fail('Ordering source needs text or audio'); if (def.source.text != null) text(def.source.text, 'source text'); if (def.source.audio != null) audioSource(def.source.audio); }
      if (def.layout != null && !['tokens', 'image-grid'].includes(def.layout)) fail('Unsupported order layout');
      const valid = options(def.tokens);
      def.tokens.forEach(token => media(token));
      if (def.correctOrder != null && (!Array.isArray(def.correctOrder) || def.correctOrder.length !== valid.size || new Set(def.correctOrder).size !== valid.size || def.correctOrder.some(id => !valid.has(id)))) fail('correctOrder must contain every token ID exactly once');
      if (def.acceptedOrders != null) {
        array(def.acceptedOrders, 'acceptedOrders');
        def.acceptedOrders.forEach(order => {
          if (!Array.isArray(order) || order.length !== valid.size || new Set(order).size !== valid.size || order.some(id => !valid.has(id))) fail('acceptedOrders must contain complete token permutations');
        });
      }
      return def;
    }
    if (def.kind === 'image-label') {
      if (!def.imagePending) text(def.image, 'image');
      text(def.alt, 'image alt');
      media(def);
      const valid = options(def.options);
      def.options.forEach(option => { if (option.translation != null) text(option.translation, 'option translation'); });
      const assigned = new Set();
      ids(def.items, 'items');
      def.items.forEach((item, index) => {
        if (!Number.isFinite(item.x) || item.x < 0 || item.x > 100) fail(`items[${index}].x must be between 0 and 100`);
        if (!Number.isFinite(item.y) || item.y < 0 || item.y > 100) fail(`items[${index}].y must be between 0 and 100`);
        if (item.prompt != null && typeof item.prompt !== 'string') fail('image-label prompt must be text');
        key(item, valid);
        if (item.correctId != null) {
          if (assigned.has(item.correctId)) fail('Image-label answer IDs must be unique');
          assigned.add(item.correctId);
        }
      });
      if (def.options.length < def.items.length) fail('Image-label needs at least one option per target');
      return def;
    }
    ids(def.items, 'items');
    if (def.kind === 'matching') {
      if (def.layout != null && !['cards', 'picture-word', 'word-translation', 'word-definition', 'stacked-text', 'audio-picture'].includes(def.layout)) fail('Unsupported matching layout');
      const valid = options(def.options);
      const assigned = new Set();
      def.items.forEach(item => {
        text(item.text, 'card text');
        media(item);
        if (item.audio != null) audioSource(item.audio);
        if (item.audioPending != null && typeof item.audioPending !== 'boolean') fail('matching audioPending must be boolean');
        if (def.layout === 'picture-word' && !item.image && !item.imagePending) fail('Picture-word items need images');
        key(item, valid);
        if (item.correctId != null) {
          if (assigned.has(item.correctId)) fail('Matching answer IDs must be unique');
          assigned.add(item.correctId);
        }
      });
      if (def.options.length < def.items.length) fail('Matching needs at least one option per card');
    }
    if(def.progressiveQuestions!=null&&typeof def.progressiveQuestions!=='boolean')fail('progressiveQuestions must be boolean');
    if (def.kind === 'choice') {
      if (def.layout != null && !['list', 'image-grid', 'dropdown'].includes(def.layout)) fail('Unsupported choice layout');
      if(def.progressiveQuestions!=null&&typeof def.progressiveQuestions!=='boolean')fail('progressiveQuestions must be boolean');
      if (def.multiple != null && typeof def.multiple !== 'boolean') fail('multiple must be boolean');
      if (def.multiple && def.layout === 'dropdown') fail('Multiple choice needs visible checkboxes');
      def.items.forEach(item => {
        media(item); text(item.prompt, 'prompt'); const valid = options(item.options); key(item, valid);
        if (item.promptHighlights != null) { array(item.promptHighlights, 'promptHighlights'); item.promptHighlights.forEach(part => { text(part, 'prompt highlight'); if (!item.prompt.includes(part)) fail('Highlight missing from prompt'); }); }
        if (def.multiple) {
          if (item.correctId != null) fail('Multiple choice uses correctIds');
          if (item.correctIds != null) {
            array(item.correctIds, 'correctIds');
            if (new Set(item.correctIds).size !== item.correctIds.length || item.correctIds.some(id => !valid.has(id))) fail('Invalid correctIds');
          }
        } else if (item.correctIds != null) fail('correctIds requires multiple choice');
      });
    }
    if (def.kind === 'sort') {
      const valid = options(def.groups);
      def.items.forEach(item => { text(item.text, 'item text'); key(item, valid); });
    }
    if (def.kind === 'writing') def.items.forEach(item => {
      media(item); text(item.prompt,'prompt');
      if(item.normalization!=null&&item.normalization!=='translation')fail('Unsupported writing normalization');
      if(item.hint!=null)text(item.hint,'hint');
      if(item.placeholder!=null)text(item.placeholder,'placeholder');
      if(item.multiline!=null&&typeof item.multiline!=='boolean')fail('multiline must be boolean');
      for (const field of ['possibleAnswers','acceptedAnswers']) {
        if (item[field] != null) { array(item[field],field); item[field].forEach(answer=>text(answer,field)); }
      }
      if (def.responseMode === 'accepted' && !item.acceptedAnswers) fail('Accepted writing needs acceptedAnswers for every item');
      if (['open','personal'].includes(def.responseMode) && item.acceptedAnswers) fail('Open writing cannot have acceptedAnswers');
    });
    if (def.kind === 'gaps') {
      if (def.layout != null && !['sentences', 'paragraph', 'picture-rows', 'table'].includes(def.layout)) fail('Unsupported gaps layout');
      if (def.layout === 'table') {
        array(def.tableColumns, 'tableColumns');
        if (def.tableColumns.length < 2 || def.tableColumns.length > 6) fail('tableColumns needs 2–6 columns');
        def.tableColumns.forEach(column => text(column, 'table column'));
      } else if (def.tableColumns != null) fail('tableColumns requires table layout');
      if (def.inputMode != null && !['text', 'select'].includes(def.inputMode)) fail('Unsupported gaps inputMode');
      if (def.bank) { array(def.bank, 'bank'); def.bank.forEach(word => text(word, 'bank word')); }
      const used = new Set();
      def.items.forEach(item => {
        media(item);
        array(item.segments, 'segments');
        if (def.layout === 'table' && item.segments.length !== def.tableColumns.length) fail('Table rows must match tableColumns');
        item.segments.forEach(segment => {
          if (typeof segment === 'string') return;
          safeId(segment?.id, 'gap id');
          if (segment.placeholder != null) text(segment.placeholder, 'gap placeholder');
          if (used.has(segment.id)) fail(`Duplicate gap ID: ${segment.id}`);
          used.add(segment.id);
          if (segment.possibleAnswers) { array(segment.possibleAnswers, 'possibleAnswers'); segment.possibleAnswers.forEach(answer => text(answer, 'possible answer')); }
          if (segment.answers) { array(segment.answers, 'answers'); segment.answers.forEach(answer => text(answer, 'answer')); }
          if (segment.options) { array(segment.options, 'gap options'); segment.options.forEach(option => text(option, 'gap option')); }
          const choices = def.inputMode === 'select' ? segment.options || def.bank : segment.options;
          if (choices && segment.answers?.some(answer => !choices.some(choice => normalize(choice) === normalize(answer)))) fail('Gap answer missing from its options/bank');
        });
      });
      if (!used.size) fail('A gaps exercise needs at least one gap');
    }
    return def;
  }
  function grade(def, answers = {}) {
    validate(def);
    const results = {};
    const mark = (id, answered, correct) => { results[id] = !answered ? 'empty' : correct == null ? 'review' : correct ? 'correct' : 'retry'; };
    if (def.kind === 'presentation' || def.kind === 'audio' || def.kind === 'rule-page' || def.kind === 'stage') return results;
    if (def.kind === 'order') {
      const order = Array.isArray(answers.order) ? answers.order : [];
      const accepted = [...(def.correctOrder ? [def.correctOrder] : []), ...(def.acceptedOrders || [])];
      mark('order', order.length === def.tokens.length, accepted.length ? accepted.some(candidate => JSON.stringify(order) === JSON.stringify(candidate)) : null);
    } else if (def.kind === 'gaps') {
      def.items.forEach(item => item.segments.forEach(segment => {
        if (typeof segment === 'string') return;
        const normalized = value => segment.normalization === 'phone' ? normalize(value).replace(/[\s()–—-]/g, '') : segment.normalization === 'english' ? normalizeEnglish(value) : normalize(value);
        const value = normalized(answers[segment.id]);
        mark(segment.id, !!value, segment.answers ? segment.answers.some(answer => normalized(answer) === value) : null);
      }));
    } else {
      def.items.forEach(item => {
        const value = answers[item.id];
        if (def.kind === 'choice' && def.multiple) {
          const selected = Array.isArray(value) ? value : [];
          mark(item.id, selected.length > 0, item.correctIds ? selected.length === item.correctIds.length && new Set(selected).size === selected.length && item.correctIds.every(id => selected.includes(id)) : null);
          return;
        }
        const correct = def.kind === 'writing'
          ? (item.acceptedAnswers ? item.acceptedAnswers.some(answer => (item.normalization==='translation'?normalizeTranslation(answer):normalize(answer)) === (item.normalization==='translation'?normalizeTranslation(value):normalize(value))) : null)
          : (item.correctId == null ? null : value === item.correctId);
        mark(item.id, value != null && String(value).trim() !== '', correct);
      });
    }
    return results;
  }
  const feedbackMessages=['Try again.','Take another look.','Good start.','So close.','All correct.'];
  function feedbackMessage(results,kind){
    const values=Object.values(results),correct=values.filter(value=>value==='correct').length;
    if(!values.length||values.every(value=>value==='empty'))return ['gaps','writing'].includes(kind)?'Write an answer.':'Choose an answer.';
    if(values.includes('retry')){const band=correct===0?0:Math.max(1,Math.min(3,Math.round(correct/values.length*4)));return feedbackMessages[band];}
    if(values.includes('review'))return values.includes('empty')?'Заполните оставшиеся поля.':'Well done';
    const band=correct===0?0:correct===values.length?4:Math.max(1,Math.min(3,Math.round(correct/values.length*4)));
    return feedbackMessages[band];
  }
  // One reversible height transition for exercise sections, disclosures and workspace panels.
  const movements=new WeakMap();
  function expand(element,open,done){
    const previous=movements.get(element);
    const from=element.hidden?0:element.getBoundingClientRect?.().height||element.scrollHeight||0;
    if(previous){previous.onfinish=null;previous.cancel();movements.delete(element);}
    element.hidden=false;element.inert=!open;
    const finish=()=>{element.hidden=!open;element.inert=!open;element.style.removeProperty('height');element.style.removeProperty('overflow');movements.delete(element);done?.();};
    if(!element.animate||element.ownerDocument.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)').matches){finish();return;}
    element.style.height='auto';const to=open?element.scrollHeight:0;
    element.style.overflow='hidden';
    const animation=element.animate([{height:from+'px',opacity:open?.45:1},{height:to+'px',opacity:open?1:0}],{duration:260,easing:'cubic-bezier(.22,.7,.25,1)',fill:'both'});
    movements.set(element,animation);
    animation.onfinish=()=>{if(movements.get(element)!==animation)return;animation.cancel();finish();};
  }
  function taskFinished(def, state) {
    if(state.__sw_skipped)return true;
    if(def.kind==='stage')return def.exercises.filter(b=>hasTasks(b.exercise)).every(b=>taskFinished(b.exercise,state[b.id]||{}));
    const results=grade(def,state);
    if(['choice','gaps'].includes(def.kind)&&Array.isArray(state.__sw_choice_checked))return def.items.every(item=>
      state.__sw_choice_skipped?.includes(item.id)||(state.__sw_choice_checked.includes(item.id)&&questionKeys(def,item).every(id=>results[id]!=='empty')));
    return state.__sw_checked===true&&Object.values(results).length>0&&!Object.values(results).includes('empty');
  }
  const hasTasks=def=>['choice','gaps','matching','writing','sort','order','image-label'].includes(def.kind)||def.kind==='stage'&&def.exercises.some(b=>hasTasks(b.exercise));
  const questionKeys=(def,item)=>def.kind==='gaps'?item.segments.filter(s=>typeof s!=='string').map(s=>s.id):[item.id];
  function pendingInner(def,state={}){
    if(def.followUp)return (state.__sw_followup_revealed||1)<2;
    if(def.progressiveQuestions&&def.items?.length>1)return (state.__sw_choice_revealed||1)<def.items.length;
    if(def.kind==='stage'&&def.progressive){const count=state.revealed||def.revealStops?.[0]||1;return count<def.exercises.length||def.exercises.slice(0,count).some(b=>pendingInner(b.exercise,state[b.id]||{}));}
    return false;
  }
  // Listening questions reuse the existing progressive stage, while preserving
  // the original flat item IDs for saved answers and realtime synchronization.
  function mountListeningQuestions(host, definition, config) {
    const items=definition.items,blockId=item=>'question-'+item.id;
    let saved=clone(config.answers||{});
    const unpack=value=>{
      const state={revealed:value.__sw_choice_revealed||1};
      for(const item of items){
        const answer={};for(const id of questionKeys(definition,item))if(value[id]!==undefined)answer[id]=clone(value[id]);
        if(value.__sw_checked||value.__sw_choice_checked?.includes(item.id))answer.__sw_checked=true;
        if(value.__sw_skipped||value.__sw_choice_skipped?.includes(item.id))answer.__sw_skipped=true;
        state[blockId(item)]=answer;
      }
      return state;
    };
    const pack=value=>{
      const state={...saved},checked=[],skipped=[];
      delete state.__sw_checked;delete state.__sw_skipped;
      for(const item of items){
        const answer=value[blockId(item)]||{};for(const id of questionKeys(definition,item)){delete state[id];if(answer[id]!==undefined)state[id]=clone(answer[id]);}
        if(answer.__sw_checked)checked.push(item.id);
        if(answer.__sw_skipped)skipped.push(item.id);
      }
      state.__sw_choice_checked=checked;state.__sw_choice_skipped=skipped;
      state.__sw_choice_revealed=value.revealed||1;
      if(checked.length===items.length)state.__sw_checked=true;
      if(skipped.length===items.length)state.__sw_skipped=true;
      return state;
    };
    const stage={version:1,id:definition.id,kind:'stage',title:definition.title,instruction:redundantInstruction(definition)?'':definition.instruction,
      progressive:true,requireCheckBeforeNext:true,exercises:items.map(item=>({id:blockId(item),
        exercise:{...definition,id:definition.id+'-'+item.id,instruction:'',items:[item]}}))};
    const handle=mount(host,stage,{...config,sequentialListening:false,syncChecks:true,itemNumbers:Object.fromEntries(items.map((item,index)=>[item.id,config.itemNumbers?.[item.id]||index+1])),answers:unpack(saved),
      onChange:value=>{saved=pack(value);config.onChange?.(clone(saved));}});
    return {...handle,getAnswers:()=>pack(handle.getAnswers()),setAnswers:value=>{saved=clone(value||{});handle.setAnswers(unpack(saved));}};
  }
  function mount(host, definition, config = {}) {
    definition=templates.resolve(definition);
    validate(definition);
    const profile=definition.templateCode?templates.profileFor(definition.templateCode,definition.kind,definition.templatePart):null;
    const flatControls=profile?profile.flatControls:config.flatControls!==false;
    config={...config,flatControls};
    // A follow-up task or rule uses the existing teacher-controlled sequence, while
    // preserving the original flat response IDs and saved checks.
    if(definition.followUp){
      const taskId=definition.id+'-practice',followId=definition.id+'-followup';
      const task={...definition,id:taskId,instruction:''};delete task.followUp;
      const unpack=value=>{const response=clone(value||{}),revealed=response.__sw_followup_revealed||1;delete response.__sw_followup_revealed;return {revealed,[taskId]:response};};
      const pack=value=>({...clone(value[taskId]||{}),__sw_followup_revealed:value.revealed||1});
      const stage={version:1,id:definition.id,kind:'stage',title:definition.title,instruction:redundantInstruction(definition)?'':definition.instruction,
        progressive:true,requireCheckBeforeNext:true,exercises:[{id:taskId,exercise:task},{id:followId,exercise:{version:1,id:followId,kind:'presentation',...definition.followUp}}]};
      const handle=mount(host,stage,{...config,syncChecks:true,answers:unpack(config.answers),onChange:value=>config.onChange?.(pack(value))});
      return {...handle,getAnswers:()=>pack(handle.getAnswers()),setAnswers:value=>handle.setAnswers(unpack(value))};
    }
    if((definition.progressiveQuestions||config.sequentialListening&&definition.kind==='choice'&&!(flatControls&&definition.layout==='dropdown'))&&!config.showAllQuestions&&['choice','gaps'].includes(definition.kind)&&definition.items.length>1)return mountListeningQuestions(host,definition,config);
    const def = clone(definition);
    if(def.unifiedProgression)config={...config,unifiedProgression:true};
    // Independent tasks reveal in sequence; a reading/audio source stays with its task.
    const taskKinds = new Set(['matching','gaps','choice','image-label','order','sort','writing','rule-page']);
    let stageStops = [];
    if (def.kind === 'stage') {
      if(def.exercises.some(block=>block.exercise.kind==='audio')&&def.exercises.some(block=>block.exercise.kind==='choice'&&block.exercise.items.length>1))def.requireCheckBeforeNext=true;
      if (def.progressive) stageStops = def.revealStops || def.exercises.map((_,i)=>i+1);
      else {
        const tasks = def.exercises.flatMap((block,i)=>taskKinds.has(block.exercise.kind)?[i]:[]);
        if (tasks.length > 1) {
          stageStops = [...tasks.slice(1),def.exercises.length];
          def.progressive = true; def.layout = 'separate';
        }
      }
    }
    const stageCount = value => {const count=Math.max(stageStops[0]||1,Math.min(def.exercises?.length||1,Number(value)||0));return def.revealStops ? (stageStops.find(stop=>stop>=count)||def.exercises.length) : count;};

    if (config.discovery && !def.multiple && def.kind === 'choice' && def.layout !== 'image-grid') def.layout = 'dropdown';
    const normalizeAnswers=value=>{const state=clone(value||{});if(def.kind==='gaps'&&def.layout==='picture-rows')for(const item of def.items)if(state[item.id]&&typeof state[item.id]==='object'){for(const segment of item.segments)if(typeof segment!=='string'&&state[segment.id]===undefined&&state[item.id][segment.id]!==undefined)state[segment.id]=state[item.id][segment.id];delete state[item.id];}return state;};
    let answers = normalizeAnswers(config.answers);
    let feedback = {};
    const doc = host.ownerDocument;
    const modern=!doc.body?.classList.contains('design-preview');
    let syncStage=null, syncTranscript=null, syncRules=null, rulesOpen=null, syncRepeat=null, repeatIndex=0;
    let scrollFrame=null,disposed=false;
    let matchingCleanup=()=>{},equalizeMatching=()=>{},editorCleanup=()=>{};
    // Include adjacent navigation, but never jump across another visible task.
    function rangeEnd(element,scroller){
      let end=element;
      for(let current=element;current&&current!==scroller;current=current.parentElement){
        for(let next=current.nextElementSibling;next;next=next.nextElementSibling){
          if(next.hidden||next.inert||next.matches('.ek-actions,.ek-status,.ek-results')&&!next.textContent.trim())continue;
          if(next.matches('.ek-stage-navigation,.ek-disclosure')){end=next;continue;}
          return end;
        }
      }
      return end;
    }
    // Measure after feedback, parent disclosures and navigation have finished updating.
    const centerSection=(element,last=element,preferEnd=false)=>{
      const view=doc.defaultView;
      if(scrollFrame!==null)view?.cancelAnimationFrame?.(scrollFrame);
      const place=()=>{
        scrollFrame=null;
        if(disposed||!element||element.closest('[hidden],[inert]')||!host.contains(element))return;
        const scroller=host.closest?.('.lesson-scroll');
        const behavior=view?.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'auto':'smooth';
        const tail=rangeEnd(last,scroller);
        if(scroller?.scrollTo&&element.getBoundingClientRect){
          const first=element.getBoundingClientRect(),end=tail.getBoundingClientRect(),viewport=scroller.getBoundingClientRect(),padding=16,bottomPadding=48;
          const utility=doc.getElementById('workspaceUtilityBar')?.getBoundingClientRect();
          const startPadding=Math.max(padding,utility?.height?utility.bottom-viewport.top+14:0);
          const top=first.top-viewport.top,bottom=end.bottom-viewport.top,available=viewport.height-startPadding-bottomPadding;
          let delta=0;
          if(preferEnd&&end.bottom-first.top>available)delta=bottom-viewport.height+bottomPadding;
          else if(end.bottom-first.top>available||top<startPadding)delta=top-startPadding;
          else if(bottom>viewport.height-bottomPadding)delta=bottom-viewport.height+bottomPadding;
          if(delta)scroller.scrollTo({top:Math.max(0,scroller.scrollTop+delta),behavior});
        }else (preferEnd?tail:element).scrollIntoView?.({behavior,block:preferEnd?'end':'start'});
      };
      if(view?.requestAnimationFrame)scrollFrame=view.requestAnimationFrame(place);else place();
    };
    // Opt-in shared disclosures. Existing lessons keep their local disclosure behavior.
    let disclosureState=null;
    const ownDisclosures=()=>[...body.querySelectorAll('details.ek-disclosure'),...resultsBox.querySelectorAll('details.ek-disclosure')].filter(detail=>detail.closest('.exercise-kit')===host);
    const applyDisclosures=(states,animate=false)=>{
      if(!config.syncDisclosures||!Array.isArray(states))return;
      ownDisclosures().forEach((detail,index)=>{
        if(typeof states[index]!=='boolean')return;
        const open=states[index]&&!detail.hidden,summary=detail.querySelector('summary'),content=detail.querySelector('.ek-disclosure-content');
        summary?.setAttribute('aria-expanded',String(open));
        if(open)detail.open=true;
        if(content&&animate)expand(content,open,()=>{detail.open=open;if(open)centerSection(detail);});
        else{detail.open=open;if(content){content.hidden=!open;content.inert=!open;}}
      });
    };
    const getViewState=()=>({...(config.syncDisclosures?{disclosures:ownDisclosures().map(detail=>!detail.hidden&&detail.querySelector('summary')?.getAttribute('aria-expanded')==='true')}:{}),repeat:repeatIndex,revealed:visibleCount,rule:Boolean(answers.__sw_rule_visible),children:Object.fromEntries([...nestedMountsByBlock].map(([id,handle])=>[id,handle.getViewState()]))});
    const viewChanged=()=>{if(config.onViewChange)config.onViewChange(getViewState());else save();};
    const setViewState=(view,animate=true)=>{
      if(!view||typeof view!=='object')return;
      if(def.kind==='stage'&&def.progressive){const count=stageCount(view.revealed);answers.revealed=count;if(count!==visibleCount)syncStage?.(count,animate);}
      if(def.kind==='audio'&&def.layout==='listen-repeat'&&Number.isFinite(view.repeat)){repeatIndex=Math.max(0,Math.floor(view.repeat));syncRepeat?.(animate);}
      if(def.kind==='rule-page'){answers.__sw_rule_visible=Boolean(view.rule);syncRules?.(animate);}
      for(const [id,handle] of nestedMountsByBlock)handle.setViewState(view.children?.[id],animate);
      if(config.syncDisclosures&&Array.isArray(view.disclosures)){disclosureState=view.disclosures;applyDisclosures(disclosureState,animate);}
    };
    let dialog;
    let trigger;
    let closeInline;
    const dismissInline = () => { closeInline?.(); closeInline = null; };
    const onOutside = event => {
      // A fresh press starts a new gesture; only the drag's own trailing click is suppressed.
      suppressDragClick = false;
      if (!event.target.closest?.('.ek-inline-choice')) dismissInline();
    };
    const controls = new Map();
    let visibleCount = 0;
    let draggedId = null;
    let pointerDrag = null, suppressDragClick = false;
    const dragFlights = new Set();
    const dropTargets = new WeakMap();
    let nestedMounts = [];
    const nestedMountsByBlock = new Map();
    const node = (tag, className, text) => {
      const el = doc.createElement(tag);
      if (className) el.className = className;
      if (text != null) el.textContent = text;
      return el;
    };
    // A spelling cue belongs to the unfocused empty field. Remove its native
    // placeholder while editing instead of leaving a transparent placeholder
    // line in the browser's text-control layout. Never change the answer value.
    const placeholderCue = (input, cue) => {
      if(cue)input.setAttribute('placeholder', cue);
      if (config.readOnly) return;
      input.addEventListener('focus', () => {
        if(cue)input.removeAttribute('placeholder');
        // Refresh the native empty selection after the focused editor has laid out.
        // Never move a caret in text the learner has already entered.
        const refresh=()=>{
          if(disposed||doc.activeElement!==input||input.value)return;
          void input.offsetHeight;
          input.setSelectionRange?.(0,0);
        };
        if(doc.defaultView?.requestAnimationFrame)doc.defaultView.requestAnimationFrame(refresh);
        else refresh();
      });
      if(cue)input.addEventListener('blur', () => input.setAttribute('placeholder', cue));
    };
    const responseEditors = new WeakMap();
    const sizeResponseField = input => {
      const spec=responseEditors.get(input);if(!spec?.compact)return;
      const length=Math.max(String(input.value||'').length,String(spec.cue||'').length);
      input.style.width=`${Math.max(6,length+2)}ch`;
      if(!spec.growing)return;
      // A sentence starts as one compact native editor, then wraps at the
      // available row width instead of hiding its beginning in a scrolled input.
      input.style.height='auto';
      if(input.scrollHeight>0){
        const style=doc.defaultView?.getComputedStyle?.(input);
        const border=(parseFloat(style?.borderTopWidth)||0)+(parseFloat(style?.borderBottomWidth)||0);
        input.style.height=Math.ceil(Math.max(parseFloat(style?.minHeight)||0,input.scrollHeight+border))+'px';
      }
    };
    const responseEditor = (value,cue,{compact=false,multiline=false,growing=false}={}) => {
      const input=node(multiline||growing?'textarea':'input','ek-writing-input ek-response-input'+(compact?' ek-compact-input':'')+(growing?' ek-growing-input':''));
      if(multiline||growing)input.rows=growing?1:5;else input.type='text';
      input.value=value||'';responseEditors.set(input,{compact,growing,cue:cue||''});
      placeholderCue(input,cue);sizeResponseField(input);return input;
    };
    const resizeResponseEditors = () => controls.forEach(control=>sizeResponseField(control));
    const watchResponseEditors = () => {
      resizeResponseEditors();
      if(!body.querySelector('.ek-growing-input'))return;
      const view=doc.defaultView;let width=body.getBoundingClientRect().width;
      const resize=()=>resizeResponseEditors();
      const observer=view?.ResizeObserver?new view.ResizeObserver(()=>{const next=body.getBoundingClientRect().width;if(next!==width){width=next;resize();}}):null;
      observer?.observe(body);view?.addEventListener?.('resize',resize);view?.visualViewport?.addEventListener?.('resize',resize);
      editorCleanup=()=>{observer?.disconnect();view?.removeEventListener?.('resize',resize);view?.visualViewport?.removeEventListener?.('resize',resize);};
    };
    const button = (label, handler, className = 'ek-button') => {
      const el = node('button', className, label); el.type = 'button'; el.addEventListener('click', handler); return el;
    };
    const illustration = item => {
      if (item.imagePending && !item.image) {
        const blank = node('div', 'ek-image ek-image-pending'+(['gaps','choice','writing'].includes(def.kind)?' ek-task-image':''));
        blank.setAttribute('aria-label', item.alt || 'Изображение');
        blank.setAttribute('role', 'img');
        if(flatControls)blank.textContent=item.alt||'[Image]';
        return blank;
      }
      if (item.crop) {
        const crop = node('div', 'ek-image ek-crop-image');
        crop.setAttribute('role', 'img');
        crop.setAttribute('aria-label', item.alt || item.text || '');
        crop.style.backgroundImage = `url("${String(item.image).replace(/"/g, '%22')}")`;
        crop.style.backgroundSize = `${10000 / item.crop.w}% ${10000 / item.crop.h}%`;
        const x = item.crop.x / Math.max(0.0001, 100 - item.crop.w) * 100;
        const y = item.crop.y / Math.max(0.0001, 100 - item.crop.h) * 100;
        crop.style.backgroundPosition = `${x}% ${y}%`;
        return crop;
      }
      const image = node('img', 'ek-image'); image.src = item.image; image.alt = item.alt || item.text || ''; image.loading = 'eager'; image.decoding = 'async';
      if(item.imageWidth && item.imageHeight){image.setAttribute('width',String(item.imageWidth));image.setAttribute('height',String(item.imageHeight));image.style.aspectRatio=item.imageWidth+' / '+item.imageHeight;}
      if(['gaps','choice','writing'].includes(def.kind))image.classList.add('ek-task-image');
      return image;
    };
    const croppedArtFrame = (item,picture,className) => {
      const frame=node('div',className),ratio=(item.imageWidth>0&&item.imageHeight>0?item.imageWidth/item.imageHeight:4/3)*item.crop.w/item.crop.h;
      picture.style.setProperty('--ek-crop-art-ratio',String(ratio));frame.append(picture);return frame;
    };
    const formatTime = value => {
      const seconds = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
      return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
    };
    const audioPlayer = (src, label = 'Audio', key='player') => {
      const wrap = node('div', 'ek-audio-player'); wrap.dataset.state = 'paused';
      const audio = node('audio'); audio.preload = src ? 'auto' : 'none'; if(src)audio.src = src; audio.setAttribute('aria-label', label);audio.dataset.ekAudioKey=(config.audioPath||def.id)+':'+key;
      let completed = false;
      const play = button('▶', async () => {
        if (!src || config.audioReadOnly) return;
        if (audio.paused || completed) {
          if (completed) { audio.currentTime = 0; completed = false; sync(); }
          doc.querySelectorAll('.exercise-kit audio').forEach(other => { if (other !== audio && !other.paused) other.pause(); });
          try { await audio.play(); } catch { announce('Audio could not be played.'); sync(); }
        } else audio.pause();
      }, 'ek-audio-play');
      play.setAttribute('aria-label', 'Play audio');
      const track = node('div', 'ek-audio-track');
      // Decorative contour motif; only the colored progress follows actual media time.
      const lobes=[[28,77,5],[77,127,4],[127,176,8],[176,242,5],[242,290,12],[290,348,8],[348,407,18],[407,456,5],[456,505,9],[505,556,6]];
      const contours=[];
      for(const scale of [.16,.3,.44,.58,.72,.86,1])for(const side of [-1,1])contours.push(Array.from({length:601},(_,x)=>{
        const lobe=lobes.find(([start,end])=>x>=start&&x<=end);
        const amplitude=lobe?lobe[2]*Math.sin(Math.PI*(x-lobe[0])/(lobe[1]-lobe[0]))**1.25:0;
        return `${x?'L':'M'}${x},${(20+side*scale*amplitude).toFixed(2)}`;
      }).join(' '));
      for (const layer of ['base', 'fill']) {
        const wave = node('div', `ek-audio-wave ek-audio-wave-${layer}`); wave.setAttribute('aria-hidden', 'true');
        const svg=doc.createElementNS('http://www.w3.org/2000/svg','svg');
        svg.setAttribute('viewBox','0 0 600 40');svg.setAttribute('preserveAspectRatio','none');
        contours.forEach(points=>{const path=doc.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',points);path.setAttribute('vector-effect','non-scaling-stroke');svg.append(path);});
        wave.append(svg);track.append(wave);
      }
      const range = node('input', 'ek-audio-range'); range.type = 'range'; range.min = '0'; range.max = '100'; range.step = '0.1'; range.value = '0'; range.disabled = true; range.setAttribute('aria-label', 'Audio position');
      const time = node('span', 'ek-audio-time', '0:00 / 0:00');
      const sync = () => {
        const duration = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 0;
        const current = Number.isFinite(audio.currentTime) ? Math.max(0, audio.currentTime) : 0;
        const progress = completed ? 100 : duration ? Math.min(100, current / duration * 100) : 0;
        range.value = String(progress); range.disabled = Boolean(config.audioReadOnly)||!duration;
        range.setAttribute('aria-valuetext', `${formatTime(current)} of ${formatTime(duration)}`);
        track.style.setProperty('--audio-progress', `${progress}%`);
        wrap.dataset.state = completed ? 'ended' : audio.paused ? 'paused' : 'playing';
        play.textContent = audio.paused || completed ? '▶' : '❚❚';
        play.setAttribute('aria-label', audio.paused || completed ? 'Play audio' : 'Pause audio');
        time.textContent = `${formatTime(current)} / ${formatTime(duration)}`;
      };
      audio.addEventListener('play', () => { completed = false; sync(); });
      audio.addEventListener('pause', sync);
      audio.addEventListener('ended', () => { completed = true; sync(); });
      audio.addEventListener('loadedmetadata', sync);
      audio.addEventListener('durationchange', sync);
      audio.addEventListener('timeupdate', sync);
      audio.addEventListener('error', () => { audio.pause(); announce('Audio could not be loaded.'); });
      range.addEventListener('input', () => {
        if(config.audioReadOnly)return;
        if (Number.isFinite(audio.duration) && audio.duration > 0) {
          completed = false; audio.currentTime = (Number(range.value) / 100) * audio.duration; sync();
        }
      });
      if(config.audioReadOnly){play.disabled=true;play.title='Воспроизведением управляет преподаватель';}
      if (!src) { play.disabled=true; play.setAttribute('aria-label','Audio pending'); play.title='Audio pending'; wrap.dataset.state='pending'; }
      track.append(range); wrap.append(audio, play, track, time);
      return wrap;
    };
    const repeatAudioButton = (src, label, key) => {
      const wrap = node('span', 'ek-repeat-audio');
      if (!src) {
        const pending = button('▶', () => announce('Audio will be connected to this item when its file is added.'), 'ek-repeat-play ek-audio-pending');
        pending.setAttribute('aria-label', `Audio pending for ${label}`);
        pending.title = 'Audio pending';pending.disabled=true;
        wrap.append(pending);
        return wrap;
      }
      const audio = node('audio'); audio.preload = 'auto'; audio.src = src; audio.setAttribute('aria-label', label);audio.dataset.ekAudioKey=(config.audioPath||def.id)+':'+key;
      const play = button('▶', async event => {
        if(config.audioReadOnly)return;
        host.querySelectorAll('audio').forEach(other => { if (other !== audio && !other.paused) other.pause(); });
        const autoplay=event.detail?.repeatAutoplay===true;
        if (audio.paused||autoplay) {
          if(autoplay)audio.currentTime=0;
          doc.querySelectorAll('.exercise-kit audio').forEach(other => { if (other !== audio && !other.paused) other.pause(); });
          try { await audio.play(); } catch { announce('Audio could not be played.'); }
        } else audio.pause();
      }, 'ek-repeat-play');
      play.setAttribute('aria-label', `Play ${label}`);
      if(config.audioReadOnly){play.disabled=true;play.title='Воспроизведением управляет преподаватель';}
      audio.addEventListener('play', () => { play.textContent = '❚❚'; });
      audio.addEventListener('pause', () => { play.textContent = '▶'; });
      audio.addEventListener('ended', () => { play.textContent = '▶'; });
      wrap.append(audio, play);
      return wrap;
    };
    const announce = message => { status.textContent = message;if(modern)status.hidden=!message; };
    const clearFeedback = () => {
      feedback = {};
      controls.forEach(control => control.removeAttribute('data-feedback'));
      if(def.kind==='choice')body.querySelectorAll('.ek-radio[data-feedback],.ek-radio input[data-feedback]').forEach(control=>{control.removeAttribute('data-feedback');control.removeAttribute('aria-description');});
      if(def.kind==='order'){
        body.querySelectorAll('.ek-order-target [data-feedback]').forEach(token=>{token.removeAttribute('data-feedback');token.removeAttribute('aria-description');});
        body.querySelectorAll('.ek-order-number[data-result]').forEach(badge=>{delete badge.dataset.result;badge.removeAttribute('aria-label');});
      }
      resultsBox.replaceChildren(); announce('');
      if(modern){status.hidden=true;resultsBox.hidden=true;lamps.forEach(lamp=>{delete lamp.dataset.result;lamp.setAttribute('aria-label',lamp.classList.contains('ek-match-answer-number')?matchBadgeLabel(lamp):'Not checked');});}
    };
    const save = () => { delete answers.__sw_skipped;if (config.syncChecks) delete answers.__sw_checked; clearFeedback();updateActions();config.onChange?.(clone(answers)); };
    // Drag actions update the same answers object as keyboard/click actions.
    const layoutSnapshot=()=>new Map([...body.querySelectorAll('[data-ek-drag-id]:not(.ek-drag-source-hidden)')].map(el=>[el.dataset.ekDragId,el.getBoundingClientRect()]));
    const animateLayout=before=>{
      if(doc.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)').matches)return;
      body.querySelectorAll('[data-ek-drag-id]:not(.ek-drag-source-hidden)').forEach(el=>{const old=before.get(el.dataset.ekDragId);if(!old||!el.animate)return;const rect=el.getBoundingClientRect();const x=old.left-rect.left,y=old.top-rect.top;const base=doc.defaultView?.getComputedStyle?.(el).transform;const transform=base&&base!=='none'?base:'';if(Math.abs(x)+Math.abs(y)>1)el.animate([{transform:`translate(${x}px,${y}px) ${transform}`},{transform:transform||'translate(0,0)'}],{duration:190,easing:'cubic-bezier(.22,.7,.25,1)'});});
    };
    const keyboardPlacement=(el,places,current,place)=>{
      el.title='Drag to place; Alt + arrow to change destination';
      el.addEventListener('keydown',event=>{if(config.readOnly||!event.altKey||!['ArrowLeft','ArrowRight'].includes(event.key))return;event.preventDefault();const at=current();place(places[(at+(event.key==='ArrowLeft'?-1:1)+places.length)%places.length]);});
    };
    const draggable = (el, id) => {
      el.dataset.ekDragId=id;
      el.addEventListener('pointerdown', event => {
        suppressDragClick = false;
        if (config.readOnly || (event.button != null && event.button !== 0)) return;
        pointerDrag = {id, el, x:event.clientX, y:event.clientY, pointerId:event.pointerId, moved:false};
      });
      el.draggable = !config.readOnly;
      el.addEventListener('dragstart', event => {
        if (config.readOnly) { event.preventDefault(); return; }
        if (pointerDrag) { event.preventDefault(); return; }
        draggedId = id; event.dataTransfer.setData('text/plain', id); event.dataTransfer.effectAllowed = 'move';
      });
      el.addEventListener('dragend', () => { draggedId = null; });
    };
    const dropzone = (el, accept) => {
      el.classList.add('ek-dropzone'); dropTargets.set(el, accept);
      el.addEventListener('dragover', event => { if (!config.readOnly && draggedId != null) { event.preventDefault(); event.stopPropagation(); event.dataTransfer.dropEffect = 'move'; } });
      el.addEventListener('drop', event => {
        if (config.readOnly || draggedId == null) return;
        event.preventDefault(); event.stopPropagation(); const id = draggedId; draggedId = null; accept(id);
      });
    };
    const pointerTarget = event => doc.elementFromPoint?.(event.clientX,event.clientY)?.closest('.ek-dropzone');
    const pointerMove = event => {
      if (!pointerDrag || event.pointerId !== pointerDrag.pointerId) return;
      const drag=pointerDrag;
      if (!drag.moved && Math.hypot(event.clientX-drag.x,event.clientY-drag.y) < 6) return;
      if(!drag.moved){
        drag.rect=drag.el.getBoundingClientRect();
        drag.ghost=drag.el.cloneNode(true);drag.ghost.removeAttribute('id');drag.ghost.removeAttribute('data-ek-drag-id');
        drag.ghost.classList.add('ek-drag-ghost');drag.ghost.setAttribute('aria-hidden','true');drag.ghost.tabIndex=-1;
        Object.assign(drag.ghost.style,{position:'fixed',left:`${drag.rect.left}px`,top:`${drag.rect.top}px`,width:`${drag.rect.width}px`,height:`${drag.rect.height}px`,margin:'0',pointerEvents:'none',zIndex:'9999'});
        host.append(drag.ghost);dragFlights.add(drag.ghost);
        const before=layoutSnapshot();drag.el.classList.add('ek-dragging','ek-drag-source-hidden');drag.moved=true;animateLayout(before);
      }
      drag.dx=event.clientX-drag.x;drag.dy=event.clientY-drag.y;
      drag.ghost.style.transform=`translate(${drag.dx}px,${drag.dy}px)`;
      if (event.cancelable) event.preventDefault();
      body.querySelectorAll('.ek-drag-over').forEach(el => el.classList.remove('ek-drag-over'));
      const target = pointerTarget(event);
      if (target && dropTargets.has(target)) target.classList.add('ek-drag-over');
      const ordered=target?.closest('.ek-order-target');
      if(ordered){
        const tokens=[...ordered.children].filter(el=>el.dataset.ekDragId&&el!==drag.el);
        const before=tokens.find(el=>{const r=el.getBoundingClientRect();return event.clientY<r.top || (event.clientY<=r.bottom && event.clientX<r.left+r.width/2);})||null;
        if(drag.previewParent!==ordered||drag.before!==before?.dataset.ekDragId){
          const snapshot=layoutSnapshot();drag.placeholder?.remove();
          const placeholder=node('span','ek-drag-placeholder');placeholder.setAttribute('aria-hidden','true');
          Object.assign(placeholder.style,{width:`${drag.rect.width}px`,height:`${drag.rect.height}px`});
          ordered.insertBefore(placeholder,before);drag.placeholder=placeholder;drag.previewParent=ordered;drag.before=before?.dataset.ekDragId;animateLayout(snapshot);
        }
      }else if(drag.placeholder){const snapshot=layoutSnapshot();drag.placeholder.remove();drag.placeholder=null;drag.previewParent=null;drag.before=null;animateLayout(snapshot);}

    };
    const pointerEnd = event => {
      if (!pointerDrag || event.pointerId !== pointerDrag.pointerId) return;
      const drag = pointerDrag; pointerDrag = null;
      body.querySelectorAll('.ek-drag-over').forEach(el => el.classList.remove('ek-drag-over'));
      if (!drag.moved) return;
      suppressDragClick = true;
      const target = event.type==='pointercancel'?null:pointerTarget(event);
      const before=layoutSnapshot();drag.placeholder?.remove();
      const ordered=target?.closest('.ek-order-target');
      if (!config.readOnly && target && dropTargets.has(target)) dropTargets.get(ordered||target)(drag.id,ordered?drag.before:undefined);
      drag.el.classList.remove('ek-drag-source-hidden');
      animateLayout(before);
      const destination=[...body.querySelectorAll('[data-ek-drag-id]')].find(el=>el.dataset.ekDragId===drag.id)||drag.el;
      drag.el.classList.remove('ek-dragging');
      const finish=()=>{destination.classList.remove('ek-dragging');drag.ghost.remove();dragFlights.delete(drag.ghost);};
      const rect=destination.getBoundingClientRect();
      if(!drag.ghost.animate||doc.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)').matches){finish();return;}
      destination.classList.add('ek-dragging');
      const animation=drag.ghost.animate([
        {transform:`translate(${drag.dx}px,${drag.dy}px)`},
        {transform:`translate(${rect.left-drag.rect.left}px,${rect.top-drag.rect.top}px)`}
      ],{duration:190,easing:'cubic-bezier(.22,.7,.25,1)',fill:'forwards'});
      animation.onfinish=finish;animation.oncancel=finish;
    };
    const dragClick = event => {
      if (event.detail === 0) { suppressDragClick = false; return; } // keyboard/programmatic activation
      if (!suppressDragClick) return;
      suppressDragClick = false; event.preventDefault(); event.stopImmediatePropagation();
    };
    const closeDialog = () => { if(dialog?.open)dialog.close(); };
    const onKeydown = event => { if (event.key === 'Escape') { if(dialog?.open)event.preventDefault();closeDialog(); dismissInline(); } };
    const vocabularyMatching = def.kind === 'matching' && ['picture-word','word-translation','word-definition','stacked-text','audio-picture'].includes(def.layout);
    const letteredMatching = vocabularyMatching && !['picture-word','audio-picture'].includes(def.layout);
    const optionLetter = index => {let label='';for(let n=index+1;n>0;n=Math.floor((n-1)/26))label=String.fromCharCode(65+(n-1)%26)+label;return label;};
    const matchBadgeLabel = badge => badge.dataset.number?'Selected option '+badge.dataset.number:badge.closest('.ek-match-slot')?.dataset.selected==='true'?'Selected match; not checked':'No option selected';
    host.classList.add('exercise-kit');host.classList.toggle('ek-modern',modern);
    host.classList.toggle('ek-flat-controls',flatControls);
    host.dataset.templateCode=def.templateCode||'';host.dataset.templatePart=def.templatePart||'';host.dataset.templateRole=def.templateRole||'exercise';
    host.classList.toggle('ek-reading-width', def.kind === 'gaps');
    host.classList.toggle('ek-picture-practice',['gaps','writing'].includes(def.kind)&&def.layout==='picture-rows');
    host.classList.toggle('ek-stage-grouped', def.kind === 'stage' && def.layout === 'grouped');
    host.classList.toggle('ek-stage-compact',def.kind==='stage'&&def.compact===true);
    host.classList.toggle('ek-stage-sequence',def.kind==='stage'&&def.progressive===true);
    host.replaceChildren();
    host.classList.toggle('ek-model-material',hasExampleModels(def));
    if(!config.hideHeading&&!hasSpecificChildHeading(def)&&!isExamplesPresentation(def))host.append(node('h2', config.primaryHeading?'ek-title ek-primary-title':'ek-title', def.title));
    if(def.instruction && !redundantInstruction(def))host.append(node('p', 'ek-instruction', def.instruction));
    const body = node('div', 'ek-body');
    const actions = node('div', 'ek-actions');
    const status = node('p', 'ek-status'); status.setAttribute('role', 'status');
    const resultsBox = node('ul', 'ek-results'); resultsBox.setAttribute('aria-label', 'Feedback');
    host.append(body, actions, status, resultsBox);
    function changed(id, value) {
      answers[id] = value; save(); resultsBox.replaceChildren(); announce('');
    }
    function popover(item, available, selected, onPick, opener, used = new Set()) {
      trigger = opener;
      let fitDialog=()=>{};
      dialog = node('dialog', 'ek-dialog'+(vocabularyMatching?' ek-vocabulary-dialog ek-'+def.layout+'-dialog':''));
      dialog.setAttribute('aria-label', def.title);
      const close=button(modern?'':'Close ×', () => closeDialog(), 'ek-close');close.setAttribute('aria-label','Close');
      dialog.append(close, node('h3', 'ek-title ek-dialog-title', def.title));
      const pictureOnly=def.kind==='matching'&&def.layout==='picture-word'&&(item.image||item.imagePending);
      const prompt = node('div', pictureOnly?'ek-prompt ek-picture-prompt':'ek-prompt'+(vocabularyMatching?' ek-vocabulary-prompt':''));
      if(!pictureOnly)prompt.append(node('span','ek-prompt-text'+(vocabularyMatching?' ek-vocabulary-source':''),item.text));
      prompt.setAttribute('aria-label', 'Phrase to match');
      if (item.image || item.imagePending) {
        const picture=illustration(item),pictureDialog=dialog;
        pictureDialog.classList.add('ek-image-dialog');
        if(pictureOnly)pictureDialog.classList.add('ek-picture-word-dialog');
        const fitPicture=(width,height)=>{
          const ratio=width>0&&height>0 ? width/height*(item.crop?item.crop.w/item.crop.h:1) : 4/5;
          if(!pictureOnly)pictureDialog.style.setProperty('--ek-picture-dialog-width',Math.min(440,320*ratio+40)+'px');
          pictureDialog.style.setProperty('--ek-dialog-image-ratio',String(ratio));
          if(pictureDialog.open)fitDialog();
        };
        fitPicture(item.imageWidth,item.imageHeight);
        if(picture.tagName==='IMG'){
          const fitLoaded=()=>fitPicture(picture.naturalWidth||item.imageWidth,picture.naturalHeight||item.imageHeight);
          picture.addEventListener('load',fitLoaded,{once:true});
          if(picture.complete&&picture.naturalWidth)fitLoaded();
        }
        if(pictureOnly){const frame=node('div','ek-dialog-picture-frame');frame.append(picture);prompt.prepend(frame);}
        else prompt.prepend(picture);
      }
      dialog.append(prompt);
      const choices = node('div', 'ek-options'+(letteredMatching?' ek-vocabulary-options':''));
      available.forEach((option,index) => {
        const choice = button(letteredMatching||def.layout==='audio-picture'?'':option.text, () => { onPick(option.id); closeDialog(); }, 'ek-option'+(letteredMatching?' ek-vocabulary-option':''));
        if(letteredMatching){
          const letter=optionLetter(index),number=node('span','ek-option-number');number.append(node('span','ek-number-label',letter));number.setAttribute('aria-hidden','true');
          choice.append(number,node('span','ek-option-label',option.text));choice.setAttribute('aria-label',`${letter}: ${option.text}`);
        }
        if (option.image || option.imagePending) choice.prepend(illustration(option));
        if(def.layout==='audio-picture')choice.setAttribute('aria-label',option.text);
        choice.setAttribute('aria-pressed', String(selected === option.id));
        if (used.has(option.id) && selected !== option.id) {
          choice.classList.add('ek-option-used');
          choice.title = 'Already used — click to move it here';
        }
        choices.append(choice);
      });
      dialog.append(choices);
      if (selected) { const reset=button('', () => { onPick(''); closeDialog(); }, 'ek-button ek-reset ek-selection-reset'); const icon=actions.querySelector('.ek-reset svg');if(icon)reset.append(icon.cloneNode(true));reset.setAttribute('aria-label','Clear selection'); reset.title='Clear selection'; dialog.append(reset); }
      const currentDialog = dialog;
      const currentTrigger = trigger;
      const view=doc.defaultView;
      let beganOutside=false;
      const isOutside=event=>{
        const box=currentDialog.getBoundingClientRect();
        return event.target===currentDialog && Number.isFinite(event.clientX) && Number.isFinite(event.clientY) &&
          (event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom);
      };
      currentDialog.addEventListener('pointerdown',event=>{beganOutside=isOutside(event);});
      currentDialog.addEventListener('pointercancel',()=>{beganOutside=false;});
      currentDialog.addEventListener('click',event=>{const dismiss=beganOutside&&isOutside(event);beganOutside=false;if(dismiss)closeDialog();});
      fitDialog=()=>{
        if(!currentDialog.open)return;
        const viewport=view?.visualViewport,w=viewport?.width||view?.innerWidth||1024,h=viewport?.height||view?.innerHeight||768;
        const limit=Math.max(120,h-24);
        currentDialog.style.maxHeight=limit+'px';currentDialog.style.maxWidth=Math.max(120,w-24)+'px';
        currentDialog.classList.remove('ek-dialog-compact');
        if(def.layout==='audio-picture'){
          const rows=Math.ceil(available.length/2),reserved=currentDialog.scrollHeight-choices.getBoundingClientRect().height;
          const room=(limit-reserved-Math.max(0,rows-1)*12)/Math.max(1,rows)-42;
          currentDialog.style.setProperty('--ek-audio-option-image-height',Math.max(32,Math.min(130,room))+'px');
        }
        const picture=prompt.querySelector('.ek-image');
        if(picture){
          const ratio=Number(currentDialog.style.getPropertyValue('--ek-dialog-image-ratio'))||.8;
          const frame=prompt.querySelector('.ek-dialog-picture-frame');
          if(frame){
            prompt.style.width='100%';
            const preferred=parseFloat(view?.getComputedStyle?.(currentDialog)?.getPropertyValue('--sw-picture-word-dialog-height'))||330;
            const resizePicture=height=>{
              const fitted=Math.max(0,height);currentDialog.style.setProperty('--ek-picture-dialog-height',fitted+'px');frame.style.height=fitted+'px';
              const style=view?.getComputedStyle?.(frame),left=parseFloat(style?.paddingLeft)||0,right=parseFloat(style?.paddingRight)||0,top=parseFloat(style?.paddingTop)||0,bottom=parseFloat(style?.paddingBottom)||0;
              const width=frame.getBoundingClientRect().width||prompt.getBoundingClientRect().width;
              const innerWidth=Math.max(0,width-left-right),innerHeight=Math.max(0,fitted-top-bottom);
              picture.style.minWidth='0';picture.style.minHeight='0';
              picture.style.width=innerWidth>0?innerWidth+'px':'100%';picture.style.height=innerHeight+'px';
              // A percentage background crop must retain its own aspect ratio;
              // only the surrounding frame has the common dialog dimensions.
              if(picture.classList.contains('ek-crop-image')){
                if(innerWidth>0){const artWidth=Math.min(innerWidth,innerHeight*ratio);picture.style.width=artWidth+'px';picture.style.height=artWidth/ratio+'px';}
              }
            };
            resizePicture(preferred);
            const budget=()=>limit-(currentDialog.scrollHeight-frame.getBoundingClientRect().height)-2;
            if(budget()<100)currentDialog.classList.add('ek-dialog-compact');
            const room=budget();if(Number.isFinite(room))resizePicture(Math.min(preferred,Math.max(0,room)));
          }else{
            picture.style.width='100%';
            const budget=()=>limit-(currentDialog.scrollHeight-picture.getBoundingClientRect().height)-2;
            if(budget()<100)currentDialog.classList.add('ek-dialog-compact');
            const room=budget(),width=prompt.getBoundingClientRect().width;
            if(Number.isFinite(room)&&width>0)picture.style.width=Math.min(width,Math.max(24,room)*ratio)+'px';
          }
        }
        const box=currentDialog.getBoundingClientRect();
        currentDialog.style.left=((viewport?.offsetLeft||0)+(w-box.width)/2)+'px';
        currentDialog.style.top=((viewport?.offsetTop||0)+Math.max(12,(h-box.height)/2))+'px';
      };
      dialog.addEventListener('close', () => {
        view?.removeEventListener?.('resize',fitDialog);view?.visualViewport?.removeEventListener('resize',fitDialog);view?.visualViewport?.removeEventListener('scroll',fitDialog);
        currentDialog.remove();
        const replacement = [...body.querySelectorAll('button')].find(button => button.getAttribute('aria-label') === currentTrigger.getAttribute('aria-label'));
        if (host.isConnected) (currentTrigger.isConnected ? currentTrigger : replacement)?.focus();
      }, { once: true });
      host.append(dialog); dialog.showModal();fitDialog();
      view?.addEventListener?.('resize',fitDialog);view?.visualViewport?.addEventListener('resize',fitDialog);view?.visualViewport?.addEventListener('scroll',fitDialog);
    }
    function ruleHighlightTone(value) {
      const text=value.replace(/’/g,"'").replace(/\s+/g,' ').trim();
      if(/^had(?:\s*\/\s*hadn't)?\s*\+\s*V3$/i.test(text)||/^hadn't\s*\+\s*V3$/i.test(text))return 'condition';
      if(/^would(?:\s*\/\s*wouldn't)?\s+have\s*\+\s*V3$/i.test(text)||/^wouldn't\s+have\s*\+\s*V3$/i.test(text)||/^would(?:\s*\/\s*wouldn't)?\s*\+\s*base verb$/i.test(text))return 'result';
      return 'term';
    }
    function richText(value, highlights = [], emphasis = [], rule = false) {
      const el = node('p', 'ek-copy');
      const pieces = [...highlights.map(text => ({text,tag:'strong'})), ...emphasis.map(text => ({text,tag:'em'}))];
      if(rule){
        // Only exact grammatical labels/formula fragments receive automatic marks.
        // Ordinary uses of if/had/would and all learner answers stay untouched.
        const labels=/\b(?:if|result)[-\u2011 ]part\b/gi;
        const forms=/\bhad(?:\s*\/\s*hadn['’]t)?\s*\+\s*V3\b|\bhadn['’]t\s*\+\s*V3\b|\bwould(?:\s*\/\s*wouldn['’]t)?\s+have\s*\+\s*V3\b|\bwouldn['’]t\s+have\s*\+\s*V3\b|\bwould(?:\s*\/\s*wouldn['’]t)?\s*\+\s*base verb\b/gi;
        for(const match of value.matchAll(labels))pieces.push({text:match[0],tag:'span',start:match.index});
        for(const match of value.matchAll(forms))pieces.push({text:match[0],tag:'strong',start:match.index});
      }
      const ordered=pieces.filter(part => typeof part.text === 'string' && part.text.length).sort((a,b) => b.text.length - a.text.length);
      let cursor = 0;
      let rest = value;
      while (rest) {
        let at = -1, match;
        for (const part of ordered) { const i = part.start==null?rest.indexOf(part.text):part.start<cursor?-1:part.start-cursor; if (i >= 0 && (at < 0 || i < at)) { at = i; match = part; } }
        if (at < 0) { el.append(doc.createTextNode(rest)); break; }
        const className=rule&&match.tag!=='em'?'ek-rule-highlight ek-rule-highlight--'+ruleHighlightTone(match.text):'';
        el.append(doc.createTextNode(rest.slice(0, at)), node(match.tag, className, match.text)); cursor += at + match.text.length; rest = value.slice(cursor);
      }
      return el;
    }
    function exampleModels(block,label=false){
      const models=node('div','ek-example-group');models.setAttribute('role','group');models.setAttribute('aria-label','Examples');
      if(label)models.append(node('p','ek-examples-label','Examples:'));
      block.text.split(/\r?\n+/).filter(text=>text.trim()).forEach((text,index)=>{
        const model=node('p','ek-copy ek-example-model'),copy=node('span','ek-example-text');
        copy.append(...richText(text,block.highlights,block.emphasis).childNodes);
        model.append(node('span','ek-example-number',`${index+1}.`),copy);models.append(model);
      });
      return models;
    }
    const paintControls=new Map();
    function inlinePicker(id,label,options,number){
      const wrap = node('span', 'ek-inline-choice');
      const menu = node('span', 'ek-inline-menu'); menu.hidden = true;
      menu.setAttribute('role', 'group'); menu.setAttribute('aria-label', `Options for ${label}`);
      const badge=node('span','ek-gap-number','');badge.dataset.number='';
      const paint = () => {
        const selectedText=options.find(option=>option.id===answers[id])?.text || '\u00a0';
        opener.replaceChildren(badge,flatControls?node('span','ek-choice-label',selectedText):doc.createTextNode(selectedText));
        opener.setAttribute('aria-label', `${label}: ${options.find(option=>option.id===answers[id])?.text || 'choose an answer'}`);
        opener.dataset.selected = String(Boolean(answers[id]));
        menu.querySelectorAll('[data-option-value]').forEach(option => option.setAttribute('aria-pressed', String(option.dataset.optionValue === answers[id])));
      };
      const view=doc.defaultView;
      const placeMenu=()=>{
        if(menu.hidden)return;
        const rect=opener.getBoundingClientRect(),v=view?.visualViewport;
        const x=v?.offsetLeft||0,y=v?.offsetTop||0,w=v?.width||view?.innerWidth||1024,h=v?.height||view?.innerHeight||768;
        const utility=doc.getElementById('workspaceUtilityBar')?.getBoundingClientRect();
        const top=Math.max(y+8,utility?.bottom?utility.bottom+8:y+8),bottom=y+h-12;
        menu.style.maxWidth=Math.max(80,w-24)+'px';menu.style.maxHeight=Math.max(40,bottom-top)+'px';
        const box=menu.getBoundingClientRect(),below=Math.max(0,bottom-rect.bottom-7),above=Math.max(0,rect.top-top-7);
        const upward=box.height>below&&above>below,room=upward?above:below;
        menu.style.maxHeight=Math.max(40,room)+'px';
        menu.style.left=Math.max(x+12,Math.min(rect.left,x+w-box.width-12))+'px';
        menu.style.top=Math.max(top,Math.min(upward?rect.top-Math.min(box.height,Math.max(40,room))-7:rect.bottom+7,bottom-Math.min(box.height,Math.max(40,room))))+'px';
      };
      const shut = () => {
        if(!menu.hidden)menu.hidePopover?.();
        menu.hidden=true;opener.setAttribute('aria-expanded','false');
        view?.removeEventListener?.('resize',placeMenu);doc.removeEventListener('scroll',placeMenu,true);
        view?.visualViewport?.removeEventListener('resize',placeMenu);view?.visualViewport?.removeEventListener('scroll',placeMenu);
      };
      menu.setAttribute('popover','manual');
      menu.classList.add('ek-floating-menu');
      const opener = button('', () => {
        if (opener.getAttribute('aria-expanded')==='true') { dismissInline(); return; }
        dismissInline(); menu.hidden=false;opener.setAttribute('aria-expanded','true');
        closeInline = shut;
        menu.showPopover?.();placeMenu();
        view?.addEventListener?.('resize',placeMenu);doc.addEventListener('scroll',placeMenu,true);
        view?.visualViewport?.addEventListener('resize',placeMenu);view?.visualViewport?.addEventListener('scroll',placeMenu);
        menu.querySelector('button')?.focus({preventScroll:true});
      }, 'ek-gap ek-choice-trigger ek-compact-choice');
      opener.setAttribute('aria-expanded', 'false');
      options.forEach((entry, optionIndex) => {
        const value=entry.id;
        const option = button('', () => { changed(id, value); paint(); dismissInline(); opener.focus(); }, 'ek-inline-option');
        option.dataset.optionValue = value;
        if(!modern)option.append(node('span', 'ek-gap-number', String(optionIndex + 1)));option.append(doc.createTextNode(entry.text));
        menu.append(option);
      });
      menu.append(button('Clear', () => { changed(id, ''); paint(); dismissInline(); opener.focus(); }, 'ek-inline-option ek-inline-clear'));
      wrap.addEventListener('keydown', event => {
        if (event.key === 'Escape') { event.stopPropagation(); dismissInline(); opener.focus(); }
        if (['ArrowDown', 'ArrowUp'].includes(event.key)) {
          event.preventDefault();
          if (menu.hidden) opener.click();
          else { const buttons = [...menu.querySelectorAll('button')]; const i = buttons.indexOf(doc.activeElement); buttons[(i + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length].focus(); }
        }
      });
      wrap.addEventListener('focusout', event => { if (event.relatedTarget && !wrap.contains(event.relatedTarget)) dismissInline(); });
      paintControls.set(id,paint);paint(); wrap.append(opener, menu); return {wrap,opener};
    }
    function pictureCues(items) {
      const track=node('div','ek-picture-correction-track ek-picture-cues');
      track.setAttribute('aria-label','Numbered pictures');track.tabIndex=0;
      items.forEach((item,index)=>{
        const card=node('figure','ek-picture-correction-card ek-picture-cue-card');
        const pictures=node('div','ek-picture-cue-images');
        for(let i=0;i<(item.imageCopies||1);i++)pictures.append(illustration(item));
        card.append(pictures,node('figcaption','ek-picture-cue-number',String(itemNumber(item))));
        card.setAttribute('aria-label','Picture '+itemNumber(item));track.append(card);
      });
      return track;
    }
    function render() {
      dismissInline();
      matchingCleanup();matchingCleanup=()=>{};equalizeMatching=()=>{};
      editorCleanup();editorCleanup=()=>{};
      nestedMounts.forEach(instance => instance.destroy()); nestedMounts = []; nestedMountsByBlock.clear();
      body.querySelectorAll('audio').forEach(audio => audio.pause());
      body.replaceChildren(); controls.clear(); paintControls.clear(); resultsBox.replaceChildren();
      if (isSpeaking(def)) {
        const picture = node('div', 'ek-speaking-image');
        if (def.image?.image) picture.append(illustration(def.image));
        else if(def.catalogFamily==='S'&&def.image?.imagePending){picture.append(node('div','ek-template-image','[Image]'));}
        else picture.hidden = true;
        const task = def.task ? node('div', 'ek-speaking-task') : null;
        if(task)task.append(node('p', 'ek-copy', def.task.text));
        if (def.task?.bullets?.length) {
          const list = node('ul', 'ek-speaking-bullets');
          def.task.bullets.forEach(text => list.append(node('li', '', text)));
          task.append(list);
        }
        const use = node('div', 'ek-speaking-use');
        use.append(node('strong', 'ek-speaking-use-title', 'Use:'));
        def.use.forEach(group => {
          const content = node('div', 'ek-speaking-group');
          if (group.words?.length) content.append(node('p', 'ek-copy ek-speaking-words', group.words.join(' · ')));
          if (group.phrases?.length) content.append(node('p', 'ek-copy ek-speaking-phrases', group.phrases.join('\n')));
          use.append(content);
        });
        if(def.arrangement==='image-support'){
          const row=node('div','ek-speaking-aside'),support=node('div','ek-speaking-support');
          if(task)support.append(task);
          support.append(use);row.append(picture,support);body.append(row);
        }else body.append(picture, task, use);
      } else if (def.kind === 'presentation') {
        const renderBlock=block=>{
          if(block.type==='image')return illustration(block);
          if(block.type==='disclosure'){
            const detail=node('details','ek-disclosure');
            const title=isPossibleAnswersBlock(block)?POSSIBLE_ANSWERS_TITLE:/useful language/i.test(block.title)?'Use phrases':block.title;
            detail.open=!isPossibleAnswersBlock(block)&&(block.open===true||(block.open!==false&&['useful language','useful phrases','use phrases'].includes(normalize(block.title))));
            detail.append(node('summary','',title),node('p','ek-copy',block.text));return detail;
          }
          return block.role==='examples'?exampleModels(block,isExamplesPresentation(def)):richText(block.text,block.highlights,block.emphasis);
        };
        def.blocks.forEach((block,index)=>{
          const content=renderBlock(block);
          if(def.templateRole!=='speaking'){body.append(content);return;}
          const support=block.type==='disclosure'&&/^(?:useful (?:phrases|language)|use phrases|words|optional help|опора(?:\s|:|$))/i.test(block.title)||block.type==='text'&&/^\s*words to help\s*:/i.test(block.text);
          const role=block.type==='image'?'image':isPossibleAnswersBlock(block)?'supplement':support?'use':block.type==='text'?'task':'supplement';
          const shell=node('div','ek-speaking-'+role+' ek-speaking-legacy-block');shell.dataset.speakingSourceIndex=String(index);
          if(role==='use'){
            content.querySelector('summary')?.classList.add('ek-speaking-use-title');
            for(const paragraph of content.matches('.ek-copy')?[content]:content.querySelectorAll('.ek-copy'))paragraph.classList.add('ek-speaking-group');
          }
          shell.append(content);body.append(shell);
        });
      }
      if (def.kind === 'stage') {
        const stack = node('div', 'ek-stage-stack');
        const transcript = def.transcript ? node('details', 'ek-disclosure') : null;
        if(transcript)transcript.append(node('summary','',def.transcriptTitle||'See the script'),node('p','ek-copy',def.transcript));
        syncTranscript=()=>{
          if(!transcript)return;
          const complete=def.transcriptGate ? Boolean(config.isMilestoneAttempted?.(def.transcriptGate)) : def.transcriptAfter.every(id=>{
            const block=def.exercises.find(block=>block.id===id),state=answers[id]||{};
            const results=Object.values(grade(block.exercise,state));
            return state.__sw_checked===true && results.length>0 && results.every(result=>result!=='empty');
          });
          transcript.hidden=!complete;
          if(!complete){transcript.open=false;transcript.querySelector('summary').setAttribute('aria-expanded','false');const content=transcript.querySelector('.ek-disclosure-content');if(content)content.hidden=true;}
        };
        visibleCount = def.progressive ? stageCount(answers.revealed) : def.exercises.length;
        const reveal = () => {
          const index = nestedMounts.length;
          const block = def.exercises[index];
          const section = node('section', 'ek-stage-section'); section.setAttribute('aria-label', `Exercise ${index + 1}`);
          if(hasExampleModels(block.exercise))section.classList.add('ek-stage-models');
          if(index>0&&hasExampleModels(def.exercises[index-1].exercise))section.classList.add('ek-stage-model-questions');
          if(def.progressive&&index>0&&!stageStops.includes(index))section.classList.add('ek-stage-linked');
          const child = node('div', 'ek-stage-host'); section.append(child); stack.append(section);
          // Source media and lead-ins are materials, not separately skippable tasks.
          const onSkip=!config.allowMaterialSkip&&['presentation','audio'].includes(block.exercise.kind)?undefined:()=>{if(config.independentSteps&&index!==visibleCount-1)return;const next=stageStops.find(stop=>stop>visibleCount);if(next){answers.revealed=next;syncStage(next,true);viewChanged();}else config.onSkip?.();};
          const handle = mount(child, block.exercise, { flatControls, hidePrompt:flatControls&&block.exercise.items?.length===1&&[def.title,def.instruction].some(copy=>sameTaskCopy(copy,block.exercise.items[0].prompt)), unifiedProgression:config.unifiedProgression,repeatAll:config.repeatAll,allowMaterialSkip:config.allowMaterialSkip,independentSteps:config.independentSteps,primaryHeading:Boolean(config.primaryHeading||hasSpecificChildHeading(def)),hideHeading:hiddenChildHeading(def,block.exercise,index)||(config.independentSteps&&block.exercise.kind==='rule-page'&&block.exercise.blocks?.[0]?.title===block.exercise.title), itemNumbers:config.itemNumbers,sequentialListening:!config.independentSteps&&def.exercises.slice(0,index).some(source=>source.exercise.kind==='audio'), audioPath:(config.audioPath||def.id)+':'+block.id,onSkip,syncDisclosures:Boolean(config.syncDisclosures),syncChecks: Boolean(config.syncChecks || def.transcriptAfter || def.requireCheckBeforeNext), readOnly: Boolean(config.readOnly), audioReadOnly:Boolean(config.audioReadOnly), navigationReadOnly:Boolean(config.navigationReadOnly), onViewChange:(config.onViewChange||config.unifiedProgression)?()=>{if(config.unifiedProgression)updateNavigation();viewChanged();}:undefined, answers: answers[block.id] || {}, onChange: value => { answers[block.id] = value; save(); syncTranscript?.(); if(def.requireCheckBeforeNext)updateNavigation(); } });
          nestedMounts.push(handle); nestedMountsByBlock.set(block.id, handle);
          return section;
        };
        const navigation = node('div', 'ek-stage-navigation');
        const updateNavigation = focusDirection => {
          navigation.replaceChildren();
          const addControl = (direction, label, handler) => {
            const control = button('', handler, `ek-button ek-stage-toggle ek-stage-${direction}`);
            control.setAttribute('aria-label', label); control.title = label;
            control.disabled = Boolean(config.readOnly||config.navigationReadOnly);
            const chevron = node('span', 'ek-stage-chevron'); chevron.setAttribute('aria-hidden', 'true');
            control.append(chevron); navigation.append(control);
            return control;
          };
          let down, up;
          if (visibleCount < def.exercises.length) down = addControl('down', 'Show next exercise', () => {
            if (config.readOnly||config.navigationReadOnly) return;
            answers.revealed=stageStops.find(stop=>stop>visibleCount)||def.exercises.length;syncStage(answers.revealed,true);updateNavigation('down');viewChanged();
          });
          if(down && def.requireCheckBeforeNext){
            const candidates=config.independentSteps?def.exercises.slice(visibleCount-1,visibleCount):def.exercises.slice(0,visibleCount);
            const tasks=candidates.filter(block=>['matching','gaps','choice','image-label','order','sort','writing'].includes(block.exercise.kind)||(config.unifiedProgression&&hasTasks(block.exercise)));
            down.disabled=Boolean(config.readOnly||config.navigationReadOnly)||tasks.some(block=>!taskFinished(block.exercise,answers[block.id]||{}));
          }
          if (visibleCount > stageStops[0]) up = addControl('up', 'Свернуть задание', () => {
            if (config.readOnly||config.navigationReadOnly) return;
            answers.revealed=[...stageStops].reverse().find(stop=>stop<visibleCount)||stageStops[0];syncStage(answers.revealed,true);updateNavigation('up');viewChanged();
          });
          if(config.unifiedProgression){
            const last=def.exercises[visibleCount-1];const state=nestedMountsByBlock.get(last.id)?.getAnswers()||answers[last.id]||{};
            navigation.hidden=Boolean(config.navigationReadOnly)||pendingInner(last.exercise,state);
          }
          if (focusDirection) (focusDirection === 'up' ? up || down : down || up)?.focus({preventScroll:true});
        };
        syncStage=(count,animate=true)=>{
          while(nestedMounts.length<count){const section=reveal();section.hidden=true;}
          const previousCount=visibleCount;visibleCount=count;
          const lastTask=def.exercises.slice(0,count).map((block,index)=>taskKinds.has(block.exercise.kind)?index:-1).filter(index=>index>=0).pop();
          const focusIndex=count>previousCount?previousCount:(lastTask??count-1);
          [...stack.children].forEach((section,index)=>{
            const open=index<count;
            if(!open)section.querySelectorAll('audio,video').forEach(media=>media.pause());
            if(section.hidden===open||Boolean(section.inert)===open){
              const lastChanged=index===(count>previousCount?count-1:previousCount-1);
              if(animate)expand(section,open,lastChanged?()=>centerSection(stack.children[focusIndex],navigation.hidden?stack.children[count-1]:navigation):undefined);else{section.hidden=!open;section.inert=!open;}
            }
          });
          updateNavigation();return stack.children[count-1];
        };
        while (nestedMounts.length < visibleCount) reveal();
        body.append(stack);
        if (def.progressive) { body.append(navigation); updateNavigation();if(!config.unifiedProgression)navigation.hidden=Boolean(config.navigationReadOnly); }
        if(transcript){body.append(transcript);syncTranscript();}
      }
      if (def.kind === 'rule-page') {
        const page = node('div', 'ek-rule-page'+(!def.blocks.some(block=>block.type==='exercise')?' ek-rule-summary':''));
        const revealable=[]; let afterExercise=false;
        def.blocks.forEach((block, index) => {
          if (block.type === 'text') {
            const section = node('section', 'ek-rule-section ek-rule-text-section');
            if (block.title) section.append(node('h3', 'ek-rule-section-title', block.title));
            section.append(block.role==='examples'?exampleModels(block):richText(block.text, block.highlights, [], true));
            if(afterExercise)revealable.push(section);page.append(section);
          }
          if (block.type === 'rule') {
            const possibleAnswers = isPossibleAnswersBlock(block);
            const section = possibleAnswers
              ? node('details', 'ek-disclosure')
              : node('section', 'ek-rule-section ek-rule-block');
            if (possibleAnswers) section.append(node('summary', '', POSSIBLE_ANSWERS_TITLE));
            else if (block.title) section.append(node('h3', 'ek-rule-section-title', block.title));
            if (block.text) section.append(richText(block.text, block.highlights, [], true));
            if (block.formula) {const formula=node('div','ek-rule-formula');formula.append(...richText(block.formula,block.highlights||[],[],true).childNodes);section.append(formula);}
            if (block.examples?.length) {
              const examples = node('div', 'ek-rule-examples');
              block.examples.forEach(example => {const line=richText(example,block.highlights||[]);line.classList.add('ek-rule-example');examples.append(line);});
              section.append(examples);
            }
            if(afterExercise && !possibleAnswers) revealable.push(section);
            page.append(section);
          }
          if (block.type === 'image') {
            const figure = node('figure', 'ek-rule-visual');
            figure.append(illustration(block));
            if (block.caption) figure.append(node('figcaption', 'ek-muted', block.caption));
            if(afterExercise)revealable.push(figure);page.append(figure);
          }
          if (block.type === 'exercise') {
            const isFollowing=afterExercise;afterExercise=true;
            const section = node('section', 'ek-discovery-block');
            if(isFollowing)revealable.push(section);
            const child = node('div', 'ek-discovery-host');
            section.append(child);
            page.append(section);
            const handle = mount(child, block.exercise, {
              flatControls,
              discovery: true,
              hideHeading:hiddenChildHeading(def,block.exercise),
              itemNumbers:config.itemNumbers,
              audioPath:(config.audioPath||def.id)+':'+block.id,
              onSkip:()=>{if(revealable.length&&!answers.__sw_rule_visible){answers.__sw_rule_visible=true;syncRules?.(true);viewChanged();}else config.onSkip?.();},
              navigationReadOnly:Boolean(config.navigationReadOnly),
              onViewChange:config.onViewChange?viewChanged:undefined,
              syncDisclosures:Boolean(config.syncDisclosures),
              syncChecks: Boolean(config.syncChecks),
              readOnly: Boolean(config.readOnly), audioReadOnly:Boolean(config.audioReadOnly),
              answers: answers[block.id] || {},
              onChange: value => {
                answers[block.id] = value;
                save();
              }
            });
            nestedMounts.push(handle);
            nestedMountsByBlock.set(block.id, handle);
          }
        });
        body.append(page);
        syncRules=null;
        if(revealable.length){
          const navigation=node('div','ek-stage-navigation');
          const toggle=button('',()=>{if(config.readOnly||config.navigationReadOnly)return;answers.__sw_rule_visible=!answers.__sw_rule_visible;syncRules(true);viewChanged();},'ek-button ek-stage-toggle ek-stage-down');
          const arrow=node('span','ek-stage-chevron');arrow.setAttribute('aria-hidden','true');toggle.append(arrow);
          navigation.hidden=Boolean(config.navigationReadOnly);toggle.disabled=Boolean(config.readOnly||config.navigationReadOnly);navigation.append(toggle);revealable[0].before(navigation);
          syncRules=(animate=false)=>{
            const open=Boolean(answers.__sw_rule_visible),changed=rulesOpen!==null&&rulesOpen!==open;rulesOpen=open;
            revealable.forEach((section,index)=>{if(animate&&changed)expand(section,open,index===revealable.length-1?()=>centerSection(open?revealable[0]:page.querySelector('.ek-discovery-block'),open?revealable[revealable.length-1]:page.querySelector('.ek-discovery-block')):undefined);else if(!animate){section.hidden=!open;section.inert=!open;}});
            toggle.classList.toggle('ek-stage-up',open);toggle.classList.toggle('ek-stage-down',!open);toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Свернуть следующий блок':'Далее');toggle.title=open?'Свернуть следующий блок':'Далее';
          };
          syncRules();
        }
      }
      if (def.kind === 'audio') {
        if (def.layout === 'listen-repeat') {
          const list=node('div','ek-repeat-list'),navigation=node('div','ek-stage-navigation');
          const steps=def.items.flatMap(item=>[{text:item.text,audio:item.audio,key:item.id+':word'},...(item.example?[{text:item.example,audio:item.exampleAudio,key:item.id+':example'}]:[])]);
          const rows=steps.map(step=>{
            const row=node('article','ek-repeat-item');
            row.append(repeatAudioButton(step.audio,step.text,step.key),node('span','ek-repeat-line',step.text));
            row.hidden=true;row.inert=true;list.append(row);return row;
          });
          let previousIndex=null;
          syncRepeat=(animate=false)=>{
            repeatIndex=config.repeatAll?steps.length-1:Math.min(steps.length-1,Math.max(0,repeatIndex));
            if(previousIndex===repeatIndex)return;
            rows.forEach((row,index)=>{
              const hidden=index>repeatIndex;
              if(hidden&&!row.hidden)row.querySelectorAll('audio').forEach(audio=>audio.pause());
              row.hidden=hidden;row.inert=hidden;
            });
            navigation.replaceChildren();
            const control=(direction,index,label)=>{const b=button('',()=>{
              if(config.readOnly||config.navigationReadOnly)return;
              repeatIndex=index;syncRepeat(true);viewChanged();
              // Use the same Play event path as a manual click so live audio transport
              // broadcasts one teacher command. Remote view hydration never autoplays.
              if(direction==='down'&&!config.audioReadOnly){
                const play=rows[index].querySelector('.ek-repeat-play');
                if(play&&!play.disabled)play.dispatchEvent(new doc.defaultView.CustomEvent('click',{bubbles:true,cancelable:true,detail:{repeatAutoplay:true}}));
              }
            },'ek-button ek-stage-toggle ek-stage-'+direction);b.setAttribute('aria-label',label);const arrow=node('span','ek-stage-chevron');arrow.setAttribute('aria-hidden','true');b.append(arrow);b.hidden=Boolean(config.navigationReadOnly);navigation.append(b);};
            if(repeatIndex<steps.length-1)control('down',repeatIndex+1,'Next phrase');
            if(repeatIndex>0)control('up',repeatIndex-1,'Previous phrase');
            navigation.hidden=Boolean(config.navigationReadOnly||config.repeatAll);
            if(animate&&previousIndex!==null)centerSection(rows[repeatIndex],navigation.hidden?rows[repeatIndex]:navigation);
            previousIndex=repeatIndex;
          };
          body.append(list,navigation);syncRepeat();
        } else {
          body.append(audioPlayer(def.audio, def.title));
        }
        if (def.transcript) {
          const script = node('details', 'ek-disclosure');
          script.append(node('summary', '', 'See the script'), node('p', 'ek-copy', def.transcript)); body.append(script);
        }
      }
      if (def.kind === 'matching') {
        const pictureWord = def.layout === 'picture-word';
        const grid = node('div', 'ek-card-grid'+(vocabularyMatching?' ek-'+def.layout+'-grid':''));
        def.items.forEach((item, index) => {
          const card = node('article', 'ek-card'+(vocabularyMatching?' ek-vocabulary-card ek-'+def.layout+'-card':''));
          const number = node('span', pictureWord ? 'ek-number ek-picture-number' : 'ek-number');
          if(vocabularyMatching)number.append(node('span','ek-number-label',String(itemNumber(item))));
          else number.textContent=String(itemNumber(item));
          card.append(number);
          if (item.image || item.imagePending) {
            const picture=illustration(item);
            if(pictureWord){
              const media=item.crop?croppedArtFrame(item,picture,'ek-picture-word-media ek-picture-word-crop-frame'):node('div','ek-picture-word-media');
              if(!item.crop)media.append(picture);card.append(media);
            }else card.append(picture);
          }
          if (!pictureWord) card.append(node('p', 'ek-card-label', item.text));
          if (item.audio || item.audioPending) {
            const replay=repeatAudioButton(item.audio,item.text,item.id);
            replay.classList.add('ek-card-audio');card.append(replay);
          }
          const chosen = () => def.options.find(option => option.id === answers[item.id]);
          const promptText = pictureWord ? `Picture ${itemNumber(item)}` : item.text;
          const refreshSlot = (matchItem, matchIndex, control) => {
            if (!control) return;
            const option = def.options.find(candidate => candidate.id === answers[matchItem.id]);
            const label = pictureWord ? `picture ${itemNumber(matchItem)}` : matchItem.text;
            if(vocabularyMatching){
              let badge=control.querySelector('.ek-match-answer-number'),text=control.querySelector('.ek-match-answer-label');
              if(!badge){badge=node('span','ek-match-answer-number');badge.append(node('span','ek-number-label'));badge.setAttribute('role','img');text=node('span','ek-match-answer-label');control.replaceChildren(badge,text);}
              const optionNumber=option&&letteredMatching?optionLetter(def.options.indexOf(option)):'';
              badge.dataset.number=optionNumber;badge.querySelector('.ek-number-label').textContent=optionNumber;
              text.textContent=option?.text||'';
            }else control.textContent = option?.text || (modern?'':'+');
            control.dataset.selected = String(Boolean(option));
            if(vocabularyMatching)control.querySelector('.ek-match-answer-number').setAttribute('aria-label',matchBadgeLabel(control.querySelector('.ek-match-answer-number')));
            control.setAttribute('aria-label', `Choose a match for ${label}${option ? `: ${option.text}` : ''}`);
            equalizeMatching();
          };
          const plus = button(chosen()?.text || (modern?'':'+'), () => {
            if(config.readOnly)return;
            const takenBy = new Map(
              Object.entries(answers)
                .filter(([id, value]) => id !== item.id && value)
                .map(([id, value]) => [value, id])
            );
            popover(
              { ...item, text: promptText, alt: pictureWord ? promptText : item.alt },
              def.options,
              answers[item.id],
              value => {
                if (value) {
                  const previousId = Object.keys(answers).find(id=>id!==item.id&&answers[id]===value);
                  if (previousId) {
                    delete answers[previousId];
                    const previousIndex = def.items.findIndex(candidate => candidate.id === previousId);
                    if (previousIndex >= 0) refreshSlot(def.items[previousIndex], previousIndex, controls.get(previousId));
                  }
                }
                changed(item.id, value);
                refreshSlot(item, index, controls.get(item.id));
              },
              plus,
              new Set(takenBy.keys())
            );
          }, 'ek-match-slot'+(vocabularyMatching?' ek-vocabulary-slot ek-'+def.layout+'-slot':''));
          refreshSlot(item,index,plus);
          plus.setAttribute('aria-haspopup', 'dialog');
          if(pictureWord)card.addEventListener('click',event=>{
            if(config.readOnly||plus.disabled||event.defaultPrevented||event.target.closest?.('button,a,input,select,textarea,audio,video,[role="button"],[contenteditable]'))return;
            plus.click();
          });
          controls.set(item.id, plus);paintControls.set(item.id,()=>refreshSlot(item,index,plus)); card.append(plus); grid.append(card);
        });
        body.append(grid);
        if(['stacked-text','word-definition','audio-picture'].includes(def.layout)||pictureWord&&def.answerSize==='sentence'){
          let frame=null;
          const view=doc.defaultView;
          const measure=()=>{
            frame=null;if(disposed||!grid.isConnected||!view?.getComputedStyle)return;
            const slots=[...grid.querySelectorAll('.ek-match-slot')].filter(slot=>slot.getBoundingClientRect().width>0);
            if(!slots.length)return;
            const base=parseFloat(view.getComputedStyle(grid).getPropertyValue('--ek-matching-slot-min-height'))||(def.layout==='word-definition'?104:def.layout==='audio-picture'?44:84);
            const probe=node('span','ek-match-answer-label');probe.setAttribute('aria-hidden','true');
            Object.assign(probe.style,{position:'absolute',visibility:'hidden',pointerEvents:'none',display:'block',height:'auto',minHeight:'0',maxHeight:'none',margin:'0',padding:'0',border:'0',boxSizing:'content-box'});
            grid.append(probe);
            const measured=new Map();
            const height=Math.ceil(Math.max(base,...slots.map(slot=>{
              const style=view.getComputedStyle(slot),label=slot.querySelector('.ek-match-answer-label');
              const labelStyle=view.getComputedStyle(label||slot),stacked=def.layout==='word-definition';
              const inset=['paddingTop','paddingBottom','borderTopWidth','borderBottomWidth'].reduce((sum,key)=>sum+(parseFloat(style[key])||0),0);
              const sideInset=['paddingLeft','paddingRight','borderLeftWidth','borderRightWidth'].reduce((sum,key)=>sum+(parseFloat(style[key])||0),0);
              const width=Math.max(1,slot.getBoundingClientRect().width-sideInset-(stacked?0:24));
              const signature=[width,...['fontFamily','fontSize','fontWeight','fontStyle','lineHeight','letterSpacing','wordSpacing'].map(key=>labelStyle[key])].join('|');
              let contentHeight=measured.get(signature);
              if(contentHeight===undefined){
                for(const key of ['fontFamily','fontSize','fontWeight','fontStyle','lineHeight','letterSpacing','wordSpacing','overflowWrap','wordBreak','hyphens'])probe.style[key]=labelStyle[key];
                probe.style.width=width+'px';contentHeight=16;
                for(const option of def.options){probe.textContent=option.text;contentHeight=Math.max(contentHeight,probe.scrollHeight||0,probe.getBoundingClientRect().height||0);}
                measured.set(signature,contentHeight);
              }
              return contentHeight+inset+(stacked?20:0);
            })));
            probe.remove();
            if(grid.style.getPropertyValue('--ek-matching-slot-height')!==height+'px')grid.style.setProperty('--ek-matching-slot-height',height+'px');
          };
          equalizeMatching=()=>{if(frame===null&&view?.requestAnimationFrame)frame=view.requestAnimationFrame(measure);};
          const observer=view?.ResizeObserver?new view.ResizeObserver(equalizeMatching):null;observer?.observe(grid);
          view?.addEventListener?.('resize',equalizeMatching);
          matchingCleanup=()=>{observer?.disconnect();view?.removeEventListener?.('resize',equalizeMatching);if(frame!==null)view?.cancelAnimationFrame?.(frame);};
          equalizeMatching();
        }
      }
      if (def.kind === 'gaps') {
        if (def.bank && def.inputMode !== 'select' && (def.inputMode === 'text' || def.items.some(item=>item.segments.some(segment=>typeof segment!=='string'&&!segment.options)))) {
          const bank = node('p', 'ek-word-list', def.bank.join(', '));
          bank.setAttribute('aria-label', 'Words to use'); body.append(bank);
        }
        const pictureRows=def.layout==='picture-rows',tableLayout=def.layout==='table';
        if(pictureRows)body.append(pictureCues(def.items));
        let tableBody;
        if(tableLayout){
          const wrap=node('div','ek-gap-table-wrap'),table=node('table','ek-gap-table'),head=node('thead'),row=node('tr'),number=node('th');
          table.setAttribute('aria-label',def.title);number.setAttribute('scope','col');number.setAttribute('aria-label','Row');row.append(number);
          def.tableColumns.forEach(title=>{const heading=node('th','',title);heading.setAttribute('scope','col');row.append(heading);});
          tableBody=node('tbody');head.append(row);table.append(head,tableBody);wrap.append(table);body.append(wrap);
        }
        def.items.forEach((item, index) => {
          const compact=pictureRows,container=compact?node('div','ek-picture-sentence'):body;
          if(compact)container.append(node('span','ek-picture-response-number',`${itemNumber(item)}.`));
          if(!compact&&(item.image || item.imagePending))body.append(illustration(item));
          const row = node(tableLayout?'tr':'p',tableLayout?'ek-table-row':def.layout === 'paragraph' ? 'ek-sentence ek-paragraph' : 'ek-sentence ek-numbered-sentence');
          if (def.preserveLines) row.style.whiteSpace = 'pre-wrap';
          if(tableLayout){const number=node('th','ek-table-row-number',String(itemNumber(item)));number.setAttribute('scope','row');row.append(number);}
          else if (!compact && def.layout !== 'paragraph') row.append(node('span', 'ek-sentence-number', `${itemNumber(item)}. `));
          let gapIndex=0;
          item.segments.forEach((segment,segmentIndex) => {
            const target=tableLayout?node('td'):row;
            if(tableLayout)row.append(target);
            if (typeof segment === 'string') {
              if(item.highlights?.length) target.append(...Array.from(richText(segment,item.highlights).childNodes));
              else target.append(doc.createTextNode(segment));
              return;
            }
            gapIndex += 1;
            const number = itemNumber(item);
            const label = tableLayout?`Row ${number}, ${def.tableColumns[segmentIndex]}`:`Sentence ${number}, gap ${gapIndex}`;
            const options = def.inputMode === 'text' ? null : segment.options || (def.inputMode === 'select' ? def.bank : null);
            if (options) {
              const {wrap,opener}=inlinePicker(segment.id,label,options.map(value=>({id:value,text:value})),number);target.append(wrap);controls.set(segment.id,opener);return;
            }
            const field = responseEditor(answers[segment.id],segment.placeholder,{compact:true});field.classList.add('ek-typed-gap');
            field.autocomplete = 'off'; field.spellcheck = false;
            field.setAttribute('aria-label', label);
            field.addEventListener('input', () => { sizeResponseField(field); changed(segment.id, field.value); });
            controls.set(segment.id, field);
            if(modern){const wrap=node('span','ek-typed-wrap'),badge=node('span','ek-gap-number','');badge.dataset.number='';wrap.append(badge,field);target.append(wrap);}else target.append(field);
          }); if(tableLayout)tableBody.append(row);else container.append(row);if(compact)body.append(container);
        });
      }
      if (def.kind === 'choice') def.items.forEach((item, index) => {
        if(item.image || item.imagePending)body.append(illustration(item));
        if (def.layout === 'dropdown') {
          const row = node('div', 'ek-discovery-choice');
          row.classList.toggle('ek-numbered-choice',flatControls&&def.numbered===true);
          if(flatControls&&def.numbered===true)row.append(node('span','ek-sentence-number',`${itemNumber(item)}. `));
          row.append(doc.createTextNode(`${item.prompt} `));
          const {wrap,opener}=inlinePicker(item.id,item.prompt,item.options,itemNumber(item));
          row.append(wrap);body.append(row);controls.set(item.id,opener);return;
        }
        const group = node('fieldset', def.layout === 'image-grid' ? 'ek-question ek-image-choice' : 'ek-question');
        const legend=node('legend');
        if(flatControls){
          const index=node('span','ek-question-index',String(itemNumber(item)));index.dataset.number=String(itemNumber(item));
          legend.append(index,...richText(item.prompt,item.promptHighlights||[]).childNodes);
        }
        else if(item.promptHighlights?.length){legend.append(...richText(`${itemNumber(item)}. ${item.prompt}`,item.promptHighlights).childNodes);legend.style.whiteSpace='pre-line';}
        else legend.textContent=`${itemNumber(item)}. ${item.prompt}`;
        if(config.hidePrompt){legend.hidden=true;group.setAttribute('aria-label',item.prompt);}
        group.append(legend);
        item.options.forEach(option => {
          const label = node('label', def.layout === 'image-grid' ? 'ek-radio ek-image-choice-option' : 'ek-radio'); const input = node('input'); input.type = def.multiple ? 'checkbox' : 'radio'; input.name = `${def.id}-${item.id}`; input.value = option.id; input.checked = def.multiple ? (Array.isArray(answers[item.id]) && answers[item.id].includes(option.id)) : answers[item.id] === option.id;
          input.addEventListener('change', () => {
            if (!def.multiple) { changed(item.id, option.id); return; }
            const selected = new Set(Array.isArray(answers[item.id]) ? answers[item.id] : []);
            if (input.checked) selected.add(option.id); else selected.delete(option.id);
            changed(item.id, [...selected]);
          });
          label.classList.toggle('ek-multiple-option',Boolean(def.multiple)); input.setAttribute('aria-label',option.text);label.append(input);if(def.layout!=='image-grid'||!(option.image||option.imagePending))label.append(node('span','',option.text)); if (option.image||option.imagePending) label.append(illustration(option)); group.append(label);
        }); body.append(group); controls.set(item.id, group);
      });
      if (def.kind === 'image-label') {
        const wrap = node('div', 'ek-image-label-wrap');
        const stage = node('div', 'ek-image-label-stage');
        const image = illustration({image:def.image, imagePending:def.imagePending, alt:def.alt,imageWidth:def.imageWidth,imageHeight:def.imageHeight});
        if(def.imagePending&&!def.image){image.style.aspectRatio=def.imageWidth>0&&def.imageHeight>0?`${def.imageWidth} / ${def.imageHeight}`:'4 / 3';image.style.minHeight='0';}
        else image.style.removeProperty('aspect-ratio');
        image.classList.add('ek-image-label-image'); stage.append(image);
        def.items.filter(item=>item.label).forEach(item=>{const label=node('span','ek-image-label-index',item.label);label.style.left=`${item.labelX??item.x}%`;label.style.top=`${item.labelY??item.y}%`;stage.append(label);});
        const assign = (targetId, optionId) => {
          if(config.readOnly)return;
          if (optionId && !def.options.some(option => option.id === optionId)) return;
          Object.keys(answers).forEach(id => { if (answers[id] === optionId) delete answers[id]; });
          changed(targetId, optionId); render();
        };
        def.items.forEach((item, index) => {
          const selected = def.options.find(option => option.id === answers[item.id]);
          const target = button(selected?.text || '+', () => {if(selected)assign(item.id,'');}, 'ek-image-label-target');
          target.style.left = `${item.x}%`; target.style.top = `${item.y}%`;
          target.setAttribute('aria-label', item.prompt || `Target ${itemNumber(item)}`);
          target.title='Click to return label; use Alt + arrow to move labels with the keyboard';
          if (selected) {draggable(target, selected.id);keyboardPlacement(target,def.items,()=>index,destination=>assign(destination.id,selected.id));}
          dropzone(target, id => assign(item.id, id));
          controls.set(item.id, target); stage.append(target);
        });
        const bank = node('div', 'ek-image-label-bank'); bank.setAttribute('aria-label', 'Label bank');
        def.options.filter(option => !Object.values(answers).includes(option.id)).forEach(option => {
          const label = button(option.text, () => {}, 'ek-token');
          keyboardPlacement(label,def.items,()=>-1,target=>assign(target.id,option.id));
          draggable(label, option.id); bank.append(label);
        });
        dropzone(bank, id => { Object.keys(answers).forEach(key => { if (answers[key] === id) delete answers[key]; }); save(); render(); });
        wrap.append(stage, bank); body.append(wrap);
      }
      if (def.kind === 'order') {
        if (def.source?.text) body.append(richText(def.source.text));
        if (def.source?.audio) body.append(audioPlayer(def.source.audio, 'Listening'));
        const picked = Array.isArray(answers.order) ? answers.order.filter(id => def.tokens.some(token => token.id === id)) : [];
        const imageMode = def.layout === 'image-grid';
        const ordered = node('div', imageMode ? 'ek-order-target ek-order-images-target' : 'ek-order-target');
        ordered.setAttribute('aria-label', imageMode ? 'Your picture order' : 'Your sentence');

        const tokenButton = (token, handler, index) => {
          if (!imageMode) return button(token.text, handler, 'ek-token');
          const card = button('', handler, 'ek-order-image-card');
          card.setAttribute('aria-label', token.text || token.alt || `Picture ${index + 1}`);
          const number = node('span', 'ek-order-number', String(index + 1));
          if (token.image||token.imagePending) card.append(illustration(token));
          if (token.text) card.append(node('span', 'ek-order-image-label', token.text));
          card.prepend(number);
          return card;
        };
        const move = (id, before = null) => {
          if (!def.tokens.some(token => token.id === id) || id === before) return;
          const next = picked.filter(value => value !== id);
          const at = before == null ? next.length : next.indexOf(before);
          next.splice(at < 0 ? next.length : at, 0, id); changed('order', next); render();
        };
        picked.forEach((id, index) => {
          const token = def.tokens.find(item => item.id === id);
          const control = tokenButton(token, () => { changed('order', picked.filter(value => value !== id)); render(); }, index);
          if (!imageMode && def.sentenceCase && index === 0) control.textContent = token.text.charAt(0).toUpperCase() + token.text.slice(1);
          draggable(control, id); dropzone(control, moved => move(moved, id));
          control.title = 'Click to return; drag to reorder; Alt + arrow to move';
          control.addEventListener('keydown', event => {
            if (!event.altKey || !['ArrowLeft','ArrowRight'].includes(event.key) || config.readOnly) return;
            event.preventDefault();
            const target = index + (event.key === 'ArrowLeft' ? -1 : 1);
            if (target < 0 || target >= picked.length) return;
            const next = [...picked]; [next[index],next[target]] = [next[target],next[index]];
            changed('order', next); render(); body.querySelector('.ek-order-target')?.focus();
          });
          ordered.append(control);
        });
        if (!imageMode && def.sentenceSuffix) ordered.append(node('span', 'ek-order-suffix', def.sentenceSuffix));
        ordered.tabIndex = 0; dropzone(ordered, (id,before) => move(id,before));
        const bank = node('div', imageMode ? 'ek-bank ek-order-image-bank' : 'ek-bank');
        def.tokens.filter(token => !picked.includes(token.id)).forEach((token, index) => {
          const control = tokenButton(token, () => move(token.id), index); draggable(control, token.id); bank.append(control);
        });
        dropzone(bank, id => { changed('order', picked.filter(value => value !== id)); render(); });
        bank.hidden=!bank.children.length;body.append(ordered, bank); controls.set('order', ordered);
      }
      if (def.kind === 'sort') {
        const bank = node('div', 'ek-bank'); const groups = node('div', 'ek-group-grid');
        const itemButton = item => {
          const b = button(item.text, () => {if(answers[item.id]){delete answers[item.id];save();render();}}, 'ek-token');
          keyboardPlacement(b,def.groups,()=>def.groups.findIndex(group=>group.id===answers[item.id]),group=>{changed(item.id,group.id);render();});
          b.setAttribute('aria-label', `Choose group for ${item.text}`); b.classList.add('ek-sort-token');draggable(b, item.id); controls.set(item.id, b); return b;
        };
        def.groups.forEach(group => {
          const box = node('section', 'ek-sort-group'); dropzone(box, id => { changed(id, group.id); render(); }); box.append(node('h3', '', group.text));
          def.items.filter(item => answers[item.id] === group.id).forEach(item => box.append(itemButton(item))); groups.append(box);
        });
        def.items.filter(item => !answers[item.id]).forEach(item => bank.append(itemButton(item)));
        dropzone(bank, id => { delete answers[id]; save(); render(); });
        bank.hidden=!bank.children.length;body.append(groups, bank);
      }
      if (def.kind === 'writing') {
        if(def.layout==='picture-rows')body.append(pictureCues(def.items));
        const inline=def.layout==='inline';
        def.items.forEach((item, index) => {
        const compact=def.layout==='picture-rows';
        const row=compact?node('div','ek-picture-sentence'):body;
        if(compact)row.append(node('span','ek-picture-response-number',`${itemNumber(item)}.`));
        if(!compact&&(item.image||item.imagePending))row.append(illustration(item));
        const label = node('label', 'ek-writing'+(inline?' ek-writing-inline':''), compact||inline ? '' : `${itemNumber(item)}. ${item.prompt}`);
        if(inline){label.append(node('span','ek-writing-prompt',`${itemNumber(item)}. ${item.prompt}`));if(def.transformationArrow){const arrow=node('span','ek-transform-arrow','→');arrow.setAttribute('aria-hidden','true');label.append(arrow);}}
        const input = responseEditor(answers[item.id],item.placeholder,{compact:(inline||def.layout==='picture-rows'&&def.templateCode==='E05A')&&!item.multiline,multiline:Boolean(item.multiline),growing:inline&&!item.multiline&&def.answerSize!=='word'});
        input.addEventListener('input', () => {sizeResponseField(input);changed(item.id, input.value);});label.append(input);
        if(compact)input.setAttribute('aria-label',`Word for picture ${itemNumber(item)}`);
        if(item.hint){const hint=node('small','ek-writing-hint',item.hint);hint.id=def.id+'-'+item.id+'-hint';input.setAttribute('aria-describedby',hint.id);label.append(hint);}
        row.append(label);if(compact)body.append(row); controls.set(item.id, input);
      });
      }
    }
    const lamps=new Map();
    function decorate(){
      if(!modern)return;
      lamps.clear();
      controls.forEach((control,id)=>{
        if(!['matching','gaps','choice'].includes(def.kind))return;
        if(def.kind==='choice'&&control.tagName==='FIELDSET'){if(def.multiple)return;const legend=control.querySelector('legend');let badge=legend.querySelector(flatControls?'.ek-question-index':'.ek-result-symbol');if(!badge){badge=node('span','ek-result-symbol');legend.prepend(badge);}badge.classList.add('ek-result-symbol');badge.setAttribute('role','img');badge.setAttribute('aria-label','Not checked');lamps.set(id,badge);return;}
        const lamp=def.kind==='matching'?(vocabularyMatching?control.querySelector('.ek-match-answer-number'):control.closest('.ek-card').querySelector('.ek-number')):(control.querySelector('.ek-gap-number')||control.parentElement.querySelector('.ek-gap-number'));
        if(!lamp)return;
        if(!vocabularyMatching){lamp.dataset.number=lamp.dataset.number||lamp.textContent;lamp.classList.add('ek-result-lamp');}
        lamp.setAttribute('role','img');lamp.setAttribute('aria-label',vocabularyMatching?matchBadgeLabel(lamp):'Not checked');
        if(def.kind==='matching'){ /* Reuse the number badge, without a second indicator. */ }
        else if(def.kind==='choice'){
          /* Discovery badge is already inside its field. */
        }else if(def.kind==='gaps'){ /* Number badge is already inside the answer field. */ }
        else control.after(lamp);
        lamps.set(id,lamp);
      });
      decorateDisclosures();
    }
    function decorateDisclosures(){
      host.querySelectorAll('details.ek-disclosure').forEach(detail=>{
        if(detail.dataset.motionReady)return;detail.dataset.motionReady='true';
        const summary=detail.querySelector('summary'),content=node('div','ek-disclosure-content');
        [...detail.childNodes].filter(child=>child!==summary).forEach(child=>content.append(child));detail.append(content);content.hidden=!detail.open;
        summary.setAttribute('aria-expanded',String(Boolean(detail.open)));
        summary.addEventListener('click',event=>{
          event.preventDefault();
          if(config.syncDisclosures&&(config.navigationReadOnly||detail.hidden))return;
          const open=summary.getAttribute('aria-expanded')!=='true';summary.setAttribute('aria-expanded',String(open));
          if(open)detail.open=true;
          expand(content,open,()=>{detail.open=open;if(open)centerSection(detail);});
          if(config.syncDisclosures){disclosureState=getViewState().disclosures;viewChanged();}
        });
      });
    }
    function markOrderTokens(){
      if(def.kind!=='order')return;
      const candidates=[...(def.correctOrder?[def.correctOrder]:[]),...(def.acceptedOrders||[])];
      if(!candidates.length)return;
      const placed=[...body.querySelectorAll('.ek-order-target [data-ek-drag-id]')];
      const matches=order=>placed.reduce((score,token,index)=>score+Number(order[index]===token.dataset.ekDragId),0);
      const target=candidates.reduce((best,order)=>matches(order)>matches(best)?order:best);
      placed.forEach((token,index)=>{
        const result=target[index]===token.dataset.ekDragId?'correct':'retry';
        if(def.layout==='image-grid'){
          const badge=token.querySelector('.ek-order-number');if(badge){badge.dataset.result=result;badge.setAttribute('aria-label',result==='correct'?'Correct':'Try again');}
        }else{token.dataset.feedback=result;token.setAttribute('aria-description',result==='correct'?'Correct position':'Incorrect position');}
      });
    }
    const itemNumber = item => config.itemNumbers?.[item.id] || def.items.indexOf(item)+1;
    const itemResult = item => {
      const values=def.kind==='gaps'?item.segments.filter(segment=>typeof segment!=='string').map(segment=>feedback[segment.id]||'empty'):[feedback[item.id]||'empty'];
      return ['retry','empty','review','correct'].find(result=>values.includes(result))||'empty';
    };
    const markAttempt = (element,result) => {
      element.dataset.result=result;
      const marker=node('span','ek-attempt-marker',({correct:'✓',retry:'×',empty:'–',review:'?'})[result]);
      marker.dataset.result=result;marker.setAttribute('role','img');
      marker.setAttribute('aria-label',({correct:'Your last answer was correct',retry:'Your last answer was incorrect',empty:'Your last answer was not completed',review:'Your last answer needs teacher review'})[result]);
      element.prepend(marker);return element;
    };
    function markChoiceOptions(){
      if(def.kind!=='choice')return;
      def.items.forEach(item=>{
        const group=controls.get(item.id);if(group?.tagName!=='FIELDSET')return;
        const correct=def.multiple?item.correctIds:item.correctId==null?null:[item.correctId];
        if(!correct)return;
        group.querySelectorAll('.ek-radio').forEach(label=>{
          const input=label.querySelector('input'),selected=def.multiple?Array.isArray(answers[item.id])&&answers[item.id].includes(input.value):answers[item.id]===input.value;
          const result=correct.includes(input.value)?'correct':selected?'retry':null;
          if(result){label.dataset.feedback=result;input.dataset.feedback=result;input.setAttribute('aria-description',result==='correct'?'Correct answer':'Incorrect answer');}
          else{label.removeAttribute('data-feedback');input.removeAttribute('data-feedback');input.removeAttribute('aria-description');}
        });
      });
    }
    function pictureCorrections(items,labelFor){
      const carousel=node('div','ek-picture-corrections'),track=node('div','ek-picture-correction-track');
      track.setAttribute('aria-label','Correct picture matches');track.tabIndex=0;
      items.forEach(item=>{
        const result=itemResult(item),answer=labelFor(item);if(result==='correct'||!answer)return;
        const card=node('article','ek-picture-correction-card');
        markAttempt(card,result);
        card.setAttribute('data-answer-number',String(itemNumber(item)));
        card.setAttribute('aria-label','Answer '+itemNumber(item));
        if(item.image||item.imagePending){const picture=illustration(item);card.append(item.crop?croppedArtFrame(item,picture,'ek-picture-correction-crop-frame'):picture);}
        else if(item.prompt||item.text)card.append(node('span','ek-muted',item.prompt||item.text));
        card.append(node('strong','',answer));track.append(card);
      });
      if(!track.children.length)return;
      const move=direction=>{const distance=(track.firstElementChild?.getBoundingClientRect().width||180)+12;track.scrollBy?.({left:direction*distance,behavior:'smooth'});};
      const controls=node('div','ek-picture-correction-controls');
      for(const [direction,label,arrow] of [[-1,'Previous correct pictures','‹'],[1,'Next correct pictures','›']]){const control=button(arrow,()=>move(direction),'ek-button');control.setAttribute('aria-label',label);controls.append(control);}
      carousel.append(track,controls);const section=node('li','ek-correction');section.append(node('strong','ek-feedback-heading','Correct answers'),carousel);resultsBox.append(section);
    }
    function showFeedback(){
      feedback=grade(def,answers);resultsBox.replaceChildren();
      controls.forEach((control,id)=>{
        const value=feedback[id];if(value&&def.kind!=='order')control.setAttribute('data-feedback',value);
        const lamp=lamps.get(id);if(lamp){lamp.dataset.result=value||'empty';lamp.setAttribute('aria-label',value==='correct'?'Correct':value==='retry'?'Try again':'Not answered');}
      });
      markOrderTokens();markChoiceOptions();
      status.textContent=feedbackMessage(feedback,def.kind);status.hidden=false;
      // Text answers keep the full authored key; picture corrections focus on
      // mistakes while image labels retain feedback at their image targets.
      // An authored translation opts image labels into the shared text key too.
      // Grading and saved answers stay intact.
      const attempted=Object.values(feedback).some(value=>value!=='empty');
      const corrections=attempted&&Object.values(feedback).some(value=>value==='retry'||value==='empty');
      const examples=[];
      if(def.kind==='gaps')def.items.forEach(item=>item.segments.forEach(segment=>{
        if(typeof segment!=='string' && !segment.answers && feedback[segment.id]!=='empty' && segment.possibleAnswers?.length)examples.push(['',segment.possibleAnswers.join(' / ')]);
      }));
      if(def.kind==='writing'&&def.showAuthoredSamples===true&&def.revealPossibleAnswers===true)def.items.forEach(item=>{
        if(feedback[item.id]==='review'&&item.possibleAnswers?.length)examples.push([item.prompt,item.possibleAnswers[0]]);
      });
      const solution=node('li','ek-correction'),list=node('ol','ek-answer-pairs');solution.append(list);
      const pair=(prompt,answer,item)=>{if(!answer)return;const row=markAttempt(node('li'),item?itemResult(item):feedback.order||'empty');if(item)row.setAttribute('value',String(itemNumber(item)));if(prompt)row.append(node('span','ek-muted',prompt),doc.createTextNode(' — '));row.append(node('strong','',answer));list.append(row);};
      const imageLabelTranslations=def.kind==='image-label'&&def.options.some(option=>option.translation);
      if(corrections&&(def.kind!=='image-label'||imageLabelTranslations)){
        if(def.kind==='image-label')def.items.forEach(item=>{
          const option=def.options.find(option=>option.id===item.correctId);
          if(option)pair(option.translation?option.text:'',option.translation||option.text,item);
        });
        else if(def.kind==='gaps')def.items.forEach(item=>{
          const row=markAttempt(node('li'),itemResult(item));row.setAttribute('value',String(itemNumber(item)));
          if(item.feedbackText){const sentence=richText(item.feedbackText,item.feedbackHighlights||[]);sentence.classList.add('ek-muted');row.append(sentence);}
          else item.segments.forEach((segment,index)=>{if(def.layout==='table'&&index)row.append(doc.createTextNode(' · '));row.append(typeof segment==='string'?node('span','ek-muted',segment):node('strong','',segment.feedbackAnswer||segment.answers?.join(' / ')||answers[segment.id]||'…'));});list.append(row);
        });
        else if(def.kind==='order'){
          if(def.layout==='image-grid')(def.correctOrder||def.acceptedOrders?.[0]||[]).forEach(id=>{const row=node('li');row.append(node('strong','',def.tokens.find(token=>token.id===id).text));list.append(row);});
          else pair('',orderSentence(def,def.correctOrder||def.acceptedOrders?.[0]));
        }
        else if(def.kind==='matching'&&def.layout==='picture-word'){
          pictureCorrections(def.items,item=>def.options.find(option=>option.id===item.correctId)?.text||'');
        }
        else if(def.kind==='writing'){
          if(def.items.some(item=>(item.image||item.imagePending)&&item.acceptedAnswers?.length))pictureCorrections(def.items,item=>item.acceptedAnswers?.[0]);
          else def.items.forEach(item=>pair(item.prompt,item.acceptedAnswers?.[0],item));
        }
        else if(def.items)def.items.forEach(item=>{
          if(item.feedbackText){const row=markAttempt(node('li'),itemResult(item));row.setAttribute('value',String(itemNumber(item)));row.append(richText(item.feedbackText,item.feedbackHighlights||[]));list.append(row);return;}
          const choices=item.options||def.options||def.groups||[];
          const ids=def.multiple?item.correctIds:[item.correctId];
          pair(item.text||item.prompt||'',(ids||[]).map(id=>choices.find(option=>option.id===id)?.text).filter(Boolean).join(' / '),item);
        });
      }
      if(list.children.length){solution.prepend(node('strong','ek-feedback-heading',def.kind==='order'?'Correct Answer':'Correct answers'));resultsBox.append(solution);}
      if(examples.length){
        const section=node('li','ek-correction ek-writing-answers'),container=def.revealPossibleAnswers?node('details','ek-disclosure'):section;container.append(node(def.revealPossibleAnswers?'summary':'strong','ek-feedback-heading',POSSIBLE_ANSWERS_TITLE));if(container!==section)section.append(container);
        if(def.kind==='writing'&&def.showAuthoredSamples===true&&def.revealPossibleAnswers)container.open=true;
        const list=node('ul','ek-answer-pairs');examples.forEach(([prompt,answer])=>{const row=node('li');if(prompt)row.append(node('span','ek-muted',prompt),doc.createTextNode(' — '));row.append(node('strong','',answer));list.append(row);});container.append(list);resultsBox.append(section);decorateDisclosures();
      }
      if(attempted && def.responseMode==='personal')status.textContent=Object.values(feedback).includes('empty')?'Заполните оставшиеся поля.':'Well done';
      // Feedback contains the outcome and answers only. Teaching notes/rules belong
      // to an explicit followUp or stage revealed by the teacher, never here.
      resultsBox.hidden=!resultsBox.children.length;status.classList.toggle('ek-feedback-with-answers',!resultsBox.hidden);
    }
    const checkFeedback = showFeedback;
    function updateActions(){
      const check=actions.querySelector('.ek-check');if(!check)return;
      const values=Object.values(grade(def,answers));
      check.hidden=!values.length||values.includes('empty');
      const skip=actions.querySelector('.ek-skip');if(skip)skip.hidden=Boolean(config.navigationReadOnly||answers.__sw_skipped||(config.independentSteps&&answers.__sw_checked));
    }
    if (!['presentation', 'audio', 'rule-page', 'stage'].includes(def.kind)) {const check=button(uiLabels.check, () => {
      delete answers.__sw_skipped;checkFeedback();
      if (config.syncChecks) { answers.__sw_checked = true; config.onChange?.(clone(answers)); }
      updateActions();centerSection(status,resultsBox.hidden?status:resultsBox,true);
    });check.classList.add('ek-check');check.setAttribute('aria-label','Check answers');actions.append(check);const skip=button('Skip',()=>{if(config.navigationReadOnly||config.readOnly)return;answers.__sw_skipped=true;delete answers.__sw_checked;clearFeedback();config.onChange?.(clone(answers));updateActions();announce('Skipped');config.onSkip?.();},'ek-button ek-secondary ek-skip');skip.setAttribute('aria-label','Skip exercise');actions.append(skip);}
    if((['presentation','audio'].includes(def.kind)||(def.kind==='rule-page'&&config.allowMaterialSkip))&&!isSpeaking(def)&&config.onSkip){
      const skip=button('Skip',()=>{if(config.navigationReadOnly||config.readOnly)return;answers.__sw_skipped=true;config.onChange?.(clone(answers));config.onSkip();},'ek-button ek-secondary ek-skip');
      skip.setAttribute('aria-label','Skip exercise');skip.hidden=Boolean(config.navigationReadOnly);actions.append(skip);
    }
    if (!['presentation', 'audio', 'rule-page', 'stage'].includes(def.kind)) {
      const reset = button('', () => { closeDialog(); answers = {}; save(); render(); announce(''); }, 'ek-button ek-secondary ek-reset');
      const icon=doc.createElementNS('http://www.w3.org/2000/svg','svg');
      icon.setAttribute('viewBox','0 0 24 24');icon.setAttribute('aria-hidden','true');
      const line=doc.createElementNS('http://www.w3.org/2000/svg','path');
      line.setAttribute('d','M4 10a8 8 0 1 1 1 7M4 4v6h6');icon.append(line);reset.append(icon);
      reset.setAttribute('aria-label', 'Reset exercise'); reset.title = 'Reset exercise'; actions.append(reset);
    }

    const setAnswersCore = next => {
      if(JSON.stringify(answers)===JSON.stringify(next||{}))return;
      const priorView={revealed:answers.revealed,rule:answers.__sw_rule_visible};
      answers = normalizeAnswers(next);
      if(config.onViewChange||config.navigationReadOnly){if(priorView.revealed!==undefined)answers.revealed=priorView.revealed;else delete answers.revealed;answers.__sw_rule_visible=priorView.rule;}
      clearFeedback();

      if (def.kind === 'stage') {
        const count = def.progressive ? stageCount(answers.revealed) : def.exercises.length;
        if (count !== visibleCount) syncStage(count);
        def.exercises.forEach(block => nestedMountsByBlock.get(block.id)?.setAnswers(answers[block.id] || {}));
        syncTranscript?.(); if(def.requireCheckBeforeNext)syncStage(count,false);
        return;
      }

      if (def.kind === 'rule-page') {
        syncRules?.(true);
        def.blocks.forEach(block => {
          if (block.type !== 'exercise') return;
          nestedMountsByBlock.get(block.id)?.setAnswers(answers[block.id] || {});
        });
        return;
      }

      if(def.kind==='matching'){paintControls.forEach(paint=>paint());return;}

      if (def.kind === 'writing') {
        def.items.forEach(item => {
          const field = controls.get(item.id);
          if (!field) return;
          const value = answers[item.id] == null ? '' : String(answers[item.id]);
          if (field.value !== value) field.value = value;
          sizeResponseField(field);
        });
        return;
      }

      if (def.kind === 'gaps') {
        let canPatchWithoutRender = true;
        for (const [id, control] of controls.entries()) {
          const isTypedGap = control?.classList?.contains?.('ek-typed-gap');
          if (!isTypedGap) {const paint=paintControls.get(id);if(paint){paint();continue;}canPatchWithoutRender = false; break; }
          const value = answers[id] == null ? '' : String(answers[id]);
          if (control.value !== value) control.value = value;
          sizeResponseField(control);
        }
        if (canPatchWithoutRender) return;
      }

      render();
    };
    const setAnswers = next => {
      const newFeedback=config.syncChecks&&next?.__sw_checked&&JSON.stringify(next)!==JSON.stringify(answers);
      setAnswersCore(next);updateActions();
      if(config.syncChecks&&answers.__sw_checked){checkFeedback();if(disclosureState)applyDisclosures(disclosureState);if(newFeedback)centerSection(status,resultsBox.hidden?status:resultsBox,true);}
    };

    const renderReadOnly = () => {
      if (!config.readOnly) return;
      body.querySelectorAll('button,input,textarea,select').forEach(control => {
        if (control.closest('.ek-audio-player,.ek-repeat-audio')) return;
        control.disabled = true;
      });
      actions.querySelectorAll('button,input,textarea,select').forEach(control => { control.disabled = true; });
    };
    const originalRender = render;
    render = () => { const before=layoutSnapshot();originalRender();watchResponseEditors();animateLayout(before); if(modern){status.hidden=true;resultsBox.hidden=true;} decorate();updateActions();renderReadOnly(); if (config.syncChecks && answers.__sw_checked) checkFeedback(); if(disclosureState)applyDisclosures(disclosureState); };

    host.addEventListener('keydown', onKeydown); doc.addEventListener('pointerdown', onOutside);
    host.addEventListener('click', dragClick, true);
    doc.addEventListener('pointermove', pointerMove, {passive:false});
    doc.addEventListener('pointerup', pointerEnd); doc.addEventListener('pointercancel', pointerEnd);
    render();
    return {
      getAnswers: () => clone(answers),
      getViewState,
      setViewState,
      setAnswers,
      destroy: () => { disposed=true;matchingCleanup();editorCleanup();if(scrollFrame!==null)doc.defaultView?.cancelAnimationFrame?.(scrollFrame);pointerDrag?.el.classList.remove('ek-dragging');pointerDrag = null;dragFlights.forEach(ghost=>ghost.remove());dragFlights.clear(); doc.removeEventListener('pointermove', pointerMove); doc.removeEventListener('pointerup', pointerEnd); doc.removeEventListener('pointercancel', pointerEnd); host.removeEventListener('click', dragClick, true); dismissInline(); doc.removeEventListener('pointerdown', onOutside); closeDialog(); nestedMounts.forEach(instance => instance.destroy()); nestedMounts = []; host.removeEventListener('keydown', onKeydown); host.querySelectorAll('audio,video').forEach(media => media.pause()); host.replaceChildren(); }
    };
  }
  const api = { templates, validate, grade, mount, speaking, isSpeaking, taskFinished, kinds, uiLabels, feedbackMessage, motion:{expand} };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else scope.SpaceWhaleExerciseKit = api;
})(typeof window !== 'undefined' ? window : globalThis);
