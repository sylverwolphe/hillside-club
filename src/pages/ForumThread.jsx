import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  doc, getDoc, collection, addDoc, updateDoc, deleteDoc, deleteField,
  increment, serverTimestamp, orderBy, query, onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";
import { useToast } from "../App";
import { useCollection } from "../useFirestore";
import { C, HandDrawnBox, CraftDivider, SkeletonBlock } from "../theme";

export default function ForumThread() {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const { user, setShowAuthModal } = useAuth();
  const showToast = useToast();
  const [thread, setThread] = useState(null);
  const [loadingThread, setLoadingThread] = useState(true);
  const { docs: replies, loading: loadingReplies } = useCollection(
    `forumThreads/${threadId}/replies`,
    [orderBy("createdAt", "asc")]
  );
  const [replyBody, setReplyBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const repliesEndRef = useRef(null);

  // Edit/delete state
  const [editingThreadBody, setEditingThreadBody] = useState(null);
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editReplyText, setEditReplyText] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "forumThreads", threadId), (snap) => {
      if (snap.exists()) {
        setThread({ id: snap.id, ...snap.data() });
      }
      setLoadingThread(false);
    }, () => setLoadingThread(false));
    return unsub;
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
      // Create notification for thread author (if not replying to own thread)
      if (thread && thread.authorId !== user.uid) {
        try {
          await addDoc(collection(db, "notifications"), {
            recipientId: thread.authorId,
            type: "reply",
            referenceId: threadId,
            message: `${user.displayName || user.email?.split("@")[0] || "Someone"} replied to your thread "${thread.title}"`,
            read: false,
            createdAt: serverTimestamp(),
          });
        } catch (e) {
          // Non-critical, don't block reply
        }
      }
      setReplyBody("");
      showToast?.("Reply posted!");
      setTimeout(() => repliesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 200);
    } catch (err) {
      console.error("Failed to post reply:", err);
      showToast?.("Failed to post reply", "error");
    }
    setSubmitting(false);
  };

  // Like toggle for thread
  const handleLikeThread = async () => {
    if (!user) { setShowAuthModal(true); return; }
    const ref = doc(db, "forumThreads", threadId);
    const liked = thread?.likes?.[user.uid];
    try {
      if (liked) {
        await updateDoc(ref, { [`likes.${user.uid}`]: deleteField() });
      } else {
        await updateDoc(ref, { [`likes.${user.uid}`]: true });
      }
    } catch (err) {
      console.error("Failed to toggle like:", err);
    }
  };

  // Like toggle for reply
  const handleLikeReply = async (replyId, replyLikes) => {
    if (!user) { setShowAuthModal(true); return; }
    const ref = doc(db, "forumThreads", threadId, "replies", replyId);
    const liked = replyLikes?.[user.uid];
    try {
      if (liked) {
        await updateDoc(ref, { [`likes.${user.uid}`]: deleteField() });
      } else {
        await updateDoc(ref, { [`likes.${user.uid}`]: true });
      }
    } catch (err) {
      console.error("Failed to toggle like:", err);
    }
  };

  // Edit thread body
  const handleSaveThreadEdit = async () => {
    if (!editingThreadBody?.trim()) return;
    try {
      await updateDoc(doc(db, "forumThreads", threadId), { body: editingThreadBody.trim() });
      setEditingThreadBody(null);
      showToast?.("Post updated!");
    } catch (err) {
      console.error("Failed to edit thread:", err);
      showToast?.("Failed to update post", "error");
    }
  };

  // Delete thread
  const handleDeleteThread = async () => {
    if (!window.confirm("Delete this thread? This cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, "forumThreads", threadId));
      showToast?.("Thread deleted");
      navigate("/forum");
    } catch (err) {
      console.error("Failed to delete thread:", err);
      showToast?.("Failed to delete thread", "error");
    }
  };

  // Edit reply
  const handleSaveReplyEdit = async (replyId) => {
    if (!editReplyText.trim()) return;
    try {
      await updateDoc(doc(db, "forumThreads", threadId, "replies", replyId), { body: editReplyText.trim() });
      setEditingReplyId(null);
      setEditReplyText("");
      showToast?.("Reply updated!");
    } catch (err) {
      console.error("Failed to edit reply:", err);
      showToast?.("Failed to update reply", "error");
    }
  };

  // Delete reply
  const handleDeleteReply = async (replyId) => {
    if (!window.confirm("Delete this reply?")) return;
    try {
      await deleteDoc(doc(db, "forumThreads", threadId, "replies", replyId));
      await updateDoc(doc(db, "forumThreads", threadId), {
        replyCount: increment(-1),
      });
      showToast?.("Reply deleted");
    } catch (err) {
      console.error("Failed to delete reply:", err);
      showToast?.("Failed to delete reply", "error");
    }
  };

  const formatDate = (ts) => {
    if (!ts?.toDate) return "";
    const d = ts.toDate();
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  };

  const likeCount = (likes) => Object.keys(likes || {}).length;
  const isLiked = (likes) => user && likes?.[user.uid];

  const LikeButton = ({ likes, onClick }) => (
    <button
      onClick={onClick}
      style={{
        background: "none", border: "none", cursor: "pointer", display: "inline-flex",
        alignItems: "center", gap: 4, fontSize: 13, padding: "4px 8px", borderRadius: 12,
        color: isLiked(likes) ? C.terracotta : C.brownLight,
        transition: "color 0.2s",
      }}
    >
      <svg viewBox="0 0 20 20" width="16" height="16" fill={isLiked(likes) ? C.terracotta : "none"} stroke={isLiked(likes) ? C.terracotta : C.brownLight} strokeWidth="2">
        <path d="M10 17S2 12 2 7.5C2 4.5 4.5 2 7 2c1.5 0 2.5.8 3 2 .5-1.2 1.5-2 3-2 2.5 0 5 2.5 5 5.5C18 12 10 17 10 17z" />
      </svg>
      {likeCount(likes) > 0 && <span>{likeCount(likes)}</span>}
    </button>
  );

  if (loadingThread) {
    return (
      <div style={{ padding: "40px 20px 100px", maxWidth: 700, margin: "0 auto" }}>
        <SkeletonBlock width="30%" height={14} style={{ marginBottom: 20 }} />
        <HandDrawnBox fill={C.warmWhite} color={C.forest} strokeWidth={2} style={{ padding: "24px 28px", borderRadius: 6, marginBottom: 28 }}>
          <SkeletonBlock width="70%" height={24} style={{ marginBottom: 12 }} />
          <SkeletonBlock width="40%" height={13} style={{ marginBottom: 16 }} />
          <SkeletonBlock width="100%" height={16} style={{ marginBottom: 6 }} />
          <SkeletonBlock width="80%" height={16} />
        </HandDrawnBox>
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

  const isThreadAuthor = user && thread.authorId === user.uid;

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
        {editingThreadBody !== null ? (
          <div>
            <textarea
              rows="4"
              value={editingThreadBody}
              onChange={(e) => setEditingThreadBody(e.target.value)}
              style={{
                width: "100%", padding: "10px 14px", border: `1.5px solid ${C.parchmentDark}`, borderRadius: 4,
                fontFamily: "'EB Garamond', serif", fontSize: 16, background: C.cream, color: C.ink,
                outline: "none", resize: "vertical", boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 8, justifyContent: "flex-end" }}>
              <button className="craft-btn" style={{ fontSize: 13, padding: "6px 16px" }} onClick={() => setEditingThreadBody(null)}>Cancel</button>
              <button className="craft-btn-primary" style={{ fontSize: 13, padding: "6px 16px", border: "none", cursor: "pointer" }} onClick={handleSaveThreadEdit}>Save</button>
            </div>
          </div>
        ) : (
          <p style={{ fontSize: 16, color: C.ink, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
            {thread.body}
          </p>
        )}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
          <LikeButton likes={thread.likes} onClick={handleLikeThread} />
          {isThreadAuthor && editingThreadBody === null && (
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setEditingThreadBody(thread.body)}
                style={{ background: "none", border: "none", color: C.forest, cursor: "pointer", fontSize: 13, fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
              >
                Edit
              </button>
              <button
                onClick={handleDeleteThread}
                style={{ background: "none", border: "none", color: C.rust, cursor: "pointer", fontSize: 13, fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
              >
                Delete
              </button>
            </div>
          )}
        </div>
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
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
          {[1, 2].map((i) => (
            <div key={i} style={{ padding: "16px 20px", background: C.cream, borderRadius: 6, borderLeft: `3px solid ${C.sage}` }}>
              <SkeletonBlock width="30%" height={13} style={{ marginBottom: 8 }} />
              <SkeletonBlock width="90%" height={15} style={{ marginBottom: 4 }} />
              <SkeletonBlock width="60%" height={15} />
            </div>
          ))}
        </div>
      ) : replies.length === 0 ? (
        <p style={{ color: C.brownLight, fontStyle: "italic", marginBottom: 20, fontFamily: "'Caveat', cursive", fontSize: 18 }}>
          No replies yet — be the first to respond!
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
          {replies.map((reply) => {
            const isReplyAuthor = user && reply.authorId === user.uid;
            const isEditing = editingReplyId === reply.id;
            return (
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
                {isEditing ? (
                  <div>
                    <textarea
                      rows="3"
                      value={editReplyText}
                      onChange={(e) => setEditReplyText(e.target.value)}
                      style={{
                        width: "100%", padding: "10px 14px", border: `1.5px solid ${C.parchmentDark}`, borderRadius: 4,
                        fontFamily: "'EB Garamond', serif", fontSize: 15, background: C.warmWhite, color: C.ink,
                        outline: "none", resize: "vertical", boxSizing: "border-box",
                      }}
                    />
                    <div style={{ display: "flex", gap: 8, marginTop: 8, justifyContent: "flex-end" }}>
                      <button className="craft-btn" style={{ fontSize: 12, padding: "4px 12px" }} onClick={() => { setEditingReplyId(null); setEditReplyText(""); }}>Cancel</button>
                      <button className="craft-btn-primary" style={{ fontSize: 12, padding: "4px 12px", border: "none", cursor: "pointer" }} onClick={() => handleSaveReplyEdit(reply.id)}>Save</button>
                    </div>
                  </div>
                ) : (
                  <p style={{ fontSize: 15, color: C.ink, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                    {reply.body}
                  </p>
                )}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
                  <LikeButton likes={reply.likes} onClick={() => handleLikeReply(reply.id, reply.likes)} />
                  {isReplyAuthor && !isEditing && (
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => { setEditingReplyId(reply.id); setEditReplyText(reply.body); }}
                        style={{ background: "none", border: "none", color: C.forest, cursor: "pointer", fontSize: 12, fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteReply(reply.id)}
                        style={{ background: "none", border: "none", color: C.rust, cursor: "pointer", fontSize: 12, fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div ref={repliesEndRef} />

      {/* Reply composer */}
      {user ? (
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
      ) : (
        <div style={{ textAlign: "center", padding: "20px", background: C.forestPale, borderRadius: 6 }}>
          <p style={{ fontFamily: "'Caveat', cursive", fontSize: 18, color: C.forest, marginBottom: 8 }}>
            Sign in to reply to this thread
          </p>
          <button
            className="craft-btn-primary"
            style={{ border: "none", cursor: "pointer", fontSize: 14, padding: "8px 20px" }}
            onClick={() => setShowAuthModal(true)}
          >
            Sign In to Reply
          </button>
        </div>
      )}
    </div>
  );
}
