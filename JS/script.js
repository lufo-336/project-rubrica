// ================================================================
// RUBRICA CUBO — script.js  |  Strato 4 (fix 3)
// ================================================================

// ------------------------------------------------
// RIFERIMENTI DOM
// ------------------------------------------------
const cubo     = document.getElementById('cubo');
const scena    = document.getElementById('scena');
const rigaMini = document.getElementById('riga-mini');

// Pulsante Esci fisso in alto a destra
const btnEsci = document.createElement('button');
btnEsci.textContent = '✕ Esci';
btnEsci.classList.add('btn-esci-overlay');
document.body.appendChild(btnEsci);

// ------------------------------------------------
// STATO GLOBALE
// ------------------------------------------------
let rotX = -20;
let rotY = 0;

// 'rotazione' | 'faccia' | 'hub' | 'mini-focus'
let modalita = 'rotazione';

// Drag cubo principale
let dragging = false;
let startX, startY, startRotX, startRotY;

// Mini-cubo attivo
let miniAttivo    = null;   // elemento .mini-scena selezionato
let miniRotX      = -15;
let miniRotY      = 25;
let miniDragging  = false;
let miniStartX, miniStartY, miniStartRotX, miniStartRotY;

// ------------------------------------------------
// DATI
// ------------------------------------------------
const rubrica = [
  { nome: 'Mario',   cognome: 'Rossi',    tel: '+393201234567', email: 'mario.rossi@email.it',   avatar: '' },
  { nome: 'Giulia',  cognome: 'Bianchi',  tel: '+393357654321', email: 'giulia.b@gmail.com',     avatar: '' },
  { nome: 'Luca',    cognome: 'Verdi',    tel: '+393481122334', email: 'luca.verdi@outlook.com', avatar: '' },
  { nome: 'Sofia',   cognome: 'Ferrari',  tel: '+393519988776', email: 'sofia.f@yahoo.it',       avatar: '' },
  { nome: 'Andrea',  cognome: 'Conti',    tel: '+393623344556', email: 'andrea.c@libero.it',     avatar: '' },
  { nome: 'Elena',   cognome: 'Marino',   tel: '+393745566778', email: 'elena.m@email.it',       avatar: '' },
  { nome: 'Marco',   cognome: 'Esposito', tel: '+393861177889', email: 'marco.e@fastwebnet.it',  avatar: '' },
];

const facceTarget = {
  fronte:   { x: 0,   y: 0   },
  dietro:   { x: 0,   y: 180 },
  destra:   { x: 0,   y: -90 },
  sinistra: { x: 0,   y: 90  },
  sopra:    { x: -90, y: 0   },
  sotto:    { x: 90,  y: 0   }
};


// ================================================================
// CUBO PRINCIPALE
// ================================================================

function applicaRotazione(zoom) {
  const av = zoom ? 'translateZ(150px) ' : '';
  cubo.style.transform = av + 'rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg)';
}

function aggiornaPointerEvents() {
  document.querySelectorAll('.faccia-contenuto').forEach(function(c) {
    c.style.pointerEvents = (modalita === 'faccia') ? 'auto' : 'none';
  });
}

// Drag cubo principale
cubo.addEventListener('mousedown', function(e) {
  if (modalita !== 'rotazione') return;
  dragging  = true;
  startX    = e.clientX;
  startY    = e.clientY;
  startRotX = rotX;
  startRotY = rotY;
  cubo.style.transition = 'none';
  e.preventDefault();
});

window.addEventListener('mousemove', function(e) {
  if (dragging) {
    rotY = startRotY + (e.clientX - startX) * 0.5;
    rotX = startRotX - (e.clientY - startY) * 0.5;
    applicaRotazione(false);
  }
  if (miniDragging && miniAttivo) {
    miniRotY = miniStartRotY + (e.clientX - miniStartX) * 0.5;
    miniRotX = miniStartRotX - (e.clientY - miniStartY) * 0.5;
    const mc = miniAttivo.querySelector('.mini-cubo');
    mc.style.transition = 'none';
    mc.style.transform =
      'rotateX(' + miniRotX + 'deg) rotateY(' + miniRotY + 'deg)';
  }
});

window.addEventListener('mouseup', function() {
  if (dragging) {
    dragging = false;
    cubo.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
  }
  // FIX: rilascio mouse sul mini-cubo — non resetta nulla,
  // la rotazione rimane esattamente dove l'utente l'ha lasciata
  if (miniDragging) {
    miniDragging = false;
  }
});

// Frecce tastiera
window.addEventListener('keydown', function(e) {
  const step = 15;
  if (modalita === 'mini-focus' && miniAttivo) {
    if (e.key === 'ArrowLeft')  miniRotY -= step;
    if (e.key === 'ArrowRight') miniRotY += step;
    if (e.key === 'ArrowUp')    miniRotX += step;
    if (e.key === 'ArrowDown')  miniRotX -= step;
    const mc = miniAttivo.querySelector('.mini-cubo');
    mc.style.transition = 'transform 0.3s ease';
    mc.style.transform =
      'rotateX(' + miniRotX + 'deg) rotateY(' + miniRotY + 'deg)';
    return;
  }
  if (modalita !== 'rotazione') return;
  if (e.key === 'ArrowLeft')  rotY -= step;
  if (e.key === 'ArrowRight') rotY += step;
  if (e.key === 'ArrowUp')    rotX += step;
  if (e.key === 'ArrowDown')  rotX -= step;
  cubo.style.transition = 'transform 0.3s ease';
  applicaRotazione(false);
});

// Click su una faccia → allinea e zoom
document.querySelectorAll('.faccia').forEach(function(faccia) {
  faccia.addEventListener('click', function(e) {
    e.stopPropagation();
    if (modalita !== 'rotazione') return;
    const nomeFaccia = Array.from(faccia.classList).find(function(c) {
      return c !== 'faccia';
    });
    const target = facceTarget[nomeFaccia];
    if (!target) return;
    modalita = 'faccia';
    rotX = target.x;
    rotY = target.y;
    cubo.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
    applicaRotazione(true);
    aggiornaPointerEvents();
  });
});

// Click su spazio vuoto → torna a rotazione (solo da 'faccia')
document.addEventListener('click', function() {
  if (modalita === 'faccia') {
    modalita = 'rotazione';
    cubo.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
    applicaRotazione(false);
    aggiornaPointerEvents();
  }
  // In 'hub' e 'mini-focus' il click esterno non fa nulla
});

applicaRotazione(false);


// ================================================================
// RENDER — lista contatti e ricerca
// ================================================================

function renderLista() {
  const ul = document.getElementById('lista-contatti');
  ul.innerHTML = '';
  if (rubrica.length === 0) {
    ul.innerHTML = '<li style="opacity:0.5;cursor:default;">Nessun contatto</li>';
    return;
  }
  rubrica.forEach(function(contatto, indice) {
    const li = document.createElement('li');
    li.textContent = contatto.nome + ' ' + contatto.cognome;
    li.dataset.indice = indice;
    li.addEventListener('click', function(e) {
      e.stopPropagation();
      if (modalita !== 'faccia') return;
      apriHub();
    });
    ul.appendChild(li);
  });
}

function renderRicerca(filtro) {
  const ul = document.getElementById('lista-ricerca');
  ul.innerHTML = '';
  if (filtro.trim() === '') return;
  const risultati = rubrica.filter(function(c) {
    return (c.nome + ' ' + c.cognome).toLowerCase().includes(filtro.toLowerCase());
  });
  if (risultati.length === 0) {
    ul.innerHTML = '<li style="opacity:0.5;cursor:default;">Nessun risultato</li>';
    return;
  }
  risultati.forEach(function(c) {
    const li = document.createElement('li');
    li.textContent = c.nome + ' ' + c.cognome;
    ul.appendChild(li);
  });
}

document.getElementById('inp-ricerca').addEventListener('input', function() {
  renderRicerca(this.value);
});


// ================================================================
// SALVATAGGIO
// ================================================================

function validaESalva(prefisso) {
  const p = prefisso || '';
  const nome    = document.getElementById('inp-nome'    + p).value.trim();
  const cognome = document.getElementById('inp-cognome' + p).value.trim();
  const tel     = document.getElementById('inp-tel'     + p).value.trim();
  const email   = document.getElementById('inp-email'   + p).value.trim();
  const rNome   = /^[a-zA-ZÀ-ÿ\s']{1,50}$/;
  const rTel    = /^\+?[0-9]{7,15}$/;
  const rEmail  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!rNome.test(nome))    { alert('Nome non valido');    return; }
  if (!rNome.test(cognome)) { alert('Cognome non valido'); return; }
  if (!rTel.test(tel))      { alert('Telefono non valido');return; }
  if (!rEmail.test(email))  { alert('Email non valida');   return; }
  rubrica.push({
    nome: nome, cognome: cognome, tel: tel, email: email,
    avatar: document.getElementById('inp-avatar' + p).value.trim()
  });
  renderLista();
  ['inp-nome','inp-cognome','inp-tel','inp-email','inp-avatar'].forEach(function(id) {
    document.getElementById(id + p).value = '';
  });
}

document.getElementById('btn-salva').addEventListener('click',   function() { validaESalva('');   });
document.getElementById('btn-salva-b').addEventListener('click', function() { validaESalva('-b'); });


// ================================================================
// STRATO 4 — HUB CONTATTI
// ================================================================

// ------------------------------------------------
// apriHub() — nasconde il cubo, mostra tutti i mini-cubi
// ------------------------------------------------
function apriHub() {
  modalita = 'hub';
  aggiornaPointerEvents();

  // Nasconde il cubo principale con fade+scale
  scena.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
  scena.style.opacity    = '0';
  scena.style.transform  = 'scale(0.6)';
  scena.style.pointerEvents = 'none';

  // Costruisce la riga con tutti i contatti
  setTimeout(function() {
    scena.style.display = 'none';
    costruisciRiga();
    btnEsci.classList.add('visibile');
  }, 400);
}

// ------------------------------------------------
// costruisciRiga() — popola rigaMini con tutti i contatti
// ------------------------------------------------
function costruisciRiga() {
  rigaMini.innerHTML = '';

  rubrica.forEach(function(contatto, i) {
    setTimeout(function() {
      const miniScena = creaMiniCubo(contatto);
      rigaMini.appendChild(miniScena);

      const mc = miniScena.querySelector('.mini-cubo');
      mc.classList.add('entrata');
      mc.addEventListener('animationend', function() {
        mc.classList.remove('entrata');
      }, { once: true });

      // Dopo l'ultimo, mostra la riga
      if (i === rubrica.length - 1) {
        setTimeout(function() {
          rigaMini.classList.add('visibile');
        }, 200);
      }
    }, i * 100);
  });
}

// ------------------------------------------------
// creaMiniCubo(contatto) → .mini-scena
// ------------------------------------------------
function creaMiniCubo(contatto) {
  const scenaEl = document.createElement('div');
  scenaEl.classList.add('mini-scena');

  const mc = document.createElement('div');
  mc.classList.add('mini-cubo');

  // Fronte: nome
  const mfF = creaFaccia('mf-fronte');
  const nP = document.createElement('p');
  nP.classList.add('mf-nome');
  nP.textContent = contatto.nome + ' ' + contatto.cognome;
  mfF.appendChild(nP);

  // Dietro: nome specchiato
  const mfD = creaFaccia('mf-dietro');
  const nD = document.createElement('p');
  nD.classList.add('mf-nome');
  nD.style.transform = 'scaleX(-1)';
  nD.textContent = contatto.nome + ' ' + contatto.cognome;
  mfD.appendChild(nD);

  // Destra: email
  const mfDx = creaFaccia('mf-destra');
  aggiungiLabelValore(mfDx, '✉', contatto.email);

  // Sinistra: telefono
  const mfSx = creaFaccia('mf-sinistra');
  aggiungiLabelValore(mfSx, '📞', contatto.tel);

  // Sopra: avatar
  const mfSopra = creaFaccia('mf-sopra');
  const av = document.createElement('div');
  av.classList.add('mf-avatar');
  popolaAvatar(av, contatto);
  mfSopra.appendChild(av);

  // Sotto: avatar specchiato
  const mfSotto = creaFaccia('mf-sotto');
  const avS = document.createElement('div');
  avS.classList.add('mf-avatar', 'mf-avatar-specchio');
  popolaAvatar(avS, contatto);
  mfSotto.appendChild(avS);

  mc.appendChild(mfF);
  mc.appendChild(mfD);
  mc.appendChild(mfDx);
  mc.appendChild(mfSx);
  mc.appendChild(mfSopra);
  mc.appendChild(mfSotto);
  scenaEl.appendChild(mc);

  // Drag sul mini-cubo (solo se selezionato)
  mc.addEventListener('mousedown', function(e) {
    if (modalita !== 'mini-focus') return;
    if (miniAttivo !== scenaEl) return;
    miniDragging  = true;
    miniStartX    = e.clientX;
    miniStartY    = e.clientY;
    miniStartRotX = miniRotX;
    miniStartRotY = miniRotY;
    e.stopPropagation();
    e.preventDefault();
  });

  // Click → seleziona o deseleziona
  scenaEl.addEventListener('click', function(e) {
    e.stopPropagation();
    if (modalita === 'hub') {
      selezionaMini(scenaEl);
    } else if (modalita === 'mini-focus') {
      if (scenaEl === miniAttivo) {
        // Click sul cubo già selezionato: non fa nulla
        // (si esce solo con Esci)
      } else {
        // Click su un altro cubo: cambia selezione
        deselezionaMini();
        selezionaMini(scenaEl);
      }
    }
  });

  return scenaEl;
}

// ------------------------------------------------
// Helpers
// ------------------------------------------------
function creaFaccia(classe) {
  const el = document.createElement('div');
  el.classList.add('mf', classe);
  return el;
}

function aggiungiLabelValore(el, label, valore) {
  const lEl = document.createElement('p');
  lEl.classList.add('mf-label');
  lEl.textContent = label;
  const vEl = document.createElement('p');
  vEl.classList.add('mf-valore');
  vEl.textContent = valore;
  el.appendChild(lEl);
  el.appendChild(vEl);
}

function popolaAvatar(el, c) {
  el.innerHTML = '';
  if (c.avatar) {
    const img = document.createElement('img');
    img.src = c.avatar;
    img.alt = c.nome;
    img.onerror = function() { el.innerHTML = ''; el.textContent = iniziali(c); };
    el.appendChild(img);
  } else {
    el.textContent = iniziali(c);
  }
}

function iniziali(c) {
  return c.nome.charAt(0).toUpperCase() + c.cognome.charAt(0).toUpperCase();
}

// ------------------------------------------------
// selezionaMini / deselezionaMini
// ------------------------------------------------
function selezionaMini(scenaEl) {
  miniAttivo = scenaEl;
  miniRotX   = -15;
  miniRotY   = 25;
  modalita   = 'mini-focus';

  // Solleva la SCENA (non il cubo interno) — la perspective rimane corretta
  scenaEl.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.2, 0.64, 1)';
  scenaEl.style.transform  = 'translateY(-70px) scale(2.2)';
  scenaEl.style.zIndex     = '20';

  const mc = scenaEl.querySelector('.mini-cubo');
  mc.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.2, 0.64, 1)';
  mc.style.transform  = 'rotateX(' + miniRotX + 'deg) rotateY(' + miniRotY + 'deg)';
}

function deselezionaMini() {
  if (!miniAttivo) return;

  // Riporta la scena al posto nella riga
  miniAttivo.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
  miniAttivo.style.transform  = '';
  miniAttivo.style.zIndex     = '';

  const mc = miniAttivo.querySelector('.mini-cubo');
  mc.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
  mc.style.transform  = 'rotateX(-15deg) rotateY(25deg)';

  miniAttivo = null;
  modalita   = 'hub';
}

// ------------------------------------------------
// PULSANTE ESCI — comportamento doppio
// ------------------------------------------------
btnEsci.addEventListener('click', function(e) {
  e.stopPropagation();
  if (modalita === 'mini-focus') {
    // Prima pressione: deingrandisce il mini-cubo
    deselezionaMini();
  } else if (modalita === 'hub') {
    // Seconda pressione: torna al cubo principale
    chiudiHub();
  }
});

function chiudiHub() {
  // Deseleziona se c'è qualcosa attivo
  if (miniAttivo) deselezionaMini();

  btnEsci.classList.remove('visibile');
  rigaMini.classList.remove('visibile');

  setTimeout(function() {
    rigaMini.innerHTML = '';

    // Riporta il cubo principale
    scena.style.display   = '';
    scena.style.opacity   = '0';
    scena.style.transform = 'scale(0.6)';

    // Piccolo delay per permettere al browser di applicare
    // lo stato iniziale prima di animare
    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        scena.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        scena.style.opacity    = '1';
        scena.style.transform  = '';
        scena.style.pointerEvents = '';
      });
    });

    modalita = 'rotazione';
    rotX = -20;
    rotY = 0;
    cubo.style.transition = 'none';
    applicaRotazione(false);
    aggiornaPointerEvents();
  }, 400);
}


// ================================================================
// INIT
// ================================================================
renderLista();