(()=>{
const chat=document.getElementById('chat');if(!chat)return;
const body=chat.querySelector('.chatbody'),input=chat.querySelector('.chatinput'),headSmall=chat.querySelector('.chathead small');
if(headSmall)headSmall.textContent='AI ordering · reservations · order status';
body.innerHTML='';input.innerHTML='<input id="chatText" placeholder="Order, reserve, ask a question or track an order"><button id="chatSend">Send</button>';
const agentState={stage:'idle',name:'',phone:'',email:'',notes:''};let reservationState={},reservationMode=false,busy=false,lookup={active:false,id:'',email:''};
function esc2(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function say2(t,c='bot'){body.insertAdjacentHTML('beforeend','<div class="'+c+'">'+esc2(t).replace(/\n/g,'<br>')+'</div>');body.scrollTop=body.scrollHeight}
function catalogProduct(name){return menu.find(x=>x.name===name&&x.enabled!==false)||deals.find(x=>x.name===name)}
function currentCart(){return [...cart.values()].map(({name,price,qty})=>({name,price,qty}))}
function applyCapture(c){if(!c)return;for(const k of ['name','phone','email','notes'])if(String(c[k]||'').trim())agentState[k]=String(c[k]).trim()}
function applyActions(actions){for(const a of actions||[]){if(a.type==='clear'){cart.clear();continue}const p=catalogProduct(a.item_name);if(!p)continue;if(a.type==='add')add(p,a.quantity||1);else if(a.type==='remove'){const x=cart.get(p.name);if(!x)continue;x.qty-=Math.max(1,Number(a.quantity)||1);if(x.qty<=0)cart.delete(p.name)}}renderCart()}
function resetAgent(){Object.assign(agentState,{stage:'idle',name:'',phone:'',email:'',notes:''})}
function soundsReservation(s){return /reserv|table|booking|book a|baith|beth|seat|dinner.*people|lunch.*people|logon?\s*(ke|k liye)|people\s*(for|at)|guests?/i.test(s)}
function soundsOrderStatus(s){return /order\s*(status|track|tracking)|track\s*(my\s*)?order|where\s*(is|s)\s*(my\s*)?order/i.test(s)}
function soundsHours(s){return /opening|closing|timing|hours|khul|band kab|open kab/i.test(s)}
function soundsContact(s){return /address|location|where are you|phone|contact|whatsapp|map/i.test(s)}
async function faqTurn(message){
  if(!soundsHours(message)&&!soundsContact(message))return false;
  const r=await fetch('/api/site-config',{cache:'no-store'}),j=await r.json();if(!r.ok)return false;
  if(soundsHours(message)){say2('Current reservation hours are '+j.reservation.open_time+'–'+j.reservation.close_time+'. '+(j.contact.timings||''));return true}
  say2('Mr. Feast: '+j.contact.address+'. Phone: '+j.contact.phone+'. WhatsApp: '+j.contact.whatsapp+'.');return true
}
function parseOrderLookup(message){
  const id=String(message).match(/(?:order\s*#?\s*|#)(\d+)/i)||String(message).match(/\b(\d{1,8})\b/),em=String(message).match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  if(id)lookup.id=id[1];if(em)lookup.email=em[0].toLowerCase()
}
async function orderStatusTurn(message){
  lookup.active=true;parseOrderLookup(message);
  if(!lookup.id){say2('Please send your order number, for example Order #123.');return}
  if(!lookup.email){say2('Please send the same email address used for Order #'+lookup.id+'.');return}
  const r=await fetch('/api/order-lookup?id='+encodeURIComponent(lookup.id)+'&email='+encodeURIComponent(lookup.email),{cache:'no-store'}),j=await r.json();if(!r.ok){say2(j.error||'I could not find that order.');lookup={active:false,id:'',email:''};return}
  say2('Order #'+j.id+' status: '+String(j.status).toUpperCase()+'. '+(j.estimated_minutes?'Estimated service time: '+j.estimated_minutes+' minutes. ':'')+'Fulfilment: '+String(j.fulfilment_type||'pickup')+'.');
  lookup={active:false,id:'',email:''}
}
async function reservationTurn(message){
  const r=await fetch('/api/reservation-agent',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message,state:reservationState})}),j=await r.json();if(!r.ok)throw new Error(j.error||'Reservation assistant unavailable');
  reservationState=j.state||reservationState;if(j.reply)say2(j.reply);
  if(j.availability&&!j.created){if(j.availability.available)say2('Tables are available. This party needs '+j.availability.tables_needed+' table'+(j.availability.tables_needed===1?'':'s')+'.');else{let extra='';if(Array.isArray(j.availability.suggestions)&&j.availability.suggestions.length)extra=' Suggested times: '+j.availability.suggestions.map(x=>x.start_time).join(', ')+'.';say2((j.availability.reason||'That time is unavailable.')+extra)}}
  if(j.created||j.done){reservationMode=false;reservationState={}}
}
async function orderTurn(message){
  const r=await fetch('/api/agent',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message,cart:currentCart(),state:agentState})}),j=await r.json();if(!r.ok)throw new Error(j.error||'AI assistant unavailable');
  applyActions(j.actions);applyCapture(j.capture);agentState.stage=j.next_stage||agentState.stage;if(j.reply)say2(j.reply);
  if(j.submit_order){if(!cart.size||!agentState.name||!agentState.phone||!agentState.email){say2('I still need the missing order details before I can place this order.');return}const out=await submitOrder({customer_name:agentState.name,phone:agentState.phone,email:agentState.email,notes:agentState.notes||'',fulfilment_type:'pickup'});if(out.ok){say2('Order #'+out.orderId+' has been placed as PICKUP. A secure tracking link was sent to '+agentState.email+'.');cart.clear();renderCart();resetAgent()}else say2('I could not place the order: '+out.error)}
}
async function handle(message){
  if(busy)return;busy=true;const btn=document.getElementById('chatSend');if(btn)btn.disabled=true;
  try{if(lookup.active||soundsOrderStatus(message))await orderStatusTurn(message);else if(await faqTurn(message)){}else if(reservationMode||soundsReservation(message)){reservationMode=true;await reservationTurn(message)}else await orderTurn(message)}
  catch(e){say2('The Mr. Feast assistant is temporarily unavailable. Please try again shortly.')}
  finally{busy=false;if(btn)btn.disabled=false}
}
function send2(){const el=document.getElementById('chatText'),q=el.value.trim();if(!q||busy)return;say2(q,'user');el.value='';handle(q)}
document.getElementById('chatSend').onclick=send2;document.getElementById('chatText').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();send2()}};
say2('Hi! I can help with the Mr. Feast menu, pickup ordering, table reservations, opening information, FAQs and order status. I will always ask for confirmation before an order or reservation is created.');
})();