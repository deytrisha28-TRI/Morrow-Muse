// Premium scroll choreography: scrubbed movement, layered reveals and responsive motion.
import { gsap } from 'https://cdn.jsdelivr.net/npm/gsap@3.13.0/+esm';
import { ScrollTrigger } from 'https://cdn.jsdelivr.net/npm/gsap@3.13.0/ScrollTrigger/+esm';
gsap.registerPlugin(ScrollTrigger);

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile = matchMedia('(max-width: 700px)').matches;
if (!reduce) {
  gsap.config({ nullTargetWarn: false });
  ScrollTrigger.config({ ignoreMobileResize: true });

  const intro = gsap.timeline({ defaults: { ease: 'power4.out' }, delay: .12 });
  intro.from('.hero-copy .eyebrow', { y: 18, opacity: 0, duration: .8 })
    .from('.hero h1', { y: 42, opacity: 0, duration: 1.05 }, '-=.55')
    .from('.hero-lede', { y: 22, opacity: 0, duration: .8 }, '-=.65')
    .from('.hero-actions > *', { y: 18, opacity: 0, stagger: .12, duration: .65 }, '-=.55')
    .from('.hero-art', { y: 55, rotateY: -9, opacity: 0, duration: 1.25 }, '-=1');

  gsap.to('.seal-stamp', { y: -12, rotate: 15, duration: 3.4, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  gsap.to('.hero-image-frame', { y: -9, duration: 5.5, repeat: -1, yoyo: true, ease: 'sine.inOut' });

  // Section headings glide into place while their artwork has a gentle depth shift.
  gsap.utils.toArray('.section-heading').forEach((heading) => {
    gsap.from(heading.children, { y: 34, opacity: 0, stagger: .14, duration: .9, ease: 'power3.out',
      scrollTrigger: { trigger: heading, start: 'top 86%', once: true } });
  });

  gsap.utils.toArray('.art-card, .polaroid-card').forEach((card, i) => {
    gsap.fromTo(card,
      { y: mobile ? 48 : 105, rotateZ: i % 2 ? 4 : -4, rotateY: mobile ? 0 : (i % 2 ? -8 : 8), scale: .96, opacity: 0 },
      { y: 0, rotateZ: 0, rotateY: 0, scale: 1, opacity: 1, ease: 'none',
        scrollTrigger: { trigger: card, start: 'top 94%', end: 'top 48%', scrub: 1.25 } });
  });

  gsap.fromTo('.story-image', { x: -55, rotateY: -18, rotateZ: -5, opacity: 0 }, {
    x: 0, rotateY: 0, rotateZ: -1.5, opacity: 1, ease: 'none',
    scrollTrigger: { trigger: '.story-section', start: 'top 82%', end: 'center 48%', scrub: 1.15 }
  });
  gsap.from('.story-copy > *', { y: 28, opacity: 0, stagger: .12, duration: .85, ease: 'power3.out',
    scrollTrigger: { trigger: '.story-copy', start: 'top 78%', once: true } });

  gsap.fromTo('.price-menu', { y: 75, rotateY: mobile ? 0 : 10, opacity: 0 }, { y: 0, rotateY: 0, opacity: 1, ease: 'none',
    scrollTrigger: { trigger: '.commission-layout', start: 'top 84%', end: 'center 48%', scrub: 1.2 } });
  gsap.fromTo('.commission-aside', { y: 90, rotateZ: 5, opacity: 0 }, { y: 0, rotateZ: 0, opacity: 1, ease: 'none',
    scrollTrigger: { trigger: '.commission-layout', start: 'top 86%', end: 'center 45%', scrub: 1.25 } });
  gsap.from('.order-copy > *', { x: -28, opacity: 0, stagger: .13, duration: .8, ease: 'power3.out',
    scrollTrigger: { trigger: '.order-section', start: 'top 75%', once: true } });
  gsap.from('.order-form', { y: 65, rotateY: mobile ? 0 : -7, opacity: 0, duration: 1.05, ease: 'power3.out',
    scrollTrigger: { trigger: '.order-section', start: 'top 68%', once: true } });
  gsap.utils.toArray('.faq-list details').forEach((item, i) => gsap.from(item, {
    y: 20, opacity: 0, duration: .65, delay: i * .045, ease: 'power2.out',
    scrollTrigger: { trigger: item, start: 'top 93%', once: true }
  }));

  // A restrained background drift ties the whole page together.
  gsap.to('.ambient-wash', { yPercent: -18, scale: 1.08, ease: 'none',
    scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 1.8 } });
  gsap.utils.toArray('.story-section, .order-section').forEach(section => {
    gsap.fromTo(section, { backgroundPosition: '50% 0%' }, { backgroundPosition: '50% 100%', ease: 'none',
      scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 1.4 } });
  });
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
}
