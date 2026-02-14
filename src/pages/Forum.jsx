import { useState } from "react";
import { Link } from "react-router-dom";
import { collection, addDoc, serverTimestamp, orderBy, query, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";
import { useCollection } from "../useFirestore";
import { C, HandDrawnBox, CraftDivider } from "../theme";

export default function Forum() {
  const { user, setShowAuthModal } = useAuth();
  const { docs: threads, loading } = useCollection("forumThreads", [orderBy("lastActivityAt", "desc")]);
  const [showNewThread, setShowNewThread] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!user) {
    return (
      <div style={{ padding: "60px 20px", maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: C.brown, marginBottom: 12 }}>
          Member Forum
        </h2>
        <p style={{ color: C.inkLight, marginBottom: 24 }}>Sign in to join the conversation</p>
        <button className="craft-btn-primary" style={{ border: "none", cursor: "pointer" }} onClick={() => setShowAuthModal(true)}>
          Sign In to Access
        </button>
      </div>
    );
  }

  const handleCreate = async () => {
    if (!title.trim() || !body.trim()) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, "forumThreads"), {
        title: title.trim(),
        body: body.trim(),
        authorId: user.uid,
        authorName: user.displayName || user.email?.split("@")[0] || "Member",
        createdAt: serverTimestamp(),
        lastActivityAt: serverTimestamp(),
        replyCount: 0,
      });
      setTitle("");
      setBody("");
      setShowNewThread(false);
    } catch (err) {
      console.error("Failed to create thread:", err);
    }
    setSubmitting(false);
  };

  const formatDate = (ts) => {
    if (!ts?.toDate) return "";
    const d = ts.toDate();
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div style={{ padding: "40px 20px 100px", maxWidth: 700, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 700, color: C.brown }}>
          Member Forum
        </h2>
        <p style={{ fontFamily: "'Caveat', cursive", fontSize: 18, color: C.terracotta, marginTop: 4 }}>
          conversations, questions & ideas from the community
        </p>
        <CraftDivider />
      </div>

      <div style={{ textAlign: "right", marginBottom: 20 }}>
        <button className="craft-btn" onClick={() => setShowNewThread(true)}>
          + New Topic
        </button>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", color: C.brownLight, fontStyle: "italic" }}>Loading threads...</p>
      ) : threads.length === 0 ? (
        <HandDrawnBox fill={C.warmWhite} style={{ padding: 32, textAlign: "center" }}>
          <p style={{ fontFamily: "'Caveat', cursive", fontSize: 20, color: C.brownLight }}>
            No threads yet — be the first to start a conversation!
          </p>
        </HandDrawnBox>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {threads.map((thread) => (
            <Link
              key={thread.id}
              to={`/forum/${thread.id}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <HandDrawnBox fill={C.warmWhite} style={{ padding: "18px 22px", borderRadius: 4, cursor: "pointer", transition: "transform 0.15s ease" }}
                className="thread-card"
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 19, fontWeight: 600, color: C.ink, marginBottom: 4 }}>
                      {thread.title}
                    </h3>
                    <p style={{ fontSize: 14, color: C.inkLight, lineHeight: 1.5 }}>
                      {thread.body?.length > 120 ? thread.body.slice(0, 120) + "..." : thread.body}
                    </p>
                  </div>
                  <div style={{ textAlign: "right", minWidth: 70, flexShrink: 0 }}>
                    <div style={{ fontFamily: "'Caveat', cursive", fontSize: 22, fontWeight: 700, color: C.forest }}>
                      {thread.replyCount || 0}
                    </div>
                    <div style={{ fontSize: 11, color: C.brownLight }}>
                      {thread.replyCount === 1 ? "reply" : "replies"}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 12, color: C.brownLight }}>
                  <span>by {thread.authorName}</span>
                  <span>{formatDate(thread.lastActivityAt || thread.createdAt)}</span>
                </div>
              </HandDrawnBox>
            </Link>
          ))}
        </div>
      )}

      {/* New Thread Modal */}
      {showNewThread && (
        <div className="modal-overlay" onClick={() => setShowNewThread(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowNewThread(false)} style={{
              position: "absolute", top: 12, right: 16, background: "none", border: "none",
              fontSize: 22, cursor: "pointer", color: C.brownLight, fontFamily: "serif",
            }}>×</button>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: C.brown, marginBottom: 20 }}>
              Start a New Topic
            </h3>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, color: C.inkLight, fontWeight: 600, display: "block", marginBottom: 4 }}>Title</label>
              <input
                placeholder="What's on your mind?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, color: C.inkLight, fontWeight: 600, display: "block", marginBottom: 4 }}>Details</label>
              <textarea
                rows="5"
                placeholder="Share your thoughts, ask a question, propose an idea..."
                style={{ resize: "vertical" }}
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </div>
            <button
              className="craft-btn-primary"
              style={{ width: "100%", cursor: "pointer", border: "none", opacity: submitting || !title.trim() || !body.trim() ? 0.6 : 1 }}
              onClick={handleCreate}
              disabled={submitting || !title.trim() || !body.trim()}
            >
              {submitting ? "Posting..." : "Post Topic"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
