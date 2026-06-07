import React, { useState } from 'react';
import { AlertCircle, ShieldCheck, X } from 'lucide-react';
import { FaDiscord } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { loginWithDiscord } = useAuth();

  if (!isOpen) return null;

  const handleDiscordLogin = async () => {
    setError('');
    setIsSubmitting(true);

    try {
      await loginWithDiscord();
    } catch (_err) {
      setError('Discord sign-in failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative w-full max-w-md overflow-hidden rounded-lg border-2 shadow-2xl animate-fade-in"
        style={{ backgroundColor: 'rgba(24, 18, 16, 0.96)', borderColor: '#B91C1C' }}
      >
        <div className="flex items-center justify-between border-b border-red-900/50 p-6">
          <div className="flex items-center space-x-3">
            <div
              className="rounded-lg border p-2"
              style={{ backgroundColor: 'rgba(127, 29, 29, 0.28)', borderColor: '#7F1D1D' }}
            >
              <ShieldCheck className="h-6 w-6 text-red-200" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-stone-50">Broken Blade Login</h2>
              <p className="text-sm text-red-200">Discord account access</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border p-2 transition-colors hover:bg-red-900/30"
            style={{ borderColor: '#7F1D1D' }}
            aria-label="Close login modal"
          >
            <X className="h-6 w-6 text-red-100" />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div className="rounded-lg border border-red-900/40 bg-black/20 p-4">
            <p className="text-sm leading-relaxed text-red-100">
              Sign in with Discord so the site can read your Discord user ID, avatar, and display name. Staff ranks are applied from Supabase by Discord ID.
            </p>
          </div>

          {error && (
            <div className="flex items-center space-x-2 rounded-lg border border-red-500/50 bg-red-500/15 p-3">
              <AlertCircle className="h-5 w-5 text-red-300" />
              <span className="text-sm text-red-100">{error}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleDiscordLogin}
            disabled={isSubmitting}
            className="flex h-12 w-full items-center justify-center space-x-3 rounded-lg border font-semibold text-stone-50 transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: '#5865F2', borderColor: 'rgba(255, 255, 255, 0.25)' }}
          >
            <FaDiscord className="h-5 w-5" />
            <span>{isSubmitting ? 'Opening Discord...' : 'Continue with Discord'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
