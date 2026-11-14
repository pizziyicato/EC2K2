import {signInReturnPath} from './access.js?v=7';
const copy=x=>JSON.parse(JSON.stringify(x));
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const empty=()=>({version:2,answers:{},bookmarks:[],understood:[],walks:{},session:null});
const obj=x=>x&&typeof x==='object'&&!Array.isArray(x);
function mergeValue(base,local,remote){
 if(same(local,base))return remote;
 if(same(remote,base)||same(local,remote))return local;
 if(obj(local)&&obj(remote)){const out={};for(const k of new Set([...Object.keys(base||{}),...Object.keys(local),...Object.keys(remote)])){const value=mergeValue(base?.[k],local[k],remote[k]);if(value!==undefined)out[k]=value}return out}
 return local;
}
function mergeSet(base=[],local=[],remote=[]){const b=new Set(base),l=new Set(local),r=new Set(remote);return [...new Set([...b,...l,...r])].filter(x=>l.has(x)!==b.has(x)?l.has(x):r.has(x))}
export function mergeProgress(base=empty(),local=empty(),remote=empty()){
 base=base||empty();local=local||empty();remote=remote||empty();const out=copy(mergeValue(base,local,remote));
 out.version=2;out.answers={};
 for(const id of new Set([...Object.keys(base.answers||{}),...Object.keys(local.answers||{}),...Object.keys(remote.answers||{})])){
  const b=base.answers?.[id],l=local.answers?.[id],r=remote.answers?.[id];
  // An unchanged side yields to the other side's deletion. If a fresh answer
  // genuinely conflicts with a deletion, retain that new practice attempt.
  if(same(l,b)){if(r!==undefined)out.answers[id]=r;continue}
  if(same(r,b)||same(l,r)){if(l!==undefined)out.answers[id]=l;continue}
  if(!l){if(r)out.answers[id]=r;continue}if(!r){out.answers[id]=l;continue}
  const latest=(l.time||0)>=(r.time||0)?l:r,earliest=(l.time||0)<=(r.time||0)?l:r;
  out.answers[id]={...latest,attempts:Math.max(l.attempts||1,r.attempts||1,(l.attempts||1)+(r.attempts||1)-(b?.attempts||0)),firstCorrect:b&&!b.needsReview?b.firstCorrect:earliest.firstCorrect};
 }
 out.bookmarks=mergeSet(base.bookmarks,local.bookmarks,remote.bookmarks);
 out.understood=mergeSet(base.understood,local.understood,remote.understood);
 out.walks=out.walks||{};
 for(const id of Object.keys(out.walks))for(const track of ['derive','graph','increase','decrease','edge']){out.walks[id].seen??={};out.walks[id].seen[track]=mergeSet(base.walks?.[id]?.seen?.[track],local.walks?.[id]?.seen?.[track],remote.walks?.[id]?.seen?.[track])}
 // A session is one coherent set, not a mixture of two devices' question orders.
 out.session=same(local.session,base.session)?remote.session:local.session;
 return copy(out);
}
export function createAccountSync({getStore,useStore,clean,render,toast,guestKey,deferSync=false}){
 const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const eventTypes=new Set(['page_view','question_view','answer','option_select','option_crossout','confidence','redo_question','session_start','session_finish','bookmark','concept_mark','walk_step','walk_prediction','progress_import','guest_import','progress_export','account_created','sign_in','sign_out']);
 const controllers=new Set(),volatileEvents=new Map();
 let user=null,profile=null,owner=false,verified=false,ready=false,pending=false,timer,eventTimer,generation=0,progressTask=null,eventTask=null,recovering=false,syncEnabled=!deferSync;
 let status='Sign in to open your study space',key=guestKey,base=empty(),version=0,lastSaved=null,guestBase=empty(),unavailable=false;
 const read=(k,fallback)=>{try{return JSON.parse(localStorage.getItem(k))||fallback}catch{return fallback}};
 const remember=()=>{try{localStorage.setItem(key+':cloud',JSON.stringify({base,version,lastSaved,guestBase}))}catch{}};
 const context=()=>({generation,userId:user?.id,key});
 const current=ctx=>ctx.generation===generation&&ctx.userId===user?.id&&ctx.key===key;
 const hasAccount=()=>!!(verified&&user&&profile);
 function show(message){
  status=message;const s=document.querySelector('#save-status');if(s)s.textContent=message;
  const a=document.querySelector('#account-status');if(a)a.textContent=message;
  const link=document.querySelector('#account-link');if(link)link.textContent=profile?'My account':user?'Create account':'Log in / Sign up';
  document.querySelectorAll('#owner-link, #admin-link, [data-owner-only]').forEach(el=>{el.hidden=!(hasAccount()&&owner)});
 }
 async function request(path,options={},ctx=null){
  const controller=new AbortController();controllers.add(controller);const timeout=setTimeout(()=>controller.abort(),10000);
  try{
   const headers={'Content-Type':'application/json',...options.headers};if(ctx)headers['X-EC2K2-User']=ctx.userId;
   const response=await fetch(path,{credentials:'same-origin',...options,signal:controller.signal,headers});
   let data;try{data=await response.json()}catch{throw new Error('Account service is unavailable')}
   return {response,data};
  }finally{clearTimeout(timeout);controllers.delete(controller)}
 }
 function cancelIdentity(){
  // Save the old user's local copy before changing either key or identity.
  try{localStorage.setItem(key,JSON.stringify(getStore()))}catch{}
  generation++;ready=false;pending=false;clearTimeout(timer);clearTimeout(eventTimer);
  for(const controller of controllers)controller.abort();controllers.clear();progressTask=null;eventTask=null;
 }
 function clearIdentity(){user=null;profile=null;owner=false;verified=false;key=guestKey;base=empty();version=0;lastSaved=null;guestBase=empty()}
 async function acceptResponse(ctx,response,data){
  if(!current(ctx))return false;
  if(response.status===401||response.status===403||data?.code==='account_changed'||((response.ok||response.status===409)&&data?.userId!==ctx.userId)){
   if(recovering){cancelIdentity();clearIdentity();useStore(guestKey,clean(read(guestKey,empty())));show('Account identity could not be confirmed · refresh to reconnect');render(false);return false}
   recovering=true;try{await reloadIdentity()}finally{recovering=false}return false;
  }
  return true;
 }
 async function connect(ctx=context()){
  if(!current(ctx)||!hasAccount()||!syncEnabled)return;ready=false;show('Loading account progress…');
  try{
   const {response,data}=await request('/api/progress',{},ctx);if(!await acceptResponse(ctx,response,data)||!current(ctx))return;
   if(!response.ok)throw new Error(data.error||'Sync unavailable');
   const remote=clean(data.state||empty()),merged=clean(mergeProgress(base,getStore(),remote));
   base=remote;version=data.version;lastSaved=data.updatedAt;useStore(key,merged);remember();ready=true;pending=!same(merged,remote);
   show(pending?'Saving account progress…':'Account progress is up to date');if(pending)queue();scheduleEvents();
  }catch{if(current(ctx)){ready=true;pending=true;show('Saved on this device · cloud sync unavailable');timer=setTimeout(flushProgress,15000);scheduleEvents(15000)}}
 }
 async function adoptIdentity(data,previousId){
  cancelIdentity();clearIdentity();unavailable=false;
  user=data.user&&typeof data.user.id==='string'?data.user:null;profile=user?data.account:null;owner=!!(user&&data.isOwner);verified=true;
  if(!user){useStore(guestKey,clean(read(guestKey,empty())));show('Sign in to open your study space');render(false);return}
  key=guestKey+'-account:'+user.id;
  const saved=read(key+':cloud',{});base=clean(saved.base||empty());version=Number.isInteger(saved.version)?saved.version:0;
  lastSaved=saved.lastSaved||null;guestBase=clean(saved.guestBase||empty());useStore(key,clean(read(key,empty())));
  const ctx=context();
  if(profile){if(syncEnabled)await connect(ctx);else show('Account verified · opening your study space…');if(current(ctx)&&previousId!==user.id)track('sign_in',{action:'signed-in study session',source:'account_session_detected'})}
  else show('Create your EC2K2 account to open the course');
  if(current(ctx))render(false);
 }
 async function reloadIdentity(){
  const previousId=user?.id;cancelIdentity();clearIdentity();useStore(guestKey,clean(read(guestKey,empty())));show('Checking your account…');
  const token=generation;
  try{const {response,data}=await request('/api/me');if(token!==generation)return;if(!response.ok)throw new Error();await adoptIdentity(data,previousId)}
  catch{if(token===generation){unavailable=true;show('Account service unavailable · reconnect to open the course');render(false)}}
 }
 function queue(){if(!hasAccount()||!syncEnabled||!ready)return;pending=true;clearTimeout(timer);show('Saving account progress…');timer=setTimeout(flushProgress,800)}
 function flushProgress(){
  if(!hasAccount()||!syncEnabled||!ready||!pending)return Promise.resolve();if(progressTask)return progressTask;
  const ctx=context();clearTimeout(timer);
  const task=Promise.resolve().then(async()=>{
   try{
    for(let attempt=0;attempt<4&&pending&&current(ctx);attempt++){
     const snapshot=copy(getStore()),{response,data}=await request('/api/progress',{method:'PUT',body:JSON.stringify({state:snapshot,version})},ctx);
     if(!await acceptResponse(ctx,response,data)||!current(ctx))return;
     if(response.status===409){const remote=clean(data.state||empty()),merged=clean(mergeProgress(base,getStore(),remote));base=remote;version=data.version;lastSaved=data.updatedAt;useStore(key,merged);remember();continue}
     if(!response.ok)throw new Error(data.error||'Sync failed');
     base=snapshot;version=data.version;lastSaved=data.updatedAt;pending=!same(getStore(),snapshot);remember();
    }
    if(current(ctx))show(pending?'Saved on this device · more changes to sync':'Progress saved to your account');
   }catch{if(current(ctx))show('Saved on this device · cloud sync will retry')}
   finally{if(progressTask===task)progressTask=null;if(current(ctx)&&pending)timer=setTimeout(flushProgress,15000)}
  });progressTask=task;return task;
 }
 function boundedDetails(value){
  const result={};
  for(const k of ['questionId','choice','index','minutes','score','total','attempts','count'])if(Number.isFinite(value[k]))result[k]=Math.max(-1,Math.min(1000000,Math.floor(value[k])));
  for(const k of ['bank','mode','confidence','conceptId','track','action','source'])if(typeof value[k]==='string')result[k]=value[k].slice(0,100);
  for(const k of ['active','struck','firstCorrect'])if(typeof value[k]==='boolean')result[k]=value[k];
  if(typeof value.prediction==='string')result.prediction=value.prediction.slice(0,2000);
  if(Array.isArray(value.questionIds))result.questionIds=[...new Set(value.questionIds.filter(id=>Number.isSafeInteger(id)&&id>0&&id<=1000000))].slice(0,1000);
  return result;
 }
 function uuid(){
  if(globalThis.crypto?.randomUUID)return globalThis.crypto.randomUUID();
  const bytes=new Uint8Array(16);if(globalThis.crypto?.getRandomValues)globalThis.crypto.getRandomValues(bytes);else for(let i=0;i<16;i++)bytes[i]=Math.floor(Math.random()*256);
  bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;const h=[...bytes].map(x=>x.toString(16).padStart(2,'0')).join('');return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;
 }
 const eventPrefix=ctx=>ctx.key+':event:';
 function queuedEvents(ctx){
  const entries=new Map(),prefix=eventPrefix(ctx);
  try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k?.startsWith(prefix)){const e=read(k,null);if(e&&eventTypes.has(e.type)&&/^[a-zA-Z0-9_-]{16,100}$/.test(e.id)&&k===prefix+e.id&&Number.isFinite(e.occurredAt)&&e.occurredAt>=0&&e.occurredAt<=Date.now()+60000&&typeof e.path==='string'&&obj(e.details))entries.set(e.id,{...e,path:e.path.slice(0,200),details:boundedDetails(e.details)})}}}catch{}
  for(const [k,e]of volatileEvents)if(k.startsWith(prefix))entries.set(e.id,e);
  return [...entries.values()].sort((a,b)=>a.occurredAt-b.occurredAt||a.id.localeCompare(b.id));
 }
 function scheduleEvents(delay=800){if(!hasAccount()||!syncEnabled||!ready)return;clearTimeout(eventTimer);eventTimer=setTimeout(flushEvents,delay)}
 function track(type,details={}){
  if(!hasAccount()||!eventTypes.has(type))return false;
  const safe=boundedDetails(obj(details)?details:{});
  if(safe.questionId!==undefined&&safe.questionId<1)return false;
  if(safe.choice!==undefined&&(!safe.questionId||safe.choice<0||safe.choice>5))return false;
  if(type==='answer'&&(safe.questionId===undefined||safe.choice===undefined))return false;
  const ctx=context(),entry={id:uuid(),type,occurredAt:Date.now(),path:String((location.pathname||'/')+(location.hash||'')).split('?')[0].slice(0,200),details:safe};
  const storageKey=eventPrefix(ctx)+entry.id;volatileEvents.set(storageKey,entry);
  try{localStorage.setItem(storageKey,JSON.stringify(entry))}catch{show('Activity is waiting to sync · device storage is unavailable')}
  scheduleEvents();return true;
 }
 function flushEvents(){
  if(!hasAccount()||!syncEnabled||!ready)return Promise.resolve();if(eventTask)return eventTask;
  const ctx=context();clearTimeout(eventTimer);
  const task=Promise.resolve().then(async()=>{
   try{
    for(let attempt=0;attempt<4&&current(ctx);attempt++){
     const batch=queuedEvents(ctx).slice(0,50);if(!batch.length)return;
     const {response,data}=await request('/api/events',{method:'POST',body:JSON.stringify({events:batch})},ctx);
     if(!await acceptResponse(ctx,response,data)||!current(ctx))return;if(!response.ok)throw new Error(data.error||'Activity sync failed');
     if(!Array.isArray(data.accepted))throw new Error('Activity acknowledgement is missing');
     const sent=new Set(batch.map(e=>e.id)),accepted=data.accepted.filter(id=>sent.has(id));
     for(const id of accepted){const k=eventPrefix(ctx)+id;volatileEvents.delete(k);try{localStorage.removeItem(k)}catch{}}
     if(accepted.length<batch.length)break;
    }
   }catch{if(current(ctx))show('Saved on this device · cloud sync will retry')}
   finally{if(eventTask===task)eventTask=null;if(current(ctx)&&queuedEvents(ctx).length)scheduleEvents(15000)}
  });eventTask=task;return task;
 }
 async function flush(){await Promise.all([flushProgress(),flushEvents()])}
 async function refresh(){
  const before=context();
  try{
   const {response,data}=await request('/api/me');if(!current(before))return;if(!response.ok)throw new Error();
   if(data.user?.id!==user?.id||!!data.account!==!!profile){await adoptIdentity(data,user?.id);return}
   user=data.user||null;profile=data.account||null;owner=!!(user&&data.isOwner);verified=true;unavailable=false;
   if(!profile){show(user?'Create your EC2K2 account to open the course':'Sign in to open your study space');render(false);return}
   if(!syncEnabled){render(false);return}
   if(!ready){await connect(context());render(false);return}
   await flush();if(!current(before)||pending)return;
   const ctx=context(),result=await request('/api/progress',{},ctx);if(!await acceptResponse(ctx,result.response,result.data)||!current(ctx))return;
   if(!result.response.ok)throw new Error();if(result.data.version<version)return;const remote=clean(result.data.state||empty());
   const merged=clean(mergeProgress(base,getStore(),remote));base=remote;version=result.data.version;lastSaved=result.data.updatedAt;
   if(!same(getStore(),merged))useStore(key,merged);remember();pending=!same(merged,remote);render(false);
   show(pending?'Saving account progress…':'Account progress is up to date');if(pending)queue();scheduleEvents();
  }catch{if(current(before)){verified=false;cancelIdentity();unavailable=true;show('Account verification unavailable · reconnect to open the course');render(false)}}
 }
 function pauseSync(){syncEnabled=false;ready=false;clearTimeout(timer);clearTimeout(eventTimer)}
 async function enableSync(){
  if(!hasAccount())return;syncEnabled=true;base=clean(base);guestBase=clean(guestBase);useStore(key,clean(getStore()));await connect(context());
 }
 function view(){
  const signIn='/signin-with-chatgpt?return_to='+encodeURIComponent(signInReturnPath(location.hash)),signOut='/signout-with-chatgpt?return_to='+encodeURIComponent('/#account');
  return `<p class="eyebrow">YOUR EC2K2 ACCOUNT</p><h1>${hasAccount()?'Keep your progress.<br>Pick up anywhere.':'Sign in.<br>Make the course yours.'}</h1><p class="intro">Sign in with ChatGPT and create your EC2K2 profile to access the questions, Decoded and study tools. Registration is open to everyone.</p><section class="account-card"><p class="account-status" id="account-status" role="status">${E(status)}</p>${!user||!verified?`<h2>Your study space starts here</h2><p>Use ChatGPT to sign in, then choose your EC2K2 display name. Account progress is private to you and the site owner, who can review your study activity.</p><a class="primary" target="_top" href="${signIn}">Log in or sign up with ChatGPT →</a>${unavailable?'<p class="small">The account service could not be reached. Reconnect to verify your account and open the course. Your existing local records are retained.</p>':''}${!verified||unavailable?'<button class="secondary" id="retry-account">Check my account again</button>':''}`:!profile?`<h2>Create your EC2K2 account</h2><p>Your sign-in is ready. Choose a display name to open your study space.</p><form id="create-account"><label>Display name<input id="account-name" maxlength="60" required value="${E(user.name)}" autocomplete="nickname"></label><div class="note"><strong>What your account records</strong><p>Your display name, sign-in name and email, quiz responses and confidence, study activity, and timestamps are recorded and visible to the site owner, who uses them to review study activity. Your saved progress is private to you and the site owner. Any guest progress saved before accounts became required stays on this device unless you choose to copy it into your account.</p></div><button class="primary" type="submit">Create my EC2K2 account →</button></form><a class="inline-link" id="sign-out" target="_top" href="${signOut}">Sign out</a>`:`<h2>${E(profile.name)}</h2><p>Your saved progress is private to you and the site owner. The owner can review your display name, sign-in name and email, quiz responses and confidence, study activity, and timestamps.</p><div class="actions"><button class="primary" id="sync-now">Sync progress now</button><a class="secondary" target="_top" id="sign-out" href="${signOut}">Sign out</a></div><details class="account-import"><summary>Bring earlier guest progress into my account</summary><p>Copy progress saved on this device before accounts became required. Do this only if that progress is yours. Newer answers are retained when both contain the same question. The copied progress becomes visible to you and the site owner.</p><button class="secondary" id="copy-guest">Copy earlier guest progress to my account</button></details>`}</section><div class="note">An account is required for all study tools. Your account keeps a separate device copy and syncs it when connected. Earlier guest records remain available for explicit import after signing in. Signing out closes the study space.</div>${hasAccount()?'<a class="inline-link" href="#home">Return to the study space ↗</a>':''}`;
 }
 function bind(){
  const bound=context();
  document.querySelector('#retry-account')?.addEventListener('click',()=>reloadIdentity());
  document.querySelector('#create-account')?.addEventListener('submit',async event=>{
   event.preventDefault();if(!current(bound)||!user||!verified)return;const button=event.currentTarget.querySelector('button');button.disabled=true;
   try{
    const name=String(document.querySelector('#account-name')?.value||'').trim().slice(0,60);if(!name)throw new Error('Enter a display name');
    const {response,data}=await request('/api/account',{method:'POST',body:JSON.stringify({name,consentVersion:'2026-11-14-activity-v1'})},bound);if(!await acceptResponse(bound,response,data)||!current(bound))return;
    if(!response.ok)throw new Error(data.error||'Account could not be created');
    profile=data.account;owner=!!data.isOwner;if(!profile)throw new Error('Account profile is missing');
    await connect(bound);if(!current(bound))return;track('account_created');track('sign_in',{action:'signed-in study session',source:'account_created'});render(false);toast('Your EC2K2 account is ready');
   }catch(error){if(current(bound)){toast(error.message);button.disabled=false}}
  });
  document.querySelector('#sync-now')?.addEventListener('click',async()=>{if(!current(bound))return;await refresh();toast(status)});
  document.querySelector('#copy-guest')?.addEventListener('click',()=>{
   if(!current(bound)||!hasAccount())return;const guest=clean(read(guestKey,empty()));
   useStore(key,clean(mergeProgress(guestBase,guest,getStore())));guestBase=guest;remember();queue();
   track('guest_import',{count:Object.keys(guest.answers).length,total:guest.bookmarks.length+guest.understood.length,source:'explicit_guest_progress_copy'});render(false);toast('Guest progress copied into your account');
  });
  document.querySelector('#sign-out')?.addEventListener('click',async event=>{
   event.preventDefault();if(!current(bound))return;const href=event.currentTarget.href;track('sign_out');await flush();
   if(current(bound)){verified=false;cancelIdentity();render(false);window.top.location.href=href}
  });
 }
 window.addEventListener('online',()=>refresh());document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
 window.addEventListener('pageshow',event=>{if(event.persisted){verified=false;cancelIdentity();render(false);refresh()}});
 return {init:reloadIdentity,queue,view,bind,refresh,flush,track,hasAccount,pauseSync,enableSync,accessGeneration:()=>generation,isOwner:()=>!!(hasAccount()&&owner),userId:()=>user?.id||null,showStatus:()=>show(status)};
}
