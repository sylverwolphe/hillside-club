import { useState } from "react";
import { Link } from "react-router-dom";
import { collection, addDoc, serverTimestamp, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";
import { useToast } from "../App";
import { useCollection } from "../useFirestore";
import { C, HandDrawnBox, CraftDivider, Modal, SkeletonBlock } from "../theme";

const GROUP_ICONS = ["🌿", "🎨", "📚", "🏡", "🎶", "🍂", "✨", "🪴", "🧵", "🕯️"];

export default function Groups() {
  const { user, setShowAuthModal } = useAuth();
  const showToast = useToast();
  const { docs: groups, loading } = useCollection("groups", [orderBy("createdAt", "desc")]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("🌿");
  const [submitting, setSubmitting] = useState(false);

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
      showToast?.("Group created!");
    } catch (err) {
      console.error("Failed to create group:", err);
      showToast?.("Failed to create group", "error");
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
        <button
          className="craft-btn"
          onClick={() => user ? setShowCreateModal(true) : setShowAuthModal(true)}
        >
          + Create Group
        </button>
      </div>

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
          {[1, 2, 3].map((i) => (
            <HandDrawnBox key={i} fill={C.warmWhite} style={{ padding: "24px 20px", borderRadius: 6, textAlign: "center", minHeight: 140 }}>
              <SkeletonBlock width={36} height={36} style={{ margin: "0 auto 10px", borderRadius: "50%" }} />
              <SkeletonBlock width="70%" height={18} style={{ margin: "0 auto 8px" }} />
              <SkeletonBlock width="50%" height={12} style={{ margin: "0 auto" }} />
            </HandDrawnBox>
          ))}
        </div>
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

      {/* Sign-in prompt for logged-out users */}
      {!user && !loading && (
        <div style={{ textAlign: "center", marginTop: 24, padding: "16px", background: C.forestPale, borderRadius: 6 }}>
          <p style={{ fontFamily: "'Caveat', cursive", fontSize: 18, color: C.forest, marginBottom: 8 }}>
            Want to create or join a group?
          </p>
          <button
            className="craft-btn-primary"
            style={{ border: "none", cursor: "pointer", fontSize: 14, padding: "8px 20px" }}
            onClick={() => setShowAuthModal(true)}
          >
            Sign In
          </button>
        </div>
      )}

      {/* Create Group Modal */}
      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)}>
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
      </Modal>
    </div>
  );
}
