import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import AuthCard from "./AuthCard";
import { useAuth } from "../../contexts/AuthContext";
import {getDoc,doc,setDoc} from "firebase/firestore"
import {db, auth, googleProvider } from "../../firebase/firebaseConfig"; 
import { signInWithEmailAndPassword, signInWithPopup,sendPasswordResetEmail } from "firebase/auth";

export default function LoginForm({ onSignUp, onSuccess }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function change(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  function validate() {
    const e = {};
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) e.email = "Valid email required";
    if (!form.password) e.password = "Password is required";
    return e;
  }

  // Map Firebase errors → friendly text
  function firebaseMsg(err) {
    if (!err || !err.code) return err?.message || "Login failed.";
    switch (err.code) {
      case "auth/invalid-credential": return "Invalid Credentials";
      case "auth/user-not-found": return "No account found with this email.";
      case "auth/wrong-password": return "Incorrect password.";
      case "auth/invalid-email": return "Invalid email address.";
      case "auth/user-disabled": return "This account has been disabled.";
      default: return err.message || "Login failed.";
    }
  }
  async function handleForgotPassword() {
    // Use the email currently in the form state
    const email = form.email.trim();
    
    // Basic validation: Check if email is present and looks valid
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setErrors({ general: "Please enter your email address to reset your password." });
      return;
    }

    setErrors({}); 
    setBusy(true);

    try {
      // Call the Firebase method
      await sendPasswordResetEmail(auth, email);  
      // Success feedback 
      alert(`Password reset link sent to ${email}. Please check your inbox.`);
      
    } catch (err) {
      console.error("Password reset error:", err);
      setErrors({ general: "Could not send reset link. If the email is registered, you should receive a message shortly." });
    } finally {
      setBusy(false);
    }
  }

  async function submit(e) {
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
      const userCred = await signInWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      login();
      if (typeof onSuccess === "function") {
        onSuccess(userCred.user);
      }
    } catch (err) {
      console.error("Login error:", err);
      setErrors({ general: firebaseMsg(err) });
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    if (busy) return;

    setErrors({});
    setBusy(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user=result.user;
      const userRef = doc(db, "UsersDetail", user.uid);
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
      // New Google user — create Firestore entry
        await setDoc(userRef, {
          displayName: user.displayName || "",email: user.email || "",createdAt : new Date(),
          avatarSeed: user.uid, role : 'user'
        });
      }
      login();
      if (typeof onSuccess === "function") {
        onSuccess(result.user);
      }
    } catch (err) {
      console.error("Google login error:", err);
      setErrors({ general: err?.message || "Google sign-in failed." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to continue monitoring and adopting."
      actions={
        <button
          className="text-sm text-white/80 underline hover:text-forest-text cursor-pointer"
          onClick={onSignUp}
        >
        </button>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        {errors.general && (
          <div className="text-xs text-red-400">{errors.general}</div>
        )}

        <div>
          <label className="text-sm text-white/80">Email address</label>
          <input
            name="email"
            value={form.email}
            onChange={change}
            className="ap-input"
            placeholder="you@domain.com"
            type="email"
          />
          {errors.email && (
            <p className="text-xs text-red-400 mt-1">{errors.email}</p>
          )}
        </div>

        <div className="relative">
          <label className="text-sm text-white/80">Password</label>
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={change}
            className="ap-input pr-10"
            placeholder="Your password"
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-8 text-white/60 hover:text-white/80 cursor-pointer"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
          {errors.password && (
            <p className="text-xs text-red-400 mt-1">{errors.password}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm text-white/75 cursor-pointer hover:text-forest-accent">
            <input type="checkbox" className="mr-2" /> Remember me
          </label>
          
          <button
            type="button"
            // Use the new handler here
            onClick={handleForgotPassword} 
            className="text-sm underline cursor-pointer hover:text-forest-accent"
            disabled={busy} // Crucial for preventing multiple clicks
          >
            Forgot?
          </button>
        </div>

        <button type="submit" disabled={busy} className="ap-cta w-full mt-2 cursor-pointer">
          {busy ? "Logging in..." : "Log In"}
        </button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/20"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-forest-base text-white/60">or</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={busy}
          className="w-full flex items-center justify-center gap-3 px-3 py-2 rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] cursor-pointer"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
            <path d="M21 12.24c0-.68-.06-1.36-.18-2H12v3.79h5.46c-.24 1.24-.98 2.29-2.09 2.99v2.48h3.37c1.97-1.81 3.12-4.49 3.12-7.26z" fill="#4285F4" />
            <path d="M12 22c2.7 0 4.96-.9 6.61-2.44l-3.37-2.48c-.93.63-2.12 1.02-3.24 1.02-2.49 0-4.6-1.68-5.36-3.95H3.15v2.48C4.8 19.83 8.16 22 12 22z" fill="#34A853" />
            <path d="M6.64 13.15A5.99 5.99 0 016 12c0-.34.03-.67.08-.99V8.53H3.15A9.99 9.99 0 002 12c0 1.62.39 3.16 1.08 4.51l3.56-3.36z" fill="#FBBC05" />
            <path d="M12 6.5c1.47 0 2.79.5 3.82 1.48l2.86-2.86C16.95 3.72 14.7 3 12 3 8.16 3 4.8 5.17 3.15 8.53l3.56 2.98C7.4 8.18 9.51 6.5 12 6.5z" fill="#EA4335" />
          </svg>
          <span className="text-sm text-white/90 font-medium hover:text-forest-accent cursor-pointer">Continue with Google</span>
        </button>

        <p className="text-sm text-white/75 text-center mt-2">
          New here?{" "}
          <button type="button" onClick={onSignUp} className="underline hover:text-forest-accent cursor-pointer">
            Create account
          </button>
        </p>
      </form>
    </AuthCard>
  );
}
