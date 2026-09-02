(()=>{
const chat=document.getElementById('chat');if(!chat)return;
const body=chat.querySelector('.chatbody'),input=chat.querySelector('.chatinput'),headSmall=chat.querySelector('.chathead small');
if(headSmall)headSmall.textContent='AI ordering · Website knowledge only';
body.innerHTML='';
input.innerHTML='<input id="chatText" placeholder="Ask or order naturally"><button id="chatSend">Send</button>';
const agentState={stage:'idle',name:'',phone:'',email:'',notes:''};let busy=false;
function esc2(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function say2(t,c='bot'){const html=esc2(t).replace(/\n/g,'<br>');body.insertAdjacentHTML('beforeend',`<div class="${c}">${html}</div>`);body.scrollTop=body.scrollHeight}
function catalogProduct(name){return menu.find(x=>x.name===name)||deals.find(x=>x.name===name)}
function currentCart(){return [...cart.values()].map(({name,price,qty})=>({name,price,qty}))}
function applyCapture(c){if(!c)return;for(const k of ['name','phone','email','notes'])if(String(c[k]||'').trim())agentState[k]=String(c[k]).trim()}
function applyActions(actions){for(const a of actions||[]){if(a.type==='clear'){cart.clear();continue}const p=catalogProduct(a.item_name);if(!p)continue;if(a.type==='add'){add(p,a.quantity||1)}else if(a.type==='remove'){const x=cart.get(p.name);if(!x)continue;x.qty-=Math.max(1,Number(a.quantity)||1);if(x.qty<=0)cart.delete(p.name)}}renderCart()}
function resetAgent(){agentState.stage='idle';agentState.name='';agentState.phone='';agentState.email='';agentState.notes=''}
async function sendToAgent(message){const r=await fetch('/api/agent',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message,cart:currentCart(),state:agentState})});const j=await r.json();if(!r.ok)throw new Error(j.error||'AI assistant unavailable');return j}
async function handle(message){if(busy)return;busy=true;const btn=document.getElementById('chatSend');if(btn)btn.disabled=true;try{
 const plan=await sendToAgent(message);applyActions(plan.actions);applyCapture(plan.capture);agentState.stage=plan.next_stage||agentState.stage;
 if(plan.reply)say2(plan.reply);
 if(plan.submit_order){if(!cart.size||!agentState.name||!agentState.phone||!agentState.email){say2('I still need the missing order details before I can place this order.');return}const out=await submitOrder({customer_name:agentState.name,phone:agentState.phone,email:agentState.email,notes:agentState.notes||''});if(out.ok){say2(`Order #${out.orderId} has been placed successfully and sent to the kitchen queue. A confirmation email will be sent to ${agentState.email}.`);cart.clear();renderCart();resetAgent()}else say2(`I could not place the order: ${out.error}`)}
}catch(e){say2(e.message.includes('OPENAI_API_KEY')?'The AI ordering assistant is not configured yet.':'The AI ordering assistant is temporarily unavailable. Please try again shortly.')}finally{busy=false;if(btn)btn.disabled=false}}
function send2(){const el=document.getElementById('chatText'),q=el.value.trim();if(!q||busy)return;say2(q,'user');el.value='';handle(q)}
document.getElementById('chatSend').onclick=send2;document.getElementById('chatText').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();send2()}};
say2('Hi! You can talk to me naturally. Ask about Mr. Feast or place an order in your own words.');
})();
