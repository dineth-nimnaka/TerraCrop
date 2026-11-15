import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  doc,
  getDoc,
  collection,
  query,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  increment,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { useAuth } from '../../../hooks/useAuth';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { ErrorState } from '../../../components/ui/ErrorState';
import type { CommunityPost, CommunityReply } from '../../../types/index';

export const PostDetailPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState<CommunityPost | null>(null);
  const [replies, setReplies] = useState<CommunityReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Reply Form State
  const [replyContent, setReplyContent] = useState('');
  const [replying, setReplying] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  // Report Modal State
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reporting, setReporting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  const loadPostAndReplies = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    try {
      const postRef = doc(db, 'communityPosts', postId);
      const postSnap = await getDoc(postRef);

      if (!postSnap.exists()) {
        setPost(null);
        setError('This discussion does not exist or has been removed.');
        setLoading(false);
        return;
      }

      const postData = postSnap.data();
      setPost({
        id: postSnap.id,
        title: postData.title,
        content: postData.content,
        category: postData.category,
        district: postData.district,
        authorUid: postData.authorUid,
        authorDisplayName: postData.authorDisplayName || 'Farmer',
        replyCount: postData.replyCount || 0,
        createdAt: postData.createdAt,
      } as CommunityPost);

      // Load replies
      const repliesRef = collection(db, 'communityPosts', postId, 'replies');
      const q = query(repliesRef, orderBy('createdAt', 'asc'));
      const repliesSnap = await getDocs(q);

      const loadedReplies: CommunityReply[] = repliesSnap.docs.map((d) => ({
        id: d.id,
        content: d.data().content,
        authorUid: d.data().authorUid,
        authorDisplayName: d.data().authorDisplayName || 'Farmer',
        createdAt: d.data().createdAt,
      }));

      setReplies(loadedReplies);
      setError(null);
    } catch (err) {
      console.error('Error fetching post:', err);
      setError('Failed to load discussion details.');
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    loadPostAndReplies();
  }, [loadPostAndReplies]);

  const handleAddReply = async (e: React.FormEvent) => {
    e.preventDefault();
    setReplyError(null);

    if (!user) {
      setReplyError('You must be signed in to reply.');
      return;
    }

    if (!user.emailVerified) {
      setReplyError(
        'Your email must be verified before you can post replies. Please check your inbox.',
      );
      return;
    }

    const trimmed = replyContent.trim();
    if (!trimmed) {
      setReplyError('Reply cannot be empty.');
      return;
    }

    if (trimmed.length > 2000) {
      setReplyError('Reply cannot exceed 2000 characters.');
      return;
    }

    setReplying(true);
    try {
      if (!postId) return;

      const repliesRef = collection(db, 'communityPosts', postId, 'replies');
      await addDoc(repliesRef, {
        content: trimmed,
        authorUid: user.uid,
        authorDisplayName: user.displayName || user.email?.split('@')[0] || 'Farmer',
        createdAt: serverTimestamp(),
      });

      // Increment reply counter on post doc
      const postRef = doc(db, 'communityPosts', postId);
      await updateDoc(postRef, {
        replyCount: increment(1),
      });

      setReplyContent('');
      await loadPostAndReplies();
    } catch (err: unknown) {
      const e = err as Error;
      setReplyError(e.message || 'Failed to submit reply. Please try again.');
    } finally {
      setReplying(false);
    }
  };

  const handleReportPost = async () => {
    if (!user || !postId) return;
    if (!reportReason.trim()) return;

    setReporting(true);
    try {
      const reportsRef = collection(db, 'communityReports');
      await addDoc(reportsRef, {
        postId,
        reporterUid: user.uid,
        reason: reportReason.trim(),
        createdAt: serverTimestamp(),
      });
      setReportSuccess(true);
      setTimeout(() => {
        setReportSuccess(false);
        setReportModalOpen(false);
        setReportReason('');
      }, 2000);
    } catch (err) {
      console.error('Failed to submit report:', err);
    } finally {
      setReporting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16">
        <LoadingSpinner size="lg" label="Loading discussion..." />
      </div>
    );
  }

  if (error || !post) {
    return (
      <ErrorState
        title="Discussion not found"
        message={error || 'Unable to display topic.'}
        onRetry={() => navigate('/community')}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Breadcrumbs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs text-[#475569]">
          <Link to="/community" className="hover:text-[#1B4332]">
            Community
          </Link>
          <span>/</span>
          <span className="text-[#0F172A] font-semibold truncate max-w-xs">
            {post.title}
          </span>
        </div>

        <button
          onClick={() => setReportModalOpen(true)}
          type="button"
          className="text-xs text-slate-400 hover:text-red-600 transition-colors flex items-center space-x-1"
        >
          <span>⚠️</span>
          <span>Report Topic</span>
        </button>
      </div>

      {/* Main Post Card */}
      <Card className="p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold bg-[#E0F2FE] text-[#0369A1] px-2.5 py-0.5 rounded-full capitalize">
              {post.category.replace('_', ' ')}
            </span>
            {post.district && (
              <span className="text-xs font-medium bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">
                📍 {post.district}
              </span>
            )}
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {post.createdAt?.toDate
              ? post.createdAt.toDate().toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : 'Recently'}
          </span>
        </div>

        <h1 className="text-2xl font-bold text-[#0F172A] leading-tight">
          {post.title}
        </h1>

        <div className="text-base text-slate-700 leading-relaxed whitespace-pre-wrap">
          {post.content}
        </div>

        <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
          <span>
            Posted by <strong className="text-slate-700">{post.authorDisplayName}</strong>
          </span>
          <span className="font-semibold text-[#1B4332]">
            {replies.length} {replies.length === 1 ? 'Response' : 'Responses'}
          </span>
        </div>
      </Card>

      {/* Replies Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#0F172A]">
          Discussion Replies ({replies.length})
        </h2>

        {replies.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-sm">
            No responses yet. Share your experience or advice below.
          </div>
        ) : (
          <div className="space-y-3">
            {replies.map((reply) => (
              <Card key={reply.id} className="p-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-bold text-[#1B4332]">
                    {reply.authorDisplayName}
                  </span>
                  <span>
                    {reply.createdAt?.toDate
                      ? reply.createdAt.toDate().toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'Recently'}
                  </span>
                </div>
                <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {reply.content}
                </p>
              </Card>
            ))}
          </div>
        )}

        {/* Add Reply Card */}
        <Card className="p-5">
          <h3 className="text-sm font-bold text-[#0F172A] mb-3">
            Leave a Reply
          </h3>

          {!user?.emailVerified ? (
            <div className="p-4 bg-amber-50 rounded-xl text-xs text-amber-900 border border-amber-200">
              <strong>Email verification required:</strong> You must verify your email address to reply to discussions. Check your inbox or visit Settings.
            </div>
          ) : (
            <form onSubmit={handleAddReply} className="space-y-3">
              {replyError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                  {replyError}
                </div>
              )}

              <textarea
                rows={3}
                required
                maxLength={2000}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Share your agronomic observations, seed sources, or advice..."
                className="w-full p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1B4332] text-sm"
              />

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {replyContent.length} / 2000 chars
                </span>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={replying}
                >
                  Post Reply
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>

      {/* Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[20px] max-w-md w-full p-6 shadow-xl border border-slate-100">
            <h3 className="text-lg font-bold text-[#0F172A] mb-1">
              Report Community Topic
            </h3>
            <p className="text-xs text-[#475569] mb-4">
              Help keep TerraCrop helpful and safe. Please describe the issue with this post (spam, misleading advice, offensive content).
            </p>

            {reportSuccess ? (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold text-center">
                ✓ Report submitted. Thank you for your feedback.
              </div>
            ) : (
              <div className="space-y-4">
                <textarea
                  rows={3}
                  maxLength={500}
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Describe reason for reporting..."
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setReportModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    disabled={!reportReason.trim()}
                    loading={reporting}
                    onClick={handleReportPost}
                  >
                    Submit Report
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
