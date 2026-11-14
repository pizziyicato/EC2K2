// Sites dispatch authenticates visitors and supplies the identity headers.
// The build prepends ASSETS; public shell and protected study content are served separately.
const MAX_BYTES = 1500000;
const json = (data, status = 200) => new Response(JSON.stringify(data), {
 status, headers: {'Content-Type':'application/json; charset=utf-8','Cache-Control':'private, no-store','Vary':'Cookie','X-Content-Type-Options':'nosniff'}
});
function identity(request) {
 const id = request.headers.get('oai-authenticated-user-id');
 const email = request.headers.get('oai-authenticated-user-email');
 if (!id || !email) return null;
 let name = request.headers.get('oai-authenticated-user-full-name');
 if (name && request.headers.get('oai-authenticated-user-full-name-encoding') === 'percent-encoded-utf-8') {
  try { name = decodeURIComponent(name); } catch { name = null; }
 }
 return {id, email:email.trim().slice(0,254), name:(name || 'EC2K2 learner').slice(0,80)};
}
async function readJSON(request) {
 if (!(request.headers.get('Content-Type') || '').startsWith('application/json')) throw new Error('type');
 if (Number(request.headers.get('Content-Length')) > MAX_BYTES) throw new Error('size');
 const reader=request.body?.getReader();if(!reader)throw new Error('json');
 const chunks=[];let size=0;
 while(true){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>MAX_BYTES){await reader.cancel();throw new Error('size')}chunks.push(value)}
 const bytes=new Uint8Array(size);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length}
 return JSON.parse(new TextDecoder().decode(bytes));
}
function cleanState(s) {
 if(!s||s.version!==2||!s.answers||typeof s.answers!=='object'||Array.isArray(s.answers)||!Array.isArray(s.bookmarks)||!Array.isArray(s.understood))throw new Error('state');
 if(Object.keys(s.answers).length>1500||s.bookmarks.length>1500||s.understood.length>500)throw new Error('state');
 return {version:2,answers:s.answers,bookmarks:s.bookmarks,understood:s.understood,walks:s.walks&&typeof s.walks==='object'?s.walks:{},session:s.session||null,contentRevision:typeof s.contentRevision==='string'?s.contentRevision.slice(0,100):null};
}
const CONSENT='2026-11-14-activity-v1';
const EVENT_TYPES=new Set(['page_view','question_view','answer','option_select','option_crossout','confidence','redo_question','session_start','session_finish','bookmark','concept_mark','walk_step','walk_prediction','progress_import','guest_import','progress_export','account_created','sign_in','sign_out']);
const owner=(user,env)=>!!user&&typeof env.OWNER_EMAIL==='string'&&!!env.OWNER_EMAIL.trim()&&user.email.toLowerCase()===env.OWNER_EMAIL.trim().toLowerCase();
function cleanEvent(event) {
 if(!event||typeof event.id!=='string'||!/^[a-zA-Z0-9_-]{16,100}$/.test(event.id)||!EVENT_TYPES.has(event.type))throw new Error('event');
 if(!Number.isFinite(event.occurredAt)||event.occurredAt<0||event.occurredAt>Date.now()+60000)throw new Error('event');
 const d=event.details&&typeof event.details==='object'&&!Array.isArray(event.details)?event.details:{},details={};
 for(const key of ['questionId','choice','index','minutes','score','total','attempts','count'])if(Number.isFinite(d[key]))details[key]=Math.max(-1,Math.min(1000000,Math.floor(d[key])));
 for(const key of ['bank','mode','confidence','conceptId','track','action','source'])if(typeof d[key]==='string')details[key]=d[key].slice(0,100);
 for(const key of ['active','struck','firstCorrect'])if(typeof d[key]==='boolean')details[key]=d[key];
 if(typeof d.prediction==='string')details.prediction=d.prediction.slice(0,2000);
 if(Array.isArray(d.questionIds))details.questionIds=[...new Set(d.questionIds.filter(id=>QUESTION_KEYS[id]))].slice(0,1000);
 const q=QUESTION_KEYS[details.questionId];
 if(details.questionId!==undefined&&!q)throw new Error('event');
 if(details.choice!==undefined&&(!q||details.choice<0||details.choice>=q.options))throw new Error('event');
 if(event.type==='answer'){if(!q||details.choice===undefined)throw new Error('event');details.correct=details.choice===q.answer;details.bank=q.bank;details.lesson=q.lesson;details.questionText=q.prompt||'';details.selectedOption=q.choices?.[details.choice]||'';details.correctOption=q.choices?.[q.answer]||'';details.contentRevision=q.revision||''}
 const path=typeof event.path==='string'?event.path.split('?')[0].slice(0,200):'';
 return {id:event.id,type:event.type,occurredAt:Math.floor(event.occurredAt),path,details,questionId:details.questionId??null};
}
async function admin(request,env,url,user) {
 if(!owner(user,env))return json({error:'This dashboard is restricted to the site owner.'},403);
 if(request.method!=='GET')return json({error:'Method not allowed.'},405);
 const caller={userId:user.id};
 if(url.pathname==='/api/admin/users'){
  const search=(url.searchParams.get('search')||'').slice(0,120),page=Math.max(0,Math.min(10000,Math.floor(Number(url.searchParams.get('page'))||0)));
  const rows=await env.DB.prepare(`SELECT a.user_id AS userId,a.display_name AS displayName,a.full_name AS fullName,a.email,a.created_at AS createdAt,a.last_seen_at AS lastSeenAt,p.updated_at AS progressUpdatedAt,
   (SELECT COUNT(*) FROM study_events e WHERE e.user_id=a.user_id) AS eventCount,
   (SELECT COUNT(*) FROM study_events e WHERE e.user_id=a.user_id AND e.type='answer') AS answerCount
   FROM study_accounts a LEFT JOIN study_progress p ON p.user_id=a.user_id
   WHERE a.display_name LIKE ? OR a.full_name LIKE ? OR a.email LIKE ?
   ORDER BY COALESCE(a.last_seen_at,a.created_at) DESC,a.user_id LIMIT 51 OFFSET ?`).bind('%'+search+'%','%'+search+'%','%'+search+'%',page*50).all();
  return json({...caller,users:rows.results.slice(0,50),hasMore:rows.results.length>50,page});
 }
 const target=(url.searchParams.get('user')||'').slice(0,200);
 if(!target)return json({error:'Choose an account.'},400);
 if(url.pathname==='/api/admin/progress'){
  const learner=await env.DB.prepare('SELECT user_id AS userId,display_name AS displayName,full_name AS fullName,email FROM study_accounts WHERE user_id = ?').bind(target).first();
  if(!learner)return json({error:'Account not found.'},404);
  const row=await env.DB.prepare('SELECT state,version,updated_at FROM study_progress WHERE user_id = ?').bind(target).first();
  return json({...caller,learner,state:row?JSON.parse(row.state):null,version:row?.version||0,updatedAt:row?.updated_at||null});
 }
 if(url.pathname==='/api/admin/events'){
  const type=url.searchParams.get('type'),question=Number(url.searchParams.get('question')),cursor=url.searchParams.get('cursor');
  const where=['user_id = ?'],values=[target];if(type){if(!EVENT_TYPES.has(type))return json({error:'Unknown activity type.'},400);where.push('type = ?');values.push(type)}
  if(url.searchParams.has('question')){if(!Number.isSafeInteger(question)||!QUESTION_KEYS[question])return json({error:'Unknown question.'},400);where.push('question_id = ?');values.push(question)}
  if(cursor){let parsed;try{parsed=JSON.parse(cursor)}catch{return json({error:'Invalid activity cursor.'},400)}if(!parsed||typeof parsed!=='object'||Array.isArray(parsed)||!Number.isSafeInteger(parsed.time)||typeof parsed.id!=='string')return json({error:'Invalid activity cursor.'},400);where.push('(received_at < ? OR (received_at = ? AND id < ?))');values.push(parsed.time,parsed.time,parsed.id)}
  const rows=await env.DB.prepare('SELECT id,user_id AS userId,type,occurred_at AS occurredAt,received_at AS receivedAt,path,details FROM study_events WHERE '+where.join(' AND ')+' ORDER BY received_at DESC,id DESC LIMIT 101').bind(...values).all();
  const events=rows.results.slice(0,100).map(e=>({...e,details:JSON.parse(e.details)})),last=events.at(-1);
  return json({...caller,events,nextCursor:rows.results.length>100?JSON.stringify({time:last.receivedAt,id:last.id}):null});
 }
 return json({error:'Not found.'},404);
}
async function api(request, env, url) {
 const user=identity(request), method=request.method;
 if(!['/api/me','/api/account','/api/progress','/api/events','/api/admin/users','/api/admin/progress','/api/admin/events'].includes(url.pathname))return json({error:'Not found'},404);
 if(method!=='GET'){
  const origin=request.headers.get('Origin');
  if(!origin||origin!==url.origin||request.headers.get('Sec-Fetch-Site')==='cross-site')return json({error:'This request must come from EC2K2.'},403);
 }
 if(!user)return url.pathname==='/api/me'&&method==='GET'?json({user:null,account:null,isOwner:false}):json({code:'signed_out',error:'Sign in to save account progress.'},401);
 if(url.pathname!=='/api/me'&&request.headers.get('X-EC2K2-User')!==user.id)return json({code:'account_changed',error:'The signed-in account has changed. Reload account identity before continuing.'},409);
 if(!env.DB)return json({error:'Account storage is temporarily unavailable.'},503);
 const account=await env.DB.prepare('SELECT display_name, created_at FROM study_accounts WHERE user_id = ? AND consent_version = ?').bind(user.id,CONSENT).first();
 if(url.pathname.startsWith('/api/admin/')){if(!account)return json({error:'Create your EC2K2 account first.'},403);return admin(request,env,url,user)}
 if(url.pathname==='/api/me'&&method==='GET')return json({user:{id:user.id,name:user.name},account:account?{name:account.display_name,createdAt:account.created_at}:null,isOwner:owner(user,env)});
 if(url.pathname==='/api/account'&&method==='POST'){
  const input=await readJSON(request),name=typeof input.name==='string'?input.name.trim().slice(0,60):user.name;
  if(!name)return json({error:'Enter a display name.'},400);
  if(input.consentVersion!==CONSENT)return json({error:'Read the account activity notice before creating your profile.'},400);
  const now=Date.now();
  await env.DB.prepare('INSERT INTO study_accounts (user_id, display_name, created_at, full_name, email, consent_version, consent_at, last_seen_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET display_name = excluded.display_name, full_name = excluded.full_name, email = excluded.email, consent_version = excluded.consent_version, consent_at = excluded.consent_at, last_seen_at = excluded.last_seen_at WHERE study_accounts.consent_version <> excluded.consent_version').bind(user.id,name,now,user.name,user.email,CONSENT,now,now).run();
  const saved=await env.DB.prepare('SELECT display_name, created_at FROM study_accounts WHERE user_id = ?').bind(user.id).first();
  return json({userId:user.id,user:{id:user.id,name:user.name},account:{name:saved.display_name,createdAt:saved.created_at},isOwner:owner(user,env)},201);
 }
 if(url.pathname==='/api/events'&&method==='POST'){
  if(!account)return json({error:'Create your EC2K2 account first.'},403);
  const input=await readJSON(request);if(!Array.isArray(input.events)||input.events.length>50)throw new Error('event');
  const events=input.events.map(cleanEvent),now=Date.now();
  const statements=events.map(e=>env.DB.prepare('INSERT INTO study_events (id,user_id,type,question_id,occurred_at,received_at,path,details) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING').bind(user.id+':'+e.id,user.id,e.type,e.questionId,e.occurredAt,now,e.path,JSON.stringify(e.details)));
  statements.push(env.DB.prepare('UPDATE study_accounts SET last_seen_at = ?, full_name = ?, email = ? WHERE user_id = ?').bind(now,user.name,user.email,user.id));
  await env.DB.batch(statements);
  return json({userId:user.id,accepted:events.map(e=>e.id)});
 }
 if(url.pathname!=='/api/progress'||!['GET','PUT'].includes(method))return json({error:'Method not allowed.'},405);
 if(!account)return json({error:'Create your EC2K2 account first.'},403);
 if(method==='GET'){
  const row=await env.DB.prepare('SELECT state, version, updated_at FROM study_progress WHERE user_id = ?').bind(user.id).first();
  return json(row?{userId:user.id,state:JSON.parse(row.state),version:row.version,updatedAt:row.updated_at}:{userId:user.id,state:null,version:0,updatedAt:null});
 }
 const input=await readJSON(request),state=cleanState(input.state),version=input.version;
 if(!Number.isSafeInteger(version)||version<0)return json({error:'Invalid progress version.'},400);
 const now=Date.now(),value=JSON.stringify(state);
 const result=version===0
  ?await env.DB.prepare('INSERT INTO study_progress (user_id, state, version, updated_at) VALUES (?, ?, 1, ?) ON CONFLICT(user_id) DO NOTHING').bind(user.id,value,now).run()
  :await env.DB.prepare('UPDATE study_progress SET state = ?, version = version + 1, updated_at = ? WHERE user_id = ? AND version = ?').bind(value,now,user.id,version).run();
 if(result.meta.changes!==1){const row=await env.DB.prepare('SELECT state, version, updated_at FROM study_progress WHERE user_id = ?').bind(user.id).first();return json({userId:user.id,error:'Newer account progress is available.',state:row?JSON.parse(row.state):null,version:row?.version||0,updatedAt:row?.updated_at||null},409)}
 await env.DB.prepare('UPDATE study_accounts SET last_seen_at = ? WHERE user_id = ?').bind(now,user.id).run();
 return json({userId:user.id,version:version+1,updatedAt:now});
}
export default {
 async fetch(request, env) {
  const url=new URL(request.url);
  if(url.pathname.startsWith('/api/')){try{return await api(request,env,url)}catch(error){const invalid=['type','size','json','state','event'].includes(error.message)||error instanceof SyntaxError;return json({error:invalid?'The upload is invalid or too large.':'Account storage is temporarily unavailable.'},invalid?400:503)}}
  if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405});
  const path=url.pathname==='/'?'/index.html':url.pathname,asset=ASSETS[path];
  if(!asset)return new Response('Not found',{status:404,headers:{'X-Content-Type-Options':'nosniff'}});
  const publicAsset=new Set(['/index.html','/app.js','/account.js','/access.js','/home.js','/home.css','/admin.js','/admin.css','/styles.css','/i18n.js','/translation.css']).has(path);
  if(!publicAsset){
   const user=identity(request);if(!user)return json({error:'Sign in to open the study material.'},401);
   if(!env.DB)return json({error:'Account storage is temporarily unavailable.'},503);
   try{const account=await env.DB.prepare('SELECT user_id FROM study_accounts WHERE user_id = ? AND consent_version = ?').bind(user.id,CONSENT).first();if(!account)return json({error:'Create your EC2K2 account to open the study material.'},403)}catch{return json({error:'Account storage is temporarily unavailable.'},503)}
  }
  return new Response(request.method==='HEAD'?null:asset.content,{headers:{'Content-Type':asset.type,'Cache-Control':publicAsset?(path.endsWith('.html')?'no-cache':'public, max-age=300'):'private, no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','Permissions-Policy':'camera=(), microphone=(), geolocation=()'}});
 }
};
