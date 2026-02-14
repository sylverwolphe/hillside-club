import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, serverTimestamp, orderBy, query, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";
import { useToast } from "../App";
import {
  C, HandDrawnBox, CraftDivider, ClubIllustration,
  PinNote, CalendarEvent, LockedCard, Modal,
} from "../theme";

const SEED_PINS = [
  { author: "Margaret W.", text: "The garden tour last Saturday was absolutely magical. Thank you to all who helped!", date: "Feb 4" },
  { author: "David K.", text: "Looking for a partner for the spring pottery workshop — anyone interested?", date: "Feb 2" },
  { author: "Sarah L.", text: "Don't forget: book club meets this Thursday! We're discussing Craftsman Homes.", date: "Jan 30" },
  { author: "Thomas R.", text: "Has anyone seen my green umbrella? Left it at the hall after the lecture.", date: "Jan 28" },
  { author: "Elena M.", text: "Welcome to our newest members! So glad to have you in our community.", date: "Jan 25" },
  { author: "James P.", text: "The woodworking bench in Studio B needs some attention — happy to help fix it this weekend.", date: "Jan 22" },
  { author: "Anne C.", text: "Beautiful Morris wallpaper samples arrived for the reading room. Come see!", date: "Jan 20" },
  { author: "Robert H.", text: "Proposing a sunset sketching group for February. Who's in?", date: "Jan 18" },
];

const EVENTS = [
  { month: "FEB", day: "14", title: "Valentine's Letterpress Workshop", time: "2:00 PM", location: "Print Studio", tag: "Workshop" },
  { month: "FEB", day: "18", title: "Winter Garden Walk & Pruning", time: "10:00 AM", location: "Club Gardens", tag: "Outdoors" },
  { month: "FEB", day: "22", title: "Arts & Crafts Film Night", time: "7:00 PM", location: "Main Hall", tag: "Social" },
  { month: "MAR", day: "01", title: "Spring Member Social", time: "5:00 PM", location: "Courtyard", tag: "Social" },
  { month: "MAR", day: "08", title: "Tile Glazing: Intro Course", time: "1:00 PM", location: "Studio A", tag: "Workshop" },
  { month: "MAR", day: "15", title: "Annual General Meeting", time: "6:00 PM", location: "Main Hall", tag: "Business" },
];

export default function Home() {
  const { user, setShowAuthModal } = useAuth();
  const navigate = useNavigate();
  const showToast = useToast();
  const [showPinModal, setShowPinModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [pinText, setPinText] = useState("");
  const [pinImageUrl, setPinImageUrl] = useState("");
  const [submittingPin, setSubmittingPin] = useState(false);

  // Event proposal form state
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventDesc, setEventDesc] = useState("");
  const [submittingEvent, setSubmittingEvent] = useState(false);

  // Live pins from Firestore, falling back to seeds
  const [pins, setPins] = useState(SEED_PINS);
  const [pinsLive, setPinsLive] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "pins"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        setPins(snap.docs.map((d) => {
          const data = d.data();
          const ts = data.createdAt?.toDate?.();
          const dateStr = ts ? ts.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "";
          return { id: d.id, author: data.authorName, text: data.text, date: dateStr, imageUrl: data.imageUrl || null };
        }));
        setPinsLive(true);
      }
    }, () => { /* Firestore unavailable, keep seeds */ });
    return unsub;
  }, []);

  const handleAddPin = async () => {
    if (!user || !pinText.trim()) return;
    setSubmittingPin(true);
    try {
      const pinData = {
        authorId: user.uid,
        authorName: user.displayName || user.email?.split("@")[0] || "Member",
        text: pinText.trim(),
        createdAt: serverTimestamp(),
      };
      if (pinImageUrl.trim()) {
        pinData.imageUrl = pinImageUrl.trim();
      }
      await addDoc(collection(db, "pins"), pinData);
      setPinText("");
      setPinImageUrl("");
      setShowPinModal(false);
      showToast?.("Pin added!");
    } catch (err) {
      console.error("Failed to add pin:", err);
      showToast?.("Failed to add pin", "error");
    }
    setSubmittingPin(false);
  };

  const handleProposeEvent = async () => {
    if (!user || !eventTitle.trim()) return;
    setSubmittingEvent(true);
    try {
      await addDoc(collection(db, "eventProposals"), {
        title: eventTitle.trim(),
        date: eventDate,
        time: eventTime,
        description: eventDesc.trim(),
        proposedBy: user.uid,
        proposerName: user.displayName || user.email?.split("@")[0] || "Member",
        status: "pending",
        createdAt: serverTimestamp(),
      });
      setEventTitle("");
      setEventDate("");
      setEventTime("");
      setEventDesc("");
      setShowEventModal(false);
      showToast?.("Event proposal submitted!");
    } catch (err) {
      console.error("Failed to propose event:", err);
      showToast?.("Failed to submit proposal", "error");
    }
    setSubmittingEvent(false);
  };

  // Section refs for scroll tracking (used by parent nav)
  const sectionRefs = {
    home: useRef(null),
    pinboard: useRef(null),
    membership: useRef(null),
    calendar: useRef(null),
    members: useRef(null),
  };

  return (
    <div>
      {/* HERO */}
      <section id="home" ref={sectionRefs.home} style={{ padding: "40px 20px 20px", maxWidth: 880, margin: "0 auto" }}>
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

      {/* PINBOARD */}
      <section id="pinboard" ref={sectionRefs.pinboard} style={{ padding: "48px 20px", maxWidth: 880, margin: "0 auto" }} className="section">
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
              <div key={pin.id || i} style={{ breakInside: "avoid", marginBottom: 16 }}>
                <PinNote note={pin} />
              </div>
            ))}
          </div>
        </HandDrawnBox>

        <div style={{ textAlign: "center", marginTop: 24 }}>
          <button className="craft-btn" onClick={() => user ? setShowPinModal(true) : setShowAuthModal(true)}>
            + Add a Pin
          </button>
          {!user && <p style={{ fontSize: 13, color: C.brownLight, marginTop: 8, fontStyle: "italic" }}>Log in to add your own note to the board</p>}
        </div>
      </section>

      {/* MEMBERSHIP */}
      <section id="membership" ref={sectionRefs.membership} style={{ padding: "48px 20px", maxWidth: 880, margin: "0 auto" }} className="section">
        <div style={{
          background: `linear-gradient(135deg, ${C.forestPale} 0%, ${C.cream} 100%)`,
          borderRadius: 8, padding: "40px 28px", border: `2px solid ${C.sage}`,
          filter: "url(#sketchy)", position: "relative", overflow: "hidden",
        }}>
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

      {/* CALENDAR */}
      <section id="calendar" ref={sectionRefs.calendar} style={{ padding: "48px 20px", maxWidth: 880, margin: "0 auto" }} className="section">
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 700, color: C.brown }}>
            Upcoming Events
          </h2>
          <p style={{ fontFamily: "'Caveat', cursive", fontSize: 18, color: C.terracotta, marginTop: 4 }}>
            gather, learn, create & celebrate together
          </p>
        </div>

        <HandDrawnBox fill={C.warmWhite} color={C.brown} strokeWidth={2} style={{ padding: "8px 24px", borderRadius: 6 }}>
          {EVENTS.map((event, i) => (
            <CalendarEvent key={i} event={event} />
          ))}
        </HandDrawnBox>

        <div style={{ textAlign: "center", marginTop: 24 }}>
          <button className="craft-btn" onClick={() => user ? setShowEventModal(true) : setShowAuthModal(true)}>
            ✦ Propose an Event
          </button>
          <p style={{ fontSize: 13, color: C.brownLight, marginTop: 8, fontStyle: "italic" }}>
            {user ? "Submit a proposal for the events calendar" : "Sign in to propose events"}
          </p>
        </div>
      </section>

      {/* MEMBER-ONLY */}
      <section id="members" ref={sectionRefs.members} style={{ padding: "48px 20px", maxWidth: 880, margin: "0 auto" }} className="section">
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 700, color: C.brown }}>
            Community Spaces
          </h2>
          <p style={{ fontFamily: "'Caveat', cursive", fontSize: 18, color: C.terracotta, marginTop: 4 }}>
            {user ? "explore your member spaces" : "browse our community spaces"}
          </p>
        </div>
        <div className="locked-grid">
          {/* Groups — always clickable */}
          <div
            onClick={() => navigate("/groups")}
            style={{
              padding: "32px 24px", background: C.forestPale, borderRadius: 6,
              border: `2px solid ${C.sage}`, textAlign: "center", cursor: "pointer",
              transition: "transform 0.2s ease", minHeight: 160,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>🏡</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: C.forest }}>Groups</div>
            <div style={{ fontSize: 14, color: C.inkLight, marginTop: 4 }}>Find your people in interest-based circles</div>
          </div>

          {/* Forum — always clickable */}
          <div
            onClick={() => navigate("/forum")}
            style={{
              padding: "32px 24px", background: C.forestPale, borderRadius: 6,
              border: `2px solid ${C.sage}`, textAlign: "center", cursor: "pointer",
              transition: "transform 0.2s ease", minHeight: 160,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: C.forest }}>Forum</div>
            <div style={{ fontSize: 14, color: C.inkLight, marginTop: 4 }}>Ongoing conversations & member discussions</div>
          </div>

          {/* Yearbook — coming soon */}
          <div
            style={{
              padding: "32px 24px", background: C.cream, borderRadius: 6,
              border: `2px solid ${C.parchmentDark}`, textAlign: "center", minHeight: 160,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              opacity: 0.7,
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>📖</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: C.ink }}>Yearbook</div>
            <div style={{ fontSize: 14, color: C.inkLight, marginTop: 4 }}>Coming soon</div>
          </div>
        </div>
        {!user && (
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <p style={{ fontSize: 13, color: C.brownLight, fontStyle: "italic" }}>
              Sign in to post, create groups, and join the conversation
            </p>
          </div>
        )}
      </section>

      {/* FOOTER */}
      <div style={{ textAlign: "center", padding: "40px 20px 100px", maxWidth: 880, margin: "0 auto" }}>
        <CraftDivider />
        <p style={{ fontSize: 14, color: C.brownLight, marginTop: 20, fontFamily: "'Playfair Display', serif" }}>
          The Hillside Club · Berkeley, California · Est. 1898
        </p>
        <p style={{ fontSize: 12, color: C.brownLight, marginTop: 6, opacity: 0.6 }}>
          This is a community engagement site, not the official Hillside Club website.
        </p>
      </div>

      {/* PIN MODAL */}
      <Modal open={showPinModal} onClose={() => setShowPinModal(false)}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: C.brown, marginBottom: 20 }}>
          Pin a Note
        </h3>
        {user ? (
          <>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, color: C.inkLight, fontWeight: 600, display: "block", marginBottom: 4 }}>Posting as</label>
              <div style={{ fontSize: 16, color: C.forest, fontFamily: "'Caveat', cursive", fontWeight: 700 }}>
                {user.displayName || user.email}
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, color: C.inkLight, fontWeight: 600, display: "block", marginBottom: 4 }}>Your Note</label>
              <textarea
                rows="4"
                placeholder="Share a thought, a question, or a hello..."
                style={{ resize: "vertical" }}
                value={pinText}
                onChange={(e) => setPinText(e.target.value)}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, color: C.inkLight, fontWeight: 600, display: "block", marginBottom: 4 }}>Image URL (optional)</label>
              <input
                placeholder="https://example.com/photo.jpg"
                value={pinImageUrl}
                onChange={(e) => setPinImageUrl(e.target.value)}
              />
            </div>
            <button
              className="craft-btn-primary"
              style={{ width: "100%", cursor: "pointer", border: "none", opacity: submittingPin || !pinText.trim() ? 0.6 : 1 }}
              onClick={handleAddPin}
              disabled={submittingPin || !pinText.trim()}
            >
              {submittingPin ? "Pinning..." : "Pin It!"}
            </button>
          </>
        ) : (
          <>
            <div style={{
              background: C.cream, border: `1.5px dashed ${C.gold}`, borderRadius: 6, padding: "12px 16px",
              marginBottom: 20, textAlign: "center",
            }}>
              <p style={{ fontFamily: "'Caveat', cursive", fontSize: 16, color: C.brownLight }}>
                Please log in to post. Pinning is for members only!
              </p>
            </div>
            <button className="craft-btn-primary" style={{ width: "100%", cursor: "pointer", border: "none" }} onClick={() => { setShowPinModal(false); setShowAuthModal(true); }}>
              Sign In to Pin
            </button>
          </>
        )}
      </Modal>

      {/* EVENT PROPOSAL MODAL */}
      <Modal open={showEventModal} onClose={() => setShowEventModal(false)}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: C.brown, marginBottom: 20 }}>
          Propose an Event
        </h3>
        {user ? (
          <>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, color: C.inkLight, fontWeight: 600, display: "block", marginBottom: 4 }}>Event Title</label>
              <input
                placeholder="e.g. Spring Watercolor Session"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
              />
            </div>
            <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 13, color: C.inkLight, fontWeight: 600, display: "block", marginBottom: 4 }}>Date</label>
                <input
                  type="date"
                  style={{ fontFamily: "'EB Garamond', serif", fontSize: 16 }}
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 13, color: C.inkLight, fontWeight: 600, display: "block", marginBottom: 4 }}>Time</label>
                <input
                  type="time"
                  style={{ fontFamily: "'EB Garamond', serif", fontSize: 16 }}
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                />
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, color: C.inkLight, fontWeight: 600, display: "block", marginBottom: 4 }}>Description</label>
              <textarea
                rows="3"
                placeholder="What's your event about?"
                style={{ resize: "vertical" }}
                value={eventDesc}
                onChange={(e) => setEventDesc(e.target.value)}
              />
            </div>
            <button
              className="craft-btn-primary"
              style={{ width: "100%", cursor: "pointer", border: "none", opacity: submittingEvent || !eventTitle.trim() ? 0.6 : 1 }}
              onClick={handleProposeEvent}
              disabled={submittingEvent || !eventTitle.trim()}
            >
              {submittingEvent ? "Submitting..." : "Submit Proposal"}
            </button>
          </>
        ) : (
          <>
            <div style={{
              background: C.cream, border: `1.5px dashed ${C.terracotta}`, borderRadius: 6, padding: "12px 16px",
              marginBottom: 20, textAlign: "center",
            }}>
              <p style={{ fontFamily: "'Caveat', cursive", fontSize: 16, color: C.brownLight }}>
                Sign in to propose events for the calendar
              </p>
            </div>
            <button className="craft-btn-primary" style={{ width: "100%", cursor: "pointer", border: "none" }} onClick={() => { setShowEventModal(false); setShowAuthModal(true); }}>
              Sign In to Propose
            </button>
          </>
        )}
      </Modal>
    </div>
  );
}
