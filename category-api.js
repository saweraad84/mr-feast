module.exports=function setupCategoryApi(app,pool,requireAdmin,upload){
  const defaults={
    fastfood:'https://images.unsplash.com/photo-1550317138-10000687a72b?auto=format&fit=crop&w=1200&q=90',
    bbq:'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=1200&q=90',
    sweets:'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1200&q=90'
  };
  const labels={fastfood:'Fast Food',bbq:'BBQ',sweets:'Sweets & Desserts'};
  async function ensure(){
    if(!process.env.DATABASE_URL)return;
    await pool.query(`CREATE TABLE IF NOT EXISTS category_images(
      category_key TEXT PRIMARY KEY,
      image_url TEXT,
      image_data BYTEA,
      mime_type TEXT,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);
    for(const key of Object.keys(defaults)){
      await pool.query(`INSERT INTO category_images(category_key,image_url) VALUES($1,$2)
        ON CONFLICT(category_key) DO NOTHING`,[key,defaults[key]]);
    }
  }
  const ready=ensure().catch(e=>console.error('category image setup',e));
  const safeKey=k=>Object.prototype.hasOwnProperty.call(defaults,k)?k:null;
  const mapRow=r=>({
    key:r.category_key,
    label:labels[r.category_key],
    imageUrl:r.image_data?`/api/category-image/${r.category_key}?v=${new Date(r.updated_at).getTime()}`:(r.image_url||defaults[r.category_key])
  });

  app.get('/api/category-images',async(req,res)=>{try{
    await ready;
    if(!process.env.DATABASE_URL)return res.json(Object.keys(defaults).map(key=>({key,label:labels[key],imageUrl:defaults[key]})));
    const {rows}=await pool.query('SELECT * FROM category_images ORDER BY category_key');
    res.json(rows.map(mapRow));
  }catch(e){res.status(500).json({error:'Could not load category images'});}});

  app.get('/api/admin/category-images',requireAdmin,async(req,res)=>{try{
    await ready;
    const {rows}=await pool.query('SELECT * FROM category_images ORDER BY category_key');
    res.json(rows.map(mapRow));
  }catch(e){res.status(500).json({error:'Could not load category images'});}});

  app.get('/api/category-image/:key',async(req,res)=>{try{
    const key=safeKey(req.params.key);if(!key)return res.sendStatus(404);
    const {rows}=await pool.query('SELECT image_data,mime_type FROM category_images WHERE category_key=$1',[key]);
    if(!rows.length||!rows[0].image_data)return res.sendStatus(404);
    res.type(rows[0].mime_type||'image/jpeg').set('Cache-Control','public, max-age=300').send(rows[0].image_data);
  }catch(e){res.sendStatus(404);}});

  app.post('/api/admin/category-image/:key',requireAdmin,upload.single('image'),async(req,res)=>{try{
    await ready;
    const key=safeKey(req.params.key);if(!key)return res.status(400).json({error:'Invalid category'});
    if(!req.file)return res.status(400).json({error:'Choose an image first'});
    if(!req.file.mimetype.startsWith('image/'))return res.status(400).json({error:'File must be an image'});
    await pool.query(`INSERT INTO category_images(category_key,image_url,image_data,mime_type,updated_at)
      VALUES($1,$2,$3,$4,NOW())
      ON CONFLICT(category_key) DO UPDATE SET image_data=EXCLUDED.image_data,mime_type=EXCLUDED.mime_type,updated_at=NOW()`,
      [key,defaults[key],req.file.buffer,req.file.mimetype]);
    res.json({ok:true,imageUrl:`/api/category-image/${key}?v=${Date.now()}`});
  }catch(e){console.error(e);res.status(500).json({error:'Could not save category image'});}});

  app.delete('/api/admin/category-image/:key',requireAdmin,async(req,res)=>{try{
    const key=safeKey(req.params.key);if(!key)return res.status(400).json({error:'Invalid category'});
    await pool.query('UPDATE category_images SET image_data=NULL,mime_type=NULL,image_url=$2,updated_at=NOW() WHERE category_key=$1',[key,defaults[key]]);
    res.json({ok:true,imageUrl:defaults[key]});
  }catch(e){res.status(500).json({error:'Could not reset category image'});}});
};
