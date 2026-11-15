import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useCommunityPosts } from '../hooks/useCommunityPosts';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ErrorState } from '../../../components/ui/ErrorState';
import type { PostCategory } from '../../../types/index';

const SRI_LANKA_DISTRICTS = [
  'Ampara',
  'Anuradhapura',
  'Badulla',
  'Batticaloa',
  'Colombo',
  'Galle',
  'Gampaha',
  'Hambantota',
  'Jaffna',
  'Kalutara',
  'Kandy',
  'Kegalle',
  'Kilinochchi',
  'Kurunegala',
  'Mannar',
  'Matale',
  'Matara',
  'Monaragala',
  'Mullaitivu',
  'Nuwara Eliya',
  'Polonnaruwa',
  'Puttalam',
  'Ratnapura',
  'Trincomalee',
  'Vavuniya',
];

const CATEGORIES: { id: PostCategory | 'all'; label: string; icon: string }[] = [
  { id: 'all', label: 'All Categories', icon: '🌐' },
  { id: 'crop_question', label: 'Crop Questions', icon: '❓' },
  { id: 'seed_availability', label: 'Seed Availability', icon: '🌱' },
  { id: 'market_information', label: 'Market & Prices', icon: '📈' },
];

export const CommunityPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [category, setCategory] = useState<PostCategory | 'all'>('all');
  const [district, setDistrict] = useState<string>('all');

  const {
    posts,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
  } = useCommunityPosts(category, district);

  const getCategoryBadge = (cat: PostCategory) => {
    switch (cat) {
      case 'crop_question':
        return (
          <span className="bg-emerald-100 text-[#1B4332] text-xs font-semibold px-2.5 py-0.5 rounded-full">
            Crop Question
          </span>
        );
      case 'seed_availability':
        return (
          <span className="bg-sky-100 text-[#0369A1] text-xs font-semibold px-2.5 py-0.5 rounded-full">
            Seed Availability
          </span>
        );
      case 'market_information':
        return (
          <span className="bg-amber-100 text-amber-900 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            Market Information
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
            Farmer Knowledge Exchange
          </h1>
          <p className="text-sm text-[#475569] mt-0.5">
            Connect with Sri Lankan farmers to ask agronomic questions, coordinate seeds, and share local market trends.
          </p>
        </div>

        <div>
          {user?.emailVerified ? (
            <Link to="/community/new">
              <Button
                variant="primary"
                size="md"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                }
              >
                Start New Topic
              </Button>
            </Link>
          ) : (
            <button
              onClick={() =>
                alert(
                  'Your email is not yet verified. Please verify your email via the link sent to your inbox before publishing discussions.',
                )
              }
              type="button"
              className="min-h-[48px] px-5 py-2.5 bg-slate-300 text-slate-700 rounded-xl font-medium cursor-not-allowed text-sm flex items-center space-x-1.5"
            >
              <span>🔒 Verification Required to Post</span>
            </button>
          )}
        </div>
      </div>

      {/* Email Verification Reminder Banner (if not verified) */}
      {!user?.emailVerified && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
          <div>
            <strong className="block font-bold mb-0.5">
              Email Verification Required to Post & Reply
            </strong>
            <span>
              You are signed in as {user?.email}. To prevent spam, community publishing requires a verified email address.
            </span>
          </div>
          <Link
            to="/settings"
            className="font-bold underline text-amber-950 hover:text-amber-800 whitespace-nowrap"
          >
            Go to Settings →
          </Link>
        </div>
      )}

      {/* Filter Controls Row */}
      <Card className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => {
            const isActive = category === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                  isActive
                    ? 'bg-[#1B4332] text-white shadow-xs'
                    : 'bg-slate-100 text-[#475569] hover:bg-slate-200'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* District Filter Dropdown */}
        <div className="flex items-center space-x-2">
          <label
            htmlFor="district-filter"
            className="text-xs font-semibold text-[#475569] whitespace-nowrap"
          >
            District:
          </label>
          <select
            id="district-filter"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="min-h-[42px] px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
          >
            <option value="all">All Regions (Island-wide)</option>
            {SRI_LANKA_DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Posts List */}
      {loading ? (
        <div className="py-16">
          <LoadingSpinner size="lg" label="Loading community posts..." />
        </div>
      ) : error ? (
        <ErrorState
          title="Could not load discussions"
          message={error}
          onRetry={() => window.location.reload()}
        />
      ) : posts.length === 0 ? (
        <EmptyState
          title="No discussions found"
          description={
            category !== 'all' || district !== 'all'
              ? 'No posts match your selected filters. Try broadening your category or district selection.'
              : 'Be the first farmer to start a discussion in the TerraCrop community!'
          }
          actionLabel={user?.emailVerified ? 'Start a Discussion' : undefined}
          onAction={() => navigate('/community/new')}
          icon={
            <svg className="w-8 h-8 text-[#1B4332]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          }
        />
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              to={`/community/${post.id}`}
              className="block group"
            >
              <Card
                hoverable
                className="p-5 transition-all group-hover:border-[#1B4332]/40"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {getCategoryBadge(post.category)}
                    {post.district && (
                      <span className="text-xs bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded-md">
                        📍 {post.district}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400">
                    {post.createdAt?.toDate
                      ? post.createdAt.toDate().toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'Recently'}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-[#0F172A] group-hover:text-[#1B4332] transition-colors leading-snug mb-1">
                  {post.title}
                </h2>

                <p className="text-sm text-[#475569] line-clamp-2 mb-4">
                  {post.content}
                </p>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <span className="font-medium text-slate-700">
                    By {post.authorDisplayName || 'Farmer'}
                  </span>
                  <div className="flex items-center space-x-1.5 text-[#1B4332] font-semibold">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    <span>{post.replyCount || 0} replies</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}

          {/* Load More Pagination */}
          {hasMore && (
            <div className="text-center pt-4">
              <Button
                variant="outline"
                size="md"
                onClick={loadMore}
                loading={loadingMore}
              >
                Load More Discussions
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
