// src/components/profile/ChangePasswordForm.jsx
import React, { useState } from 'react';
import { updatePassword } from 'firebase/auth';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { Lock, Eye, EyeOff, Check, Loader2, Key } from 'lucide-react';
import ReauthenticationWrapper from '../auth/ReauthenticationWrapper'; // Re-authentication required

export default function ChangePasswordForm() {
  const { currentUser } = useAuth();
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [needsReauth, setNeedsReauth] = useState(true);

  if (!currentUser) return null;

  function change(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: null }));
  }

  function validate() {
    const e = {};
    if (form.newPassword.length < 8) e.newPassword = 'Password must be at least 8 characters.';
    if (form.newPassword !== form.confirmPassword) e.confirmPassword = 'Passwords must match.';
    return e;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setErrors({});
    const v = validate();
    if (Object.keys(v).length) {
      setErrors(v);
      return;
    }

    setBusy(true);
    try {
      await updatePassword(currentUser, form.newPassword);
      
      toast.success('Password updated successfully!');
      setForm({ newPassword: '', confirmPassword: '' });
      setNeedsReauth(true); // Require re-auth for the next change
    } catch (err) {
      console.error('Password update failed:', err);
      toast.error(err.message || 'Failed to update password.');
    } finally {
      setBusy(false);
    }
  };

  if (needsReauth) {
    return (
      <ReauthenticationWrapper onReauthenticated={() => setNeedsReauth(false)}>
        <p className="text-sm text-emerald-100/50 mb-4">
          Verify your credentials to securely change your password.
        </p>
      </ReauthenticationWrapper>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-xl font-semibold text-white flex items-center gap-2">
        <Key size={20} className="text-emerald-400" />
        Update Password
      </h3>
      <p className="text-sm text-emerald-100/70 mb-4">
        Enter your new password below. You will be asked to re-authenticate on next login.
      </p>
      
      {/* New Password Input */}
      <div className='space-y-3'>
        <div>
          <label className="block text-xs font-medium text-emerald-100/60 mb-1.5 ml-1">New Password</label>
          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-100/40 group-focus-within:text-emerald-400 transition-colors" size={18} />
            <input
              name="newPassword"
              type={showPassword ? "text" : "password"}
              value={form.newPassword}
              onChange={change}
              className={`w-full bg-black/20 border ${errors.newPassword ? 'border-red-500/50' : 'border-white/10'} rounded-lg py-3 pl-10 pr-10 text-white placeholder-white/40 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm`}
              placeholder="At least 8 characters"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-100/30 hover:text-emerald-100 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.newPassword && <p className="text-xs text-red-400 mt-1 ml-1">{errors.newPassword}</p>}
        </div>

        {/* Confirm Password Input */}
        <div>
          <label className="block text-xs font-medium text-emerald-100/60 mb-1.5 ml-1">Confirm New Password</label>
          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-100/40 group-focus-within:text-emerald-400 transition-colors" size={18} />
            <input
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={form.confirmPassword}
              onChange={change}
              className={`w-full bg-black/20 border ${errors.confirmPassword ? 'border-red-500/50' : 'border-white/10'} rounded-lg py-3 pl-10 pr-10 text-white placeholder-white/40 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm`}
              placeholder="Re-enter new password"
              autoComplete="new-password"
            />
            {/* ... (Visual indicator for matching passwords) */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-100/30 hover:text-emerald-100 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-xs text-red-400 mt-1 ml-1">{errors.confirmPassword}</p>}
        </div>
      </div>

      <button 
        type="submit" 
        disabled={busy} 
        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg shadow-md shadow-emerald-900/40 transition-all active:scale-[0.99] disabled:opacity-70 flex items-center justify-center gap-2 mt-4"
      >
        {busy ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            <span>Updating...</span>
          </>
        ) : (
          <>
            <Check size={18} />
            <span>Save New Password</span>
          </>
        )}
      </button>
    </form>
  );
}