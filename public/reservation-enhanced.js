(()=>{
const form=document.getElementById('reservationForm');if(!form||form.dataset.enhanced==='1')return;form.dataset.enhanced='1';
const by=id=>document.getElementById(id),date=by('resDate'),party=by('resParty'),name=by('resName'),phone=by('resPhone'),email=by('resEmail'),notes=by('resNotes'),status=by('resStatus'),msg=by('resAvailability'),submit=form.querySelector('.reservation-submit');
let cfg=null,slots=[],reviewSnapshot='',confirmedStep=false;
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function formatTime(v){if(!v)return'';const p=v.split(':').map(Number),h=p[0],m=p[1],amp=h>=12?'PM':'AM';return((h%12)||12)+':'+String(m).padStart(2,'0')+' '+amp}
function formatDate(v){const p=String(v).split('-').map(Number);if(p.length!==3)return v;return new Intl.DateTimeFormat('en-PK',{weekday:'short',day:'2-digit',month:'short',year:'numeric'}).format(new Date(p[0],p[1]-1,p[2]))}
function digits(v){let s=String(v||'').replace(/\D/g,'');if(s.startsWith('92'))s=s.slice(2);if(s.startsWith('0'))s=s.slice(1);return s}
function sessionId(){let s=localStorage.getItem('mrfeast_session_id');if(!s){s=(crypto.randomUUID?crypto.randomUUID():Date.now()+'-'+Math.random().toString(36).slice(2));localStorage.setItem('mrfeast_session_id',s)}return s}
const oldStart=by('resStart'),oldEnd=by('resEnd');
const startSelect=document.createElement('select');startSelect.id='resStart';startSelect.className='reservation-time-select';startSelect.required=true;startSelect.innerHTML='<option value="">Choose date & party size first</option>';oldStart.replaceWith(startSelect);
const durationSelect=document.createElement('select');durationSelect.id='resDuration';durationSelect.className='reservation-time-select';durationSelect.required=true;
const endHidden=document.createElement('input');endHidden.id='resEnd';endHidden.type='hidden';oldEnd.replaceWith(durationSelect);durationSelect.parentElement.childNodes[0].textContent='Duration';durationSelect.parentElement.appendChild(endHidden);
const help=document.createElement('div');help.className='slot-help';durationSelect.parentElement.appendChild(help);
const review=document.createElement('div');review.id='reservationReview';review.className='reservation-review';review.hidden=true;submit.parentElement.insertBefore(review,submit);
const originalParty=party.innerHTML;
function setStatus(t){status.textContent=t||''}
function resetReview(){confirmedStep=false;reviewSnapshot='';review.hidden=true;submit.textContent='Review Reservation'}
function durationOptions(){
  if(!cfg)return;
  const current=Number(durationSelect.value||cfg.default_duration);
  let html='';for(let d=cfg.min_duration;d<=cfg.max_duration;d+=cfg.slot_minutes)html+='<option value="'+d+'">'+d+' minutes'+(d===cfg.default_duration?' · Recommended':'')+'</option>';
  durationSelect.innerHTML=html;durationSelect.value=String([...durationSelect.options].some(o=>Number(o.value)===current)?current:cfg.default_duration);
  help.textContent='Times are shown in '+cfg.slot_minutes+'-minute increments · '+cfg.table_buffer+' min table reset buffer.'
}
function partyOptions(){
  if(!cfg)return;const max=cfg.table_count*cfg.chairs_per_table,current=Math.min(Number(party.value||1),max);party.innerHTML='';for(let i=1;i<=max;i++)party.add(new Option(i+' guest'+(i===1?'':'s'),String(i)));party.value=String(current||1);
  const caps=document.querySelectorAll('.capacity-strip b');if(caps[0])caps[0].textContent=max;if(caps[1])caps[1].textContent=cfg.table_count;if(caps[2])caps[2].textContent=cfg.chairs_per_table
}
async function loadConfig(){
  try{const r=await fetch('/api/reservations/config',{cache:'no-store'}),j=await r.json();if(!r.ok)throw new Error(j.error||'Could not load reservation settings');cfg=j;partyOptions();durationOptions();if(!cfg.enabled){msg.textContent='Reservations are currently closed by Mr. Feast.';submit.disabled=true}else submit.disabled=false;await loadSlots()}catch(e){msg.textContent=e.message||'Reservation schedule unavailable.'}
}
async function loadSlots(){
  resetReview();endHidden.value='';slots=[];const d=date.value,p=Number(party.value||0),dur=Number(durationSelect.value||0);
  startSelect.innerHTML='<option value="">Choose an available time</option>';
  if(!cfg||!d||!p||!dur){msg.textContent=d?'Choose party size and duration.':'Choose a date to see live available times.';return}
  msg.textContent='Checking live table availability…';startSelect.disabled=true;
  try{const r=await fetch('/api/reservations/slots?date='+encodeURIComponent(d)+'&party_size='+p+'&duration='+dur,{cache:'no-store'}),j=await r.json();if(!r.ok)throw new Error(j.error||'Could not load times');slots=j.slots||[];startSelect.innerHTML='<option value="">Choose an available time</option>'+slots.map(s=>'<option value="'+esc(s.start_time)+'" data-end="'+esc(s.end_time)+'">'+formatTime(s.start_time)+' – '+formatTime(s.end_time)+'</option>').join('');msg.textContent=slots.length?slots.length+' available start time'+(slots.length===1?'':'s')+' for '+p+' guest'+(p===1?'':'s')+'.':'No tables are available for this party size and duration. Try another date or duration.'}catch(e){msg.textContent=e.message||'Could not check available times.'}finally{startSelect.disabled=false}
}
function chooseEnd(){const o=startSelect.selectedOptions[0];endHidden.value=o?.dataset.end||'';resetReview();if(startSelect.value&&endHidden.value)msg.textContent='Available · '+formatTime(startSelect.value)+' – '+formatTime(endHidden.value)+'. Your table is not reserved until you confirm below.'}
function values(){return{customer_name:name.value.trim(),phone:'+92'+digits(phone.value),email:email.value.trim().toLowerCase(),reservation_date:date.value,reservation_time:startSelect.value,end_time:endHidden.value,party_size:Number(party.value||0),special_requests:notes.value.trim(),source:'website',session_id:sessionId()}}
function validate(v){if(!v.customer_name)return'Please enter your full name.';if(!/^3\d{9}$/.test(digits(phone.value)))return'Enter a valid Pakistan mobile number: +92 3XX XXXXXXX.';if(!/^\S+@\S+\.\S+$/.test(v.email))return'Enter a valid email address.';if(!v.reservation_date)return'Please choose a reservation date.';if(!v.party_size)return'Please choose party size.';if(!v.reservation_time||!v.end_time)return'Please choose one of the available reservation times.';return''}
function snapshot(v){return JSON.stringify([v.customer_name,v.phone,v.email,v.reservation_date,v.reservation_time,v.end_time,v.party_size,v.special_requests])}
function showReview(v){
  review.className='reservation-review';review.hidden=false;review.innerHTML='<h4>Confirm your reservation</h4><div class="reservation-review-grid"><div><b>Date</b>'+esc(formatDate(v.reservation_date))+'</div><div><b>Time</b>'+esc(formatTime(v.reservation_time))+' – '+esc(formatTime(v.end_time))+'</div><div><b>Guests</b>'+v.party_size+'</div><div><b>Status after booking</b><span class="status-pill-customer pending">Pending confirmation</span></div><div><b>Name</b>'+esc(v.customer_name)+'</div><div><b>Mobile</b>'+esc(v.phone)+'</div><div><b>Email</b>'+esc(v.email)+'</div><div><b>Special request</b>'+esc(v.special_requests||'—')+'</div></div><p class="slot-help">Please check the details. Press <b>Confirm Reservation</b> to book this available slot.</p>';
  submit.textContent='Confirm Reservation';review.scrollIntoView({behavior:'smooth',block:'nearest'})
}
function showSuggestions(j){
  const a=j.suggestions||j.availability?.suggestions||[];if(!a.length)return;
  msg.innerHTML='That time was just taken. Available alternatives: '+a.map(s=>'<button type="button" class="alt-slot" data-start="'+esc(s.start_time)+'">'+esc(formatTime(s.start_time))+'</button>').join(' ')
}
msg.addEventListener('click',e=>{const s=e.target.dataset.start;if(!s)return;startSelect.value=s;chooseEnd();});
date.addEventListener('change',loadSlots);party.addEventListener('change',loadSlots);durationSelect.addEventListener('change',loadSlots);startSelect.addEventListener('change',chooseEnd);
[name,phone,email,notes].forEach(el=>el.addEventListener('input',resetReview));
form.addEventListener('reset',()=>{if(form.dataset.keepSuccess==='1'){form.dataset.keepSuccess='0';return}setTimeout(()=>{resetReview();startSelect.innerHTML='<option value="">Choose a date to see available times</option>';endHidden.value='';if(cfg){partyOptions();durationOptions()}},0)});
form.addEventListener('submit',async e=>{
  e.preventDefault();e.stopImmediatePropagation();const v=values(),bad=validate(v);if(bad){setStatus(bad);return}
  const snap=snapshot(v);
  if(!confirmedStep||reviewSnapshot!==snap){confirmedStep=true;reviewSnapshot=snap;showReview(v);setStatus('Review the details above, then confirm.');return}
  submit.disabled=true;submit.textContent='Booking…';setStatus('Creating your reservation…');
  try{
    const r=await fetch('/api/reservations',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(v)}),j=await r.json();if(!r.ok){showSuggestions(j);throw new Error(j.error||'Reservation failed')}
    review.className='reservation-review reservation-success';review.hidden=false;review.innerHTML='<h4>Reservation #'+esc(j.reservationId)+' received</h4><p><span class="status-pill-customer pending">Pending confirmation</span></p><div class="reservation-review-grid"><div><b>Date</b>'+esc(formatDate(v.reservation_date))+'</div><div><b>Time</b>'+esc(formatTime(v.reservation_time))+' – '+esc(formatTime(v.end_time))+'</div><div><b>Guests</b>'+v.party_size+'</div><div><b>Reference</b>#'+esc(j.reservationId)+'</div></div><p>Your secure management link has also been sent to your email. Keep it private.</p>'+(j.manageUrl?'<a class="manage-link" href="'+esc(j.manageUrl)+'">View / Manage Reservation</a>':'');
    setStatus('Reservation received. It is Pending until Mr. Feast confirms it.');form.dataset.keepSuccess='1';form.reset();date.value='';const dt=by('resDateText');if(dt)dt.textContent='Choose a date';review.hidden=false;submit.textContent='Review Reservation'
  }catch(err){setStatus(err.message||'Reservation failed.');submit.textContent='Review Reservation';confirmedStep=false}finally{submit.disabled=false}
},true);
submit.textContent='Review Reservation';
loadConfig();
})();