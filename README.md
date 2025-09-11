
# Shining Silver Fern — Static Website

A fast, accessible, GitHub Pages–ready site for **Shining Silver Fern LTD (Cleaning Solutions)**.

## Preview
Open `index.html` in a browser, or deploy to GitHub Pages (below).

## File structure
```
shining-silver-fern-site/
├── index.html
├── styles.css
├── script.js
└── assets/
    ├── logo.png
    └── favicon.png
```

## Deploy on GitHub Pages (step‑by‑step)
1. **Create the repository**
   - Go to GitHub → New repo → name it: `shining-silver-fern-site`.
   - Keep it **Public** (required for Pages).

2. **Upload the files**
   - Drag all files/folders from this project into the repo (root). Commit.

3. **Enable Pages**
   - Repository → **Settings** → **Pages**.
   - Source: **Deploy from a branch**.
   - Branch: **main** (or `master`) — **/ (root)**. Save.
   - After a minute, your site will be live at:
     `https://<your-username>.github.io/shining-silver-fern-site/`

4. **Add a custom domain (optional)**
   - Buy/configure a domain (e.g. `shiningsilverfern.co.nz`).
   - On the **Pages** screen, set the custom domain to `shiningsilverfern.co.nz` (this auto‑creates a `CNAME` file).
   - In your DNS provider:
     - create a **CNAME** record pointing `www` → `<your-username>.github.io`.
     - (Optional) create ALIAS/ANAME or A records for apex `@` to GitHub Pages IPs, or forward apex to `www`.
   - Wait for DNS to propagate, then **Enable HTTPS** in Pages.

5. **Edit business details**
   - In `index.html`: update phone, email (already set), and the `url` field inside the JSON‑LD block.
   - Adjust placeholder prices in `script.js` → `RATES` constants to your real rates.

6. **Contact form (optional upgrade)**
   - The default form uses `mailto:` (opens the user's email app). To submit without email software:
     - Sign up for [Formspree](https://formspree.io) → create a form → get the endpoint URL.
     - Replace the `<form action="mailto:..." ...>` with `action="https://formspree.io/f/<id>" method="POST"` and add:
       ```html
       <input type="hidden" name="_subject" value="Website Quote Request">
       ```
     - Commit & push.

7. **Edit colours, content and images**
   - Colour tokens live in `styles.css` under `:root`. Use your brand blue (`--brand`) and accents.
   - Replace `assets/logo.png` with a higher‑resolution transparent PNG if desired.
   - All content lives in semantic sections for easy editing.

## Accessibility and performance
- Semantic HTML with `<header>`, `<main>`, `<section>`, `<nav>`, `<footer>`.
- Skip‑to‑content link, labelled navigation, keyboard‑friendly controls.
- High colour contrast and focus outlines.
- Minimal JavaScript (no frameworks) and lazy viewport animations.
- OpenGraph + JSON‑LD for better SEO.

## Local development
No build step is required. Double‑click `index.html` or run a simple server:
```bash
python3 -m http.server
```
Then open http://localhost:8000

---
© Shining Silver Fern LTD
