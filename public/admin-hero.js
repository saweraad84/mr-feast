(()=>{
  const manager=document.getElementById('manager');
  if(!manager)return;

  const style=document.createElement('style');
  style.textContent=`
    .hero-manager{display:none}.hero-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}.hero-card{background:#fff;border:1px solid #e4dac6;border-radius:16px;padding:18px}.hero-card h3{margin:0 0 14px;color:#7a2633}.hero-card textarea{width:100%;min-height:84px;padding:12px;border-radius:10px;border:1px solid #d8cdb7;font:inherit;resize:vertical;box-sizing:border-box}.hero-card input[type=text],.hero-card input[type=number],.hero-card input[type=file]{box-sizing:border-box}.hero-preview{display:block;width:100%;height:210px;object-fit:cover;border-radius:12px;background:#eee;margin-bottom:14px}.hero-row{display:grid;grid-template-columns:1fr 110px;gap:12px}.hero-actions{display:flex;gap:8px;margin-top:12px}.hero-actions button{width:auto;flex:1}.hero-note{font-size:12px;color:#6d7975}.hero-section-head{display:flex;align-items:end;justify-content:space-between;gap:20px;margin-bottom:18px}.hero-section-head a{color:#7a2633;font-weight:800}@media(max-width:760px){.hero-grid{grid-template-columns:1fr}.hero-row{grid-template-columns:1fr}.hero-section-head{align-items:flex-start;flex-direction:column}}
  `;
  document.head.appendChild(style);

  const heroManager=document.createElement('div');
  heroManager.id='heroManager';
  heroManager.className='card hero-manager';
  heroManager.innerHTML=`<div class="hero-section-head"><div><h2 style="margin-bottom:6px">Website Content → Hero Slider</h2><div class="muted">Edit 4 hero slides. They auto-change on the website, and customers can also use arrows, dots, keyboard arrows or swipe.</div></div><a href="/#top" target="_blank">Open Hero ↗</a></div><div id="heroGrid" class="hero-grid"></div>`;
  const bbqManager=document.getElementById('sliderManager');
  (bbqManager||manager).after(heroManager);

  const defaults=[
    {slideNo:1,kicker:'MEHFIL-E-ZAIKA · PAKISTANI FLAVOURS',title:'Jahan Khana Bhi, Mehfil Bhi.',subtitle:'Smoky BBQ, juicy burgers, Chicken Pizza, shawarma, sweets and desserts — made for every table.',primaryButtonText:'Explore Menu',primaryButtonLink:'#menu',secondaryButtonText:'Order Now',secondaryButtonLink:'#order',visible:true,sortOrder:1,imageUrl:'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=85'},
    {slideNo:2,kicker:'REAL CHARCOAL BBQ',title:'Angaar. Dhuan. Zaika.',subtitle:'Chicken Tikka, Malai Boti, Seekh Kebab and BBQ Platters grilled hot over charcoal.',primaryButtonText:'Explore BBQ',primaryButtonLink:'#bbq',secondaryButtonText:'See Deals',secondaryButtonLink:'#deals',visible:true,sortOrder:2,imageUrl:'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=85'},
    {slideNo:3,kicker:'BURGERS · PIZZA · SHAWARMA',title:'Fast Food, Full Mood.',subtitle:'Crispy burgers, cheesy Chicken Pizza, shawarma and loaded fries for every craving.',primaryButtonText:'View Fast Food',primaryButtonLink:'#menu',secondaryButtonText:'Order Now',secondaryButtonLink:'#order',visible:true,sortOrder:3,imageUrl:'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=85'},
    {slideNo:4,kicker:'SWEETS · DESSERTS',title:'Meetha Ho Jaye.',subtitle:'Gulab Jamun, Rasmalai, cheesecake, waffles and chocolate desserts to finish the mehfil.',primaryButtonText:'See Desserts',primaryButtonLink:'#menu',secondaryButtonText:'Special Deals',secondaryButtonLink:'#deals',visible:true,sortOrder:4,imageUrl:'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=1200&q=85'}
  ];
  let slides=defaults.map(x=>({...x}));
  const esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

  function render(){
    const grid=document.getElementById('heroGrid');
    grid.innerHTML=slides.map(s=>`<section class="hero-card" data-slide="${s.slideNo}"><h3>Hero Slide ${s.slideNo}</h3><img class="hero-preview h-preview" src="${esc(s.imageUrl||defaults[s.slideNo-1].imageUrl)}" alt="Hero slide ${s.slideNo} preview"><label>New image <span class="hero-note">(optional · max 5MB)</span></label><input class="h-image" type="file" accept="image/*"><label style="margin-top:12px">Small heading / kicker</label><input class="h-kicker" type="text" value="${esc(s.kicker)}" maxlength="120"><label style="margin-top:12px">Main hero title</label><input class="h-title" type="text" value="${esc(s.title)}" maxlength="140"><label style="margin-top:12px">Description</label><textarea class="h-subtitle" maxlength="300">${esc(s.subtitle)}</textarea><div class="hero-row"><div><label>Primary button text</label><input class="h-ptext" type="text" value="${esc(s.primaryButtonText)}" maxlength="80"></div><div><label>Order</label><input class="h-order" type="number" min="1" max="4" value="${s.sortOrder||s.slideNo}"></div></div><label style="margin-top:12px">Primary button link</label><input class="h-plink" type="text" value="${esc(s.primaryButtonLink||'#menu')}" placeholder="#menu"><label style="margin-top:12px">Secondary button text</label><input class="h-stext" type="text" value="${esc(s.secondaryButtonText)}" maxlength="80"><label style="margin-top:12px">Secondary button link</label><input class="h-slink" type="text" value="${esc(s.secondaryButtonLink||'#order')}" placeholder="#order"><label class="checkline"><input class="h-visible" type="checkbox" ${s.visible!==false?'checked':''}> Show this slide on website</label><div class="hero-actions"><button class="h-save">Save Hero Slide ${s.slideNo}</button><button class="h-reset secondary">Use Original Image</button></div><div class="status h-status"></div></section>`).join('');

    grid.querySelectorAll('.hero-card').forEach(card=>{
      const n=Number(card.dataset.slide),file=card.querySelector('.h-image'),preview=card.querySelector('.h-preview'),status=card.querySelector('.h-status');
      file.onchange=()=>{if(file.files[0])preview.src=URL.createObjectURL(file.files[0])};
      card.querySelector('.h-save').onclick=async()=>{
        const fd=new FormData();
        fd.append('kicker',card.querySelector('.h-kicker').value);fd.append('title',card.querySelector('.h-title').value);fd.append('subtitle',card.querySelector('.h-subtitle').value);fd.append('primaryButtonText',card.querySelector('.h-ptext').value);fd.append('primaryButtonLink',card.querySelector('.h-plink').value);fd.append('secondaryButtonText',card.querySelector('.h-stext').value);fd.append('secondaryButtonLink',card.querySelector('.h-slink').value);fd.append('sortOrder',card.querySelector('.h-order').value);fd.append('visible',card.querySelector('.h-visible').checked?'true':'false');if(file.files[0])fd.append('image',file.files[0]);
        status.textContent='Saving…';
        const r=await fetch('/api/admin/hero-slide/'+n,{method:'POST',body:fd});const j=await r.json().catch(()=>({}));
        if(r.ok){status.textContent='Saved. Hero slider is updated.';if(j.imageUrl)preview.src=j.imageUrl;load(false)}else status.textContent=j.error||'Could not save hero slide.';
      };
      card.querySelector('.h-reset').onclick=async()=>{
        status.textContent='Restoring original image…';const r=await fetch('/api/admin/hero-slide-image/'+n,{method:'DELETE'});if(r.ok){preview.src=defaults[n-1].imageUrl;file.value='';status.textContent='Original image restored.'}else status.textContent='Could not restore original image.';
      };
    });
  }

  async function load(doRender=true){
    try{const r=await fetch('/api/hero-slides');const rows=r.ok?await r.json():[];const map=new Map((Array.isArray(rows)?rows:[]).map(x=>[Number(x.slideNo),x]));slides=defaults.map(d=>{const x=map.get(d.slideNo)||{};return {...d,...x,imageUrl:x.imageUrl||d.imageUrl}})}catch(e){slides=defaults.map(x=>({...x}))}if(doRender)render();
  }

  function syncVisibility(){const visible=manager.style.display!=='none';heroManager.style.display=visible?'block':'none';if(visible&&!heroManager.dataset.loaded){heroManager.dataset.loaded='1';load()}}
  new MutationObserver(syncVisibility).observe(manager,{attributes:true,attributeFilter:['style']});
  fetch('/api/admin/status').then(r=>r.json()).then(x=>{heroManager.style.display=x.authenticated?'block':'none';if(x.authenticated){heroManager.dataset.loaded='1';load()}}).catch(()=>{});
})();
