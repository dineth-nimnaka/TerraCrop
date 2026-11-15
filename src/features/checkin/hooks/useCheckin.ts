import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { useAuth } from '../../../hooks/useAuth';
import type { CheckinData } from '../../../types/index';

function sanitizeForFirestore(obj: Record<string, any>): Record<string, any> {
  const cleaned: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    // Firestore disallows 'undefined', replace with null
    cleaned[key] = val === undefined ? null : val;
  }
  return cleaned;
}

export function useCheckin(fieldId?: string) {
  const { user } = useAuth();
  const [checkin, setCheckin] = useState<CheckinData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCheckin = useCallback(async () => {
    if (!user || !fieldId) {
      setCheckin(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const checkinsRef = collection(db, 'users', user.uid, 'checkins');
      const q = query(checkinsRef, where('fieldId', '==', fieldId));
      const snap = await getDocs(q);

      if (!snap.empty) {
        const docData = snap.docs[0];
        setCheckin({
          id: docData.id,
          ...docData.data(),
        } as CheckinData);
      } else {
        setCheckin(null);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching check-in:', err);
      setError('Failed to load check-in record.');
    } finally {
      setLoading(false);
    }
  }, [user, fieldId]);

  useEffect(() => {
    loadCheckin();
  }, [loadCheckin]);

  const saveCheckin = useCallback(
    async (data: Omit<CheckinData, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
      if (!user) throw new Error('User must be signed in to save check-in.');
      if (!fieldId) throw new Error('Field ID is required.');

      const checkinsRef = collection(db, 'users', user.uid, 'checkins');
      const payload = sanitizeForFirestore({
        ...data,
        fieldId,
      });

      if (checkin?.id) {
        // Update existing
        const checkinDocRef = doc(db, 'users', user.uid, 'checkins', checkin.id);
        await updateDoc(checkinDocRef, {
          ...payload,
          updatedAt: serverTimestamp(),
        });
        await loadCheckin();
        return checkin.id;
      } else {
        // Create new
        const docRef = await addDoc(checkinsRef, {
          ...payload,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        await loadCheckin();
        return docRef.id;
      }
    },
    [user, fieldId, checkin, loadCheckin],
  );

  return {
    checkin,
    loading,
    error,
    saveCheckin,
    reload: loadCheckin,
  };
}
