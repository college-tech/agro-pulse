// src/components/profile/LinkPasswordForm.jsx
import React, { useState } from 'react';
import { EmailAuthProvider, linkWithCredential } from 'firebase/auth';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { Lock, Mail, Check, Loader2, UserPlus } from 'lucide-react';

export default function LinkPasswordForm({ onPasswordCreated, defaultEmail }) {
  const { currentUser } = useAuth();
  const [form, setForm] = useState({ email: defaultEmail || '', password: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  if (!currentUser) return null;

  function change(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: null }));
  }

  function validate() {
    const e = {};
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) e.email = "Valid email required";
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters.';
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
      const credential = EmailAuthProvider.credential(form.email, form.password);
      await linkWithCredential(currentUser, credential);
      
      toast.success('Email and password linked successfully!');
      onPasswordCreated();
      
    } catch (err) {
      console.error('Account linking failed:', err);
      if (err.code === 'auth/email-already-in-use') {
         setErrors({ general: 'This email is already linked to another account.' });
      } else {
         setErrors({ general: err.message || 'Failed to create password.' });
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-xl font-semibold text-white flex items-center gap-2">
        <UserPlus size={20} className="text-emerald-400" />
        Set Up Backup Login
      </h3>
      <p className="text-sm text-emerald-100/70 mb-4">
        Link an email and password to your social account for secure recovery and direct login.
      </p>

      {errors.general && (
        <div className="text-xs text-red-400 p-2 bg-red-900/20 rounded">{errors.general}</div>
      )}
      
      <div className='space-y-3'>
        {/* Email Input */}
        <div>
          <label className="block text-xs font-medium text-emerald-100/60 mb-1.5 ml-1">Email (to link)</label>
          <div className="relative group">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-100/40" size={18} />
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={change}
              className={`w-full bg-black/20 border ${errors.email ? 'border-red-500/50' : 'border-white/10'} rounded-lg py-3 pl-10 pr-4 text-white placeholder-white/40 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm`}
              placeholder={defaultEmail}
              required
              autoComplete="email"
            />
          </div>
          {errors.email && <p className="text-xs text-red-400 mt-1 ml-1">{errors.email}</p>}
        </div>

        {/* Password Input */}
        <div>
          <label className="block text-xs font-medium text-emerald-100/60 mb-1.5 ml-1">New Password</label>
          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-100/40" size={18} />
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={change}
              className={`w-full bg-black/20 border ${errors.password ? 'border-red-500/50' : 'border-white/10'} rounded-lg py-3 pl-10 pr-4 text-white placeholder-white/40 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm`}
              placeholder="At least 8 characters"
              required
              autoComplete="new-password"
            />
          </div>
          {errors.password && <p className="text-xs text-red-400 mt-1 ml-1">{errors.password}</p>}
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
            <span>Linking Credentials...</span>
          </>
        ) : (
          <>
            <Check size={18} />
            <span>Create Password</span>
          </>
        )}
      </button>
    </form>
  );
}