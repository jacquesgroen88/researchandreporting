/* Sample data for the ETSC KeyOps concept demo. Every person and company here is fictional. */
window.DATA = {
stages: ['Enquiry','Quoted','Confirmed','Pre-course','In training','Assessed','Moderated','Certified','Paid'],
rates: { km: 4.85 },

courses: [
  { id:'fl-nov', code:'F1', name:'F1 Counterbalanced Lift Truck (up to 3 000 kg), Novice', short:'F1 Forklift novice', cat:'Lift Trucks', days:3, price:2650, max:12, perMachine:4, acc:'TETA accredited', us:'Unit standard 242974', machine:'Counterbalanced lift truck', cap:'Up to 3 000 kg' },
  { id:'fl-ref', code:'F1', name:'F1 Counterbalanced Lift Truck, Re-licensing', short:'F1 Re-licensing', cat:'Lift Trucks', days:1, price:1150, max:8, perMachine:4, acc:'TETA accredited', us:'Unit standard 242974', machine:'Counterbalanced lift truck', cap:'Up to 3 000 kg' },
  { id:'reach', code:'F5', name:'F5 Reach Lift Truck (up to 2 500 kg)', short:'F5 Reach truck', cat:'Lift Trucks', days:3, price:2850, max:12, perMachine:4, acc:'TETA accredited', us:'Unit standard 242972', machine:'Reach lift truck', cap:'Up to 2 500 kg' },
  { id:'ohc', code:'C30', name:'C30 Overhead Crane, Pendant and Radio Controlled', short:'C30 Overhead crane', cat:'Cranes', days:2, price:2450, max:12, perMachine:4, acc:'TETA accredited', us:'Unit standard 116235', machine:'Overhead crane, pendant and radio', cap:'As rated on site' },
  { id:'tlb', code:'', name:'Operate a Backhoe Loader (TLB)', short:'TLB operator', cat:'Earth Moving', days:5, price:5400, max:8, perMachine:4, acc:'TETA accredited', us:'Unit standard 262727', machine:'Backhoe loader', cap:'' },
  { id:'exc', code:'', name:'Operate an Excavator', short:'Excavator', cat:'Earth Moving', days:5, price:5600, max:8, perMachine:4, acc:'TETA accredited', us:'Unit standard 262744', machine:'Excavator', cap:'' },
  { id:'fa1', code:'', name:'First Aid (unit standard 119567)', short:'First aid', cat:'Health & Safety', days:2, price:1350, max:16, perMachine:16, acc:'Accredited', us:'Unit standard 119567', machine:'', cap:'' },
  { id:'fire', code:'', name:'Basic Fire Fighting', short:'Fire fighting', cat:'Health & Safety', days:1, price:950, max:16, perMachine:16, acc:'Accredited', us:'Workplace fire safety', machine:'', cap:'' },
  { id:'shrep', code:'', name:'Health & Safety Representative', short:'SHE rep', cat:'Health & Safety', days:2, price:1450, max:16, perMachine:16, acc:'Accredited', us:'OHS Act section 17', machine:'', cap:'' }
],

trainers: [
  { id:'tm', name:'Thabo Mokoena', skills:'Forklift · Reach · Overhead crane', roles:'Facilitator, assessor', reg:'Assessor reg. TETA-ASS-0412', regExp:'Mar 2028', util:86 },
  { id:'pv', name:'Pieter van Wyk', skills:'TLB · Excavator · Loader', roles:'Facilitator, assessor', reg:'Assessor reg. TETA-ASS-0388', regExp:'14 Nov 2026', regExpWarn:true, util:92 },
  { id:'sn', name:'Sipho Ndlovu', skills:'Forklift · First aid · Fire', roles:'Facilitator, assessor', reg:'Assessor reg. TETA-ASS-0521', regExp:'Aug 2027', util:74 },
  { id:'ab', name:'Annelie Botha', skills:'Moderation · H&S', roles:'Moderator, facilitator', reg:'Moderator reg. TETA-MOD-0117', regExp:'Jan 2028', util:58 }
],

machines: [
  { id:'FL-01', name:'Toyota 2.5 t counterbalanced forklift, diesel', ok:true, note:'At the centre. Free Thursday, suggested for Boksburg.' },
  { id:'FL-03', name:'Hyster 3 t counterbalanced forklift, LPG', ok:true, note:'Double booked Thursday (Kempton Park and Boksburg).' },
  { id:'TLB-01', name:'JCB 3CX tractor loader backhoe', ok:false, note:'250-hour service due in 18 hours of use. Booked with Pieter until Friday.' }
],

clients: [
  { id:'highveld', name:'Highveld Cold Chain', site:'Germiston', contact:'Naledi Khumalo', role:'HR & training officer', terms:'30-day', since:'2014', ops:42, current:36, exp90:4, spend:184200, next:'20 Oct, Forklift novice', xy:[214,128] },
  { id:'kempton', name:'Kempton Distribution Centre', site:'Kempton Park', contact:'Lerato Dlamini', role:'SHEQ manager', terms:'30-day', since:'2009', ops:118, current:111, exp90:9, spend:412600, next:'2 Nov, Re-licensing', xy:[236,98] },
  { id:'vaal', name:'Vaal Steel Fabricators', site:'Vanderbijlpark', contact:'Johan Pretorius', role:'Plant manager', terms:'30-day', since:'2003', ops:64, current:47, exp90:11, spend:226900, next:'21 Oct, Overhead crane', xy:[150,212] },
  { id:'eastrand', name:'East Rand Civils', site:'Benoni', contact:'Ayanda Mthembu', role:'Site agent', terms:'COD', since:'2021', ops:23, current:20, exp90:2, spend:98400, next:'19 Oct, TLB operator', xy:[262,118] },
  { id:'midrand', name:'Midrand Pharma Logistics', site:'Midrand', contact:'Priya Naidoo', role:'Warehouse manager', terms:'30-day', since:'2018', ops:51, current:49, exp90:6, spend:157300, next:'22 Oct, Reach truck', xy:[200,72] },
  { id:'boksburg', name:'Boksburg Paper & Board', site:'Boksburg', contact:'Willem du Toit', role:'Health & safety officer', terms:'30-day', since:'2011', ops:77, current:63, exp90:8, spend:243100, next:'22 Oct, Forklift re-licensing', xy:[246,136] }
],
towns: [ {n:'Pretoria',x:205,y:34},{n:'Midrand',x:188,y:66},{n:'Johannesburg',x:160,y:126},{n:'Kempton Park',x:238,y:90},{n:'Benoni',x:276,y:112},{n:'Germiston',x:206,y:138},{n:'Boksburg',x:250,y:146},{n:'Alberton',x:198,y:158},{n:'Krugersdorp',x:84,y:116},{n:'Springs',x:314,y:128},{n:"Vereeniging",x:204,y:212},{n:'Vanderbijlpark',x:118,y:198},{n:'Meyerton',x:204,y:184},{n:'Sasolburg',x:160,y:236} ],
base: { x:184, y:222 },

bookings: [
  { ref:'BK-2624', client:'kempton', course:'fl-ref', learners:8, when:'Requested 2 Nov', stage:0, value:0, flags:[['Website','info'],['3 min ago','gold']] },
  { ref:'BK-2622', client:'vaal', course:'tlb', learners:4, when:'Requested November', stage:0, value:0, flags:[['Phone','mute']] },
  { ref:'BK-2620', client:'midrand', course:'fa1', learners:12, when:'Quote sent 15 Oct', stage:1, value:16200, flags:[['Opened 3×','info']] },
  { ref:'BK-2619', client:'boksburg', course:'fire', learners:16, when:'Quote sent 14 Oct', stage:1, value:15200, flags:[['Not opened','warn']] },
  { ref:'BK-2617', client:'kempton', course:'reach', learners:6, when:'27 to 29 Oct', stage:2, value:18760, flags:[['PO matched','good']] },
  { ref:'BK-2611', client:'highveld', course:'fl-nov', learners:6, when:'19 to 21 Oct', stage:4, value:17282, flags:[['Day 1 of 3','gold']] },
  { ref:'BK-2615', client:'boksburg', course:'fl-ref', learners:8, when:'22 Oct', stage:3, value:10140, flags:[['2 ID copies missing','warn']] },
  { ref:'BK-2614', client:'midrand', course:'reach', learners:5, when:'22 to 24 Oct', stage:3, value:15680, flags:[['Ready','good']] },
  { ref:'BK-2609', client:'eastrand', course:'tlb', learners:4, when:'19 to 23 Oct', stage:4, value:23170, flags:[['Day 1 of 5','gold']] },
  { ref:'BK-2612', client:'vaal', course:'ohc', learners:10, when:'21 to 22 Oct', stage:3, value:26450, flags:[['Ready','good']] },
  { ref:'BK-2604', client:'vaal', course:'ohc', learners:7, when:'13 to 14 Oct', stage:5, value:18900, flags:[['Waiting 2 days','mute']] },
  { ref:'BK-2598', client:'kempton', course:'fl-ref', learners:9, when:'14 Oct', stage:6, value:11120, flags:[['Released today','good']] },
  { ref:'BK-2596', client:'highveld', course:'fire', learners:14, when:'9 Oct', stage:7, value:13300, flags:[['Invoice sent','info']] },
  { ref:'BK-2590', client:'boksburg', course:'fa1', learners:12, when:'6 to 7 Oct', stage:7, value:16200, flags:[['Day 31','bad']] },
  { ref:'BK-2581', client:'midrand', course:'fl-nov', learners:6, when:'29 Sep to 1 Oct', stage:8, value:16840, flags:[['Paid','good']] }
],

sessionsToday: [
  { ref:'BK-2611', day:1, status:'register locked 07:38, 6 of 6 present', pill:'<span class="pill good">On site</span>' },
  { ref:'BK-2609', day:1, status:'theory block, practical from 13:00', pill:'<span class="pill good">On site</span>' }
],

inbox: [
  { icon:'mail', bg:'#e8effb', fg:'#2f5fb8', t:'New enquiry: Kempton DC, 8 forklift operators', d:'From the website 3 minutes ago. 8 of them are already on file and expire this month. Quote is drafted.', href:'#/quote' },
  { icon:'alert', bg:'#fdf1e2', fg:'#b45c09', t:'2 ID copies missing for Thursday', d:'Boksburg Paper & Board, BK-2615. Willem du Toit was reminded on WhatsApp this morning.', href:'#/booking/BK-2611' },
  { icon:'check', bg:'#e5f5ed', fg:'#16865a', t:'9 certificates ready to release', d:'BK-2598 passed moderation. Release sends the pack and the invoice together.', href:'#/certificates' },
  { icon:'flag', bg:'#fbe9e6', fg:'#c2321f', t:'Pieter\'s assessor registration expires 14 Nov', d:'He has 3 bookings after that date. Renewal pack is ready to submit.', href:'#/compliance' },
  { icon:'schedule', bg:'#f8efdc', fg:'#8a6220', t:'FL-03 double booked on Thursday', d:'One click to move Boksburg to FL-01.', href:'#/schedule' },
  { icon:'rand', bg:'#fbe9e6', fg:'#c2321f', t:'Boksburg Paper & Board is on day 31', d:'INV-4389, R18 630. Second reminder went out automatically. Time for a call.', href:'#/finance' }
],

stats: { cycleDays:6, cycleBefore:24, learnersWeek:41, sitesWeek:6, oldestMod:2, debtors:186420, debtors60:22410,
  renewals90:146, renewalValue:184900, r30:38, r30v:46200, r60:71, r60v:89600, lapsed:23, learnersAll:18432, invoicedMonth:248600, quotesOut:94300 },

sources: [ {n:'Website enquiry form',v:41},{n:'Renewal reminders',v:29},{n:'Phone and email',v:22},{n:'Client portal requests',v:14},{n:'Facebook',v:6} ],
topCourses: [ {n:'Forklift re-licensing',v:146,r:167900},{n:'Forklift novice',v:88,r:233200},{n:'First aid',v:74,r:99900},{n:'Overhead crane',v:41,r:100450},{n:'TLB operator',v:19,r:102600} ],

week: [['Mon','19 Oct'],['Tue','20 Oct'],['Wed','21 Oct'],['Thu','22 Oct'],['Fri','23 Oct']],
slots: [
  { t:'tm', d:0, c:'fl-nov', where:'Highveld Cold Chain, Germiston', n:6, eq:'FL-02', ref:'BK-2611', bg:'#f8efdc', bd:'#b8862f' },
  { t:'tm', d:1, c:'fl-nov', where:'Highveld Cold Chain, Germiston', n:6, eq:'FL-02', ref:'BK-2611', bg:'#f8efdc', bd:'#b8862f' },
  { t:'tm', d:2, c:'fl-nov', where:'Highveld Cold Chain, Germiston', n:6, eq:'FL-02', ref:'BK-2611', bg:'#f8efdc', bd:'#b8862f' },
  { t:'tm', d:3, c:'reach', where:'Midrand Pharma Logistics', n:5, eq:'Client reach truck', ref:'BK-2614', bg:'#e8effb', bd:'#2f5fb8' },
  { t:'tm', d:4, c:'reach', where:'Midrand Pharma Logistics', n:5, eq:'Client reach truck', ref:'BK-2614', bg:'#e8effb', bd:'#2f5fb8' },
  ...[0,1,2,3,4].map(d => ({ t:'pv', d, c:'tlb', where:'East Rand Civils, Benoni', n:4, eq:'TLB-01', ref:'BK-2609', bg:'#efe9df', bd:'#766c60' })),
  { t:'sn', d:2, c:'ohc', where:'Vaal Steel, Vanderbijlpark', n:10, eq:'Client crane', ref:'BK-2612', bg:'#e5f5ed', bd:'#16865a' },
  { t:'sn', d:3, c:'fl-ref', where:'Boksburg Paper & Board', n:8, eq:'FL-03', ref:'BK-2615', clash:true, bg:'#fbe9e6', bd:'#c2321f' },
  { t:'sn', d:1, c:'ohc', where:'Vaal Steel, Vanderbijlpark', n:10, eq:'Client crane', ref:'BK-2612', bg:'#e5f5ed', bd:'#16865a' },
  { t:'ab', d:3, c:'fl-ref', where:'Kempton DC, assessment day', n:4, eq:'FL-03', clash:true, bg:'#fbe9e6', bd:'#c2321f' },
  { t:'ab', d:0, c:'fa1', label:'Moderation', where:'BK-2604 and BK-2598', n:16, eq:'Office, Three Rivers', bg:'#f3eee6', bd:'#9a8f82' },
  { t:'ab', d:4, c:'shrep', where:'ETSC centre, Three Rivers', n:11, eq:'Classroom', bg:'#f3eee6', bd:'#9a8f82' }
],

roster: [
  { name:'Sizwe Khumalo', idm:'******5083', job:'Picker', docs:{id:false,photo:true,medical:true,consent:true}, lit:'Passed', att:[1,null,null], theory:88, prac:null },
  { name:'Johannes Mahlangu', idm:'******5089', job:'Dispatch clerk', docs:{id:true,photo:true,medical:true,consent:true}, lit:'Passed', att:[1,null,null], theory:79, prac:null },
  { name:'Busisiwe Nkosi', idm:'******0087', job:'Stores assistant', docs:{id:true,photo:true,medical:true,consent:true}, lit:'Passed', att:[1,null,null], theory:92, prac:null },
  { name:'Kagiso Molefe', idm:'******5081', job:'Picker', docs:{id:true,photo:true,medical:true,consent:true}, lit:'Passed', att:[1,null,null], theory:81, prac:null },
  { name:'Ruan Steyn', idm:'******5085', job:'Shift supervisor', docs:{id:true,photo:true,medical:true,consent:true}, lit:'Passed', att:[1,null,null], theory:86, prac:null },
  { name:'Tshepo Radebe', idm:'******5084', job:'Picker', docs:{id:true,photo:true,medical:false,consent:true}, lit:'', att:[1,null,null], theory:null, prac:null }
],
checklist: [ 'Pre-use inspection completed and recorded', 'Correct mounting, seat belt and start-up', 'Picks up load: forks spread, centred, tilted back', 'Travels with load low, looks in direction of travel', 'Stacks and de-stacks at height safely', 'Parks: forks down, neutral, brake on, key out' ],
log: [
  { i:'✉', t:'Enquiry received from the website', w:'Naledi Khumalo asked for forklift training for 6 new pickers', d:'2 Oct, 09:14' },
  { i:'✎', t:'Quote Q-1171 sent', w:'Auto-priced: 6 × R2 650 plus travel, 41 km each way × 3 days', d:'2 Oct, 09:31' },
  { i:'✓', t:'Quote accepted online', w:'Naledi Khumalo, from the quote link', d:'3 Oct, 14:02' },
  { i:'R', t:'Purchase order PO-77314 uploaded', w:'Amount and learner count matched the quote', d:'6 Oct, 10:47' },
  { i:'▦', t:'Scheduled', w:'Thabo Mokoena and FL-02 plus the client’s own forklift, 19 to 21 Oct. Code of Practice check passed: 6 learners in theory (max 12), 3 per machine in practical (max 4)', d:'6 Oct, 10:48' },
  { i:'☺', t:'Learner list uploaded through the portal', w:'6 learners, 5 complete, 1 missing an ID copy', d:'12 Oct, 16:20' },
  { i:'✆', t:'WhatsApp reminders sent', w:'Joining instructions to 6 learners, missing-document reminder to Naledi', d:'16 Oct, 08:00' },
  { i:'⌖', t:'Day 1 register locked on site', w:'6 of 6 present, GPS confirmed at Highveld Cold Chain, Germiston', d:'Today, 07:38' }
],

moderation: [
  { ref:'BK-2604', client:'vaal', course:'ohc', assessor:'sn', learners:7, sample:'3 learners', wait:2 },
  { ref:'BK-2601', client:'midrand', course:'fa1', assessor:'sn', learners:11, sample:'3 learners', wait:1 },
  { ref:'BK-2599', client:'eastrand', course:'exc', assessor:'pv', learners:4, sample:'2 learners + 1 NYC', wait:4 },
  { ref:'BK-2597', client:'boksburg', course:'fl-nov', assessor:'tm', learners:8, sample:'2 learners', wait:1 }
],
certSample: { name:'Mpho Sithole', idm:'******5087', course:'fl-nov', no:'ETSC-26-04117', issued:'19 Oct 2026', expires:'19 Oct 2028', remind:'July 2028', machine:'Counterbalanced lift truck', capacity:'Up to 3.5 t', restrict:'None', attach:'Side-shift' },

renewals: [
  { client:'kempton', course:'fl-ref', n:9, exp:'31 Oct 2026', s:['Quote accepted','good'] },
  { client:'boksburg', course:'fl-ref', n:12, exp:'4 Nov 2026', s:['Reminder opened','info'] },
  { client:'vaal', course:'ohc', n:11, exp:'9 Nov 2026', s:['Lapses in 21 days','warn'] },
  { client:'highveld', course:'fl-ref', n:4, exp:'18 Nov 2026', s:['Reminder sent','info'] },
  { client:'midrand', course:'reach', n:6, exp:'2 Dec 2026', s:['Quote ready','gold'] },
  { client:'eastrand', course:'tlb', n:2, exp:'14 Dec 2026', s:['Quote ready','gold'] },
  { client:'boksburg', course:'fa1', n:8, exp:'10 Jan 2027', s:['Reminder in 3 weeks','mute'] }
],
register: [
  { n:'Mpho Sithole', c:'fl-ref', no:'ETSC-26-04117', e:'19 Oct 2028', s:['Current','good'] },
  { n:'Andile Zulu', c:'fl-nov', no:'ETSC-25-02210', e:'12 Mar 2027', s:['Current','good'] },
  { n:'Grace Mokwena', c:'reach', no:'ETSC-24-03391', e:'8 Dec 2026', s:['Expires in 50 days','warn'] },
  { n:'Lucky Masilela', c:'fl-ref', no:'ETSC-24-03128', e:'31 Oct 2026', s:['Renewal booked','info'] },
  { n:'Petrus Venter', c:'ohc', no:'ETSC-24-02877', e:'2 Sep 2026', s:['Lapsed','bad'] },
  { n:'Nomsa Mabena', c:'fa1', no:'ETSC-25-01744', e:'20 May 2028', s:['Current','good'] }
],
learners: [
  { n:'Mpho Sithole', id:'******5087', c:'kempton', k:'Forklift novice 2024, re-licensing 2026', last:'19 Oct 2026', s:['Current','good'] },
  { n:'Grace Mokwena', id:'******0082', c:'midrand', k:'Reach truck', last:'8 Dec 2024', s:['Expires in 50 days','warn'] },
  { n:'Petrus Venter', id:'******5086', c:'vaal', k:'Overhead crane, first aid', last:'2 Sep 2024', s:['Lapsed','bad'] },
  { n:'Andile Zulu', id:'******5080', c:'highveld', k:'Forklift novice', last:'12 Mar 2025', s:['Current','good'] },
  { n:'Nomsa Mabena', id:'******0086', c:'boksburg', k:'First aid, fire fighting', last:'20 May 2025', s:['Current','good'] },
  { n:'Bongani Shabalala', id:'******5088', c:'eastrand', k:'TLB, excavator', last:'3 Jul 2025', s:['Current','good'] },
  { n:'Lucky Masilela', id:'******5082', c:'kempton', k:'Forklift novice', last:'31 Oct 2024', s:['Renewal booked','info'] }
],
history: [
  { c:'Lift Truck Operator, Re-licensing', d:'19 Oct 2026', no:'ETSC-26-04117', s:['Current','good'] },
  { c:'Lift Truck Operator, Novice', d:'22 Oct 2024', no:'ETSC-24-03302', s:['Re-licensed','mute'] },
  { c:'Basic Fire Fighting', d:'5 Mar 2025', no:'ETSC-25-00911', s:['Current','good'] }
],
invoices: [
  { no:'INV-4417', ref:'BK-2598', c:'kempton', a:11120, due:'18 Nov 2026', s:['Sent today','info'] },
  { no:'INV-4412', ref:'BK-2596', c:'highveld', a:13300, due:'12 Nov 2026', s:['Opened','info'] },
  { no:'INV-4389', ref:'BK-2590', c:'boksburg', a:18630, due:'Overdue 1 day', s:['Call today','bad'] },
  { no:'INV-4371', ref:'BK-2581', c:'midrand', a:16840, due:'Paid 16 Oct', s:['Paid','good'] },
  { no:'INV-4366', ref:'BK-2577', c:'vaal', a:22410, due:'Overdue 34 days', s:['Statement sent','warn'] }
],
ageing: [ ['Current',142780], ['30 days',21230,'#d4a94e'], ['60 days',22410,'#b45c09'], ['90+ days',0,'#c2321f'] ],
accred: [
  { n:'TETA accreditation', d:'Lifting machine operator training, scope covers forklift, reach truck and overhead crane', s:['Valid','good'] },
  { n:'Department of Employment and Labour approval', d:'Approved lifting machine training provider under DMR 18(11)', s:['Valid','good'] },
  { n:'QCTO accreditation', d:'Required for every provider after 30 June 2027. Application checklist 7 of 12 items done', s:['In progress','warn'] },
  { n:'Quarterly learner record submission', d:'Q3 2026 file generated from certificates, 412 learners', s:['Submitted','good'] },
  { n:'Machine service records', d:'3 training machines, 1 service due in 18 hours of use', s:['1 due','warn'] }
],

tour: [
  { stage:'Enquiry', route:'#/today', spot:'#todayInbox', title:'It starts on the new website', text:'A SHEQ manager at a distribution centre asks for 8 forklift operators. The enquiry lands in KeyOps with the course, head count and site filled in, and it already knows those 8 people expire this month.' },
  { stage:'Quote', route:'#/quote', spot:'#quotePrev', title:'A priced quote in under two minutes', text:'Course price, on-site travel and VAT are calculated for you. KeyOps checks the Code of Practice ratios and trainer availability before the quote leaves. Change the learners or distance and watch it re-price.' },
  { stage:'Confirmed', route:'#/pipeline', spot:'#board', title:'Every booking on one board', text:'The client accepts online and uploads the PO through their portal. When the amount matches, the booking confirms itself and moves along. Nobody re-types anything.' },
  { stage:'Scheduled', route:'#/schedule', spot:'#clash', title:'Clashes caught before they cost you', text:'Trainers, training machines and venues are scheduled together. Here KeyOps spotted one forklift booked at two sites on Thursday and suggested the fix.' },
  { stage:'Pre-course', route:'#/booking/BK-2611?tab=learners', spot:'#bkBody', title:'No surprises at the gate on day one', text:'The client uploads the learner list. KeyOps checks ID copies, medical fitness and POPIA consent, and chases what is missing by WhatsApp, so the trainer never drives 40 km to an incomplete class.' },
  { stage:'Training', route:'#/field', spot:'#phone1', title:'The paper register is gone', text:'Learners sign in on the trainer\'s phone each morning. Time, GPS and signature are stored against the booking.' },
  { stage:'Assessment', route:'#/field', spot:'#phone2', title:'Practical assessment, captured live', text:'The assessor works through the practical checklist with photo and video evidence. The portfolio of evidence builds itself while the course is still running.' },
  { stage:'Moderation', route:'#/moderation', spot:'#modTable', title:'The certificate bottleneck, cleared', text:'KeyOps picks the moderation sample per assessor and puts the evidence side by side. Batches that waited weeks for a paper file now wait a day or two.' },
  { stage:'Certificate', route:'#/certificates', spot:'#certDoc', title:'Certificates that cannot be faked', text:'Certificate and operator card are generated from the booking with every field the Code of Practice requires. Releasing them also sends the invoice, updates the SETA upload file and the client\'s compliance register.' },
  { stage:'Verify', route:'#/verify', spot:'#vOut', title:'Anyone can check it in two seconds', text:'Fake operator certificates are sold openly online. A site manager or mine gate scans the QR code and sees whether the certificate is real and still valid.' },
  { stage:'Client', route:'#/portal', spot:'#portalFrame', title:'Your clients serve themselves', text:'Their HR or SHEQ manager books, uploads lists and POs, downloads certificates and pulls a spend report for their B-BBEE file. Fewer calls to your office, and a reason to stay with you.' },
  { stage:'Renewal', route:'#/renewals', spot:'#renewTable', title:'The repeat business you already earned', text:'Your carry cards run for 24 months, with 90 days’ grace before the operator must redo the full course. KeyOps reminds the client months ahead and prepares the renewal quote, so the next booking comes back to you instead of the cheapest advert on Google.' }
]
};

/* Fill the per-booking details the demo screens read. */
(function(D){
  const tr = { 'fl-nov':'tm','fl-ref':'sn','reach':'tm','ohc':'sn','tlb':'pv','exc':'pv','fa1':'sn','fire':'sn','shrep':'ab' };
  D.bookings.forEach((b,i) => Object.assign(b, {
    trainer: tr[b.course], assessor: tr[b.course], quote: 'Q-' + (1150 + i), po: 'PO-' + (77300 + i*7), quoteSent: '2 Oct 2026',
    equipment: 'FL-02 plus client forklift', equipNote: 'Both pre-use inspected 19 Oct', dayDates: []
  }));
  Object.assign(D.bookings.find(b => b.ref === 'BK-2611'), {
    quote:'Q-1171', po:'PO-77314', quoteSent:'2 Oct 2026', dayDates:['Mon 19 Oct','Tue 20 Oct','Wed 21 Oct'],
    equipment:'FL-02 plus the client’s forklift', equipNote:'Both pre-use inspected at 07:12 today'
  });
})(window.DATA);
