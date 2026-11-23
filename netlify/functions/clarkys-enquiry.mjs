// Clarky's website enquiry -> Clarky's Group sub-account in the ReviewTap system (GoHighLevel).
// Called by the booking form on /clarkys-3jnk57/v2/. The private key lives ONLY in the Netlify env var
// CLARKYS_GHL_PIT, never in the page. Everything else below is an id, not a secret.
// Source of truth for this file: JCE Media/clients/Clarkys (Mission Control). Added 23 Nov 2026.

const API = 'https://services.leadconnectorhq.com';
const LOCATION = 'fiV6ZaXLbxJpSuSXa8S7';
const PIPELINE = '98DfMR7VwuvtLjtfL3Jl';          // "Enquiries"
const STAGE_NEW = '021bf6a5-6cdd-46b3-95b0-e62934f2f789';
const F = {                                          // contact custom fields
  property: 'A4HpsV6QcLrHAWrYCjuD', cottage: 'bSwdg8A4x9whzy5XvfHC', arrive: 'U5cAL7jMVDue3JCx6hQR',
  depart: 'Je2pnGyoko0GqAo7mlhd', adults: 'nv3Hu0TYHCrQ2oqR3BOU', kids: 'Ibshd3fsRyMF3BgW0obm',
  dog: 'TnncNH9PyFcM3UtdNL9P', dinner: 'AzPmdcM5RZ0DSBDNJPjW', pub: 'U20jFw7jbPeepq9DxjgN',
  meal: 'gEIr2zU9T6GPpvllKldX', time: 'N56dCgSmDpETy52rytzI', seat: 'I9RXlwoI2u456Aa0qY5U', notes: 'xYfYidcv30ZvUHrBEur7',
};
const PLACE = { bucketlist: 'Bucketlist Cottages', lakeside: 'Lakeside Restaurant', pride: "Clarky's Pride" };
const COTTAGES = ['No preference', 'Starlight Serenity', 'Woodland Whisper', 'Meadow Mist', 'Starlight Serenity and Meadow Mist together'];

const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
const clip = (v, n = 200) => String(v ?? '').trim().slice(0, n);
const isoDate = (v) => (/^\d{4}-\d{2}-\d{2}$/.test(v || '') ? v : '');

function phone(v) {
  const d = String(v || '').replace(/\D/g, '');
  if (d.length === 10 && d.startsWith('0')) return '+27' + d.slice(1);
  if (d.length === 11 && d.startsWith('27')) return '+' + d;
  return d.length >= 9 ? '+' + d : '';
}

async function ghl(method, path, body) {
  const r = await fetch(API + path, {
    method,
    headers: {
      Authorization: 'Bearer ' + process.env.CLARKYS_GHL_PIT,
      Version: '2021-07-28', 'Content-Type': 'application/json', Accept: 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  let data; try { data = JSON.parse(text); } catch { data = { raw: text.slice(0, 300) }; }
  if (!r.ok) console.error('GHL', method, path, r.status, text.slice(0, 300));
  return { ok: r.ok, status: r.status, data };
}

export default async (req) => {
  if (req.method !== 'POST') return json(405, { error: 'POST only' });
  if (!process.env.CLARKYS_GHL_PIT) return json(500, { error: 'not configured' });
  let d; try { d = await req.json(); } catch { return json(400, { error: 'bad json' }); }
  if (d.website) return json(200, { ok: true });                 // honeypot: bots fill the hidden field

  const prop = PLACE[d.property] ? d.property : 'bucketlist';
  const name = clip(d.name, 80), tel = phone(d.phone);
  if (!name || !tel) return json(400, { error: 'name and phone required' });
  const [first, ...rest] = name.split(/\s+/);
  const arrive = isoDate(d.arrive), depart = isoDate(d.depart);
  const yes = (v) => (v ? 'Yes' : 'No');

  const cf = [
    [F.property, PLACE[prop]],
    [F.cottage, COTTAGES.includes(String(d.cottage || '').replace(/ \(sleeps 2\)$/, '')) ? String(d.cottage).replace(/ \(sleeps 2\)$/, '') : ''],
    [F.arrive, arrive], [F.depart, depart],
    [F.adults, d.guests ? +d.guests || '' : ''], [F.kids, d.kids !== undefined ? +d.kids || 0 : ''],
    [F.dog, prop !== 'lakeside' ? yes(d.dog) : ''], [F.dinner, prop === 'bucketlist' ? yes(d.dinner) : ''],
    [F.pub, prop === 'pride' ? yes(d.pub) : ''],
    [F.meal, ['Breakfast', 'Lunch', 'Dinner'].includes(d.time) ? d.time : ''],
    [F.time, clip(d.clock, 10)], [F.seat, ['No preference', 'Inside', 'Outside'].includes(d.seat) ? d.seat : ''],
    [F.notes, clip(d.message, 2000)],
  ].filter(([, v]) => v !== '' && v !== undefined).map(([id, field_value]) => ({ id, field_value }));

  // 1. Contact. Upsert matches an existing guest by phone. No tags here: upsert REPLACES the tag list.
  const up = await ghl('POST', '/contacts/upsert', {
    locationId: LOCATION, firstName: first, lastName: rest.join(' '), name, phone: tel, source: 'Website', customFields: cf,
  });
  const contactId = up.data?.contact?.id;
  if (!contactId) return json(502, { error: 'contact failed' });

  // 2. Tags (this endpoint adds, it never removes).
  const type = prop === 'lakeside' ? 'enquiry-table' : 'enquiry-stay';
  await ghl('POST', `/contacts/${contactId}/tags`, { tags: [prop, type, 'source-website'] });

  // 3. A card on the Enquiries board, stage New.
  const when = prop === 'lakeside' ? arrive : [arrive, depart].filter(Boolean).join(' to ');
  const opp = await ghl('POST', '/opportunities/', {
    locationId: LOCATION, pipelineId: PIPELINE, pipelineStageId: STAGE_NEW, contactId, status: 'open',
    name: [name, PLACE[prop], when].filter(Boolean).join(' · '), source: 'Website',
  });

  // 4. The whole enquiry as a readable note, so the guest's own words are on the contact.
  const lines = [
    `Website enquiry: ${PLACE[prop]}`,
    d.cottage && d.cottage !== 'No preference' ? `Cottage: ${clip(d.cottage, 80)}` : '',
    arrive ? `${prop === 'lakeside' ? 'Date' : 'Arrive'}: ${arrive}` : '', depart ? `Depart: ${depart}` : '',
    d.time ? `Meal: ${clip(d.time, 20)}${d.clock ? ' at ' + clip(d.clock, 10) : ''}` : '',
    d.seat && d.seat !== 'No preference' ? `Seating: ${clip(d.seat, 20)}` : '',
    `Adults: ${clip(d.guests, 4) || '?'}${+d.kids ? `, children: ${clip(d.kids, 4)}` : ''}`,
    d.dog ? 'Bringing a dog' : '', d.dinner ? 'Also wants a dinner table at Lakeside' : '', d.pub ? 'Wants a table at the pub' : '',
    d.message ? `Message: ${clip(d.message, 2000)}` : '',
    opp.ok ? '' : `(Board card not created: ${opp.status}. Add it by hand.)`,
  ].filter(Boolean);
  await ghl('POST', `/contacts/${contactId}/notes`, { body: lines.join('\n') });

  return json(200, { ok: true });
};
