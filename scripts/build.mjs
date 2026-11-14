import {readdir,readFile,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {createHash} from 'node:crypto';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.txt':'text/plain; charset=utf-8'};
const assets={};
async function collect(dir,prefix='') {for(const entry of await readdir(dir,{withFileTypes:true})){if(entry.name.startsWith('.')||entry.name==='server')continue;const file=path.join(dir,entry.name),url=prefix+'/'+entry.name;if(entry.isDirectory())await collect(file,url);else if(types[path.extname(file)])assets[url]={content:await readFile(file,'utf8'),type:types[path.extname(file)]};}}
await collect(path.join(root,'dist'));
for(const required of ['/index.html','/app.js','/quiz.js','/pb20.js','/pb20.json','/account.js','/access.js','/home.js','/home.css','/i18n.js','/translation.js','/translation.css','/translations-zh.json','/admin.js','/admin.css','/data.json','/banks.json'])if(!assets[required])throw new Error('Missing '+required);
await mkdir(path.join(root,'dist/server'),{recursive:true});
const d=JSON.parse(assets['/data.json'].content),b=JSON.parse(assets['/banks.json'].content),pb=JSON.parse(assets['/pb20.json'].content);
const questions=[...d.questions,...b.st,...b.recaps,...pb.questions];
const translations=JSON.parse(assets['/translations-zh.json'].content);
if(translations.version!==1||translations.language!=='zh-Hans'||!translations.entries)throw new Error('Invalid Chinese translation bundle');
const sources=[...questions.flatMap(q=>[q.prompt,q.explanation,...q.choices.flatMap(c=>[c.text,c.feedback]),...(q.rationale?[q.rationale]:[])]),...pb.cases.flatMap(c=>[c.context,...c.scenario])];
for(const source of sources){const hash=createHash('sha256').update(source).digest('hex'),translation=translations.entries[hash];if(typeof translation!=='string'||!translation.trim())throw new Error('Missing Chinese translation for '+source.slice(0,100));}
const keys=Object.fromEntries(questions.map(q=>[q.id,{answer:q.answer,options:q.choices.length,bank:q.bank||'ib400',lesson:q.lesson,prompt:q.prompt,choices:q.choices.map(c=>c.text),revision:d.revision}]));
await writeFile(path.join(root,'dist/server/index.js'),'const ASSETS = '+JSON.stringify(assets)+';\nconst QUESTION_KEYS = '+JSON.stringify(keys)+';\n'+await readFile(path.join(root,'worker/index.js'),'utf8'));
console.log('Built public homepage, protected study assets and private account API. '+Object.keys(assets).length+' assets; Chinese coverage verified for '+questions.length+' questions and '+pb.cases.length+' case briefs.');
