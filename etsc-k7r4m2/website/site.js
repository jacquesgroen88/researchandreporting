/* Shared header, footer, quote basket and small interactions for the ETSC website concept. */
(function(){
const page = document.body.dataset.page || '';
const store = {
  get(){ try { return JSON.parse(localStorage.getItem('etsc-basket') || '[]'); } catch(e){ return window.__basket || []; } },
  set(v){ window.__basket = v; try { localStorage.setItem('etsc-basket', JSON.stringify(v)); } catch(e){} }
};
window.Basket = {
  list: () => store.get(),
  has: id => store.get().includes(id),
  toggle(id){ const b = store.get(); const i = b.indexOf(id); i < 0 ? b.push(id) : b.splice(i,1); store.set(b); document.dispatchEvent(new Event('basket')); return i < 0; },
  clear(){ store.set([]); document.dispatchEvent(new Event('basket')); }
};
window.qrSvg = function(seed){
  let x = [...seed].reduce((a,c)=>a*31+c.charCodeAt(0),7) >>> 0; const cells=[];
  const finder=(r,c)=>{for(const [fr,fc] of [[0,0],[0,14],[14,0]]){const rr=r-fr,cc=c-fc;if(rr>=0&&rr<7&&cc>=0&&cc<7){return rr===0||rr===6||cc===0||cc===6||(rr>=2&&rr<=4&&cc>=2&&cc<=4)?1:0;}}return -1;};
  for(let r=0;r<21;r++)for(let c=0;c<21;c++){const f=finder(r,c);if(f>=0){cells.push(f);continue;}x=(x*1103515245+12345)>>>0;cells.push((x>>16)&1);}
  return `<div class="qr">${cells.map(k=>`<i class="${k?'k':''}"></i>`).join('')}</div>`;
};

const header = `
<div class="concept">Website concept prepared for Exclusive Training and Services by JCE Media · <a href="../index.html">Back to the proposal</a></div>
<div class="util"><div class="wrap">
  <a href="tel:0861333208">☎ <b>086 133 3208</b></a>
  <a class="hide-m" href="mailto:info@etsc.co.za">info@etsc.co.za</a>
  <span class="hide-m">Head office: Three Rivers, Vereeniging</span>
  <div class="r"><a href="verify.html">Verify a certificate</a><a class="hide-m" href="../app/index.html#/portal">Client login</a></div>
</div></div>
<header class="nav"><div class="wrap">
  <a class="logo" href="index.html"><img src="../assets/logo-badge-400.jpg" alt="Exclusive Training and Services logo"><span><b>Exclusive Training</b><small>and Services · since 1995</small></span></a>
  <nav class="menu" id="menu">
    <a href="courses.html" class="${page==='courses'?'on':''}">Courses</a>
    <a href="index.html#onsite">On-site training</a>
    <a href="index.html#compliance">Compliance</a>
    <a href="index.html#about">About</a>
    <a href="verify.html" class="${page==='verify'?'on':''}">Verify</a>
  </nav>
  <a class="btn gold sm" href="quote.html">Get a quote</a>
  <button class="burger" id="burger" aria-label="Open menu">☰</button>
</div></header>`;

const footer = `
<footer><div class="wrap">
  <div class="cols">
    <div><a class="logo" href="index.html"><img src="../assets/logo-badge-400.jpg" alt=""><span><b style="color:#fff">Exclusive Training</b><small>and Services</small></span></a>
      <p style="margin-top:18px;max-width:320px">Accredited lifting machine, earth-moving, driving and workplace safety training, on your site or at ours, since March 1995.</p></div>
    <div><h5>Training</h5><ul><li><a href="courses.html#lift">Lift trucks</a></li><li><a href="courses.html#crane">Cranes & lifting</a></li><li><a href="courses.html#earth">Earth moving</a></li><li><a href="courses.html#hs">Health & safety</a></li><li><a href="courses.html#drive">Driving</a></li></ul></div>
    <div><h5>For clients</h5><ul><li><a href="quote.html">Request a quote</a></li><li><a href="verify.html">Verify a certificate</a></li><li><a href="../app/index.html#/portal">Client portal</a></li><li><a href="index.html#compliance">Card expiry check</a></li></ul></div>
    <div><h5>Contact</h5><ul><li><a href="tel:0861333208">086 133 3208</a></li><li><a href="mailto:info@etsc.co.za">info@etsc.co.za</a></li><li>22 Limpopo Street<br>Three Rivers, Vereeniging, 1935</li></ul></div>
  </div>
  <div class="legal"><span>© 2026 Exclusive Training and Services</span><a href="#">POPIA and privacy notice</a><a href="#">Terms of training</a><span>Accreditation numbers shown here on launch</span></div>
</div></footer>`;

document.body.insertAdjacentHTML('afterbegin', header);
document.body.insertAdjacentHTML('beforeend', footer);
document.getElementById('burger').onclick = () => document.getElementById('menu').classList.toggle('on');

const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin:'0px 0px -8% 0px' }) : null;
document.querySelectorAll('.reveal').forEach(el => io ? io.observe(el) : el.classList.add('in'));
setTimeout(() => document.querySelectorAll('.reveal').forEach(el => el.classList.add('in')), 2500);
})();
