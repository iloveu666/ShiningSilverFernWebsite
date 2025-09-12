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

/* ===== Brand parallax (no images), respects reduced motion ===== */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const layers = document.querySelectorAll('.layer');
const bandLayers = document.querySelectorAll('.band-layer');

if (!reduceMotion) {
  function animate() {
    const s = window.scrollY || 0;
    layers.forEach((el, i) => el.style.transform = `translateY(${(-4 - i*2) + s*-0.02*(i+1)}%)`);
    bandLayers.forEach((el, i) => el.style.transform = `translateY(${(-6 - i*3) + s*-0.015*(i+1)}%)`);
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}

/* Tilt cards */
document.querySelectorAll('.tilt').forEach(card=>{
  let rect;
  card.addEventListener('mousemove', e=>{
    rect = rect || card.getBoundingClientRect();
    const rx = (e.clientY - rect.top - rect.height/2)/rect.height;
    const ry = (e.clientX - rect.left - rect.width/2)/rect.width;
    card.style.transform = `rotateX(${rx*-3}deg) rotateY(${ry*3}deg) translateY(-3px)`;
  });
  card.addEventListener('mouseleave', ()=>{ card.style.transform=''; rect=null; });
});

/* ===== Pricing (GST inclusive) ===== */
const PRICING = {
  airbnb: { oneBedBase: 80, extraBedroom: 25, perBathroom: 15, linen: 30 }, // $80 for 1BR turnover
  deep: [
    { maxBR: 2, price: 330 },
    { maxBR: 3, price: 480 },
    { maxBR: 4, price: 650 },
    { maxBR: 99, base: 650, perExtraBR: 120 }
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

/* ===== Estimator wiring ===== */
const form = document.getElementById('quoteForm');
const serviceSel = document.getElementById('service');
const bedroomsEl = document.getElementById('bedrooms');
const bathroomsEl = document.getElementById('bathrooms');
const linenEl = document.getElementById('linen');
const hoursEl = document.getElementById('hours');
const cleanersEl = document.getElementById('cleaners');

const bedroomsWrap = document.getElementById('bedroomsWrap');
const bathroomsWrap = document.getElementById('bathroomsWrap');
const linenWrap = document.getElementById('linenWrap');
const hoursWrap = document.getElementById('hoursWrap');
const cleanersWrap = document.getElementById('cleanersWrap');

const out = document.getElementById('estimate');
const breakdownWrap = document.getElementById('breakdownWrap');
const breakdownList = document.getElementById('breakdownList');
const emailLink = document.getElementById('emailLink');

function updateFieldVisibility() {
  const svc = serviceSel.value;
  const isHourly = svc === 'hourly';
  const isAirbnb = svc === 'airbnb';
  bedroomsWrap.classList.toggle('hide', isHourly);
  bathroomsWrap.classList.toggle('hide', isHourly);
  linenWrap.classList.toggle('hide', !isAirbnb);
  hoursWrap.classList.toggle('hide', !isHourly);
  cleanersWrap.classList.toggle('hide', !isHourly);
}

function deepPrice(bedrooms) {
  for (const tier of PRICING.deep) {
    if (bedrooms <= tier.maxBR) {
      if (tier.price) return tier.price;
      const extras = Math.max(0, bedrooms - 4) * (tier.perExtraBR || 0);
      return (tier.base || 0) + extras;
    }
  }
  return 330;
}
function windowsPrice(count) {
  const per = (count || 0) * PRICING.extras.windowRate;
  const bulk = count >= 25 ? PRICING.extras.windowBulkCap : Infinity;
  return Math.min(per, bulk);
}
function buildEmailBody(lines) {
  const nl = encodeURIComponent('\n');
  return lines.map(l => encodeURIComponent(l)).join(nl);
}

function calculate(e) {
  if (e) e.preventDefault();

  const svc = serviceSel.value;
  const bedrooms = Number(bedroomsEl.value || 0);
  const bathrooms = Number(bathroomsEl.value || 0);
  const hours = Number(hoursEl.value || 0);
  const cleaners = Number(cleanersEl.value || 1);

  const fd = new FormData(form);
  const carpetBR = Number(fd.get('carpet_bedrooms') || 0);
  const windowCount = Number(fd.get('windows') || 0);
  const lawn = fd.get('lawn') === 'on';
  const inspection = fd.get('inspection') === 'on';
  const linen = linenEl && linenEl.checked;

  let total = 0;
  const lines = [];

  if (svc === 'airbnb') {
    const base = PRICING.airbnb.oneBedBase;
    const extraBeds = Math.max(0, bedrooms - 1) * PRICING.airbnb.extraBedroom;
    const bathCost = Math.max(0, bathrooms) * PRICING.airbnb.perBathroom;
    total += base + extraBeds + bathCost;
    lines.push(`Airbnb turnover: ${formatNZD(base)} (1 bedroom)`);
    if (extraBeds) lines.push(`Extra bedrooms: ${formatNZD(extraBeds)}`);
    if (bathCost) lines.push(`Bathrooms: ${formatNZD(bathCost)}`);
    if (linen) { total += PRICING.airbnb.linen; lines.push(`Linen service: ${formatNZD(PRICING.airbnb.linen)}`); }
  } else if (svc === 'deep') {
    const price = deepPrice(bedrooms || 1);
    total += price; lines.push(`Deep clean (${bedrooms || 1} BR): ${formatNZD(price)}`);
  } else {
    const rate = cleaners >= 3 ? PRICING.hourly.threePlus : (cleaners === 2 ? PRICING.hourly.two : PRICING.hourly.one);
    const cost = rate * (hours || 1);
    total += cost; lines.push(`Hourly (${cleaners} cleaner${cleaners>1?'s':''} × ${hours || 1}h @ ${formatNZD(rate)}/h): ${formatNZD(cost)}`);
  }

  if (carpetBR) { const c = carpetBR * PRICING.extras.carpetPerBedroom; total += c; lines.push(`Carpet deep clean (${carpetBR} BR): ${formatNZD(c)}`); }
  if (windowCount) { const w = windowsPrice(windowCount); total += w; lines.push(`Window cleaning (${windowCount}): ${formatNZD(w)}`); }
  if (lawn) { total += PRICING.extras.lawnFlat; lines.push(`Lawn mowing & trimming: ${formatNZD(PRICING.extras.lawnFlat)}`); }
  if (inspection) { total += PRICING.extras.inspection; lines.push(`Inspection & inventory: ${formatNZD(PRICING.extras.inspection)}`); }

  out.textContent = `${formatNZD(total)} (approx.)`;
  breakdownList.innerHTML = lines.map(l => `<li>${l}</li>`).join('');
  breakdownWrap.classList.remove('hide');

  const subject = encodeURIComponent('Website Estimate — Shining Silver Fern');
  const body = buildEmailBody([`Service: ${svc}`, ...lines, `Total: ${formatNZD(total)}`]);
  emailLink.href = `mailto:shiningsilverfern@gmail.com?subject=${subject}&body=${body}`;
  emailLink.classList.remove('disabled');
  emailLink.setAttribute('aria-disabled','false');
}

if (form) {
  form.addEventListener('submit', calculate);
  ['change','input'].forEach(evt => form.addEventListener(evt, () => { updateFieldVisibility(); calculate(); }));
  updateFieldVisibility(); calculate(); // initial
}
