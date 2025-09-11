// Mobile menu
const toggle = document.querySelector('.nav-toggle');
const menu = document.getElementById('menu');
if (toggle) {
  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
}

// Year
document.getElementById('year').textContent = new Date().getFullYear();

// Reveal on scroll
const observer = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (e.isIntersecting) e.target.classList.add('visible');
  }
}, {threshold: .18});
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Estimator
const form = document.getElementById('quoteForm');
const out = document.getElementById('estimate');

/**
 * Base rates (NZD, incl. GST) — tweak as you like.
 * These are conservative placeholders; set to your actual market rates.
 */
const RATES = {
  airbnb: { base: 89, perBedroom: 25, perBathroom: 35, linen: 30 },
  office: { base: 120, perBedroom: 15, perBathroom: 25, linen: 0 },
  event:  { base: 220, perBedroom: 10, perBathroom: 40, linen: 0 },
  addons: { addon_oven: 40, addon_fridge: 30, addon_windows: 45, addon_carpet: 35, addon_lawn: 55 }
};

function formatNZD(n){ return n.toLocaleString('en-NZ',{ style:'currency', currency:'NZD', maximumFractionDigits:0 }); }

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const type = String(data.get('type'));
    const bdr = Number(data.get('bedrooms') || 0);
    const bath = Number(data.get('bathrooms') || 1);
    const linen = data.get('linen') === 'on';

    let total = RATES[type].base + (bdr * RATES[type].perBedroom) + (bath * RATES[type].perBathroom);
    if (linen) total += RATES[type].linen;

    // add-ons
    Object.entries(RATES.addons).forEach(([k, v]) => {
      if (data.get(k) === 'on') total += v;
    });

    // Recurring discount example: if Airbnb with 2+ weekly cleans, subtract 8% (just a visual note here)
    // You can extend this with frequency pickers.
    const txt = `${formatNZD(total)} (approx.)`;
    out.textContent = txt;
  });
}
