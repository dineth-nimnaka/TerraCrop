import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useCommunityPosts } from '../hooks/useCommunityPosts';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
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

export const NewPostPage: React.FC = () => {
  const { user } = useAuth();
  const { createPost } = useCommunityPosts();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<PostCategory>('crop_question');
  const [district, setDistrict] = useState('Anuradhapura');

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!user?.emailVerified) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <Card className="text-center p-6 space-y-4">
          <div className="w-14 h-14 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto text-2xl">
            🔒
          </div>
          <h2 className="text-xl font-bold text-[#0F172A]">
            Email Verification Required
          </h2>
          <p className="text-sm text-[#475569]">
            To keep discussions safe and spam-free, only verified accounts can publish community posts. Please check your inbox or visit Settings to resend verification.
          </p>
          <div className="pt-2 flex justify-center space-x-3">
            <Link to="/community">
              <Button variant="ghost" size="md">
                Back to Discussions
              </Button>
            </Link>
            <Link to="/settings">
              <Button variant="primary" size="md">
                Go to Settings
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle || trimmedTitle.length < 3) {
      setError('Title must be at least 3 characters long.');
      return;
    }

    if (trimmedTitle.length > 300) {
      setError('Title cannot exceed 300 characters.');
      return;
    }

    if (!trimmedContent || trimmedContent.length < 10) {
      setError('Content must be at least 10 characters long.');
      return;
    }

    if (trimmedContent.length > 5000) {
      setError('Content cannot exceed 5000 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const postId = await createPost({
        title: trimmedTitle,
        content: trimmedContent,
        category,
        district: district !== 'none' ? district : undefined,
      });

      navigate(`/community/${postId}`);
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'Failed to publish post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <div className="flex items-center space-x-2 text-xs text-[#475569] mb-1">
          <Link to="/community" className="hover:text-[#1B4332]">
            Community
          </Link>
          <span>/</span>
          <span className="text-[#0F172A] font-semibold">New Discussion</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">
          Start a Community Discussion
        </h1>
        <p className="text-sm text-[#475569]">
          Share inquiries, seed availability, or market observations with other farmers.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {error && (
            <div
              className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm"
              role="alert"
            >
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label
              htmlFor="post-title"
              className="block text-sm font-medium text-[#0F172A] mb-1"
            >
              Topic Title <span className="text-red-500">*</span>
            </label>
            <input
              id="post-title"
              type="text"
              required
              maxLength={300}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Recommended drought-tolerant mung bean variety for Yala in Anuradhapura?"
              className="w-full min-h-[48px] px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1B4332] text-base"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label
                htmlFor="post-category"
                className="block text-sm font-medium text-[#0F172A] mb-1"
              >
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="post-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as PostCategory)}
                className="w-full min-h-[48px] px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4332] text-sm"
              >
                <option value="crop_question">Crop Question / Agronomy Inquiry</option>
                <option value="seed_availability">Seed Availability & Exchange</option>
                <option value="market_information">Market Information & Farmgate Prices</option>
              </select>
            </div>

            {/* District */}
            <div>
              <label
                htmlFor="post-district"
                className="block text-sm font-medium text-[#0F172A] mb-1"
              >
                Regional District
              </label>
              <select
                id="post-district"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full min-h-[48px] px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4332] text-sm"
              >
                <option value="none">Island-wide / General</option>
                {SRI_LANKA_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs text-[#1B4332] flex items-center space-x-2">
            <span>🛡️</span>
            <span>
              <strong>Privacy Guarantee:</strong> Posts publish with your district name only. Exact GPS coordinates and farm boundaries are strictly private and never shared publicly.
            </span>
          </div>

          {/* Content */}
          <div>
            <label
              htmlFor="post-content"
              className="block text-sm font-medium text-[#0F172A] mb-1"
            >
              Discussion Content <span className="text-red-500">*</span>
            </label>
            <textarea
              id="post-content"
              rows={6}
              required
              maxLength={5000}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Provide background, soil conditions, observed weather or specific queries..."
              className="w-full p-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1B4332] text-base"
            />
            <div className="text-right text-[11px] text-slate-400 mt-1">
              {content.length} / 5000 characters
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={() => navigate('/community')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={submitting}
              className="min-w-[150px]"
            >
              Publish Topic
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
