
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const STORAGE = 'apexCommandV3';

const defaults = {
  user: {name:'Teri', codeHash:null, remember:true},
  captures: [],
  followups: [],
  outlets: [
    {name:'360',status:'Operational',score:88},
    {name:'Waterfront',status:'Operational',score:82},
    {name:"J's",status:'Attention Needed',score:68},
    {name:'Cap Rock',status:'Operational',score:85},
    {name:'Summit',status:'Operational',score:92}
  ],
  reports: [],
  documents: [
    {id:1,name:'Director Playbook',type:'PDF',time:Date.now()-86400000*12},
    {id:2,name:'Training Standards',type:'PDF',time:Date.now()-86400000*9},
    {id:3,name:'Service Excellence Guide',type:'PDF',time:Date.now()-86400000*7}
  ],
  timeline: [],
  droids: [],
  auth: {loggedIn:false}
};

let state = loadState();
let followFilter = 'open';

function cleanLegacyDemoData(){
  const demoCaptureNotes=new Set(['Great teamwork during rush','Guest recovery win']);
  state.captures=(state.captures||[]).filter(c=>!demoCaptureNotes.has(c.notes));
  const demoFollowups=new Set(['Follow up on training','Review menu timing','New hire check-in']);
  state.followups=(state.followups||[]).filter(f=>!demoFollowups.has(f.title));
  saveState();
}


function clone(o){return JSON.parse(JSON.stringify(o))}
function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE);
    if(!raw) return clone(defaults);
    const parsed = JSON.parse(raw);
    return {...clone(defaults), ...parsed, user:{...defaults.user,...parsed.user}, auth:{...defaults.auth,...parsed.auth}};
  }catch(e){ return clone(defaults); }
}
function saveState(){ localStorage.setItem(STORAGE, JSON.stringify(state)); }
function escapeHtml(s=''){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function uid(){return Date.now()+Math.floor(Math.random()*9999)}
function fmt(t){return new Date(t).toLocaleString([], {month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2600)}
async function hashText(text){
  if(window.crypto?.subtle){
    const data=new TextEncoder().encode(text);
    const hash=await crypto.subtle.digest('SHA-256',data);
    return [...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,'0')).join('');
  }
  let h=0;for(let i=0;i<text.length;i++)h=((h<<5)-h)+text.charCodeAt(i)|0;return String(h);
}

function setupAuth(){
  const logged = state.auth.loggedIn && state.user.remember;
  if(logged) showApp(); else showLogin();
}
function showLogin(){
  $('#loginView').classList.remove('hidden');
  $('#appView').classList.add('hidden');
  $('#firstRunNote').classList.toggle('hidden', !!state.user.codeHash);
}
function showApp(){
  $('#loginView').classList.add('hidden');
  $('#appView').classList.remove('hidden');
  renderAll();
  go('home');
}
$('#loginForm').addEventListener('submit', async e=>{
  e.preventDefault();
  const code=$('#loginCode').value.trim();
  if(!/^\d{4,6}$/.test(code)) return toast('Enter a 4–6 digit access code.');
  const hash=await hashText(code);
  if(!state.user.codeHash){
    state.user.codeHash=hash;
    toast('Local access code created.');
  }else if(state.user.codeHash!==hash){
    return toast('Incorrect access code.');
  }
  state.user.remember=true;
  state.auth.loggedIn=true;
  saveState();
  showApp();
});
$('#resetPasswordBtn').addEventListener('click',()=>{
  if(confirm('Reset the locally stored Apex Command access code?')){
    state.user.codeHash=null;
    state.auth.loggedIn=false;
    saveState();
    $('#loginCode').value='';
    $('#firstRunNote').classList.remove('hidden');
    toast('Local access code reset.');
  }
});
  if(!state.user.codeHash) return toast('Create a local password first.');
  toast('Device sign-in requires native app credentials. Use password in this PWA test build.');
});
$('#logoutBtn').addEventListener('click',()=>{state.auth.loggedIn=false;saveState();$('#drawer').classList.add('hidden');showLogin()});

function go(page){
  $$('.page').forEach(p=>p.classList.toggle('active',p.dataset.page===page));
  $$('.bottom-nav button').forEach(b=>b.classList.toggle('active',b.dataset.go===page));
  $('#drawer').classList.add('hidden');
  window.scrollTo({top:0,behavior:'smooth'});
  renderAll();
  maybeSpawnDroid(page);
}
$$('[data-go]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.go)));
$('#menuBtn').addEventListener('click',()=>$('#drawer').classList.remove('hidden'));
$('#drawer').addEventListener('click',e=>{if(e.target===$('#drawer')) $('#drawer').classList.add('hidden')});
$('#profileBtn').addEventListener('click',()=>toast('Director Teri • Apex Command'));

function populateOutletSelects(){
  const opts=state.outlets.map(o=>`<option>${escapeHtml(o.name)}</option>`).join('');
  $('#capOutlet').innerHTML=opts; $('#fuOutlet').innerHTML=opts;
}
function renderDroidRoster(){
  const roster=$('#droidRoster'); if(!roster)return;
  $('#droidProgress').textContent=`${state.droids.length} / ${droids.length} FOUND`;
  roster.innerHTML=droids.map((d,i)=>{
    const found=state.droids.includes(i);
    const parts=d.name.split(' • ');
    return `<div class="droid-card ${found?'found':'locked'}"><div class="unit">${found?'◉':'?'}</div><b>${escapeHtml(found?parts[0]:'???')}</b><small>${escapeHtml(found?(parts[1]||'UNIT'):'Unknown Unit')}</small></div>`;
  }).join('');
}

function renderHome(){
  const open=state.followups.filter(f=>f.status==='open').length;
  const attention=state.outlets.filter(o=>o.status!=='Operational').length;
  const weekAgo=Date.now()-7*86400000;
  const reportsWeek=state.reports.filter(r=>r.time>weekAgo).length;
  $('#metricFollowups').textContent=open;
  $('#metricCaptures').textContent=state.captures.length;
  $('#metricAttention').textContent=attention;
  $('#metricReports').textContent=reportsWeek;

  $('#homeCaptureList').innerHTML=state.captures.slice().sort((a,b)=>b.time-a.time).slice(0,4).map(c=>`
    <div class="list-row"><div class="list-main"><b>${escapeHtml(c.outlet)} — ${escapeHtml(c.notes)}</b><small>${escapeHtml(c.type)} • ${fmt(c.time)}</small></div><span class="status ${c.priority==='Critical'||c.priority==='High'?'bad':c.priority==='Medium'?'warn':'ok'}">●</span></div>`).join('') || '<div class="empty-capture"><div style="font-size:42px;color:#25afff">▱</div><div style="color:#43c7ff;font-size:20px;margin-top:8px">No captures yet.</div><small style="color:#c4d0d7;font-size:13px;line-height:1.5">Start capturing moments,<br>insights, or observations.</small></div>';

  $('#homeOutletList').innerHTML=state.outlets.map(o=>`
    <div class="list-row"><div class="list-main"><b>${escapeHtml(o.name)}</b><small class="${o.status==='Operational'?'ok':'warn'}">${escapeHtml(o.status)}</small></div><span class="${o.status==='Operational'?'ok':'warn'}">${o.score}%</span></div>`).join('');
}
function renderCaptures(){
  $('#captureList').innerHTML=state.captures.slice().sort((a,b)=>b.time-a.time).map(c=>`
    <div class="list-row">
      <div class="list-main"><b>${escapeHtml(c.outlet)} — ${escapeHtml(c.notes)}</b><small>${escapeHtml(c.type)}${c.person?' • '+escapeHtml(c.person):''} • ${escapeHtml(c.priority)} • ${fmt(c.time)}</small></div>
      <div class="row-actions"><button class="mini-btn danger" onclick="deleteCapture(${c.id})">DELETE</button></div>
    </div>`).join('') || '<div class="list-row">No captures yet.</div>';
}
$('#captureForm').addEventListener('submit',e=>{
  e.preventDefault();
  const notes=$('#capNotes').value.trim(); if(!notes) return;
  const item={id:uid(),outlet:$('#capOutlet').value,type:$('#capType').value,person:$('#capPerson').value.trim(),priority:$('#capPriority').value,notes,time:Date.now(),photoCount:$('#capPhotos').files.length};
  state.captures.push(item);
  addTimeline('Capture added',`${item.outlet} — ${item.notes}`,item.time);
  saveState(); e.target.reset(); populateOutletSelects(); renderAll(); toast('Capture saved.');
});
window.deleteCapture=id=>{
  if(!confirm('Delete this capture?'))return;
  state.captures=state.captures.filter(c=>c.id!==id);saveState();renderAll();toast('Capture deleted.');
};
$('#exportCapturesBtn').addEventListener('click',()=>downloadFile('apex-captures.json',JSON.stringify(state.captures,null,2),'application/json'));

function renderFollowups(){
  let list=state.followups.slice().sort((a,b)=>b.time-a.time);
  if(followFilter!=='all') list=list.filter(f=>f.status===followFilter);
  $('#followupList').innerHTML=list.map(f=>`
    <div class="list-row">
      <div class="list-main"><b>${escapeHtml(f.outlet)} — ${escapeHtml(f.title)}</b><small>${f.owner?escapeHtml(f.owner)+' • ':''}${escapeHtml(f.priority)}${f.due?' • Due '+escapeHtml(f.due):''}</small></div>
      <div class="row-actions">${f.status==='open'?`<button class="mini-btn good" onclick="completeFollowup(${f.id})">COMPLETE</button>`:''}<button class="mini-btn danger" onclick="deleteFollowup(${f.id})">DELETE</button></div>
    </div>`).join('') || '<div class="list-row">Nothing here.</div>';
}
$('#followupForm').addEventListener('submit',e=>{
  e.preventDefault();
  const title=$('#fuTitle').value.trim();if(!title)return;
  const f={id:uid(),title,outlet:$('#fuOutlet').value,owner:$('#fuOwner').value.trim(),due:$('#fuDue').value,priority:$('#fuPriority').value,status:'open',time:Date.now()};
  state.followups.push(f);addTimeline('Follow-up created',`${f.outlet} — ${f.title}`,f.time);saveState();e.target.reset();populateOutletSelects();renderAll();toast('Follow-up added.');
});
window.completeFollowup=id=>{const f=state.followups.find(x=>x.id===id);if(!f)return;f.status='completed';f.completed=Date.now();addTimeline('Follow-up completed',`${f.outlet} — ${f.title}`);saveState();renderAll();toast('Follow-up completed.')};
window.deleteFollowup=id=>{if(!confirm('Delete this follow-up?'))return;state.followups=state.followups.filter(f=>f.id!==id);saveState();renderAll()};
$$('.filter').forEach(b=>b.addEventListener('click',()=>{followFilter=b.dataset.filter;$$('.filter').forEach(x=>x.classList.toggle('active',x===b));renderFollowups()}));

function addTimeline(title,detail,time=Date.now()){state.timeline.push({id:uid(),title,detail,time})}
function renderTimeline(){
  const generated=[
    ...state.captures.map(c=>({title:'Capture',detail:`${c.outlet} — ${c.notes}`,time:c.time})),
    ...state.followups.map(f=>({title:f.status==='completed'?'Follow-up completed':'Follow-up',detail:`${f.outlet} — ${f.title}`,time:f.status==='completed'?(f.completed||f.time):f.time})),
    ...state.reports.map(r=>({title:'Report generated',detail:r.title,time:r.time})),
    ...state.documents.map(d=>({title:'Document added',detail:d.name,time:d.time})),
    ...state.timeline.filter(t=>t.title.includes('Droid'))
  ].sort((a,b)=>b.time-a.time);
  $('#timelineList').innerHTML=generated.map(x=>`<div class="timeline-item"><b>${escapeHtml(x.title)}</b><div>${escapeHtml(x.detail)}</div><small>${fmt(x.time)}</small></div>`).join('')||'<div class="timeline-item">No activity yet.</div>';
}

function renderOutlets(){
  $('#outletList').innerHTML=state.outlets.map(o=>`
  <div class="panel outlet-card ${o.status==='Operational'?'':'warn'}">
    <div class="score">${o.score}%</div><h3>${escapeHtml(o.name)}</h3>
    <p class="${o.status==='Operational'?'ok':'warn'}">${escapeHtml(o.status)}</p>
    <p>${state.followups.filter(f=>f.outlet===o.name&&f.status==='open').length} open follow-up(s) • ${state.captures.filter(c=>c.outlet===o.name).length} capture(s)</p>
    <button class="mini-btn" onclick="askAboutOutlet('${o.name.replace(/'/g,"\\'")}')">ASK APEX AI</button>
  </div>`).join('');
}
window.askAboutOutlet=name=>{go('ai');$('#aiInput').value=`Give me a quick status summary for ${name}.`;setTimeout(sendAI,80)};

function buildReport(kind){
  const now=new Date();
  let title='', body='';
  const open=state.followups.filter(f=>f.status==='open');
  if(kind==='daily'){
    title='Daily Director Summary';
    body=`APEX COMMAND — DAILY DIRECTOR SUMMARY\n${now.toLocaleString()}\n\nCAPTURES\n${state.captures.slice(-5).map(c=>`• ${c.outlet}: ${c.notes}`).join('\n')||'• None'}\n\nOPEN FOLLOW-UPS\n${open.map(f=>`• ${f.outlet}: ${f.title} (${f.priority})`).join('\n')||'• None'}\n\nOUTLETS NEEDING ATTENTION\n${state.outlets.filter(o=>o.status!=='Operational').map(o=>`• ${o.name} — ${o.status} (${o.score}%)`).join('\n')||'• None'}\n\nDIRECTOR FOCUS\nPrioritize high-impact follow-ups, recognize recent wins, and verify any outlet marked for attention.`;
  } else if(kind==='outlet'){
    title='Outlet Performance Report';
    body=`APEX COMMAND — OUTLET PERFORMANCE REPORT\n${now.toLocaleString()}\n\n${state.outlets.map(o=>`${o.name}\nStatus: ${o.status}\nScore: ${o.score}%\nOpen Follow-Ups: ${open.filter(f=>f.outlet===o.name).length}\nCaptures: ${state.captures.filter(c=>c.outlet===o.name).length}`).join('\n\n')}`;
  } else {
    title='Follow-Up Status Report';
    body=`APEX COMMAND — FOLLOW-UP STATUS REPORT\n${now.toLocaleString()}\n\nOPEN\n${open.map(f=>`• ${f.outlet}: ${f.title} | Owner: ${f.owner||'Unassigned'} | Priority: ${f.priority}${f.due?' | Due: '+f.due:''}`).join('\n')||'• None'}\n\nCOMPLETED\n${state.followups.filter(f=>f.status==='completed').map(f=>`• ${f.outlet}: ${f.title}`).join('\n')||'• None'}`;
  }
  const r={id:uid(),title,body,time:Date.now()};state.reports.push(r);addTimeline('Report generated',title,r.time);saveState();renderReports();previewReport(r);toast('Report generated.');
}
$$('[data-report]').forEach(b=>b.addEventListener('click',()=>buildReport(b.dataset.report)));
function renderReports(){
  $('#reportList').innerHTML=state.reports.slice().sort((a,b)=>b.time-a.time).map(r=>`
    <div class="list-row"><div class="list-main"><b>${escapeHtml(r.title)}</b><small>${fmt(r.time)}</small></div>
    <div class="row-actions"><button class="mini-btn" onclick="previewReportById(${r.id})">VIEW</button><button class="mini-btn good" onclick="downloadReport(${r.id})">DOWNLOAD</button><button class="mini-btn danger" onclick="deleteReport(${r.id})">DELETE</button></div></div>`).join('')||'<div class="list-row">No reports generated yet.</div>';
}
function previewReport(r){const p=$('#reportPreview');p.classList.remove('hidden');p.innerHTML=`<h2>${escapeHtml(r.title)}</h2><pre>${escapeHtml(r.body)}</pre><button class="gold-btn" onclick="printReport(${r.id})">PRINT / SAVE PDF</button>`}
window.previewReportById=id=>{const r=state.reports.find(x=>x.id===id);if(r)previewReport(r)};
window.downloadReport=id=>{const r=state.reports.find(x=>x.id===id);if(r)downloadFile(r.title.replace(/\s+/g,'_')+'.txt',r.body,'text/plain')};
window.deleteReport=id=>{state.reports=state.reports.filter(r=>r.id!==id);saveState();renderReports();$('#reportPreview').classList.add('hidden')};
window.printReport=id=>{
  const r=state.reports.find(x=>x.id===id);if(!r)return;
  const w=window.open('','_blank');w.document.write(`<html><head><title>${escapeHtml(r.title)}</title><style>body{font-family:Arial;padding:40px;white-space:pre-wrap;line-height:1.5}h1{color:#222}</style></head><body><h1>${escapeHtml(r.title)}</h1>${escapeHtml(r.body)}</body></html>`);w.document.close();w.print();
};

function renderDocuments(){
  $('#documentList').innerHTML=state.documents.slice().sort((a,b)=>b.time-a.time).map(d=>`
    <div class="list-row"><div class="list-main"><b>${escapeHtml(d.name)}</b><small>${escapeHtml(d.type||'FILE')} • ${fmt(d.time)}</small></div><button class="mini-btn danger" onclick="deleteDocument(${d.id})">DELETE</button></div>`).join('')||'<div class="list-row">No documents.</div>';
}
$('#addDocsBtn').addEventListener('click',()=>{
  const files=[...$('#docUpload').files];if(!files.length)return toast('Choose a document first.');
  files.forEach(f=>{state.documents.push({id:uid(),name:f.name,type:(f.type||'file').split('/').pop().toUpperCase(),size:f.size,time:Date.now()});addTimeline('Document added',f.name)});
  saveState();$('#docUpload').value='';renderAll();toast(`${files.length} document(s) added.`);
});
window.deleteDocument=id=>{state.documents=state.documents.filter(d=>d.id!==id);saveState();renderDocuments()};

function sendAI(){
  const input=$('#aiInput');const q=input.value.trim();if(!q)return;
  const thread=$('#aiThread');thread.insertAdjacentHTML('beforeend',`<div class="chat-msg user">${escapeHtml(q)}</div>`);
  input.value='';
  const lower=q.toLowerCase();
  let a='';
  const open=state.followups.filter(f=>f.status==='open');
  const attention=state.outlets.filter(o=>o.status!=='Operational');
  if(lower.includes('follow')) a=`You have ${open.length} open follow-up${open.length===1?'':'s'}. ${open.slice(0,4).map(f=>`${f.outlet}: ${f.title} (${f.priority})`).join(' • ')||'Nothing is currently open.'}`;
  else if(lower.includes('attention')||lower.includes('focus')) a=attention.length?`Start with ${attention.map(o=>`${o.name} (${o.score}%)`).join(', ')}. Then clear the highest-priority open follow-up and recognize one recent win.`:`No outlet is currently flagged for attention. Focus on your highest-priority follow-ups and recognition opportunities.`;
  else if(lower.includes('summar')) a=`Today’s snapshot: ${state.captures.length} captures logged, ${open.length} open follow-ups, ${attention.length} outlet${attention.length===1?'':'s'} needing attention, and ${state.reports.length} generated reports.`;
  else if(lower.includes('recognition')){const rec=state.captures.filter(c=>c.type==='Recognition').slice(-1)[0];a=rec?`Recognition draft: “I want to recognize the team at ${rec.outlet} for ${rec.notes.toLowerCase()}. Thank you for setting the standard and supporting the operation.”`:`I don’t see a recent recognition capture yet. Add one and I’ll turn it into a polished note.`}
  else {
    const outlet=state.outlets.find(o=>lower.includes(o.name.toLowerCase()));
    if(outlet){a=`${outlet.name} is currently ${outlet.status.toLowerCase()} at ${outlet.score}%. It has ${open.filter(f=>f.outlet===outlet.name).length} open follow-up(s) and ${state.captures.filter(c=>c.outlet===outlet.name).length} capture(s) in this build.`}
    else a=`I can work with the information stored in Apex Command right now: captures, follow-ups, outlet status, reports, timeline, and documents. For this static test build, my responses are generated on-device rather than sent to an external AI service.`;
  }
  setTimeout(()=>{thread.insertAdjacentHTML('beforeend',`<div class="chat-msg ai"><b>Apex AI:</b> ${escapeHtml(a)}</div>`);thread.scrollTop=thread.scrollHeight},180);
}
$('#aiSend').addEventListener('click',sendAI);$('#aiInput').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendAI()}});
$$('.prompt-chip').forEach(b=>b.addEventListener('click',()=>{$('#aiInput').value=b.textContent;sendAI()}));

const droids=[
  {name:'BX-7 • The Scout',text:'Fast, curious, and absolutely convinced every hallway needs reconnaissance.',bonus:'MISSION BONUS: Find one positive moment worth recognizing today.'},
  {name:'TQ-9 • The Analyst',text:'TQ-9 loves numbers, patterns, and quietly judging incomplete follow-ups.',bonus:'MISSION BONUS: Close one overdue or high-priority follow-up.'},
  {name:'PR-3 • The Planner',text:'A tiny strategist with a suspicious number of contingency plans.',bonus:'MISSION BONUS: Review tomorrow’s priorities before leaving today.'},
  {name:'CR-8 • The Coach',text:'CR-8 believes every problem can be improved with clarity, encouragement, and snacks.',bonus:'MISSION BONUS: Give one person specific positive feedback.'},
  {name:'N0-V4 • Unknown Unit',text:'No record exists for this unit. It simply appeared, beeped twice, and seems to like Teri.',bonus:'SECRET BONUS: You found the rare unit. Apex morale increased dramatically.'}
];
let currentDroid=null;
function maybeSpawnDroid(page){
  if(page==='home'||Math.random()<.22){
    const available=droids.map((d,i)=>i).filter(i=>!state.droids.includes(i));
    if(!available.length)return;
    if(Math.random()<.22) setTimeout(()=>toast('Unidentified maintenance unit detected somewhere in Apex Command…'),700);
  }
}
$('#scanDroidBtn').addEventListener('click',()=>discoverDroid(true));
function discoverDroid(force=false){
  const available=droids.map((d,i)=>i).filter(i=>!state.droids.includes(i));
  if(!available.length)return toast('All known droid units have already been discovered.');
  const idx=available[Math.floor(Math.random()*available.length)];
  currentDroid=idx;
  const d=droids[idx];$('#droidName').textContent=d.name;$('#droidText').textContent=d.text;$('#droidBonus').textContent=d.bonus;$('#droidOverlay').classList.remove('hidden');
}
$('#activateDroidBtn').addEventListener('click',()=>{
  if(currentDroid===null)return;
  if(!state.droids.includes(currentDroid)){state.droids.push(currentDroid);addTimeline('Droid discovered',droids[currentDroid].name);saveState();}
  toast(`${droids[currentDroid].name} added to the command roster.`);$('#activateDroidBtn').textContent='UNIT ACTIVATED ✓';renderTimeline();renderDroidRoster();
});
$('#closeDroidBtn').addEventListener('click',()=>{$('#droidOverlay').classList.add('hidden');$('#activateDroidBtn').textContent='ACTIVATE UNIT'});
$('#hotelHoloBtn').addEventListener('click',()=>{go('outlets');toast('Opening outlet overview…')});

function downloadFile(name,content,type){
  const blob=new Blob([content],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)
}
function renderGreeting(){
  const h=new Date().getHours();
  const period=h<12?'morning':h<17?'afternoon':'evening';
  $('#greeting').innerHTML=`Good ${period},<br>Teri.`;
  $('#dailyQuote').innerHTML=`Today’s forecast:<br>100% chance someone<br>will need a decision.`;
}
function renderAll(){populateOutletSelects();renderGreeting();renderHome();renderCaptures();renderFollowups();renderReports();renderTimeline();renderOutlets();renderDocuments();renderDroidRoster();saveState()}

cleanLegacyDemoData();
setupAuth();
