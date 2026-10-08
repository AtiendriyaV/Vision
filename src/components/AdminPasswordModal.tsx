import React, { useState } from 'react';
import { Lock, Eye, EyeOff, AlertCircle, X, CheckCircle2 } from 'lucide-react';

interface AdminPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminPasswordModal: React.FC<AdminPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Please enter the admin password.');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const res = await fetch('/api/verify-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: password.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('atiendriya_admin_auth', 'Vermakk@1972');
        setPassword('');
        setError('');
        onSuccess();
      } else {
        setError(data.message || 'Incorrect password. Access denied.');
      }
    } catch {
      // Local fallback verification in case of offline/network issue
      if (password.trim() === 'Vermakk@1972') {
        localStorage.setItem('atiendriya_admin_auth', 'Vermakk@1972');
        setPassword('');
        setError('');
        onSuccess();
      } else {
        setError('Incorrect password. Access denied.');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-white border border-[#e7e5e4] shadow-2xl p-6 sm:p-8 relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-dialog-title"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[#78716c] hover:text-[#1c1917] hover:bg-[#f5f5f4] transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[#1c1917] text-white flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 id="admin-dialog-title" className="font-serif font-bold text-lg text-[#1c1917]">
              Admin Authentication
            </h2>
            <p className="text-xs text-[#78716c]">
              Restricted access for article authoring and management
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label 
              htmlFor="admin-password-input" 
              className="block text-[11px] font-mono uppercase tracking-wider text-[#78716c] mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="admin-password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                autoFocus
                placeholder="Enter password"
                className="w-full px-3.5 py-2.5 text-sm text-[#1c1917] bg-[#faf9f6] border border-[#d6d3d1] focus:outline-none focus:border-[#1c1917] focus:bg-white pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78716c] hover:text-[#1c1917] cursor-pointer"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#f5f5f4]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#78716c] hover:text-[#1c1917] hover:bg-[#f5f5f4] cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isVerifying}
              className="px-5 py-2 bg-[#1c1917] hover:bg-black disabled:bg-[#78716c] text-white text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors"
            >
              {isVerifying ? 'Verifying...' : 'Unlock Admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
