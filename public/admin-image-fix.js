(()=>{
  const save=document.getElementById('save');
  const item=document.getElementById('item');
  const input=document.getElementById('image');
  const status=document.getElementById('saveStatus');
  if(!save||!item||!input||!status)return;

  save.onclick=async()=>{
    const file=input.files[0];
    if(!file){status.textContent='Please choose a picture first.';return;}
    status.textContent='Updating menu picture…';
    try{
      const listRes=await fetch('/api/admin/menu-items');
      const items=listRes.ok?await listRes.json():[];
      const current=Array.isArray(items)?items.find(x=>x.name===item.value):null;
      if(!current){status.textContent='Menu item not found in the live menu editor.';return;}
      const fd=new FormData();
      fd.append('id',current.id);
      fd.append('name',current.name);
      fd.append('category',current.category||'Fast Food');
      fd.append('price',current.price||'');
      fd.append('description',current.description||'');
      fd.append('sortOrder',current.sortOrder||100);
      fd.append('visible',current.visible===false?'false':'true');
      fd.append('image',file);
      const r=await fetch('/api/admin/menu-item',{method:'POST',body:fd});
      const j=await r.json().catch(()=>({}));
      if(!r.ok){status.textContent=j.error||'Could not update picture.';return;}
      status.textContent='Picture updated successfully. Refresh the website to see it.';
      const preview=document.getElementById('preview');
      if(preview){preview.src=URL.createObjectURL(file);preview.style.display='block';}
    }catch(e){status.textContent='Could not update picture. Please try again.';}
  };
})();
