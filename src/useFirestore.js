import { useState, useEffect } from "react";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Real-time Firestore collection listener.
 * @param {string} path - Collection path (e.g. "forumThreads" or "groups/abc/messages")
 * @param {Array} queryConstraints - Additional Firestore query constraints (orderBy, where, limit, etc.)
 * @returns {{ docs: Array, loading: boolean, error: Error|null }}
 */
export function useCollection(path, queryConstraints = []) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!path) {
      setDocs([]);
      setLoading(false);
      return;
    }

    const q = query(collection(db, ...path.split("/")), ...queryConstraints);
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        setDocs(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error("Firestore error:", err);
        setError(err);
        setLoading(false);
      }
    );
    return unsub;
    // Serialize constraints for dep comparison by using path as key
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  return { docs, loading, error };
}
