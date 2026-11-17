(()=>{
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const NB='https://book.nightsbridge.com/39110',WA='27797737773';
const R=document.body.dataset.root||'';
let LANG='af';
try{LANG=localStorage.getItem('vs-lang')||'af'}catch(e){}

/* ---------- language toggle ---------- */
$$('[data-en]').forEach(el=>{el.dataset.af=el.innerHTML});
function setLang(l){LANG=l;document.documentElement.lang=l;
  $$('[data-en]').forEach(el=>{el.innerHTML=l==='en'?el.dataset.en:el.dataset.af});
  $$('.lang button').forEach(b=>b.classList.toggle('on',b.dataset.lang===l));
  try{localStorage.setItem('vs-lang',l)}catch(e){}
  if(typeof updateRec==='function')updateRec();}
$$('.lang button').forEach(b=>b.onclick=()=>setLang(b.dataset.lang));

/* ---------- nav ---------- */
const nav=$('#nav'),mbar=$('#mbar'),cpt=$('#concept');
const onScroll=()=>{const y=scrollY;nav.classList.toggle('solid',y>40||nav.classList.contains('open'));
  if(mbar)mbar.classList.toggle('show',y>innerHeight*.6);if(cpt)cpt.classList.toggle('show',y>innerHeight*.9)};
addEventListener('scroll',onScroll,{passive:true});onScroll();
$('#burger').onclick=()=>{const o=nav.classList.toggle('open');$('#burger').setAttribute('aria-expanded',o);onScroll()};
$$('#menu a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');onScroll()}));

/* ---------- hero slideshow (home) ---------- */
const sl=$$('#slides img');
if(sl.length){const dots=$('#dots');let si=0,st;
  dots.innerHTML=sl.map((_,i)=>`<button aria-label="Foto ${i+1}" class="${i?'':'on'}"></button>`).join('');
  const db=$$('#dots button');
  const go=i=>{const n=sl[i];if(n.dataset.src&&!n.getAttribute('src'))n.src=n.dataset.src;sl[si].classList.remove('on');db[si].classList.remove('on');si=i;n.classList.add('on');db[si].classList.add('on')};
  const nextS=()=>go((si+1)%sl.length);
  addEventListener('load',()=>{sl.forEach(s=>{if(s.dataset.src)s.src=s.dataset.src});st=setInterval(nextS,5500)});
  db.forEach((b,i)=>b.onclick=()=>{clearInterval(st);go(i);st=setInterval(nextS,5500)});}

/* ---------- booking: dates passed to NightsBridge ---------- */
const fmt=d=>d.toISOString().slice(0,10);
const ci=$('#ci'),co=$('#co'),gs=$('#gs');
if(ci&&co){const t=new Date();t.setDate(t.getDate()+7);const t2=new Date(t);t2.setDate(t.getDate()+2);
  ci.value=fmt(t);co.value=fmt(t2);ci.min=fmt(new Date());co.min=ci.value;
  ci.onchange=()=>{co.min=ci.value;if(co.value<=ci.value){const d=new Date(ci.value);d.setDate(d.getDate()+2);co.value=fmt(d)}};}
const dates=()=>ci&&co&&ci.value&&co.value?`?startdate=${ci.value}&enddate=${co.value}`:'';
$$('[data-book]').forEach(a=>a.addEventListener('click',()=>{a.href=NB+dates()}));
const waText=kind=>{const d=ci&&co?` (${ci.value} - ${co.value})`:'';
  const af={group:`Hallo Koos, ons is 'n groep en stel belang in al drie eenhede${d}. Kan jy asseblief 'n kwotasie stuur?`,ask:`Hallo Koos, ek het 'n vraag oor Vitamiene See${d}.`};
  const en={group:`Hi Koos, we're a group interested in all three units${d}. Could you send a quote?`,ask:`Hi Koos, I have a question about Vitamiene See${d}.`};
  return encodeURIComponent((LANG==='en'?en:af)[kind])};
$$('[data-wa]').forEach(a=>a.addEventListener('click',()=>{a.href=`https://wa.me/${WA}?text=${waText(a.dataset.wa)}`}));

/* ---------- unit recommender (home + units) ---------- */
const REC={
  '2':{af:'Vir 1 tot 2 mense stel ons <b>die Pophuis</b> voor, vanaf R800 per nag.',en:'For 1 to 2 people we suggest <b>the Pophuis</b>, from R800 a night.',id:'u-2',url:'eenhede/pophuis/'},
  '6':{af:'Vir 3 tot 6 mense is <b>die Voorhuis</b> perfek: 3 slaapkamers, vanaf R1,450 per nag.',en:'For 3 to 6 people <b>the Voorhuis</b> is perfect: 3 bedrooms, from R1,450 a night.',id:'u-6',url:'eenhede/voorhuis/'},
  '10':{af:'Vir 7 tot 10 mense is <b>die Woonhuis</b> gebou: 5 slaapkamers en 3 badkamers.',en:'For 7 to 10 people <b>the Woonhuis</b> is the one: 5 bedrooms and 3 bathrooms.',id:'u-10',url:'eenhede/woonhuis/'},
  '18':{af:'Vir 11 tot 18 mense: <b>bespreek al drie eenhede</b>. Vra Koos vir \'n groepkwotasie.',en:'For 11 to 18 people: <b>book all three units</b>. Ask Koos for a group quote.',id:null,url:'groepe/'}};
window.updateRec=function(){if(!gs||!$('#recText'))return;const r=REC[gs.value];$('#recText').innerHTML=r[LANG];
  $$('.unit').forEach(u=>u.classList.toggle('pick',!!r.id&&u.id===r.id));$('#recLink').href=R+r.url};
var updateRec=window.updateRec;
if(gs)gs.onchange=updateRec;
const bf=$('#bookForm');
if(bf)bf.onsubmit=e=>{e.preventDefault();
  if(gs&&gs.value==='18'){open(`https://wa.me/${WA}?text=${waText('group')}`,'_blank');return}
  open(NB+dates(),'_blank')};

/* ---------- lightbox ---------- */
const lb=$('#lb'),li=$('#lbImg'),lc=$('#lbCap');let list=[],idx=0;
function show(i){idx=(i+list.length)%list.length;li.src=list[idx][0];li.alt=list[idx][1];lc.textContent=list[idx][1]+(list.length>1?`  ·  ${idx+1} / ${list.length}`:'')}
function openLb(l,i){list=l;$$('.lb .pv,.lb .nx').forEach(b=>b.style.display=l.length>1?'':'none');show(i);lb.classList.add('open');document.body.style.overflow='hidden'}
window.openLb=openLb;
const close=()=>{lb.classList.remove('open');document.body.style.overflow=''};
$('.lb .x').onclick=close;$('.lb .pv').onclick=()=>show(idx-1);$('.lb .nx').onclick=()=>show(idx+1);
lb.onclick=e=>{if(e.target===lb)close()};
addEventListener('keydown',e=>{if(!lb.classList.contains('open'))return;if(e.key==='Escape')close();if(e.key==='ArrowRight')show(idx+1);if(e.key==='ArrowLeft')show(idx-1)});
let lx=null;lb.addEventListener('touchstart',e=>lx=e.touches[0].clientX,{passive:true});
lb.addEventListener('touchend',e=>{if(lx===null)return;const dx=e.changedTouches[0].clientX-lx;if(Math.abs(dx)>50)show(idx+(dx<0?1:-1));lx=null});

/* ---------- unit carousels ---------- */
$$('.car').forEach(car=>{
  const ims=car.dataset.imgs.split(',');let i=0;const name=car.closest('.unit').dataset.unit;
  const tr=document.createElement('div');tr.className='track';
  tr.innerHTML=ims.map((k,j)=>`<img src="${R}img/${k}-sm.webp" alt="${name} foto ${j+1}" loading="lazy">`).join('');
  car.prepend(tr);
  car.insertAdjacentHTML('beforeend',`<button class="nav-b pv" aria-label="Vorige"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M15 6l-6 6 6 6"/></svg></button><button class="nav-b nx" aria-label="Volgende"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M9 6l6 6-6 6"/></svg></button><span class="count">1 / ${ims.length}</span>`);
  const cnt=car.querySelector('.count');
  const sh=n=>{i=(n+ims.length)%ims.length;tr.style.transform=`translateX(-${i*100}%)`;cnt.textContent=`${i+1} / ${ims.length}`};
  car.querySelector('.pv').onclick=e=>{e.stopPropagation();sh(i-1)};car.querySelector('.nx').onclick=e=>{e.stopPropagation();sh(i+1)};
  let sx=null;car.addEventListener('touchstart',e=>sx=e.touches[0].clientX,{passive:true});
  car.addEventListener('touchend',e=>{if(sx===null)return;const dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>40)sh(i+(dx<0?1:-1));sx=null});
  tr.querySelectorAll('img').forEach((im,j)=>im.onclick=()=>openLb(ims.map((k,n)=>[`${R}img/${k}.webp`,`${name} · ${n+1}/${ims.length}`]),j));
});

/* ---------- galleries with data-g items ---------- */
const gg=$('#ggrid');
if(gg&&window.GALLERY){const G=window.GALLERY;let gf='all',expanded=!!gg.dataset.all;
  gg.innerHTML=G.map(([k,c,cap],i)=>`<button data-c="${c}" data-i="${i}"><img src="${R}img/${k}-sm.webp" alt="${cap}" loading="lazy"></button>`).join('');
  const more=$('#gmore');
  const applyG=()=>{let n=0;$$('#ggrid button').forEach(b=>{const m=gf==='all'||b.dataset.c.includes(gf);b.hidden=!(m&&(expanded||gf!=='all'||n<12));if(m)n++});
    if(more)more.parentElement.style.display=(gf==='all'&&!expanded)?'':'none'};
  applyG();if(more)more.onclick=()=>{expanded=true;applyG()};
  $$('#gtabs button').forEach(b=>b.onclick=()=>{$$('#gtabs button').forEach(x=>x.classList.toggle('on',x===b));gf=b.dataset.g;applyG()});
  gg.onclick=e=>{const b=e.target.closest('button');if(!b)return;const vis=$$('#ggrid button').filter(x=>!x.hidden);
    openLb(vis.map(x=>{const g=G[+x.dataset.i];return[`${R}img/${g[0]}.webp`,g[2]]}),vis.indexOf(b))};}
/* unit page gallery */
const ug=$('.ugal');
if(ug){const items=$$('.ugal button');const L=items.map(b=>[b.dataset.full,b.querySelector('img').alt]);items.forEach((b,i)=>b.onclick=()=>openLb(L,i))}
$$('[data-lb]').forEach(im=>im.onclick=()=>openLb([[im.dataset.lb||im.src,im.alt]],0));

/* ---------- reveal + score bars ---------- */
const els=$$('.rv');
const reveal=el=>{el.classList.add('shown');el.querySelectorAll('[data-w]').forEach(i=>i.style.width=i.dataset.w+'%')};
if('IntersectionObserver' in window){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){reveal(e.target);io.unobserve(e.target)}}),{rootMargin:'0px 0px -8% 0px'});els.forEach(el=>io.observe(el))}
setTimeout(()=>els.forEach(el=>{if(el.getBoundingClientRect().top<innerHeight)reveal(el)}),1200);
setTimeout(()=>els.forEach(reveal),4000);

setLang(LANG);
})();
