// src/components/profile/ChangeEmailForm.jsx
import React, { useState } from 'react';
import { verifyBeforeUpdateEmail } from 'firebase/auth';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { Mail, Loader2, Check, User } from 'lucide-react';
import ReauthenticationWrapper from '../auth/ReauthenticationWrapper'; // Re-authentication required

export default function ChangeEmailForm() {
  const { currentUser } = useAuth();
  const [newEmail, setNewEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [needsReauth, setNeedsReauth] = useState(true);

  if (!currentUser) return null;

  function change(e) {
    setNewEmail(e.target.value);
    if (errors.newEmail) setErrors(e => ({ ...e, newEmail: null }));
  }

  function validate() {
    const e = {};
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(newEmail)) {
      e.newEmail = 'Please enter a valid email address.';
    } else if (newEmail === currentUser.email) {
      e.newEmail = 'The new email cannot be the same as the current one.';
    }
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
      await verifyBeforeUpdateEmail(currentUser, newEmail);
      
      toast.success('Email updated. Please verify the new address!');
      setNewEmail('');
      //setNeedsReauth(true); 
    } catch (err) {
      console.error('Email update failed:', err);
      if (err.code === 'auth/email-already-in-use') {
         toast.error("That email address is already in use.");
      } else {
         toast.error(err.message || 'Failed to update email.');
      }
    } finally {
      setBusy(false);
    }
  };

  if (needsReauth) {
    return (
      <ReauthenticationWrapper onReauthenticated={() => setNeedsReauth(false)}>
        <p className="text-sm text-emerald-100/50 mb-4">
          Verify your credentials to securely change your email address.
        </p>
      </ReauthenticationWrapper>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-xl font-semibold text-white flex items-center gap-2">
        <Mail size={20} className="text-emerald-400" />
        Update Email Address
      </h3>

      <div className="p-3 bg-black/20 rounded-lg border border-white/10 text-sm text-emerald-100/70">
        Current Email: <span className="font-bold text-white">{currentUser.email}</span>
      </div>
      
      {/* New Email Input */}
      <div>
        <label className="block text-xs font-medium text-emerald-100/60 mb-1.5 ml-1">New Email Address</label>
        <div className="relative group">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-100/40 group-focus-within:text-emerald-400 transition-colors" size={18} />
          <input
            name="newEmail"
            type="email"
            value={newEmail}
            onChange={change}
            className={`w-full bg-black/20 border ${errors.newEmail ? 'border-red-500/50' : 'border-white/10'} rounded-lg py-3 pl-10 pr-4 text-white placeholder-white/40 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm`}
            placeholder="new.email@nature.com"
            autoComplete="email"
          />
        </div>
        {errors.newEmail && <p className="text-xs text-red-400 mt-1 ml-1">{errors.newEmail}</p>}
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
            <span>Change Email Address</span>
          </>
        )}
      </button>
      <p className="text-xs text-emerald-100/50 mt-4">
        Note: You will be sent a verification email to the new address.
      </p>
    </form>
  );
}