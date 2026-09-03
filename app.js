const SIGNALS={unclear:{label:'I am lost',detail:'Needs another explanation',move:'Add a worked example before independent practice.',body:'Start with one concrete example, then ask for a low-pressure thumbs-up check.'},fast:{label:'Too fast',detail:'Pace is too quick',move:'Pause and give the class two minutes to reconstruct the last step.',body:'Hold the next transition and let students compare notes before moving on.'},example:{label:'Need an example',detail:'Needs a worked example',move:'Model one complete example before the next task.',body:'Show the input, the decision, and the result without asking anyone to volunteer.'},ready:{label:'Ready to stretch',detail:'Ready for an extension',move:'Offer an optional extension while others consolidate.',body:'Keep the core task available and make the harder version genuinely optional.'}};
const STORAGE='open-door-classroom-signals';
let selected=null;
const readSignals=()=>JSON.parse(localStorage.getItem(STORAGE)||'[]');
const writeSignals=signals=>localStorage.setItem(STORAGE,JSON.stringify(signals));
const $=selector=>document.querySelector(selector);

function setView(view){
  const student=view==='student';
  $('#studentView').classList.toggle('hidden',!student);
  $('#teacherView').classList.toggle('hidden',student);
  document.querySelectorAll('.tab').forEach(button=>{const active=button.dataset.view===view;button.classList.toggle('selected',active);button.setAttribute('aria-selected',String(active));});
  if(!student) renderBoard();
}

function renderBoard(){
  const signals=readSignals();
  const counts=Object.fromEntries(Object.keys(SIGNALS).map(key=>[key,0]));
  signals.forEach(signal=>{if(Object.prototype.hasOwnProperty.call(counts,signal)) counts[signal]+=1;});
  const max=Math.max(1,...Object.values(counts));
  $('#summary').innerHTML=Object.entries(SIGNALS).map(([key,value])=>`<div class="summary"><strong>${counts[key]}</strong><span>${value.label}</span></div>`).join('');
  $('#signalRows').innerHTML=Object.entries(SIGNALS).map(([key,value])=>`<div class="signal-row"><div><strong>${value.detail}</strong><span>${value.move}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.round(counts[key]/max*100)}%"></div></div></div><strong>${counts[key]}</strong></div>`).join('');
  $('#totalSignals').textContent=`${signals.length} signal${signals.length===1?'':'s'}`;
  const priority=Object.entries(counts).sort((a,b)=>b[1]-a[1])[0];
  if(!signals.length||priority[1]===0){$('#nextTitle').textContent='No signal yet';$('#nextBody').textContent='Use the student view or load the sample room to see a concrete classroom move.';return;}
  $('#nextTitle').textContent=SIGNALS[priority[0]].move;
  $('#nextBody').textContent=SIGNALS[priority[0]].body;
}

document.querySelectorAll('.tab').forEach(button=>button.addEventListener('click',()=>setView(button.dataset.view)));
document.querySelectorAll('.signal').forEach(button=>button.addEventListener('click',()=>{
  selected=button.dataset.signal;
  document.querySelectorAll('.signal').forEach(item=>item.classList.toggle('selected',item===button));
  $('#selectedLabel').textContent=SIGNALS[selected].label;
  $('#selectedSignal').classList.remove('hidden');
  $('#selectedSignal').style.display='flex';
}));
$('#sendSignal').addEventListener('click',()=>{
  const signals=readSignals();signals.push(selected);writeSignals(signals);
  $('#studentNotice').textContent='Signal sent. Thank you for making the room easier to read.';
  $('#selectedSignal').classList.add('hidden');$('#selectedSignal').style.display='none';
  document.querySelectorAll('.signal').forEach(item=>item.classList.remove('selected'));selected=null;
});
$('#loadSample').addEventListener('click',()=>{writeSignals(['unclear','unclear','fast','example','ready']);$('#teacherNotice').textContent='Loaded synthetic sample data. No student identity is stored.';renderBoard();});
renderBoard();
