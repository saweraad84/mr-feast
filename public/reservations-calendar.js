(()=>{
  const $=id=>document.getElementById(id);
  let reservations=[];
  let settings={closed_weekdays:[],closed_dates:[],open_time:'12:00',close_time:'03:00'};
  let view=new Date();
  view=new Date(view.getFullYear(),view.getMonth(),1);
  let expandedDate='';
  let highlightedId=null;

  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
  function dateOnly(v){return String(v||'').slice(0,10)}
  function fmtTime(v){const s=String(v||'').slice(0,5);return s||'—'}
  function isoLocal(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
  function pkToday(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Karachi',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())}
  function fmtDate(v){const [y,m,d]=String(v).split('-').map(Number);if(!y||!m||!d)return v;return new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'long',year:'numeric'}).format(new Date(y,m-1,d))}
  function mins(v){const [h,m]=String(v||'00:00').split(':').map(Number);return (h||0)*60+(m||0)}
  function operatingOrder(v){let n=mins(v),o=mins(settings.open_time||'12:00');if(n<o)n+=1440;return n}
  function itemsForDate(iso){return reservations.filter(r=>dateOnly(r.reservation_date)===iso).sort((a,b)=>operatingOrder(a.reservation_time)-operatingOrder(b.reservation_time)||Number(a.id)-Number(b.id))}
  function closedReason(d,iso){if((settings.closed_dates||[]).includes(iso))return'Closed';if((settings.closed_weekdays||[]).map(Number).includes(d.getDay()))return'Closed weekday';return''}

  async function login(){
    const msg=$('msg');
    msg.textContent='Signing in…';
    try{
      const r=await fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:$('pw').value})});
      const j=await r.json().catch(()=>({}));
      if(!r.ok){msg.textContent=j.error||'Wrong password';return}
      $('gate').style.display='none';
      $('app').style.display='block';
      msg.textContent='';
      await load();
    }catch(e){msg.textContent='Could not sign in. Please try again.'}
  }

  async function restoreSession(){
    try{
      const r=await fetch('/api/admin/status',{cache:'no-store'}),j=await r.json();
      if(j.authenticated){$('gate').style.display='none';$('app').style.display='block';await load()}
    }catch{}
  }

  async function load(){
    const status=$('status');
    status.textContent='Loading reservations…';
    status.classList.remove('error');
    try{
      const [rr,sr]=await Promise.all([
        fetch('/api/admin/reservations',{cache:'no-store'}),
        fetch('/api/admin/reservation-settings',{cache:'no-store'})
      ]);
      if(rr.status===401||sr.status===401){
        $('app').style.display='none';$('gate').style.display='block';$('msg').textContent='Session expired. Please login again.';return;
      }
      if(!rr.ok)throw new Error('Could not load reservations');
      if(!sr.ok)throw new Error('Could not load reservation schedule');
      reservations=await rr.json();
      settings={...settings,...await sr.json()};
      status.textContent=reservations.length+' reservations loaded · schedule synced';
      render();
    }catch(e){status.textContent=e.message||'Could not load calendar';status.classList.add('error')}
  }

  function render(){
    $('monthTitle').textContent=new Intl.DateTimeFormat('en-GB',{month:'long',year:'numeric'}).format(view);
    const y=view.getFullYear(),m=view.getMonth();
    const first=new Date(y,m,1).getDay(),days=new Date(y,m+1,0).getDate(),prevDays=new Date(y,m,0).getDate();
    const cells=[];
    for(let i=first-1;i>=0;i--)cells.push({date:new Date(y,m-1,prevDays-i),other:true});
    for(let d=1;d<=days;d++)cells.push({date:new Date(y,m,d),other:false});
    while(cells.length%7)cells.push({date:new Date(y,m+1,cells.length-(first+days)+1),other:true});
    if(cells.length<42){let n=1;while(cells.length<42){const last=cells[cells.length-1].date;cells.push({date:new Date(last.getFullYear(),last.getMonth(),last.getDate()+1),other:true});n++}}

    const grid=$('grid');
    grid.innerHTML='';
    for(let w=0;w<cells.length;w+=7){
      const week=document.createElement('div');
      week.className='calendar-week-row';
      const weekCells=cells.slice(w,w+7);
      weekCells.forEach(({date,other})=>week.appendChild(makeDay(date,other)));
      grid.appendChild(week);
      if(expandedDate&&weekCells.some(x=>isoLocal(x.date)===expandedDate))grid.appendChild(makeDetails(expandedDate));
    }
    renderTable();
  }

  function makeDay(d,other){
    const iso=isoLocal(d),items=itemsForDate(iso),today=iso===pkToday(),past=iso<pkToday(),reason=closedReason(d,iso),closed=!!reason;
    const el=document.createElement('div');
    el.className='day'+(other?' other':'')+(today?' today':'')+(past?' past':'')+(closed?' closed':'')+(expandedDate===iso?' expanded':'');
    el.dataset.date=iso;

    const toggle=document.createElement('button');
    toggle.type='button';toggle.className='date-toggle';toggle.setAttribute('aria-label','Show reservations for '+fmtDate(iso));
    toggle.addEventListener('click',()=>toggleDate(iso));
    el.appendChild(toggle);

    const num=document.createElement('div');num.className='date-num';num.textContent=d.getDate();el.appendChild(num);
    if(items.length){
      const wrap=document.createElement('div');wrap.className='bookings';
      items.forEach(r=>{
        const b=document.createElement('button');b.type='button';b.className='booking';b.textContent=fmtTime(r.reservation_time)+'–'+fmtTime(r.end_time);b.title='Reservation #'+r.id;
        b.addEventListener('click',e=>{e.stopPropagation();focusReservation(r.id)});
        wrap.appendChild(b);
      });
      el.appendChild(wrap);
    }else{
      const empty=document.createElement('div');empty.className='empty';empty.textContent=closed?reason:(past?'Past date':'No reservations');el.appendChild(empty);
    }
    return el;
  }

  function toggleDate(iso){expandedDate=expandedDate===iso?'':iso;render()}

  function detailPair(label,value){return `<div><dt>${esc(label)}</dt><dd>${esc(value===''||value==null?'—':value)}</dd></div>`}
  function makeDetails(iso){
    const section=document.createElement('section');section.className='date-details';
    const items=itemsForDate(iso);
    section.innerHTML=`<div class="details-heading"><h3>${esc(fmtDate(iso))} · ${items.length} reservation${items.length===1?'':'s'}</h3><button type="button" class="close-date-details">Close</button></div><div class="details-cards">${items.length?items.map(r=>`<article class="reservation-detail"><h4>#${esc(r.id)} · ${fmtTime(r.reservation_time)}–${fmtTime(r.end_time)}</h4><dl>${detailPair('Customer',r.customer_name)}${detailPair('Guests',r.party_size)}${detailPair('Phone',r.phone)}${detailPair('Email',r.email)}${detailPair('Status',r.status||'pending')}${detailPair('Tables used',r.tables_used)}${detailPair('Table IDs',Array.isArray(r.table_ids)?r.table_ids.join(', '):r.table_ids)}${detailPair('Source',r.source)}${detailPair('Special requests',r.special_requests)}</dl></article>`).join(''):'<div class="reservation-detail">No reservations booked for this date.</div>'}</div>`;
    section.querySelector('.close-date-details').addEventListener('click',()=>{expandedDate='';render()});
    return section;
  }

  function renderTable(){
    const sorted=[...reservations].sort((a,b)=>String(b.reservation_date).localeCompare(String(a.reservation_date))||operatingOrder(b.reservation_time)-operatingOrder(a.reservation_time)||Number(b.id)-Number(a.id));
    $('rows').innerHTML=sorted.map(r=>`<tr id="reservation-row-${esc(r.id)}" data-reservation-id="${esc(r.id)}" class="${String(r.id)===String(highlightedId)?'highlighted':''}"><td>#${esc(r.id)}</td><td>${esc(dateOnly(r.reservation_date))}</td><td>${fmtTime(r.reservation_time)}–${fmtTime(r.end_time)}</td><td>${esc(r.customer_name||'—')}</td><td>${esc(r.party_size??'—')}</td><td>${esc(r.phone||'—')}</td><td>${esc(r.status||'pending')}</td></tr>`).join('')||'<tr><td colspan="7">No reservations yet.</td></tr>';
  }

  function focusReservation(id){
    highlightedId=id;
    renderTable();
    const row=document.getElementById('reservation-row-'+id);
    if(!row)return;
    row.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'});
    row.classList.add('highlighted');
    setTimeout(()=>{if(String(highlightedId)===String(id))row.classList.remove('highlighted')},5000);
  }

  $('go').addEventListener('click',login);
  $('pw').addEventListener('keydown',e=>{if(e.key==='Enter')login()});
  $('prev').addEventListener('click',()=>{view=new Date(view.getFullYear(),view.getMonth()-1,1);expandedDate='';render()});
  $('next').addEventListener('click',()=>{view=new Date(view.getFullYear(),view.getMonth()+1,1);expandedDate='';render()});
  $('refresh').addEventListener('click',load);
  setInterval(()=>{if($('app').style.display!=='none')load()},30000);
  restoreSession();
})();
