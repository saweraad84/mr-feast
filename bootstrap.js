const fs=require('fs');
const path=require('path');
const crypto=require('crypto');
const multer=require('multer');
const {Pool}=require('pg');
const realExpress=require('express');
const setupContentApi=require('./content-api');
const setupCategoryApi=require('./category-api');

function wrappedExpress(...args){
  const app=realExpress(...args);
  const pool=new Pool({connectionString:process.env.DATABASE_URL,ssl:process.env.DATABASE_URL?{rejectUnauthorized:false}:false});
  const upload=multer({storage:multer.memoryStorage(),limits:{fileSize:5*1024*1024}});
  const adminPassword=process.env.ADMIN_PASSWORD||'';
  const makeToken=()=>crypto.createHmac('sha256',adminPassword).update('restaurant-admin').digest('hex');
  const isAdmin=req=>(req.headers.cookie||'').split(';').map(x=>x.trim()).includes(`restaurant_admin=${makeToken()}`);
  const requireAdmin=(req,res,next)=>isAdmin(req)?next():res.status(401).json({error:'Unauthorized'});

  setupContentApi(app,pool,requireAdmin,upload);
  setupCategoryApi(app,pool,requireAdmin,upload);

  app.get('/',(req,res)=>{
    const file=path.join(__dirname,'public','index.html');
    let html=fs.readFileSync(file,'utf8');
    html=html.replace('</body>','<script src="/slider-live.js"></script><script src="/hero-live.js"></script><script src="/content-live.js"></script><script src="/category-live.js"></script><script src="/category-style.js"></script><script src="/location-map.js"></script></body>');
    res.type('html').send(html);
  });
  app.get('/admin',(req,res)=>{
    const file=path.join(__dirname,'public','admin.html');
    let html=fs.readFileSync(file,'utf8');
    html=html.replace('</body>','<script src="/admin-content.js"></script><script src="/admin-category.js"></script><script src="/admin-image-fix.js"></script></body>');
    res.type('html').send(html);
  });
  return app;
}
Object.assign(wrappedExpress,realExpress);
require.cache[require.resolve('express')].exports=wrappedExpress;
require('./server');
