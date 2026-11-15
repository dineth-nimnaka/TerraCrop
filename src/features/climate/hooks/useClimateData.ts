import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { useAuth } from '../../../hooks/useAuth';
import { fetchClimateData } from '../../../services/nasaPower';
import type { ClimateData } from '../../../types/index';

const CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

export function useClimateData(
  fieldId?: string,
  latitude?: number,
  longitude?: number,
) {
  const { user } = useAuth();
  const [data, setData] = useState<ClimateData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCached, setIsCached] = useState(false);

  const loadData = useCallback(
    async (forceRefresh = false) => {
      if (!latitude || !longitude || !fieldId || !user) {
        return;
      }

      setLoading(true);
      setError(null);

      const cacheDocRef = doc(db, 'users', user.uid, 'climateCache', fieldId);

      // Check cache unless forceRefresh is true
      if (!forceRefresh) {
        try {
          const cacheSnap = await getDoc(cacheDocRef);
          if (cacheSnap.exists()) {
            const cachedDoc = cacheSnap.data();
            const fetchedAt = cachedDoc.fetchedAt instanceof Timestamp
              ? cachedDoc.fetchedAt.toDate()
              : new Date(cachedDoc.fetchedAt);

            const age = Date.now() - fetchedAt.getTime();
            if (age < CACHE_MAX_AGE_MS && cachedDoc.daily && cachedDoc.summary) {
              setData({
                parameters: cachedDoc.parameters || {},
                latitude: cachedDoc.latitude,
                longitude: cachedDoc.longitude,
                startDate: cachedDoc.startDate,
                endDate: cachedDoc.endDate,
                fetchedAt,
                daily: cachedDoc.daily,
                summary: cachedDoc.summary,
              });
              setIsCached(true);
              setLoading(false);
              return;
            }
          }
        } catch (cacheErr) {
          console.warn('Error reading climate cache:', cacheErr);
        }
      }

      // Fetch fresh data from NASA POWER API
      try {
        const freshData = await fetchClimateData(latitude, longitude, 90);
        setData(freshData);
        setIsCached(false);

        // Store in Firestore cache
        try {
          await setDoc(cacheDocRef, {
            parameters: freshData.parameters,
            latitude: freshData.latitude,
            longitude: freshData.longitude,
            startDate: freshData.startDate,
            endDate: freshData.endDate,
            fetchedAt: Timestamp.fromDate(freshData.fetchedAt),
            daily: freshData.daily,
            summary: freshData.summary,
          });
        } catch (saveCacheErr) {
          console.warn('Could not write climate cache to Firestore:', saveCacheErr);
        }
      } catch (apiErr: unknown) {
        const err = apiErr as Error;
        console.error('NASA POWER API failed:', err);
        setError(
          `Unable to retrieve NASA POWER climate data: ${err.message}. Please check your connection or retry later.`,
        );
      } finally {
        setLoading(false);
      }
    },
    [fieldId, latitude, longitude, user],
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refetch = useCallback(() => {
    return loadData(true);
  }, [loadData]);

  return {
    data,
    loading,
    error,
    isCached,
    refetch,
  };
}
