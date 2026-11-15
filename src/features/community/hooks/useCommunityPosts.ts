import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  serverTimestamp,
  startAfter,
  type DocumentSnapshot,
  type QueryConstraint,
} from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { useAuth } from '../../../hooks/useAuth';
import type {
  CommunityPost,
  PostCategory,
} from '../../../types/index';

const PAGE_SIZE = 10;

export function useCommunityPosts(
  selectedCategory?: PostCategory | 'all',
  selectedDistrict?: string,
) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);

  const fetchPosts = useCallback(
    async (isLoadMore = false) => {
      if (isLoadMore) {
        if (!lastDoc || loadingMore) return;
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
      }

      try {
        const postsRef = collection(db, 'communityPosts');
        const constraints: QueryConstraint[] = [];

        if (selectedCategory && selectedCategory !== 'all') {
          constraints.push(where('category', '==', selectedCategory));
        }

        if (selectedDistrict && selectedDistrict !== 'all') {
          constraints.push(where('district', '==', selectedDistrict));
        }

        constraints.push(orderBy('createdAt', 'desc'));

        if (isLoadMore && lastDoc) {
          constraints.push(startAfter(lastDoc));
        }

        constraints.push(limit(PAGE_SIZE));

        const q = query(postsRef, ...constraints);
        const snapshot = await getDocs(q);

        const loaded: CommunityPost[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            title: data.title ?? '',
            content: data.content ?? '',
            category: data.category ?? 'crop_question',
            district: data.district ?? undefined,
            authorUid: data.authorUid,
            authorDisplayName: data.authorDisplayName || 'Farmer',
            replyCount: data.replyCount ?? 0,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          } as CommunityPost;
        });

        if (isLoadMore) {
          setPosts((prev) => [...prev, ...loaded]);
        } else {
          setPosts(loaded);
        }

        setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
        setHasMore(snapshot.docs.length === PAGE_SIZE);
      } catch (err) {
        console.error('Error fetching community posts:', err);
        setError('Failed to load community discussions.');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [selectedCategory, selectedDistrict, lastDoc, loadingMore],
  );

  useEffect(() => {
    fetchPosts(false);
  }, [selectedCategory, selectedDistrict]);

  const createPost = useCallback(
    async (data: {
      title: string;
      content: string;
      category: PostCategory;
      district?: string;
    }): Promise<string> => {
      if (!user) throw new Error('You must be signed in to post.');
      if (!user.emailVerified) {
        throw new Error(
          'Email verification is required before you can publish community posts. Please check your inbox or visit Settings to resend verification.',
        );
      }

      const postsRef = collection(db, 'communityPosts');
      // NOTE: Strictly writing ONLY allowed public attributes, NEVER GPS coordinates or roles
      const docRef = await addDoc(postsRef, {
        title: data.title.trim(),
        content: data.content.trim(),
        category: data.category,
        district: data.district?.trim() || null,
        authorUid: user.uid,
        authorDisplayName: user.displayName || user.email?.split('@')[0] || 'Farmer',
        replyCount: 0,
        createdAt: serverTimestamp(),
      });

      await fetchPosts(false);
      return docRef.id;
    },
    [user, fetchPosts],
  );

  const reportPost = useCallback(
    async (postId: string, reason: string): Promise<void> => {
      if (!user) throw new Error('You must be signed in to report a post.');

      const reportsRef = collection(db, 'communityReports');
      await addDoc(reportsRef, {
        postId,
        reporterUid: user.uid,
        reason: reason.trim(),
        createdAt: serverTimestamp(),
      });
    },
    [user],
  );

  return {
    posts,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore: () => fetchPosts(true),
    refresh: () => fetchPosts(false),
    createPost,
    reportPost,
  };
}
