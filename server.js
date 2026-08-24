const express=require('express');
const path=require('path');
const crypto=require('crypto');
const multer=require('multer');
const {Pool}=require('pg');

const app=express();
const port=process.env.PORT||3000;
const pool=new Pool({connectionString:process.env.DATABASE_URL,ssl:process.env.DATABASE_URL?{rejectUnauthorized:false}:false});
const upload=multer({storage:multer.memoryStorage(),limits:{fileSize:5*1024*1024}});

const ADMIN_SALT='66a39242a86bdb978eff093bac27bd81';
const ADMIN_HASH='5b03e235cac49dff023ea38104f8bb1f3da8ce4850277632985bb79064bf7d768f9530182a01f38991f9c5232db0038d8ae58ec7485cb1dec9651aabaf246baf';

app.use(express.json({limit:'1mb'}));
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,'public')));

async function initDb(){
  if(!process.env.DATABASE_URL) return;
  await pool.query(`CREATE TABLE IF NOT EXISTS menu_images (
    item_name TEXT PRIMARY KEY,
    image_data BYTEA NOT NULL,
    mime_type TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
}

function passwordMatches(submitted){
  try{
    const supplied=Buffer.from(String(submitted||''));
    const envPassword=String(process.env.ADMIN_PASSWORD||'');
    if(envPassword){
      const expected=Buffer.from(envPassword);
      return supplied.length===expected.length && crypto.timingSafeEqual(supplied,expected);
    }
    const candidate=crypto.scryptSync(String(submitted||''),ADMIN_SALT,64,{N:16384,r:8,p:1});
    const expected=Buffer.from(ADMIN_HASH,'hex');
    return candidate.length===expected.length && crypto.timingSafeEqual(candidate,expected);
  }catch{return false;}
}
function makeToken(){return crypto.createHmac('sha256',ADMIN_HASH).update('mr-feast-admin').digest('hex');}
function isAdmin(req){
  const cookie=req.headers.cookie||'';
  return cookie.split(';').map(x=>x.trim()).includes(`mrfeast_admin=${makeToken()}`);
}
function requireAdmin(req,res,next){if(!isAdmin(req)) return res.status(401).json({error:'Unauthorized'}); next();}

app.post('/api/admin/login',(req,res)=>{
  if(!passwordMatches(req.body.password)) return res.status(401).json({error:'Wrong password'});
  res.setHeader('Set-Cookie',`mrfeast_admin=${makeToken()}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`);
  res.json({ok:true});
});
app.post('/api/admin/logout',(req,res)=>{res.setHeader('Set-Cookie','mrfeast_admin=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0');res.json({ok:true});});
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

app.get('/admin',(req,res)=>res.sendFile(path.join(__dirname,'public','admin.html')));
app.get('*',(req,res)=>res.sendFile(path.join(__dirname,'public','index.html')));

initDb().then(()=>app.listen(port,()=>console.log(`Mr. Feast running on ${port}`))).catch(err=>{console.error(err);process.exit(1)});
