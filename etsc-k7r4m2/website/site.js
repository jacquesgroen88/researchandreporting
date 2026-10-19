/* Shared header, footer, icons, quote basket and small interactions for the ETSC website concept. */
(function(){
const page = document.body.dataset.page || '';
const P = {
  forklift:'M3 17V9h5l3 4v4M3 13h8M15 4v13h5M13 17h8M6 19.5a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2zM11 19.5a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2z',
  crane:'M6 21V4h2v17M3 21h9M8 5l12 3M8 5l4 4M19 8v5M17.5 13h3L19 16z',
  excavator:'M3 16h11v4H3zM5 16v-4h6v4M11 12l4-7 4 3-2 4.5M19 8l1 4-2.5 1',
  truck:'M2 16V6h11v10M13 9h4l3.5 3.5V16H13M6 18.5a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2zM17 18.5a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2z',
  cross:'M9 3h6v6h6v6h-6v6H9v-6H3V9h6z',
  hat:'M3 17h18M5 17a7 7 0 0 1 14 0M10 10V6.5h4V10M12 17v-3',
  tools:'M14.5 5.5a4 4 0 0 0 5 5l-9.5 9.5a2.1 2.1 0 0 1-3-3zM4 4l5 5M3 8l5-5',
  layers:'M12 3 2 8l10 5 10-5zM2 13l10 5 10-5',
  phone:'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2',
  chat:'M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-5A8 8 0 1 1 21 12z',
  mail:'M3 5h18v14H3zM3 6l9 7 9-7',
  pin:'M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  check:'M4 12.5 9 17.5 20 6.5',
  shield:'M12 3 4 6v6c0 4.5 3.4 8.2 8 9 4.6-.8 8-4.5 8-9V6zM8.5 12l2.5 2.5 4.5-5',
  qr:'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 14h2v6h-4M14 18h2v2',
  chev:'M6 9l6 6 6-6',
  arrow:'M5 12h14M13 6l6 6-6 6',
  search:'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4',
  x:'M6 6l12 12M18 6 6 18',
  menu:'M4 7h16M4 12h16M4 17h16',
  clock:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
  doc:'M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6',
  users:'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21v-1a7 7 0 0 1 14 0v1M16 3.5a4 4 0 0 1 0 7.5M22 21v-1a7 7 0 0 0-4-6.3'
};
window.ico = (n, cls='') => `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${P[n]}"/></svg>`;

const store = {
  get(){ try { return JSON.parse(localStorage.getItem('etsc-basket') || '[]'); } catch(e){ return window.__basket || []; } },
  set(v){ window.__basket = v; try { localStorage.setItem('etsc-basket', JSON.stringify(v)); } catch(e){} }
};
window.Basket = {
  list: () => store.get(),
  has: id => store.get().includes(id),
  toggle(id){ const b = store.get(); const i = b.indexOf(id); i < 0 ? b.push(id) : b.splice(i,1); store.set(b); return i < 0; },
  clear(){ store.set([]); }
};
window.qrSvg = function(seed){
  let x = [...seed].reduce((a,c)=>a*31+c.charCodeAt(0),7) >>> 0; const cells=[];
  const finder=(r,c)=>{for(const [fr,fc] of [[0,0],[0,14],[14,0]]){const rr=r-fr,cc=c-fc;if(rr>=0&&rr<7&&cc>=0&&cc<7){return rr===0||rr===6||cc===0||cc===6||(rr>=2&&rr<=4&&cc>=2&&cc<=4)?1:0;}}return -1;};
  for(let r=0;r<21;r++)for(let c=0;c<21;c++){const f=finder(r,c);if(f>=0){cells.push(f);continue;}x=(x*1103515245+12345)>>>0;cells.push((x>>16)&1);}
  return `<div class="qr">${cells.map(k=>`<i class="${k?'k':''}"></i>`).join('')}</div>`;
};

const CATS = window.CATS || [];
const count = id => (window.COURSES || []).filter(c => c.cat === id).length;
const mega = CATS.map(c => `<a href="courses.html#${c.id}"><span class="mi">${ico(c.ic)}</span><span><b>${c.name}</b><small>${c.range} · ${count(c.id)} courses</small></span></a>`).join('');

const header = `
<div class="concept">Website concept prepared for Exclusive Training and Services by JCE Media · <a href="../index.html">Back to the proposal</a></div>
<div class="util"><div class="wrap">
  <a href="tel:0861333208">${ico('phone')}086 133 3208</a>
  <a class="hide-m" href="https://wa.me/27630519748">${ico("chat")}WhatsApp 063 051 9748</a>
  <a class="hide-m" href="mailto:info@etsc.co.za">${ico('mail')}info@etsc.co.za</a>
  <div class="r"><span class="hide-m"><span class="stars">★★★★★</span> 4.9 on Google</span><a href="verify.html">${ico('qr')}Verify a certificate</a></div>
</div></div>
<header class="hdr"><div class="wrap">
  <a class="logo" href="index.html" aria-label="Exclusive Training and Services, home"><img src="../assets/logo-dark.png" alt="Exclusive Training and Services"></a>
  <nav class="menu" id="menu" aria-label="Main">
    <div class="dd" id="dd"><button type="button" aria-expanded="false">Courses ${ico('chev','chev')}</button><div class="mega">${mega}<a class="all" href="courses.html">See all ${(window.COURSES||[]).length} courses ${ico('arrow')}</a></div></div>
    <a href="index.html#onsite">On-site training</a>
    <a href="index.html#accreditation">Accreditation</a>
    <a href="index.html#about">About</a>
    <a href="index.html#contact">Contact</a>
  </nav>
  <div class="hdr-cta"><a class="hdr-tel" href="tel:0861333208"><small>Call us, Mon to Fri</small><b>086 133 3208</b></a><a class="btn btn-gold btn-sm" href="quote.html">Request a quote</a></div>
  <button class="burger" id="burger" aria-label="Open menu">${ico('menu')}</button>
</div></header>`;

const footer = `
<footer><div class="wrap">
  <div class="fcols">
    <div><img class="flogo" src="../assets/logo-light.png" alt="Exclusive Training and Services"><p style="margin-top:18px;max-width:330px">Accredited lifting machine, earth-moving, driving and workplace safety training, on your site or at our centre, since March 1995.</p></div>
    <div><h5>Training</h5><ul>${CATS.slice(0,6).map(c=>`<li><a href="courses.html#${c.id}">${c.name}</a></li>`).join('')}</ul></div>
    <div><h5>For clients</h5><ul><li><a href="quote.html">Request a quote</a></li><li><a href="verify.html">Verify a certificate</a></li><li><a href="../app/index.html#/portal">Client portal</a></li><li><a href="index.html#compliance">Card expiry check</a></li><li><a href="index.html#accreditation">Accreditation</a></li></ul></div>
    <div><h5>Contact</h5><ul><li><a href="tel:0861333208">086 133 3208</a></li><li><a href="https://wa.me/27630519748">WhatsApp 063 051 9748</a></li><li><a href="mailto:info@etsc.co.za">info@etsc.co.za</a></li><li>22 Limpopo Street, Three Rivers<br>Vereeniging, 1935</li></ul></div>
  </div>
  <div class="legal"><span>© 2026 Exclusive Training and Services</span><a href="#">POPIA and privacy notice</a><a href="#">Terms of training</a><span>Website concept by JCE Media</span></div>
</div></footer>
<nav class="mbar" aria-label="Quick actions"><a href="tel:0861333208">${ico('phone')}Call</a><a href="https://wa.me/27630519748">${ico('chat')}WhatsApp</a><a class="q" href="quote.html">Get a quote</a></nav>`;

document.body.insertAdjacentHTML('afterbegin', header);
document.body.insertAdjacentHTML('beforeend', footer);
document.getElementById('burger').onclick = () => document.getElementById('menu').classList.toggle('on');
const dd = document.getElementById('dd');
dd.querySelector('button').onclick = () => { const o = dd.classList.toggle('open'); dd.querySelector('button').setAttribute('aria-expanded', o); };
document.addEventListener('click', e => { if (!dd.contains(e.target)) dd.classList.remove('open'); });
document.querySelectorAll('[data-ico]').forEach(el => el.insertAdjacentHTML('afterbegin', ico(el.dataset.ico)));

const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin:'0px 0px -6% 0px' }) : null;
document.querySelectorAll('.reveal').forEach(el => io ? io.observe(el) : el.classList.add('in'));
setTimeout(() => document.querySelectorAll('.reveal').forEach(el => el.classList.add('in')), 2200);
})();
