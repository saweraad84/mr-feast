(()=>{
  const contact=document.getElementById('contact');
  if(!contact)return;
  const card=contact.querySelector('.contactcard');
  if(!card)return;

  const address='R3VF+9WG, Street Number 3, Akhtar Colony Azam Town, Karachi, Pakistan';
  const displayAddress='Street No. 03, Sector-E, Akhtar Colony, Karachi';
  const mapsLink='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(address);
  const embedLink='https://www.google.com/maps?q='+encodeURIComponent(address)+'&output=embed';

  card.innerHTML=`
    <div><span aria-hidden="true">📍</span><b>Location</b><p>${displayAddress}<br><small>${address}</small></p></div>
    <div><span aria-hidden="true">🕐</span><b>Opening Hours</b><p>Fast Food: 12 PM – 1 AM<br>BBQ: 6 PM – 3 AM</p></div>
    <div><span aria-hidden="true">💬</span><b>WhatsApp</b><p>Add your restaurant WhatsApp number</p></div>
    <div class="contact-map-wrap">
      <iframe title="Mehfil-e-Zaika location map" src="${embedLink}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>
    </div>
    <a class="map" href="${mapsLink}" target="_blank" rel="noopener">Get Directions →</a>`;

  const style=document.createElement('style');
  style.textContent=`
    .contact-map-wrap{grid-column:1/-1;overflow:hidden;border-radius:8px;border:1px solid #dfcfaf;background:#f7ecd5}
    .contact-map-wrap iframe{width:100%;height:300px;border:0;display:block}
    .contactcard small{color:#9a897c;font-size:11px}
    @media(max-width:600px){.contact-map-wrap iframe{height:240px}}
  `;
  document.head.appendChild(style);
})();
