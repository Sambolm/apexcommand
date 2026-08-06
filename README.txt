APEX COMMAND v4.3 — iPHONE / GITHUB PAGES ASSET FIX

IMPORTANT:
Upload EVERY file in this ZIP directly into the ROOT of the GitHub repository.

Required root files:
- index.html
- styles.css
- app.js
- manifest.json
- sw.js
- hotel.jpg
- apple-touch-icon.png
- favicon.png
- icon-192.png
- icon-512.png
- icon.svg
- README.txt

WHAT CHANGED
- Resort image converted from WEBP to standard JPEG.
- Resort image uses a simple root path: hotel.jpg
- Added dedicated iPhone apple-touch-icon.png (180x180).
- Added favicon.png.
- Added cache-busting query strings.
- Disabled service-worker caching temporarily and automatically unregister old service workers.
- New sw.js deletes old caches so stale versions stop overriding GitHub updates.

AFTER UPLOAD
1. Wait about 1 minute for GitHub Pages to update.
2. Open the GitHub Pages site in Safari.
3. Refresh once.
4. If you previously added Apex Command to the iPhone Home Screen, DELETE that old Home Screen icon.
5. Reopen the site in Safari and use Share > Add to Home Screen again.
   iOS often keeps an old home-screen icon even after the website files change.

The resort hologram is now a normal JPEG at the repository root for maximum iPhone compatibility.
