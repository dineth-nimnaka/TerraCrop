import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';

export const ResetPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please provide your email address.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email.trim());
      setSubmitted(true);
    } catch (err: unknown) {
      const authError = err as { code?: string; message?: string };
      if (authError.code === 'auth/user-not-found') {
        // For security, don't reveal whether user exists, or show neutral message
        setSubmitted(true);
      } else {
        setError(authError.message || 'Failed to send reset email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F7F4] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#1B4332] text-white flex items-center justify-center text-3xl mx-auto shadow-md mb-4">
          🌱
        </div>
        <h2 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
          Reset Password
        </h2>
        <p className="mt-2 text-sm text-[#475569]">
          We'll send you an email with instructions to reset your password.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Card>
          {submitted ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-emerald-100 text-[#1B4332] rounded-full flex items-center justify-center mx-auto mb-3 text-xl">
                ✉️
              </div>
              <h3 className="text-lg font-semibold text-[#0F172A] mb-2">
                Check Your Email
              </h3>
              <p className="text-sm text-[#475569] mb-6">
                If an account exists for <span className="font-semibold">{email}</span>, you will receive password reset instructions shortly.
              </p>
              <Link to="/login">
                <Button variant="primary" size="md" className="w-full">
                  Return to Sign In
                </Button>
              </Link>
            </div>
          ) : (
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
                  htmlFor="reset-email"
                  className="block text-sm font-medium text-[#0F172A] mb-1"
                >
                  Email address
                </label>
                <input
                  id="reset-email"
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

              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={loading}
                className="w-full"
              >
                Send Reset Link
              </Button>

              <div className="text-center mt-4">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-[#1B4332] hover:underline"
                >
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};
