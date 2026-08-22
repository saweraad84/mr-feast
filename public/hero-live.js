(()=>{
  const hero=document.getElementById('top');
  if(!hero)return;

  const defaults=[
    {slideNo:1,kicker:'MEHFIL-E-ZAIKA · PAKISTANI FLAVOURS',title:'Jahan Khana Bhi, Mehfil Bhi.',subtitle:'Smoky BBQ, juicy burgers, Chicken Pizza, shawarma, sweets and desserts — made for every table.',primaryButtonText:'Explore Menu',primaryButtonLink:'#menu',secondaryButtonText:'Order Now',secondaryButtonLink:'#order',visible:true,sortOrder:1,imageUrl:'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1900&q=90'},
    {slideNo:2,kicker:'REAL CHARCOAL BBQ',title:'Angaar. Dhuan. Zaika.',subtitle:'Chicken Tikka, Malai Boti, Seekh Kebab and BBQ Platters grilled hot over charcoal.',primaryButtonText:'Explore BBQ',primaryButtonLink:'#bbq',secondaryButtonText:'See Deals',secondaryButtonLink:'#deals',visible:true,sortOrder:2,imageUrl:'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1900&q=90'},
    {slideNo:3,kicker:'BURGERS · PIZZA · SHAWARMA',title:'Fast Food, Full Mood.',subtitle:'Crispy burgers, cheesy Chicken Pizza, shawarma and loaded fries for every craving.',primaryButtonText:'View Fast Food',primaryButtonLink:'#menu',secondaryButtonText:'Order Now',secondaryButtonLink:'#order',visible:true,sortOrder:3,imageUrl:'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1900&q=90'},
    {slideNo:4,kicker:'SWEETS · DESSERTS',title:'Meetha Ho Jaye.',subtitle:'Gulab Jamun, Rasmalai, cheesecake, waffles and chocolate desserts to finish the mehfil.',primaryButtonText:'See Desserts',primaryButtonLink:'#menu',secondaryButtonText:'Special Deals',secondaryButtonLink:'#deals',visible:true,sortOrder:4,imageUrl:'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=1900&q=90'}
  ];

  const style=document.createElement('style');
  style.textContent=`
    .hero{position:relative;overflow:hidden;background:#18080d;color:#fff}
    .hero-live-track{position:absolute;inset:0}
    .hero-live-slide{position:absolute;inset:0;opacity:0;transform:scale(1.045);transition:opacity .85s ease,transform 1.25s ease;pointer-events:none}
    .hero-live-slide.active{opacity:1;transform:scale(1);pointer-events:auto}
    .hero-live-slide img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
    .hero-live-slide:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(21,5,9,.92) 0%,rgba(21,5,9,.67) 42%,rgba(21,5,9,.27) 72%,rgba(21,5,9,.18) 100%),linear-gradient(0deg,rgba(21,5,9,.58),transparent 58%)}
    .hero-live-content{position:absolute;z-index:4;left:8vw;top:50%;transform:translateY(-50%);max-width:790px;padding-right:24px}
    .hero-live-kicker{font-size:11px;letter-spacing:3px;font-weight:900;color:#d7b86c;margin-bottom:18px}
    .hero-live-title{font:700 clamp(48px,7vw,94px)/.9 'Playfair Display',serif;letter-spacing:-4px;margin:0 0 24px;text-wrap:balance}
    .hero-live-title em{font-style:normal;color:#d7b86c}
    .hero-live-subtitle{max-width:620px;font-size:17px;line-height:1.65;color:#eee2dc;margin:0}
    .hero-live-actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:29px}
    .hero-live-actions a{display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:0 20px;border-radius:999px;font-size:13px;font-weight:900;transition:.2s}
    .hero-live-primary{background:#c9a45c;color:#2e1217}
    .hero-live-secondary{border:1px solid rgba(255,255,255,.58);color:#fff;background:rgba(18,5,9,.25);backdrop-filter:blur(5px)}
    .hero-live-primary:hover{transform:translateY(-1px);filter:brightness(1.06)}
    .hero-live-secondary:hover{background:rgba(255,255,255,.12)}
    .hero-live-nav{position:absolute;z-index:7;top:50%;transform:translateY(-50%);width:48px;height:48px;border-radius:50%;border:1px solid rgba(229,202,140,.75);background:rgba(25,7,12,.45);color:#f9ecd3;font-size:27px;display:grid;place-items:center;cursor:pointer;backdrop-filter:blur(6px);transition:.2s}
    .hero-live-nav:hover{background:#63212d;border-color:#efd895}
    .hero-live-prev{left:22px}.hero-live-next{right:22px}
    .hero-live-dots{position:absolute;z-index:8;left:8vw;bottom:30px;display:flex;align-items:center;gap:9px}
    .hero-live-dot{width:10px;height:10px;border:0;border-radius:50%;padding:0;background:rgba(255,255,255,.47);cursor:pointer;transition:.25s}
    .hero-live-dot.active{background:#d7b86c;transform:scale(1.35)}
    .hero-live-count{position:absolute;z-index:8;right:8vw;bottom:26px;color:#eadfc8;font-size:11px;letter-spacing:2px;font-weight:900}
    .hero-live-progress{position:absolute;z-index:8;left:0;bottom:0;width:100%;height:3px;background:rgba(255,255,255,.15)}
    .hero-live-progress span{display:block;height:100%;width:0;background:#c9a45c}
    .hero-live-progress.running span{animation:heroProgress 5.2s linear forwards}
    @keyframes heroProgress{from{width:0}to{width:100%}}
    @media(prefers-reduced-motion:reduce){.hero-live-slide{transition:none;transform:none}.hero-live-progress{display:none}}
    @media(max-width:760px){.hero-live-content{left:7vw;right:7vw;padding:0}.hero-live-title{letter-spacing:-2px;font-size:clamp(44px,13vw,68px)}.hero-live-subtitle{font-size:15px}.hero-live-prev{left:10px}.hero-live-next{right:10px}.hero-live-nav{width:42px;height:42px}.hero-live-dots{left:7vw;bottom:22px}.hero-live-count{right:7vw;bottom:20px}.hero-live-actions a{min-height:44px;padding:0 16px}}
  `;
  document.head.appendChild(style);

  const esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const safeLink=v=>{const s=String(v||'#menu').trim();return /^(#|\/|https?:\/\/)/i.test(s)?s:'#menu'};
  const highlightTitle=title=>{
    const t=esc(title||'');
    const words=t.trim().split(/\s+/);
    if(words.length<2)return t;
    const last=words.pop();
    return `${words.join(' ')} <em>${last}</em>`;
  };

  function mount(items){
    const visible=items.filter(x=>x.visible!==false).sort((a,b)=>(a.sortOrder||a.slideNo)-(b.sortOrder||b.slideNo));
    const slides=visible.length?visible:defaults;
    hero.innerHTML=`<div class="hero-live-track">${slides.map((x,i)=>`<section class="hero-live-slide${i===0?' active':''}" aria-hidden="${i===0?'false':'true'}"><img src="${esc(x.imageUrl||defaults[(x.slideNo||1)-1].imageUrl)}" alt="${esc(x.title||'Restaurant food')}"><div class="hero-live-content"><div class="hero-live-kicker">${esc(x.kicker||'')}</div><h1 class="hero-live-title">${highlightTitle(x.title||'')}</h1><p class="hero-live-subtitle">${esc(x.subtitle||'')}</p><div class="hero-live-actions"><a class="hero-live-primary" href="${esc(safeLink(x.primaryButtonLink))}">${esc(x.primaryButtonText||'Explore Menu')} ↗</a><a class="hero-live-secondary" href="${esc(safeLink(x.secondaryButtonLink))}">${esc(x.secondaryButtonText||'Order Now')}</a></div></div></section>`).join('')}</div><button class="hero-live-nav hero-live-prev" type="button" aria-label="Previous hero slide">‹</button><button class="hero-live-nav hero-live-next" type="button" aria-label="Next hero slide">›</button><div class="hero-live-dots" aria-label="Hero slide navigation"></div><div class="hero-live-count" aria-live="polite"></div><div class="hero-live-progress"><span></span></div>`;

    const nodes=[...hero.querySelectorAll('.hero-live-slide')];
    const dotsWrap=hero.querySelector('.hero-live-dots');
    const count=hero.querySelector('.hero-live-count');
    const progress=hero.querySelector('.hero-live-progress');
    let current=0,timer=null,startX=null;
    const reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    nodes.forEach((_,i)=>{const b=document.createElement('button');b.type='button';b.className='hero-live-dot'+(i===0?' active':'');b.setAttribute('aria-label',`Show hero slide ${i+1}`);b.addEventListener('click',()=>go(i,true));dotsWrap.appendChild(b)});
    const dots=[...dotsWrap.children];

    function updateCount(){count.textContent=`${String(current+1).padStart(2,'0')} / ${String(nodes.length).padStart(2,'0')}`}
    function resetProgress(){progress.classList.remove('running');void progress.offsetWidth;if(!reduced&&nodes.length>1)progress.classList.add('running')}
    function schedule(){clearTimeout(timer);if(!reduced&&nodes.length>1)timer=setTimeout(()=>go(current+1,false),5200);resetProgress()}
    function go(index,userAction){
      if(!nodes.length)return;
      nodes[current].classList.remove('active');nodes[current].setAttribute('aria-hidden','true');dots[current]?.classList.remove('active');
      current=(index+nodes.length)%nodes.length;
      nodes[current].classList.add('active');nodes[current].setAttribute('aria-hidden','false');dots[current]?.classList.add('active');
      updateCount();schedule();
      if(userAction)hero.focus({preventScroll:true});
    }

    hero.setAttribute('tabindex','0');
    hero.querySelector('.hero-live-next').addEventListener('click',()=>go(current+1,true));
    hero.querySelector('.hero-live-prev').addEventListener('click',()=>go(current-1,true));
    hero.addEventListener('mouseenter',()=>{clearTimeout(timer);progress.classList.remove('running')});
    hero.addEventListener('mouseleave',schedule);
    hero.addEventListener('focusin',()=>{clearTimeout(timer);progress.classList.remove('running')});
    hero.addEventListener('focusout',schedule);
    hero.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();go(current+1,true)}else if(e.key==='ArrowLeft'){e.preventDefault();go(current-1,true)}});
    hero.addEventListener('touchstart',e=>{startX=e.changedTouches[0]?.clientX??null},{passive:true});
    hero.addEventListener('touchend',e=>{if(startX===null)return;const dx=(e.changedTouches[0]?.clientX??startX)-startX;startX=null;if(Math.abs(dx)>45)go(current+(dx<0?1:-1),true)},{passive:true});
    updateCount();schedule();
  }

  fetch('/api/hero-slides').then(r=>r.ok?r.json():[]).then(rows=>{
    if(!Array.isArray(rows)||!rows.length)return mount(defaults);
    const byNo=new Map(rows.map(x=>[Number(x.slideNo),x]));
    const merged=defaults.map(d=>{const x=byNo.get(d.slideNo)||{};return {...d,...x,imageUrl:x.imageUrl||d.imageUrl}});
    mount(merged);
  }).catch(()=>mount(defaults));
})();
