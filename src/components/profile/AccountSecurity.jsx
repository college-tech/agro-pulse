// src/components/profile/AccountSecurity.jsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Mail, Key, UserPlus, Check } from 'lucide-react';
import ChangePasswordForm from './ChangePasswordForm'; 
import ChangeEmailForm from './ChangeEmailForm'; 
import LinkPasswordForm from './LinkPasswordForm'; 
import DeleteAccountSection from './DeleteAccountSection';

const securityTabs = {
    CREDENTIALS: 'Credentials',
    EMAIL: 'Email',
};

export default function AccountSecurity() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [refreshFlag, setRefreshFlag] = useState(0); 
    const [activeTab, setActiveTab] = useState(securityTabs.CREDENTIALS); 

    if (!currentUser) return null;
    
    // Logic to determine user's security status
    const hasPassword = currentUser.providerData.some((p) => p.providerId === 'password');
    const primaryProvider = currentUser.providerData[0]?.providerId || 'Unknown';
    const isSocialOnly = !hasPassword;

    const handlePasswordCreation = () => {
        // Force component re-render to switch from LinkPasswordForm to ChangePasswordForm
        setRefreshFlag(prev => prev + 1); 
    };

    // Conditional rendering based on active tab
    const renderContent = () => {
        if (activeTab === securityTabs.CREDENTIALS) {
            // Priority: Show the Link form if needed, otherwise show the Change form
            if (isSocialOnly) {
                // Pass the current user's email as a default if available
                return <LinkPasswordForm onPasswordCreated={handlePasswordCreation} defaultEmail={currentUser.email} />;
            } else {
                return <ChangePasswordForm />;
            }
        }
        
        if (activeTab === securityTabs.EMAIL) {
            return <ChangeEmailForm />;
        }
        return null;
    };

    return (
        <div key={refreshFlag} className="min-h-screen bg-[#0b1510] py-12 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto mt-10">
                
                {/* Back Button */}
                <button 
                    onClick={() => navigate("/profile")}
                    className="flex items-center gap-2 text-emerald-100/50 hover:text-emerald-300 font-medium transition-colors group mb-6"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Back to Profile</span>
                </button>

                {/* Main Floating Card Container */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl space-y-8">
                    
                    {/* Header */}
                    <header className="border-b border-white/10 pb-4">
                        <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
                            <Shield className="text-emerald-400" size={28} />
                            Account Management
                        </h2>
                        <p className="text-sm text-emerald-100/60 mt-1">Manage your login credentials and recovery options.</p>
                    </header>
                    
                    {/* 1. Status Summary */}
                    <div className={`p-4 rounded-xl flex justify-between items-center ${isSocialOnly ? 'bg-yellow-900/10 border border-yellow-500/20' : 'bg-emerald-900/10 border border-emerald-500/20'}`}>
                        <div className="flex flex-col">
                            <p className="text-sm text-emerald-100/70">
                                **Primary Login:** <span className="font-semibold text-white ml-1">{primaryProvider === 'password' ? 'Email/Password' : primaryProvider}</span>
                            </p>
                            {isSocialOnly ? (
                                <p className="text-xs text-yellow-400 flex items-center gap-1 mt-1 font-medium">
                                    <UserPlus size={14} /> Action Required: Set a password for full account recovery.
                                </p>
                            ) : (
                                <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                                    <Check size={14} /> Password backup linked.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* 2. Pill Navigation / Tabs */}
                    <div className="flex space-x-3 p-1 rounded-xl bg-white/5 border border-white/10 w-fit">
                        {Object.entries(securityTabs).map(([key, label]) => (
                            <button
                                key={key}
                                onClick={() => setActiveTab(label)}
                                className={`
                                    px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-2
                                    ${activeTab === label 
                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/50' 
                                        : 'text-emerald-100/80 hover:bg-white/10'
                                    }
                                `}
                            >
                                {label === securityTabs.CREDENTIALS && <Lock size={16} />}
                                {label === securityTabs.EMAIL && <Mail size={16} />}
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* 3. Content Area - Houses the active form */}
                    <div className="p-6 rounded-xl border border-white/10 shadow-lg">
                        {renderContent()}
                    </div>
                    {/* -------------------- DANGER ZONE -------------------- */}
                    <div className="pt-4 border-t border-red-900/50"> 
                        <DeleteAccountSection />
                    </div>
                    {/* ----------------------------------------------------- */}
                </div>
            </div>
        </div>
    );
}