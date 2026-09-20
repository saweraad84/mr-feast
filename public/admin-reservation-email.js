var reservationEmailKeys=['reservation_customer_subject','reservation_customer_title','reservation_customer_greeting','reservation_customer_intro','reservation_customer_footer','reservation_customer_signoff','reservation_restaurant_subject','reservation_restaurant_title','reservation_restaurant_intro','reservation_restaurant_footer','closure_email_subject','closure_email_title','closure_email_intro','closure_email_footer','closure_email_signoff'];
var reservationEmailBooleanKeys=['reservation_customer_email_enabled','reservation_restaurant_email_enabled','closure_email_enabled'];
async function loadReservationEmailAdmin(){
  setStatus('reservationEmailStatus','Loading…');
  try{
    var r=await fetch('/api/admin/reservation-email-template',{cache:'no-store'}),j=await r.json();
    if(!r.ok)throw new Error(j.error||'Could not load reservation email settings');
    reservationEmailKeys.forEach(function(k){if($(k)&&j[k]!=null)$(k).value=j[k]});
    reservationEmailBooleanKeys.forEach(function(k){if($(k))$(k).checked=String(j[k])!=='false'});
    setStatus('reservationEmailStatus','Reservation and closure email settings loaded.');
  }catch(e){setStatus('reservationEmailStatus',e.message)}
}
window.loadReservationEmailAdmin=loadReservationEmailAdmin;
$('saveReservationEmailTemplate').onclick=async function(){
  var body={};reservationEmailKeys.forEach(function(k){body[k]=$(k).value});reservationEmailBooleanKeys.forEach(function(k){body[k]=$(k).checked});
  setStatus('reservationEmailStatus','Saving…');
  try{
    var r=await fetch('/api/admin/reservation-email-template',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}),j=await r.json();
    if(!r.ok)throw new Error(j.error||'Could not save reservation email settings');
    setStatus('reservationEmailStatus','Saved. New reservations and emergency closures will use these settings.');
  }catch(e){setStatus('reservationEmailStatus',e.message)}
};
$('resetReservationEmailTemplate').onclick=async function(){
  if(!confirm('Restore default reservation and closure email wording?'))return;
  setStatus('reservationEmailStatus','Restoring defaults…');
  try{
    var r=await fetch('/api/admin/reservation-email-template/reset',{method:'POST'}),j=await r.json();
    if(!r.ok)throw new Error(j.error||'Could not restore defaults');
    await loadReservationEmailAdmin();setStatus('reservationEmailStatus','Default reservation and closure email settings restored.');
  }catch(e){setStatus('reservationEmailStatus',e.message)}
};

setTimeout(function(){if($('manager')&&$('manager').style.display!=='none')loadReservationEmailAdmin()},0);
