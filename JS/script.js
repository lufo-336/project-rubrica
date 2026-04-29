const cubo = document.getElementById('cubo');

// --- Stato ---
let rotX = -20;
let rotY = 0;
let modalita = 'rotazione';
let dragging = false;
let startX, startY, startRotX, startRotY;

// --- Rotazione target per ogni faccia ---
const facceTarget = {
  fronte:   { x: 0,   y: 0   },
  dietro:   { x: 0,   y: 180 },
  destra:   { x: 0,   y: -90 },
  sinistra: { x: 0,   y: 90  },
  sopra:    { x: -90, y: 0   },
  sotto:    { x: 90,  y: 0   }
};

// --- Funzione che applica la rotazione al cubo ---
function applicaRotazione(zoom) {
  const avanzamento = zoom ? 'translateZ(150px) ' : '';
  cubo.style.transform = avanzamento + 'rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg)';
}

// ------------------------------------------------
// MOUSE DRAG
// ------------------------------------------------
cubo.addEventListener('mousedown', function(e) {
  if (modalita !== 'rotazione') return;
  dragging = true;
  startX = e.clientX;
  startY = e.clientY;
  startRotX = rotX;
  startRotY = rotY;
  cubo.style.transition = 'none';
  e.preventDefault();
});

window.addEventListener('mousemove', function(e) {
  if (!dragging) return;
  const dx = e.clientX - startX;
  const dy = e.clientY - startY;
  rotY = startRotY + dx * 0.5;
  rotX = startRotX - dy * 0.5;
  applicaRotazione(false); // ← niente zoom mentre trascino
});

window.addEventListener('mouseup', function() {
  if (!dragging) return;
  dragging = false;
  cubo.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
});

// ------------------------------------------------
// FRECCE TASTIERA
// ------------------------------------------------
window.addEventListener('keydown', function(e) {
  if (modalita !== 'rotazione') return;
  const step = 15;
  if (e.key === 'ArrowLeft')  rotY -= step;
  if (e.key === 'ArrowRight') rotY += step;
  if (e.key === 'ArrowUp')    rotX += step;
  if (e.key === 'ArrowDown')  rotX -= step;
  cubo.style.transition = 'transform 0.3s ease';
  applicaRotazione(false); // ← niente zoom con le frecce
});

// ------------------------------------------------
// CLICK SU UNA FACCIA → raddrizza e zoom in
// ------------------------------------------------
document.querySelectorAll('.faccia').forEach(function(faccia) {
  faccia.addEventListener('click', function(e) {
    e.stopPropagation();
    if (modalita === 'faccia') return;

    const nomeFaccia = Array.from(faccia.classList).find(function(c) {
      return c !== 'faccia';
    });

    const target = facceTarget[nomeFaccia];
    if (!target) return;

    modalita = 'faccia';
    rotX = target.x;
    rotY = target.y;
    cubo.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
    applicaRotazione(true); // ← zoom in corretto
  });
});

// ------------------------------------------------
// CLICK SU SPAZIO VUOTO → torna in modalità rotazione
// ------------------------------------------------
document.addEventListener('click', function() {
  if (modalita !== 'faccia') return;
  modalita = 'rotazione';
  cubo.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
  applicaRotazione(false); // ← zoom out corretto
});

// --- Posizione iniziale ---
applicaRotazione(false);