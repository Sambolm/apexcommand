APEX COMMAND v4 — VISUAL MATCH BUILD

FILES
- index.html
- styles.css
- app.js
- manifest.json
- sw.js
- assets/hotel.webp
- icons/icon.svg
- icons/icon-192.png
- icons/icon-512.png

TEST LOGIN
1. Open the app.
2. User is Teri.
3. On first launch, type any password you want. That password is hashed and stored only in this browser/device.
4. Future logins require that password unless you choose Reset local password.

FUNCTIONAL FEATURES
- PWA / installable web app shell
- Login screen
- Holographic hotel graphic based on the supplied hotel photo
- Home dashboard
- Captures with delete/export
- Follow-ups with completion/delete/filtering
- Reports generated from current app data
- Print / Save PDF via the browser print dialog
- Timeline
- Outlet overview
- Document metadata library
- On-device Apex AI responses using live app data
- Hidden droid encounters and persistent droid collection
- Offline cache via service worker
- Local persistence via localStorage

IMPORTANT
This is a static PWA test build. Real multi-device sync, secure server-side authentication,
persistent cloud document storage, and a production LLM connection require a backend.
Do not place an OpenAI API key directly in app.js.

V4 VISUAL UPDATE
- Restyled to closely match the approved concept image.
- More compact mobile dashboard.
- Stronger gold/blue executive sci-fi styling.
- Hotel hologram still uses the supplied resort photograph.
- Added a visible Hidden Droid Encounter collection on Home.


V4.1 GITHUB PAGES FIX
This package is intentionally FLAT: every file belongs in the root of your GitHub repository.
Do not put hotel.webp or icons into subfolders for this version.

Your repository root should show:
- index.html
- styles.css
- app.js
- manifest.json
- sw.js
- hotel.webp
- icon.svg
- icon-192.png
- icon-512.png
- README.txt

This fixes the missing hotel image on GitHub Pages.


V4.2 RESORT HOLOGRAM FIX
The resort photo is now embedded directly inside index.html.
There is no image path to break and no separate image upload is required for the hologram.
You may still upload hotel.webp, but the app no longer depends on it.
Replace index.html and sw.js at minimum, or upload this entire package.
