import {BASE, SCENARIOS, solve, equilibrium, adPrice, isRate, lmRate} from './model.js';
import {QUIZ, CURVES, SOURCES, MODEL_NOTES} from './content.js';
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const escape = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = (n,d=1) => Number(n).toFixed(d);
const nearly = (a,b) => Math.abs(a-b)<1e-6;
const sign = n => n > 0 ? '+' : n < 0 ? '−' : '';
const signed = (n,d=1) => nearly(n,0) ? fmt(0,d) : sign(n)+fmt(Math.abs(n),d);
const pct = (a,b) => (a/b-1)*100;
const q = new URLSearchParams(location.search);
const state = {scenario: SCENARIOS.some(s=>s.id===q.get('shock'))?q.get('shock'):'money', strength:Math.max(0,Math.min(30,Number(q.get('size')??20)||0)), direction:q.get('direction')==='-1'?-1:1, stage:Math.max(0,Math.min(3,Math.round(Number(q.get('stage')??1)||0))), progress:Math.max(0,Math.min(1,Number(q.get('progress')??0)||0)), history:true};
if(state.stage===3) state.progress=1;
if(state.stage<2) state.progress=0;
let frame=0, playing=false, toastTimeout;
const colors={is:'#8660cd',lm:'#4382c8',fe:'#278a79',ad:'#8660cd',sras:'#dc9461',lras:'#278a79',point:'#263e37'};
const stages=['Before the shock','Short run','Price adjustment','Long run'];
function currentResult(){const result=solve(state.scenario,state.strength,state.direction,state.progress);return {...result,active:state.stage===0?result.initial:result.current,activeParams:state.stage===0?result.initialParams:result.params};}
function setup(){
 $('#scenario-tabs').innerHTML=SCENARIOS.map(s=>`<button data-scenario="${s.id}" aria-pressed="false"><span class="scenario-symbol">${s.symbol}</span>${s.id==='productivity'?'Productive capacity':s.shortLabel}</button>`).join('');
 $$('[data-scenario]').forEach(el=>el.addEventListener('click',()=>{stop();state.scenario=el.dataset.scenario;state.stage=1;state.progress=0;render();}));
 $$('[data-direction]').forEach(el=>el.addEventListener('click',()=>{stop();state.direction=Number(el.dataset.direction);render();}));
 $('#strength').value=state.strength;
 $('#strength').addEventListener('input',e=>{stop();state.strength=Number(e.target.value);render();});
 $$('[data-stage]').forEach(el=>el.addEventListener('click',()=>{stop();state.stage=Number(el.dataset.stage);state.progress=state.stage===3?1:state.stage===2?.5:0;render();}));
 $('#progress').addEventListener('input',e=>{stop();state.progress=Number(e.target.value)/100;state.stage=state.progress===0?1:state.progress===1?3:2;render();});
 $('#history').addEventListener('change',e=>{state.history=e.target.checked;render();});
 $('#play').addEventListener('click',()=>playing?stop():play());
 $('#reset').addEventListener('click',()=>{stop();state.strength=20;state.direction=1;state.stage=0;state.progress=0;state.history=true;$('#strength').value=20;$('#history').checked=true;render();});
 $('#share').addEventListener('click',copyView);
 window.addEventListener('hashchange',switchView);
 buildGuide();buildNotes();setupQuiz();switchView();render();
}
function updateButton(el,selected){el.classList.toggle('selected',selected);el.setAttribute('aria-pressed',String(selected));}
function render(){
 const d=currentResult(),v=d.active, sc=SCENARIOS.find(s=>s.id===state.scenario), up=state.direction>0;
 $$('[data-scenario]').forEach(el=>updateButton(el,el.dataset.scenario===state.scenario));
 $$('[data-direction]').forEach(el=>updateButton(el,Number(el.dataset.direction)===state.direction));
 $$('[data-stage]').forEach(el=>updateButton(el,Number(el.dataset.stage)===state.stage));
 $('#strength-label').textContent=fmt(state.strength/(state.scenario==='productivity'?2:1),state.scenario==='productivity'&&state.strength%2?1:0)+'%';
 $('#strength-max').textContent=state.scenario==='productivity'?'15%':'30%';
 $('#strength').setAttribute('aria-valuetext',`${$('#strength-label').textContent} ${up?'increase':'decrease'} in ${sc.title}`);
 $('#shock-description').textContent=state.scenario==='productivity'?`Full employment output ${up?'rises':'falls'} by ${fmt(state.strength/2,1)}%. This isolates a change in FE and LRAS. Prices stay fixed at impact.`:sc.description;
 $('#progress').value=Math.round(state.progress*100);$('#progress-label').textContent=Math.round(state.progress*100)+'%';
 $$('.stage-pill').forEach(el=>el.textContent=stages[state.stage]);
 $('#metric-y').textContent=fmt(v.Y);$('#metric-r').textContent=fmt(v.r,2)+'%';$('#metric-p').textContent=fmt(v.P,3);
 const gap=(v.Y/v.Ystar-1)*100;
 $('#metric-gap').textContent=signed(gap,1)+'%';
 $('#gap-description').textContent=nearly(gap,0)?'At full employment':gap>0?'Above full employment':'Below full employment';
 metricDelta('y',pct(v.Y,d.initial.Y),'% output');metricDelta('r',v.r-d.initial.r,' pp');metricDelta('p',pct(v.P,d.initial.P),'% prices');
 renderChart('islm-chart','islm',d);renderChart('adas-chart','adas',d);
 $('#islm-caption').textContent=state.stage===0?'A clears the goods, asset and labour markets.':state.stage===3&&state.scenario==='money'?'A = C here. Money leaves the long-run real equilibrium unchanged.':state.stage===3?'C is where IS, LM and the relevant FE line meet.':'The IS-LM intersection determines output at the current price level.';
 $('#adas-caption').textContent=state.stage===0?'A is where AD, SRAS and LRAS meet.':state.stage===3?'C lies on LRAS. The price level has fully adjusted.':state.stage===2?'SRAS moves as prices adjust. The economy moves along the shifted AD.':'AD meets horizontal SRAS at the fixed starting price.';
 if(state.scenario==='productivity'&&state.stage===2) $('#adas-caption').textContent='SRAS moves as prices adjust. AD is unchanged while LRAS is at its new level.';
 renderNarrative(d);renderTable(d);
}
function metricDelta(id,n,suffix){const el=$('#delta-'+id);el.textContent=nearly(n,0)?'At the initial level':signed(n,2)+suffix+' from A';el.classList.toggle('changed',!nearly(n,0));}
function renderChart(id,type,d){
 const svg=$('#'+id), W=600,H=370, L=62,R=548,T=35,B=309, xmin=60,xmax=145,ymin=type==='islm'?0:.55,ymax=type==='islm'?9:1.65;
 const x=Y=>L+(Y-xmin)/(xmax-xmin)*(R-L),y=n=>B-(n-ymin)/(ymax-ymin)*(B-T);
 const params=d.activeParams, v=d.active, yval=s=>type==='islm'?s.r:s.P;
 let parts=[`<title>${type==='islm'?'IS-LM-FE':'AD-AS'} at ${stages[state.stage]}. Output ${fmt(v.Y,2)}, ${type==='islm'?`real interest rate ${fmt(v.r,2)} percent`:`price level ${fmt(v.P,3)}`}.</title><defs><clipPath id="clip-${id}"><rect x="${L}" y="${T}" width="${R-L}" height="${B-T}"/></clipPath></defs>`];
 const path=(fn,color,dashed=false)=>{let p='',pen=false;for(let i=0;i<=240;i++){const Y=xmin+(xmax-xmin)*i/240,val=fn(Y);if(!Number.isFinite(val)){pen=false;continue;}p+=`${pen?'L':'M'}${x(Y).toFixed(2)},${y(val).toFixed(2)} `;pen=true;}return `<path d="${p}" fill="none" stroke="${color}" stroke-width="${dashed?1.5:2.7}" ${dashed?'stroke-dasharray="6 5" opacity=".3"':''} clip-path="url(#clip-${id})"/>`;};
 const vertical=(Y,color,dashed=false)=>`<line x1="${x(Y)}" y1="${T}" x2="${x(Y)}" y2="${B}" stroke="${color}" stroke-width="${dashed?1.5:2.3}" ${dashed?'stroke-dasharray="6 5" opacity=".3"':''}/>`;
 const label=(txt,X,Y,color)=>`<text x="${X}" y="${Y}" fill="${color}" class="svg-curve-label">${txt}</text>`;
 if(!nearly(v.Y,v.Ystar)) parts.push(`<rect x="${Math.min(x(v.Y),x(v.Ystar))}" y="${T}" width="${Math.abs(x(v.Y)-x(v.Ystar))}" height="${B-T}" fill="#e7eedb" opacity=".35"/>`);
 const yticks=type==='islm'?[0,2,4,6,8]:[.6,.8,1,1.2,1.4,1.6];
 for(const n of yticks) parts.push(`<line class="svg-grid" x1="${L}" x2="${R}" y1="${y(n)}" y2="${y(n)}"/><text class="svg-tick" text-anchor="end" x="${L-12}" y="${y(n)+4}">${type==='islm'?n:fmt(n,1)}</text>`);
 for(const n of [60,80,100,120,140])parts.push(`<line class="svg-grid" y1="${T}" y2="${B}" x1="${x(n)}" x2="${x(n)}"/><text class="svg-tick" text-anchor="middle" x="${x(n)}" y="${B+20}">${n}</text>`);
 parts.push(`<path d="M${L} ${T-4}V${B}H${R+8}" fill="none" class="svg-axis"/><text class="svg-axis-label" x="${L-2}" y="18">${type==='islm'?'Real interest rate, r (%)':'Price level, P'}</text><text class="svg-axis-label" text-anchor="end" x="${R+7}" y="${H-12}">Output, Y</text>`);
 if(state.history&&state.stage>0){
  if(type==='islm'){
   if(!nearly(params.a,BASE.a))parts.push(path(Y=>isRate(BASE,Y),colors.is,true));
   if(!nearly(lmRate(params,v.P,100),lmRate(BASE,1,100)))parts.push(path(Y=>lmRate(BASE,1,Y),colors.lm,true));
  }else{
   if(!nearly(adPrice(params,100),adPrice(BASE,100)))parts.push(path(Y=>adPrice(BASE,Y),colors.ad,true));
   if(!nearly(v.P,1))parts.push(path(()=>1,colors.sras,true));
  }
  if(!nearly(params.Ystar,BASE.Ystar))parts.push(vertical(BASE.Ystar,colors.fe,true));
 }
 parts.push(vertical(params.Ystar,colors.fe));
 parts.push(label(type==='islm'?'FE':'LRAS',x(params.Ystar)+8,T+10,colors.fe));
 if(type==='islm'){
  parts.push(path(Y=>isRate(params,Y),colors.is),path(Y=>lmRate(params,v.P,Y),colors.lm));
  const lmIntercept=(params.l0-params.M/v.P)/params.lr;
  const lx=Math.max(xmin+6,Math.min(135,(7.7-lmIntercept)/(params.lY/params.lr)));
  parts.push(label('LM',x(lx)+6,y(lmRate(params,v.P,lx))-9,colors.lm));
  const ix=Math.max(xmin+6,Math.min(138,(params.a-.8)/params.b));
  parts.push(label('IS',x(ix)+6,y(isRate(params,ix))+3,colors.is));
 }else{
  parts.push(path(Y=>adPrice(params,Y),colors.ad),path(()=>v.P,colors.sras));
  let ax=130;while(adPrice(params,ax)<.64&&ax>100)ax-=3;
  parts.push(label('AD',x(ax)+6,y(adPrice(params,ax))+20,colors.ad),label('SRAS',R-41,y(v.P)-10,colors.sras));
 }
 const same=(a,b)=>nearly(a.Y,b.Y)&&nearly(yval(a),yval(b));
 const ghost=(s,txt)=>`<circle cx="${x(s.Y)}" cy="${y(yval(s))}" r="4.5" fill="white" stroke="#96a69b" stroke-width="1.5"/><text text-anchor="end" x="${x(s.Y)-10}" y="${y(yval(s))+19}" class="svg-point-label" fill="#92a494">${txt}</text>`;
 if(state.history&&state.stage>0&&!same(d.initial,v))parts.push(ghost(d.initial,state.stage>=2&&same(d.initial,d.short)?'A = B':'A'));
 if(state.history&&state.stage>=2&&!same(d.short,v)&&!same(d.short,d.initial))parts.push(ghost(d.short,'B'));
 const vx=x(v.Y),vy=y(yval(v));
 parts.push(`<path d="M${L} ${vy}H${vx}V${B}" fill="none" class="svg-guide"/><circle cx="${vx}" cy="${vy}" r="10" fill="#ddebcd" opacity=".85"/><circle cx="${vx}" cy="${vy}" r="5" fill="#263e37" stroke="white" stroke-width="1.5"/>`);
 let point=state.stage===0?'A':state.stage===1?'B':state.stage===3?'C':'Now';
 if(state.stage>0&&same(d.initial,v))point=state.stage===3?'A = C':state.stage===1?'A = B':'A';
 parts.push(`<text x="${vx+12}" y="${vy-12}" class="svg-point-label" fill="#263e37">${point}</text>`);
 if(!nearly(v.Y,100))parts.push(`<rect x="${vx-23}" y="${B+26}" width="46" height="16" rx="3" fill="#eef3e6"/><text text-anchor="middle" x="${vx}" y="${B+38}" class="svg-current-tag">${fmt(v.Y)}</text>`);
 svg.innerHTML=parts.join('');
 svg.setAttribute('aria-label',`${type==='islm'?'IS-LM-FE':'AD-AS'} at ${stages[state.stage]}, output ${fmt(v.Y,2)}, ${type==='islm'?`real interest rate ${fmt(v.r,2)} percent`:`price level ${fmt(v.P,3)}`}. Full employment output ${fmt(v.Ystar)}.`);
}
function renderNarrative(d){
 const up=state.direction>0, expand=state.scenario==='money-demand'?!up:up;
 let title,intro,steps,takeaway,caveat;
 const pos=expand, priceUp=d.long.P>1, g=state.scenario;
 if(state.stage===0){title='Everything starts in balance.';intro='A is the common starting point in both diagrams. The selected shock has not happened yet.';steps=['The labour market gives full employment output of 100.','IS and LM meet at output 100 and a real interest rate of 4%.','AD, horizontal SRAS and LRAS meet at a price level of 1.'];takeaway='Choose Short run to introduce the shock while keeping prices fixed.';}
 else if(state.strength===0){title='No shock, no movement.';intro='The size of the change is zero, so the initial, short-run and long-run outcomes coincide.';steps=['IS, LM and FE continue to meet at A.','AD, SRAS and LRAS also continue to meet at A.','Output, the interest rate and prices remain at their starting values.'];takeaway='Raise the size of the change to explore a shock.';}
 else if(state.stage===1){
  const stories={
   money:{title:up?'More money lowers the interest rate.':'Less money raises the interest rate.',intro:'The price level is fixed at 1, so changing nominal money changes real balances immediately.',steps:[`M/P ${up?'rises':'falls'}, so LM shifts ${up?'down and right':'up and left'}.`,`The real interest rate ${up?'falls':'rises'}. Consumption and investment ${up?'rise':'fall'}.`,`Output ${up?'rises above':'falls below'} full employment. AD shifts ${up?'right':'left'} at the same fixed price.`],takeaway:'The short-run effect is on real activity. The price level has not adjusted yet.'},
   fiscal:{title:up?'More public spending lifts demand.':'Less public spending reduces demand.',intro:'Government purchases change directly. The money stock and full employment output stay fixed.',steps:[`G ${up?'rises':'falls'}, shifting IS ${up?'right':'left'} and AD ${up?'right':'left'}.`,`Output ${up?'rises':'falls'}. Transaction demand for money ${up?'increases':'decreases'}.`,`The economy moves along LM to a ${up?'higher':'lower'} interest rate, which ${up?'restrains':'supports'} private spending.`],takeaway:`Both output and the real interest rate ${up?'rise':'fall'} in the short run.`},
   confidence:{title:up?'Households want to spend more.':'Households become more cautious.',intro:'Autonomous consumption changes at a given income and interest rate.',steps:[`Desired consumption ${up?'rises':'falls'}, shifting IS ${up?'right':'left'}.`,`Output and the real interest rate both ${up?'rise':'fall'} along the unchanged LM curve.`,`AD shifts ${up?'right':'left'}. The price level initially stays at 1.`],takeaway:'A spending shock starts in the goods market, so follow IS first.'},
   'money-demand':{title:up?'The desire to hold money increases.':'People need fewer money balances.',intro:'Nominal money supply stays fixed. The change is in willingness to hold money.',steps:[`At the old rate, there is ${up?'excess demand for':'an excess supply of'} money.`,`The real interest rate ${up?'rises':'falls'} to clear the asset market. LM shifts ${up?'up':'down'}.`,`Consumption, investment and output ${up?'fall':'rise'}. AD shifts ${up?'left':'right'}.`],takeaway:'Money supply and money demand have opposite effects on LM.'},
   productivity:{title:up?'The full employment benchmark rises.':'The full employment benchmark falls.',intro:'This experiment isolates the FE and LRAS shift. At the instant prices are held fixed, IS and LM still intersect at the original output.',steps:[`Y* ${up?'rises':'falls'} to ${fmt(d.params.Ystar)}, shifting both FE and LRAS ${up?'right':'left'}.`,'IS, LM and AD do not shift immediately in this isolated experiment.',`Actual output is still 100, now ${up?'below':'above'} the new full employment output.`],takeaway:'The adjustment is toward the new Y*. Select Adjustment to see prices respond.'}
  };({title,intro,steps,takeaway}=stories[g]);
 }else if(state.stage===2){
  title=priceUp?'Prices rise. Real balances shrink.':'Prices fall. Real balances expand.';
  intro=`The shock remains in place. Prices are ${Math.round(state.progress*100)}% through the illustrated adjustment from B to C.`;
  steps=[`Output at B is ${d.short.Y>d.params.Ystar?'above':'below'} the relevant full employment level, so prices ${priceUp?'rise':'fall'}.`,`M/P ${priceUp?'falls':'rises'}, shifting LM ${priceUp?'up':'down'}. ${priceUp?'Higher':'Lower'} rates move output toward Y*.`,`In AD-AS, horizontal SRAS moves ${priceUp?'up':'down'}. The economy travels along ${g==='productivity'?'the unchanged':'the post-shock'} AD curve.`];
  takeaway=`FE and LRAS stay at ${fmt(d.params.Ystar)} during this adjustment. The price movement does not itself shift AD.`;
 }else{
  if(g==='money'){title='Money is neutral in the long run.';intro='Prices have adjusted enough to restore the original real money balances.';steps=[`The price level is ${fmt(d.long.P,3)}, ${fmt(Math.abs(pct(d.long.P,1)),0)}% ${up?'higher':'lower'} than initially.`,`LM returns to its original position. Output is 100 and the real interest rate is 4%.`,'Consumption and investment return to their initial values. In IS-LM, A and C coincide.'];takeaway='A lasting change in the money stock changes the price level, with no lasting change in real variables here.';}
  else if(g==='fiscal'){title=up?'Higher public spending crowds out private spending.':'Lower public spending makes room for private spending.';intro='Full employment output is fixed at 100 in this Keynesian fiscal experiment.';steps=[`IS remains ${up?'right':'left'} of its initial position. The new full-employment interest rate is ${fmt(d.long.r,2)}%.`,`Prices ${up?'rise':'fall'} to ${fmt(d.long.P,3)}, bringing LM to the new IS-FE intersection.`,`With Y fixed, C + I ${up?'falls':'rises'} by ${fmt(Math.abs(d.long.G-d.initial.G),1)}, exactly offsetting the change in G.`];takeaway='Fiscal policy changes the composition of spending even when long-run total output is unchanged.';}
  else if(g==='confidence'){title='Output returns. The spending mix changes.';intro='Stronger or weaker desired consumption leaves the IS curve in its new position.';steps=[`Output is back at Y* = 100. The real interest rate is ${fmt(d.long.r,2)}%.`,`Consumption is ${fmt(d.long.C,1)} and investment is ${fmt(d.long.I,1)}. Their sum must still equal Y − G.`,`The price level is ${fmt(d.long.P,3)}, making the money market consistent with the new real interest rate.`];takeaway='Returning to full employment does not mean every real variable returns to its starting value.';}
  else if(g==='money-demand'){title='Prices absorb the change in money demand.';intro='The IS-FE intersection is unchanged, so output and the real interest rate return to their initial values.';steps=['Output returns to 100 and the real interest rate returns to 4%.',`The ${up?'lower':'higher'} price level makes real money supply ${up?'larger':'smaller'}, accommodating the changed demand to hold money.`,'Consumption and investment also return to their original levels.'];takeaway='Unlike a change in the money stock, this experiment changes the desired level of real balances.';}
  else {title=up?'More productive capacity supports more output.':'Lost productive capacity means less output.';intro='The economy reaches the new FE and LRAS, rather than returning to the old output level.';steps=[`Full employment output is now ${fmt(d.long.Y,1)}, ${up?'above':'below'} the starting level of 100.`,`The real interest rate ${up?'falls':'rises'} to ${fmt(d.long.r,2)}% along unchanged IS.`,`The price level ${up?'falls':'rises'} to ${fmt(d.long.P,3)}. LM and SRAS adjust to this new equilibrium.`];takeaway=up?'A favourable supply change raises output while lowering prices.':'Lower output and higher prices can occur together after an adverse supply shock.';}
 }
 if(g==='fiscal')caveat='FE is held fixed here, as in the Keynesian fiscal example. In the Classical model, a labour-supply response can shift FE. The long-run endpoint keeps the selected G in place while prices adjust.';
 else if(g==='productivity')caveat='This isolates the change in Y*, holding initial prices fixed. A New Keynesian oil shock can also raise prices immediately. The size shown is the change in Y*, not an estimated change in productivity A.';
 else if(g==='money')caveat='A one-time change in the money stock changes the long-run price level. It does not imply a permanently higher or lower inflation rate.';
 else if(g==='confidence')caveat='The confidence control changes autonomous consumption c₀. It does not simultaneously change wealth, expected productivity or money demand.';
 else caveat='Only autonomous money demand l₀ changes. Money supply and expected inflation remain fixed. Ordinary IS and LM slopes are assumed.';
 $('#mechanism-kicker').textContent=state.stage===0?'THE STARTING POINT':state.stage===3?'THE LONG-RUN RESULT':state.stage===2?'THE RETURN TO EQUILIBRIUM':'WHAT JUST HAPPENED';
 $('#mechanism-title').textContent=title;$('#mechanism-intro').textContent=intro;$('#mechanism-steps').innerHTML=steps.map(t=>`<li>${escape(t)}</li>`).join('');$('#takeaway').textContent=takeaway;$('#scenario-caveat').textContent=caveat;
}
function renderTable(d){
 const rows=[['Output Y','Y',1],['Real rate r','r',2],['Price level P','P',3],['Consumption C','C',1],['Investment I','I',1],['Govt purchases G','G',1],['Full employment Y*','Ystar',1]];
 const active=state.stage===0?0:state.stage===1?1:state.stage===3?2:-1;
 $('#outcomes-table tbody').innerHTML=rows.map(([label,key,dec])=>`<tr><td>${label}</td>${[d.initial,d.short,d.long].map((v,i)=>`<td class="${i===active?'active':''}">${fmt(v[key],dec)}${key==='r'?'%':''}</td>`).join('')}</tr>`).join('');
 $$('#outcomes-table thead th').forEach((el,i)=>el.classList.toggle('active',i-1===active&&i>0));
}
function stop(){if(frame)cancelAnimationFrame(frame);frame=0;playing=false;$('#play-icon').textContent='▶';$('#play-text').textContent='Play';$('#play').setAttribute('aria-label','Animate the price adjustment');}
function play(){stop();if(state.progress>=1||state.stage===0){state.progress=0;state.stage=1;}playing=true;$('#play-icon').textContent='Ⅱ';$('#play-text').textContent='Pause';$('#play').setAttribute('aria-label','Pause the price adjustment');const initial=state.progress,start=performance.now();const duration=7000*(1-initial);function tick(now){state.progress=Math.min(1,initial+(now-start)/7000);state.stage=state.progress>=1?3:2;render();if(state.progress<1&&playing)frame=requestAnimationFrame(tick);else stop();}frame=requestAnimationFrame(tick);}
function switchView(){const name=['lab','guide','quiz','sources'].includes(location.hash.slice(1))?location.hash.slice(1):'lab';if(name!=='lab')stop();$$('.view').forEach(el=>el.hidden=el.id!=='view-'+name);$$('[data-view]').forEach(el=>{el.classList.toggle('active',el.dataset.view===name);if(el.dataset.view===name)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');});$('#breadcrumb-view').textContent={lab:'Policy lab',guide:'Curve guide',quiz:'Test yourself',sources:'Model & sources'}[name];window.scrollTo({top:0,behavior:'instant'});}
function buildGuide(){const color={is:colors.is,lm:colors.lm,fe:colors.fe,ad:colors.ad,sras:colors.sras,lras:colors.lras};$('#curve-grid').innerHTML=CURVES.map(c=>`<article class="curve-card" style="--curve:${color[c.id]}"><div class="curve-card-title"><div class="curve-chip">${c.name}</div><div><h2>${escape(c.market)}</h2><span>${escape(c.slope)}</span></div></div><p class="curve-definition">${escape(c.definition)}</p><h4>WHY THAT SHAPE?</h4><p>${escape(c.why)}</p><h4>WHAT SHIFTS IT?</h4><p>${escape(c.shifters)}</p><p class="curve-trap"><b>Keep in mind</b><br>${escape(c.trap)}</p></article>`).join('');}
function buildNotes(){$('#model-notes').innerHTML=MODEL_NOTES.map((n,i)=>`<article class="note-card"><span>ASSUMPTION ${String(i+1).padStart(2,'0')}</span><h3>${escape(n.title)}</h3><p>${escape(n.text)}</p></article>`).join('');$('#source-list').innerHTML=SOURCES.map(s=>`<div class="source-item"><div><h3>${escape(s.title)}</h3><span>${escape(s.pages)}</span></div><p>${escape(s.coverage)}</p></div>`).join('');}
let quizIndex=0,answers={};
function setupQuiz(){try{const saved=JSON.parse(localStorage.getItem('ec2k2-quiz-v1')||'{}');for(const [key,value] of Object.entries(saved))if(Number.isInteger(Number(key))&&Number(key)>=0&&Number(key)<QUIZ.length&&Number.isInteger(value)&&value>=0&&value<4)answers[key]=value;}catch{}
 $('#quiz-prev').addEventListener('click',()=>{quizIndex=Math.max(0,quizIndex-1);renderQuiz();});$('#quiz-next').addEventListener('click',()=>{quizIndex=(quizIndex+1)%QUIZ.length;renderQuiz();});$('#quiz-restart').addEventListener('click',()=>{answers={};quizIndex=0;saveQuiz();renderQuiz();});renderQuiz();}
function saveQuiz(){try{localStorage.setItem('ec2k2-quiz-v1',JSON.stringify(answers));}catch{}}
function renderQuiz(){const item=QUIZ[quizIndex],choice=answers[quizIndex],answered=choice!==undefined;$('#quiz-question').textContent=item.question;$('#quiz-counter').textContent=`QUESTION ${String(quizIndex+1).padStart(2,'0')} / ${QUIZ.length}`;$('#quiz-bar').style.width=((quizIndex+1)/QUIZ.length*100)+'%';const correct=Object.entries(answers).filter(([k,v])=>QUIZ[k].answer===v).length;$('#quiz-score').textContent=`${correct} correct · ${Object.keys(answers).length} answered`;$('#quiz-options').innerHTML=item.options.map((option,i)=>`<button class="quiz-option ${answered&&i===item.answer?'correct':''} ${answered&&i===choice&&i!==item.answer?'incorrect':''}" data-answer="${i}" ${answered?'disabled':''}><span>${String.fromCharCode(65+i)}</span>${escape(option)}${answered&&i===item.answer?' ✓':''}</button>`).join('');$$('[data-answer]').forEach(el=>el.addEventListener('click',()=>{answers[quizIndex]=Number(el.dataset.answer);saveQuiz();renderQuiz();}));$('#quiz-feedback').hidden=!answered;$('#quiz-feedback').classList.toggle('wrong',answered&&choice!==item.answer);$('#quiz-feedback').innerHTML=answered?`<strong>${choice===item.answer?'Exactly.':'Here is the mechanism.'}</strong>${escape(item.explanation)}<small>${escape(item.source)}</small>`:'';$('#quiz-prev').disabled=quizIndex===0;$('#quiz-next').textContent=quizIndex===QUIZ.length-1?'Back to question 1 ↺':'Next question →';}
async function copyView(){const url=new URL(location.href);url.search='';for(const[k,v]of Object.entries({shock:state.scenario,size:state.strength,direction:state.direction,stage:state.stage,progress:state.progress.toFixed(3)}))url.searchParams.set(k,v);url.hash=location.hash||'#lab';try{await navigator.clipboard.writeText(url.href);toast('Link copied with this scenario and stage.');}catch{toast('Copy the current address to share this view.');history.replaceState(null,'',url);}}
function toast(message){clearTimeout(toastTimeout);$('#toast').textContent=message;$('#toast').hidden=false;toastTimeout=setTimeout(()=>$('#toast').hidden=true,3500);}
setup();
