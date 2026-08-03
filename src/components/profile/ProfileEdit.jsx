// src/components/profile/ProfileEdit.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import Avatar from "../common/Avatar";
import AvatarPicker from "./AvatarPicker";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig"; 
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { 
  User, 
  Phone, 
  Mail, 
  FileText, 
  Save, 
  X, 
  ArrowLeft,
  Loader2,
  Lock
} from "lucide-react";

export default function ProfileEdit() {
  const { currentUser, userDetails } = useAuth();
  const navigate = useNavigate();

  // If not logged in, render nothing
  if (!currentUser) return null;
  const uid = currentUser.uid;

  const [form, setForm] = useState({
    displayName: userDetails?.displayName || "",
    bio: userDetails?.bio || "",
    phone: userDetails?.phone || "",
    avatarChoice: userDetails?.avatarChoice || "adventurer"
  });
  const [saving, setSaving] = useState(false);

  // Keep form synced
  useEffect(() => {
    setForm({
      displayName: userDetails?.displayName || "",
      bio: userDetails?.bio || "",
      phone: userDetails?.phone || "",
      avatarChoice: userDetails?.avatarChoice || "adventurer"
    });
  }, [userDetails]);

  function change(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  async function save(e) {
    e && e.preventDefault();
    setSaving(true);

    try {
      const updates = {};

      if ((form.displayName ?? "") !== (userDetails?.displayName ?? "")) {
        updates.displayName = form.displayName || null;
      }
      if ((form.bio ?? "") !== (userDetails?.bio ?? "")) {
        updates.bio = form.bio || null;
      }
      if ((form.phone ?? "") !== (userDetails?.phone ?? "")) {
        updates.phone = form.phone || null;
      }
      if ((form.avatarChoice ?? "") !== (userDetails?.avatarChoice ?? "")) {
        updates.avatarChoice = form.avatarChoice;
      }

      if (Object.keys(updates).length > 0) {
        const ref = doc(db, "UsersDetail", uid);
        await updateDoc(ref, updates);
      }

      toast.success("Profile updated.");
      navigate("/profile");
    } catch (err) {
      console.error("Profile update failed:", err);
      toast.error("Failed to update profile. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0b1510] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a2e24] to-[#0b1510] py-12 px-4 sm:px-6">
      
      <div className="max-w-5xl mx-auto mt-12">
        {/* Navigation Header */}
        <button 
          onClick={() => navigate("/profile")}
          className="flex items-center gap-2 text-emerald-100/60 hover:text-white mb-6 transition-colors group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Profile</span>
        </button>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          
          <div className="p-6 sm:p-10">
            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
              Edit Profile
            </h2>

            <form onSubmit={save} className="grid grid-cols-1 md:grid-cols-12 gap-10">
              
              {/* Left Column: Avatar Section */}
              <div className="md:col-span-4 flex flex-col items-center">
                <div className="relative group mb-6">
                  <div className="rounded-full p-1 bg-gradient-to-tr from-emerald-500 to-emerald-900 shadow-xl">
                    <div className="rounded-full border-4 border-[#0b1510]">
                      <Avatar
                        uid={uid}
                        avatarChoice={form.avatarChoice}
                        size={140}
                        alt={form.displayName || "User"}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="w-full bg-white/5 rounded-xl p-4 border border-white/5">
                  <label className="block text-xs font-semibold text-emerald-200/50 uppercase tracking-wider mb-3 text-center">
                    Select Avatar Style
                  </label>
                  <div className="flex justify-center">
                    <AvatarPicker 
                      uid={uid} 
                      value={form.avatarChoice} 
                      onChange={(choice) => setForm(f => ({ ...f, avatarChoice: choice }))} 
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Text Inputs */}
              <div className="md:col-span-8 space-y-6">
                
                {/* Name Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-emerald-100/80 ml-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500/50 group-focus-within:text-emerald-400 transition-colors" size={18} />
                    <input
                      name="displayName"
                      value={form.displayName}
                      onChange={change}
                      className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-emerald-100/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all"
                      placeholder="Your name"
                      autoComplete="name"
                    />
                  </div>
                </div>

                {/* Email Input (Read Only) */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-emerald-100/80 ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500/30" size={18} />
                    <input
                      value={currentUser?.email || ""}
                      readOnly
                      className="w-full bg-white/5 border border-white/5 rounded-xl py-3 pl-10 pr-10 text-emerald-100/50 cursor-not-allowed select-none"
                      title="Email cannot be edited"
                    />
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500/20" size={16} />
                  </div>
                  <p className="text-xs text-emerald-200/30 ml-1">Managed via authentication provider.</p>
                </div>

                {/* Phone Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-emerald-100/80 ml-1">Phone Number</label>
                  <div className="relative group">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500/50 group-focus-within:text-emerald-400 transition-colors" size={18} />
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={change}
                      className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-emerald-100/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                {/* Bio Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-emerald-100/80 ml-1">Bio</label>
                  <div className="relative group">
                    <FileText className="absolute left-3 top-4 text-emerald-500/50 group-focus-within:text-emerald-400 transition-colors" size={18} />
                    <textarea
                      name="bio"
                      value={form.bio}
                      onChange={change}
                      className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-emerald-100/30 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all resize-y"
                      placeholder="Tell us a little about yourself..."
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-4 pt-6 border-t border-white/5">
                  <button 
                    type="button" 
                    onClick={() => navigate("/profile")} 
                    className="px-6 py-2.5 rounded-xl border border-white/10 text-emerald-100 hover:bg-white/5 transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    <X size={16} />
                    Cancel
                  </button>
                  
                  <button 
                    type="submit" 
                    disabled={saving} 
                    className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-lg shadow-emerald-900/40 text-sm font-bold flex items-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>

              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}