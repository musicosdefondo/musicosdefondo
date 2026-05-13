/**
 * ════════════════════════════════════════════════════════════
 *  COTIZADOR MÚSICOS DE FONDO — Backend (Google Apps Script)
 * ════════════════════════════════════════════════════════════
 *  Recibe POST con el JSON del cotizador y lo escribe como
 *  una nueva fila en la Google Sheet vinculada a este script.
 *
 *  ▸ Crea la hoja "Cotizaciones" automáticamente si no existe.
 *  ▸ Crea los encabezados en orden fijo (ver HEADERS abajo).
 *  ▸ Devuelve JSON { ok: true|false, lead_id, error? }.
 *  ▸ CORS: Apps Script Web App publicado como "Cualquiera"
 *    permite peticiones desde GitHub Pages. El cliente envía
 *    con Content-Type: text/plain;charset=utf-8 para evitar
 *    preflight OPTIONS (que Apps Script no maneja).
 *
 *  Instala según el README.md de este repositorio.
 * ════════════════════════════════════════════════════════════
 */

// ─── CONFIGURACIÓN ─────────────────────────────────────────
const SHEET_NAME = 'Cotizaciones';

// Orden EXACTO de columnas. Agrega/quita campos aquí si
// luego amplías el cotizador — la primera columna siempre
// es el timestamp del servidor.
const HEADERS = [
  'timestamp_servidor',
  'timestamp_cliente',
  'fecha_envio_local',
  'lead_id',
  'stage',

  // Contacto
  'email',
  'fuente',
  'nombre',
  'empresa',
  'whatsapp',
  'rol',

  // Tipo y ensamble
  'tipo',
  'tipo_label',
  'formato',
  'formato_label',

  // Lugar y momento
  'ciudad',
  'fecha_evento',
  'aforo',
  'aforo_label',
  'urgencia',
  'fuera_medellin',

  // Nivel y extras
  'nivel',
  'nivel_label',
  'extras',
  'extras_labels',

  // Cotización resultante
  'rango_min',
  'rango_max',
  'rango_display',
  'es_superproduccion',

  // Meta y tracking
  'duracion_sesion_seg',
  'accion',
  'referrer',
  'url',
  'user_agent'
];

// ─── ENTRY POINT POST ──────────────────────────────────────
function doPost(e) {
  try {
    // Body llega como texto plano (ver cliente). Parseamos JSON.
    const raw = (e && e.postData && e.postData.contents) || '{}';
    const data = JSON.parse(raw);

    const sheet = _getOrCreateSheet_();
    const row = HEADERS.map(function (key) {
      if (key === 'timestamp_servidor') return new Date();
      var v = data[key];
      return (v === undefined || v === null) ? '' : v;
    });

    sheet.appendRow(row);

    return _json_({
      ok: true,
      lead_id: data.lead_id || null,
      stage: data.stage || null,
      row: sheet.getLastRow()
    });

  } catch (err) {
    return _json_({
      ok: false,
      error: String(err && err.message || err)
    });
  }
}

// ─── ENTRY POINT GET (health check) ────────────────────────
// Abre la URL del Web App en el navegador para verificar
// que está activo: debe devolver un JSON con status:"ok".
function doGet(e) {
  return _json_({
    ok: true,
    status: 'Cotizador endpoint activo',
    sheet: SHEET_NAME,
    timestamp: new Date().toISOString()
  });
}

// ─── HELPERS ───────────────────────────────────────────────
function _getOrCreateSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  // Si la hoja está vacía o tiene headers desalineados, los escribe.
  const firstRow = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  const needsHeaders = firstRow.every(function (c) { return c === '' || c === null; });

  if (needsHeaders) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.getRange(1, 1, 1, HEADERS.length)
      .setFontWeight('bold')
      .setBackground('#0A0907')
      .setFontColor('#C9A84C')
      .setHorizontalAlignment('left');
    sheet.setFrozenRows(1);
    // Anchura razonable de la primera columna (timestamp).
    sheet.setColumnWidth(1, 160);
  }

  return sheet;
}

function _json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─── UTILIDAD: prueba manual ───────────────────────────────
// Ejecuta esta función UNA VEZ desde el editor de Apps Script
// (Ejecutar ▸ test_) para autorizar el script y verificar que
// escribe correctamente en la Sheet. Verás una fila de prueba.
function test_() {
  const fakeEvent = {
    postData: {
      contents: JSON.stringify({
        lead_id: 'N° TEST',
        stage: 'prueba_manual',
        email: 'test@musicosdefondo.com',
        nombre: 'Test Marlon',
        empresa: 'Músicos de Fondo',
        whatsapp: '+57 300 000 0000',
        tipo: 'horeca',
        tipo_label: 'Experiencia 360° HORECA',
        formato: 'cuarteto',
        formato_label: 'Cuarteto · 4 músicos',
        ciudad: 'Medellín',
        fecha_evento: '2026-06-15',
        aforo: 'mediano',
        aforo_label: 'Mediano (30–100)',
        nivel: 'b2b',
        nivel_label: 'Curado',
        extras: 'repertorio_custom',
        extras_labels: 'Repertorio bespoke',
        rango_min: 8500000,
        rango_max: 11000000,
        rango_display: '$8.500.000 – $11.000.000 COP'
      })
    }
  };
  const out = doPost(fakeEvent);
  Logger.log(out.getContent());
}
