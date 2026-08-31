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
    .hero-live-content{position:absolute;z-index:6;left:8vw;top:50%;transform:translateY(-50%);max-width:790px;padding-right:24px}
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
    .hero-live-nav{position:absolute;z-index:9;top:50%;transform:translateY(-50%);width:48px;height:48px;border-radius:50%;border:1px solid rgba(229,202,140,.75);background:rgba(25,7,12,.45);color:#f9ecd3;font-size:27px;display:grid;place-items:center;cursor:pointer;backdrop-filter:blur(6px);transition:.2s}
    .hero-live-nav:hover{background:#63212d;border-color:#efd895}
    .hero-live-prev{left:22px}.hero-live-next{right:22px}
    .hero-live-dots{position:absolute;z-index:9;left:8vw;bottom:30px;display:flex;align-items:center;gap:9px}
    .hero-live-dot{width:10px;height:10px;border:0;border-radius:50%;padding:0;background:rgba(255,255,255,.47);cursor:pointer;transition:.25s}
    .hero-live-dot.active{background:#d7b86c;transform:scale(1.35)}
    .hero-live-count{position:absolute;z-index:9;right:8vw;bottom:26px;color:#eadfc8;font-size:11px;letter-spacing:2px;font-weight:900}
    .hero-live-progress{position:absolute;z-index:9;left:0;bottom:0;width:100%;height:3px;background:rgba(255,255,255,.15)}
    .hero-live-progress span{display:block;height:100%;width:0;background:#c9a45c}
    .hero-live-progress.running span{animation:heroProgress 5.2s linear forwards}

    /* Fire flame template */
    .hero-fire{position:absolute;inset:0;z-index:5;pointer-events:none;overflow:hidden;mix-blend-mode:screen}
    .hero-fire:before{content:"";position:absolute;left:-8%;right:-8%;bottom:-12%;height:44%;background:
      radial-gradient(ellipse at 8% 100%,rgba(255,210,72,.95) 0 8%,rgba(255,112,0,.92) 9% 18%,rgba(145,0,0,.55) 19% 28%,transparent 29%),
      radial-gradient(ellipse at 22% 100%,rgba(255,230,120,.95) 0 7%,rgba(255,120,0,.93) 8% 17%,rgba(162,8,0,.55) 18% 29%,transparent 30%),
      radial-gradient(ellipse at 38% 100%,rgba(255,214,80,.95) 0 8%,rgba(255,96,0,.92) 9% 19%,rgba(160,0,0,.54) 20% 31%,transparent 32%),
      radial-gradient(ellipse at 55% 100%,rgba(255,228,118,.95) 0 7%,rgba(255,122,0,.93) 8% 18%,rgba(169,7,0,.54) 19% 30%,transparent 31%),
      radial-gradient(ellipse at 72% 100%,rgba(255,218,92,.95) 0 8%,rgba(255,104,0,.92) 9% 18%,rgba(154,0,0,.54) 19% 29%,transparent 30%),
      radial-gradient(ellipse at 88% 100%,rgba(255,232,135,.95) 0 7%,rgba(255,120,0,.93) 8% 18%,rgba(155,4,0,.54) 19% 29%,transparent 30%);
      filter:blur(5px) saturate(1.35);transform-origin:center bottom;animation:fireWave 2.4s ease-in-out infinite alternate;opacity:.88}
    .hero-fire:after{content:"";position:absolute;inset:0;background:
      radial-gradient(circle at 12% 78%,rgba(255,170,40,.85) 0 2px,transparent 3px),
      radial-gradient(circle at 25% 68%,rgba(255,110,0,.9) 0 2px,transparent 3px),
      radial-gradient(circle at 39% 73%,rgba(255,220,100,.9) 0 1.5px,transparent 2.5px),
      radial-gradient(circle at 58% 66%,rgba(255,130,0,.88) 0 2px,transparent 3px),
      radial-gradient(circle at 74% 72%,rgba(255,215,90,.9) 0 1.5px,transparent 2.5px),
      radial-gradient(circle at 89% 64%,rgba(255,100,0,.9) 0 2px,transparent 3px);
      background-size:180px 180px,220px 220px,170px 170px,210px 210px,190px 190px,230px 230px;
      animation:sparksRise 4.8s linear infinite;opacity:.65}
    .hero-fire-glow{position:absolute;left:0;right:0;bottom:0;height:34%;z-index:4;pointer-events:none;background:linear-gradient(0deg,rgba(255,76,0,.24),rgba(255,128,0,.09) 48%,transparent);filter:blur(8px)}
    @keyframes fireWave{0%{transform:translateY(7px) scaleY(.9) scaleX(1.02)}50%{transform:translateY(-5px) scaleY(1.08) scaleX(.98)}100%{transform:translateY(2px) scaleY(.96) scaleX(1.04)}}
    @keyframes sparksRise{from{background-position:0 120px,0 180px,0 140px,0 200px,0 160px,0 190px}to{background-position:10px -140px,-12px -110px,8px -150px,-9px -120px,13px -135px,-7px -125px}}

    @keyframes heroProgress{from{width:0}to{width:100%}}
    @media(prefers-reduced-motion:reduce){.hero-live-slide{transition:none;transform:none}.hero-live-progress{display:none}.hero-fire:before,.hero-fire:after{animation:none}}
    @media(max-width:760px){.hero-live-content{left:7vw;right:7vw;padding:0}.hero-live-title{letter-spacing:-2px;font-size:clamp(44px,13vw,68px)}.hero-live-subtitle{font-size:15px}.hero-live-prev{left:10px}.hero-live-next{right:10px}.hero-live-nav{width:42px;height:42px}.hero-live-dots{left:7vw;bottom:22px}.hero-live-count{right:7vw;bottom:20px}.hero-live-actions a{min-height:44px;padding:0 16px}.hero-fire:before{height:34%;bottom:-10%;opacity:.7}.hero-fire-glow{height:28%}}
  `;
  document.head.appendChild(style);

  const esc=v=>String(v??'').replace(/[&<>'\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[c]));
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
    hero.innerHTML=`<div class="hero-live-track">${slides.map((x,i)=>`<section class="hero-live-slide${i===0?' active':''}" aria-hidden="${i===0?'false':'true'}"><img src="${esc(x.imageUrl||defaults[(x.slideNo||1)-1].imageUrl)}" alt="${esc(x.title||'Restaurant food')}"><div class="hero-live-content"><div class="hero-live-kicker">${esc(x.kicker||'')}</div><h1 class="hero-live-title">${highlightTitle(x.title||'')}</h1><p class="hero-live-subtitle">${esc(x.subtitle||'')}</p><div class="hero-live-actions"><a class="hero-live-primary" href="${esc(safeLink(x.primaryButtonLink))}">${esc(x.primaryButtonText||'Explore Menu')} ↗</a><a class="hero-live-secondary" href="${esc(safeLink(x.secondaryButtonLink))}">${esc(x.secondaryButtonText||'Order Now')}</a></div></div></section>`).join('')}</div><div class="hero-fire-glow"></div><div class="hero-fire"></div><button class="hero-live-nav hero-live-prev" type="button" aria-label="Previous hero slide">‹</button><button class="hero-live-nav hero-live-next" type="button" aria-label="Next hero slide">›</button><div class="hero-live-dots" aria-label="Hero slide navigation"></div><div class="hero-live-count" aria-live="polite"></div><div class="hero-live-progress"><span></span></div>`;

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
