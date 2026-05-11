# PROMPT ONE-SHOT — LANDING PAGE MÚSICOS DE FONDO

> **Cómo usarlo:** Pega este prompt completo en Claude (con todos los assets adjuntos: el `.md` del masterdata, el `.html` de Auros, el `.html` actual del sitio, el `.md` de la guía clon Auros, los dos SVG y todas las fotografías). El prompt está pensado para producir una landing page completa en un solo turno, sin pings de aclaración.

---

## ROL

Eres **diseñador front-end senior y director de arte digital**. Tu especialidad es traducir marcas de lujo y boutique al lenguaje web sin caer en clichés genéricos. Trabajas con la sensibilidad de un estudio que mezcla **Apollo.io / Auros / Linear / Vercel** en lo estructural y **Aesop / Le Labo / Boutique Hotel branding** en lo emocional.

## OBJETIVO

Construir la **landing page completa de Músicos de Fondo** — boutique de diseño sonoro B2B con base en Medellín — fusionando:

1. La **arquitectura, animaciones y sensación de scroll** del sitio de **Auros.global** (referencia adjunta `Auros___Making_Digital_Markets_Liquid.html`).
2. La **identidad de marca, paleta, tipografía y voz** de Músicos de Fondo (definida en `MASTERDATA_MusicosDeFondo_v1_3_FINAL2.md`).
3. La **estructura de contenido y secciones** validada en el sitio actual (`index.html`), que ya está bien — solo le falta la capa de animación, fotografía y profundidad visual.

El resultado NO es un clon visual de Auros (Auros es verde fintech, MdF es negro/dorado/cinematográfico). Es **clonar la sensación**: scroll suave premium, reveal animations escalonados, bento grids con glassmorphism sutil, cards con hover orgánico, micro-interacciones que respiran lujo.

---

## DELIVERABLE

Un único archivo HTML autocontenido (`index.html`) con CSS y JS inline, listo para abrir en navegador. Sin dependencias externas excepto:
- Google Fonts: **Cormorant Garamond** (300/400/500/600, regular + italic) y **Montserrat** (300/400/500/600).
- **Lenis** vía CDN para smooth scroll (`https://unpkg.com/lenis@1.1.13/dist/lenis.min.js`).
- **GSAP + ScrollTrigger** vía CDN para reveals y parallax (`https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js` y `ScrollTrigger.min.js`).

Las imágenes y los dos SVG se referencian con rutas relativas exactamente como se llaman los archivos adjuntos. No inventes nombres de archivo.

---

## ASSETS DISPONIBLES (úsalos todos, no inventes otros)

### Logos (SVG)
- `logomusicosdefondo.svg` — lockup completo (símbolo + nombre). Úsalo en la **navbar** y en el **footer**.
- `isotipomusicosdefondo.svg` — solo símbolo. Úsalo como **watermark/sello** en zonas decorativas y en el **loader** si lo añades.

> Los SVG vienen con `fill="#000000"` por defecto. Como el sitio es Dark Mode, **debes invertirlos a color crema** (`#F2EDE4`) vía CSS `filter: invert(...)` o reemplazando el fill inline. Al hacer hover sobre el logo de la navbar, debe transicionar suavemente al **bronce dorado** (`#C9A84C`).

### Fotografías (todas son del banco real de la marca, ya editadas con la dirección de arte oficial: alto contraste, luces direccionales, jazz club mood)

**Close-ups artísticos (formato vertical, ratio ~9:16) — usar en hero hover, cards individuales y galería:**
- `trumpetcloseup.jpg` — trompetista con bandana roja, luz cálida cinematográfica
- `trumpetcloseup1.jpg` — variante de trompetista
- `singercloseup.jpg` — vocalista con luz azul jazz club, perfil
- `saxophonecloseup.jpg` — saxofonista con luz magenta/cian, retrato dramático
- `pianistcloseup.jpg` — tecladista con luz bicolor (azul/rojo), close-up de manos en teclado

**Performances y atmósferas (formato horizontal, ratio ~16:9) — usar en bento grid de servicios y secciones full-bleed:**
- `bandperformancejazzclub.jpg` — escenario "New York" con luces azules y rojas, bar lounge nocturno
- `bandperformance.jpg` — banda completa al aire libre, frontman de espaldas con camisa estampada (público al fondo)
- `bandperformance1.jpg` — banda en gala formal con columnas blancas y luces escenográficas premium
- `studio.jpg` — manos sobre teclado Yamaha vintage / Wurlitzer (estilo estudio de grabación)
- `cineconciertos.jpg` — banda en escenario con proyección de animación al fondo (perfecto para sección Cine-Conciertos)

### Mapeo recomendado imagen → sección
| Sección | Imagen sugerida | Por qué |
|---|---|---|
| Hero (background o lateral) | `bandperformancejazzclub.jpg` | Define la atmósfera "boutique sonora" desde el primer frame |
| Manifiesto / Promesa | `studio.jpg` (horizontal split) | Manos en teclado = artesanía, oficio |
| Servicio · Experiencia 360° HORECA | `singercloseup.jpg` | Intimidad fine dining |
| Servicio · Cine-Conciertos | `cineconciertos.jpg` | Imagen literal del producto |
| Servicio · NaviJazz / Big Band | `bandperformance1.jpg` | Producción premium con escala |
| Servicio · Música Itinerante | `bandperformance.jpg` | Espacio público, multitud |
| Servicio · Pulso Corporativo / Talleres | `pianistcloseup.jpg` | Foco en el instrumento, tono interno |
| Servicio · Páginas Sonoras / Bodas | `trumpetcloseup.jpg` o `saxophonecloseup.jpg` | Drama, narrativa, individualidad |
| Galería / Strip horizontal | mezclar todas las verticales en marquee | Showcase visual del banco |

---

## SISTEMA DE DISEÑO (NO NEGOCIABLE)

### Paleta cromática — extraída del Brand Kit oficial
```css
:root {
  --ink:      #0A0907;   /* fondo absoluto, casi negro con calidez */
  --ink-card: #12100D;   /* cards, ligeramente elevado */
  --cream:    #F2EDE4;   /* títulos y textos principales (Pergamino) */
  --silver:   #B0B5B9;   /* secundario / iconografía */
  --gold:     #C9A84C;   /* acento, italics, divisores, números */
  --gold-dim: rgba(201, 168, 76, 0.14);
  --gold-glow: rgba(201, 168, 76, 0.06);
  --muted:    rgba(242, 237, 228, 0.5);
  --border:   rgba(201, 168, 76, 0.12);
}
```

**Regla de oro:** el Dark Mode es innegociable. Nunca uses fondos blancos puros, nunca colores saturados (rojos vibrantes, azules eléctricos, etc.). Las únicas chispas de color provienen de las propias fotografías.

### Tipografía
- `Cormorant Garamond` para titulares, eyebrows decorativos, citas y palabras en *italic dorado*.
- `Montserrat` (peso 300–500) para body copy, microcopy, labels técnicos y nav.
- Para microlabels (tipo "01 / SERVICIOS" en monospace), también puedes usar `Inconsolata` que ya está en el sitio actual.

Escala (modular):
```
hero: clamp(64px, 11vw, 140px)   — Cormorant 300
h2:   clamp(40px, 6vw, 80px)     — Cormorant 300
h3:   clamp(22px, 2.5vw, 32px)   — Cormorant 400
lead: clamp(17px, 1.6vw, 21px)   — Cormorant italic 300
body: 15-16px                    — Montserrat 300
micro: 10-11px                   — Montserrat / Inconsolata, letter-spacing 0.22em, uppercase
```

Detalle clave: **palabras clave en italic + dorado** dentro de los titulares. Es la firma tipográfica del sitio actual y debe mantenerse. Ej: `Diseñamos <em>atmósferas.</em>`

### Espaciado y layout
- Max-width del contenido: `1200px`.
- Padding lateral: `40px` desktop, `24px` mobile.
- Espacio entre secciones (vertical): `120-160px` desktop.
- Las secciones se separan con `<hr>` en `--gold-dim`, no con cambios de fondo.

### Tratamiento de imágenes
- Todas las imágenes van dentro de contenedores con `border-radius: 20-28px` y `overflow: hidden`.
- Filter de base sutil: `filter: brightness(0.92) contrast(1.05) saturate(0.95);`
- En hover (cards): `scale(1.04)` + `brightness(1)` con transition de `700ms cubic-bezier(0.22, 1, 0.36, 1)`.
- Border de las imágenes: `0.5px solid var(--border)`.
- Considera un **grain overlay** sutil global (igual que el sitio actual ya tiene, vía SVG fractalNoise inline) — es lo que le da textura cinematográfica.

---

## ANIMACIONES Y SCROLL (esto es lo que se hereda de Auros)

### 1. Smooth Scroll con Lenis
Inicializa Lenis con `duration: 1.2` y easing exponencial. Todo el scroll del sitio debe sentirse **denso, premium, ligeramente pesado** — no liviano ni saltarín.

### 2. Reveals on scroll (GSAP ScrollTrigger)
Cada bloque (titular, párrafo, card, imagen) entra con:
- `opacity: 0 → 1`
- `y: 40px → 0`
- `duration: 1s`
- `ease: "power3.out"`
- `stagger: 0.08-0.12s` cuando hay varios elementos consecutivos
- Trigger: cuando el elemento está al `85%` del viewport

### 3. Parallax sutil en imágenes hero/full-bleed
Las imágenes grandes (hero, separadores full-bleed) hacen parallax de **20-30% de su altura** con ScrollTrigger. Nada exagerado.

### 4. Hero con animación inicial escalonada
Al cargar el sitio (sin scroll):
- Eyebrow → 0.3s delay
- Título línea 1 → 0.5s
- Título línea 2 (italic dorado) → 0.7s
- Subtítulo → 0.9s
- Línea decorativa vertical → 1.1s

### 5. Hover de cards (estilo Auros bento)
- Lift sutil: `translateY(-4px)`
- Borde se intensifica: `border-color: rgba(201, 168, 76, 0.3)`
- Background interno glow: aparece un radial-gradient dorado en una esquina con `opacity: 0 → 0.5`
- Imagen interna: `scale(1.04)` + `brightness(1)`
- La flecha "→" aparece con `opacity: 0 → 1` y `translateX(4px)`
- Todo en `transition: 600ms cubic-bezier(0.22, 1, 0.36, 1)`

### 6. Marquee horizontal (galería de fotos)
Una sección con tira infinita de las 5 fotos verticales (close-ups) corriendo lentamente de derecha a izquierda. Velocidad: ~40s loop completo. Pausa al hacer hover.

### 7. Cursor follower (opcional pero recomendado)
Un círculo pequeño dorado (`12px`, `border: 1px solid var(--gold)`, `mix-blend-mode: difference`) que sigue al cursor con `lerp` suave. Crece a `60px` con `background: var(--gold)` cuando se hace hover sobre links/botones/cards.

---

## ESTRUCTURA DE LA LANDING (orden y contenido obligatorio)

> Toma el contenido textual del sitio actual (`index.html`) como **fuente de verdad**, y enriquece donde el masterdata aporte más profundidad. NO inventes claims, precios, ni clientes.

### `<nav>` — Navbar fija
- Izquierda: `logomusicosdefondo.svg` (altura ~32px, color crema, hover dorado).
- Centro: links → `Manifiesto · Servicios · Formatos · Trayectoria · Contacto`.
- Derecha: botón pill `Solicitar propuesta` con borde dorado y fondo transparente. Hover: fill dorado, texto negro.
- Background: `rgba(10, 9, 7, 0.7)` con `backdrop-filter: blur(16px)`.
- Border-bottom: `0.5px solid var(--border)`.
- Al scrollear hacia abajo: la navbar reduce su padding vertical (de 24px a 14px) suavemente.

### `<section>` HERO — pantalla completa
- **Eyebrow** (mono, dorado): `BOUTIQUE DE DISEÑO SONORO · MEDELLÍN`
- **Título** (Cormorant 300, clamp 64-140px, dos líneas):
  > El lenguaje sonoro<br>de tu *marca*.
- **Subtítulo** (italic, color muted, max-width 600px):
  > Traducimos la identidad de marcas, espacios y momentos al lenguaje de la música en vivo. Operación llave en mano. ROI demostrable.
- **Doble CTA**: `Ver servicios →` (link dorado underline) y `Solicitar propuesta` (botón pill).
- **Imagen lateral o background**: `bandperformancejazzclub.jpg` con overlay degradado oscuro (`linear-gradient(to right, var(--ink) 0%, transparent 50%, rgba(10,9,7,0.8) 100%)`) para garantizar legibilidad del texto.
- **Línea vertical** decorativa abajo del título (1px ancho, 60px alto, gradiente dorado → transparente) como pista visual de "scroll".
- **Aura de fondo**: `radial-gradient(ellipse 60% 50% at 50% 60%, var(--gold-glow), transparent 70%)`.

### `<section>` MANIFIESTO — La promesa
- Eyebrow: `LA PROMESA`
- Título: `No amenizamos.<br>Diseñamos *atmósferas.*`
- Lead: copy del masterdata (sección 1, descripción corta) + frase de "Bespoke Soundtrack".
- **Bento de 3 celdas** con números 01/02/03:
  1. **Partner, no proveedor** — copy de la tabla "El Cambio de Paradigma" (sección 7).
  2. **Cero fricción** — operación llave en mano, rider técnico estandarizado.
  3. **ROI medible** — ticket promedio, permanencia, días valle → eventos de destino.
- Cada celda con borde de 0.5px dorado dim, padding 40px, hover suave de glow.

### `<section>` SERVICIOS — bento grid de 7 productos
- Eyebrow: `ECOSISTEMA DE SERVICIOS`
- Título: `Siete maneras<br>de transformar *tu espacio.*`
- Lead corto.
- **Layout: bento grid asimétrico** (no las celdas iguales del sitio actual). Mezcla cards grandes 2x2 con cards 1x1 y una horizontal 2x1. Inspírate en el bento de Auros pero con fotos reales. Cada card incluye:
  - Número (01–07) en mono dorado, esquina superior izquierda
  - Foto (de las indicadas en el mapeo arriba), `border-radius: 20px`, ratio variable según celda
  - Nombre del servicio (Cormorant, palabra clave en italic dorado)
  - Tag de buyer persona (`HORECA · Hoteles`, etc.)
  - Mini descripción (15-20 palabras max, del masterdata)
  - Flecha `→` que aparece on hover

Los 7 productos a mostrar (en este orden, todos están en el masterdata):
1. **Experiencia 360°** (HORECA — Restaurantes y Hoteles) — `singercloseup.jpg`
2. **Cine-Conciertos** (Cultura · Teatros) — `cineconciertos.jpg` (card grande, destacada)
3. **NaviJazz** (Temporada · Fin de año · Retail) — `bandperformance1.jpg`
4. **Música Itinerante** (Centros Comerciales · Activaciones de marca) — `bandperformance.jpg`
5. **Bodas Simbólicas** (Wedding Planners ultra-premium) — `trumpetcloseup.jpg`
6. **Pulso Corporativo** (RRHH · Bienestar) — `pianistcloseup.jpg`
7. **Páginas Sonoras** (Literatura · Librerías) — `saxophonecloseup.jpg`

> Nota: las cards se pueden expandir on-click (acordeón) o llevar a `#`. Implementa expansión inline tipo el sitio actual, pero con animación más fluida (`max-height` con cubic-bezier).

### `<section>` GALERÍA — Marquee horizontal
- Eyebrow: `EL ENSAMBLE`
- Título corto: `Música en vivo,<br>*sin sustitutos.*`
- **Tira de marquee infinita** con las 5 fotos verticales (close-ups) corriendo de derecha a izquierda. Imágenes de altura 420px, gap 16px, todas con border-radius 20px.
- Pausa al hover sobre cualquier imagen.
- Esta sección no tiene mucho copy — es 100% atmósfera visual.

### `<section>` FORMATOS — Tabla de line-ups
- Eyebrow: `FORMATOS`
- Título: `Desde dúo íntimo<br>hasta *small big band.*`
- Grid de 5 columnas (responsive a 2 col mobile): Dúo · Trío · Cuarteto ⭐ · Quinteto+ · Septeto.
- Cada celda: nombre (Cormorant italic), número de músicos (mono dorado), descripción corta (extraída del masterdata sección 9.1).
- Marca el Cuarteto como **best-seller** con un sello dorado pequeño.

### `<section>` MANIFIESTO PARTNER — ROI
- Eyebrow: `POR QUÉ NOSOTROS`
- Título: `No cobramos por hora.<br>Diseñamos *rentabilidad.*`
- **6 value props en bento grid 3x2** (los del sitio actual están bien, mantén ese contenido):
  - Aumentamos la permanencia
  - Justificamos precios premium
  - Días valle → eventos de destino
  - Activos digitales incluidos (2 Reels + 20 fotos)
  - 10 años de operación B2B
  - Producción llave en mano

### `<section>` TRAYECTORIA — Línea de tiempo
- Eyebrow: `TRAYECTORIA`
- Título: `Una década curando<br>la *escena.*`
- **Timeline horizontal o vertical minimalista** con los hitos del masterdata sección 10:
  - 2017 — Nace como banda residente de Victoria Regia
  - 2017–2019 — Eventos privados, bodas, corporativos
  - 2021 — Z Bar / Hotel Marquee — banda residente
  - 2024 — Cine-Conciertos, NaviJazz validados
  - Hoy — Operación nacional, unidad de negocio de Falso Ídolo
- Cada punto con un círculo dorado pequeño y línea conectora.

### `<section>` CLIENTES — Confianza
- Eyebrow: `CONFIANZA`
- Título: `Han confiado<br>en *nosotros.*`
- Wall de tags (igual al sitio actual, mantén la lista):
  Z Bar Jazz Club · Hotel Marquee · Hotel Intercontinental · Victoria Regia · Alambique · Finca la Comadreja · Elemental Marinilla · Grupo Carmen · Casa El Ramal · CC El Tesoro · CC Oviedo · Inexmoda · Colombo Americano · Comfenalco Antioquia · Comfama · Librería Lerner · Bellas Artes Medellín
- Tags con borde 0.5px dim, hover sube intensidad de borde y color del texto.

### `<section>` CTA FINAL — Contacto
- Background con `studio.jpg` full-bleed, opacity 0.3, overlay de gradiente oscuro.
- Título gigante (Cormorant italic, clamp 60-110px): `¿Cuál es tu<br>próximo *evento?*`
- Botón principal: `Solicitar propuesta` (dorado, padding 16px 36px, mono uppercase letter-spacing 0.16em).
- Links secundarios: WhatsApp Marlon (+57 300 303 3436) · Email (musicosdefondo@gmail.com) · Instagram (@musicosdefondo).

### `<footer>`
- Border-top dorado dim.
- Izquierda: `Músicos de Fondo — Boutique de Diseño Sonoro · Medellín, Colombia`
- Centro: pequeño isotipo (`isotipomusicosdefondo.svg`, 24px alto, color dorado dim).
- Derecha: `UN PROYECTO DE FALSO ÍDOLO` (mono, dorado, uppercase, letter-spacing 0.18em).
- Copyright año actual.

---

## VOZ Y MICROCOPY

- Tono: **sofisticado, directo, ligeramente cinematográfico, jamás cursi**. La marca es "El Sabio Creador".
- Trata al lector de **tú**, no de "usted" (el sitio actual usa "usted" — cámbialo a "tú" para acercar la marca al lenguaje contemporáneo del lujo boutique sin perder formalidad).
- Cero exclamaciones. Cero "¡Increíble!". Cero corporate-speak ("sinergias", "soluciones integrales").
- Todas las palabras clave en titulares van en *italic dorado* (mantén la firma tipográfica del sitio actual).
- Microlabels en monospace, uppercase, letter-spacing wide.

---

## RESPONSIVE

- Breakpoint principal: `1024px` (desktop), `768px` (tablet), `480px` (mobile).
- En mobile:
  - Hero título reduce a `clamp(48px, 12vw, 72px)`.
  - Bento grid de servicios se vuelve 1 columna full-width.
  - Marquee se mantiene pero con imágenes a 280px altura.
  - Nav colapsa a hamburger (drawer lateral derecho con backdrop blur).

---

## CHECKLIST DE CALIDAD ANTES DE ENTREGAR

- [ ] Smooth scroll Lenis funcionando sin saltos
- [ ] GSAP ScrollTrigger reveals con stagger correcto en cada sección
- [ ] Logos SVG cargados y con el color invertido a crema
- [ ] Las 10 imágenes referenciadas correctamente con sus nombres exactos
- [ ] Paleta exclusivamente: ink, cream, gold, silver, muted (sin azules, verdes, rojos saturados)
- [ ] Cormorant Garamond + Montserrat cargadas desde Google Fonts
- [ ] Italics dorados en titulares clave (`<em>` styled)
- [ ] Hover states en todas las cards, links, botones y nav items
- [ ] Marquee de galería corre y pausa al hover
- [ ] Bento de servicios asimétrico (no cuadrícula uniforme)
- [ ] Acordeón de servicios funcional con animación suave
- [ ] Cursor follower (si lo implementas) no rompe en mobile
- [ ] Footer con isotipo y crédito a Falso Ídolo
- [ ] Cero IVA, cero precios, cero estructura interna del JV en el sitio
- [ ] Cero referencias a "amenización", "hora loca" o repertorio comercial
- [ ] Todo el contenido en español (excepto nombres propios como "Live Scoring", "Bespoke Soundtrack" que son términos de la marca)
- [ ] Grain overlay sutil global activado (textura cinematográfica)
- [ ] Validar que el sitio se vea bien al abrir directamente el HTML local

---

## REGLAS DE LO QUE **NO** DEBES HACER

- **NO** uses paleta de Auros (verde fintech, gradientes pastel, etc.). Esa referencia es solo de comportamiento de scroll y arquitectura.
- **NO** inventes nuevos servicios, clientes, precios, testimonios o cifras. Todo viene del masterdata.
- **NO** crees el logo desde cero con tipografía genérica. Usa el SVG.
- **NO** uses imágenes de stock genéricas. Solo las 10 fotografías adjuntas.
- **NO** uses íconos de Material Design o Font Awesome. Si necesitas íconos (flechas, +, →), dibújalos como SVG inline o caracteres tipográficos (`→`, `+`, `↗`).
- **NO** pongas el sitio en modo claro. Dark mode siempre.
- **NO** hagas placeholders del tipo "Lorem ipsum" o "Tu título aquí". Todo el copy debe ser real, extraído del masterdata o del sitio actual.

---

## ENTREGA FINAL

Un único archivo `index.html` autocontenido. Si lo prefieres por claridad, puedes separar `style.css` y `script.js` — pero el comportamiento esperado es **todo embebido en un HTML** para que sea drag-and-drop al servidor.

Antes de generar el código, dame un resumen de **30 segundos** explicando:
1. Cómo vas a estructurar el bento de servicios (qué celdas grandes vs pequeñas).
2. Qué imagen específica usarás en el hero.
3. Si vas a implementar el cursor follower o no, y por qué.

Luego entrega el código completo.
