'use strict';
const $ = id => document.getElementById(id);
const tasks = ['Close Laptop','Open Fridge','Pull Curtain','Close Drawer'];
const taskIds = ['close_laptop','open_fridge','pull_curtain','close_drawer'];
const asset = 'assets/rebuttal/';
const questions = [
 {reviewer:'mSNH',groups:[
  {label:'Critical weaknesses',items:[['w1','Prior-work comparisons','whole-body-transfer'],['w2','D & response model benefit','d-refinement'],['w3','Success & generalization','completion'],['w4','Implementation & cost','implementation']]},
  {label:'Questions',items:[['q1','Success & failure analysis','completion'],['q2','D contribution details','d-refinement'],['q3','Interaction & contact','resistance'],['q4','Zero-shot scope','visual-alignment']]}
 ]},
 {reviewer:'vfta',groups:[
  {label:'Critical weaknesses',items:[['w1','Contact & task completion','completion'],['w2','Data efficiency & cost','data-efficiency']]},
  {label:'Questions',items:[['q1','Stage-wise results','completion'],['q2','Contact-stage failures','completion'],['q3','Rules & data scaling','implementation']]},
  {label:'Suggestion',items:[['s1','Contact-force proxies','resistance']]}
 ]},
 {reviewer:'fQQ5',groups:[
  {label:'Critical weaknesses',items:[['w1','Image–action consistency','visual-alignment'],['w2','Hardware benefit','d-refinement']]},
  {label:'Minor concerns',items:[['m1','Visual feedback','visual-feedback'],['m2','Overall processing cost','selection-cost']]},
  {label:'Questions',items:[['q1','Image–action mismatch','visual-alignment'],['q2','Gain reliability & success','d-refinement'],['q3','Fixed-image test','visual-feedback'],['q4','Overall collection cost','selection-cost']]}
 ]}
];
const comparisonTopics = {
 'msnh-w1': [
  ['whole-body-transfer','vs. EgoHumanoid: Algorithm'],
  ['capture-setting','vs. HuMI/BifrostUMI: Hardware'],
  ['general-controller','vs. HuMI/BifrostUMI: Algorithm']
 ]
};
const questionTopicLabels = {'msnh-q2': {'d-refinement': 'D & response model benefit', 'selection-cost': 'D selection statistics'}};
const questionTargets = new Map();
let activeQuestionPopup = null;
let popupCloseTimer;
function renderQuestions(){
 const sections=[...document.querySelectorAll('.evidence-section')];
 $('reviewer-index').innerHTML=questions.map(r=>`<div class="reviewer-column"><h2>Reviewer ${r.reviewer}</h2>${r.groups.map(g=>`<div class="reviewer-group"><h3>${g.label}</h3>${g.items.map(q=>{
  const key=`${r.reviewer.toLowerCase()}-${q[0]}`;
  const matching=sections.filter(section=>[...section.querySelectorAll('.reviewer-note li')].some(note=>note.querySelector('strong').textContent===`Reviewer ${r.reviewer}:`&&note.querySelector('span').textContent.toLowerCase().split(',').map(s=>s.trim()).includes(q[0]))).map(section=>section.id);
  const targets=comparisonTopics[key]?.map(([id])=>id)||[q[2],...matching.filter(id=>id!==q[2])];
  const topicLabel=id=>questionTopicLabels[key]?.[id]||comparisonTopics[key]?.find(topic=>topic[0]===id)?.[1]||$(id).querySelector('h2').textContent;
  questionTargets.set(key,targets);
  const label=`<span class="qid">${q[0].toUpperCase()}</span><span>${q[1]}</span>`;
  if(targets.length===1)return `<a class="question-link" href="#${targets[0]}" data-question="${key}">${label}</a>`;
  return `<div class="question-item"><button type="button" class="question-link" data-question="${key}" aria-expanded="false" aria-controls="topics-${key}" aria-haspopup="dialog">${label}<span class="question-chevron" aria-hidden="true">›</span></button><div class="question-popover" id="topics-${key}" popover="manual" role="dialog" aria-labelledby="topics-title-${key}"><p id="topics-title-${key}">Reviewer ${r.reviewer} · ${q[0].toUpperCase()}</p><ul>${targets.map(id=>`<li><a href="#${id}" data-section="${id}" data-owner="${key}">${topicLabel(id)}</a></li>`).join('')}</ul></div></div>`;
 }).join('')}</div>`).join('')}</div>`).join('');
}
function closeQuestionPopup(){
 clearTimeout(popupCloseTimer);
 if(!activeQuestionPopup)return;
 activeQuestionPopup.popup.hidePopover();
 activeQuestionPopup.trigger.setAttribute('aria-expanded','false');
 activeQuestionPopup=null;
}
function positionQuestionPopup(){
 if(!activeQuestionPopup)return;
 const {trigger,popup}=activeQuestionPopup,anchor=trigger.getBoundingClientRect();
 const width=popup.offsetWidth,height=popup.offsetHeight;
 const mobile=matchMedia('(max-width:850px)').matches;
 let left=mobile?anchor.left:anchor.right+10;
 if(left+width>innerWidth-12)left=mobile?innerWidth-width-12:anchor.left-width-10;
 left=Math.max(12,left);
 const headerBottom=mobile?document.querySelector('.rail').getBoundingClientRect().top+$('menu-toggle').offsetHeight:document.querySelector('.masthead').getBoundingClientRect().bottom;
 let top=mobile?anchor.bottom+6:anchor.top;
 if(top+height>innerHeight-12)top=mobile?anchor.top-height-6:innerHeight-height-12;
 top=Math.max(headerBottom+8,top);
 popup.style.left=`${left}px`;popup.style.top=`${top}px`;
}
function showQuestionPopup(trigger){
 clearTimeout(popupCloseTimer);
 if(activeQuestionPopup?.trigger===trigger)return;
 closeQuestionPopup();
 const popup=$(trigger.getAttribute('aria-controls'));
 activeQuestionPopup={trigger,popup};
 popup.showPopover();trigger.setAttribute('aria-expanded','true');positionQuestionPopup();
}
function openQuestion(hash,sectionId){
 const aliases={'msnh-impl':'msnh-w4','msnh-comparison':'msnh-w1','vfta-suggestion':'vfta-s1'};
 hash=aliases[hash]||hash;
 const targets=questionTargets.get(hash);
 if(!targets)return false;
 const target=$(targets.includes(sectionId)?sectionId:targets[0]);
 document.querySelectorAll('[data-question]').forEach(a=>{const selected=a.dataset.question===hash;a.classList.toggle('selected',selected);if(selected)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
 if(target.tagName==='DETAILS')target.open=true;
 target.scrollIntoView({block:'start'});return true;
}
const sectionAliases = {'online-ik':'whole-body-transfer','scope':'visual-alignment','refinement':'d-refinement','hardware':'real-world-demos'};
function openHash(hash){
 if(!hash||openQuestion(hash))return;
 $(sectionAliases[hash]||hash)?.scrollIntoView({block:'start'});
}
function initQuestionNavigation(){
 document.querySelectorAll('.question-item').forEach(item=>{
  const trigger=item.querySelector('.question-link');
  item.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')showQuestionPopup(trigger);});
  item.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse')popupCloseTimer=setTimeout(closeQuestionPopup,180);});
  item.addEventListener('focusout',e=>{if(!item.contains(e.relatedTarget))closeQuestionPopup();});
  trigger.addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();showQuestionPopup(trigger);activeQuestionPopup.popup.querySelector('a').focus();}});
 });
 document.addEventListener('click',e=>{
  const targetLink=e.target.closest('[data-section]');
  const trigger=e.target.closest('[data-question]');
  if(targetLink){
   e.preventDefault();const {owner,section}=targetLink.dataset;
   closeQuestionPopup();$('topic-nav').classList.remove('open');$('menu-toggle').setAttribute('aria-expanded','false');
   history.pushState(null,'','#'+section);openQuestion(owner,section);
  }else if(trigger){
   e.preventDefault();
   if(trigger.hasAttribute('aria-controls')){showQuestionPopup(trigger);return;}
   closeQuestionPopup();$('topic-nav').classList.remove('open');$('menu-toggle').setAttribute('aria-expanded','false');
   history.pushState(null,'','#'+trigger.dataset.question);openQuestion(trigger.dataset.question);
  }else if(activeQuestionPopup&&!activeQuestionPopup.popup.contains(e.target))closeQuestionPopup();
 });
 document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&activeQuestionPopup){const trigger=activeQuestionPopup.trigger;closeQuestionPopup();trigger.focus();}
  if(e.key==='Tab'&&e.target.matches('.question-link[aria-controls]')&&!e.shiftKey)showQuestionPopup(e.target);
 });
 $('topic-nav').addEventListener('scroll',()=>{
  if(!activeQuestionPopup)return;
  const anchor=activeQuestionPopup.trigger.getBoundingClientRect(),nav=$('topic-nav').getBoundingClientRect();
  if(anchor.bottom<nav.top||anchor.top>nav.bottom)closeQuestionPopup();else positionQuestionPopup();
 });
 window.addEventListener('scroll',closeQuestionPopup,{passive:true});
 window.addEventListener('resize',closeQuestionPopup);
}
function table(headers,rows,{highlight=-1,success=-1}={}){
 return `<div class="table-wrap" tabindex="0" role="region" aria-label="Scrollable results table"><table><thead><tr>${headers.map(h=>`<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${rows.map((r,i)=>`<tr${i===highlight?' class="highlight"':''}>${r.map((c,j)=>j===0?`<th scope="row">${c}</th>`:`<td${j===success?' class="success"':''}>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
function options(id,names=tasks){$(id).innerHTML=names.map((n,i)=>`<option value="${i}">${n}</option>`).join('');}
const f2=n=>Number(n).toFixed(2);const score=r=>`${f2(r[3])} ± ${f2(r[4])}`;
const variants=['H','H + K','H + K + D (Unit)','H + K + D (MLP)'];
let data={};
function renderResistance(){const range=$('force-table-range').value;const levels=[0,...(range==='default'?[4,8,12,16,20]:Array.from({length:5},(_,i)=>Number(range)+i))];const headers=['Task',...levels.map(n=>`${n} N`)];for(const [id,key,count] of [['resistance-table','position_error_cm',4],['orientation-table','orientation_error_deg',3]]){$(id).innerHTML=table(headers,tasks.slice(0,count).map((t,i)=>[t,...levels.map(n=>{const value=data.resistance.find(r=>r.task===taskIds[i]&&r.force_n===n)[key];return value==null?'—':f2(value);})]));}}

function renderStages(){const i=Number($('stage-task').value);$('stage-table').innerHTML=table(['Action alignment','S1 (%)','S2 (%)','S3 / full task (%)','Task score (%)'],data.stages.results[i].map((r,j)=>[variants[j],...r.slice(0,3),score(r)]),{highlight:3,success:3});}
function renderRefinement(){const rows=variants.map((v,j)=>[v,...data.stages.results.map(t=>score(t[j]))]);$('refinement-table').innerHTML=table(['Action alignment',...tasks.map(t=>`${t} (%)`)],rows,{highlight:3});}
function renderBudget(){const group=data.budgets[$('budget-source').value],i=Number($('budget-task').value);$('budget-table').innerHTML=table(['Demos','S1 (%)','S2 (%)','S3 / full task (%)','Task score (%)'],group.results[i].map((r,j)=>[group.budgets[j],...r.slice(0,3),score(r)]),{highlight:group.budgets.length-1,success:3});}
function renderVisual(){const i=Number($('visual-task').value);$('visual-table').innerHTML=table(['Augmentation / Rendering','S1 (%)','S2 (%)','S3 / full task (%)','Task score (%)'],data.visual.results[i].map((r,j)=>[`${data.visual.conditions[j].augmentation?'✓':'×'} / ${data.visual.conditions[j].rendering?'✓':'×'}`,...(r?[...r.slice(0,3),score(r)]:['—','—','—','Not applicable'])]),{highlight:i===3?2:3,success:3});}
function setVideo(id,src,poster){const v=$(id);v.pause();v.src=src;v.poster=poster;v.load();v.onended=()=>{const kind=id.startsWith('force')?'force':'vision';if(['baseline','treatment'].every(x=>$(kind+'-'+x).paused))$(kind+'-play').textContent='Play both';};v.onerror=()=>{const kind=id.startsWith('force')?'force':'vision';$(kind+'-play-status').textContent='Video could not load. Check your connection and try again.';};}
function updateForce(){const task=taskIds[Number($('force-task').value)],n=Number($('force-level').value);setVideo('force-baseline',`${asset}videos/resistance/${task}/00.mp4`,`${asset}posters/resistance-${task}-00.jpg`);setVideo('force-treatment',`${asset}videos/resistance/${task}/${String(n).padStart(2,'0')}.mp4`,`${asset}posters/resistance-${task}-${String(n).padStart(2,'0')}.jpg`);$('force-label').textContent=`${n} N`;$('force-play').textContent='Play both';$('force-play-status').textContent='';const base=data.resistance.find(r=>r.task===task&&r.force_n===0),r=data.resistance.find(r=>r.task===task&&r.force_n===n);$('force-reading').innerHTML=`Bilateral position error: <strong>${f2(base.position_error_cm)} cm</strong> at 0 N → <strong>${f2(r.position_error_cm)} cm</strong> at ${n} N. Change: ${r.position_error_increase_vs_0N_cm>=0?'+':''}${f2(r.position_error_increase_vs_0N_cm)} cm.`;}
function updateVision(){const task=taskIds[Number($('vision-task').value)],condition=$('vision-condition').value;$('vision-baseline-label').textContent='Recorded video';for(const [id,c]of [['vision-baseline','video'],['vision-treatment',condition]])setVideo(id,`${asset}videos/vision/${task}/${c}.mp4?v=20261113`,`${asset}posters/vision-${task}-${c}.jpg?v=20261113`);$('vision-label').textContent=$('vision-condition').selectedOptions[0].textContent;$('vision-play').textContent='Play both';$('vision-play-status').textContent='';}
async function playPair(prefix){const vs=[$(prefix+'-baseline'),$(prefix+'-treatment')],btn=$(prefix+'-play'),status=$(prefix+'-play-status');if(vs.some(v=>!v.paused)){vs.forEach(v=>v.pause());btn.textContent='Play both';return;}btn.disabled=true;status.textContent='Loading comparison…';try{await Promise.all(vs.map(v=>new Promise((resolve,reject)=>{if(v.readyState>=3)return resolve();const timer=setTimeout(()=>{cleanup();reject(Error('Video loading timed out'));},20000);const cleanup=()=>{clearTimeout(timer);v.removeEventListener('canplay',ready);v.removeEventListener('error',failed);};const ready=()=>{cleanup();resolve();};const failed=()=>{cleanup();reject(Error('Video load failed'));};v.addEventListener('canplay',ready);v.addEventListener('error',failed);v.preload='auto';v.load();})));vs.forEach(v=>v.currentTime=0);const results=await Promise.allSettled(vs.map(v=>v.play()));if(results.some(r=>r.status==='rejected'))throw Error('Playback unavailable');btn.textContent='Pause both';status.textContent='';}catch(e){vs.forEach(v=>v.pause());status.textContent='Playback could not start. Use the individual play controls or try again.';}finally{btn.disabled=false;}}
function resetPair(prefix){['baseline','treatment'].forEach(x=>{const v=$(prefix+'-'+x);v.pause();v.currentTime=0;});$(prefix+'-play').textContent='Play both';$(prefix+'-play-status').textContent='';}
const stageText=[['The right hand reaches a pressing position above the laptop lid.','The right hand applies an effective downward press.','The laptop lid is fully closed.'],['The left hand reaches the vicinity of the door gap.','The left hand hooks into the door gap.','The refrigerator door opens.'],['The right hand grasps the curtain.','The right hand pulls and moves the curtain.','The curtain is pulled open by one meter.'],['The right foot is raised and the toe is positioned in front of the drawer.','The right foot pushes the drawer inward.','The drawer is fully closed.']];
function renderIK(){
 const variant=$('ik-variant').value;
 document.querySelectorAll('#ik-grid video').forEach(v=>v.pause());
 $('ik-grid').innerHTML=tasks.map((t,i)=>{const slug=['laptop','fridge','curtain','drawer'][i];return `<figure><video controls playsinline preload="none" poster="assets/images/ik-${variant}-${slug}.jpg?v=clean" src="assets/videos/ik-${variant}-${slug}.mp4?v=clean" aria-label="Online IK variant ${variant.toUpperCase()}: ${t}"></video><figcaption>${t}</figcaption></figure>`;}).join('');
}
function initStatic(){renderQuestions();initQuestionNavigation();renderIK();$('ik-variant').onchange=renderIK;$('stage-definitions').innerHTML=`<div class="definitions">${tasks.map((t,i)=>`<article><h3>${t}</h3><ol>${stageText[i].map(s=>`<li>${s}</li>`).join('')}</ol></article>`).join('')}</div>`;['stage-task','force-task','vision-task','budget-task','visual-task'].forEach(x=>options(x));$('force-level').innerHTML=Array.from({length:21},(_,i)=>`<option value="${i}"${i===20?' selected':''}>${i} N</option>`).join('');
 const costs=[['Close Laptop',312,'0.96','0.00','0.00','99.0','6.8','0.67'],['Open Fridge',228,'3.07','0.00','0.00','96.9','5.2','0.44'],['Pull Curtain',251,'0.00','0.00','0.00','100','7.1','0.51'],['Close Drawer',270,'3.33','4.44','0.00','92.2','3.3','0.38'],['Average','265.25','1.84','1.11','0.00','97.1','5.60','0.50']];$('selection-table').innerHTML=table(['Task','Demos','Reject (%)','H (%)','K (%)','D (%)','Mean D round','Time (h)'],costs,{highlight:4});
 $('hardware-grid').innerHTML=tasks.map((t,i)=>{const slug=['laptop','fridge','curtain','drawer'][i];return `<figure><video controls playsinline preload="none" poster="assets/images/deployment-${slug}.jpg" src="assets/videos/deployment-${slug}.mp4" aria-label="Real-robot execution: ${t}"></video><figcaption>${t}</figcaption></figure>`;}).join('');
 window.addEventListener('hashchange',()=>openHash(location.hash.slice(1)));requestAnimationFrame(()=>openHash(location.hash.slice(1)));
 $('menu-toggle').onclick=()=>{closeQuestionPopup();const open=$('topic-nav').classList.toggle('open');$('menu-toggle').setAttribute('aria-expanded',String(open));};
 for(const p of ['force','vision']){$(p+'-play').onclick=()=>playPair(p);$(p+'-reset').onclick=()=>resetPair(p);}
}
async function init(){
 const initialHash=location.hash;
 let userInteracted=false;
 const cancelInitialScroll=()=>{userInteracted=true;};
 const interactionEvents=['wheel','touchstart','pointerdown','keydown'];
 if(initialHash)interactionEvents.forEach(type=>window.addEventListener(type,cancelInitialScroll,{passive:true}));
 initStatic();const files={stages:'subtask_results',budgets:'demonstration_budget_results',visual:'visual_ablation_results',resistance:'resistance'};try{await Promise.all(Object.entries(files).map(async([k,f])=>{const r=await fetch(`${asset}data/${f}.json?v=orientation`);if(!r.ok)throw Error(f);data[k]=await r.json();}));renderStages();renderRefinement();renderBudget();renderVisual();updateForce();updateVision();renderResistance();$('force-table-range').onchange=renderResistance;
 $('stage-task').onchange=renderStages;$('visual-task').onchange=renderVisual;$('budget-source').onchange=()=>{options('budget-task',data.budgets[$('budget-source').value].tasks);renderBudget();};$('budget-task').onchange=renderBudget;['force-task','force-level'].forEach(id=>$(id).onchange=updateForce);['vision-task','vision-condition'].forEach(id=>$(id).onchange=updateVision);
 }catch(e){for(const id of ['stage-table','refinement-table','budget-table','visual-table','resistance-table','orientation-table'])$(id).innerHTML='<p>Results could not load. Please reload this page or consult the <a href="assets/rebuttal/revised-paper.pdf">revised paper</a>.</p>';console.error('Evidence data loading failed',e);}
 if(initialHash){
  await document.fonts.ready;
  await new Promise(requestAnimationFrame);
  interactionEvents.forEach(type=>window.removeEventListener(type,cancelInitialScroll));
  if(!userInteracted&&location.hash===initialHash){
   const id=initialHash.slice(1);
   openHash(id);
  }
 }
}
init();
