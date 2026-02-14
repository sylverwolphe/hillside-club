import { useState, useEffect, useRef, useCallback } from "react";

/* ───────── palette & tokens ───────── */
const C = {
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
const SketchFilter = () => (
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
const HandDrawnBox = ({ children, style = {}, color = C.brown, fill = "transparent", strokeWidth = 2, className = "" }) => {
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
const CraftDivider = ({ color = C.gold }) => (
  <svg viewBox="0 0 400 30" style={{ width: "min(280px, 60%)", height: 30, display: "block", margin: "0 auto", filter: "url(#sketchy)" }}>
    <path d="M20,15 Q100,5 200,15 Q300,25 380,15" fill="none" stroke={color} strokeWidth="1.5" />
    <circle cx="200" cy="15" r="4" fill={color} />
    <path d="M185,15 L200,6 L215,15 L200,24 Z" fill="none" stroke={color} strokeWidth="1" />
    <circle cx="30" cy="15" r="2" fill={color} />
    <circle cx="370" cy="15" r="2" fill={color} />
  </svg>
);

/* ───────── nav icons (hand-drawn style) ───────── */
const NavIcons = {
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
};

/* ───────── hero illustration (hand-drawn cozy clubhouse) ───────── */
const ClubIllustration = () => (
  <svg viewBox="0 0 800 420" style={{ width: "100%", maxWidth: 720, height: "auto", display: "block", margin: "0 auto", filter: "url(#sketchyStrong)" }}>
    {/* sky */}
    <rect width="800" height="420" fill="#E8DCC8" rx="8" />
    {/* hills */}
    <ellipse cx="200" cy="420" rx="350" ry="140" fill={C.sagePale} />
    <ellipse cx="620" cy="420" rx="320" ry="120" fill="#B8CEAE" />
    {/* trees left */}
    <g transform="translate(60,160)">
      <rect x="12" y="60" width="8" height="40" fill={C.brownLight} rx="2" />
      <ellipse cx="16" cy="50" rx="22" ry="35" fill={C.forest} opacity="0.7" />
    </g>
    <g transform="translate(110,180)">
      <rect x="10" y="50" width="7" height="35" fill={C.brownLight} rx="2" />
      <ellipse cx="13" cy="42" rx="18" ry="28" fill={C.forestLight} opacity="0.7" />
    </g>
    {/* trees right */}
    <g transform="translate(620,170)">
      <rect x="12" y="55" width="8" height="38" fill={C.brownLight} rx="2" />
      <ellipse cx="16" cy="46" rx="20" ry="32" fill={C.forest} opacity="0.7" />
    </g>
    <g transform="translate(690,190)">
      <rect x="10" y="45" width="7" height="30" fill={C.brownLight} rx="2" />
      <ellipse cx="13" cy="38" rx="16" ry="25" fill={C.forestLight} opacity="0.8" />
    </g>
    {/* main building */}
    <g transform="translate(240,120)">
      {/* building body */}
      <rect x="20" y="100" width="280" height="160" fill={C.parchment} stroke={C.brown} strokeWidth="2.5" rx="3" />
      {/* roof */}
      <polygon points="0,105 160,20 320,105" fill={C.terracotta} stroke={C.brown} strokeWidth="2.5" />
      <polygon points="20,105 160,35 300,105" fill={C.terracottaLight} stroke="none" />
      {/* chimney */}
      <rect x="240" y="40" width="24" height="65" fill={C.brown} stroke={C.brown} strokeWidth="1.5" rx="2" />
      <rect x="236" y="36" width="32" height="8" fill={C.brownLight} rx="2" />
      {/* smoke */}
      <path d="M252 32 Q248 20 255 10 Q260 0 253 -10" fill="none" stroke={C.inkLight} strokeWidth="1.5" opacity="0.3" />
      {/* door */}
      <rect x="130" y="180" width="56" height="80" fill={C.brown} stroke={C.ink} strokeWidth="2" rx="28 28 0 0" />
      <circle cx="174" cy="224" r="4" fill={C.gold} />
      {/* windows */}
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
      {/* sign */}
      <rect x="100" y="122" width="120" height="32" fill={C.parchmentDark} stroke={C.brown} strokeWidth="1.5" rx="3" />
      <text x="160" y="143" textAnchor="middle" fill={C.brown} fontFamily="'Playfair Display', serif" fontSize="13" fontWeight="700">THE HILLSIDE</text>
    </g>
    {/* path */}
    <path d="M400 400 Q390 370 400 340 Q415 310 395 285" fill="none" stroke={C.brownLight} strokeWidth="16" strokeLinecap="round" opacity="0.4" />
    {/* flowers */}
    {[{x:180,y:340,c:"#D4845F"},{x:200,y:355,c:"#C6A44E"},{x:560,y:345,c:"#C0623A"},{x:590,y:360,c:"#8BA888"},{x:330,y:365,c:"#D4845F"},{x:480,y:370,c:"#C6A44E"}].map((f,i) => (
      <g key={i} transform={`translate(${f.x},${f.y})`}>
        <line x1="0" y1="0" x2="0" y2="14" stroke={C.forest} strokeWidth="1.5" />
        <circle cx="0" cy="-2" r="5" fill={f.c} opacity="0.8" />
        <circle cx="0" cy="-2" r="2" fill={C.gold} opacity="0.6" />
      </g>
    ))}
    {/* sun */}
    <circle cx="680" cy="60" r="30" fill={C.goldLight} opacity="0.6" />
    <circle cx="680" cy="60" r="20" fill={C.gold} opacity="0.4" />
    {/* birds */}
    <path d="M500 70 Q505 64 510 70" fill="none" stroke={C.inkLight} strokeWidth="1.5" opacity="0.4" />
    <path d="M530 55 Q536 48 542 55" fill="none" stroke={C.inkLight} strokeWidth="1.5" opacity="0.3" />
  </svg>
);

/* ───────── pin note component ───────── */
const PIN_COLORS = ["#FFEAA7", "#DCEDC8", "#F8D7DA", "#D4E6F1", "#FDEBD0", "#E8DAEF", "#F5CBA7", "#D5F5E3"];
const PIN_TACKS = [C.terracotta, C.forest, C.gold, C.rust, C.brownLight];

const PinNote = ({ note, style = {} }) => {
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
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, color: C.inkLight }}>{note.author}</div>
      <div>{note.text}</div>
      {note.date && <div style={{ fontSize: 12, color: C.brownLight, marginTop: 6, textAlign: "right" }}>{note.date}</div>}
    </div>
  );
};

/* ───────── calendar event component ───────── */
const CalendarEvent = ({ event }) => (
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
const LockedCard = ({ title, icon, desc }) => (
  <div style={{
    position: "relative", padding: "32px 24px", background: C.cream, borderRadius: 6,
    border: `2px solid ${C.parchmentDark}`, textAlign: "center", overflow: "hidden", minHeight: 160,
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
  }}>
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

/* ═══════════════ MAIN APP ═══════════════ */
export default function HillsideClub() {
  const [activeSection, setActiveSection] = useState("home");
  const [showPinModal, setShowPinModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [pins, setPins] = useState([
    { author: "Margaret W.", text: "The garden tour last Saturday was absolutely magical. Thank you to all who helped!", date: "Feb 4" },
    { author: "David K.", text: "Looking for a partner for the spring pottery workshop — anyone interested?", date: "Feb 2" },
    { author: "Sarah L.", text: "Don't forget: book club meets this Thursday! We're discussing Craftsman Homes.", date: "Jan 30" },
    { author: "Thomas R.", text: "Has anyone seen my green umbrella? Left it at the hall after the lecture.", date: "Jan 28" },
    { author: "Elena M.", text: "Welcome to our newest members! So glad to have you in our community. 🌿", date: "Jan 25" },
    { author: "James P.", text: "The woodworking bench in Studio B needs some attention — happy to help fix it this weekend.", date: "Jan 22" },
    { author: "Anne C.", text: "Beautiful Morris wallpaper samples arrived for the reading room. Come see!", date: "Jan 20" },
    { author: "Robert H.", text: "Proposing a sunset sketching group for February. Who's in?", date: "Jan 18" },
  ]);
  const [events] = useState([
    { month: "FEB", day: "14", title: "Valentine's Letterpress Workshop", time: "2:00 PM", location: "Print Studio", tag: "Workshop" },
    { month: "FEB", day: "18", title: "Winter Garden Walk & Pruning", time: "10:00 AM", location: "Club Gardens", tag: "Outdoors" },
    { month: "FEB", day: "22", title: "Arts & Crafts Film Night", time: "7:00 PM", location: "Main Hall", tag: "Social" },
    { month: "MAR", day: "01", title: "Spring Member Social", time: "5:00 PM", location: "Courtyard", tag: "Social" },
    { month: "MAR", day: "08", title: "Tile Glazing: Intro Course", time: "1:00 PM", location: "Studio A", tag: "Workshop" },
    { month: "MAR", day: "15", title: "Annual General Meeting", time: "6:00 PM", location: "Main Hall", tag: "Business" },
  ]);

  const sectionRefs = {
    home: useRef(null), pinboard: useRef(null), membership: useRef(null), calendar: useRef(null), members: useRef(null),
  };

  const scrollTo = useCallback((section) => {
    setActiveSection(section);
    sectionRefs[section]?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const entries = Object.entries(sectionRefs);
      for (let i = entries.length - 1; i >= 0; i--) {
        const [key, ref] = entries[i];
        if (ref.current) {
          const rect = ref.current.getBoundingClientRect();
          if (rect.top <= 200) { setActiveSection(key); break; }
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { key: "home", icon: NavIcons.home, label: "Home" },
    { key: "pinboard", icon: NavIcons.pin, label: "Pinboard" },
    { key: "membership", icon: NavIcons.leaf, label: "Membership" },
    { key: "calendar", icon: NavIcons.calendar, label: "Events" },
    { key: "members", icon: NavIcons.lock, label: "Members" },
  ];

  return (
    <div style={{ background: C.parchment, minHeight: "100vh", fontFamily: "'EB Garamond', 'Georgia', serif", color: C.ink, paddingBottom: 80 }}>
      <SketchFilter />

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; scroll-padding-top: 20px; }
        body { background: ${C.parchment}; }
        ::selection { background: ${C.sagePale}; color: ${C.forest}; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pinDrop { from { opacity: 0; transform: translateY(-30px) rotate(0deg); } to { opacity: 1; transform: translateY(0) rotate(var(--rot, 0deg)); } }
        @keyframes gentleBob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        @keyframes shimmer { 0% { opacity: 0.3; } 50% { opacity: 0.6; } 100% { opacity: 0.3; } }
        .section { animation: fadeUp 0.6s ease-out both; }
        .nav-btn { transition: all 0.25s ease; }
        .nav-btn:hover { transform: translateY(-2px); }
        .craft-btn {
          font-family: 'Playfair Display', serif; font-weight: 600; border: 2px solid ${C.brown};
          background: ${C.warmWhite}; color: ${C.brown}; padding: 10px 24px; font-size: 15px;
          cursor: pointer; border-radius: 4px; transition: all 0.25s ease;
          filter: url(#sketchy); position: relative;
        }
        .craft-btn:hover { background: ${C.forest}; color: ${C.warmWhite}; border-color: ${C.forest}; }
        .craft-btn-primary {
          font-family: 'Playfair Display', serif; font-weight: 600; border: 2px solid ${C.forest};
          background: ${C.forest}; color: ${C.warmWhite}; padding: 12px 28px; font-size: 15px;
          cursor: pointer; border-radius: 4px; transition: all 0.25s ease; filter: url(#sketchy);
        }
        .craft-btn-primary:hover { background: ${C.forestLight}; border-color: ${C.forestLight}; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(45,95,59,0.3); }
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(44,36,24,0.5); z-index: 100;
          display: flex; align-items: center; justify-content: center; padding: 20px;
          backdrop-filter: blur(2px);
        }
        .modal-box {
          background: ${C.warmWhite}; padding: 32px; border-radius: 6px; max-width: 440px; width: 100%;
          border: 2px solid ${C.brown}; position: relative; filter: url(#sketchy);
        }
        .modal-box input, .modal-box textarea {
          width: 100%; padding: 10px 14px; border: 1.5px solid ${C.parchmentDark}; border-radius: 4px;
          font-family: 'Caveat', cursive; font-size: 18px; background: ${C.cream}; color: ${C.ink};
          outline: none; transition: border-color 0.2s;
        }
        .modal-box input:focus, .modal-box textarea:focus { border-color: ${C.forest}; }
        .pin-grid { columns: 2; column-gap: 16px; }
        @media (min-width: 640px) { .pin-grid { columns: 3; } }
        @media (min-width: 900px) { .pin-grid { columns: 4; } }
        .locked-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; }
      `}</style>

      {/* ═══ HERO SECTION ═══ */}
      <section ref={sectionRefs.home} style={{ padding: "40px 20px 20px", maxWidth: 880, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <h1 style={{
            fontFamily: "'Playfair Display', serif", fontSize: "clamp(32px, 6vw, 52px)", fontWeight: 800,
            color: C.forest, letterSpacing: "-0.5px", lineHeight: 1.1,
          }}>
            The Hillside Club
          </h1>
          <p style={{
            fontFamily: "'Caveat', cursive", fontSize: "clamp(18px, 3vw, 24px)", color: C.terracotta,
            marginTop: 4, fontWeight: 500,
          }}>
            a little gathering place for our members
          </p>
        </div>
        <ClubIllustration />
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <CraftDivider />
          <p style={{ fontSize: 17, color: C.inkLight, marginTop: 16, maxWidth: 500, margin: "16px auto 0", lineHeight: 1.6, fontStyle: "italic" }}>
            "Have nothing in your houses that you do not know to be useful, or believe to be beautiful."
          </p>
          <p style={{ fontSize: 13, color: C.brownLight, marginTop: 6, fontFamily: "'Playfair Display', serif" }}>— William Morris</p>
        </div>
      </section>

      {/* ═══ PINBOARD ═══ */}
      <section ref={sectionRefs.pinboard} style={{ padding: "48px 20px", maxWidth: 880, margin: "0 auto" }} className="section">
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 700, color: C.brown }}>
            Community Pinboard
          </h2>
          <p style={{ fontFamily: "'Caveat', cursive", fontSize: 18, color: C.terracotta, marginTop: 4 }}>
            notes, reminders & little hellos from fellow members
          </p>
        </div>

        <HandDrawnBox fill={C.brownLight + "18"} color={C.brown} strokeWidth={2.5} style={{ padding: "28px 20px", borderRadius: 6 }}>
          <div className="pin-grid">
            {pins.map((pin, i) => (
              <div key={i} style={{ breakInside: "avoid", marginBottom: 16 }}>
                <PinNote note={pin} />
              </div>
            ))}
          </div>
        </HandDrawnBox>

        <div style={{ textAlign: "center", marginTop: 24 }}>
          <button className="craft-btn" onClick={() => setShowPinModal(true)}>
            + Add a Pin
          </button>
          <p style={{ fontSize: 13, color: C.brownLight, marginTop: 8, fontStyle: "italic" }}>Log in to add your own note to the board</p>
        </div>
      </section>

      {/* ═══ MEMBERSHIP ═══ */}
      <section ref={sectionRefs.membership} style={{ padding: "48px 20px", maxWidth: 880, margin: "0 auto" }} className="section">
        <div style={{
          background: `linear-gradient(135deg, ${C.forestPale} 0%, ${C.cream} 100%)`,
          borderRadius: 8, padding: "40px 28px", border: `2px solid ${C.sage}`,
          filter: "url(#sketchy)", position: "relative", overflow: "hidden",
        }}>
          {/* decorative corner flourishes */}
          <svg style={{ position: "absolute", top: 8, left: 8, opacity: 0.2 }} width="60" height="60" viewBox="0 0 60 60">
            <path d="M5 55 Q5 5 55 5" fill="none" stroke={C.forest} strokeWidth="2" />
            <path d="M12 55 Q12 12 55 12" fill="none" stroke={C.forest} strokeWidth="1.5" />
          </svg>
          <svg style={{ position: "absolute", bottom: 8, right: 8, opacity: 0.2, transform: "rotate(180deg)" }} width="60" height="60" viewBox="0 0 60 60">
            <path d="M5 55 Q5 5 55 5" fill="none" stroke={C.forest} strokeWidth="2" />
            <path d="M12 55 Q12 12 55 12" fill="none" stroke={C.forest} strokeWidth="1.5" />
          </svg>

          <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
            <div style={{ marginBottom: 16 }}>
              <svg viewBox="0 0 60 60" width="50" height="50" style={{ filter: "url(#sketchy)" }}>
                <path d="M10 50C10 50 15 15 50 10C50 10 45 45 10 50Z" fill="none" stroke={C.forest} strokeWidth="2.5" />
                <path d="M10 50C20 38 32 26 50 10" fill="none" stroke={C.forest} strokeWidth="1.5" />
                <path d="M22 42C26 34 32 28 42 22" fill="none" stroke={C.sage} strokeWidth="1" opacity="0.6" />
              </svg>
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 700, color: C.forest }}>
              Join Our Community
            </h2>
            <CraftDivider color={C.sage} />
            <p style={{ fontSize: 17, color: C.inkLight, marginTop: 16, maxWidth: 480, margin: "16px auto 0", lineHeight: 1.7 }}>
              The Hillside Club has been a gathering place for culture, creativity, and community
              since 1898. Whether you're drawn to our workshops, our gardens, or simply our
              warm company — there's a place for you here.
            </p>
            <div style={{
              display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 24, marginTop: 28,
              fontFamily: "'Caveat', cursive", fontSize: 18, color: C.forest,
            }}>
              {["Workshops & Classes", "Garden Access", "Library & Archives", "Member Events", "Studio Spaces", "Community Voice"].map((b, i) => (
                <span key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <svg width="14" height="14" viewBox="0 0 14 14"><path d="M2 7L5.5 10.5L12 3.5" fill="none" stroke={C.forest} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  {b}
                </span>
              ))}
            </div>
            <div style={{ marginTop: 32 }}>
              <a
                href="https://www.hillsideclub.org"
                target="_blank"
                rel="noopener noreferrer"
                className="craft-btn-primary"
                style={{ textDecoration: "none", display: "inline-block" }}
              >
                Become a Member →
              </a>
              <p style={{ fontSize: 13, color: C.brownLight, marginTop: 10, fontStyle: "italic" }}>
                Visit our official site to explore membership options
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CALENDAR ═══ */}
      <section ref={sectionRefs.calendar} style={{ padding: "48px 20px", maxWidth: 880, margin: "0 auto" }} className="section">
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 700, color: C.brown }}>
            Upcoming Events
          </h2>
          <p style={{ fontFamily: "'Caveat', cursive", fontSize: 18, color: C.terracotta, marginTop: 4 }}>
            gather, learn, create & celebrate together
          </p>
        </div>

        <HandDrawnBox fill={C.warmWhite} color={C.brown} strokeWidth={2} style={{ padding: "8px 24px", borderRadius: 6 }}>
          {events.map((event, i) => (
            <CalendarEvent key={i} event={event} />
          ))}
        </HandDrawnBox>

        <div style={{ textAlign: "center", marginTop: 24 }}>
          <button className="craft-btn" onClick={() => setShowEventModal(true)}>
            ✦ Propose an Event
          </button>
          <p style={{ fontSize: 13, color: C.brownLight, marginTop: 8, fontStyle: "italic" }}>
            Established members may propose new events for the calendar
          </p>
        </div>
      </section>

      {/* ═══ MEMBER-ONLY ═══ */}
      <section ref={sectionRefs.members} style={{ padding: "48px 20px", maxWidth: 880, margin: "0 auto" }} className="section">
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 700, color: C.brown }}>
            Members Only
          </h2>
          <p style={{ fontFamily: "'Caveat', cursive", fontSize: 18, color: C.terracotta, marginTop: 4 }}>
            a few more rooms to explore, once you're in
          </p>
        </div>
        <div className="locked-grid">
          <LockedCard title="Groups" icon="🏡" desc="Find your people in interest-based circles" />
          <LockedCard title="Forum" icon="💬" desc="Ongoing conversations & member discussions" />
          <LockedCard title="Yearbook" icon="📖" desc="Faces, memories & milestones through the years" />
        </div>
        <div style={{ textAlign: "center", marginTop: 28 }}>
          <button className="craft-btn-primary" style={{ border: "none", cursor: "pointer" }}>
            Sign In to Access
          </button>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <div style={{ textAlign: "center", padding: "40px 20px 100px", maxWidth: 880, margin: "0 auto" }}>
        <CraftDivider />
        <p style={{ fontSize: 14, color: C.brownLight, marginTop: 20, fontFamily: "'Playfair Display', serif" }}>
          The Hillside Club · Berkeley, California · Est. 1898
        </p>
        <p style={{ fontSize: 12, color: C.brownLight, marginTop: 6, opacity: 0.6 }}>
          This is a community engagement site, not the official Hillside Club website.
        </p>
      </div>

      {/* ═══ BOTTOM NAV ═══ */}
      <nav style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
        background: C.warmWhite, borderTop: `2px solid ${C.parchmentDark}`,
        display: "flex", justifyContent: "center", gap: 0,
        boxShadow: "0 -4px 20px rgba(44,36,24,0.1)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}>
        {navItems.map((item) => (
          <button
            key={item.key}
            className="nav-btn"
            onClick={() => scrollTo(item.key)}
            title={item.label}
            style={{
              flex: 1, maxWidth: 80, padding: "10px 0 8px", background: "none", border: "none",
              cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              color: activeSection === item.key ? C.forest : C.brownLight,
              position: "relative",
            }}
          >
            {activeSection === item.key && (
              <div style={{ position: "absolute", top: -2, left: "25%", right: "25%", height: 3, background: C.forest, borderRadius: "0 0 2px 2px" }} />
            )}
            {item.icon}
            <span style={{
              fontSize: 10, fontFamily: "'Playfair Display', serif", fontWeight: 600,
              letterSpacing: "0.5px", textTransform: "uppercase",
              opacity: activeSection === item.key ? 1 : 0.6,
            }}>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* ═══ PIN MODAL ═══ */}
      {showPinModal && (
        <div className="modal-overlay" onClick={() => setShowPinModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowPinModal(false)} style={{
              position: "absolute", top: 12, right: 16, background: "none", border: "none",
              fontSize: 22, cursor: "pointer", color: C.brownLight, fontFamily: "serif",
            }}>×</button>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: C.brown, marginBottom: 20 }}>
              Pin a Note
            </h3>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, color: C.inkLight, fontWeight: 600, display: "block", marginBottom: 4 }}>Your Name</label>
              <input placeholder="e.g. Margaret W." />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, color: C.inkLight, fontWeight: 600, display: "block", marginBottom: 4 }}>Your Note</label>
              <textarea rows="4" placeholder="Share a thought, a question, or a hello..." style={{ resize: "vertical" }} />
            </div>
            <div style={{
              background: C.cream, border: `1.5px dashed ${C.gold}`, borderRadius: 6, padding: "12px 16px",
              marginBottom: 20, textAlign: "center",
            }}>
              <p style={{ fontFamily: "'Caveat', cursive", fontSize: 16, color: C.brownLight }}>
                🔑 Please log in to post. Pinning is for members only!
              </p>
            </div>
            <button className="craft-btn-primary" style={{ width: "100%", cursor: "pointer", border: "none" }}>
              Sign In to Pin
            </button>
          </div>
        </div>
      )}

      {/* ═══ EVENT PROPOSAL MODAL ═══ */}
      {showEventModal && (
        <div className="modal-overlay" onClick={() => setShowEventModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowEventModal(false)} style={{
              position: "absolute", top: 12, right: 16, background: "none", border: "none",
              fontSize: 22, cursor: "pointer", color: C.brownLight, fontFamily: "serif",
            }}>×</button>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: C.brown, marginBottom: 20 }}>
              Propose an Event
            </h3>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, color: C.inkLight, fontWeight: 600, display: "block", marginBottom: 4 }}>Event Title</label>
              <input placeholder="e.g. Spring Watercolor Session" />
            </div>
            <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 13, color: C.inkLight, fontWeight: 600, display: "block", marginBottom: 4 }}>Date</label>
                <input type="date" style={{ fontFamily: "'EB Garamond', serif", fontSize: 16 }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 13, color: C.inkLight, fontWeight: 600, display: "block", marginBottom: 4 }}>Time</label>
                <input type="time" style={{ fontFamily: "'EB Garamond', serif", fontSize: 16 }} />
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, color: C.inkLight, fontWeight: 600, display: "block", marginBottom: 4 }}>Description</label>
              <textarea rows="3" placeholder="What's your event about?" style={{ resize: "vertical" }} />
            </div>
            <div style={{
              background: C.cream, border: `1.5px dashed ${C.terracotta}`, borderRadius: 6, padding: "12px 16px",
              marginBottom: 20, textAlign: "center",
            }}>
              <p style={{ fontFamily: "'Caveat', cursive", fontSize: 16, color: C.brownLight }}>
                ✦ Event proposals are available to established members only
              </p>
            </div>
            <button className="craft-btn-primary" style={{ width: "100%", cursor: "pointer", border: "none" }}>
              Sign In to Propose
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
