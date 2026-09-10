(()=>{
const nav=document.querySelector('nav');
const onScroll=()=>{if(nav)nav.classList.toggle('scrolled',window.scrollY>28)};onScroll();addEventListener('scroll',onScroll,{passive:true});
const groups=[...document.querySelectorAll('.intro,.section,.bbq,.clips,.order,.reviews,.contact,footer')];
groups.forEach((el,i)=>{el.classList.add('reveal');if(i%3===1)el.classList.add('reveal-delay-1');if(i%3===2)el.classList.add('reveal-delay-2')});
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');observer.unobserve(e.target)}}),{threshold:.12,rootMargin:'0px 0px -7% 0px'});
groups.forEach(el=>observer.observe(el));
if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
 const hero=document.querySelector('.hero video');
 addEventListener('scroll',()=>{if(hero&&scrollY<innerHeight*1.25)hero.style.transform=`scale(1.015) translateY(${Math.min(scrollY*.035,18)}px)`},{passive:true});
}
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const id=a.getAttribute('href');if(!id||id==='#')return;const target=document.querySelector(id);if(target){e.preventDefault();target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'})}}));
})();
