// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, onSnapshot, setDoc, serverTimestamp,getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig'; 

const AuthContext = createContext();

export const useAuth = () => {
  const c = useContext(AuthContext);
  if (!c) throw new Error('useAuth must be used within AuthProvider');
  return c;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);   // firebase auth user
  const [userDetails, setUserDetails] = useState(null);   // Firestore UsersDetail/{uid} doc
  const [loading, setLoading] = useState(true);
  const userDocUnsubRef = useRef(null);

  useEffect(() => {
    // Subscribe to auth changes
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
    setCurrentUser(user);

    // 1. Clean up existing listeners
    if (userDocUnsubRef.current) {
      userDocUnsubRef.current();
      userDocUnsubRef.current = null;
    }

    if (user) {
      // 2. Try checking the regular Users collection first
      const userRef = doc(db, 'UsersDetail', user.uid);
      const adminRef = doc(db, 'AdminUsers', user.uid);

      const unsub = onSnapshot(userRef, async (docSnap) => {
        if (docSnap.exists()) {
          // FOUND IN USERS
          setUserDetails({ ...docSnap.data(), role: 'user' });
          setLoading(false);
        } else {
          // NOT IN USERS -> Try Admin collection
          try {
            const adminSnap = await getDoc(adminRef);
            if (adminSnap.exists()) {
              // FOUND IN ADMINS
              setUserDetails({ ...adminSnap.data() }); // Assuming role is already inside AdminUsers doc
              setLoading(false);
            } else {
              // NOT FOUND ANYWHERE
              setUserDetails(null);
              setLoading(false);
            }
          } catch (err) {
            console.error("Error fetching admin doc:", err);
            setLoading(false);
          }
        }
      });
      userDocUnsubRef.current = unsub;
    } else {
      setUserDetails(null);
      setLoading(false);
    }
  });

    return () => {
      unsubAuth();
      if (userDocUnsubRef.current) userDocUnsubRef.current();
    };
  }, []);

  // Convenience: sign in 
  const login = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  };

  // Convenience: signup helper 
  const signup = async (email, password, displayName = null) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const user = cred.user;

    // set displayName in auth profile 
    if (displayName) {
      await updateProfile(user, { displayName });
    }

    // create UsersDetail document and await completion so UI sees it immediately
    const userDocRef = doc(db, 'UsersDetail', user.uid);
    await setDoc(userDocRef, {
      displayName: displayName || null,
      email: user.email,
      role: 'user',
      createdAt: serverTimestamp(),
      avatarChoice: 'adventurer'
    });

    return user;
  };

  const logout = async () => {
    // clear local state immediately (optional but useful)
    setUserDetails(null);
    setCurrentUser(null);
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userDetails,
        loading,
        login,
        signup,   // optional helper
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
