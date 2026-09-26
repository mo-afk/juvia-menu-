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
css/style.css       Mobile and desktop styles
js/app.js           All application logic + SUPABASE_URL / SUPABASE_ANON_KEY
images/             Static photos
manifest.webmanifest, sw.js, juvia-icon.svg   PWA assets
```

External libraries are loaded from CDNs in the `<head>` of each HTML file
(Supabase JS, Lucide icons, libphonenumber-js, qrcode-generator,
canvas-confetti), so an internet connection is required on first load.
The staff QR decoder is served locally from `js/vendor/html5-qrcode.min.js`
(html5-qrcode 2.3.8, Apache-2.0; license alongside the bundle). This avoids
CDN failures leaving a working camera with no decoder. The upstream npm
package places this bundle at its root, not under `dist/`.

> The Supabase *anon* key is safe to ship in frontend code — it was
> embedded in the original React build as well. Access control is
> enforced by Row Level Security in Supabase, not by hiding the key.

## Regression checks (optional, Node.js required only for tests)

Serve the repository with `python3 -m http.server 8000`, then in another terminal:

```sh
npm ci --prefix tests
cd tests
npx playwright install chromium
npm test
```

The browser tests use the actual bundled decoder, a generated QR code in a
synthetic camera stream, and mocked Supabase responses (no production writes).
They check mobile/desktop widths, the tap-to-play video modal (inline muted
attributes, `play()` requested inside the tap before the reveal animation,
pause + rewind to 0 on close), successful decoding and camera shutdown,
unknown members, permission denial, cancellation, restart, and manual fallback.
Use `BASE_URL` for a different server, or `BROWSER_EXECUTABLE_PATH` for an
already-installed Chromium. Real-device autofocus/permissions still need a
quick HTTPS smoke test on the staff phone.
