import { useRef } from "react";

/* ───────── palette & tokens ───────── */
export const C = {
  parchment: "#F5EDD6",
  parchmentDark: "#EDE2C4",
  cream: "#FBF7EC",
  forest: "#2D5F3B",
  forestLight: "#3A7A4E",
  forestPale: "#E8F0E4",
  terracotta: "#C0623A",
  terracottaLight: "#D4845F",
  rust: "#A0452A",
  brown: "#5C3D2E",
  brownLight: "#7A5A48",
  gold: "#C6A44E",
  goldLight: "#DBBF6E",
  sage: "#8BA888",
  sagePale: "#C5D8BE",
  ink: "#2C2418",
  inkLight: "#5A4E3C",
  warmWhite: "#FFFDF5",
};

/* ───────── SVG filter for hand-drawn edges ───────── */
export const SketchFilter = () => (
  <svg style={{ position: "absolute", width: 0, height: 0 }}>
    <defs>
      <filter id="sketchy">
        <feTurbulence type="turbulence" baseFrequency="0.03" numOctaves="4" result="noise" seed="2" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5" />
      </filter>
      <filter id="sketchyStrong">
        <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="3" result="noise" seed="5" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" />
      </filter>
      <filter id="pencil">
        <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3" result="noise" />
        <feComposite in="SourceGraphic" in2="noise" operator="in" />
      </filter>
      <filter id="paperTexture">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="5" stitchTiles="stitch" result="noise" />
        <feDiffuseLighting in="noise" lightingColor={C.warmWhite} surfaceScale="1.5" result="lit">
          <feDistantLight azimuth="45" elevation="55" />
        </feDiffuseLighting>
        <feComposite in="SourceGraphic" in2="lit" operator="arithmetic" k1="1" k2="0" k3="0" k4="0" />
      </filter>
    </defs>
  </svg>
);

/* ───────── hand-drawn box component ───────── */
export const HandDrawnBox = ({ children, style = {}, color = C.brown, fill = "transparent", strokeWidth = 2, className = "" }) => {
  return (
    <div style={{ position: "relative", ...style }} className={className}>
      <svg
        style={{ position: "absolute", inset: -4, width: "calc(100% + 8px)", height: "calc(100% + 8px)", pointerEvents: "none", filter: "url(#sketchy)" }}
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <rect x="2" y="2" width="96" height="96" rx="3" ry="3" fill={fill} stroke={color} strokeWidth={strokeWidth} vectorEffect="non-scaling-stroke" />
      </svg>
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
};

/* ───────── decorative divider ───────── */
export const CraftDivider = ({ color = C.gold }) => (
  <svg viewBox="0 0 400 30" style={{ width: "min(280px, 60%)", height: 30, display: "block", margin: "0 auto", filter: "url(#sketchy)" }}>
    <path d="M20,15 Q100,5 200,15 Q300,25 380,15" fill="none" stroke={color} strokeWidth="1.5" />
    <circle cx="200" cy="15" r="4" fill={color} />
    <path d="M185,15 L200,6 L215,15 L200,24 Z" fill="none" stroke={color} strokeWidth="1" />
    <circle cx="30" cy="15" r="2" fill={color} />
    <circle cx="370" cy="15" r="2" fill={color} />
  </svg>
);

/* ───────── nav icons (hand-drawn style) ───────── */
export const NavIcons = {
  home: (
    <svg viewBox="0 0 32 32" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{filter:"url(#sketchy)"}}>
      <path d="M5 17L16 6L27 17" /><path d="M8 15V26H13V20H19V26H24V15" />
    </svg>
  ),
  pin: (
    <svg viewBox="0 0 32 32" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{filter:"url(#sketchy)"}}>
      <circle cx="16" cy="12" r="6" /><path d="M16 18V28" /><path d="M12 28H20" />
    </svg>
  ),
  leaf: (
    <svg viewBox="0 0 32 32" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{filter:"url(#sketchy)"}}>
      <path d="M6 26C6 26 8 8 26 6C26 6 24 24 6 26Z" /><path d="M6 26C12 20 18 14 26 6" />
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 32 32" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{filter:"url(#sketchy)"}}>
      <rect x="4" y="6" width="24" height="22" rx="2" /><path d="M4 13H28" /><path d="M10 3V8" /><path d="M22 3V8" />
      <circle cx="11" cy="19" r="1.5" fill="currentColor" /><circle cx="16" cy="19" r="1.5" fill="currentColor" /><circle cx="21" cy="19" r="1.5" fill="currentColor" />
    </svg>
  ),
  lock: (
    <svg viewBox="0 0 32 32" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{filter:"url(#sketchy)"}}>
      <rect x="7" y="14" width="18" height="14" rx="2" /><path d="M10 14V10C10 6.7 12.7 4 16 4C19.3 4 22 6.7 22 10V14" /><circle cx="16" cy="21" r="2" fill="currentColor" />
    </svg>
  ),
  forum: (
    <svg viewBox="0 0 32 32" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{filter:"url(#sketchy)"}}>
      <path d="M4 6H28V22H18L12 28V22H4Z" />
      <path d="M10 12H22" /><path d="M10 16H18" />
    </svg>
  ),
  groups: (
    <svg viewBox="0 0 32 32" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{filter:"url(#sketchy)"}}>
      <circle cx="12" cy="10" r="4" /><circle cx="22" cy="12" r="3" />
      <path d="M4 26C4 20 8 17 12 17C16 17 20 20 20 26" />
      <path d="M20 26C20 21.5 22 19 25 19C27.5 19 29 21 29 24" />
    </svg>
  ),
  account: (
    <svg viewBox="0 0 32 32" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{filter:"url(#sketchy)"}}>
      <circle cx="16" cy="11" r="5" />
      <path d="M6 28C6 21 10 18 16 18C22 18 26 21 26 28" />
    </svg>
  ),
};

/* ───────── pin note component ───────── */
const PIN_COLORS = ["#FFEAA7", "#DCEDC8", "#F8D7DA", "#D4E6F1", "#FDEBD0", "#E8DAEF", "#F5CBA7", "#D5F5E3"];
const PIN_TACKS = [C.terracotta, C.forest, C.gold, C.rust, C.brownLight];

export const PinNote = ({ note, style = {} }) => {
  const rot = useRef((Math.random() - 0.5) * 8);
  const bg = useRef(PIN_COLORS[Math.floor(Math.random() * PIN_COLORS.length)]);
  const tack = useRef(PIN_TACKS[Math.floor(Math.random() * PIN_TACKS.length)]);

  return (
    <div
      style={{
        width: 170, minHeight: 110, padding: "22px 14px 14px", position: "relative",
        background: bg.current, transform: `rotate(${rot.current}deg)`,
        boxShadow: "2px 3px 8px rgba(44,36,24,0.15)", fontFamily: "'Caveat', cursive",
        fontSize: 16, color: C.ink, lineHeight: 1.4, cursor: "default",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        borderRadius: "2px",
        ...style,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = `rotate(${rot.current}deg) scale(1.05)`; e.currentTarget.style.zIndex = 10; e.currentTarget.style.boxShadow = "4px 6px 16px rgba(44,36,24,0.25)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = `rotate(${rot.current}deg) scale(1)`; e.currentTarget.style.zIndex = 1; e.currentTarget.style.boxShadow = "2px 3px 8px rgba(44,36,24,0.15)"; }}
    >
      {/* tack */}
      <div style={{ position: "absolute", top: -6, left: "50%", marginLeft: -7, width: 14, height: 14, borderRadius: "50%", background: tack.current, boxShadow: `0 2px 4px rgba(0,0,0,0.3), inset 0 -2px 3px rgba(0,0,0,0.2)`, zIndex: 2 }} />
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, color: C.inkLight }}>{note.author || note.authorName}</div>
      <div>{note.text}</div>
      {note.date && <div style={{ fontSize: 12, color: C.brownLight, marginTop: 6, textAlign: "right" }}>{note.date}</div>}
    </div>
  );
};

/* ───────── calendar event component ───────── */
export const CalendarEvent = ({ event }) => (
  <div style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "14px 0", borderBottom: `1px dashed ${C.goldLight}` }}>
    <div style={{
      minWidth: 54, height: 58, background: C.forest, borderRadius: 4, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", color: C.warmWhite, fontFamily: "'Playfair Display', serif",
      filter: "url(#sketchy)",
    }}>
      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, opacity: 0.8 }}>{event.month}</div>
      <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1 }}>{event.day}</div>
    </div>
    <div>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 600, color: C.ink }}>{event.title}</div>
      <div style={{ fontSize: 14, color: C.inkLight, marginTop: 2 }}>{event.time} · {event.location}</div>
      {event.tag && (
        <span style={{
          display: "inline-block", marginTop: 6, padding: "2px 10px", background: C.sagePale,
          color: C.forest, borderRadius: 10, fontWeight: 600, fontFamily: "'Caveat', cursive", fontSize: 14,
        }}>{event.tag}</span>
      )}
    </div>
  </div>
);

/* ───────── member-only locked card ───────── */
export const LockedCard = ({ title, icon, desc, onClick }) => (
  <div
    onClick={onClick}
    style={{
      position: "relative", padding: "32px 24px", background: C.cream, borderRadius: 6,
      border: `2px solid ${C.parchmentDark}`, textAlign: "center", overflow: "hidden", minHeight: 160,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      cursor: onClick ? "pointer" : "default",
      transition: "transform 0.2s ease",
    }}
  >
    <div style={{ position: "absolute", inset: 0, background: "rgba(251,247,236,0.7)", backdropFilter: "blur(3px)", zIndex: 2 }} />
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3 }}>
      <svg viewBox="0 0 32 32" width="36" height="36" fill="none" stroke={C.brownLight} strokeWidth="2" opacity="0.5">
        <rect x="7" y="14" width="18" height="14" rx="2" /><path d="M10 14V10C10 6.7 12.7 4 16 4C19.3 4 22 6.7 22 10V14" /><circle cx="16" cy="21" r="2" fill={C.brownLight} />
      </svg>
    </div>
    <div style={{ fontSize: 32, marginBottom: 8, zIndex: 1 }}>{icon}</div>
    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: C.ink, zIndex: 1 }}>{title}</div>
    <div style={{ fontSize: 14, color: C.inkLight, marginTop: 4, zIndex: 1 }}>{desc}</div>
  </div>
);

/* ───────── hero illustration ───────── */
export const ClubIllustration = () => (
  <svg viewBox="0 0 800 420" style={{ width: "100%", maxWidth: 720, height: "auto", display: "block", margin: "0 auto", filter: "url(#sketchyStrong)" }}>
    <rect width="800" height="420" fill="#E8DCC8" rx="8" />
    <ellipse cx="200" cy="420" rx="350" ry="140" fill={C.sagePale} />
    <ellipse cx="620" cy="420" rx="320" ry="120" fill="#B8CEAE" />
    <g transform="translate(60,160)">
      <rect x="12" y="60" width="8" height="40" fill={C.brownLight} rx="2" />
      <ellipse cx="16" cy="50" rx="22" ry="35" fill={C.forest} opacity="0.7" />
    </g>
    <g transform="translate(110,180)">
      <rect x="10" y="50" width="7" height="35" fill={C.brownLight} rx="2" />
      <ellipse cx="13" cy="42" rx="18" ry="28" fill={C.forestLight} opacity="0.7" />
    </g>
    <g transform="translate(620,170)">
      <rect x="12" y="55" width="8" height="38" fill={C.brownLight} rx="2" />
      <ellipse cx="16" cy="46" rx="20" ry="32" fill={C.forest} opacity="0.7" />
    </g>
    <g transform="translate(690,190)">
      <rect x="10" y="45" width="7" height="30" fill={C.brownLight} rx="2" />
      <ellipse cx="13" cy="38" rx="16" ry="25" fill={C.forestLight} opacity="0.8" />
    </g>
    <g transform="translate(240,120)">
      <rect x="20" y="100" width="280" height="160" fill={C.parchment} stroke={C.brown} strokeWidth="2.5" rx="3" />
      <polygon points="0,105 160,20 320,105" fill={C.terracotta} stroke={C.brown} strokeWidth="2.5" />
      <polygon points="20,105 160,35 300,105" fill={C.terracottaLight} stroke="none" />
      <rect x="240" y="40" width="24" height="65" fill={C.brown} stroke={C.brown} strokeWidth="1.5" rx="2" />
      <rect x="236" y="36" width="32" height="8" fill={C.brownLight} rx="2" />
      <path d="M252 32 Q248 20 255 10 Q260 0 253 -10" fill="none" stroke={C.inkLight} strokeWidth="1.5" opacity="0.3" />
      <rect x="130" y="180" width="56" height="80" fill={C.brown} stroke={C.ink} strokeWidth="2" rx="28 28 0 0" />
      <circle cx="174" cy="224" r="4" fill={C.gold} />
      <g>
        <rect x="55" y="140" width="44" height="50" fill="#D4C99E" stroke={C.brown} strokeWidth="2" rx="2" />
        <line x1="77" y1="140" x2="77" y2="190" stroke={C.brown} strokeWidth="1.5" />
        <line x1="55" y1="165" x2="99" y2="165" stroke={C.brown} strokeWidth="1.5" />
        <rect x="59" y="144" width="16" height="19" fill="#F5E6A3" opacity="0.5" />
      </g>
      <g>
        <rect x="220" y="140" width="44" height="50" fill="#D4C99E" stroke={C.brown} strokeWidth="2" rx="2" />
        <line x1="242" y1="140" x2="242" y2="190" stroke={C.brown} strokeWidth="1.5" />
        <line x1="220" y1="165" x2="264" y2="165" stroke={C.brown} strokeWidth="1.5" />
        <rect x="224" y="144" width="16" height="19" fill="#F5E6A3" opacity="0.5" />
      </g>
      <rect x="100" y="122" width="120" height="32" fill={C.parchmentDark} stroke={C.brown} strokeWidth="1.5" rx="3" />
      <text x="160" y="143" textAnchor="middle" fill={C.brown} fontFamily="'Playfair Display', serif" fontSize="13" fontWeight="700">THE HILLSIDE</text>
    </g>
    <path d="M400 400 Q390 370 400 340 Q415 310 395 285" fill="none" stroke={C.brownLight} strokeWidth="16" strokeLinecap="round" opacity="0.4" />
    {[{x:180,y:340,c:"#D4845F"},{x:200,y:355,c:"#C6A44E"},{x:560,y:345,c:"#C0623A"},{x:590,y:360,c:"#8BA888"},{x:330,y:365,c:"#D4845F"},{x:480,y:370,c:"#C6A44E"}].map((f,i) => (
      <g key={i} transform={`translate(${f.x},${f.y})`}>
        <line x1="0" y1="0" x2="0" y2="14" stroke={C.forest} strokeWidth="1.5" />
        <circle cx="0" cy="-2" r="5" fill={f.c} opacity="0.8" />
        <circle cx="0" cy="-2" r="2" fill={C.gold} opacity="0.6" />
      </g>
    ))}
    <circle cx="680" cy="60" r="30" fill={C.goldLight} opacity="0.6" />
    <circle cx="680" cy="60" r="20" fill={C.gold} opacity="0.4" />
    <path d="M500 70 Q505 64 510 70" fill="none" stroke={C.inkLight} strokeWidth="1.5" opacity="0.4" />
    <path d="M530 55 Q536 48 542 55" fill="none" stroke={C.inkLight} strokeWidth="1.5" opacity="0.3" />
  </svg>
);
