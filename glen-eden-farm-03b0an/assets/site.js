(function(){
const NB = {stay:'https://book.nightsbridge.com/20545', camp:'https://book.nightsbridge.com/39255'};
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
/* touch screens (tablets, phones): native scrolling, no scroll-linked effects */
const touch = matchMedia('(hover: none), (pointer: coarse)').matches || /[?&]touch\b/.test(location.search);
if(touch) document.documentElement.classList.add('touch');
const R = document.body.dataset.root || '';
const $ = s=>document.querySelector(s);
const on = (el,ev,fn,o)=>{ if(el) el.addEventListener(ev,fn,o); };

/* ---------- data ---------- */
const UNITS = [
 {id:'fish-eagle',type:'cottage',name:'Fish Eagle',sleeps:2,pets:true,imgs:['fish-eagle','fish-eagle-bed','cottage-pool-tub'],
  blurb:'A cottage for two with its own walled garden, splash pool and hot tub.',chips:['Splash pool','Hot tub','Fireplace'],
  feats:['One bedroom, en-suite shower','Open-plan living and dining','Fully equipped kitchen','Indoor fireplace','Smart TV','Private garden and terrace','Braai','Splash pool','Wood-fired hot tub','Towels and linen']},
 {id:'honeybee',type:'cottage',name:'Honeybee',sleeps:4,pets:true,imgs:['honeybee','cottage-lounge','cottage-pool-tub'],
  blurb:'Two bedrooms, a sunny terrace and room for a small family or two couples.',chips:['Splash pool','Hot tub','Netflix'],
  feats:['Two bedrooms, one bathroom with shower','Open-plan living and dining','Fully equipped kitchen','Indoor fireplace','Netflix-ready Smart TV','Private garden and terrace','Braai','Splash pool','Wood-fired hot tub','Towels and linen']},
 {id:'sugarbird',type:'cottage',name:'Sugarbird',sleeps:6,pets:true,imgs:['sugarbird','cottage-lounge','cottage-pool-tub'],
  blurb:'A roomy cottage with a separate lounge, made for families who like space.',chips:['Sleeps 6','Splash pool','Hot tub'],
  feats:['Two bedrooms, one bathroom with shower','Living room, lounge and dining room','Fully equipped kitchen','Indoor fireplace','Netflix-ready Smart TV','Private garden and terrace','Braai','Splash pool','Wood-fired hot tub','Towels and linen']},
 {id:'blue-crane',type:'cottage',name:'Blue Crane House',sleeps:8,pets:true,imgs:['blue-crane-aerial','blue-crane-lounge','blue-crane-dining','blue-crane-bed','blue-crane'],
  blurb:'Our biggest house, with a wrap-around garden and deck. Ideal for families and friends.',chips:['Sleeps 8','Wrap-around garden','Splash pool'],
  feats:['Three bedrooms','Bathroom with shower and bath','Dining room with double sofa bed','Separate kitchen and utility room','Netflix-ready Smart TV','Indoor fireplace','Wooden deck and back seating area','Braai and splash pool','Towels and linen']},
 {id:'house-on-the-hill',type:'cottage',name:'House on the Hill',sleeps:4,pets:true,imgs:['house-on-the-hill','house-on-the-hill-aerial','golden-house'],
  blurb:'A front stoep with the best mountain views on the farm.',chips:['Mountain views','Deck','Splash pool'],
  feats:['Two bedrooms','Living room with indoor fireplace','Kitchen with breakfast bar','Bathroom with shower','Private garden with braai','Wooden deck and splash pool','Front stoep with furniture and views','Towels and linen']},
 {id:'fynbos',type:'glamping',name:'Fynbos',sleeps:4,pets:false,imgs:['fynbos-dusk','fynbos-deck','fynbos-fire','fynbos-inside'],
  blurb:'A cosy cabin with a covered stoep, built-in braai and views into the veld.',chips:['Wood burner','Hot tub','Netflix'],
  feats:['Double bed and bunk beds','Fan','Netflix Smart TV','Wood-burning fire','Small sofa','Private bathroom','Kitchen','Wood-fired hot tub','Covered stoep with sofa, table and built-in braai']},
 {id:'spekboom',type:'glamping',name:'Spekboom',sleeps:4,pets:false,imgs:['spekboom','spekboom-inside'],
  blurb:'Fynbos\' twin: covered stoep, wood burner and a hot tub of your own.',chips:['Wood burner','Hot tub','Netflix'],
  feats:['Double bed and bunk beds','Fan','Netflix Smart TV','Wood-burning fire','Small sofa','Private bathroom','Kitchen','Wood-fired hot tub','Covered stoep with sofa, table and built-in braai']},
 {id:'lilly',type:'glamping',name:'Lilly Pod',sleeps:5,pets:false,imgs:['lilly-pod','lilly-pod-wagon','lilly-pod-aerial'],
  blurb:'A hand-made gypsy wagon and a bell tent around your own fire pit.',chips:['Gypsy wagon','Bell tent','Hot tub'],
  feats:['Hand-made gypsy wagon, extra-length queen bed','Seating area that converts to a single bed','Bell tent with Persian rug, armchair, queen and single bed','Electricity, bedside lamps and fans','Private bathroom pod with shower','Small kitchen and outside braai','Fire pit with tree-stump seats','Your own hot tub']},
 {id:'protea',type:'glamping',name:'Protea Pod',sleeps:4,pets:false,imgs:['protea-pod','protea-pod-tent','protea-pod-wagon'],
  blurb:'Wagon, bell tent and a stoep kitchen, tucked into its own fenced garden.',chips:['Gypsy wagon','Bell tent','Hot tub'],
  feats:['Hand-made gypsy wagon, extra-length queen bed','Small seating area','Bell tent with Persian rug, armchair, queen and single bed','Electricity, bedside lamps and fans','Private bathroom pod with shower','Small kitchen with stoep and outside braai','Fire pit with tree-stump seats','Your own hot tub']},
 {id:'aloe',type:'glamping',name:'Aloe Pod',sleeps:5,pets:false,imgs:['aloe-pod','aloe-pod-wagon','aloe-pod-tub'],
  blurb:'Our largest wagon, with a king bed. The family favourite.',chips:['Largest wagon','King bed','Hot tub'],
  feats:['Largest hand-made gypsy wagon','King bed (or two singles)','Table and chairs that convert to a single bed','Bell tent with queen and single bed','Electricity, bedside lamps and fans','Private bathroom pod with shower','Small kitchen with stoep and braai','Fire pit and your own hot tub']},
 {id:'pixie',type:'glamping',name:'Pixie',sleeps:4,pets:false,imgs:['pixie','pixie-inside'],
  blurb:'Two micro-bedrooms whose doors fold right open to the stars.',chips:['2 micro-bedrooms','Open-air','Hot tub'],
  feats:['Two hand-made micro-bedrooms','Queen beds, bedside tables and lamps','Doors that open completely outwards','Luggage storage and wall fans','Equipped kitchen','Braai and fire pit','Shaded picnic area with lights','Wood-fired hot tub']},
 {id:'little-eden',type:'camping',name:'Little Eden Campsite',sleeps:6,pets:false,camp:true,price:'from <b>R250</b> pp/night',imgs:['little-eden-site','little-eden','little-eden-aerial'],
  blurb:'Six reed-fenced 300 m² sites with a shared upmarket ablution block.',chips:['300 m² sites','Hot tub','Power'],
  feats:['6 sites, up to 6 guests each','Reed fencing for privacy','Shaded picnic table and lights','Braai and fire pit','Your own wood-fired hot tub','Water and electrical hook-ups','Shared ablutions: 3 showers, 3 toilets','Washing-up sinks, gas hobs, fridge and freezer'],
  note:'Adults R250 to R350, under 12s R150 to R250 per person per night, depending on season. No pets.'},
 {id:'mountain-view',type:'camping',name:'Mountain View Campsite',sleeps:6,pets:true,camp:true,price:'from <b>R350</b> pp/night',imgs:['mountain-view-tub','mountain-view-stoep','mountain-view'],
  blurb:'Six private sites, each with its own bathroom and covered stoep kitchen.',chips:['Private bathroom','Stoep kitchen','Hot tub'],
  feats:['6 sites of about 260 m², up to 6 guests each','Private bathroom with shower','Covered stoep with fridge/freezer and sink','Built-in braai, table and benches','Your own wood-fired hot tub','Water and electrical hook-ups','Space for tents, campers or caravans'],
  note:'Adults R350 to R450, under 12s R250 to R350 per person per night, depending on season. One pet-friendly site, "Valley".'}
];
const GALLERY = ['sunset-aerial','hottub-family','lilly-pod','alpaca-red','fynbos-fire','blue-crane-aerial','protea-pod-tent','pool-slide','house-on-the-hill','pixie-inside','montagu-valley','archery-draw','mountain-view-tub','playground','aloe-pod-tub','bridge','beaney-dining','fynbos-deck'];

/* ---------- booking state ---------- */
const st = {type:'stay', din:'', dout:'', guests:2, filter:'all', pets:false};
const fmt = d=>d.toISOString().slice(0,10);
const bkIn=$('#bkIn'), bkOut=$('#bkOut'), bkType=$('#bkType'), bkGuests=$('#bkGuests');
if(bkType) st.type=bkType.value;
if(bkIn && bkOut){
  const t = new Date(); t.setDate(t.getDate()+7);
  while(t.getDay()!==5) t.setDate(t.getDate()+1);
  const o = new Date(t); o.setDate(o.getDate()+2);
  const today = fmt(new Date());
  bkIn.min = today; bkOut.min = today;
  bkIn.value = st.din = fmt(t); bkOut.value = st.dout = fmt(o);
}
function nbUrl(type){
  const base = NB[type]||NB.stay;
  const q = new URLSearchParams({action:'2',lang:'en'});
  if(st.din) q.set('startdate',st.din); if(st.dout) q.set('enddate',st.dout);
  return base+'?'+q.toString();
}
function refreshLinks(){
  document.querySelectorAll('.js-nb').forEach(a=>a.href=nbUrl(a.dataset.kind||'stay'));
  document.querySelectorAll('[data-nb]').forEach(a=>a.href=nbUrl(a.dataset.nb));
}
on(bkIn,'change',e=>{
  st.din=e.target.value; bkOut.min=st.din;
  if(!bkOut.value||bkOut.value<=st.din){const d=new Date(st.din);d.setDate(d.getDate()+2);bkOut.value=st.dout=fmt(d)}
  refreshLinks();
});
on(bkOut,'change',e=>{st.dout=e.target.value;refreshLinks()});
on(bkType,'change',e=>{st.type=e.target.value});
on(bkGuests,'change',e=>{setGuests(+e.target.value)});
on($('#booker'),'submit',e=>{e.preventDefault();window.open(nbUrl(st.type),'_blank','noopener')});

/* ---------- stays grid ---------- */
const grid = $('#grid');
let cards=[];
if(grid){
  const types=(grid.dataset.types||'').split(',').filter(Boolean);
  const ids=(grid.dataset.ids||'').split(',').filter(Boolean);
  const list=UNITS.filter(u=>(!types.length||types.includes(u.type))&&(!ids.length||ids.includes(u.id)));
  grid.innerHTML = list.map(u=>`
   <article class="card" data-id="${u.id}" data-type="${u.type}" tabindex="0" aria-label="${u.name}, sleeps ${u.sleeps}">
    <div class="ph">
     <span class="badge">${u.type}</span><span class="sleeps">Sleeps ${u.sleeps}</span>
     <img class="a" src="${R}img/${u.imgs[0]}-s.webp" alt="${u.name}" loading="lazy">
     <img class="b" src="${R}img/${(u.imgs[1]||u.imgs[0])}-s.webp" alt="" loading="lazy">
    </div>
    <div class="bd">
     <h3>${u.name}</h3><p>${u.blurb}</p>
     <div class="chips">${u.chips.map(c=>`<span>${c}</span>`).join('')}${u.pets?'<span>Dog friendly</span>':''}</div>
     <div class="ft"><span class="more">Details <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>
     <a class="btn btn-primary" data-nb="${u.camp?'camp':'stay'}" href="${u.camp?NB.camp:NB.stay}" target="_blank" rel="noopener">Check dates</a></div>
    </div>
   </article>`).join('');
  cards=[...grid.children];
}
refreshLinks();
const setTxt=(sel,v)=>{const e=$(sel); if(e) e.textContent=v};
const count=t=>UNITS.filter(u=>t==='all'||u.type===t).length;
setTxt('#cAll',count('all'));setTxt('#cCot',count('cottage'));setTxt('#cGla',count('glamping'));setTxt('#cCam',count('camping'));

function applyFilter(animate=true){
  if(!cards.length) return;
  let shown=0;
  cards.forEach(c=>{
    const u=UNITS.find(x=>x.id===c.dataset.id);
    const ok=(st.filter==='all'||u.type===st.filter)&&u.sleeps>=st.guests&&(!st.pets||u.pets);
    c.classList.toggle('hide',!ok); if(ok) shown++;
  });
  const em=$('#empty'); if(em) em.classList.toggle('show',shown===0);
  if(animate && window.gsap && !reduce){
    gsap.fromTo(cards.filter(c=>!c.classList.contains('hide')),{opacity:0,y:30},{opacity:1,y:0,duration:.6,stagger:.05,ease:'power3.out',overwrite:true});
  }
  window.ScrollTrigger && ScrollTrigger.refresh();
}
document.querySelectorAll('.tab').forEach(b=>b.addEventListener('click',()=>{
  document.querySelectorAll('.tab').forEach(x=>x.setAttribute('aria-pressed',x===b));
  st.filter=b.dataset.f; applyFilter();
}));
function setGuests(n){
  st.guests=Math.max(1,Math.min(9,n));
  setTxt('#gOut',st.guests>8?'9+':st.guests);
  if(bkGuests) bkGuests.value=String(st.guests);
  if($('#gOut')) applyFilter(); // only filter cards where the guest stepper exists
}
on($('#gMinus'),'click',()=>setGuests(st.guests-1));
on($('#gPlus'),'click',()=>setGuests(st.guests+1));
on($('#fPets'),'change',e=>{st.pets=e.target.checked;applyFilter()});
document.querySelectorAll('[data-jump]').forEach(a=>a.addEventListener('click',()=>{
  const b=document.querySelector(`.tab[data-f="${a.dataset.jump}"]`); b&&b.click();
}));

/* ---------- unit modal ---------- */
const modal=$('#modal');
let lenis=null;
function openUnit(id){
  const u=UNITS.find(x=>x.id===id); if(!u||!modal) return;
  $('#mType').textContent=`${u.type} · sleeps ${u.sleeps}${u.pets?' · dog friendly':''}`;
  $('#mTitle').textContent=u.name; $('#mDesc').textContent=u.blurb;
  $('#mList').innerHTML=u.feats.map(f=>`<li>${f}</li>`).join('');
  $('#mNote').textContent=u.note||(u.type==='cottage'?'Children under 2 stay free, and so do dogs when arranged at booking (not on furniture or in the splash pool).':'Glamping sites are pet free. Check in from 14:00, check out by 10:00.');
  $('#mPrice').innerHTML=u.price||'Rates shown on<br><b>live availability</b>';
  const b=$('#mBook'); b.dataset.nb=u.camp?'camp':'stay'; b.href=nbUrl(b.dataset.nb);
  const setImg=i=>{$('#mImg').src=`${R}img/${u.imgs[i]}.webp`;$('#mImg').alt=u.name;[...$('#mThumbs').children].forEach((t,j)=>t.classList.toggle('on',i===j))};
  $('#mThumbs').innerHTML=u.imgs.map((im,i)=>`<button aria-label="Photo ${i+1}"><img src="${R}img/${im}-s.webp" alt=""></button>`).join('');
  [...$('#mThumbs').children].forEach((t,i)=>t.onclick=()=>setImg(i));
  setImg(0);
  modal.classList.add('open'); modal.setAttribute('aria-hidden','false');
  lenis&&lenis.stop(); document.body.style.overflow='hidden';
  modal.querySelector('.closer').focus();
}
function closeUnit(){if(!modal)return;modal.classList.remove('open');modal.setAttribute('aria-hidden','true');lenis&&lenis.start();document.body.style.overflow=''}
on(grid,'click',e=>{ if(e.target.closest('a')) return; const c=e.target.closest('.card'); c&&openUnit(c.dataset.id); });
on(grid,'keydown',e=>{if(e.key==='Enter'){const c=e.target.closest('.card');c&&openUnit(c.dataset.id)}});
on(modal,'click',e=>{if(e.target.closest('[data-close]'))closeUnit()});

/* ---------- gallery + lightbox ---------- */
const lb=$('#lightbox'); let lbi=0;
const showLb=i=>{lbi=(i+GALLERY.length)%GALLERY.length;$('#lbImg').src=`${R}img/${GALLERY[lbi]}.webp`};
const mas=$('#masonry');
if(mas){
  const SHAPE=['w t','','','t','','w','','','t','','w','','t','','w','','','w'];
  mas.innerHTML=GALLERY.map((g,i)=>`<a href="${R}img/${g}.webp" data-i="${i}" class="rv ${SHAPE[i]||''}"><img src="${R}img/${g}-s.webp" alt="" loading="lazy"></a>`).join('');
  mas.addEventListener('click',e=>{const a=e.target.closest('a');if(!a)return;e.preventDefault();showLb(+a.dataset.i);lb.classList.add('open');lb.setAttribute('aria-hidden','false')});
}
on(lb,'click',e=>{
  const k=e.target.dataset.lb;
  if(k==='n')showLb(lbi+1);else if(k==='p')showLb(lbi-1);else if(k==='x'||e.target===lb){lb.classList.remove('open');lb.setAttribute('aria-hidden','true')}
});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){closeUnit();lb&&lb.classList.remove('open');closeDrawer()}
  if(lb&&lb.classList.contains('open')){if(e.key==='ArrowRight')showLb(lbi+1);if(e.key==='ArrowLeft')showLb(lbi-1)}
});

/* ---------- swap in large images ---------- */
document.querySelectorAll('img[data-src]').forEach(img=>{
  const io=new IntersectionObserver(es=>{es.forEach(en=>{if(en.isIntersecting){const hi=new Image();hi.onload=()=>{img.src=img.dataset.src};hi.src=img.dataset.src;io.disconnect()}})},{rootMargin:'400px'});
  io.observe(img);
});

/* ---------- drawer ---------- */
const drawer=$('#drawer');
function closeDrawer(){drawer&&drawer.classList.remove('open')}
on($('#burger'),'click',()=>drawer.classList.add('open'));
on($('#drawerClose'),'click',closeDrawer);
drawer&&drawer.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeDrawer));

/* ---------- hero video (homepage) ---------- */
const v=$('#heroVideo');
if(v){
  const save = navigator.connection&&navigator.connection.saveData;
  const w = Math.max(innerWidth,innerHeight)*Math.min(devicePixelRatio||1,2);
  v.src = R+(save||innerWidth<600 ? 'media/hero-m.mp4' : (touch||w<=1500) ? 'media/hero-720.mp4' : 'media/hero.mp4');
  v.addEventListener('canplay',()=>{v.play().catch(()=>{})},{once:true});
  v.load();
}

/* ---------- smooth scroll ---------- */
if(!reduce && !touch && window.Lenis){
  lenis=new Lenis({lerp:.1,smoothWheel:true});
  if(window.gsap && window.ScrollTrigger){lenis.on('scroll',ScrollTrigger.update);gsap.ticker.add(t=>lenis.raf(t*1000));gsap.ticker.lagSmoothing(0)}
  else{const raf=t=>{lenis.raf(t);requestAnimationFrame(raf)};requestAnimationFrame(raf)}
}
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
  const id=a.getAttribute('href'); if(id.length<2) return;
  const t=document.querySelector(id); if(!t) return;
  e.preventDefault(); lenis?lenis.scrollTo(t,{offset:-60,duration:1.4}):t.scrollIntoView({behavior:'smooth'});
}));

/* ---------- nav + mobile bar ---------- */
const nav=$('#nav'), mbar=$('#mbar'), waf=$('.wa-float'); let lastY=0;
function onScroll(){
  const y=scrollY;
  nav&&nav.classList.toggle('scrolled',y>40);
  nav&&nav.classList.toggle('hide',y>lastY&&y>innerHeight*1.2&&!(drawer&&drawer.classList.contains('open')));
  mbar&&mbar.classList.toggle('show',y>innerHeight*.6);
  waf&&waf.classList.toggle('show',y>innerHeight*.5);
  lastY=y;
}
addEventListener('scroll',onScroll,{passive:true}); onScroll();

/* ---------- loader + animations ---------- */
const loader=$('#loader');
function hideLoader(){if(!loader)return;loader.classList.add('out');setTimeout(()=>loader.remove(),1100)}
function heroIn(){
  if(!window.gsap||reduce){document.querySelectorAll('.rv').forEach(e=>{e.style.opacity=1;e.style.transform='none'});document.querySelectorAll('.rv-mask').forEach(e=>e.style.clipPath='none');return}
  gsap.from('.hero h1 .ln>span, .phero h1 .ln>span',{yPercent:110,duration:1.3,stagger:.12,ease:'power4.out',delay:loader?.35:.1});
  gsap.from('.hero-fade',{opacity:0,y:24,duration:1,stagger:.1,ease:'power3.out',delay:loader?.8:.45});
  if(!touch) gsap.fromTo('.hero video,.hero .poster,.phero .bgimg',{scale:1.15},{scale:1,duration:2.4,ease:'power2.out'});
}
const minShow = new Promise(r=>setTimeout(r,(reduce||!loader)?0:1300));
const ready = loader ? new Promise(r=>{ if(document.readyState==='complete') r(); else addEventListener('load',r); setTimeout(r,3500); }) : Promise.resolve();
Promise.all([minShow,ready]).then(()=>{hideLoader();heroIn()});

if(window.gsap && window.ScrollTrigger && !reduce){
  gsap.registerPlugin(ScrollTrigger);
  const ex=s=>document.querySelector(s);
  if(ex('.hero') && !touch){
    gsap.to('.hero-inner',{yPercent:-18,opacity:.2,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
    gsap.to('.hero video',{yPercent:12,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
  }
  if(ex('.phero') && !touch){
    gsap.to('.phero .bgwrap',{yPercent:14,ease:'none',scrollTrigger:{trigger:'.phero',start:'top top',end:'bottom top',scrub:true}});
    gsap.to('.phero .pinner',{yPercent:-12,opacity:.3,ease:'none',scrollTrigger:{trigger:'.phero',start:'top top',end:'bottom top',scrub:true}});
  }

  ScrollTrigger.batch('.rv',{start:'top 88%',onEnter:b=>gsap.to(b,{opacity:1,y:0,duration:1.1,stagger:.08,ease:'power3.out',overwrite:true})});
  document.querySelectorAll('.rv-mask').forEach(m=>{
    gsap.to(m,{clipPath:'inset(0% 0% 0% 0% round 14px)',duration:1.5,ease:'power3.inOut',scrollTrigger:{trigger:m,start:'top 85%'}});
    const img=m.querySelector('img');
    if(img && !touch) gsap.fromTo(img,{scale:1.1},{scale:1,ease:'none',scrollTrigger:{trigger:m,start:'top bottom',end:'bottom top',scrub:true}});
  });

  document.querySelectorAll('[data-count]').forEach(el=>{
    const end=+el.dataset.count, suf=el.dataset.suffix||'';
    const o={v:0};
    ScrollTrigger.create({trigger:el,start:'top 90%',once:true,onEnter:()=>gsap.to(o,{v:end,duration:2,ease:'power2.out',onUpdate:()=>{el.innerHTML=Math.round(o.v)+(suf?`<sup>${suf}</sup>`:'')}})});
  });

  if(!touch){
  if(ex('.feature')){
    gsap.fromTo('.feature .bg',{yPercent:-8},{yPercent:8,ease:'none',scrollTrigger:{trigger:'.feature',start:'top bottom',end:'bottom top',scrub:true}});
    gsap.fromTo('.feature .inset',{yPercent:20},{yPercent:-20,ease:'none',scrollTrigger:{trigger:'.feature',start:'top bottom',end:'bottom top',scrub:true}});
  }
  if(ex('.cta')) gsap.fromTo('.cta .bg',{yPercent:-8},{yPercent:8,ease:'none',scrollTrigger:{trigger:'.cta',start:'top bottom',end:'bottom top',scrub:true}});
  if(ex('.beaney .big')) gsap.fromTo('.beaney .big',{xPercent:3},{xPercent:-3,ease:'none',scrollTrigger:{trigger:'.beaney',start:'top bottom',end:'bottom top',scrub:true}});
  }

  const track=$('#dayTrack');
  if(track && !touch){
    const mm=gsap.matchMedia();
    mm.add('(min-width: 801px)',()=>{
      const dist=()=>track.scrollWidth-innerWidth;
      const tw=gsap.to(track,{x:()=>-dist(),ease:'none',scrollTrigger:{trigger:'#dayPin',start:'top top',end:()=>'+='+dist(),pin:true,scrub:1,invalidateOnRefresh:true,anticipatePin:1,
        onUpdate:s=>gsap.set('#dayProg',{scaleX:s.progress})}});
      gsap.utils.toArray('.moment .ph img').forEach(img=>gsap.fromTo(img,{xPercent:-6},{xPercent:6,ease:'none',scrollTrigger:{trigger:img.closest('.moment'),containerAnimation:tw,start:'left right',end:'right left',scrub:true}}));
    });
    mm.add('(max-width: 800px)',()=>{
      gsap.utils.toArray('.moment').forEach(m=>gsap.from(m,{opacity:0,y:50,duration:1,ease:'power3.out',scrollTrigger:{trigger:m,start:'top 88%'}}));
    });
  }

  if(matchMedia('(hover:hover)').matches){
    document.querySelectorAll('.btn-primary').forEach(b=>{
      b.addEventListener('mousemove',e=>{const r=b.getBoundingClientRect();gsap.to(b,{x:(e.clientX-r.left-r.width/2)*.18,y:(e.clientY-r.top-r.height/2)*.3,duration:.4})});
      b.addEventListener('mouseleave',()=>gsap.to(b,{x:0,y:0,duration:.6,ease:'elastic.out(1,.4)'}));
    });
  }
  if(track && touch) gsap.utils.toArray('.moment').forEach((m,i)=>gsap.from(m,{opacity:0,y:40,duration:.9,delay:(i%4)*.06,ease:'power3.out',scrollTrigger:{trigger:'#dayPin',start:'top 85%'}}));
  if(touch) ScrollTrigger.config({ignoreMobileResize:true});
  addEventListener('load',()=>ScrollTrigger.refresh());
}else{
  document.querySelectorAll('[data-count]').forEach(el=>{el.innerHTML=el.dataset.count+(el.dataset.suffix?`<sup>${el.dataset.suffix}</sup>`:'')});
}
applyFilter(false);
})();
