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
const grid=document.getElementById('menuGrid');
function renderMenu(){grid.innerHTML=menu.map(x=>`<article class="food"><img src="${x[4]}" alt="${x[0]}" loading="lazy"><div class="body"><div class="tag">${x[1]}</div><h3>${x[0]}</h3><p>${x[3]}</p><div class="price">${x[2]}</div></div></article>`).join('')}
renderMenu();
fetch('/api/menu-images').then(r=>r.ok?r.json():{}).then(overrides=>{menu.forEach(x=>{if(overrides[x[0]])x[4]=overrides[x[0]]});renderMenu()}).catch(()=>{});
const nav=document.querySelector('nav');
const orderButton=nav?.querySelector('a.pill');
if(nav&&orderButton){const adminLink=document.createElement('a');adminLink.href='/admin';adminLink.textContent='Admin';adminLink.setAttribute('aria-label','Open admin panel');adminLink.style.fontWeight='800';adminLink.style.fontSize='13px';adminLink.style.color='#0b5b59';adminLink.style.padding='10px 12px';adminLink.style.border='1px solid #0b5b59';adminLink.style.borderRadius='999px';adminLink.style.marginLeft='auto';adminLink.style.marginRight='10px';nav.insertBefore(adminLink,orderButton);}
const chat=document.getElementById('chat');document.getElementById('chatBtn').onclick=()=>chat.classList.add('open');document.getElementById('close').onclick=()=>chat.classList.remove('open');document.querySelectorAll('.quick button').forEach(b=>b.onclick=()=>{const q=encodeURIComponent(`Assalam-o-Alaikum Mr. Feast, I want to ask about ${b.textContent.replace(/^\S+\s/,'')}.`);window.open(`https://wa.me/923000000000?text=${q}`,'_blank')});
