import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import Avatar from "../common/Avatar";
import ProfileMenu from "../common/ProfileMenu";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import {
  Edit3,
  Trees,
  Heart,
  Activity,
  Calendar,
  Mail,
  Phone,
  User,
  ArrowLeft
} from "lucide-react";

export default function ProfileView() {
  const { currentUser, userDetails, loading } = useAuth();
  const navigate = useNavigate();

  const [treeCount, setTreeCount] = useState(null);
  const [loadingTrees, setLoadingTrees] = useState(true);

  // --- Logic remains the same ---
  useEffect(() => {
    if (!loading && currentUser) {
      (async () => {
        try {
          setLoadingTrees(true);
          const q = query(collection(db, "Trees"), where("ownerId", "==", currentUser.uid));
          const snap = await getDocs(q);
          setTreeCount(snap.size);
        } catch (err) {
          console.error("Failed to load tree count:", err);
          setTreeCount(0);
        } finally {
          setLoadingTrees(false);
        }
      })();
    }
  }, [currentUser, loading]);

  // --- Loading Skeleton ---
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1510] flex items-center justify-center p-6">
        <div className="max-w-3xl w-full bg-white/5 border border-white/10 rounded-3xl p-8 animate-pulse">
          <div className="h-32 bg-white/10 rounded-xl mb-12 relative">
            <div className="absolute -bottom-10 left-6 w-24 h-24 bg-white/20 rounded-full border-4 border-[#0b1510]"></div>
          </div>
          <div className="h-8 bg-white/10 w-1/3 rounded mb-4"></div>
          <div className="h-4 bg-white/10 w-1/4 rounded mb-8"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-24 bg-white/10 rounded-xl"></div>
            <div className="h-24 bg-white/10 rounded-xl"></div>
            <div className="h-24 bg-white/10 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0b1510] flex items-center justify-center text-emerald-100/70">
        <p>Please sign in to view your profile.</p>
      </div>
    );
  }

  // --- Data Prep ---
  const displayName = userDetails?.name || currentUser?.displayName || (currentUser?.email?.split?.("@")?.[0]) || "Explorer";
  const email = currentUser?.email || "";
  const uid = userDetails?.avatarSeed || currentUser.uid;
  const avatarChoice = userDetails?.avatarChoice || "adventurer";
  const avatarUrl = userDetails?.avatarUrl || null;
  const bio = userDetails?.bio || "No bio added yet.";
  const phone = userDetails?.phone || "Not provided";
  const createdAt = userDetails?.createdAt 
    ? (userDetails.createdAt.seconds ? new Date(userDetails.createdAt.seconds * 1000) : new Date(userDetails.createdAt)) 
    : null;

  return (
    <div className="min-h-screen bg-[#0b1510] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a2e24] to-[#0b1510] pb-20">

      {/* Profile Menu */}
      <div className="absolute top-24 right-4 sm:right-6 z-50">
        <ProfileMenu />
      </div>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto pt-24 px-4 sm:px-6">
        <div>
          <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-emerald-100/60 hover:text-white mb-6 transition-colors group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to home</span>
          </button>
        </div>
        {/* Profile Card */}
        <div className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          
          {/* Decorative Header Banner */}
          <div className="h-40 bg-gradient-to-r from-emerald-900 via-emerald-800 to-[#0b1510] relative">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          </div>

          <div className="px-6 pb-8 sm:px-10">
            {/* Header Section with Avatar overlapping banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end -mt-12 mb-6 gap-6">
              
              {/* Avatar Wrapper */}
              <div className="relative group">
                <div className="rounded-full p-1.5 bg-[#0b1510] shadow-xl">
                    <Avatar 
                      uid={uid} 
                      avatarUrl={avatarUrl} 
                      avatarChoice={avatarChoice} 
                      size={120} 
                      alt={displayName} 
                    />
                </div>
              </div>

              {/* Name & Basic Info */}
              <div className="flex-1 min-w-0 pt-2 sm:pt-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight truncate">{displayName}</h1>
                    <div className="flex items-center gap-2 text-emerald-200/60 text-sm mt-1">
                      <Mail size={14} />
                      <span>{email}</span>
                    </div>
                    {createdAt && (
                      <div className="flex items-center gap-2 text-emerald-200/40 text-xs mt-1">
                        <Calendar size={12} />
                        <span>Joined {createdAt.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Edit Button (Desktop) */}
                  <button 
                    onClick={() => navigate("/profile/edit")}
                    className="hidden sm:flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-emerald-900/20"
                  >
                    <Edit3 size={16} />
                    <span>Edit Profile</span>
                  </button>
                </div>
              </div>
            </div>

            <hr className="border-white/5 mb-8" />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <StatCard 
                icon={<Trees className="text-emerald-400" />} 
                value={loadingTrees ? "..." : treeCount} 
                label="My Trees" 
              />
              <StatCard 
                icon={<Heart className="text-rose-400" />} 
                value="0" 
                label="Adoptions" 
              />
              <StatCard 
                icon={<Activity className="text-amber-400" />} 
                value="—" 
                label="Recent Activity" 
              />
            </div>

            {/* Detailed Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Bio Column */}
              <div className="md:col-span-2 space-y-4">
                <h3 className="text-emerald-100/90 font-semibold flex items-center gap-2">
                  <User size={18} />
                  About
                </h3>
                <div className="p-5 bg-black/20 border border-white/5 rounded-2xl text-emerald-100/70 leading-relaxed text-sm">
                  {bio}
                </div>
              </div>

              {/* Contact/Details Column */}
              <div className="space-y-4">
                <h3 className="text-emerald-100/90 font-semibold flex items-center gap-2">
                  <Phone size={18} />
                  Contact
                </h3>
                <div className="p-5 bg-black/20 border border-white/5 rounded-2xl space-y-3">
                  <div>
                    <div className="text-xs text-emerald-200/40 uppercase tracking-wider font-bold mb-1">Phone</div>
                    <div className="text-emerald-100/80 text-sm font-mono">{phone}</div>
                  </div>
                  <div className="pt-2 border-t border-white/5">
                    <div className="text-xs text-emerald-200/40 uppercase tracking-wider font-bold mb-1">Account ID</div>
                    <div className="text-emerald-100/80 text-xs font-mono truncate opacity-50">{currentUser.uid}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Only Edit Button (Floating) */}
            <button 
               onClick={() => navigate("/profile/edit")}
               className="sm:hidden fixed bottom-6 right-6 h-14 w-14 bg-emerald-600 text-white rounded-full shadow-2xl flex items-center justify-center z-50 hover:scale-105 transition-transform"
            >
              <Edit3 size={24} />
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-component for clean repetitive markup
function StatCard({ icon, value, label }) {
  return (
    <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center gap-4 transition hover:bg-white/10">
      <div className="p-3 bg-white/5 rounded-xl">
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold text-white leading-none">{value}</div>
        <div className="text-xs text-emerald-200/50 mt-1 font-medium uppercase tracking-wide">{label}</div>
      </div>
    </div>
  );
}