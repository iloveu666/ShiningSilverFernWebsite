// Mobile menu
const toggle = document.querySelector('.nav-toggle');
const menu = document.getElementById('menu');
if (toggle && menu) {
  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
}

// Year
const y = document.getElementById('year');
if (y) y.textContent = new Date().getFullYear();

// Reveal-on-scroll
const observer = new IntersectionObserver((entries) => {
  for (const e of entries) if (e.isIntersecting) e.target.classList.add('visible');
}, {threshold: .18});
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

/* ===== Estimator aligned to your proposal (GST inclusive) =====
Deep Clean (1–2BR) from $330
Hourly: 1 cleaner $50/hr, 2 cleaners $70/hr, 3+ cleaners $95/hr
Extras:
- Carpet deep clean: $300 per bedroom
- Windows: $5–$10 per window; bulk cap ~$200 (auto-calculated at $7.5/window with $200 cap)
- Lawn mowing & trimming: flat $50
- Inspection & inventory: $80
*/
const PRICING = {
  deep: [
    { maxBR: 2, price: 330 },
    { maxBR: 3, price: 480 },
    { maxBR: 4, price: 650 },
    { maxBR: 99, base: 650, perExtraBR: 120 } // fallback for larger homes
  ],
  hourly: { one: 50, two: 70, threePlus: 95 },
  extras: {
    carpetPerBedroom: 300,
    windowRate: 7.5,
    windowBulkCap: 200,
    lawnFlat: 50,
    inspection: 80
  }
};
function formatNZD(n){ return n.toLocaleString('en-NZ',{ style:'currency', currency:'NZD', maximumFractionDigits:0 }); }

const form = document.getElementById('quoteForm');
const serviceSel = document.getElementById('service');
const hoursWrap = document.getElementById('hoursWrap');
const cleanersWrap = document.getElementById('cleanersWrap');
const estimateOut = document.getElementById('estimate');

function updateVisibility() {
  const isHourly = serviceSel && serviceSel.value === 'hourly';
  hoursWrap?.classList.toggle('hide', !isHourly);
  cleanersWrap?.classList.toggle('hide', !isHourly);
}
serviceSel?.addEventListener('change', updateVisibility);
updateVisibility();

function deepPrice(bedrooms) {
  for (const tier of PRICING.deep) {
    if (bedrooms <= tier.maxBR) {
      if (tier.price) return tier.price;
      // fallback tier
      const extras = Math.max(0, bedrooms - 4) * (tier.perExtraBR || 0);
      return (tier.base || 0) + extras;
    }
  }
  return 330;
}

function windowsPrice(count) {
  const perWindow = (count || 0) * PRICING.extras.windowRate;
  const bulk = count >= 25 ? PRICING.extras.windowBulkCap : Infinity;
  return Math.min(perWindow, bulk);
}

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);

    const service = String(data.get('service'));
    const bedrooms = Number(data.get('bedrooms') || 0);
    const hours = Number(data.get('hours') || 0);
    const cleaners = Number(data.get('cleaners') || 1);

    // base
    let total = 0;
    if (service === 'deep') {
      total += deepPrice(bedrooms);
    } else {
      const rate = cleaners >= 3 ? PRICING.hourly.threePlus : (cleaners === 2 ? PRICING.hourly.two : PRICING.hourly.one);
      total += rate * (hours || 1);
    }

    // extras
    const carpetBR = Number(data.get('carpet_bedrooms') || 0);
    total += carpetBR * PRICING.extras.carpetPerBedroom;

    const windowCount = Number(data.get('windows') || 0);
    total += windowsPrice(windowCount);

    if (data.get('lawn') === 'on') total += PRICING.extras.lawnFlat;
    if (data.get('inspection') === 'on') total += PRICING.extras.inspection;

    estimateOut.textContent = `${formatNZD(total)} (approx.)`;
  });
}
