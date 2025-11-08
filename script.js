// ========== Navigation ==========
const toggle = document.querySelector(".nav-toggle");
const menu = document.getElementById("menu");

if (toggle && menu) {
  toggle.addEventListener("click", () => {
    const open = menu.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
}

// Year in footer
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ========== Parallax (hero + band), respects prefers-reduced-motion ==========
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const layers = document.querySelectorAll(".layer");
const bandLayers = document.querySelectorAll(".band-layer");

if (!reduceMotion && (layers.length || bandLayers.length)) {
  function animate() {
    const s = window.scrollY || 0;
    layers.forEach((el, i) => {
      el.style.transform = `translateY(${(-4 - i * 2) + s * -0.02 * (i + 1)}%)`;
    });
    bandLayers.forEach((el, i) => {
      el.style.transform = `translateY(${(-6 - i * 3) + s * -0.015 * (i + 1)}%)`;
    });
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}

// ========== Card tilt ==========
document.querySelectorAll(".tilt").forEach((card) => {
  let rect;
  card.addEventListener("mousemove", (e) => {
    rect = rect || card.getBoundingClientRect();
    const rx = (e.clientY - rect.top - rect.height / 2) / rect.height;
    const ry = (e.clientX - rect.left - rect.width / 2) / rect.width;
    card.style.transform = `rotateX(${rx * -3}deg) rotateY(${ry * 3}deg) translateY(-3px)`;
  });
  card.addEventListener("mouseleave", () => {
    card.style.transform = "";
    rect = null;
  });
});

// ========== Pricing & Estimator (UPDATED) ==========

const PRICING = {
  airbnb: {
    combos: [
      { bedrooms: 1, bathrooms: 1, price: 125 },
      { bedrooms: 2, bathrooms: 2, price: 175 },
      { bedrooms: 3, bathrooms: 2.5, price: 225 },
      { bedrooms: 4, bathrooms: 3.5, price: 350 },
    ],
  },
  deepHourly: 75,
  carpetHourly: 90,
  extras: {
    windowAddon: 75,
    carpetAddonPackage: 200,
    lawnFlat: 50,
    inspection: 80,
  },
};

function formatNZD(n) {
  return n.toLocaleString("en-NZ", {
    style: "currency",
    currency: "NZD",
    maximumFractionDigits: 0,
  });
}

const quoteForm = document.getElementById("quoteForm");
const serviceSel = document.getElementById("service");
const bedroomsEl = document.getElementById("bedrooms");
const bathroomsEl = document.getElementById("bathrooms");
const hoursEl = document.getElementById("hours");

const hoursWrap = document.getElementById("hoursWrap");
const estimateOut = document.getElementById("estimate");
const breakdownWrap = document.getElementById("breakdownWrap");
const breakdownList = document.getElementById("breakdownList");
const emailLink = document.getElementById("emailLink");

function updateFieldVisibility() {
  if (!serviceSel) return;
  const svc = serviceSel.value;

  const isHourly = svc === "deep" || svc === "carpet";

  if (hoursWrap) hoursWrap.classList.toggle("hide", !isHourly);
}

function matchAirbnbPrice(bedrooms, bathrooms) {
  bedrooms = Number(bedrooms || 0);
  bathrooms = parseFloat(bathrooms || 0);

  const combos = PRICING.airbnb.combos;
  for (const combo of combos) {
    if (combo.bedrooms === bedrooms && combo.bathrooms === bathrooms) {
      return {
        price: combo.price,
        label: `${combo.bedrooms} BR / ${combo.bathrooms} toilet(s)`,
        exact: true,
      };
    }
  }

  // Fallback: use the closest combination by bedrooms (never crash)
  let fallback = combos[0];
  for (const combo of combos) {
    if (bedrooms >= combo.bedrooms) fallback = combo;
  }
  return {
    price: fallback.price,
    label: `${fallback.bedrooms} BR / ${fallback.bathrooms} toilet(s) (approx.)`,
    exact: false,
  };
}

function buildEmailBody(lines) {
  const nl = encodeURIComponent("\n");
  return lines.map((l) => encodeURIComponent(l)).join(nl);
}

function calculateEstimate(e) {
  if (e) e.preventDefault();
  if (!quoteForm || !serviceSel) return;

  const svc = serviceSel.value;
  const bedrooms = Number(bedroomsEl?.value || 0);
  const bathrooms = parseFloat(bathroomsEl?.value || 0);
  const hours = Number(hoursEl?.value || 0);

  const fd = new FormData(quoteForm);
  const windowAddon = fd.get("window_addon") === "on";
  const carpetAddon = fd.get("carpet_addon") === "on";
  const lawn = fd.get("lawn") === "on";
  const inspection = fd.get("inspection") === "on";

  let total = 0;
  const lines = [];

  // Core service
  if (svc === "airbnb") {
    const result = matchAirbnbPrice(bedrooms, bathrooms);
    total += result.price;
    lines.push(`Airbnb cleaning ${result.label}: ${formatNZD(result.price)}`);
    if (!result.exact) {
      lines.push(
        "Note: combination not in table — approximate price based on similar size."
      );
    }
  } else if (svc === "deep") {
    const rate = PRICING.deepHourly;
    const hrs = hours || 0;
    const cost = rate * hrs;
    total += cost;
    lines.push(`Deep cleaning (${hrs} h @ ${formatNZD(rate)}/h): ${formatNZD(cost)}`);
  } else if (svc === "carpet") {
    const rate = PRICING.carpetHourly;
    const hrs = hours || 0;
    const cost = rate * hrs;
    total += cost;
    lines.push(
      `Carpet cleaning (${hrs} h @ ${formatNZD(rate)}/h): ${formatNZD(cost)}`
    );
  }

  // Add-ons
  if (windowAddon) {
    total += PRICING.extras.windowAddon;
    lines.push(`Window cleaning add-on: ${formatNZD(PRICING.extras.windowAddon)}`);
  }
  if (carpetAddon) {
    total += PRICING.extras.carpetAddonPackage;
    lines.push(
      `Carpet cleaning add-on (with package): ${formatNZD(
        PRICING.extras.carpetAddonPackage
      )}`
    );
  }
  if (lawn) {
    total += PRICING.extras.lawnFlat;
    lines.push(`Lawn mowing & trimming: ${formatNZD(PRICING.extras.lawnFlat)}`);
  }
  if (inspection) {
    total += PRICING.extras.inspection;
    lines.push(`Inspection & inventory report: ${formatNZD(PRICING.extras.inspection)}`);
  }

  // Output
  if (estimateOut) estimateOut.textContent = `${formatNZD(total)} (approx.)`;

  if (breakdownList) {
    breakdownList.innerHTML = lines.map((l) => `<li>${l}</li>`).join("");
  }
  if (breakdownWrap) breakdownWrap.classList.remove("hide");

  if (emailLink) {
    const subject = encodeURIComponent("Website Estimate — Shining Silver Fern");
    const body = buildEmailBody([...lines, `Total: ${formatNZD(total)}`]);
    emailLink.href = `mailto:shiningsilverfern@gmail.com?subject=${subject}&body=${body}`;
    emailLink.classList.remove("disabled");
    emailLink.setAttribute("aria-disabled", "false");
  }
}

// Hook estimator
if (quoteForm) {
  quoteForm.addEventListener("submit", calculateEstimate);
  ["change", "input"].forEach((evt) => {
    quoteForm.addEventListener(evt, () => {
      updateFieldVisibility();
      calculateEstimate();
    });
  });
  updateFieldVisibility();
  calculateEstimate();
}

// ========== Contact interactions: copy, toast, vCard, reveal ==========

// Toast
function showToast(msg) {
  let t = document.getElementById("toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "toast";
    t.className = "toast";
    t.setAttribute("role", "status");
    t.setAttribute("aria-live", "polite");
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 1500);
}

// Copy buttons
document.querySelectorAll("[data-copy]").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const text = btn.getAttribute("data-copy") || "";
    try {
      await navigator.clipboard.writeText(text);
      showToast("Copied to clipboard");
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        showToast("Copied to clipboard");
      } finally {
        ta.remove();
      }
    }
  });
});

// vCard generator
const vcardBtn = document.getElementById("saveVcard");
if (vcardBtn) {
  vcardBtn.addEventListener("click", () => {
    const vcf = `BEGIN:VCARD
VERSION:3.0
N:Shining Silver Fern LTD;;;;
FN:Shining Silver Fern LTD
ORG:Shining Silver Fern LTD
TEL;TYPE=CELL:+64221996468
EMAIL:shiningsilverfern@gmail.com
URL:https://www.shiningsilverfern.co.nz/
END:VCARD`;
    const blob = new Blob([vcf], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ShiningSilverFern.vcf";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  });
}

// Reveal action cards
const cards = document.querySelectorAll(".action-card");
if ("IntersectionObserver" in window && cards.length) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.2 }
  );
  cards.forEach((c) => io.observe(c));
} else {
  cards.forEach((c) => c.classList.add("in"));
}

// Optional floating quick-contact bar (safe if not present)
(function () {
  const bar = document.getElementById("quickContact");
  if (!bar) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const reveal = () => {
    const y = window.scrollY || 0;
    bar.hidden = y < 600;
    if (!reduce && !bar.hidden) {
      bar.style.opacity = "1";
      bar.style.transform = "translateY(0)";
    }
  };
  bar.style.opacity = "0";
  bar.style.transform = "translateY(8px)";
  reveal();
  window.addEventListener("scroll", reveal, { passive: true });
})();
