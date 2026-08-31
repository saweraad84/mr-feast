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

  async function applySavedCategoryImages(html){
    if(!process.env.DATABASE_URL)return html;
    try{
      const {rows}=await pool.query(`SELECT category_key,updated_at,(image_data IS NOT NULL) AS has_image FROM category_images WHERE category_key IN ('fastfood','bbq','sweets')`);
      const map=new Map(rows.map(r=>[r.category_key,r]));
      const keys=['fastfood','bbq','sweets'];
      let index=0;
      return html.replace(/(<section class="catrow">[\s\S]*?<\/section>)/,section=>section.replace(/<img\s+src="[^"]*"/g,match=>{
        const key=keys[index++];
        const row=map.get(key);
        if(!row||!row.has_image)return match;
        const version=new Date(row.updated_at).getTime();
        return match.replace(/src="[^"]*"/,`src="/api/category-image/${key}?v=${version}"`);
      }));
    }catch(e){
      console.error('server category image render',e);
      return html;
    }
  }

  app.get('/',async(req,res)=>{
    const file=path.join(__dirname,'public','index.html');
    let html=fs.readFileSync(file,'utf8');
    html=await applySavedCategoryImages(html);
    html=html.replace('</body>','<script src="/slider-live.js"></script><script src="/hero-live.js"></script><script src="/content-live.js"></script><script src="/category-live.js"></script><script src="/category-style.js"></script><script src="/location-map.js"></script></body>');
    res.set('Cache-Control','no-store');
    res.type('html').send(html);
  });
  app.get('/admin',(req,res)=>{
    const file=path.join(__dirname,'public','admin.html');
    let html=fs.readFileSync(file,'utf8');
    html=html.replace('</body>','<script src="/admin-content.js"></script><script src="/admin-category.js"></script><script src="/admin-image-fix.js"></script></body>');
    res.set('Cache-Control','no-store');
    res.type('html').send(html);
  });
  return app;
}
Object.assign(wrappedExpress,realExpress);
require.cache[require.resolve('express')].exports=wrappedExpress;
require('./server');
