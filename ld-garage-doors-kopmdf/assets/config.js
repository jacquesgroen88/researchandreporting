/* ============ CONFIG: edit these before ads go live ============ */
window.LD_CONFIG = {
  // Google Ads: conversion ID + labels from Tools > Conversions. Leave 'AW-XXXXXXXXXX' to keep tracking off.
  googleAdsId: 'AW-XXXXXXXXXX',
  convLead: 'AW-XXXXXXXXXX/quote_form_label',      // primary: quote form submitted
  convCall: 'AW-XXXXXXXXXX/call_click_label',      // secondary: tap-to-call on the site
  convWhatsApp: 'AW-XXXXXXXXXX/whatsapp_label',    // secondary: WhatsApp tap
  ga4Id: 'G-XXXXXXXXXX',
  // Lead values (ZAR) sent with the form conversion so Smart Bidding favours high-value jobs. Estimates: CONFIRM.
  leadValues: {
    'garage-door-installation': 1500, 'roller-shutter-doors': 1200, 'garage-door-motors': 800, 'gate-motors': 700,
    'emergency-garage-door-repairs': 600, 'garage-door-springs-and-cables': 500, 'garage-door-panel-repairs': 500,
    'garage-door-repairs': 500, other: 300,
  },
  // Lead system endpoint (netlify/functions/api.mjs). Every form lead lands here first.
  leadApi: '/api/lead',
  // Tracking numbers from JSG (agreement Schedule 2). Leave null until issued: the main number below stays on the page.
  mainNumberDisplay: '061 663 1330',
  trackingNumbers: {
    google_ads: null, // e.g. { display: '010 123 4567', dial: '+27101234567' }
    website: null,
  },
  // Optional: a webhook (GHL / Make / Zapier) that also receives each lead as JSON. Netlify Forms always gets it.
  webhookUrl: '',
  whatsappText: 'Hi L&D, I need help with my garage door. ',
};
