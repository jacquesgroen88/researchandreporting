/* ETSC KeyOps concept demo. All data is sample data held in data.js; nothing is saved. */
(function(){
const D = window.DATA;
const $ = s => document.querySelector(s);
const view = $('#view');
const R = n => 'R' + Math.round(n).toLocaleString('en-ZA').replace(/,/g,' ');
const STAGES = D.stages;
const course = id => D.courses.find(c => c.id === id);
const client = id => D.clients.find(c => c.id === id);
const trainer = id => D.trainers.find(t => t.id === id);
const booking = ref => D.bookings.find(b => b.ref === ref);
const ini = n => n.split(' ').map(x => x[0]).slice(0,2).join('');
const COLORS = ['#8a6220','#2f5fb8','#16865a','#9b3d8f','#c2321f','#5b6b2f','#1f7a8c','#7a4b2a'];
const colorOf = s => COLORS[[...s].reduce((a,c)=>a+c.charCodeAt(0),0) % COLORS.length];
const av = (n, size) => `<span class="av" style="background:${colorOf(n)}${size?`;width:${size}px;height:${size}px`:''}">${ini(n)}</span>`;
const pill = (t, k='mute') => `<span class="pill ${k}">${t}</span>`;
const stagePill = s => pill(STAGES[s], ['mute','info','info','warn','gold','gold','warn','good','good'][s] || 'mute');

/* ---------- nav ---------- */
const NAV = [
  ['Run the business', [['today','◎','Today'],['pipeline','▤','Pipeline',D.bookings.length],['schedule','▦','Schedule'],['quote','✎','Quote builder']]],
  ['Deliver training', [['booking/BK-2611','❖','Live booking'],['field','▢','Trainer app'],['moderation','✓','Moderation',D.moderation.length],['certificates','✦','Certificates']]],
  ['Grow & protect', [['renewals','↻','Renewals'],['clients','◇','Clients'],['learners','☺','Learner register'],['finance','R','Finance'],['compliance','⚑','Provider compliance']]],
  ['What others see', [['portal','⌂','Client portal'],['verify','⌕','Verify a certificate']]]
];
function renderNav(route){
  $('#nav').innerHTML = NAV.map(([h, items]) => `<div class="nav-h">${h}</div>` + items.map(([r,i,l,ct]) =>
    `<a class="nav-a ${route.startsWith(r.split('/')[0]) && (r.indexOf('/')<0 || route===r) ? 'on':''}" href="#/${r}"><i>${i}</i>${l}${ct?`<span class="ct">${ct}</span>`:''}</a>`).join('')).join('');
}

/* ---------- small builders ---------- */
function kpi(l, v, d, cls='', id=''){ return `<div class="card kpi ${cls}" ${id?`id="${id}"`:''}><div class="l">${l}</div><div class="v">${v}</div>${d?`<div class="d">${d}</div>`:''}</div>`; }
function qr(seed){
  let x = [...seed].reduce((a,c)=>a*31+c.charCodeAt(0),7) >>> 0; const cells=[];
  const finder=(r,c)=>{for(const [fr,fc] of [[0,0],[0,14],[14,0]]){const rr=r-fr,cc=c-fc;if(rr>=0&&rr<7&&cc>=0&&cc<7){return rr===0||rr===6||cc===0||cc===6||(rr>=2&&rr<=4&&cc>=2&&cc<=4)?1:0;} }return -1;};
  for(let r=0;r<21;r++)for(let c=0;c<21;c++){const f=finder(r,c);if(f>=0){cells.push(f);continue;}x=(x*1103515245+12345)>>>0;cells.push((x>>16)&1);}
  return `<div class="qr">${cells.map(k=>`<i class="${k?'k':''}"></i>`).join('')}</div>`;
}
function stepper(s){ return `<div class="stepper">${STAGES.map((n,i)=>`<div class="st ${i<s?'done':i===s?'now':''}"><div class="b">${i<s?'✓':i+1}</div>${n}</div>`).join('')}</div>`; }

/* ---------- views ---------- */
const V = {};

V.today = () => {
  const s = D.stats;
  return `
  <div class="ph"><div><div class="eyebrow">Monday 19 October 2026</div><h1>Good morning, Elize</h1><p>${D.sessionsToday.length} classes running on client sites today, ${s.learnersWeek} learners in training this week.</p></div>
  <div class="acts"><a class="btn ghost" href="#/schedule">Open schedule</a><a class="btn dark" href="#/pipeline">Pipeline</a></div></div>
  <div class="grid g5" id="kpis">
    ${kpi('Enquiry to certificate', s.cycleDays+' days', `<span style="color:#d9c9a8">target once registers, PoEs and moderation are digital</span>`,'hero')}
    ${kpi('Learners in training this week', s.learnersWeek, `<span class="muted">across ${s.sitesWeek} client sites</span>`)}
    ${kpi('Awaiting moderation', D.moderation.reduce((a,m)=>a+m.learners,0), `<span class="warn">oldest batch ${s.oldestMod} days</span>`)}
    ${kpi('Owed to you', R(s.debtors), `<span class="down">${R(s.debtors60)} over 60 days</span>`)}
    ${kpi('Operators due for renewal (90 days)', s.renewals90, `<span class="up">${R(s.renewalValue)} of repeat work</span>`,'', 'kpiRenew')}
  </div>
  <div class="split mt">
    <div class="card" id="todayRoad">
      <div class="card-h"><h3>On the road today</h3><span class="sub">Live from trainer phones</span></div>
      <div style="padding:16px 20px">${gautengMap()}</div>
      ${D.sessionsToday.map(x => { const b = booking(x.ref), c = client(b.client), t = trainer(b.trainer);
        return `<a class="list-i" href="#/booking/${b.ref}"><div class="who">${av(t.name)}</div><div><b>${course(b.course).short} · ${c.name}</b><p>${t.name} · ${c.site} · Day ${x.day} of ${course(b.course).days} · ${x.status}</p></div><div class="r">${x.pill}</div></a>`;}).join('')}
    </div>
    <div class="card" id="todayInbox">
      <div class="card-h"><h3>Needs you today</h3><span class="pill gold">${D.inbox.length}</span></div>
      ${D.inbox.map(i => `<a class="list-i" href="${i.href}"><div class="ic" style="background:${i.bg};color:${i.fg}">${i.icon}</div><div><b>${i.t}</b><p>${i.d}</p></div></a>`).join('')}
    </div>
  </div>
  <div class="grid g3 mt">
    <div class="card pad"><h3>Where bookings come from <span class="more">30 days</span></h3>${D.sources.map(x=>`<div class="mt" style="margin-top:12px"><div class="flex small"><b>${x.n}</b><span class="right muted">${x.v} enquiries</span></div><div class="bar" style="margin-top:6px"><i style="width:${x.v/D.sources[0].v*100}%"></i></div></div>`).join('')}</div>
    <div class="card pad"><h3>Courses booked this quarter</h3>${D.topCourses.map(x=>`<div class="flex" style="margin-top:11px"><span style="flex:1">${x.n}</span><b>${x.v}</b><span class="muted small" style="width:70px;text-align:right">${R(x.r)}</span></div>`).join('')}</div>
    <div class="card pad"><h3>Trainer utilisation <span class="more">this week</span></h3>${D.trainers.map(t=>`<div class="flex" style="margin-top:11px"><div class="who">${av(t.name,26)}</div><span style="flex:1;font-size:13px">${t.name}</span><div class="bar" style="width:90px"><i style="width:${t.util}%"></i></div><b class="small" style="width:36px;text-align:right">${t.util}%</b></div>`).join('')}</div>
  </div>`;
};

function gautengMap(){
  const pins = D.sessionsToday.map(x => { const c = client(booking(x.ref).client); return c.xy; });
  return `<div class="map"><svg viewBox="0 0 400 250" role="img" aria-label="Map of today's sessions">
  <defs><pattern id="g" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="#e2dacd" stroke-width=".6"/></pattern></defs>
  <rect width="400" height="250" fill="url(#g)"/>
  <path d="M60 40 L170 18 L300 30 L360 80 L372 150 L330 215 L210 236 L95 220 L40 160 L34 95Z" fill="#f7f2ea" stroke="#d8ccb9" stroke-width="1.5"/>
  <path d="M70 120 C140 105 220 128 350 110" stroke="#e5dccd" stroke-width="5" fill="none"/>
  <path d="M190 20 C185 90 200 160 205 236" stroke="#e5dccd" stroke-width="5" fill="none"/>
  ${D.towns.map(t=>`<g><circle cx="${t.x}" cy="${t.y}" r="2.4" fill="#b5a892"/><text x="${t.x+5}" y="${t.y+3.5}" font-size="9" fill="#8d806c" font-family="Manrope" font-weight="600">${t.n}</text></g>`).join('')}
  <g><circle cx="${D.base.x}" cy="${D.base.y}" r="8" fill="#14110d"/><text x="${D.base.x}" y="${D.base.y+3}" font-size="8" text-anchor="middle" fill="#d4a94e" font-weight="800">E</text><text x="${D.base.x-12}" y="${D.base.y+4}" text-anchor="end" font-size="9.5" fill="#14110d" font-weight="800" font-family="Manrope">ETSC, Three Rivers</text></g>
  ${pins.map((p,i)=>`<g><line x1="${D.base.x}" y1="${D.base.y}" x2="${p[0]}" y2="${p[1]}" stroke="#b8862f" stroke-width="1.2" stroke-dasharray="3 3"/><circle cx="${p[0]}" cy="${p[1]}" r="11" fill="rgba(212,169,78,.25)"/><circle cx="${p[0]}" cy="${p[1]}" r="5.5" fill="#b8862f" stroke="#fff" stroke-width="2"/></g>`).join('')}
  </svg></div>`;
}

V.pipeline = () => {
  const cols = STAGES.map((n,i) => ({n, i, items: D.bookings.filter(b => b.stage === i)}));
  return `<div class="ph"><div><div class="eyebrow">Every booking, one board</div><h1>Pipeline</h1><p>From the first enquiry to the paid invoice. Cards move on their own as trainers, assessors and clients do their part.</p></div>
  <div class="acts"><button class="btn ghost" data-toast="Filters: course, client, trainer, SETA">Filter</button><a class="btn gold" href="#/quote">+ New quote</a></div></div>
  <div class="board" id="board">${cols.map(c => `<div class="col"><div class="col-h"><b>${c.n}</b><span class="n">${c.items.length}</span><span class="val">${R(c.items.reduce((a,b)=>a+b.value,0))}</span></div>
    ${c.items.map(b => { const cl = client(b.client), co = course(b.course);
      return `<a class="bk ${b.ref==='BK-2611'?'hl':''}" href="#/booking/${b.ref}"><div class="c">${cl.name}</div><div class="s">${co.short} · ${b.learners} learners</div><div class="s">${b.when}</div>
      <div class="m">${(b.flags||[]).map(f=>pill(f[0],f[1])).join('')}<span class="ref">${b.ref}</span></div></a>`; }).join('')}</div>`).join('')}</div>`;
};

V.booking = (ref) => {
  const b = booking(ref) || booking('BK-2611'); const c = client(b.client), co = course(b.course), t = trainer(b.trainer), as = trainer(b.assessor);
  const L = D.roster;
  const tab = (location.hash.split('?tab=')[1]) || 'learners';
  const tabs = [['learners','Learners & documents',L.length],['attendance','Attendance register'],['assessment','Assessment'],['finance','Quote, PO & invoice'],['log','Audit trail']];
  const docsDone = L.filter(l => Object.values(l.docs).every(Boolean)).length;
  let body = '';
  if (tab === 'learners') body = `
    <div class="note" style="margin-bottom:14px"><b>${docsDone} of ${L.length} learners are ready.</b> The client's HR officer uploaded the list through the portal. KeyOps chased the missing items by WhatsApp on Friday and again this morning, so nobody stands at the gate on day one without an ID copy.</div>
    <div class="card tw"><table class="t"><thead><tr><th>Learner</th><th>ID copy</th><th>Photo</th><th>Medical fitness</th><th>POPIA consent</th><th>Literacy check</th><th>Status</th></tr></thead><tbody>
    ${L.map(l => `<tr class="click" data-learner="${l.name}"><td><div class="who">${av(l.name)}<div><b>${l.name}</b><small>ID ${l.idm} · ${l.job}</small></div></div></td>
      ${['id','photo','medical','consent'].map(k=>`<td><span class="chk ${l.docs[k]?'y':'n'}">${l.docs[k]?'✓':'!'}</span></td>`).join('')}
      <td>${l.lit ? pill(l.lit,'good') : pill('Pending','warn')}</td>
      <td>${Object.values(l.docs).every(Boolean) ? pill('Ready','good') : pill('Chased 2×','warn')}</td></tr>`).join('')}
    </tbody></table></div>`;
  if (tab === 'attendance') body = `
    <div class="note" style="margin-bottom:14px"><b>No paper register.</b> Each learner signs on the trainer's phone at the start and end of every day. Time, GPS location and signature are stored against the booking, ready for a SETA verifier or a Department of Employment and Labour inspector.</div>
    <div class="card tw"><table class="t"><thead><tr><th>Learner</th>${[...Array(co.days)].map((_,i)=>`<th>Day ${i+1}<br><span style="text-transform:none;letter-spacing:0;font-weight:600">${b.dayDates[i]||''}</span></th>`).join('')}</tr></thead><tbody>
    ${L.map(l => `<tr><td><div class="who">${av(l.name)}<b>${l.name}</b></div></td>${[...Array(co.days)].map((_,i)=> { const a = l.att[i];
      return `<td>${a===1?`<div class="sig">${l.name.split(' ')[0]} ${l.name.split(' ')[1][0]}.</div><small class="muted">07:${String(31+((l.name.length*7+i*3)%25)).padStart(2,'0')} · on site</small>`: a===0?pill('Absent','bad'):`<span class="muted small">Not yet</span>`}</td>`;}).join('')}</tr>`).join('')}
    </tbody></table></div>`;
  if (tab === 'assessment') body = `
    <div class="grid g3" style="margin-bottom:14px">${kpi('Theory test average', '84%', 'Pass mark 75%')}${kpi('Practical assessments', `${L.filter(l=>l.prac).length} of ${L.length}`, 'Captured on the trainer app')}${kpi('Assessor', as.name, as.reg)}</div>
    <div class="card tw"><table class="t"><thead><tr><th>Learner</th><th>Theory</th><th>Pre-use inspection</th><th>Load handling</th><th>Stacking at height</th><th>Travel & parking</th><th>Outcome</th></tr></thead><tbody>
    ${L.map(l => `<tr><td><div class="who">${av(l.name)}<b>${l.name}</b></div></td><td><b>${l.theory?l.theory+'%':'–'}</b></td>${(l.prac||[null,null,null,null]).map(p=>`<td>${p===null?'<span class="muted small">Day 3</span>':`<span class="chk ${p?'y':'n'}">${p?'C':'NYC'}</span>`}</td>`).join('')}
      <td>${l.prac? (l.prac.every(Boolean)?pill('Competent','good'):pill('Re-assess','warn')) : pill('Scheduled','mute')}</td></tr>`).join('')}
    </tbody></table></div>`;
  if (tab === 'finance') body = `<div class="grid g3">
    <div class="card pad"><div class="eyebrow">Quote</div><h3 style="margin-top:6px">${b.quote} · ${pill('Accepted','good')}</h3><p class="sub mt" style="margin-top:8px">Sent ${b.quoteSent}. Opened 4 times. Accepted online by ${c.contact}.</p><div class="mt" style="font-size:22px;font-weight:800">${R(b.value)}</div><p class="sub">${b.learners} learners × ${R(co.price)} + on-site travel</p></div>
    <div class="card pad"><div class="eyebrow">Purchase order</div><h3 style="margin-top:6px">${b.po} · ${pill('Matched','good')}</h3><p class="sub" style="margin-top:8px">Uploaded by ${c.contact} through the client portal. Amount and learner count match the quote, so the booking confirmed itself.</p></div>
    <div class="card pad"><div class="eyebrow">Invoice</div><h3 style="margin-top:6px">Drafts on certification</h3><p class="sub" style="margin-top:8px">The invoice is prepared now and sends automatically the moment certificates are released, with the certificate pack attached. ${c.terms} terms, reminders on day 25 and 31.</p></div></div>`;
  if (tab === 'log') body = `<div class="card">${D.log.map(e=>`<div class="list-i"><div class="ic" style="background:#f3eee6">${e.i}</div><div><b>${e.t}</b><p>${e.w}</p></div><div class="r small muted">${e.d}</div></div>`).join('')}</div>`;
  return `
  <div class="ph"><div><div class="eyebrow">${b.ref} · ${co.cat}</div><h1>${co.name}</h1><p>${c.name} · ${c.site} · ${b.when} · ${b.learners} learners</p></div>
  <div class="acts"><button class="btn ghost" data-toast="Joining instructions re-sent to ${c.contact} and all learners by WhatsApp">Re-send joining instructions</button><a class="btn gold" href="#/field">Open trainer app</a></div></div>
  <div class="card pad" id="stepperCard">${stepper(b.stage)}</div>
  <div class="grid g4 mt">
    <div class="card pad"><div class="eyebrow">Client</div><div class="who mt" style="margin-top:8px">${av(c.contact)}<div><b>${c.contact}</b><small>${c.role} · ${c.name}</small></div></div></div>
    <div class="card pad"><div class="eyebrow">Facilitator</div><div class="who" style="margin-top:8px">${av(t.name)}<div><b>${t.name}</b><small>${t.reg}</small></div></div></div>
    <div class="card pad"><div class="eyebrow">Equipment</div><b style="display:block;margin-top:8px">${b.equipment}</b><small class="muted">${b.equipNote}</small></div>
    <div class="card pad"><div class="eyebrow">Accreditation</div><b style="display:block;margin-top:8px">${co.acc}</b><small class="muted">${co.us}</small></div>
  </div>
  <div class="tabs mt2">${tabs.map(([k,l,ct])=>`<a class="tab ${tab===k?'on':''}" href="#/booking/${b.ref}?tab=${k}">${l}${ct?`<span class="ct">${ct}</span>`:''}</a>`).join('')}</div>
  <div id="bkBody">${body}</div>`;
};

V.schedule = () => {
  const days = D.week;
  return `<div class="ph"><div><div class="eyebrow">Week of 19 October</div><h1>Schedule</h1><p>Trainers, training machines and the centre in one view. Clashes and expired registrations are caught before they reach a client site.</p></div>
  <div class="acts"><button class="btn ghost" data-toast="Suggested: Thabo, Thu 22 Oct, FL-02 free, 34 km from client">Find me a slot</button><a class="btn gold" href="#/quote">+ Book</a></div></div>
  <div class="note" id="clash" style="margin-bottom:14px"><b>1 clash found.</b> Training forklift FL-03 is booked at Kempton Park and Boksburg on Thursday. Suggested fix: send FL-01 to Boksburg, it is free and already serviced.</div>
  <div class="tw"><div class="sched">
    <div class="hd">Trainer</div>${days.map(d=>`<div class="hd">${d[0]}<small>${d[1]}</small></div>`).join('')}
    ${D.trainers.map(t => `<div class="rs"><div class="who">${av(t.name,28)}<div><b>${t.name}</b><small>${t.skills}</small></div></div></div>` +
      days.map((d,di) => `<div>${D.slots.filter(s=>s.t===t.id && s.d===di).map(s=>{const co=course(s.c);return `<div class="blk ${s.clash?'conf':''}" style="background:${s.bg};border-color:${s.bd}" ${s.ref?`data-go="#/booking/${s.ref}"`:''}><b>${s.label||co.short}</b>${s.where}<br><span class="muted">${s.n} learners · ${s.eq}</span></div>`}).join('')}</div>`).join('')).join('')}
  </div></div>
  <div class="grid g3 mt">${D.machines.map(m=>`<div class="card pad"><div class="flex"><b>${m.id}</b>${m.ok?pill('Serviced','good'):pill('Service due','warn')}</div><p class="sub" style="margin-top:4px">${m.name}</p><p class="small" style="margin-top:8px">${m.note}</p></div>`).join('')}</div>`;
};

V.quote = () => {
  const co = D.courses;
  return `<div class="ph"><div><div class="eyebrow">Website enquiry · 3 minutes ago</div><h1>Quote builder</h1><p>The enquiry arrived from the new website with the course, head count and site already filled in. Pricing, travel and validity are worked out for you.</p></div></div>
  <div class="split">
    <div class="card pad" id="quoteForm">
      <div class="grid g2">
        <label><span class="sub">Client</span><select class="inp" id="qClient">${D.clients.map(c=>`<option value="${c.id}" ${c.id==='kempton'?'selected':''}>${c.name}</option>`).join('')}</select></label>
        <label><span class="sub">Course</span><select class="inp" id="qCourse">${co.map(c=>`<option value="${c.id}" ${c.id==='fl-ref'?'selected':''}>${c.name}</option>`).join('')}</select></label>
        <label><span class="sub">Learners</span><input class="inp" id="qN" type="number" min="1" value="8"></label>
        <label><span class="sub">Where</span><select class="inp" id="qWhere"><option value="site">On site at client</option><option value="centre">At ETSC training centre</option></select></label>
        <label><span class="sub">Distance from ETSC (km, one way)</span><input class="inp" id="qKm" type="number" value="38"></label>
        <label><span class="sub">Preferred start</span><input class="inp" id="qDate" value="Mon 2 Nov 2026"></label>
      </div>
      <div class="mt2"><div class="eyebrow">Checks KeyOps ran</div>
        <div class="list-i" style="padding:10px 0"><span class="chk y">✓</span><div><b>Class size within ratio</b><p id="qRatio"></p></div></div>
        <div class="list-i" style="padding:10px 0"><span class="chk y">✓</span><div><b>Trainer and machine available</b><p>Thabo Mokoena, FL-01 and FL-02 are free 2 to 3 November. His assessor registration covers this unit standard.</p></div></div>
        <div class="list-i" style="padding:10px 0"><span class="chk y">✓</span><div><b>8 of these learners are already on file</b><p>Their certificates from October 2024 expire this month, so this is quoted as a refresher, not a novice course.</p></div></div>
      </div>
    </div>
    <div class="card" id="quotePrev" style="overflow:hidden">
      <div style="background:var(--night);color:#fff;padding:20px 22px"><div class="eyebrow" style="color:var(--gold2)">Quotation Q-1192</div><div class="serif" style="font-size:26px;font-weight:700;margin-top:4px">Exclusive Training and Services</div><div class="small" style="color:#bfb39f">Valid 30 days · prepared for <span id="qcName"></span></div></div>
      <div style="padding:18px 22px"><table class="t" id="qLines"></table>
      <div class="flex mt" style="border-top:2px solid var(--ink);padding-top:12px"><b>Total excl. VAT</b><b class="right" id="qTotal" style="font-size:22px"></b></div>
      <p class="sub" style="margin-top:4px" id="qVat"></p>
      <div class="flex mt2"><button class="btn gold" data-toast="Quote sent by email and WhatsApp. You will see when it is opened.">Send quote</button><button class="btn ghost" data-toast="PDF downloaded">PDF</button></div></div>
    </div>
  </div>`;
};
function bindQuote(){
  const f = () => { const c = course($('#qCourse').value), n = +$('#qN').value||1, km = +$('#qKm').value||0, site = $('#qWhere').value==='site';
    const cl = client($('#qClient').value);
    const travel = site ? Math.round(km*2*c.days*D.rates.km) : 0;
    const lines = [[`${c.name} (${c.days} day${c.days>1?'s':''})`, `${n} × ${R(c.price)}`, n*c.price]];
    if (site) lines.push([`On-site travel, ${km} km each way × ${c.days} day${c.days>1?'s':''}`, `${km*2*c.days} km × R${D.rates.km.toFixed(2)}`, travel]);
    lines.push(['Certificate and operator card per learner','Included',0]);
    const tot = lines.reduce((a,l)=>a+l[2],0);
    $('#qLines').innerHTML = lines.map(l=>`<tr><td>${l[0]}<br><small class="muted">${l[1]}</small></td><td class="num"><b>${l[2]?R(l[2]):'–'}</b></td></tr>`).join('');
    $('#qTotal').textContent = R(tot); $('#qVat').textContent = `VAT ${R(tot*.15)} · total ${R(tot*1.15)}`; $('#qcName').textContent = cl.name;
    const mach = Math.ceil(n/c.perMachine); $('#qRatio').textContent = (n <= c.max ? `Theory: ${n} learners, the Code of Practice allows ${c.max} per facilitator.` : `${n} learners is over the ${c.max} theory maximum, so KeyOps splits this into ${Math.ceil(n/c.max)} groups.`) + (c.machine ? ` Practical: ${mach} machine${mach>1?'s':''} needed at ${c.perMachine} learners each.` : '');
  };
  ['#qCourse','#qN','#qWhere','#qKm','#qClient'].forEach(s=>$(s).addEventListener('input',f)); f();
}

V.field = () => {
  const b = booking('BK-2611'), co = course(b.course), L = D.roster;
  return `<div class="ph"><div><div class="eyebrow">What the trainer carries</div><h1>Trainer app</h1><p>Runs on the trainer's own phone, works without signal on a factory floor and syncs when it can. This is the end of paper registers, loose checklists and photographed ID copies on WhatsApp.</p></div></div>
  <div class="phones">
    <div class="phone" id="phone1"><div class="screen"><div class="notch"><span>07:34</span><span>● Offline · 3 queued</span></div>
      <div class="ph-top"><small>Day 1 of ${co.days} · Sign in</small><b>${client(b.client).name}</b><span class="small" style="color:#bfb39f">${co.short} · ${client(b.client).site}</span></div>
      <div class="ph-body">${L.map((l,i)=>`<div class="ph-row">${av(l.name,32)}<div><b style="font-size:13px">${l.name}</b><div class="small muted">${l.att[0]===1?'Signed 07:3'+i:'Waiting'}</div></div><div class="r"><div class="tog ${l.att[0]===1?'on':''}" data-tog></div></div></div>`).join('')}
      <button class="btn gold" style="width:100%;justify-content:center;margin-top:6px" data-toast="Register locked for Day 1 with GPS and time stamp">Lock today's register</button></div></div></div>
    <div class="phone" id="phone2"><div class="screen"><div class="notch"><span>11:05</span><span>● Synced</span></div>
      <div class="ph-top"><small>Practical assessment · Day 3</small><b>${L[0].name}</b><span class="small" style="color:#bfb39f">${co.us}</span></div>
      <div class="ph-body">${D.checklist.map((q,i)=>`<div class="crit"><div class="q">${i+1}. ${q}</div><div class="opts"><button class="${i<5?'c':''}" data-opt>Competent</button><button data-opt>Not yet</button></div></div>`).join('')}
      <div class="crit"><div class="q">Evidence</div><div class="flex" style="margin-top:8px"><span class="pill info">📷 3 photos</span><span class="pill info">🎥 40s video</span></div></div>
      <button class="btn dark" style="width:100%;justify-content:center" data-toast="Assessment signed by assessor and learner, sent to moderation">Sign off assessment</button></div></div></div>
  </div>`;
};

V.moderation = () => `<div class="ph"><div><div class="eyebrow">Quality gate before any certificate</div><h1>Moderation</h1><p>Every assessed batch waits here for the moderator. KeyOps picks the sample, shows the evidence side by side, and releases certificates the moment it is signed.</p></div></div>
  <div class="grid g3">${kpi('Batches waiting', D.moderation.length, '')}${kpi('Average wait', '1.6 days', 'Target, against weeks for paper files')}${kpi('Sample rule', '25% per assessor', 'Minimum 2 learners, all NYC results')}</div>
  <div class="card mt" id="modTable"><div class="card-h"><h3>Queue</h3></div><div class="tw"><table class="t"><thead><tr><th>Batch</th><th>Course</th><th>Assessor</th><th class="num">Learners</th><th>Sample</th><th>Waiting</th><th></th></tr></thead><tbody>
  ${D.moderation.map((m,i)=>`<tr><td><b>${m.ref}</b><br><small class="muted">${client(booking(m.ref)?.client||m.client)?.name||''}</small></td><td>${course(m.course).short}</td><td>${trainer(m.assessor).name}</td><td class="num">${m.learners}</td><td>${m.sample}</td><td>${m.wait>3?pill(m.wait+' days','warn'):pill(m.wait+' day'+(m.wait>1?'s':''),'mute')}</td>
  <td>${i===0?`<button class="btn gold xs" data-mod>Moderate</button>`:`<button class="btn ghost xs" data-mod>Open</button>`}</td></tr>`).join('')}</tbody></table></div></div>`;

V.certificates = () => {
  const l = D.certSample, co = course(l.course);
  return `<div class="ph"><div><div class="eyebrow">Released by moderation · BK-2598</div><h1>Certificates & operator cards</h1><p>Generated from the booking, never retyped. Each one carries a QR code that anyone can scan to confirm it is genuine.</p></div>
  <div class="acts"><button class="btn ghost" data-toast="9 cards sent to the card printer">Print 9 cards</button><button class="btn gold" data-toast="Certificate pack and invoice INV-4417 emailed to Lerato Dlamini">Release to client</button></div></div>
  <div class="split">
    <div class="cert" id="certDoc">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;position:relative;z-index:1">
        <img src="../assets/logo-badge-400.jpg" alt="" style="width:15%;border-radius:50%">
        <div style="width:13%">${qr(l.no)}</div></div>
      <div class="small" style="margin-top:2%">Certificate of competence</div>
      <div class="cname" style="margin-top:1.5%">${l.name}</div>
      <p style="text-align:center;font-size:clamp(9px,1.15vw,13px);margin-top:1.5%">ID ${l.idm} has been assessed and found competent in</p>
      <div class="serif" style="text-align:center;font-size:clamp(14px,2vw,22px);font-weight:700;margin-top:1%">${co.name}</div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:1% 2%;margin:2.2% 6% 0;font-size:clamp(7px,.9vw,10.5px);text-align:center;position:relative">
        ${[['Machine code',co.code||'–'],['Machine',l.machine],['Capacity',co.cap||'–'],['Attachments',l.attach],['Restrictions',l.restrict],['Unit standard',co.us.replace('Unit standard ','')],['Card valid to',l.expires],['Assessor reg.','TETA-ASS-0412']].map(f=>`<div><div style="color:#8d806c;letter-spacing:.08em;text-transform:uppercase;font-size:.85em">${f[0]}</div><b>${f[1]}</b></div>`).join('')}</div>
      <p style="text-align:center;font-size:clamp(7px,.9vw,10.5px);color:#5b5145;margin-top:1.6%">Driven Machinery Regulations 2015, regulation 18(11), Occupational Health and Safety Act 85 of 1993 · Provider accreditation no. on file</p>
      <div style="display:flex;justify-content:space-between;position:absolute;left:8%;right:8%;bottom:9%;font-size:clamp(7px,.95vw,11px)">
        <div><div class="sig">T. Mokoena</div>Assessor</div><div style="text-align:center"><b>${l.no}</b><br>Issued ${l.issued} · Card valid to ${l.expires}</div><div style="text-align:right"><div class="sig">A. Botha</div>Moderator</div></div>
    </div>
    <div>
      <div class="opcard" id="opCard"><div style="display:flex;gap:14px;position:relative">
        <div style="width:72px;height:90px;border-radius:8px;background:linear-gradient(160deg,#5b4b37,#2b2219);display:grid;place-items:center;font-size:26px;font-weight:800;color:var(--gold2)">${ini(l.name)}</div>
        <div style="flex:1"><div style="font-size:9.5px;letter-spacing:.16em;color:var(--gold2);font-weight:800">OPERATOR CARD</div><div style="font-weight:800;font-size:16px;margin-top:4px">${l.name}</div><div style="font-size:11px;color:#bfb39f">ID ${l.idm}</div>
        <div style="font-size:11.5px;margin-top:8px;line-height:1.4">${co.short}<br><span style="color:#bfb39f">Valid to ${l.expires}</span></div></div>
        <div style="width:64px">${qr(l.no+'c')}</div></div>
        <div style="position:absolute;left:20px;right:20px;bottom:14px;display:flex;justify-content:space-between;font-size:10px;color:#bfb39f"><span>Exclusive Training and Services</span><span>${l.no}</span></div></div>
      <div class="card pad mt"><h3>What happened when this was released</h3>
        ${['PDF certificate stored on the learner\'s permanent record','Operator card queued for the card printer','Learner achievement queued for the SETA upload file','Client compliance register updated (Kempton DC is now 94% current)','Re-evaluation reminder set for '+l.remind,'Invoice INV-4417 sent with the certificate pack'].map(x=>`<div class="flex" style="margin-top:10px"><span class="chk y">✓</span><span>${x}</span></div>`).join('')}</div>
    </div>
  </div>`;
};

V.renewals = () => `<div class="ph"><div><div class="eyebrow">Repeat work you already earned</div><h1>Renewals</h1><p>Your own rule: a carry card is valid for 24 months, with 90 days to re-license before the operator must redo the full course. Every certificate you issue has that date built in. KeyOps turns each one into a reminder for the client and a ready quote for you, months before it lapses.</p></div>
  <div class="acts"><button class="btn gold" data-toast="12 renewal quotes prepared for review">Prepare 12 renewal quotes</button></div></div>
  <div class="grid g4">${kpi('Expiring in 30 days', D.stats.r30, R(D.stats.r30v),'hero')}${kpi('Expiring in 60 days', D.stats.r60, R(D.stats.r60v))}${kpi('Expiring in 90 days', D.stats.renewals90, R(D.stats.renewalValue))}${kpi('Lapsed, inside 90-day grace', D.stats.lapsed, '<span class="down">after that, the full course again</span>')}</div>
  <div class="card mt" id="renewTable"><div class="tw"><table class="t"><thead><tr><th>Client</th><th>Course</th><th class="num">Operators</th><th>Earliest expiry</th><th class="num">Value</th><th>Status</th></tr></thead><tbody>
  ${D.renewals.map(r=>`<tr><td><b>${client(r.client).name}</b><br><small class="muted">${client(r.client).contact}</small></td><td>${course(r.course).short}</td><td class="num">${r.n}</td><td>${r.exp}</td><td class="num"><b>${R(r.n*course(r.course).price)}</b></td><td>${pill(r.s[0],r.s[1])}</td></tr>`).join('')}</tbody></table></div></div>`;

V.clients = () => `<div class="ph"><div><div class="eyebrow">Corporate accounts</div><h1>Clients</h1><p>Every site you train at, with its own compliance picture.</p></div></div>
  <div class="card tw"><table class="t"><thead><tr><th>Client</th><th>Area</th><th class="num">Operators on file</th><th>Compliance</th><th class="num">Spend this year</th><th>Next booking</th></tr></thead><tbody>
  ${D.clients.map(c=>{const p=Math.round(c.current/c.ops*100);return `<tr class="click" data-go="#/client/${c.id}"><td><div class="who">${av(c.name)}<div><b>${c.name}</b><small>${c.contact} · ${c.role}</small></div></div></td><td>${c.site}</td><td class="num">${c.ops}</td><td style="min-width:150px"><div class="flex"><div class="bar" style="flex:1"><i style="width:${p}%;${p<80?'background:var(--warn)':''}"></i></div><b class="small">${p}%</b></div></td><td class="num">${R(c.spend)}</td><td>${c.next}</td></tr>`}).join('')}</tbody></table></div>`;

V.client = (id) => {
  const c = client(id) || D.clients[0]; const p = Math.round(c.current/c.ops*100);
  return `<div class="ph"><div><div class="eyebrow">${c.site}</div><h1>${c.name}</h1><p>${c.contact}, ${c.role} · ${c.terms} terms · client since ${c.since}</p></div>
  <div class="acts"><button class="btn ghost" data-toast="Skills development report for ${c.name} exported (WSP/ATR format)">Export skills report</button><a class="btn gold" href="#/portal">View their portal</a></div></div>
  <div class="grid g4"><div class="card pad flex" style="gap:18px"><div class="ring" style="--p:${p}"><div><div><b>${p}%</b><small>current</small></div></div></div><div class="small"><b>${c.current}</b> of ${c.ops} operators hold a valid certificate</div></div>
  ${kpi('Expiring in 90 days', c.exp90, 'Renewal quote ready')}${kpi('Lapsed', c.ops-c.current-c.exp90>0?c.ops-c.current-c.exp90:0, 'Flagged to the client')}${kpi('Spend this year', R(c.spend), 'For their skills development scorecard')}</div>
  <div class="card mt"><div class="card-h"><h3>Operator register</h3><span class="sub">What their SHEQ manager sees</span></div><div class="tw"><table class="t"><thead><tr><th>Operator</th><th>Equipment</th><th>Certificate</th><th>Re-evaluate by</th><th>Status</th></tr></thead><tbody>
  ${D.register.map(r=>`<tr><td><div class="who">${av(r.n)}<b>${r.n}</b></div></td><td>${course(r.c).short}</td><td>${r.no}</td><td>${r.e}</td><td>${pill(r.s[0],r.s[1])}</td></tr>`).join('')}</tbody></table></div></div>`;
};

V.learners = () => `<div class="ph"><div><div class="eyebrow">Every person you have ever trained</div><h1>Learner register</h1><p>Every learner since 1995 in one place, searchable by name, ID number, client or certificate. ID numbers are masked and access is logged for POPIA.</p></div></div>
  <div class="card tw"><table class="t"><thead><tr><th>Learner</th><th>Employer</th><th>Certificates</th><th>Latest</th><th>Status</th></tr></thead><tbody>
  ${D.learners.map(l=>`<tr class="click" data-learner="${l.n}"><td><div class="who">${av(l.n)}<div><b>${l.n}</b><small>ID ${l.id}</small></div></div></td><td>${client(l.c).name}</td><td>${l.k}</td><td>${l.last}</td><td>${pill(l.s[0],l.s[1])}</td></tr>`).join('')}</tbody></table></div>`;

V.finance = () => `<div class="ph"><div><div class="eyebrow">Quotes to cash</div><h1>Finance</h1><p>Invoices go out the moment certificates are released, so nothing waits for month end. Syncs to your accounting package.</p></div></div>
  <div class="grid g4">${kpi('Invoiced this month', R(D.stats.invoicedMonth), '<span class="up">▲ 18% on September</span>')}${kpi('Quotes out', R(D.stats.quotesOut), '7 quotes, 3 opened today')}${kpi('Owed to you', R(D.stats.debtors), '')}${kpi('Average days to pay', '27', 'On 30-day terms')}</div>
  <div class="split mt"><div class="card"><div class="card-h"><h3>Invoices</h3></div><div class="tw"><table class="t"><thead><tr><th>Invoice</th><th>Client</th><th class="num">Amount</th><th>Due</th><th>Status</th></tr></thead><tbody>
  ${D.invoices.map(i=>`<tr><td><b>${i.no}</b><br><small class="muted">${i.ref}</small></td><td>${client(i.c).name}</td><td class="num"><b>${R(i.a)}</b></td><td>${i.due}</td><td>${pill(i.s[0],i.s[1])}</td></tr>`).join('')}</tbody></table></div></div>
  <div class="card pad"><h3>Debtor ageing</h3>${D.ageing.map(a=>`<div style="margin-top:14px"><div class="flex small"><b>${a[0]}</b><span class="right">${R(a[1])}</span></div><div class="bar" style="margin-top:6px"><i style="width:${a[1]/D.ageing[0][1]*100}%;${a[2]?`background:${a[2]}`:''}"></i></div></div>`).join('')}
  <p class="sub mt">Statements and polite reminders go out automatically. You only see the ones that need a phone call.</p></div></div>`;

V.compliance = () => `<div class="ph"><div><div class="eyebrow">Your own accreditation, always audit-ready</div><h1>Provider compliance</h1><p>The SETA can arrive for a site visit with a week's notice. Everything a verifier asks for lives here, current, with expiry warnings.</p></div>
  <div class="acts"><button class="btn gold" data-toast="Audit pack (PDF, 46 pages) generated">Generate audit pack</button></div></div>
  <div class="grid g2">
    <div class="card"><div class="card-h"><h3>Facilitators, assessors and moderators</h3></div>${D.trainers.map(t=>`<div class="list-i"><div class="who">${av(t.name)}</div><div><b>${t.name}</b><p>${t.roles} · ${t.reg}</p></div><div class="r">${t.regExpWarn?pill('Expires '+t.regExp,'warn'):pill('Valid to '+t.regExp,'good')}</div></div>`).join('')}</div>
    <div class="card"><div class="card-h"><h3>Accreditation and scope</h3></div>${D.accred.map(a=>`<div class="list-i"><div class="ic" style="background:var(--gold-lt);color:var(--gold-dk)">⚑</div><div><b>${a.n}</b><p>${a.d}</p></div><div class="r">${pill(a.s[0],a.s[1])}</div></div>`).join('')}</div>
  </div>`;

V.portal = () => {
  const c = client('highveld');
  return `<div class="ph"><div><div class="eyebrow">What your clients log into</div><h1>Client portal</h1><p>Their HR or SHEQ manager books, uploads learner lists and purchase orders, and downloads certificates without phoning or emailing your office.</p></div></div>
  <div class="portal-frame" id="portalFrame"><div class="browser-bar"><i></i><i></i><i></i><div class="url">🔒 clients.etsc.co.za/highveld-cold-chain</div></div>
  <div style="padding:22px 26px;background:var(--bg)">
    <div class="flex" style="flex-wrap:wrap"><div><div class="eyebrow">Welcome back</div><div class="serif" style="font-size:30px;font-weight:700">${c.contact}</div><div class="sub">${c.name} · ${c.site}</div></div><div class="right flex"><button class="btn ghost" data-toast="Upload learner list (Excel or photo of a list)">Upload learner list</button><button class="btn gold" data-toast="Request sent to ETSC, you will get a quote within the hour">Request training</button></div></div>
    <div class="grid g4 mt2">${kpi('Operators certified', c.current+' of '+c.ops,'')}${kpi('Expiring in 90 days', c.exp90, 'Renewal booked for 2 Nov')}${kpi('Training spend this year', R(c.spend), 'Download for your B-BBEE file')}${kpi('Next course', '20 Oct', 'Forklift novice, 6 learners')}</div>
    <div class="grid g2 mt">
      <div class="card"><div class="card-h"><h3>Your bookings</h3></div>${D.bookings.filter(b=>b.client==='highveld').map(b=>`<div class="list-i"><div><b>${course(b.course).short}</b><p>${b.when} · ${b.learners} learners</p></div><div class="r">${stagePill(b.stage)}</div></div>`).join('')}
        <div class="list-i"><div><b>Action needed: 1 ID copy missing</b><p>Sizwe Khumalo, upload before 07:30 Tuesday</p></div><div class="r"><button class="btn gold xs" data-toast="Upload opened">Upload</button></div></div></div>
      <div class="card"><div class="card-h"><h3>Certificates</h3><span class="more small" style="margin-left:auto;font-weight:700;color:var(--gold-dk)">Download all</span></div>${D.register.slice(0,5).map(r=>`<div class="list-i"><div><b>${r.n}</b><p>${course(r.c).short} · ${r.no}</p></div><div class="r">${pill(r.s[0],r.s[1])}</div></div>`).join('')}</div>
    </div></div></div>`;
};

V.verify = () => `<div class="ph"><div><div class="eyebrow">Public page · verify.etsc.co.za</div><h1>Verify a certificate</h1><p>Fake operator certificates are common. Anyone, a site manager, a mine gate or an insurer, can scan the QR code or type the number and see the truth in two seconds.</p></div></div>
  <div class="portal-frame" style="max-width:760px"><div class="browser-bar"><i></i><i></i><i></i><div class="url">🔒 verify.etsc.co.za</div></div>
  <div style="padding:34px;background:linear-gradient(160deg,#1f1b16,#14110d);color:#fff;text-align:center">
    <svg viewBox="0 0 64 24" style="width:70px;color:var(--gold2)"><circle cx="10" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2.6"/><rect x="18" y="10.6" width="38" height="2.8" rx="1.4" fill="currentColor"/><path d="M44 13.4h3v6h-3zM50 13.4h3v4h-3z" fill="currentColor"/></svg>
    <div class="serif" style="font-size:30px;font-weight:700;margin-top:8px">Is this certificate genuine?</div>
    <div class="flex" style="max-width:440px;margin:18px auto 0"><input id="vIn" class="inp" style="flex:1;height:44px" value="${D.certSample.no}"><button class="btn gold" style="height:44px" id="vBtn">Verify</button></div>
    <div id="vOut" style="margin-top:22px"></div></div></div>`;
function bindVerify(){
  const go = () => { const v = $('#vIn').value.trim().toUpperCase(); const l = D.certSample, co = course(l.course);
    $('#vOut').innerHTML = v === l.no ? `<div style="background:#fff;color:var(--ink);border-radius:14px;padding:20px;text-align:left;max-width:460px;margin:0 auto"><div class="flex"><span class="pill good" style="font-size:13px">✓ Valid certificate</span><span class="right small muted">${l.no}</span></div>
      <div class="who mt">${av(l.name,44)}<div><b style="font-size:17px">${l.name}</b><small>ID ending ${l.idm.slice(-4)}</small></div></div>
      <dl class="kv mt"><dt>Competent in</dt><dd>${co.name}</dd><dt>Issued</dt><dd>${l.issued}</dd><dt>Re-evaluate by</dt><dd>${l.expires}</dd><dt>Issued by</dt><dd>Exclusive Training and Services</dd></dl></div>`
      : `<div style="background:#fff;color:var(--ink);border-radius:14px;padding:20px;max-width:460px;margin:0 auto"><span class="pill bad" style="font-size:13px">✕ No certificate with this number</span><p class="sub" style="margin-top:8px">This number was not issued by Exclusive Training and Services. Please contact us on 086 133 3208.</p></div>`; };
  $('#vBtn').addEventListener('click', go); go();
}

/* ---------- learner drawer ---------- */
function openLearner(name){
  const l = D.roster.find(x=>x.name===name) || D.learners.find(x=>x.n===name); const n = l.name||l.n;
  $('#drawer').innerHTML = `<div class="dh"><div class="who">${av(n,48)}<div><b style="font-size:18px">${n}</b><small>ID ${l.idm||l.id} · masked, access logged</small></div></div><button class="right icon-btn" id="dClose">✕</button></div>
  <div class="db"><div class="eyebrow">Training history</div>${D.history.map(h=>`<div class="list-i" style="padding:12px 0"><div class="ic" style="background:var(--gold-lt);color:var(--gold-dk)">✦</div><div><b>${h.c}</b><p>${h.d} · ${h.no}</p></div><div class="r">${pill(h.s[0],h.s[1])}</div></div>`).join('')}
  <div class="eyebrow mt2">Documents on file</div><div class="flex mt" style="flex-wrap:wrap">${['ID copy','Photo','Medical fitness','POPIA consent','Theory test','Practical checklist','PoE'].map(x=>pill('📄 '+x,'mute')).join('')}</div>
  <div class="note mt2">One learner, one record, for life. When ${n.split(' ')[0]} moves to a new employer, the new employer can verify the certificate and book a refresher without starting over.</div></div>`;
  $('#drawer').classList.add('on'); $('#drawerBg').classList.add('on'); $('#dClose').onclick = closeDrawer;
}
function closeDrawer(){ $('#drawer').classList.remove('on'); $('#drawerBg').classList.remove('on'); }
$('#drawerBg').onclick = closeDrawer;

/* ---------- router ---------- */
function toast(t){ const el=$('#toast'); el.textContent=t; el.classList.add('on'); clearTimeout(toast.t); toast.t=setTimeout(()=>el.classList.remove('on'),2600); }
function render(){
  const h = location.hash.replace(/^#\//,'') || 'today';
  const [path] = h.split('?'); const [name, arg] = path.split('/');
  const fn = V[name] || V.today;
  view.innerHTML = fn(arg); renderNav(path); window.scrollTo(0,0);
  if (name === 'quote') bindQuote();
  if (name === 'verify') bindVerify();
  $('#side').classList.remove('on');
  if (tourOn) applySpot();
}
document.addEventListener('click', e => {
  const t = e.target.closest('[data-toast]'); if (t) { e.preventDefault(); toast(t.dataset.toast); }
  const g = e.target.closest('[data-go]'); if (g) location.hash = g.dataset.go;
  const l = e.target.closest('[data-learner]'); if (l) openLearner(l.dataset.learner);
  const tg = e.target.closest('[data-tog]'); if (tg) { tg.classList.toggle('on'); }
  const o = e.target.closest('[data-opt]'); if (o) { const p=o.parentElement; [...p.children].forEach(x=>x.className=''); o.className = o===p.children[0]?'c':'x'; }
  const m = e.target.closest('[data-mod]'); if (m) { toast('Moderated: sample of 3 approved, 9 certificates released'); setTimeout(()=>location.hash='#/certificates',900); }
});
$('#menuBtn').onclick = () => $('#side').classList.toggle('on');
$('#newBtn').onclick = () => location.hash = '#/quote';
document.addEventListener('keydown', e => { if (e.key === '/' && document.activeElement.tagName !== 'INPUT') { e.preventDefault(); $('#q').focus(); } if (e.key==='Escape') closeDrawer(); });
$('#q').addEventListener('keydown', e => { if (e.key === 'Enter') { const v = e.target.value.toLowerCase(); const l = [...D.roster.map(x=>x.name), ...D.learners.map(x=>x.n)].find(n=>n.toLowerCase().includes(v)); if (l) openLearner(l); else if (v.startsWith('etsc') || v.startsWith('ec-')) location.hash='#/verify'; else toast('Try a learner name, e.g. "Thabo"'); }});

/* ---------- guided tour ---------- */
const TOUR = D.tour; let ti = 0, tourOn = false;
function applySpot(){ document.querySelectorAll('.spot').forEach(x=>x.classList.remove('spot')); const s = TOUR[ti]; if (!s.spot) return; setTimeout(()=>{ const el = document.querySelector(s.spot); if (el){ el.classList.add('spot'); el.scrollIntoView({block:'center',behavior:'smooth'}); } }, 60); }
function showTour(){ const s = TOUR[ti]; tourOn = true; $('#tour').hidden = false;
  $('#tourStep').textContent = `Step ${ti+1} of ${TOUR.length} · ${s.stage}`; $('#tourTitle').textContent = s.title; $('#tourText').textContent = s.text;
  $('#tourDots').innerHTML = TOUR.map((_,i)=>`<i class="${i===ti?'on':''}"></i>`).join('');
  $('#tourPrev').style.visibility = ti ? 'visible' : 'hidden'; $('#tourNext').textContent = ti === TOUR.length-1 ? 'Finish' : 'Next →';
  if (location.hash !== s.route) location.hash = s.route; else applySpot(); }
$('#tourBtn').onclick = () => { ti = 0; showTour(); };
$('#tourNext').onclick = () => { if (ti < TOUR.length-1) { ti++; showTour(); } else endTour(); };
$('#tourPrev').onclick = () => { if (ti) { ti--; showTour(); } };
$('#tourClose').onclick = endTour;
function endTour(){ tourOn = false; $('#tour').hidden = true; document.querySelectorAll('.spot').forEach(x=>x.classList.remove('spot')); }

window.addEventListener('hashchange', render);
render();
if (/[?&]tour=1/.test(location.search)) { ti = 0; showTour(); }
})();
