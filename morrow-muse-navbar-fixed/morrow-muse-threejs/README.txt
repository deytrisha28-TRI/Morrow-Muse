MORROW & MUSE — RESPONSIVE ART STUDIO MINI PROJECT
==================================================

STACK
- Frontend: HTML5, CSS3, vanilla JavaScript + Three.js (3D hero scene)
- Backend: Python Flask
- Database: SQLite (morrow_muse.db is created automatically)
- Uploads: local uploads/ folder (JPG, PNG, WEBP; max 5 MB)

FEATURES
- Responsive vintage parchment / antique-brown portfolio
- Three.js 3D floating gold-leaf petals and warm dust particles in the hero, with pointer parallax
- Sticky navigation, mobile menu, scroll reveal animations
- Artwork gallery lightbox and reduced-motion accessibility support
- Commission enquiry form connected to Flask REST endpoint
- Orders saved to SQLite with optional contact and reference image
- Private admin desk at /admin with order counts and status management

RUN LOCALLY
1. Install Python 3.10+.
2. Open a terminal in this folder.
3. Create and activate a virtual environment (recommended):
   Windows: py -m venv .venv && .venv\Scripts\activate
   macOS/Linux: python3 -m venv .venv && source .venv/bin/activate
4. Install dependencies:
   pip install -r requirements.txt
5. Start the server:
   python app.py
6. Visit http://127.0.0.1:5000

ADMIN DASHBOARD
- Visit http://127.0.0.1:5000/admin
- Demo password: muse2027
- Change it before deployment by setting ADMIN_PASSWORD.
- Set SECRET_KEY to a long random value before deployment.

Windows PowerShell example:
  $env:ADMIN_PASSWORD="your-strong-password"
  $env:SECRET_KEY="your-long-random-secret"
  python app.py

macOS/Linux example:
  export ADMIN_PASSWORD="your-strong-password"
  export SECRET_KEY="your-long-random-secret"
  python app.py

API
POST /api/orders (multipart/form-data)
Fields: name (required), service (required), details (required), contact, photo,
reference_image (optional JPG/PNG/WEBP file).
Returns JSON containing the new order ID.

PROJECT STRUCTURE
app.py                  Flask backend + SQLite + admin dashboard
index.html              Portfolio page
styles.css              Theme, responsive layout and animations
script.js               Navigation, reveal effects, lightbox and form API
three-scene.js          Three.js 3D hero animation (CDN import)
assets/                 Brand and artwork images
uploads/                Uploaded customer reference images (created automatically)
morrow_muse.db          SQLite database (created automatically)

NOTES
- This is a learning/demo mini project. Before public production deployment, use
  HTTPS, a strong secret and admin password, CSRF protection, rate limiting,
  backups, and a production WSGI server. Do not use Flask debug mode in production.
- Uploaded reference photos may contain personal information. Restrict access,
  obtain customer consent, and define a retention/deletion policy.

THREE.JS NOTE
- The 3D hero scene imports Three.js from jsDelivr, so an internet connection is needed for that effect.
- If WebGL is unavailable or reduced motion is enabled, the rest of the site still works normally.

IMMERSIVE 3D UPDATE
-------------------
This version includes a page-wide Three.js scene with floating framed artwork,
soft gold dust, drifting petals and decorative 3D rings. Scroll position moves
the virtual camera through the keepsake scene. GSAP + ScrollTrigger choreograph
section transitions, 3D card reveals, the artist story, commission panel and
order form. The layout adapts to touch screens and reduces scene complexity on
smaller devices. prefers-reduced-motion disables continuous 3D and scroll motion.

The Three.js and GSAP modules are loaded from jsDelivr, so internet access is
needed for the immersive effects. The Flask order API and SQLite database remain
unchanged. Run with: pip install -r requirements.txt && python app.py
