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

/* ════════════════════════════════════════════════════════════
   📧 EMAILJS — CONFIGURACIÓN DE ENVÍO DE CORREO
   ────────────────────────────────────────────────────────────
   Sigue la GUIA_EMAILJS_SETUP.md para obtener estos valores.
   Si dejas los placeholders, el cotizador funciona normal
   pero NO envía correos (modo offline).
   ════════════════════════════════════════════════════════════ */
const EMAILJS_PUBLIC_KEY       = 'BNPpCHam_pjQWE7_H';
const EMAILJS_SERVICE_ID       = 'service_dz9im8s';
const EMAILJS_TEMPLATE_CLIENTE = 'template_c4fhu7j';
const EMAILJS_TEMPLATE_INTERNO = 'template_63izjnv';
const EMAIL_COPIA_INTERNA      = 'marlon.zapata@falsoidolo.com';
/* ════════════════════════════════════════════════════════════ */

const WHATSAPP = '573003033436';

/* ── State ── */
let currentAct = 0;
const leadId = 'N° ' + String(10000 + Math.floor(Math.random() * 89999));

const S = {
  email: '', fuente: '',
  nombre: '', empresa: '', whatsapp: '', rol: '',
  tipo: null, tipoLabel: '',
  formato: 'cuarteto', formatoLabel: 'Cuarteto · 4 músicos',
  instrumentacionSugerida: '', instrumentacionCustom: '',
  ciudad: '', fecha: null,
  aforo: 'mediano', aforoLabel: 'Mediano (30–100)',
  duracion: null, duracionLabel: '', duracionCustom: '',
  produccionTecnica: null, produccionTecnicaLabel: '',
  // Compatibilidad legacy (algunos lugares todavía lo usan)
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
// Multiplicador por duración del show (reemplaza al antiguo NMULT de nivel)
const DMULT = { set40:0.78, set60:0.92, set2x45:1.10, set3x45:1.45, otro:1.10 };
// Multiplicador por producción técnica
const PMULT = { completa:1.00, parcial:0.92, cliente:0.84 };
const AMULT = { intimo:1.00, mediano:1.00, grande:1.10, masivo:1.25, mayor:1.45 };
const EXTRAS_COST = {
  repertorio_custom:1500000, licencias:1200000, vestuario:600000,
  set_extra:900000, marionetas:2500000, audiovisual_extra:1800000,
};

/* ── Ensemble data ── */
const ENSEMBLES = [
  { id:'duo',      label:'Dúo',      n:2, inst:'Voz · Piano',                      ideal:'Recepciones íntimas, lounge',
    options:['Voz + Piano','Voz + Guitarra','Piano + Contrabajo','Saxo + Piano'] },
  { id:'trio',     label:'Trío',     n:3, inst:'Voz · Piano · Contrabajo',          ideal:'Cenas privadas, eventos boutique',
    options:['Voz + Piano + Contrabajo','Piano + Bajo + Batería (jazz trío)','Voz + Guitarra + Cajon','Saxo + Piano + Contrabajo'] },
  { id:'cuarteto', label:'Cuarteto', n:4, inst:'Voz · Piano · Bajo · Batería',      ideal:'Corporativos, fine dining', best:true,
    options:['Voz + Piano + Bajo + Batería','Voz + Saxo + Piano + Contrabajo','Voz + Guitarra + Bajo + Batería','Piano + Saxo + Contrabajo + Batería'] },
  { id:'quinteto', label:'Quinteto', n:5, inst:'Voz · Piano · Bajo · Batería · Bronce', ideal:'Eventos de aforo mayor',
    options:['Voz + Piano + Bajo + Batería + Saxo','Voz + Piano + Bajo + Batería + Trompeta','Voz + Piano + Guitarra + Bajo + Batería','Voz + Saxo + Trompeta + Bajo + Batería'] },
  { id:'septeto',  label:'Septeto',  n:7, inst:'Big Band reducida · Bronces · Voces', ideal:'Espectáculos, producciones premium',
    options:['Big Band reducida (jazz tradicional)','2 Voces + Piano + Bajo + Batería + 2 Bronces','Voz + Piano + Guitarra + Bajo + Batería + Saxo + Trompeta','Voz + Cuerdas (vl/vla/vc) + Piano + Bajo + Batería'] },
];

/* ── Event types ── */
const EVENTS = [
  { id:'horeca',     name:'Experiencia 360°',  img:'uploads/singercloseup.jpg',      persona:'Restaurantes · Hoteles',   desc:'Diseño sonoro inmersivo para espacios gastronómicos.' },
  { id:'cine',       name:'Cine-Conciertos',   img:'uploads/cineconciertos.jpg',     persona:'Teatros · Cultura',        desc:'Musicalización de películas en vivo. Derechos incluidos.' },
  { id:'navijazz',   name:'NaviJazz',          img:'uploads/bandperformance1.jpg',   persona:'Fin de Año · Retail',      desc:'Espectáculo de fin de año con big band y producción premium.' },
  { id:'itinerante', name:'Música Itinerante', img:'uploads/bandperformance.jpg',    persona:'Centros Comerciales',      desc:'Formatos móviles que recorren el espacio sorprendiendo.' },
  { id:'boda',       name:'Bodas Simbólicas',  img:'uploads/trumpetcloseup.jpg',     persona:'Wedding Premium',          desc:'Arreglos orquestales a medida para tu ceremonia.' },
  { id:'corporativo',name:'Pulso Corporativos', img:'uploads/pianistcloseup.jpg',     persona:'RRHH · Bienestar',         desc:'Laboratorios de arte y bienestar para equipos corporativos.' },
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
  if (!S.tipo || !S.duracion || !S.produccionTecnica || !S.formato || !S.aforo) return null;
  let base = BASE[S.tipo];
  let adj = base * FMULT[S.formato] * (DMULT[S.duracion]||1) * (PMULT[S.produccionTecnica]||1) * AMULT[S.aforo];
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

    // Nivel y extras (legacy)
    nivel:         S.nivel      || '',
    nivel_label:   S.nivelLabel || '',

    // Programa (duración + producción técnica)
    duracion:                S.duracion || '',
    duracion_label:          S.duracionLabel || '',
    duracion_custom:         S.duracionCustom || '',
    produccion_tecnica:      S.produccionTecnica || '',
    produccion_tecnica_label:S.produccionTecnicaLabel || '',

    // Instrumentación
    instrumentacion_sugerida: S.instrumentacionSugerida || '',
    instrumentacion_custom:   S.instrumentacionCustom || '',

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
  const durStr = S.duracion==='otro' && S.duracionCustom ? S.duracionCustom : S.duracionLabel;
  const instStr = S.instrumentacionCustom ? S.instrumentacionCustom : (S.instrumentacionSugerida || 'Sugerencia del equipo');
  return `Hola Marlon, soy ${S.nombre} de ${S.empresa}.

Acabo de cotizar en el sitio web:
• Tipo: ${S.tipoLabel}
• Formato: ${S.formatoLabel}
• Instrumentación: ${instStr}
• ${S.ciudad || 'Ciudad por definir'} · ${S.fecha || 'Fecha por definir'}
• Aforo: ${S.aforoLabel}
• Duración: ${durStr}
• Producción técnica: ${S.produccionTecnicaLabel}
• Extras: ${extStr}

Estimado: ${S.rangoDisplay}

Me gustaría conversar para afinar la propuesta.`;
}

/* ============================================================
   📧 EMAIL — Generación y envío de correos
   ============================================================ */
function _isEmailConfigured() {
  return EMAILJS_PUBLIC_KEY &&
         !EMAILJS_PUBLIC_KEY.startsWith('PEGA_AQUI') &&
         EMAILJS_SERVICE_ID &&
         !EMAILJS_SERVICE_ID.startsWith('PEGA_AQUI');
}

function _emailDateStr() {
  return new Date().toLocaleDateString('es-CO', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
}

function _eventDateStr() {
  if (!S.fecha) return 'Por definir';
  return new Date(S.fecha + 'T00:00:00').toLocaleDateString('es-CO', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
}

function _instrStr() {
  return S.instrumentacionCustom || S.instrumentacionSugerida || 'Sugerencia del equipo';
}

function _durStr() {
  return (S.duracion === 'otro' && S.duracionCustom) ? S.duracionCustom : (S.duracionLabel || '—');
}

/* ── Email HTML para el CLIENTE ── */
function buildEmailCliente() {
  const extrasHtml = S.extrasLabels.length
    ? S.extrasLabels.map(e => `
        <tr><td style="padding:6px 16px;font-family:'Montserrat',Helvetica,Arial,sans-serif;font-size:13px;color:#C9A84C;border-bottom:1px solid rgba(201,168,76,0.12);">+ ${e}</td></tr>
      `).join('')
    : '';

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#050403;font-family:'Montserrat',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#050403;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#0A0907;border:1px solid rgba(201,168,76,0.16);border-radius:4px;">

  <!-- Header -->
  <tr><td style="padding:40px 40px 20px;text-align:center;">
    <p style="margin:0;font-size:11px;letter-spacing:0.25em;color:#C9A84C;font-weight:600;text-transform:uppercase;">MÚSICOS DE FONDO</p>
  </td></tr>

  <!-- Headline -->
  <tr><td style="padding:10px 40px 8px;text-align:center;">
    <h1 style="margin:0;font-family:'Georgia','Cormorant Garamond',serif;font-size:28px;font-weight:300;color:#F2EDE4;line-height:1.3;">
      Tu propuesta musical,<br><em style="color:#C9A84C;font-style:italic;">lista.</em>
    </h1>
  </td></tr>

  <!-- Subline -->
  <tr><td style="padding:8px 40px 30px;text-align:center;">
    <p style="margin:0;font-size:14px;color:rgba(242,237,228,0.55);line-height:1.6;">
      ${S.nombre}, aquí tienes el resumen de lo que diseñaste en el cotizador. Marlon te escribirá personalmente en las próximas horas hábiles para afinar los detalles.
    </p>
  </td></tr>

  <!-- Divider -->
  <tr><td style="padding:0 40px;"><div style="border-top:1px solid rgba(201,168,76,0.16);"></div></td></tr>

  <!-- Price Block -->
  <tr><td style="padding:30px 40px;text-align:center;">
    <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.2em;color:rgba(242,237,228,0.38);text-transform:uppercase;">Rango estimado de inversión</p>
    <p style="margin:0;font-family:'Georgia','Cormorant Garamond',serif;font-size:36px;color:#F2EDE4;font-weight:300;letter-spacing:-0.02em;">
      ${cop(S.rangoMin)} <span style="color:rgba(201,168,76,0.4);margin:0 4px;">—</span> ${cop(S.rangoMax)}
    </p>
    <p style="margin:6px 0 0;font-size:11px;letter-spacing:0.15em;color:#C9A84C;font-weight:500;">COP</p>
    <p style="margin:10px 0 0;font-size:11px;color:rgba(242,237,228,0.35);line-height:1.5;">
      Exento de IVA · Sujeto a retenciones de ley vigentes
    </p>
  </td></tr>

  <!-- Divider -->
  <tr><td style="padding:0 40px;"><div style="border-top:1px solid rgba(201,168,76,0.16);"></div></td></tr>

  <!-- Proposal Card -->
  <tr><td style="padding:30px 40px 10px;">
    <p style="margin:0 0 16px;font-size:11px;letter-spacing:0.2em;color:#C9A84C;font-weight:600;text-transform:uppercase;">DETALLE DE TU PROPUESTA</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(18,16,13,0.6);border:1px solid rgba(201,168,76,0.12);border-radius:4px;">
      <tr><td style="padding:12px 16px;font-family:'Montserrat',Helvetica,Arial,sans-serif;font-size:16px;font-weight:600;color:#F2EDE4;border-bottom:1px solid rgba(201,168,76,0.12);">${S.tipoLabel || S.tipo}</td></tr>
      <tr><td style="padding:8px 16px;font-size:13px;color:rgba(242,237,228,0.65);border-bottom:1px solid rgba(201,168,76,0.08);">Formato: ${S.formatoLabel}</td></tr>
      <tr><td style="padding:8px 16px;font-size:13px;color:rgba(242,237,228,0.65);border-bottom:1px solid rgba(201,168,76,0.08);">Instrumentación: ${_instrStr()}</td></tr>
      <tr><td style="padding:8px 16px;font-size:13px;color:rgba(242,237,228,0.65);border-bottom:1px solid rgba(201,168,76,0.08);">${S.ciudad || 'Ciudad por definir'} · ${_eventDateStr()}</td></tr>
      <tr><td style="padding:8px 16px;font-size:13px;color:rgba(242,237,228,0.65);border-bottom:1px solid rgba(201,168,76,0.08);">Aforo: ${S.aforoLabel}</td></tr>
      <tr><td style="padding:8px 16px;font-size:13px;color:rgba(242,237,228,0.65);border-bottom:1px solid rgba(201,168,76,0.08);">Duración: ${_durStr()}</td></tr>
      <tr><td style="padding:8px 16px;font-size:13px;color:rgba(242,237,228,0.65);${S.extrasLabels.length ? 'border-bottom:1px solid rgba(201,168,76,0.12);' : ''}">Producción técnica: ${S.produccionTecnicaLabel || '—'}</td></tr>
      ${extrasHtml}
    </table>
  </td></tr>

  <!-- CTA WhatsApp -->
  <tr><td style="padding:30px 40px;text-align:center;">
    <a href="https://wa.me/573003033436?text=${encodeURIComponent(buildWA())}" target="_blank"
       style="display:inline-block;padding:14px 36px;background:#C9A84C;color:#050403;font-family:'Montserrat',Helvetica,Arial,sans-serif;font-size:13px;font-weight:700;letter-spacing:0.12em;text-decoration:none;border-radius:40px;text-transform:uppercase;">
      HABLAR CON MARLON →
    </a>
    <p style="margin:14px 0 0;font-size:12px;color:rgba(242,237,228,0.35);">
      O escríbenos a <a href="mailto:musicosdefondo@gmail.com" style="color:#C9A84C;text-decoration:none;">musicosdefondo@gmail.com</a>
    </p>
  </td></tr>

  <!-- Divider -->
  <tr><td style="padding:0 40px;"><div style="border-top:1px solid rgba(201,168,76,0.1);"></div></td></tr>

  <!-- Footer -->
  <tr><td style="padding:24px 40px 32px;text-align:center;">
    <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.15em;color:rgba(242,237,228,0.25);text-transform:uppercase;">Músicos de Fondo · Falso Ídolo</p>
    <p style="margin:0 0 4px;font-size:11px;color:rgba(242,237,228,0.2);">Medellín, Colombia · +57 300 303 3436</p>
    <p style="margin:0;font-size:10px;color:rgba(242,237,228,0.15);">${leadId} · ${_emailDateStr()}</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

/* ── Email HTML para COPIA INTERNA ── */
function buildEmailInterno() {
  const extStr = S.extrasLabels.length ? S.extrasLabels.join(', ') : 'Ninguno';
  const durSesion = Math.round((Date.now() - S.startTime) / 1000);

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#050403;font-family:'Montserrat',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#050403;padding:30px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#0A0907;border:1px solid rgba(201,168,76,0.16);border-radius:4px;">

  <tr><td style="padding:30px 30px 15px;">
    <p style="margin:0;font-size:11px;letter-spacing:0.2em;color:#C9A84C;font-weight:600;">NUEVO LEAD · COTIZADOR</p>
    <h2 style="margin:8px 0 0;font-size:22px;color:#F2EDE4;font-weight:400;">${S.nombre} <span style="color:rgba(242,237,228,0.4);">·</span> ${S.empresa}</h2>
  </td></tr>

  <tr><td style="padding:0 30px;"><div style="border-top:1px solid rgba(201,168,76,0.12);"></div></td></tr>

  <tr><td style="padding:20px 30px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;color:rgba(242,237,228,0.65);">
      <tr><td style="padding:4px 0;color:#C9A84C;font-weight:600;width:160px;">Email</td><td style="padding:4px 0;">${S.email}</td></tr>
      <tr><td style="padding:4px 0;color:#C9A84C;font-weight:600;">WhatsApp</td><td style="padding:4px 0;">${S.whatsapp}</td></tr>
      <tr><td style="padding:4px 0;color:#C9A84C;font-weight:600;">Rol</td><td style="padding:4px 0;">${S.rol || '—'}</td></tr>
      <tr><td style="padding:4px 0;color:#C9A84C;font-weight:600;">Fuente</td><td style="padding:4px 0;">${S.fuente || '—'}</td></tr>
      <tr><td colspan="2" style="padding:10px 0 4px;"><div style="border-top:1px solid rgba(201,168,76,0.08);"></div></td></tr>
      <tr><td style="padding:4px 0;color:#C9A84C;font-weight:600;">Tipo</td><td style="padding:4px 0;">${S.tipoLabel}</td></tr>
      <tr><td style="padding:4px 0;color:#C9A84C;font-weight:600;">Formato</td><td style="padding:4px 0;">${S.formatoLabel}</td></tr>
      <tr><td style="padding:4px 0;color:#C9A84C;font-weight:600;">Instrumentación</td><td style="padding:4px 0;">${_instrStr()}</td></tr>
      <tr><td style="padding:4px 0;color:#C9A84C;font-weight:600;">Ciudad</td><td style="padding:4px 0;">${S.ciudad || '—'} ${S.fueraMedellin ? '(fuera de Medellín)' : ''}</td></tr>
      <tr><td style="padding:4px 0;color:#C9A84C;font-weight:600;">Fecha</td><td style="padding:4px 0;">${_eventDateStr()} ${S.urgencia ? '⚡ URGENTE' : ''}</td></tr>
      <tr><td style="padding:4px 0;color:#C9A84C;font-weight:600;">Aforo</td><td style="padding:4px 0;">${S.aforoLabel}</td></tr>
      <tr><td style="padding:4px 0;color:#C9A84C;font-weight:600;">Duración</td><td style="padding:4px 0;">${_durStr()}</td></tr>
      <tr><td style="padding:4px 0;color:#C9A84C;font-weight:600;">Producción</td><td style="padding:4px 0;">${S.produccionTecnicaLabel || '—'}</td></tr>
      <tr><td style="padding:4px 0;color:#C9A84C;font-weight:600;">Extras</td><td style="padding:4px 0;">${extStr}</td></tr>
      <tr><td colspan="2" style="padding:10px 0 4px;"><div style="border-top:1px solid rgba(201,168,76,0.08);"></div></td></tr>
      <tr><td style="padding:4px 0;color:#C9A84C;font-weight:700;">RANGO</td><td style="padding:4px 0;color:#F2EDE4;font-weight:600;font-size:15px;">${S.rangoDisplay}</td></tr>
    </table>
  </td></tr>

  <tr><td style="padding:0 30px;"><div style="border-top:1px solid rgba(201,168,76,0.12);"></div></td></tr>

  <tr><td style="padding:16px 30px 24px;">
    <p style="margin:0;font-size:10px;color:rgba(242,237,228,0.25);">
      ${leadId} · ${_emailDateStr()} · Sesión: ${durSesion}s · Referrer: ${document.referrer || 'directo'}
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

/* ── Enviar correos ── */
let _emailEnviado = false;

async function enviarEmailCotizacion() {
  if (_emailEnviado) {
    toast('<div class="toast-text">✓ El resumen ya fue enviado a ' + S.email + '</div>', 3500);
    return true;
  }
  if (!_isEmailConfigured()) {
    console.warn('[Cotizador] EmailJS no configurado. Omitiendo envío de correo.');
    toast('<div class="toast-text">⚠ El envío de email no está configurado aún.</div>', 4000);
    return false;
  }
  if (!S.email) {
    toast('<div class="toast-text">⚠ No hay email de destino.</div>', 3500);
    return false;
  }

  toast('<div class="toast-text">⟳ Enviando resumen a ' + S.email + '…</div>', 12000);

  try {
    // Inicializar EmailJS (idempotente)
    emailjs.init(EMAILJS_PUBLIC_KEY);

    // 1. Correo al cliente
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_CLIENTE, {
      to_email:  S.email,
      lead_id:   leadId,
      html_body: buildEmailCliente(),
    });

    // 2. Copia interna (best-effort, no bloquea)
    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_INTERNO, {
      lead_id:        leadId,
      cliente_nombre: S.nombre,
      tipo_evento:    S.tipoLabel,
      html_body_interno: buildEmailInterno(),
    }).catch(err => console.warn('[Cotizador] Error enviando copia interna:', err));

    _emailEnviado = true;
    toast('<div class="toast-text">✓ Resumen enviado a ' + S.email + '</div>', 4500);
    return true;

  } catch (err) {
    console.error('[Cotizador] Error enviando email:', err);
    toast(
      '<div class="toast-text">⚠ No pudimos enviar el correo. Intenta de nuevo.</div>' +
      '<div class="toast-btns">' +
        '<button class="toast-btn yes" onclick="enviarEmailCotizacion()">REINTENTAR</button>' +
        '<button class="toast-btn no" onclick="dismissToast()">CERRAR</button>' +
      '</div>',
      12000
    );
    return false;
  }
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
  const tNum = document.getElementById('t-num');
  if (tNum) tNum.textContent = leadId;
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
  const rows     = document.querySelectorAll('.event-row');
  const bgWrap   = document.querySelector('.a2-bg');
  const bgImg    = bgWrap.querySelector('img');
  const trigger  = document.getElementById('a2-trigger');
  const trigLbl  = document.getElementById('a2-trig-label');
  const panel    = document.getElementById('a2-panel');
  const continueBtn = document.getElementById('a2-continue');

  const closePanel = () => {
    trigger.classList.remove('open');
    panel.classList.remove('open');
  };
  const openPanel = () => {
    trigger.classList.add('open');
    panel.classList.add('open');
  };

  // Restore previous selection (when navigating back into act 2)
  rows.forEach(r => { r.classList.remove('selected','dim'); r.querySelector('.event-thumb').classList.remove('expanded'); });
  closePanel();
  if (S.tipo) {
    const prev = Array.from(rows).find(r => r.dataset.id === S.tipo);
    if (prev) {
      prev.classList.add('selected');
      trigLbl.innerHTML = '<span class="micro-tag">Tipo de evento</span>' + (S.tipoLabel || prev.dataset.label);
      bgImg.src = prev.dataset.img;
      bgWrap.classList.add('show');
      continueBtn.classList.add('show');
    }
  } else {
    trigLbl.innerHTML = '<span class="micro-tag">Tipo de evento</span>Selecciona una experiencia';
    bgWrap.classList.remove('show');
    continueBtn.classList.remove('show');
  }

  if (initAct2._bound) return;
  initAct2._bound = true;

  // Toggle dropdown
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    if (trigger.classList.contains('open')) closePanel();
    else openPanel();
  });

  // Close on outside click / escape
  document.addEventListener('click', (e) => {
    if (!document.getElementById('act-2').classList.contains('active')) return;
    if (!panel.contains(e.target) && !trigger.contains(e.target)) closePanel();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel.classList.contains('open')) closePanel();
  });

  // Row hover / select
  rows.forEach(row => {
    const thumb = row.querySelector('.event-thumb');

    row.addEventListener('mouseenter', () => {
      rows.forEach(r => r.classList.toggle('dim', r !== row));
      bgImg.src = row.dataset.img;
      bgWrap.classList.add('show');
      thumb.classList.add('expanded');
    });
    row.addEventListener('mouseleave', () => {
      rows.forEach(r => r.classList.remove('dim'));
      thumb.classList.remove('expanded');
      if (!document.querySelector('.event-row.selected')) bgWrap.classList.remove('show');
    });

    row.addEventListener('click', () => {
      rows.forEach(r => r.classList.remove('selected'));
      row.classList.add('selected');
      S.tipo = row.dataset.id;
      S.tipoLabel = row.dataset.label;
      bgImg.src = row.dataset.img; bgWrap.classList.add('show');
      // Pre-select septeto for cine/navijazz
      if (S.tipo === 'cine' || S.tipo === 'navijazz') { S.formato = 'septeto'; S._preFormat = true; }
      else { S._preFormat = false; }
      save();

      // Update trigger label, close dropdown, reveal continue button
      trigLbl.innerHTML = '<span class="micro-tag">Tipo de evento</span>' + row.dataset.label;
      closePanel();
      continueBtn.classList.add('show');
    });
  });

  // CONTINUAR → wipe transition into act 3
  continueBtn.addEventListener('click', () => {
    if (!S.tipo) return;
    const curtain = document.createElement('div');
    Object.assign(curtain.style, {
      position: 'fixed', inset: '0',
      background: 'rgba(201,168,76,.06)', zIndex: '900',
      transformOrigin: 'left', transform: 'scaleX(0)', pointerEvents: 'none',
    });
    document.body.appendChild(curtain);
    gsap.timeline({ onComplete: () => { curtain.remove(); } })
      .to(curtain, { scaleX: 1, duration: .32, ease: 'power2.in' })
      .call(() => {
        document.getElementById('act-2').classList.remove('active');
        const to = document.getElementById('act-3'); to.classList.add('active');
        gsap.set(to, { opacity: 0 }); currentAct = 3; save(); updateDots(); initAct(3);
      })
      .to(curtain, { scaleX: 0, transformOrigin: 'right', duration: .32, ease: 'power2.out' })
      .to(document.getElementById('act-3'), { opacity: 1, duration: .25, ease: 'power2.out' }, '-=.2');
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

  // Restaurar instrumentación custom + listeners (una vez)
  const customInput = document.getElementById('a3-instr-custom');
  const sel = document.getElementById('a3-instr-select');
  if (customInput && S.instrumentacionCustom) customInput.value = S.instrumentacionCustom;

  if (!initAct3._bound) {
    initAct3._bound = true;
    if (sel) sel.addEventListener('change', () => {
      S.instrumentacionSugerida = sel.value || '';
      save();
    });
    if (customInput) customInput.addEventListener('input', () => {
      S.instrumentacionCustom = customInput.value;
      save();
    });
  }

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

  // Repoblar dropdown de instrumentación según el formato
  const sel = document.getElementById('a3-instr-select');
  if (sel) {
    sel.innerHTML = '';
    const optDefault = document.createElement('option');
    optDefault.value = '';
    optDefault.textContent = 'Sugerencia del equipo — ' + d.inst;
    sel.appendChild(optDefault);
    (d.options || []).forEach(o => {
      const op = document.createElement('option');
      op.value = o; op.textContent = o;
      sel.appendChild(op);
    });
    // Restaurar selección previa si coincide con el formato
    if (S.instrumentacionSugerida && (d.options || []).includes(S.instrumentacionSugerida)) {
      sel.value = S.instrumentacionSugerida;
    } else {
      sel.value = '';
      S.instrumentacionSugerida = '';
    }
  }

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

  initCitySelect();
  initAforo();

  if (S.fecha) {
    selDate = new Date(S.fecha+'T00:00:00');
    calYear=selDate.getFullYear(); calMonth=selDate.getMonth();
    buildCalendar();
  }

  document.getElementById('act4-continue').onclick = ()=>goTo(5);
  checkAct4Ready();
}

function checkAct4Ready() {
  const ok = (S.ciudad && S.ciudad.length > 1) && S.fecha && S.aforo;
  const btn = document.getElementById('act4-continue');
  btn.classList.toggle('disabled', !ok);
  btn.disabled = !ok;
}

function initCitySelect() {
  const radios = document.querySelectorAll('.city-radio');
  const input  = document.getElementById('cityInput');
  const note   = document.getElementById('cityNote');

  function applyCity(label, isLocal, isCustom) {
    S.ciudad = label;
    S.fueraMedellin = !isLocal && label.length > 1;
    note.className = 'city-note ' + (isLocal ? 'local' : label.length > 1 ? 'remote' : '');
    note.textContent = isLocal
      ? '✓ Área base. Sin costo logístico adicional.'
      : isCustom && label.length > 1 ? 'Logística extendida considerada en el cálculo.'
      : '';
    save(); checkAct4Ready();
  }

  radios.forEach(r => {
    r.addEventListener('click', () => {
      radios.forEach(x => x.classList.remove('on'));
      r.classList.add('on');
      const c = r.dataset.city;
      if (c === 'medellin') {
        input.classList.remove('show'); input.value = '';
        applyCity('Medellín', true, false);
      } else if (c === 'bogota') {
        input.classList.remove('show'); input.value = '';
        applyCity('Bogotá', false, false);
      } else { // otro
        input.classList.add('show');
        setTimeout(()=>input.focus(), 80);
        if (input.value.trim()) applyCity(input.value.trim(), false, true);
        else applyCity('', false, true);
      }
    });
  });

  input.addEventListener('input', () => {
    const v = input.value.trim();
    const lower = v.toLowerCase();
    const local = MEDELLIN.some(c=>lower.includes(c));
    applyCity(v, local, true);
  });

  // Restore from saved state
  if (S.ciudad) {
    const lc = S.ciudad.toLowerCase();
    if (/medell[íi]n/.test(lc)) {
      document.querySelector('.city-radio[data-city="medellin"]').click();
    } else if (/bogot[áa]/.test(lc)) {
      document.querySelector('.city-radio[data-city="bogota"]').click();
    } else {
      document.querySelector('.city-radio[data-city="otro"]').classList.add('on');
      input.classList.add('show');
      input.value = S.ciudad;
      applyCity(S.ciudad, false, true);
    }
  }
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

function initAforo() {
  const opts = document.querySelectorAll('.aforo-opt');
  // Restore visual state
  opts.forEach(o => o.classList.toggle('on', o.dataset.id === S.aforo));

  if (initAforo._bound) return;
  initAforo._bound = true;

  opts.forEach(o => {
    o.addEventListener('click', () => {
      opts.forEach(x => x.classList.remove('on'));
      o.classList.add('on');
      const d = AFORO.find(a => a.id === o.dataset.id);
      if (d) {
        S.aforo = d.id;
        S.aforoLabel = d.label + ' (' + d.sub + ')';
        save(); checkAct4Ready();
      }
    });
  });
}

/* ============================================================
   ACT 5 — DURACIÓN + PRODUCCIÓN TÉCNICA
   ============================================================ */
function initAct5() {
  const durRows  = document.querySelectorAll('#dur-list .opt-row');
  const prodRows = document.querySelectorAll('#prod-list .opt-row');
  const durCustom = document.getElementById('dur-custom');
  const continueBtn = document.getElementById('act5-continue');

  // Restore state
  durRows.forEach(r => r.classList.toggle('on', r.dataset.id === S.duracion));
  prodRows.forEach(r => r.classList.toggle('on', r.dataset.id === S.produccionTecnica));
  if (S.duracion === 'otro') { durCustom.classList.add('show'); durCustom.value = S.duracionCustom || ''; }
  else { durCustom.classList.remove('show'); }

  // Map nivel legacy → duración por defecto si venía de versión previa guardada
  if (!S.duracion && S.nivel) {
    const map = { esencial:'set60', b2b:'set2x45', premium:'set3x45' };
    const d = map[S.nivel];
    if (d) {
      const r = document.querySelector(`#dur-list .opt-row[data-id="${d}"]`);
      if (r) { S.duracion = d; S.duracionLabel = r.dataset.label; r.classList.add('on'); }
    }
  }

  function checkReady() {
    const ok = !!S.duracion && !!S.produccionTecnica;
    continueBtn.classList.toggle('disabled', !ok);
    continueBtn.disabled = !ok;
  }
  checkReady();

  if (initAct5._bound) return;
  initAct5._bound = true;

  durRows.forEach(row => {
    row.addEventListener('click', () => {
      durRows.forEach(r => r.classList.remove('on'));
      row.classList.add('on');
      S.duracion = row.dataset.id;
      S.duracionLabel = row.dataset.label;
      if (S.duracion === 'otro') {
        durCustom.classList.add('show');
        setTimeout(() => durCustom.focus(), 80);
      } else {
        durCustom.classList.remove('show');
        S.duracionCustom = '';
      }
      save(); checkReady();
    });
  });

  durCustom.addEventListener('input', () => {
    S.duracionCustom = durCustom.value;
    if (durCustom.value.trim()) S.duracionLabel = 'Otra duración: ' + durCustom.value.trim();
    save();
  });

  prodRows.forEach(row => {
    row.addEventListener('click', () => {
      prodRows.forEach(r => r.classList.remove('on'));
      row.classList.add('on');
      S.produccionTecnica = row.dataset.id;
      S.produccionTecnicaLabel = row.dataset.label;
      save(); checkReady();
    });
  });

  continueBtn.onclick = () => {
    if (!S.duracion || !S.produccionTecnica) return;
    // Compatibilidad con sistema viejo: deriva un "nivel" para el envío
    const nivelDerivado = ({set40:'esencial', set60:'esencial', set2x45:'b2b', set3x45:'premium', otro:'b2b'})[S.duracion] || 'b2b';
    S.nivel = nivelDerivado;
    S.nivelLabel = ({esencial:'Esencial', b2b:'Curado', premium:'Premium'})[nivelDerivado];
    save();
    goTo(6);
  };
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
      // Envío automático de correos (cliente + copia interna)
      enviarEmailCotizacion();
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
      // → Envío automático de correos (cliente + copia interna)
      setTimeout(() => enviarEmailCotizacion(), 1100);
    }
  },1650);
}

function populatePropCard() {
  const dateStr = S.fecha
    ? new Date(S.fecha+'T00:00:00').toLocaleDateString('es-CO',{day:'numeric',month:'long',year:'numeric'})
    : 'Fecha por definir';
  const today = new Date();
  const todayStr = today.getDate()+'.'+String(today.getMonth()+1).padStart(2,'0')+'.'+today.getFullYear();

  const durStr = S.duracion==='otro' && S.duracionCustom ? S.duracionCustom : (S.duracionLabel || '—');
  const instStr = S.instrumentacionCustom ? S.instrumentacionCustom : (S.instrumentacionSugerida || 'Sugerencia del equipo');

  document.getElementById('pc-tipo').textContent     = S.tipoLabel||S.tipo;
  document.getElementById('pc-formato').textContent  = S.formatoLabel;
  document.getElementById('pc-instr').textContent    = 'Instrumentación: ' + instStr;
  document.getElementById('pc-lugar').textContent    = (S.ciudad||'Ciudad')+' · '+dateStr;
  document.getElementById('pc-aforo').textContent    = 'Aforo: ' + S.aforoLabel;
  document.getElementById('pc-duracion').textContent = 'Duración: ' + durStr;
  document.getElementById('pc-prod').textContent     = 'Producción técnica: ' + (S.produccionTecnicaLabel || '—');
  document.getElementById('pc-extras').innerHTML     = S.extrasLabels.map(e=>'<div>+ '+e+'</div>').join('');
  document.getElementById('pc-footer').textContent   = leadId+' · '+todayStr;

  document.getElementById('r-cta-wa').onclick = ()=>{
    postLead({...S, action:'whatsapp_click'});
    window.open('https://wa.me/'+WHATSAPP+'?text='+encodeURIComponent(buildWA()),'_blank');
    setTimeout(()=>goTo(8),500);
  };
  document.getElementById('r-cta-email').onclick = ()=>{
    enviarEmailCotizacion();
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
