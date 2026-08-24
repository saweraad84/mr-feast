const menu=[
['Classic Burger','Fast Food','Rs. 450','Juicy chicken patty, crisp lettuce and Mr. Feast sauce.','https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=85'],
['Zinger Burger','Fast Food','Rs. 550','Crispy zinger fillet, cheese, lettuce and signature sauce.','https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=900&q=85'],
['Chicken Pizza','Fast Food','Rs. 850','Cheesy chicken pizza with herbs and a golden baked crust.','https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=900&q=85'],
['Chicken Shawarma','Fast Food','Rs. 350','Tender chicken, garlic sauce and fresh crunchy salad.','https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=900&q=85'],
['Fries','Fast Food','Rs. 250','Crispy golden fries with a choice of house dip.','https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=85'],
['Club Sandwich','Fast Food','Rs. 550','Triple-layer chicken sandwich with fresh salad and sauce.','https://images.unsplash.com/photo-1553909489-cd47e0907980?auto=format&fit=crop&w=900&q=85'],
['Chicken Tikka','BBQ','Rs. 450','Spiced chicken grilled over real charcoal for smoky flavor.','https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=900&q=85'],
['Malai Boti','BBQ','Rs. 600','Tender creamy chicken cubes with a rich charcoal finish.','https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=85'],
['Seekh Kebab','BBQ','Rs. 550','Juicy spiced kebabs grilled hot over charcoal.','https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=85'],
['Chicken Wings','BBQ','Rs. 550','Smoky grilled wings with a bold Mr. Feast glaze.','https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=900&q=85'],
['BBQ Platters','BBQ','Rs. 1,350','A shareable mix of tikka, boti, kebab and sides.','https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=900&q=85'],
['Gulab Jamun','Sweets','Rs. 220','Soft golden dumplings soaked in fragrant sugar syrup.','https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=900&q=85'],
['Rasmalai','Sweets','Rs. 280','Soft cheese dumplings in chilled saffron milk.','https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=900&q=85'],
['Kheer','Sweets','Rs. 250','Creamy rice pudding finished with nuts and cardamom.','https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=900&q=85'],
['Brownies','Sweets','Rs. 300','Rich fudgy chocolate brownie with a soft center.','https://images.unsplash.com/photo-1564355808539-22fda35bed7e?auto=format&fit=crop&w=900&q=85'],
['Ice Cream','Desserts','Rs. 250','Cool, creamy scoops with your choice of topping.','https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=900&q=85'],
['Chocolate Lava Cake','Desserts','Rs. 450','Warm chocolate cake with a molten center.','https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=85'],
['Cheesecake','Desserts','Rs. 500','Silky cheesecake on a buttery biscuit base.','https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=900&q=85'],
['Waffles','Desserts','Rs. 450','Golden crisp waffles with cream and chocolate.','https://images.unsplash.com/photo-1562376552-7684c019e1cb?auto=format&fit=crop&w=900&q=85'],
['Sundaes','Desserts','Rs. 350','Vanilla ice cream, chocolate sauce and crunchy toppings.','https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=900&q=85']];

const deals=[
['Mr. Feast Deal 01','Rs. 899','2 Zinger Burgers, Large Fries and 2 Drinks'],
['BBQ Feast Deal','Rs. 1,499','Chicken Tikka, Malai Boti, Seekh Kebab, 2 Naan and Salad'],
['Family Feast','Rs. 2,799','4 Burgers, 2 Loaded Fries, 12 Wings and 4 Drinks'],
['Sweet Feast','Rs. 999','Brownie, 2 Ice Creams, Waffles and Chocolate Lava Cake']
];

const grid=document.getElementById('menuGrid');
function renderMenu(){grid.innerHTML=menu.map(x=>`<article class="food"><img src="${x[4]}" alt="${x[0]}" loading="lazy"><div class="body"><div class="tag">${x[1]}</div><h3>${x[0]}</h3><p>${x[3]}</p><div class="price">${x[2]}</div></div></article>`).join('')}
renderMenu();
fetch('/api/menu-images').then(r=>r.ok?r.json():{}).then(overrides=>{menu.forEach(x=>{if(overrides[x[0]])x[4]=overrides[x[0]]});renderMenu()}).catch(()=>{});

const nav=document.querySelector('nav');
const orderButton=nav?.querySelector('a.pill');
if(nav&&orderButton){const adminLink=document.createElement('a');adminLink.href='/admin';adminLink.textContent='Admin';adminLink.setAttribute('aria-label','Open admin panel');adminLink.style.fontWeight='800';adminLink.style.fontSize='13px';adminLink.style.color='#0b5b59';adminLink.style.padding='10px 12px';adminLink.style.border='1px solid #0b5b59';adminLink.style.borderRadius='999px';adminLink.style.marginLeft='auto';adminLink.style.marginRight='10px';nav.insertBefore(adminLink,orderButton);}

const chat=document.getElementById('chat');
const chatBtn=document.getElementById('chatBtn');
const closeBtn=document.getElementById('close');
const chatBody=chat.querySelector('.chatbody');
const chatInput=chat.querySelector('.chatinput');
chat.querySelector('.chathead small').textContent='Voice enabled · Ready to talk';
chatBtn.textContent='🎙️';
chatBtn.title='Talk to Mr. Feast Assistant';
chatBtn.onclick=()=>chat.classList.add('open');
closeBtn.onclick=()=>{chat.classList.remove('open');window.speechSynthesis?.cancel()};

const extraStyle=document.createElement('style');
extraStyle.textContent=`.chatbody{max-height:330px;overflow-y:auto}.msg{padding:9px 11px;border-radius:12px;margin:7px 0;font-size:12px;line-height:1.45;max-width:92%}.msg.bot{background:#f0e7d5;color:#173b38}.msg.user{background:#0b5b59;color:white;margin-left:auto}.voicecontrols{display:grid;grid-template-columns:1fr 42px 42px;gap:6px;padding:10px;border-top:1px solid #e3d8c3}.voicecontrols input{min-width:0;border:1px solid #d9cfbc;border-radius:10px;padding:10px;background:white}.voicecontrols button{border:0;border-radius:10px;background:#0b5b59;color:white;font-weight:800;cursor:pointer}.voicecontrols .mic.listening{background:#9a3f34;animation:pulse 1s infinite}.voicehint{font-size:10px;color:#6d7975;padding:0 11px 10px}.quick{margin-top:8px}.quick button{cursor:pointer}@keyframes pulse{50%{transform:scale(1.07)}}`;
document.head.appendChild(extraStyle);

function addMessage(text,who='bot'){
  const el=document.createElement('div');
  el.className=`msg ${who}`;
  el.textContent=text;
  chatBody.appendChild(el);
  chatBody.scrollTop=chatBody.scrollHeight;
}

chatBody.innerHTML='';
addMessage('Hello! I am the Mr. Feast Assistant. You can type your question or tap the microphone and talk to me.');
const quick=document.createElement('div');
quick.className='quick';
['Burger price?','BBQ for 2','Special deals','Desserts'].forEach(q=>{const b=document.createElement('button');b.textContent=q;b.onclick=()=>handleQuestion(q);quick.appendChild(b)});
chatBody.appendChild(quick);

chatInput.className='voicecontrols';
chatInput.innerHTML='<input id="agentText" aria-label="Ask Mr. Feast Assistant" placeholder="Type or speak..."><button id="agentSend" title="Send">➤</button><button id="agentMic" class="mic" title="Speak">🎙️</button>';
const textBox=document.getElementById('agentText');
const sendBtn=document.getElementById('agentSend');
const micBtn=document.getElementById('agentMic');
const hint=document.createElement('div');hint.className='voicehint';hint.textContent='Tap the microphone, ask your question, and the assistant will reply aloud.';chat.appendChild(hint);

const aliases={
'classic burger':['classic burger','classic'],
'zinger burger':['zinger','zinger burger'],
'chicken pizza':['chicken pizza','pizza'],
'chicken shawarma':['shawarma'],
'fries':['fries'],
'club sandwich':['sandwich','club sandwich'],
'chicken tikka':['tikka','chicken tikka'],
'malai boti':['malai','malai boti'],
'seekh kebab':['seekh','kebab','seekh kebab'],
'chicken wings':['wings','chicken wings'],
'bbq platters':['platter','bbq platter','bbq for 2'],
'gulab jamun':['gulab jamun'],
'rasmalai':['rasmalai','ras malai'],
'kheer':['kheer'],
'brownies':['brownie','brownies'],
'ice cream':['ice cream'],
'chocolate lava cake':['lava cake','chocolate lava','chocolate lava cake'],
'cheesecake':['cheesecake','cheese cake'],
'waffles':['waffle','waffles'],
'sundaes':['sundae','sundaes']
};

function findMenuItem(q){
  q=q.toLowerCase();
  for(const [name,words] of Object.entries(aliases)){
    if(words.some(w=>q.includes(w.toLowerCase()))) return menu.find(x=>x[0].toLowerCase()===name);
  }
  return null;
}

function answerFor(raw){
  const q=String(raw||'').toLowerCase().trim();
  const item=findMenuItem(q);
  if(item) return `${item[0]} costs ${item[2]}. ${item[3]}`;
  if(/deal|offers|special/.test(q)) return `Our current sample deals are: ${deals.map(d=>`${d[0]} for ${d[1]}`).join(', ')}. Ask me for the details of any deal.`;
  if(/menu|what do you have|what is available/.test(q)) return 'Mr. Feast serves Fast Food, BBQ, Sweets and Desserts. You can ask me about burgers, Chicken Pizza, shawarma, Chicken Tikka, Malai Boti, kebabs, sweets or desserts.';
  if(/dessert|sweet/.test(q)) return 'Desserts include Ice Cream for Rs. 250, Chocolate Lava Cake for Rs. 450, Cheesecake for Rs. 500, Waffles for Rs. 450 and Sundaes for Rs. 350. Sweets include Gulab Jamun, Rasmalai, Kheer and Brownies.';
  if(/bbq|barbecue/.test(q)) return 'Our BBQ menu includes Chicken Tikka for Rs. 450, Malai Boti for Rs. 600, Seekh Kebab for Rs. 550, Chicken Wings for Rs. 550 and a BBQ Platter for Rs. 1,350.';
  if(/price|rate|cost|how much/.test(q)) return 'Tell me the name of the item you want a price for, such as Zinger Burger, Chicken Pizza or Malai Boti.';
  if(/best|recommend|popular/.test(q)) return 'Confirmed sales data is not available yet, so I will not make up a best-seller claim. You may want to try the Zinger Burger, Chicken Pizza, BBQ Platter or Chocolate Lava Cake.';
  if(/address|location|where/.test(q)) return 'The exact confirmed Mr. Feast address has not been added to the website yet. Once it is confirmed, I will be able to provide it here.';
  if(/whatsapp|phone|number|call/.test(q)) return 'A confirmed Mr. Feast WhatsApp or phone number has not been configured yet, so I will not provide an unverified number.';
  if(/time|timing|hours|open|close/.test(q)) return 'Confirmed Mr. Feast opening hours have not been configured yet, so I will not provide unverified timings.';
  if(/order/.test(q)) return 'I can help you with the menu and prices. A confirmed restaurant WhatsApp number still needs to be added before I can send an online order there.';
  if(/hello|hi|hey|salam|assalam/.test(q)) return 'Hello! How can I help you with Mr. Feast today? You can ask about the menu, prices, BBQ, deals or desserts.';
  return 'I can help with the Mr. Feast menu, prices, BBQ, deals and desserts. Ask me about an item, for example: “How much is a Zinger Burger?”';
}

function speak(text){
  if(!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(text);
  const voices=window.speechSynthesis.getVoices();
  const v=voices.find(x=>/^en(-|_)?PK/i.test(x.lang))||voices.find(x=>/^en(-|_)?GB/i.test(x.lang))||voices.find(x=>/^en(-|_)?US/i.test(x.lang))||voices.find(x=>/^en/i.test(x.lang));
  if(v)u.voice=v;
  u.lang=v?.lang||'en-US';u.rate=.95;u.pitch=1;
  window.speechSynthesis.speak(u);
}

function handleQuestion(text){
  text=String(text||'').trim();if(!text)return;
  addMessage(text,'user');
  const reply=answerFor(text);
  setTimeout(()=>{addMessage(reply,'bot');speak(reply)},180);
}

sendBtn.onclick=()=>{handleQuestion(textBox.value);textBox.value=''};
textBox.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();sendBtn.click()}});

const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;
if(SpeechRecognition){
  const rec=new SpeechRecognition();
  rec.lang='en-US';rec.interimResults=false;rec.continuous=false;
  rec.onstart=()=>{micBtn.classList.add('listening');micBtn.textContent='●';hint.textContent='Listening... ask your question.'};
  rec.onend=()=>{micBtn.classList.remove('listening');micBtn.textContent='🎙️';hint.textContent='Tap the microphone, ask your question, and the assistant will reply aloud.'};
  rec.onerror=e=>{hint.textContent=e.error==='not-allowed'?'Please allow microphone permission.':'I could not hear you clearly. Please try again.'};
  rec.onresult=e=>{const text=e.results[0][0].transcript;textBox.value=text;handleQuestion(text);textBox.value=''};
  micBtn.onclick=()=>{try{window.speechSynthesis?.cancel();rec.start()}catch{}};
}else{
  micBtn.disabled=true;micBtn.title='Voice recognition is not supported in this browser';hint.textContent='Voice recognition is not supported in this browser. Text chat will still work.';
}
