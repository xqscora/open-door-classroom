const PRIVACY_MIN=3;
const SIGNALS={unclear:{label:'I am lost',detail:'Needs another explanation',move:'Add a worked example before independent practice.',body:'Start with one concrete example, then ask for a low-pressure thumbs-up check.'},fast:{label:'Too fast',detail:'Pace is too quick',move:'Pause and give the class two minutes to reconstruct the last step.',body:'Hold the next transition and let students compare notes before moving on.'},example:{label:'Need an example',detail:'Needs a worked example',move:'Model one complete example before the next task.',body:'Show the input, the decision, and the result without asking anyone to volunteer.'},ready:{label:'Ready to stretch',detail:'Ready for an extension',move:'Offer an optional extension while others consolidate.',body:'Keep the core task available and make the harder version genuinely optional.'}};
const STORAGE='open-door-classroom-signals';
let selected=null;
const readSignals=()=>{
  try{
    const parsed=JSON.parse(localStorage.getItem(STORAGE)||'[]');
    return Array.isArray(parsed)?parsed.filter(signal=>Object.prototype.hasOwnProperty.call(SIGNALS,signal)):[];
  }catch(_error){
    return [];
  }
};
const writeSignals=signals=>{
  try{
    localStorage.setItem(STORAGE,JSON.stringify(signals));
    return true;
  }catch(_error){
    return false;
  }
};
const $=selector=>document.querySelector(selector);

function setView(view){
  const student=view==='student';
  $('#studentView').classList.toggle('hidden',!student);
  $('#teacherView').classList.toggle('hidden',student);
  document.querySelectorAll('.tab').forEach(button=>{const active=button.dataset.view===view;button.classList.toggle('selected',active);button.setAttribute('aria-selected',String(active));button.setAttribute('tabindex',active?'0':'-1');});
  if(!student) renderBoard();
}

function renderBoard(){
  const signals=readSignals();
  const counts=Object.fromEntries(Object.keys(SIGNALS).map(key=>[key,0]));
  signals.forEach(signal=>{if(Object.prototype.hasOwnProperty.call(counts,signal)) counts[signal]+=1;});
  const visible=Object.fromEntries(Object.entries(counts).map(([key,count])=>[key,count>=PRIVACY_MIN?count:null]));
  const shownValues=Object.values(visible).filter(value=>value!==null);
  const max=Math.max(1,...shownValues);
  const suppressed=Object.entries(visible).filter(([key,value])=>value===null&&counts[key]>0).length;
  $('#privacyStatus').textContent=`Privacy floor: ${PRIVACY_MIN}`;
  $('#privacyNote').textContent=signals.length
    ? (suppressed?`Only patterns with ${PRIVACY_MIN}+ matching signals are shown. ${suppressed} low-count ${suppressed===1?'category is':'categories are'} hidden.`:`All visible patterns meet the ${PRIVACY_MIN}-signal privacy floor.`)
    : `Patterns stay hidden until at least ${PRIVACY_MIN} matching signals protect a small group.`;
  $('#summary').innerHTML=Object.entries(SIGNALS).map(([key,value])=>`<div class="summary"><strong>${visible[key]===null?'—':visible[key]}</strong><span>${value.label}</span></div>`).join('');
  $('#signalRows').innerHTML=Object.entries(SIGNALS).map(([key,value])=>{const isVisible=visible[key]!==null;const countLabel=isVisible?visible[key]:'Hidden';const width=isVisible?Math.round(visible[key]/max*100):0;const detail=isVisible?value.move:`Hidden until ${PRIVACY_MIN} matching signals are collected.`;return `<div class="signal-row"><div><strong>${value.detail}</strong><span>${detail}</span><div class="bar-track"><div class="bar-fill" style="width:${width}%"></div></div></div><strong>${countLabel}</strong></div>`;}).join('');
  $('#totalSignals').textContent=`${signals.length} signal${signals.length===1?'':'s'}`;
  const priority=Object.entries(visible).filter(([,count])=>count!==null).sort((a,b)=>b[1]-a[1])[0];
  if(!priority){$('#nextTitle').textContent=signals.length?'Collecting private signals':'No signal yet';$('#nextBody').textContent=signals.length?`The board is intentionally withholding low-count patterns until ${PRIVACY_MIN} matching signals protect a small group.`:'Use the student view or load the sample room to see a concrete classroom move.';return;}
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
  if(!selected||!Object.prototype.hasOwnProperty.call(SIGNALS,selected)) return;
  const signals=readSignals();signals.push(selected);
  const saved=writeSignals(signals);
  $('#studentNotice').textContent=saved?'Signal sent. Thank you for making the room easier to read.':'Signal could not be saved on this device. No signal was sent.';
  $('#selectedSignal').classList.add('hidden');$('#selectedSignal').style.display='none';
  document.querySelectorAll('.signal').forEach(item=>item.classList.remove('selected'));selected=null;
});
$('#loadSample').addEventListener('click',()=>{const saved=writeSignals(['unclear','unclear','unclear','unclear','unclear','unclear','fast','fast','fast','example','example','ready']);$('#teacherNotice').textContent=saved?`Loaded synthetic sample data. Counts below ${PRIVACY_MIN} are suppressed. No student identity is stored.`:'Sample data could not be saved on this device.';renderBoard();});
renderBoard();
