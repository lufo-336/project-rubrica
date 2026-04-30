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
  aggiornaPointerEvents();
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
    aggiornaPointerEvents();
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

// --- Abilita input solo in modalità faccia ---
function aggiornaPointerEvents() {
  const contenuti = document.querySelectorAll('.faccia-contenuto');
  contenuti.forEach(function(c) {
    c.style.pointerEvents = modalita === 'faccia' ? 'auto' : 'none';
  });
}

const rubrica = [];

// --- Renderizza la lista contatti sulla faccia Destra ---
function renderLista() {
  const ul = document.getElementById('lista-contatti');
  ul.innerHTML = '';

  if (rubrica.length === 0) {
    ul.innerHTML = '<li style="opacity:0.5; cursor:default;">Nessun contatto</li>';
    return;
  }

  rubrica.forEach(function(contatto, indice) {
    const li = document.createElement('li');
    li.textContent = contatto.nome + ' ' + contatto.cognome;
    li.dataset.indice = indice;
    ul.appendChild(li);
  });
}

// --- Validazione form contatto ---
function validaForm() {
  const nome    = document.getElementById('inp-nome').value.trim();
  const cognome = document.getElementById('inp-cognome').value.trim();
  const tel     = document.getElementById('inp-tel').value.trim();
  const email   = document.getElementById('inp-email').value.trim();

  // Solo lettere, spazi, apostrofi e accenti (nomi come "D'Angelo", "Müller")
  const regexNome  = /^[a-zA-ZÀ-ÿ\s']{1,50}$/;
  // Da 7 a 15 cifre, con opzionale + iniziale (es. +39...)
  const regexTel   = /^\+?[0-9]{7,15}$/;
  // Email standard
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!regexNome.test(nome))    return 'Nome non valido (solo lettere, max 50)';
  if (!regexNome.test(cognome)) return 'Cognome non valido (solo lettere, max 50)';
  if (!regexTel.test(tel))      return 'Telefono non valido (7-15 cifre, + opzionale)';
  if (!regexEmail.test(email))  return 'Email non valida';

  return null; // tutto ok
}

document.getElementById('btn-salva').addEventListener('click', function() {
  const errore = validaForm();
  if (errore) {
    alert(errore); // per ora un alert semplice — lo miglioreremo
    return;
  }
  // --- Array che contiene tutti i contatti ---


// --- Salvataggio contatto ---
document.getElementById('btn-salva').addEventListener('click', function() {
  const errore = validaForm();
  if (errore) {
    alert(errore);
    return;
  }

  const contatto = {
    nome:     document.getElementById('inp-nome').value.trim(),
    cognome:  document.getElementById('inp-cognome').value.trim(),
    tel:      document.getElementById('inp-tel').value.trim(),
    email:    document.getElementById('inp-email').value.trim(),
    avatar:   document.getElementById('inp-avatar').value.trim()
  };

  rubrica.push(contatto);
  renderLista();
  // --- Ricerca contatti in tempo reale ---
function renderRicerca(filtro) {
  const ul = document.getElementById('lista-ricerca');
  ul.innerHTML = '';

  // Se il campo è vuoto, non mostrare nulla
  if (filtro.trim() === '') return;

  const risultati = rubrica.filter(function(contatto) {
    const nomeCompleto = contatto.nome + ' ' + contatto.cognome;
    return nomeCompleto.toLowerCase().includes(filtro.toLowerCase());
  });

  if (risultati.length === 0) {
    ul.innerHTML = '<li style="opacity:0.5; cursor:default;">Nessun risultato</li>';
    return;
  }

  risultati.forEach(function(contatto) {
    const li = document.createElement('li');
    li.textContent = contatto.nome + ' ' + contatto.cognome;
    ul.appendChild(li);
  });
}
  console.log('Rubrica aggiornata:', rubrica);

  // Svuota il form dopo il salvataggio
  document.getElementById('inp-nome').value    = '';
  document.getElementById('inp-cognome').value = '';
  document.getElementById('inp-tel').value     = '';
  document.getElementById('inp-email').value   = '';
  document.getElementById('inp-avatar').value  = '';
  // --- Listener ricerca in tempo reale ---
document.getElementById('inp-ricerca').addEventListener('input', function() {
  renderRicerca(this.value);
});
});
  console.log('Form valido — pronto per il salvataggio');
});