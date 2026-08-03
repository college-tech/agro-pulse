// src/components/profile/DeleteAccountSection.jsx 
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { Trash2, AlertTriangle, Loader2, Lock, X } from 'lucide-react';
import ReauthenticationWrapper from '../auth/ReauthenticationWrapper';

export default function DeleteAccountSection() {
    const { currentUser } = useAuth();
    // Stage management: Start collapsed
    const [isExpanded, setIsExpanded] = useState(false); 
    
    // Security/Process State
    const [needsReauth, setNeedsReauth] = useState(true);
    const [busy, setBusy] = useState(false);

    if (!currentUser) return null;

    const handleDelete = async () => {
        // Final software confirmation layer
        if (!window.confirm("FINAL WARNING: This action is permanent. Are you sure you want to delete your account?")) {
            return;
        }

        setBusy(true);
        try {
            await currentUser.delete(); 
            toast.success('Your account has been successfully deleted.');
        } catch (err) {
            console.error('Account deletion failed:', err);
            
            if (err.code === 'auth/requires-recent-login') {
                 toast.error('Security Check Failed: Please re-verify your identity.');
                 setNeedsReauth(true); 
            } else {
                 toast.error(err.message || 'Failed to delete account.');
            }
        } finally {
            setBusy(false);
        }
    };
    
    // Renders the full security prompt (Stage 2)
    const renderExpandedContent = () => {
        return (
            <div className="bg-white/5 border border-red-900/50 p-6 rounded-xl space-y-4">
                <div className="flex justify-between items-center">
                    <h4 className="text-xl font-bold text-red-400 flex items-center gap-2">
                        <AlertTriangle size={20} />
                        Confirm Account Deletion
                    </h4>
                    <button 
                        onClick={() => setIsExpanded(false)}
                        className="text-red-300 hover:text-white transition-colors p-1 rounded-full"
                        aria-label="Cancel deletion"
                    >
                        <X size={20} />
                    </button>
                </div>

                <p className="text-sm text-red-100/70">
                    This is a highly sensitive and **permanent** action. All your data, including trees, adoptions, and profile information, will be lost.
                </p>

                {/* Security Check / Final Button */}
                {needsReauth ? (
                    <ReauthenticationWrapper onReauthenticated={() => setNeedsReauth(false)}>
                        <p className="text-sm text-red-100/70 mb-4">
                            <Lock size={16} className="inline mr-1 text-red-400" />
                            Please re-verify your identity below to unlock the delete option.
                        </p>
                    </ReauthenticationWrapper>
                ) : (
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-4 border-t border-red-900/50">
                        <p className="text-base font-semibold text-red-400">
                            Ready to proceed?
                        </p>
                        <button
                            onClick={handleDelete}
                            disabled={busy}
                            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg shadow-lg shadow-red-900/40 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                            {busy ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <Trash2 size={16} />
                            )}
                            {busy ? 'Processing...' : 'Permanently Delete Account'}
                        </button>
                    </div>
                )}
            </div>
        );
    };

    // Renders the single-line button (Stage 1)
    if (!isExpanded) {
        return (
            <div className="pt-4 border-t border-white/5">
                <button
                    onClick={() => {
                        setIsExpanded(true);
                        // Resetting reauth flag just in case user fails and comes back
                        setNeedsReauth(true); 
                    }}
                    className="w-full flex items-center justify-between text-red-400 hover:text-red-300 transition-colors p-2 rounded-lg hover:bg-white/5"
                >
                    <span className="flex items-center gap-2 font-medium">
                        <Trash2 size={18} />
                        Delete Account and Data
                    </span>
                    <span className="text-xs text-red-500/70">Proceed with Caution &rarr;</span>
                </button>
            </div>
        );
    }
    
    // Renders the full expanded view when isExpanded is true
    return (
        <div className="mt-4">
            {renderExpandedContent()}
        </div>
    );
}