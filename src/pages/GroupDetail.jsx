import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  doc, getDoc, setDoc, deleteDoc, collection, addDoc, updateDoc,
  increment, serverTimestamp, orderBy, query, onSnapshot, where, getDocs,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";
import { useToast } from "../App";
import { useCollection } from "../useFirestore";
import { C, HandDrawnBox, CraftDivider, SkeletonBlock } from "../theme";

export default function GroupDetail() {
  const { groupId } = useParams();
  const { user, setShowAuthModal } = useAuth();
  const showToast = useToast();
  const [group, setGroup] = useState(null);
  const [loadingGroup, setLoadingGroup] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [memberDocId, setMemberDocId] = useState(null);
  const [checkingMember, setCheckingMember] = useState(true);
  const [joiningLeaving, setJoiningLeaving] = useState(false);

  const { docs: members, loading: loadingMembers } = useCollection(
    `groups/${groupId}/members`,
    [orderBy("joinedAt", "asc")]
  );
  const { docs: messages, loading: loadingMessages } = useCollection(
    isMember ? `groups/${groupId}/messages` : null,
    [orderBy("createdAt", "asc")],
    isMember ? "member" : "none"
  );

  const [msgBody, setMsgBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch group info
  useEffect(() => {
    async function fetchGroup() {
      const snap = await getDoc(doc(db, "groups", groupId));
      if (snap.exists()) {
        setGroup({ id: snap.id, ...snap.data() });
      }
      setLoadingGroup(false);
    }
    fetchGroup();
  }, [groupId]);

  // Check membership
  useEffect(() => {
    if (!user) { setCheckingMember(false); setIsMember(false); setMemberDocId(null); return; }
    async function checkMembership() {
      const membersRef = collection(db, "groups", groupId, "members");
      const q = query(membersRef, where("uid", "==", user.uid));
      const snap = await getDocs(q);
      if (!snap.empty) {
        setIsMember(true);
        setMemberDocId(snap.docs[0].id);
      } else {
        setIsMember(false);
        setMemberDocId(null);
      }
      setCheckingMember(false);
    }
    checkMembership();
  }, [groupId, user]);

  // Auto-scroll messages
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 200);
    }
  }, [messages.length]);

  const handleJoin = async () => {
    if (!user) { setShowAuthModal(true); return; }
    setJoiningLeaving(true);
    try {
      await addDoc(collection(db, "groups", groupId, "members"), {
        uid: user.uid,
        displayName: user.displayName || user.email?.split("@")[0] || "Member",
        joinedAt: serverTimestamp(),
        role: "member",
      });
      await updateDoc(doc(db, "groups", groupId), { memberCount: increment(1) });
      setIsMember(true);
      // Refresh to get member doc ID
      const membersRef = collection(db, "groups", groupId, "members");
      const q = query(membersRef, where("uid", "==", user.uid));
      const snap = await getDocs(q);
      if (!snap.empty) setMemberDocId(snap.docs[0].id);
      showToast?.("Joined group!");
    } catch (err) {
      console.error("Failed to join:", err);
      showToast?.("Failed to join group", "error");
    }
    setJoiningLeaving(false);
  };

  const handleLeave = async () => {
    if (!memberDocId) return;
    setJoiningLeaving(true);
    try {
      await deleteDoc(doc(db, "groups", groupId, "members", memberDocId));
      await updateDoc(doc(db, "groups", groupId), { memberCount: increment(-1) });
      setIsMember(false);
      setMemberDocId(null);
      showToast?.("Left group");
    } catch (err) {
      console.error("Failed to leave:", err);
      showToast?.("Failed to leave group", "error");
    }
    setJoiningLeaving(false);
  };

  const handleSendMessage = async () => {
    if (!msgBody.trim() || !user) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, "groups", groupId, "messages"), {
        body: msgBody.trim(),
        authorId: user.uid,
        authorName: user.displayName || user.email?.split("@")[0] || "Member",
        createdAt: serverTimestamp(),
      });
      setMsgBody("");
    } catch (err) {
      console.error("Failed to send message:", err);
      showToast?.("Failed to send message", "error");
    }
    setSubmitting(false);
  };

  const formatTime = (ts) => {
    if (!ts?.toDate) return "";
    const d = ts.toDate();
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  };

  if (loadingGroup) {
    return (
      <div style={{ padding: "40px 20px 100px", maxWidth: 700, margin: "0 auto" }}>
        <SkeletonBlock width="30%" height={14} style={{ marginBottom: 20 }} />
        <HandDrawnBox fill={C.warmWhite} color={C.forest} strokeWidth={2} style={{ padding: "24px 28px", borderRadius: 6, marginBottom: 24 }}>
          <div style={{ textAlign: "center" }}>
            <SkeletonBlock width={48} height={48} style={{ margin: "0 auto 12px", borderRadius: "50%" }} />
            <SkeletonBlock width="50%" height={26} style={{ margin: "0 auto 8px" }} />
            <SkeletonBlock width="70%" height={14} style={{ margin: "0 auto" }} />
          </div>
        </HandDrawnBox>
      </div>
    );
  }

  if (!group) {
    return (
      <div style={{ padding: "60px 20px", maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: C.brown, marginBottom: 12 }}>
          Group Not Found
        </h2>
        <Link to="/groups" style={{ color: C.forest }}>Back to Groups</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px 20px 100px", maxWidth: 700, margin: "0 auto" }}>
      {/* Back link */}
      <Link to="/groups" style={{ color: C.forest, fontSize: 14, fontFamily: "'Playfair Display', serif", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 20 }}>
        ← Back to Groups
      </Link>

      {/* Group header */}
      <HandDrawnBox fill={C.warmWhite} color={C.forest} strokeWidth={2} style={{ padding: "24px 28px", borderRadius: 6, marginBottom: 24 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>{group.icon || "🌿"}</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: C.ink, marginBottom: 6 }}>
            {group.name}
          </h2>
          {group.description && (
            <p style={{ fontSize: 15, color: C.inkLight, lineHeight: 1.6, maxWidth: 400, margin: "0 auto 16px" }}>
              {group.description}
            </p>
          )}
          <div style={{ fontSize: 14, color: C.brownLight, marginBottom: 16, fontFamily: "'Caveat', cursive", fontWeight: 700 }}>
            {group.memberCount || members.length} {(group.memberCount || members.length) === 1 ? "member" : "members"}
          </div>
          {checkingMember ? null : isMember ? (
            <button
              className="craft-btn"
              style={{ fontSize: 13, padding: "6px 18px", opacity: joiningLeaving ? 0.6 : 1 }}
              onClick={handleLeave}
              disabled={joiningLeaving}
            >
              {joiningLeaving ? "Leaving..." : "Leave Group"}
            </button>
          ) : (
            <button
              className="craft-btn-primary"
              style={{ border: "none", cursor: "pointer", opacity: joiningLeaving ? 0.6 : 1 }}
              onClick={handleJoin}
              disabled={joiningLeaving}
            >
              {joiningLeaving ? "Joining..." : user ? "Join Group" : "Sign In to Join"}
            </button>
          )}
        </div>
      </HandDrawnBox>

      {/* Members list */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: C.brown, marginBottom: 12 }}>
          Members
        </h3>
        {loadingMembers ? (
          <div style={{ display: "flex", gap: 8 }}>
            {[1, 2, 3].map((i) => (
              <SkeletonBlock key={i} width={80} height={28} style={{ borderRadius: 12 }} />
            ))}
          </div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {members.map((m) => (
              <span
                key={m.id}
                style={{
                  padding: "4px 12px", background: C.forestPale, borderRadius: 12,
                  fontSize: 14, color: C.forest, fontFamily: "'Caveat', cursive", fontWeight: 700,
                }}
              >
                {m.displayName}
                {m.role === "admin" && <span style={{ fontSize: 10, marginLeft: 4, opacity: 0.6 }}>★</span>}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Discussion feed — only for members */}
      {isMember ? (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: C.brown }}>
              Discussion
            </h3>
            <div style={{ flex: 1, height: 1, background: C.parchmentDark }} />
          </div>

          <div style={{
            background: C.cream, borderRadius: 8, border: `1.5px solid ${C.parchmentDark}`,
            padding: "16px", maxHeight: 400, overflowY: "auto", marginBottom: 16,
          }}>
            {loadingMessages ? (
              <p style={{ color: C.brownLight, fontStyle: "italic", textAlign: "center" }}>Loading messages...</p>
            ) : messages.length === 0 ? (
              <p style={{ color: C.brownLight, fontStyle: "italic", textAlign: "center", fontFamily: "'Caveat', cursive", fontSize: 18 }}>
                No messages yet — start the conversation!
              </p>
            ) : (
              messages.map((msg) => {
                const isOwnMessage = user && msg.authorId === user.uid;
                return (
                  <div
                    key={msg.id}
                    style={{
                      marginBottom: 12,
                      textAlign: isOwnMessage ? "right" : "left",
                    }}
                  >
                    <div style={{
                      display: "inline-block", maxWidth: "80%", padding: "10px 14px",
                      background: isOwnMessage ? C.forestPale : C.warmWhite,
                      borderRadius: 12, textAlign: "left",
                      border: `1px solid ${isOwnMessage ? C.sage : C.parchmentDark}`,
                    }}>
                      <div style={{ fontSize: 12, color: C.brownLight, marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, color: C.forest }}>{msg.authorName}</span>
                        {" · "}
                        <span>{formatTime(msg.createdAt)}</span>
                      </div>
                      <p style={{ fontSize: 15, color: C.ink, lineHeight: 1.5, margin: 0, whiteSpace: "pre-wrap" }}>
                        {msg.body}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message composer */}
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
            <textarea
              rows="2"
              placeholder="Type a message..."
              style={{
                flex: 1, padding: "10px 14px", border: `1.5px solid ${C.parchmentDark}`, borderRadius: 8,
                fontFamily: "'Caveat', cursive", fontSize: 18, background: C.warmWhite, color: C.ink,
                outline: "none", resize: "none", boxSizing: "border-box",
              }}
              value={msgBody}
              onChange={(e) => setMsgBody(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <button
              className="craft-btn-primary"
              style={{
                border: "none", cursor: "pointer", padding: "10px 20px",
                opacity: submitting || !msgBody.trim() ? 0.6 : 1,
              }}
              onClick={handleSendMessage}
              disabled={submitting || !msgBody.trim()}
            >
              Send
            </button>
          </div>
        </div>
      ) : (
        <HandDrawnBox fill={C.cream} style={{ padding: "24px", textAlign: "center", borderRadius: 6 }}>
          <p style={{ fontFamily: "'Caveat', cursive", fontSize: 18, color: C.brownLight }}>
            {user
              ? "Join this group to see the discussion and post messages"
              : "Sign in and join this group to participate in the discussion"
            }
          </p>
          {!user && (
            <button
              className="craft-btn-primary"
              style={{ border: "none", cursor: "pointer", fontSize: 14, padding: "8px 20px", marginTop: 12 }}
              onClick={() => setShowAuthModal(true)}
            >
              Sign In
            </button>
          )}
        </HandDrawnBox>
      )}
    </div>
  );
}
