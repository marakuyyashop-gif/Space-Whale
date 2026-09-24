/* Per-field Lamport registers: unrelated concurrent answers merge; same-field edits resolve consistently. */
(function(root) {
  const copy = value => JSON.parse(JSON.stringify(value));
  const safe = path => Array.isArray(path) && path.length && path.length < 20 && path.every(k => typeof k === 'string' && !['__proto__','prototype','constructor'].includes(k));
  function flatten(value, path = [], out = {}) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      for (const key of Object.keys(value)) if (safe([...path,key])) flatten(value[key],[...path,key],out);
    } else if (path.length) out[JSON.stringify(path)] = value;
    return out;
  }
  function create(id) {
    let clock = 0; const entries = {};
    const snapshot = () => ({__sw_collab:1,entries:copy(entries)});
    const answers = () => {
      const result = {};
      for (const [key,e] of Object.entries(entries)) {
        if (e.deleted) continue;
        const path = JSON.parse(key); let target = result;
        for (const part of path.slice(0,-1)) target = target[part] ||= {};
        target[path.at(-1)] = copy(e.value);
      }
      return result;
    };
    const merge = data => {
      if (data?.__sw_collab !== 1) return false;
      let changed = false;
      for (const [key,e] of Object.entries(data.entries || {})) {
        let path; try { path=JSON.parse(key); } catch { continue; }
        if (!safe(path) || !Number.isSafeInteger(e?.clock) || e.clock < 0 || typeof e.actor !== 'string') continue;
        clock = Math.max(clock,e.clock);
        const old=entries[key];
        if (!old || e.clock > old.clock || (e.clock === old.clock && e.actor > old.actor)) { entries[key]=copy(e);changed=true; }
      }
      return changed;
    };
    const update = value => {
      const before=flatten(answers()), after=flatten(value); clock++;
      for (const key of new Set([...Object.keys(before),...Object.keys(after)])) {
        if (JSON.stringify(before[key]) === JSON.stringify(after[key])) continue;
        entries[key] = key in after ? {clock,actor:id,value:after[key]} : {clock,actor:id,deleted:true};
      }
      return snapshot();
    };
    return {snapshot,answers,merge,update};
  }
  const api={create}; if (typeof module!=='undefined') module.exports=api; else root.SpaceWhaleCollaboration=api;
})(typeof window==='undefined'?globalThis:window);
