import React, { useState } from 'react';
import { Mail, Lock, Shield, ArrowRight, Trees, ChevronDown, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Assuming you use react-router
// Firebase Imports
import { auth, db } from '../../firebase/firebaseConfig'; 
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import Logo from "../../../public/images/logo.png"

const AdminLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const INITIAL_STATE = {
    role: 'Super Admin', 
    email: '',
    password: ''
  };
  
  const [formData, setFormData] = useState(INITIAL_STATE);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear errors on type
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Authenticate with Email/Password
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // 2. Authorization: Check Role in Firestore
      const userDocRef = doc(db, "AdminUsers", user.uid);
      const userDocSnap = await getDoc(userDocRef);

     if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      
      // 3. Verify selected role matches database role
      if (userData.role === formData.role) {
        // SUCCESS: The AuthContext 'onSnapshot' will now pick this up automatically
        // because we are already logged in.
        
        // Redirect based on the role
        if (userData.role === 'Forest Manager') {
          navigate('/admin/ForestManager',{replace : true});
        } else {
          navigate('/admin/dashboard',{replace : true});
        }
      } else {
        // Wrong role selected in dropdown - Force Sign Out
        await auth.signOut(); 
        throw new Error(`Access Denied: Your account is assigned as ${userData.role}.`);
      }
    } else {
      // Not in AdminUsers collection at all - Force Sign Out
      await auth.signOut();
      throw new Error("Access Denied: You do not have Administrative privileges.");
    }

    } catch (err) {
      console.error(err);
      setError(err.message.replace("Firebase: ", "")); // Clean up error message
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-forest-base flex items-center justify-center relative overflow-hidden px-6 ">
      
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]"></div>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-forest-surface/80 backdrop-blur-xl border border-forest-border p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-black/50 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-10">
            <div className="bg-transparent rounded-lg text-white flex items-center justify-center">
                <img src={Logo} alt="" className="w-12 rounded-4xl bg-transparent" />
            </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to AgroPulse</h1>
          <p className="text-forest-muted text-sm">Enter your credentials to access the Admin Portal.</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl flex items-center gap-2 text-sm">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Role Select */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-forest-accent uppercase tracking-wider ml-1">Access Role</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-forest-muted pointer-events-none"><Shield size={20} /></div>
              <select 
                name="role"
                value={formData.role} 
                onChange={handleChange}
                className="w-full bg-forest-base border border-forest-border text-white text-sm rounded-xl py-4 pl-12 pr-10 appearance-none focus:border-forest-accent outline-none cursor-pointer"
              >
                <option value="Super Admin">Super Admin</option>
                <option value="Forest Manager">Forest Manager</option>
                <option value="Data Analyst">Data Analyst</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-forest-muted pointer-events-none"><ChevronDown size={16} /></div>
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-forest-muted uppercase tracking-wider ml-1">Email Address</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-forest-muted"><Mail size={20} /></div>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-forest-base border border-forest-border text-white text-sm rounded-xl py-4 pl-12 pr-4 focus:border-forest-accent outline-none placeholder:text-gray-600"
                placeholder="xyz@gmail.com"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-forest-muted uppercase tracking-wider ml-1">Password</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-forest-muted"><Lock size={20} /></div>
              <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-forest-base border border-forest-border text-white text-sm rounded-xl py-4 pl-12 pr-4 focus:border-forest-accent outline-none placeholder:text-gray-600"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {/* Submit */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-forest-accent to-emerald-500 hover:to-emerald-400 text-forest-base font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying Access...' : <> Login to your Panel <ArrowRight size={20} /></>}
          </button>

        </form>
      </div>
    </div>
  );
};

export default AdminLogin;