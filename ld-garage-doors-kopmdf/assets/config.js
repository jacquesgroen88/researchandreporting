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
  // Optional: a webhook (GHL / Make / Zapier) that also receives each lead as JSON. Netlify Forms always gets it.
  webhookUrl: '',
  whatsappText: 'Hi L&D, I need help with my garage door. ',
};
