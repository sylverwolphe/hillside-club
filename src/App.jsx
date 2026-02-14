import { useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { C, SketchFilter, NavIcons } from "./theme";

import Home from "./pages/Home";
import Forum from "./pages/Forum";
import ForumThread from "./pages/ForumThread";
import Groups from "./pages/Groups";
import GroupDetail from "./pages/GroupDetail";

/* ═══════════════ AUTH MODAL ═══════════════ */
function AuthModal() {
  const { signIn, signUp, signInWithGoogle, showAuthModal, setShowAuthModal } = useAuth();
  const [mode, setMode] = useState("signin"); // signin | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!showAuthModal) return null;

  const handleClose = () => {
    setShowAuthModal(false);
    setError("");
    setEmail("");
    setPassword("");
    setDisplayName("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "signup") {
        await signUp(email, password, displayName || email.split("@")[0]);
      } else {
        await signIn(email, password);
      }
      handleClose();
    } catch (err) {
      setError(err.message?.replace("Firebase: ", "") || "Something went wrong");
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle();
      handleClose();
    } catch (err) {
      setError(err.message?.replace("Firebase: ", "") || "Something went wrong");
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button onClick={handleClose} style={{
          position: "absolute", top: 12, right: 16, background: "none", border: "none",
          fontSize: 22, cursor: "pointer", color: C.brownLight, fontFamily: "serif",
        }}>×</button>

        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <svg viewBox="0 0 60 60" width="40" height="40" style={{ filter: "url(#sketchy)" }}>
            <path d="M10 50C10 50 15 15 50 10C50 10 45 45 10 50Z" fill="none" stroke={C.forest} strokeWidth="2.5" />
            <path d="M10 50C20 38 32 26 50 10" fill="none" stroke={C.forest} strokeWidth="1.5" />
          </svg>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: C.brown, marginTop: 8 }}>
            {mode === "signup" ? "Join the Club" : "Welcome Back"}
          </h3>
          <p style={{ fontFamily: "'Caveat', cursive", fontSize: 16, color: C.terracotta, marginTop: 2 }}>
            {mode === "signup" ? "create your member account" : "sign in to your account"}
          </p>
        </div>

        {error && (
          <div style={{
            background: "#FEE", border: `1px solid ${C.terracotta}`, borderRadius: 4,
            padding: "8px 12px", marginBottom: 16, fontSize: 13, color: C.rust,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === "signup" && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, color: C.inkLight, fontWeight: 600, display: "block", marginBottom: 4 }}>Display Name</label>
              <input
                placeholder="e.g. Margaret W."
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
          )}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, color: C.inkLight, fontWeight: 600, display: "block", marginBottom: 4 }}>Email</label>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, color: C.inkLight, fontWeight: 600, display: "block", marginBottom: 4 }}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <button
            type="submit"
            className="craft-btn-primary"
            style={{ width: "100%", cursor: "pointer", border: "none", opacity: loading ? 0.6 : 1 }}
            disabled={loading}
          >
            {loading ? "Please wait..." : mode === "signup" ? "Create Account" : "Sign In"}
          </button>
        </form>

        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
          <div style={{ flex: 1, height: 1, background: C.parchmentDark }} />
          <span style={{ fontSize: 12, color: C.brownLight }}>or</span>
          <div style={{ flex: 1, height: 1, background: C.parchmentDark }} />
        </div>

        <button
          onClick={handleGoogle}
          className="craft-btn"
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            opacity: loading ? 0.6 : 1,
          }}
          disabled={loading}
        >
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: C.inkLight }}>
          {mode === "signin" ? (
            <>Don't have an account?{" "}
              <button onClick={() => { setMode("signup"); setError(""); }} style={{ background: "none", border: "none", color: C.forest, cursor: "pointer", fontWeight: 600, fontSize: 14, fontFamily: "inherit" }}>
                Sign Up
              </button>
            </>
          ) : (
            <>Already a member?{" "}
              <button onClick={() => { setMode("signin"); setError(""); }} style={{ background: "none", border: "none", color: C.forest, cursor: "pointer", fontWeight: 600, fontSize: 14, fontFamily: "inherit" }}>
                Sign In
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ BOTTOM NAV ═══════════════ */
function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut, setShowAuthModal } = useAuth();

  const path = location.pathname;

  const navItems = [
    { key: "home", path: "/", icon: NavIcons.home, label: "Home" },
    { key: "pinboard", path: "/#pinboard", icon: NavIcons.pin, label: "Pinboard" },
    { key: "forum", path: "/forum", icon: NavIcons.forum, label: "Forum" },
    { key: "groups", path: "/groups", icon: NavIcons.groups, label: "Groups" },
    { key: "account", path: null, icon: NavIcons.account, label: user ? "You" : "Sign In" },
  ];

  const isActive = (item) => {
    if (item.key === "home") return path === "/" || path === "";
    if (item.key === "pinboard") return false; // scroll target, not a route
    if (item.key === "account") return false;
    return path.startsWith(item.path);
  };

  const handleClick = (item) => {
    if (item.key === "pinboard") {
      if (path !== "/") navigate("/");
      setTimeout(() => {
        document.getElementById("pinboard")?.scrollIntoView({ behavior: "smooth" });
      }, path !== "/" ? 300 : 0);
      return;
    }
    if (item.key === "account") {
      if (user) {
        signOut();
      } else {
        setShowAuthModal(true);
      }
      return;
    }
    navigate(item.path);
    window.scrollTo({ top: 0 });
  };

  return (
    <nav style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
      background: C.warmWhite, borderTop: `2px solid ${C.parchmentDark}`,
      display: "flex", justifyContent: "center", gap: 0,
      boxShadow: "0 -4px 20px rgba(44,36,24,0.1)",
      paddingBottom: "env(safe-area-inset-bottom, 0px)",
    }}>
      {navItems.map((item) => {
        const active = isActive(item);
        return (
          <button
            key={item.key}
            className="nav-btn"
            onClick={() => handleClick(item)}
            title={item.label}
            style={{
              flex: 1, maxWidth: 80, padding: "10px 0 8px", background: "none", border: "none",
              cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              color: active ? C.forest : (item.key === "account" && user) ? C.terracotta : C.brownLight,
              position: "relative",
            }}
          >
            {active && (
              <div style={{ position: "absolute", top: -2, left: "25%", right: "25%", height: 3, background: C.forest, borderRadius: "0 0 2px 2px" }} />
            )}
            {item.icon}
            <span style={{
              fontSize: 10, fontFamily: "'Playfair Display', serif", fontWeight: 600,
              letterSpacing: "0.5px", textTransform: "uppercase",
              opacity: active ? 1 : 0.6,
            }}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

/* ═══════════════ MAIN APP ═══════════════ */
export default function App() {
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
          outline: none; transition: border-color 0.2s; box-sizing: border-box;
        }
        .modal-box input:focus, .modal-box textarea:focus { border-color: ${C.forest}; }
        .pin-grid { columns: 2; column-gap: 16px; }
        @media (min-width: 640px) { .pin-grid { columns: 3; } }
        @media (min-width: 900px) { .pin-grid { columns: 4; } }
        .locked-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; }
      `}</style>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/forum" element={<Forum />} />
        <Route path="/forum/:threadId" element={<ForumThread />} />
        <Route path="/groups" element={<Groups />} />
        <Route path="/groups/:groupId" element={<GroupDetail />} />
      </Routes>

      <BottomNav />
      <AuthModal />
    </div>
  );
}
