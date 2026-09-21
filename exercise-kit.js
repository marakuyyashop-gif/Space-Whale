(function (scope) {
  'use strict';
  const kinds = ['matching', 'gaps', 'choice', 'image-label', 'order', 'sort', 'writing', 'presentation', 'audio', 'rule-page'];
  const normalize = value => String(value ?? '').normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('en');
  const clone = value => JSON.parse(JSON.stringify(value));
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
    if (def.kind === 'presentation') {
      array(def.blocks, 'blocks');
      def.blocks.forEach(block => {
        if (!['text', 'image', 'disclosure'].includes(block.type)) fail('Unsupported presentation block');
        if (block.type === 'image') { text(block.image, 'image'); media(block); }
        else { text(block.text, 'block text'); if (block.type === 'disclosure') text(block.title, 'disclosure title'); }
      });
      return def;
    }
    if (def.kind === 'audio') {
      if (def.layout != null && !['player', 'listen-repeat'].includes(def.layout)) fail('Unsupported audio layout');
      if (def.layout === 'listen-repeat') {
        ids(def.items, 'items');
        def.items.forEach(item => {
          text(item.text, 'listen-repeat text');
          if (item.audio != null) audioSource(item.audio);
          else if (!def.audioPending) fail('Listen & Repeat item needs audio unless audioPending is true');
          if (item.example != null && typeof item.example !== 'string') fail('listen-repeat example must be text');
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
          text(block.image, 'image');
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
        if (def.layout === 'picture-word' && !item.image) fail('Picture-word items need images');
        key(item, valid);
        if (item.correctId != null) {
          if (assigned.has(item.correctId)) fail('Matching answer IDs must be unique');
          assigned.add(item.correctId);
        }
      });
      if (def.options.length < def.items.length) fail('Matching needs at least one option per card');
    }
    if (def.kind === 'choice') { if (def.layout != null && !['list', 'image-grid', 'dropdown'].includes(def.layout)) fail('Unsupported choice layout'); def.items.forEach(item => { text(item.prompt, 'prompt'); key(item, options(item.options)); }); }
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
          const choices = segment.options || def.bank;
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
    if (def.kind === 'presentation' || def.kind === 'audio' || def.kind === 'rule-page') return results;
    if (def.kind === 'order') {
      const order = Array.isArray(answers.order) ? answers.order : [];
      mark('order', order.length === def.tokens.length, def.correctOrder ? JSON.stringify(order) === JSON.stringify(def.correctOrder) : null);
    } else if (def.kind === 'gaps') {
      def.items.forEach(item => item.segments.forEach(segment => {
        if (typeof segment === 'string') return;
        const value = normalize(answers[segment.id]);
        mark(segment.id, !!value, segment.answers ? segment.answers.some(answer => normalize(answer) === value) : null);
      }));
    } else {
      def.items.forEach(item => {
        const value = answers[item.id];
        mark(item.id, value != null && String(value).trim() !== '', def.kind === 'writing' || item.correctId == null ? null : value === item.correctId);
      });
    }
    return results;
  }
  function mount(host, definition, config = {}) {
    validate(definition);
    const def = clone(definition);
    if (config.discovery && def.kind === 'choice' && def.layout !== 'image-grid') def.layout = 'dropdown';
    let answers = clone(config.answers || {});
    let feedback = {};
    const doc = host.ownerDocument;
    let dialog;
    let trigger;
    let closeInline;
    const dismissInline = () => { closeInline?.(); closeInline = null; };
    const onOutside = event => { if (!event.target.closest?.('.ek-inline-choice')) dismissInline(); };
    const controls = new Map();
    let nestedMounts = [];
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
      const wrap = node('div', 'ek-audio-player');
      const audio = node('audio'); audio.preload = 'metadata'; audio.src = src; audio.setAttribute('aria-label', label);
      const play = button('▶', async () => {
        if (audio.paused) {
          try { await audio.play(); } catch { announce('Audio could not be played.'); }
        } else audio.pause();
      }, 'ek-audio-play');
      play.setAttribute('aria-label', 'Play audio');
      const range = node('input', 'ek-audio-range'); range.type = 'range'; range.min = '0'; range.max = '100'; range.step = '0.1'; range.value = '0'; range.setAttribute('aria-label', 'Audio position');
      const time = node('span', 'ek-audio-time', '0:00 / 0:00');
      const sync = () => {
        const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
        const current = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
        range.value = duration ? String((current / duration) * 100) : '0';
        time.textContent = `${formatTime(current)} / ${formatTime(duration)}`;
      };
      audio.addEventListener('play', () => { play.textContent = '❚❚'; play.setAttribute('aria-label', 'Pause audio'); });
      audio.addEventListener('pause', () => { play.textContent = '▶'; play.setAttribute('aria-label', 'Play audio'); });
      audio.addEventListener('ended', () => { play.textContent = '▶'; play.setAttribute('aria-label', 'Play audio'); sync(); });
      audio.addEventListener('loadedmetadata', sync);
      audio.addEventListener('timeupdate', sync);
      range.addEventListener('input', () => {
        if (Number.isFinite(audio.duration) && audio.duration > 0) audio.currentTime = (Number(range.value) / 100) * audio.duration;
      });
      wrap.append(audio, play, range, time);
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
    const announce = message => { status.textContent = message; };
    const save = () => { feedback = {}; config.onChange?.(clone(answers)); };
    const closeDialog = () => { if (dialog?.open) dialog.close(); };
    const onKeydown = event => { if (event.key === 'Escape') { closeDialog(); dismissInline(); } };
    host.classList.add('exercise-kit');
    host.classList.toggle('ek-reading-width', def.kind === 'gaps');
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
    function popover(item, available, selected, onPick, opener) {
      trigger = opener;
      dialog = node('dialog', 'ek-dialog');
      dialog.setAttribute('aria-label', def.title);
      dialog.append(button('Close ×', () => dialog.close(), 'ek-close'), node('h3', 'ek-title', def.title));
      const prompt = node('div', 'ek-prompt', item.text);
      if (item.image) prompt.prepend(illustration(item));
      dialog.append(prompt);
      const choices = node('div', 'ek-options');
      available.forEach(option => {
        const choice = button(option.text, () => { onPick(option.id); dialog.close(); }, 'ek-option');
        if (option.image) choice.prepend(illustration(option));
        choice.setAttribute('aria-pressed', String(selected === option.id));
        choices.append(choice);
      });
      dialog.append(choices);
      if (selected) dialog.append(button('Clear selection', () => { onPick(''); dialog.close(); }));
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
      nestedMounts.forEach(instance => instance.destroy()); nestedMounts = [];
      body.replaceChildren(); controls.clear(); resultsBox.replaceChildren();
      if (def.kind === 'presentation') {
        def.blocks.forEach(block => {
          if (block.type === 'image') body.append(illustration(block));
          else if (block.type === 'disclosure') { const detail = node('details', 'ek-disclosure'); detail.append(node('summary', '', block.title), node('p', 'ek-copy', block.text)); body.append(detail); }
          else body.append(node('p', 'ek-copy', block.text));
        });
      }
      if (def.kind === 'rule-page') {
        const page = node('div', 'ek-rule-page');
        def.blocks.forEach((block, index) => {
          if (block.type === 'text') {
            const section = node('section', 'ek-rule-section ek-rule-text-section');
            if (block.title) section.append(node('h3', 'ek-rule-section-title', block.title));
            section.append(richText(block.text, block.highlights));
            page.append(section);
          }
          if (block.type === 'rule') {
            const section = node('section', 'ek-rule-section ek-rule-block');
            if (block.title) section.append(node('h3', 'ek-rule-section-title', block.title));
            if (block.text) section.append(richText(block.text, block.highlights));
            if (block.formula) section.append(node('div', 'ek-rule-formula', block.formula));
            if (block.examples?.length) {
              const examples = node('div', 'ek-rule-examples');
              block.examples.forEach(example => examples.append(node('p', 'ek-rule-example', example)));
              section.append(examples);
            }
            page.append(section);
          }
          if (block.type === 'image') {
            const figure = node('figure', 'ek-rule-visual');
            figure.append(illustration(block));
            if (block.caption) figure.append(node('figcaption', 'ek-muted', block.caption));
            page.append(figure);
          }
          if (block.type === 'exercise') {
            const section = node('section', 'ek-discovery-block');
            const child = node('div', 'ek-discovery-host');
            section.append(child);
            page.append(section);
            const handle = mount(child, block.exercise, {
              discovery: true,
              answers: answers[block.id] || {},
              onChange: value => {
                answers[block.id] = value;
                save();
              }
            });
            nestedMounts.push(handle);
          }
        });
        body.append(page);
      }
      if (def.kind === 'audio') {
        if (def.layout === 'listen-repeat') {
          const list = node('div', 'ek-repeat-list');
          def.items.forEach(item => {
            const row = node('article', 'ek-repeat-item');
            row.append(repeatAudioButton(item.audio, item.text), node('strong', 'ek-repeat-term', item.text));
            if (item.example) row.append(node('p', 'ek-repeat-example', item.example));
            list.append(row);
          });
          body.append(list);
        } else {
          body.append(audioPlayer(def.audio, def.title));
        }
      }
      if (def.kind === 'matching') {
        const pictureWord = def.layout === 'picture-word';
        const grid = node('div', pictureWord ? 'ek-card-grid ek-picture-word-grid' : 'ek-card-grid');
        def.items.forEach((item, index) => {
          const card = node('article', pictureWord ? 'ek-card ek-picture-word-card' : 'ek-card');
          const number = node('span', pictureWord ? 'ek-number ek-picture-number' : 'ek-number', String(index + 1));
          card.append(number);
          if (item.image) card.append(illustration(item));
          if (!pictureWord) card.append(node('p', 'ek-card-label', item.text));
          const chosen = () => def.options.find(option => option.id === answers[item.id]);
          const plus = button(chosen()?.text || '+', () => {
            const taken = new Set(Object.entries(answers).filter(([id]) => id !== item.id).map(([,value]) => value));
            popover(item, def.options.filter(option => !taken.has(option.id)), answers[item.id], value => {
              changed(item.id, value); plus.textContent = chosen()?.text || '+';
              plus.setAttribute('aria-label', `Choose a match for ${item.text}${chosen() ? `: ${chosen().text}` : ''}`);
            }, plus);
          }, pictureWord ? 'ek-match-slot ek-picture-word-slot' : 'ek-match-slot');
          plus.setAttribute('aria-label', `Choose a match for ${item.text}`); plus.setAttribute('aria-haspopup', 'dialog');
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
          if (def.layout !== 'paragraph') row.append(node('span', 'ek-sentence-number', `${index + 1}. `));
          item.segments.forEach(segment => {
            if (typeof segment === 'string') { row.append(doc.createTextNode(segment)); return; }
            gapNumber += 1;
            const number = gapNumber;
            const label = `Sentence ${index + 1}, gap ${segment.id}`;
            const options = def.inputMode === 'text' ? null : segment.options || def.bank;
            if (options) {
              const wrap = node('span', 'ek-inline-choice');
              const menu = node('span', 'ek-inline-menu'); menu.hidden = true;
              menu.setAttribute('role', 'group'); menu.setAttribute('aria-label', `Options for ${label}`);
              const paint = () => {
                opener.replaceChildren(node('span', 'ek-gap-number', String(number)), doc.createTextNode(answers[segment.id] || '\u00a0'));
                opener.setAttribute('aria-label', `${label}: ${answers[segment.id] || 'choose an answer'}`);
              };
              const shut = () => { menu.hidden = true; opener.setAttribute('aria-expanded', 'false'); };
              const opener = button('', () => {
                if (!menu.hidden) { dismissInline(); return; }
                dismissInline(); menu.hidden = false; opener.setAttribute('aria-expanded', 'true');
                closeInline = shut;
                menu.querySelector('button')?.focus();
              }, 'ek-gap ek-choice-trigger');
              opener.setAttribute('aria-expanded', 'false');
              options.forEach((value, optionIndex) => {
                const option = button('', () => { changed(segment.id, value); paint(); dismissInline(); opener.focus(); }, 'ek-inline-option');
                option.append(node('span', 'ek-gap-number', String(optionIndex + 1)), doc.createTextNode(value));
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
            controls.set(segment.id, field); row.append(field);
          }); body.append(row);
        });
      }
      if (def.kind === 'choice') def.items.forEach((item, index) => {
        if (def.layout === 'dropdown') {
          const row = node('label', 'ek-discovery-choice');
          row.append(doc.createTextNode(`${index + 1}. ${item.prompt} `));
          const select = node('select', 'ek-gap ek-discovery-select');
          select.setAttribute('aria-label', item.prompt);
          const empty = node('option', '', '…'); empty.value = ''; select.append(empty);
          item.options.forEach(option => { const el = node('option', '', option.text); el.value = option.id; select.append(el); });
          select.value = answers[item.id] || '';
          select.addEventListener('change', () => changed(item.id, select.value));
          row.append(select); body.append(row); return;
        }
        const group = node('fieldset', def.layout === 'image-grid' ? 'ek-question ek-image-choice' : 'ek-question'); group.append(node('legend', '', `${index + 1}. ${item.prompt}`));
        item.options.forEach(option => {
          const label = node('label', def.layout === 'image-grid' ? 'ek-radio ek-image-choice-option' : 'ek-radio'); const input = node('input'); input.type = 'radio'; input.name = `${def.id}-${item.id}`; input.value = option.id; input.checked = answers[item.id] === option.id;
          input.addEventListener('change', () => changed(item.id, option.id));
          label.append(input, node('span', '', option.text)); if (option.image) label.append(illustration(option)); group.append(label);
        }); body.append(group); controls.set(item.id, group);
      });
      if (def.kind === 'image-label') {
        const wrap = node('div', 'ek-image-label-wrap');
        const stage = node('div', 'ek-image-label-stage');
        const image = illustration({ image: def.image, alt: def.alt });
        image.classList.add('ek-image-label-image');
        stage.append(image);
        def.items.forEach((item, index) => {
          const chosen = () => def.options.find(option => option.id === answers[item.id]);
          const target = button(chosen()?.text || '+', () => {
            const taken = new Set(Object.entries(answers).filter(([id]) => id !== item.id).map(([,value]) => value));
            popover(
              { text: item.prompt || `Target ${index + 1}` },
              def.options.filter(option => !taken.has(option.id)),
              answers[item.id],
              value => {
                changed(item.id, value);
                target.textContent = chosen()?.text || '+';
                target.setAttribute('aria-label', `${item.prompt || `Target ${index + 1}`}${chosen() ? `: ${chosen().text}` : ''}`);
              },
              target
            );
          }, 'ek-image-label-target');
          target.style.left = `${item.x}%`;
          target.style.top = `${item.y}%`;
          target.setAttribute('aria-label', item.prompt || `Choose label for target ${index + 1}`);
          target.setAttribute('aria-haspopup', 'dialog');
          controls.set(item.id, target);
          stage.append(target);
        });
        const bank = node('div', 'ek-image-label-bank');
        def.options.forEach(option => bank.append(node('span', 'ek-token', option.text)));
        wrap.append(stage, bank);
        body.append(wrap);
      }
      if (def.kind === 'order') {
        if (def.source?.text) body.append(richText(def.source.text));
        if (def.source?.audio) body.append(audioPlayer(def.source.audio, 'Listening'));
        const picked = Array.isArray(answers.order) ? answers.order.filter(id => def.tokens.some(token => token.id === id)) : [];
        const imageMode = def.layout === 'image-grid';
        const ordered = node('div', imageMode ? 'ek-order-target ek-order-images-target' : 'ek-order-target');
        ordered.setAttribute('aria-label', imageMode ? 'Your picture order' : 'Your sentence');
        if (!picked.length) ordered.append(node('span', 'ek-muted', imageMode ? 'Choose the pictures below in order.' : 'Choose the words below in order.'));
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
        picked.forEach((id, index) => {
          const token = def.tokens.find(item => item.id === id);
          ordered.append(tokenButton(token, () => { changed('order', picked.filter((_, position) => position !== index)); render(); }, index));
        });
        const bank = node('div', imageMode ? 'ek-bank ek-order-image-bank' : 'ek-bank');
        def.tokens.filter(token => !picked.includes(token.id)).forEach((token, index) => bank.append(tokenButton(token, () => { changed('order', [...picked, token.id]); render(); }, index)));
        body.append(ordered, bank); controls.set('order', ordered);
      }
      if (def.kind === 'sort') {
        const bank = node('div', 'ek-bank'); const groups = node('div', 'ek-group-grid');
        const itemButton = item => {
          const b = button(item.text, () => popover(item, def.groups, answers[item.id], value => { changed(item.id, value); render(); }, b), 'ek-token');
          b.setAttribute('aria-label', `Choose group for ${item.text}`); return b;
        };
        def.groups.forEach(group => {
          const box = node('section', 'ek-sort-group'); box.append(node('h3', '', group.text));
          def.items.filter(item => answers[item.id] === group.id).forEach(item => box.append(itemButton(item))); groups.append(box);
        });
        def.items.filter(item => !answers[item.id]).forEach(item => bank.append(itemButton(item)));
        body.append(groups, bank);
      }
      if (def.kind === 'writing') def.items.forEach((item, index) => {
        const label = node('label', 'ek-writing', `${index + 1}. ${item.prompt}`);
        const input = node('textarea'); input.rows = 3; input.value = answers[item.id] || ''; input.addEventListener('input', () => changed(item.id, input.value)); label.append(input); body.append(label); controls.set(item.id, input);
      });
    }
    if (!['presentation', 'writing', 'audio', 'rule-page'].includes(def.kind)) actions.append(button('Check', () => {
      feedback = grade(def, answers);
      const labels = { correct: '✓ Correct', retry: 'Try again', empty: 'Not answered yet', review: 'Teacher review' };
      resultsBox.replaceChildren();
      Object.entries(feedback).forEach(([id, result], index) => { resultsBox.append(node('li', '', `${index + 1}. ${labels[result]}`)); });
      const values = Object.values(feedback);
      announce(`${values.filter(value => value === 'correct').length} correct · ${values.filter(value => value === 'empty').length} unanswered${values.includes('review') ? ' · Some answers need teacher review' : ''}`);
    }));
    if (!['presentation', 'audio', 'rule-page'].includes(def.kind)) {
      const reset = button('↻', () => { closeDialog(); answers = {}; save(); render(); announce(''); }, 'ek-button ek-secondary ek-reset');
      reset.setAttribute('aria-label', 'Reset exercise'); reset.title = 'Reset exercise'; actions.append(reset);
    }

    host.addEventListener('keydown', onKeydown); doc.addEventListener('pointerdown', onOutside); render();
    return {
      getAnswers: () => clone(answers),
      destroy: () => { dismissInline(); doc.removeEventListener('pointerdown', onOutside); closeDialog(); nestedMounts.forEach(instance => instance.destroy()); nestedMounts = []; host.removeEventListener('keydown', onKeydown); host.querySelectorAll('audio,video').forEach(media => media.pause()); host.replaceChildren(); }
    };
  }
  const api = { validate, grade, mount, kinds };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else scope.SpaceWhaleExerciseKit = api;
})(typeof window !== 'undefined' ? window : globalThis);
