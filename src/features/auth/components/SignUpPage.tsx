import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';

export const SignUpPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { signUp, sendVerification } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await signUp(email.trim(), password);
      try {
        await sendVerification();
      } catch (verificationErr) {
        console.warn('Could not send verification email immediately:', verificationErr);
      }
      setSuccess(true);
    } catch (err: unknown) {
      const authError = err as { code?: string; message?: string };
      if (authError.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists.');
      } else if (authError.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (authError.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError(authError.message || 'Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F3F7F4] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
          <Card className="text-center">
            <div className="w-14 h-14 bg-emerald-100 text-[#1B4332] rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              ✓
            </div>
            <h2 className="text-2xl font-bold text-[#0F172A] mb-2">
              Account Created!
            </h2>
            <p className="text-sm text-[#475569] mb-4">
              We have sent a verification link to{' '}
              <span className="font-semibold text-[#0F172A]">{email}</span>.
              Please check your inbox.
            </p>
            <p className="text-xs text-amber-800 bg-amber-50 p-3 rounded-xl mb-6">
              Note: Email verification is required to publish posts and replies in the Community.
            </p>
            <Button
              onClick={() => navigate('/fields')}
              variant="primary"
              size="md"
              className="w-full"
            >
              Go to My Farm
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F7F4] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#1B4332] text-white flex items-center justify-center text-3xl mx-auto shadow-md mb-4">
          🌱
        </div>
        <h2 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
          Create an Account
        </h2>
        <p className="mt-2 text-sm text-[#475569]">
          Get started with intelligent crop rotation planning
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Card>
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            {error && (
              <div
                className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm"
                role="alert"
              >
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="signup-email"
                className="block text-sm font-medium text-[#0F172A] mb-1"
              >
                Email address
              </label>
              <input
                id="signup-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full min-h-[48px] px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent text-base"
                placeholder="farmer@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="signup-password"
                className="block text-sm font-medium text-[#0F172A] mb-1"
              >
                Password (min 6 characters)
              </label>
              <input
                id="signup-password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full min-h-[48px] px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent text-base"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium text-[#0F172A] mb-1"
              >
                Confirm Password
              </label>
              <input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full min-h-[48px] px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent text-base"
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              className="w-full mt-2"
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-[#475569]">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-[#1B4332] hover:underline"
            >
              Sign in
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
