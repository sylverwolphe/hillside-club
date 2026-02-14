import { useState } from "react";
import { Link } from "react-router-dom";
import { collection, addDoc, serverTimestamp, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";
import { useCollection } from "../useFirestore";
import { C, HandDrawnBox, CraftDivider } from "../theme";

const GROUP_ICONS = ["🌿", "🎨", "📚", "🏡", "🎶", "🍂", "✨", "🪴", "🧵", "🕯️"];

export default function Groups() {
  const { user, setShowAuthModal } = useAuth();
  const { docs: groups, loading } = useCollection("groups", [orderBy("createdAt", "desc")]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("🌿");
  const [submitting, setSubmitting] = useState(false);

  if (!user) {
    return (
      <div style={{ padding: "60px 20px", maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: C.brown, marginBottom: 12 }}>
          Community Groups
        </h2>
        <p style={{ color: C.inkLight, marginBottom: 24 }}>Sign in to explore and join groups</p>
        <button className="craft-btn-primary" style={{ border: "none", cursor: "pointer" }} onClick={() => setShowAuthModal(true)}>
          Sign In to Access
        </button>
      </div>
    );
  }

  const handleCreate = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      const groupRef = await addDoc(collection(db, "groups"), {
        name: name.trim(),
        description: description.trim(),
        icon,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        memberCount: 1,
      });
      // Add creator as first member
      await addDoc(collection(db, "groups", groupRef.id, "members"), {
        uid: user.uid,
        displayName: user.displayName || user.email?.split("@")[0] || "Member",
        joinedAt: serverTimestamp(),
        role: "admin",
      });
      setName("");
      setDescription("");
      setIcon("🌿");
      setShowCreateModal(false);
    } catch (err) {
      console.error("Failed to create group:", err);
    }
    setSubmitting(false);
  };

  return (
    <div style={{ padding: "40px 20px 100px", maxWidth: 700, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 700, color: C.brown }}>
          Community Groups
        </h2>
        <p style={{ fontFamily: "'Caveat', cursive", fontSize: 18, color: C.terracotta, marginTop: 4 }}>
          find your people & gather around shared interests
        </p>
        <CraftDivider />
      </div>

      <div style={{ textAlign: "right", marginBottom: 20 }}>
        <button className="craft-btn" onClick={() => setShowCreateModal(true)}>
          + Create Group
        </button>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", color: C.brownLight, fontStyle: "italic" }}>Loading groups...</p>
      ) : groups.length === 0 ? (
        <HandDrawnBox fill={C.warmWhite} style={{ padding: 32, textAlign: "center" }}>
          <p style={{ fontFamily: "'Caveat', cursive", fontSize: 20, color: C.brownLight }}>
            No groups yet — start one and invite your fellow members!
          </p>
        </HandDrawnBox>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
          {groups.map((group) => (
            <Link key={group.id} to={`/groups/${group.id}`} style={{ textDecoration: "none", color: "inherit" }}>
              <HandDrawnBox
                fill={C.warmWhite}
                style={{
                  padding: "24px 20px", borderRadius: 6, textAlign: "center",
                  cursor: "pointer", transition: "transform 0.15s ease", minHeight: 140,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 10 }}>{group.icon || "🌿"}</div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: C.ink, marginBottom: 4 }}>
                  {group.name}
                </h3>
                {group.description && (
                  <p style={{ fontSize: 13, color: C.inkLight, lineHeight: 1.4, marginBottom: 8 }}>
                    {group.description.length > 60 ? group.description.slice(0, 60) + "..." : group.description}
                  </p>
                )}
                <div style={{ fontSize: 12, color: C.brownLight, fontFamily: "'Caveat', cursive", fontWeight: 700 }}>
                  {group.memberCount || 0} {group.memberCount === 1 ? "member" : "members"}
                </div>
              </HandDrawnBox>
            </Link>
          ))}
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowCreateModal(false)} style={{
              position: "absolute", top: 12, right: 16, background: "none", border: "none",
              fontSize: 22, cursor: "pointer", color: C.brownLight, fontFamily: "serif",
            }}>×</button>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: C.brown, marginBottom: 20 }}>
              Create a Group
            </h3>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, color: C.inkLight, fontWeight: 600, display: "block", marginBottom: 4 }}>Group Icon</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {GROUP_ICONS.map((g) => (
                  <button
                    key={g}
                    onClick={() => setIcon(g)}
                    style={{
                      fontSize: 24, padding: "4px 8px", background: icon === g ? C.forestPale : "transparent",
                      border: `2px solid ${icon === g ? C.forest : C.parchmentDark}`, borderRadius: 6, cursor: "pointer",
                    }}
                  >{g}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, color: C.inkLight, fontWeight: 600, display: "block", marginBottom: 4 }}>Group Name</label>
              <input
                placeholder="e.g. Garden Enthusiasts"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, color: C.inkLight, fontWeight: 600, display: "block", marginBottom: 4 }}>Description</label>
              <textarea
                rows="3"
                placeholder="What's this group about?"
                style={{ resize: "vertical" }}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <button
              className="craft-btn-primary"
              style={{ width: "100%", cursor: "pointer", border: "none", opacity: submitting || !name.trim() ? 0.6 : 1 }}
              onClick={handleCreate}
              disabled={submitting || !name.trim()}
            >
              {submitting ? "Creating..." : "Create Group"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
