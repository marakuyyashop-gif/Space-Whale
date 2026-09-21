(function (scope) {
  'use strict';
  const kinds = ['matching', 'gaps', 'choice', 'image-label', 'order', 'sort', 'writing', 'presentation'];
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
      }
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
    if (def.kind === 'order') {
      const valid = options(def.tokens);
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
      const valid = options(def.options);
      const assigned = new Set();
      def.items.forEach(item => { text(item.text, 'card text'); media(item); key(item, valid); if (item.correctId != null) { if (assigned.has(item.correctId)) fail('Matching answer IDs must be unique'); assigned.add(item.correctId); } });
      if (def.options.length < def.items.length) fail('Matching needs at least one option per card');
    }
    if (def.kind === 'choice') { if (def.layout != null && !['list', 'image-grid'].includes(def.layout)) fail('Unsupported choice layout'); def.items.forEach(item => { text(item.prompt, 'prompt'); key(item, options(item.options)); }); }
    if (def.kind === 'sort') {
      const valid = options(def.groups);
      def.items.forEach(item => { text(item.text, 'item text'); key(item, valid); });
    }
    if (def.kind === 'writing') def.items.forEach(item => text(item.prompt, 'prompt'));
    if (def.kind === 'gaps') {
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
    if (def.kind === 'presentation') return results;
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
    let answers = clone(config.answers || {});
    let feedback = {};
    const doc = host.ownerDocument;
    let dialog;
    let trigger;
    const controls = new Map();
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
      const image = node('img', 'ek-image'); image.src = item.image; image.alt = item.alt || item.text || ''; image.loading = 'lazy'; return image;
    };
    const announce = message => { status.textContent = message; };
    const save = () => { feedback = {}; config.onChange?.(clone(answers)); };
    const closeDialog = () => { if (dialog?.open) dialog.close(); };
    const onKeydown = event => { if (event.key === 'Escape') closeDialog(); };
    host.classList.add('exercise-kit');
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
    function render() {
      body.replaceChildren(); controls.clear(); resultsBox.replaceChildren();
      if (def.kind === 'presentation') {
        def.blocks.forEach(block => {
          if (block.type === 'image') body.append(illustration(block));
          else if (block.type === 'disclosure') { const detail = node('details', 'ek-disclosure'); detail.append(node('summary', '', block.title), node('p', 'ek-copy', block.text)); body.append(detail); }
          else body.append(node('p', 'ek-copy', block.text));
        });
      }
      if (def.kind === 'matching') {
        const grid = node('div', 'ek-card-grid');
        def.items.forEach((item, index) => {
          const card = node('article', 'ek-card');
          card.append(node('span', 'ek-number', String(index + 1)));
          if (item.image) card.append(illustration(item));
          card.append(node('p', 'ek-card-label', item.text));
          const chosen = () => def.options.find(option => option.id === answers[item.id]);
          const plus = button(chosen()?.text || '+', () => {
            const taken = new Set(Object.entries(answers).filter(([id]) => id !== item.id).map(([,value]) => value));
            popover(item, def.options.filter(option => !taken.has(option.id)), answers[item.id], value => {
              changed(item.id, value); plus.textContent = chosen()?.text || '+';
              plus.setAttribute('aria-label', `Choose a match for ${item.text}${chosen() ? `: ${chosen().text}` : ''}`);
            }, plus);
          }, 'ek-match-slot');
          plus.setAttribute('aria-label', `Choose a match for ${item.text}`); plus.setAttribute('aria-haspopup', 'dialog');
          controls.set(item.id, plus); card.append(plus); grid.append(card);
        });
        body.append(grid);
      }
      if (def.kind === 'gaps') {
        if (def.bank) {
          const bank = node('div', 'ek-bank'); bank.append(node('strong', '', 'Words to use: '));
          def.bank.forEach(word => bank.append(node('span', 'ek-token', word))); body.append(bank);
        }
        def.items.forEach((item, index) => {
          const row = node('p', 'ek-sentence'); row.append(node('span', 'ek-number', `${index + 1}. `));
          item.segments.forEach(segment => {
            if (typeof segment === 'string') { row.append(doc.createTextNode(segment)); return; }
            const options = segment.options || def.bank;
            const field = node(options ? 'select' : 'input', 'ek-gap');
            if (options) {
              const empty = node('option', '', '…'); empty.value = ''; field.append(empty);
              options.forEach(value => { const option = node('option', '', value); option.value = value; field.append(option); });
            } else { field.type = 'text'; field.autocomplete = 'off'; field.spellcheck = false; }
            field.setAttribute('aria-label', `Sentence ${index + 1}, gap ${segment.id}`);
            field.value = answers[segment.id] || '';
            field.addEventListener(options ? 'change' : 'input', () => changed(segment.id, field.value));
            controls.set(segment.id, field); row.append(field);
          }); body.append(row);
        });
      }
      if (def.kind === 'choice') def.items.forEach((item, index) => {
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
        const picked = Array.isArray(answers.order) ? answers.order.filter(id => def.tokens.some(token => token.id === id)) : [];
        const ordered = node('div', 'ek-order-target'); ordered.setAttribute('aria-label', 'Your sentence');
        if (!picked.length) ordered.append(node('span', 'ek-muted', 'Choose the words below in order.'));
        picked.forEach((id, index) => { const token = def.tokens.find(item => item.id === id); ordered.append(button(token.text, () => { changed('order', picked.filter((_, position) => position !== index)); render(); }, 'ek-token')); });
        const bank = node('div', 'ek-bank');
        def.tokens.filter(token => !picked.includes(token.id)).forEach(token => bank.append(button(token.text, () => { changed('order', [...picked, token.id]); render(); }, 'ek-token')));
        body.append(ordered, bank, node('p', 'ek-muted', 'Click a chosen word to return it to the bank.')); controls.set('order', ordered);
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
        body.append(groups, bank, node('p', 'ek-muted', 'Click a card to choose or change its group.'));
      }
      if (def.kind === 'writing') def.items.forEach((item, index) => {
        const label = node('label', 'ek-writing', `${index + 1}. ${item.prompt}`);
        const input = node('textarea'); input.rows = 3; input.value = answers[item.id] || ''; input.addEventListener('input', () => changed(item.id, input.value)); label.append(input); body.append(label); controls.set(item.id, input);
      });
    }
    if (!['presentation', 'writing'].includes(def.kind)) actions.append(button('Check', () => {
      feedback = grade(def, answers);
      const labels = { correct: '✓ Correct', retry: 'Try again', empty: 'Not answered yet', review: 'Teacher review' };
      resultsBox.replaceChildren();
      Object.entries(feedback).forEach(([id, result], index) => { resultsBox.append(node('li', '', `${index + 1}. ${labels[result]}`)); });
      const values = Object.values(feedback);
      announce(`${values.filter(value => value === 'correct').length} correct · ${values.filter(value => value === 'empty').length} unanswered${values.includes('review') ? ' · Some answers need teacher review' : ''}`);
    }));
    if (def.kind !== 'presentation') actions.append(button('Reset this exercise', () => { closeDialog(); answers = {}; save(); render(); announce('Exercise reset.'); }, 'ek-button ek-secondary'));
    if (def.kind === 'writing') announce('Open answer: reviewed by the teacher, not automatically graded.');
    host.addEventListener('keydown', onKeydown); render();
    return {
      getAnswers: () => clone(answers),
      destroy: () => { closeDialog(); host.removeEventListener('keydown', onKeydown); host.querySelectorAll('audio,video').forEach(media => media.pause()); host.replaceChildren(); }
    };
  }
  const api = { validate, grade, mount, kinds };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else scope.SpaceWhaleExerciseKit = api;
})(typeof window !== 'undefined' ? window : globalThis);
