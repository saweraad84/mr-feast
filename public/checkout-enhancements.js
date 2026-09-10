(()=>{
  const style=document.createElement('style');style.textContent=`
    .cartdrawer{scrollbar-width:thin}.carthead{position:sticky;top:-22px;z-index:3;background:linear-gradient(180deg,#0b0d10 78%,rgba(11,13,16,0));padding:22px 0 14px}.cartrow h4{font-family:'Playfair Display',serif;font-size:17px}.carttotal{border-top:1px solid rgba(226,197,130,.14);margin-top:8px}.checkout-note{margin:10px 0 16px;padding:11px 12px;border:1px solid rgba(226,197,130,.16);border-radius:10px;background:#101216;color:#b8ad9e;font-size:11px;line-height:1.55}.checkout-note b{color:#e2c582}.filters{overflow-x:auto;flex-wrap:nowrap!important;scrollbar-width:none;padding-bottom:4px}.filters::-webkit-scrollbar{display:none}.filters button{flex:0 0 auto;min-height:40px}.addcart{min-height:42px}.checkoutform input,.checkoutform select,.checkoutform textarea{min-height:44px}.checkoutform textarea{min-height:82px}.successbox{border-color:rgba(122,181,139,.38)!important;background:#101915!important}.successbox h3{color:#b8e3c4!important}@media(max-width:600px){.cartdrawer{padding-bottom:28px!important}.carthead{top:-18px}.filters{margin-left:-20px!important;margin-right:-20px!important;padding-left:20px!important;padding-right:20px!important}}
  `;document.head.appendChild(style);

  function enhanceCart(){
    const form=document.getElementById('checkoutForm');
    if(form&&!form.querySelector('.checkout-note')){
      const note=document.createElement('div');note.className='checkout-note';note.innerHTML='<b>Payment:</b> Cash on Delivery / Cash at Restaurant.<br>Delivery availability and any applicable delivery charge are confirmed before dispatch.';
      const cod=form.querySelector('.cod');if(cod){cod.replaceWith(note)}else form.prepend(note);
    }
    const total=document.querySelector('.carttotal span:first-child');if(total&&total.textContent.trim()==='Total')total.textContent='Order subtotal';
    const success=document.querySelector('.successbox');if(success&&!success.dataset.upgraded){success.dataset.upgraded='1';const p=document.createElement('p');p.style.cssText='color:#b8ad9e;font-size:12px;line-height:1.55';p.textContent='Your order has been sent to the kitchen. Please keep the ticket number for reference.';success.querySelector('h3')?.insertAdjacentElement('afterend',p)}
  }
  new MutationObserver(enhanceCart).observe(document.body,{childList:true,subtree:true});enhanceCart();
})();
