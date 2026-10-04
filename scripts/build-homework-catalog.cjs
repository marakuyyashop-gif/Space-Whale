const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'..'),kit=require('../exercise-kit.js'),app={SpaceWhaleExerciseKit:kit};
for(const file of ['course-content.js','course-content-module4-34.js','course-content-module4-45.js'])vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8'),{window:app});
const catalog=require('../workspace-catalog.js').createCatalog(app.SpaceWhaleContent,[]);
const packs=require('../homework-content.js').build(app.SpaceWhaleContent,catalog,require('../homework-translations.js'));
for(const p of packs){p.steps.forEach(s=>kit.validate(s.exercise));}
if(process.argv.includes('--sql')){const quote=s=>"'"+s.replace(/'/g,"''")+"'";console.log(packs.map(p=>`insert into homework_private.templates(lesson_id,definition) values (${quote(p.id)},${quote(JSON.stringify(p))}::jsonb) on conflict(lesson_id) do update set definition=excluded.definition;`).join('\n'));}
else console.log(JSON.stringify(packs,null,2));
