// Morrow & Muse interactions. Orders are submitted to the Flask + SQLite backend.
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav-links');
menuButton?.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
  menuButton.classList.toggle('active', isOpen);
});

document.querySelectorAll('.nav-links a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menuButton?.classList.remove('active');
  menuButton?.setAttribute('aria-expanded', 'false');
}));

document.getElementById('year').textContent = new Date().getFullYear();

// Subtle image lightbox for gallery artwork.
const lightbox = document.createElement('div');
lightbox.className = 'lightbox';
lightbox.innerHTML = '<button class="lightbox-close" aria-label="Close image">×</button><img alt="Expanded artwork preview"><p>Made with care at Morrow & Muse ♡</p>';
document.body.appendChild(lightbox);
const lightboxImage = lightbox.querySelector('img');
function closeLightbox() { lightbox.classList.remove('open'); document.body.classList.remove('lightbox-open'); }
document.querySelectorAll('.gallery-grid .art-image img, .polaroid-stack img').forEach(img => {
  img.tabIndex = 0; img.setAttribute('role', 'button'); img.setAttribute('aria-label', `Enlarge ${img.alt}`);
  const open = () => { lightboxImage.src = img.src; lightboxImage.alt = img.alt; lightbox.classList.add('open'); document.body.classList.add('lightbox-open'); };
  img.addEventListener('click', open); img.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
});
lightbox.querySelector('button').addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

// Save enquiries in SQLite through the Flask API.
const orderForm = document.getElementById('orderForm');
const statusBox = document.getElementById('formStatus');
orderForm.addEventListener('submit', async event => {
  event.preventDefault();
  if (!orderForm.reportValidity()) return;
  const submit = orderForm.querySelector('[type="submit"]');
  const original = submit.innerHTML;
  submit.disabled = true;
  submit.innerHTML = 'Sending enquiry…';
  statusBox.textContent = '';
  statusBox.className = 'form-status';
  try {
    const response = await fetch('/api/orders', { method: 'POST', body: new FormData(orderForm) });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.message || 'Something went wrong. Please try again.');
    statusBox.textContent = `${result.message} Your enquiry number is #${result.order_id}.`;
    statusBox.classList.add('success');
    orderForm.reset();
  } catch (error) {
    statusBox.textContent = error.message.includes('Failed to fetch')
      ? 'The studio server is not running. Start the Flask app, then try again.' : error.message;
    statusBox.classList.add('error');
  } finally {
    submit.disabled = false;
    submit.innerHTML = original;
  }
});

// Add a small scroll state to the header.
const header = document.querySelector('.site-header');
window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 12), { passive: true });


// Lightweight interaction polish and accessible scroll progress.
const progressBar = document.getElementById('scrollProgress');
let scrollTick = false;
function updateScrollProgress(){
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const progress = max > 0 ? Math.min(100, Math.max(0, window.scrollY / max * 100)) : 0;
  if(progressBar) progressBar.style.width = `${progress}%`;
  scrollTick = false;
}
window.addEventListener('scroll', () => {
  if(!scrollTick){ requestAnimationFrame(updateScrollProgress); scrollTick = true; }
}, {passive:true});
updateScrollProgress();

// Gentle pointer tilt on larger screens only; touch and reduced-motion stay calm.
const canTilt = matchMedia('(hover:hover) and (pointer:fine) and (min-width:900px)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches;
if(canTilt){
  document.querySelectorAll('.art-image, .polaroid-stack, .price-menu').forEach(card => {
    card.addEventListener('pointermove', event => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      card.style.transform = `perspective(900px) rotateX(${-y*4}deg) rotateY(${x*5}deg) translateY(-4px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
}
