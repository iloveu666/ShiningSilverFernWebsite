/* ============================================================
   Shining Silver Fern LTD — interactions
   ============================================================ */
(function () {
  "use strict";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------- Year ---------- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Mobile nav ---------- */
  const toggle = $(".nav-toggle");
  const menu = $("#menu");
  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    menu.addEventListener("click", (e) => {
      if (e.target.closest("a")) {
        menu.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Header state + scroll progress ---------- */
  const header = $("#siteHeader");
  const progressBar = $("#progressBar");
  const backToTop = $("#backToTop");
  function onScroll() {
    const y = window.scrollY || 0;
    if (header) header.classList.toggle("scrolled", y > 12);
    if (progressBar) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
    }
    if (backToTop) {
      const show = y > 600;
      backToTop.hidden = false;
      backToTop.classList.toggle("show", show);
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (backToTop) {
    backToTop.addEventListener("click", () =>
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" })
    );
  }

  /* ---------- Active nav link via section observation ---------- */
  const navLinks = $$(".menu .link");
  const sections = navLinks
    .map((l) => document.querySelector(l.getAttribute("href")))
    .filter(Boolean);
  if ("IntersectionObserver" in window && sections.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const id = "#" + e.target.id;
            navLinks.forEach((l) =>
              l.classList.toggle("active", l.getAttribute("href") === id)
            );
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach((s) => spy.observe(s));
  }

  /* ---------- Reveal on scroll ---------- */
  const revealEls = $$(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion && revealEls.length) {
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  /* ---------- Count-up stats ---------- */
  const counters = $$(".stat-num");
  function runCount(el) {
    const target = parseFloat(el.dataset.count || "0");
    const suffix = el.dataset.suffix || "";
    if (reduceMotion) {
      el.textContent = target + suffix;
      return;
    }
    const dur = 1400;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if ("IntersectionObserver" in window && counters.length) {
    const cio = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            runCount(e.target);
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((c) => cio.observe(c));
  } else {
    counters.forEach(runCount);
  }

  /* ---------- Hero sparkle canvas ---------- */
  const canvas = $("#sparkles");
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext("2d");
    let w, h, stars, raf;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    function resize() {
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = w * DPR;
      canvas.height = h * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      const count = Math.min(70, Math.round((w * h) / 16000));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.6 + 0.4,
        a: Math.random(),
        s: Math.random() * 0.02 + 0.005,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
      }));
    }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (const st of stars) {
        st.a += st.s;
        const alpha = (Math.sin(st.a) + 1) / 2;
        st.x += st.vx;
        st.y += st.vy;
        if (st.x < 0) st.x = w;
        if (st.x > w) st.x = 0;
        if (st.y < 0) st.y = h;
        if (st.y > h) st.y = 0;
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220,232,250,${alpha * 0.8})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    }
    resize();
    draw();
    window.addEventListener("resize", () => {
      cancelAnimationFrame(raf);
      resize();
      draw();
    });
  }

  /* ---------- Hero parallax (light) ---------- */
  const fern = $(".hero-fern");
  if (fern && !reduceMotion) {
    window.addEventListener(
      "scroll",
      () => {
        const y = window.scrollY || 0;
        if (y < window.innerHeight) {
          fern.style.transform = `translateY(calc(-50% + ${y * 0.06}px))`;
        }
      },
      { passive: true }
    );
  }

  /* ---------- Card 3D tilt ---------- */
  if (!reduceMotion && window.matchMedia("(hover:hover)").matches) {
    $$(".tilt").forEach((card) => {
      let rect = null;
      card.addEventListener("mouseenter", () => (rect = card.getBoundingClientRect()));
      card.addEventListener("mousemove", (e) => {
        if (!rect) rect = card.getBoundingClientRect();
        const rx = (e.clientY - rect.top - rect.height / 2) / rect.height;
        const ry = (e.clientX - rect.left - rect.width / 2) / rect.width;
        card.style.transform = `rotateX(${rx * -4}deg) rotateY(${ry * 4}deg) translateY(-4px)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
        rect = null;
      });
    });
  }

  /* ---------- Toast ---------- */
  let toastTimer;
  function showToast(msg) {
    let t = $("#toast");
    if (!t) {
      t = document.createElement("div");
      t.id = "toast";
      t.className = "toast";
      t.setAttribute("role", "status");
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 1600);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try {
        ok = document.execCommand("copy");
      } catch {}
      ta.remove();
      return ok;
    }
  }

  /* ---------- Copy buttons ---------- */
  $$("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const ok = await copyText(btn.getAttribute("data-copy") || "");
      showToast(ok ? "Copied to clipboard" : "Press Ctrl/Cmd+C to copy");
    });
  });

  /* ---------- vCard ---------- */
  const vcardBtn = $("#saveVcard");
  if (vcardBtn) {
    vcardBtn.addEventListener("click", () => {
      const vcf = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        "N:Shining Silver Fern LTD;;;;",
        "FN:Shining Silver Fern LTD",
        "ORG:Shining Silver Fern LTD",
        "TEL;TYPE=CELL:+64221996468",
        "EMAIL:shiningsilverfern@gmail.com",
        "URL:https://www.shiningsilverfern.co.nz/",
        "END:VCARD",
      ].join("\n");
      const blob = new Blob([vcf], { type: "text/vcard" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "ShiningSilverFern.vcf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      showToast("Contact card downloaded");
    });
  }

  /* ============================================================
     ESTIMATOR
     ============================================================ */
  const PRICING = {
    deepHourly: 75,
    carpetHourly: 95,
    windowAddon: 75,
    carpetAddon: 200,
  };
  const NZD = (n) =>
    n.toLocaleString("en-NZ", {
      style: "currency",
      currency: "NZD",
      maximumFractionDigits: 0,
    });

  const quoteForm = $("#quoteForm");
  const hoursWrap = $("#hoursWrap");
  const airbnbWrap = $("#airbnbSizeWrap");
  const airbnbSize = $("#airbnbSize");
  const hoursEl = $("#hours");
  const estimateOut = $("#estimate");
  const breakdownList = $("#breakdownList");
  const emailLink = $("#emailLink");
  const copyEstimateBtn = $("#copyEstimate");

  let lastTotal = 0;
  let lastLines = [];

  function getService() {
    const checked = quoteForm
      ? quoteForm.querySelector('input[name="service"]:checked')
      : null;
    return checked ? checked.value : "airbnb";
  }

  function animateTotal(to) {
    if (!estimateOut) return;
    if (reduceMotion) {
      estimateOut.textContent = NZD(to);
      return;
    }
    const from = lastTotal;
    const dur = 450;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      estimateOut.textContent = NZD(Math.round(from + (to - from) * eased));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function updateVisibility() {
    const svc = getService();
    const isHourly = svc === "deep" || svc === "carpet";
    if (hoursWrap) hoursWrap.classList.toggle("hide", !isHourly);
    if (airbnbWrap) airbnbWrap.classList.toggle("hide", isHourly);
  }

  function calculate() {
    if (!quoteForm) return;
    const svc = getService();
    const lines = [];
    let total = 0;

    if (svc === "airbnb") {
      const price = Number(airbnbSize ? airbnbSize.value : 0);
      const label = airbnbSize
        ? airbnbSize.options[airbnbSize.selectedIndex].text.split("—")[0].trim()
        : "Airbnb clean";
      total += price;
      lines.push({ label: `Airbnb · ${label}`, value: price });
    } else {
      const rate = svc === "deep" ? PRICING.deepHourly : PRICING.carpetHourly;
      let hrs = Math.max(1, Math.min(16, Number(hoursEl ? hoursEl.value : 0) || 0));
      const cost = rate * hrs;
      total += cost;
      const name = svc === "deep" ? "Deep clean" : "Carpet clean";
      lines.push({ label: `${name} · ${hrs} hr × ${NZD(rate)}`, value: cost });
    }

    if ($("#window_addon") && $("#window_addon").checked) {
      total += PRICING.windowAddon;
      lines.push({ label: "Window cleaning add-on", value: PRICING.windowAddon });
    }
    if ($("#carpet_addon") && $("#carpet_addon").checked) {
      total += PRICING.carpetAddon;
      lines.push({ label: "Carpet add-on (with package)", value: PRICING.carpetAddon });
    }

    animateTotal(total);

    if (breakdownList) {
      breakdownList.innerHTML = lines
        .map((l) => `<li><span>${l.label}</span><strong>${NZD(l.value)}</strong></li>`)
        .join("");
    }

    lastTotal = total;
    lastLines = lines;

    if (emailLink) {
      const subject = encodeURIComponent("Website estimate — Shining Silver Fern");
      const bodyText =
        lines.map((l) => `${l.label}: ${NZD(l.value)}`).join("\n") +
        `\n\nEstimated total: ${NZD(total)} (GST incl., indicative)`;
      emailLink.href =
        "mailto:shiningsilverfern@gmail.com?subject=" +
        subject +
        "&body=" +
        encodeURIComponent(bodyText);
      emailLink.classList.remove("disabled");
      emailLink.setAttribute("aria-disabled", "false");
    }
  }

  if (quoteForm) {
    quoteForm.addEventListener("submit", (e) => e.preventDefault());
    quoteForm.addEventListener("change", () => {
      updateVisibility();
      calculate();
    });
    quoteForm.addEventListener("input", calculate);

    $$(".stepper-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!hoursEl) return;
        const step = Number(btn.dataset.step || 0);
        const next = Math.max(1, Math.min(16, (Number(hoursEl.value) || 0) + step));
        hoursEl.value = next;
        calculate();
      });
    });

    if (copyEstimateBtn) {
      copyEstimateBtn.addEventListener("click", async () => {
        if (!lastLines.length) return;
        const text =
          "Shining Silver Fern — estimate\n" +
          lastLines.map((l) => `• ${l.label}: ${NZD(l.value)}`).join("\n") +
          `\nTotal: ${NZD(lastTotal)} (GST incl., indicative)`;
        const ok = await copyText(text);
        showToast(ok ? "Estimate copied" : "Press Ctrl/Cmd+C to copy");
      });
    }

    updateVisibility();
    calculate();
  }

  /* ============================================================
     CONTACT FORM validation
     ============================================================ */
  const contactForm = $("#contactForm");
  if (contactForm) {
    const note = $("#formNote");
    const fields = {
      "cf-name": (v) => (v.trim() ? "" : "Please enter your name."),
      "cf-email": (v) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "Enter a valid email address.",
      "cf-msg": (v) => (v.trim().length >= 5 ? "" : "Tell us a little about the job."),
    };

    function validateField(id) {
      const input = document.getElementById(id);
      const errEl = contactForm.querySelector(`.field-error[data-for="${id}"]`);
      if (!input) return true;
      const msg = fields[id](input.value);
      if (errEl) errEl.textContent = msg;
      input.classList.toggle("invalid", !!msg);
      return !msg;
    }

    Object.keys(fields).forEach((id) => {
      const input = document.getElementById(id);
      if (input) {
        input.addEventListener("blur", () => validateField(id));
        input.addEventListener("input", () => {
          if (input.classList.contains("invalid")) validateField(id);
        });
      }
    });

    contactForm.addEventListener("submit", (e) => {
      const allValid = Object.keys(fields).map(validateField).every(Boolean);
      if (!allValid) {
        e.preventDefault();
        if (note) {
          note.hidden = false;
          note.classList.remove("ok");
          note.textContent = "Please fix the highlighted fields and try again.";
        }
        const firstInvalid = contactForm.querySelector(".control.invalid");
        if (firstInvalid) firstInvalid.focus();
        return;
      }
      // Valid: let the mailto action open the user's email client
      if (note) {
        note.hidden = false;
        note.classList.add("ok");
        note.textContent = "Opening your email app to send…";
      }
    });
  }
})();
