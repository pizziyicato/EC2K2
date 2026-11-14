const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const object = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
const array = value => Array.isArray(value) ? value : [];
const count = value => Number.isFinite(Number(value)) ? Math.max(0, Math.floor(Number(value))) : 0;
const pretty = value => { try { return JSON.stringify(value, null, 2) ?? 'Not recorded'; } catch { return 'Unable to display these details'; } };
const EVENT_TYPES = {
 page_view:'Page opened', question_view:'Question opened', answer:'Answer checked', option_select:'Option selected',
 option_crossout:'Option crossed out or restored', confidence:'Confidence changed', redo_question:'Question restarted',
 session_start:'Practice set started', session_finish:'Practice set finished', bookmark:'Bookmark changed',
 concept_mark:'Concept self-check changed', walk_step:'Guided step opened', walk_prediction:'Reflection submitted',
 progress_import:'Progress imported', guest_import:'Guest progress copied', progress_export:'Progress exported',
 account_created:'Account created', sign_in:'Signed-in study session', sign_out:'Signed out'
};
const TRACK_NAMES = {derive:'Derivation',graph:'Graph',increase:'Increase case',decrease:'Decrease case',edge:'Edge case'};
const BANK_NAMES = {ib400:'IB400',st100:'S&T100',recaps:'Assoc. Prof Wong Wei Kang Recaps',pb20:'PB20'};

export function createAdmin({getUserId, allQuestions = [], lessons = [], toast = () => {}}) {
 const E = escapeHTML;
 const questions = new Map(array(allQuestions).map(q => [String(q.id), q]));
 const chapters = new Map(array(lessons).map(l => [String(l.id), l]));
 const concepts = new Map(array(lessons).flatMap(l => array(l.concepts).map(c => [String(c.id), {...c, chapter:l.title}])));
 const controllers = new Map();
 let root = null, boundRoot = null, ownerId = null, generation = 0, listRequest = 0, detailRequest = 0, eventRequest = 0, identityTimer;
 let authorized = false, users = [], page = 0, hasMore = false, search = '', selected = null;
 let progress = null, progressStatus = 'idle', events = [], eventsStatus = 'idle', nextCursor = null, currentCursor = null, eventPage = 1;
 let filters = {type:'', question:''}, answerFilter = {search:'', status:'all'}, answerPage = 0, reflectionPage = 0;
 const userId = () => { const id = getUserId?.(); return typeof id === 'string' && id ? id : null; };
 const $ = selector => root?.querySelector(selector);
 const date = value => {
  if (value === null || value === undefined || value === '') return 'Not recorded';
  const parsed = new Date(typeof value === 'string' && /^\d{13}$/.test(value) ? Number(value) : value);
  return Number.isNaN(parsed.getTime()) ? 'Not recorded' : new Intl.DateTimeFormat(undefined, {dateStyle:'medium', timeStyle:'short'}).format(parsed);
 };
 const mounted = () => Boolean(root?.isConnected && document.querySelector('#admin-dashboard') === root);
 function abort(key) { controllers.get(key)?.abort(); controllers.delete(key); }
 function clearRequests() { for (const controller of controllers.values()) controller.abort(); controllers.clear(); clearInterval(identityTimer); }
 function clearData() { users=[]; selected=null; progress=null; events=[]; nextCursor=null; authorized=false; }
 function privateOnly(message = 'This dashboard is available only to the site owner. Sign in with the owner account to continue.') {
  clearRequests(); clearData(); listRequest++; detailRequest++; eventRequest++;
  const body = $('#admin-body');
  if (body) body.innerHTML = `<div class="admin-empty admin-private" role="status"><span class="admin-lock" aria-hidden="true">◇</span><h2>Private owner dashboard</h2><p>${E(message)}</p><a class="primary" href="#account">Go to your account →</a></div>`;
 }
 function guard() {
  if (!mounted()) { clearRequests(); return false; }
  if (userId() !== ownerId) { privateOnly('The signed-in account changed. Open the dashboard again from the owner account.'); return false; }
  return true;
 }
 async function request(path, key) {
  const expected = ownerId;
  if (!expected || userId() !== expected) throw Object.assign(new Error('Account changed'), {private:true});
  abort(key);
  const controller = new AbortController(); controllers.set(key, controller);
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
   const response = await fetch(path, {method:'GET', credentials:'same-origin', cache:'no-store', signal:controller.signal, headers:{Accept:'application/json','X-EC2K2-User':expected}});
   if (response.status === 401 || response.status === 403) throw Object.assign(new Error('Owner access required'), {private:true});
   if (!response.ok) throw new Error('The account service could not load this information.');
   const result = await response.json();
   if (!result || result.userId !== expected || userId() !== expected) throw Object.assign(new Error('Account identity did not match'), {private:true});
   return result;
  } finally { clearTimeout(timeout); if (controllers.get(key) === controller) controllers.delete(key); }
 }
 function errorAt(selector, message, error) {
  if (!guard()) return;
  if (error?.private) { privateOnly('Owner access could not be confirmed for this account. No learner information is displayed.'); return; }
  const el = $(selector); if (el) el.innerHTML = `<p class="admin-error" role="alert">${E(message)}</p>`;
 }
 const name = learner => learner?.fullName || learner?.displayName || 'Unnamed learner';
 const questionLabel = id => {
  const q = questions.get(String(id));
  return q ? `${BANK_NAMES[q.bank] || 'IB400'} · Question ${q.id}${q.part ? ` · ${q.part}` : ''}` : `Question ${id} · unavailable in the current course`;
 };
 const choiceText = (q, choice) => {
  if (!Number.isInteger(choice) || choice < 0) return 'No valid option recorded';
  const text = q?.choices?.[choice]?.text;
  return text === undefined ? `Recorded option index ${choice} · option text unavailable` : `Choice ${choice + 1}: ${text}`;
 };
 const status = (id, value) => {
  const a = object(value), q = questions.get(String(id));
  if (a.needsReview) return ['review','Content changed · revisit'];
  if (!q || !Number.isInteger(a.choice) || !q.choices?.[a.choice]) return ['unknown','Current answer unavailable'];
  return a.choice === q.answer ? ['correct','Matches current key'] : ['incorrect','Does not match current key'];
 };
 function view() {
  generation++; clearRequests(); clearData(); ownerId=null; page=0; hasMore=false; search='';
  filters={type:'',question:''}; answerFilter={search:'',status:'all'}; answerPage=0; reflectionPage=0;
  return `<section id="admin-dashboard" class="admin-shell" aria-label="Private owner dashboard"><div class="admin-heading"><div><p class="eyebrow">OWNER SPACE</p><h1>People &amp; progress.</h1><p class="intro">See account details, saved responses and the study activity learners have agreed to share.</p></div><span class="admin-private-tag">Private · owner only</span></div><div class="note"><strong>What this record means</strong><br>Activity logging begins when a learner accepts account consent. Earlier imports show current saved progress; they do not recreate past activity. Self-checks and steps visited are study records, not proof of mastery. Times are shown in your local time.</div><div id="admin-body"><p class="admin-loading" role="status">Checking owner access…</p></div></section>`;
 }
 function layout() {
  $('#admin-body').innerHTML = `<div class="admin-layout"><aside class="admin-directory" aria-label="Learner directory"><div class="admin-panel-heading"><h2>Learners</h2><span class="admin-small">50 per page</span></div><form id="admin-search-form" class="admin-search"><label for="admin-search">Find a name or email</label><div class="admin-input-action"><input id="admin-search" type="search" maxlength="200" autocomplete="off" placeholder="Search learners"><button class="secondary" type="submit">Search</button></div></form><div id="admin-list-status" role="status"></div><div id="admin-user-list" class="admin-user-list"></div><div class="admin-pagination"><button class="secondary" data-admin-action="users-prev" disabled>← Previous</button><span id="admin-user-page">Page 1</span><button class="secondary" data-admin-action="users-next" disabled>Next →</button></div></aside><section id="admin-learner" class="admin-learner" aria-label="Selected learner"><div class="admin-empty"><h2>Choose a learner</h2><p>Their saved answers, reflections and activity will appear here.</p></div></section></div>`;
 }
 async function loadUsers(targetPage=0) {
  if (!guard()) return;
  const seq=++listRequest, epoch=generation;
  $('#admin-list-status').textContent='Loading learners…'; $('#admin-user-list').innerHTML=''; $('#admin-user-list').setAttribute('aria-busy','true');
  root.querySelectorAll('[data-admin-action^="users-"]').forEach(b=>b.disabled=true);
  try {
   const result=await request(`/api/admin/users?${new URLSearchParams({search,page:String(targetPage)})}`, 'users');
   if (epoch!==generation || seq!==listRequest || !guard()) return;
   if (!Array.isArray(result.users)) throw new Error('Invalid learner list');
   authorized=true; users=result.users; page=Number.isInteger(result.page)&&result.page>=0?result.page:targetPage; hasMore=result.hasMore===true;
   renderUsers();
   $('#admin-list-status').textContent=users.length ? `${users.length} learner${users.length===1?'':'s'} on this page` : (search?'No learners match this name or email.':'No learner accounts yet.');
  } catch(error) { if(epoch===generation && seq===listRequest) errorAt('#admin-list-status','Unable to load learners. Try Search again.',error); }
  finally { if(epoch===generation && seq===listRequest && guard()) { $('#admin-user-list')?.setAttribute('aria-busy','false'); updateUserPaging(); } }
 }
 function updateUserPaging() {
  const prev=$('[data-admin-action="users-prev"]'),next=$('[data-admin-action="users-next"]');
  if(prev) prev.disabled=!authorized||page===0; if(next) next.disabled=!authorized||!hasMore;
  if($('#admin-user-page')) $('#admin-user-page').textContent=`Page ${page+1}`;
 }
 function renderUsers() {
  $('#admin-user-list').innerHTML=users.map((u,i)=>`<button type="button" class="admin-person ${selected?.userId===u.userId?'is-selected':''}" data-admin-user="${i}" aria-pressed="${selected?.userId===u.userId}"><strong>${E(name(u))}</strong>${u.displayName&&u.displayName!==u.fullName?`<span>${E(u.displayName)}</span>`:''}<span class="admin-email">${E(u.email||'Email not provided')}</span><span class="admin-person-meta">${E(count(u.answerCount))} marked attempts · ${E(count(u.eventCount))} activities</span><span class="admin-person-meta">Last seen ${E(date(u.lastSeenAt))}</span></button>`).join('');
 }
 function learnerLayout() {
  $('#admin-learner').innerHTML=`<header class="admin-learner-heading"><p class="eyebrow">SELECTED LEARNER</p><h2 tabindex="-1" id="admin-learner-name">${E(name(selected))}</h2><p class="admin-email">${E(selected.email||'Email not provided')}</p>${selected.displayName?`<p class="admin-small">Display name: ${E(selected.displayName)}</p>`:''}<dl class="admin-meta"><div><dt>Joined</dt><dd>${E(date(selected.createdAt))}</dd></div><div><dt>Last seen</dt><dd>${E(date(selected.lastSeenAt))}</dd></div><div><dt>Progress last saved</dt><dd id="admin-progress-date">${E(date(selected.progressUpdatedAt))}</dd></div></dl><button class="secondary" data-admin-action="refresh-learner">Refresh this learner</button></header><section class="admin-panel" aria-labelledby="admin-progress-title"><div class="admin-panel-heading"><h2 id="admin-progress-title">Saved progress</h2><button class="secondary" data-admin-action="export-progress" disabled>Download account &amp; saved progress (JSON)</button></div><p class="admin-small">Latest saved state across all ${E(questions.size)} course questions. This download includes this learner’s account details and saved progress, without their activity history.</p><div id="admin-progress-content" aria-live="polite"><p class="admin-loading">Loading saved progress…</p></div></section><section class="admin-panel" aria-labelledby="admin-activity-title"><div class="admin-panel-heading"><h2 id="admin-activity-title">Recorded activity</h2><button class="secondary" data-admin-action="export-events" disabled>Download this activity page (JSON)</button></div><p class="admin-small">Up to 100 recorded activities per page. The download includes only the current page and its filters.</p><form id="admin-event-form" class="admin-event-filters"><label>Activity type<select id="admin-event-type"><option value="">All activity</option>${Object.entries(EVENT_TYPES).map(([value,label])=>`<option value="${E(value)}">${E(label)}</option>`).join('')}</select></label><label>Question number<input id="admin-event-question" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="20" placeholder="Any question"></label><button class="secondary" type="submit">Apply filters</button></form><div id="admin-event-status" role="status"></div><div id="admin-events"></div><div class="admin-pagination"><button class="secondary" data-admin-action="events-first" disabled>First page / refresh</button><span id="admin-event-page">Page 1</span><button class="secondary" data-admin-action="events-next" disabled>Next page →</button></div></section>`;
 }
 async function chooseLearner(learner,focus=true) {
  if (!guard() || !authorized || typeof learner?.userId!=='string' || !learner.userId) return;
  selected={...learner}; progress=null; progressStatus='loading'; events=[]; eventsStatus='loading'; nextCursor=null; currentCursor=null; eventPage=1;
  filters={type:'',question:''};answerFilter={search:'',status:'all'};answerPage=0;reflectionPage=0;
  const seq=++detailRequest;eventRequest++;abort('progress');abort('events');renderUsers();learnerLayout();
  if(focus) $('#admin-learner-name')?.focus({preventScroll:true});
  await Promise.allSettled([loadProgress(seq),loadEvents(null,1)]);
 }
 async function loadProgress(seq) {
  const target=selected.userId,epoch=generation;
  try {
   const result=await request(`/api/admin/progress?${new URLSearchParams({user:target})}`,'progress');
   if(epoch!==generation||seq!==detailRequest||selected?.userId!==target||!guard()) return;
   if(result.learner?.userId!==target) throw new Error('Selected learner did not match');
   progress=result;progressStatus='ready';
   $('#admin-progress-date').textContent=date(result.updatedAt);
   $('[data-admin-action="export-progress"]').disabled=false;
   renderProgress();
  } catch(error) {
   if(epoch!==generation||seq!==detailRequest||selected?.userId!==target) return;
   progressStatus='error';errorAt('#admin-progress-content','Unable to load saved progress. Refresh this learner to try again.',error);
  }
 }
 function renderProgress() {
  const target=$('#admin-progress-content');if(!target||!guard()) return;
  if(progress.state===null) { target.innerHTML='<p class="admin-empty-line">No saved progress has reached this account yet. Recorded activity may still be available below.</p>';return; }
  const state=object(progress.state),answers=object(state.answers),bookmarks=array(state.bookmarks),understood=array(state.understood),walks=object(state.walks);
  const seen=Object.values(walks).reduce((n,w)=>n+Object.values(object(w?.seen)).reduce((s,a)=>s+new Set(array(a)).size,0),0);
  const reflections=reflectionEntries();
  target.innerHTML=`<div class="admin-stats"><div><strong>${E(Object.keys(answers).length)}</strong><span>Saved MCQ responses</span></div><div><strong>${E(Object.values(answers).filter(a=>a?.needsReview).length)}</strong><span>Flagged after content changes</span></div><div><strong>${E(bookmarks.length)}</strong><span>Bookmarked questions</span></div><div><strong>${E(understood.length)}</strong><span>Concepts self-checked</span></div></div><div class="admin-section-head"><h3>Saved answers</h3><p class="admin-small">Question numbers and choice numbers refer to the course’s stored order; the practice screen can shuffle options.</p></div><form id="admin-answer-form" class="admin-answer-filters"><label>Find a saved answer<input id="admin-answer-search" type="search" placeholder="Question number or prompt"></label><label>Show<select id="admin-answer-status"><option value="all">All saved answers</option><option value="incorrect">Does not match current key</option><option value="review">Content changed · revisit</option><option value="unknown">Unavailable question or option</option></select></label><button class="secondary" type="submit">Filter answers</button></form><div id="admin-answers"></div><div class="admin-pagination"><button class="secondary" data-admin-action="answers-prev">← Previous</button><span id="admin-answer-page"></span><button class="secondary" data-admin-action="answers-next">Next →</button></div><details class="admin-detail"><summary>Bookmarked questions · ${E(bookmarks.length)}</summary>${bookmarks.length?`<ul class="admin-reference-list">${bookmarks.map(id=>`<li><strong>${E(questionLabel(id))}</strong><p>${E(questions.get(String(id))?.prompt||'The original question is not available in the current course data.')}</p></li>`).join('')}</ul>`:'<p>No bookmarks saved.</p>'}</details><details class="admin-detail"><summary>Concept self-checks · ${E(understood.length)}</summary>${understood.length?`<ul class="admin-reference-list">${understood.map(id=>`<li>${E(concepts.get(String(id))?.title||`Unknown concept: ${id}`)}${concepts.get(String(id))?`<span class="admin-small"> · ${E(concepts.get(String(id)).chapter)}</span>`:''}</li>`).join('')}</ul>`:'<p>No concept self-checks saved.</p>'}</details><details class="admin-detail"><summary>Guided study · ${E(seen)} steps visited · ${E(reflections.length)} saved reflections</summary><p class="admin-small">These are the current saved reflections, including imported work. Their original submission time may not be recorded. Historical submissions appear in the activity log when available.</p><div id="admin-reflections"></div><div class="admin-pagination"><button class="secondary" data-admin-action="reflections-prev">← Previous</button><span id="admin-reflection-page"></span><button class="secondary" data-admin-action="reflections-next">Next →</button></div></details>${sessionHTML(state.session)}`;
  renderAnswers();renderReflections();
 }
 function savedAnswerRows() {
  return Object.entries(object(progress?.state?.answers)).filter(([id,a])=>{
   const match=`${id} ${questions.get(String(id))?.prompt||''}`.toLocaleLowerCase().includes(answerFilter.search.toLocaleLowerCase());
   return match&&(answerFilter.status==='all'||status(id,a)[0]===answerFilter.status);
  }).sort(([id,a],[jd,b])=>(Number(b?.time)||0)-(Number(a?.time)||0)||String(id).localeCompare(String(jd),undefined,{numeric:true}));
 }
 function renderAnswers() {
  if(!guard()||!$('#admin-answers')) return;
  const rows=savedAnswerRows(),pages=Math.max(1,Math.ceil(rows.length/25));answerPage=Math.max(0,Math.min(answerPage,pages-1));
  $('#admin-answers').innerHTML=rows.slice(answerPage*25,answerPage*25+25).map(([id,value])=>{
   const a=object(value),q=questions.get(String(id)),[kind,label]=status(id,a);
   const savedResult=a.correct===true?'Correct when saved':a.correct===false?'Incorrect when saved':'Not recorded';
   return `<details class="admin-answer"><summary><span><span class="admin-question-label">${E(questionLabel(id))}</span><strong>${E(q?.prompt||'Question text unavailable. The saved response is retained below.')}</strong></span><span class="admin-result ${kind}">${E(label)}</span></summary><div class="admin-answer-body">${q?`<p class="admin-small">${E(chapters.get(String(q.lesson))?.title||q.lesson)} · ${E(q.difficulty||'')}</p>`:''}<dl class="admin-answer-choices"><div><dt>Chosen answer</dt><dd>${E(choiceText(q,a.choice))}</dd></div><div><dt>Current correct answer</dt><dd>${E(q?choiceText(q,q.answer):'Unavailable for this saved question ID')}</dd></div></dl><dl class="admin-meta"><div><dt>Confidence</dt><dd>${E(a.confidence||'Not recorded')}</dd></div><div><dt>Marked attempts</dt><dd>${E(a.attempts===undefined?'Not recorded':count(a.attempts))}</dd></div><div><dt>Answer saved</dt><dd>${E(date(a.time))}</dd></div><div><dt>Saved result</dt><dd>${E(savedResult)}</dd></div><div><dt>Needs another attempt</dt><dd>${a.needsReview?'Yes · content was revised':'Not flagged'}</dd></div></dl></div></details>`;
  }).join('')||'<p class="admin-empty-line">No saved answers match this filter.</p>';
  $('#admin-answer-page').textContent=`${rows.length} responses · Page ${answerPage+1} of ${pages}`;
  $('[data-admin-action="answers-prev"]').disabled=answerPage===0;$('[data-admin-action="answers-next"]').disabled=answerPage>=pages-1;
 }
 function reflectionEntries() {
  return Object.entries(object(progress?.state?.walks)).flatMap(([id,w])=>Object.entries(object(w?.predictions)).filter(([,text])=>typeof text==='string'&&text.trim()).map(([step,text])=>({id,step,text})));
 }
 function renderReflections() {
  if(!guard()||!$('#admin-reflections')) return;
  const rows=reflectionEntries(),pages=Math.max(1,Math.ceil(rows.length/20));reflectionPage=Math.max(0,Math.min(reflectionPage,pages-1));
  $('#admin-reflections').innerHTML=rows.slice(reflectionPage*20,reflectionPage*20+20).map(r=>{
   const match=/^(.+)-(\d+)$/.exec(r.step),step=match?`${TRACK_NAMES[match[1]]||match[1]} · step ${Number(match[2])+1}`:r.step;
   return `<article class="admin-reflection"><h4>${E(concepts.get(r.id)?.title||`Unknown concept: ${r.id}`)}</h4><p class="admin-small">${E(step)}</p><blockquote>${E(r.text)}</blockquote></article>`;
  }).join('')||'<p class="admin-empty-line">No typed reflections saved.</p>';
  $('#admin-reflection-page').textContent=`${rows.length} reflections · Page ${reflectionPage+1} of ${pages}`;
  $('[data-admin-action="reflections-prev"]').disabled=reflectionPage===0;$('[data-admin-action="reflections-next"]').disabled=reflectionPage>=pages-1;
 }
 function sessionHTML(value) {
  if(!value||typeof value!=='object') return '';
  const s=object(value),drafts=object(s.drafts),responses=object(s.responses),strikes=object(s.strikes),confidence=object(s.confidence);
  const ids=[...new Set([...Object.keys(drafts),...Object.keys(responses),...Object.keys(strikes),...Object.keys(confidence)])];
  return `<details class="admin-detail"><summary>Current practice set · ${E(s.finished?'finished':'in progress')} · ${E(ids.length)} questions with selections or notes</summary><p class="admin-small">Selections in an unfinished exam may not be marked yet. These records are separate from the marked answers above.</p>${ids.map(id=>{const q=questions.get(id),choice=responses[id]??drafts[id];return `<article class="admin-session-answer"><h4>${E(questionLabel(id))}</h4><p>${E(choiceText(q,choice))}</p><p class="admin-small">Confidence: ${E(confidence[id]||'Not recorded')}</p>${array(strikes[id]).length?`<p class="admin-small">Crossed out: ${array(strikes[id]).map(i=>E(choiceText(q,i))).join(' · ')}</p>`:''}</article>`;}).join('')||'<p>No selections or notes in this set.</p>'}</details>`;
 }
 async function loadEvents(cursor=null,targetPage=1) {
  if(!guard()||!authorized||!selected) return;
  const target=selected.userId,seq=++eventRequest,learnerSeq=detailRequest,epoch=generation;
  eventsStatus='loading';events=[];nextCursor=null;
  $('#admin-events').innerHTML='';$('#admin-event-status').textContent='Loading recorded activity…';
  root.querySelectorAll('[data-admin-action^="events-"],[data-admin-action="export-events"]').forEach(b=>b.disabled=true);
  const params=new URLSearchParams({user:target});if(filters.type)params.set('type',filters.type);if(filters.question)params.set('question',filters.question);if(cursor)params.set('cursor',cursor);
  try {
   const result=await request(`/api/admin/events?${params}`,'events');
   if(epoch!==generation||learnerSeq!==detailRequest||seq!==eventRequest||selected?.userId!==target||!guard()) return;
   if(!Array.isArray(result.events)||result.events.some(e=>e?.userId!==target)) throw new Error('Selected learner did not match');
   events=result.events;eventsStatus='ready';nextCursor=typeof result.nextCursor==='string'&&result.nextCursor?result.nextCursor:null;currentCursor=cursor;eventPage=targetPage;
   renderEvents();
  } catch(error) {
   if(epoch!==generation||learnerSeq!==detailRequest||seq!==eventRequest||selected?.userId!==target) return;
   eventsStatus='error';errorAt('#admin-event-status','Unable to load activity. Use First page / refresh to try again.',error);
   if(guard()&&$('[data-admin-action="events-first"]')) $('[data-admin-action="events-first"]').disabled=false;
  }
 }
 function renderEvents() {
  $('#admin-event-status').textContent=events.length?`${events.length} recorded activities on this page`:'No recorded activity matches these filters. Earlier study may exist only in saved or imported progress.';
  $('#admin-events').innerHTML=events.map(event=>{
   const d=object(event.details),qid=d.questionId??d.question,reflection=event.type==='walk_prediction'?[d.reflection,d.prediction,d.text,d.response,d.value].find(v=>typeof v==='string'):null;
   return `<article class="admin-event"><div class="admin-event-heading"><h3>${E(EVENT_TYPES[event.type]||event.type||'Study activity')}</h3><time>${E(date(event.occurredAt))}</time></div>${qid!==undefined?`<p class="admin-small">${E(questionLabel(qid))}</p>`:''}${event.path?`<p class="admin-event-path">Page: ${E(event.path)}</p>`:''}${reflection!==null&&reflection!==undefined?`<div class="admin-reflection"><h4>Submitted reflection</h4><blockquote>${E(reflection)}</blockquote></div>`:''}<details class="admin-event-detail"><summary>View activity details</summary><p class="admin-small">Received ${E(date(event.receivedAt))} · Record ${E(event.id)}</p><pre>${E(pretty(event.details))}</pre></details></article>`;
  }).join('');
  $('#admin-event-page').textContent=`Page ${eventPage}`;$('[data-admin-action="events-first"]').disabled=false;$('[data-admin-action="events-next"]').disabled=!nextCursor;$('[data-admin-action="export-events"]').disabled=false;
 }
 function download(kind) {
  if(!guard()||!authorized||!selected) return;
  const exportedAt=new Date().toISOString();let payload;
  if(kind==='progress'&&progressStatus==='ready'&&progress?.learner?.userId===selected.userId) payload={scope:'Selected learner account and current saved progress only; activity history excluded',exportedAt,learner:progress.learner,state:progress.state,version:progress.version,updatedAt:progress.updatedAt};
  else if(kind==='events'&&eventsStatus==='ready') payload={scope:'Selected learner and currently displayed activity page only; other pages and saved progress excluded',exportedAt,learner:{userId:selected.userId,displayName:selected.displayName,fullName:selected.fullName,email:selected.email},filters:{...filters},page:eventPage,cursor:currentCursor,nextCursor,events};
  else return;
  const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download=`EC2K2-private-${String(selected.userId).replace(/[^a-zA-Z0-9_-]/g,'_').slice(0,70)}-${kind==='events'?`activity-page-${eventPage}`:'saved-progress'}-${exportedAt.slice(0,10)}.json`;
  document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  toast(kind==='events'?'This private activity page was downloaded':'This learner’s account and saved progress were downloaded');
 }
 async function bind() {
  const mountedRoot=document.querySelector('#admin-dashboard');if(!mountedRoot||mountedRoot===boundRoot)return;
  root=mountedRoot;boundRoot=mountedRoot;ownerId=userId();
  if(!ownerId){privateOnly();return;}
  layout();
  root.addEventListener('submit',event=>{
   if(!guard())return;
   const form=event.target;
   if(form.id==='admin-search-form'){event.preventDefault();search=$('#admin-search').value.trim();loadUsers(0);}
   if(form.id==='admin-answer-form'){event.preventDefault();answerFilter={search:$('#admin-answer-search').value.trim(),status:$('#admin-answer-status').value};answerPage=0;renderAnswers();}
   if(form.id==='admin-event-form'){
    event.preventDefault();const question=$('#admin-event-question').value.trim();
    if(question&&!/^\d+$/.test(question)){ $('#admin-event-status').textContent='Enter a numeric question number, or leave it blank.';return; }
    filters={type:$('#admin-event-type').value,question};loadEvents(null,1);
   }
  });
  root.addEventListener('click',event=>{
   const button=event.target.closest('button');if(!button||!root.contains(button)||button.disabled||!guard())return;
   if(button.dataset.adminUser!==undefined){const learner=users[Number(button.dataset.adminUser)];if(learner)chooseLearner(learner);return;}
   switch(button.dataset.adminAction){
    case 'users-prev':loadUsers(Math.max(0,page-1));break;
    case 'users-next':if(hasMore)loadUsers(page+1);break;
    case 'refresh-learner':if(selected)chooseLearner(selected,false);break;
    case 'answers-prev':answerPage--;renderAnswers();break;
    case 'answers-next':answerPage++;renderAnswers();break;
    case 'reflections-prev':reflectionPage--;renderReflections();break;
    case 'reflections-next':reflectionPage++;renderReflections();break;
    case 'events-first':loadEvents(null,1);break;
    case 'events-next':if(nextCursor)loadEvents(nextCursor,eventPage+1);break;
    case 'export-progress':download('progress');break;
    case 'export-events':download('events');break;
   }
  });
  identityTimer=setInterval(()=>guard(),1000);
  await loadUsers(0);
 }
 return {view,bind};
}
