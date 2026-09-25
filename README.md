# Juvia Pass — Menu & Fidélité

Pure **HTML5 / CSS3 / JavaScript** — no Node.js, no build step.

## Run locally

1. Open this folder in **VS Code**.
2. Paste your Supabase **anon key** into `js/config.js`.
3. Right-click `index.html` → **"Open with Live Server"** (extension).
4. The menu opens in Chrome immediately.

## Pages

| Page | File |
|------|------|
| Customer menu + Juvia Pass | `index.html` |
| Staff loyalty scanner | `staff-scan.html` |

## Structure

```
index.html          Menu page (customer-facing)
staff-scan.html     Staff scanner page (PIN-protected)
css/style.css       All styles (unchanged from the original design)
js/config.js        Supabase URL + anon key — edit by hand
js/app.js           All application logic (vanilla JS)
images/             Static photos
manifest.webmanifest, sw.js, juvia-icon.svg   PWA assets
```

External libraries are loaded from CDNs in the `<head>` of each HTML file
(Supabase JS, Lucide icons, libphonenumber-js, qrcode-generator,
canvas-confetti, html5-qrcode — staff page only), so an internet
connection is required on first load.
