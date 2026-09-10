(()=>{
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const priceNum=v=>Number(String(v||'').replace(/[^0-9]/g,''))||0;

  function karachiMinutes(){
    const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Karachi',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date());
    const h=Number(parts.find(x=>x.type==='hour')?.value||0),m=Number(parts.find(x=>x.type==='minute')?.value||0);
    return h*60+m;
  }
  function isOpen(start,end){const n=karachiMinutes();return end>1440?(n>=start||n<(end-1440)):(n>=start&&n<end)}
  function statusPill(){
    const ff=isOpen(12*60,25*60),bbq=isOpen(18*60,27*60);
    const wrap=document.createElement('div');wrap.className='live-hours';
    wrap.innerHTML=`<span class="lh-label">Open status</span><span class="lh-pill ${ff?'open':'closed'}">Fast Food · ${ff?'Open':'Closed'}</span><span class="lh-pill ${bbq?'open':'closed'}">BBQ · ${bbq?'Open':'Closed'}</span>`;
    const hero=document.querySelector('.hero-copy');if(hero)hero.appendChild(wrap);
  }

  function heroUpgrade(){
    const h=document.querySelector('.hero h1');if(h)h.innerHTML='Karachi Ki <em>Mehfil.</em><br>Asli Zaika.';
    const p=document.querySelector('.hero-copy>p');if(p)p.textContent='Smoky charcoal BBQ, crave-worthy fast food and sweet finishes — freshly prepared for pickup or delivery.';
    const actions=document.querySelector('.hero .actions');if(actions){actions.innerHTML='<a class="pill big" href="#menu">View Menu</a><a class="outline" href="#order">Order Online</a>'}
  }

  async function signature(){
    const menu=document.getElementById('menu');if(!menu)return;
    let rows=Array.isArray(window.__mehfilMenu)?window.__mehfilMenu:[];
    if(!rows.length){try{const r=await fetch('/api/menu-items');if(r.ok)rows=await r.json()}catch(e){}}
    if(!Array.isArray(rows)||!rows.length)return;
    const featured=[...rows].sort((a,b)=>priceNum(b.price)-priceNum(a.price)).slice(0,6);
    const sec=document.createElement('section');sec.className='signature section';sec.id='signature';
    sec.innerHTML=`<div class="signature-head"><div><div class="kicker maroonText">SIGNATURE DISHES</div><h2>Start with our <em>favorites.</em></h2></div><p>Popular picks from the live menu.</p></div><div class="signature-grid">${featured.map((x,i)=>`<article class="signature-card"><div class="sig-img"><img src="${esc(x.imageUrl||'')}" alt="${esc(x.name)}" loading="lazy"><span>${i<2?'Popular':'Chef Pick'}</span></div><div class="sig-body"><small>${esc(x.category)}</small><h3>${esc(x.name)}</h3><p>${esc(x.description||'Freshly prepared to order.')}</p><div class="sig-foot"><b>${esc(x.price)}</b><button class="addcart" data-id="${esc(x.id)}">Add to Cart</button></div></div></article>`).join('')}</div>`;
    menu.parentNode.insertBefore(sec,menu);
  }

  const style=document.createElement('style');style.textContent=`
    .live-hours{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:18px}.lh-label{font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#b8ad9e;font-weight:800}.lh-pill{font-size:10px;font-weight:800;padding:7px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.12);background:rgba(10,10,10,.4);backdrop-filter:blur(8px)}.lh-pill.open{color:#bce7c7;border-color:rgba(112,202,139,.35)}.lh-pill.closed{color:#d8c6c6;border-color:rgba(190,100,100,.28)}
    .signature{background:#090a0c!important;border-top:1px solid rgba(226,197,130,.12);border-bottom:1px solid rgba(226,197,130,.12)}.signature-head{display:flex;justify-content:space-between;align-items:end;gap:30px;margin-bottom:30px}.signature-head h2{font:700 clamp(40px,5vw,68px)/.98 'Playfair Display',serif;margin:0;color:#f4ead7}.signature-head h2 em{color:#e2c582;font-style:normal}.signature-head p{color:#b8ad9e;font-size:12px}.signature-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px}.signature-card{overflow:hidden;border-radius:18px;border:1px solid rgba(226,197,130,.18);background:#14171b;box-shadow:0 16px 42px rgba(0,0,0,.24);transition:.3s}.signature-card:hover{transform:translateY(-5px);border-color:rgba(226,197,130,.4)}.sig-img{height:245px;overflow:hidden;position:relative}.sig-img img{width:100%;height:100%;object-fit:cover;transition:transform .6s ease}.signature-card:hover .sig-img img{transform:scale(1.05)}.sig-img span{position:absolute;left:14px;top:14px;padding:7px 10px;border-radius:999px;background:rgba(9,10,12,.8);border:1px solid rgba(226,197,130,.35);color:#e2c582;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:.7px}.sig-body{padding:20px}.sig-body small{color:#c9a45c;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:1.5px}.sig-body h3{font:700 23px 'Playfair Display',serif;color:#f4ead7;margin:8px 0}.sig-body p{color:#b8ad9e;font-size:12px;line-height:1.55;min-height:38px}.sig-foot{display:flex;gap:14px;align-items:center;justify-content:space-between;margin-top:18px}.sig-foot b{color:#e2c582;font-size:18px}.sig-foot .addcart{width:auto!important;margin:0!important;padding:10px 15px!important}
    @media(max-width:950px){.signature-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:620px){.signature-head{align-items:flex-start;flex-direction:column}.signature-grid{grid-template-columns:1fr}.sig-img{height:230px}.live-hours{margin-top:14px}}
  `;document.head.appendChild(style);
  heroUpgrade();statusPill();signature();
})();
