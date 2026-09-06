(()=>{
  const ADDRESS='R3VF+9WG, Street Number 3, Akhtar Colony Azam Town, Karachi, Pakistan';
  const DISPLAY='Street No. 03, Sector-E, Akhtar Colony, Karachi';

  // Keep every ordering CTA on the same cart/checkout flow.
  document.querySelectorAll('a[href="#order"]').forEach(a=>{
    a.setAttribute('href','#menu');
    if(/whatsapp/i.test(a.textContent||'')) a.textContent='Order Online';
    a.addEventListener('click',e=>{
      e.preventDefault();
      if(window.MehfilOrder) window.MehfilOrder.open();
      else document.getElementById('menu')?.scrollIntoView({behavior:'smooth'});
    });
  });
  document.querySelectorAll('a,button').forEach(el=>{
    if(/^\s*Order Now\s*$/i.test(el.textContent||'')){
      el.addEventListener('click',e=>{
        e.preventDefault();
        if(window.MehfilOrder) window.MehfilOrder.open();
        else document.getElementById('menu')?.scrollIntoView({behavior:'smooth'});
      });
    }
  });

  // Remove obsolete WhatsApp ordering block now that checkout feeds the Kitchen Dashboard.
  const oldOrder=document.getElementById('order');
  if(oldOrder) oldOrder.remove();

  // Remove unverified sample testimonials instead of presenting them as customer reviews.
  const reviews=document.querySelector('.reviews');
  if(reviews) reviews.remove();

  // Remove the non-functional chat mockup so it does not compete with the real cart.
  document.getElementById('chatBtn')?.remove();
  document.getElementById('chat')?.remove();

  // Real menu prices are managed in Admin; no “sample pricing” label.
  const menu=document.getElementById('menu');
  if(menu){
    const headNote=menu.querySelector('.head>p');
    if(headNote) headNote.textContent='Prices in PKR';
  }

  // Replace generic copy that described the template rather than the restaurant.
  document.querySelectorAll('.clips p').forEach(p=>{
    if(/premium restaurant feel|hero video|food clips/i.test(p.textContent||'')){
      p.textContent='Freshly prepared food, smoky grills and the flavours of Mehfil-e-Zaika in motion.';
    }
  });
  const galleryNote=document.querySelector('#gallery .head>p');
  if(galleryNote) galleryNote.textContent='BBQ · Fast Food · Sweets · Desserts';

  // Basic production SEO and local business structured data.
  document.title='Mehfil-e-Zaika Karachi | BBQ, Fast Food, Sweets & Desserts';
  const meta=document.querySelector('meta[name="description"]');
  if(meta) meta.setAttribute('content','Mehfil-e-Zaika in Akhtar Colony, Karachi. Order BBQ, burgers, pizza, shawarma, sweets and desserts online for takeaway or delivery.');
  if(!document.getElementById('restaurantSchema')){
    const s=document.createElement('script');
    s.id='restaurantSchema';s.type='application/ld+json';
    s.textContent=JSON.stringify({
      '@context':'https://schema.org','@type':'Restaurant',name:'Mehfil-e-Zaika',
      address:{'@type':'PostalAddress',streetAddress:'Street Number 3, Sector-E, Akhtar Colony Azam Town',addressLocality:'Karachi',addressCountry:'PK'},
      hasMap:'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(ADDRESS),
      servesCuisine:['Pakistani','BBQ','Fast Food','Desserts'],
      openingHoursSpecification:[
        {'@type':'OpeningHoursSpecification',dayOfWeek':['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],opens:'12:00',closes:'01:00'},
        {'@type':'OpeningHoursSpecification',dayOfWeek':['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],opens:'18:00',closes:'03:00'}
      ]
    });document.head.appendChild(s);
  }

  // Graceful image fallback: never leave broken-image icons on the live menu/gallery.
  document.addEventListener('error',e=>{
    const img=e.target;
    if(img&&img.tagName==='IMG'&&!img.dataset.fallback){
      img.dataset.fallback='1';
      img.src='data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="100%" height="100%" fill="#160f10"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#d6b66c" font-family="Arial" font-size="34">Mehfil-e-Zaika</text></svg>`);
    }
  },true);

  // Reduce unnecessary network work while keeping the visual experience.
  document.querySelectorAll('video').forEach(v=>{v.preload='metadata'});

  // Make location details available to other scripts without duplicating placeholders.
  window.MehfilBusiness={address:ADDRESS,displayAddress:DISPLAY};
})();
