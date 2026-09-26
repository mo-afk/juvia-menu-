# Juvia Pass — Menu & Fidélité

Pure **HTML5 / CSS3 / JavaScript** — no Node.js, no build step.
Supabase credentials are hardcoded at the top of `js/app.js`;
no `.env` file or environment loader is needed in the browser.

## Run locally

1. Open this folder in **VS Code**.
2. Open `js/app.js` and paste your Supabase **anon public key**
   into `SUPABASE_ANON_KEY` (top of the file — the URL is already set).
3. Right-click `index.html` → **"Open with Live Server"** (extension).
4. The menu opens in Chrome immediately, pass registration included.

## Pages

| Page | File |
|------|------|
| Customer menu + Juvia Pass | `index.html` |
| Staff loyalty scanner | `staff-scan.html` |

### Staff scanner — camera requirements

Camera access (`getUserMedia`/WebRTC) is only allowed by browsers in a
**secure context**: open the staff page over **HTTPS** (Vercel deployment)
or via **`http://localhost` / `http://127.0.0.1`** with Live Server.
On any other origin (e.g. a LAN IP like `http://192.168.x.x`) the browser
blocks the camera — the scanner detects this and explains it on screen,
and the manual UUID entry always remains available as a fallback.

## Structure

```
index.html          Menu page (customer-facing)
staff-scan.html     Staff scanner page (PIN-protected)
css/style.css       All styles (unchanged from the original design)
js/app.js           All application logic + SUPABASE_URL / SUPABASE_ANON_KEY
images/             Static photos
manifest.webmanifest, sw.js, juvia-icon.svg   PWA assets
```

External libraries are loaded from CDNs in the `<head>` of each HTML file
(Supabase JS, Lucide icons, libphonenumber-js, qrcode-generator,
canvas-confetti, html5-qrcode — staff page only), so an internet
connection is required on first load.

> The Supabase *anon* key is safe to ship in frontend code — it was
> embedded in the original React build as well. Access control is
> enforced by Row Level Security in Supabase, not by hiding the key.
