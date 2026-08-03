// src/components/auth/ReauthenticationWrapper.jsx (Example)
import React, { useState } from 'react';
import { 
  EmailAuthProvider, 
  reauthenticateWithCredential, 
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock, User, Loader2, Key } from 'lucide-react';
import { toast } from 'react-toastify';
import { auth, googleProvider } from '../../firebase/firebaseConfig'; // Assume googleProvider is accessible

// This wrapper handles the re-authentication process
export default function ReauthenticationWrapper({ children, onReauthenticated }) {
  const { currentUser } = useAuth();
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!currentUser) return null;

  const primaryProvider = currentUser.providerData[0]?.providerId;

  const handlePasswordReauth = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');

    try {
      const credential = EmailAuthProvider.credential(currentUser.email, password);
      await reauthenticateWithCredential(currentUser, credential);
      toast.success('Credentials verified. You can now update your settings.');
      onReauthenticated();
    } catch (err) {
      console.error("Reauth failed:", err);
      toast.error('Invalid password.');
      setError('Invalid password. Please try again.');
    } finally {
      setBusy(false);
      setPassword('');
    }
  };

  const handleGoogleReauth = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    
    try {
      // 1. Trigger the Google sign-in POPUP
      const result = await signInWithPopup(auth, googleProvider);
    
      // 2. Get the specific credential needed for re-authentication
      // The GoogleAuthProvider provides a static method to extract the credential object
      const credential = GoogleAuthProvider.credentialFromResult(result);

      if (!credential) {
        throw new Error("Could not retrieve Google credential.");
      }

      // 3. *** THE CRITICAL STEP: Use reauthenticateWithCredential ***
      // This satisfies the Firebase security check and refreshes the user's session token.
      await reauthenticateWithCredential(currentUser, credential);

      // The user's token is now fresh, and the sensitive operations will work!
      
      toast.success('Google verified. You can now update your settings.');
      onReauthenticated();

    } catch (err) {
      console.error("Google Reauth failed:", err);
      // Check for popup closed/error
      if (err.code === 'auth/popup-closed-by-user') {
        toast.info('Verification cancelled.');
      } else {
        toast.error('Google verification failed. Please try again.');
      }
      setError('Could not verify identity via Google.');
    } finally {
      setBusy(false);
    }
  };

  const renderPasswordForm = () => (
    <div className="bg-black/20 p-6 rounded-xl border border-white/10 shadow-lg space-y-4">
      <h4 className="text-xl font-bold text-white flex items-center gap-2">
        <Key size={20} className="text-emerald-400" />
        Security Check
      </h4>
      <p className="text-sm text-emerald-100/50">
        Please re-enter your current password to confirm your identity before making changes.
      </p>
      
      <form onSubmit={handlePasswordReauth} className="space-y-4">
        {error && <p className="text-xs text-red-400">{error}</p>}
        
        <div className="relative group">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-100/40" size={18} />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            placeholder="Current Password"
            required
            autoComplete="current-password"
          />
        </div>

        <button 
          type="submit" 
          disabled={busy} 
          className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {busy ? <Loader2 size={18} className="animate-spin" /> : 'Verify Identity'}
        </button>
      </form>
    </div>
  );

  const renderGoogleAuth = () => (
    <div className="bg-black/20 p-6 rounded-xl border border-white/10 shadow-lg space-y-4">
      <h4 className="text-xl font-bold text-white flex items-center gap-2">
        <Key size={20} className="text-emerald-400" />
        Security Check
      </h4>
      <p className="text-sm text-emerald-100/50">
        Please use the Google pop-up to confirm your identity before making changes.
      </p>
      
      <button 
        onClick={handleGoogleReauth}
        disabled={busy} 
        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors group disabled:opacity-70"
      >
        {busy ? (
           <Loader2 size={20} className="animate-spin" />
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            {/* Google SVG paths */}
            <path d="M21 12.24c0-.68-.06-1.36-.18-2H12v3.79h5.46c-.24 1.24-.98 2.29-2.09 2.99v2.48h3.37c1.97-1.81 3.12-4.49 3.12-7.26z" fill="#4285F4" />
            <path d="M12 22c2.7 0 4.96-.9 6.61-2.44l-3.37-2.48c-.93.63-2.12 1.02-3.24 1.02-2.49 0-4.6-1.68-5.36-3.95H3.15v2.48C4.8 19.83 8.16 22 12 22z" fill="#34A853" />
            <path d="M6.64 13.15A5.99 5.99 0 016 12c0-.34.03-.67.08-.99V8.53H3.15A9.99 9.99 0 002 12c0 1.62.39 3.16 1.08 4.51l3.56-3.36z" fill="#FBBC05" />
            <path d="M12 6.5c1.47 0 2.79.5 3.82 1.48l2.86-2.86C16.95 3.72 14.7 3 12 3 8.16 3 4.8 5.17 3.15 8.53l3.56 2.98C7.4 8.18 9.51 6.5 12 6.5z" fill="#EA4335" />
          </svg>
        )}
        <span className="text-sm font-medium text-emerald-100/90">Verify with Google</span>
      </button>
    </div>
  );

  // Render the appropriate form based on the user's login method
  return (
    <div className="w-full">
      {primaryProvider === 'password' ? renderPasswordForm() : 
       primaryProvider === 'google.com' ? renderGoogleAuth() : 
       <p className="text-sm text-red-400">Security operation unavailable for your login method.</p>
      }
    </div>
  );
}