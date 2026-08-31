(()=>{
  const wrap=document.getElementById('contentAdmin');
  if(!wrap)return;
  const editors=wrap.querySelectorAll('.editor');
  if(editors.length<2)return;
  const deal=editors[1];
  deal.classList.add('deals-manager-panel');
  const style=document.createElement('style');
  style.textContent=`
    .deals-manager-panel{background:#0a0a0b!important;border:1px solid #4a3a20!important;color:#fff!important;box-shadow:0 18px 45px rgba(0,0,0,.22)}
    .deals-manager-panel h3{font:700 28px/1.1 'Playfair Display',serif;color:#fff;margin-bottom:18px}
    .deals-manager-panel label{color:#e6ded2;font-weight:700}
    .deals-manager-panel input,.deals-manager-panel textarea,.deals-manager-panel select{background:#111214!important;color:#fff!important;border:1px solid #383838!important}
    .deals-manager-panel input::placeholder,.deals-manager-panel textarea::placeholder{color:#777}
    .deals-manager-panel .listrow{background:#111214!important;border-color:#343434!important;color:#fff}
    .deals-manager-panel .listrow small{color:#c7bcae!important}
    .deals-manager-panel button{background:#70212b!important;color:#fff!important;border-color:#8c3843!important}
    .deals-manager-panel .danger2{background:#46151b!important}
    .deal-live-preview{grid-column:1/-1;background:#0a0a0b;border:1px solid #4a3a20;border-radius:16px;padding:18px;color:#fff;margin-top:4px}
    .deal-live-preview h3{font:700 25px/1.1 'Playfair Display',serif;margin:0 0 4px}.deal-live-preview p{color:#bfb6aa;margin-top:0}
    .deal-preview-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:16px}
    .deal-preview-card{overflow:hidden;border:1px solid #9b7423;border-radius:10px;background:#090909;display:flex;flex-direction:column;min-height:370px}
    .deal-preview-card img{width:100%;height:130px;object-fit:cover;display:block}.deal-preview-body{padding:15px;display:flex;flex-direction:column;flex:1}.deal-preview-badge{align-self:flex-start;border:1px solid #9b7423;border-radius:999px;color:#dfb64f;padding:5px 8px;font-size:9px;font-weight:900}.deal-preview-card h4{font:700 21px/1.1 'Playfair Display',serif;margin:14px 0 8px}.deal-preview-card p{font-size:12px;line-height:1.55;color:#c8beb2}.deal-preview-price{margin-top:auto;color:#d9ad45;font-weight:900;font-size:20px}.deal-preview-btn{margin-top:12px;background:#70212b;padding:10px;text-align:center;border-radius:4px;font-size:11px;font-weight:800}
    @media(max-width:900px){.deal-preview-grid{grid-template-columns:1fr 1fr}}@media(max-width:560px){.deal-preview-grid{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);
  const preview=document.createElement('section');
  preview.className='deal-live-preview';
  preview.innerHTML='<h3>Deals Section Management</h3><p>Manage deal cards and preview how they appear on the homepage.</p><div class="deal-preview-grid" id="dealPreviewGrid"></div>';
  wrap.querySelector('.content-grid')?.appendChild(preview);
  const esc=v=>String(v??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
  async function render(){
    const r=await fetch('/api/admin/deals');if(!r.ok)return;const rows=await r.json();
    const grid=document.getElementById('dealPreviewGrid');if(!grid)return;
    grid.innerHTML=rows.filter(x=>x.visible!==false).map((x,i)=>`<article class="deal-preview-card"><img src="${esc(x.imageUrl||'')}" alt="${esc(x.name)}"><div class="deal-preview-body"><span class="deal-preview-badge">${esc(x.badge||('DEAL '+String(i+1).padStart(2,'0')))}</span><h4>${esc(x.name)}</h4><p>${esc(x.items)}</p><div class="deal-preview-price">${esc(x.price)}</div><div class="deal-preview-btn">Order Deal</div></div></article>`).join('');
  }
  const save=document.getElementById('dSave'),delButtons=()=>document.querySelectorAll('.dDel');
  save?.addEventListener('click',()=>setTimeout(render,800));
  setInterval(()=>{if(wrap.style.display!=='none'){render();delButtons().forEach(b=>{if(!b.dataset.previewBound){b.dataset.previewBound='1';b.addEventListener('click',()=>setTimeout(render,600));}})}},2500);
  render();
})();
