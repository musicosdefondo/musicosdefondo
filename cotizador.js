/* ============================================================
   COTIZADOR MÚSICOS DE FONDO — App Logic
   ============================================================ */

/* ════════════════════════════════════════════════════════════
   🔗 GOOGLE SHEETS — CONFIGURACIÓN DE ENVÍO
   ────────────────────────────────────────────────────────────
   1. Sigue las instrucciones del README.md para crear tu
      Google Apps Script y publicarlo como Web App.
   2. Copia la URL que termina en "/exec" y pégala abajo.
   3. Si dejas el placeholder, el cotizador funciona normal
      pero NO envía datos (modo offline).
   ════════════════════════════════════════════════════════════ */
const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbws2ReBeaHOJ4aCHKIo6y2Cgl62kC3oF0giYOASiMplurQTum7fVw6eB-RW1XWjTgCq/exec';
/* Ejemplo válido:
   'https://script.google.com/macros/s/AKfycbx.../exec'
   ════════════════════════════════════════════════════════════ */

const WHATSAPP = '573003033436';

/* ── State ── */
let currentAct = 0;
const leadId = 'N° ' + String(10000 + Math.floor(Math.random() * 89999));

const S = {
  email: '', fuente: '',
  nombre: '', empresa: '', whatsapp: '', rol: '',
  tipo: null, tipoLabel: '',
  formato: 'cuarteto', formatoLabel: 'Cuarteto · 4 músicos',
  ciudad: '', fecha: null,
  aforo: 'mediano', aforoLabel: 'Mediano (30–100)',
  nivel: null, nivelLabel: '',
  extras: [], extrasLabels: [],
  urgencia: false, fueraMedellin: false,
  audioOn: false,
  rangoMin: 0, rangoMax: 0, rangoDisplay: '',
  actsVisited: [0],
  startTime: Date.now(),
};

/* ── Price tables ── */
const BASE = {
  horeca:7300000, cine:11500000, navijazz:16600000,
  itinerante:7300000, boda:8500000, corporativo:12200000,
  paginas:9300000, custom:8000000,
};
const FMULT = { duo:.55, trio:.70, cuarteto:1.00, quinteto:1.25, septeto:1.60 };
const NMULT = { esencial:.85, b2b:1.00, premium:1.40 };
const AMULT = { intimo:1.00, mediano:1.00, grande:1.10, masivo:1.25, mayor:1.45 };
const EXTRAS_COST = {
  repertorio_custom:1500000, licencias:1200000, vestuario:600000,
  set_extra:900000, marionetas:2500000, audiovisual_extra:1800000,
};

/* ── Ensemble data ── */
const ENSEMBLES = [
  { id:'duo',      label:'Dúo',      n:2, inst:'Voz · Piano',                      ideal:'Recepciones íntimas, lounge' },
  { id:'trio',     label:'Trío',     n:3, inst:'Voz · Piano · Contrabajo',          ideal:'Cenas privadas, eventos boutique' },
  { id:'cuarteto', label:'Cuarteto', n:4, inst:'Voz · Piano · Bajo · Batería',      ideal:'Corporativos, fine dining', best:true },
  { id:'quinteto', label:'Quinteto', n:5, inst:'Voz · Piano · Bajo · Batería · Bronce', ideal:'Eventos de aforo mayor' },
  { id:'septeto',  label:'Septeto',  n:7, inst:'Big Band reducida · Bronces · Voces', ideal:'Espectáculos, producciones premium' },
];

/* ── Event types ── */
const EVENTS = [
  { id:'horeca',     name:'Experiencia 360°',  img:'uploads/singercloseup.jpg',      persona:'Restaurantes · Hoteles',   desc:'Diseño sonoro inmersivo para espacios gastronómicos.' },
  { id:'cine',       name:'Cine-Conciertos',   img:'uploads/cineconciertos.jpg',     persona:'Teatros · Cultura',        desc:'Musicalización de películas en vivo. Derechos incluidos.' },
  { id:'navijazz',   name:'NaviJazz',          img:'uploads/bandperformance1.jpg',   persona:'Fin de Año · Retail',      desc:'Espectáculo de fin de año con big band y producción premium.' },
  { id:'itinerante', name:'Música Itinerante', img:'uploads/bandperformance.jpg',    persona:'Centros Comerciales',      desc:'Formatos móviles que recorren el espacio sorprendiendo.' },
  { id:'boda',       name:'Bodas Simbólicas',  img:'uploads/trumpetcloseup.jpg',     persona:'Wedding Premium',          desc:'Arreglos orquestales a medida para tu ceremonia.' },
  { id:'corporativo',name:'Pulso Corporativo', img:'uploads/pianistcloseup.jpg',     persona:'RRHH · Bienestar',         desc:'Laboratorios de arte y bienestar para equipos corporativos.' },
  { id:'paginas',    name:'Páginas Sonoras',   img:'uploads/saxophonecloseup.jpg',   persona:'Literatura · Cultura',     desc:'Diseño sonoro en vivo para presentaciones literarias.' },
  { id:'custom',     name:'Personalizado',     img:'uploads/studio.jpg',             persona:'Tu idea aquí',             desc:'Tu visión, nuestra producción. Diseñamos desde cero.' },
];

/* ── Aforo data ── */
const AFORO = [
  { id:'intimo',   label:'Íntimo',  sub:'hasta 30',  dots:18  },
  { id:'mediano',  label:'Mediano', sub:'30–100',     dots:55  },
  { id:'grande',   label:'Grande',  sub:'100–300',    dots:130 },
  { id:'masivo',   label:'Masivo',  sub:'300–800',    dots:280 },
  { id:'mayor',    label:'Mayor',   sub:'+800',       dots:500 },
];

/* ── Utilities ── */
function cop(n) {
  return new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(n);
}
function today0() { const d=new Date(); d.setHours(0,0,0,0); return d; }
function diffDays(d) { return Math.ceil((new Date(d+'T00:00:00') - today0()) / 86400000); }
function save() {
  try { sessionStorage.setItem('mdf_q1', JSON.stringify({S, currentAct, leadId})); } catch(e){}
}
function loadSaved() {
  try { const r=sessionStorage.getItem('mdf_q1'); return r?JSON.parse(r):null; } catch(e){ return null; }
}

/* ── Calcular ── */
function calcular() {
  if (!S.tipo || !S.nivel || !S.formato || !S.aforo) return null;
  let base = BASE[S.tipo];
  let adj = base * FMULT[S.formato] * NMULT[S.nivel] * AMULT[S.aforo];
  if (S.urgencia) adj *= 1.15;
  if (S.fueraMedellin) adj *= 1.18;
  const extSum = S.extras.reduce((a,k) => a + (EXTRAS_COST[k]||0), 0);
  const total = adj + extSum;
  if (total > 35000000) return { superp: true };
  let mn = Math.round((total*.88)/100000)*100000;
  let mx = Math.round((total*1.15)/100000)*100000;
  if (mn < 2500000) { mn=2500000; mx=Math.max(mx,3500000); }
  return { min:mn, max:mx };
}

/* ── Number scramble ── */
function scramble(el, finalVal, duration=1200) {
  const chars='0123456789';
  const finalStr = cop(finalVal);
  const t0 = performance.now();
  function step(now) {
    const p = Math.min((now-t0)/duration, 1);
    const e = 1 - Math.pow(1-p, 4);
    const revealed = Math.floor(finalStr.length * e);
    let out = '';
    for (let i=0; i<finalStr.length; i++) {
      const c = finalStr[i];
      if (i < revealed) out += c;
      else if (/\d/.test(c)) out += chars[Math.floor(Math.random()*10)];
      else out += c;
    }
    el.textContent = out;
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = finalStr;
  }
  requestAnimationFrame(step);
}

/* ── Cursor follower ── */
const cursor = document.getElementById('cursor');
let mx=0, my=0, cx=0, cy=0;
if (window.matchMedia('(pointer:fine)').matches) {
  document.addEventListener('mousemove', e => { mx=e.clientX; my=e.clientY; });
  document.addEventListener('mouseover', e => {
    cursor.classList.toggle('grow', !!e.target.closest('[data-grow]'));
  });
  (function tick() {
    cx += (mx-cx)*.14; cy += (my-cy)*.14;
    cursor.style.left = cx+'px'; cursor.style.top = cy+'px';
    requestAnimationFrame(tick);
  })();
} else { cursor.style.display='none'; }

/* ── Spotlight ── */
function bindSpotlight(el) {
  el.addEventListener('mousemove', e => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', (e.clientX-r.left)+'px');
    el.style.setProperty('--my', (e.clientY-r.top)+'px');
  });
}

/* ── Navigation ── */
let _transitioning = false;
function goTo(n, customFn) {
  if (n === currentAct || _transitioning) return;
  const from = document.getElementById('act-'+currentAct);
  const to   = document.getElementById('act-'+n);
  if (!to) return;
  const dir = n > currentAct ? 1 : -1;
  if (!S.actsVisited.includes(n)) S.actsVisited.push(n);
  currentAct = n; save(); updateDots();

  const nav = document.querySelector('.global-nav');
  nav.classList.toggle('visible', n > 0 && n < 8);

  const dots = document.querySelector('.progress-dots');
  dots.classList.toggle('visible', n >= 1 && n <= 7);

  if (customFn) { customFn(from, to); initAct(n); return; }

  _transitioning = true;
  // Incoming on top so the outgoing is fully covered during fade
  gsap.set(from, { zIndex: 1 });
  to.classList.add('active');
  gsap.set(to, { opacity: 0, y: 18*dir, zIndex: 2 });

  gsap.timeline({
    onComplete: () => {
      from.classList.remove('active');
      gsap.set(from, { clearProps: 'opacity,y,zIndex,transform' });
      gsap.set(to,   { clearProps: 'zIndex,y,transform' });
      _transitioning = false;
    }
  })
  .to(from, { opacity: 0, y: -14*dir, duration: .55, ease: 'power2.inOut' }, 0)
  .to(to,   { opacity: 1, y: 0,        duration: .7,  ease: 'power3.out'   }, .12);

  initAct(n);
}

function updateDots() {
  document.querySelectorAll('.p-dot').forEach((d,i)=>{
    const a = i+1;
    d.classList.toggle('active', a===currentAct);
    d.classList.toggle('visited', S.actsVisited.includes(a) && a!==currentAct);
  });
}

/* ── Toast ── */
let toastTmr;
function toast(html, dur=5000) {
  const el = document.getElementById('toast');
  el.innerHTML = html;
  el.classList.add('show');
  clearTimeout(toastTmr);
  toastTmr = setTimeout(()=>el.classList.remove('show'), dur);
}
function dismissToast() { document.getElementById('toast').classList.remove('show'); }

/* ── Envío a Google Sheets ──
   Envía datos en background al endpoint configurado.
   - mode/headers diseñados para Apps Script sin preflight CORS.
   - On error: pone el payload en cola en localStorage para reintentar.
   - Devuelve true/false (no bloquea la UI). */
function _isEndpointConfigured() {
  return GOOGLE_SHEETS_URL &&
         !GOOGLE_SHEETS_URL.startsWith('PEGA_AQUI') &&
         /^https?:\/\//.test(GOOGLE_SHEETS_URL);
}

async function postLead(extra = {}) {
  // Stage simple (e.g. ticket_entry) — silent best-effort, no toast
  if (!_isEndpointConfigured()) return false;
  const payload = _buildPayload(extra);
  try {
    await fetch(GOOGLE_SHEETS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      redirect: 'follow',
      keepalive: true,
    });
    return true;
  } catch (e) {
    _queueForRetry(payload);
    return false;
  }
}

function _buildPayload(extra = {}) {
  const now = new Date();
  return {
    // Identificación
    lead_id: leadId,
    timestamp_cliente: now.toISOString(),
    fecha_envio_local: now.toLocaleString('es-CO', { timeZone: 'America/Bogota' }),
    stage: extra.stage || (S.rangoMin ? 'cotizacion_final' : 'parcial'),

    // Contacto
    email:    S.email    || '',
    fuente:   S.fuente   || '',
    nombre:   S.nombre   || '',
    empresa:  S.empresa  || '',
    whatsapp: S.whatsapp || '',
    rol:      S.rol      || '',

    // Tipo y ensamble
    tipo:          S.tipo       || '',
    tipo_label:    S.tipoLabel  || '',
    formato:       S.formato    || '',
    formato_label: S.formatoLabel || '',

    // Lugar y momento
    ciudad:         S.ciudad || '',
    fecha_evento:   S.fecha  || '',
    aforo:          S.aforo  || '',
    aforo_label:    S.aforoLabel || '',
    urgencia:       S.urgencia ? 'Sí' : 'No',
    fuera_medellin: S.fueraMedellin ? 'Sí' : 'No',

    // Nivel y extras
    nivel:         S.nivel      || '',
    nivel_label:   S.nivelLabel || '',
    extras:        (S.extras || []).join(', '),
    extras_labels: (S.extrasLabels || []).join(', '),

    // Cotización
    rango_min:     S.rangoMin  || 0,
    rango_max:     S.rangoMax  || 0,
    rango_display: S.rangoDisplay || '',

    // Meta + tracking
    duracion_sesion_seg: Math.round((Date.now() - S.startTime) / 1000),
    accion:    extra.action   || '',
    referrer:  document.referrer || '',
    url:       window.location.href,
    user_agent: navigator.userAgent,
    ...extra,
  };
}

function _queueForRetry(payload) {
  try {
    const q = JSON.parse(localStorage.getItem('mdf_send_queue') || '[]');
    q.push(payload);
    if (q.length > 20) q.shift(); // cap the queue
    localStorage.setItem('mdf_send_queue', JSON.stringify(q));
  } catch (e) {}
}

async function _flushRetryQueue() {
  if (!_isEndpointConfigured()) return;
  let q;
  try { q = JSON.parse(localStorage.getItem('mdf_send_queue') || '[]'); }
  catch (e) { return; }
  if (!q.length) return;
  const remaining = [];
  for (const payload of q) {
    try {
      await fetch(GOOGLE_SHEETS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ ...payload, _reintento: true }),
      });
    } catch (e) { remaining.push(payload); }
  }
  try { localStorage.setItem('mdf_send_queue', JSON.stringify(remaining)); } catch(e){}
}

/* Envío FINAL con UI visible (loading + success/error).
   Se llama una sola vez cuando la cotización está completa. */
let _envioFinalHecho = false;
async function enviarCotizacionFinal(extra = {}) {
  if (_envioFinalHecho) return true;
  if (!_isEndpointConfigured()) {
    console.warn('[Cotizador] GOOGLE_SHEETS_URL no configurada. Omitiendo envío.');
    return false;
  }
  _envioFinalHecho = true;

  const payload = _buildPayload({ stage: 'cotizacion_final', ...extra });

  // Estado: ENVIANDO
  toast(
    '<div class="toast-text">⟳ Registrando tu propuesta…</div>',
    9000
  );

  try {
    const res = await fetch(GOOGLE_SHEETS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      redirect: 'follow',
    });
    // Apps Script responde 200 con JSON. Si falla intentamos leer.
    let ok = res.ok;
    try {
      const txt = await res.text();
      if (txt) {
        const j = JSON.parse(txt);
        ok = ok && (j.ok !== false);
      }
    } catch (parseErr) { /* no-op: respuesta opaca o vacía */ }

    if (!ok) throw new Error('Respuesta no OK');

    toast(
      '<div class="toast-text">✓ Propuesta registrada · N° ' + leadId.replace('N° ','') + '</div>',
      4500
    );
    return true;

  } catch (err) {
    console.error('[Cotizador] Error enviando a Sheets:', err);
    _envioFinalHecho = false; // permite reintento
    _queueForRetry(payload);
    toast(
      '<div class="toast-text">⚠ No pudimos registrar el envío. Tus datos están a salvo.</div>' +
      '<div class="toast-btns">' +
        '<button class="toast-btn yes" onclick="window.reintentarEnvioFinal()">REINTENTAR</button>' +
        '<button class="toast-btn no" onclick="dismissToast()">CERRAR</button>' +
      '</div>',
      15000
    );
    return false;
  }
}

window.reintentarEnvioFinal = function () {
  dismissToast();
  enviarCotizacionFinal({ stage: 'cotizacion_final_reintento' });
};

/* ── WhatsApp message ── */
function buildWA() {
  const extStr = S.extrasLabels.length ? S.extrasLabels.join(', ') : 'Ninguno';
  return `Hola Marlon, soy ${S.nombre} de ${S.empresa}.

Acabo de cotizar en el sitio web:
• Tipo: ${S.tipoLabel}
• Formato: ${S.formatoLabel}
• ${S.ciudad || 'Ciudad por definir'} · ${S.fecha || 'Fecha por definir'}
• Aforo: ${S.aforoLabel}
• Nivel: ${S.nivelLabel}
• Extras: ${extStr}

Estimado: ${S.rangoDisplay}

Me gustaría conversar para afinar la propuesta.`;
}

/* ============================================================
   ACT 0 — APERTURA
   ============================================================ */
function initAct0() {
  const img = document.querySelector('.a0-photo');
  if (img.complete) img.classList.add('loaded');
  else img.addEventListener('load', ()=>img.classList.add('loaded'));

  document.getElementById('act-0').addEventListener('mousemove', e => {
    const x = (e.clientX/window.innerWidth-.5)*18;
    const y = (e.clientY/window.innerHeight-.5)*14;
    img.style.transform = `translate3d(${x}px,${y}px,0) scale(1.06)`;
  });

  const tl = gsap.timeline({delay:.3});
  tl.to('.a0-logo',    {opacity:1, duration:1.1, ease:'power2.out'})
    .to('.a0-eyebrow', {opacity:1, y:0, duration:.6, ease:'power3.out'}, '-=.4')
    .to('.a0-headline',{opacity:1, y:0, duration:.75, ease:'power3.out'}, '-=.35')
    .to('.a0-sub',     {opacity:1, y:0, duration:.6,  ease:'power3.out'}, '-=.35')
    .to('.scroll-hint',{opacity:1, duration:.5}, '-=.2');

  gsap.set(['.a0-eyebrow','.a0-headline','.a0-sub'], {y:16});

  function enterFromAct0() {
    const curtain = document.createElement('div');
    Object.assign(curtain.style, {
      position:'fixed', inset:'0',
      background:'linear-gradient(0deg,rgba(201,168,76,.12),rgba(5,4,3,.95))',
      zIndex:'900', pointerEvents:'none', transformOrigin:'bottom', scaleY:0,
    });
    document.body.appendChild(curtain);
    gsap.timeline({
      onComplete:() => {
        curtain.remove();
        document.getElementById('act-0').classList.remove('active');
        initAct(1);
      }
    })
    .to(document.getElementById('act-0'), {opacity:0, duration:.4})
    .fromTo(curtain, {scaleY:0},{scaleY:1,duration:.38,ease:'power2.in'},0)
    .to(curtain, {opacity:0, duration:.3, ease:'power2.out'}, '-=.08')
    .call(()=>{
      const to = document.getElementById('act-1');
      to.classList.add('active'); gsap.set(to,{opacity:0});
      currentAct=1; save(); updateDots();
      document.querySelector('.global-nav').classList.add('visible');
      document.querySelector('.progress-dots').classList.add('visible');
    })
    .to(document.getElementById('act-1'), {opacity:1, duration:.35, ease:'power2.out'});
  }

  document.getElementById('act-0').addEventListener('click', ()=>{ if(currentAct===0) enterFromAct0(); });
  document.getElementById('act-0').addEventListener('wheel', e=>{ if(e.deltaY>0&&currentAct===0) enterFromAct0(); }, {once:true});
}

/* ============================================================
   ACT 1 — TICKET
   ============================================================ */
function initAct1() {
  document.getElementById('t-num').textContent = leadId;
  bindSpotlight(document.getElementById('act-1'));

  const emailEl  = document.getElementById('t-email');
  const btnEnter = document.getElementById('btnEnter');
  const tCheck   = document.getElementById('t-check');
  const tError   = document.getElementById('t-error');

  function validEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

  emailEl.oninput = ()=>{
    const ok = validEmail(emailEl.value.trim());
    btnEnter.disabled = !ok; btnEnter.classList.toggle('disabled',!ok);
    tCheck.classList.toggle('show', ok);
    emailEl.classList.remove('error'); tError.classList.remove('show');
  };

  btnEnter.onclick = ()=>{
    if (!validEmail(emailEl.value.trim())) {
      emailEl.classList.add('error'); tError.classList.add('show');
      gsap.to('.ticket', {x:7,duration:.07,yoyo:true,repeat:5,ease:'power1.inOut'});
      return;
    }
    S.email = emailEl.value.trim();
    S.fuente = document.getElementById('t-source').value;
    save();
    postLead({email:S.email, fuente:S.fuente, stage:'ticket_entry'});
    tearTicket();
  };

  // Ticket entrance
  gsap.fromTo('.ticket',
    {y:-70, rotation:-3, opacity:0},
    {y:0, rotation:0, opacity:1, duration:.9, ease:'cubic-bezier(0,0.55,0.45,1)', delay:.2}
  );

  // Restore email if saved
  if (S.email) { emailEl.value=S.email; emailEl.dispatchEvent(new Event('input')); }
}

function tearTicket() {
  const tkt = document.querySelector('.ticket');
  const wrapper = document.querySelector('.ticket-wrapper');
  const clone = tkt.cloneNode(true);

  // Top half
  const top = tkt.cloneNode(true);
  top.style.cssText = 'position:absolute;inset:0;clip-path:inset(0 0 50% 0);pointer-events:none;margin:0;';
  // Bottom half
  const bot = tkt.cloneNode(true);
  bot.style.cssText = 'position:absolute;inset:0;clip-path:inset(50% 0 0 0);pointer-events:none;margin:0;';

  tkt.style.visibility='hidden';
  wrapper.style.position='relative';
  wrapper.appendChild(top); wrapper.appendChild(bot);

  gsap.timeline({
    onComplete: () => {
      goTo(2, (from, to) => {
        gsap.to(from,{opacity:0,duration:.3,onComplete:()=>{ from.classList.remove('active'); }});
        to.classList.add('active'); gsap.set(to,{opacity:0,y:18});
        gsap.to(to,{opacity:1,y:0,duration:.65,ease:'power4.out',delay:.1});
        initAct(2);
      });
    }
  })
  .to(top, {y:-90,opacity:0,duration:.5,ease:'power2.in'}, 0)
  .to(bot, {y:90, opacity:0,duration:.5,ease:'power2.in'}, 0);
}

/* ============================================================
   ACT 2 — ATMÓSFERA
   ============================================================ */
function initAct2() {
  const rows = document.querySelectorAll('.event-row');
  const bgWrap = document.querySelector('.a2-bg');
  const bgImg  = bgWrap.querySelector('img');

  // Reset state on re-entry (back from later acts)
  rows.forEach(r => { r.classList.remove('selected','dim'); r.querySelector('.event-thumb').classList.remove('expanded'); });
  bgWrap.classList.remove('show');
  if (initAct2._bound) return;
  initAct2._bound = true;

  rows.forEach(row => {
    const thumb = row.querySelector('.event-thumb');

    row.addEventListener('mouseenter', ()=>{
      rows.forEach(r => r.classList.toggle('dim', r!==row));
      bgImg.src = row.dataset.img;
      bgWrap.classList.add('show');
      thumb.classList.add('expanded');
    });
    row.addEventListener('mouseleave', ()=>{
      rows.forEach(r => r.classList.remove('dim'));
      thumb.classList.remove('expanded');
      if (!document.querySelector('.event-row.selected')) bgWrap.classList.remove('show');
    });
    row.addEventListener('click', ()=>{
      rows.forEach(r => r.classList.remove('selected'));
      row.classList.add('selected');
      S.tipo = row.dataset.id;
      S.tipoLabel = row.dataset.label;
      bgImg.src = row.dataset.img; bgWrap.classList.add('show');
      // Pre-select septeto for cine/navijazz
      if (S.tipo==='cine'||S.tipo==='navijazz') { S.formato='septeto'; S._preFormat=true; }
      else { S._preFormat=false; }
      save();

      // Wipe transition
      const curtain = document.createElement('div');
      Object.assign(curtain.style, {
        position:'fixed',inset:'0',
        background:'rgba(201,168,76,.06)',zIndex:'900',
        transformOrigin:'left', transform:'scaleX(0)', pointerEvents:'none',
      });
      document.body.appendChild(curtain);
      gsap.timeline({
        onComplete:()=>{ curtain.remove(); }
      })
      .to(curtain,{scaleX:1,duration:.32,ease:'power2.in'})
      .call(()=>{
        document.getElementById('act-2').classList.remove('active');
        const to=document.getElementById('act-3'); to.classList.add('active');
        gsap.set(to,{opacity:0}); currentAct=3; save(); updateDots(); initAct(3);
      })
      .to(curtain,{scaleX:0,transformOrigin:'right',duration:.32,ease:'power2.out'})
      .to(document.getElementById('act-3'),{opacity:1,duration:.25,ease:'power2.out'},'-=.2');
    });
  });
}

/* ============================================================
   ACT 3 — ENSAMBLE
   ============================================================ */
let ensIdx = 2; // default cuarteto

function initAct3() {
  if (S._preFormat && S.formato==='septeto') {
    ensIdx=4;
    toast('<div class="toast-text">Recomendado para este tipo de evento</div>');
  } else {
    ensIdx = ENSEMBLES.findIndex(e=>e.id===S.formato);
    if (ensIdx<0) ensIdx=2;
  }

  if (!initAct3._built) { buildEnsembleSlider(); initAct3._built = true; }
  updateEnsemble(ensIdx);

  document.getElementById('act3-continue').onclick = ()=>goTo(4);
}

function buildEnsembleSlider() {
  const track  = document.getElementById('ens-track');
  const thumb  = document.getElementById('ens-thumb');
  const stops  = document.querySelectorAll('.s-stop');
  let dragging = false;

  function setFromX(clientX) {
    const r = track.getBoundingClientRect();
    const pct = Math.max(0,Math.min(1,(clientX-r.left)/r.width));
    const idx = Math.round(pct*4);
    if (idx!==ensIdx) { ensIdx=idx; updateEnsemble(idx); }
  }

  thumb.addEventListener('mousedown', ()=>{ dragging=true; });
  document.addEventListener('mousemove', e=>{ if(dragging) setFromX(e.clientX); });
  document.addEventListener('mouseup', ()=>{ dragging=false; });
  thumb.addEventListener('touchstart', ()=>{ dragging=true; },{passive:true});
  document.addEventListener('touchmove', e=>{ if(dragging) setFromX(e.touches[0].clientX); },{passive:true});
  document.addEventListener('touchend', ()=>{ dragging=false; });

  track.addEventListener('click', e=>setFromX(e.clientX));
  stops.forEach((s,i)=>s.addEventListener('click',()=>{ ensIdx=i; updateEnsemble(i); }));
}

function updateEnsemble(idx) {
  const d = ENSEMBLES[idx];
  S.formato = d.id;
  S.formatoLabel = d.label + ' · ' + d.n + ' músico' + (d.n>1?'s':'');

  // Slider UI
  const pct = (idx/4)*100;
  document.getElementById('ens-fill').style.width = pct+'%';
  document.getElementById('ens-thumb').style.left = pct+'%';
  document.querySelectorAll('.s-stop').forEach((s,i)=>s.classList.toggle('on',i<=idx));
  document.querySelectorAll('.sl-label').forEach((l,i)=>l.classList.toggle('on',i===idx));

  // Info panel
  document.getElementById('si-formato').textContent = d.label;
  document.getElementById('si-inst').textContent    = d.inst;
  document.getElementById('si-ideal').textContent   = d.ideal;
  document.getElementById('si-badge').classList.toggle('show', !!d.best);

  // Silhouettes
  updateSilhouettes(d.n);
  save();
}

function updateSilhouettes(count) {
  const musicianGroups = document.querySelectorAll('.musician');
  musicianGroups.forEach((g,i) => {
    const show = i < count;
    if (show && parseFloat(g.style.opacity||'1')===0) {
      gsap.to(g, {opacity:1, duration:.4, delay:i*.07, ease:'power2.out'});
    } else if (!show) {
      gsap.to(g, {opacity:0, duration:.25});
    }
  });
}

/* ============================================================
   ACT 4 — LUGAR Y MOMENTO
   ============================================================ */
const MEDELLIN = ['medellín','medellin','bello','envigado','itagüí','itaguei','sabaneta','caldas','la estrella','copacabana','girardota','rionegro'];
const CITY_MAP = {
  'medellín':{x:95,y:128},'medellin':{x:95,y:128},
  'bogotá':{x:128,y:148},'bogota':{x:128,y:148},
  'cali':{x:82,y:162},
  'cartagena':{x:110,y:38},
  'barranquilla':{x:124,y:30},
  'bucaramanga':{x:132,y:108},
  'manizales':{x:100,y:140},
  'pereira':{x:93,y:144},
  'santa marta':{x:130,y:28},
};

let calYear, calMonth, selDate=null;

function initAct4() {
  const now = new Date();
  calYear=now.getFullYear(); calMonth=now.getMonth();
  buildCalendar();

  document.getElementById('cal-prev').addEventListener('click', ()=>{
    calMonth--; if(calMonth<0){calMonth=11;calYear--;} buildCalendar();
  });
  document.getElementById('cal-next').addEventListener('click', ()=>{
    calMonth++; if(calMonth>11){calMonth=0;calYear++;} buildCalendar();
  });

  initCityInput();
  initAforo();

  // Restore
  if (S.ciudad) { document.getElementById('cityInput').value=S.ciudad; document.getElementById('cityInput').dispatchEvent(new Event('input')); }
  if (S.fecha) {
    selDate = new Date(S.fecha+'T00:00:00');
    calYear=selDate.getFullYear(); calMonth=selDate.getMonth();
    buildCalendar();
  }

  document.getElementById('act4-continue').onclick = ()=>goTo(5);
  checkAct4Ready();
}

function checkAct4Ready() {
  const ok = S.ciudad.length > 1 && S.fecha;
  document.getElementById('act4-continue').classList.toggle('disabled',!ok);
  document.getElementById('act4-continue').disabled = !ok;
}

function initCityInput() {
  const inp  = document.getElementById('cityInput');
  const note = document.getElementById('cityNote');
  const dot  = document.getElementById('map-dot');

  inp.addEventListener('input', ()=>{
    const v = inp.value.trim().toLowerCase();
    S.ciudad = inp.value.trim();
    const local = MEDELLIN.some(c=>v.includes(c));
    S.fueraMedellin = v.length>2 && !local;
    note.className = 'city-note '+(local?'local':v.length>2?'remote':'');
    note.textContent = local ? '✓ Área base. Sin costo logístico adicional.'
      : v.length>2 ? 'Logística extendida considerada en el cálculo.' : '';

    const key = Object.keys(CITY_MAP).find(k=>v.includes(k));
    if (key) {
      gsap.to(dot, {attr:{cx:CITY_MAP[key].x, cy:CITY_MAP[key].y}, duration:.5, ease:'power2.out'});
    }
    save(); checkAct4Ready();
  });
}

function buildCalendar() {
  const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  document.getElementById('cal-month').textContent = MONTHS[calMonth]+' '+calYear;
  const grid = document.getElementById('cal-grid');
  grid.innerHTML='';
  const first = new Date(calYear,calMonth,1).getDay();
  const days  = new Date(calYear,calMonth+1,0).getDate();
  const t0    = today0();

  for(let i=0;i<first;i++){
    const e=document.createElement('div'); e.className='cal-d empty'; grid.appendChild(e);
  }
  for(let d=1;d<=days;d++){
    const dt=new Date(calYear,calMonth,d); dt.setHours(0,0,0,0);
    const el=document.createElement('div');
    const past=dt<t0, isSel=selDate&&dt.getTime()===selDate.getTime(), isToday=dt.getTime()===t0.getTime();
    el.className='cal-d'+(past?' past':'')+(isToday?' today':'')+(isSel?' sel':'');
    el.textContent=d;
    if(!past){
      el.addEventListener('click',()=>{
        selDate=dt; S.fecha=dt.toISOString().split('T')[0];
        S.urgencia = diffDays(S.fecha)<14;
        document.getElementById('urgency-note').classList.toggle('show',S.urgencia);
        save(); buildCalendar(); checkAct4Ready();
      });
    }
    grid.appendChild(el);
  }
}

let aforoIdx=1;
function initAforo() {
  document.querySelectorAll('.aforo-stop').forEach((s,i)=>{
    s.addEventListener('click',()=>{ aforoIdx=i; setAforo(i); });
  });
  setAforo(aforoIdx);
}
function setAforo(idx) {
  const d=AFORO[idx];
  S.aforo=d.id; S.aforoLabel=d.label+' ('+d.sub+')';
  document.querySelectorAll('.aforo-stop').forEach((s,i)=>s.classList.toggle('on',i===idx));
  document.getElementById('aforo-fill').style.width=(idx/4*100)+'%';
  drawDots(d.dots); save();
}
function drawDots(count) {
  const canvas=document.getElementById('aforo-canvas');
  if(!canvas) return;
  canvas.width=canvas.offsetWidth; canvas.height=canvas.offsetHeight;
  const ctx=canvas.getContext('2d');
  ctx.clearRect(0,0,canvas.width,canvas.height);
  const n=Math.min(count,600);
  for(let i=0;i<n;i++){
    ctx.beginPath();
    ctx.arc(Math.random()*(canvas.width-8)+4, Math.random()*(canvas.height-8)+4, 2.2, 0, Math.PI*2);
    ctx.fillStyle=`rgba(242,237,228,${.18+Math.random()*.38})`;
    ctx.fill();
  }
}

/* ============================================================
   ACT 5 — NIVEL
   ============================================================ */
function initAct5() {
  const cards=document.querySelectorAll('.level-card');
  // Restore previous selection visually when coming back
  cards.forEach(c => {
    c.classList.remove('dim');
    c.classList.toggle('selected', !!S.nivel && c.dataset.nivel === S.nivel);
  });
  if (initAct5._bound) return;
  initAct5._bound = true;
  cards.forEach(card=>{
    card.addEventListener('mouseenter',()=>cards.forEach(c=>c.classList.toggle('dim',c!==card)));
    card.addEventListener('mouseleave',()=>{
      if(!document.querySelector('.level-card.selected')) cards.forEach(c=>c.classList.remove('dim'));
    });
    card.addEventListener('click',()=>{
      cards.forEach(c=>{c.classList.remove('selected');c.classList.remove('dim');});
      card.classList.add('selected');
      S.nivel=card.dataset.nivel; S.nivelLabel=card.dataset.label;
      save();
      setTimeout(()=>goTo(6),380);
    });
  });
}

/* ============================================================
   ACT 6 — DETALLES
   ============================================================ */
function initAct6() {
  // Show conditional extras + restore checked state (re-runs on each entry)
  document.querySelectorAll('.extra-row').forEach(row=>{
    const cond=row.dataset.cond;
    if(cond && cond!==S.tipo) row.classList.add('hidden');
    else row.classList.remove('hidden');
    row.classList.toggle('on', S.extras.includes(row.dataset.id));
  });
  // Restore form values
  ['nombre','empresa','whatsapp','rol'].forEach(k=>{
    const el=document.getElementById('cf-'+k);
    if(el && S[k]) el.value=S[k];
  });

  if (initAct6._bound) return;
  initAct6._bound = true;

  document.querySelectorAll('.extra-row').forEach(row=>{
    row.addEventListener('click',()=>{
      row.classList.toggle('on');
      const id=row.dataset.id;
      if(row.classList.contains('on')){ if(!S.extras.includes(id)) S.extras.push(id); }
      else { S.extras=S.extras.filter(e=>e!==id); }
      S.extrasLabels=S.extras.map(id2=>{
        const r=document.querySelector(`.extra-row[data-id="${id2}"] .extra-name`);
        return r?r.textContent:'';
      });
      save();
    });
  });

  // Form input listeners (single-bind via .oninput)
  ['nombre','empresa','whatsapp','rol'].forEach(k=>{
    const el=document.getElementById('cf-'+k);
    if(!el) return;
    el.oninput = ()=>{ S[k]=el.value; save(); };
  });

  // WA format helper
  const waEl=document.getElementById('cf-whatsapp');
  waEl.onblur = ()=>{
    let v=waEl.value.replace(/\D/g,'');
    if(v.startsWith('3')&&v.length===10) waEl.value='+57'+v;
    S.whatsapp=waEl.value; save();
  };

  document.getElementById('act6-cta').onclick = ()=>{
    let err=false;
    ['cf-nombre','cf-empresa','cf-whatsapp'].forEach(id=>{
      const el=document.getElementById(id);
      const bad=el.value.trim().length<2;
      el.classList.toggle('error',bad);
      if(bad) err=true;
    });
    if(err){ gsap.to('.contact-form',{x:5,duration:.07,yoyo:true,repeat:4}); return; }
    save();
    // Dramatic transition to Act 7
    goTo(7,(from,to)=>{
      gsap.set(to, {zIndex: 2}); gsap.set(from, {zIndex: 1});
      gsap.to(from,{opacity:0,duration:.45,ease:'power2.inOut',onComplete:()=>{
        from.classList.remove('active');
        gsap.set(from,{clearProps:'opacity,y,zIndex,transform'});
      }});
      to.classList.add('active'); gsap.set(to,{opacity:0});
      gsap.to(to,{opacity:1,duration:.45,ease:'power2.out',delay:.15,onComplete:()=>{
        gsap.set(to,{clearProps:'zIndex'});
        startReveal();
      }});
      initAct(7);
    });
  };
}

/* ============================================================
   ACT 7 — REVELACIÓN
   ============================================================ */
function initAct7() { /* started via startReveal */ }

function startReveal() {
  const loading=document.getElementById('loading-screen');
  const reveal =document.getElementById('reveal-screen');
  const superp =document.getElementById('superp-screen');
  loading.style.display='flex'; reveal.style.display='none'; superp.style.display='none';

  // Fill loading bar
  setTimeout(()=>{ document.getElementById('loading-bar').style.width='100%'; },60);

  setTimeout(()=>{
    const result=calcular();
    loading.style.display='none';
    if(!result) return;

    if(result.superp){
      superp.style.display='flex';
      gsap.from(superp.children,{opacity:0,y:18,stagger:.12,duration:.6,ease:'power3.out'});
      // Envía aunque sea superproducción: el lead es valioso.
      enviarCotizacionFinal({ es_superproduccion: 'Sí' });
    } else {
      S.rangoMin=result.min; S.rangoMax=result.max;
      S.rangoDisplay=cop(result.min)+' – '+cop(result.max)+' COP';
      save();

      populatePropCard();
      reveal.style.display='flex';
      gsap.to(reveal,{opacity:1,duration:.55,ease:'power2.out'});

      setTimeout(()=>{
        scramble(document.getElementById('price-min'), result.min, 1200);
        setTimeout(()=>scramble(document.getElementById('price-max'), result.max, 1200), 220);
      },400);

      // → Envío final a Google Sheets (con UI visible: loading + éxito/error)
      setTimeout(() => enviarCotizacionFinal(), 900);
    }
  },1650);
}

function populatePropCard() {
  const dateStr = S.fecha
    ? new Date(S.fecha+'T00:00:00').toLocaleDateString('es-CO',{day:'numeric',month:'long',year:'numeric'})
    : 'Fecha por definir';
  const today = new Date();
  const todayStr = today.getDate()+'.'+String(today.getMonth()+1).padStart(2,'0')+'.'+today.getFullYear();

  document.getElementById('pc-tipo').textContent    = S.tipoLabel||S.tipo;
  document.getElementById('pc-formato').textContent = S.formatoLabel;
  document.getElementById('pc-lugar').textContent   = (S.ciudad||'Ciudad')+' · '+dateStr;
  document.getElementById('pc-aforo').textContent   = S.aforoLabel+' · Nivel '+S.nivelLabel;
  document.getElementById('pc-extras').innerHTML    = S.extrasLabels.map(e=>'<div>+ '+e+'</div>').join('');
  document.getElementById('pc-footer').textContent  = leadId+' · '+todayStr;

  document.getElementById('r-cta-wa').onclick = ()=>{
    postLead({...S, action:'whatsapp_click'});
    window.open('https://wa.me/'+WHATSAPP+'?text='+encodeURIComponent(buildWA()),'_blank');
    setTimeout(()=>goTo(8),500);
  };
  document.getElementById('r-cta-email').onclick = ()=>{
    toast('<div class="toast-text">Resumen enviado a '+S.email+'</div>',4000);
  };
  document.getElementById('r-cta-reset').onclick = ()=>{
    try { sessionStorage.removeItem('mdf_q1'); } catch(e){}
    window.location.href = window.location.pathname + window.location.search;
  };
}

/* ============================================================
   ACT 8 — CONFIRMACIÓN
   ============================================================ */
function initAct8() {
  const today=new Date();
  document.getElementById('a8-ref').textContent =
    leadId+' · ARCHIVADO · '+today.getDate()+'.'+String(today.getMonth()+1).padStart(2,'0')+'.'+today.getFullYear();

  // Draw checkmark
  gsap.to('#ck-path',{strokeDashoffset:0,duration:.85,ease:'power2.out',delay:.3});

  document.getElementById('a8-wa').onclick = ()=>{
    window.open('https://wa.me/'+WHATSAPP+'?text='+encodeURIComponent(buildWA()),'_blank');
  };
  document.getElementById('a8-share').onclick = ()=>{
    if(navigator.share){
      navigator.share({title:'Cotizador · Músicos de Fondo',text:'Cotiza tu evento sonoro en 3 minutos',url:window.location.href});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast('<div class="toast-text">Link copiado al portapapeles</div>',3000);
    }
  };
}

/* ── Back button ── */
function handleBack() {
  if(currentAct<=1) goTo(0);
  else goTo(currentAct-1);
}

/* ── Audio toggle ── */
document.getElementById('audio-btn').addEventListener('click',()=>{
  S.audioOn=!S.audioOn;
  document.getElementById('audio-btn').classList.toggle('on',S.audioOn);
  document.getElementById('audio-label').textContent=S.audioOn?'SFX ON':'SFX OFF';
});

/* ── Back btn ── */
document.getElementById('btnBack').addEventListener('click', handleBack);

/* ── Keyboard ── */
document.addEventListener('keydown',e=>{
  if(e.key==='ArrowDown'&&currentAct===0) document.getElementById('act-0').click();
  if(e.key==='Escape'&&currentAct>0&&currentAct<8) handleBack();
});

/* ── Act init dispatch ── */
function initAct(n) {
  const fns=[initAct0,initAct1,initAct2,initAct3,initAct4,initAct5,initAct6,initAct7,initAct8];
  if(fns[n]) fns[n]();
}

/* ── Init ── */
function init() {
  // Build progress dots
  const dotsWrap=document.querySelector('.progress-dots');
  for(let i=1;i<=7;i++){
    const d=document.createElement('div'); d.className='p-dot'; dotsWrap.appendChild(d);
  }

  // Session restore
  const saved=loadSaved();
  if(saved&&saved.S&&saved.S.email){
    Object.assign(S, saved.S);
    const act=saved.currentAct||1;
    toast(`<div class="toast-text">¿Continuar donde lo dejaste?</div><div class="toast-btns"><button class="toast-btn yes" onclick="resumeSession(${act})">SÍ</button><button class="toast-btn no" onclick="clearSession()">NO</button></div>`, 6000);
  }

  // Start Act 0
  document.getElementById('act-0').classList.add('active');
  initAct0();

  // Reintenta envíos pendientes en background (silencioso)
  setTimeout(_flushRetryQueue, 2500);
}

window.resumeSession = function(act) {
  dismissToast();
  document.getElementById('act-0').classList.remove('active');
  const to=document.getElementById('act-'+act);
  if(to){ to.classList.add('active'); gsap.set(to,{opacity:0}); gsap.to(to,{opacity:1,duration:.5}); currentAct=act; updateDots(); initAct(act); }
  document.querySelector('.global-nav').classList.add('visible');
  document.querySelector('.progress-dots').classList.add('visible');
};
window.clearSession = function() {
  dismissToast(); sessionStorage.removeItem('mdf_q1'); Object.assign(S,{email:'',nombre:'',empresa:'',whatsapp:'',tipo:null,nivel:null,extras:[]});
};

document.addEventListener('DOMContentLoaded', init);
