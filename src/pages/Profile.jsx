import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";
import { useCollection } from "../useFirestore";
import { C, HandDrawnBox, CraftDivider } from "../theme";

export default function Profile() {
  const { user, signOut, setShowAuthModal } = useAuth();
  const navigate = useNavigate();
  const [bio, setBio] = useState("");
  const [editingBio, setEditingBio] = useState(false);
  const [bioText, setBioText] = useState("");
  const [savingBio, setSavingBio] = useState(false);
  const [joinDate, setJoinDate] = useState("");
  const [myThreads, setMyThreads] = useState([]);
  const [myPins, setMyPins] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Fetch user profile
  useEffect(() => {
    if (!user) return;
    async function fetchProfile() {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        const data = snap.data();
        setBio(data.bio || "");
        setBioText(data.bio || "");
        if (data.joinedAt?.toDate) {
          setJoinDate(data.joinedAt.toDate().toLocaleDateString("en-US", { month: "long", year: "numeric" }));
        }
      }
    }
    fetchProfile();
  }, [user]);

  // Fetch user's threads
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "forumThreads"),
      where("authorId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setMyThreads(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }, () => {});
    return unsub;
  }, [user]);

  // Fetch user's pins
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "pins"),
      where("authorId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setMyPins(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }, () => {});
    return unsub;
  }, [user]);

  // Fetch notifications
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "notifications"),
      where("recipientId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setNotifications(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      // Mark as read
      snap.docs.forEach((d) => {
        if (!d.data().read) {
          updateDoc(doc(db, "notifications", d.id), { read: true });
        }
      });
    }, () => {});
    return unsub;
  }, [user]);

  const handleSaveBio = async () => {
    if (!user) return;
    setSavingBio(true);
    try {
      await updateDoc(doc(db, "users", user.uid), { bio: bioText.trim() });
      setBio(bioText.trim());
      setEditingBio(false);
    } catch (err) {
      console.error("Failed to save bio:", err);
    }
    setSavingBio(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (!user) {
    return (
      <div style={{ padding: "60px 20px", maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: C.brown, marginBottom: 12 }}>
          Your Profile
        </h2>
        <p style={{ color: C.inkLight, marginBottom: 24 }}>Sign in to view your profile</p>
        <button className="craft-btn-primary" style={{ border: "none", cursor: "pointer" }} onClick={() => setShowAuthModal(true)}>
          Sign In
        </button>
      </div>
    );
  }

  const displayName = user.displayName || user.email?.split("@")[0] || "Member";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div style={{ padding: "40px 20px 100px", maxWidth: 700, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 700, color: C.brown }}>
          Your Profile
        </h2>
        <CraftDivider />
      </div>

      {/* Profile Card */}
      <HandDrawnBox fill={C.warmWhite} color={C.forest} strokeWidth={2} style={{ padding: "28px", borderRadius: 6, marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          {/* Avatar */}
          <div style={{
            width: 72, height: 72, borderRadius: "50%", background: C.forest,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700,
            color: C.warmWhite, flexShrink: 0,
          }}>
            {initial}
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: C.ink, marginBottom: 4 }}>
              {displayName}
            </h3>
            <p style={{ fontSize: 14, color: C.inkLight, marginBottom: 2 }}>{user.email}</p>
            {joinDate && (
              <p style={{ fontSize: 13, color: C.brownLight, fontFamily: "'Caveat', cursive", fontWeight: 700 }}>
                Member since {joinDate}
              </p>
            )}
          </div>
        </div>

        {/* Bio */}
        <div style={{ marginTop: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, color: C.brown }}>About</h4>
            {!editingBio && (
              <button
                onClick={() => { setEditingBio(true); setBioText(bio); }}
                style={{ background: "none", border: "none", color: C.forest, cursor: "pointer", fontSize: 13, fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
              >
                Edit
              </button>
            )}
          </div>
          {editingBio ? (
            <div>
              <textarea
                rows="3"
                placeholder="Tell the community about yourself..."
                style={{
                  width: "100%", padding: "10px 14px", border: `1.5px solid ${C.parchmentDark}`, borderRadius: 4,
                  fontFamily: "'Caveat', cursive", fontSize: 18, background: C.cream, color: C.ink,
                  outline: "none", resize: "vertical", boxSizing: "border-box",
                }}
                value={bioText}
                onChange={(e) => setBioText(e.target.value)}
              />
              <div style={{ display: "flex", gap: 8, marginTop: 8, justifyContent: "flex-end" }}>
                <button className="craft-btn" style={{ fontSize: 13, padding: "6px 16px" }} onClick={() => setEditingBio(false)}>
                  Cancel
                </button>
                <button
                  className="craft-btn-primary"
                  style={{ fontSize: 13, padding: "6px 16px", border: "none", cursor: "pointer", opacity: savingBio ? 0.6 : 1 }}
                  onClick={handleSaveBio}
                  disabled={savingBio}
                >
                  {savingBio ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          ) : (
            <p style={{ fontSize: 15, color: bio ? C.ink : C.brownLight, fontStyle: bio ? "normal" : "italic", lineHeight: 1.6 }}>
              {bio || "No bio yet — click Edit to add one"}
            </p>
          )}
        </div>
      </HandDrawnBox>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: C.brown, marginBottom: 12 }}>
            Notifications
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {notifications.slice(0, 10).map((n) => (
              <Link
                key={n.id}
                to={n.referenceId ? `/forum/${n.referenceId}` : "#"}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div style={{
                  padding: "12px 16px", background: n.read ? C.cream : C.forestPale,
                  borderRadius: 6, borderLeft: `3px solid ${n.read ? C.parchmentDark : C.forest}`,
                  transition: "background 0.2s",
                }}>
                  <p style={{ fontSize: 14, color: C.ink, lineHeight: 1.5, margin: 0 }}>{n.message}</p>
                  {n.createdAt?.toDate && (
                    <p style={{ fontSize: 12, color: C.brownLight, marginTop: 4 }}>
                      {n.createdAt.toDate().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: C.brown, marginBottom: 12 }}>
          My Threads
        </h3>
        {myThreads.length === 0 ? (
          <p style={{ fontSize: 14, color: C.brownLight, fontStyle: "italic" }}>No threads yet</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {myThreads.slice(0, 5).map((t) => (
              <Link key={t.id} to={`/forum/${t.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div style={{
                  padding: "12px 16px", background: C.cream, borderRadius: 6,
                  borderLeft: `3px solid ${C.sage}`, transition: "background 0.2s",
                }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 600, color: C.ink }}>
                    {t.title}
                  </div>
                  <div style={{ fontSize: 12, color: C.brownLight, marginTop: 4 }}>
                    {t.replyCount || 0} {t.replyCount === 1 ? "reply" : "replies"}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginBottom: 32 }}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: C.brown, marginBottom: 12 }}>
          My Pins
        </h3>
        {myPins.length === 0 ? (
          <p style={{ fontSize: 14, color: C.brownLight, fontStyle: "italic" }}>No pins yet</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {myPins.slice(0, 5).map((p) => (
              <div key={p.id} style={{
                padding: "12px 16px", background: C.cream, borderRadius: 6,
                borderLeft: `3px solid ${C.gold}`,
              }}>
                <p style={{ fontSize: 14, color: C.ink, lineHeight: 1.5, margin: 0 }}>
                  {p.text?.length > 100 ? p.text.slice(0, 100) + "..." : p.text}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sign Out */}
      <div style={{ textAlign: "center" }}>
        <button
          className="craft-btn"
          style={{ color: C.rust, borderColor: C.rust }}
          onClick={handleSignOut}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
