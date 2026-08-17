/* ============================================================================
   RE/MAX Coastal prototype — real data pulled from their live sources
   Listings + agent photos: remaxcoastal.co.za / cdn.remax.co.za (15 Aug 2026)
   Videos: youtube.com/@remaxcoastalknysna (16 Aug 2026)
   Ratings: Google Business Profiles (14 Aug 2026)
   ========================================================================== */

/* ---- CONFIG -------------------------------------------------------------
   ONE place to change the demo wiring.
   GHL_WEBHOOK: paste an Inbound Webhook URL from a GoHighLevel workflow.
   Leave empty to run in demo mode (form still shows the full experience).
   ------------------------------------------------------------------------ */
const CONFIG = {
  GHL_WEBHOOK: '',                       // e.g. https://services.leadconnectorhq.com/hooks/xxxx/webhook-trigger/yyyy
  WHATSAPP: '27795124292',       // Jacques's mobile for the live demo
  WHATSAPP_TEXT: "Hi RE/MAX Coastal, I'm enquiring about a property on your website.",
  DEMO_BANNER: true
};

const OFFICES = [
  { town:'Knysna',     phone:'+27 44 382 5722', tel:'+27443825722',
    addr:'Waterside Shopping Centre, Union Street, Knysna',
    rating:4.6, reviews:26, map:'https://www.google.com/maps/search/?api=1&query=RE%2FMAX%20Coastal%20-%20Knysna&query_place_id=ChIJkwmgkS2jeB4RgEmFRlMS2O0' },
  { town:'Sedgefield', phone:'+27 44 343 1905', tel:'+27443431905',
    addr:'1 Hooper Building, 28 Main Service Road, Sedgefield',
    rating:3.9, reviews:7,
    map:'https://www.google.com/maps/search/?api=1&query=RE%2FMAX%20Coastal%20-%20Sedgefield&query_place_id=ChIJ05OVWjCjeB4RYCTfexY7Zns' },
  { town:'Wilderness', phone:'+27 44 877 0042', tel:'+27448770042',
    addr:'198 George Street, Wilderness',
    rating:4.0, reviews:5,
    map:'https://www.google.com/maps/search/?api=1&query=REMAX%20Coastal%20Wilderness&query_place_id=ChIJFyVtqa0d1h0RR8lO7Ktn0Ho' },
  { town:'Mossel Bay', phone:'+27 44 008 5092', tel:'+27440085092',
    addr:'Unit 13, Diaz Office Park, Beach Boulevard West, Mossel Bay',
    rating:5.0, reviews:6,
    map:'https://www.google.com/maps/search/?api=1&query=REMAX%20Coastal%20Mosselbay&query_place_id=ChIJs_ttuZhp1h0Rhu2Wmr8f9GY' }
];

const LISTINGS = [
 {
  "ref": "RCMB-0207",
  "price": 3990000,
  "beds": 2,
  "baths": 2,
  "type": "House",
  "suburb": "Hartland Lifestyle Estate",
  "town": "Hartenbos",
  "erf": 886,
  "floor": 157,
  "rates": 700,
  "agent": "John John",
  "head": "Coastal Retirement Living in Hartland Lifestyle Estate",
  "desc": "This two-bedroom, two-bathroom residence offers comfortable living in the sought-after Hartland Lifestyle Estate, located in Hartenbos near the coast. The property comprises 157 square metres of well-designed living space set on an 886 square metre erf, providing a practical balance between indoor comfort and outdoor potential. The home features a functional kitchen, dining room, and lounge area designed for everyday living and entertaining. The two bedrooms provide adequate accommodation, whilst the two bathrooms ensure convenience for the household.",
  "img": "https://cdn.remax.co.za/listings/73646553/original/7853d62a-9b99-b45a-98b3-b0f730c887dc.jpg",
  "imgs": [
   "https://cdn.remax.co.za/listings/73646553/original/7853d62a-9b99-b45a-98b3-b0f730c887dc.jpg",
   "https://cdn.remax.co.za/listings/73646553/original/f5cca0bb-297d-7a68-193e-682fbd6538b8.jpg",
   "https://cdn.remax.co.za/listings/73646553/original/9d59a5b2-13f6-de35-75e8-ab7366c85809.jpg",
   "https://cdn.remax.co.za/listings/73646553/original/b9dcdcc0-a681-13cb-6d77-8d8d1f220e91.jpg",
   "https://cdn.remax.co.za/listings/73646553/original/f6b02e3f-6678-25a1-d0cf-2e8cf6fcc02a.jpg",
   "https://cdn.remax.co.za/listings/73646553/original/c50be17a-be11-b728-a36e-d673fa5d9e68.jpg",
   "https://cdn.remax.co.za/listings/73646553/original/af0b22bf-7b17-2b61-6608-d1022ea895b8.jpg",
   "https://cdn.remax.co.za/listings/73646553/original/d5f915f3-e966-e326-391f-f2d91e8b4c27.jpg",
   "https://cdn.remax.co.za/listings/73646553/original/3eab7db4-e2af-7e9f-59d7-44d26bd3ee87.jpg",
   "https://cdn.remax.co.za/listings/73646553/original/ec78abe0-65f1-03ac-9238-43fadb131f3e.jpg"
  ],
  "href": "https://remaxcoastal.co.za/property/for-sale/south-africa/western-cape/hartenbos/hartland-lifestyle-estate/2-bedroom-house-for-sale-73646553"
 },
 {
  "ref": "RCMB-0209",
  "price": 3350000,
  "beds": 5,
  "baths": 3,
  "type": "House",
  "suburb": "Fraaiuitsig",
  "town": "Klein Brak Rivier",
  "erf": 840,
  "floor": 0,
  "rates": 1500,
  "agent": "Lilanie",
  "head": "Distinguished Residence Offering Exceptional Family Living and Dual-Income Potential",
  "desc": "This distinguished five-bedroom residence in Fraaiuitsig presents a sophisticated sanctuary for discerning families seeking generous accommodation coupled with remarkable mountain and valley vistas. Positioned in a tranquil coastal setting proximate to Klein Brak River's acclaimed Blue Flag beaches, the property exemplifies contemporary family living with considerable versatility and investment potential.",
  "img": "https://cdn.remax.co.za/listings/73932117/original/c92ba6d2-10c5-63c6-1c3d-f0f11906e762.jpg",
  "imgs": [
   "https://cdn.remax.co.za/listings/73932117/original/c92ba6d2-10c5-63c6-1c3d-f0f11906e762.jpg",
   "https://cdn.remax.co.za/listings/73932117/original/e867a62a-6a9b-2967-c55a-4189a746198a.jpg",
   "https://cdn.remax.co.za/listings/73932117/original/da3840ed-e4f5-e12f-dd05-018695e69539.jpg",
   "https://cdn.remax.co.za/listings/73932117/original/5f84e037-a231-683a-cd62-21b1927f099e.jpg",
   "https://cdn.remax.co.za/listings/73932117/original/8a726f9d-1de8-9251-6f36-98300640d22c.jpg",
   "https://cdn.remax.co.za/listings/73932117/original/9f9331c8-8cb9-ef1c-743c-f49097af29c8.jpg",
   "https://cdn.remax.co.za/listings/73932117/original/04d3953e-3b67-975f-976e-47897efacf37.jpg",
   "https://cdn.remax.co.za/listings/73932117/original/8a61cd0f-37f6-bbed-7b5e-ae84fcd794a8.jpg",
   "https://cdn.remax.co.za/listings/73932117/original/c356c748-207f-6a8c-fc35-243690ff8e06.jpg",
   "https://cdn.remax.co.za/listings/73932117/original/06bfc31e-34d0-8e9e-aa4b-f5c1f520b708.jpg"
  ],
  "href": "https://remaxcoastal.co.za/property/for-sale/south-africa/western-cape/klein-brak-rivier/fraaiuitsig/5-bedroom-house-for-sale-73932117"
 },
 {
  "ref": "RCMB-0194",
  "price": 4395000,
  "beds": 4,
  "baths": 3,
  "type": "House",
  "suburb": "Fraaiuitsig",
  "town": "Klein Brak Rivier",
  "erf": 600,
  "floor": 0,
  "rates": 1659,
  "agent": "Alex",
  "head": "4 bedroom house in Fraaiuitsig",
  "desc": "Distinguished Coastal Residence with Panoramic Views in Fraaiuitsig This sophisticated four-bedroom residence exemplifies contemporary coastal living, positioned within the prestigious Fraaiuitsig enclave of Klein Brak Rivier. Comprising 304 square metres of meticulously appointed living space situated upon a generous 600-square-metre erf, this property presents an exceptional opportunity for discerning purchasers seeking refined seaside accommodation.",
  "img": "https://cdn.remax.co.za/listings/73118402/original/39e1babc-8976-0eeb-b654-bbe804e68f71.jpg",
  "imgs": [
   "https://cdn.remax.co.za/listings/73118402/original/39e1babc-8976-0eeb-b654-bbe804e68f71.jpg",
   "https://cdn.remax.co.za/listings/73118402/original/98e0045f-b915-7ab8-b5d2-019eb1c9722d.jpg",
   "https://cdn.remax.co.za/listings/73118402/original/189c1337-addc-ccd3-6837-3c643c6aa9c1.jpg",
   "https://cdn.remax.co.za/listings/73118402/original/0003ae56-4d78-43d2-f1ae-56f4bbe95f65.jpg",
   "https://cdn.remax.co.za/listings/73118402/original/306c8fa0-2848-da7a-8b0b-b5f006547e94.jpg",
   "https://cdn.remax.co.za/listings/73118402/original/d9a1fabe-b53a-3735-84e4-a464545f2c87.jpg",
   "https://cdn.remax.co.za/listings/73118402/original/e0f12539-3d05-dc92-92eb-ecb01987a06d.jpg",
   "https://cdn.remax.co.za/listings/73118402/original/29440cba-0831-4901-4ae1-42281e81d304.jpg",
   "https://cdn.remax.co.za/listings/73118402/original/42f68940-2a6c-72ac-5323-38b74f760b03.jpg",
   "https://cdn.remax.co.za/listings/73118402/original/bcc091a1-820d-b37d-f8bf-f3042feef126.jpg"
  ],
  "href": "https://remaxcoastal.co.za/property/for-sale/south-africa/western-cape/klein-brak-rivier/fraaiuitsig/4-bedroom-house-for-sale-73118402"
 },
 {
  "ref": "RCMB-0193",
  "price": 1790000,
  "beds": 0,
  "baths": 0,
  "type": "Vacant Land",
  "suburb": "Dana Bay",
  "town": "Mossel Bay",
  "erf": 0,
  "floor": 0,
  "rates": 1759,
  "agent": "John John",
  "head": "Vacant Land in Desirable Dana Bay Cul-de-Sac",
  "desc": "This 1,020 square metre vacant plot offers an excellent opportunity to build your dream home in the sought-after Dana Bay area of Mossel Bay. Located in a quiet cul-de-sac setting, the property provides a peaceful residential environment with strong development potential. The generous land size allows for flexible design options and the creation of a property tailored to your specific requirements and lifestyle preferences. Dana Bay is a well-established residential community known for its tranquil atmosphere and convenient access to local amenities.",
  "img": "https://cdn.remax.co.za/listings/72965792/original/2b3bb42f-767c-4744-e625-b14c502afd6f.jpg",
  "imgs": [
   "https://cdn.remax.co.za/listings/72965792/original/2b3bb42f-767c-4744-e625-b14c502afd6f.jpg",
   "https://cdn.remax.co.za/listings/72965792/original/97f4fc9a-b4f8-dc32-d616-0a27e847b942.jpg",
   "https://cdn.remax.co.za/listings/72965792/original/b8dc7869-af14-68ec-32ae-83f4428a439d.jpg",
   "https://cdn.remax.co.za/listings/72965792/original/d5e5948b-4971-ba68-ddd4-8da276a646cc.jpg",
   "https://cdn.remax.co.za/listings/72965792/original/c760e2b5-cca5-2d0a-db70-353109cdb631.jpg",
   "https://cdn.remax.co.za/listings/72965792/original/12d695b3-ed8c-6684-4cde-cb52e19d3489.jpg",
   "https://cdn.remax.co.za/listings/72965792/original/b7e4eaf1-2857-e97f-1b8b-0a44d00d7c87.jpg",
   "https://cdn.remax.co.za/listings/72965792/original/2a46336e-c9bd-26db-fa8a-80b2403ba86b.jpg",
   "https://cdn.remax.co.za/listings/72965792/original/9ddbaae5-f2ef-e51d-0672-b660930c5cad.jpg",
   "https://cdn.remax.co.za/listings/72965792/original/cf8df990-4b27-5907-6bf5-8719fc9e75c3.jpg"
  ],
  "href": "https://remaxcoastal.co.za/property/for-sale/south-africa/western-cape/mossel-bay/dana-bay/vacant-land-plot-for-sale-72965792"
 },
 {
  "ref": "RXEB-4698",
  "price": 3950000,
  "beds": 5,
  "baths": 4,
  "type": "House",
  "suburb": "Heuwelkruin",
  "town": "Knysna",
  "erf": 733,
  "floor": 0,
  "rates": 2700,
  "agent": "Nicoline",
  "head": "Versatile Family Living with Lagoon Views & Separate Flat",
  "desc": "Prime Heuwelkruin Location. Multi-Generational or Income Opportunity Nestled in the peaceful, sought-after suburb of Heuwelkruin, Knysna, this lovingly maintained and thoughtfully updated home offers the ultimate blend of relaxed family living, outdoor entertaining, and exceptional investment potential. Built for indoor-outdoor living, the property captures striking lagoon views that make every day feel like a getaway.",
  "img": "https://cdn.remax.co.za/listings/71614953/original/526c6874-1665-0d38-b584-fa144003baf8.jpg",
  "imgs": [
   "https://cdn.remax.co.za/listings/71614953/original/526c6874-1665-0d38-b584-fa144003baf8.jpg",
   "https://cdn.remax.co.za/listings/71614953/original/d773d371-12ba-5822-4468-42895bbe643c.jpg",
   "https://cdn.remax.co.za/listings/71614953/original/e3599336-fd47-aa7b-8124-6f4d4bf3bb3e.jpg",
   "https://cdn.remax.co.za/listings/71614953/original/dd92e8bb-7c80-b5f1-1f5e-2eb4a6f17ffd.jpg",
   "https://cdn.remax.co.za/listings/71614953/original/24869398-dde5-dc55-7fb5-cc4c99722141.jpg",
   "https://cdn.remax.co.za/listings/71614953/original/71d08429-c7ab-cf8a-bc04-10089677c54a.jpg",
   "https://cdn.remax.co.za/listings/71614953/original/a6b23a02-4c3f-8bb5-0693-758afc0ca8e7.jpg",
   "https://cdn.remax.co.za/listings/71614953/original/79a304b2-8521-27f3-4d5f-95cf0c9ed275.jpg",
   "https://cdn.remax.co.za/listings/71614953/original/90a6a5df-91a3-8135-ebba-e80c61d263ae.jpg",
   "https://cdn.remax.co.za/listings/71614953/original/1d49d9bf-5735-79a2-16f8-49f89e09dca9.jpg"
  ],
  "href": "https://remaxcoastal.co.za/property/for-sale/south-africa/western-cape/knysna/heuwelkruin/5-bedroom-house-for-sale-71614953"
 },
 {
  "ref": "RCMB-0189",
  "price": 4700000,
  "beds": 4,
  "baths": 3,
  "type": "House",
  "suburb": "Fraaiuitsig",
  "town": "Klein Brak Rivier",
  "erf": 600,
  "floor": 0,
  "rates": 1883,
  "agent": "Lilanie",
  "head": "Distinguished Coastal Residence in Fraaiuitsig, Klein Brak Rivier",
  "desc": "This exceptional four-bedroom residence exemplifies sophisticated coastal living in the sought-after Fraaiuitsig locality of Klein Brak Rivier. Comprising generously proportioned living spaces across 244 square metres, the property commands a commanding position on a substantial 600-square-metre erf, affording residents an enviable lifestyle characterised by tranquillity and natural beauty. The residence benefits from its proximity to the coastal environment, presenting an unparalleled opportunity for those seeking refined seaside living.",
  "img": "https://cdn.remax.co.za/listings/72650427/original/548abaa5-2026-a553-9065-012f5563e715.jpg",
  "imgs": [
   "https://cdn.remax.co.za/listings/72650427/original/548abaa5-2026-a553-9065-012f5563e715.jpg",
   "https://cdn.remax.co.za/listings/72650427/original/4330b395-91ac-40ed-c75d-752004064bc4.jpg",
   "https://cdn.remax.co.za/listings/72650427/original/5ce7fd9e-05df-40e7-cb85-50b7904dba86.jpg",
   "https://cdn.remax.co.za/listings/72650427/original/1f6a08b6-18e6-2390-fcc6-cea943e2fe7f.jpg",
   "https://cdn.remax.co.za/listings/72650427/original/c3d60096-516c-6cbc-5eaf-90277fc862bd.jpg",
   "https://cdn.remax.co.za/listings/72650427/original/0deab60c-bea5-60bb-1df3-56ab453db4cd.jpg",
   "https://cdn.remax.co.za/listings/72650427/original/f974309f-ddc5-6551-5f53-53a1240d6c0d.jpg",
   "https://cdn.remax.co.za/listings/72650427/original/f026f12b-51ef-598e-9d73-ec9c1aad7f85.jpg",
   "https://cdn.remax.co.za/listings/72650427/original/2cc60480-da25-7d49-7842-71656e119641.jpg",
   "https://cdn.remax.co.za/listings/72650427/original/c8cdb195-f97e-fbf4-2832-36e418b40cc0.jpg"
  ],
  "href": "https://remaxcoastal.co.za/property/for-sale/south-africa/western-cape/klein-brak-rivier/fraaiuitsig/4-bedroom-house-for-sale-72650427"
 },
 {
  "ref": "RCMB-0186",
  "price": 4600000,
  "beds": 4,
  "baths": 3,
  "type": "House",
  "suburb": "Groot Brakrivier Central",
  "town": "Groot Brakrivier",
  "erf": 682,
  "floor": 0,
  "rates": 1800,
  "agent": "Lilanie",
  "head": "Distinguished Coastal Residence in Prestigious Golf Estate",
  "desc": "This exceptional four-bedroom residence is situated within the esteemed Groot Brakrivier Golf Estate, a premier coastal community offering an unparalleled lifestyle. The property comprises generously proportioned living spaces across 290 square metres, positioned on a substantial 682 square metre erf, providing both comfort and considerable outdoor potential. The residence benefits from its proximity to pristine beaches and the refined amenities of an established golf course community.",
  "img": "https://cdn.remax.co.za/listings/72007298/original/d0a127ac-c57e-ef9d-3948-76d7ceed5148.jpg",
  "imgs": [
   "https://cdn.remax.co.za/listings/72007298/original/d0a127ac-c57e-ef9d-3948-76d7ceed5148.jpg",
   "https://cdn.remax.co.za/listings/72007298/original/66591af9-8693-dcb3-f137-dcfa07871681.jpg",
   "https://cdn.remax.co.za/listings/72007298/original/8ad2758b-2764-3f9b-d57e-39196970a52f.jpg",
   "https://cdn.remax.co.za/listings/72007298/original/fffbd64a-0828-5775-0a46-e6312a1106c4.jpg",
   "https://cdn.remax.co.za/listings/72007298/original/a363d1f7-7cae-f46e-29ee-563321f1a680.jpg",
   "https://cdn.remax.co.za/listings/72007298/original/b978284f-96c2-6e9b-e288-9cb99b9a7f07.jpg",
   "https://cdn.remax.co.za/listings/72007298/original/e02bd4de-e1e8-d02c-a415-5784439f0a08.jpg",
   "https://cdn.remax.co.za/listings/72007298/original/fabec596-b47e-7726-055b-a96074c3d3f4.jpg",
   "https://cdn.remax.co.za/listings/72007298/original/0aaa8508-429b-590e-443a-105a4430f736.jpg",
   "https://cdn.remax.co.za/listings/72007298/original/b1071f10-31ac-cc72-81b7-2532983940f4.jpg"
  ],
  "href": "https://remaxcoastal.co.za/property/for-sale/south-africa/western-cape/groot-brakrivier/groot-brakrivier-central/4-bedroom-house-for-sale-72007298"
 }
];

/* To-let book, read live 16 Aug 2026 */
const RENTALS = [
 {
  "ref": "RXEB-4705",
  "price": 4200,
  "beds": 2,
  "baths": 2,
  "type": "House",
  "floor": 120,
  "town": "Knysna",
  "suburb": "Phantom River View",
  "img": "https://cdn.remax.co.za/listings/74077769/original/9285cace-52ad-0ade-7588-bdff10641e32.png",
  "href": "https://remaxcoastal.co.za/property/to-rent/south-africa/western-cape/knysna/phantom-river-view/2-bedroom-house-to-rent-74077769"
 },
 {
  "ref": "RXEB-4703",
  "price": 18500,
  "beds": 3,
  "baths": 0,
  "type": "Townhouse",
  "floor": 216,
  "town": "Knysna",
  "suburb": "Costa Sarda",
  "img": "https://cdn.remax.co.za/listings/73049979/original/a5ad3872-8a68-172f-5393-daf20b706d09.jpg",
  "href": "https://remaxcoastal.co.za/property/to-rent/south-africa/western-cape/knysna/costa-sarda/3-bedroom-townhouse-to-rent-73049979"
 },
 {
  "ref": "RXED-1828",
  "price": 15000,
  "beds": 3,
  "baths": 2,
  "type": "Townhouse",
  "floor": 0,
  "town": "Sedgefield",
  "suburb": "Meedingsride",
  "img": "https://cdn.remax.co.za/listings/38907529/original/ad61c95a-a4fb-1847-4ce8-1105d80bc5f6.jpg",
  "href": "https://remaxcoastal.co.za/property/to-rent/south-africa/western-cape/sedgefield/meedingsride/3-bedroom-townhouse-to-rent-38907529"
 },
 {
  "ref": "RXEB-4694",
  "price": 25000,
  "beds": 4,
  "baths": 3,
  "type": "House",
  "floor": 300,
  "town": "Knysna",
  "suburb": "Brenton On Sea",
  "img": "https://cdn.remax.co.za/listings/70506484/original/8d294235-236c-72a1-aba2-03513fa31ab5.jpg",
  "href": "https://remaxcoastal.co.za/property/to-rent/south-africa/western-cape/knysna/brenton-on-sea/4-bedroom-house-to-rent-70506484"
 },
 {
  "ref": "RXEB-4692",
  "price": 8600,
  "beds": 1,
  "baths": 1,
  "type": "Apartment / Flat",
  "floor": 68,
  "town": "Knysna",
  "suburb": "Knysna Central",
  "img": "https://cdn.remax.co.za/listings/69419738/original/a2215809-1857-c701-69e7-69a378a24568.jpg",
  "href": "https://remaxcoastal.co.za/property/to-rent/south-africa/western-cape/knysna/knysna-central/1-bedroom-apartment-flat-to-rent-69419738"
 },
 {
  "ref": "RXEB-4690",
  "price": 11000,
  "beds": 1,
  "baths": 1,
  "type": "Apartment / Flat",
  "floor": 0,
  "town": "Knysna",
  "suburb": "Old Place",
  "img": "https://cdn.remax.co.za/listings/68937261/original/b7e2b18e-19dc-67c6-8a7d-641037513433.jpg",
  "href": "https://remaxcoastal.co.za/property/to-rent/south-africa/western-cape/knysna/old-place/1-bedroom-apartment-flat-to-rent-68937261"
 },
 {
  "ref": "RXEB-4684",
  "price": 15000,
  "beds": 2,
  "baths": 0,
  "type": "House",
  "floor": 200,
  "town": "Knysna",
  "suburb": "Rexford",
  "img": "https://cdn.remax.co.za/listings/67825576/original/b079ca78-3ad2-cd9a-cf42-39b43dfdc1c7.jpeg",
  "href": "https://remaxcoastal.co.za/property/to-rent/south-africa/western-cape/knysna/rexford/2-bedroom-house-to-rent-67825576"
 },
 {
  "ref": "RXEB-4053",
  "price": 46000,
  "beds": 4,
  "baths": 3,
  "type": "House",
  "floor": 0,
  "town": "Knysna",
  "suburb": "Thesen Islands",
  "img": "https://cdn.remax.co.za/listings/4306268/original/12d51e9c-84ca-e3bc-ec26-60e59f7bfd55.jpg",
  "href": "https://remaxcoastal.co.za/property/to-rent/south-africa/western-cape/knysna/thesen-islands/4-bedroom-house-to-rent-4306268"
 },
 {
  "ref": "RXEB-4686",
  "price": 12500,
  "beds": 2,
  "baths": 1,
  "type": "Apartment / Flat",
  "floor": 0,
  "town": "Knysna",
  "suburb": "Knysna Central",
  "img": "https://cdn.remax.co.za/listings/68386156/original/8d851860-f24a-93f1-4282-c3efedcb95f2.jpg",
  "href": "https://remaxcoastal.co.za/property/to-rent/south-africa/western-cape/knysna/knysna-central/2-bedroom-apartment-flat-to-rent-68386156"
 },
 {
  "ref": "RXEC-1587",
  "price": 6500,
  "beds": 1,
  "baths": 1,
  "type": "House",
  "floor": 50,
  "town": "George",
  "suburb": "George South",
  "img": "https://cdn.remax.co.za/listings/67206532/original/42c32ce7-73c1-78f0-213f-ff43da938c05.jpg",
  "href": "https://remaxcoastal.co.za/property/to-rent/south-africa/western-cape/george/george-south/1-bedroom-house-to-rent-67206532"
 }
];

/* Their real YouTube library. 30 videos, most under 400 views. */
const VIDEOS = [
  { id:'5UAXi13o8KM', t:'Property for sale in Knysna, Garden Route', len:'4:08', views:59,  age:'9 days ago',   area:'Knysna' },
  { id:'42qj4nux_lA', t:'Vacant land for sale in Knysna, Garden Route', len:'2:12', views:32, age:'12 days ago', area:'Knysna' },
  { id:'ZfdGIY3iLms', t:'Property for sale in Knysna, Garden Route', len:'1:02', views:43,  age:'1 month ago',  area:'Knysna' },
  { id:'Bzaz3f-CRBs', t:'Property for sale in Sedgefield', len:'2:47', views:32, age:'1 month ago', area:'Sedgefield' },
  { id:'BaBe-rrKTXg', t:'Property for sale in Knysna, Garden Route', len:'3:25', views:100, age:'1 month ago', area:'Knysna' },
  { id:'0xVXfHNRqkI', t:'Property for sale in Wilderness, Garden Route', len:'3:15', views:357, age:'1 month ago', area:'Wilderness' },
  { id:'x_e4KGSYSmw', t:'Property for sale in Knysna, Garden Route', len:'2:04', views:113, age:'1 month ago', area:'Knysna' },
  { id:'-Ugr-foQsa0', t:'Modern one-bedroom home in Sedgefield Central', len:'2:33', views:71, age:'2 months ago', area:'Sedgefield' },
  { id:'0fmjPWPEiLw', t:'Property for sale in Sedgefield, Garden Route', len:'0:25', views:239, age:'2 months ago', area:'Sedgefield' },
  { id:'9dsCA-zzh4g', t:'Property for sale in Wilderness, Garden Route', len:'2:18', views:100, age:'2 months ago', area:'Wilderness' },
  { id:'y21qdEoimmM', t:'Property for sale in Knysna, Garden Route', len:'3:06', views:112, age:'2 months ago', area:'Knysna' },
  { id:'k73t_2a8kDs', t:'3 bedroom house for sale in Vleesbaai', len:'1:33', views:79, age:'2 months ago', area:'Mossel Bay' },
  { id:'rUEdm22CQ7g', t:'Seafront Myoli Beach property with ocean views and guesthouse potential', len:'3:23', views:69, age:'2 months ago', area:'Sedgefield' },
  { id:'QYERYIbi7Hg', t:'Property for sale in Knysna, Garden Route', len:'2:24', views:118, age:'3 months ago', area:'Knysna' },
  { id:'FLuEYhyRAYI', t:'Property for sale in Knysna, Garden Route', len:'2:36', views:397, age:'3 months ago', area:'Knysna' },
  { id:'fynDEYnzE2w', t:'Your dream coastal escape in Keurboomstrand', len:'5:38', views:174, age:'3 months ago', area:'Plettenberg Bay' },
  { id:'zTpq1MYNWiQ', t:'Property for sale in Knysna, Garden Route', len:'3:24', views:104, age:'3 months ago', area:'Knysna' },
  { id:'uxFTcgU0XRQ', t:'Property for sale in Knysna, Garden Route', len:'3:21', views:134, age:'3 months ago', area:'Knysna' },
  { id:'gxrDh7q3F30', t:'Property for sale in Knysna, Garden Route', len:'3:49', views:168, age:'3 months ago', area:'Knysna' },
  { id:'lOtd201X2SM', t:'Plot for sale in Sedgefield, Garden Route', len:'0:30', views:70, age:'3 months ago', area:'Sedgefield' },
  { id:'Lt7F2hlL8fs', t:'Refined living, now available to rent', len:'7:25', views:146, age:'4 months ago', area:'Knysna' },
  { id:'nDdoKX2jcHQ', t:'Property for sale in Knysna, Garden Route', len:'2:23', views:72, age:'4 months ago', area:'Knysna' },
  { id:'bb7xwOhQU7s', t:'Property for sale in Knysna, Garden Route', len:'3:23', views:99, age:'4 months ago', area:'Knysna' },
  { id:'KN2TJi1JcqE', t:'Property for sale in Knysna, Garden Route', len:'3:08', views:81, age:'4 months ago', area:'Knysna' },
  { id:'Gag4RtoO6jw', t:'Property for sale in Knysna, Garden Route', len:'2:29', views:210, age:'5 months ago', area:'Knysna' },
  { id:'uIcXJA8mCZo', t:'Property for sale in Knysna, Garden Route', len:'0:29', views:60, age:'5 months ago', area:'Knysna' },
  { id:'nczyo2KiDy8', t:'Property for sale in Knysna, Garden Route', len:'2:48', views:106, age:'5 months ago', area:'Knysna' },
  { id:'s1RglF8z9bc', t:'Vacant land for sale in Cola Beach', len:'0:28', views:37, age:'5 months ago', area:'Sedgefield' },
  { id:'SwITO4VWqBE', t:'Spacious property for sale in Knysna, Garden Route', len:'3:10', views:226, age:'5 months ago', area:'Knysna' },
  { id:'F0ZO-nKdt5E', t:'Beautiful property for sale in Knysna, Garden Route', len:'4:14', views:140, age:'5 months ago', area:'Knysna' }
];

const TEAM = [
  { name:'Chris van der Merwe', role:'Broker Owner', office:'Knysna',
    img:'https://cdn.remax.co.za/images/agents/19566/member/agent_image_1770190114.jpg' },
  { name:'Fredri Kruger', role:'Broker Manager', office:'Knysna',
    img:'https://cdn.remax.co.za/images/agents/48272/agent_image_9199a098-f52f-db45-3874-17966bd3c901.jpg' },
  { name:'Adriaan Adam', role:'Full Status Property Practitioner', office:'Knysna',
    img:'https://cdn.remax.co.za/images/agents/10275/agent_image_d51b7853-f4f8-aa50-8b74-e77c8eb4c3e4.jpg' },
  { name:'Andre Langley', role:'Sales Associate', office:'Knysna',
    img:'https://cdn.remax.co.za/images/agents/5667/agent_image_56ca1472-1c9a-7837-d2b6-7673fac1e7e1.jpg' },
  { name:'Cecilia Potgieter', role:'Sales Associate', office:'Sedgefield',
    img:'https://cdn.remax.co.za/images/agents/51538/agent_image_737dc255-b584-1ef9-cc0a-9af63d5ce260.jpg' },
  { name:'Antoinette Janse van Rensburg', role:'Client Services', office:'Knysna',
    img:'https://cdn.remax.co.za/images/agents/892858/member/agent_image_1770190338.jpg' },
  { name:'Caleb Manuel', role:'Client Services', office:'Knysna',
    img:'https://cdn.remax.co.za/images/agents/10935/agent_image_ff45119d-0b58-c7fb-e506-d187061a2adc.jpg' },
  { name:'Corne Viljoen', role:'Client Services', office:'Knysna',
    img:'https://cdn.remax.co.za/images/agents/11107/agent_image_bc888d81-108e-6ee1-29e5-7eb991b99dff.jpg' }
];

const AREAS = [
 {
  "name": "Knysna",
  "blurb": "The lagoon, the Heads and the forest. Knysna is the busiest market on this stretch and the one people picture when they think Garden Route.",
  "detail": "Knysna sits on a tidal lagoon with the Heads at its mouth, ringed by indigenous forest. Stock ranges from apartments in Knysna Central through the established suburbs on the hill to Thesen Islands and the Pezula and Simola estates. It carries the widest choice and the deepest rental market of any town we cover.",
  "img": "https://cdn.remax.co.za/listings/71614953/original/d773d371-12ba-5822-4468-42895bbe643c.jpg"
 },
 {
  "name": "Sedgefield",
  "blurb": "Myoli Beach, Cola Beach and Swartvlei. Slower than Knysna by design, which is exactly why people move here.",
  "detail": "Sedgefield was South Africa's first Cittaslow town and it behaves like one. The beaches are quiet, the lake is on the doorstep and the Saturday market is the social calendar. Buyers here are typically retiring, semigrating or buying a second home they intend to use.",
  "img": "https://cdn.remax.co.za/listings/72965792/original/2b3bb42f-767c-4744-e625-b14c502afd6f.jpg"
 },
 {
  "name": "Wilderness",
  "blurb": "Forest, lakes and beach within a few minutes of each other, and George airport twenty minutes away.",
  "detail": "Wilderness packs beach, lagoon, river and forest into a very small area, with the N2 running through the middle. The proximity to George airport makes it the easiest town on this coast to reach from Johannesburg, which shows up in both prices and holiday letting demand.",
  "img": "https://cdn.remax.co.za/listings/72007298/original/d0a127ac-c57e-ef9d-3948-76d7ceed5148.jpg"
 },
 {
  "name": "Mossel Bay",
  "blurb": "The sunniest end of the Garden Route, with Hartenbos, Dana Bay and the Brak rivers around it.",
  "detail": "Mossel Bay and the villages around it, Hartenbos, Dana Bay, Klein Brak and Groot Brak, offer the most house for the money on this coast. It is a working town rather than a holiday town, which means services stay open in winter and the rental market runs year round.",
  "img": "https://cdn.remax.co.za/listings/73646553/original/7853d62a-9b99-b45a-98b3-b0f730c887dc.jpg"
 }
];
