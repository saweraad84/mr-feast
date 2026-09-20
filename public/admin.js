var $=function(id){return document.getElementById(id)};
var safe=function(v){return String(v==null?'':v).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]})};
var setStatus=function(id,text){var el=$(id);if(el)el.textContent=text||''};
var weekdayIds=['resSun','resMon','resTue','resWed','resThu','resFri','resSat'];
var closedDates=[];
function pkToday(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Karachi',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())}
function setActiveAdminMenu(name){
  document.querySelectorAll('.nav-btn').forEach(function(b){
    var on=b.dataset.panel===name;
    b.classList.toggle('active',on);
    if(on)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');
  });
  if($('panelTitle'))$('panelTitle').textContent='Website Management';
}
function scrollToAdminPanel(name){
  var target=$('panel-'+name);
  if(!target)return;
  setActiveAdminMenu(name);
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  target.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});
}
document.querySelectorAll('.nav-btn').forEach(function(b){
  b.addEventListener('click',function(){scrollToAdminPanel(b.dataset.panel)});
});
var adminScrollTick=false;
function updateAdminMenuFromScroll(){
  adminScrollTick=false;
  if(!$('manager')||$('manager').style.display==='none')return;
  var panels=Array.prototype.slice.call(document.querySelectorAll('.panel'));
  if(!panels.length)return;
  var anchor=Math.min(155,window.innerHeight*.24),current=panels[0];
  panels.forEach(function(p){
    var rect=p.getBoundingClientRect();
    if(rect.top<=anchor)current=p;
  });
  setActiveAdminMenu(String(current.id||'').replace('panel-',''));
}
function scheduleAdminMenuUpdate(){
  if(adminScrollTick)return;
  adminScrollTick=true;
  requestAnimationFrame(updateAdminMenuFromScroll);
}
var adminWorkspace=document.querySelector('.workspace');
if(adminWorkspace)adminWorkspace.addEventListener('scroll',scheduleAdminMenuUpdate,{passive:true});
window.addEventListener('scroll',scheduleAdminMenuUpdate,{passive:true});
window.addEventListener('resize',scheduleAdminMenuUpdate);
async function show(ok){
  $('loginCard').style.display=ok?'none':'grid';
  $('manager').style.display=ok?'grid':'none';
  if(!ok)return;
  await Promise.allSettled([loadRestaurantStatus(),loadReservationSettings()]);
  if(window.loadReservationEmailAdmin)window.loadReservationEmailAdmin();
  if(window.loadCommerceAdmin)window.loadCommerceAdmin();
  setTimeout(updateAdminMenuFromScroll,0);
}
async function login(){
  setStatus('loginStatus','Signing in…');
  try{
    var r=await fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:$('password').value.trim()})});
    var j=await r.json().catch(function(){return {}});
    if(!r.ok){setStatus('loginStatus',j.error||'Login failed');return}
    setStatus('loginStatus','');await show(true);
  }catch(e){setStatus('loginStatus','Could not sign in')}
}
$('login').onclick=login;
$('password').onkeydown=function(e){if(e.key==='Enter')login()};
$('eye').onclick=function(){$('password').type=$('password').type==='password'?'text':'password';$('eye').textContent=$('password').type==='password'?'👁':'🙈'};
$('logout').onclick=async function(){await fetch('/api/admin/logout',{method:'POST'});show(false)};
fetch('/api/admin/status',{cache:'no-store'}).then(function(r){return r.json()}).then(function(x){show(!!x.authenticated)}).catch(function(){show(false)});
async function loadRestaurantStatus(){
  try{
    var r=await fetch('/api/admin/restaurant-status',{cache:'no-store'}),j=await r.json();
    if(!r.ok)throw new Error(j.error||'Could not load restaurant status');
    var badge=$('restaurantStateBadge');badge.textContent=j.open?'RESTAURANT OPEN':'RESTAURANT CLOSED';badge.className='state-pill '+(j.open?'open':'closed');
    $('overviewRestaurantState').textContent=j.open?'Open':'Closed';
    setStatus('restaurantControlStatus',j.open?'Restaurant is open for orders.':'Restaurant is closed'+(j.reason?' · '+j.reason:''));
    $('openRestaurant').disabled=!!j.open;$('closeRestaurant').disabled=!j.open;
    return j;
  }catch(e){setStatus('restaurantControlStatus',e.message);throw e}
}
$('closeRestaurant').onclick=async function(){
  var reason=$('restaurantCloseReason').value.trim()||'an emergency or unexpected operational issue';
  if(!confirm('Close the restaurant now? This will cancel upcoming pending/confirmed reservations and active Queue/Cooking/Ready orders, then email affected customers if closure emails are enabled.'))return;
  setStatus('restaurantControlStatus','Closing restaurant, cancelling active bookings and sending customer emails…');$('closeRestaurant').disabled=true;
  try{
    var r=await fetch('/api/admin/restaurant-close',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({reason:reason})}),j=await r.json();
    if(!r.ok)throw new Error(j.error||'Could not close restaurant');
    setStatus('restaurantControlStatus','Restaurant CLOSED.');
    var box=$('restaurantCloseSummary');box.style.display='block';
    box.innerHTML='<b>Closure complete</b><br>Reservations cancelled: '+Number(j.reservations_cancelled||0)+'<br>Orders cancelled: '+Number(j.orders_cancelled||0)+'<br>Emails sent: '+Number(j.emails_sent||0)+' · Failed: '+Number(j.emails_failed||0)+' · Skipped: '+Number(j.emails_skipped||0);
    await Promise.allSettled([loadRestaurantStatus(),loadReservationSettings()]);
  }catch(e){setStatus('restaurantControlStatus',e.message);$('closeRestaurant').disabled=false}
};
$('openRestaurant').onclick=async function(){
  if(!confirm('Reopen Mr. Feast for new orders? Reservation availability will return to the setting it had before the emergency closure.'))return;
  setStatus('restaurantControlStatus','Reopening restaurant…');
  try{
    var r=await fetch('/api/admin/restaurant-open',{method:'POST'}),j=await r.json();
    if(!r.ok)throw new Error(j.error||'Could not reopen restaurant');
    $('restaurantCloseReason').value='';$('restaurantCloseSummary').style.display='none';setStatus('restaurantControlStatus','Restaurant is OPEN again.');
    await Promise.allSettled([loadRestaurantStatus(),loadReservationSettings()]);
  }catch(e){setStatus('restaurantControlStatus',e.message)}
};
function drawClosedDates(){
  var box=$('closedDateChips');
  box.innerHTML=closedDates.length?closedDates.map(function(d){return '<button type="button" class="action-btn date-chip" data-date="'+safe(d)+'">'+safe(d)+' ×</button>'}).join(''):'<span class="muted">No specific closed dates selected.</span>';
}
$('closedDatePicker').min=pkToday();
$('addClosedDate').onclick=function(){var d=$('closedDatePicker').value;if(d&&closedDates.indexOf(d)===-1){closedDates.push(d);closedDates.sort();drawClosedDates()}$('closedDatePicker').value=''};
$('closedDateChips').onclick=function(e){var d=e.target.dataset.date;if(!d)return;closedDates=closedDates.filter(function(x){return x!==d});drawClosedDates()};
async function loadReservationSettings(){
  try{
    var r=await fetch('/api/admin/reservation-settings',{cache:'no-store'}),j=await r.json();
    if(!r.ok)throw new Error(j.error||'Could not load reservation settings');
    $('reservationTableCount').value=j.table_count||5;$('reservationChairs').value=j.chairs_per_table||4;$('reservationEnabled').value=j.enabled?'open':'closed';
    $('reservationOpenTime').value=j.open_time||'00:00';$('reservationCloseTime').value=j.close_time||'23:59';
    var closed=new Set((j.closed_weekdays||[]).map(Number));weekdayIds.forEach(function(id,i){$(id).checked=closed.has(i)});
    closedDates=(j.closed_dates||[]).slice();drawClosedDates();
    var capacity=Number(j.table_count||5)*Number(j.chairs_per_table||4);
    setStatus('reservationSettingsStatus','Capacity: '+capacity+' guests · '+j.table_count+' tables × '+j.chairs_per_table+' chairs.');
    setStatus('reservationScheduleStatus',j.enabled?'Reservations OPEN · '+j.open_time+'–'+j.close_time:'Reservations are CLOSED');
    $('overviewCapacity').textContent=capacity+' guests';$('overviewReservationState').textContent=j.enabled?'Open':'Closed';return j;
  }catch(e){setStatus('reservationSettingsStatus',e.message);setStatus('reservationScheduleStatus',e.message);throw e}
}
$('saveReservationSettings').onclick=async function(){
  setStatus('reservationSettingsStatus','Saving…');
  try{
    var r=await fetch('/api/admin/reservation-settings',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({table_count:$('reservationTableCount').value,chairs_per_table:$('reservationChairs').value})}),j=await r.json();
    if(!r.ok)throw new Error(j.error||'Could not save capacity');
    var capacity=Number(j.table_count)*Number(j.chairs_per_table);setStatus('reservationSettingsStatus','Saved. Capacity: '+capacity+' guests.');$('overviewCapacity').textContent=capacity+' guests';
  }catch(e){setStatus('reservationSettingsStatus',e.message)}
};
$('saveReservationSchedule').onclick=async function(){
  setStatus('reservationScheduleStatus','Saving schedule…');
  var closed=weekdayIds.map(function(id,i){return $(id).checked?i:null}).filter(function(v){return v!==null});
  var body={enabled:$('reservationEnabled').value==='open',open_time:$('reservationOpenTime').value,close_time:$('reservationCloseTime').value,closed_weekdays:closed,closed_dates:closedDates};
  try{
    var r=await fetch('/api/admin/reservation-settings',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}),j=await r.json();
    if(!r.ok)throw new Error(j.error||'Could not save schedule');
    setStatus('reservationScheduleStatus',j.enabled?'Saved · OPEN '+j.open_time+'–'+j.close_time:'Saved · Reservations CLOSED.');$('overviewReservationState').textContent=j.enabled?'Open':'Closed';
  }catch(e){setStatus('reservationScheduleStatus',e.message)}
};
