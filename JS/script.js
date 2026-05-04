// ================================================================
// RUBRICA CUBO — script.js  |  Strato 7 (fix taglio mini-cubo)
// ITS Piazza dei Mestieri · Torino · Corso WSA · 2026
// ================================================================


// ================================================================
// SEZIONE 1 — RIFERIMENTI DOM
// ================================================================

const cubo  = document.getElementById('cubo');
const scena = document.getElementById('scena');

// Hub mini-cubi: due livelli
const rigaMini      = document.getElementById('riga-mini-scroll'); // flex row scrollabile
const rigaMiniOuter = document.getElementById('riga-mini');        // wrapper a schermo intero

// Overlay separato per il mini-cubo selezionato.
// È fratello diretto del body, non ha antenati con overflow:
// quando un cubo viene messo qui, niente lo può tagliare.
const overlayMini = document.getElementById('overlay-mini');

// Pulsante "Esci" — fisso in alto a destra, creato via JS.
// Doppio comportamento: mini-focus → hub → rotazione.
const btnEsci = document.createElement('button');
btnEsci.textContent = '✕ Esci';
btnEsci.classList.add('btn-esci-overlay');
document.body.appendChild(btnEsci);

// Pulsante "Elimina" — visibile solo in mini-focus (Strato 6)
const btnElimina = document.createElement('button');
btnElimina.id = 'btn-elimina';
btnElimina.textContent = '🗑 Elimina';
document.body.appendChild(btnElimina);


// ================================================================
// SEZIONE 2 — STATO GLOBALE
// ================================================================

let rotX = -20;
let rotY = 0;

// Modalità attiva: 'rotazione' | 'faccia' | 'hub' | 'mini-focus'
let modalita = 'rotazione';

// Drag cubo principale
let dragging = false;
let startX, startY, startRotX, startRotY;

// Drag mini-cubo selezionato
let miniAttivo   = null;   // .mini-scena attualmente nell'overlay
let placeholder  = null;   // .mini-placeholder che tiene il posto nella riga
let miniRotX     = -15;
let miniRotY     = 25;
let miniDragging = false;
let miniStartX, miniStartY, miniStartRotX, miniStartRotY;

const facceTarget = {
  fronte:   { x: 0,   y: 0   },
  dietro:   { x: 0,   y: 180 },
  destra:   { x: 0,   y: -90 },
  sinistra: { x: 0,   y: 90  },
  sopra:    { x: -90, y: 0   },
  sotto:    { x: 90,  y: 0   }
};


// ================================================================
// SEZIONE 3 — DATI: LocalStorage
// ================================================================

const rubrica = [];

// Caricamento all'avvio
const datiSalvati = localStorage.getItem('rubrica');
if (datiSalvati) {
  const caricati = JSON.parse(datiSalvati);
  caricati.forEach(function(c) {
    rubrica.push(c);
  });
}

function salvaRubrica() {
  localStorage.setItem('rubrica', JSON.stringify(rubrica));
}


// ================================================================
// SEZIONE 4 — CUBO PRINCIPALE: Rotazione e Zoom
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
  if (miniDragging) {
    miniDragging = false;
  }
});

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

document.addEventListener('click', function() {
  if (modalita === 'faccia') {
    modalita = 'rotazione';
    cubo.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
    applicaRotazione(false);
    aggiornaPointerEvents();
  }
});

applicaRotazione(false);


// ================================================================
// SEZIONE 5 — RENDER: Lista contatti e Ricerca
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
    li.textContent    = contatto.nome + ' ' + contatto.cognome;
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
// SEZIONE 6 — SALVATAGGIO: Validazione e Aggiunta
// ================================================================

function validaESalva(prefisso) {
  const p = prefisso || '';
  const nome    = document.getElementById('inp-nome'    + p).value.trim();
  const cognome = document.getElementById('inp-cognome' + p).value.trim();
  const tel     = document.getElementById('inp-tel'     + p).value.trim();
  const email   = document.getElementById('inp-email'   + p).value.trim();
  const avatar  = document.getElementById('inp-avatar'  + p).value.trim();

  const rNome  = /^[a-zA-ZÀ-ÿ\s']{1,50}$/;
  const rTel   = /^\+?[0-9]{7,15}$/;
  const rEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!rNome.test(nome))    { alert('Nome non valido');     return; }
  if (!rNome.test(cognome)) { alert('Cognome non valido');  return; }
  if (!rTel.test(tel))      { alert('Telefono non valido'); return; }
  if (!rEmail.test(email))  { alert('Email non valida');    return; }

  const duplicato = rubrica.find(function(c) {
    return c.tel === tel || c.email === email;
  });
  if (duplicato) {
    alert('Contatto già esistente: telefono o email già in rubrica.');
    return;
  }

  rubrica.push({ nome: nome, cognome: cognome, tel: tel, email: email, avatar: avatar });
  salvaRubrica();
  renderLista();

  ['inp-nome', 'inp-cognome', 'inp-tel', 'inp-email', 'inp-avatar'].forEach(function(id) {
    document.getElementById(id + p).value = '';
  });
}

document.getElementById('btn-salva').addEventListener('click',   function() { validaESalva('');   });
document.getElementById('btn-salva-b').addEventListener('click', function() { validaESalva('-b'); });


// ================================================================
// SEZIONE 7 — HUB CONTATTI: Apertura, Costruzione, Chiusura
// ================================================================

function apriHub() {
  modalita = 'hub';
  aggiornaPointerEvents();

  scena.style.transition    = 'opacity 0.4s ease, transform 0.4s ease';
  scena.style.opacity       = '0';
  scena.style.transform     = 'scale(0.6)';
  scena.style.pointerEvents = 'none';

  setTimeout(function() {
    scena.style.display = 'none';
    costruisciRiga();
    btnEsci.classList.add('visibile');
  }, 400);
}

function costruisciRiga() {
  rigaMini.innerHTML = '';

  // Con tanti contatti l'animazione sfalsata sarebbe lentissima:
  // se ci sono più di 30 cubi, riduco il delay; sopra i 60, niente delay.
  const delayPerCubo =
    rubrica.length > 60 ? 0 :
    rubrica.length > 30 ? 30 :
    100;

  rubrica.forEach(function(contatto, i) {
    setTimeout(function() {
      const miniScena = creaMiniCubo(contatto, i);
      rigaMini.appendChild(miniScena);

      const mc = miniScena.querySelector('.mini-cubo');
      mc.classList.add('entrata');
      mc.addEventListener('animationend', function() {
        mc.classList.remove('entrata');
      }, { once: true });

      if (i === rubrica.length - 1) {
        setTimeout(function() {
          rigaMiniOuter.classList.add('visibile');
        }, 200);
      }
    }, i * delayPerCubo);
  });

  // Se la rubrica è vuota, mostra subito la riga (vuota)
  if (rubrica.length === 0) {
    rigaMiniOuter.classList.add('visibile');
  }
}

function chiudiHub() {
  if (miniAttivo) deselezionaMini();

  btnEsci.classList.remove('visibile');
  btnElimina.classList.remove('visibile');
  rigaMiniOuter.classList.remove('visibile');

  setTimeout(function() {
    rigaMini.innerHTML = '';

    scena.style.display   = '';
    scena.style.opacity   = '0';
    scena.style.transform = 'scale(0.6)';

    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        scena.style.transition    = 'opacity 0.5s ease, transform 0.5s ease';
        scena.style.opacity       = '1';
        scena.style.transform     = '';
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
// SEZIONE 8 — MINI-CUBI: Creazione e Helpers
// ================================================================

function creaMiniCubo(contatto, indice) {
  const scenaEl = document.createElement('div');
  scenaEl.classList.add('mini-scena');
  scenaEl.dataset.indice = indice;

  const mc = document.createElement('div');
  mc.classList.add('mini-cubo');

  // Fronte: nome
  const mfF = creaFaccia('mf-fronte');
  const nP  = document.createElement('p');
  nP.classList.add('mf-nome');
  nP.textContent = contatto.nome + ' ' + contatto.cognome;
  mfF.appendChild(nP);

  // Dietro: nome specchiato
  const mfD = creaFaccia('mf-dietro');
  const nD  = document.createElement('p');
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

  // Drag sul mini-cubo: solo se è quello selezionato (nell'overlay)
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

  // Click sul mini-cubo:
  //   hub        → seleziona questo cubo (passa nell'overlay)
  //   mini-focus → se è un altro cubo nella riga, cambia selezione
  scenaEl.addEventListener('click', function(e) {
    e.stopPropagation();
    if (modalita === 'hub') {
      selezionaMini(scenaEl);
    } else if (modalita === 'mini-focus' && scenaEl !== miniAttivo) {
      deselezionaMini();
      selezionaMini(scenaEl);
    }
  });

  return scenaEl;
}

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
    img.src    = c.avatar;
    img.alt    = c.nome;
    img.onerror = function() {
      el.innerHTML   = '';
      el.textContent = iniziali(c);
    };
    el.appendChild(img);
  } else {
    el.textContent = iniziali(c);
  }
}

function iniziali(c) {
  return c.nome.charAt(0).toUpperCase() + c.cognome.charAt(0).toUpperCase();
}


// ================================================================
// SEZIONE 9 — SELEZIONE: Overlay separato (FIX TAGLIO)
// ================================================================

// FIX RADICE DEL TAGLIO:
// Invece di sollevare il cubo dentro la riga (dove sarebbe tagliato
// dall'overflow del genitore), lo SPOSTIAMO nell'overlay separato
// (#overlay-mini), che è figlio diretto del body e non ha alcun
// antenato con overflow. Lì il cubo può ingrandirsi liberamente.
// L'elemento DOM è lo stesso: tutti i listener (drag, click)
// continuano a funzionare senza bisogno di reinstallarli.
function selezionaMini(scenaEl) {
  miniAttivo = scenaEl;
  miniRotX   = -15;
  miniRotY   = 25;
  modalita   = 'mini-focus';

  // 1) Crea un placeholder invisibile delle stesse dimensioni
  //    e lo mette al posto del cubo nella riga: così la riga
  //    non si scompone (i cubi vicini non si spostano).
  placeholder = document.createElement('div');
  placeholder.classList.add('mini-placeholder');
  scenaEl.parentNode.insertBefore(placeholder, scenaEl);

  // 2) Sposta fisicamente il cubo nell'overlay.
  //    appendChild su un elemento già nel DOM lo MOVE (non clona):
  //    listener e stato interno restano intatti.
  overlayMini.appendChild(scenaEl);

  // 3) Applica lo stato visivo "ingrandito" via classe CSS.
  //    Lo scale è sulla mini-scena (non sul mini-cubo) per
  //    preservare la prospettiva.
  scenaEl.classList.add('in-overlay');

  // 4) Imposta la rotazione iniziale del mini-cubo
  const mc = scenaEl.querySelector('.mini-cubo');
  mc.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.2, 0.64, 1)';
  mc.style.transform  = 'rotateX(' + miniRotX + 'deg) rotateY(' + miniRotY + 'deg)';

  btnElimina.classList.add('visibile');
}

// Riporta il cubo nella riga al posto del placeholder
function deselezionaMini() {
  if (!miniAttivo) return;

  const scenaEl = miniAttivo;

  // 1) Rimuove la classe "ingrandito"
  scenaEl.classList.remove('in-overlay');

  // 2) Riporta il cubo dentro la riga, esattamente al posto
  //    del placeholder, e poi rimuove il placeholder
  if (placeholder && placeholder.parentNode) {
    placeholder.parentNode.insertBefore(scenaEl, placeholder);
    placeholder.parentNode.removeChild(placeholder);
  }
  placeholder = null;

  // 3) Riporta la rotazione del mini-cubo al default
  const mc = scenaEl.querySelector('.mini-cubo');
  mc.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
  mc.style.transform  = 'rotateX(-15deg) rotateY(25deg)';

  miniAttivo = null;
  modalita   = 'hub';
  btnElimina.classList.remove('visibile');
}


// ================================================================
// SEZIONE 10 — PULSANTI: Esci ed Elimina
// ================================================================

btnEsci.addEventListener('click', function(e) {
  e.stopPropagation();
  if (modalita === 'mini-focus') {
    deselezionaMini();
  } else if (modalita === 'hub') {
    chiudiHub();
  }
});

btnElimina.addEventListener('click', function(e) {
  e.stopPropagation();
  if (!miniAttivo) return;

  const indice = parseInt(miniAttivo.dataset.indice);
  if (!confirm('Eliminare ' + rubrica[indice].nome + ' ' + rubrica[indice].cognome + '?')) return;

  // Rimuove il cubo dall'overlay e il placeholder dalla riga,
  // poi elimina il contatto e ricostruisce tutto.
  if (miniAttivo.parentNode) miniAttivo.parentNode.removeChild(miniAttivo);
  if (placeholder && placeholder.parentNode) placeholder.parentNode.removeChild(placeholder);
  placeholder = null;
  miniAttivo  = null;

  rubrica.splice(indice, 1);
  salvaRubrica();
  renderLista();

  modalita = 'hub';
  btnElimina.classList.remove('visibile');
  costruisciRiga();
});


// ================================================================
// SEZIONE 11 — GENERATORE CONTATTI FINTI (per testing)
// ================================================================

// Genera N contatti finti realistici e li aggiunge alla rubrica.
// Da chiamare dalla console del browser:  generaContattiFinti(100)
// Oppure: generaContattiFinti(100, true)  → svuota prima la rubrica
function generaContattiFinti(quantita, svuotaPrima) {
  const nomi = [
    'Marco', 'Luca', 'Giuseppe', 'Andrea', 'Francesco', 'Alessandro',
    'Davide', 'Matteo', 'Lorenzo', 'Simone', 'Federico', 'Riccardo',
    'Stefano', 'Roberto', 'Antonio', 'Paolo', 'Giovanni', 'Pietro',
    'Maria', 'Anna', 'Giulia', 'Sara', 'Chiara', 'Francesca',
    'Elena', 'Martina', 'Laura', 'Alessia', 'Silvia', 'Federica',
    'Valentina', 'Beatrice', 'Sofia', 'Aurora', 'Camilla', 'Gaia',
    'Daniele', 'Filippo', 'Tommaso', 'Edoardo', 'Leonardo', 'Gabriele'
  ];

  const cognomi = [
    'Rossi', 'Bianchi', 'Romano', 'Russo', 'Ferrari', 'Esposito',
    'Bruno', 'Gallo', 'Conti', 'De Luca', 'Mancini', 'Costa',
    'Giordano', 'Rizzo', 'Lombardi', 'Moretti', 'Barbieri', 'Fontana',
    'Santoro', 'Mariani', 'Rinaldi', 'Caruso', 'Ferrara', 'Galli',
    'Martini', 'Leone', 'Longo', 'Gentile', 'Martinelli', 'Vitale',
    'Lombardo', 'Serra', 'Coppola', 'De Santis', 'D\'Angelo', 'Marchetti',
    'Parisi', 'Villa', 'Conte', 'Ferraro', 'Ferri', 'Fabbri'
  ];

  const domini = ['gmail.com', 'libero.it', 'yahoo.it', 'hotmail.it', 'outlook.com', 'tin.it'];

  if (svuotaPrima) {
    rubrica.length = 0;
  }

  let aggiunti = 0;
  let tentativi = 0;
  const maxTentativi = quantita * 10; // safety net per evitare loop infiniti

  while (aggiunti < quantita && tentativi < maxTentativi) {
    tentativi++;

    const nome    = nomi[Math.floor(Math.random() * nomi.length)];
    const cognome = cognomi[Math.floor(Math.random() * cognomi.length)];

    // Telefono: prefisso 3xx + 7 cifre (cellulari italiani)
    const tel = '3' + (Math.floor(Math.random() * 90) + 10) +
                String(Math.floor(Math.random() * 10000000)).padStart(7, '0');

    // Email basata su nome.cognome con suffisso numerico per unicità
    const dominio = domini[Math.floor(Math.random() * domini.length)];
    const suffisso = Math.floor(Math.random() * 10000);
    const emailBase = nome.toLowerCase() + '.' +
                      cognome.toLowerCase().replace(/[\s']/g, '');
    const email = emailBase + suffisso + '@' + dominio;

    // Skip se telefono o email già esistono (rispetta il vincolo Strato 5)
    const duplicato = rubrica.find(function(c) {
      return c.tel === tel || c.email === email;
    });
    if (duplicato) continue;

    rubrica.push({
      nome:    nome,
      cognome: cognome,
      tel:     tel,
      email:   email,
      avatar:  ''
    });
    aggiunti++;
  }

  salvaRubrica();
  renderLista();
  console.log('✅ Aggiunti ' + aggiunti + ' contatti finti. Totale rubrica: ' + rubrica.length);
  return aggiunti;
}

// Espone la funzione anche su window per renderla evidente nella console
window.generaContattiFinti = generaContattiFinti;


// ================================================================
// SEZIONE 12 — INIT
// ================================================================

renderLista();

// Auto-popolamento al primo avvio: se la rubrica è completamente
// vuota, genera 100 contatti finti per testare subito l'hub.
// Se ci sono già contatti reali, NON tocca nulla.
if (rubrica.length === 0) {
  generaContattiFinti(100);
}