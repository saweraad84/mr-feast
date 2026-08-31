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
    .catrow.category-showcase{background:#fbf2df}
    .catrow.category-showcase>a{background:#fbf2df!important;border-color:#dbc89f!important}
    .catrow.category-showcase>a>img{height:210px!important;object-fit:cover!important}
    .catrow.category-showcase>a>div{padding:32px 6.7vw 42px!important;min-height:190px;box-sizing:border-box;text-align:left!important}
    .catrow.category-showcase b{display:block!important;margin:0!important;font-family:'DM Sans',sans-serif!important;font-size:28px!important;line-height:1.08!important;font-weight:800!important;letter-spacing:-.7px!important;color:#12090b!important;text-transform:none!important}
    .catrow.category-showcase .category-divider{position:relative;width:100%;max-width:215px;height:1px;background:#d6b35d;margin:18px 0 17px}
    .catrow.category-showcase .category-divider:after{content:'◆';position:absolute;left:50%;top:50%;transform:translate(-50%,-52%);background:#fbf2df;padding:0 7px;color:#c49a35;font-size:10px;line-height:1}
    .catrow.category-showcase .category-description{display:block!important;font-size:12px!important;line-height:1.45!important;font-weight:700!important;color:#681821!important;letter-spacing:0!important;margin:0!important}
    @media(max-width:900px){.catrow.category-showcase>a>div{padding:27px 5vw 34px!important}.catrow.category-showcase b{font-size:24px!important}.catrow.category-showcase .category-divider{max-width:180px}}
    @media(max-width:650px){.catrow.category-showcase>a>img{height:230px!important}.catrow.category-showcase>a>div{min-height:0;padding:26px 7vw 32px!important}.catrow.category-showcase b{font-size:25px!important}.catrow.category-showcase .category-divider{max-width:200px;margin:15px 0}}
  `;
  document.head.appendChild(style);
})();
