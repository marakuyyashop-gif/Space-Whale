(function (scope) {
  'use strict';
  const uiLabels = { check: 'OK' }; // Shared button copy for every exercise.
  const kinds = ['matching', 'gaps', 'choice', 'image-label', 'order', 'sort', 'writing', 'presentation', 'audio', 'rule-page', 'stage'];
  const normalize = value => String(value ?? '').normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('en');
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

  function validate(def) {
    const fail = message => { throw new Error(message); };
    const text = (value, name) => { if (typeof value !== 'string' || !value.trim()) fail(`${name}: expected non-empty text`); };
    const safeId = (value, name) => { text(value, name); if (['__proto__', 'constructor', 'prototype'].includes(value)) fail(`${name}: reserved ID`); };
    const array = (value, name) => { if (!Array.isArray(value) || !value.length) fail(`${name}: expected a non-empty list`); };
    const ids = (items, name) => {
      array(items, name);
      const used = new Set();
      items.forEach(item => { safeId(item?.id, `${name}.id`); if (used.has(item.id)) fail(`${name}: duplicate id ${item.id}`); used.add(item.id); });
      return used;
    };
    const media = item => {
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
    if (def.instruction != null && typeof def.instruction !== 'string') fail('instruction must be text');
    if (def.kind === 'stage') {
      ids(def.exercises, 'exercises');
      if (def.layout != null && !['separate', 'grouped'].includes(def.layout)) fail('Unsupported stage layout');
      if (def.layout === 'grouped' && def.progressive) fail('Grouped components cannot reveal as separate exercises');
      if (def.progressive != null && typeof def.progressive !== 'boolean') fail('progressive must be boolean');
      def.exercises.forEach(block => {
        if (block.id === 'revealed') fail('Reserved stage state key');
        if (block.exercise?.kind === 'stage') fail('Stage containers cannot be nested');
        validate(block.exercise);
      });
      return def;
    }
    if (def.kind === 'presentation') {
      array(def.blocks, 'blocks');
      def.blocks.forEach(block => {
        if (!['text', 'image', 'disclosure'].includes(block.type)) fail('Unsupported presentation block');
        if (block.type === 'image') { if (!block.imagePending) text(block.image, 'image'); media(block); }
        else { text(block.text, 'block text'); if (block.type === 'disclosure') text(block.title, 'disclosure title'); }
      });
      return def;
    }
    if (def.kind === 'audio') {
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
        audioSource(def.audio);
      }
      return def;
    }
    if (def.kind === 'rule-page') {
      array(def.blocks, 'blocks');
      const blockIds = new Set();
      def.blocks.forEach((block, index) => {
        if (!block || !['text', 'rule', 'image', 'exercise'].includes(block.type)) fail('Unsupported rule-page block');
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
      text(def.image, 'image');
      text(def.alt, 'image alt');
      media({ image: def.image, alt: def.alt });
      const valid = options(def.options);
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
      if (def.layout != null && !['cards', 'picture-word', 'word-definition'].includes(def.layout)) fail('Unsupported matching layout');
      const valid = options(def.options);
      const assigned = new Set();
      def.items.forEach(item => {
        text(item.text, 'card text');
        media(item);
        if (def.layout === 'picture-word' && !item.image && !item.imagePending) fail('Picture-word items need images');
        key(item, valid);
        if (item.correctId != null) {
          if (assigned.has(item.correctId)) fail('Matching answer IDs must be unique');
          assigned.add(item.correctId);
        }
      });
      if (def.options.length < def.items.length) fail('Matching needs at least one option per card');
    }
    if (def.kind === 'choice') {
      if (def.layout != null && !['list', 'image-grid', 'dropdown'].includes(def.layout)) fail('Unsupported choice layout');
      if (def.multiple != null && typeof def.multiple !== 'boolean') fail('multiple must be boolean');
      if (def.multiple && def.layout === 'dropdown') fail('Multiple choice needs visible checkboxes');
      def.items.forEach(item => {
        text(item.prompt, 'prompt'); const valid = options(item.options); key(item, valid);
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
    if (def.kind === 'writing') def.items.forEach(item => text(item.prompt, 'prompt'));
    if (def.kind === 'gaps') {
      if (def.layout != null && !['sentences', 'paragraph'].includes(def.layout)) fail('Unsupported gaps layout');
      if (def.inputMode != null && !['text', 'select'].includes(def.inputMode)) fail('Unsupported gaps inputMode');
      if (def.bank) { array(def.bank, 'bank'); def.bank.forEach(word => text(word, 'bank word')); }
      const used = new Set();
      def.items.forEach(item => {
        array(item.segments, 'segments');
        item.segments.forEach(segment => {
          if (typeof segment === 'string') return;
          safeId(segment?.id, 'gap id');
          if (used.has(segment.id)) fail(`Duplicate gap ID: ${segment.id}`);
          used.add(segment.id);
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
        const normalized = value => segment.normalization === 'phone' ? normalize(value).replace(/[\s()–—-]/g, '') : normalize(value);
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
        mark(item.id, value != null && String(value).trim() !== '', def.kind === 'writing' || item.correctId == null ? null : value === item.correctId);
      });
    }
    return results;
  }
  const feedbackMessages=['Try again.','Take another look.','Good start.','So close.','All correct.'];
  function feedbackMessage(results,kind){
    const values=Object.values(results),correct=values.filter(value=>value==='correct').length;
    if(!values.length||values.every(value=>value==='empty'))return kind==='gaps'?'Write an answer.':'Choose an answer.';
    if(values.includes('review'))return 'Ready to discuss.';
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
  function mount(host, definition, config = {}) {
    validate(definition);
    const def = clone(definition);
    if (config.discovery && !def.multiple && def.kind === 'choice' && def.layout !== 'image-grid') def.layout = 'dropdown';
    let answers = clone(config.answers || {});
    let feedback = {};
    const doc = host.ownerDocument;
    const modern=!doc.body?.classList.contains('design-preview');
    let syncStage=null, syncRules=null;
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
    const button = (label, handler, className = 'ek-button') => {
      const el = node('button', className, label); el.type = 'button'; el.addEventListener('click', handler); return el;
    };
    const illustration = item => {
      if (item.imagePending && !item.image) {
        const blank = node('div', 'ek-image ek-image-pending');
        blank.setAttribute('aria-label', 'Изображение');
        blank.setAttribute('role', 'img');
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
      const image = node('img', 'ek-image'); image.src = item.image; image.alt = item.alt || item.text || ''; image.loading = 'lazy'; return image;
    };
    const formatTime = value => {
      const seconds = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
      return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
    };
    const audioPlayer = (src, label = 'Audio') => {
      const wrap = node('div', 'ek-audio-player'); wrap.dataset.state = 'paused';
      const audio = node('audio'); audio.preload = 'metadata'; audio.src = src; audio.setAttribute('aria-label', label);
      let completed = false;
      const play = button('▶', async () => {
        if (audio.paused || completed) {
          if (completed) { audio.currentTime = 0; completed = false; sync(); }
          doc.querySelectorAll('audio').forEach(other => { if (other !== audio && !other.paused) other.pause(); });
          try { await audio.play(); } catch { announce('Audio could not be played.'); sync(); }
        } else audio.pause();
      }, 'ek-audio-play');
      play.setAttribute('aria-label', 'Play audio');
      const track = node('div', 'ek-audio-track');
      // Decorative line, not a measured waveform. Fill follows actual media time.
      const points = Array.from({length:601}, (_,x) => {
        const t=x/600;
        const envelope=Math.sin(Math.PI*t)**1.4;
        const amplitude=5+9*(.5+.5*Math.sin(t*31));
        const y=20+envelope*amplitude*Math.sin(t*185+1.2*Math.sin(t*23));
        return `${x ? 'L' : 'M'}${x},${y.toFixed(2)}`;
      }).join(' ');
      for (const layer of ['base', 'fill']) {
        const wave = node('div', `ek-audio-wave ek-audio-wave-${layer}`); wave.setAttribute('aria-hidden', 'true');
        const svg=doc.createElementNS('http://www.w3.org/2000/svg','svg');
        svg.setAttribute('viewBox','0 0 600 40');svg.setAttribute('preserveAspectRatio','none');
        const path=doc.createElementNS('http://www.w3.org/2000/svg','path');
        path.setAttribute('d',points);path.setAttribute('vector-effect','non-scaling-stroke');
        svg.append(path);wave.append(svg);track.append(wave);
      }
      const range = node('input', 'ek-audio-range'); range.type = 'range'; range.min = '0'; range.max = '100'; range.step = '0.1'; range.value = '0'; range.disabled = true; range.setAttribute('aria-label', 'Audio position');
      const time = node('span', 'ek-audio-time', '0:00 / 0:00');
      const sync = () => {
        const duration = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 0;
        const current = Number.isFinite(audio.currentTime) ? Math.max(0, audio.currentTime) : 0;
        const progress = completed ? 100 : duration ? Math.min(100, current / duration * 100) : 0;
        range.value = String(progress); range.disabled = !duration;
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
        if (Number.isFinite(audio.duration) && audio.duration > 0) {
          completed = false; audio.currentTime = (Number(range.value) / 100) * audio.duration; sync();
        }
      });
      track.append(range); wrap.append(audio, play, track, time);
      return wrap;
    };
    const repeatAudioButton = (src, label) => {
      const wrap = node('span', 'ek-repeat-audio');
      if (!src) {
        const pending = button('▶', () => announce('Audio will be connected to this item when its file is added.'), 'ek-repeat-play ek-audio-pending');
        pending.setAttribute('aria-label', `Audio pending for ${label}`);
        pending.title = 'Audio pending';
        wrap.append(pending);
        return wrap;
      }
      const audio = node('audio'); audio.preload = 'metadata'; audio.src = src; audio.setAttribute('aria-label', label);
      const play = button('▶', async () => {
        host.querySelectorAll('audio').forEach(other => { if (other !== audio && !other.paused) other.pause(); });
        if (audio.paused) {
          doc.querySelectorAll('audio').forEach(other => { if (other !== audio && !other.paused) other.pause(); });
          try { await audio.play(); } catch { announce('Audio could not be played.'); }
        } else audio.pause();
      }, 'ek-repeat-play');
      play.setAttribute('aria-label', `Play ${label}`);
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
      body.querySelectorAll('.ek-order-number[data-result]').forEach(badge=>{delete badge.dataset.result;badge.removeAttribute('aria-label');});
      resultsBox.replaceChildren(); announce('');
      if(modern){status.hidden=true;resultsBox.hidden=true;lamps.forEach(lamp=>{delete lamp.dataset.result;lamp.setAttribute('aria-label','Not checked');});}
    };
    const save = () => { if (config.syncChecks) delete answers.__sw_checked; clearFeedback(); config.onChange?.(clone(answers)); };
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
    host.classList.add('exercise-kit');host.classList.toggle('ek-modern',modern);
    host.classList.toggle('ek-reading-width', def.kind === 'gaps');
    host.classList.toggle('ek-stage-grouped', def.kind === 'stage' && def.layout === 'grouped');
    host.replaceChildren();
    host.append(node('h2', 'ek-title', def.title), node('p', 'ek-instruction', def.instruction || ''));
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
      dialog = node('dialog', 'ek-dialog');
      dialog.setAttribute('aria-label', def.title);
      const close=button(modern?'':'Close ×', () => closeDialog(), 'ek-close');close.setAttribute('aria-label','Close');
      dialog.append(close, node('h3', 'ek-title', def.title));
      const prompt = node('div', 'ek-prompt', item.text);
      prompt.setAttribute('aria-label', 'Phrase to match');
      if (item.image || item.imagePending) prompt.prepend(illustration(item));
      dialog.append(prompt);
      const choices = node('div', 'ek-options');
      available.forEach(option => {
        const choice = button(option.text, () => { onPick(option.id); closeDialog(); }, 'ek-option');
        if (option.image) choice.prepend(illustration(option));
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
      dialog.addEventListener('close', () => {
        currentDialog.remove();
        const replacement = [...body.querySelectorAll('button')].find(button => button.getAttribute('aria-label') === currentTrigger.getAttribute('aria-label'));
        if (host.isConnected) (currentTrigger.isConnected ? currentTrigger : replacement)?.focus();
      }, { once: true });
      host.append(dialog); dialog.showModal();
    }
    function richText(value, highlights = []) {
      const el = node('p', 'ek-copy');
      const pieces = [...highlights].filter(part => typeof part === 'string' && part.length).sort((a,b) => b.length - a.length);
      let rest = value;
      while (rest) {
        let at = -1, match = '';
        for (const part of pieces) { const i = rest.indexOf(part); if (i >= 0 && (at < 0 || i < at)) { at = i; match = part; } }
        if (at < 0) { el.append(doc.createTextNode(rest)); break; }
        el.append(doc.createTextNode(rest.slice(0, at)), node('strong', '', match)); rest = rest.slice(at + match.length);
      }
      return el;
    }
    function render() {
      dismissInline();
      nestedMounts.forEach(instance => instance.destroy()); nestedMounts = []; nestedMountsByBlock.clear();
      body.querySelectorAll('audio').forEach(audio => audio.pause());
      body.replaceChildren(); controls.clear(); resultsBox.replaceChildren();
      if (def.kind === 'presentation') {
        def.blocks.forEach(block => {
          if (block.type === 'image') body.append(illustration(block));
          else if (block.type === 'disclosure') {
            const detail = node('details', 'ek-disclosure');
            const title = isPossibleAnswersBlock(block) ? POSSIBLE_ANSWERS_TITLE : /useful language/i.test(block.title) ? 'Use phrases' : block.title;
            detail.open = !isPossibleAnswersBlock(block) && (block.open === true || ['useful language','use phrases'].includes(normalize(block.title)));
            detail.append(node('summary', '', title), node('p', 'ek-copy', block.text));
            body.append(detail);
          }
          else body.append(node('p', 'ek-copy', block.text));
        });
      }
      if (def.kind === 'stage') {
        const stack = node('div', 'ek-stage-stack');
        visibleCount = def.progressive ? Math.max(1, Math.min(def.exercises.length, Number(answers.revealed) || 1)) : def.exercises.length;
        const reveal = () => {
          const index = nestedMounts.length;
          const block = def.exercises[index];
          const section = node('section', 'ek-stage-section'); section.setAttribute('aria-label', `Exercise ${index + 1}`);
          const child = node('div', 'ek-stage-host'); section.append(child); stack.append(section);
          const handle = mount(child, block.exercise, { syncChecks: Boolean(config.syncChecks), readOnly: Boolean(config.readOnly), answers: answers[block.id] || {}, onChange: value => { answers[block.id] = value; save(); } });
          nestedMounts.push(handle); nestedMountsByBlock.set(block.id, handle);
          return section;
        };
        const navigation = node('div', 'ek-stage-navigation');
        const updateNavigation = focusDirection => {
          navigation.replaceChildren();
          const addControl = (direction, label, handler) => {
            const control = button('', handler, `ek-button ek-stage-toggle ek-stage-${direction}`);
            control.setAttribute('aria-label', label); control.title = label;
            control.disabled = Boolean(config.readOnly);
            const chevron = node('span', 'ek-stage-chevron'); chevron.setAttribute('aria-hidden', 'true');
            control.append(chevron); navigation.append(control);
            return control;
          };
          let down, up;
          if (visibleCount < def.exercises.length) down = addControl('down', 'Show next exercise', () => {
            if (config.readOnly) return;
            visibleCount += 1; answers.revealed = visibleCount; save();
            const section = syncStage(visibleCount); updateNavigation('down');
            section.scrollIntoView?.({behavior:doc.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block:'start'});
          });
          if (visibleCount > 1) up = addControl('up', 'Свернуть задание', () => {
            if (config.readOnly) return;
            visibleCount -= 1; answers.revealed = visibleCount; save();
            syncStage(visibleCount);
            updateNavigation('up');
            navigation.scrollIntoView?.({behavior:doc.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block:'nearest'});
          });
          if (focusDirection) (focusDirection === 'up' ? up || down : down || up)?.focus();
        };
        syncStage=count=>{
          while(nestedMounts.length<count){const section=reveal();section.hidden=true;}
          visibleCount=count;
          [...stack.children].forEach((section,index)=>{
            const open=index<count;
            if(!open)section.querySelectorAll('audio,video').forEach(media=>media.pause());
            if(section.hidden===open||Boolean(section.inert)===open)expand(section,open);
          });
          updateNavigation();return stack.children[count-1];
        };
        while (nestedMounts.length < visibleCount) reveal();
        body.append(stack);
        if (def.progressive) { body.append(navigation); updateNavigation(); }
      }
      if (def.kind === 'rule-page') {
        const page = node('div', 'ek-rule-page');
        const revealable=[]; let afterExercise=false;
        def.blocks.forEach((block, index) => {
          if (block.type === 'text') {
            const section = node('section', 'ek-rule-section ek-rule-text-section');
            if (block.title) section.append(node('h3', 'ek-rule-section-title', block.title === 'Examples' ? '[Exercise instruction]' : block.title));
            section.append(richText(block.text, block.highlights));
            page.append(section);
          }
          if (block.type === 'rule') {
            const possibleAnswers = isPossibleAnswersBlock(block);
            const section = possibleAnswers
              ? node('details', 'ek-disclosure')
              : node('section', 'ek-rule-section ek-rule-block');
            if (possibleAnswers) section.append(node('summary', '', POSSIBLE_ANSWERS_TITLE));
            else if (block.title) section.append(node('h3', 'ek-rule-section-title', block.title));
            if (block.text) section.append(richText(block.text, block.highlights));
            if (block.formula) section.append(node('div', 'ek-rule-formula', block.formula));
            if (block.examples?.length) {
              const examples = node('div', 'ek-rule-examples');
              block.examples.forEach(example => examples.append(node('p', 'ek-rule-example', example)));
              section.append(examples);
            }
            if(afterExercise && !possibleAnswers) revealable.push(section);
            page.append(section);
          }
          if (block.type === 'image') {
            const figure = node('figure', 'ek-rule-visual');
            figure.append(illustration(block));
            if (block.caption) figure.append(node('figcaption', 'ek-muted', block.caption));
            page.append(figure);
          }
          if (block.type === 'exercise') {
            afterExercise=true;
            const section = node('section', 'ek-discovery-block');
            const child = node('div', 'ek-discovery-host');
            section.append(child);
            page.append(section);
            const handle = mount(child, block.exercise, {
              discovery: true,
              syncChecks: Boolean(config.syncChecks),
              readOnly: Boolean(config.readOnly),
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
          const toggle=button('',()=>{answers.__sw_rule_visible=!answers.__sw_rule_visible;save();syncRules(true);},'ek-button ek-stage-toggle ek-stage-down');
          const arrow=node('span','ek-stage-chevron');arrow.setAttribute('aria-hidden','true');toggle.append(arrow);
          navigation.append(toggle);revealable[0].before(navigation);
          syncRules=(animate=false)=>{const open=Boolean(answers.__sw_rule_visible);revealable.forEach(section=>{if(animate)expand(section,open);else section.hidden=!open;});toggle.classList.toggle('ek-stage-up',open);toggle.classList.toggle('ek-stage-down',!open);toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Hide rule':'Show rule');toggle.title=open?'Hide rule':'Show rule';};
          syncRules();
        }
      }
      if (def.kind === 'audio') {
        if (def.layout === 'listen-repeat') {
          const list = node('div', 'ek-repeat-list');
          def.items.forEach(item => {
            const wordRow = node('article', 'ek-repeat-item');
            wordRow.append(repeatAudioButton(item.audio, item.text), node('span', 'ek-repeat-line', item.text));
            list.append(wordRow);
            if (item.example) {
              const exampleRow = node('article', 'ek-repeat-item');
              exampleRow.append(repeatAudioButton(item.exampleAudio, item.example), node('span', 'ek-repeat-line', item.example));
              list.append(exampleRow);
            }
          });
          body.append(list);
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
        const grid = node('div', pictureWord ? 'ek-card-grid ek-picture-word-grid' : 'ek-card-grid');
        def.items.forEach((item, index) => {
          const card = node('article', pictureWord ? 'ek-card ek-picture-word-card' : 'ek-card');
          const number = node('span', pictureWord ? 'ek-number ek-picture-number' : 'ek-number', String(index + 1));
          card.append(number);
          if (item.image || item.imagePending) card.append(illustration(item));
          if (!pictureWord) card.append(node('p', 'ek-card-label', item.text));
          const chosen = () => def.options.find(option => option.id === answers[item.id]);
          const promptText = pictureWord ? `Picture ${index + 1}` : item.text;
          const refreshSlot = (matchItem, matchIndex, control) => {
            if (!control) return;
            const option = def.options.find(candidate => candidate.id === answers[matchItem.id]);
            const label = pictureWord ? `picture ${matchIndex + 1}` : matchItem.text;
            control.textContent = option?.text || (modern?'':'+');
            control.dataset.selected = String(Boolean(option));
            control.setAttribute('aria-label', `Choose a match for ${label}${option ? `: ${option.text}` : ''}`);
          };
          const plus = button(chosen()?.text || (modern?'':'+'), () => {
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
                  const previousId = takenBy.get(value);
                  if (previousId) {
                    delete answers[previousId];
                    const previousIndex = def.items.findIndex(candidate => candidate.id === previousId);
                    if (previousIndex >= 0) refreshSlot(def.items[previousIndex], previousIndex, controls.get(previousId));
                  }
                }
                changed(item.id, value);
                refreshSlot(item, index, plus);
              },
              plus,
              new Set(takenBy.keys())
            );
          }, pictureWord ? 'ek-match-slot ek-picture-word-slot' : 'ek-match-slot');
          plus.dataset.selected = String(Boolean(chosen()));
          plus.setAttribute('aria-label', `Choose a match for ${promptText.toLowerCase()}`); plus.setAttribute('aria-haspopup', 'dialog');
          controls.set(item.id, plus); card.append(plus); grid.append(card);
        });
        body.append(grid);
      }
      if (def.kind === 'gaps') {
        if (def.bank) {
          const bank = node('p', 'ek-word-list', def.bank.join(', '));
          bank.setAttribute('aria-label', 'Words to use'); body.append(bank);
        }
        let gapNumber = 0;
        def.items.forEach((item, index) => {
          const row = node('p', def.layout === 'paragraph' ? 'ek-sentence ek-paragraph' : 'ek-sentence ek-numbered-sentence');
          if (!modern && def.layout !== 'paragraph') row.append(node('span', 'ek-sentence-number', `${index + 1}. `));
          item.segments.forEach(segment => {
            if (typeof segment === 'string') { row.append(doc.createTextNode(segment)); return; }
            gapNumber += 1;
            const number = gapNumber;
            const label = `Sentence ${index + 1}, gap ${segment.id}`;
            const options = def.inputMode === 'text' ? null : segment.options || (def.inputMode === 'select' ? def.bank : null);
            if (options) {
              const wrap = node('span', 'ek-inline-choice');
              const menu = node('span', 'ek-inline-menu'); menu.hidden = true;
              menu.setAttribute('role', 'group'); menu.setAttribute('aria-label', `Options for ${label}`);
              const badge=node('span','ek-gap-number',String(number));badge.dataset.number=String(number);
              const paint = () => {
                opener.replaceChildren(badge, doc.createTextNode(answers[segment.id] || '\u00a0'));
                opener.setAttribute('aria-label', `${label}: ${answers[segment.id] || 'choose an answer'}`);
                opener.dataset.selected = String(Boolean(answers[segment.id]));
                menu.querySelectorAll('[data-option-value]').forEach(option => option.setAttribute('aria-pressed', String(option.dataset.optionValue === answers[segment.id])));
              };
              const shut = () => { menu.hidden=true;opener.setAttribute('aria-expanded','false'); };
              const opener = button('', () => {
                if (opener.getAttribute('aria-expanded')==='true') { dismissInline(); return; }
                dismissInline(); menu.hidden=false;opener.setAttribute('aria-expanded','true');
                closeInline = shut;
                menu.querySelector('button')?.focus();
              }, 'ek-gap ek-choice-trigger');
              opener.setAttribute('aria-expanded', 'false');
              options.forEach((value, optionIndex) => {
                const option = button('', () => { changed(segment.id, value); paint(); dismissInline(); opener.focus(); }, 'ek-inline-option');
                option.dataset.optionValue = value;
                if(!modern)option.append(node('span', 'ek-gap-number', String(optionIndex + 1)));option.append(doc.createTextNode(value));
                menu.append(option);
              });
              menu.append(button('Clear', () => { changed(segment.id, ''); paint(); dismissInline(); opener.focus(); }, 'ek-inline-option ek-inline-clear'));
              wrap.addEventListener('keydown', event => {
                if (event.key === 'Escape') { event.stopPropagation(); dismissInline(); opener.focus(); }
                if (['ArrowDown', 'ArrowUp'].includes(event.key)) {
                  event.preventDefault();
                  if (menu.hidden) opener.click();
                  else { const buttons = [...menu.querySelectorAll('button')]; const i = buttons.indexOf(doc.activeElement); buttons[(i + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length].focus(); }
                }
              });
              wrap.addEventListener('focusout', event => { if (!wrap.contains(event.relatedTarget)) shut(); });
              paint(); wrap.append(opener, menu); row.append(wrap); controls.set(segment.id, opener); return;
            }
            const field = node('input', 'ek-gap ek-typed-gap');
            field.type = 'text'; field.autocomplete = 'off'; field.spellcheck = false;
            field.setAttribute('aria-label', label);
            field.value = answers[segment.id] || '';
            const resize = () => { field.style.width = `${Math.max(5, Math.min(28, field.value.length + 2))}ch`; };
            resize();
            field.addEventListener('input', () => { resize(); changed(segment.id, field.value); });
            controls.set(segment.id, field);
            if(modern){const wrap=node('span','ek-typed-wrap'),badge=node('span','ek-gap-number',String(number));badge.dataset.number=String(number);wrap.append(badge,field);row.append(wrap);}else row.append(field);
          }); body.append(row);
        });
      }
      if (def.kind === 'choice') def.items.forEach((item, index) => {
        if (def.layout === 'dropdown') {
          const row = node('label', 'ek-discovery-choice');
          row.append(doc.createTextNode(`${item.prompt} `));
          const select = node('select', 'ek-gap ek-discovery-select');
          select.setAttribute('aria-label', item.prompt);
          const empty = node('option', '', '…'); empty.value = ''; select.append(empty);
          item.options.forEach(option => { const el = node('option', '', option.text); el.value = option.id; select.append(el); });
          select.value = answers[item.id] || '';
          select.addEventListener('change', () => changed(item.id, select.value));
          const field=node('span','ek-discovery-field');field.append(node('span','ek-gap-number',String(index+1)),select);row.append(field); body.append(row); controls.set(item.id, select); return;
        }
        const group = node('fieldset', def.layout === 'image-grid' ? 'ek-question ek-image-choice' : 'ek-question'); group.append(node('legend', '', `${index + 1}. ${item.prompt}`));
        item.options.forEach(option => {
          const label = node('label', def.layout === 'image-grid' ? 'ek-radio ek-image-choice-option' : 'ek-radio'); const input = node('input'); input.type = def.multiple ? 'checkbox' : 'radio'; input.name = `${def.id}-${item.id}`; input.value = option.id; input.checked = def.multiple ? (Array.isArray(answers[item.id]) && answers[item.id].includes(option.id)) : answers[item.id] === option.id;
          input.addEventListener('change', () => {
            if (!def.multiple) { changed(item.id, option.id); return; }
            const selected = new Set(Array.isArray(answers[item.id]) ? answers[item.id] : []);
            if (input.checked) selected.add(option.id); else selected.delete(option.id);
            changed(item.id, [...selected]);
          });
          label.classList.toggle('ek-multiple-option',Boolean(def.multiple)); input.setAttribute('aria-label',option.text);label.append(input);if(def.layout!=='image-grid'||!option.image)label.append(node('span','',option.text)); if (option.image) label.append(illustration(option)); group.append(label);
        }); body.append(group); controls.set(item.id, group);
      });
      if (def.kind === 'image-label') {
        const wrap = node('div', 'ek-image-label-wrap');
        const stage = node('div', 'ek-image-label-stage');
        const image = illustration({image:def.image, alt:def.alt}); image.classList.add('ek-image-label-image'); stage.append(image);
        const assign = (targetId, optionId) => {
          if (optionId && !def.options.some(option => option.id === optionId)) return;
          Object.keys(answers).forEach(id => { if (answers[id] === optionId) delete answers[id]; });
          changed(targetId, optionId); render();
        };
        def.items.forEach((item, index) => {
          const selected = def.options.find(option => option.id === answers[item.id]);
          const target = button(selected?.text || '+', () => {if(selected)assign(item.id,'');}, 'ek-image-label-target');
          target.style.left = `${item.x}%`; target.style.top = `${item.y}%`;
          target.setAttribute('aria-label', item.prompt || `Target ${index + 1}`);
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
          if (token.image) card.append(illustration(token));
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
        ordered.tabIndex = 0; dropzone(ordered, (id,before) => move(id,before));
        const bank = node('div', imageMode ? 'ek-bank ek-order-image-bank' : 'ek-bank');
        def.tokens.filter(token => !picked.includes(token.id)).forEach((token, index) => {
          const control = tokenButton(token, () => move(token.id), index); draggable(control, token.id); bank.append(control);
        });
        dropzone(bank, id => { changed('order', picked.filter(value => value !== id)); render(); });
        body.append(ordered, bank); controls.set('order', ordered);
      }
      if (def.kind === 'sort') {
        const bank = node('div', 'ek-bank'); const groups = node('div', 'ek-group-grid');
        const itemButton = item => {
          const b = button(item.text, () => {if(answers[item.id]){delete answers[item.id];save();render();}}, 'ek-token');
          keyboardPlacement(b,def.groups,()=>def.groups.findIndex(group=>group.id===answers[item.id]),group=>{changed(item.id,group.id);render();});
          b.setAttribute('aria-label', `Choose group for ${item.text}`); draggable(b, item.id); controls.set(item.id, b); return b;
        };
        def.groups.forEach(group => {
          const box = node('section', 'ek-sort-group'); dropzone(box, id => { changed(id, group.id); render(); }); box.append(node('h3', '', group.text));
          def.items.filter(item => answers[item.id] === group.id).forEach(item => box.append(itemButton(item))); groups.append(box);
        });
        def.items.filter(item => !answers[item.id]).forEach(item => bank.append(itemButton(item)));
        dropzone(bank, id => { delete answers[id]; save(); render(); });
        body.append(groups, bank);
      }
      if (def.kind === 'writing') def.items.forEach((item, index) => {
        const label = node('label', 'ek-writing', `${index + 1}. ${item.prompt}`);
        const input = node('input','ek-writing-input'); input.type='text'; input.value = answers[item.id] || ''; input.addEventListener('input', () => changed(item.id, input.value)); label.append(input); body.append(label); controls.set(item.id, input);
      });
    }
    const lamps=new Map();
    function decorate(){
      if(!modern)return;
      lamps.clear();
      controls.forEach((control,id)=>{
        if(!['matching','gaps','choice'].includes(def.kind))return;
        if(def.kind==='choice'&&control.tagName==='FIELDSET')return;
        const lamp=def.kind==='matching'?control.closest('.ek-card').querySelector('.ek-number'):(control.querySelector('.ek-gap-number')||control.parentElement.querySelector('.ek-gap-number'));
        if(!lamp)return;lamp.classList.add('ek-result-lamp');lamp.setAttribute('role','img');lamp.setAttribute('aria-label','Not checked');
        if(def.kind==='matching'){ /* Reuse the number badge, without a second indicator. */ }
        else if(def.kind==='choice'){
          /* Discovery badge is already inside its field. */
        }else if(def.kind==='gaps'){ /* Number badge is already inside the answer field. */ }
        else control.after(lamp);
        lamps.set(id,lamp);
      });
      host.querySelectorAll('details.ek-disclosure').forEach(detail=>{
        if(detail.dataset.motionReady)return;detail.dataset.motionReady='true';
        const summary=detail.querySelector('summary'),content=node('div','ek-disclosure-content');
        [...detail.childNodes].filter(child=>child!==summary).forEach(child=>content.append(child));detail.append(content);content.hidden=!detail.open;
        summary.setAttribute('aria-expanded',String(Boolean(detail.open)));
        summary.addEventListener('click',event=>{event.preventDefault();const open=summary.getAttribute('aria-expanded')!=='true';summary.setAttribute('aria-expanded',String(open));if(open)detail.open=true;expand(content,open,()=>{detail.open=open;});});
      });
    }
    function showFeedback(){
      feedback=grade(def,answers);resultsBox.replaceChildren();
      controls.forEach((control,id)=>{
        const value=feedback[id];if(value)control.setAttribute('data-feedback',value);
        const lamp=lamps.get(id);if(lamp){lamp.dataset.result=value||'empty';lamp.setAttribute('aria-label',value==='correct'?'Correct':value==='retry'?'Try again':'Not answered');}
      });
      if(def.kind==='order'&&def.layout==='image-grid')body.querySelectorAll('.ek-order-target [data-ek-drag-id]').forEach((card,index)=>{
        const badge=card.querySelector('.ek-order-number');if(badge){badge.dataset.result=def.correctOrder?.[index]===card.dataset.ekDragId?'correct':'retry';badge.setAttribute('aria-label',badge.dataset.result==='correct'?'Correct':'Try again');}
      });
      status.textContent=feedbackMessage(feedback,def.kind);status.hidden=false;
      const showAnswers=def.feedback?.showAnswers??(def.layout!=='image-grid'&&def.layout!=='picture-word'&&def.kind!=='image-label');
      if(showAnswers&&Object.values(feedback).some(value=>value!=='empty')){
        const correction=node('li','ek-correction'),list=node('ol','ek-answer-pairs');correction.append(list);
        const pair=(prompt,answer)=>{if(!answer)return;const row=node('li');row.append(node('span','ek-muted',prompt),doc.createTextNode(' — '),node('strong','',answer));list.append(row);};
        if(def.kind==='gaps')def.items.forEach(item=>{const row=node('li');item.segments.forEach(segment=>row.append(typeof segment==='string'?node('span','ek-muted',segment):node('strong','',segment.answers?.[0]||'…')));list.append(row);});
        else if(def.kind==='order')pair('',def.correctOrder?.map(id=>def.tokens.find(token=>token.id===id).text).join(' '));
        else def.items.forEach(item=>{const choices=item.options||def.options||def.groups||[];const ids=def.multiple?item.correctIds:[item.correctId];pair(item.text||item.prompt||'',(ids||[]).map(id=>choices.find(option=>option.id===id)?.text).filter(Boolean).join(' / '));});
        if(list.children.length)resultsBox.append(correction);
      }
      resultsBox.hidden=!resultsBox.children.length;status.classList.toggle('ek-feedback-with-answers',!resultsBox.hidden);
    }
    const checkFeedback = () => {
      if(modern){showFeedback();return;}
      feedback = grade(def, answers);
      const labels = { correct: '✓ Correct', retry: '✕ Incorrect', empty: 'Not answered yet', review: 'Teacher review' };
      resultsBox.replaceChildren();
      Object.entries(feedback).forEach(([id, result], index) => {
        controls.get(id)?.setAttribute('data-feedback', result);
        const line = node('li', '', `${index + 1}. ${labels[result]}`); line.setAttribute('data-feedback', result); resultsBox.append(line);
      });
      if (Object.values(feedback).some(result => result === 'retry' || result === 'empty')) {
        const correction = node('li', 'ek-correction'); correction.append(node('strong', '', 'Correct solution'));
        if (def.kind === 'gaps') def.items.forEach(item => {
          if (!item.segments.some(segment => typeof segment !== 'string' && ['retry','empty'].includes(feedback[segment.id]) && segment.answers)) return;
          const line = node('p', 'ek-correction-line');
          item.segments.forEach(segment => line.append(typeof segment === 'string' ? node('span','ek-muted',segment) : node('strong','',segment.answers?.[0] || '…'))); correction.append(line);
        });
        else if (def.kind === 'order' && def.correctOrder) correction.append(node('p','',def.correctOrder.map(id => def.tokens.find(token => token.id === id).text).join(' → ')));
        else if (def.kind !== 'order') def.items.forEach((item,index) => {
          if (!['retry','empty'].includes(feedback[item.id])) return;
          const choices = item.options || def.options || def.groups || [];
          const ids = def.multiple ? item.correctIds : item.correctId == null ? [] : [item.correctId];
          const correct = (ids || []).map(id => choices.find(option => option.id === id)?.text).filter(Boolean).join(' + ');
          if (correct) correction.append(node('p','',`${item.text || item.prompt || `Target ${index+1}`} → ${correct}`));
        });
        if (correction.children.length > 1) resultsBox.append(correction);
      }
      const values = Object.values(feedback);
      announce(`${values.filter(value => value === 'correct').length} correct · ${values.filter(value => value === 'empty').length} unanswered${values.includes('review') ? ' · Some answers need teacher review' : ''}`);
    };
    if (!['presentation', 'writing', 'audio', 'rule-page', 'stage'].includes(def.kind)) {const check=button(uiLabels.check, () => {
      checkFeedback();
      if (config.syncChecks) { answers.__sw_checked = true; config.onChange?.(clone(answers)); }
    });check.classList.add('ek-check');check.setAttribute('aria-label','Check answers');actions.append(check);}
    if (!['presentation', 'audio', 'rule-page', 'stage'].includes(def.kind)) {
      const reset = button('', () => { closeDialog(); answers = {}; save(); render(); announce(''); }, 'ek-button ek-secondary ek-reset');
      const icon=doc.createElementNS('http://www.w3.org/2000/svg','svg');
      icon.setAttribute('viewBox','0 0 24 24');icon.setAttribute('aria-hidden','true');
      const line=doc.createElementNS('http://www.w3.org/2000/svg','path');
      line.setAttribute('d','M4 10a8 8 0 1 1 1 7M4 4v6h6');icon.append(line);reset.append(icon);
      reset.setAttribute('aria-label', 'Reset exercise'); reset.title = 'Reset exercise'; actions.append(reset);
    }

    const setAnswersCore = next => {
      answers = clone(next || {});
      clearFeedback();

      if (def.kind === 'stage') {
        const count = def.progressive ? Math.max(1, Math.min(def.exercises.length, Number(answers.revealed) || 1)) : def.exercises.length;
        if (count !== visibleCount) syncStage(count);
        def.exercises.forEach(block => nestedMountsByBlock.get(block.id)?.setAnswers(answers[block.id] || {}));
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

      if (def.kind === 'writing') {
        def.items.forEach(item => {
          const field = controls.get(item.id);
          if (!field) return;
          const value = answers[item.id] == null ? '' : String(answers[item.id]);
          if (field.value !== value) field.value = value;
        });
        return;
      }

      if (def.kind === 'gaps') {
        let canPatchWithoutRender = true;
        for (const [id, control] of controls.entries()) {
          const isTypedGap = control?.classList?.contains?.('ek-typed-gap');
          if (!isTypedGap) { canPatchWithoutRender = false; break; }
          const value = answers[id] == null ? '' : String(answers[id]);
          if (control.value !== value) control.value = value;
          control.style.width = `${Math.max(5, Math.min(28, value.length + 2))}ch`;
        }
        if (canPatchWithoutRender) return;
      }

      render();
    };
    const setAnswers = next => { setAnswersCore(next); if (config.syncChecks && answers.__sw_checked) checkFeedback(); };

    const renderReadOnly = () => {
      if (!config.readOnly) return;
      body.querySelectorAll('button,input,textarea,select').forEach(control => {
        if (control.closest('.ek-audio-player,.ek-repeat-audio')) return;
        control.disabled = true;
      });
      actions.querySelectorAll('button,input,textarea,select').forEach(control => { control.disabled = true; });
    };
    const originalRender = render;
    render = () => { const before=layoutSnapshot();originalRender();animateLayout(before); if(modern){status.hidden=true;resultsBox.hidden=true;} decorate(); renderReadOnly(); if (config.syncChecks && answers.__sw_checked) checkFeedback(); };

    host.addEventListener('keydown', onKeydown); doc.addEventListener('pointerdown', onOutside);
    host.addEventListener('click', dragClick, true);
    doc.addEventListener('pointermove', pointerMove, {passive:false});
    doc.addEventListener('pointerup', pointerEnd); doc.addEventListener('pointercancel', pointerEnd);
    render();
    return {
      getAnswers: () => clone(answers),
      setAnswers,
      destroy: () => { pointerDrag?.el.classList.remove('ek-dragging');pointerDrag = null;dragFlights.forEach(ghost=>ghost.remove());dragFlights.clear(); doc.removeEventListener('pointermove', pointerMove); doc.removeEventListener('pointerup', pointerEnd); doc.removeEventListener('pointercancel', pointerEnd); host.removeEventListener('click', dragClick, true); dismissInline(); doc.removeEventListener('pointerdown', onOutside); closeDialog(); nestedMounts.forEach(instance => instance.destroy()); nestedMounts = []; host.removeEventListener('keydown', onKeydown); host.querySelectorAll('audio,video').forEach(media => media.pause()); host.replaceChildren(); }
    };
  }
  const api = { validate, grade, mount, kinds, uiLabels, feedbackMessage, motion:{expand} };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else scope.SpaceWhaleExerciseKit = api;
})(typeof window !== 'undefined' ? window : globalThis);
