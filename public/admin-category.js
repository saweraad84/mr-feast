(()=>{
  const manager=document.getElementById('manager');if(!manager)return;
  const card=document.createElement('div');
  card.className='card';card.id='categoryImageAdmin';card.style.display='none';
  card.innerHTML=`<h2>Homepage Category Pictures</h2><p class="muted">Change the three pictures shown above the menu: Fast Food, BBQ, and Sweets & Desserts.</p><div class="row" style="grid-template-columns:repeat(3,1fr)">
    ${[['fastfood','Fast Food'],['bbq','BBQ'],['sweets','Sweets & Desserts']].map(([k,l])=>`<div style="border:1px solid #d9bd7a;border-radius:14px;padding:14px;background:rgba(255,250,240,.05)"><b>${l}</b><img id="catPrev-${k}" style="width:100%;height:145px;object-fit:cover;border-radius:10px;margin:12px 0;display:block" alt="${l}"><input id="catFile-${k}" type="file" accept="image/*"><button class="catSave" data-key="${k}" style="margin-top:10px">Save Picture</button><button class="catReset danger" data-key="${k}" style="margin-top:8px">Reset Original</button><div id="catStatus-${k}" class="status"></div></div>`).join('')}
  </div>`;
  manager.after(card);

  const load=()=>fetch('/api/admin/category-images').then(r=>r.ok?r.json():[]).then(rows=>{rows.forEach(x=>{const p=document.getElementById('catPrev-'+x.key);if(p)p.src=x.imageUrl;});});
  card.querySelectorAll('.catSave').forEach(btn=>btn.onclick=async()=>{
    const key=btn.dataset.key,input=document.getElementById('catFile-'+key),status=document.getElementById('catStatus-'+key);
    if(!input.files[0]){status.textContent='Choose an image first.';return;}
    const fd=new FormData();fd.append('image',input.files[0]);status.textContent='Saving…';
    const r=await fetch('/api/admin/category-image/'+key,{method:'POST',body:fd});const j=await r.json().catch(()=>({}));
    status.textContent=r.ok?'Picture updated.':'Error: '+(j.error||'Could not save');
    if(r.ok){input.value='';await load();}
  });
  card.querySelectorAll('.catReset').forEach(btn=>btn.onclick=async()=>{
    const key=btn.dataset.key,status=document.getElementById('catStatus-'+key);
    if(!confirm('Reset this category picture to the original?'))return;
    status.textContent='Resetting…';const r=await fetch('/api/admin/category-image/'+key,{method:'DELETE'});const j=await r.json().catch(()=>({}));
    status.textContent=r.ok?'Original picture restored.':'Error: '+(j.error||'Could not reset');if(r.ok)await load();
  });
  function sync(){const on=manager.style.display!=='none';card.style.display=on?'block':'none';if(on&&!card.dataset.loaded){card.dataset.loaded='1';load()}if(!on)card.dataset.loaded=''}
  setInterval(sync,400);sync();
})();
