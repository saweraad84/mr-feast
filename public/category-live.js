(()=>{
  const row=document.querySelector('.catrow');
  if(!row)return;
  const cards=[...row.querySelectorAll(':scope > a')];
  const keyByIndex=['fastfood','bbq','sweets'];
  fetch('/api/category-images').then(r=>r.ok?r.json():[]).then(items=>{
    if(!Array.isArray(items))return;
    const map=new Map(items.map(x=>[x.key,x]));
    cards.forEach((card,i)=>{
      const img=card.querySelector('img');
      const item=map.get(keyByIndex[i]);
      if(img&&item?.imageUrl){img.src=item.imageUrl;img.removeAttribute('srcset');}
    });
  }).catch(()=>{});
})();
