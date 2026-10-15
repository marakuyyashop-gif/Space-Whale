/* Shared teacher descriptions: plain topics, gently emphasized language labels. */
(function(root){
'use strict';
const namedLanguage=[
 'Present Simple','Present Continuous','Past Simple','Present Perfect','Future Simple',
 'indefinite pronouns','object pronouns','subject pronouns','possessive determiners',
 'possessive pronouns','possessive adjectives','regular plurals','irregular plurals',
 'countable and uncountable nouns','countable/uncountable nouns','frequency adverbs',
 'adverbs of frequency','adverbs of place','place prepositions','time prepositions',
 'imperatives','ordinal numbers','articles','conditionals','second conditional',
 'be going to','there is/are','there is','there are','look/look like','look like',
 'look for/find','look for','have/has','do/does','can/can’t','will/won’t',
 'What is… like?','What does… look like?','Why don’t we…?','How about','What about',
 'Let’s','I’d like','could','would','can','will','be'
];
function parts(value){
 if(value&&typeof value==='object')return {summary:String(value.summary||value.topics||''),language:Array.isArray(value.language)?value.language.join('; '):String(value.language||'')};
 const text=String(value||''),match=/\s+(?:Main language|Language|Grammar):\s*/i.exec(text);
 return match?{summary:text.slice(0,match.index).trim(),language:text.slice(match.index+match[0].length).replace(/\.$/,'').trim()}:{summary:text,language:''};
}
function terms(value){return (Array.isArray(value)?value:String(value||'').split(/;\s*/)).map(text=>String(text).trim().replace(/\.$/,'')).filter(Boolean);}
function escape(value){return value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}
function appendText(parent,text,language){
 const doc=parent.ownerDocument,copy=String(text||'');
 const labels=[...new Set([...terms(language),...namedLanguage])].sort((a,b)=>b.length-a.length);
 const expression=new RegExp('(?<![A-Za-z])(?:'+labels.map(escape).join('|')+')(?![A-Za-z])','gi');
 let last=0;for(const match of copy.matchAll(expression)){
  if(match.index>last)parent.append(doc.createTextNode(copy.slice(last,match.index)));
  const term=doc.createElement('span');term.className='workspace-grammar-term';term.textContent=match[0];parent.append(term);last=match.index+match[0].length;
 }
 if(last<copy.length)parent.append(doc.createTextNode(copy.slice(last)));
 return parent;
}
function appendDescription(parent,value){
 const doc=parent.ownerDocument,{summary,language}=parts(value);
 if(summary){const topic=doc.createElement('span');topic.className='workspace-description-topic';topic.textContent=summary;parent.append(topic);}
 const groups=terms(language);
 if(groups.length){
  const line=doc.createElement('span');line.className='workspace-description-language';
  const label=doc.createElement('span');label.className='workspace-description-label';label.textContent='Language: ';line.append(label);
  groups.forEach((text,index)=>{if(index)line.append(doc.createTextNode(' · '));const term=doc.createElement('span');term.className='workspace-grammar-term';term.textContent=text;line.append(term);});parent.append(line);
 }
 return parent;
}
function appendAim(parent,text,language){
 const doc=parent.ownerDocument,aim=doc.createElement('span');aim.className='workspace-block-aim';
 const label=doc.createElement('span');label.className='workspace-aim-label';label.textContent='Aim: ';aim.append(label);
 appendText(aim,text,language);parent.append(aim);return aim;
}
const api={parts,terms,appendText,appendDescription,appendAim};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.SpaceWhaleTeacherCopy=api;
})(typeof window==='undefined'?globalThis:window);
