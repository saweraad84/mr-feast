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
  })().catch(e=>console.error('kitchen setup',e));
  const clean=v=>String(v||'').trim();
  const validStatus=s=>['new','preparing','ready','completed','cancelled'].includes(s)?s:null;
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
    res.json(rows.map(r=>({id:r.id,ticketNo:r.ticket_no,customerName:r.customer_name,orderType:r.order_type,tableNo:r.table_no,items:r.items,notes:r.notes,status:r.status,createdAt:r.created_at,startedAt:r.started_at,readyAt:r.ready_at,completedAt:r.completed_at,updatedAt:r.updated_at})));
  }catch(e){console.error(e);res.status(500).json({error:'Could not load kitchen orders'});}});
  app.post('/api/admin/kitchen-order',requireAdmin,async(req,res)=>{try{
    await ready;
    const customerName=clean(req.body.customerName).slice(0,120),orderType=clean(req.body.orderType||'Takeaway').slice(0,40),tableNo=clean(req.body.tableNo).slice(0,40),items=clean(req.body.items).slice(0,4000),notes=clean(req.body.notes).slice(0,1000);
    if(!items)return res.status(400).json({error:'Order items are required'});
    const ticketNo=await nextTicket();
    const q=await pool.query(`INSERT INTO kitchen_orders(ticket_no,customer_name,order_type,table_no,items,notes) VALUES($1,$2,$3,$4,$5,$6) RETURNING id`,[ticketNo,customerName,orderType,tableNo,items,notes]);
    res.json({ok:true,id:q.rows[0].id,ticketNo});
  }catch(e){console.error(e);res.status(500).json({error:'Could not create kitchen order'});}});
  app.patch('/api/admin/kitchen-order/:id/status',requireAdmin,async(req,res)=>{try{
    await ready;const status=validStatus(req.body.status);if(!status)return res.status(400).json({error:'Invalid status'});
    let stamp='';if(status==='preparing')stamp=',started_at=COALESCE(started_at,NOW())';if(status==='ready')stamp=',ready_at=COALESCE(ready_at,NOW())';if(status==='completed')stamp=',completed_at=COALESCE(completed_at,NOW())';
    await pool.query(`UPDATE kitchen_orders SET status=$1,updated_at=NOW() ${stamp} WHERE id=$2`,[status,req.params.id]);res.json({ok:true});
  }catch(e){console.error(e);res.status(500).json({error:'Could not update order status'});}});
  app.delete('/api/admin/kitchen-order/:id',requireAdmin,async(req,res)=>{try{await pool.query('DELETE FROM kitchen_orders WHERE id=$1',[req.params.id]);res.json({ok:true});}catch(e){res.status(500).json({error:'Could not delete order'});}});
};
