(()=>{const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealTargets=[...document.querySelectorAll('.intro>*,.head,.menu-grid .food,.bbqcopy,.bbqpic,.deal-card,.gallerygrid img,.reviewgrid blockquote,.trust-grid article,.contact>*,.reservation-shell')];
revealTargets.forEach((el,i)=>{el.classList.add('wow-reveal');el.dataset.wowDelay=String(i%4)});
if(!reduce&&'IntersectionObserver'in window){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('wow-in');io.unobserve(e.target)}}),{threshold:.08,rootMargin:'0px 0px -45px'});revealTargets.forEach(el=>io.observe(el))}else revealTargets.forEach(el=>el.classList.add('wow-in'));
function bindTilt(){if(reduce||innerWidth<900)return;document.querySelectorAll('.food,.deal-card').forEach(card=>{if(card.dataset.wowTilt)return;card.dataset.wowTilt='1';card.addEventListener('pointermove',e=>{const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;card.style.transform='perspective(900px) rotateX('+(-y*3.2)+'deg) rotateY('+(x*4.2)+'deg) translateY(-4px)'});card.addEventListener('pointerleave',()=>card.style.transform='')})}
bindTilt();new MutationObserver(bindTilt).observe(document.getElementById('menuGrid')||document.body,{childList:true,subtree:true});
if(!reduce&&innerWidth>900){const glow=document.createElement('div');glow.className='wow-cursor-glow';document.body.appendChild(glow);addEventListener('pointermove',e=>{glow.style.left=e.clientX+'px';glow.style.top=e.clientY+'px'},{passive:true});
let ticking=false;addEventListener('scroll',()=>{if(ticking)return;ticking=true;requestAnimationFrame(()=>{const y=scrollY;document.querySelectorAll('.hero-slide.active').forEach(s=>s.style.backgroundPosition='center calc(50% + '+Math.min(26,y*.035)+'px)');const bbq=document.querySelector('.bbqpic img');if(bbq){const r=bbq.getBoundingClientRect();if(r.top<innerHeight&&r.bottom>0)bbq.style.objectPosition='center '+(50+(r.top/innerHeight)*4)+'%'}ticking=false})},{passive:true})}
document.addEventListener('click',e=>{const b=e.target.closest('.add-item,.deal-order,.cart-nav,.reservation-submit,.directions-btn');if(!b)return;b.animate([{transform:'scale(1)'},{transform:'scale(.96)'},{transform:'scale(1)'}],{duration:220,easing:'ease-out'})});

function setupGalleryLightbox(){
  const imgs=[...document.querySelectorAll('.gallerygrid img')];if(!imgs.length||document.querySelector('.wow-lightbox'))return;
  const box=document.createElement('div');box.className='wow-lightbox';box.innerHTML='<div class="wow-lightbox-inner"><button class="wow-lightbox-close" aria-label="Close">×</button><button class="wow-lightbox-prev" aria-label="Previous">‹</button><img alt="Mr. Feast food gallery"><button class="wow-lightbox-next" aria-label="Next">›</button><div class="wow-lightbox-caption">MR. FEAST · FOOD GALLERY</div></div>';document.body.appendChild(box);
  const big=box.querySelector('img');let i=0;
  const show=n=>{i=(n+imgs.length)%imgs.length;big.src=imgs[i].currentSrc||imgs[i].src;big.alt=imgs[i].alt||'Mr. Feast food'};
  const open=n=>{show(n);box.classList.add('open');document.body.style.overflow='hidden'};
  const closeBox=()=>{box.classList.remove('open');document.body.style.overflow=''};
  imgs.forEach((im,n)=>im.addEventListener('click',()=>open(n)));
  box.querySelector('.wow-lightbox-close').onclick=closeBox;box.querySelector('.wow-lightbox-prev').onclick=()=>show(i-1);box.querySelector('.wow-lightbox-next').onclick=()=>show(i+1);
  box.addEventListener('click',e=>{if(e.target===box)closeBox()});
  addEventListener('keydown',e=>{if(!box.classList.contains('open'))return;if(e.key==='Escape')closeBox();if(e.key==='ArrowLeft')show(i-1);if(e.key==='ArrowRight')show(i+1)});
}
function confettiBurst(){
  if(reduce)return;const rect=document.querySelector('.reservation-success')?.getBoundingClientRect();const x=rect?rect.left+rect.width/2:innerWidth/2,y=rect?rect.top+60:innerHeight/2;
  for(let n=0;n<22;n++){const p=document.createElement('i');p.className='wow-confetti';p.style.left=x+'px';p.style.top=y+'px';p.style.setProperty('--dx',((Math.random()-.5)*260)+'px');p.style.transform='translate3d(0,0,0) rotate('+(Math.random()*180)+'deg)';p.style.animationDelay=(Math.random()*.12)+'s';document.body.appendChild(p);setTimeout(()=>p.remove(),1900)}
}
function watchReservationSuccess(){
  let celebrated=false;const run=()=>{const s=document.querySelector('.reservation-success');if(s&&!celebrated){celebrated=true;requestAnimationFrame(confettiBurst);setTimeout(()=>celebrated=false,2200)}};
  run();new MutationObserver(run).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
}
setupGalleryLightbox();watchReservationSuccess();
})();