const crypto=require('crypto');
const {Pool}=require('pg');
const expressPath=require.resolve('express');
const expressOriginal=require('express');
const rawFetch=global.fetch;
const pool=new Pool({connectionString:process.env.DATABASE_URL,ssl:process.env.DATABASE_URL?{rejectUnauthorized:false}:false});

const MENU=[
  ['Classic Burger','Fast Food',450],['Zinger Burger','Fast Food',550],['Chicken Pizza','Fast Food',850],
  ['Chicken Shawarma','Fast Food',350],['Fries','Fast Food',250],['Club Sandwich','Fast Food',550],
  ['Chicken Tikka','BBQ',450],['Malai Boti','BBQ',600],['Seekh Kebab','BBQ',550],['Chicken Wings','BBQ',550],
  ['BBQ Platters','BBQ',1350],['Gulab Jamun','Sweets',220],['Rasmalai','Sweets',280],['Kheer','Sweets',250],
  ['Brownies','Sweets',300],['Ice Cream','Desserts',250],['Chocolate Lava Cake','Desserts',450],
  ['Cheesecake','Desserts',500],['Waffles','Desserts',450],['Sundaes','Desserts',350]
].map(function(x){return{name:x[0],category:x[1],price:x[2]}});

const defaults={
  restaurant_open:'true',restaurant_closed_reason:'',
  delivery_enabled:'true',pickup_enabled:'true',delivery_charge:'150',minimum_order:'500',
  pickup_eta_minutes:'25',delivery_eta_minutes:'45',payment_methods:'Cash on Delivery,Cash at Pickup',
  contact_address:'Street No. 03, Sector-E, Akhter Colony, Mr. Feast, Karachi',
  contact_phone:'+92 300 2010546',contact_whatsapp:'+92 300 2010546',
  contact_map_query:'Street No. 03, Sector-E, Akhter Colony, Mr. Feast, Karachi, Pakistan',
  contact_timings:'Daily · See reservation availability for current table-booking hours',
  google_rating:'',trust_hygiene:'Fresh ingredients & hygienic preparation',trust_payment:'Cash / COD available',
  trust_service:'Fast Food · Charcoal BBQ · Sweets · Desserts',
  hero_kicker:'SIGNATURE BBQ',hero_line1:'Taste That Brings',hero_line2:'Everyone Together.',
  hero_copy:'Bold flavors, fresh ingredients, and delicious moments made for everyone.',
  hero_image_1:'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1800&q=82&fm=webp',
  hero_image_2:'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1800&q=82&fm=webp',
  reservation_slot_minutes:'15',reservation_default_duration:'90',reservation_min_duration:'60',
  reservation_max_duration:'180',reservation_table_buffer:'15',
  reservation_manage_show_status:'true',reservation_manage_show_contact:'false',
  reservation_manage_show_notes:'true',reservation_manage_allow_cancel:'true'
};
const upgradeKeys=Object.keys(defaults);
function norm(v){let x=String(v==null?'':v).trim();if(x.length>1&&((x[0]==='"'&&x[x.length-1]==='"')||(x[0]==="'"&&x[x.length-1]==="'")))x=x.slice(1,-1).trim();return x}
function adminToken(){return crypto.createHmac('sha256',norm(process.env.ADMIN_PASSWORD)).update('mr-feast-admin').digest('hex')}
function isAdmin(req){return(req.headers.cookie||'').split(';').map(function(x){return x.trim()}).includes('mrfeast_admin='+adminToken())}
function sha(v){return crypto.createHash('sha256').update(String(v)).digest('hex')}
function newToken(){return crypto.randomBytes(32).toString('hex')}
function bool(v,d){if(v==null||v==='')return !!d;return String(v)!=='false'}
function num(v,d,min,max){let n=Number(v);if(!Number.isFinite(n))n=d;if(min!=null)n=Math.max(min,n);if(max!=null)n=Math.min(max,n);return n}
function dateOnly(v){if(v instanceof Date)return v.toISOString().slice(0,10);return String(v||'').slice(0,10)}
function timeOnly(v){return String(v||'').slice(0,5)}
function validDate(v){return /^\d{4}-\d{2}-\d{2}$/.test(String(v||''))}
function validTime(v){return /^([01]\d|2[0-3]):[0-5]\d$/.test(String(v||''))}
function mins(v){const p=String(v).split(':').map(Number);return p[0]*60+p[1]}
function clock(v){v=((v%1440)+1440)%1440;return String(Math.floor(v/60)).padStart(2,'0')+':'+String(v%60).padStart(2,'0')}
function pkToday(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Karachi',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())}
function pkNowMinute(){const p=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Karachi',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date()).filter(function(x){return x.type!=='literal'}).map(function(x){return[x.type,x.value]}));return{date:p.year+'-'+p.month+'-'+p.day,minute:Number(p.hour)*60+Number(p.minute)}}
function weekday(v){const p=v.split('-').map(Number);return new Date(Date.UTC(p[0],p[1]-1,p[2])).getUTCDay()}
function epochDay(v){return Date.parse(v+'T00:00:00Z')/60000}
function baseUrl(req){return req.protocol+'://'+req.get('host')}
async function getSetting(k,fallback){if(!process.env.DATABASE_URL)return fallback==null?'':String(fallback);const r=await pool.query('SELECT setting_value FROM site_settings WHERE setting_key=$1',[k]);return r.rows.length?String(r.rows[0].setting_value==null?'':r.rows[0].setting_value):(fallback==null?'':String(fallback))}
async function setSetting(k,v){await pool.query("INSERT INTO site_settings(setting_key,setting_value,updated_at) VALUES($1,$2,NOW()) ON CONFLICT(setting_key) DO UPDATE SET setting_value=$2,updated_at=NOW()",[k,String(v==null?'':v)])}
async function getSettings(keys){const out={};keys.forEach(function(k){out[k]=defaults[k]==null?'':defaults[k]});if(!process.env.DATABASE_URL)return out;const r=await pool.query('SELECT setting_key,setting_value FROM site_settings WHERE setting_key=ANY($1)',[keys]);r.rows.forEach(function(x){out[x.setting_key]=String(x.setting_value==null?'':x.setting_value)});return out}
async function restaurantStatus(){return{open:bool(await getSetting('restaurant_open','true'),true),reason:await getSetting('restaurant_closed_reason','')}}
async function sendMail(to,subject,text,html){const key=norm(process.env.RESEND_API_KEY),recipient=String(to||'').trim();if(!key||!recipient||!rawFetch)return false;const body={from:process.env.ORDER_FROM_EMAIL||'Mr. Feast <onboarding@resend.dev>',to:[recipient],subject:subject,text:text};if(html)body.html=html;const r=await rawFetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify(body)});if(!r.ok){let d='';try{d=await r.text()}catch(e){}console.error('Upgrade email failed',r.status,d)}return r.ok}
async function recordEvent(type,item,session){try{await pool.query('INSERT INTO analytics_events(event_type,item_name,session_id) VALUES($1,$2,$3)',[String(type||'').slice(0,60),String(item||'').slice(0,160),String(session||'').slice(0,120)])}catch(e){console.error('analytics',e.message)}}

async function init(){
  if(!process.env.DATABASE_URL)return;
  await pool.query("CREATE TABLE IF NOT EXISTS site_settings(setting_key TEXT PRIMARY KEY,setting_value TEXT NOT NULL DEFAULT '',updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())");
  await pool.query("CREATE TABLE IF NOT EXISTS menu_item_settings(item_name TEXT PRIMARY KEY,enabled BOOLEAN NOT NULL DEFAULT TRUE,price INTEGER,updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())");
  await pool.query("CREATE TABLE IF NOT EXISTS analytics_events(id BIGSERIAL PRIMARY KEY,event_type TEXT NOT NULL,item_name TEXT NOT NULL DEFAULT '',session_id TEXT NOT NULL DEFAULT '',created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())");
  await pool.query("CREATE TABLE IF NOT EXISTS orders(id SERIAL PRIMARY KEY,customer_name TEXT NOT NULL,phone TEXT NOT NULL,email TEXT NOT NULL,notes TEXT NOT NULL DEFAULT '',items JSONB NOT NULL,total INTEGER NOT NULL DEFAULT 0,status TEXT NOT NULL DEFAULT 'queue',created_at TIMESTAMPTZ DEFAULT NOW(),updated_at TIMESTAMPTZ DEFAULT NOW())");
  await pool.query("ALTER TABLE orders ADD COLUMN IF NOT EXISTS fulfilment_type TEXT NOT NULL DEFAULT 'pickup'");
  await pool.query("ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_address TEXT NOT NULL DEFAULT ''");
  await pool.query("ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_charge INTEGER NOT NULL DEFAULT 0");
  await pool.query("ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'Cash'");
  await pool.query("ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_minutes INTEGER NOT NULL DEFAULT 0");
  await pool.query("ALTER TABLE orders ADD COLUMN IF NOT EXISTS manage_token_hash TEXT");
  await pool.query("CREATE TABLE IF NOT EXISTS reservations(id SERIAL PRIMARY KEY,customer_name TEXT NOT NULL,phone TEXT NOT NULL,email TEXT NOT NULL DEFAULT '',reservation_date DATE NOT NULL,reservation_time TIME NOT NULL,party_size INTEGER NOT NULL,tables_used INTEGER NOT NULL,table_ids JSONB NOT NULL DEFAULT '[]',special_requests TEXT NOT NULL DEFAULT '',status TEXT NOT NULL DEFAULT 'pending',source TEXT NOT NULL DEFAULT 'website',created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())");
  await pool.query("ALTER TABLE reservations ADD COLUMN IF NOT EXISTS end_time TIME");
  await pool.query("ALTER TABLE reservations ADD COLUMN IF NOT EXISTS manage_token_hash TEXT");
  await pool.query("ALTER TABLE reservations ADD COLUMN IF NOT EXISTS cancelled_by_customer BOOLEAN NOT NULL DEFAULT FALSE");
  for(const e of Object.entries(defaults))await pool.query('INSERT INTO site_settings(setting_key,setting_value) VALUES($1,$2) ON CONFLICT(setting_key) DO NOTHING',e);
  for(const item of MENU)await pool.query('INSERT INTO menu_item_settings(item_name,enabled,price) VALUES($1,TRUE,$2) ON CONFLICT(item_name) DO NOTHING',[item.name,item.price]);
}
async function menuState(){
  const r=await pool.query('SELECT item_name,enabled,price FROM menu_item_settings');
  const m=new Map(r.rows.map(function(x){return[x.item_name,x]}));
  return MENU.map(function(x){const s=m.get(x.name)||{};return{name:x.name,category:x.category,default_price:x.price,price:s.price==null?x.price:Number(s.price),enabled:s.enabled!==false}})
}
async function reservationConfig(){
  const s=await getSettings(['reservation_slot_minutes','reservation_default_duration','reservation_min_duration','reservation_max_duration','reservation_table_buffer']);
  const r=await pool.query("SELECT setting_key,setting_value FROM site_settings WHERE setting_key LIKE 'reservation_%'");
  const m={};r.rows.forEach(function(x){m[x.setting_key]=String(x.setting_value||'')});
  return{
    table_count:num(m.reservation_table_count,5,1,100),chairs_per_table:num(m.reservation_chairs_per_table,4,1,20),
    enabled:bool(m.reservation_enabled,true),open_time:validTime(m.reservation_open_time)?m.reservation_open_time:'00:00',
    close_time:validTime(m.reservation_close_time)?m.reservation_close_time:'23:59',
    closed_weekdays:String(m.reservation_closed_weekdays||'').split(/[\n,]+/).map(Number).filter(function(x){return Number.isInteger(x)&&x>=0&&x<=6}),
    closed_dates:String(m.reservation_closed_dates||'').split(/[\n,]+/).map(function(x){return x.trim()}).filter(validDate),
    slot_minutes:num(s.reservation_slot_minutes,15,5,60),default_duration:num(s.reservation_default_duration,90,15,360),
    min_duration:num(s.reservation_min_duration,60,15,360),max_duration:num(s.reservation_max_duration,180,15,480),
    table_buffer:num(s.reservation_table_buffer,15,0,120)
  }
}
function operatingMinute(v,c){let n=mins(v),o=mins(c.open_time),cl=mins(c.close_time);if(cl<=o&&n<o)n+=1440;return n}
function closeMinute(c){const o=mins(c.open_time),cl=mins(c.close_time);if(o===cl)return o+1440;return cl<=o?cl+1440:cl}
function scheduleReason(date,start,end,party,c){
  if(!c.enabled)return'Reservations are currently closed.';
  if(!validDate(date)||date<pkToday())return'Choose a valid current or future date.';
  if(c.closed_dates.includes(date)||c.closed_weekdays.includes(weekday(date)))return'Restaurant is unavailable for reservations on this date.';
  if(!validTime(start)||!validTime(end))return'Choose valid starting and ending times.';
  const p=Number(party);if(!Number.isFinite(p)||p<1)return'Choose a valid party size.';
  if(p>c.table_count*c.chairs_per_table)return'Maximum '+(c.table_count*c.chairs_per_table)+' guests.';
  let s=operatingMinute(start,c),e=operatingMinute(end,c);if(e<=s)e+=1440;
  const o=mins(c.open_time),cl=closeMinute(c),duration=e-s;
  if(s<o||e>cl)return'Reservation must be within '+c.open_time+'–'+c.close_time+(mins(c.close_time)<=o?' (closing time is next day).':'.');
  if(s%c.slot_minutes!==0)return'Start times are offered in '+c.slot_minutes+'-minute increments.';
  if(duration<c.min_duration||duration>c.max_duration)return'Reservation duration must be between '+c.min_duration+' and '+c.max_duration+' minutes.';
  const now=pkNowMinute(),abs=epochDay(date)+s,nowAbs=epochDay(now.date)+now.minute;if(abs<=nowAbs)return'Please choose a future starting time.';
  return''
}
async function reservationRows(date,client){
  if(!validDate(date))return [];
  const db=client||pool;
  const r=await db.query("SELECT id,reservation_date,reservation_time,end_time,table_ids,status FROM reservations WHERE status IN ('pending','confirmed','seated') AND reservation_date BETWEEN $1::date-1 AND $1::date+1",[date]);
  return r.rows
}
function busyTables(rows,date,start,end,c){
  let ws=epochDay(date)+operatingMinute(start,c),we=epochDay(date)+operatingMinute(end,c);if(we<=ws)we+=1440;
  const busy=new Set(),buffer=c.table_buffer;
  rows.forEach(function(r){
    const d=dateOnly(r.reservation_date),st=timeOnly(r.reservation_time),et=timeOnly(r.end_time);
    let rs=epochDay(d)+operatingMinute(st,c),re=et?epochDay(d)+operatingMinute(et,c):rs+c.default_duration;
    if(re<=rs)re+=1440;
    if(rs<we+buffer&&re+buffer>ws)(r.table_ids||[]).forEach(function(n){busy.add(Number(n))})
  });
  return busy
}
function availabilityFromRows(rows,date,start,end,party,c){
  const reason=scheduleReason(date,start,end,party,c),need=Math.ceil(Number(party||1)/c.chairs_per_table);
  if(reason)return{available:false,reason:reason,tables_needed:need,free_tables:0};
  const busy=busyTables(rows,date,start,end,c),free=Array.from({length:c.table_count},function(_,i){return i+1}).filter(function(n){return!busy.has(n)});
  return{available:free.length>=need,reason:free.length>=need?'':'Not enough tables are free for this time. Try one of the suggested alternatives.',tables_needed:need,free_tables:free.length,table_ids:free.slice(0,need)}
}
async function slotsFor(date,party,duration,c,client){
  const rows=await reservationRows(date,client),d=num(duration,c.default_duration,c.min_duration,c.max_duration);
  const out=[],o=mins(c.open_time),cl=closeMinute(c),step=c.slot_minutes,start=Math.ceil(o/step)*step;
  for(let t=start;t+d<=cl;t+=step){
    const a=clock(t),b=clock(t+d),av=availabilityFromRows(rows,date,a,b,party,c);
    if(av.available)out.push({start_time:a,end_time:b,tables_needed:av.tables_needed,free_tables:av.free_tables})
  }
  return out
}
function nearest(slots,start){if(!slots.length)return[];const target=mins(start);return slots.slice().sort(function(a,b){return Math.abs(operatingMinute(a.start_time,{open_time:'00:00',close_time:'23:59'})-target)-Math.abs(operatingMinute(b.start_time,{open_time:'00:00',close_time:'23:59'})-target)}).slice(0,3)}
function phone(v){let s=String(v||'').replace(/\D/g,'');if(s.startsWith('92'))s=s.slice(2);if(s.startsWith('0'))s=s.slice(1);return/^3\d{9}$/.test(s)?'+92'+s:''}

async function publicConfig(){
  const s=await getSettings(upgradeKeys),rs=await restaurantStatus(),rc=await reservationConfig();
  return{
    restaurant:rs,
    delivery:{enabled:bool(s.delivery_enabled,true),pickup_enabled:bool(s.pickup_enabled,true),delivery_charge:num(s.delivery_charge,150,0,100000),minimum_order:num(s.minimum_order,500,0,1000000),pickup_eta_minutes:num(s.pickup_eta_minutes,25,0,600),delivery_eta_minutes:num(s.delivery_eta_minutes,45,0,600),payment_methods:String(s.payment_methods||'').split(',').map(function(x){return x.trim()}).filter(Boolean)},
    contact:{address:s.contact_address,phone:s.contact_phone,whatsapp:s.contact_whatsapp,map_query:s.contact_map_query,timings:s.contact_timings},
    trust:{google_rating:s.google_rating,hygiene:s.trust_hygiene,payment:s.trust_payment,service:s.trust_service},
    hero:{kicker:s.hero_kicker,line1:s.hero_line1,line2:s.hero_line2,copy:s.hero_copy,image_1:s.hero_image_1,image_2:s.hero_image_2},
    reservation:rc
  }
}

function attach(app){
  app.use(expressOriginal.json({limit:'2mb'}));
  app.get('/api/site-config',async function(req,res){try{res.json(await publicConfig())}catch(e){console.error(e);res.status(500).json({error:'Could not load site configuration'})}});
  app.get('/api/menu-settings',async function(req,res){try{res.json(await menuState())}catch(e){res.status(500).json({error:'Could not load menu settings'})}});

  app.get('/api/reservations/config',async function(req,res){try{res.json(await reservationConfig())}catch(e){res.status(500).json({error:'Could not load reservation configuration'})}});
  app.get('/api/reservations/slots',async function(req,res){try{const c=await reservationConfig(),date=String(req.query.date||''),party=Number(req.query.party_size||1),duration=Number(req.query.duration||c.default_duration);const reason=!validDate(date)?'Choose a reservation date.':(c.closed_dates.includes(date)||c.closed_weekdays.includes(weekday(date))?'Restaurant is unavailable for reservations on this date.':'');if(reason)return res.json({available:false,reason:reason,slots:[],config:c});const slots=await slotsFor(date,party,duration,c);res.json({available:slots.length>0,slots:slots,config:c,reason:slots.length?'':'No tables are available for that party size and duration.'})}catch(e){console.error(e);res.status(500).json({error:'Could not load available times'})}});
  app.get('/api/reservations/availability',async function(req,res){try{const c=await reservationConfig(),date=String(req.query.date||''),start=String(req.query.start_time||req.query.time||''),end=String(req.query.end_time||''),party=Number(req.query.party_size||1),rows=await reservationRows(date);let av=availabilityFromRows(rows,date,start,end,party,c);if(!av.available&&validDate(date)&&validTime(start)){const duration=validTime(end)?Math.max(c.min_duration,operatingMinute(end,c)-operatingMinute(start,c)):c.default_duration;const slots=await slotsFor(date,party,duration,c);av.suggestions=nearest(slots,start)}res.json(av)}catch(e){console.error(e);res.status(500).json({error:'Could not check availability'})}});

  app.post('/api/reservations',async function(req,res){try{
    const st=await restaurantStatus();if(!st.open)return res.status(503).json({error:'Restaurant is temporarily closed.',reason:st.reason});
    const d=req.body||{},name=String(d.customer_name||d.full_name||d.name||'').trim(),email=String(d.email||'').trim().toLowerCase(),mobile=phone(d.phone),date=String(d.reservation_date||d.date||''),start=String(d.reservation_time||d.start_time||''),end=String(d.end_time||''),party=Number(d.party_size||0),notes=String(d.special_requests||d.notes||'').trim();
    if(!name)return res.status(400).json({error:'Full name is required.'});if(!mobile)return res.status(400).json({error:'Enter a valid Pakistan mobile number (+92 3XX XXXXXXX).'});if(!/^\S+@\S+\.\S+$/.test(email))return res.status(400).json({error:'Enter a valid email address.'});
    const client=await pool.connect();let row,token;
    try{await client.query('BEGIN');await client.query("SELECT pg_advisory_xact_lock(hashtext('mr-feast-reservations'))");const c=await reservationConfig(),rows=await reservationRows(date,client),av=availabilityFromRows(rows,date,start,end,party,c);if(!av.available){await client.query('ROLLBACK');const slots=validDate(date)?await slotsFor(date,party,c.default_duration,c):[];return res.status(409).json({error:av.reason,availability:av,suggestions:validTime(start)?nearest(slots,start):slots.slice(0,3)})}token=newToken();const x=await client.query("INSERT INTO reservations(customer_name,phone,email,reservation_date,reservation_time,end_time,party_size,tables_used,table_ids,special_requests,status,source,manage_token_hash) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'pending',$11,$12) RETURNING *",[name,mobile,email,date,start,end,party,av.tables_needed,JSON.stringify(av.table_ids),notes,String(d.source||'website'),sha(token)]);row=x.rows[0];await client.query('COMMIT')}catch(e){try{await client.query('ROLLBACK')}catch(x){}throw e}finally{client.release()}
    const manageUrl=baseUrl(req)+'/manage-reservation.html?token='+encodeURIComponent(token);try{if(typeof global.__mrFeastReservationCreated==='function')await global.__mrFeastReservationCreated(Object.assign({},row,{manage_token:token,manage_url:manageUrl}))}catch(e){console.error('reservation email hook',e)}
    await recordEvent('reservation_created','',String(req.body&&req.body.session_id||''));
    res.json({ok:true,reservationId:row.id,status:'pending',reservation:row,manageUrl:manageUrl});
  }catch(e){console.error(e);res.status(500).json({error:'Could not create reservation'})}});

  app.get('/api/manage-reservation/:token',async function(req,res){try{const h=sha(req.params.token),x=await pool.query('SELECT * FROM reservations WHERE manage_token_hash=$1 LIMIT 1',[h]);if(!x.rows.length)return res.status(404).json({error:'Reservation link is invalid or expired.'});const r=x.rows[0],s=await getSettings(['reservation_manage_show_status','reservation_manage_show_contact','reservation_manage_show_notes','reservation_manage_allow_cancel']);const out={id:r.id,customer_name:r.customer_name,reservation_date:dateOnly(r.reservation_date),start_time:timeOnly(r.reservation_time),end_time:timeOnly(r.end_time),party_size:r.party_size,tables_used:r.tables_used};if(bool(s.reservation_manage_show_status,true))out.status=r.status;if(bool(s.reservation_manage_show_contact,false)){out.phone=r.phone;out.email=r.email}if(bool(s.reservation_manage_show_notes,true))out.special_requests=r.special_requests;out.can_cancel=bool(s.reservation_manage_allow_cancel,true)&&['pending','confirmed'].includes(r.status);res.json(out)}catch(e){res.status(500).json({error:'Could not load reservation'})}});
  app.post('/api/manage-reservation/:token/cancel',async function(req,res){try{const s=await getSettings(['reservation_manage_allow_cancel']);if(!bool(s.reservation_manage_allow_cancel,true))return res.status(403).json({error:'Customer cancellation is disabled. Please contact Mr. Feast.'});const h=sha(req.params.token),x=await pool.query("UPDATE reservations SET status='cancelled',cancelled_by_customer=TRUE,updated_at=NOW() WHERE manage_token_hash=$1 AND status IN ('pending','confirmed') RETURNING id",[h]);if(!x.rows.length)return res.status(409).json({error:'This reservation cannot be cancelled from this link.'});await recordEvent('reservation_cancelled','customer','');res.json({ok:true,status:'cancelled',reservationId:x.rows[0].id})}catch(e){res.status(500).json({error:'Could not cancel reservation'})}});

  app.post('/api/orders',async function(req,res){try{
    const st=await restaurantStatus();if(!st.open)return res.status(503).json({error:'Restaurant is temporarily closed.',reason:st.reason});
    const d=req.body||{},items=Array.isArray(d.items)?d.items:[];if(!String(d.customer_name||'').trim()||!String(d.phone||'').trim()||!/^\S+@\S+\.\S+$/.test(String(d.email||''))||!items.length)return res.status(400).json({error:'Name, phone, email and order items are required.'});
    const cfg=await publicConfig(),type=String(d.fulfilment_type||'pickup').toLowerCase()==='delivery'?'delivery':'pickup';
    if(type==='delivery'&&!cfg.delivery.enabled)return res.status(400).json({error:'Delivery is currently unavailable.'});if(type==='pickup'&&!cfg.delivery.pickup_enabled)return res.status(400).json({error:'Pickup is currently unavailable.'});
    const states=await menuState(),sm=new Map(states.map(function(x){return[x.name,x]}));const dealRows=(await pool.query('SELECT name,price FROM deals WHERE active=true')).rows,dm=new Map(dealRows.map(function(x){return[x.name,{name:x.name,price:Number(x.price),enabled:true}]}));const clean=[];let subtotal=0;
    for(const it of items){const cat=sm.get(String(it.name))||dm.get(String(it.name));if(!cat)return res.status(400).json({error:String(it.name||'Item')+' is not available.'});if(cat.enabled===false)return res.status(409).json({error:cat.name+' is temporarily unavailable.'});const q=Math.max(1,Math.min(50,Number(it.qty)||1)),price=Number(cat.price)||0;clean.push({name:cat.name,price:price,qty:q});subtotal+=price*q}
    if(subtotal<cfg.delivery.minimum_order)return res.status(400).json({error:'Minimum order is Rs. '+cfg.delivery.minimum_order+'.'});
    const address=String(d.delivery_address||'').trim();if(type==='delivery'&&!address)return res.status(400).json({error:'Delivery address is required.'});
    const charge=type==='delivery'?cfg.delivery.delivery_charge:0,total=subtotal+charge,eta=type==='delivery'?cfg.delivery.delivery_eta_minutes:cfg.delivery.pickup_eta_minutes,payment=String(d.payment_method||cfg.delivery.payment_methods[0]||'Cash').trim();
    if(cfg.delivery.payment_methods.length&&!cfg.delivery.payment_methods.includes(payment))return res.status(400).json({error:'Choose an available payment method.'});
    const token=newToken(),x=await pool.query("INSERT INTO orders(customer_name,phone,email,notes,items,total,fulfilment_type,delivery_address,delivery_charge,payment_method,estimated_minutes,manage_token_hash) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *",[String(d.customer_name).trim(),String(d.phone).trim(),String(d.email).trim().toLowerCase(),String(d.notes||'').trim(),JSON.stringify(clean),total,type,address,charge,payment,eta,sha(token)]),order=x.rows[0],url=baseUrl(req)+'/order-status.html?token='+encodeURIComponent(token);
    const lines=clean.map(function(i){return i.qty+' x '+i.name+' - Rs. '+(i.qty*i.price)}).join('\n');
    const customerText='Thank you for your Mr. Feast order #'+order.id+'.\n\n'+lines+'\n\nSubtotal: Rs. '+subtotal+'\nDelivery charge: Rs. '+charge+'\nTotal: Rs. '+total+'\n'+(type==='delivery'?'Delivery address: '+address+'\n':'Pickup order\n')+'Payment: '+payment+'\nEstimated time: '+eta+' minutes\n\nTrack your order securely: '+url+'\n\nMr. Feast';
    let customerEmailed=false,restaurantEmailed=false;try{customerEmailed=await sendMail(order.email,'Mr. Feast Order #'+order.id,customerText);const owner=await getSetting('order_email','');if(owner)restaurantEmailed=await sendMail(owner,'New Mr. Feast Order #'+order.id,'New order #'+order.id+'\n'+order.customer_name+'\n'+order.phone+'\n'+order.email+'\n\n'+lines+'\n\nTotal: Rs. '+total+'\n'+type+(address?'\n'+address:'')+'\nPayment: '+payment)}catch(e){console.error(e)}
    await recordEvent('order_created','',String(d.session_id||''));
    res.json({ok:true,orderId:order.id,status:'queue',subtotal:subtotal,deliveryCharge:charge,total:total,estimatedMinutes:eta,statusUrl:url,customerEmailed:customerEmailed,restaurantEmailed:restaurantEmailed});
  }catch(e){console.error(e);res.status(500).json({error:'Could not place order'})}});
  app.get('/api/order-status/:token',async function(req,res){try{const x=await pool.query('SELECT id,customer_name,items,total,status,created_at,updated_at,fulfilment_type,delivery_address,delivery_charge,payment_method,estimated_minutes FROM orders WHERE manage_token_hash=$1 LIMIT 1',[sha(req.params.token)]);if(!x.rows.length)return res.status(404).json({error:'Order status link is invalid.'});res.json(x.rows[0])}catch(e){res.status(500).json({error:'Could not load order status'})}});
  app.get('/api/order-lookup',async function(req,res){try{const id=Number(req.query.id),email=String(req.query.email||'').trim().toLowerCase();if(!id||!/^\S+@\S+\.\S+$/.test(email))return res.status(400).json({error:'Order number and email are required.'});const x=await pool.query('SELECT id,status,fulfilment_type,estimated_minutes,updated_at FROM orders WHERE id=$1 AND lower(email)=$2 LIMIT 1',[id,email]);if(!x.rows.length)return res.status(404).json({error:'No matching order was found.'});res.json(x.rows[0])}catch(e){res.status(500).json({error:'Could not load order status'})}});

  app.post('/api/analytics',async function(req,res){const allowed=['page_view','order_click','cart_add','cart_abandon','reservation_open','reservation_created','reservation_cancelled'];const t=String(req.body&&req.body.event_type||'');if(!allowed.includes(t))return res.status(400).json({error:'Invalid event'});await recordEvent(t,req.body&&req.body.item_name,req.body&&req.body.session_id);res.json({ok:true})});

  app.get('/api/admin/upgrade-settings',async function(req,res){if(!isAdmin(req))return res.status(401).json({error:'Unauthorized'});try{res.json(await getSettings(upgradeKeys))}catch(e){res.status(500).json({error:'Could not load settings'})}});
  app.put('/api/admin/upgrade-settings',async function(req,res){if(!isAdmin(req))return res.status(401).json({error:'Unauthorized'});try{const b=req.body||{};for(const k of upgradeKeys)if(Object.prototype.hasOwnProperty.call(b,k))await setSetting(k,b[k]);res.json({ok:true,settings:await getSettings(upgradeKeys)})}catch(e){res.status(500).json({error:'Could not save settings'})}});
  app.get('/api/admin/menu-items',async function(req,res){if(!isAdmin(req))return res.status(401).json({error:'Unauthorized'});try{res.json(await menuState())}catch(e){res.status(500).json({error:'Could not load menu items'})}});
  app.put('/api/admin/menu-items/:name',async function(req,res){if(!isAdmin(req))return res.status(401).json({error:'Unauthorized'});try{const name=decodeURIComponent(req.params.name),known=MENU.find(function(x){return x.name===name});if(!known)return res.status(404).json({error:'Unknown menu item'});const enabled=req.body.enabled!==false&&String(req.body.enabled)!=='false',price=num(req.body.price,known.price,0,1000000);await pool.query("INSERT INTO menu_item_settings(item_name,enabled,price,updated_at) VALUES($1,$2,$3,NOW()) ON CONFLICT(item_name) DO UPDATE SET enabled=$2,price=$3,updated_at=NOW()",[name,enabled,price]);res.json({ok:true,name:name,enabled:enabled,price:price})}catch(e){res.status(500).json({error:'Could not update menu item'})}});

  app.get('/api/admin/reservations',async function(req,res){if(!isAdmin(req))return res.status(401).json({error:'Unauthorized'});try{const buildQuery=require('./reservation-calendar-query'),q=buildQuery({from:req.query.from,to:req.query.to});if(q.error)return res.status(400).json({error:q.error});const x=await pool.query(q.text,q.values||[]);res.json(x.rows)}catch(e){console.error(e);res.status(500).json({error:'Could not load reservations'})}});

  app.get('/api/admin/reservation-settings',async function(req,res){if(!isAdmin(req))return res.status(401).json({error:'Unauthorized'});try{res.json(await reservationConfig())}catch(e){res.status(500).json({error:'Could not load reservation settings'})}});
  app.put('/api/admin/reservation-settings',async function(req,res){if(!isAdmin(req))return res.status(401).json({error:'Unauthorized'});try{const b=req.body||{},map={table_count:'reservation_table_count',chairs_per_table:'reservation_chairs_per_table',enabled:'reservation_enabled',open_time:'reservation_open_time',close_time:'reservation_close_time',closed_weekdays:'reservation_closed_weekdays',closed_dates:'reservation_closed_dates',slot_minutes:'reservation_slot_minutes',default_duration:'reservation_default_duration',min_duration:'reservation_min_duration',max_duration:'reservation_max_duration',table_buffer:'reservation_table_buffer'};for(const e of Object.entries(map)){if(!Object.prototype.hasOwnProperty.call(b,e[0]))continue;let v=b[e[0]];if(Array.isArray(v))v=v.join(',');await setSetting(e[1],v)}res.json(await reservationConfig())}catch(e){res.status(500).json({error:'Could not save reservation settings'})}});

  app.get('/api/admin/analytics-summary',async function(req,res){if(!isAdmin(req))return res.status(401).json({error:'Unauthorized'});try{const r=await pool.query("SELECT COUNT(DISTINCT NULLIF(session_id,'')) FILTER (WHERE event_type='page_view' AND created_at>=NOW()-interval '30 days') visitors,COUNT(*) FILTER (WHERE event_type='order_click' AND created_at>=NOW()-interval '30 days') order_clicks,COUNT(*) FILTER (WHERE event_type='cart_abandon' AND created_at>=NOW()-interval '30 days') cart_abandons,COUNT(*) FILTER (WHERE event_type='reservation_created' AND created_at>=NOW()-interval '30 days') reservations,COUNT(*) FILTER (WHERE event_type='order_created' AND created_at>=NOW()-interval '30 days') orders FROM analytics_events");const top=await pool.query("SELECT item_name,COUNT(*)::int adds FROM analytics_events WHERE event_type='cart_add' AND item_name<>'' AND created_at>=NOW()-interval '30 days' GROUP BY item_name ORDER BY adds DESC,item_name LIMIT 8");const x=r.rows[0]||{},vis=Number(x.visitors||0),conv=vis?((Number(x.orders||0)+Number(x.reservations||0))*100/vis):0;res.json({period_days:30,visitors:vis,order_clicks:Number(x.order_clicks||0),cart_abandons:Number(x.cart_abandons||0),reservations:Number(x.reservations||0),orders:Number(x.orders||0),conversion_rate:Number(conv.toFixed(1)),top_menu_items:top.rows})}catch(e){console.error(e);res.status(500).json({error:'Could not load analytics'})}});
}
function wrapped(){const app=expressOriginal.apply(null,arguments);attach(app);return app}
Object.assign(wrapped,expressOriginal);
require.cache[expressPath].exports=wrapped;
init().then(function(){require('./reservation-runtime-fix')}).catch(function(e){console.error('Mr Feast upgrade init failed',e);process.exit(1)});
