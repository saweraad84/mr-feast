(()=>{
const sidKey='mrfeast_session_id';
let sessionId=localStorage.getItem(sidKey);if(!sessionId){sessionId=(crypto.randomUUID?crypto.randomUUID():Date.now()+'-'+Math.random().toString(36).slice(2));localStorage.setItem(sidKey,sessionId)}
let siteCfg=null,orderCompleted=false,cartTouched=false;
function track(event_type,item_name=''){try{fetch('/api/analytics',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({event_type,item_name,session_id:sessionId}),keepalive:true}).catch(()=>{})}catch(e){}}
track('page_view');
function money2(n){return typeof money==='function'?money(n):'Rs. '+Number(n||0).toLocaleString('en-PK')}
function safe(v){return String(v==null?'':v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}

if(typeof renderMenu==='function'&&typeof menu!=='undefined'){
  renderMenu=function(){
    const list=menu.filter(x=>active==='All'||x.category===active);
    document.getElementById('menuGrid').innerHTML=list.map(x=>'<article class="food '+(x.enabled===false?'temporarily-unavailable':'')+'"><img loading="lazy" decoding="async" src="'+safe(x.image)+'" alt="'+safe(x.name)+' at Mr. Feast"><div class="body"><div class="tag">'+safe(x.category)+'</div><h3>'+safe(x.name)+'</h3><p>'+safe(x.desc)+'</p>'+(x.enabled===false?'<span class="unavailable-badge">Temporarily unavailable</span>':'')+'<div class="price-row"><div class="price">'+money2(x.price)+'</div><button class="add-item" data-name="'+safe(x.name)+'" '+(x.enabled===false?'disabled':'')+'>'+(x.enabled===false?'Unavailable':'Add +')+'</button></div></div></article>').join('')
  };
  const baseAdd=add;
  add=function(p,qty=1){if(p&&p.enabled===false){toast(p.name+' is temporarily unavailable');return}if(p)track('cart_add',p.name);cartTouched=true;return baseAdd(p,qty)};
  fetch('/api/menu-settings',{cache:'no-store'}).then(r=>r.json()).then(rows=>{const by=new Map(rows.map(x=>[x.name,x]));menu.forEach(x=>{const s=by.get(x.name);if(s){x.price=Number(s.price);x.enabled=s.enabled!==false}});renderMenu()}).catch(()=>{});
}
document.querySelectorAll('.gallerygrid img,.bbqpic img').forEach(img=>{if(!img.closest('.hero')){img.loading='lazy';img.decoding='async'}});

function injectCheckout(){
  const box=document.querySelector('.cart-summary');if(!box||document.getElementById('checkoutUpgrades'))return;
  const btn=document.getElementById('checkoutBtn');
  const wrap=document.createElement('div');wrap.id='checkoutUpgrades';wrap.className='checkout-upgrades';
  wrap.innerHTML='<div class="fulfilment-row"><label><input type="radio" name="fulfilment" value="pickup" checked> Pickup</label><label><input type="radio" name="fulfilment" value="delivery"> Delivery</label></div><label id="deliveryAddressLabel" style="display:none">Delivery address<input id="deliveryAddress" autocomplete="street-address" placeholder="House / street / area"></label><label>Payment method<select id="paymentMethod"></select></label><div class="checkout-facts"><div><span>Minimum order</span><strong id="checkoutMinimum">—</strong></div><div><span>Delivery charge</span><strong id="checkoutDeliveryCharge">—</strong></div><div><span>Estimated time</span><strong id="checkoutEta">—</strong></div><div><span>Payable total</span><strong id="checkoutPayable">—</strong></div></div>';
  box.insertBefore(wrap,btn);
  document.querySelectorAll('input[name="fulfilment"]').forEach(x=>x.addEventListener('change',updateCheckoutFacts));
}
function cartSubtotal(){return typeof cart!=='undefined'?[...cart.values()].reduce((s,x)=>s+Number(x.price)*Number(x.qty),0):0}
function selectedType(){return document.querySelector('input[name="fulfilment"]:checked')?.value||'pickup'}
function updateCheckoutFacts(){
  if(!siteCfg)return;
  const type=selectedType(),delivery=type==='delivery',dc=delivery?Number(siteCfg.delivery.delivery_charge||0):0,subtotal=cartSubtotal();
  const address=document.getElementById('deliveryAddressLabel');if(address)address.style.display=delivery?'block':'none';
  const min=document.getElementById('checkoutMinimum'),ch=document.getElementById('checkoutDeliveryCharge'),eta=document.getElementById('checkoutEta'),pay=document.getElementById('checkoutPayable');
  if(min)min.textContent=money2(siteCfg.delivery.minimum_order);if(ch)ch.textContent=delivery?money2(dc):'Rs. 0';if(eta)eta.textContent=(delivery?siteCfg.delivery.delivery_eta_minutes:siteCfg.delivery.pickup_eta_minutes)+' min';if(pay)pay.textContent=money2(subtotal+dc);
}
injectCheckout();
if(typeof renderCart==='function'){const baseRender=renderCart;renderCart=function(){const r=baseRender();updateCheckoutFacts();return r}}

if(typeof submitOrder==='function'){
  submitOrder=async function({customer_name,phone,email,notes='',fulfilment_type='pickup',delivery_address='',payment_method=''}){const items=[...cart.values()].map(({name,price,qty})=>({name,price,qty}));if(!items.length)return{ok:false,error:'Your cart is empty'};try{const r=await fetch('/api/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({customer_name,phone,email,notes,items,fulfilment_type,delivery_address,payment_method,session_id:sessionId})});const j=await r.json();return r.ok?{ok:true,...j}:{ok:false,error:j.error||'Order failed'}}catch{return{ok:false,error:'Could not place order. Please try again.'}}}
}
const checkout=document.getElementById('checkoutBtn');
if(checkout)checkout.onclick=async()=>{
  const customer_name=document.getElementById('customerName').value.trim(),phone=document.getElementById('customerPhone').value.trim(),email=document.getElementById('customerEmail').value.trim(),type=selectedType(),address=document.getElementById('deliveryAddress')?.value.trim()||'',payment=document.getElementById('paymentMethod')?.value||'';
  if(!customer_name||!phone||!email)return toast('Name, contact number and email are required');
  if(type==='delivery'&&!address)return toast('Delivery address is required');
  checkout.disabled=true;checkout.textContent='Placing Order…';
  const out=await submitOrder({customer_name,phone,email,notes:document.getElementById('orderNotes').value.trim(),fulfilment_type:type,delivery_address:address,payment_method:payment});
  checkout.disabled=false;checkout.textContent='Place Order';
  if(!out.ok)return toast(out.error);
  orderCompleted=true;cart.clear();renderCart();close();
  const modal=document.getElementById('orderSuccessModal');document.getElementById('orderSuccessTitle').textContent='Order #'+out.orderId+' received';document.getElementById('orderSuccessText').textContent='Status: Queue · Estimated '+out.estimatedMinutes+' minutes · Total '+money2(out.total)+'. Use the secure status page to follow your order.';const link=document.getElementById('orderStatusLink');link.href=out.statusUrl;modal.hidden=false
};
document.getElementById('orderSuccessClose')?.addEventListener('click',()=>document.getElementById('orderSuccessModal').hidden=true);
document.getElementById('cartNav')?.addEventListener('click',()=>track('order_click'));
document.querySelectorAll('.order-trigger').forEach(b=>b.addEventListener('click',()=>track('order_click')));
document.querySelector('a[href="#reservations"]')?.addEventListener('click',()=>track('reservation_open'));

function phoneDigits(v){return String(v||'').replace(/\D/g,'')}
function applyConfig(cfg){
  siteCfg=cfg;injectCheckout();
  const pm=document.getElementById('paymentMethod');if(pm){const old=pm.value;pm.innerHTML=(cfg.delivery.payment_methods||[]).map(x=>'<option>'+safe(x)+'</option>').join('');if([...pm.options].some(o=>o.value===old))pm.value=old}
  const delRadio=document.querySelector('input[name="fulfilment"][value="delivery"]'),pickRadio=document.querySelector('input[name="fulfilment"][value="pickup"]');if(delRadio)delRadio.disabled=!cfg.delivery.enabled;if(pickRadio)pickRadio.disabled=!cfg.delivery.pickup_enabled;if(delRadio?.checked&&delRadio.disabled&&pickRadio){pickRadio.checked=true}
  const a=document.getElementById('contactAddress');if(a)a.textContent=cfg.contact.address||'Mr. Feast, Karachi';
  const p=document.getElementById('contactPhone');if(p){p.textContent=cfg.contact.phone;p.href='tel:'+phoneDigits(cfg.contact.phone)}
  const w=document.getElementById('contactWhatsapp');if(w)w.href='https://wa.me/'+phoneDigits(cfg.contact.whatsapp);
  const call=document.getElementById('mobileCall');if(call)call.href='tel:'+phoneDigits(cfg.contact.phone);
  const timings=document.getElementById('contactTimings');if(timings)timings.textContent=cfg.contact.timings||('Reservations: '+cfg.reservation.open_time+'–'+cfg.reservation.close_time);
  const tq=document.getElementById('trustTimings');if(tq)tq.textContent=cfg.contact.timings||'Current hours available online';
  const mapQ=encodeURIComponent(cfg.contact.map_query||cfg.contact.address||'Mr Feast Karachi');const map=document.getElementById('contactMap');if(map)map.src='https://www.google.com/maps?q='+mapQ+'&output=embed';const dir=document.getElementById('directionsLink');if(dir)dir.href='https://www.google.com/maps/search/?api=1&query='+mapQ;
  const rating=document.getElementById('trustRating');if(rating)rating.textContent=cfg.trust.google_rating?cfg.trust.google_rating+' ★ Google rating':'Guest reviews';
  const hy=document.getElementById('trustHygiene');if(hy)hy.textContent=cfg.trust.hygiene;const pay=document.getElementById('trustPayment');if(pay)pay.textContent=cfg.trust.payment;const svc=document.getElementById('trustService');if(svc)svc.textContent=cfg.trust.service;
  const hk=document.getElementById('heroKicker'),h1=document.getElementById('heroLine1'),h2=document.getElementById('heroLine2'),hc=document.getElementById('heroCopy');if(hk)hk.textContent=cfg.hero.kicker;if(h1)h1.textContent=cfg.hero.line1;if(h2)h2.textContent=cfg.hero.line2;if(hc)hc.textContent=cfg.hero.copy;
  const slides=document.querySelectorAll('.hero-slide');if(slides[0]&&cfg.hero.image_1)slides[0].style.backgroundImage='url("'+cfg.hero.image_1+'")';if(slides[1]&&cfg.hero.image_2)slides[1].style.backgroundImage='url("'+cfg.hero.image_2+'")';
  applyRestaurantState(cfg.restaurant);updateCheckoutFacts()
}
function applyRestaurantState(s){
  const closed=!s.open;document.documentElement.classList.toggle('site-closed',closed);const banner=document.getElementById('restaurantClosedBanner');if(banner){banner.hidden=!closed;document.getElementById('restaurantClosedReason').textContent=closed&&s.reason?'· '+s.reason:''}
  document.querySelectorAll('.order-trigger,.cart-nav,.reservation-submit').forEach(b=>{b.disabled=closed;b.setAttribute('aria-disabled',closed?'true':'false')})
}
async function refreshConfig(){try{const r=await fetch('/api/site-config',{cache:'no-store'}),cfg=await r.json();if(r.ok)applyConfig(cfg)}catch(e){}}
refreshConfig();setInterval(refreshConfig,30000);
window.addEventListener('pagehide',()=>{if(cartTouched&&!orderCompleted&&typeof cart!=='undefined'&&cart.size)track('cart_abandon')});
})();