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
['Mr. Feast Deal 01','Rs. 899','2 Zinger Burgers, Large Fries aur 2 Drinks'],
['BBQ Feast Deal','Rs. 1,499','Chicken Tikka, Malai Boti, Seekh Kebab, 2 Naan aur Salad'],
['Family Feast','Rs. 2,799','4 Burgers, 2 Loaded Fries, 12 Wings aur 4 Drinks'],
['Sweet Feast','Rs. 999','Brownie, 2 Ice Creams, Waffles aur Chocolate Lava Cake']
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
addMessage('Assalam-o-Alaikum! Main Mr. Feast Assistant hoon. Aap type bhi kar sakte hain aur mic daba kar mujh se baat bhi kar sakte hain.');
const quick=document.createElement('div');
quick.className='quick';
['Burger ki price?','BBQ for 2','Special deals','Desserts'].forEach(q=>{const b=document.createElement('button');b.textContent=q;b.onclick=()=>handleQuestion(q);quick.appendChild(b)});
chatBody.appendChild(quick);

chatInput.className='voicecontrols';
chatInput.innerHTML='<input id="agentText" aria-label="Ask Mr. Feast Assistant" placeholder="Type or speak..."><button id="agentSend" title="Send">➤</button><button id="agentMic" class="mic" title="Speak">🎙️</button>';
const textBox=document.getElementById('agentText');
const sendBtn=document.getElementById('agentSend');
const micBtn=document.getElementById('agentMic');
const hint=document.createElement('div');hint.className='voicehint';hint.textContent='Mic par click karein, sawal bolain, assistant jawab bol kar dega.';chat.appendChild(hint);

const aliases={
'classic burger':['classic burger','classic','کلاسک برگر'],
'zinger burger':['zinger','zinger burger','زنگر','زنگر برگر'],
'chicken pizza':['chicken pizza','pizza','پیزا','چکن پیزا'],
'chicken shawarma':['shawarma','شاورما'],
'fries':['fries','فرائز'],
'club sandwich':['sandwich','club sandwich','سینڈوچ','کلب سینڈوچ'],
'chicken tikka':['tikka','chicken tikka','تکہ','چکن تکہ'],
'malai boti':['malai','malai boti','ملائی بوٹی','ملائی'],
'seekh kebab':['seekh','kebab','seekh kebab','سیخ کباب','کباب'],
'chicken wings':['wings','chicken wings','ونگز','چکن ونگز'],
'bbq platters':['platter','bbq platter','bbq for 2','پلیٹر','باربی کیو پلیٹر'],
'gulab jamun':['gulab jamun','گلاب جامن'],
'rasmalai':['rasmalai','ras malai','رس ملائی'],
'kheer':['kheer','کھیر'],
'brownies':['brownie','brownies','براونی'],
'ice cream':['ice cream','آئس کریم'],
'chocolate lava cake':['lava cake','chocolate lava','chocolate lava cake','لاوا کیک','چاکلیٹ لاوا کیک'],
'cheesecake':['cheesecake','cheese cake','چیز کیک'],
'waffles':['waffle','waffles','وافل'],
'sundaes':['sundae','sundaes','سنڈے']
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
  if(item) return `${item[0]} ki price ${item[2]} hai. ${item[3]}`;
  if(/deal|offers|special|ڈیل|آفر/.test(q)) return `Hamare sample deals: ${deals.map(d=>`${d[0]} ${d[1]}`).join(', ')}. Kisi deal ki detail chahiye to naam bol dein.`;
  if(/menu|مینو|kya hai|what do you have/.test(q)) return 'Mr. Feast menu mein Fast Food, BBQ, Sweets aur Desserts hain. Aap burger, Chicken Pizza, shawarma, tikka, Malai Boti, kebab, sweets ya dessert ka naam bol kar price pooch sakte hain.';
  if(/dessert|sweet|میٹھا|ڈیزرٹ|سویٹ/.test(q)) return 'Desserts mein Ice Cream Rs. 250, Chocolate Lava Cake Rs. 450, Cheesecake Rs. 500, Waffles Rs. 450 aur Sundaes Rs. 350 hain. Sweets mein Gulab Jamun, Rasmalai, Kheer aur Brownies hain.';
  if(/bbq|barbecue|باربی/.test(q)) return 'BBQ menu mein Chicken Tikka Rs. 450, Malai Boti Rs. 600, Seekh Kebab Rs. 550, Chicken Wings Rs. 550 aur BBQ Platter Rs. 1,350 hai.';
  if(/price|rate|kitne|قیمت|ریٹ|کتنے/.test(q)) return 'Jis item ki price chahiye us ka naam bol dein, jaise Zinger Burger, Chicken Pizza ya Malai Boti.';
  if(/best|recommend|popular|بہترین|مشورہ/.test(q)) return 'Confirmed sales data abhi available nahi hai, is liye main fake best-seller claim nahi karunga. Aap Zinger Burger, Chicken Pizza, BBQ Platter ya Chocolate Lava Cake dekh sakte hain.';
  if(/address|location|where|لوکیشن|ایڈریس|کہاں/.test(q)) return 'Mr. Feast ka exact confirmed address abhi website data mein add nahi hua. Address confirm hote hi main yahan bata sakunga.';
  if(/whatsapp|phone|number|call|واٹس ایپ|فون|نمبر/.test(q)) return 'Mr. Feast ka confirmed WhatsApp ya phone number abhi configure nahi hua, is liye main koi number invent nahi karunga.';
  if(/time|timing|hours|open|close|ٹائم|اوقات|کھلا/.test(q)) return 'Mr. Feast ke confirmed opening hours abhi configure nahi hue. Main unconfirmed timing share nahi karunga.';
  if(/order|آرڈر/.test(q)) return 'Main menu aur prices mein help kar sakta hoon. Online order ko WhatsApp se final karne ke liye confirmed restaurant number abhi add hona baqi hai.';
  if(/salam|assalam|hello|hi|ہیلو|السلام|سلام/.test(q)) return 'Wa Alaikum Assalam! Mr. Feast mein aap ko kis cheez ki help chahiye—menu, price, BBQ, deals ya desserts?';
  return 'Main Mr. Feast ke menu, prices, BBQ, deals aur desserts ke bare mein help kar sakta hoon. Item ka naam bol kar poochain, jaise “Zinger Burger ki price kya hai?”';
}

function speak(text){
  if(!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(text);
  const voices=window.speechSynthesis.getVoices();
  const v=voices.find(x=>/^ur(-|_)?PK/i.test(x.lang))||voices.find(x=>/^en(-|_)?PK/i.test(x.lang))||voices.find(x=>/^en/i.test(x.lang));
  if(v)u.voice=v;
  u.lang=v?.lang||'en-PK';u.rate=.95;u.pitch=1;
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
  rec.lang='ur-PK';rec.interimResults=false;rec.continuous=false;
  rec.onstart=()=>{micBtn.classList.add('listening');micBtn.textContent='●';hint.textContent='Sun raha hoon... bolain.'};
  rec.onend=()=>{micBtn.classList.remove('listening');micBtn.textContent='🎙️';hint.textContent='Mic par click karein, sawal bolain, assistant jawab bol kar dega.'};
  rec.onerror=e=>{hint.textContent=e.error==='not-allowed'?'Microphone permission allow karein.':'Voice sunne mein masla hua. Dobara try karein.'};
  rec.onresult=e=>{const text=e.results[0][0].transcript;textBox.value=text;handleQuestion(text);textBox.value=''};
  micBtn.onclick=()=>{try{window.speechSynthesis?.cancel();rec.start()}catch{}};
}else{
  micBtn.disabled=true;micBtn.title='Voice recognition is not supported in this browser';hint.textContent='Is browser mein voice recognition supported nahi. Text chat kaam karega.';
}
