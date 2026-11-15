import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/fields';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    try {
      await signIn(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const authError = err as { code?: string; message?: string };
      if (
        authError.code === 'auth/invalid-credential' ||
        authError.code === 'auth/wrong-password' ||
        authError.code === 'auth/user-not-found'
      ) {
        setError('Invalid email or password. Please check your credentials.');
      } else if (authError.code === 'auth/too-many-requests') {
        setError('Too many failed login attempts. Please reset your password or try again later.');
      } else {
        setError(authError.message || 'Failed to sign in. Please try again.');
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
          Sign in to TerraCrop
        </h2>
        <p className="mt-2 text-sm text-[#475569]">
          Smart Crop Planning with NASA Climate Data
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Card>
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
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
                htmlFor="email"
                className="block text-sm font-medium text-[#0F172A] mb-1"
              >
                Email address
              </label>
              <input
                id="email"
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
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-[#0F172A]"
                >
                  Password
                </label>
                <Link
                  to="/reset-password"
                  className="text-xs font-semibold text-[#1B4332] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full min-h-[48px] px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent text-base"
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              className="w-full"
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-[#475569]">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="font-semibold text-[#1B4332] hover:underline"
            >
              Create one now
            </Link>
          </div>
        </Card>

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-xs text-[#475569] hover:text-[#0F172A] inline-flex items-center space-x-1"
          >
            <span>← Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
