const items=['Classic Burger','Zinger Burger','Chicken Pizza','Chicken Shawarma','Fries','Club Sandwich','Chicken Tikka','Malai Boti','Seekh Kebab','Chicken Wings','BBQ Platters','Gulab Jamun','Rasmalai','Kheer','Brownies','Ice Cream','Chocolate Lava Cake','Cheesecake','Waffles','Sundaes'];
const item=document.getElementById('item');items.forEach(x=>item.add(new Option(x,x)));
const loginCard=document.getElementById('loginCard'),manager=document.getElementById('manager'),logout=document.getElementById('logout');

const adminStyle=document.createElement('style');
adminStyle.textContent=`
  .slider-manager{display:none}
  .slider-head{display:flex;justify-content:space-between;gap:20px;align-items:end;margin-bottom:18px}
  .slidegrid{display:grid;grid-template-columns:1fr 1fr;gap:18px}
  .slidecard{background:#fff;border:1px solid #e4dac6;border-radius:16px;padding:18px}
  .slidecard h3{margin:0 0 14px;color:#0b5b59}
  .slidecard textarea{width:100%;min-height:76px;padding:12px;border-radius:10px;border:1px solid #d8cdb7;font:inherit;resize:vertical;box-sizing:border-box}
  .slidecard input[type=text],.slidecard input[type=number],.slidecard input[type=file]{box-sizing:border-box}
  .slidecard .preview{display:block;width:100%;height:190px;object-fit:cover;background:#eee}
  .slide-options{display:grid;grid-template-columns:1fr 110px;gap:12px}
  .checkline{display:flex;align-items:center;gap:8px;font-weight:700;margin:12px 0}.checkline input{width:auto}
  .slide-actions{display:flex;gap:8px;margin-top:12px}.slide-actions button{width:auto;flex:1}
  .secondary{background:#6d7975}
  .tiny{font-size:12px;color:#6d7975}
  @media(max-width:760px){.slidegrid{grid-template-columns:1fr}.slider-head{align-items:flex-start;flex-direction:column}.slide-options{grid-template-columns:1fr}}
`;
document.head.appendChild(adminStyle);

const sliderManager=document.createElement('div');
sliderManager.id='sliderManager';
sliderManager.className='card slider-manager';
sliderManager.innerHTML=`<div class="slider-head"><div><h2 style="margin-bottom:6px">Website Content → BBQ Slider</h2><div class="muted">Edit all 4 BBQ slides. Image, title, caption, button, order and visibility are saved separately.</div></div><a href="/#bbq" target="_blank" style="color:#0b5b59;font-weight:800">Open slider ↗</a></div><div id="slideGrid" class="slidegrid"></div>`;
manager.after(sliderManager);

const defaults=[
  {slideNo:1,title:'BBQ Platter',caption:'A shareable smoky BBQ spread, freshly grilled for the whole table.',buttonText:'Explore BBQ',buttonLink:'#menu',visible:true,sortOrder:1,imageUrl:'https://commons.wikimedia.org/wiki/Special:Redirect/file/Tandoori_platter.jpg'},
  {slideNo:2,title:'Chicken Tikka',caption:'Charcoal-grilled chicken tikka with bold desi spice and smoky flavor.',buttonText:'Explore BBQ',buttonLink:'#menu',visible:true,sortOrder:2,imageUrl:'https://commons.wikimedia.org/wiki/Special:Redirect/file/Chicken_Tikka.jpg'},
  {slideNo:3,title:'Malai Boti',caption:'Creamy, tender malai boti grilled until golden over hot charcoal.',buttonText:'Explore BBQ',buttonLink:'#menu',visible:true,sortOrder:3,imageUrl:'https://commons.wikimedia.org/wiki/Special:Redirect/file/Malai_Boti.JPG'},
  {slideNo:4,title:'Seekh Kebab',caption:'Juicy seekh kebabs with classic spices and a fire-kissed finish.',buttonText:'Explore BBQ',buttonLink:'#menu',visible:true,sortOrder:4,imageUrl:'https://commons.wikimedia.org/wiki/Special:Redirect/file/Seekh_Kebabs.jpg'}
];
let slides=defaults.map(x=>({...x}));

fetch('/api/site-config').then(r=>r.json()).then(x=>{const name=x.siteName||'Restaurant';document.getElementById('brand').textContent=name.toUpperCase()+' ADMIN';document.title=name+' Admin';}).catch(()=>{});
function showAdmin(ok){loginCard.style.display=ok?'none':'block';manager.style.display=ok?'block':'none';sliderManager.style.display=ok?'block':'none';logout.style.display=ok?'block':'none';if(ok)loadSlides()}
fetch('/api/admin/status').then(r=>r.json()).then(x=>showAdmin(x.authenticated));
document.getElementById('login').onclick=async()=>{const r=await fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:document.getElementById('password').value})});const j=await r.json();if(r.ok){showAdmin(true);document.getElementById('loginStatus').textContent=''}else document.getElementById('loginStatus').textContent=j.error||'Login failed'};
logout.onclick=async()=>{await fetch('/api/admin/logout',{method:'POST'});showAdmin(false)};

const input=document.getElementById('image'),preview=document.getElementById('preview');input.onchange=()=>{const f=input.files[0];if(!f)return;preview.src=URL.createObjectURL(f);preview.style.display='block'};
document.getElementById('save').onclick=async()=>{const f=input.files[0],status=document.getElementById('saveStatus');if(!f){status.textContent='Please choose a picture first.';return}const fd=new FormData();fd.append('item',item.value);fd.append('image',f);status.textContent='Uploading…';const r=await fetch('/api/admin/image',{method:'POST',body:fd});const j=await r.json();status.textContent=r.ok?'Picture updated successfully. Refresh the website to see it.':(j.error||'Upload failed')};
document.getElementById('reset').onclick=async()=>{const status=document.getElementById('saveStatus');const r=await fetch('/api/admin/image/'+encodeURIComponent(item.value),{method:'DELETE'});status.textContent=r.ok?'Original picture restored.':'Could not reset picture.'};

function esc(v){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function renderSlides(){
  const grid=document.getElementById('slideGrid');
  grid.innerHTML=slides.map(s=>`<section class="slidecard" data-slide="${s.slideNo}">
    <h3>Slide ${s.slideNo}</h3>
    <img class="preview s-preview" src="${esc(s.imageUrl||defaults[s.slideNo-1].imageUrl)}" alt="Slide ${s.slideNo} preview">
    <label>New image <span class="tiny">(optional · max 5MB)</span></label><input class="s-image" type="file" accept="image/*">
    <label style="margin-top:12px">Slide title</label><input class="s-title" type="text" value="${esc(s.title)}" maxlength="120">
    <label style="margin-top:12px">Short text / caption</label><textarea class="s-caption" maxlength="240">${esc(s.caption)}</textarea>
    <div class="slide-options"><div><label>Button text</label><input class="s-button-text" type="text" value="${esc(s.buttonText)}" maxlength="80"></div><div><label>Order</label><input class="s-order" type="number" min="1" max="4" value="${s.sortOrder||s.slideNo}"></div></div>
    <label style="margin-top:12px">Button link</label><input class="s-button-link" type="text" value="${esc(s.buttonLink||'#menu')}" placeholder="#menu or https://...">
    <label class="checkline"><input class="s-visible" type="checkbox" ${s.visible!==false?'checked':''}> Show this slide on website</label>
    <div class="slide-actions"><button class="s-save">Save Slide ${s.slideNo}</button><button class="s-reset-img secondary">Use Original Image</button></div>
    <div class="status s-status"></div>
  </section>`).join('');

  grid.querySelectorAll('.slidecard').forEach(card=>{
    const n=Number(card.dataset.slide),imgInput=card.querySelector('.s-image'),preview=card.querySelector('.s-preview'),status=card.querySelector('.s-status');
    imgInput.onchange=()=>{const f=imgInput.files[0];if(f)preview.src=URL.createObjectURL(f)};
    card.querySelector('.s-save').onclick=async()=>{
      const fd=new FormData();
      fd.append('title',card.querySelector('.s-title').value);
      fd.append('caption',card.querySelector('.s-caption').value);
      fd.append('buttonText',card.querySelector('.s-button-text').value);
      fd.append('buttonLink',card.querySelector('.s-button-link').value);
      fd.append('sortOrder',card.querySelector('.s-order').value);
      fd.append('visible',card.querySelector('.s-visible').checked?'true':'false');
      if(imgInput.files[0])fd.append('image',imgInput.files[0]);
      status.textContent='Saving…';
      const r=await fetch('/api/admin/bbq-slide/'+n,{method:'POST',body:fd});
      const j=await r.json().catch(()=>({}));
      if(r.ok){status.textContent='Saved. Website slider is updated.';if(j.imageUrl)preview.src=j.imageUrl;await loadSlides(false)}else status.textContent=j.error||'Could not save slide.';
    };
    card.querySelector('.s-reset-img').onclick=async()=>{
      status.textContent='Restoring original image…';
      const r=await fetch('/api/admin/bbq-slide-image/'+n,{method:'DELETE'});
      if(r.ok){preview.src=defaults[n-1].imageUrl;imgInput.value='';status.textContent='Original image restored.'}else status.textContent='Could not restore original image.';
    };
  });
}

async function loadSlides(render=true){
  try{
    const r=await fetch('/api/bbq-slides');
    const rows=r.ok?await r.json():[];
    const map=new Map((Array.isArray(rows)?rows:[]).map(x=>[Number(x.slideNo),x]));
    slides=defaults.map(d=>{const x=map.get(d.slideNo)||{};return {...d,...x,imageUrl:x.imageUrl||d.imageUrl}});
  }catch(e){slides=defaults.map(x=>({...x}))}
  if(render)renderSlides();
}
