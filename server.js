const express=require('express');
const path=require('path');
const crypto=require('crypto');
const multer=require('multer');
const {Pool}=require('pg');

const app=express();
const port=process.env.PORT||3000;
const BUILD_VERSION='2026-08-26-admin-login-fix-v2';
const pool=new Pool({connectionString:process.env.DATABASE_URL,ssl:process.env.DATABASE_URL?{rejectUnauthorized:false}:false});
const upload=multer({storage:multer.memoryStorage(),limits:{fileSize:5*1024*1024}});

const ADMIN_SALT='66a39242a86bdb978eff093bac27bd81';
// Emergency recovery hash for the owner-selected admin password. The plaintext password is not stored in code.
const ADMIN_HASH='e82977772a0ef8d98c44b3abb9e7b320c79dd0d625d8266948a6bc76f48cab254e98e042b6f769d40cb1a6ad25451178677b0c05481c6f4039df854c2e66694a';

function normalizeSecret(value){
  let v=String(value??'').trim();
  if(v.length>=2){
    const first=v[0],last=v[v.length-1];
    if((first==='"'&&last==='"')||(first==="'"&&last==="'")) v=v.slice(1,-1).trim();
  }
  return v;
}

function configuredAdminPassword(){
  return normalizeSecret(process.env.ADMIN_PASSWORD);
}

app.use((req,res,next)=>{res.setHeader('X-Mr-Feast-Build',BUILD_VERSION);next();});
app.use(express.json({limit:'1mb'}));
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,'public'),{
  etag:false,
  lastModified:false,
  setHeaders:(res)=>res.setHeader('Cache-Control','no-store, no-cache, must-revalidate, proxy-revalidate')
}));

app.get('/health',(req,res)=>res.json({ok:true,app:'mr-feast',version:BUILD_VERSION}));
app.get('/api/admin/config',(req,res)=>{
  const p=configuredAdminPassword();
  res.set('Cache-Control','no-store');
  res.json({environmentPasswordLoaded:Boolean(p),normalizedLength:p.length,build:BUILD_VERSION,recoveryHashEnabled:true});
});

async function initDb(){
  if(!process.env.DATABASE_URL) return;
  await pool.query(`CREATE TABLE IF NOT EXISTS menu_images (
    item_name TEXT PRIMARY KEY,
    image_data BYTEA NOT NULL,
    mime_type TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
}

function safeEqualText(a,b){
  const left=Buffer.from(String(a),'utf8');
  const right=Buffer.from(String(b),'utf8');
  return left.length===right.length && crypto.timingSafeEqual(left,right);
}

function passwordMatches(submitted){
  try{
    const submittedPassword=normalizeSecret(submitted);
    if(!submittedPassword) return false;

    // Prefer Railway's environment variable when it is configured.
    const envPassword=configuredAdminPassword();
    if(envPassword && safeEqualText(submittedPassword,envPassword)) return true;

    // Recovery path: also check the securely hashed owner credential.
    const candidate=crypto.scryptSync(submittedPassword,ADMIN_SALT,64,{N:16384,r:8,p:1});
    const expected=Buffer.from(ADMIN_HASH,'hex');
    return candidate.length===expected.length && crypto.timingSafeEqual(candidate,expected);
  }catch{return false;}
}

function makeToken(){
  const secret=configuredAdminPassword()||ADMIN_HASH;
  return crypto.createHmac('sha256',secret).update('mr-feast-admin').digest('hex');
}
function isAdmin(req){
  const cookie=req.headers.cookie||'';
  return cookie.split(';').map(x=>x.trim()).includes(`mrfeast_admin=${makeToken()}`);
}
function requireAdmin(req,res,next){
  if(!isAdmin(req)) return res.status(401).json({error:'Unauthorized'});
  next();
}

app.post('/api/admin/login',(req,res)=>{
  const supplied=normalizeSecret(req.body?.password);
  if(!supplied) return res.status(400).json({error:'Enter admin password'});
  if(!passwordMatches(supplied)) return res.status(401).json({error:'Wrong password'});
  res.setHeader('Set-Cookie',`mrfeast_admin=${makeToken()}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`);
  res.json({ok:true});
});
app.post('/api/admin/logout',(req,res)=>{
  res.setHeader('Set-Cookie','mrfeast_admin=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0');
  res.json({ok:true});
});
app.get('/api/admin/status',(req,res)=>res.json({authenticated:isAdmin(req)}));

app.get('/api/menu-images',async(req,res)=>{
  try{
    if(!process.env.DATABASE_URL) return res.json({});
    const {rows}=await pool.query('SELECT item_name, updated_at FROM menu_images');
    const out={};
    rows.forEach(r=>out[r.item_name]=`/api/image/${encodeURIComponent(r.item_name)}?v=${new Date(r.updated_at).getTime()}`);
    res.json(out);
  }catch(err){
    console.error(err);
    res.json({});
  }
});

app.get('/api/image/:name',async(req,res)=>{
  try{
    if(!process.env.DATABASE_URL) return res.sendStatus(404);
    const {rows}=await pool.query('SELECT image_data,mime_type FROM menu_images WHERE item_name=$1',[req.params.name]);
    if(!rows.length) return res.sendStatus(404);
    res.set('Content-Type',rows[0].mime_type);
    res.set('Cache-Control','public, max-age=300');
    res.send(rows[0].image_data);
  }catch(err){
    console.error(err);
    res.sendStatus(500);
  }
});

app.post('/api/admin/image',requireAdmin,upload.single('image'),async(req,res)=>{
  try{
    if(!req.file) return res.status(400).json({error:'Choose an image first'});
    if(!req.file.mimetype.startsWith('image/')) return res.status(400).json({error:'File must be an image'});
    if(!req.body.item) return res.status(400).json({error:'Choose a menu item'});
    if(!process.env.DATABASE_URL) return res.status(500).json({error:'Database is not configured'});
    await pool.query(`INSERT INTO menu_images(item_name,image_data,mime_type,updated_at)
      VALUES($1,$2,$3,NOW())
      ON CONFLICT(item_name) DO UPDATE SET image_data=EXCLUDED.image_data,mime_type=EXCLUDED.mime_type,updated_at=NOW()`,
      [req.body.item,req.file.buffer,req.file.mimetype]);
    res.json({ok:true,url:`/api/image/${encodeURIComponent(req.body.item)}?v=${Date.now()}`});
  }catch(err){
    console.error(err);
    res.status(500).json({error:'Image upload failed'});
  }
});

app.delete('/api/admin/image/:name',requireAdmin,async(req,res)=>{
  try{
    if(process.env.DATABASE_URL) await pool.query('DELETE FROM menu_images WHERE item_name=$1',[req.params.name]);
    res.json({ok:true});
  }catch(err){
    console.error(err);
    res.status(500).json({error:'Image removal failed'});
  }
});

app.get('/admin',(req,res)=>res.sendFile(path.join(__dirname,'public','admin.html')));
app.get('*',(req,res)=>res.sendFile(path.join(__dirname,'public','index.html')));

initDb()
  .then(()=>app.listen(port,()=>console.log(`Mr. Feast ${BUILD_VERSION} running on ${port}`)))
  .catch(err=>{console.error(err);process.exit(1)});
