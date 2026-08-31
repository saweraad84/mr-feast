(()=>{
const esc=v=>String(v??'').replace(/[&<>'\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[c]));
let liveMenu=[];
let current='All';
function renderMenu(){const grid=document.getElementById('menuGrid');if(!grid||!liveMenu.length)return;const rows=current==='All'?liveMenu:liveMenu.filter(x=>x.category===current);grid.innerHTML=rows.map(x=>`<article class="food"><img src="${esc(x.imageUrl||'')}" alt="${esc(x.name)}" loading="lazy"><div class="body"><div class="tag">${esc(x.category)}</div><h3>${esc(x.name)}</h3><p>${esc(x.description)}</p><div class="price">${esc(x.price)}</div></div></article>`).join('');}
fetch('/api/menu-items').then(r=>r.ok?r.json():[]).then(rows=>{if(Array.isArray(rows)&&rows.length){liveMenu=rows;renderMenu();document.querySelectorAll('.filters button').forEach(b=>b.addEventListener('click',()=>{current=b.dataset.filter||'All';setTimeout(renderMenu,0)}));}}).catch(()=>{});
fetch('/api/deals').then(r=>r.ok?r.json():[]).then(rows=>{const grid=document.querySelector('#deals .dealgrid');if(!grid||!Array.isArray(rows)||!rows.length)return;
  grid.style.display='grid';
  grid.style.width='100%';
  grid.style.gridTemplateColumns=`repeat(${Math.min(rows.length,4)},minmax(0,1fr))`;
  grid.style.gap='18px';
  grid.style.alignItems='stretch';
  grid.innerHTML=rows.map((x,i)=>`<article class="${x.featured?'featured':''}" style="overflow:hidden;padding:0;position:relative;display:flex;flex-direction:column;min-width:0;width:100%;background:#080808;border:1px solid #a57d25;border-radius:12px;box-shadow:0 14px 30px rgba(0,0,0,.16)">${x.featured?'<span style="position:absolute;right:12px;top:12px;z-index:2;background:#c9a45c;color:#1a1112;padding:6px 9px;border-radius:999px;font-size:9px;font-weight:900">BEST VALUE</span>':''}<img src="${esc(x.imageUrl||'')}" alt="${esc(x.name)}" loading="lazy" style="width:100%;height:190px;object-fit:cover"><div style="padding:22px;display:flex;flex:1;flex-direction:column;background:linear-gradient(180deg,#0a0a0a 0%,#111 100%)"><span style="display:inline-block;align-self:flex-start;background:transparent;border:1px solid #a57d25;color:#e5c36b;border-radius:999px;padding:6px 9px;font-size:9px;font-weight:800">${esc(x.badge||('DEAL '+String(i+1).padStart(2,'0')))}</span><h3 style="color:#fff;margin-top:18px">${esc(x.name)}</h3><p style="color:#d0c7bd">${esc(x.items)}</p><b style="font-size:21px;margin-top:auto;padding-top:8px;color:#d8ad49">${esc(x.price)}</b><a href="#order" style="display:block;margin-top:16px;text-align:center;background:#6b1f29;color:white;padding:11px;border-radius:4px;font-weight:800;font-size:11px">Order Deal</a></div></article>`).join('');
  const style=document.createElement('style');
  style.textContent='@media(max-width:900px){#deals .dealgrid{grid-template-columns:repeat(2,minmax(0,1fr))!important}}@media(max-width:560px){#deals .dealgrid{grid-template-columns:1fr!important}}';
  document.head.appendChild(style);
}).catch(()=>{});
})();
