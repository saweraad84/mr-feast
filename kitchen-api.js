module.exports=function setupKitchenApi(app,pool,requireAdmin){
  const ready=(async()=>{
    if(!process.env.DATABASE_URL)return;
    await pool.query(`CREATE TABLE IF NOT EXISTS kitchen_orders(
      id SERIAL PRIMARY KEY,
      ticket_no TEXT NOT NULL UNIQUE,
      customer_name TEXT NOT NULL DEFAULT '',
      order_type TEXT NOT NULL DEFAULT 'Takeaway',
      table_no TEXT NOT NULL DEFAULT '',
      items TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'new',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      started_at TIMESTAMPTZ,
      ready_at TIMESTAMPTZ,
      completed_at TIMESTAMPTZ,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);
    await pool.query(`ALTER TABLE kitchen_orders ADD COLUMN IF NOT EXISTS phone TEXT NOT NULL DEFAULT ''`);
    await pool.query(`ALTER TABLE kitchen_orders ADD COLUMN IF NOT EXISTS address TEXT NOT NULL DEFAULT ''`);
    await pool.query(`ALTER TABLE kitchen_orders ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'Cash'`);
    await pool.query(`ALTER TABLE kitchen_orders ADD COLUMN IF NOT EXISTS order_total INTEGER NOT NULL DEFAULT 0`);
    await pool.query(`ALTER TABLE kitchen_orders ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'admin'`);
  })().catch(e=>console.error('kitchen setup',e));
  const clean=v=>String(v||'').trim();
  const validStatus=s=>['new','preparing','ready','completed','cancelled'].includes(s)?s:null;
  const priceNumber=v=>{const n=Number(String(v||'').replace(/[^0-9]/g,''));return Number.isFinite(n)?n:0};
  async function nextTicket(){
    const d=new Date();
    const date=d.toISOString().slice(0,10).replace(/-/g,'');
    const {rows}=await pool.query("SELECT ticket_no FROM kitchen_orders WHERE ticket_no LIKE $1 ORDER BY id DESC LIMIT 1",[`K${date}-%`]);
    const n=rows.length?(Number(rows[0].ticket_no.split('-').pop())||0)+1:1;
    return `K${date}-${String(n).padStart(3,'0')}`;
  }
  app.get('/api/admin/kitchen-orders',requireAdmin,async(req,res)=>{try{
    await ready;
    const {rows}=await pool.query(`SELECT * FROM kitchen_orders WHERE created_at > NOW()-INTERVAL '2 days' ORDER BY CASE status WHEN 'new' THEN 1 WHEN 'preparing' THEN 2 WHEN 'ready' THEN 3 WHEN 'completed' THEN 4 ELSE 5 END, created_at ASC`);
    res.json(rows.map(r=>({id:r.id,ticketNo:r.ticket_no,customerName:r.customer_name,phone:r.phone,address:r.address,paymentMethod:r.payment_method,orderTotal:r.order_total,source:r.source,orderType:r.order_type,tableNo:r.table_no,items:r.items,notes:r.notes,status:r.status,createdAt:r.created_at,startedAt:r.started_at,readyAt:r.ready_at,completedAt:r.completed_at,updatedAt:r.updated_at})));
  }catch(e){console.error(e);res.status(500).json({error:'Could not load kitchen orders'});}});
  app.post('/api/admin/kitchen-order',requireAdmin,async(req,res)=>{try{
    await ready;
    const customerName=clean(req.body.customerName).slice(0,120),orderType=clean(req.body.orderType||'Takeaway').slice(0,40),tableNo=clean(req.body.tableNo).slice(0,40),items=clean(req.body.items).slice(0,4000),notes=clean(req.body.notes).slice(0,1000);
    if(!items)return res.status(400).json({error:'Order items are required'});
    const ticketNo=await nextTicket();
    const q=await pool.query(`INSERT INTO kitchen_orders(ticket_no,customer_name,order_type,table_no,items,notes,source) VALUES($1,$2,$3,$4,$5,$6,'admin') RETURNING id`,[ticketNo,customerName,orderType,tableNo,items,notes]);
    res.json({ok:true,id:q.rows[0].id,ticketNo});
  }catch(e){console.error(e);res.status(500).json({error:'Could not create kitchen order'});}});

  app.post('/api/order',async(req,res)=>{try{
    await ready;
    const customerName=clean(req.body.customerName).slice(0,120);
    const phone=clean(req.body.phone).replace(/\s+/g,'').slice(0,30);
    const orderType=clean(req.body.orderType||'Takeaway');
    const address=clean(req.body.address).slice(0,500);
    const notes=clean(req.body.notes).slice(0,1000);
    const cart=Array.isArray(req.body.items)?req.body.items:[];
    if(customerName.length<2)return res.status(400).json({error:'Please enter your name'});
    if(!/^((\+92)|0)?3\d{9}$/.test(phone))return res.status(400).json({error:'Please enter a valid Pakistan mobile number'});
    if(!['Takeaway','Delivery'].includes(orderType))return res.status(400).json({error:'Invalid order type'});
    if(orderType==='Delivery'&&address.length<8)return res.status(400).json({error:'Please enter your delivery address'});
    if(!cart.length||cart.length>40)return res.status(400).json({error:'Your cart is empty'});
    const normalized=cart.map(x=>({id:Number(x.id),qty:Math.max(1,Math.min(20,Number(x.qty)||1))})).filter(x=>Number.isInteger(x.id)&&x.id>0);
    if(!normalized.length)return res.status(400).json({error:'Your cart is empty'});
    const ids=[...new Set(normalized.map(x=>x.id))];
    const {rows}=await pool.query('SELECT id,name,price FROM menu_items WHERE visible=TRUE AND id=ANY($1::int[])',[ids]);
    const byId=new Map(rows.map(r=>[r.id,r]));
    let total=0;const lines=[];
    for(const x of normalized){const item=byId.get(x.id);if(!item)continue;const unit=priceNumber(item.price);total+=unit*x.qty;lines.push(`${x.qty} x ${item.name} — Rs. ${(unit*x.qty).toLocaleString('en-PK')}`)}
    if(!lines.length)return res.status(400).json({error:'No valid menu items found'});
    const ticketNo=await nextTicket();
    const itemText=lines.join('\n');
    const q=await pool.query(`INSERT INTO kitchen_orders(ticket_no,customer_name,phone,address,payment_method,order_total,source,order_type,items,notes) VALUES($1,$2,$3,$4,'Cash',$5,'website',$6,$7,$8) RETURNING id`,[ticketNo,customerName,phone,address,total,orderType,itemText,notes]);
    res.json({ok:true,id:q.rows[0].id,ticketNo,total,paymentMethod:'Cash'});
  }catch(e){console.error(e);res.status(500).json({error:'Could not place order. Please try again.'});}});

  app.patch('/api/admin/kitchen-order/:id/status',requireAdmin,async(req,res)=>{try{
    await ready;const status=validStatus(req.body.status);if(!status)return res.status(400).json({error:'Invalid status'});
    let stamp='';if(status==='preparing')stamp=',started_at=COALESCE(started_at,NOW())';if(status==='ready')stamp=',ready_at=COALESCE(ready_at,NOW())';if(status==='completed')stamp=',completed_at=COALESCE(completed_at,NOW())';
    await pool.query(`UPDATE kitchen_orders SET status=$1,updated_at=NOW() ${stamp} WHERE id=$2`,[status,req.params.id]);res.json({ok:true});
  }catch(e){console.error(e);res.status(500).json({error:'Could not update order status'});}});
  app.delete('/api/admin/kitchen-order/:id',requireAdmin,async(req,res)=>{try{await pool.query('DELETE FROM kitchen_orders WHERE id=$1',[req.params.id]);res.json({ok:true});}catch(e){res.status(500).json({error:'Could not delete order'});}});
};
