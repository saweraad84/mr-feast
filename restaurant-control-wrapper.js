const crypto=require('crypto');
const {Pool}=require('pg');
const expressPath=require.resolve('express');
const expressOriginal=require('express');
const rawFetch=global.fetch;
const pool=new Pool({connectionString:process.env.DATABASE_URL,ssl:process.env.DATABASE_URL?{rejectUnauthorized:false}:false});

const defaults={
  restaurant_open:'true',
  restaurant_closed_reason:'',
  restaurant_closed_at:'',
  reservation_enabled_before_close:'true',
  reservation_customer_email_enabled:'true',
  reservation_restaurant_email_enabled:'true',
  reservation_customer_subject:'Mr. Feast Reservation #{reservation_id}',
  reservation_customer_title:'Reservation Received',
  reservation_customer_greeting:'Hello {customer_name},',
  reservation_customer_intro:'Your reservation #{reservation_id} has been received for {reservation_date}, {start_time}–{end_time}, for {party_size} guest(s).',
  reservation_customer_footer:'Please keep this email for your reservation reference. We look forward to serving you.',
  reservation_customer_signoff:'Mr. Feast',
  reservation_restaurant_subject:'New Mr. Feast Reservation #{reservation_id}',
  reservation_restaurant_title:'New Table Reservation',
  reservation_restaurant_intro:'A new reservation has been booked for {reservation_date}, {start_time}–{end_time}.',
  reservation_restaurant_footer:'Open the Reservation Admin panel to review or update the booking.',
  closure_email_enabled:'true',
  closure_email_subject:'Important: Mr. Feast is closed — {booking_type} #{booking_id} cancelled',
  closure_email_title:'Restaurant Temporarily Closed',
  closure_email_intro:'We are sorry, but Mr. Feast has closed because of {reason}. Your {booking_type} #{booking_id} has been cancelled.',
  closure_email_footer:'We sincerely apologize for the inconvenience and hope to serve you again soon.',
  closure_email_signoff:'Mr. Feast'
};

const templateKeys=[
  'reservation_customer_email_enabled','reservation_restaurant_email_enabled',
  'reservation_customer_subject','reservation_customer_title','reservation_customer_greeting',
  'reservation_customer_intro','reservation_customer_footer','reservation_customer_signoff',
  'reservation_restaurant_subject','reservation_restaurant_title','reservation_restaurant_intro',
  'reservation_restaurant_footer','closure_email_enabled','closure_email_subject','closure_email_title',
  'closure_email_intro','closure_email_footer','closure_email_signoff'
];
const booleanKeys=new Set(['reservation_customer_email_enabled','reservation_restaurant_email_enabled','closure_email_enabled']);

function norm(v){
  let x=String(v==null?'':v).trim();
  if(x.length>1&&((x[0]==='"'&&x[x.length-1]==='"')||(x[0]==="'"&&x[x.length-1]==="'")))x=x.slice(1,-1).trim();
  return x;
}
function token(){
  return crypto.createHmac('sha256',norm(process.env.ADMIN_PASSWORD)).update('mr-feast-admin').digest('hex');
}
function admin(req){
  return (req.headers.cookie||'').split(';').map(function(x){return x.trim()}).includes('mrfeast_admin='+token());
}
function dateOnly(v){
  if(v instanceof Date)return v.toISOString().slice(0,10);
  return String(v||'').slice(0,10);
}
function timeOnly(v){return String(v||'').slice(0,5)}
function pkToday(){
  return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Karachi',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
}
function esc(v){
  return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]});
}
function nl(v){return esc(v).replace(/\n/g,'<br>')}
function fill(v,data){
  let out=String(v==null?'':v);
  Object.entries(data||{}).forEach(function(entry){out=out.split('{'+entry[0]+'}').join(String(entry[1]==null?'':entry[1]))});
  return out;
}
async function init(){
  if(!process.env.DATABASE_URL)return;
  await pool.query("CREATE TABLE IF NOT EXISTS site_settings(setting_key TEXT PRIMARY KEY,setting_value TEXT NOT NULL DEFAULT '',updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())");
  for(const entry of Object.entries(defaults)){
    await pool.query('INSERT INTO site_settings(setting_key,setting_value) VALUES($1,$2) ON CONFLICT(setting_key) DO NOTHING',[entry[0],entry[1]]);
  }
}
async function getSetting(key,fallback){
  if(fallback===undefined)fallback='';
  if(!process.env.DATABASE_URL)return fallback;
  const r=await pool.query('SELECT setting_value FROM site_settings WHERE setting_key=$1',[key]);
  return r.rows.length?String(r.rows[0].setting_value==null?'':r.rows[0].setting_value):fallback;
}
async function setSetting(key,value){
  await pool.query('INSERT INTO site_settings(setting_key,setting_value,updated_at) VALUES($1,$2,NOW()) ON CONFLICT(setting_key) DO UPDATE SET setting_value=$2,updated_at=NOW()',[key,String(value==null?'':value)]);
}
async function getTemplate(){
  const out={};
  templateKeys.forEach(function(k){out[k]=defaults[k]});
  if(!process.env.DATABASE_URL)return out;
  const r=await pool.query('SELECT setting_key,setting_value FROM site_settings WHERE setting_key=ANY($1)',[templateKeys]);
  r.rows.forEach(function(row){out[row.setting_key]=String(row.setting_value==null?'':row.setting_value)});
  return out;
}
async function getEmailTheme(){
  const out={email_header_color:'#171717',email_accent_color:'#6B1F2B',email_gold_color:'#C9A45C',email_background_color:'#F5EFE6',email_card_color:'#FFFFFF'};
  if(!process.env.DATABASE_URL)return out;
  const keys=Object.keys(out);
  const r=await pool.query('SELECT setting_key,setting_value FROM site_settings WHERE setting_key=ANY($1)',[keys]);
  r.rows.forEach(function(row){const v=String(row.setting_value||'').trim();if(/^#[0-9a-fA-F]{6}$/.test(v))out[row.setting_key]=v});
  return out;
}
function shell(theme,title,contentHtml,footer){
  return '<!doctype html><html><body style="margin:0;background:'+theme.email_background_color+';font-family:Arial,Helvetica,sans-serif;color:#262626"><table width="100%" cellspacing="0" cellpadding="0" style="background:'+theme.email_background_color+';padding:24px 10px"><tr><td align="center"><table width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:'+theme.email_card_color+';border-radius:18px;overflow:hidden;border:1px solid #e8dfd2"><tr><td style="background:'+theme.email_header_color+';padding:26px 28px"><div style="font-size:13px;letter-spacing:3px;color:'+theme.email_gold_color+';font-weight:800">MR. FEAST</div><div style="font-size:27px;color:#fff;font-weight:800;margin-top:8px">'+esc(title)+'</div></td></tr><tr><td style="padding:28px">'+contentHtml+'</td></tr><tr><td style="padding:18px 28px;background:'+theme.email_accent_color+';color:#fff;font-size:13px;line-height:1.6">'+nl(footer)+'</td></tr></table></td></tr></table></body></html>';
}
async function sendMail(to,subject,textBody,html){
  const apiKey=norm(process.env.RESEND_API_KEY),recipient=String(to||'').trim();
  if(!apiKey||!recipient||!rawFetch)return false;
  const resp=await rawFetch('https://api.resend.com/emails',{
    method:'POST',
    headers:{Authorization:'Bearer '+apiKey,'Content-Type':'application/json'},
    body:JSON.stringify({from:process.env.ORDER_FROM_EMAIL||'Mr. Feast <onboarding@resend.dev>',to:[recipient],subject:subject,text:textBody,html:html})
  });
  if(!resp.ok){
    let detail='';
    try{detail=await resp.text()}catch(e){}
    console.error('Reservation/closure email failed',resp.status,detail);
  }
  return resp.ok;
}
function reservationData(r){
  return {
    reservation_id:r.id,booking_id:r.id,booking_type:'reservation',customer_name:r.customer_name||'Customer',
    phone:r.phone||'',email:r.email||'',reservation_date:dateOnly(r.reservation_date),
    start_time:timeOnly(r.reservation_time),end_time:timeOnly(r.end_time),party_size:r.party_size||'',
    special_requests:r.special_requests||'',reason:'',total:''
  };
}
async function sendReservationEmails(r){
  if(!r)return {customer:false,restaurant:false};
  const t=await getTemplate(),theme=await getEmailTheme(),data=reservationData(r);
  const rows='<table width="100%" style="font-size:14px;line-height:1.8;margin:18px 0"><tr><td><b>Reservation</b></td><td align="right">#'+esc(r.id)+'</td></tr><tr><td><b>Date</b></td><td align="right">'+esc(data.reservation_date)+'</td></tr><tr><td><b>Time</b></td><td align="right">'+esc(data.start_time)+'–'+esc(data.end_time)+'</td></tr><tr><td><b>Guests</b></td><td align="right">'+esc(data.party_size)+'</td></tr><tr><td><b>Phone</b></td><td align="right">'+esc(data.phone)+'</td></tr><tr><td><b>Special requests</b></td><td align="right">'+esc(data.special_requests||'-')+'</td></tr></table>';
  let customer=false,restaurant=false;
  if(t.reservation_customer_email_enabled!=='false'&&r.email){
    const subject=fill(t.reservation_customer_subject,data);
    const textBody=fill(t.reservation_customer_greeting,data)+'\n\n'+fill(t.reservation_customer_intro,data)+'\n\nReservation #'+r.id+'\nDate: '+data.reservation_date+'\nTime: '+data.start_time+'–'+data.end_time+'\nGuests: '+data.party_size+'\nPhone: '+data.phone+'\nSpecial requests: '+(data.special_requests||'-')+'\n\n'+fill(t.reservation_customer_footer,data)+'\n\n'+fill(t.reservation_customer_signoff,data);
    const contentHtml='<p style="font-size:17px;font-weight:700;margin:0 0 10px">'+nl(fill(t.reservation_customer_greeting,data))+'</p><p style="font-size:15px;line-height:1.7;margin:0">'+nl(fill(t.reservation_customer_intro,data))+'</p>'+rows+'<p style="font-size:14px;line-height:1.7">'+nl(fill(t.reservation_customer_footer,data))+'</p><p style="font-weight:800">'+nl(fill(t.reservation_customer_signoff,data))+'</p>';
    customer=await sendMail(r.email,subject,textBody,shell(theme,fill(t.reservation_customer_title,data),contentHtml,fill(t.reservation_customer_signoff,data)));
  }
  const restaurantEmail=await getSetting('order_email','');
  if(t.reservation_restaurant_email_enabled!=='false'&&restaurantEmail){
    const subject=fill(t.reservation_restaurant_subject,data);
    const textBody=fill(t.reservation_restaurant_intro,data)+'\n\nReservation #'+r.id+'\nCustomer: '+data.customer_name+'\nPhone: '+data.phone+'\nEmail: '+data.email+'\nDate: '+data.reservation_date+'\nTime: '+data.start_time+'–'+data.end_time+'\nGuests: '+data.party_size+'\nSpecial requests: '+(data.special_requests||'-')+'\n\n'+fill(t.reservation_restaurant_footer,data);
    const contentHtml='<p style="font-size:16px;line-height:1.6">'+nl(fill(t.reservation_restaurant_intro,data))+'</p><table width="100%" style="font-size:14px;line-height:1.8"><tr><td><b>Customer</b></td><td align="right">'+esc(data.customer_name)+'</td></tr><tr><td><b>Email</b></td><td align="right">'+esc(data.email)+'</td></tr></table>'+rows+'<p style="font-size:14px;line-height:1.7">'+nl(fill(t.reservation_restaurant_footer,data))+'</p>';
    restaurant=await sendMail(restaurantEmail,subject,textBody,shell(theme,fill(t.reservation_restaurant_title,data),contentHtml,fill(t.reservation_restaurant_footer,data)));
  }
  return {customer:customer,restaurant:restaurant};
}
global.__mrFeastReservationCreated=sendReservationEmails;

async function restaurantStatus(){
  return {open:(await getSetting('restaurant_open','true'))!=='false',reason:await getSetting('restaurant_closed_reason',''),closed_at:await getSetting('restaurant_closed_at','')};
}
function closureData(kind,row,reason){
  if(kind==='reservation'){
    const d=reservationData(row);d.reason=reason;return d;
  }
  return {booking_type:'order',booking_id:row.id,customer_name:row.customer_name||'Customer',phone:row.phone||'',email:row.email||'',total:row.total||0,reservation_date:'',start_time:'',end_time:'',party_size:'',special_requests:row.notes||'',reason:reason};
}
async function sendClosureEmail(kind,row,reason,t,theme){
  if(t.closure_email_enabled==='false'||!row.email)return false;
  const d=closureData(kind,row,reason),subject=fill(t.closure_email_subject,d);
  const timing=kind==='reservation'?'<tr><td><b>Date</b></td><td align="right">'+esc(d.reservation_date)+'</td></tr><tr><td><b>Time</b></td><td align="right">'+esc(d.start_time)+'–'+esc(d.end_time)+'</td></tr>':'<tr><td><b>Order total</b></td><td align="right">Rs. '+esc(d.total)+'</td></tr>';
  const contentHtml='<p style="font-size:16px;line-height:1.7">'+nl(fill(t.closure_email_intro,d))+'</p><table width="100%" style="font-size:14px;line-height:1.8;margin:18px 0"><tr><td><b>Type</b></td><td align="right">'+esc(d.booking_type)+'</td></tr><tr><td><b>Reference</b></td><td align="right">#'+esc(d.booking_id)+'</td></tr>'+timing+'<tr><td><b>Reason</b></td><td align="right">'+esc(reason)+'</td></tr></table><p style="font-size:14px;line-height:1.7">'+nl(fill(t.closure_email_footer,d))+'</p><p style="font-weight:800">'+nl(fill(t.closure_email_signoff,d))+'</p>';
  const textBody=fill(t.closure_email_intro,d)+'\n\n'+d.booking_type+' #'+d.booking_id+(kind==='reservation'?'\nDate: '+d.reservation_date+'\nTime: '+d.start_time+'–'+d.end_time:'\nOrder total: Rs. '+d.total)+'\nReason: '+reason+'\n\n'+fill(t.closure_email_footer,d)+'\n\n'+fill(t.closure_email_signoff,d);
  return sendMail(row.email,subject,textBody,shell(theme,fill(t.closure_email_title,d),contentHtml,fill(t.closure_email_signoff,d)));
}
async function closeRestaurant(reason){
  const why=String(reason||'an emergency or unexpected operational issue').trim();
  const current=await restaurantStatus();
  if(current.open)await setSetting('reservation_enabled_before_close',await getSetting('reservation_enabled','true'));
  await setSetting('restaurant_open','false');
  await setSetting('restaurant_closed_reason',why);
  await setSetting('restaurant_closed_at',new Date().toISOString());
  await setSetting('reservation_enabled','false');

  const reservations=(await pool.query("SELECT * FROM reservations WHERE status IN ('pending','confirmed') AND reservation_date >= $1::date ORDER BY reservation_date,reservation_time,id",[pkToday()])).rows;
  let orders=[];
  try{orders=(await pool.query("SELECT * FROM orders WHERE status IN ('queue','cooking','ready') ORDER BY id")).rows}catch(e){if(!e||e.code!=='42P01')throw e}
  if(reservations.length)await pool.query("UPDATE reservations SET status='cancelled',updated_at=NOW() WHERE id=ANY($1::int[])",[reservations.map(function(x){return Number(x.id)})]);
  if(orders.length)await pool.query("UPDATE orders SET status='cancelled',updated_at=NOW() WHERE id=ANY($1::int[])",[orders.map(function(x){return Number(x.id)})]);

  const t=await getTemplate(),theme=await getEmailTheme();
  let sent=0,failed=0,skipped=0;
  for(const row of reservations){
    if(t.closure_email_enabled==='false'||!row.email){skipped++;continue}
    try{if(await sendClosureEmail('reservation',row,why,t,theme))sent++;else failed++}catch(e){console.error(e);failed++}
  }
  for(const row of orders){
    if(t.closure_email_enabled==='false'||!row.email){skipped++;continue}
    try{if(await sendClosureEmail('order',row,why,t,theme))sent++;else failed++}catch(e){console.error(e);failed++}
  }
  return {ok:true,open:false,reason:why,reservations_cancelled:reservations.length,orders_cancelled:orders.length,emails_sent:sent,emails_failed:failed,emails_skipped:skipped};
}
async function openRestaurant(){
  await setSetting('restaurant_open','true');
  await setSetting('restaurant_closed_reason','');
  await setSetting('restaurant_closed_at','');
  const previous=await getSetting('reservation_enabled_before_close','true');
  await setSetting('reservation_enabled',previous==='false'?'false':'true');
  return {ok:true,open:true,reservations_enabled:previous!=='false'};
}

function attach(app){
  app.use(expressOriginal.json({limit:'2mb'}));
  app.get('/api/restaurant-status',async function(req,res){
    try{res.json(await restaurantStatus())}catch(e){res.status(500).json({error:'Could not load restaurant status'})}
  });
  app.post('/api/orders',async function(req,res,next){
    try{
      const s=await restaurantStatus();
      if(!s.open)return res.status(503).json({error:'Restaurant is currently closed. Orders are temporarily unavailable.',reason:s.reason});
      next();
    }catch(e){next()}
  });
  app.get('/api/admin/restaurant-status',async function(req,res){
    if(!admin(req))return res.status(401).json({error:'Unauthorized'});
    try{res.json(await restaurantStatus())}catch(e){res.status(500).json({error:'Could not load restaurant status'})}
  });
  app.post('/api/admin/restaurant-close',async function(req,res){
    if(!admin(req))return res.status(401).json({error:'Unauthorized'});
    try{res.json(await closeRestaurant(req.body&&req.body.reason))}catch(e){console.error(e);res.status(500).json({error:'Could not close restaurant and cancel active bookings'})}
  });
  app.post('/api/admin/restaurant-open',async function(req,res){
    if(!admin(req))return res.status(401).json({error:'Unauthorized'});
    try{res.json(await openRestaurant())}catch(e){console.error(e);res.status(500).json({error:'Could not reopen restaurant'})}
  });
  app.get('/api/admin/reservation-email-template',async function(req,res){
    if(!admin(req))return res.status(401).json({error:'Unauthorized'});
    try{res.json(await getTemplate())}catch(e){res.status(500).json({error:'Could not load reservation email settings'})}
  });
  app.put('/api/admin/reservation-email-template',async function(req,res){
    if(!admin(req))return res.status(401).json({error:'Unauthorized'});
    try{
      const body=req.body||{};
      for(const k of templateKeys){
        if(!(k in body))continue;
        let v=booleanKeys.has(k)?(body[k]===true||String(body[k])==='true'?'true':'false'):String(body[k]==null?'':body[k]).trim();
        if(!booleanKeys.has(k)&&!v)v=defaults[k];
        await setSetting(k,v);
      }
      res.json({ok:true,settings:await getTemplate()});
    }catch(e){console.error(e);res.status(500).json({error:'Could not save reservation email settings'})}
  });
  app.post('/api/admin/reservation-email-template/reset',async function(req,res){
    if(!admin(req))return res.status(401).json({error:'Unauthorized'});
    try{
      for(const k of templateKeys)await setSetting(k,defaults[k]);
      res.json({ok:true,settings:await getTemplate()});
    }catch(e){console.error(e);res.status(500).json({error:'Could not reset reservation email settings'})}
  });
}

function wrappedExpress(){
  const app=expressOriginal.apply(null,arguments);
  attach(app);
  return app;
}
Object.assign(wrappedExpress,expressOriginal);
require.cache[expressPath].exports=wrappedExpress;
init().then(function(){require('./email-admin-wrapper')}).catch(function(e){console.error(e);process.exit(1)});
