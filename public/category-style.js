(()=>{
  const row=document.querySelector('.catrow');
  if(!row)return;

  row.classList.add('category-showcase');
  [...row.querySelectorAll(':scope > a')].forEach(card=>{
    const info=card.querySelector('div');
    if(!info)return;
    const number=info.querySelector('small');
    if(number) number.remove();
    const title=info.querySelector('b');
    const desc=info.querySelector('span');
    if(title && !info.querySelector('.category-divider')){
      const divider=document.createElement('div');
      divider.className='category-divider';
      title.insertAdjacentElement('afterend',divider);
    }
    if(desc) desc.classList.add('category-description');
  });

  const style=document.createElement('style');
  style.textContent=`
    .catrow.category-showcase{background:#0f1114!important;gap:1px}
    .catrow.category-showcase>a{background:#14171b!important;border-color:rgba(226,197,130,.22)!important;color:#f4ead7!important;transition:transform .3s ease,border-color .3s ease,background .3s ease!important}
    .catrow.category-showcase>a:hover{background:#181b20!important;border-color:rgba(226,197,130,.48)!important}
    .catrow.category-showcase>a>img{height:230px!important;object-fit:cover!important;filter:saturate(.92) contrast(1.04);transition:transform .55s ease,filter .35s ease!important}
    .catrow.category-showcase>a:hover>img{transform:scale(1.035);filter:saturate(1.03) contrast(1.05)}
    .catrow.category-showcase>a>div{padding:30px 6.2vw 38px!important;min-height:190px;box-sizing:border-box;text-align:left!important;background:#14171b!important}
    .catrow.category-showcase b{display:block!important;margin:0!important;font-family:'Playfair Display',serif!important;font-size:29px!important;line-height:1.08!important;font-weight:700!important;letter-spacing:-.45px!important;color:#f4ead7!important;text-transform:none!important;text-shadow:0 1px 1px rgba(0,0,0,.25)}
    .catrow.category-showcase .category-divider{width:72px!important;max-width:none!important;height:1px!important;background:#c9a45c!important;margin:17px 0 16px!important;position:relative}
    .catrow.category-showcase .category-divider:after{display:none!important;content:none!important}
    .catrow.category-showcase .category-description{display:block!important;font-size:13px!important;line-height:1.55!important;font-weight:600!important;color:#d7cbb9!important;letter-spacing:.1px!important;margin:0!important;max-width:270px}
    @media(max-width:900px){.catrow.category-showcase>a>div{padding:27px 5vw 34px!important}.catrow.category-showcase b{font-size:26px!important}.catrow.category-showcase .category-description{font-size:13px!important}}
    @media(max-width:650px){.catrow.category-showcase>a>img{height:230px!important}.catrow.category-showcase>a>div{min-height:0;padding:26px 7vw 32px!important}.catrow.category-showcase b{font-size:27px!important}.catrow.category-showcase .category-divider{margin:14px 0!important}.catrow.category-showcase .category-description{max-width:none}}
  `;
  document.head.appendChild(style);
})();
