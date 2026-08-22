(()=>{
  const slider=document.getElementById('bbqSlider');
  if(!slider)return;

  const original=[...slider.querySelectorAll('.bbqslide')].map((el,i)=>({
    slideNo:i+1,
    title:el.querySelector('.bbqcaption')?.textContent?.trim()||`BBQ Slide ${i+1}`,
    caption:'Smoky, freshly grilled BBQ made for the mehfil.',
    buttonText:'Explore BBQ',
    buttonLink:'#menu',
    visible:true,
    sortOrder:i+1,
    imageUrl:el.querySelector('img')?.src||''
  }));

  const style=document.createElement('style');
  style.textContent=`
    .bbqslidecopy{position:absolute;left:34px;bottom:34px;z-index:4;max-width:470px;background:rgba(20,7,10,.72);border:1px solid rgba(201,164,92,.45);backdrop-filter:blur(10px);padding:20px 22px;border-radius:10px;color:#f7ecd5}
    .bbqslidecopy h3{font:700 28px/1.05 'Playfair Display',serif;margin:0 0 8px;color:#fff}
    .bbqslidecopy p{margin:0 0 14px;color:#eadfca;font-size:13px;line-height:1.5}
    .bbqslidecopy a{display:inline-block;background:#c9a45c;color:#2e1217;padding:9px 13px;border-radius:999px;font-size:11px;font-weight:900}
    .bbqslidecopy .bbqcaption{position:static;display:inline-block;margin-bottom:8px;background:none;border:0;padding:0;backdrop-filter:none;color:#c9a45c;letter-spacing:1.5px;text-transform:uppercase;font-size:10px}
    @media(max-width:600px){.bbqslidecopy{left:18px;right:18px;bottom:18px;padding:16px}.bbqslidecopy h3{font-size:22px}.bbqdots{top:18px;right:18px;bottom:auto}}
  `;
  document.head.appendChild(style);

  function escapeHtml(v){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
  function safeLink(v){const s=String(v||'#menu').trim();return /^(#|\/|https?:\/\/)/i.test(s)?s:'#menu'}

  function mount(items){
    const visible=items.filter(x=>x.visible!==false).sort((a,b)=>(a.sortOrder||a.slideNo)-(b.sortOrder||b.slideNo));
    const slides=visible.length?visible:original;
    slider.innerHTML=slides.map((x,i)=>`<div class="bbqslide${i===0?' active':''}"><img src="${escapeHtml(x.imageUrl||original[(x.slideNo||1)-1]?.imageUrl||'')}" alt="${escapeHtml(x.title||'BBQ')}"><div class="bbqslidecopy"><span class="bbqcaption">${escapeHtml(x.title||'BBQ')}</span><h3>${escapeHtml(x.title||'BBQ')}</h3><p>${escapeHtml(x.caption||'')}</p><a href="${escapeHtml(safeLink(x.buttonLink))}">${escapeHtml(x.buttonText||'Explore BBQ')} →</a></div></div>`).join('')+
      `<button class="bbqnav bbqprev" type="button" aria-label="Previous BBQ image">‹</button><button class="bbqnav bbqnext" type="button" aria-label="Next BBQ image">›</button><div class="bbqdots" aria-label="BBQ image navigation"></div>`;

    const nodes=[...slider.querySelectorAll('.bbqslide')],dotsWrap=slider.querySelector('.bbqdots');
    let current=0,timer;
    nodes.forEach((_,n)=>{const d=document.createElement('button');d.type='button';d.className='bbqdot'+(n===0?' active':'');d.setAttribute('aria-label','Show BBQ image '+(n+1));d.addEventListener('click',()=>go(n));dotsWrap.appendChild(d)});
    const dots=[...dotsWrap.children];
    function go(n){
      if(nodes.length<2)return;
      nodes[current].classList.remove('active');dots[current].classList.remove('active');
      current=(n+nodes.length)%nodes.length;
      nodes[current].classList.add('active');dots[current].classList.add('active');restart();
    }
    function restart(){clearInterval(timer);if(nodes.length>1)timer=setInterval(()=>go(current+1),4200)}
    slider.querySelector('.bbqnext').addEventListener('click',()=>go(current+1));
    slider.querySelector('.bbqprev').addEventListener('click',()=>go(current-1));
    slider.addEventListener('mouseenter',()=>clearInterval(timer));
    slider.addEventListener('mouseleave',restart);
    restart();
  }

  fetch('/api/bbq-slides').then(r=>r.ok?r.json():[]).then(rows=>{
    if(!Array.isArray(rows)||!rows.length)return mount(original);
    const byNo=new Map(rows.map(x=>[Number(x.slideNo),x]));
    const merged=original.map(d=>Object.assign({},d,byNo.get(d.slideNo)||{}, {imageUrl:byNo.get(d.slideNo)?.imageUrl||d.imageUrl}));
    mount(merged);
  }).catch(()=>mount(original));
})();
