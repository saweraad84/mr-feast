const express=require('express');
const path=require('path');
const fs=require('fs');
const crypto=require('crypto');
const multer=require('multer');
const {Pool}=require('pg');

const app=express();
const port=process.env.PORT||3000;
const pool=new Pool({connectionString:process.env.DATABASE_URL,ssl:process.env.DATABASE_URL?{rejectUnauthorized:false}:false});
const upload=multer({storage:multer.memoryStorage(),limits:{fileSize:5*1024*1024}});
const ADMIN_PASSWORD=process.env.ADMIN_PASSWORD||'MrFeast2026!';
const SITE_NAME=process.env.SITE_NAME||'Mr. Feast';

app.use(express.json({limit:'1mb'}));
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,'public'),{index:false}));

async function initDb(){
  if(!process.env.DATABASE_URL) return;
  await pool.query(`CREATE TABLE IF NOT EXISTS menu_images (
    item_name TEXT PRIMARY KEY,
    image_data BYTEA NOT NULL,
    mime_type TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
  await pool.query(`CREATE TABLE IF NOT EXISTS bbq_slides (
    slide_no INTEGER PRIMARY KEY CHECK (slide_no BETWEEN 1 AND 4),
    title TEXT NOT NULL DEFAULT '',
    caption TEXT NOT NULL DEFAULT '',
    button_text TEXT NOT NULL DEFAULT 'Explore BBQ',
    button_link TEXT NOT NULL DEFAULT '#menu',
    visible BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 1,
    image_data BYTEA,
    mime_type TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
}

function makeToken(){return crypto.createHmac('sha256',ADMIN_PASSWORD).update('restaurant-admin').digest('hex');}
function isAdmin(req){
  const cookie=req.headers.cookie||'';
  return cookie.split(';').map(x=>x.trim()).includes(`restaurant_admin=${makeToken()}`);
}
function requireAdmin(req,res,next){if(!isAdmin(req)) return res.status(401).json({error:'Unauthorized'}); next();}
function slideNo(value){const n=Number(value);return Number.isInteger(n)&&n>=1&&n<=4?n:null;}

app.get('/api/site-config',(req,res)=>res.json({siteName:SITE_NAME}));
app.post('/api/admin/login',(req,res)=>{
  if(req.body.password!==ADMIN_PASSWORD) return res.status(401).json({error:'Wrong password'});
  res.setHeader('Set-Cookie',`restaurant_admin=${makeToken()}; HttpOnly; SameSite=Lax; Path=/; Max-Age=86400`);
  res.json({ok:true});
});
app.post('/api/admin/logout',(req,res)=>{res.setHeader('Set-Cookie','restaurant_admin=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0');res.json({ok:true});});
app.get('/api/admin/status',(req,res)=>res.json({authenticated:isAdmin(req)}));

app.get('/api/menu-images',async(req,res)=>{
  if(!process.env.DATABASE_URL) return res.json({});
  const {rows}=await pool.query('SELECT item_name, updated_at FROM menu_images');
  const out={}; rows.forEach(r=>out[r.item_name]=`/api/image/${encodeURIComponent(r.item_name)}?v=${new Date(r.updated_at).getTime()}`);
  res.json(out);
});

app.get('/api/image/:name',async(req,res)=>{
  if(!process.env.DATABASE_URL) return res.sendStatus(404);
  const {rows}=await pool.query('SELECT image_data,mime_type FROM menu_images WHERE item_name=$1',[req.params.name]);
  if(!rows.length) return res.sendStatus(404);
  res.set('Content-Type',rows[0].mime_type);
  res.set('Cache-Control','public, max-age=300');
  res.send(rows[0].image_data);
});

app.post('/api/admin/image',requireAdmin,upload.single('image'),async(req,res)=>{
  if(!req.file) return res.status(400).json({error:'Choose an image first'});
  if(!req.file.mimetype.startsWith('image/')) return res.status(400).json({error:'File must be an image'});
  if(!req.body.item) return res.status(400).json({error:'Choose a menu item'});
  if(!process.env.DATABASE_URL) return res.status(500).json({error:'Database is not configured'});
  await pool.query(`INSERT INTO menu_images(item_name,image_data,mime_type,updated_at)
    VALUES($1,$2,$3,NOW()) ON CONFLICT(item_name) DO UPDATE SET image_data=EXCLUDED.image_data,mime_type=EXCLUDED.mime_type,updated_at=NOW()`,
    [req.body.item,req.file.buffer,req.file.mimetype]);
  res.json({ok:true,url:`/api/image/${encodeURIComponent(req.body.item)}?v=${Date.now()}`});
});

app.delete('/api/admin/image/:name',requireAdmin,async(req,res)=>{
  if(process.env.DATABASE_URL) await pool.query('DELETE FROM menu_images WHERE item_name=$1',[req.params.name]);
  res.json({ok:true});
});

app.get('/api/bbq-slides',async(req,res)=>{
  if(!process.env.DATABASE_URL) return res.json([]);
  const {rows}=await pool.query(`SELECT slide_no,title,caption,button_text,button_link,visible,sort_order,updated_at,(image_data IS NOT NULL) AS has_image
    FROM bbq_slides ORDER BY sort_order ASC, slide_no ASC`);
  res.json(rows.map(r=>({
    slideNo:r.slide_no,title:r.title,caption:r.caption,buttonText:r.button_text,buttonLink:r.button_link,
    visible:r.visible,sortOrder:r.sort_order,
    imageUrl:r.has_image?`/api/bbq-slide-image/${r.slide_no}?v=${new Date(r.updated_at).getTime()}`:null
  })));
});

app.get('/api/bbq-slide-image/:slideNo',async(req,res)=>{
  const n=slideNo(req.params.slideNo);
  if(!n||!process.env.DATABASE_URL) return res.sendStatus(404);
  const {rows}=await pool.query('SELECT image_data,mime_type FROM bbq_slides WHERE slide_no=$1',[n]);
  if(!rows.length||!rows[0].image_data) return res.sendStatus(404);
  res.set('Content-Type',rows[0].mime_type||'image/jpeg');
  res.set('Cache-Control','public, max-age=300');
  res.send(rows[0].image_data);
});

app.post('/api/admin/bbq-slide/:slideNo',requireAdmin,upload.single('image'),async(req,res)=>{
  const n=slideNo(req.params.slideNo);
  if(!n) return res.status(400).json({error:'Slide must be 1 to 4'});
  if(!process.env.DATABASE_URL) return res.status(500).json({error:'Database is not configured'});
  if(req.file&&!req.file.mimetype.startsWith('image/')) return res.status(400).json({error:'File must be an image'});
  const title=String(req.body.title||'').slice(0,120);
  const caption=String(req.body.caption||'').slice(0,240);
  const buttonText=String(req.body.buttonText||'Explore BBQ').slice(0,80);
  const buttonLink=String(req.body.buttonLink||'#menu').slice(0,500);
  const visible=String(req.body.visible)!=='false';
  const sortOrder=Math.min(4,Math.max(1,Number(req.body.sortOrder)||n));
  if(req.file){
    await pool.query(`INSERT INTO bbq_slides(slide_no,title,caption,button_text,button_link,visible,sort_order,image_data,mime_type,updated_at)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW())
      ON CONFLICT(slide_no) DO UPDATE SET title=EXCLUDED.title,caption=EXCLUDED.caption,button_text=EXCLUDED.button_text,
      button_link=EXCLUDED.button_link,visible=EXCLUDED.visible,sort_order=EXCLUDED.sort_order,image_data=EXCLUDED.image_data,mime_type=EXCLUDED.mime_type,updated_at=NOW()`,
      [n,title,caption,buttonText,buttonLink,visible,sortOrder,req.file.buffer,req.file.mimetype]);
  }else{
    await pool.query(`INSERT INTO bbq_slides(slide_no,title,caption,button_text,button_link,visible,sort_order,updated_at)
      VALUES($1,$2,$3,$4,$5,$6,$7,NOW())
      ON CONFLICT(slide_no) DO UPDATE SET title=EXCLUDED.title,caption=EXCLUDED.caption,button_text=EXCLUDED.button_text,
      button_link=EXCLUDED.button_link,visible=EXCLUDED.visible,sort_order=EXCLUDED.sort_order,updated_at=NOW()`,
      [n,title,caption,buttonText,buttonLink,visible,sortOrder]);
  }
  res.json({ok:true,slideNo:n,imageUrl:req.file?`/api/bbq-slide-image/${n}?v=${Date.now()}`:undefined});
});

app.delete('/api/admin/bbq-slide-image/:slideNo',requireAdmin,async(req,res)=>{
  const n=slideNo(req.params.slideNo);
  if(!n) return res.status(400).json({error:'Slide must be 1 to 4'});
  if(process.env.DATABASE_URL) await pool.query('UPDATE bbq_slides SET image_data=NULL,mime_type=NULL,updated_at=NOW() WHERE slide_no=$1',[n]);
  res.json({ok:true});
});

app.get('/admin',(req,res)=>res.sendFile(path.join(__dirname,'public','admin.html')));

function sendHome(res){
  const file=path.join(__dirname,'public','index.html');
  let html=fs.readFileSync(file,'utf8');
  html=html.replace('</body>','<script src="/slider-live.js"></script></body>');
  res.type('html').send(html);
}
app.get('/',(req,res)=>sendHome(res));
app.get('*',(req,res)=>sendHome(res));

initDb().then(()=>app.listen(port,()=>console.log(`${SITE_NAME} running on ${port}`))).catch(err=>{console.error(err);process.exit(1)});
