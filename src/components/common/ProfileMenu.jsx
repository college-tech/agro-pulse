// src/components/common/ProfileMenu.jsx
import React, { useState, useRef, useEffect } from 'react';
import Avatar from './Avatar';
import { useAuth } from '../../contexts/AuthContext'; 
import { useNavigate } from 'react-router-dom';

export default function ProfileMenu() {
  const { isLoggedIn, logout, currentUser, userDetails } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // close on outside click
  useEffect(() => {
    function onDocClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  if (!isLoggedIn) return null;

  // Placeholder for display name and avatar, since no user details
  const displayName = userDetails?.displayName || 'User';
  const avatarChoice = userDetails?.avatarChoice || 'adventurer';

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((s) => !s)}
        aria-haspopup="true"
        aria-expanded={open}
        className="focus:outline-none"
      >
        <Avatar uid={currentUser?.uid || 'default'} avatarUrl={avatarUrl} avatarChoice={avatarChoice} size={40} alt={displayName} />
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#12221b] rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50"
          role="menu"
        >
          <div className="py-2 px-3">
            <div className="flex items-center gap-3 pb-2 border-b border-gray-100 dark:border-gray-700">
              <Avatar uid={currentUser?.uid || 'default'} avatarChoice={avatarChoice} size={48} alt={displayName} />
              <div>
                <div className="font-medium text-sm">{displayName}</div>
                <div className="text-xs text-gray-500">{currentUser.email}</div>
              </div>
            </div>

            <ul className="mt-3 space-y-1">
              <li>
                <button
                  onClick={() => { setOpen(false); navigate('/profile'); }}
                  className="w-full text-left px-2 py-2 text-sm hover:bg-gray-50 dark:hover:bg-[#123226] rounded"
                >
                  View Profile
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setOpen(false); navigate('/profile/edit'); }}
                  className="w-full text-left px-2 py-2 text-sm hover:bg-gray-50 dark:hover:bg-[#123226] rounded"
                >
                  Edit Profile
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setOpen(false); navigate('/dashboard'); }}
                  className="w-full text-left px-2 py-2 text-sm hover:bg-gray-50 dark:hover:bg-[#123226] rounded"
                >
                  Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setOpen(false); navigate('/profile/security'); }}
                  className="w-full text-left px-2 py-2 text-sm hover:bg-gray-50 dark:hover:bg-[#123226] rounded"
                >
                  Account Security
                </button>
              </li>
            </ul>

            <div className="mt-3 border-t border-gray-100 dark:border-gray-700 pt-2">
              <button
                onClick={async () => {
                  try {
                    await logout();
                    navigate('/home'); // or login page
                  } catch (err) {
                    console.error('Sign out failed', err);
                  }
                }}
                className="w-full flex items-center gap-2 px-2 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7" />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
