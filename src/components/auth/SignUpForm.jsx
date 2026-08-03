import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import AuthCard from "./AuthCard";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  signInWithPopup,
  signOut
} from "firebase/auth";
import { auth,db, googleProvider } from "../../firebase/firebaseConfig"; 
import { toast } from "react-toastify";
import { setDoc,doc,getDoc,getDocs,query, where, collection} from "firebase/firestore";
import Avatar from "../common/Avatar";

function StrengthBar({ password }) {
  const score =
    password.length === 0 ? 0 :
    (password.length >= 12 ? 3 : password.length >= 9 ? 2 : 1);

  const widths = ["0%", "33%", "66%", "100%"];
  const colors = ["bg-red-500", "bg-yellow-400", "bg-green-400"];

  return (
    <div className="mt-2">
      <div className="h-2 w-full bg-white/10 rounded-lg overflow-hidden">
        <div
          style={{ width: widths[score] }}
          className={`${score > 0 ? colors[score - 1] : "bg-transparent"} h-full transition-all`}
        />
      </div>
    </div>
  );
}

export default function SignUpForm({ onLogin, onGoogle, onSuccess }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  function change(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) e.email = "Valid email required";
    if (form.password.length < 8) e.password = "At least 8 characters";
    if (form.password !== form.confirm) e.confirm = "Passwords must match";
    return e;
  }

  // Helper to map firebase error codes to user-friendly messages
  function firebaseMessage(err) {
    if (!err || !err.code){toast.error(err?.message || 'Something went wrong.');
      return err?.message || "Something went wrong.";}
    switch (err.code) {
      case "auth/email-already-in-use": toast.error("Email already in use.");return;
      case "auth/invalid-email": return "Please enter a valid email address.";
      case "auth/weak-password": return "Password is too weak (min 6 characters).";
      case "auth/operation-not-allowed": return "Operation not allowed.";
      default: return err.message || "Sign up failed. Try again.";
    }
  }

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    setErrors({});
    const eObj = validate();
    if (Object.keys(eObj).length) {
      setErrors(eObj);
      return;
    }

    setBusy(true);
    try {
      // create Firebase user
      const userCred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const user=userCred.user
      if(user){
        await setDoc(doc(db,"UsersDetail",user.uid),{
          displayName : form.name,email : user.email,createdAt : new Date(),avatarSeed : user.uid,role : 'user'
        })
      }
      if (form.name) {
        try {
          await updateProfile(userCred.user, { displayName: form.name });
        } catch (updErr) {
          console.warn("updateProfile failed:", updErr);
        }
      }

      // send verification email (non-blocking)
      try {
        await sendEmailVerification(userCred.user);
      } catch (verErr) {
        console.warn("sendEmailVerification failed:", verErr);
      }

      // success callback
      if (typeof onSuccess === "function") onSuccess(userCred.user);
      else {
        // fallback: clear form and show a message
        setForm({ name: "", email: "", password: "", confirm: "" });
        alert("Account created. Check your email to verify.");
      }
    } catch (err) {
      console.error("Sign up error:", err);
      setErrors({ general: firebaseMessage(err) });
    } finally {
      setBusy(false);
    }
  }

  // Google handler: prefer page-provided handler, otherwise use Firebase popup
  async function handleGoogle(e) {
    e && e.preventDefault && e.preventDefault();
    if (busy) return;
    setErrors({});

    // If parent provided custom handler, call it
    if (typeof onGoogle === "function") {
      try {
        setBusy(true);
        await onGoogle();
      } catch (err) {
        console.error("onGoogle prop error:", err);
        setErrors({ general: err?.message || "Google sign-in failed." });
      } finally {
        setBusy(false);
      }
      return;
    }

    setBusy(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const emailToCheck = user.email;
      const q = query(collection(db, "UsersDetail"), where("email", "==", emailToCheck));
      const existing = await getDocs(q);

      if (!existing.empty) {
        // user already exists in Firestore → block new Google account
        await signOut(auth);
        toast.error("Email already in use");
        setErrors({ general: "An account with this email already exists. Please log in." });
        return; // stop Google login flow
      }
      const userRef = doc(db, "UsersDetail", user.uid);
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
      // New Google user — create Firestore entry
        await setDoc(userRef, {
          displayName: user.displayName || "",email: user.email || "",createdAt : new Date(),
          avatarSeed: user.uid, role : 'user'
        });
      } 
      if (typeof onSuccess === "function") onSuccess(result.user);
      else {
        console.log("Signed in with Google:", result.user);
      }
    } catch (err) {
      console.error("Google sign-in error:", err);
      setErrors({ general: err?.message || "Google sign-in failed." });
    } finally {
      setBusy(false);
    }
  }

  function handleLoginClick(evt) {
    evt.preventDefault();
    if (typeof onLogin === "function") onLogin();
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="Join the community protecting trees — track, adopt, and care."
      actions={
        <button type="button" className="text-sm text-white/80 underline hover:text-forest-text cursor-pointer" onClick={handleLoginClick}>
        </button>
      }
    >
      <form onSubmit={submit} className="space-y-3" noValidate>
        {errors.general && <div className="text-xs text-red-400">{errors.general}</div>}

        <div>
          <label className="text-sm text-white/80">Full name</label>
          <input
            name="name"
            value={form.name}
            onChange={change}
            className="ap-input"
            placeholder="Your full name"
            type="text"
            autoComplete="name"
          />
          {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="text-sm text-white/80">Email address</label>
          <input
            name="email"
            value={form.email}
            onChange={change}
            className="ap-input"
            placeholder="you@domain.com"
            type="email"
            autoComplete="email"
          />
          {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
        </div>

        <div className="relative">
          <label className="text-sm text-white/80">Password</label>
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={change}
            className="ap-input pr-10"
            placeholder="At least 8 characters"
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-8 text-white/60 hover:text-white/80 cursor-pointer"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
          <StrengthBar password={form.password} />
          {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
        </div>

        <div className="relative">
          <label className="text-sm text-white/80">Confirm password</label>
          <input
            name="confirm"
            type={showConfirmPassword ? "text" : "password"}
            value={form.confirm}
            onChange={change}
            className="ap-input pr-10"
            placeholder="Re-enter password"
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-8 text-white/60 hover:text-white/80 cursor-pointer"
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
          {errors.confirm && <p className="text-xs text-red-400 mt-1">{errors.confirm}</p>}
        </div>

        <button type="submit" disabled={busy} className="ap-cta w-full mt-2 cursor-pointer">
          {busy ? "Creating..." : "Create account"}
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
          className="w-full flex items-center justify-center gap-3 px-3 py-2 rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]"
          disabled={busy}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
            <path d="M21 12.24c0-.68-.06-1.36-.18-2H12v3.79h5.46c-.24 1.24-.98 2.29-2.09 2.99v2.48h3.37c1.97-1.81 3.12-4.49 3.12-7.26z" fill="#4285F4"/>
            <path d="M12 22c2.7 0 4.96-.9 6.61-2.44l-3.37-2.48c-.93.63-2.12 1.02-3.24 1.02-2.49 0-4.6-1.68-5.36-3.95H3.15v2.48C4.8 19.83 8.16 22 12 22z" fill="#34A853"/>
            <path d="M6.64 13.15A5.99 5.99 0 016 12c0-.34.03-.67.08-.99V8.53H3.15A9.99 9.99 0 002 12c0 1.62.39 3.16 1.08 4.51l3.56-3.36z" fill="#FBBC05"/>
            <path d="M12 6.5c1.47 0 2.79.5 3.82 1.48l2.86-2.86C16.95 3.72 14.7 3 12 3 8.16 3 4.8 5.17 3.15 8.53l3.56 2.98C7.4 8.18 9.51 6.5 12 6.5z" fill="#EA4335"/>
          </svg>
          <span className="text-sm text-white/90 font-medium cursor-pointer hover:text-forest-accent">Continue with Google</span>
        </button>

        <p className="text-sm text-white/75 text-center mt-2">
          Already have an account?{" "}
          <button type="button" onClick={handleLoginClick} className="underline cursor-pointer hover:text-forest-accent">
            Log in
          </button>
        </p>
      </form>
    </AuthCard>
  );
}
