// Morrow & Muse immersive Three.js world: scroll-linked 3D keepsakes + ambient particles.
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { gsap } from 'https://cdn.jsdelivr.net/npm/gsap@3.13.0/+esm';
import { ScrollTrigger } from 'https://cdn.jsdelivr.net/npm/gsap@3.13.0/ScrollTrigger/+esm';

gsap.registerPlugin(ScrollTrigger);

const host = document.querySelector('#three-world');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
if (host && !reduceMotion && window.WebGLRenderingContext) {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0xf3dfc0, 0.025);
  const camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, 0.1, 100);
  camera.position.set(0, 0, 10);
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !coarsePointer, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, coarsePointer ? 1 : 1.5));
  renderer.setSize(innerWidth, innerHeight);
  renderer.setClearColor(0xf3dfc0, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  host.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xffedcf, 0x70452c, 2.1));
  const key = new THREE.DirectionalLight(0xffd9a6, 2.4); key.position.set(-4, 7, 8); scene.add(key);
  const glow = new THREE.PointLight(0xc28a50, 22, 28); glow.position.set(4, 2, 3); scene.add(glow);

  const world = new THREE.Group(); scene.add(world);
  const cardGroup = new THREE.Group(); world.add(cardGroup);
  const gold = new THREE.MeshStandardMaterial({ color: 0xb47b43, metalness: .72, roughness: .34 });
  const cream = new THREE.MeshStandardMaterial({ color: 0xf5e5c9, roughness: .82 });
  const textureLoader = new THREE.TextureLoader();
  const cardData = [
    { src: 'assets/portrait-study.jpeg', x: 3.65, y: .15, z: 0, rot: -.13, scale: 1.18 },
    { src: 'assets/couple-study.jpeg', x: -3.7, y: -.35, z: -6.5, rot: .12, scale: 1.2 },
    { src: 'assets/pet-study.jpeg', x: 3.55, y: .25, z: -13, rot: -.1, scale: 1.12 },
    { src: 'assets/polaroid-study.jpeg', x: -3.55, y: -.1, z: -19.5, rot: .15, scale: 1.05 }
  ];
  const cards = [];
  cardData.forEach((item, index) => {
    const group = new THREE.Group();
    const frame = new THREE.Mesh(new THREE.BoxGeometry(2.28, 2.86, .09), gold);
    const mat = new THREE.Mesh(new THREE.BoxGeometry(2.18, 2.76, .1), cream); mat.position.z = .055;
    group.add(frame, mat);
    const imageMat = new THREE.MeshBasicMaterial({ color: 0xe6cfaa });
    const image = new THREE.Mesh(new THREE.PlaneGeometry(2.04, 2.48), imageMat); image.position.z = .12;
    group.add(image);
    textureLoader.load(item.src, texture => {
      texture.colorSpace = THREE.SRGBColorSpace;
      image.material.map = texture; image.material.color.set(0xffffff); image.material.needsUpdate = true;
    });
    group.position.set(item.x, item.y, item.z); group.rotation.z = item.rot; group.scale.setScalar(item.scale);
    group.userData = { baseY: item.y, phase: index * 1.7, baseRot: item.rot };
    cardGroup.add(group); cards.push(group);
  });

  // A slowly turning, delicate ornamental ring creates depth behind the floating frames.
  const ring = new THREE.Mesh(new THREE.TorusGeometry(2.15, .018, 8, 120), gold);
  ring.position.set(0, 0, -4.2); ring.rotation.x = .9; world.add(ring);
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.65, .009, 6, 120), cream);
  ring2.position.set(0, 0, -11); ring2.rotation.set(.5, .35, .2); world.add(ring2);

  // Tiny gold dust and softly drifting petal meshes.
  const count = coarsePointer ? (innerWidth < 390 ? 38 : 58) : 150;
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    positions[i*3] = (Math.random() - .5) * 18;
    positions[i*3+1] = (Math.random() - .5) * 11;
    positions[i*3+2] = -22 + Math.random() * 28;
    velocities[i] = .15 + Math.random() * .35;
  }
  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const dust = new THREE.Points(dustGeometry, new THREE.PointsMaterial({ color: 0x9c693c, size: .035, transparent: true, opacity: .58, sizeAttenuation: true }));
  world.add(dust);

  const petalShape = new THREE.Shape();
  petalShape.moveTo(0, 0); petalShape.bezierCurveTo(-.16, .18, -.16, .48, 0, .66); petalShape.bezierCurveTo(.16, .48, .16, .18, 0, 0);
  const petalGeo = new THREE.ShapeGeometry(petalShape, 12);
  const petals = [];
  for (let i = 0; i < (coarsePointer ? (innerWidth < 390 ? 4 : 6) : 11); i++) {
    const petal = new THREE.Mesh(petalGeo, new THREE.MeshStandardMaterial({ color: i%2 ? 0xc28b53 : 0xe0bd88, side: THREE.DoubleSide, metalness: .24, roughness: .55, transparent: true, opacity: .72 }));
    petal.position.set((Math.random()-.5)*11, (Math.random()-.5)*7, -1-Math.random()*17);
    petal.scale.setScalar(.3+Math.random()*.55); petal.userData = { phase: Math.random()*6, speed: .3+Math.random()*.5 };
    world.add(petal); petals.push(petal);
  }

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  if (!coarsePointer) window.addEventListener('pointermove', e => {
    pointer.tx = (e.clientX / innerWidth - .5) * .45;
    pointer.ty = (e.clientY / innerHeight - .5) * .28;
  }, { passive: true });

  const scrollState = { progress: 0 };
  gsap.to(scrollState, {
    progress: 1, ease: 'none',
    scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 1.25 }
  });
  const clock = new THREE.Clock();
  let raf = 0;
  function resize() {
    const w = innerWidth, h = innerHeight;
    camera.aspect = w / h;
    camera.fov = w < 600 ? 48 : w < 900 ? 43 : 38;
    camera.position.x = w < 600 ? 0 : 0;
    camera.updateProjectionMatrix(); renderer.setSize(w, h, false);
    // Keep 3D artwork outside the main reading column on narrow screens.
    cards.forEach((card, i) => {
      const side = i % 2 ? -1 : 1;
      card.position.x = side * (w < 360 ? 2.7 : w < 600 ? 2.45 : w < 900 ? 2.8 : 3.65);
      card.scale.setScalar(w < 360 ? .48 : w < 600 ? .56 : w < 900 ? .82 : cardData[i].scale);
    });
  }
  const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(document.documentElement); resize();
  function render() {
    raf = requestAnimationFrame(render);
    const t = clock.getElapsedTime();
    pointer.x += (pointer.tx - pointer.x) * .035; pointer.y += (pointer.ty - pointer.y) * .035;
    const p = scrollState.progress;
    camera.position.z = 10 - p * 22;
    camera.position.y = Math.sin(p * Math.PI * 2) * .24;
    camera.rotation.z = Math.sin(p * Math.PI * 2) * .012;
    world.rotation.y = pointer.x + Math.sin(t * .12) * .025 + p * .16;
    world.rotation.x = -pointer.y + Math.sin(t * .16) * .018;
    ring.rotation.z = t * .055 + p * 1.3;
    ring2.rotation.z = -t * .035 - p * .8;
    cards.forEach(card => {
      const d = card.userData;
      card.position.y = d.baseY + Math.sin(t * .55 + d.phase) * .16;
      card.rotation.y = Math.sin(t * .28 + d.phase) * .09 + pointer.x * .18;
      card.rotation.x = Math.cos(t * .25 + d.phase) * .035;
    });
    petals.forEach(petal => { petal.position.y += Math.sin(t * petal.userData.speed + petal.userData.phase) * .0009; petal.rotation.z += .0018; });
    const attr = dustGeometry.attributes.position;
    for (let i=0;i<count;i++) { const y = attr.array[i*3+1] + velocities[i]*.003; attr.array[i*3+1] = y > 6 ? -6 : y; }
    attr.needsUpdate = true;
    renderer.render(scene, camera);
  }
  render();
  document.addEventListener('visibilitychange', () => { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else if (!raf) render(); });
  window.addEventListener('pagehide', () => {
    cancelAnimationFrame(raf); resizeObserver.disconnect(); ScrollTrigger.getAll().forEach(t => t.kill());
    renderer.dispose(); dustGeometry.dispose(); petalGeo.dispose();
    cards.forEach(card => card.traverse(obj => { if (obj.isMesh) { obj.geometry.dispose(); if (obj.material.map) obj.material.map.dispose(); obj.material.dispose(); } }));
  }, { once: true });
} else if (host) {
  host.style.display = 'none';
}
