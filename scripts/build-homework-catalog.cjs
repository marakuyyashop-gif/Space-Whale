const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'..'),kit=require('../exercise-kit.js'),app={SpaceWhaleExerciseKit:kit,SpaceWhaleHomeworkA21:require('../homework-a21.js')};
for(const file of ['course-content.js','course-content-module4-34.js','course-content-module4-45.js','course-content-smy-a21.js','course-content-directions-a21.js'])vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8'),{window:app});
const catalog=require('../workspace-catalog.js').createCatalog(app.SpaceWhaleContent,[]);
let packs=require('../homework-content.js').build(app.SpaceWhaleContent,catalog,require('../homework-translations.js'),require('../homework-a21.js'));
if(process.argv.includes('--a21'))packs=packs.filter(p=>p.level==='A2.1');
function validateMedia(value){
 if(!value||typeof value!=='object')return;
 for(const [key,entry] of Object.entries(value)){
  if(['image','audio','exampleAudio'].includes(key)&&typeof entry==='string'&&!/^https?:/.test(entry)){
   if(!fs.existsSync(path.resolve(root,entry)))throw Error('Missing homework media: '+entry);
  }else validateMedia(entry);
 }
}
for(const p of packs){p.steps.forEach(s=>kit.validate(s.exercise));validateMedia(p);}
if(process.argv.includes('--sql')){const quote=s=>"'"+s.replace(/'/g,"''")+"'";console.log(packs.map(p=>`insert into homework_private.templates(lesson_id,definition) values (${quote(p.id)},${quote(JSON.stringify(p))}::jsonb) on conflict(lesson_id) do update set definition=excluded.definition;`).join('\n'));}
else console.log(JSON.stringify(packs,null,2));
