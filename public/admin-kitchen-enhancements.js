(()=>{
  let previousNew=new Set(),initialized=false;
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money=n=>'Rs. '+Number(n||0).toLocaleString('en-PK');
  function beep(){try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const c=new C(),o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.frequency.value=740;g.gain.setValueAtTime(.07,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.35);o.start();o.stop(c.currentTime+.36)}catch(e){}}
  async function enhance(){
    const dash=document.getElementById('kitchenDashboard');if(!dash||dash.style.display==='none')return;
    try{
      const r=await fetch('/api/admin/kitchen-orders');if(!r.ok)return;const rows=await r.json();
      const currentNew=new Set(rows.filter(x=>x.status==='new').map(x=>x.id));
      if(initialized){const added=[...currentNew].filter(id=>!previousNew.has(id));if(added.length){beep();dash.animate([{boxShadow:'0 0 0 rgba(201,164,92,0)'},{boxShadow:'0 0 0 4px rgba(201,164,92,.22)'},{boxShadow:'0 0 0 rgba(201,164,92,0)'}],{duration:900})}}
      previousNew=currentNew;initialized=true;
      dash.querySelectorAll('.ticket').forEach(ticket=>{
        const no=ticket.querySelector('.ticket-no')?.textContent?.trim();const x=rows.find(row=>row.ticketNo===no);if(!x)return;
        let detail=ticket.querySelector('.ticket-customer-detail');if(!detail){detail=document.createElement('div');detail.className='ticket-customer-detail';ticket.querySelector('.ticket-meta')?.insertAdjacentElement('afterend',detail)}
        if(detail)detail.innerHTML=`${x.source==='website'?'<span class="web-order">Website Order</span>':''}${x.phone?`<div><b>Phone</b><span>${esc(x.phone)}</span></div>`:''}${x.address?`<div><b>Address</b><span>${esc(x.address)}</span></div>`:''}${x.orderTotal?`<div><b>Total</b><span>${money(x.orderTotal)}</span></div>`:''}<div><b>Payment</b><span>${esc(x.paymentMethod||'Cash')}</span></div>`;
      });
    }catch(e){}
  }
  const style=document.createElement('style');style.textContent=`.ticket-customer-detail{margin:8px 0 10px;padding:9px;border:1px solid #292c31;background:#0b0c0e;border-radius:7px;display:grid;gap:5px}.ticket-customer-detail>div{display:grid;grid-template-columns:62px 1fr;gap:8px;font-size:10px}.ticket-customer-detail b{color:#8d939b;text-transform:uppercase;letter-spacing:.45px}.ticket-customer-detail span{color:#ece6dc;overflow-wrap:anywhere}.web-order{justify-self:start;color:#e5c36b!important;border:1px solid #665425;border-radius:999px;padding:4px 7px;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:.5px;margin-bottom:3px}`;document.head.appendChild(style);
  setInterval(enhance,2500);setTimeout(enhance,1000);
})();
