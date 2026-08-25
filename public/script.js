const BUSINESS={
  phone:'',
  whatsapp:'',
  address:'',
  hours:'',
  mapsUrl:''
};

const menu=[
  {name:'Classic Burger',category:'Fast Food',price:450,desc:'Juicy chicken patty, crisp lettuce and Mr. Feast sauce.',image:'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=85'},
  {name:'Zinger Burger',category:'Fast Food',price:550,desc:'Crispy zinger fillet, cheese, lettuce and signature sauce.',image:'https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=900&q=85'},
  {name:'Chicken Pizza',category:'Fast Food',price:850,desc:'Cheesy chicken pizza with herbs and a golden baked crust.',image:'https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=900&q=85'},
  {name:'Chicken Shawarma',category:'Fast Food',price:350,desc:'Tender chicken, garlic sauce and fresh crunchy salad.',image:'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=900&q=85'},
  {name:'Fries',category:'Fast Food',price:250,desc:'Crispy golden fries with a choice of house dip.',image:'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=85'},
  {name:'Club Sandwich',category:'Fast Food',price:550,desc:'Triple-layer chicken sandwich with fresh salad and sauce.',image:'https://images.unsplash.com/photo-1553909489-cd47e0907980?auto=format&fit=crop&w=900&q=85'},
  {name:'Chicken Tikka',category:'BBQ',price:450,desc:'Spiced chicken grilled over real charcoal for smoky flavor.',image:'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=900&q=85'},
  {name:'Malai Boti',category:'BBQ',price:600,desc:'Tender creamy chicken cubes with a rich charcoal finish.',image:'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=900&q=85'},
  {name:'Seekh Kebab',category:'BBQ',price:550,desc:'Juicy spiced kebabs grilled hot over charcoal.',image:'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=85'},
  {name:'Chicken Wings',category:'BBQ',price:550,desc:'Smoky grilled wings with a bold Mr. Feast glaze.',image:'https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=900&q=85'},
  {name:'BBQ Platters',category:'BBQ',price:1350,desc:'A shareable mix of tikka, boti, kebab and sides.',image:'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=900&q=85'},
  {name:'Gulab Jamun',category:'Sweets',price:220,desc:'Soft golden dumplings soaked in fragrant sugar syrup.',image:'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=900&q=85'},
  {name:'Rasmalai',category:'Sweets',price:280,desc:'Soft cheese dumplings in chilled saffron milk.',image:'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=900&q=85'},
  {name:'Kheer',category:'Sweets',price:250,desc:'Creamy rice pudding finished with nuts and cardamom.',image:'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=900&q=85'},
  {name:'Brownies',category:'Sweets',price:300,desc:'Rich fudgy chocolate brownie with a soft center.',image:'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?auto=format&fit=crop&w=900&q=85'},
  {name:'Ice Cream',category:'Desserts',price:250,desc:'Cool, creamy scoops with your choice of topping.',image:'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=900&q=85'},
  {name:'Chocolate Lava Cake',category:'Desserts',price:450,desc:'Warm chocolate cake with a molten center.',image:'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=85'},
  {name:'Cheesecake',category:'Desserts',price:500,desc:'Silky cheesecake on a buttery biscuit base.',image:'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=900&q=85'},
  {name:'Waffles',category:'Desserts',price:450,desc:'Golden crisp waffles with cream and chocolate.',image:'https://images.unsplash.com/photo-1562376552-7684c019e1cb?auto=format&fit=crop&w=900&q=85'},
  {name:'Sundaes',category:'Desserts',price:350,desc:'Vanilla ice cream, chocolate sauce and crunchy toppings.',image:'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=900&q=85'}
];

const deals=[
  {name:'Mr. Feast Deal 01',price:899,desc:'2 Zinger Burgers · Large Fries · 2 Drinks',image:'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1000&q=88'},
  {name:'BBQ Feast Deal',price:1499,desc:'Chicken Tikka · Malai Boti · Seekh Kebab · 2 Naan · Salad',image:'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1000&q=88'},
  {name:'Family Feast',price:2799,desc:'4 Burgers · 2 Loaded Fries · 12 Wings · 4 Drinks',image:'https://images.unsplash.com/photo-1550317138-10000687a72b?auto=format&fit=crop&w=1000&q=88'},
  {name:'Sweet Feast',price:999,desc:'Brownie · 2 Ice Creams · Waffles · Chocolate Lava Cake',image:'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1000&q=88'}
];

const money=n=>`Rs. ${Number(n).toLocaleString('en-PK')}`;
let activeFilter='All';
const cart=new Map();

const grid=document.getElementById('menuGrid');
const filters=document.getElementById('menuFilters');
const dealGrid=document.getElementById('dealGrid');
const cartDrawer=document.getElementById('cartDrawer');
const cartBackdrop=document.getElementById('cartBackdrop');
const cartItems=document.getElementById('cartItems');
const cartEmpty=document.getElementById('cartEmpty');
const cartTotal=document.getElementById('cartTotal');
const checkoutBtn=document.getElementById('checkoutBtn');
const checkoutNote=document.getElementById('checkoutNote');
const toast=document.getElementById('toast');

function showToast(text){
  if(!toast)return;
  toast.textContent=text;
  toast.classList.add('show');
  clearTimeout(showToast.t);
  showToast.t=setTimeout(()=>toast.classList.remove('show'),1800);
}

function renderMenu(){
  if(!grid)return;
  const visible=menu.filter(x=>activeFilter==='All'||x.category===activeFilter);
  grid.innerHTML=visible.map(x=>`<article class="food"><img src="${x.image}" alt="${x.name}" loading="lazy"><div class="body"><div class="tag">${x.category}</div><h3>${x.name}</h3><p>${x.desc}</p><div class="price-row"><div class="price">${money(x.price)}</div><button class="add-item" type="button" data-add-menu="${x.name}">Add +</button></div></div></article>`).join('');
}

function renderDeals(){
  if(!dealGrid)return;
  dealGrid.innerHTML=deals.map((d,i)=>`<article class="deal-card"><img src="${d.image}" alt="${d.name}" loading="lazy"><div class="deal-body"><div class="deal-label"><span>DEAL ${String(i+1).padStart(2,'0')}</span><b>${money(d.price)}</b></div><h3>${d.name}</h3><p>${d.desc}</p><button class="deal-order" type="button" data-add-deal="${d.name}">Add Deal to Order</button></div></article>`).join('');
}

function selectFilter(category,scroll=true){
  activeFilter=category;
  filters?.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.filter===category));
  renderMenu();
  if(scroll)document.getElementById('menu')?.scrollIntoView({behavior:'smooth',block:'start'});
}

filters?.addEventListener('click',e=>{
  const b=e.target.closest('button[data-filter]');
  if(b)selectFilter(b.dataset.filter,false);
});
document.querySelectorAll('[data-category-jump]').forEach(a=>a.addEventListener('click',()=>selectFilter(a.dataset.categoryJump,false)));
document.querySelector('.filter-bbq')?.addEventListener('click',()=>selectFilter('BBQ',true));

function findProduct(name){
  const m=menu.find(x=>x.name===name); if(m)return {...m,type:'item'};
  const d=deals.find(x=>x.name===name); if(d)return {...d,type:'deal'};
  return null;
}

function addToCart(name,qty=1){
  const product=findProduct(name); if(!product)return;
  const current=cart.get(name)||{...product,qty:0};
  current.qty+=qty;
  if(current.qty<=0)cart.delete(name);else cart.set(name,current);
  renderCart();
  showToast(`${name} added to your order`);
}

function cartCount(){return [...cart.values()].reduce((s,x)=>s+x.qty,0)}
function cartValue(){return [...cart.values()].reduce((s,x)=>s+x.qty*x.price,0)}

function renderCart(){
  const values=[...cart.values()];
  if(cartItems)cartItems.innerHTML=values.map(x=>`<div class="cart-line"><div><h4>${x.name}</h4><small>${money(x.price)} each</small></div><div class="qty"><button type="button" data-qty="-1" data-name="${x.name}">−</button><b>${x.qty}</b><button type="button" data-qty="1" data-name="${x.name}">+</button></div></div>`).join('');
  if(cartEmpty)cartEmpty.style.display=values.length?'none':'block';
  if(cartTotal)cartTotal.textContent=money(cartValue());
  const count=cartCount();
  ['navCartCount','orderCount','mobileCartCount'].forEach(id=>{const el=document.getElementById(id);if(el)el.textContent=count});
  if(checkoutBtn){checkoutBtn.disabled=!values.length||!BUSINESS.whatsapp;checkoutBtn.textContent=BUSINESS.whatsapp?'Send Order on WhatsApp':'WhatsApp Setup Pending'}
}

grid?.addEventListener('click',e=>{const b=e.target.closest('[data-add-menu]');if(b)addToCart(b.dataset.addMenu)});
dealGrid?.addEventListener('click',e=>{const b=e.target.closest('[data-add-deal]');if(b){addToCart(b.dataset.addDeal);openCart()}});
cartItems?.addEventListener('click',e=>{const b=e.target.closest('[data-qty]');if(!b)return;const item=cart.get(b.dataset.name);if(!item)return;item.qty+=Number(b.dataset.qty);if(item.qty<=0)cart.delete(b.dataset.name);renderCart()});

function openCart(){cartDrawer?.classList.add('open');cartBackdrop?.classList.add('open');cartDrawer?.setAttribute('aria-hidden','false')}
function closeCart(){cartDrawer?.classList.remove('open');cartBackdrop?.classList.remove('open');cartDrawer?.setAttribute('aria-hidden','true')}
document.querySelectorAll('.order-trigger').forEach(b=>b.addEventListener('click',openCart));
document.getElementById('cartNav')?.addEventListener('click',openCart);
document.getElementById('cartClose')?.addEventListener('click',closeCart);
cartBackdrop?.addEventListener('click',closeCart);
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeCart()});

function orderText(){
  const values=[...cart.values()];
  const name=document.getElementById('customerName')?.value.trim();
  const notes=document.getElementById('orderNotes')?.value.trim();
  const lines=['Hello Mr. Feast, I would like to place an order:',''];
  values.forEach(x=>lines.push(`• ${x.qty} × ${x.name} — ${money(x.qty*x.price)}`));
  lines.push('',`Estimated total: ${money(cartValue())}`);
  if(name)lines.push(`Name: ${name}`);
  if(notes)lines.push(`Notes: ${notes}`);
  lines.push('','Please confirm availability and final total.');
  return lines.join('\n');
}

async function copyOrder(){
  if(!cart.size){showToast('Add something to your order first');return}
  try{await navigator.clipboard.writeText(orderText());showToast('Order text copied')}catch{showToast('Could not copy automatically')}
}
document.getElementById('copyOrderBtn')?.addEventListener('click',copyOrder);
checkoutBtn?.addEventListener('click',()=>{
  if(!cart.size)return;
  if(!BUSINESS.whatsapp){copyOrder();return}
  const number=BUSINESS.whatsapp.replace(/\D/g,'');
  window.open(`https://wa.me/${number}?text=${encodeURIComponent(orderText())}`,'_blank','noopener');
});

function configureBusiness(){
  const address=document.getElementById('businessAddress');
  const hours=document.getElementById('businessHours');
  const phone=document.getElementById('businessPhone');
  if(BUSINESS.address&&address)address.textContent=BUSINESS.address;
  if(BUSINESS.hours&&hours)hours.textContent=BUSINESS.hours;
  if((BUSINESS.phone||BUSINESS.whatsapp)&&phone)phone.textContent=BUSINESS.phone||BUSINESS.whatsapp;
  const call=document.getElementById('callAction');
  const wa=document.getElementById('waAction');
  const map=document.getElementById('mapAction');
  const mobileWa=document.getElementById('mobileWhatsApp');
  if(BUSINESS.phone&&call){call.disabled=false;call.onclick=()=>location.href=`tel:${BUSINESS.phone}`}
  if(BUSINESS.whatsapp&&wa){wa.disabled=false;wa.onclick=()=>window.open(`https://wa.me/${BUSINESS.whatsapp.replace(/\D/g,'')}`,'_blank','noopener')}
  if(BUSINESS.whatsapp&&mobileWa){mobileWa.disabled=false;mobileWa.onclick=wa.onclick}
  if(BUSINESS.mapsUrl&&map){map.disabled=false;map.onclick=()=>window.open(BUSINESS.mapsUrl,'_blank','noopener')}
  if(checkoutNote&&BUSINESS.whatsapp)checkoutNote.textContent='Your order will open in WhatsApp for final confirmation with the restaurant.';
}

renderMenu();
renderDeals();
renderCart();
configureBusiness();
fetch('/api/menu-images').then(r=>r.ok?r.json():{}).then(overrides=>{menu.forEach(x=>{if(overrides[x.name])x.image=overrides[x.name]});renderMenu()}).catch(()=>{});

const chat=document.getElementById('chat');
const chatBtn=document.getElementById('chatBtn');
const closeBtn=document.getElementById('close');
const chatBody=chat?.querySelector('.chatbody');
const chatInput=chat?.querySelector('.chatinput');

if(chat&&chatBtn&&closeBtn&&chatBody&&chatInput){
  chatBtn.textContent='💬';
  chatBtn.title='Chat with Mr. Feast Assistant';
  chat.querySelector('.chathead small').textContent='Online · Menu & order help';
  chatBtn.onclick=()=>chat.classList.add('open');
  closeBtn.onclick=()=>chat.classList.remove('open');
  const extraStyle=document.createElement('style');
  extraStyle.textContent=`.chatbody{max-height:330px;overflow-y:auto}.msg{padding:9px 11px;border-radius:12px;margin:7px 0;font-size:12px;line-height:1.45;max-width:92%}.msg.bot{background:#f3eadf;color:#352a27}.msg.user{background:#6B1F2B;color:white;margin-left:auto}.textcontrols{display:grid;grid-template-columns:1fr 42px;gap:6px;padding:10px;border-top:1px solid #e3d8c3}.textcontrols input{min-width:0;border:1px solid #d9cfbc;border-radius:10px;padding:10px;background:white}.textcontrols button{border:0;border-radius:10px;background:#6B1F2B;color:white;font-weight:800;cursor:pointer}.quick{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}.quick button{cursor:pointer;border:1px solid #d9cfbc;background:white;border-radius:999px;padding:7px 9px;color:#6B1F2B;font-weight:800;font-size:10px}`;
  document.head.appendChild(extraStyle);
  function addMessage(text,who='bot'){const el=document.createElement('div');el.className=`msg ${who}`;el.textContent=text;chatBody.appendChild(el);chatBody.scrollTop=chatBody.scrollHeight}
  function findMenuItem(q){q=q.toLowerCase();return menu.find(x=>q.includes(x.name.toLowerCase())||x.name.toLowerCase().split(' ').some(w=>w.length>4&&q.includes(w)))}
  function answerFor(raw){
    const q=String(raw||'').toLowerCase().trim();
    const item=findMenuItem(q);
    if(/^add |order /.test(q)&&item){addToCart(item.name);return `${item.name} has been added to your order. Your cart now has ${cartCount()} item${cartCount()===1?'':'s'}.`}
    if(/cart|my order|checkout/.test(q)){openCart();return `I opened your order cart. Current estimated total is ${money(cartValue())}.`}
    if(item)return `${item.name} is ${money(item.price)}. ${item.desc} You can type “add ${item.name}” to add it to your order.`;
    if(/deal|offer|special/.test(q))return `Current sample deals: ${deals.map(d=>`${d.name} ${money(d.price)}`).join(', ')}.`;
    if(/menu|available|what do you have/.test(q))return 'Mr. Feast serves Fast Food, BBQ, Sweets and Desserts. Use the menu filters to browse quickly.';
    if(/dessert|sweet/.test(q))return 'Desserts include Ice Cream, Chocolate Lava Cake, Cheesecake, Waffles and Sundaes. Sweets include Gulab Jamun, Rasmalai, Kheer and Brownies.';
    if(/bbq|barbecue/.test(q))return 'Our BBQ menu includes Chicken Tikka, Malai Boti, Seekh Kebab, Chicken Wings and BBQ Platters.';
    if(/address|location|where/.test(q))return BUSINESS.address?BUSINESS.address:'The confirmed Mr. Feast address has not been configured yet.';
    if(/whatsapp|phone|number|call/.test(q))return BUSINESS.phone||BUSINESS.whatsapp||'The confirmed restaurant phone/WhatsApp number has not been configured yet.';
    if(/time|timing|hours|open|close/.test(q))return BUSINESS.hours||'Confirmed opening hours have not been configured yet.';
    if(/hello|hi|hey|salam|assalam/.test(q))return 'Hello! I can help you browse the menu, check prices, add items to your order and view deals.';
    return 'Ask me about the menu, prices, BBQ, deals or desserts. You can also type “add Zinger Burger” or “open cart”.';
  }
  function handleQuestion(text){text=String(text||'').trim();if(!text)return;addMessage(text,'user');setTimeout(()=>addMessage(answerFor(text),'bot'),120)}
  chatBody.innerHTML='';
  addMessage('Hello! I am the Mr. Feast Assistant. I can help with the menu and build your order.');
  const quick=document.createElement('div');quick.className='quick';
  ['Menu','BBQ','Special deals','Open cart'].forEach(q=>{const b=document.createElement('button');b.textContent=q;b.onclick=()=>handleQuestion(q);quick.appendChild(b)});chatBody.appendChild(quick);
  chatInput.className='textcontrols';chatInput.innerHTML='<input id="agentText" aria-label="Ask Mr. Feast Assistant" placeholder="Type your message..."><button id="agentSend" title="Send">➤</button>';
  const textBox=document.getElementById('agentText');const sendBtn=document.getElementById('agentSend');sendBtn.onclick=()=>{handleQuestion(textBox.value);textBox.value='';textBox.focus()};textBox.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();sendBtn.click()}});
}
