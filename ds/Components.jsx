// =====================================================
// Músicos de Fondo — UI Kit Components
// ui_kits/propuesta-comercial/Components.jsx
// =====================================================

// ── Logo ──────────────────────────────────────────
const Logo = ({ variant = 'light', size = 'md' }) => {
  const sizes = { sm: '14px', md: '18px', lg: '26px', xl: '36px' };
  const colors = { light: '#F4F1EA', gold: '#B89947', dark: '#1A1A1A' };
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontSize: sizes[size], fontWeight: 300, letterSpacing: '0.28em',
        color: colors[variant], textTransform: 'uppercase', lineHeight: 1
      }}>Músicos de Fondo</div>
      <div style={{
        width: '100%', height: '1px',
        background: 'linear-gradient(90deg, transparent, #B89947, transparent)',
        margin: '7px 0', opacity: 0.55
      }}/>
      <div style={{
        fontFamily: "'Montserrat', sans-serif", fontSize: '7px', fontWeight: 600,
        letterSpacing: '0.3em', color: '#B0B5B9', textTransform: 'uppercase'
      }}>Diseño Sonoro · Cultural Solutions</div>
    </div>
  );
};

// ── Overline label ─────────────────────────────────
const Overline = ({ children, style = {} }) => (
  <div style={{
    fontFamily: "'Montserrat', sans-serif", fontSize: '9px', fontWeight: 600,
    letterSpacing: '0.22em', textTransform: 'uppercase', color: '#B89947',
    ...style
  }}>{children}</div>
);

// ── Section Rule ───────────────────────────────────
const Rule = ({ gold = false }) => (
  <div style={{
    height: '1px',
    background: gold
      ? 'linear-gradient(90deg, transparent, #B89947 30%, #B89947 70%, transparent)'
      : 'rgba(244,241,234,0.09)',
    margin: '0'
  }}/>
);

// ── Divider with ornament ──────────────────────────
const OrnamentDivider = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '8px 0' }}>
    <div style={{ flex: 1, height: '1px', background: 'rgba(244,241,234,0.1)' }}/>
    <span style={{
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: '16px', color: '#B89947', fontStyle: 'italic', opacity: 0.7
    }}>♩</span>
    <div style={{ flex: 1, height: '1px', background: 'rgba(244,241,234,0.1)' }}/>
  </div>
);

// ── Button ─────────────────────────────────────────
const Btn = ({ children, variant = 'primary', style = {}, onClick }) => {
  const variants = {
    primary:   { background: '#B89947', color: '#000', border: 'none' },
    secondary: { background: 'transparent', color: '#F4F1EA', border: '1px solid rgba(244,241,234,0.22)' },
    ghost:     { background: 'transparent', color: '#B89947', border: '1px solid rgba(184,153,71,0.4)' },
  };
  return (
    <button onClick={onClick} style={{
      ...variants[variant],
      fontFamily: "'Montserrat', sans-serif", fontSize: '9px', fontWeight: 600,
      letterSpacing: '0.2em', textTransform: 'uppercase', padding: '12px 28px',
      borderRadius: '2px', cursor: 'pointer', transition: 'opacity 0.3s',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
      ...style
    }}
    onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
    >{children}</button>
  );
};

// ── Badge / Tag ────────────────────────────────────
const Badge = ({ children, variant = 'gold' }) => {
  const variants = {
    gold:    { background: 'rgba(184,153,71,0.14)', color: '#B89947', border: '1px solid rgba(184,153,71,0.3)' },
    silver:  { background: 'rgba(176,181,185,0.1)', color: '#B0B5B9', border: '1px solid rgba(176,181,185,0.2)' },
    solid:   { background: '#B89947', color: '#000', border: 'none' },
  };
  return (
    <span style={{
      ...variants[variant],
      fontFamily: "'Montserrat', sans-serif", fontSize: '8px', fontWeight: 600,
      letterSpacing: '0.16em', textTransform: 'uppercase',
      padding: '3px 10px', borderRadius: '2px', display: 'inline-block'
    }}>{children}</span>
  );
};

// ── Service Card ───────────────────────────────────
const ServiceCard = ({ overline, title, body, accent = false }) => (
  <div style={{
    background: '#1A1A1A', borderRadius: '2px', padding: '24px',
    border: accent ? '1px solid rgba(184,153,71,0.25)' : '1px solid rgba(244,241,234,0.07)',
    boxShadow: '0 2px 24px rgba(0,0,0,0.5)', flex: 1
  }}>
    <Overline style={{ marginBottom: '10px' }}>{overline}</Overline>
    <div style={{
      fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', fontWeight: 400,
      color: '#F4F1EA', marginBottom: '10px', lineHeight: 1.25
    }}>{title}</div>
    <Rule gold={accent}/>
    <div style={{
      fontFamily: "'Montserrat', sans-serif", fontSize: '11px', fontWeight: 300,
      color: '#B0B5B9', lineHeight: 1.7, marginTop: '10px'
    }}>{body}</div>
  </div>
);

// ── Quote Block ────────────────────────────────────
const QuoteBlock = ({ text, attribution }) => (
  <div style={{ borderLeft: '2px solid #B89947', paddingLeft: '24px' }}>
    <div style={{
      fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 300,
      fontStyle: 'italic', color: '#F4F1EA', lineHeight: 1.45, marginBottom: '12px'
    }}>"{text}"</div>
    {attribution && (
      <div style={{
        fontFamily: "'Montserrat', sans-serif", fontSize: '9px', fontWeight: 600,
        letterSpacing: '0.18em', textTransform: 'uppercase', color: '#B89947'
      }}>{attribution}</div>
    )}
  </div>
);

// ── Section Header ─────────────────────────────────
const SectionHeader = ({ overline, title, subtitle }) => (
  <div style={{ marginBottom: '48px' }}>
    <Overline style={{ marginBottom: '16px' }}>{overline}</Overline>
    <div style={{
      fontFamily: "'Cormorant Garamond', serif", fontSize: '44px', fontWeight: 300,
      color: '#F4F1EA', lineHeight: 1.1, letterSpacing: '-0.01em', marginBottom: '16px'
    }}>{title}</div>
    {subtitle && (
      <div style={{
        fontFamily: "'Montserrat', sans-serif", fontSize: '13px', fontWeight: 300,
        color: '#B0B5B9', lineHeight: 1.7, maxWidth: '500px'
      }}>{subtitle}</div>
    )}
  </div>
);

// ── Nav ────────────────────────────────────────────
const Nav = ({ currentPage, onNavigate }) => {
  const items = [
    { id: 'cover',    label: 'Propuesta' },
    { id: 'about',    label: 'Nosotros' },
    { id: 'services', label: 'Servicios' },
    { id: 'process',  label: 'Metodología' },
    { id: 'budget',   label: 'Inversión' },
    { id: 'contact',  label: 'Contacto' },
  ];
  return (
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '20px 60px', borderBottom: '1px solid rgba(244,241,234,0.08)',
      position: 'sticky', top: 0, background: 'rgba(0,0,0,0.92)',
      backdropFilter: 'blur(12px)', zIndex: 100
    }}>
      <Logo variant="light" size="sm"/>
      <div style={{ display: 'flex', gap: '32px' }}>
        {items.map(item => (
          <button key={item.id} onClick={() => onNavigate(item.id)} style={{
            fontFamily: "'Montserrat', sans-serif", fontSize: '9px', fontWeight: 600,
            letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer',
            background: 'none', border: 'none',
            color: currentPage === item.id ? '#B89947' : 'rgba(244,241,234,0.5)',
            transition: 'color 0.3s', padding: 0
          }}
          onMouseEnter={e => { if (currentPage !== item.id) e.currentTarget.style.color = '#F4F1EA'; }}
          onMouseLeave={e => { if (currentPage !== item.id) e.currentTarget.style.color = 'rgba(244,241,234,0.5)'; }}
          >{item.label}</button>
        ))}
      </div>
    </nav>
  );
};

// ── Metric / Stat ──────────────────────────────────
const Metric = ({ value, label }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{
      fontFamily: "'Cormorant Garamond', serif", fontSize: '48px', fontWeight: 300,
      color: '#B89947', lineHeight: 1, marginBottom: '8px'
    }}>{value}</div>
    <div style={{
      fontFamily: "'Montserrat', sans-serif", fontSize: '9px', fontWeight: 600,
      letterSpacing: '0.18em', textTransform: 'uppercase', color: '#B0B5B9'
    }}>{label}</div>
  </div>
);

// ── Line Item ──────────────────────────────────────
const LineItem = ({ name, detail, price, highlight = false }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: '16px 0', borderBottom: '1px solid rgba(244,241,234,0.08)'
  }}>
    <div>
      <div style={{
        fontFamily: "'Montserrat', sans-serif", fontSize: '12px', fontWeight: highlight ? 500 : 300,
        color: highlight ? '#F4F1EA' : '#C8C4BB', marginBottom: '3px'
      }}>{name}</div>
      {detail && (
        <div style={{
          fontFamily: "'Montserrat', sans-serif", fontSize: '10px', fontWeight: 300, color: '#7A7F83'
        }}>{detail}</div>
      )}
    </div>
    <div style={{
      fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', fontWeight: 400,
      color: highlight ? '#B89947' : '#F4F1EA', letterSpacing: '0.02em', flexShrink: 0, marginLeft: '24px'
    }}>{price}</div>
  </div>
);

Object.assign(window, {
  Logo, Overline, Rule, OrnamentDivider, Btn, Badge,
  ServiceCard, QuoteBlock, SectionHeader, Nav, Metric, LineItem
});
