import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc, collection, addDoc, updateDoc, increment, serverTimestamp, orderBy, query, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";
import { useCollection } from "../useFirestore";
import { C, HandDrawnBox, CraftDivider } from "../theme";

export default function ForumThread() {
  const { threadId } = useParams();
  const { user, setShowAuthModal } = useAuth();
  const [thread, setThread] = useState(null);
  const [loadingThread, setLoadingThread] = useState(true);
  const { docs: replies, loading: loadingReplies } = useCollection(
    `forumThreads/${threadId}/replies`,
    [orderBy("createdAt", "asc")]
  );
  const [replyBody, setReplyBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const repliesEndRef = useRef(null);

  useEffect(() => {
    async function fetchThread() {
      const snap = await getDoc(doc(db, "forumThreads", threadId));
      if (snap.exists()) {
        setThread({ id: snap.id, ...snap.data() });
      }
      setLoadingThread(false);
    }
    fetchThread();
  }, [threadId]);

  const handleReply = async () => {
    if (!replyBody.trim() || !user) return;
    setSubmitting(true);
    try {
      const threadRef = doc(db, "forumThreads", threadId);
      await addDoc(collection(db, "forumThreads", threadId, "replies"), {
        body: replyBody.trim(),
        authorId: user.uid,
        authorName: user.displayName || user.email?.split("@")[0] || "Member",
        createdAt: serverTimestamp(),
      });
      await updateDoc(threadRef, {
        replyCount: increment(1),
        lastActivityAt: serverTimestamp(),
      });
      setReplyBody("");
      setTimeout(() => repliesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 200);
    } catch (err) {
      console.error("Failed to post reply:", err);
    }
    setSubmitting(false);
  };

  const formatDate = (ts) => {
    if (!ts?.toDate) return "";
    const d = ts.toDate();
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  };

  if (!user) {
    return (
      <div style={{ padding: "60px 20px", maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: C.brown, marginBottom: 12 }}>
          Member Forum
        </h2>
        <p style={{ color: C.inkLight, marginBottom: 24 }}>Sign in to read and participate in discussions</p>
        <button className="craft-btn-primary" style={{ border: "none", cursor: "pointer" }} onClick={() => setShowAuthModal(true)}>
          Sign In to Access
        </button>
      </div>
    );
  }

  if (loadingThread) {
    return (
      <div style={{ padding: "60px 20px", textAlign: "center" }}>
        <p style={{ color: C.brownLight, fontStyle: "italic" }}>Loading...</p>
      </div>
    );
  }

  if (!thread) {
    return (
      <div style={{ padding: "60px 20px", maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: C.brown, marginBottom: 12 }}>
          Thread Not Found
        </h2>
        <Link to="/forum" style={{ color: C.forest }}>Back to Forum</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px 20px 100px", maxWidth: 700, margin: "0 auto" }}>
      {/* Back link */}
      <Link to="/forum" style={{ color: C.forest, fontSize: 14, fontFamily: "'Playfair Display', serif", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 20 }}>
        ← Back to Forum
      </Link>

      {/* Original post */}
      <HandDrawnBox fill={C.warmWhite} color={C.forest} strokeWidth={2} style={{ padding: "24px 28px", borderRadius: 6, marginBottom: 28 }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: C.ink, marginBottom: 8 }}>
          {thread.title}
        </h2>
        <div style={{ display: "flex", gap: 8, fontSize: 13, color: C.brownLight, marginBottom: 16 }}>
          <span style={{ fontWeight: 600, color: C.forest }}>{thread.authorName}</span>
          <span>·</span>
          <span>{formatDate(thread.createdAt)}</span>
        </div>
        <p style={{ fontSize: 16, color: C.ink, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
          {thread.body}
        </p>
      </HandDrawnBox>

      {/* Replies header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: C.brown }}>
          Replies ({replies.length})
        </h3>
        <div style={{ flex: 1, height: 1, background: C.parchmentDark }} />
      </div>

      {/* Replies list */}
      {loadingReplies ? (
        <p style={{ color: C.brownLight, fontStyle: "italic" }}>Loading replies...</p>
      ) : replies.length === 0 ? (
        <p style={{ color: C.brownLight, fontStyle: "italic", marginBottom: 20, fontFamily: "'Caveat', cursive", fontSize: 18 }}>
          No replies yet — be the first to respond!
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
          {replies.map((reply) => (
            <div
              key={reply.id}
              style={{
                padding: "16px 20px", background: C.cream, borderRadius: 6,
                borderLeft: `3px solid ${C.sage}`,
              }}
            >
              <div style={{ display: "flex", gap: 8, fontSize: 13, color: C.brownLight, marginBottom: 8 }}>
                <span style={{ fontWeight: 600, color: C.forest }}>{reply.authorName}</span>
                <span>·</span>
                <span>{formatDate(reply.createdAt)}</span>
              </div>
              <p style={{ fontSize: 15, color: C.ink, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                {reply.body}
              </p>
            </div>
          ))}
        </div>
      )}
      <div ref={repliesEndRef} />

      {/* Reply composer */}
      <HandDrawnBox fill={C.warmWhite} style={{ padding: "20px 24px", borderRadius: 6 }}>
        <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, color: C.brown, marginBottom: 12 }}>
          Add a Reply
        </h4>
        <textarea
          rows="3"
          placeholder="Share your thoughts..."
          style={{
            width: "100%", padding: "10px 14px", border: `1.5px solid ${C.parchmentDark}`, borderRadius: 4,
            fontFamily: "'Caveat', cursive", fontSize: 18, background: C.cream, color: C.ink,
            outline: "none", resize: "vertical", boxSizing: "border-box",
          }}
          value={replyBody}
          onChange={(e) => setReplyBody(e.target.value)}
        />
        <div style={{ textAlign: "right", marginTop: 12 }}>
          <button
            className="craft-btn-primary"
            style={{ cursor: "pointer", border: "none", opacity: submitting || !replyBody.trim() ? 0.6 : 1 }}
            onClick={handleReply}
            disabled={submitting || !replyBody.trim()}
          >
            {submitting ? "Posting..." : "Reply"}
          </button>
        </div>
      </HandDrawnBox>
    </div>
  );
}
