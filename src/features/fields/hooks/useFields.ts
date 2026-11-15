import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  type DocumentData,
  type QuerySnapshot,
} from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { useAuth } from '../../../hooks/useAuth';
import { reverseGeocode } from '../../../services/nominatim';
import type { Field, FieldFormData } from '../../../types/index';

export function useFields() {
  const { user } = useAuth();
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setFields([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const fieldsRef = collection(db, 'users', user.uid, 'fields');

    const unsubscribe = onSnapshot(
      fieldsRef,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const loadedFields: Field[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            name: data.name ?? 'Unnamed Field',
            latitude: data.latitude,
            longitude: data.longitude,
            area: data.area ?? undefined,
            areaUnit: data.areaUnit ?? 'hectares',
            district: data.district ?? undefined,
            village: data.village ?? undefined,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          } as Field;
        });

        // Client-side sort by createdAt descending
        loadedFields.sort((a, b) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return timeB - timeA;
        });

        setFields(loadedFields);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching fields:', err);
        setError('Failed to load fields from cloud storage.');
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [user]);

  const addField = useCallback(
    async (formData: FieldFormData): Promise<string> => {
      if (!user) throw new Error('You must be signed in to add a field.');

      let { district, village } = formData;

      // If district/village not provided, try reverse geocoding
      if (!district && !village) {
        try {
          const geo = await reverseGeocode(formData.latitude, formData.longitude);
          district = geo.district;
          village = geo.village;
        } catch (geoErr) {
          console.warn('Reverse geocoding failed:', geoErr);
        }
      }

      const fieldsRef = collection(db, 'users', user.uid, 'fields');
      const docRef = await addDoc(fieldsRef, {
        name: formData.name.trim(),
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        area: formData.area ? Number(formData.area) : null,
        areaUnit: formData.areaUnit || 'hectares',
        district: district || null,
        village: village || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return docRef.id;
    },
    [user],
  );

  const updateField = useCallback(
    async (fieldId: string, formData: Partial<FieldFormData>): Promise<void> => {
      if (!user) throw new Error('You must be signed in to update a field.');

      const fieldDocRef = doc(db, 'users', user.uid, 'fields', fieldId);
      const updatePayload: Record<string, any> = {
        updatedAt: serverTimestamp(),
      };

      if (formData.name !== undefined) updatePayload.name = formData.name.trim();
      if (formData.latitude !== undefined) updatePayload.latitude = Number(formData.latitude);
      if (formData.longitude !== undefined) updatePayload.longitude = Number(formData.longitude);
      if (formData.area !== undefined) updatePayload.area = formData.area ? Number(formData.area) : null;
      if (formData.areaUnit !== undefined) updatePayload.areaUnit = formData.areaUnit;
      if (formData.district !== undefined) updatePayload.district = formData.district || null;
      if (formData.village !== undefined) updatePayload.village = formData.village || null;

      await updateDoc(fieldDocRef, updatePayload);
    },
    [user],
  );

  const deleteField = useCallback(
    async (fieldId: string): Promise<void> => {
      if (!user) throw new Error('You must be signed in to delete a field.');

      const fieldDocRef = doc(db, 'users', user.uid, 'fields', fieldId);
      await deleteDoc(fieldDocRef);
    },
    [user],
  );

  return {
    fields,
    loading,
    error,
    addField,
    updateField,
    deleteField,
  };
}
