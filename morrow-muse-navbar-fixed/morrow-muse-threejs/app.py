from flask import Flask, request, jsonify, send_from_directory, render_template_string, session, redirect, url_for, flash
from werkzeug.utils import secure_filename
from pathlib import Path
from datetime import datetime, timezone
import sqlite3, os, re

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / 'morrow_muse.db'
UPLOAD_DIR = BASE_DIR / 'uploads'
UPLOAD_DIR.mkdir(exist_ok=True)
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}
app = Flask(__name__, static_folder=None)
app.secret_key = os.environ.get('SECRET_KEY', 'change-this-demo-secret-before-deployment')
app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024


def db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with db() as conn:
        conn.execute('''CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            contact TEXT,
            service TEXT NOT NULL,
            details TEXT NOT NULL,
            photo_url TEXT,
            photo_file TEXT,
            status TEXT NOT NULL DEFAULT 'New',
            created_at TEXT NOT NULL
        )''')


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.get('/')
def home():
    return send_from_directory(BASE_DIR, 'index.html')


@app.get('/<path:filename>')
def public_files(filename):
    # Only serve project assets, never the database or uploaded private files.
    if filename.startswith('assets/') or filename in ('styles.css', 'script.js', 'three-scene.js'):
        return send_from_directory(BASE_DIR, filename)
    return ('Not found', 404)


@app.post('/api/orders')
def create_order():
    name = request.form.get('name', '').strip()
    contact = request.form.get('contact', '').strip()
    service = request.form.get('service', '').strip()
    details = request.form.get('details', '').strip()
    photo_url = request.form.get('photo', '').strip()
    if not name or not service or not details:
        return jsonify(ok=False, message='Please complete your name, artwork choice and order details.'), 400
    if len(name) > 100 or len(details) > 2000 or len(contact) > 100:
        return jsonify(ok=False, message='Some fields are too long. Please shorten them and try again.'), 400
    if photo_url and not re.match(r'^https?://', photo_url, re.I):
        return jsonify(ok=False, message='Reference link must start with http:// or https://.'), 400

    photo_file = None
    uploaded = request.files.get('reference_image')
    if uploaded and uploaded.filename:
        if not allowed_file(uploaded.filename):
            return jsonify(ok=False, message='Please upload a JPG, PNG or WEBP image.'), 400
        safe_name = secure_filename(uploaded.filename)
        unique_name = f"{datetime.now().strftime('%Y%m%d%H%M%S%f')}_{safe_name}"
        uploaded.save(UPLOAD_DIR / unique_name)
        photo_file = unique_name

    with db() as conn:
        cur = conn.execute('''INSERT INTO orders (name, contact, service, details, photo_url, photo_file, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)''',
            (name, contact, service, details, photo_url, photo_file, datetime.now(timezone.utc).isoformat()))
        order_id = cur.lastrowid
    return jsonify(ok=True, message='Your enquiry has been received. Trisha will get back to you soon.', order_id=order_id), 201


ADMIN_HTML = '''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Morrow & Muse | Studio desk</title><link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet"><style>
:root{--paper:#f3dfc0;--light:#f8ead3;--ink:#392013;--rust:#8a4f2c}*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font:14px 'DM Sans',sans-serif;padding:24px}.wrap{max-width:1100px;margin:auto}.top{display:flex;justify-content:space-between;align-items:center;gap:20px;flex-wrap:wrap}h1{font:600 clamp(34px,6vw,56px) 'Cormorant Garamond',serif;margin:10px 0}p{color:#76563b}.card{background:var(--light);padding:22px;border:1px solid #d0ad82;box-shadow:0 12px 35px #4b2b1b18;margin:18px 0}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px}.stat{font:600 32px 'Cormorant Garamond',serif}.muted{font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--rust)}input,button,select{font:inherit;padding:11px;border:1px solid #c9a77e;background:#fff8eb;color:var(--ink)}button{background:var(--ink);color:var(--light);cursor:pointer;border:0}form.login{display:flex;gap:10px;flex-wrap:wrap}table{width:100%;border-collapse:collapse;min-width:700px}th,td{text-align:left;padding:13px 10px;border-bottom:1px solid #ddc4a3;vertical-align:top}th{font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:var(--rust)}.table-wrap{overflow-x:auto}.status{display:flex;gap:6px;align-items:center}.status select{padding:7px}.logout{color:var(--rust)}.flash{padding:10px;background:#ead1ad;margin:10px 0}.empty{text-align:center;padding:30px}
</style></head><body><main class="wrap"><div class="top"><div><p class="muted">MORROW & MUSE · PRIVATE STUDIO DESK</p><h1>Order enquiries</h1></div>{% if logged %}<a class="logout" href="/admin/logout">Log out ↗</a>{% endif %}</div>
{% for msg in get_flashed_messages() %}<div class="flash">{{msg}}</div>{% endfor %}
{% if not logged %}<section class="card"><h2>Studio sign in</h2><p>Enter the admin password to view incoming enquiries.</p><form class="login" method="post"><input type="password" name="password" placeholder="Admin password" required><button>Sign in</button></form></section>{% else %}<section class="grid"> <div class="card"><div class="muted">Total enquiries</div><div class="stat">{{stats.total}}</div></div><div class="card"><div class="muted">New enquiries</div><div class="stat">{{stats.new}}</div></div><div class="card"><div class="muted">In progress</div><div class="stat">{{stats.progress}}</div></div><div class="card"><div class="muted">Completed</div><div class="stat">{{stats.done}}</div></div></section><section class="card"><div class="table-wrap"><table><thead><tr><th>Order</th><th>Customer</th><th>Artwork & details</th><th>Reference</th><th>Received</th><th>Status</th></tr></thead><tbody>{% for o in orders %}<tr><td>#{{o.id}}</td><td><strong>{{o.name}}</strong><br>{{o.contact or 'No contact shared'}}</td><td><strong>{{o.service}}</strong><br>{{o.details}}</td><td>{% if o.photo_url %}<a href="{{o.photo_url}}" target="_blank" rel="noopener">Photo link</a>{% elif o.photo_file %}<a href="/admin/uploads/{{o.photo_file}}" target="_blank">Uploaded image</a>{% else %}—{% endif %}</td><td>{{o.created_at[:16].replace('T',' ')}}</td><td><form class="status" method="post" action="/admin/status/{{o.id}}"><select name="status">{% for s in ['New','Contacted','In progress','Completed','Cancelled'] %}<option {% if o.status==s %}selected{% endif %}>{{s}}</option>{% endfor %}</select><button>Save</button></form></td></tr>{% else %}<tr><td colspan="6" class="empty">No enquiries yet. The studio is waiting for its first masterpiece.</td></tr>{% endfor %}</tbody></table></div></section>{% endif %}</main></body></html>'''


@app.route('/admin', methods=['GET', 'POST'])
def admin():
    if request.method == 'POST' and not session.get('admin'):
        expected = os.environ.get('ADMIN_PASSWORD', 'muse2027')
        if request.form.get('password') == expected:
            session['admin'] = True
            return redirect(url_for('admin'))
        flash('Incorrect password.')
    if not session.get('admin'):
        return render_template_string(ADMIN_HTML, logged=False, orders=[], stats={})
    with db() as conn:
        orders = conn.execute('SELECT * FROM orders ORDER BY id DESC').fetchall()
        total = conn.execute('SELECT COUNT(*) FROM orders').fetchone()[0]
        new = conn.execute("SELECT COUNT(*) FROM orders WHERE status='New'").fetchone()[0]
        progress = conn.execute("SELECT COUNT(*) FROM orders WHERE status='In progress'").fetchone()[0]
        done = conn.execute("SELECT COUNT(*) FROM orders WHERE status='Completed'").fetchone()[0]
    return render_template_string(ADMIN_HTML, logged=True, orders=orders, stats={'total':total,'new':new,'progress':progress,'done':done})


@app.post('/admin/status/<int:order_id>')
def update_status(order_id):
    if not session.get('admin'):
        return redirect(url_for('admin'))
    status = request.form.get('status', 'New')
    if status not in {'New','Contacted','In progress','Completed','Cancelled'}:
        status = 'New'
    with db() as conn:
        conn.execute('UPDATE orders SET status=? WHERE id=?', (status, order_id))
    return redirect(url_for('admin'))


@app.get('/admin/uploads/<path:filename>')
def admin_upload(filename):
    if not session.get('admin'):
        return redirect(url_for('admin'))
    return send_from_directory(UPLOAD_DIR, filename)


@app.get('/admin/logout')
def admin_logout():
    session.clear()
    return redirect(url_for('admin'))


@app.errorhandler(413)
def too_large(_error):
    return jsonify(ok=False, message='Image is too large. Please keep uploads under 5 MB.'), 413


init_db()
if __name__ == '__main__':
    app.run(debug=True)
